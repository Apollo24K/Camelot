/* eslint-disable no-unused-vars */
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } from "discord.js";
import { db, query } from "../db_handler";
import { monthlyShopItems } from "../Modules/monthlyShopItems";

const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('highlighted')
            .setEmoji("<a:EXTRA:1138530846144462968>")
            .setLabel("Highlighted")
            .setStyle('Primary'),
        new ButtonBuilder()
            .setCustomId('materials')
            .setEmoji("<:goblin_mask:1046080758466490398>")
            .setLabel("Materials")
            .setStyle('Secondary'),
        new ButtonBuilder()
            .setCustomId('tickets')
            .setEmoji("<:ss_ticket:927503239396622336>")
            .setLabel("Tickets")
            .setStyle('Secondary'),
        new ButtonBuilder()
            .setCustomId('chests')
            .setEmoji("<:deluxe_chest_open:1069301266301337740>")
            .setLabel("Chests")
            .setStyle('Secondary'),
    );

const row2 = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('premium')
            .setEmoji("💎")
            .setLabel("Premium")
            .setStyle('Primary'),
    );

module.exports = {
    name: 'monthly',
    description: 'Monthly Shop',
    execute(interaction) {

        db.serialize(async () => {
            const { 0: stats } = await query(`SELECT coins, gems, items, monthlyshop FROM users WHERE id = ${interaction.user.id}`);
            stats.items = JSON.parse(stats.items);
            stats.monthlyshop = JSON.parse(stats.monthlyshop);

            function formatItems(section) {
                return monthlyShopItems.filter((e) => e.section === section).map((e) => `\`${e.amount - (stats.monthlyshop[e.id] ?? 0)}/${e.amount}\` - ${e.displayName} ➜ **${e.displayPrice}**`).join("\n");
            };

            const Embeds = {
                "highlighted": new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                    .setDescription(
                        `## Monthly Shop\nWelcome to the monthly shop to buy limited resources!\nUse \`/buy monthly <item>\` to buy.\n` +
                        `### Premium\n${formatItems("Freemium")}\n` +
                        `### EX Pulls\n${formatItems("EX Pulls")}\n` +
                        `### Kernel\n${formatItems("Kernel")}`
                    ),
                "tickets": new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                    .setDescription(
                        `## Monthly Shop\nWelcome to the monthly shop to buy limited resources!\nUse \`/buy monthly <item>\` to buy.\n` +
                        `### Tickets\n${formatItems("Tickets")}`
                    ),
                "chests": new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                    .setDescription(
                        `## Monthly Shop\nWelcome to the monthly shop to buy limited resources!\nUse \`/buy monthly <item>\` to buy.\n` +
                        `### Chests\n${formatItems("Chests")}`
                    ),
                "materials": new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                    .setDescription(
                        `## Monthly Shop\nWelcome to the monthly shop to buy limited resources!\nUse \`/buy monthly <item>\` to buy.\n` +
                        `### Ascension Materials (200 <:coins:872926669055356939> each)\n` +
                        monthlyShopItems.filter((e) => e.section === "Ascension Materials").map((e) => `\`${e.amount - (stats.monthlyshop[e.id] ?? 0)}/${e.amount}\` ${e.displayName}`).join(", ") +
                        `\n### Shards\n${formatItems("Shards")}`
                    ),
                "premium": new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                    .setDescription(
                        `## Monthly Shop\nWelcome to the monthly shop to buy limited resources!\nUse \`/buy monthly <item>\` to buy.\n` +
                        `### Premium\n${formatItems("Premium")}` +
                        `\n\n<:info:1131679799207796756> You can see all perks on our [Patreon](<https://www.patreon.com/cmlt/membership>). Prices might differ depending on your country and currency.`
                    ),
            };

            return interaction.reply({ embeds: [Embeds.highlighted], components: [row, row2] }).then((msg) => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 120000 });

                collector.on('collect', async r => {
                    if (Embeds[r.customId]) interaction.editReply({ embeds: [Embeds[r.customId]] });
                });
            });
        });

    },
};
