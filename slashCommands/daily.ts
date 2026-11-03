import { collectComponentUpdates } from "../Modules/buttonInteractions";
import { AttachmentBuilder, ComponentType } from "discord.js";
import { userLevel, daysSince, timeUntilMidnight } from "../Modules/functions";
import { achievements } from "../Modules/achievements";
import { isEventOngoing, OfferRow } from "../Modules/components";
import { getCalendarImage, getCalendarReward, CalendarReward } from "../Modules/calendar";
import { SlashCommand, CompactUserSchema, UpdateUserOptions } from "../types";
import { getUserSchema, updateUsersAndCache } from "../Modules/queries";

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
        default: break;
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

// Penalty grows 10, 20, 30... per missed day (starting on the 2nd missed day), capped at 1000 gems.
function saveCost(daysPassed: number) {
    let cost = 10;
    for (let i = 1; i < daysPassed; i++) {
        cost += i * 10;
    };
    return Math.min(cost, 1000);
};

// Turns the day's calendar reward into the same update object shape used by updateUsersAndCache.
// Coins and gems are intentionally omitted so the caller can sum them with the scaled daily payout
// and the streak-save debit instead of the spread overwriting those keys.
function calendarRewardUpdates(reward: CalendarReward): UpdateUserOptions {
    switch (reward.type) {
        case "ssshard": return { ssshard: { type: "increment", value: reward.amount } };
        case "sshard": return { sshard: { type: "increment", value: reward.amount } };
        case "ssticket": return { ssticket: { type: "increment", value: reward.amount } };
        case "sticket": return { sticket: { type: "increment", value: reward.amount } };
        case "ex": return { expulls: { type: "increment", value: reward.amount } };
        case "deluxe": return { items: { type: "merge_json", value: { [reward.itemid ?? 458]: reward.amount } } };
        default: return {};
    };
};

function calendarRewardLabel(reward: CalendarReward) {
    switch (reward.type) {
        case "coins": return `${reward.amount} <:coins:872926669055356939>`;
        case "gems": return `${reward.amount} <:genesis_gems:1034179687720681492>`;
        case "ssshard": return `${reward.amount} <:ss_shard:917203009543503892>`;
        case "sshard": return `${reward.amount} <:s_shard:917202925514817566>`;
        case "ssticket": return `${reward.amount} <:ss_ticket:927503239396622336>`;
        case "sticket": return `${reward.amount} <:s_ticket:927642487705722890>`;
        case "ex": return `${reward.amount}<a:EXTRA:1138530846144462968> Pull`;
        case "deluxe": return `${reward.amount} <:deluxe_chest:1069301259603026061>`;
    };
};

function dailyRewardMessage(dailyCoins: number, dailystreak: number, reward: CalendarReward) {
    return `Added **${dailyCoins}** <:coins:872926669055356939> to your balance \n<:stars_v2:917023655840591963> Daily Streak: ${dailystreak} ${streakEmoji(dailystreak)}\n> Daily Log-In Bonus: ${calendarRewardLabel(reward)}`;
};

// Builds the complete update set for a claim so the normal and streak-save paths grant identical
// rewards. Coins and gems are combined here (rather than through calendarRewardUpdates) so a single
// place owns the daily payout, the calendar bonus and the streak-save debit.
function claimUpdates(stats: CompactUserSchema, reward: CalendarReward, dailyCoins: number, newStreak: number, gemCost: number): UpdateUserOptions {
    return {
        coins: { type: "increment", value: dailyCoins + (reward.type === "coins" ? reward.amount : 0) },
        gems: { type: "increment", value: (reward.type === "gems" ? reward.amount : 0) - gemCost },
        dailyclaimed: { type: "set", value: 1 },
        dailystreak: { type: "set", value: newStreak },
        lastdaily: { type: "set", value: new Date() },

        ...calendarRewardUpdates(reward),
        ...(isEventOngoing() ? { perpetual_fire: { type: "increment", value: 10 } } : {}),
        ...(isEventOngoing() ? { perpetual_fragments: { type: "increment", value: 10 } } : {}),
        ...((isEventOngoing() && stats.perpetual_fire <= 0) ? { yule_chapter_failed: { type: "set", value: true } } : {}),
    };
};

// Idempotency guard: only claim when today's daily has not already been claimed. lastdaily is
// stored as local wall-clock time (node-postgres serializes Dates using local getters), so it is
// compared against the local midnight literal to avoid database timezone drift.
function localMidnight(now: Date) {
    const pad = (n: number) => `${n}`.padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} 00:00:00`;
};

const claimCondition = (midnight: string, extra?: string) => `${extra ? `${extra} AND ` : ""}(lastdaily IS NULL OR lastdaily < '${midnight}')`;

// The calendar render must never cost the player their daily, so a failure degrades to a text only reply.
async function calendarAttachment(now: Date): Promise<AttachmentBuilder[]> {
    try {
        return [await getCalendarImage(now)];
    } catch (error) {
        console.error("Failed to render daily calendar:", error);
        return [];
    };
};

const exportCommand: SlashCommand = {
    name: 'daily',
    async execute({ interaction, author }) {

        const stats = author.schema;

        const now = new Date();
        const daysPassed = daysSince(stats.lastdaily ?? now);
        const midnight = localMidnight(now);

        if (daysPassed === 0 && stats.lastdaily !== null) return interaction.reply({ content: `You have already claimed your daily. Come back in ${timeUntilMidnight(now)}`, ephemeral: true });

        if (daysPassed === 1 || stats.lastdaily === null || stats.dailystreak < 1) {
            const newStreak = stats.dailystreak + 1;

            const dailyCoins = dailyCoinAmount(stats.premium, stats.xp, newStreak);
            const reward = getCalendarReward(now.getDate());

            const applied = await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates: claimUpdates(stats, reward, dailyCoins, newStreak, 0),
                condition: claimCondition(midnight),
                evictCache: true,
            });

            if (applied === undefined) return interaction.reply({ content: "Something went wrong claiming your daily. Please try again shortly.", ephemeral: true });
            if (applied === 0) return interaction.reply({ content: `You have already claimed your daily. Come back in ${timeUntilMidnight(now)}`, ephemeral: true });

            // Achievements
            achievements[9].check(interaction, interaction.user, newStreak), achievements[10].check(interaction, interaction.user, newStreak), achievements[11].check(interaction, interaction.user, newStreak), achievements[12].check(interaction, interaction.user, newStreak); // Don't Stop Me Now

            return interaction.reply({ content: dailyRewardMessage(dailyCoins, newStreak, reward), files: await calendarAttachment(now) });
        };

        // Save daily streak
        const cost = saveCost(daysPassed);
        return interaction.reply({ content: `You have missed a daily and are about to lose your daily streak of **${stats.dailystreak}** ${streakEmoji(stats.dailystreak)}\nWould you like to save it for **${cost}**<:genesis_gems:1034179687720681492>?`, components: [OfferRow], fetchReply: true }).then(msg => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 30000 });

            collectComponentUpdates(collector, async (r) => {
                collector.stop();

                const freshStats = await getUserSchema(interaction.user.id);
                if (!freshStats) return;

                const now = new Date();
                const daysPassed = daysSince(freshStats.lastdaily ?? now);
                const midnight = localMidnight(now);

                if (daysPassed === 0 && freshStats.lastdaily !== null) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`You have already claimed your daily. Come back in ${timeUntilMidnight(now)}`);
                    return;
                };

                const saving = r.customId === "confirm";
                if (saving && freshStats.gems < cost) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough gems (**${freshStats.gems}**/${cost}<:genesis_gems:1034179687720681492>)`);
                    return;
                };

                const newStreak = saving ? freshStats.dailystreak + 1 : 1;
                const dailyCoins = dailyCoinAmount(freshStats.premium, freshStats.xp, newStreak);
                const reward = getCalendarReward(now.getDate());

                // Guard the claim and the debit atomically against the live row so a stale cached
                // balance can never grant twice or push gems negative.
                const applied = await updateUsersAndCache(interaction.client, interaction.user.id, {
                    updates: claimUpdates(freshStats, reward, dailyCoins, newStreak, saving ? cost : 0),
                    condition: claimCondition(midnight, saving ? `gems >= ${cost}` : undefined),
                    evictCache: true,
                });

                if (applied === undefined) {
                    if (interaction.channel?.isSendable()) interaction.channel.send("Something went wrong claiming your daily. Please try again shortly.");
                    return;
                };
                if (applied === 0) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`You have already claimed your daily. Come back in ${timeUntilMidnight(now)}`);
                    return;
                };

                // Achievements
                achievements[9].check(interaction, interaction.user, newStreak), achievements[10].check(interaction, interaction.user, newStreak), achievements[11].check(interaction, interaction.user, newStreak), achievements[12].check(interaction, interaction.user, newStreak); // Don't Stop Me Now

                if (interaction.channel?.isSendable()) return interaction.channel.send({ content: dailyRewardMessage(dailyCoins, newStreak, reward), files: await calendarAttachment(now) });
            });
        });

    },
};

export default exportCommand;
