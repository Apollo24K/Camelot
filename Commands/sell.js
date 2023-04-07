/* eslint-disable no-unused-vars */
const { MessageActionRow, MessageButton } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");
const { search } = require("../Modules/functions.js");
const { OfferRow } = require("../Modules/components.js");

module.exports = {
	name: 'sell',
	description: 'sell characters',
	execute(interaction) {

        let subcommand = interaction.options.getSubcommand();

        db.serialize(async () => {
            let inv = await query(`SELECT chars, ref FROM characters WHERE id = ${interaction.user.id}`);
            inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref)};
            if (!inv.chars.length) return interaction.reply("You don't have any characters.");
            
            // Command: /sell dupes 3 ss
            if (subcommand === "dupes" || subcommand === "all") {
                let copies = interaction.options.getInteger('copies');
                let rarity = interaction.options.getString('rarity');
                if (subcommand === "all") copies = 0;
                if (copies === null || copies < 0) copies = 1;
                
                let tinv;
                if (rarity) tinv = inv.chars.filter((e) => characters[e].rarity === rarity);
                else tinv = inv.chars.filter((e) => characters[e].rarity !== "SS");

                let uniq = [...new Set(tinv)].filter((e) => tinv.reduce((acc, curr) => acc += (curr === e), 0) > copies);
                uniq = new Map(uniq.map((id) => [id, tinv.reduce((acc, curr) => acc += (curr === id), 0)-copies]));

                if (uniq.size < 1) return interaction.reply(copies === 1 ? "You don't have any duplicates." : `You don't have any duplicates with more than ${copies} copies.`);

                let price = 0, rarPrice = {"S":1000,"A":500,"B":250,"C":100,"D":50};
                uniq.forEach((val, key) => {
                    price += rarPrice[characters[key].rarity] * val;
                });

                interaction.reply({content: `Are you sure you want to sell ${rarity ? `all ${rarity} rank cards` : "all cards (SS excluded)"} with more than ${copies === 1 ? "1 copy" : `${copies} copies`} for **${price}**<:coins:872926669055356939>?${copies ? "" : "\n⚠️ This will sell all your specified characters and could hinder your progress. We recommend only selling duplicates. ⚠️"}`, components: [OfferRow], fetchReply: true}).then(msg => {

                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 15000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 15000 });
                    
                    confirm.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        inv = await query(`SELECT chars, ref FROM characters WHERE id = ${interaction.user.id}`);
                        inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref)};

                        if (rarity) tinv = inv.chars.filter((e) => characters[e].rarity === rarity);
                        else tinv = inv.chars.filter((e) => characters[e].rarity !== "SS");
                        
                        uniq = [...new Set(tinv)].filter((e) => tinv.reduce((acc, curr) => acc += (curr === e), 0) > copies);
                        uniq = new Map(uniq.map((id) => [id, tinv.reduce((acc, curr) => acc += (curr === id), 0)-copies]));

                        if (uniq.size < 1) return interaction.channel.send(copies === 1 ? "You don't have any duplicates." : `You don't have any duplicates with more than ${copies} copies.`);

                        price = 0;
                        uniq.forEach((val, key) => {
                            // Calculate price
                            price += rarPrice[characters[key].rarity] * val;

                            // Splice from inventory
                            for (let k=0; k < val; k++) {
                                let indx = inv.chars.indexOf(key);
                                inv.chars.splice(indx, 1);
                            };
                        });
                        
                        await query(`UPDATE users SET coins = coins + ${price} WHERE id = ${interaction.user.id}`);
                        await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}' WHERE id = ${interaction.user.id}`);            

                        return interaction.channel.send(`**${price}**<:coins:872926669055356939> were added to your balance`);
                    });

                    cancel.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        interaction.channel.send("Action cancelled");
                    });
                    
                });
                return;
            };

            if (subcommand === "character") {
                let character = interaction.options.getString('character');
                let char = search(character, inv.chars, interaction);
                if (!char.name) return;
                if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);
    
                let price = {"SS":5000,"S":1000,"A":500,"B":250,"C":100,"D":50}[char.rarity];
    
                interaction.reply({content: `Are you sure you want to sell **${char.name}** for **${price}**<:coins:872926669055356939>?`, components: [OfferRow], fetchReply: true}).then(msg => {

                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 15000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 15000 });

                    confirm.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        let inv = await query(`SELECT chars, ref FROM characters WHERE id = ${interaction.user.id}`);
                        inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref)};

                        if (!inv.chars.includes(char.id)) return interaction.channel.send(`You don't have a copy of **${char.name}**`);

                        inv.chars.splice(inv.chars.indexOf(char.id), 1);

                        interaction.channel.send(`**${price}**<:coins:872926669055356939> were added to your balance`);

                        await query(`UPDATE users SET coins = coins + ${price} WHERE id = ${interaction.user.id}`);
                        await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}' WHERE id = ${interaction.user.id}`);            
                    });

                    cancel.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        interaction.channel.send("Action cancelled");
                    });
                    
                });
                return;
            };
 
        });

    },
};