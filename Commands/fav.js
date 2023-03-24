var fs = require('fs');
const { MessageEmbed } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { achievements } = require("../Modules/achievements.js");
const { search } = require("../Modules/functions.js");

module.exports = {
    name: 'fav',
	description: 'Pick your favorite character',
	execute(interaction) {

        let customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        
        db.serialize(async () => {
            let stats = await query(`SELECT premium FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];

            let inv = await query(`SELECT chars, skin FROM characters WHERE id = ${interaction.user.id}`);
            inv = {chars: JSON.parse(inv[0].chars), skin: JSON.parse(inv[0].skin)};
            
            let choice = interaction.options.getString('character');
            
            let char = search(choice, inv.chars, interaction);
            if (!char.name) return;
            if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);

            let thumbnail = char.image;
            if (stats.favchar !== null) thumbnail = char.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[char.id], inv.skin[char.id]);

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setDescription(`Favourite character set to \n**${char.name}**`)
            .setImage(thumbnail)
            interaction.reply({ embeds: [Embed] });

            // Achievements
            achievements[46].check(interaction); // First Steps
            
            await query(`UPDATE users SET favchar = ${char.id} WHERE id = ${interaction.user.id}`);
        });

    },
};