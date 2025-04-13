import { ClassAbility } from "../types";
import buffInfo from "./buffs";
import { AbilityResponse } from "./components";
import { addHeal } from "./functions";

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
        addHeal(eStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, heal, {});
        notice.push(`\n${curses[0].emblem} **${enemy.name}** has recovered **${heal}** HP`);

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
];
