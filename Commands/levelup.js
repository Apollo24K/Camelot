/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { achievements } = require("../Modules/achievements.js");
const { search, getDetailedStats } = require("../Modules/functions.js");

module.exports = {
    name: 'levelup',
	description: 'level your characters up',
	execute(interaction) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        
        let choice = interaction.options.getString('character');
        let up = interaction.options.getString('by') || "1";

        db.serialize(async () => {

            let inv = await query(`SELECT users.coins, users.premium, characters.chars, characters.ref, characters.level, characters.class, characters.equipment, dungeon.classlevels FROM characters JOIN dungeon ON characters.id = dungeon.id JOIN users ON characters.id = users.id WHERE characters.id = ${interaction.user.id}`);
            inv = {coins: inv[0].coins, premium: inv[0].premium, chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref), level: JSON.parse(inv[0].level), class: JSON.parse(inv[0].class), equipment: JSON.parse(inv[0].equipment), classlevels: JSON.parse(inv[0].classlevels)};

            let toMax = false;
            if (up.toLowerCase() === "max") {
                toMax = true;
            } else if (isNaN(up)) {
                up = 1;
            } else {
                up = parseInt(up);
            };

            let char = search(choice, inv.chars, interaction);
            if (!char?.name) return;
            if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);
            
            let stats = await getDetailedStats(char.id, inv, inv.classlevels);
            let currLvl = stats.lvl;

            if (toMax) {
                let iCoins = inv.coins;
                let lvup = 0;
                while (iCoins >= 0) {
                    iCoins -= 500 + 100*(currLvl-1+lvup++);
                };
                up = lvup-1;
                if (up === 0) return interaction.reply("You don't have enough coins");
            };

            let stats2 = await getDetailedStats(char.id, inv, inv.classlevels, up);

            let price = 0;
            for (let i=0; i < up; i++) {
                price += 500 + 100*(currLvl-1+i);
            };
            if (inv.coins < price) return interaction.reply(`You don't have enough coins (**${inv.coins}**/${price}<:coins:872926669055356939>)`);
            
            let thumbnail = char.image;
            if (inv.premium > 3) if (customSettings[interaction.user.id] && customSettings[interaction.user.id].cimg[char.id]) thumbnail = customSettings[interaction.user.id].cimg[char.id];

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('confirm')
                        .setEmoji('☑️')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('cancel')
                        .setEmoji('❎')
                        .setStyle('SECONDARY'),
                );

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setDescription(`**${char.name}**\nLevel up from ${currLvl} ➜ **${currLvl+up}** for **${price}**<:coins:872926669055356939>`)
            .addFields(
                { name: 'HP ️️️💖', value: `${stats.hp} ➜ **${stats2.hp}**`, inline: true },
                { name: 'ATK ️️⚔️', value: `${stats.atk} ➜ **${stats2.atk}**`, inline: true },
                { name: 'DEF ️️️🛡️', value: `${stats.def} ➜ **${stats2.def}**`, inline: true },
            )
            .setThumbnail(thumbnail)
            .setFooter(`EP: ${stats.ep} ➜ ${stats2.ep}`)
            interaction.reply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {
                
                const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 15000 });
                const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 15000 });

                confirm.on('collect', async r => {
                    let checkCoins = await query(`SELECT coins FROM users WHERE id = ${interaction.user.id}`);
                    inv.coins = checkCoins[0].coins;

                    if (inv.coins < price) return interaction.channel.send(`You don't have enough coins (**${inv.coins}**/${price}<:coins:872926669055356939>)`);

                    inv.level[char.id] = currLvl+up;

                    interaction.channel.send(`**${char.name}** reached level ${currLvl+up}!`);
                    confirm.stop(), cancel.stop();
                    
                    await query(`UPDATE users SET coins = coins - ${price} WHERE id = ${interaction.user.id}`);
                    await query(`UPDATE characters SET level = '${JSON.stringify(inv.level)}' WHERE id = ${interaction.user.id}`);
                    
                    // Achievements
                    achievements[42].check(interaction, interaction.user, currLvl+up), achievements[43].check(interaction, interaction.user, currLvl+up), achievements[44].check(interaction, interaction.user, currLvl+up), achievements[45].check(interaction, interaction.user, currLvl+up); // The Battle is to the Strongest
                });

                cancel.on('collect', async r => {
                    confirm.stop(), cancel.stop();
                    interaction.channel.send("Action cancelled");
                });

            });
            
        });

    },
};