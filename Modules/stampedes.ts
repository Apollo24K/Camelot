import { enemies, bossMobs } from "./enemies";

interface StampedeEnemy {
    info: any; // TODO: Add proper type from enemies.ts
    left: string;
};

interface StampedeStats {
    // TODO: Add stats interface
};

class StampedeInfo {
    private _id: number;
    private _title: string;
    private _boss: StampedeEnemy;
    private _general: StampedeEnemy;
    private _monster: StampedeEnemy;
    private _stats?: StampedeStats;

    constructor(id: number, title: string, boss: StampedeEnemy, general: StampedeEnemy, monster: StampedeEnemy, stats?: StampedeStats) {
        this._id = id;
        this._title = title;
        this._boss = boss;
        this._general = general;
        this._monster = monster;
        this._stats = stats;
    };

    get id(): number {
        return this._id;
    };
    get title(): string {
        return this._title;
    };
    get boss(): StampedeEnemy {
        return this._boss;
    };
    get general(): StampedeEnemy {
        return this._general;
    };
    get monster(): StampedeEnemy {
        return this._monster;
    };
    get stats(): StampedeStats | undefined {
        return this._stats;
    };
};

export const stampedes: StampedeInfo[] = [
    new StampedeInfo(0, "Return of the Goblin King", { info: bossMobs[4], left: "Goblin King" }, { info: bossMobs[5], left: "Goblin Generals" }, { info: enemies[3], left: "Goblins defeated" }),

    new StampedeInfo(1, "Curse of the Hollow Fiends", { info: bossMobs[6], left: "Pumpkin Lord" }, { info: bossMobs[7], left: "Pumpkin Generals" }, { info: bossMobs[8], left: "Pumpkin Imps defeated" }),

    new StampedeInfo(2, "Eggstravaganza of the Shells", { info: bossMobs[9], left: "Eggsplorer" }, { info: bossMobs[10], left: "Eggsecutioners" }, { info: bossMobs[11], left: "Eggs defeated" }),
];