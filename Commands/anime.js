/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { characters, auniq } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");

module.exports = {
    name: 'anime',
	description: 'List all anime',
	execute(interaction) {

        let user = interaction.options.getUser('user') || interaction.user;
        let page = interaction.options.getInteger('page');
        
        db.serialize(async () => {
            var inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
            if (!inv[0]) inv[0] = {chars: "[]"};
            inv = {chars: JSON.parse(inv[0].chars)};

            let uniq = auniq.sort();

            let chars = [...new Set(inv.chars)].map((e) => characters[e]);

            let aniCompleted = 0;
            for (let i=0; i < uniq.length; i++) {
                let animeCheck = characters.filter((e) => e.anime === uniq[i]).length;
                let invCheck = chars.filter((e) => e.anime === uniq[i]).length;
                if (animeCheck === invCheck) {
                    aniCompleted++;
                };
            };

            let pagesTotal = Math.ceil(uniq.length / 15);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            let left = uniq.length % 15;
            let showAnime = [];
            if (currPage < pagesTotal || left === 0) {
                for (let i=(currPage-1)*15; i < currPage * 15; i++) {
                    let charsOwned = chars.filter((b) => b.anime === uniq[i]);
                    let charsInTotal = characters.filter((b) => b.anime === uniq[i]);
                    if (charsOwned.length === charsInTotal.length) {
                        showAnime.push(`‧ ${uniq[i]} <a:check:873196253276700682>`);
                    } else {
                        showAnime.push(`‧ ${uniq[i]} **(${charsOwned.length}/${charsInTotal.length})**`);
                    };
                };
            } else {
                for (let i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                    let charsOwned = chars.filter((b) => b.anime === uniq[i]);
                    let charsInTotal = characters.filter((b) => b.anime === uniq[i]);
                    if (charsOwned.length === charsInTotal.length) {
                        showAnime.push(`‧ ${uniq[i]} <a:check:873196253276700682>`);
                    } else {
                        showAnime.push(`‧ ${uniq[i]} **(${charsOwned.length}/${charsInTotal.length})**`);
                    };
                };
            };

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('prev')
                        .setEmoji('⏪')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('next')
                        .setEmoji('⏩')
                        .setStyle('SECONDARY'),
                );

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle(`**Anime Included** (${aniCompleted}/${uniq.length})`)
            .setThumbnail("https://i.ibb.co/cgh59Lb/WWM4K98.png")
            .setDescription(showAnime.join("\n"))
            .setFooter(`Page ${currPage}/${pagesTotal}`)
            interaction.reply({ embeds: [Embed], components: [row], fetchReply: true }).then((msg) => {
                
                const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                prev.on('collect', async r => {
                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;

                    let showAnime = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (let i=(currPage-1)*15; i < currPage * 15; i++) {
                            let charsOwned = chars.filter((b) => b.anime === uniq[i]);
                            let charsInTotal = characters.filter((b) => b.anime === uniq[i]);
                            if (charsOwned.length === charsInTotal.length) {
                                showAnime.push(`‧ ${uniq[i]} <a:check:873196253276700682>`);
                            } else {
                                showAnime.push(`‧ ${uniq[i]} **(${charsOwned.length}/${charsInTotal.length})**`);
                            };
                        };
                    } else {
                        for (let i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            let charsOwned = chars.filter((b) => b.anime === uniq[i]);
                            let charsInTotal = characters.filter((b) => b.anime === uniq[i]);
                            if (charsOwned.length === charsInTotal.length) {
                                showAnime.push(`‧ ${uniq[i]} <a:check:873196253276700682>`);
                            } else {
                                showAnime.push(`‧ ${uniq[i]} **(${charsOwned.length}/${charsInTotal.length})**`);
                            };
                        };
                    };

                    Embed.setDescription(showAnime.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [row] });
                });

                next.on('collect', async r => {
                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;

                    let showAnime = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (let i=(currPage-1)*15; i < currPage * 15; i++) {
                            let charsOwned = chars.filter((b) => b.anime === uniq[i]);
                            let charsInTotal = characters.filter((b) => b.anime === uniq[i]);
                            if (charsOwned.length === charsInTotal.length) {
                                showAnime.push(`‧ ${uniq[i]} <a:check:873196253276700682>`);
                            } else {
                                showAnime.push(`‧ ${uniq[i]} **(${charsOwned.length}/${charsInTotal.length})**`);
                            };
                        };
                    } else {
                        for (let i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            let charsOwned = chars.filter((b) => b.anime === uniq[i]);
                            let charsInTotal = characters.filter((b) => b.anime === uniq[i]);
                            if (charsOwned.length === charsInTotal.length) {
                                showAnime.push(`‧ ${uniq[i]} <a:check:873196253276700682>`);
                            } else {
                                showAnime.push(`‧ ${uniq[i]} **(${charsOwned.length}/${charsInTotal.length})**`);
                            };
                        };
                    };

                    Embed.setDescription(showAnime.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [row] });
                });

            });
        });

    },
};