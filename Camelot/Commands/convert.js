const { db, query } = require("../db_handler.js");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
    name: 'convert',
	description: 'Convert shards',
	execute(interaction) {
        
        db.serialize(async () => {
            var stats = await query(`SELECT ssshard, sshard, ashard, bshard, cshard, dshard FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];
            if (!stats) return interaction.reply("You don't have any shards");
            
            let from = interaction.options.getString('from');
            let to = interaction.options.getString('to');
            let amount = interaction.options.getString('amount');
            
            let arg = 1;
            if (amount) {
                if (!isNaN(amount)) arg = parseInt(amount);
                else if (amount.toLowerCase() == "max") arg = "max";
            };

            let values = {"d":1,"c":2,"b":3,"a":4,"s":5,"ss":6};
            let dif = values[to] - values[from];
            if (dif === 0) return interaction.reply("You can't convert the same type to itself");
            if (dif < 0) return interaction.reply("You can't convert shards to lower tiers");
            
            if (isNaN(arg)) arg = Math.floor(stats[from+"shard"] / Math.pow(4, dif));
            if (arg < 1) return interaction.reply(`You can't convert ${arg} shards.`);
            if (arg > 100000) return interaction.reply(`You can't convert more than 100000 shards at once.`);

            let sEmojis = {"d":"<:d_shard:917202840563363891>","c":"<:c_shard:917202862499582002>","b":"<:b_shard:917202862851899392>","a":"<:a_shard:917202904862052392>","s":"<:s_shard:917202925514817566>","ss":"<:ss_shard:917203009543503892>"};
            if (stats[from+"shard"] < Math.pow(4, dif) * arg) return interaction.reply(`You don't have enough ${from.toUpperCase()} shards (**${stats[from+"shard"]}**/${Math.pow(4, dif) * arg}${sEmojis[from]})`);

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

            // If he has enough shards:
            interaction.reply({content: `Are you sure you want to convert ${Math.pow(4, dif) * arg} ${sEmojis[from]} to ${arg} ${sEmojis[to]}?`, components: [row], fetchReply: true}).then(msg => {

                const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 15000 });
                const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 15000 });

                confirm.on('collect', async r => {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                    });

                    var stats = await query(`SELECT ssshard, sshard, ashard, bshard, cshard, dshard FROM users WHERE id = ${interaction.user.id}`);
                    stats = stats[0];

                    if (stats[from+"shard"] < Math.pow(4, dif) * arg) {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send(`You don't have enough ${from.toUpperCase()} shards (**${stats[from+"shard"]}**/${Math.pow(4, dif) * arg}${sEmojis[from]})`);
                    };

                    await query(`UPDATE users SET ${from+"shard"} = ${from+"shard"} - ${Math.pow(4, dif) * arg}, ${to+"shard"} = ${to+"shard"} + ${arg} WHERE id = ${interaction.user.id}`);
                    
                    interaction.channel.send(`Converted ${Math.pow(4, dif) * arg} ${sEmojis[from]} to ${arg} ${sEmojis[to]}`);
                    confirm.stop();
                    cancel.stop();
                });

                cancel.on('collect', async r => {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                    });
                    
                    confirm.stop(),cancel.stop();
                    interaction.channel.send("Action cancelled");
                });

            });
            
        });

    },
};