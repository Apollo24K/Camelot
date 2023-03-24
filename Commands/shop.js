/* eslint-disable no-unused-vars */
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { items } = require("../Modules/items.js");

const mythicalFiltered = items.filter((e) => e.obtain.includes("chest") && e.grade === "mythical");
const legendaryFiltered = items.filter((e) => e.obtain.includes("chest") && e.grade === "legendary");
// const uniqueFiltered = items.filter((e) => e.obtain.includes("chest") && e.grade === "unique");

function getHash(hash) {
    const key = new Date(new Date().getTime()+(60*60*1000)).toISOString().slice(0, 10) + "camelot24";
    for (let i=0; i < key.length; i++) {
        hash = ((hash << 5) - hash) + key.charCodeAt(i);
        hash |= 0;
    }
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

const row = new MessageActionRow()
    .addComponents(
        new MessageButton().setCustomId('0').setEmoji("<:SSTier:869316489931546644>").setLabel("Packs").setStyle('SECONDARY'),
        new MessageButton().setCustomId('1').setEmoji("<:sublime_chest_open:1069287041843593266>").setLabel("Chests").setStyle('SECONDARY'),
        new MessageButton().setCustomId('2').setEmoji("<:exchange_points:1078750240246607984>").setLabel("Exchange").setStyle('SECONDARY'),
        new MessageButton().setCustomId('3').setEmoji("<:genesis_gems:1034179687720681492>").setLabel("Gems").setStyle('PRIMARY'),
    );

module.exports = {
    name: 'shop',
	description: 'Shop',
	execute(interaction) {

        // Todays Offers
        const todaysOffers = [...getOffers(mythicalFiltered, 3), ...getOffers(legendaryFiltered, 5)];
        const today = new Date();
        const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1, 0, 0, 0)
        const diff = tomorrow - today;

        let currentPage = parseInt(interaction.options.getString('option') || 0);

        const pages = [
            new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle("Character Shop")
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setDescription("Welcome to the character shop to buy character packs!\nUse `/buy character <item>` to buy a pack.")
            .addField("Character Pack - 300<:coins:872926669055356939>", "Get a random character")
            .addField("Waifu Pack - 300<:coins:872926669055356939>", "Get a random waifu")
            .addField("Husbando Pack - 300<:coins:872926669055356939>", "Get a random husbando")
            .addField("Character Bundle - 800<:coins:872926669055356939>", "Get 3 characters for a discount")
            .addField("Rare Pack - 500<:coins:872926669055356939>", "Get at least a <:CTier:869316602858991657>-Tier character")
            .addField("Morpheus Blessing - 2000<:coins:872926669055356939>", "Get a guaranteed new character\n(_<:SSTier:869316489931546644>-Tier are excluded from this pack_)"),
            new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle("Chest Shop")
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setDescription("Welcome to the chest shop!\nChests contain items such as weapons and armor.\nUse `/buy chest <item>` to buy a chest, and `/open` to open one.\nYou can view drop rates using `/item info`.\n\n<:common_chest:1069067835193688144> `Common Chest    ➜   5`<:genesis_gems:1034179687720681492>\n<:rare_chest:1069286571876040744> `Rare Chest      ➜  20`<:genesis_gems:1034179687720681492>\n<:sublime_chest:1069287046818050158> `Sublime Chest   ➜  40`<:genesis_gems:1034179687720681492>\n<:glorious_chest:1069076067081539726> `Glorious Chest  ➜  80`<:genesis_gems:1034179687720681492>\n<:luxurious_chest:1069300112364404817> `Luxurious Chest ➜ 120`<:genesis_gems:1034179687720681492>\n<:royal_chest:1069301128711376976> `Royal Chest     ➜ 160`<:genesis_gems:1034179687720681492>\n<:deluxe_chest:1069301259603026061> `Deluxe Chest    ➜ 300`<:genesis_gems:1034179687720681492>"),
            new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle("Exchange Shop")
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setDescription(`Welcome to the exchange shop! Opening chests will give you exchange points <:exchange_points:1078750240246607984>, which can be redeemed here.\nUse \`/buy exchange <item>\` to buy.\n\n**Time remaining**: ${Math.floor(diff/(60*60*1000)) ? Math.floor(diff/(60*60*1000)) + "h" : ""} ${Math.floor((diff%(60*60*1000))/(60*1000)) ? Math.floor((diff%(60*60*1000))/(60*1000)) + "min" : ""} ${Math.floor((diff%(60*1000))/(1000)) ? Math.floor((diff%(60*1000))/(1000)) + "s" : ""}\n\n${todaysOffers[0].gradeEmote}\n${todaysOffers[0].bar}${todaysOffers[0].emoji} | ${todaysOffers[0].name} ➜ 30 <:mythical_exchange_points:1078804861040210051>\n${todaysOffers[1].bar}${todaysOffers[1].emoji} | ${todaysOffers[1].name} ➜ 40 <:mythical_exchange_points:1078804861040210051>\n${todaysOffers[2].bar}${todaysOffers[2].emoji} | ${todaysOffers[2].name} ➜ 40 <:mythical_exchange_points:1078804861040210051>\n\n${todaysOffers[3].gradeEmote}\n${todaysOffers[3].bar}${todaysOffers[3].emoji} | ${todaysOffers[3].name} ➜ 50 <:legendary_exchang_points:1078805819820347392>\n${todaysOffers[4].bar}${todaysOffers[4].emoji} | ${todaysOffers[4].name} ➜ 50 <:legendary_exchang_points:1078805819820347392>\n${todaysOffers[5].bar}${todaysOffers[5].emoji} | ${todaysOffers[5].name} ➜ 50 <:legendary_exchang_points:1078805819820347392>\n${todaysOffers[6].bar}${todaysOffers[6].emoji} | ${todaysOffers[6].name} ➜ 50 <:legendary_exchang_points:1078805819820347392>\n${todaysOffers[7].bar}${todaysOffers[7].emoji} | ${todaysOffers[7].name} ➜ 50 <:legendary_exchang_points:1078805819820347392>`),
            new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle("Premium Shop")
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setDescription("Welcome to the premium shop to buy gems <:FuminoHeart:928369288014884935>\nGems are used all over the bot as a premium currency to speed up your progress.\n\n`  $3 ➜    160`<:genesis_gems:1034179687720681492>`    +60 first time bonus!`\n`  $5 ➜    300`<:genesis_gems:1034179687720681492>`   +100 first time bonus!`\n` $10 ➜    680`<:genesis_gems:1034179687720681492>`   +160 first time bonus!`\n` $15 ➜  1,000`<:genesis_gems:1034179687720681492>`   +240 first time bonus!`\n` $25 ➜  1,760`<:genesis_gems:1034179687720681492>`   +360 first time bonus!`\n` $50 ➜  3,680`<:genesis_gems:1034179687720681492>`   +720 first time bonus!`\n`$100 ➜  7,420`<:genesis_gems:1034179687720681492>` +1,440 first time bonus!`\n➜ [Here's the link to our shop!](https://donatebot.io/checkout/927257132624130119)"),
        ];

        db.serialize(async () => {
            var stats = await query(`SELECT coins, gems FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];
            if (!stats) stats = {coins: 0, gems: 0};

            // Set balances
            pages[0].setFooter(`Balance: ${stats.coins} coins`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048");
            pages[1].setFooter(`Balance: ${stats.gems} gems`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048");
            pages[2].setFooter(`Balance: ${stats.gems} gems`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048");
            pages[3].setFooter(`Balance: ${stats.gems} gems`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048");

            interaction.reply({ embeds: [pages[currentPage]], components: [row], fetchReply: true }).then((msg) => {
                const collector = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id, componentType: 'BUTTON', time: 120000 });

                collector.on('collect', async r => {
                    if (currentPage == r.customId) return;
                    currentPage = parseInt(r.customId);
                    interaction.editReply({ embeds: [pages[currentPage]] });
                });
            });

        });
        
    },
};