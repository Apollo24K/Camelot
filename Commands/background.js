import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } from "discord.js";
import { db, query } from "../db_handler";
import { getProfileImage } from "./profile";
import { profileSets } from "../Modules/profileDecorations";
import { getDetailedStats } from "../Modules/functions";
import { characters } from "../Modules/chars";

function getPageRow(background, cachedImages, stats) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setEmoji('⏪')
                .setStyle('Secondary'),
            new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('⏩')
                .setStyle('Secondary'),
            new ButtonBuilder()
                .setCustomId('load')
                .setLabel('Load Preview')
                .setDisabled(!!cachedImages[background.id])
                .setStyle('Primary'),
            new ButtonBuilder()
                .setCustomId('buy')
                .setLabel('Buy')
                .setDisabled(!background.obtain.includes("shop") || (Object.keys(background.cost).length === 0) || stats.backgrounds.includes(`${background.set.id}`) || stats.backgrounds.includes(`${background.set.id}.${background.id}`))
                .setStyle('Success'),
            new ButtonBuilder()
                .setCustomId('buy-set')
                .setLabel('Buy Set')
                .setDisabled(!background.obtain.includes("shop") || (Object.keys(background.set.cost).length === 0) || stats.backgrounds.includes(`${background.set.id}`) || background.set.assets.every((e) => stats.backgrounds.includes(`${background.set.id}.${e.id}`)))
                .setStyle('Success'),
        );
};

const emojis = { gems: "<:genesis_gems:1034179687720681492>", coins: "<:coins:1030580480782893197>", lilies: "<:lilium:974057059618291732>", jades: "<:eternal_jade:1256124504141201428>" };
function buyRow(background) {
    return new ActionRowBuilder()
        .addComponents(
            ...Object.entries(background.cost).map(([currency, amount]) => {
                return new ButtonBuilder()
                    .setCustomId(currency)
                    .setEmoji(emojis[currency])
                    .setLabel(`${amount}`)
                    .setStyle((currency === "jades") ? 'Success' : ((currency === "gems") ? 'Primary' : 'Secondary'));
            }),
        );
};
function buySetRow(background) {
    return new ActionRowBuilder()
        .addComponents(
            ...Object.entries(background.set.cost).map(([currency, amount]) => {
                return new ButtonBuilder()
                    .setCustomId(`set-${currency}`)
                    .setEmoji(emojis[currency])
                    .setLabel(`${amount}`)
                    .setStyle((currency === "jades") ? 'Success' : ((currency === "gems") ? 'Primary' : 'Secondary'));
            }),
        );
};

function searchBackground(name, interaction, silent = false) {
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

    if (fArray.length === 0) return silent ? false : interaction.reply("No match found");
    if (fArray.length > 1) return silent ? false : interaction.reply(`${fArray.length} matches found:\n> ‧ ${fArray.sort((a, b) => b.name.startsWith(name) - a.name.startsWith(name)).map((e) => e.name).slice(0, 8).join('\n> ‧ ')}${fArray.length > 8 ? `\n+ ${fArray.length - 8} more` : ""}`);
    return fArray[0];
};

function searchProfileSet(name, interaction, silent = false) {
    name = name.toLowerCase().split(" ").filter((e) => e).join(" ");

    // Full Name Search
    const set = profileSets.find((e) => e.name.toLowerCase() === name);
    if (set) return set;

    // Filter
    const fArray = [];
    fArray.push(...profileSets.filter((e) => e.name.toLowerCase().startsWith(name)));
    fArray.push(...profileSets.filter((e) => !e.name.toLowerCase().startsWith(name) && e.name.toLowerCase().includes(name)));

    if (fArray.length === 0) return silent ? false : interaction.reply("No match found");
    if (fArray.length > 1) return silent ? false : interaction.reply(`${fArray.length} matches found:\n> ‧ ${fArray.sort((a, b) => b.name.startsWith(name) - a.name.startsWith(name)).map((e) => e.name).slice(0, 8).join('\n> ‧ ')}${fArray.length > 8 ? `\n+ ${fArray.length - 8} more` : ""}`);
    return fArray[0];
};

module.exports = {
    name: 'background',
    description: 'profile background related commands',
    execute(interaction) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "search") {
            const name = interaction.options.getString('name');
            const type = interaction.options.getString('type') ?? "background";

            const background = type === "background" ?
                searchBackground(name, interaction)
                :
                searchProfileSet(name, interaction)?.assets?.[0];
            if (!background?.name) return;

            const pagesTotal = background.set.assets.length;
            let currPage = background.id + 1;

            db.serialize(async () => {
                await interaction.deferReply().catch(() => {
                    return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
                });

                const { 0: stats } = await query(`SELECT background, backgrounds, favchar, xp, coins, bank, gems, lastdaily, battlechar, class, aboutme, profilecolor, arenawins, arenalosses, lilies, achievements, items, premium, guild, party, shield_slot FROM users WHERE id = ${interaction.user.id}`);
                if (!stats) return interaction.editReply("You haven't started playing yet.");
                stats.backgrounds = JSON.parse(stats.backgrounds);
                stats.backgrounds.push("0"); // Free BGs
                stats.background = `${background.set.id}.${background.id}`;
                stats.achievements = JSON.parse(stats.achievements);
                stats.items = JSON.parse(stats.items);
                stats.quality = "thumbnail";
                // stats.forceStatic = true;

                const { 0: inv } = await query(`SELECT characters.chars, characters.ref, users.level, users.equipment, characters.skin, dungeon.classes, dungeon.classlevels, dungeon.floors FROM characters JOIN users ON characters.id = users.id JOIN dungeon ON characters.id = dungeon.id WHERE characters.id = ${interaction.user.id}`);
                inv.id = interaction.user.id, inv.class = stats.class, inv.premium = stats.premium, inv.bank = stats.bank, inv.shield_slot = stats.shield_slot, inv.chars = JSON.parse(inv.chars), inv.ref = JSON.parse(inv.ref), inv.skin = JSON.parse(inv.skin), inv.equipment = JSON.parse(inv.equipment), inv.classes = JSON.parse(inv.classes), inv.classlevels = JSON.parse(inv.classlevels), inv.floors = JSON.parse(inv.floors);
                if (!inv.chars.length) return interaction.editReply(interaction.user.id === interaction.user.id ? "You don't have any characters" : `${interaction.user.username} has no characters`);
                stats.ref = inv.ref[stats.battlechar];
                stats.classlevels = inv.classlevels;

                // Floor
                if (inv.floors[Object.keys(inv.floors)[Object.keys(inv.floors).length - 1]] >= 20 && Object.keys(inv.floors)[Object.keys(inv.floors).length - 1] !== 100) inv.floors[1 + parseInt(Object.keys(inv.floors)[Object.keys(inv.floors).length - 1])] = 0;
                if (inv.floors[Object.keys(inv.floors)[Object.keys(inv.floors).length - 1]] >= 1 && Object.keys(inv.floors)[Object.keys(inv.floors).length - 1] % 5 == 0 && Object.keys(inv.floors)[Object.keys(inv.floors).length - 1] !== 100) inv.floors[1 + parseInt(Object.keys(inv.floors)[Object.keys(inv.floors).length - 1])] = 0;
                stats.floor = parseInt(Object.keys(inv.floors)[Object.keys(inv.floors).length - 1]);

                // Char Stats
                stats.stats = await getDetailedStats(stats.battlechar, inv, stats.classlevels);

                // Thumbnail
                if (stats.favchar !== null) stats.thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[interaction.user.id]?.cimg[stats.favchar], inv.skin[stats.favchar]);

                // Preview
                const cachedImages = {};
                if (background.set.assets[currPage - 1].asset.fileType !== "gif") {
                    cachedImages[currPage - 1] ||= await getProfileImage(interaction.user, stats);
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
                        if (r.customId === "buy" || r.customId === "buy-set") {
                            const content = (r.customId === "buy") ? `Are you sure you want to buy the **${background.set.assets[currPage - 1].name}** background?\nPlease choose the currency you'd like to pay in to proceed` : `Are you sure you want to buy the **${background.set.name}** background set?\nPlease choose the currency you'd like to pay in to proceed`;
                            const components = (r.customId === "buy") ? [buyRow(background.set.assets[currPage - 1])] : [buySetRow(background.set.assets[currPage - 1])];
                            interaction.followUp({ content, components }).then(ms => {
                                const buyCollector = ms.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                                buyCollector.on('collect', async rr => {
                                    const { 0: tempStats } = await query(`SELECT backgrounds, coins, gems, lilies, jades FROM users WHERE id = ${interaction.user.id}`);
                                    if (!tempStats) return interaction.editReply("You haven't started playing yet.");
                                    tempStats.backgrounds = JSON.parse(tempStats.backgrounds);

                                    let cost, bgid;
                                    if (rr.customId.startsWith("set")) {
                                        rr.customId = rr.customId.split("-")[1];
                                        cost = background.set.cost[rr.customId];
                                        bgid = `${background.set.id}`;
                                    } else {
                                        cost = background.set.assets[currPage - 1].cost[rr.customId];
                                        bgid = `${background.set.id}.${currPage - 1}`;
                                    };

                                    // Return if balance not enough
                                    if (tempStats[rr.customId] < cost) {
                                        ms.edit({ content: `You don't have enough ${rr.customId} (**${tempStats[rr.customId]}**/${cost} ${emojis[rr.customId]})`, components: [] });
                                        return;
                                    };

                                    // Add background
                                    tempStats.backgrounds.push(bgid);
                                    stats.backgrounds.push(bgid);

                                    // Remove currency, add background
                                    await query(`UPDATE users SET ${rr.customId} = ${rr.customId} - ${cost}, background = '${`${background.set.id}.${currPage - 1}`}', backgrounds = '${JSON.stringify(tempStats.backgrounds)}' WHERE id = ${interaction.user.id}`);

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
                            cachedImages[currPage - 1] ||= await getProfileImage(interaction.user, stats);
                        };

                        Embed.setTitle(background.set.assets[currPage - 1].name.slice(0, 40))
                            .setDescription(`**Set**: ${background.set.name}\n**Obtain**: ${background.set.assets[currPage - 1].obtain.length ? background.set.assets[currPage - 1].obtain.join(", ") : "`None`"}`)
                            .setImage(background.set.assets[currPage - 1].asset.url)
                            .setThumbnail(cachedImages[currPage - 1] ? `attachment://profile.${background.set.assets[currPage - 1].asset.fileType === "gif" ? "gif" : "jpg"}` : null)
                            .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                        interaction.editReply({ embeds: [Embed], components: [getPageRow(background.set.assets[currPage - 1], cachedImages, stats)], files: cachedImages[currPage - 1] ? [cachedImages[currPage - 1]] : [] });
                    });
                });
            });
        };

        if (subcommand === "select") {
            const name = interaction.options.getString('name');

            const background = searchBackground(name, interaction);
            if (!background) return;

            db.serialize(async () => {
                await interaction.deferReply().catch(() => {
                    return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
                });

                const { 0: stats } = await query(`SELECT background, backgrounds, favchar, xp, coins, bank, gems, background, lastdaily, battlechar, class, aboutme, profilecolor, arenawins, arenalosses, lilies, achievements, items, premium, guild, party, shield_slot FROM users WHERE id = ${interaction.user.id}`);
                if (!stats) return interaction.editReply("You haven't started playing yet.");
                stats.backgrounds = JSON.parse(stats.backgrounds);
                stats.backgrounds.push("0"); // Free BGs
                stats.background = `${background.set.id}.${background.id}`;
                stats.achievements = JSON.parse(stats.achievements);
                stats.items = JSON.parse(stats.items);
                stats.quality = "thumbnail";
                stats.forceStatic = true;

                // Return if not owned
                if (!stats.backgrounds.includes(`${background.set.id}`) && !stats.backgrounds.includes(`${background.set.id}.${background.id}`)) return interaction.editReply(`You don't have the background "**${background.name}**"`);

                // Update
                await query(`UPDATE users SET background = '${`${background.set.id}.${background.id}`}' WHERE id = ${interaction.user.id}`);

                const { 0: inv } = await query(`SELECT characters.chars, characters.ref, users.level, users.equipment, characters.skin, dungeon.classes, dungeon.classlevels, dungeon.floors FROM characters JOIN users ON characters.id = users.id JOIN dungeon ON characters.id = dungeon.id WHERE characters.id = ${interaction.user.id}`);
                inv.id = interaction.user.id, inv.class = stats.class, inv.premium = stats.premium, inv.bank = stats.bank, inv.shield_slot = stats.shield_slot, inv.chars = JSON.parse(inv.chars), inv.ref = JSON.parse(inv.ref), inv.skin = JSON.parse(inv.skin), inv.equipment = JSON.parse(inv.equipment), inv.classes = JSON.parse(inv.classes), inv.classlevels = JSON.parse(inv.classlevels), inv.floors = JSON.parse(inv.floors);
                if (!inv.chars.length) return interaction.editReply(interaction.user.id === interaction.user.id ? "You don't have any characters" : `${interaction.user.username} has no characters`);
                stats.ref = inv.ref[stats.battlechar];
                stats.classlevels = inv.classlevels;

                // Floor
                if (inv.floors[Object.keys(inv.floors)[Object.keys(inv.floors).length - 1]] >= 20 && Object.keys(inv.floors)[Object.keys(inv.floors).length - 1] !== 100) inv.floors[1 + parseInt(Object.keys(inv.floors)[Object.keys(inv.floors).length - 1])] = 0;
                if (inv.floors[Object.keys(inv.floors)[Object.keys(inv.floors).length - 1]] >= 1 && Object.keys(inv.floors)[Object.keys(inv.floors).length - 1] % 5 == 0 && Object.keys(inv.floors)[Object.keys(inv.floors).length - 1] !== 100) inv.floors[1 + parseInt(Object.keys(inv.floors)[Object.keys(inv.floors).length - 1])] = 0;
                stats.floor = parseInt(Object.keys(inv.floors)[Object.keys(inv.floors).length - 1]);

                // Char Stats
                stats.stats = await getDetailedStats(stats.battlechar, inv, stats.classlevels);

                // Thumbnail
                if (stats.favchar !== null) stats.thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[interaction.user.id]?.cimg[stats.favchar], inv.skin[stats.favchar]);

                // Preview
                const profileImage = await getProfileImage(interaction.user, stats);

                const Embed = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setDescription(`Now using: **${background.name}**\nFrom set: **${background.set.name}**`)
                    .setImage(background.asset.url)
                    // .setThumbnail(`attachment://profile.${background.asset.fileType === "gif" ? "gif" : "jpg"}`);
                    .setThumbnail(`attachment://profile.jpg`);
                return interaction.editReply({ embeds: [Embed], files: [profileImage] });
            });

        };

    },
};
