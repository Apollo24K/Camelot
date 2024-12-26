import fs from 'fs';
import { EmbedBuilder } from "discord.js";
import { db, query } from "../db_handler";
import { items } from "../Modules/items";
import { characters } from "../Modules/chars";
import { getDetailedStats } from "../Modules/functions";

const charxpByRarity = {
    "genesis": 50000,
    "mythical": 3000,
    "legendary": 500,
    "unique": 250,
    "rare": 100,
    "special": 50,
    "normal": 20,
};

module.exports = {
    name: 'feed',
    description: 'level your characters up',
    execute(interaction) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        let selected = interaction.options.getString('use');
        let amount = interaction.options.getString('amount') ?? "1";

        if (items[selected]?.category !== "fish") return interaction.reply(`Please select a fish from your inventory.`);

        db.serialize(async () => {
            const { 0: inv } = await query(`SELECT users.coins, users.bank, users.battlechar, users.premium, users.class, users.items, users.level, users.charxp, users.feedlimit, users.shield_slot, characters.chars, characters.ref, users.equipment, characters.skin, dungeon.classlevels FROM characters JOIN dungeon ON characters.id = dungeon.id JOIN users ON characters.id = users.id WHERE characters.id = ${interaction.user.id}`);
            inv.id = interaction.user.id, inv.items = JSON.parse(inv.items), inv.chars = JSON.parse(inv.chars), inv.ref = JSON.parse(inv.ref), inv.equipment = JSON.parse(inv.equipment), inv.skin = JSON.parse(inv.skin), inv.classlevels = JSON.parse(inv.classlevels);

            if (inv.battlechar === null) return interaction.reply("You have not selected a battle character yet, please do so using `/select`");
            if (!inv.items[selected]) return interaction.reply(`Please select a fish from your inventory.`);
            if (inv.feedlimit >= 20) return interaction.reply(`Your character is full, please try again tomorrow!`);

            let char = characters[inv.battlechar];
            if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);

            let stats = await getDetailedStats(char.id, inv, inv.classlevels);
            let currLvl = stats.lvl;

            // Level up by
            if (amount.toLowerCase() === "max") {
                amount = inv.items[selected];
            } else {
                amount = parseInt(amount) || 1;
                if (amount > inv.items[selected]) amount = inv.items[selected];
            };
            if (inv.feedlimit + amount > 20) amount = 20 - inv.feedlimit;

            let addxp = amount * charxpByRarity[items[selected].grade];
            let xpleft = Math.max((50 * 1 * ((2 * currLvl) + 1 + 7)) - inv.charxp, 0);

            if (amount === inv.items[selected]) delete inv.items[selected];
            else inv.items[selected] -= amount;

            if (addxp >= xpleft) {
                addxp -= xpleft;
                await query(`UPDATE users SET charxp = ${addxp}, level = ${inv.level + 1}, feedlimit = feedlimit + ${amount}, items = '${JSON.stringify(inv.items)}' WHERE id = ${interaction.user.id}`);

                let stats2 = await getDetailedStats(char.id, inv, inv.classlevels, 1);

                const Embed = new EmbedBuilder()
                    .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[char.rarity])
                    .setDescription(`**${char.name}** has reached level **${currLvl + 1}**!`)
                    .addFields(
                        { name: 'HP ️️️💖', value: `${stats.hp} ➜ **${stats2.hp}**`, inline: true },
                        { name: 'ATK ️️⚔️', value: `${stats.atk} ➜ **${stats2.atk}**`, inline: true },
                        { name: 'DEF ️️️🛡️', value: `${stats.def} ➜ **${stats2.def}**`, inline: true },
                    )
                    .setThumbnail(char.getImage(inv.premium, customSettings[interaction.user.id]?.cimg[char.id], inv.skin[char.id]))
                    .setFooter({ text: `EP: ${stats.ep} ➜ ${stats2.ep}` });
                return interaction.reply({ embeds: [Embed] });
            } else {
                await query(`UPDATE users SET charxp = charxp + ${addxp}, feedlimit = feedlimit + ${amount}, items = '${JSON.stringify(inv.items)}' WHERE id = ${interaction.user.id}`);
                return interaction.reply(`**${char.name}** received ${addxp} xp!`);
            };
        });

    },
    async autocomplete({ interaction }) {
        const { 0: inv } = await query(`SELECT items FROM users WHERE id = ${interaction.user.id}`);

        const fish = Object.entries(JSON.parse(inv.items)).filter(([key,]) => items[key]?.category === "fish").sort((a, b) => parseInt(b[0]) - parseInt(a[0]));

        return fish.map((e) => ({ name: `${items[e[0]].name} (${charxpByRarity[items[e[0]].grade]}xp) | x${e[1]}`, value: e[0] })).filter((e) => e.name.toLowerCase().includes(interaction.options.getFocused().toLowerCase()));
    },
};
