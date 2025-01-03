import { EmbedBuilder } from 'discord.js';
import Package from '../package.json';
import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'terms',
    async execute({ interaction }) {
        const Embed = new EmbedBuilder()
            .setTitle('Camelot')
            .setColor(0xbbffff)
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setDescription("Camelot's Terms of Service outlines the terms and guidelines players must follow when playing. Not knowing about them doesn't grant you protection against possible penalties and restrictions that may apply if you break them, so you better read them!\n\n[Terms of Service](<https://rank.top/bot/camelot?page=terms>)\n[Privacy Policy](<https://rank.top/bot/camelot?page=privacy>)")
            .setFooter({ text: `Camelot ${Package.version} • Made by Apollo24 & PokeLinker`, iconURL: "https://i.imgur.com/RbLjdQ4.png" });
        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;