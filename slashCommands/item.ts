import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } from "discord.js";
import { armorInfo, chestInfo, fishInfo, itemInfo, items, lootInfo, weaponInfo } from "../Modules/items";
import { searchItem, showPage, customEmojis, getAscensionMaterial, getItemLevel } from "../Modules/functions";
import { PageRow, OfferRow } from "../Modules/components";
import { characters } from "../Modules/chars";
import { ItemCategory, ItemRarity, ItemType, SlashCommand } from "../types";
import { getUserSchema, getWeaponCount, getWeaponSchema, updateUsers, updateWeapons } from "../Modules/queries";

function getAscension(lvl: number) {
    let asc = "";
    switch (lvl) {
        case 0: asc = "<:empty_star:986912448512688148>".repeat(5); break;
        case 1: asc = "<:half_embeded_star:986912446956584960>" + "<:empty_star:986912448512688148>".repeat(4); break;
        case 2: asc = "<:embeded_star:986912452333699072>" + "<:empty_star:986912448512688148>".repeat(4); break;
        case 3: asc = "<:embeded_star:986912452333699072>" + "<:half_embeded_star:986912446956584960>" + "<:empty_star:986912448512688148>".repeat(3); break;
        case 4: asc = "<:embeded_star:986912452333699072>".repeat(2) + "<:empty_star:986912448512688148>".repeat(3); break;
        case 5: asc = "<:embeded_star:986912452333699072>".repeat(2) + "<:half_embeded_star:986912446956584960>" + "<:empty_star:986912448512688148>".repeat(2); break;
        case 6: asc = "<:embeded_star:986912452333699072>".repeat(3) + "<:empty_star:986912448512688148>".repeat(2); break;
        case 7: asc = "<:embeded_star:986912452333699072>".repeat(3) + "<:half_embeded_star:986912446956584960>" + "<:empty_star:986912448512688148>"; break;
        case 8: asc = "<:embeded_star:986912452333699072>".repeat(4) + "<:empty_star:986912448512688148>"; break;
        case 9: asc = "<:embeded_star:986912452333699072>".repeat(4) + "<:half_embeded_star:986912446956584960>"; break;
        case 10: asc = "<:embeded_star:986912452333699072>".repeat(5); break;
        case 11: asc = "<:awakened_star:1047516493312704592>" + "<:embeded_star:986912452333699072>".repeat(4); break;
        case 12: asc = "<:awakened_star:1047516493312704592>".repeat(2) + "<:embeded_star:986912452333699072>".repeat(3); break;
        case 13: asc = "<:awakened_star:1047516493312704592>".repeat(3) + "<:embeded_star:986912452333699072>".repeat(2); break;
        case 14: asc = "<:awakened_star:1047516493312704592>".repeat(4) + "<:embeded_star:986912452333699072>"; break;
        case 15: asc = "<:awakened_star:1047516493312704592>".repeat(5); break;
        default: asc = "<:empty_star:986912448512688148>".repeat(5); break;
    };
    return asc;
};

function list(grade: ItemRarity, show: itemInfo[]) {
    const arr = [], t = show.filter((b) => b.grade === grade);
    for (let h = 0; h < t.length; h++) {
        arr.push(t[h].bar + t[h].emoji + " | " + t[h].name);
    };
    return arr;
};

function itemsToShow(show: itemInfo[]) {
    let desc = "";
    if (show.find((e) => e.grade === "genesis")) desc += "\n\n<:genesis1:1041725784546619502><:genesis2:1041725782176825485><:genesis3:1041725778611675237><:genesis4:1041725780218093629>\n" + list("genesis", show).join("\n");
    if (show.find((e) => e.grade === "mythical")) desc += "\n\n<:mythical1:1041726768530329690><:mythical2:1041726767188168724><:mythical3:1041726765577556039><:mythical4:1041726763862065162>\n" + list("mythical", show).join("\n");
    if (show.find((e) => e.grade === "legendary")) desc += "\n\n<:legendary1:1041726519082491964><:legendary2:1041726517153112094><:legendary3:1041726515475382322><:legendary4:1041726512992366605>\n" + list("legendary", show).join("\n");
    if (show.find((e) => e.grade === "unique")) desc += "\n\n<:unique1:1041730066272493578><:unique2:1041730063940468828><:unique3:1041730061163831437><:unique4:1041730057380573386>\n" + list("unique", show).join("\n");
    if (show.find((e) => e.grade === "rare")) desc += "\n\n<:rare1:1041731092031492106><:rare2:1041731088357281802><:rare3:1041731083965825096>\n" + list("rare", show).join("\n");
    if (show.find((e) => e.grade === "special")) desc += "\n\n<:special1:1041731419963150397><:special2:1041731418008600717><:special3:1041731415919833149><:special4:1041731414032392202>\n" + list("special", show).join("\n");
    if (show.find((e) => e.grade === "normal")) desc += "\n\n<:normal1:1041732429397889054><:normal2:1041732425379762268><:normal3:1041732422145953892><:normal4:1041732419591622686>\n" + list("normal", show).join("\n");
    return desc;
};

let gradeBar = {
    "normal": "<:normal1:1041732429397889054><:normal2:1041732425379762268><:normal3:1041732422145953892><:normal4:1041732419591622686>",
    "special": "<:special1:1041731419963150397><:special2:1041731418008600717><:special3:1041731415919833149><:special4:1041731414032392202>",
    "rare": "<:rare1:1041731092031492106><:rare2:1041731088357281802><:rare3:1041731083965825096><:blank:917804200363171860>",
    "unique": "<:unique1:1041730066272493578><:unique2:1041730063940468828><:unique3:1041730061163831437><:unique4:1041730057380573386>",
    "legendary": "<:legendary1:1041726519082491964><:legendary2:1041726517153112094><:legendary3:1041726515475382322><:legendary4:1041726512992366605>",
    "mythical": "<:mythical1:1041726768530329690><:mythical2:1041726767188168724><:mythical3:1041726765577556039><:mythical4:1041726763862065162>",
    "genesis": "<:genesis1:1041725784546619502><:genesis2:1041725782176825485><:genesis3:1041725778611675237><:genesis4:1041725780218093629>",
};

function totalXP(matsToUse: { [key: string]: { use: number; }; }) {
    return Object.entries(matsToUse).reduce((total, e) => total + (e[1].use * parseInt(e[0])), 0);
};

function missingXP(xp: number, level: number) {
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += Math.floor(20 * Math.pow(i, 1.290349));
    };
    return total - xp;
};

const exportCommand: SlashCommand = {
    name: 'item',
    async execute({ interaction, author }) {

        const subcommand = interaction.options.getSubcommand();

        // Item info
        if (subcommand === "info") {
            const choices = interaction.options.getString('items', true);
            const flag = interaction.options.getString('flag', true) as "base" | "my";
            const user = interaction.options.getUser('user') ?? interaction.user;

            const Embeds: EmbedBuilder[] = [];

            for (const choice of choices.split(",").filter((s) => s).map((s) => s.trim())) {
                if (flag === "my") {
                    const item = await getWeaponSchema(`${choice}:${user.id}`);
                    if (!item) continue;
                    item.level = getItemLevel(item.level);
                    const fItem = items[item.itemid];

                    const Embed = new EmbedBuilder()
                        .setColor(0xbbffff)
                        .setTitle(fItem.name)
                        .setThumbnail(fItem.image)
                        .setFooter({ text: `ID: #${fItem.id}` });

                    if (fItem instanceof weaponInfo) {
                        let pstat = 0, sstat = 0;

                        // Primary Stat
                        if (["atk%", "md%", "cr", "cd", "dodge", "br"].includes(fItem.primaryStat)) {
                            if (fItem.primaryStat.endsWith("%")) {
                                pstat += (1 + Math.floor(fItem.psmin + ((fItem.psmax - fItem.psmin) / 150) * ((item.level - 1) + (item.ascension * 3))) / 100);
                            } else {
                                pstat += (fItem.psmin + ((fItem.psmax - fItem.psmin) * ((item.level - 1) + (item.ascension * 3)) / 150)) / 100;
                            };
                        } else {
                            pstat += Math.floor(fItem.psmin + ((fItem.psmax - fItem.psmin) / 150) * ((item.level - 1) + (item.ascension * 3)));
                        };
                        // Secondary Stat
                        if (["atk%", "md%", "cr", "cd", "dodge", "br"].includes(fItem.secondaryStat)) {
                            if (fItem.secondaryStat.endsWith("%")) {
                                sstat += (Math.floor(parseInt(fItem.ssmin.slice(0, -1)) + ((parseInt(fItem.ssmax.slice(0, -1)) - parseInt(fItem.ssmin.slice(0, -1))) / 10) * item.ascension) / 100);
                            } else {
                                sstat += (parseInt(fItem.ssmin.slice(0, -1)) + ((parseInt(fItem.ssmax.slice(0, -1)) - parseInt(fItem.ssmin.slice(0, -1))) * item.ascension / 10)) / 100;
                            };
                        } else {
                            sstat += Math.floor(parseInt(fItem.ssmin) + ((parseInt(fItem.ssmax) - parseInt(fItem.ssmin)) / 10) * item.ascension);
                        };

                        Embed.setDescription(`**Grade**: ${fItem.gradeEmote}\n**Type**: ${fItem.type[0].toUpperCase() + fItem.type.slice(1)}\n**Level**: ${"**" + item.level + "**/" + ((item.ascension * 10) + 20) + " ➜ " + getAscension(item.ascension)}\n\n**Primary Stat**: ${pstat} ${customEmojis[fItem.primaryStat] || fItem.primaryStat}\n**Secondary Stat**: ${sstat < 1 ? Math.round(sstat * 100) + "%" : sstat} ${customEmojis[fItem.secondaryStat] || fItem.secondaryStat}\n\n**Passive**: ${fItem.buffdesc}`);
                        Embeds.push(Embed);
                    } else if (fItem instanceof armorInfo) {
                        const set = items.filter((e) => ((e instanceof armorInfo) && (e.setname === fItem.setname))) as armorInfo[];

                        let pstat = 0;
                        pstat += Math.floor(fItem.psmin + ((fItem.psmax - fItem.psmin) / 150) * ((item.level - 1) + (item.ascension * 3)));

                        Embed.setDescription(`**Grade**: ${fItem.gradeEmote}\n**Type**: ${fItem.type[0].toUpperCase() + fItem.type.slice(1)}\n**Level**: ${"**" + item.level + "**/" + ((item.ascension * 10) + 20) + " ➜ " + getAscension(item.ascension)}\n\n**${fItem.setname}**: ${set[0].emoji + set[1].emoji + set[2].emoji + set[3].emoji}\n**Primary Stat**: ${pstat} ${customEmojis[fItem.primaryStat] || fItem.primaryStat}\n\n**Set Bonus**: ${set[3].buffdesc}`);
                        Embeds.push(Embed);
                    };
                } else {
                    const fItem = searchItem(choice, interaction, true, { returnSet: true });
                    if (!fItem?.name) continue;

                    const Embed = new EmbedBuilder()
                        .setColor(0xbbffff)
                        .setTitle(fItem.name)
                        .setThumbnail(fItem.image)
                        .setFooter({ text: `ID: #${fItem.id}` });

                    if (fItem instanceof weaponInfo) {
                        const count = await getWeaponCount(fItem.id);
                        Embed.setDescription(`**Grade**: ${fItem.gradeEmote}\n**Type**: ${fItem.type[0].toUpperCase() + fItem.type.slice(1)}\n**Obtain**: ${fItem.obtain.length ? fItem.obtain.join(", ") : "None"}\n**Crafts in existence**: ${count}\n\n**Primary Stat**: \`${fItem.psmin}-${fItem.psmax}\` ${customEmojis[fItem.primaryStat] || fItem.primaryStat}\n**Secondary Stat**: \`${fItem.ssmin.endsWith("%") ? fItem.ssmin.slice(0, -1) : fItem.ssmin}-${fItem.ssmax}\` ${customEmojis[fItem.secondaryStat] || fItem.secondaryStat}\n\n**Passive**: ${fItem.buffdesc}\n\n>>> ${fItem.flair}`);
                        Embeds.push(Embed);
                    } else if (fItem instanceof armorInfo) {
                        const count = await getWeaponCount(fItem.id);
                        const set = items.filter((e) => ((e instanceof armorInfo) && (e.setname === fItem.setname))) as armorInfo[];
                        Embed.setDescription(`**Grade**: ${fItem.gradeEmote}\n**Type**: ${fItem.type[0].toUpperCase() + fItem.type.slice(1)}\n**Obtain**: ${fItem.obtain.length ? fItem.obtain.join(", ") : "None"}\n**${fItem.setname}**: ${set[0].emoji + set[1].emoji + set[2].emoji + set[3].emoji}\n**Crafts in existence**: ${count}\n\n**Primary Stat**: \`${fItem.psmin}-${fItem.psmax}\` ${customEmojis[fItem.primaryStat] || fItem.primaryStat}\n\n**Set Bonus**: ${set[3].buffdesc}`);
                        Embeds.push(Embed);
                    } else if (fItem instanceof fishInfo) {
                        Embed.setDescription(`**Grade**: ${fItem.gradeEmote}\n**Type**: ${fItem.type[0].toUpperCase() + fItem.type.slice(1)}\n**Obtain**: ${fItem.obtain.length ? fItem.obtain.join(", ") : "None"}`);
                        Embeds.push(Embed);
                    } else if (fItem instanceof chestInfo) {
                        Embed.setDescription(`**Grade**: ${fItem.gradeEmote}\n**Type**: ${fItem.type[0].toUpperCase() + fItem.type.slice(1)}\n**Obtain**: ${fItem.obtain.length ? fItem.obtain.join(", ") : "None"}\n**Drops**: ${fItem.drops}\n\n**Drop Rates**:\n${Object.entries(fItem.droprates).map((e) => `${gradeBar[e[0] as ItemRarity]} ➜ **${e[1]}**% per drop / **${Math.round((1 - Math.pow((100 - e[1]) / 100, fItem.drops)) * 10000) / 100}**% per chest`).join("\n")}`);
                        Embeds.push(Embed);
                    } else if (fItem instanceof lootInfo) {
                        Embed.setDescription(`**Grade**: ${fItem.gradeEmote}\n**Type**: ${fItem.type}\n**Obtain**: ${fItem.obtain.length ? fItem.obtain.join(", ") : "None"}\n\n${fItem.desc}`);
                        Embeds.push(Embed);
                    };
                };
            };
            if (Embeds.length === 0) return interaction.reply({ content: `No matches found for the ${choices.split(",").length === 1 ? "item" : "items"} ${choices.split(",").filter((s) => s).map((s) => "`" + s.trim() + "`").join(", ")}`, ephemeral: true });

            let currPage = 1;
            if (Embeds.length === 1) return interaction.reply({ embeds: [Embeds[currPage - 1]] });
            return interaction.reply({ embeds: [Embeds[currPage - 1]], components: [PageRow] }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', async r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = Embeds.length;
                    } else {
                        if (currPage < Embeds.length) currPage++;
                        else currPage = 1;
                    };

                    interaction.editReply({ embeds: [Embeds[currPage - 1]] });
                });
            });
        };

        // Item List
        if (subcommand === "list") {
            const type = interaction.options.getString('type', true);
            const page = interaction.options.getInteger('page') || 1;

            let itemsR: itemInfo[];
            if (type === "weapons") itemsR = items.filter((e) => e.category === "weapon");
            else if (type === "armor") itemsR = items.filter((e) => e.category === "armor");
            else if (type === "loot") itemsR = items.filter((e) => e.category === "loot");
            else itemsR = items.filter((e) => e.type === type);

            // Sort elements
            itemsR.sort((a, b) => b.gradeValue - a.gradeValue);

            // Setup Pages
            const elementsPerPage = 10;
            const pagesTotal = Math.ceil(itemsR.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            // Filter items to show on the current page
            let showItems = showPage(currPage, itemsR, elementsPerPage);

            // Join elements to string
            let desc = itemsToShow(showItems);

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setAuthor({ name: `List of Items (${type})` })
                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                .setDescription("Use `/item info <name or ID>` for more information" + desc)
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            if (pagesTotal === 1) return interaction.reply({ embeds: [Embed] });
            return interaction.reply({ embeds: [Embed], components: [PageRow] }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', async r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    showItems = showPage(currPage, itemsR, elementsPerPage);
                    desc = itemsToShow(showItems);

                    Embed.setDescription("Use `/item info <name or ID>` for more information" + desc).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed], components: [PageRow] });
                });
            });
        };

        // Item Levelup
        if (subcommand === "levelup") {
            const itemChoice = interaction.options.getString('id');
            const flag = interaction.options.getString('flag');

            const item = await getWeaponSchema(`${itemChoice}:${interaction.user.id}`);
            if (!item) return interaction.reply(`Couldn't find item with id \`${itemChoice}\``);
            const fItem = items[item.itemid];

            const stats = author.schema;

            const limit = (item.ascension * 10) + 20;
            let currLevel = getItemLevel(item.level);
            if (currLevel === 170) return interaction.reply(`You have reached the maximum level.`);

            // Separate ascension and levelup
            if (currLevel === limit) {
                // Ascend
                const ascItem = getAscensionMaterial(fItem.id, items.filter((e) => e.type === "ascension material"));
                const craftItem = items.find((e) => e.type === "crafting material" && e.grade === fItem.grade) as lootInfo;
                const awakenItem = items[683];
                const ascMatsNeeded = (item.ascension + 4) * 12;
                const craftMatsNeeded = (item.ascension + 4) * 8;
                const awakenItemNeeded = currLevel < 120 ? 0 : (item.ascension - 9) * 16;

                // Check if the user has the required mats
                if ((stats.items[ascItem.id] || 0) < ascMatsNeeded) return interaction.reply(`You don't have enough of ${ascItem.emoji} **__${ascItem.name}__** (**${stats.items[ascItem.id] || 0}**/${ascMatsNeeded})`);
                if ((stats.items[craftItem.id] || 0) < craftMatsNeeded) return interaction.reply(`You don't have enough of ${craftItem.emoji} **__${craftItem.name}__** (**${stats.items[craftItem.id] || 0}**/${craftMatsNeeded})`);
                if ((stats.items[awakenItem.id] || 0) < awakenItemNeeded) return interaction.reply(`You don't have enough of ${awakenItem.emoji} **__${awakenItem.name}__** (**${stats.items[awakenItem.id] || 0}**/${awakenItemNeeded})`);

                const Embed = new EmbedBuilder()
                    .setTitle(fItem.name)
                    .setColor(0xbbffff)
                    .setDescription(`Do you want to ascend **__${fItem.name}__** to ${getAscension(item.ascension + 1)} for ${awakenItemNeeded ? `${awakenItem.emoji}x${awakenItemNeeded}, ` : ""}${craftItem.emoji}x${craftMatsNeeded} and ${ascItem.emoji}x${ascMatsNeeded}?`)
                    .setThumbnail(fItem.image);
                interaction.reply({ embeds: [Embed], components: [OfferRow] }).then(msg => {

                    const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                    const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                    confirm.on('collect', async () => {
                        confirm.stop(), cancel.stop();
                        const stats = await getUserSchema(interaction.user.id);
                        if (!stats) return;

                        // Check if the user has the required mats
                        if ((stats.items[ascItem.id] || 0) < ascMatsNeeded) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough of ${ascItem.emoji} **__${ascItem.name}__** (**${stats.items[ascItem.id] || 0}**/${ascMatsNeeded})`);
                            return;
                        };
                        if ((stats.items[craftItem.id] || 0) < craftMatsNeeded) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough of ${craftItem.emoji} **__${craftItem.name}__** (**${stats.items[craftItem.id] || 0}**/${craftMatsNeeded})`);
                            return;
                        };
                        if ((stats.items[awakenItem.id] || 0) < awakenItemNeeded) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough of ${awakenItem.emoji} **__${awakenItem.name}__** (**${stats.items[awakenItem.id] || 0}**/${awakenItemNeeded})`);
                            return;
                        };

                        const item = await getWeaponSchema(`${itemChoice}:${interaction.user.id}`);
                        if (!item) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`An error occured, please try again.`);
                            return;
                        };
                        if (currLevel !== ((item.ascension * 10) + 20)) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`You need to level up your weapon first.`);
                            return;
                        };

                        // Update users table
                        await updateUsers(interaction.user.id, {
                            items: {
                                type: "merge_json", value: {
                                    [ascItem.id]: -ascMatsNeeded,
                                    [craftItem.id]: -craftMatsNeeded,
                                    [awakenItem.id]: -awakenItemNeeded,
                                },
                            },
                        });

                        // Update weapons table
                        await updateWeapons(`${itemChoice}:${interaction.user.id}`, {
                            ascension: { type: "increment", value: 1 },
                        });

                        if (interaction.channel?.isSendable()) interaction.channel.send(`Successfully ascended ${fItem.emoji} **__${fItem.name}__**!`);
                    });

                    cancel.on('collect', () => {
                        confirm.stop(), cancel.stop();
                        if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                    });
                });
            } else {
                const matsToUse = {
                    "20": {
                        "id": 50 + (fItem.category === "armor" ? 1 : 0),
                        "use": 0
                    },
                    "100": {
                        "id": 52 + (fItem.category === "armor" ? 1 : 0),
                        "use": 0
                    },
                    "500": {
                        "id": 54 + (fItem.category === "armor" ? 1 : 0),
                        "use": 0
                    },
                    "2500": {
                        "id": 56 + (fItem.category === "armor" ? 1 : 0),
                        "use": 0
                    },
                };

                let xpSelected = totalXP(matsToUse);

                if (flag === "max") {
                    const corners = ['2500', '500', '100', '20'] as const;
                    corners.forEach((r) => {
                        while (!((!(stats.items[matsToUse[r].id] > 0 + matsToUse[r].use)) || missingXP(item.level + xpSelected, limit) === 0)) {
                            matsToUse[r].use++;
                            xpSelected = totalXP(matsToUse);
                            if (missingXP(item.level + xpSelected, limit) < 0) xpSelected += missingXP(item.level + xpSelected, limit);
                            currLevel = getItemLevel(item.level + xpSelected);
                        };
                    });
                };

                const rowComponents = [
                    new ButtonBuilder()
                        .setCustomId('20')
                        .setEmoji(fItem.category === "weapon" ? '<:common_weapon_levelup_material:1047535549814165535>' : '<:common_armor_levelup_material:1047535557204508803>')
                        .setLabel('+20xp')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled((!(stats.items[matsToUse['20'].id] > 0 + matsToUse['20'].use)) || missingXP(item.level + xpSelected, limit) === 0),
                    new ButtonBuilder()
                        .setCustomId('100')
                        .setEmoji(fItem.category === "weapon" ? '<:rare_weapon_levelup_material:1047535563525328946>' : '<:rare_armor_levelup_material:1047535578855522444>')
                        .setLabel('+100xp')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled((!(stats.items[matsToUse['100'].id] > 0 + matsToUse['100'].use)) || missingXP(item.level + xpSelected, limit) === 0),
                    new ButtonBuilder()
                        .setCustomId('500')
                        .setEmoji(fItem.category === "weapon" ? '<:mythical_weapon_levelup_material:1047535585117618196>' : '<:mythical_armor_levelup_material:1047535597180432485>')
                        .setLabel('+500xp')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled((!(stats.items[matsToUse['500'].id] > 0 + matsToUse['500'].use)) || missingXP(item.level + xpSelected, limit) === 0),
                    new ButtonBuilder()
                        .setCustomId('2500')
                        .setEmoji(fItem.category === "weapon" ? '<:divine_weapon_levelup_material:1047535604403015700>' : '<:divine_armor_levelup_material:1047535613487890483>')
                        .setLabel('+2500xp')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled((!(stats.items[matsToUse['2500'].id] > 0 + matsToUse['2500'].use)) || missingXP(item.level + xpSelected, limit) === 0),
                ];

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...rowComponents);
                const row2 = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirm')
                            .setEmoji('<:check_icon:683671903143067743>')
                            .setLabel('confirm')
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(!xpSelected),
                        new ButtonBuilder()
                            .setCustomId('cancel')
                            .setEmoji('<:stop_icon:683671917353369600>')
                            .setLabel('cancel')
                            .setStyle(ButtonStyle.Danger),
                    );

                const Embed = new EmbedBuilder()
                    .setTitle(fItem.name)
                    .setColor(0xbbffff)
                    .setDescription(`**Current Level**: **${currLevel}**/${limit} ➜ ${getAscension(item.ascension)}\n**XP selected**: ${xpSelected}\n**XP left**: ${currLevel + 1 >= limit ? "" : `__${missingXP(item.level + xpSelected, currLevel + 1)}__ for level ${currLevel + 1}, `}__${missingXP(item.level + xpSelected, limit)}__ for level ${limit}`)
                    .setThumbnail(fItem.image);
                interaction.reply({ embeds: [Embed], components: [row, row2] }).then(msg => {

                    const addXP = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && ['20', '100', '500', '2500'].includes(r.customId), componentType: ComponentType.Button, time: 90000 });
                    const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 90000 });
                    const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 90000 });

                    addXP.on('collect', r => {
                        matsToUse[r.customId as keyof typeof matsToUse].use++;
                        xpSelected = totalXP(matsToUse);
                        if (missingXP(item.level + xpSelected, limit) < 0) xpSelected += missingXP(item.level + xpSelected, limit);
                        currLevel = getItemLevel(item.level + xpSelected);

                        // Disable Buttons
                        rowComponents[0].setDisabled((!(stats.items[matsToUse['20'].id] > 0 + matsToUse['20'].use)) || missingXP(item.level + xpSelected, limit) === 0);
                        rowComponents[1].setDisabled((!(stats.items[matsToUse['100'].id] > 0 + matsToUse['100'].use)) || missingXP(item.level + xpSelected, limit) === 0);
                        rowComponents[2].setDisabled((!(stats.items[matsToUse['500'].id] > 0 + matsToUse['500'].use)) || missingXP(item.level + xpSelected, limit) === 0);
                        rowComponents[3].setDisabled((!(stats.items[matsToUse['2500'].id] > 0 + matsToUse['2500'].use)) || missingXP(item.level + xpSelected, limit) === 0);

                        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...rowComponents);

                        Embed.setDescription(`**Current Level**: **${currLevel}**/${limit} ➜ ${getAscension(item.ascension)}\n**XP selected**: ${xpSelected}\n**XP left**: ${currLevel + 1 >= limit ? "" : `__${missingXP(item.level + xpSelected, currLevel + 1)}__ for level ${currLevel + 1}, `}__${missingXP(item.level + xpSelected, limit)}__ for level ${limit}`);
                        interaction.editReply({ embeds: [Embed], components: [row, OfferRow] });
                    });

                    confirm.on('collect', async () => {
                        addXP.stop(), confirm.stop(), cancel.stop();

                        const stats = await getUserSchema(interaction.user.id);
                        if (!stats) return;

                        if (stats.items[matsToUse['20'].id] < matsToUse['20'].use || stats.items[matsToUse['100'].id] < matsToUse['100'].use || stats.items[matsToUse['500'].id] < matsToUse['500'].use || stats.items[matsToUse['2500'].id] < matsToUse['2500'].use) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough levelup materials.`);
                            return;
                        };

                        const item = await getWeaponSchema(`${itemChoice}:${interaction.user.id}`);
                        if (!item) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`Couldn't find item with id \`${itemChoice}\``);
                            return;
                        };

                        const limit = (item.ascension * 10) + 20;
                        let newCurrLevel = getItemLevel(item.level);
                        if (newCurrLevel === 170) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`You have reached the maximum level.`);
                            return;
                        };
                        if (newCurrLevel >= limit) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`You have reached the current level cap, please ascend your item first if possible.`);
                            return;
                        };

                        // Update users table
                        await updateUsers(interaction.user.id, {
                            items: {
                                type: "merge_json", value: {
                                    [matsToUse['20'].id]: -matsToUse['20'].use,
                                    [matsToUse['100'].id]: -matsToUse['100'].use,
                                    [matsToUse['500'].id]: -matsToUse['500'].use,
                                    [matsToUse['2500'].id]: -matsToUse['2500'].use,
                                },
                            },
                        });

                        // Update weapons table
                        await updateWeapons(`${itemChoice}:${interaction.user.id}`, {
                            level: { type: "increment", value: xpSelected },
                        });

                        interaction.editReply({ components: [] });
                        if (interaction.channel?.isSendable()) interaction.channel.send(`Leveled ${fItem.emoji} __**${fItem.name}**__ up to level **${currLevel}**!`);
                    });

                    cancel.on('collect', () => {
                        addXP.stop(), confirm.stop(), cancel.stop();
                        interaction.editReply({ components: [] });
                    });

                });
            };
        };

        // Item Equip
        // if (subcommand === "equip") {
        //     const itemChoice = interaction.options.getString('item', true);

        //     const stats = author.schema;
        //     if (!stats.battlechar) return interaction.reply(`You don't have a battle character selected, please use \`/select\` to do so`);

        //     const item = await getWeaponSchema(`${itemChoice}:${interaction.user.id}`);

        //     // Lria's Masks
        //     if (["remove mask", "verdant mask", "phantasmal mask", "valkyrie mask"].includes(itemChoice.toLowerCase())) {
        //         if (itemChoice.toLowerCase() === "remove mask") delete stats.equipment["mask"];
        //         else stats.equipment["mask"] = itemChoice.toLowerCase().split(" ")[0];

        //         // Update users table
        //         await updateUsers(interaction.user.id, {
        //             equipment: { type: "set", value: stats.equipment },
        //         });

        //         return interaction.reply(itemChoice.toLowerCase() === "remove mask" ? "Unequipped **Lria**'s mask" : `Equipped **Lria** <a:EXTRA:1138530846144462968> with the **__${itemChoice.toLowerCase()}__**`);
        //     };

        //     if (item) {
        //         const fItem = items[item.itemid];

        //         let type: ItemCategory | ItemType = fItem.category;
        //         if (type === "armor" || fItem.type === "shield") type = fItem.type;
        //         if (type === "shield" && (stats.premium < 4 && stats.shield_slot === 0)) type = "weapon";

        //         // Assign weapon
        //         stats.equipment[type] = `${itemChoice}:${interaction.user.id}`;

        //         // Update users table
        //         await updateUsers(interaction.user.id, {
        //             equipment: { type: "set", value: stats.equipment },
        //         });

        //         return interaction.reply(`Equipped **${characters[stats.battlechar].name}** with ${fItem.emoji} **__${fItem.name}__**`);
        //     };

        //     const fItem = searchItem(itemChoice, interaction);
        //     if (!fItem?.name) return;

        //     return interaction.reply(`Please use the weapons id instead of name. You can find the id with \`/items\``);
        // };

        // Item Equip
        if (subcommand === "equip") {
            const itemChoices = [...new Set(interaction.options.getString('items', true).split(",").map((e) => e.trim()))].filter(Boolean);

            const stats = author.schema;
            if (!stats.battlechar) return interaction.reply(`You don't have a battle character selected, please use \`/select\` to do so`);

            const equipped: string[] = [];

            for (const itemChoice of itemChoices) {
                // Lria's Masks
                if (["remove mask", "verdant mask", "phantasmal mask", "valkyrie mask"].includes(itemChoice.toLowerCase())) {
                    if (itemChoice.toLowerCase() === "remove mask") delete stats.equipment["mask"];
                    else stats.equipment["mask"] = itemChoice.toLowerCase().split(" ")[0];

                    if (itemChoice.toLowerCase() === "remove mask") equipped.push("Unequipped **Lria**'s mask");
                    else equipped.push(`**__${itemChoice.toLowerCase()}__**`);

                    continue;
                };

                const item = await getWeaponSchema(`${itemChoice}:${interaction.user.id}`);
                if (!item) {
                    const fItem = searchItem(itemChoice, interaction);
                    if (!fItem) return;
                    return interaction.reply(`Please use your weapon's ID, not its name. You can find it in your inventory through \`/items\``);
                };

                const fItem = items[item.itemid];

                let type: ItemCategory | ItemType = fItem.category;
                if (type === "armor" || fItem.type === "shield") type = fItem.type;
                if (type === "shield" && (stats.premium < 4 && stats.shield_slot === 0)) type = "weapon";

                // Assign weapon
                stats.equipment[type] = `${itemChoice}:${interaction.user.id}`;
                equipped.push(`${fItem.emoji} **__${fItem.name}__**`);
            };

            // Update users table
            await updateUsers(interaction.user.id, {
                equipment: { type: "set", value: stats.equipment },
            });

            return interaction.reply(`Equipped **${characters[stats.battlechar].name}** with ${equipped.join(", ")}`);
        };

        // Item Unequip
        if (subcommand === "unequip") {
            const typeChoice = interaction.options.getString('type', true);

            const stats = author.schema;
            if (!stats.battlechar) return interaction.reply(`You don't have a battle character selected, please use \`/select\` to do so`);

            if (typeChoice === "all") stats.equipment = {};
            else delete stats.equipment[typeChoice];

            // Update users table
            await updateUsers(interaction.user.id, {
                equipment: { type: "set", value: stats.equipment },
            });

            return interaction.reply(`Unequipped ${typeChoice === "all" ? "items" : "item"} from **${characters[stats.battlechar].name}**`);
        };

        // Item Rename
        if (subcommand === "rename") {
            const before = interaction.options.getString('before', true);
            const after = interaction.options.getString('after', true);

            if (after.length > 5) return interaction.reply(`Item codes can't be longer than 5 characters (current length: ${after.length})`);
            const allowedChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split("");
            if (!after.split("").every((e) => allowedChars.includes(e))) return interaction.reply(`You can only use the characters a-z A-Z 0-9 - and _ in item codes.`);

            const stats = author.schema;
            if (stats.premium < 3) return interaction.reply(`This is a </premium:1011293280702578691> feature (T3+). If you enjoy playing with Camelot we'd really appreciate your support <:RaphiSmile:928370490270183485>`);

            // Check if item exists
            const existing = await getWeaponSchema(`${before}:${interaction.user.id}`);
            if (!existing) return interaction.reply(`You don't have an item with the code \`${before}\``);

            // Check if the new name already exists
            const itemCheck = await getWeaponSchema(`${after}:${interaction.user.id}`);
            if (itemCheck) return interaction.reply(`You already own an item with the code \`${after}\``);

            // Change item code
            await updateWeapons(`${before}:${interaction.user.id}`, {
                uniqueid: { type: "set", value: `${after}:${interaction.user.id}` },
            });

            // Change item code on equipped characters
            const fItem = items[existing.itemid];
            let type: ItemCategory | ItemType = fItem.category;
            if (type === "armor" || fItem.type === "shield") type = fItem.type;
            if (type === "shield" && stats.premium < 4) type = "weapon";
            if (stats.equipment[type] === `${before}:${interaction.user.id}`) stats.equipment[type] = `${after}:${interaction.user.id}`;

            // Change item in lock
            const index = stats.itemlock.indexOf(before);
            if (index !== -1) stats.itemlock[index] = after;

            // Update users table
            await updateUsers(interaction.user.id, {
                equipment: { type: "set", value: stats.equipment },
                itemlock: { type: "set", value: stats.itemlock },
            });

            return interaction.reply(`Changed code of ${items[existing.itemid].emoji} ${items[existing.itemid].name} from \`${before}\` to \`${after}\``);
        };

        // Item Lock/Unlock
        if (subcommand === "lock" || subcommand === "unlock") {
            const choice = [...new Set((interaction.options.getString('items') || "").split(",").map((e) => e.trim()))].filter(Boolean);
            if (Math.max(...choice.map((e) => e.length)) > 5) return interaction.reply(`Item codes can't be longer than 5 characters`);

            const stats = author.schema;

            if (!choice[0]) return interaction.reply(`Please select at least 1 item. You can use a comma (,) to (un)lock multiple items at once.${stats.itemlock.length ? `\n\nYour currently locked items are:\n> ${stats.itemlock.map((e) => `\`${e}\``).join(", ")}` : ""}`);

            if (subcommand === "lock") stats.itemlock = [...new Set([...stats.itemlock, ...choice])];
            else stats.itemlock = stats.itemlock.filter((e) => !choice.includes(e));

            if (stats.itemlock.length > 200) return interaction.reply(`You can't lock more than 200 items at once.`);

            // Update users table
            await updateUsers(interaction.user.id, {
                itemlock: { type: subcommand === "lock" ? "append_unique" : "remove_all", value: choice },
            });

            return interaction.reply(`${subcommand === "lock" ? "Locked" : "Unlocked"} ${choice.length === 1 ? "item" : "items"} ${choice.map((e) => `\`${e}\``).join(", ")}${stats.itemlock.length ? `\n\nYour currently locked items are:\n> ${stats.itemlock.map((e) => `\`${e}\``).join(", ")}` : ""}`);
        };

        // Item Wishlist
        if (subcommand === "wishlist") {
            const choice = interaction.options.getString('add');

            const stats = author.schema;

            const wished = stats.itemwishlist.map((e) => items[e]);

            if (!choice) {
                if (!stats.itemwishlist.length) return interaction.reply(`You don't have anything on your item wish list`);

                const Embed = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                    .setDescription("### Item Wish List\nItems on your wish list are twice as likely to be pulled!\nCan only have 1 item per rarity.\n\n" + wished.sort((a, b) => b.gradeValue - a.gradeValue).map((item) => `${item.gradeEmote}\n${item.emoji} **${item.name}**`).join("\n\n"));
                return interaction.reply({ embeds: [Embed] });
            };

            const fItem = searchItem(choice, interaction);
            if (!fItem) return;
            if (!(fItem.category === "armor" || fItem.category === "weapon")) return interaction.reply(`You can only wish for weapons or armor pieces`);

            const newWishList = [fItem.id, ...wished.filter((item) => (item.grade !== fItem.grade) && (item.id !== fItem.id)).map((item) => item.id)];

            // Update users table
            await updateUsers(interaction.user.id, {
                itemwishlist: { type: "set", value: newWishList },
            });

            return interaction.reply(`Added ${fItem.emoji} __${fItem.name}__ to your wish list!`);
        };

    },
};

export default exportCommand;
