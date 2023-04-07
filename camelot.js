const fs = require('fs');
const config = require('./config.json');
const package = require('./package.json');
const { db, query } = require("./db_handler.js");
const { Client, Options, Collection, MessageEmbed } = require('discord.js');

// Create Client
const client = new Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"], // , "GUILD_MESSAGE_REACTIONS", "GUILD_VOICE_STATES"
    partials: ["CHANNEL"],
    makeCache: Options.cacheWithLimits({
        MessageManager: 0,
        // UserManager: 0,
	}),
    shards: "auto",
});
client.login(config.token);

// Add Commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./Commands/${file}`);
	client.commands.set(command.name, command);
};

// Patreon
const { Campaign } = require('patreon-discord');
const myCampaign = new Campaign({ 
    patreonToken: config.patreon.token,
    campaignId: config.patreon.campaignId,
});

// Global Variables
const blacklist = JSON.parse(fs.readFileSync('Storage/blacklist.json', 'utf8'));
const userCooldown = new Map();
const channelCooldown = new Set();

client.on('ready', () => {
    console.log("Connected as " + client.user.tag);
    client.user.setPresence({ activities: [{ name: 'Fate', type: 'WATCHING', status: 'online' }] });
    
    let interval = () => setInterval(function() {
        // Daily
        if (new Date().getHours() === 0 && new Date().getMinutes() === 0) {
            db.serialize(async () => {
                // Daily Reset
                await query(`UPDATE users SET dailyclaimed = 0, dailies = '{}'`);

                // Daily Stats
                const stats = await query(`SELECT lastpull FROM users`);
                const chnl = client.channels.cache.find(channel => channel.id === "1029507771567190017");
                return chnl.send(`Servers: **${client.guilds.cache.size}**\nPlayers: **${stats.length}**\nActive: **${stats.filter((e) => new Date().getTime() - e.lastpull < 7*24*60*60*1000 ).length}**\nDaily: **${stats.filter((e) => new Date().getTime() - e.lastpull < 24*60*60*1000 ).length}**`);
            });
        };

        // Weekly Reset (% 604'800'000ms)
        if (new Date().getTime() % (7*24*60*60000) < 60000) {
            db.serialize(async () => {
                await query(`UPDATE users SET weeklyclaimed = 0`);
            });
        };

        // 8h Dungeon Reset
        if (new Date().getHours() % 8 === 0 && new Date().getMinutes() === 0) {
            db.serialize(async () => {
                await query(`UPDATE dungeon SET 'limit' = 0`);
            });
        };

    }, 60000);
    
    setTimeout(interval, 60000 - (new Date().getTime() % 60000));

    // Check if premium gift expired (every 15 min)
    setInterval(() => {
        
        // fetch active patrons
        myCampaign.fetchPatrons(['active_patron', 'declined_patron', /*'former_patron'*/ ]).then(patrons => {
            
            // Filter valid discord ID's
            let patronIDs = {}, tiers = {"8235152":7, "8108779": 6, "8108777": 5, "8108764": 4, "8108641": 3, "8108640": 2, "8108639": 1};
            patrons.forEach((patron) => {
                if (patron.discord_user_id && patron.currently_entitled_tier_id) patronIDs[patron.discord_user_id] = tiers[patron.currently_entitled_tier_id];
                // console.log(`${patron.discord_user_id} (${patron.patron_status}, ${patron.currently_entitled_tier_id}) = ${patron.currently_entitled_amount_cents/100}$`);
            });
            
            let premiumGift = JSON.parse(fs.readFileSync('Storage/premiumGift.json', 'utf8'));

            db.serialize(async () => {
                let users = await query(`SELECT id, premium FROM users WHERE premium > 0`);
                Object.keys(patronIDs).forEach(patron => users.push({id: patron, premium: 0}));
                
                let lostPrem = [];
                for (let user of users) {
                    if (user.id in patronIDs) {
                        if (user.premium !== patronIDs[user.id]) await query(`UPDATE users SET premium = ${patronIDs[user.id]} WHERE id = ${user.id}`);
                    } else if (premiumGift?.[user.id]?.date > (new Date().getTime() - 30*24*60*60*1000)) {
                        ; // Do nothing
                    } else {
                        lostPrem.push(user.id);
                    };
                };

                // Remove expired premium 
                if (lostPrem.length) await query(`UPDATE users SET premium = 0 WHERE id IN (${lostPrem.join(", ")})`);
            });
            
        });
        
    }, 15*60*1000);

    setInterval(() => {
        // Reset Premium gifts on every 1st of the month
        if (new Date().getDate() === 1) {
            fs.writeFile('Storage/premiumGifted.json', JSON.stringify({}), (err) => {
                if (err) console.error(err);
            });
        };
    }, 24*60*60*1000);

    // POST bot stats to top.gg (only if Camelot)
    if (client.user.id === "706183309943767112") {
        const { AutoPoster } = require('topgg-autoposter');
        const ap = AutoPoster(config.topgg.token, client);
        ap.on('posted', (stats) => {
            console.log(`Posted stats to Top.gg | ${stats.serverCount} servers`)
        });
    };

});

client.on('interactionCreate', async interaction => {

    // Defer Buttons
    if (interaction.isButton() && interaction.customId !== "guess") {
        await interaction.deferUpdate().catch(() => {
            console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${interaction.customId}"`);
        });
    };

    // return setTimeout(async () => {
    //     try {
    //         await interaction.reply({content:"test failed messages", ephemeral:true});
    //     } catch (err) {
    //         console.log("err");
    //         interaction.channel.send("There has been an error sending the response")
    //     };
    // }, 5000);

    // Exit and stop if it's not there
    if (!interaction.isCommand()) return;
    if (!interaction.guild) return;
    if (interaction.user.bot) return;
    if (interaction.guild.me.isCommunicationDisabled()) return;
    if (interaction.user.id in blacklist) return interaction.reply(`Your account has been suspended${blacklist[interaction.user.id]}.\nIf you believe there to be a mistake, please join the support server below to appeal for this decision.\n**Support Server**: https://discord.gg/myy9PBCdEW`);
    if (!interaction.channel.permissionsFor(interaction.guild.me).has(["SEND_MESSAGES", "VIEW_CHANNEL", "USE_EXTERNAL_EMOJIS", "EMBED_LINKS"])) {
        if (interaction.channel.permissionsFor(interaction.guild.me).has(["SEND_MESSAGES"])) interaction.channel.send("Camelot needs the following permissions to work\n‧ Send Messages\n‧ View Channel\n‧ Use External Emojis\n‧ Embed Links");
        return;
    };

    // Spam Control (User)
    if (userCooldown.has(interaction.user.id)) {
        userCooldown.set(interaction.user.id, userCooldown.get(interaction.user.id)+1);
        if (userCooldown.get(interaction.user.id) === 4) return interaction.reply({content: `Woah, you're being too fast! Please wait a few seconds.`, ephemeral: true});
        else if (userCooldown.get(interaction.user.id) > 4) return;
    } else {
        userCooldown.set(interaction.user.id, 1);
        setTimeout(() => userCooldown.delete(interaction.user.id), 7500);
    };

    // Spam Control (Channel)
    if (channelCooldown.has(interaction.channel.id)) return;
    channelCooldown.add(interaction.channel.id);
    setTimeout(() => channelCooldown.delete(interaction.channel.id), 750);

    // ADMIN ACTIONS
    if (interaction.commandName === "admin") {
        return client.commands.get('admin').execute(interaction, client);
    };

    // Ping!
    if (interaction.commandName === "ping") {
        return interaction.reply({ content: "pong! 🏓 " + client.ws.ping + "ms" });
    };

    // Support Server
    if (interaction.commandName === "support") {
        const Embed = new MessageEmbed()
        .setTitle("Camelot Support")
        .setColor(0xbbffff)
        .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
        .setDescription("Join our support server to reach us!\nYou can ask for help and help us improve the bot <:RaphiSmile:868998036645380197>\n\nServer Link: https://discord.gg/myy9PBCdEW")
        .setFooter({text: `Camelot ${package.version} • Made by Apollo24 & PokeLink`, iconURL: "https://i.imgur.com/syj1LqO.jpeg" })
        return interaction.reply({ embeds: [Embed] });
    };

    // Premium
    if (interaction.commandName === "premium" || interaction.commandName === "patreon") {
        const Embed = new MessageEmbed()
        .setTitle("Camelot Premium")
        .setColor(0xbbffff)
        .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
        .setDescription("Camelot Premium offers a lot of features to improve your playing experience. If you enjoy playing with Camelot, we would really appreciate your support! <:fumino_heart:794983494534955038>\nYou can find out more about the features and benefits of premium on our patreon.\n\nPatreon: https://www.patreon.com/cmlt\nSee https://ko-fi.com/camelot24 for donations and lower fees")
        .setFooter({text: `Camelot ${package.version} • Made by Apollo24 & PokeLink`, iconURL: "https://i.imgur.com/syj1LqO.jpeg"} )
        return interaction.reply({ embeds: [Embed] });
    };

    // Submit
    if (interaction.commandName === "submit") {
        const msg = interaction.options.getString('msg');
        if (msg.length > 1500) return interaction.reply("Your submission is too long!");
        const chnl = client.channels.cache.find(channel => channel.id === "943950237779755089");
        const Embed = new MessageEmbed()
        .setColor(0xbbffff)
        .setFooter({text: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048"})
        .setTitle("New Submission")
        .setDescription(`**User**: ${interaction.user.tag} | ${interaction.user.id}\n**Server**: ${interaction.guild.name} | ${interaction.guild.id}\n\`\`\`\n${msg}\`\`\``);
        chnl.send({ embeds: [Embed] });
        return interaction.reply(`Thanks ${interaction.user.username}, we've received your submission!`)
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

        // TUTORIAL
        let tutorial = await query(`SELECT tutorial FROM users WHERE id = ${interaction.user.id}`);
        tutorial = JSON.parse(tutorial[0]?.tutorial);
        if (!([0,1,2,3,4,5,6,7].every((e) => tutorial.includes(e)))) return client.commands.get('tutorial').execute(interaction);

        // Execute command
        if (interaction.commandName === "arena" && interaction.options.getUser('user').id === "706183309943767112") return client.commands.get('trial').execute(interaction);
        if (interaction.commandName === "boss" && interaction.options.getSubcommand() === "hunt") return client.commands.get('bosshunt').execute(interaction);
        if (["camelot", "changeimg", "convert", "give", "guess", "list", "open", "sell"].includes(interaction.commandName)) client.commands.get(interaction.commandName).execute(interaction, client);
        else client.commands.get(interaction.commandName)?.execute(interaction);
    });

});

client.on("messageCreate", async message => {
    if (message.author.bot) return;
    if (message.guild) {
        if (message.mentions.users.first()?.id !== client.user.id) return;
        const emojis = ["<:LuminousPsssh:1071574041116295328>", "<:HayasakaSmile:928369469301088326>", "<:ClaraLove:1034899845539962890>", "<:DizzyWorried:1025876785470111766>", "<:KannaWave:1025884100445339660>", "<:CirWave:1025884103565914252>", "<:KazuhaWave:1025884094975967324>", "<:HowCute:1026605362960408576>", "<:KanaoSmile:1025876532587151486>", "<:KannaPat:1026921369650331648>", "<a:KannaFire:1045096950070001687>", "<:KaguyaThink:1045096923255816253>", "<:MashaWave:928370055354400799>", "<:RoxyConcern:1041990236307197972>", "<:RaphiSmile:928370490270183485>", "<:RemWink:928370529742757960>", "<:MikuHappy:1045096947876368404>", "<:LoliSip:928369879348805692>", "<:LoveHeart:928369932683595827>", "<:OhMy:928370383495770112>", "<:AzusaSmug:1025884097299615774>", "<:KotoWave:1025884105281372260>", "<:omoshiroi:1029435114637246575>", "<:wow:1020442064409874462>", "<:umu:1025876213853605919>", "<:yayyy:1031583211828035655>", "<:pewpew:928370427112357918>", "<:ara:1071573953509863465>", "<:cuteXD:1031583207562428488>", "<:ThumbsUp:1020442047712350298>", "<:TohruPoint:928370972132782090>", "<:Woah:928370799965003826>", "<:SmugSip:928368817078407229>", "<a:ShiroeGlassesPush:1027582770211463358>", "<:SataniaEvil:928369432307331162>"];
        if (message.type === 'DEFAULT') message.channel.send("Welcome, Adventurer " + emojis[Math.floor(Math.random() * emojis.length)] + "\nPlease use slash commands (i.e. `/pull`) to interact with the bot.\nIf it doesn't work it's probably because of some missing permissions, make sure that Camelot has all required permissions to function! Please reach out to us if you need help at any step: <https://discord.gg/myy9PBCdEW>");
    } else {
        const channel = client.channels.cache.find(channel => channel.id === "1077264632412110890");
        const Embed = new MessageEmbed()
        .setColor(0xbbffff)
        .setDescription(message.content)
        .setAuthor({name: message.author.tag, url: "https://"+message.author.id+".com", iconURL: message.author.displayAvatarURL({ dynamic: true }) + "?size=2048"})
        channel.send({ embeds: [Embed] });
    };
});

client.on("rateLimit", rateLimitData => {
    console.log(rateLimitData);
});

// Don't crash
// eslint-disable-next-line no-undef
process.on('uncaughtException', error => {
    console.log(error.stack);
});

// Top.gg Votes
const Topgg = require('@top-gg/sdk');
const express = require('express');
const app = express();
const webhook = new Topgg.Webhook(config.topgg.auth);
app.post('/dblwebhook', webhook.listener(vote => {
    db.serialize(async () => {
        await query(`UPDATE users SET pullresets = pullresets + 1, votestotal = votestotal + 1, lootbox = lootbox + 1, gems = gems + 1, lastvote = ${new Date().getTime()} WHERE id = ${vote.user}`);
        let stats = await query(`SELECT votereminder FROM users WHERE id = ${vote.user}`);
        if (stats[0]?.votereminder) {
            setTimeout(async () => {
                const dmUser = await client.users.fetch(vote.user);
                if (dmUser) dmUser.send("You're off cooldown!\nYou can vote again at https://top.gg/bot/706183309943767112/vote\nYou are receiving this message because you enabled vote reminders. Use `/reminder` if you want to turn it off again.");
            }, 12*60*60*1000);
        };
    });
}));
app.listen(3000);

// Using Donatebot API
const https = require("https");
const serverID = "927257132624130119";
const product = {
    "RQ-Xy86yos": [160, 60],           //   $3
    "n9D2AeoMzr": [300, 100],          //   $5
    "EQAnsf2I7q": [680, 160],          //  $10
    "ExAXfcW-7J": [1000, 240],         //  $15
    "bwSNjx7yWm": [1760, 360, 238],    //  $25 // + Rimuru Tempest
    "O7bkg49rJD": [3680, 720],         //  $50
    "7BsfSbcV_1": [7420, 1440, 10517], // $100 // + Luminous
};

function httpGet(url, headers) {
    return new Promise((resolve, reject) => {
        const options = {headers};
      
        https.get(url, options, (res) => {
            let data = "";
            
            res.on("data", (chunk) => {
                data += chunk;
            });
      
            res.on("end", () => {
                resolve(JSON.parse(data));
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
};

function httpPost(url, headers, body) {
    return new Promise((resolve, reject) => {
        const options = {
            method: "POST",
            headers,
        };
      
        const req = https.request(url, options, (res) => {
            if (res.statusCode === 200) {
                resolve();
            } else {
                reject(new Error("Error marking donation as processed."));
            };
        });
      
        req.on("error", (err) => {
            reject(err);
        });
      
        req.write(body);
        req.end();
    });
};

async function getNewDonations() {
    const url = `https://donatebot.io/api/v1/donations/${serverID}/new`;
    const headers = {
        Authorization: config.donatebot.key,
    };
    const data = await httpGet(url, headers);
    return data;
};

async function markDonationAsProcessed(txnID, processed=true) {
    const url = `https://donatebot.io/api/v1/donations/${serverID}/${txnID}/mark`;
    const headers = {
        Authorization: config.donatebot.key,
        "Content-Type": "application/json",
    };
    const body = JSON.stringify({ markProcessed: processed });
    await httpPost(url, headers, body);
};

setInterval(() => {
    getNewDonations().then((donations) => {
        donations = donations.donations;
        if (donations.length) {
            db.serialize(async () => {
                for (const donation of donations) {
                    let stats = await query(`SELECT users.gems, users.transactions, characters.chars FROM users JOIN characters ON users.id = characters.id WHERE users.id = ${donation.buyer_id}`);
                    if (stats[0]) {
                        stats = {gems: stats[0].gems, transactions: JSON.parse(stats[0].transactions), chars: JSON.parse(stats[0].chars)};
                        const gems = (product[donation.product_id]?.[0] + (stats.transactions.some((e) => e.product_id === donation.product_id) ? 0 : product[donation.product_id]?.[1])) || 0;
                        await query(`UPDATE users SET gems = gems + ${gems}, transactions = '${JSON.stringify([...stats.transactions, donation])}' WHERE id = ${donation.buyer_id}`);
                        if (product[donation.product_id][2]) await query(`UPDATE characters SET chars = '${JSON.stringify([...stats.chars, product[donation.product_id][2]])}' WHERE id = ${donation.buyer_id}`);
        
                        // Send DM
                        const dmUser = await client.users.fetch(donation.buyer_id);
                        if (dmUser) {
                            const Embed = new MessageEmbed()
                            .setColor(0xbbffff)
                            .setTitle("Thank you for your support!")
                            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                            .setDescription(`We have received and processed your order! <:ClaraThumbsUp:1034899843505721514>\nPlease [contact](https://discord.gg/myy9PBCdEW) us if you encounter any issues. You can see the transaction details below.\n\n\`\`\`yaml\nOrder: ${product[donation.product_id]?.[0]} genesis gems\nPrice: ${donation.price} ${donation.currency}\nProduct ID: ${donation.product_id}\nTransaction ID: ${donation.txn_id}\nStatus: ${donation.status}\nBuyer ID: ${donation.buyer_id}\nDate: ${new Date(donation.timestamp*1000).toISOString()}\`\`\``)
                            dmUser.send({ embeds: [Embed] });
                        };
        
                        // Mark transaction as processed
                        const chnl = client.channels.cache.find(channel => channel.id === "1030963832136417320");

                        // Replace api.markDonation with markDonationAsProcessed
                        markDonationAsProcessed(donation.txn_id).then(() => {
                            if (chnl) chnl.send(`Successfully processed transaction ${donation.txn_id}\nBuyer: <@${donation.buyer_id}> | ${donation.buyer_id}\nBalance: **${stats.gems + gems}**<:genesis_gems:1034179687720681492>\nPrice: **${donation.price} ${donation.currency}**`);
                        }).catch((err) => {
                            console.log(err);
                            if (chnl) chnl.send(`Failed to mark transaction ${donation.txn_id} as processed.\nBuyer: <@${donation.buyer_id}> | ${donation.buyer_id}\nBalance: **${stats.gems}**<:genesis_gems:1034179687720681492>\nPrice: **${donation.price} ${donation.currency}**`);
                        });
                    } else {
                        const chnl = client.channels.cache.find(channel => channel.id === "1030963832136417320");
                        if (chnl) chnl.send(`User <@${donation.buyer_id}> (${donation.buyer_id}) has no profile.\nEmail: **${donation.buyer_email}**\nOrder: **${donation.product_id}**\nPrice: **${donation.price} ${donation.currency}**`);        
                    };
                };
            });
        };
    }).catch((err) => {
        console.log(err);
    });
}, 5*60*1000);



// -- -- -- PLAYGROUND -- -- -- //
// -- -- -- PLAYGROUND -- -- -- //
// -- -- -- PLAYGROUND -- -- -- //

// // Send messages to python script and back
// if (cmd === "ajax") {
//     const {spawn} = require('child_process');
//     const pythonProcess = spawn('python',["scriptl.py", "JS_input"]);
//     console.log("A");
//     pythonProcess.stdout.on('data', (data) => {
//         let readableData = data.toString('utf8');
//         message.channel.send(readableData);
//     });
//     console.log("C");
// };