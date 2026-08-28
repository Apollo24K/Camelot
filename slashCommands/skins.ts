import { EmbedBuilder, ComponentType, ButtonInteraction, Message } from "discord.js";
import { characters } from "../Modules/chars";
import { skins } from "../Modules/skins";
import { showPage } from "../Modules/functions";
import { PageRow } from "../Modules/components";
import { getCachedUserSchema } from '../Modules/queries';
import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'skins',
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction, author }) {

        const user = interaction.options.getUser('user') ?? interaction.user;
        const filter = interaction.options.getString('filter');
        let page = interaction.options.getInteger('page') || 1;

        const stats = user.id === interaction.user.id ? author.schema : await getCachedUserSchema(user.id, interaction.client);
        if (!stats) return interaction.reply(`**${user.username}** has not started playing yet`);

        // Build map of equipped skin IDs → character names
        const equippedMap = new Map<number, string[]>();
        for (const [charId, skinId] of Object.entries(stats.char_skin ?? {})) {
            if (typeof skinId === 'number') {
                const char = characters[Number(charId)];
                const charName = char?.name ?? `#${charId}`;
                const arr = equippedMap.get(skinId) ?? [];
                arr.push(charName);
                equippedMap.set(skinId, arr);
            }
        }

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
        let showSkins: string[] = [], uniqAnime = [...new Set(fSkins.map((e) => characters[e.cid].anime))].sort();
        for (let i = 0; i < uniqAnime.length; i++) {
            const skinsInAnime = fSkins.filter((e) => characters[e.cid].anime === uniqAnime[i]).sort();
            showSkins.push(`**${uniqAnime[i]}**`);

            for (let j = 0; j < skinsInAnime.length; j++) {
                const { length } = characters[skinsInAnime[j].cid].name;
                const equipped = equippedMap.get(skinsInAnime[j].id);
                showSkins.push(`> **${skinsInAnime[j].name.slice(0, length)}** ${skinsInAnime[j].name.slice(length)}${stats.skins.includes(skinsInAnime[j].id) ? ` <a:check:873196253276700682>` : ""}${equipped ? ` *(equipped)*` : ""}`);
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
        return interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then((msg: Message) => {
            const collector = msg.createMessageComponentCollector({ filter: (r: ButtonInteraction) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

            collector.on('collect', (r: ButtonInteraction) => {
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
    },
};

export default exportCommand;
