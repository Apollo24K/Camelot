import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ContainerBuilder, MessageFlags, AttachmentBuilder, StringSelectMenuBuilder } from "discord.js";
import { CompactUserSchema, SlashCommand } from "../types";
import { ExternalLinks, currencyEmojis, OfferRow } from "../Modules/components";
import { customHpBars } from "../Modules/customHpBars";
import { profileSets } from "../Modules/profileDecorations";
import { skins } from "../Modules/skins";
import { createCanvas, Image, loadImage } from "@napi-rs/canvas";
import { characters } from "../Modules/chars";
import { getUserSchema, updateUsersAndCache } from "../Modules/queries";
import { items, runeInfo } from "../Modules/items";

type SeasonalShopTab = 'runes' | 'hpbars' | 'backgrounds' | 'skins';

const EMBED_COLOR = 0x2aad9d;

const SEASON_END_DATE = new Date('2026-10-20 00:00:00');

const loadedImages: Record<string | number, Image> = {};

const RUNES_FOR_SALE = [
    { name: "The Sereflame", item: items[855] as runeInfo, price: 80, isNew: true },
    { name: "Tideborn Keep", item: items[856] as runeInfo, price: 80, isNew: true },
    { name: "Arcane Rebirth", item: items[785] as runeInfo, price: 60, isNew: false },
] as const; // Total cost: 220

const HP_BARS_FOR_SALE = [
    { name: "Beach Break", id: 16, price: 100, isNew: true },
    { name: "Neon Heartbeats", id: 12, price: 70, isNew: false },
    { name: "Cupid's Pulse", id: 13, price: 70, isNew: false },
    { name: "Pinkish Fantasy", id: 2, price: 70, isNew: false },
] as const; // Total cost: 310

const BACKGROUNDS_FOR_SALE = [
    { name: "Summer Fun", id: 29, price: 90, isNew: true },
    { name: "Silken Currents", id: 27, price: 70, isNew: true },
    { name: "Project: SUN", id: 28, price: 70, isNew: true },
] as const; // Total cost: 230

const SKIN_SEASON = "summer season 2026"; // Total cost: 640
// Keep each skins page below Discord's 40-component limit. A page of 25
// skins creates five action rows, which exceeds the limit once the container's
// other components are included.
const SKINS_PER_PAGE = 20;

const BuyKeysRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('buy_key_10')
            .setEmoji(currencyEmojis.season_keys)
            .setLabel('10')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('buy_key_25')
            .setEmoji(currencyEmojis.season_keys)
            .setLabel('25')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('buy_key_50')
            .setEmoji(currencyEmojis.season_keys)
            .setLabel('50')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('buy_key_100')
            .setEmoji(currencyEmojis.season_keys)
            .setLabel('100')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('buy_key_250')
            .setEmoji(currencyEmojis.season_keys)
            .setLabel('250')
            .setStyle(ButtonStyle.Secondary),
    );

async function getSeasonalSkinsImage({ columns, page = 0 }: { columns: number; page?: number; }): Promise<AttachmentBuilder> {
    const skinsForSale = skins.filter(skin => skin.obtain === SKIN_SEASON).slice(page * SKINS_PER_PAGE, (page + 1) * SKINS_PER_PAGE);

    const tileW = 225, tileH = 350, gap = 20;
    const cols = Math.min(columns, Math.max(1, skinsForSale.length));
    const rows = Math.ceil(skinsForSale.length / cols);
    const width = cols * tileW + (cols + 1) * gap;
    const height = rows * tileH + (rows + 1) * gap;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    // ctx.fillStyle = '#393a41';
    // ctx.fillRect(0, 0, width, height);

    // Seasonal key emoji (fall)
    const keyId = currencyEmojis.season_keys.match(/<:([^:]+):(\d+)>/)?.[2];
    loadedImages["season_keys"] ||= await loadImage(`https://cdn.discordapp.com/emojis/${keyId}.png`);

    for (let i = 0; i < skinsForSale.length; i++) {
        const skin = skinsForSale[i];
        const c = i % cols;
        const r = Math.floor(i / cols);
        const x = gap + c * (tileW + gap);
        const y = gap + r * (tileH + gap);

        loadedImages[skin.id] ||= await loadImage(skin.image);
        ctx.drawImage(loadedImages[skin.id], x, y, tileW, tileH);

        // Visual indicator if image is a gif
        if (typeof skin.image === "string" && skin.image.toLowerCase().endsWith(".gif")) {
            // Draw a "GIF" badge in the top-right corner of the tile
            const badgeWidth = 46, badgeHeight = 26;
            const badgeX = x + tileW - badgeWidth - 8;
            const badgeY = y + 8;

            // Draw rounded rectangle
            ctx.save();
            ctx.beginPath();
            const radius = 10;
            ctx.moveTo(badgeX + radius, badgeY);
            ctx.lineTo(badgeX + badgeWidth - radius, badgeY);
            ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY, badgeX + badgeWidth, badgeY + radius);
            ctx.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - radius);
            ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY + badgeHeight, badgeX + badgeWidth - radius, badgeY + badgeHeight);
            ctx.lineTo(badgeX + radius, badgeY + badgeHeight);
            ctx.quadraticCurveTo(badgeX, badgeY + badgeHeight, badgeX, badgeY + badgeHeight - radius);
            ctx.lineTo(badgeX, badgeY + radius);
            ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
            ctx.closePath();
            ctx.fillStyle = 'rgba(45, 230, 170, 0.80)';
            ctx.fill();
            ctx.restore();

            // Draw GIF text
            ctx.save();
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#fff';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(16,0,0,0.4)';
            ctx.shadowBlur = 3;
            ctx.fillText('GIF', badgeX + badgeWidth / 2, badgeY + badgeHeight / 2 + 1);
            ctx.restore();
        }

        // Bottom overlay with character name
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x + 2, y + tileH - 48, tileW - 4, 46);

        const charName = characters[skin.cid]?.name || skin.name;
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(charName, x + tileW / 2, y + tileH - 24, tileW - 8);

        // Price tag (season keys)
        const price = (skin as any)?.cost?.season_keys ?? 0;
        if (price > 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(x + 6, y + 6, 80, 30);
            ctx.drawImage(loadedImages["season_keys"], x + 10, y + 9, 22, 22);

            ctx.fillStyle = '#f7f6f2';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(price), x + 36, y + 21);
        };
    };

    const buffer = canvas.toBuffer('image/webp');
    return new AttachmentBuilder(buffer, { name: 'file.webp' });
};

const getSeasonalShopButtonRow = (currentTab: SeasonalShopTab) => {
    const rowButtons = [
        { id: 'runes', label: 'Runes', emoji: '<:valkyrie_sigil:1420830074118209547>' },
        { id: 'hpbars', label: 'HP Bars', emoji: '💧' },
        { id: 'backgrounds', label: 'Backgrounds', emoji: '🖼️' },
        { id: 'skins', label: 'Skins', emoji: '✨' },
    ];

    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            ...rowButtons.map((button) => {
                return new ButtonBuilder()
                    .setCustomId(`tab_${button.id}`)
                    .setLabel(button.label)
                    .setEmoji(button.emoji)
                    .setStyle(currentTab === button.id ? ButtonStyle.Primary : ButtonStyle.Secondary);
            }),
        );
};

const getShopPage = (currentTab: SeasonalShopTab, stats: CompactUserSchema, skinPage = 0): ContainerBuilder => {
    const shopContainer = new ContainerBuilder()
        .setAccentColor(EMBED_COLOR)
        .addSectionComponents(section => section
            .addTextDisplayComponents(
                text => text.setContent('# Seasonal Shop'),
                text => text.setContent(
                    `Welcome to the seasonal shop, available for a limited time! You can earn seasonal keys by: </quests:1087099255652622433> (5x ${currencyEmojis.season_keys}), [vote for Camelot](<https://rank.top/bot/camelot/vote>) (5x ${currencyEmojis.season_keys}, once per day), [vote for Camelot OS](<https://rank.top/server/camelot/vote>) (5x ${currencyEmojis.season_keys}, once per day)`
                ),
            )
            .setThumbnailAccessory(thumbnail => thumbnail.setURL(ExternalLinks.BotPfp))
        )
        .addSeparatorComponents(separator => separator);

    // Customize shop tab layouts

    if (currentTab === 'runes') {
        RUNES_FOR_SALE.forEach(rune => shopContainer
            .addSectionComponents(section => section
                .addTextDisplayComponents(text => text
                    .setContent(`${rune.isNew ? '<:newtwo:1408872814294863933> ' : ''}**${rune.name}** ${rune.item.emoji}\n>>> ${rune.item.buffdesc}`)
                )
                .setButtonAccessory(button => button
                    .setCustomId(`buy_rune_${rune.item.id}`)
                    .setLabel('Buy Now')
                    .setStyle(ButtonStyle.Primary)
                )
            )
        );

    } else if (currentTab === 'hpbars') {
        HP_BARS_FOR_SALE.forEach(hpBar => shopContainer
            .addSectionComponents(section => section
                .addTextDisplayComponents(text => text
                    .setContent(`${hpBar.isNew ? '<:newtwo:1408872814294863933> ' : ''}**${customHpBars[hpBar.id].name}**\n${customHpBars[hpBar.id].getHpBar(0.7, 0.4)}`)
                )
                .setButtonAccessory(button => button
                    .setCustomId(`buy_hpbar_${hpBar.id}`)
                    .setLabel('Buy Now')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(stats.hpbars.includes(hpBar.id))
                )
            )
        );

    } else if (currentTab === 'backgrounds') {
        BACKGROUNDS_FOR_SALE.forEach(background => shopContainer
            .addSectionComponents(section => section
                .addTextDisplayComponents(text => text
                    .setContent(`${background.isNew ? '<:newtwo:1408872814294863933> ' : ''}**${background.name}**\nBackgrounds: ${profileSets[background.id].assets.length}`)
                )
                .setButtonAccessory(button => button
                    .setCustomId(`redirect_bg_${background.id}`)
                    .setLabel('View Backgrounds')
                    .setStyle(ButtonStyle.Primary)
                )
            )
        );

    } else if (currentTab === 'skins') {
        const allSkinsForSale = skins.filter(skin => skin.obtain === SKIN_SEASON);
        const skinsForSale = allSkinsForSale.slice(skinPage * SKINS_PER_PAGE, (skinPage + 1) * SKINS_PER_PAGE);

        // The composed image will be attached to the message
        shopContainer.addMediaGalleryComponents(media => media
            .addItems(item =>
                item.setURL("attachment://file.webp")
            )
        );

        // Skin selection dropdown
        const skinSelect = new StringSelectMenuBuilder()
            .setCustomId('skin_select')
            .setPlaceholder('Select a skin to purchase')
            .addOptions(
                skinsForSale.map((skin, index) => ({
                    label: `${skinPage * SKINS_PER_PAGE + index + 1}) ${skin.name}`,
                    value: `buy_skin_${skin.id}`,
                    description: `${(skin as any).cost?.season_keys ?? 0} ${currencyEmojis.season_keys}`,
                    // default: stats.skins.includes(skin.id),
                }))
            );

        if (skinsForSale.length > 0) {
            shopContainer.addActionRowComponents(actionRow => actionRow.addComponents(skinSelect));
        }

        if (allSkinsForSale.length > SKINS_PER_PAGE) {
            const totalPages = Math.ceil(allSkinsForSale.length / SKINS_PER_PAGE);
            const pageButtons: ButtonBuilder[] = [];
            for (let i = 0; i < totalPages; i++) {
                pageButtons.push(
                    new ButtonBuilder()
                        .setCustomId(`skin_page_${i}`)
                        .setLabel(`Page ${i + 1}`)
                        .setStyle(i === skinPage ? ButtonStyle.Primary : ButtonStyle.Secondary)
                );
            }
            shopContainer.addActionRowComponents(actionRow => actionRow.addComponents(...pageButtons));
        }

    }

    // Footer: Season Keys + Buy More Keys (shown on all tabs)
    shopContainer
        .addSeparatorComponents(separator => separator)
        .addSectionComponents(section => section
            .addTextDisplayComponents(text => text
                .setContent(
                    `-# Season Keys: **${stats.season_keys}** ${currencyEmojis.season_keys}` +
                    ` | ` +
                    `**Time left**: <t:${Math.floor(SEASON_END_DATE.getTime() / 1000)}:R>`
                )
            )
            .setButtonAccessory(button => button
                .setCustomId(`buy_keys`)
                .setLabel('Buy More Keys')
                .setStyle(ButtonStyle.Secondary)
            )
        );

    return shopContainer;
};

export const exportCommand: SlashCommand = {
    name: 'seasonal',
    async execute({ interaction, author, server, locale }) {

        let currentTab: SeasonalShopTab = 'runes';
        let skinPage = 0;
        const stats = author.schema;

        return interaction.reply({ components: [getShopPage(currentTab, stats, skinPage), getSeasonalShopButtonRow(currentTab)], flags: MessageFlags.IsComponentsV2 }).then(async (msg) => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, time: 120000 });

            collector.on('collect', async (r) => {
                if (r.customId.startsWith('tab_')) {
                    currentTab = r.customId.split('_')[1] as SeasonalShopTab;
                    skinPage = 0;

                    let files: AttachmentBuilder[] = [];
                    if (currentTab === 'skins') {
                        files.push(await getSeasonalSkinsImage({ columns: 7, page: skinPage }));
                    };
                    await msg.edit({ components: [getShopPage(currentTab, stats, skinPage), getSeasonalShopButtonRow(currentTab)], files });
                };

                if (r.customId.startsWith('skin_page_')) {
                    skinPage = parseInt(r.customId.split('_')[2]);
                    await msg.edit({
                        components: [getShopPage(currentTab, stats, skinPage), getSeasonalShopButtonRow(currentTab)],
                        files: [await getSeasonalSkinsImage({ columns: 7, page: skinPage })],
                    });
                };

                if (r.customId.startsWith('buy_')) {
                    if (r.customId.startsWith('buy_keys')) {
                        const content = `Please select how many keys you want to purchase\nConversion rate: **1** ${currencyEmojis.season_keys} = **10** ${currencyEmojis.gems} (your balance: **${stats.gems}** ${currencyEmojis.gems})`;
                        interaction.followUp({ content, components: [BuyKeysRow] }).then(ms => {
                            const buyCollector = ms.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                            buyCollector.on('collect', async rr => {
                                if (!rr.customId.startsWith('buy_key_')) {
                                    ms.edit({ content: "Action cancelled", components: [] });
                                    return;
                                };

                                const amount = parseInt(rr.customId.split('_')[2]);
                                const cost = 10 * amount;
                                if (isNaN(amount) || isNaN(cost)) {
                                    ms.edit({ content: "Invalid input", components: [] });
                                    return;
                                };

                                const tempStats = await getUserSchema(interaction.user.id);
                                if (!tempStats) return msg.edit("You haven't started playing yet.");

                                // Return if balance not enough
                                if (tempStats.gems < cost) {
                                    ms.edit({ content: `You don't have enough genesis gems (**${tempStats.gems}**/${cost} ${currencyEmojis.gems})`, components: [] });
                                    return;
                                };

                                // Update users table
                                await updateUsersAndCache(interaction.client, interaction.user.id, {
                                    updates: {
                                        gems: { type: "increment", value: -cost },
                                        season_keys: { type: "increment", value: amount },
                                    },
                                });

                                stats.gems -= cost;
                                stats.season_keys += amount;

                                // Edit replies
                                ms.edit({ content: "Purchase Successful!", components: [] });
                                await msg.edit({ components: [getShopPage(currentTab, stats, skinPage), getSeasonalShopButtonRow(currentTab)] });
                            });
                        });
                    };

                    if (r.customId.startsWith('buy_rune_')) {
                        const runeId = parseInt(r.customId.split('_')[2]);
                        const rune = items[runeId];
                        const cost = RUNES_FOR_SALE.find(rune => rune.item.id === runeId)?.price;
                        if (!cost) return;

                        const content = `Are you sure you want to buy **${rune.name}** for **${cost}** ${currencyEmojis.season_keys}?`;
                        interaction.followUp({ content, components: [OfferRow] }).then(ms => {
                            const buyCollector = ms.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                            buyCollector.on('collect', async rr => {
                                if (rr.customId !== "confirm") {
                                    ms.edit({ content: "Action cancelled", components: [] });
                                    return;
                                };

                                const tempStats = await getUserSchema(interaction.user.id);
                                if (!tempStats) return msg.edit("You haven't started playing yet.");

                                // Return if balance not enough
                                if (tempStats.season_keys < cost) {
                                    ms.edit({ content: `You don't have enough season keys (**${tempStats.season_keys}**/${cost} ${currencyEmojis.season_keys})`, components: [] });
                                    return;
                                };

                                // Update users table
                                await updateUsersAndCache(interaction.client, interaction.user.id, {
                                    updates: {
                                        season_keys: { type: "increment", value: -cost },
                                        items: { type: "merge_json", value: { [rune.id]: 1 } },
                                    },
                                });

                                // Edit replies
                                ms.edit({ content: "Purchase Successful!", components: [] });
                                await msg.edit({ components: [getShopPage(currentTab, stats, skinPage), getSeasonalShopButtonRow(currentTab)] });
                            });
                        });
                    };

                    if (r.customId.startsWith('buy_hpbar_')) {
                        const hpBarId = parseInt(r.customId.split('_')[2]);
                        const hpBar = customHpBars[hpBarId];
                        const cost = HP_BARS_FOR_SALE.find(hpBar => hpBar.id === hpBarId)?.price;
                        if (!cost) return;

                        const content = `Are you sure you want to buy **${hpBar.name}** for **${cost}** ${currencyEmojis.season_keys}?\nPreview: ${hpBar.getHpBar(0.7, 0.4)}`;
                        interaction.followUp({ content, components: [OfferRow] }).then(ms => {
                            const buyCollector = ms.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                            buyCollector.on('collect', async rr => {
                                if (rr.customId !== "confirm") {
                                    ms.edit({ content: "Action cancelled", components: [] });
                                    return;
                                };

                                const tempStats = await getUserSchema(interaction.user.id);
                                if (!tempStats) return msg.edit("You haven't started playing yet.");

                                // Return if balance not enough
                                if (tempStats.season_keys < cost) {
                                    ms.edit({ content: `You don't have enough season keys (**${tempStats.season_keys}**/${cost} ${currencyEmojis.season_keys})`, components: [] });
                                    return;
                                };

                                // Add background
                                tempStats.hpbars.push(hpBarId);
                                stats.hpbars.push(hpBarId);

                                // Update users table
                                await updateUsersAndCache(interaction.client, interaction.user.id, {
                                    updates: {
                                        season_keys: { type: "increment", value: -cost },
                                        hpbars: { type: "append_unique", value: [hpBarId] }
                                    },
                                });

                                // Edit replies
                                ms.edit({ content: "Purchase Successful!", components: [] });
                                await msg.edit({ components: [getShopPage(currentTab, stats, skinPage), getSeasonalShopButtonRow(currentTab)] });
                            });
                        });
                    };
                };

                if (r.customId === 'skin_select' && r.isStringSelectMenu()) {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()' on "${r.customId}":`, err);
                    });
                    const selectedValue = r.values[0]; // e.g., "buy_skin_209"
                    if (!selectedValue.startsWith('buy_skin_')) return;

                    const skinId = parseInt(selectedValue.split('_')[2]);
                    const skin = skins[skinId];
                    const cost = skin.cost.season_keys;
                    if (!cost) return;

                    const content = `Are you sure you want to buy **${skin.name}** for **${cost}** ${currencyEmojis.season_keys}?`;
                    interaction.followUp({ content, components: [OfferRow] }).then(ms => {
                        const buyCollector = ms.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                        buyCollector.on('collect', async rr => {
                            if (rr.customId !== "confirm") {
                                ms.edit({ content: "Action cancelled", components: [] });
                                return;
                            };

                            const tempStats = await getUserSchema(interaction.user.id);
                            if (!tempStats) return msg.edit("You haven't started playing yet.");

                            // Return if already owned
                            if (tempStats.skins.includes(skinId)) {
                                ms.edit({ content: `You already own this skin!`, components: [] });
                                return;
                            };

                            // Return if balance not enough
                            if (tempStats.season_keys < cost) {
                                ms.edit({ content: `You don't have enough season keys (**${tempStats.season_keys}**/${cost} ${currencyEmojis.season_keys})`, components: [] });
                                return;
                            };

                            // Add skin
                            tempStats.skins.push(skinId);
                            stats.skins.push(skinId);

                            // Update users table
                            await updateUsersAndCache(interaction.client, interaction.user.id, {
                                updates: {
                                    season_keys: { type: "increment", value: -cost },
                                    skins: { type: "append_unique", value: [skinId] },
                                },
                            });

                            // Edit replies
                            ms.edit({ content: "Purchase Successful!", components: [] });
                            await msg.edit({ components: [getShopPage(currentTab, stats, skinPage), getSeasonalShopButtonRow(currentTab)] });
                        });
                    });
                };

                if (r.customId.startsWith('redirect_bg_')) {
                    const backgroundId = parseInt(r.customId.split('_')[2]);
                    const background = profileSets[backgroundId];

                    // Modify command details
                    interaction.commandName = 'background';
                    // @ts-ignore
                    interaction.options._subcommand = 'search';
                    // @ts-ignore
                    interaction.options._hoistedOptions = [
                        { name: 'name', type: 3, value: background.name },
                        { name: 'type', type: 3, value: 'set' }
                    ];
                    interaction.deferred = true;

                    // Slash Commands
                    const command = interaction.client.slashCommands.get(interaction.commandName) as SlashCommand | undefined;
                    if (command) command.execute({ interaction, author, server, locale });
                };
            });
        });

    },
};

export default exportCommand;
