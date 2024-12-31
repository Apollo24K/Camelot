import { EmbedBuilder } from 'discord.js';
import Package from '../package.json';
import { auniq } from "../Modules/chars";
import { items } from "../Modules/items";

module.exports = {
    name: 'help',
    description: 'command list',
    execute(interaction) {

        let help = interaction.options.getString('command') || "";
        help = help.toLowerCase();

        if (!help) {
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

        const Embed = new EmbedBuilder()
            .setTitle(`Help ${help ? "/" + help : ""}`)
            .setColor(0xbbffff)
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setDescription("Use `/help <command name>` for more information")
            .setFooter({ text: `Camelot ${Package.version} • Made by Apollo24 & PokeLinker`, iconURL: "https://i.imgur.com/RbLjdQ4.png" });

        const commands = {
            ability: "**Usage**: </ability:1014178280376647721>\n**Options**: `character`, `page`, `user`\n\nLists all characters who have a unique ability\nCharacter abilities can be used through the ⚜️ ABILITY button in the `/dungeon`, `/arena`, `/trial` and more.\n\n**Options**\n`character`: Show details on a specific character's ability\n`page`: Directly jump to the page you want to see\n`user`: See which ability chars someone owns",
            achievements: "**Usage**: </achievements:1013464934065131551>\n**Options**: `page`, `user`\n\nShows your progress for each achievement along with the completion rewards.\n\n**Options**\n`page`: Directly jump to the page you want to see\n`user`: See another players progress",
            anime: "**Usage**: </anime:1012334279117766726>\n**Options**: `page`, `user`\n\nThis command will list all **" + auniq.length + "** anime (and non anime actually) included in our database in alphabetical order, together with your completion progress next to the title. Completed ones will have a check mark instead <a:check:873196253276700682>\n\n**Options**\n`page`: Directly jump to the page you want to see\n`user`: See another players progress",
            avatar: "**Usage**: </avatar:1011296990564450325>\n**Options**: `user`\n\nSend an enlargened picture of your avatar.\n\n**Options**\n`user`: Send some elses avatar",
            balance: "**Usage**: </balance:1012316379015299083>\n**Options**: `currency`, `user`\n\nLets you view your balance.\n\n**Options**\n`currency`: Choose the type of curreny to view (coins, gems, lilies)\n`user`: See another players balance",
            bank: "**Usage**: `/bank [view|deposit|withdraw]`\n**Subcommands**: </bank view:1157778598447558727>, </bank deposit:1157778598447558727>, </bank withdraw:1157778598447558727>\n**Options**: `amount`, `user`\n\nStore <:coins:872926669055356939> in your bank. Coins deposited in the bank will act like character levels, with the added benefit of being withdrawable at any time. Banks have an upper cap determined by a players character level and </premium:1011293280702578691> tier.\n\n**Subcommands**\n`view`: View your bank's balance\n`deposit`: Deposit <:coins:872926669055356939> to your bank\n`withdraw`: Withdraw <:coins:872926669055356939> from your bank\n\n**Options**\n`amount`: Choose the amount of <:coins:872926669055356939> you want to deposit/withdraw\n`user`: See another players bank",
            daily: "**Usage**: </daily:1011371510759428136>\n\nUsed to claim daily coins. The amount of <:coins:872926669055356939> is proportional to your account level and daily streak. Starting with **600** <:coins:872926669055356939>, each level and streak add **+10** <:coins:872926669055356939> to it. Premium users additionally have a multiplier between **120**-**600**%.",
            delay: "**Usage**: </delay:1011390481848082442>\n**Options**: `int`\n\nThis command allows you to change the animation delay in the `/dungeon` and similar commands to fit your preferences. It can be anything between 200-1200ms. Note that this is a </premium:1011293280702578691> feature only.\n\n**Options**\n`int`: Number of millisecond between 200-1200",
            feed: "**Usage**: </feed:1157778598447558728>\n**Options**: `use`, `amount`\n\nFeed your character with fish, which can be earned through </fish:1087099255652622429>. This will earn your character \"xp\" which is essentially coins invested into character levels. In other words, \"{character} received 200 xp!\" would mean you'll have to spend 200 <:coins:872926669055356939> less the next time you use </levelup:1014310261223592047>.\n\n**Options**\n`use`: The type of fish you want to use\n`amount`: Amount of fish to use | Keywords: `max`",
            fish: "**Usage**: </fish:1087099255652622429>\n\nThis command can be used once every **30** seconds to catch one of **" + items.reduce((count, e) => count += (e.category === "fish"), 0) + "** different fish.\nYou can't do anything in particular with fish, however there are 2 daily quests (`\"A Fishy Task\"` and `\"Another Fishy Task\"`) where you must fish.\n\n**Drop Rates**\n<:mythical1:1041726768530329690><:mythical2:1041726767188168724><:mythical3:1041726765577556039><:mythical4:1041726763862065162> ➜ 0.03%\n<:legendary1:1041726519082491964><:legendary2:1041726517153112094><:legendary3:1041726515475382322><:legendary4:1041726512992366605> ➜ 0.47%\n<:unique1:1041730066272493578><:unique2:1041730063940468828><:unique3:1041730061163831437><:unique4:1041730057380573386> ➜ 4.5%\n<:rare1:1041731092031492106><:rare2:1041731088357281802><:rare3:1041731083965825096><:blank:917804200363171860> ➜ 18%\n<:special1:1041731419963150397><:special2:1041731418008600717><:special3:1041731415919833149><:special4:1041731414032392202> ➜ 30%\n<:normal1:1041732429397889054><:normal2:1041732425379762268><:normal3:1041732422145953892><:normal4:1041732419591622686> ➜ 47%",
            help: "**Usage**: </help:1010305606516740096>\n**Options**: `command`\n\nThe help command can be used to quickly see all available commands on a single glance if no value is passed to the `command` option. Otherwise, you can use it to see see instructions on how to use a given command and useful details on some of them.\n\n**Options**\n`command`: Shows detailed info on a given command",
            info: "**Usage**: </info:1011767316272402542>\n**Options**: `character`, `flag`, `user`\n\nSearch a character in our database. You don't have to use the character's full name as long as there's no other match fitting your search.\n\n**Options**\n`character`: The name or ID of the character you want to search\n`flag`: How you want the result to be returned\n`user`: See another users character\n\n**Flags**\n`base`: Returns the base values for the character\n`my`: Returns your own character\n`detailed`: Returns your own character with more details on stats",
            inventory: "**Usage**: </inventory:1012393731695050852>\n**Options**: `sort`, `page`, `user`\n\nSee your character inventory. Characters will be sorted by rarity by default.\n\n**Options**\n`sort`: Choose in what order your characters should be listed\n`page`: Directly jump to the page you want to see\n`user`: See another players characters\n\n**Sorting Options**\n`alphabetical`: Sort by name\n`chronological`: Sort by the time acquired\n`rarity`: Sort by rarity\n`dupes`: Sort by rarity & number of duplicates",
            profile: "**Usage**: </profile:1010583712527810641>\n**Options**: `user`, `type`, `bio`, `color`, `custom-color-1`, `custom-color-2`\n\nGenerates a profile card of a given player including stats like level, balance, dungeon progress, eqipped items, class, premium status, character stats and more.\n\n**Options**\n`user`: See another players profile\n`type`: Choose between the new (image) or old (legacy) layouts\n`bio`: Set a custom bio to be displayed on your profile\n`color`: Choose between predefined color options\n`custom-color`: Enter Hex codes of custom colors for your profile (premium only)",
            pull: {
                desc: "**Usage**: </pull:1011014030103674913>\n**Options**: `all`\n\nPull a character. You can use this command 5 times every 45 minutes (see `/premium` for differences of premium users). You can reset your pulls with `/rp` after you've voted to get additional pulls.\n\n**Options**\n`all`: Use all your available pulls at once (premium only)",
                fields: [{ name: 'Droprates', value: "<:SSTier:869316489931546644> **Tier**: 0.2%\n<:ATier:869316558013464627> **Tier**: 3.8%\n<:CTier:869316602858991657> **Tier**: 24.8%", inline: true }, { name: '_ _', value: "<:STier:869316518675095552> **Tier**: 1.2%\n<:BTier:869316586803179571> **Tier**: 10.4%\n<:DTier:869316616071032843> **Tier**: 59.6%", inline: true }],
            },
            ruin: "**Usage**: </ruin:1089176605588455594>\n**Options**: `title`\n\nThis command will attempt to ruin your favorite anime by only changing, adding or deleting 1 letter in the title.\n\n**Examples**: Sou**p** Eater, Lucky Sta**b** or Goblin **L**ayer\n\n**Options**\n`title`: The title of the anime you want to ruin",
            select: "**Usage**: </select:1012477601157238866>\n**Options**: `character`\n\nSelect a character to use in the `/dungeon`, `/arena`, `/trial` etc.\nIf you can't decide on which character to choose, use `/rank scope:inventory` to rank your best characters.\n\n**Options**\n`character`: The character (name or ID) you want to use",
            vote: "**Usage**: </vote:1010546185792135198>\n\nVote for the bot at [Top.gg](https://top.gg/bot/706183309943767112/vote) to get rewards. A voting reminder can be set up using `/reminder select:votes`. You can vote every **12h**.\n\n**Voting Rewards**\n1 pull reset (`/rp`)\n1 lootbox (`/lootbox`)\n3 genesis gem <:genesis_gems:1034179687720681492>",
            weekly: "**Usage**: </weekly:1011386049412476969>\n\nA premium command used to collect weekly rewards. You can find more details on the rewards on our </patreon:1011293280702578690>.",
        };

        if (help in commands) {
            Embed.setDescription(commands[help]?.desc || commands[help]);
            if (commands[help]?.fields) Embed.addFields(commands[help].fields);
            return interaction.reply({ embeds: [Embed] });
        };

        switch (help) {
            case "arena": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "buy":
            case "buys": Embed.setDescription("**Usage**: `!buy <character pack ID>`\n**Alias**: `!buy`\n**Alternative**: `!buys`\n\nBuy a character pack from the `!shop`. There is no limit to the amount of packs you can buy but please note that <:SSTier:869316489931546644> **Tier** characters are excluded from **Morpheus Blessing** (character pack #6). If you want to pay with shards instead of coins, use `!buys`.").setTitle("Help !buy"); break;
            case "camelot": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "changeimage":
            case "changeimg": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "class": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "classes":
            case "class-list": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "class-info": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "class-level": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "convert":
            case "conv": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "cooldown":
            case "cd": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "curse": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "curses":
            case "curselist":
            case "cl": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "dungeon": Embed.setDescription("**Usage**: `!dungeon <floor>`\n**Alias**: `!dungeon`, `!d`\n\nFight monsters in the dungeon to obtain rare rewards such as coins, shards and other items. To get started, you will need to select a character to use in the dungeon. Choose your character with `!select <char>`. If you're not sure which character you should pick, use `!rankmy` to rank your best characters.\nTo go to the next floor you will have to defeat monsters of your current floor 20 times. Every 5th floor is a Boss floor with higher drop rates for the first time you beat them.\n\n**Battle Mechanics**\n`ATK ⚔️`: Deal damage to your opponent\n`DEF 🛡️`: Increase your defense. Additionally, you have a 20% chance of blocking your opponents next attack.\n`SKIP ⏩`: Skip to the results\n`ABILITY ✨`: Some <:SSTier:869316489931546644>-Tier characters have unique abilities you can use during the battle. You can get a list of all characters with abilities using `!abilities` and get more information on a characters ability with `!ability <char>`").setTitle("Help !dungeon"); break;
            case "favourite":
            case "favorite":
            case "fav": Embed.setDescription("**Usage**: `!favourite <character name or ID>`\n**Alias**: `!favourite`, `!favorite`, `!fav`\n\nSelect your favourite character. You have to own it to be able to select it. The image of that character will then be displayed as a thumbnail on various commands of yours like on your `!profile` or `!level`.").setTitle("Help !favourite"); break;
            case "fib": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "find": Embed.setDescription("**Usage**: `!find <character name or ID>`\n**Alias**: `!find`\n\nFind users who own a character on your server. If there are multiple users owning that character, it will be sorted according to the amount of copies they have.").setTitle("Help !find"); break;
            case "flip": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "flipping": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "give": Embed.setDescription("**Usage**: `!give @user <amount of coins>`\n**Alias**: `!give`\n\nSend coins to another user. There is no limit. Please be aware that using alt accounts to get an advantage over other players is forbidden and can result in an inventory reset or even an account ban from Camelot.").setTitle("Help !give"); break;
            case "gift": Embed.setDescription("**Usage**: `!gift @user <character name or ID>`\n**Alias**: `!gift`\n\nSend characters to another user. Use the characters full **name** or **ID**. Please be aware that using alt accounts to get an advantage over other players is forbidden and can result in an inventory reset or even an account ban from Camelot.").setTitle("Help !gift"); break;
            case "level":
            case "lvl": Embed.setDescription("**Usage**: `!level <@user (optional)>`\n**Alias**: `!level`, `!lvl`\n\nSee your current level and how much more XP you need to level up alongside a progress bar. Currently the only way of getting XP is by pulling characters. You get **1-10** XP for each pull. <:STier:869316518675095552>-Tier characters will give you twice the amount of XP, and <:SSTier:869316489931546644>-Tier characters give an extra **20** XP on top of what you would've gotten.").setTitle("Help !level"); break;
            case "levelup":
            case "lootbox":
            case "lb": Embed.setDescription("**Usage**: `!lootbox`\n**Alias**: `!lootbox`, `!lb`\n\nSee how many lootboxes you've left. You can open them using either `!open` or `!use lootbox`/`!use lb`").setTitle("Help !lootbox"); break;
            case "lvlup": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "list": Embed.setDescription("**Usage**: `!list <rarity>`\n**Alias**: `!list`\n\nGet a list of all characters of a rarity. The characters will be shown together with their series and sorted accordingly. Owned characters will have a check mark next to them <a:check:873196253276700682>").setTitle("Help !list"); break;
            case "math": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "name": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "open": Embed.setDescription("**Usage**: `!open`\n**Alias**: `!open`\n\nOpen your lootboxes. Alternatively you can use `!use lb` to do the same thing.").setTitle("Help !open"); break;
            case "pick": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "ping": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "pity": Embed.setDescription("**Usage**: `!pity <@user (optional)`\n**Alias**: `!pity`\n\nIf players don't get an <:STier:869316518675095552>-Tier or <:SSTier:869316489931546644>-Tier character in their last 80 and 210 pulls, their next pull will be a guaranteed <:STier:869316518675095552>-Tier or <:SSTier:869316489931546644>-Tier character. `!pity` will show your progress. Note that premium users will have a lower pity.").setTitle("Help !pity"); break;
            case "prefix": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "premium": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "ps":
            case "purge":
            case "ram":
            case "random":
            case "rank":
            case "rankmy":
            case "ranks": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "referral": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "refine": Embed.setDescription("**Usage**: `!refine <character name or ID>`\n**Alias**: `!refine`, `!ref`\n\nIncrease the refinement level of your character. This will increase the characters base stats by **25%** for each level. You will need 16 shards of the characters rarity to refine them. Currently the maximum level is 5.").setTitle("Help !refine"); break;
            case "recommend":
            case "rp": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "search": Embed.setDescription("**Usage**: `!search <anime name or alias>`\n**Alias**: `!search`, `!s`\n**Flags**: `-i`\n\nSearch for an anime to list all characters of it. You can use the full name, an alias or try an acronym. The characters will be ranked according to their rarity, then ID. Owned charakters will have a check mark next to them <a:check:873196253276700682>\n\n**Flags**:\n`!si`: Shows characters with their images").setTitle("Help !search"); break;
            case "sell": Embed.setDescription("**Usage**: `!sell <name or ID>`\n**Alias**: `!sell`\n**Keywords**: `last`, `dupes`\n\nSell your characters. You can't get them back once you've confirmed the action. The amount of coins you get are as listed below.\n\n**Keywords**:\n`!sell last`: Sells the last character added to your inventory\n`!sell dupes`: Sells all of your duplicate characters. This command takes in 2 optional arguments, first the amount of copies a character should have, then the rarity. Example usage: `!sell dupes 3 C` (Sells all copies of C-Tier characters with more than 3 copies)").setTitle("Help !sell").addFields({ name: 'Values', value: "<:SSTier:869316489931546644> **Tier**: 5000<:coins:872926669055356939>\n<:ATier:869316558013464627> **Tier**: 500<:coins:872926669055356939>\n<:CTier:869316602858991657> **Tier**: 100<:coins:872926669055356939>", inline: true }, { name: '_ _', value: "<:STier:869316518675095552> **Tier**: 1000<:coins:872926669055356939>\n<:BTier:869316586803179571> **Tier**: 250<:coins:872926669055356939>\n<:DTier:869316616071032843> **Tier**: 50<:coins:872926669055356939>", inline: true },); break;
            case "shards": Embed.setDescription("**Usage**: `!shards`\n**Alias**: `!shards`\n\nThis command will show all your shards. They're used to `!refine` characters. You can obtain them in the dungeon, through lootboxes or achievements. Additionally you can `!convert` shards from lower rarities to higher rarities.").setTitle("Help !shards"); break;
            case "shop": Embed.setDescription("**Usage**: `!shop`\n**Alias**: `!shop`\n\nSee the card game shop where you can buy different character packs. To buy one, use `!buy <id>` if you want to pay with coins or `!buys <id>` if you want to use shards instead. There is no limit to the amount of packs you can buy, except if it is statet so in its description.").setTitle("Help !shop"); break;
            case "stats": Embed.setDescription("**Usage**: `!stats`\n**Alias**: `!stats`\n\nSee some stats of Camelots card game, specifically the amount of characters in a Tier, how many male and female characters there are as well as the amount of series included in Camelot.").setTitle("Help !stats"); break;
            case "support": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "tickets": Embed.setDescription("**Usage**: `!tickets`\n**Alias**: `!tickets`, `!ticket`\n\nThis will show all your tickets if you have any. Tickets are obtainable from lootboxes (`!vote`) and from the `!weekly` command.").setTitle("Help !tickets"); break;
            case "top": Embed.setDescription("**Usage**: `!top <page number (optional)>`\n**Alias**: `!top`\n**Flags**: `-p`, `-c`, `-c%`, `-a`, `-d`\n\nGet your servers toplist. It is ranked after user levels by default, but you can change the ranking with flags. The thumbnail will either be a random character of the first placed user or their favourite character if they have one.\n\n**Flags**\n`!topp`: Sorts after total pulls\n`!topc`: Sorts after characters collected\n`!topc%`: Sorts after the ratio of collected characters\n`!topa`: Sorts after anime completed\n`!topd`: Sorts after dungeon progress").setTitle("Help !top"); break;
            case "trade": Embed.setDescription("**Usage**: `!trade @user <char to offer> , <char to receive>`\n**Alias**: `!trade`\n\nTrade your characters with someone else. The person receiving the offer will have **15** seconds to accept, it will be cancelled otherwise.").setTitle("Help !trade"); break;
            case "upgrade":
            case "class-upgrade": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            default: Embed.setDescription(`There is currently no such command as **${help}**\nIf you think there's a mistake, please let us know on our \`!support\` server`).setTitle("Help"); break;
        };
        interaction.reply({ embeds: [Embed] });

    },
};