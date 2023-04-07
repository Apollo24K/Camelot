var fs = require('fs');
const { MessageEmbed } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");

module.exports = {
    name: 'balance',
	description: 'See a users coins',
	execute(interaction) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        let user = interaction.options.getUser('user') || interaction.user;
        let choice = interaction.options.getString('currency') || "coins";
        
        db.serialize(async () => {
            let stats = await query(`SELECT ${choice}, dailyclaimed, favchar, premium FROM users WHERE id = ${user.id}`);
            stats = stats[0];
            if (!stats) return interaction.reply(user.id === interaction.user.id ? "You don't have any characters" : `${user.username} has no characters`);
            
            let inv = await query(`SELECT chars, skin FROM characters WHERE id = ${user.id}`);
            inv = {chars: JSON.parse(inv[0].chars), skin: JSON.parse(inv[0].skin)};

            let thumbnail = characters[inv.chars[Math.floor(Math.random() * inv.chars.length)]].image || "https://i.imgur.com/Ta2YDBN.png";
            if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[user.id]?.cimg[stats.favchar], inv.skin[stats.favchar]);

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${user.username}'s Balance`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setThumbnail(thumbnail)
            if (choice === "coins") Embed.setDescription(`**Balance**: \`${stats[choice]}\` <:coins:872926669055356939>\n${stats.dailyclaimed === 1 ? "You have claimed your daily" : "Your daily is available"}`);
            else if (choice === "gems") Embed.setDescription(`**Balance**: \`${stats[choice]}\` <:genesis_gems:1034179687720681492>\nSee </shop:1012711410343620618> if you need more <:LuminousPsssh:1071574041116295328>`);
            else Embed.setDescription(`**Balance**: \`${stats[choice]}\` <:lilium:974057059618291732>\nYes, you actually can't do anything with lilies <:MikuHappy:1045096947876368404>`);

            return interaction.reply({ embeds: [Embed] });
        });

    },
};