import { EmbedBuilder } from "discord.js";
import { items } from "../Modules/items";
import { characters } from "../Modules/chars";
import { getDetailedStats } from "../Modules/functions";
import { SlashCommand } from '../types';
import { getUserSchema, updateUsersAndCache } from '../Modules/queries';

const charxpByRarity = {
    "genesis": 50000,
    "mythical": 3000,
    "legendary": 500,
    "unique": 250,
    "rare": 100,
    "special": 50,
    "normal": 20,
};

const exportCommand: SlashCommand = {
    name: 'feed',
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction, author }) {

        const selected = parseInt(interaction.options.getString('use', true));
        const amountFlag = interaction.options.getString('amount') ?? "1";

        if (items[selected]?.category !== "fish") return interaction.reply(`Please select a fish from your inventory.`);

        const inv = author.schema;

        if (inv.battlechar === null) return interaction.reply("You have not selected a battle character yet, please do so using `/select`");
        if (!inv.items[selected]) return interaction.reply(`Please select a fish from your inventory.`);
        if (inv.feedlimit >= 20) return interaction.reply(`Your character is full, please try again tomorrow!`);

        const char = characters[inv.battlechar];
        if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);

        let stats = await getDetailedStats(char.id, inv, inv.dungeon_classlevels);
        let currLvl = stats.lvl;

        // Level up by
        let amount = 1;
        if (amountFlag.toLowerCase() === "max") {
            amount = inv.items[selected];
        } else {
            amount = parseInt(amountFlag) || 1;
            if (amount > inv.items[selected]) amount = inv.items[selected];
        };
        if (inv.feedlimit + amount > 20) amount = 20 - inv.feedlimit;

        let addxp = amount * charxpByRarity[items[selected].grade];
        let xpleft = Math.max((50 * 1 * ((2 * currLvl) + 1 + 7)) - inv.charxp, 0);

        if (amount === inv.items[selected]) delete inv.items[selected];
        else inv.items[selected] -= amount;

        if (addxp >= xpleft) {
            addxp -= xpleft;

            await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates: {
                    charxp: { type: 'set', value: addxp },
                    level: { type: 'increment', value: 1 },
                    feedlimit: { type: 'increment', value: amount },
                    items: { type: 'merge_json', value: { [selected]: -amount } },
                },
            });

            const stats2 = await getDetailedStats(char.id, inv, inv.dungeon_classlevels, 1);

            const Embed = new EmbedBuilder()
                .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[char.rarity])
                .setDescription(`**${char.name}** has reached level **${currLvl + 1}**!`)
                .addFields(
                    { name: 'HP ️️️💖', value: `${stats.hp} ➜ **${stats2.hp}**`, inline: true },
                    { name: 'ATK ️️⚔️', value: `${stats.atk} ➜ **${stats2.atk}**`, inline: true },
                    { name: 'DEF ️️️🛡️', value: `${stats.def} ➜ **${stats2.def}**`, inline: true },
                )
                .setThumbnail(char.getImage(inv.premium, stats.custom_skins[char.id], inv.char_skin[char.id]))
                .setFooter({ text: `EP: ${stats.ep} ➜ ${stats2.ep}` });
            return interaction.reply({ embeds: [Embed] });
        } else {
            await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates: {
                    charxp: { type: 'increment', value: addxp },
                    feedlimit: { type: 'increment', value: amount },
                    items: { type: 'merge_json', value: { [selected]: -amount } },
                },
            });

            return interaction.reply(`**${char.name}** received ${addxp} xp!`);
        };
    },
    async autocomplete({ interaction }) {
        const inv = await getUserSchema(interaction.user.id);
        if (!inv) return [];

        const fish = Object.entries(inv.items)
            .filter(([key, amount]) => items[key as any].category === "fish" && amount > 0)
            .sort((a, b) => parseInt(b[0]) - parseInt(a[0]));

        return fish.map((e) => ({ name: `${items[e[0] as any].name} (${charxpByRarity[items[e[0] as any].grade]}xp) | x${e[1]}`, value: e[0] })).filter((e) => e.name.toLowerCase().includes(interaction.options.getFocused().toLowerCase()));
    },
};

export default exportCommand;
