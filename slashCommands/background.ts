import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle, ChatInputCommandInteraction, AttachmentBuilder } from "discord.js";
import { getProfileImage } from "./profile";
import { CostTypes, ProfileDecorations, profileSets } from "../Modules/profileDecorations";
import { getClassLvl, getDetailedStats, lastActive, userLevel } from "../Modules/functions";
import { characters } from "../Modules/chars";
import { CompactUserSchema, ProfileImageArguments, SlashCommand } from '../types';
import { items } from '../Modules/items';
import { classes } from '../Modules/classes';
import { profileColors } from '../Modules/components';
import { getUserSchema, updateUsers } from '../Modules/queries';

function getPageRow(background: ProfileDecorations, cachedImages: Record<number, AttachmentBuilder>, stats: CompactUserSchema) {
    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setEmoji('⏪')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('⏩')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('load')
                .setLabel('Load Preview')
                .setDisabled(!!cachedImages[background.id])
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('buy')
                .setLabel('Buy')
                .setDisabled(!background.obtain.includes("shop") || (Object.keys(background.cost).length === 0) || stats.backgrounds.includes(`${background.set?.id}`) || stats.backgrounds.includes(`${background.set?.id}.${background.id}`))
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('buy-set')
                .setLabel('Buy Set')
                .setDisabled(!background.obtain.includes("shop") || (Object.keys(background.set?.cost ?? {}).length === 0) || stats.backgrounds.includes(`${background.set?.id}`) || background.set?.assets.every((e) => stats.backgrounds.includes(`${background.set?.id}.${e.id}`)))
                .setStyle(ButtonStyle.Success),
        );
};

const emojis = { gems: "<:genesis_gems:1034179687720681492>", coins: "<:coins:1030580480782893197>", lilies: "<:lilium:974057059618291732>", jades: "<:eternal_jade:1256124504141201428>" };
function buyRow(background: ProfileDecorations) {
    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            ...Object.entries(background.cost).map(([currency, amount]) => {
                return new ButtonBuilder()
                    .setCustomId(currency)
                    .setEmoji(emojis[currency as keyof CostTypes])
                    .setLabel(`${amount}`)
                    .setStyle((currency === "jades") ? ButtonStyle.Success : ((currency === "gems") ? ButtonStyle.Primary : ButtonStyle.Secondary));
            }),
        );
};
function buySetRow(background: ProfileDecorations) {
    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            ...Object.entries(background.set?.cost ?? {}).map(([currency, amount]) => {
                return new ButtonBuilder()
                    .setCustomId(`set-${currency}`)
                    .setEmoji(emojis[currency as keyof CostTypes])
                    .setLabel(`${amount}`)
                    .setStyle((currency === "jades") ? ButtonStyle.Success : ((currency === "gems") ? ButtonStyle.Primary : ButtonStyle.Secondary));
            }),
        );
};

function searchBackground(name: string, interaction: ChatInputCommandInteraction, silent = false) {
    name = name.toLowerCase().split(" ").filter((e) => e).join(" ");

    // Full Name Search
    for (const set of profileSets) {
        const background = set.assets.find((e) => e.name.toLowerCase() === name);
        if (background) return background;
    };

    // Filter
    const fArray = [];
    for (const set of profileSets) {
        fArray.push(...set.assets.filter((e) => e.name.toLowerCase().startsWith(name)));
        fArray.push(...set.assets.filter((e) => !e.name.toLowerCase().startsWith(name) && e.name.toLowerCase().includes(name)));
    };

    if (fArray.length === 0) {
        if (!silent) interaction.reply("No match found");
        return;
    };
    if (fArray.length > 1) {
        if (!silent) interaction.reply(`${fArray.length} matches found:\n> ‧ ${fArray.sort((a, b) => (b.name.startsWith(name) ? 1 : 0) - (a.name.startsWith(name) ? 1 : 0)).map((e) => e.name).slice(0, 8).join('\n> ‧ ')}${fArray.length > 8 ? `\n+ ${fArray.length - 8} more` : ""}`);
        return;
    };
    return fArray[0];
};

function searchProfileSet(name: string, interaction: ChatInputCommandInteraction, silent = false) {
    name = name.toLowerCase().split(" ").filter((e) => e).join(" ");

    // Full Name Search
    const set = profileSets.find((e) => e.name.toLowerCase() === name);
    if (set) return set;

    // Filter
    const fArray = [];
    fArray.push(...profileSets.filter((e) => e.name.toLowerCase().startsWith(name)));
    fArray.push(...profileSets.filter((e) => !e.name.toLowerCase().startsWith(name) && e.name.toLowerCase().includes(name)));

    if (fArray.length === 0) {
        if (!silent) interaction.reply("No match found");
        return;
    };
    if (fArray.length > 1) {
        if (!silent) interaction.reply(`${fArray.length} matches found:\n> ‧ ${fArray.sort((a, b) => (b.name.startsWith(name) ? 1 : 0) - (a.name.startsWith(name) ? 1 : 0)).map((e) => e.name).slice(0, 8).join('\n> ‧ ')}${fArray.length > 8 ? `\n+ ${fArray.length - 8} more` : ""}`);
        return;
    };
    return fArray[0];
};

const exportCommand: SlashCommand = {
    name: 'background',
    async execute({ interaction, author }) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "search") {
            const name = interaction.options.getString('name', true);
            const type = interaction.options.getString('type') ?? "background";

            const background = type === "background"
                ? searchBackground(name, interaction)
                : searchProfileSet(name, interaction)?.assets?.[0];
            if (!background || !background.set) return;

            const pagesTotal = background.set.assets.length;
            let currPage = background.id + 1;

            await interaction.deferReply().catch(() => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });

            const stats = author.schema;
            if (!stats.chars.length) return interaction.editReply(interaction.user.id === interaction.user.id ? "You don't have any characters" : `${interaction.user.username} has no characters`);
            if (!stats.battlechar) return interaction.editReply("You don't have a battle character selected. Please use `/select` first");

            // Free BGs
            stats.backgrounds.push("0");
            stats.background = `${background.set.id}.${background.id}`;

            // Floor
            if (stats.dungeon_floors[Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]] >= 20 && parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]) !== 100) stats.dungeon_floors[1 + parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1])] = 0;
            if (stats.dungeon_floors[Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]] >= 1 && parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]) % 5 == 0 && parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]) !== 100) stats.dungeon_floors[1 + parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1])] = 0;

            // Get Detailed Stats
            const detailedStats = await getDetailedStats(stats.battlechar, stats, stats.dungeon_classlevels);

            // Profile Arguments
            const profileArguments: ProfileImageArguments = {
                profilecolor: stats.profilecolor,
                quality: "thumbnail",
                forceStatic: false,
                thumbnail: stats.favchar === null ? undefined : characters[stats.favchar].getImage(stats.premium, customSettings[interaction.user.id]?.cimg[stats.favchar], stats.char_skin[stats.favchar], true),

                stats: detailedStats,
                ref: stats.char_ref[stats.battlechar],
                classlevels: stats.dungeon_classlevels,
                floor: parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]),

                guild: "Temp Guild",
                party: "Temp Party",

                colorLight: stats.premium > 1 && stats.profilecolor?.includes(":") ? stats.profilecolor.split(":")[0] || (['#ffffff', '#d46600', '#8fd3e2', '#ffe036', '#00546a'][classes[stats.class ?? "-1"]?.tier] || '#ffffff') : (stats.profilecolor ? profileColors[stats.profilecolor as keyof typeof profileColors][0] : (['#ffffff', '#d46600', '#8fd3e2', '#ffe036', '#00546a'][classes[stats.class ?? "-1"]?.tier] || '#ffffff')),
                colorDark: stats.premium > 1 && stats.profilecolor?.includes(":") ? stats.profilecolor.split(":")[1] || (['#ddd0c0', '#c63a17', '#4c9fea', '#ffa114', '#1b3d68'][classes[stats.class ?? "-1"]?.tier] || '#ddd0c0') : (stats.profilecolor ? profileColors[stats.profilecolor as keyof typeof profileColors][1] : (['#ddd0c0', '#c63a17', '#4c9fea', '#ffa114', '#1b3d68'][classes[stats.class ?? "-1"]?.tier] || '#ddd0c0')),

                profilePicture: interaction.user.displayAvatarURL(),
                classImage: stats.class === null ? undefined : classes[stats.class].image,
                className: stats.class === null ? undefined : classes[stats.class].name,
                classLevel: stats.class === null ? undefined : (getClassLvl(stats.class, stats.dungeon_classlevels) || 0),
                userLvl: userLevel(stats.xp),
                lastActive: lastActive(stats.lastdaily || stats.created),
                weaponImage: items[detailedStats.weapon]?.image,
                shieldImage: items[detailedStats.shieldid]?.image,
                helmetImage: items[detailedStats.helmet]?.image,
                cuirassImage: items[detailedStats.cuirass]?.image,
                glovesImage: items[detailedStats.gloves]?.image,
                bootsImage: items[detailedStats.boots]?.image,
            };

            // Preview
            const cachedImages: Record<number, AttachmentBuilder> = {};
            if (background.set.assets[currPage - 1].asset.fileType !== "gif") {
                cachedImages[currPage - 1] ||= await getProfileImage(interaction.user, stats, profileArguments);
            };

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(background.set.assets[currPage - 1].name.slice(0, 40))
                .setDescription(`**Set**: ${background.set.name}\n**Obtain**: ${background.set.assets[currPage - 1].obtain.length ? background.set.assets[currPage - 1].obtain.join(", ") : "`None`"}${background.set.assets[currPage - 1].credits.length ? `\n**Credits**: ${background.set.assets[currPage - 1].credits.map((e) => `<@${e}>`).join(", ")}` : ""}`)
                .setImage(background.set.assets[currPage - 1].asset.url)
                .setThumbnail(`attachment://profile.${background.set.assets[currPage - 1].asset.fileType === "gif" ? "gif" : "jpg"}`)
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            return interaction.editReply({ embeds: [Embed], components: [getPageRow(background.set.assets[currPage - 1], cachedImages, stats)], files: cachedImages[currPage - 1] ? [cachedImages[currPage - 1]] : [] }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', async r => {
                    if (!background || !background.set) return;

                    if (r.customId === "buy" || r.customId === "buy-set") {
                        const content = (r.customId === "buy") ? `Are you sure you want to buy the **${background.set.assets[currPage - 1].name}** background?\nPlease choose the currency you'd like to pay in to proceed` : `Are you sure you want to buy the **${background.set.name}** background set?\nPlease choose the currency you'd like to pay in to proceed`;
                        const components = (r.customId === "buy") ? [buyRow(background.set.assets[currPage - 1])] : [buySetRow(background.set.assets[currPage - 1])];
                        interaction.followUp({ content, components }).then(ms => {
                            const buyCollector = ms.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                            buyCollector.on('collect', async rr => {
                                if (!background || !background.set) return;

                                const tempStats = await getUserSchema(interaction.user.id);
                                if (!tempStats) return interaction.editReply("You haven't started playing yet.");

                                let cost = 1_000_000_000, bgid;
                                if (rr.customId.startsWith("set")) {
                                    rr.customId = rr.customId.split("-")[1];
                                    cost = background.set.cost[rr.customId as keyof CostTypes] || 1_000_000_000;
                                    bgid = `${background.set.id}`;
                                } else {
                                    cost = background.set.assets[currPage - 1].cost[rr.customId as keyof CostTypes] || 1_000_000_000;
                                    bgid = `${background.set.id}.${currPage - 1}`;
                                };

                                // Return if balance not enough
                                if (tempStats[rr.customId as keyof CostTypes] < cost) {
                                    ms.edit({ content: `You don't have enough ${rr.customId} (**${tempStats[rr.customId as keyof CostTypes]}**/${cost} ${emojis[rr.customId as keyof CostTypes]})`, components: [] });
                                    return;
                                };

                                // Add background
                                tempStats.backgrounds.push(bgid);
                                stats.backgrounds.push(bgid);

                                // Update users table
                                await updateUsers(interaction.user.id, {
                                    [rr.customId]: { type: "increment", value: -cost },
                                    background: { type: "set", value: `${background.set.id}.${currPage - 1}` },
                                    backgrounds: { type: "append", value: [bgid] }
                                });

                                // Edit replies
                                ms.edit({ content: "Purchase Successful!", components: [] });
                                interaction.editReply({ components: [getPageRow(background.set.assets[currPage - 1], cachedImages, tempStats)] });
                            });

                        });
                        return;
                    };

                    // Change Pages
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else if (r.customId === "next") {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    // Preview
                    if (r.customId === "load" || background.set.assets[currPage - 1].asset.fileType !== "gif") {
                        stats.background = `${background.set.id}.${currPage - 1}`;
                        cachedImages[currPage - 1] ||= await getProfileImage(interaction.user, stats, profileArguments);
                    };

                    Embed.setTitle(background.set.assets[currPage - 1].name.slice(0, 40))
                        .setDescription(`**Set**: ${background.set.name}\n**Obtain**: ${background.set.assets[currPage - 1].obtain.length ? background.set.assets[currPage - 1].obtain.join(", ") : "`None`"}`)
                        .setImage(background.set.assets[currPage - 1].asset.url)
                        .setThumbnail(cachedImages[currPage - 1] ? `attachment://profile.${background.set.assets[currPage - 1].asset.fileType === "gif" ? "gif" : "jpg"}` : null)
                        .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed], components: [getPageRow(background.set.assets[currPage - 1], cachedImages, stats)], files: cachedImages[currPage - 1] ? [cachedImages[currPage - 1]] : [] });
                });
            });
        };

        if (subcommand === "select") {
            const name = interaction.options.getString('name', true);

            const background = searchBackground(name, interaction);
            if (!background || !background.set) return;

            await interaction.deferReply().catch(() => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });

            const stats = author.schema;
            if (!stats.chars.length) return interaction.editReply(interaction.user.id === interaction.user.id ? "You don't have any characters" : `${interaction.user.username} has no characters`);
            if (!stats.battlechar) return interaction.editReply("You don't have a battle character selected. Please use `/select` first");

            // Free BGs
            stats.backgrounds.push("0");
            stats.background = `${background.set.id}.${background.id}`;

            // Return if not owned
            if (!stats.backgrounds.includes(`${background.set.id}`) && !stats.backgrounds.includes(`${background.set.id}.${background.id}`)) return interaction.editReply(`You don't have the background "**${background.name}**"`);

            // Update users table
            await updateUsers(interaction.user.id, {
                background: { type: "set", value: `${background.set.id}.${background.id}` },
            });

            // Floor
            if (stats.dungeon_floors[Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]] >= 20 && parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]) !== 100) stats.dungeon_floors[1 + parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1])] = 0;
            if (stats.dungeon_floors[Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]] >= 1 && parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]) % 5 == 0 && parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]) !== 100) stats.dungeon_floors[1 + parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1])] = 0;

            // Get Detailed Stats
            const detailedStats = await getDetailedStats(stats.battlechar, stats, stats.dungeon_classlevels);

            // Profile Arguments
            const profileArguments: ProfileImageArguments = {
                profilecolor: stats.profilecolor,
                quality: "thumbnail",
                forceStatic: false,
                thumbnail: stats.favchar === null ? undefined : characters[stats.favchar].getImage(stats.premium, customSettings[interaction.user.id]?.cimg[stats.favchar], stats.char_skin[stats.favchar], true),

                stats: detailedStats,
                ref: stats.char_ref[stats.battlechar],
                classlevels: stats.dungeon_classlevels,
                floor: parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]),

                guild: "Temp Guild",
                party: "Temp Party",

                colorLight: stats.premium > 1 && stats.profilecolor?.includes(":") ? stats.profilecolor.split(":")[0] || (['#ffffff', '#d46600', '#8fd3e2', '#ffe036', '#00546a'][classes[stats.class ?? "-1"]?.tier] || '#ffffff') : (stats.profilecolor ? profileColors[stats.profilecolor as keyof typeof profileColors][0] : (['#ffffff', '#d46600', '#8fd3e2', '#ffe036', '#00546a'][classes[stats.class ?? "-1"]?.tier] || '#ffffff')),
                colorDark: stats.premium > 1 && stats.profilecolor?.includes(":") ? stats.profilecolor.split(":")[1] || (['#ddd0c0', '#c63a17', '#4c9fea', '#ffa114', '#1b3d68'][classes[stats.class ?? "-1"]?.tier] || '#ddd0c0') : (stats.profilecolor ? profileColors[stats.profilecolor as keyof typeof profileColors][1] : (['#ddd0c0', '#c63a17', '#4c9fea', '#ffa114', '#1b3d68'][classes[stats.class ?? "-1"]?.tier] || '#ddd0c0')),

                profilePicture: interaction.user.displayAvatarURL(),
                classImage: stats.class === null ? undefined : classes[stats.class].image,
                className: stats.class === null ? undefined : classes[stats.class].name,
                classLevel: stats.class === null ? undefined : (getClassLvl(stats.class, stats.dungeon_classlevels) || 0),
                userLvl: userLevel(stats.xp),
                lastActive: lastActive(stats.lastdaily || stats.created),
                weaponImage: items[detailedStats.weapon]?.image,
                shieldImage: items[detailedStats.shieldid]?.image,
                helmetImage: items[detailedStats.helmet]?.image,
                cuirassImage: items[detailedStats.cuirass]?.image,
                glovesImage: items[detailedStats.gloves]?.image,
                bootsImage: items[detailedStats.boots]?.image,
            };

            // Preview
            const profileImage = await getProfileImage(interaction.user, stats, profileArguments);

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setDescription(`Now using: **${background.name}**\nFrom set: **${background.set.name}**`)
                .setImage(background.asset.url)
                // .setThumbnail(`attachment://profile.${background.asset.fileType === "gif" ? "gif" : "jpg"}`);
                .setThumbnail(`attachment://profile.jpg`);
            return interaction.editReply({ embeds: [Embed], files: [profileImage] });
        };
    },
};

export default exportCommand;
