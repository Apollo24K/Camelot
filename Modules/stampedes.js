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
    new stampedeInfo(0, "Return of the Goblin King", bossMobs[4], bossMobs[5], enemies[3]),
];

module.exports.stampedes = stampedes;