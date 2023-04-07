var fs = require('fs');
const { MessageEmbed } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { characters } = require("../Modules/chars.js");

module.exports = {
    name: 'pity',
	description: 'See your pity',
	execute(interaction) {

        const user = interaction.options.getUser('user') || interaction.user;

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        
        db.serialize(async () => {
            let stats = await query(`SELECT lastss, lasts, pullstotal, favchar, premium FROM users WHERE id = ${user.id}`);
            stats = stats[0];
            if (!stats) return interaction.reply(user.id === interaction.user.id ? "You don't have any characters" : `${user.username} has no characters`);

            let inv = await query(`SELECT chars, skin FROM characters WHERE id = ${interaction.user.id}`);
            inv = {chars: JSON.parse(inv[0].chars), skin: JSON.parse(inv[0].skin)};

            const chars = [...new Set(inv.chars)].map((e) => characters[e]);
            let thumbnail = chars[Math.floor(Math.random() * chars.length)].image || "https://i.imgur.com/Ta2YDBN.png";
            if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[user.id]?.cimg[stats.favchar], inv.skin[stats.favchar]);

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