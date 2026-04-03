import { EmbedBuilder, ComponentType } from "discord.js";
import { characters } from "../Modules/chars";
import { achievements } from "../Modules/achievements";
import { getDetailedStats, rarityColor } from "../Modules/functions";
import { OfferRow } from "../Modules/components";
import { SlashCommand } from '../types';
import { getUserSchema, updateUsersAndCache } from '../Modules/queries';

const exportCommand: SlashCommand = {
    name: 'levelup',
    async execute({ interaction, author }) {

        // const choice = interaction.options.getString('character');
        let byFlag = interaction.options.getString('by') || "1";
        if (parseInt(byFlag) < 1) return interaction.reply(`You can't level up by **${byFlag}** levels`);

        const inv = author.schema;
        if (inv.battlechar === null) return interaction.reply("You have not selected a battle character yet, please do so using `/select`");

        const char = characters[inv.battlechar];
        if (!char?.name) return;
        if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);

        let stats = await getDetailedStats(char.id, inv, inv.dungeon_classlevels);
        let currLvl = stats.lvl;

        // Level up by
        let up = 1;
        if (byFlag.toLowerCase() === "max") {
            // let iCoins = inv.coins, lvup = 0;
            // while (iCoins >= 0) {
            //     iCoins -= 500 + 100*(currLvl-1+lvup++);
            // };
            // up = lvup-1;
            up = Math.floor((Math.sqrt((2 * (inv.coins + inv.charxp)) + (100 * (currLvl * currLvl)) + (700 * currLvl) + 1225) / 10) - 3.5 - currLvl);
            if (up === 0) return interaction.reply("You don't have enough coins");
        } else {
            up = parseInt(byFlag) || 1;
        };

        let stats2 = await getDetailedStats(char.id, inv, inv.dungeon_classlevels, up);

        // let price = 0;
        // for (let i=0; i < up; i++) {
        //     price += 500 + 100*(currLvl-1+i);
        // };
        let price = Math.max((50 * up * ((2 * currLvl) + up + 7)) - inv.charxp, 0);
        if (inv.coins < price) return interaction.reply(`You don't have enough coins (**${inv.coins}**/${price}<:coins:872926669055356939>)`);

        // Thumbnail
        const thumbnail = char.getImage(inv.premium, inv.custom_skins[char.id], inv.char_skin[char.id]);

        const Embed = new EmbedBuilder()
            .setColor(rarityColor(char.rarity))
            .setDescription(`**${char.name}**\nLevel up from ${currLvl} ➜ **${currLvl + up}** for **${price}**<:coins:872926669055356939>`)
            .addFields(
                { name: 'HP ️️️💖', value: `${stats.hp} ➜ **${stats2.hp}**`, inline: true },
                { name: 'ATK ️️⚔️', value: `${stats.atk} ➜ **${stats2.atk}**`, inline: true },
                { name: 'DEF ️️️🛡️', value: `${stats.def} ➜ **${stats2.def}**`, inline: true },
            )
            .setThumbnail(thumbnail)
            .setFooter({ text: `EP: ${stats.ep} ➜ ${stats2.ep}` });
        return interaction.reply({ embeds: [Embed], components: [OfferRow], fetchReply: true }).then(msg => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 30000 });

            collector.on('collect', async r => {
                collector.stop();
                if (r.customId === "cancel") {
                    if (interaction.channel?.isSendable()) return interaction.channel.send("Action cancelled");
                    return;
                };

                const inv = await getUserSchema(interaction.user.id);
                if (!inv) {
                    if (interaction.channel?.isSendable()) return interaction.channel.send("User not found");
                    return;
                };

                if (inv.coins < price) {
                    if (interaction.channel?.isSendable()) return interaction.channel.send(`You don't have enough coins (**${inv.coins}**/${price}<:coins:872926669055356939>)`);
                    return;
                };

                stats = await getDetailedStats(char.id, inv, inv.dungeon_classlevels);
                if (currLvl !== stats.lvl) {
                    if (interaction.channel?.isSendable()) return interaction.channel.send(`You have already leveled up your character.`);
                    return;
                };

                // Update user table
                await updateUsersAndCache(interaction.client, interaction.user.id, {
                    updates: {
                        coins: { type: "increment", value: -price },
                        charxp: { type: "set", value: 0 },
                        level: { type: "increment", value: up },
                    },
                });

                if (interaction.channel?.isSendable()) interaction.channel.send(`**${char.name}** reached level ${currLvl + up}!`);

                // Achievements
                achievements[42].check(interaction, interaction.user, currLvl + up), achievements[43].check(interaction, interaction.user, currLvl + up), achievements[44].check(interaction, interaction.user, currLvl + up), achievements[45].check(interaction, interaction.user, currLvl + up); // The Battle is to the Strong

                // From Riches to Rags
                achievements[64].check(interaction, interaction.user, price), achievements[65].check(interaction, interaction.user, price), achievements[66].check(interaction, interaction.user, price);

                // The Battle is to the Strong II
                achievements[71].check(interaction, interaction.user, currLvl + up), achievements[72].check(interaction, interaction.user, currLvl + up), achievements[73].check(interaction, interaction.user, currLvl + up), achievements[74].check(interaction, interaction.user, currLvl + up);
            });

            collector.on('end', () => {
                interaction.editReply({ components: [] });
            });
        });
    },
};

export default exportCommand;
