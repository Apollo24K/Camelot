/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");
const { items } = require("../Modules/items.js");
const { showPage, getItemLevel } = require("../Modules/functions.js");
const { PageRow } = require("../Modules/components.js");

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
        default: asc = "<:empty_star:986912448512688148>".repeat(5); break;
    };
    return asc;
};

function list(grade, show, type) {
    if (type === "loot") {
        const arr = [], t = show.filter((b) => items[b[0]].grade === grade);
        for (let h=0; h < t.length; h++) {
            arr.push(items[t[h][0]].bar + items[t[h][0]].name + " | " + items[t[h][0]].emoji + " x" + t[h][1]);
        };
        return arr;
    } else if (type === "weapon") {
        return show.sort((a, b) => (b.level+b.ascension) - (a.level+a.ascension)).filter((b) => items[b.itemid].grade === grade).map((e) => items[e.itemid].bar + "`" + e.uniqueid.split(":")[0] + "` | " + items[e.itemid].emoji + " __**" + items[e.itemid].name + "**__ Lvl. **" + getItemLevel(e.level) + "**/" + ((e.ascension*10)+20) + " ➜ " + getAscension(e.ascension))
    };
};

function itemsToShow(show, type="loot") {
    let desc = "";
    if (show.find((e) => (type === "loot" ? items[e[0]].grade : items[e.itemid].grade) === "genesis")) desc += "\n\n<:genesis1:1041725784546619502><:genesis2:1041725782176825485><:genesis3:1041725778611675237><:genesis4:1041725780218093629>\n" + list("genesis", show, type).join("\n");
    if (show.find((e) => (type === "loot" ? items[e[0]].grade : items[e.itemid].grade) === "mythical")) desc += "\n\n<:mythical1:1041726768530329690><:mythical2:1041726767188168724><:mythical3:1041726765577556039><:mythical4:1041726763862065162>\n" + list("mythical", show, type).join("\n");
    if (show.find((e) => (type === "loot" ? items[e[0]].grade : items[e.itemid].grade) === "legendary")) desc += "\n\n<:legendary1:1041726519082491964><:legendary2:1041726517153112094><:legendary3:1041726515475382322><:legendary4:1041726512992366605>\n" + list("legendary", show, type).join("\n");
    if (show.find((e) => (type === "loot" ? items[e[0]].grade : items[e.itemid].grade) === "unique")) desc += "\n\n<:unique1:1041730066272493578><:unique2:1041730063940468828><:unique3:1041730061163831437><:unique4:1041730057380573386>\n" + list("unique", show, type).join("\n");
    if (show.find((e) => (type === "loot" ? items[e[0]].grade : items[e.itemid].grade) === "rare")) desc += "\n\n<:rare1:1041731092031492106><:rare2:1041731088357281802><:rare3:1041731083965825096>\n" + list("rare", show, type).join("\n");
    if (show.find((e) => (type === "loot" ? items[e[0]].grade : items[e.itemid].grade) === "special")) desc += "\n\n<:special1:1041731419963150397><:special2:1041731418008600717><:special3:1041731415919833149><:special4:1041731414032392202>\n" + list("special", show, type).join("\n");
    if (show.find((e) => (type === "loot" ? items[e[0]].grade : items[e.itemid].grade) === "normal")) desc += "\n\n<:normal1:1041732429397889054><:normal2:1041732425379762268><:normal3:1041732422145953892><:normal4:1041732419591622686>\n" + list("normal", show, type).join("\n");
    return desc;
};

module.exports = {
    name: 'items',
	description: 'item inventory',
	execute(interaction) {

        let subcommand = interaction.options.getSubcommand();
        let user = interaction.options.getUser('user') || interaction.user;
        let page = interaction.options.getInteger('page');
        let type = interaction.options.getString('type') || false;

        let customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        
        db.serialize(async () => {
            await interaction.deferReply().catch((err) => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });
            
            let stats = await query(`SELECT users.favchar, users.premium, users.items, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id WHERE users.id = ${user.id}`);
            if (!stats[0]) return interaction.editReply(`${user.id === interaction.user.id ? "You don't have any" : `**${user.username}** has no`} items.`);
            stats = {favchar: stats[0].favchar, premium: stats[0].premium, items: JSON.parse(stats[0].items), chars: JSON.parse(stats[0].chars), skin: JSON.parse(stats[0].skin)};

            let thumbnail = characters[stats.chars[Math.floor(Math.random() * stats.chars.length)]].image;
            if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[interaction.user.id]?.cimg[stats.favchar], stats.skin[stats.favchar]);
            
            if (subcommand === "loot") {
                let itemsR = Object.entries(stats.items);
                itemsR = itemsR.filter((e) => (items[e[0]].category === "loot" || items[e[0]].type === "fish") && e[1]);
                
                // Return if empty
                if (!itemsR.length) return interaction.editReply(`${user.id === interaction.user.id ? "You don't have any" : `**${user.username}** has no`} items.`);

                // Sort elements
                itemsR.sort((a,b) => items[b[0]].gradeValue - items[a[0]].gradeValue);

                // Setup Pages
                let elementsPerPage = 10;
                let pagesTotal = Math.ceil(itemsR.length / elementsPerPage);
                let currPage = 1;
                if (page <= pagesTotal && page > 0) {
                    currPage = page;
                };
                let left = itemsR.length % elementsPerPage;

                // Filter items to show on the current page
                let showItems = showPage(currPage, pagesTotal, left, itemsR, elementsPerPage);

                // Join elements to string
                let desc = itemsToShow(showItems);

                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                .setThumbnail(thumbnail)
                .setDescription(desc)
                .setFooter(`Page ${currPage}/${pagesTotal}`)
                if (pagesTotal === 1) return interaction.editReply({ embeds: [Embed] });
                interaction.editReply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {

                    const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                    const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                    prev.on('collect', async r => {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;

                        showItems = showPage(currPage, pagesTotal, left, itemsR, elementsPerPage);
                        desc = itemsToShow(showItems);

                        Embed.setDescription(desc).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [PageRow] });
                    });

                    next.on('collect', async r => {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;

                        showItems = showPage(currPage, pagesTotal, left, itemsR, elementsPerPage);
                        desc = itemsToShow(showItems);

                        Embed.setDescription(desc).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [PageRow] });
                    });
                    
                });
                
            } else if (subcommand === "weapons") {
                let itemsR = await query(`SELECT * FROM weapons WHERE id = ${user.id}`);
                itemsR = itemsR.filter((e) => items[e.itemid].category === "weapon");
                if (type) itemsR = itemsR.filter((e) => items[e.itemid].type === type);

                // Return if empty
                if (!itemsR.length) return interaction.editReply(`${user.id === interaction.user.id ? "You don't have any" : `**${user.username}** has no`} items.`);
                
                // Sort elements
                itemsR.sort((a,b) => items[b.itemid].gradeValue - items[a.itemid].gradeValue);

                // Setup Pages
                let elementsPerPage = 10;
                let pagesTotal = Math.ceil(itemsR.length / elementsPerPage);
                let currPage = 1;
                if (page <= pagesTotal && page > 0) {
                    currPage = page;
                };
                let left = itemsR.length % elementsPerPage;

                // Filter items to show on the current page
                let showItems = showPage(currPage, pagesTotal, left, itemsR, elementsPerPage);

                // Join elements to string
                let desc = itemsToShow(showItems, "weapon");

                // "\n\n<:special1:1041731419963150397><:special2:1041731418008600717><:special3:1041731415919833149><:special4:1041731414032392202>\n<:bars:994957077787197450>`sjK` | <:arondite:1059125083693662228> **__Arondite__** Lvl. **140**/140 ➜ <:awakened_star:1047516493312704592><:awakened_star:1047516493312704592><:embeded_star:986912452333699072><:embeded_star:986912452333699072><:embeded_star:986912452333699072>\n<:bars:994957077787197450>`k3` | <:faded_glory:1059125088387088414> **__Faded Glory__** Lvl. **82**/90 ➜ <:embeded_star:986912452333699072><:embeded_star:986912452333699072><:embeded_star:986912452333699072><:half_embeded_star:986912446956584960><:empty_star:986912448512688148>\n<:normal1:1041732429397889054><:normal2:1041732425379762268><:normal3:1041732422145953892><:normal4:1041732419591622686>\n<:barn:994957076264661073>`4sFg35` | <:apprentices_sword:1047918897573142619> **__Apprentice's Sword__** Lvl. **150**/150 ➜ <:awakened_star:1047516493312704592><:awakened_star:1047516493312704592><:awakened_star:1047516493312704592><:embeded_star:986912452333699072><:embeded_star:986912452333699072>"

                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                .setThumbnail(thumbnail)
                .setDescription(desc)
                .setFooter(`Page ${currPage}/${pagesTotal}`)
                if (pagesTotal === 1) return interaction.editReply({ embeds: [Embed] });
                interaction.editReply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {

                    const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                    const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                    prev.on('collect', async r => {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;

                        showItems = showPage(currPage, pagesTotal, left, itemsR, elementsPerPage);
                        desc = itemsToShow(showItems, "weapon");

                        Embed.setDescription(desc).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [PageRow] });
                    });

                    next.on('collect', async r => {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;

                        showItems = showPage(currPage, pagesTotal, left, itemsR, elementsPerPage);
                        desc = itemsToShow(showItems, "weapon");

                        Embed.setDescription(desc).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [PageRow] });
                    });
                    
                });
            } else if (subcommand === "armor") {
                let itemsR = await query(`SELECT * FROM weapons WHERE id = ${user.id}`);
                itemsR = itemsR.filter((e) => items[e.itemid].category === "armor");
                if (type && type !== "sets") itemsR = itemsR.filter((e) => items[e.itemid].type === type);
                else if (type === "sets") itemsR.sort((a, b) => items[a.itemid].setname.localeCompare(items[b.itemid].setname));

                // Return if empty
                if (!itemsR.length) return interaction.editReply(`${user.id === interaction.user.id ? "You don't have any" : `**${user.username}** has no`} items.`);
                
                // Sort elements
                itemsR.sort((a,b) => items[b.itemid].gradeValue - items[a.itemid].gradeValue);

                // Setup Pages
                let elementsPerPage = 10;
                let pagesTotal = Math.ceil(itemsR.length / elementsPerPage);
                let currPage = 1;
                if (page <= pagesTotal && page > 0) {
                    currPage = page;
                };
                let left = itemsR.length % elementsPerPage;

                // Filter items to show on the current page
                let showItems = showPage(currPage, pagesTotal, left, itemsR, elementsPerPage);

                // Join elements to string
                let desc = itemsToShow(showItems, "weapon");

                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                .setThumbnail(thumbnail)
                .setDescription(desc)
                .setFooter(`Page ${currPage}/${pagesTotal}`)
                if (pagesTotal === 1) return interaction.editReply({ embeds: [Embed] });
                interaction.editReply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {

                    const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                    const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                    prev.on('collect', async r => {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;

                        showItems = showPage(currPage, pagesTotal, left, itemsR, elementsPerPage);
                        desc = itemsToShow(showItems, "weapon");

                        Embed.setDescription(desc).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [PageRow] });
                    });

                    next.on('collect', async r => {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;

                        showItems = showPage(currPage, pagesTotal, left, itemsR, elementsPerPage);
                        desc = itemsToShow(showItems, "weapon");

                        Embed.setDescription(desc).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [PageRow] });
                    });
                    
                });
            };

        });

    },
};