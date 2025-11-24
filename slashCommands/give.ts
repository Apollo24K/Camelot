import fs from 'fs';
import { EmbedBuilder, ComponentType } from "discord.js";
import { achievements } from "../Modules/achievements";
import charInfo, { characters } from "../Modules/chars";
import { userLevel, search, formatNumberWithQuotes } from "../Modules/functions";
import { OfferRow } from "../Modules/components";
import { SlashCommand } from '../types';
import { getUserSchema, insertNewTrade, updateUsersAndCache } from '../Modules/queries';

const exportCommand: SlashCommand = {
    name: 'give',
    async execute({ interaction, author }) {

        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user', true);
        if (user.bot) return interaction.reply("You can't send stuff to bots");
        if (user.id === interaction.user.id) return interaction.reply("no <:yogurtKek:794982064553328660>");

        const _stats = await getUserSchema(user.id);
        if (!_stats) return interaction.reply(`**${user.username}** hasn't started playing yet.`);

        // Give coins
        if (subcommand === "coins") {
            const amount = interaction.options.getInteger('amount', true);

            if (userLevel(author.schema.xp) < 25) return interaction.reply(`You must be level 25 or higher to give coins`);

            if (author.schema.coins < amount) return interaction.reply(`You dont have that much coins (your balance: **${author.schema.coins}**<:coins:872926669055356939>)`);
            if (amount < 1) return interaction.reply(`${formatNumberWithQuotes(amount)} coins? <:ConfusedSmug:868988282250346558>`);
            if (amount > 10000000) return interaction.reply(`You can't send more than 10'000'000<:coins:872926669055356939> at once.`);

            return interaction.reply({ content: `Are you sure you want to give **${user.username}** **${formatNumberWithQuotes(amount)}**<:coins:872926669055356939>?${userLevel(_stats.xp) < 25 ? `\n⚠️ **${user.username}** is below level 25 and won't be able to use \`/give\` commands until then.` : ""}`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 15000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 15000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();

                    const stats = await getUserSchema(interaction.user.id);
                    if (!stats) return;
                    if (stats.coins < amount) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You dont have that much coins (your balance: **${formatNumberWithQuotes(stats.coins)}**<:coins:872926669055356939>)`);
                        return;
                    };

                    await updateUsersAndCache(interaction.client, interaction.user.id, {
                        updates: {
                            coins: { type: 'increment', value: -amount },
                        },
                    });
                    await updateUsersAndCache(interaction.client, user.id, {
                        updates: {
                            coins: { type: 'increment', value: amount },
                        },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`${interaction.user.toString()} has sent **${formatNumberWithQuotes(amount)}**<:coins:872926669055356939> to ${user.toString()}`);

                    // Trade Log
                    await insertNewTrade(interaction.user.id, user.id, "coins", amount);
                    const chnl = interaction.client.channels.cache.find(channel => channel.id === "1042922243933622362");
                    const Embed = new EmbedBuilder()
                        .setColor(0xbbffff)
                        .setDescription(`${interaction.user.tag} sent **${formatNumberWithQuotes(amount)}**<:coins:872926669055356939> to **${user.tag}**\n${interaction.user.toString()} ➜ ${interaction.user.id}\n${user.toString()} ➜ ${user.id}`);
                    if (chnl?.isSendable()) chnl.send({ embeds: [Embed] });
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });

            });
        };

        // Give characters
        if (subcommand === "characters") {
            if (userLevel(author.schema.xp) < 25) return interaction.reply(`You must be level 25 or higher to give characters`);

            const choice = [...new Set((interaction.options.getString('characters') || "").split(",").map((e) => e.trim()))];

            const stats = author.schema;

            let hasLockedCharacters = false;
            const chars: charInfo[] = [];
            for (const c of choice) {
                const char = search(c, stats.chars, interaction, true);
                if (!char) continue;
                if (stats.charlock.includes(char.id) || stats.animelock.includes(char.animeInfo.id)) hasLockedCharacters = true;
                if (stats.chars.includes(char.id) && !chars.includes(char) && !stats.charlock.includes(char.id) && !stats.animelock.includes(char.animeInfo.id)) chars.push(char);
            };

            if (chars.length === 0) return interaction.reply(hasLockedCharacters ? "⚠️ You're trying to give locked characters, please unlock them first." : `No match found`);
            if (chars.length > 200) return interaction.reply(`You can't give more than 200 chars at once`);

            return interaction.reply({ content: `Are you sure you want to give **${chars.map((c) => c.name.slice(0, 20)).join(", ").length > 1800 ? (chars.map((c) => c.name.slice(0, 20)).join(", ") + " __+ more__") : chars.map((c) => c.name.slice(0, 20)).join(", ")}** to **${user.username}**?${hasLockedCharacters ? "\n⚠️ You're trying to give locked characters, please unlock them first." : ""}${userLevel(_stats.xp) < 25 ? `\n⚠️ **${user.username}** is below level 25 and won't be able to use \`/give\` commands until then.` : ""}`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 15000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 15000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();

                    const stats = await getUserSchema(interaction.user.id);
                    if (!stats) return;

                    const chars: charInfo[] = [];
                    for (const c of choice) {
                        const char = search(c, stats.chars, interaction, true);
                        if (!char) continue;
                        if (stats.chars.includes(char.id) && !chars.includes(char) && !stats.charlock.includes(char.id) && !stats.animelock.includes(char.animeInfo.id)) chars.push(char);
                    };

                    if (chars.length === 0) return interaction.reply(hasLockedCharacters ? "⚠️ You've tried giving locked characters, please unlock them first." : `No match found`);
                    if (chars.length > 200) return interaction.reply(`You can't give more than 200 chars at once`);

                    // Achievements
                    achievements[30].check(interaction, interaction.user, chars.some((e) => e.rarity === "S")), achievements[31].check(interaction, interaction.user, chars.some((e) => e.rarity === "SS")); // Shared Happiness
                    achievements[32].check(interaction, interaction.user, chars.some((e) => stats.chars[stats.chars.length - 1] === e.id && e.rarity === "SS")); // Shared Happiness

                    for (const char of chars) {
                        // Log Trades
                        if (char.rarity === "SS" || char.rarity === "EX") {
                            await insertNewTrade(interaction.user.id, user.id, "char", char.id);
                        };
                    };

                    // Update users table
                    await updateUsersAndCache(interaction.client, interaction.user.id, {
                        updates: {
                            chars: { type: 'remove', value: chars.map((e) => e.id) },
                        },
                    });
                    await updateUsersAndCache(interaction.client, user.id, {
                        updates: {
                            chars: { type: 'append', value: chars.map((e) => e.id) },
                        },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`**${chars.map((c) => c.name.slice(0, 20)).join(", ").length > 1800 ? (chars.map((c) => c.name.slice(0, 20)).join(", ") + " __+ more__") : chars.map((c) => c.name.slice(0, 20)).join(", ")}** ${chars.length === 1 ? "was" : "were"} gifted to **${user.toString()}**`);

                    // Achievements
                    achievements[1].check(interaction, user), achievements[2].check(interaction, user), achievements[3].check(interaction, user); // Collector
                    achievements[19].check(interaction, user), achievements[20].check(interaction, user), achievements[21].check(interaction, user), achievements[22].check(interaction, user), achievements[23].check(interaction, user); // Diligent

                    // Trade Log
                    const chnl = interaction.client.channels.cache.find(channel => channel.id === "1042922243933622362");
                    const Embed = new EmbedBuilder()
                        .setColor(0xbbffff)
                        .setDescription(`${interaction.user.tag} sent ${chars.map((char) => `**${characters[char.id].rarity}** **${characters[char.id].name.slice(0, 18)}**`).join(", ")} to **${user.tag}**\n${interaction.user.toString()} ➜ ${interaction.user.id}\n${user.toString()} ➜ ${user.id}`);
                    if (chnl?.isSendable()) chnl.send({ embeds: [Embed] });
                });

                cancel.on('collect', async () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });

            });
        };

        // Give premium
        if (subcommand === "premium") {
            const tier = interaction.options.getInteger('tier', true);

            const premiumGift = JSON.parse(fs.readFileSync('Storage/premiumGift.json', 'utf8'));
            const premiumGifted = JSON.parse(fs.readFileSync('Storage/premiumGifted.json', 'utf8'));

            if (user.id === interaction.user.id) return interaction.reply("You can't give yourself premium <:Heh:869656740667469864>");

            const stats2 = await getUserSchema(user.id);
            if (!stats2) return interaction.reply(`**${user.username}** hasn't started playing the game yet.`);

            const stats = [author.schema, stats2];

            // If the gifter has no T3+ and isn't Apollo return
            if (stats[0].premium < 3 && interaction.user.id !== "489490486734880774") return interaction.reply("You need to have at least T3 Premium to gift others premium. See our `/patreon` for more information.");
            if (!premiumGifted[interaction.user.id]) premiumGifted[interaction.user.id] = 0;
            let giftLimit = 0;
            let giftTier = 1;

            switch (stats[0].premium) {
                case 3: giftLimit = 1; break;
                case 4: giftLimit = 3; break;
                case 5: giftLimit = 3; break;
                case 6: giftLimit = 4; break;
                case 7: giftLimit = 2, giftTier = 2; break;
                default: false; break;
            };
            if (interaction.user.id === "489490486734880774") giftLimit = 999999;
            if (tier !== giftTier && interaction.user.id !== "489490486734880774") return interaction.reply(`You can't gift **T${tier}** premium. Try gifting **T${giftTier}**`);

            if (premiumGifted[interaction.user.id] >= giftLimit) return interaction.reply(`You can only give ${giftLimit} premium away. Premium gifts are resetted on every 1st of the month.${giftLimit === 5 ? "" : ` You can look up our \`/patreon\` if you need more.`}`);

            if (user.bot) return interaction.reply("You can't give premium to bots.");
            if (tier < 1 || tier > 7) return interaction.reply("Invalid tier");

            if (stats[1].premium > tier) return interaction.reply(`**${user.username}** already has premium.`);
            if (stats[1].premium >= tier && interaction.user.id !== "489490486734880774") return interaction.reply(`**${user.username}** already has premium.`);

            // Stack if Apollo is gifting
            let isStack = false;
            if (stats[1].premium === tier && interaction.user.id === "489490486734880774") {
                if (premiumGift[user.id]?.date && ((new Date().getTime() - premiumGift[user.id].date) < 1000 * 60 * 60 * 24 * 30)) {
                    premiumGift[user.id] = { "method": "gift", "date": (premiumGift[user.id].date + 1000 * 60 * 60 * 24 * 30) };
                    isStack = true;
                } else {
                    premiumGift[user.id] = { "method": "gift", "date": new Date().getTime() };
                };
            } else {
                premiumGift[user.id] = { "method": "gift", "date": new Date().getTime() };
            };

            // Increment gift count
            premiumGifted[interaction.user.id]++;

            // Write to files
            fs.writeFile('Storage/premiumGift.json', JSON.stringify(premiumGift), (err) => {
                if (err) console.error(err);
            });
            fs.writeFile('Storage/premiumGifted.json', JSON.stringify(premiumGifted), (err) => {
                if (err) console.error(err);
            });

            // Update users table
            await updateUsersAndCache(interaction.client, user.id, {
                updates: {
                    premium: { type: 'set', value: tier },
                },
            });

            return interaction.reply(`${user.toString()} has received ${isStack ? "an additional month of premium!" : "1 month of premium!"}`);
        };

        // Give pass
        if (subcommand === "pass") {
            const stats = author.schema;
            const stats2 = await getUserSchema(user.id);
            if (!stats2) return interaction.reply(`**${user.username}** hasn't started playing yet.`);

            if (stats.jades < 1000) return interaction.reply(`You dont have enough jades (**${stats.jades}**/1000<:eternal_jade:1256124504141201428>)`);
            if (stats.passpurchaselimit >= 5) return interaction.reply(`You can only gift up to 5 passes`);
            if (stats2.pass) return interaction.reply(`**${user.username}** already has a premium pass!`);

            return interaction.reply({ content: `Do you want to give **${user.username}** a premium pass for **1000**<:eternal_jade:1256124504141201428>?`, components: [OfferRow] }).then(msg => {

                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 15000 });

                collector.on('collect', async r => {
                    collector.stop();
                    if (r.customId === "cancel") {
                        if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                        return;
                    };

                    const stats = await getUserSchema(interaction.user.id);
                    const stats2 = await getUserSchema(user.id);
                    if (!stats || !stats2) return;

                    if (stats.jades < 1000) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You dont have enough jades (**${stats.jades}**/1000<:eternal_jade:1256124504141201428>)`);
                        return;
                    };
                    if (stats2.pass) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`**${user.username}** already has a premium pass!`);
                        return;
                    };

                    // Update users table
                    await updateUsersAndCache(interaction.client, interaction.user.id, {
                        updates: {
                            jades: { type: 'increment', value: -1000 },
                            passpurchaselimit: { type: 'increment', value: 1 },
                        },
                    });
                    await updateUsersAndCache(interaction.client, user.id, {
                        updates: {
                            pass: { type: 'set', value: 1 },
                        },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`${user.toString()} has received a premium pass from ${interaction.user.toString()}!`);
                });

            });
        };

    },
};

export default exportCommand;
