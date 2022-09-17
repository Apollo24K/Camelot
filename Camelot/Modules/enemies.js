class enemyInfo {
    constructor(name, species, title, boss, blvl, hp, atk, def, image, floor, id) {
        this._name = name;
        this._species = species;
        this._title = title;
        this._boss = boss;
        this._blvl = blvl;
        this._hp = hp;
        this._atk = atk;
        this._def = def;
        this._image = image;
        this._floor = floor;
        this._id = id;
    };

    get name() {
        return this._name;
    };
    get species() {
        return this._species;
    };
    get title() {
        return this._title;
    };
    get boss() {
        return this._boss;
    };
    get blvl() {
        return this._blvl;
    };
    hp(fl) {
        // 100-200HP, Floor 1-10 || min=(min+((max-min)/floorsTotal)*(floor-1)) max=(min+((max-min)/floorsTotal)*floor) || ((200-100)/10)*FL
        return parseInt(this._hp.split("-")[0]) + Math.floor(Math.random() * (((parseInt(this._hp.split("-")[1]) - parseInt(this._hp.split("-")[0]))/this.floor[this.floor.length-1]) * fl +1));
        // (min+((max-min)/floorsTotal)*(floor+(-1+Math.random())))
    };
    atk(fl) {
        return parseInt(this._atk.split("-")[0]) + Math.floor(Math.random() * (((parseInt(this._atk.split("-")[1]) - parseInt(this._atk.split("-")[0]))/this.floor[this.floor.length-1]) * fl +1));
    };
    def(fl) {
        return parseInt(this._def.split("-")[0]) + Math.floor(Math.random() * (((parseInt(this._def.split("-")[1]) - parseInt(this._def.split("-")[0]))/this.floor[this.floor.length-1]) * fl +1))
    };
    get hpr() {
        return this._hp.split("-");
    };
    get atkr() {
        return this._atk.split("-");
    };
    get defr() {
        return this._def.split("-");
    };
    get image() {
        return this._image;
    };
    get floor() {
        return this._floor;
    };
    get id() {
        return this._id;
    };
    stats(fl) {
        let eHp = Math.floor(this.hp(fl) * 1.6);
        let eAtk = Math.floor(this.atk(fl) * 1.25);
        let eDef = this.def(fl);
        let eEp = Math.floor(((eHp/Math.pow(0.99818,eDef)) / (200/eAtk))*100) / 100;
        return [eHp, eAtk, eDef, eEp];
    };
};

const enemies = [
    new enemyInfo("Slime", "Slime", "a Slime", false, 1, "80-300", "25-80", "10-70", ["https://i.ibb.co/yWHMQT9/slime.png"], [1,2,3,4,6,7,8,9], 0),
    new enemyInfo("Skeleton", "Skeleton", "a Skeleton", false, 1, "60-280", "30-130", "20-50", ["https://i.ibb.co/Hz73P9Q/s.png", "https://i.ibb.co/SVKxHF4/s.png"], [1,2,3,4,6,7,8,9], 1),
    new enemyInfo("Direwolf", "Direwolf", "a Direwolf", false, 1, "100-320", "35-130", "40-80", ["https://i.ibb.co/3yky5nD/D.png"], [1,2,3,4,6,7,8,9], 2),
    new enemyInfo("Goblin", "Goblin", "a Goblin", false, 1, "130-400", "50-180", "40-100", ["https://i.ibb.co/jfBtZ1Q/g1.png", "https://i.ibb.co/b1YMVnv/g3.png", "https://i.ibb.co/64vWDRt/g.png"], [3,4,6,7,8,9,11,12,13,14], 3),
    new enemyInfo("Skeleton Soldier", "Skeleton", "a Skeleton", true, 1, "200-200", "90-90", "65-65", ["https://i.ibb.co/chdgQGf/ss.png"], [5], 4),
    new enemyInfo("Retar", "Wolf", "a Wolf", false, 1, "180-360", "80-160", "70-120", ["https://i.ibb.co/0BDYjvG/r.png"], [6,7,8,9,11,12,13,14], 5),
    new enemyInfo("Werewolf", "Werewolf", "a Werewolf", false, 1, "200-420", "90-170", "70-130", ["https://i.ibb.co/8x5RRPB/w.png", "https://i.ibb.co/VqkvYLW/w2.png", "https://i.ibb.co/qkXNdcp/w7.png", "https://i.ibb.co/YRs6L0y/w0.png"], [6,7,8,9,11,12,13,14], 6),
    new enemyInfo("Illfang", "Kobold Lord", "the Kobold Lord", true, 1, "420-420", "130-130", "75-75", ["https://i.ibb.co/GH0gJxG/il.png"], [10], 7),
    new enemyInfo("Skeleton Wolf", "Skeleton Wolf", "a Skeleton Wolf", false, 1, "320-420", "130-150", "60-100", ["https://i.ibb.co/Stp0dCT/sw.png"], [11,12,13,14], 8),
    new enemyInfo("Death Spot", "Werewolf", "a Werewolf", true, 1, "500-500", "150-150", "101-101", ["https://i.ibb.co/6JRGgSK/spot.png"], [15], 9),
    new enemyInfo("Silverwing", "Silverwing", "a Silverwing", false, 1, "550-730", "120-180", "110-170", ["https://i.ibb.co/X2fz8cc/silverwing.png"], [16,17,18,19,21,22,23,24], 10),
    new enemyInfo("Lizardman", "Lizardman", "a Lizardman", false, 1, "480-640", "140-210", "105-160", ["https://i.ibb.co/GnXmw3y/l3.png", "https://i.ibb.co/1Kym5M8/l2.png", "https://i.ibb.co/7Xk3LYz/l.png", "https://i.ibb.co/pvg2jGn/li.png", "https://i.ibb.co/d4sYN2k/L1.png"], [16,17,18,19,21,22,23,24], 11),
    new enemyInfo("Geld", "Orc Lord", "the Orc Lord", true, 1, "620-620", "180-180", "150-150", ["https://i.ibb.co/2q7VXkT/rc.png"], [20], 12),
    new enemyInfo("Serpent", "Serpent", "a Serpent", false, 1, "580-650", "160-205", "130-155", ["https://i.ibb.co/jGFxTrZ/s.png"], [21,22,23,24], 13),
    new enemyInfo("Beru", "Ant King", "the Ant King", true, 1, "640-640", "200-200", "180-180", ["https://i.ibb.co/6Dx3Mdd/b.png"], [25], 14),
    new enemyInfo("Kaonashi", "Ghost", "a Ghost", false, 1, "800-900", "150-160", "160-180", ["https://i.ibb.co/ZNRSPXs/gh.png"], [21,22,23,24,26,27,28,29], 15),
    new enemyInfo("Zenberu", "Dragon Tusk", "a Dragon Tusk", true, 1, "980-980", "185-185", "125-125", ["https://i.ibb.co/yV3YW6B/image.png"], [30], 16),
    new enemyInfo("Sky Dragon", "Sky Dragon", "a Sky Dragon", false, 1, "920-1200", "170-210", "200-200", ["https://i.ibb.co/XDgVQmT/sd.png", "https://i.ibb.co/FJbBpc6/sd2.png"], [31,32,33,34,36,37,38,39], 17),
    new enemyInfo("Gleam Eyes", "Minotaur", "a Minotaur", true, 1, "1130-1130", "200-200", "150-150", ["https://i.ibb.co/VL0Kxmz/ge.png"], [35], 18),
    new enemyInfo("Bicorn", "Bicorn", "a Bicorn", false, 1, "1080-1340", "180-240", "170-195", ["https://i.ibb.co/hLwMYSn/bc.png"], [36,37,38,39,41,42,43,44], 19),
    new enemyInfo("Entoma", "Arachnoid", "an Arachnoid", true, 1, "1260-1260", "230-230", "160-160", ["https://i.ibb.co/XkFT4pM/e.png"], [40], 20),
    new enemyInfo("CZ2128 Delta", "Automaton", "an Automaton", true, 1, "1370-1370", "260-260", "130-130", ["https://i.ibb.co/FsSx42T/cz.png"], [45], 21),
    new enemyInfo("Earth Golem", "Golem", "an Earth Golem", false, 1, "1320-1540", "170-240", "250-280", ["https://i.ibb.co/C2fHr5M/gl.png"], [41,42,43,44,46,47,48,49], 22),
    new enemyInfo("Narberal Gamma", "Doppelgänger", "a Doppelgänger", true, 1, "1520-1520", "280-280", "210-210", ["https://i.ibb.co/f1WjFRH/g.png"], [50], 23),
    new enemyInfo("Ice Golem", "Golem", "an Ice Golem", false, 1, "1430-1580", "220-270", "270-285", ["https://i.ibb.co/bN7RBX3/igg.png"], [46,47,48,49,51,52,53,54], 24),
    new enemyInfo("Lupusregina Beta", "Werewolf", "a Werewolf", true, 1, "1590-1590", "310-310", "250-250", ["https://i.ibb.co/F5Brx59/beta.png"], [55], 25),
    new enemyInfo("Fire Golem", "Golem", "a Fire Golem", false, 1, "1510-1630", "270-340", "280-335", ["https://i.ibb.co/kVLJGgH/fg.png"], [51,52,53,54,56,57,58,59], 26),
    new enemyInfo("Cocytus", "Vermin Lord", "a Vermin Lord", true, 1, "1360-1360", "375-375", "500-500", ["https://i.ibb.co/Z6JGcQ4/c.png"], [60], 27),
    new enemyInfo("Wight", "Wight", "a Wight", false, 1, "1300-1900", "380-460", "380-440", ["https://i.ibb.co/6yDHvNw/wk.png"], [61,62,63,64,66,67,68,69,71,72,73,74], 28),
    new enemyInfo("Demiurge", "Arch Devil", "an Arch Devil", true, 1, "1420-1420", "500-500", "380-380", ["https://i.ibb.co/1Z4Rb2N/d.png"], [65], 29),
    new enemyInfo("Death Dragon", "Death Dragon", "a Death Dragon", false, 1, "1870-2180", "420-450", "290-320", ["https://i.ibb.co/yY5xhzB/d.png"], [66,67,68,69,71,72,73,74], 30),
    new enemyInfo("Albert", "Death Paladin", "a Death Paladin", true, 1, "2120-2120", "500-500", "420-420", ["https://i.ibb.co/tHkgdwJ/albert.png"], [70], 31),
    new enemyInfo("Adalman", "Wight King", "the Wight King", true, 1, "2460-2460", "580-580", "300-300", ["https://i.ibb.co/17mGxbM/a.png"], [75], 32),
    new enemyInfo("Treant", "Treant", "a Treant", false, 1, "2020-2620", "460-580", "500-600", ["https://i.ibb.co/yn6wcSR/Treant.png"], [76,77,78,79,81,82,83,84], 33),
    new enemyInfo("Hercules", "Demigod", "a Demigod", true, 1, "3080-3080", "600-600", "800-800", ["https://i.ibb.co/PTLf68Z/h.png"], [80], 34),
    new enemyInfo("Brain Eater", "Brain Eater", "a Brain Eater", false, 1, "2600-3600", "550-750", "420-460", ["https://i.ibb.co/zXTZkW7/brain-eater.jpg"], [81,82,83,84,86,87,88,89], 35),
    new enemyInfo("Enkidu", "Homunculus", "a Homunculus", true, 1, "3430-3430", "720-720", "620-620", ["https://i.ibb.co/qgLmpzb/hc.png"], [85], 36),
    new enemyInfo("Death Knight", "Death Knight", "a Death Knight", false, 1, "2850-3800", "440-680", "800-1000", ["https://i.ibb.co/JvSdTvr/death-knight.png"], [81,82,83,84,86,87,88,89], 37),
    new enemyInfo("Albedo", "Succubus", "a Succubus", true, 1, "4200-4200", "800-800", "800-800", ["https://i.ibb.co/XDZpgFd/ab.png"], [90], 38),
    new enemyInfo("Gilgamesh", "Demigod", "a Demigod", true, 1, "4960-4960", "1080-1080", "1000-1000", ["https://i.ibb.co/8zQhj3V/k.png"], [91], 39),
    new enemyInfo("King Hassan", "Servant", "a Servant", true, 1, "5170-5170", "1360-1360", "1180-1180", ["https://i.ibb.co/DtTZsRv/ha.png"], [92], 40),
    new enemyInfo("Diablo", "Primordial Demon", "a Primordial Demon", true, 1, "6666-6666", "1420-1420", "1360-1360", ["https://i.ibb.co/yk3P2f9/noir.png"], [93], 41),
    new enemyInfo("Raphael", "Demon Slime", "the Voice of the World", true, 1, "8360-8360", "1500-1500", "1400-1400", ["https://i.ibb.co/dgwF05f/R.png"], [94], 42),
    new enemyInfo("Guy Crimson", "Primordial Demon", "a Demon Lord", true, 1, "9670-9670", "1860-1860", "1620-1620", ["https://i.ibb.co/y4Rjv3L/guy.png"], [95], 43),
    new enemyInfo("Igneel", "Dragon", "a Fire Dragon", true, 1, "12800-12800", "2000-2000", "1800-1800", ["https://i.ibb.co/6Bck42F/igneel.png"], [96], 44),
    new enemyInfo("Acnologia", "Dragon", "the Dragon King", true, 1, "15060-15060", "2520-2520", "1960-1960", ["https://i.ibb.co/qNXB6sm/acnnologia.png"], [97], 45),
    new enemyInfo("Vaision", "Dragon", "a Dragon Lord", true, 1, "18280-18280", "2890-2890", "2222-2222", ["https://i.ibb.co/DDVwf6b/pdl.png"], [98], 46),
    new enemyInfo("Ainz Ooal Gown", "Overlord", "the Overlord", true, 1, "36480-36480", "5720-5720", "4200-4200", ["https://i.ibb.co/9NZgKGJ/aog.png"], [99], 47),
    new enemyInfo("Veldora", "True Dragon", "a True Dragon", true, 1, "89760-89760", "16280-16280", "18420-18420", ["https://i.ibb.co/DrSCF5S/veldora.png"], [100], 48),
];

module.exports.enemies = enemies;