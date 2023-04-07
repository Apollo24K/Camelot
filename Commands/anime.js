/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { characters, auniq } = require("../Modules/chars.js");
const { showPage } = require("../Modules/functions.js");
const { PageRow } = require("../Modules/components.js");
const { db, query } = require("../db_handler.js");

function itemsToShow(show, chars) {
    let showAnime = [];
    for (const anime of show) {
        let charsOwned = chars.filter((b) => b.anime === anime);
        let charsInTotal = characters.filter((b) => b.anime === anime);
        if (charsOwned.length === charsInTotal.length) {
            showAnime.push(`‧ ${anime} <a:check:873196253276700682>`);
        } else {
            showAnime.push(`‧ ${anime} **(${charsOwned.length}/${charsInTotal.length})**`);
        };
    }
    return showAnime.join("\n");
};

module.exports = {
    name: 'anime',
	description: 'List all anime',
	execute(interaction) {

        const user = interaction.options.getUser('user') || interaction.user;
        const page = interaction.options.getInteger('page');
        
        db.serialize(async () => {
            let inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
            if (!inv[0]) inv[0] = {chars: "[]"};
            inv = {chars: JSON.parse(inv[0].chars)};

            let uniq = auniq.sort();
            let chars = [...new Set(inv.chars)].map((e) => characters[e]);

            let aniCompleted = 0;
            for (let i=0; i < uniq.length; i++) {
                let animeCheck = characters.filter((e) => e.anime === uniq[i]).length;
                let invCheck = chars.filter((e) => e.anime === uniq[i]).length;
                if (animeCheck === invCheck) aniCompleted++;
            };

            // Setup Pages
            const elementsPerPage = 15;
            let pagesTotal = Math.ceil(uniq.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };
            let left = uniq.length % elementsPerPage;

            // Filter items to show on the current page
            let showAnime = showPage(currPage, pagesTotal, left, uniq, elementsPerPage);
            let desc = itemsToShow(showAnime, chars);

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle(`**Anime Included** (${aniCompleted}/${uniq.length})`)
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setDescription(desc)
            .setFooter(`Page ${currPage}/${pagesTotal}`)
            interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then((msg) => {
                
                const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                prev.on('collect', async r => {
                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;

                    // Filter items to show on the current page
                    let showAnime = showPage(currPage, pagesTotal, left, uniq, elementsPerPage);
                    let desc = itemsToShow(showAnime, chars);

                    Embed.setDescription(desc).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed] });
                });

                next.on('collect', async r => {
                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;

                    // Filter items to show on the current page
                    let showAnime = showPage(currPage, pagesTotal, left, uniq, elementsPerPage);
                    let desc = itemsToShow(showAnime, chars);
                    
                    Embed.setDescription(desc).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed] });
                });

            });
        });

    },
};