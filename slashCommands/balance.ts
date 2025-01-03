import { EmbedBuilder } from "discord.js";
import { characters } from "../Modules/chars";
import { formatNumberWithQuotes } from "../Modules/functions";
import { SlashCommand } from '../types';
import { getUserSchema } from '../Modules/queries';

const exportCommand: SlashCommand = {
    name: 'balance',
    async execute({ interaction, author }) {
        let user = interaction.options.getUser('user') || interaction.user;
        let choice = (interaction.options.getString('currency') || "all") as "all" | "coins" | "gems" | "jades" | "lilies" | "guild_marks";

        const stats = user.id === interaction.user.id ? author.schema : await getUserSchema(user.id);
        if (!stats) return interaction.reply("User not found");

        let thumbnail = characters[stats.chars[Math.floor(Math.random() * stats.chars.length)]].image || "https://i.imgur.com/Ta2YDBN.png";
        if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, "", stats.char_skin[stats.favchar]);

        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setAuthor({ name: `${user.username}'s Balance`, iconURL: user.displayAvatarURL({ size: 1024 }) })
            .setThumbnail(thumbnail);
        if (choice === "all") Embed.setDescription(`**Coins**: \`${formatNumberWithQuotes(stats.coins)}\`<:coins:872926669055356939>\n**Gems**: \`${formatNumberWithQuotes(stats.gems)}\`<:genesis_gems:1034179687720681492>\n**Jades**: \`${formatNumberWithQuotes(stats.jades)}\`<:eternal_jade:1256124504141201428>\n**Marks**: \`${formatNumberWithQuotes(stats.guild_marks)}\`<:guild_mark:1317944450814840923>\n**Lilium**: \`${formatNumberWithQuotes(stats.lilies)}\`<:lilium:974057059618291732>`);
        else if (choice === "coins") Embed.setDescription(`**Balance**: \`${formatNumberWithQuotes(stats[choice])}\`<:coins:872926669055356939>\n${stats.dailyclaimed === 1 ? "You have claimed your daily" : "Your </daily:1011371510759428136> is available!"}`);
        else if (choice === "gems") Embed.setDescription(`**Balance**: \`${formatNumberWithQuotes(stats[choice])}\`<:genesis_gems:1034179687720681492>\nSee </shop:1012711410343620618> if you need more <:LuminousPsssh:1071574041116295328>`);
        else if (choice === "jades") Embed.setDescription(`**Balance**: \`${formatNumberWithQuotes(stats[choice])}\`<:eternal_jade:1256124504141201428>\nUse \`/convert jades\` to get gems <:genesis_gems:1034179687720681492>`);
        else if (choice === "lilies") Embed.setDescription(`**Balance**: \`${formatNumberWithQuotes(stats[choice])}\`<:lilium:974057059618291732>\nCan be traded for items in the </monthly shop:1224116997575671889>`);
        else Embed.setDescription(`**Balance**: \`${formatNumberWithQuotes(stats[choice])}\`<:guild_mark:1317944450814840923>\nCan be traded for items in the </raid shop:1317944450814840923>`);

        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;
