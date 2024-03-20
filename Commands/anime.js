const { EmbedBuilder, ComponentType } = require("discord.js");
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
    return showAnime;
};

function getMissingAmount(str) {
    const matches = str.match(/(\d+)\/(\d+)/);
    if (matches?.length !== 3) return 0;
    return parseInt(matches[2]) - parseInt(matches[1]);
};

module.exports = {
    name: 'anime',
    description: 'List all anime',
    execute(interaction) {

        const filter = interaction.options.getString('filter');
        const user = interaction.options.getUser('user') || interaction.user;
        const page = interaction.options.getInteger('page');

        db.serialize(async () => {
            let inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
            if (!inv[0]) inv[0] = { chars: "[]" };
            inv = { chars: JSON.parse(inv[0].chars) };

            let uniq = [...new Set(auniq.sort())];
            let chars = [...new Set(inv.chars)].map((e) => characters[e]);

            let aniCompleted = 0;
            for (let i = uniq.length - 1; i >= 0; i--) {
                let animeCheck = characters.filter((e) => e.anime === uniq[i]).length;
                let invCheck = chars.filter((e) => e.anime === uniq[i]).length;
                if (animeCheck === invCheck) {
                    aniCompleted++;
                    if (filter === "missing") uniq.splice(i, 1);
                } else if (filter === "completed") uniq.splice(i, 1);
            };

            // Add completion status
            uniq = itemsToShow(uniq, chars);

            if (filter === "missing") {
                if (!uniq.length) return interaction.reply(`You have no missing anime left!`);
                uniq.sort((a, b) => getMissingAmount(a) - getMissingAmount(b));
            };

            // Setup Pages
            const elementsPerPage = 15;
            let pagesTotal = Math.ceil(uniq.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            let showAnime = showPage(currPage, uniq, elementsPerPage);

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(filter === null ? `**Anime Included** (${aniCompleted}/${auniq.length})` : filter === "completed" ? `**Anime Completed** (${aniCompleted}/${auniq.length})` : `**Anime Missing** (${auniq.length - aniCompleted}/${auniq.length})`)
                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                .setDescription(showAnime.join("\n"))
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            return interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then((msg) => {

                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    showAnime = showPage(currPage, uniq, elementsPerPage);

                    Embed.setDescription(showAnime.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed] });
                });

            });
        });

    },
};