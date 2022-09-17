var fs = require('fs');
const { MessageEmbed } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { achievements } = require("../Modules/achievements.js");
const { search } = require("../Modules/functions.js");

module.exports = {
    name: 'fav',
	description: 'Pick your favorite character',
	execute(interaction) {

        var customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        
        db.serialize(async () => {
            var stats = await query(`SELECT premium FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];

            var inv = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
            inv = {chars: JSON.parse(inv[0].chars)};
            
            let choice = interaction.options.getString('character');
            
            let char = search(choice, inv.chars, interaction);
            if (!char.name) return;
            if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);

            let img = char.image;
            if (stats.premium > 2) if (customSettings[interaction.user.id]?.cimg[char.id]) img = customSettings[interaction.user.id].cimg[char.id];        
            
            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setDescription(`Favourite character set to \n**${char.name}**`)
            .setImage(img)
            interaction.reply({ embeds: [Embed] });

            // Achievements
            achievements[46].check(interaction); // First Steps
            
            await query(`UPDATE users SET favchar = ${char.id} WHERE id = ${interaction.user.id}`);
        });

    },
};