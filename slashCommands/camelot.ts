/* eslint-disable no-undef */
import { EmbedBuilder } from 'discord.js';
import Package from '../package.json';
import { SlashCommand } from '../types';
import { getTotalPlayers } from '../Modules/queries';

function format(sec: number) {
    function pad(s: number) {
        return (s < 10 ? '0' : '') + s;
    };
    let hours = Math.floor(sec / (60 * 60));
    let minutes = Math.floor(sec % (60 * 60) / 60);
    let seconds = Math.floor(sec % 60);

    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
};

const exportCommand: SlashCommand = {
    name: 'camelot',
    async execute({ interaction }) {

        const playerCount = await getTotalPlayers();

        const Embed = new EmbedBuilder()
            .setTitle('Camelot')
            .setColor(0xbbffff)
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setFooter({ text: `Camelot ${Package.version} • Made by Apollo24 & PokeLinker`, iconURL: "https://i.imgur.com/RbLjdQ4.png" })
            .setDescription("Absent in the early Arthurian material, Camelot came to be described as the fantastic capital of Arthur's realm and a symbol of the Arthurian world.")
            .addFields(
                { name: 'Stats️', value: `Servers: **${interaction.client.guilds.cache.size}**\nPlayers: **${playerCount}**`, inline: true },
                { name: '_ _', value: `RAM: **${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 10) / 10}MB**\nUptime: **${format(process.uptime())}**`, inline: true },
            );
        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;
