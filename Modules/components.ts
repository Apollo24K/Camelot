import fs from 'fs';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { RaidRank } from '../types';

export const cowSettings = JSON.parse(fs.readFileSync('Storage/rolling.json', 'utf8'));

export const PageRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setEmoji('⏪')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('next')
            .setEmoji('⏩')
            .setStyle(ButtonStyle.Secondary),
    );

export const OfferRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('confirm')
            .setEmoji('<:check_icon:683671903143067743>')
            .setLabel('confirm')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('cancel')
            .setEmoji('<:stop_icon:683671917353369600>')
            .setLabel('cancel')
            .setStyle(ButtonStyle.Danger),
    );

export const requestVerification = new Map();
export const dungeonTempBan = new Map();

export const shardEmoji = {
    "EX": "<:ss_shard:917203009543503892>",
    "SS": "<:ss_shard:917203009543503892>",
    "S": "<:s_shard:917202925514817566>",
    "A": "<:a_shard:917202904862052392>",
    "B": "<:b_shard:917202862851899392>",
    "C": "<:c_shard:917202862499582002>",
    "D": "<:d_shard:917202840563363891>",
};

export const rankProgression: RaidRank[] = ["F-", "F", "F+", "E-", "E", "E+", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+", "S-", "S", "S+", "SS-", "SS", "SS+", "SSS-", "SSS", "SSS+", "EX-", "EX", "EX+"];

export const rankLowerRanges: Record<RaidRank, number> = {
    "F-": 0,
    "F": 100,
    "F+": 200,
    "E-": 500,
    "E": 1000,
    "E+": 2000,
    "D-": 5000,
    "D": 10000,
    "D+": 20000,
    "C-": 50000,
    "C": 100000,
    "C+": 200000,
    "B-": 500000,
    "B": 1000000,
    "B+": 2000000,
    "A-": 5000000,
    "A": 10000000,
    "A+": 20000000,
    "S-": 50000000,
    "S": 100000000,
    "S+": 200000000,
    "SS-": 500000000,
    "SS": 1000000000,
    "SS+": 2000000000,
    "SSS-": 5000000000,
    "SSS": 10000000000,
    "SSS+": 20000000000,
    "EX-": 50000000000,
    "EX": 100000000000,
    "EX+": 200000000000,
};
