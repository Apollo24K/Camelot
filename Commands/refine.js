const fs = require('fs');
const { EmbedBuilder, ComponentType } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { search, getDetailedStats } = require("../Modules/functions.js");
const { OfferRow } = require("../Modules/components.js");

module.exports = {
    name: 'refine',
	description: 'refine your characters',
	execute(interaction) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        
        let choice = interaction.options.getString('character');

        db.serialize(async () => {
            let inv = await query(`SELECT users.class, users.coins, users.ssshard, users.sshard, users.ashard, users.bshard, users.cshard, users.dshard, users.premium, characters.chars, characters.ref, characters.level, characters.equipment, characters.skin, dungeon.classlevels FROM characters JOIN dungeon ON characters.id = dungeon.id JOIN users ON characters.id = users.id WHERE characters.id = ${interaction.user.id}`);
            inv = {id: interaction.user.id, class: inv[0].class, coins: inv[0].coins, ssshard: inv[0].ssshard, sshard: inv[0].sshard, ashard: inv[0].ashard, bshard: inv[0].bshard, cshard: inv[0].cshard, dshard: inv[0].dshard, premium: inv[0].premium, chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref), level: JSON.parse(inv[0].level), equipment: JSON.parse(inv[0].equipment), skin: JSON.parse(inv[0].skin), classlevels: JSON.parse(inv[0].classlevels)};
            
            let char = search(choice, inv.chars, interaction);
            if (!char?.name) return;
            if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);

            let stats = await getDetailedStats(char.id, inv, inv.classlevels);
            if (stats.ref > 4) return interaction.reply(`**${char.name}** has already reached the max refinement level`);
            let stats2 = await getDetailedStats(char.id, inv, inv.classlevels, 0, true);

            let useShard = char.rarity === "EX" ? "ss" : char.rarity.toLowerCase();
            let shardStr;
            let price = 0;
            switch (char.rarity) {
                case "EX": 
                case "SS": shardStr = "<:ss_shard:917203009543503892>"; price = 3000; break;
                case "S": shardStr = "<:s_shard:917202925514817566>"; price = 1000; break;
                case "A": shardStr = "<:a_shard:917202904862052392>"; price = 500; break;
                case "B": shardStr = "<:b_shard:917202862851899392>"; price = 300; break;
                case "C": shardStr = "<:c_shard:917202862499582002>"; price = 250; break;
                case "D": shardStr = "<:d_shard:917202840563363891>"; price = 200; break;
                default: shardStr = "<:ss_shard:917203009543503892>"; price = 9999999; break;
            }

            if (inv[useShard+"shard"] < 16) return interaction.reply(`You don't have enough shards (**${inv[useShard+"shard"]}**/16${shardStr})`);
            if (inv.coins < price) return interaction.reply(`You don't have enough coins. You need ${price}`);

            // Thumbnail
            const thumbnail = char.getImage(inv.premium, customSettings[interaction.user.id]?.cimg[char.id], inv.skin[char.id]);
            
            const Embed = new EmbedBuilder()
            .setTitle(char.name.slice(0, 256))
            .setColor({D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff}[char.rarity])
            .setDescription(`Raising <:refinement:869132309125824552> for ${shardStr}**x16** and **${price}**<:coins:872926669055356939>`)
            .addFields(
                { name: 'HP ️️️💖', value: `${stats.hp} -> **${stats2.hp}**`, inline: true },
                { name: 'ATK ️️⚔️', value: `${stats.atk} -> **${stats2.atk}**`, inline: true },
                { name: 'DEF ️️️🛡️', value: `${stats.def} -> **${stats2.def}**`, inline: true },
            )
            .setThumbnail(thumbnail)
            .setFooter({text: `EP: ${stats.ep} -> ${stats2.ep}`})
            interaction.reply({ embeds: [Embed], components: [OfferRow], fetchReply: true }).then(msg => {
                
                const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 30000 });
                const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 30000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();
                    let invCheck = await query(`SELECT users.class, users.coins, users.ssshard, users.sshard, users.ashard, users.bshard, users.cshard, users.dshard, users.premium, characters.chars, characters.ref, characters.level, dungeon.classlevels FROM characters JOIN dungeon ON characters.id = dungeon.id JOIN users ON characters.id = users.id WHERE characters.id = ${interaction.user.id}`);
                    invCheck = {id: interaction.user.id, class: invCheck[0].class, coins: invCheck[0].coins, ssshard: invCheck[0].ssshard, sshard: invCheck[0].sshard, ashard: invCheck[0].ashard, bshard: invCheck[0].bshard, cshard: invCheck[0].cshard, dshard: invCheck[0].dshard, premium: invCheck[0].premium, chars: JSON.parse(invCheck[0].chars), ref: JSON.parse(invCheck[0].ref), level: JSON.parse(invCheck[0].level), classlevels: JSON.parse(invCheck[0].classlevels)};
                    
                    let tempStats = await getDetailedStats(char.id, invCheck, invCheck.classlevels);
                    if (tempStats.ref > 4) return interaction.channel.send(`**${char.name}** has already reached the max refinement level`);
                    if (invCheck[useShard+"shard"] < 16) return interaction.channel.send(`You don't have enough shards (**${invCheck[useShard+"shard"]}**/16${shardStr})`);
                    if (invCheck.coins < price) return interaction.channel.send(`You don't have enough coins (**${invCheck.coins}**/${price})`);

                    if (!inv.ref[char.id]) inv.ref[char.id] = 0;
                    inv.ref[char.id]++;

                    await query(`UPDATE users SET coins = coins - ${price}, ${useShard+"shard"} = ${useShard+"shard"} - 16 WHERE id = ${interaction.user.id}`);
                    await query(`UPDATE characters SET ref = '${JSON.stringify(inv.ref)}' WHERE id = ${interaction.user.id}`);
                    
                    interaction.channel.send(`Raised **${char.name}**'s refinement level successfully!`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    interaction.channel.send("Action cancelled");
                });

                confirm.on('end', () => {
                    interaction.editReply({ components: [] });
                });

            });
            
        });

    },
};