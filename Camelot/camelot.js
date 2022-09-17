var fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"] })
client.commands = new Discord.Collection();
client.login(config.token);
const { AutoPoster } = require('topgg-autoposter');
const { db, query } = require("./db_handler.js");

var cVersion = "V2.5.2";

const userCooldown = new Map();
const channelCooldown = new Set();

var premiumGift = JSON.parse(fs.readFileSync('Storage/premiumGift.json', 'utf8'));
var premiumGifted = JSON.parse(fs.readFileSync('Storage/premiumGifted.json', 'utf8'));

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
};

// POST Bot stats to top.gg
const ap = AutoPoster('Place_Your_Token_Here', client);
ap.on('posted', () => {
  console.log('Posted stats to Top.gg!')
});

// Log unexpected errors
process.on('uncaughtException', error => {
    console.log(error.stack);
});

// Extract the required classes from the discord.js module
const { MessageEmbed } = require('discord.js');

client.on('ready', () => {
    console.log("Connected as " + client.user.tag);
    client.user.setPresence({ activities: [{ name: 'Fate', type: 'WATCHING', status: 'online' }] });

    let interval = () => setInterval(function() {
        // Pull Reset
        if (new Date().getHours() % 2 === 0 && new Date().getMinutes() === 0) {
            db.serialize(async () => {
                var stats = await query(`SELECT rowid, premium, pullstacksinterval FROM users`);
                stats.forEach( async (stat) => {
                    if (stat.premium > 1) {
                        let pullLimit = [0, 0, 9, 10, 10, 10, 12, 14], intervalLimit = [0, 0, 1, 3, 4, 5, 6, 12];
                        await query(`UPDATE users SET ${stat.pullstacksinterval < intervalLimit[stat.premium] ? `pullstacks = ${pullLimit[stat.premium]} - pullcount, pullstacksinterval = pullstacksinterval + 1, ` : ""}pullcount = 0 WHERE rowid = ${stat.rowid}`);
                    } else {
                        await query(`UPDATE users SET pullcount = 0 WHERE rowid = ${stat.rowid}`);
                    };
                });
            });
        };

        // Daily Reset
        if (new Date().getHours() === 0 && new Date().getMinutes() === 0) {
            db.serialize(async () => {
                await query(`UPDATE users SET dailyclaimed = 0`);
            });
        };

        // Weekly Reset (% 604'800'000ms)
        if (new Date().getTime() % (7*24*60*60000) < 60000) {
            db.serialize(async () => {
                await query(`UPDATE users SET weeklyclaimed = 0`);
            });
        };

        // Dungeon Reset
        if (new Date().getHours() % 8 === 0 && new Date().getMinutes() === 0) {
            db.serialize(async () => {
                await query(`UPDATE dungeon SET 'limit' = 0`);
            });
        };

    }, 60000);
    
    setTimeout(interval, 60000 - (new Date().getTime() % 60000));

    setInterval(() => {
        // Check if premium gift expired (every 1h)
        db.serialize(async () => {
            let keys = Object.keys(premiumGift);
            for (i=0; i < keys.length; i++) {
                if (premiumGift[keys[i]].method === "vote") {
                    if (new Date().getTime() - premiumGift[keys[i]].date > 7*24*60*60*1000) {
                        await query(`UPDATE users SET premium = 0 WHERE id = ${keys[i]}`);
                        delete premiumGift[keys[i]];
                    };
                } else {
                    if (new Date().getTime() - premiumGift[keys[i]].date > 30*24*60*60*1000) {
                        await query(`UPDATE users SET premium = 0 WHERE id = ${keys[i]}`);
                        delete premiumGift[keys[i]];
                    };
                };
            };
            fs.writeFile('Storage/premiumGift.json', JSON.stringify(premiumGift), (err) => {
                if (err) console.error(err);
            });
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

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    // Exit and stop if it's not there
    if (!interaction.guild) return;
    if (interaction.user.bot) return;

    // Spam Control (User)
    if (userCooldown.has(interaction.user.id)) {
        userCooldown.set(interaction.user.id, userCooldown.get(interaction.user.id)+1);
        if (userCooldown.get(interaction.user.id) === 4) return interaction.reply(`You're being too fast, please wait a few seconds.`);
        else if (userCooldown.get(interaction.user.id) > 4) return;
    } else {
        userCooldown.set(interaction.user.id, 1);
        setTimeout(() => userCooldown.delete(interaction.user.id), 7500);
    };
    // Spam Control (Channel)
    if (channelCooldown.has(interaction.channel.id)) return;
    channelCooldown.add(interaction.channel.id);
    setTimeout(() => channelCooldown.delete(interaction.channel.id), 750);

    // Exit and stop if it's not there
    if (interaction.guild.me.isCommunicationDisabled()) return;
    if (!interaction.channel.permissionsFor(interaction.guild.me).has(["SEND_MESSAGES", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "USE_EXTERNAL_EMOJIS", "EMBED_LINKS", "ADD_REACTIONS", "ATTACH_FILES"])) {
        if (interaction.channel.permissionsFor(interaction.guild.me).has(["SEND_MESSAGES"])) {
            try {
                return interaction.channel.send("Camelot needs the following permissions to work\n‧ Send Messages\n‧ Read Message History\n‧ Use External Emojis\n‧ Embed Links\n‧ Add Reactions\n‧ Attach Files")
            } catch (error) {
                console.log("[ERROR] Missing Permissions: ", error);
            };
        } else {
            return;
        };
    };

    // ADMIN ACTIONS
    if (interaction.commandName === "admin") {
        return client.commands.get('admin').execute(interaction, client);
    };

    // Ping!
    if (interaction.commandName === "ping") {
        const Embed = new MessageEmbed().setTitle("pong! 🏓").setColor(0xbbffff)
        let st = new Date().getTime();
        await interaction.reply({ embeds: [Embed] });
        return interaction.editReply({ embeds: [Embed.setTitle(`pong! 🏓 ${Math.floor(new Date().getTime() - st)}ms`)] });
    };

    // User Avatar
    if (interaction.commandName === "avatar") {
        let user = interaction.options.getUser('user') || interaction.user;
        const Embed = new MessageEmbed()
        .setImage(user.displayAvatarURL({ dynamic: true }) + "?size=2048")
        .setColor(0xbbffff)
        interaction.reply({ embeds: [Embed] });
    };

    // Support Server
    if (interaction.commandName === "support") {
        const Embed = new MessageEmbed()
        .setTitle("Camelot Support")
        .setColor(0xbbffff)
        .setThumbnail("https://i.imgur.com/WWM4K98.png")
        .setDescription("Join our support server to reach us!\nYou can ask for help and help us improve the bot <:RaphiSmile:868998036645380197>\n\nServer Link: https://discord.gg/myy9PBCdEW")
        .setFooter({text: `Camelot ${cVersion} • Made by Apollo24 & PokeLink`, iconURL: "https://i.imgur.com/syj1LqO.jpeg" })
        return interaction.reply({ embeds: [Embed] });
    };

    // Premium
    if (interaction.commandName === "premium" || interaction.commandName === "patreon") {
        const Embed = new MessageEmbed()
        .setTitle("Camelot Premium")
        .setColor(0xbbffff)
        .setThumbnail("https://i.imgur.com/WWM4K98.png")
        .setDescription("Camelot Premium offers a lot of features to make your playing experience much better. If you enjoy playing with Camelot, we would really appreciate your support! <:fumino_heart:794983494534955038>\nYou can find out more about the features and benefits of premium on our patreon.\n\nPatreon Link: https://www.patreon.com/cmlt")
        .setFooter({text: `Camelot ${cVersion} • Made by Apollo24 & PokeLink`, iconURL: "https://i.imgur.com/syj1LqO.jpeg"} )
        return interaction.reply({ embeds: [Embed] });
    };

    // Submit
    if (interaction.commandName === "submit") {
        let msg = interaction.options.getString('msg');
        if (msg.length > 1800) return interaction.reply("Your submission is too long!");

        let chnl = client.channels.cache.find(channel => channel.id === "943950237779755089");
        const Embed = new MessageEmbed()
        .setColor(0xbbffff)
        .setFooter({text: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048"})
        .setTitle("New Submission")
        .setDescription(`**User**: ${interaction.user.tag} | ${interaction.user.id}\n**Server**: ${interaction.guild.name} | ${interaction.guild.id}\n\`\`\`\n${msg}\`\`\``);
        chnl.send({ embeds: [Embed] });

        return interaction.reply(`Thanks ${interaction.user.username}, we've received your submission!`)
    };

    // Random 
    if (interaction.commandName === "random") {
        if (interaction.options.getSubcommand() === "number") {
            const ranum = Math.ceil(Math.random() * 100);
            switch (ranum) {
                case 24 : interaction.reply('24 🎉'); break;
                case 42 : interaction.reply('42, the Answer to the Ultimate Question of Life, the Universe, and Everything'); break;
                case 91 : interaction.reply('91 🏆'); break;
                default : interaction.reply(""+ranum); break;
            };
        }
        else if (interaction.options.getSubcommand() === "name") {
            const letters = ['a', 'i', 'u', 'e', 'o', 'ka', 'ki', 'ku', 'ke', 'ko', 'sa', 'shi', 'su', 'se', 'so', 'ta', 'chi', 'tsu', 'te', 'to', 'na', 'ni', 'nu', 'ne', 'no', 'n', 'ha', 'hi', 'fu', 'he', 'ho', 'ma', 'mi', 'mu', 'me', 'mo', 'ya', 'yu', 'yo', 'ra', 'ri', 'ru', 're', 'ro', 'wa', 'wo', 'pa', 'pi', 'pu', 'pe', 'po', 'ga', 'gi', 'gu', 'ge', 'go', 'ba', 'bi', 'bu', 'be', 'bo', 'za', 'ze', 'zi', 'zo', 'zu', 'do', 'ji'];
            interaction.reply(letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)] + (Math.random() < 0.5 ? letters[Math.floor(Math.random() * letters.length)] : ""));
        }
        else if (interaction.options.getSubcommand() === "coin") {
            interaction.reply(Math.random() < 0.5 ? "Heads" : "Tails");
        };
        return;
    };


    db.serialize(async () => {
        // ADD NEW PLAYERS
        const entryExists = await query(`SELECT name FROM users WHERE id = ${interaction.user.id}`); // Check if user exists in the db
        if (entryExists.length) { // Update username if changed
            if (entryExists[0].name !== interaction.user.tag) await query(`UPDATE users SET name = "${interaction.user.tag.split('"').join('""')}" WHERE id = ${interaction.user.id}`, 'run');
        } else { // Add new player if not exists
            await query(`INSERT INTO users (id, name) VALUES (${interaction.user.id}, "${interaction.user.tag.split('"').join('""')}")`, 'run');
            await query(`INSERT INTO characters (id) VALUES (${interaction.user.id})`, 'run');
            await query(`INSERT INTO dungeon (id) VALUES (${interaction.user.id})`, 'run');
        };
        // ADD NEW SERVERS
        const serverExists = await query(`SELECT user_ids FROM servers WHERE id = ${interaction.guild.id}`); // Check if server exists in the db
        const userExists = await query(`SELECT rowid FROM users WHERE id = ${interaction.user.id}`); // Get user id
        if (serverExists.length) { // Add players to guild
            if (!serverExists[0].user_ids.split(",").includes(""+userExists[0].rowid)) await query(`UPDATE servers SET user_ids = "${serverExists[0].user_ids+","+userExists[0].rowid}" WHERE id = ${interaction.guild.id}`, 'run');
        } else { // Add new server if not exists
            await query(`INSERT INTO servers (id, name, user_ids) VALUES (${interaction.guild.id}, "${interaction.guild.name.split('"').join('""')}", "${userExists[0].rowid}")`, 'run');
        };
        
        // COMMANDS START HERE
        // COMMANDS START HERE
        // COMMANDS START HERE

        // Arena @camelot
        if (interaction.commandName === "arena" && interaction.options.getUser('user').id === "706183309943767112") return client.commands.get('trial').execute(interaction);
        
        switch (interaction.commandName) {
            case "ability": client.commands.get('ability').execute(interaction); break;
            case "achievements": client.commands.get('achievements').execute(interaction); break;
            case "anime": client.commands.get('anime').execute(interaction); break;
            case "arena": client.commands.get('arena').execute(interaction); break;
            case "balance": client.commands.get('balance').execute(interaction); break;
            case "buy": client.commands.get('buy').execute(interaction, cVersion); break;
            case "camelot": client.commands.get('camelot-info').execute(interaction, client, cVersion); break;
            case "changeimg": client.commands.get('changeimg').execute(interaction, client); break;
            case "class": client.commands.get('class').execute(interaction); break;
            case "convert": client.commands.get('convert').execute(interaction, client); break;
            case "cooldown": 
            case "cd": client.commands.get('cooldown').execute(interaction); break;
            case "curse": client.commands.get('curse').execute(interaction, cVersion); break;
            case "daily": client.commands.get('daily').execute(interaction); break;
            case "delay": client.commands.get('delay').execute(interaction); break;
            case "dungeon": client.commands.get('dungeon').execute(interaction); break;
            case "fav": client.commands.get('fav').execute(interaction); break;
            case "find": client.commands.get('find').execute(interaction); break;
            case "give": client.commands.get('give').execute(interaction); break;
            case "guess": client.commands.get('guess').execute(interaction, client); break;
            case "help": client.commands.get('helps').execute(interaction, cVersion); break;
            case "info": client.commands.get('info').execute(interaction); break;
            case "inventory": client.commands.get('inventory').execute(interaction); break;
            case "level": client.commands.get('level').execute(interaction); break;
            case "levelup": client.commands.get('levelup').execute(interaction); break;
            case "list": client.commands.get('list').execute(interaction, client); break;
            case "lootbox": client.commands.get('lootbox').execute(interaction); break;
            case "math": client.commands.get('math').execute(interaction); break;
            case "open": client.commands.get('open').execute(interaction, client); break;
            case "pity": client.commands.get('pity').execute(interaction); break;
            case "profile":
            case "pr": client.commands.get('profile').execute(interaction); break;
            case "pull":
            case "p": client.commands.get('pull').execute(interaction); break;
            case "ps": client.commands.get('pullstacks').execute(interaction); break;
            case "rank": client.commands.get('rank').execute(interaction, cVersion); break;
            case "recommend": client.commands.get('recommend').execute(interaction); break;
            case "refine": client.commands.get('refine').execute(interaction); break;
            case "reset": client.commands.get('reset').execute(interaction); break;
            case "rp": client.commands.get('rp').execute(interaction); break;
            case "search": client.commands.get('search').execute(interaction); break;
            case "select": client.commands.get('select').execute(interaction); break;
            case "sell": client.commands.get('sell').execute(interaction, client); break;
            case "shards": client.commands.get('shards').execute(interaction); break;
            case "shop": client.commands.get('shop').execute(interaction); break;
            case "stats": client.commands.get('stats').execute(interaction); break;
            case "tickets": client.commands.get('tickets').execute(interaction, cVersion); break;
            case "trade": client.commands.get('trade').execute(interaction); break;
            case "trial": client.commands.get('trial').execute(interaction); break;
            case "top": client.commands.get('top').execute(interaction, cVersion); break;
            case "vote": client.commands.get('vote').execute(interaction); break;
            case "weekly": client.commands.get('weekly').execute(interaction); break;
            default: false; break;
        };

    });

});


client.on("channelUpdate", async (oldChannel, newChannel) => {
    if (newChannel.id === "1020291479941431316") {
        db.serialize(async () => {
            await query(`UPDATE users SET pullresets = pullresets + 1, votestotal = votestotal + 1, lootbox = lootbox + 1, lastvote = ${new Date().getTime()} WHERE id = ${newChannel.name}`);
        });

        const voteChannel = client.channels.cache.find(channel => channel.id === "935132799881580576");
        voteChannel.send(`Thank you for the upvote <@${newChannel.name}>!`);
    };
});


client.on("guildMemberUpdate", (oldMember, newMember) => {
    if (newMember.guild.id !== "927257132624130119") return;
    if (oldMember.roles.cache.size === 1 && newMember.roles.cache.size === 1) return;

    let pRoles = ["927269716827987998", "927269781869060147", "927274790769811497", "927274836244447312", "927274875490562058", "927274897208672326", "933381336071278662"];
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

    db.serialize(async () => {
        if (roleAdded) await query(`UPDATE users SET premium = ${pRoles.indexOf(cRole.id)+1} WHERE id = ${newMember.user.id}`);
        else await query(`UPDATE users SET premium = 0 WHERE id = ${newMember.user.id}`);
    });

});


client.on("guildMemberRemove", member => {
    if (member.guild.id !== "927257132624130119") return;
    db.serialize(async () => {
        var inv = await query(`SELECT premium FROM users WHERE id = ${member.id}`);
        if (inv[0]?.premium) await query(`UPDATE users SET premium = 0 WHERE id = ${newMember.user.id}`);
    });
});