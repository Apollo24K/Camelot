/* eslint-disable no-unused-vars */
const fs = require('fs');
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const imagesize = require('imagesize');
const axios = require('axios');
const sharp = require('sharp');
const https = require("https");
const { createCanvas } = require('@napi-rs/canvas');
const crypto = require('crypto');
const { characters } = require("./chars.js");
const { achievements } = require("./achievements.js");
const { dailies } = require("../Modules/dailyQuests.js");
const { classes } = require("./classes.js");
const buffInfo = require("./buffs.js");
const { db, query } = require("../db_handler.js");
const _ = require('lodash');

const statsOp = {
    "base": {
        "hp": { "238": -20, "405": -6, "460": 54, "512": 60, "2016": -10, "2079": 12, "2360": 12, "2597": 24, "3150": 6, "3307": -20, "3408": -20, "3409": 12, "3886": 20, "4769": -20, "5032": -9, "5341": 20, "5344": 16, "5819": -20, "8188": 30, "8189": 40, "8521": 12, "8582": 20, "9606": -6, "10520": 37, "10521": -14, "10523": 30, "10530": 40, "12000": 16, "12121": 10, "12424": 1, "17583": -11, "17688": -25, "17689": 12, "17871": -13, "18011": -9 },
        "atk": { "238": -11, "405": 12, "460": -12, "512": -10, "2079": 9, "2016": -2, "3150": 4, "3409": 14, "3886": 4, "4250": 10, "4712": -8, "5341": 6, "5344": 10, "6082": -13, "8187": 7, "8189": 10, "8521": 5, "9606": 3, "10517": 10, "10520": 20, "10521": -4, "10523": 5, "10530": 8, "12000": 10, "12121": 7, "12393": -5, "12424": 15, "17583": -10, "17689": -2, "17871": -4, "18011": -6 },
        "def": { "405": 1, "460": 1, "512": 15, "2360": 9, "2597": 5, "3150": 8, "3409": 6, "9606": 19, "10517": 5, "12121": 5, "12393": 10, "12424": 10, "17583": -18, "17871": -5, "18011": -4 },
        "expertise": { "72": "sword", "73": "sword", "77": "bow", "159": "sword", "405": "sword", "408": "any", "512": "shield", "523": "sword", "577": "staff", "578": "staff", "680": "lance", "688": "sword", "712": "lance", "733": "sword", "735": "bow", "767": "staff", "769": "sword", "844": "dagger", "999": "lance", "1001": "sword", "1550": "sword", "1824": "dagger", "1850": "lance", "1851": "lance", "2078": "staff", "2079": "axe", "2080": "lance", "2291": "staff", "2420": "sword", "2597": "sword", "2814": "bow", "2848": "dagger", "3109": "shield", "3150": "dagger", "3307": "axe", "3308": "lance", "4250": "sword", "4474": "staff", "4767": "sword", "4769": "staff", "5224": "dagger", "5341": "lance", "6029": "bow", "6030": "bow", "8189": "sword", "8521": "dagger", "9000": "sword", "9365": "staff", "9454": "dagger", "9648": "dagger", "9677": "sword", "9824": "axe", "10300": "lance", "10324": "sword", "10517": "sword", "10520": "lance", "10521": "staff", "10522": "dagger", "10523": "bow", "10524": "staff", "10527": "dagger", "10800": "sword", "10958": "sword", "11244": "sword", "11246": "sword", "12345": "staff", "12387": "axe", "12388": "any", "12393": "bow", "12399": "bow", "12450": "lance", "12451": "sword", "12775": "dagger", "12776": "dagger", "12857": "sword", "13186": "bow", "13285": "sword", "13574": "staff", "13780": "sword", "14091": "bow", "14405": "bow", "14903": "bow", "14904": "sword", "15251": "lance", "16107": "bow", "16109": "sword", "16110": "lance", "16119": "bow", "16919": "sword", "17115": "sword", "17116": "sword", "17117": "staff", "17118": "sword", "17583": "any", "17686": "axe", "17687": "bow", "17688": "any", "17689": "any", "19048": "staff", "19050": "sword", "19051": "bow" },
    },
};

module.exports.getDimensions = (url) => {
    return new Promise((resolve, rejects) => {
        let request = https.get(url, (response) => {
            imagesize(response, (err, result) => {
                request.destroy();
                resolve(result);
            });
        });
    });
};

function strCode(id) {
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

function baseHP(id) {
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

function baseATK(id) {
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

function baseDEF(id) {
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

function baseEP(id, hp = baseHP(id), atk = baseATK(id), def = baseDEF(id), md = atk, mr = def, cd = 1.25, cr = 0.18, dodge = 0.1) {
    return Math.floor(((1 / (1 - dodge)) * (hp / Math.pow(0.99895, Math.max(def, mr))) / (200 / (Math.max(atk, md) * (1 + (cat1(cr) * (cd - 1)))))) * 100) / 100;
};

function baseExpertise(id) {
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

module.exports.baseHP = id => baseHP(id);
module.exports.baseATK = id => baseATK(id);
module.exports.baseDEF = id => baseDEF(id);
module.exports.baseEP = id => baseEP(id);
module.exports.baseExpertise = id => baseExpertise(id);

function cat1(num) {
    if (num > 1) return 1;
    if (num < 0) return 0;
    return num;
};

module.exports.cat1 = id => cat1(id);

const lvlupStats = {
    "EX": { "hp": { "base": 5, "add": 1 }, "atk": { "base": 2.4, "add": 0.35 }, "def": { "base": 1.25, "add": 0.25 } },
    "SS": { "hp": { "base": 5, "add": 1 }, "atk": { "base": 2.4, "add": 0.35 }, "def": { "base": 1.25, "add": 0.25 } },
    "S": { "hp": { "base": 3.9, "add": 0.6 }, "atk": { "base": 1.9, "add": 0.3 }, "def": { "base": 1, "add": 0.2 } },
    "A": { "hp": { "base": 3.3, "add": 0.4 }, "atk": { "base": 1.6, "add": 0.25 }, "def": { "base": 0.8, "add": 0.15 } },
    "B": { "hp": { "base": 2.8, "add": 0.4 }, "atk": { "base": 1.2, "add": 0.3 }, "def": { "base": 0.6, "add": 0.2 } },
    "C": { "hp": { "base": 2.4, "add": 0.4 }, "atk": { "base": 0.9, "add": 0.35 }, "def": { "base": 0.5, "add": 0.15 } },
    "D": { "hp": { "base": 2, "add": 0.4 }, "atk": { "base": 0.75, "add": 0.25 }, "def": { "base": 0.4, "add": 0.1 } },
};

const retainItemStats = new Map();

module.exports.getDetailedStats = async (id, inv, classLevel, lu = 0, refine = false) => {

    let dStats = {
        "name": characters[id].name,
        "hp": baseHP(id),
        "maxhp": 1,
        "bhp": 1,
        "atk": baseATK(id),
        "batk": 1,
        "def": baseDEF(id),
        "bdef": 1,
        "ep": 0,
        "md": 0,
        "bmd": 1,
        "mr": 0,
        "bmr": 0,
        "cr": 0.18,
        "cd": 1.25,
        "td": 0,
        "br": 0.2,
        "agility": 80,
        "dodge": 0.1,
        "mana": 80,
        "mg": 15,
        "sm": 20,
        "shield": 0,
        "mdChance": 0,
        "rev": 0,
        "revhp": 0.5,
        "revivedTotal": 0,
        "maxRevivals": 0,
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
        "ignoreShield": false,
        "damageReduction": 0,
        "delayedBuffs": [],
        "replaceButton": {},
        "lvl": (inv.level ?? 1) + lu,
        "ref": 0,
        "class": -1,
        "clvl": 1,
        "expertise": baseExpertise(id),
        "weapon": -1,
        "weaponinfo": {},
        "weaponicon": { "sword": "<:sword_empty:1034502134474997790>", "staff": "<:staff_empty:1034502136622485524>", "axe": "<:axe_empty:1034567413527760917>", "bow": "<:bow_empty:1034567415209664672>", "lance": "<:lance_empty:1034567416522473502>", "dagger": "<:dagger_empty:1034567417982091434>", "shield": "<:shield_empty:1087089686809415730>", "any": "<:any_empty:1113010026664169494>" }[baseExpertise(id)],
        "uniqueids": []
    };

    // if (inv.level[id]) dStats.lvl = inv.level[id];
    // dStats.lvl += lu;
    if (inv.ref[id]) dStats.ref = inv.ref[id];
    if (refine) dStats.ref++;
    if (dStats.ref > 5) dStats.ref = 5;

    let clsStats;
    if (inv.class !== null) {
        dStats.class = inv.class;
        dStats.clvl = getClassLvl(dStats.class, classLevel);
        clsStats = classes[dStats.class].stats;
        Object.keys(clsStats).forEach((s) => dStats[s] = dStats[s] * clsStats[s][0] + clsStats[s][1]);
        ["mana", "mg", "sm"].forEach((stat) => dStats[stat] = Math.floor(dStats[stat]));
    };

    // Add level bonus
    const bankup = Math.max(0, Math.floor((Math.sqrt((2 * (inv.bank)) + (100 * (dStats.lvl * dStats.lvl)) + (700 * dStats.lvl) + 1225) / 10) - 3.5 - dStats.lvl));
    dStats.hp = Math.floor((1 + 0.25 * (dStats.ref - 1)) * dStats.hp) + Math.round((lvlupStats[characters[id].rarity].hp.base + (lvlupStats[characters[id].rarity].hp.add * ((strCode(id) % 10) / 9))) * (dStats.lvl - 1 + bankup));
    dStats.atk = Math.floor((1 + 0.25 * (dStats.ref - 1)) * dStats.atk) + Math.round((lvlupStats[characters[id].rarity].atk.base + (lvlupStats[characters[id].rarity].atk.add * ((dStats.atk - 50) / 30))) * (dStats.lvl - 1 + bankup));
    dStats.def = Math.floor((1 + 0.25 * (dStats.ref - 1)) * dStats.def) + Math.round((lvlupStats[characters[id].rarity].def.base + (lvlupStats[characters[id].rarity].def.add * ((dStats.def - 50) / 30))) * (dStats.lvl - 1 + bankup));
    dStats.bhp = dStats.hp, dStats.td = dStats.atk, dStats.md = dStats.atk, dStats.batk = dStats.atk, dStats.bmd = dStats.atk, dStats.mr = dStats.def, dStats.bdef = dStats.def, dStats.bmr = dStats.def;

    if (dStats.class !== -1) {
        let scale = [{},
        { "hp": 1.25, "atk": 0.75, "md": 0.75, "def": 0.3, "mr": 0.3, "mana": 0.15 },
        { "hp": 1.6, "atk": 1, "md": 1, "def": 0.5, "mr": 0.5, "mana": 0.2 },
        { "hp": 2.25, "atk": 1.1, "md": 1.1, "def": 0.6, "mr": 0.6, "mana": 0.25 },
        { "hp": 3, "atk": 1.4, "md": 1.4, "def": 0.8, "mr": 0.8, "mana": 0.32 }
        ][classes[dStats.class].tier];
        ["hp", "atk", "md", "mana"].forEach((s) => dStats[s] += Math.floor((scale[s] * clsStats[s][0]) * (dStats.clvl - 1)));
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
        const { items } = require("./items.js");
        let weapon, shield, helmet, cuirass, gloves, boots;

        // Add weapon stats if available
        if (inv.equipment.weapon) {

            clearTimeout(retainItemStats.get(inv.equipment.weapon)?.timeout);
            weapon = retainItemStats.get(inv.equipment.weapon)?.stats ?? await query(`SELECT * FROM weapons WHERE uniqueid = '${inv.equipment.weapon}'`);
            retainItemStats.set(inv.equipment.weapon, { stats: weapon, timeout: setTimeout(() => retainItemStats.delete(inv.equipment.weapon), 10 * 1000) });

            // weapon = await query(`SELECT * FROM weapons WHERE uniqueid = '${inv.equipment.weapon}'`);
            if (weapon[0]) {
                dStats.uniqueids.push(weapon[0].uniqueid.split(":")[0]);
                weapon = { id: weapon[0].itemid, level: getItemLevel(weapon[0].level), ascension: weapon[0].ascension, purity: weapon[0].purity };
                const item = items[weapon.id];

                // Set item to dStats
                dStats.weapon = weapon.id;
                dStats.weaponicon = item.emoji;
                dStats.weaponinfo = { ...weapon };

                if (item.type === "staff") dStats.mdChance = 1;

                // Primary Stat
                if (["atk%", "md%", "cr", "cd", "dodge", "br"].includes(item.primaryStat)) {
                    if (item.primaryStat.endsWith("%")) {
                        const statBuff = dStats["b" + item.primaryStat.slice(0, -1)] * (1 + Math.floor(item.psmin + ((item.psmax - item.psmin) / 150) * ((weapon.level - 1) + (weapon.ascension * 3))) / 100);
                        dStats[item.primaryStat.slice(0, -1)] += Math.floor(statBuff * ((item.type === dStats.expertise || dStats.expertise === "any") ? 1.2 : 1));
                    } else {
                        const statBuff = (item.psmin + ((item.psmax - item.psmin) * ((weapon.level - 1) + (weapon.ascension * 3)) / 150)) / 100;
                        dStats[item.primaryStat] += Math.floor(statBuff * ((item.type === dStats.expertise || dStats.expertise === "any") ? 1.2 : 1));
                    };
                } else {
                    const statBuff = Math.floor(parseInt(item.psmin) + ((parseInt(item.psmax) - parseInt(item.psmin)) / 150) * ((weapon.level - 1) + (weapon.ascension * 3)));
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

        // Add shield stats if available
        if (inv.equipment.shield && (inv.premium > 3 || inv.shield_slot)) {

            clearTimeout(retainItemStats.get(inv.equipment.shield)?.timeout);
            shield = retainItemStats.get(inv.equipment.shield)?.stats ?? await query(`SELECT * FROM weapons WHERE uniqueid = '${inv.equipment.shield}'`);
            retainItemStats.set(inv.equipment.shield, { stats: shield, timeout: setTimeout(() => retainItemStats.delete(inv.equipment.shield), 10 * 1000) });

            // shield = await query(`SELECT * FROM weapons WHERE uniqueid = '${inv.equipment.shield}'`);
            if (shield[0]) {
                dStats.uniqueids.push(shield[0].uniqueid.split(":")[0]);
                shield = { id: shield[0].itemid, level: getItemLevel(shield[0].level), ascension: shield[0].ascension, purity: shield[0].purity };
                const item = items[shield.id];

                // Set item to dStats
                dStats.shieldid = shield.id;
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
                    dStats[item.primaryStat] += Math.floor(parseInt(item.psmin) + ((parseInt(item.psmax) - parseInt(item.psmin)) / 150) * ((shield.level - 1) + (shield.ascension * 3)));
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

        // Add helmet stat if available
        if (inv.equipment.helmet) {
            clearTimeout(retainItemStats.get(inv.equipment.helmet)?.timeout);
            helmet = retainItemStats.get(inv.equipment.helmet)?.stats ?? await query(`SELECT * FROM weapons WHERE uniqueid = '${inv.equipment.helmet}'`);
            retainItemStats.set(inv.equipment.helmet, { stats: helmet, timeout: setTimeout(() => retainItemStats.delete(inv.equipment.helmet), 10 * 1000) });

            // helmet = await query(`SELECT * FROM weapons WHERE uniqueid = '${inv.equipment.helmet}'`);
            if (helmet[0]) {
                dStats.uniqueids.push(helmet[0].uniqueid.split(":")[0]);
                helmet = { id: helmet[0].itemid, level: getItemLevel(helmet[0].level), ascension: helmet[0].ascension, purity: helmet[0].purity, substats: JSON.parse(helmet[0].substats) };
                const item = items[helmet.id];

                // Set item to dStats
                dStats.helmet = helmet.id;
                dStats.helmeticon = item.emoji;
                dStats.helmetinfo = { ...helmet };

                dStats[item.primaryStat] += Math.floor(parseInt(item.psmin) + ((parseInt(item.psmax) - parseInt(item.psmin)) / 150) * ((helmet.level - 1) + (helmet.ascension * 3)));
            };
        };

        // Add cuirass stat if available
        if (inv.equipment.cuirass) {
            clearTimeout(retainItemStats.get(inv.equipment.cuirass)?.timeout);
            cuirass = retainItemStats.get(inv.equipment.cuirass)?.stats ?? await query(`SELECT * FROM weapons WHERE uniqueid = '${inv.equipment.cuirass}'`);
            retainItemStats.set(inv.equipment.cuirass, { stats: cuirass, timeout: setTimeout(() => retainItemStats.delete(inv.equipment.cuirass), 10 * 1000) });

            // cuirass = await query(`SELECT * FROM weapons WHERE uniqueid = '${inv.equipment.cuirass}'`);
            if (cuirass[0]) {
                dStats.uniqueids.push(cuirass[0].uniqueid.split(":")[0]);
                cuirass = { id: cuirass[0].itemid, level: getItemLevel(cuirass[0].level), ascension: cuirass[0].ascension, purity: cuirass[0].purity, substats: JSON.parse(cuirass[0].substats) };
                const item = items[cuirass.id];

                // Set item to dStats
                dStats.cuirass = cuirass.id;
                dStats.cuirassicon = item.emoji;
                dStats.cuirassinfo = { ...cuirass };

                dStats[item.primaryStat] += Math.floor(parseInt(item.psmin) + ((parseInt(item.psmax) - parseInt(item.psmin)) / 150) * ((cuirass.level - 1) + (cuirass.ascension * 3)));
            };
        };

        // Add gloves stat if available
        if (inv.equipment.gloves) {
            clearTimeout(retainItemStats.get(inv.equipment.gloves)?.timeout);
            gloves = retainItemStats.get(inv.equipment.gloves)?.stats ?? await query(`SELECT * FROM weapons WHERE uniqueid = '${inv.equipment.gloves}'`);
            retainItemStats.set(inv.equipment.gloves, { stats: gloves, timeout: setTimeout(() => retainItemStats.delete(inv.equipment.gloves), 10 * 1000) });

            // gloves = await query(`SELECT * FROM weapons WHERE uniqueid = '${inv.equipment.gloves}'`);
            if (gloves[0]) {
                dStats.uniqueids.push(gloves[0].uniqueid.split(":")[0]);
                gloves = { id: gloves[0].itemid, level: getItemLevel(gloves[0].level), ascension: gloves[0].ascension, purity: gloves[0].purity, substats: JSON.parse(gloves[0].substats) };
                const item = items[gloves.id];

                // Set item to dStats
                dStats.gloves = gloves.id;
                dStats.glovesicon = item.emoji;
                dStats.glovesinfo = { ...gloves };

                dStats[item.primaryStat] += Math.floor(parseInt(item.psmin) + ((parseInt(item.psmax) - parseInt(item.psmin)) / 150) * ((gloves.level - 1) + (gloves.ascension * 3)));
            };
        };

        // Add gloves stat if available
        if (inv.equipment.boots) {
            clearTimeout(retainItemStats.get(inv.equipment.boots)?.timeout);
            boots = retainItemStats.get(inv.equipment.boots)?.stats ?? await query(`SELECT * FROM weapons WHERE uniqueid = '${inv.equipment.boots}'`);
            retainItemStats.set(inv.equipment.boots, { stats: boots, timeout: setTimeout(() => retainItemStats.delete(inv.equipment.boots), 10 * 1000) });

            // boots = await query(`SELECT * FROM weapons WHERE uniqueid = '${inv.equipment.boots}'`);
            if (boots[0]) {
                dStats.uniqueids.push(boots[0].uniqueid.split(":")[0]);
                boots = { id: boots[0].itemid, level: getItemLevel(boots[0].level), ascension: boots[0].ascension, purity: boots[0].purity, substats: JSON.parse(boots[0].substats) };
                const item = items[boots.id];

                // Set item to dStats
                dStats.boots = boots.id;
                dStats.bootsicon = item.emoji;
                dStats.bootsinfo = { ...boots };

                dStats[item.primaryStat] += Math.floor(parseInt(item.psmin) + ((parseInt(item.psmax) - parseInt(item.psmin)) / 150) * ((boots.level - 1) + (boots.ascension * 3)));
            };
        };

        // Lria's masks
        if (id === 18011 && inv.equipment.mask) {
            dStats.maskinfo = inv.equipment.mask;
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

function getDamage(target, attacker, targetBuff, attackerBuff, matchStats, notice, log, flags = {}) {
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
    Object.keys(flags).forEach((e) => options[e] = flags[e]);

    // Calculate damage
    let damage;
    if (options.magicDamage && options.mdChance < attacker.mdChance) {
        damage = options.overwriteDamage || Math.floor(((options.atkMultiplier * attacker.md * ((options.combodmg && attacker.combodmg) ? (1 + Math.min(1.4, matchStats.attackStreak * attacker.combodmg)) : 1)) * Math.max(Math.pow(0.99895, options.defMultiplier * target.mr), (target.removeDefCap ? 0 : 0.1))) * (1 - (0.2 * Math.random())) * ((options.canCrit && options.critChance < (attacker.cr + options.critBuff)) ? (options.critMultiplier * attacker.cd) : 1));
    } else {
        damage = options.overwriteDamage || Math.floor(((options.atkMultiplier * attacker.atk * ((options.combodmg && attacker.combodmg) ? (1 + Math.min(1.4, matchStats.attackStreak * attacker.combodmg)) : 1)) * Math.max(Math.pow(0.99895, options.defMultiplier * target.def), (target.removeDefCap ? 0 : 0.1))) * (1 - (0.2 * Math.random())) * ((options.canCrit && options.critChance < (attacker.cr + options.critBuff)) ? (options.critMultiplier * attacker.cd) : 1));
    };

    return damage;
};
module.exports.getDamage = getDamage;

module.exports.dealDamage = (target, attacker, targetBuff, attackerBuff, matchStats, notice, log, flags = {}) => {
    const options = { // true = enabled, false = disabled
        block: target.usedBlockRound === matchStats.round,
        dodge: true,
        overwriteDamage: 0,
        atkMultiplier: 1,
        magicDamage: false,
        mdChance: Math.random(),
        trueDamage: false,
        tdPercentage: 0,
        canCrit: true,
        critChance: Math.random(),
        critBuff: 0,
        critMultiplier: 1,
        defMultiplier: 1,
        overwriteNotice: false,
        ignoreShield: attacker.ignoreShield,
        shieldBreak: false,
        combodmg: false,
        selfdmg: false,
        selfheal: true,
        selfhealChance: Math.random(),
        critbleed: matchStats.critbleed,
        execute: matchStats.allowExecution,
        canTwinshot: false,
    };
    Object.keys(flags).forEach((e) => options[e] = flags[e]);

    // Try blocking or dodging
    if (options.block && Math.random() < target.br) {
        notice.push(`\n🛡️ **${target.name}** blocked the attack!`);
        matchStats.attackStreak = 0;
        target.dodgeStreak = 0;
        target.blockStreak++;
        if (target.blockBuffDef) targetBuff.def.push(new buffInfo("+", target.blockBuffDef, 6)), targetBuff.mr.push(new buffInfo("+", target.blockBuffDef, 6));
        if (target.blockBurn) attacker.hp -= Math.floor(attacker.hp > 2 * target.hp ? 2 * target.hp * target.blockBurn : attacker.hp * target.blockBurn);

        // Diminishing Returns
        // if (target.blockStreak >= 2) targetBuff.br.push(new buffInfo("*", 0.875, 6));

        // Achievements & Daily Quests
        achievements[13].check(matchStats.interaction, matchStats.interaction.user, target.blockStreak), achievements[14].check(matchStats.interaction, matchStats.interaction.user, target.blockStreak); // Invincible
        if (target.blockStreak === 2) dailies[6].update(matchStats.interaction); // Impenetrable Defense
        return 0;
    }; /* Reset BlockStreak */ target.blockStreak = 0;
    if (options.dodge && Math.random() < target.dodge) {
        notice.push(`\n💨 **${target.name}** dodged the attack!${matchStats.dodgebuff ? ` Gained **+${matchStats.dodgebuff * 100}%** ATK` : ""}`);
        matchStats.attackStreak = 0;
        target.dodgeStreak++;
        if (target.dodgeHeal) {
            target.hp += Math.floor(target.maxhp * target.dodgeHeal);
            if (target.hp > target.maxhp) target.hp = target.maxhp;
        };
        if (matchStats.dodgebuff) targetBuff.atk.push(new buffInfo("*", 1 + matchStats.dodgebuff, 5));

        // Diminishing Returns
        // if (target.dodgeStreak >= 2) targetBuff.dodge.push(new buffInfo("*", 0.875, 6));

        return 0;
    }; /* Reset DodgeStreak */ target.dodgeStreak = 0;

    // Calculate damage
    let damage = getDamage(target, attacker, targetBuff, attackerBuff, matchStats, notice, log, flags);
    // let damage;
    // if (options.magicDamage && options.mdChance < attacker.mdChance) {
    //     damage = options.overwriteDamage || Math.floor(((options.atkMultiplier * attacker.md * ((options.combodmg && attacker.combodmg) ? (1 + Math.min(1.4, matchStats.attackStreak * attacker.combodmg)) : 1)) * Math.max(Math.pow(0.99895, options.defMultiplier * target.mr), (target.removeDefCap ? 0 : 0.1))) * (1 - (0.2 * Math.random())) * ((options.canCrit && options.critChance < (attacker.cr + options.critBuff)) ? (options.critMultiplier * attacker.cd) : 1));
    // } else {
    //     damage = options.overwriteDamage || Math.floor(((options.atkMultiplier * attacker.atk * ((options.combodmg && attacker.combodmg) ? (1 + Math.min(1.4, matchStats.attackStreak * attacker.combodmg)) : 1)) * Math.max(Math.pow(0.99895, options.defMultiplier * target.def), (target.removeDefCap ? 0 : 0.1))) * (1 - (0.2 * Math.random())) * ((options.canCrit && options.critChance < (attacker.cr + options.critBuff)) ? (options.critMultiplier * attacker.cd) : 1));
    // };

    // Damage Reduction
    if (target.damageReduction) {
        damage = Math.floor(damage * (1 - Math.max(0, Math.min(1, target.damageReduction))));
    };

    // Vulnerability
    if (target.vulnerability) {
        damage = Math.floor(damage * target.vulnerability);
    };

    // Counter the attack
    if (target.counter > 0) {
        target.counter--;
        notice.push(`\n✨ **${target.name}** countered the attack!`);
        return module.exports.dealDamage(attacker, target, attackerBuff, targetBuff, matchStats, notice, `⚔️ **${target.name}**`, flags);
    };

    // Evade Deadly Attack
    if (
        (target.evadeDeathStrike && target.evadeDeathStrike > 0) && // Can evade a deadly strike
        (target.evadeDeathChance > Math.random()) && // Chance
        (options.ignoreShield || target.shield < 1) && // No shield
        (Math.floor(target.hp - damage) < 1) // Would kill
    ) {
        target.evadeDeathStrike--;
        notice.push(`\n✨ **${target.name}** has evaded a deadly attack!`);
        return 0;
    };

    // Damage on Hold
    if (target.putDamageOnHold) {
        const onHold = Math.floor(damage * target.putDamageOnHold);
        target.damageOnHold = (target.damageOnHold ?? 0) + onHold;
        damage -= onHold;
    };

    // Apply damage to target
    if (!options.ignoreShield && target.shield > 0) {
        target.shield = Math.floor(target.shield - damage);
        if (target.shield < 0 || options.shieldBreak) target.shield = 0;
        notice.push(options.overwriteNotice ? log : `\n${log} has dealt${(options.canCrit && options.critChance < attacker.cr) ? " a critical hit!" : ""} **${damage}**${(options.magicDamage && options.mdChance < attacker.mdChance) ? " magic" : ""} damage${target.shield === 0 ? `. **${target.name}**'s shield broke down!` : ""}`);
    } else {
        target.hp = Math.floor(target.hp - damage);
        if (target.hp < 1) target.hp = 0;
        notice.push(options.overwriteNotice ? log : `\n${log} has dealt${(options.canCrit && options.critChance < attacker.cr) ? " a critical hit!" : ""} **${damage}**${(options.magicDamage && options.mdChance < attacker.mdChance) ? " magic" : ""} damage`);
    };

    // If it executes
    if (options.execute && (target.hp / target.maxhp) < attacker.executeHP) {
        notice.push(`\n⚔️ **${target.name}** was executed!`);
        damage += target.hp;
        target.hp = 0;
        return damage;
    };

    // Passives
    target.damageTaken += damage;
    if (options.combodmg && attacker.combodmg) matchStats.attackStreak++;
    if (options.critbleed && options.canCrit && options.critChance < attacker.cr) targetBuff.hp.push(new buffInfo("+", (target.maxhp > (2 * attacker.maxhp)) ? (-attacker.maxhp * 0.06) : (-target.maxhp * 0.03), matchStats.critbleedlast));
    if (attacker.critmana && options.canCrit && options.critChance < attacker.cr) attacker.sm = Math.min(attacker.sm + attacker.critmana, attacker.mana);
    // if (options.selfheal && matchStats.selfhealChance > options.selfhealChance) attacker.hp += Math.floor(damage * matchStats.selfheal);
    if (options.selfheal && attacker.selfheal) {
        for (let i = 0; i < attacker.selfheal.length; i++) {
            if (attacker.selfhealChance[i] > Math.random()) attacker.hp += Math.floor(damage * attacker.selfheal[i]);
        };
    };
    if (options.selfdmg && Math.random() < matchStats.selfdmg) attacker.hp -= damage;
    if ("gintokiStacks" in attacker && options.canCrit && options.critChance < attacker.cr) attacker.gintokiStacks = 0;
    if (damage && attacker.guinaifenStackRounds?.filter((e) => e >= (matchStats.round - attacker.guinaifenStackLast)).length < attacker.guinaifenStackMax) {
        targetBuff.hp.push(new buffInfo("+", -Math.floor(0.06 * damage), attacker.guinaifenStackLast));
        attacker.guinaifenStackRounds.push(matchStats.round);
    };
    if (attacker.hp > attacker.maxhp) attacker.hp = attacker.maxhp;
    if (attacker.hp < 0) attacker.hp = 0;

    // Twinshot
    if (options.canTwinshot && matchStats.twinshot > Math.random()) {
        flags.canTwinshot = false;
        return damage + module.exports.dealDamage(target, attacker, targetBuff, attackerBuff, matchStats, notice, log, flags);
    };

    return damage;
};

module.exports.generateSubstats = (n = 4) => {
    const stats = ["hp", "atk", "atk%", "def", "md", "md%", "mr", "shield", "cr", "cd", "dodge", "br", "mana", "mg", "sm"];
    return stats.sort((a, b) => 0.5 - Math.random()).slice(0, n).reduce((acc, curr) => (acc[curr] = 1, acc), {});
};

function getAscensionMaterial(id, ascItems) {
    id += "camelot";
    let hash = 3;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0;
    };
    return ascItems[Math.abs(hash) % ascItems.length];
};
module.exports.getAscensionMaterial = (id, ascItems) => getAscensionMaterial(id, ascItems);

module.exports.filterItems = (userItems, choice, exclude = [], sellGrade = false, sellType = false, stats = false) => {
    const { items } = require("./items.js");
    const itemsToDisassemble = [];
    const itemIdsToDisassemble = [];
    const loot = {};

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
        const craftItem = items.find((e) => e.type === "crafting material" && e.grade === fItem.grade);
        const levelItem = items[fItem.category === "weapon" ? 56 : 57];
        const awakenItem = items[683];

        let exchangeItem = false;
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
            let type = fItem.category;
            if (type === "armor" || fItem.type === "shield") type = fItem.type;
            if (type === "shield" && stats.premium < 4) type = "weapon";
            if (stats.equipment[type] === item.uniqueid) delete stats.equipment[type];
        };

        itemsToDisassemble.push(fItem);
        itemIdsToDisassemble.push(item);
    };

    return { itemsToDisassemble, itemIdsToDisassemble, loot };
};

module.exports.showPage = (currPage, arr, elements = 15) => {
    return arr.slice((currPage - 1) * elements, currPage * elements);
};

module.exports.showField = (currPage, arr, elements) => {
    return arr.slice((currPage - 1) * elements, currPage * elements)[0]
}

module.exports.search = (name, inv, interaction, silent = false) => {
    name = name.toLowerCase().split(" ").filter((e) => e).join(" ");
    if (name === "last" || name === "latest") name = inv[inv.length - 1].toString();

    if (!isNaN(name)) {
        if (name < 0) return silent ? false : interaction.reply("The ID can't be negative.");
        if (name >= characters.length) return silent ? false : interaction.reply(`The ID must be smaller than ${characters.length}`);
        if (!(name[0] === "0" && name.length > 1)) return characters[parseInt(name)];
    };

    // Full Name Search
    let fastCheck = characters.filter((e) => e.name.toLowerCase() === name || e.alias.some((a) => a.toLowerCase() === name));
    if (fastCheck[0] !== undefined) return fastCheck[0];

    // Filter
    const fArray = characters.filter((e) => e.name.toLowerCase().startsWith(name) || e.alias.some((a) => a.toLowerCase().startsWith(name)));

    if (fArray.length === 0) return silent ? false : interaction.reply("No match found");
    if (fArray.length > 1) return silent ? false : interaction.reply(`${fArray.length} matches found:\n> ‧ ${fArray.sort((a, b) => b.name.toLowerCase().startsWith(name) - a.name.toLowerCase().startsWith(name)).map((e) => e.name.toLowerCase().startsWith(name) ? e.name : e.name + " (alias: " + e.alias.find((a) => a.toLowerCase().startsWith(name)) + ")").slice(0, 8).join('\n> ‧ ')}${fArray.length > 8 ? `\n+ ${fArray.length - 8} more` : ""}`);
    return fArray[0];
};

function rarity(rar) {
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

module.exports.rarity = (rar) => {
    return rarity(rar);
};

function getRefinement(cid) {
    if (cid > 4) return "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552>";
    switch (cid) {
        case 4: return "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136>";
        case 3: return "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
        case 2: return "<:refinement:869132309125824552><:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
        case 1: return "<:refinement:869132309125824552><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
        default: return "<:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136><:refinement_hollow:869132322857947136>";
    };
};

module.exports.getRefinement = (cid) => {
    return getRefinement(cid);
};

function splitTitle(title) {
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

module.exports.splitTitle = title => splitTitle(title);

module.exports.displayPull = (user, thisChar, pCount, dupes, pullsMade, lastVote, refinement) => {
    let animeL = splitTitle(thisChar.anime);
    refinement = getRefinement(refinement);

    // Check if vote
    let canVote = "";
    if ((pCount - pullsMade) === 0) {
        canVote = ` | You can /vote`;
        if (lastVote && ((new Date().getTime() - lastVote) < 12 * 60 * 60 * 1000)) canVote = "";
    };

    const Embed = new EmbedBuilder()
        .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[thisChar.rarity])
        .setImage(thisChar.image)
        .setThumbnail(rarity(thisChar.rarity))
        .setDescription(`**${thisChar.name}**\n${animeL}\n\n**Ref**. ${refinement}`)
        .setFooter({ text: `You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of this\n${pCount - pullsMade} ${pCount - pullsMade == 1 ? "pull" : "pulls"} left${canVote}`, iconURL: user.displayAvatarURL({ dynamic: true }) + "?size=2048" });
    return { embeds: [Embed] };
};

module.exports.searchAnime = (name, inv, interaction) => {
    name = name.toLowerCase();
    if (name === "last" || name === "latest") name = characters[inv[inv.length - 1]].anime.toLowerCase();

    // Full Title Search
    let fastCheck = characters.filter((e) => e.anime.toLowerCase() === name.toLowerCase() || e.anialias.some((a) => a.toLowerCase() === name.toLowerCase()));
    if (fastCheck[0] !== undefined) return fastCheck;

    // Acronym Search
    fastCheck = characters.filter((e) => e.anime.toLowerCase().match(/\b(\w)/g).join('') === name.toLowerCase() || e.anialias.some((a => a.toLowerCase().match(/\b(\w)/g).join('') === name.toLowerCase())));
    for (let i = 0; i < fastCheck.length; i++) {
        if (fastCheck[i].anime != fastCheck[0].anime) fastCheck = [];
    };
    if (fastCheck[0] !== undefined) return fastCheck;

    // Filter
    const fArray = characters.filter((e) => e.anime.toLowerCase().startsWith(name) || e.anialias.some((a) => a.toLowerCase().startsWith(name)));

    if (fArray.length === 0) return interaction.reply("No match found");
    if ([...new Set(fArray.map((e) => e.anime))].length > 1) return interaction.reply(`${[...new Set(fArray.map((e) => e.anime))].length} matches found:\n> ‧ ${[...new Set(fArray.sort((a, b) => b.anime.toLowerCase().startsWith(name) - a.anime.toLowerCase().startsWith(name)).map((e) => e.anime.toLowerCase().startsWith(name) ? e.anime : e.anime + " (alias: " + e.anialias.find((a) => a.toLowerCase().startsWith(name)) + ")"))].slice(0, 8).join('\n> ‧ ')}${[...new Set(fArray.map((e) => e.anime))].length > 8 ? `\n+ ${[...new Set(fArray.map((e) => e.anime))].length - 8} more` : ""}`);
    return fArray;
};

module.exports.userLevel = (xpr) => {
    let level = 0;
    for (let i = 1; xpr >= 0; i++) {
        xpr -= Math.floor(5 * Math.log(i) ** 4 + 30);
        level++;
    };
    return level;
};

function getClassLvl(cls, classLvl) {
    let clvl = 1, classxp = 0;
    if (cls in classLvl) classxp = classLvl[cls];
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
module.exports.getClassLvl = (cls, classLvl) => getClassLvl(cls, classLvl);

function classLevelToXP(clvl) {
    if (clvl < 1) return 0;
    let classxp = 0;
    while (--clvl) classxp += clvl * 50;
    return classxp;
};
module.exports.classLevelToXP = (clvl) => classLevelToXP(clvl);

function getItemLevel(xp) {
    let level = 1;
    while (xp >= 0) {
        xp -= Math.floor(20 * Math.pow(level, 1.290349));
        level++;
    };
    return level - 1;
};
module.exports.getItemLevel = (xp) => getItemLevel(xp);

module.exports.searchClass = (name, interaction, silent = false) => {
    name = name.toLowerCase();

    if (!isNaN(name)) {
        if (name < 0) return silent ? false : interaction.reply("The ID can't be negative.");
        if (name >= classes.length) return silent ? false : interaction.reply("The ID must be smaller than " + classes.length);
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

    if (fArray.length === 0) return silent ? false : interaction.reply("No match found");
    if (fArray.length > 1) return silent ? false : interaction.reply(fArray.length + " matches found");
    return fArray[0];
};

module.exports.searchItem = (name, interaction, silent = false, options = { returnSet: false }) => {
    const { items } = require("./items.js");
    name = name.toLowerCase();

    if (!isNaN(name)) {
        if (name < 0) return silent ? false : interaction.reply("The ID can't be negative.");
        if (name >= items.length) return silent ? false : interaction.reply("The ID must be smaller than " + items.length);
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

    if (fArray.length === 0) return silent ? false : interaction.reply("No match found");
    if (fArray.length > 1) {
        if (options.returnSet && fArray.length === 4 && fArray[0].setname === fArray[1].setname && fArray[0].setname === fArray[2].setname && fArray[0].setname === fArray[3].setname) return fArray[0];
        return silent ? false : interaction.reply(fArray.length + " matches found");
    };
    return fArray[0];
};

module.exports.searchGuild = (name, guilds) => {
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

const downloadImage = async (url) => {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        // eslint-disable-next-line no-undef
        return Buffer.from(response.data, 'binary');
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.log("Too many requests. Please try again later.");
            // you could throw the error again to handle it further up in your call stack, or just return null or a default value
            throw error;
        } else {
            throw error; // if it's an error other than 429, just throw it again so you can handle it outside of this function
        };
    };
};

module.exports.generateImage = async (base, effect, filename = `${Math.floor(Math.random() * 100000)}.png`) => {
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

module.exports.generateCaptcha = () => {
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
    for (let i = 0; i < (2 + (Math.random() < 0.3)); i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    };

    // Add 1-3 random dots
    for (let i = 0; i < (3 + (Math.random() < 0.3)); i++) {
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

module.exports.dateString = (date) => { return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }).replace(/\//g, '/'); }

const donationWeekStart = new Date('2024-02-12T00:00:00');
module.exports.donationWeekStart = donationWeekStart;
module.exports.addGuildDonation = async (user, guildid, amount, type = "coins") => {
    const week = Math.ceil((Date.now() - donationWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));

    const { 0: donation } = await query(`SELECT * FROM guild_donations WHERE userid = ${user.id} AND guildid = '${guildid}' AND week = ${week} AND type = '${type}'`);

    if (donation) {
        await query(`UPDATE guild_donations SET amount = amount + ${amount} WHERE userid = ${user.id} AND guildid = '${guildid}' AND week = ${week} AND type = '${type}'`);
    } else {
        await query(`INSERT INTO guild_donations (userid, guildid, week, type, amount) values ('${user.id}', '${guildid}', ${week}, '${type}', ${amount})`);
    };

    await query(`UPDATE guilds SET ${type === "coins" ? `treasury = treasury + ${amount}` : `treasury_gems = treasury_gems + ${amount}`} WHERE id = '${guildid}'`);
};

const customEmojis = {
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

    "coins": "<:coins:872926669055356939>",
};
module.exports.customEmojis = customEmojis;

const pullsToResetList = new Set();
module.exports.pullsToResetList = pullsToResetList;

const deleteReplyIn = 2400;
module.exports.deleteReplyIn = deleteReplyIn;

class idInfo {
    constructor(symbols) {
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

// module.exports.itemIDs = itemIDs;
module.exports.generateUniqueItemId = (userid, existing, len = 2) => {
    let gen = itemIDs.generate();
    while (existing.includes(gen + ":" + userid)) {
        gen = itemIDs.generate(Math.floor(len));
        len += 0.5;
    };
    return gen;
};

module.exports.generateUniqueGuildId = (existing, len = 5) => {
    let gen = itemIDs.generate(len);
    while (existing.includes(gen)) {
        gen = itemIDs.generate(Math.floor(len));
        len += 0.5;
    };
    return gen;
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