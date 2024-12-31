import { ComponentType } from "discord.js";
import { characters } from "../Modules/chars";
import { db, query } from "../db_handler";
import { search } from "../Modules/functions";
import { OfferRow, shardEmoji } from "../Modules/components";

const rarPrice = { "EX": 20000, "SS": 5000, "S": 1000, "A": 500, "B": 250, "C": 100, "D": 50 };

module.exports = {
    name: 'sell',
    description: 'sell characters',
    execute(interaction) {

        let subcommand = interaction.options.getSubcommand();

        db.serialize(async () => {
            const { 0: stats } = await query(`SELECT xp, animelock, charlock FROM users WHERE id = ${interaction.user.id}`);
            if (!stats) return interaction.reply("It seems you haven't started playing yet.");
            stats.animelock = JSON.parse(stats.animelock);
            stats.charlock = JSON.parse(stats.charlock);

            const { 0: inv } = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
            inv.chars = JSON.parse(inv.chars);
            if (!inv.chars.length) return interaction.reply("You don't have any characters.");

            // Command: /sell dupes 3 ss
            if (subcommand === "dupes" || subcommand === "all") {
                const rarity = interaction.options.getString('rarity');
                let copies = interaction.options.getInteger('copies');
                if (subcommand === "all") copies = 0;
                if (copies === null || copies < 0) copies = 1;

                let tinv, price = 0, shards = { "SS": 0, "S": 0, "A": 0, "B": 0, "C": 0, "D": 0 };
                if (rarity) tinv = inv.chars.filter((e) => characters[e].rarity === rarity);
                else tinv = inv.chars.filter((e) => characters[e].rarity !== "SS" && characters[e].rarity !== "EX");

                let uniq = [...new Set(tinv)];
                uniq.forEach((id) => {
                    const amount = tinv.reduce((acc, curr) => acc + (curr === id), 0);
                    if (amount > copies && !stats.charlock.includes(id) && !stats.animelock.includes(characters[id].animeInfo.id)) {
                        // Calculate price
                        price += rarPrice[characters[id].rarity] * (amount - copies);
                        shards[characters[id].rarity === "EX" ? "SS" : characters[id].rarity] += 16 * (amount - copies);
                    };
                });

                if (price === 0) return interaction.reply(copies === 1 ? "You don't have any duplicates." : `You don't have any duplicates with more than ${copies} copies.`);

                interaction.reply({ content: `Are you sure you want to sell ${rarity ? `all ${rarity} rank cards` : "all cards (SS/EX excluded)"} with more than ${copies === 1 ? "1 copy" : `${copies} copies`} for **${price}**<:coins:872926669055356939>${shards.SS ? `, ${shardEmoji.SS}**x${shards.SS}**` : ""}${shards.S ? `, ${shardEmoji.S}**x${shards.S}**` : ""}${shards.A ? `, ${shardEmoji.A}**x${shards.A}**` : ""}${shards.B ? `, ${shardEmoji.B}**x${shards.B}**` : ""}${shards.C ? `, ${shardEmoji.C}**x${shards.C}**` : ""}${shards.D ? `, ${shardEmoji.D}**x${shards.D}**` : ""}?${copies ? "" : "\n⚠️ This will sell all your specified characters and could hinder your progress. We recommend only selling duplicates. ⚠️"}`, components: [OfferRow], fetchReply: true }).then(msg => {

                    const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 15000 });
                    const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 15000 });

                    confirm.on('collect', async () => {
                        confirm.stop(), cancel.stop();
                        const { 0: _inv } = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
                        inv.chars = JSON.parse(_inv.chars);

                        if (rarity) tinv = inv.chars.filter((e) => characters[e].rarity === rarity);
                        else tinv = inv.chars.filter((e) => characters[e].rarity !== "SS" && characters[e].rarity !== "EX");

                        price = 0, shards = { "SS": 0, "S": 0, "A": 0, "B": 0, "C": 0, "D": 0 };
                        uniq = [...new Set(tinv)];
                        uniq.forEach((id) => {
                            const amount = tinv.reduce((acc, curr) => acc + (curr === id), 0);
                            if (amount > copies && !stats.charlock.includes(id) && !stats.animelock.includes(characters[id].animeInfo.id)) {
                                // Calculate price
                                price += rarPrice[characters[id].rarity] * (amount - copies);
                                shards[characters[id].rarity === "EX" ? "SS" : characters[id].rarity] += 16 * (amount - copies);

                                // Splice from inventory
                                for (let k = 0; k < (amount - copies); k++) {
                                    inv.chars.splice(inv.chars.indexOf(id), 1);
                                };
                            };
                        });

                        if (price === 0) return interaction.channel.send(copies === 1 ? "You don't have any duplicates." : `You don't have any duplicates with more than ${copies} copies.`);

                        await query(`UPDATE users SET coins = coins + ${price}, ssshard = ssshard + ${shards.SS}, sshard = sshard + ${shards.S}, ashard = ashard + ${shards.A}, bshard = bshard + ${shards.B}, cshard = cshard + ${shards.C}, dshard = dshard + ${shards.D} WHERE id = ${interaction.user.id}`);
                        await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}' WHERE id = ${interaction.user.id}`);

                        return interaction.channel.send(`**${price}**<:coins:872926669055356939>${shards.SS ? `, ${shardEmoji.SS}**x${shards.SS}**` : ""}${shards.S ? `, ${shardEmoji.S}**x${shards.S}**` : ""}${shards.A ? `, ${shardEmoji.A}**x${shards.A}**` : ""}${shards.B ? `, ${shardEmoji.B}**x${shards.B}**` : ""}${shards.C ? `, ${shardEmoji.C}**x${shards.C}**` : ""}${shards.D ? `, ${shardEmoji.D}**x${shards.D}**` : ""} were added to your balance`);
                    });

                    cancel.on('collect', () => {
                        confirm.stop(), cancel.stop();
                        interaction.channel.send("Action cancelled");
                    });

                });
                return;
            };

            if (subcommand === "characters") {
                const choices = (interaction.options.getString('characters') || "").split(",").map((e) => e.trim());

                let chars = [], price = 0, shards = { "SS": 0, "S": 0, "A": 0, "B": 0, "C": 0, "D": 0 };
                for (const c of choices) {
                    const char = search(c, inv.chars.slice(0, inv.chars.length - chars.length), interaction, true);
                    if (!char?.name) continue;

                    if (stats.charlock.includes(char.id) || stats.animelock.includes(char.animeInfo.id)) return interaction.reply(`⚠️ You're trying to sell a locked character, please \`/unlock\` **${char.name}** first.`);
                    if ((chars.filter((e) => e.id === char.id).length >= inv.chars.filter((e) => e === char.id).length)) return interaction.reply(`You don't have enough copies of **${char.name}** to sell`);

                    chars.push(char);
                    price += rarPrice[char.rarity];
                    shards[char.rarity === "EX" ? "SS" : char.rarity] += 16;
                };

                if (chars.length === 0) return interaction.reply(`No match found`);
                if (chars.length > 40) return interaction.reply(`You can't sell more than 40 characters at once`);

                return interaction.reply({ content: `Are you sure you want to sell ${chars.map((e) => `**${e.name.slice(0, 20)}**`).join(", ")} for **${price}**<:coins:872926669055356939>${shards.SS ? `, ${shardEmoji.SS}**x${shards.SS}**` : ""}${shards.S ? `, ${shardEmoji.S}**x${shards.S}**` : ""}${shards.A ? `, ${shardEmoji.A}**x${shards.A}**` : ""}${shards.B ? `, ${shardEmoji.B}**x${shards.B}**` : ""}${shards.C ? `, ${shardEmoji.C}**x${shards.C}**` : ""}${shards.D ? `, ${shardEmoji.D}**x${shards.D}**` : ""}?`, components: [OfferRow], fetchReply: true }).then(msg => {

                    const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 30000 });
                    const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 30000 });

                    confirm.on('collect', async () => {
                        confirm.stop(), cancel.stop();
                        const { 0: _inv } = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
                        inv.chars = JSON.parse(_inv.chars);

                        let chars = [], newPrice = 0;
                        for (const c of choices) {
                            const char = search(c, inv.chars.slice(0, inv.chars.length - chars.length), interaction, true);
                            if (!char?.name) continue;

                            if (stats.charlock.includes(char.id) || stats.animelock.includes(char.animeInfo.id)) return interaction.channel.send(`⚠️ You're trying to sell a locked character, please \`/unlock\` **${char.name}** first.`);
                            if ((chars.filter((e) => e.id === char.id).length >= inv.chars.filter((e) => e === char.id).length)) return interaction.channel.send(`You don't have enough copies of **${char.name}** to sell`);

                            chars.push(char);
                            newPrice += rarPrice[char.rarity];
                        };

                        if (chars.length === 0) return interaction.channel.send(`No match found`);
                        if (chars.length > 30) return interaction.channel.send(`You can't sell more than 30 characters at once`);
                        if (newPrice !== price) return interaction.channel.send(`An error occurred, please try again`);

                        for (const char of chars) {
                            inv.chars.splice(inv.chars.indexOf(char.id), 1);
                        };

                        await query(`UPDATE users SET coins = coins + ${price}, ssshard = ssshard + ${shards.SS}, sshard = sshard + ${shards.S}, ashard = ashard + ${shards.A}, bshard = bshard + ${shards.B}, cshard = cshard + ${shards.C}, dshard = dshard + ${shards.D} WHERE id = ${interaction.user.id}`);
                        await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}' WHERE id = ${interaction.user.id}`);

                        return interaction.channel.send(`**${price}**<:coins:872926669055356939>${shards.SS ? `, ${shardEmoji.SS}**x${shards.SS}**` : ""}${shards.S ? `, ${shardEmoji.S}**x${shards.S}**` : ""}${shards.A ? `, ${shardEmoji.A}**x${shards.A}**` : ""}${shards.B ? `, ${shardEmoji.B}**x${shards.B}**` : ""}${shards.C ? `, ${shardEmoji.C}**x${shards.C}**` : ""}${shards.D ? `, ${shardEmoji.D}**x${shards.D}**` : ""} were added to your balance`);
                    });

                    cancel.on('collect', () => {
                        confirm.stop(), cancel.stop();
                        interaction.channel.send("Action cancelled");
                    });

                });
            };

        });

    },
};
