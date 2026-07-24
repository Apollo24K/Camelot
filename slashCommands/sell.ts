import { ComponentType } from "discord.js";
import charInfo, { characters } from "../Modules/chars";
import { search } from "../Modules/functions";
import { OfferRow, shardEmoji } from "../Modules/components";
import { CharacterSchema, CompactUserSchema, SlashCommand } from "../types";
import { getCharacterSchemasOfUser, getUserSchema, sellCharacterCopies, updateUsersAndCache } from "../Modules/queries";

const rarPrice = { "VIP": 250_000, "EX": 25_000, "SS": 5_000, "S": 1_000, "A": 500, "B": 250, "C": 100, "D": 50 };

type SellCharacter = { char: charInfo; print?: number; };

function parsePrintChoice(choice: string) {
    const match = choice.trim().match(/^(.*?)`?\s*#\s*(\d+)`?$/);
    if (!match) return { name: choice.trim() };
    return { name: match[1].trim(), print: Number(match[2]) };
};

function resolveSellCharacter(choice: string, stats: CompactUserSchema, vipChars: CharacterSchema[], selected: SellCharacter[], interaction: Parameters<SlashCommand["execute"]>[0]["interaction"]): SellCharacter | undefined {
    const parsed = parsePrintChoice(choice);
    const char = search(choice, stats.chars, interaction, true);
    if (!char) return;

    if (char.rarity === "VIP") {
        if (parsed.print === undefined) return;
        if (vipChars.some((entry) => entry.charid === char.id && entry.print === parsed.print) && !selected.some((entry) => entry.char.id === char.id && entry.print === parsed.print)) {
            return { char, print: parsed.print };
        };
        return;
    };

    const alreadySelected = selected.filter((entry) => entry.char.id === char.id && entry.print === undefined).length;
    if (alreadySelected < stats.chars.filter((id) => id === char.id).length) return { char };
};

function getBulkVipCharacters(vipChars: CharacterSchema[], stats: CompactUserSchema, copiesToKeep: number): CharacterSchema[] {
    const grouped = new Map<number, CharacterSchema[]>();
    for (const entry of vipChars) {
        if (stats.charlock.includes(entry.charid) || stats.animelock.includes(characters[entry.charid].animeInfo.id)) continue;
        const entries = grouped.get(entry.charid) ?? [];
        entries.push(entry);
        grouped.set(entry.charid, entries);
    };
    return [...grouped.values()].flatMap((entries) => entries.sort((a, b) => a.print - b.print).slice(copiesToKeep));
};

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

            if (rarity === "VIP") {
                const vipChars = getBulkVipCharacters(await getCharacterSchemasOfUser(interaction.user.id), stats, copies);
                const price = vipChars.length * rarPrice.VIP;
                const ssShards = vipChars.length * 16;
                if (!vipChars.length) return interaction.reply(copies === 1 ? "You don't have any VIP duplicates." : `You don't have any VIP duplicates with more than ${copies} copies.`);

                return interaction.reply({ content: `Are you sure you want to sell ${vipChars.length} VIP card${vipChars.length === 1 ? "" : "s"} for **${price}**<:coins:872926669055356939>, ${shardEmoji.SS}**x${ssShards}**?`, components: [OfferRow] }).then((msg) => {
                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 15000 });
                    collector.on('collect', async (r) => {
                        collector.stop();
                        if (r.customId === "cancel") return interaction.channel?.isSendable() && interaction.channel.send("Action cancelled");

                        const currentStats = await getUserSchema(interaction.user.id);
                        if (!currentStats) return;
                        const currentVipChars = getBulkVipCharacters(await getCharacterSchemasOfUser(interaction.user.id), currentStats, copies);
                        const expectedPrints = vipChars.map((entry) => `${entry.charid}:${entry.print}`).sort().join(",");
                        const currentPrints = currentVipChars.map((entry) => `${entry.charid}:${entry.print}`).sort().join(",");
                        if (currentPrints !== expectedPrints) return interaction.channel?.isSendable() && interaction.channel.send("Your VIP inventory changed. Please try again.");

                        const sold = await sellCharacterCopies(interaction.user.id, [], currentVipChars, {
                            coins: price,
                            ssshard: ssShards,
                            sshard: 0,
                            ashard: 0,
                            bshard: 0,
                            cshard: 0,
                            dshard: 0,
                        });
                        if (!sold) return interaction.channel?.isSendable() && interaction.channel.send("Your VIP inventory changed. Please try again.");
                        interaction.client.userCache.delete(interaction.user.id);
                        if (interaction.channel?.isSendable()) interaction.channel.send(`**${price}**<:coins:872926669055356939>, ${shardEmoji.SS}**x${ssShards}** were added to your balance`);
                    });
                });
            };

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
            const vipChars = await getCharacterSchemasOfUser(interaction.user.id);

            let chars: SellCharacter[] = [], price = 0, shards = { "VIP": 0, "EX": 0, "SS": 0, "S": 0, "A": 0, "B": 0, "C": 0, "D": 0 };
            for (const c of choices) {
                const entry = resolveSellCharacter(c, stats, vipChars, chars, interaction);
                if (!entry) continue;
                const char = entry.char;

                if (stats.charlock.includes(char.id) || stats.animelock.includes(char.animeInfo.id)) return interaction.reply(`⚠️ You're trying to sell a locked character, please \`/unlock\` **${char.name}** first.`);

                chars.push(entry);
                price += rarPrice[char.rarity];
                shards[["VIP", "EX"].includes(char.rarity) ? "SS" : char.rarity] += 16;
            };

            if (chars.length === 0) return interaction.reply(`No match found`);
            if (chars.length > 40) return interaction.reply(`You can't sell more than 40 characters at once`);

            return interaction.reply({ content: `Are you sure you want to sell ${chars.map((e) => `**${e.char.name.slice(0, 20)}${e.print !== undefined ? `#${e.print}` : ""}**`).join(", ")} for **${price}**<:coins:872926669055356939>${shards.SS ? `, ${shardEmoji.SS}**x${shards.SS}**` : ""}${shards.S ? `, ${shardEmoji.S}**x${shards.S}**` : ""}${shards.A ? `, ${shardEmoji.A}**x${shards.A}**` : ""}${shards.B ? `, ${shardEmoji.B}**x${shards.B}**` : ""}${shards.C ? `, ${shardEmoji.C}**x${shards.C}**` : ""}${shards.D ? `, ${shardEmoji.D}**x${shards.D}**` : ""}?`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 30000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 30000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();
                    const _inv = await getUserSchema(interaction.user.id);
                    stats.chars = _inv?.chars ?? [];
                    const currentVipChars = await getCharacterSchemasOfUser(interaction.user.id);

                    let chars: SellCharacter[] = [], newPrice = 0;
                    for (const c of choices) {
                        const entry = resolveSellCharacter(c, stats, currentVipChars, chars, interaction);
                        if (!entry) continue;
                        const char = entry.char;

                        if (stats.charlock.includes(char.id) || stats.animelock.includes(char.animeInfo.id)) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`⚠️ You're trying to sell a locked character, please \`/unlock\` **${char.name}** first.`);
                            return;
                        };
                        chars.push(entry);
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

                    const normalCharacterIds = chars.filter((entry) => entry.print === undefined).map((entry) => entry.char.id);
                    const vipCharacters = chars.filter((entry): entry is SellCharacter & { print: number; } => entry.print !== undefined).map((entry) => ({ charid: entry.char.id, print: entry.print }));
                    const sold = await sellCharacterCopies(interaction.user.id, normalCharacterIds, vipCharacters, {
                        coins: price,
                        ssshard: shards.SS,
                        sshard: shards.S,
                        ashard: shards.A,
                        bshard: shards.B,
                        cshard: shards.C,
                        dshard: shards.D,
                    });
                    if (!sold) {
                        if (interaction.channel?.isSendable()) interaction.channel.send("Your character inventory changed. Please try again.");
                        return;
                    };
                    interaction.client.userCache.delete(interaction.user.id);

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
