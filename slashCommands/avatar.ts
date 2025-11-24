import { EmbedBuilder } from "discord.js";
import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'avatar',
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction }) {
        const user = interaction.options.getUser('user') ?? interaction.user;
        const Embed = new EmbedBuilder()
            .setImage(user.displayAvatarURL({ size: 2048 }))
            .setColor(0xbbffff);
        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;
