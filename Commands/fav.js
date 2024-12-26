import fs from 'fs';
import { EmbedBuilder } from "discord.js";
import { db, query } from "../db_handler";
import { achievements } from "../Modules/achievements";
import { search } from "../Modules/functions";

module.exports = {
    name: 'fav',
    description: 'Pick your favorite character',
    execute(interaction) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        const choice = interaction.options.getString('character');

        db.serialize(async () => {
            const { 0: stats } = await query(`SELECT premium FROM users WHERE id = ${interaction.user.id}`);

            let inv = await query(`SELECT chars, skin FROM characters WHERE id = ${interaction.user.id}`);
            inv = { chars: JSON.parse(inv[0].chars), skin: JSON.parse(inv[0].skin) };

            const char = search(choice, inv.chars, interaction);
            if (!char.name) return;
            if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);

            await query(`UPDATE users SET favchar = ${char.id} WHERE id = ${interaction.user.id}`);

            const thumbnail = char.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[char.id], inv.skin[char.id]);

            const Embed = new EmbedBuilder()
                .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[char.rarity])
                .setDescription(`Favourite character set to \n**${char.name}**`)
                .setImage(thumbnail);
            interaction.reply({ embeds: [Embed] });

            // Achievements
            achievements[46].check(interaction); // First Steps
        });

    },
};