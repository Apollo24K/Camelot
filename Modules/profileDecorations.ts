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

    new ProfileSet("Shades of Rust", 10, { jades: 900, gems: 1000, season_keys: 60 }, [
        new Background("Autumn Breaths", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/shades-of-rust/autumn-breaths.jpg", url: "https://i.ibb.co/8DqzCMQ2/20250906-141336-0000.png" })),
        new Background("Nostalgic Sunlight", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/shades-of-rust/nostalgic-sunlight.jpg", url: "https://i.ibb.co/tMQQXYmX/20250906-141314-0000.png" })),
        new Background("Familiar Roads", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/shades-of-rust/familiar-roads.jpg", url: "https://i.ibb.co/B5BS4Ckm/20250906-141207-0000.png" })),
        new Background("A Trace of Memory", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/shades-of-rust/a-trace-of-memory.jpg", url: "https://i.ibb.co/vCJCr214/20250906-141504-0000.png" })),
    ]),

    new ProfileSet("Autumn Forest", 11, { jades: 900, gems: 1000, season_keys: 60 }, [
        new Background("Crimson Grove", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/autumn-forest/crimson-grove.jpg", url: "https://i.ibb.co/skFryJJ/fall1.png" })),
        new Background("Golden Canopy", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/autumn-forest/golden-canopy.jpg", url: "https://i.ibb.co/Zp1gcrmD/fall2.png" })),
        new Background("Amber Meadow", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/autumn-forest/amber-meadow.jpg", url: "https://i.ibb.co/0Nmjb1n/fall3.png" })),
        new Background("Russet Wilderness", { gems: 300 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/autumn-forest/russet-wilderness.jpg", url: "https://i.ibb.co/hxjYvpVD/fall4.png" })),
    ]),

    new ProfileSet("Eternal Autumn", 12, { jades: 1000, gems: 1200, season_keys: 80 }, [
        new Background("Luminous Fall", { gems: 500 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/eternal-autumn/luminous-fall.gif", url: "https://i.ibb.co/6cqN7J0v/Luminous-Background.gif" }), { delay: 140 }),
        new Background("Crimson Reflection", { gems: 500 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/eternal-autumn/crimson-reflection.gif", url: "https://i.ibb.co/d3wb06S/Isolde-Background.gif" }), { delay: 90 }),
        new Background("Whispering Leaves", { gems: 500 }, ["shop"], new Asset({ path: "Images/ui/profile/backgrounds/eternal-autumn/whispering-leaves.gif", url: "https://i.ibb.co/tPYVdK40/Kisogi-Background.gif" }), { delay: 200 }),
    ]),



];
