
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { dealDamage, addHeal, noTimeout, procburn } from "./functions";
import { items } from "./items";
import buffInfo from "./buffs";
import delayedBuffs from "./delayedBuffs";
import { CharacterRarity, ClassAbility, IskillInfo } from "../types";
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
        // Mercenary gains 15% ATK for 3 rounds. Player gets 20 coins every time
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.15), 2));
        myStats.atk += Math.floor(myStats.atk * 0.15);
        matchStats.loot += 20;
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} ATK by **15%** for 3 rounds. Added **+20** coins to your loot`);

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
        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, hhp, {});
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

        eStats.burntype ??= 1;
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
        // Wardancer increases dodge chance and crit rate by +10% for 3 rounds
        myStats.dodge += 0.1;
        myStats.cr += 0.1;
        mybuff.dodge.push(new buffInfo("+", 0.1, 2));
        mybuff.cr.push(new buffInfo("+", 0.1, 2));
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
