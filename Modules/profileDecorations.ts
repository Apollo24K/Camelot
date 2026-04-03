import { Asset } from "./assets";

export type CostTypes = { gems?: number, coins?: number, lilies?: number, jades?: number, season_keys?: number, eventpts?: number; };

export class ProfileSet {
    private _name: string;
    private _id: number;
    private _cost: CostTypes;
    private _assets: ProfileDecorations[];

    constructor(name: string, id: number, cost: CostTypes, assets: ProfileDecorations[]) {
        this._name = name;
        this._id = id;
        this._cost = cost;
        this._assets = assets;

        assets.forEach((asset, i) => {
            asset.set = this;
            asset.id = i;
        });
    };

    get name() {
        return this._name;
    };
    get id() {
        return this._id;
    };
    get cost() {
        return this._cost;
    };
    get assets() {
        return this._assets;
    };
};

type ProfileDecorationsOptions = { delay: number, credits: string[]; };

export class ProfileDecorations {
    private _name: string;
    private _category: "background" | "panel" | "decoration";
    private _cost: CostTypes;
    private _obtain: string[];
    private _asset: Asset;
    private _id: number;
    private _options: ProfileDecorationsOptions;
    private _set?: ProfileSet;

    constructor({ name, category, cost, obtain, asset, id, options }: { name: string, category: "background" | "panel" | "decoration", cost: CostTypes, obtain: string[], asset: Asset, id?: number, options?: Partial<ProfileDecorationsOptions>; }) {
        this._name = name;
        this._category = category;
        this._cost = cost;
        this._obtain = obtain;
        this._asset = asset;
        this._id = id ?? 0;
        this._options = options ? {
            delay: options.delay ?? 70,
            credits: options.credits ?? []
        } : { delay: 70, credits: [] };

        this._set; // ProfileSet
    };

    get name() {
        return this._name;
    };
    get category() {
        return this._category;
    };
    get set() {
        return this._set;
    };
    get setname() {
        return this.set?.name ?? "Unnamed Set";
    };
    get setid() {
        return this.set?.id ?? 0;
    };
    get cost() {
        return this._cost;
    };
    get obtain() {
        return this._obtain;
    };
    get asset() {
        return this._asset;
    };
    get id() {
        return this._id;
    };
    get options() {
        return this._options;
    };

    get delay() {
        return this.options.delay ?? 70;
    };
    get credits() {
        return this.options.credits ?? [];
    };

    set set(obj) {
        this._set = obj;
    };
    set id(id) {
        this._id = id;
    };

    async loadImageArray(forceStatic: boolean = false) {
        return await this.asset.loadImageArray(forceStatic);
    };
};

export class Background extends ProfileDecorations {
    constructor(name: string, cost: CostTypes, obtain: string[], asset: Asset, options: Partial<ProfileDecorationsOptions> = { delay: 70, credits: [] }) {
        const category = "background";

        asset.name = name;
        asset.type = "Profile Background";
        asset.fallback = new Asset({ path: "Images/ui/profile/backgrounds/core-collection/skyward-spirals.png", url: "https://i.ibb.co/nftZnjc/bg.png" });

        super({ name, category, cost, obtain, asset, options });
    };

    get delay() {
        return this.options.delay ?? 70;
    };
    get credits() {
        return this.options.credits ?? [];
    };

    async loadImageArray(forceStatic: boolean = false) {
        return await this.asset.loadImageArray(forceStatic);
    };
};

export const profileSets = [

    new ProfileSet("Core Collection", 0, {}, [
        new Background("Skyward Spirals", {}, ["default"], new Asset({ path: "Images/ui/profile/backgrounds/core-collection/skyward-spirals.jpg", url: "https://i.ibb.co/TLFqcrh/ezgif-7-f66c86284b.jpg" }), { credits: ["715186861965967440"] }),
        new Background("Melodic Drift", {}, ["default"], new Asset({ path: "Images/ui/profile/backgrounds/core-collection/melodic-drift.jpg", url: "https://i.ibb.co/RCtdN8n/melodic-drift.jpg" }), { credits: ["715186861965967440"] }),
        new Background("Blue Lattice", {}, ["default"], new Asset({ path: "Images/ui/profile/backgrounds/core-collection/blue-lattice.jpg", url: "https://i.ibb.co/ckkphGW/blue-lattice.jpg" }), { credits: ["715186861965967440"] }),
        new Background("Neon Gridscape", {}, ["default"], new Asset({ path: "Images/ui/profile/backgrounds/core-collection/neon-gridscape.jpg", url: "https://i.ibb.co/qNFcXmd/neon-gridscape.jpg" }), { credits: ["715186861965967440"] }),
    ]),

    new ProfileSet("Chibisolde", 1, { jades: 1000, gems: 1500 }, [
        new Background("Chibisolde", { jades: 300, gems: 500 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/chibisolde/chibisolde.jpg", url: "https://i.ibb.co/9psFBQh/chibisolde.jpg" }), { credits: ["1083065632490274948"] }),
        new Background("Chibearsolde", { jades: 300, gems: 500 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/chibisolde/chibearsolde.jpg", url: "https://i.ibb.co/6R89w7P/chibearsolde.jpg" }), { credits: ["1083065632490274948"] }),
        new Background("Worktimesolde", { jades: 300, gems: 500 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/chibisolde/worktimesolde.jpg", url: "https://i.ibb.co/fpHYNxZ/worktimesolde.jpg" }), { credits: ["1083065632490274948"] }),
        new Background("Nursolde", { jades: 300, gems: 500 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/chibisolde/nursolde.jpg", url: "https://i.ibb.co/gJt6LVN/nursolde.jpg" }), { credits: ["1083065632490274948"] }),
    ]),

    new ProfileSet("Essentials", 2, { jades: 250, gems: 300, coins: 200_000 }, [
        new Background("Burgundy Bands", { gems: 100, coins: 100_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/essentials/burgundy-bands.jpg", url: "https://i.ibb.co/KxvcFpn/burgundy-bands.jpg" }), { credits: ["715186861965967440"] }),
        new Background("King's Contour", { gems: 100, coins: 75_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/essentials/kings-contour.jpg", url: "https://i.ibb.co/CJ80Zpd/kings-contour.jpg" }), { credits: ["715186861965967440"] }),
        new Background("Charcoal Mosaic", { gems: 100, coins: 50_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/essentials/charcoal-mosaic.jpg", url: "https://i.ibb.co/Bnkgq1j/charcoal-mosaic.jpg" }), { credits: ["715186861965967440"] }),
        new Background("Pink Bloom", { gems: 100, coins: 25_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/essentials/pink-bloom.jpg", url: "https://i.ibb.co/cQBYGzh/pink-bloom.jpg" }), { credits: ["715186861965967440"] }),
    ]),

    new ProfileSet("Celestial Realms", 3, { jades: 250, gems: 300, coins: 300_000 }, [
        new Background("Enchanted Woodlands", { gems: 100, coins: 100_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/celestial-realms/enchanted-woodlands.jpg", url: "https://i.ibb.co/R6jtTM3/enchanted-woodlands.jpg" })),
        new Background("River Vale Vista", { gems: 100, coins: 100_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/celestial-realms/river-vale-vista.jpg", url: "https://i.ibb.co/QCznBWn/river-vale-vista.jpg" })),
        new Background("Elysian Woods", { gems: 100, coins: 100_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/celestial-realms/elysian-woods.jpg", url: "https://i.ibb.co/DLJsjTG/elysian-woods.jpg" })),
        new Background("River Grove", { gems: 100, coins: 100_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/celestial-realms/river-grove.jpg", url: "https://i.ibb.co/gZsjj7W/river-grove.jpg" })),
    ]),

    new ProfileSet("Wuthering Waves", 4, { jades: 600, gems: 900, coins: 2_000_000 }, [
        new Background("Yinlin WHIP", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/wuthering/yinlin.gif", url: "https://i.ibb.co/GW4LmJG/yinlin.gif" }), { delay: 35 }),
        new Background("Jiyan", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/wuthering/jiyan.gif", url: "https://i.ibb.co/8bqxYWp/jiyan.gif" }), { delay: 100 }),
        new Background("Encore", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/wuthering/encore.gif", url: "https://i.ibb.co/hmYCZ1G/encore.gif" }), { delay: 100 }),
        new Background("Jianxin", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/wuthering/jianxin.gif", url: "https://i.ibb.co/kcHJSRg/jianxin.gif" }), { delay: 100 }),
        new Background("Disco Tortoise", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/wuthering/disco-tortoise.gif", url: "https://i.ibb.co/gr936Pd/disco-tortoise.gif" }), { delay: 80 }),
    ]),

    new ProfileSet("Neco-Arc", 5, { jades: 500, gems: 600, coins: 1_000_000 }, [
        new Background("Neco-Arc", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/neco-arc/neco-arc.gif", url: "https://i.ibb.co/Wznc8W0/neco-arc.gif" }), { delay: 70 }),
        new Background("Neco-Dance", { gems: 200, coins: 300_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/neco-arc/neco-dance.gif", url: "https://i.ibb.co/vhXsvVF/neco-dance.gif" }), { delay: 70 }),
        new Background("Neco-Army", { gems: 200, coins: 300_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/neco-arc/neco-army.gif", url: "https://i.ibb.co/t3zrKKW/neco-army.gif" }), { delay: 100 }),
    ]),

    new ProfileSet("Genshin Impact Bursts", 6, { jades: 600, gems: 900, coins: 1_750_000 }, [
        new Background("Raiden Shogun", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/genshin-impact-bursts/raiden-shogun.gif", url: "https://i.ibb.co/B5zk4bkM/raiden-shogun.gif" }), { delay: 60 }),
        new Background("Arlecchino", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/genshin-impact-bursts/arlecchino.gif", url: "https://i.ibb.co/BHjQMpFD/arlecchino.gif" }), { delay: 60 }),
        new Background("Kinich", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/genshin-impact-bursts/kinich.gif", url: "https://i.ibb.co/xS3T021D/kinich.gif" }), { delay: 30 }),
        new Background("Varesa", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/genshin-impact-bursts/varesa.gif", url: "https://i.ibb.co/99VrRhv6/varesa.gif" }), { delay: 50 }),
    ]),

    new ProfileSet("Shorekeeper", 7, { jades: 750, gems: 1000, coins: 1_500_000 }, [
        new Background("The Shorekeeper", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/shorekeeper/the-shorekeeper.gif", url: "https://i.ibb.co/Z1Y6wJTD/the-shorekeeper.gif" }), { delay: 83 }),
        new Background("Shorekeeper Wake", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/shorekeeper/shorekeeper-wake.gif", url: "https://i.ibb.co/sdHCwmkS/shorekeeper-wake.gif" }), { delay: 100 }),
        new Background("Shorekeeper Lie", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/shorekeeper/shorekeeper-lie.gif", url: "https://i.ibb.co/nqm9PjwJ/shorekeeper-lie.gif" }), { delay: 80 }),
        new Background("Shorekeeper Sit", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/shorekeeper/shorekeeper-sit.gif", url: "https://i.ibb.co/vvVWNqL8/shorekeeper-sit.gif" }), { delay: 105 }),
        new Background("Wife", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/shorekeeper/wife.gif", url: "https://i.ibb.co/23w3pm5L/wife.gif" }), { delay: 90 }),
    ]),

    new ProfileSet("Frieren", 8, { jades: 600, gems: 750, coins: 1_250_000 }, [
        new Background("Frieren", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/frieren/frieren.gif", url: "https://i.ibb.co/C30c4pTP/frieren.gif" }), { delay: 83 }),
        new Background("Frieren River", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/frieren/frieren-river.gif", url: "https://i.ibb.co/Tx4H5tYf/river.gif" }), { delay: 73 }),
        new Background("Frieren Mimic", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/frieren/frieren-mimic.gif", url: "https://i.ibb.co/wN4dffZ8/mimic.gif" }), { delay: 62 }),
    ]),

    new ProfileSet("Vermeil", 9, { jades: 9000, gems: 12000, coins: 50_000_000 }, [
        new Background("Vermeil", { gems: 10000, coins: 30_000_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/vermeil/vermeil.gif", url: "https://i.ibb.co/tgNMh6K/vermeil.gif" }), { delay: 130 }),
    ]),

    new ProfileSet("Shades of Rust", 10, { jades: 900, gems: 1000 }, [
        new Background("Autumn Breaths", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/shades-of-rust/autumn-breaths.jpg", url: "https://i.ibb.co/8DqzCMQ2/20250906-141336-0000.png" })),
        new Background("Nostalgic Sunlight", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/shades-of-rust/nostalgic-sunlight.jpg", url: "https://i.ibb.co/tMQQXYmX/20250906-141314-0000.png" })),
        new Background("Familiar Roads", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/shades-of-rust/familiar-roads.jpg", url: "https://i.ibb.co/B5BS4Ckm/20250906-141207-0000.png" })),
        new Background("A Trace of Memory", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/shades-of-rust/a-trace-of-memory.jpg", url: "https://i.ibb.co/vCJCr214/20250906-141504-0000.png" })),
    ]),

    new ProfileSet("Autumn Forest", 11, { jades: 900, gems: 1000 }, [
        new Background("Crimson Grove", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/autumn-forest/crimson-grove.jpg", url: "https://i.ibb.co/skFryJJ/fall1.png" })),
        new Background("Golden Canopy", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/autumn-forest/golden-canopy.jpg", url: "https://i.ibb.co/Zp1gcrmD/fall2.png" })),
        new Background("Amber Meadow", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/autumn-forest/amber-meadow.jpg", url: "https://i.ibb.co/0Nmjb1n/fall3.png" })),
        new Background("Russet Wilderness", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/autumn-forest/russet-wilderness.jpg", url: "https://i.ibb.co/hxjYvpVD/fall4.png" })),
    ]),

    new ProfileSet("Eternal Autumn", 12, { jades: 1000, gems: 1200 }, [
        new Background("Luminous Fall", { gems: 500 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/eternal-autumn/luminous-fall.gif", url: "https://i.ibb.co/6cqN7J0v/Luminous-Background.gif" }), { delay: 140 }),
        new Background("Crimson Reflection", { gems: 500 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/eternal-autumn/crimson-reflection.gif", url: "https://i.ibb.co/d3wb06S/Isolde-Background.gif" }), { delay: 90 }),
        new Background("Whispering Leaves", { gems: 500 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/eternal-autumn/whispering-leaves.gif", url: "https://i.ibb.co/tPYVdK40/Kisogi-Background.gif" }), { delay: 200 }),
    ]),

    new ProfileSet("Ai Hoshino", 13, { jades: 800, gems: 1000, coins: 1_500_000 }, [
        new Background("Ai", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/ai-hoshino/ai.jpg", url: "https://i.ibb.co/mC3GdGYC/ai.jpg" })),
        new Background("Ai Hoshino", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/ai-hoshino/ai-hoshino.gif", url: "https://i.ibb.co/8gXrCNSC/ezgif-6dfcecd6ed4d8a.gif" }), { delay: 40 }),
        new Background("Ai Outfits", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/ai-hoshino/ai-outfits.gif", url: "https://i.ibb.co/qMQw7ZtX/ezgif-6c40ce606afb09.gif" }), { delay: 80 }),
        new Background("Ai Vibing", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/ai-hoshino/ai-vibing.gif", url: "https://i.ibb.co/ymDdpqSF/ezgif-67abc5540fd53b.gif" }), { delay: 30 }),
        new Background("Ai Tease", { gems: 300, coins: 500_000 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/ai-hoshino/ai-tease.gif", url: "https://i.ibb.co/PZYGCQGV/ezgif-6442bffaea6a72.gif" }), { delay: 60 }),
    ]),

    new ProfileSet("Devastation", 14, { jades: 900, gems: 1000 }, [
        new Background("Turned to Ashes", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/devastation/turned-to-ashes.jpg", url: "https://i.ibb.co/XrRD8krF/20250910-104758-0003.png" })),
        new Background("The Gap", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/devastation/the-gap.jpg", url: "https://i.ibb.co/S4Y073nN/20250910-104758-0002.png" })),
        new Background("Grave Horizon", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/devastation/grave-horizon.jpg", url: "https://i.ibb.co/MkCbQ61W/20250910-104758-0001.png" })),
        new Background("Black Death", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/devastation/black-death.jpg", url: "https://i.ibb.co/DHcQ6frY/20250910-104758-0000.png" })),
    ]),

    new ProfileSet("Augury", 15, { jades: 900, gems: 1000 }, [
        new Background("Red Death", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/augury/red-death.jpg", url: "https://i.ibb.co/dsmQqr1k/20250906-233439-0000.png" })),
        new Background("Devil Man", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/augury/devil-man.jpg", url: "https://i.ibb.co/q3HNgJBp/20250906-233439-0001.png" })),
        new Background("The Chapel", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/augury/the-chapel.jpg", url: "https://i.ibb.co/VYTzDxy6/20250906-233439-0002.png" })),
        new Background("Bad Omen", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/augury/bad-omen.jpg", url: "https://i.ibb.co/rRBK5rGJ/20250906-233439-0003.png" })),
    ]),

    new ProfileSet("Festival of Shadows", 16, { jades: 1000, gems: 1200 }, [
        new Background("Crimson Midnight", { gems: 500 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/festival-of-shadows/crimson-midnight.gif", url: "https://i.ibb.co/b54zzhC9/Dalus-Background.gif" }), { delay: 200 }),
        new Background("Silent Lanterns", { gems: 500 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/festival-of-shadows/silent-lanterns.gif", url: "https://i.ibb.co/v4njF45n/Mari-Background.gif" }), { delay: 143 }),
        new Background("Harvest Enchantress", { gems: 500 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/festival-of-shadows/harvest-enchantress.gif", url: "https://i.ibb.co/93NzZPDQ/Cecilia-Background.gif" }), { delay: 200 }),
    ]),

    new ProfileSet("Echoes of Frost", 17, { jades: 900, gems: 1000 }, [
        new Background("Veil of Branches", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/echoes-of-frost/veil-of-branches.jpg", url: "https://i.ibb.co/Cs9BrDyH/Nature-blue-white-fog.jpg" })),
        new Background("The Warmth Within", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/echoes-of-frost/the-warmth-within.jpg", url: "https://i.ibb.co/NnNBVkLY/Nature-blue-white-fog-animals.jpg" })),
        new Background("Once Upon a Mine", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/echoes-of-frost/once-upon-a-mine.jpg", url: "https://i.ibb.co/hFdDz93M/Blue.jpg" })),
        new Background("Petal Pond", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/echoes-of-frost/petal-pond.jpg", url: "https://i.ibb.co/HDNNkHvs/Green-nature-water-flowers.jpg" })),
    ]),

    new ProfileSet("Aurora Borealis", 18, { jades: 900, gems: 1000 }, [
        new Background("Polar Veil", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/aurora-borealis/polar-veil.jpg", url: "https://i.ibb.co/Q7Z1gVNm/1.jpg" })),
        new Background("Shimmering Skies", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/aurora-borealis/shimmering-skies.jpg", url: "https://i.ibb.co/B2DYXTPM/2.jpg" })),
        new Background("Celestial Tides", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/aurora-borealis/celestial-tides.jpg", url: "https://i.ibb.co/fzzVvj9P/3.jpg" })),
        new Background("Emerald Dusk", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/aurora-borealis/emerald-dusk.jpg", url: "https://i.ibb.co/Hpztt2WX/4.jpg" })),
    ]),

    new ProfileSet("Winter Solace", 19, { jades: 900, gems: 1000 }, [
        new Background("Temple of Snow", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/winter-solace/temple-of-snow.jpg", url: "https://i.ibb.co/9mnKmFTw/temple-of-snow.jpg" })),
        new Background("Moonlit Ridge", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/winter-solace/moonlit-ridge.jpg", url: "https://i.ibb.co/qzWCqbJ/moonlit-ridge.jpg" })),
        new Background("Frosted Silence", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/winter-solace/frosted-silence.jpg", url: "https://i.ibb.co/1Yfkv8WY/frosted-silence.jpg" })),
        new Background("Midnight Village", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/winter-solace/midnight-village.jpg", url: "https://i.ibb.co/SDdKgVbQ/midnight-village.jpg" })),
    ]),

    new ProfileSet("Forever Valentines", 20, { jades: 900, gems: 1200, season_keys: 80 }, [
        new Background("Love You, Mari", { gems: 500 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/forever-valentines/love-you-mari.gif", url: "https://i.ibb.co/zTYsCR9L/love-you-mari.gif" }), { delay: 200 }),
        new Background("Gazing at the Stars", { gems: 500 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/forever-valentines/gazing-at-the-stars.gif", url: "https://i.ibb.co/JFnbxpby/gazing-at-the-stars.gif" }), { delay: 200 }),
        new Background("Dalus and Kisogi Valentine", { gems: 500 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/forever-valentines/dalus-and-kisogi-valentine.gif", url: "https://i.ibb.co/xtQLS8my/dalus-and-kisogi-valentine.gif" }), { delay: 125 }),
    ]),

    new ProfileSet("Fireworks", 21, { jades: 800, gems: 1200, season_keys: 60 }, [
        new Background("Vibrant Fireworks", { gems: 400 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/fireworks/vibrant-fireworks.gif", url: "https://i.ibb.co/YBRBhmTv/vibrant-fireworks.gif" }), { delay: 100 }),
        new Background("Explosive Fireworks", { gems: 400 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/fireworks/explosive-fireworks.gif", url: "https://i.ibb.co/hxCwjfhh/explosive-fireworks.gif" }), { delay: 100 }),
        new Background("Bright Fireworks", { gems: 400 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/fireworks/bright-fireworks.gif", url: "https://i.ibb.co/rR3Vtr92/bright-fireworks.gif" }), { delay: 80 }),
        new Background("Midnight Fireworks", { gems: 400 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/fireworks/midnight-fireworks.gif", url: "https://i.ibb.co/DP3gQFx8/midnight-fireworks.gif" }), { delay: 80 }),
    ]),

    new ProfileSet("Moments", 22, { jades: 800, gems: 1200, season_keys: 70 }, [
        new Background("Denji's Fantasy", { gems: 500 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/moments/denjis-fantasy.gif", url: "https://i.ibb.co/VpY4VR3T/denjis-fantasy.gif" }), { delay: 125 }),
        new Background("Floating Hearts", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/moments/floating-hearts.jpg", url: "https://i.ibb.co/8LTcXN9s/floating-hearts.jpg" })),
        new Background("Midnight Disconnect", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/moments/midnight-disconnect.jpg", url: "https://i.ibb.co/8LD8Zjxg/midnight-disconnect.jpg" })),
        new Background("Eye to Eye", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/moments/eye-to-eye.jpg", url: "https://i.ibb.co/whgS7fSz/eye-to-eye.jpg" })),
    ]),

    new ProfileSet("Sanguine Reflections", 23, { jades: 2000, gems: 2400 }, [
        new Background("Fallen Grace", { gems: 600 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/sanguine-reflections/fallen-grace.jpg", url: "https://i.ibb.co/QFW8DDYM/fallen-grace.jpg" })),
        new Background("Café Rei", { gems: 800 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/sanguine-reflections/cafe-rei.gif", url: "https://i.ibb.co/fGqKMVvc/cafe-rei.gif" }), { delay: 100 }),
        new Background("Candid Noir", { gems: 800 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/sanguine-reflections/candid-noir.gif", url: "https://i.ibb.co/ks479wKb/candid-noir.gif" }), { delay: 100 }),
        new Background("Scarlet in the Rain", { gems: 800 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/sanguine-reflections/scarlet-in-the-rain.gif", url: "https://i.ibb.co/PGtTHSvM/scarlet-in-the-rain.gif" }), { delay: 100 }),
    ]),



];
