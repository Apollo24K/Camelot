import { enemyInfo, nightmareMobs } from "./enemies";

type NightmareOptions = {
    accentColor?: string;
    preSelectedChar: number;
};

export default class NightmareInfo {
    private _id: number;
    private _name: string;
    private _occassion: string;
    private _minHp: number;
    private _enemy: enemyInfo;
    private _options: NightmareOptions;

    constructor(id: number, name: string, occassion: string, minHp: number, enemy: enemyInfo, options: NightmareOptions) {
        this._id = id;
        this._name = name;
        this._occassion = occassion;
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
    get occassion() {
        return this._occassion;
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
    get accentColor() {
        return this.options.accentColor ?? "#ff3838";
    };
    get preSelectedChar() {
        return this.options.preSelectedChar;
    }

};

export const nightmares: NightmareInfo[] = [
    // Summer2025
    new NightmareInfo(0, "Tidalfish", "summer2025", 30_000, nightmareMobs[0], { accentColor: "#71afe6ff", preSelectedChar: 9606 }),
    new NightmareInfo(1, "Mari the poisonbearer", "summer2025", 40_000, nightmareMobs[1], { accentColor: "#b495a4ff", preSelectedChar: 9000 }),
    new NightmareInfo(2, "Sand Golem", "summer2025", 50_000, nightmareMobs[2], { accentColor: "#e0d589ff", preSelectedChar: 16195 }),
    new NightmareInfo(3, "Luminous (alter)", "summer2025", 50_000, nightmareMobs[3], { accentColor: "#513f7cff", preSelectedChar: 10517 }),
    new NightmareInfo(4, "Bubble Captain", "summer2025", 50_000, nightmareMobs[4], { accentColor: "#5395ceff", preSelectedChar: 14909 }),
    new NightmareInfo(5, "Dalus the nightmare", "summer2025", 50_000, nightmareMobs[5], { accentColor: "#e7854cff", preSelectedChar: 12398 }),
    new NightmareInfo(6, "Solarion", "summer2025", 50_000, nightmareMobs[6], { accentColor: "#eec80aff", preSelectedChar: 17686 }),
    new NightmareInfo(7, "Victoria the Dragonslayer", "summer2025", 50_000, nightmareMobs[7], { accentColor: "#c26d57ff", preSelectedChar: 24798 }),
    new NightmareInfo(8, "Anastasia", "summer2025", 50_000, nightmareMobs[8], { accentColor: "#a641c4ff", preSelectedChar: 10528 }),
    new NightmareInfo(9, "Espathera", "summer2025", 50_000, nightmareMobs[9], { accentColor: "#504953ff", preSelectedChar: 405 }),
    new NightmareInfo(10, "Icecream", "summer2025", 50_000, nightmareMobs[10], { accentColor: "#56d79bff", preSelectedChar: 12394 }),
    new NightmareInfo(11, "Juliette", "summer2025", 50_000, nightmareMobs[11], { accentColor: "#aeebf5ff", preSelectedChar: 21929 }),
];
