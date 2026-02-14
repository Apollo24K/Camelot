import { EmbedBuilder } from 'discord.js';
import Package from '../package.json';
import { auniq } from "../Modules/chars";
import { items } from "../Modules/items";
import { SlashCommand } from '../types';
import { ongoingEvent, isEventOngoing } from '../Modules/components';

const exportCommand: SlashCommand = {
    name: 'help',
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction }) {

        let helpCommand = interaction.options.getString('command') ?? "";

        const embedColor = isEventOngoing()
            ? {
                anniversary: 0x2aad9d,
                halloween: 0xff8733,
                christmas: 0x034f20,
                valentines: 0xf8c8dc,
                easter: 0x69ffb9,
            }[ongoingEvent]
            : 0xbbffff;

        // Main help page
        if (!helpCommand) {
            const Embed = new EmbedBuilder()
                .setTitle('Command List')
                .setColor(embedColor)
                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                .setDescription("Use `/help <command name>` for more information");
            if (isEventOngoing()) Embed.addFields(
                {
                    name: {
                        anniversary: "🌙 Anniversary Event",
                        halloween: "🎃 Halloween Event",
                        christmas: "🎄 Christmas Event",
                        valentines: "💖 Valentines Event",
                        easter: "🐣 Easter Event",
                    }[ongoingEvent], value: "`/christmas craze` `/frostbound yule` `/seasonal shop`\n`/christmas-present` `/event pass` `/ex pull`"
                },
            );
            Embed.addFields(
                { name: "<:SSTier:869316489931546644> Card Game", value: "`/pull` `/cd` `/pity` `/reminder` `/ability` `/anime` `/search`\n`/find` `/info` `/inventory` `/shards` `/refine` `/list`\n`/lock [anime|character]` `/unlock [anime|characters]` `/locked` `/vote` `/lootbox` `/rp` `/tickets` `/open` `/stats` `/fav`" },
                { name: "<:coins:872926669055356939> Balance & Trading", value: "`/balance` `/premium` `/bank [view|deposit|withdraw]` `/shop` `/monthly shop` `/convert jades`\n `/buy [character|chest|exchange|monthly]`\n`/give [characters|coins|premium|pass]`\n`/sell [all|characters|dupes]` `/trade`" },
                { name: "<:sword:941687282585468958> Dungeon & Progress", value: "`/dungeon` `/select` `/level` `/levelup` `/quests` `/class [info|level|pick|select|switch|transfer|upgrade]`\n`/convert [scrolls|shards]` `/achievements`\n`/curse [info|list]` `/daily` `/weekly` `/disassemble [all|items]` `/merge` `/forge` `/rank` `/ep`\n`/fish` `/feed` `/items [loot|armor|weapon|ring]`\n`/preset [edit|select|view]` `/item [info|equip|unequip|levelup|list|lock|unlock|rename|wishlist]`" },
                { name: "🎉 Game Modes & Events", value: "`/trial` `/arena` `/top` `/party [create|view|edit|invite|join|kick|leave|dissolve]`\nRecurrent: `/stampede` `/rolling cow`\nSeasonal: `/boss hunt` `/boss rush` `/christmas craze` `/liminal descent`" },
                { name: "🏰 Guilds & Raids", value: "`/raid` `/rankup exam` `/skill [upgrade|view]` `/guild [create|claim|top|find|view|invite|join|edit|donate|donations|levelup|upgrade|promote|demote|kick|leave|ban|unban]` `/guild shop`" },
                { name: "🎭 Fun & Cosmetics", value: "`/profile` `/skins` `/backgrounds` `/background search` `/background select` `/changeimg` `/guess character` `/ruin`" },
                { name: "🎐 Utility & Other", value: "`/support` `/terms` `/settings` `/camelot` `/referral` `/avatar` `/delay` `/faq` `/math`" }
            )
                .setFooter({ text: `Camelot ${Package.version} • Made by Apollo24 & PokeLinker`, iconURL: "https://i.imgur.com/RbLjdQ4.png" });
            return interaction.reply({ embeds: [Embed] });
        };

        // Shortcut reassignment
        switch (helpCommand) {
            case "cooldown": helpCommand = "cd"; break;
            case "guess": helpCommand = "guess character"; break;
            case "lvl": helpCommand = "level"; break;
            case "lb": helpCommand = "lootbox"; break;
            case "lvlup": helpCommand = "levelup"; break;
            case "ref": helpCommand = "refine"; break;
        };

        // Help pages
        const command = interaction.client.slashCommands.get(helpCommand);
        const Embed = new EmbedBuilder()
            .setTitle(`Help: ${command ? "/" : ""}${helpCommand}`)
            .setColor(embedColor)
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setFooter({ text: `Camelot ${Package.version} • Made by Apollo24 & PokeLinker`, iconURL: "https://i.imgur.com/RbLjdQ4.png" });

        // Consolidated help descriptions
        switch (helpCommand) {
            case 'achievements':
                Embed.setDescription("**Usage**: </achievements:1013464934065131551>\n**Options**: `page`, `user`\n\nShows your progress for each achievement along with the completion rewards. Completion rewards for achievements include tickets, coins, shards, and profile XP.\n\nFeeling lost? Try [Camelot Library's Achievements page](https://docs.google.com/spreadsheets/d/1oASLXTBaCrx-39U_Fc165fd_KYXruuCpGg2gpSKXjX0/edit?gid=1997422482#gid=1997422482), with all their info and the quickest way to complete each one, made *by players, for players*. \n\n**Options**\n`page`: Directly jump to the page you want to see\n`user`: See another players progress");
                break;
            case 'anime':
                Embed.setDescription("**Usage**: </anime:1012334279117766726>\n**Options**: `page`, `user`, `filter`\n\nThis command will list all **" + auniq.length + "** anime (and non anime actually) included in our database in alphabetical order, together with your completion progress next to the title. Completed ones will have a check mark instead <a:check:873196253276700682>\n\n**Options**\n`page`: Directly jump to the page you want to see\n`user`: See another players progress\n`filter`: Filter out either completed or missing animes (missing will be sorted by number missing)");
                break;
            case 'balance':
                Embed.setDescription("**Usage**: </balance:1012316379015299083>\n**Options**: `currency`, `user`\n\nDisplays your balance.\n\n**Options**\n`currency`: Choose the type of currency to view (coins, gems, lilies, jades, stamps, and marks)\n`user`: See another players balance");
                Embed.setImage("https://i.ibb.co/ZzLVykkW/image.png");
                break;
            case 'bank deposit':
                Embed.setDescription("**Usage**: `/bank deposit`\n**Options**: `amount`\n\nDeposit coins into your bank. Still unclear? Check `/faq search:bank_tips`!\n\n**Options**\n`amount`: Choose the amount of <:coins:872926669055356939> you want to deposit");
                break;
            case 'bank view':
                Embed.setDescription("**Usage**: `/bank view`\n**Options**: `user`\n\nView your own bank or the bank of another user. Depositing money into your bank grants additional character levels depending on how close to full your bank is. Still unclear? Check `/faq search:bank_tips`!\n\n**Options**\n`user`: Choose a user whose bank you want to view.");
                break;
            case 'bank withdraw':
                Embed.setDescription("**Usage**: `/bank withdraw`\n**Options**: `amount`\n\nWithdraw money from your bank. Decreases the amount of additional character levels in your bank when withdrawn. Still unclear? Check `/faq search:bank_tips`!\n\n**Options**\n`amount`: Choose the amount of <:coins:872926669055356939> you want to withdraw");
                break;
            case 'buy character':
                Embed.setDescription("**Usage**: `/buy character item:<character pack ID>`\n\nBuy a character pack from the `/shop`. There is no limit to the amount of packs you can buy.\n\n *Note: <:SSTier:869316489931546644> **Tier** characters are excluded from **Morpheus Blessing** (character pack #6), which only works until the user has no less than 300 characters left unowned.*");
                break;
            case 'buy chest':
                Embed.setDescription("**Usage**: `/buy chest`\n**Options**: `item`\n\nBuys a particular chest type of the player's choosing. All chest types and prices are listed in the chest section of `/shop`. Refer to `/item info: (chest type)` to see drop rates for each item rarity.\n\n**Options**\n`item`: Choose what type of chest to buy.");
                break;
            case 'buy exchange':
                Embed.setDescription("**Usage**: `/buy exchange`\n**Options**: `item`\n\nBuys a legendary or mythical item with legendary or mythical points if that item is available in the exchange shop. Available items randomly rotate every 24 hours. Use `/shop option:exchange` for information about the currently available items and their exchange point costs. Exchange points are obtained by disassembling items of their respective rarities.\n\n**Options**\n`item`: Choose what item you want to exchange points for in the shop.");
                break;
            case 'buy monthly':
                Embed.setDescription("**Usage**: `/buy monthly`\n**Options**: `item`\n\nBuy an item from the monthly shop. Use `/monthly shop` to access the available items for purchase.\n\n**Options**\n`item`: Choose what item you want to buy from the monthly shop.");
                break;
            case 'daily':
                Embed.setDescription("**Usage**: </daily:1011371510759428136>\n\nUsed to claim daily coins. The amount of <:coins:872926669055356939> is proportional to your account level and daily streak. Starting with **600** <:coins:872926669055356939>, each level and streak add **+10** <:coins:872926669055356939> to it. Premium users additionally have a multiplier between **120**-**600**%.");
                break;
            case 'fav':
                Embed.setDescription("**Usage**: `/fav character:<character name or ID>`\n\nSelect your favourite character. You have to own it to be able to select it. The image of that character will then be displayed as a thumbnail on various commands of yours like on your `/profile` or `/level`.");
                break;
            case 'find':
                Embed.setDescription("**Usage:** `/find <character name or ID>`\n**Options:** `character, page, settings`\n\nFind users who own a character in your server. If there are multiple users owning that character, it will be sorted according to the amount of copies they have. You can choose for your name not to be displayed in find by using the “settings” flag.\n\n**Options**\n`character:` Identifies the character that is being looked for through ID or name.\n`page:` Select a page to jump to.\n`settings:` Decide what you want to be visible on /find: \n         1) Show all my cards\n 2) Show only my dupes\n 3) Don't show any of my cards");
                break;
            case 'give characters':
                Embed.setDescription("**Usage:** `/give characters`\n**Options:** `user, characters`\n\nGives one or more characters to another user. This command is only accessible for users with a `/profile` level of 25+. The maximum number of characters that can be given through a single command is 200.\n\n**Options**\n`user:` Select the user you intend to give one or more characters to.\n`characters:` List the name(s) of the character/characters you intend to give to another user (separated by commas (,)).");
                break;
            case 'give coins':
                Embed.setDescription("**Usage:** `/give coins`\n**Options:** `user, amount`\n\nGive coins to another player. This command is only accessible for users with a `/profile` level of 25+. The maximum number of coins that can be given to another player with a single command usage is 10 million.\n\n**Options**\n`user:` Select the user you intend to give coins to.\n`amount:` Write the number of coins you intend to give to another user.");
                break;
            case 'give pass':
                Embed.setDescription("**Usage:** `/give pass`\n**Options:** `user`\n\nGive a premium event pass to another player at the cost of 1000 jades. Event passes rotate seasonally.\n\n**Options**\n`user:` Select the user you intend to give a premium pass to.");
                break;
            case 'give premium':
                Embed.setDescription("**Usage:** `/give premium`\n**Options:** `user, tier`\n\nGives Tier 1 or Tier 2 premium to another player. Only available for players with Tier 3+ premium. More details in `/premium` (Patreon link).\n\n**Options**\n`user:` Select the user you intend to give the premium to.\n`tier:` Choose the tier you intend to give to another player.");
                break;
            case 'gift':
                Embed.setDescription("Use `/trade` to exchange characters with other users. Sending characters directly as a gift is not supported.");
                break;
            case 'info':
                Embed.setDescription("**Usage**: </info:1011767316272402542>\n**Options**: `character`, `flag`, `user`\n\nSearch a character in our database. You don't have to use the character's full name as long as there's no other match fitting your search. Using </info:1011767316272402542> without any options will show the detailed view of your current equipped character.\n\n**Options**\n`character`: The name or ID of the character you want to search\n`flag`: How you want the result to be returned\n`user`: See another users character\n\n**Flags**\n`base`: Returns the base values for the character\n`my`: Returns your own character\n`detailed`: Returns your own character with more details on stats");
                break;
            case 'inventory':
                Embed.setDescription("**Usage**: </inventory:1012393731695050852>\n**Options**: `sort`, `page`, `user`, `ephemeral`\n\nSee your character inventory. Characters will be sorted by rarity by default. Characters with the ✨ icon have abilities. See `/help ability` for more information on abilities, and characters with 🔒icon means they are locked characters. \n\n**Options**\n`sort`: Choose in what order your characters should be listed\n`page`: Directly jump to the page you want to see\n`user`: See another players characters\n`ephemeral:` Choose whether other people can see you using the command.\n\n**Sorting Options**\n`alphabetical`: Sort by name\n`chronological`: Sort by the time acquired\n`rarity`: Sort by rarity\n`dupes`: Sort by rarity & number of duplicates");
                break;
            case 'level':
                Embed.setDescription("**Usage:** `/level` \n**Options:** `user`\n\nSee your current level and how much more XP you need to level up alongside a progress bar. XP is obtained via `/pull`, `/quests`, and `/achievements`. \nYou get **1-10** XP for each pull when using `/pull`. <:STier:869316518675095552>-Tier characters will give you twice the amount of XP, and <:SSTier:869316489931546644>-Tier characters give an extra **20** XP on top of what you would've gotten. When using `/pull all` all cards give 5 XP per pull regardless of rarity. Leveling up helps unlock classes (`/help class list`) every 10 levels; Furthermore, it unlocks a ring slot at level 100. Finally, every +1 Account Level increases your `/daily` coins by +10.\n\n**Options**\n`user:` Select the user whose level you want to see.");
                break;
            case 'list':
                Embed.setDescription("**Usage:** `/list `\n**Options:** `rarity`, `filter`, `page`, `user`\n\nGet a list of all characters of a rarity. The characters will be shown together with their series and sorted accordingly. Owned characters will have a check mark next to them <a:check:873196253276700682>\n\n**Options**\n`rarity:` Choose the rarity of characters you want to check, ranging from D to EX.\n`filter:unowned` See all the unowned characters of that rarity. \n`page:` Directly jump to the page of the character list you want to see.\n`user:` See the list of characters of other users.");
                break;
            case 'lootbox':
                Embed.setDescription("**Usage**: `/lootbox`\n\nSee how many lootboxes you've left. You can open them using `/open` or `/use item:lootbox`. Three loot boxes are obtained each time you vote.");
                break;
            case 'open':
                Embed.setDescription("**Usage:** `/open`\n**Options:** `item`\n\nOpen a loot box or a chest of your choice.\n\n**Options**\n`item:` Choose the item you would like to open up to 1000 at once (either a loot box or a type of chest).");
                break;
            case 'pity':
                Embed.setDescription("**Usage**: `/pity`\n**Options:** `user`\n\nIf players don't get an <:STier:869316518675095552>-Tier or <:SSTier:869316489931546644>-Tier character in their last 80 and 210 pulls, their next pull will be a guaranteed <:STier:869316518675095552>-Tier or <:SSTier:869316489931546644>-Tier character. `/pity` will show your progress. Note that premium users will have a lower pity.\n\n**Options**\n`user:` Select the user whose pity you want to see");
                break;
            case 'profile':
                Embed.setDescription("**Usage:** </profile:1010583712527810641>\n**Options:** `user`, `type`, `quality`, `force-static`, `bio`, `color`, `custom-color-1`, `custom-color-2`\n\nGenerates a profile card of a given player including stats like level, balance, dungeon progress, equipped items, class, premium status, character stats and more.\n\n**Options**\n`user:` See another player's profile.\n`type:` Choose between the new (image) or old (legacy) layouts.\n`quality:` Change the image resolution.\n`force-static:` Force the image to be static (not a gif).\n`bio:` Set a custom bio to be displayed on your profile.\n`color:` Choose between predefined color options.\n`custom-color:` Enter Hex codes of custom colors for your profile (premium only).");
                break;
            case 'pull':
                Embed.setDescription("**Usage:** `/pull`\n**Options:** `premium`\n\nPull a character. You can use this command 5 times every 45 minutes (see `/premium` for differences of premium users). You can reset your pulls with `/rp` after you have voted to get additional pulls. Increases profile XP after every pull. View `/help level` to see XP gains. Between rank D - A you get a random amount of exp between 1-10, and this number gets doubled on S rank. Upon pulling an SS rank, you get an 20 extra on top of what you would've gotten.\n\n**Options**\n`premium:` Use all your available pulls at once (premium only).");
                Embed.addFields([{ name: 'Droprates', value: "<:SSTier:869316489931546644> **Tier**: 0.2%\n<:ATier:869316558013464627> **Tier**: 3.8%\n<:CTier:869316602858991657> **Tier**: 24.8%", inline: true }, { name: '_ _', value: "<:STier:869316518675095552> **Tier**: 1.2%\n<:BTier:869316586803179571> **Tier**: 10.4%\n<:DTier:869316616071032843> **Tier**: 59.6%", inline: true }]);
                break;
            case 'search':
                Embed.setDescription("**Usage:** `/search`\n**Options:** `anime`, `flags`, `page`, `user`\n\nSearch for a particular anime and filter for specific details.\n\n**Options**\n`anime:` Search for an anime to list all characters of it.\n`flags:` Check either images or missing characters only.\n`page:` Search for the character page of the anime to be viewed.\n`user:` Search for an anime for a particular user.\n\n**Flags**\n`image:` See the images of all characters from an anime.\n`missing:` See all missing characters from a particular anime.");
                break;
            case 'sell all':
                Embed.setDescription("**Usage:** `/sell all`\n**Options:** `rarity`\n\nSell all of your characters, or all characters of a specific rarity. Ability ss characters are included when selling all characters.\n\n**Options**\n`rarity:` Select the rarity of characters to be sold.");
                Embed.addFields({ name: 'Values', value: "<:SSTier:869316489931546644> **Tier**: 5000<:coins:872926669055356939>\n<:ATier:869316558013464627> **Tier**: 500<:coins:872926669055356939>\n<:CTier:869316602858991657> **Tier**: 100<:coins:872926669055356939>", inline: true }, { name: '_ _', value: "<:STier:869316518675095552> **Tier**: 1000<:coins:872926669055356939>\n<:BTier:869316586803179571> **Tier**: 250<:coins:872926669055356939>\n<:DTier:869316616071032843> **Tier**: 50<:coins:872926669055356939>", inline: true });
                break;
            case 'sell characters':
                Embed.setDescription("**Usage:** `/sell characters`\n**Options:** `character`\n\nSell a specific set of characters. In return, you get coins and 16 shards equal to that character's rank.\n\n**Options**\n`character:` Choose the characters to be sold (separated by commas).");
                Embed.addFields({ name: 'Values', value: "<:SSTier:869316489931546644> **Tier**: 5000<:coins:872926669055356939>\n<:ATier:869316558013464627> **Tier**: 500<:coins:872926669055356939>\n<:CTier:869316602858991657> **Tier**: 100<:coins:872926669055356939>", inline: true }, { name: '_ _', value: "<:STier:869316518675095552> **Tier**: 1000<:coins:872926669055356939>\n<:BTier:869316586803179571> **Tier**: 250<:coins:872926669055356939>\n<:DTier:869316616071032843> **Tier**: 50<:coins:872926669055356939>", inline: true });
                break;
            case 'sell dupes':
                Embed.setDescription("**Usage:** `/sell dupes`\n**Options:** `rarity`, `copies`\n\nSell all dupes (including ability SS dupes!) or all dupes of a specific rarity, or choose a number of dupes to keep from each character.\n\n**Options**\n`rarity:` Select the rarity of characters to be sold.\n`copies:` Choose the number of copies of the dupes sold to keep.");
                Embed.addFields({ name: 'Values', value: "<:SSTier:869316489931546644> **Tier**: 5000<:coins:872926669055356939>\n<:ATier:869316558013464627> **Tier**: 500<:coins:872926669055356939>\n<:CTier:869316602858991657> **Tier**: 100<:coins:872926669055356939>", inline: true }, { name: '_ _', value: "<:STier:869316518675095552> **Tier**: 1000<:coins:872926669055356939>\n<:BTier:869316586803179571> **Tier**: 250<:coins:872926669055356939>\n<:DTier:869316616071032843> **Tier**: 50<:coins:872926669055356939>", inline: true });
                break;
            case 'shop':
                Embed.setDescription("**Usage:** `/shop`\n**Options:** `option`\n\nThis command opens a shop from which you can buy a variety of items such as chests, characters, premium tiers, and more.\n\n**Options**\n`option:` Select a page in the shop to view.\n\n**Flags**\n`character packs:` View the character packs section of the shop.\n`chests:` View the chests section of the shop.\n`exchange:` View the item exchange section of the shop.\n`premium:` View the premium section of the shop.");
                break;
            case 'stats':
                Embed.setDescription("**Usage:** `/stats`\n**Options:** `user`\n\nViews the % and quantity of total cards collected for either yourself and for another player. In addition, number and % of all series, waifus, husbandos, and rarities collected separately.\n\n**Options**\n`user:` View the stats of another user.");
                break;
            case 'tickets':
                Embed.setDescription("**Usage:** `/tickets`\n**Options:** `user`, `open`, `amount`\n\nThis command will show or open your tickets if you have any. Tickets are obtainable from loot boxes (`/vote`), from `/weekly`, from the monthly shop, events, and achievements. \n\n**Options**\n`user:` View the tickets of another user.\n`open:` Open a certain type of ticket ranging from D to SS tickets.\n`amount:` Select the number of tickets to be opened.");
                break;
            case 'top':
                Embed.setDescription("**Usage:** `/top`\n**Options:** `scope, flag, page`\n\nView the leaderboard of a particular type (such as lilies, class, coins, stampede, etc).\n\n**Options**\n`scope:` Choose between the global or server leaderboard of a specific type.\n`flag:` Choose the type of leaderboard to be viewed.\n`page:` View a particular page of the leaderboard.");
                break;
            case 'trade':
                Embed.setDescription("**Usage:** `/trade`\n**Options:** `user`, `give`, `receive`\n\nTrade a character with another user. The other user has 15 seconds to accept the trade before it is automatically canceled.\n\n**Options**\n`user:` Select the user to trade with.\n`give:` Select the character to give to the other user.\n`receive:` Request the character to be received from the other user.");
                break;
            case 'quests':
                Embed.setDescription("**Usage:** `/quests`\n**Options:** `user`\n\nView your quests or the quests of another user.\n\n**Options**\n`user:` Select the user whose quests you want to view.");
                break;
            case 'ability':
                Embed.setDescription("**Usage**: </ability:1014178280376647721>\n**Options**: `character`, `page`, `user`, `filter`\n\nLists all characters who have a unique ability\nCharacter abilities can be used through the ⚜️ ABILITY button in the `/dungeon`, `/arena`, `/trial` and more.\n\nIn `/ability`, you might find certain terms that refer to the mechanics during the fight. For instance:\n> - **Total Usage** refers to the amount of times in total that you may use the character's ability in one fight.\n> - **Mana/Cost** means the amount of Mana consumed to use the ability that turn. Some use other metrics, such as HP (e.g. David Martinez) or even Fish (Juliette).\n> - **Timeout** is whether the turn is skipped or not whenever you use the ability. If it's \"yes\", it means you can't use the ability and another action, as it counts as your whole turn.\n\nYou will also find the [Community Builds](https://sites.google.com/view/camelotbuilds/universal-builds/rolling-cow-builds?authuser=0) button which redirects to a website, with information meant to help you illustrate how one may use certain abilities depending on their main role, and gamemode, made *by players, for players*. You can find builds for different gamemodes and learn about the usages of each Ability SS/EX.\n\n**Options**\n`character:` Show details on a specific character's ability.\n`page:` Directly jump to the page you want to see.\n`user:` See which ability chars someone owns.\n`filter:` List only a certain type of ability (active, passive, or party).");
                break;
            case 'arena':
                Embed.setDescription("**Usage**: `/arena`\n**Options**: `user`\n\nThe user challenges a player to a battle. The user can also challenge the bot itself to a match.\n\n**Options**\n`user`: Selects the user that the command user wants to battle");
                break;
            case 'class info':
                Embed.setDescription("**Usage:** `/class info`\n**Options:** `class`\n\nProvides statistics and information about a particular chosen class. If you want more information on the specifics of each class type, check `/faq search:class_stat_gains`!\nThe class' DEF and Magic Resist are capped to 300%.\n\n**Options**\n`class:` Choose the class which you want to see information about.");
                break;
            case 'class level':
                Embed.setDescription("**Usage:** `/class level`\n**Options:** `class`, `user`\n\nGives the class level of a particular user in a particular class.\n\n**Options**\n`class:` Choose the class which you want to see information about.\n`user:` Choose the user whose class level you want to see.");
                break;
            case 'class list':
                Embed.setDescription("**Usage:** `/class list`\n\nProvides a list of all available classes. New classes are unlocked every 10 `/profile` levels with `/class pick`. Checkmarks indicate that the player owns the class.");
                break;
            case 'class pick':
                Embed.setDescription("**Usage:** `/class pick`\n\nShows a menu of all choosable beginner classes and allows you to pick a new beginner class every 10 profile levels. Every new advanced class gives a +5% xp boost and every new master class gives a +15% xp boost when grinding. These are higher-level versions of the beginner classes that stem from them.");
                break;
            case 'class select':
                Embed.setDescription("**Usage:** `/class select`\n**Options:** `class`\n\nAllows the player to switch to an owned class, including a beginner or advanced class even after achieving its master class.\n\n**Options**\n`class:` Choose the class which you want to use.");
                break;
            case 'class switch':
                Embed.setDescription("**Usage:** `/class switch`\n**Options:** `to`\n\nSwitch to a different class path from your current path. The user can only switch paths once the current path has reached master class, and all XP is transferred when the user switches paths from one master class to the other. Cost per transfer is 100 genesis gems.\n\n**Options**\n`to:` Class path you want to switch to.");
                break;
            case 'class transfer':
                Embed.setDescription("**Usage:** `/class transfer`\n**Options:** `from`, `to`\n\nTransfer your XP from one master class to another. Each XP transfer costs 30 genesis gems.\n\n**Options**\n`from:` The class you want to transfer xp from.\n`to:` The class you want to transfer xp to");
                break;
            case 'class upgrade':
                Embed.setDescription("**Usage:** `/class upgrade`\n**Options:** `class`\n\nUpgrade from a beginner class to an advanced class, or from an advanced class to a master class. Every new advanced class gives a +5% xp boost and every new master class gives a +15% xp boost when grinding/farming.\n\n**Options**\n`class:` The class you want to upgrade to.");
                break;
            case 'convert jades':
                Embed.setDescription("**Usage:** `/convert jades`\n**Options:** `amount`\n\nConvert a number of jades of your choosing to gems. All jade-to-gem conversions are irreversible. \n\n**Options**\n`amount:` Amount of jades you want to convert to gems.");
                Embed.setImage("https://i.ibb.co/ZzLVykkW/image.png");
                break;
            case 'convert scrolls':
                Embed.setDescription("**Usage:** `/convert scrolls`\n**Options:** `type`, `from`, `to`, `amount`\n\nConverts one type of scroll of a certain rarity to the same type of scroll of a different rarity. The conversion rate from one rarity to the next best rarity is 1:5.\n\n**Options**\n`type:` Type of scroll being converted: armor or weapon scroll.\n`from:` Rarity of scrolls converted from.\n`to:` Rarity of scrolls converted to.\n`amount:` Amount of scrolls being converted to.");
                Embed.setImage("https://i.imgur.com/hHb0vaY.jpeg");
                break;
            case 'convert shards':
                Embed.setDescription("**Usage:** `/convert shards`\n**Options:** `from`, `to`, `amount`\n\nConverts one rarity of shards to a different rarity. The conversion rate from one rarity to the next best rarity is 1:4. Shards are used to `/refine` characters.\n\n**Options**\n`from:` Rarity of shards converted from.\n`to:` Rarity of shards converted to.\n`amount:` Amount of shards being converted to.");
                break;
            case 'curse list':
                Embed.setDescription("**Usage**: `/curse list`\n\nProvides a list of all curses in the bot");
                break;
            case 'curse info':
                Embed.setDescription("**Usage:** `/curse info`\n**Options:** `curse`\n\nProvides information about a specific curse.\n\n**Options**\n`curse:` The curse you want to learn information about.");
                break;
            case 'dungeon':
                Embed.setDescription("**Usage:** `/dungeon <floor_number>`\n\nFight monsters in the dungeon to obtain rare rewards such as coins, shards and other items. To get started, you will need to select a character to use in the dungeon. Choose a character from your `/inventory` with `/select <char>`. \nTo go to the next floor, you must defeat monsters of your current floor a certain number of times. Every 5th floor is a Boss floor, which will require less clears to fully pass compared to a regular floor. The last ten floors of every difficulty consist of only boss floors (floor 90-100).\n\n**Battle Mechanics**\n`ATK` ⚔️: Deal damage to your opponent.\n`DEF` 🛡️: Increase your defense and grants a chance to block attacks.\n`SKIP` ⏩: Skip to the results.\n`ABILITY` ✨: Some SS-Tier & EX-Tier characters have unique abilities you can use during the battle. You can get a list of all characters with abilities using `/ability` and get more information on a character's ability with `/ability <char>`.\n`CLASS ABILITY` :fleur_de_lis:: Class abilities are usable in the dungeon when pressing the :fleur_de_lis: icon. `/class info` to see the details of the class you want to see. ");
                break;
            case 'ep':
                Embed.setDescription("**Usage:** `/ep`\n**Options:** `hp`, `atk`, `def`, `crit_rate`, `crit_damage`, `dodge`\n\nCalculates EP based on inputted `hp`, `atk`, `def`, `crit_rate`, `crit_damage` and `dodge`.\n*Note: Crit rate, crit damage and dodge chance are added as percentages (if you have 10% crit rate, you'd input it as 0.10).*\n\n**Options**\n`hp:` Amount of HP inputted.\n`atk:` Amount of ATK inputted.\n`def:` Amount of DEF inputted.\n`crit_rate:` Amount of crit rate inputted.\n`crit_damage:` Amount of crit damage inputted.\n`dodge:` Amount of dodge % inputted.");
                break;
            case 'feed':
                Embed.setDescription("**Usage**: </feed:1157778598447558728>\n**Options**: `use`, `amount`\n\nFeed your character with fish up to 20 times a day, which can be earned through </fish:1087099255652622429>. This will earn your character \"xp\" which is essentially coins invested into character levels. The amount of XP received depends on the rarity of the fish eaten. Every 1 XP gained from </feed:1157778598447558728> is 1 less coin needed for </levelup:1014310261223592047>.\n\n**Options**\n`use`: The type of fish you want to use\n`amount`: Amount of fish to use | Keywords: `max`");
                break;
            case 'forge':
                Embed.setDescription("**Usage:** `/forge`\n**Options:** `item, grade, page`\n\nForges a weapon, shield, or armor piece from the forgery using a variety of materials. Using `/forge` alone displays a list of all items that can be forged.\n\n**Options**\n`item:` Write the name or ID of the item to be forged.\n`grade:` Filter for a specific gear grade.\n`page:` Select a page of the forgery to jump to.");
                break;
            case 'item equip':
                Embed.setDescription("**Usage:** `/item equip`\n**Options:** `items`\n\nEquip your character with an item using its ID, which can be found in `/items weapon`, `/items armor`, or `/items ring`. You may change the ID with `/item rename` (T3+ `/premium`).\n\n**Options**\n`items:` Enter the item ID.");
                break;
            case 'item info':
                Embed.setDescription("**Usage:** `/item info`\n**Options:** `items`, `flag`\n\nSelect an item to check information about.\n\n**Options**\n`items:` List the items to check either with the item ID or item name (separate by commas if looking at multiple items.\n`flag:` Choose whether to look at your own individual item or the base un-upgraded version of the item.");
                break;
            case 'item levelup':
                Embed.setDescription("**Usage:** `/item levelup`\n**Options:** `id`, `flag:max`\n\nUpgrade a weapon's stats using resources (will be listed when running the command). If the player lacks the resources necessary to level up an item, it will be stated when attempting to run the command.\n\n**Options**\n`id:` Select the ID of the weapon you intend to level up.\n`flag:max` Upgrade the item to level 120 if you have sufficient resources.");
                break;
            case 'item list':
                Embed.setDescription("**Usage:** `/item list`\n**Options:** `type`\n\nList out every item of a certain type.\n\n**Options**\n`type:` Select the type of item to be listed.");
                break;
            case 'item lock':
                Embed.setDescription("**Usage:** `/item lock`\n**Options:** `items`\n\nLock a particular item or set of items such that they cannot be disassembled. Note that locking an item is case sensitive. The total number of items you can lock is 500. \n\n**Options**\n`items:` List out the IDs of the items to be locked (separated by commas).");
                break;
            case 'item rename':
                Embed.setDescription("**Usage:** `/item rename`\n**Options:** `before`, `after`\n\nChange the ID of an item. T3+ only feature, but IDs remain changed even if premium ends.\n\n**Options**\n`before:` Enter the current ID to be changed.\n`after:` Enter the new ID of the item to be changed to.");
                break;
            case 'item unequip':
                Embed.setDescription("**Usage:** `/item unequip`\n**Options:** `type`\n\nUnequip a certain type of item the player is currently wearing.\n\n**Options**\n`type:` Select the type of item to unequip (can also unequip all types at once).");
                break;
            case 'item unlock':
                Embed.setDescription("**Usage:** `/item unlock`\n**Options:** `items`\n\nUnlock a particular item or set of items such that they can be disassembled. \n\n**Options**\n`items:` List out the IDs of the items to be unlocked (separated by commas).");
                break;
            case 'item wishlist':
                Embed.setDescription("**Usage:** `/item wishlist`\n**Options:** `add`\n\nAdd a particular item or set of items to the player's wishlist using the ID of the item. Doubles the chances of obtaining the wishlisted item when opening a chest.\n\n**Options**\n`add:` List out the IDs of the items to be added to the wishlist (separated by commas).");
                break;
            case 'items armor':
                Embed.setDescription("**Usage:** `/items armor`\n**Options:** `user`, `page`, `type`, `flag`\n\nSee the armor inventory of a player, using a variety of sorting options.\n\n**Options**\n`user:` Select the user whose armor you want to see.\n`page:` Directly jump to the armor page you want to see.\n`type:` Filter for a certain type of armor.\n`flag:` See detailed descriptions of the user's armor pieces.");
                break;
            case 'items loot':
                Embed.setDescription("**Usage:** `/items loot`\n**Options:** `user`, `page`, `type`\n\nSee the loot inventory of a player, using a variety of sorting options.\n\n**Options**\n`user:` Select the user whose loot you want to see.\n`page:` Directly jump to the loot page you want to see.\n`type:` Filter for a certain type of loot.");
                break;
            case 'items ring':
                Embed.setDescription("**Usage:** `/items ring`\n\n**Options:** `user`, `page`, `flag`\n\nSee the rings inventory of a player, using a variety of sorting options. Curious about rings? Check out our [equipment list](https://docs.google.com/spreadsheets/d/14XWrGmRJ9PIaGhgmlJ23CMINTSmTHpA00RvSAQ_tZLc/edit?usp=drivesdk), made *by players, for players*. \n\n**Options**\n`user:` Select the user whose rings inventory you want to see. \n`page:` Directly jumps to the ring page you want to see. \n`flag: detailed:` See detailed description of the user's rings.");
                break;
            case 'items weapon':
                Embed.setDescription("**Usage:** `/items weapon`\n**Options:** `user`, `page`, `type`, `flag`\n\nSee the weapon inventory of a player, using a variety of sorting options.\n\n**Options**\n`user:` Select the user whose weapon inventory you want to see.\n`page:` Directly jump to the weapon page you want to see.\n`type:` Filter for a certain type of weapon.\n`flag:` See detailed descriptions of the user's weapons.");
                break;
            case 'levelup':
                Embed.setDescription("**Usage:** `/levelup`\n**Options:** `by`\n\nIncreases the player's character level by the number of levels requested at an increasing cost of +100 coins per level. Levelup starts at 500 coins at character level one. Alternatively, take a look at `/help command:bank view` before you begin to level up, as it also helps with additional levels.\n\n**Options**\n`by:` Choose the number of levels to level up by.");
                break;
            case 'rank':
                Embed.setDescription("**Usage:** `/rank`\n**Options:** `scope`, `page`, `user`\n\nRank all characters of a specific scope by EP.\n\n**Options**\n`scope:` Choose the scope of all characters ranked (base, inventory, server, or global).\n`page:` Select the rankings page to view.\n`user:` Select the user whose character EP rankings you want to view\n\n**Flags**\n`base:` Check the EP ranking of all base characters.\n`inventory:` Rank the EP of all characters in your inventory.\n`server:` Rank the EP of all characters in your server.\n`global:` Rank the EP of all characters globally.");
                break;
            case 'refine':
                Embed.setDescription("**Usage:** `/refine character`\n**Options:** `character`\n\nIncrease the refinement level of your character using shards of their respective rarity. This significantly increases the character's base stats. You need 16 shards for refinement level one and another +16 for every subsequent rarity, maxing out at 96 shards, for a total of 336 shards. The maximum refinement level is 6. Refinements are account-bound and cannot be reversed. First 5 refinements increase stats, while the 6th (last) one changes the character's expertise to \"Any\".\n\n**Options**\n`character:` Choose a character to refine.");
                break;
            case 'select':
                Embed.setDescription("**Usage:** </select:1012477601157238866>\n**Options:** `character`, `mode`\n\nSelect a character to use in `/dungeon`, `/arena`, `/trial`, etc. Can also select a character for the stampede event using the mode option.\n\n**Options**\n`character:` Select the character (name or ID) you want to use.\n`mode:` Select a character for the stampede event.");
                break;
            case 'shards':
                Embed.setDescription("**Usage**: `/shards`\n**Options:** `user`\n\nThis command will show all your shards <:shards:1034179284610596965>. They're used to `/refine` characters. Refining characters gives them a power boost, and the cost of refinement goes up every time you refine that character (max 6). \n\nYou can obtain them in the dungeon, through loot boxes or achievements and events. Additionally you can convert shards from lower rarities to higher rarities using the `/convert shards` command. Look at `/help convert shards` for more info.\n\n**Options:**\n`user:` View the number of shards another user has");
                break;
            case 'upgrade':
                Embed.setDescription("**Usage**: `/class upgrade class:<class_name>`\n\nSpend 💎 Gems to upgrade an unlocked class to the next tier, improving its effects or unlocking new ones.");
                break;
            case 'guild ban':
                Embed.setDescription("**Usage:** `/guild ban`\n**Options:** `user`\n\nBan a user of your choice from your guild using their user or UserID. Only accessible to elders and guild masters.\n\n**Options**\n`user:` Choose the user you intend to ban.");
                break;
            case 'guild claim':
                Embed.setDescription("**Usage:** `/guild claim`\n\nClaim a guild if its Guild Master and Elders have been inactive for more than 30 days.");
                break;
            case 'guild create':
                Embed.setDescription("**Usage:** `/guild create`\n**Options:** `name`\n\nCreate a new guild. It costs 20k Coins. Check `/help guild levelup` for Guild Upgrade costs.\n\n**Options**\n`name:` Choose the name of the guild to be created.");
                break;
            case 'guild demote':
                Embed.setDescription("**Usage:** `/guild demote`\n**Options:** `user`\n\nDemote a user in your guild.\n\n**Options**\n`user:` Select the user you intend to demote.");
                break;
            case 'guild donate':
                Embed.setDescription("**Usage:** `/guild donate`\n**Options:** `currency, amount`\n\nDonate a certain amount of coins or gems to your guild’s treasury. Coins are used to level the guild up. Gems are used to change the guild's invite code, and to reset guild buffs for guilds that are level 20 or above.\n\n**Options**\n`currency:` Select the type of currency (either gems or coins) that you intend to donate.\n`amount:` Select the amount of coins/gems you intend to donate.");
                break;
            case 'guild donations':
                Embed.setDescription("**Usage:** `/guild donations`\n**Options:** `id, page`\n\nLook up a guild’s donation history based on its id for each week.\n\n**Options**\n`id:` Enter the ID of the guild whose donation history you intend to view.\n`page:` Choose the page of donation history that you intend to view.");
                break;
            case 'guild edit':
                Embed.setDescription("**Usage:** `/guild edit`\n\nEdit an attribute of your guild such as the embed color, description, banner, icon, tax rate, join setting, or join code. It can also be used to rename your guild.\n*If you're having trouble with image links, feel free to seek advice in our `/support` server.*");
                break;
            case 'guild find':
                Embed.setDescription("**Usage:** `/guild find`\n**Options:** `name, page`\n\nFind a guild based on its name.\n\n**Options**\n`name:` Enter the name of the guild you intend to find.\n`page:` Select a page to view in the search results.");
                break;
            case 'guild invite':
                Embed.setDescription("**Usage:** `/guild invite`\n**Options:** `user`\n\nInvite a particular user to your guild.\n\n**Options**\n`user:` Select the user you intend to invite to your guild.");
                break;
            case 'guild join':
                Embed.setDescription("**Usage:** `/guild join`\n**Options:** `code`\n\nJoin a specific publicly available guild by entering its join code.\n\n**Options**\n`code:` Enter the join code of the guild you intend to join.");
                break;
            case 'guild kick':
                Embed.setDescription("**Usage:** `/guild kick`\n**Options:** `user`\n\nKick a particular user from your guild.\n\n**Options**\n`user:` Select the user to be kicked from the guild.");
                break;
            case 'guild leave':
                Embed.setDescription("**Usage:** `/guild leave`\n\nLeave your current guild. There is a 24 hour cooldown for joining another guild that starts after joining a new guild, which also grants a 7-day cooldown to participate in its raids.");
                break;
            case 'guild levelup':
                Embed.setDescription("**Usage:** `/guild levelup`\n\nLevels up your guild and gives you one token to spend on increasing either the guild XP or coin buff by 20% per level. \n\n**Guild Level-Up Costs**\n*Note: All subsequent levels after 20 increase by +10mil Gold every 10 Guild Levels.*");
                Embed.setImage("https://301.tv/TRKve");
                break;
            case 'guild promote':
                Embed.setDescription("**Usage:** `/guild promote`\n**Options:** `user`\n\nPromote a guild member either from a member to an elder, or from an elder to the guild master of a guild.\n\n**Options**\n`user:` Select the user to be promoted");
                break;
            case 'guild top':
                Embed.setDescription("**Usage:** `/guild top`\n**Options:** `sort`, `page`\n\nView the top ranking guilds by either level or performance on events.\n\n**Options**\n`sort:` Rank guilds either by level or by performance on events.\n`page:` Choose a leaderboard page to jump to.");
                break;
            case 'guild unban':
                Embed.setDescription("**Usage:** `/guild unban`\n**Options:** `user`\n\nUnban a user of your choice from your guild. Only accessible to elders and guild masters.\n\n**Options**\n`user:` Choose the user you intend to unban.");
                break;
            case 'guild upgrade':
                Embed.setDescription("**Usage:** `/guild upgrade`\n**Options:** `perk`\n\nAfter leveling up a guild, choose a guild perk to upgrade. The costs to level up a guild are listed in `/help guild levelup`. \n\n**Options**\n`perk:` Choose the perk you intend to upgrade. XP buff and Loot buff. In addition, raid buffs (HP, DEF, ATK) can only be upgraded after Loot Buffs and XP Buffs have both reached Level 10.");
                break;
            case 'guild view':
                Embed.setDescription("**Usage:** `/guild view`\n**Options:** `details`, `id`, `user`\n\nView the details of a guild of either a particular user or through the ID of the guild.\n\n**Options**\n`details:` View particular details about guild members (last online, weekly donations, and user ID).\n`id:` Search for a guild using its ID.\n`user:` Select a user whose guild you want to see.");
                break;
            case 'changeimg':
                Embed.setDescription("**Usage:** `/changeimg`\n**Options:** `character`, `image-url`\n\nThis command changes the primary image of a particular character. Only accessible to tier 3+ premium users. The amount of changes available depends on the tier (T3: 1 | T4: 5 | T5: 10 | T6: 30 | T7: All). The width to height ratio for images is 9:14 (225x350px is recommended). If you have issues uploading images onto imgur or imgbb, feel free to ask for help in our [Support Server](https://discord.gg/myy9PBCdEW).\n\n**Options**\n`character:` Select the character whose image you want to change.\n`image-url:` insert the [imgur.com](http://imgur.com) or [imgbb.com](http://imgbb.com) link for the picture you want to select.");
                break;
            case 'delay':
                Embed.setDescription("**Usage**: </delay:1011390481848082442>\n**Options**: `int`\n\n(Premium Only) This command allows you to change the animation delay in the `/dungeon` and similar commands to fit your preferences. It can be anything between 200-1200ms. 200 is recommended.\n\n**Options**\n`int`: Number of millisecond between 200-1200");
                break;
            case 'weekly':
                Embed.setDescription("**Usage**: </weekly:1011386049412476969>\n\nA premium command used to collect weekly rewards. Rewards vary based on premium tier (from 1 - 7) and can be found in our patreon, which is linked under `/premium`.");
                break;
            case 'fish':
                Embed.setDescription("**Usage**: </fish:1087099255652622429>\n\nThis command can be used once every **30** seconds to catch one of **" + items.reduce((count, e) => count += (e.category === "fish" ? 1 : 0), 0) + "** different fish.\nYou can feed fish to your characters, and there are 2 daily quests (`A Fishy Task` and `Another Fishy Task`) where you must fish. Fish that are caught can be fed to your character through </feed:1157778598447558728>, and XP obtained from feeding serves as a substitute for coins in leveling up your characters. \n\n**Drop Rates**\n<:mythical1:1041726768530329690><:mythical2:1041726767188168724><:mythical3:1041726765577556039><:mythical4:1041726763862065162> ➜ 0.03%\n<:legendary1:1041726519082491964><:legendary2:1041726517153112094><:legendary3:1041726515475382322><:legendary4:1041726512992366605> ➜ 0.47%\n<:unique1:1041730066272493578><:unique2:1041730063940468828><:unique3:1041730061163831437><:unique4:1041730057380573386> ➜ 4.5%\n<:rare1:1041731092031492106><:rare2:1041731088357281802><:rare3:1041731083965825096><:blank:917804200363171860> ➜ 18%\n<:special1:1041731419963150397><:special2:1041731418008600717><:special3:1041731415919833149><:special4:1041731414032392202> ➜ 30%\n<:normal1:1041732429397889054><:normal2:1041732425379762268><:normal3:1041732422145953892><:normal4:1041732419591622686> ➜ 47%\n*Note:There is a 20% chance players can fail to catch a fish*");
                break;
            case 'guess character':
                Embed.setDescription("**Usage:** `/guess character`\n**Options:** `difficulty, private`\n\nPlay a minigame in which you must correctly guess a character based on an image of that character. Correct guesses will earn players <:lilium:974057059618291732> which can be used to buy goods in `/monthly shop`. Pressing the “skip” button posted under the character to be guessed will skip to another character. Hints will decrease the amount gained, 10 at no hints, -2 for every letter, and -6 for anime. The default difficulty is Easy.\n\n**Options**\n`difficulty`: Choose the difficulty of guessing the character that you intend to guess.\n`private:` Choose whether other players are allowed to guess the character as well.");
                break;
            case 'random':
                Embed.setDescription("**Usage**: `/random`\n\nGet a random character suggestion from the database.");
                break;
            case 'ruin':
                Embed.setDescription("**Usage**: </ruin:1089176605588455594>\n**Options**: `title`\n\nThis command will attempt to ruin your favorite anime by only changing, adding or deleting 1 letter in the title.\n\n**Examples**: Sou**p** Eater, Lucky Sta**b** or Goblin **L**ayer\n\n**Options**\n`title`: The title of the anime you want to ruin");
                break;
            case 'avatar':
                Embed.setDescription("**Usage**: </avatar:1011296990564450325>\n**Options**: `user`\n\nSend an enlarged picture of your avatar.\n\n**Options**\n`user`: Send someone else's avatar");
                break;
            case 'camelot':
                Embed.setDescription("**Usage**: `/camelot`\n\nProvides information and links related to the Camelot bot, such as the support server and donation links.");
                break;
            case 'cd':
                Embed.setDescription("**Usage:** `/cd`\n**Options:** `user`\n\nChecks cooldowns for basic Camelot features such as pulls, dungeon, daily, weekly, quests, and voting. Refer to `/help command:reminder` to learn about how to enable and disable reminders for cooldowns.\n\n**Options**\n`user:` Choose the player whose cooldowns you want to check.");
                break;
            case 'help':
                Embed.setDescription("**Usage**: </help:1010305606516740096>\n**Options**: `command`\n\nThe help command can be used to quickly see all available commands on a single glance if no value is passed to the `command` option. Otherwise, you can use it to see instructions on how to use a given command and useful details on some of them.\n\n**Options**\n`command`: Shows detailed info on a given command");
                break;
            case 'math':
                Embed.setDescription("**Usage:** `/math`\n**Options:** `calculation`, `ephemeral`\n\nThis command allows the user to calculate the solution to a basic arithmetic math problem. + is used for adding, - is used for subtracting, / is used for dividing, and * is used for multiplying.\n\n**Options**\n`calculation:` Enter an equation to calculate its solution.\n`ephemeral:` Choose if you want other users to see your command. `True,False`.");
                break;
            case 'ping':
                Embed.setDescription("**Usage**: `/ping`\n\nChecks the bot's response time and latency.");
                break;
            case 'premium':
                Embed.setDescription("**Usage:** `/premium`\n**Options:** `user`\n\nView the premium tier of either yourself or another user, how many premium gifts they have left, and a link for donating and buying premium tiers on patreon. When buying Jades, try our Rank.top shop in `/shop` instead for cheaper prices.\n\n**Options**\n`user:` Select the user whose premium tier you’d like to view.");
                break;
            case 'referral':
                Embed.setDescription("**Usage:** `/referral or /referral claim user:<@user>`\n**Options:** `user`\n\nView a variety of information about referrals including bountiful rewards, referral rankings and amount, and your referral ID. Receive rewards every time you successfully refer a new player. For more details, consult `/faq search:referral`, or ask in our `/support` server!\n\n**Options**\n`user:` Select a user whose referrals you want to view.");
                break;
            case 'reminder':
                Embed.setDescription("**Usage:** `/reminder`\n**Options:** `select`\n\nGet reminded on either pull cooldowns or vote, or stop getting reminded by one or the other via ping. If a reminder is already set, execute the command again to disable the reminder. Vote reminders are sent through DMs while pull reminders are sent via pinging the player in the last channel they pulled.");
                break;
            case 'rp':
                Embed.setDescription("**Usage:** `/rp`\n\nResets your pull cooldown, allowing you to skip one /pull cooldown per charge used. Each charge of /rp is earned every time a user votes.");
                break;
            case 'support':
                Embed.setDescription("**Usage**: `/support`\n\nProvides a link to the official Camelot support server.");
                break;
            case 'vote':
                Embed.setDescription("**Usage**: </vote:1010546185792135198>\n\nVote for the bot at [Rank.top](<https://rank.top/bot/camelot/vote>) to get rewards. A voting reminder can be set up using `/reminder set type:votes`. You can vote every **12h**.\n\n**Voting Rewards**\n1 pull reset (`/rp`)\n1 lootbox (`/lootbox`)\n3 genesis gem <:genesis_gems:1034179687720681492>");
                break;
            case 'background search':
                Embed.setDescription("**Usage**: `/background search`\n**Options**: `name`, `type`\n\nSearch for a particular background or set. Do `/background filter:missing` to see all unowned backgrounds.\n\n**Options**\n`name`: Search for a particular background or set\n`type`: Set (many) or background (one)");
                break;
            case 'background select':
                Embed.setDescription("**Usage**: `/background select`\n**Options**: `name`\n\nSelect a particular background.\n\n**Options**\n`name`: Select a particular background");
                break;
            case 'backgrounds':
                Embed.setDescription("**Usage**: `/backgrounds`\n**Options**: `page`, `user`, `filter`\n\nCheck a subset of backgrounds related to a particular person.\n\n**Options**\n`page`: Directly jump to the page you want to see\n`user`: See another player's backgrounds\n`filter`: See either all, unowned, or owned backgrounds");
                break;
            case 'boss hunt':
                Embed.setDescription("**Usage**: `/boss hunt`\n\nA guild-based special event game mode in which you attack a series of bosses for rewards.");
                Embed.setImage("https://i.ibb.co/dJJ4Hc9F/Boss-Hunt-20250629-200551-0000.png");
                break;
            case 'boss rush':
                Embed.setDescription("**Usage**: `/boss rush`\n\nA special event game mode in which you attack a series of bosses that get increasingly stronger for rewards.");
                break;
            case 'christmas craze':
                Embed.setDescription("**Usage**: `/christmas craze`\n\nSpecial Christmas event gamemode in which the community works together to figure out how to defeat enemies in unconventional ways for EX pulls. Are you struggling? Try seeking assistance in our [Support Server](https://discord.gg/myy9PBCdEW)!");
                break;
            case 'christmas present':
                Embed.setDescription("**Usage**: `/christmas present`\n\nSpecial Christmas event daily login rewards, ranging from coins, gems, and tickets, to ex pulls. The user has a 42% chance to receive an EX pull on every available usage.");
                break;
            case 'disassemble all':
                Embed.setDescription("**Usage:** `/disassemble all`\n**Options:** `dupes, grade, type, exclude`\n\nDisassembles a specific subset of items excluding genesis and locked items.\n\n**Options**\n`dupes`: Determines whether only dupes should be disassembled or not, indicated by `True` or `False`. `True` indicates that only dupes are disassembled, while `False` indicates that all items are disassembled.\n`grade`: Determines which rarity of items should be disassembled.\n`type`: Determines which type of item to disassemble.\n`exclude`: Exclude items of a particular ID from being disassembled.");
                break;
            case 'disassemble items':
                Embed.setDescription("**Usage:** `/disassemble items`\n**Options:** `items`\n\nPick particular items to disassemble based on their IDs.\n\n**Options**\n`items:` Insert the item IDs you intend to disassemble.");
                break;
            case 'event pass':
                Embed.setDescription("**Usage:** `/event pass`\n\nDisplays a seasonal Event Pass, containing a plethora of rewards which rotate depending on the last ongoing event. When the Event Pass is active, it can be leveled by completing daily `/quests`. Afterwards, it can only be upgraded with Genesis Gems (100 per 1 level).");
                break;
            case 'ex pull':
                Embed.setDescription("**Usage:** `/ex pull`\n\nBrings up a gacha with a low chance of pulling an EX character when an EX pull is used. Otherwise, an S or SS character is pulled. EX pulls are primarily obtained from events and the monthly shop. Within the gacha, some EX characters are less common than others, and characters rotate after every event.");
                break;
            case 'faq':
                Embed.setDescription("**Usage:** `/faq`\n**Options:** `search`\n\nBrings up a list of frequently asked questions to choose from as prompts. Responses are created for and by players, and added by Support Server staff.\n\n**Options**\n`search:` The frequently asked question that the user is looking for.");
                break;
            case 'lock anime':
                Embed.setDescription("**Usage:** `/lock anime`\n**Options:** `anime`\n\nLock a particular anime such that characters from that anime cannot be sold to the bot. Up to 5 anime can be locked at once.\n\n**Options**\n`anime:` Choose a series to lock.");
                break;
            case 'lock characters':
                Embed.setDescription("**Usage:** `/lock characters`\n**Options:** `characters`\n\nLock a particular character or set of characters such that those characters cannot be sold to the bot. Up to 100 characters can be locked at once.\n\n**Options**\n`characters:` Choose a character or set of characters to lock, separated by commas.");
                break;
            case 'locked':
                Embed.setDescription("**Usage:** `/locked`\n\nView a list of your locked characters and series.");
                break;
            case 'merge':
                Embed.setDescription("**Usage:** `/merge`\n**Options:** `rarity`\n\nMerge either legendary, mythical, or genesis points into an item of their respective rarity. Eight legendary exchange points and 1000 coins are needed to merge for a legendary item, 8 mythical exchange points and 2500 coins are needed to merge for a mythical item, and 4 genesis exchange points and 10000 coins are needed to merge for a genesis. One exchange point is acquired for disassembling a legendary, mythical, or genesis item of its respective rarity.\n\n**Options**\n`rarity:` Select a rarity to merge.");
                Embed.setImage("https://i.ibb.co/RGP304xX/image.png");
                break;
            case 'monthly shop':
                Embed.setDescription("**Usage:** `/monthly shop`\n\nView a shop that refreshes monthly with a limited amount of resources to buy from with coins, ranging from kernels, to tickets, to EX pulls, and more.");
                break;
            case 'party create':
                Embed.setDescription("**Usage:** `/party create`\n**Options:** `name`\n\nCreate a new party to be used in events such as Rolling Cow or Stampede.\n\n**Options**\n`name:` Choose a name for your party.");
                break;
            case 'party dissolve':
                Embed.setDescription("**Usage:** `/party dissolve`\n\nDelete your current party.");
                break;
            case 'party edit':
                Embed.setDescription("**Usage:** `/party edit`\n**Options:** `setting`, `input`\n\nChange a property of your party such as its name, banner, icon, description, or embed color. \n\n**Options**\n`setting:` Choose a property of your party to edit.\n`input:` Select the text, image, or embed color to be changed based on the property chosen.");
                break;
            case 'party leave':
                Embed.setDescription("**Usage:** `/party leave`\n\nLeave your current party.");
                break;
            case 'party invite':
                Embed.setDescription("**Usage:** `/party invite`\n**Options:** `user`\n\nInvite a user to your party.\n\n**Options**\n`user:` Select the user to be invited to your party.");
                break;
            case 'party join':
                Embed.setDescription("**Usage:** `/party join`\n**Options:** `user`\n\nSend a request to another user to join their party.\n\n**Options**\n`user:` Select the user whose party you want to join.");
                break;
            case 'party kick':
                Embed.setDescription("**Usage:** `/party kick`\n**Options:** `user`\n\nKick a user from your party.\n\n**Options**\n`user:` Select the user to be kicked from the party.");
                break;
            case 'party view':
                Embed.setDescription("**Usage:** `/party view`\n**Options:** `user`\n\nView a particular user's party. View your own party if no flags are used.\n\n**Options**\n`user:` Select the user whose party you want to view.");
                break;
            case 'preset edit':
                Embed.setDescription("**Usage:** `/preset edit`\n**Options:** `set`\n\nChange one of your presets such that either the character, class, and/or items equipped are altered. You can reset the contents of a preset by entering the preset number and not selecting any flag. You can unlock more presets with higher `/premium` tiers.\n\n**Options**\n`set:` Select the set to be edited.\n\n**Flags**\n`character:` Change the character of the chosen set.\n`class:` Change the class of the chosen set.\n`items:` Change equipped items of the chosen set.");
                break;
            case 'preset select':
                Embed.setDescription("**Usage:** `/preset select`\n**Options:** `set`\n\nA preset is a configuration of weapons, shields, armor, and characters that a player can quickly equip all at once, instead of manually switching each item individually.\n\nSelect one of the presets that you created with `/preset edit`. You can unlock more presets with higher `/premium` tiers.\n\n**Options**\n`set:` Select the preset to be used.");
                break;
            case 'preset view':
                Embed.setDescription("**Usage:** `/preset view`\n**Options:** `user`\n\nCheck either all of your presets or the presets of another player. You can unlock more presets with higher `/premium` tiers.\n\n**Options**\n`user:` Select the user whose presets you want to view.");
                break;
            case 'rolling cow':
                Embed.setDescription("**Usage:** `/rolling cow`\n\nA five day long event in which users attempt to maximize their points in either a party or individually for rewards. Players must fight against different types of cows with randomized characters and survive for as long as possible to earn more points. The top 20 parties with the most points will earn additional rewards. \n\nStill unclear? Check our guide in `/faq search:rolling_cow`. For specific help, try asking in our [Support Server](https://discord.gg/myy9PBCdEW) or checking our [Camelot Builds Website](https://sites.google.com/view/camelotbuilds/universal-builds/rolling-cow-builds?authuser=0), made *by players, for players*.");
                break;
            case 'skins':
                Embed.setDescription("**Usage:** `/skins`\n**Options:** `filter`, `page`, `user`\n\nThis command allows the user to view all skins, or skins within certain parameters decided by the options.\n\n**Options**\n`filter:` Filter for owned or unowned skins.\n`page:` View a specific page of skins.\n`user:` View the skins of another user.");
                break;
            case 'stampede':
                Embed.setDescription("**Usage:** `/stampede`\n\nA special game mode in which players fight against a goblin invasion for rewards. \n\nWant more info? Try with `/faq search:stampede_tips`, or check our [Camelot Community Builds](https://sites.google.com/view/camelotbuilds/universal-builds/rolling-cow-builds?authuser=0), made *by players, for players*.");
                break;
            case 'terms':
                Embed.setDescription("**Usage:** `/terms`\n\nGives the user a link to Camelot's TOS (Terms of Service).");
                break;
            case 'trial':
                Embed.setDescription("**Usage:** `/trial`\n**Options:** `character`, `class`, `character-level`, `class-level`\n\nA gamemode that allows you to test builds on a default enemy (Luminous). You may choose parameters such as gear, class level, character level, and more, even if you don't own them. The difficulty is automatically adjusted with your stats to always offer a decent challenge.\n\n**Options**\n`character:` Select a specific character.\n`class:` Select a specific class.\n`character-level:` Choose the level of your character.\n`class-level:` Choose the level of your class.");
                break;
            case 'unlock anime':
                Embed.setDescription("**Usage:** `/unlock anime`\n**Options:** `anime`\n\nUnlock a particular anime such that characters from that anime can be sold to the bot.\n\n**Options**\n`anime:` Choose a series to unlock.");
                break;
            case 'unlock characters':
                Embed.setDescription("**Usage:** `/unlock characters`\n**Options:** `characters`\n\nUnlock a particular character or set of characters such that those characters can be sold to the bot.\n\n**Options**\n`characters:` Choose a character or set of characters to unlock, separated by commas.");
                break;
            case 'raid':
                Embed.setDescription("**Usage:** `/raid`\n**Options:** `test`, `boss`, `skip-overview`, `sequence`\n\nA guild-based gamemode where you can fight raid bosses with different ranks and strengths, which provide rewards such as coins, chests, rings, etc. Each raid lasts up to 5 days, and participants, who must've been in the guild for at least a week, gain +4 attempts every day. Attempts can be stacked.\n\nCurious about bosses? Check out [this Camelot Bosses chart](https://docs.google.com/spreadsheets/d/1Zr-RUN9Rs2vrNzod6vIPOP5QGgXL1Gpe-zZkzSWchYA/edit?usp=sharing), for their skills and HP. You may also want to check [Camelot Library](https://docs.google.com/spreadsheets/d/1oASLXTBaCrx-39U_Fc165fd_KYXruuCpGg2gpSKXjX0/edit?gid=1517746962#gid=1517746962) to see raid rewards, made *by players, for players*.\n\n**Options**\n`test:` You can do a test run before playing in the actual raid.    \n`boss:` Select the boss for test runs.\n`skip-overview:` Skip the raid overview and go directly to battle.\n`sequence:` Pre-select an action sequence, separated by commas (,).\n\nSome examples of raid sequences are:\n`/raid sequence: atk,atk,atk,def,def,skill,ability,flee.`\n`/raid sequence: atk:3,def:2,skill,ability,flee.`\n`/raid sequence: 1:3,2:2,4,3,5.`");
                break;
            case 'rankup exam':
                Embed.setDescription("**Usage:** `/rankup exam`\n\nA battle with an immortal enemy. You can fight him with all your power with builds and characters and after the exam you will be assigned a rank based on your performance. Max rounds are capped at 100, so give it your all in those rounds. \n\n**The ranks are given based on the following damages:**");
                Embed.setImage("https://rb.gy/zv4ql8");
                break;
            case 'skill upgrade':
                Embed.setDescription("**Usage:** `/skill upgrade`\n\nUnlock new skills and upgrade the existing ones. New skills are displayed when you have unlocked or upgraded the given ones in the command. Costs vary according to the level of the skill. The cost of unlocking a new skill is 3 skill points. \n\nCurious about skill and costs? Check [this Skills chart](https://docs.google.com/spreadsheets/d/1jTh7Bpb2rC0b4D-mtjONhO8jDdktwZTgU_KGL5k3oJw/edit?usp=sharing), made *by players, for players*.");
                break;
            case 'skill view':
                Embed.setDescription("**Usage:** `/skill view`\n**Options:** `user`, `page`\n\nShows a player's skill tree which includes the owned skills and their level. \n\n**Options**\n`user:` Select the user whose skill tree you want to see. \n`page:` Directly jumps to the skill tree page you want to see.");
                break;
            case 'guild shop':
                Embed.setDescription("**Usage:** `/guild shop`\n**Options:** `page` \n\nThis command opens a shop for guild members from which you can buy a variety of items using guild marks which you can get from raids. \n\n**Options**\n`page:` Directly jumps to the guild shop page you want to see. ");
                break;
            case 'settings':
                Embed.setDescription("**Usage:** `/settings`\n**Options:** `Use Compact Battle Embeds,Battle Log Length`\n\nSettings to change visual battle embeds and battle log length. \n\n**Options**\n`Use Compact Battle Embeds`: toggle [compact mode](https://i.ibb.co/8D1WjTtG/image.png) for battle embeds, `True,False.` \n`Battle Log Length`: Change the number of messages to be shown in the [battle log](https://i.ibb.co/LhnfhSF4/image.png), between 1-10.");
                break;
            default:
                if (command) {
                    Embed.setDescription("Detailed help for this command is not available yet. Try using the command to see its options!");
                } else {
                    Embed.setDescription(`Help page not found for **${helpCommand}**.\nPlease check the spelling or use \`/help\` to see the full list of commands.\nIf you believe this command should exist, please report it on the \`/support\` server.`);
                }
                break;
        };

        // Send the reply
        interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;
