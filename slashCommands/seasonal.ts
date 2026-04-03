import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ContainerBuilder, MessageFlags, AttachmentBuilder } from "discord.js";
import { CompactUserSchema, SlashCommand } from "../types";
import { botPfp, currencyEmojis, OfferRow } from "../Modules/components";
import { customHpBars } from "../Modules/customHpBars";
import { profileSets } from "../Modules/profileDecorations";
import { skins } from "../Modules/skins";
import { createCanvas, Image, loadImage } from "@napi-rs/canvas";
import { characters } from "../Modules/chars";
import { getUserSchema, updateUsers } from "../Modules/queries";
import { items, runeInfo } from "../Modules/items";

type SeasonalShopTab = 'runes' | 'hpbars' | 'backgrounds' | 'skins';

const EMBED_COLOR = 0x2aad9d;

const SEASON_END_DATE = new Date('2026-04-03 00:00:00');

const loadedImages: Record<string | number, Image> = {};

const RUNES_FOR_SALE = [
    { name: "The Fated", item: items[793] as runeInfo, price: 80, isNew: true },
    { name: "Thorn's Contender", item: items[792] as runeInfo, price: 80, isNew: true },
    { name: "Hollow Crown", item: items[788] as runeInfo, price: 60, isNew: false },
] as const; // Total cost: 220

const HP_BARS_FOR_SALE = [
    { name: "Neon Heartbeats", id: 12, price: 70, isNew: true },
    { name: "Cupid's Pulse", id: 13, price: 70, isNew: true },
    { name: "Velvet Night", id: 6, price: 50, isNew: false },
    { name: "Golden Grasslands", id: 3, price: 50, isNew: false },
] as const; // Total cost: 240

const BACKGROUNDS_FOR_SALE = [
    { name: "Forever Valentines", id: 20, price: 80, isNew: true },
    { name: "Moments", id: 22, price: 70, isNew: true },
    { name: "Fireworks", id: 21, price: 60, isNew: true },
] as const; // Total cost: 210

const SKIN_SEASON = "valentines season 2026"; // Total cost: 645

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

async function getSeasonalSkinsImage({ columns }: { columns: number; }): Promise<AttachmentBuilder> {
    const skinsForSale = skins.filter(skin => skin.obtain === SKIN_SEASON);

    const tileW = 225, tileH = 350, gap = 20;
    const cols = Math.min(columns, Math.max(1, skinsForSale.length));
    const rows = Math.ceil(skinsForSale.length / cols);
    const width = cols * tileW + (cols + 1) * gap;
    const height = rows * tileH + (rows + 1) * gap;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#393a41';
    ctx.fillRect(0, 0, width, height);

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

    const buffer = canvas.toBuffer('image/jpeg');
    return new AttachmentBuilder(buffer, { name: 'file.jpg' });
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

const getShopPage = (currentTab: SeasonalShopTab, stats: CompactUserSchema): ContainerBuilder => {
    const shopContainer = new ContainerBuilder()
        .setAccentColor(EMBED_COLOR)
        .addSectionComponents(section => section
            .addTextDisplayComponents(
                text => text.setContent('# Seasonal Shop'),
                text => text.setContent(
                    `Welcome to the seasonal shop, available for a limited time! You can earn seasonal keys by: </quests:1087099255652622433> (5x ${currencyEmojis.season_keys}), [vote for Camelot](<https://rank.top/bot/camelot/vote>) (5x ${currencyEmojis.season_keys}, once per day), [vote for Camelot OS](<https://rank.top/server/camelot/vote>) (5x ${currencyEmojis.season_keys}, once per day)`
                ),
            )
            .setThumbnailAccessory(thumbnail => thumbnail.setURL(botPfp))
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
        const skinsForSale = skins.filter(skin => skin.obtain === SKIN_SEASON);

        // The composed image will be attached to the message
        shopContainer.addMediaGalleryComponents(media => media
            .addItems(item =>
                item.setURL("attachment://file.jpg")
            )
        );

        const skinChunks = [];
        for (let i = 0; i < skinsForSale.length; i += 5) {
            skinChunks.push(skinsForSale.slice(i, i + 5));
        }

        skinChunks.forEach((chunk, i1) => shopContainer
            .addActionRowComponents(
                actionRow => actionRow
                    .addComponents(
                        ...chunk.map((skin, i2) => new ButtonBuilder()
                            .setCustomId(`buy_skin_${skin.id}`)
                            .setLabel(`${(i1 * 5) + i2 + 1}) ${skin.name.split(" ")[0].length > 4 ? skin.name.split(" ")[0] : skin.name.split(" ")[0] + ` ${(!skin.name.split(" ")[1].startsWith("(") ? skin.name.split(" ")[1] : "") || ""}`}`)
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(stats.skins.includes(skin.id))
                        )
                    )
            )
        );

    };

    // Add Footer
    shopContainer
        .addSeparatorComponents(separator => separator)
        // .addTextDisplayComponents(
        //     text => text.setContent(
        //         `-# Season Keys: **${stats.season_keys}** ${currencyEmojis.season_keys}` +
        //         ` | ` +
        //         `**Time left**: <t:${Math.floor(SEASON_END_DATE.getTime() / 1000)}:R>`
        //     )
        // )
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
        const stats = author.schema;

        return interaction.reply({ components: [getShopPage(currentTab, stats), getSeasonalShopButtonRow(currentTab)], flags: MessageFlags.IsComponentsV2 }).then(async (msg) => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 120000 });

            collector.on('collect', async (r) => {
                if (r.customId.startsWith('tab_')) {
                    currentTab = r.customId.split('_')[1] as SeasonalShopTab;

                    let files: AttachmentBuilder[] = [];
                    if (currentTab === 'skins') {
                        files.push(await getSeasonalSkinsImage({ columns: 7 }));
                    };
                    await msg.edit({ components: [getShopPage(currentTab, stats), getSeasonalShopButtonRow(currentTab)], files });
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
                                await updateUsers(interaction.user.id, {
                                    gems: { type: "increment", value: -cost },
                                    season_keys: { type: "increment", value: amount },
                                });

                                stats.gems -= cost;
                                stats.season_keys += amount;

                                // Edit replies
                                ms.edit({ content: "Purchase Successful!", components: [] });
                                await msg.edit({ components: [getShopPage(currentTab, stats), getSeasonalShopButtonRow(currentTab)] });
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
                                await updateUsers(interaction.user.id, {
                                    season_keys: { type: "increment", value: -cost },
                                    items: { type: "merge_json", value: { [rune.id]: 1 } },
                                });

                                // Edit replies
                                ms.edit({ content: "Purchase Successful!", components: [] });
                                await msg.edit({ components: [getShopPage(currentTab, stats), getSeasonalShopButtonRow(currentTab)] });
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
                                await updateUsers(interaction.user.id, {
                                    season_keys: { type: "increment", value: -cost },
                                    hpbars: { type: "append_unique", value: [hpBarId] }
                                });

                                // Edit replies
                                ms.edit({ content: "Purchase Successful!", components: [] });
                                await msg.edit({ components: [getShopPage(currentTab, stats), getSeasonalShopButtonRow(currentTab)] });
                            });
                        });
                    };

                    if (r.customId.startsWith('buy_skin_')) {
                        const skinId = parseInt(r.customId.split('_')[2]);
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

                                // Return if balance not enough
                                if (tempStats.season_keys < cost) {
                                    ms.edit({ content: `You don't have enough season keys (**${tempStats.season_keys}**/${cost} ${currencyEmojis.season_keys})`, components: [] });
                                    return;
                                };

                                // Add background
                                tempStats.skins.push(skinId);
                                stats.skins.push(skinId);

                                // Update users table
                                await updateUsers(interaction.user.id, {
                                    season_keys: { type: "increment", value: -cost },
                                    skins: { type: "append_unique", value: [skinId] }
                                });

                                // Edit replies
                                ms.edit({ content: "Purchase Successful!", components: [] });
                                await msg.edit({ components: [getShopPage(currentTab, stats), getSeasonalShopButtonRow(currentTab)] });
                            });
                        });
                    };
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
