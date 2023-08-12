const fs = require('fs');
const { EmbedBuilder, ComponentType } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { achievements } = require("../Modules/achievements.js");
const { characters } = require("../Modules/chars.js");
const { search } = require("../Modules/functions.js");
const { OfferRow } = require("../Modules/components.js");

module.exports = {
    name: 'give',
	description: 'Give coins or characters to other players',
	execute(interaction, client) {
        
        let subcommand = interaction.options.getSubcommand();
        let user = interaction.options.getUser('user');
        if (user.bot) return interaction.reply("You can't send something to a bot");
        if (user.id === interaction.user.id) return interaction.reply("no <:yogurtKek:794982064553328660>");

        db.serialize(async () => {
            let _stats = await query(`SELECT coins FROM users WHERE id = ${user.id}`);
            if (!_stats[0]) return interaction.reply(`**${user.username}** hasn't started playing yet.`);
            
            // Give coins
            if (subcommand === "coins") {
                const amount = interaction.options.getInteger('amount');

                const { 0: stats } = await query(`SELECT coins FROM users WHERE id = ${interaction.user.id}`);

                if (stats.coins < amount) return interaction.reply(`You dont have that much coins (your balance: **${stats.coins}**<:coins:872926669055356939>)`);
                if (amount < 1) return interaction.reply(`${amount} coins? <:ConfusedSmug:868988282250346558>`);
                if (amount > 10000000) return interaction.reply(`You can't send more than 10'000'000<:coins:872926669055356939> at once.`);

                return interaction.reply({content: `Are you sure you want to give **${user.username}** **${amount}**<:coins:872926669055356939>?`, components: [OfferRow], fetchReply: true }).then(msg => {

                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 15000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 15000 });

                    confirm.on('collect', async () => {
                        confirm.stop(), cancel.stop();

                        const { 0: stats } = await query(`SELECT coins FROM users WHERE id = ${interaction.user.id}`);
                        if (stats.coins < amount) return interaction.reply(`You dont have that much coins (your balance: **${stats.coins}**<:coins:872926669055356939>)`);

                        await query(`UPDATE users SET coins = coins - ${amount} WHERE id = ${interaction.user.id}`);
                        await query(`UPDATE users SET coins = coins + ${amount} WHERE id = ${user.id}`);
                        
                        interaction.channel.send(`Sent **${amount}**<:coins:872926669055356939> to **${user.toString()}**`);

                        // Trade Log
                        const chnl = client.channels.cache.find(channel => channel.id === "1042922243933622362");
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
                const { 0: inv } = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
                inv.chars = JSON.parse(inv.chars);
                
                const choice = [...new Set((interaction.options.getString('characters') || "").split(",").map((e)=> e.trim()))];
                
                const chars = [];
                choice.forEach((c) => {
                    const char = search(c, inv.chars, interaction, true);
                    if (char?.name && inv.chars.includes(char.id)) chars.push(char);
                });

                if (chars.length === 0) return interaction.reply(`No match found`);
                if (chars.length > 20) return interaction.reply(`You can't give more than 20 chars at once`);
                
                return interaction.reply({content: `Are you sure you want to give **${chars.map((c) => c.name.slice(0,20)).join(", ")}** to **${user.username}**?`, components: [OfferRow], fetchReply: true}).then(msg => {
                    
                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 15000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 15000 });

                    confirm.on('collect', async () => {
                        confirm.stop(), cancel.stop();

                        const { 0: inv } = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
                        inv.chars = JSON.parse(inv.chars);

                        const chars = [];
                        choice.forEach((c) => {
                            const char = search(c, inv.chars, interaction, true);
                            if (char?.name && inv.chars.includes(char.id)) chars.push(char);
                        });
                        
                        if (chars.length === 0) return interaction.reply(`No match found`);
                        if (chars.length > 20) return interaction.reply(`You can't give more than 20 chars at once`);

                        const { 0: _inv } = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
                        _inv.chars = JSON.parse(_inv.chars);

                        // Achievements
                        achievements[30].check(interaction, interaction.user, chars.some((e) => e.rarity === "S")), achievements[31].check(interaction, interaction.user, chars.some((e) => e.rarity === "SS")); // Shared Happiness
                        achievements[32].check(interaction, interaction.user, chars.some((e) => inv.chars[inv.chars.length-1] === e.id && e.rarity === "SS")); // Shared Happiness

                        chars.forEach((char) => {
                            inv.chars.splice(inv.chars.indexOf(char.id), 1);
                            _inv.chars.push(char.id);
                        });

                        await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}' WHERE id = ${interaction.user.id}`);
                        await query(`UPDATE characters SET chars = '${JSON.stringify(_inv.chars)}' WHERE id = ${user.id}`);
                        
                        interaction.channel.send(`**${chars.map((c) => c.name.slice(0,20)).join(", ")}** ${chars.length === 1 ? "was" : "were"} gifted to **${user.toString()}**`);

                        // Achievements
                        achievements[1].check(interaction, user), achievements[2].check(interaction, user), achievements[3].check(interaction, user); // Collector
                        achievements[19].check(interaction, user), achievements[20].check(interaction, user), achievements[21].check(interaction, user), achievements[22].check(interaction, user), achievements[23].check(interaction, user); // Diligent

                        // Trade Log
                        const chnl = client.channels.cache.find(channel => channel.id === "1042922243933622362");
                        const Embed = new EmbedBuilder()
                        .setColor(0xbbffff)
                        .setDescription(`${interaction.user.tag} sent ${chars.map((char) => `**${characters[char.id].rarity}**-Tier **${characters[char.id].name}**`).join(", ")} to **${user.tag}**\n${interaction.user.toString()} ➜ ${interaction.user.id}\n${user.toString()} ➜ ${user.id}`);
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
                if (stats[0].id === user.id) stats = [{premium: stats[1].premium}, {premium: stats[0].premium}];
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
                    default : false; break;
                };
                if (interaction.user.id === "489490486734880774") giftLimit = 999999;
                if (tier !== giftTier && interaction.user.id !== "489490486734880774") return interaction.reply(`You can't gift **T${tier}** premium. Try gifting **T${giftTier}**`);
                
                if (premiumGifted[interaction.user.id] >= giftLimit) return interaction.reply(`You can only give ${giftLimit} premium away. Premium gifts are resetted on every 1st of the month.${giftLimit === 5 ? "" : ` You can look up our \`/patreon\` if you need more.`}`);

                if (stats[1].premium >= tier) return interaction.reply(`**${user.username}** already has premium.`);
                if (user.bot) return interaction.reply("You can't give premium to bots.");
                if (tier < 1 || tier > 7) return interaction.reply("Invalid tier");
        
                premiumGift[user.id] = { "method":"gift", "date":new Date().getTime() };
                premiumGifted[interaction.user.id]++;

                fs.writeFile('Storage/premiumGift.json', JSON.stringify(premiumGift), (err) => {
                    if (err) console.error(err);
                });
                fs.writeFile('Storage/premiumGifted.json', JSON.stringify(premiumGifted), (err) => {
                    if (err) console.error(err);
                });
                
                await query(`UPDATE users SET premium = ${tier} WHERE id = ${user.id}`);
                
                return interaction.reply(`${user.toString()} has received 1 month of premium!`);
            };

        });

    },
};