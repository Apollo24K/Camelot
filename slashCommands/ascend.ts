import { collectComponentUpdates } from "../Modules/buttonInteractions";
import { EmbedBuilder, ComponentType } from "discord.js";
import { search, rarityColor } from "../Modules/functions";
import { OfferRow } from "../Modules/components";
import { SlashCommand } from "../types";
import { getUserSchema, ownsCharacter, updateUsers } from '../Modules/queries';
import { ascensions, formatAscensionNodes, getAscensionRank } from '../Modules/ascensions';

// Guards against two confirmations (from separate /ascend runs) validating against
// the same pre-write state and each consuming a duplicate in the same instant.
const ascendInProgress = new Set<string>();

const exportCommand: SlashCommand = {
    name: 'ascend',
    async execute({ interaction, author }) {

        const subcommand = interaction.options.getSubcommand();
        const choice = interaction.options.getString('character') ?? "";

        // View a character's ascension path. Public info: the path itself is visible to anyone,
        // while rank/dupes/effective state are only shown for characters the viewer owns.
        if (subcommand === "view") {
            const char = search(choice, author.schema.chars, interaction);
            if (!char?.name) return;

            const nodes = ascensions[char.id];
            if (!nodes) return interaction.reply(`<a:MeguStaff:1045097287782768650> **${char.name}**'s ability can't be ascended, so it has no ascension path to view.`);

            const rank = getAscensionRank(char.id, author.schema);
            const owned = author.schema.chars.includes(char.id);
            const dupes = author.schema.chars.filter(e => e === char.id).length;

            let description = formatAscensionNodes(char.id, rank);
            if (owned) {
                description = `**Ascension Rank**: **${rank}/${nodes.length}**\n\n${description}`;
                if (rank >= nodes.length) description += `\n\n<a:ClaraClap:1034899841521815562> **${char.name}**'s ability has reached the max ascension rank.`;
                else if (dupes < 2) description += `\n\nYou need at least **2** copies of **${char.name}** to ascend — you own **${dupes}**.`;
                else description += `\n\nYou own **${dupes}** copies of **${char.name}** — sacrifice one with \`/ascend sacrifice ${char.name}\` to unlock the next node.`;
            } //else {
            //     description = `<:LuminousPsssh:1071574041116295328> You don't own **${char.name}**, but here's their ascension path:\n\n${description}`;
            // };

            const thumbnail = char.getImage(author.schema.premium, author.schema.custom_skins[char.id], author.schema.char_skin[char.id]);

            const Embed = new EmbedBuilder()
                .setTitle(`${char.name}'s Ability Ascension`.slice(0, 256))
                .setColor(rarityColor(char.rarity))
                .setDescription(description)
                .setThumbnail(thumbnail);
            return interaction.reply({ embeds: [Embed] });
        };

        // Sacrifice a duplicate to unlock the next ascension node.
        const char = search(choice, author.schema.chars, interaction);
        if (!char?.name) return;
        if (!(await ownsCharacter(interaction.user.id, author.schema.chars, char.id))) return interaction.reply(`You don't have a copy of **${char.name}**`);

        const nodes = ascensions[char.id];
        if (!nodes) return interaction.reply(`**${char.name}**'s ability can't be ascended. Use \`/ability ${char.name}\` for more information.`);
        const maxRank = nodes.length;

        if (author.schema.charlock.includes(char.id) || author.schema.animelock.includes(char.animeInfo.id)) return interaction.reply(`⚠️ You're trying to ascend a locked character, please \`/unlock\` **${char.name}** first.`);

        const dupes = author.schema.chars.filter(e => e === char.id).length;
        const rank = getAscensionRank(char.id, author.schema);
        if (rank >= maxRank) return interaction.reply(`<a:check:873196253276700682> **${char.name}**'s ability has already reached the max ascension rank`);
        if (dupes < 2) return interaction.reply(`You need a duplicate copy of **${char.name}** to ascend their ability (**${dupes}**/2)`);

        const next = nodes[rank];

        const thumbnail = char.getImage(author.schema.premium, author.schema.custom_skins[char.id], author.schema.char_skin[char.id]);

        const Embed = new EmbedBuilder()
            .setTitle(`${char.name}'s Ascension`.slice(0, 256))
            .setColor(rarityColor(char.rarity))
            .setDescription(`**Ascension Rank**: **${rank}/${maxRank}**\n\n${formatAscensionNodes(char.id, rank)}\n\n**Currently unlocking:**\n✨ **${rank + 1}. ${next.name}**\n> ${next.desc}\n\nSacrificing a duplicate costs **1** copy of **${char.name}** (you own **${dupes}**)`)
            .setThumbnail(thumbnail);
        interaction.reply({ embeds: [Embed], components: [OfferRow], fetchReply: true }).then(msg => {

            const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 30000 });
            const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 30000 });

            collectComponentUpdates(confirm, async () => {
                confirm.stop(), cancel.stop();

                if (ascendInProgress.has(interaction.user.id)) {
                    if (interaction.channel?.isSendable()) interaction.channel.send("You already have an ascension being processed, please wait a moment.");
                    return;
                };
                ascendInProgress.add(interaction.user.id);
                try {

                    const invCheck = await getUserSchema(interaction.user.id);
                    if (!invCheck) {
                        if (interaction.channel?.isSendable()) interaction.channel.send("An error occurred, please try again");
                        return;
                    };

                    if (invCheck.charlock.includes(char.id) || invCheck.animelock.includes(char.animeInfo.id)) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`⚠️ **${char.name}** is locked, please \`/unlock\` them first.`);
                        return;
                    };

                    const freshRank = getAscensionRank(char.id, invCheck);
                    if (freshRank !== rank || freshRank >= maxRank) {
                        if (interaction.channel?.isSendable()) interaction.channel.send("An error occurred, please try again");
                        return;
                    };

                    const freshDupes = invCheck.chars.filter(e => e === char.id).length;
                    if (freshDupes < 2) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have a duplicate copy of **${char.name}** to sacrifice`);
                        return;
                    };

                    await updateUsers(interaction.user.id, {
                        chars: { type: 'remove', value: [char.id] },
                        char_ascension: { type: 'merge_json', value: { [char.id]: 1 } },
                    });
                    // The command cache holds the pre-ascension schema; drop it so the next command re-reads.
                    interaction.client.userCache.delete(interaction.user.id);

                    if (interaction.channel?.isSendable()) interaction.channel.send(`<a:KannaFire:1045096950070001687> Sacrificed a duplicate of **${char.name}**. Their ability ascended to rank **${freshRank + 1}/${maxRank}**${nodes[freshRank].name ? ` — **${nodes[freshRank].name}**` : ''} unlocked!`);
                } finally {
                    ascendInProgress.delete(interaction.user.id);
                };
            });

            collectComponentUpdates(cancel, async () => {
                confirm.stop(), cancel.stop();
                if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
            });

            confirm.on('end', () => {
                interaction.editReply({ components: [] });
            });

        });
    },
};

export default exportCommand;
