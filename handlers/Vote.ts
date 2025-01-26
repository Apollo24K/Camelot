import express from 'express';
import config from '../config.json';
import { Client } from "discord.js";
import { BotHandler } from "../types";
import { Webhook } from '@top-gg/sdk';
import { dailies } from "../Modules/dailyQuests";
import { getUserSchema, loadVoteReminders, updateUsers } from '../Modules/queries';

const reminderMessage = "You're off cooldown!\nYou can vote again at https://top.gg/bot/706183309943767112/vote\nYou are receiving this message because you enabled vote reminders. Use `/reminder` if you want to turn it off again.";

const handler: BotHandler = {
    name: "Vote",
    once: true,
    execute: async (client: Client) => {

        const app = express();
        app.use(express.json());

        const webhook = new Webhook(config.topgg.auth);

        app.post('/dblwebhook', webhook.listener(async (vote) => {
            // Update users table
            await updateUsers(vote.user, {
                pullresets: { type: "increment", value: 1 },
                votestotal: { type: "increment", value: 1 },
                lootbox: { type: "increment", value: 1 },
                gems: { type: "increment", value: 3 },
                lastvote: { type: "set", value: new Date() },
            });

            // Send reminder
            const stats = await getUserSchema(vote.user);
            if (stats?.votereminder) {
                setTimeout(async () => {
                    const dmUser = await client.users.fetch(vote.user);
                    if (dmUser) dmUser.send(reminderMessage);
                }, 12 * 60 * 60 * 1000);
            };

            // Daily Quest
            dailies[10].update(undefined, 1, { id: vote.user }); // Knight's Ballot
        }));
        app.listen(3000);

        // Reload active vote reminders after bot restart
        const stats = await loadVoteReminders();
        for (const stat of stats) {
            setTimeout(async () => {
                const dmUser = await client.users.fetch(stat.id);
                if (dmUser) dmUser.send(reminderMessage);
            }, (12 * 60 * 60 * 1000) - (Date.now() - new Date(stat.lastvote ?? new Date()).getTime()));
        };
        console.log(`Finished reloading ${stats.length} vote reminders`);
    },
};

export default handler;
