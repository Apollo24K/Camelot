// import { AbilityResponse } from "./components";
// import { ItemAbility } from "../types";
// import buffInfo from "./buffs";
// import delayedBuffs from "./delayedBuffs";
// import { dealDamage, addHeal, noTimeout, procburn } from "./functions";
// import { items } from "./items";

// export class PosWorldBossModifier {
//     private _id: number;
//     private _name: string;
//     private _description: string;
//     private _emoji: string;
//     private _buff: ItemAbility;

//     constructor(id: number, name: string, description: string, emoji: string, buff: ItemAbility) {
//         this._id = id;
//         this._name = name;
//         this._description = description;
//         this._emoji = emoji;
//         this._buff = buff;
//     }

//     get id() { return this._id; }
//     get name() { return this._name; }
//     get description() { return this._description; }
//     get emoji() { return this._emoji; }
//     get buff() { return this._buff; }
// }

// export class NegWorldBossModifier {
//     private _id: number;
//     private _name: string;
//     private _description: string;
//     private _emoji: string;
//     private _buff: ItemAbility;

//     constructor(id: number, name: string, description: string, emoji: string, buff: ItemAbility) {
//         this._id = id;
//         this._name = name;
//         this._description = description;
//         this._emoji = emoji;
//         this._buff = buff;
//     }

//     get id() { return this._id; }
//     get name() { return this._name; }
//     get description() { return this._description; }
//     get emoji() { return this._emoji; }
//     get buff() { return this._buff; }
// }

// // 19 in Total
// export const posWorldBossModifiers: PosWorldBossModifier[] = [
//     new PosWorldBossModifier(1, "Soloblade", "Sword wielders gain **+66%** ATK & MD.", "<:apprentices_sword:1047918897573142619>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         if (myStats.weapon !== -1 && items[myStats.weapon]?.type === "sword") {
//             myStats.atk += Math.floor(myStats.atk * 0.66);
//             myStats.md += Math.floor(myStats.md * 0.66);
//             mybuff.atk.push(new buffInfo("*", 1.66, 9999));
//             mybuff.md.push(new buffInfo("*", 1.66, 9999));
//             notice.push(`\n<:apprentices_sword:1047918897573142619> __Soloblade__: Sword wielders gain significantly more ATK & MD`);
//         };

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(2, "Spellcaster", "Staff wielders gain **+66%** ATK & MD.", "<:apprentices_staff:1047983016577876159>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         if (myStats.weapon !== -1 && items[myStats.weapon]?.type === "staff") {
//             myStats.atk += Math.floor(myStats.atk * 0.66);
//             myStats.md += Math.floor(myStats.md * 0.66);
//             mybuff.atk.push(new buffInfo("*", 1.66, 9999));
//             mybuff.md.push(new buffInfo("*", 1.66, 9999));
//             notice.push(`\n<:apprentices_staff:1047983016577876159> __Spellcaster__: Staff wielders gain significantly more ATK & MD`);
//         };

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(3, "Mountain Cleaver", "Axe wielders gain **+66%** ATK & MD.", "<:apprentices_axe:1047986461582045305>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         if (myStats.weapon !== -1 && items[myStats.weapon]?.type === "axe") {
//             myStats.atk += Math.floor(myStats.atk * 0.66);
//             myStats.md += Math.floor(myStats.md * 0.66);
//             mybuff.atk.push(new buffInfo("*", 1.66, 9999));
//             mybuff.md.push(new buffInfo("*", 1.66, 9999));
//             notice.push(`\n<:apprentices_axe:1047986461582045305> __Mountain Cleaver__: Axe wielders gain significantly more ATK & MD`);
//         };

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(4, "Archer's Shot", "Bow wielders gain **+66%** ATK & MD.", "<:apprentices_bow:1047988813542207588>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         if (myStats.weapon !== -1 && items[myStats.weapon]?.type === "bow") {
//             myStats.atk += Math.floor(myStats.atk * 0.66);
//             myStats.md += Math.floor(myStats.md * 0.66);
//             mybuff.atk.push(new buffInfo("*", 1.66, 9999));
//             mybuff.md.push(new buffInfo("*", 1.66, 9999));
//             notice.push(`\n<:apprentices_bow:1047988813542207588> __Archer's Shot__: Bow wielders gain significantly more ATK & MD`);
//         };

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(5, "Lance's pierce", "Lance wielders gain **+66%** ATK & MD.", " Lance", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         if (myStats.weapon !== -1 && items[myStats.weapon]?.type === "lance") {
//             myStats.atk += Math.floor(myStats.atk * 0.66);
//             myStats.md += Math.floor(myStats.md * 0.66);
//             mybuff.atk.push(new buffInfo("*", 1.66, 9999));
//             mybuff.md.push(new buffInfo("*", 1.66, 9999));
//             notice.push(`\n<:apprentices_lance:1047993345487671296> __Lance's pierce__: Lance wielders gain significantly more ATK & MD`);
//         };

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(6, "Jab and Thrust", "Dagger wielders gain **+66%** ATK & MD.", "<:apprentices_dagger:1050079167988903967>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         if (myStats.weapon !== -1 && items[myStats.weapon]?.type === "dagger") {
//             myStats.atk += Math.floor(myStats.atk * 0.66);
//             myStats.md += Math.floor(myStats.md * 0.66);
//             mybuff.atk.push(new buffInfo("*", 1.66, 9999));
//             mybuff.md.push(new buffInfo("*", 1.66, 9999));
//             notice.push(`\n<:apprentices_dagger:1050079167988903967> __Jab and Thrust__: Dagger wielders gain significantly more ATK & MD`);
//         };

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(7, "Unending Prose", "You gain **+25%** max HP.", "<:HP:1062043800979116143>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         myStats.maxhp += Math.floor(myStats.maxhp * 0.25);
//         notice.push(`\n<:HP:1062043800979116143> __Unending Prose__: Increased max HP!`);

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(8, "Inked in Blood", "You gain **+33%** ATK. Attacks ignore **33%** DEF.", "<:ATK:1063214925528440832>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         myStats.atk += Math.floor(myStats.atk * 0.33);
//         mybuff.atk.push(new buffInfo("*", 1.33, 9999));
//         myStats.ignoreDefPercent ??= 0;
//         myStats.ignoreDefPercent += 0.33;
//         notice.push(`\n<:ATK:1063214925528440832> __Inked in Blood__: Increased ATK and ignores some DEF!`);

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(9, "Starlight's Tragedy", "You gain **+33%** MD. Attacks ignore **33%** MR.", "<:magic_dmg:948568336621527040>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         myStats.md += Math.floor(myStats.md * 0.33);
//         mybuff.md.push(new buffInfo("*", 1.33, 9999));
//         myStats.ignoreMrPercent ??= 0;
//         myStats.ignoreMrPercent += 0.33;
//         notice.push(`\n<:magic_dmg:948568336621527040> __Starlight's Tragedy__: Increased MD and ignores some MR!`);

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(10, "Chiaroscuro Break", "Critical hits deal **30%** more damage.", "<:crit_rate:1047269144195776512>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         myStats.critbonus ??= 0;
//         myStats.critbonus += 0.33;
//         notice.push(`\n<:crit_rate:1047269144195776512> __Chiaroscuro Break__: Critical hits deal more damage!`);

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(11, "Slaughterhouse Symmetrics", "Counters deal **66%** more damage.", "<:counter:1340459549374546032>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         myStats.critbonus ??= 0;
//         myStats.critbonus += 0.66;
//         notice.push(`\n<:counter:1340459549374546032> __Slaughterhouse Symmetrics__: Counters deal significantly more damage!`);

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(12, "Mirage Waltz", "Has **+10%** dodge. Every **2** dodges increase the damage taken by the enemy by **1%** (Max: 30%)", "<:dodge_chance:1047269150948606063>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         myStats.dodge += 0.1;
//         mybuff.dodge.push(new buffInfo("+", 0.1, 9999));
//         myStats.mirageDodged = 0;
//         eStats.vulnerabilityDynamic ??= 1;
//         matchStats.on("dodge", {
//             maxUsage: 60,
//             callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
//                 if (target === myStats) {
//                     myStats.mirageDodged++;
//                     if (myStats.mirageDodged % 2 === 0) eStats.vulnerabilityDynamic += 0.01;
//                     return true;
//                 };
//             },
//         });

//         notice.push(`\n<:dodge_chance:1047269150948606063> __Mirage Waltz__: Increased dodge. Dodging increase the damage taken by the enemy!`);

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(13, "Form in Tessellation", "A successful block heals you for **5%** max HP, and deals absolute damage equal to **33%** of your current HP multiplied by your block rate. This cannot crit.", "<:block_rate:1217949026281066599>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         matchStats.on("block", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
//             if (target === myStats) {
//                 addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.05), {});
//                 let dmg = Math.floor(myStats.hp * 0.33 * myStats.br);
//                 dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:block_rate:1217949026281066599> __Form in Tessellation__`, { overwriteDamage: dmg, defMultiplier: 0, dodge: false, block: false, canCounter: false, ignoreShield: true });
//             };
//         });
//         notice.push(`\n<:block_rate:1217949026281066599> __Form in Tesselation__: Blocks heal and deal damage!`);

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(14, "Scudo Fresco", "Begins battles with a **100%** max HP shield. This is refreshed every **15** rounds.", "<:shield:1062050038211166310>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         myStats.shield += Math.floor(myStats.maxhp);
//         myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//             if (matchStats.round % 15 === 0) myStats.shield += Math.floor(myStats.maxhp);
//             return AbilityResponse.SUCCESS;
//         }, 9999));

//         notice.push(`\n<:shield:1062050038211166310> __Scudo Fresco__: Starts with a shield. Gains a massive shield periodically!`);

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(15, "The Final Thread", "After every STABILITY refresh, gains **5%** ATK & MD (Max: 20 times)", "<a:stability:1451561886339436675>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         matchStats.on("stabilRefresh", {
//             maxUsage: 20,
//             callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
//                 if (target == eStats) {
//                     mybuff.atk.push(new buffInfo("*", 1.05, 9999));
//                     mybuff.md.push(new buffInfo("*", 1.05, 9999));
//                     return true;
//                 };
//             }
//         });

//         notice.push(`\n<a:stability:1451561886339436675> __The Final Thread__: STABILITY refreshes boost ATK & MD!`);

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(16, "Scarlet Attunement", "After every BURNING trigger, gains **+2%** ATK & MD (Max: 40 times)", "<a:burn:1475075402295803914>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         matchStats.on("burn", {
//             maxUsage: 40,
//             callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
//                 if (caster === myStats) {
//                     mybuff.atk.push(new buffInfo("*", 1.02, 9999));
//                     mybuff.md.push(new buffInfo("*", 1.02, 9999));
//                     return true;
//                 };
//             }
//         });

//         notice.push(`\n<a:burn:1475075402295803914> __Scarlet Attunement__: BURNING boosts ATK & MD!`);

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(17, "Indigo Reverberation", "Lightning hits deal **18%** more damage. Every **5** lightning strikes is followed up by a lightning hit, dealing **5%** damage for every time this was triggered. (Max: 100%).", "<:lightning:1340309243827458139>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         myStats.lightningMultiplier ??= 0;
//         myStats.lightningMultiplier += 0.18;
//         myStats.lightningcount ??= 0;

//         matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
//             if (caster === myStats && options.isLightning) {
//                 if (myStats.lightningcount % 5 === 0) dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:lightning:1340309243827458139> The Thunderer`, { atkMultiplier: Math.min(0.05 * (myStats.lightningcount / 5), 1), isLightning: true });
//             };
//         });

//         notice.push(`\n<:lightning:1340309243827458139> __Scarlet Attunement__: BURNING boosts ATK & MD!`);

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(18, "Regressive Rime", "Frost hits deal **50%** more damage (and apply 1x Frost by default). So long the enemy has Frost, they have **-25%** critical rate and dodge rate.", "❄️", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         myStats.frostbonus ??= 0;
//         myStats.frostbonus += 0.5;
//         eStats.frost ??= 0;

//         myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//             if (eStats.frost) {
//                 eStats.dodge -= 0.25;
//                 if (eStats.dodge < 0) eStats.dodge = 0;
//                 eStats.cr -= 0.25;
//                 if (eStats.cr < 0) eStats.cr = 0;
//             };

//             return AbilityResponse.SUCCESS;
//         }, 9999));

//         notice.push(`\n❄️ __Regressive Rime__: Frost hits deal greater damage! Enemies hit by them have less critical and dodge rate.`);

//         return AbilityResponse.SUCCESS;
//     }),
//     new PosWorldBossModifier(19, "Cerulean Convergence", "Increases mana regen by **20**. Increased critical rate by **1%** for every **1** mana regen.", "<:mana_generation:1063215562349629570>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         myStats.mana += 200;
//         myStats.mg += 20;
//         mybuff.mg.push(new buffInfo("+", 20, 9999));
//         myStats.cr += myStats.mg / 100;
//         if (myStats.cr > 1) myStats.cr = 1;
//         mybuff.cr.push(new buffInfo("+", myStats.mg / 100, 9999));

//         notice.push(`\n<:mana_generation:1063215562349629570> __Cerulean Convergence__: Regenerates significantly more mana! Increases critical rate based off mana regen.`);

//         return AbilityResponse.SUCCESS;
//     }),
// ];

// export const negWorldBossModifiers: NegWorldBossModifier[] = [
//     new NegWorldBossModifier(1, "Counter Instinct", "Boss counters the next hit at the start of every round.", "<:counter:1340459549374546032>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         eStats.counter ??= 0;

//         myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//             eStats.counter++;

//             return AbilityResponse.SUCCESS;
//         }, 9999));
//         notice.push(`\n<:counter:1340459549374546032> __Counter Instinct__: Boss counters a hit every round!`);

//         return AbilityResponse.SUCCESS;
//     }),
//     new NegWorldBossModifier(2, "Scorching Vine", "Boss applies **80** rounds of burn at the start of the fight.", "<a:burn:1475075402295803914>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         eStats.burnduration = (eStats.burnduration ?? 0) + 80;
//         // Burn SETUP
//         eStats.burntype ??= 1;
//         if (typeof eStats.burnduration !== "number") {// Trigger burn every round
//             eStats.burnduration = 0;
//             myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//                 procburn(eStats, myStats, ebuff, mybuff, matchStats, notice, ``, {});

//                 return AbilityResponse.SUCCESS;
//             }, 9999));
//         };
//         notice.push(`\n<a:burn:1475075402295803914> __Burning Aura__: Boss applies BURNING for a significant amount of rounds.`);

//         return AbilityResponse.SUCCESS;
//     }),
//     new NegWorldBossModifier(3, "Ironclad", "Boss gains **+100%** DEF.", "<:DEF:1062043800979116143>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         eStats.def *= 2;
//         ebuff.def.push(new buffInfo("*", 2, 9999));
//         notice.push(`\n<:DEF:1062043800979116143> __Ironclad__: Boss has significantly greater DEF`);

//         return AbilityResponse.SUCCESS;
//     }),
//     new NegWorldBossModifier(3, "Abjuration", "Boss gains **+100%** MR.", "<:magic_resistance:1047269149237334086>", async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
//         eStats.mr *= 2;
//         ebuff.mr.push(new buffInfo("*", 2, 9999));
//         notice.push(`\n"<:magic_resistance:1047269149237334086>" __Abjuration__: Boss has significantly greater MR`);

//         return AbilityResponse.SUCCESS;
//     }),
// ];
