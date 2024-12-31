import fs from 'fs';
import { Client } from "discord.js";
import { BotHandler } from "../types";
import { query } from '../db_handler';

const handler: BotHandler = {
    name: "Time",
    once: true,
    execute: (client: Client) => {
        setTimeout(() => setInterval(async () => {
            const now = new Date();

            // Daily
            if (now.getHours() === 0 && now.getMinutes() === 0) {

                // Daily Reset
                await query(`UPDATE users SET dailyclaimed = 0, dailies = '{}', feedlimit = 0, cow_rolled_today = 0`);

                // Reset Low Responses
                await query(`UPDATE dungeon SET responsetime = "" WHERE LENGTH(responsetime)/14 < 200`);

                // Start new Stampede
                if (now.getDate() === 14 && (now.getMonth() % 2) === 1) {
                    await query(`INSERT INTO stampedes (type, bosshp, bosshpmax, generalhp, generalhpmax, generalstotal, generalsleft, monsterstotal, monstersleft) values (0, 183728460, 183728460, 1582760, 1582760, 486, 486, 0, 0)`);
                };

                // Daily Stats
                const stats = await query(`SELECT lastpull FROM users`) as { lastpull: number; }[];
                const chnl = client.channels.cache.find(channel => channel.id === "1029507771567190017");
                if (chnl?.isTextBased()) chnl.send(`Servers: **${client.guilds.cache.size}**\nPlayers: **${stats.length}**\nActive: **${stats.filter((e) => now.getTime() - e.lastpull < 7 * 24 * 60 * 60 * 1000).length}**\nDaily: **${stats.filter((e) => now.getTime() - e.lastpull < 24 * 60 * 60 * 1000).length}**`);
            };

            // Weekly Reset
            if (now.getDay() === 0 && now.getHours() === 0 && now.getMinutes() === 0) {
                await query(`UPDATE users SET weeklyclaimed = 0`);
            };

            // Every 8 hours
            if (now.getHours() % 8 === 0 && now.getMinutes() === 0) {
                // Dungeon Reset
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
            };

            // Every 4 hours
            if (now.getHours() % 4 === 0 && now.getMinutes() === 0) {

            };

            // Every 2 hours
            if (now.getHours() % 2 === 0 && now.getMinutes() === 0) {
                // Bosshunt Reset
                await query(`UPDATE users SET bosshuntruns = bosshuntruns - 1 WHERE bosshuntruns > 0`);
            };

            // Monthly
            if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
                // Reset Premium Gifts
                fs.writeFile('Storage/premiumGifted.json', JSON.stringify({}), (err) => {
                    if (err) console.error(err);
                });

                // Reset monthly shop
                await query(`UPDATE users SET monthlyshop = "{}"`);
            };

            // Every 5 Minutes
            if ((now.getMinutes() % 5) === 0) {
                // Stampede Energy
                await query(`UPDATE users SET stampedeenergy = stampedeenergy - 1 WHERE stampedeenergy > 0`);
            };

        }, 60000), 60000 - (Date.now() % 60000));
    },
};

export default handler;
