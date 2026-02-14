import fs from 'fs';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { RaidRank, SeasonalEvent } from '../types';

export const cowSettings = (() => {
    try {
        return JSON.parse(fs.readFileSync('Storage/rolling.json', 'utf8'));
    } catch {
        const defaultSettings = {
            start: Date.now() - (14 * 24 * 60 * 60 * 1000),
            days: 5,
            rollsPerDay: 3,
            fightsPerCharacter: 3,
            timeInMinutes: 30,
            level: 600,
            clvl: 1200,
            goldenCowChance: 0.02
        };

        // Create Storage directory if it doesn't exist
        if (!fs.existsSync('Storage')) {
            fs.mkdirSync('Storage');
        };

        fs.writeFileSync('Storage/rolling.json', JSON.stringify(defaultSettings));
        return defaultSettings;
    };
})();

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

// Event
export const ongoingEvent = "valentines" as SeasonalEvent;
export const seasonalEventStart = new Date('2026-02-15 00:00:00');
export const seasonalEventLastsDays = 16;
export const seasonalEventEnd = new Date(seasonalEventStart.getTime() + (seasonalEventLastsDays * 24 * 60 * 60 * 1000));
export const isEventOngoing = () => seasonalEventStart.getTime() <= Date.now() && Date.now() < seasonalEventEnd.getTime();

// Misc
export const requestVerification = new Map();
export const dungeonTempBan = new Map();

export const botPfp = "https://i.ibb.co/mDX54t4/Ta2YDBN.png";
export const embedColor = 0xbbffff;

export const donationWeekStart = new Date('2024-02-12T00:00:00');

export const shardEmoji = {
    "EX": "<:ss_shard:917203009543503892>",
    "SS": "<:ss_shard:917203009543503892>",
    "S": "<:s_shard:917202925514817566>",
    "A": "<:a_shard:917202904862052392>",
    "B": "<:b_shard:917202862851899392>",
    "C": "<:c_shard:917202862499582002>",
    "D": "<:d_shard:917202840563363891>",
} as const;

const seasonalKeys = {
    "valentines": "<:valentines_key:1415408453060399225>",
    "cny": "<:cny_key:1415409748597280941>",
    "easter": "<:easter_key:1415408485281173647>",
    "summer": "<:summer_key:1415409314725757083>",
    "fall": "<:fall_key:1415402576509141143>",
    "halloween": "<:halloween_key:1415403370318925977>",
    "winter": "<:winter_key:1415403402992681079>",
} as const;

export const currencyEmojis = {
    "gems": "<:genesis_gems:1034179687720681492>",
    "coins": "<:coins:1030580480782893197>",
    "lilies": "<:lilium:974057059618291732>",
    "jades": "<:eternal_jade:1256124504141201428>",
    "season_keys": seasonalKeys.valentines,
    "eventpts": "🌙",
} as const;

export const profileColors = {
    creme: ['#FFF9F3', '#FFEEDD'],
    red: ['#F95959', '#EE3E3E'],
    orange: ['#F49037', '#EC760C'],
    gold: ['#F9E94E', '#EED80B'],
    mint: ['#D8F73E', '#D1F90E'],
    green: ['#A9FB46', '#82E50B'],
    emerald: ['#42D845', '#0CBB0F'],
    turquoise: ['#4EE3BF', '#12CDA0'],
    blue: ['#65B7FF', '#3BA3FF'],
    sky_blue: ['#90E1FF', '#47CDFF'],
    indigo: ['#4D70FF', '#2F47A8'],
    violet: ['#AE4ACC', '#8F0CB7'],
    purple: ['#AE4ACC', '#8F0CB7'],
    pink: ['#FFAFD7', '#FF7BBD'],
} as const;

export enum AbilityResponse {
    SUCCESS = 1,
    FAILURE = 0,
};

// export const newProfileColors = {
//     creme: { text: '#FDE8FF', floor: '#a89aa8', gradStart: '#FDE8FF', gradEnd: '#000000' },
//     red: { text: '#FF2626', floor: '#761113', gradStart: '#FF2626', gradEnd: '#000000' },
//     orange: { text: '#FF7C26', floor: '#a24f19', gradStart: '#FF7C26', gradEnd: '#000000' },
//     gold: { text: '#FFE103', floor: '#a89500', gradStart: '#FFE103', gradEnd: '#000000' },
//     mint: { text: '#C4FF03', floor: '#729201', gradStart: '#C4FF03', gradEnd: '#000000' },
//     green: { text: '#82FF03', floor: '#509e00', gradStart: '#82FF03', gradEnd: '#000000' },
//     emerald: { text: '#0DDF09', floor: '#068103', gradStart: '#0DDF09', gradEnd: '#000000' },
//     turquoise: { text: '#49DAE6', floor: '#006e6d', gradStart: '#3CCEDA', gradEnd: '#000000' }, // '#1CB1BE' },
//     blue: { text: '#09B8DF', floor: '#066e86', gradStart: '#09B8DF', gradEnd: '#000000' },
//     sky_blue: { text: '#17E6FB', floor: '#0e8c98', gradStart: '#17E6FB', gradEnd: '#000000' },
//     indigo: { text: '#1A70FF', floor: '#10469f', gradStart: '#1A70FF', gradEnd: '#000000' },
//     violet: { text: '#AE57FF', floor: '#69369b', gradStart: '#AE57FF', gradEnd: '#000000' },
//     purple: { text: '#C957FF', floor: '#773599', gradStart: '#C957FF', gradEnd: '#000000' },
//     pink: { text: '#FF46BB', floor: '#9f2b74', gradStart: '#FF46BB', gradEnd: '#000000' },
// };

export const rankProgression: RaidRank[] = ["F-", "F", "F+", "E-", "E", "E+", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+", "S-", "S", "S+", "SS-", "SS", "SS+", "SSS-", "SSS", "SSS+", "EX-", "EX", "EX+"];

export const raidRankLetters: Record<number, RaidRank> = {
    0: "F-",
    1: "F",
    2: "F+",
    3: "E-",
    4: "E",
    5: "E+",
    6: "D-",
    7: "D",
    8: "D+",
    9: "C-",
    10: "C",
    11: "C+",
    12: "B-",
    13: "B",
    14: "B+",
    15: "A-",
    16: "A",
    17: "A+",
    18: "S-",
    19: "S",
    20: "S+",
    21: "SS-",
    22: "SS",
    23: "SS+",
    24: "SSS-",
    25: "SSS",
    26: "SSS+",
    27: "EX-",
    28: "EX",
    29: "EX+",
} as const;

export const raidRankIndices: Record<RaidRank, number> = {
    "F-": 0,
    "F": 1,
    "F+": 2,
    "E-": 3,
    "E": 4,
    "E+": 5,
    "D-": 6,
    "D": 7,
    "D+": 8,
    "C-": 9,
    "C": 10,
    "C+": 11,
    "B-": 12,
    "B": 13,
    "B+": 14,
    "A-": 15,
    "A": 16,
    "A+": 17,
    "S-": 18,
    "S": 19,
    "S+": 20,
    "SS-": 21,
    "SS": 22,
    "SS+": 23,
    "SSS-": 24,
    "SSS": 25,
    "SSS+": 26,
    "EX-": 27,
    "EX": 28,
    "EX+": 29,
} as const;

export const rankLowerRanges: Record<RaidRank, number> = {
    "F-": 0,
    "F": 100,
    "F+": 200,
    "E-": 500,
    "E": 1_000,
    "E+": 2_000,
    "D-": 5_000,
    "D": 10_000,
    "D+": 20_000,
    "C-": 50_000,
    "C": 100_000,
    "C+": 200_000,
    "B-": 500_000,
    "B": 1_000_000,
    "B+": 2_000_000,
    "A-": 5_000_000,
    "A": 10_000_000,
    "A+": 20_000_000,
    "S-": 50_000_000,
    "S": 100_000_000,
    "S+": 200_000_000,
    "SS-": 500_000_000,
    "SS": 1_000_000_000,
    "SS+": 2_000_000_000,
    "SSS-": 5_000_000_000,
    "SSS": 10_000_000_000,
    "SSS+": 20_000_000_000,
    "EX-": 50_000_000_000,
    "EX": 100_000_000_000,
    "EX+": 200_000_000_000,
} as const;
