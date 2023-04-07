/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");
const { searchAnime, showPage, splitTitle, rarity } = require("../Modules/functions.js");
const { PageRow } = require("../Modules/components.js");

module.exports = {
    name: 'search',
	description: 'Search an anime',
	execute(interaction) {

        const anime = interaction.options.getString('anime');
        const user = interaction.options.getUser('user') || interaction.user;
        const page = interaction.options.getInteger('page');
        const searchflag = interaction.options.getString('flags');
        
        db.serialize(async () => {
            let inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
            if (!inv[0]) inv[0] = {chars: "[]"};
            inv = {chars: JSON.parse(inv[0].chars)};

            let uniq = [...new Set(inv.chars)];
            let chars = uniq.map((e) => characters[e]);

            let fastCheck = searchAnime(anime, inv.chars, interaction);
            if (!fastCheck.length) return;
            
            let sorted = {"SS": [], "S": [], "A": [], "B": [], "C": [], "D": []};
            fastCheck.forEach((b) => sorted[b.rarity].push(b));
            let allChars = sorted["SS"].concat(sorted["S"]).concat(sorted["A"]).concat(sorted["B"]).concat(sorted["C"]).concat(sorted["D"]);
            let charsOwned = chars.filter((b) => b.anime === fastCheck[0].anime);

            if (searchflag === null) {
                
                // Setup Pages
                const elementsPerPage = 15;
                let pagesTotal = Math.ceil(fastCheck.length / elementsPerPage);
                let currPage = 1;
                if (page <= pagesTotal && page > 0) {
                    currPage = page;
                };
                let left = allChars.length % elementsPerPage;
    
                // eslint-disable-next-line no-inner-declarations
                function tierNames(t, arr=[]) {
                    for (let h=0; h < t.length; h++) {
                        if (uniq.includes(t[h].id)) {
                            arr.push(`${t[h].name} <a:check:873196253276700682>`);
                        } else {
                            arr.push(t[h].name);
                        };
                    };
                    return arr;
                };
                
                // eslint-disable-next-line no-inner-declarations
                function charPage(desc="") {
                    const showChars = showPage(currPage, pagesTotal, left, allChars, elementsPerPage);
                    let sorted = {"SS": [], "S": [], "A": [], "B": [], "C": [], "D": []};
                    showChars.forEach((b) => sorted[b.rarity].push(b));
                    let emoji = {"SS": "<:SSTier:869316489931546644>", "S": "<:STier:869316518675095552>", "A": "<:ATier:869316558013464627>", "B": "<:BTier:869316586803179571>", "C": "<:CTier:869316602858991657>", "D": "<:DTier:869316616071032843>"};
                    Object.keys(sorted).forEach((b) => sorted[b].length ? desc += `\n\n${emoji[b]} **Tier**\n> ` + tierNames(sorted[b]).join("\n> ") : false)
                    return desc;
                };
                
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setTitle(`**${fastCheck[0].anime}** (` + charsOwned.length + "/" + fastCheck.length + ")")
                .setThumbnail(allChars[0].image)
                .setDescription(charPage())
                .setFooter(`Page ${currPage}/${pagesTotal}`)
                if (fastCheck.length < 16) return interaction.reply({ embeds: [Embed] });
                return interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {

                    const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                    const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });
    
                    prev.on('collect', async r => {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;

                        Embed.setDescription(charPage()).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed] });
                    });

                    next.on('collect', async r => {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;

                        Embed.setDescription(charPage()).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed] });
                    });

                });
            };

            if (searchflag === "image") {
    
                let aTitle = splitTitle(fastCheck[0].anime);
    
                let pagesTotal = allChars.length;
                let currPage = 1;
                if (page <= pagesTotal && page > 0) {
                    currPage = page;
                };

                const Embed = new MessageEmbed()
                .setColor({D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, default: 0xbbffff}[allChars[currPage-1].rarity])
                .setThumbnail(rarity(allChars[currPage-1].rarity))
                .setDescription(`**${allChars[currPage-1].name}**${uniq.includes(allChars[currPage-1].id) ? " <a:check:873196253276700682>" : ""}\n**${aTitle}** (${charsOwned.length}/${allChars.length})\n**ID**: #${allChars[currPage-1].id}`)
                .setImage(allChars[currPage-1].image)
                .setFooter(`Page ${currPage}/${pagesTotal}`)
                return interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {

                    const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                    const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                    prev.on('collect', async r => {
                        currPage > 1 ? currPage-- : currPage = pagesTotal;
                        Embed.setThumbnail(rarity(allChars[currPage-1].rarity)).setDescription(`**${allChars[currPage-1].name}**${uniq.includes(allChars[currPage-1].id) ? " <a:check:873196253276700682>" : ""}\n**${aTitle}** (${charsOwned.length}/${allChars.length})\n**ID**: #${allChars[currPage-1].id}`).setImage(allChars[currPage-1].image).setColor({D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, default: 0xbbffff}[allChars[currPage-1].rarity]).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed] });
                    });

                    next.on('collect', async r => {
                        currPage < pagesTotal ? currPage++ : currPage = 1;
                        Embed.setThumbnail(rarity(allChars[currPage-1].rarity)).setDescription(`**${allChars[currPage-1].name}**${uniq.includes(allChars[currPage-1].id) ? " <a:check:873196253276700682>" : ""}\n**${aTitle}** (${charsOwned.length}/${allChars.length})\n**ID**: #${allChars[currPage-1].id}`).setImage(allChars[currPage-1].image).setColor({D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, default: 0xbbffff}[allChars[currPage-1].rarity]).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed] });
                    });
                    
                });
            };

        });

    },
};