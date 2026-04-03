import { ComponentType } from "discord.js";
import { characters } from "../Modules/chars";
import { search } from "../Modules/functions";
import { OfferRow, shardEmoji } from "../Modules/components";
import { SlashCommand } from "../types";
import { getUserSchema, updateUsersAndCache } from "../Modules/queries";

const rarPrice = { "VIP": 250_000, "EX": 25_000, "SS": 5_000, "S": 1_000, "A": 500, "B": 250, "C": 100, "D": 50 };

const exportCommand: SlashCommand = {
    name: 'sell',
    async execute({ interaction, author }) {

        const subcommand = interaction.options.getSubcommand();

        const stats = author.schema;
        if (!stats) return interaction.reply("It seems you haven't started playing yet.");

        // Command: /sell dupes 3 ss
        if (subcommand === "dupes" || subcommand === "all") {
            const rarity = interaction.options.getString('rarity');
            let copies = interaction.options.getInteger('copies') ?? 1;
            if (subcommand === "all") copies = 0;
            if (copies < 0) copies = 1;

            let tinv: number[], price = 0, shards = { "VIP": 0, "EX": 0, "SS": 0, "S": 0, "A": 0, "B": 0, "C": 0, "D": 0 };
            if (rarity) tinv = stats.chars.filter((e) => characters[e].rarity === rarity);
            else tinv = stats.chars.filter((e) => characters[e].rarity !== "SS" && characters[e].rarity !== "EX" && characters[e].rarity !== "VIP");

            let uniq = [...new Set(tinv)];
            uniq.forEach((id) => {
                const amount = tinv.reduce((acc, curr) => acc + (curr === id ? 1 : 0), 0);
                if (amount > copies && !stats.charlock.includes(id) && !stats.animelock.includes(characters[id].animeInfo.id)) {
                    // Calculate price
                    price += rarPrice[characters[id].rarity] * (amount - copies);
                    shards[["VIP", "EX"].includes(characters[id].rarity) ? "SS" : characters[id].rarity] += 16 * (amount - copies);
                };
            });

            if (price === 0) return interaction.reply(copies === 1 ? "You don't have any duplicates." : `You don't have any duplicates with more than ${copies} copies.`);

            return interaction.reply({ content: `Are you sure you want to sell ${rarity ? `all ${rarity} rank cards` : "all cards (SS/EX excluded)"} with more than ${copies === 1 ? "1 copy" : `${copies} copies`} for **${price}**<:coins:872926669055356939>${shards.SS ? `, ${shardEmoji.SS}**x${shards.SS}**` : ""}${shards.S ? `, ${shardEmoji.S}**x${shards.S}**` : ""}${shards.A ? `, ${shardEmoji.A}**x${shards.A}**` : ""}${shards.B ? `, ${shardEmoji.B}**x${shards.B}**` : ""}${shards.C ? `, ${shardEmoji.C}**x${shards.C}**` : ""}${shards.D ? `, ${shardEmoji.D}**x${shards.D}**` : ""}?${copies ? "" : "\n⚠️ This will sell all your specified characters and could hinder your progress. We recommend only selling duplicates. ⚠️"}`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 15000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 15000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();
                    const _inv = await getUserSchema(interaction.user.id);
                    stats.chars = _inv?.chars ?? [];

                    if (rarity) tinv = stats.chars.filter((e) => characters[e].rarity === rarity);
                    else tinv = stats.chars.filter((e) => characters[e].rarity !== "SS" && characters[e].rarity !== "EX" && characters[e].rarity !== "VIP");

                    const finalChars: number[] = [];
                    price = 0, shards = { "VIP": 0, "EX": 0, "SS": 0, "S": 0, "A": 0, "B": 0, "C": 0, "D": 0 };
                    uniq = [...new Set(tinv)];
                    uniq.forEach((id) => {
                        const amount = tinv.reduce((acc, curr) => acc + (curr === id ? 1 : 0), 0);
                        if (amount > copies && !stats.charlock.includes(id) && !stats.animelock.includes(characters[id].animeInfo.id)) {
                            // Calculate price
                            price += rarPrice[characters[id].rarity] * (amount - copies);
                            shards[["VIP", "EX"].includes(characters[id].rarity) ? "SS" : characters[id].rarity] += 16 * (amount - copies);

                            // Splice from inventory
                            for (let k = 0; k < (amount - copies); k++) {
                                finalChars.push(id);
                            };
                        };
                    });

                    if (price === 0) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(copies === 1 ? "You don't have any duplicates." : `You don't have any duplicates with more than ${copies} copies.`);
                        return;
                    };

                    // Update users table
                    await updateUsersAndCache(interaction.client, interaction.user.id, {
                        updates: {
                            coins: { type: 'increment', value: price },
                            ssshard: { type: 'increment', value: shards.SS },
                            sshard: { type: 'increment', value: shards.S },
                            ashard: { type: 'increment', value: shards.A },
                            bshard: { type: 'increment', value: shards.B },
                            cshard: { type: 'increment', value: shards.C },
                            dshard: { type: 'increment', value: shards.D },
                            chars: { type: 'remove', value: finalChars },
                        },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`**${price}**<:coins:872926669055356939>${shards.SS ? `, ${shardEmoji.SS}**x${shards.SS}**` : ""}${shards.S ? `, ${shardEmoji.S}**x${shards.S}**` : ""}${shards.A ? `, ${shardEmoji.A}**x${shards.A}**` : ""}${shards.B ? `, ${shardEmoji.B}**x${shards.B}**` : ""}${shards.C ? `, ${shardEmoji.C}**x${shards.C}**` : ""}${shards.D ? `, ${shardEmoji.D}**x${shards.D}**` : ""} were added to your balance`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });

            });
        };

        if (subcommand === "characters") {
            const choices = (interaction.options.getString('characters') || "").split(",").map((e) => e.trim());

            let chars = [], price = 0, shards = { "VIP": 0, "EX": 0, "SS": 0, "S": 0, "A": 0, "B": 0, "C": 0, "D": 0 };
            for (const c of choices) {
                const char = search(c, stats.chars.slice(0, stats.chars.length - chars.length), interaction, true);
                if (!char?.name) continue;

                if (stats.charlock.includes(char.id) || stats.animelock.includes(char.animeInfo.id)) return interaction.reply(`⚠️ You're trying to sell a locked character, please \`/unlock\` **${char.name}** first.`);
                if ((chars.filter((e) => e.id === char.id).length >= stats.chars.filter((e) => e === char.id).length)) return interaction.reply(`You don't have enough copies of **${char.name}** to sell`);

                chars.push(char);
                price += rarPrice[char.rarity];
                shards[["VIP", "EX"].includes(char.rarity) ? "SS" : char.rarity] += 16;
            };

            if (chars.length === 0) return interaction.reply(`No match found`);
            if (chars.length > 40) return interaction.reply(`You can't sell more than 40 characters at once`);

            return interaction.reply({ content: `Are you sure you want to sell ${chars.map((e) => `**${e.name.slice(0, 20)}**`).join(", ")} for **${price}**<:coins:872926669055356939>${shards.SS ? `, ${shardEmoji.SS}**x${shards.SS}**` : ""}${shards.S ? `, ${shardEmoji.S}**x${shards.S}**` : ""}${shards.A ? `, ${shardEmoji.A}**x${shards.A}**` : ""}${shards.B ? `, ${shardEmoji.B}**x${shards.B}**` : ""}${shards.C ? `, ${shardEmoji.C}**x${shards.C}**` : ""}${shards.D ? `, ${shardEmoji.D}**x${shards.D}**` : ""}?`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 30000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 30000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();
                    const _inv = await getUserSchema(interaction.user.id);
                    stats.chars = _inv?.chars ?? [];

                    let chars = [], newPrice = 0;
                    for (const c of choices) {
                        const char = search(c, stats.chars.slice(0, stats.chars.length - chars.length), interaction, true);
                        if (!char?.name) continue;

                        if (stats.charlock.includes(char.id) || stats.animelock.includes(char.animeInfo.id)) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`⚠️ You're trying to sell a locked character, please \`/unlock\` **${char.name}** first.`);
                            return;
                        };
                        if ((chars.filter((e) => e.id === char.id).length >= stats.chars.filter((e) => e === char.id).length)) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough copies of **${char.name}** to sell`);
                            return;
                        };

                        chars.push(char);
                        newPrice += rarPrice[char.rarity];
                    };

                    if (chars.length === 0) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`No match found`);
                        return;
                    };
                    if (chars.length > 30) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You can't sell more than 30 characters at once`);
                        return;
                    };
                    if (newPrice !== price) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`An error occurred, please try again`);
                        return;
                    };

                    for (const char of chars) {
                        stats.chars.splice(stats.chars.indexOf(char.id), 1);
                    };

                    // Update users table
                    await updateUsersAndCache(interaction.client, interaction.user.id, {
                        updates: {
                            coins: { type: 'increment', value: price },
                            ssshard: { type: 'increment', value: shards.SS },
                            sshard: { type: 'increment', value: shards.S },
                            ashard: { type: 'increment', value: shards.A },
                            bshard: { type: 'increment', value: shards.B },
                            cshard: { type: 'increment', value: shards.C },
                            dshard: { type: 'increment', value: shards.D },
                            chars: { type: 'remove', value: chars.map((e) => e.id) },
                        },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`**${price}**<:coins:872926669055356939>${shards.SS ? `, ${shardEmoji.SS}**x${shards.SS}**` : ""}${shards.S ? `, ${shardEmoji.S}**x${shards.S}**` : ""}${shards.A ? `, ${shardEmoji.A}**x${shards.A}**` : ""}${shards.B ? `, ${shardEmoji.B}**x${shards.B}**` : ""}${shards.C ? `, ${shardEmoji.C}**x${shards.C}**` : ""}${shards.D ? `, ${shardEmoji.D}**x${shards.D}**` : ""} were added to your balance`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });

            });
        };
    },
};

export default exportCommand;
