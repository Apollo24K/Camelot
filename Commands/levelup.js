const fs = require('fs');
const { EmbedBuilder, ComponentType } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { achievements } = require("../Modules/achievements.js");
const { search, getDetailedStats } = require("../Modules/functions.js");
const { OfferRow } = require("../Modules/components.js");

module.exports = {
    name: 'levelup',
	description: 'level your characters up',
	execute(interaction) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        
        const choice = interaction.options.getString('character');
        let up = interaction.options.getString('by') || "1";

        db.serialize(async () => {

            let inv = await query(`SELECT users.coins, users.premium, users.class, characters.chars, characters.ref, characters.level, characters.equipment, characters.skin, dungeon.classlevels FROM characters JOIN dungeon ON characters.id = dungeon.id JOIN users ON characters.id = users.id WHERE characters.id = ${interaction.user.id}`);
            inv = {id: interaction.user.id, coins: inv[0].coins, premium: inv[0].premium, class: inv[0].class, chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref), level: JSON.parse(inv[0].level), equipment: JSON.parse(inv[0].equipment), skin: JSON.parse(inv[0].skin), classlevels: JSON.parse(inv[0].classlevels)};

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
            
            // Thumbnail
            const thumbnail = char.getImage(inv.premium, customSettings[interaction.user.id]?.cimg[char.id], inv.skin[char.id]);
            
            const Embed = new EmbedBuilder()
            .setColor({D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff}[char.rarity])
            .setDescription(`**${char.name}**\nLevel up from ${currLvl} ➜ **${currLvl+up}** for **${price}**<:coins:872926669055356939>`)
            .addFields(
                { name: 'HP ️️️💖', value: `${stats.hp} ➜ **${stats2.hp}**`, inline: true },
                { name: 'ATK ️️⚔️', value: `${stats.atk} ➜ **${stats2.atk}**`, inline: true },
                { name: 'DEF ️️️🛡️', value: `${stats.def} ➜ **${stats2.def}**`, inline: true },
            )
            .setThumbnail(thumbnail)
            .setFooter({text: `EP: ${stats.ep} ➜ ${stats2.ep}`})
            return interaction.reply({ embeds: [Embed], components: [OfferRow], fetchReply: true }).then(msg => {
                const collector = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 30000 });

                collector.on('collect', async r => {
                    collector.stop();
                    if (r.customId === "cancel") interaction.channel.send("Action cancelled");

                    inv = await query(`SELECT users.coins, users.premium, users.class, characters.chars, characters.ref, characters.level, characters.equipment, dungeon.classlevels FROM characters JOIN dungeon ON characters.id = dungeon.id JOIN users ON characters.id = users.id WHERE characters.id = ${interaction.user.id}`);
                    inv = {id: interaction.user.id, coins: inv[0].coins, premium: inv[0].premium, class: inv[0].class, chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref), level: JSON.parse(inv[0].level), equipment: JSON.parse(inv[0].equipment), classlevels: JSON.parse(inv[0].classlevels)};

                    if (inv.coins < price) return interaction.channel.send(`You don't have enough coins (**${inv.coins}**/${price}<:coins:872926669055356939>)`);

                    stats = await getDetailedStats(char.id, inv, inv.classlevels);
                    if (currLvl !== stats.lvl) return interaction.channel.send(`You have already leveled up your character.`);

                    inv.level[char.id] = currLvl+up;

                    interaction.channel.send(`**${char.name}** reached level ${currLvl+up}!`);
                    
                    await query(`UPDATE users SET coins = coins - ${price} WHERE id = ${interaction.user.id}`);
                    await query(`UPDATE characters SET level = '${JSON.stringify(inv.level)}' WHERE id = ${interaction.user.id}`);
                    
                    // Achievements
                    achievements[42].check(interaction, interaction.user, currLvl+up), achievements[43].check(interaction, interaction.user, currLvl+up), achievements[44].check(interaction, interaction.user, currLvl+up), achievements[45].check(interaction, interaction.user, currLvl+up); // The Battle is to the Strongest
                });

                collector.on('end', () => {
                    interaction.editReply({ components: [] });
                });

            });
        });

    },
};