const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { items } = require("../Modules/items.js");
const { searchItem, showPage, customEmojis, getAscensionMaterial, getItemLevel } = require("../Modules/functions.js");
const { PageRow, OfferRow } = require("../Modules/components.js");
const { characters } = require("../Modules/chars.js");

function getAscension(lvl) {
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

function list(grade, show) {
    const arr = [], t = show.filter((b) => b.grade === grade);
    for (let h = 0; h < t.length; h++) {
        arr.push(t[h].bar + t[h].emoji + " | " + t[h].name);
    };
    return arr;
};

function itemsToShow(show) {
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

function totalXP(matsToUse) {
    return Object.entries(matsToUse).reduce((total, e) => total + (e[1].use * parseInt(e[0])), 0);
};

function missingXP(xp, level) {
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += Math.floor(20 * Math.pow(i, 1.290349));
    };
    return total - xp;
};

module.exports = {
    name: 'item',
    description: 'item related commands',
    execute(interaction) {

        let subcommand = interaction.options.getSubcommand();

        // Item info
        if (subcommand === "info") {
            const flag = interaction.options.getString('flag');
            const choices = interaction.options.getString('items');
            const user = interaction.options.getUser('user') || interaction.user;

            const Embeds = [];

            db.serialize(async () => {
                for (const choice of choices.split(",").filter((s) => s).map((s) => s.trim())) {
                    if (flag === "my") {
                        let item = await query(`SELECT * FROM weapons WHERE uniqueid = '${choice}:${user.id}'`);
                        if (!item[0]) continue;
                        item = item[0];
                        item.level = getItemLevel(item.level);
                        const fItem = items[item.itemid];

                        const Embed = new EmbedBuilder()
                            .setColor(0xbbffff)
                            .setTitle(fItem.name)
                            .setThumbnail(fItem.image)
                            .setFooter({ text: `ID: #${fItem.id}` });

                        if (fItem.category === "weapon") {
                            let pstat = 0, sstat = 0;

                            // Primary Stat
                            if (["atk%", "md%", "cr", "cd", "dodge", "br"].includes(fItem.primaryStat)) {
                                if (fItem.primaryStat.endsWith("%")) {
                                    pstat += (1 + Math.floor(fItem.psmin + ((fItem.psmax - fItem.psmin) / 150) * ((item.level - 1) + (item.ascension * 3))) / 100);
                                } else {
                                    pstat += (fItem.psmin + ((fItem.psmax - fItem.psmin) * ((item.level - 1) + (item.ascension * 3)) / 150)) / 100;
                                };
                            } else {
                                pstat += Math.floor(parseInt(fItem.psmin) + ((parseInt(fItem.psmax) - parseInt(fItem.psmin)) / 150) * ((item.level - 1) + (item.ascension * 3)));
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
                        } else {
                            const set = items.filter((e) => e.setname === fItem.setname);

                            let pstat = 0;
                            pstat += Math.floor(parseInt(fItem.psmin) + ((parseInt(fItem.psmax) - parseInt(fItem.psmin)) / 150) * ((item.level - 1) + (item.ascension * 3)));

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

                        if (fItem.category === "weapon") {
                            const stats = await query(`SELECT COUNT(*) AS count FROM weapons WHERE itemid = ${fItem.id}`);
                            Embed.setDescription(`**Grade**: ${fItem.gradeEmote}\n**Type**: ${fItem.type[0].toUpperCase() + fItem.type.slice(1)}\n**Obtain**: ${fItem.obtain.length ? fItem.obtain.join(", ") : "None"}\n**Crafts in existence**: ${stats[0].count}\n\n**Primary Stat**: \`${fItem.psmin}-${fItem.psmax}\` ${customEmojis[fItem.primaryStat] || fItem.primaryStat}\n**Secondary Stat**: \`${fItem.ssmin.endsWith("%") ? fItem.ssmin.slice(0, -1) : fItem.ssmin}-${fItem.ssmax}\` ${customEmojis[fItem.secondaryStat] || fItem.secondaryStat}\n\n**Passive**: ${fItem.buffdesc}\n\n>>> ${fItem.flair}`);
                            Embeds.push(Embed);
                        } else if (fItem.category === "armor") {
                            const stats = await query(`SELECT COUNT(*) AS count FROM weapons WHERE itemid = ${fItem.id}`);
                            const set = items.filter((e) => e.setname === fItem.setname);
                            Embed.setDescription(`**Grade**: ${fItem.gradeEmote}\n**Type**: ${fItem.type[0].toUpperCase() + fItem.type.slice(1)}\n**Obtain**: ${fItem.obtain.length ? fItem.obtain.join(", ") : "None"}\n**${fItem.setname}**: ${set[0].emoji + set[1].emoji + set[2].emoji + set[3].emoji}\n**Crafts in existence**: ${stats[0].count}\n\n**Primary Stat**: \`${fItem.psmin}-${fItem.psmax}\` ${customEmojis[fItem.primaryStat] || fItem.primaryStat}\n\n**Set Bonus**: ${set[3].buffdesc}`);
                            Embeds.push(Embed);
                        } else if (fItem.category === "fish") {
                            Embed.setDescription(`**Grade**: ${fItem.gradeEmote}\n**Type**: ${fItem.type[0].toUpperCase() + fItem.type.slice(1)}\n**Obtain**: ${fItem.obtain.length ? fItem.obtain.join(", ") : "None"}`);
                            Embeds.push(Embed);
                        } else if (fItem.type === "chest") {
                            Embed.setDescription(`**Grade**: ${fItem.gradeEmote}\n**Type**: ${fItem.type[0].toUpperCase() + fItem.type.slice(1)}\n**Obtain**: ${fItem.obtain.length ? fItem.obtain.join(", ") : "None"}\n**Drops**: ${fItem.drops}\n\n**Drop Rates**:\n${Object.entries(fItem.droprates).map((e) => `${gradeBar[e[0]]} ➜ **${e[1]}**% per drop / **${Math.round((1 - Math.pow((100 - e[1]) / 100, fItem.drops)) * 10000) / 100}**% per chest`).join("\n")}`);
                            Embeds.push(Embed);
                        } else if (fItem.category === "loot") {
                            Embed.setDescription(`**Grade**: ${fItem.gradeEmote}\n**Type**: ${fItem.type}\n**Obtain**: ${fItem.obtain.length ? fItem.obtain.join(", ") : "None"}\n\n${fItem.desc}`);
                            Embeds.push(Embed);
                        };
                    };
                };
                if (Embeds.length === 0) return interaction.reply({ content: `No matches found for the ${choices.split(",").length === 1 ? "item" : "items"} ${choices.split(",").filter((s) => s).map((s) => "`" + s.trim() + "`").join(", ")}`, ephemeral: true });

                let currPage = 1;
                if (Embeds.length === 1) return interaction.reply({ embeds: [Embeds[currPage - 1]] });
                return interaction.reply({ embeds: [Embeds[currPage - 1]], components: [PageRow], fetchReply: true }).then(msg => {
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

            });
        };

        // Item List
        if (subcommand === "list") {
            let type = interaction.options.getString('type');
            let page = interaction.options.getInteger('page');

            let itemsR;
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
            return interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {
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

            db.serialize(async () => {
                const item = await query(`SELECT * FROM weapons WHERE uniqueid = '${itemChoice}:${interaction.user.id}'`);
                if (!item[0]) return interaction.reply(`Couldn't find item with id \`${itemChoice}\``);
                const fItem = items[item[0].itemid];

                let stats = await query(`SELECT items FROM users WHERE users.id = ${interaction.user.id}`);
                stats = { items: JSON.parse(stats[0].items) };

                const limit = (item[0].ascension * 10) + 20;
                let currLevel = getItemLevel(item[0].level);
                if (currLevel === 170) return interaction.reply(`You have reached the maximum level.`);

                // Separate ascension and levelup
                if (currLevel === limit) {
                    // Ascend
                    const ascItem = getAscensionMaterial(fItem.id, items.filter((e) => e.type === "ascension material"));
                    const craftItem = items.find((e) => e.type === "crafting material" && e.grade === fItem.grade);
                    const awakenItem = items[683];
                    const ascMatsNeeded = (item[0].ascension + 4) * 12;
                    const craftMatsNeeded = (item[0].ascension + 4) * 8;
                    const awakenItemNeeded = currLevel < 120 ? 0 : (item[0].ascension - 9) * 16;

                    // Check if the user has the required mats
                    if ((stats.items[ascItem.id] || 0) < ascMatsNeeded) return interaction.reply(`You don't have enough of ${ascItem.emoji} **__${ascItem.name}__** (**${stats.items[ascItem.id] || 0}**/${ascMatsNeeded})`);
                    if ((stats.items[craftItem.id] || 0) < craftMatsNeeded) return interaction.reply(`You don't have enough of ${craftItem.emoji} **__${craftItem.name}__** (**${stats.items[craftItem.id] || 0}**/${craftMatsNeeded})`);
                    if ((stats.items[awakenItem.id] || 0) < awakenItemNeeded) return interaction.reply(`You don't have enough of ${awakenItem.emoji} **__${awakenItem.name}__** (**${stats.items[awakenItem.id] || 0}**/${awakenItemNeeded})`);

                    const Embed = new EmbedBuilder()
                        .setTitle(fItem.name)
                        .setColor(0xbbffff)
                        .setDescription(`Do you want to ascend **__${fItem.name}__** to ${getAscension(item[0].ascension + 1)} for ${awakenItemNeeded ? `${awakenItem.emoji}x${awakenItemNeeded}, ` : ""}${craftItem.emoji}x${craftMatsNeeded} and ${ascItem.emoji}x${ascMatsNeeded}?`)
                        .setThumbnail(fItem.image);
                    interaction.reply({ embeds: [Embed], components: [OfferRow], fetchReply: true }).then(msg => {

                        const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                        const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                        confirm.on('collect', async () => {
                            confirm.stop(), cancel.stop();
                            stats = await query(`SELECT items FROM users WHERE users.id = ${interaction.user.id}`);
                            stats = { items: JSON.parse(stats[0].items) };

                            // Check if the user has the required mats
                            if ((stats.items[ascItem.id] || 0) < ascMatsNeeded) return interaction.channel.send(`You don't have enough of ${ascItem.emoji} **__${ascItem.name}__** (**${stats.items[ascItem.id] || 0}**/${ascMatsNeeded})`);
                            if ((stats.items[craftItem.id] || 0) < craftMatsNeeded) return interaction.channel.send(`You don't have enough of ${craftItem.emoji} **__${craftItem.name}__** (**${stats.items[craftItem.id] || 0}**/${craftMatsNeeded})`);
                            if ((stats.items[awakenItem.id] || 0) < awakenItemNeeded) return interaction.channel.send(`You don't have enough of ${awakenItem.emoji} **__${awakenItem.name}__** (**${stats.items[awakenItem.id] || 0}**/${awakenItemNeeded})`);

                            const item = await query(`SELECT * FROM weapons WHERE uniqueid = '${itemChoice}:${interaction.user.id}'`);
                            if (currLevel !== ((item[0].ascension * 10) + 20)) return interaction.channel.send(`You need to level up your weapon first.`);

                            stats.items[ascItem.id] -= ascMatsNeeded;
                            stats.items[craftItem.id] -= craftMatsNeeded;
                            if (awakenItem.id in stats.items) stats.items[awakenItem.id] -= awakenItemNeeded;

                            // Evolve Random Substat
                            if (fItem.category === "armor") item[0].substats[Object.keys(item[0].substats).sort(() => 0.5 - Math.random())[0]]++;

                            await query(`UPDATE users SET items = '${JSON.stringify(stats.items)}' WHERE id = ${interaction.user.id}`);
                            await query(`UPDATE weapons SET ascension = ascension + 1${fItem.category === "armor" ? `, substats = '${JSON.stringify(item[0].substats)}'` : ""} WHERE uniqueid = '${itemChoice}:${interaction.user.id}'`);

                            interaction.channel.send(`Successfully ascended ${fItem.emoji} **__${fItem.name}__**!`);
                        });

                        cancel.on('collect', () => {
                            confirm.stop(), cancel.stop();
                            interaction.channel.send("Action cancelled");
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
                        ['2500', '500', '100', '20'].forEach((r) => {
                            while (!((!(stats.items[matsToUse[r].id] > 0 + matsToUse[r].use)) || missingXP(parseInt(item[0].level) + xpSelected, limit) === 0)) {
                                matsToUse[r].use++;
                                xpSelected = totalXP(matsToUse);
                                if (missingXP(parseInt(item[0].level) + xpSelected, limit) < 0) xpSelected += missingXP(parseInt(item[0].level) + xpSelected, limit);
                                currLevel = getItemLevel(parseInt(item[0].level) + xpSelected);
                            };
                        });
                    };

                    const rowComponents = [
                        new ButtonBuilder()
                            .setCustomId('20')
                            .setEmoji(fItem.category === "weapon" ? '<:common_weapon_levelup_material:1047535549814165535>' : '<:common_armor_levelup_material:1047535557204508803>')
                            .setLabel('+20xp')
                            .setStyle('Primary')
                            .setDisabled((!(stats.items[matsToUse['20'].id] > 0 + matsToUse['20'].use)) || missingXP(parseInt(item[0].level) + xpSelected, limit) === 0),
                        new ButtonBuilder()
                            .setCustomId('100')
                            .setEmoji(fItem.category === "weapon" ? '<:rare_weapon_levelup_material:1047535563525328946>' : '<:rare_armor_levelup_material:1047535578855522444>')
                            .setLabel('+100xp')
                            .setStyle('Primary')
                            .setDisabled((!(stats.items[matsToUse['100'].id] > 0 + matsToUse['100'].use)) || missingXP(parseInt(item[0].level) + xpSelected, limit) === 0),
                        new ButtonBuilder()
                            .setCustomId('500')
                            .setEmoji(fItem.category === "weapon" ? '<:mythical_weapon_levelup_material:1047535585117618196>' : '<:mythical_armor_levelup_material:1047535597180432485>')
                            .setLabel('+500xp')
                            .setStyle('Primary')
                            .setDisabled((!(stats.items[matsToUse['500'].id] > 0 + matsToUse['500'].use)) || missingXP(parseInt(item[0].level) + xpSelected, limit) === 0),
                        new ButtonBuilder()
                            .setCustomId('2500')
                            .setEmoji(fItem.category === "weapon" ? '<:divine_weapon_levelup_material:1047535604403015700>' : '<:divine_armor_levelup_material:1047535613487890483>')
                            .setLabel('+2500xp')
                            .setStyle('Primary')
                            .setDisabled((!(stats.items[matsToUse['2500'].id] > 0 + matsToUse['2500'].use)) || missingXP(parseInt(item[0].level) + xpSelected, limit) === 0),
                    ];

                    const row = new ActionRowBuilder().addComponents(...rowComponents);
                    const row2 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('confirm')
                                .setEmoji('<:check_icon:683671903143067743>')
                                .setLabel('confirm')
                                .setStyle('Success')
                                .setDisabled(!xpSelected),
                            new ButtonBuilder()
                                .setCustomId('cancel')
                                .setEmoji('<:stop_icon:683671917353369600>')
                                .setLabel('cancel')
                                .setStyle('Danger'),
                        );

                    const Embed = new EmbedBuilder()
                        .setTitle(fItem.name)
                        .setColor(0xbbffff)
                        .setDescription(`**Current Level**: **${currLevel}**/${limit} ➜ ${getAscension(item[0].ascension)}\n**XP selected**: ${xpSelected}\n**XP left**: ${currLevel + 1 >= limit ? "" : `__${missingXP(parseInt(item[0].level) + xpSelected, currLevel + 1)}__ for level ${currLevel + 1}, `}__${missingXP(parseInt(item[0].level) + xpSelected, limit)}__ for level ${limit}`)
                        .setThumbnail(fItem.image);
                    interaction.reply({ embeds: [Embed], components: [row, row2], fetchReply: true }).then(msg => {

                        const addXP = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && ['20', '100', '500', '2500'].includes(r.customId), componentType: ComponentType.Button, time: 90000 });
                        const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 90000 });
                        const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 90000 });

                        addXP.on('collect', r => {
                            matsToUse[r.customId].use++;
                            xpSelected = totalXP(matsToUse);
                            if (missingXP(parseInt(item[0].level) + xpSelected, limit) < 0) xpSelected += missingXP(parseInt(item[0].level) + xpSelected, limit);
                            currLevel = getItemLevel(parseInt(item[0].level) + xpSelected);

                            // Disable Buttons
                            rowComponents[0].setDisabled((!(stats.items[matsToUse['20'].id] > 0 + matsToUse['20'].use)) || missingXP(parseInt(item[0].level) + xpSelected, limit) === 0);
                            rowComponents[1].setDisabled((!(stats.items[matsToUse['100'].id] > 0 + matsToUse['100'].use)) || missingXP(parseInt(item[0].level) + xpSelected, limit) === 0);
                            rowComponents[2].setDisabled((!(stats.items[matsToUse['500'].id] > 0 + matsToUse['500'].use)) || missingXP(parseInt(item[0].level) + xpSelected, limit) === 0);
                            rowComponents[3].setDisabled((!(stats.items[matsToUse['2500'].id] > 0 + matsToUse['2500'].use)) || missingXP(parseInt(item[0].level) + xpSelected, limit) === 0);

                            const row = new ActionRowBuilder().addComponents(...rowComponents);

                            Embed.setDescription(`**Current Level**: **${currLevel}**/${limit} ➜ ${getAscension(item[0].ascension)}\n**XP selected**: ${xpSelected}\n**XP left**: ${currLevel + 1 >= limit ? "" : `__${missingXP(parseInt(item[0].level) + xpSelected, currLevel + 1)}__ for level ${currLevel + 1}, `}__${missingXP(parseInt(item[0].level) + xpSelected, limit)}__ for level ${limit}`);
                            interaction.editReply({ embeds: [Embed], components: [row, OfferRow] });
                        });

                        confirm.on('collect', async () => {
                            addXP.stop(), confirm.stop(), cancel.stop();
                            stats = await query(`SELECT items FROM users WHERE users.id = ${interaction.user.id}`);
                            stats = { items: JSON.parse(stats[0].items) };

                            if (stats.items[matsToUse['20'].id] < matsToUse['20'].use || stats.items[matsToUse['100'].id] < matsToUse['100'].use || stats.items[matsToUse['500'].id] < matsToUse['500'].use || stats.items[matsToUse['2500'].id] < matsToUse['2500'].use) return interaction.channel.send(`You don't have enough levelup materials.`);

                            const { 0: item } = await query(`SELECT * FROM weapons WHERE uniqueid = '${itemChoice}:${interaction.user.id}'`);
                            if (!item) return interaction.channel.send(`Unexpected error (did you disassemble your item?)`);

                            const limit = (item.ascension * 10) + 20;
                            let newCurrLevel = getItemLevel(item.level);
                            if (newCurrLevel === 170) return interaction.channel.send(`You have reached the maximum level.`);
                            if (newCurrLevel >= limit) return interaction.channel.send(`You have reached the current level cap, please ascend your item first if possible.`);

                            stats.items[matsToUse['20'].id] -= matsToUse['20'].use;
                            stats.items[matsToUse['100'].id] -= matsToUse['100'].use;
                            stats.items[matsToUse['500'].id] -= matsToUse['500'].use;
                            stats.items[matsToUse['2500'].id] -= matsToUse['2500'].use;

                            await query(`UPDATE users SET items = '${JSON.stringify(stats.items)}' WHERE id = ${interaction.user.id}`);
                            await query(`UPDATE weapons SET level = level + ${xpSelected} WHERE uniqueid = '${itemChoice}:${interaction.user.id}'`);

                            interaction.editReply({ components: [] });
                            interaction.channel.send(`Leveled ${fItem.emoji} __**${fItem.name}**__ up to level **${currLevel}**!`);
                        });

                        cancel.on('collect', () => {
                            addXP.stop(), confirm.stop(), cancel.stop();
                            interaction.editReply({ components: [] });
                        });

                    });

                };
            });
        };

        // Item Equip
        if (subcommand === "equip") {
            const itemChoice = interaction.options.getString('item');

            db.serialize(async () => {
                const { 0: stats } = await query(`SELECT premium, battlechar, equipment, shield_slot FROM users WHERE id = ${interaction.user.id}`);
                stats.equipment = JSON.parse(stats.equipment);

                // Search item
                const item = await query(`SELECT * FROM weapons WHERE uniqueid = '${itemChoice}:${interaction.user.id}'`);

                // Lria's Masks
                if (["remove mask", "verdant mask", "phantasmal mask", "valkyrie mask"].includes(itemChoice.toLowerCase())) {
                    if (itemChoice.toLowerCase() === "remove mask") delete stats.equipment["mask"];
                    else stats.equipment["mask"] = itemChoice.toLowerCase().split(" ")[0];
                    await query(`UPDATE users SET equipment = '${JSON.stringify(stats.equipment)}' WHERE id = ${interaction.user.id}`);

                    return interaction.reply(itemChoice.toLowerCase() === "remove mask" ? "Unequipped **Lria**'s mask" : `Equipped **Lria** <a:EXTRA:1138530846144462968> with the **__${itemChoice.toLowerCase()}__**`);
                };

                if (item[0]) {
                    const fItem = items[item[0].itemid];

                    let type = fItem.category;
                    if (type === "armor" || fItem.type === "shield") type = fItem.type;
                    if (type === "shield" && (stats.premium < 4 && stats.shield_slot === 0)) type = "weapon";

                    // Assign weapon
                    stats.equipment[type] = `${itemChoice}:${interaction.user.id}`;
                    await query(`UPDATE users SET equipment = '${JSON.stringify(stats.equipment)}' WHERE id = ${interaction.user.id}`);

                    return interaction.reply(`Equipped **${characters[stats.battlechar].name}** with ${fItem.emoji} **__${fItem.name}__**`);
                };

                const fItem = searchItem(itemChoice, interaction);
                if (!fItem?.name) return;

                return interaction.reply(`Please use the weapons id instead of name. You can find the id with \`/items\``);
            });
        };

        // Item Unequip
        if (subcommand === "unequip") {
            const typeChoice = interaction.options.getString('type');

            db.serialize(async () => {
                const { 0: stats } = await query(`SELECT premium, battlechar, equipment FROM users WHERE id = ${interaction.user.id}`);
                stats.equipment = JSON.parse(stats.equipment);

                if (typeChoice === "all") stats.equipment = {};
                else delete stats.equipment[typeChoice];

                await query(`UPDATE users SET equipment = '${JSON.stringify(stats.equipment)}' WHERE id = ${interaction.user.id}`);

                return interaction.reply(`Unequipped ${typeChoice === "all" ? "items" : "item"} from **${characters[stats.battlechar].name}**`);
            });
        };

        // Item Rename
        if (subcommand === "rename") {
            const before = interaction.options.getString('before');
            const after = interaction.options.getString('after');

            if (after.length > 5) return interaction.reply(`Item codes can't be longer than 5 characters (current length: ${after.length})`);
            const allowedChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split("");
            if (!after.split("").every((e) => allowedChars.includes(e))) return interaction.reply(`You can only use the characters a-z A-Z 0-9 - and _ in item codes.`);

            db.serialize(async () => {

                // Check if premium
                const { 0: stats } = await query(`SELECT premium, itemlock, equipment FROM users WHERE id = ${interaction.user.id}`);
                if (stats.premium < 3) return interaction.reply(`This is a </premium:1011293280702578691> feature (T3+). If you enjoy playing with Camelot we'd really appreciate your support <:RaphiSmile:928370490270183485>`);

                // Check if item exists
                const { 0: existing } = await query(`SELECT * FROM weapons WHERE uniqueid = '${before}:${interaction.user.id}'`);
                if (!existing) return interaction.reply(`You don't have an item with the code \`${before}\``);

                // Check if the new name already exists
                const { 0: itemCheck } = await query(`SELECT * FROM weapons WHERE uniqueid = '${after}:${interaction.user.id}'`);
                if (itemCheck) return interaction.reply(`You already own an item with the code \`${after}\``);

                // Change item code
                await query(`UPDATE weapons SET uniqueid = '${after}:${interaction.user.id}' WHERE uniqueid = '${before}:${interaction.user.id}'`);

                // Change item code on equipped characters
                if (existing.character !== null) {
                    stats.equipment = JSON.parse(stats.equipment);

                    const fItem = items[existing.itemid];
                    let type = fItem.category;
                    if (type === "armor" || fItem.type === "shield") type = fItem.type;
                    if (type === "shield" && stats.premium < 4) type = "weapon";

                    // Unequip if already equipped on another char
                    // if (!(existing.character in inv.equipment)) inv.equipment[existing.character] = {};
                    if (stats.equipment[type] === `${before}:${interaction.user.id}`) stats.equipment[type] = `${after}:${interaction.user.id}`;

                    await query(`UPDATE users SET equipment = '${JSON.stringify(stats.equipment)}' WHERE id = ${interaction.user.id}`);
                };

                // Change item in lock
                stats.itemlock = JSON.parse(stats.itemlock);
                if (stats.itemlock.includes(before)) {
                    stats.itemlock[stats.itemlock.indexOf(before)] = after;
                    await query(`UPDATE users SET itemlock = '${JSON.stringify(stats.itemlock)}' WHERE id = ${interaction.user.id}`);
                };

                return interaction.reply(`Changed code of ${items[existing.itemid].emoji} ${items[existing.itemid].name} from \`${before}\` to \`${after}\``);
            });
        };

        // Item Lock/Unlock
        if (subcommand === "lock" || subcommand === "unlock") {
            const choice = [...new Set((interaction.options.getString('items') || "").split(",").map((e) => e.trim()))];
            if (Math.max(...choice.map((e) => e.length)) > 5) return interaction.reply(`Item codes can't be longer than 5 characters`);

            db.serialize(async () => {
                const { 0: stats } = await query(`SELECT itemlock FROM users WHERE id = ${interaction.user.id}`);
                stats.itemlock = JSON.parse(stats.itemlock);

                if (!choice[0]) return interaction.reply(`Please select at least 1 item. You can use a comma (,) to (un)lock multiple items at once.${stats.itemlock.length ? `\n\nYour currently locked items are:\n> ${stats.itemlock.map((e) => `\`${e}\``).join(", ")}` : ""}`);

                if (subcommand === "lock") stats.itemlock = [...new Set([...stats.itemlock, ...choice])];
                else stats.itemlock = stats.itemlock.filter((e) => !choice.includes(e));

                if (stats.itemlock.length > 200) return interaction.reply(`You can't lock more than 200 items at once.`);

                await query(`UPDATE users SET itemlock = '${JSON.stringify(stats.itemlock)}' WHERE id = ${interaction.user.id}`);

                return interaction.reply(`${subcommand === "lock" ? "Locked" : "Unlocked"} ${choice.length === 1 ? "item" : "items"} ${choice.map((e) => `\`${e}\``).join(", ")}${stats.itemlock.length ? `\n\nYour currently locked items are:\n> ${stats.itemlock.map((e) => `\`${e}\``).join(", ")}` : ""}`);
            });

        };

    },
};