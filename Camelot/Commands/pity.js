var fs = require('fs');
const { MessageEmbed } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { characters } = require("../Modules/chars.js");

module.exports = {
    name: 'pity',
	description: 'See your pity',
	execute(interaction) {

        let user = interaction.options.getUser('user') || interaction.user;

        var customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        
        db.serialize(async () => {
            var stats = await query(`SELECT lastss, lasts, pullstotal, favchar, premium FROM users WHERE id = ${user.id}`);
            stats = stats[0];
            if (!stats) return interaction.reply(user.id === interaction.user.id ? "You don't have any characters" : `${user.username} has no characters`);

            var inv = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
            inv = {chars: JSON.parse(inv[0].chars)};

            let thumbnail = "https://i.ibb.co/cgh59Lb/WWM4K98.png";
            if (inv.chars.length) thumbnail = characters[inv.chars[Math.floor(Math.random() * inv.chars.length)]].image;
            if (stats.favchar !== null) {
                thumbnail = characters[stats.favchar].image;
                if (stats.premium > 3) if (customSettings[user.id] && customSettings[user.id].cimg[stats.favchar]) thumbnail = customSettings[user.id].cimg[stats.favchar];
            };

            let sPit = 80;
            let ssPit = 210;
            switch (stats.premium) {
                case 1: sPit = 70, ssPit = 180; break;
                case 2: sPit = 65, ssPit = 170; break;
                case 3: sPit = 60, ssPit = 160; break;
                case 4: sPit = 60, ssPit = 160; break;
                case 5: sPit = 50, ssPit = 150; break;
                case 6: sPit = 50, ssPit = 150; break;
                case 7: sPit = 50, ssPit = 150; break;
                default : false; break;
            };

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${user.username}'s profile`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setDescription(`Since last <:STier:869316518675095552> pull: **${stats.lasts}**/${sPit}\nSince last <:SSTier:869316489931546644> pull: **${stats.lastss}**/${ssPit}\n\nYou have pulled a total of **${stats.pullstotal}** times!`)
            .setThumbnail(thumbnail)
            return interaction.reply({ embeds: [Embed] });

        });

    },
};