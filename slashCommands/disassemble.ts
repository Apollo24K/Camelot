import { EmbedBuilder, ComponentType } from "discord.js";
import { items } from "../Modules/items";
import { filterItems } from "../Modules/functions";
import { OfferRow } from "../Modules/components";
import { dailies } from "../Modules/dailyQuests";
import { SlashCommand } from "../types";
import { deleteWeapons, getUserSchema, getUserWeapons, updateUsers } from "../Modules/queries";

const exportCommand: SlashCommand = {
    name: 'disassemble',
    async execute({ interaction, author }) {

        const choice = [...new Set((interaction.options.getString('items') || "").split(",").map((e) => e.trim()))].filter(Boolean);
        const exclude = [...new Set((interaction.options.getString('exclude') || "").split(",").map((e) => e.trim()))].filter(Boolean);
        const sellGrade = interaction.options.getString('grade') || false;
        const sellType = interaction.options.getString('type') || false;
        const sellDupes = interaction.options.getBoolean('dupes') || false;

        const userItems = await getUserWeapons(interaction.user.id);
        if (!userItems.length) return interaction.reply(`You don't have any items.`);

        if (sellDupes) {
            userItems.sort((a, b) => items[a.itemid].name.localeCompare(items[b.itemid].name) || a.level - b.level);
            let len = userItems.length;
            while (len--) {
                // Exclude rings
                if (items[userItems[len - 1]?.itemid]?.category === "ring") {
                    exclude.push(userItems[len].uniqueid.split(":")[0]);
                    continue;
                };

                // Exclude dupes
                if (items[userItems[len - 1]?.itemid]?.name === items[userItems[len].itemid].name) {
                    exclude.push(userItems[len--].uniqueid.split(":")[0]);
                    while (items[userItems[len - 1]?.itemid]?.name === items[userItems[len].itemid].name) len--;
                } else exclude.push(userItems[len].uniqueid.split(":")[0]);
            };
        };

        const { itemsToDisassemble, itemIdsToDisassemble, loot } = filterItems(userItems, choice, [...exclude, ...author.schema.itemlock], sellGrade, sellType);
        if (itemsToDisassemble.length < 1) return interaction.reply(`You need to select at least 1 item.`);

        const Embed = new EmbedBuilder()
            .setTitle("Disassemble Items")
            .setColor(0xbbffff)
            .setDescription(`Do you want to disassemble\n${itemsToDisassemble.slice(0, 10).map((e, i) => `${e.bar}\`${itemIdsToDisassemble[i].uniqueid.split(":")[0]}\` | ${e.emoji} **__${e.name}__**`).join("\n")}${itemsToDisassemble.length > 10 ? `\n+ ${itemsToDisassemble.length - 10} more` : ""}\nfor ${Object.entries(loot).map((e) => `${items[parseInt(e[0])].emoji}x${e[1]}`).join(", ")}?`);
        return interaction.reply({ embeds: [Embed], components: [OfferRow] }).then(msg => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 45000 });

            collector.on('collect', async r => {
                collector.stop();
                if (r.customId === "cancel") {
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                    return;
                };

                const stats = await getUserSchema(interaction.user.id);
                if (!stats) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have any items.`);
                    return;
                };

                const userItems = await getUserWeapons(interaction.user.id);
                if (!userItems.length) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have any items.`);
                    return;
                };

                const { itemsToDisassemble, itemIdsToDisassemble, loot } = filterItems(userItems, choice, [...exclude, ...stats.itemlock], sellGrade, sellType, stats);
                if (itemsToDisassemble.length < 1) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`You need to select at least 1 item.`);
                    return;
                };

                await deleteWeapons(itemIdsToDisassemble.map((e) => e.uniqueid));

                // Update users table
                await updateUsers(interaction.user.id, {
                    items: { type: "merge_json", value: loot },
                });

                if (interaction.channel?.isSendable()) interaction.channel.send(`Added ${Object.entries(loot).map((e) => `${items[parseInt(e[0])].emoji}x${e[1]}`).join(", ")}`);

                // Dailies
                dailies[11].update(interaction, interaction.client, itemsToDisassemble.length); // Parting Pieces
            });
        });
    }
};

export default exportCommand;
