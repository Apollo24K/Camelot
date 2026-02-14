import express from 'express';
import { Client } from "discord.js";
import { BotHandler } from "../types";
import { Webhook } from '@top-gg/sdk';
import { dailies } from "../Modules/dailyQuests";
import { getUserSchema, loadVoteReminders, updateUsersAndCache } from '../Modules/queries';

const reminderMessage =
    `You're off cooldown!\n` +
    `You can vote again at https://rank.top/bot/camelot/vote\n` +
    `Voting rewards include **1x** pull reset, **3x** gems <:genesis_gems:1034179687720681492> and **3x** lootboxes containing coins <:coins:872926669055356939>, shards <:ss_shard:917203009543503892> and tickets <:ss_ticket:927503239396622336>\n` +
    `\n` +
    `-# You can use \`/reminder\` to disable vote reminders`;

const handler: BotHandler = {
    name: "Vote",
    once: true,
    execute: async (client: Client) => {

        // Only if Camelot
        if (process.env.CLIENT_ID !== "706183309943767112") return;

        const app = express();
        app.use(express.json());

        const webhook = new Webhook(process.env.TOPGG_AUTH);

        // Top.gg Webhook
        app.post('/dblwebhook', webhook.listener(async (vote) => {

            // Get user schema
            const stats = await getUserSchema(vote.user);
            if (!stats) return;

            // Return if lastvote has been less than 12h ago
            if (stats.lastvote && ((Date.now() - new Date(stats.lastvote).getTime()) < 12 * 60 * 60 * 1000)) return;

            // Update users table
            await updateUsersAndCache(client, vote.user, {
                updates: {
                    pullresets: { type: "increment", value: 1 },
                    votestotal: { type: "increment", value: 1 },
                    lootbox: { type: "increment", value: 3 },
                    gems: { type: "increment", value: 3 },
                    lastvote: { type: "set", value: new Date() },

                    season_keys: { type: "increment", value: "10" in stats.dailies ? 0 : 5 },
                    dailies: { type: "merge_json", value: { 10: 0 } },
                },
            });

            // Send reminder
            if (stats?.votereminder) {
                setTimeout(async () => {
                    const dmUser = await client.users.fetch(vote.user);
                    if (dmUser) dmUser.send(reminderMessage);
                }, 12 * 60 * 60 * 1000);
            };

            // Daily Quest
            dailies[10].update(undefined, client, 1, { id: vote.user }); // Knight's Ballot
        }));

        // Listen for Webhooks
        app.listen(3000);

        // Rank.top Webhook
        app.post('/rankvote', async (req, res) => {
            const vote = req.body;

            // Check if authorization is valid
            if (req.headers.authorization !== process.env.RANK_AUTH && vote.authorization !== process.env.RANK_AUTH) {
                return res.status(401).send('Unauthorized');
            };

            // Send a response back to acknowledge receipt
            res.status(200).send('received');

            // Get user schema
            const stats = await getUserSchema(vote.user_id);
            if (!stats) return;

            // Check if power vote
            const isPowerVote = !!vote.is_power_vote;

            // If server vote
            if (vote.target_type === "server") {
                // Return if lastvote has been less than 12h ago
                if (stats.lastvoteserver && ((Date.now() - new Date(stats.lastvoteserver).getTime()) < 12 * 60 * 60 * 1000)) return;

                await updateUsersAndCache(client, vote.user_id, {
                    updates: {
                        lastvoteserver: { type: "set", value: new Date(Date.now() + (isPowerVote ? 11 * 60 * 60 * 1000 : 0)) },
                        season_keys: { type: "increment", value: "12" in stats.dailies ? 0 : 5 },
                        dailies: { type: "merge_json", value: { 12: 0 } },
                    },
                });

                dailies[12].update(undefined, client, 1, { id: vote.user_id }); // Guild's Ballot
                return;
            };

            // Return if lastvote has been less than 12h ago
            if (stats.lastvote && ((Date.now() - new Date(stats.lastvote).getTime()) < 12 * 60 * 60 * 1000)) return;

            // Update users table
            await updateUsersAndCache(client, vote.user_id, {
                updates: {
                    pullresets: { type: "increment", value: isPowerVote ? 2 : 1 },
                    votestotal: { type: "increment", value: isPowerVote ? 2 : 1 },
                    lootbox: { type: "increment", value: isPowerVote ? 6 : 3 },
                    gems: { type: "increment", value: isPowerVote ? 7 : 3 },
                    lastvote: { type: "set", value: new Date(Date.now() + (isPowerVote ? 11 * 60 * 60 * 1000 : 0)) },

                    season_keys: { type: "increment", value: "10" in stats.dailies ? 0 : 5 },
                    dailies: { type: "merge_json", value: { 10: 0 } },
                },
            });

            // Send reminder
            if (stats?.votereminder) {
                setTimeout(async () => {
                    const dmUser = await client.users.fetch(vote.user_id);
                    if (dmUser) dmUser.send(reminderMessage);
                }, (isPowerVote ? 23 : 12) * 60 * 60 * 1000);
            };

            // Daily Quest
            dailies[10].update(undefined, client, 1, { id: vote.user_id }); // Knight's Ballot
        });

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
