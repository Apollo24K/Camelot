const { enemies, bossMobs } = require("./enemies.js");

class stampedeInfo {
    constructor(id, title, boss, general, monster, stats) {
        this._id = id;
        this._title = title;
        this._boss = boss;
        this._general = general;
        this._monster = monster;
        this._stats = stats;
    };

    get id() {
        return this._id;
    };
    get title() {
        return this._title;
    };
    get boss() {
        return this._boss;
    };
    get general() {
        return this._general;
    };
    get monster() {
        return this._monster;
    };
};

const stampedes = [
    new stampedeInfo(0, "Return of the Goblin King", { info: bossMobs[4], left: "Goblin King" }, { info: bossMobs[5], left: "Goblin Generals" }, { info: enemies[3], left: "Goblins defeated" }),

    new stampedeInfo(1, "Curse of the Hollow Fiends", { info: bossMobs[6], left: "Pumpkin Lord" }, { info: bossMobs[7], left: "Pumpkin General" }, { info: bossMobs[8], left: "Pumpkin Imps defeated" }),
];

module.exports.stampedes = stampedes;