/* eslint-disable no-unused-vars */
const fs = require('fs');
const { getDetailedStats, dealDamage, deleteReplyIn, generateImage } = require("./functions.js");
const { db, query } = require("../db_handler.js");
const { characters } = require("./chars.js");
const { items } = require("./items.js");
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
        desc: "**Total Usage**: `unlimited`\n**Mana**: `25`\\💧\n**Timeout**: `yes`\n**Type**: `DPS`\n\nFushi randomly transforms in one of the following 3 characters from the anime **Fumetsu no Anata e**: Gugu, March or Parona. While in this form, a second use of his ability will transform him back into his original form. To be able to transform into one of these characters, You'll need to have them in your inventory.\nWhen played correctly, Fushi can be a powerful opponent holding 4 distinct characters within himself, each with their own stats.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Fushi transforms randomly in one of 3 characters who each have their own stats.
            let inv = await query(`SELECT characters.chars, characters.ref, characters.level, characters.equipment, dungeon.classlevels FROM characters JOIN dungeon ON characters.id = dungeon.id WHERE characters.id = ${matchStats.interaction.user.id}`);
            inv = {id: matchStats.interaction.user.id, class: myStats.class, chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref), level: JSON.parse(inv[0].level), equipment: JSON.parse(inv[0].equipment), classlevels: JSON.parse(inv[0].classlevels)};

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
        desc: "**Total Usage**: `unlimited`\n**Mana**: `30`\\💧\n**Timeout**: `yes`\n**Type**: `DPS`\n\nWith her trusted rifle, Sinon hits every target in the bullseye, dealing critical hits. Against her, trying to dodge is not just futile, but she will deal more damage the more her target tries to dodge, as if she were mocking it (every 1% dodge = +1% dmg). She will abuse every weakness of her opponents, dealing magic or physical damage accordingly.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Sinon ignores dodge chance, deals more damage the more dodge% the enemy has, deals a guaranteed crit, and deals atk/matk depending on enemy weakness
            if (eStats.mr < eStats.def) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, {atkMultiplier: 0.95+eStats.dodge, magicDamage: true, mdChance: -1, critChance: 0, dodge: false, block: true});
            } else {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, {atkMultiplier: 0.95+eStats.dodge, critChance: 0, dodge: false, block: true});
            };
        },
    },
    "238": {
        usage: 3,
        used: 0,
        cost: 20,
        desc: "**Total Usage**: `3`\n**Mana**: `20`\\💧\n**Timeout**: `yes`\n**Type**: `Farming`\n\nUsing his ultimate skill Beelzebub, Rimuru Tempest can end a fight in an instant, devouring his enemy. While enemies with less than half of his own EP will lose immediately, the success rate of Beelzebub will decline with stronger enemies.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Rimuru has a chance of 100%/60%/30%/10%/0% to instantly kill the enemy
            if (matchStats.interaction.commandName === "stampede") {
                matchStats.turn = 0;
                myStats.sm += 20;
                return matchStats.interaction.channel.send(`Rimuru can't be used in this game mode.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            };

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
        desc: "**Total Usage**: `1`\n**Mana**: `50`\\💧\n**Timeout**: `yes`\n**Type**: `DPS`\n\nBy transforming into a Titan, Eren will boost all of his stats by 15%. More Specifically, 15% of his max HP and 15% of his current DEF and current ATK each.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
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
        desc: "**Total Usage**: `10`\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n**Type**: `DPS`\n\nWith her Noble Phantasm Excalibur, the pinnacle of holy swords, Saber unleashes her most powerful attack dealing 250% of her normal damage.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Saber unleashes an attack with 250% damage
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Excalibur! She`, {atkMultiplier: 2.5});
        },
    },
    "408": {
        usage: 1,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `1`\n**Mana**: `0`\\💧 on active, `35`\\💧 on passive\n**Timeout**: `no`\n**Type**: `DPS/Support`\n\nGilgamesh, the King of Heroes, brings his mighty arsenal to bear, showcasing a battle style as grand as his title. His potent abilities revolve around his majestic Gates of Babylon and his ultimate weapon, the Sword of Rupture, Ea.\n\nGilgamesh's passive becomes apparent whenever he possesses at least **35**\\💧. He opens the Gates of Babylon, launching a weapon straight at his opponent, causing damage equivalent to **40%** of his normal damage. Each successful strike bolsters Gilgamesh's own strength, incrementing his attack and magic attack by **1%**. However, there is an element of chance, as these attacks can potentially miss or be blocked by the enemy.\n\nOnce per battle, Gilgamesh reveals his trump card, the formidable Ea. He initiates the ability by commencing the charge of Enuma Elish, a process that takes three turns to charge. Once the charge reaches its peak, the unleashed attack inflicts damage equal to **150%** of Gilgamesh's attack. This damage can further be boosted, gaining an additional **1%** for every weapon the player owns up to a whopping **250%**.\n\nWhile he may display an air of arrogance, Gilgamesh's abilities undeniably reflect his moniker as the King of Heroes, wreaking havoc among his enemies with his versatile and formidable armaments. And his companions he doesn't leave on their own, assisting them with his Gates of Babylon during stampedes.",
        ability: async (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            const { 0: { n: inv } } = await query(`SELECT COUNT(*) AS n FROM weapons WHERE id = ${matchStats.interaction.user.id} AND substats IS NULL`);
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round+3, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Ea! He`, {atkMultiplier: 1.5+Math.min((inv||0)/100, 1), magicDamage: true, dodge: false});
            }));
            notice.push(`\n✨ **${char.name}** began charging Ea`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (myStats.sm >= 35) {
                    myStats.sm -= 35;
                    let dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, {atkMultiplier: 0.4, magicDamage: true});
                    if (dmg) {
                        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk*0.01), 9999));
                        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md*0.01), 9999));
                    };
                };
            }, 9999));
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            if (Math.random() < 0.33) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, {atkMultiplier: 0.4, ignoreShield: true, magicDamage: true});
            };
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.33) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, {atkMultiplier: 0.4, ignoreShield: true, magicDamage: true});
                };
            }, 9999));
        },
    },
    "512": {
        usage: 1,
        used: 0,
        cost: 80,
        desc: "**Total Usage**: `1`\n**Mana**: `80`\\💧\n**Timeout**: `no`\n**Type**: `Tank`\n\nMash Kyrielight, the Shield of Chaldea, takes her defensive prowess to new heights in battle, turning her durability into an asset for her and her party. Mash's ability allows her to create a protective shield amounting to **25%** of her max HP. This tactical layer of defense provides a significant cushion against incoming damage, but it can only be utilized once per battle.\n\nHer passive ability, meanwhile, further fortifies her defenses. Mash inherently takes 10% less damage, and as long as she maintains her shield, her attack increases by **15%**, turning defense into offense.\n\nWhen it comes to party support, Mash's protective nature shines through once more. All of her allies begin the fight with a shield equal to **10%** of their max HP, **10%** increased block rate and they take **10%** less damage. Her abilities emphasize a balance of protection and power, making her an indispensable part of any team.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            myStats.shield += Math.floor(myStats.maxhp*0.25);
            notice.push(`\n✨ **${char.name}** began charging Ea`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.def += 100;
            myStats.mr += 100;
            mybuff.def.push(new buffInfo("+", 100, 9999));
            mybuff.mr.push(new buffInfo("+", 100, 9999));
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (myStats.shield > 0) {
                    myStats.atk += Math.floor(myStats.atk*0.15);
                };
            }, 9999));
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.shield += Math.floor(myStats.maxhp*0.1);
            myStats.br += 0.1;
            if (myStats.br > 1) myStats.br = 1;
            myStats.def += 100;
            myStats.mr += 100;
            mybuff.def.push(new buffInfo("+", 100, 9999));
            mybuff.mr.push(new buffInfo("+", 100, 9999));
        },
    },
    "712": {
        usage: 9999,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `0`\\💧, then `10`\\💧 continuously\n**Timeout**: `no`\n**Type**: `DPS`\n\nWhen using his ability, Xiao dons the Yaksha Mask that set gods and demons trembling millennia ago. Until his mana runs dry, he will deal **30%** more magic damage in this state, losing 10 mana each round. If he uses his ability again during this state, he will lunge forward dealing **200%** magic damage by using 50 mana.",
        ability: function(myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            if (matchStats.heap1.length > 0) { // Xiao increases md by 30% by consuming 10 mana per round. Deals 200% damage if used again.
                if (myStats.sm < 50) {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    return matchStats.interaction.channel.send(`You need at least **50**\\💧 for this attack.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                };
                myStats.sm -= 40;
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** lunged forward! He`, {atkMultiplier: 2, magicDamage: true, mdChance: -1});
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
        desc: "**Total Usage**: `1`\n**Mana**: `40`\\💧\n**Timeout**: `yes`\n**Type**: `DPS/Tank`\n\nWith his ability, Albedo increases his ATK by 50% of his current DEF.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Albedo (GI) increases his ATK by 50% of his current DEF
            let inc = Math.floor(myStats.def/2);
            myStats.atk += inc;
            mybuff.atk.push(new buffInfo("+", inc, 9999));
            notice.push(`\n✨ **${char.name}** has increased his **ATK** by half of his **DEF** (**+${inc}**)`);
        },
    },
    "735": {
        usage: 5,
        used: 0,
        cost: 55,
        roundUsed: 0,
        desc: "**Total Usage**: `5`\n**Mana**: `55`\\💧\n**Timeout**: `yes`\n**Type**: `DPS`\n\nEach use of Yoimiya's normal attack will grant her a 'flame'. After collecting three 'flames', her normal attack receives a substantial **22.5%** increase in damage. Additionally, if Yoimiya is wielding a bow as her primary weapon, her normal attacks will apply a burn effect dealing **12.5%** true damage for 2 rounds.\n\nHer active ability has her deliver a one-two punch of **50%** physical and magical damage each. The next round after using her active ability, her normal attack will trigger twice.\n\nYoimiya is **not** compatible with other ATK replacing abilities.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Yoimiya
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, {atkMultiplier: 0.5, magicDamage: false});
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, {atkMultiplier: 0.5, magicDamage: true, mdChance: -1});

            matchStats.twinshot = 1;
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round+2, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                matchStats.twinshot = 0;
            }));
        },
        passive: function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            myStats.yoimiyaFlames = 0;
            myStats.yoimiyaLastTwinshot = matchStats.round;
            myStats.replaceButton.atk = {
                run: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    myStats.yoimiyaFlames++;
                    let atkbuff = 1;
                    if (myStats.yoimiyaFlames >= 3) {
                        myStats.yoimiyaFlames = 0;
                        atkbuff = 1.225;
                    };
                    const burn = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, {atkMultiplier: atkbuff, magicDamage: true});
                    if (items[myStats.weapon]?.type === "bow") ebuff.hp.push(new buffInfo("+", -Math.floor(burn*0.125), 2));

                    // Twinshot
                    if (matchStats.twinshot > Math.random() && myStats.yoimiyaLastTwinshot !== matchStats.round) {
                        myStats.yoimiyaLastTwinshot = matchStats.round;
                        myStats.replaceButton.atk.run(myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list)
                    };
                },
            };
        },
    },
    "767": {
        usage: 1,
        used: 0,
        cost: 100,
        desc: "**Total Usage**: `1`\n**Mana**: `100`\\💧\n**Timeout**: `yes`\n**Type**: `Support`\n\nHaving invested all her skill points in this one Explosion magic, her attack is not to be underestimated. Those caught in its path will feel the full force of Megumin's might, as she unleashes the ultimate attack of destruction dealing **300%** guaranteed magic damage. This takes all her energy though, and she becomes useless for the next 2 rounds as her damage and defense plummet to 0.\n\nIf she's in a party with her 'reliable' companions - **Aqua**, **Darkness** or **Kazuma Satou** - Megumin will get a shield equal to **10%** of her max HP after using her magic.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Megumin unleashes an attack with 300% magic damage. This can't be dodged. ATK, MATK, DEF and MDEF fall to 0 for 2 rounds
            embed.setThumbnail("https://i.ibb.co/9wktf9S/c.gif");
            embed.setImage(`https://i.imgur.com/80tH5Uz.gif`);
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ Bakuretsu! Bakuhatsu! **EXPLOSION!!!** She`, {atkMultiplier: 3, magicDamage: true, mdChance: -1, dodge: false});
            mybuff.atk.push(new buffInfo("=", 0, 2));
            mybuff.def.push(new buffInfo("=", 0, 2));
            mybuff.md.push(new buffInfo("=", 0, 2));
            mybuff.mr.push(new buffInfo("=", 0, 2));
            myStats.atk = 0, myStats.def = 0, myStats.md = 0, myStats.mr = 0;

            if (matchStats.interaction.commandName === "stampede") {
                const names = list[0].map((e) => e.name);
                if (names.includes("Aqua") || names.includes("Darkness") || names.includes("Kazuma Satou")) {
                    myStats.shield += Math.floor(myStats.maxhp*0.1);
                };
            };

            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round+2, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                embed.setImage(eStats.image);
            }));
        },
    },
    "768": {
        usage: 0,
        used: 0,
        cost: 100,
        desc: "**Total Usage**: `0`\n**Type**: `Useless/Support`\n\nAqua isn't as ineffective as her reputation might suggest. Despite her shortcomings in combat, Aqua's support capabilities are nothing short of divine. When in the company of her party members - **Megumin**, **Darkness**, or **Kazuma Satou** - Aqua's divinity shines through, allowing her to cast a protective barrier on her party equal to **5%** of their max HP. Moreover, her divine abilities extend to miraculous healing and resurrection. She heals her party for **5%** of their max health every round, ensuring their longevity in the battle. In dire circumstances, Aqua can even resurrect fallen them, but this divine intervention can only occur once per battle.\n\nHowever, her normal attacks are ironically transmuted into a completely harmless splash, making it virtually impossible for her to deal damage in combat, reinforcing her infamous title.",
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.interaction.commandName === "stampede") {
                myStats.replaceButton.atk = {
                    "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `💦 **${char.name}** used splash! She`, {atkMultiplier: 0, magicDamage: false});
                    },
                };
            };
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (["Megumin", "Darkness", "Kazuma Satou"].includes(myStats.name)) {
                myStats.shield += Math.floor(myStats.maxhp*0.05);
                mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp*0.05), 9999));
                myStats.rev = 1;
                myStats.revhp = 0.4;
                myStats.maxRevivals = 1;
            };
        },
    },
    "769": {
        usage: 0,
        used: 0,
        cost: 100,
        desc: "**Total Usage**: `0`\n**Type**: `Tank`\n\nDarkness, a crusader with an unusual love for danger, proves herself as a robust defensive bulwark on the battlefield. Her distinct passion for frontline combat serves as a vital asset to her team's survival, reducing any damage she receives by a staggering **25%**. This is due to her high defenses against both physical and magic damage, effectively making her a veritable shield against enemy onslaughts.\n\nWhen teamed up with her unconventional comrades - **Megumin**, **Aqua**, or **Kazuma Satou**, Darkness willingly throws herself into the path of danger, using her own body as a shield to protect her allies, further lessening any damage her party members receive by **15%**. Darkness' self-sacrificing defense strategy, although peculiar, undeniably strengthens her party's resilience, making them that much tougher to bring down.",
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.def += 274; // Takes 25% less damage
            myStats.mr += 274;
            mybuff.def.push(new buffInfo("+", 274, 9999));
            mybuff.mr.push(new buffInfo("+", 274, 9999));
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (["Megumin", "Aqua", "Kazuma Satou"].includes(myStats.name)) {
                myStats.def += 155; // Takes 15% less damage
                myStats.mr += 155;
                mybuff.def.push(new buffInfo("+", 155, 9999));
                mybuff.mr.push(new buffInfo("+", 155, 9999));
            };
        },
    },
    "770": {
        usage: 0,
        used: 0,
        cost: 100,
        desc: "**Total Usage**: `0`\n**Type**: `Support`\n\nKazuma Satou may seem like an ordinary character, but his abilities are anything but. His ability is a reflection of his sly wit and cunning mind. His high luck in battle renders his enemies unable to dodge his attacks.\n\nHowever, it's in his party's synergy that Kazuma's true potential is unveiled. If he finds himself fighting alongside his \"reliable\" companions - **Megumin**, **Aqua**, or **Darkness** - their chaotic synergy initiates an additional effect. Kazuma cleverly exploits his opponents' confusion, decreasing their dodge and block rates by **20%**. This disorientation further boosts his team's offense, making their attacks more likely to hit and causing a significant dent in their enemies' defenses. This collaborative effect not only showcases the eccentric harmony of Kazuma and his party but also makes them a force to be reckoned with on the battlefield.",
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.dodge = 0;
            ebuff.dodge.push(new buffInfo("=", 0, 9999));
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (["Megumin", "Aqua", "Darkness"].includes(myStats.name)) {
                eStats.dodge -= 0.2
                if (eStats.dodge < 0) eStats.dodge = 0;
                ebuff.dodge.push(new buffInfo("+", -0.2, 9999));
                eStats.br -= 0.2
                if (eStats.br < 0) eStats.br = 0;
                ebuff.br.push(new buffInfo("+", -0.2, 9999));
                notice.push(`\n✨ Kazuma lowered enemy dodge & block rate by **20%**!`);
            };
        },
    },
    "1001": {
        usage: 9999,
        used: 0,
        pause: 0,
        cost: 60,
        desc: "**Total Usage**: `unlimited` (with a 6 round cooldown)\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n**Type**: `DPS`\n\nRoronoa Zoro, a master of swordsmanship, is best known for his unique \"Three Sword Style\". After using his ability, Zoro will draw and attack with all 3 of his swords on normal attacks. He can hold this form for at most 3 rounds, but there's also a 15% chance of missing an attack, which leads him to put away his swords as well.\n\nAfter using his ability, Zoro needs to rest 6 rounds before he can use it again.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
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
        desc: "**Total Usage**: `1`\n**Mana**: `20`\\💧\n**Timeout**: `no`\n**Type**: `DPS`\n\nRyuuko Matoi sacrifices 30% of her current HP for an ATK increase of 60% of those lost HP",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
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
        desc: "**Total Usage**: `1`\n**Mana**: `50`\\💧\n**Timeout**: `yes`\n**Type**: `Tank/DPS`\n\nBy equipping her unique armor Hermes Trismegistus, Albedo increases her DEF by **50%** and gains a **25%** ATK increase of her current DEF.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Albedo permanently increases DEF by 50% and ATK by 25% of current DEF
            const raiseDef = Math.floor(myStats.def/2);
            const raiseAtk = Math.floor(myStats.def/4);
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
        desc: "**Total Usage**: `5`\n**Mana**: `45`\\💧\n**Timeout**: `yes`\n**Type**: `Support`\n\nAs a Vampire, Shalltear Bloodfallen can drain HP from her opponent to add it to herself. With every use of her ability, she will drain the equivalent of **20%** of her HP.\n\nDuring stampedes, Shalltear can aid her comrades by draining **8%** of the players hp from the enemy every 4 rounds.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Shalltear drains the equivalent of 20% of her max HP from the enemy and adds it to herself.
            const drain = Math.floor(myStats.maxhp*0.2);
            eStats.hp -= drain;
            myStats.hp += drain;
            if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
            if (eStats.hp < 0) eStats.hp = 0;
            notice.push(`\n✨ **${char.name}** has drained **${drain}**HP from **${enemy.name}**`);
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round % 4 === 0) {
                    const drain = Math.floor(myStats.maxhp*0.08);
                    eStats.hp -= drain;
                    myStats.hp += drain;
                    if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
                    if (eStats.hp < 0) eStats.hp = 0;
                    notice.push(`\n✨ **${name}** drained **${drain}**HP from **${enemy.name}**`);
                };
            }, 9999));
        },
    },
    "2360": {
        usage: 3,
        used: 0,
        cost: 35,
        desc: "**Total Usage**: `3`\n**Mana**: `35`\\💧\n**Timeout**: `yes`\n**Type**: `Support`\n\nHer ability, the Code of Immortality grants C.C. with the burden of immortality. With every use of her ability, she gains an additional 14% of chance of revival for a total of 42% at most. If revived, C.C. will have 30%, 35% or 40% of HP depending on how often she used her ability. She can revive herself for a maximum of 3 times in a single match.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // C.C. gains +14% chance of revival with 30/35/40% of max HP
            myStats.rev += 0.14;
            if (this.used === 1) myStats.revhp = 0.3, mybuff.revhp.push(new buffInfo("=", 0.3, 9999));
            else myStats.revhp += 0.05, mybuff.revhp.push(new buffInfo("+", 0.05, 9999));
            notice.push(`\n✨ **${char.name}** used her Code of Immortality for a **${Math.min(Math.round(myStats.rev*100), 100)}**% chance of revival with **${100*myStats.revhp}**% HP!`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.maxRevivals += 3;
        },
    },
    "2814": {
        usage: 1,
        used: 0,
        cost: 10,
        desc: "**Total Usage**: `1`\n**Mana**: `10`\\💧\n**Timeout**: `yes`\n**Type**: `Support`\n\nWhen pushed to the brink of death, Tanya Degurechaff can self destruct as a last resort to take out her opponent. This requires her HP to be below 15% of her max HP and will deal 300% guaranteed damage. Tanya's HP will fall to 1 as well.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
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
    "3109": {
        usage: 1,
        used: 0,
        cost: 100,
        desc: "**Total Usage**: `1`\n**Mana**: `100`\\💧\n**Timeout**: `no`\n**Type**: `Tank/Support`\n\nMaple's active ability is a single use, high-cost maneuver that converts **75%** of her DEF and MR into ATK and MD respectively for **3** rounds. This move allows her to switch from a defensive role to a potent damage dealer. At the end of these **3** rounds, Maple recovers **20%** of her missing health.\n\nBecause of her bulky armor, Maple can't dodge any attacks but has an additional **+300** DEF and MR, making her more resilient against all kinds of attacks.\n\nIn a party, Maple boosts her party members resilience, effectively reducing the damage they take by **15%**.\n\n_15% damage reduction = 155 DEF|MR_",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            const incd = Math.floor(myStats.def*0.75);
            mybuff.atk.push(new buffInfo("+", incd, 3));
            myStats.atk += incd;
            mybuff.def.push(new buffInfo("+", -incd, 3));
            myStats.def -= incd;
            const incmr = Math.floor(myStats.mr*0.75);
            mybuff.md.push(new buffInfo("+", incmr, 3));
            myStats.md += incmr;
            mybuff.def.push(new buffInfo("+", -incmr, 3));
            myStats.mr -= incmr;
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round+3, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.hp += Math.floor((myStats.maxhp - myStats.hp)*0.2);
            }));
            
            notice.push(`\n✨ **${char.name}** turned **75%** of her DEF and MR into ATK and MD respectively`)// Bitte besser schreiben
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.dodge = 0;
            }, 9999));
            mybuff.def.push(new buffInfo("+", 300, 9999));
            mybuff.mr.push(new buffInfo("+", 300, 9999));
            myStats.def += 300;
            myStats.mr += 300;
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.round <= 10) {
                myStats.def += 155; // Takes 15% less damage
                myStats.mr += 155;
                mybuff.def.push(new buffInfo("+", 155, 9999));
                mybuff.mr.push(new buffInfo("+", 155, 9999));
            }
        },
    },
    "3150": {
        usage: 9999,
        used: 0,
        cost: 60,
        summoned: [],
        desc: "**Total Usage**: `max 3`\n**Mana**: `60`\\💧\n**Timeout**: `no`\n**Type**: `DPS`\n\nThanks to his ability to level up by fighting monsters, Sung Jin-Woo raises his level by 1 after every round for the duration of the fight. As the Shadow Monarch, he can summon one of his 3 loyal servants **Igris**, **Beru** or **Iron (SL)**. The user needs to have them in their inventory, and they take on their own stats (except ATK and MD, which is **60%** of Sung Jin Woo's ATK|MD). Once they're defeated, Sung Jin-Woo can no longer summon them.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Active: Sung Jin Woo summons either Igris, Beru or Iron (SL) from the users inventory. Passive:
            let inv = await query(`SELECT characters.chars, characters.ref, characters.level, characters.equipment, dungeon.classlevels FROM characters JOIN dungeon ON characters.id = dungeon.id WHERE characters.id = ${matchStats.interaction.user.id}`);
            inv = {id: matchStats.interaction.user.id, class: myStats.class, chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref), level: JSON.parse(inv[0].level), equipment: JSON.parse(inv[0].equipment), classlevels: JSON.parse(inv[0].classlevels)};

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
            ["hp", "maxhp", "def", "mr", "cr", "cd", "td", "br", "dodge"].forEach((e) => {
                myStats[e] = newStats[e];
            });

            myStats.atk = Math.floor(myStats.atk*0.6);
            myStats.md = Math.floor(myStats.md*0.6);
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
    "4250": {
        usage: 9999,
        used: 0,
        cost: 80,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `80`\\💧\n**Timeout**: `yes`\n**Type**: `DPS`\n\nWhen fighting an enemy, Guts channels his relentless fury in every strike, increasing his ATK by **20%**. However, his reckless and aggressive fighting style causes him to lose **5%** of his max HP every round, due to the wear and tear on his body from the intense battle.\nWhen Guts endures the relentless onslaught of his enemies, he gathers a portion of the pain and anguish they inflict upon him. He absorbs and stares damage taken (DoT excluded). When Guts uses his ability, he expends all stored up damage and releases a devastating strike dealing twice as much damage as he took, up to a maximum of **300%** of his base attack damage. This powerful attack serves as a testament to Guts' sheer resilience and indomitable spirit.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Active: Guts Absorbs damage taken and releases it x2 (max 300% ATK). DoT is excluded
            if ((myStats.damageTaken*2) > 3 * myStats.atk) myStats.damageTaken = 3 * myStats.atk;
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, {atkMultiplier: (myStats.damageTaken*2)/myStats.atk, magicDamage: false});
            myStats.damageTaken = 0;
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Starts with decreased Stats
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk*0.2), 9999));
            mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp*0.05), 9999));
        },
    },
    "4767": {
        usage: 0,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `0`\n**Timeout**: `no`\n**Type**: `DPS`\n\nDespite living in a world of magic and sorcery, Asta cannot use magic at all. Neverthless he keeps fighting without any abilities, relying purely on his physical strength. Then not all hope is yet lost for him. With his special Anti Magic grimoire he can block his enemies from using their abilities as well, overcoming their difference in battle strength. Not only that, but Asta benefits from having a **20%** increased attack stat for the duration of the whole fight.",
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Starts with decreased Stats
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk*0.2), 9999));
            myStats.atk += Math.floor(myStats.atk*0.2);
        },
    },
    "4942": {
        usage: 1,
        used: 0,
        cost: 80,
        desc: "**Total Usage**: `max 1`\n**Mana**: `80`\\💧\n**Timeout**: `yes`\n**Type**: `DPS`\n\nCid Kagenou tries his best to blend into the background and become a mob character. His attack and magic damage are decreased by **20%** for that during this phase, as well as his dodge chance and block rate which are nonexistent. However, when his HP falls below **50%** he will unveil his true identity as Shadow and increase his attack & magic damage by **25%**, defense & magic resist by **10%**, dodge chance & block rate by **+10%** and heal himself for **30%** of missing HP. Using his active, Shadow will use his almighty power and deal **200%** damage which can't be dodged nor blocked.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Active: Cid Kagenou deals 250% damage. Passive: Enters his shadow form when HP falls below 50%
            notice.push(`\n<:atomic:1076326318565765150> _**I... AM... ATOMIC**_`);
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, {atkMultiplier: 2, magicDamage: true, dodge: false, block: false});
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
                    myStats.atk += Math.floor(myStats.atk*0.25);
                    myStats.md += Math.floor(myStats.md*0.25);
                    mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk*0.25), 9999));
                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.md*0.25), 9999));
                    myStats.def += Math.floor(myStats.def*0.1);
                    myStats.mr += Math.floor(myStats.mr*0.1);
                    mybuff.def.push(new buffInfo("+", Math.floor(myStats.def*0.1), 9999));
                    mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr*0.1), 9999));
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
    //     ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
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
        usage: 5,
        used: 0,
        cost: 50,
        desc: "**Total Usage**: `5`\n**Mana**: `50`\\💧\n**Timeout**: `yes`\n**Type**: `DPS`\n\nYue gains Magic Resistance and Health proportional to her ATK (20%, 30% respectively) which she keeps till the end of the match. Additionally, Yue heals herself for 10% of all damage dealt as a passive.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            matchStats.turn = matchStats.turnSkill ? 0 : 1; // Yue
            let hmr = Math.floor(myStats.atk*0.2);
            mybuff.mr.push(new buffInfo("+", hmr, 9999));
            myStats.mr += hmr;
            let hHp = Math.floor(myStats.atk*0.3);
            myStats.hp += hHp;
            if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
            notice.push(`\n✨ **${char.name}** recovered **${hHp}** HP. Gained **${hmr}** Magic Resist`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.selfhealChance = 1;
            matchStats.selfheal += 0.1;
        },
    },
    "6029": {
        usage: 0,
        used: 0,
        cost: 100,
        desc: "**Total Usage**: `0`\n**Type**: `Support`\n\nVladilena Milizé's ability is a Tactical Skill that brings the full force of mechanized artillery to aid her comrades during stampedes. This skill has a strategic nature that embodies her character as a commander. Each round it has a **25%** chance of triggering a devastating artillery bombardment on the enemy ranks, dealing **80%** damage.",
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            if (Math.random() < 0.25) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, {atkMultiplier: 0.8, ignoreShield: true, magicDamage: true});
            };
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.25) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, {atkMultiplier: 0.8, ignoreShield: true, magicDamage: true});
                };
            }, 9999));
        },
    },
    "8189": {
        usage: 9999,
        used: 0,
        cost: 0,
        armor: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `0`\\💧, then `15`\\💧 continuously\n**Timeout**: `no`\n**Type**: `DPS`\n\nWith her Re-Equip magic, Erza Scarlet is able to select between 5 different armors to face her opponent as needed. With every use of her ability, she will cycle through her armors, and she'll use up 15 mana every round. She will not gain any mana while she has an armor equipped. Her inventory is as follows:\n\n__Fire Empress Armor__: Grants her **60%** ATK but decreases DEF by **20%**\n__Adamantine Armor__: Grants her **60%** DEF but decreases ATK by **20%**\n__Heaven's Wheel Armor__: Grants her **25%** ATK and DEF\n__Clear Heart Clothing__: Grants her **10%** ATK, **+20%** crit rate, **+50%** crit damage and **+10%** dodge chance\n__Armadura Fairy__: Heals her for **10%** of max HP per round",
        ability: function(myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
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
        cost: 60,
        desc: "**Total Usage**: `3`\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n**Type**: `DPS`\n\nKiyotaka Ayanokouji seems like an ordinary student from the outside, leading his enemies to underestimate him and letting their guards down, decreasing defense by **20%** and block rate as well as dodge chance by **30%**. While he'll go easy on most challenges coming his way, seemingly with no ambitions whatsoever, Ayanokouji will do anything it takes to win. Step by step, Ayanokouji increases his attack by **15%**, **25%** and **33%** permanently and increases his dodge chance by **5%** each time. Because winning is everything in this world. As long as he wins in the end... that's all that matters.",
        ability: function(myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Kiyotaka Ayanokouji increases his attack by 15/25/33% and gains +5% dodge chance
            switch (this.used) {
                case 1: embed.setThumbnail("https://i.ibb.co/y8MDgRD/g.gif"); mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk*0.15), 9999)); myStats.atk = Math.floor(myStats.atk*1.15); myStats.dodge += 0.05; mybuff.dodge.push(new buffInfo("+", 0.05, 9999)); notice.push(`\n✨ **${char.name}** decides to get slightly serious. Increased ATK by **15%** and dodge by **+5%**`); break;
                case 2: mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk*0.1), 9999)); myStats.atk = Math.floor(myStats.atk*1.1); myStats.dodge += 0.05; mybuff.dodge.push(new buffInfo("+", 0.05, 9999)); notice.push(`\n✨ **${char.name}** gets a little more serious. Increased ATK by **25%** and dodge by **+5%**`); break;
                case 3: mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk*0.08), 9999)); myStats.atk = Math.floor(myStats.atk*1.08); myStats.dodge += 0.05; mybuff.dodge.push(new buffInfo("+", 0.05, 9999)); notice.push(`\n✨ **${char.name}** goes all out. Increased ATK by **33%** and dodge by **+5%**`); break;
                default: false; break;
            };
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.def *= 0.8;
            eStats.br *= 0.7;
            eStats.dodge *= 0.7;
            ebuff.def.push(new buffInfo("*", 0.8, 9999));
            ebuff.br.push(new buffInfo("*", 0.7, 9999));
            ebuff.dodge.push(new buffInfo("*", 0.7, 9999));
        },
    },
    "8890": {
        usage: 9999,
        used: 0,
        cost: 40,
        roundUsed: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `40`\\💧\n**Timeout**: `no`\n**Type**: `DPS`\n\nBeing one of the strongest psychic heroes, Tatsumaki's attacks always deal magic damage. She has **20%** increased magic damage throughout the battle, and decreases her enemy's magic resistance by **30%** when using her ability, making them more vulnerable towards her attacks.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Tatsumaki decreases enemy magic resistance
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (matchStats.round === this.roundUsed) {
                myStats.sm += this.cost;
                return matchStats.interaction.channel.send("You can't stack Tatsumaki's ability").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            };
            eStats.mr = Math.floor(eStats.mr * 0.7);
            ebuff.mr.push(new buffInfo("*", 0.7, 3));
            this.roundUsed = matchStats.round;
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
        pause: 0,
        usedFinal: false,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `25, 50, 75, and 100+`\\💧 depending on how much you have\n**Timeout**: `yes`\n**Type**: `DPS`\n\nIchigo's ability is split into 4 different parts, and depending on his current mana his ability will have differing effects. If his mana is between 25-49\\💧, Ichigo deals an attack dealing **120%** damage, which can be both physical or magic damage depending on his other stats. If he has 50-74\\💧 he increases his ATK and MD by **30%** and his DEF by **10%** for 4 rounds. If it is between 75-99\\💧 he will double his ATK and MD but decrease DEF by **20%** for 3 rounds. Above this, his entire mana will be converted into ATK and MD (1\\💧 = 1% boost, up to 150%) and reduce enemy block rate to **0%** for 3 rounds. However, after using his Final Getsuga Tensho Ichigo needs to rest for 5 rounds, during which he can't use his ability.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Ichigo's ability comes in these 4 stages:
            if (this.pause > matchStats.round) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                this.used--;
                myStats.sm += 25;
                return matchStats.interaction.channel.send(`Ichigo Kurosaki needs to rest ${this.pause-matchStats.round} more ${this.pause-matchStats.round === 1 ? "round" : "rounds"}`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            };

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
                // if (this.usedFinal) {
                //     myStats.sm += 25;
                //     return matchStats.interaction.channel.send("Final Getsuga Tensho can only be used once").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                // };
                // this.usedFinal = true;
                this.pause = matchStats.round+5;
                eStats.br = 0;
                ebuff.br.push(new buffInfo("=", 0, 3));
                const boost = Math.min(myStats.sm*0.01, 1.5);
                myStats.atk += Math.floor(myStats.atk*boost);
                myStats.md += Math.floor(myStats.md*boost);
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk*boost), 3));
                mybuff.md.push(new buffInfo("+", Math.floor(myStats.md*boost), 3));
                myStats.sm -= Math.min(myStats.sm-25, 125);
                notice.push(`\n✨ **${char.name}** used his Final Getsuga Tensho! Increased ATK and MD by **${Math.floor(boost*100)}%** and reduced enemy block rate to **0%** for 4 rounds.`);
            };
        },
    },
    "9606": {
        usage: 9999,
        used: 0,
        cost: 55,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `55`\\💧\n**Timeout**: `no`\n**Type**: `Support`\n\nAs agile as she is, Meme truly is difficult to catch. She has **10**% increased dodge chances at all times, and through the use of her ability she can increase it by up to **30%** for 3 rounds (max 50%).",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Meme increases her dodge chance by 30% (max 50%) and has +10% passively
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            let increase_eva = myStats.dodge < 0.2 ? 0.3 : (0.5 - myStats.dodge);
            if (increase_eva < 0) increase_eva = 0;
            myStats.dodge += increase_eva;
            mybuff.dodge.push(new buffInfo("+", increase_eva, 3));
            notice.push(`\n✨ **${char.name}** increased her dodge chance to **${(myStats.dodge+increase_eva)*100}%** for 3 rounds!`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.dodge += 0.1;
            mybuff.dodge.push(new buffInfo("+", 0.1, 9999));
        },
    },
    "9648": {
        usage: 0,
        used: 0,
        cost: 100,
        desc: "**Total Usage**: `0`\n**Type**: `DPS`\n\nYuno Gasai's ability lays waste to all who stand against her, sparing only her beloved Yukiteru Amano. She will eliminate all other party members if anyone tries to steal her spotlight in stampedes, leaving only Yukkii and herself standing. Her attack and magic damage stats increase to **200%** and she gains **+30%** crit rate during stampedes.",
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.interaction.commandName === "stampede") {
                myStats.atk *= 2;
                myStats.md *= 2;
                mybuff.atk.push(new buffInfo("*", 2, 9999));
                mybuff.md.push(new buffInfo("*", 2, 9999));
                myStats.cr += 0.3;
                if (myStats.cr > 1) myStats.cr = 1;
                mybuff.cr.push(new buffInfo("+", 0.3, 9999));
            };
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.name !== "Yukiteru Amano") {
                myStats.hp = 0;
                myStats.rev = 0;
                notice.push(`\n✨ Now you're mine, forever..`);
            };
        },
    },
    "10517": {
        usage: 9999,
        used: 0,
        cost: 70,
        roundUsed: -5,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `70`\\💧\n**Timeout**: `no`\n**Type**: `Support/DPS`\n\nLuminous brings a unique blend of healing and damage to the battlefield. Her abilities not only bolster her offensive capabilities but also provide a reliable source of health recovery for herself and her allies.\n\nShe steadily recovers **3%** of her missing health every round. This consistent restoration ensures that she's able to stay in the fight for an extended period.\n\nWhen her active ability is used, Luminous enters a heightened state for **3 rounds**, increasing her magic damage by **25%** and doubling her passive from 3% to **6%**, and during this state she deals magic damage to her opponents. However, it's important to note that this ability can't be stacked, meaning it can't be used again while the effect is still active.\n\nWhen part of a party, Luminous offers her blessings to her friends as well. She increases the party's magic damage by **16%** and ensures they stay in the fight by healing them for **5%** of their missing health every round.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Luminous increases her magic damage for 3 rounds
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (matchStats.round < this.roundUsed+3) {
                myStats.sm += this.cost;
                return matchStats.interaction.channel.send("You can't stack Luminous' ability").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            };

            myStats.mdChance += 1;
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md*0.25), 2));
            myStats.md += Math.floor(myStats.md*0.25);

            myStats.hp += Math.floor((myStats.maxhp - myStats.hp)*0.1);
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.hp += Math.floor((myStats.maxhp - myStats.hp)*0.03);
            }, 2));

            // Change image after 3 rounds
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round+3, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.mdChance -= 1;
                embed.setThumbnail(myStatsFixed.thumbnail || char.image);
            }));

            embed.setThumbnail("https://i.ibb.co/NKnp3KM/luminous.png");
            notice.push(`\n✨ **${char.name}** increased her MD by **25%** for 3 rounds!`);
            this.roundUsed = matchStats.round;
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.hp += Math.floor((myStats.maxhp - myStats.hp)*0.03);
            }, 9999));
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md*0.16), 9999));
            myStats.md += Math.floor(myStats.md*0.16);
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.hp += Math.floor((myStats.maxhp - myStats.hp)*0.05);
            }, 9999));
        },
    },
    "10520": {
        usage: 9999,
        used: 0,
        cost: 0,
        roundUsed: 0,
        usedThisRound: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `0`\\💧 on active, `-25`\\💧 on passive\n**HP**: `5%`<:HP:1062043800979116143>\n**Timeout**: `no`\n**Type**: `DPS`\n\nVictoria, an accomplished knight and a decorated war hero, has become a formidable force on the battlefield through her countless skirmishes. Her vast experience and relentless determination have honed her skills, allowing her to stand toe to toe with dragons, with her prowess mirroring their ferocity and prestige.\n\nIn an ongoing testament to her thirst for knowledge and self-improvement, Victoria gains **+25%** class xp, and her countless encounters with dragons have sharpened her combat abilities against them, resulting in a **20%** increase in ATK when facing dragons.\n\nVictoria's resilience in combat is further enhanced by her ability to use mana to heal herself. When enough mana is available, Victoria will consume **25**\\💧 to regenerate **6%** of max HP, showcasing her ability to adapt and endure even in the direst of situations.\n\nVictoria can also tap into the raw energy of life itself, making the ultimate sacrifice for the promise of power. She can willingly sacrifice **5%** of her HP to gain a **25%** ATK boost for that round. This effect can be stacked up to **3 times** at once, embodying Victoria's willingness to risk everything for overwhelming power, mirroring the very dragons she battles in ferocity and resilience.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Victoria gains 20% more class xp. Has 20% increased ATK if she fights against a dragon.
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (matchStats.round === this.roundUsed) {
                this.usedThisRound++
                if (this.usedThisRound >= 3) {
                    myStats.sm += this.cost;
                    return matchStats.interaction.channel.send("You can stack Victorias's ability up to 3 times max.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                };
            } else {
                this.usedThisRound = 0;
            };

            // Consume HP & ATK Buff
            const sacrifice = Math.floor(myStats.maxhp*0.05);
            myStats.hp -= sacrifice;
            if (myStats.hp < 0) myStats.hp = 0;
            const atkbuff = Math.floor(myStatsFixed.atk*0.25);
            myStats.atk += atkbuff;

            this.roundUsed = matchStats.round;
            notice.push(`\n✨ **${char.name}** sacrificed **${sacrifice}** HP for **${atkbuff}** ATK!`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.xpboost += 0.25;
            if (["Dragon", "True Dragon", "Death Dragon", "Sky Dragon"].includes(enemy.species)) {
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk*0.2), 9999));
                myStats.atk += Math.floor(myStats.atk*0.2);
            };
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (myStats.sm > 25) {
                    myStats.sm -= 25;
                    myStats.hp -= Math.floor(myStats.maxhp*0.06);
                    if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
                };
            }, 9999));
        },
    },
    "10524": {
        usage: 9999,
        used: 0,
        cost: 30,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `30`\\💧\n**Timeout**: `yes`\n**Type**: `Support`\n\nRosalia is a character with an interesting balance of manipulation and damage abilities. Her passive ability inflicts a bleeding effect on the enemy, causing them to lose an amount equal to **5%** of Rosalia's max HP every round. Additionally, Rosalia drains **3** mana from the enemy every round, increasing her own mana pool and allowing her to use her abilities more frequently. Moreover, Rosalia gains a **20%** boost on class xp.\n\nRosalia doesn't simply use her own mana alone when activating her ability, instead she consumes **20** mana from the enemy as well to deal **125%** magic damage. If her attack hits the target, there's a **50%** chance of doubling the bleeding effect on her enemy for 2 rounds.\n\nIn a party, Rosalia extends her mana draining ability to aid her allies, draining **3** mana from the enemy every round.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Rosalia
            if (eStats.sm < 20) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                myStats.sm += 30;
                return matchStats.interaction.channel.send("Your enemy needs **20**💧 to activate").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            };
            eStats.sm -= 20;
            let dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, {atkMultiplier: 1.25, magicDamage: true, mdChance: -1});
            if (dmg && Math.random() < 0.5) ebuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp*0.05), 2));
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.xpboost += 0.2;
            ebuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp*0.05), 9999));
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (eStats.sm >= 3) {
                    eStats.sm -= 3;
                    myStats.sm += 3;
                    if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
                };
            }, 9999));
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (eStats.sm >= 3) {
                eStats.sm -= 3;
                myStats.sm += 3;
                if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
            };
        },
    },
    "12121": {
        usage: 9999,
        used: 0,
        cost: 50,
        roundUsed: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `50`\\💧\n**Timeout**: `no`\n**Type**: `Support/DPS`\n\nAll Might's ability One For All is a Quirk that allows the user to temporarily increase their strength and speed to superhuman levels. When activated, One For All doubles the user's ATK and reduces enemy DEF by half, making them more vulnerable to his attacks. This allows the user to deliver powerful blows and take down their enemies with ease. However, the Quirk does come with a drawback, as it can put a strain on the user's body, potentially causing injury, damaging himself for 5% of his current HP (10% chance of failure). As such, it should be used carefully.\n\nStanding firm and leading the way for his party members as the symbol of peace and beacon of hope, All Might increases all party member's attacks by **20%**.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
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
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk*0.2), 9999));
            myStats.atk += Math.floor(myStats.atk*0.2);
        },
    },
    "12393": {
        usage: 9,
        used: 0,
        cost: 0,
        roundUsed: 0,
        usedThisRound: 0,
        desc: "**Total Usage**: `9`\n**Cost**: `60`\\💧, then `250`<:coins:872926669055356939>\n**Timeout**: `no`\n**Type**: `Support/Farming`\n\nlity is multi-layered and can be used up to three times per round. On the first use, it amplifies her ATK by up to **50%** at the cost of **60**\\💧, providing a significant boost to her offensive capabilities. For the second and third uses, it further increases her attack up to an additional **+25%** and adds a shield equal to **5%** of her max HP at the expense of **250**<:coins:872926669055356939>. These ATK buffs scale with the amount of coins the user has in their balance up to **100'000**<:coins:872926669055356939>\n\nAdditionally, Eliza's passive ability allows her to gain **20%** more coins from dungeons, providing her with more resources to utilize her active ability more frequently and sustainably.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            matchStats.turn = matchStats.turnSkill ? 0 : 1; // Eliza
            this.used--;

            const { 0: stats } = await query(`SELECT coins FROM users WHERE id = ${matchStats.interaction.user.id}`);
            stats.coins = Math.min(stats.coins, 100000);

            if (matchStats.round === this.roundUsed) {
                if (++this.usedThisRound >= 3) return matchStats.interaction.channel.send("You can stack **Eliza**'s ability up to **3** times max.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            } else this.usedThisRound = 0;

            let atkbuff;
            switch (this.usedThisRound) {
                case 0: if (myStats.sm < 60) return matchStats.interaction.channel.send(`You don't have enough mana (**${myStats.sm}**/60).`).then((msg) => setTimeout(() => msg.delete(),deleteReplyIn)).catch((err) => console.log(err));
                        myStats.sm -= 60;
                        atkbuff = Math.floor(myStats.atk*(0.5*(stats.coins/100000)));
                        myStats.atk += atkbuff;
                        notice.push(`\n✨ **${char.name}** gains **${atkbuff}** ATK`); break;
                case 1: if (stats.coins < 250) return matchStats.interaction.channel.send("You don't have enough coins to activate **Eliza**'s ability.").then((msg) => setTimeout(() => msg.delete(),deleteReplyIn)).catch((err) => console.log(err));
                        atkbuff = Math.floor(myStats.atk*(0.25*(stats.coins/100000)));
                        myStats.atk += atkbuff;
                        myStats.shield += Math.floor(myStats.maxhp*0.05);
                        notice.push(`\n✨ **${char.name}** uses 250<:coins:872926669055356939> to gain **${atkbuff}** ATK and **${Math.floor(myStats.maxhp*0.05)}** Shield`);
                        await query(`UPDATE users SET coins = coins - 250 WHERE id = ${matchStats.interaction.user.id}`); break;
                case 2: if (stats.coins < 250) return matchStats.interaction.channel.send("You don't have enough coins to activate **Eliza**'s ability.").then((msg) => setTimeout(() => msg.delete(),deleteReplyIn)).catch((err) => console.log(err));
                        atkbuff = Math.floor(myStats.atk*(0.25*(stats.coins/100000)));
                        myStats.atk += atkbuff;
                        myStats.shield += Math.floor(myStats.maxhp*0.05);
                        notice.push(`\n✨ **${char.name}** uses 250<:coins:872926669055356939> to gain **${atkbuff}** ATK and **${Math.floor(myStats.maxhp*0.05)}** Shield`);
                        await query(`UPDATE users SET coins = coins - 250 WHERE id = ${matchStats.interaction.user.id}`); break;
                default: false; break;
            };

            this.used++;
            this.roundUsed = matchStats.round;
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.lootm += 0.2;
        },
    },
    "12394": {
        usage: 9999,
        used: 0,
        cost: 30,
        roundUsed: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `30`\\💧\n**Timeout**: `no`\n**Type**: `DPS`\n\nAneira, wielding her ancient frost magic, has an ability that leaves her enemies frozen in fear and ice. Once activated, her ability delivers a chilling attack. Starting with **50%** damage, Aneira gains 1 additional icicle every round (up to 7), each adding **+25%** more to her damage.\n\nTrying to block her freezing attacks is futile, but if her opponent can miraculously dodge her frozen fury, the spell simply fizzles out. Should the attack land however, Aneira's enemy gets encased in ice, decreasing their defense by **20%** and rendering them incapable of moving in their next turn.\n\nAdditionally, Aneira gains **+25%** class xp from her battles.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Aneira
            let dmg = (!eStats.dodge && Math.random() < eStats.br) ? notice.push(`\n💨 **${enemy.name}** dodged the attack!`) : dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, {atkMultiplier: 0.5+Math.min(0.25*(matchStats.round-this.roundUsed), 1.75), magicDamage: true, block: false});
            this.roundUsed = matchStats.round;

            if (dmg) { // Don't freeze if dodged
                matchStats.turn = matchStats.turnSkill ? 0 : 1;

                eStats.def = Math.floor(eStats.def*0.8); // Decrease DEF

                const path = "icy-" + eStats.image.split("").filter((e) => !" /:\\*?!<>|".includes(e)).join("").toLowerCase(); // 
    
                // If it doesn't exist, generate it
                if (!fs.existsSync(`./Images/${path}`)) {
                    await generateImage(eStats.image, "https://i.imgur.com/vzFuaNd.png", path);
                };
    
                const { AttachmentBuilder } = require('discord.js');
                const file = new AttachmentBuilder(`./Images/${path}`);
                message.edit({ files: [file] });
                embed.setImage(`attachment://${path}`);
    
                myStats.delayedBuffs.push(new delayedBuffs(matchStats.round+1, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    message.edit({ files: [] });
                    embed.setImage(eStats.image);
                }));
                
                notice.push(`\n✨ **${enemy.name}** was frozen for 1 round!`);
            };
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.xpboost += 0.25;
            // myStats.cr += 0.2;
            // if (myStats.cr > 1) myStats.cr = 1;
            // mybuff.cr.push(new buffInfo("+", 0.2, 9999));
            // mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp*0.03), 9999));
            // myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            //     myStats.atk += Math.floor(myStats.atk * (0.6-(myStats.hp/(2*myStats.maxhp))));
            // }, 9999));
        },
        // party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        //     const name = pStats.name;
        //     myStats.delayedBuffs.push(new delayedBuffs(0, async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        //         if (Math.random() < 0.1) {
        //             matchStats.turn = matchStats.turnSkill ? 0 : 1;

        //             const path = "icy-" + eStats.image.split("").filter((e) => !" /:\\*?!<>|".includes(e)).join("").toLowerCase(); // 
        
        //             // If it doesn't exist, generate it
        //             if (!fs.existsSync(`./Images/${path}`)) {
        //                 await generateImage(eStats.image, "https://i.imgur.com/vzFuaNd.png", path);
        //             };
        
        //             const { AttachmentBuilder } = require('discord.js');
        //             const file = new AttachmentBuilder(`./Images/${path}`);
        //             matchStats.message.edit({ files: [file] });
        //             embed.setImage(`attachment://${path}`);
        
        //             myStats.delayedBuffs.push(new delayedBuffs(matchStats.round+2, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
        //                 matchStats.message.edit({ files: [] });
        //                 embed.setImage(eStats.image);
        //             }));
                    
        //             notice.push(`\n✨ **${name}** froze **${enemy.name}** for 1 round!`);
        //         };
        //     }, 9999));
        // },
    },
    "12450": {
        usage: 3,
        used: 0,
        cost: 0,
        roundUsed: 0,
        usedThisRound: 0,
        desc: "**Total Usage**: `3`\n**Cost**: `0`\\💧, `33%`\\💖\n**Timeout**: `no`\n**Type**: `DPS`\n\nLuminous (alter) presents a high-risk, high-reward playstyle, emphasizing critical hits and self-sacrifice for substantial damage output. Her active ability allows her to sacrifice **33%** of her maximum health to launch a powerful attack dealing **140%** of her normal damage at no mana cost. Hated by the divine, self-heal passives on damage won't work on Luminous (alter).\n\nHer passive ability augments her crit rate by an additional **20%**. In addition, she gains **25%** more class xp, allowing her to level up her class faster. However, this power is difficult to bear and comes with a great cost: she loses **4%** of her max HP every round, and any shield she gains will break down immediately.\n\nWhen in a party, Luminous (alter) can refuse to cooperate, dealing damage to her own party members. I wonder how we can get her to cooperate...",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Luminous Alter
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (matchStats.round === this.roundUsed) {
                if (++this.usedThisRound >= 1) return matchStats.interaction.channel.send("You can use Luminous (alter)'s ability only once per round.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            } else {
                this.usedThisRound = 0;
            };
            this.roundUsed = matchStats.round;

            const sacrifice = Math.ceil(myStats.maxhp*0.33);
            if (myStats.hp <= sacrifice) return matchStats.interaction.channel.send("You don't have enough HP left").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            myStats.hp -= sacrifice;

            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, {atkMultiplier: 1.4, selfheal: false});
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.xpboost += 0.25;
            myStats.shield = 0;
            myStats.cr += 0.2;
            if (myStats.cr > 1) myStats.cr = 1;
            mybuff.cr.push(new buffInfo("+", 0.2, 9999));
            mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp*0.04), 9999));
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.shield = 0;
                myStats.atk += Math.floor(myStats.atk * (0.6-(myStats.hp/(2*myStats.maxhp))));
            }, 9999));
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            if (Math.random() < 0.25) {
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${name}** attacked **${myStats.name}**! She`, {critMultiplier: 1.33});
            };
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.25) {
                    dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${name}** attacked **${myStats.name}**! She`, {critMultiplier: 1.33});
                };
            }, 9999));
        },
    },

};

module.exports.abilities = abilities;