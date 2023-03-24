/* eslint-disable no-unused-vars */
var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { search, getDetailedStats } = require("../Modules/functions.js");

module.exports = {
    name: 'refine',
	description: 'refine your characters',
	execute(interaction) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        
        let choice = interaction.options.getString('character');

        db.serialize(async () => {
            let inv = await query(`SELECT users.coins, users.ssshard, users.sshard, users.ashard, users.bshard, users.cshard, users.dshard, users.premium, characters.chars, characters.ref, characters.level, characters.class, characters.equipment, dungeon.classlevels FROM characters JOIN dungeon ON characters.id = dungeon.id JOIN users ON characters.id = users.id WHERE characters.id = ${interaction.user.id}`);
            inv = {coins: inv[0].coins, ssshard: inv[0].ssshard, sshard: inv[0].sshard, ashard: inv[0].ashard, bshard: inv[0].bshard, cshard: inv[0].cshard, dshard: inv[0].dshard, premium: inv[0].premium, chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref), level: JSON.parse(inv[0].level), class: JSON.parse(inv[0].class), equipment: JSON.parse(inv[0].equipment), classlevels: JSON.parse(inv[0].classlevels)};
            
            let char = search(choice, inv.chars, interaction);
            if (!char?.name) return;
            if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);

            let stats = await getDetailedStats(char.id, inv, inv.classlevels);
            if (stats.ref > 4) return interaction.reply(`**${char.name}** has already reached the max refinement level`);
            let stats2 = await getDetailedStats(char.id, inv, inv.classlevels, 0, true);

            let useShard = char.rarity.toLowerCase();
            let shardStr;
            let price = 0;
            switch (char.rarity) {
                case "SS" : shardStr = "<:ss_shard:917203009543503892>"; price = 3000; break;
                case "S" : shardStr = "<:s_shard:917202925514817566>"; price = 1000; break;
                case "A" : shardStr = "<:a_shard:917202904862052392>"; price = 500; break;
                case "B" : shardStr = "<:b_shard:917202862851899392>"; price = 300; break;
                case "C" : shardStr = "<:c_shard:917202862499582002>"; price = 250; break;
                case "D" : shardStr = "<:d_shard:917202840563363891>"; price = 200; break;
                default : shardStr = "<:ss_shard:917203009543503892>"; price = 9999999; break;
            }

            if (inv[useShard+"shard"] < 16) return interaction.reply(`You don't have enough shards (**${inv[useShard+"shard"]}**/16${shardStr})`);
            if (inv.coins < price) return interaction.reply(`You don't have enough coins. You need ${price}`);

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
            .setTitle(char.name.slice(0, 256))
            .setColor(0xbbffff)
            .setDescription(`Raising <:refinement:869132309125824552> for ${shardStr}**x16** and **${price}**<:coins:872926669055356939>`)
            .addFields(
                { name: 'HP ️️️💖', value: `${stats.hp} -> **${stats2.hp}**`, inline: true },
                { name: 'ATK ️️⚔️', value: `${stats.atk} -> **${stats2.atk}**`, inline: true },
                { name: 'DEF ️️️🛡️', value: `${stats.def} -> **${stats2.def}**`, inline: true },
            )
            .setThumbnail(thumbnail)
            .setFooter(`EP: ${stats.ep} -> ${stats2.ep}`)
            interaction.reply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {
                
                const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 15000 });
                const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 15000 });

                confirm.on('collect', async r => {
                    let invCheck = await query(`SELECT users.coins, users.ssshard, users.sshard, users.ashard, users.bshard, users.cshard, users.dshard, users.premium, characters.chars, characters.ref, characters.level, characters.class, dungeon.classlevels FROM characters JOIN dungeon ON characters.id = dungeon.id JOIN users ON characters.id = users.id WHERE characters.id = ${interaction.user.id}`);
                    invCheck = {coins: invCheck[0].coins, ssshard: invCheck[0].ssshard, sshard: invCheck[0].sshard, ashard: invCheck[0].ashard, bshard: invCheck[0].bshard, cshard: invCheck[0].cshard, dshard: invCheck[0].dshard, premium: invCheck[0].premium, chars: JSON.parse(invCheck[0].chars), ref: JSON.parse(invCheck[0].ref), level: JSON.parse(invCheck[0].level), class: JSON.parse(invCheck[0].class), classlevels: JSON.parse(invCheck[0].classlevels)};
        
                    let tempStats = await getDetailedStats(char.id, invCheck, invCheck.classlevels);
                    if (tempStats.ref > 4) {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send(`**${char.name}** has already reached the max refinement level`);
                    }
                    if (invCheck[useShard+"shard"] < 16) {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send(`You don't have enough shards (**${invCheck[useShard+"shard"]}**/16${shardStr})`);
                    }
                    if (invCheck.coins < price) {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send(`You don't have enough coins (**${invCheck.coins}**/${price})`);
                    }

                    if (!inv.ref[char.id]) inv.ref[char.id] = 0;
                    inv.ref[char.id]++;

                    interaction.channel.send(`Raised **${char.name}**'s refinement level successfully!`);
                    confirm.stop(), cancel.stop();

                    await query(`UPDATE users SET coins = coins - ${price}, ${useShard+"shard"} = ${useShard+"shard"} - 16 WHERE id = ${interaction.user.id}`);
                    await query(`UPDATE characters SET ref = '${JSON.stringify(inv.ref)}' WHERE id = ${interaction.user.id}`);
                });

                cancel.on('collect', async r => {
                    confirm.stop(), cancel.stop();
                    interaction.channel.send("Action cancelled");
                });

            });
            
        });

    },
};