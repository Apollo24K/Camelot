import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } from "discord.js";
import { db, query } from "../db_handler";
import { items } from "../Modules/items";
import { showPage, generateUniqueItemId } from "../Modules/functions";
import { PageRow, OfferRow } from "../Modules/components";

const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle('Success'),
        new ButtonBuilder()
            .setCustomId('skip')
            .setLabel('Skip')
            .setStyle('Primary'),
    );

function list(grade, show) {
    const arr = [], t = show.filter((b) => b.grade === grade);
    for (let h = 0; h < t.length; h++) {
        arr.push(t[h].bar + t[h].emoji + " | " + t[h].name + " ➜ `" + t[h].uid + "`");
    };
    return arr;
};

function itemsToShow(show) {
    let desc = "";
    if (show.find((e) => e.grade === "genesis")) desc += "\n\n<:genesis1:1041725784546619502><:genesis2:1041725782176825485><:genesis3:1041725778611675237><:genesis4:1041725780218093629>\n" + list("genesis", show).join("\n");
    if (show.find((e) => e.grade === "mythical")) desc += "\n\n<:mythical1:1041726768530329690><:mythical2:1041726767188168724><:mythical3:1041726765577556039><:mythical4:1041726763862065162>\n" + list("mythical", show).join("\n");
    if (show.find((e) => e.grade === "legendary")) desc += "\n\n<:legendary1:1041726519082491964><:legendary2:1041726517153112094><:legendary3:1041726515475382322><:legendary4:1041726512992366605>\n" + list("legendary", show).join("\n");
    if (show.find((e) => e.grade === "unique")) desc += "\n\n<:unique1:1041730066272493578><:unique2:1041730063940468828><:unique3:1041730061163831437><:unique4:1041730057380573386>\n" + list("unique", show).join("\n");
    if (show.find((e) => e.grade === "rare")) desc += "\n\n<:rare1:1041731092031492106><:rare2:1041731088357281802><:rare3:1041731083965825096>\n" + list("rare", show).join("\n");
    if (show.find((e) => e.grade === "special")) desc += "\n\n<:special1:1041731419963150397><:special2:1041731418008600717><:special3:1041731415919833149><:special4:1041731414032392202>\n" + list("special", show).join("\n");
    if (show.find((e) => e.grade === "normal")) desc += "\n\n<:normal1:1041732429397889054><:normal2:1041732425379762268><:normal3:1041732422145953892><:normal4:1041732419591622686>\n" + list("normal", show).join("\n");
    return desc;
};

module.exports = {
    name: 'merge',
    description: 'merge exchange points',
    execute(interaction) {

        const itemid = interaction.options.getString('rarity');

        let amount = interaction.options.getString('amount') || 1;
        if (!isNaN(amount)) amount = parseInt(amount);
        else if (amount.toLowerCase() === "max") amount = "max";
        else return interaction.reply(`Please input a valid number.`);

        db.serialize(async () => {
            const { 0: stats } = await query(`SELECT items, coins FROM users WHERE id = ${interaction.user.id}`);
            if (!stats) return interaction.reply("It seems you haven't started playing yet");
            stats.items = JSON.parse(stats.items);

            const exchangePoint = items[parseInt(itemid)];
            const unitCost = { "genesis": 4, "mythical": 8, "legendary": 8 }[exchangePoint.grade];
            const unitCoinCost = { "genesis": 10000, "mythical": 2500, "legendary": 1000 }[exchangePoint.grade];

            if (amount === "max") amount = Math.floor(stats.items[exchangePoint.id] / unitCost);
            if (amount > 50) amount = 50;
            if (amount < 1) return interaction.reply(`Amount must be larger than 0`);
            if (!stats.items[exchangePoint.id] || (amount * unitCost > stats.items[exchangePoint.id])) return interaction.reply(`You don't have enough exchange points (**${stats.items[exchangePoint.id] || 0}**/${amount * unitCost} ${exchangePoint.emoji})`);
            if (stats.coins < amount * unitCoinCost) return interaction.reply(`You don't have enough coins (**${stats.coins}**/${amount * unitCoinCost} <:coins:872926669055356939>)`);

            let page = 0;
            const drops = [];
            const Embed = new EmbedBuilder()
                .setColor(0xbbffff);

            return interaction.reply({ content: `Are you sure you want to merge **${amount * unitCost}x** ${exchangePoint.emoji} into **${amount}x** __${exchangePoint.grade}__ items for **${amount * unitCoinCost}** <:coins:872926669055356939>?`, components: [OfferRow], fetchReply: true }).then((msg) => {
                const next = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 60000 });

                next.on('collect', async (r) => {
                    if (r.customId === "cancel") {
                        next.stop();
                        interaction.editReply({ components: [] });
                        interaction.channel.send("Action cancelled");
                        return;
                    };

                    if (r.customId === "confirm") {
                        const { 0: stats } = await query(`SELECT items, coins FROM users WHERE id = ${interaction.user.id}`);
                        if (!stats) return interaction.channel.send("It seems you haven't started playing yet");
                        stats.items = JSON.parse(stats.items);

                        if (amount === "max") amount = Math.floor(stats.items[exchangePoint.id] / unitCost);
                        if (amount > 50) amount = 50;
                        if (amount < 1) return interaction.channel.send(`Amount must be larger than 0`);
                        if (!stats.items[exchangePoint.id] || (amount * unitCost > stats.items[exchangePoint.id])) return interaction.channel.send(`You don't have enough exchange points (**${stats.items[exchangePoint.id] || 0}**/${amount * unitCost} ${exchangePoint.emoji})`);
                        if (stats.coins < amount * unitCoinCost) return interaction.channel.send(`You don't have enough coins (**${stats.coins}**/${amount * unitCoinCost} <:coins:872926669055356939>)`);

                        // Remove exchange points
                        stats.items[exchangePoint.id] = Math.round(stats.items[exchangePoint.id] - (amount * unitCost));

                        // Update item inv
                        await query(`UPDATE users SET coins = coins - ${amount * unitCoinCost}, items = '${JSON.stringify(stats.items)}' WHERE id = ${interaction.user.id}`);

                        // Read existing items
                        let existing = await query(`SELECT uniqueid FROM weapons WHERE id = ${interaction.user.id}`);
                        existing = existing.map((e) => e.uniqueid);

                        // Generate drops
                        for (let j = 0; j < amount; j++) {
                            const fItems = items.filter((e) => e.obtain.includes("chest") && e.grade === exchangePoint.grade);
                            drops.push(fItems[Math.floor(Math.random() * fItems.length)]);

                            // Write to database
                            let uid = generateUniqueItemId(interaction.user.id, existing);
                            existing.push(uid + ":" + interaction.user.id);
                            drops[j].uid = uid;
                            await query(`INSERT INTO weapons (id, itemid, uniqueid, item_type) VALUES (${interaction.user.id}, ${drops[j].id}, '${uid + ":" + interaction.user.id}', ${drops[j].category})`, 'run');
                        };
                        drops.sort((a, b) => a.gradeValue - b.gradeValue);

                        // Edit Embed
                        Embed.setTitle(`You've merged **${amount}** new items!`).setImage(drops[page].image).setFooter({ text: `Page ${page + 1}/${drops.length}` }).setDescription(`You've found **${drops[page].name}**!\n**Grade**: ${drops[page].gradeEmote}\n**Type**: ${drops[page].type[0].toUpperCase() + drops[page].type.slice(1)}\n**ID**: \`${drops[page].uid}\``);
                        return interaction.editReply({ content: "", embeds: [Embed], components: [row] });
                    }

                    // Next Page
                    else if ((r.customId === "next") && (page < drops.length - 1)) {
                        page++;
                        next.resetTimer();
                        Embed.setImage(drops[page].image).setFooter({ text: `Page ${page + 1}/${drops.length}` }).setDescription(`You've found **${drops[page].name}**!\n**Grade**: ${drops[page].gradeEmote}\n**Type**: ${drops[page].type[0].toUpperCase() + drops[page].type.slice(1)}\n**ID**: \`${drops[page].uid}\``);
                        return interaction.editReply({ embeds: [Embed] });
                    } else { // Skip to Summary
                        next.stop();
                        drops.sort((a, b) => b.gradeValue - a.gradeValue);

                        // Setup Pages
                        const elementsPerPage = 10;
                        const pagesTotal = Math.ceil(drops.length / elementsPerPage);
                        let currPage = 1;
                        if (page <= pagesTotal && page > 0) {
                            currPage = page;
                        };

                        // Filter items to show on the current page
                        let showItems = showPage(currPage, drops, elementsPerPage);

                        // Join elements to string
                        let desc = itemsToShow(showItems);

                        const Embed = new EmbedBuilder()
                            .setColor(0xbbffff)
                            .setTitle(`You've merged **${amount}** new items!`)
                            .setDescription(desc)
                            .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                        if (pagesTotal === 1) return interaction.editReply({ embeds: [Embed], components: [] });
                        return interaction.editReply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(() => {
                            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 45000 });

                            collector.on('collect', (rr) => {
                                if (rr.customId === "prev") {
                                    if (currPage > 1) currPage--;
                                    else currPage = pagesTotal;
                                } else {
                                    if (currPage < pagesTotal) currPage++;
                                    else currPage = 1;
                                };

                                showItems = showPage(currPage, drops, elementsPerPage);
                                desc = itemsToShow(showItems);

                                Embed.setDescription(desc).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                                interaction.editReply({ embeds: [Embed] });
                            });
                        });
                    };
                });

            });

        });

    },
};
