import { ComponentType } from "discord.js";
import { userLevel, daysSince } from "../Modules/functions";
import { achievements } from "../Modules/achievements";
import { OfferRow } from "../Modules/components";
import { SlashCommand } from "../types";
import { getUserSchema, updateUsers } from "../Modules/queries";

function dailyCoinAmount(premium: number, xp: number, dailystreak: number) {
    let weight = 1;
    switch (premium) {
        case 1: weight = 1.2; break;
        case 2: weight = 1.5; break;
        case 3: weight = 2; break;
        case 4: weight = 2.5; break;
        case 5: weight = 3; break;
        case 6: weight = 4; break;
        case 7: weight = 6; break;
        default: false; break;
    };

    return Math.floor(weight * (400 + (Math.floor(userLevel(xp)) * 10) + (20 * dailystreak)));
};

function streakEmoji(dailystreak: number) {
    if (dailystreak < 3) return "";
    if (dailystreak < 7) return "<a:fire_y:936975489862623253>";
    if (dailystreak < 14) return "<a:fire_b:936975541058273370>";
    if (dailystreak < 30) return "<a:fire_m:936975577171259413>";
    return "<a:fire_p:936975620708134992>";
};

function saveCost(daysPassed: number) {
    let cost = 10;
    for (let i = 1; i < daysPassed; i++) {
        cost += i * 10;
    };
    return Math.min(Math.round(cost), 1000);
};

const exportCommand: SlashCommand = {
    name: 'daily',
    async execute({ interaction, author }) {

        const stats = author.schema;

        const now = new Date();
        const daysPassed = daysSince(stats.lastdaily ?? now);

        if (daysPassed === 0 && stats.lastdaily !== null) return interaction.reply({ content: `You have already claimed your daily. Come back in ${(23 - now.getHours()) ? `**${23 - now.getHours()}**h ` : ""}**${60 - now.getMinutes()}**min`, ephemeral: true });

        if (daysPassed === 1 || stats.lastdaily === null || stats.dailystreak < 1) {
            stats.dailystreak++;

            const dailyCoins = dailyCoinAmount(stats.premium, stats.xp, stats.dailystreak);

            await updateUsers(interaction.user.id, {
                coins: { type: "increment", value: dailyCoins },
                dailyclaimed: { type: "set", value: 1 },
                dailystreak: { type: "increment", value: 1 },
                lastdaily: { type: "set", value: new Date() }
            });

            // Achievements
            achievements[9].check(interaction, interaction.user, stats.dailystreak), achievements[10].check(interaction, interaction.user, stats.dailystreak), achievements[11].check(interaction, interaction.user, stats.dailystreak), achievements[12].check(interaction, interaction.user, stats.dailystreak); // Don't Stop Me Now

            return interaction.reply(`Added **${dailyCoins}** <:coins:872926669055356939> to your balance \n<:stars_v2:917023655840591963> Daily Streak: ${stats.dailystreak} ${streakEmoji(stats.dailystreak)}`);
        };

        // Save daily streak
        const cost = saveCost(daysPassed);
        return interaction.reply({ content: `You have missed a daily and are about to lose your daily streak of **${stats.dailystreak}** ${streakEmoji(stats.dailystreak)}\nWould you like to save it for **${cost}**<:genesis_gems:1034179687720681492>?`, components: [OfferRow], fetchReply: true }).then(msg => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 30000 });

            collector.on('collect', async (r) => {
                collector.stop();

                const stats = await getUserSchema(interaction.user.id);
                if (!stats) return;

                const now = new Date();
                const daysPassed = daysSince(stats.lastdaily ?? now);

                if (daysPassed === 0 && stats.lastdaily !== null) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`You have already claimed your daily. Come back in ${(23 - now.getHours()) ? `**${23 - now.getHours()}**h ` : ""}**${60 - now.getMinutes()}**min`);
                    return;
                }

                if (r.customId === "confirm") {
                    if (stats.gems < cost) {

                        if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough gems (**${stats.gems}**/${cost}<:genesis_gems:1034179687720681492>)`);
                        return;
                    }
                    stats.dailystreak++;
                } else {
                    stats.dailystreak = 1;
                };

                const dailyCoins = dailyCoinAmount(stats.premium, stats.xp, stats.dailystreak);

                await updateUsers(interaction.user.id, {
                    coins: { type: "increment", value: dailyCoins },
                    gems: { type: "increment", value: (r.customId === "confirm" ? -cost : 0) },
                    dailyclaimed: { type: "set", value: 1 },
                    dailystreak: { type: "set", value: stats.dailystreak },
                    lastdaily: { type: "set", value: new Date() }
                });

                // Achievements
                achievements[9].check(interaction, interaction.user, stats.dailystreak), achievements[10].check(interaction, interaction.user, stats.dailystreak), achievements[11].check(interaction, interaction.user, stats.dailystreak), achievements[12].check(interaction, interaction.user, stats.dailystreak); // Don't Stop Me Now

                if (interaction.channel?.isSendable()) return interaction.channel.send(`Added **${dailyCoins}** <:coins:872926669055356939> to your balance \n<:stars_v2:917023655840591963> Daily Streak: ${stats.dailystreak} ${streakEmoji(stats.dailystreak)}`);
            });
        });

    },
};

export default exportCommand;
