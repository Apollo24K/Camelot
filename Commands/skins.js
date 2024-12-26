import { EmbedBuilder, ComponentType } from "discord.js";
import { db, query } from "../db_handler";
import { characters } from "../Modules/chars";
import { skins } from "../Modules/skins";
import { showPage } from "../Modules/functions.js";
import { PageRow } from "../Modules/components.js";

module.exports = {
    name: 'skins',
    description: 'see your skins',
    execute(interaction) {

        const user = interaction.options.getUser('user') ?? interaction.user;
        const filter = interaction.options.getString('filter');
        let page = interaction.options.getInteger('page') || 1;

        db.serialize(async () => {
            const { 0: stats } = await query(`SELECT skins FROM users WHERE id = ${user.id}`);
            if (!stats) return interaction.reply(`**${user.username}** has not started playing yet`);
            stats.skins = JSON.parse(stats.skins);

            // Filter
            const fSkins = skins.filter((skin) => {
                return !filter || (
                    (filter === "owned") ? (
                        stats.skins.includes(skin.id)
                    ) : ((filter === "unowned") ? (
                        !stats.skins.includes(skin.id)
                    ) : (
                        true
                    ))
                );
            });
            if (fSkins.length === 0) return interaction.reply(`Couldn't find any skins matching your filters`);

            // Prepare entries to show
            let showSkins = [], uniqAnime = [...new Set(fSkins.map((e) => characters[e.cid].anime))].sort();
            for (let i = 0; i < uniqAnime.length; i++) {
                const skinsInAnime = fSkins.filter((e) => characters[e.cid].anime === uniqAnime[i]).sort();
                showSkins.push(`**${uniqAnime[i]}**`);

                for (let j = 0; j < skinsInAnime.length; j++) {
                    const { length } = characters[skinsInAnime[j].cid].name;
                    showSkins.push(`> **${skinsInAnime[j].name.slice(0, length)}** ${skinsInAnime[j].name.slice(length)}${stats.skins.includes(skinsInAnime[j].id) ? ` <a:check:873196253276700682>` : ""}`);
                };
                showSkins.push("");
            };

            // Setup pages
            const elementsPerPage = 15;
            const pagesTotal = Math.ceil(showSkins.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            // Filter items to show on the current page
            let showCharsF = showPage(currPage, showSkins, elementsPerPage);

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(`Skin Inventory`)
                .setThumbnail(fSkins[Math.floor(Math.random() * fSkins.length)].image)
                .setDescription(`${showCharsF.join("\n")}`)
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            if (pagesTotal === 1) return interaction.reply({ embeds: [Embed] });
            return interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {

                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', (r) => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    showCharsF = showPage(currPage, showSkins, elementsPerPage);
                    Embed.setDescription(showCharsF.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed] });
                });
            });
        });
    },
};
