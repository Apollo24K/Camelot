import { EmbedBuilder, ComponentType } from "discord.js";
import { db, query } from "../db_handler";
import { items } from "../Modules/items";
import { filterItems } from "../Modules/functions";
import { OfferRow } from "../Modules/components";
import { dailies } from "../Modules/dailyQuests";

module.exports = {
    name: 'disassemble',
    description: 'disassemble items',
    execute(interaction) {

        const choice = [...new Set((interaction.options.getString('items') || "").split(",").map((e) => e.trim()))];
        const exclude = [...new Set((interaction.options.getString('exclude') || "").split(",").map((e) => e.trim()))];
        const sellGrade = interaction.options.getString('grade') || false;
        const sellType = interaction.options.getString('type') || false;
        const sellDupes = interaction.options.getBoolean('dupes') || false;

        db.serialize(async () => {
            const userItems = await query(`Select * FROM weapons WHERE id = '${interaction.user.id}'`);
            if (!userItems.length) return interaction.reply(`You don't have any items.`);

            if (sellDupes) {
                userItems.sort((a, b) => items[a.itemid].name.localeCompare(items[b.itemid].name) || a.level - b.level);
                let len = userItems.length;
                while (len--) {
                    if (items[userItems[len - 1]?.itemid]?.name === items[userItems[len].itemid].name) {
                        exclude.push(userItems[len--].uniqueid.split(":")[0]);
                        while (items[userItems[len - 1]?.itemid]?.name === items[userItems[len].itemid].name) len--;
                    } else exclude.push(userItems[len].uniqueid.split(":")[0]);
                };
            };

            const { 0: lock } = await query(`SELECT itemlock FROM users WHERE id = ${interaction.user.id}`);

            const { itemsToDisassemble, itemIdsToDisassemble, loot } = filterItems(userItems, choice, [...exclude, ...JSON.parse(lock.itemlock)], sellGrade, sellType);
            if (itemsToDisassemble.length < 1) return interaction.reply(`You need to select at least 1 item.`);

            const Embed = new EmbedBuilder()
                .setTitle("Disassemble Items")
                .setColor(0xbbffff)
                .setDescription(`Do you want to disassemble\n${itemsToDisassemble.slice(0, 10).map((e, i) => `${e.bar}\`${itemIdsToDisassemble[i].uniqueid.split(":")[0]}\` | ${e.emoji} **__${e.name}__**`).join("\n")}${itemsToDisassemble.length > 10 ? `\n+ ${itemsToDisassemble.length - 10} more` : ""}\nfor ${Object.entries(loot).map((e) => `${items[e[0]].emoji}x${e[1]}`).join(", ")}?`);
            return interaction.reply({ embeds: [Embed], components: [OfferRow], fetchReply: true }).then(msg => {

                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 45000 });

                collector.on('collect', async r => {
                    collector.stop();
                    if (r.customId === "cancel") return interaction.channel.send("Action cancelled");

                    let stats = await query(`SELECT users.items, users.equipment FROM users JOIN characters ON users.id = characters.id WHERE users.id = ${interaction.user.id}`);
                    stats = { items: JSON.parse(stats[0].items), equipment: JSON.parse(stats[0].equipment) };

                    const userItems = await query(`Select * FROM weapons WHERE id = '${interaction.user.id}'`);
                    if (!userItems.length) return interaction.reply(`You don't have any items.`);

                    const { itemsToDisassemble, itemIdsToDisassemble, loot } = filterItems(userItems, choice, [...exclude, ...JSON.parse(lock.itemlock)], sellGrade, sellType, stats);
                    if (itemsToDisassemble.length < 1) return interaction.channel.send(`You need to select at least 1 item.`);

                    // Add loot
                    Object.entries(loot).forEach((e) => {
                        stats.items[e[0]] = stats.items[e[0]] + e[1] || e[1];
                    });

                    await query(`UPDATE users SET items = '${JSON.stringify(stats.items)}', equipment = '${JSON.stringify(stats.equipment)}' WHERE id = ${interaction.user.id}`);
                    await query(`DELETE FROM weapons WHERE uniqueid IN (${itemIdsToDisassemble.map((e) => `'${e.uniqueid}'`).join(", ")})`);

                    interaction.channel.send(`Added ${Object.entries(loot).map((e) => `${items[e[0]].emoji}x${e[1]}`).join(", ")}`);

                    // Dailies
                    dailies[11].update(interaction, itemsToDisassemble.length); // Parting Pieces
                });

            });

        });

    }
};