/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");
const { showPage } = require("../Modules/functions.js");
const { PageRow } = require("../Modules/components.js");

module.exports = {
    name: 'inventory',
	description: 'Search an anime',
	execute(interaction) {

        let user = interaction.options.getUser('user') || interaction.user;
        let page = interaction.options.getInteger('page');
        let sort = interaction.options.getString('sort') || "rarity";

        let customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        
        db.serialize(async () => {
            await interaction.deferReply().catch((err) => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });
            
            let stats = await query(`SELECT users.favchar, users.premium, characters.skin FROM users JOIN characters ON users.id = characters.id WHERE users.id = ${user.id}`);
            if (!stats[0]) return interaction.editReply(`${user.id === interaction.user.id ? "You don't have any" : `**${user.username}** has no`} characters.`);
            stats = {favchar: stats[0].favchar, premium: stats[0].premium, skin: JSON.parse(stats[0].skin)};

            let inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
            inv = {chars: JSON.parse(inv[0].chars)};

            let uniq = [...new Set(inv.chars)];
            let chars = uniq.map((e) => characters[e].name);
            if (sort === "alphabetical") chars.sort();

            let pagesTotal = Math.ceil(uniq.length / 15);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            let thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image;
            if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[interaction.user.id]?.cimg[stats.favchar], stats.skin[stats.favchar]);

            if (sort === "rarity" || sort === "dupes") {
                
                const invd = new Map();

                let charsR;
                
                if (sort === "dupes") {
                    let names = inv.chars.sort();
                    let len = names.length-1;
                    while (len--) if (names[len-1] === names[len]) invd.has(names[len]) ? invd.set(names[len], invd.get(names[len])+1) : invd.set(names[len], 2);
                    
                    uniq = [...invd.keys()];
                    pagesTotal = Math.ceil(uniq.length / 15);
                    currPage = 1;
                    if (page <= pagesTotal && page > 0) {
                        currPage = page;
                    };
                    charsR = uniq.map((e) => characters[e]).sort((a, b) => b.rarityValue === a.rarityValue ? invd.get(b.id) - invd.get(a.id) : (b.rarityValue - a.rarityValue));
                    // charsR = uniq.map((e) => characters[e]).filter((e) => e.rarity === "SS").sort((a, b) => invd.get(b.id) - invd.get(a.id)).concat(uniq.map((e) => characters[e]).filter((e) => e.rarity === "S").sort((a, b) => invd.get(b.id) - invd.get(a.id))).concat(uniq.map((e) => characters[e]).filter((e) => e.rarity === "A").sort((a, b) => invd.get(b.id) - invd.get(a.id))).concat(uniq.map((e) => characters[e]).filter((e) => e.rarity === "B").sort((a, b) => invd.get(b.id) - invd.get(a.id))).concat(uniq.map((e) => characters[e]).filter((e) => e.rarity === "C").sort((a, b) => invd.get(b.id) - invd.get(a.id))).concat(uniq.map((e) => characters[e]).filter((e) => e.rarity === "D").sort((a, b) => invd.get(b.id) - invd.get(a.id)));
                } else {
                    charsR = uniq.map((e) => characters[e]).sort((a, b) => b.rarityValue - a.rarityValue);
                };

                let left = uniq.length % 15;
                let showChars = showPage(currPage, pagesTotal, left, charsR);

                // eslint-disable-next-line no-inner-declarations
                function tierNamesInv(rarity) {
                    const arr = [], t = showChars.filter((b) => b.rarity === rarity);
                    if (sort === "dupes") {
                        
                        for (let h=0; h < t.length; h++) {
                            arr.push(t[h].name + ` | **x${invd.get(t[h].id)}**`);
                        };
                    } else {
                        for (let h=0; h < t.length; h++) {
                            arr.push(t[h].name);
                        };
                    };
                    return arr;
                };

                let desc = "";
                
                if (showChars.find((e) => e.rarity === "SS")) desc += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNamesInv("SS").join("\n> ");
                if (showChars.find((e) => e.rarity === "S")) desc += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNamesInv("S").join("\n> ");
                if (showChars.find((e) => e.rarity === "A")) desc += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNamesInv("A").join("\n> ");
                if (showChars.find((e) => e.rarity === "B")) desc += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNamesInv("B").join("\n> ");
                if (showChars.find((e) => e.rarity === "C")) desc += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNamesInv("C").join("\n> ");
                if (showChars.find((e) => e.rarity === "D")) desc += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNamesInv("D").join("\n> ");

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

                        showChars = showPage(currPage, pagesTotal, left, charsR);

                        desc = "";

                        if (showChars.find((e) => e.rarity === "SS")) desc += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNamesInv("SS").join("\n> ");
                        if (showChars.find((e) => e.rarity === "S")) desc += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNamesInv("S").join("\n> ");
                        if (showChars.find((e) => e.rarity === "A")) desc += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNamesInv("A").join("\n> ");
                        if (showChars.find((e) => e.rarity === "B")) desc += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNamesInv("B").join("\n> ");
                        if (showChars.find((e) => e.rarity === "C")) desc += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNamesInv("C").join("\n> ");
                        if (showChars.find((e) => e.rarity === "D")) desc += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNamesInv("D").join("\n> ");
                        
                        Embed.setDescription(desc).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [PageRow] });
                    });

                    next.on('collect', async r => {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;

                        showChars = showPage(currPage, pagesTotal, left, charsR);

                        desc = "";
    
                        if (showChars.find((e) => e.rarity === "SS")) desc += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNamesInv("SS").join("\n> ");
                        if (showChars.find((e) => e.rarity === "S")) desc += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNamesInv("S").join("\n> ");
                        if (showChars.find((e) => e.rarity === "A")) desc += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNamesInv("A").join("\n> ");
                        if (showChars.find((e) => e.rarity === "B")) desc += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNamesInv("B").join("\n> ");
                        if (showChars.find((e) => e.rarity === "C")) desc += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNamesInv("C").join("\n> ");
                        if (showChars.find((e) => e.rarity === "D")) desc += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNamesInv("D").join("\n> ");

                        Embed.setDescription(desc).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [PageRow] });
                    });
                    
                });
                return;
            };

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setThumbnail(thumbnail)
            .setFooter(`Page ${currPage}/${pagesTotal}`)
            if (pagesTotal === 1) return interaction.editReply({ embeds: [Embed.setDescription(chars.join('\n'))] });
        
            let left = uniq.length % 15;
            let showChars = showPage(currPage, pagesTotal, left, chars);
            
            interaction.editReply({ embeds: [Embed.setDescription(showChars.join('\n'))], components: [PageRow], fetchReply: true }).then(msg => {

                const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                prev.on('collect', async r => {
                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;

                    let showChars = showPage(currPage, pagesTotal, left, chars);

                    Embed.setDescription(showChars.join('\n')).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [PageRow] });
                });
                  
                next.on('collect', async r => {
                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;

                    let showChars = showPage(currPage, pagesTotal, left, chars);

                    Embed.setDescription(showChars.join('\n')).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [PageRow] });
                });

            });

        });

    },
};