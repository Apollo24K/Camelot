import fs from 'fs';
import { join } from "path";
import config from './config';
import { Client, GatewayIntentBits, Partials, Options, Collection } from 'discord.js';

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

// Add Handlers
//eslint-disable-next-line
const handlersDir = join(__dirname, "./handlers");
fs.readdirSync(handlersDir).forEach(handler => {
    if (!handler.endsWith(".js")) return;
    let event = require(`${handlersDir}/${handler}`).default;
    if (!event.disabled) event.execute(client);
});

// Don't crash
// eslint-disable-next-line no-undef
process.on('uncaughtException', error => {
    console.log(error.stack);
});

// const product = {
//     // donatebot
//     "RQ-Xy86yos": [160, 60],           //   $3
//     "n9D2AeoMzr": [300, 100],          //   $5
//     "EQAnsf2I7q": [680, 160],          //  $10
//     "ExAXfcW-7J": [1000, 240],         //  $15
//     "bwSNjx7yWm": [1760, 360, 238],    //  $25 // + Rimuru Tempest
//     "O7bkg49rJD": [3680, 720],         //  $50
//     "7BsfSbcV_1": [7420, 1440, 17115], // $100 // + Luminous EX

//     // Rank.top
//     "qw0YpPaym7": [160, 60],           //   $3
//     "VN-cmiPYuK": [300, 100],          //   $5
//     "ZC0LBngEdl": [680, 160],          //  $10
//     "Dr5P_k9Wel": [1000, 240],         //  $15
//     "z4c3JAli26": [1760, 360, 238],    //  $25 // + Rimuru Tempest
//     "CCaxvU9Ivy": [3680, 720],         //  $50
//     "q__i-jPpJJ": [7420, 1440, 17115], // $100 // + Luminous EX
// };

// // Rank.top Webhook
// app.post('/rankshop', (req, res) => {
//     const donation = req.body;

//     // Return when
//     if (donation.authorization !== config.rank.auth) return;
//     delete donation.authorization;
//     if (!donation.buyer_id) return res.status(200).send('received');

//     // Send a response back to acknowledge receipt
//     res.status(200).send('received');

//     db.serialize(async () => {
//         const { 0: stats } = await query(`SELECT users.jades, users.gems, users.transactions, users.referred_by, characters.chars FROM users JOIN characters ON users.id = characters.id WHERE users.id = ${donation.buyer_id}`);
//         if (stats) {
//             stats.transactions = JSON.parse(stats.transactions), stats.chars = JSON.parse(stats.chars);
//             const jades = (product[donation.product_id]?.[0] + (donation.first_purchase ? product[donation.product_id]?.[1] : 0)) || 0;
//             await query(`UPDATE users SET jades = jades + ${jades}, transactions = '${JSON.stringify([...stats.transactions, donation])}' WHERE id = ${donation.buyer_id}`);
//             if (product[donation.product_id][2] && donation.first_purchase) await query(`UPDATE characters SET chars = '${JSON.stringify([...stats.chars, product[donation.product_id][2]])}' WHERE id = ${donation.buyer_id}`);

//             // Send DM
//             const dmUser = await client.users.fetch(donation.buyer_id);
//             if (dmUser) {
//                 const Embed = new EmbedBuilder()
//                     .setColor(0xbbffff)
//                     .setTitle("Thank you for your support!")
//                     .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
//                     .setDescription(`We have received and processed your order! <:ClaraThumbsUp:1034899843505721514>\nPlease [contact](https://discord.gg/myy9PBCdEW) us if you encounter any issues. You can see the transaction details below.\n\n\`\`\`yaml\nOrder: ${product[donation.product_id]?.[0]} eternal jades\nPrice: ${donation.price} ${donation.currency}\nProduct ID: ${donation.product_id}\nTransaction ID: ${donation.txn_id}\nStatus: ${donation.status}\nBuyer ID: ${donation.buyer_id}\nDate: ${new Date(donation.timestamp * 1000).toISOString()}\`\`\``);
//                 dmUser.send({ embeds: [Embed] });
//             };

//             // Log confirmation message
//             const chnl = client.channels.cache.find(channel => channel.id === "1030963832136417320");
//             if (chnl) chnl.send(`Successfully processed transaction ${donation.txn_id}\nBuyer: <@${donation.buyer_id}> | ${donation.buyer_id}\nBalance: **${stats.jades + jades}**<:eternal_jade:1256124504141201428>\nPrice: **${donation.price} ${donation.currency}**${stats.referred_by ? `\nReferred by: <@${stats.referred_by}> | ${stats.referred_by} (+**${Math.floor(0.2 * jades)}**<:genesis_gems:1034179687720681492>)` : ""}`);

//             // Send referral reward if any
//             if (stats.referred_by && (stats.transactions.reduce((acc, transaction) => acc + parseInt(transaction.price), 0) + parseInt(donation.price)) <= 500) {
//                 const { 0: user } = await query(`SELECT mailbox FROM users WHERE id = ${stats.referred_by}`);
//                 if (!user) return;
//                 user.mailbox = JSON.parse(user.mailbox);
//                 user.mailbox.push({ "type": "9", "rewards": `gems|${Math.floor(0.2 * jades)}`, "message": `Hey <@${stats.referred_by}>! <:MashaWave:928370055354400799>\nA player you have referred has bought some jades, here is your reward <:TohruPoint:928370972132782090>\nThank you for playing <:LoveHeart:928369932683595827>`, "date": Date.now() });
//                 await query(`UPDATE users SET referred_gems = referred_gems + ${Math.floor(0.2 * jades)}, mailbox = '${JSON.stringify(user.mailbox)}' WHERE id = ${stats.referred_by}`);
//             };
//         } else {
//             const chnl = client.channels.cache.find(channel => channel.id === "1030963832136417320");
//             if (chnl) chnl.send(`User <@${donation.buyer_id}> (${donation.buyer_id}) has no profile.\nEmail: **${donation.buyer_email}**\nOrder: **${donation.product_id}**\nPrice: **${donation.price} ${donation.currency}**`);
//         };
//     });
// });
