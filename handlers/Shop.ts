import config from '../config.json';
import { ChannelType, Client, EmbedBuilder } from "discord.js";
import { BotHandler, RankShopTransaction, UpdateUserOptions } from "../types";
import express from 'express';
import { getFullUserSchema, updateUsers } from '../Modules/queries';

const products: { [key: string]: { jades: number, bonus: number, char?: number; }; } = {
    // Rank.top
    "qw0YpPaym7": { jades: 160, bonus: 60 },                 //   $3
    "VN-cmiPYuK": { jades: 300, bonus: 100 },                //   $5
    "ZC0LBngEdl": { jades: 680, bonus: 160 },                //  $10
    "Dr5P_k9Wel": { jades: 1000, bonus: 240 },               //  $15
    "z4c3JAli26": { jades: 1760, bonus: 360, char: 238 },    //  $25 // + Rimuru Tempest
    "CCaxvU9Ivy": { jades: 3680, bonus: 720 },               //  $50
    "q__i-jPpJJ": { jades: 7420, bonus: 1440, char: 17115 }, // $100 // + Luminous EX
};

const handler: BotHandler = {
    name: "Shop",
    execute: (client: Client) => {

        const app = express();
        app.use(express.json());
        app.listen(3010);
        // Rank.top Webhook
        app.post('/rankshop', async (req, res): Promise<any> => {

            const donation = req.body as RankShopTransaction;

            // Check if authorization is valid
            if (donation.authorization !== config.rank.auth) return;
            delete donation.authorization;

            // Send a response back to acknowledge receipt
            res.status(200).send('received');

            // Return if buyer_id is missing
            if (!donation.buyer_id) return;

            // Get channel
            const chnl = client.channels.cache.find(channel => channel.id === "1030963832136417320");

            // Get user stats 
            const stats = await getFullUserSchema(donation.buyer_id);
            if (!stats) {
                if (!chnl || chnl.type !== ChannelType.GuildText) return;
                return chnl.send(`User <@${donation.buyer_id}> (${donation.buyer_id}) has no profile.\nEmail: **${donation.buyer_email}**\nOrder: **${donation.product_id}**\nPrice: **${donation.price} ${donation.currency}**`);
            };

            const product = products[donation.product_id];
            const jades = product.jades + (donation.first_purchase ? product.bonus : 0);

            // Update users table
            const userUpdates: UpdateUserOptions = {
                jades: { type: "increment", value: jades },
                transactions: { type: "append", value: [donation] },
            };
            if (product.char && donation.first_purchase) userUpdates.chars = { type: "append", value: [product.char] };
            await updateUsers(donation.buyer_id, userUpdates);

            // Send DM
            const dmUser = await client.users.fetch(donation.buyer_id);
            if (dmUser) {
                const Embed = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setTitle("Thank you for your support!")
                    .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                    .setDescription(`We have received and processed your order! <:ClaraThumbsUp:1034899843505721514>\nPlease [contact](https://discord.gg/myy9PBCdEW) us if you encounter any issues. You can see the transaction details below.\n\n\`\`\`yaml\nOrder: ${product.jades} eternal jades\nPrice: ${donation.price} ${donation.currency}\nProduct ID: ${donation.product_id}\nTransaction ID: ${donation.txn_id}\nStatus: ${donation.status}\nBuyer ID: ${donation.buyer_id}\nDate: ${new Date(donation.timestamp * 1000).toISOString()}\`\`\``);
                dmUser.send({ embeds: [Embed] });
            };
            // Log confirmation message
            if (chnl?.isTextBased() && 'send' in chnl) chnl.send(`Successfully processed transaction ${donation.txn_id}\nBuyer: <@${donation.buyer_id}> | ${donation.buyer_id}\nBalance: **${stats.jades + jades}**<:eternal_jade:1256124504141201428>\nPrice: **${donation.price} ${donation.currency}**${stats.referred_by ? `\nReferred by: <@${stats.referred_by}> | ${stats.referred_by} (+**${Math.floor(0.2 * jades)}**<:genesis_gems:1034179687720681492>)` : ""}`);

            // Send referral reward if any
            if (stats.referred_by && (stats.transactions.reduce((acc: number, transaction: RankShopTransaction) => acc + parseInt(transaction.price), 0) + parseInt(donation.price)) <= 500) {
                const mail = { "type": "9", "rewards": `gems|${Math.floor(0.2 * jades)}`, "message": `Hey <@${stats.referred_by}>! <:MashaWave:928370055354400799>\nA player you have referred has bought some jades, here is your reward <:TohruPoint:928370972132782090>\nThank you for playing <:LoveHeart:928369932683595827>`, "date": Date.now() };

                // Update users table
                await updateUsers(donation.buyer_id, {
                    referred_gems: { type: "increment", value: Math.floor(0.2 * jades) },
                    mailbox: { type: "append", value: [mail] },
                });
            };
        });

    },
};

export default handler;
