import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle, ChatInputCommandInteraction, ColorResolvable, TextInputBuilder, TextInputStyle, ModalBuilder, StringSelectMenuBuilder, SelectMenuComponentOptionData } from "discord.js";
import { abilities, Ability } from "../Modules/abilities";
import { classes } from "../Modules/classes";
import { curses } from "../Modules/curses";
import { raids } from "../Modules/raids";
import { armorInfo, itemInfo, items, ringInfo, runeInfo, weaponInfo } from "../Modules/items";
import { skills } from "../Modules/skills";
import { characters } from "../Modules/chars";
import { getDetailedStats, customEmojis, dealDamage, getClassLvl, getRingSlotsTotal, search, getLetterRank, formatNumberWithQuotes } from "../Modules/functions";
import { AbilityResponse, dungeonTempBan, raidRankIndices, raidRankLetters } from "../Modules/components";
import delayedBuffs from "../Modules/delayedBuffs";
import Avalon from "../Modules/avalon";
import buffInfo from "../Modules/buffs";
import _ from 'lodash';
import { CompactUserSchema, DetailedStats, GuildSchema, RaidRank, RaidSchema, SlashCommand } from '../types';
import { cancelRaid, getGuildSchema, getLatestRaid, getRaidByRaidRowId, getUserSchemas, getWeaponSchemas, insertNewRaid, updateGuilds, updateRaidEnded, updateRaidParticipation, updateRaidPhase, updateUsers } from '../Modules/queries';
import { skillTree } from '../Modules/skillTree';
import { customHpBars } from '../Modules/customHpBars';

const dungeonInProgress = new Set();

//! FOR THE BETA ONLY: 20
const DAILY_RAID_ATTEMPTS = 4 as const;
//! FOR THE BETA ONLY: 20

const FIGHT_DURATION = 240; // in seconds
const MAX_ROUNDS = 120; // max rounds per fight


function getRaidButtonRow(tab: string, canPlay: boolean, raidHasEnded: boolean, isTestRun: boolean): ActionRowBuilder<ButtonBuilder> {
    const buttons = [
        new ButtonBuilder()
            .setCustomId('play')
            .setLabel(isTestRun ? "Test Run" : (raidHasEnded ? "Raid has Ended!" : "Start Battle"))
            .setStyle(ButtonStyle.Danger)
            .setDisabled(isTestRun === false && (!canPlay || raidHasEnded)),
        new ButtonBuilder()
            .setCustomId('ranking')
            .setLabel(tab === "overview" ? "Show Ranking" : "Show Overview")
            .setStyle(ButtonStyle.Primary),
    ];

    if (tab === "overview") {
        buttons.push(
            new ButtonBuilder()
                .setCustomId('ignore_defer-edit')
                .setLabel(`Edit Support`)
                .setStyle(ButtonStyle.Secondary)
        );
    };

    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(...buttons);
};

function getModal(uid: string) {
    return new ModalBuilder()
        .setCustomId('edit_raid_' + uid)
        .setTitle('Edit Raid Support')
        .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('support1')
                    .setLabel("Support Character 1")
                    .setStyle(TextInputStyle.Short)
                    // .setMinLength(16)
                    // .setMaxLength(20)
                    .setPlaceholder('E.g. Luminous EX (type "remove" to remove)')
                    .setRequired(false)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('support2')
                    .setLabel("Support Character 2")
                    .setStyle(TextInputStyle.Short)
                    // .setMinLength(16)
                    // .setMaxLength(20)
                    .setPlaceholder('E.g. Acheron EX (type "remove" to remove)')
                    .setRequired(false)
            ),
        );
};

const timeLeft = (endDate: Date) => {
    const daysLeft = Math.floor((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor(((endDate.getTime() - Date.now()) / (1000 * 60 * 60)) % 24);
    const minutesLeft = Math.floor(((endDate.getTime() - Date.now()) / (1000 * 60)) % 60);
    let timeLeft = "";
    if (daysLeft > 0) timeLeft += `${daysLeft}d `;
    if (hoursLeft > 0) timeLeft += `${hoursLeft}h `;
    if (minutesLeft > 0) timeLeft += `${minutesLeft}m`;
    return timeLeft;
};

async function raidSelection(interaction: ChatInputCommandInteraction, stats: CompactUserSchema, guild: GuildSchema): Promise<void> {

    const members = await getUserSchemas(guild.members);
    const atkBuff = 1 + (0.2 * guild.atkbuff);
    const hpBuff = 1 + (0.2 * guild.hpbuff);
    const defBuff = 1 + (0.1 * guild.defbuff);
    const guildRankScore = Math.floor((members.reduce((acc, curr) => acc + curr.rankscore, 0) * atkBuff * hpBuff * defBuff) / 20);
    const guildRankIndex = raidRankIndices[getLetterRank(guildRankScore)];

    let options: SelectMenuComponentOptionData[] = [];
    raids.filter((e) => e.phase === 1).sort((a, b) => a.rankValue - b.rankValue).forEach((e) => {
        options.push({
            label: e.name,
            emoji: guildRankIndex > raidRankIndices[e.rank] ? "🟢" : (guildRankIndex === raidRankIndices[e.rank] ? "🟠" : ((guildRankIndex + 3) >= raidRankIndices[e.rank] ? "🔴" : "⚫")),
            description: `Rank ${e.rank}`,
            value: e.id + "",
        });
    });

    const selection = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('raid_selection')
                .setPlaceholder('Select a raid...')
                .addOptions(options),
        );

    let currentlySelected: number | undefined;
    let currentRankUp = 0;

    function getButtonRow() {
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel(`Confirm`)
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(currentlySelected === undefined),
            ).addComponents(
                new ButtonBuilder()
                    .setCustomId('rankup')
                    .setLabel(`Increase Rank`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentlySelected === undefined),
            );
    };

    function getDesc() {
        const raidRewards = currentlySelected !== undefined ? getRaidRewardPool(raidRankLetters[raids[currentlySelected].rankValue + currentRankUp], 20, 1) : undefined;
        return `## Raid Selection\nPlease select a raid to tackle with your guild. You will have **5** days to complete it, with each of your members getting **4** attempts per day. Attempts can be stacked, so busy guild members can do all 20 on the last day if needed!` +
            `\n\n**Selected Raid**: ${(currentlySelected !== undefined && raidRewards) ? `${raids[currentlySelected].name} (${raids[currentlySelected].phasesTotal} ${raids[currentlySelected].phasesTotal === 1 ? "phase" : "phases"})\n**Total HP**: ${formatNumberWithQuotes(raids[currentlySelected].getTotalRankHp(raidRankLetters[raids[currentlySelected].rankValue + currentRankUp]))} <:HP:1062043800979116143>\n**Recommended Rank**: ${raidRankLetters[raids[currentlySelected].rankValue + currentRankUp]}\n### Reward Pool:\n>>> -# **${formatNumberWithQuotes(raidRewards.coins)}x** <:coins:872926669055356939>\n-# **${formatNumberWithQuotes(raidRewards.guild_marks)}x** <:guild_mark:1317944450814840923>\n-# **${formatNumberWithQuotes(raidRewards.skill_points)}x** <:skill_point:1351505460301136014>\n-# **${formatNumberWithQuotes(raidRewards.glorious_chest)}x** <:glorious_chest:1069076067081539726>\n-# **${formatNumberWithQuotes(raidRewards.luxurious_chest)}x** <:luxurious_chest:1069300112364404817>\n-# **${formatNumberWithQuotes(raidRewards.royal_chest)}x** <:royal_chest:1069301128711376976>${raidRewards.deluxe_chest > 0 ? `\n-# **${formatNumberWithQuotes(raidRewards.deluxe_chest)}x** <:deluxe_chest:1069301259603026061>` : ""}\n-# **${formatNumberWithQuotes(raidRewards.featured_ring)}x** ${raids[currentlySelected ?? 0].loot.map((e) => items[e].emoji).join(" | ")}` : "`None`"}`;
    };

    const Embed = new EmbedBuilder()
        .setColor(0xff3838)
        .setDescription(getDesc());
    interaction.reply({ embeds: [Embed], components: [selection, getButtonRow()] }).then((msg) => {

        const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "raid_selection", componentType: ComponentType.StringSelect, time: 120000 });
        const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 120000 });
        const rankup = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "rankup", componentType: ComponentType.Button, time: 120000 });

        collector.on('collect', async r => {
            await r.deferUpdate().catch(() => {
                console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}"`);
            });

            currentlySelected = parseInt(r.values[0]);
            currentRankUp = 0;

            Embed
                .setDescription(getDesc())
                .setThumbnail(raids[currentlySelected].enemy.image[0])
                .setColor(raids[currentlySelected].accentColor as ColorResolvable);
            interaction.editReply({ embeds: [Embed], components: [selection, getButtonRow()] });
        });

        confirm.on('collect', async () => {
            collector.stop(); confirm.stop(); rankup.stop();

            if (currentlySelected === undefined) return interaction.followUp({ content: "Please select a raid first", ephemeral: true });

            const raid = await getLatestRaid(guild.id);

            if (!raid) {
                const newRaid = await insertNewRaid(guild.id, currentlySelected, raids[currentlySelected].getRankHp(raidRankLetters[raids[currentlySelected].rankValue + currentRankUp]), raidRankLetters[raids[currentlySelected].rankValue + currentRankUp]);
                if (newRaid) {
                    interaction.followUp({ content: "Raid started successfully!" });
                } else {
                    interaction.followUp({ content: "Failed to start raid, please try again later" });
                };
                interaction.editReply({ components: [] });
            } else {
                interaction.followUp({ content: "You already have an active raid, please finish it before attempting to start a new one.", ephemeral: true });
            };
        });

        rankup.on('collect', async () => {
            if (currentlySelected === undefined) return interaction.followUp({ content: "Please select a raid first", ephemeral: true });

            // Check if rank is maxed
            if ((raids[currentlySelected].rankValue + currentRankUp + 1) > raids[currentlySelected].maxRankValue) {
                return interaction.followUp({ content: "You have already reached the maximum rank for this raid", ephemeral: true });
            };

            // Increment rank
            currentRankUp++;

            // Update embed
            Embed.setDescription(getDesc());
            interaction.editReply({ embeds: [Embed], components: [selection, getButtonRow()] });
        });

    });
};

function raidOverview({ interaction, stats, guild, raid, userItems, isTestRun, testBoss }: { interaction: ChatInputCommandInteraction, stats: CompactUserSchema, guild: GuildSchema, raid: RaidSchema, userItems: itemInfo[], isTestRun: boolean, testBoss: string | null; }): Promise<number> {
    return new Promise((resolve) => {

        const isTestBoss = isTestRun && testBoss !== null;

        const currentRaid = isTestBoss ? raids[parseInt(testBoss)] : raids[raid.raidid];
        if (!currentRaid) return interaction.reply("Unexpected Error: Raid not found\nPlease open a ticket in our `/support` server if you encounter this error.");

        const startDate = new Date(raid.start_date);
        const endDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);

        // const tips = [
        //     "You can take the exam as many times as you want!",
        // ];

        let tab: "overview" | "ranking" = "overview";

        const attemptsUsed = raid.participation[interaction.user.id]?.[1] ?? 0;
        const attemptsTotal = Math.min(5, Math.floor((Date.now() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1) * DAILY_RAID_ATTEMPTS;

        const attemptsLeft = attemptsTotal - attemptsUsed;

        const getDesc = (): string => {
            if (tab === "overview") {
                return `### Raid Overview`
                    // + `\nAfter the exam you will be assigned a rank based on your performance.`
                    + `\n**Enemy**: ${currentRaid.enemy.name} [${isTestBoss ? "EX+" : raid.rank_letter}] (phase ${currentRaid.phase}/${currentRaid.phasesTotal})\n**Progress**: **${formatNumberWithQuotes(Math.max(0, isTestBoss ? currentRaid.getRankHp("EX+") : raid.enemy_hp))}**/${formatNumberWithQuotes(isTestBoss ? currentRaid.getRankHp("EX+") : raid.enemy_hpmax)} <:HP:1062043800979116143> (${timeLeft(endDate)} left)`
                    + `\n\n**Traits**\n- ${currentRaid.enemy.ability?.list[0].join("\n- ")}`
                    // + `\n\n**Stats**\n**Current Rank**: ${stats.rank}\n**Highest Score**: ${stats.rankscore ? formatNumberWithQuotes(stats.rankscore) : "--"}`
                    + `\n\n**Build**\n**Character**: ${characters[stats.battlechar ?? -1].name} Lvl. ${stats.level}\n**Class**: ${stats.class !== null ? classes[stats.class].name + classes[stats.class].emblem + `Lvl. ${getClassLvl(stats.class, stats.dungeon_classlevels)}` : "`None`"}`
                    + `\n**Equipment**: ${userItems.find((e) => e.category === "weapon" && e.type !== "shield")?.emoji ?? "<:sword_empty:1034502134474997790>"}${userItems.find((e) => e.type === "shield")?.emoji ?? "<:shield_empty:1087089686809415730>"} ${userItems.find((e) => e.type === "helmet")?.emoji ?? "<:helmet_empty:1034499888878198885>"}${userItems.find((e) => e.type === "cuirass")?.emoji ?? "<:cuirass_empty:1034499890165858305>"}${userItems.find((e) => e.type === "gloves")?.emoji ?? "<:gloves_empty:1034499892409794570>"}${userItems.find((e) => e.type === "boots")?.emoji ?? "<:boots_empty:1034499893919764480>"}`

                    + `\n**Items**: ${stats.equipment[`rune:${stats.battlechar}`] === undefined ? "<:rune_empty:1034507494539669635>" : items[parseInt(stats.equipment[`rune:${stats.battlechar}`])].emoji} `
                    + userItems.filter((e) => e.category === "ring").map((e) => e.emoji).concat(
                        Array(Math.max(0, getRingSlotsTotal(stats) - userItems.filter((e) => e.category === "ring").length)).fill("<:ring_empty:1034509903886299136>")
                    ).concat(["<:locked:1034511902417621002>", "<:locked:1034511902417621002>", "<:locked:1034511902417621002>"]).slice(0, 3).join("")

                    + (raidRankIndices[getLetterRank(stats.rankscore)] < raidRankIndices["B"] ? "\n**Support 1**: <:locked:1034511902417621002> (unlocks after reaching rank **B**)" : `\n**Support 1**: ${(stats.raid_supports[0] !== undefined && stats.raid_supports[0] !== null) ? `${characters[stats.raid_supports[0]].name}${stats.equipment[`rune:${stats.raid_supports[0]}`] === undefined ? "" : (" " + items[parseInt(stats.equipment[`rune:${stats.raid_supports[0]}`])].emoji)}` : "`None`"}`)
                    + (raidRankIndices[getLetterRank(stats.rankscore)] < raidRankIndices["S"] ? "\n**Support 2**: <:locked:1034511902417621002> (unlocks after reaching rank **S**)" : `\n**Support 2**: ${(stats.raid_supports[1] !== undefined && stats.raid_supports[1] !== null) ? `${characters[stats.raid_supports[1]].name}${stats.equipment[`rune:${stats.raid_supports[1]}`] === undefined ? "" : (" " + items[parseInt(stats.equipment[`rune:${stats.raid_supports[1]}`])].emoji)}` : "`None`"}`)
                    + `\n\n-# Attempts left: ${attemptsLeft}/${attemptsTotal}`;
                // + `\n\n-# <:info:1131679799207796756> ${tips[Math.floor(Math.random() * tips.length)]}`;
            } else if (tab === "ranking") {
                return `### Raid Ranking`
                    + `\n${Object.keys(raid.participation).length ? Object.entries(raid.participation)
                        .sort(([, a], [, b]) => b[0] - a[0]) // Sort by damage dealt (first element in value array)
                        .map(([userId, [damage, rounds]], i) => `-# ${i + 1}. <@${userId}> - **${formatNumberWithQuotes(damage)}** damage in **${rounds}**/${attemptsTotal} attempts`)
                        .join('\n') : `-# No participants yet`}`
                    + `\n\n-# Attempts left: ${attemptsLeft}/${attemptsTotal}`;
            };

            return "";
        };

        const Embed = new EmbedBuilder()
            .setColor(0xff3838)
            .setThumbnail(currentRaid.enemy.image[0])
            .setDescription(getDesc());
        interaction.reply({ embeds: [Embed], components: [getRaidButtonRow(tab, isTestRun || attemptsLeft > 0, raid.enemy_hp <= 0, isTestRun)] }).then((msg) => {
            const play = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "play", componentType: ComponentType.Button, time: 90000 });
            const ranking = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ranking", componentType: ComponentType.Button, time: 90000 });
            const edit = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ignore_defer-edit", componentType: ComponentType.Button, time: 90000 });

            play.on('collect', () => {
                if (dungeonInProgress.has(stats.id)) {
                    if (interaction.channel?.isSendable()) interaction.channel.send("You already have a fight in progress, please finish it before attempting to start a new one.");
                    return;
                };

                resolve(1);
                play.stop();
            });

            ranking.on('collect', () => {
                tab = (tab === "overview") ? "ranking" : "overview";
                interaction.editReply({ embeds: [Embed.setDescription(getDesc())], components: [getRaidButtonRow(tab, isTestRun || attemptsLeft > 0, raid.enemy_hp <= 0, isTestRun)] });
            });

            edit.on('collect', (rr) => {
                const uid = Math.random().toString(36).substring(2, 15);
                rr.showModal(getModal(uid));

                interaction.awaitModalSubmit({ filter: (r) => r.customId === ('edit_raid_' + uid), time: 90000 }).then(async (r) => {
                    const support1 = r.fields.getTextInputValue('support1');
                    const support2 = r.fields.getTextInputValue('support2');

                    // Match character
                    if (support1) {
                        let getChar = search(support1, stats.chars, interaction, true);
                        if (getChar?.name) {
                            if (!stats.chars.includes(getChar.id)) return r.reply({ content: `You don't have a copy of **${getChar.name}**`, ephemeral: true });
                            if (stats.battlechar === getChar.id) return r.reply({ content: `You can't use your equipped character as a support!`, ephemeral: true });
                            stats.raid_supports[0] = getChar.id;
                        };
                        if (support1 === "remove") stats.raid_supports.shift();
                    };

                    if (support2) {
                        let getChar = search(support2, stats.chars, interaction, true);
                        if (getChar?.name) {
                            if (!stats.chars.includes(getChar.id)) return r.reply({ content: `You don't have a copy of **${getChar.name}**`, ephemeral: true });
                            if (stats.battlechar === getChar.id) return r.reply({ content: `You can't use your equipped character as a support!`, ephemeral: true });
                            if (stats.raid_supports[0] !== 0) stats.raid_supports[1] = getChar.id;
                            else stats.raid_supports[0] = getChar.id;
                        };
                        if (support2 === "remove") stats.raid_supports.pop();
                    };

                    // Update users table
                    await updateUsers(interaction.user.id, {
                        raid_supports: { type: "set", value: stats.raid_supports },
                    });

                    interaction.editReply({ embeds: [Embed.setDescription(getDesc())] });
                    r.reply({ content: `Edited Successfully!`, ephemeral: true });
                });
            });

            play.on('end', () => {
                edit.stop(); ranking.stop();
                resolve(-1);
            });
        });

    });
};

type RaidRewards = {
    coins: number;
    guild_marks: number;
    skill_points: number;
    featured_ring: number;
    glorious_chest: number;
    luxurious_chest: number;
    royal_chest: number;
    deluxe_chest: number;
};

const raidRewards: Record<string, RaidRewards> = {
    "C-": {
        coins: 200000,       // 5% = 10000
        guild_marks: 1000,   // 5% =    50
        skill_points: 40,    // 5% =     2
        featured_ring: 3,    // 5% =     0.15
        glorious_chest: 60,  // 5% =     3
        luxurious_chest: 20, // 5% =     1
        royal_chest: 6,      // 5% =     0.3
        deluxe_chest: 0,     // 5% =     0
    },
    "B-": {
        coins: 300000,
        guild_marks: 1500,
        skill_points: 60,
        featured_ring: 4.5,
        glorious_chest: 90,
        luxurious_chest: 30,
        royal_chest: 9,
        deluxe_chest: 0,
    },
    "A-": {
        coins: 400000,
        guild_marks: 2000,
        skill_points: 80,
        featured_ring: 6,
        glorious_chest: 120,
        luxurious_chest: 40,
        royal_chest: 12,
        deluxe_chest: 4, // 5% = 0.2
    },
    "S-": {
        coins: 500000,
        guild_marks: 2500,
        skill_points: 100,
        featured_ring: 9,
        glorious_chest: 150,
        luxurious_chest: 50,
        royal_chest: 15,
        deluxe_chest: 6,
    },
    "SS-": {
        coins: 600000,
        guild_marks: 3000,
        skill_points: 120,
        featured_ring: 12,
        glorious_chest: 180,
        luxurious_chest: 60,
        royal_chest: 18,
        deluxe_chest: 8,
    },
    "SSS-": {
        coins: 700000,
        guild_marks: 3500,
        skill_points: 140,
        featured_ring: 15,
        glorious_chest: 210,
        luxurious_chest: 70,
        royal_chest: 21,
        deluxe_chest: 10,
    },
    "EX-": {
        coins: 800000,
        guild_marks: 4000,
        skill_points: 160,
        featured_ring: 18,
        glorious_chest: 240,
        luxurious_chest: 80,
        royal_chest: 24,
        deluxe_chest: 12,
    },
} as const;

function getRaidRewardPool(rank: RaidRank, participants: number, sumOfShares: number) {
    const indexValue = raidRankIndices[rank];

    const baseline = Math.max(9, Math.floor(indexValue / 3) * 3);
    const offset = indexValue % 3;

    // Copy the pool
    const rewardPool = _.cloneDeep(raidRewards[raidRankLetters[baseline]]);

    // Adjust the reward pool based on the number of participants
    const multiplier = (participants / 20); // * sumOfShares; // (1 + (0.15 * offset)) * (participants / 20) * sumOfShares;
    for (const key in rewardPool) {
        if (Object.prototype.hasOwnProperty.call(rewardPool, key)) {
            const rawAmount = (rewardPool[key as keyof typeof rewardPool] + (raidRewards["C-"][key as keyof typeof rewardPool] * (0.15 * offset))) * multiplier;
            rewardPool[key as keyof typeof rewardPool] = Math.floor(rawAmount + (((rawAmount % 1) > Math.random()) ? 1 : 0));
        };
    };

    return rewardPool;
};

const endedRaids = new Set();

async function endRaid(raidRowId: number, equalRewardDistribution: boolean) {

    // Make sure to only send rewards once
    if (endedRaids.has(raidRowId)) return;
    endedRaids.add(raidRowId);
    setTimeout(() => {
        endedRaids.delete(raidRowId);
    }, 10 * 60 * 1000);

    // Fetch Raid
    const raid = await getRaidByRaidRowId(raidRowId);
    if (!raid) return;
    if (raid.end_date) return;

    // End raid
    await updateRaidEnded(raidRowId);

    // Distribute Rewards
    const totalPoints = Object.values(raid.participation).reduce((acc, [points]) => acc + points, 0);
    const players = Object.entries(raid.participation).map((e) => ({
        id: e[0],
        points: e[1][0],
        rounds: e[1][1],
        rank: 0,
        /**
         * Capped between 0.025 and 0.1
         */
        share: Math.min(Math.max(
            equalRewardDistribution
                ? (1 / Object.entries(raid.participation).length)
                : e[1][0] / totalPoints
            , 0.025), 0.1),
        percentile: 0,
        rewards: { coins: 0, guild_marks: 0, skill_points: 0, featured_ring: 0, glorious_chest: 0, luxurious_chest: 0, royal_chest: 0, deluxe_chest: 0 }
    }));

    // Calculate percentiles
    players.sort((a, b) => b.points - a.points);
    for (let i = 0; i < players.length; i++) {
        players[i].percentile = (players[i - 1]?.percentile ?? 0) + players[i].share;
        players[i].rank = i + 1;
    };

    // Const reward pool
    const sumOfShares = players.reduce((acc, player) => acc + player.share, 0);
    const rewardPool = getRaidRewardPool(raid.rank_letter, players.length, sumOfShares);
    const remainingRewards = _.cloneDeep(rewardPool);

    // Distribute rewards
    for (const player of players) {
        Object.entries(player.rewards).forEach(([key, value]) => {
            const shareReward = Math.floor(player.share * (1 / sumOfShares) * rewardPool[key as keyof typeof rewardPool]);
            if (shareReward) {
                player.rewards[key as keyof typeof player.rewards] += shareReward;
                remainingRewards[key as keyof typeof remainingRewards] -= shareReward;
            };
        });
    };

    // Distribute remaining rewards
    for (let [key, value] of Object.entries(remainingRewards)) {
        if (value >= 1) {
            let maxIterations = players.length;
            while (value >= 1 && maxIterations > 0) {
                const weightedRandomNumber = Math.random() * sumOfShares;
                const weightedRandomPlayer = players.find((player) => weightedRandomNumber <= player.percentile);
                if (weightedRandomPlayer) {
                    weightedRandomPlayer.rewards[key as keyof typeof weightedRandomPlayer.rewards] += 1;
                };
                value--;
                maxIterations--;
            };
        };
    };

    // Send mails
    for (const player of players) {
        const mail = {
            "type": "2,10,11,8",
            "rewards":
                `coins|${player.rewards.coins}` +
                (player.rewards.guild_marks > 0 ? `,marks|${player.rewards.guild_marks}` : "") +
                (player.rewards.skill_points > 0 ? `,skillpts|${player.rewards.skill_points}` : "") +
                (player.rewards.deluxe_chest > 0 ? `,item|458|${player.rewards.deluxe_chest}` : "") +
                (player.rewards.royal_chest > 0 ? `,item|457|${player.rewards.royal_chest}` : "") +
                (player.rewards.luxurious_chest > 0 ? `,item|456|${player.rewards.luxurious_chest}` : "") +
                (player.rewards.glorious_chest > 0 ? `,item|454|${player.rewards.glorious_chest}` : "") +
                (player.rewards.featured_ring > 0 ? `,item|${raids[raid.raidid].loot[Math.floor(Math.random() * raids[raid.raidid].loot.length)]}` : "") +
                (player.rewards.featured_ring > 1 ? `,item|${raids[raid.raidid].loot[Math.floor(Math.random() * raids[raid.raidid].loot.length)]}` : "") +
                (player.rewards.featured_ring > 2 ? `,item|${raids[raid.raidid].loot[Math.floor(Math.random() * raids[raid.raidid].loot.length)]}` : ""),
            "message":
                `## Raid Rewards\n\n` +
                `You have ranked **#${player.rank}** out of **${players.length}** participants during this raid, dealing **${formatNumberWithQuotes(player.points)}** damage over **${player.rounds}** attempts <:Woah:928370799965003826>\n` +
                `You have contributed **${((player.points / totalPoints) * 100).toFixed(2)}%** of the total damage to the boss, and received **${(((player.share / sumOfShares) * (players.length / 20)) * 100).toFixed(2)}%** of the rewards`,
            "date": Date.now()
        };

        // Update users table
        await updateUsers(player.id, {
            mailbox: { type: "append", value: [mail] },
        });

        // // wait for 100ms
        // await new Promise(resolve => setTimeout(resolve, 100));
    };

    // Update guild treasury
    await updateGuilds(raid.guildid, {
        treasury: { type: "increment", value: Math.floor(3 * rewardPool.coins) },
    });

    // console.log(`Raid Rewards for ${raid.rowid} sent successfully!`);
};

const exportCommand: SlashCommand = {
    name: 'raid',
    async execute({ interaction, author }) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        // Deprecated
        const cancelOption = interaction.options.getBoolean('cancel') ?? false;

        // Test Boss
        const testBoss = interaction.options.getString('boss') ?? null;
        const isTestRun = (testBoss !== null) || (interaction.options.getBoolean('test') ?? false);
        const isTestBoss = isTestRun && testBoss !== null;

        // Skip Overview
        let skipOverview = interaction.options.getBoolean('skip-overview') ?? false;


        const actionMapping = {
            "atk": ["1", "atk", "attack", "a"],
            "def": ["2", "def", "defense", "d"],
            "ability": ["3", "ability", "abil", "ab"],
            "skill": ["4", "skill", "sk", "s", "class", "cl", "c"],
            "skip": ["5", "skip", "flee", "escape", "esc"],
        };

        // Enhanced Action Sequence Parser
        const sequence = interaction.options.getString('sequence') ?? null;

        // Safety constants
        const MAX_SEQUENCE_LENGTH = 5000;    // Maximum total actions allowed
        const MAX_REPEAT_COUNT = 200;        // Maximum repeat count for any single pattern
        const MAX_NESTING_DEPTH = 5;         // Maximum parentheses nesting depth
        const MAX_EXPANSION_ITERATIONS = 50; // Maximum iterations to prevent infinite loops

        function expandParentheses(str: string): string | null {
            let result = str;
            let changed = true;
            let iterations = 0;

            // Check nesting depth
            let maxDepth = 0;
            let currentDepth = 0;
            for (const char of str) {
                if (char === '(') {
                    currentDepth++;
                    maxDepth = Math.max(maxDepth, currentDepth);
                } else if (char === ')') {
                    currentDepth--;
                };
            };
            if (maxDepth > MAX_NESTING_DEPTH) {
                return null; // Too deeply nested
            };

            while (changed && iterations < MAX_EXPANSION_ITERATIONS) {
                changed = false;
                iterations++;

                // First, handle parentheses with repeat notation: (content):number
                const parenthesesWithRepeatRegex = /\(([^()]+)\):(\d+)/g;
                result = result.replace(parenthesesWithRepeatRegex, (match, content, countStr) => {
                    const count = parseInt(countStr);
                    if (isNaN(count) || count <= 0) return match; // Invalid count, leave as is
                    if (count > MAX_REPEAT_COUNT) return match; // Count too high, leave as is

                    // Check if expansion would create too many items
                    const contentItems = content.split(',').length;
                    const resultItems = result.split(',').length;
                    const newItems = contentItems * count;
                    if (resultItems + newItems > MAX_SEQUENCE_LENGTH) {
                        return match; // Would exceed limit, leave as is
                    }

                    // Repeat the content
                    const repeated = Array(count).fill(content).join(',');
                    changed = true;
                    return repeated;
                });

                // Then, handle parentheses without repeat notation: (content) - treat as (content):1
                const parenthesesWithoutRepeatRegex = /\(([^()]+)\)(?!:)/g;
                result = result.replace(parenthesesWithoutRepeatRegex, (match, content) => {
                    changed = true;
                    return content; // Just remove the parentheses, equivalent to :1
                });

                // Safety check: if result is getting too long, abort
                if (result.split(',').length > MAX_SEQUENCE_LENGTH) {
                    return null;
                };
            };

            // If we hit the iteration limit, it might be an infinite loop
            if (iterations >= MAX_EXPANSION_ITERATIONS) {
                return null;
            };

            return result;
        };

        function parseActionSequence(input: string | null): (string | null)[] {
            if (!input) return [];

            // First expand all parentheses notations
            const expandedSequence = expandParentheses(input);
            if (expandedSequence === null) {
                return [null]; // Expansion failed due to safety limits
            };

            // Then parse individual actions
            const actions = expandedSequence.split(',').map((e) => e.trim().toLowerCase()).flatMap((e) => {
                const trimmed = e.trim().toLowerCase();

                // Check if it has a repeat notation like "atk:3"
                if (trimmed.includes(':')) {
                    const [action, countStr] = trimmed.split(':');
                    const count = parseInt(countStr);

                    // Validate count
                    if (isNaN(count) || count <= 0) return [null];
                    if (count > MAX_REPEAT_COUNT) return [null]; // Safety limit

                    // Find the action key
                    let actionKey = null;
                    for (const [key, value] of Object.entries(actionMapping)) {
                        if (value.includes(action)) {
                            actionKey = key;
                            break;
                        };
                    };

                    // Return the action repeated count times
                    return Array(count).fill(actionKey);
                } else {
                    // Normal single action
                    for (const [key, value] of Object.entries(actionMapping)) {
                        if (value.includes(trimmed)) return [key];
                    };
                    return [null];
                };
            });

            // Final safety check
            if (actions.length > MAX_SEQUENCE_LENGTH) {
                return [null];
            };

            return actions;
        };

        const actionSequence = parseActionSequence(sequence);
        if (actionSequence.includes(null)) return interaction.reply("Error in action sequence. Please use the format `atk:3,def,ability,skill,skip` or `(atk,def):3` for patterns.\n**Restrictions**: Max 5000 actions, max 200 repeats, max 5 nesting levels, max 50 iterations");

        // Skip by default if action sequence is used
        if (actionSequence.length > 0 && interaction.options.getBoolean('skip-overview') !== false) skipOverview = true;

        //! Experimental
        // if (!isTestRun && actionSequence.length > 0) {
        //     return interaction.reply("Experimental action sequences are currently only available in test runs. Please use it at your own risk.");
        // };

        // Check if user has a battle character
        const stats = author.schema;
        if (stats.battlechar === null || !stats.chars.includes(stats.battlechar)) return interaction.reply("You have to choose a battle character first. Use `/select <char name>` to choose one.");

        const guild = stats.guild ? await getGuildSchema(stats.guild) : undefined;
        if (!stats.guild || !guild) {
            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Join our Server')
                        .setURL('https://discord.gg/myy9PBCdEW')
                        .setStyle(ButtonStyle.Link)
                );

            const Embed = new EmbedBuilder()
                .setColor(0xff3838)
                .setThumbnail(raids[1].enemy.image[0])
                .setDescription("### Guild Raids\nRaids are guild activities, please join one to participate!\n\nYou can search for a guild with </guild find:1090742470708563988>, find one on our [support server](https://discord.gg/myy9PBCdEW), or create your own with </guild create:1090742470708563988> <:ClaraThumbsUp:1034899843505721514>");
            return interaction.reply({ embeds: [Embed], components: [row] });
        };

        const raid = await getLatestRaid(guild.id);
        if (!raid) {
            if ([guild.master, ...guild.elders].includes(interaction.user.id)) {
                return raidSelection(interaction, stats, guild);
            } else {
                return interaction.reply("There is no active raid at the moment. Please ask your guild master or an elder to start one!");
            };
        };

        if (isTestBoss) {
            raid.raidid = parseInt(testBoss);
            raid.enemy_hp = raids[raid.raidid].getRankHp("EX+");
            raid.enemy_hpmax = raids[raid.raidid].getRankHp("EX+");
            raid.rank_letter = "EX+";
        };

        if (cancelOption) {
            if ([guild.master, ...guild.elders].includes(interaction.user.id)) {
                const result = await cancelRaid(raid.rowid);
                if (result === "success") {
                    return interaction.reply("Raid cancelled successfully! You may start a new one.");
                } else {
                    return interaction.reply("Failed to cancel raid. Please try again later.");
                };
            } else {
                return interaction.reply({ content: "Only the guild master or elders can cancel a raid", ephemeral: true });
            };
        };


        const myWeapons = await getWeaponSchemas([stats.equipment.weapon, stats.equipment.shield, stats.equipment.helmet, stats.equipment.cuirass, stats.equipment.gloves, stats.equipment.boots, stats.equipment.ring1, stats.equipment.ring2, stats.equipment.ring3]);
        const userItems = myWeapons.map((e) => items[e.itemid]);

        //* Use max class level
        stats.dungeon_classlevels = Object.fromEntries(Array.from({ length: classes.length }, (_, i) => [i, Math.max(0, ...Object.values(stats.dungeon_classlevels))]));

        // Overview
        let start = skipOverview ? 1 : await raidOverview({ interaction, stats, guild, raid, userItems, isTestRun, testBoss });
        if (start === -1) return;

        // Defer reply if overview is skipped
        if (skipOverview) {
            try {
                await interaction.deferReply();
            } catch (err) {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            };
        };

        // User must've been a member for at least 7 days
        if (!isTestRun && stats.lastguildjoin) {
            const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
            const timeSinceLastJoin = Date.now() - new Date(stats.lastguildjoin).getTime();
            if (timeSinceLastJoin < sevenDaysInMs) {
                const timeLeft = sevenDaysInMs - timeSinceLastJoin;
                const daysLeft = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
                const hoursLeft = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

                let timeString = "";
                if (daysLeft > 0) timeString += `**${daysLeft}** days`;
                if (hoursLeft > 0) timeString += `${timeString ? " " : ""}**${hoursLeft}** hours`;
                if (minutesLeft > 0) timeString += `${timeString ? " " : ""}**${minutesLeft}** minutes`;

                return interaction.followUp(`You have to wait **7** days after joining a guild before you can participate in a raid.\nTime left: ${timeString}`);
            };
        };

        // Return if no attempts left
        const raidCheck = await getLatestRaid(guild.id);
        if (!raidCheck) return interaction.followUp("An error occurred while checking your raid attempts. Please try again later.");

        // Return if ended and no test run
        if (raidCheck.end_date && !isTestRun) return interaction.reply("The raid has ended. You can start a new one with `/raid` or use the test flag");

        // Attempts left
        const attemptsUsed = raidCheck.participation[interaction.user.id]?.[1] ?? 0;
        const attemptsTotal = (Math.floor((Date.now() - new Date(raidCheck.start_date).getTime()) / (24 * 60 * 60 * 1000)) + 1) * DAILY_RAID_ATTEMPTS;
        if (!isTestRun && attemptsUsed >= attemptsTotal) return interaction.followUp(`You have already used all your available attempts (**0**/${attemptsTotal})`);


        const currentRaid = raids[raid.raidid];


        // Set up restrictions
        if (dungeonTempBan.has(interaction.user.id)) return interaction.followUp(`You have failed to enter the captcha many times in a row.\nYou have been temporarily banned from using \`/dungeon\` for the next **${Math.ceil((dungeonTempBan.get(interaction.user.id)?.ends - Date.now()) / (60 * 1000))}** min\nYou can check how much time is left with </cd:1010317417840390158>`);
        if (dungeonInProgress.has(stats.id)) return interaction.followUp("You already have a run in progress, please finish it before attempting to start a new round.");
        dungeonInProgress.add(stats.id);
        const userTimeout = setTimeout(() => dungeonInProgress.delete(stats.id), FIGHT_DURATION * 1000);

        // User stats
        let myChar = characters[stats.battlechar];
        let myStats = await getDetailedStats(myChar.id, stats, stats.dungeon_classlevels);
        myStats.damageFormula = "log_scale_1.4";
        myStats.thumbnail = myChar.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[myChar.id], stats.char_skin[myChar.id]);

        // Add Guild Perks
        myStats.atk += Math.floor(myStats.atk * (guild.atkbuff * 0.2));
        myStats.md += Math.floor(myStats.md * (guild.atkbuff * 0.2));
        myStats.hp += Math.floor(myStats.hp * (guild.hpbuff * 0.2));
        myStats.maxhp += Math.floor(myStats.maxhp * (guild.hpbuff * 0.2));
        const defBuff = guild.defbuff * 100;
        myStats.def += defBuff;
        myStats.mr += defBuff;
        myStats.increase_defcap += defBuff;
        myStats.increase_mrcap += defBuff;

        // myStats.removeDefCap = true;
        let myStatsC = { ...myStats };
        let myClass = myStats.class !== -1 ? classes[myStats.class] : undefined;
        let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : undefined;
        let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : undefined;

        if (myStats.rune) {
            const rune = items[parseInt(myStats.rune)];
            if (rune instanceof runeInfo) {
                if (myAbility === undefined) myAbility = rune.ability as Ability;
                else myAbility = { ...myAbility, ..._.cloneDeep(rune.ability) };
            };
        };

        // Enemy Stats
        let enemy = currentRaid.enemy;
        const curse = curses[14];
        let eAbility = currentRaid.enemy.ability;
        let eImage = enemy.image[Math.floor(Math.random() * enemy.image.length)];

        // Battle Scale
        const enemyScale = 0.0005 * myStatsC.hp * Math.pow((1 / 0.99895), Math.min((2192 + myStatsC.increase_defcap), Math.max(myStatsC.def, myStatsC.mr)));
        const enemyAtk = Math.floor((300 * enemyScale) * 1.05);
        myStats.damageRescaling = enemyScale / 13; myStatsC.damageRescaling = enemyScale / 13;

        myStatsC.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats) => {
            eStats.atk *= (1 + (matchStats.round * 0.05));
            eStats.md *= (1 + (matchStats.round * 0.05));

            return AbilityResponse.SUCCESS;
        }, 9999));

        let eStats = {
            "name": enemy.name,
            "hp": Math.floor(raid.enemy_hpmax / 100) * 10,
            "maxhp": Math.floor(raid.enemy_hpmax / 100) * 10,
            "atk": enemyAtk * 0.2,
            "md": enemyAtk * 0.2,
            "def": 660,
            "mr": 660,
            "ep": Infinity,
            "cr": 0.15,
            "cd": 1.2,
            "td": 10,
            "br": 0.12,
            "dodge": 0.1,
            "mana": 1000,
            "mg": 15,
            "sm": 0,
            "rev": 0,
            "revhp": 0,
            "shield": 0,
            "mdChance": 0,
            "removeDefCap": true,
            "image": eImage,
        } as any;

        // Stat Adjustments
        if (enemy.setStats) Object.entries(enemy.setStats).forEach((e) => eStats[e[0]] = e[1]);
        if (enemy.multStats) Object.entries(enemy.multStats).forEach((e) => eStats[e[0]] = Math.floor(eStats[e[0]] * e[1]));
        if (enemy.addStats) Object.entries(enemy.addStats).forEach((e) => eStats[e[0]] += e[1]);

        let eStatsC = { ...eStats };

        // Some match settings
        const difficulty = Avalon.getDifficulty(myStats.ep / eStats.ep);
        const aDelay = stats.premium ? stats.animationdelay : 1200;

        // Random HP Bar
        if (stats.user_settings.random_hp_bar && stats.hpbars.length > 0) {
            stats.hpbar = [null, ...stats.hpbars][Math.floor(Math.random() * (stats.hpbars.length + 1))];
        };
        const embedColor = stats.hpbar === null ? currentRaid.accentColor as ColorResolvable : customHpBars[stats.hpbar].color;

        let buffs = Avalon.getBuffs();
        let eBuffs = Avalon.getBuffs();

        let resolved = false;
        async function matchResult(wORl: "w" | "l") {
            if (resolved) return;
            resolved = true;

            // Clear restrictions
            clearTimeout(userTimeout);
            dungeonInProgress.delete(stats.id);

            if (!raid) return;

            // Revert Minion
            if (matchStats.currentOpponent) {
                eStatsC = { ...matchStats.eStatsCC };
                matchStats.currentOpponent = 0;
            };

            // Damage dealt
            const damageDealt = (eStats.hp - eStatsC.hp) < 0 ? 0 : (eStats.hp - eStatsC.hp);

            // Participation
            if (!isTestRun) await updateRaidParticipation(raid.rowid, interaction.user.id, damageDealt);

            //* LOOT DROPS

            // Coins
            const coinDrops = Math.min(Math.max(Math.floor(
                (50 + (Math.random() * 25)) // Base: 50-75
                * (1 + (raidRankIndices[raids[raid.raidid].rank] / 10)) // Raid Rank Buff
                * (1 + (0.2 * (guild ? guild.lootbuff : 0))) // Guild Buff
                * matchStats.lootm + matchStats.loot // Player Buffs
            ), 0), 3000);

            // Guild Marks
            const guildMarks = Math.min(Math.max(Math.floor(
                (3 + (Math.random() * 2)) // Base: 3-5
                * (1 + (0.2 * (guild ? guild.lootbuff : 0))) // Guild Buff
                + (3 * (raidRankIndices[raids[raid.raidid].rank] / 10)) // Raid Rank Buff
            ), 0), 100);

            // Skill Point
            const skillPoints = (Math.random() < 0.04) ? 1 : 0;

            // Update users table
            if (!isTestRun) await updateUsers(interaction.user.id, {
                coins: { type: 'increment', value: coinDrops },
                guild_marks: { type: 'increment', value: guildMarks },
                skill_points: { type: 'increment', value: skillPoints }
            });

            // Check if the raid is over
            const raidCheck = guild ? await getLatestRaid(guild.id) : undefined;

            if (!isTestRun && raidCheck && raidCheck.enemy_hp <= 0) {
                const nextPhase = raids[raidCheck.raidid].nextPhase;
                if (nextPhase) {
                    await updateRaidPhase(raidCheck.rowid, nextPhase, raids[nextPhase].getRankHp(raidCheck.rank_letter));
                } else {
                    endRaid(raidCheck.rowid, guild?.raid_distribute_equally ?? false);
                };
            };

            return new EmbedBuilder()
                .setColor(embedColor)
                .setThumbnail(myStatsC.thumbnail)
                .setTitle(`Raid Results ${isTestRun ? "(TEST RUN)" : ""}`)
                .setDescription(`${eStatsC.hp <= 0 ? `<:stars_v2:917023655840591963> **${myChar.name}** won! <:stars_v2:917023655840591963>` : `💀 **${myChar.name}** lost 💀`}\n<a:arrow_red:916716702618767401> Damage: **${formatNumberWithQuotes(damageDealt)}**\n<a:arrow_orange:916716747623641210> Attempts: **${attemptsTotal - (attemptsUsed + 1)}**/${attemptsTotal} left\n\n<:npbag:929428030554787892> Loot\n**${isTestRun ? 0 : coinDrops}**x <:coins:872926669055356939>, **${isTestRun ? 0 : guildMarks}**x <:guild_mark:1317944450814840923>${(skillPoints && !isTestRun) ? `, **${skillPoints}**x <:skill_point:1351505460301136014>` : ""}`)
                .setFooter({ text: `Balance: ${formatNumberWithQuotes(stats.coins)} coins`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
        };

        let matchStats = Avalon.getMatchStats(interaction, { allowExecution: false, allowSelfheal: false, actionSequence });
        let notice = ["", "", "", ""];
        matchStats.partyChars = stats.raid_supports.filter((sid) => sid !== null && sid !== undefined && sid !== stats.battlechar).map((sid) => characters[sid]);
        // matchStats.partyStats = partyStatsC;

        // Apply skill tree
        for (const [skill, level] of Object.entries(stats.skill_tree)) {
            await skillTree[parseInt(skill)].passive(level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        };

        // Apply passives
        if (skill && myChar.id !== 4767) await skill.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
        if (myAbility?.passive) await myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.weapon !== -1) await (items[myStats.weapon] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.shieldid) await (items[myStats.shieldid] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.helmet && (items[myStats.helmet] as armorInfo).setname === (items[myStats.cuirass] as armorInfo)?.setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.gloves] as armorInfo)?.setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.boots] as armorInfo)?.setname) await (items[myStats.boots] as armorInfo)?.buff?.(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        if (myStats.rune) await (items[parseInt(myStats.rune)] as runeInfo)?.buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        if (myStats.ring1) await (items[myStats.ring1] as ringInfo).getBuff(myStats.ring1info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.ring2) await (items[myStats.ring2] as ringInfo).getBuff(myStats.ring2info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.ring3) await (items[myStats.ring3] as ringInfo).getBuff(myStats.ring3info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        for (const sid of new Set(stats.raid_supports)) {
            if (sid !== undefined && sid !== null && sid !== stats.battlechar) {
                const myStatsP = { ...myStatsC };
                myStatsP.name = characters[sid].name;

                const runeAbility = stats.equipment[`rune:${sid}`] ? items[parseInt(stats.equipment[`rune:${sid}`])] as runeInfo : undefined;
                if (runeAbility && runeAbility.party) {
                    await runeAbility.party(myStatsP, myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
                } else {
                    await abilities[sid]?.party?.(myStatsP, myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
                };
            };
        };

        await eAbility?.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);

        const ATK_EMOJI = myStatsC.replaceButton?.atk?.emoji || '⚔️',
            DEF_EMOJI = myStatsC.replaceButton?.def?.emoji || '🛡️',
            ABILITY_EMOJI = myStatsC.replaceButton?.ability?.emoji || '✨',
            SKILL_EMOJI = myStatsC.replaceButton?.cskill?.emoji || '⚜️',
            SKIP_EMOJI = myStatsC.replaceButton?.skip?.emoji || '<:dodge_chance:1047269150948606063>';

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled((myAbility && "ability" in myAbility) ? false : true),
                new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled(myStats.class !== -1 ? false : true),
                new ButtonBuilder().setCustomId('SKIP').setEmoji(SKIP_EMOJI).setStyle(ButtonStyle.Secondary)
            );

        const isCompactEmbed = !!author.schema.user_settings.compact_battle_embeds;
        const threatLevelWarning = isCompactEmbed ? "" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n`;

        async function newFight() {
            let timestart = new Date().getTime();
            let result = await new Promise<EmbedBuilder | undefined>((resolve) => {
                const Embed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setThumbnail(isCompactEmbed ? eImage : myStatsC.thumbnail)
                    .setFooter({ text: `Enemy EP: ${eStatsC.ep} | round 1 | time left: ${FIGHT_DURATION}s` })
                    .setTitle(`Guild Raid ${isTestRun ? "(TEST RUN)" : ""}  `)
                    .setDescription(`${threatLevelWarning}${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}\\💖${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStats.hp, eStatsC.sm / eStatsC.mana, stats.hpbar)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStats.hp}\\💖${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana, stats.hpbar)}\n${Avalon.padStats(myStatsC)}`)
                    .setImage(isCompactEmbed ? null : eImage);
                interaction.editReply({ embeds: [Embed], components: [row] }).then(msg => {

                    const atk = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ATK", componentType: ComponentType.Button, time: FIGHT_DURATION * 1000 });
                    const def = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "DEF", componentType: ComponentType.Button, time: FIGHT_DURATION * 1000 });
                    const ability = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ABILITY", componentType: ComponentType.Button, time: FIGHT_DURATION * 1000 });
                    const cskill = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKILL", componentType: ComponentType.Button, time: FIGHT_DURATION * 1000 });
                    const skip = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKIP", componentType: ComponentType.Button, time: FIGHT_DURATION * 1000 });
                    matchStats.collector = { "atk": atk, "def": def, "ability": ability, "cskill": cskill, "skip": skip };


                    // Use passives
                    if (myChar.id !== 4767) curse.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                    let timeout: NodeJS.Timeout | undefined;
                    async function editEmbed() {
                        Embed.setDescription(`${threatLevelWarning}${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStatsC.maxhp, eStatsC.sm / eStatsC.mana, stats.hpbar)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana, stats.hpbar)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-(parseInt(author.schema.user_settings.battle_log_length || "4") || 4)).join("")}`);
                        Embed.setFooter({ text: `Enemy EP: ${eStatsC.ep} | round ${matchStats.round} | time left: ${FIGHT_DURATION + Math.floor((timestart - new Date().getTime()) / 1000)}s` });
                        // await msg.edit({ embeds: [Embed] });

                        // Debounce
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                            msg.edit({ embeds: [Embed] });
                        }, 600);
                    };

                    function minionDefeated(side: "my" | "enemy") {
                        if (side === "my") {
                            myStatsC = { ...matchStats.myStatsCC } as DetailedStats;
                            matchStats.currentCharacter = 0;
                            Embed.setThumbnail(myStatsC.thumbnail);
                            startNextRound();
                        } else {
                            eStatsC = { ...matchStats.eStatsCC };
                            matchStats.currentOpponent = 0;
                            Embed.setImage(eImage);
                            attack();
                        };
                    };

                    function endMatch(wORl: "w" | "l") {
                        if (matchStats.ended) return;
                        else matchStats.ended = true;

                        atk.stop(), def.stop(), skip?.stop(), ability?.stop(), cskill?.stop();
                        if (wORl === "l") notice.push(`\n💀 **${myChar.name}** lost`);
                        else notice.push(`\n🎉 **${myChar.name}** won`);
                        editEmbed();
                        matchStats.turn = 1;
                        resolve(matchResult(wORl));
                    };

                    function startNextRound() {
                        // Force end at MAX_ROUNDS
                        if (matchStats.round >= MAX_ROUNDS) {
                            notice.push(`\n🕗 You've reached the end`);
                            endMatch("l");
                        };

                        if (matchStats.ended) return;
                        if (matchStats.round === matchStats.roundCheck) return;
                        matchStats.roundCheck = matchStats.round;

                        // Consume Mana
                        Avalon.consumeActiveMana(matchStats, myStatsC, buffs, myChar, notice, Embed, myStatsC.thumbnail);

                        // Reset Buffs
                        if (matchStats.currentCharacter === 0) myStatsC.atk = myStats.atk, myStatsC.md = myStats.md, myStatsC.def = myStats.def, myStatsC.mr = myStats.mr, myStatsC.cd = myStats.cd, myStatsC.cr = myStats.cr, myStatsC.dodge = myStats.dodge, myStatsC.br = myStats.br, myStatsC.mg = myStats.mg;
                        // if (matchStats.currentOpponent === 0) eStatsC.atk = eStats.atk, eStatsC.md = eStats.md, eStatsC.def = eStats.def, eStatsC.mr = eStats.mr, eStatsC.cd = eStats.cd, eStatsC.cr = eStats.cr, eStatsC.dodge = eStats.dodge, eStatsC.br = eStats.br, eStatsC.mg = eStats.mg;
                        /* !!! */ eStatsC.atk = eStats.atk, eStatsC.md = eStats.md, eStatsC.def = eStats.def, eStatsC.mr = eStats.mr, eStatsC.cd = eStats.cd, eStatsC.cr = eStats.cr, eStatsC.dodge = eStats.dodge, eStatsC.br = eStats.br, eStatsC.mg = eStats.mg;

                        // // Remove HP debuffs from boss
                        // eBuffs.hp = eBuffs.hp.filter((buff) => (buff.type === "*" && buff.val > 1) || (buff.type === "+" && buff.val > 0));

                        // Apply Buffs
                        if (matchStats.currentCharacter === 0) Avalon.applyBuffs(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice);
                        // if (matchStats.currentOpponent === 0) Avalon.applyBuffs(eStatsC, eStatsC, eBuffs, buffs, matchStats, notice);
                        /* !!! */ Avalon.applyBuffs(eStatsC, eStatsC, eBuffs, buffs, matchStats, notice);

                        // Fix Stats
                        if (myStatsC.hp > myStatsC.maxhp) myStatsC.hp = myStatsC.maxhp;
                        else if (myStatsC.hp < 0) myStatsC.hp = 0;
                        else myStatsC.hp = Math.floor(myStatsC.hp);
                        if (eStatsC.hp > eStatsC.maxhp) eStatsC.hp = eStatsC.maxhp;
                        else if (eStatsC.hp < 0) eStatsC.hp = 0;
                        else eStatsC.hp = Math.floor(eStatsC.hp);

                        // Check and run delayed buffs
                        if (matchStats.currentCharacter === 0) {
                            for (let i = myStatsC.delayedBuffs.length - 1; i >= 0; i--) {
                                if (myStatsC.delayedBuffs[i].round <= matchStats.round) {
                                    myStatsC.delayedBuffs[i].run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    if (myStatsC.delayedBuffs[i].last <= 1 || myStatsC.delayedBuffs[i].used >= myStatsC.delayedBuffs[i].usage) {
                                        myStatsC.delayedBuffs.splice(i, 1);
                                    } else {
                                        myStatsC.delayedBuffs[i].decrement();
                                    };
                                };
                            };
                        };

                        Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                        // Auto apply action sequence
                        if (actionSequence.length > 0) autoApply();
                    };

                    function attack() {
                        if (matchStats.turn === 1) return;
                        if (eStatsC.timeFrozen) {
                            if (eStatsC.frozenMessage) notice.push(`\n✨ **${enemy.name}** ${eStatsC.frozenMessage}.`);
                            if (!(matchStats.playerPausingRounds > 0)) matchStats.turn = 1;
                            matchStats.turn = 1;
                            matchStats.round++;
                            startNextRound();
                            editEmbed();
                            if (matchStats.playerPausingRounds > 0) {
                                matchStats.playerPausingRounds--;
                                attack();
                            };
                        } else {
                            setTimeout(() => {
                                if (matchStats.blockAbilities-- <= 0 && myChar.id !== 4767 && eStatsC.sm >= curse.cost && Math.random() < 0.1) {
                                    curse.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    eStatsC.sm -= curse.cost;
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                } else if (matchStats.blockAbilities-- < 0 && myChar.id !== 4767 && eAbility && eStatsC.sm >= eAbility.cost && Math.random() < 0.66) {
                                    eStatsC.sm -= eAbility.cost;
                                    eAbility.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                } else {
                                    dealDamage(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, `⚔️ **${enemy.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    if (!(matchStats.playerPausingRounds > 0)) matchStats.turn = 1;
                                    matchStats.turn = 1;
                                    matchStats.round++;
                                    startNextRound();
                                    editEmbed();
                                    if (matchStats.playerPausingRounds > 0) {
                                        matchStats.playerPausingRounds--;
                                        attack();
                                    };
                                };
                                if (matchStats.counter > 0) matchStats.counter--;
                            }, actionSequence.length > 0 ? 0 : aDelay);
                        };
                    };

                    // Write passive actions if any
                    if (notice.length > 4) {
                        Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                        editEmbed();
                    };

                    const userAttack = async () => {
                        if (matchStats.turn === 1) {
                            matchStats.turn = 0;

                            // If attack was replaced
                            if (myStatsC.replaceButton.atk?.run) {
                                myStatsC.replaceButton.atk.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                                // Event Triggers
                                matchStats.trigger("ATK", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                if (matchStats.turn === 0) attack();
                            }

                            // Normal attack
                            else {
                                dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });

                                // Event Triggers
                                matchStats.trigger("ATK", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                if (matchStats.twinshot > Math.random()) setTimeout(() => {
                                    dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                }, actionSequence.length > 0 ? 0 : aDelay);

                                else attack();
                            }

                        } else matchStats.sendWarning({ content: "Please wait a moment", ephemeral: true });
                    };
                    atk.on('collect', async () => {
                        if (actionSequence.length > 0) return interaction.followUp({ content: "Please wait until the action sequence is finished", ephemeral: true });
                        await userAttack();
                    });

                    const userDefense = async () => {
                        if (matchStats.turn === 1) {
                            matchStats.turn = 0;
                            myStatsC.attackStreak = 0;

                            // If defense was replaced
                            if (myStatsC.replaceButton.def?.run) {
                                myStatsC.replaceButton.def.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                                // Event Triggers
                                matchStats.trigger("DEF", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                if (matchStats.turn === 0) attack();
                            }

                            // Use defense
                            else {
                                if (++matchStats.defUsed === 10) matchStats.sendWarning({ content: `You have used DEF 10 times and won't get any ${customEmojis.def} or ${customEmojis.mr} from now on!`, ephemeral: true });
                                if (matchStats.defUsed > 10) {
                                    // notice.push(`\n🛡️ **${myChar.name}** can't increase DEF/MR anymore`);
                                } else {
                                    let adddef = 60 + Math.floor(30 * Math.random()) - ((matchStats.defUsed - 1) * 5);
                                    let addmr = Math.floor((myClass ? 60 * myClass.stats.mr[0] : 60) + (30 * Math.random())) - ((matchStats.defUsed - 1) * 5);
                                    buffs.def.push(new buffInfo("+", adddef, 9999));
                                    buffs.mr.push(new buffInfo("+", addmr, 9999));
                                    myStatsC.def += adddef;
                                    myStatsC.mr += addmr;
                                    notice.push(`\n🛡️ **${myChar.name}** has increased DEF by **${adddef}** and MR by **${addmr}**`);
                                };
                                myStatsC.usedBlockRound = matchStats.round;

                                // Event Triggers
                                matchStats.trigger("DEF", myStatsC, eStatsC, buffs, eBuffs);

                                attack();
                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            }

                        } else matchStats.sendWarning({ content: "Please wait a moment", ephemeral: true });
                    };
                    def.on('collect', async () => {
                        if (actionSequence.length > 0) return interaction.followUp({ content: "Please wait until the action sequence is finished", ephemeral: true });
                        await userDefense();
                    });

                    const userAbility = async () => {
                        if (myStatsC.isAbilityBlocked) return matchStats.sendWarning({ content: `You currently can't use your character ability`, ephemeral: true });

                        // If ability was replaced
                        if (myStatsC.replaceButton.ability?.run && matchStats.turn === 1) {
                            matchStats.turn = 0;
                            myStatsC.attackStreak = 0;
                            const response = await myStatsC.replaceButton.ability.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                            // Event Triggers
                            if (response === AbilityResponse.SUCCESS) {
                                matchStats.trigger("ABILITY", myStatsC, eStatsC, buffs, eBuffs);
                            };

                            editEmbed();
                            Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            attack();
                        }

                        else {
                            if (!myAbility?.ability) return matchStats.sendWarning({ content: `You don't have an ability`, ephemeral: true });
                            if (myAbility.used < myAbility.usage) {
                                if (matchStats.turn === 1) {
                                    if (myAbility.cost > myStatsC.sm) matchStats.sendWarning({ content: `You don't have enough mana! (**${myStatsC.sm}**/${myAbility.cost}${customEmojis.mana})`, ephemeral: true });
                                    else {
                                        matchStats.turn = 0;
                                        myStatsC.attackStreak = 0;
                                        myAbility.used++;
                                        const response = await myAbility.ability(myStatsC, myStats, eStatsC, eStats, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, msg);
                                        myStatsC.sm -= myAbility.cost;

                                        // Event Triggers
                                        if (response === AbilityResponse.SUCCESS) {
                                            matchStats.trigger("ABILITY", myStatsC, eStatsC, buffs, eBuffs);
                                        };

                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        attack();
                                    };
                                } else matchStats.sendWarning({ content: "Please wait a moment", ephemeral: true });
                            } else matchStats.sendWarning({ content: `You can use **${myChar.name}**'s ability only ${myAbility.usage == 1 ? "once" : `${myAbility.usage} times`} per fight.`, ephemeral: true });
                        };
                    };
                    ability.on('collect', async () => {
                        if (actionSequence.length > 0) return interaction.followUp({ content: "Please wait until the action sequence is finished", ephemeral: true });
                        await userAbility();
                    });

                    const userSkill = async () => {

                        // If class active was replaced
                        if (myStatsC.replaceButton.cskill?.run && matchStats.turn === 1) {
                            matchStats.turn = 0;
                            myStatsC.attackStreak = 0;
                            const response = await myStatsC.replaceButton.cskill.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                            // Event Triggers
                            if (response === AbilityResponse.SUCCESS) {
                                matchStats.trigger("CSKILL", myStatsC, eStatsC, buffs, eBuffs);
                            };

                            editEmbed();
                            Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            if (matchStats.turn === 0) attack();
                        }

                        // Class active
                        else {
                            if (!skill) return matchStats.sendWarning({ content: `You don't have a class skill`, ephemeral: true });
                            if (myChar.id === 4767) return matchStats.sendWarning({ content: "Asta can't use any abilities", ephemeral: true });
                            if (skill.cost > myStatsC.sm) return matchStats.sendWarning({ content: `You don't have enough mana! (**${myStatsC.sm}**/${skill.cost}${customEmojis.mana})`, ephemeral: true });
                            else {
                                if (matchStats.turn === 1) {
                                    myStatsC.sm -= skill.cost;
                                    myStatsC.attackStreak = 0;
                                    const response = await skill.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user, stats.chars);

                                    // Event Triggers
                                    if (response === AbilityResponse.SUCCESS) {
                                        matchStats.trigger("CSKILL", myStatsC, eStatsC, buffs, eBuffs);
                                    };

                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                } else matchStats.sendWarning({ content: "Please wait a moment", ephemeral: true });
                            };
                        };
                    };
                    cskill.on('collect', async () => {
                        if (actionSequence.length > 0) return interaction.followUp({ content: "Please wait until the action sequence is finished", ephemeral: true });
                        await userSkill();
                    });

                    const userSkip = async () => {
                        if (matchStats.turn == 1) {
                            notice.push(`\n<:dodge_chance:1047269150948606063> ${myChar.name} fled the fight`);
                            endMatch("l");
                            editEmbed();
                        } else {
                            matchStats.turn = 1;
                            matchStats.sendWarning({ content: "Please wait a moment", ephemeral: true });
                        };
                    };
                    skip.on('collect', async () => {
                        if (actionSequence.length > 0) return interaction.followUp({ content: "Please wait until the action sequence is finished", ephemeral: true });
                        await userSkip();
                    });

                    atk.on('end', () => {
                        if (FIGHT_DURATION + Math.floor((timestart - new Date().getTime()) / 1000) < 1) {
                            atk.stop(), def.stop(), ability.stop(), cskill.stop(), skip.stop();
                            if (resolved) return;
                            endMatch("l");
                            editEmbed();
                        };
                    });

                    // Auto apply existing action sequence
                    const autoApply = async () => {
                        while (actionSequence.length > 0 && !matchStats.ended) {
                            const action = actionSequence.shift();
                            switch (action) {
                                case "atk": await userAttack(); break;
                                case "def": await userDefense(); break;
                                case "ability": await userAbility(); break;
                                case "skill": await userSkill(); break;
                                case "skip": await userSkip(); break;
                            };

                            if (matchStats.turn === 0) break;
                        };
                    };
                    autoApply();

                });

            });
            if (result && interaction.channel?.isSendable()) interaction.channel.send({ embeds: [result] });
        };

        newFight();
    },
    async autocomplete({ interaction }) {
        // Raid boss selection for test runs
        return raids.map((e) => ({ name: `${e.name}`, value: e.id.toString() })).filter((e) => e.name.toLowerCase().includes(interaction.options.getFocused().toLowerCase()));
    },
};

export default exportCommand;
