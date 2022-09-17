var fs = require('fs');
const { MessageEmbed } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { search, splitTitle, baseHP, baseATK, baseDEF, getDetailedStats, rarity, getRefinement } = require("../Modules/functions.js");
const { classes } = require("../Modules/classes.js");

module.exports = {
    name: 'info',
	description: 'Character info',
	execute(interaction) {

        var customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        
        let user = interaction.options.getUser('user') || interaction.user;
        let flag = interaction.options.getString('flag');

        db.serialize(async () => {
            var stats = await query(`SELECT premium FROM users WHERE id = ${user.id}`);
            stats = stats[0];
            if (!stats) return interaction.reply(user.id === interaction.user.id ? "You don't have any characters" : `${user.username} has no characters`);

            var inv = await query(`SELECT chars, class, ref, level FROM characters WHERE id = ${user.id}`);
            inv = {chars: JSON.parse(inv[0].chars), class: JSON.parse(inv[0].class), ref: JSON.parse(inv[0].ref), level: JSON.parse(inv[0].level)};

            var dg = await query(`SELECT classes, classlevels FROM dungeon WHERE id = ${user.id}`);
            dg = {classes: JSON.parse(dg[0].classes), classlevels: JSON.parse(dg[0].classlevels)};

            let choice = interaction.options.getString('character');
            
            let char = search(choice, inv.chars, interaction);
            if (!char.name) return;

            let img = char.image;
            if (stats.premium > 2) if (customSettings[user.id] && customSettings[user.id].cimg[char.id]) img = customSettings[user.id].cimg[char.id];
            
            if (flag === "base") {
                
                let hp = baseHP(char.id);
                let atk = baseATK(char.id);
                let def = baseDEF(char.id);
                let ep = Math.floor(((hp/Math.pow(0.99818,def)) / (200/atk))*100) / 100;
                
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setImage(img)
                .setThumbnail(rarity(char.rarity))
                .setDescription(`**${char.name}**\n${splitTitle(char.anime)}\n`)
                .addFields(
                    { name: 'HP ️️️💖', value: ""+hp, inline: true },
                    { name: 'ATK ️️⚔️', value: ""+atk, inline: true },
                    { name: 'DEF ️️️🛡️', value: ""+def, inline: true },
                )
                .setFooter(`ID: #${char.id} | EP: ${ep}`)
                return interaction.reply({ embeds: [Embed] });
            };
            
            if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);
            let charstats = getDetailedStats(char.id, inv, dg.classlevels);
            let cls = charstats.class === -1 ? "None" : `${classes[charstats.class].name}${classes[charstats.class].emblem}Lvl. ${charstats.clvl}`;
            let dupes = inv.chars.filter((e) => e === char.id).length;

            if (flag === "my") {
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setImage(img)
                .setThumbnail(rarity(char.rarity))
                .setDescription(`**${char.name}**\n${splitTitle(char.anime)}\n\n **Level** ${charstats.lvl}ㅤ**Ref.** ${getRefinement(charstats.ref)}\n**Class**: ${cls}`)
                .addFields(
                    { name: 'HP ️️️💖', value: ""+charstats.hp, inline: true },
                    { name: 'ATK ️️⚔️', value: ""+charstats.atk, inline: true },
                    { name: 'DEF ️️️🛡️', value: ""+charstats.def, inline: true },
                )
                .setFooter(`You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of this\nID: #${char.id} | EP: ${charstats.ep}`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                return interaction.reply({ embeds: [Embed] });
            };

            if (flag === "detailed") {
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setThumbnail(img)
                .setDescription(`**${char.name}** - ${char.anime}\n**Level** ${charstats.lvl}ㅤ**Ref.** ${getRefinement(charstats.ref)}\n**Class**: ${cls}\n\n`)
                .addFields(
                    { name: 'Stats', value: `\\💖 **HP**: ${charstats.hp}\n\\⚔️ **ATK**: ${charstats.atk}\n\\🛡️ **DEF**: ${charstats.def}\n<:magic_dmg:948568336621527040> **Magic Dmg**: ${charstats.md}\n\\🔰 **Magic Resist**: ${charstats.mr}`, inline: true },
                    { name: '_ _', value: `\\🎯 **Crit Rate**: ${Math.floor(charstats.cr*100)}%\n\\💥 **Crit Damage**: ${charstats.cd*100}%\n\\🛡️ **Block Rate**: ${Math.floor(charstats.br*100)}%\n\\💨 **Dodge**: ${Math.floor(charstats.dodge*100)}%`, inline: true },
                    { name: '_ _', value: `\\💧 **Mana**: ${charstats.mana}\n\\💦 **Mana Gen**: +${charstats.mg}`, inline: true },
                )
                .setAuthor(user.username, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                .setFooter(`EP: ${charstats.ep}`)
                return interaction.reply({ embeds: [Embed] });
            };

        });

    },
};