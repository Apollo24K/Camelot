import _ from "lodash";
import { Ability, abilities } from "./abilities";

export type AscensionNode = {
    name?: string;
    desc: string;
    apply: (ability: Ability) => void;
};

// charId -> ascension nodes (index 0 = rank 1). Max rank = array length.
// Nodes are applied in order to a fresh per-battle ability clone.
export const ascensions: Record<number, AscensionNode[]> = {
    // Sinon
    77: [
        {
            desc: "Active deals **15%** more damage.",
            apply: (ability) => { ability.activeBonus += 0.15; },
        },
        {
            desc: "Every **1%** of dodge rate on the enemy = **+0.5%** damage scaling on her active.",
            apply: (ability) => { ability.dodgeScalingBonus += 0.5; },
        },
        {
            desc: "Active costs **5** less 💧.",
            apply: (ability) => { ability.cost = Math.max(0, ability.cost - 5); },
        },
        {
            desc: "Every **1%** of dodge rate on the enemy = **+0.5%** damage scaling on her active.",
            apply: (ability) => { ability.dodgeScalingBonus += 0.5; },
        },
        {
            desc: "Active deals **15%** more damage.",
            apply: (ability) => { ability.activeBonus += 0.15; },
        },
        {
            desc: "Every **1%** of dodge rate on the enemy = **+0.5%** damage scaling on her active.",
            apply: (ability) => { ability.dodgeScalingBonus += 0.5; },
        },
        {
            desc: "Active costs **5** less 💧.",
            apply: (ability) => { ability.cost = Math.max(0, ability.cost - 5); },
        },
        {
            desc: "Every **1%** of dodge rate on the enemy = **+0.5%** damage scaling on her active.",
            apply: (ability) => { ability.dodgeScalingBonus += 0.5; },
        },
    ],
    // Eren Yeager
    274: [
        {
            desc: "Active costs **5** less mana.",
            apply: (ability) => { ability.cost = Math.max(0, ability.cost - 5); },
        },
        {
            desc: "Active can be used another time.",
            apply: (ability) => { ability.usage = ability.usage + 1; },
        },
        {
            desc: "Active costs **5** less mana.",
            apply: (ability) => { ability.cost = Math.max(0, ability.cost - 5); },
        },
        {
            desc: "Active can be used another time.",
            apply: (ability) => { ability.usage = ability.usage + 1; },
        },
        {
            desc: "Active costs **5** less mana.",
            apply: (ability) => { ability.cost = Math.max(0, ability.cost - 5); },
        },
        {
            desc: "Active can be used another time.",
            apply: (ability) => { ability.usage = ability.usage + 1; },
        },
    ],
    // David Martinez
    10125: [
        {
            desc: "Using ✨ additionally boosts critical damage by **25%** for that round.",
            apply: (ability) => { ability.critdmgBuff += 0.25; },
        },
        {
            desc: "Cyberpsychosis grants **+10%** critical rate permanently (once).",
            apply: (ability) => { ability.crBuff += 0.1; },
        },
        {
            desc: "Cyberpsychosis reduces enemy's DEF & MR by **+5%** (once).",
            apply: (ability) => { ability.defMrShred += 0.05; },
        },
        {
            desc: "Active max HP cost **-2%**.",
            apply: (ability) => { ability.hpSac -= 0.02; },
        },
        {
            desc: "Cyberpsychosis recovers **+10%** missing HP.",
            apply: (ability) => { ability.mHpHeal += 0.1; },
        },
        {
            desc: "When in a party with Lucy EX, active's cooldown is reduced by **1** round.",
            apply: (ability) => { ability.asc = 6; },
        },
        {
            desc: "Active max HP cost instead scales off of current HP.",
            apply: (ability) => { ability.asc = 7; },
        },
        {
            name: "✧ I’ll Take You To The Moon! I Promise! ✧",
            desc: "Ascension **6** no longer requires being in a party with Lucy EX. With Lucy EX however, the enemy has **33%** less dodge chance in his battles.",
            apply: (ability) => { ability.asc = 8; },
        },
    ],
    // Rudeus EX
    17117: [
        {
            desc: "ATK (<:stonecannon:1340376201058844733>) instead deals **100%**-**130%** magic damage. Active (<:stormbolt:1340378654919884981>) instead deals **150%**-**230%** damage.",
            apply: (ability) => { ability.magicDamage += 0.1; ability.activeBonus += 0.15; },
        },
        {
            desc: "Active (<:stormbolt:1340378654919884981>) can be used **3** more times.",
            apply: (ability) => { ability.usage += 3; },
        },
        {
            desc: "DEF (<:quagmire:1340378636284461116>)'s DEF & MR reduction lasts for **+1** round. Its DEF & MR damage cap is increased to **2.5x**.",
            apply: (ability) => { ability.defMrDuration += 1; ability.defMrCap = 872; },
        },
        {
            desc: "ATK, DEF and active costs **10** less 💧.",
            apply: (ability) => { ability.manaCostReduction += 10; ability.cost = Math.max(0, ability.cost - 10); },
        },
        {
            name: "✧ The Laplace's Breakthrough ✧",
            desc: "Starting from round **20**: ATK instead deals **160%** magical damage. DEF instead sets dodge to **85%** and decreases enemy's DEF/MR by **30%**. Active instead deals **270%** magical damage. These will cost slightly more mana.",
            apply: (ability) => { ability.rudyBT = true; },
        },
    ],
    // Gintoki EX
    17742: [
        {
            desc: "Passive ATK & CR buff can stack **5** more times.",
            apply: (ability) => { ability.psvMaxStacks += 5; },
        },
        {
            desc: "Active puts **+27%** damage on hold, and has a **+25%** chance to counter the next hit every round.",
            apply: (ability) => { ability.actDamageOnHold += 0.27; ability.actCounterChance += 0.25; },
        },
        {
            desc: "When under **30%** HP, deals and takes **+20%** more damage.",
            apply: (ability) => { ability.psvVulnerability += 0.2; },
        },
        {
            desc: "Active no longer has timeout. Injuries are spread over **+5** rounds.",
            apply: (ability) => { ability.actTimeout = false, ability.injuriesSpread += 5; },
        },
        {
            name: "✧ The White Yakasha ✧",
            desc: "Only **67%** of original Injuries are passed on to haunt. The remaining is converted into max HP buff for **6** rounds.",
            apply: (ability) => { ability.gintokiBT = true; },
        },
    ],
    // Lucy EX
    21930: [
        {
            desc: "Immediately uploads Daemon upon entering battle, crippling the enemy for **1** round.",
            apply: (ability) => { ability.asc = 1; },
        },
        {
            desc: "Immediately uses her active once when entering battle (Ignores active-replacing effects).",
            apply: (ability) => { ability.asc = 2; },
        },
        {
            desc: "Using active when the enemy is crippled allows her to deal *doubled* the initial damage.",
            apply: (ability) => { ability.asc = 3; },
        },
        {
            desc: "When in a party with David Martinez, she cripples enemy in her own battles once every **3** rounds instead of 4.",
            apply: (ability) => { ability.asc = 4; },
        },
        {
            name: "✧ You never had to save me. ✧",
            desc: "The restriction on Ascension **4** is lifted. However with David Martinez, she evades first lethal death. If successful, she will recover all health and double her cripple vulenrability effect in her own battles. However, her instability will cause her to lose **8%** max HP every round.",
            apply: (ability) => { ability.asc = 5; },
        },
    ],
    // Acheron EX
    21931: [
        {
            desc: "When falling below **30%** HP, heals **+10%** max HP and rejuvenates **+20** 💧.",
            apply: (ability) => { ability.heal += 0.1; ability.mana += 20; },
        },
        {
            desc: "Active has **2** less rounds of cooldown.",
            apply: (ability) => { ability.cd -= 2; },
        },
        {
            desc: "For every debuff on the enemy, has **+5%** critical rate.",
            apply: (ability) => { ability.asc = 3; },
        },
        {
            desc: "Using active stuns the enemy for **1** round.",
            apply: (ability) => { ability.asc = 4; },
        },
        {
            name: "✧ Apocalypse, the Emancipator ✧",
            desc: "Before active is unleashed, boosts critical rate by **100%**. Excess critical rate are converted to critical damage (Max: +100%). After using active, the opponent takes **+5%** damage permanently (Max: +30%)",
            apply: (ability) => { ability.asc = 5; },
        },
    ],
};

type AscensionSchema = { char_ascension?: Record<string, number>; } | null | undefined;

export const getAscensionRank = (charId: number, schema: AscensionSchema): number => {
    const nodes = ascensions[charId];
    if (!nodes) return 0;
    return Math.min(Math.max(schema?.char_ascension?.[charId] ?? 0, 0), nodes.length);
};

// Shared node list rendering (checkmark = unlocked, lock = not yet unlocked).
export const formatAscensionNodes = (charId: number, rank: number): string => {
    const nodes = ascensions[charId];
    if (!nodes) return "";
    return nodes.map((n, i) => i < rank
        ? `<a:check:873196253276700682> <:lvl:1559387729467416586> **${i + 1} ${n.name ? `: __${n.name}__` : ""}**\n> - ${n.desc}`
        : `<:locked:1559392336994115666> <:lvl:1559387729467416586> **${i + 1} ${n.name ? `: __${n.name}__` : ""}**\n> - ${n.desc}`).join("\n\n");
};

export const getUserAbility = (charId: number, schema: AscensionSchema): Ability | undefined => {
    if (!(charId in abilities)) return undefined;
    const ability = _.cloneDeep(abilities[charId]) as Ability;
    const nodes = ascensions[charId];
    if (!nodes) return ability;
    const rank = getAscensionRank(charId, schema);
    for (let i = 0; i < rank; i++) nodes[i].apply(ability);
    return ability;
};
