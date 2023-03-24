var fs = require('fs');
const { db, query } = require("../db_handler.js");
const { characters } = require("../Modules/chars.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
	name: 'level',
	description: 'see your level',
	execute(interaction) {
        
        var customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        let user = interaction.options.getUser('user') || interaction.user;

        db.serialize(async () => {
            var stats = await query(`SELECT favchar, xp, premium FROM users WHERE id = ${user.id}`);
            stats = stats[0];

            if (stats === undefined) return interaction.reply(`${user.username} has not started playing camelot yet.`)

            var inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
            inv = {chars: JSON.parse(inv[0].chars)};
            
            let xpr = stats.xp;
            let level = 0;
            for (let i=1; xpr >= 0; i++) {
                xpr -= Math.floor(5*Math.log(i)**4 + 30);
                level++;
            }

            let uniq = [...new Set(inv.chars)];
            let thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]]?.image || "https://i.ibb.co/jZ7fHSj/camelot.png";
            if (stats.favchar !== null) {
                thumbnail = characters[stats.favchar].image;
                if (stats.premium > 3) if (customSettings[user.id + interaction.guild.id] && customSettings[user.id + interaction.guild.id].cimg[stats.favchar]) thumbnail = customSettings[user.id + interaction.guild.id].cimg[stats.favchar];
            }

            let xpTotal = Math.floor(5*Math.log(level)*Math.log(level)*Math.log(level)*Math.log(level) + 30);
            let percent = Math.floor(((xpTotal+xpr)/(xpTotal))*1000);

            let bar = "<:barLh:872111263747035177><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            if (percent >= 875) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barRh:872111194188705848>";
            else if (percent >= 750) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barRh:872111194188705848>";
            else if (percent >= 625) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            else if (percent >= 500) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            else if (percent >= 375) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            else if (percent >= 250) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            else if (percent >= 125) bar = "<:barL:872111285741969438><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${user.username}'s Level`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setDescription(`Current level: **${level}**\nXP required to level up: **${-xpr}**\n${bar}`)
            .setThumbnail(thumbnail)
            return interaction.reply({ embeds: [Embed] });
        });

    },
};