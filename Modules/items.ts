import { Buffs, IbuffInfo, ItemAbility, ItemCategory, ItemRarity, ItemType, PrimaryStat } from "../types";
import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import buffInfo from "./buffs";
import delayedBuffs from "./delayedBuffs";
import { dealDamage, addHeal } from "./functions";

export class itemInfo {
    private _name: string;
    private _category: ItemCategory;
    private _type: ItemType;
    private _obtain: string[];
    private _emoji: `<:${string}:${number}>`;
    private _image: `https://${string}`;
    private _grade: ItemRarity;
    private _id: number;
    private _unique: boolean;
    private _tradable: boolean;
    private _sellable: boolean;
    private _desc: string;
    private _flair: string;

    constructor(name: string, category: ItemCategory, type: ItemType, obtain: string[], emoji: `<:${string}:${number}>`, image: `https://${string}`, grade: ItemRarity, id: number, unique: boolean, tradable: boolean, sellable: boolean, desc: string = "", flair: string = "") {
        this._name = name;
        this._category = category; // ["weapon", "armor", "fish"]
        this._type = type; // ["sword", ..., "helmet", ..., "fish"]
        this._obtain = obtain; // ["fishing", "trading", "shop", "dungeon", "tutorial", "crafting", "chest", "raid"]
        this._emoji = emoji;
        this._image = image;
        this._grade = grade;
        this._id = id;
        this._unique = unique;
        this._tradable = tradable;
        this._sellable = sellable;
        this._desc = desc;
        this._flair = flair;
    };

    get name() {
        return this._name;
    };
    get category() { // weapon, armor, fish...
        return this._category;
    };
    get type() { // sword, bow, staff...
        return this._type;
    };
    get obtain() { // fishing, alchemy, shop...
        return this._obtain;
    };
    get emoji() {
        return this._emoji;
    };
    get image() {
        return this._image;
    };
    get grade() { // Grades: {1: normal, 2: special, 3: rare, 4: unique, 5: legendary, 6: mythical, 7: genesis}
        return this._grade;
    };
    get gradeValue() { // Grades: {1: normal, 2: special, 3: rare, 4: unique, 5: legendary, 6: mythical, 7: genesis}
        return { "normal": 0, "special": 1, "rare": 2, "unique": 3, "legendary": 4, "mythical": 5, "genesis": 6 }[this._grade];
    };
    get id() {
        return this._id;
    };
    get unique() { // true | false
        return this._unique;
    };
    get tradable() { // true | false
        return this._tradable;
    };
    get sellable() { // true | false
        return this._sellable;
    };
    get desc() {
        return this._desc;
    };
    get flair() {
        return this._flair;
    };
    get bar() {
        switch (this._grade) {
            case "normal": return "<:barn:994957076264661073>";
            case "special": return "<:bars:994957077787197450>";
            case "rare": return "<:barr:994957080073076867>";
            case "unique": return "<:baru:994958335558303744>";
            case "legendary": return "<:barl:994958337449938954>";
            case "mythical": return "<:barm:994958339278647346>";
            case "genesis": return "<:barg:994958341128339536>";
            default: return "<:blank:917804200363171860>";
        };
    };
    get gradeEmote() {
        switch (this._grade) {
            case "normal": return "<:normal1:1041732429397889054><:normal2:1041732425379762268><:normal3:1041732422145953892><:normal4:1041732419591622686>";
            case "special": return "<:special1:1041731419963150397><:special2:1041731418008600717><:special3:1041731415919833149><:special4:1041731414032392202>";
            case "rare": return "<:rare1:1041731092031492106><:rare2:1041731088357281802><:rare3:1041731083965825096>";
            case "unique": return "<:unique1:1041730066272493578><:unique2:1041730063940468828><:unique3:1041730061163831437><:unique4:1041730057380573386>";
            case "legendary": return "<:legendary1:1041726519082491964><:legendary2:1041726517153112094><:legendary3:1041726515475382322><:legendary4:1041726512992366605>";
            case "mythical": return "<:mythical1:1041726768530329690><:mythical2:1041726767188168724><:mythical3:1041726765577556039><:mythical4:1041726763862065162>";
            case "genesis": return "<:genesis1:1041725784546619502><:genesis2:1041725782176825485><:genesis3:1041725778611675237><:genesis4:1041725780218093629>";
            default: return "undefined";
        };
    };
};

export class fishInfo extends itemInfo {
    private _consumable: boolean;

    constructor(name: string, category: ItemCategory, type: ItemType, obtain: string[], consumable: boolean, emoji: `<:${string}:${number}>`, image: `https://${string}`, grade: ItemRarity, id: number, unique: boolean = false, tradable: boolean = true, sellable: boolean = true) {
        super(name, category, type, obtain, emoji, image, grade, id, unique, tradable, sellable);
        this._consumable = consumable;
    };

    get consumable() {
        return this._consumable;
    };
};

export class lootInfo extends itemInfo {
    constructor(name: string, category: ItemCategory, type: ItemType, obtain: string[], emoji: `<:${string}:${number}>`, image: `https://${string}`, grade: ItemRarity, id: number, unique: boolean = false, tradable: boolean = true, sellable: boolean = false, desc: string = "", flair: string = "") {
        super(name, category, type, obtain, emoji, image, grade, id, unique, tradable, sellable, desc, flair);
    };
};

export class weaponInfo extends itemInfo {
    private _primaryStat: PrimaryStat;
    private _psmin: number;
    private _psmax: number;
    private _secondaryStat: PrimaryStat;
    private _ssmin: number;
    private _ssmax: number;
    private _buff: ItemAbility;
    private _buffdesc: string;

    constructor(name: string, category: ItemCategory, type: ItemType, obtain: string[], emoji: `<:${string}:${number}>`, image: `https://${string}`, primaryStat: PrimaryStat, psmin: number, psmax: number, secondaryStat: PrimaryStat, ssmin: number, ssmax: number, buff: ItemAbility, buffdesc: string, flair: string, grade: ItemRarity, id: number, desc: string = "", unique: boolean = true, tradable: boolean = false, sellable: boolean = true) {
        super(name, category, type, obtain, emoji, image, grade, id, unique, tradable, sellable, desc, flair);
        this._primaryStat = primaryStat;
        this._psmin = psmin;
        this._psmax = psmax;
        this._secondaryStat = secondaryStat;
        this._ssmin = ssmin;
        this._ssmax = ssmax;
        this._buff = buff;
        this._buffdesc = buffdesc;
    };

    get primaryStat() {
        return this._primaryStat;
    };
    get psmin() {
        return this._psmin;
    };
    get psmax() {
        return this._psmax;
    };
    get secondaryStat() {
        return this._secondaryStat;
    };
    get ssmin() {
        if (["atk%", "md%", "cr", "cd", "dodge", "br"].includes(this._secondaryStat)) return Math.round(this._ssmin * 100) + "%";
        return this._ssmin + "";
    };
    get ssmax() {
        if (["atk%", "md%", "cr", "cd", "dodge", "br"].includes(this._secondaryStat)) return Math.round(this._ssmax * 100) + "%";
        return this._ssmax + "";
    };
    get buff() {
        return this._buff;
    };
    get buffdesc() {
        return this._buffdesc;
    };
};

export class chestInfo extends itemInfo {
    private _emoji2: `<:${string}:${number}>`;
    private _image2: `https://${string}`;
    private _drops: number;
    private _droprates: { [key in ItemRarity]?: number };

    constructor(name: string, category: ItemCategory, type: ItemType, obtain: string[], emoji: `<:${string}:${number}>`, emoji2: `<:${string}:${number}>`, image: `https://${string}`, image2: `https://${string}`, drops: number, droprates: { [key in ItemRarity]?: number; }, grade: ItemRarity, id: number, unique: boolean = false, tradable: boolean = false, sellable: boolean = false, desc: string = "", flair: string = "") {
        super(name, category, type, obtain, emoji, image, grade, id, unique, tradable, sellable, desc, flair);
        this._emoji2 = emoji2;
        this._image2 = image2;
        this._drops = drops;
        this._droprates = droprates;
    };

    get emoji2() {
        return this._emoji2;
    };
    get image2() {
        return this._image2;
    };
    get drops() {
        return this._drops;
    };
    get droprates() {
        return this._droprates;
    };

    get dropratesFull() {
        return {
            genesis: this._droprates.genesis ?? 0,
            mythical: this._droprates.mythical ?? 0,
            legendary: this._droprates.legendary ?? 0,
            unique: this._droprates.unique ?? 0,
            rare: this._droprates.rare ?? 0,
            special: this._droprates.special ?? 0,
            normal: this._droprates.normal ?? 0
        };
    };
};

export class armorInfo extends itemInfo {
    private _setname: string;
    private _primaryStat: PrimaryStat;
    private _psmin: number;
    private _psmax: number;
    private _buff: ItemAbility | undefined;
    private _buffdesc: string | undefined;

    constructor(name: string, category: ItemCategory, type: ItemType, setname: string, obtain: string[], emoji: `<:${string}:${number}>`, image: `https://${string}`, primaryStat: PrimaryStat, psmin: number, psmax: number, grade: ItemRarity, id: number, buff: ItemAbility | undefined = undefined, buffdesc: string | undefined = undefined, desc: string = "", unique: boolean = true, tradable: boolean = false, sellable: boolean = true) {
        super(name, category, type, obtain, emoji, image, grade, id, unique, tradable, sellable, desc);
        this._setname = setname;
        this._primaryStat = primaryStat;
        this._psmin = psmin;
        this._psmax = psmax;
        this._buff = buff;
        this._buffdesc = buffdesc;
    };

    get setname() {
        return this._setname;
    };
    get primaryStat() {
        return this._primaryStat;
    };
    get psmin() {
        return this._psmin;
    };
    get psmax() {
        return this._psmax;
    };
    get buff() {
        return this._buff;
    };
    get buffdesc() {
        return this._buffdesc;
    };
};

export class ringInfo extends itemInfo {
    private _maxlevel: number;
    private _buffs: (level: number) => ItemAbility;
    private _buffdescs: (level: number) => string;

    constructor(name: string, category: ItemCategory, type: ItemType, obtain: string[], emoji: `<:${string}:${number}>`, image: `https://${string}`, maxlevel: number, buffs: (level: number) => ItemAbility, buffdescs: (level: number) => string, flair: string, grade: ItemRarity, id: number, desc: string = "", unique: boolean = true, tradable: boolean = false, sellable: boolean = true) {
        super(name, category, type, obtain, emoji, image, grade, id, unique, tradable, sellable, desc, flair);
        this._maxlevel = maxlevel;
        this._buffs = buffs;
        this._buffdescs = buffdescs;
    };

    get maxlevel() {
        return this._maxlevel;
    };
    get buffs() {
        return this._buffs;
    };
    get buffdescs() {
        return this._buffdescs;
    };

    getBuff(level: number) {
        level = Math.min(Math.max(level, 1), this.maxlevel) || 1;
        return this.buffs(level);
    };
    getBuffDesc(level: number) {
        level = Math.min(Math.max(level, 1), this.maxlevel) || 1;
        return this.buffdescs(level);
    };
};

export const items = [
    // Fish
    new fishInfo("Carp", "fish", "fish", ["fishing"], true, "<:carp:1028307600128872468>", "https://i.ibb.co/ZB9chS1/c.png", "normal", 0),
    new fishInfo("Seabass", "fish", "fish", ["fishing"], true, "<:seabass:1028313283259797584>", "https://i.ibb.co/Kby5P5F/s.png", "normal", 1),
    new fishInfo("Herring", "fish", "fish", ["fishing"], true, "<:herring:1028313329065803786>", "https://i.ibb.co/HzG09pp/h.png", "normal", 2),
    new fishInfo("Goldfish", "fish", "fish", ["fishing"], true, "<:goldfish:1028313315526586419>", "https://i.ibb.co/2PH8Sjj/g.png", "normal", 3),
    new fishInfo("Crab", "fish", "fish", ["fishing"], true, "<:crab:1028313317153972324>", "https://i.ibb.co/nsc9kb6/c.png", "normal", 4),
    new fishInfo("Red Snapper", "fish", "fish", ["fishing"], true, "<:red_snapper:1028313320429715506>", "https://i.ibb.co/1J1cqLk/s.png", "normal", 5),
    new fishInfo("Trout", "fish", "fish", ["fishing"], true, "<:trout:1028313321809653771>", "https://i.ibb.co/R7KPR1v/t.png", "normal", 6),
    new fishInfo("Flounder", "fish", "fish", ["fishing"], true, "<:flounder:1028313389635747891>", "https://i.ibb.co/sRYVL0t/f.png", "normal", 7),
    new fishInfo("Pike", "fish", "fish", ["fishing"], true, "<:pike:1028313391900667925>", "https://i.ibb.co/BKXcyMG/p.png", "normal", 8),
    new fishInfo("Eel", "fish", "fish", ["fishing"], true, "<:eel:1028313323269275698>", "https://i.ibb.co/zN32WqG/e.png", "normal", 9),
    new fishInfo("Frog", "fish", "fish", ["fishing"], true, "<:frog:994965841206583446>", "https://i.ibb.co/mq3Kfng/f.png", "normal", 10),
    new fishInfo("Catfish", "fish", "fish", ["fishing"], true, "<:catfish:1028316540690518116>", "https://i.ibb.co/8z9yz6v/c.png", "special", 11),
    new fishInfo("Bass", "fish", "fish", ["fishing"], true, "<:bass:1028316542695383071>", "https://i.ibb.co/DzFnVNW/b.png", "special", 12),
    new fishInfo("Lobster", "fish", "fish", ["fishing"], true, "<:lobster:1028316544930938960>", "https://i.ibb.co/v17WJBG/l.png", "special", 13),
    new fishInfo("Mullet", "fish", "fish", ["fishing"], true, "<:mullet:1028316547288141985>", "https://i.ibb.co/PFs99kW/m.png", "special", 14),
    new fishInfo("Asagi", "fish", "fish", ["fishing"], true, "<:asagi:1028316548902948906>", "https://i.ibb.co/6mM4f2H/a.png", "special", 15),
    new fishInfo("Nautilus", "fish", "fish", ["fishing"], true, "<:nautilus:1028316550253531147>", "https://i.ibb.co/XspXTLS/n.png", "special", 16),
    new fishInfo("Shrimp", "fish", "fish", ["fishing"], true, "<:shrimp:1028316530355753000>", "https://i.ibb.co/tqCxSCf/s.png", "special", 17),
    new fishInfo("Squid", "fish", "fish", ["fishing"], true, "<:squid:1028316532935237696>", "https://i.ibb.co/10XyvZ3/s.png", "special", 18),
    new fishInfo("Tuna", "fish", "fish", ["fishing"], true, "<:tuna:1028316535527321670>", "https://i.ibb.co/yQ6ww8c/t.png", "special", 19),
    new fishInfo("Acara", "fish", "fish", ["fishing"], true, "<:acara:1028316537733521418>", "https://i.ibb.co/f00SrBw/a.png", "special", 20),
    new fishInfo("Starfish", "fish", "fish", ["fishing"], true, "<:starfish:1028316539193139230>", "https://i.ibb.co/rd4wYqs/s.png", "special", 21),
    new fishInfo("Perch", "fish", "fish", ["fishing"], true, "<:perch:1028319254338088970>", "https://i.ibb.co/tcSkVwN/p.png", "rare", 22),
    new fishInfo("Crappie", "fish", "fish", ["fishing"], true, "<:crappie:1028319257135697960>", "https://i.ibb.co/71mT8YF/c.png", "rare", 23),
    new fishInfo("Dentex", "fish", "fish", ["fishing"], true, "<:dentex:1028319259169923084>", "https://i.ibb.co/Thp7Z6s/d.png", "rare", 24),
    new fishInfo("Octopus", "fish", "fish", ["fishing"], true, "<:octopus:1028319260734398496>", "https://i.ibb.co/yWGF7jW/o.png", "rare", 25),
    new fishInfo("Bluegill", "fish", "fish", ["fishing"], true, "<:bluegill:1028319262353395834>", "https://i.ibb.co/c8fwVX1/b.png", "rare", 26),
    new fishInfo("Marlin", "fish", "fish", ["fishing"], true, "<:marlin:1028319263808819200>", "https://i.ibb.co/WF0NwJS/m.png", "rare", 27),
    new fishInfo("Hatchetfish", "fish", "fish", ["fishing"], true, "<:hatchetfish:1028319251183964280>", "https://i.ibb.co/1RrwMYW/h.png", "rare", 28),
    new fishInfo("Betta", "fish", "fish", ["fishing"], true, "<:betta:1028321506020818944>", "https://i.ibb.co/KVzvDQF/b.png", "unique", 29),
    new fishInfo("Whale", "fish", "fish", ["fishing"], true, "<:whale:1028321508034105414>", "https://i.ibb.co/VMSbVCv/w.png", "unique", 30),
    new fishInfo("Sakana", "fish", "fish", ["fishing"], true, "<:sakana:1028321509745365032>", "https://i.ibb.co/LzYd7Qw/s.png", "unique", 31),
    new fishInfo("Koi", "fish", "fish", ["fishing"], true, "<:koi:1028321534839898125>", "https://i.ibb.co/PC63Mt4/k.png", "legendary", 32),

    // Loot - Crafting Material
    new lootInfo("Bronze", "loot", "crafting material", ["dungeon"], "<:bronze:1033057368013033502>", "https://i.imgur.com/WO8Fbk6.png", "normal", 33),
    new lootInfo("Iron", "loot", "crafting material", ["dungeon"], "<:iron:1033037750821212232>", "https://i.imgur.com/wmyUTb4.png", "special", 34),
    new lootInfo("Gold", "loot", "crafting material", ["dungeon"], "<:gold:1033037775001370654>", "https://i.imgur.com/tPZGari.png", "rare", 35),
    new lootInfo("Mithril", "loot", "crafting material", ["dungeon"], "<:mithril:1033037877111693414>", "https://i.imgur.com/2On6TTD.png", "unique", 36),
    new lootInfo("Orichalcum", "loot", "crafting material", ["dungeon"], "<:orichalcum:1033037866873409586>", "https://i.imgur.com/a7Sz5T3.png", "legendary", 37),
    new lootInfo("Adamantite", "loot", "crafting material", ["dungeon"], "<:adamantite:1033052818082369556>", "https://i.imgur.com/Rp7X5aI.png", "mythical", 38),
    new lootInfo("Scarletite", "loot", "crafting material", ["dungeon"], "<:scarletite:1033054271731675256>", "https://i.imgur.com/V2PMvie.png", "genesis", 39),

    // Loot - Ascension Material
    new lootInfo("Slime Concentrate", "loot", "ascension material", ["dungeon", "floors 1-4, 6-9, 94"], "<:slime_concentrate:1046083943428001964>", "https://i.imgur.com/mh26gVo.png", "normal", 40),
    new lootInfo("Bones", "loot", "ascension material", ["dungeon", "floors 1-9, 11-14, 61-64, 66-69, 71-75, 81-84, 86-89"], "<:bones:1046084545969139752>", "https://i.imgur.com/qoBPImH.png", "normal", 41),
    new lootInfo("Wolf Teeth", "loot", "ascension material", ["dungeon", "floors 1-4, 6-9, 11-15"], "<:wolf_teeth:1046085926360719490>", "https://i.imgur.com/nB4YLLC.png", "normal", 42),
    new lootInfo("Goblin Mask", "loot", "ascension material", ["dungeon", "floors 3-4, 6-9, 11-14"], "<:goblin_mask:1046080758466490398>", "https://i.imgur.com/6EYBRsV.png", "normal", 43),
    new lootInfo("Silver Plume", "loot", "ascension material", ["dungeon", "floors 16-19, 21-24"], "<:silver_plume:1046087833640775710>", "https://i.imgur.com/dyhdOGJ.png", "normal", 44),
    new lootInfo("Lizard Tail", "loot", "ascension material", ["dungeon", "floors 16-19, 21-24"], "<:lizard_tail:1046088687508783124>", "https://i.imgur.com/ZxbwMrm.png", "normal", 45),
    new lootInfo("Orc Leather", "loot", "ascension material", ["dungeon", "floor 20"], "<:orc_leather:1046091137758281908>", "https://i.imgur.com/jiJalaZ.png", "normal", 46),
    new lootInfo("Monster Egg", "loot", "ascension material", ["dungeon", "floors 21-24"], "<:monster_egg:1046092022806749294>", "https://i.imgur.com/oGJ3zKS.png", "normal", 47),
    new lootInfo("Eternal Flame", "loot", "ascension material", ["dungeon", "floors 51-54, 56-59, 96, 100"], "<:eternal_flame:1046093580944556084>", "https://i.imgur.com/3rCbJBx.png", "normal", 48),
    new lootInfo("Frost Crystal", "loot", "ascension material", ["dungeon", "floors 46-49, 51-54, 60, 98"], "<:frost_crystal:1046096633466716240>", "https://i.imgur.com/KYJIahq.png", "normal", 49),

    // Loot - Levelup Material
    new lootInfo("Common Weapon Scroll", "loot", "levelup material", ["dungeon"], "<:common_weapon_levelup_material:1047535549814165535>", "https://i.imgur.com/cK04sDf.png", "normal", 50),
    new lootInfo("Common Armor Scroll", "loot", "levelup material", ["dungeon"], "<:common_armor_levelup_material:1047535557204508803>", "https://i.imgur.com/m7bPNcF.png", "normal", 51),
    new lootInfo("Rare Weapon Scroll", "loot", "levelup material", ["dungeon"], "<:rare_weapon_levelup_material:1047535563525328946>", "https://i.imgur.com/WIAHYw3.png", "rare", 52),
    new lootInfo("Rare Armor Scroll", "loot", "levelup material", ["dungeon"], "<:rare_armor_levelup_material:1047535578855522444>", "https://i.imgur.com/2HyDGTE.png", "rare", 53),
    new lootInfo("Mythical Weapon Scroll", "loot", "levelup material", ["dungeon"], "<:mythical_weapon_levelup_material:1047535585117618196>", "https://i.imgur.com/c10v3dU.png", "mythical", 54),
    new lootInfo("Mythical Armor Scroll", "loot", "levelup material", ["dungeon"], "<:mythical_armor_levelup_material:1047535597180432485>", "https://i.imgur.com/mmmmdho.png", "mythical", 55),
    new lootInfo("Divine Weapon Scroll", "loot", "levelup material", ["dungeon"], "<:divine_weapon_levelup_material:1047535604403015700>", "https://i.imgur.com/saPfna0.png", "genesis", 56),
    new lootInfo("Divine Armor Scroll", "loot", "levelup material", ["dungeon"], "<:divine_armor_levelup_material:1047535613487890483>", "https://i.imgur.com/kBuZZv2.png", "genesis", 57),

    // Weapons - Beginner
    new weaponInfo("Apprentice's Sword", "weapon", "sword", ["tutorial", "crafting", "chest"], "<:apprentices_sword:1047918897573142619>", "https://i.ibb.co/Qd6bNrC/Apprentices-Sword.png", "atk", 7, 200, "atk%", 0.02, 0.12, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "Crafted from plain wood, the Apprentice's Sword is a simple weapon for any aspiring hero. Though its edge may be dull and its weight unbalanced, it is a necessary tool for learning the fundamentals of combat. And as the wielder gains experience and skill, they may one day move on to a more capable sword, leaving the Apprentice's Sword behind as a symbol of their early training.", "normal", 58),
    new weaponInfo("Apprentice's Staff", "weapon", "staff", ["tutorial", "crafting", "chest"], "<:apprentices_staff:1047983016577876159>", "https://i.ibb.co/TtBsL3R/Apprentices-Staff.png", "md", 7, 200, "md%", 0.02, 0.12, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "Carved from a single piece of wood and imbued with the power of magic, the Apprentice's Staff is a versatile weapon for any beginner hero. Though its power may be limited compared to more advanced staffs, it is a valuable tool for learning the basics of magic and combat. And as the wielder grows in skill and knowledge, they may upgrade to a more powerful staff, but the Apprentice's Staff will always hold a special place in their journey as a first step on the path to mastery.", "normal", 59),
    new weaponInfo("Apprentice's Axe", "weapon", "axe", ["tutorial", "crafting", "chest"], "<:apprentices_axe:1047986461582045305>", "https://i.ibb.co/MMRwNVq/Apprentices-Axe.png", "atk", 8, 210, "atk", 3, 56, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "Crafted from plain wood, the Apprentice's Sword is a simple weapon for any aspiring hero. Though its edge may be dull and its weight unbalanced, it is a necessary tool for learning the fundamentals of combat. And as the wielder gains experience and skill, they may one day move on to a more capable sword, leaving the Apprentice's Sword behind as a symbol of their early training.", "normal", 60),
    new weaponInfo("Apprentice's Bow", "weapon", "bow", ["tutorial", "crafting", "chest"], "<:apprentices_bow:1047988813542207588>", "https://i.ibb.co/MZYxwCy/Apprentices-Bow.png", "atk", 7, 190, "cr", 0.03, 0.13, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "Carved from a single piece of wood and strung with strings salvaged from a nearby forest, the Apprentice's Bow is a modest weapon for any budding hero. Though its range and power may not be great, it is strong enough to launch arrows with precision and accuracy. And as the wielder grows in skill and strength, they may upgrade to a more powerful bow, but the Apprentice's Bow will always hold a special place in their heart as a reminder of their humble beginnings.", "normal", 61),
    new weaponInfo("Apprentice's Lance", "weapon", "lance", ["tutorial", "crafting", "chest"], "<:apprentices_lance:1047993345487671296>", "https://i.ibb.co/Js8VwLp/Apprentices-Lance.png", "atk", 7, 200, "md", 4, 68, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "Crafted from the simplest of materials, the Apprentice's Lance is a humble weapon for any aspiring hero. Though its tip may be dull and its shaft unbalanced, it is a necessary tool for learning the basics of combat. And as the wielder grows in skill and strength, they may graduate to a more formidable lance, leaving the Apprentice's Lance behind as a reminder of their humble beginnings.", "normal", 62),
    new weaponInfo("Apprentice's Dagger", "weapon", "dagger", ["tutorial", "crafting", "chest"], "<:apprentices_dagger:1050079167988903967>", "https://i.ibb.co/6F5ZhwJ/Apprentice-s-Dagger.png", "atk", 7, 200, "cd", 0.04, 0.2, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "Forged from old wood and brittle stones, the Apprentice's Dagger is a weapon fit for an up-and-coming hero. Though its blade may not be sharp and its handle may be rough, it is a valuable tool for learning the basics of combat. And as the wielder grows in skill and strength, they may graduate to a more formidable dagger, leaving the Apprentice's Dagger behind as a reminder of their early days.", "normal", 63),
    new weaponInfo("Apprentice's Shield", "weapon", "shield", ["tutorial", "crafting", "chest"], "<:apprentices_shield:1047999616328671242>", "https://i.ibb.co/vqY21kt/Apprentices-Shield.png", "shield", 18, 317, "hp", 12, 135, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "Formed from single piece of wood, the Apprentice's Shield provides basic defense for any fledgling hero. Though its size may be small and its protection limited, it may safe the precious for another day. And as the wielder gains experience and skill, they may graduate to a more formidable shield, leaving the Apprentice's Shield behind.", "normal", 64),

    // Weapons - Special Sword
    new weaponInfo("Arondite", "weapon", "sword", ["crafting", "chest"], "<:arondite:1059125083693662228>", "https://i.imgur.com/x4pX92d.png", "atk", 11, 256, "atk%", 0.03, 0.14, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "The Arondite sword gleams in the light, its pristine edges sharp enough to slice through even the toughest of armor. Forged by the finest blacksmiths in the land, this weapon is a true masterpiece of craftsmanship. Those who wield the Arondite sword are known for their skill and precision, striking fear into the hearts of their enemies. Its power is unmatched, and it is a symbol of fear and strength to all who behold it.", "special", 65),
    new weaponInfo("Bronze Sword", "weapon", "sword", ["crafting", "chest"], "<:bronze_sword:1059125085694349322>", "https://i.imgur.com/Qh3D6kR.png", "atk", 9, 268, "md", 6, 85, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "The Bronze Sword is a trusty weapon, with a blade crafted from solid bronze. It may not be the sharpest sword in the armory, but it is strong and reliable. Its simple design makes it suitable for any adventurer, from a seasoned warrior to a budding hero. Though it may not possess the ornate embellishments of other swords, the Bronze Sword more than makes up for it with its sturdy construction and versatility in battle.", "special", 66),
    new weaponInfo("Faded Glory", "weapon", "sword", ["crafting", "chest"], "<:faded_glory:1059125088387088414>", "https://i.imgur.com/9sE34WB.png", "atk", 10, 242, "atk", 5, 69, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "This sword was once the pride and joy of a great warrior, but now its once majestic appearance has faded and dulled. The hilt is cracked and the blade is tarnished, but the weapon still holds a glimmer of the power and strength it once possessed.", "special", 67),

    // Rogue - Rogue
    new lootInfo("Rogue Ingot", "loot", "crafting material", ["yes"], "<:rogue_ingot:1060160890088988775>", "https://i.imgur.com/4HyRpbz.png", "rare", 68),
    new weaponInfo("Rogue Dagger", "weapon", "dagger", ["yes"], "<:rogue_dagger:1060160893863858299>", "https://i.imgur.com/oAHIiDX.png", "atk", 69, 420, "md", 69, 420, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.class === 31) mybuff.atk.push(new buffInfo("+", Math.floor(69 + ((420 - 69) / 150) * ((myStats.weaponinfo.level - 1) + (myStats.weaponinfo.ref * 3))), 9999));
    }, "When carried by a rogue, has double the stats.", "Crafted from the finest rogue ingot, the Rogue Dagger was created for one purpose only: to win the hearts of fair maidens. Its sleek and cunning design reflects the mischievous nature of its owner, a roguish gentleman who always manages to get what he wants. With this weapon by his side, there is no obstacle he cannot overcome, no lock he cannot pick, and no lady he cannot charm. The Rogue Dagger is a weapon of seduction and deception, perfect for those who live by their wits and their charms.", "rare", 69),

    // Weapons - Special Staff
    new weaponInfo("Battleworn Branch", "weapon", "staff", ["crafting", "chest"], "<:battleworn_branch:1061605503060414544>", "https://i.imgur.com/wyVpwQs.png", "md", 9, 268, "atk", 6, 85, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "Forged from the branches of a tree that stood tall on the battlefield, the Battleworn Branch has seen its fair share of combat. Its bark is scarred and chipped, but its magic remains strong and fierce. Wield it with determination, and let its power aid you in your fight against evil.", "special", 70),
    new weaponInfo("Sprouting Staff", "weapon", "staff", ["crafting", "chest"], "<:sprouting_staff:1061605505690259486>", "https://i.imgur.com/ZpIyGVI.png", "md", 11, 256, "md%", 0.03, 0.14, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "The Sprouting Staff may not be the most impressive weapon in a magician's arsenal, but it still holds a certain power. Made from cheap wood and infused with just enough magic to be useful, this staff can still summon small sprouts and weak plants. Though it may not be able to create a full forest, it can provide a bit of cover or some minimal sustenance in a pinch. Despite this, the Sprouting Staff remains a valuable tool for any aspiring magician looking to harness the power of nature.", "special", 71),
    new weaponInfo("The Enchanted Willow of the Dryads", "weapon", "staff", ["crafting", "chest"], "<:TheEnchantedWillowOfTheDryads:1061605509305741322>", "https://i.imgur.com/EdATWPS.png", "md", 10, 242, "md", 5, 69, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "The Enchanted Willow of the Dryads is a staff imbued with the power of the ancient forest spirits. Its branches are crafted from a single willow tree, enchanted to never wither or lose its leaves. In the hands of a skilled wielder, the staff can make use of the strength of the dryads, summoning powerful vines and roots to ensnare and entangle enemies. Only those with a deep connection to nature can harness its full potential.", "special", 72),

    // Weapons - Special Axe
    new weaponInfo("Ashrune", "weapon", "axe", ["crafting", "chest"], "<:ashrune:1061612663152574485>", "https://i.imgur.com/kkgkM1y.png", "atk", 14, 250, "atk", 5, 60, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "The Ashrune is a reliable and sturdy axe, with a well-balanced head and a comfortable grip. It is made of durable iron, capable of standing up to heavy use in the field. The blade is sharp enough to easily chop through logs and underbrush, making it a useful tool for hunters and woodcutters. The handle is wrapped in a soft leather for a secure grip, even in wet or slippery conditions. Overall, the Ashrune is a dependable choice for anyone in need of a strong and versatile axe.", "special", 73),
    new weaponInfo("Ironbark", "weapon", "axe", ["crafting", "chest"], "<:ironbark:1061612664972914769>", "https://i.imgur.com/pHIOK7g.png", "atk", 12, 275, "def", 4, 50, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "The Ironbark may not be the most formidable weapon on the battlefield, but it is still a force to be reckoned with. Its sturdy construction and reliable design make it a trusted companion in combat, able to withstand the rigors of battle and deliver powerful blows. Though it may not be the most flashy or impressive weapon, Ironbark has proven itself time and again as a dependable ally in the heat of combat. Its reputation may not be as fearsome as some, but those who face it in battle soon come to understand the true strength of the Ironbark.", "special", 74),
    new weaponInfo("Minatory Greataxe", "weapon", "axe", ["crafting", "chest"], "<:minatory_greataxe:1061612659478372434>", "https://i.imgur.com/U2VYJET.png", "atk", 9, 257, "md%", 0.03, 0.14, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "The Minatory Greataxe is a reliable and sturdy weapon, favored by many warriors for its versatility in battle. Its broad blade is capable of delivering powerful blows, and its sturdy handle allows for precise control and accuracy. Though it may not have the same fearsome reputation as some of the more legendary weapons in the realm, it is a reliable choice for any adventurer looking for a reliable weapon in their arsenal.", "special", 75),

    // Weapons - Special Bow
    new weaponInfo("Yielding Oak", "weapon", "bow", ["crafting", "chest"], "<:yielding_oak:1061708109615202395>", "https://i.imgur.com/HcmnVnr.png", "atk", 9, 257, "cd", 0.05, 0.23, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "Crafted from the resilient wood of a mighty oak tree, the Yielding Oak is a testament to the strength and adaptability of nature. Its graceful curves and expert craftsmanship allow for fluid movement and precise aiming, making it a favored choice among skilled archers. With the Yielding Oak in hand, even the most challenging shots can be taken with ease and confidence.", "special", 76),
    new weaponInfo("Wildwood Whisper", "weapon", "bow", ["crafting", "chest"], "<:wildwood_whisper:1061708105391550574>", "https://i.imgur.com/EH3UXUw.png", "atk", 9, 220, "atk", 6, 90, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "Forged from the branches of the old forest, the Wildwood Whisper is a testament to the power of nature. Its old wooden frame holds the secrets of the forest, whispering its secrets to those who wield it with skill and grace. In the hands of a true archer, the Wildwood Whisper becomes a deadly weapon, striking fear into the hearts of those who dare to stand against it.", "special", 77),
    new weaponInfo("Whelm", "weapon", "bow", ["crafting", "chest"], "<:whelm:1061708100622618666>", "https://i.imgur.com/5eYlIYd.png", "atk", 12, 266, "cr", 0.04, 0.16, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "Despite its unassuming appearance, the Whelm holds a hidden power within its wooden frame. Its simple design allows for quick and agile movements, allowing its wielder to strike with precision and speed. Though it may not pack the same punch as a more formidable bow, the Whelm can still deliver powerful blows that can catch even the most skilled warriors off guard.", "special", 78),

    // Weapons - Special Lance
    new weaponInfo("Faolchu", "weapon", "lance", ["crafting", "chest"], "<:faolchu:1061710458589036564>", "https://i.imgur.com/FlhPwxm.png", "atk", 10, 266, "atk%", 0.03, 0.12, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "The Faolchu was once wielded by the great hero Faolchu the Wolf. Known for his swiftness and cunning, Faolchu would strike fear into the hearts of his enemies with a single glance from the piercing eyes of his wolf-like helm. With the Faolchu in hand, he would vanquish any foe with a single, precise thrust. Its glistening steel blade is imbued with the spirit of the wolf.", "special", 79),
    new weaponInfo("Shadowsteel Reaper", "weapon", "lance", ["crafting", "chest"], "<:shadowsteel_reaper:1061710461311144006>", "https://i.imgur.com/7lNuyp2.png", "atk", 11, 249, "cd", 0.05, 0.17, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "The Shadowsteel Reaper pierces through the darkness, seeking out its prey with deadly precision. Forged from the finest shadowsteel, this lance is both light and strong, allowing its wielder to strike with lightning speed and power. With each thrust, the Reaper unleashes a devastating blow, cutting through armor and bone with ease. Those who stand in its path are doomed to meet their end, consumed by the Shadowsteel Reaper's relentless hunger for victory.", "special", 80),
    new weaponInfo("Clach Liath", "weapon", "lance", ["crafting", "chest"], "<:clach_liath:1061710454617018450>", "https://i.imgur.com/HYwUj7J.png", "atk", 13, 270, "cr", 0.03, 0.13, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "Forged in the fires of a distant mountain forge, the Clach Liath is a weapon of unmatched strength and skill. Its sharpened tip pierces through armor with ease, while its sturdy handle allows for precise and deadly strikes. Those who wield the Clach Liath are feared in battle, their lance a symbol of their prowess and determination.", "special", 81),

    // Weapons - Special Dagger
    new weaponInfo("Cat's Claw", "weapon", "dagger", ["crafting", "chest"], "<:cats_claw:1062036274803900466>", "https://i.imgur.com/T53Nm1e.png", "atk", 10, 258, "md", 10, 258, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "With its curved blade resembling a sharpened feline claw, the Cat's Claw strikes with the precision and stealth of a stalking predator. Those who wield the Cat's Claw are feared by their enemies, for they know that death is always lurking within its sharp edge.", "special", 82),
    new weaponInfo("Dirt Slicer", "weapon", "dagger", ["crafting", "chest"], "<:dirt_slicer:1062036277408583680>", "https://i.imgur.com/cWA0nGF.png", "atk", 9, 251, "cd", 0.04, 0.2, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "Despite its humble appearance, the Dirt Slicer is a reliable companion for any adventurer on a budget. Its simple design and affordable price make it a practical choice for cutting through tough soil and foliage. While it may not be the most elegant weapon, the Dirt Slicer gets the job done with efficiency and effectiveness.", "special", 83),
    new weaponInfo("Malicious Shanker", "weapon", "dagger", ["crafting", "chest"], "<:malicious_shanker:1062036281951015022>", "https://i.imgur.com/EImDfiS.png", "atk", 15, 264, "cr", 0.04, 0.12, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "With its curved blade and sharpened edges, the Malicious Shanker is a weapon crafted for cunning and deadly strikes. Its sleek design allows for quick and stealthy movements, making it the perfect tool for those who crave the thrill of the kill. Beware those who wield this dagger, for their intentions are always sinister and their strikes are always lethal.", "special", 84),

    // Weapons - Special Shield
    new weaponInfo("Acorn Aegis", "weapon", "shield", ["crafting", "chest"], "<:acorn_aegis:1062038802144706561>", "https://i.imgur.com/1tqxor7.png", "shield", 30, 420, "mr", 9, 102, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "As sturdy as the oak tree from which it was crafted, the Acorn Aegis is a shield imbued with the protective powers of nature. With its intricate design of intertwining branches and a gleaming metal plate at its center, this shield offers not only physical defense, but also a sense of harmony and connection to the natural world. In battle, it provides steadfast protection, allowing its wielder to stand tall and unshakeable against any foe.", "special", 85),
    new weaponInfo("Oakwood Bastion", "weapon", "shield", ["crafting", "chest"], "<:oakwood_bastion:1062038806099922995>", "https://i.imgur.com/ev3ITbz.png", "shield", 33, 432, "hp", 7, 173, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "The Oakwood Bastion may be humble in appearance, but its crafted from the finest oak trees. Its light wood is reinforced with iron bands, making it capable of withstanding some blows. In battle, it serves as a reliable companion, protecting its wielder from harm as best as it can.", "special", 86),
    new weaponInfo("Patched Shield", "weapon", "shield", ["crafting", "chest"], "<:patched_shield:1062038808838799430>", "https://i.imgur.com/89x6EHJ.png", "shield", 38, 444, "def", 8, 89, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None", "The Patched Shield may be worn and weathered, but it is a weapon of great endurance. Its patched and repaired surface can deflect enemy attacks, and its rough, jagged edges can catch and trap enemy weapons. It may not be the prettiest shield, but it is a stalwart defender in combat.", "special", 87),

    // Loot - Ascension Material
    new lootInfo("Ephemeral Light", "loot", "ascension material", ["dungeon", "floors 21-24, 26-29"], "<:ephemeral_light:1062475144028753960>", "https://i.imgur.com/2ObujFB.png", "normal", 88),
    new lootInfo("Detached Horn", "loot", "ascension material", ["dungeon", "floors 35-39, 41-44"], "<:detached_horn:1062489011228250222>", "https://i.ibb.co/3hRR1BB/detached-horn-89.png", "normal", 89),
    new lootInfo("Ancient Dice", "loot", "ascension material", ["dungeon", "floor 85"], "<:ancient_dice:1062489046028398732>", "https://i.imgur.com/ZHZzlQJ.png", "normal", 90),
    new lootInfo("Mysterious Nut", "loot", "ascension material", ["dungeon", "floor 80"], "<:mysterious_nut:1062489015061860443>", "https://i.imgur.com/cRWwpdD.png", "normal", 91),
    new lootInfo("Devil Claws", "loot", "ascension material", ["dungeon", "floors 65, 93, 95"], "<:devil_claws:1062489031809708042>", "https://i.imgur.com/AZYiLcS.png", "normal", 92),

    // Weapons - Rare Sword
    new weaponInfo("Cortana", "weapon", "sword", ["crafting", "chest"], "<:cortana:1062491561650298960>", "https://i.imgur.com/5HzrIlJ.png", "atk", 26, 422, "dodge", 0.02, 0.1, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.def = Math.floor(eStats.def * 0.9);
        ebuff.def.push(new buffInfo("*", 0.9, 10));
    }, "Reduces enemy DEF by **10%** at the start of battle, lasting 10 rounds.", "Forged in the fires of Mount Doom, Cortana is a sword of unparalleled beauty and deadly precision. Its razor-sharp edge can cut through even the toughest armor with ease, making it the weapon of choice for those seeking to vanquish their enemies on the battlefield. But wield it with caution, for those who dare to challenge its might are sure to meet their end.", "rare", 93),
    new weaponInfo("Crimson Cutlass of the Kraken", "weapon", "sword", ["crafting", "chest"], "<:crimson_cutlass_of_the_kraken:1062491547913965662>", "https://i.imgur.com/OHWAIdD.png", "atk", 24, 404, "cd", 0.05, 0.25, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk *= 2, myStats.md *= 2;
    }, "Your first hit during the first round deals twice as much damage", "The Crimson Cutlass of the Kraken was a feared weapon among sailors and pirates alike. It was said to be made from the fang of a giant kraken, enchanted with dark magic to never dull or break. Legend has it that the cutlass was once wielded by a notorious pirate captain who made a pact with the kraken itself. In exchange for the kraken's power, the captain promised to offer up the souls of any victims claimed by the cutlass. The pirate and the kraken ruled the seas for many years, striking fear into the hearts of all who sailed near them. Eventually, the pirate captain was defeated by a rival crew and the cutlass was lost to the depths of the ocean. But it is said that the kraken still guards the weapon, waiting for a worthy wielder to come and claim its power once again.", "rare", 94),
    new weaponInfo("Guardian of Heroes", "weapon", "sword", ["crafting", "chest"], "<:guardian_of_heroes:1062491552913575966>", "https://i.imgur.com/CslNdhp.png", "atk", 30, 430, "def", 5, 70, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def = (myStats.def * 1.2);
        mybuff.def.push(new buffInfo("*", 1.2, 5));
    }, "Increases your DEF by **20%** at the start of battle, lasting 5 rounds.", "The Guardian of Heroes is a sword imbued with the essence of courage and valor. Those who wield it are protected by the spirits of fallen warriors, and their blades gleam with the righteousness of their cause. In the hands of a true hero, this weapon becomes a beacon of hope, striking fear into the hearts of evil and bringing victory to those who defend the innocent.", "rare", 95),
    new weaponInfo("Iron Sword", "weapon", "sword", ["crafting", "chest"], "<:iron_sword:1062491556810080397>", "https://i.imgur.com/D2FbBVs.png", "atk", 23, 323, "atk%", 0.05, 0.15, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.dodge -= 0.05;
        if (eStats.dodge < 0) eStats.dodge = 0;
        ebuff.dodge.push(new buffInfo("+", -0.05, 9999));
    }, "Decreases enemy dodge rate by **5**% at the start of battle.", "The Iron Sword may not have the embellishments or exotic materials of other swords, but its craftsmanship is undeniable. It's not the most impressive weapon in looks, but it's made with a durable iron blade. The Iron Sword is a trusty companion for adventurers on a budget, who needs a sword that can stand up to the rigors of battle without breaking the bank.", "rare", 96),
    new weaponInfo("Jolly Jian", "weapon", "sword", ["crafting", "chest"], "<:jolly_jian:1062495714007072928>", "https://i.imgur.com/kHBt9w1.png", "atk", 30, 420, "mr", 5, 72, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mr = (myStats.mr * 1.2);
        mybuff.mr.push(new buffInfo("*", 1.2, 5));
    }, "Increases your MR by **20%** at the start of battle, lasting 5 rounds.", "The Jolly Jian is a finely crafted weapon, with a gleaming blade that is said to have been forged in the fires of merriment itself. It is said that those who wield it are filled with a boundless sense of joy and laughter, cutting through their foes with ease. The hilt is adorned with a jolly face, forever grinning in the heat of battle. Whether you're fighting for good or for evil, the Jolly Jian is sure to bring a smile to your face.", "rare", 97),
    new weaponInfo("Mistilteinn", "weapon", "sword", ["crafting", "chest"], "<:mistilteinn:1062495721313542234>", "https://i.imgur.com/rmcINsg.png", "md", 24, 381, "md%", 0.04, 0.12, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mdChance = 1;
    }, "The wielder's normal attacks deal magic damage.", "Mistilteinn, also known as the Misleading Twig, is a cunning weapon that hides its true power behind a simple, unassuming appearance. Mistilteinn easily blends in with its surroundings, lulling enemies into a false sense of security. But with a quick flick of the wrist, this deceptive weapon unleashes a flurry of deadly strikes, leaving even the most seasoned warriors stunned. Be warned, those who underestimate the power of Mistilteinn do so at their own peril.", "rare", 98),
    new weaponInfo("Reaper of Regret", "weapon", "sword", ["crafting", "chest"], "<:reaper_of_regret:1062495709238149232>", "https://i.imgur.com/k8CIaeh.png", "atk", 10, 280, "cd", 0.2, 0.5, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr += 0.1;
        mybuff.cr.push(new buffInfo("+", 0.1, 5));
    }, "Increases crit rate by **10%** at the start of battle for 5 rounds.", "As you grip the hilt of the Reaper of Regret, you can feel the weight of countless sorrows and regrets imbued within its blade. With each strike, the sword relentlessly reaps the souls of those consumed by their own regrets, freeing them from their torment. Do not wield this weapon lightly, for it will claim the lives of both the guilty and the innocent.", "rare", 99),
    new weaponInfo("The Strangler", "weapon", "sword", ["crafting", "chest"], "<:the_strangler:1062497284857798828>", "https://i.imgur.com/x1Ojdr6.png", "atk", 24, 397, "dodge", 0.03, 0.1, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodge += 0.07;
        mybuff.dodge.push(new buffInfo("+", 0.07, 5));
    }, "Increases dodge chance by **7%** at the start of battle for 5 rounds.", "The Strangler is a sword that likes to get up close and personal with its victims. Its straight blade is perfect for giving those pesky monsters a tight hug before sending them off to the great beyond. With its comfortable grip and lightweight design, you'll feel like you're holding onto a giant noodle while you slice through your enemies. With its ability to cut through anything (except for maybe a really tough bagel), whether you're fighting off hordes of goblins or just trying to rid your garden of weeds, the Strangler is the perfect tool for the job.", "rare", 100),
    new weaponInfo("Knight's Valor", "weapon", "sword", ["crafting", "chest"], "<:knights_valor:1062495717375086703>", "https://i.imgur.com/eHHM1UE.png", "atk", 23, 382, "atk", 7, 102, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk = Math.floor(myStats.atk * 0.8);
        mybuff.atk.push(new buffInfo("*", 0.8, 3));
    }, "Has **20%** decreased ATK during the first 3 rounds.", "Knight's Valor may not be the most extravagant sword, but its reliability and durability make it a trusted companion for any knight. Its sturdy construction and reliable edge have proven effective in battle time and time again. Though it may not boast the intricate designs or legendary heritage of some swords, Knight's Valor is a dependable weapon for any warrior seeking to defend their honor and protect their kingdom.", "rare", 101),
    new weaponInfo("Scimitar of the Sands", "weapon", "sword", ["crafting", "chest"], "<:scimitar_of_the_sands:1062497871531884634>", "https://i.imgur.com/5O2kjGu.png", "atk", 27, 417, "md%", 0.04, 0.14, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mana += 20;
    }, "Increases mana cap by **+20**.", "The Scimitar of the Sands is a weapon forged in the scorching heat of the desert. It has a curved blade that glints like the sun on the horizon, and a golden hilt. In the hands of a skilled warrior, the Scimitar is a deadly weapon, able to cut through bones with ease. The Scimitar of the Sands is not just a weapon - it is a symbol of the power of the desert.", "rare", 102),
    new weaponInfo("Sir Slice-A-Lot", "weapon", "sword", ["crafting", "chest"], "<:sir_slice_a_lot:1062497876787347557>", "https://i.imgur.com/gCBcaHm.png", "atk", 25, 377, "md", 25, 377, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.br += 0.1;
        mybuff.br.push(new buffInfo("+", 0.1, 9999));
    }, "Increases block rate by **10%** at the start of battle.", "Sir Slice-A-Lot is known for its jovial disposition and hearty laugh, often bringing a smile to the faces of those who wield it in battle. Some say it even tells jokes to lighten the mood during tense situations. With its keen edge and cheerful demeanor, Sir Slice-A-Lot is a sword you can't help but love. This sword is guaranteed to make your enemies crumble with laughter before you take them down. Just don't let its good nature fool you - it's still a formidable weapon in the right hands.", "rare", 103),
    new weaponInfo("The Blade of the Mermaid", "weapon", "sword", ["crafting", "chest"], "<:the_blade_of_the_mermaid:1062497866440003635>", "https://i.imgur.com/i5RwHqg.png", "atk", 27, 412, "cr", 0.05, 0.16, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mg += 5;
        mybuff.mg.push(new buffInfo("+", 5, 3));
    }, "Increases mana generation by **+5**💧at the start of battle, lasting 3 rounds.", "The Blade of the Mermaid was a mythical weapon said to have been crafted by the mermaids of the ocean depths. It was said to have been forged from a single, flawless pearl. In ancient times, the Blade of the Mermaid was wielded by a group of elite warriors known as the Sea Guardians. These warriors were tasked with protecting the ocean and all of its inhabitants from harm. They were known for their incredible skill with the blade and their fierce loyalty to the sea.", "rare", 104),
    new weaponInfo("The Foil of Foolishness", "weapon", "sword", ["crafting", "chest"], "<:the_foil_of_foolishness:1062497868574887966>", "https://i.imgur.com/dnlASwA.png", "md", 24, 408, "cd", 0.04, 0.24, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.lootm += 0.1;
    }, "Increases coins earned from the dungeon by **10%**.", "Once wielded by a jester in the court of a foolish king, the Foil of Foolishness was thought to bring laughter and joy to those who wielded it. But its true power was revealed when the jester used it to expose the king's foolish decisions and bring about his downfall. Now, it is said that whoever holds the sword will possess the ability to see through deceit and cut through foolishness.", "rare", 105),

    // Weapons - Rare Staff
    new weaponInfo("Draughtbane", "weapon", "staff", ["crafting", "chest"], "<:draughtbane:1063471951202504714>", "https://i.imgur.com/acVLWUK.png", "md", 26, 422, "atk", 25, 410, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.md += Math.floor(myStats.md * 1.1);
        mybuff.md.push(new buffInfo("*", 1.1, 5));
    }, "Increases magic damage by **+10%** at the start of battle, lasting 5 rounds.", "The Draughtbane staff is a powerful weapon, wielded by only the most skilled and dedicated mages. Its mystical properties allow the wielder to imbue their spells with the power to neutralize any potion or elixir, rendering them powerless. This staff is a valuable tool for any magician seeking to protect themselves and others from the dangers of potent brews.", "rare", 106),
    new weaponInfo("Faded Memory", "weapon", "staff", ["crafting", "chest"], "<:faded_memory:1063471958794190918>", "https://i.imgur.com/jWB6rvm.png", "md", 23, 409, "mr", 6, 82, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mr += Math.floor(myStats.mr * 1.2);
        mybuff.mr.push(new buffInfo("*", 1.2, 4));
    }, "Increases magic resistance by **+20%** at the start of battle, lasting 4 rounds.", "Once wielded by the great wizard Eldrin, the Faded Memory staff holds the power to manipulate memories and erase them from the minds of others. But with each use, the staff's magic grows weaker and its engravings fade, a reminder of the fleeting nature of all things.", "rare", 107),
    new weaponInfo("Ferocious Spiritstaff", "weapon", "staff", ["crafting", "chest"], "<:ferocious_spiritstaff:1063471967719657552>", "https://i.imgur.com/wlk0xGQ.png", "md", 21, 398, "dodge", 0.02, 0.1, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.dodge -= 0.1;
        if (eStats.dodge < 0) eStats.dodge = 0;
        ebuff.dodge.push(new buffInfo("+", -0.1, 4));
    }, "Decreases enemy dodge rate by **10**% at the start of battle, lasting 4 rounds.", "Forged from the essence of a powerful and ferocious spirit, the Ferocious Spiritstaff channels its primal energy into devastating spells and powerful strikes. This staff is a fearsome weapon that commands the battlefield and strikes fear into the hearts of enemies. Beware the wrath of the Ferocious Spiritstaff.", "rare", 108),
    new weaponInfo("Lich's Bane", "weapon", "staff", ["crafting", "chest"], "<:lichs_bane:1063471944386748427>", "https://i.imgur.com/Pd4k0EX.png", "md", 24, 410, "cd", 0.04, 0.2, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr += 0.15;
        mybuff.cr.push(new buffInfo("+", 0.15, 4));
    }, "Increases crit rate by **+15%** at the start of battle, lasting 4 rounds.", "Lich's Bane was crafted by a group of powerful wizards who sought to create a weapon powerful enough to defeat even the most powerful of undead foes. It is said that the Lich's Bane can dispel even the strongest of necromantic spells, and is capable of banishing the most powerful of liches back to the void from whence they came.", "rare", 109),
    new weaponInfo("Mistwood Staff", "weapon", "staff", ["crafting", "chest"], "<:mistwood_staff:1063472730512568330>", "https://i.imgur.com/TUP4u5l.png", "md", 30, 454, "def", 5, 78, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def += Math.floor(myStats.def * 1.2);
        mybuff.def.push(new buffInfo("*", 1.2, 4));
    }, "Increases DEF by **+20%** at the start of battle, lasting 4 rounds.", "The Mistwood Staff is a powerful tool imbued with ancient magic. It is said to have been crafted from the heart of a mighty tree deep within a mystical forest shrouded in fog. Those who wield it are able to call forth the mist to obscure their enemies' vision and hide their own movements. In battle, it can unleash devastating spells that strike with the force of a storm. Only those with a strong connection to the natural world can hope to wield its full power.", "rare", 110),
    new weaponInfo("Mystic Totem", "weapon", "staff", ["crafting", "chest"], "<:mystic_totem:1063472735034024146>", "https://i.imgur.com/ZffudlF.png", "md", 27, 434, "atk%", 0.02, 0.13, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cd += 0.25;
        mybuff.cd.push(new buffInfo("+", 0.25, 5));
    }, "Increases crit damage by **+25%** at the start of battle, lasting 5 rounds.", "The Mystic Totem is a powerful tool for those who seek to tap into the ancient magic of the shamans. Its intricate carvings depict the many faces of the natural world, each one imbued with its own unique power. Those who wield the Mystic Totem are able to channel the energy of the land, air, and water, bending them to their will and harnessing their raw power. The staff is a symbol of the deep connection between the mortal world and the realm of the spirits, and those who carry it are feared and respected by all who know its true potential.", "rare", 111),
    new weaponInfo("Shaman's Hex", "weapon", "staff", ["crafting", "chest"], "<:shamans_hex:1063472739937157260>", "https://i.imgur.com/VTfgr74.png", "md", 25, 415, "hp", 12, 158, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.blockAbilities = 2;
    }, "Blocks the enemy from using any abilities during the first two rounds in the dungeon.", "Forged by ancient shamans and imbued with powerful dark magic, the Shaman's Hex is a feared weapon among those who know of its existence. Its twisted, gnarled wood pulsates with malevolent energy, capable of cursing those who stand in its path with debilitating hexes and spells. Wielders of the Shaman's Hex must be careful, for the staff's power comes with a price - those who use it too frequently risk being consumed by its dark magic.", "rare", 112),
    new weaponInfo("Sidhe Staff", "weapon", "staff", ["crafting", "chest"], "<:sidhe_staff:1063472726221787228>", "https://i.imgur.com/8GV0nLl.png", "md", 25, 408, "md%", 0.02, 0.1, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.2), 5));
        myStats.md += Math.floor(myStats.md * 0.2);
    }, "Increases magic damage by **+20%** at the start of battle, lasting 5 rounds.", "The Sidhe Staff is a mysterious and powerful object, imbued with the ancient magic of the fae. Those who wield it are said to be able to tap into the power of the otherworldly beings who reside in the mystical realm of the Sidhe. The staff is crafted from a single branch of the sacred tree of the fae, and decorated with glowing gemstones, giving off an otherworldly light.", "rare", 113),
    new weaponInfo("The Grim Wand", "weapon", "staff", ["crafting", "chest"], "<:the_grim_wand:1063473354843095122>", "https://i.imgur.com/7RFiT0V.png", "md", 22, 392, "cd", 0.05, 0.22, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.hp.push(new buffInfo("+", -Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.025), 4));
    }, "This staff will curse the enemy at the start of battle, dealing **10%** damage in total over 4 rounds.", "The Grim Wand was once wielded by a powerful necromancer, its dark power able to raise the dead and bend them to its wielder's will. Those who dare to wield the staff must be cautious, for its power comes with a heavy price. The Grim Wand hungers for death and will stop at nothing to satisfy its thirst for destruction. Use it wisely, lest you become its next victim.", "rare", 114),
    new weaponInfo("Twisted Visions", "weapon", "staff", ["crafting", "chest"], "<:twisted_visions:1063473360010498098>", "https://i.imgur.com/TJlxJqA.png", "md", 21, 371, "cr", 0.06, 0.19, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodge += 0.1;
        mybuff.dodge.push(new buffInfo("+", 0.1, 4));
    }, "Increases dodge chance by **10%** at the start of battle for 4 rounds.", "The Twisted Visions staff is imbued with dark magic, capable of warping the perceptions of those it is wielded against. Those who gaze upon it are subject to twisted visions of their deepest fears and desires, leaving them disoriented and vulnerable to the wielder's will. Be wary, for the power of the Twisted Visions staff comes at a great cost to both the user and their victims.", "rare", 115),
    new weaponInfo("Wrathful Branch", "weapon", "staff", ["crafting", "chest"], "<:wrathful_branch:1063473365534396476>", "https://i.imgur.com/HNZzTLf.png", "md", 26, 422, "md%", 0.02, 0.13, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mr = Math.floor(eStats.mr * 0.9);
        ebuff.mr.push(new buffInfo("*", 0.9, 5));
    }, "Decreases enemy magic resistance by **10%** at the start of battle, lasting 5 rounds.", "The Wrathful Branch is a weapon of devastating power, imbued with the anger of a thousand storms. Those who wield it are consumed by a tempestuous rage, their strikes raining down with the ferocity of a thunderous gale. With each swing, the branch crackles with energy, unleashing a devastating blast of lightning that scorches all in its path. Those who stand against its fury are left charred and broken, their bodies consumed by the unbridled wrath of nature.", "rare", 116),

    // Weapons - Rare Axe
    new weaponInfo("Butcher's Cleaver", "weapon", "axe", ["crafting", "chest"], "<:butchers_cleaver:1063508464137146428>", "https://i.imgur.com/GcCg3uI.png", "atk", 20, 382, "dodge", 0.02, 0.1, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodge += 0.05;
        mybuff.dodge.push(new buffInfo("+", 0.05, 7));
    }, "Increases dodge chance by **5%** at the start of battle for 7 rounds.", "The Butcher's Cleaver may not be the most impressive axe, but it gets the job done. Its sturdy construction and reliable blade make it a trustworthy choice for those looking for a reliable weapon in a pinch. Though it may not be able to match the power of more formidable axes, the Butcher's Cleaver is a reliable companion on the battlefield.", "rare", 117),
    new weaponInfo("Counterfeit MacGuffin", "weapon", "axe", ["crafting", "chest"], "<:counterfeit_macguffin:1063508466511118346>", "https://i.imgur.com/CAEBYyT.png", "atk", 30, 438, "md", 27, 421, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk *= 2;
    }, "Has twice the ATK during the first round of the battle.", "The Counterfeit MacGuffin is a battle axe of questionable origin. Its dull blade and crooked handle suggest that it is a cheap knockoff of a legendary weapon. Despite its shortcomings, the Counterfeit MacGuffin has proven to be a formidable tool in battle, earning the respect of those who wield it. Whatever the truth may be, one thing is certain - the Counterfeit MacGuffin is not to be underestimated.", "rare", 118),
    new weaponInfo("Dancing Ironbark Ravager", "weapon", "axe", ["crafting", "chest"], "<:dancing_ironbark_ravager:1063508471179399188>", "https://i.imgur.com/iRo9qxi.png", "atk", 25, 404, "cd", 0.06, 0.22, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr = 1;
    }, "Has **100%** crit rate during the first round of the battle.", "With each mighty swing of the Dancing Ironbark Ravager, the battlefield trembles beneath its weight. This fearsome axe is imbued with the spirit of the ancient Ironbark trees themselves. As it dances through the chaos of combat, its deadly blades leave a trail of destruction in their wake. Those who dare to face the Dancing Ironbark Ravager in battle will soon realize the true power of the forest.", "rare", 119),
    new weaponInfo("Diabolical Bronze Axe", "weapon", "axe", ["crafting", "chest"], "<:diabolical_bronze_axe:1063508483531608114>", "https://i.imgur.com/c060Csz.png", "atk", 26, 420, "def", 8, 80, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def += Math.floor(myStats.def * 1.12);
        mybuff.def.push(new buffInfo("*", 1.12, 4));
    }, "Increases DEF by **12%** at the start of battle, lasting 4 rounds.", "The Diabolical Bronze Axe is not your ordinary weapon. Forged in the fiery pits of the underworld, it is imbued with the power of the demons. Each swing of this deadly axe unleashes a wave of destruction, leaving nothing but ash and ruin in its wake. Beware, for those who wield this weapon are said to be possessed by the very demons they call upon.", "rare", 120),
    new weaponInfo("Nightmare Twister", "weapon", "axe", ["crafting", "chest"], "<:nightmare_twister:1063508459506638899>", "https://i.imgur.com/xoMKgoB.png", "atk", 27, 432, "cr", 0.03, 0.12, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cd += 0.25;
        mybuff.cd.push(new buffInfo("+", 0.25, 4));
    }, "Increases crit damage by **+25%** at the start of battle, lasting 4 rounds.", "As the Nightmare Twister descends upon its foes, its sharp blades cut through the air with deadly precision. With each swing, it unleashes a storm of destruction, slicing through armor and flesh alike. Those who face the axe in battle are met with a swift end, as the Nightmare Twister leaves a trail of devastation in its wake. Even in the midst of chaos, the Nightmare Twister remains a formidable weapon, feared by all who cross its path.", "rare", 121),
    new weaponInfo("Nonchalant Necksplitter", "weapon", "axe", ["crafting", "chest"], "<:nonchalant_necksplitter:1063510168224141362>", "https://i.imgur.com/ksCR6WT.png", "atk", 22, 365, "atk", 8, 132, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.shield += 60;
    }, "Gives a shield with **60** hitpoints.", "With a simple swing of the Nonchalant Necksplitter, enemies are left in stunned silence as their heads roll to the ground. This battle axe may seem casual in its approach, but make no mistake, it is deadly and efficient in its mission to end lives. Beware those who dare to cross its path.", "rare", 122),
    new weaponInfo("Vindictive Cleaver", "weapon", "axe", ["crafting", "chest"], "<:vindictive_cleaver:1063510172770770985>", "https://i.imgur.com/XUjKQxA.png", "atk", 27, 428, "md", 25, 380, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.md *= 2;
    }, "Has twice the MD during the first round of the battle.", "The Vindictive Cleaver is a weapon forged in the fires of revenge. Its sharpened blade, adorned with the blood of fallen enemies, thirsts for the demise of all who stand in its way. With each swing, it seeks to deliver a final blow, bringing swift and brutal justice to those who dare to oppose its wielder.", "rare", 123),
    new weaponInfo("Warriors Path", "weapon", "axe", ["crafting", "chest"], "<:warriors_path:1063510175677423626>", "https://i.imgur.com/7xSAnAf.png", "atk", 28, 440, "atk%", 0.03, 0.14, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk = Math.floor(myStats.atk * 0.9);
        mybuff.atk.push(new buffInfo("*", 0.9, 5));
    }, "Has **10%** decreased ATK during the first 5 rounds.", "The Warriors Path battle axe has been wielded by the bravest of fighters on their journey to victory. Those who wield it know that it is not just a weapon, but a symbol of their unwavering determination and bravery on the battlefield.", "rare", 124),
    new weaponInfo("Waypoint", "weapon", "axe", ["crafting", "chest"], "<:waypoint:1063510179527807037>", "https://i.imgur.com/k0EmUSl.png", "atk", 23, 392, "def", 8, 79, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def = Math.floor(myStats.def * 1.1);
        myStats.mr = Math.floor(myStats.mr * 1.1);
        mybuff.def.push(new buffInfo("*", 1.1, 5));
        mybuff.mr.push(new buffInfo("*", 1.1, 5));
    }, "Has **10%** increased DEF and magic resistance for the first 5 rounds.", "The Waypoint axe is more than just a weapon, it's a guide. Its sharp edges gleam in the light, pointing the way to your destination. Its sturdy handle is made from sturdy wood wrapped with soft red cloth, providing a secure grip and balance for every swing. Whether you're hacking through a dense forest or battling fierce monsters, the Waypoint will lead you to victory.", "rare", 125),

    // Weapons - Rare Bow
    new weaponInfo("Ancient Willow", "weapon", "bow", ["crafting", "chest"], "<:ancient_willow:1063549413861105725>", "https://i.imgur.com/89Wgpks.png", "atk", 21, 311, "atk", 8, 137, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk = Math.floor(myStats.atk * 1.2);
        mybuff.atk.push(new buffInfo("*", 1.2, 4));
    }, "Increases your ATK by **20%** at the start of battle, lasting 5 rounds.", "The Ancient Willow bow is said to be crafted from the very first willow tree to ever grow on the earth. Its wood is imbued with ancient magic and strength, allowing its arrows to strike with unrivaled precision and power. Those who wield it are said to have a connection to the primal forces of nature, channeling its power into their shots.", "rare", 126),
    new weaponInfo("Drawback", "weapon", "bow", ["crafting", "chest"], "<:drawback:1063549417409495160>", "https://i.imgur.com/TU1nGLN.png", "atk", 22, 386, "dodge", 0.03, 0.1, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.dodge -= 0.1;
        if (eStats.dodge < 0) eStats.dodge = 0;
        ebuff.dodge.push(new buffInfo("+", -0.1, 6));
    }, "Decreases enemy dodge chance by **10%** at the start of battle, lasting 6 rounds.", "The Drawback bow is a weapon of deadly precision, imbued with the power to unleash a devastating shot with every pull of the string. Its enchanted grip grant it unparalleled strength and accuracy, allowing the wielder to strike with unerring accuracy. However, with great power comes great responsibility, and the Drawback demands a steady hand and a focused mind to unleash its full potential. Those who master its secrets will find a weapon of unparalleled potency, capable of bringing down even the mightiest of foes.", "rare", 127),
    new weaponInfo("Embertide", "weapon", "bow", ["crafting", "chest"], "<:embertide:1063549422308429875>", "https://i.imgur.com/wSYlkyM.png", "atk", 28, 432, "def", 7, 70, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def = Math.floor(myStats.def * 1.15);
        mybuff.def.push(new buffInfo("*", 1.15, 5));
    }, "Increases DEF by **15%** at the start of battle, lasting 5 rounds", "The Embertide bow is crafted from the finest Yew wood and imbued with fiery magic. Its strings are made from the tendrils of a salamander, giving it the ability to imbue its arrows with scorching heat. In the hands of a skilled archer, the Embertide bow can unleash devastating shots that can set entire armies ablaze. Those who dare to face its wielder in battle will feel the full fury of the inferno.", "rare", 128),
    new weaponInfo("Hardwood Shooter", "weapon", "bow", ["crafting", "chest"], "<:hardwood_shooter:1063549409842954362>", "https://i.imgur.com/jZdSzGE.png", "atk", 27, 423, "mr", 8, 76, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mr = Math.floor(myStats.mr * 1.15);
        mybuff.mr.push(new buffInfo("*", 1.15, 5));
    }, "Increases magic resistance by **15%** at the start of battle, lasting 5 rounds", "The Hardwood Shooter is crafted from the finest hardwood trees, chosen for their strength and durability. Its sleek design allows for precision shooting, making it a favorite among skilled archers. The bow sings as the arrow is released, a testament to its superior craftsmanship. With the Hardwood Shooter by your side, you will strike fear into the hearts of your enemies.", "rare", 129),
    new weaponInfo("Hungering Yew Launcher", "weapon", "bow", ["crafting", "chest"], "<:hungering_yew_launcher:1063549513832353862>", "https://i.imgur.com/lj5KVio.png", "atk", 23, 396, "cd", 0.04, 0.18, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.twinshot += 0.16;
    }, "Normal attacks have a **16%** chance of triggering a second shot.", "The Hungering Yew Launcher is crafted from the finest yew wood and imbued with dark magic. Its curved, menacing shape is a clear indication of its deadly capabilities. Those who dare to draw its string can feel the hunger of the bow, begging to be unleashed upon its unsuspecting prey. With each shot, it devours the souls of its victims, leaving nothing but destruction in its wake. Beware the Hungering Yew Launcher, for it will leave you wanting more.", "rare", 130),
    new weaponInfo("Iron Crossfire", "weapon", "bow", ["crafting", "chest"], "<:iron_crossfire:1063549518420914206>", "https://i.imgur.com/w7ylvuw.png", "atk", 25, 406, "cr", 0.03, 0.13, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr += 0.33;
        if (myStats.cr > 1) myStats.cr = 1;
        mybuff.cr.push(new buffInfo("+", 0.33, 2));
    }, "Has **33%** increased crit rate during the first 2 rounds.", "As the Iron Crossfire bolts rain down upon your enemies, their armor and shields offer no protection. Each shot pierces through steel and flesh, delivering swift and deadly justice. With its powerful strikes and precise aim, the Iron Crossfire is a weapon to be feared on the battlefield.", "rare", 131),
    new weaponInfo("The Splinter", "weapon", "bow", ["crafting", "chest"], "<:the_splinter:1063549522606817421>", "https://i.imgur.com/dUXqwB9.png", "md", 26, 406, "md%", 0.03, 0.14, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mr -= Math.floor(eStats.mr * 0.85);
        ebuff.mr.push(new buffInfo("*", 0.85, 5));
    }, "Decreases enemy magic resistance by **15%** at the start of battle, lasting 5 rounds.", "The Splinter bow is crafted from the finest woods and reinforced with sturdy metal bindings. Its sleek design and sharp edges are reminiscent of splintered shards of wood. With its fast draw and deadly precision, this bow is a formidable force on the battlefield.", "rare", 132),
    new weaponInfo("Vulture", "weapon", "bow", ["crafting", "chest"], "<:vulture:1063549525463146577>", "https://i.imgur.com/ky6mwZK.png", "atk", 22, 383, "atk%", 0.02, 0.13, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.def = Math.floor(eStats.def * 0.8);
        ebuff.def.push(new buffInfo("*", 0.8, 4));
    }, "Decreases enemy DEF by **20%** at the start of battle, lasting 4 rounds.", "The Vulture is crafted from the bones of a vulture and imbued with the bird's keen sense of death and decay. Its arrows are tipped with a deadly poison, capable of felling even the strongest of foes. Those who wield the Vulture bow are feared by all, as death follows closely behind every shot.", "rare", 133),
    new weaponInfo("Windlass", "weapon", "bow", ["crafting", "chest"], "<:windlass:1063549529955246170>", "https://i.imgur.com/yJ8HZfO.png", "atk", 26, 409, "cd", 0.05, 0.24, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk *= 2;
    }, "Has twice the ATK during the first round of the battle.", "The Windlass is a weapon of unmatched speed and precision. With a simple pull of its string, the bow unleashes a flurry of arrows that cut through the air like a gust of wind. It is a favored tool of hunters and archers alike, and its name is whispered with respect and admiration.", "rare", 134),

    // Weapons - Rare Bow
    new weaponInfo("Brocach", "weapon", "lance", ["crafting", "chest"], "<:brocach:1063572421032030258>", "https://i.imgur.com/zkoPEYA.png", "atk", 25, 416, "def", 8, 78, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def = Math.floor(myStats.def * 1.3);
        mybuff.def.push(new buffInfo("*", 1.3, 3));
    }, "Increases DEF by **30%** at the start of battle, lasting 3 rounds.", "The Brocach lance is a fierce weapon, imbued with the strength and determination of the ancient Irish warriors who wielded it. Its sharp, shining blade is a symbol of courage and defiance, striking fear into the hearts of all who dare to stand in its way. With each swing, the Brocach lance roars to life, calling forth the spirits of the past to aid its wielder in battle. Those who face it in combat must be prepared for a fierce and relentless fight, for the Brocach lance is a weapon that knows no mercy.", "rare", 135),
    new weaponInfo("Fiodoir", "weapon", "lance", ["crafting", "chest"], "<:fiodoir:1063572426757242911>", "https://i.imgur.com/Rf7C3r7.png", "md", 24, 410, "cd", 0.05, 0.26, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cd += 0.2;
        mybuff.cd.push(new buffInfo("+", 0.2, 3));
    }, "Increases crit damage by **20%** at the start of battle, lasting 3 rounds.", "With its gleaming steel tip and intricately carved handle, the Fiodoir is a weapon fit for a true knight. Its name, meaning \"champion\" in the ancient tongue, has been earned through countless battles and duels. Wielded by the bravest of warriors, this lance strikes fear into the hearts of its enemies and inspires loyalty in its wielder. May the Fiodoir continue to serve justice and victory on the battlefield.", "rare", 136),
    new weaponInfo("Knight's Spike", "weapon", "lance", ["crafting", "chest"], "<:knights_spike:1063572431450681474>", "https://i.imgur.com/0SXlRwF.png", "atk", 23, 378, "atk%", 0.04, 0.12, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk = Math.floor(myStats.atk * 0.8);
        mybuff.atk.push(new buffInfo("*", 0.85, 10, 0.05, "+"));
    }, "The wielder starts off with **80%** of his attack, and gains **+5%** every round for 10 rounds until it reaches **130%** before the buff fades away.", "Forged from the finest steel and imbued with the power of valor, the Knight's Spike is a lance worthy of only the bravest warriors. Its sharpened tip pierces even the strongest armor, making it the perfect weapon for a knight in battle. With this lance in hand, one can fearlessly charge into the fray and defend their kingdom with honor.", "rare", 137),
    new weaponInfo("Legionaire", "weapon", "lance", ["crafting", "chest"], "<:legionaire:1063572436072812754>", "https://i.imgur.com/Xefo7Yt.png", "atk", 24, 391, "dodge", 0.03, 0.1, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodge = 0.5;
        mybuff.cd.push(new buffInfo("=", 0.5, 2));
    }, "The wielder has **50%** dodge chance during the first 2 rounds.", "Once wielded by the brave soldiers of the ancient Roman Empire, the Legionaire lance strikes fear into the hearts of its enemies. With a sturdy, spear-like design and a sharp, glinting blade, this weapon was crafted to cut through armor and strike at the very core of the enemy ranks. In the hands of a skilled warrior, the Legionaire lance is a force to be reckoned with on the battlefield.", "rare", 138),
    new weaponInfo("Luin", "weapon", "lance", ["crafting", "chest"], "<:luin:1063572415751393290>", "https://i.imgur.com/orlF0Nv.png", "atk", 24, 406, "cr", 0.03, 0.11, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (eStats.def > eStats.mr) {
            eStats.def = Math.floor(eStats.def * 0.9);
            ebuff.def.push(new buffInfo("*", 0.9, 5));
        } else {
            eStats.mr = Math.floor(eStats.mr * 0.9);
            ebuff.mr.push(new buffInfo("*", 0.9, 5));
        };
    }, "Reduces either DEF or MR of enemy by **10%** for 5 rounds, depending on which one's bigger.", "The ancient lance, Luin, was forged by the elven smiths of old. It is said that its gleaming golden shaft was crafted from a single strand of the legendary tree of life, and its ornate hilt is adorned with intricate engravings of the elven gods. Its power is said to be unmatched, capable of striking down even the mightiest of foes. It is said that only the purest of hearts may wield Luin, for it will reject any who seek to use its power for evil.", "rare", 139),
    new weaponInfo("Moonpiercer", "weapon", "lance", ["crafting", "chest"], "<:moonpiercer:1063573738949455932>", "https://i.imgur.com/I7DToWd.png", "atk", 25, 421, "cd", 0.04, 0.25, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr += 0.12;
        if (myStats.cr > 1) myStats.cr = 1;
        mybuff.cr.push(new buffInfo("+", 0.12, 3));
    }, "Increases crit rate by **12%** at the start of battle, lasting 3 rounds.", "The Moonpiercer lance is crafted from the finest silver, imbued with the power of the full moon. Its sharp tip can pierce through even the toughest armor, leaving a trail of silver light in its wake. In the hands of a skilled wielder, the Moonpiercer becomes a weapon of unparalleled grace and deadly precision.", "rare", 140),
    new weaponInfo("Ravager of the Forest", "weapon", "lance", ["crafting", "chest"], "<:ravager_of_the_forest:1063573742787252255>", "https://i.imgur.com/AMQVJmm.png", "atk", 26, 423, "hp", 20, 226, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.04), 5));
    }, "The wielder heals **4%** of max HP every round, lasting 5 rounds.", "The Ravager of the Forest is a powerful lance, capable of tearing through even the toughest of trees with ease. Its sharp edges are imbued with a fierce, primordial energy, imbuing its wielder with the strength to lay waste to entire forests. Those who dare to cross its path are met with a swift and brutal end, as the Ravager of the Forest leaves nothing but destruction in its wake.", "rare", 141),
    new weaponInfo("Sleibhteach", "weapon", "lance", ["crafting", "chest"], "<:sleibhteach:1063573744951496784>", "https://i.imgur.com/Q3x2f6n.png", "atk", 25, 419, "md", 24, 408, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mdChance = 0.33;
    }, "The wielder has a **33%** chance of dealing magic damage.", "Sleibhteach, the mountain-piercer, is a weapon crafted from golden steel and imbued with the power of earth. Its sharp edge cuts through armor and bone with ease, allowing its wielder to strike with precision and force. Some say it is the lance of the gods, gifted to a chosen few to vanquish their enemies and conquer new heights.", "rare", 142),
    new weaponInfo("Spinefall", "weapon", "lance", ["crafting", "chest"], "<:spinefall:1063573748843819048>", "https://i.imgur.com/XN308w0.png", "atk", 28, 429, "mr", 8, 83, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.br += 0.15;
        if (myStats.br > 1) myStats.br = 1;
        mybuff.br.push(new buffInfo("+", 0.15, 7));
    }, "Increases the wielders block rate by **15%** at the start of battle, lasting 7 rounds.", "The lance known as Spinefall is a weapon to be feared on the battlefield. Its sharp, slender tip can pierce through armor and shields with ease, delivering a devastating blow to any who stand in its path. In the hands of a skilled warrior, Spinefall is a formidable weapon that strikes fear into the hearts of its enemies.", "rare", 143),
    new weaponInfo("Windpiercer", "weapon", "lance", ["crafting", "chest"], "<:windpiercer:1063573753109426246>", "https://i.imgur.com/vhsQdfL.png", "atk", 26, 423, "md%", 0.04, 0.13, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.dodge -= 0.1;
        if (eStats.dodge < 0) eStats.dodge = 0;
        ebuff.dodge.push(new buffInfo("+", -0.1, 6));
    }, "Decreases enemy dodge chance by **10%** at the start of battle, lasting 6 rounds.", "With a swift thrust, the Windpiercer pierces through the air, cutting through any obstacles in its path. Its sharp tip and slender design allow it to move with the speed and precision of the wind itself. In the hands of a skilled warrior, the Windpiercer is a weapon to be feared and respected.", "rare", 144),

    // Weapons - Rare Dagger
    new weaponInfo("Agatha", "weapon", "dagger", ["crafting", "chest"], "<:agatha:1063819880681439292>", "https://i.imgur.com/WKNi3wD.png", "atk", 26, 426, "atk%", 0.03, 0.12, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.def = Math.floor(eStats.def * 0.9);
        ebuff.def.push(new buffInfo("*", 0.9, 5));
    }, "Reduces enemy DEF by **10%** at the start of battle, lasting 5 rounds.", "Agatha is a small but deadly weapon, favored by knights and adventurers for its sleek design and deadly efficiency. Its sharp, pointed blade glistens in the light, thirsting for the taste of enemy blood. With Agatha in hand, one can strike swiftly and silently, delivering a quick and lethal blow to any unsuspecting victim.", "rare", 145),
    new weaponInfo("Baleful Harvest", "weapon", "dagger", ["crafting", "chest"], "<:baleful_harvest:1063819884112379965>", "https://i.imgur.com/LzbBkcy.png", "atk", 27, 422, "mana", 5, 25, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mg += 3;
        mybuff.mg.push(new buffInfo("+", 3, 5));
    }, "Increases mana generation by **+3**💧at the start of battle, lasting 5 rounds.", "The Baleful Harvest is a cursed dagger that feeds on the souls of its victims. Those who wield it are consumed by a thirst for power and a hunger for death. It whispers dark promises of strength and riches, tempting its wielder to give in to its evil influence. Those who succumb to its temptations are driven mad and become slaves to its will. It has claimed countless lives over the centuries and its legend continues to grow with each soul it consumes. Wield the Baleful Harvest at your own peril.", "rare", 146),
    new weaponInfo("Blacktalon", "weapon", "dagger", ["crafting", "chest"], "<:blacktalon:1063819887119695983>", "https://i.imgur.com/3IENE8O.png", "atk", 24, 403, "cr", 0.03, 0.12, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.hp.push(new buffInfo("+", -Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.02), 5));
    }, "The Blacktalon will cause bleeding to your opponent, dealing **10%** of your enemies HP as damage over 5 rounds. If enemy HP is more than twice of your own HP, it will deal 20% of your own HP as damage instead.", "Forged in the depths of the Shadow Realm, Blacktalon is a weapon of pure darkness. Its razor-sharp blade glints menacingly in the dim light, thirsting for the taste of blood. Those who dare to wield it are granted a deadly precision, striking fear into the hearts of their enemies. But beware, for Blacktalon's power comes at a price, beckoning its wielder to succumb to the shadows.", "rare", 147),
    new weaponInfo("Crescent Blade", "weapon", "dagger", ["crafting", "chest"], "<:crescent_blade:1063819891578257478>", "https://i.imgur.com/50PAWrZ.png", "md", 26, 419, "mr", 8, 78, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mr = Math.floor(myStats.mr * 1.2);
        myStats.def = Math.floor(myStats.def * 0.9);
        mybuff.mr.push(new buffInfo("*", 1.2, 6));
        mybuff.def.push(new buffInfo("*", 0.9, 6));
    }, "Increases magic resistance by **20%**, decreases defense by **10%** at the start of battle, lasting 6 rounds.", "The Crescent Blade is a wickedly curved dagger that glints in the light like a crescent moon. As it is wielded by skilled hands, its curved blade seems to dance and shimmer with a life of its own. With the Crescent Blade in your grasp, you can strike fear into the hearts of your foes and carve a path of destruction through the battlefield.", "rare", 148),
    new weaponInfo("Fastidious Filet", "weapon", "dagger", ["crafting", "chest"], "<:fastidious_filet:1063819877187604581>", "https://i.imgur.com/AOxOrwG.png", "atk", 24, 410, "md", 23, 398, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.md = Math.floor(myStats.md * 1.12);
        mybuff.md.push(new buffInfo("*", 1.12, 5));
    }, "Increases magic damage by **12%** at the start of battle, lasting 5 rounds.", "The Fastidious Filet is a weapon wielded by those who demand precision and perfection in their attacks. Its razor-sharp edge effortlessly slices through even the toughest of hides, leaving behind perfectly clean and precise cuts. Its elegant design belies its deadly efficiency, making it a favorite among assassins and cunning duelists alike.", "rare", 149),
    new weaponInfo("Gravekeeper", "weapon", "dagger", ["crafting", "chest"], "<:gravekeeper:1063821281457360931>", "https://i.imgur.com/vaZIiyV.png", "atk", 23, 403, "cd", 0.05, 0.22, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr += 0.15;
        if (myStats.cr > 1) myStats.cr = 1;
        mybuff.cr.push(new buffInfo("+", 0.15, 4));
    }, "Increases crit rate by **15%** at the start of battle, lasting 4 rounds.", "The Gravekeeper is a deadly weapon wielded by those who tend to the dead. Its blade is sharpened on the bones of fallen warriors, imbuing it with a dark power that can strike fear into the hearts of even the bravest of foes. In the hands of a skilled assassin, the Gravekeeper is a tool of death and destruction, capable of striking down enemies with swift and deadly precision. Those who cross its path do so at their own peril, for the Gravekeeper is a relentless guardian of the dead, and it will not rest until its mission is complete.", "rare", 150),
    new weaponInfo("The Carver", "weapon", "dagger", ["crafting", "chest"], "<:the_carver:1063821284573720667>", "https://i.imgur.com/BfC3Lub.png", "atk", 20, 362, "cd", 0.07, 0.29, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.hp.push(new buffInfo("+", Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.02), 4));
    }, "The Carver will cause bleeding to your opponent, dealing **8%** of your enemies HP as damage over 4 rounds.", "The Carver is a small but deadly blade, perfect for precision strikes and carving through monster skin. Its sharp bronze, curved edge glints in the light, beckoning to be used by those with a skilled hand and a thirst for blood. Be careful not to let it slip, for once it finds its mark, there is no going back.", "rare", 151),
    new weaponInfo("The Eviscerator", "weapon", "dagger", ["crafting", "chest"], "<:the_eviscerator:1063821287790755933>", "https://i.imgur.com/qmJTD08.png", "atk", 25, 416, "dodge", 0.03, 0.11, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.dodge -= 0.12;
        if (eStats.dodge < 0) eStats.dodge = 0;
        ebuff.dodge.push(new buffInfo("+", -0.12, 4));
    }, "Decreases enemy dodge chance by **12%** at the start of battle, lasting 4 rounds.", "The Eviscerator is not for the faint of heart. Its razor-sharp blade glistens with the blood of its victims, promising swift and brutal death to all who dare cross its path. Only the bravest warriors wield this deadly weapon, using it to carve through flesh and bone with brutal precision. Beware the Eviscerator, for it is a tool of death and misery.", "rare", 152),
    new weaponInfo("Tombthief", "weapon", "dagger", ["crafting", "chest"], "<:tombthief:1063821291750178866>", "https://i.imgur.com/Z7aahO5.png", "atk", 18, 309, "atk", 10, 232, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.atk = 0;
    }, "Your enemy has 0 ATK during the first round.", "The Tombthief is said to have been wielded by a notorious grave robber who plundered the tombs of the ancient kings. Its sharp blade is rumored to have been cursed by the spirits of the deceased, bringing swift death to those who dare to wield it in the pursuit of greed and treasure.", "rare", 153),
    new weaponInfo("Wit of Fallen Souls", "weapon", "dagger", ["crafting", "chest"], "<:wit_of_fallen_souls:1063821294593900544>", "https://i.imgur.com/T93UeOl.png", "atk", 23, 411, "def", 7, 74, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.br += 0.1;
        if (myStats.br > 1) myStats.br = 1;
        mybuff.br.push(new buffInfo("+", 0.1, 5));
    }, "Increases the wielders block rate by **10%** at the start of battle, lasting 5 rounds.", "The Wit of Fallen Souls is a weapon feared by all who know of its dark power. Once a simple iron dagger, it has trapped the souls of countless warriors, driving its wielders to madness and destruction. Those who dare to hold it are consumed by its malevolent whispers, becoming nothing more than puppets in its quest for domination. Beware the Wit of Fallen Souls, for it is a weapon of untold power and corruption.", "rare", 154),

    // Weapons - Rare Shield
    new weaponInfo("Call of the Gladiator", "weapon", "shield", ["crafting", "chest"], "<:call_of_the_gladiator:1064238702592798851>", "https://i.imgur.com/Am8ydch.png", "shield", 46, 621, "md", 9, 126, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mr = Math.floor(eStats.mr * 0.88);
        ebuff.mr.push(new buffInfo("*", 0.88, 4));
    }, "Decreases magic resistance of enemy by **12%** at the start of battle, lasting 4 rounds.", "The shield bears the scars of countless battles, each one a testament to the skill and determination of its owner. As you hold it aloft, the faint echo of cheering crowds and clashing steel fills your ears, urging you to stand tall and fight like a true gladiator. With Call of the Gladiator by your side, you are ready to take on any challenge that comes your way.", "rare", 155),
    new weaponInfo("Ceincyr", "weapon", "shield", ["crafting", "chest"], "<:ceincyr:1064238707445612624>", "https://i.imgur.com/6KKMXYR.png", "shield", 40, 592, "mr", 8, 76, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mr = Math.floor(myStats.mr * 1.16);
        mybuff.mr.push(new buffInfo("*", 1.16, 5));
    }, "Increases magic resistance by **16%** at the start of battle, lasting 5 rounds.", "This shining shield is decorated of pure, unblemished silver. It is said to have been crafted by the greatest artisans in the land, and it is imbued with powerful magic. Its surface glows with a holy light, and it is able to deflect even the darkest of spells.", "rare", 156),
    new weaponInfo("Dragon's Bite", "weapon", "shield", ["crafting", "chest"], "<:dragons_bite:1064238710738129066>", "https://i.imgur.com/QJIfskN.png", "shield", 43, 615, "atk%", 0.03, 0.11, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def = Math.floor(myStats.def * 0.9);
        myStats.mr = Math.floor(myStats.mr * 0.9);
        mybuff.def.push(new buffInfo("*", 0.9, 9999));
        mybuff.mr.push(new buffInfo("*", 0.9, 9999));
    }, "The wielder has **10%** decreased defense and magic resistance.", "Forged from the scales of a mighty dragon, the Dragon's Bite shield is imbued with the beast's powers. Its intimidating design strikes fear into the hearts of those who dare to face it in battle. With the protection of this shield, even the fiercest dragon's bite will be rendered useless.", "rare", 157),
    new weaponInfo("Dragon's Fang", "weapon", "shield", ["crafting", "chest"], "<:dragons_fang:1064239159780327444>", "https://i.imgur.com/Crki8kB.png", "shield", 49, 643, "atk", 10, 133, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mg += 2;
        mybuff.mg.push(new buffInfo("+", 2, 10));
    }, "Increases the wielders mana generation by **+2** at the start of battle, lasting 10 rounds.", "The Dragon's Fang shield is crafted from the sharpened tooth of a fierce dragon, capable of tearing through even the toughest armor, making it a valuable tool in the hands of a skilled warrior. As the shield is raised in defense, its jagged edge glimmers in the light, ready to strike fear into the hearts of those foolish enough to challenge its wielder.", "rare", 158),
    new weaponInfo("Greal", "weapon", "shield", ["crafting", "chest"], "<:greal:1064239890449055775>", "https://i.imgur.com/W7xdblX.png", "shield", 38, 511, "shield", 16, 227, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def *= 2;
        mybuff.def.push(new buffInfo("*", 2, 3));
    }, "The wielder has **200%** of his defense during the first 3 rounds.", "This graceful shield is made of lightweight wood and reinforced with steel. It is said to have been wielded by the greatest knights of the kingdom. It is the perfect defense for a quick and agile fighter.", "rare", 159),
    new weaponInfo("Howling Barrier", "weapon", "shield", ["crafting", "chest"], "<:howling_barrier:1064239899735236698>", "https://i.imgur.com/0H2j5K4.png", "shield", 44, 621, "dodge", 0.02, 0.1, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mr *= 2;
        mybuff.mr.push(new buffInfo("*", 2, 3));
    }, "The wielder has **200%** of his magic resistance during the first 3 rounds.", "As you raise the Howling Barrier before you, the sound of a thousand howling wolves fills the air. Its metallic surface ripples with a primal energy, ready to deflect any attack and protect you from harm. The howls grow louder and more fierce the more damage it absorbs, a testament to the shield's unyielding power. With the Howling Barrier at your side, you are ready to face any challenge.", "rare", 160),
    new weaponInfo("Laconian Guard", "weapon", "shield", ["crafting", "chest"], "<:laconian_guard:1064240368855552161>", "https://i.imgur.com/2DmQRZ5.png", "shield", 52, 644, "cr", 0.02, 0.11, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk = Math.floor(myStats.atk * 1.1);
        mybuff.atk.push(new buffInfo("*", 1.1, 9999));
        myStats.mg -= 2;
        mybuff.mg.push(new buffInfo("+", -2, 9999));
    }, "Permanently Increases ATK by **10%** at the cost of **-2**💧 per round.", "The Laconian Guard is a shield that has been handed down through generations of Laconian warriors. It was forged by the finest blacksmiths in the land, and its intricate designs pay homage to the gods and warriors of Laconia's past. Those who wield this shield are known for their unwavering courage and unbreakable spirit.", "rare", 161),
    new weaponInfo("Lumber Wall", "weapon", "shield", ["crafting", "chest"], "<:lumber_wall:1064240376896028742>", "https://i.imgur.com/yz8YeaT.png", "shield", 51, 657, "def", 12, 84, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk = Math.floor(myStats.atk * 1.1);
        mybuff.atk.push(new buffInfo("*", 1.1, 9999));
        myStats.md = Math.floor(myStats.md * 0.9);
        mybuff.md.push(new buffInfo("*", 0.9, 9999));
    }, "Permanently Increases ATK by **10%** at the cost of decreasing magic damage by **10%**.", "The Lumber Wall shield is made from the strongest and sturdiest wood, crafted by the finest woodworkers in the land. It is both flexible and sturdy, able to withstand powerful blows. In the heat of battle, it becomes a bastion of defense, protecting its wielder from harm and allowing them to stand strong against their foes.", "rare", 162),
    new weaponInfo("Reforged", "weapon", "shield", ["crafting", "chest"], "<:reforged:1064240750902128821>", "https://i.imgur.com/M5zbadL.png", "shield", 52, 663, "mr", 12, 84, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.lootm += 0.1;
    }, "Increases coins earned from the dungeon by **10%**.", "Once a nameless battered and broken shield, the Reforged has been reforged and strengthened, imbued with the power of its former owners' determination and courage. It now serves as a symbol of resilience and protection, ready to withstand even the fiercest of battles.", "rare", 163),
    new weaponInfo("Treeborn Sentinel", "weapon", "shield", ["crafting", "chest"], "<:treeborn_sentinel:1064240755591360653>", "https://i.imgur.com/X1m1gWv.png", "shield", 40, 535, "hp", 22, 184, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def = Math.floor(myStats.def * 0.75);
        myStats.mr = Math.floor(myStats.mr * 1.2);
        mybuff.def.push(new buffInfo("*", 0.75, 9999));
        mybuff.mr.push(new buffInfo("*", 1.2, 9999));
    }, "The wielder has **20%** increased magic resistance, but **25%** decreased defense.", "The Treeborn Sentinel is a sturdy shield crafted from the bark of a centuries-old oak tree. Embedded with the essence of the forest itself, it empowers the wielder with the strength and resilience of nature. The shield is a faithful guardian, protecting its bearer from harm and striking fear into the hearts of those who dare to harm the wilds.", "rare", 164),
    new weaponInfo("Woeful Buffer", "weapon", "shield", ["crafting", "chest"], "<:woeful_buffer:1064240762759422092>", "https://i.imgur.com/SkCm2kZ.png", "shield", 49, 647, "mana", 4, 25, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.hp = Math.floor(myStats.hp * 0.8);
        myStats.mg += 3;
        mybuff.mg.push(new buffInfo("+", 3, 20));
    }, "The wielder starts with **80%** HP, but gets **+3** mana per round for a maximum of 20 rounds.", "The Woeful Buffer was once a proud shield, gleaming in the sunlight and protecting its wielder from countless battles. But over time, it has become battered and worn, its once shiny surface now marred by countless dents and scratches. Despite its woeful appearance, the shield remains steadfast, defending its owner dangers.", "rare", 165),

    // Weapons - Unique Sword
    new weaponInfo("Anglachel", "weapon", "sword", ["crafting", "chest"], "<:anglachel:1066855443290411048>", "https://i.imgur.com/op2Vwm0.png", "atk", 36, 592, "def", 20, 83, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def *= 1.1;
        mybuff.def.push(new buffInfo("*", 1.1, 9999));
        myStats.mg += 5;
        mybuff.mg.push(new buffInfo("+", 5, 4));
    }, "The wielder has **10%** increased defense. Get **+5** mana per round during the first 4 rounds.", "Anglachel was a blade of unmatched power and beauty, crafted by the great elven smith Eöl in the days of old. Its blade was forged from a single piece of black meteoric iron, and was said to be unbreakable and sharp enough to cut through even the strongest armor. In the hands of the right warrior, it was said to be able to fell even the mightiest of foes. Legend has it that the great warrior Beowulf wielded Anglachel in his final battle against the demon Grendel, and that its power was so great that it was able to strike down the beast with a single, mighty blow.", "unique", 166),
    new weaponInfo("Ascalon", "weapon", "sword", ["crafting", "chest"], "<:ascalon:1066855448210329751>", "https://i.imgur.com/0mZOIu8.png", "atk", 30, 547, "atk%", 0.04, 0.15, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr += 0.2;
        if (myStats.cr > 1) myStats.cr = 1;
        mybuff.cr.push(new buffInfo("+", 0.2, 8));
    }, "The wielder has **20%** increased crit rate during the first 8 rounds of the battle.", "Ascalon is a legendary sword, forged in the heat of a thousand burning suns. Its blade is as sharp as the teeth of a dragon, and its hilt is encrusted with precious gems that glimmer in the light. The sword is said to have been wielded by a great hero who battled against the forces of darkness, and it has been passed down through the ages as a symbol of courage and valor. Those who hold Ascalon in their hands are filled with a sense of power and righteousness, and they are said to be able to strike down their enemies with ease.", "unique", 167),
    new weaponInfo("Bloodletter", "weapon", "sword", ["chest"], "<:bloodletter:1066855451272159293>", "https://i.imgur.com/Cj1VyVp.png", "atk", 33, 578, "cr", 0.04, 0.14, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.critbleed = true;
        matchStats.critbleedlast = 2;
    }, "Critical Strikes cause bleeding, dealing **3%** damage to the enemy for 2 rounds.", "The Bloodletter was said to have been cursed by a vengeful witch, who imbued it with the power to draw the life force from those it strikes. Many knights have wielded the Bloodletter, but all have eventually been consumed by its power, becoming ruthless, bloodthirsty warriors.", "unique", 168),
    new weaponInfo("Brionac's Bane", "weapon", "sword", ["chest"], "<:brionacs_bane:1066855431533768744>", "https://i.imgur.com/iAHtOiN.png", "atk", 56, 688, "cd", 0.08, 0.4, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("*", 0.96, 9999));
    }, "This sword poisons the wielder, making them lose **4%** HP after every round.", "Brionac's Bane is a legendary sword imbued with poison. It is said to be forged in the depths of the deadliest otherworldly swamps and can corrode even the toughest of monsters. It was wielded by the hero Brionac in his fight against evil, but was lost after his betrayal and death. The sword is said to still exist, waiting for a new hero to wield it.", "unique", 169),
    new weaponInfo("Dainsleif", "weapon", "sword", ["chest"], "<:dainsleif:1066858376585285663>", "https://i.imgur.com/w96701M.png", "atk", 36, 605, "mg", 1, 5, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mana += 50;
        myStats.sm += 10;
    }, "Increases the wielders mana cap by **+50**. Start the battle with **+10** mana.", "The legendary sword Dainsleif, passed down through the ages and wielded by only the most worthy warriors, is said to be cursed. Those who draw the blade are doomed to suffer a fate worse than death, as the sword compels its wielder to kill until it is satisfied. Its thirst for blood is insatiable, making it a weapon to be feared by even the bravest of men.", "unique", 170),
    new weaponInfo("Devil's Claw", "weapon", "sword", ["chest"], "<:devils_claw:1066858381933023332>", "https://i.imgur.com/tNok8En.png", "atk", 32, 572, "cd", 0.04, 0.3, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.hp -= Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.1);
        ebuff.hp.push(new buffInfo("+", -Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.01), 10));
    }, "The enemy starts with **90%** HP, and loses another **10%** in the following 10 rounds. If the enemy has more than twice of your HP, the enemy starts with **20%** less of your own HP and deals another **20%** of your own HP as damage over 10 rounds.", "The Devil's Claw glows with a sinister light, leaving a trail of death in its wake whenever it slices through the air. Its razor-sharp edge is capable of slicing through the strongest of armor, and its unique looking hilt is said to be made with the remains of the devil himself. It is a weapon feared by all who behold it, for it is the favored weapon of the darkest of fiends.", "unique", 171),
    new weaponInfo("Flamberge", "weapon", "sword", ["crafting", "chest"], "<:flamberge:1066858387922501724>", "https://i.imgur.com/oUbBuvG.png", "atk", 32, 569, "dodge", 0.02, 0.11, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk = Math.floor(myStats.atk * 1.5);
        mybuff.atk.push(new buffInfo("*", 1.5, 30, -0.05, "+"));
    }, "The wielder starts with **150%** of their attack, but lose **5%** each round.", "Flamberge is a sword of legend, forged with the flames of a thousand fallen stars. With its twisted blade and a shimmering fiery light, Flamberge is a weapon fit for any upstarting hero. In the hands of a skilled warrior, Flamberge is a weapon not to be underestimated.", "unique", 172),
    new weaponInfo("Fragarach", "weapon", "sword", ["crafting", "chest"], "<:fragarach:1066858374337138769>", "https://i.imgur.com/StBvtMZ.png", "atk", 36, 592, "mr", 20, 83, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr * 0.1), 9999));
        myStats.mr += Math.floor(myStats.mr * 0.1);
        myStats.mg += 5;
        mybuff.mg.push(new buffInfo("+", 5, 4));
    }, "The wielder has **10%** increased magic resistance. Get **+5** mana per round during the first 4 rounds.", "Forged in the fires of the underworld, Fragarach is a sword like no other. Its sharp, deadly blade is imbued with dark magic, capable of cutting through even the strongest armor with ease. Those who wield it are said to be able to strike fear into the hearts of their enemies, instilling a sense of dread with every swing. But be warned, for with great power comes great responsibility - those who misuse Fragarach will be consumed by its dark power.", "unique", 173),
    new weaponInfo("Hyumilis", "weapon", "sword", ["crafting", "chest"], "<:hyumilis:1066859975474942123>", "https://i.imgur.com/h3mPqBr.png", "atk", 36, 573, "mr", 22, 92, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.cr -= 0.4;
        if (eStats.cr < 0) eStats.cr = 0;
        ebuff.cr.push(new buffInfo("+", -0.4, 5));
        eStats.cd -= 0.4;
        if (eStats.cd < 0) eStats.cd = 0;
        ebuff.cd.push(new buffInfo("+", -0.4, 5));
    }, "Decreases enemy crit rate by **40%**, crit damage by **40%** at the start of battle, lasting 5 rounds.", "The Hyumilis glimmers in the sunlight, its finely crafted blade honed to perfection. With its deadly sharp edge and balanced weight, the Hyumilis is a weapon to be feared on the battlefield. Those who have faced it in combat speak of its ability to strike with incredible speed and precision. It is a sword fit for a true warrior, one who values skill and precision above all else.", "unique", 174),
    new weaponInfo("Joyeuse", "weapon", "sword", ["crafting", "chest"], "<:joyeuse:1066859978712940575>", "https://i.imgur.com/UgMECv5.png", "atk", 30, 722, "cd", 0.09, 0.42, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // NO BUFF
    }, "None", "Joyeuse was the celebrated sword of Charlemagne who ruled in the Middle Ages. Said to have been crafted by the fairy king Wayland, Joyeuse was a weapon of incredible power, imbued with magic and imbued with the light of the sun. In battle, it is said to have glowed with a dazzling radiance, striking fear into the hearts of enemies and inspiring his troops to victory. Those who were struck by Joyeuse were said to have been instantly vanquished, their armor and weapons reduced to dust by the sword's incredible power. It is a weapon of legend, a symbol of Charlemagne's might and the embodiment of his unbreakable spirit.", "unique", 175),
    new weaponInfo("Kilineiram", "weapon", "sword", ["crafting", "chest"], "<:kilineiram:1066859983809024000>", "https://i.imgur.com/gg6A2DG.png", "md", 34, 582, "md%", 0.03, 0.12, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodge += 0.06;
        mybuff.dodge.push(new buffInfo("+", 0.06, 9999));
        myStats.mdChance += 1;
    }, "This sword turns all attacks of the wielder into magic damage. Increases dodge chance by **+6%**.", "Kilineiram, also known as the \"Shining Blade of the Sky,\" was crafted by the greatest dwarven smiths of the mountains. Its razor-sharp edge is imbued with the power of the thundering storms, allowing it to strike with the force of a tempest. In the hands of a skilled warrior, Kilineiram is a weapon to be feared on the battlefield.", "unique", 176),
    new weaponInfo("Marauder", "weapon", "sword", ["crafting", "chest"], "<:marauder:1066859971427446874>", "https://i.imgur.com/EHNdA8N.png", "atk", 30, 500, "atk", 20, 160, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 6));
        myStats.atk = Math.floor(myStats.atk * 1.2);
    }, "The wielder has **20%** increased attack during the first 6 rounds.", "The Marauder sword is a formidable weapon, crafted from the finest steel. Its sharp blade slices through enemies with ease, leaving a trail of destruction in its wake. With each swing, the Marauder's bloodthirsty howl fills the air, striking fear into the hearts of all who dare to stand in its path. This is a weapon worthy of only the most skilled and ruthless warriors.", "unique", 177),
    new weaponInfo("Mournblade", "weapon", "sword", ["crafting", "chest"], "<:mournblade:1066861429841461329>", "https://i.imgur.com/PJ0UiwC.png", "atk", 34, 570, "mr", 18, 96, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.mr * 0.7), 9999));
        mybuff.def.push(new buffInfo("+", Math.floor(myStats.mr * 0.3), 9999));
        mybuff.mr.push(new buffInfo("=", 0, 9999));
        myStats.atk += Math.floor(myStats.mr * 0.7);
        myStats.def += Math.floor(myStats.mr * 0.3);
        myStats.mr = 0;
    }, "Converts **70%** of the wielders magic resistance into attack, **30%** into defense. The wielder has no magic resistance.", "The Mournblade cuts through the air with a sorrowful whisper, as if it mourns the destruction it brings. Those who wield it speak of a heaviness in their hands, as if the sword itself carries the weight of all the lives it has taken. Those who face it in battle are said to feel a chill down their spine, as if the Mournblade feeds on their fear and grief. Forged in the depths of despair, the Mournblade is a weapon of death and mourning.", "unique", 178),
    new weaponInfo("Nethersbane", "weapon", "sword", ["chest"], "<:nethersbane:1066861436191658016>", "https://i.imgur.com/aDW3yPR.png", "atk", 35, 622, "br", 0.03, 0.15, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodge -= 0.08;
        if (myStats.dodge < 0) myStats.dodge = 0;
        mybuff.dodge.push(new buffInfo("+", -0.08, 9999));
        eStats.br -= 0.12;
        if (eStats.br < 0) eStats.br = 0;
        ebuff.br.push(new buffInfo("+", -0.12, 9999));
    }, "Decreases the wielders dodge chance by **8%**, but also decreases the opponents block rate by **12%**.", "Nethersbane was forged in the fiery depths of the underworld, its shimmering steel imbued with the power to banish the denizens of the nether realm. Its edge is sharp enough to cut through even the toughest of demonic hides, and its hilt is carved with ancient wards to protect its wielder from the corrupting influence of the nether. Those who wield Nethersbane are feared by the forces of darkness, for it is the bane of their existence.", "unique", 179),
    new weaponInfo("Radiant Dawn", "weapon", "sword", ["chest"], "<:radiant_dawn:1066861440176238592>", "https://i.imgur.com/kliCxRG.png", "atk", 34, 577, "hp", 80, 255, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("*", 1.03, 9999));
        mybuff.mg.push(new buffInfo("+", 2, 9999));
    }, "The wielder heals **3%** HP and gets **+2** mana after every round.", "Radiant Dawn is a sword of legend, crafted by the ancient elves of the forest. It is said that the blade was imbued with the power of the sun, and glows with a golden light when drawn from its sheath. Some say that the blade has the power to banish evil and bring light to the darkest of places. The song of the sword can be heard on the dawn of every new day, as if it is calling out to those in need of its protection.", "unique", 180),
    new weaponInfo("Safarlisia", "weapon", "sword", ["crafting", "chest"], "<:safarlisia:1066861424367915028>", "https://i.imgur.com/IrOKzrX.png", "atk", 38, 611, "mg", 1, 4, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mg -= 5;
        if (eStats.mg < 0) eStats.mg = 0;
    }, "Decreases enemy mana generation by **-5** per round.", "Safarlisia, a legendary sword said to have been wielded by the great warrior queen Safarlisia herself. Crafted from the finest steel and imbued with ancient magic, this sword is as deadly as it is beautiful. Some say that the spirit of Safarlisia still lingers within the sword, lending its wielder incredible strength and skill in combat. Wield this sword with honor, for it is a true treasure worthy of only the bravest of heroes.", "unique", 181),
    new weaponInfo("Sssssssword of Ssssssssnek", "weapon", "sword", ["crafting", "chest"], "<:sssssssword_of_ssssssssnek:1066861510602793112>", "https://i.imgur.com/VmbU8fb.png", "atk", 31, 564, "cr", 0.04, 0.15, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.sm += Math.floor(eStats.sm * 0.5);
        eStats.sm -= Math.floor(eStats.sm * 0.5);
        myStats.mg += 1;
        eStats.mg -= 1;
        mybuff.mg.push(new buffInfo("+", 1, 9999));
        ebuff.mg.push(new buffInfo("+", -1, 9999));
    }, "This sly and sneaky sword steals half of the opponents starting mana, and **1** more each round.", "Crafted from the finest iron and imbued with the power of the serpent, the Sssssssword of Ssssssssnek is a weapon to be feared. Its sleek, green handle coils and writhes in the hand, ready to strike at any moment. In the hands of a skilled pirate, it can unleash devastating poison-based attacks, striking with deadly precision and leaving enemies writhing in agony. Beware the sssssssssnek's bite.", "unique", 182),
    new weaponInfo("Tyrfing", "weapon", "sword", ["crafting", "chest"], "<:tyrfing:1066861505804505159>", "https://i.imgur.com/7cbvFhf.png", "atk", 34, 568, "cr", 0.04, 0.17, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cd += 0.2;
        mybuff.cd.push(new buffInfo("+", 0.2, 9999));
    }, "The wielder has **20%** increased crit damage for the rest of battle", "Tyrfing was a sword crafted by the dark elves, imbued with a curse that condemned its wielder to a fate of destruction and tragedy. Despite its ominous origins, the blade was incredibly sharp and incredibly strong. Some say that the sword thirsts for blood, and will not stop until it has claimed the lives of all who stand before it.", "unique", 183),

    // Weapons - Unique Staff
    new weaponInfo("Amnesty", "weapon", "staff", ["crafting", "chest"], "<:amnesty:1066863266028081262>", "https://i.imgur.com/bzgu7Ka.png", "md", 37, 587, "mana", 5, 25, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mg += 3;
        mybuff.mg.push(new buffInfo("+", 3, 8));
    }, "The wielder gets **+3** mana during the first 8 rounds of the battle.", "Forged from the purest of metals and imbued with ancient magical energy, the staff known as Amnesty brings peace to those who wield it. Its gentle glow calms the troubled mind and soothes the troubled soul, granting absolution to those who seek it. In the hands of a true believer, the staff's power can mend even the most shattered of hearts.", "unique", 184),
    new weaponInfo("Bloodheart", "weapon", "staff", ["crafting", "chest"], "<:bloodheart:1066863272336310332>", "https://i.imgur.com/4w1EMB0.png", "md", 34, 580, "cd", 0.05, 0.33, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 5 === 0) {
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.1), {});
                if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
            };
        }, 9999));
    }, "This staff heals the wielder by **10%** of their max HP after every 5 rounds.", "The Bloodheart staff pulsates with a dark energy, its wooden shaft stained red with the blood of those who have fallen before its wielder. With the Bloodheart in hand, one can unleash devastating spells and dark magic upon their enemies, striking fear into their hearts and proving their strength as a true master of the arcane.", "unique", 185),
    new weaponInfo("Bloodstone Scepter", "weapon", "staff", ["chest"], "<:bloodstone_scepter:1066863276325093406>", "https://i.imgur.com/RUUQ7MA.png", "md", 34, 580, "cr", 0.04, 0.16, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp * 0.025), 9999));
    }, "The wielder has **15%** increased magic damage, but loses **2.5%** HP after every round.", "The Bloodstone Scepter is a powerful tool of magic, imbued with dark and ancient powers. Its surface is carved with intricate designs, and its handle is crafted from the finest bloodstone. Those who wield it can channel the power of the bloodstone, harnessing its dark magic to unleash devastating spells upon their enemies. But be warned - the scepter thirsts for blood, and those who use it too often may find themselves consumed by its dark powers.", "unique", 186),
    new weaponInfo("Boundless Blaze", "weapon", "staff", ["crafting", "chest"], "<:boundless_blaze:1066863280544567458>", "https://i.imgur.com/oz5w0fo.png", "md", 33, 568, "cd", 0.04, 0.3, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.1), 9999));
        myStats.md *= 2;
        eStats.dodge = 0;
    }, "During the very first round, the wielder has **200%** of their magic damage which can not be dodged. It can still be blocked. After that, the wielder gets a **10%** magic damage boost for the rest of battle.", "The Boundless Blaze staff is a fearsome weapon, imbued with the power of a thousand burning suns. With its fiery touch, it can scorch the earth and reduce foes to ash. Those who wield this staff are truly masters of flame, able to conjure up devastating infernos at will. In the heat of battle, the Boundless Blaze staff is a sight to behold, unleashing torrents of searing flames that can engulf entire armies. For those brave enough to wield its power, the Boundless Blaze staff is a weapon of unimaginable destruction.", "unique", 187),
    new weaponInfo("Crying Crystal", "weapon", "staff", ["crafting", "chest"], "<:crying_crystal:1066863377999200386>", "https://i.imgur.com/R6jidh4.png", "md", 34, 580, "cd", 0.05, 0.33, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.075), 9999));
        myStats.mg -= 5;
        if (myStats.mg < 0) myStats.mg = 0;
        mybuff.mg.push(new buffInfo("+", -5, 9999));
    }, "This staff heals the wielder by **7.5%** of their max HP at the cost of losing 5 mana per round.", "The Crying Crystal is a powerful arcane tool imbued with the tears of ancient wizards. Its clear, crystalline shaft glows with a faint, ethereal light, and the tears of magic that are embedded within it pulse with sorrow. When wielded by a skilled user, the Crying Crystal staff can unleash devastating spells and blasts of pure magical energy. But beware, for the staff's power comes at a price, and those who use it carelessly may find themselves consumed by its eldritch might.", "unique", 188),
    new weaponInfo("Cursed Scepter of Nosferatu", "weapon", "staff", ["chest"], "<:cursed_scepter_of_nosferatu:1066863383917383680>", "https://i.imgur.com/gjPhHKE.png", "md", 32, 566, "hp", 121, 367, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            let drain = Math.floor(myStats.maxhp * 0.01 * (2 + Math.min(8, Math.floor(matchStats.round / 4))));
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, drain, {});
            eStats.hp -= drain;
            if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
            if (eStats.hp < 0) eStats.hp = 0;
        }, 9999));
    }, "Drains the equivalent of **2%** of the wielders HP from the enemy and adds it to the wielder after each round. This number increases by **1%** every 4 rounds (up to a maximum of **10%**).", "The Cursed Scepter of Nosferatu is a powerful tool of dark magic, imbued with the essence of the legendary vampire himself. Those who wield it are said to gain immense power, but at a terrible cost. The scepter drains the life force of its wielder, slowly turning them into a creature of the night. Only the strongest and most determined can resist its corruption, but even they must tread carefully, lest they fall prey to its dark allure.", "unique", 189),
    new weaponInfo("Deflector of Hope", "weapon", "staff", ["crafting", "chest"], "<:deflector_of_hope:1066863389864906852>", "https://i.imgur.com/x3TzkoM.png", "md", 37, 586, "mg", 1, 5, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mg -= 2;
        eStats.mana -= 20;
        if (eStats.mg < 0) eStats.mg = 0;
        if (eStats.mana < 0) eStats.mana = 0;
        ebuff.mg.push(new buffInfo("+", -2, 9999));
    }, "Decreases the enemies max mana cap by **-20** mana and their mana generation by **-2**.", "The Deflector of Hope is a powerful weapon wielded by those who stand against the forces of despair. Its enchanted crystal core glows with a brilliant light, sending waves of positive energy outward to repel the darkness. In the hands of a skilled wielder, the staff can deflect even the strongest negative emotions, leaving hope and determination in its wake.", "unique", 190),
    new weaponInfo("Dreambinder", "weapon", "staff", ["chest"], "<:dreambinder:1066863395602710602>", "https://i.imgur.com/ZLx2lmP.png", "md", 38, 594, "sm", 1, 5, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp - myStats.hp), {});
        }, 3));
    }, "Heals the wielder back to 100% HP after each round for the first 3 rounds.", "With the Dreambinder staff in hand, the wielder has the power to manipulate the dreams of others. Those who sleep within the staff's reach are at the mercy of the Dreambinder's will, their dreams bending to serve their master's desires. But be warned, for those who defy the Dreambinder's control may find their own nightmares turning against them.", "unique", 191),
    new weaponInfo("Enchanted Wand of Eldrida", "weapon", "staff", ["crafting", "chest"], "<:enchanted_wand_of_eldrida:1066864139345072218>", "https://i.imgur.com/6XtJXRQ.png", "md", 35, 577, "md", 12, 134, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.md += Math.floor(myStats.md * 0.1);
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.1), 9999));
    }, "The wielders magic damage is increased by **10%** for the entire battle.", "The Enchanted Wand of Eldrida is an ancient staff that was once wielded by the powerful wizard Eldrida, who used its magical abilities to defend her kingdom against dark forces. It is said that the staff has the power to cast powerful spells and summon powerful magical creatures.", "unique", 192),
    new weaponInfo("Golden Serpent's Staff", "weapon", "staff", ["crafting", "chest"], "<:golden_serpents_staff:1066863583532679199>", "https://i.imgur.com/gGU8vWj.png", "md", 60, 732, "cr", 0.07, 0.23, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // NO BUFF
    }, "None", "The Golden Serpent's Staff is a powerful arcane tool wielded by the most skilled and cunning of spellcasters. Its gleaming golden body is intricately crafted with the shape of a serpent. With a single touch, the staff can channel the elemental power of fire, ice, and lightning, unleashing devastating spells upon the wielder's enemies. Those who dare to wield the Golden Serpent's Staff must be cautious, for its power comes with a price - the serpent's ever-watchful gaze will not hesitate to turn upon its own master if they fail to prove themselves worthy.", "unique", 193),
    new weaponInfo("Life's Lament", "weapon", "staff", ["chest"], "<:lifes_lament:1066863592642715688>", "https://i.imgur.com/ADG3wRV.png", "md", 32, 563, "hp", 58, 362, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("+", myStats.maxhp * 0.03, 9999));
        ebuff.hp.push(new buffInfo("+", -myStats.maxhp * 0.03, 9999));
    }, "Heals the wielder by **3%** of their max HP every round. The enemy loses the equivalent amount of HP.", "Life's Lament is a mysterious and powerful staff imbued with the essence of life itself. It is said to have been crafted by a group of powerful druids, who sought to create a weapon that could harness the power of nature and channel it into a single, devastating force. At its core glows a bright, pulsing red orb of pure life energy, which thrums with power and intensity. Those who wield Life's Lament are said to be able to channel the very essence of life itself, using it to heal the wounded and defend the innocent. But beware, for the power of Life's Lament comes with a heavy price. Those who use it recklessly or for selfish gain are said to be consumed by its power, becoming little more than empty husks, lost in the endless cycle of life and death.", "unique", 194),
    new weaponInfo("Peculiar Puck of Prestidigitation", "weapon", "staff", ["crafting", "chest"], "<:PeculiarPuckOfPrestidigitation:1066863573185331343>", "https://i.imgur.com/6a9B9A2.png", "md", 31, 569, "dodge", 0.02, 0.11, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(10, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.dodge.push(new buffInfo("+", 0.2, 9999));
        }));
    }, "Dodge rate increases by **+20%** if the wielder survives for 10 rounds.", "The Peculiar Puck of Prestidigitation is indeed a very peculiar weapon. In the hands of a skilled wielder, the staff is capable of unleashing a plethora of dazzling spells and illusions, confounding and bewildering those who dare to stand against it. Yet despite its great power, the Peculiar Puck retains a sense of whimsy and mischief, often delighting in mischievous pranks and playful trickery.", "unique", 195),
    new weaponInfo("Promise of the Lone Victor", "weapon", "staff", ["crafting", "chest"], "<:promise_of_the_lone_victor:1066864267292332134>", "https://i.imgur.com/gNChotY.png", "md", 33, 568, "mr", 28, 132, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mr = Math.floor(myStats.mr * 1.1);
        myStats.def = Math.floor(myStats.def * 1.1);
        mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr * 1.1), 9999));
        mybuff.def.push(new buffInfo("+", Math.floor(myStats.def * 1.1), 9999));
    }, "Increases the wielders defense and magic resistance by **10%** for the rest of battle.", "The Promise of the Lone Victor is a staff that radiates with the determination and strength of a single, triumphant hero. As it is wielded, the staff imbues its wielder with the unbreakable will to overcome any obstacle and emerge victorious. Those who wield this staff are said to be destined to be the last one standing in any battle, no matter the odds.", "unique", 196),
    new weaponInfo("Ragin Pole of Chaos", "weapon", "staff", ["crafting", "chest"], "<:ragin_pole_of_chaos:1066864271121715231>", "https://i.imgur.com/t68LcTE.png", "md", 32, 552, "md", 8, 168, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.md += Math.floor(myStats.md * Math.min(0.3, (0.05 * Math.floor(matchStats.round / 3))));
        }, 9999));
    }, "Increases the wielders magic damage by **5%** every 3 rounds (up to **30%**)", "The Ragin Pole of Chaos is a weapon wielded by the most powerful sorcerers, capable of unleashing devastating chaos and destruction upon their enemies. Those who dare to wield it must be prepared to unleash its wild, uncontrollable power and face the consequences of its chaotic energy. Those who have survived its rage speak of its ability to twist and warp reality, tearing apart the fabric of the world with its chaotic force.", "unique", 197),
    new weaponInfo("Reaper's Rod", "weapon", "staff", ["chest"], "<:reapers_rod:1066864275332812811>", "https://i.imgur.com/lwEuIdG.png", "md", 30, 554, "cr", 0.05, 0.18, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.executeHP = Math.max(0.1, myStats.executeHP);
    }, "Executes the enemy when below **10%** HP.", "Forged in the depths of the underworld, the Reaper's Rod is a weapon of immense power. Crafted with the essence of death itself, those who wield it are granted the ability to reap the souls of the living with a single touch. Woe to those who stand against the one who bears the Reaper's Rod, for their fate is sealed.", "unique", 198),
    new weaponInfo("Scepter of the Arcane", "weapon", "staff", ["crafting", "chest"], "<:scepter_of_the_arcane:1066864263303544892>", "https://i.imgur.com/J6dofBX.png", "md", 30, 558, "md%", 0.03, 0.17, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let buff = Math.floor(myStats.atk * 0.1);
        mybuff.atk.push(new buffInfo("+", buff, 9999));
        myStats.delayedBuffs.push(new delayedBuffs(10, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.atk.push(new buffInfo("+", buff, 9999));
        }));
    }, "The wielder has **10%** increased magic damage. This increases to **20%** after 10 rounds.", "The Scepter of the Arcane is an ancient scepter told to be once wielded by the greatest sorcerer in all the land, and is said to hold immense magical power. With the Scepter of the Arcane, the wielder can cast powerful spells and harness the energy of the arcane to their will.", "unique", 199),
    new weaponInfo("Soulkeeper", "weapon", "staff", ["crafting", "chest"], "<:soulkeeper:1066864557198413935>", "https://i.imgur.com/W69VM7Y.png", "md", 35, 575, "mr", 28, 122, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 3 === 0) addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.2), {});
        }, 9999));
    }, "Every 3 rounds the wielder is healed by **20%** of their missing HP.", "The Soulkeeper staff is a powerful and ancient relic, imbued with the essence of the great spirits of the land. Its shimmering crystal handle holds the very essence of life, and its glowing tip can harness the power of the soul itself. With this staff in hand, the wielder has the ability to both protect and manipulate the very essence of life itself. But be warned, for the power of the Soulkeeper comes at a great cost, and those who wield it must be cautious not to lose themselves to its dark temptations.", "unique", 200),
    new weaponInfo("Tribute of Illumination", "weapon", "staff", ["crafting", "chest"], "<:tribute_of_illumination:1066864560423850034>", "https://i.imgur.com/HnUdOz6.png", "md", 32, 568, "mana", 5, 25, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.hp = Math.floor(myStats.hp * 0.9);
        myStats.sm += 20;
    }, "In exchange for starting with **10%** less HP, the wielder gains 20 mana at the start of battle.", "The Tribute of Illumination is a powerful staff imbued with the energy of the sun. Its golden glow illuminates the darkest of caves and sheds light on even the most hidden secrets. Those who wield it are granted the ability to see truth and knowledge previously hidden from them. It is said that only those who are pure of heart and intention can harness its full potential.", "unique", 201),
    new weaponInfo("Wand of Visions", "weapon", "staff", ["chest"], "<:wand_of_visions:1066864564538441739>", "https://i.imgur.com/VTCmTHr.png", "md", 34, 570, "br", 0.03, 0.16, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.br.push(new buffInfo("+", -0.1, 9999));
    }, "The wielder decreases enemy block rate by **10%** for the rest of battle.", "This delicate wand known as the Wand of Visions was created by the seer Alia and is said to grant its wielder the ability to see into the future. Those who possess the Wand of Visions are said to be able to predict the outcome of events before they happen.", "unique", 202),

    // Weapons - Unique Axe
    new weaponInfo("Betrayer of Broken Bones", "weapon", "axe", ["crafting", "chest"], "<:betrayer_of_broken_bones:1067186662360231956>", "https://i.imgur.com/I5XFNnJ.png", "atk", 34, 572, "md", 20, 386, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.md > myStats.atk) {
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.16), 9999));
            myStats.atk += Math.floor(myStats.atk * 0.16);
        };
    }, "If the wielder starts the fight with more magic damage than attack, increases attack by **16%** for the rest of battle.", "With each swing of the Betrayer of Broken Bones, the earth shakes and bones shatter. Those who dare to face its wrath will fall to its unforgiving blade, their broken remains a testament to its power. In the heat of battle, this weapon brings swift and merciless death to all who stand in its way. Betrayer of Broken Bones, a tool of destruction and a harbinger of doom.", "unique", 203),
    new weaponInfo("Blight's Plight", "weapon", "axe", ["crafting", "chest"], "<:blights_plight:1067186668236447814>", "https://i.imgur.com/G2ilwTE.png", "atk", 30, 534, "atk", 18, 234, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.dodge -= 0.1;
        if (eStats.dodge < 0) eStats.dodge = 0;
        ebuff.dodge.push(new buffInfo("+", -0.1, 9999));
    }, "Decreases enemy dodge chance by **10%** for the rest of battle.", "As the steel of Blight's Plight cleaves through the air, a dark aura surrounds the weapon, radiating with the power of a thousand plagues. Those who dare to face its wrath are met with demise, as the axe consumes them leaving nothing but ruin in its wake.", "unique", 204),
    new weaponInfo("Brute Force", "weapon", "axe", ["chest"], "<:brute_force:1067186675454849054>", "https://i.imgur.com/qe6ajhc.png", "atk", 42, 612, "br", 0.03, 0.14, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.br = 0;
        ebuff.br.push(new buffInfo("=", 0, 5));
    }, "Decreases enemy block rate to **0%** during the first 5 rounds.", "The Brute Force is a formidable weapon, forged from the finest steel and imbued with the strength of giants. Its massive blade is capable of crushing armor and bone alike, leaving a trail of destruction in its wake. Wielded by the strongest of warriors, the Brute Force is a weapon to be feared and respected on the battlefield.", "unique", 205),
    new weaponInfo("Cliff Chopper", "weapon", "axe", ["crafting", "chest"], "<:cliff_chopper:1067186681691787314>", "https://i.imgur.com/NjwvSQV.png", "atk", 37, 606, "shield", 24, 210, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.shield = Math.floor(eStats.shield * 0.7);
    }, "Decreases enemy shield by **30%** at the start of battle.", "With every swing of the mighty Cliff Chopper, enemies are sent tumbling down the rocky cliffs of the battlefield. Its sharpened edge and hefty weight make it the perfect weapon for hacking through armor and bone. Those who dare to stand in its way will be met with a swift and powerful blow.", "unique", 206),
    new weaponInfo("Frugal Hatchetman", "weapon", "axe", ["crafting", "chest"], "<:frugal_hatchetman:1067186686750117919>", "https://i.imgur.com/LiX3Azz.png", "atk", 40, 610, "mr", 28, 119, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.executeHP = Math.max(0.1, myStats.executeHP);
    }, "Executes the enemy when below **10%** HP.", "The Frugal Hatchetman is a battle axe wielded by only the most thrifty of warriors. Its simple design belies its deadly efficiency on the battlefield, chopping through enemies with ruthless precision. In the hands of a skilled fighter, the Frugal Hatchetman becomes a formidable weapon, capable of dealing devastating blows without breaking the bank.", "unique", 207),
    new weaponInfo("Guileless Remorse", "weapon", "axe", ["chest"], "<:guileless_remorse:1067186845437415444>", "https://i.imgur.com/nb109BI.png", "atk", 32, 571, "cr", 0.03, 0.14, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cd += 0.25;
        mybuff.cd.push(new buffInfo("+", 0.25, 8));
    }, "The wielder deals **25%** increased crit damage during the first 8 rounds.", "With each mighty swing of the Guileless Remorse, the battlefield echoes with the cries of those who dare to stand in its path. Forged in the fires of regret and sorrow, this battle axe is a weapon of pure, unbridled fury. Those who wield the Guileless Remorse are consumed by a burning desire for retribution, striking down their foes without mercy. In their hands, this weapon becomes a symbol of their unbridled rage, a reminder of the wounds they have suffered and the enemies they have vanquished.", "unique", 208),
    new weaponInfo("Howling Remorse", "weapon", "axe", ["crafting", "chest"], "<:howling_remorse:1067186851418472498>", "https://i.imgur.com/KWbp6j5.png", "atk", 36, 566, "mr", 26, 123, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodge += 0.1;
        mybuff.dodge.push(new buffInfo("+", 0.1, 8));
    }, "The wielder has **10%** increased dodge chance during the first 8 rounds.", "The Howling Remorse is a deadly weapon wielded by those who have committed great sins and seek redemption in battle. As it cleaves through flesh and bone, a haunting howl echoes from its blade, the cries of the fallen serving as a constant reminder of the wielder's past transgressions. It is a tool of retribution, punishing the wicked and absolving the wielder of their guilt with every swing.", "unique", 209),
    new weaponInfo("Labrys", "weapon", "axe", ["chest"], "<:labrys:1067187104905449582>", "https://i.imgur.com/B2TiAe4.png", "atk", 34, 567, "atk%", 0.03, 0.12, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.hp / myStats.maxhp < 0.2) myStats.atk += Math.floor(myStats.atk * 0.125);
        if (myStats.hp / myStats.maxhp < 0.2) myStats.def += Math.floor(myStats.def * 0.2);
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.hp / myStats.maxhp < 0.2) myStats.atk += Math.floor(myStats.atk * 0.125);
            if (myStats.hp / myStats.maxhp < 0.2) myStats.def += Math.floor(myStats.def * 0.2);
        }, 9999));
    }, "When the wielder's HP falls below **20%**, increases attack by **12.5%** and defense by **20%**.", "The Labrys is a formidable weapon, its double-headed axe design capable of delivering devastating blows to even the toughest of foes. Its name, taken from the ancient Greek word for double axe, signifies its power and strength. Those who wield it are said to be relentless, their strikes swift and deadly. With the Labrys in hand, victory is all but assured.", "unique", 210),
    new weaponInfo("Lethargic Hatchet", "weapon", "axe", ["crafting", "chest"], "<:lethargic_hatchet:1067186863351283753>", "https://i.imgur.com/XApj4cI.png", "atk", 37, 587, "def", 26, 118, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.hp / myStats.maxhp < 0.4) {
            myStats.def += Math.floor(myStats.def * 0.15);
            myStats.mr += Math.floor(myStats.mr * 0.15);
            mybuff.def.push(new buffInfo("+", myStats.def * 0.15, 9999));
            mybuff.mr.push(new buffInfo("+", myStats.mr * 0.15, 9999));
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.2), {});
        } else {
            myStats.delayedBuffs.push(new delayedBuffs(0, function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp / myStats.maxhp < 0.4) {
                    myStats.def += Math.floor(myStats.def * 0.15);
                    myStats.mr += Math.floor(myStats.atk * 0.15);
                    mybuff.def.push(new buffInfo("+", myStats.def * 0.15, 9999));
                    mybuff.mr.push(new buffInfo("+", myStats.mr * 0.15, 9999));
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.2), {});
                    //@ts-ignore
                    this._used++;
                };
            }, 9999, 1));
        };
    }, "The first time the wielder's HP falls below **40%** of max HP, increases defense and magic resistance by **15%** each and heals **20%** of missing HP.", "The Lethargic Hatchet may seem slow and sluggish at first glance, but once it's in motion, it becomes a deadly force to be reckoned with. Its heavy, lethargic swings packs a powerful punch and can easily cleave through wood and stone alike. The axe's dull edge may not strike fear into the hearts of foes, but its devastating power will surely leave them reeling.", "unique", 211),
    new weaponInfo("Paltry Monsoon", "weapon", "axe", ["crafting", "chest"], "<:paltry_monsoon:1067186839959633980>", "https://i.imgur.com/ohbksPt.png", "atk", 36, 584, "cr", 0.03, 0.13, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.critbleed = true;
        matchStats.critbleedlast = 2;
    }, "Critical hits cause bleeding, leading the enemy to lose **3%** of max HP for 2 rounds.", "As the storm rages on, the Paltry Monsoon battle axe glimmers with anticipation. The fury of a monsoon is contained within its blades, ready to unleash its devastating power upon any who dare to cross its path. Wield the Paltry Monsoon with caution, for its might is not to be underestimated.", "unique", 212),
    new weaponInfo("Ragnar's Verity", "weapon", "axe", ["crafting", "chest"], "<:ragnars_verity:1067187161524342886>", "https://i.imgur.com/cBDfoNB.png", "atk", 34, 577, "hp", 40, 282, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const bleed = Math.floor(eStats.hp > 2 * myStats.hp ? myStats.hp * 0.2 : eStats.hp * 0.1);
        eStats.hp -= Math.floor(bleed);
    }, "The enemy starts with **10%** less HP. If the enemy has more than twice as much HP than the wielder, it starts with **20%** less HP of the wielder instead.", "With every swing of Ragnar's Verity, the battlefield trembles with the power of a true Viking. Forged from the finest steel and imbued with the spirit of a fierce conqueror, this battle axe strikes fear into the hearts of even the bravest warriors. In the hands of a skilled wielder, Ragnar's Verity is a weapon to be reckoned with, delivering swift and decisive blows that lay waste to any foe. Those who dare to stand against it will soon learn the true meaning of fear and the power of Ragnar's wrath.", "unique", 213),
    new weaponInfo("Rock Renderer", "weapon", "axe", ["chest"], "<:rock_renderer:1067187426977652767>", "https://i.imgur.com/Sua2l4x.png", "atk", 38, 592, "mg", 1, 4, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.def = Math.floor(eStats.def * 0.8);
        ebuff.def.push(new buffInfo("*", 0.8, 8));
    }, "Decreases enemy defense by **20%** for the first 8 rounds.", "The Rock Renderer is a weapon of pure destruction, capable of splitting even the hardest of rocks with a single swing. Its sharp edges and heavy weight make it a formidable force on the battlefield, tearing through armor and shields with ease. Those who wield it are feared by their enemies, for they know that their fate is sealed once the Rock Renderer is raised high above their heads.", "unique", 214),
    new weaponInfo("Sorrow's Strike", "weapon", "axe", ["chest"], "<:sorrows_strike:1067187171510988811>", "https://i.imgur.com/SIr5Luf.png", "atk", 36, 587, "hp", 20, 134, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.selfhealChance.push(1);
        myStats.selfheal.push(0.05);
    }, "Heals the wielder by **5%** of the damage dealt.", "As Sorrow's Strike descends upon its foes, a dark energy radiates from the blade. Its sharp, jagged edges are a reminder of the pain and suffering endured by those who have fallen before it. Those who dare to face its wrath are met with a swift and devastating blow, leaving a trail of despair in its wake. This battle axe has claimed countless lives, earning its name as the harbinger of sorrow.", "unique", 215),
    new weaponInfo("Vindicator's Earthshaker", "weapon", "axe", ["crafting", "chest"], "<:vindicators_earthshaker:1067187177945042974>", "https://i.imgur.com/ZFyDUJn.png", "atk", 35, 580, "mana", 3, 15, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.sm / myStats.mana >= 0.9) myStats.atk += Math.floor(myStats.atk * 0.2);
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.sm / myStats.mana >= 0.9) myStats.atk += Math.floor(myStats.atk * 0.2);
        }, 9999));
    }, "The wielder gains an additional **20%** attack buff when their mana bar is at least **90%** full.", "With a mighty swing, the Vindicator's Earthshaker cracks the very earth beneath your feet. Its devastating power will leave your enemies quaking in fear, knowing that their fate has been sealed by the wrath of the Vindicator.", "unique", 216),
    new weaponInfo("Warblade of Widows", "weapon", "axe", ["crafting", "chest"], "<:warblade_of_widows:1067187155937529866>", "https://i.imgur.com/GxFf15V.png", "atk", 41, 604, "shield", 30, 212, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (eStats.ep > myStats.ep) {
            myStats.cd += 0.16;
            myStats.cr += 0.1;
            if (myStats.cr > 1) myStats.cr = 1;
            mybuff.cd.push(new buffInfo("+", 0.16, 8));
            mybuff.cr.push(new buffInfo("+", 0.1, 8));
        };
    }, "If the enemy has more EP than the wielder, increases crit rate by **10%** and crit damage by **16%** for the first 8 rounds.", "The Warblade of Widows is a fearsome weapon, crafted with the tears of widowed warriors and tempered in the flames of battle. Its sharp edges have claimed countless lives, leaving a wake of devastation and despair in its path. Those who wield it are feared by their enemies and respected by their allies, for they know that victory is at their fingertips. The Warblade of Widows is a weapon of war, and those who hold it must be prepared to face the consequences of their actions.", "unique", 217),

    // Weapons - Unique Bow
    new weaponInfo("Alley Hunter", "weapon", "bow", ["crafting", "chest"], "<:alley_hunter:1067193192732180622>", "https://i.imgur.com/skLt3JB.png", "atk", 34, 573, "sm", 2, 10, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.sm -= 10;
        if (eStats.sm < 0) eStats.sm = 0;
        eStats.mg -= 2;
        if (eStats.mg < 0) eStats.mg = 0;
        ebuff.mg.push(new buffInfo("+", -2, 9999));
    }, "The enemy starts with **10** mana less than normal, and gains **2** mana less each round.", "The Alley Hunter is the weapon of choice for those who prowl the dark corners of the city. Its sleek design and deadly accuracy make it the perfect tool for taking down targets from a safe distance. With this bow in hand, you'll be able to silently pick off your enemies before they even know you're there.", "unique", 218),
    new weaponInfo("Barrage", "weapon", "bow", ["crafting", "chest"], "<:barrage:1067193198096699522>", "https://i.imgur.com/DvakuEy.png", "atk", 35, 578, "br", 0.04, 0.18, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.br -= 0.12;
        if (eStats.br < 0) eStats.br = 0;
        ebuff.br.push(new buffInfo("+", -0.12, 9999));
    }, "Decreases enemy block rate by **12%** for the rest of battle.", "The Barrage is a weapon of unparalleled speed and ferocity. With its rapid firing capabilities and devastating accuracy, it can unleash a torrent of arrows upon the enemy, leaving them no time to react or defend. In the hands of a skilled archer, the Barrage is a force to be reckoned with.", "unique", 219),
    new weaponInfo("Bond of Torment", "weapon", "bow", ["crafting", "chest"], "<:bond_of_torment:1067193204362977402>", "https://i.imgur.com/3N4DW9S.png", "atk", 34, 567, "cd", 0.07, 0.32, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.hp / myStats.maxhp < 0.3) {
            myStats.cd += 0.2;
            myStats.cr += 0.12;
            if (myStats.cr > 1) myStats.cr = 1;
            mybuff.cr.push(new buffInfo("+", 0.12, 9999));
            mybuff.cd.push(new buffInfo("+", 0.2, 9999));
        } else {
            myStats.delayedBuffs.push(new delayedBuffs(0, function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp / myStats.maxhp < 0.3) {
                    myStats.cd += 0.2;
                    myStats.cr += 0.12;
                    if (myStats.cr > 1) myStats.cr = 1;
                    mybuff.cr.push(new buffInfo("+", 0.12, 9999));
                    mybuff.cd.push(new buffInfo("+", 0.2, 9999));
                    //@ts-ignore
                    this._used++;
                };
            }, 9999, 1));
        };
    }, "The first time the wielder's HP falls below **30%** of max HP, increases crit rate by **12%** and crit damage by **20%**.", "The Bond of Torment is a wicked weapon, crafted by dark forces to inflict unspeakable suffering upon its victims. Its deadly arrows pierce the soul, causing endless anguish and torment to those unfortunate enough to be struck by its cursed arrows. Those who wield it are said to be consumed by its power, consumed by a lust for inflicting pain and suffering upon their enemies.", "unique", 220),
    new weaponInfo("Bow to the Queen", "weapon", "bow", ["chest"], "<:bow_to_the_queen:1067193209815564368>", "https://i.imgur.com/y6dQEPz.png", "atk", 37, 585, "mana", 5, 25, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mg -= 4;
        if (eStats.mg < 0) eStats.mg = 0;
    }, "Decreases enemy mana generation by **-4** per round.", "Bow to the Queen is a masterpiece of craftsmanship, fit for only the most regal of archers. The bow itself is made of the finest ebony wood, polished to a glossy shine and inlaid with intricate silver filigree. The grip is expertly carved to fit perfectly in the archer's hand, and the string is made of the strongest and most durable materials available. When drawn and released, the bow makes a soft, regal sound, as if it is paying homage to its owner, the queen herself. With this bow in hand, any archer can feel like royalty on the battlefield.", "unique", 221),
    new weaponInfo("Bullseye", "weapon", "bow", ["chest"], "<:bullseye:1067193362601476116>", "https://i.imgur.com/OZdbGe2.png", "atk", 32, 560, "cd", 0.06, 0.36, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 5 === 0) {
                myStats.cr += 0.33;
                if (myStats.cr > 1) myStats.cr = 1;
                eStats.dodge = 0;
            };
        }, 9999));
    }, "Every 5th round the wielder has **33%** increased crit rate and decreases dodge chance of the enemy to **0%**.", "With Bullseye, every shot is a guaranteed hit. The finely crafted bow has a keen eye for precision, allowing the user to hit their target with unerring accuracy. Whether hunting game or engaging in battle, Bullseye will never miss its mark.", "unique", 222),
    new weaponInfo("Crimson Rose", "weapon", "bow", ["chest"], "<:crimson_rose:1067193833206579310>", "https://i.imgur.com/7Eon7ib.png", "atk", 38, 584, "hp", 52, 326, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const bleed = Math.floor(eStats.hp > 2 * myStats.hp ? myStats.hp * 0.2 : eStats.hp * 0.1);
        eStats.hp -= Math.floor(bleed);
    }, "The enemy starts with **10%** less HP. If the enemy has more than twice as much HP than the wielder, it starts with **20%** less HP of the wielder instead.", "The Crimson Rose is a bow crafted from the finest redwood and imbued with the essence of a thousand fiery blooms. Its strings hum with a fierce energy, eager to unleash a rain of arrows upon any who dare to cross its wielder. In the hands of a skilled archer, the Crimson Rose strikes fear into the hearts of even the bravest warriors.", "unique", 223),
    new weaponInfo("Dead Air", "weapon", "bow", ["crafting", "chest"], "<:dead_air:1067193375121477632>", "https://i.imgur.com/FwC3Mw6.png", "atk", 34, 572, "mr", 26, 112, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mr -= Math.floor(eStats.mr * 0.15);
        ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.15), 9999));
    }, "The enemy has **15%** decreased magic resistance for the rest of battle.", "The Dead Air is a silent, deadly weapon that strikes fear into the hearts of its victims. With each shot, the bow sends forth a deadly arrow that cuts through the air like a knife, delivering a swift and lethal blow. Its sleek design and deadly precision make it the perfect tool for the skilled hunter or assassin.", "unique", 224),
    new weaponInfo("Favor of Regret", "weapon", "bow", ["crafting", "chest"], "<:favor_of_regret:1067193356880466011>", "https://i.imgur.com/gu1dIB7.png", "atk", 32, 570, "def", 27, 118, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.def -= Math.floor(eStats.def * 0.15);
        ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * 0.15), 9999));
    }, "The enemy has **15%** decreased defense for the rest of battle.", "The Favor of Regret is a cursed bow, imbued with the sorrow and regret of its former wielders. Those who dare to draw its string are plagued with haunting memories and the weight of past mistakes. Though its power is great, it comes at a heavy cost, for the Favor of Regret demands a toll of regret from all who wield it.", "unique", 225),
    new weaponInfo("Longshot", "weapon", "bow", ["chest"], "<:longshot:1067193931634331678>", "https://i.imgur.com/1JqyuxR.png", "md", 31, 553, "md%", 0.04, 0.14, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 5 === 0) {
                myStats.md = Math.floor(myStats.md * 2.2);
            };
        }, 9999));
    }, "Every 5th round, the wielder has **220%** magic damage.", "The Longshot is a formidable weapon, favored by archers who value range and power above all else. Its sleek, elongated design allows for a longer draw, generating higher velocities and greater accuracy than traditional bows. With the Longshot, an experienced marksman can hit targets from incredible distances, felling even the hardiest of foes with a single, well-placed shot. Despite its size and strength, the Longshot is surprisingly light and easy to handle, making it a favorite among hunters and soldiers alike. Whether you're facing down a rampaging ogre or taking aim at a distant target, the Longshot is the bow you want by your side.", "unique", 226),
    new weaponInfo("Mistletoe", "weapon", "bow", ["crafting", "chest"], "<:mistletoe:1067193936495529995>", "https://i.imgur.com/NjR4aPv.png", "md", 30, 542, "md%", 0.05, 0.16, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mr -= Math.floor(eStats.mr * 0.15);
        ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.15), 9999));
    }, "Decreases magic resistance of enemy by **15%** for the rest of battle.", "The Mistletoe bow is a weapon of defiance and hope. Named after the sacred plant of Norse mythology, it symbolizes love and fertility in a society that rejects such ideals. In a harsh world where survival is often difficult, the Mistletoe bow offers a glimmer of hope and the possibility of a brighter future. Those who wield it fearlessly embrace their beliefs, even in the face of adversity.", "unique", 227),
    new weaponInfo("Puncture", "weapon", "bow", ["chest"], "<:puncture:1067193939788050562>", "https://i.imgur.com/tJS7R1m.png", "atk", 33, 567, "mr", 29, 112, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk += Math.floor(myStats.atk * 0.125);
        myStats.md += Math.floor(myStats.md * 0.125);
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.125), 9999));
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.125), 9999));
    }, "The wielder has **12.5%** increased attack and magic damage throughout the battle.", "Puncture is a sleek and deadly bow, crafted from the finest materials. With a single shot, it can unleash a torrent of destruction, tearing through enemy ranks. With this weapon in hand, no enemy can stand against you.", "unique", 228),
    new weaponInfo("Quickstrike", "weapon", "bow", ["chest"], "<:quickstrike:1067193922385887363>", "https://i.imgur.com/5NpZleZ.png", "atk", 35, 577, "dodge", 0.03, 0.12, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.dodge -= 0.12;
        if (eStats.dodge < 0) eStats.dodge = 0;
        ebuff.dodge.push(new buffInfo("+", -0.12, 9999));
    }, "Decreases dodge chance of the enemy by **12%** for the rest of battle.", "With its sleek and lightweight design, the Quickstrike bow allows archers to unleash rapid-fire shots with deadly precision. Its powerful drawstring and finely crafted limbs unleash arrows with explosive force, catching enemies off guard and leaving them no time to react. In the hands of a skilled archer, the Quickstrike is a formidable weapon capable of delivering swift and deadly blows.", "unique", 229),
    new weaponInfo("Quintain", "weapon", "bow", ["crafting", "chest"], "<:quintain:1067194009556103388>", "https://i.imgur.com/oh9SOYb.png", "atk", 36, 573, "cd", 0.05, 0.32, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.twinshot += 0.16;
    }, "The wielder has a **16%** chance of firing 2 shots.", "The Quintain bow was crafted by a master archer who sought to create the ultimate weapon for combat. Its sleek design allows for swift and precise shots, striking fear into the hearts of opponents. Its power and precision have earned it the nickname \"The Knight's Bane\". With the Quintain in hand, any archer can become a champion on the battlefield.", "unique", 230),
    new weaponInfo("Slingshot", "weapon", "bow", ["crafting", "chest"], "<:slingshot:1067194016053076099>", "https://i.imgur.com/10AV4WJ.png", "atk", 31, 562, "dodge", 0.02, 0.11, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.sm / myStats.mana >= 0.8) {
            myStats.dodge += 0.12;
            if (myStats.dodge > 1) myStats.dodge = 1;
        };
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.sm / myStats.mana >= 0.8) {
                myStats.dodge += 0.12;
                if (myStats.dodge > 1) myStats.dodge = 1;
            };
        }, 9999));
    }, "The wielder gains an additional **12%** dodge chance when their mana bar is at least **80%** full.", "With the flick of a wrist, the Slingshot propels arrows with deadly precision. Its lightweight design allows for quick and agile movements in battle, making it a formidable weapon in the hands of a skilled archer. But beware, for one false move can send your shot veering off course. Strike true, and watch your enemies fall before you.", "unique", 231),
    new weaponInfo("Tweak", "weapon", "bow", ["crafting", "chest"], "<:tweak:1067194021233045596>", "https://i.imgur.com/OXpvE4j.png", "atk", 30, 558, "md", 24, 326, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 3 === 0) {
                myStats.atk += Math.floor(myStats.atk / 3);
                myStats.md += Math.floor(myStats.md / 3);
            };
        }, 9999));
    }, "Every 3rd round, the wielder has **33%** increased attack and magic damage.", "Tweak is a masterfully crafted weapon, imbued with the power to bend and twist reality itself. With each precise shot, the archer can manipulate their surroundings, creating small changes in the world that can make all the difference in battle. As they draw back the string and take aim, the possibilities are endless - and the power of Tweak is truly awe-inspiring.", "unique", 232),
    new weaponInfo("Warbow of the Wretched", "weapon", "bow", ["crafting", "chest"], "<:warbow_of_the_wretched:1067194025821622342>", "https://i.imgur.com/PqtAAD4.png", "atk", 36, 580, "def", 26, 124, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Not sure if this would work - I assume not // mybuff.def.push(new buffInfo("+", myStats.def*Math.min(0.05*Math.floor(matchStats.round/4), 0.3), 9999));
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.def += Math.floor(myStats.def * Math.min(0.05 * Math.floor(matchStats.round / 4), 0.3));
        }, 9999));
    }, "Every 4 rounds, the wielder gets **5%** defense (max 30%).", "Once wielded by a band of ruthless outlaws, the Warbow of the Wretched strikes fear into the hearts of its enemies. It has been stained with the blood of countless battles, and its strings hum with the cries of the vanquished. In the hands of a skilled archer, this weapon unleashes a barrage of deadly arrows, raining destruction upon the battlefield. But beware, for those who wield it are said to be cursed, doomed to a life of violence and misery.", "unique", 233),
    new weaponInfo("Wyrmwood", "weapon", "bow", ["crafting", "chest"], "<:wyrmwood:1067194031597170711>", "https://i.imgur.com/H70gEHL.png", "atk", 43, 596, "atk", 22, 312, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // NO BUFF
    }, "None", "Forged from the ancient, twisted branches of a dragon's hoard, the Wyrmwood bow is a weapon of devastating power. Its old wood is imbued with the essence of the great beasts, giving it an otherworldly strength and accuracy. Those who wield it are said to channel the spirit of the dragon, striking fear into the hearts of their enemies with every arrow loosed from its string.", "unique", 234),

    // Weapons - Unique Lance
    new weaponInfo("Caladbolg", "weapon", "lance", ["crafting", "chest"], "<:caladbolg:1067200674980433920>", "https://i.imgur.com/0auOp8r.png", "atk", 28, 542, "atk", 14, 237, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.hp / myStats.maxhp < 0.3) {
            myStats.atk += Math.floor(myStats.atk * 0.25);
            myStats.md += Math.floor(myStats.md * 0.25);
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.25), 9999));
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.atk * 0.25), 9999));
        } else {
            myStats.delayedBuffs.push(new delayedBuffs(0, function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp / myStats.maxhp < 0.3) {
                    myStats.atk += Math.floor(myStats.atk * 0.25);
                    myStats.md += Math.floor(myStats.md * 0.25);
                    mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.25), 9999));
                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.atk * 0.25), 9999));
                    //@ts-ignore
                    this._used++;
                };
            }, 9999, 1));
        };
    }, "The first time the wielders HP falls below **30%** of max HP, increases attack and magic damage by **25%**.", "The Caladbolg lance is a weapon of legend, known for its ability to unleash devastating attacks with a single thrust. Its enchanted blade glows with a brilliant light, capable of cleaving through solid stone. Those who wield the Caladbolg are said to be feared and respected on the battlefield, their skills and prowess unmatched by any other warrior.", "unique", 235),
    new weaponInfo("Deathgrip", "weapon", "lance", ["chest"], "<:deathgrip:1067200679619342387>", "https://i.imgur.com/FZzpMng.png", "atk", 38, 589, "cr", 0.04, 0.15, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cd += 0.25;
        mybuff.cd.push(new buffInfo("+", 0.1, 8));
    }, "The wielder has **25%** increased crit damage during the first 8 rounds.", "With its deadly, razor-sharp edges and powerful grip, the Deathgrip is the ultimate weapon for any knight seeking to dominate the battlefield. Its menacing design instills fear in even the bravest of warriors, as they know one strike from this deadly weapon could mean their end.", "unique", 236),
    new weaponInfo("Glas Ghaibhleann", "weapon", "lance", ["crafting", "chest"], "<:glas_ghaibhleann:1067200684048531486>", "https://i.imgur.com/K9ZAgan.png", "atk", 31, 562, "hp", 58, 362, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 3 === 0) {
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.2), {});
                myStats.atk += Math.floor(myStats.atk / 3);
                myStats.md += Math.floor(myStats.md / 3);
            };
        }, 9999));
    }, "Every 3rd round, the wielder heals for **20%** of missing HP.", "The Glas Ghaibhleann is a lance of legend, said to have been crafted by the fairy folk of ancient Hibernia. It glimmers with an otherworldly light, as if it were made of the essence of nature itself. Those who wield it in battle are said to be imbued with the power of the fae, striking fear into the hearts of their enemies with each swift and deadly thrust.", "unique", 237),
    new weaponInfo("Hellreaver", "weapon", "lance", ["chest"], "<:hellreaver:1067200689165578401>", "https://i.imgur.com/6YKgHAb.png", "atk", 33, 568, "cr", 0.03, 0.13, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.critbleed = true;
        matchStats.critbleedlast = 2;
    }, "Critical hits cause bleeding, leading the enemy to lose **3%** of max HP for 2 rounds.", "Forged in the fiery depths of hell, the Hellreaver lance is a weapon of destruction, capable of tearing through even the toughest armor with ease. Those who wield it are said to be blessed with the power of the underworld, striking fear into the hearts of their enemies with each ruthless strike. Those foolish enough to stand in their way will be met with a swift and merciless end, as the Hellreaver claims their souls for the inferno.", "unique", 238),
    new weaponInfo("Laoghaire", "weapon", "lance", ["crafting", "chest"], "<:laoghaire:1067200754571550811>", "https://i.imgur.com/i3uxdIu.png", "atk", 34, 570, "cd", 0.05, 0.33, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk += Math.floor(myStats.atk * 0.1);
        myStats.md += Math.floor(myStats.md * 0.1);
        myStats.cr += 0.1;
        myStats.dodge += 0.1;
        myStats.br += 0.1;
        if (myStats.cr > 1) myStats.cr = 1;
        if (myStats.dodge > 1) myStats.dodge = 1;
        if (myStats.br > 1) myStats.br = 1;
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.1), 9999));
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.atk * 0.1), 9999));
        mybuff.cr.push(new buffInfo("+", 0.1, 9999));
        mybuff.dodge.push(new buffInfo("+", 0.1, 9999));
        mybuff.br.push(new buffInfo("+", 0.1, 9999));
    }, "The wielder has **10%** increased attack, magic damage, crit rate, dodge chance and block rate.", "Named after the fierce warrior queen of ancient Ireland, Laoghaire is a weapon of legend. Its sharp, gleaming tip pierces even the strongest armor with ease, and its sturdy haft allows for powerful strikes. Those who wield Laoghaire are said to embody the strength and courage of their namesake, striking fear into the hearts of their enemies and inspiring loyalty in their allies.", "unique", 239),
    new weaponInfo("Marrowstrike", "weapon", "lance", ["crafting", "chest"], "<:marrowstrike:1067200759319511071>", "https://i.imgur.com/aB0OUCb.png", "atk", 37, 581, "md%", 0.06, 0.18, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk += Math.floor(myStats.atk * 0.3);
        myStats.md += Math.floor(myStats.md * 0.3);
        eStats.dodge = 0;
        eStats.br = 0;
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.1), 9999));
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.atk * 0.1), 9999));
    }, "During the very first round, the wielder has **30%** increased attack and magic damage which the enemy can't dodge, nor block. After that, the wielder gets a **10%** attack and magic damage boost for the rest of battle.", "The Marrowstrike lance is a weapon of unmatched power and precision. Forged from the finest metals and imbued with dark magic, this lance has the ability to strike at the very core of its enemies, shattering bone and shredding flesh with each devastating blow. Those who wield the Marrowstrike are feared on the battlefield, their attacks striking fear into the hearts of their foes and inspiring awe in their allies.", "unique", 240),
    new weaponInfo("Rhongomyniad", "weapon", "lance", ["chest"], "<:rhongomyniad:1067200765132808222>", "https://i.imgur.com/FlKjtP2.png", "atk", 36, 577, "mana", 5, 25, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def *= 1.1;
        mybuff.def.push(new buffInfo("*", 1.1, 9999));
        myStats.mg += 5;
        mybuff.mg.push(new buffInfo("+", 5, 4));
    }, "The wielder has **10%** increased defense. Get **+5** mana per round during the first 4 rounds.", "The Rhongomyniad is a spear unlike any other. Crafted by the gods themselves, its sharp, shimmering blade is capable of piercing through even the toughest of armor. With its divine power, the wielder of the Rhongomyniad can strike fear into the hearts of their enemies and claim victory in battle. Hold it high and let its majesty guide your way to victory.", "unique", 241),
    new weaponInfo("Skiver of the Ancients", "weapon", "lance", ["crafting", "chest"], "<:skiver_of_the_ancients:1067200751249657947>", "https://i.imgur.com/kvhqs2V.png", "atk", 34, 567, "md", 28, 426, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("*", 1.03, 9999));
        mybuff.mg.push(new buffInfo("+", 2, 9999));
        myStats.mg += 2;
    }, "The wielder heals **3%** HP and gets **+2** mana after every round.", "Forged in the ancient ruins of a long-forgotten civilization, the Skiver of the Ancients is imbued with the power and wisdom of the old. Its enchanted shaft allows the wielder to outmaneuver their foes on the battlefield. Those who possess this weapon are said to be favored by the spirits of the past, and are feared by their enemies.", "unique", 242),
    new weaponInfo("Skyreaver", "weapon", "lance", ["crafting", "chest"], "<:skyreaver:1067200863665397882>", "https://i.imgur.com/ULbnDHz.png", "md", 35, 572, "mr", 27, 124, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.sm / myStats.mana >= 0.9) myStats.md += Math.floor(myStats.md * 0.2);
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.sm / myStats.mana >= 0.9) myStats.md += Math.floor(myStats.md * 0.2);
        }, 9999));
    }, "The wielder gains an additional **20%** magic damage buff when their mana bar is at least **90%** full.", "Skyreaver is a spear forged from the very essence of the sky. Its shimmering, azure blade is said to be as sharp as a bolt of lightning. Legend has it that the spear was once wielded by the great sky gods themselves, and that it still holds a piece of their divine power within its ancient blade.", "unique", 243),
    new weaponInfo("Taranis", "weapon", "lance", ["crafting", "chest"], "<:taranis:1067200866949546014>", "https://i.imgur.com/Hismntr.png", "md", 34, 574, "br", 0.04, 0.13, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.sm / myStats.mana < 0.2) myStats.md += Math.floor(myStats.md * 0.2);
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.sm / myStats.mana < 0.2) myStats.md += Math.floor(myStats.md * 0.2);
        }, 9999));
    }, "The wielder has **20%** increased magic damage when their mana bar is less than **20%** full.", "The sky darkens and the air crackles with electricity as Taranis pierces through the battlefield, striking fear into the hearts of all who dare to stand in its path. This mighty lance, named after the Celtic god of thunder, channels the power of the heavens to unleash devastating blows upon its foes. Wielded by only the bravest of warriors, Taranis brings swift and merciless justice to all who oppose it.", "unique", 244),
    new weaponInfo("Trickster's Tip", "weapon", "lance", ["crafting", "chest"], "<:tricksters_tip:1067200871169015838>", "https://i.imgur.com/KzxZlOA.png", "atk", 31, 569, "dodge", 0.03, 0.11, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.dodge > eStats.dodge) {
            eStats.dodge -= 0.1;
            if (eStats.dodge < 0) eStats.dodge = 0;
            ebuff.dodge.push(new buffInfo("+", -0.1, 8));
        } else {
            myStats.dodge += 0.1;
            if (myStats.dodge > 1) myStats.dodge = 1;
            mybuff.dodge.push(new buffInfo("+", 0.1, 8));
        };
    }, "If the wielder has more dodge chance than the enemy, decreases enemy dodge chance by **10%**. Otherwise increases own dodge chance by **10%**. This lasts for 8 rounds.", "The Trickster's Tip is a mischievous lance, imbued with the spirit of chaos and deception. Its slender, curved blade is designed to catch enemies off guard, darting and weaving with a mind of its own. Those who wield it are said to possess a certain cunning, able to turn the tide of battle with a flick of the wrist and a sly grin. But be warned: the Trickster's Tip is a fickle weapon, and those who seek to control it may soon find themselves on the receiving end of its trickery.", "unique", 245),
    new weaponInfo("Tristan's Trance", "weapon", "lance", ["chest"], "<:tristans_trance:1067200876197969973>", "https://i.imgur.com/iYaqRAr.png", "atk", 37, 580, "mg", 1, 3, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mana += 40;
        myStats.sm += 10;
        myStats.mg += 2;
        mybuff.mg.push(new buffInfo("+", 2, 9999));
    }, "Increases the wielders mana cap by **+40**, and gains **+2** mana every round. Start the battle with **+10** mana.", "With each swift and precise strike, Tristan's Trance weaves a mesmerizing dance of death on the battlefield. Those who dare challenge its wielder are quickly lulled into a trance, unable to defend themselves against its relentless assault.", "unique", 246),
    new weaponInfo("Victor", "weapon", "lance", ["chest"], "<:victor:1067200859336872006>", "https://i.imgur.com/MWtDeIO.png", "atk", 37, 586, "br", 0.04, 0.16, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.atk += Math.floor(myStats.atk * Math.min(0.3, (0.05 * Math.floor(matchStats.round / 3))));
        }, 9999));
    }, "Increases the wielders attack by **5%** every 3 rounds (up to **30%**).", "With its sleek and graceful design, Victor is a weapon of undeniable beauty. But do not be fooled by its appearance - this lance is a formidable force on the battlefield, capable of delivering devastating blows to even the most powerful of foes. In the hands of a skilled warrior, Victor becomes a weapon of victory, striking fear into the hearts of all who stand in its way.", "unique", 247),
    new weaponInfo("Viresco", "weapon", "lance", ["crafting", "chest"], "<:viresco:1067200967306649790>", "https://i.imgur.com/IcgHxdh.png", "atk", 36, 585, "mana", 5, 25, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.sm += 40;
        myStats.sm += 40;
        if (eStats.sm > eStats.mana) eStats.sm = eStats.mana;
        if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
    }, "The wielder starts with **+40** mana, but so does your enemy.", "The Viresco lance is crafted from the finest elven steel and infused with the essence of life itself. Its polished surface glows with a vibrant green hue. Those who wield it in battle are imbued with strength and vitality, as if the lance itself has become a source of nourishment. With every thrust and parry, the Viresco lance seems to grow stronger, radiating an aura of vitality that can revitalize even the most weary of warriors.", "unique", 248),
    new weaponInfo("Vortex Vanquisher", "weapon", "lance", ["crafting", "chest"], "<:vortex_vanquisher:1067200972021047439>", "https://i.imgur.com/FmqrPwU.png", "atk", 38, 582, "cd", 0.05, 0.34, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.1), 9999));
        myStats.atk += Math.floor(myStats.atk * 0.5);
        myStats.cr = 1;
    }, "During the very first round, the wielder has **50%** increased attack and **100%** crit rate. After that, the wielder gets a **10%** attack boost for the rest of battle.", "_With a fierce cry, the knight charges forth, wielding the Vortex Vanquisher. Its sleek design and sharp edges cut through the air, creating a swirling vortex of wind and energy. As the knight lunges forward, the lance pierces through armor and shields, vanquishing all who dare stand in its way._", "unique", 249),
    new weaponInfo("Witherbrand", "weapon", "lance", ["crafting", "chest"], "<:witherbrand:1067200977201012787>", "https://i.imgur.com/ymjFbw6.png", "md", 26, 536, "md", 16, 218, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.br += 0.1;
        mybuff.br.push(new buffInfo("+", 0.1, 9999));
        mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr * 0.1), 9999));
        myStats.mr += Math.floor(myStats.mr * 0.1);
        myStats.mdChance += 1;
    }, "This lance turns all attacks of the wielder into magic damage. Increases block rate and magic resistance by **+10%**.", "The Witherbrand lance is a weapon of great power, imbued with the essence of death. Its mere presence drains the life force of those around it, leaving only a withered husk in its wake. Those who wield it must be strong of will and heart, for the Witherbrand demands a heavy toll on its wielder as well. Only the bravest of warriors dare to wield its dark power.", "unique", 250),
    new weaponInfo("Wolf's Claw", "weapon", "lance", ["chest"], "<:wolfs_claw:1067200985694482492>", "https://i.imgur.com/8BDobBd.png", "atk", 34, 572, "atk%", 0.05, 0.18, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr += 0.1;
        if (myStats.cr > 1) myStats.cr = 1;
        myStats.cd += 0.25;
        mybuff.cd.push(new buffInfo("+", 0.25, 7));
        mybuff.cr.push(new buffInfo("+", 0.25, 7));
    }, "The wielder has **10%** increased crit rate and deals **25%** increased crit damage during the first 7 rounds.", "The Wolf's Claw is a lance as fierce and deadly as the predator it was named after. Its sharp, spiked blade is capable of tearing through armor and flesh with ease, leaving its victims with wounds resembling the bite of a wolf. Those who wield the Wolf's Claw are known to be ruthless and cunning in battle, striking with precision and ferocity.", "unique", 251),

    // Weapons - Unique Dagger
    new weaponInfo("Felstriker", "weapon", "dagger", ["crafting", "chest"], "<:felstriker:1067235855527317605>", "https://i.imgur.com/9KlYgbf.png", "md", 30, 567, "cd", 0.05, 0.32, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mr = Math.floor(eStats.mr * 0.8);
        ebuff.mr.push(new buffInfo("*", 0.8, 8));
    }, "Decreases enemy magic resistance by **20%** for the first 8 rounds.", "The Felstriker dagger is more than just a weapon, it is a conduit for unleashing the dark powers of the netherworld. With each strike, the blade crackles with malevolent energy, leaving behind a trail of scorched earth and vanquished foes.", "unique", 252),
    new weaponInfo("Gutwrencher", "weapon", "dagger", ["chest"], "<:gutwrencher:1067235860975718500>", "https://i.imgur.com/qZOlykD.png", "atk", 38, 588, "cd", 0.08, 0.4, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr = 1;
        mybuff.cr.push(new buffInfo("=", 1, 3));
    }, "The wielder has **100%** crit rate during the first 3 rounds.", "Crafted with malice and intent, the Gutwrencher is a dagger that revels in the pain it brings to its victims. With its twisted, serrated edges, it rends and tears through flesh. Those who fall victim to its cruel embrace are left to writhe in agony, their insides twisted and mangled by the Gutwrencher's cruel touch. Beware those who wield this weapon, for it thirsts for the blood of the innocent.", "unique", 253),
    new weaponInfo("Knightfall", "weapon", "dagger", ["crafting", "chest"], "<:knightfall:1067235845423243285>", "https://i.imgur.com/n88ScAy.png", "atk", 34, 574, "atk%", 0.04, 0.17, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def += Math.floor(myStats.def * 0.1);
        myStats.mr += Math.floor(myStats.mr * 0.1);
        mybuff.def.push(new buffInfo("+", Math.floor(myStats.def * 0.1), 9999));
        mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr * 0.1), 9999));
    }, "The wielder has **10%** increased defense and magic resistance.", "Forged from the armor of vanquished knights, Knightfall is a weapon of revenge. Its sharp edge thirsts for the blood of those who dare oppose its master, striking with precision and malice. In the hands of a skilled wielder, Knightfall becomes a deadly instrument of retribution, delivering swift and unforgiving justice.", "unique", 254),
    new weaponInfo("Lacerat", "weapon", "dagger", ["crafting", "chest"], "<:lacerat:1067235847348424815>", "https://i.imgur.com/I5ONTHi.png", "atk", 31, 569, "cd", 0.04, 0.3, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.def = Math.floor(eStats.def * 0.8);
        ebuff.def.push(new buffInfo("*", 0.8, 8));
    }, "Decreases enemy defense by **20%** for the first 8 rounds.", "The Lacerat is a weapon of precision and speed. Its razor-sharp edge slices through flesh with ease, leaving behind deep, jagged wounds that take time to heal. Its handle is made of cold, hard steel that feels comfortable in the hand, allowing for quick and efficient strikes. Some say it is cursed, as those who wield it often find themselves becoming more and more ruthless and bloodthirsty over time. Beware the Lacerat, for it will only bring pain and suffering to those it touches.", "unique", 255),
    new weaponInfo("Lament", "weapon", "dagger", ["crafting", "chest"], "<:lament:1067235852293513246>", "https://i.imgur.com/ttHE1vy.png", "atk", 33, 571, "mg", 1, 3, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mg -= 2;
        eStats.mana -= 20;
        if (eStats.mg < 0) eStats.mg = 0;
        if (eStats.mana < 0) eStats.mana = 0;
        ebuff.mg.push(new buffInfo("+", -2, 9999));
    }, "Decreases enemy mana cap by **-20** mana and their mana generation by **-2**.", "As the blade of Lament sinks into its victim, a sorrowful cry echoes through the air. Born from the fires grief and loss, this dagger feeds on the pain of its victims, growing stronger with each sorrowful strike. Wielded by those seeking vengeance, Lament brings swift justice to those who have wronged them. But be warned, for those who wield this blade may find themselves consumed by its dark power.", "unique", 256),
    new weaponInfo("Lithic Blade", "weapon", "dagger", ["crafting", "chest"], "<:lithic_blade:1067235926524305498>", "https://i.imgur.com/2HDILiO.png", "atk", 35, 577, "def", 23, 116, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.def += Math.floor(myStats.def * Math.min(0.05 * Math.floor(matchStats.round / 4), 0.3));
        }, 9999));
    }, "Every 4 rounds, the wielder gets **5%** defense (max 30%).", "Forged from the ancient stones of the earth, the Lithic Blade is a weapon of unmatched sharpness and durability. With its crooked edges and piercing point, this dagger is a good choice for any adventurer setting foot into the dungeon.", "unique", 257),
    new weaponInfo("Nightfall Knife", "weapon", "dagger", ["chest"], "<:nightfall_knife:1067235931251298374>", "https://i.imgur.com/t2MrMa5.png", "md", 36, 580, "cd", 0.05, 0.3, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.br -= 0.1;
        eStats.dodge -= 0.1;
        if (eStats.br < 0) eStats.br = 0;
        if (eStats.dodge < 0) eStats.dodge = 0;
        ebuff.br.push(new buffInfo("+", -0.1, 8));
        ebuff.dodge.push(new buffInfo("+", -0.1, 8));
    }, "The enemy has **10%** decreased block rate and dodge chance during the first 8 rounds.", "As the sun sets and the darkness of night envelops the land, the Nightfall Knife awakens, thirsting for the blood of its enemies. Its sleek, black blade glints in the moonlight, promising swift and deadly retribution to those who dare to cross its path. With a single strike, it can end a life, leaving no trace except for a pool of crimson on the ground.", "unique", 258),
    new weaponInfo("Nightshade", "weapon", "dagger", ["chest"], "<:nightshade:1067235936330600528>", "https://i.imgur.com/ub6Y8Ja.png", "atk", 36, 577, "cr", 0.04, 0.16, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.critbleed = true;
        matchStats.critbleedlast = 2;
    }, "Critical Strikes cause bleeding, dealing **3%** damage to the enemy for 2 rounds.", "Forged in the shadows of the moonlit forest, Nightshade glimmers with a dark, eerie beauty. Its razor-sharp blade is imbued with the power of the night itself, capable of striking with the speed and precision of a deadly predator. Those who wield it are said to be able to move like shadows, striking from the darkness with swift and deadly force. Beware the Nightshade, for it is a weapon of the night, and those who cross its path may never see the dawn again.", "unique", 259),
    new weaponInfo("Satanic Stiletto", "weapon", "dagger", ["chest"], "<:satanic_stiletto:1067235940252270662>", "https://i.imgur.com/n5v9iEm.png", "atk", 34, 574, "cr", 0.04, 0.16, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.hp = Math.floor(myStats.hp * 0.8);
        mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp * 0.02), 9999));
        myStats.atk += Math.floor(myStats.atk * 0.2);
        myStats.md += Math.floor(myStats.md * 0.2);
        myStats.mg -= 2;
        mybuff.mg.push(new buffInfo("+", -2, 9999));
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.atk += Math.floor(myStats.atk * Math.min(0.2, 0.02 * (matchStats.round - 1)));
            myStats.md += Math.floor(myStats.md * Math.min(0.2, 0.02 * (matchStats.round - 1)));
        }, 9999));
    }, "The wielder starts with **80%** HP but has **20%** increased attack and magic damage. Additionally, each round the wielder loses **2%** of max HP and **2** mana, but gains **2%** attack and magic damage.", "The Satanic Stiletto is a weapon of darkness, forged in the depths of the underworld by a powerful devil. Its demonic handle channels the power of the underworld, giving its wielder strength and speed beyond that of mere mortals. But be warned - those who dare to wield the Satanic Stiletto will be consumed by its thirst for power and destruction, their souls doomed to be dragged down into the depths of hell.", "unique", 260),
    new weaponInfo("Serenity Thorns", "weapon", "dagger", ["chest"], "<:serenity_thorns:1067235943695785984>", "https://i.imgur.com/yT8d0aO.png", "atk", 36, 578, "mana", 5, 25, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp * 0.02), 9999));
        myStats.mg += 4;
        mybuff.mg.push(new buffInfo("+", 4, 9999));
    }, "This dagger drains **2%** of max HP from the wielder each round to increase mana gain by **+4**.", "The Serenity Thorns dagger is a weapon of deadly beauty. Its sharp blade was forged from a rare metal that glows with a serene light, as if it were imbued with the essence of nature itself. But make no mistake, this dagger is not for the faint of heart. Its thorns are designed to inflict maximum damage, and its wielder must be skilled and precise in their strikes to fully harness its power. Those who master the Serenity Thorns will find their enemies falling before them with ease, as the dagger's light guides their hand to true and swift victory.", "unique", 261),
    new weaponInfo("Silent Hurl", "weapon", "dagger", ["crafting", "chest"], "<:silent_hurl:1067236075833151600>", "https://i.imgur.com/9joiSSF.png", "atk", 31, 567, "dodge", 0.03, 0.11, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.hp.push(new buffInfo("+", -Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.03), 9999));
    }, "Poisons the enemy, dealng **3%** HP damage to the enemy every round. If enemy HP is more than twice of the wielders HP, it deals the equivalent of **6%** of the wielders HP instead.", "The Silent Hurl is a cunningly crafted blade that glides through the air with deadly precision. Its razor-sharp edge slices through enemies without a sound, leaving its victims unaware until it's too late. This dagger is the weapon of choice for assassins and thieves who value stealth and efficiency above all else. With the Silent Hurl in hand, no enemy can escape your silent strike.", "unique", 262),
    new weaponInfo("Silver Skewer", "weapon", "dagger", ["crafting", "chest"], "<:silver_skewer:1067236080094564383>", "https://i.imgur.com/UXPh1Fv.png", "atk", 32, 568, "def", 27, 116, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(10, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.br.push(new buffInfo("+", 0.2, 9999));
        }));
    }, "Block rate increases by **+20%** if the wielder survives for 10 rounds.", "Crafted from the finest silver and honed to a sharp edge, the Silver Skewer pierces through armor and flesh with ease. Its delicate handle provides a comfortable grip, allowing for precise and deadly strikes. Beware those who wield this deadly weapon, for their skill and cunning make them a formidable foe.", "unique", 263),
    new weaponInfo("Sinister Quickblade", "weapon", "dagger", ["crafting", "chest"], "<:sinister_quickblade:1067236085563936778>", "https://i.imgur.com/wjm5McE.png", "atk", 33, 570, "cd", 0.05, 0.33, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.hp / myStats.maxhp < 0.25) {
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.05), {});
            mybuff.hp.push(new buffInfo("+", myStats.maxhp * 0.05, 9999));
        } else {
            myStats.delayedBuffs.push(new delayedBuffs(0, function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp / myStats.maxhp < 0.25) {
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.05), {});
                    mybuff.hp.push(new buffInfo("+", myStats.maxhp * 0.05, 9999));
                    //@ts-ignore
                    this._used++;
                };
            }, 9999, 1));
        };
    }, "The first time the wielder's HP falls below **25%** of max HP, gains **5%** heal for every round after.", "With a sleek, curved blade and a dark, ominous handle, the Sinister Quickblade is a weapon to be feared. Its razor-sharp edge glints menacingly in the light, promising swift and deadly strikes. Those who wield it are known for their lightning-fast reflexes and deadly precision. Beware the Sinister Quickblade, for it may be the last thing you see.", "unique", 264),
    new weaponInfo("Stiletto of Desecration", "weapon", "dagger", ["crafting", "chest"], "<:stiletto_of_desecration:1067236090139914271>", "https://i.imgur.com/BHGCYBm.png", "atk", 33, 572, "mr", 26, 128, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.mr += Math.floor(myStats.mr * Math.min(0.05 * Math.floor(matchStats.round / 4), 0.3));
        }, 9999));
    }, "Every 4 rounds, the wielder gets **5%** magic resistance (max 30%).", "The Stiletto of Desecration was once used by a cult of worshippers to sacrifice their victims to their dark gods. It is said that the blade thirsts for the blood of the righteous and brings death and destruction wherever it strikes. With each kill, the Stiletto grows stronger and its power more corrupt. Those who wield it are consumed by its dark energy, becoming pawns in its never-ending quest for more death and destruction.", "unique", 265),
    new weaponInfo("Tyrhung", "weapon", "dagger", ["crafting", "chest"], "<:tyrhung:1067236208549314590>", "https://i.imgur.com/0xTinsg.png", "atk", 37, 582, "dodge", 0.03, 0.12, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodgeHeal += 0.04;
    }, "The wielder heals **4%** of max HP after successfully dodging an attack.", "The Tyrhung is a wickedly sharp dagger, said to have been crafted by the god Tyr himself. Its blade is imbued with the power of justice and is feared by evildoers. Those who wield the Tyrhung are known to strike with deadly precision and can deliver swift justice to any who dare to cross them.", "unique", 266),
    new weaponInfo("Vengeful Fang", "weapon", "dagger", ["chest"], "<:vengeful_fang:1067236213154660372>", "https://i.imgur.com/bphR5w8.png", "atk", 36, 579, "br", 0.04, 0.17, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodge += 0.12;
        mybuff.dodge.push(new buffInfo("+", 0.12, 8));
    }, "The wielder has **12%** increased dodge chance during the first 8 rounds.", "Forged from the sharpened tooth of a fallen enemy, the Vengeful Fang is a weapon of retribution and justice. Its razor-sharp edge has tasted the blood of countless foes. In the hands of a skilled assassin, this deadly dagger is a force to be reckoned with.", "unique", 267),
    new weaponInfo("Vicinity Blade", "weapon", "dagger", ["crafting", "chest"], "<:vicinity_blade:1067236219823607869>", "https://i.imgur.com/aG3cWPb.png", "atk", 42, 633, "atk", 26, 226, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // NO BUFF
    }, "None", "Crafted with precision and deadly intent, the Vicinity Blade is a weapon of stealth and cunning. Its razor-sharp edge glints in the moonlight, ready to strike at any moment and strike fear into the hearts of its foes. In the hands of a skilled assassin, the Vicinity Blade is a tool of death, able to strike from the shadows. Beware all who cross its path, for the Vicinity Blade is a weapon to be feared and respected.", "unique", 268),
    new weaponInfo("Witching Blade", "weapon", "dagger", ["crafting", "chest"], "<:witching_blade:1067236223430688818>", "https://i.imgur.com/Dg7wJCM.png", "atk", 30, 562, "hp", 82, 356, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.selfhealChance.push(1);
        myStats.selfheal.push(0.05);
    }, "Heals the wielder by **5%** of the damage dealt.", "Forged in the depths of a cursed forest, the Witching Blade is imbued with dark magic. Its razor-sharp edge is said to whisper the names of its victims as it sinks into their flesh. Those who wield the Witching Blade are feared and revered, their power growing with each soul they claim. Beware those who cross its path, for the Witching Blade hungers for blood.", "unique", 269),

    // Weapons - Unique Shield
    new weaponInfo("Cedar Cover", "weapon", "shield", ["crafting", "chest"], "<:cedar_cover:1067245941473681448>", "https://i.imgur.com/dNg7fv9.png", "shield", 74, 836, "dodge", 0.03, 0.12, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodgeHeal += 0.04;
    }, "The wielder heals **4%** of max HP after successfully dodging an attack.", "The Cedar Cover is crafted from the finest cedar wood and infused with ancient protective magic. Its sturdy, yet flexible design allows for effective blocking of enemy attacks, while its sleek and smooth surface exudes a natural elegance. With its powerful defensive capabilities, the Cedar Cover is a formidable ally in battle.", "unique", 270),
    new weaponInfo("Centurion", "weapon", "shield", ["crafting", "chest"], "<:centurion:1067245948184571914>", "https://i.imgur.com/Fdx2gVG.png", "shield", 77, 877, "br", 0.04, 0.15, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.br += 0.15;
        if (myStats.br > 1) myStats.br = 1;
        mybuff.br.push(new buffInfo("+", 0.15, 8));
    }, "The wielder has **15%** increased block rate during the first 8 rounds.", "The Centurion shield is crafted from the finest steel, imbued with the strength and courage of the ancient Roman soldiers it is named after. Its sturdy design and intricate detailing make it a formidable defense against any attack, earning it the respect of foes and allies alike. In battle, it is a symbol of honor and victory, a shield to be wielded by only the bravest and most skilled warriors.", "unique", 271),
    new weaponInfo("Ethereal Ward", "weapon", "shield", ["chest"], "<:ethereal_ward:1067245931910676540>", "https://i.imgur.com/pAFyMhQ.png", "shield", 76, 873, "dodge", 0.02, 0.11, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodge = 1;
        mybuff.dodge.push(new buffInfo("=", 1, 3));
        myStats.dodgeHeal += 0.02;
    }, "The wielder has **100%** dodge chance during the first 3 rounds. Successfully dodging attacks heals the wielder by **2%** of max HP.", "This ghostly shield is made of pure, insubstantial energy. It is almost invisible to the naked eye, but it is incredibly effective at protecting its bearer from harm.", "unique", 272),
    new weaponInfo("Honor's Grasp", "weapon", "shield", ["crafting", "chest"], "<:honors_grasp:1067246214040539249>", "https://i.imgur.com/LrPziND.png", "shield", 77, 876, "md", 21, 203, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.md += Math.floor(myStats.md * 0.2);
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.2), 9999));
    }, "The wielder has **20%** increased magic damage.", "Honor's Grasp is a shield that has protected countless warriors throughout the ages. It has been passed down from generation to generation, each bearer holding it aloft as a symbol of their unwavering commitment to upholding the virtues of courage, integrity, and valor. With its sturdy construction and powerful enchantments, Honor's Grasp is the ultimate shield for any warrior seeking to defend their honor on the battlefield.", "unique", 273),
    new weaponInfo("Ironclad Lionheart", "weapon", "shield", ["crafting", "chest"], "<:ironclad_lionheart:1067246111129096313>", "https://i.imgur.com/7Is4DLS.png", "shield", 80, 882, "atk", 23, 214, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk += Math.floor(myStats.atk * 0.2);
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
    }, "The wielder has **20%** increased attack.", "The Ironclad Lionheart is a shield forged from the finest steel, imbued with the strength and courage of a lion. Its surface is etched with the image of a majestic lion, symbolizing its unbreakable fortitude and unwavering spirit. In battle, it is a steadfast ally, protecting its wielder from even the mightiest of blows. Those who bear the Ironclad Lionheart into battle are known for their valor and fearlessness, striking fear into the hearts of their enemies.", "unique", 274),
    new weaponInfo("Overture", "weapon", "shield", ["chest"], "<:overture:1067246098810421299>", "https://i.imgur.com/lUO56sq.png", "shield", 70, 867, "cr", 0.04, 0.15, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.critbleed = true;
        matchStats.critbleedlast = 2;
    }, "Critical Strikes cause bleeding, dealing **3%** damage to the enemy for 2 rounds.", "The Overture was crafted by the finest blacksmiths in the land, using only the strongest and most resilient metals. Its intricate designs and patterns symbolize the beginning of a great battle, and its sturdy construction allows it to withstand even the most fierce of blows. It is said that those who wield this shield are destined for greatness on the battlefield.", "unique", 275),
    new weaponInfo("Recruit's Ebon Ward", "weapon", "shield", ["crafting", "chest"], "<:recruits_ebon_ward:1067246103508029551>", "https://i.imgur.com/6Aa0qul.png", "shield", 67, 866, "mg", 1, 3, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mana += 50;
        myStats.sm += 10;
    }, "Increases the wielders mana cap by **+50**. Start the battle with **+10** mana.", "The Recruit's Ebon Ward is the perfect shield for those new to the battlefield. Its sturdy construction and sleek design provide ample protection against incoming attacks, while its dark, menacing appearance strikes fear into the hearts of enemies. As you progress in your training, this shield will become a steadfast companion and a symbol of your growing strength and skill.", "unique", 276),
    new weaponInfo("Reign Breaker", "weapon", "shield", ["chest"], "<:reign_breaker:1067246107807195266>", "https://i.imgur.com/2u6Chbx.png", "shield", 76, 872, "mr", 23, 121, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mr += Math.floor(myStats.mr * 0.25);
        mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr * 0.25), 8));
    }, "The wielder has **25%** increased magic resistance during the first 8 rounds.", "Forged in the heat of battle, the Reign Breaker shield is a powerful weapon wielded by only the bravest of warriors. Its sturdy steel construction and imposing design strike fear into the hearts of enemies, and its sturdy nature allows its bearer to weather even the most ferocious of attacks. With the Reign Breaker by your side, no enemy can stand in your way.", "unique", 277),
    new weaponInfo("Secret of Echoes", "weapon", "shield", ["crafting", "chest"], "<:secret_of_echoes:1067246424397459497>", "https://i.imgur.com/AJQEHSg.png", "shield", 70, 863, "mr", 22, 126, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mr *= 1.1;
        mybuff.mr.push(new buffInfo("*", 1.1, 9999));
        myStats.mg += 5;
        mybuff.mg.push(new buffInfo("+", 5, 4));
    }, "The wielder has **10%** increased magic resistance. Get **+5** mana per round during the first 4 rounds.", "The Secret of Echoes is a powerful shield imbued with ancient magic. Its intricate carvings and symbols seem to whisper secrets of the past, allowing the wielder to anticipate their enemies' moves and counter them with ease. In battle, the shield seems to have a mind of its own, guiding its bearer to victory. Some say the shield holds the key to unlocking long-lost secrets of the ancients.", "unique", 278),
    new weaponInfo("The Grand Slab", "weapon", "shield", ["chest"], "<:the_grand_slab:1067246428407201882>", "https://i.imgur.com/KDnqgjG.png", "shield", 84, 878, "def", 24, 126, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def += Math.floor(myStats.def * 0.25);
        mybuff.def.push(new buffInfo("+", Math.floor(myStats.def * 0.25), 8));
    }, "The wielder has **25%** increased defense during the first 8 rounds.", "The massive, hulking shape of The Grand Slab is a fearsome sight on the battlefield. Forged from the strongest iron, this enormous shield is capable of withstanding even the most brutal of attacks. Its massive size and weight make it nearly impossible to shatter, and its powerful enchantments repel even the strongest of attacks. Those who wield the Grand Slab are truly indomitable.", "unique", 279),
    new weaponInfo("The Shield of Achilles", "weapon", "shield", ["crafting", "chest"], "<:the_shield_of_achilles:1067246752173920286>", "https://i.imgur.com/NSvKlBO.png", "shield", 76, 880, "mana", 5, 25, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mr *= 1.1;
        myStats.def *= 1.1;
        mybuff.mr.push(new buffInfo("*", 1.1, 9999));
        mybuff.def.push(new buffInfo("*", 1.1, 9999));
        myStats.mg += 5;
        mybuff.mg.push(new buffInfo("+", 5, 4));
    }, "The wielder has **10%** increased defense and magic resistance. Get **+5** mana per round during the first 4 rounds.", "The Shield of Achilles is said to have been crafted by the god of blacksmiths, Hephaestus, for the greatest warrior of ancient Greece, Achilles. Its surface is adorned with intricate engravings depicting the battles and triumphs of Achilles, and its metal is said to have been tempered in the fires of Mount Olympus itself. The shield is said to grant its wielder unparalleled protection in battle, and its mere presence on the battlefield is said to strike fear into the hearts of enemies.", "unique", 280),
    new weaponInfo("Timber Guard", "weapon", "shield", ["crafting", "chest"], "<:timber_guard:1067246409558016050>", "https://i.imgur.com/CWD6Qkj.png", "shield", 74, 860, "mana", 6, 30, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(6, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.sm += 30;
            if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
        }));
    }, "If the wielder survives for 6 rounds gain **30** mana.", "The Timber Guard shield is crafted from the finest oak wood, strong and sturdy enough to withstand even the most powerful of attacks. Its intricately carved design features a majestic golden jewellery in its center, symbolizing the strength and resilience of nature. With this shield by your side, you can fearlessly defend your kingdom and protect the wilds of the forest.", "unique", 281),
    new weaponInfo("Tormented Buckler", "weapon", "shield", ["crafting", "chest"], "<:tormented_buckler:1067246414448570378>", "https://i.imgur.com/RKTRRfY.png", "shield", 84, 890, "def", 22, 124, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.executeHP = Math.max(0.1, myStats.executeHP);
    }, "Executes the enemy when below **10%** HP.", "The Tormented Buckler was once a simple shield, used by a valiant knight in countless battles. But its steel has been twisted and corrupted by dark magic, imbuing it with a malevolent power. Those who wield it in battle find themselves consumed by an unquenchable bloodlust, driving them to ever greater acts of violence and destruction. Beware the Tormented Buckler, for it will lead you down a path of ruin.", "unique", 282),
    new weaponInfo("Warden of Anguish", "weapon", "shield", ["chest"], "<:warden_of_anguish:1067246418630291496>", "https://i.imgur.com/qyZetfz.png", "shield", 78, 880, "hp", 144, 386, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(10, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.4), {});
        }));
    }, "After 10 rounds, the wielder heals **40%** of missing HP.", "Forged in the depths of despair and tempered in the fires of torment, the Warden of Anguish is a shield imbued with the pain and suffering of those who have come before it. Its piercing gaze and imposing presence strike fear into the hearts of all who dare to challenge its wielder. Those who stand against the Warden of Anguish face not only a formidable barrier, but also the weight of countless souls bearing down upon them.", "unique", 283),

    // Weapons - Legendary Sword
    new weaponInfo("Blade of Carnage", "weapon", "sword", ["chest"], "<:blade_of_carnage:1068510734897647616>", "https://i.imgur.com/GshdlE7.png", "atk", 100, 888, "atk", 20, 312, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(15, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.atk.push(new buffInfo("*", 1.5, 9999));
        }));
    }, "Increases the wielders attack by **50%** after 15 rounds.", "The Blade of Carnage is a weapon of pure destruction. Forged from the molten fires of Mount Doom, this sword is imbued with the power to unleash havoc on all who dare to wield it. With a single swing, it can lay waste to entire armies, leaving nothing but a trail of death and devastation in its wake. Those who dare to face it in battle must be prepared to face their own demise, for the Blade of Carnage knows no mercy.", "legendary", 284),
    new weaponInfo("Bloodthirster", "weapon", "sword", ["crafting", "chest"], "<:bloodthirster:1068510737825267772>", "https://i.imgur.com/8kWMLzD.png", "atk", 53, 838, "md", 49, 796, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.selfhealChance.push(1);
        myStats.selfheal.push(0.075);
    }, "Heals the wielder by **7.5%** of the damage dealt.", "The Bloodthirster hungers for the taste of fresh blood, and it will not rest until it has claimed the life of every living creature in its path. Those who dare to wield it will be granted unimaginable power, but at a terrible cost. The sword thirsts for blood, and it will demand a constant sacrifice to be satisfied. The wielder will be consumed by an insatiable desire for blood, and they will be forced to kill in order to quench the sword's thirst. The Bloodthirster is a weapon of pure evil, and it is not to be trifled with.", "legendary", 285),
    new weaponInfo("Brigantia", "weapon", "sword", ["chest"], "<:brigantia:1068510742929748028>", "https://i.imgur.com/tXYyknA.png", "atk", 64, 1000, "def", 50, 200, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(13, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.atk.push(new buffInfo("*", 2, 9999));
        }));
    }, "If the wielder survives for 13 rounds doubles attack.", "The sword known as Brigantia was forged in the ancient land of Albion, named after the goddess of the same name who was worshipped by the people of the region. Brigantia was crafted by the finest smiths of the time, using the finest steel and other rare materials. It was said that the sword glowed with an otherworldly light when wielded in battle, striking fear into the hearts of its enemies. The sword was wielded by many brave warriors throughout the centuries, each one adding their own tales of victory to its legend. It was said that Brigantia never dulled or broke. One of the most famous warriors to wield Brigantia was a fierce warrior queen named Boudica. She used the sword to lead her army in a rebellion against the invaders, and many legends state that Brigantia was the key to her victories on the battlefield.\nToday, the sword is said to still exist, hidden away in a secret location, waiting for a worthy warrior to wield it once more. Many still search for it, hoping to harness its power and continue its legacy of greatness.", "legendary", 286),
    new weaponInfo("Calcifer's Edge of Annihilation", "weapon", "sword", ["chest"], "<:calcifers_edge_of_annihilation:1068510718355324968>", "https://i.imgur.com/eXDqkaX.png", "atk", 58, 867, "cd", 0.12, 0.6, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.executeHP = Math.max(0.2, myStats.executeHP);
        const bleed = Math.floor(eStats.hp > 2 * myStats.hp ? myStats.hp * 0.25 : eStats.hp * 0.125);
        eStats.hp -= Math.floor(bleed);
    }, "Executes the enemy when below **20%** HP. The enemy starts with **12.5%** less HP. If the enemy has more than twice as much HP than the wielder, it starts with **25%** less HP of the wielder instead.", "Calcifer's Edge of Annihilation is a legendary sword that was forged by the flames of a thousand suns. It glows with an otherworldly heat and has the power to cut through even the hardest of metals like a hot knife through butter. Those who wield it are said to be unstoppable in battle, their enemies falling before them like wheat before the scythe. The sword is named after the ancient fire demon Calcifer, who is said to have imbued the weapon with its incredible power. Only the bravest of warriors dare to wield Calcifer's Edge of Annihilation, for its flames can burn as hot as the depths of hell itself.", "legendary", 287),
    new weaponInfo("Draiocht", "weapon", "sword", ["crafting", "chest"], "<:draiocht:1068510723136823306>", "https://i.imgur.com/hkO7TM7.png", "atk", 47, 768, "hp", 122, 645, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const drain = Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.025);
        ebuff.hp.push(new buffInfo("+", -drain, 9999));
        mybuff.hp.push(new buffInfo("+", drain, 9999));
    }, "Drains **2.5%** HP from the enemy and adds it to the wielder every round. If enemy HP is more than twice of the wielders HP, it drains the equivalent of **5%** of the wielders HP instead.", "The legendary sword known as the Draiocht is said to have been forged by the ancient vampire lords, imbued with the power to drain the life force of its victims. Its razor-sharp blade, forged from the purest silver, is capable of slicing through flesh and bone with ease. Those who wield it are said to be blessed with the strength and immortality of the vampire race, but beware, for the sword's thirst for blood is insatiable.", "legendary", 288),
    new weaponInfo("Fafnir's Breath", "weapon", "sword", ["chest"], "<:fafnirs_breath:1068510727352111246>", "https://i.imgur.com/33iwj5O.png", "atk", 50, 820, "cd", 0.08, 0.5, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const burn = Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.04);
        ebuff.hp.push(new buffInfo("+", -burn, 9999));
    }, "Burns **4%** of max HP from the enemy every round. If enemy HP is more than twice of the wielders HP, it burns the equivalent of **8%** of the wielders HP instead.", "Fafnir's Breath was a powerful sword crafted by the dwarves during the height of their civilization. It is a powerful sword imbued with the fiery breath of the great dragon Fafnir. In battle, it is said to emit a fierce heat that can scorch enemies with the mere touch of its blade.", "legendary", 289),
    new weaponInfo("Galatine", "weapon", "sword", ["chest"], "<:galatine:1068514102261055508>", "https://i.imgur.com/h7EPRDr.png", "atk", 48, 800, "md", 48, 800, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const atk = eStats.atk, md = eStats.md;
        eStats.atk = md, eStats.md = atk;
        ebuff.atk.push(new buffInfo("=", md, 9999));
        ebuff.md.push(new buffInfo("=", atk, 9999));
    }, "Swaps enemy attack and magic damage at the start of battle.", "Galatine was a legendary sword wielded by a great hero who was said to be chosen by the gods themselves. Forged from a rare and otherworldly metal, it was said to be unbreakable and imbued with powerful magic. Its razor-sharp edge was said to never dull, and its crimson blade shone with an ethereal light that struck fear into the hearts of its enemies. Many tried to claim the sword for themselves, but none could wield its power. It was said that only the true hero, the one destined to wield Galatine, could unleash its full potential.", "legendary", 290),
    new weaponInfo("Gilded Glory", "weapon", "sword", ["crafting", "chest"], "<:gilded_glory:1068514105503252530>", "https://i.imgur.com/GU7syDr.png", "atk", 56, 848, "br", 0.06, 0.2, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.blockBuffDef += 100;
    }, "Every successful block decreases damage taken by **10%** for 6 rounds.\n\n_A reduction of 10% = 100 DEF|MR_", "The Gilded Glory is a beautiful and noble sword adorned with intricate golden patterns. It was once the prized possession of a noble knight, who fought for justice and righteousness in a time of great turmoil. The sword is said to radiate a noble, honorable energy, inspiring its wielder to greatness.", "legendary", 291),
    new weaponInfo("Iris Blade", "weapon", "sword", ["crafting", "chest"], "<:iris_blade:1068514109433331792>", "https://i.imgur.com/j0VrKW2.png", "atk", 54, 852, "mg", 1, 5, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 4 === 0) {
                myStats.sm += 10;
                if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
                eStats.sm -= 4;
                if (eStats.sm < 0) eStats.sm = 0;
            };
        }, 9999));
    }, "The wielder gets **10** mana every 4 rounds while the enemy loses **4** mana.", "The Iris Blade is a weapon of legend, forged by the powerful sorceress of Prismia using ancient magic imbued with the seven colors of the rainbow. Its blade is said to radiate with a dazzling light that changes color depending on the wielder's mood and emotions. Those who have faced the Iris Blade in battle speak of its radiant beauty, but also of the fear it instills in the hearts of its foes.", "legendary", 292),
    new weaponInfo("Laerkinn", "weapon", "sword", ["crafting", "chest"], "<:laerkinn:1068514112788779058>", "https://i.imgur.com/KcogovY.png", "atk", 53, 837, "cd", 0.07, 0.44, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr = 1;
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 4 === 0) myStats.cr = 1;
        }, 9999));
    }, "The first round and every 4th round following, the wielder has **100%** crit rate.", "Laerkinn was a fearsome sword, crafted by the dwarven smiths of the mountains. Its blade was forged from the finest steel and imbued with ancient runes of power, making it nearly indestructible. In battle, it was said to glow with a fierce, fiery light, able to melt through even the most resistant armor with ease. Many a brave warrior fell before the might of Laerkinn, and it was feared and respected by all who faced it in combat. It is said that the great warrior Thorgrimm the Unstoppable wielded Laerkinn in many of his greatest battles, and that it was instrumental in his eventual victory over the evil dragon Smaug.", "legendary", 293),
    new weaponInfo("Night Rose", "weapon", "sword", ["crafting", "chest"], "<:night_rose:1068514115250831392>", "https://i.imgur.com/d7qR486.png", "atk", 64, 872, "cr", 0.06, 0.22, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.selfhealChance.push(1);
        myStats.selfheal.push(0.06);
        myStats.mg += 2;
        eStats.mg -= 2;
        mybuff.mg.push(new buffInfo("+", 2, 9999));
        ebuff.mg.push(new buffInfo("+", -2, 9999));
    }, "Heals the wielder for **6%** of damage dealt and steals **2** mana from the enemy each round.", "The Night Rose was a legendary sword wielded by a powerful vampire known for her incredible skill in combat. Said to be forged from an otherworldly metal, the blade is said to have the ability to absorb the very light around it, creating a darkness so deep that it was said to be able to swallow the soul of anyone foolish enough to cross its path.", "legendary", 294),
    new weaponInfo("Sylphid", "weapon", "sword", ["crafting", "chest"], "<:sylphid:1068514098339385424>", "https://i.imgur.com/shli0Xb.png", "atk", 56, 858, "dodge", 0.03, 0.14, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.dodge -= 0.4;
        if (eStats.dodge < 0) eStats.dodge = 0;
        ebuff.dodge.push(new buffInfo("+", -0.4, 12));
    }, "Reduces enemy dodge chance by **40%** for the first 12 rounds.", "_The Sylphid glimmers in light, with its keen edge mesmerising on sight. With each graceful swing and thrust, it cuts through the air like a gust, leaving all who dare to face, at the mercy of its ethereal grace. Those who challenge its power and might, are quickly left in awe and fright. For the Sylphid is a force to be reckoned with, a weapon of unmatched beauty and myth._", "legendary", 295),
    new weaponInfo("The Crimson Curse", "weapon", "sword", ["crafting", "chest"], "<:the_crimson_curse:1068516014645575721>", "https://i.imgur.com/LlXRsSn.png", "atk", 52, 822, "hp", 173, 532, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.atk += Math.floor(myStats.atk * Math.min(0.33, 0.03 * (matchStats.round - 1)));
            myStats.md += Math.floor(myStats.md * Math.min(0.33, 0.03 * (matchStats.round - 1)));
        }, 9999));
        mybuff.hp.push(new buffInfo("*", 0.97, 9999));
    }, "Increases the wielders attack and magic damage by **3%** every round (up to **33%**) at the cost of losing **3%** of max HP.", "The Crimson Curse is a weapon of darkness, steeped in the blood of countless battles and cursed by dark powers. It is said that was not always the weapon of death it is now. Once a pristine, gleaming sword, it took on a reddish hue after being soaked in the blood of countless battles. Cursed by dark powers, those who dare wield it are consumed by its power, their souls forever lost to the darkness.", "legendary", 296),
    new weaponInfo("Thunderfork", "weapon", "sword", ["chest"], "<:thunderfork:1068516018823114792>", "https://i.imgur.com/Dg4cRrv.png", "atk", 53, 833, "cr", 0.06, 0.23, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 4 === 0) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:thunderfork:1068516018823114792> **${char.name}**`, { atkMultiplier: 0.8, ignoreShield: true, magicDamage: true });
            };
        }, 9999));
    }, "Fires an electric shock dealing **80%** true damage every 4 rounds.\n\n_true damage: ignores shield_", "The Thunderfork glimmered in the light, its two forks of electric energy crackling with power. It was said that the Thunderfork was crafted by the ancient dwarven smiths of the Stormpeaks, imbued with the power of the skies. In battle, the Thunderfork was a weapon of deadly precision, striking fear into the hearts of enemies. Those who wielded it were said to be able to call down the thunder itself, unleashing its devastating power upon their enemies.", "legendary", 297),
    new weaponInfo("Tizona", "weapon", "sword", ["crafting", "chest"], "<:tizona:1068516021423591534>", "https://i.imgur.com/HLw7Ar8.png", "md", 56, 837, "cd", 0.08, 0.54, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mr -= Math.floor(eStats.mr * 0.2);
        ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.2), 9999));
    }, "Decreases enemy magic resistance by **20%** for the rest of battle.", "Tizona was a sword of legend, said to have been crafted by the great elven smith Fëanor himself. Its blade was made from a single piece of the finest elven steel, and was imbued with powerful enchantments that made it incredibly sharp and strong. Tizona was wielded by the greatest warriors of the elven realm, and its power was feared by all who stood against it. It is said that Tizona was instrumental in the victory of the elves over the dark lord Morgoth, and that its power was instrumental in the downfall of the great enemy of the elves.", "legendary", 298),
    new weaponInfo("Verdant Blade", "weapon", "sword", ["chest"], "<:verdant_blade:1068517248823726101>", "https://i.imgur.com/vFOH3PF.png", "atk", 56, 848, "mr", 30, 160, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.dodge.push(new buffInfo("+", -0.03, 9999, -0.03, "+", -0.24));
        mybuff.dodge.push(new buffInfo("+", 0.03, 9999, 0.03, "+", 0.24));
    }, "Slows the enemy down, making them lose **3%** dodge chance after each round (up to **24%**), which will be added to the wielder.", "Forged in the heart of the deepest jungle, the Verdant Blade's vines are said to have been imbued with the very essence of nature itself. Its sharpened edge is capable of cutting through even the toughest of vines, while the vines that wrap around the blade are said to writhe and move on their own, striking at any who would dare to wield it against its will.", "legendary", 299),
    new weaponInfo("Whistling Thorn", "weapon", "sword", ["crafting", "chest"], "<:whistling_thorn:1068517251784921128>", "https://i.imgur.com/XQmdFr8.png", "atk", 54, 844, "def", 32, 163, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.lootm += 0.25;
        myStats.dodge += 0.1;
        if (myStats.dodge > 1) myStats.dodge = 1;
        mybuff.dodge.push(new buffInfo("+", 0.1, 9999));
    }, "Increases coins earned from the dungeon by **25%**. The wielder has **10%** increased dodge chance for the rest of battle.", "The Whistling Thorn is a sword that sings with the winds, its sharpened edge slicing through the air with a high-pitched whistle. Its name is said to come from the sound it makes as it slices through its enemies, leaving a trail of destruction in its wake. Those who wield the Whistling Thorn are said to be swift and deadly, their strikes leaving their foes stunned and confused. Be warned, for this sword is not to be underestimated.", "legendary", 300),

    // Weapons - Legendary Staff
    new weaponInfo("Aetherius", "weapon", "staff", ["chest"], "<:aetherius:1068521926194122793>", "https://i.imgur.com/47fevDQ.png", "md", 46, 781, "md", 28, 342, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.sm / myStats.mana >= 0.8) myStats.md += Math.floor(myStats.md * 0.2);
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.sm / myStats.mana >= 0.8) myStats.md += Math.floor(myStats.md * 0.2);
        }, 9999));
    }, "The wielder gains an additional **20%** magic damage buff when their mana bar is at least **80%** full.", "Aetherius is imbued with the very essence of the skies, channeling the boundless power of the heavens into devastating blasts of magical energy. Those who wield it are said to be able to call down the wrath of the gods themselves, smiting their foes with the fury of the storm.", "legendary", 301),
    new weaponInfo("Avalon's Fury", "weapon", "staff", ["chest"], "<:avalons_fury:1068521931063689316>", "https://i.imgur.com/EMNhQn4.png", "md", 54, 847, "md%", 0.06, 0.18, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const burn = Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.04);
        ebuff.hp.push(new buffInfo("+", -burn, 9999));
    }, "Burns **4%** of max HP from the enemy every round. If enemy HP is more than twice of the wielders HP, it burns the equivalent of **8%** of the wielders HP instead.", "Avalon's Fury is a staff of ancient power, wielded by the most skilled and powerful of magicians. With a single swing, it can summon forth a storm of lightning and fire, scorching the earth and laying waste to entire armies. Those who dare to wield its power must be prepared to face the fury of the elements, for Avalon's Fury is a weapon not to be trifled with.", "legendary", 302),
    new weaponInfo("Eye of the Leviathan", "weapon", "staff", ["crafting", "chest"], "<:eye_of_the_leviathan:1068521936340140152>", "https://i.imgur.com/PMu7rOE.png", "md", 50, 820, "cd", 0.08, 0.5, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const def = eStats.def, mr = eStats.mr;
        eStats.def = mr;
        eStats.mr = def;
        ebuff.def.push(new buffInfo("=", mr, 9999));
        ebuff.mr.push(new buffInfo("=", def, 9999));
    }, "Swaps enemy defense and magic resistance at the start of battle.", "The Eye of the Leviathan is a staff imbued with the ancient magic of the sea. It is said to have been crafted from the very bones of the leviathan, a creature of unimaginable power. Those who wield the staff can call upon the strength of the ocean, summoning waves and storms to do their bidding. But be warned, for the Eye of the Leviathan is not to be trifled with. Its power is great, but it comes with a price - those who abuse its power may find themselves consumed by the very forces they sought to control.", "legendary", 303),
    new weaponInfo("Gaze of Vanity", "weapon", "staff", ["crafting", "chest"], "<:gaze_of_vanity:1068521914718507099>", "https://i.imgur.com/sJBR4yr.png", "md", 54, 843, "def", 20, 134, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.lootm += 0.25;
        myStats.br += 0.1;
        if (myStats.br > 1) myStats.br = 1;
        mybuff.br.push(new buffInfo("+", 0.1, 9999));
    }, "Increases coins earned from the dungeon by **25%**. The wielder has **10%** increased block rate for the rest of battle.", "With the Gaze of Vanity, the wielder can cast a spell of seduction and charm, causing all who gaze upon them to become enchanted by their beauty. However, the staff also feeds on the vanity of its wielder, tempting them to indulge in their own self-absorption and causing them to neglect the needs of others. Use with caution, for the Gaze of Vanity can be both a weapon and a curse.", "legendary", 304),
    new weaponInfo("Grand Staff of the Cataclysm", "weapon", "staff", ["crafting", "chest"], "<:grand_staff_of_the_cataclysm:1068521918518530058>", "https://i.imgur.com/r68AtLr.png", "md", 55, 857, "mana", 10, 40, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.sm += 15;
        if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
        myStats.mg += 5;
        mybuff.mg.push(new buffInfo("+", 5, 5));
    }, "The wielder starts with **+15** mana and gets **+5** more mana each round for the first 5 rounds.", "The Grand Staff of the Cataclysm is a powerful and ancient relic, created for the sole purpose of destruction. With its mere presence, it can unleash devastating earthquakes and tidal waves, bringing entire civilizations to their knees. Only the bravest and most skilled wielders dare to harness its destructive power, for fear of being consumed by its might. The staff is said to have been crafted by the gods themselves, as a tool of punishment for the mortal world. Its power is great, but so too is the responsibility that comes with wielding it.", "legendary", 305),
    new weaponInfo("Lightning Projectile", "weapon", "staff", ["chest"], "<:lightning_projectile:1068521921118998540>", "https://i.imgur.com/mwtayF2.png", "md", 50, 820, "cd", 0.07, 0.5, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:lightning_projectile:1068521921118998540> **${char.name}**`, { atkMultiplier: 2, magicDamage: true });
    }, "Immediately after the battle begins, deals **200%** damage to the enemy.", "The Lightning Projectile crackles with energy, harnessing the power of the storm to unleash bolts of lightning at the wielder's command. Its ancient magic imbues the staff with the ability to project streams of electricity, illuminating the darkest of battlefields. In the hands of a skilled sorcerer, the Lightning Projectile becomes a formidable weapon, capable of decimating even the strongest of foes.", "legendary", 306),
    new weaponInfo("Nightkiss", "weapon", "staff", ["crafting", "chest"], "<:nightkiss:1068523509728415854>", "https://i.imgur.com/wpwQoZo.png", "md", 53, 844, "mr", 25, 143, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.dodge = 0;
        ebuff.dodge.push(new buffInfo("=", 0, 6));
    }, "The enemy starts with **0%** dodge chance which lasts for 6 rounds.", "The Nightkiss staff is imbued with the power of the night sky, allowing its wielder to call upon the darkness to envelop their foes. With each swing of the staff, tendrils of shadow dance and writhe, ensnaring those foolish enough to stand in the user's way. But beware, for the Nightkiss staff also has a thirst for life, drawing the very essence from those it touches. Only the strongest and most disciplined can wield its power without succumbing to its deadly allure.", "legendary", 307),
    new weaponInfo("Phantomsong", "weapon", "staff", ["crafting", "chest"], "<:phantomsong:1068524229542285353>", "https://i.imgur.com/DkIK3EX.png", "md", 56, 857, "mr", 26, 148, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mdChance += 1;
    }, "Forces the enemy to deal magic damage.", "The Phantomsong staff vibrates with a haunting melody that echoes through the minds of those who hear it. It is said to be able to summon the spirits of the dead, allowing the wielder to control and manipulate their essence to do their bidding. But be warned, for the spirits are not always willing and may seek revenge on those who dare to enslave them. Use the Phantomsong wisely, for its power comes with a great cost.", "legendary", 308),
    new weaponInfo("Protector of Frost", "weapon", "staff", ["crafting", "chest"], "<:protector_of_frost:1068524269514002493>", "https://i.imgur.com/rxBYFLN.png", "md", 50, 820, "cd", 0.08, 0.5, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.dodge -= 0.25;
        eStats.br -= 0.25;
        if (eStats.dodge < 0) eStats.dodge = 0;
        if (eStats.br < 0) eStats.br = 0;
        ebuff.dodge.push(new buffInfo("+", -0.25, 9999));
        ebuff.br.push(new buffInfo("+", -0.25, 9999));
    }, "Slows the enemy down, decreasing both dodge chance and block rate by **25%** permanently.", "Forged from pure glacial ice and imbued with ancient frost magic, the Protector of Frost is a powerful staff in the hands of a skilled mage. Its icy grip chills the air around it, freezing enemies in their tracks and protecting its wielder from harm. With its icy power, the staff can unleash devastating blasts of frost, encasing foes in sheets of ice and leaving them vulnerable to attack. In the hands of a true master, the Protector of Frost is a force to be reckoned with.", "legendary", 309),
    new weaponInfo("Runed Spire", "weapon", "staff", ["crafting", "chest"], "<:runed_spire:1068524321460473857>", "https://i.imgur.com/M9PXwBd.png", "md", 52, 841, "cd", 0.07, 0.37, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr += 0.16;
        if (myStats.cr > 1) myStats.cr = 1;
        eStats.cr -= 0.1;
        if (eStats.cr < 0) eStats.cr = 0;
        mybuff.cr.push(new buffInfo("+", 0.16, 9999));
        ebuff.cr.push(new buffInfo("+", -0.1, 9999));
    }, "Increases the wielders crit rate by **16%** and decreases enemy crit rate by **10%** for the rest of battle.", "The Runed Spire is a powerful magic staff imbued with ancient runes that grant its wielder access to the most potent spells known to man. Those who hold it are said to be able to call upon the elements themselves, summoning forth storms, earthquakes, and even the fire of the sun to smite their enemies. Yet, with great power comes great responsibility, and only those with a pure heart and unwavering conviction can wield the Runed Spire without falling victim to its destructive potential.", "legendary", 310),
    new weaponInfo("Sanguine", "weapon", "staff", ["chest"], "<:sanguine:1068523524299432037>", "https://i.imgur.com/8HwOh3D.png", "md", 52, 849, "hp", 204, 576, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const drain = Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.025);
        ebuff.hp.push(new buffInfo("+", -drain, 9999));
        mybuff.hp.push(new buffInfo("+", drain, 9999));
    }, "Drains **2.5%** HP from the enemy and adds it to the wielder every round. If enemy HP is more than twice of the wielders HP, it drains the equivalent of **5%** of the wielders HP instead.", "The Sanguine staff is said to have been crafted from the bones of fallen warriors, imbued with the power of their spilled blood. Those who wield it are said to be able to channel the strength and determination of the dead, and to harness their fighting spirit to strike down their enemies with ferocity and deadly precision. Some say that the staff itself thirsts for battle, and will only bond with those who are truly dedicated to the art of war. Others whisper that it is cursed, and that those who use it will eventually be consumed by the very power they seek to wield. Whether legend or truth, the Sanguine staff is a weapon to be feared and respected.", "legendary", 311),
    new weaponInfo("The Conch's Calling", "weapon", "staff", ["crafting", "chest"], "<:the_conchs_calling:1068523528015593542>", "https://i.imgur.com/rowNtXF.png", "md", 52, 836, "hp", 202, 524, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(12, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.6), {});
        }));
    }, "After 12 rounds, the wielder heals **60%** of missing HP.", "The Conch's Calling is a magical staff that has the power to call upon the might of the ocean. Those who wield it are able to summon the power of the waves, summoning huge tidal waves and powerful currents to crash down upon their enemies. With the staff in hand, you will be able to control the very tides and unleash their fury upon all those who stand in your way.", "legendary", 312),
    new weaponInfo("The Staff of Asclepius", "weapon", "staff", ["crafting", "chest"], "<:the_staff_of_asclepius:1068528525461696622>", "https://i.imgur.com/vd4PoRV.png", "md", 54, 844, "hp", 233, 607, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.06), 5));
        myStats.delayedBuffs.push(new delayedBuffs(8, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.03), 9999));
        }));
    }, "Heals the wielder by **6%** of max HP for the first 5 rounds. After that it decreases to **3%**.", "In the hands of a skilled wielder, the Staff of Asclepius possesses the power to heal even the most dire of wounds. Carved from the sacred wood of the Asclepius tree and imbued with ancient healing magic, this staff is a powerful tool for any adventurer in need of rejuvenation.", "legendary", 313),
    new weaponInfo("The Staff of the Archmagus", "weapon", "staff", ["crafting", "chest"], "<:the_staff_of_the_archmagus:1068528777317064885>", "https://i.imgur.com/hkw5WRr.png", "md", 56, 852, "sm", 2, 10, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.sm -= 10;
        if (eStats.sm < 0) eStats.sm = 0;
        eStats.mg -= 2;
        ebuff.mg.push(new buffInfo("+", -2, 9999));
    }, "The enemy starts with **-10** mana, decreases mana generation by **2** for the rest of battle.", "The Staff of the Archmagus is imbued with powerful arcane energies, allowing its wielder to tap into the vast reserves of magical power. With a simple gesture, the staff can unleash devastating spells or protect its user from harm. The intricate designs etched into its surface glow with a faint, otherworldly light, a testament to the ancient knowledge imbued within it. Those who dare to wield the Staff of the Archmagus must be prepared to face the consequences of wielding such immense power.", "legendary", 314),
    new weaponInfo("The Voice of Infinite Trials", "weapon", "staff", ["chest"], "<:the_voice_of_infinite_trials:1068528788830437386>", "https://i.imgur.com/A8NrV7e.png", "md", 55, 845, "br", 0.05, 0.2, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.md += Math.floor(myStats.md * Math.min(0.04 * Math.floor(matchStats.round / 3), 0.24));
        }, 9999));
    }, "Every 3 rounds, the wielder gets **4%** magic damage (max 24%).", "The Voice of Infinite Trials is a powerful staff that allows its wielder to summon the voices of ancient trials and hardships. Those who have survived the most grueling challenges of the past speak through this staff, offering wisdom and guidance to those who seek it. With the Voice of Infinite Trials, one can overcome any obstacle and emerge victorious.", "legendary", 315),
    new weaponInfo("Vainglorious Staff", "weapon", "staff", ["chest"], "<:vainglorious_staff:1068528521116401674>", "https://i.imgur.com/c9wTPEn.png", "md", 53, 837, "atk", 44, 726, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.atk -= Math.floor(eStats.atk * 0.15);
        eStats.md -= Math.floor(eStats.md * 0.15);
        ebuff.atk.push(new buffInfo("+", -Math.floor(eStats.atk * 0.15), 9999));
        ebuff.md.push(new buffInfo("+", -Math.floor(eStats.md * 0.15), 9999));
    }, "Decreases enemy attack and magic damage by **15%** for the rest of battle.", "The Vainglorious Staff glows with a dazzling light, emanating a sense of pride and arrogance. Its intricate designs and opulent details reflect the vanity of its wielder, tempting them to use its power for their own self-aggrandizement. Beware the temptation of vainglory, for it can lead to destruction and ruin.", "legendary", 316),
    new weaponInfo("Venomshank", "weapon", "staff", ["chest"], "<:venomshank:1068529328763191386>", "https://i.imgur.com/miF4cfg.png", "md", 51, 843, "md%", 0.06, 0.17, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 4 === 0) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:venomshank:1068529328763191386> **${char.name}**`, { atkMultiplier: 0.6, ignoreShield: true, magicDamage: true });
            };
        }, 9999));
    }, "Stings the enemy every 4 rounds dealing **60%** true damage.\n\n_true damage: ignores shield_", "The Venomshank staff is imbued with the deadly powers of venom. With each strike, it unleashes a toxic blast that corrupts all those it touches. Beware the wrath of the Venomshank, for its sting is fatal.", "legendary", 317),
    new weaponInfo("Verdant Vortex", "weapon", "staff", ["crafting", "chest"], "<:verdant_vortex:1068529325806194698>", "https://i.imgur.com/HbyZLLj.png", "md", 51, 833, "dodge", 0.03, 0.14, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodgeHeal += 0.05;
    }, "The wielder heals **5%** of max HP after successfully dodging an attack.", "The Verdant Vortex is a powerful staff imbued with the magic of the natural world. Its swirling green energy draws upon the life force of the earth, channelling it into devastating spells that can decimate entire mountains. Those who wield the Verdant Vortex are granted the power to summon forth tempests of wind and rain, unleash the fury of the earth, and bend the very fabric of nature to their will.", "legendary", 318),

    // Weapons - Legendary Axe
    new weaponInfo("Cairbre's Curse", "weapon", "axe", ["crafting", "chest"], "<:cairbres_curse:1068531119122825267>", "https://i.imgur.com/IWTvChe.png", "atk", 57, 856, "cr", 0.04, 0.16, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.critbleed = true;
        matchStats.critbleedlast = 3;
    }, "Critical Strikes cause bleeding, dealing **3%** damage to the enemy for 3 rounds.", "Forged by the ancient Celtic king Cairbre, Cairbre's Curse is said to be imbued with the power of poison. Its blade is coated with a deadly toxin that can kill with a single strike, a tiny scratch shall suffice. Those who wield it are said to be granted the cunning of Cairbre himself, and can strike fear into the hearts of their enemies.", "legendary", 319),
    new weaponInfo("Death's Bite", "weapon", "axe", ["crafting", "chest"], "<:deaths_bite:1068531123702992998>", "https://i.imgur.com/iLLjuEw.png", "atk", 58, 867, "cd", 0.06, 0.35, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr = 1;
        mybuff.cr.push(new buffInfo("=", 1, 4));
    }, "The wielder has **100%** crit rate during the first 4 rounds.", "As Death's Bite descends upon its foes, its sharp blade glints in the light, ready to deliver the final blow. With each swing, the axe unleashes a powerful and deadly force, tearing through armor and flesh with ease. Those who dare to face it in combat will feel the cold embrace of death in its devastating strikes.", "legendary", 320),
    new weaponInfo("Death's Fragrance", "weapon", "axe", ["chest"], "<:deaths_fragrance:1068531128065077389>", "https://i.imgur.com/bXI5QCd.png", "atk", 60, 884, "cd", 0.05, 0.37, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const burn = Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.03);
        ebuff.hp.push(new buffInfo("+", -burn, 5));
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:deaths_fragrance:1068531128065077389> **${char.name}**`, { atkMultiplier: 1.6, magicDamage: true });
    }, "Immediately after the battle begins, deals **160%** damage to the enemy. Then burns **3%** of max HP from the enemy for the next 5 rounds. If enemy HP is more than twice of the wielders HP, it burns the equivalent of **6%** of the wielders HP instead.", "As Death's Fragrance cleaves through the air, the scent of decay and destruction follows in its wake. Those who dare to stand against its wielder are met with a swift and brutal end, their bodies left to rot as a warning to others. In the heat of battle, this fearsome axe is a harbinger of death, bringing forth the end of all who oppose it.", "legendary", 321),
    new weaponInfo("Demonic Gram", "weapon", "axe", ["chest"], "<:demonic_gram:1068531132099993751>", "https://i.imgur.com/a1aoIZP.png", "atk", 56, 847, "md", 39, 683, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(3, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.def -= Math.floor(Math.min(eStats.def * (0.04 * Math.min(10, matchStats.round)), 1055));
        }));
    }, "Curses the enemy, decreasing **4%** of defense each round (up to 40%, max 3x damage)", "The Demonic Gram is a fearsome weapon crafted from the bones and blood of ancient demons. Those who wield this axe are known for their unmatched ferocity in battle, as the demonic power within the weapon drives them to unleash unbridled destruction upon their foes. Fear the Demonic Gram, for it is the harbinger of death and destruction.", "legendary", 322),
    new weaponInfo("Dragon's Maw", "weapon", "axe", ["crafting", "chest"], "<:dragons_maw:1068531134335557704>", "https://i.imgur.com/AqfYbB0.png", "atk", 48, 820, "md", 48, 820, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk *= 2, myStats.md *= 2;
        mybuff.atk.push(new buffInfo("*", 2, 1));
        mybuff.md.push(new buffInfo("*", 2, 1));
    }, "The wielder has **200%** attack and magic damage during the first 2 rounds.", "The Dragon's Maw is a formidable weapon, forged from the molten breath of a great dragon. Its razor-sharp edge can tear through armor and shields with ease, leaving its enemies quivering in fear at the sight of its fearsome maw. Wielded by the bravest of warriors, the Dragon's Maw is a symbol of power and destruction on the battlefield.", "legendary", 323),
    new weaponInfo("Fyrdcleaver", "weapon", "axe", ["crafting", "chest"], "<:fyrdcleaver:1068531137540018238>", "https://i.imgur.com/fsjlg5M.png", "atk", 57, 866, "def", 22, 125, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.executeHP = Math.max(0.15, myStats.executeHP);
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.1), 10));
        myStats.atk += Math.floor(myStats.atk * 0.1);
    }, "Executes the enemy when below **15%** HP. Increases the wielders attack by **10%** during the first 10 rounds.", "The Fyrdcleaver is a weapon feared by all who stand in its path. Forged by the finest blacksmiths in the land, its deadly edge is capable of cleaving through armor and bone with a single swing. Those who wield it in battle strike fear into the hearts of their enemies, and its name is whispered with respect and awe.", "legendary", 324),
    new weaponInfo("Mourning Moon of the Fallen Kingdom", "weapon", "axe", ["crafting", "chest"], "<:MourningMoonOfTheFallenKingdom:1068531141902090340>", "https://i.imgur.com/xzzdyz6.png", "atk", 56, 858, "cr", 0.05, 0.17, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cd += 0.5;
        mybuff.cd.push(new buffInfo("+", 0.5, 3));
        myStats.delayedBuffs.push(new delayedBuffs(3, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.cd.push(new buffInfo("+", 0.2, 9999));
        }));
    }, "The wielder has **50%** increased crit damage during the first 3 rounds, which then drops to **20%** for the rest of battle.", "_The sharp blade of the Mourning Moon of the Fallen Kingdom glints in the moonlight, ready to strike down those who would seek to destroy the remnants of a once great civilization. As the axe falls, the spirits of the fallen rise to join the battle and defend their kingdom to the bitter end._", "legendary", 325),
    new weaponInfo("Pentient Hill's Soliloquy", "weapon", "axe", ["crafting", "chest"], "<:pentient_hills_soliloquy:1068531144850690179>", "https://i.imgur.com/Pdpqxfy.png", "atk", 57, 874, "mr", 20, 125, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodge = 1;
        mybuff.dodge.push(new buffInfo("=", 1, 3));
        myStats.dodgeHeal += 0.03;
    }, "The wielder has **100%** dodge chance during the first 3 rounds. Successfully dodging attacks heals the wielder by **3%** of max HP.", "As the battle rages on, the axe known as Pentient Hill's Soliloquy sings its song of destruction. With each swing, it speaks of the fallen and the forgotten, each strike delivering justice for those who can no longer defend themselves. Its voice echoes through the chaos, a constant reminder of the power of the fallen and their never-ending quest for vengeance.", "legendary", 326),
    new weaponInfo("Scourgeborne", "weapon", "axe", ["crafting", "chest"], "<:scourgeborne:1068531148092887110>", "https://i.imgur.com/R3qYosN.png", "atk", 58, 876, "dodge", 0.03, 0.13, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.ignoreShield = true;
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.15), 10));
        myStats.atk += Math.floor(myStats.atk * 0.15);
    }, "All attacks deal true damage. The wielder has **15%** increased attack.\n\n_true damage: ignores shield_", "Forged in the depths of a cursed land, the Scourgeborne axe was once wielded by a ruthless warlord who sought to spread destruction and misery wherever he went. Those who face it in combat are met with a slow and brutal death, as the Scourgeborne cleaves through their armor and flesh. Only the strongest and bravest warriors dare to wield this weapon, for it is known to consume the souls of those who wield it for too long.", "legendary", 327),
    new weaponInfo("Skull Splitter", "weapon", "axe", ["chest"], "<:skull_splitter:1068531151897120768>", "https://i.imgur.com/pcPfdy9.png", "atk", 60, 877, "br", 0.05, 0.17, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.blockBuffDef += 155;
    }, "Every successful block decreases damage taken by **15%** for 6 rounds.\n\n_A reduction of 15% = 155 DEF|MR_", "With a single swing of the Skull Splitter, even the toughest of foes will fall before you. Its razor-sharp edge and brutal design strike fear into the hearts of those who dare to face it. This is a weapon of pure destruction, fit for only the most fearsome warriors.", "legendary", 328),
    new weaponInfo("Usurper", "weapon", "axe", ["crafting", "chest"], "<:usurper:1068531154547920926>", "https://i.imgur.com/OpgBaez.png", "atk", 56, 876, "mana", 10, 30, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.sm += 20;
        if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
        myStats.mg += 2;
        mybuff.mg.push(new buffInfo("+", 2, 9999));
    }, "The wielder starts with **+20** mana. Increases mana generation by **+2** for the rest of battle.", "The Usurper battle axe was forged by the hands of a deposed king, who used its deadly edge to reclaim his throne. Its heavy steel head is etched with the faces of those who stood in his way, a grim reminder of the fate that awaits all who challenge its wielder's rule. In the heat of battle, the Usurper sings with a bloodthirsty hunger, eager to slice through armor and flesh with ruthless efficiency. Those who face its fury will know the true meaning of power.", "legendary", 329),
    new weaponInfo("Warbringer", "weapon", "axe", ["crafting", "chest"], "<:warbringer:1068531618400174240>", "https://i.imgur.com/VLJZRiN.png", "atk", 57, 864, "mr", 23, 119, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.executeHP = Math.max(0.15, myStats.executeHP);
        myStats.md += Math.floor(myStats.md * 0.1);
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.1), 10));
    }, "Executes the enemy when below **15%** HP. Increases the wielders magic damage by **10%** during the first 10 rounds.", "The Warbringer is a fearsome weapon, forged in the heat of battle and tempered in the fires of war. Its sharp, double-edged blade is capable of cleaving through armor and bone with ease, and its sturdy haft allows for powerful, crushing blows. In the hands of a skilled warrior, the Warbringer becomes a force to be reckoned with, striking fear into the hearts of enemies and bringing swift victory to its wielder.", "legendary", 330),
    new weaponInfo("Whisper of Woe", "weapon", "axe", ["crafting", "chest"], "<:whisper_of_woe:1068531160126332928>", "https://i.imgur.com/TO09o0Z.png", "atk", 55, 865, "mana", 10, 30, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.sm += Math.floor(eStats.sm * 0.5);
        eStats.sm -= Math.floor(eStats.sm * 0.5);
        myStats.mg += 2;
        eStats.mg -= 2;
        mybuff.mg.push(new buffInfo("+", 2, 8));
        ebuff.mg.push(new buffInfo("+", -2, 8));
    }, "Steals half of the opponents starting mana, and **2** more each round lasting 8 rounds.", "The Whisper of Woe is a formidable battle axe that was once wielded by the fearsome warlord, Grendal the Terrible. Its blade is crafted from the finest steel, and is said to whisper a chilling tune as it slices through the air, striking fear into the hearts of its enemies. Those who dare to face it in combat will find themselves overcome with sorrow, as the Whisper of Woe brings swift and merciless destruction. Its power is not to be underestimated, for it carries the weight of countless battles and the whispers of countless foes.", "legendary", 331),
    new weaponInfo("Wrathbringer", "weapon", "axe", ["chest"], "<:wrathbringer:1068531163586625556>", "https://i.imgur.com/33NFjS0.png", "atk", 60, 880, "cd", 0.06, 0.42, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.atk += Math.floor(myStats.atk * Math.min(0.4, (0.1 * Math.floor(matchStats.round / 5))));
        }, 9999));
    }, "Increases the wielders attack by **10%** every 5 rounds (up to **40%**).", "The Wrathbringer is a weapon of pure fury, possessing the power to unleash destruction upon any who dare to stand in its path. With each swing of its mighty axe head, the wielder feels the raw, uncontrollable anger coursing through their veins, driving them to seek out their enemies and crush them with unbridled force.", "legendary", 332),

    // Weapons - Legendary Bow
    new weaponInfo("Aldwin Glade", "weapon", "bow", ["crafting", "chest"], "<:aldwin_glade:1068643227676180570>", "https://i.imgur.com/L2ERtLy.png", "atk", 44, 679, "atk", 23, 356, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk += Math.floor(myStats.atk * 0.2);
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
    }, "The wielder has **20%** increased attack for the rest of battle.", "The bow known as Aldwin Glade was crafted by the skilled hands of the elven archers of the Aldarwood Forest. Light as a feather and deadly accurate, this bow has been passed down through the generations, serving as a symbol of the elves' unrivaled skill with the bow and arrow. Its sleek design and intricate patterns etched into the wood are a testament to the elves' artistry, making it a weapon worthy of a true archer.", "legendary", 333),
    new weaponInfo("Armageddon", "weapon", "bow", ["chest"], "<:armageddon:1068643230289236001>", "https://i.imgur.com/HlLXCYW.png", "atk", 42, 778, "atk", 26, 326, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (Math.random() < 0.3) dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:armageddon:1068643230289236001> **${char.name}**`, { atkMultiplier: 0.5, magicDamage: true });
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (Math.random() < 0.3) dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:armageddon:1068643230289236001> **${char.name}**`, { atkMultiplier: 0.5, magicDamage: true });
        }, 9999));
    }, "Every round there's a **30%** chance of the bow firing an attack dealing **50%** of the users damage.", "Armageddon is a legendary bow that was said to have been wielded by an archangel during the great battle between the forces of good and evil at the end of days. The bow itself is made of a shimmering green metal, with intricate carvings and designs etched into its surface. The bowstring is made of a shimmering silver material that is said to be unbreakable. According to legend, Armageddon has the power to unleash a barrage of arrows that can pierce through any armor or barrier, and can bring down even the most powerful of creatures with a single shot.\nAs the archangel fought against the forces of evil, he used Armageddon to devastating effect, unleashing a storm of arrows that cut down his enemies and paved the way for the victory of the forces of good. After the great battle, the archangel is said to have disappeared, taking Armageddon with him. Some say that the bow remains hidden, waiting to be wielded again during a battle between good and evil. Others believe that it was lost to the ages, its power and significance fading into legend.", "legendary", 334),
    new weaponInfo("Brisingamen", "weapon", "bow", ["crafting", "chest"], "<:brisingamen:1068643234550657134>", "https://i.imgur.com/8YZ9WuY.png", "md", 57, 865, "br", 0.06, 0.22, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.md += Math.floor(myStats.md * 0.2);
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.2), 9999));
    }, "The wielder has **20%** increased magic damage for the rest of battle.", "The Brisingamen is a bow crafted from the finest yew wood and imbued with the power of the sun. Its golden string sings with the light of a thousand dawns, sending arrows flying true and swift to pierce the hearts of foes. Those who wield the Brisingamen are said to be blessed with the speed and grace of the goddess Freya, making them a force to be reckoned with on the battlefield.", "legendary", 335),
    new weaponInfo("Crossbow of Zeal", "weapon", "bow", ["crafting", "chest"], "<:crossbow_of_zeal:1068643237750911156>", "https://i.imgur.com/9X8qyI3.png", "atk", 52, 812, "hp", 216, 828, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.hp / myStats.maxhp < 0.5) {
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, myStats.maxhp - myStats.hp, {});
            notice.push(`\n<:crossbow_of_zeal:1068643237750911156> ${char.name} made a complete recovery!`);
        } else {
            myStats.delayedBuffs.push(new delayedBuffs(0, function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp / myStats.maxhp < 0.5) {
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, myStats.maxhp - myStats.hp, {});
                    notice.push(`\n<:crossbow_of_zeal:1068643237750911156> ${char.name} made a complete recovery!`);
                    //@ts-ignore
                    this._used++;
                };
            }, 9999, 1));
        };
    }, "Heals the wielder completely the first time the their HP falls below **50%** of max HP.", "The Crossbow of Zeal was crafted by a group of skilled elven archers, who sought to create a weapon that could harness the passion and determination of its wielder. The bowstring is made from the sinews of a fierce dragon, imbuing it with the creature's unyielding spirit and fiery determination. The grip is adorned with rare jewellery, symbolizing the unity and strength of the archers who created it.\nLegend has it that the Crossbow of Zeal was used by a group of elven archers to defend their forest from a group of marauding orcs. The orcs were known for their brutal strength and ferocity, but the elven archers, wielding the Crossbow of Zeal, were able to stand their ground and ultimately emerge victorious.", "legendary", 336),
    new weaponInfo("Draupnir's Mist", "weapon", "bow", ["crafting", "chest"], "<:draupnirs_mist:1068643241467068486>", "https://i.imgur.com/m2W0eDu.png", "atk", 53, 842, "def", 25, 146, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.hp / myStats.maxhp < 0.5) {
            myStats.def += Math.floor(myStats.def * 0.2);
            myStats.mr += Math.floor(myStats.mr * 0.2);
            mybuff.def.push(new buffInfo("+", Math.floor(myStats.def * 0.2), 12));
            mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr * 0.2), 12));
            notice.push(`\n<:draupnirs_mist:1068643241467068486> ${char.name} increased DEF and MR by **20%**!`);
        } else {
            myStats.delayedBuffs.push(new delayedBuffs(0, function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp / myStats.maxhp < 0.5) {
                    myStats.def += Math.floor(myStats.def * 0.2);
                    myStats.mr += Math.floor(myStats.mr * 0.2);
                    mybuff.def.push(new buffInfo("+", Math.floor(myStats.def * 0.2), 12));
                    mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr * 0.2), 12));
                    notice.push(`\n<:draupnirs_mist:1068643241467068486> ${char.name} increased DEF and MR by **20%**!`);
                    //@ts-ignore
                    this._used++;
                };
            }, 9999, 1));
        };
    }, "Increases the wielders defense and magic resistance by **20%** for 12 rounds after the first time the wielders HP falls below **60%**.", "The fabled Draupnir's Mist, crafted by the skilled hands of the dwarves and imbued with their mastery of magic. With each shot, the bow multiplies its arrows, raining destruction upon the battlefield. Those who wield it are said to never run out of ammunition and always have the upper hand in combat.", "legendary", 337),
    new weaponInfo("Eivorssath", "weapon", "bow", ["chest"], "<:eivorssath:1068643244130443334>", "https://i.imgur.com/1JxBv6F.png", "atk", 55, 847, "atk%", 0.04, 0.19, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 4 === 0) {
                myStats.atk += Math.floor(myStats.atk * 0.4);
            };
        }, 9999));
    }, "Every 4 rounds the wielder has **40%** increased attack.", "Eivorssath is a powerful bow crafted by the ancient Norse warriors of legend. Its name, meaning \"warrior's path\" in Old Norse, is etched into the bow's gleaming wood. When drawn, the bow sings with the strength and determination of its wielder, striking fear into the hearts of their enemies. Only the bravest and most skilled warriors are worthy of wielding \"Eivorssath\" on the battlefield.", "legendary", 338),
    new weaponInfo("Eldritch Bow of Wisdom", "weapon", "bow", ["chest"], "<:eldritch_bow_of_wisdom:1068643247301345320>", "https://i.imgur.com/eKmWUAA.png", "atk", 54, 838, "cr", 0.06, 0.24, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cd += 0.3;
        mybuff.cd.push(new buffInfo("+", 0.3, 9999));
    }, "The wielder has **30%** increased crit damage for the rest of battle.", "The Eldritch Bow of Wisdom is a weapon of ancient power, imbued with the knowledge of ages past. Its string is made of a mysterious, otherworldly material that glows with a faint, eerie light. When drawn, the bow emits a low hum that fills the air with a sense of ancient wisdom and knowledge. Those who wield it are said to possess the power to see through deception and uncover hidden truths. But beware, for the bow's power comes at a cost, and those who dare to wield it may find themselves drawn into a world of eldritch secrets and forbidden knowledge.", "legendary", 339),
    new weaponInfo("Euthanasia", "weapon", "bow", ["crafting", "chest"], "<:euthanasia:1068643207015051314>", "https://i.imgur.com/0u0hFee.png", "atk", 53, 838, "cr", 0.06, 0.22, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.executeHP = Math.max(0.2, myStats.executeHP);
    }, "Executes the enemy when below **20%** HP.", "The Euthanasia bow was crafted by a skilled archer who had seen too much suffering in the world. With each shot, it delivers a swift and merciful end to those who are beyond saving. In the hands of a compassionate hunter, it brings peace to the wounded and the dying.", "legendary", 340),
    new weaponInfo("Polar Star", "weapon", "bow", ["chest"], "<:polar_star:1068643210395648161>", "https://i.imgur.com/NNU30sx.png", "atk", 54, 839, "mana", 10, 40, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.critmana = 4;
    }, "The wielder gets **+4** mana for every critical hit.", "The Polar Star shines with the radiance of the North, imbued with the power of the frozen tundra. With each shot, a burst of arctic wind whirls forth, encasing enemies in a sheet of ice. Only the bravest warriors dare wield this weapon, for it demands strength and precision to harness its full potential.", "legendary", 341),
    new weaponInfo("Sacrificial Bow", "weapon", "bow", ["crafting", "chest"], "<:sacrificial_bow:1068643212018860146>", "https://i.imgur.com/rGUUisv.png", "atk", 47, 826, "md", 44, 724, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk += Math.floor(myStats.atk * (0.1 + (0.2 * (1 - (eStats.hp / eStats.maxhp)))));
        myStats.md += Math.floor(myStats.md * (0.1 + (0.2 * (1 - (eStats.hp / eStats.maxhp)))));
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.atk += Math.floor(myStats.atk * (0.1 + (0.2 * (1 - (eStats.hp / eStats.maxhp)))));
            myStats.md += Math.floor(myStats.md * (0.1 + (0.2 * (1 - (eStats.hp / eStats.maxhp)))));
        }, 9999));
    }, "Increases the wielders attack and magic damage by **10**-**30%** depending on enemy HP.", "The Sacrificial Bow has seen many battles, and has claimed the lives of countless enemies. But with each kill, it grows stronger, fed by the blood of the fallen. It is a weapon of darkness, wielded by those willing to make the ultimate sacrifice for victory.", "legendary", 342),
    new weaponInfo("Serene Bow", "weapon", "bow", ["crafting", "chest"], "<:serene_bow:1068643215479164938>", "https://i.imgur.com/aqP1mRL.png", "atk", 52, 834, "dodge", 0.03, 0.14, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodgeHeal += 0.05;
    }, "The wielder heals **5%** of max HP after successfully dodging an attack.", "The Serene Bow is a weapon of unmatched grace and finesse. Its elegant design is a testament to the skill and craftsmanship of its creator, and it is said to be imbued with a tranquil energy that soothes the mind and steadies the hand of those who wield it. In the heat of battle, the Serene Bow whispers calming whispers to its wielder, helping them to remain focused and composed. With every arrow loosed from its string, the Serene Bow strikes with the precision and tranquility of a gentle breeze.", "legendary", 343),
    new weaponInfo("Starstruck", "weapon", "bow", ["chest"], "<:starstruck:1068643219384045608>", "https://i.imgur.com/Oe2KGWr.png", "md", 48, 811, "md%", 0.05, 0.18, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mr = 0;
        ebuff.mr.push(new buffInfo("=", 0, 1));
    }, "The enemy has no magic resistance during the first 2 rounds.", "As you draw back the string of the Starstruck bow, the night sky shimmers above you, a billion twinkling stars lighting your path. With each shot, a burst of starlight explodes from the bow, striking your enemies with celestial power. Whether hunting game or vanquishing foes, the Starstruck bow is your faithful companion, guiding you to victory with the light of the heavens.", "legendary", 344),
    new weaponInfo("Swiftstrike", "weapon", "bow", ["crafting", "chest"], "<:swiftstrike:1068643221477003418>", "https://i.imgur.com/4x5nWpH.png", "atk", 54, 845, "dodge", 0.04, 0.16, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.dodge -= 0.2;
        if (eStats.dodge < 0) eStats.dodge = 0;
        ebuff.dodge.push(new buffInfo("+", -0.2, 20));
    }, "Decreases enemy dodge by **20%** for the first 20 rounds.", "With a swiftness unmatched by any other bow, the Swiftstrike unleashes a hail of arrows upon its targets, striking with the speed of a viper. Only the most skilled archers can wield its power, but in the hands of a true master, the Swiftstrike is a deadly weapon of unmatched agility and precision.", "legendary", 345),
    new weaponInfo("Valdor's Vengeance", "weapon", "bow", ["chest"], "<:valdors_vengeance:1068643225222516777>", "https://i.imgur.com/io7b1Nz.png", "atk", 56, 847, "shield", 116, 438, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.def -= Math.floor(eStats.def * 0.2);
        ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * 0.2), 9999));
    }, "Decreases enemy defense by **20%** for the rest of battle.", "Valdor's Vengeance is a sleek and powerful bow, crafted by the ancient elven master archer Valdor. It is said that Valdor imbued the bow with his own burning desire for justice, and that it empowers its wielder to strike down any who dare to defy the forces of good. The bow's string is made of enchanted elven silk, and its arrows are tipped with pure adamantium. When drawn, the bow emits a low, menacing hum, as if it is eager to unleash its righteous fury upon its enemies.", "legendary", 346),

    // Weapons - Legendary Lance
    new weaponInfo("Arcane Spike", "weapon", "lance", ["crafting", "chest"], "<:arcane_spike:1068648969607065722>", "https://i.imgur.com/8qL80GD.png", "md", 42, 723, "md", 22, 434, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mr -= Math.floor(eStats.mr * 0.2);
        ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.2), 9999));
        myStats.mdChance = 1;
    }, "Decreases enemy magic resistance by **20%**. The wielder deals magic damage by default.", "The Arcane Spike is a lance imbued with powerful magic, said to have been crafted by a powerful wizard. Its shimmering, blue-hued metal is cool to the touch, and runes of ancient power adorn its length. Those who wield it in battle report feeling a surge of energy coursing through their veins, granting them increased strength and speed.", "legendary", 347),
    new weaponInfo("Avalon's Asp", "weapon", "lance", ["chest"], "<:avalons_asp:1068648972882821191>", "https://i.imgur.com/7APxDUG.png", "atk", 50, 817, "md%", 0.05, 0.17, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.md += Math.floor(myStats.md * 0.2);
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.2), 12));
        myStats.mdChance = 1;
    }, "Increases the wielders magic damage by **20%** during the first 12 rounds. The wielder deals magic damage by default.", "Avalon's Asp is a spear of legend, steeped in the magic of the ancient isle of Avalon. Its slender, graceful shaft is made of a shimmering, silver-like metal that is said to never dull or rust. The spearhead is sharp as a serpent's fang, and seems to pulsate with a faint, otherworldly glow. It is said that this weapon was once wielded by the great King Arthur himself, and that it holds the power to fell even the mightiest of foes with a single strike.", "legendary", 348),
    new weaponInfo("Cleaver of Titans", "weapon", "lance", ["crafting", "chest"], "<:cleaver_of_titans:1068648976322154506>", "https://i.imgur.com/ssQR35e.png", "atk", 53, 838, "def", 32, 143, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.def -= Math.floor(eStats.def * 0.1);
        ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * 0.1), 9999));
        myStats.ignoreShield = true;
    }, "Decreases enemy defense by **10%**. All attacks deal true damage.\n\n_true damage: ignores shield_", "With its gleaming, razor-sharp edge and sturdy handle, Cleaver of Titans is a weapon of pure destruction. Those who wield it are able to slice through even the toughest of foes with ease, leaving a trail of vanquished giants in their wake. Some say it was forged from the very essence of the earth itself, imbued with the strength of the titans it was meant to fell. Whether wielded by a hero or a villain, the Cleaver of Titans is a force to be reckoned with.", "legendary", 349),
    new weaponInfo("Death Adder", "weapon", "lance", ["crafting", "chest"], "<:death_adder:1068648978637410355>", "https://i.imgur.com/WxHCVu9.png", "atk", 56, 856, "cd", 0.08, 0.44, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const addcr = Math.min(myStats.cr, 0.25);
        mybuff.cr.push(new buffInfo("+", addcr, 4));
        myStats.cr += addcr;
        if (myStats.cr > 1) myStats.cr = 1;
    }, "The wielder has twice as much crit rate during the first 5 rounds (max +25%).", "As you grip the shaft of the Death Adder, you can feel its power coursing through your veins. With a single thrust, you can impale your enemies and watch as their life force drains away. Its razor-sharp tip glints menacingly in the light, promising a swift and deadly end to all who dare stand in your way. Be warned, for those who face the Death Adder will face certain death.", "legendary", 350),
    new weaponInfo("Life Subtractor", "weapon", "lance", ["crafting", "chest"], "<:life_subtractor:1068648963584041081>", "https://i.imgur.com/w2gcGOi.png", "atk", 55, 848, "cr", 0.05, 0.22, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const cdbuff = Math.min(myStats.cd, 0.4);
        mybuff.cd.push(new buffInfo("+", cdbuff, 4));
        myStats.cd += cdbuff;
    }, "The wielder has twice as much crit damage during the first 5 rounds (max +40%).", "The Life Subtractor is a weapon of death and destruction, crafted with the sole purpose of draining the life force from its victims. With a single strike, this lance can leave even the strongest of warriors on the brink of death, their life essence siphoned away by its dark power. Wield it with caution, for the Life Subtractor has a thirst for blood that can never be quenched.", "legendary", 351),
    new weaponInfo("Ignis Aureus", "weapon", "lance", ["chest"], "<:ignis_aureus:1068648981925728407>", "https://i.imgur.com/KHXDQ6i.png", "atk", 52, 837, "sm", 2, 10, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const burn = Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.04);
        ebuff.hp.push(new buffInfo("+", -burn, 9999));
    }, "Burns **4%** of max HP from the enemy every round. If enemy HP is more than twice of the wielders HP, it burns the equivalent of **8%** of the wielders HP instead.", "Forged in the flames of Mount Vesuvius, the Ignis Aureus is a weapon of unmatched power and beauty. Its golden patterns shimmer in the sunlight, striking fear into the hearts of enemies. With a single thrust, this lance can unleash a devastating inferno, incinerating anything in its path. Those who wield the Ignis Aureus are truly masters of fire, commanding its destructive power with precision and grace.", "legendary", 352),
    new weaponInfo("Ildathach", "weapon", "lance", ["crafting", "chest"], "<:ildathach:1068648986405261374>", "https://i.imgur.com/tiqy8WE.png", "atk", 54, 840, "cd", 0.06, 0.4, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.critbleed = true;
        matchStats.critbleedlast = 3;
        myStats.cr += 0.15;
        if (myStats.cr > 1) myStats.cr = 1;
        mybuff.cr.push(new buffInfo("+", 0.15, 9999));
    }, "Critical Strikes cause bleeding, dealing **3%** damage to the enemy for 3 rounds and the wielder has **15%** increased crit rate.", "Forged in the fiery depths of the earth, the lance Ildathach is a weapon of pure destruction. Its fiery tendrils dance and writhe with every strike, incinerating all in its path. Those who wield it are said to be consumed by its power, becoming a force of devastation on the battlefield.", "legendary", 353),
    new weaponInfo("Noatun", "weapon", "lance", ["chest"], "<:noatun:1068648967090471054>", "https://i.imgur.com/iJCiGAb.png", "atk", 56, 855, "cr", 0.06, 0.22, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.critmana += 4;
    }, "The wielder gets **+4** mana for every critical hit.", "Forged by the sea god Njörðr, the lance Noatun is imbued with the power of the ocean. Its sharp tip is as deadly as a shark's tooth, capable of piercing even diamonds. In the hands of a skilled warrior, it is a weapon to be feared on the battlefield.", "legendary", 354),
    new weaponInfo("Sleipnir's Sting", "weapon", "lance", ["crafting", "chest"], "<:sleipnirs_sting:1068649146334060666>", "https://i.imgur.com/lp90UNg.png", "atk", 52, 833, "cr", 0.06, 0.23, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.def -= Math.floor(eStats.def * 0.15);
        eStats.mr -= Math.floor(eStats.mr * 0.15);
        ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * 0.15), 9999));
        ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.15), 9999));
    }, "Decreases enemy defense and magic resistance by **15%**", "Sleipnir's Sting is a spear rumored to have been wielded by the legendary eight-legged steed of the Norse god Odin. Its razor-sharp point glints ominously in the light, promising swift and deadly retribution to any who dare to cross its wielder. Some say that the spear is imbued with the speed and strength of Sleipnir itself, allowing its wielder to strike with the swiftness of the wind and the power of the storm. Few can withstand the fury of Sleipnir's Sting.", "legendary", 355),
    new weaponInfo("Soul of the Setting Sun", "weapon", "lance", ["crafting", "chest"], "<:soul_of_the_setting_sun:1068649150100553788>", "https://i.imgur.com/WT2SOKf.png", "atk", 52, 835, "hp", 231, 764, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const bleed = Math.floor(eStats.hp > 2 * myStats.hp ? myStats.hp * 0.3 : eStats.hp * 0.15);
        eStats.hp -= Math.floor(bleed);
    }, "The enemy starts with **85%** HP. If the enemy has more than twice as much HP than the wielder, it starts with **30%** less HP of the wielder instead.", "The Soul of the Setting Sun radiates with the fiery passion of a dying sun, imbuing its wielder with the strength to vanquish even the most fearsome foes. As the lance pierces through the darkness, it carries with it the warmth and light of the setting sun, banishing the shadows and bringing hope to those in need.", "legendary", 356),
    new weaponInfo("Stormbolt", "weapon", "lance", ["chest"], "<:stormbolt:1068649152898154546>", "https://i.imgur.com/B19ZQYI.png", "atk", 52, 837, "shield", 96, 683, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 3 === 0) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:stormbolt:1068649152898154546> **${char.name}**`, { atkMultiplier: 0.6, ignoreShield: true, magicDamage: true });
            };
        }, 9999));
    }, "Fires an electric shock dealing **60%** true damage every 3 rounds.\n\n_true damage: ignores shield_", "As the skies darken and the winds howl, the Stormbolt crackles with energy. With each thundering thrust, it unleashes a devastating bolt of lightning, striking fear into the hearts of its enemies. In the midst of the tempest, this weapon is a master of the storm.", "legendary", 357),
    new weaponInfo("Swan Song", "weapon", "lance", ["crafting", "chest"], "<:swan_song:1068649157105037352>", "https://i.imgur.com/AhmnR5p.png", "atk", 53, 842, "mg", 1, 4, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk += Math.floor(myStats.atk * 0.1);
        myStats.md += Math.floor(myStats.md * 0.1);
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.1), 9999));
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.1), 9999));
        myStats.dodge += 0.1;
        if (myStats.dodge > 1) myStats.dodge = 1;
        mybuff.dodge.push(new buffInfo("+", 0.1, 9999));
        mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.03), 9999));
    }, "The wielder has **10%** increased attack and magic damage, as well as **+10%** increased dodge chance. Heals the wielder by **3%** of max HP each round.", "The Swan Song was crafted by the finest blacksmiths in the land, each stroke of their hammer imbued with the magic of their ancestors. Its gleaming cerulean blade is said to sing with the grace of a swan in flight, and its sharp tip can strike with the precision of a predator's talon. In the hands of a skilled warrior, the Swan Song is a weapon of beauty and deadly intent, destined to strike its final, triumphant note in the heat of battle.", "legendary", 358),
    new weaponInfo("Syfing", "weapon", "lance", ["chest"], "<:syfing:1068649160770867210>", "https://i.imgur.com/kAvstoR.png", "atk", 51, 826, "hp", 78, 488, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const steal = Math.floor(eStats.hp > 2 * myStats.hp ? myStats.hp * 0.2 : eStats.hp * 0.1);
        eStats.hp -= steal;
        myStats.shield += steal;
    }, "Steals **10%** of enemy HP and converts it into shield. If enemy HP is more than twice as much as the wielders HP, uses **20%** of the wielders HP instead.", "The Syfing lance is imbued with the power of the wind, allowing it to strike with unrivaled speed and precision. With each thrust, it unleashes a burst of air that can knock even the most sturdy of foes off balance. In the hands of a skilled warrior, the Syfing lance is a weapon to be feared on the battlefield.", "legendary", 359),
    new weaponInfo("Vasavi Shakti", "weapon", "lance", ["crafting", "chest"], "<:vasavi_shakti:1068649163451015228>", "https://i.imgur.com/yQ2BSy4.png", "atk", 54, 847, "cd", 0.08, 0.5, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:vasavi_shakti:1068649163451015228> **${char.name}**`, { critChance: 0, magicDamage: true });
    }, "Immediately after the battle begins, deals a crititcal hit to the enemy.", "The Vasavi Shakti is a weapon of incredible power, said to be wielded by the great warrior goddess herself. With a single strike, it is capable of shattering mountains and splitting the very earth in two. It is a weapon of divine fury, capable of laying waste to entire armies in the hands of a skilled wielder. Those who face the Vasavi Shakti in battle are said to tremble in fear, knowing that they face not just a weapon, but the wrath of the gods themselves.", "legendary", 360),
    new weaponInfo("Windrider", "weapon", "lance", ["chest"], "<:windrider:1068649166869364756>", "https://i.imgur.com/r5UiHTF.png", "atk", 47, 794, "mr", 30, 158, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(10, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.mr += Math.floor(myStats.mr * 0.3);
            mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr * 0.3), 9999));
        }));
    }, "Increases the wielders magic resistance by **30%** after 10 rounds.", "The Windrider lance is a weapon of legends, said to have been wielded by the greatest knights of the realm. Its slender, aerodynamic design allows it to slice through the air with ease, granting its wielder unmatched speed and agility in battle. But beware, for the Windrider is not just a weapon of offense - its enchanted steel can deflect even the most powerful of spells, making it a formidable defense as well. Those who master the Windrider will truly be able to ride the winds of battle to victory.", "legendary", 361),

    // Weapons - Legendary Dagger
    new weaponInfo("Airfoil", "weapon", "dagger", ["chest"], "<:airfoil:1068701984196145262>", "https://i.imgur.com/Bkag8hz.png", "atk", 52, 833, "cd", 0.07, 0.48, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr += 0.15;
        if (myStats.cr > 1) myStats.cr = 1;
        mybuff.cr.push(new buffInfo("+", 0.15, 9999));
        myStats.cd += 0.15;
        mybuff.cd.push(new buffInfo("+", 0.15, 9999));
        myStats.delayedBuffs.push(new delayedBuffs(8, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.cr.push(new buffInfo("+", 0.15, 9999));
        }));
    }, "The wielder has **15%** increased crit rate and crit damage. Crit rate increases to **30%** if the wielder survives for 8 rounds.", "With a sleek and aerodynamic design, the Airfoil dagger cuts through the air with deadly precision. Its razor-sharp blade glints in the light, promising swift and deadly strikes against any foe. Whether thrown or wielded in close combat, the Airfoil is a formidable weapon for the agile and cunning.", "legendary", 362),
    new weaponInfo("Azure Blade", "weapon", "dagger", ["crafting", "chest"], "<:azure_blade:1068701987400597586>", "https://i.imgur.com/LA3XM8p.png", "atk", 54, 839, "mana", 10, 40, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mg += 4;
        mybuff.mg.push(new buffInfo("+", 4, 10));
    }, "Increases mana generation by **+4** mana at the start of battle, lasting 10 rounds.", "The Azure Blade glimmers in the light, its delicate edges honed to perfection. This weapon may be small, but it is deadly, capable of delivering swift and lethal strikes against any foe. The deep blue hue of the blade is said to be imbued with the power of the ocean, making it a formidable weapon against those who dare to cross its wielder. With every strike, the Azure Blade seems to come alive, thirsting for battle and eager to draw blood.", "legendary", 363),
    new weaponInfo("Cerulean Crescent", "weapon", "dagger", ["crafting", "chest"], "<:cerulean_crescent:1068701990751842314>", "https://i.imgur.com/JufQ9Ii.png", "atk", 54, 848, "cr", 0.06, 0.23, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.critmana = 4;
        myStats.mdChance += 1;
    }, "The wielder gets **+4** mana for every critical hit and deals magic damage by default.", "The Cerulean Crescent is a weapon of legend, known for its powerful magic and unmatched strength. Its blade is said to be able to cut through anything, and its hilt is encrusted with a golden crescent moon. But be warned, only those with pure hearts can wield its power without being struck down by its might. Many have sought to claim its abilities for themselves, but only the worthy have been able to wield its true power.", "legendary", 364),
    new weaponInfo("Darganfod", "weapon", "dagger", ["crafting", "chest"], "<:darganfod:1068701995915018280>", "https://i.imgur.com/YR7RHEp.png", "atk", 45, 812, "atk", 18, 323, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def += 212;
        myStats.mr += 212;
        mybuff.def.push(new buffInfo("+", 212, 9999));
        mybuff.mr.push(new buffInfo("+", 212, 9999));
    }, "The wielder takes **20%** less damage.\n\n_A reduction of 20% = 212 DEF|MR_", "The ancient dwarven weapon known as Darganfod was forged in the fiery depths of the earth by the skilled hands of the finest dwarven smiths. It is said that the weapon was created for a great dwarf king. Legend has it that Darganfod was lost during a great battle, its wielder felled by a mighty blow. But some say that the weapon still exists, hidden away in a secret location, waiting for a worthy knight to wield it once again and restore the glory of the ancient dwarven kingdom.", "legendary", 365),
    new weaponInfo("Death's Sting", "weapon", "dagger", ["chest"], "<:deaths_sting:1068702001430548611>", "https://i.imgur.com/22JAeJZ.png", "atk", 51, 833, "cr", 0.07, 0.25, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.critbleed = true;
        matchStats.critbleedlast = 3;
    }, "Critical Strikes cause bleeding, dealing **3%** damage to the enemy for 3 rounds.", "The glint of Death's Sting can be seen in the light, as it is drawn from its sheath with all of its might. A harbinger of doom for those who stand in its way, it shall strike fear into the hearts of those who stay. The origins of Death's Sting are shrouded in mystery, but it is believed to have been crafted by a powerful necromancer who sought to create the ultimate weapon of death. The necromancer poured all of his dark knowledge and power into the creation of the dagger, imbuing it with the ability to steal the life force of those it strikes. Those who have faced its sharp edge speak of a cold sensation as it pierces their flesh, followed by a feeling of life slipping away. This legendary dagger has been wielded by some of the greatest warriors throughout history, and its power is said to be unmatched.", "legendary", 366),
    new weaponInfo("Dirge", "weapon", "dagger", ["crafting", "chest"], "<:dirge:1068702004744032367>", "https://i.imgur.com/NtWRLit.png", "atk", 48, 821, "dodge", 0.03, 0.15, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodgeHeal += 0.05;
    }, "The wielder heals **5%** of max HP after successfully dodging an attack.", "The Dirge is a blade that seems to sing with the sorrow of its victims. With each strike, a mournful melody echoes through the air, carrying the pain of those it has slain. Some say it is cursed, a weapon of death that feeds on the suffering of others. But to those who wield it, the Dirge is a reminder of the fleeting nature of life and the power of death.", "legendary", 367),
    new weaponInfo("Duskfang", "weapon", "dagger", ["crafting", "chest"], "<:duskfang:1068703199885807687>", "https://i.imgur.com/fcIiwPz.png", "atk", 53, 839, "br", 0.05, 0.23, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.blockBuffDef += 100;
    }, "Every successful block decreases damage taken by **10%** for 6 rounds.\n\n_A reduction of 10% = 100 DEF|MR_", "Forged from the purest silver and imbued with the power of the setting sun, the Duskfang is a weapon of unparalleled beauty and lethality. Its razor-sharp edge glimmers in the fading light, beckoning its wielder to strike with precision and speed. Those who have faced its blade speak of its biting cold and the eerie glow that surrounds it in the dark hours of the night. The Duskfang is a weapon of legend, a tool of assassins and thieves, and a harbinger of death to those who dare to stand in its path.", "legendary", 368),
    new weaponInfo("Elysium's Edge", "weapon", "dagger", ["chest"], "<:elysiums_edge:1068703203761328188>", "https://i.imgur.com/2Vq6xP2.png", "atk", 50, 818, "atk%", 0.06, 0.17, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 3 === 0) {
                const drain = Math.floor(eStats.hp > 2 * myStats.hp ? myStats.hp * 0.12 : eStats.hp * 0.06);
                eStats.hp -= drain;
                if (eStats.hp < 0) eStats.hp = 0;
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, drain, {});
                if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
            };
        }, 9999));
    }, "Drains **6%** HP from the enemy and adds it to the wielder every 3rd round. If enemy HP is more than twice of the wielders HP, it drains the equivalent of **12%** of the wielders HP instead.", "Forged in the fiery depths of Elysium, Elysium's Edge is a weapon of pure grace and precision. Its sharp, glistening blade is imbued with the power of the gods, capable of slicing through even the toughest armor with ease. In the hands of a skilled warrior, this dagger is a weapon of true destruction, capable of striking fear into the hearts of even the bravest of foes.", "legendary", 369),
    new weaponInfo("Ember's Kiss", "weapon", "dagger", ["chest"], "<:embers_kiss:1068703206391164998>", "https://i.imgur.com/j9ahUSM.png", "atk", 52, 834, "cd", 0.07, 0.48, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const burn = Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.04);
        ebuff.hp.push(new buffInfo("+", -burn, 9999));
    }, "Burns **4%** of max HP from the enemy every round. If enemy HP is more than twice of the wielders HP, it burns the equivalent of **8%** of the wielders HP instead.", "Ember's Kiss is a fiery, glowing dagger that burns with the intensity of a thousand suns. Its handle is forged from the finest mithril, and its edge able to cut through fire. Those who wield this weapon feel a burning passion in their hearts, and their strikes are imbued with the power of the flames. In battle, Ember's Kiss leaves a trail of scorched earth and smoldering ashes, marking the path of its wielder's relentless assault.", "legendary", 370),
    new weaponInfo("Fianta", "weapon", "dagger", ["crafting", "chest"], "<:fianta:1068703209557864478>", "https://i.imgur.com/KJtG6Ag.png", "md", 51, 827, "atk", 42, 658, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.atk += Math.floor(myStats.atk * Math.min(0.1 * Math.floor(matchStats.round / 4), 0.4));
            myStats.md += Math.floor(myStats.md * Math.min(0.1 * Math.floor(matchStats.round / 4), 0.4));
        }, 9999));
    }, "Every 4 rounds, the wielder gets **10%** attack and magic damage (max 40%).", "With its gleaming silver blade and intricate filigree handle, Fianta is more than just a weapon. It is a work of art, crafted by the finest smiths of the ancient world. Though small in size, it holds great power, capable of delivering swift and deadly strikes with precision and grace. In the hands of a skilled wielder, Fianta is a force to be reckoned with, striking fear into the hearts of even the bravest warriors.", "legendary", 371),
    new weaponInfo("Foliage", "weapon", "dagger", ["crafting", "chest"], "<:foliage:1068703213789925376>", "https://i.imgur.com/4G8fZ1D.png", "atk", 46, 794, "hp", 77, 412, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.05), 9999));
    }, "The wielder heals **5%** of max hp after every round.", "As you grip the hilt of the Foliage, you can feel the power of the forest coursing through your veins. The split blade mimics the appearance of leaves and vines, beckoning you to embrace your primal instincts and strike with the ferocity of nature itself. With each swift motion, the Foliage slices through the air with deadly precision, leaving a trail of destruction in its wake. Whether you seek to defend the wilds or vanquish your foes, this trusty dagger will be your steadfast companion.", "legendary", 372),
    new weaponInfo("Heinous Swiftblade", "weapon", "dagger", ["crafting", "chest"], "<:heinous_swiftblade:1068703288855379968>", "https://i.imgur.com/2OzT7xX.png", "atk", 52, 830, "md%", 0.06, 0.2, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 3 === 0) {
                myStats.atk += Math.floor(myStats.atk * 0.4);
                myStats.md += Math.floor(myStats.md * 0.4);
            };
        }, 9999));
    }, "Every 3rd round, the wielder has **40%** increased attack and magic damage.", "As you grip the hilt of the Heinous Swiftblade, you can feel its dark energy pulsing through your veins. This wickedly sharp blade was crafted by a master assassin, and has claimed the lives of countless unsuspecting victims. Its jagged edge glints dangerously in the light, beckoning you to unleash its deadly power. With a swift strike, the Heinous Swiftblade will slice through even the toughest armor, leaving your foes begging for mercy. Wield it wisely, for it may just as easily turn on you as on your enemies.", "legendary", 373),
    new weaponInfo("Jasper", "weapon", "dagger", ["crafting", "chest"], "<:jasper:1068703292630253578>", "https://i.imgur.com/kS2VJHa.png", "atk", 51, 835, "hp", 88, 483, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (eStats.hp / eStats.maxhp > 0.6) {
            myStats.cr += 0.25;
            if (myStats.cr > 1) myStats.cr = 1;
        } else {
            myStats.cr += 0.1;
            if (myStats.cr > 1) myStats.cr = 1;
        };
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (eStats.hp / eStats.maxhp > 0.6) {
                myStats.cr += 0.25;
                if (myStats.cr > 1) myStats.cr = 1;
            } else {
                myStats.cr += 0.1;
                if (myStats.cr > 1) myStats.cr = 1;
            };
        }, 9999));
    }, "The wielder has **+25%** crit rate while the enemy has more than **60%** of their max HP, otherwise it drops to **+10%**.", "The Jasper is a weapon of subtlety and elegance. Its edges shimmer in the light, drawing the eye to its distinctive design. In the skilled hands of its wielder, the Jasper can strike with deadly precision, piercing through even the thickest armor. It is a tool of assassination, a weapon of the shadows.", "legendary", 374),
    new weaponInfo("Kingsfall", "weapon", "dagger", ["chest"], "<:kingsfall:1068703296291872850>", "https://i.imgur.com/e1sy8yV.png", "atk", 44, 777, "atk", 33, 333, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk += Math.floor(myStats.atk * 0.2);
        mybuff.atk.push(new buffInfo("+", myStats.atk * 0.2, 9999));
    }, "The wielder has **20%** increased attack.", "The ancient blade known as Kingsfall has been wielded by countless kings and queens throughout history, striking fear into the hearts of their enemies and bringing swift justice to the lands. It is said that the dagger holds a dark power, imbued with the spirits of fallen monarchs who now seek vengeance from beyond the grave. Wield this weapon wisely, for it thirsts for blood and will stop at nothing to claim its rightful place on the throne.", "legendary", 375),
    new weaponInfo("Rhadamant", "weapon", "dagger", ["crafting", "chest"], "<:rhadamant:1068703300272275507>", "https://i.imgur.com/AtMPj2E.png", "atk", 47, 789, "md", 40, 624, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.atk -= Math.floor(eStats.atk * 0.16);
        ebuff.atk.push(new buffInfo("+", -eStats.atk * 0.16, 9999));
    }, "The enemy has **16%** decreased attack.", "The Rhadamant was once a favored weapon of the great warrior king Rhadamanthus, known for his fierce combat skills and unwavering justice. Crafted by the finest smiths of the realm, the Rhadamant was made from a rare, unbreakable metal found only in the deepest mines of the kingdom. After the death of King Rhadamanthus, the Rhadamant was passed down through the generations, passed from one great warrior to another. It has been wielded in countless battles, and its legend has grown with each victory. Today, the Rhadamant remains a coveted and revered weapon, sought after by those who seek to emulate the great king and his unyielding spirit. To wield the Rhadamant is to carry on the legacy of a true hero, and to wield it with honor is to be worthy of its power.", "legendary", 376),
    new weaponInfo("Shadowfang", "weapon", "dagger", ["crafting", "chest"], "<:shadowfang:1068703304869236736>", "https://i.imgur.com/oL8U8al.png", "atk", 54, 847, "cr", 0.06, 0.24, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk += Math.floor(myStats.atk * 0.1);
        myStats.md += Math.floor(myStats.md * 0.1);
        mybuff.atk.push(new buffInfo("+", myStats.atk * 0.1, 9999));
        mybuff.md.push(new buffInfo("+", myStats.md * 0.1, 9999));
        if (myStats.hp / myStats.maxhp < 0.5) {
            myStats.cd += 0.3;
            mybuff.cd.push(new buffInfo("+", 0.3, 9999));
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.2), {});
        } else {
            myStats.delayedBuffs.push(new delayedBuffs(0, function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp / myStats.maxhp < 0.5) {
                    myStats.cd += 0.3;
                    mybuff.cd.push(new buffInfo("+", 0.3, 9999));
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.2), {});
                    //@ts-ignore
                    this._used++;
                };
            }, 9999, 1));
        };
    }, "The wielder has **10%** increased attack and magic damage, and the first time the wielder's HP falls below **50%** of max HP, crit damage increases by **30%** and heals **20%** of missing HP.", "A dagger forged in the depths of darkness by the twisted hands of a master blacksmith, the Shadowfang glimmers with a sinister aura, as if it thirsts for the blood of its enemies. Those who wield the Shadowfang are said to become one with the shadows, striking with deadly precision and disappearing into the night. Beware, for those who cross the wielder of Shadowfang are sure to meet their demise.", "legendary", 377),

    // Weapons - Legendary Shield
    new weaponInfo("Barricade of Eternal Justice", "weapon", "shield", ["crafting", "chest"], "<:barricade_of_eternal_justice:1068706870489002094>", "https://i.imgur.com/WPHSNpo.png", "shield", 158, 1126, "hp", 82, 565, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.selfhealChance.push(1);
        myStats.selfheal.push(0.06);
    }, "Heals the wielder by **6%** of the damage dealt.", "The Barricade of Eternal Justice is a shield imbued with the power of righteousness and fairness. It glows with a golden radiance, and its intricate designs depict scenes of justice being served upon the wicked. Those who wield this shield are protected by its divine power, and their enemies will find themselves unable to overcome the righteous might of this formidable barricade.", "legendary", 378),
    new weaponInfo("Blazeguard", "weapon", "shield", ["crafting", "chest"], "<:blazeguard:1068706873945116783>", "https://i.imgur.com/3B9RAIj.png", "shield", 147, 1139, "br", 0.05, 0.21, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def += 1316;
        myStats.mr += 1316;
        mybuff.def.push(new buffInfo("+", 1316, 2));
        mybuff.mr.push(new buffInfo("+", 1316, 2));
    }, "The wielder takes **75%** less damage during the first 3 rounds.\n\n_75% damage reduction = 1316 DEF|MR_", "The Blazeguard is forged from the strongest materials, designed to withstand the heat of raging flames. Its intricate designs and patterns channel heat away from its wielder, keeping them safe from the scorching inferno. In the midst of a fiery battle, the Blazeguard shield is a trusted companion, providing unwavering protection from the flames.", "legendary", 379),
    new weaponInfo("Call of the Emperor", "weapon", "shield", ["crafting", "chest"], "<:call_of_the_emperor:1068706864004616202>", "https://i.imgur.com/q5CbCQB.png", "shield", 147, 1046, "sm", 2, 10, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.hp / myStats.maxhp < 0.4) {
            myStats.def += Math.floor(myStats.def * 0.15);
            myStats.mr += Math.floor(myStats.mr * 0.15);
            mybuff.def.push(new buffInfo("+", myStats.def * 0.15, 9999));
            mybuff.mr.push(new buffInfo("+", myStats.mr * 0.15, 9999));
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.3), {});
        } else {
            myStats.delayedBuffs.push(new delayedBuffs(0, function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp / myStats.maxhp < 0.4) {
                    myStats.def += Math.floor(myStats.def * 0.15);
                    myStats.mr += Math.floor(myStats.atk * 0.15);
                    mybuff.def.push(new buffInfo("+", myStats.def * 0.15, 9999));
                    mybuff.mr.push(new buffInfo("+", myStats.mr * 0.15, 9999));
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.3), {});
                    //@ts-ignore
                    this._used++;
                };
            }, 9999, 1));
        };
    }, "The first time the wielder's HP falls below **40%** of max HP, increases defense and magic resistance by **15%** each and heals **30%** of missing HP.", "The Call of the Emperor shield is a sacred relic, crafted from the finest imperial steel and imbued with the power of the ruling monarch. It is said that when the emperor calls forth his might, the shield will unleash a fierce and righteous energy, striking fear into the hearts of his enemies and bolstering the courage of his allies. Those who dare to stand against the emperor's will will face the wrath of the gods themselves, for the shield is a symbol of the unbreakable bond between ruler and kingdom.", "legendary", 380),
    new weaponInfo("Gemstone Barrier", "weapon", "shield", ["chest"], "<:gemstone_barrier:1068706866223390740>", "https://i.imgur.com/31P1tZz.png", "shield", 148, 1066, "dodge", 0.04, 0.15, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodgeHeal += 0.05;
    }, "The wielder heals **5%** of max HP after successfully dodging an attack.", "The Gemstone Barrier shimmers with a verdant green light, imbued with ancient magic. It glows with a protective aura, deflecting even the strongest of blows and shielding its wielder from harm. With its power, one is truly unbreakable.", "legendary", 381),
    new weaponInfo("King's Aegis", "weapon", "shield", ["crafting", "chest"], "<:kings_aegis:1068707059996053587>", "https://i.imgur.com/TMcZLnJ.png", "shield", 137, 1102, "cd", 0.07, 0.36, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr += 0.16;
        if (myStats.cr > 1) myStats.cr = 1;
        mybuff.cr.push(new buffInfo("+", 0.16, 9999));
    }, "The wielder has **16%** increased crit rate for the rest of battle.", "The King's Aegis is a formidable shield, forged in the fires of the royal smithy. Its polished metal gleams in the sunlight, and its golden crest bears the symbol of the royal family. It is said to possess the strength and courage of the kingdom's past rulers, granting the user the ability to stand tall and defend their allies in the face of any danger. Those who carry the King's Aegis into battle are honored as true warriors and defenders of the realm.", "legendary", 382),
    new weaponInfo("Knightly Warden", "weapon", "shield", ["crafting", "chest"], "<:knightly_warden:1068707064995663873>", "https://i.imgur.com/PSgfwDV.png", "shield", 132, 1079, "dodge", 0.04, 0.15, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.def -= Math.floor(eStats.def * 0.16);
        eStats.mr -= Math.floor(eStats.mr * 0.16);
        ebuff.def.push(new buffInfo("+", -eStats.def * 0.16, 9999));
        ebuff.mr.push(new buffInfo("+", -eStats.mr * 0.16, 9999));
    }, "Reduces enemy defense and magic resistance by **16%** for the rest of battle.", "The Knightly Warden boasts a majestic golden horse emblazoned upon its surface, symbolizing the strength and nobility of the knight who wields it. This fierce steed charges forward, ready to protect its master from any threat. Those who dare to face the Knightly Warden in battle will know the true power of chivalry and honor.", "legendary", 383),
    new weaponInfo("Legionnaire's Guardian", "weapon", "shield", ["chest"], "<:legionnaires_guardian:1068707069512908820>", "https://i.imgur.com/E8FXaW5.png", "shield", 111, 1111, "cd", 0.05, 0.42, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 3 === 0) {
                myStats.cr += 0.33;
                if (myStats.cr > 1) myStats.cr = 1;
            };
        }, 9999));
    }, "Every 3rd round, the wielder has **33%** increased crit rate.", "The Legionnaire's Guardian is a golden shield, gleaming brightly in the sunlight. Its intricate designs and patterns are a testament to the skilled craftsmanship of its creators, and its golden surface shimmers with a fierce, fiery light. In the heat of battle, this shield is a beacon of hope and protection, shielding its wielder from harm and inspiring courage in all who see it.", "legendary", 384),
    new weaponInfo("Moatwall", "weapon", "shield", ["crafting", "chest"], "<:moatwall:1068707073585582160>", "https://i.imgur.com/3xnG7rM.png", "shield", 139, 1071, "hp", 68, 426, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 4 === 0) {
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) / 3), {});
            };
        }, 9999));
    }, "The wielder heals **33%** of missing HP every 4th round.", "The Moatwall is made of solid, unbreakable steel. Its surface is emblazoned with the crest of the castle, and it is said to have been crafted by the greatest smiths in the land. It is the ultimate defense for the warrior who defends the castle's moat.", "legendary", 385),
    new weaponInfo("Shield of Chivalry", "weapon", "shield", ["crafting", "chest"], "<:shield_of_chivalry:1068707198055764008>", "https://i.imgur.com/qytASEP.png", "shield", 92, 846, "shield", 57, 537, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 6 === 0) {
                myStats.shield += 300;
            };
        }, 9999));
    }, "The wielder gets **300** shield every 6th round.", "The Shield of Chivalry is a shining symbol of honor and bravery. Carried by the bravest knights, it has stood tall in the face of countless battles, protecting its wielder from harm. In its gleaming surface, the virtues of chivalry are reflected. With this shield in hand, one can face any challenge with confidence and grace.", "legendary", 386),
    new weaponInfo("The Castlemaiden", "weapon", "shield", ["chest"], "<:the_castlemaiden:1068707200534581381>", "https://i.imgur.com/kHg6BdO.png", "shield", 156, 1027, "mana", 10, 40, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mg += 5;
        mybuff.mg.push(new buffInfo("+", 5, 9999));
    }, "Increases mana generation by **+5**💧 for the rest of battle.", "This graceful shield is made of the finest gold, encrusted with precious jewels and adorned with the crest of the castle. It is said to have been carried by the greatest knights of the kingdom, and it is imbued with their strength and courage.", "legendary", 387),
    new weaponInfo("Vowed Keeper", "weapon", "shield", ["crafting", "chest"], "<:vowed_keeper:1068707204271722556>", "https://i.imgur.com/2yiUmx3.png", "shield", 155, 1105, "mr", 21, 139, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mr += 212;
        mybuff.mr.push(new buffInfo("+", 212, 9999));
    }, "The wielder takes **20%** less magic damage.\n\n_20% magic damage reduction = 212 MR_", "Forged from the finest steel and enchanted by powerful ancient magic, the Vowed Keeper is a shield imbued with the strength of its wielder's resolve. It is said that those who wield this shield are protected by the fates themselves, their determination and courage shielding them from even the most deadly of blows. In battle, the Vowed Keeper is a stalwart guardian, standing firm against the onslaught of enemies and safeguarding its bearer from harm.", "legendary", 388),
    new weaponInfo("Zealous Shroud", "weapon", "shield", ["chest"], "<:zealous_shroud:1068707194356371546>", "https://i.imgur.com/0feOSyj.png", "shield", 168, 1176, "def", 22, 146, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 3 === 0) {
                myStats.def += 274;
                myStats.mr += 274;
            };
        }, 9999));
    }, "Every 3rd round, the wielder takes **25%** less damage.\n\n_25% damage reduction = 274 DEF|MR_", "The Zealous Shroud is a protective barrier that surrounds its wielder in a cloak of shadow, shielding them from harm and concealing their movements from their enemies. With its dark and eerie powers, the Zealous Shroud allows its bearer to strike from the shadows and strike fear into the hearts of their foes.", "legendary", 389),

    // Weapons - Mythical Sword
    new weaponInfo("Dreadknight's Demise", "weapon", "sword", ["chest"], "<:dreadknights_demise:1068720496994168852>", "https://i.imgur.com/JWP9KaW.png", "atk", 106, 1132, "cd", 0.1, 0.46, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.replaceButton.atk = {
            "emoji": "<:dreadknights_demise:1068720496994168852>",
            "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:dreadknights_demise:1068720496994168852> **${char.name}**`, { critChance: 0, magicDamage: true });
            },
        };
    }, "Normal attacks always crit.", "The Dreadknight's Demise, crafted from the rarest of materials - purple obsidian - said to be formed from the molten remains of fallen celestial beings. It's unknown origins shrouded in mystery have lead to many speculations, with some believing it was crafted by a group of powerful wizards who had mastered the art of imbuing objects with magical energy, while others believed it to be forged in the fiery depths of the underworld, by demons eager to see it used for evil.\nLegend has it that the sword was wielded by a fearsome knight known only as the Dreadknight, who could not resist the seductive allure, succumbing to the temptation to use its power for selfish gains. He used it to conquer entire kingdoms and crush all who dared to oppose him. However, at last his reign of terror was brought to an end, by a brave Hero using the very sword the Dreadknight had wielded for so long. Since then the sword has been passed from one hero to the next, each one using it to defend the realm from evil. It is a symbol of both great strength and great caution, a reminder of the dangers of allowing power to consume one's soul.", "mythical", 390),
    new weaponInfo("Dulcet Wave", "weapon", "sword", ["chest"], "<:dulcet_wave:1068720500618055681>", "https://i.imgur.com/kNJzyYU.png", "atk", 91, 989, "mr", 66, 178, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.def.push(new buffInfo("+", -Math.min(eStats.def * 0.4, 872), 9999));
        ebuff.mr.push(new buffInfo("+", -Math.min(eStats.mr * 0.4, 872), 9999));
        eStats.def -= Math.floor(Math.min(eStats.def * 0.4, 872));
        eStats.mr -= Math.floor(Math.min(eStats.mr * 0.4, 872));
    }, "Reduces enemy defense and magic resistance by **40%** (max 2.5x damage).", "The Dulcet Wave is a sword of myths crafted by the mermaids of the deep sea. Forged from a rare metal found only in the depths of the ocean, its blade is said to sing with the melody of the tides. The sword's enchantments allow the wielder to control water with deadly precision, summoning massive waves to sweep away enemies or creating a deluge to drown them. But be warned, for the power of the sea is fickle and those who wield the Dulcet Wave must be worthy of its might, lest they be swept away themselves.", "mythical", 391),
    new weaponInfo("Excalibur", "weapon", "sword", ["chest"], "<:excalibur:1068720505282121818>", "https://i.imgur.com/xoBMCi4.png", "atk", 100, 1000, "atk%", 0.1, 0.25, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.md += Math.floor(myStats.md * 0.25);
        myStats.atk += Math.floor(myStats.atk * 0.25);
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.25), 9999));
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.25), 9999));
    }, "The wielder has **25%** increased attack and magic damage for the rest of battle.", "Excalibur is the legendary sword of King Arthur, said to have been bestowed upon him by the Lady of the Lake. Its gleaming blade, crafted from the finest steel and etched with ancient runes, is sharp enough to cut through even the toughest diamonds. In the hands of a worthy wielder, Excalibur is said to grant extraordinary strength and courage. But beware, for only the pure of heart can wield this powerful weapon.", "mythical", 392),
    new weaponInfo("Lambent Light", "weapon", "sword", ["chest"], "<:lambent_light:1068720508885024859>", "https://i.imgur.com/X0H8ezb.png", "atk", 93, 1048, "br", 0.08, 0.25, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodge += 0.2;
        if (myStats.dodge > 1) myStats.dodge = 1;
        mybuff.dodge.push(new buffInfo("+", 0.2, 9999));
        myStats.cr += 0.15;
        if (myStats.cr > 1) myStats.cr = 1;
        mybuff.cr.push(new buffInfo("+", 0.15, 9999));
        myStats.cd += 0.25;
        mybuff.cd.push(new buffInfo("+", 0.25, 9999));
    }, "The wielder has **20%** increased dodge chance, **15%** increased crit rate and **25%** increased crit damage.", "Forged in the fiery depths of Mount Eternum, Lambent Light was crafted by the legendary blacksmith, Gaius. It is imbued with a powerful energy that radiates a brilliant, radiant light. Those who wield Lambent Light are said to be blessed with the power of the eternal light, granting them unmatched strength and endurance in battle. Beware, for those who dare to wield the sword without pure intentions shall be consumed by its power.", "mythical", 393),

    new weaponInfo("Moonblade", "weapon", "sword", ["chest"], "<:moonblade:1068720491742908486>", "https://i.imgur.com/z6GYeQS.png", "atk", 100, 1090, "shield", 213, 654, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def += 274;
        myStats.mr += 274;
        mybuff.def.push(new buffInfo("+", 274, 9999));
        mybuff.mr.push(new buffInfo("+", 274, 9999));
        myStats.shield += Math.floor(0.05 * myStats.maxhp);
    }, "The wielder takes **25%** less damage. Generates a shield of **20%** of max HP at the start of battle.\n\n_A reduction of 25% = 274 DEF|MR_", "The Moonblade is a sword forged from a rare metal found deep in the lunar mines. Its blade glows with a soft, silver light, casting a serene glow upon the battlefield. Those who wield it are said to be blessed with the power of the moon, granting them increased speed and agility in combat. The sword's enchantments are attuned to the waxing and waning of the moon, granting increased power during a full moon and decreased power during a new moon. It is said that the sword was crafted by a powerful druid, and is a symbol of her favor and protection. Those who possess the Moonblade are said to be blessed with the goddess's favor and will always find themselves victorious in battle.", "mythical", 394),
    new weaponInfo("Sirene's Song", "weapon", "sword", ["chest"], "<:sirenes_song:1068720493957497002>", "https://i.imgur.com/o9Ek5oh.png", "atk", 98, 1067, "mana", 15, 50, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.sm = myStats.mana;
        myStats.mg -= 5;
        mybuff.mg.push(new buffInfo("+", -5, 9999));
    }, "The wielder starts with a full mana bar, but generates **5**💧 less mana each round.", "The Sirene's Song is a weapon like no other. Forged from the finest pearls and shells of the ocean, it is said to have the power to charm its enemies with its enchanting melodies. In the hands of a skilled wielder, this sword can unleash a beautiful but deadly tune that is said to have the power to mesmerize even the most ferocious sea creatures. It is said that the Sirene herself, the mythical sea goddess of song and beauty, once wielded this weapon in battle against the greatest warriors of the deep. To this day, the Sirene's Song remains a powerful and feared weapon among the ancient legends.", "mythical", 395),

    // Weapons - Mythical Staff
    new weaponInfo("Celestial Scepter", "weapon", "staff", ["chest"], "<:celestial_scepter:1068912873830621194>", "https://i.imgur.com/X2qr5DZ.png", "md", 77, 842, "md", 64, 536, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.03), 9999));
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.md += Math.floor(myStats.md * Math.min(0.04 * Math.floor(matchStats.round - 1), 0.3));
        }, 9999));
    }, "Increases the wielders magic damage by **4%** each round (max 30%) and heals **3%** of max HP.", "This beautiful staff known as the Celestial Scepter is said to be crafted from the finest celestial metals and imbued with powerful magic. It is said to grant its wielder the ability to harness the power of the stars and control the movements of celestial bodies.", "mythical", 396),
    new weaponInfo("Crescent Skies", "weapon", "staff", ["chest"], "<:crescent_skies:1068913239116759111>", "https://i.imgur.com/vBIjTTt.png", "md", 123, 1234, "sm", 3, 21, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mana += 100;
        myStats.mg += 8;
        mybuff.mg.push(new buffInfo("+", 8, 9999));
    }, "The wielder generates **+8**💧 each round. Increases mana cap by **100**.", "The staff of Crescent Skies is a powerful tool in the hands of any spellcaster. Its intricate design features two crescent moons at the top, with swirling blue lights on its surface, and engraved with ancient runes. When the staff is wielded, it seems to amplify the user's magic, allowing them to cast spells with ease and power. Those who face the wielder of Crescent Skies in battle are in for a fierce and formidable opponent.", "mythical", 397),
    new weaponInfo("Death's Denial", "weapon", "staff", ["chest"], "<:deaths_denial:1068912879975268462>", "https://i.imgur.com/22zolt6.png", "md", 102, 1033, "hp", 146, 675, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const drain = Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.03);
        ebuff.hp.push(new buffInfo("+", -drain, 9999));
        mybuff.hp.push(new buffInfo("+", drain, 9999));
        myStats.maxRevivals = 1;
        myStats.rev = 1;
        myStats.revhp = 0.5;
    }, "The wielder revives themselve after their first death with **50%** HP. Additionally, drains **3%** HP from the enemy and adds it to the wielder every round. If enemy HP is more than twice of the wielders HP, it drains the equivalent of **6%** of the wielders HP instead.", "In the hands of the unworthy, Death's Denial is just a simple staff. But for those deemed worthy by the spirits of the underworld, Death's Denial becomes a conduit of power, allowing its wielder to cheat death itself. Legends speak of those who have used its power to rise from the brink of death, their eyes glowing with otherworldly energy. But beware, for the spirits demand a heavy price for their gift, and those who wield the staff for too long may find themselves bound to the underworld for eternity.", "mythical", 398),
    new weaponInfo("Dreamcatcher", "weapon", "staff", ["chest"], "<:dreamcatcher:1068913203117035540>", "https://i.imgur.com/TXpjhQe.png", "md", 90, 977, "md%", 0.06, 0.24, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.br = 0;
        eStats.dodge = 0;
        ebuff.br.push(new buffInfo("=", 0, 9999));
        ebuff.dodge.push(new buffInfo("=", 0, 9999));
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.md += Math.floor(myStats.md * Math.min(0.03 * Math.floor(matchStats.round - 1), 0.33));
        }, 9999));
    }, "The enemy starts with **0%** dodge chance and block rate. Increases the wielders magic damage by **3%** each round (max 33%).", "The Dreamcatcher staff is imbued with ancient magic, crafted by the fae to capture and hold onto the wildest dreams of the night. Its intricate design is said to protect the user from nightmares, allowing only peaceful and vivid dreams to pass through. With this staff in hand, one can explore the realm of the unconscious and unlock the hidden power of their imagination.", "mythical", 399),
    new weaponInfo("Extant Core", "weapon", "staff", ["chest"], "<:extant_core:1068913297077841990>", "https://i.imgur.com/k22xlVf.png", "md", 99, 999, "atk", 99, 999, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(33, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.shield = 0;
            if (Math.random() < 0.01) {
                notice.push(`\n💨 **${eStats.name}** dodged the Extant Core!`);
            } else {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:extant_core:1068913297077841990> **${char.name}**`, { atkMultiplier: 9.99, block: false, dodge: false, magicDamage: true });
            };
        }));
    }, "If the wielder survives for 33 rounds, breaks enemy shield and deals **999%** unblockable damage. However, there is a **1%** chance of the enemy dodging the attack.", "The Extant Core is a powerful staff said to have been forged by the ancient gods. It is said to contain the essence of nuclear magic within its crystalline orb, harnessed by the gods to maintain the balance of the universe. The staff, when wielded by a skilled user, grants immense destructive power and the ability to manipulate the very fabric of reality. Only the bravest and most experienced adventurers should wield the Extant Core, for its power is not to be trifled with.", "mythical", 400),
    new weaponInfo("Fireweaver", "weapon", "staff", ["chest"], "<:fireweaver:1068913289381294221>", "https://i.imgur.com/hOFUR4Q.png", "md", 109, 1054, "cd", 0.09, 0.54, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr += 0.3;
        if (myStats.cr > 1) myStats.cr = 1;
        mybuff.cr.push(new buffInfo("+", 0.3, 9999));
        if (myStats.hp / myStats.maxhp < 0.3) {
            myStats.cd += 0.3;
            mybuff.cd.push(new buffInfo("+", 0.3, 9999));
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.4), {});
        } else {
            myStats.delayedBuffs.push(new delayedBuffs(0, function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp / myStats.maxhp < 0.3) {
                    myStats.cd += 0.3;
                    mybuff.cd.push(new buffInfo("+", 0.3, 9999));
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.4), {});
                    //@ts-ignore
                    this._used++;
                };
            }, 9999, 1));
        };
    }, "The wielder has **30%** increased crit rate. The first time the wielders HP falls below **30%** of max HP, increases crit damage by **30%** and heals **40%** of missing HP.", "The Fireweaver staff is a powerful tool of destruction, capable of conjuring flames that dance at the wielder's command. Its intricate design is said to have been crafted by ancient fire spirits, imbued with their mastery of the element. With a single swipe of the Fireweaver, entire armies can be reduced to ash, leaving nothing but scorched earth in its wake. Only the bravest and most skilled of wielders can harness its true power.", "mythical", 401),
    new weaponInfo("Serendipity", "weapon", "staff", ["chest"], "<:serendipity:1068913293969850490>", "https://i.imgur.com/p3Qs2vO.png", "md", 112, 1080, "dodge", 0.07, 0.17, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodgeHeal += 0.07;
    }, "The wielder heals **7%** of max HP after successfully dodging an attack.", "The Serendipity is a magic staff of incredible power, imbued with the essence of good fortune and serendipitous events. Those who wield it are constantly surrounded by luck, as unlikely events and fortuitous circumstances seem to unfold around them. Though its true origins are unknown, it is said that the staff was crafted by ancient beings who sought to bless the world with the gift of serendipity, spreading joy and abundance wherever it is wielded.", "mythical", 402),

    // Weapons - Mythical Axe
    new weaponInfo("Avenger's Act", "weapon", "axe", ["chest"], "<:avengers_act:1068959685794869269>", "https://i.imgur.com/5Hfe3wa.png", "atk", 140, 1223, "def", 26, 143, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.br -= 0.2;
        if (eStats.br < 0) eStats.br = 0;
        ebuff.br.push(new buffInfo("+", -0.2, 9999));
        eStats.shield = 0;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:avengers_act:1068959685794869269> **${char.name}**`, { atkMultiplier: 2.5 });
    }, "Immediately after the battle begins, breaks enemy shield and deals **250%** physical damage to the enemy. The enemy has **20%** decreased block rate.", "Forged from the flames of injustice, the Avenger's Act is a battle axe that seeks to right the wrongs of the world. Its sharpened edges are a symbol of the vengeance it brings to those who dare to oppress the innocent. Those who wield it are known as champions of the downtrodden, striking fear into the hearts of the wicked. Let the Avenger's Act be a reminder that no evil deed goes unpunished.", "mythical", 403),
    new weaponInfo("Grand Harvester", "weapon", "axe", ["chest"], "<:grand_harvester:1068959406106087485>", "https://i.imgur.com/oEmcsvG.png", "atk", 128, 1160, "br", 0.04, 0.2, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def += 386;
        mybuff.def.push(new buffInfo("+", 386, 9999));
        myStats.br += 0.2;
        if (myStats.br > 1) myStats.br = 1;
        mybuff.br.push(new buffInfo("+", 0.2, 9999));
    }, "The wielder takes **33%** reduced physical damage and has **20%** increased block rate.\n\n_A reduction of 33% = 386 DEF_", "Forged by the greatest blacksmith in the land, the Grand Harvester was crafted with one purpose only - to reap the battlefield of its enemies. With its sharp, curved blade and sturdy handle, this axe delivers devastating blows, leaving a trail of destruction in its wake. In the hands of a skilled warrior, the Grand Harvester becomes a formidable weapon, capable of harvesting the lives of those who dare stand in its way.", "mythical", 404),
    new weaponInfo("Heirloom of Eternal Rest", "weapon", "axe", ["chest"], "<:heirloom_of_eternal_rest:1068959389546971328>", "https://i.imgur.com/sKdeWWl.png", "atk", 137, 1196, "mr", 29, 125, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mr += 660;
        mybuff.mr.push(new buffInfo("+", 660, 9999));
    }, "The wielder takes **50%** reduced magic damage.\n\n_A reduction of 50% = 660 MR_", "Forged by the ancient kings of old, the \"Heirloom of Eternal Rest\" was crafted to lay the fallen to rest with honor and dignity. Its gleaming blade and ornate engravings pay tribute to the dead and serve as a reminder of the eternal cycle of life and death. In battle, this axe is a formidable weapon, capable of delivering powerful blows that send enemies to their final resting place.", "mythical", 405),
    new weaponInfo("Imperial Timberwolf", "weapon", "axe", ["chest"], "<:imperial_timberwolf:1068959393498005637>", "https://i.imgur.com/DXPkBcU.png", "atk", 134, 1206, "cr", 0.05, 0.2, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cd += 0.4;
        mybuff.cd.push(new buffInfo("+", 0.4, 9999));
    }, "The wielder has **40%** increased crit damage.", "Forged from the sturdiest steel and plated with the finest gold, the Imperial Timberwolf is a weapon of unparalleled strength and majesty. Its two blades, gleaming with the fire of a thousand suns, are capable of cutting through the toughest of armor and the strongest of defenses. The very sight of this battle axe is enough to strike fear into the hearts of your enemies and inspire loyalty in your allies. Wield the Imperial Timberwolf and claim your rightful place as the ruler of the battlefield.", "mythical", 406),
    new weaponInfo("Serenade's Axe", "weapon", "axe", ["chest"], "<:serenades_axe:1068959396320772177>", "https://i.imgur.com/i3hulSK.png", "atk", 130, 1178, "dodge", 0.05, 0.16, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if (myStats.hp / myStats.maxhp < 0.4) {
                myStats.atk -= Math.floor(myStats.atk * 0.2);
                mybuff.atk.push(new buffInfo("+", -myStats.atk * 0.2, 9999));
                myStats.md -= Math.floor(myStats.md * 0.2);
                mybuff.md.push(new buffInfo("+", -myStats.md * 0.2, 9999));
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, myStats.maxhp - myStats.hp, {});
                //@ts-ignore
                this._used++;
            };
        }, 9999, 3));
    }, "The wielder completely recovers their HP when it falls below **40%** of max HP for a total of 3 times. However, decreases attack and magic damage by **20%** each time.", "Serenade's Axe sings a sweet melody with each swing, drawing the attention of all those nearby. Its sharp blade gleams in the light, promising swift justice to any who dare oppose its wielder. Those who hear its song are mesmerized, unable to resist the temptation to dance to its beat - even in the heat of battle.", "mythical", 407),
    new weaponInfo("Warlord's Bronzed Crescent", "weapon", "axe", ["chest"], "<:warlords_bronzed_crescent:1068959400036933712>", "https://i.imgur.com/00Qp9YZ.png", "atk", 96, 915, "atk", 71, 529, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.dodge -= 0.25;
        if (eStats.dodge < 0) eStats.dodge = 0;
        ebuff.dodge.push(new buffInfo("+", -0.25, 9999));
        eStats.br -= 0.25;
        if (eStats.br < 0) eStats.br = 0;
        ebuff.br.push(new buffInfo("+", -0.25, 9999));
        myStats.atk += Math.floor(myStats.atk * 0.15);
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.15), 9999));
    }, "Decreases enemy dodge chance and block rate by **25%**. The wielder has **15%** increased attack.", "Forged by the finest smiths in the land, the Warlord's Bronzed Crescent is a weapon of unmatched strength and precision. With its sharp, crescent-shaped blade and intricate bronze detailing, this axe is a symbol of power and authority on the battlefield. But despite its fearsome reputation, the Warlord's Bronzed Crescent is not without its flaws. Its great size and weight make it difficult to wield for those without the strength and skill of a true warrior.", "mythical", 408),

    // Weapons - Mythical Bow
    new weaponInfo("Bolt of Judgment", "weapon", "bow", ["chest"], "<:bolt_of_judgment:1069016597248888852>", "https://i.imgur.com/BgXeAwO.png", "md", 107, 1138, "hp", 185, 698, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mr -= Math.floor(eStats.mr * 0.3);
        ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.3), 9999));
        myStats.mdChance = 1;
    }, "The enemy has **30%** decreased magic resistance. The wielder deals magic damage by default.", "The Bolt of Judgment is a weapon of unparalleled precision. Its ancient mechanisms, forged by the greatest smiths of a bygone era, are imbued with a sense of righteous fury, seeking out only the most deserving targets. So let the judgment be passed, and let the bolt fly true.", "mythical", 409),
    new weaponInfo("Braveheart", "weapon", "bow", ["chest"], "<:braveheart:1069016599551553586>", "https://i.imgur.com/xTVUEM7.png", "atk", 99, 1008, "hp", 124, 637, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.dodge -= 0.2;
        if (eStats.dodge < 0) eStats.dodge = 0;
        ebuff.dodge.push(new buffInfo("+", -0.2, 9999));
        myStats.dodgeHeal += 0.05;
    }, "Decreases enemy dodge chance by **20%**. The wielder heals **5%** of max HP after successfully dodging an attack.", "The Braveheart bow is a weapon of unparalleled power, imbued with the strength and determination of warriors past. With each shot, it unleashes a bolt of pure courage that pierces through even the thickest armor and strikes fear into the hearts of the enemy. Its intricate design, featuring sleek curves and gleaming gold accents, is a testament to the skill and artistry of its maker. In the hands of a true hero, the Braveheart bow is a force to be reckoned with.", "mythical", 410),
    new weaponInfo("Comet's Tail", "weapon", "bow", ["chest"], "<:comets_tail:1069016602663731300>", "https://i.imgur.com/Shwjmz6.png", "atk", 112, 1098, "cd", 0.1, 0.56, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 3 === 0) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:comets_tail:1069016602663731300> **${char.name}**`, { atkMultiplier: 0.8, magicDamage: true });
            };
        }, 9999));
    }, "Fires an attack dealing **80%** damage every 3 rounds.", "The Comet's Tail bow is said to have been crafted from the fiery remains of a shooting star. Its graceful curves and shimmering blue hue give it the appearance of a celestial being, and its arrows fly true and fast, striking their targets with the force of a comet's impact. Some say that the bow is imbued with otherworldly magic, allowing its wielder to shoot with unerring accuracy and devastating power. Few can withstand the fury of the Comet's Tail in battle.", "mythical", 411),
    new weaponInfo("Mystic Moon", "weapon", "bow", ["chest"], "<:mystic_moon:1069016606199533578>", "https://i.imgur.com/1AbatPX.png", "atk", 86, 1017, "mana", 10, 50, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mg += 5;
        mybuff.mg.push(new buffInfo("+", 5, 9999));
        eStats.dodge -= 0.16;
        if (eStats.dodge < 0) eStats.dodge = 0;
        ebuff.dodge.push(new buffInfo("+", -0.16, 9999));
    }, "Increases mana generation by **+5**💧 for the rest of battle. Decreases enemy dodge chance by **16%**.", "The Mystic Moon bow is said to have been crafted by a reclusive group of elven magic-users, its graceful curves imbued with the power of the lunar cycle. As the full moon rises, the bow's strings hum with otherworldly energy, empowering its arrows to strike with unerring accuracy and devastating force. Those who wield the Mystic Moon bow are said to be guided by the subtle whispers of the moon, imbued with a hunter's instinct and a deadly precision.", "mythical", 412),
    new weaponInfo("Nightwing Myst", "weapon", "bow", ["chest"], "<:nightwing_myst:1069016609013903431>", "https://i.imgur.com/TKs4wkG.png", "atk", 106, 1033, "cr", 0.08, 0.24, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const drain = Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.03);
        ebuff.hp.push(new buffInfo("+", -drain, 9999));
        mybuff.hp.push(new buffInfo("+", drain, 9999));
    }, "Drains **3%** HP from the enemy and adds it to the wielder every round. If enemy HP is more than twice of the wielders HP, it drains the equivalent of **6%** of the wielders HP instead.", "The Nightwing Myst bow is a sleek and deadly weapon, perfectly balanced and designed for speed and accuracy. Its dark finish is nearly impossible to see in the shadows, making it the perfect tool for stealthy and deadly archery. The Nightwing Myst is a favorite among assassins and other shadowy figures, who rely on its quick strike and silent power to eliminate their targets without being detected. With the Nightwing Myst in hand, you can strike fear into the hearts of your enemies and leave them trembling in the darkness.", "mythical", 413),
    new weaponInfo("Sagitta Solis", "weapon", "bow", ["chest"], "<:sagitta_solis:1069016593356566528>", "https://i.imgur.com/xZmQlxx.png", "atk", 104, 1052, "md", 86, 857, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.replaceButton.atk = {
            "emoji": "<:sagitta_solis:1069016593356566528>",
            "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const burn = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:sagitta_solis:1069016593356566528> **${char.name}**`, { atkMultiplier: 1, magicDamage: true });
                ebuff.hp.push(new buffInfo("+", -Math.floor(burn * 0.125), 3));
            },
        };
    }, "Normal attacks additionally burn the enemy, dealing **12.5%** true damage for 3 rounds.\n\n_true damage = ignores shield_", "The Sagitta Solis, also known as the Arrow of the Sun, is a weapon of great power and beauty. Crafted by powerful spirits of light, its gleaming golden bowstring is imbued with the warmth and radiance of the sun itself. As it flies true and swift, it brings forth a blazing trail of light, illuminating the battlefield and striking fear into the hearts of the enemy. In the hands of a skilled archer, the Sagitta Solis is a weapon of unparalleled precision and might.", "mythical", 414),
    new weaponInfo("Tundral", "weapon", "bow", ["chest"], "<:tundral:1069017127874461810>", "https://i.imgur.com/Pt7OKU8.png", "atk", 86, 948, "mana", 10, 50, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.sm >= (myStats.mana * 0.6)) {
            myStats.atk += Math.floor(myStats.atk * 0.33);
            myStats.md += Math.floor(myStats.md * 0.33);
        };
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.sm >= (myStats.mana * 0.6)) {
                myStats.atk += Math.floor(myStats.atk * 0.33);
                myStats.md += Math.floor(myStats.md * 0.33);
            };
        }, 9999));
    }, "The wielder has **33%** increased attack and magic damage while their mana bar is at least **60%** full.", "The Tundral bow is crafted from the coldest, toughest wood found in the frozen tundra. Its ice-blue string is as strong as steel, and when drawn it seems to whisper a chilling melody. With the Tundral bow in hand, hunters can take down the most fearsome beasts of the northern wilderness.", "mythical", 415),

    // Weapons - Mythical Lance
    new weaponInfo("Coral Javelin", "weapon", "lance", ["chest"], "<:coral_javelin:1069018082779086959>", "https://i.imgur.com/e9Keaqo.png", "atk", 75, 848, "atk", 53, 643, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 3 === 0) {
                myStats.atk *= 2;
                myStats.md *= 2;
            };
        }, 9999));
    }, "Every 3 rounds the wielder has double the attack and magic damage.", "The Coral Javelin is a weapon of unparalleled beauty and deadly precision. Its shaft is crafted from a single, flawless piece of coral, harvested from the crystal-clear waters of the tropical seas. The spearhead, forged from the finest steel, glints like a jewel in the sunlight, its razor-sharp edge capable of piercing even the toughest of hides.", "mythical", 416),
    new weaponInfo("Divine Retribution", "weapon", "lance", ["chest"], "<:divine_retribution:1069018085266292866>", "https://i.imgur.com/QFAul2u.png", "atk", 80, 902, "cd", 0.1, 0.6, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.hp / myStats.maxhp < 0.5) {
            myStats.cd += 0.4;
            mybuff.cd.push(new buffInfo("+", 0.4, 9999));
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, myStats.maxhp - myStats.hp, {});
        } else {
            myStats.delayedBuffs.push(new delayedBuffs(0, function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp / myStats.maxhp < 0.5) {
                    myStats.cd += 0.4;
                    mybuff.cd.push(new buffInfo("+", 0.4, 9999));
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, myStats.maxhp - myStats.hp, {});
                    //@ts-ignore
                    this._used++;
                };
            }, 9999, 1));
        };
    }, "The first time the wielders HP falls below **50%** of max HP, increases crit damage by **40%** and heals all missing HP.", "The Divine Retribution is a lance wielded by the celestial warriors of the divine realm. It is imbued with the power of the gods themselves, and strikes with the force of a thousand thunderbolts. Those who dare to face its wrath are met with swift and unyielding punishment. Those who wield the Divine Retribution are chosen by the gods for their strength and righteousness, and are tasked with upholding justice and righteousness in the mortal world.", "mythical", 417),
    new weaponInfo("Roe Eile", "weapon", "lance", ["chest"], "<:roe_eile:1069018088760168488>", "https://i.imgur.com/ag00os7.png", "atk", 96, 1032, "shield", 277, 745, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 4 === 0) {
                myStats.cr = 1;
                myStats.cd += 0.4;
                eStats.dodge += 0.16;
                if (eStats.dodge > 1) eStats.dodge = 1;
            };
        }, 9999));
    }, "Every 4 rounds the wielder has **100%** crit rate and **40%** increased crit damage, but the enemy has **16%** increased dodge chance as well.", "The Roe Eile is a weapon of great renown among the fae folk. Its slender, curved blade is crafted from the finest elven steel and glows with a faint, ethereal light. The hilt is adorned with delicate filigree, which seem to writhe and twist under the wielder's touch. In battle, the Roe Eile is a blur of motion, slicing through flesh and armor alike. Those who face it in combat speak of a almost feral ferocity, as if the weapon itself were alive and thirsting for blood.", "mythical", 418),
    new weaponInfo("Shiverspine", "weapon", "lance", ["chest"], "<:shiverspine:1069018079272640583>", "https://i.imgur.com/2pCFskk.png", "md", 107, 1084, "md%", 0.08, 0.26, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mr -= Math.floor(eStats.mr * 0.3);
        ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.3), 9999));
    }, "Decreases enemy magic resistance by **30%**.", "The cold steel of the Shiverspine lance sends shivers down the spine of any foe who dares to face its deadly point. Forged from the frozen bones of an ancient dragon, this weapon is not only sharp and deadly, but also imbued with the power of the frost. Its icy touch can freeze the bravest warriors in their tracks, leaving them vulnerable to its swift and deadly strikes. Wielded by a skilled knight, the Shiverspine is a formidable weapon to behold on the battlefield.", "mythical", 419),
    new weaponInfo("Stabulous Smaragdina", "weapon", "lance", ["chest"], "<:stabulous_smaragdina:1069018770661720195>", "https://i.imgur.com/kDDlAyF.png", "atk", 99, 1111, "md", 77, 888, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.lootm += 0.4;
        myStats.md += Math.floor(myStats.md * 0.2);
        myStats.atk += Math.floor(myStats.atk * 0.2);
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.2), 9999));
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
    }, "Increases coins earned from the dungeon by **40%**. The wielder has **20%** increased attack and magic damage.", "Forged from the finest emeralds and imbued with the wisdom of Hermes Trismegistos, the Stabulous Smaragdina is a weapon of unparalleled power and elegance. Its sharp, glistening blade is a testament to the ancient philosopher's teachings on the unity of matter and spirit, and its graceful curves speak to the harmony of the divine and the mortal. In the hands of a skilled warrior, the Stabulous Smaragdina is a weapon of unparalleled precision and finesse, able to strike with the speed and force of the gods themselves.", "mythical", 420),
    new weaponInfo("Skyfall Javelin", "weapon", "lance", ["chest"], "<:skyfall_javelin:1069018773803245638>", "https://i.imgur.com/NxK2ftX.png", "atk", 106, 1122, "md", 88, 924, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.selfhealChance.push(1);
        myStats.selfheal.push(0.06);
        myStats.replaceButton.atk = {
            "emoji": "<:skyfall_javelin:1069018773803245638>",
            "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:skyfall_javelin:1069018773803245638> **${char.name}**`, { atkMultiplier: 1, block: false, dodge: false, magicDamage: true });
            },
        };
    }, "Normal attacks always hit. Heals the wielder for **6%** of damage dealt.", "As the Skyfall Javelin pierces the sky, it is as if the heavens themselves are falling upon your foes. With its razor-sharp tip and deadly accuracy, this lance strikes fear into the hearts of even the bravest warriors. Whether in the heat of battle or in a duel, the Skyfall Javelin is a weapon to be reckoned with.", "mythical", 421),

    // Weapons - Mythical Dagger
    new weaponInfo("Abyssal Shard", "weapon", "dagger", ["chest"], "<:abyssal_shard:1069019809993461872>", "https://i.imgur.com/W6u22OY.png", "md", 99, 999, "mg", 1, 5, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mdChance = 1;
        Object.keys(ebuff).forEach((e) => ebuff[e as keyof Buffs] = []);
    }, "Removes all buffs and debuffs from the enemy at the start of battle. The wielder deals magic damage by default.", "The Abyssal Shard is a weapon of pure darkness, forged in the depths of the underworld by a powerful demon. Its jagged edge glints with malevolent intent, and those who wield it are said to be consumed by a thirst for destruction and power. Those who face the Abyssal Shard in combat are often struck with fear, knowing that they are facing the wrath of the abyss itself.", "mythical", 422),
    new weaponInfo("Arcane Slicer", "weapon", "dagger", ["chest"], "<:arcane_slicer:1069019806881284137>", "https://i.imgur.com/MbSEzOA.png", "md", 96, 1085, "cd", 0.12, 0.54, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.md += Math.floor(myStats.md * 0.25);
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.25), 9999));
    }, "The wielder has **25%** increased magic damage.", "The Arcane Slicer is a dagger imbued with ancient magic, capable of slicing through even the toughest of defenses. Its razor-sharp blade glows with a faint, otherworldly light, making it a formidable weapon in the hands of those skilled in the arcane arts.", "mythical", 423),
    new weaponInfo("Flaming Fomor", "weapon", "dagger", ["chest"], "<:flaming_fomor:1069020248398897202>", "https://i.imgur.com/7sryILJ.png", "atk", 108, 1137, "cd", 0.12, 0.54, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.replaceButton.atk = {
            "emoji": "<:flaming_fomor:1069020248398897202>",
            "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const burn = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:flaming_fomor:1069020248398897202> **${char.name}**`, { atkMultiplier: 1, magicDamage: true });
                ebuff.hp.push(new buffInfo("+", -Math.floor(burn * 0.16), 2));
            },
        };
    }, "Normal attacks additionally burn the enemy, dealing **16%** true damage for 2 rounds (stackable).\n\n_true damage = ignores shield_", "Forged in the fiery depths of the Otherworld, the Flaming Fomor is said to be imbued with the power of flames. Its blade is made from pure molten lava, and is said to be capable of scorching the earth itself. Those who wield it are said to be favored by the Fomorians, and can call down the wrath of the inferno upon their enemies.", "mythical", 424),
    new weaponInfo("Jade Spine", "weapon", "dagger", ["chest"], "<:jade_spine:1069020251775303680>", "https://i.imgur.com/gQV5NkI.png", "atk", 109, 1172, "cr", 0.08, 0.25, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if (matchStats.round % 7 === 0) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:jade_spine:1069020251775303680> **${char.name}**`, { atkMultiplier: 1.8, magicDamage: true });
                //@ts-ignore
                this._used++;
            };
        }, 9999, 3));
    }, "Fires a jade projectile dealing **180%** damage every 7th round for a total of 3 times.", "The Jade Spine is a weapon steeped in legend and power. Crafted by the greatest blacksmith of their time with the strength and resilience of jade, it has been wielded by the ruling families of a small Eastern kingdom for generations. But be warned, for the Jade Spine is said to have a thirst for blood that can drive its wielder to madness. Only the bravest and most skilled warriors dare to wield its deadly blade.", "mythical", 425),
    new weaponInfo("Oath of Shifting Worlds", "weapon", "dagger", ["chest"], "<:oath_of_shifting_worlds:1069020253893443605>", "https://i.imgur.com/Ksli1ns.png", "atk", 123, 1234, "br", 0.01, 0.23, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.replaceButton.atk = {
            "emoji": "<:oath_of_shifting_worlds:1069020253893443605>",
            "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:oath_of_shifting_worlds:1069020253893443605> **${char.name}**`, { atkMultiplier: 1.23, ignoreShield: true, magicDamage: true });
            },
        };
        myStats.cr += 0.123;
        if (myStats.cr > 1) myStats.cr = 1;
        mybuff.cr.push(new buffInfo("+", 0.123, 9999));
        myStats.cd += 0.123;
        mybuff.cd.push(new buffInfo("+", 0.123, 9999));
    }, "Normal attacks deal **123%** true damage. The wielder has **12.3%** increased crit rate and crit damage.\n\n_true damage = ignores shield_", "The Oath of Shifting Worlds is a mythical weapon that is said to have been forged by the powerful beings of the spirit realm. It is said that the dagger was created to be wielded by a chosen champion who would use its powers to maintain balance between the mortal world and the spirit realm. The blade of the Oath of Shifting Worlds is made of a shimmering, otherworldly metal that is said to be able to cut through any material and even damage the very essence of a being's soul. However, it is also said that those who misuse the dagger's power will be punished by the spirits, who will strip them of their ability to wield the weapon and banish them from the spirit realm forever. Despite its great power, the Oath of Shifting Worlds is said to be a weapon of last resort, used only in times of great crisis when the balance between the mortal world and the spirit realm is threatened. It is a weapon of great responsibility, and only those who are truly worthy and selfless are able to wield it without succumbing to its power.", "mythical", 426),
    new weaponInfo("Silver Scar", "weapon", "dagger", ["chest"], "<:silver_scar:1069020244653383680>", "https://i.imgur.com/icaEOtQ.png", "atk", 86, 1086, "atk%", 0.08, 0.22, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr += 0.2;
        if (myStats.cr > 1) myStats.cr = 1;
        mybuff.cr.push(new buffInfo("+", 0.2, 9999));
        myStats.delayedBuffs.push(new delayedBuffs(0, function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if (matchStats.round === 13) {
                eStats.def = 0;
                eStats.mr = 0;
                eStats.br = 0;
                //@ts-ignore
                this._used++;
            };
        }, 9999, 1));
    }, "The wielder has **20%** increased crit rate. The enemy has no defense, magic resistance or block rate during the 13th round.", "The jagged edge of the Silver Scar glimmers menacingly in the dim light, a reminder of the countless battles it has survived. Those who wield it do so with precision, slicing through flesh and bone with ease. But beware, for the Silver Scar hungers for bloodshed, and its thirst is never quenched.", "mythical", 427),

    // Weapons - Mythical Shield
    new weaponInfo("Deflector of Zeal", "weapon", "shield", ["chest"], "<:deflector_of_zeal:1069023520736165928>", "https://i.imgur.com/lC54rCA.png", "shield", 219, 1323, "br", 0.07, 0.24, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.blockBuffDef += 155;
    }, "Every successful block decreases damage taken by **15%** for 6 rounds.\n\n_A reduction of 15% = 155 DEF|MR_", "The Deflector of Zeal is a powerful shield imbued with the unyielding spirit of a warrior. Its shining surface is capable of repelling even the strongest of magics, and its aura of determination can inspire courage in the hearts of its wielder and allies. Those who face it in battle will find their attacks deflected by its unbreakable will.", "mythical", 428),
    new weaponInfo("The Royal Bulwark", "weapon", "shield", ["chest"], "<:the_royal_bulwark:1069023524246798387>", "https://i.imgur.com/nbUVR0h.png", "shield", 213, 1308, "def", 21, 130, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.lootm += 0.25;
        myStats.def += 155;
        myStats.mr += 155;
        mybuff.def.push(new buffInfo("+", 155, 9999));
        mybuff.mr.push(new buffInfo("+", 155, 9999));
    }, "Increases coins earned from the dungeon by **25%**. The wielder takes **15%** less damage.\n\n_A reduction of 15% = 155 DEF|MR_", "This massive shield is made of solid, unbreakable steel. Its surface is emblazoned with the royal crest, and it is said to have been crafted by the greatest smiths in the land. It is the ultimate defense for any warrior who serves the crown.", "mythical", 429),
    new weaponInfo("Tyranny", "weapon", "shield", ["chest"], "<:tyranny:1069023518106325023>", "https://i.imgur.com/MZ1nlO4.png", "shield", 255, 1412, "cr", 0.06, 0.24, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cd += 0.3;
        mybuff.cd.push(new buffInfo("+", 0.3, 9999));
        myStats.executeHP = Math.max(0.2, myStats.executeHP);
    }, "Executes the enemy when below **20%** HP. The wielder has **30%** increased crit damage.", "The ancient shield known as Tyranny was said to have been crafted from the scales of an ancient tyrant dragon, one who had ruled over a great kingdom with an iron fist. The dragon, whose name has long been lost to the ages, was feared by all who knew of it, for its cruelty and power were unmatched. The shield itself is said to have been imbued with the dragon's power, making it nearly indestructible. But the shield was not without its drawbacks. It is said that the old tyrant dragon's cruelty and lust for power still lingered within the shield, tempting those who wielded it to give into their own dark desires. Many who have held the shield have been consumed by its power, becoming tyrants themselves and wreaking havoc on those around them.", "mythical", 430),
    new weaponInfo("Wall of Pain", "weapon", "shield", ["chest"], "<:wall_of_pain:1069023626055135303>", "https://i.imgur.com/LLIAXE2.png", "shield", 229, 1348, "cd", 0.09, 0.48, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.2), 9999));
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
        myStats.md += Math.floor(myStats.md * 0.2);
        myStats.atk += Math.floor(myStats.atk * 0.2);
    }, "Increases the wielders attack and magic damage by **20%**.", "The Wall of Pain is a shield feared by all who dare to face it in battle. Its sturdy construction and imposing size make it a formidable barrier, but it is the excruciating pain inflicted upon those who attempt to breach it that gives it its name. Those who bravely attempt to break through the Wall of Pain are met with a searing agony that saps their strength and leaves them vulnerable to their foes. It is a shield for the fearless and the foolhardy, and only the strongest warriors can hope to overcome its power.", "mythical", 431),
    new weaponInfo("Ward of Eternal Glory", "weapon", "shield", ["chest"], "<:ward_of_eternal_glory:1069023628324253866>", "https://i.imgur.com/lwYzucc.png", "shield", 204, 1287, "atk", 74, 432, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.lootm += 0.25;
        eStats.def -= Math.floor(eStats.def * 0.2);
        eStats.mr -= Math.floor(eStats.mr * 0.2);
        ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * 0.2), 9999));
        ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.2), 9999));
    }, "Decreases enemy defense and magic resistance by **20%** for the rest of battle. Increases coins earned from the dungeon by **20%**.", "The Ward of Eternal Glory is a powerful shield crafted by the greatest smiths of a long-forgotten kingdom. Forged from a rare and unbreakable metal, the shield was imbued with ancient magic that made it virtually indestructible. Legend has it that the shield was first wielded by the kingdom's greatest hero, a fearless warrior who used it to defend his land from all manner of threats, from fierce dragons to marauding armies. The shield proved to be a formidable weapon, able to deflect even the strongest of blows and protect its wielder from harm. Over time, the Ward of Eternal Glory became a symbol of the kingdom's power and prowess. It was passed down from generation to generation, each new wielder adding their own deeds and legends to its history. Eventually, the kingdom fell and the Ward of Eternal Glory was lost to the annals of time. But it is said that one day, a new hero will rise and reclaim the Ward of Eternal Glory.", "mythical", 432),
    new weaponInfo("Ward of the Lost", "weapon", "shield", ["chest"], "<:ward_of_the_lost:1069023621839859865>", "https://i.imgur.com/ml56PKJ.png", "shield", 146, 914, "shield", 115, 874, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.shield += Math.floor(eStats.shield * 0.5);
        eStats.shield -= Math.floor(eStats.shield * 0.5);
    }, "Steals half of enemy shield at the start of battle.", "Forged from the shattered remnants of a long-forgotten kingdom, the Ward of the Lost protects its bearer with the strength of a hundred warriors. In battle, the shield glows with a powerful, otherworldly light, driving back even the most fearsome of foes. Those who dare to face the bearer of the Ward of the Lost are met with a fate worse than death - the wrath of the lost souls who haunt the shield.", "mythical", 433),

    // Weapons - Genesis Sword
    new weaponInfo("Durin's Bane", "weapon", "sword", ["chest"], "<:durins_bane:1069025075036160020>", "https://i.imgur.com/TOWyMFD.png", "atk", 164, 1000, "atk", 92, 645, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.durinsBaneStacks = 0;

        // On hit
        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                caster.durinsBaneStacks++;
            };
        });

        // On miss
        matchStats.on("miss", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                caster.durinsBaneStacks = 0;
            };
        });

        // Buff atk and md
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.atk += Math.floor(myStats.atk * 0.05 * Math.min(10, myStats.durinsBaneStacks));
            myStats.md += Math.floor(myStats.md * 0.05 * Math.min(10, myStats.durinsBaneStacks));
        }, 9999));
    }, "Increases the wielders attack and magic damage by **5%** after every successful hit (max 50%). Resets when the hit misses.", "The dwarven sword Durin's Bane is a weapon of legendary strength and power, etched with ancient runes that tell the story of the dwarves. Passed down through generations, it was used to defend the dwarves and strike down their enemies. It was eventually lost, but the legend of its power lives on.", "genesis", 434),
    new weaponInfo("Heaven's Edge", "weapon", "sword", ["chest"], "<:heavens_edge:1069025071026409552>", "https://i.imgur.com/k8w3ZFm.png", "atk", 186, 1232, "hp", 300, 874, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const heal = Math.min(Math.floor(myStats.maxhp * 0.1), myStats.maxhp - myStats.hp);
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, heal, {});
            eStats.hp -= heal;
            if (eStats.hp < 0) eStats.hp = 0;
        }, 9999));
    }, "The wielder heals **10%** of max HP and deals the equivalent amount as damage to the enemy every round.", "The Heaven's Edge is a holy weapon, wielded by the archangels in the wars of the heavens. Its gleaming, silver blade is imbued with the power of the divine, capable of purging evil and striking down foes with holy fire and lightning. In the hands of a righteous warrior, it becomes a symbol of hope and protection against the forces of darkness.", "genesis", 435),

    // Weapons - Genesis Staff
    new weaponInfo("Sacred Lifemender", "weapon", "staff", ["chest"], "<:sacred_lifemender:1069025798440362084>", "https://i.imgur.com/1nemsJt.png", "md", 171, 970, "md", 86, 594, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.selfhealChance.push(1);
        myStats.selfheal.push(0.08);
    }, "Heals the wielder by **8%** of the damage dealt.", "The Sacred Lifemender staff is a powerful tool wielded by only the most skilled and compassionate healers. With a single touch, it can mend even the most severe injuries and restore vitality to the wounded. It is said that those who wield the Sacred Lifemender are blessed with the ability to soothe the pain and suffering of others, and bring them back from the brink of death.", "genesis", 436),
    new weaponInfo("Vermillion Vane", "weapon", "staff", ["chest"], "<:vermillion_vane:1069025800965324882>", "https://i.imgur.com/ccvhu0B.png", "md", 227, 1306, "mr", 64, 254, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.replaceButton.atk = {
            "emoji": "<:vermillion_vane:1069025800965324882>",
            "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const burn = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:vermillion_vane:1069025800965324882> **${char.name}**`, { atkMultiplier: 1, magicDamage: true });
                ebuff.hp.push(new buffInfo("+", -Math.floor(burn * 0.25), 2));
                ebuff.dodge.push(new buffInfo("=", 0, 2));
                ebuff.br.push(new buffInfo("=", 0, 2));
            },
        };
    }, "Normal attacks ignite the enemy, dealing **25%** true damage for 2 rounds. While on fire, reduces enemy dodge chance and block rate to 0.\n\n_true damage = ignores shield_", "The Vermillion Vane is a powerful magic staff imbued with the fiery essence of the sun. Its intricate carvings of molten rocks dance and twist along its length, radiating heat and energy. In the hands of a skilled pyromancer, the Vermillion Vane becomes a deadly weapon, capable of unleashing devastating blasts of searing fire, said to burn hotter than the deepest flames of hell.", "genesis", 437),
    new weaponInfo("Vestiges of Brilliant Light", "weapon", "staff", ["chest"], "<:vestiges_of_brilliant_light:1069025804064915486>", "https://i.imgur.com/ltd5Uqs.png", "md", 196, 1204, "md%", 0.12, 0.26, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 3 === 0) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:vestiges_of_brilliant_light:1069025804064915486> **${char.name}**`, { atkMultiplier: 1.2, mdChance: -1, magicDamage: true });
            };
        }, 9999));
    }, "Fires an attack dealing **120%** magic damage every 3 rounds.", "The Vestiges of Brilliant Light glows with a fierce, unyielding light, as if it has been imbued with the very essence of the sun itself. Its ancient, intricately carved runes pulsate with power, and those who wield it are said to be gifted with the ability to unleash devastating spells of pure, radiant energy. Some say that the staff was crafted by the gods themselves, as a gift to their most faithful servants, and that its power has been passed down through the ages to those who are worthy of its might.", "genesis", 438),

    // Weapons - Genesis Axe
    new weaponInfo("Elegy of the Glacial Heart", "weapon", "axe", ["chest"], "<:elegy_of_the_glacial_heart:1069026954671570984>", "https://i.imgur.com/2nHR7qm.png", "atk", 213, 1275, "def", 56, 187, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.br += 0.2;
        if (myStats.br > 1) myStats.br = 1;
        mybuff.br.push(new buffInfo("+", 0.2, 9999));
        // eStats.br -= 0.2;
        // if (eStats.br < 0) eStats.br = 0;
        // ebuff.br.push(new buffInfo("+", -0.2, 9999));
        // myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        //     if (Math.random() < 0.15) myStats.counter = Math.max(1, myStats.counter ?? 0);
        // }, 9999));
        mybuff.dodge.push(new buffInfo("=", 0, 9999));
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.dodge = 0;
        }, 9999));
        myStats.replaceButton.atk = {
            "emoji": "<:elegy_of_the_glacial_heart:1069026954671570984>",
            "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:elegy_of_the_glacial_heart:1069026954671570984> **${char.name}**`, { atkMultiplier: 1, magicDamage: true });
                myStats.usedBlockRound = matchStats.round;
            },
        };
    }, "Normal attacks have a chance to block (max 66%). The wielder has **20%** increased block rate. The wielder can't dodge.", "The Elegy of the Glacial Heart, radiating a chill that numbs the soul, is an ancient weapon crafted from the rarest of metals from the frozen depths of a never-melting glacier. It is said to be forged by the dwarves of the Frostfall Mountains in ancient times. Its icy edge slices through armor and flesh with ease, leaving behind a trail of frostbitten corpses. In battle, the axe sings a mournful dirge, reminding all who hear it of the unforgiving power of the elements.", "genesis", 439),
    new weaponInfo("Mortal Scarlet of the Timeless", "weapon", "axe", ["chest"], "<:mortal_scarlet_of_the_timeless:1069026748798345328>", "https://i.imgur.com/WvQLVjJ.png", "atk", 440, 1440, "shield", 440, 1440, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk += Math.floor(myStats.atk * 0.09); mybuff.atk.push(new buffInfo("*", 1.09, 9999));
        myStats.md += Math.floor(myStats.md * 0.09); mybuff.md.push(new buffInfo("*", 1.09, 9999));
        myStats.def += Math.floor(myStats.def * 0.09); mybuff.def.push(new buffInfo("*", 1.09, 9999));
        myStats.mr += Math.floor(myStats.mr * 0.09); mybuff.mr.push(new buffInfo("*", 1.09, 9999));
        myStats.cd += 0.09; mybuff.cd.push(new buffInfo("+", 0.09, 9999));
        myStats.cr += 0.09; mybuff.cr.push(new buffInfo("+", 0.09, 9999));
        myStats.dodge += 0.09; mybuff.dodge.push(new buffInfo("+", 0.09, 9999));
        myStats.br += 0.09; mybuff.br.push(new buffInfo("+", 0.09, 9999));
        if (myStats.cr > 1) myStats.cr = 1;
        if (myStats.dodge > 1) myStats.dodge = 1;
        if (myStats.br > 1) myStats.br = 1;
        matchStats.xpboost += 1;
    }, "The wielder has **9%** increased attack, magic damage, defense, magic resistance, crit rate, crit damage, dodge chance and block rate. The wielder gets **+100%** more class xp in the dungeon after a win.", "The Mortal Scarlet of the Timeless is a legendary axe forged from the strongest and most durable metal in existence, known as Scarletite. Its handle is unbreakable and its blade inscribed with ancient runes that grant its wielder unmatched strength and speed in combat. The axe can only be wielded by those who are truly worthy, and many who attempt to wield it are struck down by its power.\nLegend has it that the first wielder of the Mortal Scarlet of the Timeless was a great warrior who used the axe to vanquish countless foes in battle. The legend grew with each battle that the great warrior fought, and many other warriors sought to wield the powerful weapon in their own battles. However, it was said that the axe could only be wielded by those who were truly worthy, and many who attempted to wield it were struck down by its power. Eventually, the Mortal Scarlet of the Timeless was lost to the ages, its whereabouts unknown to all. Some say that it still exists, hidden away in a secret location, waiting for a worthy warrior to wield it once more and unleash its full power on the battlefield. \nRegardless of its fate, the legend of the Mortal Scarlet of the Timeless lives on, remembered as one of the greatest and most powerful weapons ever to have been wielded in battle.", "genesis", 440),

    // Weapons - Genesis Bow
    new weaponInfo("Flames of Valyria", "weapon", "bow", ["chest"], "<:flames_of_valyria:1069028632065998888>", "https://i.imgur.com/oGn5Whz.png", "atk", 212, 1187, "atk%", 0.12, 0.28, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const burn = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:flames_of_valyria:1069028632065998888> **${char.name}**`, { atkMultiplier: 2, magicDamage: true });
        ebuff.hp.push(new buffInfo("+", -Math.floor(burn * 0.2), 15));
    }, "Fires a burning shot at the start of the battle, immediately dealing **200%** damage and burns the enemy dealing **40%** true damage each round for 15 rounds.\n\n_true damage = ignores shield_", "The Flames of Valyria is a bow of legends forged in the fiery pits of the ancient city of Valyria. It is said that the bow was crafted by the greatest blacksmiths of the Valyrian Freehold, imbuing it with the power of dragonfire. The bow is made of Valyrian steel, a rare and highly sought-after metal known for its strength and ability to hold a sharp edge. The bowstring of the Flames of Valyria is made from the sinew of a dragon, giving it the ability to launch arrows with incredible speed and accuracy.\nIn the days of the Valyrian Freehold, the Flames of Valyria was wielded by the greatest dragonriders, who used it to hunt the fearsome beasts of the land. But with the downfall of Valyria, the bow was lost to the ages, its whereabouts and true power unknown. Adventurers and warriors from all over the realm have set out to find the Flames of Valyria, seeking to wield its power for themselves and become the greatest archer the world has ever known.", "genesis", 441),
    new weaponInfo("Heartseeker", "weapon", "bow", ["chest"], "<:heartseeker:1069028625019576320>", "https://i.imgur.com/UoZXFTQ.png", "atk", 777, 1333, "hp", 77, 777, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.replaceButton.atk = {
            "emoji": "<:heartseeker:1069028625019576320>",
            "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.07), {});
                if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:heartseeker:1069028625019576320> **${char.name}**`, { atkMultiplier: 1.2, magicDamage: true });
            },
        };
    }, "Normal attacks deal **120%** damage and heal **7%** of the wielders max HP.", "The Heartseeker is a bow of immense beauty and power, said to be crafted by the gods of celestia. This bow is said to be imbued with the very essence of the heavens, granting its wielder unparalleled accuracy and power. Its limbs are crafted from the finest celestial gold and the bowstring is woven from the purest of celestial silk. Its arrows fly true and straight, guided by the hands of the gods themselves.", "genesis", 442),
    new weaponInfo("Moonlit Shadow", "weapon", "bow", ["chest"], "<:moonlit_shadow:1069028628630872125>", "https://i.imgur.com/tZ9pgya.png", "atk", 194, 1136, "dodge", 0.08, 0.16, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.def.push(new buffInfo("+", -Math.min(eStats.def * 0.66, 1055), 9999));
        ebuff.mr.push(new buffInfo("+", -Math.min(eStats.mr * 0.66, 1055), 9999));
        eStats.def -= Math.floor(Math.min(eStats.def * 0.66, 1055));
        eStats.mr -= Math.floor(Math.min(eStats.mr * 0.66, 1055));
        myStats.selfhealChance.push(1);
        myStats.selfheal.push(0.05);
    }, "Reduces enemy defense and magic resistance by **66%** for the rest of battle (max 3x damage). Heals the wielder by **5%** of the damage dealt.", "The Moonlit Shadow is a bow of unrivaled grace and elegance shrouded in mystery. Some say it was crafted by a skilled archer who was enamored with the moon, while others believe it was created by a powerful witch to harness the power of the night. Despite its unsettling origins, the bow is highly sought after for its ability to strike fear into the hearts of its enemies. Its sleek black limbs gleam in the moonlight, blending seamlessly into the darkness. Its silvery string seems to shimmer in the moonlight, as if it is alive and hungry for prey. Those who dare to wield the Moonlit Shadow are said to be able to strike with the precision of a predator stalking its prey. With a single shot, it can fell the mightiest of foes, leaving only a shadowy silhouette in its wake.", "genesis", 443),

    // Weapons - Genesis Lance
    new weaponInfo("Gae Bolg", "weapon", "lance", ["chest"], "<:gae_bolg:1069032920733466706>", "https://i.imgur.com/1oEA0m0.png", "atk", 212, 1254, "cr", 0.08, 0.4, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cd += 0.4;
        mybuff.cd.push(new buffInfo("+", 0.4, 9999));
        myStats.replaceButton.atk = {
            "emoji": "<:gae_bolg:1069032920733466706>",
            "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:gae_bolg:1069032920733466706> **${char.name}**`, { atkMultiplier: 1.2, ignoreShield: true, magicDamage: true });
            },
        };
    }, "Normal attacks ignore shield and deal **20%** increased damage. The wielder has **40%** increased crit damage.", "The Gae Bolg is a legendary spear wielded only by the greatest warriors of the realm. Forged from the bones of a mythical sea creature, it is said to possess the power to unleash a devastating wave of destruction upon its enemies. Those who have gazed upon its shimmering, razor-sharp tip have spoken of a cold, otherworldly energy emanating from its depths, as if the very soul of the sea monster lives on within the weapon. Those who dare to wield the Gae Bolg in battle are said to be marked by destiny, their fate intertwined with the fate of the spear itself. Some even believe that the weapon chooses its wielder, rather than the other way around. But be warned, for the Gae Bolg is a double-edged sword, as deadly to its wielder as it is to their foes.", "genesis", 444),
    new weaponInfo("Celestial Wing", "weapon", "lance", ["chest"], "<:celestial_wing:1069032924952940615>", "https://i.imgur.com/LbD1ThM.png", "md", 206, 1227, "cd", 0.18, 0.56, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr = 0.5;
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 2 === 0) myStats.cr = 1;
            else myStats.cr = 0.5;
        }, 9999));
        myStats.mdChance += 1;
    }, "Every even round the wielder has **100%** crit rate, and **50%** every odd round. The wielder deals magic damage by default.", "The Celestial Wing was crafted by a group of ancient elven smiths who were tasked with creating a weapon fit for the gods. Using only the finest materials and imbuing it with powerful magic, they succeeded in creating a lance that radiated a divine aura.\nThroughout history, the Celestial Wing has been wielded by some of the greatest heroes and champions of justice. It has been used to vanquish countless evil foes and protect the innocent, earning it a reputation as a weapon of light and hope.\nHowever, the lance has also been sought after by those with darker intentions. Many have attempted to steal or claim it for their own, but have been unsuccessful so for. It's almost as if the lance has a will of its own.\nDespite its history and reputation, the Celestial Wing lance remains a rare and highly coveted weapon, sought after by both those who seek to do good in the world and protect the innocent, and those who wish to once again engulf the world in darkness.", "genesis", 445),

    // Weapons - Genesis Dagger
    new weaponInfo("Astral Cutlass", "weapon", "dagger", ["chest"], "<:astral_cutlass:1069033520523137064>", "https://i.imgur.com/LLK5ovB.png", "atk", 196, 1215, "dodge", 0.07, 0.15, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.sm += 20;
        if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;

        myStats.mg += 5;
        eStats.mg -= 5;
        mybuff.mg.push(new buffInfo("+", 5, 9999));
        ebuff.mg.push(new buffInfo("+", -5, 9999));

        myStats.stealManaOnDodge = 3;

    }, "The wielder starts with **+20** mana. Steals **5** mana from the enemy each round, and **3** more with every dodge.", "The Astral Cutlass is a weapon of incredible power, imbued with the very essence of the stars. Those who wield the Astral Cutlass are said to be blessed by the stars, and possess the strength and power to accomplish great feats in battle. Legend has it that only those who are pure of heart and deeply connected to the cosmic forces of the universe can wield the Astral Cutlass. It is a weapon of legend, sought after by many and wielded by only the greatest of warriors. Wield the Astral Cutlass and unlock the power of the stars, striking fear into the hearts of your enemies and becoming a true champion of the cosmos.", "genesis", 446),
    new weaponInfo("Dream Fragment", "weapon", "dagger", ["chest"], "<:dream_fragment:1069033524398665840>", "https://i.imgur.com/bBY44LQ.png", "atk", 201, 1286, "cd", 0.1, 0.54, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mdChance = 0.5;
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.mdChance = 0.5;
            if (myStats.atk > myStats.md) myStats.md = myStats.atk;
            else myStats.atk = myStats.md;
            if (myStats.def > myStats.mr) myStats.mr = myStats.def;
            else myStats.def = myStats.mr;
        }, 9999));
        if (myStats.atk > myStats.md) myStats.md = myStats.atk;
        else myStats.atk = myStats.md;
        if (myStats.def > myStats.mr) myStats.mr = myStats.def;
        else myStats.def = myStats.mr;
        myStats.cr += 0.2;
        if (myStats.cr > 1) myStats.cr = 1;
        mybuff.cr.push(new buffInfo("+", 0.2, 9999));
    }, "Increases the lower value between ATK|MD and DEF|MR to match the stronger stat, and crit rate is increased by **20%**. The wielder has a **50%** chance of dealing magic damage by default.", "As you grip the hilt of the Dream Fragment, a rush of memories flood your mind. You see visions of far-off lands, forgotten moments, and hidden desires. It was once a weapon wielded by a powerful dreamweaver, a being capable of manipulating the dreams of others. The dreamweaver used the dagger to delve into the subconscious minds of their victims, tearing apart their innermost desires and fears in order to bend them to their will. However, the dreamweaver's power eventually turned corrupt, using their abilities to inflict terror upon the innocent. A group of brave warriors banded together to defeat the dreamweaver and seize the Dream Fragment, determined to prevent it from falling into the wrong hands again. Wield it with caution, for the Dream Fragment has the power to both grant and shatter your deepest desires.", "genesis", 447),

    // Weapons - Genesis Shield
    new weaponInfo("Celestial Barrier", "weapon", "shield", ["chest"], "<:celestial_barrier:1069033755676778536>", "https://i.imgur.com/k12xxmX.png", "shield", 255, 1598, "mr", 96, 246, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.replaceButton.atk = {
            "emoji": "<:celestial_barrier:1069033755676778536>",
            "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                matchStats.loot += 5;
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:celestial_barrier:1069033755676778536> **${char.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
            },
        };
        myStats.mr += 212;
        myStats.def += 212;
        mybuff.mr.push(new buffInfo("+", 212, 9999));
        mybuff.def.push(new buffInfo("+", 212, 9999));
        matchStats.xpboost += 0.25;
    }, "The wielder takes **20%** less damage. Normal attacks add **+5** <:coins:872926669055356939> (only in a win). The wielder gets **+25%** more class xp in the dungeon after a win.\n\n_20% damage reduction = 212 DEF|MR_", "This shining shield is made of pure, unblemished silver. It is said to have been crafted by the gods themselves, and it is imbued with divine power. Its surface glows with a holy light, and it is able to deflect even the darkest of magic.", "genesis", 448),
    new weaponInfo("Roots of Yggdrasil", "weapon", "shield", ["chest"], "<:roots_of_yggdrasil:1069033759120298105>", "https://i.imgur.com/EOfdoP4.png", "shield", 238, 1482, "hp", 72, 784, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def += 486;
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 2) myStats.def += 486;
            else myStats.mr += 486;
        }, 9999));
        matchStats.xpboost += 0.25;
    }, "Every odd round the wielder takes **40%** reduced physical damage, and every even round **40%** reduced magic damage. The wielder gets **+25%** more class xp in the dungeon after a win.\n\n_A reduction of 40% = 486 DEF|MR_", "Roots of Yggdrasil is a weapon of great significance, crafted from the roots of Yggdrasil, the great tree that holds the universe together. Its surface is decorated with intricate patterns and symbols that represent the different realms and creatures. When wielded in combat, it can provide powerful protection and support to its user.", "genesis", 449),
    new weaponInfo("Wyrmfire Wall", "weapon", "shield", ["chest"], "<:wyrmfire_wall:1069033761481703504>", "https://i.imgur.com/5Z7mChd.png", "shield", 248, 1526, "br", 0.08, 0.24, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.blockBurn = 0.05;
        matchStats.xpboost += 0.25;
    }, "Burns **5%** of max HP from the enemy after every successful block. If enemy HP is more than twice of the wielders HP, it burns the equivalent of **10%** of the wielders HP instead. The wielder gets **+25%** more class xp in the dungeon after a win.", "This massive shield is made of dragon scales, imbued with the fiery power of the great beasts. It is said to be able to deflect even the hottest of flames, making it a formidable weapon against dragon attackers.", "genesis", 450),

    // Chests
    new chestInfo("Common Chest", "loot", "chest", ["dungeon", "shop"], "<:common_chest:1069067835193688144>", "<:common_chest_open:1069067831792111657>", "https://i.imgur.com/BYa9PhS.png", "https://i.imgur.com/90NHVz7.png", 2, { "normal": 20, "special": 60, "rare": 18, "unique": 2 }, "normal", 451),
    new chestInfo("Rare Chest", "loot", "chest", ["dungeon", "shop"], "<:rare_chest:1069286571876040744>", "<:rare_chest_open:1069286556625539072>", "https://i.imgur.com/YbhPtRl.png", "https://i.imgur.com/TCNVf7E.png", 3, { "special": 50.5, "rare": 39, "unique": 10, "legendary": 0.5 }, "special", 452),
    new chestInfo("Sublime Chest", "loot", "chest", ["dungeon", "shop"], "<:sublime_chest:1069287046818050158>", "<:sublime_chest_open:1069287041843593266>", "https://i.imgur.com/i9UfkBy.png", "https://i.imgur.com/xnnwKg4.png", 3, { "special": 24, "rare": 50, "unique": 24, "legendary": 2 }, "rare", 453),
    new chestInfo("Glorious Chest", "loot", "chest", ["dungeon", "shop"], "<:glorious_chest:1069076067081539726>", "<:glorious_chest_open:1069076063629627482>", "https://i.imgur.com/PICJFqc.png", "https://i.imgur.com/y2Dr8Po.png", 4, { "special": 10, "rare": 40, "unique": 45, "legendary": 4.4, "mythical": 0.6 }, "unique", 454),
    new chestInfo("Premium Chest", "loot", "chest", ["yes"], "<:premium_chest:1069300260712742992>", "<:premium_chest_open:1069300264420515911>", "https://i.imgur.com/hEU6nHV.png", "https://i.imgur.com/aI80SZ2.png", 4, { "rare": 36, "unique": 47, "legendary": 15.7, "mythical": 1.3 }, "legendary", 455),
    new chestInfo("Luxurious Chest", "loot", "chest", ["dungeon", "shop"], "<:luxurious_chest:1069300112364404817>", "<:luxurious_chest_open:1069300120228737165>", "https://i.imgur.com/XNjj7nC.png", "https://i.imgur.com/4y2geqd.png", 4, { "rare": 30, "unique": 50, "legendary": 18, "mythical": 2 }, "legendary", 456),
    new chestInfo("Royal Chest", "loot", "chest", ["dungeon", "shop"], "<:royal_chest:1069301128711376976>", "<:royal_chest_open:1069301244054753352>", "https://i.imgur.com/UVXTqN9.png", "https://i.imgur.com/wVEn5rQ.png", 4, { "rare": 18, "unique": 43, "legendary": 33, "mythical": 5.81, "genesis": 0.19 }, "mythical", 457),
    new chestInfo("Deluxe Chest", "loot", "chest", ["shop"], "<:deluxe_chest:1069301259603026061>", "<:deluxe_chest_open:1069301266301337740>", "https://i.imgur.com/ZScKjKT.png", "https://i.imgur.com/02UvlAJ.png", 6, { "unique": 31, "legendary": 52, "mythical": 15.88, "genesis": 1.12 }, "genesis", 458),

    // Normal Armor
    new armorInfo("Scout's Hat", "armor", "helmet", "Scout's Set", ["crafting", "chest"], "<:scouts_hat:1081345912271536199>", "https://i.imgur.com/n6UfbNN.png", "hp", 7, 362, "normal", 459),
    new armorInfo("Scout's Shirt", "armor", "cuirass", "Scout's Set", ["crafting", "chest"], "<:scouts_shirt:1081348501042122923>", "https://i.imgur.com/kQN0l8d.png", "hp", 8, 380, "normal", 460),
    new armorInfo("Scout's Gloves", "armor", "gloves", "Scout's Set", ["crafting", "chest"], "<:scouts_gloves:1081348795197030510>", "https://i.imgur.com/azMvD9j.png", "def", 5, 67, "normal", 461),
    new armorInfo("Scout's Boots", "armor", "boots", "Scout's Set", ["crafting", "chest"], "<:scouts_boots:1081349004987727952>", "https://i.imgur.com/UDWPBnC.png", "mr", 5, 67, "normal", 462, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None"),

    // Special Armor
    new armorInfo("Beginner's Helmet", "armor", "helmet", "Beginner's Set", ["crafting", "chest"], "<:beginners_helmet:1081350299584823366>", "https://i.imgur.com/EDdjxci.png", "mr", 6, 80, "special", 463),
    new armorInfo("Beginner's Vest", "armor", "cuirass", "Beginner's Set", ["crafting", "chest"], "<:beginners_vest:1081350664522825849>", "https://i.imgur.com/iSn29XI.png", "def", 6, 84, "special", 464),
    new armorInfo("Beginner's Gloves", "armor", "gloves", "Beginner's Set", ["crafting", "chest"], "<:beginners_gloves:1081350888897122469>", "https://i.imgur.com/ymgWFdz.png", "hp", 9, 486, "special", 465),
    new armorInfo("Beginner's Boots", "armor", "boots", "Beginner's Set", ["crafting", "chest"], "<:beginners_boots:1081351099249872938>", "https://i.imgur.com/Fb11AJV.png", "hp", 8, 483, "special", 466, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None"),
    new armorInfo("Eagle's Flight Helmet", "armor", "helmet", "Eagle's Flight Set", ["crafting", "chest"], "<:eagles_flight_helmet:1081350292798459916>", "https://i.imgur.com/sIyA2o2.png", "def", 6, 78, "special", 467),
    new armorInfo("Eagle's Flight Vest", "armor", "cuirass", "Eagle's Flight Set", ["crafting", "chest"], "<:eagles_flight_vest:1081350658613071933>", "https://i.imgur.com/2S4iaBu.png", "hp", 8, 485, "special", 468),
    new armorInfo("Eagle's Flight Vambrace", "armor", "gloves", "Eagle's Flight Set", ["crafting", "chest"], "<:eagles_flight_vambrace:1081350891992526909>", "https://i.imgur.com/mGJX7zb.png", "mr", 7, 86, "special", 469),
    new armorInfo("Eagle's Flight Boots", "armor", "boots", "Eagle's Flight Set", ["crafting", "chest"], "<:eagles_flight_boots:1081351093071642735>", "https://i.imgur.com/U3QrNwo.png", "hp", 7, 481, "special", 470, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None"),
    new armorInfo("Wild Hunt Helmet", "armor", "helmet", "Wild Hunt Set", ["crafting", "chest"], "<:wild_hunt_helmet:1081350297361846373>", "https://i.imgur.com/xqnekio.png", "hp", 10, 476, "special", 471),
    new armorInfo("Wild Hunt Chestplate", "armor", "cuirass", "Wild Hunt Set", ["crafting", "chest"], "<:wild_hunt_chestplate:1081350661905600562>", "https://i.imgur.com/Vqy14N6.png", "def", 7, 90, "special", 472),
    new armorInfo("Wild Hunt Vambrace", "armor", "gloves", "Wild Hunt Set", ["crafting", "chest"], "<:wild_hunt_vambrace:1081350887030657174>", "https://i.imgur.com/ekXCgj4.png", "mr", 6, 86, "special", 473),
    new armorInfo("Wild Hunt Boots", "armor", "boots", "Wild Hunt Set", ["crafting", "chest"], "<:wild_hunt_boots:1081351368629043322>", "https://i.imgur.com/ojxEbbb.png", "hp", 8, 472, "special", 474, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { }, "None"),

    // Rare Armor
    new armorInfo("Hat of Broken Honor", "armor", "helmet", "Set of Broken Honor", ["crafting", "chest"], "<:hat_of_broken_honor:1081354671341436989>", "https://i.imgur.com/YDz09Z8.png", "hp", 20, 812, "rare", 475),
    new armorInfo("Chestplate of Broken Honor", "armor", "cuirass", "Set of Broken Honor", ["crafting", "chest"], "<:chestplate_of_broken_honor:1081355320275779726>", "https://i.imgur.com/4viZNFm.png", "hp", 19, 791, "rare", 476),
    new armorInfo("Gloves of Broken Honor", "armor", "gloves", "Set of Broken Honor", ["crafting", "chest"], "<:gloves_of_broken_honor:1081355900893270109>", "https://i.imgur.com/eFThwpI.png", "def", 8, 92, "rare", 477),
    new armorInfo("Boots of Broken Honor", "armor", "boots", "Set of Broken Honor", ["crafting", "chest"], "<:boots_of_broken_honor:1081356768350851163>", "https://i.imgur.com/H1qLpE7.png", "mr", 9, 94, "rare", 478, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.def = Math.floor(eStats.def * 0.85);
        ebuff.def.push(new buffInfo("*", 0.85, 10));
    }, "Reduces enemy DEF by **15%** at the start of battle, lasting 10 rounds."),
    new armorInfo("Aventurine Hat", "armor", "helmet", "Aventurine Set", ["crafting", "chest"], "<:aventurine_hat:1081354673665101905>", "https://i.imgur.com/1iJreUD.png", "hp", 20, 812, "rare", 479),
    new armorInfo("Aventurine Vest", "armor", "cuirass", "Aventurine Set", ["crafting", "chest"], "<:aventurine_vest:1081355323568295936>", "https://i.imgur.com/wt9ZvU4.png", "def", 8, 94, "rare", 480),
    new armorInfo("Aventurine Vambrace", "armor", "gloves", "Aventurine Set", ["crafting", "chest"], "<:aventurine_vambrace:1081355904907235468>", "https://i.imgur.com/i3aENKU.png", "mr", 9, 98, "rare", 481),
    new armorInfo("Aventurine Boots", "armor", "boots", "Aventurine Set", ["crafting", "chest"], "<:aventurine_boots:1081356772134101085>", "https://i.imgur.com/S164nIV.png", "hp", 18, 793, "rare", 482, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.dodge -= 0.1;
        if (eStats.dodge < 0) eStats.dodge = 0;
        ebuff.dodge.push(new buffInfo("+", -0.1, 9999));
    }, "Decreases enemy dodge chance by **10**% at the start of battle."),
    new armorInfo("Banneret's Helmet", "armor", "helmet", "Banneret's Set", ["crafting", "chest"], "<:bannerets_helmet:1081354678220103700>", "https://i.imgur.com/lXgE51X.png", "hp", 18, 794, "rare", 483),
    new armorInfo("Banneret's Chestplate", "armor", "cuirass", "Banneret's Set", ["crafting", "chest"], "<:bannerets_chestplate:1081355326932144209>", "https://i.imgur.com/M9qNLa3.png", "def", 9, 104, "rare", 484),
    new armorInfo("Banneret's Gloves", "armor", "gloves", "Banneret's Set", ["crafting", "chest"], "<:bannerets_gloves:1081355907549638737>", "https://i.imgur.com/7gr65ea.png", "hp", 20, 803, "rare", 485),
    new armorInfo("Banneret's Shoes", "armor", "boots", "Banneret's Set", ["crafting", "chest"], "<:bannerets_shoes:1081357080197341224>", "https://i.imgur.com/4czdNN9.png", "mr", 7, 79, "rare", 486, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def = Math.floor(myStats.def * 1.18);
        mybuff.def.push(new buffInfo("*", 1.18, 6));
    }, "Increases the wearers DEF by **18%** at the start of battle, lasting 6 rounds."),
    new armorInfo("Earthen Bulwark Helmet", "armor", "helmet", "Earthen Bulwark Set", ["crafting", "chest"], "<:earthen_bulwark_helmet:1081354682519277599>", "https://i.imgur.com/8vkTZ28.png", "hp", 21, 859, "rare", 487),
    new armorInfo("Earthen Bulwark Chestplate", "armor", "cuirass", "Earthen Bulwark Set", ["crafting", "chest"], "<:earthen_bulwark_chestplate:1081355330132390050>", "https://i.imgur.com/oIoOaOQ.png", "hp", 22, 862, "rare", 488),
    new armorInfo("Earthen Bulwark Vambrace", "armor", "gloves", "Earthen Bulwark Set", ["crafting", "chest"], "<:earthen_bulwark_vambrace:1081355912280817795>", "https://i.imgur.com/ancl0RR.png", "mr", 7, 78, "rare", 489),
    new armorInfo("Earthen Bulwark Shoes", "armor", "boots", "Earthen Bulwark Set", ["crafting", "chest"], "<:earthen_bulwark_shoes:1081357076758016061>", "https://i.imgur.com/auObzEg.png", "def", 7, 80, "rare", 490, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.shield += 100;
    }, "The wearer starts with **+100** shield."),
    new armorInfo("Gorgonhide Headscarf", "armor", "helmet", "Gorgonhide Set", ["crafting", "chest"], "<:gorgonhide_headscarf:1081354685132316742>", "https://i.imgur.com/qOZ9A6d.png", "def", 7, 88, "rare", 491),
    new armorInfo("Gorgonhide Mantle", "armor", "cuirass", "Gorgonhide Set", ["crafting", "chest"], "<:gorgonhide_mantle:1081355333219405896>", "https://i.imgur.com/UO7LfAq.png", "hp", 19, 794, "rare", 492),
    new armorInfo("Gorgonhide Vambrace", "armor", "gloves", "Gorgonhide Set", ["crafting", "chest"], "<:gorgonhide_vambrace:1081355918400307210>", "https://i.imgur.com/X8yBDhe.png", "hp", 18, 790, "rare", 493),
    new armorInfo("Gorgonhide Boots", "armor", "boots", "Gorgonhide Set", ["crafting", "chest"], "<:gorgonhide_boots:1081356754455117947>", "https://i.imgur.com/H5QZSQe.png", "mr", 9, 102, "rare", 494, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.br -= 0.1;
        if (eStats.br < 0) eStats.br = 0;
        ebuff.br.push(new buffInfo("+", -0.1, 9999));
    }, "Decreases enemy block rate by **10**% at the start of battle."),
    new armorInfo("Ragtag Helmet", "armor", "helmet", "Ragtag Set", ["crafting", "chest"], "<:ragtag_helmet:1081354688659734538>", "https://i.imgur.com/TAZGkRW.png", "mr", 7, 87, "rare", 495),
    new armorInfo("Ragtag Chestplate", "armor", "cuirass", "Ragtag Set", ["crafting", "chest"], "<:ragtag_chestplate:1081355336277037137>", "https://i.imgur.com/75l5LU3.png", "def", 9, 97, "rare", 496),
    new armorInfo("Ragtag Gloves", "armor", "gloves", "Ragtag Set", ["crafting", "chest"], "<:ragtag_gloves:1081355923462815784>", "https://i.imgur.com/sdDblh3.png", "hp", 19, 799, "rare", 497),
    new armorInfo("Ragtag Boots", "armor", "boots", "Ragtag Set", ["crafting", "chest"], "<:ragtag_boots:1081356758246752376>", "https://i.imgur.com/nEaqOmt.png", "hp", 20, 808, "rare", 498, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.br += 0.1;
        if (myStats.br > 1) myStats.br = 1;
        mybuff.br.push(new buffInfo("+", 0.1, 12));
    }, "The wearer has **10%** increased block rate during the first 12 rounds."),
    new armorInfo("Savage Warrior's Helmet", "armor", "helmet", "Savage Warrior's Set", ["crafting", "chest"], "<:savage_warriors_helmet:1081354693411872860>", "https://i.imgur.com/kFmNTDb.png", "hp", 19, 796, "rare", 499),
    new armorInfo("Savage Warrior's Chestplate", "armor", "cuirass", "Savage Warrior's Set", ["crafting", "chest"], "<:savage_warriors_chestplate:1081355339775094824>", "https://i.imgur.com/fJ6gE9V.png", "mr", 8, 96, "rare", 500),
    new armorInfo("Savage Warrior's Vambrace", "armor", "gloves", "Savage Warrior's Set", ["crafting", "chest"], "<:savage_warriors_vambrace:1081356213041770558>", "https://i.imgur.com/rFDyaJA.png", "hp", 20, 812, "rare", 501),
    new armorInfo("Savage Warrior's Boots", "armor", "boots", "Savage Warrior's Set", ["crafting", "chest"], "<:savage_warriors_boots:1081357073108979822>", "https://i.imgur.com/J7PvCin.png", "def", 7, 86, "rare", 502, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const bleed = Math.floor(eStats.hp > 2 * myStats.hp ? myStats.hp * 0.2 : eStats.hp * 0.1);
        eStats.hp -= Math.floor(bleed);
    }, "The enemy starts with **90%** of max HP. If the enemy has more than twice as much HP than the wielder, it starts with **20%** less HP of the wielder instead."),
    new armorInfo("Trailblazer's Hood", "armor", "helmet", "Trailblazer's Set", ["crafting", "chest"], "<:trailblazers_hood:1081354667109396542>", "https://i.imgur.com/Yr9Il3r.png", "hp", 17, 768, "rare", 503),
    new armorInfo("Trailblazer's Vest", "armor", "cuirass", "Trailblazer's Set", ["crafting", "chest"], "<:trailblazers_vest:1081355317813727364>", "https://i.imgur.com/poM1E0b.png", "def", 8, 86, "rare", 504),
    new armorInfo("Trailblazer's Vambrace", "armor", "gloves", "Trailblazer's Set", ["crafting", "chest"], "<:trailblazers_vambrace:1081356209002664006>", "https://i.imgur.com/91AXHeD.png", "hp", 17, 765, "rare", 505),
    new armorInfo("Trailblazer's Shoes", "armor", "boots", "Trailblazer's Set", ["crafting", "chest"], "<:trailblazers_shoes:1081356764169113620>", "https://i.imgur.com/5wjat3u.png", "mr", 8, 86, "rare", 506, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr += 0.1;
        if (myStats.cr > 1) myStats.cr = 1;
        mybuff.cr.push(new buffInfo("+", 0.1, 16));
    }, "The wearer has **10%** increased crit rate during the first 16 rounds."),

    // Unique Armor
    new armorInfo("Helmet of the Order", "armor", "helmet", "Set of the Order", ["crafting", "chest"], "<:helmet_of_the_order:1081365195378667591>", "https://i.imgur.com/huSIhb2.png", "hp", 34, 1204, "unique", 507),
    new armorInfo("Chestplate of the Order", "armor", "cuirass", "Set of the Order", ["crafting", "chest"], "<:chestplate_of_the_order:1081366071929487460>", "https://i.imgur.com/fz9MTDv.png", "def", 12, 122, "unique", 508),
    new armorInfo("Gloves of the Order", "armor", "gloves", "Set of the Order", ["crafting", "chest"], "<:gloves_of_the_order:1081366774181789727>", "https://i.imgur.com/UJyfaqt.png", "hp", 34, 1208, "unique", 509),
    new armorInfo("Boots of the Order", "armor", "boots", "Set of the Order", ["crafting", "chest"], "<:boots_of_the_order:1081367521795526656>", "https://i.imgur.com/0d1fwWc.png", "mr", 12, 120, "unique", 510, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk += Math.floor(myStats.atk * 0.125);
        myStats.md += Math.floor(myStats.md * 0.125);
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.125), 9999));
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.125), 9999));
    }, "The wielder has **12.5%** increased attack and magic damage throughout the battle."),
    new armorInfo("Azure Enchantment Hood", "armor", "helmet", "Azure Enchantment Set", ["crafting", "chest"], "<:azure_enchantment_hood:1081365197622616086>", "https://i.imgur.com/8wBIswz.png", "mr", 10, 107, "unique", 511),
    new armorInfo("Azure Enchantment Robe", "armor", "cuirass", "Azure Enchantment Set", ["crafting", "chest"], "<:azure_enchantment_robe:1081365943357288528>", "https://i.imgur.com/4Olnaum.png", "hp", 36, 1224, "unique", 512),
    new armorInfo("Azure Enchantment Gloves", "armor", "gloves", "Azure Enchantment Set", ["crafting", "chest"], "<:azure_enchantment_gloves:1081366777591758928>", "https://i.imgur.com/b4WN0YV.png", "hp", 35, 1219, "unique", 513),
    new armorInfo("Azure Enchantment Boots", "armor", "boots", "Azure Enchantment Set", ["crafting", "chest"], "<:azure_enchantment_boots:1081367325778919554>", "https://i.imgur.com/cgnYDv6.png", "def", 10, 105, "unique", 514, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mana += 40;
        myStats.sm += 12;
    }, "Increases the wielders mana cap by **+40**. Start the battle with **+12** mana."),
    new armorInfo("Dragonborn Helmet", "armor", "helmet", "Dragonborn Set", ["chest"], "<:dragonborn_helmet:1081365201229725756>", "https://i.imgur.com/jeDSabY.png", "mr", 11, 122, "unique", 515),
    new armorInfo("Dragonborn Cuirass", "armor", "cuirass", "Dragonborn Set", ["chest"], "<:dragonborn_cuirass:1081365946813386872>", "https://i.imgur.com/Ul9bNcx.png", "hp", 34, 1232, "unique", 516),
    new armorInfo("Dragonborn Gloves", "armor", "gloves", "Dragonborn Set", ["chest"], "<:dragonborn_gloves:1081366781320515625>", "https://i.imgur.com/rRlr7EA.png", "def", 12, 125, "unique", 517),
    new armorInfo("Dragonborn Boots", "armor", "boots", "Dragonborn Set", ["chest"], "<:dragonborn_boots:1081367330124218489>", "https://i.imgur.com/WP9sU8O.png", "hp", 30, 1184, "unique", 518, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.hp / myStats.maxhp < 0.33) {
            myStats.atk += Math.floor(myStats.atk * 0.2);
            myStats.md += Math.floor(myStats.md * 0.2);
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
        } else {
            myStats.delayedBuffs.push(new delayedBuffs(0, function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp / myStats.maxhp < 0.33) {
                    myStats.atk += Math.floor(myStats.atk * 0.2);
                    myStats.md += Math.floor(myStats.md * 0.2);
                    mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
                    //@ts-ignore
                    this._used++;
                };
            }, 9999, 1));
        };
    }, "The first time the wielders HP falls below **33%** of max HP, increases attack and magic damage by **20%**."),
    new armorInfo("Golem's Resilient Helmet", "armor", "helmet", "Golem's Resilient Set", ["crafting", "chest"], "<:golems_resilient_helmet:1081365185924694047>", "https://i.imgur.com/BWUv88i.png", "mr", 10, 102, "unique", 519),
    new armorInfo("Golem's Resilient Chestplate", "armor", "cuirass", "Golem's Resilient Set", ["crafting", "chest"], "<:golems_resilient_chestplate:1081365949153808405>", "https://i.imgur.com/sO60d0i.png", "def", 14, 130, "unique", 520),
    new armorInfo("Golem's Resilient Vambrace", "armor", "gloves", "Golem's Resilient Set", ["crafting", "chest"], "<:golems_resilient_vambrace:1081366783459598397>", "https://i.imgur.com/AcdVNv8.png", "hp", 31, 1183, "unique", 521),
    new armorInfo("Golem's Resilient Boots", "armor", "boots", "Golem's Resilient Set", ["crafting", "chest"], "<:golems_resilient_boots:1081367333072806030>", "https://i.imgur.com/zTsxOtz.png", "hp", 30, 1167, "unique", 522, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.16), 16));
        myStats.atk += Math.floor(myStats.atk * 0.16);
    }, "The wielder has **16%** increased attack during the first 16 rounds."),
    new armorInfo("Imperial Vanguard Helmet", "armor", "helmet", "Imperial Vanguard Set", ["crafting", "chest"], "<:imperial_vanguard_helmet:1081365378262896750>", "https://i.imgur.com/JxTT8Rr.png", "def", 13, 128, "unique", 523),
    new armorInfo("Imperial Vanguard Chestplate", "armor", "cuirass", "Imperial Vanguard Set", ["crafting", "chest"], "<:imperial_vanguard_chestplate:1081365951901077574>", "https://i.imgur.com/zWkG4sl.png", "hp", 35, 1243, "unique", 524),
    new armorInfo("Imperial Vanguard Gloves", "armor", "gloves", "Imperial Vanguard Set", ["crafting", "chest"], "<:imperial_vanguard_gloves:1081366786928300113>", "https://i.imgur.com/P1P6iDm.png", "mr", 10, 109, "unique", 525),
    new armorInfo("Imperial Vanguard Boots", "armor", "boots", "Imperial Vanguard Set", ["crafting", "chest"], "<:imperial_vanguard_boots:1081367335438405682>", "https://i.imgur.com/sKNXzot.png", "hp", 34, 1232, "unique", 526, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.br += 0.1;
        if (myStats.br > 1) myStats.br = 1;
        mybuff.br.push(new buffInfo("+", 0.1, 9999));
        myStats.atk += Math.floor(myStats.atk * (myStats.br / 2));
        myStats.md += Math.floor(myStats.md * (myStats.br / 2));
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.atk += Math.floor(myStats.atk * (myStats.br / 2));
            myStats.md += Math.floor(myStats.md * (myStats.br / 2));
        }, 9999));
    }, "Increases the wearers block rate by **10%**. For every **1%** block rate the wearer gains **0.5%** attack and magic damage."),
    new armorInfo("Ravager Helmet", "armor", "helmet", "Ravager Set", ["chest"], "<:ravager_helmet:1081365191876427857>", "https://i.imgur.com/jpFjJtd.png", "mr", 11, 114, "unique", 527),
    new armorInfo("Ravager Chestplate", "armor", "cuirass", "Ravager Set", ["chest"], "<:ravager_chestplate:1081365955172647032>", "https://i.imgur.com/n2uL4mA.png", "def", 14, 128, "unique", 528),
    new armorInfo("Ravager Gauntlet", "armor", "gloves", "Ravager Set", ["chest"], "<:ravager_gauntlet:1081366790443114617>", "https://i.imgur.com/v0LC2Gz.png", "hp", 34, 1213, "unique", 529),
    new armorInfo("Ravager Boots", "armor", "boots", "Ravager Set", ["chest"], "<:ravager_boots:1081367338508632074>", "https://i.imgur.com/CRDoIDN.png", "hp", 35, 1227, "unique", 530, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.def += Math.floor(myStats.def * 0.1);
        mybuff.def.push(new buffInfo("+", Math.floor(myStats.def * 0.1), 9999));
        myStats.br += 0.1;
        if (myStats.br > 1) myStats.br = 1;
        mybuff.def.push(new buffInfo("+", 0.1, 9999));
    }, "Increases the wearers defense and block rate by **10%** for the rest of battle."),
    new armorInfo("Reef's Bane Helmet", "armor", "helmet", "Reef's Bane Set", ["crafting", "chest"], "<:reefs_bane_helmet:1081365447406014614>", "https://i.imgur.com/iCfJ4kg.png", "hp", 37, 1218, "unique", 531),
    new armorInfo("Reef's Bane Cuirass", "armor", "cuirass", "Reef's Bane Set", ["crafting", "chest"], "<:reefs_bane_cuirass:1081366206914764872>", "https://i.imgur.com/MOYQSpO.png", "def", 12, 124, "unique", 532),
    new armorInfo("Reef's Bane Gloves", "armor", "gloves", "Reef's Bane Set", ["crafting", "chest"], "<:reefs_bane_gloves:1081366792368295997>", "https://i.imgur.com/4m8GX1q.png", "mr", 12, 125, "unique", 533),
    new armorInfo("Reef's Bane Shoes", "armor", "boots", "Reef's Bane Set", ["crafting", "chest"], "<:reefs_bane_shoes:1081367340937134140>", "https://i.imgur.com/0LGFN0O.png", "hp", 33, 1196, "unique", 534, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mg += 4;
        mybuff.mg.push(new buffInfo("+", 4, 10));
    }, "Increases mana generation by **+4**💧at the start of battle, lasting 10 rounds."),
    new armorInfo("Sirenscale Hood", "armor", "helmet", "Sirenscale Set", ["crafting", "chest"], "<:sirenscale_hood:1081365450446884904>", "https://i.imgur.com/TcqM2Hf.png", "hp", 35, 1211, "unique", 535),
    new armorInfo("Sirenscale Vest", "armor", "cuirass", "Sirenscale Set", ["crafting", "chest"], "<:sirenscale_vest:1081366210823860276>", "https://i.imgur.com/zNveflv.png", "mr", 12, 125, "unique", 536),
    new armorInfo("Sirenscale Gloves", "armor", "gloves", "Sirenscale Set", ["crafting", "chest"], "<:sirenscale_gloves:1081366796063490139>", "https://i.imgur.com/RCngOYR.png", "def", 11, 114, "unique", 537),
    new armorInfo("Sirenscale Boots", "armor", "boots", "Sirenscale Set", ["crafting", "chest"], "<:sirenscale_boots:1081367344913326160>", "https://i.imgur.com/RtUw1la.png", "hp", 34, 1207, "unique", 538, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.sm -= 10;
        if (eStats.sm < 0) eStats.sm = 0;
        eStats.mg -= 2;
        if (eStats.mg < 0) eStats.mg = 0;
        ebuff.mg.push(new buffInfo("+", -2, 9999));
    }, "The enemy starts with **10** mana less than normal, and gains **2** mana less each round."),
    new armorInfo("Sphinx Hood", "armor", "helmet", "Sphinx Set", ["crafting", "chest"], "<:sphinx_hood:1081365453286428762>", "https://i.imgur.com/qkbRkDQ.png", "hp", 33, 1198, "unique", 539),
    new armorInfo("Sphinx Robe", "armor", "cuirass", "Sphinx Set", ["crafting", "chest"], "<:sphinx_robe:1081366213675987095>", "https://i.imgur.com/YTLKzQl.png", "def", 11, 114, "unique", 540),
    new armorInfo("Sphinx Vambrace", "armor", "gloves", "Sphinx Set", ["crafting", "chest"], "<:sphinx_vambrace:1081366798903021658>", "https://i.imgur.com/ryXjT2I.png", "mr", 12, 123, "unique", 541),
    new armorInfo("Sphinx Boots", "armor", "boots", "Sphinx Set", ["crafting", "chest"], "<:sphinx_boots:1081367348629479546>", "https://i.imgur.com/JHQS7f2.png", "hp", 32, 1191, "unique", 542, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.md += Math.floor(myStats.md * (myStats.dodge / 2));
        }, 9999));
    }, "The wearer gains **+0.5%** magic damage for every % dodge chance."),
    new armorInfo("Vindicator Hood", "armor", "helmet", "Vindicator Set", ["chest"], "<:vindicator_hood:1081365456897712129>", "https://i.imgur.com/VXJtKuo.png", "def", 9, 107, "unique", 543),
    new armorInfo("Vindicator Robe", "armor", "cuirass", "Vindicator Set", ["chest"], "<:vindicator_robe:1081366216389701712>", "https://i.imgur.com/j5pavmp.png", "mr", 13, 124, "unique", 544),
    new armorInfo("Vindicator Gloves", "armor", "gloves", "Vindicator Set", ["chest"], "<:vindicator_gloves:1081366801922932787>", "https://i.imgur.com/0x4jfpD.png", "hp", 36, 1220, "unique", 545),
    new armorInfo("Vindicator Boots", "armor", "boots", "Vindicator Set", ["chest"], "<:vindicator_boots:1081367351062175875>", "https://i.imgur.com/l4i0H4s.png", "hp", 34, 1209, "unique", 546, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 4 === 0) {
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.12), {});
                if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
            };
        }, 9999));
    }, "The wearer heals **12%** of their max HP after every 4 rounds."),
    new armorInfo("Violet Veiled Turban", "armor", "helmet", "Violet Veiled Set", ["crafting", "chest"], "<:violet_veiled_turban:1081365439025774602>", "https://i.imgur.com/ixvDWGa.png", "mr", 11, 113, "unique", 547),
    new armorInfo("Violet Veiled Chestplate", "armor", "cuirass", "Violet Veiled Set", ["crafting", "chest"], "<:violet_veiled_chestplate:1081366198350000209>", "https://i.imgur.com/sPLeos6.png", "def", 12, 122, "unique", 548),
    new armorInfo("Violet Veiled Vambrace", "armor", "gloves", "Violet Veiled Set", ["crafting", "chest"], "<:violet_veiled_vambrace:1081366805471309945>", "https://i.imgur.com/yn3todx.png", "hp", 34, 1207, "unique", 549),
    new armorInfo("Violet Veiled Boots", "armor", "boots", "Violet Veiled Set", ["crafting", "chest"], "<:violet_veiled_boots:1081367354501509161>", "https://i.imgur.com/L5nsbQg.png", "hp", 35, 1216, "unique", 550, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.br += 0.16;
        if (myStats.br > 1) myStats.br = 1;
        mybuff.br.push(new buffInfo("+", 0.16, 10));
    }, "The wearer has **16%** increased block rate during the first 10 rounds."),
    new armorInfo("Wanderer's Hat", "armor", "helmet", "Wanderer's Set", ["crafting", "chest"], "<:wanderers_hat:1081365440930000966>", "https://i.imgur.com/DfZK6fh.png", "mr", 14, 130, "unique", 551),
    new armorInfo("Wanderer's Robe", "armor", "cuirass", "Wanderer's Set", ["crafting", "chest"], "<:wanderers_robe:1081366201386684487>", "https://i.imgur.com/3IPt44w.png", "hp", 30, 1187, "unique", 552),
    new armorInfo("Wanderer's Gloves", "armor", "gloves", "Wanderer's Set", ["crafting", "chest"], "<:wanderers_gloves:1081366766724321361>", "https://i.imgur.com/TQSs9WV.png", "def", 10, 106, "unique", 553),
    new armorInfo("Wanderer's Boots", "armor", "boots", "Wanderer's Set", ["crafting", "chest"], "<:wanderers_boots:1081367315951657030>", "https://i.imgur.com/T4MrRIp.png", "hp", 31, 1191, "unique", 554, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.16), 16));
        myStats.md += Math.floor(myStats.md * 0.16);
    }, "The wielder has **16%** increased magic damage during the first 16 rounds."),
    new armorInfo("Well of Souls' Hat", "armor", "helmet", "Well of Souls' Set", ["chest"], "<:well_of_souls_hat:1081365444256084118>", "https://i.imgur.com/FbWoK79.png", "def", 12, 119, "unique", 555),
    new armorInfo("Well of Souls' Robe", "armor", "cuirass", "Well of Souls' Set", ["chest"], "<:well_of_souls_robe:1081366203479638106>", "https://i.imgur.com/km4dGzw.png", "hp", 34, 1216, "unique", 556),
    new armorInfo("Well of Souls' Vambrace", "armor", "gloves", "Well of Souls' Set", ["chest"], "<:well_of_souls_vambrace:1081366770910249040>", "https://i.imgur.com/8m4DLLl.png", "hp", 32, 1198, "unique", 557),
    new armorInfo("Well of Souls' Shoes", "armor", "boots", "Well of Souls' Set", ["chest"], "<:well_of_souls_shoes:1081367319424553031>", "https://i.imgur.com/KPldDyn.png", "mr", 14, 134, "unique", 558, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.br -= 0.15;
        if (eStats.br < 0) eStats.br = 0;
        ebuff.br.push(new buffInfo("+", -0.15, 9999));
    }, "Decreases enemy block rate by **15%** for the rest of battle."),

    // Legendary Armor
    new armorInfo("Abyssal Leviathan Helmet", "armor", "helmet", "Abyssal Leviathan Set", ["crafting", "chest"], "<:abyssal_leviathan_helmet:1081545906870034503>", "https://i.imgur.com/2vKdLVG.png", "hp", 52, 1654, "legendary", 559),
    new armorInfo("Abyssal Leviathan Chestplate", "armor", "cuirass", "Abyssal Leviathan Set", ["crafting", "chest"], "<:abyssal_leviathan_chestplate:1081546627547922442>", "https://i.imgur.com/cKUGAjN.png", "mr", 22, 136, "legendary", 560),
    new armorInfo("Abyssal Leviathan Vambrace", "armor", "gloves", "Abyssal Leviathan Set", ["crafting", "chest"], "<:abyssal_leviathan_vambrace:1081547379418873887>", "https://i.imgur.com/zWoWrT7.png", "def", 21, 134, "legendary", 561),
    new armorInfo("Abyssal Leviathan Boots", "armor", "boots", "Abyssal Leviathan Set", ["crafting", "chest"], "<:abyssal_leviathan_boots:1081548146338967653>", "https://i.imgur.com/KZtLKRU.png", "hp", 53, 1661, "legendary", 562, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.mr.push(new buffInfo("+", 212, 9999));
        myStats.mr += 212;
        myStats.sm += 15;
        if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
    }, "The wearer takes **20%** reduced magic damage and starts with **+15** mana.\n\n_20% magic damage reduction = 212 MR_"),
    new armorInfo("Hood of Divine Aspect", "armor", "helmet", "Set of Divine Aspect", ["crafting", "chest"], "<:hood_of_divine_aspect:1081545910477135932>", "https://i.imgur.com/MKHmr9j.png", "mr", 12, 135, "legendary", 563),
    new armorInfo("Robe of Divine Aspect", "armor", "cuirass", "Set of Divine Aspect", ["crafting", "chest"], "<:robe_of_divine_aspect:1081546631029211267>", "https://i.imgur.com/LGFZrAs.png", "hp", 51, 1654, "legendary", 564),
    new armorInfo("Gloves of Divine Aspect", "armor", "gloves", "Set of Divine Aspect", ["crafting", "chest"], "<:gloves_of_divine_aspect:1081547383659307078>", "https://i.imgur.com/dNndcaj.png", "hp", 52, 1660, "legendary", 565),
    new armorInfo("Boots of Divine Aspect", "armor", "boots", "Set of Divine Aspect", ["crafting", "chest"], "<:boots_of_divine_aspect:1081548150264844350>", "https://i.imgur.com/nHGVOHF.png", "def", 11, 126, "legendary", 566, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const drain = Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.025);
        ebuff.hp.push(new buffInfo("+", -drain, 9999));
        mybuff.hp.push(new buffInfo("+", drain, 9999));
    }, "Drains **2.5%** HP from the enemy and adds it to the wearer every round. If enemy HP is more than twice of the wearers HP, it drains the equivalent of **5%** of the wearers HP instead."),
    new armorInfo("Aureate Helmet", "armor", "helmet", "Aureate Set", ["crafting", "chest"], "<:aureate_helmet:1081545913153110096>", "https://i.imgur.com/Aq0v6MY.png", "hp", 52, 1658, "legendary", 567),
    new armorInfo("Aureate Chestplate", "armor", "cuirass", "Aureate Set", ["crafting", "chest"], "<:aureate_chestplate:1081546633508044850>", "https://i.imgur.com/ZAPtWBY.png", "mr", 13, 136, "legendary", 568),
    new armorInfo("Aureate Gauntlet", "armor", "gloves", "Aureate Set", ["crafting", "chest"], "<:aureate_gauntlet:1081547386855374978>", "https://i.imgur.com/okofNCF.png", "hp", 53, 1664, "legendary", 569),
    new armorInfo("Aureate Boots", "armor", "boots", "Aureate Set", ["crafting", "chest"], "<:aureate_boots:1081548152982745249>", "https://i.imgur.com/JAHmghT.png", "def", 13, 137, "legendary", 570, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.lootm += 0.25;
    }, "Increases coins earned from the dungeon by **25%**."),
    new armorInfo("Blazehide Helmet", "armor", "helmet", "Blazehide Set", ["chest"], "<:blazehide_helmet:1081545916844101637>", "https://i.imgur.com/TGCadO3.png", "hp", 53, 1657, "legendary", 571),
    new armorInfo("Blazehide Robe", "armor", "cuirass", "Blazehide Set", ["chest"], "<:blazehide_robe:1081546637060604034>", "https://i.imgur.com/PVOFLz3.png", "hp", 55, 1672, "legendary", 572),
    new armorInfo("Blazehide Gloves", "armor", "gloves", "Blazehide Set", ["chest"], "<:blazehide_gloves:1081547391519428648>", "https://i.imgur.com/bFhNLbq.png", "mr", 13, 136, "legendary", 573),
    new armorInfo("Blazehide Boots", "armor", "boots", "Blazehide Set", ["chest"], "<:blazehide_boots:1081548157848141845>", "https://i.imgur.com/vGUny60.png", "def", 13, 132, "legendary", 574, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr * 0.1), 9999));
        myStats.mr += Math.floor(myStats.mr * 0.1);
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.hp = mybuff.hp.filter((buff: IbuffInfo) => (buff.type === "*" && buff.val > 1) || (buff.type === "+" && buff.val > 0));
        }, 9999));
    }, "The wearer has **10%** increased magic resistance and is immune against DoT type of damage.\n\n_DoT = Damage over Time_"),
    new armorInfo("Bloodforged Helmet", "armor", "helmet", "Bloodforged Set", ["crafting", "chest"], "<:bloodforged_helmet:1081545922317664396>", "https://i.imgur.com/lw8o5Le.png", "hp", 48, 1647, "legendary", 575),
    new armorInfo("Bloodforged Chestplate", "armor", "cuirass", "Bloodforged Set", ["crafting", "chest"], "<:bloodforged_chestplate:1081546639577194567>", "https://i.imgur.com/HdxnK2f.png", "def", 12, 136, "legendary", 576),
    new armorInfo("Bloodforged Vambrace", "armor", "gloves", "Bloodforged Set", ["crafting", "chest"], "<:bloodforged_vambrace:1081547396607127633>", "https://i.imgur.com/jxlNeWS.png", "hp", 47, 1644, "legendary", 577),
    new armorInfo("Bloodforged Boots", "armor", "boots", "Bloodforged Set", ["crafting", "chest"], "<:bloodforged_boots:1081548161375535264>", "https://i.imgur.com/nazYztj.png", "mr", 12, 133, "legendary", 578, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 2) {
                myStats.def += 274;
                myStats.mr += 274;
            };
        }, 9999));
    }, "Every other round, the wearer takes **25%** less damage.\n\n_25% damage reduction = 274 DEF|MR_"),
    new armorInfo("Cobalt Conjurer's Helmet", "armor", "helmet", "Cobalt Conjurer's Set", ["chest"], "<:cobalt_conjurers_helmet:1081545927124324352>", "https://i.imgur.com/PildNzX.png", "hp", 54, 1662, "legendary", 579),
    new armorInfo("Cobalt Conjurer's Robe", "armor", "cuirass", "Cobalt Conjurer's Set", ["chest"], "<:cobalt_conjurers_robe:1081546642978766858>", "https://i.imgur.com/Alf0yx7.png", "mr", 15, 148, "legendary", 580),
    new armorInfo("Cobalt Conjurer's Vambrace", "armor", "gloves", "Cobalt Conjurer's Set", ["chest"], "<:cobalt_conjurers_vambrace:1081547400604287026>", "https://i.imgur.com/gDuRt3e.png", "def", 9, 101, "legendary", 581),
    new armorInfo("Cobalt Conjurer's Boots", "armor", "boots", "Cobalt Conjurer's Set", ["chest"], "<:cobalt_conjurers_boots:1081548163950854144>", "https://i.imgur.com/mmQNEiI.png", "hp", 53, 1656, "legendary", 582, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.md += Math.floor(myStats.mr * 0.25);
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.md += Math.floor(myStats.mr * 0.25);
        }, 9999));
    }, "Increases the wearers magic damage by **25%** of their magic resistance."),
    new armorInfo("Ebonsteel Helmet", "armor", "helmet", "Ebonsteel Set", ["chest"], "<:ebonsteel_helmet:1081545931473829908>", "https://i.imgur.com/CVkYlou.png", "mr", 19, 134, "legendary", 583),
    new armorInfo("Ebonsteel Chestplate", "armor", "cuirass", "Ebonsteel Set", ["chest"], "<:ebonsteel_chestplate:1081546647848374393>", "https://i.imgur.com/z4lTgmZ.png", "hp", 52, 1654, "legendary", 584),
    new armorInfo("Ebonsteel Gloves", "armor", "gloves", "Ebonsteel Set", ["chest"], "<:ebonsteel_gloves:1081547562386985050>", "https://i.imgur.com/YAKvGrs.png", "def", 22, 140, "legendary", 585),
    new armorInfo("Ebonsteel Boots", "armor", "boots", "Ebonsteel Set", ["chest"], "<:ebonsteel_boots:1081548168459718686>", "https://i.imgur.com/dAJeVF4.png", "hp", 51, 1647, "legendary", 586, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.blockBuffDef += 100;
    }, "Every successful block decreases damage taken by **10%** for 6 rounds.\n\n_A reduction of 10% = 100 DEF|MR_"),
    new armorInfo("Guardian of the Grove Hood", "armor", "helmet", "Guardian of the Grove Set", ["crafting", "chest"], "<:guardian_of_the_grove_hood:1081545935210942485>", "https://i.imgur.com/xOAGSlQ.png", "hp", 45, 1626, "legendary", 587),
    new armorInfo("Guardian of the Grove Chestplate", "armor", "cuirass", "Guardian of the Grove Set", ["crafting", "chest"], "<:guardian_of_the_grove_chestplate:1081546654496333844>", "https://i.imgur.com/eeTuplg.png", "hp", 46, 1637, "legendary", 588),
    new armorInfo("Guardian of the Grove Vambrace", "armor", "gloves", "Guardian of the Grove Set", ["crafting", "chest"], "<:guardian_of_the_grove_vambrace:1081547406090444961>", "https://i.imgur.com/RmlSW86.png", "def", 10, 118, "legendary", 589),
    new armorInfo("Guardian of the Grove Boots", "armor", "boots", "Guardian of the Grove Set", ["crafting", "chest"], "<:guardian_of_the_grove_boots:1081548173954256926>", "https://i.imgur.com/cdiyUOb.png", "mr", 11, 125, "legendary", 590, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodge += 0.1;
        if (myStats.dodge > 1) myStats.dodge = 1;
        mybuff.dodge.push(new buffInfo("+", 0.1, 9999));
        myStats.atk += Math.floor(myStats.atk * (myStats.dodge / 2));
        myStats.md += Math.floor(myStats.md * (myStats.dodge / 2));
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.atk += Math.floor(myStats.atk * (myStats.dodge / 2));
            myStats.md += Math.floor(myStats.md * (myStats.dodge / 2));
        }, 9999));
    }, "Increases the wearers dodge chance by **10%**. For every **1%** dodge chance the wearer gains **0.5%** attack and magic damage."),
    new armorInfo("Lavender Lorekeeper's Hood", "armor", "helmet", "Lavender Lorekeeper's Set", ["crafting", "chest"], "<:lavender_lorekeepers_hood:1081545938188906566>", "https://i.imgur.com/JLWZB45.png", "hp", 50, 1640, "legendary", 591),
    new armorInfo("Lavender Lorekeeper's Robe", "armor", "cuirass", "Lavender Lorekeeper's Set", ["crafting", "chest"], "<:lavender_lorekeepers_robe:1081546658589966356>", "https://i.imgur.com/M8D6jsI.png", "mr", 23, 142, "legendary", 592),
    new armorInfo("Lavender Lorekeeper's Vambrace", "armor", "gloves", "Lavender Lorekeeper's Set", ["crafting", "chest"], "<:lavender_lorekeepers_vambrace:1081547410502844486>", "https://i.imgur.com/5SGWEU6.png", "def", 20, 127, "legendary", 593),
    new armorInfo("Lavender Lorekeeper's Boots", "armor", "boots", "Lavender Lorekeeper's Set", ["crafting", "chest"], "<:lavender_lorekeepers_boots:1081548178362466386>", "https://i.imgur.com/0BOFNCH.png", "hp", 51, 1649, "legendary", 594, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.2), 9999));
        eStats.mr -= Math.floor(eStats.mr * 0.2);
    }, "Decreases magic resistance of enemy by **20%** for the rest of battle."),
    new armorInfo("Merman Helmet", "armor", "helmet", "Merman Set", ["chest"], "<:merman_helmet:1081545942420951102>", "https://i.imgur.com/BXqSlb9.png", "mr", 12, 131, "legendary", 595),
    new armorInfo("Merman Cuirass", "armor", "cuirass", "Merman Set", ["chest"], "<:merman_cuirass:1081546660938788944>", "https://i.imgur.com/qRmKiGr.png", "hp", 48, 1643, "legendary", 596),
    new armorInfo("Merman Vambrace", "armor", "gloves", "Merman Set", ["chest"], "<:merman_vambrace:1081547415108190348>", "https://i.imgur.com/vO4FyNn.png", "def", 13, 142, "legendary", 597),
    new armorInfo("Merman Boots", "armor", "boots", "Merman Set", ["chest"], "<:merman_boots:1081548584891207711>", "https://i.imgur.com/MxNHsRz.png", "hp", 46, 1627, "legendary", 598, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 6 === 0) {
                myStats.shield += 400;
            };
        }, 9999));
    }, "The wearer gets **400** shield every 6th round."),
    new armorInfo("Ouroboros' Scaled Helmet", "armor", "helmet", "Ouroboros' Scaled Set", ["chest"], "<:ouroboros_scaled_helmet:1081545891216887908>", "https://i.imgur.com/WpGCGSQ.png", "hp", 52, 1659, "legendary", 599),
    new armorInfo("Ouroboros' Scaled Chestplate", "armor", "cuirass", "Ouroboros' Scaled Set", ["chest"], "<:ouroboros_scaled_chestplate:1081546805415792733>", "https://i.imgur.com/JTccU2k.png", "mr", 10, 103, "legendary", 600),
    new armorInfo("Ouroboros' Scaled Gloves", "armor", "gloves", "Ouroboros' Scaled Set", ["chest"], "<:ouroboros_scaled_gloves:1081547364130627584>", "https://i.imgur.com/ayoOR20.png", "hp", 51, 1654, "legendary", 601),
    new armorInfo("Ouroboros' Scaled Boots", "armor", "boots", "Ouroboros' Scaled Set", ["chest"], "<:ouroboros_scaled_boots:1081548528385527911>", "https://i.imgur.com/dpTqgfe.png", "def", 14, 147, "legendary", 602, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk += Math.floor(myStats.def * 0.25);
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.atk += Math.floor(myStats.def * 0.25);
        }, 9999));
    }, "Increases the wearers attack by **25%** of their defense."),
    new armorInfo("Scarlet Siege Helmet", "armor", "helmet", "Scarlet Siege Set", ["crafting", "chest"], "<:scarlet_siege_helmet:1081545895016943766>", "https://i.imgur.com/b6kqSDI.png", "hp", 54, 1663, "legendary", 603),
    new armorInfo("Scarlet Siege Chestplate", "armor", "cuirass", "Scarlet Siege Set", ["crafting", "chest"], "<:scarlet_siege_chestplate:1081546618827984917>", "https://i.imgur.com/E6IsrOG.png", "def", 12, 132, "legendary", 604),
    new armorInfo("Scarlet Siege Vambrace", "armor", "gloves", "Scarlet Siege Set", ["crafting", "chest"], "<:scarlet_siege_vambrace:1081547367414763562>", "https://i.imgur.com/JHRsgZ7.png", "mr", 12, 132, "legendary", 605),
    new armorInfo("Scarlet Siege Boots", "armor", "boots", "Scarlet Siege Set", ["crafting", "chest"], "<:scarlet_siege_boots:1081548139296735242>", "https://i.imgur.com/rBzo6Gs.png", "hp", 55, 1672, "legendary", 606, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk += Math.floor(myStats.atk * (0.1 + (0.2 * (1 - (myStats.hp / myStats.maxhp)))));
        myStats.md += Math.floor(myStats.md * (0.1 + (0.2 * (1 - (myStats.hp / myStats.maxhp)))));
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.atk += Math.floor(myStats.atk * (0.1 + (0.2 * (1 - (myStats.hp / myStats.maxhp)))));
            myStats.md += Math.floor(myStats.md * (0.1 + (0.2 * (1 - (myStats.hp / myStats.maxhp)))));
        }, 9999));
        matchStats.xpboost += 0.75;
    }, "Increases the wearers attack and magic damage by **10**-**30%** depending on their HP. Gets **+75%** more class xp in the dungeon after a win."),
    new armorInfo("Shadow Strider Hood", "armor", "helmet", "Shadow Strider Set", ["crafting", "chest"], "<:shadow_strider_hood:1081545897307033761>", "https://i.imgur.com/e5TgwBx.png", "mr", 12, 127, "legendary", 607),
    new armorInfo("Shadow Strider Vest", "armor", "cuirass", "Shadow Strider Set", ["crafting", "chest"], "<:shadow_strider_vest:1081546622187618304>", "https://i.imgur.com/gyIqP19.png", "def", 12, 128, "legendary", 608),
    new armorInfo("Shadow Strider Gloves", "armor", "gloves", "Shadow Strider Set", ["crafting", "chest"], "<:shadow_strider_gloves:1081547372187897947>", "https://i.imgur.com/LWB4CtA.png", "hp", 46, 1639, "legendary", 609),
    new armorInfo("Shadow Strider Boots", "armor", "boots", "Shadow Strider Set", ["crafting", "chest"], "<:shadow_strider_boots:1081548580143235133>", "https://i.imgur.com/sOZ3LtJ.png", "hp", 47, 1643, "legendary", 610, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cd += 0.3;
        mybuff.cd.push(new buffInfo("+", 0.3, 9999));
    }, "The wearer has **30%** increased crit damage for the rest of battle."),
    new armorInfo("Wildlands Survival Hood", "armor", "helmet", "Wildlands Survival Set", ["crafting", "chest"], "<:wildlands_survival_hood:1081545901979476028>", "https://i.imgur.com/kJPjDhP.png", "def", 12, 122, "legendary", 611),
    new armorInfo("Wildlands Survival Vest", "armor", "cuirass", "Wildlands Survival Set", ["crafting", "chest"], "<:wildlands_survival_vest:1081546624116981780>", "https://i.imgur.com/S4fEaog.png", "hp", 47, 1636, "legendary", 612),
    new armorInfo("Wildlands Survival Gloves", "armor", "gloves", "Wildlands Survival Set", ["crafting", "chest"], "<:wildlands_survival_gloves:1081547377434972270>", "https://i.imgur.com/UjplRd9.png", "mr", 12, 127, "legendary", 613),
    new armorInfo("Wildlands Survival Boots", "armor", "boots", "Wildlands Survival Set", ["crafting", "chest"], "<:wildlands_survival_boots:1081548144791277568>", "https://i.imgur.com/BzsvUIL.png", "hp", 46, 1630, "legendary", 614, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr += 0.16;
        if (myStats.cr > 1) myStats.cr = 1;
        mybuff.cr.push(new buffInfo("+", 0.16, 9999));
        mybuff.def.push(new buffInfo("+", Math.floor(myStats.def * 0.16), 9999));
        mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr * 0.16), 9999));
        myStats.def += Math.floor(myStats.def * 0.16);
        myStats.mr += Math.floor(myStats.mr * 0.16);
    }, "The wielder has **16%** increased crit rate, defense and magic resistance for the rest of battle."),

    // Mythical Armor
    new armorInfo("Deepsea Guardian Helmet", "armor", "helmet", "Deepsea Guardian Set", ["chest"], "<:deepsea_guardian_helmet:1081561801042444328>", "https://i.imgur.com/sSFo0Cf.png", "mr", 16, 167, "mythical", 615),
    new armorInfo("Deepsea Guardian Chestplate", "armor", "cuirass", "Deepsea Guardian Set", ["chest"], "<:deepsea_guardian_chestplate:1081562689039499395>", "https://i.imgur.com/RLX7PI4.png", "hp", 108, 2205, "mythical", 616),
    new armorInfo("Deepsea Guardian Gloves", "armor", "gloves", "Deepsea Guardian Set", ["chest"], "<:deepsea_guardian_gloves:1081563506459025478>", "https://i.imgur.com/NzItjL8.png", "hp", 102, 2209, "mythical", 617),
    new armorInfo("Deepsea Guardian Boots", "armor", "boots", "Deepsea Guardian Set", ["chest"], "<:deepsea_guardian_boots:1081564262935306371>", "https://i.imgur.com/itmqnvp.png", "def", 15, 162, "mythical", 618, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.replaceButton.def = {
            "emoji": "<:deepsea_guardian_helmet:1081561801042444328>",
            "used": 0,
            "run": function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (this.used !== undefined && this.used++ < 6) {
                    myStats.shield += 250;
                    myStats.usedBlockRound = matchStats.round;
                    notice.push(`\n<:shield:1062050038211166310> **${myStats.name}** has gained **+250** shield!`);
                } else {
                    myStats.usedBlockRound = matchStats.round;
                    notice.push(`\n<:shield:1062050038211166310> this action can be used 6 times at most!`);
                };
            },
        };
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.shield > 0 && Math.random() < 0.2) myStats.counter = Math.max(1, myStats.counter ?? 0);
        }, 9999));
    }, "Replaces the DEF button to add **+250** shield instead, which can be used 6 times. Has a **20%** chance of countering an attack while the wearer has shield. The wearer still has a chance of blocking the next attack."),
    new armorInfo("Glorious Nightfall Helmet", "armor", "helmet", "Glorious Nightfall Set", ["chest"], "<:glorious_nightfall_helmet:1081561776145059911>", "https://i.imgur.com/yTewArW.png", "def", 14, 153, "mythical", 619),
    new armorInfo("Glorious Nightfall Chestplate", "armor", "cuirass", "Glorious Nightfall Set", ["chest"], "<:glorious_nightfall_chestplate:1081562693825204355>", "https://i.imgur.com/vOSE9Fb.png", "hp", 91, 1868, "mythical", 620),
    new armorInfo("Glorious Nightfall Gloves", "armor", "gloves", "Glorious Nightfall Set", ["chest"], "<:glorious_nightfall_gloves:1081563399261003856>", "https://i.imgur.com/sCAma65.png", "mr", 10, 122, "mythical", 621),
    new armorInfo("Glorious Nightfall Boots", "armor", "boots", "Glorious Nightfall Set", ["chest"], "<:glorious_nightfall_boots:1081564023146958878>", "https://i.imgur.com/s5HvkLG.png", "hp", 94, 1902, "mythical", 622, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.3), 9999));
        myStats.atk += Math.floor(myStats.atk * 0.3);
    }, "Increases the wearers attack by **30%** for the rest of battle."),
    new armorInfo("Hellfire Blaze Hat", "armor", "helmet", "Hellfire Blaze Set", ["chest"], "<:hellfire_blaze_hat:1081561780163199017>", "https://i.imgur.com/yuaQ5uF.png", "hp", 70, 1608, "mythical", 623),
    new armorInfo("Hellfire Blaze Robe", "armor", "cuirass", "Hellfire Blaze Set", ["chest"], "<:hellfire_blaze_robe:1081562835127119872>", "https://i.imgur.com/zZWFJnm.png", "hp", 73, 1637, "mythical", 624),
    new armorInfo("Hellfire Blaze Vambrace", "armor", "gloves", "Hellfire Blaze Set", ["chest"], "<:hellfire_blaze_vambrace:1081563404080259112>", "https://i.imgur.com/qfooxRw.png", "mr", 13, 146, "mythical", 625),
    new armorInfo("Hellfire Blaze Boots", "armor", "boots", "Hellfire Blaze Set", ["chest"], "<:hellfire_blaze_boots:1081564267679064154>", "https://i.imgur.com/5ICJRN4.png", "def", 10, 124, "mythical", 626, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.3), 9999));
        myStats.md += Math.floor(myStats.md * 0.3);
    }, "Increases the wearers magic damage by **30%** for the rest of battle."),
    new armorInfo("Phantom Warrior Helmet", "armor", "helmet", "Phantom Warrior Set", ["chest"], "<:phantom_warrior_helmet:1081561783527034990>", "https://i.imgur.com/YezDNrU.png", "hp", 103, 2046, "mythical", 627),
    new armorInfo("Phantom Warrior Chestplate", "armor", "cuirass", "Phantom Warrior Set", ["chest"], "<:phantom_warrior_chestplate:1081562699172941868>", "https://i.imgur.com/lJXQLOO.png", "def", 17, 181, "mythical", 628),
    new armorInfo("Phantom Warrior Gloves", "armor", "gloves", "Phantom Warrior Set", ["chest"], "<:phantom_warrior_gloves:1081563408748511292>", "https://i.imgur.com/cumtjpE.png", "hp", 107, 2077, "mythical", 629),
    new armorInfo("Phantom Warrior Boots", "armor", "boots", "Phantom Warrior Set", ["chest"], "<:phantom_warrior_boots:1081564030033985616>", "https://i.imgur.com/zQwEY6L.png", "mr", 11, 129, "mythical", 630, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mr += 340;
        mybuff.mr.push(new buffInfo("+", 340, 9999));
        myStats.shield += 700;
    }, "The wearer takes **30%** less magic damage. Starts with **+700** shield.\n\n_30% magic damage reduction = 340 MR_"),
    new armorInfo("Phantom's Plight Hat", "armor", "helmet", "Phantom's Plight Set", ["chest"], "<:phantoms_plight_hat:1081561787264139376>", "https://i.imgur.com/GPhYEpA.png", "hp", 98, 2025, "mythical", 631),
    new armorInfo("Phantom's Plight Vest", "armor", "cuirass", "Phantom's Plight Set", ["chest"], "<:phantoms_plight_vest:1081562703358857278>", "https://i.imgur.com/negC59m.png", "def", 10, 112, "mythical", 632),
    new armorInfo("Phantom's Plight Gloves", "armor", "gloves", "Phantom's Plight Set", ["chest"], "<:phantoms_plight_gloves:1081563413689417838>", "https://i.imgur.com/uTay7XW.png", "mr", 13, 157, "mythical", 633),
    new armorInfo("Phantom's Plight Boots", "armor", "boots", "Phantom's Plight Set", ["chest"], "<:phantoms_plight_boots:1081564034618359949>", "https://i.imgur.com/fHY4jL2.png", "hp", 97, 2021, "mythical", 634, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mr += 660;
        mybuff.mr.push(new buffInfo("+", 660, 9999));
    }, "The wearer takes **50%** reduced magic damage.\n\n_A reduction of 50% = 660 MR_"),
    new armorInfo("Radiant Gryphon's Helmet", "armor", "helmet", "Radiant Gryphon's Set", ["chest"], "<:radiant_gryphons_helmet:1081561789604569198>", "https://i.imgur.com/T19TBy4.png", "hp", 106, 2121, "mythical", 635),
    new armorInfo("Radiant Gryphon's Chestplate", "armor", "cuirass", "Radiant Gryphon's Set", ["chest"], "<:radiant_gryphons_chestplate:1081562679958847578>", "https://i.imgur.com/jOLtUbT.png", "mr", 16, 172, "mythical", 636),
    new armorInfo("Radiant Gryphon's Vambrace", "armor", "gloves", "Radiant Gryphon's Set", ["chest"], "<:radiant_gryphons_vambrace:1081563385772114020>", "https://i.imgur.com/525dQEs.png", "hp", 102, 2106, "mythical", 637),
    new armorInfo("Radiant Gryphon's Boots", "armor", "boots", "Radiant Gryphon's Set", ["chest"], "<:radiant_gryphons_boots:1081564006906609754>", "https://i.imgur.com/Aa1lvLV.png", "def", 12, 125, "mythical", 638, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mr += 340;
        mybuff.mr.push(new buffInfo("+", 340, 9999));
        matchStats.lootm += 0.4;
    }, "The wearer takes **30%** less magic damage. Increases coins earned from the dungeon by **40%**.\n\n_30% magic damage reduction = 340 MR_"),
    new armorInfo("Shadow Weaver Hat", "armor", "helmet", "Shadow Weaver Set", ["chest"], "<:shadow_weaver_hat:1081561956114235445>", "https://i.imgur.com/NRbZojM.png", "mr", 17, 149, "mythical", 639),
    new armorInfo("Shadow Weaver Robe", "armor", "cuirass", "Shadow Weaver Set", ["chest"], "<:shadow_weaver_robe:1081562683205238874>", "https://i.imgur.com/hn7TIUz.png", "hp", 111, 2222, "mythical", 640),
    new armorInfo("Shadow Weaver Vambrace", "armor", "gloves", "Shadow Weaver Set", ["chest"], "<:shadow_weaver_vambrace:1081563389597319228>", "https://i.imgur.com/gh0uFoc.png", "hp", 114, 2252, "mythical", 641),
    new armorInfo("Shadow Weaver Boots", "armor", "boots", "Shadow Weaver Set", ["chest"], "<:shadow_weaver_boots:1081564011914600489>", "https://i.imgur.com/MAiIMob.png", "def", 15, 130, "mythical", 642, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.2), 9999));
        myStats.atk += Math.floor(myStats.atk * 0.2);
        myStats.md += Math.floor(myStats.md * 0.2);
        myStats.replaceButton.def = {
            "emoji": "<:shadow_weaver_hat:1081561956114235445>",
            "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:ATK:1063214925528440832> **${char.name}**`, { magicDamage: myStats.mdChance < 0.5, mdChance: -1 });
            },
        };
    }, "Increases the wearers attack and magic damage by **20%**. Replaces the DEF button to deal magic damage instead of physical damage (or vice verse, depending on the wearers default damage type). The wearer can't block attacks."),
    new armorInfo("Tidal Helmet", "armor", "helmet", "Tidal Set", ["chest"], "<:tidal_helmet:1081561797586329650>", "https://i.imgur.com/EUaLnYU.png", "hp", 118, 2127, "mythical", 643),
    new armorInfo("Tidal Chestplate", "armor", "cuirass", "Tidal Set", ["chest"], "<:tidal_chestplate:1081562685705031681>", "https://i.imgur.com/CNQsex2.png", "hp", 118, 2128, "mythical", 644),
    new armorInfo("Tidal Vambrace", "armor", "gloves", "Tidal Set", ["chest"], "<:tidal_vambrace:1081563392659165295>", "https://i.imgur.com/5ZWq3Ie.png", "mr", 13, 132, "mythical", 645),
    new armorInfo("Tidal Boots", "armor", "boots", "Tidal Set", ["chest"], "<:tidal_boots:1081564016717082674>", "https://i.imgur.com/gkUafv5.png", "def", 14, 140, "mythical", 646, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mg += 10;
        mybuff.mg.push(new buffInfo("+", 10, 9999));
    }, "The wearer gains **+10** mana each round."),

    // Genesis Armor
    new armorInfo("Blizzard Spine Helmet", "armor", "helmet", "Blizzard Spine Set", ["chest"], "<:blizzard_spine_helmet:1081564895193083925>", "https://i.imgur.com/41S5l3j.png", "mr", 52, 204, "genesis", 647),
    new armorInfo("Blizzard Spine Chestplate", "armor", "cuirass", "Blizzard Spine Set", ["chest"], "<:blizzard_spine_chestplate:1081565487856636024>", "https://i.imgur.com/dyPwHWK.png", "hp", 215, 2222, "genesis", 648),
    new armorInfo("Blizzard Spine Vambrace", "armor", "gloves", "Blizzard Spine Set", ["chest"], "<:blizzard_spine_vambrace:1081565738336260106>", "https://i.imgur.com/qlwt4jK.png", "hp", 211, 2213, "genesis", 649),
    new armorInfo("Blizzard Spine Boots", "armor", "boots", "Blizzard Spine Set", ["chest"], "<:blizzard_spine_boots:1081566129924882472>", "https://i.imgur.com/6cuqzZg.png", "def", 55, 216, "genesis", 650, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mdChance = eStats.mdChance ? 0 : 1;
        myStats.atk += Math.floor(myStats.atk * Math.min(0.4, Math.max(0, myStats.sm / myStats.mana)));
        myStats.md += Math.floor(myStats.md * Math.min(0.4, Math.max(0, myStats.sm / myStats.mana)));
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.atk += Math.floor(myStats.atk * Math.min(0.4, Math.max(0, myStats.sm / myStats.mana)));
            myStats.md += Math.floor(myStats.md * Math.min(0.4, Math.max(0, myStats.sm / myStats.mana)));
        }, 9999));
    }, "The wearer has increased attack and magic damage equivalent to their mana % of total (up to **40%** max). Forces the enemy to deal magic damage if enemy deals physical damage by default, or vice versa."),
    new armorInfo("Dragon's Bane Helmet", "armor", "helmet", "Dragon's Bane Set", ["chest"], "<:dragons_bane_helmet:1081564897797754921>", "https://i.imgur.com/TZSMLxj.png", "mr", 51, 205, "genesis", 651),
    new armorInfo("Dragon's Bane Chestplate", "armor", "cuirass", "Dragon's Bane Set", ["chest"], "<:dragons_bane_chestplate:1081565481955237908>", "https://i.imgur.com/YMGa5wS.png", "hp", 217, 2468, "genesis", 652),
    new armorInfo("Dragon's Bane Gloves", "armor", "gloves", "Dragon's Bane Set", ["chest"], "<:dragons_bane_gloves:1081565845643333732>", "https://i.imgur.com/fFZgfa1.png", "def", 54, 213, "genesis", 653),
    new armorInfo("Dragon's Bane Boots", "armor", "boots", "Dragon's Bane Set", ["chest"], "<:dragons_bane_boots:1081566270467604620>", "https://i.imgur.com/277hrFr.png", "hp", 212, 2379, "genesis", 654, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.replaceButton.def = {
            "emoji": "<:dragons_bane_gloves:1081565845643333732>",
            "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (myStats.damageTaken > 5 * Math.max(myStats.atk, myStats.md)) myStats.damageTaken = 5 * Math.max(myStats.atk, myStats.md);
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:dragons_bane_gloves:1081565845643333732> **${char.name}**`, { atkMultiplier: myStats.damageTaken / Math.max(myStats.atk, myStats.md), magicDamage: true });
                myStats.damageTaken = 0;
            },
        };
    }, "Absorbs **100%** of the damage taken from the enemy and releases it when the wearer uses the DEF button (max 500% ATK|MD). DoT type of damages are excluded, and the wearer can't block.\n\n_DoT = Damage over Time_"),
    new armorInfo("Jade Long Helmet", "armor", "helmet", "Jade Long Set", ["chest"], "<:jade_long_helmet:1081564891766345738>", "https://i.imgur.com/MMWwM39.png", "def", 44, 173, "genesis", 655),
    new armorInfo("Jade Long Chestplate", "armor", "cuirass", "Jade Long Set", ["chest"], "<:jade_long_chestplate:1081565485696569344>", "https://i.imgur.com/E3UsKOC.png", "hp", 337, 3428, "genesis", 656),
    new armorInfo("Jade Long Vambrace", "armor", "gloves", "Jade Long Set", ["chest"], "<:jade_long_vambrace:1081565735639339129>", "https://i.imgur.com/vjqtUCE.png", "hp", 329, 3322, "genesis", 657),
    new armorInfo("Jade Long Boots", "armor", "boots", "Jade Long Set", ["chest"], "<:jade_long_boots:1081566342932602990>", "https://i.imgur.com/2Kx4wqU.png", "mr", 47, 184, "genesis", 658, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.0725), {});
        }, 9999));
    }, "Every round the wearer heals **7.25%** of missing HP."),
    new armorInfo("Scorching Helmet of Ira", "armor", "helmet", "Scorching Set of Ira", ["chest"], "<:scorching_helmet_of_ira:1081565052487880754>", "https://i.imgur.com/TkDgyOF.png", "hp", 218, 2470, "genesis", 659),
    new armorInfo("Scorching Chestplate of Ira", "armor", "cuirass", "Scorching Set of Ira", ["chest"], "<:scorching_chestplate_of_ira:1081565048981438598>", "https://i.imgur.com/8OXQz3X.png", "def", 51, 203, "genesis", 660),
    new armorInfo("Scorching Vambrace of Ira", "armor", "gloves", "Scorching Set of Ira", ["chest"], "<:scorching_vambrace_of_ira:1081565043403014225>", "https://i.imgur.com/iuKgjFo.png", "mr", 58, 236, "genesis", 661),
    new armorInfo("Scorching Boots of Ira", "armor", "boots", "Scorching Set of Ira", ["chest"], "<:scorching_boots_of_ira:1081565047152705586>", "https://i.imgur.com/MFqxWig.png", "hp", 227, 2542, "genesis", 662, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.cr += 0.30;
        if (myStats.cr > 1) myStats.cr = 1;
        mybuff.cr.push(new buffInfo("+", 0.30, 9999));
        myStats.executeHP = Math.max(0.2, myStats.executeHP);
        matchStats.xpboost += 1;
    }, "The wearer has **30%** increased crit rate for the rest of battle. Executes the enemy when below **20%** HP. Gets **+100%** more class xp in the dungeon after a win."),

    // Loot - Ascension Material
    new lootInfo("Kings Crown", "loot", "ascension material", ["dungeon", "floors 75, 91-92, 97"], "<:kings_crown:1085957092160065678>", "https://i.imgur.com/kuCvwO8.png", "normal", 663),
    new lootInfo("Sack of Gold", "loot", "ascension material", ["dungeon", "floors 10, 92"], "<:sack_of_gold:1085953669591203900>", "https://i.imgur.com/yYNzuhC.png", "normal", 664),
    new lootInfo("Odious Brain", "loot", "ascension material", ["dungeon", "floors 81-84, 86-89"], "<:odious_brain:1085957467118252175>", "https://i.imgur.com/KiWa09Q.png", "normal", 665),
    new lootInfo("Holy Grail", "loot", "ascension material", ["dungeon", "floor 91"], "<:holy_grail:1085953416355926146>", "https://i.imgur.com/7k2fEsc.png", "normal", 666),
    new lootInfo("Dragon Scales", "loot", "ascension material", ["dungeon", "floors 30-34, 36-39, 96-98, 100"], "<:dragon_scales:1085965820032729138>", "https://i.imgur.com/hJCO2Ql.png", "normal", 667),
    new lootInfo("Sturdy Conglomerate", "loot", "ascension material", ["dungeon", "floors 41-44, 46-49"], "<:sturdy_conglomerate:1085981924734013532>", "https://i.imgur.com/kisAO0f.png", "normal", 668),
    new lootInfo("Enigmatic Amber", "loot", "ascension material", ["dungeon", "floors 25, 40"], "<:enigmatic_amber:1085981921340833903>", "https://i.imgur.com/OVB0TTN.png", "normal", 669),
    new lootInfo("Wooden Bark", "loot", "ascension material", ["dungeon", "floors 76-79, 81-84"], "<:wooden_bark:1085988466610950245>", "https://i.imgur.com/brHFVi0.png", "normal", 670),
    new lootInfo("Metal Gear", "loot", "ascension material", ["dungeon", "floor 45"], "<:metal_gear:1085988462076903444>", "https://i.imgur.com/rLkNIml.png", "normal", 671),
    new lootInfo("Pendant of Silence", "loot", "ascension material", ["dungeon", "floor 70"], "<:pendant_of_silence:1086013617398353950>", "https://i.imgur.com/pPW31d1.png", "normal", 672),
    new lootInfo("Mortal Flask", "loot", "ascension material", ["dungeon", "floors 55, 99"], "<:mortal_flask:1086013621085159505>", "https://i.imgur.com/2017jC5.png", "normal", 673),
    new lootInfo("Arcane Remnants", "loot", "ascension material", ["dungeon", "floor 50"], "<:arcane_remnants:1086014438785699870>", "https://i.imgur.com/1KveQZ9.png", "normal", 674),
    new lootInfo("Charming Blossoms", "loot", "ascension material", ["dungeon", "floor 90"], "<:charming_blossoms:1086017299070337024>", "https://i.imgur.com/qQ77Li1.png", "normal", 675),

    // Loot - Exchange Points
    new lootInfo("Divine Exchange Points", "loot", "exchange point", ["chests", "disassembling"], "<:divine_exchange_points:1086987912438087691>", "https://i.imgur.com/ORLpiuL.png", "genesis", 676),
    new lootInfo("Mythical Exchange Points", "loot", "exchange point", ["chests", "disassembling"], "<:mythical_exchange_points:1078804861040210051>", "https://i.imgur.com/SHyyoQN.png", "mythical", 677),
    new lootInfo("Legendary Exchange Points", "loot", "exchange point", ["chests", "disassembling"], "<:legendary_exchang_points:1078805819820347392>", "https://i.imgur.com/JiQIkA7.png", "legendary", 678),
    new lootInfo("Unique Exchange Points", "loot", "exchange point", ["chests", "disassembling"], "<:unique_exchange_points:1086987977772781649>", "https://i.imgur.com/SSSNkZq.png", "unique", 679),
    new lootInfo("Rare Exchange Points", "loot", "exchange point", ["chests", "disassembling"], "<:rare_exchange_points:1086987993979555952>", "https://i.imgur.com/KPCu574.png", "rare", 680),
    new lootInfo("Special Exchange Points", "loot", "exchange point", ["chests", "disassembling"], "<:special_exchange_points:1086988000329744414>", "https://i.imgur.com/DlTzI56.png", "special", 681),
    new lootInfo("Normal Exchange Points", "loot", "exchange point", ["chests", "disassembling"], "<:normal_exchange_points:1086988006994485361>", "https://i.imgur.com/YSKO0au.png", "normal", 682),

    // Loot - Awakening Material
    new lootInfo("Starlight Kernel", "loot", "awakening material", ["stampede"], "<:starlight_kernel:1106121205515288659>", "https://i.imgur.com/lnvPUNK.png", "mythical", 683, false, false, false, "The Starlight Kernel brims with immense power, pulsating with a bright light that appears to dance and twirl like constellations in a distant nebula. This celestial core is used to awaken weapons and armor alike."),

    // Mythical Fish
    new fishInfo("Megalodon", "fish", "fish", ["fishing"], true, "<:megalodon:1179408684246368386>", "https://i.ibb.co/3yFz05f/megalodon.png", "mythical", 684),

    // Additional Weapons
    new weaponInfo("Serket's Sting", "weapon", "dagger", ["chest"], "<:serkets_sting:1173987001444347964>", "https://i.imgur.com/C4BTUBk.png", "atk", 114, 1038, "cr", 0.07, 0.25, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.critbleed = true;
        matchStats.critbleedlast = 3;
        myStats.def += 155;
        myStats.mr += 155;
        mybuff.def.push(new buffInfo("+", 155, 9999));
        mybuff.mr.push(new buffInfo("+", 155, 9999));
    }, "Critical strikes inflict a poison, dealing **3%** damage to the enemy for 3 rounds (or **6%** of own HP if enemy has more than twice your HP). Additionally, the wielder takes **15%** less damage.\n\n_A reduction of 15% = 155 DEF|MR_", "This dagger is as deadly elegant as its namesake, forged by celestial blacksmiths guided by the goddess Serket, who is associated with scorpions and protection. More than just a weapon, Serket's Sting is a representation of the heavenly might and protection. With an iridescent sheen like to a scorpion's exoskeleton, its blade is crafted from an unearthly metal. Its edge is so sharp that it seems to pierce both the earthly and spiritual planes. Its real strength comes from its affinity with the goddess herself. The dagger gains the ability to extend the goddess's divine will during terrible circumstances or when the wielder calls upon Serket. The blows it delivers have the power of a skilled killer combined with the protective edge of a kind guardian angel. Wielding Serket's Sting is a sacred duty, and those chosen to bear it are considered both guardians and avengers under the watchful eyes of the Divine Viper.", "mythical", 685),

    // Loot - Valentine's
    new lootInfo("Valentine's Chocolate", "loot", "event exclusive item", ["valentine's event"], "<:valentines_chocolate:1207055321839960194>", "https://i.ibb.co/hXP3CkT/Valentine-s-Chocolate.png", "mythical", 686, false, false, false, "Crafted with the finest cocoa and infused with a touch of magic, this Valentine's Chocolate is not only a sweet treat but also a source of strength and affection. It's a coveted item among heroes seeking to strengthen bonds or mend broken hearts."),

    // Additional Weapons
    new weaponInfo("Sacred Life Salamander", "weapon", "staff", ["chest"], "<:sacred_life_salamander:1274884340840665088>", "https://i.imgur.com/OGnmcD7.png", "md", 173, 976, "mr", 62, 255, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mdChance += 1;

        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const drain = Math.floor(myStats.maxhp * 0.1);
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, drain, {});
            eStats.hp -= drain;
            if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
            if (eStats.hp < 0) eStats.hp = 0;

            eStats.mr -= Math.floor(Math.min(eStats.mr * 0.02 * Math.min(9, Math.floor(myStats.mr / 100)), 660));
            eStats.md -= Math.floor(eStats.md * 0.02 * Math.min(12, Math.floor(myStats.mr / 100)));

        }, 9999));
    }, "Forces the enemy to deal magic damage. Drains the equivalent of **10%** of the wielders max HP from the enemy and adds it to the wielder after each round. For every **100** MR the wielder has, reduces enemy MD by **2%** (up to **24%**) and MR by **2%** (up to **18%**, max **2x** damage).", "The Sacred Life Salamander is a creature of mystery.  Nobody knows of its intentions, but the fact that its stuck to a twig and invigorated it with life-draining energy. According to a half-torn scripture, the sacred life salamander's existence was of arbitrary happenstance.", "genesis", 687),

    // Rings
    new ringInfo("Hope's End Signet", "ring", "ring", ["chest"], "<:hopes_end_signet:1333956472186343479>", "https://i.ibb.co/F47BRF93/Hope-s-End-Signet.png", 3, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        // On Ability: +20/25/30% MD (2 turns)
        matchStats.on("ABILITY", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * (0.2 + 0.05 * (level - 1))), 2));
                myStats.md += Math.floor(myStats.md * (0.2 + 0.05 * (level - 1)));
            };
        });

        // On Skill: +20/25/30% ATK (2 turns)
        matchStats.on("CSKILL", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * (0.2 + 0.05 * (level - 1))), 2));
                myStats.atk += Math.floor(myStats.atk * (0.2 + 0.05 * (level - 1)));
            }
        });

    }, (level) => `After using an ability, increases your magic damage by **${[20, 25, 30][level - 1]}%** for 2 turns. After using a skill, increases your attack by **${[20, 25, 30][level - 1]}%** for 2 turns.`, "Hope's End Signet is a striking fusion of elegance and menace, forged from deep, shadowy metal embellished with intricate engravings that depict swirling celestial motifs. At its center, a large, deep violet gem captures the essence of twilight, emanating a soft, mysterious glow reminiscent of an impending eclipse. Spiked projections encircle the gemstone, adding a touch of danger and symbolizing the teeth of a predator ready to strike. Wearing the Hope's End Signet grants its bearer heightened agility and the ability to weave shadows to cloak their presence, making it a prized possession among those who thrive in the darkness.", "legendary", 688),
    new ringInfo("Eclipse", "ring", "ring", ["raid"], "<:eclipse:1333953559988928606>", "https://i.ibb.co/MD73rWtJ/Eclipse.png", 3, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Magma

        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // HP < 10/12.5/15%: DEF/ MR = 0; 100/125/150%: Damage 
            if (myStats.hp < myStats.maxhp * (0.1 + 0.025 * (level - 1))) {
                // eStats.def = 0; eStats.mr = 0;
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:eclipse:1333953559988928606> **${char.name}**`, { atkMultiplier: 1 + 0.25 * (level - 1), defMultiplier: 0, magicDamage: true });
                // @ts-ignore
                this._used++;
            };
        }, 9999, 1));

    }, (level) => `Triggers Eclipse when your health reaches below **${[10, 12.5, 15][level - 1]}%** of your max HP, launching a calamitous strike equal to **${[100, 125, 150][level - 1]}%** of your normal damage, completely ignoring enemy DEF and MR.`, "The Eclipse is a ring of weary elegance, featuring a broad band of tarnished metal adorned with a radiant black stone at its center. The stone is set within an ornate crescent motif that tells tales of hope and despair. Subtle etchings weave stories of battles fought for hope, giving the wearer strength during times of conflict. When worn, it is believed to enhance bravery, allowing the bearer to stand firm even in the face of overwhelming odds.", "mythical", 689),
    new ringInfo("Astral Coronet", "ring", "ring", ["chest"], "<:astral_coronet:1333960726217363576>", "https://i.ibb.co/sdSwqNKp/Astral-Coronet.png", 3, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.trusilverLoop = 0;

        // On 16/13/10th abiltiy usage: 200% ATK/MD
        matchStats.on("ABILITY", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                myStats.trusilverLoop++;
                if (myStats.trusilverLoop === [16, 13, 10][level - 1]) {
                    mybuff.atk.push(new buffInfo("*", 2, 9999));
                    mybuff.md.push(new buffInfo("*", 2, 9999));
                    myStats.atk *= 2;
                    myStats.md *= 2;
                };
            };
        });

    }, (level) => `Doubles your ATK and MD for the rest of the battle if you use your ability **${[16, 13, 10][level - 1]}** times in one fight.`, "The Astral Coronet is a mesmerizing ring, elegantly shaped like a swirling galaxy, with hues of violet and cerulean dancing across its surface. Crafted from ethereal materials, its design mimics spiraling cosmic strands and luminous orbs, giving it an otherworldly feel. Each twist and turn glimmers with a gentle shimmer, symbolizing the interconnectedness of all stars. It bestows its wearer with heightened intuition and the ability to wield celestial magic, allowing them to summon the wisdom of the cosmos during critical moments.", "legendary", 690),
    new ringInfo("Oath of Love", "ring", "ring", ["raid"], "<:oath_of_love:1333961866782707743>", "https://i.ibb.co/MDYCRnd7/Oath-of-Love.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* ShieldMan

        // -20/22.5/25/27.5/30% HP, + 40/50/60/70/80% (max HP) Shield
        myStats.hp -= Math.floor(myStats.maxhp * (0.2 + 0.025 * (level - 1)));
        myStats.shield += Math.floor(myStats.maxhp * (0.4 + 0.1 * (level - 1)));

    }, (level) => `Loses **${[20, 22.5, 25, 27.5, 30][level - 1]}%** of your current HP and gains a shield equal to **${[40, 50, 60, 70, 80][level - 1]}%** of your max HP.`, "The Oath of Love ring embodies romance and eternity, crafted from warm, polished bronze that complements the heart-shaped ruby at its center. Surrounding the gemstone are delicate floral motifs, intricately entwined to symbolize the bonds of love and devotion. The vibrant ruby sparkles with fiery passion, representing an unbreakable promise between lovers. Those who wear the Oath of Love can expect heightened emotional awareness and an ability to forge deep connections with others, making it a cherished talisman for couples seeking to strengthen their union.", "mythical", 691),
    new ringInfo("Azure Aegis", "ring", "ring", ["raid"], "<:azure_aegis:1333965898968600677>", "https://i.ibb.co/4ZFH0gxS/Azure-Aegis.png", 4, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* ShieldMan

        // +ATK/MD += Shield/ max: 40/60% ATK/MD
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.atk += Math.floor(Math.min(myStats.shield, myStats.atk * (0.1 + 0.05 * (level - 1)))); //! Shield Amount Scaling
            myStats.md += Math.floor(Math.min(myStats.shield, myStats.md * (0.1 + 0.05 * (level - 1)))); //! Shield Amount Scaling
        }, 9999));

    }, (level) => `Increases the wearer's ATK and MD by their shield amount at any given time, up to **${[10, 15, 20, 25][level - 1]}%** of their ATK/MD.`, "The Azure Aegis is a stunning ring, designed in the shape of a shield encasing a radiant blue gem. Intricate patterns of swirling that evoke ocean waves cover the band, embodying strength and protection. Crafted from a blue-tinted metal that glistens like the sea at sunrise, it shimmers with a soft, inviting light. When worn, it enhances defensive abilities, creating a protective aura around the bearer, thus ensuring their safety and fortitude in challenging situations.", "legendary", 692),
    new ringInfo("Ethereal Spiral", "ring", "ring", ["raid"], "<:ethereal_spiral:1333967191678390333>", "https://i.ibb.co/TDqBgJpr/Ethereal-Spiral.png", 4, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Mana (DoT before)

        // Steals 2/3/4/5 💧 from the enemy
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const steal = Math.min(eStats.sm, Math.floor(2 + 2 * (level - 1)));
            if (steal > 0) {
                eStats.sm -= steal;
                myStats.sm += steal;
                if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
            };
        }, 9999));

    }, (level) => `The wearer steals **${[2, 3, 4, 5][level - 1]}**💧 from the enemy every turn.`, "The Ethereal Spiral is a ring infused with the essence of the astral plane. Its design features an intricate, spiral pattern that shimmers with an iridescent sheen, evoking the majestic colors of distant galaxies. The band itself appears to be forged from a translucent material, allowing light to bend through it, creating a mesmerizing aura. Engraved runes encircle the ring, harnessing celestial energies, granting the wearer enhanced magical abilities and a connection to the stars. This ethereal artifact is said to hold the power to traverse dimensions, making it a coveted prize among scholars and adventurers alike.", "legendary", 693),
    new ringInfo("Radiant Heart", "ring", "ring", ["chest"], "<:radiant_heart:1338658015951327254>", "https://i.ibb.co/kVZ4NPxt/Radiant-Heart.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        // On Revival: ATK/MD debuff for enemy (10 turns)
        matchStats.on("revival", {
            maxUsage: 1,
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats) {
                    const debuffScale = [20, 22.5, 25, 27.5, 30][level - 1] / 100;
                    ebuff.atk.push(new buffInfo("+", -Math.floor(eStats.atk * debuffScale), 10));
                    ebuff.md.push(new buffInfo("+", -Math.floor(eStats.md * debuffScale), 10));
                    eStats.atk -= Math.floor(eStats.atk * debuffScale);
                    eStats.md -= Math.floor(eStats.md * debuffScale);

                    return true;
                };
            },
        });

    }, (level) => `After the first successful revival, the wearer decreases the enemy's attack and magic damage by **${[20, 22.5, 25, 27.5, 30][level - 1]}%** for the next **10** rounds.`, "The Radiant Heart ring is a dazzling display of regal splendor. Crafted from deep violet metal, the band organically twists and turns, resembling delicate vines. At its center lies a heart-shaped gemstone that radiates a warm, fiery glow, surrounded by a burst of smaller, colorful gems. This vibrant design captures the essence of love and vitality, embodying the bond between nature and emotion. Ideal for healers and champions of light, the ring enhances restorative spells and abilities, providing vitality to allies and empowering the wearer to stand resolute against the forces of darkness.", "legendary", 694),
    new ringInfo("Thorn Script", "ring", "ring", ["raid"], "<:thorn_script:1333976186610520084>", "https://i.ibb.co/PvgkfwxS/Thorn-Script.png", 3, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Counter

        // -7/6/5 max HP, +10/15/20% counter chance
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.hp -= Math.floor(myStats.maxhp * [0.07, 0.06, 0.05][level - 1]);
            if (myStats.hp < 0) myStats.hp = 0;

            if (Math.random() < (0.1 + 0.05 * (level - 1))) myStats.counter += 1;
        }, 9999));

    }, (level) => `The wearer loses **${[7, 6, 5][level - 1]}%** of their max HP every turn but they have **+${[10, 15, 20][level - 1]}%** counter chance.`, "The Thorn Script features an ornate design resembling creeping vines and thorns enfolding a rich black stone. Embedded within the design are delicate etchings of ancient runes that glow softly when invoked. The intertwining thorns symbolize resilience, while the deep stone at its core embodies the bearer's struggles and strength. Known to enhance one's cunning and resourcefulness, this ring is favored by those who walk the precarious edge of danger and strategy.", "mythical", 695),
    new ringInfo("Crimson Talon", "ring", "ring", ["raid"], "<:crimson_talon:1333982303961219135>", "https://i.ibb.co/Ng9K63yQ/Crimson-Talon.png", 7, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Counter

        // On Counter: +5% CD (max: 60/70/80/90/100/110/120%)
        matchStats.on("counter", {
            maxUsage: 6 + (level - 1), callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats) {
                    myStats.cd += 0.05;
                    mybuff.cd.push(new buffInfo("+", 0.05, 9999));
                    return true;
                };
            },
        });

    }, (level) => `Gain **5%** crit damage every time you counter, up to **${[30, 35, 40, 45, 50, 55, 60][level - 1]}%**`, "The Crimson Talon brings to life the fearsome aspects of the wild. This ring features an elaborate claw design crafted from blackened steel, with crimson gemstones embedded at each fingertip, resembling dripping blood. The band bears engravings depicting the fierce spirit of a predator, alive with the energy of the wild. When worn, the ring grants the wearer agility and ferocity in battle, enhancing their physical prowess and primal instincts. Legends say that it also allows communion with feral beasts, making it a legacy item for warriors wishing to channel the strength of nature's fiercest creatures.", "unique", 696),
    new ringInfo("Titan's Band", "ring", "ring", ["raid"], "<:titans_band:1333984017091002400>", "https://i.ibb.co/8nj8s9L4/Titan-s-Band.png", 6, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Counter

        // On Counter: Heal 3/4/5/6/7/8% current HP
        matchStats.on("counter", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.hp * 0.03 + 0.01 * (level - 1)));
        });

    }, (level) => `Heals the wearer for **${[3, 4, 5, 6, 7, 8][level - 1]}%** of their current HP every time they counter.`, "Forged in the heart of an ancient colossus, this ring hums with the unyielding power of machine and myth. Its intricate engravings glow faintly, resonating with the energy of the titanic forces that shaped it. Wield it wisely, for within its steel lies the strength to move mountains.", "rare", 697),
    new ringInfo("Shadow Drake Band", "ring", "ring", ["raid"], "<:shadow_drake_band:1333985563119845400>", "https://i.ibb.co/Kjp75cbH/Shadow-Drake-Band.png", 3, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Counter

        // When HP < 30%: +3/4/5 counter stacks (once)
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.hp < myStats.maxhp * 0.3) {
                myStats.counter += [3, 4, 5][level - 1];
                // @ts-ignore
                this._used++;
            };
        }, 9999, 1));

    }, (level) => `The wearer gains **${[2, 3, 4][level - 1]}** counter stacks, when their HP falls below **30%** of their max HP for the first time.`, "Forged from obsidian-black metal, the Shadow Drake Band is adorned with cruel, jagged spikes that seem to absorb light. Intricate draconic runes, etched in dark crimson, encircle the band, pulsating with an eerie glow under moonlight. This formidable ring is said to resonate with the spirits of ancient drakes, granting its bearer enhanced agility and stealth. As shadows twist and crawl, whispers of the drakes' secrets flicker in the wearer's mind, empowering their spells with eldritch energy. Treasures that glitter from within can lure thieves, but only those with a true heart may harness its dark potential without succumbing to madness.", "legendary", 698),
    new ringInfo("Ocean's Reverie", "ring", "ring", ["raid"], "<:oceans_reverie:1333987029590999111>", "https://i.ibb.co/XrTCXyfM/Ocean-s-Reverie.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Mana

        myStats.oceanReverie = 0;
        const steal = Math.floor(eStats.sm * 0.3 + 0.05 * (level - 1));

        // On every 3rd ability/ cskill usage: Steal 30/35/40/45/50% mana
        matchStats.on("ABILITY", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                myStats.oceanReverie++;
                if (myStats.oceanReverie % 3 === 0) {
                    myStats.sm += steal;
                    if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
                    eStats.sm -= steal;
                };
            };
        });
        matchStats.on("CSKILL", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                myStats.oceanReverie++;
                if (myStats.oceanReverie % 3 === 0) {
                    myStats.sm += steal;
                    if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
                    eStats.sm -= steal;
                };
            };
        });

    }, (level) => `Steals **${[30, 35, 40, 45, 50][level - 1]}%** of enemy mana on every **3rd** ability or skill usage.`, "Delicately designed, the Ocean's Reverie ring flows with the essence of the sea. The silver band is intricately etched with fluid patterns resembling waves, and gemstones resembling deep ocean blues are set throughout. A luminous aqua stone sits prominently at its center, radiating a soft, calming glow. Legends say this ring grants the wearer a deep affinity with water, allowing them to breathe underwater and communicate with aquatic creatures. Ocean's Reverie serves as a talisman for those who draw strength from the ocean's depths, whether they be sailors or sorcerers.", "unique", 699),
    new ringInfo("Equilibrium Band", "ring", "ring", ["raid"], "<:equilibrium_band:1333989254933778566>", "https://i.ibb.co/yn4DrqR8/Equilibrium-Band.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* ShieldMan

        myStats.equilibriumBand = 0;
        // On every 4th ability usage: +15/17.5/20/22.5/25% shield (max HP)
        matchStats.on("ABILITY", {
            maxUsage: [3, 3, 4, 4, 4][level - 1],
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats) {
                    myStats.equilibriumBand++;
                    if (myStats.equilibriumBand % 4 === 0) {
                        myStats.shield += Math.floor(myStats.maxhp * [0.15, 0.175, 0.2, 0.225, 0.25][level - 1]);

                        return true;
                    };
                };
            },
        });

        /* without equilibriumBand Stat //?(idk if this works, does trigger.used start at 1?)
        matchStats.on("ABILITY", {
            maxUsage: [12, 12, 16, 16, 16][level - 1],
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats) {
                    if (trigger.used % 4 === 0) {
                        myStats.shield += Math.floor(myStats.maxhp * [0.15, 0.175, 0.2, 0.225, 0.25][level - 1]);
                    };
                    return true;
                };
            },
        });
        */

    }, (level) => `The wearer gains **${[15, 17.5, 20, 22.5, 25][level - 1]}%** of their max HP as shield for every **4th** ability usage (up to **${[3, 3, 4, 4, 4][level - 1]}** times).`, "The Equilibrium Band is a striking artifact forged from enchanted iron, with a symmetrical design that perfectly balances elegance and strength. The band features dual gemstones—one radiant sapphire and one luminous amber—set in exquisite harmony at its center. Intricate etchings depicting the duality of existence spiral around the ring, conveying the essence of balance. When worn, the ring grants its bearer the ability to navigate life's chaos, ensuring they endure conflicts and forge alliances with ease. Rumors whisper that those attuned to its power can influence fate, stabilizing even the most desperate situations in their favor.", "legendary", 700),
    new ringInfo("Skyward Rune", "ring", "ring", ["raid"], "<:skyward_rune:1333991494725664789>", "https://i.ibb.co/wrjvXSh4/Skyward-Rune.png", 2, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Duo

        myStats.nimbleGuardian = myStats.dodge;
        // On turn 10/7: damageReduction += dodge rate difference
        myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + [10, 7][level - 1], (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.damageReduction += Math.abs(myStats.dodge - myStats.nimbleGuardian);
        }));

    }, (level) => `Records dodge rate upon entering battle. By turn **${[10, 7][level - 1]}**, gains 1% damage reduction per dodge rate difference.`, "Embodying the essence of the heavens, the Skyward Rune is a breathtaking ring crafted from celestial silver. A brilliant azure gemstone rests at the center, surrounded by swirling clouds of silver filigree that dance around it like a tempest. Inscribed with runes of the sky, this ring is revered for its ability to amplify the wearer's connection to the air element, enhancing their spells and speed. Legends tell of heroes who wielded this ring to summon storms and control winds, bending them to their will. With it, the sky is not merely above, but a companion in adventure, guiding the brave through the troubles below.", "genesis", 701),
    new ringInfo("Ceneinuica", "ring", "ring", ["raid"], "<:ceneinuica:1334123617440628736>", "https://i.ibb.co/TqKyPkMj/Ceneinuica.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Dusty
        myStats.ceneinuica = 0;

        // On every 4th attack received, increase ATK/MD by 3/3/4/4/5% (max 7/8/9/10/12 times)
        matchStats.on("attack", {
            maxUsage: [7, 8, 9, 10, 12][level - 1],
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === eStats) {
                    myStats.ceneinuica++;
                    if (myStats.ceneinuica % 4 === 0) {
                        const boost = [0.03, 0.03, 0.04, 0.04, 0.05][level - 1];

                        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * boost), 9999));
                        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * boost), 9999));
                        myStats.atk += Math.floor(myStats.atk * boost);
                        myStats.md += Math.floor(myStats.md * boost);

                        return true;
                    };
                };
            },
        });

        //? same here as with Equilibrium Band

    }, (level) => `On every **4th** attack received, the wearer gains **${[3, 3, 4, 4, 5][level - 1]}%** ATK and MD permanently, up to **${[7, 8, 9, 10, 12][level - 1]}** times.`, "Ceneinuica is a ring fashioned from a dark, obsidian-like stone that captures the essence of forgotten magic. The band is interspersed with ancient, vibrant inscriptions glowing eerily against the darker hues, telling tales lost to time. Atop the ring, a crystalline shard reflects light in scattered hues, embodying the fragmented memories of past worlds. Rumored to contain a fragment of the void, the ring enhances its wearer's mastery over magic, unlocking formidable spells of concealment and restoration. Only those with an unwavering spirit can wield Ceneinuica, as its power demands a heavy price—one must confront the shadows of the past to embrace its potential fully.", "mythical", 702),
    new ringInfo("Starweaver's Glimmer", "ring", "ring", ["raid"], "<:starweavers_glimmer:1334125620841680937>", "https://i.ibb.co/JRv2Lv9C/Starweaver-s-Glimmer.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Duo
        myStats.starweaverGlimmer = 0;

        // On every block: heal 1/1/1/2/2% max HP, + 3,4,5,5,5% CR (max: 15,20,25,25,30%)
        matchStats.on("block", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (target === myStats) {
                myStats.hp += Math.floor(myStats.maxhp * [0.01, 0.01, 0.01, 0.02, 0.02][level - 1]);
                if (myStats.starweaverGlimmer < [5, 5, 5, 5, 6][level - 1]) {
                    myStats.starweaverGlimmer++;
                    myStats.cr += [0.03, 0.04, 0.05, 0.05, 0.05][level - 1];
                    mybuff.cr.push(new buffInfo("+", [0.03, 0.04, 0.05, 0.05, 0.05][level - 1], 9999));
                };
            };
        });

    }, (level) => `A successful block heals the wearer for **${[1, 1, 1, 2, 2][level - 1]}%** of their max HP and increases their Crit Rate by **${[3, 4, 5, 5, 5][level - 1]}%** (max **${[15, 20, 25, 25, 30][level - 1]}%**).`, "The Starweaver's Glimmer is a resplendent ring crafted from gleaming starlight-infused gold. Adorned with twinkling gems simulating stars captured in a dance of celestial light, the ring seems almost alive, as if the cosmos pulse within its frame. Its design is elegant, with swirling motifs that resemble the night sky, while the center stone glows softly like a distant star. This ring is believed to bless its wearer with newfound insight and inspiration, allowing them to communicate with celestial forces for guidance. Legends say that those who wear the Starweaver's Glimmer can momentarily manipulate time, weaving their fate among the constellations.", "unique", 703),
    new ringInfo("Tidebound Crown", "ring", "ring", ["raid"], "<:tidebound_crown:1334127016932282419>", "https://i.ibb.co/mV0sGbHG/Tidebound-Crown.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Duo

        // On Crit: +5/7.5/10/12.5/15% BR (3 turns)
        matchStats.on("crit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                myStats.br += [0.05, 0.075, 0.1, 0.125, 0.15][level - 1];
                mybuff.br.push(new buffInfo("+", [0.05, 0.075, 0.1, 0.125, 0.15][level - 1], 3));
            };
        });

    }, (level) => `The wearer gains **+${[5, 7.5, 10, 12.5, 15][level - 1]}%** block rate for **3** turns upon a successful critical hit.`, "The Tidebound Crown stands as a majestic artifact, reminiscent of a coral reef. Crafted from intertwined blue and silver metals, it mimics the appearance of ocean waves frozen in time. Swirling patterns etched into its surface echo the rhythm of tides, while tiny shells and pearls adorn the band. This crown, filled with the essence of the sea, grants dominion over water and marine life. Wearers are endowed with the ability to summon tidal forces and navigate through storms, making it an invaluable item for rulers of coastal realms and sea-dwellers.", "rare", 704),
    new ringInfo("Splintered Storm", "ring", "ring", ["raid"], "<:splintered_storm:1334170779583119433>", "https://i.ibb.co/VW2d80Sf/Splintered-Storm.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Hammer

        // On (own) shield break: +4/4/5/5/5% max HP
        matchStats.on("shieldBreak", {
            maxUsage: [6, 7, 8, 9, 10][level - 1],
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (target === myStats) {
                    myStats.maxhp += Math.floor(myStats.maxhp * [0.04, 0.04, 0.05, 0.05, 0.05][level - 1]);
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * [0.03, 0.04, 0.05, 0.05, 0.05][level - 1]));
                    return true;
                };
            },
        });

    }, (level) => `After the wearer's shield breaks, raises their own max HP by **${[4, 4, 5, 5, 5][level - 1]}%** and heals **${[3, 4, 5, 5, 5][level - 1]}%** of max HP up to **${[6, 7, 8, 9, 10][level - 1]}** times.`, "The Splintered Storm is a fierce-looking ring forged from jagged steel that reflects the chaos of tempestuous skies. Its surface is marked with grotesque shards and fragments like shattered glass, each pulsating with a crackling energy that hints at dormant power. At its center lies a gleaming lightning-blue crystal, simulating a miniature storm trapped within. Wielders of this ring can harness the fury of lightning and wind, unleashing destructive magic upon their foes. Legends caution that this power comes at a price, as the energy can consume the unwary—only true storm callers can master its wrath without being overwhelmed.", "mythical", 705),
    new ringInfo("Runekeeper's Seal", "ring", "ring", ["raid"], "<:runekeepers_seal:1334172293655560245>", "https://i.ibb.co/0H1hKV6/Runekeeper-s-Seal.png", 9, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* ShieldMan

        // every 7/7/7/6/6/6/5/5/5 rounds: +1/1.5/2/2/2.5/3/3/3.5/4% max HP as shield
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.round % [7, 7, 7, 6, 6, 6, 5, 5, 5][level - 1] === 0) {
                myStats.shield += Math.floor(myStats.maxhp * [0.01, 0.015, 0.02, 0.02, 0.025, 0.03, 0.03, 0.035, 0.04][level - 1]);
            };
        }, 9999));

    }, (level) => `Gain **${[1, 1.5, 2, 2, 2.5, 3, 3, 3.5, 4][level - 1]}%** of your max HP as shield every **${[7, 7, 7, 6, 6, 6, 5, 5, 5][level - 1]}** rounds.`, "Runekeeper's Seal is a wizened ring forged from a blend of metals, glinting with wisdom and power. The wide band is intricately carved with protective runes, various ancient symbols swirling in an enigmatic dance around it. A brilliant emerald sits at its center, said to hold the knowledge of past experiences. This ring allows its wearer to recall memories with startling clarity, granting insight into their own life and the legacies of those who wore it before. Perfect for sage scholars and guardians of lore, it's revered as a means of preserving the past.", "legendary", 706),
    new ringInfo("Sylvan Echo", "ring", "ring", ["raid"], "<:sylvan_echo:1334173542367105188>", "https://i.ibb.co/xqVRhsr6/Sylvan-Echo.png", 6, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Hammer

        // On shield break: +4% ATK/MD (max 5/6/7 times)
        matchStats.on("shieldBreak", {
            maxUsage: [5, 6, 7, 8, 9, 10][level - 1], callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats }) => {
                if (target === myStats) {
                    mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.04), 9999));
                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.04), 9999));
                    myStats.atk += Math.floor(myStats.atk * 0.04);
                    myStats.md += Math.floor(myStats.md * 0.04);
                    return true;
                };
            },
        });

    }, (level) => `Increase the wearer's ATK and MD by **4%** every time their shield breaks, up to **${[5, 6, 7, 8, 9, 10][level - 1]}** times in total.`, "The Sylvan Echo is an enchanting ring forged from living wood intertwined with gleaming silver vines, resembling the ancient trees of enchanted forests. Leaf-like motifs wrap around the band, flickering with vibrant shades of emerald and gold, suggesting a pulse of life within. At its heart lies a soft green crystal that shimmers with an inner glow, reminiscent of forest sunlight filtering through leaves. This ring fortifies its wearer with nature's essence, granting heightened awareness of their surroundings and allowing for communion with woodland creatures. Those attuned to the forest find themselves drawn to the Sylvan Echo, as it amplifies their connection to nature, leading them to hidden pathways and verdant secrets.", "legendary", 707),
    new ringInfo("Lightning Seal", "ring", "ring", ["raid"], "<:lightning_seal:1334174859202269214>", "https://i.ibb.co/B5dTvCMh/Lightning-Seal.png", 1, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* DoT

        myStats.replaceButton.atk = {
            "emoji": "<:lightning_seal:1334174859202269214>",
            "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                // 2x 40% (lightning) damage
                let shockDMG1 = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:lightning:1340309243827458139> **${char.name}**`, { atkMultiplier: 0.4, isLightning: true });
                let shockDMG2 = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:lightning:1340309243827458139> **${char.name}**`, { atkMultiplier: 0.4, isLightning: true });

                // each 40% chance: 50% of the previous hit as DoT (2 rounds)
                if (Math.random() < 0.4) ebuff.hp.push(new buffInfo("+", shockDMG1 * 0.5, 2));
                if (Math.random() < 0.4) ebuff.hp.push(new buffInfo("+", shockDMG2 * 0.5, 2));
            },
        };

    }, (level) => `Normal attacks deal 2 hits of 40% lightning damage, each with a 40% chance to inflict Shock on the enemy, dealing **50%** of the previous damage for **2** rounds.`, "Crafted from darkened steel, the Lightning Seal ring is adorned with jagged edges that mimic the ferocity of a thunderstorm. Its deep indigo hue shifts to vibrant electric blue, sparking with arcs of energy that dance across its surface. Embedded at its center is a translucent blue gem, embodying the essence of storm clouds. This ring grants the wearer mastery over lightning magic, channeling raw energy into powerful spells while enhancing reflexes and agility during combat. Whispers of ancient storms resonate from the ring, bestowing the courage to challenge the fiercest of foes.", "genesis", 708),
    new ringInfo("Fractured Whisper", "ring", "ring", ["raid"], "<:fractured_whisper:1340497296802054215>", "https://i.ibb.co/yBfWSyFM/Fractured-Whisper.png", 3, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Hammer

        // Create and break shield
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.round % [2, 2, 1][level - 1] === 0) {
                myStats.shield = 0;
                matchStats.trigger("shieldBreak", eStats, myStats, ebuff, mybuff);
            };
        }, 9999));

        // On (own) shield break: deal 10/12.5/15% damage
        matchStats.on("shieldBreak", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (target === myStats) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:fractured_whisper:1340497296802054215> **${char.name}**`, { atkMultiplier: [0.1, 0.125, 0.15][level - 1], });
            };
        });

    }, (level) => `The wearer creates and immediately breaks a shield ${["every **2** rounds", "every **2** rounds", "every round"][level - 1]}. Deals **${[10, 12.5, 15][level - 1]}%** damage to the enemy on every shield break.`, "Forged from the remnants of an ancient frost titan’s crown, the Fractured Whisper hums with the echoes of a winter long lost. Its crystalline shards shimmer with spectral whispers, promising power to those who dare to listen.", "genesis", 709),
    new ringInfo("Ecplise Gem", "ring", "ring", ["chest"], "<:eclipse_gem:1338658011560018002>", "https://i.ibb.co/h19dPqqh/Eclipse-Gem.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        myStats.eclipseGemStacks = 0;

        // On every 3rd skill: Heal 4/5/6/7/7.5% max HP, steal 3/3/4/4/5 💧
        matchStats.on("CSKILL", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                myStats.eclipseGemStacks++;

                if (myStats.eclipseGemStacks % 3 === 0) {
                    const heal = Math.floor(myStats.maxhp * ([4, 5, 6, 7, 7.5][level - 1] / 100));
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, heal);

                    if (eStats.sm > 0) {
                        const steal = Math.min(eStats.sm, [3, 3, 4, 4, 5][level - 1]);
                        eStats.sm -= steal;
                        myStats.sm += steal;
                        if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
                    };
                };
            };
        });

    }, (level) => `On every 3rd class skill usage, the wearer heals **${[4, 5, 6, 7, 7.5][level - 1]}%** of their max HP and steals **${[3, 3, 4, 4, 5][level - 1]}**💧 from the enemy.`, "The Eclipse Gem radiates an air of mystery and allure, crafted from darkened metals that capture the very essence of the night sky. At its heart lies a mesmerizing azure gemstone that seems to change hues, evoking the feeling of a shimmering moonlit night. Intricate silver swirls wrap around the band, mimicking celestial events, while small gems of varying colors represent the stars. This ring enhances the wearer's stealth and cunning, allowing them to merge with shadows and gain the upper hand in intricate situations. The Eclipse Gem is a coveted artifact for rogues and nocturnal warriors.", "unique", 710),
    new ringInfo("Lucky Star Band", "ring", "ring", ["raid"], "<:lucky_star_band:1334250598849052744>", "https://i.ibb.co/fz6N3qv9/Lucky-Star-Band.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Duo

        // On enemy dodge: 30/35/40/45/50% chance to attack twice
        matchStats.on("miss", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats && Math.random() < [0.3, 0.35, 0.4, 0.45, 0.5][level - 1]) {
                myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    matchStats.twinshot = 0;
                }));
                matchStats.twinshot = 1;
            };
        });

    }, (level) => `Every time the enemy evades an attack, the wearer has a **${[30, 35, 40, 45, 50][level - 1]}%** chance to hit twice the next turn.`, "Crafted from gleaming gold, the Lucky Star Band shines with an inviting warmth. This ring features a horseshoe shape, adorned with delicate engravings of stars and a vibrant turquoise gemstone at its center, cradled like a precious gem in fortune's embrace. The stars appear as if they twinkle, shifting in color with each movement, radiating luck and prosperity. When worn, this ring enhances the wearer's chances in games of chance and ensures favorable outcomes in their adventures. Its charm is irresistible, making it a must-have for rogues and gamblers seeking fortune's favor.", "mythical", 711),
    new ringInfo("Eye of Avarice", "ring", "ring", ["raid"], "<:eye_of_avarice:1334258299411107924>", "https://i.ibb.co/SX0GtSLz/Eye-of-Avarice.png", 4, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Cakey

        // -2/3/4/5 enemy mana generation
        eStats.mg -= [2, 3, 4, 5][level - 1];
        ebuff.mg.push(new buffInfo("+", -[2, 3, 4, 5][level - 1], 9999));

    }, (level) => `Decreases the enemy's magic generation by **${[2, 3, 4, 5][level - 1]}** for the rest of battle.`, "The Eye of Avarice is a striking ring that captures attention instantly, featuring a large, glimmering gemstone at its center, reminiscent of an eye surveying its domain. The band is crafted from deep, burnished gold, intricately etched with symbols of greed and wealth. Surrounding the eye are smaller gems that gleam in shades of green and amethyst, each representing the potential for profit and power. This ring bestows the wearer heightened perception and insight into treasures, guiding them toward hidden riches. However, with great power comes great temptation, and the allure of wealth may lead down a dark path.", "mythical", 712),
    new ringInfo("Stoneheart", "ring", "ring", ["chest"], "<:stoneheart:1338658007612915822>", "https://i.ibb.co/chn2PNbD/Stoneheart.png", 7, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        // +15/17.5/20/22.5/25/27.5/30% max HP
        const hpBuff = [15, 17.5, 20, 22.5, 25, 27.5, 30][level - 1] / 100;
        myStats.myStatsFixed += Math.floor(myStats.myStatsFixed * hpBuff);
        myStats.maxhp += Math.floor(myStats.maxhp * hpBuff);
        myStats.hp += Math.floor(myStats.maxhp * hpBuff);

        // 0% Dodge
        mybuff.dodge.push(new buffInfo("=", 0, 9999));
        myStats.dodge = 0;

    }, (level) => `The wearer begins the battle with **${[15, 17.5, 20, 22.5, 25, 27.5, 30][level - 1]}%** increased max HP, but their dodge rate is reduced to **0%**.`, "The Stoneheart ring is a celebration of earthy strength and resilience. Its rugged band is crafted from interlocking rocks and mineral fragments, providing an ancient look that draws upon the strength of the earth itself. Embedded within is a breathtaking teal crystal, resembling a pool of calm water amidst the chaos of nature. The side pieces feature delicate carvings of trees, symbolizing life and growth in even the toughest conditions. Wearing this ring bestows enhanced endurance and the ability to commune with elemental spirits, making it an essential piece for adventurers who tread perilously close to the world of rock and stone.", "unique", 713),
    new ringInfo("Lightning Circuit", "ring", "ring", ["raid"], "<:lightning_circuit:1334265250454700094>", "https://i.ibb.co/6cCFbJKY/Lightning-Circuit.png", 15, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Lightning

        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Every 3 rounds: Deal 40/42.5/45/47.5/50/52.5/55/57.5/60/62.5/65/67.5/70/72.5/75% lightning damage
            if (matchStats.round % 3 === 0) {
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:lightning:1340309243827458139> **${char.name}**`, { isLightning: true, atkMultiplier: [0.4, 0.425, 0.45, 0.475, 0.5, 0.525, 0.55, 0.575, 0.6, 0.625, 0.65, 0.675, 0.7, 0.725, 0.75][level - 1] });
            };
        }, 9999));

    }, (level) => `The wearer deals **${[40, 42.5, 45, 47.5, 50, 52.5, 55, 57.5, 60, 62.5, 65, 67.5, 70, 72.5, 75][level - 1]}%** lightning damage every **3** rounds.`, "Designed like an intricate circuit board, the Lightning Circuit combines modernity with mysticism. Its sleek, metallic band is accented with glowing electric blue patterns that pulse rhythmically, mimicking the flow of energy itself. This ring is lightweight yet durable, emphasizing agility and speed. The wearer gains enhanced reflexes and the ability to channel lightning in combat. Each spark that leaps from the band serves as a reminder of the unseen forces at play. Ideal for rogue engineers or swift spellcasters, this ring merges technology and ancient magic into a singular embodiment of power.", "unique", 714),
    new ringInfo("Static Surge", "ring", "ring", ["raid"], "<:static_surge:1334266402026291322>", "https://i.ibb.co/Z7m5Zhs/Static-Surge.png", 7, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Lightning

        // On Crit: Deal 15/17.5/20/22.5/25/27.5/30% lightning damage
        matchStats.on("crit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:lightning:1340309243827458139> **${char.name}**`, { isLightning: true, atkMultiplier: [0.15, 0.175, 0.2, 0.225, 0.25, 0.275, 0.3][level - 1] });
            };
        });

    }, (level) => `Deal **${[15, 17.5, 20, 22.5, 25, 27.5, 30][level - 1]}%** lightning damage when you critically hit.`, "The Static Surge is a bold symbol of raw, chaotic energy. Crafted from dark iron, the ring appears rugged, with jagged edges and a unique, rough texture. Blue and white sparks seem to burst from the band, creating an electrifying aura around its wearer. Depictions of storm clouds and bolts of lightning wind around its circumference, epitomizing the tumultuous nature of storm magic. When invoked, this ring amplifies electrical-based spells, creating powerful surges that can overwhelm foes. Its fierce design and vibrant energy make it a perfect companion for storm-wielding mages and daring adventurers alike.", "legendary", 715),
    new ringInfo("Chromatic Nexus", "ring", "ring", ["raid"], "<:chromatic_nexus:1334268634092273785>", "https://i.ibb.co/MydshW7n/Chromatic-Nexus.png", 9, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Lightning

        const triggerChance = [20, 22.5, 22.5, 25, 25, 27.5, 27.5, 30, 30][level - 1] / 100;
        const atkMultiplier = [10, 10, 12.5, 12.5, 15, 15, 17.5, 17.5, 20][level - 1] / 100;

        // On lightning attack 20-30% chance to deal 10-20% lightning damage
        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats && options.isLightning && Math.random() < triggerChance) {
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:lightning:1340309243827458139> **${char.name}**`, { atkMultiplier, isLightning: true });
            };
        });

    }, (level) => `Each lightning strike has a **${[20, 22.5, 22.5, 25, 25, 27.5, 27.5, 30, 30][level - 1]}%** chance to trigger another lightning strike dealing **${[10, 10, 12.5, 12.5, 15, 15, 17.5, 17.5, 20][level - 1]}%** damage.`, "The Chromatic Nexus features a kaleidoscope of colors, its polished surface shimmering with iridescence. The ring is adorned with gemstones of various hues, each representing a different element—fire, water, earth, and air—surrounding a central orb that pulsates like a heartbeat. The craftsmanship is exquisite, with intricate engravings that depict mythical creatures entwined with the elements. This ring allows the user to harness elemental magic, granting them incredible versatile power in battle. Wielders often feel the ebb and flow of elemental forces when wearing it, making it a treasure for any elemental mage seeking harmony with nature.", "mythical", 716),
    new ringInfo("Conductor's Band", "ring", "ring", ["raid"], "<:conductors_band:1334319260943515698>", "https://i.ibb.co/jZsbrMGd/Conductor-s-Band.png", 7, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Lightning
        3;
        myStats.lightningMultiplier = (myStats.lightningMultiplier ?? 0) + [0.2, 0.225, 0.25, 0.275, 0.3, 0.325, 0.35][level - 1];

        // // On lightning attack: "Conductive" for 2 rounds: +25/25/30/30/35/35% lightning damage, -12/12/15/15/18/18% enemy dodge
        // matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
        //     if (caster === myStats && options.isLightning) {
        //         myStats.lightningMultiplier += [0.25, 0.25, 0.3, 0.3, 0.35, 0.35][level - 1];
        //         eStats.dodge -= [0.12, 0.12, 0.15, 0.15, 0.18, 0.18][level - 1];
        //         ebuff.dodge.push(new buffInfo("+", -[0.12, 0.12, 0.15, 0.15, 0.18, 0.18][level - 1], 2));

        //         // Reset Buff after 2 rounds
        //         myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 2, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        //             myStats.lightningMultiplier -= [0.25, 0.25, 0.3, 0.3, 0.35, 0.35][level - 1];
        //         }));
        //     };
        // });

    }, (level) => `All lightning attacks deal **${[20, 22.5, 25, 27.5, 30, 32.5, 35][level - 1]}%** more damage.`, "The Conductor's Band is a beautifully designed ring with a metallic sheen that's both sturdy and elegant. It features swirling patterns reminiscent of musical notes and currents of energy running along its length, capturing the essence of sound harmonizing with electricity. The top is accented with a sparkling gem that resonates when magic is invoked, amplifying the user's spellcasting abilities. When worn, this ring enhances the precision of spellcasting, allowing the bearer to create powerful, resonant effects. Ideal for bards and magical musicians, it serves as a bridge between sound and power, enchanting all who dare to wear it.", "legendary", 717),
    new ringInfo("Reversed Vinebound", "ring", "ring", ["chest"], "<:reversed_vinebound:1338657062208540705>", "https://i.ibb.co/zWQNsmsc/Reversed-Vinebound.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        // On Crit: Heal % of missing HP
        matchStats.on("crit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                const heal = Math.floor((myStats.maxhp - myStats.hp) * ([3, 3.5, 4, 4.5, 5][level - 1] / 100));
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, heal);
            };
        });

    }, (level) => `After dealing a critical strike, the wearer heals **${[3, 3.5, 4, 4.5, 5][level - 1]}%** of their missing HP.`, "The Reversed Vinebound ring is a striking blend of elegance and dark magic. Crafted from glossy, obsidian metal, its design includes sculpted vines that curve upwards, encasing a luminescent blue gemstone at its core. Each vine is adorned with small, jagged crystals that seem to be pulling away, representing a break from natural ties. The inner band is engraved with enigmatic runes that resonate with the wearer's inner strength and resilience. This ring empowers those who seek to break free from nature's constraints, providing buffs to spellcasting while enhancing innate abilities, making it perfect for warlocks and renegade druids.", "legendary", 718),
    new ringInfo("Storm's Caress", "ring", "ring", ["guild"], "<:storms_caress:1334558474931277827>", "https://i.ibb.co/35bQdY9g/Storm-s-Caress.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //? chest?

        myStats.lightningMultiplier += [20, 25, 30, 35, 40][level - 1] / 100;

    }, (level) => `Increases your lightning damage by **${[20, 25, 30, 35, 40][level - 1]}%** for the rest of battle.`, "Embodying the essence of tempestuous skies, the Storm's Caress ring features a swirling design adorned with delicate clouds and pinpointed flashes of light. Crafted from an ethereal silver alloy, the ring cradles a pulsating azure gem, resembling a stormy sea beneath turbulent skies. Tails of mist emanate from either side, whispering secrets of the winds. When worn, the bearer can summon gusts of wind to aid in travel or unleash thunderous rain, striking down foes from above, all while gaining poise and swiftness in combat.", "unique", 719),
    new ringInfo("Vortex Thorn", "ring", "ring", ["guild"], "<:vortex_thorn:1334560161263521812>", "https://i.ibb.co/tpsb5j6j/Vortex-Thorn.png", 3, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //? chest?

        // Deal 10/15/20% lightning dmg every round, heal 50% of lightning damage dealt
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            let lightningDMG = dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:lightning:1340309243827458139> **${char.name}**`, { isLightning: true, atkMultiplier: 0.1 + 0.05 * (level - 1) });
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, lightningDMG * 0.2);
        }, 9999));

    }, (level) => `The wearer deals **${[10, 15, 20][level - 1]}%** additional lightning damage every round and heals you for **20%** of the damage dealt.`, "The Vortex Thorn ring is a testament to the chaotic dance of nature's fury. This piece displays a dark, twisted band of obsidian, accentuated with sharp, thorny protrusions that seem alive with energy. At its heart lies a brilliant sapphire gem, swirling with internal storms that captivate the eye. This ring is favored by rogues and shadowy figures, granting its wearer the ability to manipulate temporal distortions. Those donning the ring can slip between the cracks of time, avoiding attacks and repositioning themselves in an instant.", "genesis", 720),
    new ringInfo("Sneak Attack", "ring", "ring", ["chest"], "<:sneak_attack:1334561501540909100>", "https://i.ibb.co/7ths4Kk2/Sneak-Attack.png", 3, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `⚔️ **${char.name}**`, { atkMultiplier: [0.75, 1, 1.25][level - 1], dodge: false, block: false });

    }, (level) => `At the start of the battle, the wearer hits the enemy with an attack dealing **${[75, 100, 125][level - 1]}%** damage, which can't miss.`, "The Sneak Attack ring whispers the promise of stealth and cunning. Its band features a textured design that mimics the surface of a leather-bound path, sleek and unobtrusive. Atop, a cunningly crafted dagger-shaped ornament points outward, encrusted with a dimly glowing emerald. With every flicker of light, it casts a subtle shimmer, hinting at hidden traps. When activated, this ring enhances its wearer's stealth abilities, making them nearly invisible during the night and allowing them to move unseen among their foes.", "rare", 721),
    new ringInfo("Verdant Melody", "ring", "ring", ["guild"], "<:verdant_melody:1334561565935931465>", "https://i.ibb.co/Jj1qG9nh/Verdant-Melody.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        const atkDebuff = [0.3, 0.275, 0.25, 0.225, 0.2][level - 1];

        // 0-10 rounds: -30% atk, -30% md, +30% br
        mybuff.atk.push(new buffInfo("+", -Math.floor(myStats.atk * atkDebuff), 10));
        mybuff.md.push(new buffInfo("+", -Math.floor(myStats.md * atkDebuff), 10));
        mybuff.br.push(new buffInfo("+", 0.3, 10));
        myStats.atk -= Math.floor(myStats.atk * atkDebuff);
        myStats.md -= Math.floor(myStats.md * atkDebuff);
        myStats.br += 0.3;

        // 10-40 rounds: +2% atk, +2% md, -1% br per round
        myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 10, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.atk.push(new buffInfo("*", 1.02, 9999, 0.02, "+", 1.6));
            mybuff.md.push(new buffInfo("*", 1.02, 9999, 0.02, "+", 1.6));
            mybuff.br.push(new buffInfo("*", 0.99, 9999, -0.01, "+", [0.7, 1]));
        }, 30));

    }, (level) => `For the first **10** rounds, the wearer has **${[-30, -27.5, -25, -22.5, -20][level - 1]}%** attack and magic damage and **+30%** block rate. For the next **30** rounds after the previous debuffs wear off, the wearer gains **+2%** attack and magic damage and **-1%** block rate each round.`, "Woven from the very essence of nature, the Verdant Melody ring boasts a swirling band of golden foliage, elegantly wrapping around a bright, triangular citrine gem reminiscent of the sun. Each leaf is delicately engraved with musical notes, vibrating softly to the rhythm of nature's song. This ring is a favorite among druids and bards, enhancing their connection to the forest and empowering their songs. Those who wear it can soothe wild beasts or summon nature to their aid, harmonizing their spirit with the world around them.", "unique", 722),
    new ringInfo("Shadow's Pact", "ring", "ring", ["guild"], "<:shadows_pact:1334561570000343083>", "https://i.ibb.co/XZQ78kg4/Shadow-s-Pact.png", 1, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        //! new ability

    }, (level) => `No ability yet`, "The enigmatic Shadow's Pact ring is shaped from darkened silver, twisted into a gothic design reminiscent of intertwining shadows. Adorning the band are faint runes that glow with a dim red hue, while its centerpiece—a deep obsidian stone—seems to absorb light. Whispers of ancient pacts fill the air as the ring pulses with dark energy. It grants its bearer the ability to blend seamlessly into shadows, enhancing their stealth capabilities and allowing them to communicate with shadowy entities for guidance or power.", "mythical", 723),
    new ringInfo("Amber's Dawn", "ring", "ring", ["guild"], "<:ambers_dawn:1334561580041371668>", "https://i.ibb.co/bjZqgN9h/Amber-s-Dawn.png", 9, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        // +8/9/10/11/12/13/14/15/16% max HP, 0% Dodge
        myStatsFixed.maxhp += Math.floor(myStatsFixed.maxhp * (0.08 + 0.01 * (level - 1)));
        myStats.maxhp += Math.floor(myStats.maxhp * (0.08 + 0.01 * (level - 1)));
        myStats.hp = Math.min(myStats.maxhp, myStats.hp);

        myStats.dodge = 0;
        mybuff.dodge.push(new buffInfo("=", 0, 9999));

    }, (level) => `Increases the wearer's max HP by **${[8, 9, 10, 11, 12, 13, 14, 15, 16][level - 1]}%** but reduces dodge rate to **0%**.`, "The Amber's Dawn ring radiates warmth and a sense of inner light. Its intricately designed golden band is embellished with delicate, flower-like motifs that cradle a radiant amber gem, sparkling with a gentle glow reminiscent of a rising sun. When worn, this ring provides its bearer with the blessings of vitality, enhancing their natural healing abilities and allowing them to infuse light into their surroundings, banishing shadows and inspiring hope among allies.", "rare", 724),
    new ringInfo("Barbed Glory", "ring", "ring", ["raid"], "<:barbed_glory:1334561550379515955>", "https://i.ibb.co/jvT4P74T/Barbed-Glory.png", 6, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Dusty

        // Reflects 5/7.5/10/12.5/15% damage taken back to the enemy
        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === eStats) {
                eStats.hp -= Math.floor(options.damage * (0.05 + 0.025 * (level - 1)));
            };
        });

    }, (level) => `The wearer deals **${[5, 7.5, 10, 12.5, 15][level - 1]}%** of the damage taken back to the enemy.`, "Embodying fierce tenacity and strength, the Barbed Glory ring features a blackened iron band adorned with protruding spikes and thorn-like designs, imparting a formidable presence. At its center lies a deep crimson gem, symbolizing blood and bravery. When activated, the ring allows its wearer to absorb damage, converting it into fleeting bursts of strength and unleashing retaliatory spikes against adversaries. This ring is a testament to the power of resilience and is often favored by warriors who thrive in the midst of combat.", "mythical", 725),
    new ringInfo("Necro's Grasp", "ring", "ring", ["raid"], "<:necros_grasp:1334561554045206530>", "https://i.ibb.co/MyT6nTzR/Necro-s-Grasp.png", 1, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Nekro

        // +1% atk & md per 1% missing HP (max: 10/12.5/15/17.5/20% missing HP)
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const missingHpPercent = Math.min(0.1 + 0.025 * (level - 1), (myStats.maxhp - myStats.hp) / myStats.maxhp);
            myStats.atk += Math.floor(myStats.atk * missingHpPercent);
            myStats.md += Math.floor(myStats.md * missingHpPercent);
        }, 9999));

    }, (level) => `The wearer gains **1%** attack and magic damage for every **1%** missing HP (up to **${[10, 12.5, 15, 17.5, 20][level - 1]}%**).`, "The foreboding Necro's Grasp ring is crafted from shadowy metals, entwined with ethereal wisps that emanate an unsettling glow. Designed with intricate skull motifs and green gemstones resembling glowing eyes, it whispers secrets from beyond the grave. This ring imbues its wearer with necromantic powers, enabling them to manipulate deathly energies to raise the fallen or drain vitality from foes. It is a coveted artifact for dark sorcerers seeking to wield the forces of life and death.", "legendary", 726),
    new ringInfo("Vinebound Bond", "ring", "ring", ["raid"], "<:vinebound_bond:1334561559195942984>", "https://i.ibb.co/chz7YprQ/Vinebound-Bond.png", 6, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* noHeal/ Nekro

        // HP < 50%: heal 0.85/1/1.15/1.25/1.4/1.5% max HP
        // HP >= 50%: +5% crit rate
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.hp < myStats.maxhp * 0.5) {
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * [0.0085, 0.01, 0.0115, 0.0125, 0.014, 0.015][level - 1]));
            } else {
                myStats.cr += 0.05;
            };
        }, 9999));

    }, (level) => `While the wearer's HP is less than **50%**, heals **${[0.85, 1, 1.15, 1.25, 1.4, 1.5][level - 1]}%** of max HP per round. When the wearer's HP is greater than or equal to **50%**, increases the wearer's crit rate by **5%**.`, "The Vinebound Bond ring is a verdant wonder, showcasing a band entwined with delicate emerald leaves and tiny blossoms. At its heart is a vivid green gem that reflects the essence of nature's vitality. Each leaf appears to rustle softly, as if in conversation with the living world. This ring is a symbol of unity with the earth, allowing its wearer to foster growth and harmony. It is believed to bring good fortune in harvests and encourages empathy toward all living creatures, cementing a bond with nature that strengthens with each passing day.", "unique", 727),
    new ringInfo("Shadowspire", "ring", "ring", ["raid"], "<:shadowspire:1334561562547191908>", "https://i.ibb.co/fz2PGrd1/Shadowspire.png", 3, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* noHeal

        // On own miss: -3% max HP, +3/4/5% dodge & br (max: 5 times)
        matchStats.on("miss", {
            maxUsage: 5,
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === eStats) {
                    myStats.hp -= Math.floor(myStats.maxhp * 0.03);
                    myStats.dodge += 0.03 + 0.01 * (level - 1);
                    myStats.br += 0.03 + 0.01 * (level - 1);
                    mybuff.dodge.push(new buffInfo("+", 0.03 + 0.01 * (level - 1), 9999));
                    mybuff.br.push(new buffInfo("+", 0.03 + 0.01 * (level - 1), 9999));
                    return true;
                };
            },
        });

    }, (level) => `The wearer loses HP equivalent to **3%** of their max HP every time they evade an attack, but also increases their dodge and block rate by **${[3, 4, 5][level - 1]}%** every time (up to **${[15, 20, 25][level - 1]}%**).`, "The Shadowspire ring is forged from deep steel, glimmering with an obsidian sheen that seems to absorb light. A single dark purple gem rises from the center, encased in jagged metal prongs like the claws of a ravenous beast. Twisted, barbed tendrils of shadow dance around the band, evoking the feel of coiling serpents. Those who wear Shadowspire are said to draw upon darkness itself, gaining stealth and agility in the night. An ethereal whisper can be heard when the winds howl, hinting at the power waiting to be unleashed. The ring radiates a palpable aura of mystery, making it sought after by assassins and dark sorcerers alike.", "unique", 728),
    new ringInfo("Gemweaver", "ring", "ring", ["chest"], "<:gemweaver:1338656064262115468>", "https://i.ibb.co/6RGNBM3T/Gemweaver.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        // On Crit Received: Heal 3/3.5/4/4.5/5% of missing HP
        matchStats.on("crit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === eStats) {
                const heal = Math.floor((myStats.maxhp - myStats.hp) * ([3, 3.5, 4, 4.5, 5][level - 1] / 100));
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, heal);
            };
        });

    }, (level) => `After being hit by a critical strike, the wearer heals **${[3, 3.5, 4, 4.5, 5][level - 1]}%** of their missing HP.`, "The Gemweaver ring boasts a luxurious silver base entwined with intricate vines of gold, symbolizing the harmony of nature and craftsmanship. At its heart sits a large, round emerald, backed by a delicate array of smaller gemstones in hues of purple and blue, resembling a lush garden in full bloom. The craftsmanship showcases fine details, like curling tendrils and leaf patterns that wrap around the band. Empowered by ancient magic, this ring allows its wearer to manipulate the power of gems, enhancing their spells and abilities while granting protection against elemental forces. Ideal for artisans and elementalists alike.", "legendary", 729),
    new ringInfo("Malakay's Legacy", "ring", "ring", ["raid"], "<:crimson_pulse:1336032778680143942>", "https://i.ibb.co/ksrQz96V/Crimson-Pulse.png", 7, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* noHeal

        // On own miss: -3% HP; +7.5/8.75/10% atk, +7.5/8.75/10% md for 2 turns
        matchStats.on("miss", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === eStats) {
                const atkBuff = Math.floor(myStats.atk * (0.05 + 0.0125 * (level - 1)));
                const mdBuff = Math.floor(myStats.md * (0.05 + 0.0125 * (level - 1)));

                myStats.atk += atkBuff;
                myStats.md += mdBuff;
                mybuff.atk.push(new buffInfo("+", atkBuff, 3));
                mybuff.md.push(new buffInfo("+", mdBuff, 3));

                myStats.hp -= Math.floor(myStats.hp * 0.03);

                // If dodge/block streak >= 3: +10/12.5/15/17.5/20/22.5/25% atk, md for 1 turn
                if (myStats.dodgeStreak >= 3 || myStats.blockStreak >= 3) {
                    mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.1 + 0.025 * (level - 1)), 1));
                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.1 + 0.025 * (level - 1)), 1));
                    myStats.atk += Math.floor(myStats.atk * 0.1 + 0.025 * (level - 1));
                    myStats.md += Math.floor(myStats.md * 0.1 + 0.025 * (level - 1));
                };
            };
        });

    }, (level) => `The wearer increases their ATK & MD by **${[5, 6.25, 7.5, 8.75, 10, 11.25, 12.5][level - 1]}%** for **3** rounds if they evade an attack, but also loses **3%** of current HP every time. After **3** consecutive dodges or blocks, the wearer additionally increases their ATK & MD by **${[10, 12.5, 15, 17.5, 20, 22.5, 25][level - 1]}%** for **1** round.`, "Malakai's Legacy is a broad obsidian ring adorned with intricate silver and gold patterns. Its striking centerpiece contains a pool of swirling azure energy that pulses like captured lightning, flanked by two golden medallions bearing mysterious emblems. Small crimson crystals circle the band, each glowing warmly, while ancient runes etched into the dark metal surface create an elaborate lattice of shifting symbols.", "legendary", 730),
    new ringInfo("Radiant Ember", "ring", "ring", ["raid"], "<:radiant_ember:1336036400264515756>", "https://i.ibb.co/QF7G1X7H/Radiant-Ember.png", 7, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Magma

        const cdBuff = 0.05 + 0.025 * (level - 1);
        myStats.cd += cdBuff;
        mybuff.cd.push(new buffInfo("+", cdBuff, 9999));

    }, (level) => `Increases the wearer's crit damage by **${[5, 7.5, 10, 12.5, 15, 17.5, 20][level - 1]}%**.`, "Delicately crafted, the Radiant Ember shimmers with a golden sheen, embodying the essence of fire. Its band encircles a magnificent, heart-shaped ruby that pulses with a warm, glowing light. Tiny, intricately carved flames extend from the gemstone, as if trying to escape their crystalline prison. This ring is a powerful conduit of fire magic, amplifying spells and channeling flames through its wielder. The flames are said to dance with each heartbeat, radiating warmth and courage to allies nearby. Those who wear this magnificent ring can summon protective barriers of fire, keeping enemies at bay in a dazzling display of defense.", "unique", 731),
    new ringInfo("Defenders Signet", "ring", "ring", ["raid"], "<:defenders_signet:1340489145142743120>", "https://i.ibb.co/Kx1XZj1M/Defender-s-Signet.png", 3, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Magma

        // Reduce incoming dmg by 40/45/50% for 1 turn
        matchStats.on("DEF", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                const dmgReduction = [30, 35, 40][level - 1] / 100;
                myStats.damageReduction += dmgReduction;

                myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    myStats.damageReduction -= dmgReduction;
                }));
            };
        });

    }, (level) => `Alters Defense: Reduces incoming damage by **${[30, 35, 40][level - 1]}%** for **1** turn`, "The Defender's Signet stands as a symbol of strength and protection, made of rugged iron with a broad, flat surface. It boasts a brilliant sapphire at its center, set within a circular shield-like design. Intricate engravings of armor and swords embellish the band, depicting tales of glorious battles fought by great heroes. This ring enhances the wearer's defense, creating a palpable energy that can absorb damage. When activated, glowing runes rise from the gem, encasing the wearer in a glimmering shield of ethereal light. It is favored by paladins and guardians who uphold justice and valor, making them an indomitable force against darkness.", "mythical", 732),
    new ringInfo("Glyph of Growth", "ring", "ring", ["chest"], "<:glyph_of_growth:1338654486067019827>", "https://i.ibb.co/JwKymcMJ/Glyph-of-Growth.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        // 20/22.5/25/27.5/30% counter chance on crit received
        matchStats.on("crit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            const counterChance = [20, 22.5, 25, 27.5, 30][level - 1] / 100;
            if (caster === eStats && Math.random() < counterChance && myStats.counter === 0) {
                myStats.counter += 1;
            };
        });

    }, (level) => `After being hit by a critical strike, the wearer has a **${[20, 22.5, 25, 27.5, 30][level - 1]}%** chance of countering the next attack.`, "The Glyph of Growth is a striking ring, crafted from deep green metal entwined with intricate vine patterns that hint at its nature magic. Elegant purple and vibrant green gemstones are embedded into the band, radiating a soft, ethereal glow. The centerpiece is a larger, emerald-like stone that pulses with an inner light, symbolizing the essence of life itself. Those who wear this ring experience an enhanced affinity with nature, allowing for improved communication with flora and increased powers in healing arts. Ancient runes are etched along the sides of the band, whispering secrets of plant growth and rejuvenation.", "mythical", 733),
    new ringInfo("Glass Shard", "ring", "ring", ["chest"], "<:glass_shard:1338650597821255711>", "https://i.ibb.co/j9zZPVPM/Glass-Shard.png", 7, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        // -50% max HP
        myStatsFixed.maxhp -= Math.floor(myStatsFixed.maxhp * 0.5);
        myStats.maxhp -= Math.floor(myStats.maxhp * 0.5);
        myStats.hp = Math.min(myStats.maxhp, myStats.hp);

        // +30/35/40/45/50/55/60% ATK/MD
        const buffScale = [30, 35, 40, 45, 50, 55, 60][level - 1] / 100;
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * buffScale), 9999));
        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * buffScale), 9999));
        myStats.atk += Math.floor(myStats.atk * buffScale);
        myStats.md += Math.floor(myStats.md * buffScale);

    }, (level) => `The wearer begins the battle with **50%** less max HP, but attack and magic damage are increased by **${[30, 35, 40, 45, 50, 55, 60][level - 1]}%**.`, "The Glass Shard ring captivates with its simplicity and brilliance, crafted from delicate and transparent crystal-like glass formed into razor-sharp edges. The band seems almost ethereal and wisps of light dance around it like fireflies. Adorned with shards that refract light into vibrant patterns, this piece symbolizes clarity, truth, and strength. Wearers find their perception sharpened, both in battle and in the intricacies of life. It is said that those who bear this ring gain insight into their adversaries' weaknesses, turning the odds in their favor with razor-like precision.", "mythical", 734),
    new ringInfo("Yuletide Band", "ring", "ring", ["raid"], "<:yuletide_band:1336068419509944320>", "https://i.ibb.co/mrWDF4Hj/Yuletide-Band.png", 1, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Mail

        //! TESTING

        const ATK_EMOJI = myStats.replaceButton?.atk?.emoji || '⚔️',
            DEF_EMOJI = myStats.replaceButton?.def?.emoji || '🛡️',
            ABILITY_EMOJI = myStats.replaceButton?.ability?.emoji || '✨',
            SKILL_EMOJI = myStats.replaceButton?.cskill?.emoji || '⚜️',
            SKIP_EMOJI = myStats.replaceButton?.skip?.emoji || '<:dodge_chance:1047269150948606063>';

        // Default
        const defaultButtonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled(myStats.class !== -1 ? false : true),
            new ButtonBuilder().setCustomId('SKIP').setEmoji(SKIP_EMOJI).setStyle(ButtonStyle.Secondary)
        );

        // Updated Buttons
        const updatedButtonsRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId('ATK').setEmoji('✉️').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('DEF').setEmoji('✉️').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled(myStats.class !== -1 ? false : true),
            new ButtonBuilder().setCustomId('SKIP').setEmoji(SKIP_EMOJI).setStyle(ButtonStyle.Secondary)
        );

        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % [8, 8, 7, 7, 6, 6][level - 1] === 0) {
                // every 6th turn: Update ATK/DEF to green/red envelopes
                matchStats.interaction.editReply({ components: [updatedButtonsRow] });

                // Increases CD by 50% on ATK
                matchStats.on("ATK", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                    if (caster === myStats) myStats.cd += 0.5;
                });
                // Gain 100 shield on DEF
                matchStats.on("DEF", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                    if (caster === myStats) myStats.shield += 100;
                });

                // Reset
                myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    matchStats.interaction.editReply({ components: [defaultButtonsRow] });
                }));
            };
        }, 9999));

    }, (level) => `Every **${[8, 8, 7, 7, 6, 6][level - 1]}** rounds, replaces ATK/ DEF to green/ red envelopes. ATK increases crit damage by **50%** for **1** turn. DEF gains **100** shield.`, "The Yuletide Band, infused with the spirit of celebration, is a festive creation adorned with red and green floral decorations mirroring holly leaves and berries. The golden circular band shimmers with warmth and goodwill, making it a perfect charm for the holiday season. Tiny gemstones resemble glimmering ornaments, each twinkling with a touch of magic. This whimsical ring is known to enhance the wearer's charm and charisma, spreading joy and eliciting smiles among comrades. When donned, the band radiates a festive glow, bolstering camaraderie and temporarily raising morale within a close-knit group. It shines brightest amidst celebrations, creating enchanting moments.", "unique", 735),
    new ringInfo("Scorching Oath", "ring", "ring", ["raid"], "<:scorching_oath:1336082162654642196>", "https://i.ibb.co/y9gQ609/Scorching-Oath.png", 8, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Mail

        const atkScale = [2, 2.5, 3, 3.5, 4, 4.5, 5, 5][level - 1] / 100;
        myStats.MartialMomentum = [5, 5, 5, 5, 5, 5, 5, 6][level - 1];

        // On Ability/Skill: increases atk/md by [2,2.5,3,3.5,4,4.5,5,5][level - 1]% (max: [10,12.5,15,17.5,20,22.5,25,30]%)
        matchStats.on("ABILITY", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats && myStats.MartialMomentum > 0) {
                myStats.MartialMomentum--;
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * atkScale), 9999));
                mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * atkScale), 9999));
                myStats.atk += Math.floor(myStats.atk * atkScale);
                myStats.md += Math.floor(myStats.md * atkScale);
            };
        });
        matchStats.on("CSKILL", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats && myStats.MartialMomentum > 0) {
                myStats.MartialMomentum--;
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * atkScale), 9999));
                mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * atkScale), 9999));
                myStats.atk += Math.floor(myStats.atk * atkScale);
                myStats.md += Math.floor(myStats.md * atkScale);
            };
        });

    }, (level) => `Increases the wearer's damage by **${[2, 2.5, 3, 3.5, 4, 4.5, 5, 5][level - 1]}%** after every ability or skill usage (up to **${[5, 5, 5, 5, 5, 5, 5, 6][level - 1]}** times).`, "The Scorching Oath ring emanates an intense heat, forged from volcanic rock and embedded with a fiery orange gem that resembles molten lava. The band is intricately designed to resemble swirling magma flows, capped by a copper filigree that catches fiery glimmers. Wearing this ring increases the bearer's fire-based abilities considerably, allowing them to wield flames like a master mage. When the oath is invoked, the band glows fiercely, leaving a trailing fire-like symbol behind, marking its pact. This ring is destined for fire sorcerers and warriors seeking to create unyielding bonds to their fiery resolve on the battlefield.", "legendary", 736),
    new ringInfo("Scripted Circle", "ring", "ring", ["raid"], "<:scripted_circle:1336299841181192215>", "https://i.ibb.co/GBhtJPH/Scripted-Circle.png", 6, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Mail

        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (Math.random() < ([20, 24, 28, 32, 36, 40][level - 1] / 100)) {
                const rand = Math.random();
                if (rand < 0.4) { // Decreases enemy DEF and MR by 20%
                    notice.push(`\n<:love_letter:1340483824248950939> **${char.name}** sent a love letter to **${enemy.name}**!`);
                    eStats.def -= Math.floor(eStats.def * 0.2);
                    eStats.mr -= Math.floor(eStats.mr * 0.2);
                } else if (rand < 0.8) { // Increases damage by 20%
                    notice.push(`\n<:complaint_letter:1340484041140604988> **${char.name}** sent a complaint letter to **${enemy.name}**!`);
                    myStats.atk += Math.floor(myStats.atk * 0.2);
                    myStats.md += Math.floor(myStats.md * 0.2);
                } else { // Stuns enemy for 1 turn
                    notice.push(`\n<:termination_letter:1340483926665203792> **${char.name}** sent a termination letter to **${enemy.name}**!`);
                    matchStats.twinshot = 1;
                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        matchStats.twinshot = 0;
                    }));
                };
            };
        }, 9999));

    }, (level) => `Every round there is a **${[20, 24, 28, 32, 36, 40][level - 1]}%** chance to send one of the following letters:\n- __Love Letter__: Decreases enemy DEF and MR by **20%** for that round.\n- __Complaint Letter__: Increases damage by **20%** for that round.\n- __Termination Letter__: Your next attack is cast twice.`, "The Scripted Circle is crafted from ornate silver, resembling an ancient tome wrapped around the finger. At its center rests an open book, its pages inscribed with glowing runes that sparkle with knowledge. The band is adorned with intricate scrollwork that expresses motion, emphasizing the fluidity of written magic. This ring bestows an unparalleled connection to the mystical arts, amplifying one's spellcasting ability and granting access to forgotten lore. In moments of need, the pages flutter as if caught in an unseen breeze, whispering secrets to its bearer. Scholars and mages alike revere this ring for its wisdom and boundless potential for knowledge.", "mythical", 737),
    new ringInfo("Harmony's Edge", "ring", "ring", ["raid"], "<:harmonys_edge:1336486295320526969>", "https://i.ibb.co/zhz7WrB6/Harmony-s-Edge.png", 7, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Mail

        // +10/12.5/15/17.5/20/22.5/25% ATK/MD (2 rounds)
        matchStats.on("ATK", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats && matchStats.round % 4 === 0) {
                const buffScale = [10, 12.5, 15, 17.5, 20, 22.5, 25][level - 1] / 100;
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * buffScale), 2));
                mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * buffScale), 2));
                myStats.atk += Math.floor(myStats.atk * buffScale);
                myStats.md += Math.floor(myStats.md * buffScale);
            };
        });

        // +10/12/14/16/18/19/20% BR (2 rounds)
        matchStats.on("DEF", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats && matchStats.round % 4 === 0) {
                const buff = [10, 12, 14, 16, 18, 19, 20][level - 1] / 100;
                mybuff.br.push(new buffInfo("+", buff, 2));
                myStats.br += buff;
            };
        });

        // dealDamage 15/17.5/20/22.5/25/27.5/30% dmg
        matchStats.on("ABILITY", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats && matchStats.round % 4 === 0) {
                const atkMultiplier = [15, 17.5, 20, 22.5, 25, 27.5, 30][level - 1] / 100;
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier });
            };
        });

        // heal 5/5.5/6/6.5/7/7.5/8% max hp
        matchStats.on("CSKILL", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats && matchStats.round % 4 === 0) {
                const healScale = [5, 5.5, 6, 6.5, 7, 7.5, 8][level - 1] / 100;
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * healScale));
            };
        });

    }, (level) => `Actions on every **4th** round grant the wearer additional effects:\n- **ATK**: Increases ATK & MD by **${[10, 12.5, 15, 17.5, 20, 22.5, 25][level - 1]}%** for **2** turns.\n- **DEF**: Increase Block Rate by **${[10, 12, 14, 16, 18, 19, 20][level - 1]}%** for **2** turns.\n- **ABILITY**: Does an additional attack dealing **${[15, 17.5, 20, 22.5, 25, 27.5, 30][level - 1]}%** damage.\n- **SKILL**: Heals **${[5, 5.5, 6, 6.5, 7, 7.5, 8][level - 1]}%** of max HP.`, "Crafted from intertwining silver vines, Harmony's Edge glimmers softly under the light. Its centerpiece is a large, verdant gemstone that radiates a calming aura, infused with emerald hues reminiscent of tranquil forests. Delicate filigree patterns spiral around the band, symbolizing unity and balance. This ring offers protection against chaos, enhancing the wearer's affinity for nature and harmony. Legends speak of its ability to soothe conflicts, making it a cherished relic among peacekeepers and druids alike. With its majestic beauty and profound significance, this ring becomes a testament to the bond between nature and mankind.", "legendary", 738),
    new ringInfo("Tenebris Diadem", "ring", "ring", ["raid"], "<:tenebris_diadem:1336487284861698128>", "https://i.ibb.co/mF9ZPwyJ/Tenebris-Diadem.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Nekro

        // Decrease DEF/MR by 30%; Increase ATK/MD by 20/22.5/25/27.5/30%
        myStats.delayedBuffs.push(new delayedBuffs([9, 10, 11, 12, 13][level - 1], (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            const atkScale = [20, 22.5, 25, 27.5, 30][level - 1] / 100;
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * atkScale), 9999));
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * atkScale), 9999));
            myStats.atk += Math.floor(myStats.atk * atkScale);
            myStats.md += Math.floor(myStats.md * atkScale);

            mybuff.def.push(new buffInfo("+", -Math.floor(myStats.def * 0.3), 9999));
            mybuff.mr.push(new buffInfo("+", -Math.floor(myStats.mr * 0.3), 9999));
            myStats.def -= Math.floor(myStats.def * 0.3);
            myStats.mr -= Math.floor(myStats.mr * 0.3);
        }, 9999));

    }, (level) => `After the **${[9, 10, 11, 12, 13][level - 1]}th** round, decreases the wearer's DEF & MR by **30%** but increases ATK & MD by **${[20, 22.5, 25, 27.5, 30][level - 1]}%**.`, "Nyarlathos' Bane is a ring of impossible geometries, its obsidian band adorned with writhing tendrils that cradle a gem of unknowable depth. Ancient symbols spiral along its surface, each one shifting subtly when studied too long, while tiny crystalline eyes seem to blink when unwatched. Those who wear it gain glimpses of cosmic knowledge, but at the cost of being forever watched by something that dwells beyond the veil of reality.", "mythical", 739),
    new ringInfo("Fury of the Abyss", "ring", "ring", ["raid"], "<:fury_of_the_abyss:1336496045265522739>", "https://i.ibb.co/HTrvVGsM/Fury-of-the-Abyss.png", 9, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Nekro

        // Every 4th round: Only ATK, 20% more damage
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const ATK_EMOJI = myStats.replaceButton?.atk?.emoji || '⚔️',
                DEF_EMOJI = myStats.replaceButton?.def?.emoji || '🛡️',
                ABILITY_EMOJI = myStats.replaceButton?.ability?.emoji || '✨',
                SKILL_EMOJI = myStats.replaceButton?.cskill?.emoji || '⚜️',
                SKIP_EMOJI = myStats.replaceButton?.skip?.emoji || '<:dodge_chance:1047269150948606063>';

            const buttons = [
                new ButtonBuilder().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled(myStats.class !== -1 ? false : true),
                new ButtonBuilder().setCustomId('SKIP').setEmoji(SKIP_EMOJI).setStyle(ButtonStyle.Secondary)
            ];

            if (matchStats.round % 4 === 0) {
                // Disable every button excluding ATk, SKIP
                buttons[1].setDisabled(true); buttons[2].setDisabled(true); buttons[3].setDisabled(true);
                const updatedRow = new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
                matchStats.interaction.editReply({ components: [updatedRow] });

                // Buffs: +20/22.5/25/27.5/30/32.5/35/37.5/40% ATK/MD
                const atkScale = [20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40][level - 1] / 100;
                myStats.atk += Math.floor(myStats.atk * atkScale);
                myStats.md += Math.floor(myStats.md * atkScale);
            } else if (matchStats.round % 4 === 1) {
                // Recover buttons
                const updatedRow = new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons);
                matchStats.interaction.editReply({ components: [updatedRow] });
            };
        }, 9999));

    }, (level) => `Every 4th round, the wearer is overcome with bloodlust, forced to attack, but deals **${[20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5, 40][level - 1]}%** more damage.`, "Fury of the Abyss is a striking ring, designed as if it were forged from the remnants of a dying star. Its band is obsidian-black, adorned with flames of crimson and onyx that seem to flicker and dance, culminating in a central deep red gem that radiates intense heat. The fiery motif hints at its volatile nature, empowering its wearer with raw, primal rage. This ring not only amplifies combat prowess but also ignites the inner fury of its possessor, making it a favored artifact among warriors who wish to harness their anger for overwhelming strikes on the battlefield.", "unique", 740),
    new ringInfo("Vile Revenant", "ring", "ring", ["raid"], "<:vile_revenant:1336499647971328055>", "https://i.ibb.co/tPb3Nr6y/Vile-Revenant.png", 4, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Nekro

        // On Revival: immortal for 2/3/4/5 rounds, +25/30/35/40% ATK/MD, dies after that
        //? Health DoT
        myStats.rev = 1;
        myStats.revhp = 0.1;
        matchStats.on("revival", {
            maxUsage: 1,
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats) {
                    const atkBuff = [25, 30, 35, 40][level - 1] / 100;
                    mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * atkBuff), 9999));
                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * atkBuff), 9999));
                    myStats.atk += Math.floor(myStats.atk * atkBuff);
                    myStats.md += Math.floor(myStats.md * atkBuff);

                    myStats.damageReduction = 1;
                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + [2, 3, 4, 5][level - 1], (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        myStats.damageReduction = 0;
                        myStats.hp = 0;
                    }));

                    return true;
                };
            },
        });

    }, (level) => `After dying, the undying corpse of the wearer seeks revenge. During the next **${[2, 3, 4, 5][level - 1]}** rounds, the revived wearer is immune to active damages and increases the wearer's ATK & MD by **${[25, 30, 35, 40][level - 1]}%, but dies after the rounds end.`, "Crafted from a curious amalgam of shadowy metal and crimson-tinted gems, the Vile Revenant ring possesses an unsettling beauty. Its design features sharp, jagged edges that resemble bone fragments, giving it an eerie, formidable appearance. The central gem pulses a sinister glow, mirroring the essence of those lost to darkness. Adorned with faint, swirling symbols that tell tales of undying spirits, this ring serves as a conduit for necromantic energies. Wearers gain the ability to commune with the departed, yet at the risk of drawing their own spirit towards the realm of the forgotten.", "legendary", 741),
    new ringInfo("Elemental Conflux", "ring", "ring", ["raid"], "<:elemental_conflux:1336501924505321564>", "https://i.ibb.co/9kyxXLPK/Elemental-Conflux.png", 7, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Cakey

        // When HP < 50%: Heal 18/22/24/26/28/30% max HP
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.hp < myStats.maxhp * 0.5) {
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * [0.18, 0.2, 0.22, 0.24, 0.26, 0.28, 0.3][level - 1]));

                //@ts-ignore
                this._used++;
            };
        }, 9999, 1));

    }, (level) => `When the wearer's HP falls below **50%** for the first time, restores **${[18, 20, 22, 24, 26, 28, 30][level - 1]}%** max HP.`, "The Elemental Conflux shimmers with a breathtaking blend of colors, each hue representing the primal elements of fire, water, air, and earth. Delicate, metallic filigree weaves together around a central gemstone that radiates a soft glow. The brilliantly crafted shapes dance like the elements themselves, forever shifting in a harmonious interplay. This ring amplifies elemental magics, empowering the caster with the forces of nature, allowing them to invoke storms, tremors, and tidal waves. Those who wear it become seamless conduits of elemental fury, their powers limited only by their mastery over nature's might.", "legendary", 742),
    new ringInfo("Toxic Enigma", "ring", "ring", ["raid"], "<:toxic_enigma:1336502504892010518>", "https://i.ibb.co/KxvpNtQD/Toxic-Enigma.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Cakey

        myStatsFixed.maxhp -= Math.floor(myStatsFixed.maxhp * 0.2);
        myStats.maxhp -= Math.floor(myStats.maxhp * 0.2);
        myStats.hp = Math.min(myStats.maxhp, myStats.hp);

        const atkMultiplier = [20, 22.5, 25, 27.5, 30][level - 1] / 100;

        // magical hits: additional 30% MD hit
        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats && options.isMagicDamage && !(myStats.toxicEnigmaRoundUsed !== matchStats.round)) {
                myStats.toxicEnigmaRoundUsed = matchStats.round;
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier, magicDamage: true, mdChance: -1 });
            };
        });

    }, (level) => `Reduces max HP by **20%**, but follows up any magical hits with an additional attack dealing **${[20, 22.5, 25, 27.5, 30][level - 1]}%** magic damage (at most once per round).`, "The Toxic Enigma enthralls with its grotesquely beautiful design, the dark metal resembling twisted roots enveloping a vibrant green orb that pulses with a venomous light. Strange, delicate patterns cascade around the band, hinting at forbidden knowledge and alchemical secrets. This ring grants its wearer the power to manipulate poison, enhancing efficacy and creating virulent concoctions. However, the knowledge it offers is perilous; every use of its powers sows the seeds of decay within the user—mind and body alike. A perfect artifact for rogue alchemists or dark sorcerers, it walks the razor's edge between power and madness.", "legendary", 743),
    new ringInfo("Enchanter's Sigil", "ring", "ring", ["raid"], "<:enchanters_sigil:1336504712572305478>", "https://i.ibb.co/0VjRRfCh/Enchanter-s-Sigil.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Dusty

        myStats.damageReduction = Math.min(0.2, eStats.cr * [0.2, 0.25, 0.3, 0.35, 0.4][level - 1]);

        eStats.cr = 0;
        ebuff.cr.push(new buffInfo("=", 0, [2, 3, 4, 5, 6][level - 1]));

    }, (level) => `Lowers the enemy's crit rate to **0%** for the first **${[2, 3, 4, 5, 6][level - 1]}** rounds. For every **1%** lost this way, increases the wearer's damage reduction by **${[0.2, 0.25, 0.3, 0.35, 0.4][level - 1]}%** (up to **20%**).`, "With its elaborate designs skillfully carved into shimmering silver, the Enchanter's Sigil stands out as a symbol of arcane mastery. The centerpiece features a vibrant green gemstone, sparkling with a mystical aura and surrounded by ornate engravings that seem to shift like living magic. This ring empowers spellcasting, enhancing the potency and resilience of arcane spells. Those who wear it become masterful enchanters, capable of embedding potent magic into weapons and artifacts. The ring's beauty belies its unmatched power, making it a coveted item among those who walk the path of the arcane.", "mythical", 744),
    new ringInfo("Aqua Serpent", "ring", "ring", ["raid"], "<:aqua_serpent:1336507449355665429>", "https://i.ibb.co/0RWgfmNb/Aqua-Serpent.png", 6, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Dusty

        // MD debuff on miss
        matchStats.on("miss", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                const mdDebuff = Math.floor(eStats.md * [20, 22, 24, 26, 28, 30][level - 1] / 100);
                ebuff.md.push(new buffInfo("+", -mdDebuff, 2));
                eStats.md -= mdDebuff;
            };
        });

    }, (level) => `After the wearer misses an attack, decreases the enemy's MD by **${[20, 22, 24, 26, 28, 30][level - 1]}%** for 2 rounds.`, "The Aqua Serpent ring features a stunning wrap-around design, mirroring the sinuous form of a serpent made of shimmering ocean-blue materials. Its band glistens as if it were polished by the waves, while an azure gemstone–shaped like a serpent's heart–rests as its centerpiece. The ring radiates a calming aura, allowing the wearer to commune with water elementals and control water's flow. Embellished with silver scales etched with intricate oceanic patterns, it is a prized possession for those who traverse the waters or seek harmony with the aquatic realms, enhancing their affinity for the sea.", "legendary", 745),
    new ringInfo("Starlit Whirl", "ring", "ring", ["guild"], "<:starlit_whirl:1336655984659271700>", "https://i.ibb.co/0VFf8r7V/Starlit-Whirl.png", 6, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        // On eCrit: Steal 5% CR
        matchStats.on("crit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === eStats && eStats.cr > 0) {
                const steal = Math.min([0.03, 0.03, 0.04, 0.04, 0.05, 0.05][level - 1], eStats.cr);
                myStats.cr += steal;
                eStats.cr -= steal;
                mybuff.cr.push(new buffInfo("+", steal, [4, 5, 5, 6, 6, 7][level - 1]));
                ebuff.cr.push(new buffInfo("+", -steal, [4, 5, 5, 6, 6, 7][level - 1]));
            };
        });

    }, (level) => `Upon receiving a critical hit, the wearer steals **${[3, 3, 4, 4, 5, 5][level - 1]}%** crit rate from the enemy, lasting **${[4, 5, 5, 6, 6, 7][level - 1]}** rounds.`, "The smooth, iridescent band of the Starlit Whirl glimmers with ethereal colors resembling a night sky filled with shimmering stars. Elegantly spiraled arms cradle a mesmerizing gem that captures light like a celestial body, reflected in its depths. The enchanting design embodies the essence of cosmic beauty, evoking whispers of lost constellations and ancient prophecies. This ring enhances the wearer's connection to the cosmos, granting visions of alternate realities and the ability to draw upon celestial magic. Worn by oracles and stargazers, this ring serves as a bridge to the mysteries of the universe.", "legendary", 746),
    new ringInfo("Drakul's Thirst", "ring", "ring", ["raid"], "<:drakuls_thirst:1336659107091841034>", "https://i.ibb.co/JWhjNFHX/Drakul-s-Thirst.png", 6, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Drain

        // Drain: 1/1.2/1.4/1.6/1.8/2% HP
        const drainAmount = Math.floor(myStats.hp * ([1, 1.2, 1.4, 1.6, 1.8, 2][level - 1] / 100));
        ebuff.hp.push(new buffInfo("+", -drainAmount, 9999));

        // Converts 50% of the drain to ATK/MD / cap: 10% ATK/MD
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const buffCap = [10, 11, 12, 13, 14, 15][level - 1] / 100;
            myStats.atk += Math.floor(Math.min(myStats.atk * buffCap, drainAmount));
            myStats.md += Math.floor(Math.min(myStats.md * buffCap, drainAmount));
        }, 9999));

    }, (level) => `Every round, the wearer drains the equivalent of **${[1, 1.2, 1.4, 1.6, 1.8, 2][level - 1]}%** of their max HP from the enemy and converts **50%** of the drained HP to ATK & MD. This buff stays for **1** round, and can be no more than **${[10, 11, 12, 13, 14, 15][level - 1]}%** of your ATK/MD.`, "Drakul's Thirst is a dark, foreboding ring made of twisted, sinister metal that seems to writhe and pulse with a life of its own. Enveloping a hauntingly beautiful crimson gem that appears to hold swirling liquid within, the band is adorned with grotesque tendrils that seem to reach out as if yearning to latch onto the wearer's spirit. This malevolent ring offers tremendous power to drain vitality from foes, allowing the wearer to replenish their own life force. However, each use deepens the bond between ring and wearer, threatening to consume their very essence. Only the dauntless dare wield this potent artifact.", "mythical", 747),
    new ringInfo("Jade Talon", "ring", "ring", ["raid"], "<:jade_talon:1336680897742639124>", "https://i.ibb.co/YB09qthh/Jade-Talon.png", 6, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Drain

        // Drain 1% max HP on ATK
        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                const drain = Math.floor(myStats.maxhp * ([0.3, 0.4, 0.5, 0.6, 0.7, 0.75][level - 1] / 100));

                myStats.hp += drain;
                if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;

                eStats.hp -= drain;
                if (eStats.hp < 0) eStats.hp = 0;
            };
        });

    }, (level) => `The wearer drains **${[0.3, 0.4, 0.5, 0.6, 0.7, 0.75][level - 1]}%** of their max HP from the enemy with every successful hit.`, "The Jade Talon ring boasts a fearsome design, reminiscent of a predatory bird's claw. Crafted from darkened silver, its band bears twisting, barbed tendrils that intertwine and ascend toward a striking jade centerpiece. The gem glimmers with an inner light, pulsating green hues that evoke the essence of nature's spirit. Surrounding the central stone, smaller emerald shards are embedded, enhancing its fierce aura. When worn, this ring grants enhanced agility and a keen sense for danger, making it sought after by both warriors and rogues. Legends say that the wearer can channel their inner beast, tapping into primal instincts with each heartbeat.", "legendary", 748),
    new ringInfo("The Prism Sovereign", "ring", "ring", ["guild"], "<:the_prism_sovereign:1337806356111167628>", "https://i.ibb.co/5W4CDPJR/The-Prism-Sovereign.png", 8, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        // If no active ability/skill was used for 30 rounds, 20/22/24/26/28/30/32/33% chance to twinshot
        myStats.delayedBuffs.push(new delayedBuffs(30, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (!myStats.activeUsed) {
                matchStats.twinshot = [20, 22, 24, 26, 28, 30, 32, 33][level - 1] / 100;
            };
        }));

        matchStats.on("ABILITY", {
            maxUsage: 1,
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats && myStats.MartialMomentum > 0) {
                    myStats.activeUsed = true;
                    return true;
                };
            },
        });
        matchStats.on("CSKILL", {
            maxUsage: 1,
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats && myStats.MartialMomentum > 0) {
                    myStats.activeUsed = true;
                    return true;
                };
            },
        });

    }, (level) => `If the wearer uses no active ability or skill during the first **30** rounds, their attacks gain a **${[20, 22, 24, 26, 28, 30, 32, 33][level - 1]}%** chance to strike twice for the rest of the fight.`, "The Prism Sovereign is a majestic ring that captures the essence of a kaleidoscope in its design. Set in an ornate gold band, this magnificent piece features an array of colorful gemstones, including sapphires, emeralds, and garnets, each skillfully positioned to reflect light in dazzling patterns. The intricate swirls of the band symbolize the flow of magic, and at its center rests a resplendent aquamarine that seems to shimmer with a watery glow. Wearing this ring enhances a mage's spellcasting capabilities, allowing for spontaneous bursts of elemental power. Rumored to contain the soul of an ancient sorcerer, it grants wisdom and resilience against magical interference.", "legendary", 749),
    new ringInfo("Aurelian Twinkeeper", "ring", "ring", ["guild"], "<:aurelian_twinkeeper:1337936525467455608>", "https://i.ibb.co/rRfVRQ5Q/Aurelian-Twinkeeper.png", 4, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        matchStats.twinshot ||= 0;
        matchStats.twinshot += [12.5, 15, 17.5, 20][level - 1];

    }, (level) => `The wearer's attacks have a **${[12.5, 15, 17.5, 20][level - 1]}%** chance to strike twice.`, "The Aurelian Twinkeeper is a splendid ring, crafted in gleaming bronze with intricate scrollwork that spirals around its band like wisps of light. Embedded within are delicate azure gems that resemble stars frozen in time, creating an enchanting twilight effect. At the heart lies a radiant yellow gemstone, capturing the essence of a perpetual dawn. This ring is not only a symbol of elegance but also a beacon of hope in dark times, granting the wearer the ability to illuminate their surroundings and inspire courage in allies. It is said that those who wear the Aurelian Twinkeeper can manipulate light to daze their foes.", "genesis", 750),
    new ringInfo("Crimson Warden", "ring", "ring", ["chest"], "<:crimson_warden:1337937042868408431>", "https://i.ibb.co/HLnGrhH2/Crimson-Warden.png", 4, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        myStats.cwUsed = false;
        myStats.cwStreak = 0;

        // When HP < 50%, ATK/MD: +3/4/5/6%
        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.hp >= myStats.maxhp * 0.5) {
                myStats.cwUsed = false;
            } else if (!myStats.cwUsed && myStats.cwStreak < 8) {
                myStats.cwUsed = true;
                myStats.cwStreak++;

                const buff = [3, 4, 5, 6][level - 1] / 100;
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * buff), 9999));
                mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * buff), 9999));
                myStats.atk += Math.floor(myStats.atk * buff);
                myStats.md += Math.floor(myStats.md * buff);
            };
        }, 9999));

    }, (level) => `Every time the wearer's HP falls below **50%**, they gain **${[3, 4, 5, 6][level - 1]}%** attack and magic damage (up to **8** times).`, "The Crimson Warden radiates a formidable presence with its dark obsidian band, serrated with sharp spikes that echo a warrior's armor. At the summit rests a fiery red gem, glowing ominously as if containing the very heart of a dragon. Smaller rubies cascade down the sides, evoking the image of bloodshed and perseverance. This ring is a potent talisman for guardians, granting unmatched strength and fortitude. When called upon, the wearer can summon protective barriers of radiant energy, making it a revered artifact among those who defend the innocent against dark forces.", "legendary", 751),
    new ringInfo("Nirvathis", "ring", "ring", ["guild"], "<:nirvathis:1337940937464221716>", "https://i.ibb.co/bjKkVmYS/Nirvathis.png", 9, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        myStats.rev += [10, 15, 20, 25, 30, 35, 40, 45, 50][level - 1] / 100;
        myStats.revhp = 1;

    }, (level) => `Increases the wearer's revival chance by **${[10, 15, 20, 25, 30, 35, 40, 45, 50][level - 1]}%**. The wearer revives at full HP.\n\nNote that this ring alone will **not** revive the wearer.`, "The Lazarus Echo is a ring that bridges the gap between life and death. Its ethereal silver band ripples like water caught in moonlight, adorned with spiraling runes of resurrection that seem to whisper ancient secrets. At its center pulses a remarkable gem that shifts between brilliant daylight and gentle dusk, its glow reflecting the eternal cycle of death and rebirth. Those who wear it claim to hear the echoing whispers of souls who have returned from death's embrace, their stories forever preserved within this powerful artifact that offers a second chance to the worthy.", "legendary", 752),
    new ringInfo("Glacial Crest", "ring", "ring", ["guild"], "<:glacial_crest:1337943895803433131>", "https://i.ibb.co/0ydvRYhq/Glacial-Crest.png", 3, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        // On Revival: +1/2/3💧 MG
        matchStats.on("revival", {
            maxUsage: 1,
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats) {
                    const mgBuff = [1, 2, 3][level - 1];
                    mybuff.mg.push(new buffInfo("+", mgBuff, 9999));
                    myStats.mg += mgBuff;

                    return true;
                };
            },
        });

    }, (level) => `After the first successful revival, increases the wearer's mana generation by **${[1, 2, 3][level - 1]}💧**`, "The Glacial Crest embodies the essence of winter's chill. Its band is crafted from a lustrous silver that mirrors the frost on a glacier, with delicate engravings of swirling snowflakes. The centerpiece features a dazzling turquoise gem, emanating an icy glow that captivates the onlooker. Embedded around it are smaller diamonds, resembling frost forming on leaves. This ring grants its wearer the power to harness ice magic, creating barriers of frost and controlling the temperature of their surroundings. It is often sought after by those who dwell in the northern realms, where the cold is both a weapon and a shield.", "legendary", 753),
    new ringInfo("Ring of the Lone Swan", "ring", "ring", ["chest"], "<:ring_of_the_lone_swan:1337944846656081966>", "https://i.ibb.co/Zzsd3Pyf/Ring-of-the-Lone-Swan.png", 7, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        myStats.maxRevivals += 1;
        myStats.rev += [20, 25, 30, 35, 40, 45, 50][level - 1] / 100;
        myStats.revhp += 0.3;

        // On Revival: +1/1.25/1.5/1.75/2/2.25/2.5% Lifesteal
        matchStats.on("revival", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                myStats.selfhealChance.push(1);
                myStats.selfheal.push([1, 1.25, 1.5, 1.75, 2, 2.25, 2.5][level - 1] / 100);
            };
        });

    }, (level) => `The wearer has a **${[20, 25, 30, 35, 40, 45, 50][level - 1]}%** chance to revive after their first death. After reviving, attacks heal the wearer by **${[1, 1.25, 1.5, 1.75, 2, 2.25, 2.5][level - 1]}%** of the damage dealt.`, "The Ring of the Lone Swan showcases a breathtakingly delicate design, featuring a swirling band of pearly white that mimics flowing water. Atop the ring rests a gracefully sculpted swan, its wings elegantly outstretched as if taking flight. The mesmerizing detail captures the tranquil essence of a serene lake, adorned with shimmering blue gems that resemble droplets of water. This ring grants its wearer the power of swiftness and grace. Legends say it bestows an aura of calmness in the midst of chaos, often found among those who seek serenity or aspire to inspire others through artistry and poise.", "mythical", 754),
    new ringInfo("Abyssal Bloom", "ring", "ring", ["guild"], "<:abyssal_bloom:1337947536920416306>", "https://i.ibb.co/b594j5c1/Abyssal-Bloom.png", 3, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        const amount = Math.floor(myStats.maxhp * [2, 3, 4][level - 1] / 100);
        const hpDebuff = new buffInfo("+", -amount, 9999);
        mybuff.hp.push(hpDebuff);

        matchStats.on("revival", {
            maxUsage: 1,
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats) {
                    // Remove old debuff
                    casterBuff.hp = casterBuff.hp.filter((buff) => buff.id !== hpDebuff.id);

                    // Push new buff 
                    casterBuff.hp.push(new buffInfo("+", amount, 9999));

                    return true;
                };
            },
        });

    }, (level) => `The wearer loses **${[2, 3, 4][level - 1]}%** of their max HP every round. However, after a successful revival, the wearer no longer loses but instead recovers said **${[2, 3, 4][level - 1]}%** of max HP every round.`, "Abyssal Bloom is a hauntingly beautiful piece that encapsulates the mysteries of unseen depths. Its band is crafted from darkened silver, entwined with tangled vines that appear alive, each adorned with small emeralds resembling dew drops. At its heart lies a glowing blue crystal, resembling the rarest flower blooming in the depths of an abyss. Worn by dark druids and sorcerers, this ring enhances the user's connection to the arcane mysteries of nature. It whispers secrets of the ancient ocean, allowing the wearer to summon tidal waves or ensnare enemies in vines, making it a prized possession among those who thrive in darkness.", "genesis", 755),
    new ringInfo("Mariner's Halo", "ring", "ring", ["guild"], "<:mariners_halo:1340469222819627078>", "https://i.ibb.co/TD1xF9LC/Mariner-s-Halo.png", 9, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        // On 1st Ability: deal 80/90/100/110/120/130/140/150/160% dmg 
        matchStats.on("ABILITY", {
            maxUsage: 1,
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats) {
                    const atkMultiplier = [80, 90, 100, 110, 120, 130, 140, 150, 160][level - 1] / 100;
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier, magicDamage: true });
                    return true;
                };
            },
        });

    }, (level) => `The wearer's first ability usage follows up with a **${[80, 90, 100, 110, 120, 130, 140, 150, 160][level - 1]}%** damage strike.`, "The Mariner's Halo is a radiant ring that epitomizes the spirit of the open sea. Crafted from corroded gold, its design embodies the flowing movements of waves, with elegant seashell motifs etched along its band. At its center lies a lustrous aquamarine, capturing the essence of the ocean depths, surrounded by a halo of small pearls that shimmer like stars. When worn, it enhances the wearer's affinity for water magic, enabling them to command the tides and communicate with sea creatures. This ring is revered by sailors and sea witches alike, said to protect its bearer from storms and guide them to safe shores.", "legendary", 756),
    new ringInfo("Galaxy's Embrace", "ring", "ring", ["guild"], "<:galaxys_embrace:1338627099178696787>", "https://i.ibb.co/67FsSkQ1/Galaxy-s-Embrace.png", 6, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        myStats.geLastAbilityRoundUsed = 0;
        matchStats.on("ABILITY", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                // Update last ability use
                myStats.geLastAbilityRoundUsed = matchStats.round;
            };
        });

        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // After not using ability for 15/14/13/12/11/10+ turns: recover 50/60/70/80/90/100 mana, +1/1.2/1.4/1.6/1.8/2% lifesteal 
            if (matchStats.round - myStats.geLastAbilityRoundUsed >= [15, 14, 13, 12, 11, 10][level - 1]) {
                // Recover mana
                myStats.sm += [50, 60, 70, 80, 90, 100][level - 1];
                if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;

                // Selfheal
                myStats.selfhealChance.push(1);
                myStats.selfheal.push([1, 1.2, 1.4, 1.6, 1.8, 2][level - 1] / 100);

                //@ts-expect-error
                this._used++;
            };
        }, 9999, 1));

    }, (level) => `After not having used ability ✨ for **${[15, 14, 13, 12, 11, 10][level - 1]}** turns straight, the wearer recovers **${[50, 60, 70, 80, 90, 100][level - 1]}**💧 mana and attacks start healing **${[1, 1.2, 1.4, 1.6, 1.8, 2][level - 1]}%** of the damage dealt.`, "The Galaxy's Embrace ring is a splendid marvel of arcane craftsmanship, featuring a sleek obsidian band adorned with intricate silver filigree resembling swirling galaxies. Nestled in its heart is a staggering starstone, a luminous gem that radiates an otherworldly glow, shifting colors as if capturing the essence of the cosmos itself. Surrounding the central stone are twinkling smaller jewels that appear like distant stars. Worn by cosmic mages and celestial knights, this ring enhances the wearer's ability to tap into cosmic energy, allowing them to manipulate time and space. Legends tell of those who, while donning this ring, have glimpsed the fabric of reality itself.", "legendary", 757),
    new ringInfo("Radiant Spike", "ring", "ring", ["guild"], "<:radiant_spike:1338627362119487529>", "https://i.ibb.co/8WWHKJq/Radiant-Spike.png", 5, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        const buffScale = [2.5, 2.75, 3, 3.25, 3.5][level - 1] / 100;
        myStats.rsBuffs = [];

        // On Crit: raise ATk/MD
        // Else: Deal damage and reset stacks
        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                const stackedBuffs = myStats.rsBuffs.length;

                if (!options.isCrit) {
                    if (stackedBuffs > 0) dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:radiant_spike:1338627362119487529> **${char.name}**`, { atkMultiplier: stackedBuffs * buffScale, magicDamage: true });

                    // Reset buffs
                    mybuff.atk = mybuff.atk.filter((buff) => !myStats.rsBuffs.includes(buff.id));
                    mybuff.md = mybuff.md.filter((buff) => !myStats.rsBuffs.includes(buff.id));
                    myStats.rsBuffs = [];

                } else if ((stackedBuffs / 2) < 8) {
                    const atkBuff = new buffInfo("+", Math.floor(myStats.atk * buffScale), 9999);
                    const mdBuff = new buffInfo("+", Math.floor(myStats.md * buffScale), 9999);

                    myStats.rsBuffs.push(atkBuff.id);
                    myStats.rsBuffs.push(mdBuff.id);

                    mybuff.atk.push(atkBuff);
                    mybuff.md.push(mdBuff);

                    myStats.atk += Math.floor(myStats.atk * buffScale);
                    myStats.md += Math.floor(myStats.md * buffScale);
                };
            };
        });

    }, (level) => `After a critical hit, the wearer raises their attack and magic damage by **${[2.5, 2.75, 3, 3.25, 3.5][level - 1]}%** (up to **8** times). If a non-critical strike is dealt, fires an attack at the enemy dealing damage worth twice the amount of previously stacked buffs, before resetting them.`, "The Radiant Spike is a striking ring crafted from darkened metal, its surface sharply contoured with protruding spikes that evoke a sense of fierceness. At its center sits a vibrant, multifaceted gemstone radiating brilliant hues of blue and purple, glimmering like the evening sky. This ring is imbued with powers of protection; it boosts the wearer's defenses against magical attacks. Legends say that those who wear the Radiant Spike are shielded from harm, as its sharp edges deter malevolent forces. Adorning it grants the user a commanding presence, making them the center of attention in any realm.", "genesis", 758),
    new ringInfo("Punishing Grace's Grasp", "ring", "ring", ["chest"], "<:punishing_graces_grasp:1338637021031436338>", "https://i.ibb.co/GvBnXXrh/Punishing-Grace-s-Grasp.png", 6, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        // Debuff on miss
        matchStats.on("miss", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                const atkDebuff = Math.floor(eStats.atk * [20, 22, 24, 26, 28, 30][level - 1] / 100);
                ebuff.atk.push(new buffInfo("+", -atkDebuff, 2));
                eStats.atk -= atkDebuff;
            };
        });

    }, (level) => `After the wearer misses an attack, decreases the enemy's attack by **${[20, 22, 24, 26, 28, 30][level - 1]}%** for 2 rounds.`, "Punishing Grace's Grasp is a menacing ring, its crimson surface detailing an intricate pattern of swirling flames and thorns. Adorned with dark metallic spikes, it embodies a fierce beauty that warns of its secretive power. At its pinnacle lies a deep red gem, reminiscent of a droplet of blood, capturing the essence of both passion and rage. This ring enhances the wearer's offensive capabilities, allowing them to unleash searing fire upon foes. The craftsmanship hints at an ancient curse, binding the power of wrath and grace, creating a tumultuous bond between beauty and destruction.", "mythical", 759),
    new ringInfo("Shard of Infinity", "ring", "ring", ["chest"], "<:shard_of_infinity:1338642455213375518>", "https://i.ibb.co/5XfnPwbN/Shard-of-Infinity.png", 4, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        myStats.shardOfInfinityStacks = 0;

        // On Enemy Dodge: buff ATK/MD (up to 10 times)
        matchStats.on("dodge", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (target === eStats && myStats.shardOfInfinityStacks < 10) {
                myStats.shardOfInfinityStacks++;

                // +1.5/1.7/1.9/2% ATK/MD
                const buffScale = [1.5, 1.7, 1.9, 2][level - 1] / 100;
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * buffScale), 9999));
                mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * buffScale), 9999));
                myStats.atk += Math.floor(myStats.atk * buffScale);
                myStats.md += Math.floor(myStats.md * buffScale);

                // Extend buff durations by 1/1/1/2 rounds
                Object.keys(mybuff).forEach((stat) => {
                    mybuff[stat as keyof Buffs].forEach((buff) => {
                        if (!buff.isDebuff) {
                            buff.last += [1, 1, 1, 2][level - 1];
                        };
                    });
                });
            };
        });

    }, (level) => `The wearer increases their own attack and magic damage by **${[1.5, 1.7, 1.9, 2][level - 1]}%** every time the enemy dodges an attack (up to **10** times), and extends all buff durations by **${[1, 1, 1, 2][level - 1]}** ${level === 4 ? "rounds" : "round"}.`, "The Shard of Infinity is a ring of exquisite craftsmanship, featuring a large, kaleidoscopic gem that seems to reflect the entire cosmos within its facets. The band, made from intricately twisted silver vines, cradles the gemstone as if safeguarding the secrets of the universe. Ethereal energies swirl around the gemstone, hinting at its ability to manipulate time and space. Wearers of this ring speak of glimpsing fleeting visions of alternate realities, harnessing the Shard's power for strategic advantage in battles. This ring is particularly sought after by scholars and mages eager to unlock the mysteries of existence.", "genesis", 760),
    new ringInfo("Golden Bough", "ring", "ring", ["chest"], "<:golden_bough:1338643191464984616>", "https://i.ibb.co/60gGtPbk/Golden-Bough.png", 7, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        // +15/17.5/20/22.5/25/27.5/30% CD on revival
        matchStats.on("revival", {
            maxUsage: 1,
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats) {
                    myStats.cd += [15, 17.5, 20, 22.5, 25, 27.5, 30][level - 1] / 100;
                    return true;
                };
            },
        });

    }, (level) => `After the first successful revival, increases the wearer's crit damage by **${[15, 17.5, 20, 22.5, 25, 27.5, 30][level - 1]}%**.`, "Adorned with delicate golden leaves, the Golden Bough ring emanates a warm radiance that symbolizes growth and vitality. Its elegantly curved band features intricate engravings that tell tales of ancient forests and the spirits that dwell within. At its heart lies a pristine emerald, representing the essence of nature itself. This ring not only enhances the wearer's charm and charisma but also grants the ability to communicate with flora and fauna. Druidic circles prize this piece, believing it to be a direct gift from the Earth Mother, empowering their connections to nature.", "unique", 761),
    new ringInfo("Turquoise Splendor", "ring", "ring", ["chest"], "<:turquoise_splendor:1338644481850736662>", "https://i.ibb.co/qYHWvgCk/Turquoise-Splendor.png", 1, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        // On Revival: ATK/MD = ATK/ATK or MD/MD (higher)
        matchStats.on("revival", {
            maxUsage: 1,
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats) {
                    if (myStats.atk < myStats.md) {
                        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                            myStats.atk = myStats.md;
                        }, 9999));
                    } else {
                        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                            myStats.md = myStats.atk;
                        }, 9999));
                    };

                    return true;
                };
            },
        });

    }, (level) => `After the first successful revival, increases the wearer's attack or magic damage to equal the higher one of the two.`, "Turquoise Splendor radiates a vibrant allure, featuring a polished turquoise stone elegantly set amidst curling silver vines. This ring intertwines natural beauty and magical craftsmanship, as the band is engraved with ancient runes that shimmer with a soft luster. It enhances the wearer's connection to the sea and sky, granting them serenity in the face of turmoil. Known to bestow clarity of thought and calmness in storms, Turquoise Splendor is especially favored by seers and those who traverse tumultuous waters. Those who wear it become protectors of serenity, radiating peace wherever they go.", "unique", 762),
    new ringInfo("Heroism", "ring", "ring", ["chest"], "<:heroism:1338645258199892120>", "https://i.ibb.co/hxbXRsM9/Heroism.png", 9, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        myStats.ringOfHeroism = 0;

        // On every 3rd ability usage: +15/22.5/20/22.5/25/27.5/30/32.5/35% ATK/MD (1 turn)
        matchStats.on("ABILITY", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                myStats.ringOfHeroism++;

                if (myStats.ringOfHeroism % 3 === 0) {
                    const buffScale = [15, 22.5, 20, 22.5, 25, 27.5, 30, 32.5, 35][level - 1] / 100;
                    mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * buffScale), 1));
                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * buffScale), 1));
                    myStats.atk += Math.floor(myStats.atk * buffScale);
                    myStats.md += Math.floor(myStats.md * buffScale);
                };
            };
        });

    }, (level) => `For every 3rd ability usage, increase the wearer's attack and magic damage by **${[15, 22.5, 20, 22.5, 25, 27.5, 30, 32.5, 35][level - 1]}%** for one turn.`, "Forged in the fires of valor, the ring of Heroism bears the insignia of a lion, symbolizing bravery and courage. The rich, gold band is intricately detailed, resembling the coat of a mighty beast. A deep red gemstone, reminiscent of a beating heart, sits enthroned at its center, pulsing with a faint, mesmerizing glow. This ring grants its wearer unmatched bravery, allowing them to stand unwavering in the face of despair. It is rumored that those adorned with Heroism find their intrinsic valor magnified, inspiring allies to fight with renewed strength when hope seems lost.", "rare", 763),
    new ringInfo("The Departed One", "ring", "ring", ["chest"], "<:the_departed_one:1338646510392315924>", "https://i.ibb.co/gLY5hGbp/The-Departed-One.png", 6, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        myStats.hasDepartedOne = true;

        // On Ability: -20% HP (odd), +17.5/20/22.5/25/27.5/30% CR (even)
        matchStats.on("ABILITY", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                if (matchStats.round % 2 === 1) {
                    if (!myStats.hasPartedOne) {
                        myStats.hp -= Math.floor(myStats.hp * 0.2);
                    };
                } else {
                    const crBuff = [17.5, 20, 22.5, 25, 27.5, 30][level - 1] / 100;
                    mybuff.cr.push(new buffInfo("+", crBuff, 2));
                    myStats.cr += crBuff;
                    if (myStats.cr > 1) myStats.cr = 1;
                };
            };
        });

    }, (level) => `If an ability is used on an odd turn, the wearer loses **20%** of their current HP (unless the wearer also has <:the_parted_one:1338646980209020949> The Parted One). If an ability is used on an even turn, the wearer gains **${[17.5, 20, 22.5, 25, 27.5, 30][level - 1]}%** crit rate for **2** turns.`, "The Departed One is a hauntingly beautiful ring crafted from deep black silver, with tendrils resembling smoke swirling elegantly around its band. A dark, iridescent gem sits at its center, reflecting shadows and light alike. This ring whispers to its wearer of the forgotten and the lost, enhancing their connection to the spirit realm. It is said to offer protection from dark entities, allowing the wearer to navigate the ethereal plane safely. The Departed One is favored by necromancers and spiritual guides, representing the balance between life and death while guarding against malevolent forces.", "legendary", 764),
    new ringInfo("The Parted One", "ring", "ring", ["chest"], "<:the_parted_one:1338646980209020949>", "https://i.ibb.co/rK1LMk8t/The-Parted-One.png", 6, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        myStats.hasPartedOne = true;

        // On Ability: -20% HP (even), +27.5/30/32.5/35/37.5/40% CD (odd)
        matchStats.on("ABILITY", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                if (matchStats.round % 2 === 0) {
                    if (!myStats.hasDepartedOne) {
                        myStats.hp -= Math.floor(myStats.hp * 0.2);
                    };
                } else {
                    const cdBuff = [27.5, 30, 32.5, 35, 37.5, 40][level - 1] / 100;
                    mybuff.cd.push(new buffInfo("+", cdBuff, 2));
                    myStats.cd += cdBuff;
                };
            };
        });

    }, (level) => `If an ability is used on an even turn, the wearer loses **20%** of their current HP (unless the wearer also has <:the_departed_one:1338646510392315924> The Departed One). If an ability is used on an odd turn, the wearer gains **${[27.5, 30, 32.5, 35, 37.5, 40][level - 1]}%** crit damage for **2** turns.`, "The Parted One ring is a mesmerizing piece that embodies a mix of elegance and mystery. Its band is made of finely crafted silver, shaped to resemble a twisting current that divides at the center. Here, a radiant gem glows in an enchanting aquamarine shade, continuously shifting and swirling like water caught in eternal motion. This ring grants its wearer the ability to navigate through tumultuous waters, quite literally and metaphorically, facilitating smoother paths during turbulent times. Lore speaks of seers who attune themselves to the energies of the sea, finding peace with the help of this remarkable ring.", "legendary", 765),
    new ringInfo("Cindercrest", "ring", "ring", ["chest"], "<:cindercrest:1338653441668419697>", "https://i.ibb.co/TGsHkrK/Cindercrest.png", 3, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        //! new ability

    }, (level) => ``, "Cindercrest is a striking ring forged from darkened steel, with intricate patterns resembling swirling smoke etched into its surface. At its crown sits a smoldering ember-like gemstone that flickers with hues of red and orange, reminiscent of a dying star. This ring symbolizes transformation and regeneration, allowing its wearer to harness the raw power of fire and ash. Cindercrest is favored by warriors and mages alike who wish to wield the destructive forces of fire. Known to spark creativity and rebirth, it serves as a powerful reminder of the beauty that can emerge from chaos and destruction.", "mythical", 766),
    new ringInfo("Dread Crown", "ring", "ring", ["raid"], "<:dread_crown:1333967667543146646>", "https://i.ibb.co/6JvXx1vR/Dread-Crown.png", 4, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Mana

        //! new ability

    }, (level) => ``, "The Dread Crown is a ring that embodies the terror of darkness itself. Crafted from blackened metal, its spiked silhouette resembles the jagged peaks of a cursed mountain range. The central gemstone, a deep crimson, pulsates with a sinister light, echoing the life force of a thousand fallen foes. Intricate symbols of ancient runes are etched into the band, hinting at forgotten sorceries of domination and fear. Wearing this ring grants the bearer unsettling influence, striking dread into the hearts of their enemies, while enhancing their necromantic capabilities. It is a soul-bound accessory for dark lords and cunning villains.", "legendary", 767),
    new ringInfo("Arcane Rebound", "ring", "ring", ["raid"], "<:arcane_rebound:1334246581679165572>", "https://i.ibb.co/RtCBGSG/Arcane-Rebound.png", 1, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Hammer

        //! new ability

        // myStats.ringOfRebound = myStats.shield;
        // // On Shield Gain: "Rebounce" for 1 turn: +1 counter
        // myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        //     if (myStats.shield > 0 && myStats.ringOfRebound === 0) { // Check if he got a new shield
        //         myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        //             myStats.counter = 1;
        //         }));
        //     };
        //     myStats.ringOfRebound = myStats.shield;
        // }, 9999));

    }, (level) => `Upon gaining a shield, enters the state of "Rebounce" for 1 turn, countering any damage taken.`, "The Arcane Rebound is a masterpiece of magical craftsmanship, adorned with intricate blue filigree that glimmers like stars against a dark backdrop. The ring is smooth and slightly curved, resembling a spellcaster's focus tool, with an ethereal light emanating from the core. Tiny arcs of electricity flicker around the band, forming patterns reminiscent of a magical glyph, enhancing the wielder's spell defense. When activated, it can absorb hostile magic and redirect it, turning an enemy's strength against them. The ring's unique design highlights its functionality, making it the ideal choice for scholars and sorcerers alike, ensuring that their arcane power never wavers.", "unique", 768),
    new ringInfo("Gama's Awakening", "ring", "ring", ["raid"], "<:gamas_awakening:1334260075304321167>", "https://i.ibb.co/RTsBMw2m/Gama-s-Awakening.png", 2, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Drain

        //! new ability (no maxHP)

        // // HP < 15/17.5% in 4/5 rounds: -20% enemy max HP, heal 40% max HP
        // myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        //     if (myStats.hp <= myStats.maxhp * (0.15 + 0.025 * (level - 1))) {
        //         eStats.hp -= Math.floor(eStats.maxhp * 0.2);
        //         if (eStats.hp < 0) eStats.hp = 0;
        //         addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.4));
        //     };
        // }, matchStats.round + [4, 5][level - 1]));

    }, (level) => `If the wearer's HP falls below **${[15, 17.5][level - 1]}%** of their max HP in **${[4, 5][level - 1]}** rounds, the enemy will lose **20%** of their max HP and the wearer will heal for **40%** of their max HP.`, "The Gama's Awakening ring radiates an aura of transformation, carved from sapphire-blue stone and entwined with ethereal vines that evoke nature's untamed splendor. Two green gemstones glisten like dewdrops, each resembling a watchful eye, attuned to the energies of the world. Soft waves ripple across its surface, reflecting the essence of life itself. When worn, this ring enhances the wearer's connection to the natural world, allowing them to communicate with flora and fauna. It's a perfect ally for druids and nature guardians, embodying the spirit of rebirth and awakening.", "legendary", 769),
    new ringInfo("Voltage Overload", "ring", "ring", ["guild"], "<:voltage_overload:1334325589242544269>", "https://i.ibb.co/PZfXXBLt/Voltage-Overload.png", 1, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        //! new ability

        //myStats.overload = false;

        // //? Does this reset before the trigger?
        // myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        //     myStats.overload = false;
        // }, 9999));

        // // lightning attacks cost 5💧
        // // On lightning attack: Deal currentMana% damage, max: 40%
        // matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
        //     if (caster === myStats && options.isLightning && myStats.sm >= 5 && !myStats.overload) {
        //         myStats.sm -= 5;
        //         dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:lightning:1340309243827458139> **${char.name}**`, { isLightning: true, atkMultiplier: Math.min(0.4, (myStats.sm / myStats.mana)) });
        //         myStats.overload = true;
        //     };
        // });

    }, (level) => `Lightning attacks cost **5**💧 but follow up by an additional lightning strike dealing damage based on your current mana.`, "Forged in the heart of a thunderstorm, the Voltage Overload ring radiates with a majestic aura of electrifying energy. Its deep blue steel band is accentuated by intricate engravings resembling bolts of lightning, while a shimmering emerald gem rests prominently at its center. Emanating a soft glow, the gem feels alive, surging with static electricity, ready to unleash chaotic charges when called upon. Worn by those who dance with the tempest, this ring grants its bearer heightened reflexes and an affinity for electric magic, empowering attacks with volatile bursts of energy.", "legendary", 770),
    new ringInfo("Deathbloom Ring", "ring", "ring", ["raid"], "<:deathbloom_ring:1336031521181532280>", "https://i.ibb.co/Nn74bhyg/Deathbloom-Ring.png", 1, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* noHeal

        //! new ability (preferable sth with negateHeal)

        // // On own heal: negate enemy heal for 1 turn
        // matchStats.on("heal", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
        //     if (caster === myStats && options.caster === myStats) {
        //         myStats.negateHeal = 1;
        //         matchStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        //             myStats.negateHeal = 0;
        //         }));
        //     };
        // });

    }, (level) => `If you recover HP, negates the healing of the enemy that turn.`, "The Deathbloom ring is a macabre masterpiece crafted from obsidian, adorned with twisted thorns and faintly glowing purple flowers. At its center lies a dark amethyst, encapsulated by grotesque skulls—a reminder of life's fleeting nature. The flowers bloom eternally, echoing life amid decay. This ring grants its wearer dominion over the energies of life and death, empowering necromantic spells and drawing upon the despair of the fallen. It exudes an eerie charm, enticing those who seek dark knowledge and power. Legends tell of its creation in the Valley of Lost Souls, where the balance between life and death is forever debated.", "legendary", 771),
    new ringInfo("Thalamir's Promise", "ring", "ring", ["guild"], "<:defiant_survivals_ring:1336068330330525826>", "https://i.ibb.co/60kDLhT0/Defiant-Survival-s-Ring.png", 9, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        //! new ability

    }, (level) => ``, "Thalamir's Promise is forged from an alloy that shimmers between copper and twilight hues, centered by a deep emerald said to contain an ancient guardian's last breath. Silver spirals thread through the band like moonlight streams, bearing whispered enchantments of preservation. When death approaches, ethereal vines of pure energy emerge to anchor their bearer to the mortal realm, fulfilling Thalamir's ancient vow that life shall endure.", "legendary", 772),
    new ringInfo("Mystic Wave", "ring", "ring", ["raid"], "<:mystic_wave:1336068414015279124>", "https://i.ibb.co/KpBdCJyq/Mystic-Wave.png", 4, (level) => (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { //* Mana

        //! new ability

    }, (level) => ``, "The Mystic Wave ring is a masterwork of blue and silver, embodying the essence of the ocean. Its smooth band twists and curls like crashing waves, shimmering under light. A deep sapphire rests at its zenith, glistening with the fluidity of water. The design evokes the tranquility of the sea, while also hinting at its enigmatic depths. This ring grants the ability to control water and manipulate tides, providing protection against fiery adversaries. When in water, the sapphire glows brightly, summoning a protective wave that can shield the wearer from harm. It is a favored ring among ocean mages and water elementals.", "legendary", 773),

];

export const fishing = items.filter((e) => e.obtain.includes("fishing"));

// DEBUGGING CONTROLS
// DEBUGGING CONTROLS
// DEBUGGING CONTROLS

// Check if duplicate names
{
    let names = items.map((e) => e.name).sort();
    let len = names.length - 1, res = "";
    while (len--) if (names[len - 1] === names[len]) res += names[len--] + "\n";
    if (res) console.log("WARNING! Duplicate names: " + res);
}

// Check gender, rarity and ID
items.forEach((e, i) => {
    if (e.id !== i) console.log("WARNING! Wrong ID " + e.id + " in: " + e.name);
});

// Export CSV
// const fs = require('fs');
// const csvWriter = require('fast-csv');

// const ascMats = items.filter((e) => e.type === "ascension material");
// const craftMats = items.filter((e) => e.type === "crafting material");

// let data = items.filter((e) => e.category === "weapon").concat(items.filter((e) => e.category === "armor")).map((e) => ({
//     name: e.name,
//     category: e.category,
//     type: e.type,
//     rarity: e.grade,
//     obtain: e.obtain.join(", "),
//     image: e.image,
//     id: e.id,
//     craft: craftMats.find((c) => c.grade === e.grade).name,
//     craft_image: craftMats.find((c) => c.grade === e.grade).image,
//     ascension: getAscensionMaterial(e.id, ascMats).name,
//     ascension_image: getAscensionMaterial(e.id, ascMats).image,
// }));

// function getAscensionMaterial(id, ascItems) {
//     id += "camelot";
//     let hash = 3;
//     for (let i = 0; i < id.length; i++) {
//         hash = ((hash << 5) - hash) + id.charCodeAt(i);
//         hash |= 0;
//     };
//     return ascItems[Math.abs(hash) % ascItems.length];
// };

// const ws = fs.createWriteStream('output.csv');

// csvWriter.writeToStream(ws, data, { headers: true, delimiter: ';' }).on('finish', function () {
//     console.log('CSV file successfully created');
// });
