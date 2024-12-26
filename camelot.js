import fs from 'fs';
import config from './config';
import Package from './package';
import { db, query } from "./db_handler";
import { Client, GatewayIntentBits, Partials, Options, Collection, PermissionsBitField, EmbedBuilder } from 'discord.js';
import { dailies } from "./Modules/dailyQuests";

// Create Client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel],
    makeCache: Options.cacheWithLimits({
        MessageManager: 0,
        DMMessageManager: 0,
        GuildMessageManager: 0,
        UserManager: 0,
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
const userCooldown = new Map();
const channelCooldown = new Set();

client.on('ready', () => {
    console.log("Connected as " + client.user.tag);
    if (client.user.id === "706183309943767112") client.user.setPresence({ activities: [{ name: 'Fate', type: 'WATCHING', status: 'online' }] });
    else client.user.setPresence({ activities: [{ name: 'You', type: 'WATCHING', status: 'online' }] });

    let interval = () => setInterval(async function () {
        const now = new Date();

        // Daily
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            db.serialize(async () => {
                // Daily Reset
                await query(`UPDATE users SET dailyclaimed = 0, dailies = '{}', feedlimit = 0, cow_rolled_today = 0`);

                // Reset Low Responses
                await query(`UPDATE dungeon SET responsetime = "" WHERE LENGTH(responsetime)/14 < 200`);

                // Start new Stampede
                if (now.getDate() === 14 && (now.getMonth() % 2) === 1) {
                    db.serialize(async () => {
                        await query(`INSERT INTO stampedes (type, bosshp, bosshpmax, generalhp, generalhpmax, generalstotal, generalsleft, monsterstotal, monstersleft) values (0, 183728460, 183728460, 1582760, 1582760, 486, 486, 0, 0)`);
                    });
                };

                // Daily Stats
                const stats = await query(`SELECT lastpull FROM users`);
                const chnl = client.channels.cache.find(channel => channel.id === "1029507771567190017");
                chnl.send(`Servers: **${client.guilds.cache.size}**\nPlayers: **${stats.length}**\nActive: **${stats.filter((e) => now.getTime() - e.lastpull < 7 * 24 * 60 * 60 * 1000).length}**\nDaily: **${stats.filter((e) => now.getTime() - e.lastpull < 24 * 60 * 60 * 1000).length}**`);
            });
        };

        // Weekly Reset (% 604'800'000ms)
        if (now.getTime() % (7 * 24 * 60 * 60000) < 60000) {
            db.serialize(async () => {
                await query(`UPDATE users SET weeklyclaimed = 0`);
            });
        };

        // 8h Dungeon Reset
        if (now.getHours() % 8 === 0 && now.getMinutes() === 0) {
            db.serialize(async () => {
                // await query(`UPDATE dungeon SET 'limit' = 0`);
                await query(`
                    UPDATE dungeon
                    SET 'limit' = CASE
                        WHEN users.premium = 7 THEN 
                            CASE 
                                WHEN (dungeon.'limit' > 20) THEN 0
                                WHEN (dungeon.'limit' < -20) THEN -40
                                ELSE (dungeon.'limit' - 20)
                            END
                        ELSE 0
                    END
                    FROM users
                    WHERE dungeon.id = users.id
                `);
            });
        };

        // 2h Bosshunt reset
        if (now.getHours() % 2 === 0 && now.getMinutes() === 0) {
            db.serialize(async () => {
                await query(`UPDATE users SET bosshuntruns = bosshuntruns - 1 WHERE bosshuntruns > 0`);
            });
        };

        // Monthly
        if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
            // Reset Premium Gifts
            fs.writeFile('Storage/premiumGifted.json', JSON.stringify({}), (err) => {
                if (err) console.error(err);
            });

            db.serialize(async () => {
                // Reset monthly shop
                await query(`UPDATE users SET monthlyshop = "{}"`);
            });
        };

        // Every 5 Minutes
        if ((now.getMinutes() % 5) === 0) {
            db.serialize(async () => {
                // Stampede Energy
                await query(`UPDATE users SET stampedeenergy = stampedeenergy - 1 WHERE stampedeenergy > 0`);
            });
        };

    }, 60000);

    setTimeout(interval, 60000 - (Date.now() % 60000));

    // Check if premium gift expired (every 15 min)
    setInterval(() => {

        // fetch active patrons
        myCampaign.fetchPatrons(['active_patron', 'declined_patron', /*'former_patron'*/]).then(patrons => {

            // Filter valid discord ID's
            let patronIDs = {}, tiers = { "8235152": 7, "8108779": 6, "8108777": 5, "8108764": 4, "8108641": 3, "8108640": 2, "8108639": 1 };
            patrons.forEach((patron) => {
                if (patron.discord_user_id && patron.currently_entitled_tier_id && tiers[patron.currently_entitled_tier_id]) patronIDs[patron.discord_user_id] = tiers[patron.currently_entitled_tier_id];
                // console.log(`${patron.discord_user_id} (${patron.patron_status}, ${patron.currently_entitled_tier_id}) = ${patron.currently_entitled_amount_cents/100}$`);
            });

            let premiumGift = JSON.parse(fs.readFileSync('Storage/premiumGift.json', 'utf8'));

            db.serialize(async () => {
                let users = await query(`SELECT id, premium FROM users WHERE premium > 0`);
                Object.keys(patronIDs).forEach(patron => users.push({ id: patron, premium: 0 }));

                let lostPrem = [];
                for (let user of users) {
                    if (user.id in patronIDs) {
                        if (user.premium !== patronIDs[user.id]) await query(`UPDATE users SET premium = ${patronIDs[user.id]} WHERE id = ${user.id}`);
                    } else if (premiumGift?.[user.id]?.date > (new Date().getTime() - 31 * 24 * 60 * 60 * 1000)) {
                        ; // Do nothing
                    } else {
                        lostPrem.push(user.id);
                    };
                };

                // Remove expired premium 
                if (lostPrem.length) await query(`UPDATE users SET premium = 0 WHERE id IN (${lostPrem.join(", ")})`);
            });

        });

    }, 15 * 60 * 1000);

    // POST bot stats to top.gg (only if Camelot)
    if (client.user.id === "706183309943767112") {
        const { AutoPoster } = require('topgg-autoposter');
        const ap = AutoPoster(config.topgg.token, client);
        ap.on('posted', (stats) => {
            console.log(`Posted stats to Top.gg | ${stats.serverCount} servers`);
        });
    };

});

client.on('interactionCreate', async interaction => {

    // if (interaction.user.id === "489490486734880774") {
    //     interaction.user.id = "489490486734880782";
    // };

    // Defer Buttons
    if (interaction.isButton()) {
        if (interaction.customId?.startsWith("ignore_defer")) return;
        await interaction.deferUpdate().catch(() => {
            console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${interaction.customId}"`);
        });

        if (interaction.customId?.startsWith("ref-")) {
            const [, commandName] = interaction.customId.split("-");
            client.commands.get(commandName)?.executeButtonInteraction(interaction);
        };
    };

    // Auto Complete
    if (interaction.isAutocomplete()) {
        // const focusedValue = interaction.options.getFocused();
        const choices = await client.commands.get(interaction.commandName)?.autocomplete({ interaction });
        return interaction.respond(choices.slice(0, 25));
        // return interaction.respond(choices.filter((e) => e.name.toLowerCase().includes(focusedValue.toLowerCase())).slice(0, 25));
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
    if (interaction.user.bot) return;
    if (!interaction.guild) return interaction.reply({ content: `Please use the bot on a server.`, ephemeral: true });
    if (interaction.guild.members.me.isCommunicationDisabled()) return;
    if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.UseExternalEmojis, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.AttachFiles])) {
        if (interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.SendMessages])) interaction.channel.send("Camelot needs the following permissions to work\n- Send Messages\n- View Channel\n- Use External Emojis\n- Embed Links\n- Attach Files");
        return;
    };

    // Blacklist
    const blacklist = JSON.parse(fs.readFileSync('Storage/blacklist.json', 'utf8'));
    if (interaction.user.id in blacklist) return interaction.reply(`Your account has been suspended${blacklist[interaction.user.id]}.\nIf you believe there to be a mistake, please join the support server below to appeal for this decision.\n**Support Server**: https://discord.gg/myy9PBCdEW`);

    // Spam Control (User)
    if (userCooldown.has(interaction.user.id)) {
        const cd = userCooldown.get(interaction.user.id);
        if (interaction.commandName !== "pull") cd.count++;

        if (cd.count >= 4) {
            clearTimeout(cd.timeout);
            cd.timeout = setTimeout(() => userCooldown.delete(interaction.user.id), 3200);
            if (cd.count === 4 || cd.count === 10) return interaction.reply({ content: `Woah, you're being too fast! Please wait a few seconds.`, ephemeral: true });
            if (cd.count > 10) return;
        };

        // if (cd.count >= 4) {
        //     if (cd.count === 4) interaction.reply({ content: `Woah, you're being too fast! Please wait a few seconds.`, ephemeral: true });
        //     clearTimeout(cd.timeout);
        //     cd.timeout = setTimeout(() => userCooldown.delete(interaction.user.id), 3000);
        //     return;
        // };
    } else {
        userCooldown.set(interaction.user.id, {
            count: 1,
            timeout: setTimeout(() => userCooldown.delete(interaction.user.id), 7500)
        });
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
        return interaction.reply({ content: "pong! 🏓" + Math.floor(client.ws.ping) + "ms" });
    };

    // Support Server
    if (interaction.commandName === "support") {
        const Embed = new EmbedBuilder()
            .setTitle("Camelot Support")
            .setColor(0xbbffff)
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setDescription("Join our support server to reach us!\nYou can ask for help and help us improve the bot <:RaphiSmile:868998036645380197>\n\nServer Link: https://discord.gg/myy9PBCdEW")
            .setFooter({ text: `Camelot ${Package.version} • Made by Apollo24 & PokeLinker`, iconURL: "https://i.imgur.com/RbLjdQ4.png" });
        return interaction.reply({ embeds: [Embed] });
    };

    // Premium
    if (interaction.commandName === "premium" || interaction.commandName === "patreon") {
        return client.commands.get("premium")?.execute(interaction);
    };

    // Submit
    if (interaction.commandName === "submit") {
        const msg = interaction.options.getString('msg');
        if (msg.length > 1500) return interaction.reply("Your submission is too long!");
        const chnl = client.channels.cache.find(channel => channel.id === "943950237779755089");
        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setFooter({ text: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" })
            .setTitle("New Submission")
            .setDescription(`**User**: ${interaction.user.tag} | ${interaction.user.id}\n**Server**: ${interaction.guild.name} | ${interaction.guild.id}\n\`\`\`\n${msg}\`\`\``);
        chnl.send({ embeds: [Embed] });
        return interaction.reply(`Thanks ${interaction.user.username}, we've received your submission!`);
    };

    db.serialize(async () => {
        // ADD NEW PLAYERS
        const entryExists = await query(`SELECT name FROM users WHERE id = ${interaction.user.id}`); // Check if user exists in the db
        if (entryExists.length) { // Update username if changed
            if (entryExists[0].name !== interaction.user.username) await query(`UPDATE users SET name = "${interaction.user.username}" WHERE id = ${interaction.user.id}`, 'run');
        } else { // Add new player if not exists
            await query(`INSERT INTO users (id, name, created) VALUES (${interaction.user.id}, "${interaction.user.username}", "${new Date().toISOString().replace('T', ' ').slice(0, 19)}")`, 'run');
            await query(`INSERT INTO characters (id) VALUES (${interaction.user.id})`, 'run');
            await query(`INSERT INTO dungeon (id) VALUES (${interaction.user.id})`, 'run');
        };
        // ADD NEW SERVERS
        const serverExists = await query(`SELECT user_ids FROM servers WHERE id = ${interaction.guild.id}`); // Check if server exists in the db
        if (serverExists.length) { // Add players to guild
            if (!serverExists[0].user_ids.split(",").includes(interaction.user.id)) await query(`UPDATE servers SET user_ids = "${serverExists[0].user_ids + "," + interaction.user.id}" WHERE id = ${interaction.guild.id}`, 'run');
        } else { // Add new server if not exists
            await query(`INSERT INTO servers (id, name, user_ids) VALUES (${interaction.guild.id}, "${interaction.guild.name.split('"').join('""')}", "${interaction.user.id}")`, 'run');
        };

        // TUTORIAL
        const { 0: userStats } = await query(`SELECT tutorial, mailbox, mailreceived FROM users WHERE id = ${interaction.user.id}`);
        userStats.tutorial = JSON.parse(userStats.tutorial);
        if (!([0, 1, 2, 3, 4, 5, 6, 7].every((e) => userStats.tutorial.includes(e)))) return client.commands.get('tutorial').execute(interaction);

        // Check new mails
        userStats.mailbox = JSON.parse(userStats.mailbox);
        if (userStats.mailbox.length > userStats.mailreceived) {
            await query(`UPDATE users SET mailreceived = ${userStats.mailbox.length} WHERE id = ${interaction.user.id}`);
            setTimeout(() => {
                interaction.channel.send(interaction.user.toString() + " you have received a **new mail**! Open it using </profile:1010583712527810641>");
            }, 1000);
        };

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
        if (message.type === 'DEFAULT') message.channel.send("Welcome, Adventurer " + emojis[Math.floor(Math.random() * emojis.length)] + "\nPlease use slash commands (i.e. </pull:1011014030103674913>) to interact with the bot.\nIf it doesn't work it's probably because of some missing permissions, make sure that Camelot has all required permissions to function! Please reach out to us if you need help at any step: <https://discord.gg/myy9PBCdEW>");
    } else {
        const channel = client.channels.cache.find(channel => channel.id === "1077264632412110890");
        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setDescription(message.content)
            .setAuthor({ name: message.author.tag, url: "https://" + message.author.id + ".com", iconURL: message.author.displayAvatarURL({ dynamic: true }) + "?size=2048" });
        channel.send({ embeds: [Embed] });
    };
});

// Debugging
client.on("rateLimit", console.log);
// .on("debug", console.log)
// .on("warn", console.log)

client.on('disconnect', () => {
    console.log('Bot is disconnecting...');
    console.log('ws status is ' + client.ws.status);

    // Wait for 15 seconds before checking the WebSocket status
    // setTimeout(() => {
    //     if(client.ws.status === 5) { // If the WebSocket is disconnected
    //         console.log('Reconnecting...');
    //         client.destroy().then(() => {
    //             client.login(config.token);
    //         });
    //     }
    // }, 15000);
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
app.use(express.json());

const webhook = new Topgg.Webhook(config.topgg.auth);
app.post('/dblwebhook', webhook.listener(vote => {
    db.serialize(async () => {
        await query(`UPDATE users SET pullresets = pullresets + 1, votestotal = votestotal + 1, lootbox = lootbox + 1, gems = gems + 3, lastvote = ${Date.now()} WHERE id = ${vote.user}`);
        let stats = await query(`SELECT votereminder FROM users WHERE id = ${vote.user}`);
        if (stats[0]?.votereminder) {
            setTimeout(async () => {
                const dmUser = await client.users.fetch(vote.user);
                if (dmUser) dmUser.send("You're off cooldown!\nYou can vote again at https://top.gg/bot/706183309943767112/vote\nYou are receiving this message because you enabled vote reminders. Use `/reminder` if you want to turn it off again.");
            }, 12 * 60 * 60 * 1000);
        };
        // Daily Quest
        dailies[10].update(false, 1, { id: vote.user }); // Knight's Ballot
    });
}));
app.listen(3000);

// Reload vote reminders
(async () => {
    const stats = await query(`SELECT id, votereminder, lastvote FROM users`);

    for (const stat of stats) {
        if (stat.votereminder && stat.lastvote) {
            if (((Date.now() - stat.lastvote) / (60 * 60 * 1000)) < 12) {
                setTimeout(async () => {
                    const dmUser = await client.users.fetch(stat.id);
                    if (dmUser) dmUser.send("You're off cooldown!\nYou can vote again at https://top.gg/bot/706183309943767112/vote\nYou are receiving this message because you enabled vote reminders. Use `/reminder` if you want to turn it off again.");
                }, (12 * 60 * 60 * 1000) - (Date.now() - stat.lastvote));
            };
        };
    };

    console.log("Finished reloading vote reminders");
})();


// Using Donatebot API
// const https = require("https");
// const serverID = "927257132624130119";
const product = {
    // donatebot
    "RQ-Xy86yos": [160, 60],           //   $3
    "n9D2AeoMzr": [300, 100],          //   $5
    "EQAnsf2I7q": [680, 160],          //  $10
    "ExAXfcW-7J": [1000, 240],         //  $15
    "bwSNjx7yWm": [1760, 360, 238],    //  $25 // + Rimuru Tempest
    "O7bkg49rJD": [3680, 720],         //  $50
    "7BsfSbcV_1": [7420, 1440, 17115], // $100 // + Luminous EX

    // Rank.top
    "qw0YpPaym7": [160, 60],           //   $3
    "VN-cmiPYuK": [300, 100],          //   $5
    "ZC0LBngEdl": [680, 160],          //  $10
    "Dr5P_k9Wel": [1000, 240],         //  $15
    "z4c3JAli26": [1760, 360, 238],    //  $25 // + Rimuru Tempest
    "CCaxvU9Ivy": [3680, 720],         //  $50
    "q__i-jPpJJ": [7420, 1440, 17115], // $100 // + Luminous EX
};
// const product = { // +30% Summer Sale 
//     "RQ-Xy86yos": [208, 60],           //   $3
//     "n9D2AeoMzr": [390, 100],          //   $5
//     "EQAnsf2I7q": [680+68+68+68, 160],          //  $10
//     "ExAXfcW-7J": [1300, 240],         //  $15
//     "bwSNjx7yWm": [1760+176+176+176, 360, 238],    //  $25 // + Rimuru Tempest
//     "O7bkg49rJD": [3680+368+368+368, 720],         //  $50
//     "7BsfSbcV_1": [7420+742+742+742, 1440, 17115], // $100 // + Luminous EX
// };

// function httpGet(url, headers) {
//     return new Promise((resolve, reject) => {
//         const options = {
//             headers,
//         };

//         https.get(url, options, (res) => {
//             let data = "";

//             res.on("data", (chunk) => {
//                 data += chunk;
//             });

//             res.on("end", () => {
//                 resolve(JSON.parse(data));
//             });
//         }).on("error", (err) => {
//             reject(err);
//         });
//     });
// };

// function httpPost(url, headers, body) {
//     return new Promise((resolve, reject) => {
//         const options = {
//             method: "POST",
//             headers,
//         };

//         const req = https.request(url, options, (res) => {
//             if (res.statusCode === 200) {
//                 resolve();
//             } else {
//                 reject(new Error("Error marking donation as processed."));
//             };
//         });

//         req.on("error", (err) => {
//             reject(err);
//         });

//         req.write(body);
//         req.end();
//     });
// };

// async function getNewDonations() {
//     const url = `https://donatebot.io/api/v1/donations/${serverID}/new`;
//     const headers = {
//         Authorization: config.donatebot.key,
//     };
//     const data = await httpGet(url, headers);
//     return data;
// };

// async function markDonationAsProcessed(txnID, processed = true) {
//     const url = `https://donatebot.io/api/v1/donations/${serverID}/${txnID}/mark`;
//     const headers = {
//         Authorization: config.donatebot.key,
//         "Content-Type": "application/json",
//     };
//     const body = JSON.stringify({ markProcessed: processed });
//     await httpPost(url, headers, body);
// };

// // // Unmark
// // markDonationAsProcessed("2JU19147XS2779314", false).then(() => {
// //     console.log("Unmarked");
// // });

// setInterval(() => {
//     getNewDonations().then((donations) => {
//         donations = donations.donations;
//         if (donations.length) {
//             db.serialize(async () => {
//                 for (const donation of donations) {
//                     const { 0: stats } = await query(`SELECT users.jades, users.gems, users.transactions, users.referred_by, characters.chars FROM users JOIN characters ON users.id = characters.id WHERE users.id = ${donation.buyer_id}`);
//                     if (stats) {
//                         stats.transactions = JSON.parse(stats.transactions), stats.chars = JSON.parse(stats.chars);
//                         const jades = (product[donation.product_id]?.[0] + (stats.transactions.some((e) => e.product_id === donation.product_id) ? 0 : product[donation.product_id]?.[1])) || 0;
//                         await query(`UPDATE users SET jades = jades + ${jades}, transactions = '${JSON.stringify([...stats.transactions, donation])}' WHERE id = ${donation.buyer_id}`);
//                         if (product[donation.product_id][2] && !stats.transactions.some((e) => e.product_id === donation.product_id)) await query(`UPDATE characters SET chars = '${JSON.stringify([...stats.chars, product[donation.product_id][2]])}' WHERE id = ${donation.buyer_id}`);

//                         // Send DM
//                         const dmUser = await client.users.fetch(donation.buyer_id);
//                         if (dmUser) {
//                             const Embed = new EmbedBuilder()
//                                 .setColor(0xbbffff)
//                                 .setTitle("Thank you for your support!")
//                                 .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
//                                 .setDescription(`We have received and processed your order! <:ClaraThumbsUp:1034899843505721514>\nPlease [contact](https://discord.gg/myy9PBCdEW) us if you encounter any issues. You can see the transaction details below.\n\n\`\`\`yaml\nOrder: ${product[donation.product_id]?.[0]} eternal jades\nPrice: ${donation.price} ${donation.currency}\nProduct ID: ${donation.product_id}\nTransaction ID: ${donation.txn_id}\nStatus: ${donation.status}\nBuyer ID: ${donation.buyer_id}\nDate: ${new Date(donation.timestamp * 1000).toISOString()}\`\`\``);
//                             dmUser.send({ embeds: [Embed] });
//                         };

//                         // Log confirmation message
//                         const chnl = client.channels.cache.find(channel => channel.id === "1030963832136417320");

//                         // Mark Donation as Processed
//                         markDonationAsProcessed(donation.txn_id).then(() => {
//                             if (chnl) chnl.send(`Successfully processed transaction ${donation.txn_id}\nBuyer: <@${donation.buyer_id}> | ${donation.buyer_id}\nBalance: **${stats.jades + jades}**<:eternal_jade:1256124504141201428>\nPrice: **${donation.price} ${donation.currency}**${stats.referred_by ? `\nReferred by: <@${stats.referred_by}> | ${stats.referred_by} (+**${Math.floor(0.2 * jades)}**<:genesis_gems:1034179687720681492>)` : ""}`);
//                         }).catch((err) => {
//                             console.log(err);
//                             if (chnl) chnl.send(`Failed to mark transaction ${donation.txn_id} as processed.\nBuyer: <@${donation.buyer_id}> | ${donation.buyer_id}\nBalance: **${stats.jades}**<:eternal_jade:1256124504141201428>\nPrice: **${donation.price} ${donation.currency}**${stats.referred_by ? `\nReferred by: <@${stats.referred_by}> | ${stats.referred_by} (+**${Math.floor(0.2 * jades)}**<:genesis_gems:1034179687720681492>)` : ""}`);
//                         });

//                         // Send referral reward if any
//                         if (stats.referred_by) {
//                             const { 0: user } = await query(`SELECT mailbox FROM users WHERE id = ${stats.referred_by}`);
//                             if (!user) return;
//                             user.mailbox = JSON.parse(user.mailbox);
//                             user.mailbox.push({ "type": "9", "rewards": `gems|${Math.floor(0.2 * jades)}`, "message": `Hey <@${stats.referred_by}>! <:MashaWave:928370055354400799>\nA player you have referred has bought some jades, here is your reward <:TohruPoint:928370972132782090>\nThank you for playing <:LoveHeart:928369932683595827>`, "date": Date.now() });
//                             await query(`UPDATE users SET referred_gems = referred_gems + ${Math.floor(0.2 * jades)}, mailbox = '${JSON.stringify(user.mailbox)}' WHERE id = ${stats.referred_by}`);
//                         };
//                     } else {
//                         const chnl = client.channels.cache.find(channel => channel.id === "1030963832136417320");
//                         if (chnl) chnl.send(`User <@${donation.buyer_id}> (${donation.buyer_id}) has no profile.\nEmail: **${donation.buyer_email}**\nOrder: **${donation.product_id}**\nPrice: **${donation.price} ${donation.currency}**`);
//                     };
//                 };
//             });
//         };
//     }).catch((err) => {
//         console.log(err);
//     });
// }, 5 * 60 * 1000);


// Rank.top Webhook
app.post('/rankshop', (req, res) => {
    const donation = req.body;

    // Return when
    if (donation.authorization !== config.rank.auth) return;
    delete donation.authorization;
    if (!donation.buyer_id) return res.status(200).send('received');

    // Send a response back to acknowledge receipt
    res.status(200).send('received');

    db.serialize(async () => {
        const { 0: stats } = await query(`SELECT users.jades, users.gems, users.transactions, users.referred_by, characters.chars FROM users JOIN characters ON users.id = characters.id WHERE users.id = ${donation.buyer_id}`);
        if (stats) {
            stats.transactions = JSON.parse(stats.transactions), stats.chars = JSON.parse(stats.chars);
            const jades = (product[donation.product_id]?.[0] + (donation.first_purchase ? product[donation.product_id]?.[1] : 0)) || 0;
            await query(`UPDATE users SET jades = jades + ${jades}, transactions = '${JSON.stringify([...stats.transactions, donation])}' WHERE id = ${donation.buyer_id}`);
            if (product[donation.product_id][2] && donation.first_purchase) await query(`UPDATE characters SET chars = '${JSON.stringify([...stats.chars, product[donation.product_id][2]])}' WHERE id = ${donation.buyer_id}`);

            // Send DM
            const dmUser = await client.users.fetch(donation.buyer_id);
            if (dmUser) {
                const Embed = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setTitle("Thank you for your support!")
                    .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                    .setDescription(`We have received and processed your order! <:ClaraThumbsUp:1034899843505721514>\nPlease [contact](https://discord.gg/myy9PBCdEW) us if you encounter any issues. You can see the transaction details below.\n\n\`\`\`yaml\nOrder: ${product[donation.product_id]?.[0]} eternal jades\nPrice: ${donation.price} ${donation.currency}\nProduct ID: ${donation.product_id}\nTransaction ID: ${donation.txn_id}\nStatus: ${donation.status}\nBuyer ID: ${donation.buyer_id}\nDate: ${new Date(donation.timestamp * 1000).toISOString()}\`\`\``);
                dmUser.send({ embeds: [Embed] });
            };

            // Log confirmation message
            const chnl = client.channels.cache.find(channel => channel.id === "1030963832136417320");
            if (chnl) chnl.send(`Successfully processed transaction ${donation.txn_id}\nBuyer: <@${donation.buyer_id}> | ${donation.buyer_id}\nBalance: **${stats.jades + jades}**<:eternal_jade:1256124504141201428>\nPrice: **${donation.price} ${donation.currency}**${stats.referred_by ? `\nReferred by: <@${stats.referred_by}> | ${stats.referred_by} (+**${Math.floor(0.2 * jades)}**<:genesis_gems:1034179687720681492>)` : ""}`);

            // Send referral reward if any
            if (stats.referred_by && (stats.transactions.reduce((acc, transaction) => acc + parseInt(transaction.price), 0) + parseInt(donation.price)) <= 500) {
                const { 0: user } = await query(`SELECT mailbox FROM users WHERE id = ${stats.referred_by}`);
                if (!user) return;
                user.mailbox = JSON.parse(user.mailbox);
                user.mailbox.push({ "type": "9", "rewards": `gems|${Math.floor(0.2 * jades)}`, "message": `Hey <@${stats.referred_by}>! <:MashaWave:928370055354400799>\nA player you have referred has bought some jades, here is your reward <:TohruPoint:928370972132782090>\nThank you for playing <:LoveHeart:928369932683595827>`, "date": Date.now() });
                await query(`UPDATE users SET referred_gems = referred_gems + ${Math.floor(0.2 * jades)}, mailbox = '${JSON.stringify(user.mailbox)}' WHERE id = ${stats.referred_by}`);
            };
        } else {
            const chnl = client.channels.cache.find(channel => channel.id === "1030963832136417320");
            if (chnl) chnl.send(`User <@${donation.buyer_id}> (${donation.buyer_id}) has no profile.\nEmail: **${donation.buyer_email}**\nOrder: **${donation.product_id}**\nPrice: **${donation.price} ${donation.currency}**`);
        };
    });
});



// -- -- -- PLAYGROUND -- -- -- //
// -- -- -- PLAYGROUND -- -- -- //
// -- -- -- PLAYGROUND -- -- -- //

// // Send messages to python script and back
// if (true || cmd === "py") {
//     const {spawn} = require('child_process');
//     const pythonProcess = spawn('python',["./Python/scriptl.py", "JS_input"]);
//     console.log("A");
//     pythonProcess.stdout.on('data', (data) => {
//         let readableData = data.toString('utf8');
//         console.log(readableData);
//     });
//     console.log("C");
// };
