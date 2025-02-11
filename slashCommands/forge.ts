import { EmbedBuilder, ComponentType } from "discord.js";
import { armorInfo, itemInfo, items, lootInfo, weaponInfo } from "../Modules/items";
import { PageRow, OfferRow } from "../Modules/components";
import { showPage, customEmojis, getAscensionMaterial, searchItem } from "../Modules/functions";
import { ItemRarity, SlashCommand } from "../types";
import { getUserSchema, insertNewWeapon, updateUsers } from "../Modules/queries";

function forgeryEmbed(elements: (itemInfo)[]) {
    const Embed = new EmbedBuilder()
        .setColor(0xbbffff)
        .setTitle("Gaius' Forgery")
        .setThumbnail("https://i.imgur.com/WbPCBqR.png")
        .setDescription("Welcome, honored one. What would you like me to do today?\n(Use `/forge <item>` to forge an item)\n");
    for (let i = 0; i < elements.length; i++) {
        const item = elements[i] as weaponInfo | armorInfo;
        const ascItem = getAscensionMaterial(item.id, ascMaterials);
        const craftItem = items.find((e) => e.type === "crafting material" && e.grade === item.grade) as lootInfo;

        Embed.addFields(
            { name: `${item.gradeEmote}`, value: `${item.bar} ${item.emoji} | ${item.name}`, inline: true },
            { name: `Cost: ${craftItem.emoji}x24 ${ascItem.emoji}x36`, value: `\`${item.psmin}-${item.psmax}\` ${customEmojis[item.primaryStat] || item.primaryStat}${item instanceof weaponInfo ? ` and \`${item.ssmin.endsWith("%") ? item.ssmin.slice(0, -1) : item.ssmin}-${item.ssmax}\` ${customEmojis[item.secondaryStat] || item.secondaryStat}` : ""}`, inline: true },
            { name: '_ _', value: '_ _', inline: true },
        );
    };
    return Embed;
};

const ascMaterials = items.filter((e) => e.type === "ascension material");

const exportCommand: SlashCommand = {
    name: 'forge',
    async execute({ interaction, author }) {

        let item = interaction.options.getString('item');
        let grade = interaction.options.getString('grade') as Omit<ItemRarity, "genesis" | "mythical"> | null;
        let page = interaction.options.getInteger('page') || 1;

        const itemsR = items.filter((e) => e.obtain.includes("crafting") && ((grade && !item) ? e.grade === grade : true));
        itemsR.sort((a, b) => a.gradeValue - b.gradeValue);

        if (!item) {
            // Setup Pages
            let elementsPerPage = 7;
            let pagesTotal = Math.ceil(itemsR.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            // Filter items to show on the current page
            let showItems = showPage(currPage, itemsR, elementsPerPage);

            return interaction.reply({ embeds: [forgeryEmbed(showItems).setFooter({ text: `Page ${currPage}/${pagesTotal}` })], components: [PageRow] }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 120000 });

                collector.on('collect', async r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    showItems = showPage(currPage, itemsR, elementsPerPage);
                    interaction.editReply({ embeds: [forgeryEmbed(showItems).setFooter({ text: `Page ${currPage}/${pagesTotal}` })], components: [PageRow] });
                });
            });
        };

        // Find the item
        const fItem = searchItem(item, interaction);
        if (!fItem) return;

        // Return if it's not craftable
        if (!itemsR.includes(fItem)) return interaction.reply(`You can't craft ${fItem.emoji} **__${fItem.name}__**`);

        const stats = author.schema;

        const ascItem = getAscensionMaterial(fItem.id, ascMaterials);
        const craftItem = items.find((e) => e.type === "crafting material" && e.grade === fItem.grade);
        if (!craftItem) return interaction.reply(`Error: Unknown crafting material`);

        // Check if the user has the required mats
        if ((stats.items[ascItem.id] || 0) < 36) return interaction.reply(`You don't have enough of ${ascItem.emoji} **__${ascItem.name}__** (**${stats.items[ascItem.id] || 0}**/${36})`);
        if ((stats.items[craftItem.id] || 0) < 24) return interaction.reply(`You don't have enough of ${craftItem.emoji} **__${craftItem.name}__** (**${stats.items[craftItem.id] || 0}**/${24})`);

        const Embed = new EmbedBuilder()
            .setTitle("Gaius' Forgery")
            .setColor(0xbbffff)
            .setDescription(`Let me confirm your order:\n**1x** ${fItem.emoji} **__${fItem.name}__**\nfor ${craftItem.emoji}**x24** & ${ascItem.emoji}**x36**?`)
            .setThumbnail("https://i.imgur.com/WbPCBqR.png");
        return interaction.reply({ embeds: [Embed], components: [OfferRow] }).then(msg => {

            const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 30000 });
            const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 30000 });

            confirm.on('collect', async () => {
                confirm.stop(), cancel.stop();
                const stats = await getUserSchema(interaction.user.id);
                if (!stats) {
                    if (interaction.channel?.isSendable()) interaction.channel.send("Couldn't find user");
                    return;
                };

                // Check if the user has the required mats
                if ((stats.items[ascItem.id] || 0) < 36) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough of ${ascItem.emoji} **__${ascItem.name}__** (**${stats.items[ascItem.id] || 0}**/${36})`);
                    return;
                };
                if ((stats.items[craftItem.id] || 0) < 24) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough of ${craftItem.emoji} **__${craftItem.name}__** (**${stats.items[craftItem.id] || 0}**/${24})`);
                    return;
                };

                // Update users table
                await updateUsers(interaction.user.id, {
                    items: { type: "merge_json", value: { [ascItem.id]: -36, [craftItem.id]: -24 } },
                });

                // Insert new weapon
                await insertNewWeapon(interaction.user.id, fItem.id, fItem.category);

                if (interaction.channel?.isSendable()) interaction.channel.send(`Successfully crafted ${fItem.emoji} **__${fItem.name}__**!`);
            });

            cancel.on('collect', () => {
                confirm.stop(), cancel.stop();
                if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
            });

        });
    },
};

export default exportCommand;
