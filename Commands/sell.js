/* eslint-disable no-unused-vars */
const { MessageActionRow, MessageButton } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");
const { search } = require("../Modules/functions.js");

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

module.exports = {
	name: 'sell',
	description: 'sell characters',
	execute(interaction) {

        let subcommand = interaction.options.getSubcommand();

        db.serialize(async () => {
            let inv = await query(`SELECT chars, ref FROM characters WHERE id = ${interaction.user.id}`);
            inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref)};
            if (!inv.chars.length) return interaction.reply("You don't have any characters.");
            
            if (subcommand === "dupes" || subcommand === "all") {
                let copies = interaction.options.getInteger('copies');
                let rarity = interaction.options.getString('rarity');
                if (subcommand === "all") copies = 0;
                // Command: !sell dupes 3 ss
                if (copies === null || copies < 0) copies = 1;
                let tinv;
                if (rarity) tinv = inv.chars.filter((e) => characters[e].rarity === rarity);
                else tinv = inv.chars.filter((e) => characters[e].rarity !== "SS");
                
                let uniq = [...new Set(tinv)];
                for (let i=uniq.length-1; i >= 0; i--) {
                    if (!(tinv.filter((e) => e === uniq[i]).length > copies)) {
                        uniq.splice(i, 1);
                    };
                };
                if (uniq.length < 1) return interaction.reply(copies === 1 ? "You don't have any duplicates." : `You don't have any duplicates with more than ${copies} copies.`);

                let price = 0;
                uniq.forEach((c) => {
                    let multiplier = (inv.chars.filter((e) => e === c).length - copies);
                    price += {"S":1000,"A":500,"B":250,"C":100,"D":50}[characters[c].rarity] * multiplier;
                });

                interaction.reply({content: `Are you sure you want to sell ${rarity ? `all ${rarity} rank cards` : "all cards (SS excluded)"} with more than ${copies === 1 ? "1 copy" : `${copies} copies`} for **${price}**<:coins:872926669055356939>?${copies ? "" : "\n⚠️ This will sell all your specified characters and could hinder your progress. We recommend only selling duplicates. ⚠️"}`, components: [row], fetchReply: true}).then(msg => {

                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 15000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 15000 });
                    
                    confirm.on('collect', async r => {
                        let inv = await query(`SELECT chars, ref FROM characters WHERE id = ${interaction.user.id}`);
                        inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref)};

                        if (rarity) tinv = inv.chars.filter((e) => characters[e].rarity === rarity);
                        else tinv = inv.chars.filter((e) => characters[e].rarity !== "SS");
                        
                        uniq = [...new Set(tinv)];
                        for (let i=uniq.length-1; i >= 0; i--) {
                            if (!(tinv.filter((e) => e === uniq[i]).length > copies)) {
                                uniq.splice(i, 1);
                            };
                        };
                        if (uniq.length < 1) {
                            confirm.stop(), cancel.stop();
                            return interaction.channel.send(copies === 1 ? "You don't have any duplicates." : `You don't have any duplicates with more than ${copies} copies.`);
                        };

                        for (let i=0; i < uniq.length; i++) {
                            let xChar = inv.chars.filter((e) => e === uniq[i]).length - copies;
                            for (let k=0; k < xChar; k++) {
                                let indx = inv.chars.indexOf(uniq[i]);
                                inv.chars.splice(indx, 1);
                            };
                        };

                        interaction.channel.send(`**${price}**<:coins:872926669055356939> were added to your balance`);
                        confirm.stop(), cancel.stop();
                        
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

            if (subcommand === "character") {
                let character = interaction.options.getString('character');
                let char = search(character, inv.chars, interaction);
                if (!char.name) return;
                if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);
    
                let price = {"SS":5000,"S":1000,"A":500,"B":250,"C":100,"D":50}[char.rarity];
    
                interaction.reply({content: `Are you sure you want to sell **${char.name}** for **${price}**<:coins:872926669055356939>?`, components: [row], fetchReply: true}).then(msg => {

                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 15000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 15000 });

                    confirm.on('collect', async r => {
                        let inv = await query(`SELECT chars, ref FROM characters WHERE id = ${interaction.user.id}`);
                        inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref)};

                        if (!inv.chars.includes(char.id)) {
                            confirm.stop(), cancel.stop();
                            return interaction.channel.send(`You don't have a copy of **${char.name}**`);
                        };

                        inv.chars.splice(inv.chars.indexOf(char.id), 1);

                        interaction.channel.send(`**${price}**<:coins:872926669055356939> were added to your balance`);
                        confirm.stop(), cancel.stop();

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