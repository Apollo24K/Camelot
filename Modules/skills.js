/* eslint-disable no-extra-semi */
/* eslint-disable no-unused-vars */
const buffInfo = require("./buffs.js");
const { dealDamage } = require("./functions.js");

class skillInfo {
    constructor(id, cost, skill, passive = () => {}, list = []) {
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
    set list(lis = []) {
        this._list = lis;
    };
};

const skills = [
    new skillInfo(0, 30, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Warrior deals 125% damage
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: 1.25});
        matchStats.turn = matchStats.turnSkill;
    }),
    new skillInfo(1, 35, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Knight reduces enemy ATK by 15% for 3 rounds
        ebuff.atk.push(new buffInfo("*", 0.85, 2));
        let dnum = Math.floor(eStats.atk*0.15);
        eStats.atk = Math.floor(eStats.atk * 0.85)
        notice.push(`\n⚜️ **${char.name}** has reduced enemy ATK by **${dnum}**`);
    }),
    new skillInfo(2, 20, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Archer increases crit rate by +10% for 2 rounds
        mybuff.cr.push(new buffInfo("+", 0.1, 1));
        myStats.cr += 0.1;
        notice.push(`\n⚜️ **${char.name}** has increased ${char.gender === "F" ? "her" : "his"} Crit Rate by **10%**`);
    }),
    new skillInfo(3, 30, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Gunner reduces DEF by 30% for the attack and deals true damage
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {ignoreShield: true, defMultiplier:0.7});
        matchStats.turn = matchStats.turnSkill;
    }),
    new skillInfo(4, 30, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Martial Artist increases dodge by +20% for 2 rounds
        mybuff.dodge.push(new buffInfo("+", 0.2, 1));
        myStats.dodge += 0.2;
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} dodge chance by **20%**`);
    }),
    new skillInfo(5, 30, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Fighter increases atk by 15%, decreases DEF by 10% for 2 rounds
        mybuff.atk.push(new buffInfo("*", 1.15, 1));
        mybuff.def.push(new buffInfo("*", 0.9, 1));
        myStats.atk = Math.floor(myStats.atk*1.15);
        myStats.def = Math.floor(myStats.def*0.9);
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} ATK by **15%** and decreased DEF by **10%** for 2 rounds`);
    }),
    new skillInfo(6, 45, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Assassin deals a guaranteed critical hit
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {critChance: 0});
        matchStats.turn = matchStats.turnSkill;
    }),
    new skillInfo(7, 25, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Thief deals 80% ATK and heals himself for 30% of the damage dealt
        let dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: 0.8});
        let sheal = Math.floor(dmg*0.3);
        myStats.hp += sheal;
        if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** restored **${sheal}** HP`);
    }),
    new skillInfo(8, 25, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Mage deals 115% Magic Damage
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: 1.15, magicDamage: true, mdChance: 0});
        matchStats.turn = matchStats.turnSkill;
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mdChance = 1;
    }),
    new skillInfo(9, 60, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Priest heals 20% of max HP
        myStats.hp += Math.floor(myStats.maxhp/5);
        if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
        notice.push(`\n⚜️ **${char.name}** has restored **${Math.floor(myStats.maxhp/5)}** HP`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mdChance = 1;
    }),
    new skillInfo(10, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Necromancer summons an undead
        matchStats.myStatsCC = {...myStats};
        matchStats.currentCharacter = 1;

        embed.setThumbnail("https://i.ibb.co/SVKxHF4/s.png");
        myStats.hp = Math.floor(myStats.maxhp*0.4);
        myStats.maxhp = Math.floor(myStats.maxhp*0.4);
        myStats.atk = Math.floor(myStats.atk*0.4);
        myStats.def = Math.floor(myStats.def*0.4);
        myStats.md = Math.floor(myStats.md*0.4);
        myStats.mr = Math.floor(myStats.mr*0.4);
        myStats.mana = 30;
        myStats.mg = 0;

        notice.push(`\n⚜️ **${char.name}** summoned a Skeleton!`);
    }),
    new skillInfo(11, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Duelist counters the next attack
        matchStats.counter++;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** prepares to counter the next attack`);
    }),
    new skillInfo(12, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Mercenary gains 15% ATK for 3 rounds. Player gets 20 coins every time
        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk*0.15), 2));
        myStats.atk += Math.floor(myStats.atk*0.15);
        matchStats.loot += 20;
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} ATK by **15%** for 3 rounds. Added **+20** coins to your loot`);
    }),
    new skillInfo(13, 60, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Holy Knight gains +280 DEF and Magic Resist for 2 rounds
        mybuff.def.push(new buffInfo("+", 280, 2));
        mybuff.mr.push(new buffInfo("+", 280, 2));
        myStats.def += 280;
        myStats.mr += 280;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} DEF and Magic Resist by **280** for 3 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp*0.03), 9999));
    }),
    new skillInfo(14, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Dark Knight decreses all enemy stats by 10% for 3 rounds
        eStats.atk = Math.floor(eStats.atk*0.9);
        eStats.def = Math.floor(eStats.def*0.9);
        eStats.md = Math.floor(eStats.md*0.9);
        eStats.mr = Math.floor(eStats.mr*0.9);
        eStats.cr = eStats.cr*0.9;
        eStats.cd = eStats.cd*0.9;
        eStats.br = eStats.br*0.9;
        eStats.dodge = eStats.dodge*0.9;

        ebuff.atk.push(new buffInfo("*", 0.9, 2));
        ebuff.def.push(new buffInfo("*", 0.9, 2));
        ebuff.md.push(new buffInfo("*", 0.9, 2));
        ebuff.mr.push(new buffInfo("*", 0.9, 2));
        ebuff.cr.push(new buffInfo("*", 0.9, 2));
        ebuff.cd.push(new buffInfo("*", 0.9, 2));
        ebuff.br.push(new buffInfo("*", 0.9, 2));
        ebuff.dodge.push(new buffInfo("*", 0.9, 2));

        notice.push(`\n⚜️ **${char.name}** decreased all enemy stats by **10%** for 3 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.hp.push(new buffInfo("*", 0.98, 9999));
    }),
    new skillInfo(15, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Hunter deals 120% dmg and poisons the enemy for 2 rounds
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: 1.2});
        ebuff.hp.push(new buffInfo("*", 0.96, 2));
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** poisoned the enemy for 2 rounds`);
    }),
    new skillInfo(16, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Death Knight decreses all enemy stats by 20% for 3 rounds
        eStats.atk = Math.floor(eStats.atk*0.8);
        eStats.def = Math.floor(eStats.def*0.8);
        eStats.md = Math.floor(eStats.md*0.8);
        eStats.mr = Math.floor(eStats.mr*0.8);
        eStats.cr = eStats.cr*0.8;
        eStats.cd = eStats.cd*0.8;
        eStats.br = eStats.br*0.8;
        eStats.dodge = eStats.dodge*0.8;

        ebuff.atk.push(new buffInfo("*", 0.8, 2));
        ebuff.def.push(new buffInfo("*", 0.8, 2));
        ebuff.md.push(new buffInfo("*", 0.8, 2));
        ebuff.mr.push(new buffInfo("*", 0.8, 2));
        ebuff.cr.push(new buffInfo("*", 0.8, 2));
        ebuff.cd.push(new buffInfo("*", 0.8, 2));
        ebuff.br.push(new buffInfo("*", 0.8, 2));
        ebuff.dodge.push(new buffInfo("*", 0.8, 2));

        notice.push(`\n⚜️ **${char.name}** decreased all enemy stats by **20%** for 3 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.hp.push(new buffInfo("*", 0.97, 9999));
        ebuff.dodge.push(new buffInfo("*", 0.8, 9999));
    }),
    new skillInfo(17, 45, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Arbalist deals 150% dmg and poisons the enemy for 3 rounds
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: 1.5});
        ebuff.hp.push(new buffInfo("*", 0.95, 3));
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** poisoned the enemy for 3 rounds`);
    }),
    new skillInfo(18, 30, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Marksman deals a guaranteed hit with increased crit rate (+10%)
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {critChance: 0, critBuff: 0.1});
        matchStats.turn = matchStats.turnSkill;
    }),
    new skillInfo(19, 20, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Ranger deals a guaranteed hit with increased crit rate (+15%)
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {critChance: 0, critBuff: 0.15});
        matchStats.turn = matchStats.turnSkill;
    }),
    new skillInfo(20, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Shooter deals a guaranteed critical hit
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {critChance: 0});
        matchStats.turn = matchStats.turnSkill;
    }),
    new skillInfo(21, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Sniper deals a critical hit with increased crit damage (+20%)
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: 1.2, critChance: 0});
        matchStats.turn = matchStats.turnSkill;
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.cr.push(new buffInfo("+", 0.02, 9999, 0.02, "+"));
    }),
    new skillInfo(22, 55, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Ki Master ignores 50% of DEF
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}** ignored **50%** DEF and`, {defMultiplier: 0.5});
        matchStats.turn = matchStats.turnSkill;
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mdChance = 0.2;
    }),
    new skillInfo(23, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Soulfist ignores 75% of DEF
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}** ignored **50%** DEF and`, {defMultiplier: 0.25});
        matchStats.turn = matchStats.turnSkill;
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mdChance = 0.33;
    }),
    new skillInfo(24, 20, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Twinshot increases ATK and MD by +30
        myStats.atk += 30, myStats.md += 30;
        mybuff.atk.push(new buffInfo("+", 30, 9999));
        mybuff.md.push(new buffInfo("+", 30, 9999));
        notice.push(`\n⚜️ **${char.name}** increased ATK and Magic Damage by **+30**`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.twinshot += 0.33;
    }),
    new skillInfo(25, 65, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Beast Lord summons a beast
        matchStats.myStatsCC = {...myStats};
        matchStats.currentCharacter = 1;

        embed.setThumbnail("https://i.ibb.co/fYZgkyJ/b.png");
        myStats.hp = Math.floor(myStats.maxhp*0.75);
        myStats.maxhp = Math.floor(myStats.maxhp*0.75);
        myStats.atk = Math.floor(myStats.atk*0.6);
        myStats.def = Math.floor(myStats.def*0.75);
        myStats.md = Math.floor(myStats.md*0.75);
        myStats.mr = Math.floor(myStats.mr*0.75);
        myStats.mana = 40;
        myStats.mg = 0;

        notice.push(`\n⚜️ **${char.name}** summoned a beast!`);
    }),
    new skillInfo(26, 45, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Bishop heals 20% of max HP
        myStats.hp += Math.floor(myStats.maxhp/5);
        if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
        notice.push(`\n⚜️ **${char.name}** has restored **${Math.floor(myStats.maxhp/5)}** HP`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("*", 1.03, 9999))
    }),
    new skillInfo(27, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Saint heals 40/36/32/...% of max HP
        let hhp = Math.floor(myStats.maxhp*(0.4-(matchStats.heap1++*0.04)));
        if (hhp < 1) {
            notice.push(`\n⚜️ **${char.name}** has reached ${char.gender === "F" ? "her" : "his"} limit`);    
            return myStats.sm += 40;
        };
        myStats.hp += hhp;
        mybuff.mg.push(new buffInfo("+", -2, 9999));
        myStats.mg -= 2;
        if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
        notice.push(`\n⚜️ **${char.name}** has restored **${hhp}** HP`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("*", 1.05, 9999));
        myStats.rev = 1;
        myStats.revhp = 0.5;
        myStats.maxRevivals += 1;
    }),
    new skillInfo(28, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Traditionalist deals true damage and ignores 45% of DEF
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {ignoreShield: true, defMultiplier:0.45});
        matchStats.turn = matchStats.turnSkill;
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("*", 1.03, 9999, 0.03, "+"))
    }),
    new skillInfo(29, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Asura deals more damage with less HP
        if (Math.random() > 0.2) dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: (2.5 - myStats.hp/myStats.maxhp)});
        else dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: (2.5 - myStats.hp/myStats.maxhp), magicDamage: true, mdChance: -1});
        matchStats.turn = matchStats.turnSkill;
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("*", 1.05, 9999, 0.05, "+"));
        mybuff.md.push(new buffInfo("*", 1.05, 9999, 0.05, "+"));
        matchStats.selfdmg = 0.1;
    }),
    new skillInfo(30, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Outlaw steals the equivalent of 7.5% of his stats from the enemy for 4 rounds
        let satk = Math.floor(myStats.atk*0.075); eStats.atk -= satk; myStats.atk += satk;
        let sdef = Math.floor(myStats.def*0.075); eStats.def -= sdef; myStats.def += sdef;
        let smd = Math.floor(myStats.md*0.075); eStats.md -= smd; myStats.md += smd;
        let smr = Math.floor(myStats.mr*0.075); eStats.mr -= smr; myStats.mr += smr;
        let sdodge = Math.floor(myStats.dodge*7.5)/100; eStats.dodge -= sdodge; myStats.dodge += sdodge;
        let scr = Math.floor(myStats.cr*7.5)/100; eStats.cr -= scr; myStats.cr += scr;
        let scd = Math.floor(myStats.cd*7.5)/100; eStats.cd -= scd; myStats.cd += scd;
        let sbr = Math.floor(myStats.br*7.5)/100; eStats.br -= sbr; myStats.br += sbr;

        ebuff.atk.push(new buffInfo("+", -satk, 4)); mybuff.atk.push(new buffInfo("+", satk, 4));
        ebuff.def.push(new buffInfo("+", -sdef, 4)); mybuff.def.push(new buffInfo("+", sdef, 4));
        ebuff.md.push(new buffInfo("+", -smd, 4)); mybuff.md.push(new buffInfo("+", smd, 4));
        ebuff.mr.push(new buffInfo("+", -smr, 4)); mybuff.mr.push(new buffInfo("+", smr, 4));
        ebuff.dodge.push(new buffInfo("+", -sdodge, 4)); mybuff.dodge.push(new buffInfo("+", sdodge, 4));
        ebuff.cr.push(new buffInfo("+", -scr, 4)); mybuff.cr.push(new buffInfo("+", scr, 4));
        ebuff.cd.push(new buffInfo("+", -scd, 4)); mybuff.cd.push(new buffInfo("+", scd, 4));
        ebuff.br.push(new buffInfo("+", -sbr, 4)); mybuff.br.push(new buffInfo("+", sbr, 4));

        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** stole the equivalent of **7.5%** of his stats from the enemy for 4 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.selfhealChance = 0.1;
        matchStats.selfheal = 0.4;
    }),
    new skillInfo(31, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Rogue steals the equivalent of 10% of his stats from the enemy for 5 rounds
        let satk = Math.floor(myStats.atk*0.1); eStats.atk -= satk; myStats.atk += satk;
        let sdef = Math.floor(myStats.def*0.1); eStats.def -= sdef; myStats.def += sdef;
        let smd = Math.floor(myStats.md*0.1); eStats.md -= smd; myStats.md += smd;
        let smr = Math.floor(myStats.mr*0.1); eStats.mr -= smr; myStats.mr += smr;
        let sdodge = Math.floor(myStats.dodge*10)/100; eStats.dodge -= sdodge; myStats.dodge += sdodge;
        let scr = Math.floor(myStats.cr*10)/100; eStats.cr -= scr; myStats.cr += scr;
        let scd = Math.floor(myStats.cd*10)/100; eStats.cd -= scd; myStats.cd += scd;
        let sbr = Math.floor(myStats.br*10)/100; eStats.br -= sbr; myStats.br += sbr;

        ebuff.atk.push(new buffInfo("+", -satk, 5)); mybuff.atk.push(new buffInfo("+", satk, 5));
        ebuff.def.push(new buffInfo("+", -sdef, 5)); mybuff.def.push(new buffInfo("+", sdef, 5));
        ebuff.md.push(new buffInfo("+", -smd, 5)); mybuff.md.push(new buffInfo("+", smd, 5));
        ebuff.mr.push(new buffInfo("+", -smr, 5)); mybuff.mr.push(new buffInfo("+", smr, 5));
        ebuff.dodge.push(new buffInfo("+", -sdodge, 5)); mybuff.dodge.push(new buffInfo("+", sdodge, 5));
        ebuff.cr.push(new buffInfo("+", -scr, 5)); mybuff.cr.push(new buffInfo("+", scr, 5));
        ebuff.cd.push(new buffInfo("+", -scd, 5)); mybuff.cd.push(new buffInfo("+", scd, 5));
        ebuff.br.push(new buffInfo("+", -sbr, 5)); mybuff.br.push(new buffInfo("+", sbr, 5));

        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** stole the equivalent of **10%** of his stats from the enemy for 5 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.selfhealChance = 0.4;
        matchStats.selfheal = 0.6;
    }),
    new skillInfo(32, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Barbarian deals 10% more damage after every round
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: (1 + (matchStats.round * 0.1))});
        matchStats.turn = matchStats.turnSkill;
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("+", 10, 9999, 10, "+"));
    }),
    new skillInfo(33, 45, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Berserker deals 15% more damage after every round
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: (1 + (matchStats.round * 0.15))});
        matchStats.turn = matchStats.turnSkill;
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("+", 15, 9999, 15, "+"));
    }),
    new skillInfo(34, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Deathblade deals 150% dmg and causes bleeding for 2 rounds
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: 1.5});
        ebuff.hp.push(new buffInfo("+", -Math.floor(eStats.maxhp*0.05), 2));
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** caused bleeding for 2 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.critbleed = true;
        matchStats.critbleedlast = 2;
    }),
    new skillInfo(35, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Reaper deals 120% true damage and causes bleeding for 3 rounds
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: 1.2, ignoreShield: true});
        ebuff.hp.push(new buffInfo("+", -Math.floor(eStats.maxhp*0.05), 3));
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** caused bleeding for 3 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.critbleed = true;
        matchStats.critbleedlast = 3;
    }),
    new skillInfo(36, 45, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Cleric deals more dmg in dungeon
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: (list[0] === "arena" ? 1.1 : 1.2), magicDamage: true, mdChance: -1});
        matchStats.turn = matchStats.turnSkill;
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (list[0] !== "arena") mybuff.atk.push(new buffInfo("*", 1.05, 9999));
        mybuff.hp.push(new buffInfo("*", 1.05, 9999));
    }),
    new skillInfo(37, 45, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Sage deals more dmg in dungeon
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: (list[0] === "arena" ? 1.15 : 1.3), magicDamage: true, mdChance: -1});
        matchStats.turn = matchStats.turnSkill;
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (list[0] !== "arena") mybuff.atk.push(new buffInfo("*", 1.1, 9999));
        mybuff.hp.push(new buffInfo("*", 1.05, 9999));
        mybuff.md.push(new buffInfo("*", 1.05, 9999, 0.05, "+"));
    }),
    new skillInfo(38, 30, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Shadowhunter blocks dodge, br and cr
        eStats.dodge = 0, eStats.br = 0, eStats.cr = 0;

        ebuff.dodge.push("=", 0, 1);
        ebuff.br.push("=", 0, 1);
        ebuff.br.push("=", 0, 1);

        notice.push(`\n⚜️ **${char.name}** has blocked **${enemy.name}** from blocking, dodging and critting for the next 2 rounds.`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.atk.push(new buffInfo("*", 0.97, 9999));
        myStats.mdChance = 0.2;
    }),
    new skillInfo(39, 0, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Demonic buffs himself by 33% and consumes mana every round
        if (matchStats.consumeMana) {
            matchStats.heap1.forEach((e) => {
                mybuff[e.type].forEach((a, i) => {
                    if (a.id === e.id) mybuff[e.type].splice(i, 1);
                });
                if (e.type === "mg") myStats[e.type] += e.buff;
                else myStats[e.type] -= e.buff;
            });
            matchStats.consumeMana = 0;
            matchStats.heap1 = [];
            notice.push(`\n⚜️ **${char.name}** stopped ${char.gender === "F" ? "her" : "his"} transformation`);
        } else {
            if (myStats.sm < 25) return matchStats.interaction.channel.send("You need at least **25**\\💧 to sustain this form");
            matchStats.consumeMana = 25;

            let atkbuff = new buffInfo("+", Math.floor(myStats.atk*0.33), "9999");
            let defbuff = new buffInfo("+", Math.floor(myStats.def*0.33), "9999");
            let mdbuff = new buffInfo("+", Math.floor(myStats.md*0.33), "9999");
            let mrbuff = new buffInfo("+", Math.floor(myStats.mr*0.33), "9999");
            let mgbuff = new buffInfo("=", 0, "9999");

            mybuff.atk.push(atkbuff);
            mybuff.def.push(defbuff);
            mybuff.md.push(mdbuff);
            mybuff.mr.push(mrbuff);
            mybuff.mg.push(mgbuff);
            matchStats.heap1 = [{type: "atk", id: atkbuff.id, buff: Math.floor(myStats.atk*0.33)}, {type: "def", id: defbuff.id, buff: Math.floor(myStats.def*0.33)}, {type: "md", id: mdbuff.id, buff: Math.floor(myStats.md*0.33)}, {type: "mr", id: mrbuff.id, buff: Math.floor(myStats.mr*0.33)}, {type: "mg", id: mgbuff.id, buff: myStats.mg}];

            myStats.atk += Math.floor(myStats.atk*0.33);
            myStats.def += Math.floor(myStats.def*0.33);
            myStats.md += Math.floor(myStats.md*0.33);
            myStats.mr += Math.floor(myStats.mr*0.33);
            myStats.mg = 0;

            notice.push(`\n⚜️ **${char.name}** entered demon mode`);
        };
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (list[0] === "arena") myStats.atk = Math.floor(myStats.atk*1.1);
        ebuff.atk.push(new buffInfo("*", 0.95, 9999));
        ebuff.def.push(new buffInfo("*", 0.95, 9999));
        mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp*0.03), 9999));
        matchStats.heap1 = [];
    }),
    new skillInfo(40, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Slayer counters the next 2 attacks
        matchStats.counter += 2;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** prepares to counter the next 2 attacks`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.combodmg = 0.1;
    }),
    new skillInfo(41, 60, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Warlord increases his ATK by 1% for every 50 characters in inv
        matchStats.turn = matchStats.turnSkill;
        let atkbuff = Math.floor(new Set(list[0]).size/50) * 0.01;
        if (atkbuff > 0.75) atkbuff = 0.75;
        mybuff.atk.push(new buffInfo("*", 1+(atkbuff), 2));
        myStats.atk += Math.floor(myStats.atk*atkbuff);
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "M" ? "his" : "her"} ATK by **${atkbuff*100}%** for 3 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.lootm = 1.2;
    }),
    new skillInfo(42, 60, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Paladin gains +200 DEF and Magic Resist for 2 rounds
        mybuff.def.push(new buffInfo("+", 200, 2));
        mybuff.mr.push(new buffInfo("+", 200, 2));
        myStats.def += 200;
        myStats.mr += 200;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} DEF and Magic Resist by **200** for 3 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp*0.05), 9999));
    }),
    new skillInfo(43, 25, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Artillerist ignores 60% of DEF and MR
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: 1, defMultiplier: 0.4});
        matchStats.turn = matchStats.turnSkill;
    }),
    new skillInfo(44, 20, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Warmachine increases DEF and MR depending on the mana consumption
        let idef = 100+myStats.sm*8, imr = 25+myStats.sm*2;
        mybuff.def.push(new buffInfo("+", idef, 5));
        mybuff.mr.push(new buffInfo("+", imr, 5));
        myStats.def += idef;
        myStats.mr += imr;
        myStats.sm = 0;
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} DEF by **${idef}** and Magic Resist by **${imr}** for 3 rounds`);
    }),
    new skillInfo(45, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Summoner summons spirits
        matchStats.myStatsCC = {...myStats};
        matchStats.currentCharacter = 1;

        let statScale = 0.3, spiritType = "", spiritImage = "https://i.ibb.co/s22bQgf/Spirit.png";
        if (Math.random() < 0.2) {
            statScale = 0.5;
            spiritType = "fire ";
            spiritImage = "https://i.ibb.co/rH2Lq0D/Ifrit.png";
        };

        embed.setThumbnail(spiritImage);
        myStats.hp = Math.floor(myStats.maxhp*statScale);
        myStats.maxhp = Math.floor(myStats.maxhp*statScale);
        myStats.atk = Math.floor(myStats.atk*statScale);
        myStats.def = Math.floor(myStats.def*statScale);
        myStats.md = Math.floor(myStats.md*statScale);
        myStats.mr = Math.floor(myStats.mr*statScale);
        myStats.mana = 40;
        myStats.mg = 0;

        notice.push(`\n⚜️ **${char.name}** summoned a ${spiritType}spirit!`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mdChance = 0.2;
    }),
    new skillInfo(46, 60, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Shaman blocks all active abilities for 3 rounds
        matchStats.blockAbilities = 3;
        notice.push(`\n⚜️ **${char.name}** blocked all use of active abilities for 3 rounds!`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.hp.push(new buffInfo("+", -Math.floor(eStats.maxhp*0.03), 9999));
        myStats.mdChance = 0.33;
    }),
    new skillInfo(47, 35, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Sorcerer deals 125% Magic Damage
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: 1.25, magicDamage: true, mdChance: 0});
        ebuff.hp.push(new buffInfo("*", 0.97, 2));
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${enemy.name}** will take burning damage for the next 2 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mdChance = 1;
    }),
    new skillInfo(48, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Wizard deals 150% Magic Damage
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: 1.5, magicDamage: true, mdChance: 0});
        ebuff.hp.push(new buffInfo("*", 0.96, 3));
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${enemy.name}** will take burning damage for the next 3 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.mdChance = 1;
    }),
    new skillInfo(49, 10, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Brawler deals 100% dmg +1% for each mana consumed
        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}**`, {atkMultiplier: (1.1 + myStats.sm * 0.01)});
        myStats.sm = 0;
        matchStats.turn = matchStats.turnSkill;
    }),
    new skillInfo(50, 60, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Grappler decreases enemy dodge by 100% for 5 rounds
        eStats.dodge = 0;
        ebuff.dodge.push(new buffInfo("=", 0, 4));
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has decreased enemy dodge chance to **0%**`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.evadeDeathStrike = 1;
        matchStats.evadeDeathChance = 0.5;
    }),
    new skillInfo(51, 30, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Striker increases his ATK permanently by 10%
        let atkbuff = Math.floor(myStats.atk*0.1);
        myStats.atk += atkbuff;
        mybuff.atk.push(new buffInfo("+", atkbuff, 9999));
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} ATK by **${atkbuff}**`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.combodmg = 0.1;
    }),
    new skillInfo(52, 25, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        // Wardancer increases dodge chance and crit rate by +10% for 3 rounds
        myStats.dodge += 0.1;
        myStats.cr += 0.1;
        mybuff.dodge.push(new buffInfo("+", 0.1, 2));
        mybuff.cr.push(new buffInfo("+", 0.1, 2));
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} dodge chance and crit rate by **+10%** each`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.dodgebuff = 0.05;
    }),
];

const bossAbilities = [
    new skillInfo(0, 35, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.def.push(new buffInfo("*", 1.5, 2));
        eStats.sm -= 35;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** has increased his DEF by **50%** for 2 rounds`);
    }, () => {}, [5, "Skeleton Soldier increases his DEF by 50% over 2 rounds"]),
    new skillInfo(1, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.atk.push(new buffInfo("*", 1.5, 3));
        eStats.sm -= 40;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** has increased his ATK by **20%** for 3 rounds`);
    }, () => {}, [10, "Illfang increases his ATK by 20% over 3 rounds"]),
    new skillInfo(1, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.hp += 100;
        if (eStats.hp > eStats.maxhp) eStats.hp = eStats.maxhp;
        eStats.sm -= 50;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** healed for **100** HP`);
    }, () => {}, [15, "Death Spot heals himself for 100 hp"]),
    new skillInfo(1, 25, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.def.push(new buffInfo("+", 20, 9999));
        ebuff.br.push(new buffInfo("*", 2, 2));
        eStats.sm -= 25;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** doubled his block rate for 2 rounds. **+20** DEF`);
    }, () => {}, [20, "Geld doubles his block rate over the next 2 rounds. Gains permanent 20 DEF"]),
    new skillInfo(1, 20, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.atk.push(new buffInfo("+", 20, 9999));
        ebuff.br.push(new buffInfo("*", 0.02, 9999));
        eStats.sm -= 20;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** increased his ATK by **+20** and gained **+2%** dodge chance`);
    }, () => {}, [25, "Beru gains permanent 10 ATK and +2% dodge chance"]),
    new skillInfo(1, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.cd.push(new buffInfo("*", 1.4, 3));
        eStats.sm -= 40;
        notice.push(`\n✨ **${enemy.name}** increased his crit damage by **40%** for 3 rounds`);
    }, () => {}, [30, "Zenberu increases his crit damage by 40% over the next 3 rounds"]),
    new skillInfo(1, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.dodge.push(new buffInfo("+", 0.2, 3));
        eStats.sm -= 40;
        notice.push(`\n✨ **${enemy.name}** gained **+10%** dodge chance for 3 rounds`);
    }, () => {}, [35, "Gleam Eyes gains +20% dodge chance for the next 3 rounds"]),
    new skillInfo(1, 30, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("+", -20, 9999));
        eStats.sm -= 30;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** poisoned you. You will lose **-20**HP after each round`);
    }, () => {}, [40, "Entoma poisons you to lose 20 hp every round"]),
    new skillInfo(1, 35, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.def.push(new buffInfo("*", 0.2, 3));
        eStats.sm -= 35;
        notice.push(`\n✨ **${enemy.name}** decreased your DEF by **80%** for 3 rounds`);
    }, () => {}, [45, "CZ2128 Delta decreases your DEF by 80% for the next 3 rounds"]),
    new skillInfo(1, 30, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor(((eStats.md * Math.pow(0.99895, myStats.mr)) * (1 - (0.2*Math.random()))) * 1.2);
        myStats.hp -= satk;
        if (myStats.hp < 0) myStats.hp = 0;
        eStats.sm -= 30;
        notice.push(`\n✨ **${enemy.name}** has dealt **${satk}** magic damage`);
    }, () => {}, [50, "Narberal Gamma deals 120% magic damage"]),
    new skillInfo(1, 20, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.atk.push(new buffInfo("*", 1.1, 9999));
        ebuff.def.push(new buffInfo("*", 1.3, 9999));
        eStats.sm -= 20;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** increased her atk by **10%** and def by **30%**`);
    }, () => {}, [55, "Lupusregina Beta permanently increases ATK by 10%, DEF by 30%"]),
    new skillInfo(1, 60, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.br.push(new buffInfo("=", 1, 3)); 
        eStats.sm -= 60;
        notice.push(`\n✨ **${enemy.name}** is now invincible for the next 3 rounds`);
    }, () => {}, [60, "Cocytus gets invincible for the next 3 rounds (by increasing his block rate to 100%)"]),
    new skillInfo(1, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("*", 0.5, 3));
        eStats.sm -= 40;
        notice.push(`\n✨ **${enemy.name}** decreased your ATK by **50%** for 3 rounds`);
    }, () => {}, [65, "Demiurge decreases your ATK by 50% for the next 3 rounds"]),
    new skillInfo(1, 20, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.atk.push(new buffInfo("+", 40, 9999));
        ebuff.def.push(new buffInfo("*", 1.5, 3));
        eStats.sm -= 20;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** increased ATK by **+40** permanently and DEF by **50%** for 3 rounds`);
    }, () => {}, [70, "Albert increases his ATK by 25 permanently and DEF by 50% for the next 3 rounds"]),
    new skillInfo(1, 60, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let shp = Math.floor((eStats.maxhp - eStats.hp)*0.4)
        eStats.hp += shp;
        eStats.sm -= 60;
        notice.push(`\n✨ **${enemy.name}** healed **${shp}** HP`);
    }, () => {}, [75, "Adalman heals 40% of his missing HP"]),
    new skillInfo(1, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.atk.push(new buffInfo("*", 2, 3));
        mybuff.br.push(new buffInfo("*", 0.5, 3));
        eStats.sm -= 50;
        notice.push(`\n✨ **${enemy.name}** doubled his ATK and reduced your block rate by half for 3 rounds`);
    }, () => {}, [80, "Hercules doubles his attack for 3 rounds and decreases your block rate by 50%"]),
    new skillInfo(1, 45, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.dodge.push(new buffInfo("*", 0.2, 3));
        eStats.sm -= 45;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** gained +20% dodge chance for 3 rounds`);
    }, () => {}, [85, "Enkidu gains 20% dodge chance for 3 rounds"]),
    new skillInfo(1, 35, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.atk.push(new buffInfo("+", 30, 9999));
        ebuff.br.push(new buffInfo("*", 1.1, 9999));
        eStats.sm -= 35;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** has increased her ATK by **30** and block rate by **10%**`);
    }, () => {}, [90, "Albedo permanently increases ATK by 30, block rate by 10%"]),
    new skillInfo(1, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.cr.push(new buffInfo("=", 1, 3));
        ebuff.cd.push(new buffInfo("+", 0.25, 3));
        eStats.sm -= 50;
        notice.push(`\n✨ **${enemy.name}** increased his crit rate to **100%** and gained **+25%** crit damage`);
    }, () => {}, [91, "Gilgamesh increases CR to 100% and CD by +25% for the next 3 rounds"]),
    new skillInfo(1, 35, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor((eStats.atk * (1 - (0.2*Math.random()))));
        myStats.hp -= satk;
        if (myStats.hp < 0) myStats.hp = 0;
        eStats.sm -= 35;
        notice.push(`\n✨ **${enemy.name}** has dealt **${satk}** true damage`);
    }, () => {}, [92, "King Hassan attacks ignoring your DEF"]),
    new skillInfo(1, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.def.push(new buffInfo("*", 0.2, 3));
        mybuff.mr.push(new buffInfo("*", 0.2, 3));
        eStats.hp += Math.floor(eStats.hp*0.1);
        if (eStats.hp > eStats.maxhp) eStats.hp = eStats.maxhp;
        eStats.sm -= 40;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** healed **10%** HP. Decreased your DEF and MR by **80%**`);
    }, () => {}, [93, "Diablo decreses your DEF and MR by **80%** for 3 rounds. He heals himself for **10%** of max HP."]),
    new skillInfo(1, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.dodge.push(new buffInfo("+", 0.5, 2));
        ebuff.cr.push(new buffInfo("+", 0.25, 2));
        eStats.sm -= 50;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** increased dodge chance by **50%** and crit rate by **25%**`);
    }, () => {}, [94, "Raphael increases dodge chance by 50% and CR by 25% for the next 2 rounds"]),
    new skillInfo(1, 30, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("*", 0.8, 9999));
        eStats.sm -= 30;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** decreased your ATK by **20%**`);
    }, () => {}, [95, "Guy Crimson permanently decreases your ATK by 20%"]),
    new skillInfo(1, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.dodge.push(new buffInfo("*", 0.8, 2));
        myStats.hp -= Math.floor(myStats.maxhp*0.2);
        if (myStats.hp < 0) myStats.hp = 0;
        eStats.sm -= 50;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** burned 20% of your hp`);
    }, () => {}, [96, "Igneel burns you for 20% of your max HP"]),
    new skillInfo(1, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.def.push(new buffInfo("+", 100, 9999));
        ebuff.mr.push(new buffInfo("+", 150, 9999));
        eStats.sm -= 40;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** increased DEF by **100**, magic resist by **150**`);
    }, () => {}, [97, "Acnologia permanently increases his DEF by 100 and magic resist by 150"]),
    new skillInfo(1, 60, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let shp = Math.floor((eStats.maxhp - eStats.hp)*0.7)
        eStats.hp += shp;
        eStats.sm -= 60;
        notice.push(`\n✨ **${enemy.name}** healed **${shp}** HP`);
    }, () => {}, [98, "Vaision heals 70% of his missing HP"]),
    new skillInfo(1, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor(((eStats.md * Math.pow(0.99895, myStats.mr)) * (1 - (0.2*Math.random()))) * 1.2);
        myStats.hp -= satk;
        if (myStats.hp < 0) myStats.hp = 0;
        let shp = Math.floor((eStats.maxhp - eStats.hp)*0.2);
        eStats.hp += shp;
        eStats.sm -= 40;
        notice.push(`\n✨ **${enemy.name}** has dealt **${satk}** magic damage. Recovered **${shp}** HP`);
    }, () => {}, [99, "Ainz Ooal Gown deals 300% magic damage, heals himself for 20% missing health"]),
    new skillInfo(1, 20, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let shp = Math.floor((eStats.maxhp - eStats.hp)*0.2);
        eStats.hp += shp;
        eStats.sm -= 20;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** has recovered **${shp}** HP`);
    }, () => {}, [100, "Veldora makes a complete recovery"]),
];

module.exports.skills = skills;
module.exports.bossAbilities = bossAbilities;