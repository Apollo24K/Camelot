import { EmbedBuilder, ComponentType } from "discord.js";
import { PageRow } from "../Modules/components";
import { showPage } from "../Modules/functions";
import { characters } from "../Modules/chars";
import { anime } from "../Modules/anime";
import { CompactUserSchema, SlashCommand } from "../types";

function getDesc(showChars: (number | ":")[], stats: CompactUserSchema, elements: number) {
    let br = false;
    if (showChars.includes(":") || (elements < stats.animelock.length)) br = false;
    else br = true;
    return showChars.map((e, i) => {
        if (e === ":") {
            br = true;
            return "";
        } else if (br) { // Chars
            return `${(showChars[i - 1] === ":") ? `**Characters** (**${stats.charlock.length}**/100)\n` : ""}> ‧ **${characters[e].name}**`;
        } else { // Anime
            return `${(i === 0) ? `**Anime** (**${stats.animelock.length}**/5)\n` : ""}> ‧ **${anime[e].name}**`;
        };
    }).join("\n");
};

const exportCommand: SlashCommand = {
    name: 'locked',
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction, author }) {

        const stats = author.schema;
        if ((stats.animelock.length + stats.charlock.length) < 1) return interaction.reply("You have no locked characters or anime. Use `/lock characters` and `/lock anime` to do so respectively.");

        // Setup Pages
        const elementsPerPage = 15;
        const pagesTotal = Math.ceil((stats.animelock.length + stats.charlock.length) / elementsPerPage);
        let currPage = 1;

        // Filter chars to show on the current page
        let showChars = showPage(currPage, [...stats.animelock, ":", ...stats.charlock] as (number | ":")[], elementsPerPage);

        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setTitle("Locked")
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setDescription(getDesc(showChars, stats, currPage * elementsPerPage))
            .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
        if (pagesTotal < 2) return interaction.reply({ embeds: [Embed] });
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

                showChars = showPage(currPage, [...stats.animelock, ":", ...stats.charlock], elementsPerPage);

                Embed.setDescription(getDesc(showChars, stats, currPage * elementsPerPage)).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                interaction.editReply({ embeds: [Embed] });
            });

        });
    },
};

export default exportCommand;
