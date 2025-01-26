import fs from 'fs';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { RaidRank } from '../types';

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

export const requestVerification = new Map();
export const dungeonTempBan = new Map();

export const botPfp = "https://i.ibb.co/mDX54t4/Ta2YDBN.png";

export const donationWeekStart = new Date('2024-02-12T00:00:00');

export const shardEmoji = {
    "EX": "<:ss_shard:917203009543503892>",
    "SS": "<:ss_shard:917203009543503892>",
    "S": "<:s_shard:917202925514817566>",
    "A": "<:a_shard:917202904862052392>",
    "B": "<:b_shard:917202862851899392>",
    "C": "<:c_shard:917202862499582002>",
    "D": "<:d_shard:917202840563363891>",
};

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
