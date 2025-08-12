import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonInteraction, Message, ButtonStyle } from "discord.js";
import { items } from "../Modules/items";
import { SlashCommand } from '../types';

const genesisFiltered = items.filter((e) => e.obtain.includes("chest") && e.grade === "genesis");
const mythicalFiltered = items.filter((e) => e.obtain.includes("chest") && e.grade === "mythical");
const legendaryFiltered = items.filter((e) => e.obtain.includes("chest") && e.grade === "legendary");

function getHash(hash: number) {
    const key = new Intl.DateTimeFormat('en-UK', { timeZone: 'Europe/Berlin' }).format(new Date()).split("/").reverse().join("-") + "camelot24";
    for (let i = 0; i < key.length; i++) {
        hash = ((hash << 5) - hash) + key.charCodeAt(i);
        hash |= 0;
    }
    return hash;
};

function getOffers(offers: any[], quantity: number) {
    const quests = new Set();
    let i = 0;
    while (quests.size < quantity && i < 100) {
        const hash = getHash(i++);
        quests.add(Math.abs(hash) % offers.length);
    };
    return [...quests].map((e) => offers[e as number]);
};

const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder().setCustomId('0').setEmoji("<:SSTier:869316489931546644>").setLabel("Packs").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('1').setEmoji("<:sublime_chest_open:1069287041843593266>").setLabel("Chests").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('2').setEmoji("<:exchange_points:1078750240246607984>").setLabel("Exchange").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('3').setEmoji("<:genesis_gems:1034179687720681492>").setLabel("Gems").setStyle(ButtonStyle.Primary),
    );

const exportCommand: SlashCommand = {
    name: 'shop',
    async execute({ interaction, author }) {

        const stats = author.schema;

        // Todays Offers
        const todaysOffers = [...getOffers(genesisFiltered, 1), ...getOffers(mythicalFiltered, 3), ...getOffers(legendaryFiltered, 5)];
        const today = new Date();
        const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0);
        const diff = tomorrow.getTime() - today.getTime();

        let currentPage = parseInt(interaction.options.getString('option') || '0');

        const pages = [
            new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle("Character Shop")
                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                .setDescription("Welcome to the character shop to buy character packs!\nUse `/buy character <item>` to buy a pack.")
                .addFields(
                    { name: "Character Pack - 300<:coins:872926669055356939>", value: "Get a random character" },
                    { name: "Waifu Pack - 300<:coins:872926669055356939>", value: "Get a random waifu" },
                    { name: "Husbando Pack - 300<:coins:872926669055356939>", value: "Get a random husbando" },
                    { name: "Character Bundle - 800<:coins:872926669055356939>", value: "Get 3 characters for a discount" },
                    { name: "Rare Pack - 500<:coins:872926669055356939>", value: "Get at least a <:CTier:869316602858991657>-Tier character" },
                    { name: "Morpheus' Blessing - 2000<:coins:872926669055356939>", value: "Get a guaranteed new character\n(_<:SSTier:869316489931546644>-Tier are excluded from this pack_)" },
                    { name: "Newcomer Pack - 1000<:coins:872926669055356939>", value: "Get a random character from the last 20 anime added" },
                ),
            new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle("Chest Shop")
                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                .setDescription("Welcome to the chest shop!\nChests contain items such as weapons and armor.\nUse `/buy chest <item>` to buy a chest, and `/open` to open one.\nYou can view drop rates using `/item info`.\n\n<:common_chest:1069067835193688144> `Common Chest    ➜   5`<:genesis_gems:1034179687720681492>\n<:rare_chest:1069286571876040744> `Rare Chest      ➜  20`<:genesis_gems:1034179687720681492>\n<:sublime_chest:1069287046818050158> `Sublime Chest   ➜  40`<:genesis_gems:1034179687720681492>\n<:glorious_chest:1069076067081539726> `Glorious Chest  ➜  80`<:genesis_gems:1034179687720681492>\n<:luxurious_chest:1069300112364404817> `Luxurious Chest ➜ 120`<:genesis_gems:1034179687720681492>\n<:royal_chest:1069301128711376976> `Royal Chest     ➜ 160`<:genesis_gems:1034179687720681492>\n<:deluxe_chest:1069301259603026061> `Deluxe Chest    ➜ 300`<:genesis_gems:1034179687720681492>\n\n<:genesis1:1041725784546619502><:genesis2:1041725782176825485><:genesis3:1041725778611675237><:genesis4:1041725780218093629>\nPity: " + `**${stats.genesispity}**/24 <:deluxe_chest:1069301259603026061>, **${stats.genesisdupepity}**/3 dupes`),
            new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle("Exchange Shop")
                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                // .setDescription(`Welcome to the exchange shop! Opening chests will give you exchange points <:exchange_points:1078750240246607984>, which can be redeemed here.\nUse \`/buy exchange <item>\` to buy.\n\n**Time remaining**: ${Math.floor(diff/(60*60*1000)) ? Math.floor(diff/(60*60*1000)) + "h" : ""} ${Math.floor((diff%(60*60*1000))/(60*1000)) ? Math.floor((diff%(60*60*1000))/(60*1000)) + "min" : ""} ${Math.floor((diff%(60*1000))/(1000)) ? Math.floor((diff%(60*1000))/(1000)) + "s" : ""}\n\n${todaysOffers[0].gradeEmote}\n${todaysOffers[0].bar}${todaysOffers[0].emoji} | ${todaysOffers[0].name} ➜ 6 <:divine_exchange_points:1086987912438087691>\n\n${todaysOffers[1].gradeEmote}\n${[1,2,3].map((e) => `${todaysOffers[e].bar}${todaysOffers[e].emoji} | ${todaysOffers[e].name} ➜ 40 <:mythical_exchange_points:1078804861040210051>`).join("\n")}\n\n${todaysOffers[4].gradeEmote}\n${[4,5,6,7,8].map((e) => `${todaysOffers[e].bar}${todaysOffers[e].emoji} | ${todaysOffers[e].name} ➜ 50 <:legendary_exchang_points:1078805819820347392>`).join("\n")}`),
                .setDescription(`Welcome to the exchange shop! Opening chests will give you exchange points <:exchange_points:1078750240246607984>, which can be redeemed here.\nUse \`/buy exchange <item>\` to buy.\n\n**Time remaining**: ${Math.floor(diff / (60 * 60 * 1000)) ? Math.floor(diff / (60 * 60 * 1000)) + "h" : ""} ${Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000)) ? Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000)) + "min" : ""} ${Math.floor((diff % (60 * 1000)) / (1000)) ? Math.floor((diff % (60 * 1000)) / (1000)) + "s" : ""}\n\n${todaysOffers[1].gradeEmote}\n${[1, 2, 3].map((e) => `${todaysOffers[e].bar}${todaysOffers[e].emoji} | ${todaysOffers[e].name} ➜ 40 <:mythical_exchange_points:1078804861040210051>`).join("\n")}\n\n${todaysOffers[4].gradeEmote}\n${[4, 5, 6, 7, 8].map((e) => `${todaysOffers[e].bar}${todaysOffers[e].emoji} | ${todaysOffers[e].name} ➜ 50 <:legendary_exchang_points:1078805819820347392>`).join("\n")}`),
            new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle("Premium Shop")
                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                .setDescription("Welcome to the premium shop to buy jades <:FuminoHeart:928369288014884935>\nUse `/convert jades` to convert them into gems <:genesis_gems:1034179687720681492>\n\n" +
                    // "☀️ **Summer Sale**: Get **30%** more gems during the summer event!\n" +
                    "`  $3 ➜    160`<:eternal_jade:1256124504141201428>`    +60 first time bonus!`\n" +
                    "`  $5 ➜    300`<:eternal_jade:1256124504141201428>`   +100 first time bonus!`\n" +
                    "` $10 ➜    680`<:eternal_jade:1256124504141201428>`   +160 first time bonus!`\n" +
                    "` $15 ➜  1,000`<:eternal_jade:1256124504141201428>`   +240 first time bonus!`\n" +
                    "` $25 ➜  1,760`<:eternal_jade:1256124504141201428>`   +360 first time bonus!`\n" +
                    "` $50 ➜  3,680`<:eternal_jade:1256124504141201428>`   +720 first time bonus!`\n" +
                    "`$100 ➜  7,420`<:eternal_jade:1256124504141201428>` +1,440 first time bonus!`\n" +
                    "➜ [Here's the link to our shop!](https://rank.top/bot/camelot?page=shop)\n\n" +
                    "*Additional first time bonuses include **Rimuru Tempest** for the $25 pack and **Luminous** <a:EXTRA:1138530846144462968> for the $100 pack <:LuminousPsssh:1071574041116295328>"
                ),
        ];

        // Set balances
        pages[0].setFooter({ text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ size: 1024 }) });
        pages[1].setFooter({ text: `Balance: ${stats.gems} gems`, iconURL: interaction.user.displayAvatarURL({ size: 1024 }) });
        pages[2].setFooter({ text: `Balance: ${stats.items[677] || 0} mythical, ${stats.items[678] || 0} legendary exchange points`, iconURL: interaction.user.displayAvatarURL({ size: 1024 }) });
        pages[3].setFooter({ text: `Balance: ${stats.jades} jades, ${stats.gems} gems`, iconURL: interaction.user.displayAvatarURL({ size: 1024 }) });

        return interaction.reply({ embeds: [pages[currentPage]], components: [row] }).then((msg) => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 120000 });

            collector.on('collect', async (r) => {
                if (`${currentPage}` == r.customId) return;
                currentPage = parseInt(r.customId);
                interaction.editReply({ embeds: [pages[currentPage]] });
            });
        });
    },
};

export default exportCommand;
