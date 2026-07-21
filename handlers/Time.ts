import fs from 'fs';
import { Client } from "discord.js";
import { BotHandler, UpdateUserOptions } from "../types";
import { getAuctionSchema, getAuctionWinner, getPlayerbaseStats, insertNewStampede, resetDailyResponses, resetDungeonLimit, transferCharacter, updateUsersAndCache } from '../Modules/queries';
import { isStampedeMonth } from '../Modules/functions';
import { activeAuctions, auctionChannelId, isEventOngoing } from '../Modules/components';
import { characters } from '../Modules/chars';

const handler: BotHandler = {
    name: "Time",
    once: true,
    execute: (client: Client) => {
        setTimeout(() => setInterval(async () => {
            const now = new Date();

            const userUpdates: UpdateUserOptions = {};

            // Daily
            if (now.getHours() === 0 && now.getMinutes() === 0) {
                // Fast daily reset
                await updateUsersAndCache(client, "*", {
                    updates: {
                        dailyclaimed: { type: "set", value: 0 },
                        dailies: { type: "set", value: {} },
                        feedlimit: { type: "set", value: 0 },
                        cow_rolled_today: { type: "set", value: 0 },
                    },
                });

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

            // Every 10 minutes
            if (now.getMinutes() % 10 === 0) {
                // Frostbound Yule Event
                // if (isEventOngoing()) {
                //     await updateUsersAndCache(client, "*", {
                //         updates: {
                //             perpetual_fire: { type: "increment", value: -1 }
                //         },
                //         condition: "perpetual_fire > 0",
                //     });
                // }

                // Auction End Check
                const auctions = activeAuctions.entries();
                for (const [auctionId, auctionEndDate] of auctions) {
                    if (auctionEndDate <= now) {
                        activeAuctions.delete(auctionId);

                        const auction = await getAuctionSchema(auctionId);
                        if (!auction) continue;

                        const winner = await getAuctionWinner(auctionId);
                        if (winner) {
                            const totalAmount = Math.ceil(winner.amount * 0.97);
                            const deductCoins = Math.min(totalAmount, winner.coins) || 0;
                            const deductBank = Math.max(0, totalAmount - deductCoins) || 0;
                            await updateUsersAndCache(client, winner.userid, {
                                updates: {
                                    coins: { type: "increment", value: -deductCoins },
                                    bank: { type: "increment", value: -deductBank },
                                    ...((auction.type === "char" && !auction.print) ? { chars: { type: "append", value: [auction.itemid] } } : {}),
                                },
                            });

                            // If VIP character, transfer to winner
                            if (auction.type === "char" && auction.print) {
                                await transferCharacter(winner.userid, auction.itemid, auction.print);
                            };

                            // Send auction end message
                            const chnl = client.channels.cache.get(auctionChannelId);
                            if (chnl?.isSendable()) {
                                chnl.send(`Congratulations <@${winner.userid}>, you have won the auction for **${characters[auction.itemid].name}**${auction.print ? `#${auction.print}` : ""}! <a:party:1516764283135066122>`);
                            };
                        };
                    };
                };
            };

            // Every 5 Minutes
            if ((now.getMinutes() % 5) === 0) {
                // Stampede Energy
                if (isStampedeMonth() && new Date().getDate() <= 7) {
                    await updateUsersAndCache(client, "*", {
                        updates: {
                            stampedeenergy: { type: "increment", value: -1 },
                        },
                        condition: "stampedeenergy > 0",
                    });
                };
            };


            // Apply Updates
            if (Object.keys(userUpdates).length > 0) {
                await updateUsersAndCache(client, "*", { updates: userUpdates });
            };

        }, 60000), 60000 - (Date.now() % 60000));
    },
};

export default handler;
