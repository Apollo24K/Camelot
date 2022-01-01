var fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');
const math = require('mathjs');
const client = new Discord.Client();
const disbut = require('discord-buttons');
disbut(client);
client.commands = new Discord.Collection();
client.login(config.token)

var pullCount = JSON.parse(fs.readFileSync('Storage/pullCount.json', 'utf8'));
var daily = JSON.parse(fs.readFileSync('Storage/daily.json', 'utf8'));
var xp = JSON.parse(fs.readFileSync('Storage/xp.json', 'utf8'));
var inviteLogs = JSON.parse(fs.readFileSync('Storage/inviteLogs.json', 'utf8'));

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// Extract the required classes from the discord.js module
const { MessageEmbed, MessageAttachment } = require('discord.js');

client.on('ready', () => {
    console.log("Connected as " + client.user.tag)
	client.user.setPresence({ activity: { name: 'Fate', type: 'WATCHING'}, status: 'online'})

    // Invite Logs
    client.guilds.cache.each(guild => {
        if (guild.id === "537655461554421771") {
            guild.fetchInvites().then(guildInvites => {
                guildInvites.each(guildInvite => {
                    inviteLogs[guildInvite.code] = guildInvite.uses;
                });
                fs.writeFile('Storage/inviteLogs.json', JSON.stringify(inviteLogs), (err) => {
                    if (err) console.error(err);
                });
            });
        };
    });

  setInterval(function() {
    // Pull Reset
    if (new Date().getHours() % 2 === 0 && new Date().getMinutes() === 0) {
      let keys = Object.keys(pullCount);
      for (i=0; i < keys.length; i++) {
        pullCount[keys[i]] = 2;
        if (xp[keys[i]] > 659) pullCount[keys[i]]--;
        if (xp[keys[i]] > 3520) pullCount[keys[i]]--;
      };
      fs.writeFile('Storage/pullCount.json', JSON.stringify(pullCount), (err) => {
        if (err) console.error(err);
      });
    };

    // Daily Reset
    if (new Date().getHours() === 23 && new Date().getMinutes() === 59) {
      let keys = Object.keys(daily);
      for (i=0; i < keys.length; i++) {
        daily[keys[i]] = 0;
      };
      fs.writeFile('Storage/daily.json', JSON.stringify(daily), (err) => {
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
  
});

client.on("message", async message => {

    const prefix = "!";
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    // Exit and stop if it's not there
    if (!message.guild) return;
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    
    // Ping!
    if (cmd === "ping" || cmd === "pong") {

        let pong = "pong! 🏓";
        if (cmd === "pong") pong = "ping! 🏓";

        const embed1 = new MessageEmbed()
        .setTitle(pong)
        .setColor(0xbbffff)
        const msg = await message.channel.send(embed1);

        const embed2 = new MessageEmbed()
        .setTitle(`${pong} ${Math.floor(msg.createdAt - message.createdAt)}ms`)
        .setColor(0xbbffff)
        msg.edit(embed2);
    };

    // Purge Command
    if (cmd === "purge") {
        client.commands.get('purge').execute(message, args);
    };

    // Command List
    if (cmd === "help" || cmd === "h" || cmd === "commands" || cmd === "cmd") {
        client.commands.get('help').execute(message, args);
    };

    // List Emoji
    if (cmd === "emojilist" || cmd === "el") {
        client.commands.get('emojilist').execute(message, args);
    };

    // Emojis
    if (message.content.startsWith(prefix)) {
        client.commands.get('emojis').execute(message, args);
    };

    // User Avatar
    if (cmd === "avatar") {
        client.commands.get('avatar').execute(message, args);
    };

    // Infos about the bot
    if (cmd === "camelot") {
        client.commands.get('info').execute(message, args);
    };

    // Color Picker
    if (cmd === "colorpicker" || cmd === "cp") {
        message.channel.send("https://htmlcolorcodes.com/color-picker/")
    };

    // SHA TEST
    if (cmd === "sha") {
        client.commands.get('characters').execute(message, args);
    };

    // Pull Characters
    if (cmd === "pull" || cmd === "p") {
        client.commands.get('characters').execute(message, args);
    };

    // Inventory
    if (cmd === "inv" || cmd === "inventory" || cmd === "invr" || cmd === "inva" || cmd === "invd") {
        client.commands.get('characters').execute(message, args);
    };

    // Profile
    if (cmd === "profile" || cmd === "pr") {
        client.commands.get('characters').execute(message, args);
    };

    // Level
    if (cmd === "level" || cmd === "lvl") {
        client.commands.get('characters').execute(message, args);
    };

    // Top
    if (cmd === "top" || cmd === "topp" || cmd === "topc" || cmd === "topc%" || cmd === "topa" || cmd === "topd") {
        client.commands.get('characters').execute(message, args);
    };

    // infomy
    if (cmd === "im" || cmd === "imy" || cmd === "infomy") {
        client.commands.get('characters').execute(message, args);
    };

    // Charakter info
    if (cmd === "info" || cmd === "i") {
        client.commands.get('characters').execute(message, args);
    };

    // Find Characters
    if (cmd === "find") {
        client.commands.get('characters').execute(message, args);
    };

    // Anime search
    if (cmd === "search" || cmd === "s") {
        client.commands.get('characters').execute(message, args);
    };

    // Pity
    if (cmd === "pity") {
        client.commands.get('characters').execute(message, args);
    };

    // Daily
    if (cmd === "daily") {
        client.commands.get('characters').execute(message, args);
    };

    // Sell
    if (cmd === "sell") {
        client.commands.get('characters').execute(message, args);
    };

    // Shop
    if (cmd === "shop") {
        client.commands.get('characters').execute(message, args);
    };

    // Buy
    if (cmd === "buy") {
        client.commands.get('characters').execute(message, args);
    };

    // Balance
    if (cmd === "balance" || cmd === "bal" || cmd === "coins") {
        client.commands.get('characters').execute(message, args);
    };

    // Give
    if (cmd === "give") {
        client.commands.get('characters').execute(message, args);
    };

    // Gift
    if (cmd === "gift") {
        client.commands.get('characters').execute(message, args);
    };

    // Trade
    if (cmd === "trade") {
        client.commands.get('characters').execute(message, args);
    };

    // CCG stats
    if (cmd === "stats") {
        client.commands.get('characters').execute(message, args);
    };

    // List all anime
    if (cmd === "anime" || cmd === "a") {
        client.commands.get('characters').execute(message, args);
    };

    // List Rarity
    if (cmd === "list") {
        client.commands.get('characters').execute(message, args);
    };

    // Favourite Char
    if (cmd === "fav" || cmd === "favourite" || cmd === "favorite") {
        client.commands.get('characters').execute(message, args);
    };

    // Base stats
    if (cmd === "is" || cmd === "infos" || cmd === "infostats") {
        client.commands.get('characters').execute(message, args);
    };

    // Character Base Rank
    if (cmd === "rank") {
        client.commands.get('characters').execute(message, args);
    };

    // My characters ranking
    if (cmd === "rankmy") {
        client.commands.get('characters').execute(message, args);
    };

    // My characters ranking
    if (cmd === "ranks" || cmd === "rankserv" || cmd === "rankserver") {
        client.commands.get('characters').execute(message, args);
    };

    // Level up Characters
    if (cmd === "levelup" || cmd === "lvlup" || cmd === "lu") {
        client.commands.get('characters').execute(message, args);
    };

    // Reset level
    if (cmd === "reset") {
        client.commands.get('characters').execute(message, args);
    };

    // Base stats
    if (cmd === "ims" || cmd === "infomystats") {
        client.commands.get('characters').execute(message, args);
    };

    // EP Calculator
    if (cmd === "ep") {
        client.commands.get('characters').execute(message, args);
    };

    // Dungeon
    if (cmd === "dungeon" || cmd === "d") {
        client.commands.get('characters').execute(message, args);
    };

    // Dungeon Info
    if (cmd === "di" || cmd === "dungeoninfo" || cmd === "dungeon-info") {
        client.commands.get('characters').execute(message, args);
    };

    // Battle Char
    if (cmd === "bc" || cmd === "use" || cmd === "battlechar" || cmd === "battlecharacter") {
        client.commands.get('characters').execute(message, args);
    };

    // Shards
    if (cmd === "shards") {
        client.commands.get('characters').execute(message, args);
    };

    // Refine
    if (cmd === "refine" || cmd === "ref") {
        client.commands.get('characters').execute(message, args);
    };

    // Abilities
    if (cmd === "abilities") {
        client.commands.get('characters').execute(message, args);
    };

    // Camelot Update Notes
    if (cmd === "news" || cmd === "notes" || cmd === "update-notes") {
        client.commands.get('notes').execute(message, args);
    };

    // Recommendations
    if (cmd === "recommendations"|| cmd === "recommend" || cmd === "rec") {
        if (args[0]) return;
        client.commands.get('recommendations').execute(message, args);
    };

    /* How to use Attachements
    if (cmd === "attachement") {
        const attachement = new MessageAttachement("url")
    };
    */

    /* Kick
    if (cmd === "kick") {
        client.commands.get('kick').execute(message, args);
    };

    // Ban
    if (cmd === "ban") {
        client.commands.get('ban').execute(message, args);
    }
    */

    
    // Math
    // Random number between 1-100
    if (cmd === "random" || cmd === "rand") {
        client.commands.get('random').execute(message, args);
    };

    // flip
    if (cmd === "flip" || cmd === "toss") {
        client.commands.get('flip').execute(message, args);
    };
    
    // flip - ping
    if (cmd === "flipping" || cmd === "fp") {
        const embed1 = new MessageEmbed()
        .setTitle('calculating...')
        .setColor(0xbbffff)
        const msg = await message.channel.send(embed1);

        const embed2 = new MessageEmbed()
        .setTitle(`${Number.isInteger((msg.createdAt - message.createdAt) * 0.5)}`)
        .setColor(0xbbffff)
        msg.edit(embed2);
    };

    // RAM Usage
    if (cmd === "ram" || cmd === "memory") {
        const ramUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 10) / 10;
        const Embed = new MessageEmbed()
        .setTitle('Total Memory Usage')
        .setColor(0xbbffff)
        .setDescription(`Currently **${ramUsage}MB** is beeing used`)
        message.channel.send(Embed);
    };

    // Calculator
    if (cmd === "math" || cmd === "m") {
        if (!args[0]) return message.channel.send("Please input a calculation.");
        let resp;
        try {
        resp = math.evaluate(args.join(" "));
        } catch (e) {
        return message.channel.send("Please input a valid calculation.");
        }
        const embedCalculator = new MessageEmbed()
        .setTitle('Camelot Calculator')
        .setColor(0xbbffff)
        .addField("The result is", `\`\`\`js\n${resp}\`\`\``)
        message.channel.send(embedCalculator)
    };

    /* Process.argv
    if (cmd === "argv") {
        console.log(process.argv[2])
        // This code prints the 3rd argument written to the console to the console
        // if `node . Test 001` it prints "Test"
    };
    */

    // -- -- -- PLAYGROUND -- -- -- //
    // -- -- -- PLAYGROUND -- -- -- //
    // -- -- -- PLAYGROUND -- -- -- //


    // Random Name Generator (Hiragana)
    if (cmd === "name" || cmd === "random-name" || cmd === "rn") {
        const gildas = Math.floor(Math.random() * 2);
        const gildasA = Math.floor(Math.random() * 68);
        const gildasB = Math.floor(Math.random() * 68);
        const gildasC = Math.floor(Math.random() * 68);
        const gildasD = Math.floor(Math.random() * 68);

        const letters = ['a', 'i', 'u', 'e', 'o', 'ka', 'ki', 'ku', 'ke', 'ko', 'sa', 'shi', 'su', 'se', 'so', 'ta', 'chi', 'tsu', 'te', 'to', 'na', 'ni', 'nu', 'ne', 'no', 'n', 'ha', 'hi', 'fu', 'he', 'ho', 'ma', 'mi', 'mu', 'me', 'mo', 'ya', 'yu', 'yo', 'ra', 'ri', 'ru', 're', 'ro', 'wa', 'wo', 'pa', 'pi', 'pu', 'pe', 'po', 'ga', 'gi', 'gu', 'ge', 'go', 'ba', 'bi', 'bu', 'be', 'bo', 'za', 'ze', 'zi', 'zo', 'zu', 'do', 'ji'];
        
        if (gildas === 0) {
        message.channel.send(letters[gildasA] + letters[gildasB] + letters[gildasC]);
        } else {
        message.channel.send(letters[gildasA] + letters[gildasB] + letters[gildasC] + letters[gildasD]);
        };
    };

    // nth fibonacci
    if (cmd === "fibonacci" || cmd === "fib") {
        let n = args[0];

        if (isNaN(n)) {
        message.channel.send("Please provide a number");
        return;
        };

        if (n < 1475) {
        let phi = (Math.sqrt(5)+1)/2;
        let invphi = phi-1;
        let result = (Math.pow(phi, n) - Math.pow(-invphi, n)) / Math.sqrt(5);
        message.channel.send(Math.round(result));
        } else {
        message.channel.send("The number you asked is too big for me to handle.")
        };
    };

    // ggT & kgV
    if (cmd === "ggt" || cmd === "gcd" || cmd === "kgv" || cmd === "lcm") {
        if (!args[0] || !args[1]) return message.channel.send("You have to enter 2 numbers");
        if (isNaN(args[0]) || isNaN(args[1])) return message.channel.send("please use a number");
        if (args[0] <= 0 || args[1] <= 0 || args[0] % 1 != 0 || args[1] % 1 != 0) return message.channel.send("Use positive whole numbers only");
        let a, b, c;
        if (args[0] > args[1]) {
            a = parseInt(args[0]);
            b = parseInt(args[1]);
        } else {
            a = parseInt(args[1]);
            b = parseInt(args[0]);
        };
        while (b > 0) {
            c = a % b;
            a = b;
            b = c;
        };
        if (cmd === "ggt" || cmd === "gcd") message.channel.send(a);
        if (cmd === "kgv" || cmd === "lcm") message.channel.send(args[0] * args[1] / a);
    };

});


client.on('inviteCreate', (invite) => {
    var inviteLogs = JSON.parse(fs.readFileSync('Storage/inviteLogs.json', 'utf8'));
    inviteLogs[invite.code] = invite.uses;
    fs.writeFile('Storage/inviteLogs.json', JSON.stringify(inviteLogs), (err) => {
        if (err) console.error(err);
    });
});

client.on('inviteDelete', (invite) => {
    var inviteLogs = JSON.parse(fs.readFileSync('Storage/inviteLogs.json', 'utf8'));
    delete inviteLogs[invite.code];
    fs.writeFile('Storage/inviteLogs.json', JSON.stringify(inviteLogs), (err) => {
        if (err) console.error(err);
    });
});

client.on('guildMemberAdd', async (member) => {

    if (member.guild.id !== "537655461554421771") return;

    let joined = new Date(member.user.createdAt.toISOString().slice(0, -1)+"-02:00");
    let dateNow = new Date(new Date().toISOString().slice(0, -1)+"-02:00");
    let age = dateNow - joined;
    let ageStr = "";
    let a = 0;
    if (age / (365*24*60*60*1000) >= 1 && a < 3) ageStr += Math.floor(age / (365*24*60*60*1000)) + "y ", age -= (Math.floor(age / (365*24*60*60*1000)))*(365*24*60*60*1000), a++;
    if (age / (30*24*60*60*1000) >= 1 && a < 3) ageStr += Math.floor(age / (30*24*60*60*1000)) + "m ", age -= (Math.floor(age / (30*24*60*60*1000)))*(30*24*60*60*1000), a++;
    if (age / (24*60*60*1000) >= 1 && a < 3) ageStr += Math.floor(age / (24*60*60*1000)) + "d ", age -= (Math.floor(age / (24*60*60*1000)))*(24*60*60*1000), a++;
    if (age / (60*60*1000) >= 1 && a < 3) ageStr += Math.floor(age / (60*60*1000)) + "h ", age -= (Math.floor(age / (60*60*1000)))*(60*60*1000), a++;
    if (age / (60*1000) >= 1 && a < 3) ageStr += Math.floor(age / (60*1000)) + "m ", age -= (Math.floor(age / (60*1000)))*(60*1000), a++;
    if (age / (1000) >= 1 && a < 3) ageStr += Math.floor(age / (1000)) + "s ", age -= (Math.floor(age / (1000)))*(1000), a++;
    ageStr += "ago";

    var inviteLogs = JSON.parse(fs.readFileSync('Storage/inviteLogs.json', 'utf8'));
    const channel = client.channels.cache.find(channel => channel.id === "814943156943585300");
    member.guild.fetchInvites().then(guildInvites => {
        let invFound = 0;

        guildInvites.each(invite => {
            if (invite.uses != inviteLogs[invite.code]) {
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setAuthor(`${member.user.tag} joined`, member.user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                .setDescription(`**User**: <@${member.user.id}> (**ID**: ${member.user.id})\n**Invited by**: <@${invite.inviter.id}> (${invite.inviter.tag} | **${invite.uses}** invites)\n**Account created**: ${new Date(member.user.createdAt.toISOString().slice(0, -1)+"-02:00").toDateString().slice(4)} (${ageStr})`)
                channel.send(Embed);

                inviteLogs[invite.code] = invite.uses;
                invFound++;
                fs.writeFile('Storage/inviteLogs.json', JSON.stringify(inviteLogs), (err) => {
                    if (err) console.error(err);
                });
            };
        });

        if (invFound === 0) {
            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setAuthor(`${member.user.tag} joined`, member.user.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setDescription(`**User**: <@${member.user.id}> (**ID**: ${member.user.id})\n**Invited by**: Unknown\n**Account created**: ${new Date(member.user.createdAt.toISOString().slice(0, -1)+"-02:00").toDateString().slice(4)} (${ageStr})`)
            channel.send(Embed);
        };
    });
});