import fs from 'fs';
import { EmbedBuilder, ComponentType } from "discord.js";
import { characters } from "../Modules/chars";
import { armorInfo, items, ringInfo, weaponInfo } from "../Modules/items";
import { showPage, getItemLevel, customEmojis } from "../Modules/functions";
import { PageRow } from "../Modules/components";
import { ItemRarity, SlashCommand, WeaponSchema } from '../types';
import { getUserSchema, getUserWeapons } from '../Modules/queries';

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

function list(grade: ItemRarity, show: any[], type: "weapon" | "loot" = "loot", locked: string[] = []) {
    if (type === "loot") {
        const arr = [], t = show.filter((b) => items[b[0]].grade === grade);
        for (let h = 0; h < t.length; h++) {
            arr.push(items[t[h][0]].bar + items[t[h][0]].name + " | " + items[t[h][0]].emoji + " x" + t[h][1]);
        };
        return arr;
    } else if (type === "weapon") {
        if (show[0].item_type === "ring") {
            return show.filter((b) => items[b.itemid].grade === grade).map((e) => `${items[e.itemid].bar}${locked.includes(e.uniqueid.split(":")[0]) ? "🔒" : ""}\`${e.uniqueid.split(":")[0]}\` | ${items[e.itemid].emoji} __**${items[e.itemid].name}**__ Lvl. **${e.level + 1}**/${(items[e.itemid] as ringInfo).maxlevel}`);
        };

        return show.filter((b) => items[b.itemid].grade === grade).map((e) => `${items[e.itemid].bar}${locked.includes(e.uniqueid.split(":")[0]) ? "🔒" : ""}\`${e.uniqueid.split(":")[0]}\` | ${items[e.itemid].emoji} __**${items[e.itemid].name}**__ Lvl. **${getItemLevel(e.level)}**/${(e.ascension * 10) + 20} ➜ ${getAscension(e.ascension)}`);
    };

    return [];
};

function itemsToShow(show: any[], type: "weapon" | "loot" = "loot", locked: string[] = []) {
    let desc = "";
    if (show.find((e) => (type === "loot" ? items[e[0]].grade : items[e.itemid].grade) === "genesis")) desc += "\n\n<:genesis1:1041725784546619502><:genesis2:1041725782176825485><:genesis3:1041725778611675237><:genesis4:1041725780218093629>\n" + list("genesis", show, type, locked).join("\n");
    if (show.find((e) => (type === "loot" ? items[e[0]].grade : items[e.itemid].grade) === "mythical")) desc += "\n\n<:mythical1:1041726768530329690><:mythical2:1041726767188168724><:mythical3:1041726765577556039><:mythical4:1041726763862065162>\n" + list("mythical", show, type, locked).join("\n");
    if (show.find((e) => (type === "loot" ? items[e[0]].grade : items[e.itemid].grade) === "legendary")) desc += "\n\n<:legendary1:1041726519082491964><:legendary2:1041726517153112094><:legendary3:1041726515475382322><:legendary4:1041726512992366605>\n" + list("legendary", show, type, locked).join("\n");
    if (show.find((e) => (type === "loot" ? items[e[0]].grade : items[e.itemid].grade) === "unique")) desc += "\n\n<:unique1:1041730066272493578><:unique2:1041730063940468828><:unique3:1041730061163831437><:unique4:1041730057380573386>\n" + list("unique", show, type, locked).join("\n");
    if (show.find((e) => (type === "loot" ? items[e[0]].grade : items[e.itemid].grade) === "rare")) desc += "\n\n<:rare1:1041731092031492106><:rare2:1041731088357281802><:rare3:1041731083965825096>\n" + list("rare", show, type, locked).join("\n");
    if (show.find((e) => (type === "loot" ? items[e[0]].grade : items[e.itemid].grade) === "special")) desc += "\n\n<:special1:1041731419963150397><:special2:1041731418008600717><:special3:1041731415919833149><:special4:1041731414032392202>\n" + list("special", show, type, locked).join("\n");
    if (show.find((e) => (type === "loot" ? items[e[0]].grade : items[e.itemid].grade) === "normal")) desc += "\n\n<:normal1:1041732429397889054><:normal2:1041732425379762268><:normal3:1041732422145953892><:normal4:1041732419591622686>\n" + list("normal", show, type, locked).join("\n");
    return desc;
};

function detailedPage(item: WeaponSchema) {
    // const { 0: item } = await query(`SELECT * FROM weapons WHERE uniqueid = '${uid}'`);
    let itemLevel = getItemLevel(item.level);
    const fItem = items[item.itemid];

    const Embed = new EmbedBuilder()
        .setColor(0xbbffff)
        .setTitle(fItem.name)
        .setThumbnail(fItem.image);

    if (fItem instanceof weaponInfo) {
        let pstat = 0, sstat = 0;

        // Primary Stat
        if (["atk%", "md%", "cr", "cd", "dodge", "br"].includes(fItem.primaryStat)) {
            if (fItem.primaryStat.endsWith("%")) {
                pstat += (1 + Math.floor(fItem.psmin + ((fItem.psmax - fItem.psmin) / 150) * ((itemLevel - 1) + (item.ascension * 3))) / 100);
            } else {
                pstat += (fItem.psmin + ((fItem.psmax - fItem.psmin) * ((itemLevel - 1) + (item.ascension * 3)) / 150)) / 100;
            };
        } else {
            pstat += Math.floor(fItem.psmin + ((fItem.psmax - fItem.psmin) / 150) * ((itemLevel - 1) + (item.ascension * 3)));
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

        Embed.setDescription(`**Grade**: ${fItem.gradeEmote}\n**Type**: ${fItem.type[0].toUpperCase() + fItem.type.slice(1)}\n**Level**: ${"**" + itemLevel + "**/" + ((item.ascension * 10) + 20) + " ➜ " + getAscension(item.ascension)}\n\n**Primary Stat**: ${pstat} ${customEmojis[fItem.primaryStat] || fItem.primaryStat}\n**Secondary Stat**: ${sstat < 1 ? Math.round(sstat * 100) + "%" : sstat} ${customEmojis[fItem.secondaryStat] || fItem.secondaryStat}\n\n**Passive**: ${fItem.buffdesc}`);
    } else if (fItem instanceof armorInfo) {
        const set = items.filter((e) => ("setname" in e && e.setname === fItem.setname)) as armorInfo[];

        let pstat = 0;
        pstat += Math.floor(fItem.psmin + ((fItem.psmax - fItem.psmin) / 150) * ((itemLevel - 1) + (item.ascension * 3)));

        Embed.setDescription(`**Grade**: ${fItem.gradeEmote}\n**Type**: ${fItem.type[0].toUpperCase() + fItem.type.slice(1)}\n**Level**: ${"**" + itemLevel + "**/" + ((item.ascension * 10) + 20) + " ➜ " + getAscension(item.ascension)}\n\n**${fItem.setname}**: ${set[0].emoji + set[1].emoji + set[2].emoji + set[3].emoji}\n**Primary Stat**: ${pstat} ${customEmojis[fItem.primaryStat] || fItem.primaryStat}\n\n**Set Bonus**: ${set[3].buffdesc}`);
    } else if (fItem instanceof ringInfo) {
        Embed.setDescription(`**Grade**: ${fItem.gradeEmote}\n**Type**: ${fItem.type[0].toUpperCase() + fItem.type.slice(1)}\n**Obtain**: ${fItem.obtain.join(", ")}\n**Ascension**: **${item.level + 1}**/${fItem.maxlevel}\n\n**Passive${fItem.maxlevel > (item.level + 1) ? ` (Asc. ${item.level + 1})` : ""}**: ${fItem.getBuffDesc(item.level + 1)}${fItem.maxlevel > 1 ? `\n\n**Passive${fItem.maxlevel > 2 ? ` (Asc. ${fItem.maxlevel})` : ""}**: ${fItem.getBuffDesc(fItem.maxlevel)}` : ""}`);
    };

    return Embed;
};

const exportCommand: SlashCommand = {
    name: 'items',
    async execute({ interaction, author }) {

        await interaction.deferReply().catch(() => {
            return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
        });

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user') ?? interaction.user;
        const page = interaction.options.getInteger('page') || 1;
        const type = interaction.options.getString('type') ?? "";
        const flag = interaction.options.getString('flag');

        const stats = user.id === interaction.user.id ? author.schema : await getUserSchema(user.id);
        if (!stats) return interaction.editReply(`${user.id === interaction.user.id ? "You don't have any" : `**${user.username}** has no`} items.`);

        let thumbnail = characters[stats.chars[Math.floor(Math.random() * stats.chars.length)]].image;
        if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[interaction.user.id]?.cimg[stats.favchar], stats.char_skin[stats.favchar]);

        if (subcommand === "loot") {
            let itemsR = Object.entries(stats.items);
            itemsR = itemsR.filter((e) => (items[parseInt(e[0])].category === "loot" || items[parseInt(e[0])].type === "fish") && e[1]);
            if (type === "loot") itemsR = itemsR.filter((e) => items[parseInt(e[0])].category === type);
            else if (["chest", "fish"].includes(type)) itemsR = itemsR.filter((e) => items[parseInt(e[0])].type === type);
            else if (["ascension", "crafting", "levelup"].includes(type)) itemsR = itemsR.filter((e) => items[parseInt(e[0])].type === type + " material");

            // Return if empty
            if (!itemsR.length) return interaction.editReply(`${user.id === interaction.user.id ? "You don't have any" : `**${user.username}** has no`} items.`);

            // Sort elements
            itemsR.sort((a, b) => items[parseInt(b[0])].gradeValue - items[parseInt(a[0])].gradeValue);

            // Setup Pages
            let elementsPerPage = 10;
            let pagesTotal = Math.ceil(itemsR.length / elementsPerPage);
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
                .setAuthor({ name: `${user.username}'s inventory`, iconURL: user.displayAvatarURL({ size: 512 }) })
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

                    showItems = showPage(currPage, itemsR, elementsPerPage);
                    desc = itemsToShow(showItems);

                    Embed.setDescription(desc).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed], components: [PageRow] });
                });
            });
        };

        let itemsR = await getUserWeapons(user.id);
        itemsR = itemsR.filter((e) => items[e.itemid].category === subcommand);

        if (type === "sets") {
            itemsR.sort((a, b) => {
                const itemA = items[a.itemid];
                const itemB = items[b.itemid];
                if ('setname' in itemA && 'setname' in itemB) {
                    return itemA.setname.localeCompare(itemB.setname);
                };
                return 0;
            });
        } else if (type) {
            itemsR = itemsR.filter((e) => items[e.itemid].type === type);
        };

        // Return if empty
        if (!itemsR.length) return interaction.editReply(`${user.id === interaction.user.id ? "You don't have any" : `**${user.username}** has no`} items.`);

        // Sort elements
        if (type === "sets") itemsR.sort((a, b) => (items[b.itemid].gradeValue - items[a.itemid].gradeValue) + (items[b.itemid].grade === items[a.itemid].grade ? (b.level + b.ascension) - (a.level + a.ascension) : 0));
        else itemsR.sort((a, b) => (items[b.itemid].gradeValue - items[a.itemid].gradeValue) + (items[b.itemid].grade === items[a.itemid].grade ? (b.level + b.ascension) - (a.level + a.ascension) : 0) + (items[b.itemid].grade === items[a.itemid].grade && (b.level + b.ascension) === (a.level + a.ascension) ? items[a.itemid].name.localeCompare(items[b.itemid].name) : 0));

        // Setup Pages
        const elementsPerPage = (flag === "detailed") ? 1 : 10;
        const pagesTotal = Math.ceil(itemsR.length / elementsPerPage);
        let currPage = 1;
        if (page <= pagesTotal && page > 0) {
            currPage = page;
        };

        // Filter items to show on the current page
        let showItems = showPage(currPage, itemsR, elementsPerPage);

        // Join elements to string
        let desc = itemsToShow(showItems, "weapon", stats.itemlock);

        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setAuthor({ name: `${user.username}'s inventory`, iconURL: user.displayAvatarURL({ size: 512 }) })
            .setThumbnail(thumbnail)
            .setDescription(desc)
            .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
        if (pagesTotal === 1) return interaction.editReply({ embeds: [flag === "detailed" ? detailedPage(itemsR[currPage - 1]).setFooter({ text: `Page ${currPage}/${pagesTotal}` }) : Embed] });
        return interaction.editReply({ embeds: [flag === "detailed" ? detailedPage(itemsR[currPage - 1]).setFooter({ text: `Page ${currPage}/${pagesTotal}` }) : Embed], components: [PageRow] }).then(msg => {
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
                desc = itemsToShow(showItems, "weapon", stats.itemlock);

                Embed.setDescription(desc).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                interaction.editReply({ embeds: [flag === "detailed" ? detailedPage(itemsR[currPage - 1]).setFooter({ text: `Page ${currPage}/${pagesTotal}` }) : Embed], components: [PageRow] });
            });
        });
    },
};

export default exportCommand;
