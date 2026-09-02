

import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { dealDamage, addHeal, noTimeout, procburn, userLevel } from "./functions";
import { items } from "./items";
import buffInfo from "./buffs";
import delayedBuffs from "./delayedBuffs";
import { Buffs, CharacterRarity, ClassAbility, IskillInfo } from "../types";
import { getUserSchema } from "./queries";
import { AbilityResponse } from "./components";

export default class skillInfo implements IskillInfo {
    private _id: number;
    private _cost: number;
    private _skill: ClassAbility;
    private _passive: ClassAbility;
    private _list: any[];

    constructor(id: number, cost: number, skill: ClassAbility, passive: ClassAbility = async () => AbilityResponse.SUCCESS, list: any[] = []) {
        this._id = id;
        this._cost = cost;
        this._skill = skill;
        this._passive = passive;
        this._list = list;
    };

    get id() {
        return this._id;
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
    get list() {
        return this._list;
    };

    set list(lis: any[]) {
        this._list = lis ?? [];
    };
};

export const skills: skillInfo[] = [
    new skillInfo(0, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Warrior deals 125% damage
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: 1.25 });
        matchStats.turn = matchStats.turnSkill;

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(1, 35, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Knight reduces enemy ATK by 15% for 3 rounds
        ebuff.atk.push(new buffInfo("*", 0.85, 2));
        let dnum = Math.floor(eStats.atk * 0.15);
        eStats.atk = Math.floor(eStats.atk * 0.85);
        notice.push(`\n⚜️ **${char.name}** has reduced enemy ATK by **${dnum}**`);

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(2, 20, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Archer increases crit rate by +10% for 2 rounds
        mybuff.cr.push(new buffInfo("+", 0.1, 1));
        myStats.cr += 0.1;
        notice.push(`\n⚜️ **${char.name}** has increased ${char.gender === "F" ? "her" : "his"} Crit Rate by **10%**`);

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(3, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Gunner reduces DEF by 30% for the attack and deals true damage
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { ignoreShield: true, defMultiplier: 0.7 });

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(4, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Martial Artist increases dodge by +20% for 2 rounds
        mybuff.dodge.push(new buffInfo("+", 0.2, 1));
        myStats.dodge += 0.2;
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} dodge chance by **20%**`);

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(5, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Fighter increases atk by 15%, decreases DEF by 10% for 2 rounds
        mybuff.atk.push(new buffInfo("*", 1.15, 1));
        mybuff.def.push(new buffInfo("*", 0.9, 1));
        myStats.atk = Math.floor(myStats.atk * 1.15);
        myStats.def = Math.floor(myStats.def * 0.9);
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} ATK by **15%** and decreased DEF by **10%** for 2 rounds`);

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(6, 45, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Assassin deals a guaranteed critical hit
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { critChance: 0 });

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(7, 25, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Thief deals 80% ATK and heals himself for 30% of the damage dealt
        matchStats.turn = matchStats.turnSkill;
        let dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: 0.8 });
        let sheal = Math.floor(dmg * 0.3);
        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, sheal, {});
        if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
        if (!eStats.negateHeal) notice.push(`\n⚜️ **${char.name}** restored **${sheal}** HP`);

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(8, 25, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Mage deals 115% Magic Damage
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: 1.15, magicDamage: true, mdChance: 0 });

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mdChance = 1;

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(9, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Priest heals 20% of max HP
        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp / 5), {});
        if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
        if (!eStats.negateHeal) notice.push(`\n⚜️ **${char.name}** has restored **${Math.floor(myStats.maxhp / 5)}** HP`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mdChance = 1;

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(10, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Necromancer summons an undead
        matchStats.myStatsCC = { ...myStats };
        matchStats.currentCharacter = 1;

        embed.setThumbnail("https://i.ibb.co/SVKxHF4/s.png");
        myStats.hp = Math.floor(myStats.maxhp * 0.4);
        myStats.maxhp = Math.floor(myStats.maxhp * 0.4);
        myStats.atk = Math.floor(myStats.atk * 0.4);
        myStats.def = Math.floor(myStats.def * 0.4);
        myStats.md = Math.floor(myStats.md * 0.4);
        myStats.mr = Math.floor(myStats.mr * 0.4);
        myStats.mana = 30;
        myStats.mg = 0;

        notice.push(`\n⚜️ **${char.name}** summoned a Skeleton!`);

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(11, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Duelist counters the next attack
        matchStats.turn = matchStats.turnSkill;
        if (myStats.classUsedRound > matchStats.round - 3) {
            myStats.sm += 50;
            noTimeout(matchStats, myStats);
            matchStats.sendWarning({ content: `Duelist ability can only be used once every 3 rounds.`, ephemeral: true });
            return AbilityResponse.FAILURE;
        };
        myStats.counter = 1;
        notice.push(`\n⚜️ **${char.name}** prepares to counter the next attack`);
        myStats.classUsedRound = matchStats.round;

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(12, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Mercenary gains 15% ATK for 3 rounds. Player gets 20 coins every time ; Used once per round at most
        if (myStats.classUsedRound === matchStats.round) {
            myStats.sm += 40;
            noTimeout(matchStats, myStats);
            matchStats.sendWarning({ content: `Mercenary ability can only be used once every round.`, ephemeral: true });
            return AbilityResponse.FAILURE;
        };

        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.15), 2));
        myStats.atk += Math.floor(myStats.atk * 0.15);
        matchStats.loot += 20;
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} ATK by **15%** for 3 rounds. Added **+20** coins to your loot`);
        myStats.classUsedRound = matchStats.round;

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(13, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Holy Knight gains +280 DEF and Magic Resist for 2 rounds
        matchStats.turn = matchStats.turnSkill;
        mybuff.def.push(new buffInfo("+", 280, 2));
        mybuff.mr.push(new buffInfo("+", 280, 2));
        myStats.def += 280;
        myStats.mr += 280;
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} DEF and Magic Resist by **280** for 3 rounds`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.03), 9999));

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(14, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Dark Knight decreses all enemy stats by 10% for 3 rounds
        eStats.atk = Math.floor(eStats.atk * 0.9);
        eStats.def = Math.floor(eStats.def * 0.9);
        eStats.md = Math.floor(eStats.md * 0.9);
        eStats.mr = Math.floor(eStats.mr * 0.9);
        eStats.cr = eStats.cr * 0.9;
        eStats.cd = eStats.cd * 0.9;
        eStats.br = eStats.br * 0.9;
        eStats.dodge = eStats.dodge * 0.9;

        ebuff.atk.push(new buffInfo("*", 0.9, 2));
        ebuff.def.push(new buffInfo("*", 0.9, 2));
        ebuff.md.push(new buffInfo("*", 0.9, 2));
        ebuff.mr.push(new buffInfo("*", 0.9, 2));
        ebuff.cr.push(new buffInfo("*", 0.9, 2));
        ebuff.cd.push(new buffInfo("*", 0.9, 2));
        ebuff.br.push(new buffInfo("*", 0.9, 2));
        ebuff.dodge.push(new buffInfo("*", 0.9, 2));

        notice.push(`\n⚜️ **${char.name}** decreased all enemy stats by **10%** for 3 rounds`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.hp.push(new buffInfo("+", -Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.02), 9999));

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(15, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Hunter deals 120% dmg and poisons the enemy for 2 rounds
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: 1.2 });
        ebuff.hp.push(new buffInfo("+", Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.04), 2));
        notice.push(`\n⚜️ **${char.name}** poisoned the enemy for 2 rounds`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("*", 1.02, 9999));

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(16, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Death Knight decreses all enemy stats by 20% for 3 rounds
        eStats.atk = Math.floor(eStats.atk * 0.8);
        eStats.def = Math.floor(eStats.def * 0.8);
        eStats.md = Math.floor(eStats.md * 0.8);
        eStats.mr = Math.floor(eStats.mr * 0.8);
        eStats.cr = eStats.cr * 0.8;
        eStats.cd = eStats.cd * 0.8;
        eStats.br = eStats.br * 0.8;
        eStats.dodge = eStats.dodge * 0.8;

        ebuff.atk.push(new buffInfo("*", 0.8, 2));
        ebuff.def.push(new buffInfo("*", 0.8, 2));
        ebuff.md.push(new buffInfo("*", 0.8, 2));
        ebuff.mr.push(new buffInfo("*", 0.8, 2));
        ebuff.cr.push(new buffInfo("*", 0.8, 2));
        ebuff.cd.push(new buffInfo("*", 0.8, 2));
        ebuff.br.push(new buffInfo("*", 0.8, 2));
        ebuff.dodge.push(new buffInfo("*", 0.8, 2));

        notice.push(`\n⚜️ **${char.name}** decreased all enemy stats by **20%** for 3 rounds`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.hp.push(new buffInfo("+", -Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.03), 9999));
        ebuff.dodge.push(new buffInfo("*", 0.8, 9999));

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(17, 45, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Arbalist deals 150% dmg and poisons the enemy for 3 rounds
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: 1.5 });
        const dmg = Math.floor(eStats.hp > 2 * myStats.hp ? myStats.hp * 0.1 : eStats.hp * 0.05);
        ebuff.hp.push(new buffInfo("+", -dmg, 3));
        notice.push(`\n⚜️ **${char.name}** poisoned the enemy for 3 rounds`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("*", 1.04, 9999));

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(18, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Marksman deals a guaranteed hit with increased crit rate (+12.5%)
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { critChance: 0, critBuff: 0.125 });

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.cd.push(new buffInfo("+", 0.02, 9999, 0.02, "+", 0.2));

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(19, 20, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Ranger deals a guaranteed hit with increased crit rate (+20%)
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { block: false, dodge: false, magicDamage: true, critBuff: 0.2 });

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.cd.push(new buffInfo("+", 0.03, 9999, 0.03, "+", 0.3));

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(20, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Shooter deals a guaranteed critical hit
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { magicDamage: true, critChance: 0 });

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(21, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Sniper deals a critical hit with increased crit damage (+20%)
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: 1.2, magicDamage: true, critChance: 0 });

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.cr.push(new buffInfo("+", 0.02, 9999, 0.02, "+"));

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(22, 55, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Ki Master ignores 25% of DEF
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}** ignored **25%** DEF and`, { defMultiplier: 0.75 });

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mdChance = 0.2;

        return AbilityResponse.SUCCESS;
    }),


    // new skillInfo(23, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
    //     // Soulfist ignores 40% of DEF
    //     dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}** ignored **40%** DEF and`, { defMultiplier: 0.6 });
    //     matchStats.turn = matchStats.turnSkill;
    // }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
    //     myStats.mdChance = 0.33;
    // }),

    new skillInfo(23, 100, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Soulfist 
        if (myStats.classUsed >= 1) {
            myStats.sm += 100;
            noTimeout(matchStats, myStats);
            matchStats.sendWarning({ content: `Soulfist skill can only be used 1 time.`, ephemeral: true });
            return AbilityResponse.FAILURE;
        };
        myStats.classUsed ||= 0;
        myStats.classUsed++;

        // 50% damage mitigation
        myStats.damageReduction = Math.max(0.5, myStats.damageReduction);

        matchStats.on("attack", { // When attacked, deal 120% damage and triggers counter effects twice
            maxRound: 10,
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === eStats && target === myStats && myStats.soulfistCap < 2 && myStats.counterchance > 0) {
                    let dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}** retaliated and`, { atkMultiplier: 1.2 });
                    matchStats.trigger("counter", eStats, myStats, ebuff, mybuff, { damage: dmg });
                    matchStats.trigger("counter", eStats, myStats, ebuff, mybuff, { damage: dmg });
                    myStats.soulfistCap++;
                };
            }
        });

        // Change counter chance
        //myStats.counterchanceBeforeActive = myStats.counterchance;
        //myStats.counterchance = 1;
        //matchStats.playerPausingRounds = 3;

        // After the domain
        myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 10, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            //myStats.counterchance = myStats.counterchanceBeforeActive;
            const shred = 0.2;//Math.min(0.4, myStats.counterchance);
            ebuff.def.push(new buffInfo("+", -Math.min(eStats.def * shred, 872), 9999));
            ebuff.mr.push(new buffInfo("+", -Math.min(eStats.mr * shred, 872), 9999));
            eStats.def -= Math.floor(Math.min(eStats.def * shred, 872));
            eStats.mr -= Math.floor(Math.min(eStats.mr * shred, 872));
            myStats.damageReduction = 0;
            notice.push(`\n⚜️ **${char.name}** has exited __Dormant Sage__ and decreased the enemy's DEF/MR by **${shred * 100}**%.`);

            //if (myStats.counterchance > 0.4) {
            //mybuff.cd.push(new buffInfo("+", Math.min(0.2, myStats.counterchance - 0.4), 9999));
            //};

            myStats.counterchance = 0;
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.counterchance = 0;
                return AbilityResponse.SUCCESS;
            }));

            return AbilityResponse.SUCCESS;
        }));

        notice.push(`\n⚜️ **${char.name}** has entered __Dormant Sage__ for **10** turns.`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.soulfistCap = 0;
        myStats.soulfistBuff = 0;
        myStats.counterchance = 0.2;
        myStats.soulfistLastHeal = -1;
        myStats.counter ??= 0;
        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.soulfistCap = 0;
            if (myStats.counterchance > Math.random()) myStats.counter += 1;
            return AbilityResponse.SUCCESS;
        }, 9999));

        matchStats.on("counter", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (target == myStats && myStats.soulfistBuff < 5) {
                mybuff.atk.push(new buffInfo("*", 1.05, 9999));
                mybuff.md.push(new buffInfo("*", 1.05, 9999));
                myStats.soulfistBuff++;
            } else {
                if (myStats.soulfistLastHeal !== matchStats.round) {
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.05 * Math.min(matchStats.round - myStats.soulfistLastHeal, 5)), {});
                    myStats.soulfistLastHeal = matchStats.round;
                };
            };
        });

        return AbilityResponse.SUCCESS;
    }),



    new skillInfo(24, 20, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Twinshot increases ATK and MD by +30
        myStats.atk += 30, myStats.md += 30;
        mybuff.atk.push(new buffInfo("+", 30, 9999));
        mybuff.md.push(new buffInfo("+", 30, 9999));
        notice.push(`\n⚜️ **${char.name}** increased ATK and Magic Damage by **+30**`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.twinshot += 0.33;

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(25, 65, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Beast Lord summons a beast
        matchStats.myStatsCC = { ...myStats };
        matchStats.currentCharacter = 1;

        embed.setThumbnail("https://i.ibb.co/fYZgkyJ/b.png");
        myStats.hp = Math.floor(myStats.maxhp * 0.75);
        myStats.maxhp = Math.floor(myStats.maxhp * 0.75);
        myStats.atk = Math.floor(myStats.atk * 0.6);
        myStats.def = Math.floor(myStats.def * 0.75);
        myStats.md = Math.floor(myStats.md * 0.75);
        myStats.mr = Math.floor(myStats.mr * 0.75);
        myStats.mana = 40;
        myStats.mg = 0;

        notice.push(`\n⚜️ **${char.name}** summoned a beast!`);

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(26, 45, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Bishop heals 20% of max HP
        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp / 5), {});
        if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
        if (!eStats.negateHeal) notice.push(`\n⚜️ **${char.name}** has restored **${Math.floor(myStats.maxhp / 5)}** HP`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("*", 1.03, 9999));

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(27, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Saint heals 40/36/32/...% of max HP
        let hhp = Math.floor(myStats.maxhp * (0.4 - (matchStats.saintCount++ * 0.04)));
        if (hhp < 1) {
            notice.push(`\n⚜️ **${char.name}** has reached ${char.gender === "F" ? "her" : "his"} limit`);
            myStats.sm += 40;
            return AbilityResponse.FAILURE;
        };
        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, hhp, { showNotif: true });
        mybuff.mg.push(new buffInfo("+", -2, 9999));
        myStats.mg -= 2;
        if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
        if (!eStats.negateHeal) notice.push(`\n⚜️ **${char.name}** has restored **${hhp}** HP`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("*", 1.05, 9999));
        myStats.rev = 1;
        myStats.revhp = 0.5;
        myStats.maxRevivals += 1;
        matchStats.saintCount = 0;

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(28, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Traditionalist deals true damage and ignores 45% of DEF
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { ignoreShield: true, defMultiplier: 0.3 });

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("*", 1.03, 9999, 0.03, "+", 1.45));

        return AbilityResponse.SUCCESS;
    }),


    // new skillInfo(29, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
    //     // Asura deals more damage with less HP
    //     if (Math.random() > 0.2) dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: (2.5 - myStats.hp / myStats.maxhp), selfdmg: true });
    //     else dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: (2.5 - myStats.hp / myStats.maxhp), magicDamage: true, mdChance: -1, selfdmg: true });
    //     matchStats.turn = matchStats.turnSkill;
    // }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
    //     mybuff.atk.push(new buffInfo("*", 1.04, 9999, 0.04, "+", 1.32));
    //     mybuff.md.push(new buffInfo("*", 1.04, 9999, 0.04, "+", 1.32));
    //     // matchStats.selfdmg = 0.1;
    // }),

    new skillInfo(29, 80, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Asura
        matchStats.turn = matchStats.turnSkill;
        if (myStats.classUsed >= 12) {
            myStats.sm += 40;
            noTimeout(matchStats, myStats);
            matchStats.sendWarning({ content: `Asura ability can only be used 12 times.`, ephemeral: true });
            return AbilityResponse.FAILURE;
        };

        const heal = myStats.asuraMaxHp * 0.1;
        myStats.maxhp = Math.floor(myStats.maxhp + heal);
        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, heal, {});

        notice.push(`\n⚜️ **${char.name}** recovered and increased max HP by **${heal}**`);
        myStats.classUsed = myStats.classUsed + 1 || 1;

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.isAbilityBlocked = true;
        myStats.asuraMaxHp = myStats.maxhp;

        myStats.replaceButton.atk = {
            "run": async (myStats: any, myStatsFixed: any, eStats: any, mybuff: any, ebuff: any, char: any, enemy: any, matchStats: any, notice: any, embed: any, user: any, ...list: any) => {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { magicDamage: false, combodmg: true, selfdmg: true, selfheal: true });

                myStats.maxhp = Math.floor(myStats.maxhp - (myStats.asuraMaxHp * 0.05));
                if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;

                mybuff.atk.push(new buffInfo("*", 1.08, 9999));

                return AbilityResponse.SUCCESS;
            },
        };

        mybuff.br.push(new buffInfo("=", 0, 9999));
        mybuff.dodge.push(new buffInfo("=", 0, 9999));

        return AbilityResponse.SUCCESS;
    }),


    new skillInfo(30, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Outlaw steals the equivalent of 10% of his stats from the enemy for 3 rounds
        if (myStats.classUsedRound > matchStats.round - 5) {
            myStats.sm += 40;
            noTimeout(matchStats, myStats);
            matchStats.sendWarning({ content: `Outlaw ability can only be used once every 5 rounds.`, ephemeral: true });
            return AbilityResponse.FAILURE;
        };

        matchStats.turn = matchStats.turnSkill;
        const satk = Math.min(Math.floor(myStats.atk * 0.1), eStats.atk); eStats.atk -= satk; myStats.atk += satk;
        const sdef = Math.min(Math.floor(myStats.def * 0.1), eStats.def); eStats.def -= sdef; myStats.def += sdef;
        const smd = Math.min(Math.floor(myStats.md * 0.1), eStats.md); eStats.md -= smd; myStats.md += smd;
        const smr = Math.min(Math.floor(myStats.mr * 0.1), eStats.mr); eStats.mr -= smr; myStats.mr += smr;
        const sdodge = Math.min(Math.floor(myStats.dodge * 10) / 100, eStats.dodge); eStats.dodge -= sdodge; myStats.dodge += sdodge;
        const scr = Math.min(Math.floor(myStats.cr * 10) / 100, eStats.cr); eStats.cr -= scr; myStats.cr += scr;
        const scd = Math.min(Math.floor(myStats.cd * 10) / 100, eStats.cd); eStats.cd -= scd; myStats.cd += scd;
        const sbr = Math.min(Math.floor(myStats.br * 10) / 100, eStats.br); eStats.br -= sbr; myStats.br += sbr;

        ebuff.atk.push(new buffInfo("+", -satk, 3)); mybuff.atk.push(new buffInfo("+", satk, 3));
        ebuff.def.push(new buffInfo("+", -sdef, 3)); mybuff.def.push(new buffInfo("+", sdef, 3));
        ebuff.md.push(new buffInfo("+", -smd, 3)); mybuff.md.push(new buffInfo("+", smd, 3));
        ebuff.mr.push(new buffInfo("+", -smr, 3)); mybuff.mr.push(new buffInfo("+", smr, 3));
        ebuff.dodge.push(new buffInfo("+", -sdodge, 3)); mybuff.dodge.push(new buffInfo("+", sdodge, 3));
        ebuff.cr.push(new buffInfo("+", -scr, 3)); mybuff.cr.push(new buffInfo("+", scr, 3));
        ebuff.cd.push(new buffInfo("+", -scd, 3)); mybuff.cd.push(new buffInfo("+", scd, 3));
        ebuff.br.push(new buffInfo("+", -sbr, 3)); mybuff.br.push(new buffInfo("+", sbr, 3));

        notice.push(`\n⚜️ **${char.name}** stole the equivalent of **10%** of his stats from the enemy for 3 rounds`);
        myStats.classUsedRound = matchStats.round;

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.selfhealChance.push(0.33);
        myStats.selfheal.push(0.1);

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(31, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Rogue steals the equivalent of 16% of his stats from the enemy for 4 rounds
        if (myStats.classUsed >= 6) {
            myStats.sm += 40;
            noTimeout(matchStats, myStats);
            matchStats.sendWarning({ content: `Rogue ability can only be used 6 times.`, ephemeral: true });
            return AbilityResponse.FAILURE;
        };
        if (myStats.classUsedRound > matchStats.round - 5) {
            myStats.sm += 40;
            noTimeout(matchStats, myStats);
            matchStats.sendWarning({ content: `Rogue ability can only be used once every 5 rounds.`, ephemeral: true });
            return AbilityResponse.FAILURE;
        };

        matchStats.turn = matchStats.turnSkill;
        const satk = Math.min(Math.floor(myStats.atk * 0.2), eStats.atk); eStats.atk -= satk; myStats.atk += satk;
        const sdef = Math.min(Math.floor(myStats.def * 0.2), eStats.def); eStats.def -= sdef; myStats.def += sdef;
        const smd = Math.min(Math.floor(myStats.md * 0.2), eStats.md); eStats.md -= smd; myStats.md += smd;
        const smr = Math.min(Math.floor(myStats.mr * 0.2), eStats.mr); eStats.mr -= smr; myStats.mr += smr;
        const sdodge = Math.min(Math.floor(myStats.dodge * 20) / 100, eStats.dodge); eStats.dodge -= sdodge; myStats.dodge += sdodge;
        const scr = Math.min(Math.floor(myStats.cr * 20) / 100, eStats.cr); eStats.cr -= scr; myStats.cr += scr;
        const scd = Math.min(Math.floor(myStats.cd * 20) / 100, eStats.cd); eStats.cd -= scd; myStats.cd += scd;
        const sbr = Math.min(Math.floor(myStats.br * 20) / 100, eStats.br); eStats.br -= sbr; myStats.br += sbr;

        ebuff.atk.push(new buffInfo("+", -satk, 4)); mybuff.atk.push(new buffInfo("+", satk, 4));
        ebuff.def.push(new buffInfo("+", -sdef, 4)); mybuff.def.push(new buffInfo("+", sdef, 4));
        ebuff.md.push(new buffInfo("+", -smd, 4)); mybuff.md.push(new buffInfo("+", smd, 4));
        ebuff.mr.push(new buffInfo("+", -smr, 4)); mybuff.mr.push(new buffInfo("+", smr, 4));
        ebuff.dodge.push(new buffInfo("+", -sdodge, 4)); mybuff.dodge.push(new buffInfo("+", sdodge, 4));
        ebuff.cr.push(new buffInfo("+", -scr, 4)); mybuff.cr.push(new buffInfo("+", scr, 4));
        ebuff.cd.push(new buffInfo("+", -scd, 4)); mybuff.cd.push(new buffInfo("+", scd, 4));
        ebuff.br.push(new buffInfo("+", -sbr, 4)); mybuff.br.push(new buffInfo("+", sbr, 4));

        notice.push(`\n⚜️ **${char.name}** stole the equivalent of **20%** of his stats from the enemy for 4 rounds`);
        myStats.classUsed = myStats.classUsed + 1 || 1;
        myStats.classUsedRound = matchStats.round;

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.selfhealChance.push(0.66);
        myStats.selfheal.push(0.1);

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(32, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Barbarian deals 10% more damage after every round
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: (1 + Math.min(matchStats.round * 0.1, 1)) });

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("*", 0.97, 9999));

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(33, 45, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Berserker deals 20% more damage after every round
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: (1 + Math.min(matchStats.round * 0.2, 1.4)) });

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("*", 0.98, 9999));

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(34, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Deathblade deals 150% dmg and causes bleeding for 2 rounds
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: 1.5 });
        ebuff.hp.push(new buffInfo("+", -Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.05), 2));
        notice.push(`\n⚜️ **${char.name}** caused bleeding for 2 rounds`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.critbleed = true;
        myStats.critbleedlast = 2;

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(35, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Reaper deals 120% true damage and causes bleeding for 3 rounds
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: 1.2, ignoreShield: true });
        ebuff.hp.push(new buffInfo("+", -Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.05), 3));
        notice.push(`\n⚜️ **${char.name}** caused bleeding for 3 rounds`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.critbleed = true;
        myStats.critbleedlast = 3;

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(36, 45, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Cleric deals more dmg in dungeon
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: (list[0] === "arena" ? 1.1 : 1.2), magicDamage: true, mdChance: -1 });

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (list[0] !== "arena") mybuff.atk.push(new buffInfo("*", 1.05, 9999));
        mybuff.hp.push(new buffInfo("*", 1.05, 9999));

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(37, 45, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Sage deals more dmg in dungeon
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: (list[0] === "arena" ? 1.15 : 1.3), magicDamage: true, mdChance: -1 });

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        //if (list[0] !== "arena") mybuff.atk.push(new buffInfo("*", 1.1, 9999));
        //mybuff.hp.push(new buffInfo("*", 1.05, 9999));
        myStats.increaseHealing ??= 0;
        myStats.increaseHealing += 0.15;
        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.05), {});
        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.05), {});

            return AbilityResponse.SUCCESS;
        }, 9999));
        mybuff.md.push(new buffInfo("*", 1.03, 9999, 0.03, "+", 1.52));


        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(38, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Shadowhunter blocks dodge, br and cr
        eStats.dodge = 0, eStats.br = 0, eStats.cr = 0;

        ebuff.dodge.push(new buffInfo("=", 0, 1));
        ebuff.br.push(new buffInfo("=", 0, 1));
        ebuff.cr.push(new buffInfo("=", 0, 1));

        notice.push(`\n⚜️ **${char.name}** has blocked **${enemy.name}** from blocking, dodging and critting for the next 2 rounds.`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.atk.push(new buffInfo("*", 0.97, 9999));
        myStats.mdChance = 0.2;

        return AbilityResponse.SUCCESS;
    }),


    // new skillInfo(39, 0, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
    //     // Demonic buffs himself by 33% and consumes mana every round
    //     if (myStats.consumeMana) {
    //         myStats.heap1.forEach((e) => {
    //             mybuff[e.type].forEach((a, i) => {
    //                 if (a.id === e.id) mybuff[e.type].splice(i, 1);
    //             });
    //             if (e.type === "mg") myStats[e.type] += e.buff;
    //             else myStats[e.type] -= e.buff;
    //         });
    //         myStats.consumeMana = 0;
    //         myStats.heap1 = [];
    //         notice.push(`\n⚜️ **${char.name}** stopped ${char.gender === "F" ? "her" : "his"} transformation`);
    //     } else {
    //         if (myStats.sm < 25) return matchStats.sendWarning({ content: "You need at least **25**\\💧 to sustain this form", ephemeral: true });
    //         myStats.consumeMana = 25;

    //         let atkbuff = new buffInfo("+", Math.floor(myStats.atk * 0.33), "9999");
    //         let defbuff = new buffInfo("+", Math.floor(myStats.def * 0.33), "9999");
    //         let mdbuff = new buffInfo("+", Math.floor(myStats.md * 0.33), "9999");
    //         let mrbuff = new buffInfo("+", Math.floor(myStats.mr * 0.33), "9999");
    //         let mgbuff = new buffInfo("=", 0, "9999");

    //         mybuff.atk.push(atkbuff);
    //         mybuff.def.push(defbuff);
    //         mybuff.md.push(mdbuff);
    //         mybuff.mr.push(mrbuff);
    //         mybuff.mg.push(mgbuff);
    //         myStats.heap1 = [{ type: "atk", id: atkbuff.id, buff: Math.floor(myStats.atk * 0.33) }, { type: "def", id: defbuff.id, buff: Math.floor(myStats.def * 0.33) }, { type: "md", id: mdbuff.id, buff: Math.floor(myStats.md * 0.33) }, { type: "mr", id: mrbuff.id, buff: Math.floor(myStats.mr * 0.33) }, { type: "mg", id: mgbuff.id, buff: myStats.mg }];

    //         myStats.atk += Math.floor(myStats.atk * 0.33);
    //         myStats.def += Math.floor(myStats.def * 0.33);
    //         myStats.md += Math.floor(myStats.md * 0.33);
    //         myStats.mr += Math.floor(myStats.mr * 0.33);
    //         myStats.mg = 0;

    //         notice.push(`\n⚜️ **${char.name}** entered demon mode`);
    //     };
    // }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
    //     if (list[0] === "arena") myStats.atk = Math.floor(myStats.atk * 1.1);
    //     ebuff.atk.push(new buffInfo("*", 0.95, 9999));
    //     ebuff.def.push(new buffInfo("*", 0.95, 9999));
    //     mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp * 0.03), 9999));
    //     myStats.heap1 = [];
    // }),

    new skillInfo(39, 80, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Demonic
        if (matchStats.round < 6) {
            myStats.sm += 80;
            noTimeout(matchStats, myStats);
            matchStats.sendWarning({ content: `Demonic skill can only be used after round 6.`, ephemeral: true });
            return AbilityResponse.FAILURE;
        };
        if (myStats.classUsed >= 1) {
            myStats.sm += 80;
            noTimeout(matchStats, myStats);
            matchStats.sendWarning({ content: `Demonic skill can only be used 1 time.`, ephemeral: true });
            return AbilityResponse.FAILURE;
        };
        myStats.classUsed ||= 0;
        myStats.classUsed++;

        // HP sacrifice
        mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp * 0.04), 9999));

        // Buff stats
        mybuff.atk.push(new buffInfo("*", 1.2, 9999, 0.02, "+", 1.4));
        mybuff.md.push(new buffInfo("*", 1.2, 9999, 0.02, "+", 1.4));
        mybuff.cr.push(new buffInfo("+", 0.2, 9999, 0.02, "+", 0.4));
        mybuff.cd.push(new buffInfo("+", 0.2, 9999, 0.02, "+", 0.4));
        // mybuff.dodge.push(new buffInfo("+", 0.2, 9999, 0.02, "+", 0.4));
        myStats.atk = Math.floor(myStats.atk * 1.2);
        myStats.md = Math.floor(myStats.md * 1.2);
        myStats.cr += 0.2;
        myStats.cd += 0.2;
        // myStats.dodge += 0.2;

        notice.push(`\n⚜️ **${char.name}** entered Archdemon form`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        // Reflect 30% of all damage
        myStats.reflectDamage = 0.3;

        // Dynamic ATK buff
        myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            myStats.atk += Math.floor(myStats.atk * Math.min(0.2, ((1 - myStats.hp / myStats.maxhp) / 3)));
            myStats.md += Math.floor(myStats.md * Math.min(0.2, ((1 - myStats.hp / myStats.maxhp) / 3)));

            return AbilityResponse.SUCCESS;
        }, 9999, 1));

        // Retaliate when HP < 0.3
        myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if (myStats.hp / myStats.maxhp <= 0.3) {
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.2), {});
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**'s HP fell below **30%**! ${char.gender === "F" ? "She" : "He"}`, { atkMultiplier: 1.2, ignoreShield: true });
                //@ts-expect-error
                this.used++;
            };

            return AbilityResponse.SUCCESS;
        }, 9999, 1));

        return AbilityResponse.SUCCESS;
    }),


    new skillInfo(40, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Slayer counters the next 2 attacks
        if (myStats.classUsedRound > matchStats.round - 4) {
            myStats.sm += 60;
            noTimeout(matchStats, myStats);
            matchStats.sendWarning({ content: `Slayer ability can only be used once every 4 rounds.`, ephemeral: true });
            return AbilityResponse.FAILURE;
        };
        matchStats.turn = matchStats.turnSkill;
        myStats.classUsedRound = matchStats.round;

        myStats.counter = 2;
        notice.push(`\n⚜️ **${char.name}** prepares to counter the next 2 attacks`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.combodmg = 0.08;

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(41, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Warlord increases his ATK by 1% for every 50 characters in inv
        matchStats.turn = matchStats.turnSkill;
        let atkbuff = Math.floor(new Set(list[0]).size / 50) * 0.01;
        if (atkbuff > 0.75) atkbuff = 0.75;
        mybuff.atk.push(new buffInfo("*", 1 + (atkbuff), 2));
        myStats.atk += Math.floor(myStats.atk * atkbuff);
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "M" ? "his" : "her"} ATK by **${Math.round(atkbuff * 100)}%** for 3 rounds`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.lootm += 0.25;

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(42, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Paladin gains +200 DEF and Magic Resist for 2 rounds
        matchStats.turn = matchStats.turnSkill;
        mybuff.def.push(new buffInfo("+", 200, 2));
        mybuff.mr.push(new buffInfo("+", 200, 2));
        myStats.def += 200;
        myStats.mr += 200;
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} DEF and Magic Resist by **200** for 3 rounds`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.05), 9999));

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(43, 25, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Artillerist ignores 60% of DEF and MR
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: 1, defMultiplier: 0.4 });

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(44, 20, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Warmachine increases DEF and MR depending on the mana consumption
        let idef = 100 + myStats.sm * 8, imr = 25 + myStats.sm * 2;
        mybuff.def.push(new buffInfo("+", idef, 5));
        mybuff.mr.push(new buffInfo("+", imr, 5));
        myStats.def += idef;
        myStats.mr += imr;
        myStats.sm = 0;
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} DEF by **${idef}** and Magic Resist by **${imr}** for 3 rounds`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.xpboost += 0.25;

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(45, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Summoner summons spirits

        myStats.sm += 50;
        noTimeout(matchStats, myStats);
        matchStats.sendWarning({ content: `Summoner skill has been disabled for the time being.`, ephemeral: true });
        return AbilityResponse.FAILURE;



        matchStats.myStatsCC = { ...myStats };
        matchStats.currentCharacter = 1;

        let statScale = 0.3, spiritType = "", spiritImage = "https://i.ibb.co/s22bQgf/Spirit.png";
        if (Math.random() < 0.2) {
            statScale = 0.5;
            spiritType = "fire ";
            spiritImage = "https://i.ibb.co/rH2Lq0D/Ifrit.png";
        };

        embed.setThumbnail(spiritImage);
        myStats.hp = Math.floor(myStats.maxhp * statScale);
        myStats.maxhp = Math.floor(myStats.maxhp * statScale);
        myStats.atk = Math.floor(myStats.atk * statScale);
        myStats.def = Math.floor(myStats.def * statScale);
        myStats.md = Math.floor(myStats.md * statScale);
        myStats.mr = Math.floor(myStats.mr * statScale);
        myStats.mana = 40;
        myStats.mg = 0;

        notice.push(`\n⚜️ **${char.name}** summoned a ${spiritType}spirit!`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mdChance = 0.2;

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(46, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Shaman adds a shield of 20% max HP 
        if (myStats.classUsed >= 4) {
            myStats.sm += 60;
            noTimeout(matchStats, myStats);
            matchStats.sendWarning({ content: `Shaman skill can only be used 4 times.`, ephemeral: true });
            return AbilityResponse.FAILURE;
        };
        myStats.classUsed ||= 0;
        myStats.classUsed++;

        if (myStats.shield > 0) {
            myStats.sm += 60;
            noTimeout(matchStats, myStats);
            matchStats.sendWarning({ content: `Shaman skill can only be used if you don't have a shield.`, ephemeral: true });
            return AbilityResponse.FAILURE;
        };

        myStats.shield = Math.floor(myStats.maxhp * 0.2);

        notice.push(`\n⚜️ **${char.name}** created a shield of **20%** of max HP!`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.shieldBreakDamageBuff = 0.5;
        myStats.mdChance = 1;

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(47, 35, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Sorcerer deals 125% Magic Damage
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: 1.25, magicDamage: true, mdChance: 0 });
        ebuff.hp.push(new buffInfo("+", Math.floor(Math.min(eStats.maxhp, myStats.maxhp * 2) * 0.03), 2));
        notice.push(`\n⚜️ **${enemy.name}** will take burning damage for the next 2 rounds`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mdChance = 1;

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(48, 80, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Wizard
        if (myStats.classUsedRound > matchStats.round - 10) {
            myStats.sm += 80;
            noTimeout(matchStats, myStats);
            matchStats.sendWarning({ content: `Wizard ability can only be used once every 10 rounds.`, ephemeral: true });
            return AbilityResponse.FAILURE;
        };
        myStats.classUsedRound = matchStats.round;
        matchStats.turn = matchStats.turnSkill;
        noTimeout(matchStats, myStats);
        eStats.burnduration += 10;
        myStats.burncrit = true;

        matchStats.on("burn", {
            maxRound: 10,
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats) {
                    let hhp = Math.floor(myStats.maxhp * 0.08);
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, hhp, {});
                };
            }
        });

        myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 10, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.burncrit = false;
            return AbilityResponse.SUCCESS;
        }));

        notice.push(`\n⚜️ **${char.name}** entered \`Thermal Ignition\` for **10** rounds`);

        // const dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: 1.5, magicDamage: true, mdChance: -1, isLightning: true });
        // ebuff.hp.push(new buffInfo("+", -Math.floor(dmg / 9), 3)); // 50% over 3 rounds
        // notice.push(`\n⚜️ **${enemy.name}** will take burning damage for the next 3 rounds`);
        // let count = 0;
        // while (eStats.burnduration > 0) {
        //     count++;
        //     procburn(eStats, myStats, ebuff, mybuff, matchStats, notice, ``, {});
        //     if (count === 3) break;
        // };
        // eStats.burnduration += 3;

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mdChance = 1;
        myStats.lightningcount ??= 0;
        myStats.burncount ??= 0;
        //mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.2), 9999));
        //myStats.md += Math.floor(myStats.md * 0.2);

        eStats.burntype = 2;
        if (typeof eStats.burnduration !== "number") {// Trigger burn every round
            eStats.burnduration = 0;
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                procburn(eStats, myStats, ebuff, mybuff, matchStats, notice, ``, {});

                return AbilityResponse.SUCCESS;
            }, 9999));
        };

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.hp / myStats.maxhp < 0.25 && eStats.burnduration >= 5) {
                eStats.burnduration -= 5;
                let hhp = Math.floor(myStats.maxhp * 0.15);
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, hhp, {});
            };
            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }),

    new skillInfo(49, 10, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Brawler deals 100% dmg +1% for each mana consumed
        matchStats.turn = matchStats.turnSkill;
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, { atkMultiplier: (1.1 + myStats.sm * 0.01) });
        myStats.sm = 0;

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(50, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Grappler removes all counter, lowers enemy's dodge to 0% for 7 rounds

        if (myStats.classUsedRound > matchStats.round - 7) {
            myStats.sm += 60;
            noTimeout(matchStats, myStats);
            matchStats.sendWarning({ content: `Grappler's ability can only be used once every 7 rounds.`, ephemeral: true });
            return AbilityResponse.FAILURE;
        };

        myStats.classUsedRound = matchStats.round;

        eStats.counter = 0;
        eStats.dodge = 0;
        ebuff.dodge.push(new buffInfo("=", 0, 7));
        noTimeout(matchStats, myStats);

        // Free-Flow effects (7 rounds) : Enemy receives 5% more damage for every round the domain lasts, up to 35% by the last round. This stacks on top of other vulnerability effects, but is reset after leaving the domain.
        myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            eStats.vulnerabilityDynamic += 0.05;

            return AbilityResponse.SUCCESS;
        }, 7));

        myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 7, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            eStats.vulnerabilityDynamic -= 0.35;
            notice.push(`\n⚜️ **${char.name}** exited Free-Flow`);

            return AbilityResponse.SUCCESS;
        }));
        notice.push(`\n⚜️ **${char.name}** has entered Free-Flow for **7** rounds`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.counter ??= 0;
        eStats.vulnerabilityDynamic ??= 1;
        myStats.classUsedRound = -8;

        // Evade first 2 lethal hits
        myStats.evadeDeathStrike ??= 0;
        myStats.evadeDeathChance ??= 0;
        myStats.evadeDeathStrike += 2;
        myStats.evadeDeathChance += 2;

        // Restore 3% missing HP every round if not in free-flow form
        myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if (!(myStats.classUsedRound > matchStats.round - 7) || myStats.classUsedRound < 0) {
                let hhp = Math.floor((myStats.maxhp - myStats.hp) * 0.03);
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, hhp, {});
            };
            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(51, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Striker increases his ATK permanently by 10%
        if (myStats.classUsed >= 3) {
            myStats.sm += 30;
            noTimeout(matchStats, myStats);
            matchStats.sendWarning({ content: `Striker ability can only be used 3 times.`, ephemeral: true });
            return AbilityResponse.FAILURE;
        };
        myStats.classUsed ||= 0;
        myStats.classUsed++;

        let atkbuff = Math.floor(myStats.atk * 0.1);
        myStats.atk += atkbuff;
        mybuff.atk.push(new buffInfo("+", atkbuff, 9999));
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} ATK by **${atkbuff}**`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.combodmg = 0.1;

        return AbilityResponse.SUCCESS;
    }),
    new skillInfo(52, 25, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Wardancer increases dodge chance and crit rate by +10% for 3 and 4 rounds respective
        myStats.dodge += 0.1;
        myStats.cr += 0.1;
        mybuff.dodge.push(new buffInfo("+", 0.1, 2));
        mybuff.cr.push(new buffInfo("+", 0.1, 3));
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} dodge chance and crit rate by **+10%** each`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodgebuff = 0.04;

        return AbilityResponse.SUCCESS;
    }),
];

export const bossAbilities: skillInfo[] = [
    new skillInfo(0, 35, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.def.push(new buffInfo("*", 1.5, 2));
        eStats.sm -= 35;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** has increased his DEF by **50%** for 2 rounds`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [5, "Skeleton Soldier increases his DEF by 50% over 2 rounds"]),
    new skillInfo(1, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.atk.push(new buffInfo("*", 1.5, 3));
        eStats.sm -= 40;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** has increased his ATK by **20%** for 3 rounds`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [10, "Illfang increases his ATK by 20% over 3 rounds"]),
    new skillInfo(1, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        addHeal(eStats, eStats, eStats, mybuff, ebuff, matchStats, notice, ``, 100, {});
        if (eStats.hp > eStats.maxhp) eStats.hp = eStats.maxhp;
        eStats.sm -= 50;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** healed for **100** HP`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [15, "Death Spot heals himself for 100 hp"]),
    new skillInfo(1, 25, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.def.push(new buffInfo("+", 20, 9999));
        ebuff.br.push(new buffInfo("*", 2, 2));
        eStats.sm -= 25;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** doubled his block rate for 2 rounds. **+20** DEF`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [20, "Geld doubles his block rate over the next 2 rounds. Gains permanent 20 DEF"]),
    new skillInfo(1, 20, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.atk.push(new buffInfo("+", 20, 9999));
        ebuff.br.push(new buffInfo("*", 0.02, 9999));
        eStats.sm -= 20;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** increased his ATK by **+20** and gained **+2%** dodge chance`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [25, "Beru gains permanent 10 ATK and +2% dodge chance"]),
    new skillInfo(1, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.cd.push(new buffInfo("*", 1.4, 3));
        eStats.sm -= 40;
        notice.push(`\n✨ **${enemy.name}** increased his crit damage by **40%** for 3 rounds`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [30, "Zenberu increases his crit damage by 40% over the next 3 rounds"]),
    new skillInfo(1, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.dodge.push(new buffInfo("+", 0.2, 3));
        eStats.sm -= 40;
        notice.push(`\n✨ **${enemy.name}** gained **+10%** dodge chance for 3 rounds`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [35, "Gleam Eyes gains +20% dodge chance for the next 3 rounds"]),
    new skillInfo(1, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("+", -20, 9999));
        eStats.sm -= 30;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** poisoned you. You will lose **-20**HP after each round`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [40, "Entoma poisons you to lose 20 hp every round"]),
    new skillInfo(1, 35, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.mr.push(new buffInfo("*", 0.2, 3));
        eStats.sm -= 35;
        notice.push(`\n✨ **${enemy.name}** decreased your MR by **80%** for 3 rounds`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [45, "CZ2128 Delta decreases your DEF by 80% for the next 3 rounds"]),
    new skillInfo(1, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor(((eStats.md * Math.pow(0.99895, myStats.mr)) * (1 - (0.2 * Math.random()))) * 1.2);
        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -satk, {});
        if (myStats.hp < 0) myStats.hp = 0;
        eStats.sm -= 30;
        notice.push(`\n✨ **${enemy.name}** has dealt **${satk}** magic damage`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [50, "Narberal Gamma deals 120% magic damage"]),
    new skillInfo(1, 20, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.atk.push(new buffInfo("*", 1.1, 9999));
        ebuff.def.push(new buffInfo("*", 1.3, 9999));
        eStats.sm -= 20;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** increased her atk by **10%** and def by **30%**`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [55, "Lupusregina Beta permanently increases ATK by 10%, DEF by 30%"]),
    new skillInfo(1, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.br.push(new buffInfo("=", 1, 3));
        eStats.sm -= 60;
        notice.push(`\n✨ **${enemy.name}** is now invincible for the next 3 rounds`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [60, "Cocytus gets invincible for the next 3 rounds (by increasing his block rate to 100%)"]),
    new skillInfo(1, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("*", 0.5, 3));
        eStats.sm -= 40;
        notice.push(`\n✨ **${enemy.name}** decreased your ATK by **50%** for 3 rounds`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [65, "Demiurge decreases your ATK by 50% for the next 3 rounds"]),
    new skillInfo(1, 20, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.atk.push(new buffInfo("+", 40, 9999));
        ebuff.def.push(new buffInfo("*", 1.5, 3));
        eStats.sm -= 20;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** increased ATK by **+40** permanently and DEF by **50%** for 3 rounds`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [70, "Albert increases his ATK by 25 permanently and DEF by 50% for the next 3 rounds"]),
    new skillInfo(1, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let shp = Math.floor((eStats.maxhp - eStats.hp) * 0.4);
        addHeal(eStats, eStats, eStats, mybuff, ebuff, matchStats, notice, ``, shp, {});
        eStats.sm -= 60;
        notice.push(`\n✨ **${enemy.name}** healed **${shp}** HP`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [75, "Adalman heals 40% of his missing HP"]),
    new skillInfo(1, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.atk.push(new buffInfo("*", 2, 3));
        mybuff.br.push(new buffInfo("*", 0.5, 3));
        eStats.sm -= 50;
        notice.push(`\n✨ **${enemy.name}** doubled his ATK and reduced your block rate by half for 3 rounds`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [80, "Hercules doubles his attack for 3 rounds and decreases your block rate by 50%"]),
    new skillInfo(1, 45, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.dodge.push(new buffInfo("*", 0.2, 3));
        eStats.sm -= 45;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** gained +20% dodge chance for 3 rounds`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [85, "Enkidu gains 20% dodge chance for 3 rounds"]),
    new skillInfo(1, 35, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.atk.push(new buffInfo("+", 30, 9999));
        ebuff.br.push(new buffInfo("*", 1.1, 9999));
        eStats.sm -= 35;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** has increased her ATK by **30** and block rate by **10%**`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [90, "Albedo permanently increases ATK by 30, block rate by 10%"]),
    new skillInfo(1, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.cr.push(new buffInfo("=", 1, 3));
        ebuff.cd.push(new buffInfo("+", 0.25, 3));
        eStats.sm -= 50;
        notice.push(`\n✨ **${enemy.name}** increased his crit rate to **100%** and gained **+25%** crit damage`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [91, "Gilgamesh increases CR to 100% and CD by +25% for the next 3 rounds"]),
    new skillInfo(1, 35, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor((eStats.atk * (1 - (0.2 * Math.random()))));
        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -satk, {});
        if (myStats.hp < 0) myStats.hp = 0;
        eStats.sm -= 35;
        notice.push(`\n✨ **${enemy.name}** has dealt **${satk}** true damage`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [92, "King Hassan attacks ignoring your DEF"]),
    new skillInfo(1, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.def.push(new buffInfo("*", 0.2, 3));
        mybuff.mr.push(new buffInfo("*", 0.2, 3));
        addHeal(eStats, eStats, eStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(eStats.hp * 0.1), {});
        if (eStats.hp > eStats.maxhp) eStats.hp = eStats.maxhp;
        eStats.sm -= 40;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** healed **10%** HP. Decreased your DEF and MR by **80%**`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [93, "Diablo decreses your DEF and MR by **80%** for 3 rounds. He heals himself for **10%** of max HP."]),
    new skillInfo(1, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.dodge.push(new buffInfo("+", 0.5, 2));
        ebuff.cr.push(new buffInfo("+", 0.25, 2));
        eStats.sm -= 50;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** increased dodge chance by **50%** and crit rate by **25%**`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [94, "Raphael increases dodge chance by 50% and CR by 25% for the next 2 rounds"]),
    new skillInfo(1, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("*", 0.8, 9999));
        eStats.sm -= 30;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** decreased your ATK by **20%**`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [95, "Guy Crimson permanently decreases your ATK by 20%"]),
    new skillInfo(1, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.dodge.push(new buffInfo("*", 0.8, 2));
        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -Math.floor(myStats.maxhp * 0.2), {});
        if (myStats.hp < 0) myStats.hp = 0;
        eStats.sm -= 50;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** burned 20% of your hp`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [96, "Igneel burns you for 20% of your max HP"]),
    new skillInfo(1, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.def.push(new buffInfo("+", 100, 9999));
        ebuff.mr.push(new buffInfo("+", 150, 9999));
        eStats.sm -= 40;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** increased DEF by **100**, magic resist by **150**`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [97, "Acnologia permanently increases his DEF by 100 and magic resist by 150"]),
    new skillInfo(1, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let shp = Math.floor((eStats.maxhp - eStats.hp) * 0.7);
        addHeal(eStats, eStats, eStats, mybuff, ebuff, matchStats, notice, ``, shp, {});
        eStats.sm -= 60;
        notice.push(`\n✨ **${enemy.name}** healed **${shp}** HP`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [98, "Vaision heals 70% of his missing HP"]),
    new skillInfo(1, 40, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor(((eStats.md * Math.pow(0.99895, myStats.mr)) * (1 - (0.2 * Math.random()))) * 1.2);
        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -satk, {});
        if (myStats.hp < 0) myStats.hp = 0;
        let shp = Math.floor((eStats.maxhp - eStats.hp) * 0.2);
        addHeal(eStats, eStats, eStats, mybuff, ebuff, matchStats, notice, ``, shp, {});
        eStats.sm -= 40;
        notice.push(`\n✨ **${enemy.name}** has dealt **${satk}** magic damage. Recovered **${shp}** HP`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [99, "Ainz Ooal Gown deals 300% magic damage, heals himself for 20% missing health"]),
    new skillInfo(1, 20, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let shp = Math.floor((eStats.maxhp - eStats.hp) * 0.2);
        addHeal(eStats, eStats, eStats, mybuff, ebuff, matchStats, notice, ``, shp, {});
        eStats.sm -= 20;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** has recovered **${shp}** HP`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [100, "Veldora makes a complete recovery"]),
    new skillInfo(37, 0, async () => {
        return AbilityResponse.FAILURE;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("*", 0.88, 9999));
        mybuff.md.push(new buffInfo("*", 0.88, 9999));
        mybuff.cr.push(new buffInfo("+", -0.12, 9999));
        mybuff.cd.push(new buffInfo("+", -0.12, 9999));
        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.atk.push(new buffInfo("*", 0.88, 9999));
            mybuff.md.push(new buffInfo("*", 0.88, 9999));
            mybuff.cr.push(new buffInfo("+", -0.12, 9999));
            mybuff.cd.push(new buffInfo("+", -0.12, 9999));
            if (matchStats.round === 14 && !(myStats.name === "Rimuru Tempest" || myStats.name === "Raphael EX")) {
                // On 8th round: Nihility Collapse
                matchStats.on("action", {
                    maxRound: 1,
                    maxUsage: 1,
                    callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                        if (caster === myStats) {
                            if (eStats.timeFrozen) {
                                eStats.timeFrozen = false;
                                notice.push(`\n✧ __Thought Acceleration__: Stun possibility denied. ✧`);
                            };
                            if (myStats.evadeDeathStrike || myStats.evadeDeathChance) {
                                notice.push(`\n✧ __Thought Acceleration__: Death Evasion possibility denied. ✧`);
                                myStats.evadeDeathStrike = 0;
                                myStats.evadeDeathChance = 0;
                            };
                            if (myStats.rev || myStats.maxRevivals) {
                                notice.push(`\n✧ __Thought Acceleration__: Revival possibility denied. ✧`);
                                myStats.rev = 0;
                                myStats.maxRevivals = 0;
                            };
                            if (myStats.counter) {
                                notice.push(`\n✧ __Thought Acceleration__: Counter possibility denied. ✧`);
                                myStats.counter = 0;
                            };
                            if (myStats.dodge >= 0 || myStats.block >= 0) {
                                notice.push(`\n✧ __Thought Acceleration__: Dodge/Block possibility denied. ✧`);
                                myStats.dodge = 0;
                                myStats.block = 0;
                            };
                            let dmg = Math.floor(myStats.maxhp * 30 + (Math.random() * 10));
                            dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${enemy.name}** used Nihilty Collapse and`, { overwriteDamage: dmg, ignoreShield: true, dodge: false, block: false });
                        };
                        return true;
                    }
                });
            };
            return AbilityResponse.SUCCESS;
        }, 14));

        return AbilityResponse.SUCCESS;
    }, [301, "Decreases enemy's ATK & MD by **12%** every round for the first **14** rounds (stacked multiplicatively)", "Decreases enemy's critical rate and critical damage by **12%** every round for the first **14** rounds", "On round **14**, uses __Thought Acceleration__: Removes any immobilization (e.g.stun/freeze) from self. Negates dodge, block, revival, death evasion, counter", "After which, deals **3000%** of enemy's max HP as true damage"]),
    new skillInfo(38, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let dmg = Math.floor(myStats.hp * 0.5);
        dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:Angbar:1498001499975061554> Turn up the heat! **${enemy.name}** cast purgatory and`, { overwriteDamage: dmg, ignoreShield: true, dodge: false, block: false });
        mybuff.hp.push(new buffInfo("*", 0.95, 9999));

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.burnResistance = 1;
        notice.push(`\n✧ Lame. I sure hope you aren't just a waste of time. ✧`);
        let notif = 0;
        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round % 4 === 0) {
                // Every 4th round: Blazing Demon (Stat buff)
                eStats.atk *= 2;
                eStats.md *= 2;
                eStats.cr = 1;
                eStats.cd += 2;
                eStats.shield += 2000;
                notice.push(`\n🔥 **${enemy.name}** used __Blazing Demon__ and greatly boosted their stats this round`);
            };

            if (eStats.hp / eStats.maxhp < 0.75 && notif === 0) {
                notice.push(`\n✧ Oh, you aren't half as bad as I thought you'd be. ✧`);
                embed.setImage(`https://i.ibb.co/zVy3Yzc3/mcburnsta2.png`);
                notif = 1;
            };

            if (eStats.hp / eStats.maxhp < 0.5 && notif === 1) {
                notice.push(`\n✧ Now things are getting fun! I feel like getting more serious now. ✧`);
                let dmg = dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:Angbar:1498001499975061554> **${enemy.name}** cast __Incandescent Hellfire__ and`, { atkMultiplier: 2 });
                if (dmg) Object.keys(mybuff).forEach((e) => mybuff[e as keyof Buffs] = []);
                embed.setImage(`https://i.ibb.co/vxpMN5GD/mcburnsta3.png`);
                notif = 2;
            };

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, [302, "Immune to immobilization effects (e.g. stun/freeze)", "Immune to burn damage", "Curse is set to Scorched Earth (<:Scorched_Earth:1502126250594930831>)", "At the start of the round, if he has less than **50%** HP, uses __Incandescent Hellfire__ (at most once per fight): Deals **200%** damage and clears all enemy buffs", "Every **4** rounds: Uses __Blazing Demon__: **Doubles** ATK & MD, increases critical rate to **100%** and increases CRIT DMG by **200%**. Then, gains **2000** shield", "**Active**: Deals **50%** of enemy's current HP as true damage, and applies a **5%** HP DoT (stacked multiplicatively) to the enemy permanently\n\n**Lore**:\n> He has amnesia and lost his purpose, but in the meantime seeks strong opponents to fight against. Hired by Ouroboros, he is tasked with various missions, but gets bored easily when no strong opponents await him there. When one does come across though, he gets overjoyed to not hold back anymore."]),
    new skillInfo(39, 0, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        return AbilityResponse.FAILURE;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.phase = 1;
        eStats.maxphase = 2;
        eStats.phaseNotif = ["Return to stone..."];
        eStats.removeDefCap = true;
        eStats.refuseATK = false;
        eStats.refuseATKMessage = ["✧ The promised day... I await. ✧", "✧ Return to your origins... ✧", "✧ I honestly don't care. ✧", "✧ This is a waste of time. ✧", "✧ I can always create another stone... ✧", "✧ I'm not through, there are more! ✧"];

        // Phase transition
        matchStats.on("phaseChange", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (caster === eStats) {
                eStats.shield += Math.floor(eStats.maxhp / 2);
                eStats.def = 660;
                eStats.phaseChangeTurn = matchStats.round;
                myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    if (matchStats.round > 30) {
                        myStats.maxhp -= 500;
                        eStats.maxhp += 500;
                    };
                    switch (matchStats.round) {
                        case (eStats.phaseChangeTurn + 1): {
                            eStats.shield = 0;
                            myStats.dodge -= 0.5;
                            if (myStats.dodge < 0) myStats.dodge = 0;
                            dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:The_Flawed:1498701713983668415> **${enemy.name}** unleashes the power of GOD and`, { atkMultiplier: (myStats.usedBlockRound === matchStats.round || myStats.shield > 0) ? 4 : 8, ignoreShield: true });
                            break;
                        };
                        case (eStats.phaseChangeTurn + 2): {
                            eStats.damageReduction = 1;
                            eStats.invisCount = 0;
                            eStats.refuseATK = true;
                            notice.push(`\n✧ Mere humans can barely lay a finger on me... **${enemy.name}** gained __INVINCIBILITY__ ✧`);

                            // Remove INVINCIBILITY
                            matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
                                if (target === eStats && eStats.invisCount < 30) {
                                    eStats.invisCount++;
                                    switch (eStats.invisCount) {
                                        case 20: notice.push(`\n✧ I just wanted this world's knowledge for my own! ✧`); break;
                                        case 25: notice.push(`\n✧ Why should I be punished for that?! ✧`); break;
                                        case 30: {
                                            eStats.damageReduction = 0;
                                            eStats.vulnerabilityDynamic ??= 0;
                                            eStats.vulnerabilityDynamic += 0.5;
                                            notice.push(`\n✧ **${enemy.name}** lost __INVINCIBILITY__ and became __CARBONIZED__ ✧`);
                                            dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:The_Flawed:1498701713983668415> **${enemy.name}** launches a frantic attack and`, { atkMultiplier: 4, canCounter: false, dodge: false, block: false, ignoreShield: true });
                                            eStats.refuseATK = false;
                                            break;
                                        };
                                    };
                                    dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `<:The_Flawed:1498701713983668415> **${enemy.name}** retaliated and`, { atkMultiplier: 0.8 });
                                };
                            });
                            break;
                        };
                        default: break;
                    };

                    return AbilityResponse.SUCCESS;
                }, 9999));
            };
        });

        // Phase 1: Increases max HP by 5% every time he receives a physical hit
        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (eStats.phase === 1 && target === eStats && !options.magicDamage) eStats.maxhp += Math.floor(eStats.maxhp * 0.05);
        });

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (eStats.phase === 1) {
                eStats.def = 1000000000; // Phase 1: Immune to physical damage
            };

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, [303, "Multiphase (2 phases)", "Immune to physical damage (Phase 1)", "Increases max HP by **5%** upon receiving a physical hit (Phase 1)", "Upon transitioning to Phase 2, summons a shield of **50%** max HP", "On the next round, breaks the shield, reduces your dodge rate by **50%**, and deals **800%** true damage. The damage scaling is halved if the player used DEF the last round or has a shield", "On the next round, Becomes __INVINCIBLE__ (takes 0% damage). Does not attack. Upon receiving an attack, retaliates and deals **80%** damage.", "After taking **30** hits, loses __INVINCIBILITY__ and deals **400%** uncounterable undodgeable unblockable true damage.", "Then becomes __CARBONIZED__, taking **+50%** damage.", "If he manages to stay alive for more than **30** rounds, begins to steal **500** HP from you and adds it to his own max HP every round."]),
    new skillInfo(40, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Active: Debt Shield - 60 mana, sets mana to 0, generates shield/heal based on coins taken
        myStats.sm = 0;
        const healPer2k = Math.floor(eStats.aneiraCoinsTaken / 2000);

        if (healPer2k > 0) {
            const amount = Math.floor(eStats.maxhp * 0.01) * healPer2k;
            eStats.shield += amount;
            addHeal(eStats, myStats, eStats, ebuff, mybuff, matchStats, notice, ``, amount, {});
            if (eStats.hp > eStats.maxhp) eStats.hp = eStats.maxhp;
            notice.push(`\n💰 **${enemy.name}** cast **Debt Shield** and gained **${amount}** shield and HP from **${eStats.aneiraCoinsTaken}** coins`);
        } else {
            eStats.sm += 30;
            notice.push(`\n💰 **${enemy.name}** cast **Debt Shield**! You lost all mana! (< 2000 coins taken)`);
        };

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Initialize enemy state
        eStats.aneiraCoinsTaken = 0;
        notice.push(`\n✧ Return everything you were bestowed upon... ✧`);
        matchStats.lootm = 0;

        // Eliza interaction - double ATK and MD
        if (char.name === "Eliza") {
            myStats.atk *= 2;
            myStats.md *= 2;
            mybuff.atk.push(new buffInfo("*", 2, 9999));
            mybuff.md.push(new buffInfo("*", 2, 9999));
            notice.push(`\n💰 **Eliza** doubled her own ATK and MD!`);
        };

        // Passive: steal 500 coins when enemy takes damage
        matchStats.on("attack", ({ trigger, caster, target }) => {
            if (target === eStats && caster === myStats) {
                eStats.aneiraCoinsTaken += 500;
                matchStats.loot -= 500;
                notice.push(`\n💰 **${enemy.name}** stole **500** coins! Total: **${eStats.aneiraCoinsTaken}**`);
            };
        });

        return AbilityResponse.SUCCESS;
    }, [304, "Steals **500** coins when damaged (can go negative)", "**Active (60 💧)**: Sets mana to **0**, gains **1%** shield and heal **1%** HP per **2000** coins stolen. If she has stolen less than **2000** coins, restores **30** 💧", "Gold bonuses are disabled"]),
    new skillInfo(41, 25, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Calculate damage: 80% true damage + 10% per Dragon Mark + 20% if burning
        const dragonMarks = myStats.dragonMarks || 0;
        const isBurning = eStats.burn > 0;
        const baseMultiplier = isBurning ? 1.0 : 0.8;
        const markMultiplier = 0.1 * dragonMarks;
        const totalMultiplier = baseMultiplier + markMultiplier;

        dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `🔥 **${enemy.name}**`, { ignoreShield: true, atkMultiplier: totalMultiplier, magicDamage: true });
        // Grant 2 Dragon Marks
        myStats.dragonMarks += 2;
        notice.push(`\n🔥 **${enemy.name}** used __Breadth of Destruction__!`);
        notice.push(`\n🐉 **Dragon Marks**: ${myStats.dragonMarks}/3`);
        // Check for Dragon Mark explosion (3 marks)
        if (myStats.dragonMarks >= 3) {
            // Explode all stacks: 80% true damage + 5% vulnerability for 1 round
            myStats.dragonMarks -= 3;
            dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `💥 **${enemy.name}** ignited all Dragon Marks!`, { ignoreShield: true, atkMultiplier: 0.8, magicDamage: true });
            // Apply vulnerability and prevent blocking/dodging
            myStats.vulnerabilityDynamic += 0.05;
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.vulnerabilityDynamic -= 0.05;
                return AbilityResponse.SUCCESS;
            }));
        };

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Initialize Antares state
        myStats.dragonMarks = 0;
        myStats.vulnerabilityDynamic ??= 1;
        notice.push(`\n✧ Kneel, or burn. I offer no third option. ✧`);
        eStats.deathMessage = "✧ You have not won. You have only... delayed the inevitable. ✧";
        eStats.playerDeathMessage = "✧ Pathetic. I expected more from your kind! ✧";
        // Passive: Fire Magic - immune to burning, only magic damage
        eStats.burnResistance = 1;
        eStats.mdChance = 1;
        if (char.name === "Sung Jin Woo" || char.name === "SJW EX") {
            myStats.atk *= 2;
            myStats.md *= 2;
            mybuff.atk.push(new buffInfo("*", 2, 9999));
            mybuff.md.push(new buffInfo("*", 2, 9999));
        };
        // Passive: Every 3rd attack adds Dragon Mark
        eStats.dragonCount = 0;
        myStats.attackCount = 0;
        matchStats.on("attack", ({ trigger, caster, target }) => {
            if (caster === myStats && target === eStats) {
                eStats.dragonCount++;
                myStats.attackCount++;
                if (myStats.attackCount % 3 === 0) {
                    myStats.dragonMarks++;
                    notice.push(`\n🐉 **${enemy.name}** applied **Dragon Mark** (${myStats.dragonMarks}/3)`);
                    // Check for Dragon Mark explosion (3 marks)
                    if (myStats.dragonMarks >= 3) {
                        // Explode all stacks: 80% true damage + 5% vulnerability for 1 round
                        myStats.dragonMarks -= 3;
                        dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `💥 **${enemy.name}** ignited all Dragon Marks!`, { ignoreShield: true, atkMultiplier: 0.8, magicDamage: true });
                        // Apply vulnerability and prevent blocking/dodging
                        myStats.vulnerabilityDynamic += 0.05;
                        myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                            myStats.vulnerabilityDynamic -= 0.05;
                            return AbilityResponse.SUCCESS;
                        }));
                    };
                };
            };
        });
        // If enemy is vulnerable = cant block/dodge
        myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if (myStats.vulnerabilityDynamic > 1 || myStats.vulnerability > 1) {
                myStats.dodge = 0;
                myStats.block = 0;
            };
            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, [305, "Only deals magical damage, and is immune to BURNING", "Curse is set to Dragon Manipulation (<:Dragon_Manipulation:1502126144080838749>)", "Every 3rd attack applies `Dragon Mark`", "Upon reaching **3** `Dragon Marks`: Ignites player, deals **80%** true damage, and applies **5%** vulnerability", "When the enemy is vulnerable, they cannot block/dodge", "**Active (60 💧)**: Breadth of Destruction - Deals **80%** true damage (**100%** if burning) + **10%** per `Dragon Mark`, before applying **2** `Dragon Marks`"]),
    new skillInfo(42, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Nereid
        myStats.shield += 300;
        matchStats.trigger("shieldBreak", eStats, myStats, ebuff, mybuff);
        if (eStats.shield > 0) matchStats.trigger("shieldBreak", myStats, eStats, mybuff, ebuff);
        const dmg = Math.floor(eStats.atk * 0.3 + eStats.maxhp * 0.000005 * (myStats.shield + eStats.shield));
        myStats.shield = 0;
        eStats.shield = 0;
        myStats.SPshield = 0;
        eStats.SPshield = 0;
        dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${enemy.name}** broke all shield and`, { overwriteDamage: dmg, magicDamage: true });

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.SPshield ??= 0;
        myStats.SPshield ??= 0;
        eStats.SPshieldType = 1;
        eStats.shield += Math.floor(eStats.maxhp * 0.2);
        eStats.SPshield += Math.floor(eStats.maxhp * 0.1);

        matchStats.on("curse", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === eStats) {
                eStats.SPshield += (eStats.maxhp * 0.05);
                notice.push(`\n<:spshield1:1501752295182827560> **${enemy.name}** gains a special shield of **5%** max HP`);
            };
            return AbilityResponse.SUCCESS;
        });

        matchStats.on("shieldBreak", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (target === eStats && options.special === true) {
                eStats.negateHeal = 1;
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${enemy.name}**`, { overwriteDamage: Math.floor(myStats.maxhp * 0.05), magicDamage: true });
                myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 2, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                    eStats.negateHeal = 0;
                    return AbilityResponse.SUCCESS;
                }, 9999));
            };
            return AbilityResponse.SUCCESS;
        });

        return AbilityResponse.SUCCESS;
    }, [306, "Starts battles with a **20%** max HP shield, and another layer of **10%** max HP special shield.", "Special shield [ <:spshield1:1501752295182827560> ]: Has same features as a normal shield, but also reduces damage taken by **50%**, and reflects damage to the attacker by **2x** (**4x** if it is true damage). Upon breaking, deals **5%** of opponent's max HP and halts healing on the opponent", "Upon using a curse, gains **5%** max HP worth of special shield", "Curse is set to Mermaid Murmur (<:Mermaid_Murmur:1502126075117834310>)", "Active (60 💧) : Grants the opponent **300** shield, before breaking all normal & special shield on both sides, dealing **50%** true dmg + **0.0005%** max HP dmg for every **1** shield destroyed this way."]),
    new skillInfo(43, 0, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (eStats.ce < 800) {
            return AbilityResponse.FAILURE;
        } else {
            eStats.ce -= 800;
            dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${enemy.name}** uses his World Cutting Slash and`, { atkMultiplier: 3, magicDamage: true, canCounter: false });
            myStats.timeFrozen = true;
            myStats.frozenMessage = `is immobilized by **${enemy.name}**`;

            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 2, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.timeFrozen = false;

                return AbilityResponse.SUCCESS;
            }));
        };

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Initialize enemy state
        eStats.ce ??= 0;
        eStats.ce += 2000;
        eStats.ceCap ??= 2500;
        let notif = 1;

        // Cursed energy conversion
        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            let manaConvert = Math.floor(eStats.sm * 0.8);
            eStats.sm -= manaConvert;
            eStats.ce += manaConvert;
            if (eStats.ce > eStats.ceCap) eStats.ce = eStats.ceCap; // Cap at 2000 by default
            notice.push(`\n<a:ceanimated:1468216281768661093> ${enemy.name} now has ${eStats.ce} <:ce:1466817050860191817>`);

            if (eStats.hp / eStats.maxhp < 0.5 && notif) {
                notif--;
                notice.push(`\n✧ Stand proud. You're strong. ✧`);
            };
            return AbilityResponse.SUCCESS;
        }, 9999));

        notice.push(`\n<a:ceanimated:1468216281768661093> **${enemy.name}** will store and manipulate Cursed Energy [ <:ce:1466817050860191817> ]...`);
        notice.push(`\n✧ Gambare, gambare... ✧`);

        // Special Grade interaction
        if (char.name === "Gojou Satoru EX" || char.name === "Yuta Okkotsu EX") {
            eStats.mg = Math.floor(eStats.mg / 2);
            ebuff.mg.push(new buffInfo("*", 0.5, 9999));
            if (char.name === "Gojou Satoru EX") notice.push(`\n✧ A nameless fish huh? ✧`);
            if (char.name === "Yuta Okkotsu EX") notice.push(`\n✧ So, how far can you go? ✧`);
            notice.push(`\n✨ **${enemy.name}** has halved mana regeneration and has his Reversed Cursed Technique disabled.`);
        } else {
            // Heal 5% max HP when landing a hit
            matchStats.on("attack", ({ trigger, caster, target }) => {
                if (caster === eStats) {
                    addHeal(eStats, myStats, eStats, ebuff, mybuff, matchStats, notice, ``, Math.floor((eStats.maxhp - eStats.hp) * 0.05), {});
                    if (Math.random() < 0.33) dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${enemy.name}** cleaves and dismantles. He`, { atkMultiplier: 1, magicDamage: true, ignoreShield: true });
                };
            });
        };
        return AbilityResponse.SUCCESS;
    }, [307, "Upon landing a hit, activates __Reversed Cursed Technique__,  recovering **5%** missing HP. After which, he has a **33%** chance to follow-up with Cleave & Dismantle, dealing **70%** true damage.", "Curse is set to Malevolent Shrine []", "Regenerates **50** 💧 every round. Converts **80%** of mana owned at the start of every round into Cursed Energy [ <:ce:1466817050860191817> ] (up to 2000). He starts out the fight with max Cursed Energy.", "**Active (1000 <:ce:1466817050860191817>)**: His World Cutting Slash deals **300%** uncounterable damage, and stuns the opponent for **2** rounds.\n\n**Lore**:\n> King of Curses of the Heian era, who had sealed himself away due to lack of worthy opponents, has returned after 1000 years... in search for a worthy opponent."]),
    new skillInfo(44, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Aneira (alter)
        eStats.abilCount++;
        dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${enemy.name}** unleashed an Avalanche and`, { atkMultiplier: 0.3 * eStats.abilCount, magicDamage: true });
        ebuff.mg.push(new buffInfo("+", 1, 9999));

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.anatkCount = 0;
        eStats.abilCount = 0;
        myStats.vulnerabilityDynamic ??= 1;
        notice.push(`\n✧ Curses... Curses to all.. CURSES TO ALL! ✧`);

        if (char.name === "Aneira EX" || char.name === "Aneira") {
            eStats.atk *= 1.3;
            eStats.md *= 1.3;
            eStats.def *= 0.7;
            eStats.mr *= 0.7;
            ebuff.atk.push(new buffInfo("*", 1.3, 9999));
            ebuff.md.push(new buffInfo("*", 1.3, 9999));
            ebuff.def.push(new buffInfo("*", 0.7, 9999));
            ebuff.mr.push(new buffInfo("*", 0.7, 9999));
            notice.push(`\n✧ Great... even my alternate forms have dared to trespasss... ✧`);
        };

        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === eStats) {
                eStats.anatkCount++;
                if (eStats.anatkCount % 5 === 0) {
                    myStats.timeFrozen = true;
                    myStats.frozenMessage = `is immobilized by **${enemy.name}**`;
                    myStats.mg = 0;
                    mybuff.mg.push(new buffInfo("=", 0, 1));
                    eStats.negateHeal = 1;
                    myStats.vulnerabilityDynamic += 0.33;

                    // Reset
                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 2, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        myStats.timeFrozen = false;
                        eStats.negateHeal = 0;
                        myStats.vulnerabilityDynamic -= 0.33;

                        return AbilityResponse.SUCCESS;
                    }));
                };
            };
            return AbilityResponse.SUCCESS;
        });

        return AbilityResponse.SUCCESS;
    }, [308, "After landing every **5** hits, freezes the opponent for **1** round, where they cannot make an action, heal, or generate mana, while taking **+33%** damage", "When fighting against Aneira EX / Aneira, gains **+30%** ATK & MD, but loses **30%** DEF & MR", "Curse is set to Chilling Cold (<:Chilling_Cold:1503414323857330357>)", "Active (50 💧) : Deals **30%** damage for every time this was used. This also permanently increases her mana-regen by **1** 💦"]),
    new skillInfo(45, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Rainee (alter)
        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, `✨ **${enemy.name}** used her healing powers...`, Math.floor(myStats.maxhp * 0.05), { showNotif: true });

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.stayAlive ??= 0;
        myStats.stayAlive += 1;
        myStats.hp = Math.floor(myStats.maxhp / 2);
        matchStats.winconInvert = true;
        eStats.deathMessage = ["✧ The sanctionary of healing.... remains open. ✧"];
        let notif = 1;
        notice.push(`\n✧ You're in the right place for some healing... ✧`);
        eStats.replaceButton = {};
        eStats.replaceButton.atk = {
            "run": async (eStats, eStatsFixed, myStats, ebuff, mybuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                addHeal(eStats, myStats, eStats, ebuff, mybuff, matchStats, notice, `💖 **${enemy.name}** applied a healing dosage...`, Math.floor(eStats.maxhp * 0.05), {});

                return AbilityResponse.SUCCESS;
            },
        };

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.05), {});
            if (myStats.hp / myStats.maxhp < 0.25 && notif) {
                notif--;
                notice.push(`\n✧ Y- You're hurt.. you're really hurt... ✧`);
            };
            if (myStats.hp === myStats.maxhp) {
                myStats.forceLoose = true;
                notice.push(`\n✧ Healing completed, you may leave now. ✧`);
            };
            return AbilityResponse.SUCCESS;
        }, 9999));

        matchStats.on("heal", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (target === myStats && !target.forceLoose) {
                if (target.hp === target.maxhp) {
                    target.forceLoose = true;
                    notice.push(`\n✧ Healing completed, you may leave now. ✧`);
                };
                return AbilityResponse.SUCCESS;
            };
        });

        return AbilityResponse.SUCCESS;
    }, [309, "Win condition is inverted. Additionally, when the player reaches full health, loses.", "Opponent starts out at **50%** HP, and is healed **5%** max HP every round", "Upon death, opponent recovers **50%** max HP instead. This bypasses insta-death effects.", "Curse is set to Benevolence (<:Mermaid_Murmur:1502126075117834310>)", "Active (30 💧) : Restores **5%** max HP to the opponent\n**Lore**:\n> All life is invaluable. This strong conviction of Rainee made her a protector of all living beings. Her very being has carnal, spiritual and metaphysical healing effects to her surroundings. It is not just sunshine and roses though. As the world is full of people falling victim to mortal sins and hurting others for personal gains, she gets grief-stricken regularly. Depending on severity, the sky cries for long periods of time, plants just wither away and pestilence spreads out. That makes Rainee even more so a protector of all living beings unbeknownst to humans who are busy with drivel and vanity."]),
    new skillInfo(46, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (eStats.phase === 1) {
            eStats.dodge = 1;
            eStats.cr = 1;
            notice.push(`\n✨ **${enemy.name}** gains Stealth and will have **100%** critical rate and dodge rate this round.`);
        } else {
            notice.push(`\n✨ **${enemy.name}** summoned his Monarch Domain and deployed **+1** shadow...`);
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${enemy.name}**'s shadows provided their aid and`, { atkMultiplier: 0.25, magicDamage: true });
                return AbilityResponse.SUCCESS;
            }, 9999));
        };
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.phase = 1;
        eStats.maxphase = 2;
        eStats.phaseNotif = ["You should’ve walked away while you still could."];
        notice.push(`\n✧ Are you sure you want to fight me? ✧`);

        // Phase transition
        matchStats.on("phaseChange", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (caster === eStats) {
                eStats.atk *= 1.5;
                eStats.md *= 1.5;
                eStats.def *= 1.5;
                eStats.mr *= 1.5;
                eStats.cr *= 1.5;
                eStats.cd *= 1.5;
                eStats.dodge *= 1.5;
                eStats.br *= 1.5;
                eStats.maxhp += Math.floor(eStats.maxhp / 2);
                ebuff.atk.push(new buffInfo("*", 1.5, 9999));
                ebuff.md.push(new buffInfo("*", 1.5, 9999));
                ebuff.def.push(new buffInfo("*", 1.5, 9999));
                ebuff.mr.push(new buffInfo("*", 1.5, 9999));
                ebuff.cr.push(new buffInfo("*", 1.5, 9999));
                ebuff.cd.push(new buffInfo("*", 1.5, 9999));
                ebuff.dodge.push(new buffInfo("*", 1.5, 9999));
                ebuff.br.push(new buffInfo("*", 1.5, 9999));
                return AbilityResponse.SUCCESS;
            };
        });

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (eStats.phase === 1) {
                eStats.atk *= 1.02;
                eStats.md *= 1.02;
                ebuff.atk.push(new buffInfo("*", 1.02, 9999));
                ebuff.md.push(new buffInfo("*", 1.02, 9999));
            };

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, [310, "Multiphase (2 phases)", "Increases ATK & MD by **2%** every round (Phase 1)", "Upon phase change, all stats of his are increased by **50%**", "Active (60 💧) : If in phase 1, gains stealth, increasing dodge rate and critical rate to **100%**. If in phase 2, casts Monarch Domain, summoning **+1** shadow, dealing **25%** damage every round till the end of the fight"]),
    new skillInfo(47, 100, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (eStats.phase === 1) {
            eStats.sm += 100;
            return AbilityResponse.FAILURE;
        } else {
            eStats.counterChanceDynamic += 1;
            eStats.counterBonus += 0.28;
            matchStats.on("counter", {
                maxUsage: 10,
                callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                    if (target === eStats) {
                        eStats.counterChanceDynamic -= 0.1;
                    };
                    return true;
                }
            });
            notice.push(`\n✨ **${enemy.name}** parries in the form of soundwaves...`);
        };
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.phase = 1;
        eStats.maxphase = 2;
        eStats.phaseNotif = ["Servant defeated!"];
        eStats.servantActive = true;
        eStats.counterChanceDynamic ??= 0;
        eStats.counterBonus ??= 0;
        eStats.replaceButton = {};

        matchStats.on("ATK", {
            maxRound: 1,
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats && matchStats.round === 1) {
                    notice.push(`\n✨ You've decided to fight the boss head on...`);
                    eStats.phase = 2;
                    eStats.servantActive = false;
                    matchStats.trigger("phaseChange", eStats, myStats, ebuff, mybuff, {});
                    return true;
                };
            }
        });

        // Phase transition
        matchStats.on("phaseChange", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (caster === eStats) {
                embed.setImage(`https://i.ibb.co/gYxpRGH/image.jpg`);
                eStats.maxhp += Math.floor(eStats.maxhp * 1.5);
                eStats.hp = eStats.maxhp;
                if (!eStats.servantActive) {
                    eStats.servantActive = true;
                } else eStats.servantActive = false;
                eStats.replaceButton.atk = {
                    "run": async (eStats, eStatsFixed, myStats, ebuff, mybuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        if (Math.random() < 0.5) {
                            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${enemy.name}**'s summoned blade`, { atkMultiplier: 0.5, mdChance: -1, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${enemy.name}**'s whirling blade`, { atkMultiplier: 0.5, mdChance: -1, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${enemy.name}**'s jabbing blade`, { atkMultiplier: 0.5, mdChance: -1, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                        } else dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${enemy.name}** used Sword Slash and`, { atkMultiplier: 1.5, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });

                        return AbilityResponse.SUCCESS;
                    },
                };
                return AbilityResponse.SUCCESS;
            };
        });

        // Loses 3% stats every round
        mybuff.atk.push(new buffInfo("*", 0.97, 9999));
        mybuff.md.push(new buffInfo("*", 0.97, 9999));
        mybuff.def.push(new buffInfo("*", 0.97, 9999));
        mybuff.mr.push(new buffInfo("*", 0.97, 9999));
        mybuff.cr.push(new buffInfo("*", 0.97, 9999));
        mybuff.cd.push(new buffInfo("*", 0.97, 9999));
        mybuff.dodge.push(new buffInfo("*", 0.97, 9999));
        mybuff.br.push(new buffInfo("*", 0.97, 9999));

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (eStats.servantActive) {
                mybuff.atk.push(new buffInfo("*", 0.97, 9999));
                mybuff.md.push(new buffInfo("*", 0.97, 9999));
                mybuff.def.push(new buffInfo("*", 0.97, 9999));
                mybuff.mr.push(new buffInfo("*", 0.97, 9999));
                mybuff.cr.push(new buffInfo("*", 0.97, 9999));
                mybuff.cd.push(new buffInfo("*", 0.97, 9999));
                mybuff.dodge.push(new buffInfo("*", 0.97, 9999));
                mybuff.br.push(new buffInfo("*", 0.97, 9999));
            };

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, [311, "Multiphase (2 phases)", "__Rules of Madoka Magica__: Using ATK (⚔️) on the first round will skip the first phase (servant), and directly enter phase 2 (the witch). However, forced skips this way will cause the servant's passive to linger throughout the battle... and may have unexpected synergies.", "The opponent loses **3%** of all stats every round (Servant passive)", "ATK is altered to either deal **3** hits of **50%** magical damage, or deal **1** hit of **150%** physical damage.", "Active (100 💧) : Only usable in phase 2 (by the witch). Permanently increases counter damage by **28%**. Then, increases counter chance to **100%**, and she can counter regardless of whether she had counter attempts available. This chance is reduced by **10%** every time she successfully counters, down to at most **0%**."]),
    new skillInfo(48, 1000000, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.FAILURE;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.phase = 1;
        eStats.maxphase = 2;
        eStats.phaseNotif = ["Servant defeated!"];
        eStats.servantActive = true;
        eStats.replaceButton = {};
        eStats.deflectDamage ??= 0;

        eStats.replaceButton.atk = {
            "run": async (eStats, eStatsFixed, myStats, ebuff, mybuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (eStats.phase === 2) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${enemy.name}**`, { atkMultiplier: 1, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, normalATK: true });
                } else if (matchStats.round % 7 !== 0) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${enemy.name}**`, { atkMultiplier: 0.2 * matchStats.round, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                } else {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${enemy.name}**`, { atkMultiplier: 1, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                };
                return AbilityResponse.SUCCESS;
            },
        };

        myStats.burntype = 1;
        if (typeof myStats.burnduration !== "number") {// Trigger burn every round
            myStats.burnduration = 0;
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                procburn(myStats, eStats, mybuff, ebuff, matchStats, notice, ``, {});

                return AbilityResponse.SUCCESS;
            }, 9999));
        };

        matchStats.on("ATK", {
            maxRound: 1,
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats && matchStats.round === 1) {
                    notice.push(`\n✨ You've decided to fight the boss head on...`);
                    eStats.phase = 2;
                    eStats.servantActive = false;
                    eStats.deflectDamage += 0.36;
                    matchStats.trigger("phaseChange", eStats, myStats, ebuff, mybuff, {});
                    return true;
                };
            }
        });

        // Phase transition
        matchStats.on("phaseChange", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (caster === eStats) {
                embed.setImage(`https://i.ibb.co/gYxpRGH/image.jpg`);
                eStats.maxhp += Math.floor(eStats.maxhp * 1.5);
                eStats.hp = eStats.maxhp;
                if (!eStats.servantActive) {
                    eStats.servantActive = true;
                } else eStats.servantActive = false;
                eStats.deflectDamage += 0.18;
                eStats.dodge += 0.2;
                ebuff.dodge.push(new buffInfo("+", 0.2, 9999));
                matchStats.on("dodge", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
                    if (target === eStats) {
                        myStats.def -= Math.floor(myStats.def * 0.35);
                        myStats.mr -= Math.floor(myStats.mr * 0.35);
                        if (eStats.sm >= 70) {
                            eStats.sm -= 70;
                            dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${enemy.name}**'s returning slash`, { atkMultiplier: 1.75, magicDamage: true, dodge: false, ignoreShield: true });
                        };
                        return AbilityResponse.SUCCESS;
                    };
                });
                return AbilityResponse.SUCCESS;
            };
        });

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (eStats.servantActive && matchStats.round % 3 === 0) {
                myStats.burnduration += 8;
                for (let i = 0; i < 4; i++) {
                    procburn(myStats, eStats, mybuff, ebuff, matchStats, notice, ``, {});
                };
            };

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, [312, "Multiphase (2 phases)", "__Rules of Madoka Magica__: Using ATK (⚔️) on the first round will skip the first phase (servant), and directly enter phase 2 (the witch). However, forced skips this way will cause the servant's passive to linger throughout the battle... and may have unexpected synergies.", "Every **3** rounds, inflicts **8** rounds of BURNING on the opponent, and immediately triggers **4** of them. (Servant passive)", "Every **7** rounds, own ATK is altered to deal **20%** damage for every round survived (Servant passive)", "Deflects **18%** damage. This is tripled if the servant is alive (Witch passive)", "Has **+20%** dodge rate. After a successful dodge, decreases the opponent's DEF/MR by **35%**, and if the witch has at least **70** 💧, consumes it to slash, dealing **175%** undodgeable true damage (Witch passive)"]),
    new skillInfo(49, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (eStats.candnotif !== 1) {
            notice.push(`\n✧ You leave me with no choice. ✧`);
            dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${enemy.name}**`, { atkMultiplier: 4, magicDamage: true, dodge: false, ignoreShield: true });
            return AbilityResponse.SUCCESS;
        } else {
            eStats.sm += 60;
            return AbilityResponse.FAILURE;
        };
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.refuseATK = true;
        eStats.lastroundHP = eStats.hp;
        eStats.mdChance = 1;
        eStats.candnotif = 1;

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (Math.random() < 0.75) {
                eStats.sm += 20;
                if (eStats.sm > eStats.mana) eStats.sm = eStats.mana;
            };
            if (eStats.hp < eStats.lastroundHP) {
                eStats.md *= 1.05;
                ebuff.md.push(new buffInfo("*", 1.05, 9999));
                eStats.def *= 0.985;
                ebuff.def.push(new buffInfo("*", 0.985, 9999));
            };
            eStats.lastroundHP = eStats.hp;
            if (eStats.hp / eStats.maxhp < 0.5) {
                if (eStats.candnotif > 0) {
                    notice.push(`\n✧ Why, why do you have to ruin our party... ✧`);
                    eStats.candnotif--;
                };
                addHeal(eStats, myStats, eStats, ebuff, mybuff, matchStats, notice, ``, Math.floor(eStats.maxhp / 2), {});
                notice.push(`\n✧ This party... has to go on! ✧`);
            };
            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, [313, "Multiphase (2 phases)", "__Rules of Madoka Magica__: There is no servant for this floor, meaning you are led to the witch directly", "The kind witch does not attack normally, but all her potential hits are magical (scaling off MD)", "Has **+80%** dodge rate, and has a **75%** chance to additionally gain **20** 💧 at the start of the round", "When below **50%** HP at the start of the round, recovers **50%** max HP", "If the witch's HP is lower than that the last round, gains **1x** Suppressed Anger and Vulnerability, gaining **+5%** MD but loosing **1.5%** DEF", "Active (140 💧) : Only usable after healing from her passive the first time. Deals **400%** undodgeable true damage."]),
    new skillInfo(50, 1000000, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.FAILURE;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Homulily
        eStats.phase = 1;
        eStats.maxphase = 6;
        eStats.phaseNotif = ["The guilty Homulily retreats...", "Servant defeated!", "Servant defeated!", "Homulily has **75%** HP left!", "Homulily has **50%** HP left!", "Homulily has **25%** HP left!"];
        myStats.vulnerabilityDynamic ??= 1;
        let roleAssign = Math.random();
        if (roleAssign < 0.33) {
            myStats.atk += Math.floor(myStats.atk * 0.3);
            myStats.md += Math.floor(myStats.md * 0.3);
            mybuff.atk.push(new buffInfo("*", 1.3, 9999));
            mybuff.md.push(new buffInfo("*", 1.3, 9999));
            notice.push(`\n✧ Your assigned role is **Executioner** ✧`);
            myStats.dodge -= 0.3;
            if (myStats.dodge < 0) myStats.dodge = 0;
            mybuff.dodge.push(new buffInfo("+", 0.3, 9999));
        } else if (roleAssign < 0.67) {
            myStats.evadeDeathStrike ??= 0;
            myStats.evadeDeathChance ??= 0;
            myStats.evadeDeathStrike += 2;
            myStats.evadeDeathChance += 2;
            notice.push(`\n✧ Your assigned role is **Bystander** ✧`);
            myStats.dodge -= 0.3;
            if (myStats.dodge < 0) myStats.dodge = 0;
            mybuff.dodge.push(new buffInfo("+", 0.3, 9999));
        } else {
            myStats.dodge -= 0.15;
            if (myStats.dodge < 0) myStats.dodge = 0;
            mybuff.dodge.push(new buffInfo("+", 0.15, 9999));
            notice.push(`\n✧ Your assigned role is **Friend?** ✧`);
        };

        matchStats.on("phaseChange", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (caster === eStats) {
                switch (eStats.phase) {
                    case 2: {
                        notice.push(`\n✧ Fated be my return... ✧`);
                        notice.push(`\n✧ Servant: **Clara Doll** takes on the battlefield! ✧`);
                        embed.setImage(`https://i.ibb.co/YB1pZFyL/image-6.jpg`);
                        break;
                    };
                    case 3: {
                        notice.push(`\n✧ Execution... noone else but me... ✧`);
                        notice.push(`\n✧ Servant: **Lotte** takes on the battlefield! ✧`);
                        embed.setImage(`https://i.ibb.co/xqTNLrpp/image-7.jpg`);
                        break;
                    };
                    case 4: {
                        embed.setImage(`https://i.ibb.co/jv1W0cHc/image-8.jpg`);
                        eStats.replaceButton = {};
                        eStats.replaceButton.atk = {
                            "run": async (eStats, eStatsFixed, myStats, ebuff, mybuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${enemy.name}**`, { atkMultiplier: 2.5, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, mdChance: -1 });
                                return AbilityResponse.SUCCESS;
                            },
                        };
                        break;
                    };
                    case 5:
                    case 6: {
                        notice.push(`\n✧ Is it...  hopeless? ✧`);
                        eStats.atk *= 1.25;
                        eStats.md *= 1.25;
                        ebuff.atk.push(new buffInfo("*", 1.25, 9999));
                        ebuff.md.push(new buffInfo("*", 1.25, 9999));
                        myStats.dodge += 0.05;
                        mybuff.dodge.push(new buffInfo("+", 0.05, 9999));
                        if (eStats.sm >= 100) {
                            eStats.sm -= 100;
                            dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${enemy.name}**'s comeback lash`, { atkMultiplier: 2.5, magicDamage: true, dodge: false, mdChance: -1 });
                            myStats.timeFrozen = true;
                            myStats.frozenMessage = `is immobilized by **${enemy.name}**`;

                            // Reset
                            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 3, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                                myStats.timeFrozen = false;

                                return AbilityResponse.SUCCESS;
                            }));
                        };
                        break;
                    };
                };

                return AbilityResponse.SUCCESS;
            };
        });

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            switch (eStats.phase) {
                case 1: {
                    eStats.atk *= 0.5;
                    eStats.md *= 0.5;
                    eStats.def *= 0.5;
                    eStats.mr *= 0.5;
                    break;
                };
                case 2: {
                    if (matchStats.round % 5 === 0) {
                        let buffVal = Math.floor(Math.random() * 2500);
                        eStats.atk += buffVal;
                        eStats.md += buffVal;
                        eStats.def += buffVal;
                        eStats.mr += buffVal;
                        ebuff.atk.push(new buffInfo("+", buffVal, 9999));
                        ebuff.md.push(new buffInfo("+", buffVal, 9999));
                        ebuff.def.push(new buffInfo("+", buffVal, 9999));
                        ebuff.mr.push(new buffInfo("+", buffVal, 9999));
                    };
                    break;
                };
                case 3: {
                    if (myStats.hp / myStats.maxhp < 0.5) {
                        myStats.vulnerabilityDynamic += 0.4;
                        myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                            myStats.vulnerabilityDynamic -= 0.4;
                            return AbilityResponse.SUCCESS;
                        }));
                    };
                    break;
                };
                case 4:
                case 5:
                case 6: {
                    if (matchStats.round % 2 === 0) { eStats.refuseATK = true; } else eStats.refuseATK = false;
                    myStats.dodge += 0.1;
                    if (matchStats.round % 15 === 0) { myStats.dodge -= 0.1; mybuff.dodge.push(new buffInfo("+", -0.1, 9999)); };
                    break;
                };
            };

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, [314, "Multiphase (6 phases)", "__Rules of Madoka Magica__: There is no choice for this floor, as you must fight all servants to reach the witch. (Homulily -> Clara Dolls -> Lotte -> Homulilly Awakened [3 phases])", "Has halved ATK, MD, DEF and MR (Homulily passive)", "Increases ATK, MD, DEF and MR by **0** to **2500** randomly every **5** rounds (Clara doll passive)", "When the opponent is below **50%** HP, they take **40%** more damage (Lotte passive)", "Only attacks every **2** rounds, but deals **250%** magical damage per ATK. The opponent has **+10%** dodge rate, but it is reduced by **10%** every **15** rounds, down to **0%** at most. Upon phase change, increases own ATK/MD by **25%**, and boosts the opponent's dodge rate by **5%**", "Active (100 💧) : Can be used immediately after phase change of Homulily Awakened. Deals **250%** undodgeable true damage, and stuns the opponent for **3** rounds"]),
    new skillInfo(51, 150, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Kriemhild Gretchen
        notice.push(`\n✨ The Witch's Salvation has begun!`);
        matchStats.blockAbilities = 11;
        myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 10, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.kriemGrief > 0) {
                notice.push(`\n✧ Grief SWALLOWS YOU! ✧`);
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${enemy.name}**`, { atkMultiplier: 2, magicDamage: true });
                myStats.kriemAbsorb = 6;
            } else myStats.kriemAbsorb = 4;

            return AbilityResponse.SUCCESS;
        }));

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.kriemGrief = 10;
        eStats.kriemGrieftaken = 0;

        matchStats.on("ATK", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) myStats.kriemGrief += 5;

            return AbilityResponse.SUCCESS;
        });

        matchStats.on("DEF", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) myStats.kriemGrief -= 2;

            return AbilityResponse.SUCCESS;
        });

        matchStats.on("ABILITY", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) myStats.kriemGrief += 7;

            return AbilityResponse.SUCCESS;
        });

        matchStats.on("CSKILL", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) myStats.kriemGrief += 7;

            return AbilityResponse.SUCCESS;
        });

        matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (target === eStats && myStats.kriemAbsorb > 0) {
                eStats.hp += Math.floor(options.damage * 0.51);
                if (eStats.hp > eStats.maxhp) eStats.hp = eStats.maxhp;
                myStats.hp -= Math.floor(options.damage * 0.49);
                if (myStats.hp < 0) myStats.hp = 0;
                notice.push(`\n✧ Taste your grief! ✧`);
            };
        });

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.kriemAbsorb > 0) myStats.kriemAbsorb--;
            eStats.reduceHealing = myStats.kriemGrief * 0.015;
            eStats.damageReduction = Math.min(myStats.kriemGrief * 0.025, 0.75);
            if (myStats.kriemGrief <= 0) {
                myStats.atk *= 1.5;
                myStats.md *= 1.5;
                notice.push(`\n✧ Cleansed of sin... come forth. ✧`);
            };
            if (matchStats.round % 10 === 0) {
                let griefTaken = Math.floor(myStats.kriemGrief * 0.2);
                eStats.kriemGrieftaken += griefTaken;
                myStats.kriemGrief -= griefTaken;
                notice.push(`✧ **${enemy.name}** took **20%** of your Grief (${griefTaken}) ✧`);
            };
            let buffVal = 0.02 * eStats.kriemGrieftaken;
            eStats.atk += Math.floor(eStats.atk * buffVal);
            eStats.md += Math.floor(eStats.md * buffVal);
            eStats.def += Math.floor(eStats.def * buffVal);
            eStats.mr += Math.floor(eStats.mr * buffVal);
            eStats.dodge += buffVal;
            eStats.cr += buffVal;
            eStats.cd += buffVal;

            return AbilityResponse.SUCCESS;
        }));

        return AbilityResponse.SUCCESS;
    }, [315, "__Rules of Madoka Magica__: There is no servant for this floor, meaning you are led to the witch directly. Beware of the stacking and absorption of the unique status `Grief`...", "The user starts with **10** `Grief`. ATK: +5 `Grief` | DEF: -2 `Grief` | Active (✨): +7 `Grief` | Class Skill (⚜️): +7 `Grief`", "Every **1** `Grief` lowers opponent's heals by **2%** (can be negative), and increases the witch's damage mitigation by **2.5%**, up to **75%**. Yet if the opponent has no `Grief`, the opponent has **+50%** ATK.", "Every **10** rounds, the witch takes **20%** of the `Grief`. The witch gains a **2%** stat bonus for every `Grief` taken this way permanently.", "Active: Witch's Salvation (150 💧) : Starts a **10** round countdown. By the end of the countdown, should the opponent have any `Grief`, she deals **200%** magic damage and marks the user with __ABSORPTION__ for **5** rounds. Else, only marks them with the effect for **3** rounds.\n\n__ABSORPTION__: For the next rounds, attacks will heal the witch by **51%** of the damage while reflecting back the other **49%** as damage."]),
    new skillInfo(52, 70, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Medusa
        let hpLoss = myStats.maxhp * 0.1;
        dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ ${enemy.name}`, { overwriteDamage: hpLoss, magicDamage: true, dodge: false });
        myStats.maxhp -= Math.floor(hpLoss);
        notice.push(`\n✨ **${enemy.name}** reduced your max HP... The end is near.`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.counter ??= 0;
        notice.push(`\n✧ It seems particularly dark here... ✧`);

        // 5% chance to turn to stone every round
        if (Math.random() < 0.05) {
            myStats.hp = 0;
            myStats.rev = 0;
            notice.push(`\n✧ Is something glowing up ahead? ✧`);
            notice.push(`\n✨ **${char.name}** is turned into stone...`);
            return AbilityResponse.FAILURE;
        } else {
            eStats.counter++;
        };

        matchStats.on("ATK", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) notice.push(`\n✧ Sure, swinging your hands at the dark... very wise. ✧`);

            return AbilityResponse.SUCCESS;
        });

        matchStats.on("ABILITY", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) notice.push(`\n✧ Am I supposed to clap and applaud? ✧`);

            return AbilityResponse.SUCCESS;
        });

        matchStats.on("CSKILL", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
            if (caster === myStats) notice.push(`\n✧ As if that would... nevermind. ✧`);

            return AbilityResponse.SUCCESS;
        });

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // 5% chance to turn to stone every round
            if (Math.random() < 0.05) {
                myStats.hp = 0;
                myStats.rev = 0;
                notice.push(`\n✧ Is something glowing up ahead? ✧`);
                notice.push(`\n✨ **${char.name}** is turned into stone...`);
                return AbilityResponse.FAILURE;
            } else eStats.counter++;

            // On round 4: DEF check -> Petrify
            if (matchStats.round === 4 && matchStats.defUsed < 3) {
                myStats.hp = 0;
                myStats.rev = 0;
                notice.push(`\n✧ Is something glowing up ahead? ✧`);
                notice.push(`\n✨ **${char.name}** is turned into stone...`);
                return AbilityResponse.FAILURE;
            };

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, [316, "- Has a **5%** chance every round to turn the opponent into stone, forcing them to immediately lose. If this doesn't trigger, instead counters the next hit.\n- If the opponent has used less than **3** DEFs by round **4**, they are turned to stone immediately\n- **Active** (70 :droplet:) : Deals **10%** of opponent's max HP to them, then reduce opponent's max HP by **10%**\n\n**Lore**:\n> As one of the Gorgons, Medusa lived a happy life until the fateful day when her life turned to a nightmare. Since then, she found a way to protect herself, but fate just would not have it for her. In times to come, she will be known as evil when in truth, she was only a victim of something very tragic."]),
    new skillInfo(53, 250, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Kuronosu Active Skill: Replaces a random button permanently
        const targetKeys: (keyof typeof myStats.replaceButton)[] = ["atk", "def", "ability", "cskill", "skip"];
        const randomKey = targetKeys[Math.floor(Math.random() * targetKeys.length)];

        myStats.replaceButton[randomKey] = {
            "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                // Heals the boss (eStats) to full HP
                addHeal(eStats, myStats, eStats, ebuff, mybuff, matchStats, notice, ``, eStats.maxhp, {});
                notice.push(`\n✧ Time rewind... **${enemy.name}** recovers all HP ✧`);
                return AbilityResponse.SUCCESS;
            },
        };

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Boss Passive Setup
        eStats.kuroAwait = false;
        eStats.kuroSequence = [];
        eStats.playerDeathMessage = "✧ See? The battle was over before it even began. ✧";
        notice.push(`\n✧ Oh my, would you look at the time! ✧`);

        const pool: string[] = ["ATK", "DEF", "ABILITY", "CSKILL", "SKIP"];

        const generateList = (): string[] => {
            return Array.from({ length: 5 }, () => pool[Math.floor(Math.random() * pool.length)]);
        };

        // Persistent event listener with strict state boundaries
        matchStats.on("action", async ({ trigger, caster, target, casterBuff, targetBuff, options }) => {
            // Guard: Only execute during an active Chronostasis sequence triggered by the player
            if (caster !== myStats || !eStats.kuroAwait) return AbilityResponse.SUCCESS;

            const currentIndex = matchStats.actionSequence.length - 1;
            const expectedAction = eStats.kuroSequence[currentIndex];
            const actualAction = matchStats.actionSequence[currentIndex];

            // 1. Verify misalignment for the CURRENT action step
            if (actualAction !== expectedAction) {
                let hpLoss = Math.floor(myStats.maxhp * 0.25);
                myStats.hp -= hpLoss;
                notice.push(`\n✧ ERROR: OFF-SCRIPT DETECTED (-${hpLoss} HP, 25% Max HP) ✧`);
            } else {
                // Maintain timeout false behavior while the player stays perfectly aligned
                noTimeout(matchStats, myStats);
                notice.push(`\n✧ Go on... ✧`);
            };

            // 2. Wrap-up check: Triggers unconditionally exactly when 5 actions are reached
            if (matchStats.actionSequence.length === 5) {
                eStats.kuroAwait = false;
                matchStats.actionSequence = [];
                notice.push(`\n✧ Chronostasis: SEQUENCE ENDED ✧`);

                // Heals 33% of MISSING HP
                addHeal(eStats, myStats, eStats, ebuff, mybuff, matchStats, notice, `⏩ Time Elapse!`, Math.floor((eStats.maxhp - eStats.hp) * 0.33), {});

                // Deals 4 hits of 100% damage with scaling lifesteal
                for (let i = 0; i < 4; i++) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⏩ **${enemy.name}**'s **entangled timelines**`, { magicDamage: true, selfheal: true, selfhealAmount: (myStats.hp / myStats.maxhp) < 0.5 ? 0.8 : 0.4 });
                };
            };

            return AbilityResponse.SUCCESS;
        });

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Initiates every 3 rounds
            if (matchStats.round % 3 === 0) {
                eStats.kuroAwait = true;
                eStats.kuroSequence = generateList();
                matchStats.actionSequence = []; // Purge prior round entries
                notice.push(`\n✧ Chronostasis: ${eStats.kuroSequence.join(" -> ")} ✧`);
            };

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, [317, "Initiates [Chronostasis] at the start of every **3** rounds\n\n[Chronostasis] :\n- A brief sequence of **5** actions will appear. The next **5** actions of the opponent will be timeout false.\n- If any action of the opponent misaligns with the sequence, the opponent looses **25%** max HP.\n- After **5** actions, exits the sequence. The boss recovers **33%** missing HP and deals **4** hits of **100%** damage with **40%** lifesteal. Lifesteal is doubled if the player is under **50%** HP.\n\nActive (250 :droplet:) : Replaces a random button of the opponent permanently, to heal itself to full HP.\n\n**Lore**:\n> At some point in life one may ask themselves: What is time? Most may say it is the temporal aspect of events happening in order; that all life experiences and memories are contained within it. There is a strict causality. The consequence of an action cannot happen before the action itself. Some may say it is a measurement of motion. The faster something is, the less time it needs to move a certain distance. Some others may say it is motion itself. All that exist is depending on motion on the smallest scales. And what brings everything in motion is friction through temperature. No temperature means no time exists. The longer Kuronosu thought about it, the more headaches he got. But one day, time seemed to move differently around him, but he did not understand why. To a certain extent, he was able to control it, but most of it was not up to him."]),
    new skillInfo(54, 80, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Espathera (alter) - Active: 15% damage per death evasion; round 30+ ends fight
        const dmg = 0.15 * eStats.espatheraTotalEvasions;
        dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${enemy.name}**`, { atkMultiplier: dmg, magicDamage: true });

        if (matchStats.round >= 30) {
            myStats.hp = 0;
            myStats.rev = 0;
            notice.push(`\n⏳ Time's up. **${enemy.name}** ends the fight.`);
            return AbilityResponse.FAILURE;
        }
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Espathera (alter) - Passives
        eStats.espatheraTotalEvasions ??= 0;
        eStats.evadeDeathStrike ??= 0;
        eStats.evadeDeathChance ??= 0;
        eStats.phase = 1;
        eStats.maxphase = 2;
        eStats.indifference ??= 0;

        notice.push(`\n✧ Art thou worthy? ✧`);

        // Alters ATK
        eStats.replaceButton = {};
        eStats.replaceButton.atk = {
            run: async (myStats: any, myStatsFixed: any, eStats: any, mybuff: any, ebuff: any, char: any, enemy: any, matchStats: any, notice: any, embed: any, user: any, ...list: any[]) => {
                const missingRatio = (eStats.maxhp - eStats.hp) / eStats.maxhp;
                const hits = Math.max(1, Math.floor(missingRatio / 0.2));
                for (let i = 0; i < hits; i++) {
                    dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `🌿 **${enemy.name}**'s Letting go...`, { atkMultiplier: 0.44, magicDamage: true });
                    myStats.maxhp -= Math.floor(myStats.maxhp * 0.04);
                };
                return AbilityResponse.SUCCESS;
            }
        };

        // Gain indifference (P1)
        matchStats.on("attack", {
            callback: ({ target, matchStats }) => {
                if (target === eStats && matchStats.round % 2 === 0 && eStats.phase === 1) {
                    eStats.indifference += 1 + Math.floor(Math.random() * 5);
                };
                return true;
            }
        });

        // Phase 2: Death evasion → steal 5% CD from opponent
        matchStats.on("deathEvade", {
            callback: ({ target, matchStats }) => {
                if (target === eStats && target.phase === 2) {
                    myStats.cd -= 0.05;
                    eStats.cd += 0.05;
                    mybuff.cd.push(new buffInfo("+", -0.05, 9999));
                    ebuff.cd.push(new buffInfo("+", 0.05, 9999));
                    eStats.espatheraTotalEvasions++;
                };
                return true;
            }
        });

        eStats.refuseATKMessage = ["✧ Cultivating... ✧", "✧ Meditating on the path... ✧"];

        // Cultivation passive
        eStats.refuseATK = true;
        eStats.atk += Math.floor(eStats.atk * 0.04);
        eStats.md += Math.floor(eStats.md * 0.04);
        ebuff.atk.push(new buffInfo("*", 1.04, 9999));
        ebuff.md.push(new buffInfo("*", 1.04, 9999));

        matchStats.on("phaseChange", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
            if (caster === eStats) {
                eStats.evadeDeathStrike = eStats.indifference;
                eStats.evadeDeathChance = eStats.indifference;
                eStats.refuseATK = false;
            };
            return AbilityResponse.SUCCESS;
        });


        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (eStats.phase === 1) {
                if (matchStats.round % 2 === 1) {
                    // [Cultivation] — odd rounds: no ATK, +4% ATK/MD
                    eStats.refuseATK = true;
                    eStats.atk += Math.floor(eStats.atk * 0.04);
                    eStats.md += Math.floor(eStats.md * 0.04);
                    ebuff.atk.push(new buffInfo("*", 1.04, 9999));
                    ebuff.md.push(new buffInfo("*", 1.04, 9999));
                } else {
                    // [Letting go...] — even rounds: boss ATK fires normally
                    eStats.refuseATK = false;
                };
            } else {
                myStats.negateHeal = 1;
                eStats.dodge = 0;
            };
            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, [318, "Altered ATKs, rings and runes are disabled", "On **odd** rounds, gains [Cultivation], refusing to ATK but increasing own ATK & MD by **4%** permanently. (Phase 1)", "- On **even** rounds, gains [Letting go...], ATK hits **1** time for every **20%** missing HP, dealing **44%** damage and reducing opponent's max HP by **4%**. A successful hit grants **1-5x** `Indifference`. (Phase 1)", "Upon entering phase 2, evades the next number of lethal hits equal to owned `Indifference`", "Cannot heal or dodge. After every death evasion, steals **5%** crit damage from the opponent. (Phase 2)\n- **Active** (80 :droplet:) : Deals **15%** damage for each death evasion. If round **30+**, ends the fight.\n\n**Lore**:\n> On the path of finding wisdom, Espathera found herself in the field of Stoics. Acknowledging that some things could not be under her control, she focused her way of life on things she could change. Doing so, she obtained an epiphany that allowed her to enter a higher plane of existence."]),
    new skillInfo(55, 100, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Iustitia
        matchStats.baneLvl = (matchStats.baneLvl ?? myStats.lvl) + 10;
        notice.push(`\n⚖️ **${enemy.name}** elevates your profile level by **10**`);
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.baneClvl ??= myStats.lvl;
        const baneStats = await getUserSchema(user.id);
        matchStats.baneLvl ??= baneStats ? userLevel(baneStats.xp) : myStats.lvl;

        eStats.rev = 1;
        eStats.maxRevivals = 2;
        eStats.revhp = 0.5;
        notice.push(`\n⚖️ **${enemy.name}** puts you on trial...`);

        matchStats.on("revival", {
            callback: ({ caster, matchStats }) => {
                if (caster === eStats) {
                    matchStats.baneClvl += 10;
                    matchStats.baneLvl += 20;
                    mybuff.hp.push(new buffInfo("+", 60, 9999));
                    mybuff.atk.push(new buffInfo("+", 30, 9999, 30, "+"));
                    mybuff.def.push(new buffInfo("+", 20, 9999, 20, "+"));
                    notice.push(`\n⚖️ Your power grows — clvl +**10**, lvl +**20**`);
                };
                return true;
            }
        });

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.baneClvl += 5;
            myStats.maxhp += 30;
            myStats.hp += 30;
            mybuff.atk.push(new buffInfo("+", 15, 1));
            mybuff.def.push(new buffInfo("+", 10, 1));
            notice.push(`\n⚖️ Level up! clvl +**5** (total: **${matchStats.baneClvl}**)`);
            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, [319, "- Every round, raises the opponent's character level by **5**\n- Can revive **2** times. On each revival, raises opponent's character level by **10** and profile level by **20**.\n- Curse is set to <:Bane_of_the_Powerful:1516679506255937619>\n- **Active** (100 :droplet:) : Raises the opponent's profile level by **10**.\n\n**Lore**:\n> Strength. Most people yearn to possess this trait. To protect themselves, to protect people dear to them, to protect other important things dear to them. Or to rule over others. It is neither inherently good or inherently bad. It is up to the respective person what to do with it. But going up in the hierarchy comes with greater responsibilities. Humans tend to leave the righteous path when they amass a lot of this strength. Or rather, their strength corrupted to power. Iustitia is putting humans on trial if they are worthy and responsible enough to possess this trait."]),
    new skillInfo(56, 100, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Luxuria (alter)
        myStats.timeFrozen = true;
        myStats.frozenMessage = `is immobilized by **${enemy.name}**`;
        myStats.def -= Math.floor(myStats.def * 0.5);
        myStats.mr -= Math.floor(myStats.mr * 0.5);

        // Reset
        myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.timeFrozen = false;

            return AbilityResponse.SUCCESS;
        }));
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.costForAction ??= 0;
        matchStats.costForAction += 12;

        // Alters ATK
        eStats.replaceButton = {};
        eStats.replaceButton.atk = {
            run: async (myStats: any, myStatsFixed: any, eStats: any, mybuff: any, ebuff: any, char: any, enemy: any, matchStats: any, notice: any, embed: any, user: any, ...list: any[]) => {
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `⚔️ **${enemy.name}**`, { atkMultiplier: 0.9 + (0.04 * matchStats.round), magicDamage: true });

                return AbilityResponse.SUCCESS;
            }
        };

        // Skip a round upon healing
        matchStats.on("heal", {
            callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (target === myStats) {
                    myStats.timeFrozen = true;
                    myStats.frozenMessage = `is immobilized by **${enemy.name}**`;

                    // Reset
                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        myStats.timeFrozen = false;

                        return AbilityResponse.SUCCESS;
                    }));
                };
            }
        });

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (Math.random() < 0.4) matchStats.costForAction++;

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, [320, "Every healing instance on the opponent will stun themselves (skip 1 round)", "Every action of the opponent costs **12** 💧. This has a **40%** chance to be increased by **1** every round. If the opponent has insufficient mana, they loose **8%** max HP permanently.", "ATK is altered to deal **90%** damage. The damage-scaling is increased by **4%** after every round.\n\n**Lore**:\n> Agility and protection are important in fights. But where is the right balance? And what if they are used against oneself? Luxuria made it her specialty to exploit the reliance of common sense."]),
];

export const eventBossAbilities: skillInfo[] = [
    new skillInfo(0, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.shield += Math.floor(eStats.hp * 0.001);
        notice.push(`\n✨ **${enemy.name}** has recovered **${Math.floor(eStats.hp * 0.001)}** shield`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [99, "Rumbleguard deals 300% magic damage, heals himself for 20% missing health"]),
    new skillInfo(1, 80, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.def += 100;
        eStats.mr += 100;
        notice.push(`\n✨ **${enemy.name}** increased his DEF and MR by **${100}**`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [99, "Sylvanoss deals 300% magic damage, heals himself for 20% missing health"]),
    new skillInfo(2, 60, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor(((eStats.md * Math.pow(0.99895, myStats.mr)) * (1 - (0.2 * Math.random()))) * 1.5);
        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -satk, {});
        if (myStats.hp < 0) myStats.hp = 0;
        eStats.sm -= 40;
        notice.push(`\n✨ **${enemy.name}** has dealt **${satk}** magic damage`);

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [99, "Celestion deals 200% magic damage"]),
    new skillInfo(3, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (Math.random() < 0.32) {
            const md = Math.random() < 0.5;
            let satk = Math.floor((((md ? eStats.md : eStats.atk) * Math.pow(0.99895, (md ? myStats.mr : myStats.def))) * (1 - (0.2 * Math.random()))) * 1.25);
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -satk, {});
            if (myStats.hp < 0) myStats.hp = 0;
            notice.push(`\n✨ **${enemy.name}** has dealt **${satk}** ${md ? "magic " : ""}damage`);
        } else if (Math.random() < 0.33) {
            const md = Math.random() < 0.5;
            if (md) eStats.md += Math.floor(eStats.md * 0.1);
            else eStats.atk += Math.floor(eStats.atk * 0.1);
            notice.push(`\n✨ **${enemy.name}** has increased ${md ? "MD" : "ATK"} by **10%**`);
        } else {
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -Math.floor(myStats.maxhp * 0.1), {});
            if (myStats.hp < 0) myStats.hp = 0;
            notice.push(`\n✨ **${enemy.name}** has burned **${10}%** of your HP`);
        };

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [99, "Malevokar deals 300% magic damage, heals himself for 20% missing health"]),
    new skillInfo(4, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if ((eStats.hp / eStats.maxhp) > 0.6) {
            ebuff.def.push(new buffInfo("+", 100, 4));
            ebuff.md.push(new buffInfo("+", 100, 4));
            mybuff.dodge.push(new buffInfo("+", -0.1, 4));
            notice.push(`\n✨ **${enemy.name}** increased DEF and MD by **+100** and decreased **${char.name}**'s dodge chance by **10%** for 4 rounds`);
        } else {
            ebuff.cr.push(new buffInfo("+", 0.15, 4));
            ebuff.cd.push(new buffInfo("+", 0.3, 4));
            notice.push(`\n✨ **${enemy.name}** increased crit rate by **15%** and crit damage by **30%** for 4 rounds!`);
        };

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [99, "Goblin King"]),
    new skillInfo(5, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (Math.random() < 0.4) {
            const md = Math.random() < 0.5;
            let satk = Math.floor((((md ? eStats.md : eStats.atk) * Math.pow(0.99895, (md ? myStats.mr : myStats.def))) * (1 - (0.2 * Math.random()))) * 1.25);
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -satk, {});
            if (myStats.hp < 0) myStats.hp = 0;
            notice.push(`\n✨ **${enemy.name}** has dealt **${satk}** ${md ? "magic " : ""}damage`);
        } else if (Math.random() < 0.38) {
            const md = Math.random() < 0.5;
            if (md) eStats.md += Math.floor(eStats.md * 0.1);
            else eStats.atk += Math.floor(eStats.atk * 0.1);
            notice.push(`\n✨ **${enemy.name}** has increased ${md ? "MD" : "ATK"} by **10%**`);
        } else {
            const addShield = 1000 + Math.floor(Math.random() * 1000);
            eStats.shield += addShield;
            notice.push(`\n✨ **${enemy.name}** has gained **${addShield}** shield!`);
        };

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [99, "Goblin General"]),
    new skillInfo(6, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if ((eStats.hp / eStats.maxhp) > 0.6) {
            ebuff.def.push(new buffInfo("+", 100, 4));
            ebuff.md.push(new buffInfo("+", 100, 4));
            mybuff.dodge.push(new buffInfo("+", -0.1, 4));
            notice.push(`\n🎃 **${enemy.name}** increased DEF and MD by **+100** and decreased **${char.name}**'s dodge chance by **10%** for 4 rounds`);
        } else {
            ebuff.cr.push(new buffInfo("+", 0.15, 4));
            ebuff.cd.push(new buffInfo("+", 0.3, 4));
            notice.push(`\n🎃 **${enemy.name}** increased crit rate by **15%** and crit damage by **30%** for 4 rounds!`);
        };

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [99, "Pumpkin King"]),
    new skillInfo(7, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (Math.random() < 0.4) {
            const md = Math.random() < 0.5;
            let satk = Math.floor((((md ? eStats.md : eStats.atk) * Math.pow(0.99895, (md ? myStats.mr : myStats.def))) * (1 - (0.2 * Math.random()))) * 1.25);
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -satk, {});
            if (myStats.hp < 0) myStats.hp = 0;
            notice.push(`\n🎃 **${enemy.name}** has dealt **${satk}** ${md ? "magic " : ""}damage`);
        } else if (Math.random() < 0.38) {
            const md = Math.random() < 0.5;
            if (md) eStats.md += Math.floor(eStats.md * 0.1);
            else eStats.atk += Math.floor(eStats.atk * 0.1);
            notice.push(`\n🎃 **${enemy.name}** has increased ${md ? "MD" : "ATK"} by **10%**`);
        } else {
            const addShield = 1000 + Math.floor(Math.random() * 1000);
            eStats.shield += addShield;
            notice.push(`\n🎃 **${enemy.name}** has gained **${addShield}** shield!`);
        };

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [99, "Pumpkin General"]),
    new skillInfo(8, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [99, "Pumpkin Imp"]),

    new skillInfo(9, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        notice.push(`\n🥚 **${enemy.name}** used spit! But nothing happened...`);

        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        setTimeout(() => {
            eStats.image = "https://i.ibb.co/gP8KVvZ/eggsplorer.gif";
        }, 20000);

        return AbilityResponse.SUCCESS;
    }, [99, "Eggsplorer"]),
    new skillInfo(10, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (Math.random() < 0.4) {
            const md = Math.random() < 0.5;
            let satk = Math.floor((((md ? eStats.md : eStats.atk) * Math.pow(0.99895, (md ? myStats.mr : myStats.def))) * (1 - (0.2 * Math.random()))) * 1.25);
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -satk, {});
            if (myStats.hp < 0) myStats.hp = 0;
            notice.push(`\n🥚 **${enemy.name}** has dealt **${satk}** ${md ? "magic " : ""}damage`);
        } else if (Math.random() < 0.38) {
            const md = Math.random() < 0.5;
            if (md) eStats.md += Math.floor(eStats.md * 0.1);
            else eStats.atk += Math.floor(eStats.atk * 0.1);
            notice.push(`\n🥚 **${enemy.name}** has increased ${md ? "MD" : "ATK"} by **10%**`);
        } else {
            const addShield = 1000 + Math.floor(Math.random() * 1000);
            eStats.shield += addShield;
            notice.push(`\n🥚 **${enemy.name}** has gained **${addShield}** shield!`);
        };

        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [99, "Eggsecutioner"]),
    new skillInfo(11, 30, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async () => AbilityResponse.SUCCESS, [99, "Scrambler"]),

];

export const crazeBossAbilities2023: skillInfo[] = [
    new skillInfo(0, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        return AbilityResponse.SUCCESS;
    }, [1, "Dimensional Soul Eater"]),
    new skillInfo(1, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        return AbilityResponse.SUCCESS;
    }, [2, "Earth Golem"]),
    new skillInfo(2, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        if (char.gender === "F") {
            eStats.image = "https://i.imgur.com/euwNVSZ.png";
            eStats.atk = 0;
            eStats.md = 0;
            eStats.def = 600;
            eStats.mr = 600;
            ebuff.atk.push(new buffInfo("=", 0, 9999));
            ebuff.md.push(new buffInfo("=", 0, 9999));
            ebuff.def.push(new buffInfo("=", 600, 9999));
            ebuff.mr.push(new buffInfo("=", 600, 9999));
        } else if (char.id === 1600) {
            eStats.image = "https://i.imgur.com/Jz1mrR3.png";
            eStats.hp = Math.floor(eStats.hp * 0.6);
            eStats.atk *= 0.4;
            eStats.md *= 0.4;
            eStats.def = 100;
            eStats.mr = 100;
            ebuff.atk.push(new buffInfo("*", 0.4, 9999));
            ebuff.md.push(new buffInfo("*", 0.4, 9999));
            ebuff.def.push(new buffInfo("=", 100, 9999));
            ebuff.mr.push(new buffInfo("=", 100, 9999));
        };

        return AbilityResponse.SUCCESS;
    }, [3, "Sanji"]),
    new skillInfo(3, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if (myStats.revivedTotal > 0) {
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 3.1415), 9999));
                myStats.atk += Math.floor(myStats.atk * 3.1415);
                mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 3.1415), 9999));
                myStats.md += Math.floor(myStats.md * 3.1415);

                //@ts-expect-error
                this.used++;
            };

            return AbilityResponse.SUCCESS;
        }, 9999, 1));

        return AbilityResponse.SUCCESS;
    }, [4, "Qual"]),
    new skillInfo(4, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, [5, "Bojji"]),
    new skillInfo(5, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, [6, "Skeleton Soldier"]),
    new skillInfo(6, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (char.id === 919) {
            eStats.image = "https://i.imgur.com/0eUOI2g.jpg";
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                addHeal(eStats, eStats, eStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(eStats.maxhp * 0.15), {});
                if (eStats.hp > eStats.maxhp) eStats.hp = eStats.maxhp;

                return AbilityResponse.SUCCESS;
            }, 9999));
        } else {
            eStats.executeHP = 1.01;
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                eStats.hp -= Math.floor(eStats.maxhp * 0.15);
                if (eStats.hp < 0) eStats.hp = 0;

                return AbilityResponse.SUCCESS;
            }, 9999));
        };

        return AbilityResponse.SUCCESS;
    }, [7, "Mahito"]),
    new skillInfo(7, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if (eStats.wet) {
                eStats.image = "https://i.ibb.co/47XdqrJ/croco-wet.png";
                embed.setImage(eStats.image);

                ebuff.def.push(new buffInfo("=", 20, 9999));
                eStats.def = 20;
                ebuff.mr.push(new buffInfo("=", 20, 9999));
                eStats.mr = 20;

                notice.push(`\n⚜️ **${enemy.name}** can no longer use his abilities!`);

                //@ts-expect-error
                this.used++;
            } else {
                eStats.hp = eStats.maxhp;
            };

            return AbilityResponse.SUCCESS;
        }, 9999, 1));

        return AbilityResponse.SUCCESS;
    }, [8, "Crocodile"]),
    new skillInfo(8, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        const setDef: number = { "D": 0, "C": 150, "B": 300, "A": 500, "S": 600, "SS": 800, "EX": 1000, "VIP": 1200 }[char.rarity as CharacterRarity];
        const multAtk: number = { "D": 3.2, "C": 2, "B": 1.6, "A": 1.2, "S": 0.8, "SS": 0.6, "EX": 0.4, "VIP": 0.2 }[char.rarity as CharacterRarity] * ((7 - (items[myStats.weapon]?.gradeValue ?? 0)) / 2);

        ebuff.def.push(new buffInfo("=", setDef, 9999));
        eStats.def = setDef;
        ebuff.mr.push(new buffInfo("=", setDef, 9999));
        eStats.mr = setDef;

        mybuff.atk.push(new buffInfo("=", Math.floor(myStats.atk * multAtk), 9999));
        myStats.atk = Math.floor(myStats.atk * multAtk);
        mybuff.md.push(new buffInfo("=", Math.floor(myStats.md * multAtk), 9999));
        myStats.md = Math.floor(myStats.md * multAtk);

        return AbilityResponse.SUCCESS;
    }, [9, "Jiro Awasaka"]),
    new skillInfo(9, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (myStats.weapon == 434) {
            ebuff.def.push(new buffInfo("=", 200, 9999));
            eStats.def = 200;
            ebuff.mr.push(new buffInfo("=", 200, 9999));
            eStats.mr = 200;

            if (char.name === "Isolde EX") {
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 9), 9999));
                myStats.atk += Math.floor(myStats.atk * 9);
                mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 9), 9999));
                myStats.md += Math.floor(myStats.md * 9);
            };
        };

        return AbilityResponse.SUCCESS;
    }, [10, "Durin"]),
    new skillInfo(10, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, [11, "Kaito Kid"]),
    new skillInfo(11, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (items?.[myStats.weapon]?.type === "shield" && items?.[myStats.shieldid]?.type === "shield") {
            mybuff.def.push(new buffInfo("+", 2000, 9999));
            myStats.def += 2000;
            mybuff.mr.push(new buffInfo("+", 2000, 9999));
            myStats.mr += 2000;

            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 1.5), 9999));
            myStats.atk += Math.floor(myStats.atk * 1.5);
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 1.5), 9999));
            myStats.md += Math.floor(myStats.md * 1.5);
        };

        return AbilityResponse.SUCCESS;
    }, [12, "Garou"]),
    new skillInfo(12, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.forceUseSkillOnRound = 1;

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.eStatsCC = { ...eStats };
            matchStats.currentOpponent = 1;
            eStats.image = "https://i.ibb.co/DrSCF5S/veldora.png";
            embed.setImage(eStats.image);

            eStats.hp = Math.floor(eStats.maxhp * 9999);
            eStats.maxhp = Math.floor(eStats.maxhp * 9999);
            eStats.def = 1500;
            eStats.mr = 1500;
            notice.push(`\n⚜️ **${enemy.name}** summoned Veldora!`);

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, [13, "Slime"]),
    new skillInfo(13, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, [14, "Gojo Satoru"]),



];

export const crazeBossAbilities2024: skillInfo[] = [
    new skillInfo(0, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        return AbilityResponse.SUCCESS;
    }, [1, "Dimensional Soul Eater"]),
    new skillInfo(1, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        return AbilityResponse.SUCCESS;
    }, [2, "Earth Golem"]),
    new skillInfo(2, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        // If enemy is Luffy
        if (char.id === 1000) {
            eStats.image = "https://i.ibb.co/ysZ0QTb/boa.png";
            eStats.atk = 0;
            eStats.md = 0;
            eStats.def = 600;
            eStats.mr = 600;
            ebuff.atk.push(new buffInfo("=", 0, 9999));
            ebuff.md.push(new buffInfo("=", 0, 9999));
            ebuff.def.push(new buffInfo("=", 600, 9999));
            ebuff.mr.push(new buffInfo("=", 600, 9999));
        };

        return AbilityResponse.SUCCESS;
    }, [3, "Boa Hancock"]),
    new skillInfo(3, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        notice.push(`\n⚖️ **${enemy.name}** weighs your souls`);

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (eStats.mana > myStats.mana) {
                myStats.hp = 0;
                myStats.rev = 0;
                myStats.revhp = 0;
            } else {
                eStats.hp = 0;
            };

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, [4, "Aura"]),
    new skillInfo(4, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        // if time is between 08:00-16:00
        if (new Date().getHours() >= 8 && new Date().getHours() < 16) {
            eStats.image = "https://i.ibb.co/kXF8P5M/escanor.png";
            eStats.atk = 5;
            eStats.md = 5;
            eStats.def = 0;
            eStats.mr = 0;
            ebuff.atk.push(new buffInfo("=", 5, 9999));
            ebuff.md.push(new buffInfo("=", 5, 9999));
            ebuff.def.push(new buffInfo("=", 0, 9999));
            ebuff.mr.push(new buffInfo("=", 0, 9999));
        };

        return AbilityResponse.SUCCESS;
    }, [5, "Escanor"]),
    new skillInfo(5, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        // if player has any equipment
        if (myStats.uniqueids?.length) {
            ebuff.atk.push(new buffInfo("*", 2, 9999, 2, "*"));
            ebuff.md.push(new buffInfo("*", 2, 9999, 2, "*"));
        } else {
            const atkMultiplier = 10;
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * atkMultiplier), 9999));
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * atkMultiplier), 9999));
            myStats.atk += Math.floor(myStats.atk * atkMultiplier);
            myStats.md += Math.floor(myStats.md * atkMultiplier);
        };

        return AbilityResponse.SUCCESS;
    }, [6, "Izuru Kira"]),
    new skillInfo(6, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        const stats = await getUserSchema(matchStats.interaction.user.id);

        if (stats?.craze_levels?.['15']) {
            eStats.image = "https://i.ibb.co/9p7zvsV/c.png";
            mybuff.atk.push(new buffInfo("*", 30, 9999));
            mybuff.md.push(new buffInfo("*", 30, 9999));
            myStats.atk *= 30;
            myStats.md *= 30;
        } else {
            notice.push(`\n🥦 You can't find Zoro, you return`);

            myStats.hp = 0;
            myStats.rev = 0;
            myStats.revhp = 0;
        };

        return AbilityResponse.SUCCESS;
    }, [7, "Zoro"]),
    new skillInfo(7, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        if (myStats.uniqueids.includes('69')) {
            eStats.image = "https://i.ibb.co/7Yq7pHy/p.png";
            eStats.atk = 0;
            eStats.md = 0;
            eStats.def = 0;
            eStats.mr = 0;
            ebuff.atk.push(new buffInfo("=", 0, 9999));
            ebuff.md.push(new buffInfo("=", 0, 9999));
            ebuff.def.push(new buffInfo("=", 0, 9999));
            ebuff.mr.push(new buffInfo("=", 0, 9999));
        };

        return AbilityResponse.SUCCESS;
    }, [8, "Pandemonium"]),
    new skillInfo(8, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        notice.push(`\n📓 **${enemy.name}** uses his Death Note`);

        // If Brook
        if (char.id === 996) {
            notice.push(`\n🎸 but you're already dead, YOHOHOHO!`);

            eStats.def = 50;
            eStats.mr = 50;
            ebuff.def.push(new buffInfo("=", 50, 9999));
            ebuff.mr.push(new buffInfo("=", 50, 9999));

            const atkMultiplier = 10;
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * atkMultiplier), 9999));
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * atkMultiplier), 9999));
            myStats.atk += Math.floor(myStats.atk * atkMultiplier);
            myStats.md += Math.floor(myStats.md * atkMultiplier);
        } else {
            myStats.hp = 0;
            myStats.rev = 0;
            myStats.revhp = 0;
        };

        return AbilityResponse.SUCCESS;
    }, [9, "Light Yagami"]),
    new skillInfo(9, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        notice.push(`\n✨ **${enemy.name}** orders you... die!`);

        if (char.id === 13780) {
            notice.push(`\n✨ ...it's not working!?`);

            eStats.def = 50;
            eStats.mr = 50;
            ebuff.def.push(new buffInfo("=", 50, 9999));
            ebuff.mr.push(new buffInfo("=", 50, 9999));

            const atkMultiplier = 10;
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * atkMultiplier), 9999));
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * atkMultiplier), 9999));
            myStats.atk += Math.floor(myStats.atk * atkMultiplier);
            myStats.md += Math.floor(myStats.md * atkMultiplier);
        } else {
            myStats.hp = 0;
            myStats.rev = 0;
            myStats.revhp = 0;
        };

        return AbilityResponse.SUCCESS;
    }, [10, "Lelouch vi Britannia"]),
    new skillInfo(10, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        myStats.shield = 0;

        if (char.id === 767) {
            myStats.sm = myStats.mana;

            if (myStats.class === 24) {
                const atkMultiplier = 10;
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * atkMultiplier), 9999));
                mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * atkMultiplier), 9999));
                myStats.atk += Math.floor(myStats.atk * atkMultiplier);
                myStats.md += Math.floor(myStats.md * atkMultiplier);
            };
        };

        return AbilityResponse.SUCCESS;
    }, [11, "Larry"]),
    new skillInfo(11, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        return AbilityResponse.SUCCESS;
    }, [12, "Wamuu"]),

    new skillInfo(12, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        if (char.id === 4932) {
            eStats.image = "https://i.ibb.co/wBK7QFW/floor.gif";
            eStats.hp = 1;
            eStats.dodge = 0;
            eStats.br = 0;
            notice.push(`\n🧹 The floor is now clean!`);
        } else {
            notice.push(`\n🧹 It looks menacing, but nothing happens. You leave.`);
            myStats.hp = 0;
            myStats.rev = 0;
            myStats.revhp = 0;
        };

        return AbilityResponse.SUCCESS;
    }, [13, "Floor"]),

    new skillInfo(13, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        const quintuplets = [2, 3, 4, 5, 6];
        const choice = quintuplets[Math.floor(Math.random() * quintuplets.length)];

        if (char.id === choice && Math.random() < 0.2) {
            notice.push(`\n✨ Let's be together, forever.`);
            return AbilityResponse.SUCCESS;
        };

        if (quintuplets.includes(char.id)) notice.push(`\n✨ I'm sorry... it's not you.`);

        return AbilityResponse.FAILURE;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        return AbilityResponse.SUCCESS;
    }, [14, "Fuutarou Uesugi"]),
    new skillInfo(14, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round > 99) {
                eStats.hp = 0;
                notice.push(`\n🙂`);
            } else if (eStats.hp < eStats.maxhp) {
                myStats.hp = 0;
                myStats.rev = 0;
                myStats.revhp = 0;
                notice.push(`\n😐`);
            };

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, [15, "Mob"]),
    new skillInfo(15, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        notice.push(`\n🥦 what's this moss head doing here?!`);

        if ([999, 1003, 1469].includes(char.id)) { // ["nami", "sanji", "perona"]
            notice.push(`\n🥦 You guide him back to his level.`);

            // Sukuna
            eStats.image = "https://i.ibb.co/QF3c2zV/r.png";

            if (char.id === 1469) {
                // scale atk down to 1% of original
                ebuff.atk.push(new buffInfo("+", -Math.floor(eStats.atk * 0.95), 9999));
                ebuff.md.push(new buffInfo("+", -Math.floor(eStats.md * 0.95), 9999));
                eStats.atk -= Math.floor(eStats.atk * 0.95);
                eStats.md -= Math.floor(eStats.md * 0.95);
            };

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

                if (char.id === 1469) {
                    // Sukuna is depressed
                    const sentences = [
                        "I'm so sorry for being alive...",
                        "Even if I were born again, nobody would love me...",
                        "In my next life, I want to be reborn as a sea cucumber...",
                        "My existence is a burden to the universe...",
                        "Why did I think I could ever accomplish anything...",
                        "Even my reflection is embarrassed by me...",
                        "The ground is too good for me to walk on...",
                        "Breathing is too ambitious for me...",
                        "I'm the last person anyone would call for help...",
                        "I should apologize to oxygen for existing...",
                        "Every step I take is a mistake...",
                        "If failure had a mascot, it would be me...",
                        "Even dust is more accomplished than I am...",
                        "The universe must cringe every time I breathe...",
                        "I should hand over my throne to Larry...",
                        "Forget the heavens, I can't even rule over dirt...",
                        "The 'King of Curses'? More like the 'Clown of Curses'...",
                    ];
                    notice.push(`\n👻 ${sentences[Math.floor(Math.random() * sentences.length)]}`);
                };

                const correctSequence = [
                    "ATK", "ATK", "DEF", "DEF", "SKILL",
                    "ATK", "DEF", "DEF", "ATK", "ATK",
                    "ATK", "DEF", "SKILL", "DEF", "ATK",
                    "ATK", "DEF", "ATK", "DEF", "SKILL",
                ];

                if ([5, 10, 15, 20].includes(matchStats.actionSequence.length)) {
                    if (matchStats.actionSequence.every((e: string, i: number) => e === correctSequence[i])) {
                        // deal 30% of max hp each time
                        eStats.hp -= Math.floor(eStats.maxhp * 0.3);
                        if (eStats.hp < 0) eStats.hp = 0;
                    };
                };

                return AbilityResponse.SUCCESS;
            }, 9999));
        };

        return AbilityResponse.SUCCESS;
    }, [16, "Sukuna"]),

];

export const crazeBossAbilities: skillInfo[] = [
    new skillInfo(0, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        return AbilityResponse.SUCCESS;
    }, [1, "Dimensional Soul Eater"]),
    new skillInfo(1, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        return AbilityResponse.SUCCESS;
    }, [2, "Earth Golem"]),
    new skillInfo(2, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        return AbilityResponse.SUCCESS;
    }, [3, "Mime (E33)"]),
    new skillInfo(3, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        // If nakama
        if ([996, 997, 998, 999, 1000, 1001, 1002, 1003, 1004, 1005].includes(char.id)) {
            eStats.image = "https://i.ibb.co/rjmX2Xc/c.png";
        };

        // If fish equipped
        const weapon = myStats.equipped_weapon_id !== null ? items[myStats.equipped_weapon_id] : null;
        if (weapon?.type === "fish") {
            eStats.image = "https://i.ibb.co/DfqJ9w79/c.png";
            eStats.hp = Math.floor(eStats.hp * 0.02);
            eStats.atk = 0;
            eStats.md = 0;
            eStats.def = 600;
            eStats.mr = 600;
            ebuff.atk.push(new buffInfo("=", 0, 9999));
            ebuff.md.push(new buffInfo("=", 0, 9999));
            ebuff.def.push(new buffInfo("=", 600, 9999));
            ebuff.mr.push(new buffInfo("=", 600, 9999));
        };

        return AbilityResponse.SUCCESS;
    }, [4, "Monkey D. Luffy"]),
    new skillInfo(4, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        if (char.id === 1652) {
            eStats.image = "https://i.ibb.co/sd4GXyTk/c.png";
            eStats.hp = Math.floor(eStats.hp * 0.02);
            eStats.atk = 5;
            eStats.md = 5;
            eStats.def = 0;
            eStats.mr = 0;
            ebuff.atk.push(new buffInfo("=", 5, 9999));
            ebuff.md.push(new buffInfo("=", 5, 9999));
            ebuff.def.push(new buffInfo("=", 0, 9999));
            ebuff.mr.push(new buffInfo("=", 0, 9999));
        };

        return AbilityResponse.SUCCESS;
    }, [5, "APPLe"]),
    new skillInfo(5, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        return AbilityResponse.SUCCESS;
    }, [6, "Puss in Boots"]),
    new skillInfo(6, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        return AbilityResponse.SUCCESS;
    }, [7, "Thorfinn"]),
    new skillInfo(7, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        if (char.id === 1824 && !myStats.helmet && !myStats.cuirass && !myStats.gloves && !myStats.boots) {
            eStats.hp = Math.floor(eStats.hp * 0.02);
            eStats.atk = 0;
            eStats.md = 0;
            eStats.def = 0;
            eStats.mr = 0;
            ebuff.atk.push(new buffInfo("=", 0, 9999));
            ebuff.md.push(new buffInfo("=", 0, 9999));
            ebuff.def.push(new buffInfo("=", 0, 9999));
            ebuff.mr.push(new buffInfo("=", 0, 9999));
        };

        return AbilityResponse.SUCCESS;
    }, [8, "Satsuki Kiryuuin"]),
    new skillInfo(8, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        if (char.name === "Tanjirou Kamado" && list[1].some((e: any) => e.name === "Giyuu Tomioka")) {
            eStats.hp = Math.floor(eStats.hp * 0.03);
            eStats.atk *= 0.5;
            eStats.md *= 0.5;
            eStats.def = 0;
            eStats.mr = 0;
            ebuff.atk.push(new buffInfo("*", 0.5, 9999));
            ebuff.md.push(new buffInfo("*", 0.5, 9999));
            ebuff.def.push(new buffInfo("=", 0, 9999));
            ebuff.mr.push(new buffInfo("=", 0, 9999));
        };

        return AbilityResponse.SUCCESS;
    }, [9, "Akaza"]),
    new skillInfo(9, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;

        if (list[1].some((e: any) => e.name === "Serie")) {
            eStats.image = "https://i.ibb.co/rfyf1yGF/c.png";
        };

        return AbilityResponse.SUCCESS;
    }, [10, "Land"]),
    new skillInfo(10, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        if (char.name === "Kanna Kamui") {
            eStats.image = "https://i.ibb.co/zhbSWK6W/c.gif";
            eStats.hp = 0;
            eStats.dodge = 0;
            eStats.br = 0;
            notice.push(`\n🍽️ Kanna ate the world!`);
        } else if (char.name === "Dio Brando") {
            eStats.image = "https://i.ibb.co/wr2V7SMM/c.png";
            notice.push(`\n<a:Jojo_Menacing_1:637672661505409064> ZA WARUDO!!`);
        };

        return AbilityResponse.SUCCESS;
    }, [11, "The World"]),
    new skillInfo(11, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        // list[2] = stats.craze_levels
        if (list[2][11] < 0) {
            eStats.image = "https://i.ibb.co/SD5s5yjg/c.png";
        };

        if ((list[2][11] === -10 && char.name === "Makima") || (list[2][11] > 0)) {
            eStats.image = "https://i.ibb.co/0yH9fk9r/c.png";
        };

        return AbilityResponse.SUCCESS;
    }, [12, "Reze"]),
    new skillInfo(12, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        if ((list[2][12] === -2 && char.name === "Ram") || (list[2][12] > 0 && char.name === "Ram")) {
            eStats.image = "https://i.ibb.co/x8qbm0Hc/c.png";
            eStats.hp = 0;
            notice.push(`\n🩸 So you've finally come to die, Barusu...`);
        } else if (list[2][12] === -1 && char.name === "Emilia" && myStats.equipped_weapon_id == 686) {
            eStats.image = "https://i.ibb.co/ZRqX66wz/c.png";
            eStats.hp = 0;
            notice.push(`\n🩸 No.. that can't be... that's a lie... you're lying!`);
        } else if (list[2][12] < 0) {
            eStats.image = "https://i.ibb.co/WW7bvFf1/c.png";

            if (Math.random() < 0.5) {
                notice.push(`\n🩸 The Purge King flips a coin... heads.`);
                notice.push(`\n🩸 Don't worry, **${char.name}**, your family is safe for now.`);
            } else {
                notice.push(`\n🩸 The Purge King flips a coin... tails.`);
                myStats.hp = 0;
                myStats.rev = 0;
                myStats.revhp = 0;
            };
        };

        return AbilityResponse.SUCCESS;
    }, [13, "Natsuki Subaru"]),
    new skillInfo(13, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        if (list[2][13] < 0) {
            eStats.hp = 0;
            notice.push(`\n☔ Mayuri has... Mayuri has passed away...`);
        };

        return AbilityResponse.SUCCESS;
    }, [14, "Mayuri Shiina"]),

];


export const rollingCowAbilities: skillInfo[] = [
    new skillInfo(0, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;
        ebuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.05), 9999));

        mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp * 0.05), 9999));

        return AbilityResponse.SUCCESS;
    }, ["Blazetread", "Burns the player by **5%** of max HP."]),

    new skillInfo(1, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;
        eStats.blockCounter = true;
        ebuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.05), 9999));

        eStats.mdChance = 0.5;

        return AbilityResponse.SUCCESS;
    }, ["Lurknight", "Blocks counters and has a **50%** chance of dealing magic damage."]),

    new skillInfo(2, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;
        eStats.blockRevival = true;
        ebuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.05), 9999));

        ebuff.mr.push(new buffInfo("+", 400, 9999));
        eStats.mr += 400;

        return AbilityResponse.SUCCESS;
    }, ["Malamire", "Blocks revivals and has increased magic resistance."]),

    new skillInfo(3, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;
        ebuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.05), 9999));

        myStats.hp = Math.floor(myStats.maxhp * 0.3);

        return AbilityResponse.SUCCESS;
    }, ["Duskgroth", "The player starts with **30%** HP."]),

    new skillInfo(4, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.removeDefCap = true;
        ebuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.05), 9999));

        ebuff.def.push(new buffInfo("+", 500, 9999));
        eStats.def += 500;
        ebuff.mr.push(new buffInfo("+", 500, 9999));
        eStats.mr += 500;

        return AbilityResponse.SUCCESS;
    }, ["Cliffheart", "Has increased DEF and MR."]),

    new skillInfo(5, 500, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        return AbilityResponse.SUCCESS;
    }, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

        const ATK_EMOJI = myStats.replaceButton?.atk?.emoji || '⚔️',
            DEF_EMOJI = myStats.replaceButton?.def?.emoji || '🛡️',
            ABILITY_EMOJI = myStats.replaceButton?.ability?.emoji || '✨',
            SKILL_EMOJI = myStats.replaceButton?.cskill?.emoji || '⚜️',
            SKIP_EMOJI = myStats.replaceButton?.skip?.emoji || '<:dodge_chance:1047269150948606063>';

        let buttons = [
            new ButtonBuilder().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle(ButtonStyle.Secondary), // .setDisabled((myAbility && "ability" in myAbility) ? false : true),
            new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled(myStats.class !== -1 ? false : true),
            new ButtonBuilder().setCustomId('SKIP').setEmoji(SKIP_EMOJI).setStyle(ButtonStyle.Secondary)
        ];

        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            let shift = (((matchStats.round + 1) % 3) + 1) * (matchStats.round % 2 === 1 ? 1 : -1);
            shift = ((shift % buttons.length) + buttons.length) % buttons.length; // Normalize shift value
            buttons = [...buttons.slice(shift), ...buttons.slice(0, shift)];

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(...buttons);

            matchStats.interaction.editReply({ components: [row] });

            return AbilityResponse.SUCCESS;
        }, 9999));

        return AbilityResponse.SUCCESS;
    }, ["Jesterbull", "Swaps buttons during the fight."]),
];
