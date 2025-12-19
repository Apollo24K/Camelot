import { EmbedBuilder } from "discord.js";
import { characters } from "../Modules/chars";
import { SlashCommand } from '../types';
import { getUserSchema } from '../Modules/queries';

const exportCommand: SlashCommand = {
    name: 'pity',
    async execute({ interaction, author }) {

        const user = interaction.options.getUser('user') || interaction.user;

        const stats = user.id === interaction.user.id ? author.schema : await getUserSchema(user.id);
        if (!stats) return interaction.reply(user.id === interaction.user.id ? "You don't have any characters" : `${user.username} has no characters`);

        const chars = [...new Set(stats.chars)].map((e) => characters[e]);
        let thumbnail = chars[Math.floor(Math.random() * chars.length)].image || "https://i.imgur.com/Ta2YDBN.png";
        if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, "", stats.char_skin[stats.favchar]);

        let sPit = 120;
        let ssPit = 300;
        switch (stats.premium) {
            case 1: sPit = 100, ssPit = 260; break;
            case 2: sPit = 90, ssPit = 240; break;
            case 3: sPit = 85, ssPit = 230; break;
            case 4: sPit = 80, ssPit = 225; break;
            case 5: sPit = 75, ssPit = 220; break;
            case 6: sPit = 70, ssPit = 210; break;
            case 7: sPit = 60, ssPit = 200; break;
            default: false; break;
        };

        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setAuthor({ name: `${user.username}'s profile`, iconURL: user.displayAvatarURL({ size: 1024 }) })
            .setDescription(`Since last <:STier:869316518675095552> pull: **${stats.lasts}**/${sPit}\nSince last <:SSTier:869316489931546644> pull: **${stats.lastss}**/${ssPit}\n\nYou have pulled a total of **${stats.pullstotal}** times!`)
            .setThumbnail(thumbnail);
        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;
