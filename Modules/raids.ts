import { RaidRank } from "../types";
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
    private _enemy: enemyInfo;
    private _options: RaidOptions;

    constructor(id: number, name: string, rank: RaidRank, enemy: enemyInfo, options: RaidOptions = {}) {
        this._id = id;
        this._name = name;
        this._rank = rank;
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
    }

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
};

export const raids: RaidInfo[] = [
    // Magma bursts and eruption
    //* Magma
    new RaidInfo(0, "Kael'thian", "B+", raidBosses[0], { accentColor: "#bb3838", phase: 1, phasesTotal: 2, nextPhase: 1 }),
    new RaidInfo(1, "Kael'theron", "B+", raidBosses[1], { accentColor: "#bb3838", phase: 2, phasesTotal: 2 }),

    // Immune to lightning damage
    //* Lightning
    new RaidInfo(2, "Velourith", "A", raidBosses[2], { accentColor: "#42218f", phase: 1, phasesTotal: 3, nextPhase: 3 }),
    new RaidInfo(3, "Veloura", "A", raidBosses[3], { accentColor: "#42218f", phase: 2, phasesTotal: 3, nextPhase: 4 }),
    new RaidInfo(4, "Velia", "A", raidBosses[4], { accentColor: "#42218f", phase: 3, phasesTotal: 3 }),

    // Mana dependent boss
    //* Mana
    new RaidInfo(5, "Zerthrax", "C+", raidBosses[5], { accentColor: "#205991" }),

    // Counter boss
    //* Counter
    new RaidInfo(6, "Deluvion", "B", raidBosses[6], { accentColor: "#1c8798", phase: 1, phasesTotal: 2, nextPhase: 7 }),
    new RaidInfo(7, "Deluvian", "B", raidBosses[7], { accentColor: "#1c8798", phase: 2, phasesTotal: 2 }),

    // Damage Absorption Manipulation boss
    //* Dusty
    new RaidInfo(8, "Dusty", "D", raidBosses[8], { accentColor: "#ffa500" }),

    // Summoner, eat summoned boss
    //* Nekro
    new RaidInfo(9, "Nekro", "SS-", raidBosses[9], { accentColor: "#00ffbf", phase: 1, phasesTotal: 2, nextPhase: 10 }),
    new RaidInfo(10, "NecroVamp", "SS-", raidBosses[10], { accentColor: "#ff0040", phase: 2, phasesTotal: 2 }),

    // Drains enemy and steals stats
    //* Drain
    new RaidInfo(11, "Rootlord Morivar", "S", raidBosses[11], { accentColor: "#7f6553" }),

    // Negates heal, gets miss damage
    //* NoHeal
    new RaidInfo(12, "Sapwyrm", "SSS", raidBosses[12], { accentColor: "#00ff3d", phase: 1, phasesTotal: 3, nextPhase: 13 }),
    new RaidInfo(13, "Greater Sapwyrm", "SSS", raidBosses[13], { accentColor: "#00ff3d", phase: 2, phasesTotal: 3, nextPhase: 14 }),
    new RaidInfo(14, "Elder Sapwyrm", "SSS", raidBosses[14], { accentColor: "#00a621", phase: 3, phasesTotal: 3 }),

    // True damage, but shield scales it down
    //* Hammer
    new RaidInfo(15, "Sledgefist", "S+", raidBosses[15], { accentColor: "#ff3a00", phase: 1, phasesTotal: 2, nextPhase: 16 }),
    new RaidInfo(16, "Kraghammer", "S+", raidBosses[16], { accentColor: "#ff3a00", phase: 2, phasesTotal: 2 }),

    // Reduces max hp, when phys. hit, steals md, gets mr
    //* Cakey
    new RaidInfo(17, "Cake Witch", "A+", raidBosses[17], { accentColor: "#000000" }),

    // Duo Boss, gets stronger from dodge/ block
    //* Duo
    new RaidInfo(18, "Velkris/Kyntheris", "SSS-", raidBosses[18], { accentColor: "#b2eeff" }),

    // Reflects any dot, but is weak to it
    //* DoT Gimmick
    new RaidInfo(19, "Hooded Hopper", "D", raidBosses[19], { accentColor: "#ff00bc", phase: 1, phasesTotal: 2, nextPhase: 20 }),
    new RaidInfo(20, "Hooded Striker", "D", raidBosses[20], { accentColor: "#7b0013", phase: 2, phasesTotal: 2 }),

    // annoying mail
    //* Mail
    new RaidInfo(21, "POSTMASTER MALEDICT", "B", raidBosses[21], { accentColor: "#ffd000" }),

    // Shield play around it boss
    //* ShieldMan
    new RaidInfo(22, "Valkorath", "A", raidBosses[22], { accentColor: "#5f00ff", phase: 1, phasesTotal: 3, nextPhase: 23 }),
    new RaidInfo(23, "Vortharion", "A", raidBosses[23], { accentColor: "#5f00ff", phase: 2, phasesTotal: 3, nextPhase: 24 }),
    new RaidInfo(24, "Duskraze", "A", raidBosses[24], { accentColor: "#5f00ff", phase: 3, phasesTotal: 3 }),
];
