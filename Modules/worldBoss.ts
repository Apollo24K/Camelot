// import { RaidRank } from "../types";
// import { raidRankIndices } from "./components";
// import { enemyInfo, worldBossEnemies } from "./enemies";

// export const GLOBAL_BOSS_HP = 50_000_000;
// export const GLOBAL_BOSS_CHANNEL_ID = "1546520915536248892";

// export type WorldBossEntry = {
//     name: string;
//     rank: RaidRank;
//     maxRank: RaidRank;
//     minHp: number;
//     enemy: enemyInfo;
//     accentColor: string;
//     gadgets: [number, number, number, number]; // [unique, legendary, mythical, genesis]
// };

// export function getRankHp(minHp: number, rank: RaidRank): number {
//     const diff = raidRankIndices[rank] - raidRankIndices["C-"];

//     let mult = 1;
//     for (let i = 0; i < diff; i++) {
//         if (i % 3 === 2) mult *= 1.7;
//         else mult *= 1.5;
//     };

//     return Math.floor((minHp * mult) / 10) * 10;
// };

// export const worldBosses: WorldBossEntry[] = [
//     { name: "Rudgiroth", rank: "A+", maxRank: "EX+", minHp: 5_000_000, enemy: worldBossEnemies[0], accentColor: "#bb3838", gadgets: [861, 862, 863, 864] },
//     { name: "Staccato", rank: "A+", maxRank: "EX+", minHp: 5_000_000, enemy: worldBossEnemies[1], accentColor: "#4fc3f7", gadgets: [865, 866, 867, 868] },
//     { name: "Nighthollow", rank: "A+", maxRank: "EX+", minHp: 5_800_000, enemy: worldBossEnemies[2], accentColor: "#42218f", gadgets: [869, 870, 871, 872] },
//     { name: "The End", rank: "A+", maxRank: "EX+", minHp: 5_200_000, enemy: worldBossEnemies[3], accentColor: "#1a0033", gadgets: [873, 874, 875, 876] },
//     { name: "Fish of the Tides", rank: "A+", maxRank: "EX+", minHp: 5_000_000, enemy: worldBossEnemies[4], accentColor: "#2e7d32", gadgets: [877, 878, 879, 880] },
//     { name: "Luminous (alter)", rank: "A+", maxRank: "EX+", minHp: 5_000_000, enemy: worldBossEnemies[5], accentColor: "#00bcd4", gadgets: [881, 882, 883, 884] },
//     { name: "Dalus the Nightmare", rank: "A+", maxRank: "EX+", minHp: 5_000_000, enemy: worldBossEnemies[6], accentColor: "#ffd54f", gadgets: [885, 886, 887, 888] },
//     { name: "Mari the poisonbearer", rank: "A+", maxRank: "EX+", minHp: 5_000_000, enemy: worldBossEnemies[7], accentColor: "#0d47a1", gadgets: [889, 890, 891, 892] },
//     { name: "Anti Spiral", rank: "A+", maxRank: "EX+", minHp: 5_000_000, enemy: worldBossEnemies[8], accentColor: "#ff6f00", gadgets: [893, 894, 895, 896] },
//     { name: "Hajun", rank: "A+", maxRank: "EX+", minHp: 5_000_000, enemy: worldBossEnemies[9], accentColor: "#9c27b0", gadgets: [897, 898, 899, 900] },
// ];
