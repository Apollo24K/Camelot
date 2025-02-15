import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } from "discord.js";
import { chestInfo, itemInfo, items } from "../Modules/items";
import { showPage } from "../Modules/functions";
import { PageRow } from "../Modules/components";
import { ItemRarity, SlashCommand } from "../types";
import { insertNewWeapon, updateUsers } from "../Modules/queries";

const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('skip')
            .setLabel('Skip')
            .setStyle(ButtonStyle.Primary),
    );

function weightedRandom<T extends string>(options: { [key in T]: number }): T {
    const entries = Object.entries(options) as [T, number][];

    let weights = [entries[0][1]];

    for (let i = 1; i < entries.length; i++) {
        weights[i] = entries[i][1] + weights[i - 1];
    };

    let random = Math.random() * weights[weights.length - 1];

    for (let i = 0; i < weights.length; i++) {
        if (weights[i] > random) return entries[i][0];
    };

    return entries[0][0]; // Fallback return
};

function rollItems(p: number, n: number, c: number = 0) {
    let x = 0;
    for (let i = 0; i < n; i++) x += Math.floor(Math.random() + p);
    return x + c;
};

function list(grade: ItemRarity, show: (itemInfo & { uid?: string; })[]) {
    const arr = [], t = show.filter((b) => b.grade === grade);
    for (let h = 0; h < t.length; h++) {
        arr.push(t[h].bar + t[h].emoji + " | " + t[h].name + " ➜ `" + t[h].uid + "`");
    };
    return arr;
};

function itemsToShow(show: (itemInfo & { uid?: string; })[]) {
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

function getItemPool(grade: ItemRarity, wishlist: number[]) {
    const fItems = items.filter((e) => e.obtain.includes("chest") && e.grade === grade);
    return fItems.reduce((acc, e) => wishlist.includes(e.id) ? [...acc, e.id, e.id] : [...acc, e.id], [] as number[]);
};

function getItemPools(wishlist: number[]) {
    const fIds: Record<ItemRarity, number[]> = {
        "genesis": getItemPool("genesis", wishlist),
        "mythical": getItemPool("mythical", wishlist),
        "legendary": getItemPool("legendary", wishlist),
        "unique": getItemPool("unique", wishlist),
        "rare": getItemPool("rare", wishlist),
        "special": getItemPool("special", wishlist),
        "normal": getItemPool("normal", wishlist),
    };

    return fIds;
};

const exportCommand: SlashCommand = {
    name: 'open',
    async execute({ interaction, author }) {

        const box = interaction.options.getString('item', true);
        const amountFlag = interaction.options.getString('amount') || "1";
        let amount = parseInt(amountFlag) || 1;

        const stats = author.schema;

        if (box === "lootbox") {
            if (!stats.lootbox) return interaction.reply("You don't have any lootboxes left");

            if (amountFlag.toLowerCase() === "max") amount = stats.lootbox;
            if (amount < 1) return interaction.reply(`You can't open ${amount} lootboxes.`);
            if (amount > 1000) return interaction.reply(`You can't open more than 1000 lootboxes at once.`);
            if (amount > stats.lootbox) return interaction.reply(`You don't have ${amount} lootboxes`);

            let addCoins = 0;
            for (let i = 0; i < amount; i++) addCoins += Math.floor(248 + (270 * Math.random()) + (210 * Math.floor(Math.random() + 0.2)));

            const addShards = {
                "ss": rollItems(0.17, 2 * amount),
                "s": rollItems(0.12, 3 * amount),
                "a": rollItems(0.19, 3 * amount),
                "b": rollItems(0.18, 4 * amount),
                "c": rollItems(0.2, 5 * amount),
                "d": rollItems(0.25, 8 * amount, 1 * amount),
            };
            const addTickets = {
                "ss": rollItems(0.05, 1 * amount),
                "s": rollItems(0.08, 2 * amount),
                "a": rollItems(0.15, 2 * amount),
                "b": rollItems(0.2, 3 * amount),
                "c": rollItems(0.3, 3 * amount),
                "d": rollItems(0.5, 3 * amount, 1 * amount),
            };

            const obtShards = Object.entries(addShards).filter((e) => e[1]);
            const obtTickets = Object.entries(addTickets).filter((e) => e[1]);

            const shardEmojis = { "ss": "<:ss_shard:917203009543503892>", "s": "<:s_shard:917202925514817566>", "a": "<:a_shard:917202904862052392>", "b": "<:b_shard:917202862851899392>", "c": "<:c_shard:917202862499582002>", "d": "<:d_shard:917202840563363891>" };
            const ticketEmojis = { "ss": "<:ss_ticket:927503239396622336>", "s": "<:s_ticket:927642487705722890>", "a": "<:a_ticket:929420377946472508>", "b": "<:b_ticket:929420396535615519>", "c": "<:c_ticket:929420424645853214>", "d": "<:d_ticket:929420447102152714>" };

            const shardmsg = obtShards.map((e) => `${e[1]}x ${shardEmojis[e[0] as keyof typeof shardEmojis]}`).join(", ");
            const ticketmsg = obtTickets.map((e) => `${e[1]}x ${ticketEmojis[e[0] as keyof typeof ticketEmojis]}`).join(", ");

            // Update users table
            await updateUsers(interaction.user.id, {
                lootbox: { type: "increment", value: -amount },
                coins: { type: "increment", value: addCoins },
                ssshard: { type: "increment", value: addShards["ss"] },
                sshard: { type: "increment", value: addShards["s"] },
                ashard: { type: "increment", value: addShards["a"] },
                bshard: { type: "increment", value: addShards["b"] },
                cshard: { type: "increment", value: addShards["c"] },
                dshard: { type: "increment", value: addShards["d"] },
                ssticket: { type: "increment", value: addTickets["ss"] },
                sticket: { type: "increment", value: addTickets["s"] },
                aticket: { type: "increment", value: addTickets["a"] },
                bticket: { type: "increment", value: addTickets["b"] },
                cticket: { type: "increment", value: addTickets["c"] },
                dticket: { type: "increment", value: addTickets["d"] }
            });

            return interaction.reply(`You've opened a lootbox! <a:MikuGold:942200295855890483>\n**Coins**: ${addCoins}<:coins:872926669055356939>\n**Shards**: ${shardmsg}\n**Tickets**: ${ticketmsg}`);
        } else {
            await interaction.deferReply().catch(() => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });

            const chest = items[parseInt(box)] as chestInfo;
            if (!stats.items[chest.id]) return interaction.editReply(`You don't have any **${chest.name}** left`);

            // Amount to open
            if (amountFlag.toLowerCase() === "max") amount = stats.items[chest.id];
            if (amount < 1) return interaction.editReply(`You can't open ${amount} chests.`);
            if (amount > 1000) return interaction.editReply(`You can't open more than 1000 chests at once.`);
            if (amount > stats.items[chest.id]) return interaction.editReply(`You don't have ${amount} chests`);

            // Update users table
            const newItemsValues = { [chest.id]: -amount };
            if (chest.id === 458) newItemsValues[677] = amount; // Deluxe Chest adds mythical points
            if (chest.id === 457) newItemsValues[678] = amount; // Royal Chest adds Legendary points

            await updateUsers(interaction.user.id, {
                items: { type: "merge_json", value: newItemsValues },
            });

            // Get item pools to draw from
            const fIds = getItemPools(stats.itemwishlist);

            // Generate drops
            const drops: (itemInfo & { uid?: string; })[] = [];
            for (let j = 0; j < chest.drops * amount; j++) {
                let grade = weightedRandom(chest.dropratesFull);
                if (chest.id === 458 && j % 6 === 0 && ++stats.genesispity >= 24) grade = "genesis";
                if (chest.id === 458 && grade === "genesis") stats.genesispity = 0;
                drops.push(items[fIds[grade][Math.floor(Math.random() * fIds[grade].length)]]);

                // Insert new weapon
                const drop = await insertNewWeapon(interaction.user.id, drops[j].id, drops[j].category);
                drops[j].uid = drop.uniqueid.split(":")[0];
            };
            drops.sort((a, b) => a.gradeValue - b.gradeValue);

            // Update users table
            await updateUsers(interaction.user.id, {
                genesispity: { type: "set", value: stats.genesispity }
            });

            let page = 0;

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(`You've opened a **${chest.name}**!`)
                .setThumbnail(chest.image2)
                .setImage(drops[page].image)
                .setDescription(`You've found **${drops[page].name}**!\n**Grade**: ${drops[page].gradeEmote}\n**Type**: ${drops[page].type[0].toUpperCase() + drops[page].type.slice(1)}\n**ID**: \`${drops[page].uid}\``)
                .setFooter({ text: `Page ${page + 1}/${drops.length}` });
            return interaction.editReply({ embeds: [Embed], components: [row] }).then((msg) => {
                const next = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 60000 });

                next.on('collect', async (r) => {
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
                        return interaction.editReply({ embeds: [Embed], components: [PageRow] }).then(() => {
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
        };

    },
};

export default exportCommand;
