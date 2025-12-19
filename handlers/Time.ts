import fs from 'fs';
import { Client } from "discord.js";
import { BotHandler, UpdateUserOptions } from "../types";
import { getPlayerbaseStats, insertNewStampede, resetDailyResponses, resetDungeonLimit, updateUsersAndCache } from '../Modules/queries';
import { isStampedeMonth } from '../Modules/functions';

const handler: BotHandler = {
    name: "Time",
    once: true,
    execute: (client: Client) => {
        setTimeout(() => setInterval(async () => {
            const now = new Date();

            const userUpdates: UpdateUserOptions = {};

            // Daily
            if (now.getHours() === 0 && now.getMinutes() === 0) {

                // Daily Reset
                userUpdates.dailyclaimed = { type: "set", value: 0 };
                userUpdates.dailies = { type: "set", value: {} };
                userUpdates.feedlimit = { type: "set", value: 0 };
                userUpdates.cow_rolled_today = { type: "set", value: 0 };

                // Reset Low Responses
                await resetDailyResponses(client);

                // Start new Stampede
                if (now.getDate() === 14 && isStampedeMonth()) {
                    await insertNewStampede();
                };

                // Daily Stats
                const stats = await getPlayerbaseStats();
                const chnl = client.channels.cache.find(channel => channel.id === "1029507771567190017");
                if (chnl?.isSendable()) chnl.send(`Servers: **${client.guilds.cache.size}**\nPlayers: **${stats.players}**\nActive: **${stats.active}**\nDaily: **${stats.daily}**`);
            };

            // Weekly Reset
            if (now.getDay() === 0 && now.getHours() === 0 && now.getMinutes() === 0) {
                userUpdates.weeklyclaimed = { type: "set", value: 0 };
            };

            // Every 8 hours
            if (now.getHours() % 8 === 0 && now.getMinutes() === 0) {
                // Dungeon Reset
                await resetDungeonLimit(client);
            };

            // Every 4 hours
            if (now.getHours() % 4 === 0 && now.getMinutes() === 0) {

            };

            // Every 2 hours
            if (now.getHours() % 2 === 0 && now.getMinutes() === 0) {
                // Bosshunt Reset
                await updateUsersAndCache(client, "*", {
                    updates: {
                        bosshuntruns: { type: "increment", value: -1 },
                    },
                    condition: "bosshuntruns > 0",
                });
            };

            // Monthly
            if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
                // Reset Premium Gifts
                fs.writeFile('Storage/premiumGifted.json', JSON.stringify({}), (err) => {
                    if (err) console.error(err);
                });

                // Reset monthly shop
                userUpdates.monthlyshop = { type: "set", value: {} };
            };

            // Every 5 Minutes
            if ((now.getMinutes() % 5) === 0) {
                // Stampede Energy
                await updateUsersAndCache(client, "*", {
                    updates: {
                        stampedeenergy: { type: "increment", value: -1 },
                    },
                    condition: "stampedeenergy > 0",
                });
            };


            // Apply Updates
            if (Object.keys(userUpdates).length > 0) {
                await updateUsersAndCache(client, "*", { updates: userUpdates });
            };

        }, 60000), 60000 - (Date.now() % 60000));
    },
};

export default handler;
