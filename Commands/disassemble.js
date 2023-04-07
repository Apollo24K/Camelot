/* eslint-disable no-unused-vars */
const { MessageEmbed } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { items } = require("../Modules/items.js");
const { getAscensionMaterial, getItemLevel } = require("../Modules/functions.js");
const { OfferRow } = require("../Modules/components.js");

module.exports = {
    name: 'disassemble',
	description: 'disassemble items',
	execute(interaction) {
        
        let subcommand = interaction.options.getSubcommand();
        
        // Item info
        if (subcommand === "items") {
            const choice = [...new Set(interaction.options.getString('items').split(",").map((e)=> e.trim()))];

            if (choice.length > 100) return interaction.reply(`You can disassemble at most 100 items at once.`);
            
            db.serialize(async () => {
                const itemsToDisassemble = [];
                const itemIdsToDisassemble = [];
                const loot = {};
                for (let i=0; i < choice.length; i++) {
                    const { 0: item } = await query(`SELECT * FROM weapons WHERE uniqueid = '${choice[i]}:${interaction.user.id}'`);
                    if (!item) continue;
                    
                    const fItem = items[item.itemid];
                    const ascItem = getAscensionMaterial(fItem.id, items.filter((e) => e.type === "ascension material"));
                    const craftItem = items.find((e) => e.type === "crafting material" && e.grade === fItem.grade);
                    const levelItem = items[fItem.category === "weapon" ? 56 : 57];

                    let exchangeItem = false;
                    if (fItem.grade === "genesis") exchangeItem = items[676];
                    else if (fItem.grade === "mythical") exchangeItem = items[677];
                    else if (fItem.grade === "legendary") exchangeItem = items[678];
    
                    const ascMatsNeeded = Math.round((1/6) * 12 * ((0.5*item.ascension*item.ascension) + (3.5*item.ascension) + 3));
                    const craftMatsNeeded = Math.round((1/6) * 8 * ((0.5*item.ascension*item.ascension) + (3.5*item.ascension) + 3));
                    const levelMatsNeeded = Math.floor(item.level/5000);

                    loot[ascItem.id] = (loot[ascItem.id] + ascMatsNeeded) || ascMatsNeeded;
                    loot[craftItem.id] = (loot[craftItem.id] + craftMatsNeeded) || craftMatsNeeded;
                    if (levelMatsNeeded) loot[levelItem.id] = (loot[levelItem.id] + levelMatsNeeded) || levelMatsNeeded;
                    if (exchangeItem) loot[exchangeItem.id] = (loot[exchangeItem.id] + 1) || 1;

                    itemsToDisassemble.push(fItem);
                    itemIdsToDisassemble.push(item);
                };

                if (itemsToDisassemble.length < 1) return interaction.reply(`You need to select at least 1 item.`);

                const Embed = new MessageEmbed()
                .setTitle("Disassemble Items")
                .setColor(0xbbffff)
                .setDescription(`Do you want to disassemble\n${itemsToDisassemble.slice(0,10).map((e, i) => `${e.bar}\`${itemIdsToDisassemble[i].uniqueid.split(":")[0]}\` | ${e.emoji} **__${e.name}__**`).join("\n")}${itemsToDisassemble.length > 10 ? `\n+ ${itemsToDisassemble.length - 10} more` : ""}\nfor ${Object.entries(loot).map((e) => `${items[e[0]].emoji}x${e[1]}`).join(", ")}?`)
                return interaction.reply({ embeds: [Embed], components: [OfferRow], fetchReply: true }).then(msg => {
                        
                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 45000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 45000 });
                    
                    confirm.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        let stats = await query(`SELECT users.items, characters.equipment FROM users JOIN characters ON users.id = characters.id WHERE users.id = ${interaction.user.id}`);
                        stats = {items: JSON.parse(stats[0].items), equipment: JSON.parse(stats[0].equipment)};
                        
                        const itemsToDisassemble = [];
                        const itemIdsToDisassemble = [];
                        const loot = {};
                        for (let i=0; i < choice.length; i++) {
                            const { 0: item } = await query(`SELECT * FROM weapons WHERE uniqueid = '${choice[i]}:${interaction.user.id}'`);
                            if (!item) continue;
                            
                            const fItem = items[item.itemid];
                            const ascItem = getAscensionMaterial(fItem.id, items.filter((e) => e.type === "ascension material"));
                            const craftItem = items.find((e) => e.type === "crafting material" && e.grade === fItem.grade);
                            const levelItem = items[fItem.category === "weapon" ? 56 : 57];
        
                            let exchangeItem = false;
                            if (fItem.grade === "genesis") exchangeItem = items[676];
                            else if (fItem.grade === "mythical") exchangeItem = items[677];
                            else if (fItem.grade === "legendary") exchangeItem = items[678];
            
                            const ascMatsNeeded = Math.round((1/6) * 12 * ((0.5*item.ascension*item.ascension) + (3.5*item.ascension) + 3));
                            const craftMatsNeeded = Math.round((1/6) * 8 * ((0.5*item.ascension*item.ascension) + (3.5*item.ascension) + 3));
                            const levelMatsNeeded = Math.floor(item.level/5000);
        
                            loot[ascItem.id] = (loot[ascItem.id] + ascMatsNeeded) || ascMatsNeeded;
                            loot[craftItem.id] = (loot[craftItem.id] + craftMatsNeeded) || craftMatsNeeded;
                            if (levelMatsNeeded) loot[levelItem.id] = (loot[levelItem.id] + levelMatsNeeded) || levelMatsNeeded;
                            if (exchangeItem) loot[exchangeItem.id] = (loot[exchangeItem.id] + 1) || 1;
                            
                            // Unequip if equipped
                            let type = fItem.category;
                            if (type === "armor" || fItem.type === "shield") type = fItem.type;
                            if (type === "shield" && stats.premium < 4) type = "weapon";
                            if (item.character in stats.equipment && stats.equipment[item.character][type] === item.uniqueid) delete stats.equipment[item.character][type];

                            itemsToDisassemble.push(fItem);
                            itemIdsToDisassemble.push(item);
                        };

                        if (itemsToDisassemble.length < 1) return interaction.channel.send(`You need to select at least 1 item.`);

                        // Add loot
                        Object.entries(loot).forEach((e) => {
                            stats.items[e[0]] = stats.items[e[0]] + e[1] || e[1];
                        });
                        
                        await query(`UPDATE characters SET equipment = '${JSON.stringify(stats.equipment)}' WHERE id = ${interaction.user.id}`);
                        await query(`UPDATE users SET items = '${JSON.stringify(stats.items)}' WHERE id = ${interaction.user.id}`);
                        await query(`DELETE FROM weapons WHERE uniqueid IN (${itemIdsToDisassemble.map((e) => `'${e.uniqueid}'`).join(", ")})`);
                        
                        return interaction.channel.send(`Added ${Object.entries(loot).map((e) => `${items[e[0]].emoji}x${e[1]}`).join(", ")}`);
                    });
                    
                    cancel.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        interaction.channel.send("Action cancelled");
                    });
                    
                });

            });
        };

        // Item info
        if (subcommand === "all") {
            const exclude = [...new Set((interaction.options.getString('exclude') || "").split(",").map((e)=> e.trim()))];
            const sellGrade = interaction.options.getString('grade') || false;
            const sellType = interaction.options.getString('type') || false;

            db.serialize(async () => {
                const itemsToDisassemble = [];
                const itemIdsToDisassemble = [];
                const loot = {};

                const userItems = await query(`Select * FROM weapons WHERE id = '${interaction.user.id}'`);
                if (!userItems.length) return interaction.reply(`You don't have any items.`);
                
                for (const item of userItems) {
                    const fItem = items[item.itemid];
                    
                    if (exclude.includes(item.uniqueid.split(":")[0])) continue;
                    if (fItem.grade === "genesis") continue;
                    if (sellGrade && fItem.grade !== sellGrade) continue;
                    if (sellType && fItem.type !== sellType) continue;

                    const ascItem = getAscensionMaterial(fItem.id, items.filter((e) => e.type === "ascension material"));
                    const craftItem = items.find((e) => e.type === "crafting material" && e.grade === fItem.grade);
                    const levelItem = items[fItem.category === "weapon" ? 56 : 57];
                    
                    let exchangeItem = false;
                    if (fItem.grade === "genesis") exchangeItem = items[676];
                    else if (fItem.grade === "mythical") exchangeItem = items[677];
                    else if (fItem.grade === "legendary") exchangeItem = items[678];
    
                    const ascMatsNeeded = Math.round((1/6) * 12 * ((0.5*item.ascension*item.ascension) + (3.5*item.ascension) + 3));
                    const craftMatsNeeded = Math.round((1/6) * 8 * ((0.5*item.ascension*item.ascension) + (3.5*item.ascension) + 3));
                    const levelMatsNeeded = Math.floor(item.level/5000);

                    loot[ascItem.id] = (loot[ascItem.id] + ascMatsNeeded) || ascMatsNeeded;
                    loot[craftItem.id] = (loot[craftItem.id] + craftMatsNeeded) || craftMatsNeeded;
                    if (levelMatsNeeded) loot[levelItem.id] = (loot[levelItem.id] + levelMatsNeeded) || levelMatsNeeded;
                    if (exchangeItem) loot[exchangeItem.id] = (loot[exchangeItem.id] + 1) || 1;

                    itemsToDisassemble.push(fItem);
                    itemIdsToDisassemble.push(item);
                };

                if (itemsToDisassemble.length < 1) return interaction.reply(`You need to select at least 1 item.`);

                const Embed = new MessageEmbed()
                .setTitle("Disassemble Items")
                .setColor(0xbbffff)
                .setDescription(`Do you want to disassemble\n${itemsToDisassemble.slice(0,10).map((e, i) => `${e.bar}\`${itemIdsToDisassemble[i].uniqueid.split(":")[0]}\` | ${e.emoji} **__${e.name}__**`).join("\n")}${itemsToDisassemble.length > 10 ? `\n+ ${itemsToDisassemble.length - 10} more` : ""}\nfor ${Object.entries(loot).map((e) => `${items[e[0]].emoji}x${e[1]}`).join(", ")}?`)
                return interaction.reply({ embeds: [Embed], components: [OfferRow], fetchReply: true }).then(msg => {
                        
                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 45000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 45000 });
                    
                    confirm.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        let stats = await query(`SELECT users.items, characters.equipment FROM users JOIN characters ON users.id = characters.id WHERE users.id = ${interaction.user.id}`);
                        stats = {items: JSON.parse(stats[0].items), equipment: JSON.parse(stats[0].equipment)};
                        
                        const itemsToDisassemble = [];
                        const itemIdsToDisassemble = [];
                        const loot = {};

                        const userItems = await query(`Select * FROM weapons WHERE id = '${interaction.user.id}'`);
                        if (!userItems.length) return interaction.reply(`You don't have any items.`);
                        
                        for (const item of userItems) {
                            const fItem = items[item.itemid];
                            
                            if (exclude.includes(item.uniqueid.split(":")[0])) continue;
                            if (fItem.grade === "genesis") continue;
                            if (sellGrade && fItem.grade !== sellGrade) continue;
                            if (sellType && fItem.type !== sellType) continue;
        
                            const ascItem = getAscensionMaterial(fItem.id, items.filter((e) => e.type === "ascension material"));
                            const craftItem = items.find((e) => e.type === "crafting material" && e.grade === fItem.grade);
                            const levelItem = items[fItem.category === "weapon" ? 56 : 57];
                            
                            let exchangeItem = false;
                            if (fItem.grade === "genesis") exchangeItem = items[676];
                            else if (fItem.grade === "mythical") exchangeItem = items[677];
                            else if (fItem.grade === "legendary") exchangeItem = items[678];
            
                            const ascMatsNeeded = Math.round((1/6) * 12 * ((0.5*item.ascension*item.ascension) + (3.5*item.ascension) + 3));
                            const craftMatsNeeded = Math.round((1/6) * 8 * ((0.5*item.ascension*item.ascension) + (3.5*item.ascension) + 3));
                            const levelMatsNeeded = Math.floor(item.level/5000);
        
                            loot[ascItem.id] = (loot[ascItem.id] + ascMatsNeeded) || ascMatsNeeded;
                            loot[craftItem.id] = (loot[craftItem.id] + craftMatsNeeded) || craftMatsNeeded;
                            if (levelMatsNeeded) loot[levelItem.id] = (loot[levelItem.id] + levelMatsNeeded) || levelMatsNeeded;
                            if (exchangeItem) loot[exchangeItem.id] = (loot[exchangeItem.id] + 1) || 1;
        
                            itemsToDisassemble.push(fItem);
                            itemIdsToDisassemble.push(item);
                        };

                        if (itemsToDisassemble.length < 1) return interaction.channel.send(`You need to select at least 1 item.`);

                        // Add loot
                        Object.entries(loot).forEach((e) => {
                            stats.items[e[0]] = stats.items[e[0]] + e[1] || e[1];
                        });
                        
                        await query(`UPDATE characters SET equipment = '${JSON.stringify(stats.equipment)}' WHERE id = ${interaction.user.id}`);
                        await query(`UPDATE users SET items = '${JSON.stringify(stats.items)}' WHERE id = ${interaction.user.id}`);
                        await query(`DELETE FROM weapons WHERE uniqueid IN (${itemIdsToDisassemble.map((e) => `'${e.uniqueid}'`).join(", ")})`);
                        
                        return interaction.channel.send(`Added ${Object.entries(loot).map((e) => `${items[e[0]].emoji}x${e[1]}`).join(", ")}`);
                    });
                    
                    cancel.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        interaction.channel.send("Action cancelled");
                    });
                    
                });

            });
        };

    }
}