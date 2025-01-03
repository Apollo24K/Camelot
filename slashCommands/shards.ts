import fs from 'fs';
import { EmbedBuilder } from "discord.js";
import { characters } from "../Modules/chars";
import { SlashCommand } from '../types';
import { getUserSchema } from '../Modules/queries';

const exportCommand: SlashCommand = {
    name: 'shards',
    async execute({ interaction, author }) {
        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        const user = interaction.options.getUser('user') || interaction.user;

        const stats = user.id === interaction.user.id ? author.schema : await getUserSchema(user.id);
        if (!stats) return interaction.reply(`${user.id === interaction.user.id ? "You don't" : `**${user.username}** doesn't`} have any shards`);

        let chars = [...new Set(stats.chars)].map((e) => characters[e]);
        let thumbnail = chars[Math.floor(Math.random() * chars.length)].image;
        if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[user.id]?.cimg[stats.favchar], stats.char_skin[stats.favchar]);

        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setThumbnail(thumbnail)
            .setAuthor({ name: `${user.username}'s inventory`, iconURL: user.displayAvatarURL({ size: 1024 }) })
            .setDescription("Shards are used to `/refine` characters\nObtainable through `/dungeon` and `/lootbox`")
            .addFields(
                { name: 'Shards', value: `<:ss_shard:917203009543503892>x${stats.ssshard}\n<:b_shard:917202862851899392>x${stats.bshard}`, inline: true },
                { name: '\u200B', value: `<:s_shard:917202925514817566>x${stats.sshard}\n<:c_shard:917202862499582002>x${stats.cshard}`, inline: true },
                { name: '\u200B', value: `<:a_shard:917202904862052392>x${stats.ashard}\n<:d_shard:917202840563363891>x${stats.dshard}`, inline: true },
            );
        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;
