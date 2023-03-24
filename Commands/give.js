/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { achievements } = require("../Modules/achievements.js");
const { characters } = require("../Modules/chars.js");
const { search } = require("../Modules/functions.js");

module.exports = {
    name: 'give',
	description: 'Give coins or characters to other players',
	execute(interaction, client) {
        
        let subcommand = interaction.options.getSubcommand();
        let user = interaction.options.getUser('user');
        if (user.bot) return interaction.reply("You can't send something to a bot");
        if (user.id === interaction.user.id) return interaction.reply("no <:yogurtKek:794982064553328660>");

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

        db.serialize(async () => {
            let _stats = await query(`SELECT coins FROM users WHERE id = ${user.id}`);
            if (!_stats[0]) return interaction.reply(`**${user.username}** hasn't started playing yet.`);
            
            // Give coins
            if (subcommand === "coins") {
                let amount = interaction.options.getInteger('amount');

                let stats = await query(`SELECT coins FROM users WHERE id = ${interaction.user.id}`);
                stats = stats[0];

                if (stats.coins < amount) return interaction.reply(`You dont have that much coins (your balance: **${stats.coins}**<:coins:872926669055356939>)`);
                if (amount < 1) return interaction.reply(`${amount} coins? <:ConfusedSmug:868988282250346558>`);
                if (amount > 1000000) return interaction.reply(`You can't send more than 1'000'000<:coins:872926669055356939> at once.`);

                return interaction.reply({content: `Are you sure you want to give **${user.username}** **${amount}**<:coins:872926669055356939>?`, components: [row], fetchReply: true }).then(msg => {

                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 15000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 15000 });

                    confirm.on('collect', async r => {
                        let  stats = await query(`SELECT coins FROM users WHERE id = ${interaction.user.id}`);
                        stats = stats[0];

                        if (stats.coins < amount) return interaction.reply(`You dont have that much coins (your balance: **${stats.coins}**<:coins:872926669055356939>)`);

                        interaction.channel.send(`Sent **${amount}**<:coins:872926669055356939> to **${user.toString()}**`);
                        confirm.stop(), cancel.stop();

                        await query(`UPDATE users SET coins = coins - ${amount} WHERE id = ${interaction.user.id}`);
                        await query(`UPDATE users SET coins = coins + ${amount} WHERE id = ${user.id}`);

                        // trade logs
                        let chnl = client.channels.cache.find(channel => channel.id === "1042922243933622362");
                        const Embed = new MessageEmbed()
                        .setColor(0xbbffff)
                        .setDescription(`${interaction.user.tag} sent **${amount}**<:coins:872926669055356939> to **${user.tag}**\n${interaction.user.toString()} ➜ ${interaction.user.id}\n${user.toString()} ➜ ${user.id}`);
                        chnl.send({ embeds: [Embed] });
                        // trade logs
                    });

                    cancel.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        interaction.channel.send("Action cancelled")
                    });

                });
            };

            // Give characters
            if (subcommand === "character") {
                let inv = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
                inv = {chars: JSON.parse(inv[0].chars)};

                let choice = interaction.options.getString('character');
                
                let char = search(choice, inv.chars, interaction);
                if (!char.name) return;
                if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);
    
                return interaction.reply({content: `Are you sure you want to give **${char.name}** to **${user.username}**?`, components: [row], fetchReply: true}).then(msg => {
                    
                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 15000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 15000 });

                    confirm.on('collect', async r => {
                        let inv = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
                        inv = {chars: JSON.parse(inv[0].chars)};
                        if (!inv.chars.includes(char.id)) return interaction.channel.send(`You don't have a copy of **${char.name}**`);

                        let _inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
                        _inv = {chars: JSON.parse(_inv[0].chars)};

                        /* Achievement */ if (inv.chars[inv.chars.length-1] === char.id && characters[char.id].rarity === "SS") achievements[32].check(interaction); // Shared Happiness

                        inv.chars.splice(inv.chars.indexOf(char.id), 1);
                        _inv.chars.push(char.id);

                        interaction.channel.send(`**${char.name}** was gifted to **${user.toString()}**`);
                        confirm.stop(), cancel.stop();

                        await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}' WHERE id = ${interaction.user.id}`);
                        await query(`UPDATE characters SET chars = '${JSON.stringify(_inv.chars)}' WHERE id = ${user.id}`);

                        // Achievements
                        achievements[1].check(interaction, user), achievements[2].check(interaction, user), achievements[3].check(interaction, user); // Collector
                        achievements[19].check(interaction, user), achievements[20].check(interaction, user), achievements[21].check(interaction, user), achievements[22].check(interaction, user), achievements[23].check(interaction, user); // Diligent
                        achievements[30].check(interaction, interaction.user, char.rarity), achievements[31].check(interaction, interaction.user, char.rarity); // Shared Happiness

                        // trade logs
                        let chnl = client.channels.cache.find(channel => channel.id === "1042922243933622362");
                        const Embed = new MessageEmbed()
                        .setColor(0xbbffff)
                        .setDescription(`${interaction.user.tag} sent **${characters[char.id].rarity}**-Tier **${characters[char.id].name}** to **${user.tag}**\n${interaction.user.toString()} ➜ ${interaction.user.id}\n${user.toString()} ➜ ${user.id}`);
                        chnl.send({ embeds: [Embed] });
                        // trade logs
                    });

                    cancel.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        interaction.channel.send("Action cancelled")
                    });

                });

            };

            // Give premium
            if (subcommand === "premium") {
                let tier = interaction.options.getInteger('tier');

                let premiumGift = JSON.parse(fs.readFileSync('Storage/premiumGift.json', 'utf8'));
                let premiumGifted = JSON.parse(fs.readFileSync('Storage/premiumGifted.json', 'utf8'));

                if (user.id === interaction.user.id) return interaction.reply("You can't give yourself premium <:Heh:869656740667469864>");

                var stats = await query(`SELECT id, premium FROM users WHERE id IN (${interaction.user.id}, ${user.id})`);
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