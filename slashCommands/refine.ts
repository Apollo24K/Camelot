import { EmbedBuilder, ComponentType } from "discord.js";
import { search, getDetailedStats, rarityColor } from "../Modules/functions";
import { OfferRow } from "../Modules/components";
import { SlashCommand } from "../types";
import { getUserSchema, ownsCharacter, updateUsers } from '../Modules/queries';
import { achievements } from '../Modules/achievements';

const exportCommand: SlashCommand = {
    name: 'refine',
    async execute({ interaction, author }) {

        const maxRefinedCount = Object.values(author.schema.char_ref).filter(refinement => refinement >= 6).length;
        for (const id of [109, 110, 111, 112]) await achievements[id].check(interaction, interaction.user, maxRefinedCount);

        const choice = interaction.options.getString('character') ?? "";

        let char = search(choice, author.schema.chars, interaction);
        if (!char?.name) return;
        if (!(await ownsCharacter(interaction.user.id, author.schema.chars, char.id))) return interaction.reply(`You don't have a copy of **${char.name}**`);

        let stats = await getDetailedStats(char.id, author.schema, author.schema.dungeon_classlevels);
        if (stats.ref > 5) return interaction.reply(`**${char.name}** has already reached the max refinement level`);
        let stats2 = await getDetailedStats(char.id, author.schema, author.schema.dungeon_classlevels, 0, true);

        let shardRarity = char.rarity === "EX" || char.rarity === "VIP" ? "ss" : char.rarity.toLowerCase();
        let shardType = shardRarity + "shard" as 'ssshard' | 'sshard' | 'ashard' | 'bshard' | 'cshard' | 'dshard';
        let shardAmount = 16 * (stats.ref + 1), price = 0, shardStr = "";
        switch (char.rarity) {
            case "VIP":
            case "EX": shardStr = "<:ss_shard:917203009543503892>"; price = 2500 * (stats.ref + 1); break;
            case "SS": shardStr = "<:ss_shard:917203009543503892>"; price = 1500 * (stats.ref + 1); break;
            case "S": shardStr = "<:s_shard:917202925514817566>"; price = 750 * (stats.ref + 1); break;
            case "A": shardStr = "<:a_shard:917202904862052392>"; price = 500 * (stats.ref + 1); break;
            case "B": shardStr = "<:b_shard:917202862851899392>"; price = 300 * (stats.ref + 1); break;
            case "C": shardStr = "<:c_shard:917202862499582002>"; price = 200 * (stats.ref + 1); break;
            case "D": shardStr = "<:d_shard:917202840563363891>"; price = 100 * (stats.ref + 1); break;
            default: shardStr = "<:ss_shard:917203009543503892>"; price = 999999999; break;
        };

        if (author.schema[shardType] < shardAmount) return interaction.reply(`You don't have enough shards (**${author.schema[shardType]}**/${shardAmount}${shardStr})`);
        if (author.schema.coins < price) return interaction.reply(`You don't have enough coins. You need ${price}`);

        // Thumbnail
        const thumbnail = char.getImage(author.schema.premium, author.schema.custom_skins[char.id], author.schema.char_skin[char.id]);

        const Embed = new EmbedBuilder()
            .setTitle(char.name.slice(0, 256))
            .setColor(rarityColor(char.rarity))
            .setDescription(`Raising ${stats.ref === 5 ? "<:refinement_gold:1046869941011365899>" : "<:refinement:869132309125824552>"} for ${shardStr}**x${shardAmount}** and **${price}**<:coins:872926669055356939>`)
            .addFields(
                { name: 'HP ️️️💖', value: `${stats.hp} -> **${stats2.hp}**`, inline: true },
                { name: 'ATK ️️⚔️', value: `${stats.atk} -> **${stats2.atk}**`, inline: true },
                { name: 'DEF ️️️🛡️', value: `${stats.def} -> **${stats2.def}**`, inline: true },
            )
            .setThumbnail(thumbnail)
            .setFooter({ text: `EP: ${stats.ep} -> ${stats2.ep}${stats.ref === 5 ? `\nExpertise: ${stats.expertise} -> ${stats2.expertise}` : ""}` });
        interaction.reply({ embeds: [Embed], components: [OfferRow], fetchReply: true }).then(msg => {

            const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 30000 });
            const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 30000 });

            confirm.on('collect', async () => {
                confirm.stop(), cancel.stop();
                if (!char) return;

                const invCheck = await getUserSchema(interaction.user.id);
                if (!invCheck) {
                    if (interaction.channel?.isSendable()) interaction.channel.send("An error occurred, please try again");
                    return;
                };

                let tempStats = await getDetailedStats(char.id, invCheck, invCheck.dungeon_classlevels);
                if (tempStats.ref !== stats.ref) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`An error occurred, please try again`);
                    return;
                };
                if (tempStats.ref > 5) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`**${char.name}** has already reached the max refinement level`);
                    return;
                };
                if (invCheck[shardType] < shardAmount) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough shards (**${invCheck[shardType]}**/${shardAmount}${shardStr})`);
                    return;
                };
                if (invCheck.coins < price) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough coins (**${invCheck.coins}**/${price})`);
                    return;
                };

                if (!invCheck.char_ref[char.id]) invCheck.char_ref[char.id] = 0;
                invCheck.char_ref[char.id]++;

                await updateUsers(interaction.user.id, {
                    coins: { type: 'increment', value: -price },
                    [shardType]: { type: 'increment', value: -shardAmount },
                    char_ref: { type: 'merge_json', value: { [char.id]: 1 } },
                });

                const updatedMaxRefinedCount = Object.values(invCheck.char_ref).filter(refinement => refinement >= 6).length;
                for (const id of [109, 110, 111, 112]) await achievements[id].check(interaction, interaction.user, updatedMaxRefinedCount);

                if (interaction.channel?.isSendable()) interaction.channel.send(`Raised **${char.name}**'s refinement level successfully!`);
            });

            cancel.on('collect', () => {
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
