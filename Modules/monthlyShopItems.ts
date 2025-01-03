
type Currency = "coins" | "gems" | "jades" | "lilies" | "guild_marks";

type MonthlyShopItemCustomOptions = {
    tier?: number;
    itemid?: number;
    column?: string;
};

export default class MonthlyShopItemInfos {
    private _name: string;
    private _displayName: string;
    private _section: string;
    private _amount: number;
    private _price: number;
    private _currency: Currency;
    private _id: number;
    private _custom: MonthlyShopItemCustomOptions;

    constructor(name: string, displayName: string, section: string, amount: number, price: number, currency: Currency, id: number, custom: MonthlyShopItemCustomOptions = {}) {
        this._name = name;
        this._displayName = displayName;
        this._section = section;
        this._amount = amount;
        this._price = price;
        this._currency = currency;
        this._id = id;
        this._custom = custom;
    };

    get name() { return this._name; };
    get displayName() { return this._displayName || this._name; };
    get section() { return this._section; };
    get amount() { return this._amount; };
    get price() { return this._price; };
    get currency() { return this._currency; };
    get id() { return this._id; };
    get custom() { return this._custom; };

    get emojiIcon() {
        const emojis: Record<Currency, string> = {
            coins: "<:coins:872926669055356939>",
            gems: "<:genesis_gems:1034179687720681492>",
            jades: "<:eternal_jade:1256124504141201428>",
            lilies: "<:lilium:974057059618291732>",
            guild_marks: "<:guild_mark:1317944450814840923>"
        };

        return emojis[this.currency];
    };

    get displayPrice() {
        let price = `${this.price}`;
        if (price.endsWith("000000")) price = `${price.slice(0, price.length - 6)}m`;
        else if (price.endsWith("000")) price = `${price.slice(0, price.length - 3)}k`;

        return `${price} ${this.emojiIcon}`;
    };

    get displayPriceText() {
        let price = `${this.price}`;
        if (price.endsWith("000000")) price = `${price.slice(0, price.length - 6)}m`;
        else if (price.endsWith("000")) price = `${price.slice(0, price.length - 3)}k`;
        return `${price} ${this.currency}`;
    };
};

export const monthlyShopItems = [
    new MonthlyShopItemInfos("Premium Tier 1", "", "Freemium", 1, 60000, "coins", 0, { tier: 1 }),
    new MonthlyShopItemInfos("Premium Tier 2", "", "Freemium", 1, 200000, "coins", 1, { tier: 2 }),

    new MonthlyShopItemInfos("EX Pull", "<a:EXTRA:1138530846144462968> Pull", "EX Pulls", 5, 100000, "coins", 2),
    new MonthlyShopItemInfos("EX Pull", "<a:EXTRA:1138530846144462968> Pull (last chance)", "EX Pulls", 1, 500000, "coins", 3),
    new MonthlyShopItemInfos("EX Pull", "<a:EXTRA:1138530846144462968> Pull", "EX Pulls", 3, 300, "gems", 4),

    new MonthlyShopItemInfos("Kernel", "<:starlight_kernel:1106121205515288659> Starlight Kernel", "Kernel", 15, 5000, "coins", 5),
    new MonthlyShopItemInfos("Kernel", "<:starlight_kernel:1106121205515288659> Starlight Kernel", "Kernel", 5, 300, "lilies", 6),

    new MonthlyShopItemInfos("Slime Concentrate", "<:slime_concentrate:1046083943428001964>", "Ascension Materials", 100, 200, "coins", 7, { itemid: 40 }),
    new MonthlyShopItemInfos("Bones", "<:bones:1046084545969139752>", "Ascension Materials", 100, 200, "coins", 8, { itemid: 41 }),
    new MonthlyShopItemInfos("Wolf Teeth", "<:wolf_teeth:1046085926360719490>", "Ascension Materials", 100, 200, "coins", 9, { itemid: 42 }),
    new MonthlyShopItemInfos("Goblin Mask", "<:goblin_mask:1046080758466490398>", "Ascension Materials", 100, 200, "coins", 10, { itemid: 43 }),
    new MonthlyShopItemInfos("Silver Plume", "<:silver_plume:1046087833640775710>", "Ascension Materials", 100, 200, "coins", 11, { itemid: 44 }),
    new MonthlyShopItemInfos("Lizard Tail", "<:lizard_tail:1046088687508783124>", "Ascension Materials", 100, 200, "coins", 12, { itemid: 45 }),
    new MonthlyShopItemInfos("Orc Leather", "<:orc_leather:1046091137758281908>", "Ascension Materials", 100, 200, "coins", 13, { itemid: 46 }),
    new MonthlyShopItemInfos("Monster Egg", "<:monster_egg:1046092022806749294>", "Ascension Materials", 100, 200, "coins", 14, { itemid: 47 }),
    new MonthlyShopItemInfos("Eternal Flame", "<:eternal_flame:1046093580944556084>", "Ascension Materials", 100, 200, "coins", 15, { itemid: 48 }),
    new MonthlyShopItemInfos("Frost Crystal", "<:frost_crystal:1046096633466716240>", "Ascension Materials", 100, 200, "coins", 16, { itemid: 49 }),
    new MonthlyShopItemInfos("Ephemeral Light", "<:ephemeral_light:1062475144028753960>", "Ascension Materials", 100, 200, "coins", 17, { itemid: 88 }),
    new MonthlyShopItemInfos("Detached Horn", "<:detached_horn:1062489011228250222>", "Ascension Materials", 100, 200, "coins", 18, { itemid: 89 }),
    new MonthlyShopItemInfos("Ancient Dice", "<:ancient_dice:1062489046028398732>", "Ascension Materials", 100, 200, "coins", 19, { itemid: 90 }),
    new MonthlyShopItemInfos("Mysterious Nut", "<:mysterious_nut:1062489015061860443>", "Ascension Materials", 100, 200, "coins", 20, { itemid: 91 }),
    new MonthlyShopItemInfos("Devil Claws", "<:devil_claws:1062489031809708042>", "Ascension Materials", 100, 200, "coins", 21, { itemid: 92 }),
    new MonthlyShopItemInfos("Kings Crown", "<:kings_crown:1085957092160065678>", "Ascension Materials", 100, 200, "coins", 22, { itemid: 663 }),
    new MonthlyShopItemInfos("Sack of Gold", "<:sack_of_gold:1085953669591203900>", "Ascension Materials", 100, 200, "coins", 23, { itemid: 664 }),
    new MonthlyShopItemInfos("Odious Brain", "<:odious_brain:1085957467118252175>", "Ascension Materials", 100, 200, "coins", 24, { itemid: 665 }),
    new MonthlyShopItemInfos("Holy Grail", "<:holy_grail:1085953416355926146>", "Ascension Materials", 100, 200, "coins", 25, { itemid: 666 }),
    new MonthlyShopItemInfos("Dragon Scales", "<:dragon_scales:1085965820032729138>", "Ascension Materials", 100, 200, "coins", 26, { itemid: 667 }),
    new MonthlyShopItemInfos("Sturdy Conglomerate", "<:sturdy_conglomerate:1085981924734013532>", "Ascension Materials", 100, 200, "coins", 27, { itemid: 668 }),
    new MonthlyShopItemInfos("Enigmatic Amber", "<:enigmatic_amber:1085981921340833903>", "Ascension Materials", 100, 200, "coins", 28, { itemid: 669 }),
    new MonthlyShopItemInfos("Wooden Bark", "<:wooden_bark:1085988466610950245>", "Ascension Materials", 100, 200, "coins", 29, { itemid: 670 }),
    new MonthlyShopItemInfos("Metal Gear", "<:metal_gear:1085988462076903444>", "Ascension Materials", 100, 200, "coins", 30, { itemid: 671 }),
    new MonthlyShopItemInfos("Pendant of Silence", "<:pendant_of_silence:1086013617398353950>", "Ascension Materials", 100, 200, "coins", 31, { itemid: 672 }),
    new MonthlyShopItemInfos("Mortal Flask", "<:mortal_flask:1086013621085159505>", "Ascension Materials", 100, 200, "coins", 32, { itemid: 673 }),
    new MonthlyShopItemInfos("Arcane Remnants", "<:arcane_remnants:1086014438785699870>", "Ascension Materials", 100, 200, "coins", 33, { itemid: 674 }),
    new MonthlyShopItemInfos("Charming Blossoms", "<:charming_blossoms:1086017299070337024>", "Ascension Materials", 100, 200, "coins", 34, { itemid: 675 }),

    new MonthlyShopItemInfos("SS Shard", "<:ss_shard:917203009543503892> SS Shard", "Shards", 8, 3000, "coins", 35, { column: "ssshard" }),
    new MonthlyShopItemInfos("SS Shard", "<:ss_shard:917203009543503892> SS Shard", "Shards", 16, 100, "lilies", 36, { column: "ssshard" }),
    new MonthlyShopItemInfos("S Shard", "<:s_shard:917202925514817566> S Shard", "Shards", 64, 50, "lilies", 37, { column: "sshard" }),

    new MonthlyShopItemInfos("SS Ticket", "<:ss_ticket:927503239396622336> SS Ticket", "Tickets", 5, 10000, "coins", 38, { column: "ssticket" }),
    new MonthlyShopItemInfos("SS Ticket", "<:ss_ticket:927503239396622336> SS Ticket", "Tickets", 3, 60, "gems", 39, { column: "ssticket" }),
    new MonthlyShopItemInfos("SS Ticket", "<:ss_ticket:927503239396622336> SS Ticket", "Tickets", 2, 300, "lilies", 40, { column: "ssticket" }),
    new MonthlyShopItemInfos("S Ticket", "<:s_ticket:927642487705722890> S Ticket", "Tickets", 10, 3000, "coins", 41, { column: "sticket" }),
    new MonthlyShopItemInfos("S Ticket", "<:s_ticket:927642487705722890> S Ticket", "Tickets", 5, 200, "lilies", 42, { column: "sticket" }),

    new MonthlyShopItemInfos("Deluxe Chest", "<:deluxe_chest:1069301259603026061> Deluxe Chest", "Chests", 1, 500000, "coins", 43, { itemid: 458 }),
    new MonthlyShopItemInfos("Royal Chest", "<:royal_chest:1069301128711376976> Royal Chest", "Chests", 3, 75000, "coins", 44, { itemid: 457 }),
    new MonthlyShopItemInfos("Luxurious Chest", "<:luxurious_chest:1069300112364404817> Luxurious Chest", "Chests", 5, 25000, "coins", 45, { itemid: 456 }),
    new MonthlyShopItemInfos("Glorious Chest", "<:glorious_chest:1069076067081539726> Glorious Chest", "Chests", 10, 10000, "coins", 46, { itemid: 454 }),

    new MonthlyShopItemInfos("Premium Tier 1", "", "Premium", 1, 220, "jades", 47, { tier: 1 }),
    new MonthlyShopItemInfos("Premium Tier 2", "", "Premium", 1, 380, "jades", 48, { tier: 2 }),
    new MonthlyShopItemInfos("Premium Tier 3", "", "Premium", 1, 760, "jades", 49, { tier: 3 }),
    new MonthlyShopItemInfos("Premium Tier 4", "", "Premium", 1, 1140, "jades", 50, { tier: 4 }),
    new MonthlyShopItemInfos("Premium Tier 5", "", "Premium", 1, 1520, "jades", 51, { tier: 5 }),
    new MonthlyShopItemInfos("Premium Tier 6", "", "Premium", 1, 2280, "jades", 52, { tier: 6 }),
    new MonthlyShopItemInfos("Premium Tier 7", "", "Premium", 1, 3800, "jades", 53, { tier: 7 }),

];

// Check gender, rarity and ID
monthlyShopItems.forEach((e, i) => {
    if (e.id !== i) console.log("WARNING! Wrong ID " + e.id + " in monthly shop item: " + e.name);
});
