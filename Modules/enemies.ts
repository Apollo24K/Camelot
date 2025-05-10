import { ActionRowBuilder, ButtonStyle, ButtonBuilder } from "discord.js";
import { Buffs, CharacterRarity, DetailedStats, Gender, IenemyInfo, IentityInfo, IskillInfo } from "../types";
import buffInfo from "./buffs";
import delayedBuffs from "./delayedBuffs";
import { dealDamage, addHeal, customEmojis } from "./functions";
import skillInfo from "./skills";
import { AbilityResponse } from "./components";

export class enemyInfo implements IenemyInfo {
    private _name: string;
    private _species: string;
    private _title: string;
    private _gender: Gender;
    private _boss: boolean;
    private _setStats: object;
    private _multStats: object;
    private _addStats: object;
    private _loot: number[];
    private _image: Array<`https://${string}`>;
    private _floor: number[];
    private _id: number;
    private _ability?: IskillInfo;

    constructor(name: string, species: string, title: string, gender: Gender, boss: boolean, setStats: object, multStats: object, addStats: object, loot: number[], image: Array<`https://${string}`>, floor: number[], id: number, ability?: IskillInfo) {
        this._name = name;
        this._species = species;
        this._title = title;
        this._gender = gender;
        this._boss = boss;
        this._setStats = setStats;
        this._multStats = multStats;
        this._addStats = addStats;
        this._loot = loot;
        this._image = image;
        this._floor = floor;
        this._id = id;
        this._ability = ability;
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
    get gender() {
        return this._gender;
    };
    get boss() {
        return this._boss;
    };
    get setStats() {
        return this._setStats;
    };
    get multStats() {
        return this._multStats;
    };
    get addStats() {
        return this._addStats;
    };
    get loot() {
        return this._loot;
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
    get ability() {
        return this._ability;
    };

    get url() {
        return this.image[Math.floor(Math.random() * this.image.length)];
    };

    // Entity info
    get alias(): string[] {
        return [];
    };
    get rarity(): CharacterRarity {
        return "D";
    };
    get rarityEmoji(): string {
        return "<:DTier:869316616071032843>";
    };
    get rarityValue(): number {
        return 0;
    };
};

export const enemies: enemyInfo[] = [
    new enemyInfo("Slime", "Slime", "a Slime", "NB", false, { mdChance: 1 }, { md: 1.1 }, { hp: 10 }, [40], ["https://i.ibb.co/yWHMQT9/slime.png"], [1, 2, 3, 4, 6, 7, 8, 9], 0),
    new enemyInfo("Skeleton", "Skeleton", "a Skeleton", "NB", false, {}, {}, { shield: 10, br: 0.05 }, [41], ["https://i.ibb.co/Hz73P9Q/s.png", "https://i.ibb.co/SVKxHF4/s.png"], [1, 2, 3, 4, 6, 7, 8, 9], 1),
    new enemyInfo("Direwolf", "Direwolf", "a Direwolf", "NB", false, {}, {}, {}, [42], ["https://i.ibb.co/3yky5nD/D.png"], [1, 2, 3, 4, 6, 7, 8, 9], 2),
    new enemyInfo("Goblin", "Goblin", "a Goblin", "M", false, {}, {}, { shield: 30 }, [43], ["https://i.ibb.co/jfBtZ1Q/g1.png", "https://i.ibb.co/b1YMVnv/g3.png", "https://i.ibb.co/64vWDRt/g.png"], [3, 4, 6, 7, 8, 9, 11, 12, 13, 14], 3),
    new enemyInfo("Skeleton Soldier", "Skeleton", "a Skeleton", "M", true, {}, {}, {}, [41], ["https://i.ibb.co/chdgQGf/ss.png"], [5], 4),
    new enemyInfo("Retar", "Wolf", "a Wolf", "M", false, {}, {}, {}, [42], ["https://i.ibb.co/0BDYjvG/r.png"], [6, 7, 8, 9, 11, 12, 13, 14], 5),
    new enemyInfo("Werewolf", "Werewolf", "a Werewolf", "M", false, {}, {}, {}, [42], ["https://i.ibb.co/8x5RRPB/w.png", "https://i.ibb.co/VqkvYLW/w2.png", "https://i.ibb.co/qkXNdcp/w7.png", "https://i.ibb.co/YRs6L0y/w0.png"], [6, 7, 8, 9, 11, 12, 13, 14], 6),
    new enemyInfo("Illfang", "Kobold Lord", "the Kobold Lord", "M", true, { mdChance: 0.5 }, {}, {}, [664], ["https://i.ibb.co/GH0gJxG/il.png"], [10], 7),
    new enemyInfo("Skeleton Wolf", "Skeleton Wolf", "a Skeleton Wolf", "M", false, {}, {}, {}, [41, 42], ["https://i.ibb.co/Stp0dCT/sw.png"], [11, 12, 13, 14], 8),
    new enemyInfo("Death Spot", "Werewolf", "a Werewolf", "M", true, {}, {}, {}, [42], ["https://i.ibb.co/6JRGgSK/spot.png"], [15], 9),
    new enemyInfo("Silverwing", "Silverwing", "a Silverwing", "NB", false, { mdChance: 1 }, {}, {}, [44], ["https://i.ibb.co/X2fz8cc/silverwing.png"], [16, 17, 18, 19, 21, 22, 23, 24], 10),
    new enemyInfo("Lizardman", "Lizardman", "a Lizardman", "M", false, {}, {}, { shield: 100 }, [45], ["https://i.ibb.co/GnXmw3y/l3.png", "https://i.ibb.co/1Kym5M8/l2.png", "https://i.ibb.co/7Xk3LYz/l.png", "https://i.ibb.co/pvg2jGn/li.png", "https://i.ibb.co/d4sYN2k/L1.png"], [16, 17, 18, 19, 21, 22, 23, 24], 11),
    new enemyInfo("Geld", "Orc Lord", "the Orc Lord", "M", true, {}, {}, {}, [46], ["https://i.ibb.co/2q7VXkT/rc.png"], [20], 12),
    new enemyInfo("Serpent", "Serpent", "a Serpent", "NB", false, { mdChance: 1 }, {}, {}, [47], ["https://i.ibb.co/jGFxTrZ/s.png"], [21, 22, 23, 24], 13),
    new enemyInfo("Beru", "Ant King", "the Ant King", "M", true, { mdChance: 0.66 }, {}, {}, [669], ["https://i.ibb.co/6Dx3Mdd/b.png"], [25], 14),
    new enemyInfo("Kaonashi", "Ghost", "a Ghost", "NB", false, { mdChance: 1 }, {}, {}, [88], ["https://i.ibb.co/ZNRSPXs/gh.png"], [21, 22, 23, 24, 26, 27, 28, 29], 15),
    new enemyInfo("Zenberu", "Dragon Tusk", "a Dragon Tusk", "M", true, {}, {}, {}, [667], ["https://i.ibb.co/yV3YW6B/image.png"], [30], 16),
    new enemyInfo("Sky Dragon", "Sky Dragon", "a Sky Dragon", "NB", false, { mdChance: 1 }, {}, { cd: 0.4 }, [667], ["https://i.ibb.co/XDgVQmT/sd.png", "https://i.ibb.co/FJbBpc6/sd2.png"], [31, 32, 33, 34, 36, 37, 38, 39], 17),
    new enemyInfo("Gleam Eyes", "Minotaur", "a Minotaur", "M", true, {}, {}, { cd: 0.5 }, [89], ["https://i.ibb.co/VL0Kxmz/ge.png"], [35], 18),
    new enemyInfo("Bicorn", "Bicorn", "a Bicorn", "NB", false, {}, {}, {}, [89], ["https://i.ibb.co/hLwMYSn/bc.png"], [36, 37, 38, 39, 41, 42, 43, 44], 19),
    new enemyInfo("Entoma", "Arachnoid", "an Arachnoid", "F", true, { mdChance: 1 }, {}, {}, [669], ["https://i.ibb.co/XkFT4pM/e.png"], [40], 20),
    new enemyInfo("CZ2128 Delta", "Automaton", "an Automaton", "F", true, { mdChance: 1 }, {}, {}, [671], ["https://i.ibb.co/FsSx42T/cz.png"], [45], 21),
    new enemyInfo("Earth Golem", "Golem", "an Earth Golem", "M", false, {}, {}, {}, [668], ["https://i.ibb.co/C2fHr5M/gl.png"], [41, 42, 43, 44, 46, 47, 48, 49], 22),
    new enemyInfo("Narberal Gamma", "Doppelgänger", "a Doppelgänger", "F", true, { mdChance: 1 }, {}, {}, [674], ["https://i.ibb.co/f1WjFRH/g.png"], [50], 23),
    new enemyInfo("Ice Golem", "Golem", "an Ice Golem", "M", false, {}, {}, {}, [49], ["https://i.ibb.co/bN7RBX3/igg.png"], [46, 47, 48, 49, 51, 52, 53, 54], 24),
    new enemyInfo("Lupusregina Beta", "Werewolf", "a Werewolf", "F", true, { mdChance: 1 }, {}, {}, [673], ["https://i.ibb.co/F5Brx59/beta.png"], [55], 25),
    new enemyInfo("Fire Golem", "Golem", "a Fire Golem", "M", false, {}, {}, {}, [48], ["https://i.ibb.co/kVLJGgH/fg.png"], [51, 52, 53, 54, 56, 57, 58, 59], 26),
    new enemyInfo("Cocytus", "Vermin Lord", "a Vermin Lord", "M", true, { mdChance: 0.25 }, {}, {}, [49], ["https://i.ibb.co/Z6JGcQ4/c.png"], [60], 27),
    new enemyInfo("Wight", "Wight", "a Wight", "M", false, { mdChance: 0.5 }, {}, {}, [41], ["https://i.ibb.co/6yDHvNw/wk.png"], [61, 62, 63, 64, 66, 67, 68, 69, 71, 72, 73, 74], 28),
    new enemyInfo("Demiurge", "Arch Devil", "an Arch Devil", "M", true, { mdChance: 1 }, {}, {}, [92], ["https://i.ibb.co/1Z4Rb2N/d.png"], [65], 29),
    new enemyInfo("Death Dragon", "Death Dragon", "a Death Dragon", "M", false, { mdChance: 0.5 }, {}, {}, [41], ["https://i.ibb.co/yY5xhzB/d.png"], [66, 67, 68, 69, 71, 72, 73, 74], 30),
    new enemyInfo("Albert", "Death Paladin", "a Death Paladin", "M", true, { mdChance: 0.15 }, {}, {}, [672], ["https://i.ibb.co/tHkgdwJ/albert.png"], [70], 31),
    new enemyInfo("Adalman", "Wight King", "the Wight King", "M", true, { mdChance: 1 }, {}, {}, [41, 663], ["https://i.ibb.co/17mGxbM/a.png"], [75], 32),
    new enemyInfo("Treant", "Treant", "a Treant", "NB", false, {}, {}, {}, [670], ["https://i.ibb.co/yn6wcSR/Treant.png"], [76, 77, 78, 79, 81, 82, 83, 84], 33),
    new enemyInfo("Hercules", "Demigod", "a Demigod", "M", true, {}, {}, {}, [91], ["https://i.ibb.co/PTLf68Z/h.png"], [80], 34),
    new enemyInfo("Brain Eater", "Brain Eater", "a Brain Eater", "M", false, {}, {}, {}, [665], ["https://i.ibb.co/zXTZkW7/brain-eater.jpg"], [81, 82, 83, 84, 86, 87, 88, 89], 35),
    new enemyInfo("Enkidu", "Homunculus", "a Homunculus", "NB", true, { mdChance: 0.2 }, {}, {}, [90], ["https://i.ibb.co/qgLmpzb/hc.png"], [85], 36),
    new enemyInfo("Death Knight", "Death Knight", "a Death Knight", "M", false, {}, {}, {}, [41], ["https://i.ibb.co/JvSdTvr/death-knight.png"], [81, 82, 83, 84, 86, 87, 88, 89], 37),
    new enemyInfo("Albedo", "Succubus", "a Succubus", "F", true, {}, {}, {}, [675], ["https://i.ibb.co/XDZpgFd/ab.png"], [90], 38),
    new enemyInfo("Gilgamesh", "Demigod", "a Demigod", "M", true, { mdChance: 0.8 }, {}, {}, [663, 666], ["https://i.ibb.co/8zQhj3V/k.png"], [91], 39),
    new enemyInfo("King Hassan", "Servant", "a Servant", "M", true, {}, {}, {}, [663, 664], ["https://i.ibb.co/DtTZsRv/ha.png"], [92], 40),
    new enemyInfo("Diablo", "Primordial Demon", "a Primordial Demon", "M", true, { mdChance: 1 }, {}, {}, [92], ["https://i.ibb.co/yk3P2f9/noir.png"], [93], 41),
    new enemyInfo("Raphael", "Demon Slime", "the Voice of the World", "F", true, { mdChance: 0.5 }, {}, {}, [40], ["https://i.ibb.co/dgwF05f/R.png"], [94], 42),
    new enemyInfo("Guy Crimson", "Primordial Demon", "a Demon Lord", "M", true, { mdChance: 1 }, {}, {}, [92], ["https://i.ibb.co/y4Rjv3L/guy.png"], [95], 43),
    new enemyInfo("Igneel", "Dragon", "a Fire Dragon", "M", true, { mdChance: 1 }, {}, {}, [48, 667], ["https://i.ibb.co/6Bck42F/igneel.png"], [96], 44),
    new enemyInfo("Acnologia", "Dragon", "the Dragon King", "M", true, { mdChance: 1 }, {}, {}, [663, 667], ["https://i.ibb.co/qNXB6sm/acnnologia.png"], [97], 45),
    new enemyInfo("Vaision", "Dragon", "a Dragon Lord", "M", true, {}, {}, {}, [49, 667], ["https://i.ibb.co/DDVwf6b/pdl.png"], [98], 46),
    new enemyInfo("Ainz Ooal Gown", "Overlord", "the Overlord", "M", true, { mdChance: 1 }, {}, { mana: 120 }, [673], ["https://i.ibb.co/9NZgKGJ/aog.png"], [99], 47),
    new enemyInfo("Veldora", "True Dragon", "a True Dragon", "M", true, { mdChance: 0.75 }, {}, {}, [48, 667], ["https://i.ibb.co/ds61TGkm/veldora.png"], [100], 48),
];

export const bossMobs: enemyInfo[] = [
    new enemyInfo("Rumbleguard", "Golem", "a Golem", "M", true, {}, {}, { mana: 120 }, [], ["https://i.imgur.com/06ZhghA.png"], [], 0),
    new enemyInfo("Sylvanoss", "Treant", "a Treant", "M", true, {}, {}, { mana: 160 }, [], ["https://i.imgur.com/uev7lLN.png"], [], 1),
    new enemyInfo("Celestion", "Dragon", "a Dragon", "M", true, {}, {}, { mana: 200 }, [], ["https://i.imgur.com/a8JPnUA.png"], [], 2),
    new enemyInfo("Malevokar", "Demon", "a Demon", "M", true, {}, {}, { mana: 300 }, [], ["https://i.imgur.com/PNUriwl.png"], [], 3),

    new enemyInfo("Goblin King", "Goblin", "the Goblin King", "M", true, {}, {}, { mana: 300 }, [], ["https://i.imgur.com/my5sSRm.png"], [], 4),
    new enemyInfo("Goblin General", "Goblin", "a Goblin General", "M", true, {}, {}, { mana: 300 }, [], ["https://i.imgur.com/wOPVWnw.png"], [], 5),

    new enemyInfo("Pumpkin Lord", "Pumpkin", "the Pumpkin Lord", "M", true, {}, {}, { mana: 360 }, [], ["https://i.imgur.com/aiAdjFs.jpg"], [], 6),
    new enemyInfo("Pumpkin General", "Pumpkin", "a Pumpkin General", "M", true, {}, {}, { mana: 180 }, [], ["https://i.imgur.com/i6Odc7i.jpg"], [], 7),
    new enemyInfo("Pumpkin Imp", "Pumpkin", "a Pumpkin Imp", "NB", false, {}, {}, { mana: 60 }, [], ["https://i.imgur.com/Au6LNIx.jpg"], [], 8),

    new enemyInfo("Eggsplorer", "Egg", "the Eggsplorer", "M", true, {}, {}, { mana: 360 }, [], ["https://i.ibb.co/YQ2S4Km/eggsplorer.gif"], [], 9),
    new enemyInfo("Eggsecutioner", "Egg", "an Eggsecutioner", "M", true, {}, {}, { mana: 180 }, [], ["https://i.ibb.co/R0zrMJy/eggsecutioner.png"], [], 10),
    new enemyInfo("Scrambler", "Egg", "a Scrambler", "NB", false, {}, {}, { mana: 60 }, [], ["https://i.ibb.co/ykvrQ11/scrambler.png"], [], 11),

];

export const crazeMobs2023: enemyInfo[] = [
    new enemyInfo("Dimensional Soul Eater", "Soul Eater", "a Soul Eater", "M", false, {}, {}, { def: 1000000000 }, [], ["https://i.imgur.com/hgLxMZi.png"], [], 0),
    new enemyInfo("Earth Golem", "Golem", "an Earth Golem", "M", false, {}, {}, { mr: 1000000000 }, [], ["https://i.ibb.co/C2fHr5M/gl.png"], [], 1),
    new enemyInfo("Vinsmoke Sanji", "Human", "a Prince", "M", false, {}, {}, { def: 1000000000, mr: 1000000000 }, [], ["https://i.imgur.com/VjKQEo7.png"], [], 2),
    new enemyInfo("Qual", "Demon", "the Elder Sage of Corruption", "M", false, {}, { hp: 5.072 }, { def: 130, mr: 130 }, [], ["https://i.ibb.co/pjhqgsj/c.png"], [], 3),
    new enemyInfo("Bojji", "Human", "a Prince", "M", false, {}, { hp: 0.4, atk: 0.8, md: 0.8 }, { dodge: 1, br: 1 }, [], ["https://i.ibb.co/njT6dJJ/c.png"], [], 4),
    new enemyInfo("Skeleton Soldier", "Skeleton", "a Skeleton", "M", false, {}, { hp: 1.27 }, { shield: 1000000 }, [], ["https://i.ibb.co/chdgQGf/ss.png"], [], 5),
    new enemyInfo("Mahito", "Cursed Spirit", "a Cursed Spirit", "M", true, {}, { hp: 0.7 }, { def: 120, mr: 120 }, [], ["https://i.imgur.com/Bs8wN1o.jpg"], [], 6),
    new enemyInfo("Sir Crocodile", "Human", "a Sand Human", "M", false, {}, { hp: 0.9053 }, { def: 150, mr: 150 }, [], ["https://i.ibb.co/3r4hQ7n/crocodile.png"], [], 7),
    new enemyInfo("Jiro Awasaka", "Human", "a Curse User", "M", false, {}, { hp: 7.783 }, { def: 1000, mr: 1000 }, [], ["https://i.ibb.co/Ld9t6TC/a.png"], [], 8),
    new enemyInfo("Durin", "Dragon", "a Dragon", "M", true, {}, { hp: 12.639, atk: 2, md: 2 }, { def: 10000, mr: 10000 }, [], ["https://i.ibb.co/87wCQ1N/durin.png"], [], 9),
    new enemyInfo("Kaito Kid", "Human", "a master thief", "M", false, {}, { hp: 5.545, atk: 1.33, md: 1.33 }, { def: 1000, mr: 1000 }, [], ["https://i.ibb.co/2hw39BL/c.png"], [], 10),
    new enemyInfo("Garou", "Human", "a Hero Hunter", "M", true, {}, { hp: 3.893, atk: 10, md: 10 }, { def: 200, mr: 200 }, [], ["https://i.ibb.co/hynQvJ1/c.png"], [], 11),
    new enemyInfo("Slime", "Slime", "a Slime", "NB", false, {}, { hp: 0.55 }, {}, [], ["https://i.ibb.co/yWHMQT9/slime.png"], [], 12),
    new enemyInfo("Satoru Gojo", "Human", "the strongest", "M", true, {}, { hp: 43.2813, atk: 2.734, md: 2.734 }, { dodge: 1, br: 1, def: 100000, mr: 100000 }, [], ["https://i.imgur.com/XxHMIba.png"], [], 13),

];

export const crazeMobs: enemyInfo[] = [
    /* 0 - Apofurbyn't: Deal magic damage */ new enemyInfo("His name is NOT Apofurby", "Furby", "a Furby", "M", false, {}, {}, { def: 1000000000 }, [], ["https://i.ibb.co/NmmCjVX/f.png"], [], 0),
    /* 1 - Dormarox: Deal physical damage */ new enemyInfo("Dormarox", "Golem", "the rock-eating Troll", "M", false, {}, {}, { mr: 1000000000 }, [], ["https://i.ibb.co/rs49qwx/t.png"], [], 1),
    /* 2 - Boa Hancock: Use luffy */ new enemyInfo("Boa Hancock", "Human", "the Snake Princess", "F", false, {}, {}, { def: 1000000000, mr: 1000000000 }, [], ["https://i.ibb.co/3YfY4dd/c.png"], [], 2),
    /* 3 - Aura: Have a larger mana pool than her */ new enemyInfo("Aura", "Demon", "the great Demon", "F", true, {}, {}, { def: 1000000000, mr: 1000000000, mana: 690, sm: 300 }, [], ["https://i.ibb.co/k0GmVpb/aura.png"], [], 3),
    /* 4 - Escanor: Fight him between 08:00-16:00*/ new enemyInfo("Escanor", "Human", "the Lion King", "M", true, {}, { hp: 8.674 }, { def: 5000, mr: 5000 }, [], ["https://i.ibb.co/qjBwR1d/c.png"], [], 4),
    /* 5 - Izuru Kira: Don't use weapons or armor */ new enemyInfo("Izuru Kira", "Human", "the Shinigami", "M", false, {}, { hp: 6.783 }, { def: 1000, mr: 1000 }, [], ["https://i.ibb.co/2K8RQt1/c.png"], [], 5),
    /* 6 MISSING - Zoro: He's lost */ new enemyInfo("Zoro", "Human", "the Pirate Hunter", "M", false, {}, { hp: 6.783 }, { def: 1000, mr: 1000 }, [], ["https://i.ibb.co/rdgvjc2/z.png"], [], 6),
    /* 7 - Pandemonium: Use rogue dagger to charm */ new enemyInfo("Pandemonium", "Pandemonium Larvae", "a Shikigami Snack", "F", false, {}, { hp: 2.674 }, { def: 1000000000, mr: 1000000000 }, [], ["https://i.ibb.co/DYv9PXG/c.png"], [], 7),
    /* 8 - Light Yagami: Use Brook */ new enemyInfo("Light Yagami", "Human", "the God of a New World", "M", false, {}, { hp: 6.283 }, { def: 1000000000, mr: 1000000000 }, [], ["https://i.ibb.co/8PXyV6Y/c.png"], [], 8),
    /* 9 - Lelouch: Use 2B to prevent eye contact */ new enemyInfo("Lelouch vi Britannia", "Human", "the Demon Emperor", "M", false, {}, { hp: 6.283 }, { def: 1000000000, mr: 1000000000 }, [], ["https://i.ibb.co/0jWj3bn/c.png"], [], 9),
    /* 10 - Larry: Twinshot Megumin */ new enemyInfo("Larry", "Cockroach", "Larry", "M", false, {}, { hp: 3.42, atk: 12.8, md: 12.8 }, { dodge: 1, br: 1, def: 1200, mr: 1200 }, [], ["https://i.ibb.co/YXSRsCL/larry.png"], [], 10),
    /* 11 - Wamuu: Run away */ new enemyInfo("Wamuu", "Human", "the Warrior of Wind", "M", false, {}, { atk: 1.8, md: 1.8, hp: 69.69 }, { def: 5000, mr: 5000 }, [], ["https://i.ibb.co/PzR845y/wamuu.png"], [], 11),
    /* 12 - Floor: Use Arima Kana */ new enemyInfo("Floor", "Floor", "the Floor", "M", true, {}, { hp: 3.42, atk: 12.8, md: 12.8 }, { dodge: 1, br: 1, def: 1200, mr: 1200 }, [], ["https://i.ibb.co/YtXbDwp/floor.png"], [], 12),
    /* 13 - Fuutarou Uesugi: Try QQ Girls, only one is correct */ new enemyInfo("Fuutarou Uesugi", "Human", "Mr. Honor-Roll", "M", false, {}, {}, {}, [], ["https://i.ibb.co/GT9fLQ8/c.png"], [], 13),
    /* 14 - Mob: Reach round 100 without dealing damage */ new enemyInfo("Mob", "Human", "the Psycho Helmet", "M", false, {}, { atk: 42, md: 42, hp: 99.99 }, { dodge: 0, br: 0 }, [], ["https://i.ibb.co/f8HX8Y9/c.png"], [], 14),
    /* 15 - Sukuna */ new enemyInfo("Sukuna", "Cursed Spirit", "the King of Curses", "M", true, {}, { hp: 333.33, atk: 5, md: 5 }, { def: 1000000000, mr: 1000000000 }, [], ["https://i.ibb.co/9p7zvsV/c.png"], [], 15),

];


export const rollingCowMobs: enemyInfo[] = [
    new enemyInfo("Blazetread", "Cow", "a Blazetread", "NB", false, { hp: 9_999_999_999 }, {}, { atk: 400, md: 400, def: 400, mr: 400 }, [], ["https://i.ibb.co/XjDnyyb/blazetread.png"], [], 0),
    new enemyInfo("Lurknight", "Cow", "a Lurknight", "NB", false, { hp: 6_969_696_969 }, {}, { atk: 400, md: 400, def: 400, mr: 400 }, [], ["https://i.ibb.co/TPkmyMK/lurknight.png"], [], 1),
    new enemyInfo("Malamire", "Cow", "a Malamire", "NB", false, { hp: 9_999_999_999 }, {}, { atk: 400, md: 400, def: 400, mr: 400 }, [], ["https://i.ibb.co/pbNvWhH/malamire.png"], [], 2),
    new enemyInfo("Duskgroth", "Cow", "a Duskgroth", "NB", false, { hp: 9_999_999_999 }, {}, { atk: 400, md: 400, def: 400, mr: 400 }, [], ["https://i.ibb.co/Y8XLTvX/duskgroth.png"], [], 3),
    new enemyInfo("Cliffheart", "Cow", "a Cliffheart", "NB", false, { hp: 9_999_999_999 }, {}, { atk: 400, md: 400, def: 400, mr: 400 }, [], ["https://i.ibb.co/gSsXYsn/cliffheart.png"], [], 4),
    new enemyInfo("Jesterbull", "Cow", "a Jesterbull", "NB", false, { hp: 9_999_999_999 }, {}, { atk: 400, md: 400, def: 400, mr: 400 }, [], ["https://i.ibb.co/k0BF4rx/jb.png"], [], 5),

];

export const rankupDummy = new enemyInfo("Examiner", "Doll", "the Examiner", "NB", true, { hp: 9_999_999_999 }, {}, { atk: 400, md: 400, def: 660, mr: 660 }, [], ["https://i.ibb.co/bXW0gcv/examiner.png"], [], 0);

export const raidBosses: enemyInfo[] = [
    new enemyInfo("Kael'thian", "Titan", "the Ashen Devourer", "M", true, {}, {}, { mana: 80, mg: 30 }, [689, 731, 732], ["https://i.ibb.co/5YGvbFG/c.png"], [], 0,
        new skillInfo(0, 100, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            if (myStats.usedBlockRound === matchStats.round) { // Def used last round (40% damage)
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:magma_ball:1340448973194006679> **${enemy.name}** threw scorching magma! **${enemy.name}**`, { atkMultiplier: 0.4, ignoreShield: true, dodge: false, block: false });
            } else { // Def not used last round (200% damage)
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:magma_ball:1340448973194006679> **${enemy.name}** threw scorching magma! **${enemy.name}**`, { atkMultiplier: 2, ignoreShield: true, dodge: false, block: false });
            }

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            // player: +100% CD, -3% cHP
            myStats.cd += 1;
            mybuff.cd.push(new buffInfo("+", 1, 9999));
            mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.hp * 0.03), 9999));

            return AbilityResponse.SUCCESS;
        }, [["Receives **100%** more critical damage", "Applies a **3%** HP DoT on the player", `**Active**: Deals **200%** damage, unless the player blocked using the ${customEmojis.def} DEF action in the previous round, in which case it only deals **40%** damage (**100** <:mana:1047269152957661255>)`]])
    ),
    new enemyInfo("Kael'theron", "Titan", "the Ashen Devourer", "M", true, {}, {}, { mana: 100 }, [689, 731, 732], ["https://i.ibb.co/drsdyGm/c.png"], [], 1,
        new skillInfo(1, 150, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            if (myStats.usedBlockRound === matchStats.round) { // Def used last round (50% damage)
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:magma_ball:1340448973194006679> **${enemy.name}** threw scorching magma! **${enemy.name}**`, { atkMultiplier: 0.5, ignoreShield: true, dodge: false });
            } else { // Def not used last round (250% damage)
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:magma_ball:1340448973194006679> **${enemy.name}** threw scorching magma! **${enemy.name}**`, { atkMultiplier: 2.5, ignoreShield: true, dodge: false });
            }

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            // player: +100% CD, -5% cHP
            myStats.cd += 1;
            mybuff.cd.push(new buffInfo("+", 1, 9999));
            mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.hp * 0.05), 9999));

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                // Erupts (ends fight) at round 20, can't be revived
                if (matchStats.round === 20) {
                    myStats.rev = 0;
                    myStats.hp = 0;
                    notice.push(`\n<:eruption:1340451903506616350> **${enemy.name}** erupted and ended the fight.`);
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        }, [["Receives **100%** more critical damage", "Applies a **5%** HP DoT on the player", "Erupts at round **20**, ending the fight", `**Active**: Deals **250%** damage, unless the player blocked using the ${customEmojis.def} DEF action in the previous round, in which case it only deals **50%** damage (**150** <:mana:1047269152957661255>)`]])
    ),

    new enemyInfo("Velourith", "Doppelgänger", "the Void Harbinger", "F", true, { mg: 5 }, {}, { mana: 120 }, [714, 715, 716, 717], ["https://i.ibb.co/Gpz18Kg/c.png"], [], 2,
        new skillInfo(2, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.retaliationDamage += 0.1;
            notice.push(`\n<:retaliation:1340455881736716359> **${enemy.name}** increases her retaliation damage by **10%**`);

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.lightningResistance = 1;
            eStats.retaliationDamage = 0.2;

            const retaliationChance = 0.4;

            matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats }) => {
                if (caster === myStats && Math.random() < retaliationChance && matchStats.round % 2 === 0) {
                    eStats.sm += 25;
                    dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:retaliation_attack:1340455894701576213> **${enemy.name}** retaliates! She`, { atkMultiplier: eStats.retaliationDamage });
                }
            });

            return AbilityResponse.SUCCESS;
        }, [["Immune to lightning damage", "Has a **40%** chance to retaliate after taking a hit, dealing **20%** damage", "**Active**: Increases her retaliation damage by **10%** (**50** <:mana:1047269152957661255>)"]])
    ),
    new enemyInfo("Veloura", "Doppelgänger", "the Void Harbinger", "F", true, { mg: 0 }, {}, { mana: 120 }, [714, 715, 716, 717], ["https://i.ibb.co/DCDzxsp/n.png"], [], 3,
        new skillInfo(3, 70, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            eStats.retaliationDamage += 0.15;

            notice.push(`\n<:retaliation:1340455881736716359> **${enemy.name}** increases her retaliation damage by **15%**`);

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.lightningResistance = 1;
            eStats.retaliationDamage = 0.33;

            const retaliationChance = 0.4;

            matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats }) => {
                if (caster === myStats && Math.random() < retaliationChance) {
                    eStats.sm += 35;
                    dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:retaliation_attack:1340455894701576213> **${enemy.name}** retaliates! She`, { atkMultiplier: eStats.retaliationDamage });

                }
            });

            // -0.3% cHP + retaliationDamage * 0.1
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                eStats.hp -= Math.floor(eStats.hp * (0.003 + eStats.retaliationDamage * 0.1));

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        }, [["Immune to lightning damage", "Applies DoT proportional to her retaliation damage to herself", "Has a **40%** chance to retaliate after taking a hit, dealing **33%** damage", "**Active**: Increases her retaliation damage by **15%** (**70** <:mana:1047269152957661255>)"]])
    ),
    new enemyInfo("Velia", "Doppelgänger", "the Void Harbinger", "F", true, { mg: 0 }, {}, { mana: 120 }, [714, 715, 716, 717], ["https://i.ibb.co/Js46cdL/l.png"], [], 4,
        new skillInfo(4, 100, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.retaliationDamage += 0.25;

            notice.push(`\n<:retaliation:1340455881736716359> **${enemy.name}** increases her retaliation damage by **25%**`);

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.lightningResistance = 1;
            eStats.retaliationDamage = 0.4;

            const retaliationChance = 0.4;

            matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats }) => {
                if (caster === myStats && Math.random() < retaliationChance) {
                    eStats.sm += 50;
                    dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:retaliation_attack:1340455894701576213> **${enemy.name}** retaliates! She`, { atkMultiplier: eStats.retaliationDamage });
                }
            });

            // -0.3% cHP + retaliationDamage * 0.1
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                eStats.hp -= Math.floor(eStats.hp * (0.003 + eStats.retaliationDamage * 0.1));

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        }, [["Immune to lightning damage", "Applies DoT proportional to her retaliation damage to herself", "Has a **40%** chance to retaliate after taking a hit, dealing **40%** damage", "**Active**: Increases her retaliation damage by **25%** (**100** <:mana:1047269152957661255>)"]])
    ),

    new enemyInfo("Zerthrax", "Titan", "the Storm Devourer", "M", true, {}, {}, { mana: 120 }, [693, 699, 767, 773], ["https://i.ibb.co/C0BtZzW/c.png"], [], 5,
        new skillInfo(5, 300, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            // Deal 500% damage
            dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:vortex_attack:1340457236031602749> **${enemy.name}** created a vortex! **${enemy.name}**`, { atkMultiplier: 5, magicDamage: true, selfdmg: true });

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Always deals md
            eStats.mdChance = 1;

            // Steal mana
            eStats.sm += myStats.sm;
            if (eStats.sm > eStats.mana) eStats.sm = eStats.mana;
            myStats.sm = 0;

            // Increase md based on mana
            eStats.md += Math.floor(eStats.md * (0.001 * eStats.sm));

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                // Always deals md
                eStats.mdChance = 1;

                // Steal mana
                eStats.sm += myStats.sm;
                if (eStats.sm > eStats.mana) eStats.sm = eStats.mana;
                myStats.sm = 0;

                // Increase md based on mana
                eStats.md += Math.floor(eStats.md * (0.001 * eStats.sm));

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        }, [["Permanently steals all mana from the player", "Increases its MD by **1%** for every **10** mana it has", "**Active**: Deals **500%** damage (**300** <:mana:1047269152957661255>)"]])
    ),

    new enemyInfo("Deluvion", "Leviathan", "the Crushing Wave", "M", true, {}, {}, { mana: 120 }, [695, 696, 697, 698], ["https://i.ibb.co/JrCjX0H/deluvion.png"], [], 6,
        new skillInfo(6, 90, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            eStats.counter = 2;
            notice.push(`\n<:counter:1340459549374546032>  **${enemy.name}** prepares to counter the next **2** attacks`);

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            // On Counter: +50 DEF/MR
            matchStats.on("counter", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                ebuff.def.push(new buffInfo("+", 50, 9999));
                ebuff.mr.push(new buffInfo("+", 50, 9999));
                eStats.def += 50;
                eStats.mr += 50;
            });

            return AbilityResponse.SUCCESS;
        }, [["All counters increase its DEF by **50**", "**Active**: Counters the next **2** attacks (**90** <:mana:1047269152957661255>)"]])
    ),
    new enemyInfo("Deluvian", "Leviathan", "the Crushing Tide", "M", true, {}, {}, { mana: 120 }, [695, 696, 697, 698], ["https://i.ibb.co/XWT3Hg2/deluvian.png"], [], 7,
        new skillInfo(7, 110, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            eStats.counter = 3;
            notice.push(`\n<:counter:1340459549374546032>  **${enemy.name}** prepares to counter the next **3** attacks`);

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            // On Counter: +100 DEF/MR
            matchStats.on("counter", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                ebuff.def.push(new buffInfo("+", 100, 9999));
                ebuff.mr.push(new buffInfo("+", 100, 9999));
                eStats.def += 100;
                eStats.mr += 100;
            });

            return AbilityResponse.SUCCESS;
        }, [["All counters increase its DEF by **100**", "**Active**: Counters the next **3** attacks (**110** <:mana:1047269152957661255>)"]])
    ),

    new enemyInfo("Dusty", "Dust Elemental", "the Dust Storm", "M", true, {}, {}, { mana: 120 }, [702, 725, 744, 745], ["https://i.ibb.co/SDBcJcTk/dusty.png"], [], 8,
        new skillInfo(8, 120, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            const defScale = 0.075, roundsLast = 4;

            ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * defScale), roundsLast));
            ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * defScale), roundsLast));
            eStats.def -= Math.floor(eStats.def * defScale);
            eStats.mr -= Math.floor(eStats.mr * defScale);

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:sand_absorb:1340461883748126881> **${enemy.name}**'s releases its accumulated damage! **${enemy.name}**`, { overwriteDamage: eStats.damageTakenBuff * 0.5, dodge: false });
                eStats.damageTakenBuff = Math.floor(eStats.damageTakenBuff * 0.5);

                return AbilityResponse.SUCCESS;
            }, roundsLast));

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                eStats.damageTakenBuff += eStats.damageTaken;
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:sand_absorb:1340461883748126881> **${enemy.name}**'s reflect`, { overwriteDamage: Math.floor(eStats.damageTaken * 0.2) });
                eStats.damageTaken = 0;

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        }, [["Reflects and accumulates **20%** of damage taken every round", "**Active**: Releases **50%** of all accumulated damage, and repeats this for the next **4** rounds, but loses **7.5%** of its DEF and MR during those rounds (**120** <:mana:1047269152957661255>)"]])
    ),

    new enemyInfo("Nekro", "Necromancer", "the Death Caller", "M", true, {}, {}, { mana: 120, mg: 10 }, [726, 739, 740, 741], ["https://i.ibb.co/1Yt4DdYZ/nekro.png"], [], 9,
        new skillInfo(9, 140, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            notice.push(`\n<:summon:1340620694655995925> **${enemy.name}** summoned a minion`);
            matchStats.eStatsCC = { ...eStats };
            matchStats.currentOpponent = 1;

            eStats.image = "https://i.ibb.co/yBQGNRCq/minion.png";
            embed.setImage(eStats.image);

            eStats.hp = Math.floor(myStats.hp * 0.2);
            eStats.maxhp = Math.floor(myStats.hp * 0.2);
            eStats.mg = 0;

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats) {
                    const missingHpPercent = 1 - ((myStats.maxhp - myStats.hp) / myStats.maxhp);
                    eStats.atk += Math.floor(eStats.atk * missingHpPercent * 0.75);
                    eStats.md += Math.floor(eStats.md * missingHpPercent * 0.75);
                };
            });

            return AbilityResponse.SUCCESS;
        }, [["Scales its own ATK and MD inversely with the player's missing HP (**+0-75%**)", "**Active**: Summons a minion with **20%** of of your current HP (**140** <:mana:1047269152957661255>)"]])
    ),
    new enemyInfo("NecroVamp", "Necromancer", "the Death Eater", "M", true, {}, {}, { mana: 120, mg: 10 }, [726, 739, 740, 741], ["https://i.ibb.co/H0sjR0p/nekrovamp.png"], [], 10,
        new skillInfo(10, 150, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            notice.push(`\n<:summon:1340620694655995925> **${enemy.name}** summoned a minion`);
            matchStats.eStatsCC = { ...eStats };
            matchStats.currentOpponent = 1;

            eStats.image = "https://i.ibb.co/fcRvQBg/minion.png";
            embed.setImage(eStats.image);

            eStats.hp = Math.floor(myStats.hp * 0.3);
            eStats.maxhp = Math.floor(myStats.hp * 0.3);
            eStats.mg = 0;

            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 5, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.currentOpponent === 1) {
                    ebuff.atk.push(new buffInfo("*", 0.01, 9999));
                    ebuff.md.push(new buffInfo("*", 0.01, 9999));
                    ebuff.def.push(new buffInfo("*", 0.01, 9999));
                    ebuff.mr.push(new buffInfo("*", 0.01, 9999));
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats) {
                    const missingHpPercent = 1 - ((myStats.maxhp - myStats.hp) / myStats.maxhp);
                    eStats.atk += Math.floor(eStats.atk * missingHpPercent * 1.1);
                    eStats.md += Math.floor(eStats.md * missingHpPercent * 1.1);
                };
            });

            return AbilityResponse.SUCCESS;
        }, [["Scales its own ATK and MD inversely with the player's missing HP (**+0-110%**)", "**Active**: Summons a minion with **30%** of of your current HP (**150** <:mana:1047269152957661255>)", "  - Every round the minion is alive, the Necromancer increases his ATK, MD, DEF and MR by **1%**"]])
    ),

    new enemyInfo("Rootlord Morivar", "Eldritch Forest Parasite", "Father of Decay", "M", true, {}, {}, { mana: 120, mg: 15 }, [747, 748, 769], ["https://i.ibb.co/0yFsFCbk/morivar.png"], [], 11,
        new skillInfo(11, 120, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:drain_roots:1340624066956234792> **${enemy.name}** plants its roots! **${enemy.name}**`, { dodge: false, atkMultiplier: 1.2 });

            // steals 20% of player stats
            const satk = Math.floor(myStats.atk * 0.2);
            const sdef = Math.floor(myStats.def * 0.2);
            const smd = Math.floor(myStats.md * 0.2);
            const smr = Math.floor(myStats.mr * 0.2);

            const sdodge = Math.floor(myStats.dodge * 20) / 100;
            const scr = Math.floor(myStats.cr * 20) / 100;
            const scd = Math.floor(myStats.cd * 20) / 100;
            const sbr = Math.floor(myStats.br * 20) / 100;

            ebuff.atk.push(new buffInfo("+", satk, 4)); mybuff.atk.push(new buffInfo("+", -satk, 4));
            ebuff.def.push(new buffInfo("+", sdef, 4)); mybuff.def.push(new buffInfo("+", -sdef, 4));
            ebuff.md.push(new buffInfo("+", smd, 4)); mybuff.md.push(new buffInfo("+", -smd, 4));
            ebuff.mr.push(new buffInfo("+", smr, 4)); mybuff.mr.push(new buffInfo("+", -smr, 4));
            ebuff.dodge.push(new buffInfo("+", sdodge, 4)); mybuff.dodge.push(new buffInfo("+", -sdodge, 4));
            ebuff.cr.push(new buffInfo("+", scr, 4)); mybuff.cr.push(new buffInfo("+", -scr, 4));
            ebuff.cd.push(new buffInfo("+", scd, 4)); mybuff.cd.push(new buffInfo("+", -scd, 4));
            ebuff.br.push(new buffInfo("+", sbr, 4)); mybuff.br.push(new buffInfo("+", -sbr, 4));

            eStats.atk += satk; myStats.atk -= satk;
            eStats.def += sdef; myStats.def -= sdef;
            eStats.md += smd; myStats.md -= smd;
            eStats.mr += smr; myStats.mr -= smr;

            eStats.dodge += sdodge; myStats.dodge -= sdodge;
            eStats.cr += scr; myStats.cr -= scr;
            eStats.cd += scd; myStats.cd -= scd;
            eStats.br += sbr; myStats.br -= sbr;

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            // Drain 5/10% HP
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const drain = Math.floor(myStats.hp * (myStats.hp > myStats.maxhp * 0.7 ? 0.05 : 0.1));
                myStats.hp -= drain;
                addHeal(eStats, eStats, eStats, mybuff, ebuff, matchStats, notice, ``, drain, {});
                if (eStats.hp > eStats.maxhp) eStats.hp = eStats.maxhp;
                if (myStats.hp < 0) myStats.hp = 0;

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        }, [["Drains **5%** HP every round, **10%** if the player has less than **70%** of their max HP left", "**Active**: Deals **120%** undodgeable damage and steals **20%** of the player's stats for **4** rounds (**120** <:mana:1047269152957661255>)"]])
    ),

    new enemyInfo("Sapwyrm", "Sapwyrm", "the Lifedrainer", "F", true, {}, {}, { mana: 120 }, [727, 728, 730, 771], ["https://i.ibb.co/Y4mWLFKS/sapwyrm.png"], [], 12,
        new skillInfo(12, 70, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            myStats.dodge = 0;
            myStats.br = 0;
            mybuff.dodge.push(new buffInfo("=", 0, 2));
            mybuff.br.push(new buffInfo("=", 0, 2));

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.6) dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:poison_rage:1340625165175754844>  **${enemy.name}**`, { atkMultiplier: 1.5 });

                return AbilityResponse.SUCCESS;
            }, 2));

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            eStats.negateHeal = 1;

            matchStats.on("miss", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (target === myStats) eStats.hp -= Math.floor(myStats.hp * 0.03);
            });

            return AbilityResponse.SUCCESS;
        }, [["Prevents the player from healing", "Loses the equivalent of **3%** of the player's current HP when the player evades its attacks", "**Active**: Reduces the player's dodge chance and block rate to **0** for the next **2** rounds, and has a **60%** chance to deal **150%** damage (**70** <:mana:1047269152957661255>)"]])
    ),
    new enemyInfo("Greater Sapwyrm", "Sapwyrm", "the Lifebinder", "F", true, {}, {}, { mana: 120 }, [727, 728, 730, 771], ["https://i.ibb.co/2X18TjV/greater-sapwyrm.png"], [], 13,
        new skillInfo(13, 80, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            myStats.dodge = 0;
            myStats.br = 0;
            mybuff.dodge.push(new buffInfo("=", 0, 3));
            mybuff.br.push(new buffInfo("=", 0, 3));

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.66) dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:poison_rage:1340625165175754844>  **${enemy.name}**`, { atkMultiplier: 1.6 });

                return AbilityResponse.SUCCESS;
            }, 3));

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            eStats.negateHeal = 1;

            matchStats.on("miss", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (target === myStats) eStats.hp -= Math.floor(myStats.hp * 0.035);
            });

            return AbilityResponse.SUCCESS;
        }, [["Prevents the player from healing", "Loses the equivalent of **3.5%** of the player's current HP when the player evades its attacks", "**Active**: Reduces the player's dodge chance and block rate to **0** for the next **3** rounds, and has a **66%** chance to deal **160%** damage (**80** <:mana:1047269152957661255>)"]])
    ),
    new enemyInfo("Elder Sapwyrm", "Sapwyrm", "the Forest Ravager", "F", true, {}, {}, { mana: 120 }, [727, 728, 730, 771], ["https://i.ibb.co/4R483ktJ/elder-sapwyrm.png"], [], 14,
        new skillInfo(14, 100, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            myStats.dodge += 0.1;
            myStats.br += 0.1;
            mybuff.dodge.push(new buffInfo("+", 0.1, 3));
            mybuff.br.push(new buffInfo("+", 0.1, 3));

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.75) dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:poison_rage:1340625165175754844>  **${enemy.name}** is in rage mode! **${enemy.name}**`, { atkMultiplier: 1.8 });

                return AbilityResponse.SUCCESS;
            }, 3));

            // On player miss: 250% damage
            matchStats.on("miss", {
                maxRound: matchStats.round + 3, callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                    if (target === myStats) {
                        dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:counter:1340459549374546032> **${enemy.name}**`, { atkMultiplier: 2.5, dodge: false, block: false });
                    };
                },
            });

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            eStats.negateHeal = 1;

            matchStats.on("miss", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (target === myStats) eStats.hp -= Math.floor(eStats.hp * 0.045);
            });

            return AbilityResponse.SUCCESS;
        }, [["Prevents the player from healing", "Loses the equivalent of **4.5%** of the player's current HP when the player evades its attacks", "**Active**: Increases the player's dodge chance and block rate by **10%** for the next **3** rounds, and has a **75%** chance to deal **180%** damage. During the next **3** rounds, if the player evades an attack, the enemy deals **250%** undodgeable and unblockable damage (**100** <:mana:1047269152957661255>)"]])
    ),

    new enemyInfo("Sledgefist", "Golem", "the Stonebreaker", "M", true, {}, {}, { mana: 120 }, [705, 707, 709, 768], ["https://i.ibb.co/B5n382Vc/sledgefist.png"], [], 14,
        new skillInfo(15, 120, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            myStats.shield = 0;
            notice.push(`\n<:steal_shield:1340630053695918100> ${enemy.name} has broken your shield!`);

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            eStats.ignoreShield = true;

            // +0.025% of shield as atk and md (max 250%) //* 10k shield = 250% atk
            const buffMax = 2.5, buffScale = 0.00025;
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.atk += Math.floor(myStats.atk * Math.min(myStats.shield * buffScale, buffMax));
                myStats.md += Math.floor(myStats.md * Math.min(myStats.shield * buffScale, buffMax));

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        }, [["Only deals true damage (ignores shield)", "The player receives ATK & MD equal to **0.025%** of their shield, up to **250%**", "**Active**: Breaks the player's shield (**120** <:mana:1047269152957661255>)"]])
    ),
    new enemyInfo("Kraghammer", "Golem", "the Warbreaker", "M", true, {}, {}, { mana: 120 }, [705, 707, 709, 768], ["https://i.ibb.co/5gknttwn/kraghammer.png"], [], 16,
        new skillInfo(16, 150, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            const steal = Math.floor(myStats.shield * 0.5);
            eStats.shield += steal;
            myStats.shield = steal;

            dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:steal_shield:1340630053695918100> **${enemy.name}**`, { overwriteDamage: eStats.shield, ignoreShield: true, dodge: false, block: false });

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            eStats.ignoreShield = true;

            // +0.025% of shield as atk and md (max 250%) //* 10k shield = 250% atk
            const buffMax = 2.5, buffScale = 0.00025;
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.atk += Math.floor(myStats.atk * Math.min(myStats.shield * buffScale, buffMax));
                myStats.md += Math.floor(myStats.md * Math.min(myStats.shield * buffScale, buffMax));

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        }, [["Only deals true damage (ignores shield)", "The player receives ATK & MD equal to **0.025%** of their shield, up to **250%**", "**Active**: Steals **50%** of the player's shield, then deals damage equal to his available shield (**150** <:mana:1047269152957661255>)"]])
    ),

    new enemyInfo("Cake Witch", "Witch", "the Baking Bad", "F", true, { mdChance: 1 }, {}, { mana: 120 }, [712, 742, 743], ["https://i.ibb.co/ccCZfzfk/cake-witch.png"], [], 17,
        new skillInfo(17, 55, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            const steal = Math.floor(myStats.md * 0.05);
            mybuff.md.push(new buffInfo("+", -steal, 9999));
            ebuff.md.push(new buffInfo("+", steal, 9999));
            myStats.md += -steal;
            eStats.md += steal;

            ebuff.mr.push(new buffInfo("+", Math.floor(eStats.mr * 0.03), 9999));
            eStats.mr += Math.floor(eStats.mr * 0.03);

            notice.push(`\n<:cakey:1340671224430329928> **${enemy.name}** stole **${steal}** MD and increased her MR by **3%**`);

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats && !options.magicDamage) {
                    myStats.maxhp -= Math.floor(myStats.maxhp * 0.05);
                    if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;

                    notice.push(`\n<:cakey:1340671224430329928> **${enemy.name}** ate **5%** of your max HP`);
                };
            });

            return AbilityResponse.SUCCESS;
        }, [["After being dealt physical damage, reduces the player's max HP by **5%**", "**Active**: Steals **5%** MD and increases MR by **3%** (**55** <:mana:1047269152957661255>)"]])
    ),

    new enemyInfo("Velkris/Kyntheris", "Void Knight", "the Void Knights", "F", true, {}, {}, { mana: 120 }, [701, 703, 704, 711], ["https://i.ibb.co/NnKqLhHH/velkris.png"], [], 18,
        new skillInfo(18, 110, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            //* 0: Velkris is Main Character
            //* 1: Kyntheris is Summoned Boss (Minion)

            // Velkris switches into Kyntheris
            if (matchStats.currentOpponent === 0 && eStats.minionHealth > 0) {

                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `\n<:switch:1340696278576926781> **Velkris** switched places with **Kyntheris** and`, { atkMultiplier: (1 + myStats.dodge) });
                myStats.dodge = 0; mybuff.dodge.push(new buffInfo("=", 0, 3));

                matchStats.eStatsCC = { ...eStats };
                matchStats.currentOpponent = 1;
                embed.setImage("https://i.ibb.co/MxTH1q1s/kyntheris.png");

                eStats.hp = eStats.minionHealth;
                eStats.maxhp = Math.floor(eStats.maxhp * 0.9);
                eStats.def = Math.floor(eStats.def * 0.9);
                eStats.mr = Math.floor(eStats.mr * 1.1);
                eStats.atk = Math.floor(eStats.atk * 0.9);
                eStats.md = Math.floor(eStats.md * 1.1);
                eStats.mdChance = 1;

                myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + Math.floor(105 / (eStats.mg + 5)), async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    // Kyntheris switches into Velkris
                    if (matchStats.currentOpponent === 1) {
                        eStats.minionHealth = eStats.hp; matchStats.eStatsCC.minionHealth = eStats.minionHealth;

                        Object.assign(eStats, matchStats.eStatsCC);
                        eStats.hp = matchStats.eStatsCC.hp;
                        embed.setImage("https://i.ibb.co/NnKqLhHH/velkris.png");

                        matchStats.currentOpponent = 0;

                        //? Fixed Shield?
                        eStats.shield += 2500;
                        eStats.mdChance = 0;

                        // Velkris: +atk proportial to amount of shield (max: 150% atk) //?
                        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                            if (matchStats.currentOpponent === 0) eStats.atk += Math.floor(eStats.atk * Math.min(eStats.shield * 0.0002, 1.5));

                            return AbilityResponse.SUCCESS;
                        }, 9999));
                        notice.push(`\n<:switch:1340696278576926781> **Kyntheris** switched places with **Velkris**`);
                    };

                    return AbilityResponse.SUCCESS;
                }));

                // Velkris stays in, Kyntheris is defeated
            } else if (matchStats.currentOpponent === 0 && eStats.minionHealth === 0) {

                notice.push(`\n<:minion_death:1340696282313789553>  **Velkris** is defeated! They can't switch back!`);
                addHeal(myStats, eStats, eStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.05), {});

                // Velkris: +10% dodge, +7.5% atk (5 rounds) //? a bit low?
                eStats.dodge += 0.1; ebuff.dodge.push(new buffInfo("+", 0.1, 5));
                ebuff.atk.push(new buffInfo("+", Math.floor(eStats.atk * 0.075), 5));
                eStats.atk += Math.floor(eStats.atk * 0.075);
            }

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.minionHealth = Math.floor(eStats.maxhp * 0.8); //Kyntheris: 80% of max hp

            const randStats = ["atk", "def", "md", "mr", "dodge", "br"];
            matchStats.currentOpponent === 0 ? eStats.mdChance = 0 : eStats.mdChance = 1;

            // On Minion Death, sets minion health to 0
            matchStats.on("minionDeath", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === eStats) eStats.minionHealth = 0; matchStats.eStatsCC.minionHealth = eStats.minionHealth;
            });

            // Velkris: On Dodge: +5% atk, +2.5% def
            matchStats.on("dodge", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (target === myStats && matchStats.currentOpponent === 0) {
                    const atkScale = 0.05, defScale = 0.025;

                    ebuff.atk.push(new buffInfo("+", Math.floor(eStats.atk * atkScale), 9999));
                    eStats.atk += Math.floor(eStats.atk * atkScale);
                    ebuff.def.push(new buffInfo("+", Math.floor(eStats.def * defScale), 9999));
                    eStats.def += Math.floor(eStats.def * defScale);
                };
            });

            // Kyntheris: On Block: +5% md, +2.5% mr, 40% phys. damage
            matchStats.on("block", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (target === myStats && matchStats.currentOpponent === 1) {
                    const mdScale = 0.05, mrScale = 0.025;

                    ebuff.md.push(new buffInfo("+", Math.floor(eStats.md * mdScale), 9999));
                    eStats.md += Math.floor(eStats.md * mdScale);
                    ebuff.mr.push(new buffInfo("+", Math.floor(eStats.mr * mrScale), 9999));
                    eStats.mr += Math.floor(eStats.mr * mrScale);

                    dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:quick_strike:1340696280636067922> **Velkris** dealt a quick strike`, { atkMultiplier: 0.4, mdChance: 0, block: false });
                };
            });

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                // Velkris: Steals 5% of a random stat every 2 rounds
                if (matchStats.round % 2 === 0 && matchStats.currentOpponent === 0) {
                    const randStat = randStats[Math.floor(Math.random() * randStats.length)];
                    const stealScale = 0.05, stealRounds = 3;

                    if (randStat === "dodge" || randStat === "br") {
                        ebuff[randStat].push(new buffInfo("+", Math.floor(eStats[randStat] + stealScale), stealRounds));
                        eStats[randStat] += Math.floor(eStats[randStat] + stealScale);
                        mybuff[randStat].push(new buffInfo("+", -Math.floor(myStats[randStat] + stealScale), stealRounds));
                        myStats[randStat] -= Math.floor(myStats[randStat] + stealScale);
                    } else {
                        ebuff[randStat as keyof Buffs].push(new buffInfo("+", Math.floor(eStats[randStat] * stealScale), stealRounds));
                        eStats[randStat] += Math.floor(eStats[randStat] * stealScale);
                        mybuff[randStat as keyof Buffs].push(new buffInfo("+", -Math.floor(myStats[randStat] * stealScale), stealRounds));
                        myStats[randStat] -= Math.floor(myStats[randStat] * stealScale);
                    };
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        }, [["Duo: Velkris, who gets stronger when the player dodges, and Kyntheris, who gets stronger when the player blocks an attack", "While Velkris is fighting, Kyntheris deals **40%** unblockable physical damage whenever the player blocks an attack", "While Kyntheris is fighting, every **3** rounds Velkris steals **5%** of a random stat for **3** rounds", "**Active**: Velkris switches with Kyntheris, Kyntheris switches with Velkris (**110** <:mana:1047269152957661255>)"]])
    ),

    new enemyInfo("Hooded Hopper", "Bunny", "the Shadow Hare", "M", true, {}, {}, { mana: 120 }, [708], ["https://i.ibb.co/wFXPyyBx/hooded-hopper.png"], [], 19,
        new skillInfo(19, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            const damage = dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:bleeding_attack:1340697423793754134> **${enemy.name}**`, { atkMultiplier: 0.8 });

            if (damage > 0) {
                mybuff.hp.push(new buffInfo("+", -Math.floor(damage * 0.1), 9999));
            };

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.buffScale = 1;
            // eStats.buffIds = [];

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                // Reflects DoT, +50% DoT to Boss
                // Object.keys(ebuff).forEach((stat) => {
                //     ebuff[stat as keyof Buffs].forEach((buff) => {
                //         if (buff.isDebuff && !(eStats.buffIds.includes(buff.id))) {
                //             eStats.buffIds.push(buff.id);
                //             mybuff[stat as keyof Buffs].push(new buffInfo(buff.type, buff.val, buff.last, buff.change, buff.ctype, buff.cap));
                //             buff.val = buff.val * (eStats.buffScale + 0.5);
                //         };
                //     });
                // });

                // +25% DoT, removes boss debuffs
                if (matchStats.round % 10 === 0) {
                    Object.keys(ebuff).forEach((stat) => {
                        ebuff[stat as keyof Buffs] = ebuff[stat as keyof Buffs].filter((buff) => !buff.isDebuff);
                    });
                    // eStats.buffScale += 0.25;
                    notice.push(`\n<:bleeding_rage:1340697425630986240> **${enemy.name}** sheds its debuffs!`);
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        }, [["Dots applied to the Hooded Hopper are applied to the player as well", "After every **10th** round, removes debuffs afflicting itself", "**Active**: Deals **80%** damage and applies bleeding equal to **10%** the damage caused, lasting until the end of the fight (**40** <:mana:1047269152957661255>)"]])
    ),
    new enemyInfo("Hooded Striker", "Bunny", "the Shadow Hare", "M", true, {}, {}, { mana: 120 }, [708], ["https://i.ibb.co/v6w1Z8g4/hooded-striker.png"], [], 20,
        new skillInfo(20, 55, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            const damage = dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:bleeding_attack:1340697423793754134> **${enemy.name}**`, { atkMultiplier: 1.5 });

            if (damage > 0) {
                mybuff.hp.push(new buffInfo("+", -Math.floor(damage * 0.1), 9999));
            };

            // const randomBuff = Math.floor(Math.random() * 3);
            // const rBuffScale = 0.075, dodgeScale = 0.15;

            // if (randomBuff === 0) { // Burn: 7.5% of your attack stats
            //     mybuff.atk.push(new buffInfo("+", -Math.floor(myStats.atk * rBuffScale), 9999));
            //     mybuff.md.push(new buffInfo("+", -Math.floor(myStats.md * rBuffScale), 9999));
            //     myStats.atk -= Math.floor(myStats.atk * rBuffScale);
            //     myStats.md -= Math.floor(myStats.md * rBuffScale);
            // } else if (randomBuff === 1) { // Poison: 7.5% of your defense stats
            //     ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * rBuffScale), 9999));
            //     ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * rBuffScale), 9999));
            //     eStats.def -= Math.floor(eStats.def * rBuffScale);
            //     eStats.mr -= Math.floor(eStats.mr * rBuffScale);
            // } else { // Freeze: 15% of your dodge and block stats
            //     mybuff.dodge.push(new buffInfo("+", -dodgeScale, 9999));
            //     mybuff.br.push(new buffInfo("+", -Math.floor(myStats.br * rBuffScale), 9999));
            //     myStats.dodge -= dodgeScale;
            //     myStats.br -= Math.floor(myStats.br * rBuffScale);
            // };

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.buffScale = 1;
            // eStats.buffIds = [];

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                // Reflects DoT, +75% DoT to Boss
                // Object.keys(ebuff).forEach((stat) => {
                //     ebuff[stat as keyof Buffs].forEach((buff) => {
                //         if (buff.isDebuff && !(eStats.buffIds.includes(buff.id))) {
                //             eStats.buffIds.push(buff.id);
                //             mybuff[stat as keyof Buffs].push(new buffInfo(buff.type, buff.val, buff.last, buff.change, buff.ctype, buff.cap));
                //             buff.val = buff.val * (eStats.buffScale + 0.75);
                //         }
                //     });
                // });

                // Removes boss debuffs, +40% DoT
                if (matchStats.round % 8 === 0) {
                    Object.keys(ebuff).forEach((stat) => {
                        ebuff[stat as keyof Buffs] = ebuff[stat as keyof Buffs].filter((buff) => !buff.isDebuff);
                    });
                    // eStats.buffScale += 0.4;
                    notice.push(`\n<:bleeding_rage:1340697425630986240> **${enemy.name}** sheds its debuffs!`);
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        }, [["Dots applied to the Hooded Hopper are applied to the player as well", "After every **8th** round, removes debuffs afflicting itself", "**Active**: Deals **150%** damage and applies bleeding equal to **10%** the damage caused, lasting until the end of the fight (**55** <:mana:1047269152957661255>)"]])
    ),

    new enemyInfo("POSTMASTER MALEDICT", "M", "the Postmaster", "M", true, {}, {}, { mana: 120 }, [735, 736, 737, 738], ["https://i.ibb.co/DHk8Nfyz/POSTMASTER-MALEDICT.png"], [], 21,
        new skillInfo(21, 55, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            eStats.mailActive = true;
            notice.push(`\n<:mail_destruction:1340705160304787617> ACTIVATE, MAIL. TEERMINAAATIONNNN!!!`);

            // -15% DEF/MR (3 rounds)
            mybuff.def.push(new buffInfo("+", -Math.floor(myStats.def * 0.15), 3));
            mybuff.mr.push(new buffInfo("+", -Math.floor(myStats.mr * 0.15), 3));
            myStats.def -= Math.floor(myStats.def * 0.15);
            myStats.mr -= Math.floor(myStats.mr * 0.15);

            notice.push(`\n<:priority_processing:1340705158128205886> YOU'VE BEEN STAMPED FOR PRIORITY PROCESSING!`);

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            eStats.mailActive = false;

            const buttonConfigs = [
                { id: 'ATK', trigger: 'attack', emoji: myStats.replaceButton?.atk?.emoji || '⚔️' },
                { id: 'DEF', trigger: 'defend', emoji: myStats.replaceButton?.def?.emoji || '🛡️' },
                { id: 'ABILITY', trigger: 'ability', emoji: myStats.replaceButton?.ability?.emoji || '✨' },
                { id: 'SKILL', trigger: 'cskill', emoji: myStats.replaceButton?.cskill?.emoji || '⚜️' },
                { id: 'SKIP', trigger: 'skip', emoji: myStats.replaceButton?.skip?.emoji || '<:dodge_chance:1047269150948606063>' }
            ];

            let buttons = [
                new ButtonBuilder().setCustomId('ATK').setEmoji(buttonConfigs[0].emoji).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('DEF').setEmoji(buttonConfigs[1].emoji).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ABILITY').setEmoji(buttonConfigs[2].emoji).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('SKILL').setEmoji(buttonConfigs[3].emoji).setStyle(ButtonStyle.Secondary).setDisabled(myStats.class !== -1 ? false : true),
                new ButtonBuilder().setCustomId('SKIP').setEmoji(buttonConfigs[4].emoji).setStyle(ButtonStyle.Secondary)
            ];
            let availableButtons = [0, 1, 2, 3];

            function updateButtons(buttons: ButtonBuilder[], availableButtons: number[], myStats: DetailedStats, enemy: IentityInfo, eStats: DetailedStats) {
                const successIndex = availableButtons.splice(Math.floor(Math.random() * availableButtons.length), 1)[0];
                const dangerIndex = availableButtons.splice(Math.floor(Math.random() * availableButtons.length), 1)[0];
                const fakeDanger1 = availableButtons[0];
                const fakeDanger2 = availableButtons[1];

                if (eStats.mailActive) {
                    [fakeDanger1, fakeDanger2].forEach(index => {
                        index === 3
                            ? buttons[index] = new ButtonBuilder().setCustomId(buttonConfigs[index].id).setEmoji(buttonConfigs[index].emoji).setStyle(ButtonStyle.Danger).setDisabled(myStats.class !== -1 ? false : true)
                            : buttons[index] = new ButtonBuilder().setCustomId(buttonConfigs[index].id).setEmoji(buttonConfigs[index].emoji).setStyle(ButtonStyle.Danger);
                    });
                }
                successIndex === 3
                    ? buttons[successIndex] = new ButtonBuilder().setCustomId(buttonConfigs[successIndex].id).setEmoji(buttonConfigs[successIndex].emoji).setStyle(ButtonStyle.Success).setDisabled(myStats.class !== -1 ? false : true)
                    : buttons[successIndex] = new ButtonBuilder().setCustomId(buttonConfigs[successIndex].id).setEmoji(buttonConfigs[successIndex].emoji).setStyle(ButtonStyle.Success);

                dangerIndex === 3
                    ? buttons[dangerIndex] = new ButtonBuilder().setCustomId(buttonConfigs[dangerIndex].id).setEmoji(buttonConfigs[dangerIndex].emoji).setStyle(ButtonStyle.Danger).setDisabled(myStats.class !== -1 ? false : true)
                    : buttons[dangerIndex] = new ButtonBuilder().setCustomId(buttonConfigs[dangerIndex].id).setEmoji(buttonConfigs[dangerIndex].emoji).setStyle(ButtonStyle.Danger);

                eStats.mailButtonS = buttonConfigs[successIndex].trigger;
                eStats.mailButtonD = buttonConfigs[dangerIndex].trigger;
                eStats.mailButtonF1 = buttonConfigs[fakeDanger1].trigger;
                eStats.mailButtonF2 = buttonConfigs[fakeDanger2].trigger;

                return new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
            };

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

                const atkScale = 0.1;

                // Increases damage when player uses special abilities
                matchStats.on("ABILITY", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                    if (caster === myStats) {
                        eStats.atk += Math.floor(eStats.atk * atkScale);
                        eStats.md += Math.floor(eStats.md * atkScale);
                        ebuff.atk.push(new buffInfo("+", eStats.atk * atkScale, 5));
                        ebuff.md.push(new buffInfo("+", eStats.md * atkScale, 5));
                        notice.push(`\n<:handling_fee:1340705156450484378> SPECIAL HANDLING FEE APPLIED!`);
                    };
                });

                if (matchStats.round % 3 === 0 || eStats.mailActive) {

                    notice.push(`\n<:complaint_letter:1340484041140604988>  **${enemy.name}** sent a mail!`);
                    matchStats.interaction.editReply({ components: [updateButtons(buttons, availableButtons, myStats, enemy, eStats)] });

                    matchStats.on(eStats.mailButtonS, {
                        duration: 1, callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                            if (caster === myStats) {
                                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:mail_trash:1340705153916862504> **${enemy.name}**'s mail is in the trash and`, { atkMultiplier: 0.5, block: false, dodge: false });
                            }
                        }
                    });
                    matchStats.on(eStats.mailButtonD, {
                        duration: 1, callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                            if (caster === myStats) {
                                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:mail_demolishment:1340707065718640744> **${enemy.name}**'s mail demolished you and`, { atkMultiplier: 1.75, block: false, dodge: false, ignoreShield: true });
                            }
                        }
                    });
                    matchStats.on(eStats.mailButtonF1, {
                        duration: 1, callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                            if (caster === myStats) {
                                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:mail_hit:1340705150674931755> **${enemy.name}**'s mail hit you and`, { ignoreShield: true, block: false, dodge: false });
                            }
                        }
                    });
                    matchStats.on(eStats.mailButtonF2, {
                        duration: 1, callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                            if (caster === myStats) {
                                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:mail_hit:1340705150674931755> **${enemy.name}**'s mail hit you and`, { ignoreShield: true, block: false, dodge: false });
                            }
                        }
                    });

                    // Recover normal settings
                    availableButtons = [0, 1, 2, 3];
                    buttons = [new ButtonBuilder().setCustomId('ATK').setEmoji(buttonConfigs[0].emoji).setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId('DEF').setEmoji(buttonConfigs[1].emoji).setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId('ABILITY').setEmoji(buttonConfigs[2].emoji).setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId('SKILL').setEmoji(buttonConfigs[3].emoji).setStyle(ButtonStyle.Secondary).setDisabled(myStats.class !== -1 ? false : true), new ButtonBuilder().setCustomId('SKIP').setEmoji(buttonConfigs[4].emoji).setStyle(ButtonStyle.Secondary)];
                    eStats.mailActive = false;

                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
                        matchStats.interaction.editReply({ components: [row] });

                        return AbilityResponse.SUCCESS;
                    }));
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        }, [["Sends a mail every **3** rounds, then presents an option: The green button decreases the damage dealt, the red button incrases it", "Increases its damage every time the player uses their active ability", "**Active**: Decreases the player's DEF and MR by **15%** for **3** rounds, and adds **2** more red buttons, only one is the real red button (**55** <:mana:1047269152957661255>)"]])
    ),

    new enemyInfo("Valkorath", "Dark Paladin", "the Dark Sentinel", "M", true, {}, {}, { mana: 120 }, [691, 692, 700, 706], ["https://i.ibb.co/nqzkvYBR/valkorath.png"], [], 22,
        new skillInfo(22, 90, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            const domainDuration = 5, crSet = 0.5, cdSet = 1.5;

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                eStats.domain = true;
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:lightning_domain:1340700503889412238> **${enemy.name}**'s domain`, { isLightning: true, atkMultiplier: 0.4, mdChance: (Math.random() < 0.5 ? 1 : 0), magicDamage: true });

                return AbilityResponse.SUCCESS;
            }, domainDuration));
            eStats.cr = crSet;
            eStats.cd = cdSet;
            ebuff.cr.push(new buffInfo("=", crSet, domainDuration));
            ebuff.cd.push(new buffInfo("=", cdSet, domainDuration));

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            eStats.shield = myStats.maxhp * 0.4;

            // On boss shield break: Reverses type of damage for 3 rounds
            matchStats.on("shieldBreak", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (target === eStats) {
                    if (myStats.mdChance > 0) myStats.mdChance = 0;
                    else myStats.mdChance = 1;
                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 3, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        if (myStats.mdChance > 0) myStats.mdChance = 0;
                        else myStats.mdChance = 1;

                        return AbilityResponse.SUCCESS;
                    }));
                }
            });

            // +2.5% shield every round, every even round: magic dmg
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (!eStats.domain) eStats.shield += eStats.shield * 0.075;
                if (matchStats.round % 2 === 0 || eStats.domain) eStats.mdChance = 1;
                else eStats.mdChance = 0;
                eStats.domain = false;

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        }, [["Gains **40%** of the player's max HP as a shield", "Increases his shield by **7.5%** every round", "On shield break, reverses the player's damage type for **3** rounds", "Has a **50%** chance to deal magical damage", "**Active**: Enters a domain which lasts **5** rounds, in which he increases his crit rate by **50%**, sets his crit damage to **150%**, and deals **40%** lightning damage (**90** <:mana:1047269152957661255>)"]])
    ),
    new enemyInfo("Vortharion", "Dark Paladin", "the Warden of Shadows", "M", true, {}, {}, { mana: 120 }, [691, 692, 700, 706], ["https://i.ibb.co/TQTQXVy/vortharion.png"], [], 23,
        new skillInfo(23, 90, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            const domainDuration = 5, crSet = 0.6, cdSet = 1.75;

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                eStats.domain = true;
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:lightning_domain:1340700503889412238> **${enemy.name}**'s domain`, { isLightning: true, atkMultiplier: 0.45, mdChance: (Math.random() < 0.5 ? 1 : 0), magicDamage: true });

                return AbilityResponse.SUCCESS;
            }, domainDuration));

            eStats.cr = crSet;
            eStats.cd = cdSet;
            ebuff.cr.push(new buffInfo("=", crSet, domainDuration));
            ebuff.cd.push(new buffInfo("=", cdSet, domainDuration));

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            eStats.shield = myStats.maxhp * 0.65;

            const shieldBreakDuration = 4;

            // On boss shield break: Reverses type of damage, player: 0% dodge for 4 rounds
            matchStats.on("shieldBreak", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (target === eStats) {
                    if (myStats.mdChance > 0) myStats.mdChance = 0;
                    else myStats.mdChance = 1;
                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + shieldBreakDuration, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        if (myStats.mdChance > 0) myStats.mdChance = 0;
                        else myStats.mdChance = 1;

                        return AbilityResponse.SUCCESS;
                    }));

                    myStats.dodge = 0;
                    mybuff.dodge.push(new buffInfo("=", 0, shieldBreakDuration));
                }
            });

            // +17.5% shield every round, every even round: magic dmg
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (!eStats.domain) eStats.shield += eStats.shield * 0.175;
                if (matchStats.round % 2 === 0 || eStats.domain) eStats.mdChance = 1;
                else eStats.mdChance = 0;
                eStats.domain = false;

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        }, [["Gains **65%** of the player's max HP as a shield", "Increases his shield by **17.5%** every round", "On shield break, reverses the player's damage type for **4** rounds", "Has a **50%** chance to deal magical damage", "**Active**: Enters a domain which lasts **5** rounds, in which he increases his crit rate by **60%**, sets his crit damage to **175%**, and deals **45%** lightning damage (**90** <:mana:1047269152957661255>)"]])
    ),
    new enemyInfo("Duskraze", "Dark Paladin", "the Dark Emperor", "M", true, {}, {}, { mana: 120 }, [691, 692, 700, 706], ["https://i.ibb.co/hRLBMbvt/duskraze.png"], [], 24,
        new skillInfo(24, 90, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            const domainDuration = 5, crSet = 0.7, cdSet = 2;

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                eStats.domain = true;
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:lightning_domain:1340700503889412238> **${enemy.name}**'s domain`, { isLightning: true, atkMultiplier: 0.5, mdChance: (Math.random() < 0.5 ? 1 : 0), magicDamage: true });

                return AbilityResponse.SUCCESS;
            }, domainDuration));

            eStats.cr = crSet;
            eStats.cd = cdSet;
            ebuff.cr.push(new buffInfo("=", crSet, domainDuration));
            ebuff.cd.push(new buffInfo("=", cdSet, domainDuration));

            return AbilityResponse.SUCCESS;
        }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            eStats.shield = myStats.maxhp * 0.75; eStats.shieldOrb = 0;
            const shieldBreakDuration = 5;

            matchStats.on("shieldBreak", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (target === eStats) {
                    if (myStats.mdChance > 0) myStats.mdChance = 0;
                    else myStats.mdChance = 1;
                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + shieldBreakDuration, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        if (myStats.mdChance > 0) myStats.mdChance = 0;
                        else myStats.mdChance = 1;

                        return AbilityResponse.SUCCESS;
                    }));
                    myStats.dodge = 0;
                    mybuff.dodge.push(new buffInfo("=", 0, shieldBreakDuration));
                }
            });

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (!eStats.domain) {
                    eStats.shieldOrb += eStats.shield * 0.15; // Orb saves 15% of your shield every round
                    eStats.shield -= eStats.shield * 0.1;
                };

                // every even round: magic dmg
                if (matchStats.round % 2 === 0 || eStats.domain) eStats.mdChance = 1;
                else eStats.mdChance = 0;

                if (matchStats.round % 6 === 0) {
                    //? maybe as lightning damage?
                    //? Check damage
                    dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:void_orb:1340700501905379440> **${enemy.name}** used his VOID! **${enemy.name}**`, { overwriteDamage: Math.floor(eStats.shieldOrb * 0.8), dodge: false, block: false, ignoreShield: true });
                    eStats.shield += eStats.shieldOrb * 0.35;
                    eStats.shieldOrb = 0;
                };
                eStats.domain = false;

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        }, [["Gains **75%** of the player's max HP as a shield", "Stores **15%** of his shield for his Void Orb every round, decreases his shield by **10%** each time", "On shield break, reverses the player's damage type for **5** rounds", "Has a **50%** chance to deal magical damage", "Every **6th** round, he uses Void Orb, dealing the stored amount of shield as damage", "**Active**: Enters a domain which lasts **5** rounds, in which he increases his crit rate by **70%**, sets his crit damage to **175%**, and deals **50%** lightning damage (**90** <:mana:1047269152957661255>)"]])
    ),
];

export class floorInfo {
    private _floor: number;
    private _boss: boolean;
    private _winsNeeded: number;
    private _monsters: number[];
    private _stats: object;

    constructor(floor: number, boss: boolean, winsNeeded: number, monsters: number[], stats: object) {
        this._floor = floor;
        this._boss = boss;
        this._winsNeeded = winsNeeded;
        this._monsters = monsters;
        this._stats = stats;
    };

    get floor() {
        return this._floor;
    };
    get boss() {
        return this._boss;
    };
    get winsNeeded() {
        return this._winsNeeded;
    };
    get monsters() {
        return this._monsters;
    };
    get monster() {
        return enemies[this._monsters[Math.floor(Math.random() * this._monsters.length)]];
    };
    stats(monstr: enemyInfo) {
        let defaultStats: any = {
            "name": monstr.name,
            "hp": 180,
            "maxhp": 180,
            "atk": 40,
            "def": 20,
            "ep": 0,
            "md": 30,
            "mr": 20,
            "cr": 0.18,
            "cd": 1.25,
            "td": 30,
            "br": 0.15,
            "dodge": 0.1,
            "mana": 80,
            "mg": 15,
            "sm": 20,
            "rev": 0,
            "revhp": 0.5,
            "shield": 0,
            "mdChance": 0,
        };
        Object.entries(this._stats).forEach((e) => defaultStats[e[0]] = e[1]);

        // Monster Stat Adjustments
        Object.entries(monstr.setStats).forEach((e) => defaultStats[e[0]] = e[1]);
        Object.entries(monstr.multStats).forEach((e) => defaultStats[e[0]] = Math.floor(defaultStats[e[0]] * e[1]));
        Object.entries(monstr.addStats).forEach((e) => defaultStats[e[0]] += e[1]);

        defaultStats["maxhp"] = defaultStats["hp"];
        defaultStats["td"] = (defaultStats["atk"] + defaultStats["md"]) / 2;
        defaultStats.ep = Math.floor(((1 / (1 - defaultStats.dodge)) * (defaultStats.hp / Math.pow(0.99895, Math.max(defaultStats.def, defaultStats.mr))) / (200 / (Math.max(defaultStats.atk, defaultStats.md) * (1 + ((defaultStats.cr > 1 ? 1 : (defaultStats.cr < 0) ? 0 : defaultStats.cr) * (defaultStats.cd - 1)))))) * 100) / 100;
        return defaultStats;
    };
};

/*
    DEF Table
     1% dmg reduction =   10 DEF
    10% dmg reduction =  100 DEF
    20% dmg reduction =  212 DEF
    25% dmg reduction =  274 DEF
    33% dmg reduction =  386 DEF
    50% dmg reduction =  660 DEF
    66% dmg reduction = 1045 DEF
    75% dmg reduction = 1320 DEF
    90% dmg reduction = 2192 DEF
*/

export const floors: floorInfo[] = [
    new floorInfo(0, false, 0, [], {}),

    // Easy 1-100
    new floorInfo(1, false, 2, [0, 1, 2], { "hp": 210, "atk": 42, "def": 20, "md": 32, "mr": 15 }),
    new floorInfo(2, false, 3, [0, 1, 2], { "hp": 230, "atk": 44, "def": 22, "md": 37, "mr": 18 }),
    new floorInfo(3, false, 3, [0, 1, 2, 3], { "hp": 240, "atk": 50, "def": 24, "md": 45, "mr": 22 }),
    new floorInfo(4, false, 3, [0, 1, 2, 3], { "hp": 270, "atk": 50, "def": 25, "md": 50, "mr": 25 }),
    new floorInfo(5, true, 1, [4], { "hp": 340, "atk": 64, "def": 30, "md": 40, "mr": 25, "dodge": 0.1, "shield": 50 }),
    new floorInfo(6, false, 5, [0, 1, 2, 3, 5, 6], { "hp": 360, "atk": 70, "def": 36, "md": 54, "mr": 32 }),
    new floorInfo(7, false, 5, [0, 1, 2, 3, 5, 6], { "hp": 410, "atk": 80, "def": 40, "md": 60, "mr": 36 }),
    new floorInfo(8, false, 5, [0, 1, 2, 3, 5, 6], { "hp": 470, "atk": 92, "def": 44, "md": 76, "mr": 38 }),
    new floorInfo(9, false, 5, [0, 1, 2, 3, 5, 6], { "hp": 500, "atk": 100, "def": 50, "md": 86, "mr": 44 }),
    new floorInfo(10, true, 1, [7], { "hp": 550, "atk": 105, "def": 58, "md": 86, "mr": 47 }),
    new floorInfo(11, false, 8, [3, 5, 6, 8], { "hp": 600, "atk": 120, "def": 60, "md": 96, "mr": 52 }),
    new floorInfo(12, false, 8, [3, 5, 6, 8], { "hp": 630, "atk": 136, "def": 66, "md": 118, "mr": 60 }),
    new floorInfo(13, false, 8, [3, 5, 6, 8], { "hp": 660, "atk": 144, "def": 66, "md": 120, "mr": 64 }),
    new floorInfo(14, false, 8, [3, 5, 6, 8], { "hp": 680, "atk": 155, "def": 70, "md": 136, "mr": 66 }),
    new floorInfo(15, true, 1, [9], { "hp": 760, "atk": 180, "def": 70, "md": 150, "mr": 90 }),
    new floorInfo(16, false, 8, [10, 11], { "hp": 780, "atk": 180, "def": 80, "md": 190, "mr": 90 }),
    new floorInfo(17, false, 8, [10, 11], { "hp": 810, "atk": 180, "def": 84, "md": 195, "mr": 91 }),
    new floorInfo(18, false, 8, [10, 11], { "hp": 870, "atk": 187, "def": 89, "md": 208, "mr": 96 }),
    new floorInfo(19, false, 8, [10, 11], { "hp": 910, "atk": 200, "def": 92, "md": 220, "mr": 100 }),
    new floorInfo(20, true, 1, [12], { "hp": 1200, "atk": 200, "def": 100, "md": 200, "mr": 100 }),
    new floorInfo(21, false, 8, [10, 11, 13, 15], { "hp": 1100, "atk": 220, "def": 100, "md": 250, "mr": 105 }),
    new floorInfo(22, false, 8, [10, 11, 13, 15], { "hp": 1160, "atk": 230, "def": 106, "md": 260, "mr": 110 }),
    new floorInfo(23, false, 8, [10, 11, 13, 15], { "hp": 1230, "atk": 236, "def": 110, "md": 272, "mr": 115 }),
    new floorInfo(24, false, 8, [10, 11, 13, 15], { "hp": 1280, "atk": 250, "def": 112, "md": 280, "mr": 116 }),
    new floorInfo(25, true, 1, [14], { "hp": 1040, "atk": 300, "def": 276, "md": 300, "mr": 267, "shield": 250 }),
    new floorInfo(26, false, 8, [15], { "hp": 1320, "atk": 260, "def": 120, "md": 300, "mr": 168 }),
    new floorInfo(27, false, 8, [15], { "hp": 1360, "atk": 280, "def": 128, "md": 305, "mr": 174 }),
    new floorInfo(28, false, 8, [15], { "hp": 1420, "atk": 280, "def": 128, "md": 305, "mr": 174 }),
    new floorInfo(29, false, 8, [15], { "hp": 1500, "atk": 282, "def": 130, "md": 306, "mr": 175 }),
    new floorInfo(30, true, 1, [16], { "hp": 1480, "atk": 310, "def": 260, "md": 310, "mr": 250 }),
    new floorInfo(31, false, 8, [17], { "hp": 1580, "atk": 270, "def": 150, "md": 316, "mr": 210 }),
    new floorInfo(32, false, 8, [17], { "hp": 1670, "atk": 275, "def": 157, "md": 320, "mr": 212 }),
    new floorInfo(33, false, 8, [17], { "hp": 1795, "atk": 280, "def": 160, "md": 321, "mr": 214 }),
    new floorInfo(34, false, 8, [17], { "hp": 1850, "atk": 284, "def": 170, "md": 323, "mr": 218 }),
    new floorInfo(35, true, 1, [18], { "hp": 1910, "atk": 365, "def": 110, "md": 300, "mr": 90 }),
    new floorInfo(36, false, 8, [17, 19], { "hp": 1970, "atk": 304, "def": 200, "md": 320, "mr": 228 }),
    new floorInfo(37, false, 8, [17, 19], { "hp": 2060, "atk": 314, "def": 210, "md": 323, "mr": 230 }),
    new floorInfo(38, false, 8, [17, 19], { "hp": 2180, "atk": 314, "def": 220, "md": 323, "mr": 232 }),
    new floorInfo(39, false, 8, [17, 19], { "hp": 2300, "atk": 314, "def": 230, "md": 323, "mr": 236 }),
    new floorInfo(40, true, 1, [20], { "hp": 2460, "atk": 310, "def": 142, "md": 337, "mr": 186 }),
    new floorInfo(41, false, 8, [19, 22], { "hp": 2700, "atk": 280, "def": 275, "md": 260, "mr": 186, "shield": 300 }),
    new floorInfo(42, false, 8, [19, 22], { "hp": 2810, "atk": 281, "def": 278, "md": 262, "mr": 190, "shield": 320 }),
    new floorInfo(43, false, 8, [19, 22], { "hp": 2920, "atk": 283, "def": 280, "md": 265, "mr": 192, "shield": 345 }),
    new floorInfo(44, false, 8, [19, 22], { "hp": 3025, "atk": 284, "def": 290, "md": 266, "mr": 194, "shield": 370 }),
    new floorInfo(45, true, 1, [21], { "hp": 2930, "atk": 310, "def": 152, "md": 350, "mr": 192 }),
    new floorInfo(46, false, 8, [22, 24], { "hp": 3220, "atk": 284, "def": 294, "md": 270, "mr": 196, "shield": 400 }),
    new floorInfo(47, false, 8, [22, 24], { "hp": 3240, "atk": 293, "def": 294, "md": 283, "mr": 197, "shield": 450 }),
    new floorInfo(48, false, 8, [22, 24], { "hp": 3370, "atk": 293, "def": 294, "md": 283, "mr": 197, "shield": 500 }),
    new floorInfo(49, false, 8, [22, 24], { "hp": 3460, "atk": 300, "def": 300, "md": 290, "mr": 200, "shield": 600 }),
    new floorInfo(50, true, 1, [23], { "hp": 3200, "atk": 360, "def": 206, "md": 360, "mr": 256 }),
    new floorInfo(51, false, 8, [24, 26], { "hp": 3420, "atk": 340, "def": 276, "md": 330, "mr": 226 }),
    new floorInfo(52, false, 8, [24, 26], { "hp": 3470, "atk": 343, "def": 280, "md": 332, "mr": 227 }),
    new floorInfo(53, false, 8, [24, 26], { "hp": 3520, "atk": 348, "def": 283, "md": 333, "mr": 229 }),
    new floorInfo(54, false, 8, [24, 26], { "hp": 3560, "atk": 350, "def": 284, "md": 334, "mr": 230 }),
    new floorInfo(55, true, 1, [25], { "hp": 3328, "atk": 370, "def": 224, "md": 393, "mr": 262 }),
    new floorInfo(56, false, 8, [26], { "hp": 3570, "atk": 378, "def": 284, "md": 354, "mr": 230 }),
    new floorInfo(57, false, 8, [26], { "hp": 3570, "atk": 390, "def": 286, "md": 359, "mr": 232 }),
    new floorInfo(58, false, 8, [26], { "hp": 3620, "atk": 393, "def": 287, "md": 364, "mr": 233 }),
    new floorInfo(59, false, 8, [26], { "hp": 3660, "atk": 396, "def": 290, "md": 370, "mr": 235 }),
    new floorInfo(60, true, 1, [27], { "hp": 3480, "atk": 364, "def": 367, "md": 316, "mr": 385, "shield": 500 }),
    new floorInfo(61, false, 8, [28], { "hp": 3660, "atk": 345, "def": 220, "md": 408, "mr": 320 }),
    new floorInfo(62, false, 8, [28], { "hp": 3710, "atk": 357, "def": 226, "md": 419, "mr": 322 }),
    new floorInfo(63, false, 8, [28], { "hp": 3800, "atk": 360, "def": 237, "md": 431, "mr": 330 }),
    new floorInfo(64, false, 8, [28], { "hp": 3830, "atk": 370, "def": 240, "md": 444, "mr": 337 }),
    new floorInfo(65, true, 1, [29], { "hp": 3777, "atk": 420, "def": 254, "md": 490, "mr": 292 }),
    new floorInfo(66, false, 8, [28, 30], { "hp": 3960, "atk": 377, "def": 250, "md": 467, "mr": 338 }),
    new floorInfo(67, false, 8, [28, 30], { "hp": 4100, "atk": 380, "def": 260, "md": 470, "mr": 340 }),
    new floorInfo(68, false, 8, [28, 30], { "hp": 4250, "atk": 390, "def": 267, "md": 480, "mr": 342 }),
    new floorInfo(69, false, 8, [28, 30], { "hp": 4444, "atk": 400, "def": 270, "md": 486, "mr": 343 }),
    new floorInfo(70, true, 1, [31], { "hp": 4000, "atk": 600, "def": 314, "md": 460, "mr": 302 }),
    new floorInfo(71, false, 8, [28, 30], { "hp": 4870, "atk": 400, "def": 270, "md": 489, "mr": 353 }),
    new floorInfo(72, false, 8, [28, 30], { "hp": 5070, "atk": 420, "def": 280, "md": 508, "mr": 354 }),
    new floorInfo(73, false, 8, [28, 30], { "hp": 5100, "atk": 430, "def": 283, "md": 542, "mr": 355 }),
    new floorInfo(74, false, 8, [28, 30], { "hp": 5240, "atk": 430, "def": 291, "md": 572, "mr": 358 }),
    new floorInfo(75, true, 1, [32], { "hp": 4800, "atk": 500, "def": 274, "md": 684, "mr": 361 }),
    new floorInfo(76, false, 8, [33], { "hp": 6666, "atk": 580, "def": 293, "md": 562, "mr": 295 }),
    new floorInfo(77, false, 8, [33], { "hp": 7000, "atk": 584, "def": 294, "md": 563, "mr": 297 }),
    new floorInfo(78, false, 8, [33], { "hp": 7320, "atk": 600, "def": 296, "md": 568, "mr": 299 }),
    new floorInfo(79, false, 8, [33], { "hp": 7500, "atk": 620, "def": 300, "md": 570, "mr": 307 }),
    new floorInfo(80, true, 1, [34], { "hp": 8500, "atk": 777, "def": 64, "md": 555, "mr": 52 }),
    new floorInfo(81, false, 8, [33, 35, 37], { "hp": 8000, "atk": 680, "def": 300, "md": 620, "mr": 308 }),
    new floorInfo(82, false, 8, [33, 35, 37], { "hp": 8200, "atk": 710, "def": 310, "md": 670, "mr": 311 }),
    new floorInfo(83, false, 8, [33, 35, 37], { "hp": 8420, "atk": 728, "def": 316, "md": 676, "mr": 313 }),
    new floorInfo(84, false, 8, [33, 35, 37], { "hp": 8650, "atk": 736, "def": 320, "md": 687, "mr": 316 }),
    new floorInfo(85, true, 1, [36], { "hp": 8340, "atk": 726, "def": 274, "md": 787, "mr": 346 }),
    new floorInfo(86, false, 8, [35, 37], { "hp": 9340, "atk": 766, "def": 324, "md": 713, "mr": 306 }),
    new floorInfo(87, false, 8, [35, 37], { "hp": 10000, "atk": 768, "def": 325, "md": 717, "mr": 312 }),
    new floorInfo(88, false, 8, [35, 37], { "hp": 10600, "atk": 774, "def": 328, "md": 757, "mr": 318 }),
    new floorInfo(89, false, 8, [35, 37], { "hp": 11111, "atk": 777, "def": 333, "md": 777, "mr": 333 }),
    new floorInfo(90, true, 1, [38], { "hp": 10000, "atk": 820, "def": 420, "md": 632, "mr": 420 }),
    new floorInfo(91, true, 1, [39], { "hp": 11020, "atk": 645, "def": 272, "md": 864, "mr": 333 }),
    new floorInfo(92, true, 1, [40], { "hp": 8450, "atk": 1280, "def": 278, "md": 864, "mr": 236 }),
    new floorInfo(93, true, 1, [41], { "hp": 9620, "atk": 845, "def": 302, "md": 1134, "mr": 363 }),
    new floorInfo(94, true, 1, [42], { "hp": 11000, "atk": 1000, "def": 400, "md": 1000, "mr": 400, "br": 0.25 }),
    new floorInfo(95, true, 1, [43], { "hp": 10066, "atk": 915, "def": 325, "md": 1154, "mr": 375 }),
    new floorInfo(96, true, 1, [44], { "hp": 10000, "atk": 928, "def": 332, "md": 1161, "mr": 421 }),
    new floorInfo(97, true, 1, [45], { "hp": 10400, "atk": 944, "def": 347, "md": 1206, "mr": 426, "cr": 0.22 }),
    new floorInfo(98, true, 1, [46], { "hp": 12300, "atk": 1234, "def": 262, "md": 1065, "mr": 307 }),
    new floorInfo(99, true, 1, [47], { "hp": 12500, "atk": 1000, "def": 400, "md": 1111, "mr": 400 }),
    new floorInfo(100, true, 1, [48], { "hp": 13500, "atk": 1147, "def": 320, "md": 1224, "mr": 333 }),

    // Difficult 101-200
    new floorInfo(101, false, 12, [0, 1, 2], { "hp": 13000, "atk": 1277, "def": 304, "md": 1132, "mr": 343 }),
    new floorInfo(102, false, 12, [0, 1, 2], { "hp": 13200, "atk": 1300, "def": 307, "md": 1173, "mr": 344 }),
    new floorInfo(103, false, 12, [0, 1, 2, 3], { "hp": 13400, "atk": 1310, "def": 310, "md": 1178, "mr": 345 }),
    new floorInfo(104, false, 12, [0, 1, 2, 3], { "hp": 13700, "atk": 1316, "def": 312, "md": 1185, "mr": 346 }),
    new floorInfo(105, true, 3, [4], { "hp": 14000, "atk": 1313, "def": 354, "md": 982, "mr": 297, "shield": 800 }),
    new floorInfo(106, false, 12, [0, 1, 2, 3, 5, 6], { "hp": 14400, "atk": 1320, "def": 320, "md": 1200, "mr": 349 }),
    new floorInfo(107, false, 12, [0, 1, 2, 3, 5, 6], { "hp": 14720, "atk": 1324, "def": 323, "md": 1220, "mr": 352 }),
    new floorInfo(108, false, 12, [0, 1, 2, 3, 5, 6], { "hp": 14960, "atk": 1330, "def": 324, "md": 1236, "mr": 353 }),
    new floorInfo(109, false, 12, [0, 1, 2, 3, 5, 6], { "hp": 15210, "atk": 1333, "def": 326, "md": 1246, "mr": 355 }),
    new floorInfo(110, true, 3, [7], { "hp": 16180, "atk": 1320, "def": 322, "md": 1250, "mr": 286 }),
    new floorInfo(111, false, 12, [3, 5, 6, 8], { "hp": 16000, "atk": 1340, "def": 340, "md": 1184, "mr": 309 }),
    new floorInfo(112, false, 12, [3, 5, 6, 8], { "hp": 16200, "atk": 1355, "def": 341, "md": 1207, "mr": 312 }),
    new floorInfo(113, false, 12, [3, 5, 6, 8], { "hp": 16500, "atk": 1362, "def": 341, "md": 1212, "mr": 314 }),
    new floorInfo(114, false, 12, [3, 5, 6, 8], { "hp": 16730, "atk": 1370, "def": 343, "md": 1220, "mr": 318 }),
    new floorInfo(115, true, 3, [9], { "hp": 17030, "atk": 1357, "def": 362, "md": 1164, "mr": 389 }),
    new floorInfo(116, false, 12, [10, 11], { "hp": 17080, "atk": 1321, "def": 321, "md": 1421, "mr": 357 }),
    new floorInfo(117, false, 12, [10, 11], { "hp": 17120, "atk": 1329, "def": 323, "md": 1458, "mr": 362 }),
    new floorInfo(118, false, 12, [10, 11], { "hp": 17160, "atk": 1334, "def": 326, "md": 1487, "mr": 364 }),
    new floorInfo(119, false, 12, [10, 11], { "hp": 17200, "atk": 1342, "def": 330, "md": 1515, "mr": 365 }),
    new floorInfo(120, true, 3, [12], { "hp": 18200, "atk": 1460, "def": 380, "md": 1460, "mr": 380 }),
    new floorInfo(121, false, 12, [10, 11, 13, 15], { "hp": 17500, "atk": 1320, "def": 342, "md": 1562, "mr": 366 }),
    new floorInfo(122, false, 12, [10, 11, 13, 15], { "hp": 17600, "atk": 1338, "def": 346, "md": 1578, "mr": 368 }),
    new floorInfo(123, false, 12, [10, 11, 13, 15], { "hp": 17710, "atk": 1353, "def": 350, "md": 1585, "mr": 369 }),
    new floorInfo(124, false, 12, [10, 11, 13, 15], { "hp": 17780, "atk": 1372, "def": 355, "md": 1608, "mr": 370 }),
    new floorInfo(125, true, 3, [14], { "hp": 16140, "atk": 1700, "def": 367, "md": 1700, "mr": 356, "shield": 2000 }),
    new floorInfo(126, false, 12, [15], { "hp": 17200, "atk": 1487, "def": 320, "md": 1728, "mr": 370 }),
    new floorInfo(127, false, 12, [15], { "hp": 17240, "atk": 1500, "def": 325, "md": 1742, "mr": 371 }),
    new floorInfo(128, false, 12, [15], { "hp": 17300, "atk": 1520, "def": 332, "md": 1764, "mr": 373 }),
    new floorInfo(129, false, 12, [15], { "hp": 17370, "atk": 1541, "def": 340, "md": 1780, "mr": 375 }),
    new floorInfo(130, true, 3, [16], { "hp": 18080, "atk": 1750, "def": 366, "md": 1750, "mr": 337 }),
    new floorInfo(131, false, 12, [17], { "hp": 17880, "atk": 1470, "def": 280, "md": 1800, "mr": 370 }),
    new floorInfo(132, false, 12, [17], { "hp": 17920, "atk": 1498, "def": 291, "md": 1835, "mr": 372 }),
    new floorInfo(133, false, 12, [17], { "hp": 17970, "atk": 1515, "def": 304, "md": 1864, "mr": 373 }),
    new floorInfo(134, false, 12, [17], { "hp": 18040, "atk": 1540, "def": 320, "md": 1883, "mr": 374 }),
    new floorInfo(135, true, 3, [18], { "hp": 18220, "atk": 1919, "def": 363, "md": 1723, "mr": 307 }),
    new floorInfo(136, false, 12, [17, 19], { "hp": 18370, "atk": 1597, "def": 320, "md": 1925, "mr": 375 }),
    new floorInfo(137, false, 12, [17, 19], { "hp": 18410, "atk": 1608, "def": 326, "md": 1947, "mr": 376 }),
    new floorInfo(138, false, 12, [17, 19], { "hp": 18500, "atk": 1613, "def": 329, "md": 1966, "mr": 377 }),
    new floorInfo(139, false, 12, [17, 19], { "hp": 18620, "atk": 1619, "def": 332, "md": 1985, "mr": 378 }),
    new floorInfo(140, true, 3, [20], { "hp": 18260, "atk": 1846, "def": 312, "md": 2043, "mr": 386 }),
    new floorInfo(141, false, 12, [19, 22], { "hp": 18800, "atk": 1876, "def": 425, "md": 1735, "mr": 366, "shield": 1200 }),
    new floorInfo(142, false, 12, [19, 22], { "hp": 19140, "atk": 1886, "def": 426, "md": 1747, "mr": 367, "shield": 1300 }),
    new floorInfo(143, false, 12, [19, 22], { "hp": 19320, "atk": 1899, "def": 429, "md": 1756, "mr": 370, "shield": 1400 }),
    new floorInfo(144, false, 12, [19, 22], { "hp": 19500, "atk": 1910, "def": 430, "md": 1768, "mr": 375, "shield": 1500 }),
    new floorInfo(145, true, 3, [21], { "hp": 18930, "atk": 1924, "def": 324, "md": 2250, "mr": 372 }),
    new floorInfo(146, false, 12, [22, 24], { "hp": 19650, "atk": 1998, "def": 414, "md": 1777, "mr": 366, "shield": 1600 }),
    new floorInfo(147, false, 12, [22, 24], { "hp": 19780, "atk": 2037, "def": 415, "md": 1790, "mr": 370, "shield": 1700 }),
    new floorInfo(148, false, 12, [22, 24], { "hp": 19840, "atk": 2077, "def": 416, "md": 1792, "mr": 371, "shield": 1800 }),
    new floorInfo(149, false, 12, [22, 24], { "hp": 19960, "atk": 2094, "def": 417, "md": 1800, "mr": 374, "shield": 2000 }),
    new floorInfo(150, true, 3, [23], { "hp": 20402, "atk": 2302, "def": 326, "md": 2304, "mr": 364 }),
    new floorInfo(151, false, 12, [24, 26], { "hp": 20500, "atk": 2264, "def": 396, "md": 2016, "mr": 356 }),
    new floorInfo(152, false, 12, [24, 26], { "hp": 20720, "atk": 2289, "def": 400, "md": 2023, "mr": 360 }),
    new floorInfo(153, false, 12, [24, 26], { "hp": 20950, "atk": 2304, "def": 400, "md": 2045, "mr": 369 }),
    new floorInfo(154, false, 12, [24, 26], { "hp": 21000, "atk": 2323, "def": 400, "md": 2064, "mr": 374 }),
    new floorInfo(155, true, 3, [25], { "hp": 19356, "atk": 2438, "def": 324, "md": 2727, "mr": 362 }),
    new floorInfo(156, false, 12, [26], { "hp": 21000, "atk": 2478, "def": 382, "md": 2154, "mr": 326 }),
    new floorInfo(157, false, 12, [26], { "hp": 21230, "atk": 2512, "def": 383, "md": 2174, "mr": 327 }),
    new floorInfo(158, false, 12, [26], { "hp": 21400, "atk": 2537, "def": 386, "md": 2199, "mr": 329 }),
    new floorInfo(159, false, 12, [26], { "hp": 21500, "atk": 2555, "def": 390, "md": 2222, "mr": 336 }),
    new floorInfo(160, true, 3, [27], { "hp": 21700, "atk": 2444, "def": 400, "md": 2236, "mr": 420, "shield": 1240 }),
    new floorInfo(161, false, 12, [28], { "hp": 20780, "atk": 2466, "def": 295, "md": 2720, "mr": 382 }),
    new floorInfo(162, false, 12, [28], { "hp": 20800, "atk": 2486, "def": 300, "md": 2750, "mr": 385 }),
    new floorInfo(163, false, 12, [28], { "hp": 21000, "atk": 2500, "def": 312, "md": 2777, "mr": 388 }),
    new floorInfo(164, false, 12, [28], { "hp": 21160, "atk": 2547, "def": 325, "md": 2800, "mr": 390 }),
    new floorInfo(165, true, 3, [29], { "hp": 20000, "atk": 2720, "def": 354, "md": 3000, "mr": 392 }),
    new floorInfo(166, false, 12, [28, 30], { "hp": 21212, "atk": 2600, "def": 330, "md": 2888, "mr": 390 }),
    new floorInfo(167, false, 12, [28, 30], { "hp": 21250, "atk": 2646, "def": 340, "md": 2920, "mr": 392 }),
    new floorInfo(168, false, 12, [28, 30], { "hp": 21340, "atk": 2700, "def": 350, "md": 2956, "mr": 395 }),
    new floorInfo(169, false, 12, [28, 30], { "hp": 21412, "atk": 2736, "def": 360, "md": 3000, "mr": 400 }),
    new floorInfo(170, true, 3, [31], { "hp": 20000, "atk": 3200, "def": 420, "md": 3000, "mr": 400 }),
    new floorInfo(171, false, 12, [28, 30], { "hp": 21500, "atk": 2800, "def": 365, "md": 3100, "mr": 400 }),
    new floorInfo(172, false, 12, [28, 30], { "hp": 21740, "atk": 2834, "def": 370, "md": 3142, "mr": 402 }),
    new floorInfo(173, false, 12, [28, 30], { "hp": 21820, "atk": 2855, "def": 373, "md": 3177, "mr": 403 }),
    new floorInfo(174, false, 12, [28, 30], { "hp": 22000, "atk": 2900, "def": 375, "md": 3200, "mr": 404 }),
    new floorInfo(175, true, 3, [32], { "hp": 20400, "atk": 2736, "def": 314, "md": 3500, "mr": 420 }),
    new floorInfo(176, false, 12, [33], { "hp": 25000, "atk": 3215, "def": 313, "md": 3027, "mr": 327 }),
    new floorInfo(177, false, 12, [33], { "hp": 25700, "atk": 3220, "def": 315, "md": 3043, "mr": 328 }),
    new floorInfo(178, false, 12, [33], { "hp": 26262, "atk": 3223, "def": 323, "md": 3064, "mr": 333 }),
    new floorInfo(179, false, 12, [33], { "hp": 26666, "atk": 3236, "def": 323, "md": 3080, "mr": 333 }),
    new floorInfo(180, true, 3, [34], { "hp": 30000, "atk": 3800, "def": 86, "md": 3400, "mr": 72 }),
    new floorInfo(181, false, 12, [33, 35, 37], { "hp": 27200, "atk": 3250, "def": 325, "md": 3100, "mr": 342 }),
    new floorInfo(182, false, 12, [33, 35, 37], { "hp": 27700, "atk": 3273, "def": 327, "md": 3123, "mr": 344 }),
    new floorInfo(183, false, 12, [33, 35, 37], { "hp": 28200, "atk": 3300, "def": 330, "md": 3150, "mr": 347 }),
    new floorInfo(184, false, 12, [33, 35, 37], { "hp": 28760, "atk": 3325, "def": 333, "md": 3200, "mr": 350 }),
    new floorInfo(185, true, 3, [36], { "hp": 27440, "atk": 3026, "def": 324, "md": 3427, "mr": 386 }),
    new floorInfo(186, false, 12, [35, 37], { "hp": 29000, "atk": 3367, "def": 356, "md": 3240, "mr": 316 }),
    new floorInfo(187, false, 12, [35, 37], { "hp": 29400, "atk": 3389, "def": 360, "md": 3270, "mr": 320 }),
    new floorInfo(188, false, 12, [35, 37], { "hp": 29780, "atk": 3400, "def": 364, "md": 3288, "mr": 323 }),
    new floorInfo(189, false, 12, [35, 37], { "hp": 30000, "atk": 3412, "def": 367, "md": 3300, "mr": 325 }),
    new floorInfo(190, true, 3, [38], { "hp": 27120, "atk": 3314, "def": 500, "md": 3127, "mr": 500 }),
    new floorInfo(191, true, 3, [39], { "hp": 28390, "atk": 3326, "def": 312, "md": 3607, "mr": 392 }),
    new floorInfo(192, true, 3, [40], { "hp": 28450, "atk": 3671, "def": 397, "md": 3434, "mr": 347 }),
    new floorInfo(193, true, 3, [41], { "hp": 28620, "atk": 3402, "def": 356, "md": 3737, "mr": 400 }),
    new floorInfo(194, true, 3, [42], { "hp": 28000, "atk": 3800, "def": 420, "md": 3800, "mr": 420, "br": 0.25 }),
    new floorInfo(195, true, 3, [43], { "hp": 28440, "atk": 3636, "def": 340, "md": 3912, "mr": 390 }),
    new floorInfo(196, true, 3, [44], { "hp": 29280, "atk": 3758, "def": 362, "md": 3832, "mr": 400 }),
    new floorInfo(197, true, 3, [45], { "hp": 30000, "atk": 3407, "def": 367, "md": 3852, "mr": 392, "cr": 0.25 }),
    new floorInfo(198, true, 3, [46], { "hp": 30800, "atk": 3534, "def": 375, "md": 3927, "mr": 400 }),
    new floorInfo(199, true, 3, [47], { "hp": 33600, "atk": 3578, "def": 322, "md": 3811, "mr": 359 }),
    new floorInfo(200, true, 3, [48], { "hp": 33070, "atk": 3797, "def": 368, "md": 3967, "mr": 406 }),

    // Hardcore 201-300
    new floorInfo(201, false, 15, [0, 1, 2], { "hp": 34000, "atk": 3727, "def": 364, "md": 4000, "mr": 383 }),
    new floorInfo(202, false, 15, [0, 1, 2], { "hp": 34670, "atk": 3783, "def": 366, "md": 4065, "mr": 384 }),
    new floorInfo(203, false, 15, [0, 1, 2, 3], { "hp": 35245, "atk": 3807, "def": 369, "md": 4128, "mr": 386 }),
    new floorInfo(204, false, 15, [0, 1, 2, 3], { "hp": 35985, "atk": 3833, "def": 372, "md": 4167, "mr": 388 }),
    new floorInfo(205, true, 5, [4], { "hp": 36170, "atk": 4313, "def": 384, "md": 3628, "mr": 347, "shield": 3200 }),
    new floorInfo(206, false, 15, [0, 1, 2, 3, 5, 6], { "hp": 36472, "atk": 4373, "def": 373, "md": 3934, "mr": 389 }),
    new floorInfo(207, false, 15, [0, 1, 2, 3, 5, 6], { "hp": 37080, "atk": 4417, "def": 375, "md": 4056, "mr": 390 }),
    new floorInfo(208, false, 15, [0, 1, 2, 3, 5, 6], { "hp": 37864, "atk": 4492, "def": 376, "md": 4134, "mr": 392 }),
    new floorInfo(209, false, 15, [0, 1, 2, 3, 5, 6], { "hp": 38416, "atk": 4573, "def": 379, "md": 4207, "mr": 393 }),
    new floorInfo(210, true, 5, [7], { "hp": 38980, "atk": 4672, "def": 382, "md": 4274, "mr": 363 }),
    new floorInfo(211, false, 15, [3, 5, 6, 8], { "hp": 39393, "atk": 4774, "def": 362, "md": 4584, "mr": 336 }),
    new floorInfo(212, false, 15, [3, 5, 6, 8], { "hp": 40174, "atk": 4866, "def": 363, "md": 4646, "mr": 340 }),
    new floorInfo(213, false, 15, [3, 5, 6, 8], { "hp": 41874, "atk": 4896, "def": 365, "md": 4716, "mr": 350 }),
    new floorInfo(214, false, 15, [3, 5, 6, 8], { "hp": 42474, "atk": 4943, "def": 367, "md": 4765, "mr": 358 }),
    new floorInfo(215, true, 5, [9], { "hp": 42570, "atk": 5000, "def": 366, "md": 4564, "mr": 387 }),
    new floorInfo(216, false, 15, [10, 11], { "hp": 43080, "atk": 4721, "def": 371, "md": 5033, "mr": 397 }),
    new floorInfo(217, false, 15, [10, 11], { "hp": 43880, "atk": 4802, "def": 373, "md": 5092, "mr": 398 }),
    new floorInfo(218, false, 15, [10, 11], { "hp": 44230, "atk": 4884, "def": 375, "md": 5146, "mr": 399 }),
    new floorInfo(219, false, 15, [10, 11], { "hp": 44590, "atk": 4963, "def": 377, "md": 5215, "mr": 400 }),
    new floorInfo(220, true, 5, [12], { "hp": 46120, "atk": 5160, "def": 400, "md": 5160, "mr": 400 }),
    new floorInfo(221, false, 15, [10, 11, 13, 15], { "hp": 46920, "atk": 4923, "def": 360, "md": 5262, "mr": 386 }),
    new floorInfo(222, false, 15, [10, 11, 13, 15], { "hp": 47650, "atk": 5010, "def": 367, "md": 5320, "mr": 388 }),
    new floorInfo(223, false, 15, [10, 11, 13, 15], { "hp": 48000, "atk": 5087, "def": 369, "md": 5396, "mr": 389 }),
    new floorInfo(224, false, 15, [10, 11, 13, 15], { "hp": 48500, "atk": 5146, "def": 370, "md": 5458, "mr": 390 }),
    new floorInfo(225, true, 5, [14], { "hp": 45440, "atk": 5754, "def": 387, "md": 5754, "mr": 387, "shield": 4000 }),
    new floorInfo(226, false, 15, [15], { "hp": 47200, "atk": 5187, "def": 360, "md": 5688, "mr": 390 }),
    new floorInfo(227, false, 15, [15], { "hp": 47640, "atk": 5238, "def": 362, "md": 5731, "mr": 391 }),
    new floorInfo(228, false, 15, [15], { "hp": 47890, "atk": 5304, "def": 366, "md": 5807, "mr": 393 }),
    new floorInfo(229, false, 15, [15], { "hp": 48430, "atk": 5394, "def": 369, "md": 5888, "mr": 395 }),
    new floorInfo(230, true, 5, [16], { "hp": 47880, "atk": 5956, "def": 416, "md": 5956, "mr": 379 }),
    new floorInfo(231, false, 15, [17], { "hp": 48260, "atk": 5400, "def": 316, "md": 6000, "mr": 410 }),
    new floorInfo(232, false, 15, [17], { "hp": 48670, "atk": 5477, "def": 318, "md": 6089, "mr": 411 }),
    new floorInfo(233, false, 15, [17], { "hp": 48999, "atk": 5526, "def": 321, "md": 6154, "mr": 412 }),
    new floorInfo(234, false, 15, [17], { "hp": 49260, "atk": 5613, "def": 325, "md": 6219, "mr": 414 }),
    new floorInfo(235, true, 5, [18], { "hp": 48720, "atk": 6424, "def": 383, "md": 6073, "mr": 402 }),
    new floorInfo(236, false, 15, [17, 19], { "hp": 50000, "atk": 5967, "def": 332, "md": 6395, "mr": 395 }),
    new floorInfo(237, false, 15, [17, 19], { "hp": 50650, "atk": 6047, "def": 336, "md": 6450, "mr": 397 }),
    new floorInfo(238, false, 15, [17, 19], { "hp": 51320, "atk": 6108, "def": 341, "md": 6527, "mr": 400 }),
    new floorInfo(239, false, 15, [17, 19], { "hp": 51620, "atk": 6213, "def": 350, "md": 6604, "mr": 402 }),
    new floorInfo(240, true, 5, [20], { "hp": 50560, "atk": 6246, "def": 337, "md": 6833, "mr": 408 }),
    new floorInfo(241, false, 15, [19, 22], { "hp": 49530, "atk": 6816, "def": 426, "md": 6036, "mr": 386, "shield": 2400 }),
    new floorInfo(242, false, 15, [19, 22], { "hp": 49980, "atk": 6846, "def": 430, "md": 6112, "mr": 387, "shield": 2560 }),
    new floorInfo(243, false, 15, [19, 22], { "hp": 49350, "atk": 6875, "def": 434, "md": 6174, "mr": 391, "shield": 2720 }),
    new floorInfo(244, false, 15, [19, 22], { "hp": 49780, "atk": 6917, "def": 437, "md": 6219, "mr": 395, "shield": 2880 }),
    new floorInfo(245, true, 5, [21], { "hp": 51840, "atk": 6798, "def": 362, "md": 7236, "mr": 402 }),
    new floorInfo(246, false, 15, [22, 24], { "hp": 50240, "atk": 7000, "def": 440, "md": 6300, "mr": 400, "shield": 3000 }),
    new floorInfo(247, false, 15, [22, 24], { "hp": 50796, "atk": 7041, "def": 442, "md": 6366, "mr": 403, "shield": 3200 }),
    new floorInfo(248, false, 15, [22, 24], { "hp": 51224, "atk": 7083, "def": 444, "md": 6404, "mr": 405, "shield": 3400 }),
    new floorInfo(249, false, 15, [22, 24], { "hp": 51830, "atk": 7117, "def": 446, "md": 6470, "mr": 408, "shield": 3600 }),
    new floorInfo(250, true, 5, [23], { "hp": 53860, "atk": 7384, "def": 384, "md": 7512, "mr": 412 }),
    new floorInfo(251, false, 15, [24, 26], { "hp": 54220, "atk": 7309, "def": 448, "md": 7046, "mr": 410 }),
    new floorInfo(252, false, 15, [24, 26], { "hp": 54960, "atk": 7333, "def": 450, "md": 7105, "mr": 413 }),
    new floorInfo(253, false, 15, [24, 26], { "hp": 55610, "atk": 7351, "def": 451, "md": 7155, "mr": 415 }),
    new floorInfo(254, false, 15, [24, 26], { "hp": 56180, "atk": 7370, "def": 452, "md": 7187, "mr": 418 }),
    new floorInfo(255, true, 5, [25], { "hp": 55780, "atk": 7333, "def": 392, "md": 7777, "mr": 420 }),
    new floorInfo(256, false, 15, [26], { "hp": 57140, "atk": 7470, "def": 453, "md": 7199, "mr": 420 }),
    new floorInfo(257, false, 15, [26], { "hp": 57770, "atk": 7493, "def": 454, "md": 7223, "mr": 422 }),
    new floorInfo(258, false, 15, [26], { "hp": 58220, "atk": 7510, "def": 455, "md": 7275, "mr": 424 }),
    new floorInfo(259, false, 15, [26], { "hp": 58790, "atk": 7532, "def": 456, "md": 7302, "mr": 425 }),
    new floorInfo(260, true, 5, [27], { "hp": 57020, "atk": 7544, "def": 436, "md": 7236, "mr": 464, "shield": 4000 }),
    new floorInfo(261, false, 15, [28], { "hp": 60610, "atk": 7383, "def": 376, "md": 7902, "mr": 396 }),
    new floorInfo(262, false, 15, [28], { "hp": 61110, "atk": 7417, "def": 380, "md": 7972, "mr": 398 }),
    new floorInfo(263, false, 15, [28], { "hp": 61720, "atk": 7453, "def": 383, "md": 8021, "mr": 399 }),
    new floorInfo(264, false, 15, [28], { "hp": 62226, "atk": 7495, "def": 385, "md": 8083, "mr": 400 }),
    new floorInfo(265, true, 5, [29], { "hp": 63330, "atk": 7753, "def": 364, "md": 8000, "mr": 406 }),
    new floorInfo(266, false, 15, [28, 30], { "hp": 63780, "atk": 7545, "def": 386, "md": 8133, "mr": 402 }),
    new floorInfo(267, false, 15, [28, 30], { "hp": 64250, "atk": 7586, "def": 388, "md": 8171, "mr": 403 }),
    new floorInfo(268, false, 15, [28, 30], { "hp": 64810, "atk": 7633, "def": 390, "md": 8219, "mr": 404 }),
    new floorInfo(269, false, 15, [28, 30], { "hp": 65270, "atk": 7680, "def": 392, "md": 8257, "mr": 406 }),
    new floorInfo(270, true, 5, [31], { "hp": 64700, "atk": 8376, "def": 450, "md": 7947, "mr": 430 }),
    new floorInfo(271, false, 15, [28, 30], { "hp": 65860, "atk": 8146, "def": 395, "md": 8532, "mr": 422 }),
    new floorInfo(272, false, 15, [28, 30], { "hp": 66140, "atk": 8205, "def": 396, "md": 8577, "mr": 424 }),
    new floorInfo(273, false, 15, [28, 30], { "hp": 66666, "atk": 8228, "def": 400, "md": 8600, "mr": 424 }),
    new floorInfo(274, false, 15, [28, 30], { "hp": 67070, "atk": 8289, "def": 403, "md": 8640, "mr": 427 }),
    new floorInfo(275, true, 5, [32], { "hp": 66666, "atk": 7777, "def": 333, "md": 8888, "mr": 444 }),
    new floorInfo(276, false, 15, [33], { "hp": 67680, "atk": 9100, "def": 382, "md": 8484, "mr": 407 }),
    new floorInfo(277, false, 15, [33], { "hp": 68240, "atk": 9133, "def": 385, "md": 8533, "mr": 409 }),
    new floorInfo(278, false, 15, [33], { "hp": 68740, "atk": 9153, "def": 387, "md": 8592, "mr": 410 }),
    new floorInfo(279, false, 15, [33], { "hp": 69000, "atk": 9186, "def": 390, "md": 8631, "mr": 411 }),
    new floorInfo(280, true, 5, [34], { "hp": 72000, "atk": 12000, "def": 125, "md": 11000, "mr": 125 }),
    new floorInfo(281, false, 15, [33, 35, 37], { "hp": 69420, "atk": 9240, "def": 393, "md": 8821, "mr": 414 }),
    new floorInfo(282, false, 15, [33, 35, 37], { "hp": 69790, "atk": 9273, "def": 395, "md": 8877, "mr": 415 }),
    new floorInfo(283, false, 15, [33, 35, 37], { "hp": 70120, "atk": 9304, "def": 397, "md": 8919, "mr": 416 }),
    new floorInfo(284, false, 15, [33, 35, 37], { "hp": 70630, "atk": 9333, "def": 400, "md": 8960, "mr": 418 }),
    new floorInfo(285, true, 5, [36], { "hp": 69420, "atk": 8536, "def": 384, "md": 9687, "mr": 402 }),
    new floorInfo(286, false, 15, [35, 37], { "hp": 71250, "atk": 9379, "def": 400, "md": 9000, "mr": 420 }),
    new floorInfo(287, false, 15, [35, 37], { "hp": 71717, "atk": 9404, "def": 401, "md": 9048, "mr": 422 }),
    new floorInfo(288, false, 15, [35, 37], { "hp": 72400, "atk": 9433, "def": 403, "md": 9077, "mr": 424 }),
    new floorInfo(289, false, 15, [35, 37], { "hp": 73000, "atk": 9461, "def": 404, "md": 9114, "mr": 425 }),
    new floorInfo(290, true, 5, [38], { "hp": 60120, "atk": 8000, "def": 800, "md": 7465, "mr": 800 }),
    new floorInfo(291, true, 5, [39], { "hp": 74380, "atk": 8888, "def": 385, "md": 9999, "mr": 412 }),
    new floorInfo(292, true, 5, [40], { "hp": 74840, "atk": 10627, "def": 421, "md": 9527, "mr": 397 }),
    new floorInfo(293, true, 5, [41], { "hp": 75620, "atk": 10402, "def": 386, "md": 11329, "mr": 420 }),
    new floorInfo(294, true, 5, [42], { "hp": 72000, "atk": 12000, "def": 420, "md": 12000, "mr": 420, "br": 0.25 }),
    new floorInfo(295, true, 5, [43], { "hp": 74280, "atk": 11636, "def": 364, "md": 12812, "mr": 400 }),
    new floorInfo(296, true, 5, [44], { "hp": 78280, "atk": 12958, "def": 396, "md": 13612, "mr": 423 }),
    new floorInfo(297, true, 5, [45], { "hp": 80760, "atk": 13407, "def": 347, "md": 14352, "mr": 362, "cr": 0.25 }),
    new floorInfo(298, true, 5, [46], { "hp": 80808, "atk": 14000, "def": 420, "md": 15000, "mr": 460 }),
    new floorInfo(299, true, 5, [47], { "hp": 88470, "atk": 14578, "def": 367, "md": 15205, "mr": 424 }),
    new floorInfo(300, true, 5, [48], { "hp": 99999, "atk": 18250, "def": 464, "md": 19999, "mr": 518 }),
];

// Loot Drops
for (const enemy of enemies) {
    if (!enemy.loot.length) console.log(enemy.id + ") " + enemy.name);
};

// Floor EP's
// function cat1(num) {
//     if (num > 1) return 1;
//     if (num < 0) return 0;
//     return num;
// };

// function getEP(id, hp, atk, def, md=atk, mr=def, cd=1.25, cr=0.18, dodge=0.1) {
//     return Math.floor(((1/(1-dodge))*(hp/Math.pow(0.99895,Math.max(def, mr))) / (200/(Math.max(atk, md)*(1+(cat1(cr)*(cd-1))))))*100) / 100;
// };

// for (const floor of floors) {
//     if (!floor.floor) continue;
//     const fl = floor.stats(floor.monster);
//     if (fl.hp > 180) console.log(getEP(0, fl.hp, fl.atk, fl.def, fl.md, fl.mr, fl.cd, fl.cr, fl.dodge))
// };
