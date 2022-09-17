const { getId } = require("./functions.js");

class buffInfo {
    constructor(type, val, last, change=0, ctype="+") {
        this._type = type; // multiplicative (*), additive (+), set (=)
        this._val = val;
        this._last = last;
        this._change = change;
        this._ctype = ctype;
        this._id = getId.next().value;
    };

    get type() {
        return this._type;
    };
    get val() {
        return this._val;
    };
    get last() {
        return this._last;
    };
    get change() {
        return this._change;
    };
    get ctype() {
        return this._ctype;
    };
    get id() {
        return this._id;
    };
};

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
        let satk = Math.floor(((myStats.atk * Math.pow(0.99818, eStats.def)) * (1 - (0.2*Math.random()))) * 1.25); // Warrior deals 125% dmg
        eStats.hp -= satk;
        if (eStats.hp < 0) eStats.hp = 0;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${satk}** damage!`);
    }),
    new skillInfo(1, 35, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.atk.push(new buffInfo("*", 0.85, 2)); // Knight reduces enemy ATK by 15% for 3 rounds
        let dnum = Math.floor(eStats.atk*0.15);
        eStats.atk = Math.floor(eStats.atk * 0.85)
        notice.push(`\n⚜️ **${char.name}** has reduced enemy ATK by **${dnum}**`);
    }),
    new skillInfo(2, 20, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.cr.push(new buffInfo("+", 0.1, 1)); // Archer increases crit rate by +10% for 2 rounds
        myStats.cr += 0.1;
        notice.push(`\n⚜️ **${char.name}** has increased ${char.gender === "F" ? "her" : "his"} Crit Rate by **10%**`);
    }),
    new skillInfo(3, 30, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let edmg = Math.floor(myStats.atk/2 * Math.pow(0.99818, eStats.def)); // Gunner delas 50% true damage and 50% normal
        let tdmg = Math.floor(myStats.atk/2);
        eStats.hp -= (edmg+tdmg);
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${edmg}** damage and **${tdmg}** true damage`);
    }),
    new skillInfo(4, 30, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.dodge.push(new buffInfo("+", 0.2, 1)); // Martial Artist increases dodge by +20% for 2 rounds
        myStats.dodge += 0.2;
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} dodge chance by **20%**`);
    }),
    new skillInfo(5, 30, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("*", 1.15, 1)); // Fighter increases atk by 15%, decreases DEF by 10% for 2 rounds
        mybuff.def.push(new buffInfo("*", 0.9, 1));
        myStats.atk = Math.floor(myStats.atk*1.15);
        myStats.def = Math.floor(myStats.def*0.9);
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} ATK by **15%** and decreased DEF by **10%** for 2 rounds`);
    }),
    new skillInfo(6, 45, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor((myStats.atk * Math.pow(0.99818, eStats.def)) * (1 - (0.2*Math.random())) * myStats.cd); // Assassin deals a critical hit
        eStats.hp -= satk;
        if (eStats.hp < 0) eStats.hp = 0;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt a critical hit! **${satk}** damage`);
    }),
    new skillInfo(7, 25, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor((myStats.atk * Math.pow(0.99818, eStats.def)) * (1 - (0.2*Math.random())) * 0.8); // Thief deals 80% ATK and heals himself for 30% of the damage dealt
        let sheal = Math.floor(satk*0.3);
        eStats.hp -= satk;
        if (eStats.hp < 0) eStats.hp = 0;
        myStats.hp += sheal;
        if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${satk}** damage. Restored **${sheal}** HP`);
    }),
    new skillInfo(8, 25, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor(((myStats.md * Math.pow(0.99818, eStats.mr)) * (1 - (0.2*Math.random()))) * 1.15); // Mage deals 115% Magic Damage
        eStats.hp -= satk;
        if (eStats.hp < 0) eStats.hp = 0;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${satk}** Magic Damage`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.mdChance = 1;
    }),
    new skillInfo(9, 60, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.hp += Math.floor(myStats.maxhp/5); // Priest heals 20% of max HP
        if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
        notice.push(`\n⚜️ **${char.name}** has restored **${Math.floor(myStats.maxhp/5)}** HP`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.mdChance = 1;
    }),
    new skillInfo(10, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.myStatsCC = {...myStats}; // Necromancer summons an undead
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
        matchStats.counter++; // Duelist counters the next attack
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** prepares to counter the next attack`);
    }),
    new skillInfo(12, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("+", 20, 2)); // Mercenary gains +20 ATK for 3 rounds. Player gets 20 coins every time
        myStats.atk += 20;
        matchStats.loot += 20;
        notice.push(`\n⚜️ **${char.name}** increased ATK by **20** for 3 rounds. Added **+20** coins to your loot`);
    }),
    new skillInfo(13, 60, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.def.push(new buffInfo("+", 280, 2)); // Holy Knight gains +280 DEF and Magic Resist for 2 rounds
        mybuff.mr.push(new buffInfo("+", 280, 2));
        myStats.def += 280;
        myStats.mr += 280;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} DEF and Magic Resist by **280** for 3 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp*0.03), 9999));
    }),
    new skillInfo(14, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let mhp = eStats.maxhp; // Dark Knight decreses all enemy stats by 10% for 3 rounds
        Object.keys(eStats).forEach((s) => eStats[s] = Math.floor(eStats[s] * 0.9) );
        Object.keys(ebuff).forEach((s) => ebuff[s].push(new buffInfo("*", 0.9, 2)) );
        eStats.maxhp = mhp;
        notice.push(`\n⚜️ **${char.name}** decreased all enemy stats by **10%** for 3 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.hp.push(new buffInfo("*", 0.98, 9999));
    }),
    new skillInfo(15, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.hp.push(new buffInfo("*", 0.96, 2)); // Hunter deals 120% dmg and poisons the enemy for 2 rounds
        let dmg = Math.floor((myStats.atk * Math.pow(0.99818, eStats.def)) * (1 - (0.2*Math.random())) * (Math.random() < myStats.cr ? myStats.cd : 1) * 1.2);
        eStats.hp -= dmg;
        if (eStats.hp < 0) eStats.hp = 0;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${dmg}** damage and poisoned the enemy for 2 rounds`);
    }),
    new skillInfo(16, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.atk = Math.floor(eStats.atk*0.8); // Death Knight decreses all enemy stats by 20% for 3 rounds
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
        ebuff.hp.push(new buffInfo("*", 0.95, 3)); // Arbalist deals 150% dmg and poisons the enemy for 3 rounds
        let dmg = Math.floor((myStats.atk * Math.pow(0.99818, eStats.def)) * (1 - (0.2*Math.random())) * (Math.random() < myStats.cr ? myStats.cd : 1) * 1.5);
        eStats.hp -= dmg;
        if (eStats.hp < 0) eStats.hp = 0;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${dmg}** damage and poisoned the enemy for 3 rounds`);
    }),
    new skillInfo(18, 30, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let dmg = Math.floor((myStats.atk * Math.pow(0.99818, eStats.def)) * (1 - (0.2*Math.random())) * (Math.random() < (myStats.cr+0.1) ? myStats.cd : 1)); // Marksman deals a guaranteed hit with increased crit rate (+10%)
        eStats.hp -= dmg;
        if (eStats.hp < 0) eStats.hp = 0;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${dmg}** damage`);
    }),
    new skillInfo(19, 20, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let dmg = Math.floor((myStats.atk * Math.pow(0.99818, eStats.def)) * (1 - (0.2*Math.random())) * (Math.random() < (myStats.cr+0.15) ? myStats.cd : 1)); // Ranger deals a guaranteed hit with increased crit rate (+15%)
        eStats.hp -= dmg;
        if (eStats.hp < 0) eStats.hp = 0;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${dmg}** damage`);
    }),
    new skillInfo(20, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let dmg = Math.floor((myStats.atk * Math.pow(0.99818, eStats.def)) * (1 - (0.2*Math.random())) * myStats.cd); // Shooter deals a critical hit
        eStats.hp -= dmg;
        if (eStats.hp < 0) eStats.hp = 0;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt a critical hit! **${dmg}** damage`);
    }),
    new skillInfo(21, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let dmg = Math.floor((myStats.atk * Math.pow(0.99818, eStats.def)) * (1 - (0.2*Math.random())) * (myStats.cd+0.2)); // Sniper deals a critical hit with increased crit damage (+20%)
        eStats.hp -= dmg;
        if (eStats.hp < 0) eStats.hp = 0;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt a critical hit! **${dmg}** damage`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.cr.push(new buffInfo("+", 0.02, 9999, 0.02, "+"));
    }),
    new skillInfo(22, 55, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let dmg = Math.floor((myStats.atk * Math.pow(0.99818, eStats.def*0.5)) * (1 - (0.2*Math.random())) * (myStats.cd+0.2)); // Ki Master ignores 50% of DEF
        eStats.hp -= dmg;
        if (eStats.hp < 0) eStats.hp = 0;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** ignores **50%** of DEF. Dealt **${dmg}** damage`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.mdChance = 0.2;
    }),
    new skillInfo(23, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let dmg = Math.floor((myStats.atk * Math.pow(0.99818, eStats.def*0.25)) * (1 - (0.2*Math.random())) * (myStats.cd+0.2)); // Soulfist ignores 75% of DEF
        eStats.hp -= dmg;
        if (eStats.hp < 0) eStats.hp = 0;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** ignores **75%** of DEF. **${dmg}** damage`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.mdChance = 0.33;
    }),
    new skillInfo(24, 20, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.atk += 30; // Twinshot increases ATK and MD by +30
        myStats.md += 30;
        mybuff.atk.push(new buffInfo("+", 30, 9999));
        mybuff.md.push(new buffInfo("+", 30, 9999));
        notice.push(`\n⚜️ **${char.name}** increased ATK and Magic Damage by **+30**`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.twinshot = 0.33;
    }),
    new skillInfo(25, 65, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.myStatsCC = {...myStats}; // Beast Lord summons a beast
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
        myStats.hp += Math.floor(myStats.maxhp/5); // Bishop heals 20% of max HP
        if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
        notice.push(`\n⚜️ **${char.name}** has restored **${Math.floor(myStats.maxhp/5)}** HP`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("*", 1.03, 9999))
    }),
    new skillInfo(27, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let hhp = Math.floor(myStats.maxhp*(0.4-(matchStats.heap1++*0.04))); // Saint heals 40/36/32/...% of max HP
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
    }),
    new skillInfo(28, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let dmg = Math.floor(myStats.atk); // Traditionalist deals true damage
        eStats.hp -= dmg;
        if (eStats.hp < 0) eStats.hp = 0;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${dmg}** true damage`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("*", 1.03, 9999, 0.03, "+"))
    }),
    new skillInfo(29, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let dmg, dmd = "";
        if (Math.random() > 0.2) {
            dmg = Math.floor(((myStats.atk * Math.floor(10 * (1 - myStats.hp/myStats.maxhp))/10) * Math.pow(0.99818, eStats.def))); // Asura deals more damage with less HP
        } else {
            dmg = Math.floor(((myStats.md * Math.floor(10 * (1 - myStats.hp/myStats.maxhp))/10) * Math.pow(0.99818, eStats.mr)));
            dmd = "magic "
        };
        eStats.hp -= dmg;
        if (eStats.hp < 0) eStats.hp = 0;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${dmg}** ${dmd}damage`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("*", 1.05, 9999, 0.05, "+"));
        mybuff.md.push(new buffInfo("*", 1.05, 9999, 0.05, "+"));
        matchStats.selfdmg = 0.1;
    }),
    new skillInfo(30, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let edmg = Math.floor(eStats.maxhp*0.1); // Outlaw steals 10% of enemy stats
        eStats.hp -= edmg;
        myStats.hp += edmg;
        if (eStats.hp < 0) eStats.hp = 0;
        if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
        let satk = Math.floor(eStats.atk*0.1); eStats.atk -= satk; myStats.atk += satk;
        let sdef = Math.floor(eStats.def*0.1); eStats.def -= sdef; myStats.def += sdef;
        let smd = Math.floor(eStats.md*0.1); eStats.md -= smd; myStats.md += smd;
        let smr = Math.floor(eStats.mr*0.1); eStats.mr -= smr; myStats.mr += smr;
        let sdodge = Math.floor(eStats.dodge*10)/100; eStats.dodge -= sdodge; myStats.dodge += sdodge;
        let scr = Math.floor(eStats.cr*10)/100; eStats.cr -= scr; myStats.cr += scr;
        let scd = Math.floor(eStats.cd*10)/100; eStats.cd -= scd; myStats.cd += scd;
        let sbr = Math.floor(eStats.br*10)/100; eStats.br -= sbr; myStats.br += sbr;

        ebuff.atk.push(new buffInfo("+", -satk, 9999)); mybuff.atk.push(new buffInfo("+", satk, 9999));
        ebuff.def.push(new buffInfo("+", -sdef, 9999)); mybuff.def.push(new buffInfo("+", sdef, 9999));
        ebuff.md.push(new buffInfo("+", -smd, 9999)); mybuff.md.push(new buffInfo("+", smd, 9999));
        ebuff.mr.push(new buffInfo("+", -smr, 9999)); mybuff.mr.push(new buffInfo("+", smr, 9999));
        ebuff.dodge.push(new buffInfo("+", -sdodge, 9999)); mybuff.dodge.push(new buffInfo("+", sdodge, 9999));
        ebuff.cr.push(new buffInfo("+", -scr, 9999)); mybuff.cr.push(new buffInfo("+", scr, 9999));
        ebuff.cd.push(new buffInfo("+", -scd, 9999)); mybuff.cd.push(new buffInfo("+", scd, 9999));
        ebuff.br.push(new buffInfo("+", -sbr, 9999)); mybuff.br.push(new buffInfo("+", sbr, 9999));

        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** stole **10%** of enemy stats`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.selfhealChance = 0.1;
        matchStats.selfheal = 0.4;
    }),
    new skillInfo(31, 35, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let edmg = Math.floor(eStats.maxhp*0.15); // Rogue steals 15% of enemy stats
        eStats.hp -= edmg;
        myStats.hp += edmg;
        if (eStats.hp < 0) eStats.hp = 0;
        if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
        let satk = Math.floor(eStats.atk*0.15); eStats.atk -= satk; myStats.atk += satk;
        let sdef = Math.floor(eStats.def*0.15); eStats.def -= sdef; myStats.def += sdef;
        let smd = Math.floor(eStats.md*0.15); eStats.md -= smd; myStats.md += smd;
        let smr = Math.floor(eStats.mr*0.15); eStats.mr -= smr; myStats.mr += smr;
        let sdodge = Math.floor(eStats.dodge*15)/100; eStats.dodge -= sdodge; myStats.dodge += sdodge;
        let scr = Math.floor(eStats.cr*15)/100; eStats.cr -= scr; myStats.cr += scr;
        let scd = Math.floor(eStats.cd*15)/100; eStats.cd -= scd; myStats.cd += scd;
        let sbr = Math.floor(eStats.br*15)/100; eStats.br -= sbr; myStats.br += sbr;

        ebuff.atk.push(new buffInfo("+", -satk, 9999)); mybuff.atk.push(new buffInfo("+", satk, 9999));
        ebuff.def.push(new buffInfo("+", -sdef, 9999)); mybuff.def.push(new buffInfo("+", sdef, 9999));
        ebuff.md.push(new buffInfo("+", -smd, 9999)); mybuff.md.push(new buffInfo("+", smd, 9999));
        ebuff.mr.push(new buffInfo("+", -smr, 9999)); mybuff.mr.push(new buffInfo("+", smr, 9999));
        ebuff.dodge.push(new buffInfo("+", -sdodge, 9999)); mybuff.dodge.push(new buffInfo("+", sdodge, 9999));
        ebuff.cr.push(new buffInfo("+", -scr, 9999)); mybuff.cr.push(new buffInfo("+", scr, 9999));
        ebuff.cd.push(new buffInfo("+", -scd, 9999)); mybuff.cd.push(new buffInfo("+", scd, 9999));
        ebuff.br.push(new buffInfo("+", -sbr, 9999)); mybuff.br.push(new buffInfo("+", sbr, 9999));

        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** stole **15%** of enemy stats`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.selfhealChance = 0.2;
        matchStats.selfheal = 0.4;
    }),
    new skillInfo(32, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let dmg = Math.floor(((myStats.atk * (1 + (matchStats.round * 0.1))) * Math.pow(0.99818, eStats.def))); // Barbarian deals 10% more damage after every round
        eStats.hp -= dmg;
        if (eStats.hp < 0) eStats.hp = 0;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${dmg}** damage`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("+", 10, 9999, 10, "+"));
    }),
    new skillInfo(33, 45, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let dmg = Math.floor(((myStats.atk * (1 + (matchStats.round * 0.15))) * Math.pow(0.99818, eStats.def))); // Berserker deals 15% more damage after every round
        eStats.hp -= dmg;
        if (eStats.hp < 0) eStats.hp = 0;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${dmg}** damage`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.atk.push(new buffInfo("+", 15, 9999, 15, "+"));
    }),
    new skillInfo(34, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let dmg = Math.floor((myStats.atk * 1.5) * Math.pow(0.99818, eStats.def)); // Deathblade deals 150% dmg and causes bleeding for 2 rounds
        eStats.hp -= dmg;
        if (eStats.hp < 0) eStats.hp = 0;
        ebuff.hp.push(new buffInfo("+", Math.floor(eStats.maxhp*0.05), 3));
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${dmg}** damage. Caused bleeding for 3 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.critbleed = true;
        matchStats.critbleedlast = 2;
    }),
    new skillInfo(35, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let dmg = Math.floor(myStats.atk * 1.2); // Reaper deals 120% true damage and causes bleeding for 3 rounds
        eStats.hp -= dmg;
        if (eStats.hp < 0) eStats.hp = 0;
        ebuff.hp.push(new buffInfo("+", Math.floor(eStats.maxhp*0.05), 3));
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${dmg}** true damage. Caused bleeding for 3 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.critbleed = true;
        matchStats.critbleedlast = 3;
    }),
    new skillInfo(36, 45, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let dmg = Math.floor((myStats.md * (list[0] === "arena" ? 1.1 : 1.2)) * Math.pow(0.99818, eStats.mr)); // Cleric deals more dmg in dungeon
        eStats.hp -= dmg;
        if (eStats.hp < 0) eStats.hp = 0;
        if (list[0] !== "arena") ebuff.hp.push(new buffInfo("*", 0.96, 3));
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${dmg}** magic damage`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (list[0] !== "arena") mybuff.atk.push(new buffInfo("*", 1.05, 9999));
        mybuff.hp.push(new buffInfo("*", 1.05, 9999));
    }),
    new skillInfo(37, 45, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let dmg = Math.floor((myStats.md * (list[0] === "arena" ? 1.15 : 1.3)) * Math.pow(0.99818, eStats.mr)); // Cleric deals more dmg in dungeon
        eStats.hp -= dmg;
        if (eStats.hp < 0) eStats.hp = 0;
        if (list[0] !== "arena") ebuff.hp.push(new buffInfo("*", 0.92, 3));
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${dmg}** magic damage`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (list[0] !== "arena") mybuff.atk.push(new buffInfo("*", 1.1, 9999));
        mybuff.hp.push(new buffInfo("*", 1.05, 9999));
        mybuff.md.push(new buffInfo("*", 1.05, 9999));
    }),
    new skillInfo(38, 35, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.dodge = 0, eStats.br = 0, eStats.cr = 0; // Shadowhunter blockks dodge, br and cr

        ebuff.dodge.push("=", 0, 1);
        ebuff.br.push("=", 0, 1);
        ebuff.br.push("=", 0, 1);

        notice.push(`\n⚜️ **${char.name}** has blocked **${enemy.name}** from blocking, dodging and critting for the next 2 rounds.`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.atk.push(new buffInfo("*", 0.97, 9999));
        matchStats.mdChance = 0.2;
    }),
    new skillInfo(39, 0, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (matchStats.consumeMana) { // Demonic buffs himself and consumes mana every round;
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
            if (myStats.sm < 25) return message.channel.send(`You need at least **25**\\💧 to sustain this form`);
            matchStats.consumeMana = 25;

            let atkbuff = new buffInfo("+", Math.floor(myStats.atk*0.1), "9999");
            let defbuff = new buffInfo("+", Math.floor(myStats.def*0.1), "9999");
            let mdbuff = new buffInfo("+", Math.floor(myStats.md*0.1), "9999");
            let mrbuff = new buffInfo("+", Math.floor(myStats.mr*0.1), "9999");
            let mgbuff = new buffInfo("=", 0, "9999");

            mybuff.atk.push(atkbuff);
            mybuff.def.push(defbuff);
            mybuff.md.push(mdbuff);
            mybuff.mr.push(mrbuff);
            mybuff.mg.push(mgbuff);
            matchStats.heap1 = [{type: "atk", id: atkbuff.id, buff: Math.floor(myStats.atk*0.1)}, {type: "def", id: defbuff.id, buff: Math.floor(myStats.def*0.1)}, {type: "md", id: mdbuff.id, buff: Math.floor(myStats.md*0.1)}, {type: "mr", id: mrbuff.id, buff: Math.floor(myStats.mr*0.1)}, {type: "mg", id: mgbuff.id, buff: myStats.mg}];

            myStats.atk += Math.floor(myStats.atk*0.1);
            myStats.def += Math.floor(myStats.def*0.1);
            myStats.md += Math.floor(myStats.md*0.1);
            myStats.mr += Math.floor(myStats.mr*0.1);
            myStats.mg = 0;

            notice.push(`\n⚜️ **${char.name}** entered demon mode`);
        };
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        if (list[0] === "arena") myStats.atk("*", 1.1, 9999);
        ebuff.atk.push(new buffInfo("*", 0.95, 9999));
        ebuff.def.push(new buffInfo("*", 0.95, 9999));
        mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp*0.03), 9999));
        matchStats.mdChance = 0.33;
        matchStats.heap1 = [];
    }),
    new skillInfo(40, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.counter += 2; // Slayer counters the next 2 attacks
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** prepares to counter the next 2 attacks`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.combodmg = 0.1;
    }),
    new skillInfo(41, 60, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let atkbuff = Math.floor(new Set(inventory[user + message.guild.id]).size/50) * 0.01; // Warlord increases his ATK by 1% for every 50 characters in inv
        if (atkbuff > 0.75) atkbuff = 0.75;
        mybuff.atk.push(new buffInfo("*", 1+(atkbuff), 2));
        myStats.atk += Math.floor(myStats.atk*atkbuff);
        notice.push(`\n⚜️ **${char.name}** increased his ATK by **${atkbuff*100}%** for 3 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.lootm = 1.2;
    }),
    new skillInfo(42, 60, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.def.push(new buffInfo("+", 500, 2)); // Paladin gains +500 DEF and Magic Resist for 2 rounds
        mybuff.mr.push(new buffInfo("+", 500, 2));
        myStats.def += 500;
        myStats.mr += 500;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} DEF and Magic Resist by **500** for 3 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp*0.05), 9999));
    }),
    new skillInfo(43, 25, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let edmg = Math.floor(myStats.atk*0.25 * Math.pow(0.99818, eStats.def)); // Artillerist delas 75% true damage and 25% normal
        let tdmg = Math.floor(myStats.atk*0.75);
        eStats.hp -= (edmg+tdmg);
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${edmg}** damage and **${tdmg}** true damage`);
    }),
    new skillInfo(44, 20, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let idef = 100+myStats.sm*8, imr = 25+myStats.sm*2; // Warmachine increases DEF and MR depending on the mana consumption
        mybuff.def.push(new buffInfo("+", idef, 2));
        mybuff.mr.push(new buffInfo("+", imr, 2));
        myStats.def += idef;
        myStats.mr += imr;
        myStats.sm = 0;
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} DEF by **${idef}** and Magic Resist by **${imr}** for 3 rounds`);
    }),
    new skillInfo(45, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.myStatsCC = {...myStats}; // Summoner summons spirits
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
        matchStats.mdChance = 0.2;
    }),
    new skillInfo(46, 60, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.blockAbilities = 3; // Shaman blocks all active abilities for 3 rounds
        notice.push(`\n⚜️ **${char.name}** blocked all use of active abilities for 3 rounds!`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.hp.push(new buffInfo("+", -Math.floor(eStats.maxhp*0.03), 9999));
        matchStats.mdChance = 0.33;
    }),
    new skillInfo(47, 35, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor(((myStats.md * Math.pow(0.99818, eStats.mr)) * (1 - (0.2*Math.random()))) * 1.25); // Sorcerer deals 125% Magic Damage
        eStats.hp -= satk;
        if (eStats.hp < 0) eStats.hp = 0;
        ebuff.hp.push(new buffInfo("*", 0.97, 2));
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${satk}** magic damage. Enemy will take burning damage for the next 2 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.mdChance = 1;
    }),
    new skillInfo(48, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor(((myStats.md * Math.pow(0.99818, eStats.mr)) * (1 - (0.2*Math.random()))) * 1.5); // Wizard deals 150% Magic Damage
        eStats.hp -= satk;
        if (eStats.hp < 0) eStats.hp = 0;
        ebuff.hp.push(new buffInfo("*", 0.95, 3));
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${satk}** magic damage. Enemy will take burning damage for the next 3 rounds`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.mdChance = 1;
    }),
    new skillInfo(49, 10, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor((myStats.atk * (1.1 + myStats.sm * 0.01) * Math.pow(0.99818, eStats.def)) * (1 - (0.2*Math.random()))); // Brawler deals 100% dmg +1% for each EP consumed
        eStats.hp -= satk;
        if (eStats.hp < 0) eStats.hp = 0;
        myStats.sm = 0;
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has dealt **${satk}** damage`);
    }),
    new skillInfo(50, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        eStats.dodge = 0; // Grappler decreases enemy dodge by 100% for 2 rounds
        ebuff.dodge.push(new buffInfo("=", 0, 1));
        matchStats.turn = matchStats.turnSkill;
        notice.push(`\n⚜️ **${char.name}** has decreased enemy dodge chance to **0%**`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.evadeDeathStrike = 1;
        matchStats.evadeDeathChance = 0.4;
    }),
    new skillInfo(51, 30, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        atkbuff += Math.floor(myStats.atk*0.1); // Striker increases his ATK permanently by 10%
        myStats.atk += atkbuff;
        mybuff.atk.push(new buffInfo("+", atkbuff, 9999));
        notice.push(`\n⚜️ **${char.name}** increased ${char.gender === "F" ? "her" : "his"} ATK by **${atkbuff}**`);
    }, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        matchStats.combodmg = 0.1;
    }),
    new skillInfo(51, 25, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        myStats.dodge += 0.1; // Wardancer increases dodge chance and crit rate by +10% for 3 rounds
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
        notice.push(`\n✨ **${enemy.name}** decresed your DEF by **80%** for 3 rounds`);
    }, () => {}, [45, "CZ2128 Delta decreases your DEF by 80% for the next 3 rounds"]),
    new skillInfo(1, 30, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let satk = Math.floor(((eStats.md * Math.pow(0.99818, myStats.mr)) * (1 - (0.2*Math.random()))) * 1.2);
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
        notice.push(`\n✨ **${enemy.name}** decresed your DEF by **80%** for 2 rounds`);
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
        ebuff.atk.push(new buffInfo("+", 25, 9999));
        ebuff.def.push(new buffInfo("*", 1.5, 3));
        eStats.sm -= 20;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** increased ATK by **+25** permanently and DEF by **50%** for 3 rounds`);
    }, () => {}, [70, "Albert increases his ATK by 25 permanently and DEF by 50% for the next 3 rounds"]),
    new skillInfo(1, 40, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.rev.push(new buffInfo("+", 0.2, 9999));
        ebuff.revhp.push(new buffInfo("*", 1.2, 9999));
        eStats.sm -= 40;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** increased his chance of revival by **+20%**`);
    }, () => {}, [75, "Adalman gains +20% chance of revival"]),
    new skillInfo(1, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.atk.push(new buffInfo("*", 2, 3));
        mybuff.br.push(new buffInfo("*", 0.5, 3));
        eStats.sm -= 50;
        notice.push(`\n✨ **${enemy.name}** doubled his ATK and reduced your block rate by half for 3 rounds`);
    }, () => {}, [80, "Hercules doubles his attack for 3 rounds and decreases your block rate by 50%"]),
    new skillInfo(1, 45, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        ebuff.dodge.push(new buffInfo("*", 0.2, 3));
        ebuff.rev.push(new buffInfo("+", 0.1, 9999));
        eStats.sm -= 45;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** gained +20% dodge chance for 3 rounds. Increased chance of revival by 10%`);
    }, () => {}, [85, "Enkidu gains 20% dodge chance for 3 rounds and permanent +10% chance"]),
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
        eStats.hp += 50;
        if (eStats.hp > eStats.maxhp) eStats.hp = eStats.maxhp;
        ebuff.rev.push(new buffInfo("+", 0.2, 9999));
        eStats.sm -= 40;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** gained **50** HP and **20%** chance of revival. Decreased your DEF by **80%**`);
    }, () => {}, [93, "Diablo decreses your DEF by 80% for 3 rounds. He gains permanent 50 HP and +20% chance of revival"]),
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
        let satk = Math.floor(((eStats.md * Math.pow(0.99818, myStats.mr)) * (1 - (0.2*Math.random()))) * 1.2);
        myStats.hp -= satk;
        if (myStats.hp < 0) myStats.hp = 0;
        let shp = Math.floor((eStats.maxhp - eStats.hp)*0.2);
        eStats.hp += shp;
        eStats.sm -= 40;
        notice.push(`\n✨ **${enemy.name}** has dealt **${satk}** magic damage. Recovered **${shp}** HP`);
    }, () => {}, [99, "Ainz Ooal Gown deals 300% magic damage, heals himself for 20% missing health"]),
    new skillInfo(1, 20, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        let shp = Math.floor((eStats.maxhp - eStats.hp)*0.2); // 
        eStats.hp += shp;
        eStats.sm -= 20;
        matchStats.turn = 0;
        notice.push(`\n✨ **${enemy.name}** has recovered **${shp}** HP`);
    }, () => {}, [100, "Veldora makes a complete recovery"]),
];

module.exports.skills = skills;
module.exports.bossAbilities = bossAbilities;