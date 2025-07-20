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
    // preSelectedChar has random char ids until we figure out the actual pre-selected characters
    new NightmareInfo(0, "Tidalfish", "summer2025", 30_000, nightmareMobs[0], { accentColor: "#bb3838", preSelectedChar: 17689  }),
    new NightmareInfo(1, "Sandy", "summer2025", 40_000, nightmareMobs[1], { accentColor: "#bb3838", preSelectedChar: 2 }),
    new NightmareInfo(2, "Bubblium", "summer2025", 4_049_010, nightmareMobs[2], { accentColor: "#42218f", preSelectedChar: 3 }),
    new NightmareInfo(3, "Iscream", "summer2025", 4_304_130, nightmareMobs[3], { accentColor: "#42218f", preSelectedChar: 4 }),
    new NightmareInfo(4, "Solarion", "summer2025", 4_382_320, nightmareMobs[4], { accentColor: "#42218f", preSelectedChar: 5 }),
];