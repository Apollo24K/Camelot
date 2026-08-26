import { EmbedBuilder, ComponentType } from "discord.js";
import charInfo, { characters } from "../Modules/chars";
import { abilities } from "../Modules/abilities";
import { showPage, getSingleRefinement, rarityEmoji } from "../Modules/functions";
import { PageRow } from "../Modules/components";
import { CompactUserSchema, SlashCommand } from '../types';
import { getCharacterSchemasOfUser, getUserSchema } from '../Modules/queries';

type InventoryEntry = {
    char: charInfo;
    print?: number;
};

function formatCharacterName(entry: InventoryEntry) {
    return `${entry.char.name}${entry.print !== undefined ? `\`#${entry.print}\`` : ""}`;
};

function formatPage(showChars: [InventoryEntry[], string[]], sort: string, invd: Map<number, number>, stats: CompactUserSchema) {
    // if (!(sort === "rarity" || sort === "dupes")) return showChars.join('\n');
    if (showChars[0].length < 1) return showChars[1].join('\n');

    let desc = "";

    (["VIP", "EX", "SS", "S", "A", "B", "C", "D"] as const).forEach((rarity) => {
        const entries = showChars[0].filter((e) => e.char.rarity === rarity);
        if (entries.length > 0) {
            desc +=
                `\n\n**${rarityEmoji(rarity)} Tier**\n` +
                entries.map((entry) => {
                    const c = entry.char;
                    const name = formatCharacterName(entry);
                    return sort === "dupes"
                        ? `> ${name} | **x${entry.print !== undefined ? 1 : invd.get(c.id)}**`
                        : `> ${(stats.charlock.includes(c.id) || stats.animelock.includes(c.animeInfo.id)) ? "🔒 " : ""}${name}${c.id in abilities ? " ✨" : ""}${c.id in stats.char_ref ? ` ${getSingleRefinement(stats.char_ref[c.id])}` : ""}`;
                }).join("\n");
        };
    });

    return desc;
};

const exportCommand: SlashCommand = {
    name: 'inventory',
    async execute({ interaction, author }) {

        const user = interaction.options.getUser('user') ?? interaction.user;
        const page = interaction.options.getInteger('page') ?? 1;
        const sort = interaction.options.getString('sort') ?? "rarity";
        const filter = interaction.options.getString('filter');
        const ephemeral = interaction.options.getString('ephemeral') ?? "false";

        const stats = (user.id === interaction.user.id) ? author.schema : await getUserSchema(user.id);
        if (!stats) return interaction.reply({ content: `${user.id === interaction.user.id ? "You don't have any" : `**${user.username}** has no`} characters.`, ephemeral: ephemeral === "true" });
        const vipChars = await getCharacterSchemasOfUser(user.id);
        if (stats.chars.length === 0 && vipChars.length === 0) return interaction.reply({ content: `${user.id === interaction.user.id ? "You don't have any" : `**${user.username}** has no`} characters.`, ephemeral: ephemeral === "true" });

        let uniq = [...new Set(stats.chars)];
        const vipEntries: InventoryEntry[] = vipChars.map((e) => ({ char: characters[e.charid], print: e.print }));
        let entries: InventoryEntry[] = [...uniq.map((e) => ({ char: characters[e] })), ...vipEntries];
        if (filter === "ability") entries = entries.filter((entry) => entry.char.id in abilities);
        if (filter === "non-ability") entries = entries.filter((entry) => !(entry.char.id in abilities));
        if (entries.length === 0) return interaction.reply({ content: "No characters match that filter.", ephemeral: ephemeral === "true" });
        let charNames = entries.map(formatCharacterName);
        let chars: InventoryEntry[] = [];
        const invd = new Map<number, number>();

        // Sort
        if (sort === "alphabetical") charNames.sort();
        if (sort === "rarity") {
            chars = [...entries].sort((aEntry, bEntry) => {
                const a = aEntry.char;
                const b = bEntry.char;
                if (b.rarityValue === a.rarityValue) {
                    if (stats.charlock.includes(b.id) === stats.charlock.includes(a.id)) {
                        if (stats.animelock.includes(b.animeInfo.id) === stats.animelock.includes(a.animeInfo.id)) {
                            if ((stats.char_ref[b.id] ?? 0) === (stats.char_ref[a.id] ?? 0)) {
                                const nameSort = a.name.localeCompare(b.name);
                                return nameSort === 0 ? (aEntry.print ?? 0) - (bEntry.print ?? 0) : nameSort;
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
            stats.chars.forEach((e) => invd.set(e, (invd.get(e) ?? 0) + 1));

            const visibleNormalIds = new Set(entries.filter((entry) => entry.print === undefined).map((entry) => entry.char.id));
            const dupeEntries: InventoryEntry[] = [...invd.entries()].filter(([id, count]) => count > 1 && visibleNormalIds.has(id)).map(([id]) => ({ char: characters[id] }));
            chars = [...dupeEntries, ...entries.filter((entry) => entry.print !== undefined)].sort((aEntry, bEntry) => {
                const a = aEntry.char;
                const b = bEntry.char;
                if (b.rarityValue === a.rarityValue) {
                    const countSort = (bEntry.print !== undefined ? 1 : invd.get(b.id) ?? 1) - (aEntry.print !== undefined ? 1 : invd.get(a.id) ?? 1);
                    if (countSort !== 0) return countSort;
                    const nameSort = a.name.localeCompare(b.name);
                    return nameSort === 0 ? (aEntry.print ?? 0) - (bEntry.print ?? 0) : nameSort;
                };
                return b.rarityValue - a.rarityValue;
            });
        };

        const pageItems = (sort === "rarity" || sort === "dupes") ? chars.length : charNames.length;
        let thumbnail = entries[Math.floor(Math.random() * entries.length)].char.image;
        if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, stats.custom_skins[stats.favchar], stats.char_skin[stats.favchar]);

        let pagesTotal = Math.ceil(pageItems / 15);
        let currPage = 1;
        if (page <= pagesTotal && page > 0) {
            currPage = page;
        };

        let showChars: [InventoryEntry[], string[]] = [showPage(currPage, chars), showPage(currPage, charNames)];

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
