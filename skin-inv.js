/* eslint-disable no-unused-vars */
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { characters } = require("../Modules/chars.js");
const { skins } = require("../Modules/skins.js");
const { search, showPage } = require("../Modules/functions.js");

module.exports = {
    name: 'skins',
    description: 'see your skins',
    execute(interaction) {

        let user = interaction.options.getUser('user') || interaction.user;
        const filter = interaction.options.getString('filter');
        let page = interaction.options.getInteger('page') || 1;

        db.serialize(async () => {
            const { 0: stats} = await query(`SELECT skins FROM users WHERE id = ${user.id}`);
            stats.skins = JSON.parse(stats.skins);
            if (!stats.skins) stats.skins = [];

            let showSkins = []; let uniqAnime = []; let charsAnime = []; let uniqAnimeOwned = []; const counts = {};

            let uniq = [...new Set(skins.map((e) => e.cid))].sort((a,b) => a - b);
            // Filter chars with Skin; Anime with Skins
            for (let i = 0; i < uniq.length; i++) {
                charsAnime.push(characters.filter((e) => e.id === uniq[i]).sort()[0]);
                uniqAnime.push(characters.filter((e) => e.id === uniq[i]).sort().map((e) => e.anime)[0]);
            }
            // Filter Anime with Skins that you own
            for (f = 0; f < stats.skins.length; f++) {
                let x = skins.filter((e) => e.id === stats.skins[f])[0];
                uniqAnimeOwned.push(charsAnime.filter((e) => e.id === x.cid)[0].anime);
            }
            uniqAnime = [...new Set(uniqAnime)].sort();
            uniqAnimeOwned = [...new Set(uniqAnimeOwned)].sort();

            // counts = Anzahl der Skins pro Character ID
            skins.map((e) => e.cid).sort().forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });

            if (filter !== 'owned') {
                for (let k = 0; k < uniqAnime.length; k++) {
                    let skinInAnime = charsAnime.filter((e) => e.anime === uniqAnime[k]).sort();
                    showSkins.push(`**${uniqAnime[k]}**`);

                    for (let j = 0; j < skinInAnime.length; j++) {
                        for (let s = 0; s < counts[`${skinInAnime[j].id}`]; s++) {
                            let skinsA = skins.filter((e) => e.cid === skinInAnime[j].id).sort();
                            if (stats.skins.includes(skinsA[s].id) && filter != 'unowned') showSkins.push(`> ${skinsA[s].name} <a:check:873196253276700682>`);
                            else if (filter == 'unowned' && !stats.skins.includes(skinsA[s].id)) showSkins.push(`> ${skinsA[s].name}`);
                            else showSkins.push(`> ${skinsA[s].name}`);
                        };
                    };
                    showSkins.push("");
                };
            // Filter === owned
            } else {
                for (let k = 0; k < uniqAnimeOwned.length; k++) {
                    showSkins.push(`**${uniqAnimeOwned[k]}**`);
                    for (let b = 0; b < stats.skins.length; b++) {
                        let skinsA = skins.filter((e) => e.id === stats.skins[b]).sort();
                        showSkins.push(`> ${skinsA[0].name} <a:check:873196253276700682>`);
                    }
                    showSkins.push("");
                }
            }
        
            // Setup Pages
            const elementsPerPage = 15;
            const pagesTotal = Math.ceil(showSkins.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            // Filter items to show on the current page
            let showCharsF = showPage(currPage, showSkins, elementsPerPage);

            function r1() {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setEmoji('⏪')
                            .setStyle('Secondary'),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setEmoji('⏩')
                            .setStyle('Secondary'),
                    );
                return row;
            };

            let fArray = charsAnime[0];

            function changeEmbed() {
                return new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setTitle(`Skin Inventory`)
                    .setThumbnail(charsAnime[Math.floor(Math.random() * charsAnime.length)].image)
                    .setDescription(`${showCharsF.join("\n")}`)
                    .setFooter({text: `Page ${currPage}/${pagesTotal}`});
            };

            let Embed = changeEmbed();
            interaction.reply({ embeds: [Embed], components: [r1()], fetchReply: true }).then(msg => {

                const prev = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: ComponentType.Button, time: 90000 });
                const next = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: ComponentType.Button, time: 90000 });
                const view = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "view", componentType: ComponentType.Button, time: 90000 });

                prev.on('collect', async r => {
                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;
                    showCharsF = showPage(currPage, showSkins, elementsPerPage);
                    Embed.setDescription(showCharsF.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed], components: [r1()] });
                });

                next.on('collect', async r => {
                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;
                    showCharsF = showPage(currPage, showSkins, elementsPerPage);
                    Embed.setDescription(showCharsF.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed], components: [r1()] });
                });

                view.on('collect', async r => {
                    Embed = changeEmbed();
                    interaction.editReply({ embeds: [Embed], components: [r1()] });
                });
            });
        });
    },
};