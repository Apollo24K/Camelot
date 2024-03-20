/* eslint-disable no-unused-vars */
const { db, query } = require("../db_handler.js");
const { ComponentType } = require("discord.js");
const { items } = require("../Modules/items.js");
const { OfferRow } = require("../Modules/components.js");

module.exports = {
    name: 'convert',
    description: 'Convert shards',
    execute(interaction) {

        let subcommand = interaction.options.getSubcommand();

        // Item info
        if (subcommand === "shards") {

            let from = interaction.options.getString('from');
            let to = interaction.options.getString('to');
            let amount = interaction.options.getString('amount');

            db.serialize(async () => {
                let stats = await query(`SELECT ssshard, sshard, ashard, bshard, cshard, dshard FROM users WHERE id = ${interaction.user.id}`);
                stats = stats[0];
                if (!stats) return interaction.reply("You don't have any shards");

                let arg = 1;
                if (amount) {
                    if (!isNaN(amount)) arg = parseInt(amount);
                    else if (amount.toLowerCase() == "max") arg = "max";
                };

                let values = { "d": 1, "c": 2, "b": 3, "a": 4, "s": 5, "ss": 6 };
                let dif = values[to] - values[from];
                if (dif === 0) return interaction.reply("You can't convert the same type to itself");
                if (dif < 0) return interaction.reply("You can't convert shards to lower tiers");

                if (isNaN(arg)) arg = Math.floor(stats[from + "shard"] / Math.pow(4, dif));
                if (arg < 1) return interaction.reply(`You can't convert ${arg} shards.`);
                if (arg > 100000) return interaction.reply(`You can't convert more than 100000 shards at once.`);

                let sEmojis = { "d": "<:d_shard:917202840563363891>", "c": "<:c_shard:917202862499582002>", "b": "<:b_shard:917202862851899392>", "a": "<:a_shard:917202904862052392>", "s": "<:s_shard:917202925514817566>", "ss": "<:ss_shard:917203009543503892>" };
                if (stats[from + "shard"] < Math.pow(4, dif) * arg) return interaction.reply(`You don't have enough ${from.toUpperCase()} shards (**${stats[from + "shard"]}**/${Math.pow(4, dif) * arg}${sEmojis[from]})`);

                // If the player has enough shards:
                return interaction.reply({ content: `Are you sure you want to convert ${Math.pow(4, dif) * arg} ${sEmojis[from]} to ${arg} ${sEmojis[to]}?`, components: [OfferRow], fetchReply: true }).then(msg => {

                    const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 30000 });
                    const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 30000 });

                    confirm.on('collect', async r => {
                        let stats = await query(`SELECT ssshard, sshard, ashard, bshard, cshard, dshard FROM users WHERE id = ${interaction.user.id}`);
                        stats = stats[0];

                        if (stats[from + "shard"] < Math.pow(4, dif) * arg) {
                            confirm.stop(), cancel.stop();
                            return interaction.channel.send(`You don't have enough ${from.toUpperCase()} shards (**${stats[from + "shard"]}**/${Math.pow(4, dif) * arg}${sEmojis[from]})`);
                        }

                        await query(`UPDATE users SET ${from + "shard"} = ${from + "shard"} - ${Math.pow(4, dif) * arg}, ${to + "shard"} = ${to + "shard"} + ${arg} WHERE id = ${interaction.user.id}`);

                        interaction.channel.send(`Converted ${Math.pow(4, dif) * arg} ${sEmojis[from]} to ${arg} ${sEmojis[to]}`);
                        confirm.stop();
                        cancel.stop();
                    });

                    cancel.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        interaction.channel.send("Action cancelled");
                    });

                });

            });
        } else if (subcommand === "scrolls") {

            const type = parseInt(interaction.options.getString('type'));
            const from = parseInt(interaction.options.getString('from')) + type;
            const to = parseInt(interaction.options.getString('to')) + type;
            const amount = interaction.options.getString('amount');

            if (from === to) return interaction.reply("You can't convert the same type to itself");
            if (to < from) return interaction.reply("You can't convert levelup materials to lower tiers");

            db.serialize(async () => {
                const { 0: stats } = await query(`SELECT items FROM users WHERE id = ${interaction.user.id}`);
                stats.items = JSON.parse(stats.items);

                const values = { "50": 1, "51": 1, "52": 2, "53": 2, "54": 3, "55": 3, "56": 4, "57": 4 };
                let dif = values[to] - values[from];
                let arg = 1;

                if (from > 1) {
                    if (amount) {
                        if (!isNaN(amount)) arg = parseInt(amount);
                        else if (amount.toLowerCase() === "max") arg = "max";
                        else return interaction.reply(`Please input a valid number.`);
                    };

                    if (arg === "max") arg = Math.floor((stats.items[from] || 0) / Math.pow(5, dif));
                    if (arg < 1) return interaction.reply(`You can't convert ${arg} levelup materials.`);
                    if (arg > 100000) return interaction.reply(`You can't convert more than 100000 levelup materials at once.`);

                    if ((stats.items[from] || 0) < (Math.pow(5, dif) * arg)) return interaction.reply(`You don't have enough ${items[from].emoji} **__${items[from].name}__** (**${stats.items[from] || 0}**/${Math.pow(5, dif) * arg}${items[from].emoji})`);
                };

                // If the player has enough levelup materials:
                return interaction.reply({ content: `Are you sure you want to convert ${from < 2 ? "everything up to" : `${Math.pow(5, dif) * arg} ${items[from].emoji} to ${arg}`} ${items[to].emoji}?`, components: [OfferRow], fetchReply: true }).then(msg => {

                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 30000 });

                    collector.on('collect', async r => {
                        collector.stop();
                        if (r.customId === "cancel") return interaction.channel.send("Action cancelled");

                        const { 0: stats } = await query(`SELECT items FROM users WHERE id = ${interaction.user.id}`);
                        stats.items = JSON.parse(stats.items);

                        if (from < 2) {
                            [50, 52, 54].forEach((e) => {
                                if (e + type < to) {
                                    arg = Math.floor((stats.items[e + type] || 0) / 5);
                                    stats.items[e + type] -= (5 * arg);
                                    stats.items[e + type + 2] = (stats.items[e + type + 2] + arg) || arg;
                                };
                            });
                        } else {
                            if ((stats.items[from] || 0) < (Math.pow(5, dif) * arg)) return interaction.channel.send(`You don't have enough ${items[from].emoji} **__${items[from].name}__** (**${stats.items[from] || 0}**/${Math.pow(5, dif) * arg}${items[from].emoji})`);

                            stats.items[from] -= (Math.pow(5, dif) * arg);
                            stats.items[to] = (stats.items[to] + arg) || arg;
                        };

                        await query(`UPDATE users SET items = '${JSON.stringify(stats.items)}' WHERE id = ${interaction.user.id}`);

                        interaction.channel.send(`Converted ${from < 2 ? "everything up to" : `${Math.pow(5, dif) * arg} ${items[from].emoji} to ${arg}`} ${items[to].emoji}`);
                    });

                });

            });
        };


    },
};