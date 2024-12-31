import fs from 'fs';
import { EmbedBuilder, ComponentType } from "discord.js";
import { db, query } from "../db_handler";
import { achievements } from "../Modules/achievements";
import { characters } from "../Modules/chars";
import { userLevel, search } from "../Modules/functions";
import { OfferRow } from "../Modules/components";

module.exports = {
    name: 'give',
    description: 'Give coins or characters to other players',
    execute(interaction) {

        let subcommand = interaction.options.getSubcommand();
        let user = interaction.options.getUser('user');
        if (user.bot) return interaction.reply("You can't send something to a bot");
        if (user.id === interaction.user.id) return interaction.reply("no <:yogurtKek:794982064553328660>");

        db.serialize(async () => {
            const { 0: _stats } = await query(`SELECT coins, xp FROM users WHERE id = ${user.id}`);
            if (!_stats) return interaction.reply(`**${user.username}** hasn't started playing yet.`);

            // Give coins
            if (subcommand === "coins") {
                const amount = interaction.options.getInteger('amount');

                const { 0: stats } = await query(`SELECT coins, xp FROM users WHERE id = ${interaction.user.id}`);
                if (userLevel(stats.xp) < 25) return interaction.reply(`You must be level 25 or higher to give coins`);

                if (stats.coins < amount) return interaction.reply(`You dont have that much coins (your balance: **${stats.coins}**<:coins:872926669055356939>)`);
                if (amount < 1) return interaction.reply(`${amount} coins? <:ConfusedSmug:868988282250346558>`);
                if (amount > 10000000) return interaction.reply(`You can't send more than 10'000'000<:coins:872926669055356939> at once.`);

                return interaction.reply({ content: `Are you sure you want to give **${user.username}** **${amount}**<:coins:872926669055356939>?${userLevel(_stats.xp) < 25 ? `\n⚠️ **${user.username}** is below level 25 and won't be able to use \`/give\` commands until then.` : ""}`, components: [OfferRow], fetchReply: true }).then(msg => {

                    const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 15000 });
                    const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 15000 });

                    confirm.on('collect', async () => {
                        confirm.stop(), cancel.stop();

                        const { 0: stats } = await query(`SELECT coins FROM users WHERE id = ${interaction.user.id}`);
                        if (stats.coins < amount) return interaction.reply(`You dont have that much coins (your balance: **${stats.coins}**<:coins:872926669055356939>)`);

                        await query(`UPDATE users SET coins = coins - ${amount} WHERE id = ${interaction.user.id}`);
                        await query(`UPDATE users SET coins = coins + ${amount} WHERE id = ${user.id}`);

                        interaction.channel.send(`${interaction.user.toString()} has sent **${amount}**<:coins:872926669055356939> to ${user.toString()}`);

                        // Trade Log
                        await query(`INSERT INTO trades (id, receiver, type, sent) VALUES (${interaction.user.id}, ${user.id}, "coins", ${amount})`, 'run');
                        const chnl = interaction.client.channels.cache.find(channel => channel.id === "1042922243933622362");
                        const Embed = new EmbedBuilder()
                            .setColor(0xbbffff)
                            .setDescription(`${interaction.user.tag} sent **${amount}**<:coins:872926669055356939> to **${user.tag}**\n${interaction.user.toString()} ➜ ${interaction.user.id}\n${user.toString()} ➜ ${user.id}`);
                        chnl.send({ embeds: [Embed] });
                    });

                    cancel.on('collect', () => {
                        confirm.stop(), cancel.stop();
                        interaction.channel.send("Action cancelled");
                    });

                });
            };

            // Give characters
            if (subcommand === "characters") {
                const { 0: stats } = await query(`SELECT xp, animelock, charlock FROM users WHERE id = ${interaction.user.id}`);
                if (userLevel(stats.xp) < 25) return interaction.reply(`You must be level 25 or higher to give characters`);
                stats.animelock = JSON.parse(stats.animelock);
                stats.charlock = JSON.parse(stats.charlock);

                const { 0: inv } = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
                inv.chars = JSON.parse(inv.chars);

                const choice = [...new Set((interaction.options.getString('characters') || "").split(",").map((e) => e.trim()))];

                let hasLockedCharacters = false;
                const chars = [];
                choice.forEach((c) => {
                    const char = search(c, inv.chars, interaction, true);
                    if (stats.charlock.includes(char?.id) || stats.animelock.includes(char?.animeInfo?.id)) hasLockedCharacters = true;
                    if (char?.name && inv.chars.includes(char.id) && !chars.includes(char) && !stats.charlock.includes(char.id) && !stats.animelock.includes(char.animeInfo.id)) chars.push(char);
                });

                if (chars.length === 0) return interaction.reply(hasLockedCharacters ? "⚠️ You're trying to give locked characters, please unlock them first." : `No match found`);
                if (chars.length > 200) return interaction.reply(`You can't give more than 200 chars at once`);

                return interaction.reply({ content: `Are you sure you want to give **${chars.map((c) => c.name.slice(0, 20)).join(", ").length > 1800 ? (chars.map((c) => c.name.slice(0, 20)).join(", ") + " __+ more__") : chars.map((c) => c.name.slice(0, 20)).join(", ")}** to **${user.username}**?${hasLockedCharacters ? "\n⚠️ You're trying to give locked characters, please unlock them first." : ""}${userLevel(_stats.xp) < 25 ? `\n⚠️ **${user.username}** is below level 25 and won't be able to use \`/give\` commands until then.` : ""}`, components: [OfferRow], fetchReply: true }).then(msg => {

                    const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 15000 });
                    const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 15000 });

                    confirm.on('collect', async () => {
                        confirm.stop(), cancel.stop();

                        const { 0: inv } = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
                        inv.chars = JSON.parse(inv.chars);

                        const chars = [];
                        choice.forEach((c) => {
                            const char = search(c, inv.chars, interaction, true);
                            if (char?.name && inv.chars.includes(char.id) && !chars.includes(char) && !stats.charlock.includes(char.id) && !stats.animelock.includes(char.animeInfo.id)) chars.push(char);
                        });

                        if (chars.length === 0) return interaction.reply(hasLockedCharacters ? "⚠️ You've tried giving locked characters, please unlock them first." : `No match found`);
                        if (chars.length > 200) return interaction.reply(`You can't give more than 200 chars at once`);

                        const { 0: _inv } = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
                        _inv.chars = JSON.parse(_inv.chars);

                        // Achievements
                        achievements[30].check(interaction, interaction.user, chars.some((e) => e.rarity === "S")), achievements[31].check(interaction, interaction.user, chars.some((e) => e.rarity === "SS")); // Shared Happiness
                        achievements[32].check(interaction, interaction.user, chars.some((e) => inv.chars[inv.chars.length - 1] === e.id && e.rarity === "SS")); // Shared Happiness

                        for (const char of chars) {
                            inv.chars.splice(inv.chars.indexOf(char.id), 1);
                            _inv.chars.push(char.id);

                            // Log Trades
                            if (char.rarity === "SS" || char.rarity === "EX") await query(`INSERT INTO trades (id, receiver, type, sent) VALUES (${interaction.user.id}, ${user.id}, "char", ${char.id})`, 'run');
                        };

                        // Start a database transaction
                        await query('BEGIN TRANSACTION');

                        try {
                            // Perform database operations within the transaction
                            await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}' WHERE id = ${interaction.user.id}`);
                            await query(`UPDATE characters SET chars = '${JSON.stringify(_inv.chars)}' WHERE id = ${user.id}`);

                            // If both operations are successful, commit the transaction
                            await query('COMMIT');
                        } catch (error) {
                            // If an error occurs, roll back the transaction
                            await query('ROLLBACK');

                            // Handle the error, e.g., by logging it and notifying the user
                            console.error('Transaction failed:', error);
                            return interaction.channel.send('An error occurred while processing your request.');
                        };

                        interaction.channel.send(`**${chars.map((c) => c.name.slice(0, 20)).join(", ").length > 1800 ? (chars.map((c) => c.name.slice(0, 20)).join(", ") + " __+ more__") : chars.map((c) => c.name.slice(0, 20)).join(", ")}** ${chars.length === 1 ? "was" : "were"} gifted to **${user.toString()}**`);

                        // Achievements
                        achievements[1].check(interaction, user), achievements[2].check(interaction, user), achievements[3].check(interaction, user); // Collector
                        achievements[19].check(interaction, user), achievements[20].check(interaction, user), achievements[21].check(interaction, user), achievements[22].check(interaction, user), achievements[23].check(interaction, user); // Diligent

                        // Trade Log
                        const chnl = interaction.client.channels.cache.find(channel => channel.id === "1042922243933622362");
                        const Embed = new EmbedBuilder()
                            .setColor(0xbbffff)
                            .setDescription(`${interaction.user.tag} sent ${chars.map((char) => `**${characters[char.id].rarity}** **${characters[char.id].name.slice(0, 18)}**`).join(", ")} to **${user.tag}**\n${interaction.user.toString()} ➜ ${interaction.user.id}\n${user.toString()} ➜ ${user.id}`);
                        chnl.send({ embeds: [Embed] });
                    });

                    cancel.on('collect', async () => {
                        confirm.stop(), cancel.stop();
                        interaction.channel.send("Action cancelled");
                    });

                });

            };

            // Give premium
            if (subcommand === "premium") {
                const tier = interaction.options.getInteger('tier');

                const premiumGift = JSON.parse(fs.readFileSync('Storage/premiumGift.json', 'utf8'));
                const premiumGifted = JSON.parse(fs.readFileSync('Storage/premiumGifted.json', 'utf8'));

                if (user.id === interaction.user.id) return interaction.reply("You can't give yourself premium <:Heh:869656740667469864>");

                let stats = await query(`SELECT id, premium FROM users WHERE id IN (${interaction.user.id}, ${user.id})`);
                if (stats[0].id === user.id) stats = [{ premium: stats[1].premium }, { premium: stats[0].premium }];
                if (!stats[1]) return interaction.reply(`**${user.username}** hasn't started playing the game yet.`);

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

                await query(`UPDATE users SET premium = ${tier} WHERE id = ${user.id}`);

                return interaction.reply(`${user.toString()} has received ${isStack ? "an additional month of premium!" : "1 month of premium!"}`);
            };

            // Give pass
            if (subcommand === "pass") {
                const { 0: stats } = await query(`SELECT jades, passpurchaselimit FROM users WHERE id = ${interaction.user.id}`);
                const { 0: stats2 } = await query(`SELECT pass FROM users WHERE id = ${user.id}`);

                if (stats.jades < 1000) return interaction.reply(`You dont have enough jades (**${stats.jades}**/1000<:eternal_jade:1256124504141201428>)`);
                if (stats.passpurchaselimit >= 5) return interaction.reply(`You can only gift up to 5 passes`);
                if (stats2.pass) return interaction.reply(`**${user.username}** already has a premium pass!`);

                return interaction.reply({ content: `Do you want to give **${user.username}** a premium pass for **1000**<:eternal_jade:1256124504141201428>?`, components: [OfferRow], fetchReply: true }).then(msg => {

                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 15000 });

                    collector.on('collect', async r => {
                        collector.stop();
                        if (r.customId === "cancel") return interaction.channel.send("Action cancelled");

                        const { 0: stats } = await query(`SELECT jades FROM users WHERE id = ${interaction.user.id}`);
                        const { 0: stats2 } = await query(`SELECT pass FROM users WHERE id = ${user.id}`);

                        if (stats.jades < 1000) return interaction.reply(`You dont have enough jades (**${stats.jades}**/1000<:eternal_jade:1256124504141201428>)`);
                        if (stats2.pass) return interaction.reply(`**${user.username}** already has a premium pass!`);

                        await query(`UPDATE users SET jades = jades - 1000, passpurchaselimit = passpurchaselimit + 1 WHERE id = ${interaction.user.id}`);
                        await query(`UPDATE users SET pass = 1 WHERE id = ${user.id}`);

                        interaction.channel.send(`${user.toString()} has received a premium pass from ${interaction.user.toString()}!`);
                    });

                });
            };

        });

    },
};
