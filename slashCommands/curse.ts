import { EmbedBuilder, ComponentType } from "discord.js";
import { curses } from "../Modules/curses";
import { PageRow } from "../Modules/components";
import { searchCurse, showPage } from "../Modules/functions";
import { SlashCommand } from "../types";

const exportCommand: SlashCommand = {
    name: 'curse',
    async execute({ interaction }) {

        const subcommand = interaction.options.getSubcommand();

        // Class List
        if (subcommand === "list") {
            const page = interaction.options.getInteger('page') ?? 1;

            const rare = curses.filter((e) => e.tier).map((c) => `> ${c.emblem} ${c.name}`).sort();
            const common = curses.filter((e) => e.tier === 0).map((c) => `> ${c.emblem} ${c.name}`).sort();

            const showC = ["**Rare Curses** <:Rare_Curse:952175947409408041>", ...rare, "", "**Common Curses** <:Common_Curse:952175936554557530>", ...common];

            const elementsPerPage = 15;
            const pagesTotal = Math.ceil(showC.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            // Filter items to show on the current page
            let showF = showPage(currPage, showC, elementsPerPage);

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(`List of Curses`)
                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                .setDescription(`Use \`/curse info <name>\` for more information\n\n` + showF.join("\n"))
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            return interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    showF = showPage(currPage, showC, elementsPerPage);

                    Embed.setDescription(`Use \`/curse info <name>\` for more information\n\n` + showF.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed] });
                });
            });
        };

        // Class info
        if (subcommand === "info") {
            const choice = interaction.options.getString('curse', true);

            const curse = searchCurse(choice, interaction);
            if (!curse) return;

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(curse.name)
                .setDescription(`**Cost**: ${curse.cost}\\💧\n**Rarity**: ${curse.tier ? "Rare" : "Common"}\n\n**Active**: ${curse.descA}\n\n**Passive**: ${curse.descP}`)
                .setThumbnail(curse.image)
                .setFooter({ text: `ID: #${curse.id}` });
            return interaction.reply({ embeds: [Embed] });
        };

    },
};

export default exportCommand;
