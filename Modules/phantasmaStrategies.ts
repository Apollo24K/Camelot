import { ItemAbility } from "../types";
import { AbilityResponse } from "./components";
import buffInfo from "./buffs";
import delayedBuffs from "./delayedBuffs";
import { dealDamage, addHeal, noTimeout, procburn } from "./functions";

export class PhantasmaStrategy {
    private _id: number;
    private _name: string;
    private _psvdescription: string;
    private _actdescription: string;
    private _emoji: string;
    private _buff: ItemAbility;

    constructor(id: number, name: string, psvdescription: string, actdescription: string, emoji: string, buff: ItemAbility) {
        this._id = id;
        this._name = name;
        this._psvdescription = psvdescription;
        this._actdescription = actdescription;
        this._emoji = emoji;
        this._buff = buff;
    };

    get id() { return this._id; };
    get name() { return this._name; };
    get psvdescription() { return this._psvdescription; };
    get actdescription() { return this._actdescription; };
    get emoji() { return this._emoji; };
    get buff() { return this._buff; };
};

function checkEnergy(myStats: any, matchStats: any, notice: string[], cost: number, charName: string): boolean {
    if (myStats.energy < cost) {
        if (!myStats.skipFail) {
            noTimeout(matchStats, myStats);
            myStats.skipFail = true;
            matchStats.sendWarning({ content: `You don't have enough energy! (${myStats.energy}/${cost} <a:energy:1511169619086409829>)\n-# Clicking again this round will instead let you flee the battle.`, ephemeral: true });
        } else {
            myStats.forceLoose = true;
            notice.push(`\n<a:exit:1511883591532019804> ${charName} fled the fight`);
        };
        return false;
    };
    return true;
};

export const phantasmaStrategies: PhantasmaStrategy[] = [
    new PhantasmaStrategy(1, "Unending Prose", "Increases max HP by **30%**. Takes **15%** less damage (damage mitigation effect). Restores **25** energy (<a:energy:1511169619086409829>) every round.", "At 100+ <a:energy:1511169619086409829>, recovers **25%** max HP, and has a **50%** chance for this action to be timeout false. At 200 <a:energy:1511169619086409829> (max) however, recovers to full health, and the action is guaranteed to be timeout false", "<:HP:1062043800979116143>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.maxhp += Math.floor(myStats.maxhp * 0.3);
        myStats.damageReduction ??= 0;
        myStats.damageReduction += 0.15;
        myStats.energy ??= 0;
        myStats.energy += 25;
        myStats.skipFail = false;

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.skipFail = false;
            myStats.energy = Math.min(myStats.energy + 25, 200);

            return AbilityResponse.SUCCESS;
        }, 9999));

        // Ultimate
        myStats.replaceButton.skip = {
            "emoji": "<a:strategy:1510907688169504788>",
            "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const cost = 100;
                const maxcost = 200;
                if (!checkEnergy(myStats, matchStats, notice, cost, char.name)) return AbilityResponse.FAILURE;

                if (myStats.energy >= maxcost) {
                    noTimeout(matchStats, myStats);
                    myStats.energy -= maxcost;
                    notice.push(`\n<a:energy:1511169619086409829> ♁ ₊ ☁️ ｡˚ ₊ ENERGY OVERLOAD!! ₊ ˚｡ ☁️ ₊ ♁ <a:energy:1511169619086409829>`);
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, `<a:strategy:1510907688169504788> __Unending Prose__:`, Math.floor(myStats.maxhp), {});

                } else {
                    if (Math.random() < 0.5) noTimeout(matchStats, myStats);
                    myStats.energy -= cost;
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, `<a:strategy:1510907688169504788> __Unending Prose__:`, Math.floor(myStats.maxhp * 0.25), {});
                };

                return AbilityResponse.SUCCESS;
            },
        };

        return AbilityResponse.SUCCESS;
    }),
    new PhantasmaStrategy(2, "Inked in Blood", "Increases ATK by **30%**. Always deals physical damage. Has **+15%** critical rate. Restores **25** energy (<a:energy:1511169619086409829>) every round.", "At **100+** <a:energy:1511169619086409829>, increases ATK by **15%** for **2** rounds, and has a **50%** chance for this action to be timeout false. At **200** <a:energy:1511169619086409829> however, increases ATK by **20%** for **6** rounds, and the action is guaranteed to be timeout false", "<:ATK:1063214925528440832>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk += Math.floor(myStats.atk * 0.3);
        myStats.mdChance = -1;
        myStats.cr += 0.15;
        if (myStats.cr > 1) myStats.cr = 1;
        mybuff.cr.push(new buffInfo("+", 0.15, 9999));
        mybuff.atk.push(new buffInfo("*", 1.3, 9999));

        myStats.energy ??= 0;
        myStats.energy += 25;
        myStats.skipFail = false;

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.skipFail = false;
            myStats.energy = Math.min(myStats.energy + 25, 200);

            return AbilityResponse.SUCCESS;
        }, 9999));

        notice.push(`\n<a:strategy:1510907688169504788> __Inked in Blood__: Physical builds are strengthened...`);

        // Ultimate
        myStats.replaceButton.skip = {
            "emoji": "<a:strategy:1510907688169504788>",
            "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const cost = 100;
                const maxcost = 200;
                if (!checkEnergy(myStats, matchStats, notice, cost, char.name)) return AbilityResponse.FAILURE;

                if (myStats.energy >= maxcost) {
                    noTimeout(matchStats, myStats);
                    myStats.energy -= maxcost;
                    notice.push(`\n<a:energy:1511169619086409829> ♁ ₊ ☁️ ｡˚ ₊ ENERGY OVERLOAD!! ₊ ˚｡ ☁️ ₊ ♁ <a:energy:1511169619086409829>`);
                    myStats.atk += Math.floor(myStats.atk * 0.2);
                    mybuff.atk.push(new buffInfo("*", 1.2, 6));
                    notice.push(`\n<a:strategy:1510907688169504788> __Inked in Blood__: Increased ATK by **20%** for **6** rounds`);

                } else {
                    if (Math.random() < 0.5) noTimeout(matchStats, myStats);
                    myStats.energy -= cost;
                    myStats.atk += Math.floor(myStats.atk * 0.15);
                    mybuff.atk.push(new buffInfo("*", 1.15, 2));
                    notice.push(`\n<a:strategy:1510907688169504788> __Inked in Blood__: Increased ATK by **15%** for **2** rounds`);
                };

                return AbilityResponse.SUCCESS;
            },
        };

        return AbilityResponse.SUCCESS;
    }),
    new PhantasmaStrategy(3, "Starlight's Tragedy", "Increase MD by **30%**. Always deals magical damage. Has **+15%** critical rate. Restores **25** energy (<a:energy:1511169619086409829>) every round.", "At **100+** <a:energy:1511169619086409829>, increases MD by **15%** for **2** rounds, and has a **50%** chance for this action to be timeout false. At **200** <a:energy:1511169619086409829> however, increases MD by **20%** for **6** rounds, and the action is guaranteed to be timeout false", "<:magic_dmg:948568336621527040>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.md += Math.floor(myStats.md * 0.3);
        myStats.mdChance = 1;
        myStats.cr += 0.15;
        if (myStats.cr > 1) myStats.cr = 1;
        mybuff.cr.push(new buffInfo("+", 0.15, 9999));
        mybuff.md.push(new buffInfo("*", 1.3, 9999));
        notice.push(`\n<a:strategy:1510907688169504788> __Starlight's Tragedy__: Magical builds are strengthened...`);

        myStats.energy ??= 0;
        myStats.energy += 25;
        myStats.skipFail = false;

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.skipFail = false;
            myStats.energy = Math.min(myStats.energy + 25, 200);

            return AbilityResponse.SUCCESS;
        }, 9999));

        // Ultimate
        myStats.replaceButton.skip = {
            "emoji": "<a:strategy:1510907688169504788>",
            "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const cost = 100;
                const maxcost = 200;
                if (!checkEnergy(myStats, matchStats, notice, cost, char.name)) return AbilityResponse.FAILURE;

                if (myStats.energy >= maxcost) {
                    noTimeout(matchStats, myStats);
                    myStats.energy -= maxcost;
                    notice.push(`\n<a:energy:1511169619086409829> ♁ ₊ ☁️ ｡˚ ₊ ENERGY OVERLOAD!! ₊ ˚｡ ☁️ ₊ ♁ <a:energy:1511169619086409829>`);
                    myStats.md += Math.floor(myStats.md * 0.2);
                    mybuff.md.push(new buffInfo("*", 1.2, 6));
                    notice.push(`\n<a:strategy:1510907688169504788> __Starlight's Tragedy__: Increased MD by **20%** for **6** rounds`);

                } else {
                    if (Math.random() < 0.5) noTimeout(matchStats, myStats);
                    myStats.energy -= cost;
                    myStats.md += Math.floor(myStats.md * 0.15);
                    mybuff.md.push(new buffInfo("*", 1.15, 2));
                    notice.push(`\n<a:strategy:1510907688169504788> __Starlight's Tragedy__: Increased MD by **15%** for **2** rounds`);
                };

                return AbilityResponse.SUCCESS;
            },
        };

        return AbilityResponse.SUCCESS;
    }),
    new PhantasmaStrategy(4, "Chiaroscuro Break", "Critical hits deal **50%** more damage, but non-critical hits deal no damage. When your critical chance is below **50%**, this effect is reversed. Restores **8** energy (<a:energy:1511169619086409829>) every critical / non-critical hit, depending if critical rate is above/equal to, or below **50%**.", "At **200** <a:energy:1511169619086409829>, increases critical damage by **30%**, then loses **30%** critical rate. This can be used up to **5** times. (Timeout false)", "<:crit_rate:1047269144195776512>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.critExtreme = true;
        notice.push(`\n<a:strategy:1510907688169504788> __Chiaroscuro Break__: The difference between the enemy's weak points seem to be manipulated in extreme degrees...`);

        myStats.energy ??= 0;
        myStats.skipFail = false;
        myStats.maxUlt = 5;

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.skipFail = false;

            return AbilityResponse.SUCCESS;
        }, 9999));

        matchStats.on("crit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (caster === myStats && caster.cr >= 0.5) {
                myStats.energy = Math.min(myStats.energy + 8, 200);
            };
        });

        matchStats.on("noncrit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (caster === myStats && caster.cr < 0.5) {
                myStats.energy = Math.min(myStats.energy + 8, 200);
            };
        });

        // Ultimate
        myStats.replaceButton.skip = {
            "emoji": "<a:strategy:1510907688169504788>",
            "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const cost = 200;
                if (!checkEnergy(myStats, matchStats, notice, cost, char.name)) return AbilityResponse.FAILURE;

                if (myStats.maxUlt > 0) {
                    myStats.maxUlt--;
                    noTimeout(matchStats, myStats);
                    myStats.energy -= cost;
                    myStats.cd += 0.3;
                    myStats.cr -= 0.3;
                    if (myStats.cr < 0) myStats.cr = 0;
                    mybuff.cd.push(new buffInfo("+", 0.3, 9999));
                    mybuff.cr.push(new buffInfo("+", -0.3, 9999));
                    notice.push(`\n<a:strategy:1510907688169504788> __Chiaroscuro Break__: Increased critical damage by **30%** and sacrificied **30%** critical rate.`);
                } else {
                    notice.push(`\n<a:strategy:1510907688169504788> Ultimate can only be used up to 5 times`);
                };
                return AbilityResponse.SUCCESS;
            },
        };

        return AbilityResponse.SUCCESS;
    }),
    new PhantasmaStrategy(5, "Slaughterhouse Symmetrics", "Counters deal **75%** more damage. Counters a hit every round. Every counter grants **20** energy (<a:energy:1511169619086409829>) (Max: 800).", "At 100 <a:energy:1511169619086409829>, counters the next **2** hits. At 200 <a:energy:1511169619086409829> however, counters the next **3** hits. Follows up next counter with [Annihilation], dealing **200%** absolute damage. If the enemy has more than **50%** HP, this hit deals doubled damage, else it has **40%** lifesteal. (Timeout false)", "<:counter:1340459549374546032>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.counterBonus ??= 0;
        myStats.counterBonus += 0.75;
        myStats.counter ??= 0;
        myStats.counter++;

        myStats.energy ??= 0;
        myStats.skipFail = false;

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.skipFail = false;
            myStats.counter++;

            return AbilityResponse.SUCCESS;
        }, 9999));

        matchStats.on("counter", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (target === myStats) {
                myStats.energy = Math.min(myStats.energy + 20, 800);
                if (myStats.annihilationReady) {
                    myStats.annihilationReady = false;
                    let dmg = Math.floor(myStats.atk * 2);
                    if (caster.hp / caster.maxhp > 0.5) {
                        dmg *= 2;
                        dealDamage(caster, myStats, casterBuff, mybuff, matchStats, notice, `<a:strategy:1510907688169504788> [Annihilation]`, { overwriteDamage: dmg, defMultiplier: 0, dodge: false, block: false, canCounter: false });
                    } else {
                        dealDamage(caster, myStats, casterBuff, mybuff, matchStats, notice, `<a:strategy:1510907688169504788> [Annihilation]`, { overwriteDamage: dmg, defMultiplier: 0, dodge: false, block: false, canCounter: false, selfhealAmount: 0.4 });
                    };
                };
            };
        });

        // Ultimate
        myStats.replaceButton.skip = {
            "emoji": "<a:strategy:1510907688169504788>",
            "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const cost = 100;
                const maxcost = 200;
                if (!checkEnergy(myStats, matchStats, notice, cost, char.name)) return AbilityResponse.FAILURE;

                if (myStats.energy >= maxcost) {
                    noTimeout(matchStats, myStats);
                    myStats.energy -= maxcost;
                    myStats.counter += 3;
                    myStats.annihilationReady = true;
                    notice.push(`\n<a:energy:1511169619086409829> ♁ ₊ ☁️ ｡˚ ₊ ENERGY OVERLOAD!! ₊ ˚｡ ☁️ ₊ ♁ <a:energy:1511169619086409829>`);
                    notice.push(`\n<a:strategy:1510907688169504788> __Slaughterhouse Symmetrics__: Ready to counter the next **3** hits, with [Annihilation] on standby...`);

                } else {
                    if (Math.random() < 0.5) noTimeout(matchStats, myStats);
                    myStats.energy -= cost;
                    myStats.counter += 2;
                    notice.push(`\n<a:strategy:1510907688169504788> __Slaughterhouse Symmetrics__: Ready to counter the next **2** hits.`);
                };

                return AbilityResponse.SUCCESS;
            },
        };

        notice.push(`\n<a:strategy:1510907688169504788> __Slaughterhouse Symmetrics__: Weapon in hand. Counter, parry, retaliate... until the end.`);

        return AbilityResponse.SUCCESS;
    }),
    new PhantasmaStrategy(6, "Mirage Waltz", "After every **3** dodges, increases vulnerability on the enemy by **1%** permanently (Max: take 75% more damage). Has **+15%** dodge rate. Every dodge grants **10** energy (<a:energy:1511169619086409829>).", "At 100 <a:energy:1511169619086409829>, boosts dodge rate by **10%** for **4** rounds (Timeout false). At 200 <a:energy:1511169619086409829> howwever, removes a dodge debuff on self, then increases dodge rate by **10%** for **4** rounds. After **5** uses, dodging also grants self the [Overview] status, having minimum **50%** dodge rate next round, and raises critical rate to **100%** for that round.", "<:dodge_chance:1047269150948606063>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodge += 0.15;
        if (myStats.dodge > 1) myStats.dodge = 1;
        mybuff.dodge.push(new buffInfo("+", 0.15, 9999));
        eStats.vulnerabilityDynamic ??= 1;
        myStats.mirageDodged = 0;

        myStats.energy ??= 0;
        myStats.skipFail = false;
        myStats.mirageUltCount = 0;
        myStats.overviewActive = false;

        matchStats.on("dodge", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (target === myStats) {
                myStats.mirageDodged++;
                myStats.energy = Math.min(myStats.energy + 10, 200);
                if (myStats.mirageDodged % 3 === 0) {
                    eStats.vulnerabilityDynamic += 0.01;
                    if (eStats.vulnerabilityDynamic > 1.75) eStats.vulnerabilityDynamic = 1.75;
                    notice.push(`\n<a:strategy:1510907688169504788> __Mirage Waltz__: Increased vulnerability on ${enemy.name} by **1%** (Current: ${Math.round(eStats.vulnerabilityDynamic * 100) - 100}%)`);
                };
                if (myStats.mirageUltCount >= 5) {
                    myStats.overviewActive = true;
                    notice.push(`\n<a:strategy:1510907688169504788> __Mirage Waltz__: [Overview] activated — minimum **50%** dodge & **100%** crit rate next round!`);
                };
            };
        });

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.skipFail = false;
            if (myStats.overviewActive) {
                myStats.cr = 1;
                myStats.dodge = Math.max(0.5, myStats.dodge);
                myStats.overviewActive = false;
            };

            return AbilityResponse.SUCCESS;
        }, 9999));

        // Ultimate
        myStats.replaceButton.skip = {
            "emoji": "<a:strategy:1510907688169504788>",
            "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const cost = 100;
                const maxcost = 200;
                if (!checkEnergy(myStats, matchStats, notice, cost, char.name)) return AbilityResponse.FAILURE;

                if (myStats.energy >= maxcost) {
                    noTimeout(matchStats, myStats);
                    myStats.energy -= maxcost;
                    myStats.mirageUltCount++;
                    mybuff.dodge = mybuff.dodge.filter(b => !b.isDebuff);
                    myStats.dodge += 0.1;
                    if (myStats.dodge > 1) myStats.dodge = 1;
                    mybuff.dodge.push(new buffInfo("+", 0.1, 4));
                    notice.push(`\n<a:energy:1511169619086409829> ♁ ₊ ☁️ ｡˚ ₊ ENERGY OVERLOAD!! ₊ ˚｡ ☁️ ₊ ♁ <a:energy:1511169619086409829>`);
                    notice.push(`\n<a:strategy:1510907688169504788> __Mirage Waltz__: Dodge debuffs cleared! Increased dodge rate by **10%** for **4** rounds.`);

                } else {
                    if (Math.random() < 0.5) noTimeout(matchStats, myStats);
                    myStats.energy -= cost;
                    myStats.dodge += 0.1;
                    if (myStats.dodge > 1) myStats.dodge = 1;
                    mybuff.dodge.push(new buffInfo("+", 0.1, 4));
                    notice.push(`\n<a:strategy:1510907688169504788> __Mirage Waltz__: Increased dodge rate by **10%** for **4** rounds.`);
                };

                return AbilityResponse.SUCCESS;
            },
        };

        notice.push(`\n<a:strategy:1510907688169504788> __Mirage Waltz__: Dodges seem to particularly frustrate the enemy...`);

        return AbilityResponse.SUCCESS;
    }),
    new PhantasmaStrategy(7, "Form in Tessellation", "Has **+15%** block rate. A successful block heals you for **10%** max HP, and deals absolute damage equal to your current HP multiplied by your block rate. This cannot crit. Every block grants **20** energy (<a:energy:1511169619086409829>).", "100 <a:energy:1511169619086409829>: boosts block rate by **10%** for **4** rounds (Timeout false). 200 <a:energy:1511169619086409829>: takes **no damage** and has **no block rate** this round. All incoming attacks trigger **a successful block** effect that scales off **100%** block rate. At the start of the next round, unleashes the mitigated damage as undodgeable damage.", "<:block_rate:1217949026281066599>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.br += 0.15;
        if (myStats.br > 1) myStats.br = 1;
        mybuff.br.push(new buffInfo("+", 0.15, 9999));

        myStats.energy ??= 0;
        myStats.skipFail = false;

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.skipFail = false;

            return AbilityResponse.SUCCESS;
        }, 9999));

        matchStats.on("block", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (target === myStats) {
                myStats.energy = Math.min(myStats.energy + 20, 200);
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.1), {});
                let dmg = Math.floor(myStats.hp * (myStats.putDamageOnHold === 1 ? 1 : myStats.br));
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<a:strategy:1510907688169504788> __Form in Tessellation__`, { overwriteDamage: dmg, defMultiplier: 0, dodge: false, block: false, canCounter: false, ignoreShield: true });
            };
        });

        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (caster === eStats && target === myStats && myStats.putDamageOnHold === 1) {
                matchStats.trigger("block", caster, target, casterBuff, targetBuff, { turn: matchStats.turn });
            };
        });

        // Ultimate
        myStats.replaceButton.skip = {
            "emoji": "<a:strategy:1510907688169504788>",
            "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const cost = 100;
                const maxcost = 200;
                if (!checkEnergy(myStats, matchStats, notice, cost, char.name)) return AbilityResponse.FAILURE;

                if (myStats.energy >= maxcost) {
                    noTimeout(matchStats, myStats);
                    myStats.energy -= maxcost;
                    myStats.br = 0;
                    myStats.putDamageOnHold = 1;
                    matchStats._formBlockActive = false;
                    notice.push(`\n<a:energy:1511169619086409829> ♁ ₊ ☁️ ｡˚ ₊ ENERGY OVERLOAD!! ₊ ˚｡ ☁️ ₊ ♁ <a:energy:1511169619086409829>`);
                    notice.push(`\n<a:strategy:1510907688169504788> __Form in Tessellation__: Damage held. All attacks trigger block effects this round.`);

                    myStats.delayedBuffs.push(new delayedBuffs(1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        if (myStats.putDamageOnHold === 1 && myStats.damageOnHold > 0) {
                            let unleashed = Math.floor(myStats.damageOnHold);
                            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<a:strategy:1510907688169504788> __Form in Tessellation__: Unleashing held damage!`, { overwriteDamage: unleashed, defMultiplier: 0, dodge: false, block: false, canCounter: false });
                        };
                        myStats.putDamageOnHold = 0;
                        myStats.damageOnHold = 0;
                        matchStats._formBlockActive = false;

                        return AbilityResponse.SUCCESS;
                    }, 0));

                } else {
                    if (Math.random() < 0.5) noTimeout(matchStats, myStats);
                    myStats.energy -= cost;
                    myStats.br += 0.1;
                    if (myStats.br > 1) myStats.br = 1;
                    mybuff.br.push(new buffInfo("+", 0.1, 4));
                    notice.push(`\n<a:strategy:1510907688169504788> __Form in Tessellation__: Increased block rate by **10%** for **4** rounds.`);
                };

                return AbilityResponse.SUCCESS;
            },
        };

        notice.push(`\n<a:strategy:1510907688169504788> __Form in Tessellation__: You steady your posture in absolute defiance against the calamity...`);

        return AbilityResponse.SUCCESS;
    }),
    new PhantasmaStrategy(8, "Scudo Fresco", "Starts the battle with a **50%** max HP shield. Every phase renewal retriggers this effect (stackable). The shield scaling is increased by **3%** for every phase defeated. (Max: +150%). When hit with a shield, gains **20** energy (no <a:energy:1511169619086409829> cap).", "At 100 <a:energy:1511169619086409829>, creates a shield of **15%** max HP. At 200 <a:energy:1511169619086409829> however, creates a shield of **25%** max HP, then unsheathes, dealing absolute damage equal to shield (Max: **500%** of max HP), before halving owned shield. (Timeout false)", "<:shield:1062050038211166310>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.shield += Math.floor(myStats.maxhp * 0.5);

        myStats.energy ??= 0;
        myStats.skipFail = false;

        matchStats.on("attack", ({ trigger, caster, target, matchStats, options }: any) => {
            if (target === myStats && caster === eStats && myStats.shield > 0) {
                myStats.energy += 20;
            };
        });

        matchStats.on("shieldBreak", ({ trigger, caster, target, matchStats, options }: any) => {
            if (target === myStats && caster === eStats) {
                myStats.energy += 20;
            };
        });

        matchStats.on("phaseChange", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (caster === eStats) {
                let shGain = Math.floor(myStats.maxhp * (0.5 + 0.03 * Math.min(eStats.phase - 1, 50)));
                myStats.shield += shGain;
                notice.push(`\n<a:strategy:1510907688169504788> __Scudo Fresco__: Gained **${shGain}** shield`);
                return AbilityResponse.SUCCESS;
            };
        });

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.skipFail = false;

            return AbilityResponse.SUCCESS;
        }, 9999));

        // Ultimate
        myStats.replaceButton.skip = {
            "emoji": "<a:strategy:1510907688169504788>",
            "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const cost = 100;
                const maxcost = 200;
                if (!checkEnergy(myStats, matchStats, notice, cost, char.name)) return AbilityResponse.FAILURE;

                if (myStats.energy >= maxcost) {
                    noTimeout(matchStats, myStats);
                    myStats.energy -= maxcost;
                    let shGain = Math.floor(myStats.maxhp * 0.25);
                    myStats.shield += shGain;
                    notice.push(`\n<a:energy:1511169619086409829> ♁ ₊ ☁️ ｡˚ ₊ ENERGY OVERLOAD!! ₊ ˚｡ ☁️ ₊ ♁ <a:energy:1511169619086409829>`);
                    notice.push(`\n<a:strategy:1510907688169504788> __Scudo Fresco__: Gained **${shGain}** shield. Unsheathing...`);
                    let unsheatheDmg = Math.min(myStats.shield, Math.floor(myStats.maxhp * 5));
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<a:strategy:1510907688169504788> __Scudo Fresco__: Unsheathe`, { overwriteDamage: unsheatheDmg, defMultiplier: 0, dodge: false, block: false, canCounter: false });
                    myStats.shield = Math.floor(myStats.shield / 2);

                } else {
                    if (Math.random() < 0.5) noTimeout(matchStats, myStats);
                    myStats.energy -= cost;
                    myStats.shield += Math.floor(myStats.maxhp * 0.15);
                    notice.push(`\n<a:strategy:1510907688169504788> __Scudo Fresco__: Gained **${Math.floor(myStats.maxhp * 0.15)}** shield.`);
                };

                return AbilityResponse.SUCCESS;
            },
        };

        notice.push(`\n<a:strategy:1510907688169504788> __Scudo Fresco__: Gained **${Math.floor(myStats.maxhp * 0.5)}** shield`);
        notice.push(`\n<a:strategy:1510907688169504788> __Scudo Fresco__: Shields gather and merge before your every trial...`);

        return AbilityResponse.SUCCESS;
    }),
    new PhantasmaStrategy(9, "The Final Thread", "The enemy loses **20%** `STABILITY` every round (At most 1% from this effect). Upon any STABILITY refresh, boosts own ATK by **3%** permanently. (Max: 20 triggers). Stability refresh grants **200** energy (no <a:energy:1511169619086409829> cap).", "At 200 <a:energy:1511169619086409829>, deals **200%** damage and reduces the enemy's stability by **15%** (Min: 1%). After **10** uses, this effect is triggered twice. (Timeout false)", "<a:stability:1451561886339436675>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.stability ??= 100;
        myStats.ignoreSTABILITY = false;

        myStats.energy ??= 0;
        myStats.skipFail = false;

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.skipFail = false;
            if (!myStats.ignoreSTABILITY) {
                eStats.stability -= 20;
                if (eStats.stability < 1) eStats.stability = 1;
            };
            return AbilityResponse.SUCCESS;
        }, 9999));

        matchStats.on("stabilRefresh", {
            maxUsage: 20,
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (target == eStats) {
                    mybuff.atk.push(new buffInfo("*", 1.03, 9999));
                    mybuff.md.push(new buffInfo("*", 1.03, 9999));
                    return true;
                };
            }
        });

        matchStats.on("stabilRefresh", ({ trigger, caster, target, matchStats, options }: any) => {
            if (target === eStats) {
                myStats.energy += 200;
            };
        });

        // Ultimate
        myStats.replaceButton.skip = {
            "emoji": "<a:strategy:1510907688169504788>",
            "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const cost = 200;
                if (!checkEnergy(myStats, matchStats, notice, cost, char.name)) return AbilityResponse.FAILURE;

                myStats.finalThreadUses = (myStats.finalThreadUses ?? 0) + 1;
                noTimeout(matchStats, myStats);
                myStats.energy -= cost;
                let hits = myStats.finalThreadUses >= 10 ? 2 : 1;
                notice.push(`\n<a:energy:1511169619086409829> ♁ ₊ ☁️ ｡˚ ₊ ENERGY OVERLOAD!! ₊ ˚｡ ☁️ ₊ ♁ <a:energy:1511169619086409829>`);
                for (let i = 0; i < hits; i++) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<a:strategy:1510907688169504788> __The Final Thread__`, { atkMultiplier: 2, dodge: false, canCounter: false });
                    if (!myStats.ignoreSTABILITY) {
                        eStats.stability -= 15;
                        if (eStats.stability < 1) eStats.stability = 1;
                    };
                };
                if (hits > 1) notice.push(`\n<a:strategy:1510907688169504788> __The Final Thread__: Doubled strike!`);

                return AbilityResponse.SUCCESS;
            },
        };

        notice.push(`\n<a:strategy:1510907688169504788> __The Final Thread__: You feel HER fury, despair... everything seems to destabilize.`);

        return AbilityResponse.SUCCESS;
    }),
    new PhantasmaStrategy(10, "Scarlet Attunement", "At the start of every round, applies **2** rounds of BURNING, then immediately triggers **1** BURNING. If the enemy is below **50%** HP, triggers another BURNING. Every burn grants **20** energy (<a:energy:1511169619086409829>).", "At 100 <a:energy:1511169619086409829>, inflicts **4** rounds of burn. At 200 <a:energy:1511169619086409829> however, all attacks apply **1x** burn this round. At the start of the next round, triggers **all** available burn, before applying **3x** burn. (Timeout false)", "<a:burn:1475075402295803914>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.burntype ??= 1;
        if (typeof eStats.burnduration !== "number") {
            eStats.burnduration = 0;
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                procburn(eStats, myStats, ebuff, mybuff, matchStats, notice, ``, {});

                return AbilityResponse.SUCCESS;
            }, 9999));
        };

        eStats.burnduration += 2;
        procburn(eStats, myStats, ebuff, mybuff, matchStats, notice, ``, {});
        if (eStats.hp / eStats.maxhp < 0.5) procburn(eStats, myStats, ebuff, mybuff, matchStats, notice, ``, {});

        myStats.energy ??= 0;
        myStats.skipFail = false;

        matchStats.on("burn", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (caster === myStats && target === eStats) {
                myStats.energy = Math.min(myStats.energy + 20, 200);
            };
        });

        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (caster === myStats && target === eStats && myStats.scarletAllAttackBurn) {
                eStats.burnduration++;
            };
        });

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.skipFail = false;

            eStats.burnduration += 2;
            procburn(eStats, myStats, ebuff, mybuff, matchStats, notice, ``, {});
            if (eStats.hp / eStats.maxhp < 0.5) procburn(eStats, myStats, ebuff, mybuff, matchStats, notice, ``, {});

            if (myStats.scarletAllAttackBurn) {
                myStats.scarletAllAttackBurn = false;
                if (eStats.burnduration > 0) {
                    let dur = Math.min(eStats.burnduration, 20);
                    for (let i = 0; i < dur; i++) {
                        procburn(eStats, myStats, ebuff, mybuff, matchStats, notice, ``, {});
                    };
                    eStats.burnduration += 3;
                    procburn(eStats, myStats, ebuff, mybuff, matchStats, notice, ``, {});
                    notice.push(`\n<a:strategy:1510907688169504788> __Scarlet Attunement__: All burns triggered! Applied **3x** additional burn.`);
                };
            };

            return AbilityResponse.SUCCESS;
        }, 9999));

        // Ultimate
        myStats.replaceButton.skip = {
            "emoji": "<a:strategy:1510907688169504788>",
            "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const cost = 100;
                const maxcost = 200;
                if (!checkEnergy(myStats, matchStats, notice, cost, char.name)) return AbilityResponse.FAILURE;

                if (myStats.energy >= maxcost) {
                    noTimeout(matchStats, myStats);
                    myStats.energy -= maxcost;
                    myStats.scarletAllAttackBurn = true;
                    notice.push(`\n<a:energy:1511169619086409829> ♁ ₊ ☁️ ｡˚ ₊ ENERGY OVERLOAD!! ₊ ˚｡ ☁️ ₊ ♁ <a:energy:1511169619086409829>`);
                    notice.push(`\n<a:strategy:1510907688169504788> __Scarlet Attunement__: All attacks apply **1x** burn this round. Next round, all burns will be triggered!`);

                } else {
                    if (Math.random() < 0.5) noTimeout(matchStats, myStats);
                    myStats.energy -= cost;
                    eStats.burnduration += 4;
                    procburn(eStats, myStats, ebuff, mybuff, matchStats, notice, ``, {});
                    notice.push(`\n<a:strategy:1510907688169504788> __Scarlet Attunement__: Inflicted **4** rounds of burn.`);
                };

                return AbilityResponse.SUCCESS;
            },
        };

        notice.push(`\n<a:strategy:1510907688169504788> __Scarlet Attunement__: Everything seems to be ablaze...`);

        return AbilityResponse.SUCCESS;
    }),
    new PhantasmaStrategy(11, "Indigo Reverberation", "Lightning hits deal **50%** more damage. Every **5** lightning strikes is followed up by a undodgeable uncounterable lightning hit, dealing **10%** damage for every time this was triggered. (Max: 300%). Every lightning hit grants **20** energy (<a:energy:1511169619086409829>).", "At 200 <a:energy:1511169619086409829>, summons an **electric drill**, lasting for **8** rounds (stackable). At the start of every round, the drill decreases the enemy's **DEF**, **MR** & **lightning resistance** by **30%**, while amplifying the next lightning hit to deal **50%** more damage. (Timeout false)", "<:lightning:1340309243827458139>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.lightningMultiplier ??= 0;
        myStats.lightningMultiplier += 0.5;
        myStats.tempLightningBuff ??= 0;
        myStats.tempLightningBuffActive ??= 0;
        myStats.lightningcount ??= 0;
        myStats.electricDrill = 0;

        myStats.energy ??= 0;
        myStats.skipFail = false;

        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats && options.isLightning) {
                myStats.energy = Math.min(myStats.energy + 20, 200);
                if (myStats.lightningcount % 5 === 0) dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:lightning:1340309243827458139> The Thunderer`, { atkMultiplier: Math.min(0.1 * (myStats.lightningcount / 5), 3), dodge: false, canCounter: false, isLightning: true });
            };
        });

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.skipFail = false;

            if (myStats.electricDrill > 0) {
                myStats.electricDrill--;
                eStats.def = Math.floor(eStats.def * 0.7);
                eStats.mr = Math.floor(eStats.mr * 0.7);
                eStats.lightningResistance = (eStats.lightningResistance ?? 0) - 0.3;
                myStats.tempLightningBuff += 0.5;
                myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    myStats.tempLightningBuff -= 0.5;

                    return AbilityResponse.SUCCESS;
                }));
                myStats.tempLightningBuffActive++;
                notice.push(`\n<a:strategy:1510907688169504788> __Indigo Reverberation__: Electric drill active! **${myStats.electricDrill}** rounds remaining.`);
            };

            return AbilityResponse.SUCCESS;
        }, 9999));

        // Ultimate
        myStats.replaceButton.skip = {
            "emoji": "<a:strategy:1510907688169504788>",
            "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const cost = 200;
                if (!checkEnergy(myStats, matchStats, notice, cost, char.name)) return AbilityResponse.FAILURE;

                noTimeout(matchStats, myStats);
                myStats.energy -= cost;
                myStats.electricDrill += 8;
                notice.push(`\n<a:energy:1511169619086409829> ♁ ₊ ☁️ ｡˚ ₊ ENERGY OVERLOAD!! ₊ ˚｡ ☁️ ₊ ♁ <a:energy:1511169619086409829>`);
                notice.push(`\n<a:strategy:1510907688169504788> __Indigo Reverberation__: Electric drill summoned for **${myStats.electricDrill}** rounds!`);

                return AbilityResponse.SUCCESS;
            },
        };

        notice.push(`\n<a:strategy:1510907688169504788> __Indigo Reverberation__: Lightning pierces through the sky, and a radiant aura surrounds you...`);

        return AbilityResponse.SUCCESS;
    }),
    new PhantasmaStrategy(12, "Regressive Rime", "Frost hits deal **50%** more damage (and apply 1x Frost by default). So long the enemy has Frost, they have **-50%** critical rate and dodge rate. Every frost hit grants **3** energy (<a:energy:1511169619086409829>).", "At 200 <a:energy:1511169619086409829>, hails a *snowstorm* this round. You may carry an umbrella or dance, depending on whether you next use **ATK** or **STRATEGY (SKIP)** again. **Umbrella**: Freezes the enemy for **1** round and deals **100%** damage. **Dance**: Deals **4** hits of **80%** damage and ends with a final hit of **120%** damage. If the phase changed by the end of the attacks, deals **2** additional hits of **80%** damage. (Timeout false)", "❄️", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.frostbonus ??= 0;
        myStats.frostbonus += 0.5;
        eStats.frost ??= 0;

        myStats.energy ??= 0;
        myStats.skipFail = false;

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (eStats.frost) {
                eStats.dodge -= 0.5;
                if (eStats.dodge < 0) eStats.dodge = 0;
                eStats.cr -= 0.5;
                if (eStats.cr < 0) eStats.cr = 0;
            };
            myStats.skipFail = false;

            return AbilityResponse.SUCCESS;
        }, 9999));

        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (caster === myStats && target === eStats && options.element === 1) {
                myStats.energy = Math.min(myStats.energy + 3, 200);
            };
        });

        // ATK replacement for Umbrella
        matchStats.on("ATK", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (caster === myStats && target === eStats && myStats.snowStorm) {
                myStats.snowStorm = false;
                eStats.timeFrozen = true;
                eStats.frozenMessage = "was frozen";
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<a:strategy:1510907688169504788> __Regressive Rime__: Umbrella`, { atkMultiplier: 1, dodge: false, canCounter: false });
                notice.push(`\n<a:strategy:1510907688169504788> __Regressive Rime__: The Umbrella freezes the enemy solid!`);
            };
            return AbilityResponse.SUCCESS;
        });

        // Ultimate
        myStats.replaceButton.skip = {
            "emoji": "<a:strategy:1510907688169504788>",
            "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (myStats.snowStorm) {
                    myStats.snowStorm = false;
                    let phaseBefore = eStats.phase;
                    for (let i = 0; i < 4; i++) {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<a:strategy:1510907688169504788> __Regressive Rime__: Dance`, { atkMultiplier: 0.8, dodge: false, canCounter: false });
                    };
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<a:strategy:1510907688169504788> __Regressive Rime__: Dance Finale`, { atkMultiplier: 1.2, dodge: false, canCounter: false });
                    if (eStats.phase > phaseBefore) {
                        for (let i = 0; i < 2; i++) {
                            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<a:strategy:1510907688169504788> __Regressive Rime__: Dance Encore`, { atkMultiplier: 0.8, dodge: false, canCounter: false });
                        };
                        notice.push(`\n<a:strategy:1510907688169504788> __Regressive Rime__: The phase change fuels an encore!`);
                    };
                    return AbilityResponse.SUCCESS;
                };

                const cost = 200;
                if (myStats.energy < cost) {
                    if (!myStats.skipFail) {
                        noTimeout(matchStats, myStats);
                        myStats.skipFail = true;
                        matchStats.sendWarning({ content: `You don't have enough energy! (${myStats.energy}/${cost} <a:energy:1511169619086409829>)\n-# Clicking again this round will instead let you flee the battle.`, ephemeral: true });
                    } else {
                        noTimeout(matchStats, myStats);
                        myStats.forceLoose = true;
                        notice.push(`\n<a:exit:1511883591532019804> ${char.name} fled the fight`);
                    };
                    return AbilityResponse.FAILURE;
                };

                noTimeout(matchStats, myStats);
                myStats.energy -= cost;
                myStats.snowStorm = true;
                notice.push(`\n<a:energy:1511169619086409829> ♁ ₊ ☁️ ｡˚ ₊ ENERGY OVERLOAD!! ₊ ˚｡ ☁️ ₊ ♁ <a:energy:1511169619086409829>`);
                notice.push(`\n<a:strategy:1510907688169504788> __Regressive Rime__: A snowstorm rages! Choose your next action — **ATK** (Umbrella) or **SKIP** (Dance).`);

                return AbilityResponse.SUCCESS;
            },
        };

        notice.push(`\n<a:strategy:1510907688169504788> __Regressive Rime__: Frost hails, and you feel the ancient blessing before you...`);

        return AbilityResponse.SUCCESS;
    }),
    new PhantasmaStrategy(13, "Cerulean Convergence", "Increases max mana cap by **200**. Upon phase change, gains mana equal to **20%** of mana cap instantly. At the start of every round, for every **500** mana gained, you have **+1%** ATK & MD (Max: 40%). Generates energy (<a:energy:1511169619086409829>) equal to mana regen every round.", "At 25 <a:energy:1511169619086409829>: Converts any energy into reserves, resetting it to **0**. Using **STRATEGY (SKIP)** twice in a row instead expends reserves, dealing **1** hit of **70%** damage for every **100** energy in reserves (Max: **10** hits), before reducing reserves by the expended amount. (Timeout false)", "<:mana_generation:1063215562349629570>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mana += 200;
        myStats.manaGained ??= 0;

        myStats.energy ??= 0;
        myStats.skipUsed = false;
        myStats.skipFail = false;
        myStats.reserves ??= 0;

        matchStats.on("phaseChange", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (caster === eStats) {
                let manaGain = Math.floor(myStats.mana * 0.2);
                myStats.sm += manaGain;
                if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
                if (myStats.manaGained !== undefined) myStats.manaGained += manaGain;
                return AbilityResponse.SUCCESS;
            };
        });

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.manaGained) {
                myStats.atk += Math.floor(myStats.atk * Math.min(0.01 * (myStats.manaGained / 500), 0.4));
                myStats.md += Math.floor(myStats.md * Math.min(0.01 * (myStats.manaGained / 500), 0.4));
            };
            myStats.energy = Math.min(myStats.energy + (myStats.mg), 200);
            myStats.skipUsed = false;

            return AbilityResponse.SUCCESS;
        }, 9999));

        // Ultimate
        myStats.replaceButton.skip = {
            "emoji": "<a:strategy:1510907688169504788>",
            "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (myStats.skipUsed) {
                    if (myStats.reserves <= 100) {
                        if (!myStats.skipFail) {
                            noTimeout(matchStats, myStats);
                            myStats.skipFail = true;
                            notice.push(`\nYou can only expend if you have more than **100** reserves. Clicking again will let you flee the battle.`);
                            return AbilityResponse.FAILURE;
                        };
                        myStats.forceLoose = true;
                        notice.push(`\n<a:exit:1511883591532019804> ${char.name} fled the fight`);
                        return AbilityResponse.FAILURE;
                    };
                    let hits = Math.min(Math.floor(myStats.reserves / 100), 10);
                    let expended = hits * 100;
                    noTimeout(matchStats, myStats);
                    notice.push(`\n<a:strategy:1510907688169504788> __Cerulean Convergence__: Expending reserves for **${hits}** hits!`);
                    for (let i = 0; i < hits; i++) {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<a:strategy:1510907688169504788> __Cerulean Convergence__`, { atkMultiplier: 0.7, dodge: false, canCounter: false });
                    };
                    myStats.reserves -= expended;
                    if (myStats.reserves < 0) myStats.reserves = 0;
                    myStats.skipFail = false;
                    return AbilityResponse.SUCCESS;
                };

                // Check energy for conversion
                myStats.skipUsed = true;
                if (!checkEnergy(myStats, matchStats, notice, 25, char.name)) return AbilityResponse.FAILURE;
                noTimeout(matchStats, myStats);
                myStats.energy -= 25;
                myStats.reserves += myStats.energy;
                myStats.energy = 0;
                notice.push(`\n<a:strategy:1510907688169504788> __Cerulean Convergence__: Converted energy into reserves (**${myStats.reserves}** total). Use SKIP again to expend!`);

                return AbilityResponse.SUCCESS;
            },
        };

        notice.push(`\n<a:strategy:1510907688169504788> __Cerulean Convergence__: Mana seems to rejoice with your movement...`);

        return AbilityResponse.SUCCESS;
    }),
    new PhantasmaStrategy(14, "Executor beyond the Light", "Deal **1%** more damage for every **1%** remaining HP on the enemy (Max: 60%). Generates **25** energy (No <a:energy:1511169619086409829> cap) for every phase change with no cap.", "At 200 <a:energy:1511169619086409829>, increases execution hp% trigger by **1%** (Max: 10 uses, Timeout false)", "<a:heart:1511525618855051396>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.executeHP ??= 0;
        myStats.execBeyondLight = true;
        myStats.execBLused = 0;

        myStats.energy ??= 0;
        myStats.skipFail = false;

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.skipFail = false;

            return AbilityResponse.SUCCESS;
        }, 9999));

        matchStats.on("phaseChange", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (caster === eStats) {
                myStats.energy += 25;
            };
        });

        // Ultimate
        myStats.replaceButton.skip = {
            "emoji": "<a:strategy:1510907688169504788>",
            "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const cost = 200;
                if (!checkEnergy(myStats, matchStats, notice, cost, char.name)) return AbilityResponse.FAILURE;

                noTimeout(matchStats, myStats);
                if (myStats.execBLused >= 10) {
                    if (!myStats.skipFail) {
                        myStats.skipFail = true;
                        matchStats.sendWarning({ content: `You can only use this 10 times!\n-# Clicking again this round will instead let you flee the battle.`, ephemeral: true });
                        return AbilityResponse.FAILURE;
                    } else {
                        myStats.forceLoose = true;
                        notice.push(`\n<a:exit:1511883591532019804> ${char.name} fled the fight`);
                        return AbilityResponse.FAILURE;
                    };
                };
                myStats.energy -= cost;
                myStats.execBLused++;
                myStats.executeHP += 0.01;
                notice.push(`\n<a:energy:1511169619086409829> ♁ ₊ ☁️ ｡˚ ₊ ENERGY OVERLOAD!! ₊ ˚｡ ☁️ ₊ ♁ <a:energy:1511169619086409829>`);
                notice.push(`\n<a:strategy:1510907688169504788> __Executor beyond the Light__: Increased execution HP% trigger by **1%**.`);

                return AbilityResponse.SUCCESS;
            },
        };

        notice.push(`\n<a:strategy:1510907688169504788> __Executor beyond the Light__: A priceless speciment, a gift for the Beyond...`);

        return AbilityResponse.SUCCESS;
    }),
    new PhantasmaStrategy(15, "Coup de Grâce", "Deal **1%** more damage for every **1%** missing HP on the enemy (Max: 80%). Generates **50** energy (<a:energy:1511169619086409829>) for every phase change with no cap.", "At 200 <a:energy:1511169619086409829>, sets the enemy's **dodge**, **block** and **counter** to **0** for this round. (Timeout false)", "<a:brain:1511525644821860352>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.coupDeGrace = true;

        myStats.energy ??= 0;
        myStats.skipFail = false;

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.skipFail = false;

            return AbilityResponse.SUCCESS;
        }, 9999));

        matchStats.on("phaseChange", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (caster === eStats) {
                myStats.energy += 50;
            };
        });

        // Ultimate
        myStats.replaceButton.skip = {
            "emoji": "<a:strategy:1510907688169504788>",
            "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const cost = 200;
                if (!checkEnergy(myStats, matchStats, notice, cost, char.name)) return AbilityResponse.FAILURE;

                noTimeout(matchStats, myStats);
                myStats.energy -= cost;
                eStats.dodge = 0;
                eStats.block = 0;
                eStats.counter = 0;
                notice.push(`\n<a:energy:1511169619086409829> ♁ ₊ ☁️ ｡˚ ₊ ENERGY OVERLOAD!! ₊ ˚｡ ☁️ ₊ ♁ <a:energy:1511169619086409829>`);
                notice.push(`\n<a:strategy:1510907688169504788> __Coup de Grace__: The enemy's defenses are stripped!`);

                return AbilityResponse.SUCCESS;
            },
        };

        notice.push(`\n<a:strategy:1510907688169504788> __Coup de Grâce__: An execution is merciful... you'll make it quick.`);

        return AbilityResponse.SUCCESS;
    }),
    new PhantasmaStrategy(16, "Ignorance is Bliss??", "Uses a random strategy from the aforementioned Phantasma Strategies.", "", "<:dice:1403330160152809482>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        notice.push(`\n<a:strategy:1510907688169504788> __Ignorance IS bliss!!!__: You roll a random strategy hoping for the best...`);
        const valid = phantasmaStrategies.filter((s) => s.id >= 1 && s.id <= 15);
        const chosen = valid[Math.floor(Math.random() * valid.length)];
        return chosen.buff(myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list);
    }),
];
