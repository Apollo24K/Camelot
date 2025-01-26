import fs from 'fs';
import { EmbedBuilder } from "discord.js";
import { characters } from "../Modules/chars";
import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'level',
    async execute({ interaction, author }) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        const user = interaction.options.getUser('user') ?? interaction.user;

        const stats = author.schema;

        let xpr = stats.xp;
        let level = 0;
        for (let i = 1; xpr >= 0; i++) {
            xpr -= Math.floor(5 * Math.log(i) ** 4 + 30);
            level++;
        };

        let uniq = [...new Set(stats.chars)];
        let thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]]?.image || "https://i.ibb.co/jZ7fHSj/camelot.png";
        if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[user.id]?.cimg[stats.favchar], stats.char_skin[stats.favchar]);

        const xpTotal = Math.floor(5 * Math.log(level) * Math.log(level) * Math.log(level) * Math.log(level) + 30);
        const percent = Math.floor(((xpTotal + xpr) / (xpTotal)) * 1000);

        let bar = "<:barLh:872111263747035177><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
        if (percent >= 875) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barRh:872111194188705848>";
        else if (percent >= 750) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barRh:872111194188705848>";
        else if (percent >= 625) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
        else if (percent >= 500) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
        else if (percent >= 375) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
        else if (percent >= 250) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
        else if (percent >= 125) bar = "<:barL:872111285741969438><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";

        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setAuthor({ name: `${user.username}'s Level`, iconURL: user.displayAvatarURL({ size: 2048 }) })
            .setDescription(`Current level: **${level}**\nXP required to level up: **${-xpr}**\n${bar}`)
            .setThumbnail(thumbnail);
        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;
