import fs from 'fs';
import { EmbedBuilder, AttachmentBuilder, ChatInputCommandInteraction, User } from "discord.js";
import imagesize from 'imagesize';
import axios from 'axios';
import sharp from 'sharp';
import https from "https";
import { createCanvas } from '@napi-rs/canvas';
import crypto from 'crypto';
import charInfo, { characters } from "./chars";
import { anime } from "./anime";
import { achievements } from "./achievements";
import { dailies } from "./dailyQuests";
import classInfo, { classes } from "./classes";
import { AbilityResponse, donationWeekStart, rankLowerRanges } from "./components";
import buffInfo from "./buffs";
import delayedBuffs from "./delayedBuffs";
import { armorInfo, itemInfo, items, lootInfo, ringInfo, weaponInfo } from "./items";
import _ from 'lodash';
import { Buffs, CharacterRarity, ClassStats, CompactUserSchema, DetailedStats, Expertise, GuildDonationSchema, GuildSchema, IRoK, MatchStats, PrimaryStat, RaidRank, UserSchemaForStats, WeaponSchema } from '../types';
import { curses } from './curses';
import { getWeaponSchema } from './queries';

const statsOp: { base: { hp: Record<number, number>; atk: Record<number, number>; def: Record<number, number>; expertise: Record<number, string>; }; } = {
    "base": {
        "hp": { "238": -20, "405": -6, "460": 54, "512": 60, "2016": -10, "2079": 12, "2360": 12, "2597": 24, "3150": 6, "3307": -20, "3408": -20, "3409": 12, "3886": 20, "4769": -20, "5032": -9, "5341": 20, "5344": 16, "5819": -20, "8188": 30, "8189": 40, "8521": 12, "8582": 20, "9606": -6, "10520": 37, "10521": -14, "10523": 30, "10530": 40, "12000": 16, "12121": 10, "12424": 1, "17583": -11, "17688": -25, "17689": 12, "17871": -13, "18011": -9 },
        "atk": { "238": -11, "405": 12, "460": -12, "512": -10, "2079": 9, "2016": -2, "3150": 4, "3409": 14, "3886": 4, "4250": 10, "4712": -8, "5341": 6, "5344": 10, "6082": -13, "8187": 7, "8189": 10, "8521": 5, "9606": 3, "10517": 10, "10520": 20, "10521": -4, "10523": 5, "10530": 8, "12000": 10, "12121": 7, "12393": -5, "12424": 15, "17583": -10, "17689": -2, "17871": -4, "18011": -6 },
        "def": { "405": 1, "460": 1, "512": 15, "2360": 9, "2597": 5, "3150": 8, "3409": 6, "9606": 19, "10517": 5, "12121": 5, "12393": 10, "12424": 10, "17583": -18, "17871": -5, "18011": -4 },
        "expertise": { "72": "sword", "73": "sword", "77": "bow", "159": "sword", "405": "sword", "408": "any", "460": "sword", "463": "sword", "512": "shield", "523": "sword", "577": "staff", "578": "staff", "680": "lance", "688": "sword", "712": "lance", "733": "sword", "735": "bow", "767": "staff", "769": "sword", "844": "dagger", "999": "lance", "1001": "sword", "1550": "sword", "1824": "dagger", "1850": "lance", "1851": "lance", "2078": "staff", "2079": "axe", "2080": "lance", "2291": "staff", "2420": "sword", "2597": "sword", "2814": "bow", "2848": "dagger", "3109": "shield", "3150": "dagger", "3307": "axe", "3308": "lance", "4250": "sword", "4474": "staff", "4767": "sword", "4769": "staff", "4942": "sword", "5224": "dagger", "5341": "lance", "6029": "bow", "6030": "bow", "8189": "sword", "8521": "dagger", "9000": "sword", "9365": "staff", "9454": "dagger", "9648": "dagger", "9677": "sword", "9824": "axe", "10300": "lance", "10324": "sword", "10517": "sword", "10520": "lance", "10521": "staff", "10522": "dagger", "10523": "bow", "10524": "staff", "10527": "dagger", "10800": "sword", "10958": "sword", "11244": "sword", "11246": "sword", "12345": "staff", "12387": "axe", "12388": "any", "12393": "bow", "12399": "bow", "12450": "lance", "12451": "sword", "12775": "dagger", "12776": "dagger", "12857": "sword", "13186": "bow", "13285": "sword", "13288": "staff", "13574": "staff", "13780": "sword", "14091": "bow", "14405": "bow", "14903": "bow", "14904": "sword", "15251": "lance", "16107": "bow", "16109": "sword", "16110": "lance", "16119": "bow", "16919": "sword", "17115": "sword", "17116": "sword", "17117": "staff", "17118": "sword", "17583": "any", "17686": "axe", "17687": "bow", "17688": "any", "17689": "any", "19048": "staff", "19050": "sword", "19051": "bow", "19277": "dagger", "21928": "bow", "21931": "sword", "22611": "staff", "23185": "sword" },
    },
};

export const getDimensions = (url: string): Promise<{ width: number; height: number; }> => {
    return new Promise((resolve, rejects) => {
        let request = https.get(url, (response) => {
            imagesize(response, (err, result) => {
                request.destroy();
                resolve(result);
            });
        });
    });
};

export const strCode = (id: number) => {
    let inp = characters[id].anime + characters[id].gender + characters[id].name;
    let hash = 0;
    if (inp.length < 2) return 111;
    for (let bi = 0; bi < inp.length; bi++) {
        let char = inp.charCodeAt(bi);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    };
    if (hash < 0) return -hash;
    return hash;
};

export const baseHP = (id: number) => {
    let hash = strCode(id) % 10;
    switch (characters[id].rarity) {
        case "EX": hash = Math.floor(420 + (20 * (hash / 9))); break; // 420-440
        case "SS": hash = Math.floor(380 + (60 * (hash / 9))); break; // 380-440
        case "S": hash = Math.floor(300 + (60 * (hash / 9))); break;  // 300-360
        case "A": hash = Math.floor(240 + (60 * (hash / 9))); break;  // 240-300
        case "B": hash = Math.floor(200 + (40 * (hash / 9))); break;  // 200-240
        case "C": hash = Math.floor(160 + (40 * (hash / 9))); break;   // 160-200
        case "D": hash = Math.floor(120 + (40 * (hash / 9))); break;   // 120-160
        default: hash = 1; break;
    };
    if (statsOp.base.hp[id]) hash += statsOp.base.hp[id];
    return hash;
};

export const baseATK = (id: number) => {
    let hash = Math.round(((strCode(id) % 100) / 10) + 0.01);
    switch (characters[id].rarity) {
        case "EX": hash = Math.floor(70 + (1 * hash)); break;  // 70-80
        case "SS": hash = Math.floor(60 + (2 * hash)); break;  // 60-80
        case "S": hash = Math.floor(48 + (1.2 * hash)); break; // 48-60
        case "A": hash = Math.floor(36 + (1.2 * hash)); break; // 36-48
        case "B": hash = Math.floor(30 + (1 * hash)); break;   // 30-40
        case "C": hash = Math.floor(24 + (1 * hash)); break;   // 24-34
        case "D": hash = Math.floor(20 + (1 * hash)); break;   // 20-30
        default: hash = 1; break;
    };
    if (statsOp.base.atk[id]) hash += statsOp.base.atk[id];
    return hash;
};

export const baseDEF = (id: number) => {
    let hash = strCode(id);
    let sum = 0;
    while (hash) {
        sum += hash % 10;
        hash = Math.floor(hash / 10);
    };
    hash = sum % 10;

    switch (characters[id].rarity) {
        case "EX": hash = Math.floor(59 + (11 / (hash + 1))); break; // 60-70
        case "SS": hash = Math.floor(48 + (22 / (hash + 1))); break; // 50-70
        case "S": hash = Math.floor(39 + (11 / (hash + 1))); break;  // 40-50
        case "A": hash = Math.floor(32 + (8 / (hash + 1))); break;  // 32-40
        case "B": hash = Math.floor(28 + (6 / (hash + 1))); break;  // 28-34
        case "C": hash = Math.floor(24 + (6 / (hash + 1))); break;  // 24-30
        case "D": hash = Math.floor(20 + (6 / (hash + 1))); break;  // 20-26
        default: hash = 1; break;
    };
    if (statsOp.base.def[id]) hash += statsOp.base.def[id];
    return hash;
};

export const baseEP = (id: number, hp = baseHP(id), atk = baseATK(id), def = baseDEF(id), md = atk, mr = def, cd = 1.25, cr = 0.18, dodge = 0.1) => {
    return Math.floor(((1 / (1 - dodge)) * (hp / Math.pow(0.99895, Math.max(def, mr))) / (200 / (Math.max(atk, md) * (1 + (cat1(cr) * (cd - 1)))))) * 100) / 100;
};

export const baseExpertise = (id: number) => {
    if (statsOp.base.expertise[id]) return statsOp.base.expertise[id];
    let hash = Math.floor(((strCode(id) % 60) / 10) + 0.01);

    switch (hash) {
        case 0: return "sword";
        case 1: return "staff";
        case 2: return "axe";
        case 3: return "bow";
        case 4: return "lance";
        case 5: return "dagger";
        default: return "sword";
    };
};

export const cat1 = (num: number) => {
    if (num > 1) return 1;
    if (num < 0) return 0;
    return num;
};

const lvlupStats = {
    "EX": { "hp": { "base": 5, "add": 1 }, "atk": { "base": 2.4, "add": 0.35 }, "def": { "base": 1.25, "add": 0.25 } },
    "SS": { "hp": { "base": 5, "add": 1 }, "atk": { "base": 2.4, "add": 0.35 }, "def": { "base": 1.25, "add": 0.25 } },
    "S": { "hp": { "base": 3.9, "add": 0.6 }, "atk": { "base": 1.9, "add": 0.3 }, "def": { "base": 1, "add": 0.2 } },
    "A": { "hp": { "base": 3.3, "add": 0.4 }, "atk": { "base": 1.6, "add": 0.25 }, "def": { "base": 0.8, "add": 0.15 } },
    "B": { "hp": { "base": 2.8, "add": 0.4 }, "atk": { "base": 1.2, "add": 0.3 }, "def": { "base": 0.6, "add": 0.2 } },
    "C": { "hp": { "base": 2.4, "add": 0.4 }, "atk": { "base": 0.9, "add": 0.35 }, "def": { "base": 0.5, "add": 0.15 } },
    "D": { "hp": { "base": 2, "add": 0.4 }, "atk": { "base": 0.75, "add": 0.25 }, "def": { "base": 0.4, "add": 0.1 } },
};

const retainItemStats = new Map<string, { timeout: NodeJS.Timeout, stats: WeaponSchema; }>();

export const getDetailedStats = async (id: number, inv: UserSchemaForStats, classLevels: Record<string, number>, lu: number = 0, refine: boolean = false) => {

    let dStats: DetailedStats = {
        "id": id,
        "name": characters[id].name,
        "hp": baseHP(id),
        "maxhp": 1,
        "bhp": 1,
        "atk": baseATK(id),
        "batk": 1,
        "def": baseDEF(id),
        "bdef": 1,
        "increase_defcap": 0,
        "ep": 0,
        "md": baseATK(id),
        "bmd": 1,
        "mr": baseDEF(id),
        "bmr": 0,
        "increase_mrcap": 0,
        "cr": 0.18,
        "cd": 1.25,
        "td": 0,
        "br": 0.2,
        "brCap": 0.5,
        "agility": 80,
        "dodge": 0.1,
        "dodgeCap": 0.5,
        "mana": 80,
        "mg": 15,
        "sm": 20,
        "shield": 0,
        "mdChance": 0,
        "rev": 0,
        "revhp": 0.5,
        "revivedTotal": 0,
        "maxRevivals": 0,
        "attackStreak": 0,
        "crittedTotal": 0,
        "selfheal": [],
        "selfhealChance": [],
        "dodgeHeal": 0,
        "critmana": 0,
        "usedBlockRound": -1,
        "blockBuffDef": 0,
        "blockBurn": 0,
        "blockStreak": 0,
        "dodgeStreak": 0,
        "damageTaken": 0,
        "executeHP": 0,
        "negateHeal": 0, // 1: negates heal
        "ignoreShield": false,
        "damageReduction": 0,
        "damageFormula": "default", // "default": default, "log_scale_<number>": example "log_scale_1.4"
        "delayedBuffs": [],
        "replaceButton": {},
        "dodgebuff": 0,
        "twinshot": 0,
        "selfdmg": 0,
        "critbleed": false,
        "critbleedlast": 0,
        "heap1": 0,
        "timeout": true,
        "allowExecution": true,
        "defUsed": 0,
        "lvl": (inv.level ?? 1) + lu,
        "ref": Math.min(6, ((inv.char_ref[id] ?? 0) + (refine ? 1 : 0))),
        "class": -1,
        "clvl": 1,
        "expertise": baseExpertise(id) as Expertise,
        "ringSlots": getRingSlotsTotal(inv),
        "weapon": -1,
        "weaponinfo": {},
        "weaponicon": "<:sword_empty:1034502134474997790>",
        "uniqueids": [] as string[],
        "ring1icon": "<:locked:1034511902417621002>",
        "ring2icon": "<:locked:1034511902417621002>",
        "ring3icon": "<:locked:1034511902417621002>",
        "rune": inv.equipment[`rune:${id}`],
        "runeicon": inv.equipment[`rune:${id}`] === undefined ? "<:rune_empty:1034507494539669635>" : items[parseInt(inv.equipment[`rune:${id}`])].emoji,
    };

    // Expertise change
    if (dStats.ref === 6) dStats.expertise = "any";
    dStats.weaponicon = {
        "sword": "<:sword_empty:1034502134474997790>",
        "staff": "<:staff_empty:1034502136622485524>",
        "axe": "<:axe_empty:1034567413527760917>",
        "bow": "<:bow_empty:1034567415209664672>",
        "lance": "<:lance_empty:1034567416522473502>",
        "dagger": "<:dagger_empty:1034567417982091434>",
        "shield": "<:shield_empty:1087089686809415730>",
        "any": "<:any_empty:1113010026664169494>",
    }[dStats.expertise];

    let clsStats: ClassStats;
    if (inv.class !== null) {
        dStats.class = inv.class;
        dStats.clvl = getClassLvl(dStats.class, classLevels);
        clsStats = classes[dStats.class].stats;
        (Object.keys(clsStats) as (keyof ClassStats)[]).forEach((s) => dStats[s] = dStats[s] * clsStats[s][0] + clsStats[s][1]);
        ["mana", "mg", "sm"].forEach((s) => dStats[s] = Math.floor(dStats[s]));
        dStats.brCap = parseFloat((dStats.brCap * clsStats.br[0] * 100).toFixed(2)) / 100;
        dStats.dodgeCap = parseFloat((dStats.dodgeCap * clsStats.dodge[0] * 100).toFixed(2)) / 100;
    };

    // Add level bonus
    const bankup = Math.max(0, Math.floor((Math.sqrt((2 * (inv.bank)) + (100 * (dStats.lvl * dStats.lvl)) + (700 * dStats.lvl) + 1225) / 10) - 3.5 - dStats.lvl));
    dStats.hp = Math.floor((1 + (0.3333 * dStats.ref)) * dStats.hp) + Math.round((lvlupStats[characters[id].rarity].hp.base + (lvlupStats[characters[id].rarity].hp.add * ((strCode(id) % 10) / 9))) * (dStats.lvl - 1 + bankup));
    dStats.atk = Math.floor((1 + (0.3333 * dStats.ref)) * dStats.atk) + Math.round((lvlupStats[characters[id].rarity].atk.base + (lvlupStats[characters[id].rarity].atk.add * ((dStats.atk - 50) / 30))) * (dStats.lvl - 1 + bankup));
    dStats.md = Math.floor((1 + (0.3333 * dStats.ref)) * dStats.md) + Math.round((lvlupStats[characters[id].rarity].atk.base + (lvlupStats[characters[id].rarity].atk.add * ((dStats.md - 50) / 30))) * (dStats.lvl - 1 + bankup));
    dStats.def = Math.floor((1 + (0.3333 * dStats.ref)) * dStats.def) + Math.round((lvlupStats[characters[id].rarity].def.base + (lvlupStats[characters[id].rarity].def.add * ((dStats.def - 50) / 30))) * (dStats.lvl - 1 + bankup));
    dStats.mr = Math.floor((1 + (0.3333 * dStats.ref)) * dStats.mr) + Math.round((lvlupStats[characters[id].rarity].def.base + (lvlupStats[characters[id].rarity].def.add * ((dStats.mr - 50) / 30))) * (dStats.lvl - 1 + bankup));
    dStats.bhp = dStats.hp, dStats.td = dStats.atk, dStats.batk = dStats.atk, dStats.bmd = dStats.md, dStats.bdef = dStats.def, dStats.bmr = dStats.mr;

    if (dStats.class !== -1) {
        const clsStats = classes[dStats.class].stats;
        let scale: Record<string, number> = [{},
        { "hp": 1.25, "atk": 0.75, "md": 0.75, "def": 0.3, "mr": 0.3, "mana": 0.15 },
        { "hp": 1.6, "atk": 1, "md": 1, "def": 0.5, "mr": 0.5, "mana": 0.2 },
        { "hp": 2.25, "atk": 1.1, "md": 1.1, "def": 0.6, "mr": 0.6, "mana": 0.25 },
        { "hp": 3, "atk": 1.4, "md": 1.4, "def": 0.8, "mr": 0.8, "mana": 0.32 }
        ][classes[dStats.class].tier];
        (["hp", "atk", "md", "mana"] as (keyof ClassStats)[]).forEach((s) => dStats[s] += Math.floor((scale[s] * clsStats[s][0]) * (dStats.clvl - 1)));
        dStats["def"] += Math.floor(Math.min(scale["def"] * clsStats["def"][0] * (dStats.clvl - 1), classes[dStats.class].tier * 100 * clsStats["def"][0]));
        dStats["mr"] += Math.floor(Math.min(scale["mr"] * clsStats["mr"][0] * (dStats.clvl - 1), classes[dStats.class].tier * 100 * clsStats["mr"][0]));

        // Old:
        // if (Math.floor((scale["def"] * clsStats["def"][0]) * (dStats.clvl-1)) >= (classes[dStats.class].tier*100*clsStats["def"][0])) dStats["def"] += parseInt(classes[dStats.class].tier*100*clsStats["def"][0]);
        // else dStats["def"] += Math.floor((scale["def"] * clsStats["def"][0]) * (dStats.clvl-1));
        // if (Math.floor((scale["mr"] * clsStats["mr"][0]) * (dStats.clvl-1)) >= (classes[dStats.class].tier*100*clsStats["mr"][0])) dStats["mr"] += parseInt(classes[dStats.class].tier*100*clsStats["mr"][0]);
        // else dStats["mr"] += Math.floor((scale["mr"] * clsStats["mr"][0]) * (dStats.clvl-1));
    };

    // Item Stats
    if (inv?.equipment) {
        let weapon: WeaponSchema | undefined, shield: WeaponSchema | undefined, helmet: WeaponSchema | undefined, cuirass: WeaponSchema | undefined, gloves: WeaponSchema | undefined, boots: WeaponSchema | undefined;

        // Add weapon stats if available
        if (inv.equipment.weapon) {
            clearTimeout(retainItemStats.get(inv.equipment.weapon)?.timeout);
            const cachedItem = retainItemStats.get(inv.equipment.weapon)?.stats;
            weapon = cachedItem ?? await getWeaponSchema(inv.equipment.weapon);

            if (weapon) {
                retainItemStats.set(inv.equipment.weapon, { stats: weapon, timeout: setTimeout(() => retainItemStats.delete(inv.equipment.weapon), 10 * 1000) });

                dStats.uniqueids.push(weapon.uniqueid.split(":")[0]);
                if (cachedItem === undefined) weapon.level = getItemLevel(weapon.level);

                const item = items[weapon.itemid];
                if (item instanceof weaponInfo) {
                    // Set item to dStats
                    dStats.weapon = weapon.itemid;
                    dStats.weaponicon = item.emoji;
                    dStats.weaponinfo = { ...weapon };

                    if (item.type === "staff") dStats.mdChance = 1;

                    // Primary Stat
                    if (["atk%", "md%", "cr", "cd", "dodge", "br"].includes(item.primaryStat)) {
                        if (item.primaryStat.endsWith("%")) {
                            const statBuff = dStats[("b" + item.primaryStat.slice(0, -1))] * (1 + Math.floor(item.psmin + ((item.psmax - item.psmin) / 150) * ((weapon.level - 1) + (weapon.ascension * 3))) / 100);
                            dStats[item.primaryStat.slice(0, -1)] += Math.floor(statBuff * ((item.type === dStats.expertise || dStats.expertise === "any") ? 1.2 : 1));
                        } else {
                            const statBuff = (item.psmin + ((item.psmax - item.psmin) * ((weapon.level - 1) + (weapon.ascension * 3)) / 150)) / 100;
                            dStats[item.primaryStat] += Math.floor(statBuff * ((item.type === dStats.expertise || dStats.expertise === "any") ? 1.2 : 1));
                        };
                    } else {
                        const statBuff = Math.floor(item.psmin + ((item.psmax - item.psmin) / 150) * ((weapon.level - 1) + (weapon.ascension * 3)));
                        dStats[item.primaryStat] += Math.floor(statBuff * ((item.type === dStats.expertise || dStats.expertise === "any") ? 1.2 : 1));
                    };

                    // Secondary Stat
                    if (["atk%", "md%", "cr", "cd", "dodge", "br"].includes(item.secondaryStat)) {
                        if (item.secondaryStat.endsWith("%")) {
                            dStats[item.secondaryStat.slice(0, -1)] += Math.floor(dStats["b" + item.secondaryStat.slice(0, -1)] * (Math.floor(parseInt(item.ssmin.slice(0, -1)) + ((parseInt(item.ssmax.slice(0, -1)) - parseInt(item.ssmin.slice(0, -1))) / 10) * weapon.ascension) / 100));
                        } else {
                            dStats[item.secondaryStat] += (parseInt(item.ssmin.slice(0, -1)) + ((parseInt(item.ssmax.slice(0, -1)) - parseInt(item.ssmin.slice(0, -1))) * weapon.ascension / 10)) / 100;
                        };
                    } else {
                        dStats[item.secondaryStat] += Math.floor(parseInt(item.ssmin) + ((parseInt(item.ssmax) - parseInt(item.ssmin)) / 10) * weapon.ascension);
                    };
                };
            };
        };

        // Add shield stats if available
        if (inv.equipment.shield && (inv.premium > 3 || inv.shield_slot)) {
            clearTimeout(retainItemStats.get(inv.equipment.shield)?.timeout);
            const cachedItem = retainItemStats.get(inv.equipment.shield)?.stats;
            shield = cachedItem ?? await getWeaponSchema(inv.equipment.shield);

            if (shield) {
                retainItemStats.set(inv.equipment.shield, { stats: shield, timeout: setTimeout(() => retainItemStats.delete(inv.equipment.shield), 10 * 1000) });

                dStats.uniqueids.push(shield.uniqueid.split(":")[0]);
                if (cachedItem === undefined) shield.level = getItemLevel(shield.level);

                const item = items[shield.itemid];
                if (item instanceof weaponInfo) {
                    // Set item to dStats
                    dStats.shieldid = shield.itemid;
                    dStats.shieldicon = item.emoji;
                    dStats.shieldinfo = { ...shield };

                    // Primary Stat
                    if (["atk%", "md%", "cr", "cd", "dodge", "br"].includes(item.primaryStat)) {
                        if (item.primaryStat.endsWith("%")) {
                            dStats[item.primaryStat.slice(0, -1)] += dStats["b" + item.primaryStat.slice(0, -1)] * (1 + Math.floor(item.psmin + ((item.psmax - item.psmin) / 150) * ((shield.level - 1) + (shield.ascension * 3))) / 100);
                        } else {
                            dStats[item.primaryStat] += (item.psmin + ((item.psmax - item.psmin) * ((shield.level - 1) + (shield.ascension * 3)) / 150)) / 100;
                        };
                    } else {
                        dStats[item.primaryStat] += Math.floor(item.psmin + ((item.psmax - item.psmin) / 150) * ((shield.level - 1) + (shield.ascension * 3)));
                    };

                    // Secondary Stat
                    if (["atk%", "md%", "cr", "cd", "dodge", "br"].includes(item.secondaryStat)) {
                        if (item.secondaryStat.endsWith("%")) {
                            dStats[item.secondaryStat.slice(0, -1)] += Math.floor(dStats["b" + item.secondaryStat.slice(0, -1)] * (Math.floor(parseInt(item.ssmin.slice(0, -1)) + ((parseInt(item.ssmax.slice(0, -1)) - parseInt(item.ssmin.slice(0, -1))) / 10) * shield.ascension) / 100));
                        } else {
                            dStats[item.secondaryStat] += (parseInt(item.ssmin.slice(0, -1)) + ((parseInt(item.ssmax.slice(0, -1)) - parseInt(item.ssmin.slice(0, -1))) * shield.ascension / 10)) / 100;
                        };
                    } else {
                        dStats[item.secondaryStat] += Math.floor(parseInt(item.ssmin) + ((parseInt(item.ssmax) - parseInt(item.ssmin)) / 10) * shield.ascension);
                    };
                };
            };
        };

        // Add helmet stat if available
        if (inv.equipment.helmet) {
            clearTimeout(retainItemStats.get(inv.equipment.helmet)?.timeout);
            const cachedItem = retainItemStats.get(inv.equipment.helmet)?.stats;
            helmet = cachedItem ?? await getWeaponSchema(inv.equipment.helmet);

            if (helmet) {
                retainItemStats.set(inv.equipment.helmet, { stats: helmet, timeout: setTimeout(() => retainItemStats.delete(inv.equipment.helmet), 10 * 1000) });

                dStats.uniqueids.push(helmet.uniqueid.split(":")[0]);
                if (cachedItem === undefined) helmet.level = getItemLevel(helmet.level);

                const item = items[helmet.itemid];
                if (item instanceof armorInfo) {

                    // Set item to dStats
                    dStats.helmet = helmet.itemid;
                    dStats.helmeticon = item.emoji;
                    dStats.helmetinfo = { ...helmet };

                    dStats[item.primaryStat] += Math.floor(item.psmin + ((item.psmax - item.psmin) / 150) * ((helmet.level - 1) + (helmet.ascension * 3)));
                };
            };
        };

        // Add cuirass stat if available
        if (inv.equipment.cuirass) {
            clearTimeout(retainItemStats.get(inv.equipment.cuirass)?.timeout);
            const cachedItem = retainItemStats.get(inv.equipment.cuirass)?.stats;
            cuirass = cachedItem ?? await getWeaponSchema(inv.equipment.cuirass);

            if (cuirass) {
                retainItemStats.set(inv.equipment.cuirass, { stats: cuirass, timeout: setTimeout(() => retainItemStats.delete(inv.equipment.cuirass), 10 * 1000) });

                dStats.uniqueids.push(cuirass.uniqueid.split(":")[0]);
                if (cachedItem === undefined) cuirass.level = getItemLevel(cuirass.level);

                const item = items[cuirass.itemid];
                if (item instanceof armorInfo) {

                    // Set item to dStats
                    dStats.cuirass = cuirass.itemid;
                    dStats.cuirassicon = item.emoji;
                    dStats.cuirassinfo = { ...cuirass };

                    dStats[item.primaryStat] += Math.floor(item.psmin + ((item.psmax - item.psmin) / 150) * ((cuirass.level - 1) + (cuirass.ascension * 3)));
                };
            };
        };

        // Add gloves stat if available
        if (inv.equipment.gloves) {
            clearTimeout(retainItemStats.get(inv.equipment.gloves)?.timeout);
            const cachedItem = retainItemStats.get(inv.equipment.gloves)?.stats;
            gloves = cachedItem ?? await getWeaponSchema(inv.equipment.gloves);

            if (gloves) {
                retainItemStats.set(inv.equipment.gloves, { stats: gloves, timeout: setTimeout(() => retainItemStats.delete(inv.equipment.gloves), 10 * 1000) });

                dStats.uniqueids.push(gloves.uniqueid.split(":")[0]);
                if (cachedItem === undefined) gloves.level = getItemLevel(gloves.level);

                const item = items[gloves.itemid];
                if (item instanceof armorInfo) {

                    // Set item to dStats
                    dStats.gloves = gloves.itemid;
                    dStats.glovesicon = item.emoji;
                    dStats.glovesinfo = { ...gloves };

                    dStats[item.primaryStat] += Math.floor(item.psmin + ((item.psmax - item.psmin) / 150) * ((gloves.level - 1) + (gloves.ascension * 3)));
                };
            };
        };

        // Add gloves stat if available
        if (inv.equipment.boots) {
            clearTimeout(retainItemStats.get(inv.equipment.boots)?.timeout);
            const cachedItem = retainItemStats.get(inv.equipment.boots)?.stats;
            boots = cachedItem ?? await getWeaponSchema(inv.equipment.boots);

            if (boots) {
                retainItemStats.set(inv.equipment.boots, { stats: boots, timeout: setTimeout(() => retainItemStats.delete(inv.equipment.boots), 10 * 1000) });

                dStats.uniqueids.push(boots.uniqueid.split(":")[0]);
                if (cachedItem === undefined) boots.level = getItemLevel(boots.level);

                const item = items[boots.itemid];
                if (item instanceof armorInfo) {

                    // Set item to dStats
                    dStats.boots = boots.itemid;
                    dStats.bootsicon = item.emoji;
                    dStats.bootsinfo = { ...boots };

                    dStats[item.primaryStat] += Math.floor(item.psmin + ((item.psmax - item.psmin) / 150) * ((boots.level - 1) + (boots.ascension * 3)));
                };
            };
        };

        // Add ring 1 if available
        if (dStats.ringSlots > 0) {
            dStats.ring1icon = "<:ring_empty:1034509903886299136>";

            if (inv.equipment.ring1) {
                clearTimeout(retainItemStats.get(inv.equipment.ring1)?.timeout);
                const ring = retainItemStats.get(inv.equipment.ring1)?.stats ?? await getWeaponSchema(inv.equipment.ring1);

                if (ring) {
                    retainItemStats.set(inv.equipment.ring1, { stats: ring, timeout: setTimeout(() => retainItemStats.delete(inv.equipment.ring1), 10 * 1000) });

                    dStats.uniqueids.push(ring.uniqueid.split(":")[0]);

                    const item = items[ring.itemid];

                    if (item instanceof ringInfo) {
                        // Set item to dStats
                        dStats.ring1 = ring.itemid;
                        dStats.ring1icon = item.emoji;
                        dStats.ring1info = { ...ring };
                    };
                };
            };
        };

        // Add ring 2 if available
        if (dStats.ringSlots > 1) {
            dStats.ring2icon = "<:ring_empty:1034509903886299136>";

            if (inv.equipment.ring2) {
                clearTimeout(retainItemStats.get(inv.equipment.ring2)?.timeout);
                const ring = retainItemStats.get(inv.equipment.ring2)?.stats ?? await getWeaponSchema(inv.equipment.ring2);

                if (ring) {
                    retainItemStats.set(inv.equipment.ring2, { stats: ring, timeout: setTimeout(() => retainItemStats.delete(inv.equipment.ring2), 10 * 1000) });

                    dStats.uniqueids.push(ring.uniqueid.split(":")[0]);

                    const item = items[ring.itemid];
                    if (item instanceof ringInfo) {
                        // Set item to dStats
                        dStats.ring2 = ring.itemid;
                        dStats.ring2icon = item.emoji;
                        dStats.ring2info = { ...ring };
                    };
                };
            };
        };

        // Add ring 3 if available
        if (dStats.ringSlots > 2) {
            dStats.ring3icon = "<:ring_empty:1034509903886299136>";

            if (inv.equipment.ring3) {
                clearTimeout(retainItemStats.get(inv.equipment.ring3)?.timeout);
                const ring = retainItemStats.get(inv.equipment.ring3)?.stats ?? await getWeaponSchema(inv.equipment.ring3);

                if (ring) {
                    retainItemStats.set(inv.equipment.ring3, { stats: ring, timeout: setTimeout(() => retainItemStats.delete(inv.equipment.ring3), 10 * 1000) });

                    dStats.uniqueids.push(ring.uniqueid.split(":")[0]);

                    const item = items[ring.itemid];
                    if (item instanceof ringInfo) {
                        // Set item to dStats
                        dStats.ring3 = ring.itemid;
                        dStats.ring3icon = item.emoji;
                        dStats.ring3info = { ...ring };
                    };
                };
            };
        };

        // Lria's masks
        if (id === 18011 && inv.equipment.mask) {
            dStats.maskinfo = inv.equipment.mask;
        };

        // 2B&9S EX's programmes
        if (id === 23185 && inv.equipment.prog) {
            dStats.proginfo = inv.equipment?.prog?.split(",") ?? [];
        };

        // Dalus & Kisogi's Shell
        if ((id === 10528 || id === 12398) && inv.equipment.shell) {
            dStats.shell = inv.equipment?.shell;
        };

    };

    dStats.maxhp = dStats.hp;
    if (dStats.mana > 400) dStats.mana = 400;

    // old formula: HP, ATK, DEF=0.99818
    // dStats.ep = Math.floor(((dStats.hp/Math.pow(0.99818,dStats.def)) / (200/dStats.atk))*100) / 100;

    // new formula: HP, ATK, DEF=0.99895, CR, CD, dodge
    dStats.ep = baseEP(id, dStats.hp, dStats.atk, dStats.def, dStats.md, dStats.mr, dStats.cd, dStats.cr, dStats.dodge);

    return dStats;
};

export const getDamage = (target: DetailedStats, attacker: DetailedStats, targetBuff: Buffs, attackerBuff: Buffs, matchStats: MatchStats, notice: string[], log: string, flags = {}) => {
    const options = { // true = enabled, false = disabled
        overwriteDamage: 0,
        atkMultiplier: 1,
        magicDamage: false,
        mdChance: Math.random(),
        canCrit: true,
        critChance: Math.random(),
        critBuff: 0,
        critMultiplier: 1,
        defMultiplier: 1,
        combodmg: false,
    };
    Object.keys(flags).forEach((e) => {
        if (e in options) {
            (options as any)[e] = (flags as any)[e];
        };
    });

    // Calculate damage
    let damage;
    if (options.magicDamage && options.mdChance < attacker.mdChance) {
        damage = options.overwriteDamage || Math.floor(((options.atkMultiplier * attacker.md * ((options.combodmg && attacker.combodmg) ? (1 + Math.min(1.4, attacker.attackStreak * attacker.combodmg)) : 1)) * Math.max(Math.pow(0.99895, options.defMultiplier * target.mr), (target.removeDefCap ? 0 : 0.1))) * (1 - (0.2 * Math.random())) * ((options.canCrit && options.critChance < (attacker.cr + options.critBuff)) ? (options.critMultiplier * attacker.cd) : 1));
    } else {
        damage = options.overwriteDamage || Math.floor(((options.atkMultiplier * attacker.atk * ((options.combodmg && attacker.combodmg) ? (1 + Math.min(1.4, attacker.attackStreak * attacker.combodmg)) : 1)) * Math.max(Math.pow(0.99895, options.defMultiplier * target.def), (target.removeDefCap ? 0 : 0.1))) * (1 - (0.2 * Math.random())) * ((options.canCrit && options.critChance < (attacker.cr + options.critBuff)) ? (options.critMultiplier * attacker.cd) : 1));
    };

    return damage;
};



export const dealDamage = (target: DetailedStats, attacker: DetailedStats, targetBuff: Buffs, attackerBuff: Buffs, matchStats: MatchStats, notice: string[], log: string, flags = {}): number => {
    const options = { // true = enabled, false = disabled
        isTest: false,
        block: target.usedBlockRound === matchStats.round,
        dodge: true,
        overwriteDamage: 0,
        atkMultiplier: 1,
        magicDamage: false,
        mdChance: Math.random(),
        tdPercentage: 0,
        canCrit: true,
        critChance: Math.random(),
        critBuff: 0,
        critMultiplier: 1,
        defMultiplier: 1,
        defReductionCap: 0,
        overwriteNotice: false,
        ignoreShield: attacker.ignoreShield,
        shieldBreak: false,
        combodmg: false,
        selfdmg: false,
        selfheal: true,
        selfhealAmount: 0,
        selfhealChance: Math.random(),
        critbleed: attacker.critbleed,
        execute: attacker.allowExecution,
        damageFormula: attacker.damageFormula ?? matchStats.damageFormula,
        canTwinshot: true,
        isLightning: false,
        canCounter: true,
        normalATK: false,
        turn: 0,

        preventRetaliation: false,
    };
    Object.keys(flags).forEach((e) => (options as any)[e] = (flags as any)[e]);

    // matchStat overwrites
    if (matchStats.allowSelfheal !== undefined) options.selfheal = matchStats.allowSelfheal;

    // Try blocking or dodging
    if (!options.isTest && options.block && Math.random() < Math.min(target.br, target.brCap ?? target.br)) {
        notice.push(`\n🛡️ **${target.name}** blocked the attack!`);
        attacker.attackStreak = 0;
        target.dodgeStreak = 0;
        target.blockStreak++;
        if (target.blockBuffDef) targetBuff.def.push(new buffInfo("+", target.blockBuffDef, 6)), targetBuff.mr.push(new buffInfo("+", target.blockBuffDef, 6));
        if (target.blockBurn) attacker.hp -= Math.floor(attacker.hp > 2 * target.hp ? 2 * target.hp * target.blockBurn : attacker.hp * target.blockBurn);

        // Diminishing Returns
        // if (target.blockStreak >= 2) targetBuff.br.push(new buffInfo("*", 0.875, 6));

        // Event Triggers
        matchStats.trigger("block", attacker, target, attackerBuff, targetBuff, { turn: matchStats.turn });
        matchStats.trigger("miss", attacker, target, attackerBuff, targetBuff, { turn: matchStats.turn });

        // Achievements & Daily Quests
        achievements[13].check(matchStats.interaction, matchStats.interaction.user, target.blockStreak), achievements[14].check(matchStats.interaction, matchStats.interaction.user, target.blockStreak); // Invincible
        if (target.blockStreak === 2) dailies[6].update(matchStats.interaction); // Impenetrable Defense
        return 0;
    }; /* Reset BlockStreak */ target.blockStreak = 0;
    if (!options.isTest && options.dodge && Math.random() < Math.min(target.dodge, target.dodgeCap ?? target.dodge)) {
        notice.push(`\n💨 **${target.name}** dodged the attack!${target.dodgebuff ? ` Gained **+${target.dodgebuff * 100}%** ATK` : ""}`);
        attacker.attackStreak = 0;
        target.dodgeStreak++;
        if (target.dodgeHeal) {
            addHeal(target, attacker, target, targetBuff, attackerBuff, matchStats, notice, ``, Math.floor(target.maxhp * target.dodgeHeal), {});
            if (target.hp > target.maxhp) target.hp = target.maxhp;
        };
        if (target.dodgebuff) {
            const buff = new buffInfo("*", 1 + target.dodgebuff, target.dodgebuffLast ?? 5);
            buff.label = `dodgebuff: ${target.dodgebuff * 100}%, ${target.dodgebuffLast ?? 5} rounds`;
            targetBuff.atk.push(buff);
        };
        // if (target.sjwUsedActive) {
        //     const drain = Math.floor(attacker.sm * 0.12);
        //     attacker.sm -= drain;
        //     target.sm += drain;
        // };
        if (target.stealManaOnDodge) {
            const steal = Math.min(attacker.sm, target.stealManaOnDodge);
            attacker.sm -= steal;
            target.sm += steal;
            if (target.sm > target.mana) target.sm = target.mana;
        };

        // Diminishing Returns
        // if (target.dodgeStreak >= 2) targetBuff.dodge.push(new buffInfo("*", 0.875, 6));

        // Event Triggers
        matchStats.trigger("dodge", attacker, target, attackerBuff, targetBuff, { turn: matchStats.turn });
        matchStats.trigger("miss", attacker, target, attackerBuff, targetBuff, { turn: matchStats.turn });

        return 0;
    }; /* Reset DodgeStreak */ target.dodgeStreak = 0;

    // Calculate damage
    let damage, isCrit = (options.canCrit && (options.critChance < (attacker.cr + options.critBuff)));
    let effectiveDef = target.def * (1 - (attacker.ignoreDefPercent ?? 0)), effectiveMr = target.mr * (1 - (attacker.ignoreMrPercent ?? 0));
    const multipliers = {
        atk: options.atkMultiplier * attacker.atk,
        md: options.atkMultiplier * attacker.md,
        def: Math.max(Math.pow(0.99895, options.defReductionCap ? Math.max(effectiveDef - options.defReductionCap, options.defMultiplier * effectiveDef) : (options.defMultiplier * effectiveDef)), (target.removeDefCap ? 0 : 0.1)) * ((((target.increase_defcap ?? 0) > 0) && ((options.defMultiplier * effectiveDef) - 2192 > 0)) ? Math.pow(0.99895, Math.min((options.defMultiplier * effectiveDef) - 2192, options.defMultiplier * target.increase_defcap)) : 1),
        mr: Math.max(Math.pow(0.99895, options.defReductionCap ? Math.max(effectiveMr - options.defReductionCap, options.defMultiplier * effectiveMr) : (options.defMultiplier * effectiveMr)), (target.removeDefCap ? 0 : 0.1)) * ((((target.increase_mrcap ?? 0) > 0) && ((options.defMultiplier * effectiveMr) - 2192 > 0)) ? Math.pow(0.99895, Math.min((options.defMultiplier * effectiveMr) - 2192, options.defMultiplier * target.increase_mrcap)) : 1),
        crit: ((isCrit || attacker.shorekeeperUsedActive) ? (options.critMultiplier * attacker.cd) : 1),
        combo: ((options.combodmg && attacker.combodmg) ? (1 + Math.min(1.4, attacker.attackStreak * attacker.combodmg)) : 1),
        lightning: options.isLightning ? ((1 + (attacker.lightningMultiplier || 0)) * (1 - (target.lightningResistance || 0))) : 1,
        rng: (1 - (0.2 * Math.random())),
    };
    // Removed redundant line: crit scaling now handled in multipliers.crit
    if (options.magicDamage && options.mdChance < attacker.mdChance) {
        damage = options.overwriteDamage || Math.floor(multipliers.md * multipliers.mr * multipliers.crit * multipliers.combo * multipliers.lightning * multipliers.rng);
    } else {
        damage = options.overwriteDamage || Math.floor(multipliers.atk * multipliers.def * multipliers.crit * multipliers.combo * multipliers.lightning * multipliers.rng);
    };
    if (attacker.critbonus && (isCrit || attacker.shorekeeperUsedActive)) damage = Math.floor(damage * (1 + attacker.critbonus));
    attacker.crittedTotal ||= 0;
    attacker.crittedTotal++;

    // Other Damage Formulas
    if (options.damageFormula.startsWith("log_scale_")) {
        const base = Math.pow(2, 7);
        if (damage > base) {
            const scale = parseFloat(options.damageFormula.split("_")[2]) ?? 2;
            const power = ((Math.log(damage) / Math.log(2)) - 7);

            damage = Math.floor(base * Math.pow(scale, power));
            if (attacker.damageRescaling) damage = Math.floor(damage * attacker.damageRescaling);
        };
    };

    // Damage Reduction
    if (target.damageReduction) {
        damage = Math.floor(damage * (1 - Math.max(0, Math.min(1, target.damageReduction))));
    };

    // Deflect damage
    if (target.deflectDamage) {
        attacker.hp = Math.floor(attacker.hp - Math.floor(damage * target.deflectDamage));
        damage = Math.floor(damage * (1 - Math.max(0, Math.min(1, target.deflectDamage))));
        if (attacker.hp < 1) attacker.hp = 0;
    };

    // Vulnerability
    if (target.vulnerability) {
        damage = Math.floor(damage * target.vulnerability);
    };

    // Overwrite damage
    damage = options.overwriteDamage || damage;

    //* RETURN IF TEST
    if (options.isTest) return damage;

    // Counter the attack
    if (options.canCounter && target.counter > 0 && (!isNaN(target.counterchance) ? target.counterchance : 1) > Math.random() && !attacker.blockCounter) {
        target.counter--;
        notice.push(`\n<:counter:1340459549374546032> **${target.name}** countered the attack!`);
        if (target.soulfistAtkStack !== undefined) {
            if (target.soulfistAtkStack++ < 5) {
                targetBuff.atk.push(new buffInfo("*", 1.03, 9999));
                targetBuff.md.push(new buffInfo("*", 1.03, 9999));
            } else {
                target.sm += 10;
                if (target.sm > target.mana) target.sm = target.mana;
            };
        };

        // Event Triggers
        matchStats.trigger("counter", attacker, target, attackerBuff, targetBuff, { damage });
        matchStats.trigger("miss", attacker, target, attackerBuff, targetBuff, { turn: matchStats.turn });

        return dealDamage(attacker, target, attackerBuff, targetBuff, matchStats, notice, `⚔️ **${target.name}**`, flags);
    };

    // Evade Deadly Attack
    if (
        (target.evadeDeathStrike && target.evadeDeathStrike > 0) && // Can evade a deadly strike
        (target.evadeDeathChance > Math.random()) && // Chance
        (options.ignoreShield || target.shield < 1) && // No shield
        (Math.floor(target.hp - damage) < 1) // Would kill
    ) {
        target.evadeDeathStrike--;
        notice.push(`\n💨 **${target.name}** has evaded a deadly attack!`);

        // Event Triggers
        matchStats.trigger("deathEvade", attacker, target, attackerBuff, targetBuff, { turn: matchStats.turn });
        matchStats.trigger("miss", attacker, target, attackerBuff, targetBuff, { turn: matchStats.turn });

        return 0;
    };

    // Damage on Hold
    if (target.putDamageOnHold) {
        const onHold = Math.floor(damage * target.putDamageOnHold);
        target.damageOnHold = (target.damageOnHold ?? 0) + onHold;
        damage -= onHold;
    };

    // Store DMG as frozenwounds (Rukia)
    if (attacker.rukiaUsedActive) {
        target.frozenwounds += damage;
        damage = 0;
    }

    // Apply damage to target
    if (!options.ignoreShield && target.shield > 0) {
        target.shield = Math.floor(target.shield - damage);

        // if shield broken
        if (target.shield < 0 || options.shieldBreak) {
            matchStats.trigger("shieldBreak", attacker, target, attackerBuff, targetBuff);
            target.shield = 0;

            // freeze
            if (target.shieldBreakDamageBuff) {
                attacker.timeFrozen = true;
                attacker.frozenMessage = "was frozen";
                (target.delayedBuffs ?? attacker.delayedBuffs).push(new delayedBuffs(matchStats.round + 2, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    eStats.timeFrozen = false;
                    return AbilityResponse.SUCCESS;
                }));
                if (target.shieldBreakDamageBuff) {
                    targetBuff.atk.push(new buffInfo("+", Math.floor(target.atk * target.shieldBreakDamageBuff), 1));
                    targetBuff.md.push(new buffInfo("+", Math.floor(target.md * target.shieldBreakDamageBuff), 1));
                };
            };
        };

        notice.push(options.overwriteNotice ? log : `\n${log} has dealt${isCrit ? " a critical hit!" : ""} **${damage}**${attacker.isLightning ? " lightning" : ""}${(options.magicDamage && options.mdChance < attacker.mdChance) ? " magic" : ""} damage${target.shield === 0 ? `. **${target.name}**'s shield broke down!` : ""}`);
    } else {
        target.hp = Math.floor(target.hp - damage);
        if (target.hp < 1) target.hp = 0;
        notice.push(options.overwriteNotice ? log : `\n${log} has dealt${isCrit ? " a critical hit!" : ""} **${damage}**${attacker.isLightning ? " lightning" : ""}${(options.magicDamage && options.mdChance < attacker.mdChance) ? " magic" : ""} damage`);
    };

    // Reflect damage
    if (target.reflectDamage) {
        attacker.hp = Math.floor(attacker.hp - Math.floor(damage * target.reflectDamage));
        if (attacker.hp < 1) attacker.hp = 0;
    };

    // If it executes
    if (options.execute && (target.hp / target.maxhp) < attacker.executeHP) {
        notice.push(`\n⚔️ **${target.name}** was executed!`);
        damage += target.hp;
        target.hp = 0;

        // Event Triggers
        matchStats.trigger("execute", attacker, target, attackerBuff, targetBuff, { damage });

        return damage;
    };

    // Passives
    target.damageTaken += damage;
    if (options.combodmg && attacker.combodmg) attacker.attackStreak++;
    if (options.critbleed && isCrit) {
        const bleedPercentage = attacker.critbleedAmount ?? 0.05;
        targetBuff.hp.push(new buffInfo("+", -Math.floor(Math.min(target.maxhp, attacker.maxhp * 2) * bleedPercentage), attacker.critbleedlast));
    };
    if (attacker.critmana && isCrit) attacker.sm = Math.min(attacker.sm + attacker.critmana, attacker.mana);
    if (options.selfheal && attacker.selfheal && attacker.lastSelfHealRoundCapped !== matchStats.round) {
        let selfHealedTotal = 0;

        // atk option
        if (options.selfhealAmount) selfHealedTotal += damage * options.selfhealAmount;

        // passive
        for (let i = 0; i < attacker.selfheal.length; i++) {
            if (attacker.selfhealChance[i] > Math.random()) selfHealedTotal += damage * attacker.selfheal[i];
        };

        const healCap = attacker.maxhp * 0.2;
        addHeal(attacker, target, attacker, attackerBuff, targetBuff, matchStats, notice, ``, Math.floor(Math.min(selfHealedTotal, healCap)), {});
        if (selfHealedTotal >= healCap) attacker.lastSelfHealRoundCapped = matchStats.round;
    };
    if (options.selfdmg && Math.random() < attacker.selfdmg) attacker.hp -= damage;
    if ("gintokiStacks" in attacker && isCrit) attacker.gintokiStacks = 0;
    if (damage && attacker.guinaifenStackRounds?.filter((e: number) => e >= (matchStats.round - attacker.guinaifenStackLast)).length < attacker.guinaifenStackMax) {
        targetBuff.hp.push(new buffInfo("+", -Math.floor(0.06 * damage), attacker.guinaifenStackLast));
        attacker.guinaifenStackRounds.push(matchStats.round);
    };
    // if (attacker.sjwUsedActive) {
    //     if (damage) targetBuff.hp.push(new buffInfo("+", Math.floor(damage * 0.07), 2)); // Beru
    //     if (isCrit) { // Igris
    //         const drain = Math.floor((target.maxhp > (2 * attacker.maxhp)) ? attacker.maxhp * 0.07 : target.maxhp * 0.035);
    //         target.hp -= drain;
    //         attacker.hp += drain;
    //     };

    // };
    if (target.hp > target.maxhp) target.hp = target.maxhp;
    if (target.hp < 0) target.hp = 0;
    if (attacker.hp > attacker.maxhp) attacker.hp = attacker.maxhp;
    if (attacker.hp < 0) attacker.hp = 0;

    // Twinshot
    if (options.canTwinshot && attacker.twinshot > Math.random()) {
        return damage + dealDamage(target, attacker, targetBuff, attackerBuff, matchStats, notice, log, { ...flags, canTwinshot: false });
    };

    // Event Triggers
    matchStats.trigger("attack", attacker, target, attackerBuff, targetBuff, {
        damage, isCrit,
        magicDamage: (options.magicDamage && options.mdChance < attacker.mdChance),
        isLightning: options.isLightning,
        preventRetaliation: options.preventRetaliation,
    });
    if (isCrit) matchStats.trigger("crit", attacker, target, attackerBuff, targetBuff, { damage });
    else matchStats.trigger("noncrit", attacker, target, attackerBuff, targetBuff, { damage, normalATK: options.normalATK });

    return damage;
};

export const noTimeout = (matchStats: MatchStats, attacker: DetailedStats) => {
    matchStats.turn = matchStats.turnSkill ? 0 : 1;
    attacker.timeout = false;
};

export const imageChange = (embed: EmbedBuilder, matchStats: MatchStats, caster: DetailedStats, image: string) => {
    console.log(matchStats.turn);
    matchStats.player1 ??= caster;
    if (matchStats.player1 === caster) embed.setThumbnail(image);
    else embed.setImage(image);
};

export const addHeal = (target: DetailedStats, attacker: DetailedStats, caster: DetailedStats, targetBuff: Buffs, attackerBuff: Buffs, matchStats: MatchStats, notice: string[], log: string, amount: number, flags = {}) => {
    const options = { // true = enabled, false = disabled
        bypassBoL: false,
    };
    Object.keys(flags).forEach((e) => (options as any)[e] = (flags as any)[e]);

    if (attacker.negateHeal && amount > 0 && target === caster && attacker !== caster) {
        // notice.push(`\n<:negated_heal:1341346312699904044> **${attacker.name}** has negated the heal!`);
    } else {
        // Check for any heal reduction
        // 1: Bond of Life
        if (!options.bypassBoL) {
            if (target.bondOfLife > 0) {
                amount -= target.bondOfLife;
                if (amount < 0) amount = 0;
            };
        };

        // 2: General Heal reduction
        if (attacker.reduceHealing) amount * (1 - attacker.reduceHealing);
        if (amount > 0) target.hp += Math.floor(amount);
        if (target.hp > target.maxhp) target.hp = target.maxhp;
        if (target.hp < 0) target.hp = 0;
    };
    if (log && amount > 0) notice.push(`\n💖 **${target.name}** has healed **${amount}** HP`);
    if (log && amount < 0) notice.push(`\n💔 **${target.name}** has lost **${amount}** HP`);
};

// export const applyDynamicDoT = (
//     { type, percentage, last }: {
//         type: "drain" | "bleed",
//         /**
//          * Integer between [0-100+)
//          */
//         percentage: number,
//         last: number,
//     },
//     target: DetailedStats, attacker: DetailedStats, targetBuff: Buffs, attackerBuff: Buffs, matchStats: MatchStats, notice: string[], flags = {}) => {
//     const options = { // true = enabled, false = disabled

//     };
//     Object.keys(flags).forEach((e) => (options as any)[e] = (flags as any)[e]);

//     const damage = dealDamage(target, attacker, targetBuff, attackerBuff, matchStats, notice, `🩸 **${attacker.name}**`, { atkMultiplier: percentage / 100, isTest: true, magicDamage: true, canCrit: false });

//     const debuff = new buffInfo("+", -damage, last);
//     const heal = new buffInfo("+", damage, last);
//     targetBuff.hp.push(debuff);

//     if (type === "drain") {
//         attackerBuff.hp.push(heal);
//     };

//     // Update value
//     (attacker.delayedBuffs || target.delayedBuffs).push(new delayedBuffs(0, async () => {
//         const DoT = targetBuff.hp.find((e) => e.id === debuff.id);
//         const HoT = attackerBuff.hp.find((e) => e.id === heal.id);
//         if (DoT || HoT) {
//             const refreshedDamage = dealDamage(target, attacker, targetBuff, attackerBuff, matchStats, notice, `🩸 **${attacker.name}**`, { atkMultiplier: percentage / 100, isTest: true, magicDamage: true, canCrit: false });

//             if (DoT) DoT.val = -refreshedDamage;
//             if (HoT) HoT.val = refreshedDamage;
//         };

//         return AbilityResponse.SUCCESS;
//     }, 9999));
// };

export const getAscensionMaterial = (id: string | number, ascItems: lootInfo[]) => {
    id = `${id}camelot`;
    let hash = 3;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0;
    };
    return ascItems[Math.abs(hash) % ascItems.length];
};

export const filterItems = (userItems: WeaponSchema[], choice: string[], exclude: string[] = [], sellGrade: string | boolean = false, sellType: string | false = false, stats?: CompactUserSchema) => {
    const itemsToDisassemble = [];
    const itemIdsToDisassemble = [];
    const loot: { [key: string]: number; } = {};

    for (const item of userItems) {
        const fItem = items[item.itemid];

        // Filter items to be deleted
        if (choice[0]) {
            if (!choice.includes(item.uniqueid.split(":")[0])) continue;
        } else {
            if (exclude.includes(item.uniqueid.split(":")[0])) continue;
            if (fItem.grade === "genesis") continue;
            if (sellGrade && fItem.grade !== sellGrade) continue;
            if (sellType && fItem.type !== sellType) continue;
        };

        const ascItem = getAscensionMaterial(fItem.id, items.filter((e) => e.type === "ascension material"));
        const craftItem = items.find((e) => e.type === "crafting material" && e.grade === fItem.grade) as lootInfo;
        const levelItem = items[fItem.category === "weapon" ? 56 : 57];
        const awakenItem = items[683];

        let exchangeItem: itemInfo | false = false;
        if (fItem.grade === "genesis") exchangeItem = items[676];
        else if (fItem.grade === "mythical") exchangeItem = items[677];
        else if (fItem.grade === "legendary") exchangeItem = items[678];

        const ascMatsNeeded = Math.round((1 / 6) * 12 * ((0.5 * item.ascension * item.ascension) + (3.5 * item.ascension) + 3));
        const craftMatsNeeded = Math.round((1 / 6) * 8 * ((0.5 * item.ascension * item.ascension) + (3.5 * item.ascension) + 3)) + (fItem.grade === "legendary" ? 4 : (fItem.grade === "mythical" ? 12 : (fItem.grade === "genesis" ? 28 : 0)));
        const levelMatsNeeded = Math.floor(item.level / 5000);
        const awakenMatsNeeded = item.ascension > 10 ? (8 * (item.ascension - 10) * (item.ascension - 9)) : 0;
        // const awakenItemNeeded = currLevel < 120 ? 0 : (item[0].ascension-9) * 16;

        loot[ascItem.id] = (loot[ascItem.id] + ascMatsNeeded) || ascMatsNeeded;
        loot[craftItem.id] = (loot[craftItem.id] + craftMatsNeeded) || craftMatsNeeded;
        if (levelMatsNeeded) loot[levelItem.id] = (loot[levelItem.id] + levelMatsNeeded) || levelMatsNeeded;
        if (exchangeItem) loot[exchangeItem.id] = (loot[exchangeItem.id] + 1) || 1;
        if (awakenMatsNeeded) loot[awakenItem.id] = (loot[awakenItem.id] + awakenMatsNeeded) || awakenMatsNeeded;

        // Unequip if equipped
        if (stats) {
            let type: string = fItem.category;
            if (type === "armor" || fItem.type === "shield") type = fItem.type;
            if (type === "shield" && stats.premium < 4) type = "weapon";
            if (stats.equipment[type] === item.uniqueid) delete stats.equipment[type];
        };

        itemsToDisassemble.push(fItem);
        itemIdsToDisassemble.push(item);
    };

    return { itemsToDisassemble, itemIdsToDisassemble, loot };
};

export const showPage = <T>(currPage: number, arr: T[], elements = 15): T[] => {
    return arr.slice((currPage - 1) * elements, currPage * elements);
};

export const search = (name: string | number, inv: number[], interaction: ChatInputCommandInteraction, silent: boolean = false): charInfo | undefined => {
    name = name.toString().toLowerCase().split(" ").filter((e) => e).join(" ");
    if (name === "last" || name === "latest") name = inv[inv.length - 1].toString();

    if (!isNaN(Number(name))) {
        if (parseInt(name) < 0) {
            if (!silent) interaction.reply("The ID can't be negative.");
            return;
        };
        if (parseInt(name) >= characters.length) {
            if (!silent) interaction.reply(`The ID must be smaller than ${characters.length}`);
            return;
        };
        if (!(name[0] === "0" && name.length > 1)) return characters[parseInt(name)];
    };

    // Full Name Search
    let fastCheck = characters.filter((e) => e.name.toLowerCase() === name || e.alias.some((a) => a.toLowerCase() === name));
    if (fastCheck[0] !== undefined) return fastCheck[0];

    // Filter
    const fArray = characters.filter((e) => e.name.toLowerCase().startsWith(`${name}`) || e.alias.some((a) => a.toLowerCase().startsWith(`${name}`)));

    if (fArray.length === 0) {
        if (!silent) interaction.reply("No match found");
        return;
    };
    if (fArray.length > 1) {
        if (!silent) interaction.reply(`${fArray.length} matches found:\n> ‧ ${fArray.sort((a, b) => (b.name.toLowerCase().startsWith(name.toString()) ? 1 : 0) - (a.name.toLowerCase().startsWith(name.toString()) ? 1 : 0)).map((e) => e.name.toLowerCase().startsWith(name.toString()) ? e.name : e.name + " (alias: " + e.alias.find((a) => a.toLowerCase().startsWith(name.toString())) + ")").slice(0, 8).join('\n> ‧ ')}${fArray.length > 8 ? `\n+ ${fArray.length - 8} more` : ""}`);
        return;
    };
    return fArray[0];
};

export const searchAnimeTitle = (name: string, interaction: ChatInputCommandInteraction, silent: boolean = false) => {
    name = name.toLowerCase().split(" ").filter((e) => e).join(" ");

    // Full Name Search
    let fastCheck = anime.filter((e) => e.name.toLowerCase() === name || e.alias.some((a) => a.toLowerCase() === name));
    if (fastCheck[0] !== undefined) return fastCheck[0];

    // Filter
    const fArray = anime.filter((e) => e.name.toLowerCase().startsWith(name) || e.alias.some((a) => a.toLowerCase().startsWith(name)));

    if (fArray.length === 0) {
        if (!silent) interaction.reply("No match found");
        return;
    }
    if (fArray.length > 1) {
        if (!silent) interaction.reply(`${fArray.length} matches found:\n> ‧ ${fArray.sort((a, b) => (b.name.toLowerCase().startsWith(name) ? 1 : 0) - (a.name.toLowerCase().startsWith(name) ? 1 : 0)).map((e) => e.name.toLowerCase().startsWith(name) ? e.name : e.name + " (alias: " + e.alias.find((a) => a.toLowerCase().startsWith(name)) + ")").slice(0, 8).join('\n> ‧ ')}${fArray.length > 8 ? `\n+ ${fArray.length - 8} more` : ""}`);
        return;
    };
    return fArray[0];
};

export const rarity = (rar: CharacterRarity) => {
    switch (rar) {
        case "EX": return "https://i.ibb.co/1GDqXkg/extra-dark.gif"; // "https://i.ibb.co/0V1bDLm/ex.png";
        case "SS": return "https://i.ibb.co/GdhDTj1/n3qj4i2.png";
        case "S": return "https://i.ibb.co/8KZJLLZ/aSXEB8J.png";
        case "A": return "https://i.ibb.co/8MTkwzf/MNNSMIP.png";
        case "B": return "https://i.ibb.co/WswjB19/HHgIQsZ.png";
        case "C": return "https://i.ibb.co/ZHRxzFB/bF4Uwq7.png";
        case "D": return "https://i.ibb.co/Yp26KZG/qHR5lBz.png";
        default: return "https://i.ibb.co/j6Vhb5B/zPpfb14.jpg";
    };
};

export const getSingleRefinement = (cid: number) => {
    if (cid > 5) return "<:refinement_gold:1046869941011365899>";
    switch (cid) {
        case 5: return "<:refinement:869132309125824552>";
        case 4: return "<:refinement_4:1295716864567021619>";
        case 3: return "<:refinement_3:1295716862457544760>";
        case 2: return "<:refinement_2:1295716856774135901>";
        case 1: return "<:refinement_1:1295716854538571869>";
        default: return "<:refinement_hollow:869132322857947136>";
    };
};

export const getRefinement = (cid: number) => {
    if (cid > 5) return "<:refinement_gold:1046869941011365899><:refinement_gold:1046869941011365899><:refinement_gold:1046869941011365899><:refinement_gold:1046869941011365899><:refinement_gold:1046869941011365899>";
    switch (cid) {
        case 5: return "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552>";
        case 4: return "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136>";
        case 3: return "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
        case 2: return "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
        case 1: return "<:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
        default: return "<:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
    };
};

export const splitTitle = (title: string) => {
    if (title.length <= 30) return title;
    let add = "";
    while (title.length > 30) {
        let spaceIndex = title.slice(0, 30).lastIndexOf(" ");
        add += title.slice(0, 30).replace(/\s+\S*$/, "\n");
        title = title.slice(spaceIndex + 1);
    };
    add += title;
    return add;
};

export const displayPull = (user: User, thisChar: charInfo, pCount: number, dupes: number, pullsMade: number, lastVote: Date | null, refNumber: number) => {
    let animeL = splitTitle(thisChar.anime);
    let refinement = getRefinement(refNumber);

    // Check if vote
    let canVote = "";
    if ((pCount - pullsMade) === 0) {
        canVote = ` | You can /vote`;
        if (lastVote && ((new Date().getTime() - lastVote.getTime()) < 12 * 60 * 60 * 1000)) canVote = "";
    };

    const Embed = new EmbedBuilder()
        .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[thisChar.rarity])
        .setImage(thisChar.image)
        .setThumbnail(rarity(thisChar.rarity))
        .setDescription(`**${thisChar.name}**\n${animeL}\n\n**Ref**. ${refinement}`)
        .setFooter({ text: `You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of this\n${pCount - pullsMade} ${pCount - pullsMade == 1 ? "pull" : "pulls"} left${canVote}`, iconURL: user.displayAvatarURL({ size: 2048 }) });
    return { embeds: [Embed] };
};

export const searchAnime = (name: string, inv: number[], interaction: ChatInputCommandInteraction) => {
    name = name.toLowerCase();
    if (name === "last" || name === "latest") name = characters[inv[inv.length - 1]].anime.toLowerCase();

    // Full Title Search
    let fastCheck = characters.filter((e) => e.anime.toLowerCase() === name.toLowerCase() || e.anialias.some((a) => a.toLowerCase() === name.toLowerCase()));
    if (fastCheck[0] !== undefined) return fastCheck;

    // Acronym Search
    fastCheck = characters.filter((e) => (e.anime.toLowerCase().match(/\b(\w)/g) ?? []).join('') === name.toLowerCase() || e.anialias.some((a => (a.toLowerCase().match(/\b(\w)/g) ?? []).join('') === name.toLowerCase())));
    for (let i = 0; i < fastCheck.length; i++) {
        if (fastCheck[i].anime != fastCheck[0].anime) fastCheck = [];
    };
    if (fastCheck[0] !== undefined) return fastCheck;

    // Filter
    const fArray = characters.filter((e) => e.anime.toLowerCase().startsWith(name) || e.anialias.some((a) => a.toLowerCase().startsWith(name)));

    if (fArray.length === 0) {
        interaction.reply("No match found");
        return;
    };
    if ([...new Set(fArray.map((e) => e.anime))].length > 1) {
        interaction.reply(`${[...new Set(fArray.map((e) => e.anime))].length} matches found:\n> ‧ ${[...new Set(fArray.sort((a, b) => (b.anime.toLowerCase().startsWith(name) ? 1 : 0) - (a.anime.toLowerCase().startsWith(name) ? 1 : 0)).map((e) => e.anime.toLowerCase().startsWith(name) ? e.anime : e.anime + " (alias: " + e.anialias.find((a) => a.toLowerCase().startsWith(name)) + ")"))].slice(0, 8).join('\n> ‧ ')}${[...new Set(fArray.map((e) => e.anime))].length > 8 ? `\n+ ${[...new Set(fArray.map((e) => e.anime))].length - 8} more` : ""}`);
        return;
    };
    return fArray;
};

export const userLevel = (xpr: number) => {
    let level = 0;
    for (let i = 1; xpr >= 0; i++) {
        xpr -= Math.floor(5 * Math.log(i) ** 4 + 30);
        level++;
    };
    return level;
};

export const userLevelToXP = (level: number): number => {
    if (level <= 1) return 0;

    let totalXP = 0;
    for (let i = 1; i < level; i++) {
        totalXP += Math.floor(5 * Math.log(i) ** 4 + 30);
    };
    return Math.floor(totalXP);
};

export const getClassLvl = (cls: number, classLevels: Record<string, number>) => {
    let clvl = 1, classxp = 0;
    if (cls in classLevels) classxp = classLevels[cls];
    for (let ci = 1; classxp > 0; ci++) {
        clvl++;
        classxp -= ci * 50;
    };
    if (classxp < 0) clvl--;

    switch (classes[cls].tier) {
        case 1: if (clvl > 50) clvl = 50; break;
        case 2: if (clvl > 70) clvl = 70; break;
        default: break;
    };

    return clvl;
};

export const classLevelToXP = (clvl: number) => {
    if (clvl < 1) return 0;
    let classxp = 0;
    while (--clvl) classxp += clvl * 50;
    return classxp;
};

export const getItemLevel = (xp: number) => {
    let level = 1;
    while (xp >= 0) {
        xp -= Math.floor(20 * Math.pow(level, 1.290349));
        level++;
    };
    return level - 1;
};

export const getRingSlotsTotal = (stats: Pick<CompactUserSchema, "xp" | "dungeon_classlevels" | "dungeon_floors">) => {
    let total = 0;

    // Reach clvl 1000
    const classLevelTotal = getClassLvl(41, { 41: Object.values(stats.dungeon_classlevels).reduce((acc, e) => acc + e, 0) });
    if (classLevelTotal >= 1000) total++;

    // Reach account level 100
    const accLevel = userLevel(stats.xp);
    if (accLevel >= 100) total++;

    // Beat floor 300
    if ("300" in stats.dungeon_floors && stats.dungeon_floors["300"] > 0) total++;

    return total;
};

export const formatNumberWithQuotes = (num: number) => {
    const [integerPart, decimalPart] = num.toString().split('.');
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    return decimalPart ? `${formattedIntegerPart}.${decimalPart}` : formattedIntegerPart;
};

export const searchClass = (name: string | number, interaction: ChatInputCommandInteraction, silent: boolean = false): classInfo | undefined => {
    name = name.toString().toLowerCase();

    if (!isNaN(Number(name))) {
        if (Number(name) < 0) {
            if (!silent) interaction.reply("The ID can't be negative.");
            return;
        };
        if (Number(name) >= classes.length) {
            if (!silent) interaction.reply("The ID must be smaller than " + classes.length);
            return;
        };
        return classes[parseInt(name)];
    };

    let fastCheck = classes.find((e) => e.name.toLowerCase() === name);
    if (fastCheck) return fastCheck;

    let cArgs = name.split(" ");

    let fArray = classes.filter((e) => e.name.toLowerCase()[0] === cArgs[0][0]);

    let letter = 0;
    for (let word = 0; word < cArgs.length; word++) {
        let { length: wl } = cArgs[word];

        while (wl--) {
            fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[word] === undefined ? false : e.name.toLowerCase().split(" ")[word][letter] === cArgs[word][letter]);
            letter++;
        };

        if (fArray.length < 2) break;
        letter = 0;
    };

    if (fArray.length === 0) {
        if (!silent) interaction.reply("No match found");
        return;
    }
    if (fArray.length > 1) {
        if (!silent) interaction.reply(fArray.length + " matches found");
        return;
    };
    return fArray[0];
};

export const searchCurse = (name: string | number, interaction: ChatInputCommandInteraction, silent: boolean = false) => {
    name = name.toString().toLowerCase();

    if (!isNaN(Number(name))) {
        if (Number(name) < 0) {
            if (!silent) interaction.reply("The ID can't be negative.");
            return;
        };
        if (Number(name) >= curses.length) {
            if (!silent) interaction.reply("The ID must be smaller than " + curses.length);
            return;
        };
        return curses[parseInt(name)];
    };

    let fastCheck = curses.find((e) => e.name.toLowerCase() === name);
    if (fastCheck) return fastCheck;

    let cArgs = name.split(" ");

    let fArray = curses.filter((e) => e.name.toLowerCase()[0] === cArgs[0][0]);

    let letter = 0;
    for (let word = 0; word < cArgs.length; word++) {
        let { length: wl } = cArgs[word];

        while (wl--) {
            fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[word] === undefined ? false : e.name.toLowerCase().split(" ")[word][letter] === cArgs[word][letter]);
            letter++;
        };

        if (fArray.length < 2) break;
        letter = 0;
    };

    if (fArray.length === 0) {
        if (!silent) interaction.reply("No match found");
        return;
    };
    if (fArray.length > 1) {
        if (!silent) interaction.reply(fArray.length + " matches found");
        return;
    };
    return fArray[0];
};

export const searchItem = (name: string | number, interaction: ChatInputCommandInteraction, silent: boolean = false, options: { returnSet: boolean; } = { returnSet: false }) => {
    name = name.toString().toLowerCase();

    if (!isNaN(Number(name))) {
        if (Number(name) < 0) {
            if (!silent) interaction.reply("The ID can't be negative.");
            return;
        };
        if (Number(name) >= items.length) {
            if (!silent) interaction.reply("The ID must be smaller than " + items.length);
            return;
        };
        return items[parseInt(name)];
    };

    let fastCheck = items.find((e) => e.name.toLowerCase() === name);
    if (fastCheck) return fastCheck;

    let cArgs = name.split(" ");

    let fArray = items.filter((e) => e.name.toLowerCase()[0] === cArgs[0][0]);

    let letter = 0;
    for (let word = 0; word < cArgs.length; word++) {
        let { length: wl } = cArgs[word];

        while (wl--) {
            fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[word] === undefined ? false : e.name.toLowerCase().split(" ")[word][letter] === cArgs[word][letter]);
            letter++;
        };

        if (fArray.length < 2) break;
        letter = 0;
    };

    if (fArray.length === 0) {
        if (!silent) interaction.reply("No match found");
        return;
    };
    if (fArray.length > 1) {
        if (options.returnSet && fArray.length === 4 && "setname" in fArray[0] && "setname" in fArray[1] && "setname" in fArray[2] && "setname" in fArray[3] && fArray[0].setname === fArray[1].setname && fArray[0].setname === fArray[2].setname && fArray[0].setname === fArray[3].setname) return fArray[0];
        if (!silent) interaction.reply(fArray.length + " matches found");
        return;
    };
    return fArray[0];
};

export const searchGuild = <T extends GuildSchema>(name: string, guilds: T[]) => {
    name = name.toLowerCase();
    if (!name) return guilds.sort((a, b) => 0.5 - Math.random());

    const matches = guilds.filter((e) => e.name.toLowerCase() === name);
    guilds = guilds.filter((e) => e.name.toLowerCase() !== name);
    const starts = guilds.filter((e) => e.name.toLowerCase().startsWith(name));
    guilds = guilds.filter((e) => !e.name.toLowerCase().startsWith(name));
    const includes = guilds.filter((e) => e.name.toLowerCase().includes(name));

    return [...matches, ...starts, ...includes];
};

// const downloadImage = async (url) => {
//     const response = await axios.get(url, { responseType: 'arraybuffer' });
//     // eslint-disable-next-line no-undef
//     return Buffer.from(response.data, 'binary');
// };

export const daysSince = (lastOnlineDate: Date | number) => {
    if (!lastOnlineDate) return 0;
    if (typeof lastOnlineDate === "number") lastOnlineDate = new Date(lastOnlineDate);
    const now = new Date();

    // set to midnight
    now.setHours(0, 0, 0, 0);
    lastOnlineDate.setHours(0, 0, 0, 0);

    const diffTime = now.getTime() - lastOnlineDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

const downloadImage = async (url: string) => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        // eslint-disable-next-line no-undef
        return Buffer.from(response.data, 'binary');
    } catch (error: any) {
        if (error.response && error.response.status === 429) {
            console.log("Too many requests. Please try again later.");
            // you could throw the error again to handle it further up in your call stack, or just return null or a default value
            throw error;
        } else {
            throw error; // if it's an error other than 429, just throw it again so you can handle it outside of this function
        };
    };
};

export const generateImage = async (base: string, effect: string, filename: string = `${Math.floor(Math.random() * 100000)}.png`) => {
    // Download images
    const [charImageBuffer, effectImageBuffer] = await Promise.all([
        downloadImage(base),
        downloadImage(effect)
    ]);

    // Get char image dimensions
    const charImage = sharp(charImageBuffer);
    const { width, height } = await charImage.metadata();

    // Resize effect image to match char image dimensions
    const effectImage = await sharp(effectImageBuffer)
        .resize(width, height)
        .toBuffer();

    // Combine images
    const outputImage = await charImage
        .composite([{ input: effectImage, blend: 'atop' }])
        .toBuffer();

    // Save image locally
    fs.writeFileSync(`Images/${filename}`, outputImage);

    // Delete local file after 20 seconds
    setTimeout(() => {
        fs.unlink(`Images/${filename}`, (err) => {
            if (err) console.error(`Error while deleting file ${`Images/${filename}`}`);
        });
    }, 5 * 60 * 1000); // Delete in 5 minutes

    return filename;
};

export const generateCaptcha = () => {
    const canvas = createCanvas(120, 50);
    const ctx = canvas.getContext('2d');

    // Generate a random 5 character string
    const captchaText = crypto.randomBytes(3).toString('hex');

    // Draw the captcha text
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 120, 50);
    ctx.fillStyle = '#000000';
    ctx.font = '30px Arial';

    // Slightly rotate each character
    let x = 10;
    for (const char of captchaText) {
        const rotateAngle = (Math.random() - 0.5) * Math.PI / 6; // Random angle between -15 and 15 degrees
        ctx.save();
        ctx.translate(x, 40);
        ctx.rotate(rotateAngle);
        ctx.fillText(char, 0, 0);
        ctx.restore();
        x += ctx.measureText(char).width;
    };

    // Add 1-3 random lines
    for (let i = 0; i < (2 + (Math.random() < 0.3 ? 1 : 0)); i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    };

    // Add 1-3 random dots
    for (let i = 0; i < (3 + (Math.random() < 0.3 ? 1 : 0)); i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
        ctx.fill();
    };

    // Convert to buffer then return
    const buffer = canvas.toBuffer('image/jpeg');
    return {
        attachement: new AttachmentBuilder(buffer),
        text: captchaText
    };
};

const dateString = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }).replace(/\//g, '/');
};

export const getDonationsPageWeek = (donations: GuildDonationSchema[], members: { name: string; status: string; id: string; }[], currentWeek: number, currPage: number) => {
    const startDate = new Date(donationWeekStart);
    startDate.setDate(donationWeekStart.getDate() + (7 * (currentWeek - currPage)));
    const endDate = new Date(donationWeekStart);
    endDate.setDate(donationWeekStart.getDate() + (7 * (currentWeek - currPage)) + 6);

    return `### Week ${currentWeek - currPage + 1} ➜ ${dateString(startDate)} - ${dateString(endDate)}\n${members.map((e) => `${e.name}${e.status} ➜ __${donations.filter((e) => e.week === (currentWeek - currPage + 1)).find((dono) => dono.userid === e.id)?.amount ?? 0}__ <:coins:872926669055356939>`).join("\n")}`;
};

export const lastActive = (timestamp: Date | number) => {
    const now = new Date(), date = new Date(timestamp);

    // Check if the date is today
    if (date.toDateString() === now.toDateString()) return "today";

    // Check if the date is yesterday
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "yesterday";

    // Calculate the number of days between the date and today
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return `${diff === 1 ? diff + " day" : diff + " days"} ago`;
};

/**
 * Converts a number to its Roman numeral representation
 * @param n The number to convert (1-3999)
 * @returns The Roman numeral string
 */
export const numberToRoman = (n: number): string => {
    if (n < 1 || n > 3999) return String(n);

    const romanNumerals = [
        { value: 1000, symbol: 'M' },
        { value: 900, symbol: 'CM' },
        { value: 500, symbol: 'D' },
        { value: 400, symbol: 'CD' },
        { value: 100, symbol: 'C' },
        { value: 90, symbol: 'XC' },
        { value: 50, symbol: 'L' },
        { value: 40, symbol: 'XL' },
        { value: 10, symbol: 'X' },
        { value: 9, symbol: 'IX' },
        { value: 5, symbol: 'V' },
        { value: 4, symbol: 'IV' },
        { value: 1, symbol: 'I' }
    ];

    let result = '';
    for (const { value, symbol } of romanNumerals) {
        while (n >= value) {
            result += symbol;
            n -= value;
        };
    };

    return result;
};

export const customEmojis: Record<PrimaryStat, string> = {
    "hp": "<:HP:1062043800979116143>",
    "hp%": "<:HP:1062043800979116143>",
    "atk": "<:ATK:1063214925528440832>",
    "atk%": "<:ATK:1063214925528440832>",
    "def": "<:DEF:1047269141662417037>",
    "def%": "<:DEF:1047269141662417037>",
    "md": "<:magic_dmg:948568336621527040>",
    "md%": "<:magic_dmg:948568336621527040>",
    "mr": "<:magic_resistance:1047269149237334086>",
    "cr": "<:crit_rate:1047269144195776512>",
    "cd": "<:crit_damage:1047269146511016046>",
    "dodge": "<:dodge_chance:1047269150948606063>",
    "br": "<:block_rate:1217949026281066599>",
    "mana": "<:mana:1047269152957661255>",
    "sm": "<:mana:1047269152957661255>",
    "mg": "<:mana_generation:1063215562349629570>",
    "shield": "<:shield:1062050038211166310>",

    // "coins": "<:coins:872926669055356939>",
};

export const RoK = new Map<string, IRoK>();

export const pullsToResetList = new Set();

export const deleteReplyIn = 2400;

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class idInfo {
    private _symbols: string[];
    private _length: number;
    private _blacklisted: string[];

    constructor(symbols: string) {
        this._symbols = symbols.split("");
        this._length = symbols.split("").length;
        this._blacklisted = ["", "shit", "poo", "poop", "jiz", "jizz", "fuck", "fck", "fick", "fock", "fuk", "fik", "anal", "dick", "cock", "porn", "tit", "tits", "nude", "boob", "sex", "s3x", "seks", "sexy", "bitch", "ass", "arse", "gay", "gey", "jew", "lgbt", "isis", "damn", "cunt", "nigger", "niga", "nigga", "neger", "negro", "whore", "wench", "slut", "thot", "penis", "pussy", "vagina", "coon", "rape", "suck", "sucker", "suk", "lick", "anus", "blow", "bum", "bums", "but", "butt", "clit", "cum", "horny", "god", "jerk", "piss", "trump", "biden", "cp", "pedo"];
    };

    generate(len = 2) {
        let gen = "";
        while (this._blacklisted.includes(gen.toLowerCase())) {
            gen = "";
            let iter = 0;
            while (iter < len) {
                gen += this._symbols[Math.floor(this._length * Math.random())];
                iter++;
            };
        };
        return gen;
    };

};
const itemIDs = new idInfo("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_");

export const generateUniqueItemId = (userid: string, existing: string[], len: number = 2) => {
    let gen = itemIDs.generate();
    while (existing.includes(gen + ":" + userid)) {
        gen = itemIDs.generate(Math.floor(len));
        len += 0.5;
    };
    return gen;
};

export const generateUniqueGuildId = (existing: string[], len: number = 5) => {
    let gen = itemIDs.generate(len);
    while (existing.includes(gen)) {
        gen = itemIDs.generate(Math.floor(len));
        len += 0.5;
    };
    return gen;
};

export const getLetterRank = (score: number) => {
    const ranks = Object.keys(rankLowerRanges) as (keyof typeof rankLowerRanges)[];
    let highestRank: RaidRank = "F-", highestRankScore = 0;
    for (const rank of ranks) {
        if (score >= rankLowerRanges[rank] && rankLowerRanges[rank] > highestRankScore) {
            highestRank = rank;
            highestRankScore = rankLowerRanges[rank];
        };
    };
    return highestRank;
};

export const isStampedeMonth = () => {
    return (new Date().getMonth() % 2) === 0;
};

// Export CSV
// const csvWriter = require('fast-csv');

// let data = characters.map((e) => ({
//     character: e.name,
//     series: e.anime,
//     rarity: e.rarity,
//     id: e.id,
//     hp: baseHP(e.id),
//     atk_md: baseATK(e.id),
//     def_mr: baseDEF(e.id),
//     ep: baseEP(e.id),
//     expertise: baseExpertise(e.id),
// }));

// const ws = fs.createWriteStream('output.csv');


// csvWriter.writeToStream(ws, data, { headers: true, delimiter: ';' })
//     .on('finish', function() {
//         console.log('CSV file successfully created');
//     });
