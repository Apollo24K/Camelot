import fs from 'fs';
import { EmbedBuilder } from "discord.js";
import { db, query } from "../db_handler";
import { achievements } from "../Modules/achievements";
import { search } from "../Modules/functions";

const dungeonInProgress = new Set();

module.exports = {
    name: 'select',
    description: 'Pick your battlechar',
    execute(interaction) {

        let customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        let choice = interaction.options.getString('character');
        let mode = interaction.options.getString('mode');

        db.serialize(async () => {
            const { 0: stats } = await query(`SELECT premium, party FROM users WHERE id = ${interaction.user.id}`);

            let inv = await query(`SELECT chars, skin FROM characters WHERE id = ${interaction.user.id}`);
            inv = { chars: JSON.parse(inv[0].chars), skin: JSON.parse(inv[0].skin) };

            let char = search(choice, inv.chars, interaction);
            if (!char.name) return;
            if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);

            let thumbnail = char.image;
            if (stats.favchar !== null) thumbnail = char.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[char.id], inv.skin[char.id]);

            if (mode && stats.party !== null) {
                const chars = await query(`SELECT name, stampedechar FROM users WHERE party = '${stats.party}'`);
                if (chars.map((e) => e.stampedechar).includes(char.id)) return interaction.reply(`Someone in your party (${chars.find((e) => e.stampedechar === char.id).name}) has already selected **${char.name}**, please choose another character.`);
            };

            // Set up restrictions
            const { 0: stampede } = await query(`SELECT rowid, * FROM stampedes ORDER BY rowid DESC LIMIT 1`);
            if (!(stampede.bosshp < 1 || new Date().getDate() > 7)) {
                if (dungeonInProgress.has(interaction.user.id) && mode) return interaction.reply("You need to wait 6h before you can change your character for stampedes again.");
                if (mode) dungeonInProgress.add(interaction.user.id);
                if (mode) setTimeout(() => dungeonInProgress.delete(interaction.user.id), 6 * 60 * 60 * 1000);
            };

            const Embed = new EmbedBuilder()
                .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[char.rarity])
                .setDescription(`${mode ? "Stampede" : "Battle"} character set to \n**${char.name}**`)
                .setImage(thumbnail);
            interaction.reply({ embeds: [Embed] });

            // Achievements
            achievements[46].check(interaction); // First Steps

            await query(`UPDATE users SET ${mode ? "stampedechar" : "battlechar"} = ${char.id} WHERE id = ${interaction.user.id}`);
        });

    },
};