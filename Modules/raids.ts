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
    new RaidInfo(0, "Kael'thian", "B+", raidBosses[0], { phase: 1, phasesTotal: 2, nextPhase: 1 }),
    new RaidInfo(1, "Kael'theron", "B+", raidBosses[1], { phase: 2, phasesTotal: 2 }),

    new RaidInfo(2, "Velourith", "A", raidBosses[2], { accentColor: "#42218f", phase: 1, phasesTotal: 3, nextPhase: 3 }),
    new RaidInfo(3, "Veloura", "A", raidBosses[3], { accentColor: "#42218f", phase: 2, phasesTotal: 3, nextPhase: 4 }),
    new RaidInfo(4, "Velia", "A", raidBosses[4], { accentColor: "#42218f", phase: 3, phasesTotal: 3 }),

    new RaidInfo(5, "Zerthrax", "C+", raidBosses[5], { accentColor: "#205991" }),

    new RaidInfo(6, "Deluvion", "B", raidBosses[6], { accentColor: "#1c8798", phase: 1, phasesTotal: 2, nextPhase: 7 }),
    new RaidInfo(7, "Deluvian", "B", raidBosses[7], { accentColor: "#1c8798", phase: 2, phasesTotal: 2 }),

];
