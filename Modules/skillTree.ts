import { ItemAbility } from "../types";
import buffInfo from "./buffs";
import { AbilityResponse } from "./components";
import delayedBuffs from "./delayedBuffs";
import { addHeal, customEmojis, dealDamage, numberToRoman } from "./functions";

type SkillPathCategory = "attack" | "defense" | "health" | "crit" | "mana" | "utility";

type SkillType = "common" | "extra" | "hidden" | "unique" | "ultimate";

class SkillPath {
    _name: string;
    _type: SkillType;
    _description: string;
    _cost: number;
    _maxLevel: number;
    _category: SkillPathCategory;
    _passive: (level: number) => ItemAbility;
    _id: number;

    constructor(name: string, type: SkillType, description: string, cost: number, maxLevel: number, category: SkillPathCategory, passive: (level: number) => ItemAbility, id: number) {
        this._name = name;
        this._type = type;
        this._description = description;
        this._cost = cost;
        this._maxLevel = maxLevel;
        this._category = category;
        this._passive = passive;
        this._id = id;
    }

    get name() {
        return this._name;
    };
    get type() {
        return this._type;
    };
    get description() {
        return this._description;
    };
    get cost() {
        return this._cost;
    };
    get maxLevel() {
        return this._maxLevel;
    };
    get category() {
        return this._category;
    };
    get passive() {
        return this._passive;
    };
    get id() {
        return this._id;
    };

    get emojiLabel(): string {
        switch (this._category) {
            case "attack":
                return customEmojis.atk;
            case "defense":
                return customEmojis.def;
            case "health":
                return customEmojis.hp;
            case "crit":
                return customEmojis.cr;
            case "mana":
                return customEmojis.mana;
            case "utility":
                return "🔧";
        };
    };

    uppercaseSkillType() {
        return this._type[0].toUpperCase() + this._type.slice(1) + " Skill";
    };
    fullName(level: number = 1, includeEmoji: boolean = false) {
        level ||= 1;
        return `${includeEmoji ? `${this.emojiLabel} ` : ""}${this._name} ${numberToRoman(level)} - \`${this.uppercaseSkillType()}\``;
    };
    desc(level: number = 1) {
        level ||= 1;
        return this._description.replace(/\+(\d*\.?\d+)/g, (match, numStr) => `+${Math.round(parseFloat(numStr) * level * 100) / 100}`);
    };
};

export const skillTree: SkillPath[] = [
    //* Common Skills
    // Attack
    new SkillPath("Blade Mastery", "common", "Increases ATK by **+3%**.", 2, 10, "attack", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const buff = Math.floor(myStatsFixed.atk * 0.03 * level);
        myStatsFixed.atk += buff;
        myStats.atk += buff;

        return AbilityResponse.SUCCESS;
    }, 0),
    new SkillPath("Arcane Mastery", "common", "Increases MD by **+3%**.", 2, 10, "attack", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const buff = Math.floor(myStatsFixed.md * 0.03 * level);
        myStatsFixed.md += buff;
        myStats.md += buff;

        return AbilityResponse.SUCCESS;
    }, 1),
    new SkillPath("Twin Fang", "common", "Attacks have a **+1%** chance to strike twice.", 2, 10, "attack", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const triggerChance = 0.01 * level;

        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats && Math.random() < triggerChance) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1, magicDamage: true });
            };
        });

        return AbilityResponse.SUCCESS;
    }, 2),
    new SkillPath("Quick Draw", "common", "First attack in battle deals an additional **+8%** damage.", 1, 10, "attack", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const extraDamage = 0.08 * level;

        matchStats.on("attack", {
            maxUsage: 1,
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats && trigger.used < trigger.maxUsage) {
                    trigger.used++;
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { overwriteDamage: Math.floor(options.damage * extraDamage), magicDamage: true, canCrit: false });
                };
            },
        });

        return AbilityResponse.SUCCESS;
    }, 3),

    // Defense
    new SkillPath("Iron Will", "common", "Increases DEF by **+20** (bypasses DEF cap).", 2, 10, "defense", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const buff = 20 * level;
        myStatsFixed.def += buff;
        myStats.def += buff;
        myStatsFixed.increase_defcap += buff;
        myStats.increase_defcap += buff;

        return AbilityResponse.SUCCESS;
    }, 4),
    new SkillPath("Magic Aegis", "common", "Increases MR by **+20** (bypasses MR cap).", 2, 10, "defense", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const buff = 20 * level;
        myStatsFixed.mr += buff;
        myStats.mr += buff;
        myStatsFixed.increase_mrcap += buff;
        myStats.increase_mrcap += buff;

        return AbilityResponse.SUCCESS;
    }, 5),

    // Health
    new SkillPath("Vital Surge", "common", "Increases max HP by **+4%**.", 2, 10, "health", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const buff = Math.floor(myStatsFixed.maxhp * 0.04 * level);
        myStatsFixed.maxhp += buff;
        myStatsFixed.hp += buff;
        myStats.maxhp += buff;
        myStats.hp += buff;

        return AbilityResponse.SUCCESS;
    }, 6),
    new SkillPath("Rejuvenation", "common", "Heals **+0.5%** of max HP per round.", 2, 10, "health", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const heal = Math.floor(myStats.maxhp * 0.005 * level);
        mybuff.hp.push(new buffInfo("+", heal, 9999));

        return AbilityResponse.SUCCESS;
    }, 7),
    new SkillPath("Second Wind", "common", "Restores **+5%** of max HP after falling below **30%** HP for the first time.", 1, 10, "health", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const heal = Math.floor(myStats.maxhp * 0.05 * level);
        const threshold = 0.3;

        if (myStats.hp / myStats.maxhp < threshold) {
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, heal, {});
        } else {
            myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp / myStats.maxhp < threshold) {
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, heal, {});
                    //@ts-ignore
                    this._used++;
                };

                return AbilityResponse.SUCCESS;
            }, 9999, 1));
        };

        return AbilityResponse.SUCCESS;
    }, 8),
    new SkillPath("Bloodlust", "common", "Drains **+0.4%** of the player's max HP every **3** rounds.", 2, 10, "health", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const drainPercent = 0.004 * level;

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 3 === 0) {
                const drain = Math.floor(myStats.maxhp * drainPercent);
                eStats.hp -= drain;
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, drain, {});
                if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
                if (eStats.hp < 0) eStats.hp = 0;
            };

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, 9),

    // Crit
    new SkillPath("Deadeye", "common", "Increases crit rate by **+1.5%**.", 2, 10, "crit", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const buff = 0.015 * level;
        myStatsFixed.cr += buff;
        myStats.cr += buff;
        if (myStatsFixed.cr > 1) myStatsFixed.cr = 1;
        if (myStats.cr > 1) myStats.cr = 1;

        return AbilityResponse.SUCCESS;
    }, 10),
    new SkillPath("Piercing Blows", "common", "Increases crit damage by **+3%**.", 2, 10, "crit", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const buff = 0.03 * level;
        myStatsFixed.cd += buff;
        myStats.cd += buff;

        return AbilityResponse.SUCCESS;
    }, 11),

    // Mana
    new SkillPath("Mana Reservoir", "common", "Increases starting mana by **+1**.", 2, 10, "mana", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const buff = 1 * level;
        myStatsFixed.sm += buff;
        myStats.sm += buff;

        return AbilityResponse.SUCCESS;
    }, 12),
    new SkillPath("Sorcerer's Will", "common", "Increases mana generation by **+1**.", 2, 5, "mana", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const buff = 1 * level;
        myStatsFixed.mg += buff;
        myStats.mg += buff;

        return AbilityResponse.SUCCESS;
    }, 13),
    new SkillPath("Mana Flow", "common", "Increases Mana cap by **+5**.", 2, 10, "mana", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const buff = 5 * level;
        myStatsFixed.mana += buff;
        myStats.mana += buff;

        return AbilityResponse.SUCCESS;
    }, 14),

    // Utility
    new SkillPath("Treasure Hunter", "common", "Increases coin drops by **+7.5%** (works in the `/dungeon`).", 2, 10, "utility", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.lootm += 0.075 * level;

        return AbilityResponse.SUCCESS;
    }, 15),
    new SkillPath("Born to Grind", "common", "Increases class xp by **+10%** (works in the `/dungeon`).", 2, 10, "utility", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.xpboost += 0.1 * level;

        return AbilityResponse.SUCCESS;
    }, 16),
    // // ];

    // // export const extraSkillTree: SkillPath[] = [
    //* Extra Skills
    // Attack
    new SkillPath("Precision Strike", "extra", "Attacks ignore **+1%** of enemy DEF and MR.", 3, 5, "attack", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const ignorePercent = 0.01 * level;
        myStats.ignoreDefPercent = (myStats.ignoreDefPercent || 0) + ignorePercent;
        myStats.ignoreMrPercent = (myStats.ignoreMrPercent || 0) + ignorePercent;
        return AbilityResponse.SUCCESS;
    }, 17),
    new SkillPath("Chain Reaction", "extra", "Attacks have a **+5%** chance to deal bonus **30%** damage.", 3, 5, "attack", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const triggerChance = 0.05 * level;
        const bonusDamagePercent = 0.30;

        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats && options.damage > 0 && Math.random() < triggerChance) {
                const bonusDamage = Math.floor(options.damage * bonusDamagePercent);
                if (bonusDamage > 0) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `💥 **${myStats.name}'s** Chain Reaction`, { overwriteDamage: bonusDamage, magicDamage: true, canCrit: false });
                };
            };
        });
        return AbilityResponse.SUCCESS;
    }, 18),
    new SkillPath("Executioner", "extra", "Gain **+10%** ATK & MD against enemies that fall below **30%** HP.", 3, 5, "attack", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const healthThreshold = 0.3;
        const bonusDamagePercent = 0.10 * level;

        myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if ((eStats.hp / eStats.maxhp) < healthThreshold) {
                mybuff.atk.push(new buffInfo("*", 1 + bonusDamagePercent, 9999));
                mybuff.md.push(new buffInfo("*", 1 + bonusDamagePercent, 9999));

                //@ts-ignore
                this._used++;
            };

            return AbilityResponse.SUCCESS;
        }, 9999, 1));

        return AbilityResponse.SUCCESS;
    }, 19),

    // Defense
    new SkillPath("Thorned Armor", "extra", "Reflects **+2%** of damage taken back to the attacker.", 3, 5, "defense", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const reflectPercent = 0.02 * level;
        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (target === myStats && caster !== target && options.damage > 0) {
                const reflectedDamage = Math.floor(options.damage * reflectPercent);
                if (reflectedDamage > 0) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🛡️ **${myStats.name}**`, { overwriteDamage: reflectedDamage, magicDamage: true, canCrit: false, preventRetaliation: true });
                };
            };
        });
        return AbilityResponse.SUCCESS;
    }, 20),
    new SkillPath("Adaptive Plating", "extra", "Taking Physical damage grants **+30** DEF for 2 rounds. Taking Magical damage grants **+30** MR for 2 rounds.", 3, 5, "defense", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const bonusStat = 30 * level;

        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (target === myStats && options.damage > 0) {
                if (options.magicDamage) { // Took Magic Damage -> Grant MR
                    mybuff.mr.push(new buffInfo("+", bonusStat, 2));
                } else { // Took Physical Damage -> Grant DEF
                    mybuff.def.push(new buffInfo("+", bonusStat, 2));
                };
            };
        });
        return AbilityResponse.SUCCESS;
    }, 21),
    new SkillPath("Last Stand", "extra", "Once per battle, dropping below **25%** HP grants **+20%** DEF and MR for 2 rounds.", 4, 5, "defense", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const threshold = 0.25;
        const bonusPercent = 1 + (0.20 * level); // Use 20% per level for balance, max 100%
        const duration = 2;

        myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if ((myStats.hp / myStats.maxhp) < threshold) {
                notice.push(`🛡️ **${myStats.name}** makes a Last Stand!`);

                const defBuff = new buffInfo("*", bonusPercent, duration);
                defBuff.label = "Extra Skill: Last Stand";
                const mrBuff = new buffInfo("*", bonusPercent, duration);
                mrBuff.label = "Extra Skill: Last Stand";

                mybuff.def.push(defBuff);
                mybuff.mr.push(mrBuff);
                //@ts-ignore - accessing private _used property
                this._used++;
            };
            return AbilityResponse.SUCCESS;
        }, 9999, 1)); // Check every round, max 1 use

        return AbilityResponse.SUCCESS;
    }, 22),

    // Health
    new SkillPath("Vampiric Touch", "extra", "Drains **+0.8%** of the player's max HP every **3** rounds.", 3, 5, "health", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const drainPercent = 0.008 * level;

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 3 === 0) {
                const drain = Math.floor(myStats.maxhp * drainPercent);
                eStats.hp -= drain;
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, drain, {});
                if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
                if (eStats.hp < 0) eStats.hp = 0;
            };

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, 23),
    new SkillPath("Second Heart", "extra", "After dropping below **30%** HP for the first time, gain **+1%** max HP regeneration per round.", 3, 5, "health", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const threshold = 0.30;
        const regenPercent = 0.01 * level;

        // Use a delayed buff to check the condition each round until it triggers once
        myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if ((myStats.hp / myStats.maxhp) < threshold) {
                const regenAmount = Math.floor(myStats.maxhp * regenPercent);
                if (regenAmount > 0) {
                    notice.push(`💖 **${myStats.name}'s** Second Heart kicks in!`);
                    mybuff.hp.push(new buffInfo("+", regenAmount, 9999));
                };
                //@ts-ignore - accessing private _used property
                this._used++;
            };
            return AbilityResponse.SUCCESS;
        }, 9999, 1)); // Check every round, max 1 use

        return AbilityResponse.SUCCESS;
    }, 24),

    // Crit
    new SkillPath("Savage Strikes", "extra", "Critical hits have a **+5%** chance to inflict Bleed for 3 rounds (deals **5%** damage per round).", 3, 5, "crit", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const bleedChance = 0.05 * level;
        matchStats.on("crit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats && Math.random() < bleedChance) {
                const damage = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🩸 **${myStats.name}**`, { atkMultiplier: 0.05, isTest: true, magicDamage: true, canCrit: false });
                if (damage > 0) ebuff.hp.push(new buffInfo("+", -Math.floor(damage), 3));
            };
        });
        return AbilityResponse.SUCCESS;
    }, 25),
    new SkillPath("Critical Flow", "extra", "Scoring a critical hit grants **+1** mana.", 3, 3, "crit", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const manaGain = 1 * level;

        matchStats.on("crit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                const currentMana = myStats.sm;
                const maxMana = myStats.mana;
                const manaToAdd = Math.min(manaGain, maxMana - currentMana);

                if (manaToAdd > 0) myStats.sm += manaToAdd;
            };
        });
        return AbilityResponse.SUCCESS;
    }, 26),
    new SkillPath("Shattering Blows", "extra", "Critical hits reduce enemy DEF and MR by **+2%** for 3 rounds (stacks).", 3, 5, "crit", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const reductionPercent = 1 - (0.02 * level);

        matchStats.on("crit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) {
                ebuff.def.push(new buffInfo("*", reductionPercent, 3));
                ebuff.mr.push(new buffInfo("*", reductionPercent, 3));
            };
        });
        return AbilityResponse.SUCCESS;
    }, 27),

    // Mana
    new SkillPath("Arcane Battery", "extra", "When hit, **+20%** chance to gain **1** mana.", 3, 5, "mana", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const triggerChance = 0.20 * level;
        const manaGain = 1;

        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (target === myStats && caster === eStats && options.damage > 0 && Math.random() < triggerChance) {
                const currentMana = myStats.sm;
                const maxMana = myStats.mana;
                const manaToAdd = Math.min(manaGain, maxMana - currentMana);

                if (manaToAdd > 0) myStats.sm += manaToAdd;
            };
        });
        return AbilityResponse.SUCCESS;
    }, 28),

    // Utility
    new SkillPath("Adventurer's Spirit", "extra", "Increases coin drops by **+10%** and class xp by **+10%** (works in the `/dungeon`).", 3, 5, "utility", (level) => async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const bonusPercent = 0.1 * level;
        matchStats.lootm += bonusPercent;
        matchStats.xpboost += bonusPercent;

        return AbilityResponse.SUCCESS;
    }, 29),

];
