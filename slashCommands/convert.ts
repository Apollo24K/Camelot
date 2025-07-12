import { ComponentType } from "discord.js";
import { items } from "../Modules/items";
import { OfferRow } from "../Modules/components";
import { SlashCommand } from "../types";
import { getUserSchema, updateUsers } from "../Modules/queries";

const exportCommand: SlashCommand = {
    name: 'convert',
    async execute({ interaction, author }) {

        const stats = author.schema;

        const subcommand = interaction.options.getSubcommand();

        // Item info
        if (subcommand === "shards") {
            let from = interaction.options.getString('from', true) as "d" | "c" | "b" | "a" | "s" | "ss";
            let to = interaction.options.getString('to', true) as "d" | "c" | "b" | "a" | "s" | "ss";
            let amount = interaction.options.getString('amount') ?? "1";

            const fromName = from + "shard" as "dshard" | "cshard" | "bshard" | "ashard" | "sshard" | "ssshard";
            const toName = to + "shard" as "dshard" | "cshard" | "bshard" | "ashard" | "sshard" | "ssshard";

            const values = { "d": 1, "c": 2, "b": 3, "a": 4, "s": 5, "ss": 6 };
            const dif = values[to] - values[from];
            if (dif === 0) return interaction.reply("You can't convert the same type to itself");
            if (dif < 0) return interaction.reply("You can't convert shards to lower tiers");

            let arg = 1;
            if (amount) {
                if (!isNaN(parseInt(amount))) arg = parseInt(amount);
                else if (amount.toLowerCase() == "max") arg = Math.floor(stats[fromName] / Math.pow(4, dif));
            };

            if (arg < 1) return interaction.reply(`You can't convert ${arg} shards.`);
            if (arg > 1000000) return interaction.reply(`You can't convert more than 1000000 shards at once.`);

            let sEmojis = { "d": "<:d_shard:917202840563363891>", "c": "<:c_shard:917202862499582002>", "b": "<:b_shard:917202862851899392>", "a": "<:a_shard:917202904862052392>", "s": "<:s_shard:917202925514817566>", "ss": "<:ss_shard:917203009543503892>" };
            if (stats[fromName] < Math.pow(4, dif) * arg) return interaction.reply(`You don't have enough ${from.toUpperCase()} shards (**${stats[fromName]}**/${Math.pow(4, dif) * arg}${sEmojis[from]})`);

            // If the player has enough shards:
            return interaction.reply({ content: `Are you sure you want to convert ${Math.pow(4, dif) * arg} ${sEmojis[from]} to ${arg} ${sEmojis[to]}?`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 30000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 30000 });

                confirm.on('collect', async () => {
                    const stats = await getUserSchema(interaction.user.id);
                    if (!stats) return;

                    if (stats[fromName] < Math.pow(4, dif) * arg) {
                        confirm.stop(), cancel.stop();
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough ${from.toUpperCase()} shards (**${stats[fromName]}**/${Math.pow(4, dif) * arg}${sEmojis[from]})`);
                        return;
                    };

                    // Update users table
                    await updateUsers(interaction.user.id, {
                        [fromName]: { type: "increment", value: -Math.pow(4, dif) * arg },
                        [toName]: { type: "increment", value: arg }
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`Converted ${Math.pow(4, dif) * arg} ${sEmojis[from]} to ${arg} ${sEmojis[to]}`);
                    confirm.stop();
                    cancel.stop();
                });

                cancel.on('collect', async r => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });
            });

        } else if (subcommand === "scrolls") {

            const type = parseInt(interaction.options.getString('type', true));
            const from = parseInt(interaction.options.getString('from', true)) + type;
            const to = parseInt(interaction.options.getString('to', true)) + type;
            const amount = interaction.options.getString('amount') ?? "1";

            if (from === to) return interaction.reply("You can't convert the same type to itself");
            if (to < from) return interaction.reply("You can't convert levelup materials to lower tiers");

            const values = { "50": 1, "51": 1, "52": 2, "53": 2, "54": 3, "55": 3, "56": 4, "57": 4 };
            let dif = values[to as 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57] - values[from as 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57];
            let arg = 1;

            if (from > 1) {
                if (amount) {
                    if (!isNaN(parseInt(amount))) arg = parseInt(amount);
                    else if (amount.toLowerCase() === "max") arg = Math.floor((stats.items[from] || 0) / Math.pow(5, dif));
                    else return interaction.reply(`Please input a valid number.`);
                };

                if (arg < 1) return interaction.reply(`You can't convert ${arg} levelup materials.`);
                if (arg > 100000) return interaction.reply(`You can't convert more than 100000 levelup materials at once.`);

                if ((stats.items[from] || 0) < (Math.pow(5, dif) * arg)) return interaction.reply(`You don't have enough ${items[from].emoji} **__${items[from].name}__** (**${stats.items[from] || 0}**/${Math.pow(5, dif) * arg}${items[from].emoji})`);
            };

            // If the player has enough levelup materials:
            return interaction.reply({ content: `Are you sure you want to convert ${from < 2 ? "everything up to" : `${Math.pow(5, dif) * arg} ${items[from].emoji} to ${arg}`} ${items[to].emoji}?`, components: [OfferRow] }).then(msg => {

                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 30000 });

                collector.on('collect', async r => {
                    collector.stop();
                    if (r.customId === "cancel") {
                        if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                        return;
                    };

                    const stats = await getUserSchema(interaction.user.id);
                    if (!stats) return;

                    const newItems: { [key: number]: number; } = {};

                    if (from < 2) {
                        [50, 52, 54].forEach((e) => {
                            if (e + type < to) {
                                arg = Math.floor((stats.items[e + type] || 0) / 5);
                                newItems[e + type] = (newItems[e + type] || 0) - (5 * arg);
                                newItems[e + type + 2] = arg;
                            };
                        });
                    } else {
                        if ((stats.items[from] || 0) < (Math.pow(5, dif) * arg)) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough ${items[from].emoji} **__${items[from].name}__** (**${stats.items[from] || 0}**/${Math.pow(5, dif) * arg}${items[from].emoji})`);
                            return;
                        };

                        newItems[from] = -(Math.pow(5, dif) * arg);
                        newItems[to] = arg;
                    };

                    console.log(newItems);

                    // Update users table
                    await updateUsers(interaction.user.id, {
                        items: { type: "merge_json", value: newItems },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`Converted ${from < 2 ? "everything up to" : `${Math.pow(5, dif) * arg} ${items[from].emoji} to ${arg}`} ${items[to].emoji}`);
                });
            });
        } else if (subcommand === "jades") {
            const amountFlag = interaction.options.getString('amount') ?? "max";

            let amount = 1;
            if (amountFlag.toLowerCase() === "max") amount = stats.jades;
            else if (!isNaN(parseInt(amountFlag))) amount = parseInt(amountFlag);

            if (isNaN(amount)) interaction.reply(`Please input a valid number`);
            if (amount === 0) return interaction.reply(`You don't have any jades <:eternal_jade:1256124504141201428>`);
            if (amount < 1) return interaction.reply(`You can't convert **${amount}**<:eternal_jade:1256124504141201428>`);
            if (amount > 100000) return interaction.reply(`You can't convert more than **100000**<:eternal_jade:1256124504141201428> at once`);
            if (amount > stats.jades) return interaction.reply(`You don't have enough jades (**${stats.jades}**/${amount}<:eternal_jade:1256124504141201428>)`);

            return interaction.reply({ content: `Are you sure you want to convert **${amount}**<:eternal_jade:1256124504141201428> to **${amount}**<:genesis_gems:1034179687720681492>`, components: [OfferRow] }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 45000 });

                collector.on('collect', async r => {
                    collector.stop();
                    if (r.customId === "cancel") {
                        if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                        return;
                    };

                    const stats = await getUserSchema(interaction.user.id);
                    if (!stats) return;
                    if (amount > stats.jades) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough jades (**${stats.jades}**/${amount}<:eternal_jade:1256124504141201428>)`);
                        return;
                    };

                    // Update users table
                    await updateUsers(interaction.user.id, {
                        jades: { type: "increment", value: -amount },
                        gems: { type: "increment", value: amount }
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`Converted **${amount}**<:eternal_jade:1256124504141201428> to **${amount}**<:genesis_gems:1034179687720681492>`);
                });
            });
        };

    },
};

export default exportCommand;
