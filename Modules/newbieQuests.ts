import { Client } from "discord.js";
import { getOwnedCharacterIds, getUserSchema, getUserWeapons, updateUsersAndCache } from "./queries.js";
import { items } from "./items.js";
import { classes } from "./classes.js";
import { userLevel, getItemLevel, getClassLvl } from "./functions.js";
import { characters } from "./chars.js";
import { CompactUserSchema, UpdateUserOptions, WeaponSchema, CharacterRarity } from "../types.js";

const shardEmojis = {
    "ss": "<:ss_shard:917203009543503892>",
    "s": "<:s_shard:917202925514817566>",
    "a": "<:a_shard:917202904862052392>",
    "b": "<:b_shard:917202862851899392>",
    "c": "<:c_shard:917202862499582002>",
    "d": "<:d_shard:917202840563363891>",
} as const;

const ticketEmojis = {
    "ss": "<:ss_ticket:927503239396622336>",
    "s": "<:s_ticket:927642487705722890>",
    "a": "<:a_ticket:929420377946472508>",
    "b": "<:b_ticket:929420396535615519>",
    "c": "<:c_ticket:929420424645853214>",
    "d": "<:d_ticket:929420447102152714>",
} as const;

const newbieLock = new Map<string, Promise<void>>();

export type NewbieCategory = "progression" | "characters" | "dungeon" | "chest";

export const newbieCategories = [
    { id: "progression", label: "Progression", emoji: "⭐", description: "Level up, refine and master your account" },
    { id: "characters", label: "Characters", emoji: "🎴", description: "Collect and grow your roster" },
    { id: "dungeon", label: "Dungeon", emoji: "⚔️", description: "Climb the dungeon and win battles" },
    { id: "chest", label: "Chest", emoji: "📦", description: "Upgrade your equipment" },
] as const satisfies readonly { id: NewbieCategory; label: string; emoji: string; description: string; }[];

export interface NewbieData {
    weapons: WeaponSchema[];
    ownedCharacterIds: number[];
};

export class newbieQuestInfo {
    private _title: string;
    private _description: string;
    private _id: number;
    private _category: NewbieCategory;
    private _check: (stats: CompactUserSchema, data: NewbieData) => boolean;
    private _progress: (stats: CompactUserSchema, data: NewbieData) => { value: number; target: number; };
    private _rewards: string[];

    constructor(
        title: string,
        description: string,
        id: number,
        category: NewbieCategory,
        check: (stats: CompactUserSchema, data: NewbieData) => boolean,
        progress: (stats: CompactUserSchema, data: NewbieData) => { value: number; target: number; },
        ...rewards: string[]
    ) {
        this._title = title;
        this._description = description;
        this._id = id;
        this._category = category;
        this._check = check;
        this._progress = progress;
        this._rewards = rewards;
    };

    get title() {
        return this._title;
    };
    get description() {
        return this._description;
    };
    get id() {
        return this._id;
    };
    get category() {
        return this._category;
    };
    get check() {
        return this._check;
    };
    get progress() {
        return this._progress;
    };
    get rewards() {
        return this._rewards;
    };
};

//--------------------------------------------//
//              METRIC HELPERS                //
//--------------------------------------------//

const RARITY_CHAIN: readonly CharacterRarity[] = ["SS", "S", "A", "B", "C", "D"];

function accountLevel(stats: CompactUserSchema) {
    return userLevel(stats.xp);
};

function masterClassLevel(stats: CompactUserSchema) {
    return classes
        .filter((c) => c.tier === 3 && stats.dungeon_classes.includes(c.id))
        .reduce((sum, c) => sum + getClassLvl(c.id, stats.dungeon_classlevels), 0);
};

function maxRefinement(stats: CompactUserSchema) {
    return Object.values(stats.char_ref).reduce((max, ref) => Math.max(max, ref), 0);
};

function maxRefinedCount(stats: CompactUserSchema) {
    return Object.values(stats.char_ref).filter((ref) => ref >= 6).length;
};

function currentDungeonFloor(stats: CompactUserSchema) {
    return Object.entries(stats.dungeon_floors)
        .filter(([, wins]) => wins > 0)
        .reduce((max, [floor]) => Math.max(max, parseInt(floor)), 0);
};

function totalDungeonWins(stats: CompactUserSchema) {
    return Object.values(stats.dungeon_floors).reduce((sum, wins) => sum + wins, 0);
};

function craftingCount(stats: CompactUserSchema) {
    return Object.entries(stats.items)
        .filter(([itemId]) => items[parseInt(itemId)]?.type === "crafting material")
        .reduce((sum, [, amount]) => sum + amount, 0);
};

function entryItemCount(stats: CompactUserSchema) {
    return Object.entries(stats.items)
        .filter(([itemId, amount]) => amount > 0 && items[parseInt(itemId)]?.type === "entry item")
        .length;
};

function ownedRarityCount(data: NewbieData, rarity: CharacterRarity) {
    return data.ownedCharacterIds.filter((id) => characters[id]?.rarity === rarity).length;
};

function minRarityCount(data: NewbieData) {
    return RARITY_CHAIN.reduce((min, rarity) => Math.min(min, ownedRarityCount(data, rarity)), Infinity);
};

function ownedExCount(data: NewbieData) {
    return ownedRarityCount(data, "EX");
};

function maxWeaponLevel(data: NewbieData) {
    return data.weapons
        .filter((weapon) => weapon.item_type === "weapon")
        .reduce((max, weapon) => Math.max(max, getItemLevel(weapon.level)), 0);
};

function maxArmorLevel(data: NewbieData, types: string[]) {
    return data.weapons
        .filter((weapon) => weapon.item_type === "armor" && types.includes(items[weapon.itemid]?.type))
        .reduce((max, weapon) => Math.max(max, getItemLevel(weapon.level)), 0);
};

function maxRingAscension(data: NewbieData) {
    return data.weapons
        .filter((weapon) => weapon.item_type === "ring")
        .reduce((max, weapon) => Math.max(max, weapon.level + 1), 0);
};

//--------------------------------------------//
//              QUEST DEFINITIONS             //
//--------------------------------------------//

export const newbieQuests: newbieQuestInfo[] = [];

type Milestone = [target: number, rewards: string[]];

function addChain(
    category: NewbieCategory,
    title: string,
    describe: (target: number) => string,
    value: (stats: CompactUserSchema, data: NewbieData) => number,
    milestones: Milestone[],
) {
    for (const [target, rewards] of milestones) {
        newbieQuests.push(new newbieQuestInfo(
            title,
            describe(target),
            newbieQuests.length,
            category,
            (stats, data) => value(stats, data) >= target,
            (stats, data) => ({ value: value(stats, data), target }),
            ...rewards,
        ));
    };
};

// Progression
addChain("progression", "Level Up", (t) => `Reach account level ${t}`, (stats) => accountLevel(stats), [
    [5, ["xp|50", "coins|500"]],
    [10, ["xp|100", "coins|1000"]],
    [15, ["xp|200", "coins|2000", "a ticket|1"]],
    [25, ["xp|300", "coins|3000", "a ticket|2"]],
    [40, ["xp|400", "coins|5000", "s ticket|1"]],
    [50, ["xp|500", "coins|10000", "ss ticket|1"]],
]);

addChain("progression", "Master of Classes", (t) => `Reach a combined master class level of ${t}`, (stats) => masterClassLevel(stats), [
    [25, ["xp|50", "coins|500"]],
    [50, ["xp|100", "coins|1000"]],
    [150, ["xp|200", "coins|1500", "a ticket|1"]],
    [250, ["xp|300", "coins|2000", "a ticket|2"]],
    [350, ["xp|450", "coins|3000", "s ticket|1"]],
    [500, ["xp|600", "coins|5000", "ss ticket|1"]],
]);

addChain("progression", "Refinement", (t) => `Refine a character to level ${t}`, (stats) => maxRefinement(stats), [
    [2, ["xp|50", "coins|500"]],
    [3, ["xp|100", "coins|1000", "b shard|4"]],
    [4, ["xp|150", "coins|2000", "b shard|8"]],
    [5, ["xp|250", "coins|3000", "a shard|4"]],
    [6, ["xp|400", "coins|5000", "a shard|8"]],
]);

addChain("progression", "Masterwork", (t) => `Max-refine ${t} character${t > 1 ? "s" : ""}`, (stats) => maxRefinedCount(stats), [
    [2, ["xp|75", "coins|1000"]],
    [5, ["xp|150", "coins|2500", "a shard|8"]],
    [10, ["xp|300", "coins|5000", "s shard|4"]],
    [15, ["xp|450", "coins|7500", "s shard|8"]],
    [20, ["xp|600", "coins|10000", "ss shard|4"]],
    [30, ["xp|800", "coins|15000", "ss shard|8"]],
]);

addChain("progression", "Unboxing", (t) => `Open ${t} lootboxes`, (stats) => stats.lootboxesopened, [
    [2, ["xp|20", "coins|200"]],
    [5, ["xp|40", "coins|400"]],
    [10, ["xp|75", "coins|600"]],
    [20, ["xp|125", "coins|1000"]],
    [40, ["xp|200", "coins|2000", "gems|2"]],
    [80, ["xp|300", "coins|3000", "gems|4"]],
]);

// Characters
addChain("characters", "Rarity Collector", (t) => `Own ${t} character${t > 1 ? "s" : ""} of every rarity`, (_stats, data) => minRarityCount(data), [
    [2, ["xp|50", "coins|500"]],
    [5, ["xp|100", "coins|1000", "a ticket|2"]],
    [10, ["xp|200", "coins|2000", "s ticket|1"]],
    [20, ["xp|350", "coins|3500", "s ticket|2"]],
    [30, ["xp|500", "coins|5000", "ss ticket|1"]],
    [50, ["xp|750", "coins|7500", "ss ticket|2"]],
]);

addChain("characters", "Collector", (t) => `Own ${t} characters`, (_stats, data) => data.ownedCharacterIds.length, [
    [25, ["xp|25", "coins|500"]],
    [50, ["xp|50", "coins|1000"]],
    [100, ["xp|100", "coins|1500", "a ticket|1"]],
    [200, ["xp|200", "coins|2000", "a ticket|2"]],
    [300, ["xp|300", "coins|3000", "s ticket|1"]],
    [400, ["xp|500", "coins|5000", "s ticket|2"]],
]);

addChain("characters", "EX Hunter", (t) => `Own ${t} EX-tier character${t > 1 ? "s" : ""}`, (_stats, data) => ownedExCount(data), [
    [1, ["xp|75", "coins|1000", "gems|2"]],
    [2, ["xp|150", "coins|2000", "gems|3"]],
    [3, ["xp|250", "coins|3000", "gems|4"]],
    [4, ["xp|400", "coins|5000", "gems|5"]],
    [5, ["xp|600", "coins|7500", "gems|5"]],
    [6, ["xp|900", "coins|10000", "gems|5"]],
]);

addChain("characters", "A ticket to Camelot", (t) => `Open ${t} tickets`, (stats) => stats.ticketsopened, [
    [5, ["xp|25", "coins|250"]],
    [15, ["xp|50", "coins|500"]],
    [25, ["xp|100", "coins|1000"]],
    [35, ["xp|150", "coins|1500", "a shard|4"]],
    [50, ["xp|250", "coins|2500", "s shard|4"]],
    [100, ["xp|400", "coins|4000", "ss shard|4"]],
]);

// Dungeon
addChain("dungeon", "Sweep the floors", (t) => `Clear dungeon floor ${t}`, (stats) => currentDungeonFloor(stats), [
    [5, ["xp|50", "coins|500"]],
    [10, ["xp|100", "coins|1000", "c ticket|2"]],
    [20, ["xp|200", "coins|2000", "b ticket|1"]],
    [30, ["xp|350", "coins|3500", "b ticket|2"]],
    [40, ["xp|500", "coins|5000", "a ticket|1"]],
    [50, ["xp|750", "coins|7500", "a ticket|2"]],
]);

addChain("dungeon", "Dungeon Delver", (t) => `Win ${t} dungeon battles`, (stats) => totalDungeonWins(stats), [
    [20, ["xp|50", "coins|500"]],
    [40, ["xp|100", "coins|700"]],
    [80, ["xp|200", "coins|1000", "c shard|4"]],
    [160, ["xp|350", "coins|1500", "b shard|4"]],
    [320, ["xp|500", "coins|2000", "a shard|4"]],
    [500, ["xp|750", "coins|4000", "s shard|4"]],
]);

addChain("dungeon", "Crafter", (t) => `Have ${t} crafting items combined`, (stats) => craftingCount(stats), [
    [50, ["xp|300", "coins|500", "b shard|4"]],
    [100, ["xp|300", "coins|1000", "b shard|8"]],
    [150, ["xp|300", "coins|1500", "a shard|4"]],
    [200, ["xp|300", "coins|2000", "a shard|8"]],
    [250, ["xp|300", "coins|2500", "s shard|4"]],
    [400, ["xp|300", "coins|3000", "s shard|8"]],
]);

addChain("dungeon", "Hidden secrets", (t) => `Have ${t} entry item${t > 1 ? "s" : ""}`, (stats) => entryItemCount(stats), [
    [1, ["xp|100", "coins|1000", "gems|2"]],
    [2, ["xp|200", "coins|2000", "gems|3"]],
    [3, ["xp|300", "coins|3000", "gems|5"]],
]);

// Chest
addChain("chest", "Weapon Smithing", (t) => `Have a weapon at level ${t}`, (_stats, data) => maxWeaponLevel(data), [
    [20, ["xp|50", "coins|500"]],
    [40, ["xp|100", "coins|1000", "a shard|4"]],
    [60, ["xp|200", "coins|2000", "s shard|4"]],
    [80, ["xp|350", "coins|3000", "s shard|8"]],
    [100, ["xp|500", "coins|5000", "ss shard|4"]],
    [120, ["xp|750", "coins|7000", "ss shard|8"]],
]);

addChain("chest", "Armguard", (t) => `Have a helmet or glove at level ${t}`, (_stats, data) => maxArmorLevel(data, ["helmet", "gloves"]), [
    [20, ["xp|50", "coins|500"]],
    [40, ["xp|100", "coins|1000", "b shard|4"]],
    [60, ["xp|200", "coins|2000", "a shard|4"]],
    [80, ["xp|350", "coins|3500", "a shard|8"]],
    [100, ["xp|500", "coins|5000", "s shard|4"]],
    [120, ["xp|750", "coins|7500", "s shard|8"]],
]);

addChain("chest", "Raiment", (t) => `Have a robe or boot at level ${t}`, (_stats, data) => maxArmorLevel(data, ["cuirass", "boots"]), [
    [20, ["xp|50", "coins|500"]],
    [40, ["xp|100", "coins|1000", "b shard|4"]],
    [60, ["xp|200", "coins|2000", "a shard|4"]],
    [80, ["xp|350", "coins|3500", "a shard|8"]],
    [100, ["xp|500", "coins|5000", "s shard|4"]],
    [120, ["xp|750", "coins|7500", "s shard|8"]],
]);

addChain("chest", "Ring Ascension", (t) => `Have a ring at ascension ${t}`, (_stats, data) => maxRingAscension(data), [
    [2, ["xp|150", "coins|1000", "a shard|4"]],
    [3, ["xp|300", "coins|2000", "a shard|8"]],
    [4, ["xp|500", "coins|3000", "s shard|4"]],
]);

addChain("chest", "Chest Opener", (t) => `Open ${t} chests`, (stats) => stats.chestsopened, [
    [25, ["xp|25", "coins|500"]],
    [50, ["xp|50", "coins|1000"]],
    [100, ["xp|100", "coins|1500", "a ticket|1"]],
    [200, ["xp|200", "coins|2000", "a ticket|2"]],
    [300, ["xp|300", "coins|2500", "s ticket|1"]],
    [400, ["xp|500", "coins|3000", "s ticket|2"]],
]);

export const getNewbieQuests = (category: NewbieCategory) => newbieQuests.filter((e) => e.category === category);

export function newbieChains(category: NewbieCategory) {
    const chains: { title: string; quests: newbieQuestInfo[]; }[] = [];
    for (const quest of getNewbieQuests(category)) {
        const last = chains[chains.length - 1];
        if (last && last.title === quest.title) last.quests.push(quest);
        else chains.push({ title: quest.title, quests: [quest] });
    };
    return chains;
};

export function formatNewbieRewards(quest: newbieQuestInfo): string {
    const parts: string[] = [];
    for (const rew of quest.rewards) {
        const amount = rew.split("|")[1];
        if (/^xp\|/i.test(rew)) parts.push(`**${amount}** XP`);
        else if (rew.match(/coins/i)) parts.push(`**${amount}** <:coins:872926669055356939>`);
        else if (rew.match(/gems/i)) parts.push(`**${amount}** <:genesis_gems:1034179687720681492>`);
        else if (rew.match(/shard/i)) parts.push(`**${amount}** ${shardEmojis[rew.split(" ")[0] as keyof typeof shardEmojis]}`);
        else if (rew.match(/ticket/i)) parts.push(`**${amount}** ${ticketEmojis[rew.split(" ")[0] as keyof typeof ticketEmojis]}`);
        else if (rew.match(/lb\|/i)) parts.push(`**${amount}** ${amount === "1" ? "lootbox" : "lootboxes"}`);
    };
    return parts.join(", ") || "None";
};

export async function claimNewbieQuests(client: Client, userId: string, quests: newbieQuestInfo[]): Promise<newbieQuestInfo[]> {
    // Serialize claims per user so two quest messages can't pay out twice.
    const previousUpdate = newbieLock.get(userId);
    let release!: () => void;
    const currentUpdate = new Promise<void>((resolve) => { release = resolve; });
    newbieLock.set(userId, currentUpdate);
    await previousUpdate;

    try {
        // Re-read inside the lock: the caller's snapshot may predate a concurrent claim.
        const freshStats = await getUserSchema(userId);
        if (!freshStats) return [];
        const freshData: NewbieData = {
            weapons: await getUserWeapons(userId),
            ownedCharacterIds: await getOwnedCharacterIds(userId, freshStats.chars),
        };

        const claimable = quests.filter((quest) => !freshStats.newbie.includes(quest.id) && quest.check(freshStats, freshData));
        if (!claimable.length) return [];

        const increments: Record<string, number> = {};
        const bump = (key: string, amount: number) => increments[key] = (increments[key] ?? 0) + amount;

        for (const quest of claimable) {
            for (const rew of quest.rewards) {
                const amount = parseInt(rew.split("|")[1]) || 0;
                if (/^xp\|/i.test(rew)) bump("xp", amount);
                else if (rew.match(/coins/i)) bump("coins", amount);
                else if (rew.match(/gems/i)) bump("gems", amount);
                else if (rew.match(/shard/i)) bump(`${rew.split(" ")[0]}shard`, amount);
                else if (rew.match(/ticket/i)) bump(`${rew.split(" ")[0]}ticket`, amount);
                else if (rew.match(/lb\|/i)) bump("lootbox", amount);
            };
        };

        const updates: UpdateUserOptions = { newbie: { type: "append_unique", value: claimable.map((quest) => quest.id) } };
        Object.entries(increments).forEach(([key, value]) => {
            if (value > 0) (updates as Record<string, { type: "increment"; value: number; }>)[key] = { type: "increment", value };
        });

        await updateUsersAndCache(client, userId, { updates });
        return claimable;
    } finally {
        release();
        if (newbieLock.get(userId) === currentUpdate) newbieLock.delete(userId);
    };
};
