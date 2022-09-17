var fs = require('fs');
const { MessageEmbed } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");

module.exports = {
    name: 'balance',
	description: 'See a users coins',
	execute(interaction) {

        var customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        let user = interaction.options.getUser('user') || interaction.user;
        
        db.serialize(async () => {
            var stats = await query(`SELECT coins, dailyclaimed, favchar, premium FROM users WHERE id = ${user.id}`);
            stats = stats[0];
            if (!stats) return interaction.reply(user.id === interaction.user.id ? "You don't have any characters" : `${user.username} has no characters`);
            
            var inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
            inv = {chars: JSON.parse(inv[0].chars)};

            let thumbnail = "https://i.ibb.co/cgh59Lb/WWM4K98.png";
            if (inv.chars.length) thumbnail = characters[inv.chars[Math.floor(Math.random() * inv.chars.length)]].image;
            if (stats.favchar !== null) {
                thumbnail = characters[stats.favchar].image;
                if (stats.premium > 3) if (customSettings[user.id] && customSettings[user.id].cimg[stats.favchar]) thumbnail = customSettings[user.id].cimg[stats.favchar];
            };

            let dailyQ = stats.dailyclaimed === 1 ? "You have claimed your daily" : "Your daily is available";

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${user.username}'s Balance`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setThumbnail(thumbnail)
            .setDescription(`**Balance**: ${stats.coins}<:coins:872926669055356939>\n${dailyQ}`)
            interaction.reply({ embeds: [Embed] });            
        });

    },
};