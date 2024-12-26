import fs from 'fs';
import { EmbedBuilder } from "discord.js";
import { characters } from "../Modules/chars";
import { db, query } from "../db_handler";
import { formatNumberWithQuotes } from "../Modules/functions";

module.exports = {
    name: 'balance',
    description: 'See a users balance',
    execute(interaction) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        let user = interaction.options.getUser('user') || interaction.user;
        let choice = interaction.options.getString('currency') || "all";

        db.serialize(async () => {
            const { 0: stats } = await query(`SELECT coins, gems, jades, lilies, guild_marks, dailyclaimed, favchar, premium FROM users WHERE id = ${user.id}`);
            if (!stats) return interaction.reply(user.id === interaction.user.id ? "You don't have any characters" : `${user.username} has no characters`);

            let inv = await query(`SELECT chars, skin FROM characters WHERE id = ${user.id}`);
            inv = { chars: JSON.parse(inv[0].chars), skin: JSON.parse(inv[0].skin) };

            let thumbnail = characters[inv.chars[Math.floor(Math.random() * inv.chars.length)]].image || "https://i.imgur.com/Ta2YDBN.png";
            if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[user.id]?.cimg[stats.favchar], inv.skin[stats.favchar]);

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setAuthor({ name: `${user.username}'s Balance`, iconURL: user.displayAvatarURL({ dynamic: true }) + "?size=2048" })
                .setThumbnail(thumbnail);
            if (choice === "all") Embed.setDescription(`**Coins**: \`${formatNumberWithQuotes(stats.coins)}\`<:coins:872926669055356939>\n**Gems**: \`${formatNumberWithQuotes(stats.gems)}\`<:genesis_gems:1034179687720681492>\n**Jades**: \`${formatNumberWithQuotes(stats.jades)}\`<:eternal_jade:1256124504141201428>\n**Marks**: \`${formatNumberWithQuotes(stats.guild_marks)}\`<:guild_mark:1317944450814840923>\n**Lilium**: \`${formatNumberWithQuotes(stats.lilies)}\`<:lilium:974057059618291732>`);
            else if (choice === "coins") Embed.setDescription(`**Balance**: \`${formatNumberWithQuotes(stats[choice])}\`<:coins:872926669055356939>\n${stats.dailyclaimed === 1 ? "You have claimed your daily" : "Your </daily:1011371510759428136> is available!"}`);
            else if (choice === "gems") Embed.setDescription(`**Balance**: \`${formatNumberWithQuotes(stats[choice])}\`<:genesis_gems:1034179687720681492>\nSee </shop:1012711410343620618> if you need more <:LuminousPsssh:1071574041116295328>`);
            else if (choice === "jades") Embed.setDescription(`**Balance**: \`${formatNumberWithQuotes(stats[choice])}\`<:eternal_jade:1256124504141201428>\nUse \`/convert jades\` to get gems <:genesis_gems:1034179687720681492>`);
            else if (choice === "lilies") Embed.setDescription(`**Balance**: \`${formatNumberWithQuotes(stats[choice])}\`<:lilium:974057059618291732>\nCan be traded for items in the </monthly shop:1224116997575671889>`);
            else Embed.setDescription(`**Balance**: \`${formatNumberWithQuotes(stats[choice])}\`<:guild_mark:1317944450814840923>\nCan be traded for items in the </raid shop:1317944450814840923>`);

            return interaction.reply({ embeds: [Embed] });
        });

    },
};
