import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } from "discord.js";
import { monthlyShopItems } from "../Modules/monthlyShopItems";
import { SlashCommand } from "../types";

const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('highlighted')
            .setEmoji("<a:EXTRA:1138530846144462968>")
            .setLabel("Highlighted")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('materials')
            .setEmoji("<:goblin_mask:1046080758466490398>")
            .setLabel("Materials")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('tickets')
            .setEmoji("<:ss_ticket:927503239396622336>")
            .setLabel("Tickets")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('chests')
            .setEmoji("<:deluxe_chest_open:1069301266301337740>")
            .setLabel("Chests")
            .setStyle(ButtonStyle.Secondary),
    );

const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('premium')
            .setEmoji("💎")
            .setLabel("Premium")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('other')
            .setEmoji("🎐")
            .setLabel("Other")
            .setStyle(ButtonStyle.Secondary),
    );

const exportCommand: SlashCommand = {
    name: 'monthly',
    async execute({ interaction, author }) {

        function formatItems(section: string) {
            return monthlyShopItems.filter((e) => e.section === section).map((e) => `\`${e.amount - (author.schema.monthlyshop[e.id] ?? 0)}/${e.amount}\` - ${e.displayName} ➜ **${e.displayPrice}**`).join("\n");
        };

        const Embeds: Record<string, EmbedBuilder> = {
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
                    monthlyShopItems.filter((e) => e.section === "Ascension Materials").map((e) => `\`${e.amount - (author.schema.monthlyshop[e.id] ?? 0)}/${e.amount}\` ${e.displayName}`).join(", ") +
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
            "other": new EmbedBuilder()
                .setColor(0xbbffff)
                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                .setDescription(
                    `## Monthly Shop\nWelcome to the monthly shop to buy limited resources!\nUse \`/buy monthly <item>\` to buy.\n` +
                    `### Image Credits\n${formatItems("Image Credits")}`
                ),
        };

        return interaction.reply({ embeds: [Embeds.highlighted], components: [row, row2] }).then((msg) => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 120000 });

            collector.on('collect', async r => {
                if (Embeds[r.customId]) interaction.editReply({ embeds: [Embeds[r.customId]] });
            });
        });

    },
};

export default exportCommand;
