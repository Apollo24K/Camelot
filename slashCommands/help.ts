import { EmbedBuilder } from 'discord.js';
import Package from '../package.json';
import { auniq } from "../Modules/chars";
import { items } from "../Modules/items";
import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'help',
    async execute({ interaction }) {

        let helpCommand = interaction.options.getString('command') ?? "";

        // Main help page
        if (!helpCommand) {
            const Embed = new EmbedBuilder()
                .setTitle('Command List')
                .setColor(0xbbffff) // Default: 0xbbffff, Anniversary: 0x2aad9d, Halloween: 0xff8733, Christmas: 0x034f20, Valentine's: 0xf8c8dc, Easter: 0x69ffb9
                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                .setDescription("Use `/help <command name>` for more information")
                .addFields(
                    // { name: "🌙 Anniversary Event", value: "`/celebrate` `/boss hunt` `/event pass` `/ex pull`\n`/event rewards`" },
                    { name: "<:SSTier:869316489931546644> Card Game", value: "`/pull` `/info` `/search` `/anime` `/profile` `/shop`\n`/sell` `/buy` `/trade` `/give` `/level` `/daily` `/fav`\n`/inventory` `/balance` `/tickets` `/top` `/stats` `/open`\n`/list` `/pity` `/find` `/use` `/achievements` `/lootbox`\n`/quests` `/bank`" },
                    { name: "<:sword:941687282585468958> Dungeon", value: "`/dungeon` `/select` `/shards` `/refine` `/convert` `/rank`\n`/levelup` `/feed` `/arena` `/class list` `/class select`\n`/ability` `/class pick` `/class upgrade` `/class level`\n`/class info` `/class transfer` `/curse list` `/curse info`\n`/item info` `/item list` `/item equip` `/item levelup`\n`/items` `/forge` `/ep`" },
                    { name: "🏰 Guilds", value: "`/guild create` `/guild join` `/guild leave` `/guild view`\n`/guild promote` `/guild demote` `/guild kick` `/guild invite`\n`/guild edit` `/guild donate` `/guild levelup` `/guild top`" },
                    { name: "💎 Premium", value: "`/weekly` `/delay` `/changeimg`" },
                    { name: "🎭 Fun", value: "`/guess character` `/recommend` `/random` `/fish` `/ruin`" },
                    { name: "🎐 Other", value: "`/support` `/premium` `/camelot` `/avatar` `/ping`\n`/math` `/reminder` `/referral`" }
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
            .setColor(0xbbffff)
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setFooter({ text: `Camelot ${Package.version} • Made by Apollo24 & PokeLinker`, iconURL: "https://i.imgur.com/RbLjdQ4.png" });

        // Consolidated help descriptions
        switch (helpCommand) {
            case 'achievements':
                Embed.setDescription("**Usage**: </achievements:1013464934065131551>\n**Options**: `page`, `user`\n\nShows your progress for each achievement along with the completion rewards.\n\n**Options**\n`page`: Directly jump to the page you want to see\n`user`: See another players progress");
                break;
            case 'anime':
                Embed.setDescription("**Usage**: </anime:1012334279117766726>\n**Options**: `page`, `user`\n\nThis command will list all **" + auniq.length + "** anime (and non anime actually) included in our database in alphabetical order, together with your completion progress next to the title. Completed ones will have a check mark instead <a:check:873196253276700682>\n\n**Options**\n`page`: Directly jump to the page you want to see\n`user`: See another players progress");
                break;
            case 'balance':
                Embed.setDescription("**Usage**: </balance:1012316379015299083>\n**Options**: `currency`, `user`\n\nLets you view your balance.\n\n**Options**\n`currency`: Choose the type of curreny to view (coins, gems, lilies)\n`user`: See another players balance");
                break;
            case 'bank':
                Embed.setDescription("**Usage**: `/bank [view|deposit|withdraw]`\n**Subcommands**: </bank view:1157778598447558727>, </bank deposit:1157778598447558727>, </bank withdraw:1157778598447558727>\n**Options**: `amount`, `user`\n\nStore <:coins:872926669055356939> in your bank. Coins deposited in the bank will act like character levels, with the added benefit of being withdrawable at any time. Banks have an upper cap determined by a players character level and </premium:1011293280702578691> tier.\n\n**Subcommands**\n`view`: View your bank's balance\n`deposit`: Deposit <:coins:872926669055356939> to your bank\n`withdraw`: Withdraw <:coins:872926669055356939> from your bank\n\n**Options**\n`amount`: Choose the amount of <:coins:872926669055356939> you want to deposit/withdraw\n`user`: See another players bank");
                break;
            case 'buy':
                Embed.setDescription("**Usage**: `/buy id:<pack_id>` or `/buy id:<pack_id> currency:shards`\n\nBuy a character pack from the `/shop`. There is no limit to the amount of packs you can buy but please note that <:SSTier:869316489931546644> **Tier** characters are excluded from **Morpheus Blessing** (character pack #6).\nUse the `currency` option to pay with shards instead of coins.");
                break;
            case 'daily':
                Embed.setDescription("**Usage**: </daily:1011371510759428136>\n\nUsed to claim daily coins. The amount of <:coins:872926669055356939> is proportional to your account level and daily streak. Starting with **600** <:coins:872926669055356939>, each level and streak add **+10** <:coins:872926669055356939> to it. Premium users additionally have a multiplier between **120**-**600**%.");
                break;
            case 'favourite':
                Embed.setDescription("**Usage**: `/fav character:<character name or ID>`\n\nSelect your favourite character. You have to own it to be able to select it. The image of that character will then be displayed as a thumbnail on various commands of yours like on your `/profile` or `/level`.");
                break;
            case 'find':
                Embed.setDescription("**Usage**: `/find character:<character name or ID>`\n\nFind users who own a character on your server. If there are multiple users owning that character, it will be sorted according to the amount of copies they have.");
                break;
            case 'give':
                Embed.setDescription("**Usage**: `/give user:<@user> amount:<amount>`\n\nSend coins to another user. There is no limit. Please be aware that using alt accounts to get an advantage over other players is forbidden and can result in an inventory reset or even an account ban from Camelot.");
                break;
            case 'gift':
                Embed.setDescription("Use `/trade` to exchange characters with other users. Sending characters directly as a gift is not supported.");
                break;
            case 'info':
                Embed.setDescription("**Usage**: </info:1011767316272402542>\n**Options**: `character`, `flag`, `user`\n\nSearch a character in our database. You don't have to use the character's full name as long as there's no other match fitting your search.\n\n**Options**\n`character`: The name or ID of the character you want to search\n`flag`: How you want the result to be returned\n`user`: See another users character\n\n**Flags**\n`base`: Returns the base values for the character\n`my`: Returns your own character\n`detailed`: Returns your own character with more details on stats");
                break;
            case 'inventory':
                Embed.setDescription("**Usage**: </inventory:1012393731695050852>\n**Options**: `sort`, `page`, `user`\n\nSee your character inventory. Characters will be sorted by rarity by default.\n\n**Options**\n`sort`: Choose in what order your characters should be listed\n`page`: Directly jump to the page you want to see\n`user`: See another players characters\n\n**Sorting Options**\n`alphabetical`: Sort by name\n`chronological`: Sort by the time acquired\n`rarity`: Sort by rarity\n`dupes`: Sort by rarity & number of duplicates");
                break;
            case 'level':
                Embed.setDescription("**Usage**: `/level user:<@user (optional)>`\n\nSee your current level and how much more XP you need to level up alongside a progress bar. Currently the only way of getting XP is by pulling characters. You get **1-10** XP for each pull. <:STier:869316518675095552>-Tier characters will give you twice the amount of XP, and <:SSTier:869316489931546644>-Tier characters give an extra **20** XP on top of what you would've gotten.");
                break;
            case 'list':
                Embed.setDescription("**Usage**: `/list rarity:<rarity> page:<page (optional)>`\n\nGet a list of all characters of a rarity. The characters will be shown together with their series and sorted accordingly. Owned characters will have a check mark next to them <a:check:873196253276700682>");
                break;
            case 'lootbox':
                Embed.setDescription("**Usage**: `/lootbox`\n\nSee how many lootboxes you've left. You can open them using `/open` or `/use item:lootbox`.");
                break;
            case 'open':
                Embed.setDescription("**Usage**: `/open`\n\nOpen your lootboxes. Alternatively you can use `/use item:lootbox`.");
                break;
            case 'pity':
                Embed.setDescription("**Usage**: `/pity user:<@user (optional)`\n\nIf players don't get an <:STier:869316518675095552>-Tier or <:SSTier:869316489931546644>-Tier character in their last 80 and 210 pulls, their next pull will be a guaranteed <:STier:869316518675095552>-Tier or <:SSTier:869316489931546644>-Tier character. `/pity` will show your progress. Note that premium users will have a lower pity.");
                break;
            case 'profile':
                Embed.setDescription("**Usage**: </profile:1010583712527810641>\n**Options**: `user`, `type`, `bio`, `color`, `custom-color-1`, `custom-color-2`\n\nGenerates a profile card of a given player including stats like level, balance, dungeon progress, eqipped items, class, premium status, character stats and more.\n\n**Options**\n`user`: See another players profile\n`type`: Choose between the new (image) or old (legacy) layouts\n`bio`: Set a custom bio to be displayed on your profile\n`color`: Choose between predefined color options\n`custom-color`: Enter Hex codes of custom colors for your profile (premium only)");
                break;
            case 'pull':
                Embed.setDescription("**Usage**: </pull:1011014030103674913>\n**Options**: `all`\n\nPull a character. You can use this command 5 times every 45 minutes (see `/premium` for differences of premium users). You can reset your pulls with `/rp` after you've voted to get additional pulls.\n\n**Options**\n`all`: Use all your available pulls at once (premium only)");
                Embed.addFields([{ name: 'Droprates', value: "<:SSTier:869316489931546644> **Tier**: 0.2%\n<:ATier:869316558013464627> **Tier**: 3.8%\n<:CTier:869316602858991657> **Tier**: 24.8%", inline: true }, { name: '_ _', value: "<:STier:869316518675095552> **Tier**: 1.2%\n<:BTier:869316586803179571> **Tier**: 10.4%\n<:DTier:869316616071032843> **Tier**: 59.6%", inline: true }]);
                break;
            case 'search':
                Embed.setDescription("**Usage**: `/search query:<anime name or alias> image:<boolean (optional)>`\n\nSearch for an anime to list all characters of it. You can use the full name, an alias or try an acronym. The characters will be ranked according to their rarity, then ID. Owned charakters will have a check mark next to them <a:check:873196253276700682>\n\n**Options**:\n`image`: Shows characters with their images (defaults to false).");
                break;
            case 'sell':
                Embed.setDescription("**Usage**: `/sell character:<name_or_ID>` or `/sell filter:<filter> amount:<amount> rarity:<rarity>`\n**Keywords**: `last`, `dupes`\n\nSell your characters. You can't get them back once you've confirmed the action.\n\n**Options**:\n`character`: Sell a specific character by name or ID.\n`filter`: Use `last` to sell the last character acquired, or `dupes` to sell duplicates.\n`amount`: (Required with `dupes`) Sell characters where you own more than this amount.\n`rarity`: (Optional with `dupes`) Only sell duplicates of a specific rarity.\n\n**Example**: `/sell filter:dupes amount:3 rarity:C` (Sells all copies of C-Tier characters where you own more than 3 copies)");
                Embed.addFields({ name: 'Values', value: "<:SSTier:869316489931546644> **Tier**: 5000<:coins:872926669055356939>\n<:ATier:869316558013464627> **Tier**: 500<:coins:872926669055356939>\n<:CTier:869316602858991657> **Tier**: 100<:coins:872926669055356939>", inline: true }, { name: '_ _', value: "<:STier:869316518675095552> **Tier**: 1000<:coins:872926669055356939>\n<:BTier:869316586803179571> **Tier**: 250<:coins:872926669055356939>\n<:DTier:869316616071032843> **Tier**: 50<:coins:872926669055356939>", inline: true });
                break;
            case 'shop':
                Embed.setDescription("**Usage**: `/shop`\n\nSee the card game shop where you can buy different character packs. To buy one, use `/buy id:<id>` if you want to pay with coins or `/buy id:<id> currency:shards` if you want to use shards instead. There is no limit to the amount of packs you can buy, except if it is stated so in its description.");
                break;
            case 'stats':
                Embed.setDescription("**Usage**: `/stats`\n\nSee some stats of Camelots card game, specifically the amount of characters in a Tier, how many male and female characters there are as well as the amount of series included in Camelot.");
                break;
            case 'tickets':
                Embed.setDescription("**Usage**: `/tickets`\n\nThis will show all your tickets if you have any. Tickets are obtainable from lootboxes (`/vote`) and from the `/weekly` command.");
                break;
            case 'top':
                Embed.setDescription("**Usage**: `/top sort:<sort_option> page:<page (optional)>`\n**Sort Options**: `level` (default), `pulls`, `characters`, `characters_percent`, `anime`, `dungeon`\n\nGet your server's toplist. It is ranked after user levels by default, but you can change the ranking with the `sort` option. The thumbnail will either be a random character of the first placed user or their favourite character if they have one.\n\n**Sort Options Details**\n`level`: Sorts by user level (Default)\n`pulls`: Sorts after total pulls\n`characters`: Sorts after characters collected\n`characters_percent`: Sorts after the ratio of collected characters\n`anime`: Sorts after anime completed\n`dungeon`: Sorts after dungeon progress");
                break;
            case 'trade':
                Embed.setDescription("**Usage**: `/trade user:<@user> offer:<your_char_name_or_id> receive:<their_char_name_or_id>`\n\nTrade your characters with someone else. The person receiving the offer will have **15** seconds to accept, it will be cancelled otherwise.");
                break;
            case 'quests':
                Embed.setDescription("View your daily and weekly quests. Completing quests grants various rewards.");
                break;
            case 'ability':
                Embed.setDescription("**Usage**: </ability:1014178280376647721>\n**Options**: `character`, `page`, `user`\n\nLists all characters who have a unique ability\nCharacter abilities can be used through the ⚜️ ABILITY button in the `/dungeon`, `/arena`, `/trial` and more.\n\n**Options**\n`character`: Show details on a specific character's ability\n`page`: Directly jump to the page you want to see\n`user`: See which ability chars someone owns");
                break;
            case 'arena':
                Embed.setDescription("**Usage**: `/arena challenge user:<@user>` or `/arena random`\n\nEngage in PvP battles against other players' selected characters. Challenge a specific user or fight a random opponent.");
                break;
            case 'class':
                Embed.setDescription("Use subcommands like `/class list`, `/class select`, `/class info`, `/class level`, `/class upgrade`, `/class pick`, `/class transfer` to manage your character classes.");
                break;
            case 'classes':
                Embed.setDescription("**Usage**: `/class list`\n\nLists all available character classes and their effects.");
                break;
            case 'class-info':
                Embed.setDescription("**Usage**: `/class info class:<class_name>`\n\nShows detailed information about a specific class.");
                break;
            case 'class-level':
                Embed.setDescription("**Usage**: `/class level class:<class_name> levels:<amount>`\n\nSpend <:class_scrolls:1110883365787086858> Class Scrolls to level up a specific class, enhancing its passive effects. Scrolls are mainly obtained from `/dungeon`.");
                break;
            case 'class-pick':
                Embed.setDescription("**Usage**: `/class pick class:<class_name>`\n\nSpend 💎 Gems to permanently unlock a class for use.");
                break;
            case 'class-select':
                Embed.setDescription("**Usage**: `/class select class:<class_name>`\n\nSelect an unlocked class to use with your character in `/dungeon`, `/arena`, etc.");
                break;
            case 'class-transfer':
                Embed.setDescription("**Usage**: `/class transfer character:<character_name_or_id>`\n\nTransfer the currently selected class to a different character you own. This costs 💎 Gems.");
                break;
            case 'convert':
                Embed.setDescription("**Usage**: `/convert from:<rarity> to:<rarity> amount:<amount>`\n\nConvert lower rarity shards <:shards:1034179284610596965> into higher rarity ones. Check conversion rates in-game.");
                break;
            case 'curse':
                Embed.setDescription("Use subcommands like `/curse list` and `/curse info` to view information about dungeon curses.");
                break;
            case 'curselist':
                Embed.setDescription("**Usage**: `/curse list floor:<floor_number (optional)>`\n\nLists active or possible curses in the dungeon, optionally filtering by floor.");
                break;
            case 'curse-info':
                Embed.setDescription("**Usage**: `/curse info curse:<curse_name>`\n\nShows detailed information about a specific dungeon curse.");
                break;
            case 'dungeon':
                Embed.setDescription("**Usage**: `/dungeon floor:<floor_number>`\n\nFight monsters in the dungeon to obtain rewards such as coins, shards, items, and scrolls. You need to select a character first using `/select`.\nTo progress, defeat the monsters on your current floor multiple times. Boss floors occur periodically and offer better first-time rewards.\n\n**Battle Mechanics**\n`ATK ⚔️`: Deal damage to your opponent\n`DEF 🛡️`: Increase your defense. May block opponent's attack.\n`SKIP ⏩`: Skip animations and view results immediately\n`ABILITY ✨`: Use your selected character's unique ability, if available (see `/ability`).");
                break;
            case 'ep':
                Embed.setDescription("**Usage**: `/ep redeem code:<code>`\n\nRedeem Event Points (EP) using a code obtained during special events.");
                break;
            case 'feed':
                Embed.setDescription("**Usage**: </feed:1157778598447558728>\n**Options**: `use`, `amount`\n\nFeed your character with fish, which can be earned through </fish:1087099255652622429>. This will earn your character \"xp\" which is essentially coins invested into character levels. In other words, \"{character} received 200 xp!\" would mean you'll have to spend 200 <:coins:872926669055356939> less the next time you use </levelup:1014310261223592047>.\n\n**Options**\n`use`: The type of fish you want to use\n`amount`: Amount of fish to use | Keywords: `max`");
                break;
            case 'forge':
                Embed.setDescription("**Usage**: `/forge item:<item_name>`\n\nUse materials obtained from dungeons and other activities to craft powerful items.");
                break;
            case 'item-equip':
                Embed.setDescription("**Usage**: `/item equip item:<item_name>`\n\nEquip an item from your inventory to your selected character.");
                break;
            case 'item-info':
                Embed.setDescription("**Usage**: `/item info item:<item_name>`\n\nView detailed stats and information about a specific item.");
                break;
            case 'item-levelup':
                Embed.setDescription("**Usage**: `/item levelup item:<item_name>`\n\nLevel up an equipped item using materials to enhance its stats.");
                break;
            case 'item-list':
                Embed.setDescription("**Usage**: `/item list page:<page (optional)> user:<@user (optional)>`\n\nView your owned items.");
                break;
            case 'items':
                Embed.setDescription("Use subcommands like `/item list`, `/item info`, `/item equip`, `/item levelup` to manage your items.");
                break;
            case 'levelup':
                Embed.setDescription("**Usage**: `/levelup character:<char_name_or_ID> levels:<amount>`\n**Options**: `max`\n\nSpend <:coins:872926669055356939> Coins to increase your character's level, boosting their stats for use in `/dungeon`, `/arena`, etc.\n\n**Options**\n`levels`: Number of levels to add.\n`max`: Use `max` to spend all available coins up to the character's level cap.");
                break;
            case 'rank':
                Embed.setDescription("**Usage**: `/rank scope:<scope> page:<page (optional)> user:<@user (optional)>`\n**Scope Options**: `inventory`, `global`\n\nRanks characters based on their stats. Use `scope:inventory` to rank your own characters, or `scope:global` to see the globally highest-stat characters.");
                break;
            case 'refine':
                Embed.setDescription("**Usage**: `/refine character:<character name or ID>`\n\nIncrease the refinement level of your character using <:shards:1034179284610596965> Shards. This significantly increases the character's base stats. You need shards matching the character's rarity. The maximum refinement level is 5.");
                break;
            case 'select':
                Embed.setDescription("**Usage**: </select:1012477601157238866>\n**Options**: `character`\n\nSelect a character to use in the `/dungeon`, `/arena`, `/trial` etc.\nIf you can't decide on which character to choose, use `/rank scope:inventory` to rank your best characters.\n\n**Options**\n`character`: The character (name or ID) you want to use");
                break;
            case 'shards':
                Embed.setDescription("**Usage**: `/shards`\n\nThis command will show all your shards <:shards:1034179284610596965>. They're used to `/refine` characters. You can obtain them in the dungeon, through lootboxes or achievements. Additionally you can `/convert` shards from lower rarities to higher rarities.");
                break;
            case 'upgrade':
                Embed.setDescription("**Usage**: `/class upgrade class:<class_name>`\n\nSpend 💎 Gems to upgrade an unlocked class to the next tier, improving its effects or unlocking new ones.");
                break;
            case 'guild':
                Embed.setDescription("Manage guilds using subcommands: `/guild create`, `/guild join`, `/guild leave`, `/guild view`, `/guild promote`, `/guild demote`, `/guild kick`, `/guild invite`, `/guild edit`, `/guild donate`, `/guild levelup`, `/guild top`.");
                break;
            case 'changeimg':
                Embed.setDescription("**Usage**: `/changeimg character:<character name or ID> image:<image_url>`\n\n(Premium Only) Change the image displayed for one of your characters.");
                break;
            case 'delay':
                Embed.setDescription("**Usage**: </delay:1011390481848082442>\n**Options**: `int`\n\n(Premium Only) This command allows you to change the animation delay in the `/dungeon` and similar commands to fit your preferences. It can be anything between 200-1200ms.\n\n**Options**\n`int`: Number of millisecond between 200-1200");
                break;
            case 'weekly':
                Embed.setDescription("**Usage**: </weekly:1011386049412476969>\n\n(Premium Only) A premium command used to collect weekly rewards. You can find more details on the rewards on our </patreon:1011293280702578690>.");
                break;
            case 'fish':
                Embed.setDescription("**Usage**: </fish:1087099255652622429>\n\nThis command can be used once every **30** seconds to catch one of **" + items.reduce((count, e) => count += (e.category === "fish" ? 1 : 0), 0) + "** different fish.\nFish can be used with `/feed` to grant XP towards character level-ups.\n\n**Drop Rates**\n<:mythical1:1041726768530329690><:mythical2:1041726767188168724><:mythical3:1041726765577556039><:mythical4:1041726763862065162> ➜ 0.03%\n<:legendary1:1041726519082491964><:legendary2:1041726517153112094><:legendary3:1041726515475382322><:legendary4:1041726512992366605> ➜ 0.47%\n<:unique1:1041730066272493578><:unique2:1041730063940468828><:unique3:1041730061163831437><:unique4:1041730057380573386> ➜ 4.5%\n<:rare1:1041731092031492106><:rare2:1041731088357281802><:rare3:1041731083965825096><:blank:917804200363171860> ➜ 18%\n<:special1:1041731419963150397><:special2:1041731418008600717><:special3:1041731415919833149><:special4:1041731414032392202> ➜ 30%\n<:normal1:1041732429397889054><:normal2:1041732425379762268><:normal3:1041732422145953892><:normal4:1041732419591622686> ➜ 47%");
                break;
            case 'guess character':
                Embed.setDescription("**Usage**: `/guess character`\n\nStarts a game where you guess the character based on a zoomed-in image.");
                break;
            case 'random':
                Embed.setDescription("**Usage**: `/random`\n\nGet a random character suggestion from the database.");
                break;
            case 'recommend':
                Embed.setDescription("**Usage**: `/recommend genre:<genre (optional)>`\n\nRecommends an anime, optionally based on a specified genre.");
                break;
            case 'ruin':
                Embed.setDescription("**Usage**: </ruin:1089176605588455594>\n**Options**: `title`\n\nThis command will attempt to ruin your favorite anime by only changing, adding or deleting 1 letter in the title.\n\n**Examples**: Sou**p** Eater, Lucky Sta**b** or Goblin **L**ayer\n\n**Options**\n`title`: The title of the anime you want to ruin");
                break;
            case 'avatar':
                Embed.setDescription("**Usage**: </avatar:1011296990564450325>\n**Options**: `user`\n\nSend an enlargened picture of your avatar.\n\n**Options**\n`user`: Send someone else's avatar");
                break;
            case 'camelot':
                Embed.setDescription("Provides information and links related to the Camelot bot, such as the support server and donation links.");
                break;
            case 'cooldown':
                Embed.setDescription("**Usage**: `/cooldown user:<@user (optional)>`\n\nCheck your command cooldowns, such as for `/pull`.");
                break;
            case 'help':
                Embed.setDescription("**Usage**: </help:1010305606516740096>\n**Options**: `command`\n\nThe help command can be used to quickly see all available commands on a single glance if no value is passed to the `command` option. Otherwise, you can use it to see see instructions on how to use a given command and useful details on some of them.\n\n**Options**\n`command`: Shows detailed info on a given command");
                break;
            case 'math':
                Embed.setDescription("**Usage**: `/math expression:<expression>`\n\nEvaluates a mathematical expression.");
                break;
            case 'ping':
                Embed.setDescription("**Usage**: `/ping`\n\nChecks the bot's response time and latency.");
                break;
            case 'premium':
                Embed.setDescription("**Usage**: `/premium`\n\nDisplays information about premium benefits and tiers.");
                break;
            case 'referral':
                Embed.setDescription("**Usage**: `/referral` or `/referral claim user:<@user>`\n\nView your referral code or claim a referral reward if someone referred you.");
                break;
            case 'reminder':
                Embed.setDescription("**Usage**: `/reminder [set|view|remove]`\n\nManage reminders for votes, daily claims, etc.");
                break;
            case 'rp':
                Embed.setDescription("**Usage**: `/rp`\n\nResets your pull cooldown after voting (`/vote`). Requires a vote credit.");
                break;
            case 'support':
                Embed.setDescription("**Usage**: `/support`\n\nProvides a link to the official Camelot support server.");
                break;
            case 'vote':
                Embed.setDescription("**Usage**: </vote:1010546185792135198>\n\nVote for the bot at [Top.gg](https://top.gg/bot/706183309943767112/vote) to get rewards. A voting reminder can be set up using `/reminder set type:votes`. You can vote every **12h**.\n\n**Voting Rewards**\n1 pull reset (`/rp`)\n1 lootbox (`/lootbox`)\n3 genesis gem <:genesis_gems:1034179687720681492>");
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
