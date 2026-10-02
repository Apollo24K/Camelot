import { ItemCategory, ItemRarity, ItemType, Emoji } from "../types";

export class itemInfo {
    private _name: string;
    private _category: ItemCategory;
    private _type: ItemType;
    private _obtain: string[];
    private _emoji: Emoji;
    private _image: `https://${string}`;
    private _grade: ItemRarity;
    private _id: number;
    private _unique: boolean;
    private _tradable: boolean;
    private _sellable: boolean;
    private _desc: string;
    private _flair: string;

    constructor(name: string, category: ItemCategory, type: ItemType, obtain: string[], emoji: Emoji, image: `https://${string}`, grade: ItemRarity, id: number, unique: boolean, tradable: boolean, sellable: boolean, desc: string = "", flair: string = "") {
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