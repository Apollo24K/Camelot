const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'helps',
    description: 'command list',
	execute(interaction, cVersion) {

        let help = interaction.options.getString('command');

        if (!help) {
            const Embed = new MessageEmbed()
            .setTitle('Command List')
            .setTitle("Commandlist")
            .setColor(0xbbffff)
            .setThumbnail("https://i.imgur.com/WWM4K98.png")
            .setDescription("Use `/help <command name>` for more information")
            .addField("<:SSTier:869316489931546644> Card Game", "`/pull` `/info` `/search` `/anime` `/profile` `/shop`\n`/sell` `/buy` `/trade` `/give` `/level` `/daily` `/fav`\n`/inventory` `/balance` `/tickets` `/top` `/stats` `/open`\n`/list` `/pity` `/find` `/use` `/achievements` `/lootbox`")
            .addField("<:sword:941687282585468958> Dungeon", "`/dungeon` `/select` `/shards` `/refine` `/convert` `/rank`\n`/levelup` `/reset` `/arena` `/class list` `/class assign`\n`/ability` `/class pick` `/class upgrade` `/class level`\n`/class info` `/curse list` `/curse info`")
            .addField("💎 Premium", "`/weekly` `/delay` `/changeimg` `/ps`")
            .addField("🎭 Gambling", "`/recommend` `/random`")
            .addField("🎐 Other", "`/support` `/premium` `/camelot` `/submit` `/avatar`\n`/ping` `/math`")
            .setFooter({text: `Camelot ${cVersion} • Made by Apollo24 & PokeLink`, iconURL: "https://i.imgur.com/syj1LqO.jpeg"} )
            return interaction.reply({ embeds: [Embed] });
        };

        // Demo Video
        // if (!help) {
        //     const Embed = new MessageEmbed()
        //     .setTitle('Command List')
        //     .setTitle("Commandlist")
        //     .setColor(0xbbffff)
        //     .setThumbnail("https://i.imgur.com/WWM4K98.png")
        //     .setDescription("Use `/help <command name>` for more information")
        //     .addField("<:SSTier:869316489931546644> Card Game", "`/pull` `/info` `/search` `/anime` `/profile` `/shop`\n`/sell` `/buy` `/level` `/daily` `/fav` `/achievements`\n`/inventory` `/balance` `/tickets` `/top` `/stats` `/open`\n`/list` `/pity` `/find` `/use` `/lootbox`")
        //     .addField("<:sword:941687282585468958> Dungeon", "`/dungeon` `/select` `/shards` `/refine` `/convert` `/rank`\n`/levelup` `/reset` `/arena` `/class list` `/class assign`\n`/ability` `/class pick` `/class upgrade` `/class level`\n`/class info` `/curse list` `/curse info`")
        //     .addField("🎐 Other", "`/support` `/camelot` `/submit` `/avatar` `/ping` `/math`")
        //     .setFooter({text: `Camelot ${cVersion} • Made by Apollo24 & PokeLink`, iconURL: "https://i.imgur.com/syj1LqO.jpeg"} )
        //     return interaction.reply({ embeds: [Embed] });
        // };
        
        const Embed = new MessageEmbed()
        .setTitle('Help')
        .setColor(0xbbffff)
        .setThumbnail("https://i.imgur.com/WWM4K98.png")
        .setDescription("Use `/help <command name>` for more information")
        .setFooter({text: `Camelot ${cVersion} • Made by Apollo24 & PokeLink`, iconURL: "https://i.imgur.com/syj1LqO.jpeg"} )

        switch (help) {
            case "abilities": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "ability": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "achievements":
            case "achvms":
            case "achvm": Embed.setDescription("**Usage**: `!achievements <@user (optional)>`\n**Alias**: `!achievements`, `!achvms`, `!achvm`\n\nThis command will show your progress for each achievement group along with the completion rewards. Tag someone else to see their progress.").setTitle("Help !achievements"); break;
            case "anime":
            case "a": Embed.setDescription("**Usage**: `!anime`\n**Alias**: `!anime`, `!a`\n\nThis command will list every series included in our database in alphabetical order. Your progress of completing any of them is shown next to it. Completed ones will have a check mark instead <a:check:873196253276700682>").setTitle("Help !anime"); break;
            case "arena": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "avatar": Embed.setDescription("**Usage**: `!avatar <@user>`\n**Alias**: `!avatar`\n\nGet someones profile picture.").setTitle("Help !avatar"); break;
            case "battlecharacter":
            case "battlechar":
            case "bc": 
            case "select": Embed.setDescription("**Usage**: `!select <character name or ID>`\n**Alias**: `!select`, `!battlechar`, `!bc`\n\nSelect a character to use in the dungeon and arena. If you can't decide which character to choose, use `!rankmy` to rank your best characters.").setTitle("Help !select"); break;
            case "balance":
            case "bal":
            case "coins": Embed.setDescription("**Usage**: `!balance <@user (optional)>`\n**Alias**: `!balance`, `!bal`, `!coins`\n\nGet yours or someone else's balance. Whether you can already use your daily or not will be shown too.").setTitle("Help !balance"); break;
            case "buy":
            case "buys": Embed.setDescription("**Usage**: `!buy <character pack ID>`\n**Alias**: `!buy`\n**Alternative**: `!buys`\n\nBuy a character pack from the `!shop`. There is no limit to the amount of packs you can buy but please note that <:SSTier:869316489931546644> **Tier** characters are excluded from **Morpheus Blessing** (character pack #6). If you want to pay with shards instead of coins, use `!buys`.").setTitle("Help !buy"); break;
            case "camelot": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "changeimage":
            case "changeimg": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "class": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "classes":
            case "class-list": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "class-info":
            case "classinfo": 
            case "ci": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "class-level": 
            case "classlevel": 
            case "classlvl": 
            case "clevel": 
            case "clvl": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "colorpicker":
            case "cp": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "convert":
            case "conv": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "cooldown":
            case "cd": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "curse": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "curses":
            case "curselist":
            case "cl": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "daily": Embed.setDescription("**Usage**: `!daily`\n**Alias**: `!daily`\n\nYou can claim your daily coins once per day. The amount you get is proportional to your level and your current streak, you start off with **200**<:coins:872926669055356939> and get an extre **10**<:coins:872926669055356939> for every 2nd level you reach, and another **10**<:coins:872926669055356939> for every consecutive day you claim your daily.").setTitle("Help !daily"); break;
            case "delay":
            case "animationdelay":
            case "anidelay":
            case "ad": Embed.setDescription("**Usage**: `!delay <number in ms>`\n**Alias**: `!delay`, `!animationdelay`, `!anidelay`, `!ad`\n\nWith this command you can change the animation delay in the dungeon to fit your preferences. It can be between 200-1200ms. If you like the bot and want to support us, please look up our `!patreon`!").setTitle("Help !delay"); break;
            case "disable": Embed.setDescription("**Usage**: `!disable <#channel>`\n**Alias**: `!disable`\n\nUse this command to disable a channel so that Camelot won't respond to messages coming from there. Use `!enable <#channel>` to enable a channel again.").setTitle("Help !disable"); break;
            case "dungeon":
            case "d": Embed.setDescription("**Usage**: `!dungeon <floor>`\n**Alias**: `!dungeon`, `!d`\n\nFight monsters in the dungeon to obtain rare rewards such as coins, shards and other items. To get started, you will need to select a character to use in the dungeon. Choose your character with `!select <char>`. If you're not sure which character you should pick, use `!rankmy` to rank your best characters.\nTo go to the next floor you will have to defeat monsters of your current floor 20 times. Every 5th floor is a Boss floor with higher drop rates for the first time you beat them.\n\n**Battle Mechanics**\n`ATK ⚔️`: Deal damage to your opponent\n`DEF 🛡️`: Increase your defense. Additionally, you have a 20% chance of blocking your opponents next attack.\n`SKIP ⏩`: Skip to the results\n`ABILITY ✨`: Some <:SSTier:869316489931546644>-Tier characters have unique abilities you can use during the battle. You can get a list of all characters with abilities using `!abilities` and get more information on a characters ability with `!ability <char>`").setTitle("Help !dungeon"); break;
            case "enable": Embed.setDescription("**Usage**: `!enable <#channel>`\n**Alias**: `!enable`\n\nEnable disabled channels again. To disable them use `!disable <#channel>` so Camelot won't respond to messages coming from there.").setTitle("Help !enable"); break;
            case "favourite":
            case "favorite":
            case "fav": Embed.setDescription("**Usage**: `!favourite <character name or ID>`\n**Alias**: `!favourite`, `!favorite`, `!fav`\n\nSelect your favourite character. You have to own it to be able to select it. The image of that character will then be displayed as a thumbnail on various commands of yours like on your `!profile` or `!level`.").setTitle("Help !favourite"); break;
            case "fib": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "find": Embed.setDescription("**Usage**: `!find <character name or ID>`\n**Alias**: `!find`\n\nFind users who own a character on your server. If there are multiple users owning that character, it will be sorted according to the amount of copies they have.").setTitle("Help !find"); break;
            case "flip": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "flipping": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "give": Embed.setDescription("**Usage**: `!give @user <amount of coins>`\n**Alias**: `!give`\n\nSend coins to another user. There is no limit. Please be aware that using alt accounts to get an advantage over other players is forbidden and can result in an inventory reset or even an account ban from Camelot.").setTitle("Help !give"); break;
            case "gift": Embed.setDescription("**Usage**: `!gift @user <character name or ID>`\n**Alias**: `!gift`\n\nSend characters to another user. Use the characters full **name** or **ID**. Please be aware that using alt accounts to get an advantage over other players is forbidden and can result in an inventory reset or even an account ban from Camelot.").setTitle("Help !gift"); break;
            case "help":
            case "h": Embed.setDescription("**Usage**: `!help <command name>`\n**Alias**: `!help`, `!h`\n\nThis will introduce you to a command by explaining what it does. Try it out, you'll get useful information even if you knew the command before, such as possible flags or arguments, how the command works etc.").setTitle("Help !help"); break;
            case "info":
            case "i":
            case "infostats":
            case "infos":
            case "is": Embed.setDescription("**Usage**: `!info <character name or ID>`\n**Alias**: `!info`, `!i`\n**Flags**: `-m`, `-s`, `-ms`\n\nSearch for a character in our database. You don't have to use the characters full name as long as there's no other match fitting your search. The characters full **name**, **rarity**, **ID** and the **series** they belong to will be displayed.\n\n**Flags**\n`!im`: Search for your own characters\n`!is`: Displays the characters base stats\n`!ims`: Shows your own characters stats").setTitle("Help !info"); break;
            case "infomy":
            case "imy":
            case "im":
            case "infomystats":
            case "imsd":
            case "ims": Embed.setDescription("**Usage**: `!infomy <character name or ID>`\n**Alias**: `!infomy`, `!imy`, `!im`\n**Flags**: `-s`\n\nSearch for a character you already have in your inventory. You don't have to use the characters full name as long as there's no other match fitting your search. The characters full **name**, **rarity**, the **series** they belong to, how many **copies** you possess and its **\*refinement** will be displayed.\nUse `!info` if you want to look for a character you don't have.").setTitle("Help !infomy").addField("\*Refinement (<:refinement:869132309125824552>)", "You can level up a characters refinement by pulling the character more than once or by refining the character with `!shards`. This will increase your characters stats. Please see `!help refine` for more information."); break;
            case "inventory":
            case "inv":
            case "inva":
            case "invr":
            case "invd": Embed.setDescription("**Usage**: `!inventory <page number (optional)> <@user (optional)>`\n**Alias**: `!inventory`, `!inv`\n**Flags**: `-r`, `-a`, `-d`\n\nSee yours or someone else's inventory. It will be sorted by your pull order by default, this can be changed using flags.\n\n**Flags**:\n`!invr`: Sorts your inventory after rarity\n`!inva`: Sorts your inventory in alphabetical order\n`!invd`: Sorts and only shows your duplicate characters").setTitle("Help !inventory"); break;
            case "level":
            case "lvl": Embed.setDescription("**Usage**: `!level <@user (optional)>`\n**Alias**: `!level`, `!lvl`\n\nSee your current level and how much more XP you need to level up alongside a progress bar. Currently the only way of getting XP is by pulling characters. You get **1-10** XP for each pull. <:STier:869316518675095552>-Tier characters will give you twice the amount of XP, and <:SSTier:869316489931546644>-Tier characters give an extra **20** XP on top of what you would've gotten.").setTitle("Help !level"); break;
            case "levelup":
            case "lootbox":
            case "lb": Embed.setDescription("**Usage**: `!lootbox`\n**Alias**: `!lootbox`, `!lb`\n\nSee how many lootboxes you've left. You can open them using either `!open` or `!use lootbox`/`!use lb`").setTitle("Help !lootbox"); break;
            case "lu":
            case "lvlup": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "list": Embed.setDescription("**Usage**: `!list <rarity>`\n**Alias**: `!list`\n\nGet a list of all characters of a rarity. The characters will be shown together with their series and sorted accordingly. Owned characters will have a check mark next to them <a:check:873196253276700682>").setTitle("Help !list"); break;
            case "math": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "name": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "open": Embed.setDescription("**Usage**: `!open`\n**Alias**: `!open`\n\nOpen your lootboxes. Alternatively you can use `!use lb` to do the same thing.").setTitle("Help !open"); break;
            case "patreon": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "pick": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "ping": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "pity": Embed.setDescription("**Usage**: `!pity <@user (optional)`\n**Alias**: `!pity`\n\nIf players don't get an <:STier:869316518675095552>-Tier or <:SSTier:869316489931546644>-Tier character in their last 80 and 210 pulls, their next pull will be a guaranteed <:STier:869316518675095552>-Tier or <:SSTier:869316489931546644>-Tier character. `!pity` will show your progress. Note that premium users will have a lower pity.").setTitle("Help !pity"); break;
            case "prefix": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "premium": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "profile":
            case "pr": Embed.setDescription("**Usage**: `!profile <@user (optional)>`\n**Alias**: `!profile`, `!pr`\n\nGet yours or someone else's camelot profile. Your current `!level`, amount of `!coins` and progress will be shown.").setTitle("Help !profile"); break;
            case "pull":
            case "p": Embed.setDescription("**Usage**: `!pull`\n**Alias**: `!pull`, `!p`\n\nPull a character. You can use this command 6 times every 2 hours. You can reset your pulls with `!rp` after you've voted to get additional pulls.").setTitle("Help !pull").addFields({ name: 'Droprates', value: "<:SSTier:869316489931546644> **Tier**: 0,3%\n<:ATier:869316558013464627> **Tier**: 4,2%\n<:CTier:869316602858991657> **Tier**: 25,3%", inline: true },{ name: '_ _', value: "<:STier:869316518675095552> **Tier**: 1,8%\n<:BTier:869316586803179571> **Tier**: 12,6%\n<:DTier:869316616071032843> **Tier**: 55,8%", inline: true },); break;
            case "ps": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "purge": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "ram": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "random": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "rank": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "rankmy": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "ranks": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "ref":
            case "refine": Embed.setDescription("**Usage**: `!refine <character name or ID>`\n**Alias**: `!refine`, `!ref`\n\nIncrease the refinement level of your character. This will increase the characters base stats by **25%** for each level. You will need 16 shards of the characters rarity to refine them. Currently the maximum level is 5.").setTitle("Help !refine"); break;
            case "recommend": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "reset": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "rp": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "search":
            case "s":
            case "si": Embed.setDescription("**Usage**: `!search <anime name or alias>`\n**Alias**: `!search`, `!s`\n**Flags**: `-i`\n\nSearch for an anime to list all characters of it. You can use the full name, an alias or try an acronym. The characters will be ranked according to their rarity, then ID. Owned charakters will have a check mark next to them <a:check:873196253276700682>\n\n**Flags**:\n`!si`: Shows characters with their images").setTitle("Help !search"); break;
            case "seed": Embed.setDescription("**Usage**: `!seed <string>`\n**Alias**: `!seed`\n\nThis is a premium feature with which you can change the base stats of all characters in your server. You'll need to have admin permissions on the server where you want to change the seed. The string can by any text up to 20 characters long. To reset the changes and go back to the default ranking, use `!seed reset`").setTitle("Help !seed"); break;
            case "sell": Embed.setDescription("**Usage**: `!sell <name or ID>`\n**Alias**: `!sell`\n**Keywords**: `last`, `dupes`\n\nSell your characters. You can't get them back once you've confirmed the action. The amount of coins you get are as listed below.\n\n**Keywords**:\n`!sell last`: Sells the last character added to your inventory\n`!sell dupes`: Sells all of your duplicate characters. This command takes in 2 optional arguments, first the amount of copies a character should have, then the rarity. Example usage: `!sell dupes 3 C` (Sells all copies of C-Tier characters with more than 3 copies)").setTitle("Help !sell").addFields({ name: 'Values', value: "<:SSTier:869316489931546644> **Tier**: 5000<:coins:872926669055356939>\n<:ATier:869316558013464627> **Tier**: 500<:coins:872926669055356939>\n<:CTier:869316602858991657> **Tier**: 100<:coins:872926669055356939>", inline: true },{ name: '_ _', value: "<:STier:869316518675095552> **Tier**: 1000<:coins:872926669055356939>\n<:BTier:869316586803179571> **Tier**: 250<:coins:872926669055356939>\n<:DTier:869316616071032843> **Tier**: 50<:coins:872926669055356939>", inline: true },); break;
            case "shards": Embed.setDescription("**Usage**: `!shards`\n**Alias**: `!shards`\n\nThis command will show all your shards. They're used to `!refine` characters. You can obtain them in the dungeon, through lootboxes or achievements. Additionally you can `!convert` shards from lower rarities to higher rarities.").setTitle("Help !shards"); break;
            case "shop": Embed.setDescription("**Usage**: `!shop`\n**Alias**: `!shop`\n\nSee the card game shop where you can buy different character packs. To buy one, use `!buy <id>` if you want to pay with coins or `!buys <id>` if you want to use shards instead. There is no limit to the amount of packs you can buy, except if it is statet so in its description.").setTitle("Help !shop"); break;
            case "stats": Embed.setDescription("**Usage**: `!stats`\n**Alias**: `!stats`\n\nSee some stats of Camelots card game, specifically the amount of characters in a Tier, how many male and female characters there are as well as the amount of series included in Camelot.").setTitle("Help !stats"); break;
            case "submit": Embed.setDescription("**Usage**: `!submit <message>`\n**Alias**: `!submit`\n\nSend us your ideas or wishes for future updates to help improve Camelot! This can be anything from an anime you'd like us to add, missing or wrong characters or images, feature suggestions and more. You can join our Support server if you wanna discuss it directly with us: <https://discord.gg/myy9PBCdEW>\n\nPlease note that you can be banned from using this command for spam messages.").setTitle("Help !submit"); break;
            case "support": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "tickets":
            case "ticket": Embed.setDescription("**Usage**: `!tickets`\n**Alias**: `!tickets`, `!ticket`\n\nThis will show all your tickets if you have any. Tickets are obtainable from lootboxes (`!vote`) and from the `!weekly` command.").setTitle("Help !tickets"); break;
            case "top":
            case "topp":
            case "topc":
            case "topc%":
            case "topa":
            case "topd": Embed.setDescription("**Usage**: `!top <page number (optional)>`\n**Alias**: `!top`\n**Flags**: `-p`, `-c`, `-c%`, `-a`, `-d`\n\nGet your servers toplist. It is ranked after user levels by default, but you can change the ranking with flags. The thumbnail will either be a random character of the first placed user or their favourite character if they have one.\n\n**Flags**\n`!topp`: Sorts after total pulls\n`!topc`: Sorts after characters collected\n`!topc%`: Sorts after the ratio of collected characters\n`!topa`: Sorts after anime completed\n`!topd`: Sorts after dungeon progress").setTitle("Help !top"); break;
            case "trade": Embed.setDescription("**Usage**: `!trade @user <char to offer> , <char to receive>`\n**Alias**: `!trade`\n\nTrade your characters with someone else. The person receiving the offer will have **15** seconds to accept, it will be cancelled otherwise.").setTitle("Help !trade"); break;
            case "upgrade":
            case "class-upgrade":
            case "classupgrade": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "use": Embed.setDescription("**Usage**: `!use <item name>`\n**Alias**: `!use`\n\nYou can use usable items with this command. Currently this includes tickets and lootboxes.").setTitle("Help !use"); break;
            case "vote": Embed.setDescription("There hasn't been added any information to this command yet. So if you wanna learn more about it, try it out!").setTitle(`Help /${help}`); break;
            case "weekly": Embed.setDescription("**Usage**: `!weekly`\n**Alias**: `!weekly`\n\nThis is a premium feature. Similar to `!daily`, with better rewards. A weekly can include many times more the coins and tickets. You can find more details about it on our `!patreon`").setTitle("Help !weekly"); break;
            default : Embed.setDescription(`There is currently no such command as **${help}**\nIf you think there's a mistake, please let us know on our \`!support\` server or send us a submission via \`!submit\``).setTitle("Help"); break;
        };
        interaction.reply({ embeds: [Embed] });
        
	},
};