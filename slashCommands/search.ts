import { EmbedBuilder, ComponentType } from "discord.js";
import charInfo, { characters, uniqueAnimeCharacters } from "../Modules/chars";
import { searchAnime, showPage, splitTitle, rarity, rarityColor, rarityEmoji } from "../Modules/functions";
import { PageRow } from "../Modules/components";
import { SlashCommand } from "../types";
import { getUserSchema } from "../Modules/queries";

type SortedCharInfos = { "VIP": charInfo[], "EX": charInfo[], "SS": charInfo[], "S": charInfo[], "A": charInfo[], "B": charInfo[], "C": charInfo[], "D": charInfo[]; };

const exportCommand: SlashCommand = {
    name: 'search',
    async execute({ interaction, author }) {

        const anime = interaction.options.getString('anime', true);
        const user = interaction.options.getUser('user') ?? interaction.user;
        const page = interaction.options.getInteger('page') ?? 1;
        const searchflag = interaction.options.getString('flags');

        const stats = user.id === interaction.user.id ? author.schema : await getUserSchema(user.id);
        if (!stats) return interaction.reply(`**${user.username}** hasn't started playing yet`);

        let uniq = [...new Set(stats.chars)];
        let chars = uniq.map((e) => characters[e]);

        let fastCheck = searchAnime(anime, stats.chars, interaction);
        if (!fastCheck || !fastCheck.length) return;
        const animeName = fastCheck[0].anime;

        let sorted: SortedCharInfos = { "VIP": [], "EX": [], "SS": [], "S": [], "A": [], "B": [], "C": [], "D": [] };
        fastCheck.forEach((b) => {
            if (searchflag !== "missing" || !stats.chars.includes(b.id)) sorted[b.rarity].push(b);
        });
        let allChars = sorted["EX"].concat(sorted["SS"]).concat(sorted["S"]).concat(sorted["A"]).concat(sorted["B"]).concat(sorted["C"]).concat(sorted["D"]);
        let charsOwned = chars.filter((b) => b.anime === animeName);

        if (allChars.length === 0) return interaction.reply(`You have all characters from **${fastCheck[0].anime}**`);

        if (searchflag === "image") {

            let aTitle = splitTitle(fastCheck[0].anime);

            let pagesTotal = allChars.length;
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            const Embed = new EmbedBuilder()
                .setColor(rarityColor(allChars[currPage - 1].rarity))
                .setThumbnail(rarity(allChars[currPage - 1].rarity))
                .setDescription(`**${allChars[currPage - 1].name}**${uniq.includes(allChars[currPage - 1].id) ? " <a:check:873196253276700682>" : ""}\n**${aTitle}** (${charsOwned.length}/${allChars.length})\n**ID**: #${allChars[currPage - 1].id}`)
                .setImage(allChars[currPage - 1].image)
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            return interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', r => {
                    if (r.customId === "prev") currPage > 1 ? currPage-- : currPage = pagesTotal;
                    else currPage < pagesTotal ? currPage++ : currPage = 1;

                    Embed.setThumbnail(rarity(allChars[currPage - 1].rarity)).setDescription(`**${allChars[currPage - 1].name}**${uniq.includes(allChars[currPage - 1].id) ? " <a:check:873196253276700682>" : ""}\n**${aTitle}** (${charsOwned.length}/${allChars.length})\n**ID**: #${allChars[currPage - 1].id}`).setImage(allChars[currPage - 1].image).setColor(rarityColor(allChars[currPage - 1].rarity)).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed] });
                });

            });
        };

        // Setup Pages
        const elementsPerPage = 15;
        let pagesTotal = Math.ceil(allChars.length / elementsPerPage);
        let currPage = 1;
        if (page <= pagesTotal && page > 0) {
            currPage = page;
        };

        // eslint-disable-next-line no-inner-declarations
        function tierNames(t: charInfo[], arr: string[] = []) {
            for (let h = 0; h < t.length; h++) {
                if (uniq.includes(t[h].id)) {
                    arr.push(`${t[h].name} <a:check:873196253276700682> x${stats?.chars.reduce((acc, val) => acc + (val === t[h].id ? 1 : 0), 0)}`);
                } else {
                    arr.push(t[h].name);
                };
            };
            return arr;
        };

        // eslint-disable-next-line no-inner-declarations
        function charPage(desc = "") {
            const showChars = showPage(currPage, allChars, elementsPerPage);
            let sorted: SortedCharInfos = { "VIP": [], "EX": [], "SS": [], "S": [], "A": [], "B": [], "C": [], "D": [] };
            showChars.forEach((b) => sorted[b.rarity].push(b));
            Object.keys(sorted).forEach((b) => sorted[b as keyof SortedCharInfos].length ? desc += `\n\n${rarityEmoji(b as keyof SortedCharInfos)} **Tier**\n> ` + tierNames(sorted[b as keyof SortedCharInfos]).join("\n> ") : false);
            return desc;
        };

        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setTitle(`**${fastCheck[0].anime}** ${searchflag === "missing" ? `(${allChars.length}/${fastCheck.length} Missing)` : `(${charsOwned.length}/${fastCheck.length})`}`)
            .setThumbnail(allChars[0].image)
            .setDescription(charPage())
            .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
        if (allChars.length < 16) return interaction.reply({ embeds: [Embed] });
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

                Embed.setDescription(charPage()).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                interaction.editReply({ embeds: [Embed] });
            });

        });
    },
    async autocomplete({ interaction }) {
        const name = interaction.options.getFocused().toLowerCase();

        let fArray = uniqueAnimeCharacters.filter((e) => e.anime.toLowerCase().includes(name) || e.anialias.some((a) => a.toLowerCase().includes(name)));

        const matches = fArray.filter((e) => e.anime.toLowerCase() === name || e.anialias.some((a) => a.toLowerCase() === name));
        fArray = fArray.filter((e) => e.anime.toLowerCase() !== name && !e.anialias.some((a) => a.toLowerCase() === name));
        const starts = fArray.filter((e) => e.anime.toLowerCase().startsWith(name) || e.anialias.some((a) => a.toLowerCase().startsWith(name)));
        fArray = fArray.filter((e) => !e.anime.toLowerCase().startsWith(name) && !e.anialias.some((a) => a.toLowerCase().startsWith(name)));

        return [...matches, ...starts, ...fArray].map((e) => ({ name: e.anime.toLowerCase().includes(name) ? e.anime.slice(0, 100) : `${e.anime} (alias: ${e.anialias.find((a) => a.toLowerCase() === name) ?? e.anialias.find((a) => a.toLowerCase().startsWith(name)) ?? e.anialias.find((a) => a.toLowerCase().includes(name))})`.slice(0, 100), value: e.anime.slice(0, 100) }));
    },
};

export default exportCommand;
