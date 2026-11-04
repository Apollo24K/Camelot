import { collectButtonUpdates } from "../Modules/buttonInteractions";
import { EmbedBuilder, ButtonBuilder, ButtonInteraction, ComponentType, ButtonStyle, MessageFlags, ContainerBuilder, AttachmentBuilder, TextDisplayBuilder, ChatInputCommandInteraction, Message, InteractionResponse } from "discord.js";
import { createCanvas, Image, loadImage } from "@napi-rs/canvas";
import charInfo from "../Modules/chars";
import { splitTitle, rarity, getRefinement, rarityColor } from "../Modules/functions";
import { CompactUserSchema, SlashCommand } from "../types";
import { withTransaction } from "../postgres";
import LRUCache from "../Modules/LRUCache";
import { ExBanner, ExBannerKind, ExPityColumn, ExGuaranteeColumn, exBanners, EX_RATE, SS_RATE, S_RATE, HARD_PITY, rollExBanner } from "../Modules/banners";

const EX_EMOJI = '<a:EXTRA:1138530846144462968>';
const COLLECTOR_TIME = 60000;
const POOL_PER_PAGE = 10;
const EX_PULL_TIMEOUT = 30000;

// A user may only have one pull in flight at a time, even across separate /ex messages.
const exPulling = new Set<string>();
const droppedPulls = new WeakSet<ButtonInteraction>();

const EX_COLOR = 0x2aad9d;
const thumbnail = "https://i.ibb.co/5xwLj3xr/c.png";

const GRID_FILE = "grid.webp";
const FEATURED_FILE = "featured.webp";
const BADGE_FILE = "badge.webp";
// Bound the decoded-image cache; `null` is a negative entry so failed loads aren't retried forever.
const loadedImages = new LRUCache<string, Image | null>(200);

// Animated GIF EX art is multi-megabyte and renders poorly/slowly in Discord's media gallery, so
// those (and only those) are rasterized to a static WebP. Plain PNG art is served as-is.
const needsStatic = (url: string) => /\.gif($|\?)/i.test(url);

const staticImageCache = new LRUCache<string, Buffer | null>(32);
// `null` caches a failed composite so an unrenderable featured set isn't rebuilt on every view.
const featuredImageCache = new LRUCache<string, Buffer | null>(16);
const inflightRenders = new Map<string, Promise<Buffer | null>>();
const inflightFeatured = new Map<string, Promise<AttachmentBuilder | null>>();

const loadCachedImage = async (url: string): Promise<Image | null> => {
    const cached = loadedImages.get(url);
    if (cached !== undefined) return cached;
    try {
        const image = await loadImage(url);
        loadedImages.set(url, image);
        return image;
    } catch {
        loadedImages.set(url, null);
        return null;
    };
};

/**
 * Rasterizes an image to a static WebP (first frame only). Concurrent callers for the same URL share
 * a single render, and both the result and failures are cached so a URL is only ever fetched once.
 */
const renderStaticImage = (url: string): Promise<Buffer | null> => {
    const cached = staticImageCache.get(url);
    if (cached !== undefined) return Promise.resolve(cached);
    const existing = inflightRenders.get(url);
    if (existing) return existing;

    const pending = (async () => {
        try {
            const image = await loadCachedImage(url);
            if (!image) {
                staticImageCache.set(url, null);
                return null;
            };
            const canvas = createCanvas(image.width, image.height);
            canvas.getContext("2d").drawImage(image, 0, 0);
            const buffer = canvas.toBuffer("image/webp");
            staticImageCache.set(url, buffer);
            return buffer;
        } catch {
            staticImageCache.set(url, null);
            return null;
        } finally {
            inflightRenders.delete(url);
        };
    })();

    inflightRenders.set(url, pending);
    return pending;
};

/** Composites the on-banner art into one static WebP so heavy GIFs never reach the media gallery. */
const getFeaturedImage = (featured: charInfo[]): Promise<AttachmentBuilder | null> => {
    const shown = featured.slice(0, 10);
    const key = shown.map((c) => c.id).join(",");

    const cached = featuredImageCache.get(key);
    if (cached !== undefined) return Promise.resolve(cached ? new AttachmentBuilder(cached, { name: FEATURED_FILE }) : null);
    const existing = inflightFeatured.get(key);
    if (existing) return existing;

    const pending = (async () => {
        try {
            const buffer = await compositeCharGrid(shown, { columns: Math.min(5, shown.length) });
            featuredImageCache.set(key, buffer);
            return new AttachmentBuilder(buffer, { name: FEATURED_FILE });
        } catch {
            featuredImageCache.set(key, null);
            return null;
        } finally {
            inflightFeatured.delete(key);
        };
    })();

    inflightFeatured.set(key, pending);
    return pending;
};

type ExPullResult = {
    expulls: number;
    /** Null when the pull was rejected for an insufficient balance; the rest is still a fresh snapshot. */
    pulled: charInfo[] | null;
    pity: Record<ExPityColumn, number>;
    guaranteed: Record<ExGuaranteeColumn, boolean>;
};

/**
 * Atomically performs `count` pulls and persists the outcome. The row is locked before the rolls,
 * so concurrent pulls can neither spend the same balance nor clobber each other's pity/guarantee.
 * Returns undefined when the user has no row; an insufficient balance still returns the current
 * snapshot so the caller can refresh the panel before reporting the shortfall.
 */
const applyExPull = async (userId: string, banner: ExBanner, count: number): Promise<ExPullResult | undefined> => withTransaction(async (client) => {
    const { rows: [user] } = await client.query<Pick<CompactUserSchema, "expulls" | ExPityColumn | ExGuaranteeColumn>>(
        `SELECT expulls, expity_standard, expity_rateup, expity_limited, exguarantee_rateup, exguarantee_limited FROM users WHERE id = $1 FOR UPDATE`,
        [userId],
    );
    if (!user) return undefined;

    const pityState: Record<ExPityColumn, number> = {
        expity_standard: user.expity_standard,
        expity_rateup: user.expity_rateup,
        expity_limited: user.expity_limited,
    };

    const guaranteedState: Record<ExGuaranteeColumn, boolean> = {
        exguarantee_rateup: user.exguarantee_rateup,
        exguarantee_limited: user.exguarantee_limited,
    };

    if (user.expulls < count) return { expulls: user.expulls, pulled: null, pity: pityState, guaranteed: guaranteedState };

    const pityColumn = banner.pityColumn;
    const guaranteeColumn = banner.guaranteeColumn;

    let pity = user[pityColumn];
    let guaranteed = guaranteeColumn ? user[guaranteeColumn] : false;
    const pulled: charInfo[] = [];

    for (let i = 0; i < count; i++) {
        const { char, pity: newPity, guaranteed: newGuaranteed } = rollExBanner(banner, pity, guaranteed);
        pulled.push(char);
        pity = newPity;
        guaranteed = newGuaranteed;
    };

    const charIds = pulled.map((c) => c.id);
    const setClauses = [`expulls = expulls - $2`, `${pityColumn} = $3`, `chars = COALESCE(chars, '{}') || $4::int[]`];
    const values: any[] = [userId, count, pity, charIds];
    if (guaranteeColumn) {
        setClauses.push(`${guaranteeColumn} = $5`);
        values.push(guaranteed);
    };

    const { rows: [updated] } = await client.query<{ expulls: number; }>(`UPDATE users SET ${setClauses.join(', ')} WHERE id = $1 RETURNING expulls`, values);

    pityState[pityColumn] = pity;
    if (guaranteeColumn) guaranteedState[guaranteeColumn] = guaranteed;

    return { expulls: updated.expulls, pulled, pity: pityState, guaranteed: guaranteedState };
});

/**
 * Composites character art into a uniform grid so mixed aspect ratios (e.g. the few
 * square EX images) don't make the media gallery rows uneven. Each tile is cover-cropped.
 */
async function compositeCharGrid(chars: charInfo[], { columns = 5 }: { columns?: number; } = {}): Promise<Buffer> {
    const tileW = 225, tileH = 350, gap = 20;
    const cols = Math.max(1, Math.min(columns, chars.length));
    const rows = Math.max(1, Math.ceil(chars.length / cols));
    const canvas = createCanvas(cols * tileW + (cols + 1) * gap, rows * tileH + (rows + 1) * gap);
    const ctx = canvas.getContext("2d");

    // Load every tile up front so a cold page fetches/decodes in parallel instead of one at a time.
    const images = await Promise.all(chars.map((char) => loadCachedImage(char.image)));

    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        const x = gap + (i % cols) * (tileW + gap);
        const y = gap + Math.floor(i / cols) * (tileH + gap);

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, tileW, tileH);
        ctx.clip();
        const img = images[i];
        if (img) {
            const scale = Math.max(tileW / img.width, tileH / img.height);
            const dw = img.width * scale, dh = img.height * scale;
            ctx.drawImage(img, x + (tileW - dw) / 2, y + (tileH - dh) / 2, dw, dh);
        } else {
            ctx.fillStyle = "#2b2d31";
            ctx.fillRect(x, y, tileW, tileH);
        };
        ctx.restore();

        ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        ctx.fillRect(x, y + tileH - 46, tileW, 46);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 22px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(char.name, x + tileW / 2, y + tileH - 23, tileW - 12);
    };

    return canvas.toBuffer("image/webp");
};

const BANNER_COLORS: Record<ExBannerKind, number> = {
    standard: 0x2aad9d,
    rateup: 0xf5c542,
    limited: 0xe0559b,
};

const pct = (n: number) => Math.round(n * 1000) / 10;

const progressBar = (value: number, max: number, size = 16) => {
    const filled = Math.max(0, Math.min(size, Math.round((value / max) * size)));
    return "▰".repeat(filled) + "▱".repeat(size - filled);
};

const names = (chars: charInfo[]) => chars.map((e) => `**${e.name}**`).join(", ");
const namesPreview = (chars: charInfo[], limit = 5) => chars.length <= limit
    ? names(chars)
    : `${names(chars.slice(0, limit))} · +${chars.length - limit} more`;

const ratesLine = () => `**Rates** ${EX_EMOJI} **${pct(EX_RATE)}%** · <:SSTier:869316489931546644> **${pct(SS_RATE)}%** · <:STier:869316518675095552> **${pct(S_RATE)}%**`;

const featuredRateLine = (banner: ExBanner) => {
    if (!banner.featured.length) return `-# ${banner.exPool.length} characters in the pool`;
    const rate = pct(banner.featuredRate.reduce((a, b) => a + b, 0));
    return `-# **${rate}%** of ${EX_EMOJI} pulls give ${banner.featured.length === 1 ? "the featured" : "one of the featured"} character`;
};

const guaranteeLine = (banner: ExBanner, stats: CompactUserSchema, disabled: boolean) => {
    if (disabled || !banner.guaranteeColumn || !banner.featured.length) return null;
    if (!stats[banner.guaranteeColumn]) return null;
    return `⭐ Your next ${EX_EMOJI} is guaranteed to be ${banner.featured.length === 1 ? "the" : "one of the"} featured EX!`;
};

/** Banner end rendered as a Discord relative timestamp, so each viewer sees it in their own timezone. */
const expiryLine = (banner: ExBanner) => banner.expiresAt
    ? `-# Ends <t:${Math.floor(banner.expiresAt / 1000)}:R>`
    : null;

function displayMy(thisChar: charInfo, inv: CompactUserSchema, interaction: ChatInputCommandInteraction) {
    const dupes = inv.chars.filter((e) => e === thisChar.id).length;

    const Embed = new EmbedBuilder()
        .setColor(rarityColor(thisChar.rarity))
        .setImage(thisChar.image)
        .setThumbnail(rarity(thisChar.rarity))
        .setDescription(`**${thisChar.name}**\n${splitTitle(thisChar.anime)}\n\n**Ref**. ${getRefinement(inv.char_ref[thisChar.id])}`)
        .setFooter({ text: `You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of this`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
    if (interaction.channel?.isSendable()) interaction.channel.send({ embeds: [Embed] });
};

const revealSingle = (char: charInfo, inv: CompactUserSchema, interaction: ChatInputCommandInteraction) => {
    if (char.name === "Padoru EX") {
        if (interaction.channel?.isSendable()) interaction.channel.send("Hashire sori yo");
        setTimeout(() => {
            if (interaction.channel?.isSendable()) interaction.channel.send("Kaze no you ni");
        }, 1800);
        setTimeout(() => {
            if (interaction.channel?.isSendable()) interaction.channel.send("Tsukimihara wo");
        }, 3600);
        setTimeout(() => {
            if (interaction.channel?.isSendable()) interaction.channel.send("PADORU PADORUUU!! <:padoru:746835471119810624>");
        }, 5400);
        setTimeout(() => {
            displayMy(char, inv, interaction);
        }, 6000);
    } else if (char.name === "Urashima EX") {
        if (interaction.channel?.isSendable()) interaction.channel.send("✨ The stars are calling...");
        setTimeout(() => {
            displayMy(char, inv, interaction);
        }, 2000);
    } else {
        displayMy(char, inv, interaction);
    };
};

const revealMulti = (chars: charInfo[], interaction: ChatInputCommandInteraction) => {
    const channel = interaction.channel;
    if (!channel?.isSendable()) return;

    const best = [...chars].sort((a, b) => b.rarityValue - a.rarityValue)[0];
    const unique = [...new Map(chars.map((c) => [c.id, c])).values()].sort((a, b) => b.rarityValue - a.rarityValue);
    const counts = new Map<number, number>();
    chars.forEach((c) => counts.set(c.id, (counts.get(c.id) ?? 0) + 1));
    const exCount = chars.filter((c) => c.rarity === "EX").length;

    const lines = unique
        .map((c) => `${c.rarityEmoji} **${c.name}**${(counts.get(c.id) ?? 1) > 1 ? ` ×${counts.get(c.id)}` : ""}`)
        .join("\n");

    // The result is text-only by design: compositing a grid image made 10x pulls noticeably slower.
    const container = new ContainerBuilder()
        .setAccentColor(rarityColor(best.rarity))
        .addSectionComponents(section => section
            .addTextDisplayComponents(
                text => text.setContent(`## Pulled ${chars.length} characters`),
                text => text.setContent(exCount ? `-# ${exCount} ${EX_EMOJI} pulled — congrats!` : `-# No ${EX_EMOJI} this time.`),
            )
            .setThumbnailAccessory(thumb => thumb.setURL(best.rarityImageSquare))
        )
        .addTextDisplayComponents(text => text.setContent(lines));

    channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
};

const selectorButtons = (active: ExBanner | null, disabled: boolean) => {
    const style = (kind: ExBannerKind) => active?.kind === kind ? ButtonStyle.Primary : ButtonStyle.Secondary;
    return [
        new ButtonBuilder()
            .setCustomId('ex_standard')
            .setLabel('Standard')
            .setEmoji('🎯')
            .setStyle(style('standard'))
            .setDisabled(disabled || !exBanners.standard.available),
        new ButtonBuilder()
            .setCustomId('ex_rateup')
            .setLabel('Rate-up')
            .setEmoji('⭐')
            .setStyle(style('rateup'))
            .setDisabled(disabled || !exBanners.rateup.available),
        new ButtonBuilder()
            .setCustomId('ex_limited')
            .setLabel('Event')
            .setEmoji('🎉')
            .setStyle(style('limited'))
            .setDisabled(disabled || !exBanners.limited.available),
    ];
};

const homeContainer = (stats: CompactUserSchema, disabled: boolean) => new ContainerBuilder()
    .setAccentColor(EX_COLOR)
    .addSectionComponents(section => section
        .addTextDisplayComponents(
            text => text.setContent('## EX Banners'),
            text => text.setContent(`-# Pick a banner to see its details, then spend your ${EX_EMOJI} pulls`),
        )
        .setThumbnailAccessory(thumb => thumb.setURL(thumbnail))
    )
    .addSeparatorComponents(separator => separator)
    .addTextDisplayComponents(text => text.setContent(
        `**Your EX pulls:** ${stats.expulls} ${EX_EMOJI}\n` +
        `-# Standard **${stats.expity_standard}**/${HARD_PITY} · Rate-up **${stats.expity_rateup}**/${HARD_PITY} · Event **${stats.expity_limited}**/${HARD_PITY}`
    ))
    .addSeparatorComponents(separator => separator)
    .addActionRowComponents(row => row.addComponents(...selectorButtons(null, disabled)));

const bannerContainer = async (state: ExViewState, banner: ExBanner, stats: CompactUserSchema, disabled: boolean): Promise<{ container: ContainerBuilder; files: AttachmentBuilder[]; newFiles: PendingFile[]; keep: { id: string; }[]; }> => {
    const pity = stats[banner.pityColumn];
    const remaining = Math.max(0, HARD_PITY - pity);
    const featured = banner.featured;
    const art = (featured[0] ?? banner.exPool[0])?.rarityImageSquare ?? thumbnail;
    const guarantee = guaranteeLine(banner, stats, disabled);
    const expiry = expiryLine(banner);

    const files: AttachmentBuilder[] = [];
    const newFiles: PendingFile[] = [];
    // Attachments referenced by their existing CDN url must be named in the edit payload, otherwise
    // discord.js removes every attachment the edit does not re-upload.
    const keep: { id: string; }[] = [];

    let artUrl = art;
    if (!disabled && needsStatic(art)) {
        // Reuse the CDN URL of a badge already uploaded to this panel instead of re-uploading it.
        const cached = state.attachments.get(BADGE_FILE);
        if (cached?.key === art) {
            artUrl = cached.url;
            keep.push({ id: cached.id });
        } else {
            const badge = await renderStaticImage(art);
            if (badge) {
                files.push(new AttachmentBuilder(badge, { name: BADGE_FILE }));
                artUrl = `attachment://${BADGE_FILE}`;
                newFiles.push({ name: BADGE_FILE, key: art });
            };
        };
    };

    const container = new ContainerBuilder()
        .setAccentColor(BANNER_COLORS[banner.kind])
        .addSectionComponents(section => section
            .addTextDisplayComponents(
                text => text.setContent(`## ${banner.name}`),
                text => text.setContent(featured.length
                    ? `### Featuring ${namesPreview(featured, 3)}`
                    : `### Featuring every standard-pool EX`),
            )
            .setThumbnailAccessory(thumb => thumb.setURL(artUrl))
        );

    // Featured art (rate-up / event banners only; the standard pool is browsable via its own view).
    // Heavy GIF art is composited to a static image; plain PNG art is linked directly to avoid needless work.
    // The expired view skips this so ending a session never triggers a fresh render.
    if (featured.length && !disabled) {
        const linkArt = () => container.addMediaGalleryComponents(media => {
            featured.slice(0, 10).forEach((c) => media.addItems(item => item.setURL(c.image).setDescription(c.name)));
            return media;
        });

        const linkFeatured = (url: string) => container.addMediaGalleryComponents(media => {
            media.addItems(item => item.setURL(url));
            return media;
        });

        if (featured.some((c) => needsStatic(c.image))) {
            const featuredKey = featured.map((c) => c.id).join(",");
            const cached = state.attachments.get(FEATURED_FILE);
            if (cached?.key === featuredKey) {
                // Reuse the already-uploaded composite instead of re-uploading it.
                linkFeatured(cached.url);
                keep.push({ id: cached.id });
            } else {
                const featuredImage = await getFeaturedImage(featured);
                if (featuredImage) {
                    files.push(featuredImage);
                    linkFeatured(`attachment://${FEATURED_FILE}`);
                    newFiles.push({ name: FEATURED_FILE, key: featuredKey });
                } else {
                    // Compositing failed; fall back to linking the source art directly.
                    linkArt();
                };
            };
        } else {
            linkArt();
        };
    };

    container
        .addSeparatorComponents(separator => separator)
        .addTextDisplayComponents(text => text.setContent(
            `${EX_EMOJI} Pity **${pity}**/${HARD_PITY} · **${remaining}** to hard pity\n` +
            `-# ${progressBar(pity, HARD_PITY)}`
        ));
    if (guarantee) container.addTextDisplayComponents(text => text.setContent(guarantee));

    container
        .addActionRowComponents(row => row.addComponents(
            new ButtonBuilder()
                .setCustomId('ex_pull')
                .setLabel(`Pull (${stats.expulls} left)`)
                .setEmoji({ name: 'EXTRA', id: '1138530846144462968', animated: true })
                .setStyle(ButtonStyle.Success)
                .setDisabled(disabled || stats.expulls < 1),
            new ButtonBuilder()
                .setCustomId('ex_pull10')
                .setLabel('Pull x10')
                .setEmoji('🎰')
                .setStyle(ButtonStyle.Success)
                .setDisabled(disabled || stats.expulls < 10)
        ))
        .addTextDisplayComponents(
            text => text.setContent(ratesLine()),
            text => text.setContent(featuredRateLine(banner)),
            text => text.setContent(`-# ${banner.description}`),
            ...(expiry ? [(text: TextDisplayBuilder) => text.setContent(expiry)] : []),
        )
        .addSeparatorComponents(separator => separator)
        .addActionRowComponents(row => row.addComponents(...selectorButtons(banner, disabled)))
        .addActionRowComponents(row => row.addComponents(
            new ButtonBuilder()
                .setCustomId('ex_home')
                .setLabel('Overview')
                .setEmoji('🏠')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled),
            ...(banner.kind === 'standard' ? [new ButtonBuilder()
                .setCustomId('ex_pool')
                .setLabel('Browse Pool')
                .setEmoji('🔍')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled)] : [])
        ));

    return { container, files, newFiles, keep };
};

type PoolSlice = { pool: charInfo[]; items: charInfo[]; safePage: number; pages: number; };

const poolSlice = (page: number): PoolSlice => {
    const pool = exBanners.standard.exPool;
    const pages = Math.max(1, Math.ceil(pool.length / POOL_PER_PAGE));
    const safePage = ((page % pages) + pages) % pages;
    const items = pool.slice(safePage * POOL_PER_PAGE, safePage * POOL_PER_PAGE + POOL_PER_PAGE);
    return { pool, items, safePage, pages };
};

// Pool pages are deterministic, so the composited image can be reused across every navigation
// instead of being re-rasterized on each click. Keyed by the page's character ids so a change in
// pool composition is never masked by an unchanged pool length.
const poolImageCache = new LRUCache<string, Buffer>(32);

const getPoolImage = async ({ items }: PoolSlice): Promise<AttachmentBuilder> => {
    const key = items.map((c) => c.id).join(",");
    let buffer = poolImageCache.get(key);
    if (!buffer) {
        buffer = await compositeCharGrid(items, { columns: 5 });
        poolImageCache.set(key, buffer);
    };
    return new AttachmentBuilder(buffer, { name: GRID_FILE });
};

const poolContainer = (disabled: boolean, { pool, safePage, pages }: PoolSlice) => {
    const container = new ContainerBuilder()
        .setAccentColor(BANNER_COLORS.standard)
        .addSectionComponents(section => section
            .addTextDisplayComponents(
                text => text.setContent('## Standard Pool'),
                text => text.setContent(`-# Browsing **${pool.length}** characters · page **${safePage + 1}**/${pages}`),
            )
            .setThumbnailAccessory(thumb => thumb.setURL(thumbnail))
        )
        .addMediaGalleryComponents(media => {
            media.addItems(item => item.setURL(`attachment://${GRID_FILE}`));
            return media;
        })
        .addSeparatorComponents(separator => separator)
        .addActionRowComponents(row => row.addComponents(
            new ButtonBuilder()
                .setCustomId('ex_pool_prev')
                .setEmoji('⏪')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled || pages <= 1),
            new ButtonBuilder()
                .setCustomId('ex_pool_next')
                .setEmoji('⏩')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled || pages <= 1),
            new ButtonBuilder()
                .setCustomId('ex_standard')
                .setLabel('Back')
                .setEmoji('⬅️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId('ex_home')
                .setLabel('Overview')
                .setEmoji('🏠')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled)
        ));

    return container;
};

type ExView = "home" | "banner" | "pool";

// A file the current render had to upload, identified by its content so later renders can
// skip the upload and reference the already-uploaded CDN url instead.
type PendingFile = { name: string; key: string; };

interface ExViewState {
    view: ExView;
    active: ExBanner | null;
    poolPage: number;
    attachments: Map<string, { key: string; url: string; id: string; }>;
};

const buildView = async (state: ExViewState, stats: CompactUserSchema, mode: "normal" | "busy" | "expired" = "normal") => {
    const disabled = mode !== "normal";
    const files: AttachmentBuilder[] = [];
    let newFiles: PendingFile[] = [];
    let keep: { id: string; }[] = [];
    let container: ContainerBuilder;
    if (state.view === "pool") {
        const slice = poolSlice(state.poolPage);
        container = poolContainer(disabled, slice);
        // The container always points at the grid attachment, so it must ship even on the busy/expired view.
        files.push(await getPoolImage(slice));
    } else if (state.view === "banner" && state.active) {
        const built = await bannerContainer(state, state.active, stats, disabled);
        container = built.container;
        files.push(...built.files);
        newFiles = built.newFiles;
        keep = built.keep;
    } else {
        container = homeContainer(stats, disabled);
    };

    if (mode === "busy") container.addTextDisplayComponents(text => text.setContent('-# Pulling… please wait.'));
    else if (mode === "expired") container.addTextDisplayComponents(text => text.setContent('-# Session expired — run /ex again.'));
    return { components: [container], files, newFiles, keep };
};

const exportCommand: SlashCommand = {
    name: 'ex',
    async execute({ interaction, author }) {

        const stats = author.schema;
        const state: ExViewState = { view: "home", active: null, poolPage: 0, attachments: new Map() };

        // Rebuild the attachment cache from the message after every edit. Files that were re-uploaded
        // take their key from `newFiles`; kept files retain the key they were cached under. Anything
        // no longer attached is dropped, so a later render never references a removed CDN url.
        // The initial reply only exposes an InteractionResponse; its first edit will populate the cache instead.
        const remember = (msg: Message | InteractionResponse, newFiles: PendingFile[]) => {
            if (!('attachments' in msg)) return;
            const next: ExViewState["attachments"] = new Map();
            for (const att of msg.attachments.values()) {
                if (!att.name) continue;
                const uploaded = newFiles.find((file) => file.name === att.name);
                const key = uploaded?.key ?? state.attachments.get(att.name)?.key;
                if (key) next.set(att.name, { key, url: att.url, id: att.id });
            };
            state.attachments = next;
        };

        const doPull = async (count: number, btn: ButtonInteraction) => {
            const kind = state.active?.kind;
            if (!kind || state.view !== "banner") return render();

            // Re-read from the live registry so a banner that just closed can't be pulled.
            const banner = exBanners[kind];
            if (!banner.available) {
                state.active = null;
                state.view = "home";
                await render();
                return btn.followUp({ content: `The ${banner.name} is not available right now.`, flags: MessageFlags.Ephemeral });
            };

            const result = await applyExPull(interaction.user.id, banner, count);
            if (!result) {
                await render();
                return btn.followUp({
                    content: count > 1 ? `You need at least **${count}** ${EX_EMOJI} Pulls` : `You don't have any ${EX_EMOJI} Pulls left`,
                    flags: MessageFlags.Ephemeral,
                });
            };

            const { expulls, pulled, pity, guaranteed } = result;
            stats.expulls = expulls;
            stats.expity_standard = pity.expity_standard;
            stats.expity_rateup = pity.expity_rateup;
            stats.expity_limited = pity.expity_limited;
            stats.exguarantee_rateup = guaranteed.exguarantee_rateup;
            stats.exguarantee_limited = guaranteed.exguarantee_limited;
            // The row was updated outside updateUsersAndCache, so drop the stale cached copy.
            interaction.client.userCache.delete(interaction.user.id);
            // Keep the view on the live banner in case the rate-up rotated mid-session.
            state.active = banner;

            // An insufficient balance still returns a fresh snapshot, so the panel above is current
            // even when another /ex session spent the pulls first.
            if (!pulled) {
                await render();
                return btn.followUp({
                    content: count > 1 ? `You need at least **${count}** ${EX_EMOJI} Pulls` : `You don't have any ${EX_EMOJI} Pulls left`,
                    flags: MessageFlags.Ephemeral,
                });
            };

            stats.chars.push(...pulled.map((c) => c.id));

            await render();

            if (pulled.length === 1) revealSingle(pulled[0], stats, interaction);
            else revealMulti(pulled, interaction);
        };

        const initialView = await buildView(state, stats);
        const message = await interaction.reply({ components: initialView.components, files: initialView.files, flags: MessageFlags.IsComponentsV2 });
        remember(message, initialView.newFiles);

        // Re-render the panel in place, remembering any attachments this render had to upload.
        const render = async (mode: "normal" | "busy" | "expired" = "normal") => {
            const view = await buildView(state, stats, mode);
            const msg = await message.edit({ components: view.components, files: view.files, attachments: view.keep });
            remember(msg, view.newFiles);
            return msg;
        };

        const collector = message.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId.startsWith("ex_"), componentType: ComponentType.Button, time: COLLECTOR_TIME });

        collector.on('end', () => {
            exPulling.delete(interaction.user.id);
            void render("expired").catch(() => undefined);
        });

        // Drop pull clicks that arrive while this user already has a pull in flight. This must run
        // at collect time (before collectButtonUpdates queues the click), otherwise the serialized
        // queued handler would find the guard already cleared and re-run the pull.
        collector.on('collect', (btn) => {
            if (collector.ended) return;
            if (btn.customId !== "ex_pull" && btn.customId !== "ex_pull10") return;
            if (exPulling.has(interaction.user.id)) droppedPulls.add(btn);
            else exPulling.add(interaction.user.id);
        });

        collectButtonUpdates(collector, async (btn) => {
            // Pulls
            if (btn.customId === "ex_pull" || btn.customId === "ex_pull10") {
                if (droppedPulls.has(btn)) return;
                const key = interaction.user.id;
                // Self-heal if collectComponentUpdates early-returns and our finally never runs.
                const safety = setTimeout(() => exPulling.delete(key), EX_PULL_TIMEOUT);
                try {
                    await render("busy");
                    return await doPull(btn.customId === "ex_pull10" ? 10 : 1, btn);
                } catch (error) {
                    // Never leave the panel disabled with "Pulling…" if the pull path throws. Restore
                    // the normal view (best effort) and rethrow so the interaction is marked failed.
                    await render(collector.ended ? "expired" : "normal").catch(() => undefined);
                    throw error;
                } finally {
                    clearTimeout(safety);
                    exPulling.delete(key);
                }
            };

            // Overview
            if (btn.customId === "ex_home") {
                state.view = "home";
                state.active = null;
                return render();
            };

            // Standard pool browser
            if (btn.customId === "ex_pool") {
                state.view = "pool";
                state.poolPage = 0;
                return render();
            };
            if (btn.customId === "ex_pool_prev") {
                state.poolPage -= 1;
                return render();
            };
            if (btn.customId === "ex_pool_next") {
                state.poolPage += 1;
                return render();
            };

            // Banner select
            const kind = btn.customId.replace("ex_", "") as ExBannerKind;
            const banner = exBanners[kind];
            if (!banner) return;
            if (!banner.available) return btn.followUp({ content: `The ${banner.name} is not available right now.`, flags: MessageFlags.Ephemeral });

            const isSame = state.view === "banner" && state.active?.kind === kind;
            state.active = isSame ? null : banner;
            state.view = state.active ? "banner" : "home";
            await render();
        });

    },
};

export default exportCommand;

// Deprecated single rate-up banner, replaced by the standard/rate-up/limited banners in Modules/banners.ts.
// const expity = 24;
// const newex: { [key: string]: number; } = {
//     "26272": 0.008, // Hiyuki EX
//     "26273": 0.008, // Lloyd EX
//     "21931": 0.003, // Acheron EX
//     "19050": 0.003, // Raiden Shogun EX
//     "17686": 0.006, // Escanor EX
//     "17687": 0.008, // Fischl EX
//     "19275": 0.009, // APPLe EX
//     "17742": 0.005, // Gintoki EX
// }; // sum = 0.05
// const oldex: { [key: string]: number; } = {
//     "17743": 0, // Shinpachi EX
// }; // sum = 0.0
// const expool: { [key: string]: number; } = { ...oldex, ...newex };
// const exDropRate = Math.round(10000 * Object.values(expool).reduce((acc, rate) => acc + rate, 0)) / 100;
// function getChar(pity: boolean = false, forcePity: boolean = false) {
//     let char: charInfo, weightSum = 0, ranum = Math.random();
//     const usePool = pity ? newex : expool;
//     for (const cid in usePool) {
//         const weight = usePool[cid];
//         weightSum += weight;
//         if (ranum < weightSum) { char = characters[cid as any]; break; };
//     };
//     if (forcePity) {
//         const exSet = Object.keys(usePool);
//         char = characters[exSet[Math.floor(Math.random() * exSet.length)] as any];
//     };
//     const getRarity = (Math.random() < (0.5 - (exDropRate / 100))) ? "SS" : "S";
//     char ||= characters.filter((e) => e.rarity === getRarity).sort(() => 0.5 - Math.random())[0];
//     return char;
// };
