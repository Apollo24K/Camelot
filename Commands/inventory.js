import fs from 'fs';
import { EmbedBuilder, ComponentType } from "discord.js";
import { characters } from "../Modules/chars";
import { abilities } from "../Modules/abilities";
import { db, query } from "../db_handler";
import { showPage, getSingleRefinement } from "../Modules/functions";
import { PageRow } from "../Modules/components";

const headers = { EX: "\n\n<a:EXTRA:1138530846144462968> **Tier**\n", SS: "\n\n<:SSTier:869316489931546644> **Tier**\n", S: "\n\n<:STier:869316518675095552> **Tier**\n", A: "\n\n<:ATier:869316558013464627> **Tier**\n", B: "\n\n<:BTier:869316586803179571> **Tier**\n", C: "\n\n<:CTier:869316602858991657> **Tier**\n", D: "\n\n<:DTier:869316616071032843> **Tier**\n" };
function formatPage(showChars, sort, invd, stats, inv) {
    if (!(sort === "rarity" || sort === "dupes")) return showChars.join('\n');

    let desc = "";
    Object.entries(headers).forEach(([rarity, header]) => {
        if (showChars.find((e) => e.rarity === rarity)) desc += header + showChars.filter((e) => e.rarity === rarity).map((c) => sort === "dupes" ? `> ${c.name} | **x${invd.get(c.id)}**` : `> ${(stats.charlock.includes(c.id) || stats.animelock.includes(c.animeInfo.id)) ? "🔒 " : ""}${c.name}${c.id in abilities ? " ✨" : ""}${c.id in inv.ref ? ` ${getSingleRefinement(inv.ref[c.id])}` : ""}`).join("\n");
    });
    return desc;
};

module.exports = {
    name: 'inventory',
    description: 'search an anime',
    execute(interaction) {

        const user = interaction.options.getUser('user') || interaction.user;
        const page = interaction.options.getInteger('page');
        const sort = interaction.options.getString('sort') || "rarity";
        const ephemeral = interaction.options.getString('ephemeral') || "false";

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        const invd = new Map();

        db.serialize(async () => {
            const { 0: stats } = await query(`SELECT favchar, premium, charlock, animelock FROM users WHERE id = ${user.id}`);
            if (!stats) return interaction.reply({ content: `${user.id === interaction.user.id ? "You don't have any" : `**${user.username}** has no`} characters.`, ephemeral: ephemeral === "true" });
            stats.charlock = JSON.parse(stats.charlock), stats.animelock = JSON.parse(stats.animelock);

            const { 0: inv } = await query(`SELECT chars, ref, skin FROM characters WHERE id = ${user.id}`);
            inv.chars = JSON.parse(inv.chars), inv.ref = JSON.parse(inv.ref), inv.skin = JSON.parse(inv.skin);

            let uniq = [...new Set(inv.chars)];
            let chars = uniq.map((e) => characters[e].name);

            // Sort
            if (sort === "alphabetical") chars.sort();
            if (sort === "rarity") {
                chars = uniq.map((e) => characters[e]).sort((a, b) => {
                    if (b.rarityValue === a.rarityValue) {
                        if (stats.charlock.includes(b.id) === stats.charlock.includes(a.id)) {
                            if (stats.animelock.includes(b.animeInfo.id) === stats.animelock.includes(a.animeInfo.id)) {
                                if ((inv.ref[b.id] ?? 0) === (inv.ref[a.id] ?? 0)) {
                                    return a.name.localeCompare(b.name);
                                };
                                return (inv.ref[b.id] ?? 0) - (inv.ref[a.id] ?? 0);
                            };
                            return stats.animelock.includes(b.animeInfo.id) - stats.animelock.includes(a.animeInfo.id);
                        };
                        return stats.charlock.includes(b.id) - stats.charlock.includes(a.id);
                    };
                    return b.rarityValue - a.rarityValue;
                });
            };
            if (sort === "dupes") {
                let names = inv.chars.sort();
                let len = names.length - 1;
                while (len--) if (names[len - 1] === names[len]) invd.set(names[len], invd.get(names[len]) + 1 || 2);

                uniq = [...invd.keys()];
                chars = uniq.map((e) => characters[e]).sort((a, b) => b.rarityValue === a.rarityValue ? invd.get(b.id) - invd.get(a.id) : (b.rarityValue - a.rarityValue));
            };

            let thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image;
            if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[interaction.user.id]?.cimg[stats.favchar], inv.skin[stats.favchar]);

            let pagesTotal = Math.ceil(uniq.length / 15);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            let showChars = showPage(currPage, chars);

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setAuthor({ name: `${user.username}'s inventory`, iconURL: user.displayAvatarURL({ dynamic: true }) + "?size=2048" })
                .setThumbnail(thumbnail)
                .setDescription(formatPage(showChars, sort, invd, stats, inv))
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            if (pagesTotal === 1) return interaction.reply({ embeds: [Embed], ephemeral: ephemeral === "true" });
            return interaction.reply({ embeds: [Embed], components: [PageRow], ephemeral: ephemeral === "true", fetchReply: true }).then(msg => {

                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    showChars = showPage(currPage, chars);

                    Embed.setDescription(formatPage(showChars, sort, invd, stats, inv)).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed] });
                });

            });

        });

    },
};