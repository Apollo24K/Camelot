import { collectComponentUpdates } from "../Modules/buttonInteractions";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ContainerBuilder, MessageFlags } from "discord.js";
import { formatNumberWithQuotes, rarityColor } from "../Modules/functions";
import { getLatestAuction, getUserSchema, insertNewAuctionBid, updateUsersAndCache } from "../Modules/queries";
import { SlashCommand } from '../types';
import { characters } from "../Modules/chars";
import { OfferRow } from "../Modules/components";

const exportCommand: SlashCommand = {
    name: 'auction',
    async execute({ interaction, author }) {

        const bidAmount = interaction.options.getInteger('bid');

        const auction = await getLatestAuction();
        if (!auction) return interaction.reply("No auction found");
        if (new Date(auction.ends_at || new Date()) <= new Date()) return interaction.reply("No active auction found, please try again later");
        if (auction.type !== "char") return interaction.reply("Currently only character auctions are supported");

        const auctionedChar = characters[auction.itemid];
        if (!auctionedChar) return interaction.reply("Character not found");

        // If no bid
        if (!bidAmount) {
            const Container = new ContainerBuilder()
                .setAccentColor(rarityColor(auctionedChar.rarity))
                .addSectionComponents(section => section
                    .addTextDisplayComponents(text => text
                        .setContent(
                            `-# <:auction:1490459181956726784> Ongoing Auction` +
                            `\n### **${auctionedChar.name}**${auction.print ? `#${auction.print}` : ""}` +
                            `\n<@&1490459581443342336>`
                        )
                    )
                    .setThumbnailAccessory(thumbnail => thumbnail.setURL(auctionedChar.rarityImageSquare))
                )
                .addMediaGalleryComponents(media => media
                    .addItems(item => item.setURL(auctionedChar.image))
                )
                .addSectionComponents(section => section
                    .addTextDisplayComponents(text => text
                        .setContent(
                            `-# Bid using \`/auction bid\`` +
                            `\n-# Ends in: <t:${Math.floor(new Date((auction && auction.ends_at) ? auction.ends_at : new Date()).getTime() / 1000)}:R>`
                        )
                    )
                    .setButtonAccessory(button => button
                        .setCustomId(`auction_help`)
                        .setLabel('Rules')
                        .setEmoji({ id: '1506327355608662036' })
                        .setStyle(ButtonStyle.Secondary)
                    )
                );

            return interaction.reply({ components: [Container], flags: MessageFlags.IsComponentsV2 });
        };

        // Process bid
        if (bidAmount < 100) return interaction.reply({ ephemeral: true, content: `You can't bid less than ${formatNumberWithQuotes(100)} coins` });
        const feeAmount = Math.ceil(bidAmount * 0.03);

        return interaction.reply({ ephemeral: true, content: `Are you sure you want to bid **${formatNumberWithQuotes(bidAmount)}**<:coins:872926669055356939> on **${auctionedChar.name}**${auction.print ? `#${auction.print}` : ""}?\n-# Fee: **${formatNumberWithQuotes(feeAmount)}**<:coins:872926669055356939> (**3%** of your bid)`, components: [OfferRow] }).then((msg) => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 60_000 });

            collectComponentUpdates(collector, async (r) => {
                collector.stop();
                if (r.customId === "cancel") return;

                // Check user balance again
                const stats = await getUserSchema(interaction.user.id);
                if (!stats || stats.coins < feeAmount) return interaction.followUp({ ephemeral: true, content: `You don't have enough coins to bid\n-# Fee: **${formatNumberWithQuotes(feeAmount)}**<:coins:872926669055356939> (**3%** of your bid)` });

                // Place the bid
                try {
                    const bid = await insertNewAuctionBid(auction.rowid, interaction.user.id, bidAmount);
                    if (!bid) return interaction.followUp({ ephemeral: true, content: `You already have a higher bid than this` });
                } catch (error) {
                    console.error(error);
                    return interaction.followUp({ ephemeral: true, content: `Failed to place your bid, please try again later` });
                };

                // Update user coins
                await updateUsersAndCache(interaction.client, interaction.user.id, {
                    updates: {
                        coins: { type: 'increment', value: -feeAmount },
                    },
                });

                // Send confirmation message
                return interaction.followUp({ ephemeral: true, content: `Bid placed successfully!` });
            });
        });

    },
};

export default exportCommand;
