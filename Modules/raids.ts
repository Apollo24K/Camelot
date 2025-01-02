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
    new RaidInfo(0, "Kael'thian", "B+", raidBosses[0], { accentColor: "#bb3838", phase: 1, phasesTotal: 2, nextPhase: 1 }),
    new RaidInfo(1, "Kael'theron", "B+", raidBosses[1], { accentColor: "#bb3838", phase: 2, phasesTotal: 2 }),
    // magma bursts and eruption
    new RaidInfo(2, "Velourith", "A", raidBosses[2], { accentColor: "#42218f", phase: 1, phasesTotal: 3, nextPhase: 3 }),
    new RaidInfo(3, "Veloura", "A", raidBosses[3], { accentColor: "#42218f", phase: 2, phasesTotal: 3, nextPhase: 4 }),
    new RaidInfo(4, "Velia", "A", raidBosses[4], { accentColor: "#42218f", phase: 3, phasesTotal: 3 }),
    // immune to lightning damage
    new RaidInfo(5, "Zerthrax", "C+", raidBosses[5], { accentColor: "#205991" }),
    // mana dependent boss
    new RaidInfo(6, "Deluvion", "B", raidBosses[6], { accentColor: "#1c8798", phase: 1, phasesTotal: 2, nextPhase: 7 }),
    new RaidInfo(7, "Deluvian", "B", raidBosses[7], { accentColor: "#1c8798", phase: 2, phasesTotal: 2 }),
    // counter boss
    new RaidInfo(8, "Dusty", "D", raidBosses[8], {accentColor: "#c17f59"}),
    // Damage Absorption Manipulation boss
    new RaidInfo(9, "Nekro", "SS-", raidBosses[9], {accentColor: "#4A0404", phase: 1, phasesTotal: 2, nextPhase: 10 }),
    new RaidInfo(10, "NecroVamp", "SS-", raidBosses[10], {accentColor: "#4A0404", phase: 2, phasesTotal: 2 }),
    // Summoner, eat summoned boss
    new RaidInfo(11, "Rootlord Morivar", "S", raidBosses[11], {accentColor: "#3d2412" }),
    // Drains enemy and steals stats
    new RaidInfo(12, "Sapwyrm, the Lifedrainer", "SSS", raidBosses[12], {accentColor: "#235937", phase: 1, phasesTotal: 3, nextPhase: 13 }),
    new RaidInfo(13, "Greater Sapwyrm, the Lifebinder", "SSS", raidBosses[13], {accentColor: "#235937", phase: 2, phasesTotal: 3, nextPhase: 14 }),
    new RaidInfo(14, "Elder Sapwyrm, the Forest Ravager", "SSS", raidBosses[14], {accentColor: "#235937", phase: 3, phasesTotal: 3 }),
    // negates heal, gets miss damage
    new RaidInfo(15, "Sledgefist, the Stone Breaker", "S+", raidBosses[15], {accentColor: "#ff4400", phase: 1, phasesTotal: 2, nextPhase: 16}),
    new RaidInfo(16, "Runesmith Kraghammer", "S+", raidBosses[16], {accentColor: "#ff4400", phase: 2, phasesTotal: 2}),
    // true damage, but shield scales it down
    new RaidInfo(17, "Cake Witch, the Baking Bad", "A+", raidBosses[17], {accentColor: "#23292f"}),
    // reduces max hp, when phys. hit, steals md, gets mr
    new RaidInfo(18, "Velkris/ Kyntheris", "SSS-", raidBosses[18], {accentColor: "#2e1f3e"}),
    // Duo Boss, gets stronger from dodge/ block
    new RaidInfo(19, "DoT Gimmick", "D", raidBosses[19], {accentColor: "#49212a", phase: 1, phasesTotal: 2, nextPhase: 20}),
    new RaidInfo(20, "DoT Gimmick 2", "D", raidBosses[20], {accentColor: "#49212a", phase: 2, phasesTotal: 2}),
    // reflects any dot, but is weak to it
    new RaidInfo(21, "POSTMASTER MALEDICT", "F", raidBosses[21], {accentColor: "#00B4B4"}), 
    // annoying mail
    new RaidInfo(22, "Valkorath, the Dark Sentinel", "A", raidBosses[22], {accentColor: "#2E1F4A", phase: 1, phasesTotal: 3, nextPhase: 23}),
    new RaidInfo(23, "Vortharion, the Warden of Shadows", "A", raidBosses[23], {accentColor: "#2E1F4A", phase: 2, phasesTotal: 3, nextPhase: 24}),
    new RaidInfo(24, "Duskraze, the Umbra Emperor", "A", raidBosses[24], {accentColor: "#2E1F4A", phase: 3, phasesTotal: 3}),
    // Shield play around it boss
];
