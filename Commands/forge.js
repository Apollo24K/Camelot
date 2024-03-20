const { EmbedBuilder, ComponentType } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { items } = require("../Modules/items.js");
const { PageRow, OfferRow } = require("../Modules/components.js");
const { showPage, customEmojis, getAscensionMaterial, searchItem, generateUniqueItemId, generateSubstats } = require("../Modules/functions.js");

function forgeryEmbed(elements) {
    const Embed = new EmbedBuilder()
        .setColor(0xbbffff)
        .setTitle("Gaius' Forgery")
        .setThumbnail("https://i.imgur.com/WbPCBqR.png")
        .setDescription("Welcome, honored one. What would you like me to do today?\n(Use `/forge <item>` to forge an item)\n");
    for (let i = 0; i < elements.length; i++) {
        const ascItem = getAscensionMaterial(elements[i].id, ascMaterials);
        const craftItem = items.find((e) => e.type === "crafting material" && e.grade === elements[i].grade);
        Embed.addFields(
            { name: `${elements[i].gradeEmote}`, value: `${elements[i].bar} ${elements[i].emoji} | ${elements[i].name}`, inline: true },
            { name: `Cost: ${craftItem.emoji}x24 ${ascItem.emoji}x36`, value: `\`${elements[i].psmin}-${elements[i].psmax}\` ${customEmojis[elements[i].primaryStat] || elements[i].primaryStat}${elements[i].category === "weapon" ? ` and \`${elements[i].ssmin.endsWith("%") ? elements[i].ssmin.slice(0, -1) : elements[i].ssmin}-${elements[i].ssmax}\` ${customEmojis[elements[i].secondaryStat] || elements[i].secondaryStat}` : ""}`, inline: true },
            { name: '_ _', value: '_ _', inline: true },
        );
    }
    return Embed;
};

const ascMaterials = items.filter((e) => e.type === "ascension material");

module.exports = {
    name: 'forge',
    description: 'forge items',
    execute(interaction) {

        let item = interaction.options.getString('item');
        let grade = interaction.options.getString('grade');
        let page = interaction.options.getInteger('page');

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

            return interaction.reply({ embeds: [forgeryEmbed(showItems).setFooter({ text: `Page ${currPage}/${pagesTotal}` })], components: [PageRow], fetchReply: true }).then(msg => {
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
        if (!fItem?.name) return;

        // Return if it's not craftable
        if (!itemsR.includes(fItem)) return interaction.reply(`You can't craft ${fItem.emoji} **__${fItem.name}__**`);

        db.serialize(async () => {
            let stats = await query(`SELECT items FROM users WHERE users.id = ${interaction.user.id}`);
            stats = { items: JSON.parse(stats[0].items) };

            const ascItem = getAscensionMaterial(fItem.id, ascMaterials);
            const craftItem = items.find((e) => e.type === "crafting material" && e.grade === fItem.grade);

            // Check if the user has the required mats
            if ((stats.items[ascItem.id] || 0) < 36) return interaction.reply(`You don't have enough of ${ascItem.emoji} **__${ascItem.name}__** (**${stats.items[ascItem.id] || 0}**/${36})`);
            if ((stats.items[craftItem.id] || 0) < 24) return interaction.reply(`You don't have enough of ${craftItem.emoji} **__${craftItem.name}__** (**${stats.items[craftItem.id] || 0}**/${24})`);

            const Embed = new EmbedBuilder()
                .setTitle("Gaius' Forgery")
                .setColor(0xbbffff)
                .setDescription(`Let me confirm your order:\n**1x** ${fItem.emoji} **__${fItem.name}__**\nfor ${craftItem.emoji}**x24** & ${ascItem.emoji}**x36**?`)
                .setThumbnail("https://i.imgur.com/WbPCBqR.png");
            interaction.reply({ embeds: [Embed], components: [OfferRow], fetchReply: true }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 30000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 30000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();
                    stats = await query(`SELECT items FROM users WHERE users.id = ${interaction.user.id}`);
                    stats = { items: JSON.parse(stats[0].items) };

                    // Check if the user has the required mats
                    if ((stats.items[ascItem.id] || 0) < 36) return interaction.channel.send(`You don't have enough of ${ascItem.emoji} **__${ascItem.name}__** (**${stats.items[ascItem.id] || 0}**/${36})`);
                    if ((stats.items[craftItem.id] || 0) < 24) return interaction.channel.send(`You don't have enough of ${craftItem.emoji} **__${craftItem.name}__** (**${stats.items[craftItem.id] || 0}**/${24})`);

                    // Remove mats
                    stats.items[ascItem.id] -= 36;
                    stats.items[craftItem.id] -= 24;

                    await query(`UPDATE users SET items = '${JSON.stringify(stats.items)}' WHERE id = ${interaction.user.id}`);

                    // Read existing items
                    let existing = await query(`SELECT uniqueid FROM weapons`);
                    existing = existing.map((e) => e.uniqueid);

                    // Write to database
                    let uid = generateUniqueItemId(interaction.user.id, existing);
                    await query(`INSERT INTO weapons (id, itemid, uniqueid${fItem.category === "armor" ? ", substats" : ""}) VALUES (${interaction.user.id}, ${fItem.id}, '${uid + ":" + interaction.user.id}'${fItem.category === "armor" ? ", '" + JSON.stringify(generateSubstats()) + "'" : ""})`, 'run');

                    interaction.channel.send(`Successfully crafted ${fItem.emoji} **__${fItem.name}__**!`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    interaction.channel.send("Action cancelled");
                });

            });

        });

    },
};