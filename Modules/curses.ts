import { ClassAbility } from "../types";
import buffInfo from "./buffs";
import { AbilityResponse } from "./components";
import delayedBuffs from "./delayedBuffs";
import { dealDamage, addHeal, procburn, userLevel } from "./functions";
import { getUserSchema } from "./queries";

export default class curseInfo {
    private _name: string;
    private _id: number;
    private _emblem: string;
    private _tier: number;
    private _cost: number;
    private _skill: ClassAbility;
    private _passive: ClassAbility;
    private _image: string;
    private _descA: string;
    private _descP: string;

    constructor(name: string, id: number, emblem: string, tier: number, cost: number, skill: ClassAbility, passive: ClassAbility, image: string, descA: string, descP: string) {
        this._name = name;
        this._id = id;
        this._emblem = emblem;
        this._tier = tier;
        this._cost = cost;
        this._skill = skill;
        this._passive = passive;
        this._image = image;
        this._descA = descA;
        this._descP = descP;
    };

    get name() {
        return this._name;
    };
    get id() {
        return this._id;
    };
    get emblem() {
        return this._emblem;
    };
    get tier() {
        return this._tier;
    };
    get cost() {
        return this._cost;
    };
    get skill() {
        return this._skill;
    };
    get passive() {
        return this._passive;
    };
    get image() {
        return this._image;
    };
    get descA() {
        return this._descA;
    };
    get descP() {
        return this._descP;
    };
};

export const curses = [
    new curseInfo("Self Regeneration", 0, "<:Self_Regeneration:958114013244452884>", 0, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const heal = Math.floor((eStats.maxhp - eStats.hp) * 0.1);
        let hpBefore = eStats.hp;
        addHeal(eStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, heal, {});
        notice.push(`\n${curses[0].emblem} **${enemy.name}** has recovered **${eStats.hp - hpBefore}** HP`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.hp.push(new buffInfo("+", Math.floor(eStats.maxhp * 0.05), 9999));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/zQzvw0f/Self-Regeneration.png", "The monster heals itself for 10% of missing HP.", "Heals 5% of max HP after each round."),
    new curseInfo("Poisonous Breath", 1, "<:Poisonous_Breath:958114013542236210>", 0, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let dmg = Math.floor(myStats.maxhp * 0.06); // Deals 6% dmg of your max HP
        if (myStats.hp - dmg < 0) dmg = myStats.hp;
        myStats.hp -= dmg;
        notice.push(`\n${curses[1].emblem} **${enemy.name}** has dealt **${dmg}** damage`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("*", 0.97, 9999));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/5WMwKWN/Poisonous-Breath.png", "The monster deals 6% of your max HP as true damage, ignoring all your defense.", "You lose 3% HP after each round."),
    new curseInfo("Body Armor", 2, "<:Body_Armor:958114012673998878>", 0, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.def.push(new buffInfo("+", 75, 9999)); // Gains +75 DEF
        ebuff.mr.push(new buffInfo("+", 75, 9999));
        eStats.def += 75;
        eStats.mr += 75;
        notice.push(`\n${curses[2].emblem} **${enemy.name}** has gained **75** DEF`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.def.push(new buffInfo("+", 10, 9999, 10, "+"));
        ebuff.mr.push(new buffInfo("+", 10, 9999, 10, "+"));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/3f2cwmw/Body-Armor.png", "The monster gains +75 DEF and Magic Resist.", "He gains +10 DEF and Magic Resist after each round."),
    new curseInfo("Earth Manipulation", 3, "<:Earth_Manipulation:958114013223469166>", 0, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let sdmg = Math.floor(myStats.hp * 0.2); // Deals 20% of hp as dmg
        myStats.hp -= sdmg;
        notice.push(`\n${curses[3].emblem} **${enemy.name}** has dealt **${sdmg}** damage`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.dodge.push(new buffInfo("*", 0.95, 9999, -0.05, "+")); // Loose 5% dodge chance after each round

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/PzZp0Cf/Earth-Manipulation.png", "You lose 20% of your current HP.", "Your dodge chance decreases by 5% after each round."),
    new curseInfo("Steel Strength", 4, "<:Steel_Strength:958113976821096468>", 1, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.def.push(new buffInfo("+", 100, 4)); // Gains +100 DEF/MR, +5% block rate
        ebuff.mr.push(new buffInfo("+", 100, 4));
        ebuff.br.push(new buffInfo("+", 0.05, 4));
        notice.push(`\n${curses[4].emblem} **${enemy.name}** has gained **100** DEF&MR and **5%** block rate for 4 rounds`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.br.push(new buffInfo("+", 0.01, 9999, 0.01, "+"));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/M2nC4Df/Steel-Strength.png", "The monster gains +100 DEF and Magic Resist, as well as +5% block rate for 4 rounds.", "He gains +1% block rate after each round."),
    new curseInfo("Wind Manipulation", 5, "<:Wind_Manipulation:958114013508681779>", 0, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.dodge.push(new buffInfo("+", 0.05, 4)); // Gains 5% dodge chance
        notice.push(`\n${curses[5].emblem} **${enemy.name}** has gained **5%** dodge chance for 4 rounds`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.dodge.push(new buffInfo("+", 0.01, 9999));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/X7QMCYd/Wind-Manipulation.png", "The monster gains +5% dodge chance for 4 rounds.", "Gains an additional +1% dodge chance after each round."),
    new curseInfo("Water Manipulation", 6, "<:Water_Manipulation:958118298564853761>", 0, 20, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let hhp = Math.floor(eStats.maxhp * 0.08); // Heals 8% of your max HP
        if (eStats.hp + hhp > eStats.maxhp) hhp = eStats.maxhp - eStats.hp;
        let hpt = Math.floor(myStats.maxhp * 0.03); // Heals you for 3% of your max HP
        if (myStats.hp + hpt > myStats.maxhp) hpt = myStats.maxhp - myStats.hp;
        addHeal(eStats, eStats, eStats, mybuff, ebuff, matchStats, notice, ``, hhp, {});
        addHeal(myStats, eStats, eStats, mybuff, ebuff, matchStats, notice, ``, hpt, {});
        notice.push(`\n${curses[6].emblem} **${enemy.name}** has recovered **${hhp}** HP and healed you for **${hpt}** HP`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.hp.push(new buffInfo("*", 1.02, 9999));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/52NZyQ2/Water-Manipulation.png", "The monster heals himself for 8% of his max HP, and heals you for 3% of your max HP as well as a side effect.", "He gains 2% HP after each round."),
    new curseInfo("Shadow Step", 7, "<:Shadow_Step:958127289403600916>", 1, 20, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor((eStats.atk * Math.pow(0.99818, myStats.def)) * (1 - (0.2 * Math.random())) * (Math.random() < eStats.cr ? eStats.cd : 1)); // Deals a guaranteed hit
        myStats.hp -= satk;
        if (myStats.hp < 0) myStats.hp = 0;
        notice.push(`\n${curses[7].emblem} **${enemy.name}** used Shadow Step. Dealt **${satk}** damage`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.cr.push(new buffInfo("+", 0.05, 9999, 0.05, "+"));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/pfYZM1H/Shadow-Step.png", "Ignoring your block rate and dodge chance, the monster deals a guaranteed hit.", "He gains +5% crit rate after each round."),
    new curseInfo("Magic Jamming", 8, "<:Magic_Jamming:958298128195416124>", 0, 35, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor((eStats.md * Math.pow(0.99818, myStats.mr)) * (1 - (0.2 * Math.random())) * (Math.random() < eStats.cr ? eStats.cd : 1)); // Deals magic damage
        myStats.hp -= satk;
        if (myStats.hp < 0) myStats.hp = 0;
        notice.push(`\n${curses[8].emblem} **${enemy.name}** has dealt **${satk}** magic damage`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.mr.push(new buffInfo("+", 100, 9999));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/rkK9tzp/Magic-Jamming.png", "The monster deals magic damage.", "He gains +100 Magic Resist at the start of combat."),
    new curseInfo("Magic Manipulation", 9, "<:Magic_Manipulation:958298062562934814>", 1, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor((eStats.md * Math.pow(0.99818, myStats.mr)) * (1 - (0.2 * Math.random())) * (Math.random() < eStats.cr ? eStats.cd : 1) * 1.5); // Deals 150% magic damage
        myStats.hp -= satk;
        if (myStats.hp < 0) myStats.hp = 0;
        notice.push(`\n${curses[9].emblem} **${enemy.name}** has dealt **${satk}** magic damage`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.mr.push(new buffInfo("+", 300, 9999));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/tC5w90S/Magic-Manipulation.png", "The monster deals 150% Magic Damage.", "He gains +300 Magic Resist at the start of combat."),
    new curseInfo("Ultraspeed Regeneration", 10, "<:Ultraspeed_Regeneration:958298070150443069>", 1, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let hhp = Math.floor(eStats.maxhp * 0.16); // Heals 20% of max HP
        if (eStats.hp + hhp > eStats.maxhp) hhp = eStats.maxhp - eStats.hp;
        addHeal(eStats, eStats, eStats, mybuff, ebuff, matchStats, notice, ``, hhp, {});
        notice.push(`\n${curses[10].emblem} **${enemy.name}** has recovered **${hhp}** HP`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.hp.push(new buffInfo("*", 1.06, 9999));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/k9bKMYr/Ultraspeed-Regeneration.png", "The monster heals 16% of max HP.", "He heals himself for 6% HP after each round."),
    new curseInfo("Gravity Manipulation", 11, "<:Gravity_Manipulation:958314009738764328>", 1, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.br.push(new buffInfo("+", 0.05, 6)); // Gains 5% block rate
        notice.push(`\n${curses[11].emblem} **${enemy.name}** has gained **+5%** block rate for 6 rounds`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.dodge.push(new buffInfo("=", 0, 9999));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/cvQvBxR/Gravity-Manipulation.png", "The monster gains +5% block rate for 6 rounds.", "You can't dodge any of the monsters attacks."),
    new curseInfo("Black Flame", 12, "<:Black_Flame:958739786686947409>", 0, 25, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor(myStats.maxhp * 0.1); // Burns 10% of your max HP
        myStats.hp -= satk;
        if (myStats.hp < 0) myStats.hp = 0;
        notice.push(`\n${curses[12].emblem} **${enemy.name}** has burnt you for **${satk}** HP`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("*", 0.98, 9999, -0.02, "+"));
        ebuff.hp.push(new buffInfo("*", 0.98, 9999, -0.02, "+"));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/1qDLDLP/Black-Flame.png", "Burns 10% of your max HP ignoring your defense.", "Both you and the monster burn for 2% HP after each round."),
    new curseInfo("Body Double", 13, "<:Body_Double:958741540866490378>", 0, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (Math.random() < 0.8) {
            eStats.sm += 60;
        } else {
            matchStats.eStatsCC = { ...eStats }; // Creates a clone of itself
            matchStats.eStatsCC.sm -= (60 + (2 * eStats.mg));
            matchStats.currentOpponent = 1;
            eStats.maxhp = Math.floor(eStats.maxhp * 0.2);
            eStats.hp = eStats.maxhp;
            notice.push(`\n${curses[13].emblem} **${enemy.name}** has created a body double of itself`);
        };

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/TKX8JQp/Body-Double.png", "The monster creates a body double (clone) of itself. You will have to fight the clone until you beat him to continue fighting the real body of the monster.", "None"),
    new curseInfo("Absorb", 14, "<:Absorb:958774653348880484>", 0, 35, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const steal = Math.floor(myStats.maxhp * 0.1); // Steals 10% of your HP
        myStats.hp -= steal;
        if (myStats.hp < 0) myStats.hp = 0;
        addHeal(eStats, eStats, eStats, mybuff, ebuff, matchStats, notice, ``, steal, {});
        if (eStats.hp > eStats.maxhp) eStats.hp = eStats.maxhp;
        notice.push(`\n${curses[14].emblem} **${enemy.name}** stole **${steal}** HP`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/kHW18jq/Absorb.png", "The monster steals 10% of your max HP and adds it to itself.", "None"),
    new curseInfo("Scorched Earth", 15, "<:Scorched_Earth:1502126250594930831>", 2, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (eStats.negateHeal === 1) {
            myStats.burnduration += 3;
            notice.push(`\n${curses[15].emblem} **${enemy.name}** has inflicted **+3** rounds of burn`);
        } else {
            eStats.negateHeal = 1;
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 3, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                eStats.negateHeal = 0;
                return AbilityResponse.SUCCESS;
            }));
            notice.push(`\n${curses[15].emblem} **${enemy.name}** has prevented any heals on you for **2** rounds.`);
        };
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.negateHeal ??= 0;
        mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp * 0.05), 9999));

        // Burn SETUP
        myStats.burntype ??= 1;
        if (typeof myStats.burnduration !== "number") {// Trigger burn every round
            myStats.burnduration = 0;
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                procburn(myStats, eStats, mybuff, ebuff, matchStats, notice, ``, {});

                return AbilityResponse.SUCCESS;
            }, 9999));
        };

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/v4HqPk5R/Scorched-Earth.png", "Disables any healing instances for **2** rounds. If already disabled, instead applies **3** rounds of burn on the player.", "Deals **5%** max HP burn damage every round (DoT)"),
    new curseInfo("Dragon Manipulation", 16, "<:Dragon_Manipulation:1502126144080838749>", 2, 25, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.burnbonus += 0.05;
        myStats.burnduration += 2;
        notice.push(`\n${curses[16].emblem} **${eStats.name}**'s boosted their burn damage by **5%** permanently and inflicted **+2** burn`);
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.burnbonus ??= 0;
        // Burn SETUP
        myStats.burntype ??= 1;
        if (typeof myStats.burnduration !== "number") {// Trigger burn every round
            myStats.burnduration = 0;
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                procburn(myStats, eStats, mybuff, ebuff, matchStats, notice, ``, {});

                return AbilityResponse.SUCCESS;
            }, 9999));
        };

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 5 === 0) {
                eStats.shield += Math.floor(eStats.maxhp * 0.05);
                myStats.burnduration += 2;
                notice.push(`\n${curses[16].emblem} **${eStats.name}** summoned a dragon and inflicted **+2** rounds of burn`);
            };

            return AbilityResponse.SUCCESS;
        }, 9999));


        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/xSbCKt0Y/c.png", "Permanently increases burn damage by **5%**, then applies **2** rounds of burn.", "Every **5** rounds, summons a dragon, gaining a **5%** max HP shield and inflicting **+2** rounds of burn."),
    new curseInfo("Mermaid Murmur", 17, "<:Mermaid_Murmur:1502126075117834310>", 2, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Get user inventory to check for megalodon
        const inv = await getUserSchema(matchStats.user);
        if (!inv) {
            eStats.sm += 30;
            return AbilityResponse.FAILURE;
        };

        // Count megalodon in user's inventory
        const megalodonCount = inv.items[684] || 0; // 684 is the ID for megalodon
        let atkScale = 0.8 + Math.min(0.1 * megalodonCount, 0.3);
        dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `${curses[17].emblem} **${eStats.name}**`, { atkMultiplier: atkScale, magicDamage: true });

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.mg += 4;
        ebuff.mg.push(new buffInfo("+", 4, 9999));
        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 6 === 0) {
                eStats.shield += Math.floor((eStats.maxhp - eStats.hp) * 0.08);
                notice.push(`\n${curses[17].emblem} **${eStats.name}** gained a shield equal to **8%** of missing HP`);
            };

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/N2rqxdnq/content.png", "Deals **80%** damage (**+10%** damage scaling for every Megalodon owned, up to 30%)", "Regenerates **+4** mana every round, and generates a shield equal to **8%** of missing HP every **6** rounds"),
    new curseInfo("Chilling Cold", 18, "<:Chilling_Cold:1503414323857330357>", 2, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `${curses[18].emblem} **${eStats.name}**`, { atkMultiplier: 0.8, magicDamage: true });
        myStats.atk -= Math.floor(myStats.atk * 0.2);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodge = 0;
        myStats.counter = 0;
        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.dodge = 0;
            myStats.counter = 0;

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/V00vC39f/Chilling-Cold.png", "Deals **80%** damage and reduces opponent's ATK by **20%** for **1** round", "The opponent is slowed, unable to dodge, and have counter attempts removed at the start of a round."),
    new curseInfo("Malevolent Shrine", 19, "<:Malevolent_Shrine:1509926471643299880>", 2, 80, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.rev > 0) {
            myStats.rev = 0;
            notice.push(`\n<:Malevolent_Shrine:1509926471643299880> **${char.name}** can no longer revive`);
        } else {
            eStats.atk += Math.floor(eStats.atk * 0.12);
            eStats.md += Math.floor(eStats.md * 0.12);
            ebuff.atk.push(new buffInfo("*", 1.12, 9999));
            ebuff.md.push(new buffInfo("*", 1.12, 9999));
            notice.push(`\n<:Malevolent_Shrine:1509926471643299880> **${enemy.name}** gains **12%** ATK & MD`);
        };

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round === 15) {
                myStats.hp = 0;
                myStats.forceLoose = true;
                notice.push(`\n<:Malevolent_Shrine:1509926471643299880> **${enemy.name}** cuts the battle short...`);
            };

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/HTjy80NQ/image0-1.png", "Removes any revival attempts on the opponent. If they have none, instead boosts ATK & MD by **12%** permanently", "Unleashes a sure-hit domain on round **15**, instantly killing the opponent"),
    new curseInfo("Omni Barrier", 20, "<:Omni_Barrier:1514109158134255716>", 2, 80, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.counter += 3;
        notice.push(`\n<:Omni_Barrier:1514109158134255716> **${enemy.name}** gains **3** counter attempts`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.counter ??= 0;
        eStats.damageReduction ??= 0;
        eStats.damageReduction += 0.33;

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/nMnW7jVy/content.png", "Counters the next **3** attacks", "Takes **33%** less damage"),
    new curseInfo("Despair", 21, "<:Despair:1514117174367621190>", 2, 80, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `${curses[21].emblem} **${eStats.name}**`, { overwriteDamage: myStats.maxhp * 0.05, magicDamage: true });
        myStats.def -= Math.floor(myStats.def * 0.1);
        myStats.mr -= Math.floor(myStats.mr * 0.1);
        mybuff.def.push(new buffInfo("*", 0.9, 9999));
        mybuff.mr.push(new buffInfo("*", 0.9, 9999));
        notice.push(`\n<:Despair:1514117174367621190> **${enemy.name}** decreases your DEF and MR by **10%**`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 3 === 0) {
                myStats.def -= Math.floor(myStats.def * 0.1);
                myStats.mr -= Math.floor(myStats.mr * 0.1);
                mybuff.def.push(new buffInfo("*", 0.9, 9999));
                mybuff.mr.push(new buffInfo("*", 0.9, 9999));
                notice.push(`\n<:Despair:1514117174367621190> The despair continues to eat away your defenses...`);
            };
            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/ynCJ3jsY/despair-1.png", "Deals **5%** of your max HP, then decreases your DEF & MR by **10%** permanently.", "Decreases your DEF & MR by **10%** every **3** rounds."),
    new curseInfo("Trial of Sagacity", 22, "<:Trial_of_Sagacity:1514782002572955759>", 2, 100, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.sm >= 100) {
            myStats.sm -= 100;
            eStats.sm += 100;
            if (eStats.sm > eStats.mana) eStats.sm = eStats.mana;
            notice.push(`\n${curses[22].emblem} **${enemy.name}** sapped **100** mana from you`);
        } else {
            const hpLoss = Math.floor(myStats.maxhp * 0.1);
            myStats.maxhp -= hpLoss;
            if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
            notice.push(`\n${curses[22].emblem} **${enemy.name}** reduced your max HP by **10%**`);
        };

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mg += 10;
        eStats.mg += 20;
        mybuff.mg.push(new buffInfo("+", 10, 9999));
        ebuff.mg.push(new buffInfo("+", 20, 9999));
        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round === 15) {
                eStats.mg += myStats.mg;
                ebuff.mg.push(new buffInfo("+", myStats.mg, 9999));
                myStats.mg = 0;
                mybuff.mg.push(new buffInfo("=", 0, 9999));
                notice.push(`\n${curses[22].emblem} **${enemy.name}** absorbed all your mana-regen!`);
            };
            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/nM7pMPz9/content-1.png", "Saps **100** 💧 from you. If you have less than **100** 💧, instead reduces your max HP by **10%**.", "The monster and you have **+20** and **+10** mana-regen respectively. On round **15**, the monster gains all your mana-regen, while yours is set to **0**."),
    new curseInfo("Bane of the Powerful", 23, "<:Bane_of_the_Powerful:1516679506255937619>", 2, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        const baneClvl = matchStats.baneClvl ?? myStats.lvl;
        const dmg = baneClvl * 100;
        if (dmg >= myStats.hp) {
            myStats.hp = 1;
        } else {
            myStats.hp -= dmg;
        };
        notice.push(`\n<:Bane_of_the_Powerful:1516679506255937619> **${enemy.name}** judges your power — **${dmg}** absolute damage`);
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.baneClvl ??= myStats.lvl;
        const baneStats = await getUserSchema(user.id);
        matchStats.baneLvl ??= baneStats ? userLevel(baneStats.xp) : myStats.lvl;
        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 10 === 0) {
                const baneLvl = matchStats.baneLvl ?? myStats.lvl;
                const dmg = baneLvl * 100;
                myStats.hp -= dmg;
                if (myStats.hp < 0) myStats.hp = 0;
                notice.push(`\n<:Bane_of_the_Powerful:1516679506255937619> The weight of your power crushes you, dealing **${dmg}** absolute damage`);
            };
            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, "https://i.ibb.co/TB4q2B0q/Bane-of-the-Powerful.png", "Deals **character level × 100** true, undodgeable, unblockable, absolute damage. If it would kill, leaves the player at **1 HP**.", "Deals **profile level × 100** true, undodgeable, unblockable, absolute damage once every **10** rounds. Can kill."),
];
