/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
const { getDetailedStats, dealDamage, deleteReplyIn } = require("./functions.js");
const { db, query } = require("../db_handler.js");
const { characters } = require("./chars.js");
const delayedBuffs = require("./delayedBuffs.js");
const buffInfo = require("./buffs.js");

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
        desc: "**Total Usage**: `unlimited`\n**Mana**: `25`\\💧\n**Timeout**: `yes`\n\nFushi randomly transforms in one of the following 3 characters from the anime **Fumetsu no Anata e**: Gugu, March or Parona. While in this form, a second use of his ability will transform him back into his original form. To be able to transform into one of these characters, You'll need to have them in your inventory.\nWhen played correctly, Fushi can be a powerful opponent holding 4 distinct characters within himself, each with their own stats.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            // Fushi transforms randomly in one of 3 characters who each have their own stats.
            let inv = await query(`SELECT characters.chars, characters.ref, characters.level, characters.class, characters.weapon, dungeon.classlevels FROM characters JOIN dungeon ON characters.id = dungeon.id WHERE characters.id = ${matchStats.interaction.user.id}`);
            inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref), level: JSON.parse(inv[0].level), class: JSON.parse(inv[0].class), weapon: JSON.parse(inv[0].weapon), classlevels: JSON.parse(inv[0].classlevels)};

            if (!(inv.chars.includes(65) || inv.chars.includes(66) || inv.chars.includes(67))) return matchStats.interaction.channel.send("You don't have any of the characters **Parona**, **Gugu** or **March** to transform into").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            
            if (this.selected === "fushi") {
                let obtained = [];
                if (inv.chars.includes(65)) obtained.push("parona");
                if (inv.chars.includes(66)) obtained.push("gugu");
                if (inv.chars.includes(67)) obtained.push("march");
                let pick = obtained[Math.floor(Math.random() * obtained.length)];
                let pID = {"parona": 65, "gugu": 66, "march":67}[pick];

                this.selected = pick;

                this.fushi = myStats.hp;
                let newStats = await getDetailedStats(pID, inv, inv.classlevels);
                ["hp", "maxhp", "atk", "def", "md", "mr", "cr", "cd", "td", "br", "dodge"].forEach((e) => {
                    myStats[e] = newStats[e];
                });
                if (this[pick]) myStats.hp = this[pick];

                Object.keys(myStats).forEach((e) => {
                    myStatsFixed[e] = myStats[e];
                });

                notice.push(`\n✨ **${char.name}** transformed into **${characters[pID].name}**!`);
                embed.setThumbnail(characters[pID].image);
            } else {
                this[this.selected] = myStats.hp;
                this.selected = "fushi";
                let newStats = await getDetailedStats(64, inv, inv.classlevels);
                ["hp", "maxhp", "atk", "def", "md", "mr", "cr", "cd", "td", "br", "dodge"].forEach((e) => {
                    myStats[e] = newStats[e];
                });
                myStats.hp = this.fushi;

                Object.keys(myStats).forEach((e) => {
                    myStatsFixed[e] = myStats[e];
                });

                notice.push(`\n✨ **${char.name}** transformed back`);
                embed.setThumbnail(char.image);
            };
        },
    },
    "77": {
        usage: 9999,
        used: 0,
        cost: 30,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `30`\\💧\n**Timeout**: `yes`\n\nWith her trusted rifle, Sinon hits every target in the bullseye, dealing critical hits. Against her, trying to dodge is not just futile, but she will deal more damage the more her target tries to dodge, as if she were mocking it (every 1% dodge = +1% dmg). She will abuse every weakness of her opponents, dealing magic or physical damage accordingly.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Sinon ignores dodge chance, deals more damage the more dodge% the enemy has, deals a guaranteed crit, and deals atk/matk depending on enemy weakness
            if (eStats.mr < eStats.def) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, {atkMultiplier: 0.95+eStats.dodge, magicDamage: true, mdChance: 0, critChance: 0, dodge: false, block: true});
            } else {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, {atkMultiplier: 0.95+eStats.dodge, critChance: 0, dodge: false, block: true});
            };
        },
    },
    "238": {
        usage: 3,
        used: 0,
        cost: 20,
        desc: "**Total Usage**: `3`\n**Mana**: `20`\\💧\n**Timeout**: `yes`\n\nUsing his ultimate skill Beelzebub, Rimuru Tempest can end a fight in an instant, devouring his enemy. While enemies with less than half of his own EP will lose immediately, the success rate of Beelzebub will decline with stronger enemies.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
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
            else notice.push(`\n✨ Attempt failed${(myStats.ep/eStats.ep > 0.8 && this.used < this.usage) ? ". Repeat next round?" : ""}`);
        },
    },
    "274": {
        usage: 1,
        used: 0,
        cost: 50,
        desc: "**Total Usage**: `1`\n**Mana**: `50`\\💧\n**Timeout**: `yes`\n\nBy transforming into a Titan, Eren will boost all of his stats by 15%. More Specifically, 15% of his max HP and 15% of his current DEF and current ATK each.",
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
        usage: 10,
        used: 0,
        cost: 60,
        desc: "**Total Usage**: `10`\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n\nWith her Noble Phantasm Excalibur, the pinnacle of holy swords, Saber unleashes her most powerful attack dealing 250% of her normal damage.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Saber unleashes an attack with 250% damage
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Excalibur! She`, {atkMultiplier: 2.5});
        },
    },
    "712": {
        usage: 9999,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `0`\\💧, then `10`\\💧 continuously\n**Timeout**: `no`\n\nWhen using his ability, Xiao dons the Yaksha Mask that set gods and demons trembling millennia ago. Until his mana runs dry, he will deal **30%** more magic damage in this state, losing 10 mana each round. If he uses his ability again during this state, he will lunge forward dealing **200%** magic damage by using 50 mana.",
        ability: function(myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if (matchStats.heap1.length > 0) { // Xiao increases md by 30% by consuming 10 mana per round. Deals 200% damage if used again.
                if (myStats.sm < 50) {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    return matchStats.interaction.channel.send(`You need at least **50**\\💧 for this attack.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                };
                myStats.sm -= 40;
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** lunged forward! He`, {atkMultiplier: 2, magicDamage: true, mdChance: 0});
            } else {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                if (myStats.sm < 10) return matchStats.interaction.channel.send(`You need at least **10**\\💧 to sustain this form`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                matchStats.consumeMana = 10;
                
                // Add new buffs to heap
                let mdbuff = new buffInfo("+", Math.floor(myStats.md*0.3), "9999");
                let mgbuff = new buffInfo("=", 0, "9999");
                mybuff.md.push(mdbuff); mybuff.mg.push(mgbuff);
                matchStats.heap1 = [{type: "md", id: mdbuff.id, buff: Math.floor(myStats.md*0.3)}, {type: "mg", id: mgbuff.id, buff: myStats.mg}];
                myStats.md += Math.floor(myStats.md*0.3);
                myStats.mg = 0;
                
                embed.setThumbnail("https://i.ibb.co/m024R2q/x.png");
                notice.push(`\n✨ **${char.name}** dons the Yaksha Mask, increasing his magic atk by **30%**`);
            };
        },
    },
    "733": {
        usage: 1,
        used: 0,
        cost: 40,
        desc: "**Total Usage**: `1`\n**Mana**: `40`\\💧\n**Timeout**: `yes`\n\nWith his ability, Albedo increases his ATK by 50% of his current DEF.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Albedo (GI) increases his ATK by 50% of his current DEF
            let inc = Math.floor(myStats.def/2);
            myStats.atk += inc;
            mybuff.atk.push(new buffInfo("+", inc, 9999));
            notice.push(`\n✨ **${char.name}** has increased his **ATK** by half of his **DEF** (**+${inc}**)`);
        },
    },
    "767": {
        usage: 1,
        used: 0,
        cost: 100,
        desc: "**Total Usage**: `1`\n**Mana**: `100`\\💧\n**Timeout**: `yes`\n\nHaving invested all her skill points in this one Explosion magic, her attack is not to be unerestimated. Those caught in its path will feel the full force of Megumin's might, as she unleashes the ultimate attack of destruction dealing **300%** guateed magic damage. This takes all her energy though, and she becomes useless for the next 2 rounds as her damage and defense plummet to 0.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Megumin unleashes an attack with 300% magic damage. This can't be dodged. ATK, MATK, DEF and MDEF fall to 0 for 2 rounds
            embed.setThumbnail("https://i.ibb.co/9wktf9S/c.gif");
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ Bakuretsu! Bakuhatsu! **EXPLOSION!!!** She`, {atkMultiplier: 3, magicDamage: true, mdChance: 0, dodge: false});
            mybuff.atk.push(new buffInfo("=", 0, 2));
            mybuff.def.push(new buffInfo("=", 0, 2));
            mybuff.md.push(new buffInfo("=", 0, 2));
            mybuff.mr.push(new buffInfo("=", 0, 2));
            myStats.atk = 0, myStats.def = 0, myStats.md = 0, myStats.mr = 0;
        },
    },
    "1001": {
        usage: 9999,
        used: 0,
        pause: 0,
        cost: 60,
        desc: "**Total Usage**: `unlimited` (with a 6 round cooldown)\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n\nRoronoa Zoro, a master of swordsmanship, is best known for his unique \"Three Sword Style\". After using his ability, Zoro will draw and attack with all 3 of his swords on normal attacks. He can hold this form for at most 3 rounds, but there's also a 15% chance of missing an attack, which leads him to put away his swords as well.\n\nAfter using his ability, Zoro needs to rest 6 rounds before he can use it again.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            // Zoro uses all 3 of his swords to attack 3x
            if (this.pause > matchStats.round) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                this.used--;
                myStats.sm += 60;
                return matchStats.interaction.channel.send(`Zoro needs to rest ${this.pause-matchStats.round} more ${this.pause-matchStats.round === 1 ? "round" : "rounds"}`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            };
            this.pause = matchStats.round+6;
            myStats.replaceButton.atk = {
                "emoji": "<:zoro:1084242647339761704>",
                "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    if (Math.random() < 0.15) {
                        notice.push("\n✨ Zoro missed the enemy. He is too tired to continue.");
                        delete myStats.replaceButton.atk;
                    } else {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:zoro:1084242647339761704> **${char.name}**`, {magicDamage: true});
                        if (Math.random() < 0.15) {
                            notice.push("\n✨ Zoro missed the enemy. He is too tired to continue.");
                            delete myStats.replaceButton.atk;
                        } else {
                            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:zoro:1084242647339761704> **${char.name}**`, {magicDamage: true});
                            if (Math.random() < 0.15) {
                                notice.push("\n✨ Zoro missed the enemy. He is too tired to continue.");
                                delete myStats.replaceButton.atk;
                            } else {
                                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:zoro:1084242647339761704> **${char.name}**`, {magicDamage: true});
                            };
                        };
                    };
                },
            };
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round+3, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                delete myStats.replaceButton.atk;
            }));
        },
    },
    "1824": {
        usage: 1,
        used: 0,
        cost: 20,
        desc: "**Total Usage**: `1`\n**Mana**: `20`\\💧\n**Timeout**: `no`\n\nRyuuko Matoi sacrifices 30% of her current HP for an ATK increase of 60% of those lost HP",
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
        desc: "**Total Usage**: `1`\n**Mana**: `50`\\💧\n**Timeout**: `yes`\n\nBy equipping her unique armor Hermes Trismegistus, Albedo increases her DEF by 50% and gains a 25% ATK increase of her current DEF.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Albedo permanently increases DEF by 50% and ATK by 25% of current DEF
            let raiseDef = Math.floor(myStats.def/2);
            let raiseAtk = Math.floor(myStats.def/4);
            myStats.def += raiseDef;
            mybuff.def.push(new buffInfo("+", raiseDef, 9999));
            myStats.atk += raiseAtk;
            mybuff.atk.push(new buffInfo("+", raiseAtk, 9999));
            notice.push(`\n✨ **${char.name}** equipped Hermes Trismegistus!\n<:blank:917804200363171860> She has gained **+${raiseDef}**DEF and **+${raiseAtk}**ATK`);
            embed.setThumbnail("https://i.ibb.co/S7v6Qmx/a.png");
        },
    },
    "2080": {
        usage: 5,
        used: 0,
        cost: 45,
        desc: "**Total Usage**: `5`\n**Mana**: `45`\\💧\n**Timeout**: `yes`\n\nAs a Vampire, Shalltear Bloodfallen can drain HP from her opponent to add it to herself. With every use of her ability, she will drain the equivalent of 20% of her HP.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Shalltear drains the equivalent of 20% of her max HP from the enemy and adds it to herself.
            let drain = Math.floor(myStats.maxhp/5);
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
        cost: 35,
        desc: "**Total Usage**: `3`\n**Mana**: `35`\\💧\n**Timeout**: `yes`\n\nHer ability, the Code of Immortality grants C.C. with the burden of immortality. With every use of her ability, she gains an additional 14% of chance of revival for a total of 42% at most. If revived, C.C. will have 30%, 35% or 40% of HP depending on how often she used her ability. She can revive herself for a maximum of 3 times in a single match.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            // C.C. gains +14% chance of revival with 30/35/40% of max HP
            myStats.rev += 0.14;
            if (this.used === 1) myStats.revhp = 0.3, mybuff.revhp.push(new buffInfo("=", 0.3, 9999));
            else myStats.revhp += 0.05, mybuff.revhp.push(new buffInfo("+", 0.05, 9999));
            notice.push(`\n✨ **${char.name}** used her Code of Immortality for a **${Math.round(myStats.rev*100)}**% chance of revival with **${100*myStats.revhp}**% HP!`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.maxRevivals += 3;
        },
    },
    "2814": {
        usage: 1,
        used: 0,
        cost: 10,
        desc: "**Total Usage**: `1`\n**Mana**: `10`\\💧\n**Timeout**: `yes`\n\nWhen pushed to the brink of death, Tanya Degurechaff can self destruct as a last resort to take out her opponent. This requires her HP to be below 15% of her max HP and will deal 300% guaranteed damage. Tanya's HP will fall to 1 as well.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            // Tanya Degurechaff selfdestructs as a last resort
            if (myStats.hp/myStats.maxhp > 0.15) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                this.used--;
                myStats.sm += 10;
                return matchStats.interaction.channel.send(`Self destruct can only be used once your hp is below 15% of your max HP (${Math.floor(myStats.maxhp*0.15)})`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            };
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used self destruct! She`, {atkMultiplier: 3, dodge: false});
            myStats.hp = 1;
        },
    },
    "3150": {
        usage: 9999,
        used: 0,
        cost: 60,
        summoned: [],
        desc: "**Total Usage**: `max 3`\n**Mana**: `60`\\💧\n**Timeout**: `no`\n\nThanks to his ability to level up by fighting monsters, Sung Jin-Woo raises his level by 1 after every round for the duration of the fight. As the Shadow Monarch, he can summon one of his 3 loyal servants **Igris**, **Beru** or **Iron (SL)**. The user needs to have them in their inventory, and they take on their own stats. Once they're defeated, Sung Jin-Woo can no longer summon them.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            // Active: Sung Jin Woo summons either Igris, Beru or Iron (SL) from the users inventory. Passive:
            let inv = await query(`SELECT characters.chars, characters.ref, characters.level, characters.class, characters.weapon, dungeon.classlevels FROM characters JOIN dungeon ON characters.id = dungeon.id WHERE characters.id = ${matchStats.interaction.user.id}`);
            inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref), level: JSON.parse(inv[0].level), class: JSON.parse(inv[0].class), weapon: JSON.parse(inv[0].weapon), classlevels: JSON.parse(inv[0].classlevels)};

            if (!inv.chars.filter((e) => e === 3156 || e === 3159 || e === 3174).length) return matchStats.interaction.channel.send("You don't have any of the characters **Igris**, **Beru** or **Iron (SL)** to summon.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            
            matchStats.myStatsCC = {...myStats};
            matchStats.currentCharacter = 1;

            let obtained = [];
            if (inv.chars.includes(3156) && !this.summoned.includes(3156)) obtained.push(3156);
            if (inv.chars.includes(3159) && !this.summoned.includes(3159)) obtained.push(3159);
            if (inv.chars.includes(3174) && !this.summoned.includes(3174)) obtained.push(3174);
            if (!obtained.length) return matchStats.interaction.channel.send("All your shadow soldiers have been defeated.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));

            let pick = obtained[Math.floor(Math.random() * obtained.length)];
            this.summoned.push(pick);

            embed.setThumbnail(characters[pick].image);
            
            let newStats = await getDetailedStats(pick, inv, inv.classlevels);
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
    "4942": {
        usage: 1,
        used: 0,
        cost: 80,
        desc: "**Total Usage**: `max 1`\n**Mana**: `80`\\💧\n**Timeout**: `yes`\n\nCid Kagenou tries his best to blend into the background and become a mob character. His attack and magic damage are decreased by **20%** for that during this phase, as well as his dodge chance and block rate which are nonexistent. However, when his HP falls below **50%** he will unveil his true identity as Shadow and increase his attack & magic damage by **30%**, defense & magic resist by **10%**, dodge chance & block rate by **+10%** and heal himself for **30%** of missing HP. Using his active, Shadow will use his almighty power and deal **250%** damage which can't be dodged nor blocked.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            // Active: Cid Kagenou deals 250% damage. Passive: Enters his shadow form when HP falls below 50%
            notice.push(`\n<:atomic:1076326318565765150> _**I... AM... ATOMIC**_`);
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, {atkMultiplier: 2.5, magicDamage: true, dodge: false});
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Starts with decreased Stats
            myStats.atk = Math.floor(myStats.atk*0.8);
            myStats.md = Math.floor(myStats.md*0.8);
            myStats.dodge = 0;
            myStats.br = 0;

            // Delayed Buff
            myStats.delayedBuffs.push(new delayedBuffs(0, function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp/myStats.maxhp < 0.5) {
                    myStats.hp += Math.floor((myStats.maxhp - myStats.hp) * 0.3);
                    myStats.atk += Math.floor(myStats.atk*0.3);
                    myStats.md += Math.floor(myStats.md*0.3);
                    mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk*0.3), 9999));
                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.md*0.3), 9999));
                    myStats.def += Math.floor(myStats.def*0.1);
                    myStats.mr += Math.floor(myStats.atk*0.1);
                    mybuff.def.push(new buffInfo("+", Math.floor(myStats.def*0.1), 9999));
                    mybuff.mr.push(new buffInfo("+", Math.floor(myStats.atk*0.1), 9999));
                    myStats.dodge += 0.1;
                    myStats.br += 0.1;
                    if (myStats.dodge > 1) myStats.dodge = 1;
                    if (myStats.br > 1) myStats.br = 1;
                    mybuff.dodge.push(new buffInfo("+", 0.1, 9999));
                    mybuff.br.push(new buffInfo("+", 0.1, 9999));
                    if (eStats.shield > 0) {
                        eStats.shield = 0;
                        notice.push(`\n✨ **${enemy.name}**'s shield broke down!`);
                    };
                    notice.push(`\n✨ **${char.name}** entered his shadow form!`);
                    embed.setThumbnail("https://i.imgur.com/2VZTpDS.png");
                    this._used++;
                } else {
                    myStats.atk = Math.floor(myStats.atk*0.8);
                    myStats.md = Math.floor(myStats.md*0.8);
                    myStats.dodge = 0;
                    myStats.br = 0;
                };
            }, 9999, 1));
        },
    },
    // "5058": {
    //     usage: 9999,
    //     used: 0,
    //     cost: 0,
    //     deaths: 0,
    //     desc: "**Total Usage**: `unlimited`\n**Mana**: `0`\\💧\n**Timeout**: `no`\n\nMaking use of his unique ability to return by death, Natsuki Subaru can restart the game as many times as he wishes to. Additionally, the fight will automatically restart if he happens to die, which he can't. But that's not to say he isn't defeatable. After a maximum of 3 losses, Natsuki Subaru will flee after realizing how grim his chances of beating his opponent are.",
    //     update: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, resolve, user, ...list) {
    //         this.deaths++;
    //         if (this.deaths > 2) return "lost";
    //         matchStats.round = 1;
    //         matchStats.turn = 1;
    //         Object.keys(myStats).forEach((e) => myStats[e] = myStatsFixed[e]);
    //         Object.keys(eStats).forEach((e) => eStats[e] = eStatsFixed[e]);
    //         Object.keys(mybuff).forEach((e) => mybuff[e] = []);
    //         Object.keys(ebuff).forEach((e) => ebuff[e] = []);
    //         mybuff.rev.push(new buffInfo("=", 1, 9999));
    //         mybuff.revhp.push(new buffInfo("=", 1, 9999));
    //         notice.push(`\n✨ **${char.name}** died. Restarting the match.`);
    //     },
    //     ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
    //         // Active: Subaru restarts the game. Passive: Subaru can't die/Automatically restarts the game for a max of 3 times
    //         Object.keys(myStats).forEach((e) => myStats[e] = myStatsFixed[e]);
    //         Object.keys(eStats).forEach((e) => eStats[e] = eStatsFixed[e]);
    //         myStats.rev = 1, myStats.revhp = 1;
    //         matchStats.round = 1;
    //         matchStats.turn = 1;
    //         notice.push(`\n✨ **${char.name}** restarted the game.`);
    //     },
    //     passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
    //         myStats.rev = 1, myStats.revhp = 1;
    //         mybuff.rev.push(new buffInfo("=", 1, 9999));
    //         mybuff.revhp.push(new buffInfo("=", 1, 9999));
    //     },
    // },
    "5549": {
        usage: 10,
        used: 0,
        cost: 45,
        desc: "**Total Usage**: `10`\n**Mana**: `45`\\💧\n**Timeout**: `yes`\n\nYue gains Magic Resistance and Health proportional to her ATK (20%, 30% respectively) which she keeps till the end of the match. Additionally, Yue heals herself for 15% of all damage dealt as a passive.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Yue
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
            matchStats.selfheal += 0.15;
        },
    },
    "8189": {
        usage: 9999,
        used: 0,
        cost: 0,
        armor: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `0`\\💧, then `15`\\💧 continuously\n**Timeout**: `no`\n\nWith her Re-Equip magic, Erza Scarlet is able to select between 5 different armors to face her opponent as needed. With every use of her ability, she will cycle through her armors, and she'll use up 25 mana every round. Her inventory is as follows:\n\n__Fire Empress Armor__: Grants her **60%** ATK but decreases DEF by **20%**\n__Adamantine Armor__: Grants her **60%** DEF but decreases ATK by **20%**\n__Heaven's Wheel Armor__: Grants her **25%** ATK and DEF\n__Clear Heart Clothing__: Grants her **10%** ATK, **+20%** crit rate, **+50%** crit damage and **+10%** dodge chance\n__Armadura Fairy__: Heals her for **10%** of max HP per round",
        ability: function(myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            matchStats.turn = matchStats.turnSkill ? 0 : 1; // Erza Scarlet can change between 5 different equipment
            if (myStats.sm < 15) return matchStats.interaction.channel.send(`You need at least **15**\\💧 to sustain this form`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            matchStats.consumeMana = 15;

            // clear previous armors effects
            if (matchStats.heap1.length > -1) {
                matchStats.heap1.forEach((e) => {
                    mybuff[e.type].forEach((a, i) => {
                        if (a.id === e.id) mybuff[e.type].splice(i, 1);
                    });
                    if (e.type === "mg") myStats[e.type] += e.buff;
                    else myStats[e.type] -= e.buff;
                });
                // matchStats.consumeMana = 0;
                matchStats.heap1 = [];
            };

            // Add new buffs to heap
            let armorName, atkbuff, defbuff, crbuff, cdbuff, dodgebuff, hpbuff, mgbuff = new buffInfo("=", 0, "9999");
            switch (this.armor++%5) {
                case 0: embed.setThumbnail("https://i.ibb.co/KFLzdqd/f.png"); armorName = "Fire Empress Armor. She gained **60%** ATK, decreased DEF by **20%**"; atkbuff = new buffInfo("+", Math.floor(myStats.atk*0.6), "9999"); defbuff = new buffInfo("+", -Math.floor(myStats.def*0.2), "9999"); mybuff.atk.push(atkbuff); mybuff.def.push(defbuff); mybuff.mg.push(mgbuff); matchStats.heap1 = [{type: "atk", id: atkbuff.id, buff: Math.floor(myStats.atk*0.6)}, {type: "def", id: defbuff.id, buff: -Math.floor(myStats.def*0.2)}, {type: "mg", id: mgbuff.id, buff: myStats.mg}]; myStats.atk += Math.floor(myStats.atk*0.6); myStats.def += -Math.floor(myStats.def*0.2); myStats.mg = 0; break;
                case 1: embed.setThumbnail("https://i.ibb.co/HG4tHWt/a.png"); armorName = "Adamantine Armor. She gained **60%** DEF, decreased ATK by **20%**"; atkbuff = new buffInfo("+", -Math.floor(myStats.atk*0.2), "9999"); defbuff = new buffInfo("+", Math.floor(myStats.def*0.6), "9999"); mybuff.atk.push(atkbuff); mybuff.def.push(defbuff); mybuff.mg.push(mgbuff); matchStats.heap1 = [{type: "atk", id: atkbuff.id, buff: -Math.floor(myStats.atk*0.2)}, {type: "def", id: defbuff.id, buff: Math.floor(myStats.def*0.6)}, {type: "mg", id: mgbuff.id, buff: myStats.mg}]; myStats.atk += -Math.floor(myStats.atk*0.2); myStats.def += Math.floor(myStats.def*0.6); myStats.mg = 0; break;
                case 2: embed.setThumbnail("https://i.ibb.co/VDPkR10/w.png"); armorName = "Heaven's Wheel Armor. She gained **25%** ATK and DEF"; atkbuff = new buffInfo("+", Math.floor(myStats.atk*0.25), "9999"); defbuff = new buffInfo("+", Math.floor(myStats.def*0.25), "9999"); mybuff.atk.push(atkbuff); mybuff.def.push(defbuff); mybuff.mg.push(mgbuff); matchStats.heap1 = [{type: "atk", id: atkbuff.id, buff: Math.floor(myStats.atk*0.25)}, {type: "def", id: defbuff.id, buff: Math.floor(myStats.def*0.25)}, {type: "mg", id: mgbuff.id, buff: myStats.mg}]; myStats.atk += Math.floor(myStats.atk*0.25); myStats.def += Math.floor(myStats.def*0.25); myStats.mg = 0; break;
                case 3: embed.setThumbnail("https://i.ibb.co/TH4gNq5/c.png"); armorName = "Clear Heart Clothing. She gained **10%** ATK, **+20%** crit rate, **+50%** crit damage, and **+10%** dodge chance"; atkbuff = new buffInfo("+", Math.floor(myStats.atk*0.1), "9999"); crbuff = new buffInfo("+", 0.2, "9999"); cdbuff = new buffInfo("+", 0.5, "9999"); dodgebuff = new buffInfo("+", 0.1, "9999"); mybuff.atk.push(atkbuff); mybuff.cr.push(crbuff); mybuff.cd.push(cdbuff); mybuff.dodge.push(dodgebuff); mybuff.mg.push(mgbuff); matchStats.heap1 = [{type: "atk", id: atkbuff.id, buff: Math.floor(myStats.atk*0.1)}, {type: "cr", id: crbuff.id, buff: 0.2}, {type: "cd", id: cdbuff.id, buff: 0.5}, {type: "dodge", id: dodgebuff.id, buff: 0.1}, {type: "mg", id: mgbuff.id, buff: myStats.mg}]; myStats.atk += Math.floor(myStats.atk*0.1); myStats.cr += 0.2; myStats.cd += 0.5; myStats.dodge += 0.1; myStats.mg = 0; break;
                case 4: embed.setThumbnail("https://i.imgur.com/TDbvwEX.png"); armorName = "Armadura Fairy. She will gain **10%** HP every round"; hpbuff = new buffInfo("+", Math.floor(myStats.maxhp*0.1), "9999"); mybuff.hp.push(hpbuff); mybuff.mg.push(mgbuff); matchStats.heap1 = [{type: "hp", id: hpbuff.id, buff: Math.floor(myStats.maxhp*0.1)}, {type: "mg", id: mgbuff.id, buff: myStats.mg}]; /* myStats.hp += Math.floor(myStats.maxhp*0.1); myStats.hp > myStats.maxhp ? myStats.hp = myStats.maxhp : false; */ myStats.mg = 0; break;
                default: false; break;
            };
            notice.push(`\n✨ **${char.name}** changed to ${armorName}`);
        },
    },
    "8521": {
        usage: 3,
        used: 0,
        cost: 50,
        desc: "**Total Usage**: `3`\n**Mana**: `50`\\💧\n**Timeout**: `yes`\n\nKiyotaka Ayanokouji seems like an ordinary student from the outside, leading his enemies to underestimate him and letting their guards down, decreasing defense by 20% and block rate as well as dodge chance by 50%. While he'll go easy on most challanges coming his way, seemingly with no ambitions whatsoever, Ayanokouji will do anything it takes to win. Step by step, Ayanokouji increases his attack by 15%, 25% and 33% permanently and increases his dodge chance by 5% each time. Because winning is everything in this world. As long as he wins in the end... that's all that matters.",
        ability: function(myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            // Kiyotaka Ayanokouji increases his attack by 15/25/33% and gains +5% dodge chance
            switch (this.used) {
                case 1: embed.setThumbnail("https://i.ibb.co/y8MDgRD/g.gif"); myStats.atk = Math.floor(myStats.atk*1.15); mybuff.atk.push(new buffInfo("*", 1.15, 9999)); myStats.dodge += 0.05; mybuff.dodge.push(new buffInfo("+", 0.05, 9999)); notice.push(`\n✨ **${char.name}** decides to get slightly serious. Increased ATK by **15%** and dodge by **+5%**`); break;
                case 2: myStats.atk = Math.floor(myStats.atk*1.25); mybuff.atk.push(new buffInfo("*", 1.25, 9999)); myStats.dodge += 0.05; mybuff.dodge.push(new buffInfo("+", 0.05, 9999)); notice.push(`\n✨ **${char.name}** gets a little more serious. Increased ATK by **25%** and dodge by **+5%**`); break;
                case 3: myStats.atk = Math.floor(myStats.atk*1.33); mybuff.atk.push(new buffInfo("*", 1.33, 9999)); myStats.dodge += 0.05; mybuff.dodge.push(new buffInfo("+", 0.05, 9999)); notice.push(`\n✨ **${char.name}** goes all out. Increased ATK by **33%** and dodge by **+5%**`); break;
                default: false; break;
            };
            // matchStats.turn = matchStats.turnSkill ? 0 : 1;
            // notice.push(`\n✨ **${char.name}** recovered **${hHp}** HP. Gained **${hmr}** Magic Resist`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.def *= 0.8;
            eStats.br *= 0.5;
            eStats.dodge *= 0.5;
            ebuff.def.push(new buffInfo("*", 0.8, 9999));
            ebuff.br.push(new buffInfo("*", 0.5, 9999));
            ebuff.dodge.push(new buffInfo("*", 0.5, 9999));
        },
    },
    "8890": {
        usage: 9999,
        used: 0,
        cost: 40,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `40`\\💧\n**Timeout**: `no`\n\nBeing one of the strongest psychic heroes, Tatsumaki's attacks always deal magic damage. She gas **20%** increased magic damage throughout the battle, and decreases her enemy's magic resistance by 30% when using her ability, making them more vulnerable towards her attacks.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Tatsumaki decreases enemy magic resistance
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            eStats.mr = Math.floor(eStats.mr * 0.7);
            ebuff.mr.push(new buffInfo("*", 0.7, 3));
            notice.push(`\n✨ **${char.name}** decreased enemy magic resistance by **30%** for 3 rounds!`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.mdChance = 1;
            let atkBonus = Math.floor(myStats.md*0.2);
            myStats.md += atkBonus;
            mybuff.md.push(new buffInfo("+", atkBonus, 9999));
        },
    },
    "9000": {
        usage: 9999,
        used: 0,
        cost: 25,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `25, 50, 75, and 100+`\\💧 depending on how much you have\n**Timeout**: `yes`\n\nIchigo's ability is split into 4 different parts, and depending on his current mana his ability will have differing effects. If his mana is between 25-49\\💧, Ichigo deals an attack dealing **120%** damage, which can be both physical or magic damage depending on his other stats. If he has 50-74\\💧 he increases his ATK and MD by **30%** and his DEF by **10%** for 4 rounds. If it is between 75-99\\💧 he will double his ATK and MD but decrease DEF by **20%** for 3 rounds. Above this, his entire mana will be converted into ATK and MD (1\\💧 = 1% boost) and reduce enemy block rate to **0%** for 4 rounds.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Ichigo's ability comes in these 4 stages: 
            if (myStats.sm < 50) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Getsuga Tensho! He`, {atkMultiplier: 1.2, magicDamage: true});
            } else if (myStats.sm < 75) {
                myStats.sm -= 25;
                myStats.def = Math.floor(myStats.def*1.1);
                myStats.atk = Math.floor(myStats.atk*1.3);
                myStats.md = Math.floor(myStats.md*1.3);
                mybuff.def.push(new buffInfo("*", 1.1, 4));
                mybuff.atk.push(new buffInfo("*", 1.3, 4));
                mybuff.md.push(new buffInfo("*", 1.3, 4));
                notice.push(`\n✨ **${char.name}** used his Bankai! Increased his ATK and MD by **30%** and DEF by **10%** for 4 rounds.`);
            } else if (myStats.sm < 100) {
                myStats.sm -= 50;
                myStats.def = Math.floor(myStats.def*0.8);
                myStats.atk *= 2;
                myStats.md *= 2;
                mybuff.def.push(new buffInfo("*", 0.8, 3));
                mybuff.atk.push(new buffInfo("*", 2, 3));
                mybuff.md.push(new buffInfo("*", 2, 3));
                notice.push(`\n✨ **${char.name}** used King of Hell! Doubled his ATK and MD but decreased DEF by **20%** for 3 rounds.`);
            } else {
                myStats.sm = 25;
                eStats.br = 0;
                ebuff.br.push(new buffInfo("=", 0, 4));
                myStats.atk = Math.floor(myStats.atk*(myStats.sm/100));
                myStats.md = Math.floor(myStats.md*(myStats.sm/100));
                mybuff.atk.push(new buffInfo("*", (myStats.sm/100), 4));
                mybuff.md.push(new buffInfo("*", (myStats.sm/100), 4));
                notice.push(`\n✨ **${char.name}** used his Final Getsuga Tensho! Increased ATK and MD by **${myStats.sm}%** and reduced enemy block rate to **0%** for 4 rounds.`);
            };
        },
    },
    "9606": {
        usage: 9999,
        used: 0,
        cost: 55,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `55`\\💧\n**Timeout**: `no`\n\nAs agile as she is, Meme truly is difficult to catch. She has **10**% increased dodge chances at all times, and through the use of her ability she can increase it by up to **30%** for 3 rounds (max 50%).",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Meme increases her dodge chance by 30% (max 50%) and has +10% passively
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            let increase_eva = myStats.dodge < 0.2 ? 0.3 : Math.abs(0.5 - myStats.dodge);
            myStats.dodge += increase_eva;
            mybuff.dodge.push(new buffInfo("+", increase_eva, 3));
            notice.push(`\n✨ **${char.name}** increased her dodge chance to **${(myStats.dodge+increase_eva)*100}%**!`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.dodge += 0.1;
            mybuff.dodge.push(new buffInfo("+", 0.1, 9999));
        },
    },
    "12121": {
        usage: 9999,
        used: 0,
        cost: 50,
        roundUsed: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `50`\\💧\n**Timeout**: `no`\n\nAll Might's ability One For All is a Quirk that allows the user to temporarily increase their strength and speed to superhuman levels. When activated, One For All doubles the user's ATK and reduces enemy DEF by half, making them more vulnerable to his attacks. This allows the user to deliver powerful blows and take down their enemies with ease. However, the Quirk does come with a drawback, as it can put a strain on the user's body, potentially causing injury, damaging himself for 5% of his current HP (10% chance of failure). As such, it should be used carefully.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            // All Might doubles his ATK and reduces enemy def by half for the next attack. 10% chance of failure damaging himself for 5% HP
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (matchStats.round === this.roundUsed) {
                myStats.sm += this.cost;
                return matchStats.interaction.channel.send("You can't stack All Might's ability").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            };
            if (Math.random() < 0.1) {
                let dmg = Math.floor(myStats.hp*0.05)
                myStats.hp -= dmg;
                return notice.push(`\n✨ **${char.name}** damaged himself by **${dmg}**!`);
            };
            myStats.atk *= 2;
            eStats.def = Math.floor(eStats.def*0.5);
            this.roundUsed = matchStats.round;
            notice.push(`\n✨ **${char.name}** doubled his ATK and decreased enemy DEF by half!`);
        },
    },
};

module.exports.abilities = abilities;