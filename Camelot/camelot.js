var fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.login(config.token);


var pullCount = JSON.parse(fs.readFileSync('Storage/pullCount.json', 'utf8'));
var daily = JSON.parse(fs.readFileSync('Storage/daily.json', 'utf8'));
var xp = JSON.parse(fs.readFileSync('Storage/xp.json', 'utf8'));
var servPrefix = JSON.parse(fs.readFileSync('Storage/servPrefix.json', 'utf8'));
var channelLock = JSON.parse(fs.readFileSync('Storage/channelLock.json', 'utf8'));
var premium = JSON.parse(fs.readFileSync('Storage/premium.json', 'utf8'));
var weekly = JSON.parse(fs.readFileSync('Storage/weekly.json', 'utf8'));
var premiumGift = JSON.parse(fs.readFileSync('Storage/premiumGift.json', 'utf8'));
var premiumGifted = JSON.parse(fs.readFileSync('Storage/premiumGifted.json', 'utf8'));
var pullResets = JSON.parse(fs.readFileSync('Storage/pullResets.json', 'utf8'));
var votesTotal = JSON.parse(fs.readFileSync('Storage/votesTotal.json', 'utf8'));

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
};

var cVersion = "V2.4.7";

// Extract the required classes from the discord.js module
const { MessageEmbed, MessageAttachment } = require('discord.js');

client.on('ready', () => {
    console.log("Connected as " + client.user.tag)
	client.user.setPresence({ activity: { name: 'Fate', type: 'WATCHING'}, status: 'online'})

    // Check Premium
    let guild = client.guilds.cache.get("927257132624130119");
    let pRoles = ["927269716827987998", "927269781869060147", "927274790769811497", "927274836244447312", "927274875490562058", "927274897208672326"]
    for (i=0; i < Object.keys(premium).length; i++) {
        let member = guild.members.cache.get(Object.keys(premium)[i]);
        let includes = 0;
        member.roles.cache.forEach(role => {
            if (pRoles.includes(role.id)) includes++, premium[Object.keys(premium)[i]] = "" + (pRoles.indexOf(role.id)+1);
        });
        if (includes < 1 && !premiumGift[Object.keys(premium)[i]]) premium[Object.keys(premium)[i]] = "";
    };
    fs.writeFile('Storage/premium.json', JSON.stringify(premium), (err) => {
        if (err) console.error(err);
    });


    let interval = () => setInterval(function() {
        // Pull Reset
        if (new Date().getHours() % 2 === 0 && new Date().getMinutes() === 0) {
            let keys = Object.keys(pullCount);
            for (i=0; i < keys.length; i++) {
                pullCount[keys[i]] = 0;
            };
            fs.writeFile('Storage/pullCount.json', JSON.stringify(pullCount), (err) => {
                if (err) console.error(err);
            });
        };

        // Daily Reset
        if (new Date().getHours() === 0 && new Date().getMinutes() === 0) {
            let keys = Object.keys(daily);
            for (i=0; i < keys.length; i++) {
                daily[keys[i]] = 0;
            };
            fs.writeFile('Storage/daily.json', JSON.stringify(daily), (err) => {
                if (err) console.error(err);
            });
        };

        // Weekly Reset (% 604'800'000ms)
        if (new Date().getTime() % (7*24*60*60000) < 60000) {
            let keys = Object.keys(weekly);
            for (i=0; i < keys.length; i++) {
                weekly[keys[i]] = 0;
            };
            fs.writeFile('Storage/weekly.json', JSON.stringify(weekly), (err) => {
                if (err) console.error(err);
            });
        };

        // Dungeon Reset
        if (new Date().getHours() % 8 === 0 && new Date().getMinutes() === 0) {
            var dungeonLimit = JSON.parse(fs.readFileSync('Storage/dungeonLimit.json', 'utf8'));
            let keys = Object.keys(dungeonLimit);
            for (i=0; i < keys.length; i++) {
                dungeonLimit[keys[i]] = { current: 0, normal: 0 }
            };
            fs.writeFile('Storage/dungeonLimit.json', JSON.stringify(dungeonLimit), (err) => {
                if (err) console.error(err);
            });
        };

    }, 60000);
    
    setTimeout(interval, 60000 - (new Date().getTime() % 60000));

    setInterval(() => {
        // Check if premium gift expired
        let keys = Object.keys(premiumGift);
        for (i=0; i < keys.length; i++) {
            if (premium[keys[i]]) {
                if (premiumGift[keys[i]].method === "vote") {
                    if (new Date().getTime() - premiumGift[keys[i]].date > 7*24*60*60*1000) {
                        premium[keys[i]] = "";
                        delete premiumGift[keys[i]];
                    };
                } else {
                    if (new Date().getTime() - premiumGift[keys[i]].date > 30*24*60*60*1000) {
                        premium[keys[i]] = "";
                        delete premiumGift[keys[i]];
                    };
                };
            };
        };
        fs.writeFile('Storage/premium.json', JSON.stringify(premium), (err) => {
            if (err) console.error(err);
        });
        fs.writeFile('Storage/premiumGift.json', JSON.stringify(premiumGift), (err) => {
            if (err) console.error(err);
        });
    }, 60*60*1000);

    setInterval(() => {
        // Reset Premium gifts on every 1st of the month;
        if (new Date().getDate() == "1") {
            for (i=0; i < Object.keys(premiumGifted).length; i++) {
                premiumGifted[Object.keys(premiumGifted)[i]] = 0;
            };
            fs.writeFile('Storage/premiumGifted.json', JSON.stringify(premiumGifted), (err) => {
                if (err) console.error(err);
            });
        };
    }, 24*60*60*1000);

});

client.on("message", async message => {

    // Voting webhook
    if (message.channel.id == "935132799881580576") {
        var lastVote = JSON.parse(fs.readFileSync('Storage/lastVote.json', 'utf8'));
        let user = message.content.match(/\d+/gm)[0];
        if (!pullResets[user]) pullResets[user] = 0;
        if (!votesTotal[user]) votesTotal[user] = 0;
        pullResets[user]++;
        votesTotal[user]++;
        lastVote[user] = new Date().getTime();
        fs.writeFile('Storage/pullResets.json', JSON.stringify(pullResets), (err) => {
            if (err) console.error(err);
        });
        fs.writeFile('Storage/votesTotal.json', JSON.stringify(votesTotal), (err) => {
            if (err) console.error(err);
        });
        fs.writeFile('Storage/lastVote.json', JSON.stringify(lastVote), (err) => {
            if (err) console.error(err);
        });
    };

    // Exit and stop if it's not there
    if (!message.guild) return;
    if (message.author.bot) return;

    // Set Prefix, args and cmd
    var prefix = "?";
    if (servPrefix[message.guild.id]) prefix = servPrefix[message.guild.id];
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    // Exit and stop if it's not there
    if (!message.content.startsWith(prefix)) return;
    if (channelLock.disabled.includes(message.channel.id) && (cmd !== "enable" && cmd !== "disable")) return;

    // Set prefix
    if (cmd === "prefix" || cmd == "pref") {
        if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send("You can't change the prefix of this server");
        if (!args[0]) return message.channel.send("Change Camelots prefix. Alternatively, you can use `" + prefix + "pref` if the prefix collides with another bot.");
        servPrefix[message.guild.id] = args[0];
        fs.writeFile('Storage/servPrefix.json', JSON.stringify(servPrefix), (err) => {
            if (err) console.error(err);
        });
        message.channel.send("The prefix of this server has been changed to `" + servPrefix[message.guild.id] + "`")
    };

    // Disabled Channels
    if (cmd === "disable" || cmd === "enable") {
        if (!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send("You can't disable channels of this server, please ask an admin");
        let chID = message.channel.id;
        if (args[0] && message.content.match(/\d{18}/g)) chID = message.content.match(/\d{18}/g)[0];
        if (cmd === "disable") {
            if (channelLock.disabled.includes(chID)) return message.channel.send(`<#${chID}> is already disabled. Use \`${prefix}enable\` to enable it.`);
            channelLock.disabled.push(chID);
            message.channel.send(`<#${chID}> has been disabled. Use \`${prefix}enable\` to enable it again`)
        } else {
            if (!channelLock.disabled.includes(chID)) return message.channel.send(`<#${chID}> is already enabled. Use \`${prefix}disable\` to disable it.`);
            channelLock.disabled.splice(channelLock.disabled.indexOf(chID), 1);
            message.channel.send(`<#${chID}> has been enabled. Use \`${prefix}disable\` to disable it again`)
        };
        fs.writeFile('Storage/channelLock.json', JSON.stringify(channelLock), (err) => {
            if (err) console.error(err);
        });
    };

    // Premium gifts
    if (cmd === "gift" && args[1] && args[1].toLowerCase() === "premium") {
        if ((!premium[message.author.id] || premium[message.author.id] < 3) && message.author.id !== "489490486734880774") return message.channel.send("You need to have at least T3 Premium to gift others premium. See our `" + prefix + "patreon` for more information.");
        if (!premiumGifted[message.author.id]) premiumGifted[message.author.id] = 0;
        let giftLimit = 0;
        if (message.author.id === "489490486734880774") {
            switch (premium[message.author.id]) {
                case "3": giftLimit = 1; break;
                case "4": giftLimit = 3; break;
                case "5": giftLimit = 3; break;
                case "6": giftLimit = 5; break;
                default : false; break;
            };
        } else {
            giftLimit = 100000;
        };
        if (premiumGifted[message.author.id] >= giftLimit) {
            fs.writeFile('Storage/premiumGifted.json', JSON.stringify(premiumGifted), (err) => {
                if (err) console.error(err);
            });
            return message.channel.send(`You can only give ${giftLimit} premium away. Premium gifts are resetted on every 1st of the month.${giftLimit == 5 ? "" : ` You can look up our \`${prefix}patreon\` if you need more.`}`)
        };

        if (!message.mentions.users.first()) return message.channel.send("Please mention someone first");
        let user = message.mentions.users.first();
        if (user.id === message.author.id) return message.channel.send("You can't gift yourself premium.");
        if (premium[user.id]) return message.channel.send(`${user.username} already has premium`);
        if (user.bot) return message.channel.send("You can't gift bots premium.");

        premiumGift[user.id] = { "method":"gift", "date":new Date().getTime() }
        premium[user.id] = "1";
        premiumGifted[message.author.id]++;
        fs.writeFile('Storage/premium.json', JSON.stringify(premium), (err) => {
            if (err) console.error(err);
        });
        fs.writeFile('Storage/premiumGift.json', JSON.stringify(premiumGift), (err) => {
            if (err) console.error(err);
        });
        fs.writeFile('Storage/premiumGifted.json', JSON.stringify(premiumGifted), (err) => {
            if (err) console.error(err);
        });
        return message.channel.send(`${user.toString()} has received 1 month of premium!`);
    };

    // Ping!
    if (cmd === "ping" || cmd === "pong") {
        let pong = cmd === "ping" ? "pong! 🏓" : "ping! 🏓";
        const Embed = new MessageEmbed().setTitle(pong).setColor(0xbbffff)
        const msg = await message.channel.send(Embed);
        msg.edit(Embed.setTitle(`${pong} ${Math.floor(msg.createdAt - message.createdAt)}ms`));
    };
    
    // Purge Command
    if (cmd === "purge") {
        client.commands.get('purge').execute(message, args, prefix);
    };

    // Command List
    if (cmd === "help" || cmd === "h" || cmd === "commands" || cmd === "cmd") {
        client.commands.get('help').execute(message, args, prefix, cVersion);
    };

    // Support Server
    if (cmd === "support") {
        const Embed = new MessageEmbed()
        .setTitle("Camelot Support")
        .setColor(0xbbffff)
        .setThumbnail("https://i.imgur.com/WWM4K98.png")
        .setDescription("Join our support server to reach us!\nYou can ask for help and help us improve the bot <:RaphiSmile:868998036645380197>\n\nServer Link: https://discord.gg/myy9PBCdEW")
        .setFooter(`Camelot ${cVersion} • Made by Apollo24 & PokeLink`, "https://i.imgur.com/syj1LqO.jpeg")
        message.channel.send(Embed)
    };

    // Premium
    if (cmd === "premium" || cmd === "patreon") {
        const Embed = new MessageEmbed()
        .setTitle("Camelot Premium")
        .setColor(0xbbffff)
        .setThumbnail("https://i.imgur.com/WWM4K98.png")
        .setDescription("Camelot Premium offers a lot of features to make your playing experience much better. If you enjoy playing with Camelot, we would really appreciate your support! <:fumino_heart:794983494534955038>\nYou can find out more about the features and benefits of premium on our patreon.\n\nPatreon Link: https://www.patreon.com/cmlt")
        .setFooter(`Camelot ${cVersion} • Made by Apollo24 & PokeLink`, "https://i.imgur.com/syj1LqO.jpeg")
        message.channel.send(Embed)
    };

    // Vote
    if (cmd === "vote") {
        let canVote = "You can **vote** now!";
        var lastVote = JSON.parse(fs.readFileSync('Storage/lastVote.json', 'utf8'));
        if (lastVote[message.author.id] && ((new Date().getTime() - lastVote[message.author.id]) < 12*60*60*1000)) {
            let hr = Math.floor(((12*60*60*1000) - (new Date().getTime() - lastVote[message.author.id])) / (60*60*1000));
            let min = Math.floor((((12*60*60*1000) - (new Date().getTime() - lastVote[message.author.id])) % (60*60*1000)) / (60*1000))+1;
            canVote = `You can't vote now. You'll have to wait ${hr ? `**${hr}**h ` : ""}${`**${min}**min`}`;
        };
        message.channel.send(`${canVote}\nYou will be able to reset your pull counter afterwards with \`!rp\`\nYou can vote for Camelot at top.gg: https://top.gg/bot/695286837568340119/vote`);
    };

    // User Avatar
    if (cmd === "avatar") {
        let user = message.author;
        if (message.mentions.users.first()) user = message.mentions.users.first();
        const Embed = new MessageEmbed()
        .setImage(user.displayAvatarURL({ dynamic: true }) + "?size=2048")
        .setColor(0xbbffff)
        message.channel.send(Embed);
    };

    // Infos about the bot
    if (cmd === "camelot") {
        client.commands.get('info').execute(message, args, client, cVersion);
    };

    // Pull Characters
    if (cmd === "pull" || cmd === "p") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Reset Pulls
    if (cmd === "rp") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Inventory
    if (cmd === "inv" || cmd === "inventory" || cmd === "invr" || cmd === "inva" || cmd === "invd") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Profile
    if (cmd === "profile" || cmd === "pr") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Level
    if (cmd === "level" || cmd === "lvl") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Top
    if (cmd === "top" || cmd === "topp" || cmd === "topc" || cmd === "topc%" || cmd === "topa" || cmd === "topd") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // infomy
    if (cmd === "im" || cmd === "imy" || cmd === "infomy") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Charakter info
    if (cmd === "info" || cmd === "i") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Find Characters
    if (cmd === "find") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Anime search
    if (cmd === "search" || cmd === "s") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Anime search Image
    if (cmd === "si") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Pity
    if (cmd === "pity") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Daily
    if (cmd === "daily") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Daily
    if (cmd === "weekly") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Sell
    if (cmd === "sell") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Shop
    if (cmd === "shop") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Buy
    if (cmd === "buy") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Balance
    if (cmd === "balance" || cmd === "bal" || cmd === "coins") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Give
    if (cmd === "give") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Gift
    if (cmd === "gift") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Trade
    if (cmd === "trade") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // CCG stats
    if (cmd === "stats") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // List all anime
    if (cmd === "anime" || cmd === "a") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // List Rarity
    if (cmd === "list") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Favourite Char
    if (cmd === "fav" || cmd === "favourite" || cmd === "favorite") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Change images
    if (cmd === "changeimage" || cmd === "changeimg") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Base stats
    if (cmd === "is" || cmd === "infos" || cmd === "infostats") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Character Base Seed
    if (cmd === "seed") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Character Base Rank
    if (cmd === "rank") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // My characters ranking
    if (cmd === "rankmy") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // My characters ranking
    if (cmd === "ranks" || cmd === "rankserv" || cmd === "rankserver") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Level up Characters
    if (cmd === "levelup" || cmd === "lvlup" || cmd === "lu") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Reset level
    if (cmd === "reset") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Base stats
    if (cmd === "ims" || cmd === "infomystats") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // EP Calculator
    if (cmd === "ep") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Dungeon
    if (cmd === "dungeon" || cmd === "d") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Arena
    if (cmd === "arena") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Animation Delay
    if (cmd === "animationdelay" || cmd === "delay" || cmd === "anidelay" || cmd === "ad") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Dungeon Info
    if (cmd === "di" || cmd === "dungeoninfo" || cmd === "dungeon-info") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Battle Char
    if (cmd === "bc" || cmd === "select" || cmd === "battlechar" || cmd === "battlecharacter") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Shards
    if (cmd === "shards") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Convert Shards
    if (cmd === "convert" || cmd === "conv") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Tickets
    if (cmd === "tickets" || cmd === "ticket") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Use Tickets
    if (cmd === "use") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Refine
    if (cmd === "refine" || cmd === "ref") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Abilities
    if (cmd === "abilities") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Cooldown
    if (cmd === "cooldown" || cmd === "cd") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

    // Recommendations
    if (cmd === "recommendations" || cmd === "recommend" || cmd === "rec") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };
    
    
    // Math
    // Random number between 1-100
    if (cmd === "random" || cmd === "rand") {
        const gildas = Math.floor(Math.random() * 101);
        switch (gildas) {
            case 24 : message.channel.send('24 🎉'); break;
            case 42 : message.channel.send('42, Answer to the Ultimate Question of Life, the Universe, and Everything'); break;
            case 69 : message.channel.send('69 😉'); break;
            case 91 : message.channel.send('91 🏆'); break;
            default : message.channel.send(gildas); break;
        };
    };

    // flip
    if (cmd === "flip" || cmd === "toss") {
        const Embed = new MessageEmbed()
        .setTitle(Math.random() < 0.5 ? "Heads" : "Tails")
        .setColor(0xbbffff)
        message.channel.send(Embed);
    };
    
    // flip - ping
    if (cmd === "flipping" || cmd === "fp") {
        const Embed = new MessageEmbed().setTitle('calculating...').setColor(0xbbffff)
        const msg = await message.channel.send(Embed);
        msg.edit(Embed.setTitle(`${Number.isInteger((msg.createdAt - message.createdAt) * 0.5)}`));
    };

    // RAM Usage
    if (cmd === "ram" || cmd === "memory") {
        const ramUsage = 240 + Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 10) / 10;
        const Embed = new MessageEmbed()
        .setTitle('Total Memory Usage')
        .setColor(0xbbffff)
        .setDescription(`Currently **${ramUsage}MB** is beeing used`)
        message.channel.send(Embed);
    };
    

    // -- -- -- PLAYGROUND -- -- -- //
    // -- -- -- PLAYGROUND -- -- -- //
    // -- -- -- PLAYGROUND -- -- -- //

    // Did Poke make any mistakes?
    if (cmd === "did") {
        client.commands.get('characters').execute(message, args, cmd, client);
    };

});


client.on("guildMemberUpdate", (oldMember, newMember) => {
    if (newMember.guild.id !== "927257132624130119") return;
    if (oldMember.roles.cache.size === 1 && newMember.roles.cache.size === 1) return;

    let pRoles = ["927269716827987998", "927269781869060147", "927274790769811497", "927274836244447312", "927274875490562058", "927274897208672326"];
    let cRole = {"id":0};
    let roleAdded = true;

    // When Role Removed
    if (oldMember.roles.cache.size > newMember.roles.cache.size) {
        roleAdded = false;
        oldMember.roles.cache.forEach(role => {
            if (!newMember.roles.cache.has(role.id)) cRole = role;
        });
    } else
    // When Role Added
    if (oldMember.roles.cache.size < newMember.roles.cache.size) {
        newMember.roles.cache.forEach(role => {
            if (!oldMember.roles.cache.has(role.id)) cRole = role;
        });
    };

    if(cRole.id) {
        if (!pRoles.includes(cRole.id)) return;
    } else {
        return;
    };

    if (roleAdded) {
        premium[newMember.user.id] = "" + (pRoles.indexOf(cRole.id)+1);
    } else {
        if (!premiumGift[newMember.user.id]) premium[newMember.user.id] = "";
    };

    fs.writeFile('Storage/premium.json', JSON.stringify(premium), (err) => {
        if (err) console.error(err);
    });
});

client.on("guildMemberRemove", function(member){
    if (member.guild.id !== "927257132624130119") return;
    premium[member.id] = "";
    fs.writeFile('Storage/premium.json', JSON.stringify(premium), (err) => {
        if (err) console.error(err);
    });
});