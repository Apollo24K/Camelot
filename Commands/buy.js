const { MessageEmbed } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");
const { splitTitle, rarity, getRefinement, searchItem, generateUniqueItemId, generateSubstats } = require("../Modules/functions.js");
const { achievements } = require("../Modules/achievements.js");
const { dailies } = require("../Modules/dailyQuests.js");
const { items } = require("../Modules/items.js");

function displayMy(thisChar, inv, ref, interaction) {
    let animeL = splitTitle(thisChar.anime);
    let dupes = inv.filter((e) => e === thisChar.id).length;
    let refinement = getRefinement(ref);
    
    let img = thisChar.image;
    // if (premium[message.author.id] > 3) if (customSettings[message.author.id + message.guild.id] && customSettings[message.author.id + message.guild.id].cimg[thisChar.id]) img = customSettings[message.author.id + message.guild.id].cimg[thisChar.id];
    
    const Embed = new MessageEmbed()
    .setColor(0xbbffff)
    .setImage(img)
    .setThumbnail(rarity(thisChar.rarity))
    .setDescription(`**${thisChar.name}**\n${animeL}\n\n**Ref**. ${refinement}`)
    .setFooter(`You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of this`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048")
    interaction.reply({ embeds: [Embed] });
};

function getHash(hash) {
    const key = new Date(new Date().getTime()+(60*60*1000)).toISOString().slice(0, 10) + "camelot24";
    for (let i=0; i < key.length; i++) {
        hash = ((hash << 5) - hash) + key.charCodeAt(i);
        hash |= 0;
    };
    return hash;
};

function getOffers(offers, quantity) {
    const quests = new Set();
    let i = 0;
    while (quests.size < quantity && i < 100) {
        const hash = getHash(i++);
        quests.add(Math.abs(hash) % offers.length);
    };
    return [...quests].map((e) => offers[e]);
};

const mythicalFiltered = items.filter((e) => e.obtain.includes("chest") && e.grade === "mythical");
const legendaryFiltered = items.filter((e) => e.obtain.includes("chest") && e.grade === "legendary");

module.exports = {
	name: 'buy',
	description: 'buy from the shop',
	execute(interaction) {

        let subcommand = interaction.options.getSubcommand();
        let item = interaction.options.getString('item');

        if (subcommand === "character") {

            db.serialize(async () => {
                let stats = await query(`SELECT coins FROM users WHERE id = ${interaction.user.id}`);
                stats = stats[0];
                if (!stats?.coins) return interaction.reply("You don't have enough coins");
    
                let inv = await query(`SELECT chars, ref FROM characters WHERE id = ${interaction.user.id}`);
                inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref)};
                
                let sub_coins = 0;
    
                const ranRar = Math.floor(Math.random() * 1000); // 0-999
    
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
                    inv.chars.push(fChars[num].id);
                    displayMy(fChars[num], inv.chars, inv.ref[fChars[num].id], interaction);
    
                    // Daily Quests
                    dailies[4].update(interaction);
                } else if (item === "4") {
                    if (stats.coins < 800) return interaction.reply("You don't have enough coins");
                    sub_coins = 800;
    
                    let desc3 = [];
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setAuthor(`${interaction.user.username}`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048")
    
                    let rarEmoji = {"SS":"<:SSTier:869316489931546644>","S":"<:STier:869316518675095552>","A":"<:ATier:869316558013464627>","B":"<:BTier:869316586803179571>","C":"<:CTier:869316602858991657>","D":"<:DTier:869316616071032843>"}
    
                    for (let i=1; i < 4; i++) {
                        const ranRar = Math.floor(Math.random() * 1000); // 0-999
                        let rar = "D";
                        if (ranRar < 3) rar = "SS";
                        else if (ranRar < 21) rar = "S";
                        else if (ranRar < 63) rar = "A";
                        else if (ranRar < 189) rar = "B";
                        else if (ranRar < 442) rar = "C";
    
                        let fChars = characters.filter((e) => e.rarity === rar);
                        let num = Math.floor(Math.random() * fChars.length);
                        desc3.push(`${i}. ${rarEmoji[rar]}-Tier **${fChars[num].name}**`)
                        inv.chars.push(fChars[num].id);
                    }
    
                    Embed.setDescription(desc3.join("\n")).setThumbnail(characters[inv.chars[inv.chars.length - 3]].image)
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
                    inv.chars.push(fChars[num].id);
                    displayMy(fChars[num], inv.chars, inv.ref[fChars[num].id], interaction);
    
                    // Daily Quests
                    dailies[4].update(interaction);
                } else if (item === "6") {
                    if (stats.coins < 2000) return interaction.reply("You don't have enough coins");
                    let newChars = characters.filter((e) => !inv.chars.includes(e.id) && e.rarity !== "SS");
                    if (newChars.length < 1) return interaction.reply("You already have every character");
                    sub_coins = 2000;
                    
                    let rarUp;
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
                    inv.chars.push(fChars[num].id);
                    displayMy(fChars[num], inv.chars, inv.ref[fChars[num].id], interaction);
    
                    // Daily Quests
                    dailies[4].update(interaction);
                };
                
                await query(`UPDATE users SET coins = coins - ${sub_coins} WHERE id = ${interaction.user.id}`);
                await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}' WHERE id = ${interaction.user.id}`);
                
                // Achievements
                achievements[1].check(interaction), achievements[2].check(interaction), achievements[3].check(interaction); // Collector
                achievements[19].check(interaction), achievements[20].check(interaction), achievements[21].check(interaction), achievements[22].check(interaction), achievements[23].check(interaction); // Diligent
                achievements[48].check(interaction); // First Steps
            });

        } else if (subcommand === "chest") {
            const amount = interaction.options.getInteger('amount') || 1;
            if (amount < 1) return interaction.reply("no <:Heh:928368727588757504>");
            else if (amount > 1000) return interaction.reply("You can't buy more than 1000 chests at once.");

            db.serialize(async () => {
                let stats = await query(`SELECT gems, items FROM users WHERE id = ${interaction.user.id}`);
                stats = {gems: stats[0].gems, items: JSON.parse(stats[0].items)};

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
                if (stats.gems < price) return interaction.reply(`You don't have enough gems (**${stats.gems}**/${price}<:genesis_gems:1034179687720681492>)`)

                // Add item
                if (stats.items[item]) stats.items[item] += amount;
                else stats.items[item] = amount;
                await query(`UPDATE users SET gems = gems - ${price}, items = '${JSON.stringify(stats.items)}' WHERE id = ${interaction.user.id}`);

                return interaction.reply(`You have bought **${amount}x** ${items[item].emoji} **__${items[item].name}__**!`);
            });
            
        } else if (subcommand === "exchange") {
            const todaysOffers = [...getOffers(mythicalFiltered, 3), ...getOffers(legendaryFiltered, 5)];

            const fItem = searchItem(item, interaction);
            if (!fItem?.name) return;

            if (!todaysOffers.includes(fItem)) return interaction.reply(`${fItem.emoji} **__${fItem.name}__** can't be exchanged today, maybe try another time!`);

            db.serialize(async () => {
                let stats = await query(`SELECT items FROM users WHERE id = ${interaction.user.id}`);
                stats = {items: JSON.parse(stats[0].items)};

                let price = 100, currency = 677;
                if (todaysOffers[0].id === fItem.id) price = 30;
                else if (fItem.grade === "mythical") price = 40;
                else price = 50, currency = 678;

                if (!(stats.items[currency] >= price)) return interaction.reply(`You don't have enough exchange points (**${stats.items[currency] || 0}**/${price}${items[currency].emoji})`);

                // Remove Points
                stats.items[currency] -= price;
                await query(`UPDATE users SET items = '${JSON.stringify(stats.items)}' WHERE id = ${interaction.user.id}`);
                
                // Read existing items
                let existing = await query(`SELECT uniqueid FROM weapons`);
                existing = existing.map((e) => e.uniqueid);
                
                // Write to database
                let uid = generateUniqueItemId(interaction.user.id, existing);
                await query(`INSERT INTO weapons (id, itemid, uniqueid${fItem.category === "armor" ? ", substats" : ""}) VALUES (${interaction.user.id}, ${fItem.id}, '${uid + ":" + interaction.user.id}'${fItem.category === "armor" ? ", '"+ JSON.stringify(generateSubstats()) + "'" : ""})`, 'run');
                
                return interaction.reply(`You have successfully bought ${fItem.emoji} **__${fItem.name}__**!`);
            });
        };

    },
};