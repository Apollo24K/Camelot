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

const abilities = {
    "64": {
        usage: 9999,
        used: 0,
        cost: 25,
        selected: "fushi",
        fushi: 1,
        parona: 0, // #65
        gugu: 0,   // #66
        march: 0,  // #67
        desc: "**Total Usage**: `unlimited`\n**Timeout**: `yes`\n\nFushi randomly transforms in one of the following 3 characters from the anime **Fumetsu no Anata e**: Gugu, March or Parona. While in this form, a second use of his ability will transform him back into his original form. To be able to transform into one of these characters, You'll need to have them in your inventory.\nWhen played correctly, Fushi can be a powerful opponent holding 4 distinct characters within himself, each with their own stats.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Fushi transforms randomly in one of 3 characters who each have their own stats.
            if (!inventory[message.author.id + message.guild.id].filter((e) => e === 65 || e === 66 || e === 67).length) return message.channel.send("You don't have any of the characters **Parona**, **Gugu** or **March** to transform into");
            
            if (abilities["64"].selected === "fushi") {
                let obtained = [];
                if (inventory[message.author.id + message.guild.id].includes(65)) obtained.push("parona");
                if (inventory[message.author.id + message.guild.id].includes(66)) obtained.push("gugu");
                if (inventory[message.author.id + message.guild.id].includes(67)) obtained.push("march");
                let pick = obtained[Math.floor(Math.random() * obtained.length)];
                let pID = {"parona": 65, "gugu": 66, "march":67}[pick];

                abilities["64"].selected = pick;

                abilities["64"].fushi = myStats.hp;
                let newStats = getDetailedStats(pID, 0, false, user);
                ["hp", "maxhp", "atk", "def", "md", "mr", "cr", "cd", "td", "br", "dodge"].forEach((e) => {
                    myStats[e] = newStats[e];
                });
                if (abilities["64"][pick]) myStats.hp = abilities["64"][pick];

                Object.keys(myStats).forEach((e) => {
                    myStatsFixed[e] = myStats[e];
                });

                notice.push(`\n✨ **${char.name}** transformed into **${characters[pID].name}**!`);
                embed.setThumbnail(characters[pID].image);
            } else {
                abilities["64"][abilities["64"].selected] = myStats.hp;
                abilities["64"].selected = "fushi";
                let newStats = getDetailedStats(64, 0, false, user);
                ["hp", "maxhp", "atk", "def", "md", "mr", "cr", "cd", "td", "br", "dodge"].forEach((e) => {
                    myStats[e] = newStats[e];
                });
                myStats.hp = abilities["64"].fushi;

                Object.keys(myStats).forEach((e) => {
                    myStatsFixed[e] = myStats[e];
                });

                notice.push(`\n✨ **${char.name}** transformed back`);
                embed.setThumbnail(char.image);
            };
        },
    },
    "238": {
        usage: 3,
        used: 0,
        cost: 20,
        desc: "**Total Usage**: `3`\n**Timeout**: `yes`\n\nUsing his ultimate skill Beelzebub, Rimuru Tempest can end a fight in an instant, devouring his enemy. While enemies with less than half of his own EP will lose immediately, the success rate of Beelzebub will decline with stronger enemies.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Rimuru has a chance of 100%/60%/30%/10%/0% to instantly kill the enemy
            if (myStats.ep/eStats.ep > 2) {
                eStats.hp = 0;
            } else if (myStats.ep/eStats.ep > 1.5) {
                if (Math.random() < 0.6) eStats.hp = 0;
            } else if (myStats.ep/eStats.ep > 1.1) {
                if (Math.random() < 0.3) eStats.hp = 0;
            } else if (myStats.ep/eStats.ep > 0.8) {
                if (Math.random() < 0.1) eStats.hp = 0;
            };
            if (eStats.hp === 0) notice.push(`\n✨ **${char.name}** used Beelzebub to consume **${enemy.name}**!`);
            else notice.push(`\n✨ Attempt failed${(myStats.ep/eStats.ep > 0.8 && abilities["238"].used < abilities["238"].usage) ? ". Repeat next round?" : ""}`);
        },
    },
    "274": {
        usage: 1,
        used: 0,
        cost: 50,
        desc: "**Total Usage**: `1`\n**Timeout**: `yes`\n\nBy transforming into a Titan, Eren will boost all of his stats by 15%. More Specifically, 15% of his max HP and 15% of his current DEF and current ATK each.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Eren increases his stats by 15% of his max HP, current DEF and current ATK
            myStats.hp += Math.floor(myStats.maxhp*0.15);
            myStats.maxhp += Math.floor(myStats.maxhp*0.15);
            ["atk", "def", "md", "mr"].forEach((e) => mybuff[e].push(new buffInfo("*", 1.15, 9999)) );
            matchStats.turn = 1;
            notice.push(`\n✨ **${char.name}** has transformed into a Titan! All stats raised by **15%**`);
            embed.setThumbnail("https://i.ibb.co/YfnG2Tn/at.png")
        },
    },
    "405": {
        usage: 1,
        used: 0,
        cost: 70,
        desc: "**Total Usage**: `1`\n**Timeout**: `yes`\n\nWith her Noble Phantasm Excalibur, the pinnacle of holy swords, Saber unleashes her most powerful attack dealing 250% of her normal damage. As wielding this sword poses quite a challenge, Saber needs to wait 4 rounds to prepare her attack before she can use Excalibur.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Saber unleashes an attack with 250% damage
            let dmg = Math.floor(((2.5*myStats.atk) * Math.pow(0.99818, eStats.def)) * (1 - (0.2*Math.random())));
            eStats.hp -= dmg;
            if (eStats.hp < 0) eStats.hp = 0;
            notice.push(`\n✨ **${char.name}** used Excalibur! She has dealt **${dmg}** damage`);
        },
    },
    "733": {
        usage: 1,
        used: 0,
        cost: 40,
        desc: "**Total Usage**: `1`\n**Timeout**: `yes`\n\nWith his ability, Albedo increases his ATK by 50% of his current DEF.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Albedo (GI) increases his ATK by 50% of his current DEF
            let inc = Math.floor(myStats.def/2);
            myStats.atk += inc;
            mybuff.atk.push(new buffInfo("+", inc, 9999));
            notice.push(`\n✨ **${char.name}** has increased his **ATK** by half of his **DEF** (**+${inc}**)`);
        },
    },
    "1824": {
        usage: 1,
        used: 0,
        cost: 20,
        desc: "**Total Usage**: `1`\n**Timeout**: `no`\n\nRyuuko Matoi sacrifices 30% of her current HP for an ATK increase of 60% of those lost HP",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Ryuuko sacrifices 30% of her current HP for a 60% ATK increase of lost HP
            let sacrifice = Math.floor(myStats.hp*0.3);
            myStats.hp -= sacrifice;
            myStats.atk += Math.floor(sacrifice*0.6);
            mybuff.atk.push(new buffInfo("+", Math.floor(sacrifice*0.6), 9999));
            myStats.md += Math.floor(sacrifice*0.6);
            mybuff.md.push(new buffInfo("+", Math.floor(sacrifice*0.6), 9999));
            matchStats.turn = 1;
            notice.push(`\n✨ **${char.name}** sacrificed **${sacrifice}**HP for **${Math.floor(sacrifice*0.6)}**ATK and Magic Damage`);
        },
    },
    "2079": {
        usage: 1,
        used: 0,
        cost: 50,
        desc: "**Total Usage**: `1`\n**Timeout**: `yes`\n\nBy equipping her unique armor Hermes Trismegistus, Albedo doubles her current DEF and gains a 20% ATK increase of her current DEF.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Albedo increases DEF by 100% and ATK by 20% of current DEF
            let raiseDef = myStats.def;
            let raiseAtk = Math.floor(myStats.def/5);
            myStats.def += raiseDef;
            mybuff.def.push(new buffInfo("+", raiseDef, 9999));
            myStats.atk += raiseAtk;
            mybuff.atk.push(new buffInfo("+", raiseAtk, 9999));
            notice.push(`\n✨ **${char.name}** equipped Hermes Trismegistus!\n<:blank:917804200363171860> She has gained **+${raiseDef}**DEF and **+${raiseAtk}**ATK`);
            embed.setThumbnail("https://i.ibb.co/S7v6Qmx/a.png");
        },
    },
    "2080": {
        usage: 10,
        used: 0,
        cost: 35,
        desc: "**Total Usage**: `10`\n**Timeout**: `yes`\n\nAs a Vampire, Shalltear Bloodfallen can drain HP from her opponent to add it to herself. With every use of her ability, she will drain 20% of her opponents current HP.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Shalltear drains 20% of enemy HP and adds it to herself.
            let drain = Math.floor(eStats.hp/5);
            eStats.hp -= drain;
            myStats.hp += drain;
            if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
            if (eStats.hp < 0) eStats.hp = 0;
            notice.push(`\n✨ **${char.name}** has drained **${drain}**HP from **${enemy.name}**`);
        },
    },
    "2360": {
        usage: 3,
        used: 0,
        cost: 25,
        desc: "**Total Usage**: `3`\n**Timeout**: `yes`\n\nHer ability, the Code of Immortality grants C.C. with the burden of immortality. With every use of her ability, she gains an additional 14% of chance of revival for a total of 42% at most. If revived, C.C. will have 30%, 35% or 40% of HP depending on how often she used her ability. She can revive herself multiple times per round, although her chance of revival drops by half every time she does. Additionally, C.C. has to wait a round before she can reuse her ability.",
        update: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.rev /= 2;
            myStats.revhp /= 2;
            mybuff.rev.push(new buffInfo("*", 0.5, 9999));
            mybuff.revhp.push(new buffInfo("*", 0.5, 9999));
            notice.push(`\n✨ **${char.name}** survived! Restored **${myStats.hp}**HP`);
        },
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // C.C. decreases enemy DEF by 20%. +14/28/42% chance of revival with 30/35/40% HP
            myStats.rev += 0.14;
            mybuff.rev.push(new buffInfo("+", 0.14, 9999));
            if (abilities["2360"].used === 1) myStats.revhp = 0.3, mybuff.revhp.push(new buffInfo("=", 0.3, 9999));
            else myStats.revhp += 0.05, mybuff.revhp.push(new buffInfo("+", 0.05, 9999));

            let decrease = Math.floor(eStats.def*0.2);
            eStats.def -= decrease;
            ebuff.def.push(new buffInfo("+", -decrease, 9999));
            notice.push(`\n✨ **${char.name}** used her Code of Immortality for a **${Math.round(myStats.rev*100)}**% chance of revival\n<:blank:917804200363171860> **${enemy.name}**'s DEF decreased by **-${decrease}**`);
        },
    },
    "2814": {
        usage: 1,
        used: 0,
        cost: 10,
        desc: "**Total Usage**: `1`\n**Mana**: `10`\\💧\n**Timeout**: `yes`\n\nWhen pushed to the brink of death, Tanya Degurechaff can self destruct as a last resort to take out her opponent. This requires her HP to be below 15% of her max HP and will deal 300% ATK damage. Tanya's HP will fall to 1 as well.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Tanya Degurechaff selfdestructs as a last resort
            if (myStats.hp/myStats.maxhp > 0.15) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                abilities["2814"].used--;
                myStats.sm += 10;
                return message.channel.send(`Self destruct can only be used once your hp is below 15% of your max HP (${Math.floor(myStats.maxhp*0.15)})`);
            };
            let dmg = Math.floor(((3*myStats.atk) * Math.pow(0.99818, eStats.def)) * (1 - (0.2*Math.random())));
            eStats.hp -= dmg;
            if (eStats.hp < 0) eStats.hp = 0;
            myStats.hp = 1;
            notice.push(`\n✨ **${char.name}** used self destruct! Dealt **${dmg}** damage`);
        },
    },
    "3150": {
        usage: 9999,
        used: 0,
        cost: 60,
        summoned: [],
        desc: "**Total Usage**: `max 3`\n**Mana**: `60`\\💧\n**Timeout**: `no`\n\nThanks to his ability to level up by fighting monsters, Sung Jin-Woo raises his level by 1 after every round for the duration of the fight. As the Shadow Monarch, he can summon one of his 3 loyal servants **Igris**, **Beru** or **Iron (SL)**. The user needs to have them in their inventory, and they take on their own stats. Once they're defeated, Sung Jin-Woo can no longer summon them.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Active: Sun Jin Woo summons either Igris, Bero or Iron (SL) from the users inventory. Passive:
            myStats.sm += 60;
            if (!inventory[message.author.id + message.guild.id].filter((e) => e === 3156 || e === 3159 || e === 3174).length) return message.channel.send("You don't have any of the characters **Igris**, **Beru** or **Iron (SL)** to summon.");
            
            matchStats.myStatsCC = {...myStats};
            matchStats.currentCharacter = 1;

            let obtained = [];
            if (inventory[user + message.guild.id].includes(3156) && !abilities["3150"].summoned.includes(3156)) obtained.push(3156);
            if (inventory[user + message.guild.id].includes(3159) && !abilities["3150"].summoned.includes(3159)) obtained.push(3159);
            if (inventory[user + message.guild.id].includes(3174) && !abilities["3150"].summoned.includes(3174)) obtained.push(3174);
            if (!obtained.length) return message.channel.send("All your shadow soldiers have been defeated.");

            myStats.sm -= 60;
            let pick = obtained[Math.floor(Math.random() * obtained.length)];
            abilities["3150"].summoned.push(pick);

            embed.setThumbnail(characters[pick].image);
            
            let newStats = getDetailedStats(pick, 0, false, user);
            ["hp", "maxhp", "atk", "def", "md", "mr", "cr", "cd", "td", "br", "dodge"].forEach((e) => {
                myStats[e] = newStats[e];
            });

            myStats.mana = 30;
            myStats.mg = 0;

            notice.push(`\n✨ **${char.name}** has summoned **${characters[pick].name}**`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // mybuff.maxhp.push(new buffInfo("+", 6.5, 9999));
            mybuff.hp.push(new buffInfo("+", 6, 9999));
            mybuff.atk.push(new buffInfo("+", 3, 9999, 3, "+"));
            mybuff.def.push(new buffInfo("+", 2, 9999, 2, "+"));
        },
    },
    "4767": {
        usage: 0,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `0`\n**Mana**: `0`\\💧\n**Timeout**: `no`\n\nDespite living in a world of magic and sorcery, Asta cannot use magic at all. Neverthless he keeps fighting without any abilities, relying purely on his physic strength. Then not all hope is yet lost for him. With his special Anti Magic grimoire he can block his enemies from using their abilities as well, overcoming their difference in battle strength.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Asta can't use abilities. Blocks ability usage of others as well
        },
    },
    "5058": {
        usage: 9999,
        used: 0,
        cost: 0,
        deaths: 0,
        desc: "**Total Usage**: `unlimited`\n**Timeout**: `no`\n\nMaking use of his unique ability to return by death, Natsuki Subaru can restart the game as many times as he wishes to. Additionally, the fight will automatically restart if he happens to die, which he can't. But that's not to say he isn't defeatable. After a maximum of 3 losses, Natsuki Subaru will flee after realizing how grim his chances of beating his opponent are.",
        update: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, resolve, user, ...list) => {
            abilities["5058"].deaths++;
            if (abilities["5058"].deaths > 2) return "lost";
            matchStats.round = 1;
            matchStats.turn = 1;
            Object.keys(myStats).forEach((e) => myStats[e] = myStatsFixed[e]);
            Object.keys(eStats).forEach((e) => eStats[e] = eStatsFixed[e]);
            Object.keys(mybuff).forEach((e) => mybuff[e] = []);
            Object.keys(ebuff).forEach((e) => ebuff[e] = []);
            mybuff.rev.push(new buffInfo("=", 1, 9999));
            mybuff.revhp.push(new buffInfo("=", 1, 9999));
            notice.push(`\n✨ **${char.name}** died. Restarting the match.`);
        },
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Active: Subaru restarts the game. Passive: Subaru can't die/Automatically restarts the game for a max of 3 times
            Object.keys(myStats).forEach((e) => myStats[e] = myStatsFixed[e]);
            Object.keys(eStats).forEach((e) => eStats[e] = eStatsFixed[e]);
            myStats.rev = 1, myStats.revhp = 1;
            matchStats.round = 1;
            matchStats.turn = 1;
            notice.push(`\n✨ **${char.name}** restarted the game.`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.rev = 1, myStats.revhp = 1;
            mybuff.rev.push(new buffInfo("=", 1, 9999));
            mybuff.revhp.push(new buffInfo("=", 1, 9999));
        },
    },
    "5549": {
        usage: 10,
        used: 0,
        cost: 45,
        desc: "**Total Usage**: `10`\n**Timeout**: `yes`\n\nYue gains Magic Resistance and Health proportional to her ATK (20%, 30% respectively) which she keeps till the end of the match. Additionally, Yue heals herself for 15% of all damage dealt as a passive.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Yue drains 20% of enemy HP and adds it to herself.
            let hmr = 60 + Math.floor(myStats.atk*0.2);
            mybuff.mr.push(new buffInfo("+", hmr, 9999));
            let hHp = Math.floor(myStats.atk*0.3);
            myStats.hp += hHp;
            if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            notice.push(`\n✨ **${char.name}** recovered **${hHp}** HP. Gained **${hmr}** Magic Resist`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.selfhealChance = 1;
            matchStats.selfheal = 0.15;
        },
    },
};

module.exports.abilities = abilities;