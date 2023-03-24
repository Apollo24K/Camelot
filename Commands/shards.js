var fs = require('fs');
const { MessageEmbed } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { characters } = require("../Modules/chars.js");

module.exports = {
    name: 'shards',
	description: 'See your shards',
	execute(interaction) {
        
        var customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        let user = interaction.options.getUser('user') || interaction.user;

        db.serialize(async () => {
            var stats = await query(`SELECT ssshard, sshard, ashard, bshard, cshard, dshard, favchar, premium FROM users WHERE id = ${user.id}`);
            stats = stats[0];
            if (!stats) return interaction.reply(`${user.id === interaction.user.id ? "You don't" : `**${user.username}** doesn't`} have any shards`);
            
            let inv = await query(`SELECT chars, ref, skin FROM characters WHERE id = ${user.id}`);
            inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref), skin: JSON.parse(inv[0].skin)};
            if (!inv.chars?.length) return interaction.reply(user.id === interaction.user.id ? "You don't have any characters" : `${user.username} has no characters`);

            let chars = [...new Set(inv.chars)].map((e) => characters[e]);

            let thumbnail = chars[Math.floor(Math.random() * chars.length)].image;
            if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[user.id]?.cimg[stats.favchar], inv.skin[stats.favchar]);

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setThumbnail(thumbnail)
            .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setDescription("Shards are used to `/refine` characters\nObtainable through `/dungeon` and `/lootbox`")
            .addFields(
                { name: 'Shards', value: `<:ss_shard:917203009543503892>x${stats.ssshard}\n<:b_shard:917202862851899392>x${stats.bshard}`, inline: true },
                { name: '\u200B', value: `<:s_shard:917202925514817566>x${stats.sshard}\n<:c_shard:917202862499582002>x${stats.cshard}`, inline: true },
                { name: '\u200B', value: `<:a_shard:917202904862052392>x${stats.ashard}\n<:d_shard:917202840563363891>x${stats.dshard}`, inline: true },
            )
            interaction.reply({ embeds: [Embed] });
            
        });

    },
};