import fs from 'fs';
import { Client } from "discord.js";
import { BotHandler, UpdateUserOptions } from "../types";
import { getAuctionSchema, getAuctionWinner, getPlayerbaseStats, insertNewStampede, removeExpiredMail, resetDailyResponses, resetDungeonLimit, transferCharacter, updateUsersAndCache, /*deleteExpiredWorldBosses, getGlobalWorldBoss, insertGlobalWorldBoss, deleteGlobalWorldBoss, getMinimalUserSchemas*/ } from '../Modules/queries';
import { isStampedeMonth, formatNumberWithQuotes } from '../Modules/functions';
import { activeAuctions, auctionChannelId, isEventOngoing } from '../Modules/components';
import { characters } from '../Modules/chars';
import { startRollingCow } from '../Modules/rollingCowEvent';
import { sendEventStartMail } from '../Modules/eventMail';
import { query } from '../postgres';
// import { worldBosses, GLOBAL_BOSS_HP, GLOBAL_BOSS_CHANNEL_ID } from '../Modules/worldBoss';
// import { posWorldBossModifiers, negWorldBossModifiers } from '../Modules/worldBossModifiers';
// import { items } from '../Modules/items';
// import { EmbedBuilder } from 'discord.js';

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

                // Announce Stampede when it becomes available at the start of its month.
                if (now.getDate() === 1 && isStampedeMonth()) {
                    await sendEventStartMail(client, "Stampede");
                };

                // Start Rolling Cow on the first day of alternating months.
                if (now.getDate() === 1 && !isStampedeMonth()) {
                    await startRollingCow(client);
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
            // if (now.getHours() % 4 === 0 && now.getMinutes() === 0) {
            //     // World Boss Attempt Regeneration (+1, cap 12)
            //     await updateUsersAndCache(client, "*", {
            //         updates: {
            //             worldboss_attempts: { type: "increment", value: 1 },
            //         },
            //         condition: "worldboss_attempts < 12",
            //     });

            //     // Delete expired world bosses
            //     await deleteExpiredWorldBosses();
            // };

            // Every 2 hours
            if (now.getHours() % 2 === 0 && now.getMinutes() === 0) {
                // Bosshunt Reset
                await updateUsersAndCache(client, "*", {
                    updates: {
                        bosshuntruns: { type: "increment", value: -1 },
                    },
                    condition: "bosshuntruns > 0",
                });

                // Global World Boss
                //     const globalBoss = await getGlobalWorldBoss();
                //     const bossChannel = client.channels.cache.get(GLOBAL_BOSS_CHANNEL_ID);

                //     if (globalBoss) {
                //         if (globalBoss.status === "defeated") {
                //             // Distribute rewards
                //             const participation = globalBoss.participation;
                //             const totalDamage = Object.values(participation).reduce((acc, [dmg]) => acc + (dmg ?? 0), 0);
                //             const baseCoins = 10000;

                //             // Build gadget pool (6 unique, 3 legendary, 2 mythical, 1 genesis)
                //             const wb = worldBosses[globalBoss.enemy_id];
                //             const pool = [
                //                 ...Array(6).fill({ tier: 0, itemId: wb.gadgets[0] }),
                //                 ...Array(3).fill({ tier: 1, itemId: wb.gadgets[1] }),
                //                 ...Array(2).fill({ tier: 2, itemId: wb.gadgets[2] }),
                //                 { tier: 3, itemId: wb.gadgets[3] },
                //             ];

                //             // Eligible participants (sorted by damage desc)
                //             const eligible = Object.entries(participation)
                //                 .map(([uid, data]) => ({ uid, damage: data[0] ?? 0 }))
                //                 .filter(p => p.damage > 0)
                //                 .sort((a, b) => b.damage - a.damage);

                //             // Distribute pool items (rarest first), each participant wins at most one
                //             const winners = new Map<string, number>(); // uid → itemId
                //             const poolCopy = [...pool].sort((a, b) => b.tier - a.tier);
                //             const remaining = [...eligible];

                //             for (const item of poolCopy) {
                //                 if (remaining.length === 0) break;
                //                 const totalDmg = remaining.reduce((s, p) => s + p.damage, 0);
                //                 let roll = Math.random() * totalDmg;
                //                 let chosen = remaining[remaining.length - 1];
                //                 for (const p of remaining) {
                //                     roll -= p.damage;
                //                     if (roll <= 0) { chosen = p; break; }
                //                 }
                //                 winners.set(chosen.uid, item.itemId);
                //                 remaining.splice(remaining.indexOf(chosen), 1);
                //             }

                //             // Get user names for announcements
                //             const allUserIds = [...winners.keys()];
                //             const userNames = new Map<string, string>();
                //             if (allUserIds.length > 0) {
                //                 const users = await getMinimalUserSchemas(allUserIds);
                //                 for (const u of users) userNames.set(u.id, u.name);
                //             }

                //             // Send mails
                //             for (const [userId, data] of Object.entries(participation)) {
                //                 const damage = data[0] ?? 0;
                //                 if (damage <= 0) continue;
                //                 const share = totalDamage > 0 ? damage / totalDamage : 0;
                //                 const coins = Math.max(Math.floor(baseCoins * share), 100);

                //                 const typeParts = ["2"];
                //                 let rewards = `coins|${coins}`;
                //                 if (winners.has(userId)) {
                //                     typeParts.push("8");
                //                     rewards += `,item|${winners.get(userId)}|1`;
                //                 }

                //                 const droppedItem = winners.has(userId) ? items[winners.get(userId)!] : null;
                //                 const mail = {
                //                     type: typeParts.join(","),
                //                     rewards,
                //                     message: `### Global World Boss Defeated!\n**${wb.name}** has been defeated!\n\nYou dealt **${formatNumberWithQuotes(damage)}** damage and earned **${formatNumberWithQuotes(coins)}** <:coins:872926669055356939>${droppedItem ? `\nYou received ${droppedItem.emoji} **${droppedItem.name}**!` : ""}`,
                //                     date: Date.now(),
                //                 };

                //                 await updateUsersAndCache(client, userId, {
                //                     updates: { mailbox: { type: "append", value: [mail] } },
                //                 });
                //             }

                //             // Announce myth/genesis drops in channel
                //             const mythGenesisWinners = [...winners.entries()]
                //                 .filter(([_, itemId]) => items[itemId].grade === "mythical" || items[itemId].grade === "genesis");

                //             if (bossChannel?.isSendable()) {
                //                 let desc = `### Global World Boss Defeated!\n**${wb.name}** has been defeated!\n\nRewards have been sent to all **${Object.keys(participation).length}** participants via mail.`;
                //                 if (mythGenesisWinners.length > 0) {
                //                     desc += `\n\n**Rare Drops:**\n`;
                //                     for (const [uid, itemId] of mythGenesisWinners) {
                //                         const item = items[itemId];
                //                         const name = userNames.get(uid) ?? "Unknown";
                //                         desc += `${item.emoji} **${item.name}** (${item.grade}) — ${name}\n`;
                //                     }
                //                 }
                //                 bossChannel.send({
                //                     embeds: [new EmbedBuilder()
                //                         .setColor(0x2ecc71)
                //                         .setDescription(desc)
                //                     ]
                //                 });
                //             }

                //             await deleteGlobalWorldBoss();
                //         } else if (globalBoss.expires_at.getTime() <= Date.now()) {
                //             // Expired, delete
                //             await deleteGlobalWorldBoss();
                //         }
                //         // else: still alive, skip
                //     } else {
                //         // Spawn new global boss
                //         const wbIndex = Math.floor(Math.random() * worldBosses.length);
                //         const wb = worldBosses[wbIndex];
                //         const posMod = posWorldBossModifiers[Math.floor(Math.random() * posWorldBossModifiers.length)];
                //         const negMod = negWorldBossModifiers[Math.floor(Math.random() * negWorldBossModifiers.length)];
                //         const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

                //         const boss = await insertGlobalWorldBoss(wbIndex, GLOBAL_BOSS_HP, "A-", expiresAt, posMod.id, negMod.id);

                //         if (boss && bossChannel?.isSendable()) {
                //             bossChannel.send({
                //                 embeds: [new EmbedBuilder()
                //                     .setColor(wb.accentColor as any)
                //                     .setTitle("Global World Boss Spawned!")
                //                     .setDescription(`### ${wb.name}\n**HP**: ${formatNumberWithQuotes(GLOBAL_BOSS_HP)}\n**Duration**: 2 hours\n\n${posMod.emoji} **${posMod.name}**: ${posMod.description}\n${negMod.emoji} **${negMod.name}**: ${negMod.description}\n\nUse \`/world-boss\` to join the fight!`)
                //                     .setThumbnail(wb.enemy.image[0])
                //                 ]
                //             });
                //         }
                //     }
                // };

                // Monthly
                if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
                    // Reset Premium Gifts
                    fs.writeFile('Storage/premiumGifted.json', JSON.stringify({}), (err) => {
                        if (err) console.error(err);
                    });

                    // Reset monthly shop
                    userUpdates.monthlyshop = { type: "set", value: {} };

                    // Remove mails older than 30 days
                    await removeExpiredMail(client);
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

            }
        }, 60000), 60000 - (Date.now() % 60000));
    },
};

export default handler;
