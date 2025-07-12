import { SlashCommand } from '../types';
import { EmbedBuilder } from "discord.js";
import Package from '../package.json';

const exportCommand: SlashCommand = {
    name: 'support',
    async execute({ interaction, author }) {

        const Embed = new EmbedBuilder()
            .setTitle("Camelot Support")
            .setColor(0xbbffff)
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setDescription("Join our support server to reach us!\nYou can ask for help and help us improve the bot <:RaphiSmile:868998036645380197>\n\nServer Link: https://discord.gg/myy9PBCdEW")
            .setFooter({ text: `Camelot ${Package.version} • Made by Apollo24 & PokeLink`, iconURL: "https://i.imgur.com/syj1LqO.jpeg" });
        return interaction.reply({ embeds: [Embed] });

    },
};

export default exportCommand;
