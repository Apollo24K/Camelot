import express from 'express';
import config from '../config.json';
import { Client } from "discord.js";
import { BotHandler } from "../types";
import { query } from '../db_handler';
import { Webhook } from '@top-gg/sdk';
import { dailies } from "../Modules/dailyQuests";

const reminderMessage = "You're off cooldown!\nYou can vote again at https://top.gg/bot/706183309943767112/vote\nYou are receiving this message because you enabled vote reminders. Use `/reminder` if you want to turn it off again.";

const handler: BotHandler = {
    name: "Vote",
    once: true,
    execute: async (client: Client) => {

        const app = express();
        app.use(express.json());

        const webhook = new Webhook(config.topgg.auth);

        app.post('/dblwebhook', webhook.listener(async (vote) => {
            // Update vote count
            await query(`UPDATE users SET pullresets = pullresets + 1, votestotal = votestotal + 1, lootbox = lootbox + 1, gems = gems + 3, lastvote = ${Date.now()} WHERE id = ${vote.user}`);

            // Send reminder
            const { 0: stats } = await query(`SELECT votereminder FROM users WHERE id = ${vote.user}`);
            if (stats?.votereminder) {
                setTimeout(async () => {
                    const dmUser = await client.users.fetch(vote.user);
                    if (dmUser) dmUser.send(reminderMessage);
                }, 12 * 60 * 60 * 1000);
            };

            // Daily Quest
            dailies[10].update(false, 1, { id: vote.user }); // Knight's Ballot
        }));
        app.listen(3000);

        // Reload active vote reminders after bot restart
        const stats = await query(`SELECT id, votereminder, lastvote FROM users`);
        for (const stat of stats) {
            if (stat.votereminder && stat.lastvote) {
                if (((Date.now() - stat.lastvote) / (60 * 60 * 1000)) < 12) {
                    setTimeout(async () => {
                        const dmUser = await client.users.fetch(stat.id);
                        if (dmUser) dmUser.send(reminderMessage);
                    }, (12 * 60 * 60 * 1000) - (Date.now() - stat.lastvote));
                };
            };
        };
        console.log(`Finished reloading ${stats.length} vote reminders`);
    },
};

export default handler;
