const { MessageEmbed } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { items } = require("../Modules/items.js");
const { filterItems } = require("../Modules/functions.js");
const { OfferRow } = require("../Modules/components.js");

module.exports = {
    name: 'disassemble',
	description: 'disassemble items',
	execute(interaction) {

        const choice = [...new Set((interaction.options.getString('items') || "").split(",").map((e)=> e.trim()))];
        const exclude = [...new Set((interaction.options.getString('exclude') || "").split(",").map((e)=> e.trim()))];
        const sellGrade = interaction.options.getString('grade') || false;
        const sellType = interaction.options.getString('type') || false;
        
        db.serialize(async () => {
            const userItems = await query(`Select * FROM weapons WHERE id = '${interaction.user.id}'`);
            if (!userItems.length) return interaction.reply(`You don't have any items.`);
            
            const { itemsToDisassemble, itemIdsToDisassemble, loot } = filterItems(userItems, choice, exclude, sellGrade, sellType);
            if (itemsToDisassemble.length < 1) return interaction.reply(`You need to select at least 1 item.`);

            const Embed = new MessageEmbed()
            .setTitle("Disassemble Items")
            .setColor(0xbbffff)
            .setDescription(`Do you want to disassemble\n${itemsToDisassemble.slice(0,10).map((e, i) => `${e.bar}\`${itemIdsToDisassemble[i].uniqueid.split(":")[0]}\` | ${e.emoji} **__${e.name}__**`).join("\n")}${itemsToDisassemble.length > 10 ? `\n+ ${itemsToDisassemble.length - 10} more` : ""}\nfor ${Object.entries(loot).map((e) => `${items[e[0]].emoji}x${e[1]}`).join(", ")}?`)
            return interaction.reply({ embeds: [Embed], components: [OfferRow], fetchReply: true }).then(msg => {
                    
                const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 45000 });
                const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 45000 });
                
                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();
                    let stats = await query(`SELECT users.items, characters.equipment FROM users JOIN characters ON users.id = characters.id WHERE users.id = ${interaction.user.id}`);
                    stats = {items: JSON.parse(stats[0].items), equipment: JSON.parse(stats[0].equipment)};

                    const userItems = await query(`Select * FROM weapons WHERE id = '${interaction.user.id}'`);
                    if (!userItems.length) return interaction.reply(`You don't have any items.`);

                    const { itemsToDisassemble, itemIdsToDisassemble, loot } = filterItems(userItems, choice, exclude, sellGrade, sellType, stats);
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
                
                cancel.on('collect', async () => {
                    confirm.stop(), cancel.stop();
                    interaction.channel.send("Action cancelled");
                });
                
            });

        });

    }
}