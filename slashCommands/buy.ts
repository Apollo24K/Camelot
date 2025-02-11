import fs from 'fs';
import { EmbedBuilder, ComponentType, ChatInputCommandInteraction } from "discord.js";
import charInfo, { characters } from "../Modules/chars";
import { splitTitle, rarity, getRefinement, searchItem } from "../Modules/functions";
import { monthlyShopItems } from "../Modules/monthlyShopItems";
import { achievements } from "../Modules/achievements";
import { dailies } from "../Modules/dailyQuests";
import { itemInfo, items } from "../Modules/items";
import { OfferRow } from "../Modules/components";
import { CharacterRarity, SlashCommand, UpdateUserOptions } from '../types';
import { getUserSchema, insertNewWeapon, updateUsers } from '../Modules/queries';

function displayMy(thisChar: charInfo, inv: number[], ref: number, interaction: ChatInputCommandInteraction) {
    let animeL = splitTitle(thisChar.anime);
    let dupes = inv.filter((e) => e === thisChar.id).length;
    let refinement = getRefinement(ref);

    let img = thisChar.image;
    // if (premium[message.author.id] > 3) if (customSettings[message.author.id + message.guild.id] && customSettings[message.author.id + message.guild.id].cimg[thisChar.id]) img = customSettings[message.author.id + message.guild.id].cimg[thisChar.id];

    const Embed = new EmbedBuilder()
        .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[thisChar.rarity])
        .setImage(img)
        .setThumbnail(rarity(thisChar.rarity))
        .setDescription(`**${thisChar.name}**\n${animeL}\n\n**Ref**. ${refinement}`)
        .setFooter({ text: `You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of this`, iconURL: interaction.user.displayAvatarURL({ size: 2048 }) });
    interaction.reply({ embeds: [Embed] });
};

function getHash(hash: number) {
    const key = new Intl.DateTimeFormat('en-UK', { timeZone: 'Europe/Berlin' }).format(new Date()).split("/").reverse().join("-") + "camelot24";
    for (let i = 0; i < key.length; i++) {
        hash = ((hash << 5) - hash) + key.charCodeAt(i);
        hash |= 0;
    };
    return hash;
};

function getOffers(offers: itemInfo[], quantity: number) {
    const quests = new Set<number>();
    let i = 0;
    while (quests.size < quantity && i < 100) {
        const hash = getHash(i++);
        quests.add(Math.abs(hash) % offers.length);
    };
    return [...quests].map((e) => offers[e]);
};

const genesisFiltered = items.filter((e) => e.obtain.includes("chest") && e.grade === "genesis");
const mythicalFiltered = items.filter((e) => e.obtain.includes("chest") && e.grade === "mythical");
const legendaryFiltered = items.filter((e) => e.obtain.includes("chest") && e.grade === "legendary");

const exportCommand: SlashCommand = {
    name: 'buy',
    async execute({ interaction, author }) {

        const subcommand = interaction.options.getSubcommand();
        let item = interaction.options.getString('item', true);

        const stats = author.schema;
        if (!stats) return interaction.reply("You don't have an account yet");

        if (subcommand === "character") {
            const ranRar = Math.floor(Math.random() * 1000); // 0-999
            const tempChars: number[] = [];
            let sub_coins = 0;

            if (item === "0") {
                return;
            } else if (item === "1" || item === "2" || item === "3") {
                if (stats.coins < 300) return interaction.reply("You don't have enough coins");
                sub_coins = 300;

                let rar = "D";
                if (ranRar < 3) rar = "SS";
                else if (ranRar < 21) rar = "S";
                else if (ranRar < 63) rar = "A";
                else if (ranRar < 189) rar = "B";
                else if (ranRar < 442) rar = "C";

                let fChars = characters.filter((e) => e.rarity === rar);
                if (item === "2") fChars = fChars.filter((e) => e.gender === "F");
                else if (item === "3") fChars = fChars.filter((e) => e.gender === "M");
                let num = Math.floor(Math.random() * fChars.length);
                tempChars.push(fChars[num].id);
                displayMy(fChars[num], stats.chars, stats.char_ref[fChars[num].id], interaction);

                // Daily Quests
                dailies[4].update(interaction);
            } else if (item === "4") {
                if (stats.coins < 800) return interaction.reply("You don't have enough coins");
                sub_coins = 800;

                let desc3 = [];
                const Embed = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ size: 2048 }) });

                let rarEmoji = { "SS": "<:SSTier:869316489931546644>", "S": "<:STier:869316518675095552>", "A": "<:ATier:869316558013464627>", "B": "<:BTier:869316586803179571>", "C": "<:CTier:869316602858991657>", "D": "<:DTier:869316616071032843>" };

                for (let i = 1; i < 4; i++) {
                    const ranRar = Math.floor(Math.random() * 1000); // 0-999
                    let rar: CharacterRarity = "D";
                    if (ranRar < 3) rar = "SS";
                    else if (ranRar < 21) rar = "S";
                    else if (ranRar < 63) rar = "A";
                    else if (ranRar < 189) rar = "B";
                    else if (ranRar < 442) rar = "C";

                    let fChars = characters.filter((e) => e.rarity === rar);
                    let num = Math.floor(Math.random() * fChars.length);
                    desc3.push({ val: fChars[num].rarityValue, rarity: fChars[num].rarity, image: fChars[num].image, text: `${i}. ${rarEmoji[rar]}-Tier **${fChars[num].name}**` });
                    tempChars.push(fChars[num].id);
                };

                desc3.sort((a, b) => b.val - a.val);

                Embed.setDescription(desc3.map((e) => e.text).join("\n")).setThumbnail(desc3[0].image).setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[desc3[0].rarity]);
                interaction.reply({ embeds: [Embed] });

                // Daily Quests
                dailies[4].update(interaction);
            } else if (item === "5") {
                if (stats.coins < 500) return interaction.reply("You don't have enough coins");
                sub_coins = 500;

                let rar = "C";
                if (ranRar < 4) rar = "SS";
                else if (ranRar < 30) rar = "S";
                else if (ranRar < 103) rar = "A";
                else if (ranRar < 412) rar = "B";

                let fChars = characters.filter((e) => e.rarity === rar);
                let num = Math.floor(Math.random() * fChars.length);
                tempChars.push(fChars[num].id);
                displayMy(fChars[num], stats.chars, stats.char_ref[fChars[num].id], interaction);

                // Daily Quests
                dailies[4].update(interaction);
            } else if (item === "6") {
                if (stats.coins < 2000) return interaction.reply("You don't have enough coins");
                let newChars = characters.filter((e) => !stats.chars.includes(e.id) && e.rarity !== "SS" && e.rarity !== "EX");
                if (newChars.length < 200) return interaction.reply("Morpheus' Blessing can't be used once you have less than 200 characters left.");
                sub_coins = 2000;

                let rarUp: CharacterRarity;
                if (ranRar < 21) {
                    rarUp = "S";
                    if (!newChars.some((e) => e.rarity === "S")) rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "S" || e.rarity === "A")) rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "S" || e.rarity === "A" || e.rarity === "B")) rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "S" || e.rarity === "A" || e.rarity === "B" || e.rarity === "C")) rarUp = "D";
                } else if (ranRar < 63) {
                    rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "A")) rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "A" || e.rarity === "B")) rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "A" || e.rarity === "B" || e.rarity === "C")) rarUp = "D";
                    if (!newChars.some((e) => e.rarity === "A" || e.rarity === "B" || e.rarity === "C" || e.rarity === "D")) rarUp = "S";
                } else if (ranRar < 189) {
                    rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "B")) rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "B" || e.rarity === "C")) rarUp = "D";
                    if (!newChars.some((e) => e.rarity === "B" || e.rarity === "C" || e.rarity === "D")) rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "B" || e.rarity === "C" || e.rarity === "D" || e.rarity === "A")) rarUp = "S";
                } else if (ranRar < 442) {
                    rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "C")) rarUp = "D";
                    if (!newChars.some((e) => e.rarity === "C" || e.rarity === "D")) rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "C" || e.rarity === "D" || e.rarity === "B")) rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "C" || e.rarity === "D" || e.rarity === "B" || e.rarity === "A")) rarUp = "S";
                } else if (ranRar < 1000) {
                    rarUp = "D";
                    if (!newChars.some((e) => e.rarity === "D")) rarUp = "C";
                    if (!newChars.some((e) => e.rarity === "D" || e.rarity === "C")) rarUp = "B";
                    if (!newChars.some((e) => e.rarity === "D" || e.rarity === "C" || e.rarity === "B")) rarUp = "A";
                    if (!newChars.some((e) => e.rarity === "D" || e.rarity === "C" || e.rarity === "B" || e.rarity === "A")) rarUp = "S";
                }
                let fChars = newChars.filter((e) => e.rarity === rarUp);
                const num = Math.floor(Math.random() * fChars.length);
                tempChars.push(fChars[num].id);
                displayMy(fChars[num], stats.chars, stats.char_ref[fChars[num].id], interaction);

                // Daily Quests
                dailies[4].update(interaction);
            };

            await updateUsers(interaction.user.id, {
                coins: { type: "increment", value: -sub_coins, },
                chars: { type: "append", value: tempChars },
            });

            // Achievements
            achievements[1].check(interaction), achievements[2].check(interaction), achievements[3].check(interaction); // Collector
            achievements[19].check(interaction), achievements[20].check(interaction), achievements[21].check(interaction), achievements[22].check(interaction), achievements[23].check(interaction); // Diligent
            achievements[48].check(interaction); // First Steps

        } else if (subcommand === "chest") {
            const amount = interaction.options.getInteger('amount') || 1;
            if (amount < 1) return interaction.reply("no <:Heh:928368727588757504>");
            else if (amount > 1000) return interaction.reply("You can't buy more than 1000 chests at once.");

            let price = 0;
            switch (item) {
                case "451": price = 5; break;
                case "452": price = 20; break;
                case "453": price = 40; break;
                case "454": price = 80; break;
                case "456": price = 120; break;
                case "457": price = 160; break;
                case "458": price = 300; break;
                default: price = 300; break;
            };
            price *= amount;

            // Return if not enough gems
            if (stats.gems < price) return interaction.reply(`You don't have enough gems (**${stats.gems}**/${price}<:genesis_gems:1034179687720681492>)`);

            await updateUsers(interaction.user.id, {
                gems: { type: "increment", value: -price, },
                items: { type: "merge_json", value: { [item]: amount } },
            });

            return interaction.reply(`You have bought **${amount}x** ${items[item as any].emoji} **__${items[item as any].name}__**!`);

        } else if (subcommand === "exchange") {
            const todaysOffers = [...getOffers(genesisFiltered, 1), ...getOffers(mythicalFiltered, 3), ...getOffers(legendaryFiltered, 5)];

            const fItem = searchItem(item, interaction);
            if (!fItem) return;

            if (!todaysOffers.includes(fItem) || fItem.grade === "genesis") return interaction.reply(`${fItem.emoji} **__${fItem.name}__** can't be exchanged today, maybe try another time!`);

            let price = 100, currency = 676;
            if (fItem.grade === "mythical") price = 40, currency = 677;
            else price = 50, currency = 678;

            if (!(stats.items[currency] >= price)) return interaction.reply(`You don't have enough exchange points (**${stats.items[currency] || 0}**/${price}${items[currency].emoji})`);

            // Remove Points
            await updateUsers(interaction.user.id, {
                items: { type: "merge_json", value: { [currency]: -price } },
            });

            // Insert new weapon
            await insertNewWeapon(interaction.user.id, fItem.id, fItem.category);

            // // Read existing items
            // let existing = await query(`SELECT uniqueid FROM weapons`);
            // existing = existing.map((e) => e.uniqueid);

            // // Write to database
            // let uid = generateUniqueItemId(interaction.user.id, existing);
            // await query(`INSERT INTO weapons (id, itemid, uniqueid, item_type) VALUES (${interaction.user.id}, ${fItem.id}, '${uid + ":" + interaction.user.id}', ${fItem.category})`, 'run');

            return interaction.reply(`You have successfully bought ${fItem.emoji} **__${fItem.name}__**!`);

        } else if (subcommand === "monthly") {

            // If value failed
            const shopItem = monthlyShopItems.find((e) => item === `${e.name} (${e.displayPriceText})`);

            const fItem = shopItem ?? monthlyShopItems[parseInt(item)];
            if (!fItem?.name) return;

            const bought = stats.monthlyshop[fItem.id] ?? 0;
            if (bought >= fItem.amount) return interaction.reply(`You have already bought every **${fItem.name}** from this month's shop!`);

            const amountFlag = interaction.options.getString('amount');
            let amount = (amountFlag === "max") ? (fItem.amount - bought) : (parseInt(amountFlag ?? "1") || 1);
            if (amount < 1) amount = 1;
            if (amount + bought > fItem.amount) amount = fItem.amount - bought;
            const max = Math.floor(stats[fItem.currency] / fItem.price);
            if (amount > max) amount = max;

            const cost = Math.round(fItem.price * amount);
            if (amount < 1 || stats[fItem.currency] < cost) return interaction.reply(`You don't have enough ${fItem.currency} (${fItem.displayPrice})`);

            return interaction.reply({ content: `Would you like to buy ${amount}x ${fItem.displayName} for **${cost}** ${fItem.emojiIcon}?`, components: [OfferRow] }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 30000 });

                collector.on('collect', async r => {
                    collector.stop();
                    if (r.customId === "cancel") {
                        if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                        return;
                    };

                    const stats = await getUserSchema(interaction.user.id);
                    if (!stats) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You haven't started playing yet.`);
                        return;
                    };

                    const bought = stats.monthlyshop[fItem.id] ?? 0;
                    if (bought >= fItem.amount) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You have already bought every **${fItem.name}** from this month's shop!`);
                        return;
                    };

                    amount = (amountFlag === "max") ? (fItem.amount - bought) : (parseInt(amountFlag ?? "1") || 1);
                    if (amount < 1) amount = 1;
                    if (amount + bought > fItem.amount) amount = fItem.amount - bought;
                    const max = Math.floor(stats[fItem.currency] / fItem.price);
                    if (amount > max) amount = max;

                    const cost = Math.round(fItem.price * amount);
                    if (amount < 1 || stats[fItem.currency] < cost) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough ${fItem.currency} (${fItem.displayPrice})`);
                        return;
                    };

                    if ((fItem.section === "Premium" || fItem.section === "Freemium") && stats.premium >= (fItem.custom?.tier ?? 0)) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You already have premium!`);
                        return;
                    };

                    // Remove price and track purchase
                    let replyMessage = "";
                    const updateOptions: UpdateUserOptions = {
                        [fItem.currency]: { type: "increment", value: -cost, },
                        monthlyshop: { type: "merge_json", value: { [fItem.id]: amount } },
                    };

                    // Add item
                    if (fItem.section === "Premium" || fItem.section === "Freemium") {
                        updateOptions.premium = { type: "set", value: fItem.custom.tier ?? 0 };

                        const premiumGift = JSON.parse(fs.readFileSync('Storage/premiumGift.json', 'utf8'));
                        premiumGift[interaction.user.id] = { "method": "shop", "date": Date.now() };

                        fs.writeFile('Storage/premiumGift.json', JSON.stringify(premiumGift), (err) => {
                            if (err) console.error(err);
                        });

                        replyMessage = `You have received 1 month of premium!`;
                    } else if (fItem.section === "EX Pulls") {
                        updateOptions.expulls = { type: "increment", value: amount };
                    } else if (fItem.section === "Kernel") {
                        updateOptions.items = { type: "merge_json", value: { [683]: amount } };
                    } else if (fItem.section === "Ascension Materials") {
                        if (fItem.custom.itemid) updateOptions.items = { type: "merge_json", value: { [fItem.custom.itemid]: amount } };
                    } else if (fItem.section === "Shards") {
                        if (fItem.custom.itemid) updateOptions[fItem.custom.column as "ssshard"] = { type: "increment", value: amount };
                    } else if (fItem.section === "Tickets") {
                        if (fItem.custom.itemid) updateOptions[fItem.custom.column as "ssticket"] = { type: "increment", value: amount };
                    } else if (fItem.section === "Chests") {
                        if (fItem.custom.itemid) updateOptions.items = { type: "merge_json", value: { [fItem.custom.itemid]: amount } };
                    } else if (fItem.section === "Image Credits") {
                        updateOptions.image_credits = { type: "increment", value: amount };
                    };

                    await updateUsers(interaction.user.id, updateOptions);

                    if (interaction.channel?.isSendable()) interaction.channel.send(replyMessage || `You have bought ${amount}x ${fItem.displayName}!`);
                });

                collector.on('end', () => {
                    interaction.editReply({ components: [] });
                });
            });
        };

    },
    async autocomplete({ interaction }) {
        const subcommand = interaction.options.getSubcommand();
        const focus = interaction.options.getFocused()?.toLowerCase();

        if (subcommand === "monthly") {
            const shopItems = monthlyShopItems.filter((e) => e.name.toLowerCase().includes(focus)).sort((a, b) => a.name.localeCompare(b.name));
            return shopItems.map((e) => ({ name: `${e.name} (${e.displayPriceText})`, value: `${e.id}` }));
        };

        return [];
    },
};

export default exportCommand;
