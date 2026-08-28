import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } from "discord.js";
import { armorInfo, chestInfo, entryInfo, fishInfo, itemInfo, items, lootInfo, ringInfo, runeInfo, weaponInfo } from "../Modules/items";
import { searchItem, showPage, customEmojis, getAscensionMaterial, getItemLevel, getRingSlotsTotal } from "../Modules/functions";
import { PageRow, OfferRow } from "../Modules/components";
import { characters } from "../Modules/chars";
import { ItemCategory, ItemRarity, ItemType, SlashCommand } from "../types";
import { deleteWeapon, getUserSchema, getWeaponCount, getWeaponDupeSchemas, getWeaponSchema, getWeaponSchemas, updateUsersAndCache, updateWeapons } from "../Modules/queries";
import { achievements } from "../Modules/achievements";
import { raids } from "../Modules/raids";

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
            const flag = (interaction.options.getString('flag') ?? "base") as "base" | "my";
            const user = interaction.options.getUser('user') ?? interaction.user;

            const Embeds: EmbedBuilder[] = [];

            const choiceArr = choices.split(",").filter((s) => s).map((s) => s.trim());
            for (const choice of choiceArr) {
                if (flag === "my") {
                    const item = await getWeaponSchema(`${choice}:${user.id}`);
                    if (!item) continue;
                    const fItem = items[item.itemid];

                    const Embed = new EmbedBuilder()
                        .setColor(0xbbffff)
                        .setTitle(fItem.name)
                        .setThumbnail(fItem.image)
                        .setFooter({ text: `ID: #${fItem.id}` });

                    if (fItem instanceof weaponInfo) {
                        item.level = getItemLevel(item.level);

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
                        item.level = getItemLevel(item.level);

                        const set = items.filter((e) => ((e instanceof armorInfo) && (e.setname === fItem.setname))) as armorInfo[];

                        let pstat = 0;
                        pstat += Math.floor(fItem.psmin + ((fItem.psmax - fItem.psmin) / 150) * ((item.level - 1) + (item.ascension * 3)));

                        Embed.setDescription(`**Grade**: ${fItem.gradeEmote}\n**Type**: ${fItem.type[0].toUpperCase() + fItem.type.slice(1)}\n**Level**: ${"**" + item.level + "**/" + ((item.ascension * 10) + 20) + " ➜ " + getAscension(item.ascension)}\n\n**${fItem.setname}**: ${set[0].emoji + set[1].emoji + set[2].emoji + set[3].emoji}\n**Primary Stat**: ${pstat} ${customEmojis[fItem.primaryStat] || fItem.primaryStat}\n\n**Set Bonus**: ${set[3].buffdesc}`);
                        Embeds.push(Embed);
                    } else if (fItem instanceof ringInfo) {
                        Embed.setDescription(
                            `**Grade**: ${fItem.gradeEmote}\n` +
                            `**Type**: ${fItem.type[0].toUpperCase() + fItem.type.slice(1)}\n` +
                            `**Unique ID**: \`${item.uniqueid.split(":")[0]}\`\n` +
                            `**Ascension**: **${item.level + 1}**/${fItem.maxlevel}\n\n` +
                            `**Passive${fItem.maxlevel > 1 ? ` (Asc. ${item.level + 1})` : ""}**: ${fItem.getBuffDesc(item.level + 1)}\n\n` +
                            `>>> ${fItem.flair}`
                        );

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
                    } else if (fItem instanceof ringInfo) {
                        const count = await getWeaponCount(fItem.id);
                        Embed.setDescription(
                            `**Grade**: ${fItem.gradeEmote}\n` +
                            `**Type**: ${fItem.type[0].toUpperCase() + fItem.type.slice(1)}\n` +
                            `**Obtain**: ${fItem.obtain.length ? fItem.obtain.join(", ") : "None"}${fItem.obtain.includes("raid") ? ` (boss: ${raids.find((e) => e.loot.includes(fItem.id))?.name})` : ""}\n` +
                            `**Crafts in existence**: ${count}\n\n` +
                            `**Passive${fItem.maxlevel > 1 ? " (Asc. 1)" : ""}**: ${fItem.getBuffDesc(1)}\n\n` +
                            `${fItem.maxlevel > 1 ? `**Passive (Asc. ${fItem.maxlevel})**: ${fItem.getBuffDesc(fItem.maxlevel)}\n\n` : ""}` +
                            `>>> ${fItem.flair}`
                        );
                        Embeds.push(Embed);
                    } else if (fItem instanceof runeInfo) {
                        Embed.setDescription(`**Grade**: ${fItem.gradeEmote}\n**Type**: ${fItem.type[0].toUpperCase() + fItem.type.slice(1)}${fItem.active ? ` (replaces active)` : ""}${fItem.passive ? ` (replaces passive)` : ""}${fItem.party ? ` (replaces party)` : ""}\n**Obtain**: ${fItem.obtain.length ? fItem.obtain.join(", ") : "None"}\n\n**Abilities**\n${fItem.buffdesc}`);
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
            if (fItem instanceof ringInfo && (item.level + 1) >= fItem.maxlevel) return interaction.reply(`You have reached the maximum level.`);

            // Separate ascension and levelup
            if (currLevel === limit && !(fItem instanceof ringInfo)) {
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
                        await updateUsersAndCache(interaction.client, interaction.user.id, {
                            updates: {
                                items: {
                                    type: "merge_json", value: {
                                        [ascItem.id]: -ascMatsNeeded,
                                        [craftItem.id]: -craftMatsNeeded,
                                        [awakenItem.id]: -awakenItemNeeded,
                                    },
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
            } else if (fItem instanceof ringInfo) {
                const dItems = await getWeaponDupeSchemas(fItem.id, interaction.user.id, item.uniqueid);
                if (dItems.length < 1) return interaction.reply(`You don't have any duplicates of ${fItem.emoji} **__${fItem.name}__**`);

                // Get lowest level item
                dItems.sort((a, b) => a.level - b.level);
                const dItem = dItems[0];

                const Embed = new EmbedBuilder()
                    .setTitle(fItem.name)
                    .setColor(0xbbffff)
                    .setDescription(`Do you want to ascend ${fItem.emoji} **__${fItem.name}__** (\`${item.uniqueid.split(":")[0]}\`) to Asc. **${item.level + 2}**/${fItem.maxlevel}\nby consuming ${fItem.emoji} **__${fItem.name}__** (\`${dItem.uniqueid.split(":")[0]}\`)?`)
                    .setThumbnail(fItem.image);
                return interaction.reply({ embeds: [Embed], components: [OfferRow] }).then(msg => {
                    const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                    const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                    confirm.on('collect', async () => {
                        confirm.stop(), cancel.stop();

                        const item = await getWeaponSchema(`${itemChoice}:${interaction.user.id}`);
                        if (!item) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`Couldn't find item with id \`${itemChoice}\``);
                            return;
                        };
                        if (fItem instanceof ringInfo && (item.level + 1) >= fItem.maxlevel) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`You have reached the maximum level.`);
                            return;
                        };
                        if (fItem.id !== item.itemid) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`Couldn't find ring with id \`${itemChoice}\``);
                            return;
                        };

                        const dItems = await getWeaponDupeSchemas(fItem.id, interaction.user.id, item.uniqueid);
                        if (dItems.length < 1) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have any duplicates of ${fItem.emoji} **__${fItem.name}__**`);
                            return;
                        };
                        if (dItems.find((e) => e.uniqueid === dItem.uniqueid) === undefined) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`Couldn't find ring with UID \`${dItem.uniqueid.split(":")[0]}\`, please try again.`);
                            return;
                        };

                        // Delete duplicate
                        await deleteWeapon(dItem.uniqueid);

                        // Update weapons table
                        await updateWeapons(`${itemChoice}:${interaction.user.id}`, {
                            level: { type: "increment", value: 1 },
                        });

                        interaction.editReply({ components: [] });
                        if (interaction.channel?.isSendable()) interaction.channel.send(`Successfully ascended ${fItem.emoji} __**${fItem.name}**__!`);
                    });

                    cancel.on('collect', () => {
                        confirm.stop(), cancel.stop();
                        interaction.editReply({ components: [] });
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
                    // Enhanced max flag - automatically level and ascend up to level 120
                    const targetLevel = 120;
                    let effectiveLimit = limit;
                    let autoAscensions: Array<{
                        ascItem: any;
                        craftItem: any;
                        awakenItem: any;
                        ascMatsNeeded: number;
                        craftMatsNeeded: number;
                        awakenItemNeeded: number;
                    }> = [];

                    // Plan ascensions to reach target level
                    let tempAscension = item.ascension;
                    while (tempAscension < 10 && ((tempAscension * 10) + 20) < targetLevel) {
                        const ascItem = getAscensionMaterial(fItem.id, items.filter((e) => e.type === "ascension material"));
                        const craftItem = items.find((e) => e.type === "crafting material" && e.grade === fItem.grade) as lootInfo;
                        const awakenItem = items[683];

                        const ascMatsNeeded = (tempAscension + 4) * 12;
                        const craftMatsNeeded = (tempAscension + 4) * 8;
                        const nextLimit = ((tempAscension + 1) * 10) + 20;
                        const awakenItemNeeded = 0; // nextLimit < 120 ? 0 : (tempAscension + 1 - 9) * 16;

                        // Calculate total materials including previous ascensions
                        const totalAscMats = autoAscensions.reduce((sum, asc) => sum + asc.ascMatsNeeded, 0) + ascMatsNeeded;
                        const totalCraftMats = autoAscensions.reduce((sum, asc) => sum + asc.craftMatsNeeded, 0) + craftMatsNeeded;
                        const totalAwakenMats = autoAscensions.reduce((sum, asc) => sum + asc.awakenItemNeeded, 0) + awakenItemNeeded;

                        // Check if user has enough materials
                        if ((stats.items[ascItem.id] || 0) >= totalAscMats &&
                            (stats.items[craftItem.id] || 0) >= totalCraftMats &&
                            (stats.items[awakenItem.id] || 0) >= totalAwakenMats) {

                            autoAscensions.push({
                                ascItem, craftItem, awakenItem,
                                ascMatsNeeded, craftMatsNeeded, awakenItemNeeded
                            });
                            tempAscension++;
                            effectiveLimit = Math.min(nextLimit, targetLevel);
                        } else {
                            break; // Can't afford more ascensions
                        }
                    }

                    // Level up to the effective limit
                    const corners = ['2500', '500', '100', '20'] as const;
                    corners.forEach((r) => {
                        while (!((!(stats.items[matsToUse[r].id] > 0 + matsToUse[r].use)) || missingXP(item.level + xpSelected, effectiveLimit) === 0)) {
                            matsToUse[r].use++;
                            xpSelected = totalXP(matsToUse);
                            if (missingXP(item.level + xpSelected, effectiveLimit) < 0) {
                                xpSelected += missingXP(item.level + xpSelected, effectiveLimit);
                            }
                            currLevel = getItemLevel(item.level + xpSelected);
                        }
                    });

                    // Store auto-ascension data for the confirm handler
                    (matsToUse as any).autoAscensions = autoAscensions;
                    (matsToUse as any).effectiveLimit = effectiveLimit;
                }

                const rowComponents = [
                    new ButtonBuilder()
                        .setCustomId('20')
                        .setEmoji(fItem.category === "weapon" ? '<:common_weapon_levelup_material:1047535549814165535>' : '<:common_armor_levelup_material:1047535557204508803>')
                        .setLabel('+20xp')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled((!(stats.items[matsToUse['20'].id] > 0 + matsToUse['20'].use)) || missingXP(item.level + xpSelected, (matsToUse as any).effectiveLimit || limit) === 0),
                    new ButtonBuilder()
                        .setCustomId('100')
                        .setEmoji(fItem.category === "weapon" ? '<:rare_weapon_levelup_material:1047535563525328946>' : '<:rare_armor_levelup_material:1047535578855522444>')
                        .setLabel('+100xp')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled((!(stats.items[matsToUse['100'].id] > 0 + matsToUse['100'].use)) || missingXP(item.level + xpSelected, (matsToUse as any).effectiveLimit || limit) === 0),
                    new ButtonBuilder()
                        .setCustomId('500')
                        .setEmoji(fItem.category === "weapon" ? '<:mythical_weapon_levelup_material:1047535585117618196>' : '<:mythical_armor_levelup_material:1047535597180432485>')
                        .setLabel('+500xp')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled((!(stats.items[matsToUse['500'].id] > 0 + matsToUse['500'].use)) || missingXP(item.level + xpSelected, (matsToUse as any).effectiveLimit || limit) === 0),
                    new ButtonBuilder()
                        .setCustomId('2500')
                        .setEmoji(fItem.category === "weapon" ? '<:divine_weapon_levelup_material:1047535604403015700>' : '<:divine_armor_levelup_material:1047535613487890483>')
                        .setLabel('+2500xp')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled((!(stats.items[matsToUse['2500'].id] > 0 + matsToUse['2500'].use)) || missingXP(item.level + xpSelected, (matsToUse as any).effectiveLimit || limit) === 0),
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

                // Enhanced embed description to show auto-ascension info
                const displayLimit = (matsToUse as any).effectiveLimit || limit;
                const autoAscensions = (matsToUse as any).autoAscensions || [];

                let embedDesc = `**Current Level**: **${currLevel}**/${displayLimit} ➜ ${getAscension(item.ascension)}`;

                if (autoAscensions.length > 0) {
                    embedDesc += `\n**Auto-Ascensions Planned**: ${autoAscensions.length}`;
                    const totalAscMats = autoAscensions.reduce((sum: number, asc: any) => sum + asc.ascMatsNeeded, 0);
                    const totalCraftMats = autoAscensions.reduce((sum: number, asc: any) => sum + asc.craftMatsNeeded, 0);
                    const totalAwakenMats = autoAscensions.reduce((sum: number, asc: any) => sum + asc.awakenItemNeeded, 0);

                    embedDesc += `\n**Ascension Materials**: `;
                    if (totalAscMats > 0) embedDesc += `${autoAscensions[0].ascItem.emoji}x${totalAscMats} `;
                    if (totalCraftMats > 0) embedDesc += `${autoAscensions[0].craftItem.emoji}x${totalCraftMats} `;
                    if (totalAwakenMats > 0) embedDesc += `${autoAscensions[0].awakenItem.emoji}x${totalAwakenMats}`;
                }

                embedDesc += `\n**XP selected**: ${xpSelected}`;
                embedDesc += `\n**XP left**: ${currLevel + 1 >= displayLimit ? "" : `__${missingXP(item.level + xpSelected, currLevel + 1)}__ for level ${currLevel + 1}, `}__${missingXP(item.level + xpSelected, displayLimit)}__ for level ${displayLimit}`;

                const Embed = new EmbedBuilder()
                    .setTitle(fItem.name)
                    .setColor(0xbbffff)
                    .setDescription(embedDesc)
                    .setThumbnail(fItem.image);
                interaction.reply({ embeds: [Embed], components: [row, row2] }).then(msg => {

                    const addXP = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && ['20', '100', '500', '2500'].includes(r.customId), componentType: ComponentType.Button, time: 90000 });
                    const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 90000 });
                    const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 90000 });

                    addXP.on('collect', r => {
                        matsToUse[r.customId as keyof typeof matsToUse].use++;
                        xpSelected = totalXP(matsToUse);
                        const displayLimit = (matsToUse as any).effectiveLimit || limit;
                        if (missingXP(item.level + xpSelected, displayLimit) < 0) xpSelected += missingXP(item.level + xpSelected, displayLimit);
                        currLevel = getItemLevel(item.level + xpSelected);

                        // Disable Buttons using the correct limit
                        rowComponents[0].setDisabled((!(stats.items[matsToUse['20'].id] > 0 + matsToUse['20'].use)) || missingXP(item.level + xpSelected, displayLimit) === 0);
                        rowComponents[1].setDisabled((!(stats.items[matsToUse['100'].id] > 0 + matsToUse['100'].use)) || missingXP(item.level + xpSelected, displayLimit) === 0);
                        rowComponents[2].setDisabled((!(stats.items[matsToUse['500'].id] > 0 + matsToUse['500'].use)) || missingXP(item.level + xpSelected, displayLimit) === 0);
                        rowComponents[3].setDisabled((!(stats.items[matsToUse['2500'].id] > 0 + matsToUse['2500'].use)) || missingXP(item.level + xpSelected, displayLimit) === 0);

                        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...rowComponents);

                        // Update embed description with correct limit
                        const autoAscensions = (matsToUse as any).autoAscensions || [];
                        let embedDesc = `**Current Level**: **${currLevel}**/${displayLimit} ➜ ${getAscension(item.ascension)}`;

                        if (autoAscensions.length > 0) {
                            embedDesc += `\n**Auto-Ascensions Planned**: ${autoAscensions.length}`;
                        }

                        embedDesc += `\n**XP selected**: ${xpSelected}`;
                        embedDesc += `\n**XP left**: ${currLevel + 1 >= displayLimit ? "" : `__${missingXP(item.level + xpSelected, currLevel + 1)}__ for level ${currLevel + 1}, `}__${missingXP(item.level + xpSelected, displayLimit)}__ for level ${displayLimit}`;

                        Embed.setDescription(embedDesc);
                        interaction.editReply({ embeds: [Embed], components: [row, OfferRow] });
                    });

                    confirm.on('collect', async () => {
                        addXP.stop(), confirm.stop(), cancel.stop();

                        const stats = await getUserSchema(interaction.user.id);
                        if (!stats) return;

                        // Check levelup materials
                        if (stats.items[matsToUse['20'].id] < matsToUse['20'].use || stats.items[matsToUse['100'].id] < matsToUse['100'].use || stats.items[matsToUse['500'].id] < matsToUse['500'].use || stats.items[matsToUse['2500'].id] < matsToUse['2500'].use) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough levelup materials.`);
                            return;
                        }

                        // Check ascension materials if auto-ascensions are planned
                        const autoAscensions = (matsToUse as any).autoAscensions || [];
                        if (autoAscensions.length > 0) {
                            const totalAscMats = autoAscensions.reduce((sum: number, asc: any) => sum + asc.ascMatsNeeded, 0);
                            const totalCraftMats = autoAscensions.reduce((sum: number, asc: any) => sum + asc.craftMatsNeeded, 0);
                            const totalAwakenMats = autoAscensions.reduce((sum: number, asc: any) => sum + asc.awakenItemNeeded, 0);

                            const firstAsc = autoAscensions[0];
                            if ((stats.items[firstAsc.ascItem.id] || 0) < totalAscMats) {
                                if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough ${firstAsc.ascItem.emoji} **${firstAsc.ascItem.name}** for auto-ascensions.`);
                                return;
                            }
                            if ((stats.items[firstAsc.craftItem.id] || 0) < totalCraftMats) {
                                if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough ${firstAsc.craftItem.emoji} **${firstAsc.craftItem.name}** for auto-ascensions.`);
                                return;
                            }
                            if (totalAwakenMats > 0 && (stats.items[firstAsc.awakenItem.id] || 0) < totalAwakenMats) {
                                if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough ${firstAsc.awakenItem.emoji} **${firstAsc.awakenItem.name}** for auto-ascensions.`);
                                return;
                            }
                        }

                        const item = await getWeaponSchema(`${itemChoice}:${interaction.user.id}`);
                        if (!item) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`Couldn't find item with id \`${itemChoice}\``);
                            return;
                        }

                        const currentLimit = (item.ascension * 10) + 20;
                        let newCurrLevel = getItemLevel(item.level);
                        if (newCurrLevel === 170) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`You have reached the maximum level.`);
                            return;
                        }

                        // For auto-ascensions, we don't check the current limit since we're ascending
                        if (newCurrLevel >= currentLimit && autoAscensions.length === 0) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`You have reached the current level cap, please ascend your item first if possible.`);
                            return;
                        }

                        // Prepare material updates
                        const materialUpdates: { [key: number]: number; } = {
                            [matsToUse['20'].id]: -matsToUse['20'].use,
                            [matsToUse['100'].id]: -matsToUse['100'].use,
                            [matsToUse['500'].id]: -matsToUse['500'].use,
                            [matsToUse['2500'].id]: -matsToUse['2500'].use,
                        };

                        // Add ascension materials to updates if auto-ascensions are planned
                        if (autoAscensions.length > 0) {
                            for (const asc of autoAscensions) {
                                materialUpdates[asc.ascItem.id] = (materialUpdates[asc.ascItem.id] || 0) - asc.ascMatsNeeded;
                                materialUpdates[asc.craftItem.id] = (materialUpdates[asc.craftItem.id] || 0) - asc.craftMatsNeeded;
                                if (asc.awakenItemNeeded > 0) {
                                    materialUpdates[asc.awakenItem.id] = (materialUpdates[asc.awakenItem.id] || 0) - asc.awakenItemNeeded;
                                }
                            }
                        }

                        // Update user materials
                        await updateUsersAndCache(interaction.client, interaction.user.id, {
                            updates: {
                                items: {
                                    type: "merge_json",
                                    value: materialUpdates
                                },
                            },
                        });

                        // Update weapon level
                        await updateWeapons(`${itemChoice}:${interaction.user.id}`, {
                            level: { type: "increment", value: xpSelected },
                        });

                        // Update weapon ascension if auto-ascensions were planned
                        if (autoAscensions.length > 0) {
                            await updateWeapons(`${itemChoice}:${interaction.user.id}`, {
                                ascension: { type: "increment", value: autoAscensions.length },
                            });
                        }

                        interaction.editReply({ components: [] });

                        const finalLevel = getItemLevel(item.level + xpSelected);
                        let successMessage = `Leveled ${fItem.emoji} __**${fItem.name}**__ up to level **${finalLevel}**!`;
                        if (autoAscensions.length > 0) {
                            successMessage += ` (with ${autoAscensions.length} auto-ascension${autoAscensions.length > 1 ? 's' : ''})`;
                        }

                        if (interaction.channel?.isSendable()) interaction.channel.send(successMessage);

                        //* Achievements
                        // Veteran in the Making
                        const itemLvl = getItemLevel(item.level + xpSelected);
                        achievements[78].check(interaction, interaction.user, itemLvl), achievements[79].check(interaction, interaction.user, itemLvl), achievements[80].check(interaction, interaction.user, itemLvl), achievements[81].check(interaction, interaction.user, itemLvl);
                    });

                    cancel.on('collect', () => {
                        addXP.stop(), confirm.stop(), cancel.stop();
                        interaction.editReply({ components: [] });
                    });

                });
            };
        };

        // Item Equip
        if (subcommand === "equip") {
            const itemChoices = [...new Set(interaction.options.getString('items', true).split(",").map((e) => e.trim()))].filter(Boolean);

            const stats = author.schema;
            if (!stats.battlechar) return interaction.reply(`You don't have a battle character selected, please use \`/select\` to do so`);

            const ringSlotsTotal = getRingSlotsTotal(stats);

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

                // 2B/9S Duo Programmes
                if (itemChoice.toLowerCase().startsWith("prog")) {
                    let action = itemChoice.toLowerCase().split(" ")[1] ?? "info";

                    if (action === "remove") {
                        delete stats.equipment["prog"];
                        equipped.push(`Unequipped pod's programme(s)`);
                    } else if (action === "a110" || action === "a120" || action === "a140" || action === "a170" || action === "r020") {
                        // Dictionary of pod and relevant effects
                        // const proglist = {
                        //     "a110": "Slows enemy every **3** rounds, decreasing their dodge rate to **0%** for **2** rounds",
                        //     "a120": "Initiates restoration every **3** rounds, applying a **10%** max HP heal over **2** rounds.",
                        //     "a140": "Gathers enemy **3** rounds, reducing their ATK, MD, DEF & MR by **20%** for **1** round.",
                        //     "a170": "Sharply locates loot, increasing coins obtained from dungeons by **15%**. Grants **1x** ɪɴꜱɪɢʜᴛ at the start of every round.",
                        //     "r020": "Analyzes enemy every **3** rounds, dealing **2** hits of **20%** DMG on the enemy.",
                        //     "remove": "Removes any existing programme from the pod."
                        // };

                        const equippedProgs = stats.equipment["prog"]?.split(",").filter(Boolean) ?? [];

                        // Disallow duplicate or over 2 programmes
                        if (equippedProgs.includes(action)) return interaction.reply(`You cannot equip the same programme twice.`);
                        if (equippedProgs.length >= 2) return interaction.reply("You cannot equip more than two programmes. To clear all programmes, use `/item equip prog remove`");

                        equippedProgs.push(action);
                        stats.equipment["prog"] = equippedProgs.join(",");
                        equipped.push(`[${action.toUpperCase()}]`);
                    } else {
                        let progmsg = "`A110` : Slows enemy every **2** rounds. If dodge is below **0%**, sets dodge to **0%**, before increasing dodge rate by **1%** for every **1%** HP missing, up to **20%**\n`A120` : Initiates restoration every **4** rounds, applying a **10%** max HP heal over **2** rounds.\n`A140` : Gathers enemy every **4** rounds, reducing their ATK & MD by **20%**, DEF & MR by **10%** for **1** round.\n`A170` : Sharply locates loot, increasing coins obtained from dungeons by **15%**. Grants **1x** ɪɴꜱɪɢʜᴛ at the start of every round.\n`R020` : Analyzes foes every **4** rounds, guaranteeing **2** hits of **20%** DMG on the enemy.\n`Remove` : Removes any existing programme(s) from the pod.";
                        return interaction.reply(`⚙️ Correct usage: /item equip item:prog <ID>. Valid programmes:\n\n${progmsg}`);
                    };
                    continue;
                };

                // Dalus/Kisogi's shell
                if (["broken shell", "remove shell"].includes(itemChoice.toLowerCase())) {
                    if (itemChoice.toLowerCase() === "remove shell") delete stats.equipment["shell"];
                    else stats.equipment["shell"] = "broken";

                    if (itemChoice.toLowerCase() === "remove shell") equipped.push("Unequipped Broken Shell");
                    else equipped.push(`**__Broken Shell__** <:brokenshell:1405524630520987771>`);

                    continue;
                };

                const item = await getWeaponSchema(`${itemChoice}:${interaction.user.id}`);
                if (!item) {
                    const fItem = searchItem(itemChoice, interaction);
                    if (!fItem) return;

                    // Match Entry Item
                    if (fItem instanceof entryInfo) {
                        if (!(stats.items[fItem.id] && stats.items[fItem.id] > 0)) {
                            return interaction.reply(`You don't have ${fItem.emoji} **${fItem.name}**`);
                        };

                        stats.equipment["entry"] = `${fItem.id}`;
                        equipped.push(`${fItem.emoji} **__${fItem.name}__**`);

                        continue;
                    };

                    // Match Rune
                    if (fItem instanceof runeInfo) {
                        if (!(stats.items[fItem.id] && stats.items[fItem.id] > 0)) {
                            return interaction.reply(`You don't have ${fItem.emoji} **${fItem.name}**`);
                        };

                        stats.equipment[`rune:${stats.battlechar}`] = `${fItem.id}`;
                        equipped.push(`${fItem.emoji} **__${fItem.name}__**`);

                        continue;
                    } else {
                        return interaction.reply(`Please use your weapon's ID, not its name. You can find it in your inventory through \`/items\``);
                    };
                };

                const fItem = items[item.itemid];

                let type: ItemCategory | ItemType = fItem.category;
                if (type === "armor" || fItem.type === "shield") type = fItem.type;
                if (type === "shield" && (stats.premium < 4 && stats.shield_slot === 0)) type = "weapon";
                if (type === "ring") {
                    if (ringSlotsTotal === 0) return interaction.reply(`You don't have any ring slots available!\n\nYou can unlock them by:\n- Reaching account level 20\n- Reaching class level 1000 (cumulative)\n- Defeating Floor 300 in the \`/dungeon\``);

                    let slot = 1;
                    if ("ring1" in stats.equipment) {
                        slot++;
                        if ("ring2" in stats.equipment) slot++;
                    };
                    if (slot > ringSlotsTotal) slot = ringSlotsTotal;
                    type += slot;
                };

                // Assign weapon
                stats.equipment[type] = `${itemChoice}:${interaction.user.id}`;
                equipped.push(`${fItem.emoji} **__${fItem.name}__**`);
            };

            // Check if rings are unique
            const ringUIDs = Object.entries(stats.equipment).filter(([key, value]) => key.startsWith("ring")).map(([key, value]) => value).filter(Boolean);
            if (ringUIDs.length > 1) {
                const rings = await getWeaponSchemas(ringUIDs);
                const ringIDs = [...new Set(rings.map((ring) => ring.itemid))];

                if (ringUIDs.length !== ringIDs.length) return interaction.reply(`You can't equip the same ring twice!`);
            };

            // Update users table
            await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates: {
                    equipment: { type: "set", value: stats.equipment },
                },
            });

            return interaction.reply(`Equipped **${characters[stats.battlechar].name}** with ${equipped.join(", ")}`);
        };

        // Item Unequip
        if (subcommand === "unequip") {
            const typeChoice = interaction.options.getString('type', true);

            const stats = author.schema;
            if (!stats.battlechar) return interaction.reply(`You don't have a battle character selected, please use \`/select\` to do so`);

            if (typeChoice === "all") stats.equipment = {};
            else if (typeChoice === "armor") {
                delete stats.equipment["helmet"];
                delete stats.equipment["cuirass"];
                delete stats.equipment["gloves"];
                delete stats.equipment["boots"];
            } else if (typeChoice === "all_runes") {
                const keys = Object.keys(stats.equipment);
                for (const key of keys) {
                    if (key.startsWith("rune:")) {
                        delete stats.equipment[key];
                    };
                };
            } else if (typeChoice === "rune") {
                delete stats.equipment[`rune:${stats.battlechar}`];
            } else if (typeChoice === "rings") {
                delete stats.equipment["ring1"];
                delete stats.equipment["ring2"];
                delete stats.equipment["ring3"];
            } else delete stats.equipment[typeChoice];

            // Update users table
            await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates: {
                    equipment: { type: "set", value: stats.equipment },
                },
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
            await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates: {
                    equipment: { type: "set", value: stats.equipment },
                    itemlock: { type: "set", value: stats.itemlock },
                },
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

            if (stats.itemlock.length > 500) return interaction.reply(`You can't lock more than 500 items at once.`);

            // Update users table
            await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates: {
                    itemlock: { type: subcommand === "lock" ? "append_unique" : "remove_all", value: choice },
                },
            });

            const content = `${subcommand === "lock" ? "Locked" : "Unlocked"} ${choice.length === 1 ? "item" : "items"} ${choice.map((e) => `\`${e}\``).join(", ")}${stats.itemlock.length ? `\n\nYour currently locked items are:\n> ${stats.itemlock.map((e) => `\`${e}\``).join(", ")}` : ""}`;
            return interaction.reply(content.length > 2000 ? `${content}...`.slice(0, 2000) : content);
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
            if (!(fItem.category === "armor" || fItem.category === "weapon" || fItem.category === "ring")) return interaction.reply(`You can only wish for weapons, armor pieces or rings`);

            const newWishList = [fItem.id, ...wished.filter((item) => (item.grade !== fItem.grade) && (item.id !== fItem.id)).map((item) => item.id)];

            // Update users table
            await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates: {
                    itemwishlist: { type: "set", value: newWishList },
                },
            });

            return interaction.reply(`Added ${fItem.emoji} __${fItem.name}__ to your wish list!`);
        };

        if (subcommand === "entry") {
            await interaction.deferReply();
            const targetUser = interaction.options.getUser('user') ?? interaction.user;
            const page = interaction.options.getInteger('page') || 1;
            const stats = targetUser.id === interaction.user.id ? author.schema : await getUserSchema(targetUser.id);
            if (!stats) return interaction.editReply(`${targetUser.id === interaction.user.id ? "You don't have any" : `**${targetUser.username}** has no`} items.`);

            let thumbnail = characters[stats.chars[Math.floor(Math.random() * stats.chars.length)]].image;
            if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, stats.custom_skins[stats.favchar], stats.char_skin[stats.favchar]);

            let entryItems = Object.entries(stats.items).filter(([id, qty]) => items[parseInt(id)] instanceof entryInfo && qty > 0);

            if (!entryItems.length) return interaction.editReply(`${targetUser.id === interaction.user.id ? "You don't have any" : `**${targetUser.username}** has no`} entry items.`);

            entryItems.sort((a, b) => (items[parseInt(a[0])] as entryInfo).floor - (items[parseInt(b[0])] as entryInfo).floor);

            let elementsPerPage = 10;
            let pagesTotal = Math.ceil(entryItems.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) currPage = page;

            let showItems = showPage(currPage, entryItems, elementsPerPage);

            let desc = "\n\n<:mythical1:1041726768530329690><:mythical2:1041726767188168724><:mythical3:1041726765577556039><:mythical4:1041726763862065162>\n";
            desc += showItems.map(([id, qty]: [string, number]) => {
                const item = items[parseInt(id)] as entryInfo;
                return `${item.bar}${item.name} | ${item.emoji} x${qty} — Floor **${item.floor}**`;
            }).join("\n");

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setAuthor({ name: `${targetUser.username}'s entry items`, iconURL: targetUser.displayAvatarURL({ size: 512 }) })
                .setThumbnail(thumbnail)
                .setDescription(desc)
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });

            if (pagesTotal === 1) return interaction.editReply({ embeds: [Embed] });
            return interaction.editReply({ embeds: [Embed], components: [PageRow] }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', async r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    showItems = showPage(currPage, entryItems, elementsPerPage);
                    desc = "\n\n<:mythical1:1041726768530329690><:mythical2:1041726767188168724><:mythical3:1041726765577556039><:mythical4:1041726763862065162>\n";
                    desc += showItems.map(([id, qty]: [string, number]) => {
                        const item = items[parseInt(id)] as entryInfo;
                        return `${item.bar}${item.name} | ${item.emoji} x${qty} — Floor **${item.floor}**`;
                    }).join("\n");

                    Embed.setDescription(desc).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed], components: [PageRow] });
                });
            });
        };

    },
};

export default exportCommand;
