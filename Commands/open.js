import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } from "discord.js";
import { db, query } from "../db_handler";
import { items } from "../Modules/items";
import { generateUniqueItemId, showPage } from "../Modules/functions";
import { PageRow } from "../Modules/components";

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

function weightedRandom(options) {
    options = Object.entries(options);

    let weights = [options[0][1]];

    for (let i = 1; i < options.length; i++) {
        weights[i] = options[i][1] + weights[i - 1];
    };

    let random = Math.random() * weights[weights.length - 1];

    for (let i = 0; i < weights.length; i++) {
        if (weights[i] > random) return options[i][0];
    };
};

function rollItems(p, n, c = 0) {
    let x = 0;
    for (let i = 0; i < n; i++) x += Math.floor(Math.random() + p);
    return x + c;
};

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
    name: 'open',
    description: 'open a lootbox',
    execute(interaction) {

        let box = interaction.options.getString('item');

        let amount = interaction.options.getString('amount') || 1;
        if (!isNaN(amount)) amount = parseInt(amount);
        else if (amount.toLowerCase() === "max") amount = "max";
        else return interaction.reply(`Please input a valid number.`);

        if (box === "lootbox") {
            db.serialize(async () => {
                let stats = await query(`SELECT lootbox FROM users WHERE id = ${interaction.user.id}`);
                stats = stats[0];
                if (!stats?.lootbox) return interaction.reply("You don't have any lootboxes left");

                if (amount === "max") amount = stats.lootbox;
                if (amount < 1) return interaction.reply(`You can't open ${amount} lootboxes.`);
                if (amount > 1000) return interaction.reply(`You can't open more than 1000 lootboxes at once.`);
                if (amount > stats.lootbox) return interaction.reply(`You don't have ${amount} lootboxes`);

                let addCoins = 0;
                for (let i = 0; i < amount; i++) addCoins += Math.floor(248 + (270 * Math.random()) + (210 * Math.floor(Math.random() + 0.2)));

                let addShards = {
                    "ss": rollItems(0.17, 2 * amount),
                    "s": rollItems(0.12, 3 * amount),
                    "a": rollItems(0.19, 3 * amount),
                    "b": rollItems(0.18, 4 * amount),
                    "c": rollItems(0.2, 5 * amount),
                    "d": rollItems(0.25, 8 * amount, 1 * amount),
                };
                let addTickets = {
                    "ss": rollItems(0.05, 1 * amount),
                    "s": rollItems(0.08, 2 * amount),
                    "a": rollItems(0.15, 2 * amount),
                    "b": rollItems(0.2, 3 * amount),
                    "c": rollItems(0.3, 3 * amount),
                    "d": rollItems(0.5, 3 * amount, 1 * amount),
                };

                let obtShards = Object.entries(addShards).filter((e) => e[1]);
                let obtTickets = Object.entries(addTickets).filter((e) => e[1]);

                let shardEmojis = { "ss": "<:ss_shard:917203009543503892>", "s": "<:s_shard:917202925514817566>", "a": "<:a_shard:917202904862052392>", "b": "<:b_shard:917202862851899392>", "c": "<:c_shard:917202862499582002>", "d": "<:d_shard:917202840563363891>" };
                let ticketEmojis = { "ss": "<:ss_ticket:927503239396622336>", "s": "<:s_ticket:927642487705722890>", "a": "<:a_ticket:929420377946472508>", "b": "<:b_ticket:929420396535615519>", "c": "<:c_ticket:929420424645853214>", "d": "<:d_ticket:929420447102152714>" };

                let shardmsg = obtShards.map((e) => `${e[1]}x ${shardEmojis[e[0]]}`).join(", ");
                let ticketmsg = obtTickets.map((e) => `${e[1]}x ${ticketEmojis[e[0]]}`).join(", ");

                await query(`UPDATE users SET lootbox = lootbox - ${amount}, coins = coins + ${addCoins}, ssshard = ssshard + ${addShards["ss"]}, sshard = sshard + ${addShards["s"]}, ashard = ashard + ${addShards["a"]}, bshard = bshard + ${addShards["b"]}, cshard = cshard + ${addShards["c"]}, dshard = dshard + ${addShards["d"]}, ssticket = ssticket + ${addTickets["ss"]}, sticket = sticket + ${addTickets["s"]}, aticket = aticket + ${addTickets["a"]}, bticket = bticket + ${addTickets["b"]}, cticket = cticket + ${addTickets["c"]}, dticket = dticket + ${addTickets["d"]} WHERE id = ${interaction.user.id}`);

                return interaction.reply(`You've opened a lootbox! <a:MikuGold:942200295855890483>\n**Coins**: ${addCoins}<:coins:872926669055356939>\n**Shards**: ${shardmsg}\n**Tickets**: ${ticketmsg}`);
            });
        } else {
            const chest = items[box];
            db.serialize(async () => {
                await interaction.deferReply().catch(() => {
                    return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
                });

                let inv = await query(`SELECT items, genesispity FROM users WHERE users.id = ${interaction.user.id}`);
                let genesispity = inv[0].genesispity;
                inv = JSON.parse(inv[0].items);
                if (!inv[chest.id]) return interaction.editReply(`You don't have any **${chest.name}** left`);

                // Amount to open
                if (amount === "max") amount = inv[chest.id];
                if (amount < 1) return interaction.editReply(`You can't open ${amount} chests.`);
                if (amount > 100) return interaction.editReply(`You can't open more than 100 chests at once.`);
                if (amount > inv[chest.id]) return interaction.editReply(`You don't have ${amount} chests`);

                // Remove chests
                inv[chest.id] -= amount;

                // Add exchange points
                if (chest.id === 458) inv[677] = (inv[677] + amount) || amount; // Deluxe Chest adds mythical points
                if (chest.id === 457) inv[678] = (inv[678] + amount) || amount; // Royal Chest adds Legendary points

                // Update item inv
                await query(`UPDATE users SET items = '${JSON.stringify(inv)}' WHERE id = ${interaction.user.id}`);

                // Read existing items
                let existing = await query(`SELECT uniqueid FROM weapons WHERE id = ${interaction.user.id}`);
                existing = existing.map((e) => e.uniqueid);

                // Generate drops
                const drops = [];
                for (let j = 0; j < chest.drops * amount; j++) {
                    let grade = weightedRandom(chest.droprates);
                    if (chest.id === 458 && j % 6 === 0 && ++genesispity >= 24) grade = "genesis";
                    if (chest.id === 458 && grade === "genesis") genesispity = 0;
                    const fItems = items.filter((e) => e.obtain.includes("chest") && e.grade === grade);
                    drops.push(fItems[Math.floor(Math.random() * fItems.length)]);

                    // Write to database
                    let uid = generateUniqueItemId(interaction.user.id, existing);
                    existing.push(uid + ":" + interaction.user.id);
                    drops[j].uid = uid;
                    await query(`INSERT INTO weapons (id, itemid, uniqueid, item_type) VALUES (${interaction.user.id}, ${drops[j].id}, '${uid + ":" + interaction.user.id}', '${drops[j].category}')`, 'run');
                };
                drops.sort((a, b) => a.gradeValue - b.gradeValue);

                // Update genesispity
                await query(`UPDATE users SET genesispity = ${genesispity} WHERE id = ${interaction.user.id}`);

                let page = 0;

                const Embed = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setTitle(`You've opened a **${chest.name}**!`)
                    .setThumbnail(chest.image2)
                    .setImage(drops[page].image)
                    .setDescription(`You've found **${drops[page].name}**!\n**Grade**: ${drops[page].gradeEmote}\n**Type**: ${drops[page].type[0].toUpperCase() + drops[page].type.slice(1)}\n**ID**: \`${drops[page].uid}\``)
                    .setFooter({ text: `Page ${page + 1}/${drops.length}` });
                return interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then((msg) => {
                    const next = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 60000 });

                    next.on('collect', (r) => {
                        // Next Page
                        if ((r.customId === "next") && (page < drops.length - 1)) {
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
                                .setTitle(`You've opened a **${chest.name}**!`)
                                .setThumbnail(chest.image2)
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

        };

    },
};