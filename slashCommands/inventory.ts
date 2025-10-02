import fs from 'fs';
import { EmbedBuilder, ComponentType } from "discord.js";
import charInfo, { characters } from "../Modules/chars";
import { abilities } from "../Modules/abilities";
import { showPage, getSingleRefinement } from "../Modules/functions";
import { PageRow } from "../Modules/components";
import { CompactUserSchema, SlashCommand } from '../types';
import { getUserSchema } from '../Modules/queries';

const headers = { EX: "\n\n<a:EXTRA:1138530846144462968> **Tier**\n", SS: "\n\n<:SSTier:869316489931546644> **Tier**\n", S: "\n\n<:STier:869316518675095552> **Tier**\n", A: "\n\n<:ATier:869316558013464627> **Tier**\n", B: "\n\n<:BTier:869316586803179571> **Tier**\n", C: "\n\n<:CTier:869316602858991657> **Tier**\n", D: "\n\n<:DTier:869316616071032843> **Tier**\n" };
function formatPage(showChars: [charInfo[], string[]], sort: string, invd: Map<number, number>, stats: CompactUserSchema) {
    // if (!(sort === "rarity" || sort === "dupes")) return showChars.join('\n');
    if (showChars[0].length < 1) return showChars[1].join('\n');

    let desc = "";
    Object.entries(headers).forEach(([rarity, header]) => {
        if (showChars[0].find((e) => e.rarity === rarity)) desc += header + showChars[0].filter((e) => e.rarity === rarity).map((c) => sort === "dupes" ? `> ${c.name} | **x${invd.get(c.id)}**` : `> ${(stats.charlock.includes(c.id) || stats.animelock.includes(c.animeInfo.id)) ? "🔒 " : ""}${c.name}${c.id in abilities ? " ✨" : ""}${c.id in stats.char_ref ? ` ${getSingleRefinement(stats.char_ref[c.id])}` : ""}`).join("\n");
    });
    return desc;
};

const exportCommand: SlashCommand = {
    name: 'inventory',
    async execute({ interaction, author }) {

        const user = interaction.options.getUser('user') ?? interaction.user;
        const page = interaction.options.getInteger('page') ?? 1;
        const sort = interaction.options.getString('sort') ?? "rarity";
        const ephemeral = interaction.options.getString('ephemeral') ?? "false";

        const stats = (user.id === interaction.user.id) ? author.schema : await getUserSchema(user.id);
        if (!stats) return interaction.reply({ content: `${user.id === interaction.user.id ? "You don't have any" : `**${user.username}** has no`} characters.`, ephemeral: ephemeral === "true" });

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        const invd = new Map<number, number>();

        let uniq = [...new Set(stats.chars)];
        let charNames = uniq.map((e) => characters[e].name);
        let chars: charInfo[] = [];

        // Sort
        if (sort === "alphabetical") charNames.sort();
        if (sort === "rarity") {
            chars = uniq.map((e) => characters[e]).sort((a, b) => {
                if (b.rarityValue === a.rarityValue) {
                    if (stats.charlock.includes(b.id) === stats.charlock.includes(a.id)) {
                        if (stats.animelock.includes(b.animeInfo.id) === stats.animelock.includes(a.animeInfo.id)) {
                            if ((stats.char_ref[b.id] ?? 0) === (stats.char_ref[a.id] ?? 0)) {
                                return a.name.localeCompare(b.name);
                            };
                            return (stats.char_ref[b.id] ?? 0) - (stats.char_ref[a.id] ?? 0);
                        };
                        return (stats.animelock.includes(b.animeInfo.id) ? 1 : 0) - (stats.animelock.includes(a.animeInfo.id) ? 1 : 0);
                    };
                    return (stats.charlock.includes(b.id) ? 1 : 0) - (stats.charlock.includes(a.id) ? 1 : 0);
                };
                return b.rarityValue - a.rarityValue;
            });
        };
        if (sort === "dupes") {
            let names = stats.chars.sort();
            let len = names.length - 1;
            while (len--) if (names[len - 1] === names[len]) invd.set(names[len], (invd.get(names[len]) ?? 1) + 1);

            uniq = [...invd.keys()];
            chars = uniq.map((e) => characters[e]).sort((a, b) => b.rarityValue === a.rarityValue ? (invd.get(b.id) ?? 1) - (invd.get(a.id) ?? 1) : (b.rarityValue - a.rarityValue));
        };

        let thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image;
        if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[interaction.user.id]?.cimg[stats.favchar], stats.char_skin[stats.favchar]);

        let pagesTotal = Math.ceil(uniq.length / 15);
        let currPage = 1;
        if (page <= pagesTotal && page > 0) {
            currPage = page;
        };

        let showChars: [charInfo[], string[]] = [showPage(currPage, chars), showPage(currPage, charNames)];

        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setAuthor({ name: `${user.username}'s inventory`, iconURL: user.displayAvatarURL({ size: 512 }) })
            .setThumbnail(thumbnail)
            .setDescription(formatPage(showChars, sort, invd, stats))
            .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
        if (pagesTotal === 1) return interaction.reply({ embeds: [Embed], ephemeral: ephemeral === "true" });
        return interaction.reply({ embeds: [Embed], components: [PageRow], ephemeral: ephemeral === "true" }).then(msg => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

            collector.on('collect', r => {
                if (r.customId === "prev") {
                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;
                } else {
                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;
                };

                showChars = [showPage(currPage, chars), showPage(currPage, charNames)];

                Embed.setDescription(formatPage(showChars, sort, invd, stats)).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                interaction.editReply({ embeds: [Embed] });
            });
        });
    },
};

export default exportCommand;
