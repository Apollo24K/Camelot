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
    // magma bursts and eruption
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

    new RaidInfo(8, "Dusty", "D", raidBosses[8], {accentColor: "#c17f59" }),
    // Damage Absorption Manipulation boss

    new RaidInfo(9, "Nekro", "SS-", raidBosses[9], {accentColor: "#4A0404", phase: 1, phasesTotal: 2, nextPhase: 10 }),
    new RaidInfo(10, "NecroVamp", "SS-", raidBosses[10], {accentColor: "#4A0404", phase: 2, phasesTotal: 2 }),
    // Summoner, eat summoned boss
    new RaidInfo(11, "Rootlord Morivar", "S", raidBosses[10], {accentColor: "#3d2412" }),
    // Drains enemy and steals stats
    new RaidInfo(12, "Sapwyrm, the Lifedrainer", "C", raidBosses[11], {accentColor: "#000000", phase: 1, phasesTotal: 3, nextPhase: 13 }),
    new RaidInfo(13, "Greater Sapwyrm, the Lifebinder", "C", raidBosses[11], {accentColor: "#000000", phase: 2, phasesTotal: 3, nextPhase: 14 }),
    new RaidInfo(14, "Elder Sapwyrm, the Forest Ravager", "C", raidBosses[11], {accentColor: "#000000", phase: 3, phasesTotal: 3 }),
    // 
];
