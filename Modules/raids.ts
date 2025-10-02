import { RaidRank } from "../types";
import { raidRankIndices } from "./components";
import { enemyInfo, raidBosses } from "./enemies";

type RaidOptions = {
    accentColor?: string;
    phase?: number;
    phasesTotal?: number;
    nextPhase?: number;
};

export default class RaidInfo {
    private _id: number;
    private _name: string;
    private _rank: RaidRank;
    private _maxRank: RaidRank;
    private _minHp: number;
    private _enemy: enemyInfo;
    private _options: RaidOptions;

    constructor(id: number, name: string, rank: RaidRank, maxRank: RaidRank, minHp: number, enemy: enemyInfo, options: RaidOptions = {}) {
        this._id = id;
        this._name = name;
        this._rank = rank;
        this._maxRank = maxRank;
        this._minHp = minHp;
        this._enemy = enemy;
        this._options = options;
    };

    get id() {
        return this._id;
    };
    get name() {
        return this._name;
    };
    get rank() {
        return this._rank;
    };
    get maxRank() {
        return this._maxRank;
    };
    get minHp() {
        return this._minHp;
    };
    get enemy() {
        return this._enemy;
    };
    get ability() {
        return this.enemy.ability;
    };
    get options() {
        return this._options;
    };

    get loot() {
        return this.enemy.loot;
    };
    get rankValue() {
        return raidRankIndices[this.rank];
    };
    get maxRankValue() {
        return raidRankIndices[this.maxRank];
    };

    get accentColor() {
        return this.options.accentColor ?? "#ff3838";
    };

    get phase() {
        return this.options.phase || 1;
    };
    get phasesTotal() {
        return this.options.phasesTotal || 1;
    };
    get nextPhase() {
        return this.options.nextPhase;
    };

    getRankHp(rank: RaidRank) {
        const diff = raidRankIndices[rank] - raidRankIndices["C-"];

        let mult = 1;
        for (let i = 0; i < diff; i++) {
            if (i % 3 === 2) mult *= 1.7; // 1.56;
            else mult *= 1.5; // 1.4;
        };

        return Math.floor((this.minHp * mult) / 10) * 10;
    };
    getTotalRankHp(rank: RaidRank) {
        let sum = this.getRankHp(rank);

        let nextPhase = this.nextPhase ? raids[this.nextPhase] : undefined;
        while (nextPhase) {
            sum += nextPhase.getRankHp(rank);
            nextPhase = nextPhase.nextPhase ? raids[nextPhase.nextPhase] : undefined;
        };

        return Math.floor(sum);
    };
};

export const raids: RaidInfo[] = [
    // Magma bursts and eruption
    //* Magma
    new RaidInfo(0, "Kael'thian", "C-", "EX+", 5_262_570, raidBosses[0], { accentColor: "#bb3838", phase: 1, phasesTotal: 2, nextPhase: 1 }),
    new RaidInfo(1, "Kael'theron", "C-", "EX+", 6_937_330, raidBosses[1], { accentColor: "#bb3838", phase: 2, phasesTotal: 2 }),

    // Immune to lightning damage
    //* Lightning
    new RaidInfo(2, "Velourith", "A-", "EX+", 4_049_010, raidBosses[2], { accentColor: "#42218f", phase: 1, phasesTotal: 3, nextPhase: 3 }),
    new RaidInfo(3, "Veloura", "A-", "EX+", 4_304_130, raidBosses[3], { accentColor: "#42218f", phase: 2, phasesTotal: 3, nextPhase: 4 }),
    new RaidInfo(4, "Velia", "A-", "EX+", 4_382_320, raidBosses[4], { accentColor: "#42218f", phase: 3, phasesTotal: 3 }),

    // Mana dependent boss
    //* Mana
    new RaidInfo(5, "Zerthrax", "A+", "EX+", 12_787_170, raidBosses[5], { accentColor: "#205991" }),

    // Counter boss
    //* Counter
    new RaidInfo(6, "Deluvion", "A", "EX+", 9_765_490, raidBosses[6], { accentColor: "#1c8798", phase: 1, phasesTotal: 2, nextPhase: 7 }),
    new RaidInfo(7, "Deluvian", "A", "EX+", 11_417_820, raidBosses[7], { accentColor: "#1c8798", phase: 2, phasesTotal: 2 }),

    // Damage Absorption Manipulation boss
    //* Dusty
    new RaidInfo(8, "Dusty", "B-", "EX+", 19_011_620, raidBosses[8], { accentColor: "#ffa500" }),

    // Summoner, eat summoned boss
    //* Nekro
    new RaidInfo(9, "Nekro", "B+", "EX+", 4_557_710, raidBosses[9], { accentColor: "#00ffbf", phase: 1, phasesTotal: 2, nextPhase: 10 }),
    new RaidInfo(10, "NecroVamp", "B+", "EX+", 5_253_630, raidBosses[10], { accentColor: "#ff0040", phase: 2, phasesTotal: 2 }),

    // Drains enemy and steals stats
    //* Drain
    new RaidInfo(11, "Rootlord Morivar", "S", "EX+", 5_926_970, raidBosses[11], { accentColor: "#7f6553" }),

    // Negates heal, gets miss damage
    //* NoHeal
    new RaidInfo(12, "Sapwyrm", "C", "EX+", 1_767_670, raidBosses[12], { accentColor: "#00ff3d", phase: 1, phasesTotal: 3, nextPhase: 13 }),
    new RaidInfo(13, "Greater Sapwyrm", "C", "EX+", 2_820_270, raidBosses[13], { accentColor: "#00ff3d", phase: 2, phasesTotal: 3, nextPhase: 14 }),
    new RaidInfo(14, "Elder Sapwyrm", "C", "EX+", 3_557_310, raidBosses[14], { accentColor: "#00a621", phase: 3, phasesTotal: 3 }),

    // True damage, but shield scales it down
    //* Hammer
    new RaidInfo(15, "Sledgefist", "C+", "EX+", 5_566_470, raidBosses[15], { accentColor: "#ff3a00", phase: 1, phasesTotal: 2, nextPhase: 16 }),
    new RaidInfo(16, "Kraghammer", "C+", "EX+", 7_203_280, raidBosses[16], { accentColor: "#ff3a00", phase: 2, phasesTotal: 2 }),

    // Reduces max hp, when phys. hit, steals md, gets mr
    //* Cakey
    new RaidInfo(17, "Cake Witch", "S-", "EX+", 7_202_440, raidBosses[17], { accentColor: "#000000" }),

    // Duo Boss, gets stronger from dodge/ block
    //* Duo
    new RaidInfo(18, "Velkris/Kyntheris", "S+", "EX+", 4_072_380, raidBosses[18], { accentColor: "#b2eeff" }),

    // Reflects any dot, but is weak to it
    //* DoT Gimmick
    new RaidInfo(19, "Hooded Hopper", "B", "EX+", 14_840_230, raidBosses[19], { accentColor: "#ff00bc", phase: 1, phasesTotal: 2, nextPhase: 20 }),
    new RaidInfo(20, "Hooded Striker", "B", "EX+", 16_719_800, raidBosses[20], { accentColor: "#7b0013", phase: 2, phasesTotal: 2 }),

    // annoying mail
    //* Mail
    new RaidInfo(21, "POSTMASTER MALEDICT", "B-", "EX+", 25_008_690, raidBosses[21], { accentColor: "#ffd000" }),

    // Shield play around it boss
    //* ShieldMan
    new RaidInfo(22, "Valkorath", "A", "EX+", 5_140_690, raidBosses[22], { accentColor: "#5f00ff", phase: 1, phasesTotal: 3, nextPhase: 23 }),
    new RaidInfo(23, "Vortharion", "A", "EX+", 6_720_070, raidBosses[23], { accentColor: "#5f00ff", phase: 2, phasesTotal: 3, nextPhase: 24 }),
    new RaidInfo(24, "Duskraze", "A", "EX+", 8_416_550, raidBosses[24], { accentColor: "#5f00ff", phase: 3, phasesTotal: 3 }),
];
