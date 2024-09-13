/* eslint-disable no-unused-vars */
const { AttachmentBuilder } = require("discord.js");
const { getDetailedStats, dealDamage, deleteReplyIn } = require("./functions.js");
const { db, query } = require("../db_handler.js");
const { createCanvas, loadImage } = require('@napi-rs/canvas');
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
        desc: "**Total Usage**: `unlimited`\n**Mana**: `25`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nFushi randomly transforms in one of the following 3 characters from the anime **Fumetsu no Anata e**: Gugu, March or Parona. While in this form, a second use of his ability will transform him back into his original form. To be able to transform into one of these characters, You'll need to have them in your inventory.\nWhen played correctly, Fushi can be a powerful opponent holding 4 distinct characters within himself, each with their own stats.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Fushi transforms randomly in one of 3 characters who each have their own stats.
            let inv = await query(`SELECT users.equipment, users.shield_slot, characters.chars, characters.ref, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${matchStats.interaction.user.id}`);
            inv = { id: matchStats.interaction.user.id, class: myStats.class, level: myStats.lvl, bank: 0, chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref), equipment: JSON.parse(inv[0].equipment), shield_slot: inv[0].shield_slot, classlevels: JSON.parse(inv[0].classlevels) };

            if (!(inv.chars.includes(65) || inv.chars.includes(66) || inv.chars.includes(67))) return matchStats.interaction.channel.send("You don't have any of the characters **Parona**, **Gugu** or **March** to transform into").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));

            if (this.selected === "fushi") {
                let obtained = [];
                if (inv.chars.includes(65)) obtained.push("parona");
                if (inv.chars.includes(66)) obtained.push("gugu");
                if (inv.chars.includes(67)) obtained.push("march");
                let pick = obtained[Math.floor(Math.random() * obtained.length)];
                let pID = { "parona": 65, "gugu": 66, "march": 67 }[pick];

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
        desc: "**Total Usage**: `unlimited`\n**Mana**: `30`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nWith her trusted rifle, Sinon hits every target in the bullseye, dealing critical hits. Against her, trying to dodge is not just futile, but she will deal more damage the more her target tries to dodge, as if she were mocking it (every 1% dodge = +1% dmg). She will abuse every weakness of her opponents, dealing magic or physical damage accordingly.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Sinon ignores dodge chance, deals more damage the more dodge% the enemy has, deals a guaranteed crit, and deals atk/matk depending on enemy weakness
            if (eStats.mr < eStats.def) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.95 + eStats.dodge, magicDamage: true, mdChance: -1, critChance: 0, dodge: false });
            } else {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.95 + eStats.dodge, critChance: 0, dodge: false });
            };
        },
    },
    "238": {
        usage: 3,
        used: 0,
        cost: 20,
        desc: "**Total Usage**: `3`\n**Mana**: `20`\\💧\n**Timeout**: `yes`\n**Role**: `Farming`\n\nUsing his ultimate skill Beelzebub, Rimuru Tempest can end a fight in an instant, devouring his enemy. While enemies with less than half of his own EP will lose immediately, the success rate of Beelzebub will decline with stronger enemies.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Rimuru has a chance of 100%/60%/30%/10%/0% to instantly kill the enemy
            if (matchStats.interaction.commandName === "stampede") {
                matchStats.turn = 0;
                myStats.sm += 20;
                return matchStats.interaction.channel.send(`Rimuru can't be used in this game mode.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            };

            if (myStats.ep / eStats.ep > 2) {
                eStats.hp = 0;
            } else if (myStats.ep / eStats.ep > 1.5) {
                if (Math.random() < 0.6) eStats.hp = 0;
            } else if (myStats.ep / eStats.ep > 1.1) {
                if (Math.random() < 0.3) eStats.hp = 0;
            } else if (myStats.ep / eStats.ep > 0.8) {
                if (Math.random() < 0.1) eStats.hp = 0;
            };
            if (eStats.hp === 0) notice.push(`\n✨ **${char.name}** used Beelzebub to consume **${enemy.name}**!`);
            else notice.push(`\n✨ Attempt failed${(myStats.ep / eStats.ep > 0.8 && this.used < this.usage) ? ". Repeat next round?" : ""}`);
        },
    },
    "274": {
        usage: 1,
        used: 0,
        cost: 50,
        desc: "**Total Usage**: `1`\n**Mana**: `50`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nBy transforming into a Titan, Eren will boost his HP, ATK, MD, DEF and MR stats by **20%**. More Specifically, 15% of his max HP and 15% of his current DEF and current ATK each.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Eren increases his stats by 20% of his max HP, current DEF and current ATK
            matchStats.turn = 1;
            myStats.hp += Math.floor(myStats.maxhp * 0.2);
            myStats.maxhp += Math.floor(myStats.maxhp * 0.2);
            ["atk", "def", "md", "mr"].forEach((e) => mybuff[e].push(new buffInfo("*", 1.2, 9999)));
            notice.push(`\n✨ **${char.name}** has transformed into a Titan! Raised HP, ATK, MD, DEF and MR by **20%**`);
            embed.setThumbnail("https://i.ibb.co/YfnG2Tn/at.png");
        },
    },
    "405": {
        usage: 10,
        used: 0,
        cost: 60,
        desc: "**Total Usage**: `10`\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nWith her Noble Phantasm Excalibur, the pinnacle of holy swords, Saber unleashes her most powerful attack dealing **250%** of her normal damage.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Saber unleashes an attack with 250% damage
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Excalibur! She`, { atkMultiplier: 2.5 });
        },
    },
    "408": {
        usage: 1,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `1`\n**Mana**: `0`\\💧 on active, `35`\\💧 on passive\n**Timeout**: `no`\n**Role**: `DPS/Support`\n\nGilgamesh, the King of Heroes, brings his mighty arsenal to bear, showcasing a battle style as grand as his title. His potent abilities revolve around his majestic Gates of Babylon and his ultimate weapon, the Sword of Rupture, Ea.\n\nGilgamesh's passive becomes apparent whenever he possesses at least **35**\\💧. He opens the Gates of Babylon, launching a weapon straight at his opponent, causing damage equivalent to **40%** of his normal damage. Each successful strike bolsters Gilgamesh's own strength, incrementing his attack and magic damage by **2%**. However, there is an element of chance, as these attacks can potentially miss or be blocked by the enemy.\n\nOnce per battle, Gilgamesh reveals his trump card, the formidable Ea. He initiates the ability by commencing the charge of Enuma Elish, a process that takes three turns to charge. Once the charge reaches its peak, the unleashed attack inflicts damage equal to **150%** of Gilgamesh's attack. This damage can further be boosted, gaining an additional **1%** for every weapon the player owns up to a whopping **250%**.\n\nWhile he may display an air of arrogance, Gilgamesh's abilities undeniably reflect his moniker as the King of Heroes, wreaking havoc among his enemies with his versatile and formidable armaments. And his companions he doesn't leave on their own, assisting them with his Gates of Babylon during stampedes.",
        ability: async (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            const { 0: { n: inv } } = await query(`SELECT COUNT(*) AS n FROM weapons WHERE id = ${matchStats.interaction.user.id} AND substats IS NULL`);
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 3, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Ea! He`, { atkMultiplier: 1.5 + Math.min((inv || 0) / 100, 1), magicDamage: true, dodge: false });
            }));
            notice.push(`\n✨ **${char.name}** began charging Ea`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (myStats.sm >= 35) {
                    myStats.sm -= 35;
                    let dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.4, magicDamage: true });
                    if (dmg) {
                        mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.02), 9999));
                        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.02), 9999));
                    };
                };
            }, 9999));
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            if (Math.random() < 0.33) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.4, ignoreShield: true, magicDamage: true });
            };
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.33) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.4, ignoreShield: true, magicDamage: true });
                };
            }, 9999));
        },
    },
    "512": {
        usage: 1,
        used: 0,
        cost: 80,
        desc: "**Total Usage**: `1`\n**Mana**: `80`\\💧\n**Timeout**: `no`\n**Role**: `Tank`\n\nMash Kyrielight, the Shield of Chaldea, takes her defensive prowess to new heights in battle, turning her durability into an asset for her and her party. Mash's ability allows her to create a protective shield amounting to **80%** of her max HP. This tactical layer of defense provides a significant cushion against incoming damage, but it can only be utilized once per battle.\n\nHer passive ability, meanwhile, further fortifies her defenses. Mash inherently takes 10% less damage, and as long as she maintains her shield, her attack increases by **15%**, turning defense into offense.\n\nWhen it comes to party support, Mash's protective nature shines through once more. All of her allies begin the fight with a shield equal to **80%** of their max HP, **10%** increased block rate and they take **10%** less damage. Her abilities emphasize a balance of protection and power, making her an indispensable part of any team.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            myStats.shield += Math.floor(myStats.maxhp * 0.8);
            notice.push(`\n✨ **${char.name}** casts a protective shield.`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.def += 100;
            myStats.mr += 100;
            mybuff.def.push(new buffInfo("+", 100, 9999));
            mybuff.mr.push(new buffInfo("+", 100, 9999));
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (myStats.shield > 0) {
                    myStats.atk += Math.floor(myStats.atk * 0.15);
                };
            }, 9999));
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.shield += Math.floor(myStats.maxhp * 0.8);
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
        desc: "**Total Usage**: `unlimited`\n**Mana**: `0`\\💧, then `10`\\💧 continuously // 15% current 💖\n**Timeout**: `No/Yes`\n**Role**: `DPS`\n\nWhen using his ability, Xiao dons the Yaksha Mask that set gods and demons trembling millennia ago. Until his mana runs dry, he will deal **30%** more magic damage in this state, losing **10** mana each round. If he uses his ability again during this state, he will consume **15%** of current HP to lunge forward. This increases his dodge rate by **25%** for **3** turns, before dealing **150%** magic damage. This instance of damage is further boosted by current dodge rate, symbolizing the brute power behind the execution.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            if (matchStats.heap1.length > 0) { // Xiao increases md by 30% by consuming 10 mana per round. Deals 150%*1+dodgerate% damage if used again.
                if (myStats.hp/myStats.maxhp < 0.5) 
                    {let sacrifice = Math.floor(myStats.hp * 0.15);
                        mybuff.dodge.push(new buffInfo("+", 0.25, 2));
                        myStats.dodge += 0.25;
                        if (myStats.dodge > 1) {myStats.dodge = 1};
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** lunged forward! He`, { atkMultiplier: 1.5*(1+myStats.dodge), magicDamage: true, mdChance: -1 })} 
                    else {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    return matchStats.interaction.channel.send(`You need to be below 50% 💖 (${Math.floor(myStats.maxhp*0.5)}) for this attack.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                    };
                //myStats.sm -= 40;
               
            } else {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                if (myStats.sm < 10) return matchStats.interaction.channel.send(`You need at least **10**\\💧 to sustain this form`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                matchStats.consumeMana = 10;

                // Add new buffs to heap
                let mdbuff = new buffInfo("+", Math.floor(myStats.md * 0.3), "9999");
                let mgbuff = new buffInfo("=", 0, "9999");
                mybuff.md.push(mdbuff); mybuff.mg.push(mgbuff);
                matchStats.heap1 = [{ type: "md", id: mdbuff.id, buff: Math.floor(myStats.md * 0.3) }, { type: "mg", id: mgbuff.id, buff: myStats.mg }];
                myStats.md += Math.floor(myStats.md * 0.3);
                myStats.mg = 0;

                embed.setThumbnail("https://i.ibb.co/m024R2q/x.png");
                notice.push(`\n🎭 *General Alatus, falling in!* **${char.name}** dons the Yaksha Mask, increasing his MD by **30%**`);
            };
        }
},
    "733": {
        usage: 9999,
        used: 0,
        cost: 100,
        stacks: 0,
        desc: "**Total Usage**: `Unlimited`\n**Mana**: `100`\\💧\n**Timeout**: `No`\n**Role**: `DPS/Tank`\n\nAs a renowned alchemist, Albedo journeys into the unknown, searching for answers to questions surfacing in his mind. Oh- This foe piqued his interest. Albedo steals **150** DEF & MR from the enemy at the start of the fight.\nMoreover, he deploys his Solar Isotama Field, unleashing a transient blossom every turn, dealing **70%** of his DEF/MR (depending on whichever is higher) to the enemy. This hit bypasses all DEF/MR, cannot be dodged/blocked, and grants Albedo **1x** `Mastery`.\n\nUtilizing his ability initiates the Rite of Progeniture for **4** turns, during which he has **+220** DEF/MR. Moreover, an additional transient blossom will resonate, essentially doubling his passive isotama damage.\n\n`🏵️ ~ Moment of Birth ~ 🏵️`\nIf Albedo has 7x or more `Mastery` during the period of his ability, he will consume 7x `Mastery` to send forth **7** fatal blossoms, dealing **35%** DEF/MR to the enemy. This hit bypasses all DEF/MR but some may be dodged.\n\nIn a party, Albedo offers allies **+110** DEF & MR, as well as a **40%** chance to trigger his blossoms every turn, dealing **35%** DEF/MR to the foe. Should Albedo's close friends -- Klee or Kaeya be by his side, they gain **+220** DEF & MR instead, and will guarantee to trigger his blossoms every turn.\n💗 | P.S. If the ally is Klee specifically, she'll be lifted by the isotama, bestowing her **+50%** critical rate and damage. Boom~!",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (this.pause > matchStats.round) {
                myStats.sm += this.cost;
                return matchStats.interaction.channel.send(`Albedo (GI) needs to rest for ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`)
            };
            this.pause = matchStats.round + 4;
            notice.push(`\n✨**${char.name}** has initiated the Rite of Progeniture for **4** turns. `)
            // DEF/MR +330 for 4 turns
            myStats.def += 220;
            myStats.mr += 220;
            mybuff.def.push(new buffInfo("+", 220, 4));
            mybuff.mr.push(new buffInfo("+", 220, 4));
            // Proc. additional blossom every turn
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                let blossom = Math.floor(myStats.def*0.7);
                if (myStats.mr > myStats.def) {
                    blossom = Math.floor(myStats.mr*0.7)};
                eStats.hp -= blossom;
                this.stacks++
                notice.push(`\n🪨 **${char.name}** unleashed Transient Blossoms and dealt **${blossom}** damage!`);
            if (this.stacks >= 7) {
                // 7 blossoms = fatal blossom, only during active.
                this.stacks -= 7;
                let successfulblossom = 0;
                let fatalblossom_scaling = Math.floor(0.5*blossom)
                for (let i = 0; i < 7; i++) {
                    successfulblossom += Math.random() > eStats.dodge;
                };
                let fatalblossom = fatalblossom_scaling*successfulblossom
                eStats.hp -= fatalblossom;
                if (eStats.hp < 0) {eStats.hp = 0};
                notice.push(`\n🏵️ **${char.name}** sent forth **${successfulblossom}** fatal blossoms and dealt **${fatalblossom}** damage!`)}},4))
        },passive : (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Steals 150 DEF/MR from the enemy
            eStats.def -= 150;
            eStats.mr -= 150;
            myStats.def += 150;
            myStats.mr += 150;
            this.stacks = 0;
            // Proc. blossom every turn
            let blossom = Math.floor(myStats.def*0.7);
            if (myStats.mr > myStats.def) {
                blossom = Math.floor(myStats.mr*0.7)};
            eStats.hp -= blossom;
            if (eStats.hp < 0) {eStats.hp = 0};
            this.stacks++;
            notice.push(`\n🪨 **${char.name}** unleashed Transient Blossoms and dealt **${blossom}** damage!`);
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                let blossom = Math.floor(myStats.def*0.7);
                if (myStats.mr > myStats.def) {
                    blossom = Math.floor(myStats.mr*0.7)};
                eStats.hp -= blossom;
                if (eStats.hp < 0) {eStats.hp = 0};
                this.stacks++;
                notice.push(`\n🪨 **${char.name}** unleashed Transient Blossoms and dealt **${blossom}** damage!`)},9999))
            },party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                let blossomchance = 0
                let defmrbuff = 110
                if (["Klee", "Kaeya"].includes(myStats.name)) {
                    blossomchance = 1;
                    defmrbuff = 220;
                    myStats.def += 220;
                    myStats.mr += 220;
                    if (myStats.name == "Klee") {
                        myStats.cr += 0.5;
                        myStats.cd += 0.5;
                        mybuff.cr.push(new buffInfo("+", 0.5, 9999));
                        mybuff.cd.push(new buffInfo("+", 0.5, 9999));
                        notice.push(`\n💗 Albedo's Isotama has lifted Klee upwards! Critical rate & DMG **+50%** for the rest of the fight :]`)
                    }
                } else {
                    myStats.def += 110
                    myStats.mr += 110
                }
                // Proc. Blossom
                let blossomchancefinal = blossomchance == 1 ? 1 : Math.random();
                    if (blossomchancefinal > 0.6) {
                    let blossom = Math.floor(myStats.def*0.2);
                    if (myStats.mr > myStats.def) {
                        blossom = Math.floor(myStats.mr*0.2)};
                    if (blossomchance > 0.6) {
                    eStats.hp -= blossom;
                    notice.push(`\n🪨 **Albedo (GI)** unleashed Transient Blossoms and dealt **${blossom}** damage!`)}};
                mybuff.def.push(new buffInfo("+", defmrbuff, 9999));
                mybuff.mr.push(new buffInfo("+", defmrbuff, 9999));
                myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    let blossomchancefinal = blossomchance == 1 ? 1 : Math.random();
                    if (blossomchancefinal > 0.6) {
                    let blossom = Math.floor(myStats.def*0.2);
                    if (myStats.mr > myStats.def) {
                        blossom = Math.floor(myStats.mr*0.2)};
                    if (blossomchance > 0.6) {
                    eStats.hp -= blossom;
                    notice.push(`\n🪨 **Albedo (GI)** unleashed Transient Blossoms and dealt **${blossom}** damage!`);
                }}
            },9999))
            }
        },
    "735": {
        usage: 5,
        usage: 5,
        used: 0,
        cost: 40,
        desc: "**Total Usage**: `5`\n**Mana**: `40`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nEach use of Yoimiya's normal attack will grant her a 'flame', up to **20**. After collecting three 'flames', her normal attack receives a substantial **22.5%** increase in damage. Additionally, if Yoimiya is wielding a bow as her primary weapon, her normal attacks will apply a burn effect dealing **12.5%** true damage for **2** rounds.\n\nHer active ability has her deliver a one-two punch of **80%** physical and magical damage each, before unleashing a festive reprise, dealing **10%** DMG for every flame collected. The next round after using her active ability, her normal attack will trigger twice.\n\nYoimiya is **not** compatible with other ATK replacing abilities.",
        desc: "**Total Usage**: `5`\n**Mana**: `40`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nEach use of Yoimiya's normal attack will grant her a 'flame', up to **20**. After collecting three 'flames', her normal attack receives a substantial **22.5%** increase in damage. Additionally, if Yoimiya is wielding a bow as her primary weapon, her normal attacks will apply a burn effect dealing **12.5%** true damage for **2** rounds.\n\nHer active ability has her deliver a one-two punch of **80%** physical and magical damage each, before unleashing a festive reprise, dealing **10%** DMG for every flame collected. The next round after using her active ability, her normal attack will trigger twice.\n\nYoimiya is **not** compatible with other ATK replacing abilities.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Yoimiya
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.8, magicDamage: false });
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.8, magicDamage: true, mdChance: -1 });
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🔥 A festive reprise!`, { atkMultiplier: 0.1*myStats.yoimiyaFlames, magicDamage: true, mdChance: -1 })
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🔥 A festive reprise!`, { atkMultiplier: 0.1*myStats.yoimiyaFlames, magicDamage: true, mdChance: -1 })

            matchStats.twinshot = 1;
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 2, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                matchStats.twinshot = 0;
            }));
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.yoimiyaFlames = 0;
            myStats.yoimiyaLastTwinshot = matchStats.round;
            myStats.replaceButton.atk = {
                run: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    if (myStats.yoimiyaFlames<20) {myStats.yoimiyaFlames++};
                    if (myStats.yoimiyaFlames<20) {myStats.yoimiyaFlames++};
                    let atkbuff = 1;
                    if (myStats.yoimiyaFlames >= 3) {
                        //myStats.yoimiyaFlames = 0;
                        atkbuff = 1.225;
                    };
                    const burn = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}** with ${myStats.yoimiyaFlames}x 🔥`, { atkMultiplier: atkbuff, magicDamage: true });
                    const burn = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}** with ${myStats.yoimiyaFlames}x 🔥`, { atkMultiplier: atkbuff, magicDamage: true });
                    if (items[myStats.weapon]?.type === "bow") ebuff.hp.push(new buffInfo("+", -Math.floor(burn * 0.125), 2));

                    // Twinshot
                    if (matchStats.twinshot > Math.random() && myStats.yoimiyaLastTwinshot !== matchStats.round) {
                        myStats.yoimiyaLastTwinshot = matchStats.round;
                        myStats.replaceButton.atk.run(myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list);
                    };
                },
            };
        },
    },
    "767": {
        usage: 1,
        used: 0,
        cost: 100,
        desc: "**Total Usage**: `1`\n**Mana**: `100`\\💧\n**Timeout**: `yes`\n**Role**: `Support`\n\nHaving invested all her skill points in this one Explosion magic, her attack is not to be underestimated. Those caught in its path will feel the full force of Megumin's might, as she unleashes the ultimate attack of destruction dealing **300%** guaranteed magic damage. This takes all her energy though, and she becomes useless for the next 2 rounds as her damage and defense plummet to 0.\n\nIf she's in a party with her 'reliable' companions - **Aqua**, **Darkness** or **Kazuma Satou** - Megumin will get a shield equal to **10%** of her max HP after using her magic.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Megumin unleashes an attack with 300% magic damage. This can't be dodged. ATK, MATK, DEF and MDEF fall to 0 for 2 rounds
            embed.setThumbnail("https://i.ibb.co/9wktf9S/c.gif");
            embed.setImage(`https://i.imgur.com/80tH5Uz.gif`);
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ Bakuretsu! Bakuhatsu! **EXPLOSION!!!** She`, { atkMultiplier: 3, magicDamage: true, mdChance: -1, dodge: false, canTwinshot: true });
            mybuff.atk.push(new buffInfo("=", 0, 2));
            mybuff.def.push(new buffInfo("=", 0, 2));
            mybuff.md.push(new buffInfo("=", 0, 2));
            mybuff.mr.push(new buffInfo("=", 0, 2));
            myStats.atk = 0, myStats.def = 0, myStats.md = 0, myStats.mr = 0;

            if (matchStats.interaction.commandName === "stampede") {
                const names = list[0].map((e) => e.name);
                if (names.includes("Aqua") || names.includes("Darkness") || names.includes("Kazuma Satou")) {
                    myStats.shield += Math.floor(myStats.maxhp * 0.1);
                };
            };

            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 2, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                embed.setImage(eStats.image);
            }));
        },
    },
    "768": {
        usage: 9999,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `0`\\💧\n**Timeout**: `yes`\n**Role**: `Useless/Support`\n\nWhile useless on her own, Aqua isn't as ineffective as her reputation might suggest. Despite her shortcomings in combat, Aqua's support capabilities are nothing short of divine. When in the company of her party members - **Megumin**, **Darkness**, or **Kazuma Satou** - Aqua's divinity shines through, allowing her to cast a protective barrier on her party equal to **5%** of their max HP. Moreover, her divine abilities extend to miraculous healing and resurrection. She heals her party for **5%** of their max health every round, ensuring their longevity in the battle. In dire circumstances, Aqua can even resurrect fallen them, but this divine intervention can only occur once per battle.\n\nHowever, her normal attacks are ironically transmuted into a completely harmless splash, making it virtually impossible for her to deal damage in combat, reinforcing her infamous title.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Aqua
            eStats.wet = true;
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `💦 **${char.name}** used splash! She`, { atkMultiplier: 0, magicDamage: false });
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.interaction.commandName === "stampede") {
                myStats.replaceButton.atk = {
                    "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `💦 **${char.name}** used splash! She`, { atkMultiplier: 0, magicDamage: false });
                    },
                };
            };
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (["Megumin", "Darkness", "Kazuma Satou"].includes(myStats.name)) {
                myStats.shield += Math.floor(myStats.maxhp * 0.05);
                mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.05), 9999));
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
        desc: "**Total Usage**: `0`\n**Role**: `Tank`\n\nDarkness, a crusader with an unusual love for danger, proves herself as a robust defensive bulwark on the battlefield. Her distinct passion for frontline combat serves as a vital asset to her team's survival, reducing any damage she receives by a staggering **30%**. This is due to her high defenses against both physical and magic damage, effectively making her a veritable shield against enemy onslaughts.\n\nWhen teamed up with her unconventional comrades - **Megumin**, **Aqua**, or **Kazuma Satou**, Darkness willingly throws herself into the path of danger, using her own body as a shield to protect her allies, further lessening any damage her party members receive by **15%**. Darkness' self-sacrificing defense strategy, although peculiar, undeniably strengthens her party's resilience, making them that much tougher to bring down.",
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.def += 340; // Takes 30% less damage
            myStats.mr += 340;
            mybuff.def.push(new buffInfo("+", 340, 9999));
            mybuff.mr.push(new buffInfo("+", 340, 9999));
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
        desc: "**Total Usage**: `0`\n**Role**: `Support`\n\nKazuma Satou may seem like an ordinary character, but his abilities are anything but. His ability is a reflection of his sly wit and cunning mind. His high luck in battle renders his enemies unable to dodge his attacks.\n\nHowever, it's in his party's synergy that Kazuma's true potential is unveiled. If he finds himself fighting alongside his \"reliable\" companions - **Megumin**, **Aqua**, or **Darkness** - their chaotic synergy initiates an additional effect. Kazuma cleverly exploits his opponents' confusion, decreasing their dodge and block rates by **20%**. This disorientation further boosts his team's offense, making their attacks more likely to hit and causing a significant dent in their enemies' defenses. This collaborative effect not only showcases the eccentric harmony of Kazuma and his party but also makes them a force to be reckoned with on the battlefield.",
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.dodge = 0;
            ebuff.dodge.push(new buffInfo("=", 0, 9999));
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (["Megumin", "Aqua", "Darkness"].includes(myStats.name)) {
                eStats.dodge -= 0.2;
                if (eStats.dodge < 0) eStats.dodge = 0;
                ebuff.dodge.push(new buffInfo("+", -0.2, 9999));
                eStats.br -= 0.2;
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
        desc: "**Total Usage**: `unlimited` (with a 6 round cooldown)\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nRoronoa Zoro, a master of swordsmanship, is best known for his unique \"Three Sword Style\". After using his ability, Zoro will draw and attack with all 3 of his swords on normal attacks. He can hold this form for at most 3 rounds, but there's also a 5/10/15% chance of missing an attack, which leads him to put away his swords as well.\n\nAfter using his ability, Zoro needs to rest 6 rounds before he can use it again.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Zoro uses all 3 of his swords to attack 3x
            if (this.pause > matchStats.round) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                this.used--;
                myStats.sm += 60;
                return matchStats.interaction.channel.send(`Zoro needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            };
            this.pause = matchStats.round + 6;
            myStats.replaceButton.atk = {
                "emoji": "<:zoro:1084242647339761704>",
                "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    if (Math.random() < 0.05) {
                        notice.push("\n✨ Zoro missed the enemy. He is too tired to continue.");
                        delete myStats.replaceButton.atk;
                    } else {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:zoro:1084242647339761704> **${char.name}**`, { magicDamage: true });
                        if (Math.random() < 0.1) {
                            notice.push("\n✨ Zoro missed the enemy. He is too tired to continue.");
                            delete myStats.replaceButton.atk;
                        } else {
                            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:zoro:1084242647339761704> **${char.name}**`, { magicDamage: true });
                            if (Math.random() < 0.15) {
                                notice.push("\n✨ Zoro missed the enemy. He is too tired to continue.");
                                delete myStats.replaceButton.atk;
                            } else {
                                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:zoro:1084242647339761704> **${char.name}**`, { magicDamage: true });
                            };
                        };
                    };
                },
            };
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 3, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                delete myStats.replaceButton.atk;
            }));
        },
    },
    "1824": {
        usage: 1,
        used: 0,
        cost: 20,
        desc: "**Total Usage**: `1`\n**Mana**: `20`\\💧\n**Timeout**: `no`\n**Role**: `DPS`\n\nRyuuko Matoi sacrifices 30% of her current HP for an ATK increase of 90% of those lost HP",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Ryuuko sacrifices 30% of her current HP for a 90% ATK increase of lost HP
            let sacrifice = Math.floor(myStats.hp * 0.3);
            myStats.hp -= sacrifice;
            myStats.atk += Math.floor(sacrifice * 0.9);
            mybuff.atk.push(new buffInfo("+", Math.floor(sacrifice * 0.9), 9999));
            myStats.md += Math.floor(sacrifice * 0.9);
            mybuff.md.push(new buffInfo("+", Math.floor(sacrifice * 0.9), 9999));
            matchStats.turn = 1;
            notice.push(`\n✨ **${char.name}** sacrificed **${sacrifice}**HP for **${Math.floor(sacrifice * 0.9)}** ATK and Magic Damage`);
        },
    },
    "2079": {
        usage: 1,
        used: 0,
        cost: 50,
        desc: "**Total Usage**: `1`\n**Mana**: `50`\\💧\n**Timeout**: `yes`\n**Role**: `Tank/DPS`\n\nBy equipping her unique armor Hermes Trismegistus, Albedo increases her DEF by **50%** and gains a **25%** ATK increase of her current DEF.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Albedo permanently increases DEF by 50% and ATK by 25% of current DEF
            const raiseDef = Math.floor(myStats.def / 2);
            const raiseAtk = Math.floor(myStats.def / 4);
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
        desc: "**Total Usage**: `5`\n**Mana**: `45`\\💧\n**Timeout**: `yes`\n**Role**: `Support`\n\nAs a Vampire, Shalltear Bloodfallen can drain HP from her opponent to add it to herself. With every use of her ability, she will drain the equivalent of **20%** of her HP.\n\nDuring stampedes, Shalltear can aid her comrades by draining **8%** of the players hp from the enemy every 4 rounds.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Shalltear drains the equivalent of 20% of her max HP from the enemy and adds it to herself.
            const drain = Math.floor(myStats.maxhp * 0.2);
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
                    const drain = Math.floor(myStats.maxhp * 0.08);
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
        desc: "**Total Usage**: `3`\n**Mana**: `35`\\💧\n**Timeout**: `yes`\n**Role**: `Support`\n\nHer ability, the Code of Immortality grants C.C. with the burden of immortality. With every use of her ability, she gains an additional 14% of chance of revival for a total of 42% at most. If revived, C.C. will have 30%, 35% or 40% of HP depending on how often she used her ability. She can revive herself for a maximum of 3 times in a single match.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // C.C. gains +14% chance of revival with 30/35/40% of max HP
            myStats.rev += 0.14;
            if (this.used === 1) myStats.revhp = 0.3, mybuff.revhp.push(new buffInfo("=", 0.3, 9999));
            else myStats.revhp += 0.05, mybuff.revhp.push(new buffInfo("+", 0.05, 9999));
            notice.push(`\n✨ **${char.name}** used her Code of Immortality for a **${Math.min(Math.round(myStats.rev * 100), 100)}**% chance of revival with **${100 * myStats.revhp}**% HP!`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.maxRevivals += 3;
        },
    },
    "2814": {
        usage: 1,
        used: 0,
        cost: 10,
        desc: "**Total Usage**: `1`\n**Mana**: `10`\\💧\n**Timeout**: `yes`\n**Role**: `Support`\n\nWhen pushed to the brink of death, Tanya Degurechaff can self destruct as a last resort to take out her opponent. This requires her HP to be below 15% of her max HP and will deal 300% guaranteed damage. Tanya's HP will fall to 1 as well.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Tanya Degurechaff selfdestructs as a last resort
            if (myStats.hp / myStats.maxhp > 0.15) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                this.used--;
                myStats.sm += 10;
                return matchStats.interaction.channel.send(`Self destruct can only be used once your hp is below 15% of your max HP (${Math.floor(myStats.maxhp * 0.15)})`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            };
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used self destruct! She`, { atkMultiplier: 3, dodge: false });
            myStats.hp = 1;
        },
    },
    "3109": {
        usage: 1,
        used: 0,
        cost: 100,
        desc: "**Total Usage**: `1`\n**Mana**: `100`\\💧\n**Timeout**: `no`\n**Role**: `Tank/Support`\n\nMaple's active ability is a single use, high-cost maneuver that converts **75%** of her DEF and MR into ATK and MD respectively for **3** rounds. This move allows her to switch from a defensive role to a potent damage dealer. Additionally, Maple recovers **15%** of her missing health each round during this time.\n\nBecause of her bulky armor, Maple can't dodge any attacks but has an additional **+300** DEF and MR, making her more resilient against all kinds of attacks.\n\nIn a party, Maple boosts her party members resilience, effectively reducing the damage they take by **15%**.\n\n_15% damage reduction = 155 DEF|MR_",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            const incd = Math.floor(myStats.def * 0.75);
            mybuff.atk.push(new buffInfo("+", incd + Math.floor(myStats.atk * 0.05), 3));
            myStats.atk += incd + Math.floor(myStats.atk * 0.05);
            mybuff.def.push(new buffInfo("+", -incd, 3));
            myStats.def -= incd;
            const incmr = Math.floor(myStats.mr * 0.75);
            mybuff.md.push(new buffInfo("+", incmr + Math.floor(myStats.md * 0.05), 3));
            myStats.md += incmr + Math.floor(myStats.md * 0.05);
            mybuff.mr.push(new buffInfo("+", -incmr, 3));
            myStats.mr -= incmr;
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.hp += Math.floor((myStats.maxhp - myStats.hp) * 0.15);
            }, 3));
            notice.push(`\n✨ **${char.name}** turned **75%** of her DEF and MR into ATK and MD respectively`);
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
            myStats.def += 155; // Takes 15% less damage
            myStats.mr += 155;
            mybuff.def.push(new buffInfo("+", 155, 9999));
            mybuff.mr.push(new buffInfo("+", 155, 9999));
        },
    },
    "3150": {
        usage: 9999,
        used: 0,
        cost: 60,
        summoned: [],
        desc: "**Total Usage**: `max 3`\n**Mana**: `60`\\💧\n**Timeout**: `no`\n**Role**: `DPS`\n\nThanks to his ability to level up by fighting monsters, Sung Jin-Woo raises his level by 1 after every round for the duration of the fight. As the Shadow Monarch, he can summon one of his 3 loyal servants **Igris**, **Beru** or **Iron (SL)**. The user needs to have them in their inventory, and they take on their own stats (except ATK and MD, which is **60%** of Sung Jin Woo's ATK|MD). Once they're defeated, Sung Jin-Woo can no longer summon them.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            matchStats.turn = matchStats.turnSkill ? 0 : 1;

            // Active: Sung Jin Woo summons either Igris, Beru or Iron (SL) from the users inventory. Passive:
            let inv = await query(`SELECT users.equipment, users.shield_slot, characters.chars, characters.ref, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${matchStats.interaction.user.id}`);
            inv = { id: matchStats.interaction.user.id, class: myStats.class, level: myStats.lvl, bank: 0, chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref), equipment: JSON.parse(inv[0].equipment), shield_slot: inv[0].shield_slot, classlevels: JSON.parse(inv[0].classlevels) };

            if (!inv.chars.filter((e) => e === 3156 || e === 3159 || e === 3174).length) return matchStats.interaction.channel.send("You don't have any of the characters **Igris**, **Beru** or **Iron (SL)** to summon.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));

            myStats.sm -= this.cost;
            matchStats.myStatsCC = { ...myStats };
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

            myStats.atk = Math.floor(myStats.atk * 0.6);
            myStats.md = Math.floor(myStats.md * 0.6);
            myStats.mana = 30;
            myStats.sm = Math.min(30, myStats.sm) + this.cost;
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
        desc: "**Total Usage**: `unlimited`\n**Mana**: `80`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nWhen fighting an enemy, Guts channels his relentless fury in every strike, increasing his ATK by **20%**. However, his reckless and aggressive fighting style causes him to lose **5%** of his max HP every round, due to the wear and tear on his body from the intense battle.\nWhen Guts endures the relentless onslaught of his enemies, he gathers a portion of the pain and anguish they inflict upon him. He absorbs and stares damage taken (DoT excluded). When Guts uses his ability, he expends all stored up damage and releases a devastating strike dealing twice as much damage as he took, up to a maximum of **300%** of his base attack damage. This powerful attack serves as a testament to Guts' sheer resilience and indomitable spirit.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Active: Guts Absorbs damage taken and releases it x2 (max 300% ATK). DoT is excluded
            if ((myStats.damageTaken * 2) > 3 * myStats.atk) myStats.damageTaken = 3 * myStats.atk;
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: (myStats.damageTaken * 2) / myStats.atk, magicDamage: false });
            myStats.damageTaken = 0;
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Starts with decreased Stats
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
            mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp * 0.05), 9999));
        },
    },
    "4767": {
        usage: 0,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `0`\n**Timeout**: `no`\n**Role**: `DPS`\n\nDespite living in a world of magic and sorcery, Asta cannot use magic at all. Neverthless he keeps fighting without any abilities, relying purely on his physical strength. Then not all hope is yet lost for him. With his special Anti Magic grimoire he can block his enemies from using their abilities as well, overcoming their difference in battle strength. Not only that, but Asta benefits from having a **30%** increased attack stat for the duration of the whole fight.",
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Starts with decreased Stats
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.3), 9999));
            myStats.atk += Math.floor(myStats.atk * 0.3);
        },
    },
    "4913": {
        usage: 1,
        used: 0,
        roundUsed: -1,
        mgId: -1,
        brId: -1,
        cost: 0,
        desc: "**Total Usage**: `1+1`\n**Mana**: `20`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nLugh Tuatha Dé is a character built around timing and strategical thinking, offering both a long-term pay-off and immediate gains. His normal attacks fire off a ten-bullet barrage, each one dealing **9%** damage and increasing his crit damage by **3%** per hit for the following two rounds.\n\nHis ability, when activated, starts charging his attack Gungnir. During this time, Lugh stops generating mana but increases his block rate by **20%** as he focuses on defending himself and winning time. The second activation finally releases his charged attack, whose power increases by **40%** for each round up to a maximum of **10** rounds.\n\nWhen in a party, Lugh brings a combination of utility and raw power. For the first five rounds while charging his attack, he boosts mana generation by **+4**. After that, he fires off his charged Gungnir, dealing **130%** damage, followed by **15%** boosts on crit rate and crit damage for the rest of the battle.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            if (this.roundUsed === -1) {
                this.used--;
                if (myStats.sm < 20) return matchStats.interaction.channel.send(`You don't have enough mana! (**${myStats.sm}**/20\\💧)`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                myStats.sm -= 20; this.roundUsed = matchStats.round;

                const mgPause = new buffInfo("=", 0, 9999);
                this.mgId = mgPause.id;
                mybuff.mg.push(mgPause);
                const brBuff = new buffInfo("+", 0.2, 9999);
                this.brId = brBuff.id;
                mybuff.br.push(brBuff);

                notice.push(`\n✨ **${char.name}** started charging his Gungnir!`);
            } else {
                mybuff.mg.splice(mybuff.mg.findIndex((e) => e.id === this.mgId), 1);
                mybuff.br.splice(mybuff.br.findIndex((e) => e.id === this.brId), 1);

                const atkMultiplier = 1 + (0.4 * Math.min(10, matchStats.round - this.roundUsed));

                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Gungnir! He`, { atkMultiplier, shieldBreak: true, magicDamage: false, dodge: false, block: false });
            };
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.replaceButton.atk = {
                "emoji": "⚔️",
                "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    let hits = 0;
                    for (let i = 0; i < 10; i++) {
                        hits += Math.random() > eStats.dodge;
                    };
                    mybuff.cd.push(new buffInfo("+", 0.03 * hits, 2));
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**'s ${hits}/10 bullets hit! He`, { atkMultiplier: 0.09 * hits, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true }); // normal magical damage
                },
            };
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round < 6) {
                    myStats.mg += 4;
                } else if (matchStats.round === 6) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}** used Gungnir! He`, { atkMultiplier: 1.3, shieldBreak: true, magicDamage: false, dodge: false, block: false });
                } else {
                    myStats.cr += 0.15;
                    if (myStats.cr > 1) myStats.cr = 1;
                    myStats.cd += 0.15;
                };
            }, 9999));
        },
    },
    "4942": {
        usage: 1,
        used: 0,
        cost: 80,
        desc: "**Total Usage**: `max 1`\n**Mana**: `80`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nCid Kagenou tries his best to blend into the background and become a mob character. His attack and magic damage are decreased by **20%** for that during this phase, as well as his dodge chance and block rate which are nonexistent. However, when his HP falls below **50%** he will unveil his true identity as Shadow and increase his attack & magic damage by **25%**, defense & magic resist by **10%**, dodge chance & block rate by **+10%** and heal himself for **30%** of missing HP. Using his active, Shadow will use his almighty power and deal **200%** damage which can't be dodged nor blocked.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Active: Cid Kagenou deals 250% damage. Passive: Enters his shadow form when HP falls below 50%
            notice.push(`\n<:atomic:1076326318565765150> _**I... AM... ATOMIC**_`);
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 2, magicDamage: true, dodge: false, block: false });
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Starts with decreased Stats
            myStats.atk = Math.floor(myStats.atk * 0.8);
            myStats.md = Math.floor(myStats.md * 0.8);
            myStats.dodge = 0;
            myStats.br = 0;

            // Delayed Buff
            myStats.delayedBuffs.push(new delayedBuffs(0, function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp / myStats.maxhp < 0.5) {
                    myStats.hp += Math.floor((myStats.maxhp - myStats.hp) * 0.3);
                    mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.25), 9999));
                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.25), 9999));
                    myStats.atk += Math.floor(myStats.atk * 0.25);
                    myStats.md += Math.floor(myStats.md * 0.25);
                    mybuff.def.push(new buffInfo("+", Math.floor(myStats.def * 0.1), 9999));
                    mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr * 0.1), 9999));
                    myStats.def += Math.floor(myStats.def * 0.1);
                    myStats.mr += Math.floor(myStats.mr * 0.1);
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
                    myStats.atk = Math.floor(myStats.atk * 0.8);
                    myStats.md = Math.floor(myStats.md * 0.8);
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
        usage: 4,
        used: 0,
        cost: 50,
        desc: "**Total Usage**: `4`\n**Mana**: `50`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nYue gains Magic Resistance and Health proportional to her ATK (**20%**, **30%** respectively) which she keeps till the end of the match. Additionally, Yue heals herself for **10%** of all damage dealt as a passive.",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            matchStats.turn = matchStats.turnSkill ? 0 : 1; // Yue
            let hmr = Math.floor(myStats.atk * 0.2);
            mybuff.mr.push(new buffInfo("+", hmr, 9999));
            myStats.mr += hmr;
            let hHp = Math.floor(myStats.atk * 0.3);
            myStats.hp += hHp;
            if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
            notice.push(`\n✨ **${char.name}** recovered **${hHp}** HP. Gained **${hmr}** Magic Resist`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.selfhealChance.push(1);
            myStats.selfheal.push(0.1);
        },
    },
    "6029": {
        usage: 0,
        used: 0,
        cost: 100,
        desc: "**Total Usage**: `0`\n**Role**: `Support`\n\nVladilena Milizé's ability is a Tactical Skill that brings the full force of mechanized artillery to aid her comrades during stampedes. This skill has a strategic nature that embodies her character as a commander. Each round she has a **33%** chance of comanding a devastating artillery bombardment on the enemy ranks, dealing **200%** damage.",
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            if (Math.random() < 0.33) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 2, ignoreShield: true, magicDamage: true });
            };
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.33) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 2, ignoreShield: true, magicDamage: true });
                };
            }, 9999));
        },
    },
    "8189": {
        usage: 9999,
        used: 0,
        cost: 0,
        armor: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `0`\\💧, then `15`\\💧 continuously\n**Timeout**: `no`\n**Role**: `DPS`\n\nWith her Re-Equip magic, Erza Scarlet is able to select between 5 different armors to face her opponent as needed. With every use of her ability, she will cycle through her armors, and she'll use up 15 mana every round. She will not gain any mana while she has an armor equipped. Her inventory is as follows:\n\n__Fire Empress Armor__: Grants her **60%** ATK but decreases DEF by **20%**\n__Adamantine Armor__: Grants her **60%** DEF but decreases ATK by **20%**\n__Heaven's Wheel Armor__: Grants her **25%** ATK and DEF\n__Clear Heart Clothing__: Grants her **10%** ATK, **+20%** crit rate, **+50%** crit damage and **+10%** dodge chance\n__Armadura Fairy__: Heals her for **10%** of max HP per round",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
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
            switch (this.armor++ % 5) {
                case 0: embed.setThumbnail("https://i.ibb.co/KFLzdqd/f.png"); armorName = "Fire Empress Armor. She gained **60%** ATK, decreased DEF by **20%**"; atkbuff = new buffInfo("+", Math.floor(myStats.atk * 0.6), "9999"); defbuff = new buffInfo("+", -Math.floor(myStats.def * 0.2), "9999"); mybuff.atk.push(atkbuff); mybuff.def.push(defbuff); mybuff.mg.push(mgbuff); matchStats.heap1 = [{ type: "atk", id: atkbuff.id, buff: Math.floor(myStats.atk * 0.6) }, { type: "def", id: defbuff.id, buff: -Math.floor(myStats.def * 0.2) }, { type: "mg", id: mgbuff.id, buff: myStats.mg }]; myStats.atk += Math.floor(myStats.atk * 0.6); myStats.def += -Math.floor(myStats.def * 0.2); myStats.mg = 0; break;
                case 1: embed.setThumbnail("https://i.ibb.co/HG4tHWt/a.png"); armorName = "Adamantine Armor. She gained **60%** DEF, decreased ATK by **20%**"; atkbuff = new buffInfo("+", -Math.floor(myStats.atk * 0.2), "9999"); defbuff = new buffInfo("+", Math.floor(myStats.def * 0.6), "9999"); mybuff.atk.push(atkbuff); mybuff.def.push(defbuff); mybuff.mg.push(mgbuff); matchStats.heap1 = [{ type: "atk", id: atkbuff.id, buff: -Math.floor(myStats.atk * 0.2) }, { type: "def", id: defbuff.id, buff: Math.floor(myStats.def * 0.6) }, { type: "mg", id: mgbuff.id, buff: myStats.mg }]; myStats.atk += -Math.floor(myStats.atk * 0.2); myStats.def += Math.floor(myStats.def * 0.6); myStats.mg = 0; break;
                case 2: embed.setThumbnail("https://i.ibb.co/VDPkR10/w.png"); armorName = "Heaven's Wheel Armor. She gained **25%** ATK and DEF"; atkbuff = new buffInfo("+", Math.floor(myStats.atk * 0.25), "9999"); defbuff = new buffInfo("+", Math.floor(myStats.def * 0.25), "9999"); mybuff.atk.push(atkbuff); mybuff.def.push(defbuff); mybuff.mg.push(mgbuff); matchStats.heap1 = [{ type: "atk", id: atkbuff.id, buff: Math.floor(myStats.atk * 0.25) }, { type: "def", id: defbuff.id, buff: Math.floor(myStats.def * 0.25) }, { type: "mg", id: mgbuff.id, buff: myStats.mg }]; myStats.atk += Math.floor(myStats.atk * 0.25); myStats.def += Math.floor(myStats.def * 0.25); myStats.mg = 0; break;
                case 3: embed.setThumbnail("https://i.ibb.co/TH4gNq5/c.png"); armorName = "Clear Heart Clothing. She gained **10%** ATK, **+20%** crit rate, **+50%** crit damage, and **+10%** dodge chance"; atkbuff = new buffInfo("+", Math.floor(myStats.atk * 0.1), "9999"); crbuff = new buffInfo("+", 0.2, "9999"); cdbuff = new buffInfo("+", 0.5, "9999"); dodgebuff = new buffInfo("+", 0.1, "9999"); mybuff.atk.push(atkbuff); mybuff.cr.push(crbuff); mybuff.cd.push(cdbuff); mybuff.dodge.push(dodgebuff); mybuff.mg.push(mgbuff); matchStats.heap1 = [{ type: "atk", id: atkbuff.id, buff: Math.floor(myStats.atk * 0.1) }, { type: "cr", id: crbuff.id, buff: 0.2 }, { type: "cd", id: cdbuff.id, buff: 0.5 }, { type: "dodge", id: dodgebuff.id, buff: 0.1 }, { type: "mg", id: mgbuff.id, buff: myStats.mg }]; myStats.atk += Math.floor(myStats.atk * 0.1); myStats.cr += 0.2; myStats.cd += 0.5; myStats.dodge += 0.1; myStats.mg = 0; break;
                case 4: embed.setThumbnail("https://i.imgur.com/TDbvwEX.png"); armorName = "Armadura Fairy. She will gain **10%** HP every round"; hpbuff = new buffInfo("+", Math.floor(myStats.maxhp * 0.1), "9999"); mybuff.hp.push(hpbuff); mybuff.mg.push(mgbuff); matchStats.heap1 = [{ type: "hp", id: hpbuff.id, buff: Math.floor(myStats.maxhp * 0.1) }, { type: "mg", id: mgbuff.id, buff: myStats.mg }]; /* myStats.hp += Math.floor(myStats.maxhp*0.1); myStats.hp > myStats.maxhp ? myStats.hp = myStats.maxhp : false; */ myStats.mg = 0; break;
                default: false; break;
            };
            notice.push(`\n✨ **${char.name}** changed to ${armorName}`);
        },
    },
    "8194": {
        usage: 9999,
        used: 0,
        cost: 60,
        stacks: 0,
        pause: 0,
        desc: "**Total Usage**: `unlimited` (4 rounds cooldown on `Dark Blast Inferno`)\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nZeref, the Black Wizard, thrives in the heart of battle, using his dark powers to overwhelm his foes, even passively killing things around him. He deals **10-20%** magic damage randomly every round until his opponent has less than **40%** hp left. And due to his curse, Zeref is immortal, which causes him to regenerate 5% of his missing HP every round.\n\nHis active ability grants him a stack of Dark Cage, each one reducing damage taken by **2%** (up to **5** stacks). While his stacks are less than 4, Zeref will use `Dark Blaze`, dealing **130%** magic damage and inflicting a black flame debuff which will deal additional **20%** magic damage for 2 rounds. If he has **4+** stacks of Dark Cage, Zeref will use `Dark Blast Inferno`, dealing **160%** magic damage and inflicting black flame for 3 rounds.\n\nWhen in a party, everyone suffers from his `Death Predation` passive, dealing **20%** magic damage to party members and **40%** magic damage to enemies every round. However, if **Natsu Dragneel** is in the party, he will not only be immune to the passive damage, but also receive a **40%** ATK and MD increase thanks to Zeref enacting the `E.N.D.` protocol. But because of this, Zeref himself will take **40%** magic damage every round due to `E.N.D.`",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Zeref Dragneel
            if (this.pause > matchStats.round) {
                myStats.sm += this.cost;
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.interaction.channel.followUp({ content: `Zeref needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                this.used--;
                return;
            };

            if (this.stacks < 4) {
                this.stacks++;
                myStats.def += 20;
                myStats.mr += 20;
                mybuff.def.push(new buffInfo("+", 20, 9999));
                mybuff.mr.push(new buffInfo("+", 20, 9999));

                let dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Dark Blaze! He`, { atkMultiplier: 1.3, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });
                ebuff.hp.push(new buffInfo("+", -Math.floor(dmg * (2 / 13)), 2));
            } else {
                this.pause = matchStats.round + 4;

                if (this.stacks === 4) {
                    this.stacks++;
                    myStats.def += 20;
                    myStats.mr += 20;
                    mybuff.def.push(new buffInfo("+", 20, 9999));
                    mybuff.mr.push(new buffInfo("+", 20, 9999));
                };

                let dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Dark Blast Inferno! He`, { atkMultiplier: 1.6, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });
                ebuff.hp.push(new buffInfo("+", -Math.floor(dmg * (2 / 16)), 3));
            };
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.mdChance = 1;
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.hp += Math.floor((myStats.maxhp - myStats.hp) * 0.05);

                if ((eStats.hp / eStats.maxhp) > 0.4) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.1 + (0.1 * Math.random()), magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });
                };

                if (matchStats.interaction.commandName === "stampede") {
                    const names = matchStats.partyChars.map((e) => e.name);
                    if (names.includes("Natsu Dragneel")) {
                        dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.4, magicDamage: true, mdChance: -1 });
                    };
                };
            }, 9999));
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            if (myStats.name === "Natsu Dragneel") {
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.4), 9999));
                mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.4), 9999));
                myStats.atk += Math.floor(myStats.atk * 0.4);
                myStats.md += Math.floor(myStats.md * 0.4);
            } else {
                myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.2, magicDamage: true, mdChance: -1 });
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.4, magicDamage: true, mdChance: -1 });
                }, 9999));
            };
        },
    },
    "8521": {
        usage: 3,
        used: 0,
        cost: 60,
        desc: "**Total Usage**: `3`\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nKiyotaka Ayanokouji seems like an ordinary student from the outside, leading his enemies to underestimate him and letting their guards down, decreasing defense by **20%** and block rate as well as dodge chance by **30%**. On top of this, he has a **10%** chance of countering any attack aimed at him. While he'll go easy on most challenges coming his way, seemingly with no ambitions whatsoever, Ayanokouji will do anything it takes to win. Step by step, Ayanokouji increases his attack by **15%**, **25%** and **33%** permanently and increases his dodge chance by **5%** each time. Because winning is everything in this world. As long as he wins in the end... that's all that matters.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Kiyotaka Ayanokouji increases his attack by 15/25/33% and gains +5% dodge chance
            switch (this.used) {
                case 1: embed.setThumbnail("https://i.ibb.co/y8MDgRD/g.gif"); mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.15), 9999)); myStats.atk = Math.floor(myStats.atk * 1.15); myStats.dodge += 0.05; mybuff.dodge.push(new buffInfo("+", 0.05, 9999)); notice.push(`\n✨ **${char.name}** decides to get slightly serious. Increased ATK by **15%** and dodge by **+5%**`); break;
                case 2: mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.1), 9999)); myStats.atk = Math.floor(myStats.atk * 1.1); myStats.dodge += 0.05; mybuff.dodge.push(new buffInfo("+", 0.05, 9999)); notice.push(`\n✨ **${char.name}** gets a little more serious. Increased ATK by **25%** and dodge by **+5%**`); break;
                case 3: mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.08), 9999)); myStats.atk = Math.floor(myStats.atk * 1.08); myStats.dodge += 0.05; mybuff.dodge.push(new buffInfo("+", 0.05, 9999)); notice.push(`\n✨ **${char.name}** goes all out. Increased ATK by **33%** and dodge by **+5%**`); break;
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
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.1) myStats.counter = Math.max(1, myStats.counter ?? 0);
            }, 9999));
        },
    },
    "8890": {
        usage: 9999,
        used: 0,
        cost: 40,
        roundUsed: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `40`\\💧\n**Timeout**: `no`\n**Role**: `DPS`\n\nBeing one of the strongest psychic heroes, Tatsumaki's attacks always deal magic damage. She has **20%** increased magic damage throughout the battle, and decreases her enemy's magic resistance by **30%** when using her ability, making them more vulnerable towards her attacks.",
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
            let atkBonus = Math.floor(myStats.md * 0.2);
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
        desc: "**Total Usage**: `unlimited`\n**Mana**: `25, 50, 75, and 100+`\\💧 depending on how much you have\n**Timeout**: `yes`\n**Role**: `DPS`\n\nIchigo's ability is split into 4 different parts, and depending on his current mana his ability will have differing effects. If his mana is between 25-49\\💧, Ichigo deals an attack dealing **120%** damage, which can be both physical or magic damage depending on his other stats. If he has 50-74\\💧 he increases his ATK and MD by **30%** and his DEF by **10%** for 4 rounds. If it is between 75-99\\💧 he will double his ATK and MD but decrease DEF by **20%** for 3 rounds. Above this, his entire mana will be converted into ATK and MD (1\\💧 = 1% boost, up to 150%) and reduce enemy block rate to **0%** for 3 rounds. However, after using his Final Getsuga Tensho Ichigo needs to rest for 5 rounds, during which he can't use his ability.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Ichigo's ability comes in these 4 stages:
            if (this.pause > matchStats.round) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                this.used--;
                myStats.sm += 25;
                return matchStats.interaction.channel.send(`Ichigo Kurosaki needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            };

            if (myStats.sm < 50) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Getsuga Tensho! He`, { atkMultiplier: 1.2, magicDamage: true });
            } else if (myStats.sm < 75) {
                myStats.sm -= 25;
                myStats.def = Math.floor(myStats.def * 1.1);
                myStats.atk = Math.floor(myStats.atk * 1.3);
                myStats.md = Math.floor(myStats.md * 1.3);
                mybuff.def.push(new buffInfo("*", 1.1, 4));
                mybuff.atk.push(new buffInfo("*", 1.3, 4));
                mybuff.md.push(new buffInfo("*", 1.3, 4));
                notice.push(`\n✨ **${char.name}** used his Bankai! Increased his ATK and MD by **30%** and DEF by **10%** for 4 rounds.`);
            } else if (myStats.sm < 100) {
                myStats.sm -= 50;
                myStats.def = Math.floor(myStats.def * 0.8);
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
                this.pause = matchStats.round + 5;
                eStats.br = 0;
                ebuff.br.push(new buffInfo("=", 0, 3));
                const boost = 1 + Math.min(myStats.sm * 0.01, 1.5);
                mybuff.atk.push(new buffInfo("*", boost, 3));
                mybuff.md.push(new buffInfo("*", boost, 3));
                myStats.atk = Math.floor(myStats.atk * boost);
                myStats.md = Math.floor(myStats.md * boost);
                myStats.sm -= Math.min(myStats.sm - 25, 125);
                notice.push(`\n✨ **${char.name}** used his Final Getsuga Tensho! Increased ATK and MD by **${Math.floor(boost * 100)}%** and reduced enemy block rate to **0%** for 4 rounds.`);
            };
        },
    },
    "9606": {
        usage: 9999,
        used: 0,
        cost: 55,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `55`\\💧\n**Timeout**: `no`\n**Role**: `Support`\n\nAs agile as she is, Meme truly is difficult to catch. She has **10**% increased dodge chances at all times, and through the use of her ability she can increase it by up to **30%** for 3 rounds (max 50%).",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Meme increases her dodge chance by 30% (max 50%) and has +10% passively
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            let increase_eva = myStats.dodge < 0.2 ? 0.3 : (0.5 - myStats.dodge);
            if (increase_eva < 0) increase_eva = 0;
            myStats.dodge += increase_eva;
            mybuff.dodge.push(new buffInfo("+", increase_eva, 3));
            notice.push(`\n✨ **${char.name}** increased her dodge chance to **${(myStats.dodge + increase_eva) * 100}%** for 3 rounds!`);
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
        desc: "**Total Usage**: `0`\n**Role**: `DPS`\n\nYuno Gasai's ability lays waste to all who stand against her, sparing only her beloved Yukiteru Amano. She will eliminate all other party members if anyone tries to steal her spotlight in stampedes, leaving only Yukkii and herself standing. Her attack and magic damage stats increase to **200%** and she gains **+30%** crit rate during stampedes.",
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
        cost: 50,
        cost: 50,
        roundUsed: -5,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `50`\\💧\n**Timeout**: `no`\n**Role**: `Support/DPS`\n\nLuminous brings a unique blend of healing and damage to the battlefield. Her abilities not only bolster her offensive capabilities but also provide a reliable source of health recovery for herself and her allies.\n\nShe steadily recovers **3%** of her missing health every round. As the lightbearer of truth, this consistent restoration always results in a critical recovery, ensuring that the light is always ignited, against all odds of suppression.\n\nWhen her active ability is used, Luminous enters a heightened state for **3 rounds**, increasing her magic damage and critical damage by **33%** and doubling her passive from **3%** to **6%**, and during this state she deals magic damage to her opponents. However, it's important to note that this ability can't be stacked, meaning it can't be used again while the effect is still active. \n\n *The light- I... I see the light.*\n Every third use of her ability prompts the illumination of darkness, allowing Luminous to additionally recover **33%** lost HP.\n\nWhen part of a party, Luminous extends her blessings to her friends as well. She increases the party's magic damage by **20%** and ensures they stay in the fight by healing them for **5%** of their missing health every round. Accompanied by the dazzling glow, this restoration always results in a critical heal.",
        desc: "**Total Usage**: `unlimited`\n**Mana**: `50`\\💧\n**Timeout**: `no`\n**Role**: `Support/DPS`\n\nLuminous brings a unique blend of healing and damage to the battlefield. Her abilities not only bolster her offensive capabilities but also provide a reliable source of health recovery for herself and her allies.\n\nShe steadily recovers **3%** of her missing health every round. As the lightbearer of truth, this consistent restoration always results in a critical recovery, ensuring that the light is always ignited, against all odds of suppression.\n\nWhen her active ability is used, Luminous enters a heightened state for **3 rounds**, increasing her magic damage and critical damage by **33%** and doubling her passive from **3%** to **6%**, and during this state she deals magic damage to her opponents. However, it's important to note that this ability can't be stacked, meaning it can't be used again while the effect is still active. \n\n *The light- I... I see the light.*\n Every third use of her ability prompts the illumination of darkness, allowing Luminous to additionally recover **33%** lost HP.\n\nWhen part of a party, Luminous extends her blessings to her friends as well. She increases the party's magic damage by **20%** and ensures they stay in the fight by healing them for **5%** of their missing health every round. Accompanied by the dazzling glow, this restoration always results in a critical heal.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Luminous increases her magic damage, critical damage for 3 rounds
            // Luminous increases her magic damage, critical damage for 3 rounds
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (matchStats.round < this.roundUsed + 3) {
                myStats.sm += this.cost;
                return matchStats.interaction.channel.send("You can't stack Luminous' ability").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            };
            let healedamt = 0
            this.used++
            let healedamt = 0
            this.used++
            myStats.mdChance += 1;
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.33), 2));
            myStats.md += Math.floor(myStats.md * 0.33);
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.33), 2));
            myStats.md += Math.floor(myStats.md * 0.33);

            mybuff.cd.push(new buffInfo("+",0.33,2));
            myStats.cd += 0.33;

            // Every 3rd use additionally grants 33% lost HP heal
            if ((this.used % 3) === 0) {
                healedamt = Math.floor((myStats.maxhp - myStats.hp) * 0.33);
                myStats.hp += healedamt;
                notice.push(`\n👒 **${char.name}** has been graced by the light. Restored **${healedamt}** HP.`);
                healedamt = 0};

            mybuff.cd.push(new buffInfo("+",0.33,2));
            myStats.cd += 0.33;

            // Every 3rd use additionally grants 33% lost HP heal
            if ((this.used % 3) === 0) {
                healedamt = Math.floor((myStats.maxhp - myStats.hp) * 0.33);
                myStats.hp += healedamt;
                notice.push(`\n👒 **${char.name}** has been graced by the light. Restored **${healedamt}** HP.`);
                healedamt = 0};

            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.hp += Math.floor((myStats.maxhp - myStats.hp) * 0.03 * myStats.cd);
            myStats.hp += Math.floor((myStats.maxhp - myStats.hp) * 0.03 * myStats.cd);
            }, 2));

            // Change image after 3 rounds
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 3, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.mdChance -= 1;
                embed.setThumbnail(myStatsFixed.thumbnail || char.image);
            }));

            embed.setThumbnail("https://i.ibb.co/NKnp3KM/luminous.png");
            notice.push(`\n✨ **${char.name}** increased her MD and critical DMG by **33%** for 3 rounds!`);
            notice.push(`\n✨ **${char.name}** increased her MD and critical DMG by **33%** for 3 rounds!`);
            this.roundUsed = matchStats.round;
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.hp += Math.floor((myStats.maxhp - myStats.hp) * 0.03 * myStats.cd);
                myStats.hp += Math.floor((myStats.maxhp - myStats.hp) * 0.03 * myStats.cd);
            }, 9999));
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.2), 9999));
            myStats.md += Math.floor(myStats.md * 0.2);
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.2), 9999));
            myStats.md += Math.floor(myStats.md * 0.2);
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.hp += Math.floor((myStats.maxhp - myStats.hp) * 0.05 * myStats.cd);
                myStats.hp += Math.floor((myStats.maxhp - myStats.hp) * 0.05 * myStats.cd);
            }, 9999));
        },
    },
    "10520": {
        usage: 9999,
        used: 0,
        cost: 0,
        roundUsed: 0,
        usedThisRound: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `0`\\💧 on active, `-25`\\💧 on passive\n**HP**: `5%`<:HP:1062043800979116143>\n**Timeout**: `no`\n**Role**: `DPS`\n\nVictoria, an accomplished knight and a decorated war hero, has become a formidable force on the battlefield through her countless skirmishes. Her vast experience and relentless determination have honed her skills, allowing her to stand toe to toe with dragons, with her prowess mirroring their ferocity and prestige.\n\nIn an ongoing testament to her thirst for knowledge and self-improvement, Victoria gains **+25%** class xp, and her countless encounters with dragons have sharpened her combat abilities against them, resulting in a **20%** increase in ATK when facing dragons.\n\nVictoria's resilience in combat is further enhanced by her ability to use mana to heal herself. When enough mana is available, Victoria will consume **25**\\💧 to regenerate **6%** of max HP, showcasing her ability to adapt and endure even in the direst of situations.\n\nVictoria can also tap into the raw energy of life itself, making the ultimate sacrifice for the promise of power. She can willingly sacrifice **5%** of her HP to gain a **25%** ATK boost for that round. This effect can be stacked up to **3 times** at once, embodying Victoria's willingness to risk everything for overwhelming power, mirroring the very dragons she battles in ferocity and resilience.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Victoria gains 20% more class xp. Has 20% increased ATK if she fights against a dragon.
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (matchStats.round === this.roundUsed) {
                this.usedThisRound++;
                if (this.usedThisRound >= 3) {
                    myStats.sm += this.cost;
                    return matchStats.interaction.channel.send("You can stack Victorias's ability up to 3 times max.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                };
            } else {
                this.usedThisRound = 0;
            };

            // Consume HP & ATK Buff
            const sacrifice = Math.floor(myStats.maxhp * 0.05);
            myStats.hp -= sacrifice;
            if (myStats.hp < 0) myStats.hp = 0;
            const atkbuff = Math.floor(myStatsFixed.atk * 0.25);
            myStats.atk += atkbuff;

            this.roundUsed = matchStats.round;
            notice.push(`\n✨ **${char.name}** sacrificed **${sacrifice}** HP for **${atkbuff}** ATK!`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.xpboost += 0.25;
            if (["Dragon", "True Dragon", "Death Dragon", "Sky Dragon"].includes(enemy.species)) {
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
                myStats.atk += Math.floor(myStats.atk * 0.2);
            };
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (myStats.sm > 25) {
                    myStats.sm -= 25;
                    myStats.hp += Math.floor(myStats.maxhp * 0.06);
                    if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
                };
            }, 9999));
        },
    },
    "10524": {
        usage: 9999,
        used: 0,
        cost: 30,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `30`\\💧\n**Timeout**: `yes`\n**Role**: `Support`\n\nRosalia is a character with an interesting balance of manipulation and damage abilities. Her passive ability inflicts a bleeding effect on the enemy, causing them to lose an amount equal to **5%** of Rosalia's max HP every round. Additionally, Rosalia drains **3** mana from the enemy every round, increasing her own mana pool and allowing her to use her abilities more frequently. Moreover, Rosalia gains a **20%** boost on class xp.\n\nRosalia doesn't simply use her own mana alone when activating her ability, instead she consumes **20** mana from the enemy as well to deal **125%** magic damage. If her attack hits the target, there's a **50%** chance of doubling the bleeding effect on her enemy for 2 rounds.\n\nIn a party, Rosalia extends her mana draining ability to aid her allies, draining **3** mana from the enemy every round.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Rosalia
            if (eStats.sm < 20) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                myStats.sm += 30;
                return matchStats.interaction.channel.send("Your enemy needs **20**💧 to activate").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            };
            eStats.sm -= 20;
            let dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1.25, magicDamage: true, mdChance: -1 });
            if (dmg && Math.random() < 0.5) ebuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp * 0.05), 2));
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.xpboost += 0.2;
            ebuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp * 0.05), 9999));
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
    "12093": {
        usage: 3,
        used: 0,
        cost: 65,
        desc: "**Total Usage**: `3`\n**Mana**: `65`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nEven though Izuku was born Quirkless, he managed to catch the attention of the legendary hero All Might, and has since become his close pupil. All Might passed on his transferable Quirk to Izuku, making him the ninth and current holder of One For All.\n\nDeku increases his ATK by **4%** every turn up to a maximum increase of **32%**. With consecutive usage of his active ability Midoriya unleashes more power each time, dealing **120**/**130**/**150%** damage, but also damaging himself for **5**/**10**/**15%**.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            const atkMultiplier = this.used === 1 ? 1.2 : (this.used === 1 ? 1.3 : 1.5);
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** uses One for All at **${this.used === 1 ? 5 : (this.used === 1 ? 8 : 15)}%**! He`, { atkMultiplier, magicDamage: true, block: false });

            // Sacrifice
            myStats.hp -= myStats.hp * (0.05 + (0.05 * (this.used - 1)));
            if (myStats.hp < 0) myStats.hp = 0;
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.atk += Math.floor(myStats.atk * Math.min(0.32, 0.04 * matchStats.round));
            }, 9999));
        },
    },
    "12121": {
        usage: 16,
        used: 0,
        cost: 50,
        roundUsed: 0,
        desc: "**Total Usage**: `16`\n**Mana**: `50`\\💧\n**Timeout**: `no`\n**Role**: `Support/DPS`\n\nAll Might's ability One For All is a Quirk that allows the user to temporarily increase their strength and speed to superhuman levels. When activated, One For All **doubles** the user's ATK and reduces enemy DEF by **half** (max 4x damage), making them more vulnerable to his attacks. This allows the user to deliver powerful blows and take down their enemies with ease. However, the Quirk does come with a drawback, as it can put a strain on the user's body, potentially causing injury, damaging himself for **5%** of his current HP (**10%** chance of failure). As such, it should be used carefully.\n\nStanding firm and leading the way for his party members as the symbol of peace and beacon of hope, All Might increases all party member's attacks by **20%**.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // All Might doubles his ATK and reduces enemy def by half for the next attack. 10% chance of failure damaging himself for 5% HP
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (matchStats.round === this.roundUsed) {
                myStats.sm += this.cost;
                return matchStats.interaction.channel.send("You can't stack All Might's ability").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            };
            if (Math.random() < 0.1) {
                let dmg = Math.floor(myStats.hp * 0.05);
                myStats.hp -= dmg;
                return notice.push(`\n✨ **${char.name}** damaged himself by **${dmg}**!`);
            };
            myStats.atk *= 2;
            eStats.def = Math.floor(eStats.def - Math.min(eStats.def * 0.5, 1320));

            this.roundUsed = matchStats.round;
            notice.push(`\n✨ **${char.name}** doubled his ATK and decreased enemy DEF by half!`);
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
            myStats.atk += Math.floor(myStats.atk * 0.2);
        },
    },
    "12393": {
        usage: 9,
        used: 0,
        cost: 0,
        roundUsed: 0,
        usedThisRound: 0,
        desc: "**Total Usage**: `9`\n**Cost**: `70`\\💧, then `250`<:coins:872926669055356939>\n**Timeout**: `no`\n**Role**: `Support/Farming`\n\nEliza's Ability is multi-layered and can be used up to three times per round. On the first use, it amplifies her ATK by up to **20%** at the cost of **70**\\💧, providing a significant boost to her offensive capabilities. For the second and third uses, it further increases her attack up to an additional **+10%** and adds a shield equal to **7.5%** of her max HP at the expense of **250**<:coins:872926669055356939>. These ATK buffs scale with the amount of coins the user has in their balance up to **100'000**<:coins:872926669055356939>\n\nAdditionally, Eliza's passive ability allows her to gain **20%** more coins from dungeons, providing her with more resources to utilize her active ability more frequently and sustainably.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            this.used--;

            const { 0: stats } = await query(`SELECT coins FROM users WHERE id = ${matchStats.interaction.user.id}`);
            stats.coins = Math.min(stats.coins, 100000);

            if (matchStats.round === this.roundUsed) {
                if (++this.usedThisRound >= 3) return matchStats.interaction.channel.send("You can stack **Eliza**'s ability up to **3** times max.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            } else this.usedThisRound = 0;

            let atkbuff;
            switch (this.usedThisRound) {
                case 0: if (myStats.sm < 70) return matchStats.interaction.channel.send(`You don't have enough mana (**${myStats.sm}**/70).`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                    myStats.sm -= 70;
                    atkbuff = Math.floor(myStats.atk * (0.2 * (stats.coins / 100000)));
                    myStats.atk += atkbuff;
                    notice.push(`\n✨ **${char.name}** gains **${atkbuff}** ATK`); break;
                case 1: if (stats.coins < 250) return matchStats.interaction.channel.send("You don't have enough coins to activate **Eliza**'s ability.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                    atkbuff = Math.floor(myStats.atk * (0.1 * (stats.coins / 100000)));
                    myStats.atk += atkbuff;
                    myStats.shield += Math.floor(myStats.maxhp * 0.05);
                    notice.push(`\n✨ **${char.name}** uses 250<:coins:872926669055356939> to gain **${atkbuff}** ATK and **${Math.floor(myStats.maxhp * 0.05)}** Shield`);
                    await query(`UPDATE users SET coins = coins - 250 WHERE id = ${matchStats.interaction.user.id}`); break;
                case 2: if (stats.coins < 250) return matchStats.interaction.channel.send("You don't have enough coins to activate **Eliza**'s ability.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                    atkbuff = Math.floor(myStats.atk * (0.1 * (stats.coins / 100000)));
                    myStats.atk += atkbuff;
                    myStats.shield += Math.floor(myStats.maxhp * 0.05);
                    notice.push(`\n✨ **${char.name}** uses 250<:coins:872926669055356939> to gain **${atkbuff}** ATK and **${Math.floor(myStats.maxhp * 0.05)}** Shield`);
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
        buffer: undefined,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `30`\\💧\n**Timeout**: `no`\n**Role**: `DPS`\n\nAneira, wielding her ancient frost magic, has an ability that leaves her enemies frozen in fear and ice. Once activated, her ability delivers a chilling attack. Starting with **50%** damage, Aneira gains 1 additional icicle every round (up to 7), each adding **+25%** more to her damage.\n\nTrying to block her freezing attacks is futile, but if her opponent can miraculously dodge her frozen fury, the spell simply fizzles out. Should the attack land however, Aneira's enemy gets encased in ice, decreasing their defense by **20%** and rendering them incapable of moving in their next turn.\n\nAdditionally, Aneira gains **+25%** class xp from her battles.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Aneira
            const dmg = (!eStats.dodge && Math.random() < eStats.br) ? notice.push(`\n💨 **${enemy.name}** dodged the attack!`) : dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.5 + Math.min(0.25 * (matchStats.round - this.roundUsed), 1.75), magicDamage: true, block: false });
            this.roundUsed = matchStats.round;

            // if (dmg) { // Don't freeze if dodged
            //     matchStats.turn = matchStats.turnSkill ? 0 : 1;

            //     eStats.def = Math.floor(eStats.def * 0.8); // Decrease DEF

            //     const path = "icy-" + eStats.image.split("").filter((e) => !" /:\\*?!<>|".includes(e)).join("").toLowerCase();

            //     // If it doesn't exist, generate it
            //     if (!fs.existsSync(`./Images/${path}`)) {
            //         await generateImage(eStats.image, "https://i.imgur.com/vzFuaNd.png", path);
            //     };

            //     const { AttachmentBuilder } = require('discord.js');
            //     const file = new AttachmentBuilder(`./Images/${path}`);
            //     message.edit({ files: [file] });
            //     embed.setImage(`attachment://${path}`);

            //     myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            //         message.edit({ files: [] });
            //         embed.setImage(eStats.image);
            //     }));

            //     notice.push(`\n✨ **${enemy.name}** was frozen for 1 round!`);
            // };

            if (dmg) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;

                eStats.def = Math.floor(eStats.def * 0.8); // Decrease DEF

                if (this.buffer === undefined) {
                    const canvas = createCanvas(225, 350);
                    const ctx = canvas.getContext('2d');

                    const enemyImage = await loadImage(eStats.image);
                    const iceLayer = await loadImage("https://i.imgur.com/vzFuaNd.png");

                    ctx.drawImage(enemyImage, 0, 0, canvas.width, canvas.height);
                    ctx.drawImage(iceLayer, 0, 0, canvas.width, canvas.height);

                    // Convert to buffer and upload
                    const buffer = canvas.toBuffer('image/jpeg');
                    this.buffer = new AttachmentBuilder(buffer);
                };

                message.edit({ files: [this.buffer] });
                embed.setImage(`attachment://file.jpg`);

                myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    message.edit({ files: [] });
                    embed.setImage(eStats.image);
                }));

                notice.push(`\n✨ **${enemy.name}** was frozen for 1 round!`);
            };
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.xpboost += 0.25;
        },
    },
    "12450": {
        usage: 3,
        used: 0,
        cost: 0,
        roundUsed: 0,
        usedThisRound: 0,
        desc: "**Total Usage**: `3`\n**Cost**: `0`\\💧, `33%`\\💖\n**Timeout**: `no`\n**Role**: `DPS`\n\nLuminous (alter) presents a high-risk, high-reward playstyle, emphasizing critical hits and self-sacrifice for substantial damage output. Her active ability allows her to sacrifice **33%** of her maximum health to launch a powerful attack dealing **140%** of her normal damage at no mana cost. Hated by the divine, self-heal passives on damage won't work on Luminous (alter).\n\nHer passive ability augments her crit rate by an additional **20%**. In addition, she gains **25%** more class xp, allowing her to level up her class faster. However, this power is difficult to bear and comes with a great cost: she loses **4%** of her max HP every round, and any shield she gains will break down immediately.\n\nWhen in a party, Luminous (alter) can refuse to cooperate, dealing damage to her own party members. I wonder how we can get her to cooperate...",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Luminous Alter
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (matchStats.round === this.roundUsed) {
                if (++this.usedThisRound >= 1) return matchStats.interaction.channel.send("You can use Luminous (alter)'s ability only once per round.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            } else {
                this.usedThisRound = 0;
            };
            this.roundUsed = matchStats.round;

            const sacrifice = Math.ceil(myStats.maxhp * 0.33);
            if (myStats.hp <= sacrifice) return matchStats.interaction.channel.send("You don't have enough HP left").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            myStats.hp -= sacrifice;

            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1.4, selfheal: false });
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.xpboost += 0.25;
            myStats.shield = 0;
            myStats.cr += 0.2;
            if (myStats.cr > 1) myStats.cr = 1;
            mybuff.cr.push(new buffInfo("+", 0.2, 9999));
            mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp * 0.04), 9999));
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.shield = 0;
                myStats.atk += Math.floor(myStats.atk * (0.6 - (myStats.hp / (2 * myStats.maxhp))));
            }, 9999));
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            if (Math.random() < 0.25) {
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${name}** attacked **${myStats.name}**! She`, { critMultiplier: 1.33 });
            };
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.25) {
                    dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${name}** attacked **${myStats.name}**! She`, { critMultiplier: 1.33 });
                };
            }, 9999));
        },
    },
    "14903": {
        usage: 9999,
        used: 0,
        pause: 0,
        cost: 40, // 5% Max HP on Passive, 40 Mana on Active
        desc: "**Total Usage**: `unlimited` (5 rounds cooldown)\n**Cost**: `40`\\💧\n**Timeout**: `yes`\n**Role**: `Support`\n\nMarch 7th is an enthusiastic girl who was saved from eternal ice by the Astral Express Crew. Following the path of Preservation, she's going to make sure that she keeps her allies and herself stay longer in the fight.\n\nEvery **4** rounds, she converts **5%** of her current HP into a shield of **5%** max HP. While this shield is up, her DEF and MR are increased by **20%** and her ATK and MD gain a **30%** increase.\n\nHer active ability will cast her ultimate, Glacial Cascade, which deals **110%** damage and has a **50%** chance of freezing the enemy for **1** round. The enemy is more vulnerable while the enemy is veiled by her ice, taking **20%** extra damage.\n\nIn a party, she shares her defensive passive to her allies, converting **5%** of their max HP into a shield every **5** turns. While this shield is up, they get a **20%** DEF and MR boost, and a **30%** boost in ATK and MD.",
        cost: 40, // 5% Max HP on Passive, 40 Mana on Active
        desc: "**Total Usage**: `unlimited` (5 rounds cooldown)\n**Cost**: `40`\\💧\n**Timeout**: `yes`\n**Role**: `Support`\n\nMarch 7th is an enthusiastic girl who was saved from eternal ice by the Astral Express Crew. Following the path of Preservation, she's going to make sure that she keeps her allies and herself stay longer in the fight.\n\nEvery **4** rounds, she converts **5%** of her current HP into a shield of **5%** max HP. While this shield is up, her DEF and MR are increased by **20%** and her ATK and MD gain a **30%** increase.\n\nHer active ability will cast her ultimate, Glacial Cascade, which deals **110%** damage and has a **50%** chance of freezing the enemy for **1** round. The enemy is more vulnerable while the enemy is veiled by her ice, taking **20%** extra damage.\n\nIn a party, she shares her defensive passive to her allies, converting **5%** of their max HP into a shield every **5** turns. While this shield is up, they get a **20%** DEF and MR boost, and a **30%** boost in ATK and MD.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            if (this.pause > matchStats.round) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                this.used--;
                myStats.sm += 40;
                myStats.sm += 40;
                return matchStats.interaction.followUp({ content: `**${char.name}** needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
            };
            this.pause = matchStats.round + 5;
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** uses Glacial Cascade! She`, { atkMultiplier: 1.1, magicDamage: true });
            if (Math.random() < 0.5) {
                eStats.timeFrozen = true;
                eStats.vulnerability = 1.2;
                myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    eStats.timeFrozen = false;
                    eStats.vulnerability = 1;
                }));
                notice.push(`\n✨ **${enemy.name}** was frozen for 1 round!`);
            };
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => { // Does it need to be a function?
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round % 4 === 0) { // Sacrifice 5% max HP for shield
                if (matchStats.round % 4 === 0) { // Sacrifice 5% max HP for shield
                    myStats.shield += Math.floor(myStats.maxhp * 0.05);
                    myStats.hp -= Math.floor(myStats.hp * 0.05);
                    myStats.hp -= Math.floor(myStats.hp * 0.05);
                };
                if (myStats.shield > 0) {
                    myStats.def += Math.floor(myStats.def * 0.2);
                    myStats.mr += Math.floor(myStats.mr * 0.2);
                    myStats.atk += Math.floor(myStats.atk * 0.3);
                    myStats.md += Math.floor(myStats.md * 0.3);
                    myStats.atk += Math.floor(myStats.atk * 0.3);
                    myStats.md += Math.floor(myStats.md * 0.3);
                };
            }, 9999));
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round % 5 === 0) {
                if (matchStats.round % 5 === 0) {
                    myStats.shield += Math.floor(myStats.maxhp * 0.05);
                    myStats.hp -= Math.floor(myStats.hp * 0.05);
                    myStats.hp -= Math.floor(myStats.hp * 0.05);
                };
                if (myStats.shield > 0) {
                    myStats.def += Math.floor(myStats.def * 0.2);
                    myStats.mr += Math.floor(myStats.mr * 0.2);
                    myStats.atk += Math.floor(myStats.atk * 0.3);
                    myStats.md += Math.floor(myStats.md * 0.3);
                    myStats.atk += Math.floor(myStats.atk * 0.3);
                    myStats.md += Math.floor(myStats.md * 0.3);
                };
            }, 9999));
        },
    },
    "14904": {
        usage: 9999,
        used: 0,
        pause: 0,
        buffID: 0,
        cost: 60,
        desc: "**Total Usage**: `unlimited`, `5 rounds cd`\n**Cost**: `60`\\💧\n**Timeout**: `no`\n**Role**: `Support`\n\nKafka brings a unique set of skills to the table, specialized in both direct damage and DoT effects. Her active ability delivers a potent one-two punch consisting of **120%** physical damage and **70%** magic damage. Her active also doubles any HP debuffs on the enemy for 2 rounds, adding an extra layer of complexity and strategy. However, the 5-round cooldown makes it imperative to use this skill judiciously.\n\nEvery normal attack from Kafka comes with a **35%** chance to inflict Shock, which causes the enemy to take **25%** of the inflicted damage as DoT for the next **4** rounds. If another Shock is applied while one is active, it refreshes the duration of the existing debuff, making her particularly lethal over long engagements.\n\nIn a party, Kafka contributes by offering a **30%** chance each round to deal an additional **60%** damage to enemies. This attack carries a **25%** chance to inflict Shock, dealing **50%** of the inflicted damage over **3** rounds as DoT. This makes her a constant threat that can complement other heavy hitters in the party, as she can whittle down enemy HP steadily over time.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (this.pause > matchStats.round) {
                myStats.sm += this.cost;
                return matchStats.interaction.channel.send(`Kafka needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
            };
            this.pause = matchStats.round + 5;

            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1.2, magicDamage: false });
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.7, magicDamage: true, mdChance: -1 });

            ebuff.hp.forEach((buff) => {
                if ((buff.type === "*" && buff.val < 1) || (buff.type === "+" && buff.val < 0)) ebuff.hp.push(new buffInfo(buff.type, buff.val, Math.min(2, buff.last), buff.change, buff.ctype));
            });
        },
        passive: function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            myStats.replaceButton.atk = {
                "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    const dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                    if (Math.random() < 0.35) {
                        if (ebuff.hp.findIndex((e) => e.id === this.buffID) !== -1) ebuff.hp.splice(ebuff.hp.findIndex((e) => e.id === this.buffID), 1);
                        const shockBuff = new buffInfo("+", -Math.floor(dmg * 0.25), 4);
                        this.buffID = shockBuff.id;
                        ebuff.hp.push(shockBuff);
                        notice.push(`\n✨ **${char.name}** inflicted shock!`);
                    };
                },
            };
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            if (Math.random() < 0.3) {
                let shockDMG = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.6, ignoreShield: true, magicDamage: true });
                if (Math.random() < 0.25) ebuff.hp.push(new buffInfo("+", -Math.floor(shockDMG * 0.5), 3));
            };
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.3) {
                    let shockDMG = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.6, ignoreShield: true, magicDamage: true });
                    if (Math.random() < 0.25) ebuff.hp.push(new buffInfo("+", -Math.floor(shockDMG * 0.5), 3));
                };
            }, 9999));
        },
    },
    "17115": {
        usage: 3,
        used: 0,
        cost: 60,
        selfhealidx: 0,
        desc: "**Total Usage**: `3`\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n**Role**: `Support/DPS`\n\nLuminous, in this form, offers a unique blend of self-sustain, damage amplification, and party support, making her suitable for both individual challenges and team battles.\n\nRight from the onset, Luminous heals **10%** of the damage she deals, which can be amplified by **+2%** with each active use up to **16%**. Her active unleashes a powerful strike causing **140%** damage against monsters, or **115%** against players. Additionally, her offensive capabilities grow with every use of this ability, increasing her ATK and MD by **10%** each time. She also possesses significant defensive strengths, as she inherently takes **15%** reduced damage, making her harder to take down. And when inside the dungeon, she benefits from a **25%** boost to class xp, speeding up her progress.\n\nLuminous' protective nature is not just confined to herself. She extends her protective aura to party members, reducing their damage taken by **15%** and bestowing them with a **5%** healing of their damage dealt. Additionally, for the initial 10 rounds, party members will lose **15** DEF and MR, gaining **2.5%** ATK and MD instead. This dynamic shift promotes an aggressive approach, compelling the team to capitalize on their enhanced damage during the early rounds.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Luminous EX | Lumi EX
            myStats.selfheal[this.selfhealidx] += 0.02; // Increase to max 16% selfheal
            let dungeonBoost = 1.4;
            if (matchStats.interaction.commandName === "arena") dungeonBoost = 1.15;
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: dungeonBoost, magicDamage: true, trueDamage: true, selfHeal: true });

            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.1), 9999));
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.1), 9999));
            myStats.atk += Math.floor(myStats.atk * 0.1);
            myStats.md += Math.floor(myStats.md * 0.1);
        },
        passive: function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            matchStats.xpboost += 0.25;
            myStats.selfhealChance.push(1);
            myStats.selfheal.push(0.1);
            this.selfhealidx = myStats.selfheal.length - 1;

            mybuff.def.push(new buffInfo("+", 155, 9999)); // Takes 15% less damage
            mybuff.mr.push(new buffInfo("+", 155, 9999));
            myStats.def += 155;
            myStats.mr += 155;
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.def.push(new buffInfo("+", 155, 9999)); // Takes 15% less damage
            mybuff.mr.push(new buffInfo("+", 155, 9999));
            myStats.def += 155;
            myStats.mr += 155;
            myStats.selfhealChance.push(1);
            myStats.selfheal.push(0.05);

            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round <= 10) {
                    mybuff.def.push(new buffInfo("+", -15, 9999)); // reduces def by 15 each round, gives 2.5% atk each round, capped at round 10
                    mybuff.mr.push(new buffInfo("+", -15, 9999));
                    mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.025), 9999));
                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.025), 9999));
                };
            }, 9999));
        },
    },
    "17116": {
        usage: 3,
        used: 0,
        cost: 60,
        desc: "**Total Usage**: `3`\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nIsolde's character embodies the archetype of a risk-reward DPS with abilities that grow stronger as she becomes more vulnerable. The pain she endures becomes the bane of her adversaries. The lower her health, the higher the damage she can deal, providing her with a damage boost of up to **40%**. When her HP is dwindling, she can leverage **60%** of her missing HP to deal damage. After she vents her pain onto the enemy, Isolde regains **33%** of her missing HP.\n\nIsolde is not just a powerhouse, she's also quick on her feet. She has a **14-28%** chance to counter any attack aimed at her depending on her HP, which also decreases enemy DEF and MR by **8%** for **3** rounds if successful, making her not only a major threat offensively but also a character that can surprise her adversaries with unexpected retaliation. Moreover, her drive and dedication in dungeons reflect as she gains **25%** more class XP.\n\nIsolde's presence on the battlefield is not only motivating but also enhancing. For the first 10 rounds, she pushes her allies, gradually increasing their ATK and MD by **2.5%** every round. This culminates in a significant **25%** boost by the 10th round, making the entire party a force to be reckoned with as the battle progresses.\n\nIn essence, Isolde is a character of defiance. The closer she is to defeat, the stronger she becomes, and her ability to turn the tables in dire situations makes her an invaluable asset to any team.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            const dmg = (eStats.def + eStats.mr < 100000) ? Math.floor((myStats.maxhp - myStats.hp) * 0.6) : 0;
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ ${char.name}`, { overwriteDamage: dmg, magicDamage: true, dodge: false });
            myStats.hp += Math.floor((myStats.maxhp - myStats.hp) * 0.33);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.xpboost += 0.25;
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < (0.14 + (0.14 * (1 - (myStats.hp / myStats.maxhp))))) {
                    myStats.counter = Math.max(1, myStats.counter ?? 0);
                    ebuff.def.push(new buffInfo("*", 0.92, 3));
                    ebuff.mr.push(new buffInfo("*", 0.92, 3));
                }
                myStats.atk += Math.floor(myStats.atk * 0.4 * (1 - (myStats.hp / myStats.maxhp)));
                myStats.md += Math.floor(myStats.md * 0.4 * (1 - (myStats.hp / myStats.maxhp)));
            }, 9999));
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.atk += Math.floor(myStats.atk * (0.025 * Math.min(matchStats.round, 10)));
                myStats.md += Math.floor(myStats.md * (0.025 * Math.min(matchStats.round, 10)));
            }, 9999));
        },
    },
    "17117": {
        usage: 3,
        used: 0,
        cost: 80,
        desc: "**Total Usage**: `unlimited`, `unlimited`, `3`\n**Mana**: `10-20`\\💧, `20-30`\\💧, `80-100`\\💧\n**Timeout**: `yes`, `yes`, `yes`\n**Role**: `DPS/Support`\n\nRudeus Greyrat encapsulates the progression and versatility of a mage that requires keen management of his considerable mana pool said to rival that of the ancient Demon God Laplace. His mana generation is increased by **+20** as well, reflecting his proficiency and natural talent in magic. And as the fight continues, Rudeus keeps learning and growing as a mage, increasing the potency of his spells on the 5th and 10th rounds each. His 3 spells are as follows:\n\n**Stone Cannon**: Rudeus can utilize this spell to fire a powerful projectile at his opponent. Notably, this attack has both a physical and magical damage component, dealing **100-120%** magic damage, and an additional **10-20%** physical damage caused by the impact. If Rudeus is low on mana only the physical impact will cause damage.\n\n**Quagmire**: Upon casting, Rudeus will drastically increase his dodge rate to **50-75%**, making him harder to hit in the subsequent round. It also weakens the opponent, reducing their DEF and MR by **15-25%** the next round.\n\n**Electric**: Electric channels a surge of magical energy to electrocute the opponent. A high cost high damage spell with limited use, dealing **150-200%** magic damage to the opponent.\n\nIn a party, Rudeus offers a unique advantage backing his party members from the rear. He has a **30%** chance to intervene randomly, delivering a magical blow to the enemy dealing **60%** magic damage and reducing enemy DEF and MR by **10%** for 2 rounds.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            let atkbuff = 1.5, mana_cost = 0;
            if (matchStats.round > 10) atkbuff = 2, mana_cost = 20;
            else if (matchStats.round > 5) atkbuff = 1.75, mana_cost = 10;

            if (this.cost + mana_cost > myStats.sm) {
                matchStats.interaction.channel.send(`You don't have enough mana! (**${myStats.sm}**/${this.cost + mana_cost}<:mana:1047269152957661255>)`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                return myStats.sm += this.cost;
            };
            myStats.sm -= mana_cost;

            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:stormbolt:1068649152898154546> **${char.name}**`, { atkMultiplier: atkbuff, mdChance: -1, magicDamage: true, dodge: false, trueDamage: true });
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            // Mana Boost
            myStats.mana += 500;
            mybuff.mg.push(new buffInfo("+", 20, 9999));
            myStats.mg += 20;

            // Electric
            myStats.replaceButton.ability = { "emoji": "<:stormbolt:1068649152898154546>" };

            // Stone Cannon
            myStats.replaceButton.atk = {
                "emoji": "<:stone_cannon:1140023818254028982>",
                "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    let mana_cost = 10, normal_dmg = 0.1, magic_damage = 1;
                    if (matchStats.round > 10) mana_cost = 20, normal_dmg = 0.4, magic_damage = 1.2;
                    else if (matchStats.round > 5) mana_cost = 15, normal_dmg = 0.2, magic_damage = 1.1;

                    if (mana_cost > myStats.sm) return dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}** is out of mana and`, { atkMultiplier: normal_dmg, magicDamage: false });

                    myStats.sm -= mana_cost;
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:stone_cannon:1140023818254028982> **${char.name}**`, { atkMultiplier: magic_damage, magicDamage: true, mdChance: -1 }); // normal magical damage
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:stone_cannon:1140023818254028982> **${char.name}**`, { atkMultiplier: normal_dmg, magicDamage: false }); // 10% physical damage
                },
            };

            // Quagmire
            myStats.replaceButton.def = {
                "emoji": "<:quagmire:1140026835225292841>",
                "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    let mana_cost = 20, dodge_buff = 0.5, def_debuff = 0.15;
                    if (matchStats.round > 10) mana_cost = 30, dodge_buff = 0.75, def_debuff = 0.25;
                    else if (matchStats.round > 5) mana_cost = 25, dodge_buff = 0.625, def_debuff = 0.2;

                    if (mana_cost > myStats.sm) matchStats.interaction.channel.send(`You don't have enough mana! (**${myStats.sm}**/${mana_cost}<:mana:1047269152957661255>)`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));

                    myStats.sm -= mana_cost;
                    myStats.dodge = dodge_buff;
                    ebuff.dodge.push(new buffInfo("=", 0, 3));
                    ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * def_debuff), 2));
                    ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * def_debuff), 2));
                    eStats.dodge = 0;
                    eStats.def -= Math.floor(eStats.def * def_debuff);
                    eStats.mr -= Math.floor(eStats.mr * def_debuff);
                    notice.push(`\n<:quagmire:1140026835225292841> **${char.name}** decreased enemy's DEF and MR by **${def_debuff * 100}%** for **2** turns!`);
                },
            };

        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            if (Math.random() < 0.3) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.6, ignoreShield: true, magicDamage: true, mdChance: -1 });
                ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * 0.1), 2));
                ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.1), 2));
                eStats.def -= Math.floor(eStats.def * 0.1);
                eStats.mr -= Math.floor(eStats.mr * 0.1);
            };
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.3) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.6, ignoreShield: true, magicDamage: true, mdChance: -1 });
                    ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * 0.1), 2));
                    ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.1), 2));
                    eStats.def -= Math.floor(eStats.def * 0.1);
                    eStats.mr -= Math.floor(eStats.mr * 0.1);
                };
            }, 9999));
        },
    },
    "17583": {
        usage: 0,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `0`\n**Mana**: `0`\\💧\n**Timeout**: `no`\n**Role**: `Farming`\n\nUsing his ultimate skill Beelzebub, Raphael can end a fight in an instant, devouring his enemy. Enemies with less than half of his own EP will lose immediately as soon as the fight begins.",
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.ep / eStats.ep >= 2) {
                eStats.hp = 0;
                notice.push(`\n✨ **${char.name}** used Beelzebub to consume **${enemy.name}**!`);
            };
        },
    },
    "17686": {
        usage: 3,
        used: 0,
        cost: 50,
        desc: "**Total Usage**: `3`\n**Mana**: `50`\\💧 on first 2 usages, `80`\\💧 on 3rd usage\n**Timeout**: `yes`\n**Role**: `DPS/Support`\n\nEscanor, known as the Lion's Sin of Pride, offers a gameplay style tied to a day-night cycle which changes every **3** rounds, with fluctuating power levels between them. During daytime rounds, Escanor can use `Crazy Prominence` with his first two usages, dealing additional damage based on the percentage of his remaining health (**100%** + **1%** damage for every **2%** remaining HP). With his 3rd and last usage, Escanor unleashes `Final Prominence`, which significantly enhances his damage output based on the percentage of his missing health (**100%** + **1%** damage for every **1%** missing HP).\n\nEscanor's power dramatically shifts with the day-night cycle. During the day, he gains a **20%** boost to attack, magic damage, defense, and magic resistance, but loses **4%** of his max HP per round due to the strain to his body. As the night falls, he loses **20%** of attack, magic damage, defense, and magic resistance instead, but gains **12%** dodge chance.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            let roundTime = (matchStats.round - 1) % 6; // day: [0, 1, 2], night: [3, 4, 5];

            // Check if day time
            if (roundTime > 2) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.interaction.channel.send(`${this.used === 3 ? "Final Prominence" : "Crazy Prominence"} can only be used during day time (in ${6 - roundTime} rounds)`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                myStats.sm += this.cost;
                this.used--;
                return;
            };

            // Check if enough mana
            let mana_cost = (this.used === 3) ? 30 : 0;
            if (this.cost + mana_cost > myStats.sm) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.interaction.channel.send(`You don't have enough mana! (**${myStats.sm}**/${this.cost + mana_cost}<:mana:1047269152957661255>)`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                myStats.sm += this.cost;
                this.used--;
                return;
            };
            myStats.sm -= mana_cost;

            let atkbuff = 1;
            if (this.used === 3) { // Final Prominence: Every 1% missing HP -> +1% damage
                atkbuff += (1 - (myStats.hp / myStats.maxhp));
            } else { // Crazy Prominence: Every 2% remaining HP -> +1% damage
                atkbuff += ((myStats.hp / myStats.maxhp) / 2);
            };

            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used ${this.used === 3 ? "Final Prominence" : "Crazy Prominence"}! He`, { atkMultiplier: atkbuff, mdChance: -1, magicDamage: true, dodge: false, trueDamage: true });
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // day time buff
            myStats.atk += Math.floor(myStats.atk * 0.2);
            myStats.md += Math.floor(myStats.md * 0.2);
            myStats.def += Math.floor(myStats.def * 0.2);
            myStats.mr += Math.floor(myStats.mr * 0.2);

            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                let roundTime = (matchStats.round - 1) % 6; // day: [0, 1, 2], night: [3, 4, 5];
                if (roundTime < 3) { // day
                    myStats.atk += Math.floor(myStats.atk * 0.2);
                    myStats.md += Math.floor(myStats.md * 0.2);
                    myStats.def += Math.floor(myStats.def * 0.2);
                    myStats.mr += Math.floor(myStats.mr * 0.2);
                    myStats.hp -= Math.floor(myStats.maxhp * 0.04);
                    if (myStats.hp < 0) myStats.hp = 0;
                } else {
                    myStats.atk -= Math.floor(myStats.atk * 0.2);
                    myStats.md -= Math.floor(myStats.md * 0.2);
                    myStats.def -= Math.floor(myStats.def * 0.2);
                    myStats.mr -= Math.floor(myStats.mr * 0.2);
                    myStats.dodge += 0.12;
                    if (myStats.dodge > 1) myStats.dodge = 1;
                };
            }, 9999));
        },
    },
    "17688": {
        usage: 9999,
        used: 0,
        cost: 0,
        damageReduced: 0,
        domainLastRound: 0,
        hasArtemis: false,
        usedDef: 0,
        desc: "**Total Usage**: `1`\n**Mana**: `150`\\💧, lasts 10 rounds\n**Timeout**: `no`\n**Role**: `DPS`\n\nApollo EX brings in a dynamic and sustained damage and utility with her intricate set of abilities that empowers her over the course of a prolonged battle. Her active ability, `Domain of Ascendancy`, transforms the battlefield for 10 rounds. During this period, her stats get a substantial **20%** boost and she absorbs **33%** of the damage and stores it to release upon exiting her domain. Additionally, she replaces her ATK, DEF and ABILITY for the duration of her Domain. Her normal attacks deal guaranteed  critical hits and true damage. Her DEF becomes impervious, absorbing **100%** of the damage on the next round, and her ABILITY applies a vulnerability debuff on enemies, increasing the damage they take by **15%** with every use (or **25%** if **Artemis EX** is owned). The enemy also suffers from bleed, losing up to **3%** of their max HP over time, or **6%** of the users HP if the enemy has more than twice the HP.\n\nApollo EX can evade a fatal attack once per battle and execute her enemies when their HP drops below **10%**. Her normal attacks deal both physical and magic damage, **60%** of each, with a **20%** chance of causing the enemy to bleed for **3** rounds. Additionally, she'll gain **25%** more XP from the dungeon.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {

            const domainLast = 10, defaultReduction = 0.33, mana_cost = 150;

            // Check if enough mana
            if (mana_cost > myStats.sm) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.interaction.channel.send(`You don't have enough mana! (**${myStats.sm}**/${mana_cost}<:mana:1047269152957661255>)`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                this.used--;
                return;
            };

            // Domain activation
            if (this.used > 1) {
                if (matchStats.round < this.domainLastRound) {
                    if (!eStats.vulnerability) eStats.vulnerability = 1;
                    eStats.vulnerability += this.hasArtemis ? 0.25 : 0.15;
                    notice.push(`\n✨ **${this.hasArtemis ? "Artemis" : char.name}** applied vulnerability, **${enemy.name}** will now take **${Math.round((eStats.vulnerability - 1) * 100)}%** more damage for the duration of the domain`);
                } else {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    matchStats.interaction.channel.send(`Domain of Ascendancy can only be used once`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                    this.used--;
                    return;
                };
            };

            if (this.used === 1) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                myStats.sm -= mana_cost;

                this.domainLastRound = matchStats.round + domainLast;
                myStats.damageReduction = defaultReduction;

                // Apply Bleed until domain ends
                const bleed = eStats.hp > 2 * myStats.hp ? myStats.hp * 0.06 : eStats.hp * 0.03;
                ebuff.hp.push(new buffInfo("+", -bleed, 3));

                // Stat boosts
                myStats.atk += Math.floor(myStats.atk * 0.2);
                myStats.md += Math.floor(myStats.md * 0.2);
                myStats.def += Math.floor(myStats.def * 0.2);
                myStats.mr += Math.floor(myStats.mr * 0.2);
                myStats.cr += 0.2;
                if (myStats.cr > 1) myStats.cr = 1;
                myStats.cd += 0.2;
                myStats.dodge += 0.1;
                if (myStats.dodge > 1) myStats.dodge = 1;
                myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    myStats.atk += Math.floor(myStats.atk * 0.2);
                    myStats.md += Math.floor(myStats.md * 0.2);
                    myStats.def += Math.floor(myStats.def * 0.2);
                    myStats.mr += Math.floor(myStats.mr * 0.2);
                    myStats.cr += 0.2;
                    if (myStats.cr > 1) myStats.cr = 1;
                    myStats.cd += 0.2;
                    myStats.dodge += 0.1;
                    if (myStats.dodge > 1) myStats.dodge = 1;
                }, domainLast - 1));

                // Replace ATK
                myStats.replaceButton.atk = {
                    "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { atkMultiplier: 0.6, critChance: -1, combodmg: true, selfdmg: true, selfheal: true, trueDamage: true });
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { atkMultiplier: 0.6, critChance: -1, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true, trueDamage: true });

                        // Cause Bleed
                        if (0.2 > Math.random()) {
                            const bleed = eStats.hp > 2 * myStats.hp ? myStats.hp * 0.06 : eStats.hp * 0.03;
                            ebuff.hp.push(new buffInfo("+", -bleed, 3));
                        };
                    },
                };

                // Replace DEF
                myStats.replaceButton.def = {
                    "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        this.usedDef++;
                        myStats.damageReduction = 1;
                        myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                            myStats.damageReduction = defaultReduction;
                        }));
                        notice.push(`\n🛡️ **${char.name}** will absorb **100%** of the next attack!`);
                    },
                };

                // When Domain Ends
                myStats.delayedBuffs.push(new delayedBuffs(this.domainLastRound, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** left her Domain of Ascendancy! She`, { atkMultiplier: ((domainLast * defaultReduction) + (this.usedDef * (1 - defaultReduction))), magicDamage: true });

                    eStats.vulnerability = 1;

                    // Reset buttons
                    delete myStats.replaceButton.def;
                    myStats.replaceButton.atk = {
                        "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { atkMultiplier: 0.6, combodmg: true, selfdmg: true, selfheal: true });
                            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { atkMultiplier: 0.6, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });

                            // Cause Bleed
                            if (0.2 > Math.random()) {
                                const bleed = eStats.hp > 2 * myStats.hp ? myStats.hp * 0.06 : eStats.hp * 0.03;
                                ebuff.hp.push(new buffInfo("+", -bleed, 3));
                            };
                        },
                    };
                }));

                notice.push(`\n✨ **${char.name}** activated her Domain of Ascendancy.`);
            };
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            // User has Artemis?
            const { 0: stats } = await query(`SELECT chars FROM characters WHERE id = ${matchStats.interaction.user.id}`);
            this.hasArtemis = JSON.parse(stats.chars).includes(17689);

            // Boost XP
            matchStats.xpboost += 0.25;

            // Evade a deadly attack once
            myStats.evadeDeathStrike = 1;
            myStats.evadeDeathChance = 1;

            // Execute when below 10% HP
            myStats.executeHP = Math.max(0.1, myStats.executeHP);

            // Normal attack deals both physical and magic damage (60% each)
            myStats.replaceButton.atk = {
                "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { atkMultiplier: 0.6, combodmg: true, selfdmg: true, selfheal: true });
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { atkMultiplier: 0.6, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });

                    // Cause Bleed
                    if (0.2 > Math.random()) {
                        const bleed = eStats.hp > 2 * myStats.hp ? myStats.hp * 0.06 : eStats.hp * 0.03;
                        ebuff.hp.push(new buffInfo("+", -bleed, 3));
                    };
                },
            };
        },
    },
    "17689": {
        usage: 9999,
        used: 0,
        cost: 0,
        damageReduced: 0,
        domainLastRound: 0,
        hasApollo: false,
        usedDef: 0,
        desc: "**Total Usage**: `1`\n**Mana**: `150`\\💧, lasts 5 rounds\n**Timeout**: `no`\n**Role**: `Support`\n\nArtemis EX wields the `Domain of Sanction`, a fearsome realm where she holds dominion over the very fabric of reality. When activated, her domain lasts for **5** rounds and halts her enemy's actions, effectively stopping time. Within this domain, her opponent suffer a **25%** vulnerability debuff. Her DEF extends the duration of all debuffs on the enemy by an additional round, and her ABILITY deals **130%** damage (**145%** if **Apollo EX** is owned), and applies a bleed effect that lasts for the entire duration of the domain if **Apollo EX** is owned. Additionally she depletes the enemy's mana completely and blocks mana generation for 5 rounds upon exiting her domain.\n\nArtemis recovers **5%** of her max HP and steals **3** mana from her enemy every round. If defeated, she can revive once with **40%** of her max HP. Her normal attacks deal both physical and magic damage, **60%** of each, with a **33%** chance (**66%** if domain is active) of inflicting a debuff. The debuffs include **burn** dealing **3%** of max HP as damage (or **6%** of her own HP if enemy has twice as much HP), **impair** decreasing DEF and MR by **15%**, **poison** decreasing **ATK** and **MD** by **15%**, and **paralyse** which prevents the enemy from attacking once. Additionally, she'll gain **20%** more XP from the dungeon.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {

            const domainLast = 5, mana_cost = 150;

            // Check if enough mana
            if (mana_cost > myStats.sm) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.interaction.channel.send(`You don't have enough mana! (**${myStats.sm}**/${mana_cost}<:mana:1047269152957661255>)`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                this.used--;
                return;
            };

            // Domain activation
            if (this.used > 1) {
                if (matchStats.round < this.domainLastRound) {
                    if (this.hasApollo) {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **Apollo**`, { atkMultiplier: 1.45, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                        if (ebuff.hp.findIndex((e) => e.id === this.bleedId) !== -1) ebuff.hp.splice(ebuff.hp.findIndex((e) => e.id === this.bleedId), 1);
                        const bleed = eStats.hp > 2 * myStats.hp ? myStats.hp * 0.04 : eStats.hp * 0.02;
                        const bleedBuff = new buffInfo("+", -bleed, (this.domainLastRound - matchStats.round));
                        this.bleedId = bleedBuff.id;
                        ebuff.hp.push(bleedBuff);
                        notice.push(`\n✨ **${this.hasApollo ? "Apollo" : char.name}** applied bleed`);
                    } else {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1.3, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                    };
                } else {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    matchStats.interaction.channel.send(`Domain of Sanction can only be used once`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                    this.used--;
                    return;
                };
            };

            if (this.used === 1) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                myStats.sm -= mana_cost;
                this.domainLastRound = matchStats.round + domainLast;

                // Apply Vulnerability, Freeze Time
                eStats.vulnerability = 1.25;
                eStats.timeFrozen = true;
                eStats.frozenMessage = "is frozen in time";

                // Replace ATK
                myStats.artemisDomainUsedRound = matchStats.round;

                // Replace DEF
                myStats.replaceButton.def = {
                    "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        Object.keys(ebuff).forEach((stat) =>
                            ebuff[stat].forEach((buff) => {
                                if ((buff.type === "*" && buff.val < 1) || (buff.type === "+" && buff.val < 0)) buff._last++;
                            }),
                        );
                        notice.push(`\n🛡️ **${char.name}** extended all debuffs on the enemy by 1 round!`);
                    },
                };

                // When Domain Ends
                myStats.delayedBuffs.push(new delayedBuffs(this.domainLastRound, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    // Reset Vulnerability and freeze
                    eStats.vulnerability = 1;
                    eStats.timeFrozen = false;

                    // Deplete enemy mana
                    eStats.sm = 0;
                    ebuff.sm.push(new buffInfo("=", 0, 5));

                    // Reset buttons
                    delete myStats.replaceButton.def;
                    // myStats.replaceButton.atk = myStats.replaceButton.atkCopy;
                }));

                notice.push(`\n✨ **${char.name}** activated her Domain of Sanction.`);
            };
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            // User has Apollo?
            const { 0: stats } = await query(`SELECT chars FROM characters WHERE id = ${matchStats.interaction.user.id}`);
            this.hasApollo = JSON.parse(stats.chars).includes(17688);

            // Boost XP
            matchStats.xpboost += 0.2;

            // Heals 5% of max HP per round
            mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.05), 9999));

            // Revives once with 50% HP
            myStats.maxRevivals = 1;
            myStats.revhp = 0.4;
            myStats.rev += 1;

            // Steals 3 mana per round
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const stealMana = Math.min(3, eStats.sm);
                eStats.sm -= stealMana;
                myStats.sm += stealMana;
                if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
            }, 9999));

            // Normal attack deals both physical and magic damage (60% each)
            myStats.replaceButton.atk = {
                "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { atkMultiplier: 0.6, combodmg: true, selfdmg: true, selfheal: true });
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { atkMultiplier: 0.6, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });

                    // Debuffs
                    if ((((myStats.artemisDomainUsedRound + 10) >= matchStats.round) ? 0.66 : 0.33) > Math.random()) {
                        const debuffType = Math.floor(4 * Math.random());
                        if (debuffType === 0) { // Burn
                            if (ebuff.hp.findIndex((e) => e.id === this.burnId) !== -1) ebuff.hp.splice(ebuff.hp.findIndex((e) => e.id === this.burnId), 1);
                            const burn = eStats.hp > 2 * myStats.hp ? myStats.hp * 0.06 : eStats.hp * 0.03;
                            const burnBuff = new buffInfo("+", -burn, 2);
                            this.burnId = burnBuff.id;
                            ebuff.hp.push(burnBuff);
                        } else if (debuffType === 1) { // Impair
                            if (ebuff.def.findIndex((e) => e.id === this.impairDefId) !== -1) ebuff.def.splice(ebuff.def.findIndex((e) => e.id === this.impairDefId), 1);
                            if (ebuff.mr.findIndex((e) => e.id === this.impairMrId) !== -1) ebuff.mr.splice(ebuff.mr.findIndex((e) => e.id === this.impairMrId), 1);
                            const impairDefBuff = new buffInfo("*", 0.85, 2);
                            const impairMrBuff = new buffInfo("*", 0.85, 2);
                            this.impairDefId = impairDefBuff.id;
                            this.impairMrId = impairMrBuff.id;
                            ebuff.def.push(impairDefBuff);
                            ebuff.mr.push(impairMrBuff);
                        } else if (debuffType === 2) { // Poison
                            if (ebuff.atk.findIndex((e) => e.id === this.poisonAtkId) !== -1) ebuff.atk.splice(ebuff.atk.findIndex((e) => e.id === this.poisonAtkId), 1);
                            if (ebuff.md.findIndex((e) => e.id === this.poisonMdId) !== -1) ebuff.md.splice(ebuff.md.findIndex((e) => e.id === this.poisonMdId), 1);
                            const poisonAtkBuff = new buffInfo("*", 0.85, 2);
                            const poisonMdBuff = new buffInfo("*", 0.85, 2);
                            this.poisonAtkId = poisonAtkBuff.id;
                            this.poisonMdId = poisonMdBuff.id;
                            ebuff.atk.push(poisonAtkBuff);
                            ebuff.md.push(poisonMdBuff);
                        } else if (debuffType === 3) { // Paralyse
                            matchStats.turn = matchStats.turnSkill ? 0 : 1;
                        };
                    };
                },
            };
            // myStats.replaceButton.atkCopy = myStats.replaceButton.atk;
        },
    },
    "17742": {
        usage: 9999,
        used: 0,
        cost: 60,
        stacks: 1,
        pause: -5,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `60`\\💧\n**Timeout**: `Yes`\n**Role**: `DPS/Support`\n\nAh, so you want to know about my abilities, huh? Well, let me tell you, all those formal descriptions are just too dull, aren't they? I mean, who needs all that jargon when you can have a bit of fun, right? So, here's the deal with my kit, straight from the Yorozuya's mouth!\n\nFirst up, we've got my passive. You see, I'm not really into the whole training thing. I prefer just to match the level of the toughest guy around. Makes life easier, you know? Every turn, I get this itch to swing my sword a bit harder and aim a bit sharper. That's me increasing my attack and crit rate by **5%**, stacking up to **5** times. But when I'm really pushed to the edge, like under **30%** HP, I get a surge of \"I-don't-wanna-die\" energy, and suddenly I'm hitting **50%** harder- Well my carelessness does expose me to receiving **20%** more DMG as well. Oops.\n\nNow, let's talk about my active! When things get too hot, I switch to an endurance mode for **4 rounds**. It's like playing a game of chicken with the enemy. **33%** of the damage coming my way? I just shrug it off and store it as `Injuries`. And while I'm at it, there's a **25%** chance I'll just casually counter an attack. Cool, right? But here's the catch: when my endurance mode times out, those `Injuries` I shrugged off earlier come back to haunt me over the next **10 rounds**.\n\nLastly, my party ability lets me share the endurance, but spare the pain. You see, I'm a team player when I feel like it. Every **3 rounds**, I let my allies experience my Endurance mode for a turn, minus the annoying part where you pay for it later. It's my way of saying, \"Here, have some fun, but don't worry about the consequences.\"\n\nSo, that's me in a nutshell. A lazy samurai who somehow avoids hard work. Remember, it's not about how strong your abilities are, it's about how you use them... or avoid using them, in my case.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Gintoki EX
            if (this.pause > matchStats.round) {
                myStats.sm += this.cost;
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.interaction.channel.followUp({ content: `Gintoki needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                this.used--;
                return;
            };
            this.pause = matchStats.round + 4;

            const domainLast = 4;

            // Enter Endurance Mode
            myStats.putDamageOnHold = 0.33; // 33%
            if (Math.random() < 0.25) myStats.counter += 1;
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                // Chance to counter
                if (Math.random() < 0.25) myStats.counter += 1;
            }, domainLast - 1));

            // When Endurance Mode Ends
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + domainLast, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (myStats.damageOnHold) {
                    const dmg = Math.floor(myStats.damageOnHold / 10);
                    myStats.hp -= dmg;
                    if (myStats.hp < 0) myStats.hp = 0;
                    mybuff.hp.push(new buffInfo("+", -dmg, 9));
                };

                myStats.putDamageOnHold = 0;
                myStats.damageOnHold = 0;
            }));

            notice.push(`\n✨ **${char.name}** entered endurance mode!`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.gintokiStacks = 0;
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.atk += Math.floor(myStats.atk * (myStats.gintokiStacks * 0.05));
                myStats.md += Math.floor(myStats.md * (myStats.gintokiStacks * 0.05));
                myStats.cr += myStats.gintokiStacks * 0.05;
                if (myStats.cr > 1) myStats.cr = 1;
                myStats.gintokiStacks = Math.min(5, myStats.gintokiStacks + 1);

                // Enraged
                if ((myStats.hp / myStats.maxhp) < 0.3) {
                    myStats.vulnerability = 1.2;
                    eStats.vulnerability = 1.5;
                } else {
                    myStats.vulnerability = 1;
                    eStats.vulnerability = 1;
                };
            }, 9999));
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round % 3 === 0) {

                    // Enter Endurance Mode
                    myStats.putDamageOnHold = 0.33; // 33%
                    if (Math.random() < 0.25) myStats.counter += 1;

                    // When Endurance Mode Ends
                    const domainLast = 1;
                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + domainLast, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        myStats.putDamageOnHold = 0;
                    }));

                    notice.push(`\n✨ **${char.name}** entered endurance mode!`);
                };
            }, 9999));
        },
    },
    "18011": {
        usage: 9999,
        used: 0,
        cost: 0,
        stacks: 1,
        pause: -5,
        desc: "**Total Usage**: `5`/`3`/`2`/`3`\n**Mana**: `30`\\💧/`60`\\💧/`50`\\💧/`70`\\💧\n**Timeout**: `no`/`yes`/`no`/`yes`\n**Role**: `Support/DPS/Tank/DPS`\n\nLria stands out not just for her extraordinary abilities, but for her unyielding spirit and versatile skills. She possesses a unique blend of skills that make her adaptable to various combat situations by harnessing the powers of the mystical masks she has acquired through her daring ventures.\n\n**Maskless Form**\n- This form showcases lria's exceptional agility and keen sense of anticipation. When activated, she gains **20%** dodge chance for 3 rounds. If she successfully dodges an attack during this period, she gains a temporary boost of **20%** ATK for her next attack. Additionally, she heal **5%** of her max HP after successful dodges, and has **10%** increased DEF. This is her default form, and can be selected with the command `/item equip item:remove mask`.\n\n**Phantasmal Deathmask**\n- When Lria dons the Phantasmal Deathmask, she becomes an avatar of Morithia, the Underworld Sovereign. Her pact cloaks her in an ethereal aura, bolstering her MR by **25%** and causing her strikes to inherently deal magic damage. Her normal attacks carry a **30%** chance to afflict the enemy with `Haunt`, a dread curse dealing an additional **5%** magic damage for **4 rounds**. Using her active, she lashes out at enemies, dealing **120%** magic damage and invoking `Soul Drain`, which siphons **5%** the equivalent of **5%** of her max HP from the enemy for 2 rounds, converting it into **5** mana for Lria. In a party, she increases the party's MD by **20%** for **4** rounds. If Artemis EX is present, this buff is increased to **25%** and lasts 5 rounds. Additionally, she heals allies for **10%** of the damage they deal. This mask can be equipped using the command `/item equip item:phantasmal mask`.\n\n**Verdant Guardian Mask**\n- When Lria adorns the Verdant Guardian Mask, she invokes the power of Sylvaria, Goddess of the Forest. She is granted a **20%** increase in DEF and MR, and a **10%** increase in block rate. After using her active, she absorbs **30%** of incoming damage and recovers **5%** of her max HP for 3 rounds. In a party, Lria grants her team a **20%** increase in DEF and MR for **4** rounds and regenerating **3%** of their max HP every round. If Apollo EX is in her party, she increases MD by **10%** and her healing buff is increased to **5%**. This mask can be equipped using the command `/item equip item:verdant mask`.\n\n**Valkyrie's Battle Mask**\n- Wearing the Valkyrie's Battle Mask, Lria's ATK is increased by **20%**. When her health falls below **10%** of max HP, she triggers `Final Gambit`, a devastating counterattack that Lria can unleash once per battle, delivering a powerful strike with of **200%** damage. When using her active, she unleashes **3-6** attacks that deal **30%** physical damage each. Each strike has a **25%** chance to inflict `Warrior's Bleed` on the enemy, causing an additional **5%** of Lria's ATK as damage for **3** rounds. In a party, Lria boosts her team's offensive capabilities, granting a **25%** increase in **ATK** and a **15%** in CD.  In the absence of Apollo EX and Artemis EX, Lria's combat spirit intensifies, unlocking `Lone Valkyrie's Might`. This further enhances the team's offensive prowess, adding an extra **10%** to her CD buff. This mask can be equipped using the command `/item equip item:valkyrie mask`.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Lria EX
            let mask = myStats.maskinfo;

            if (mask === undefined) { // Maskless
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                if (this.used > 5) {
                    matchStats.interaction.followUp({ content: `You can use **${char.name}**'s ability only **5** times per fight.`, ephemeral: true });
                    this.used--;
                    return;
                };

                let activeCost = 30;
                if (myStats.sm < activeCost) {
                    matchStats.interaction.followUp({ content: `You don't have enough mana! (**${myStats.sm}**/${activeCost}\\💧)`, ephemeral: true });
                    this.used--;
                    return;
                };
                myStats.sm -= activeCost;

                myStats.dodge += 0.2;
                if (myStats.dodge > 1) myStats.dodge = 1;
                mybuff.dodge.push(new buffInfo("+", 0.2, 2));

                // Dodge Buff Last
                matchStats.dodgebuffLast = 1;
                matchStats.dodgebuff = 0.2;
                myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 3 /* 3 rounds */, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    delete matchStats.dodgebuffLast;
                    delete matchStats.dodgebuff;
                }));

                notice.push(`\n✨ **${char.name}** increased dodge by **20%** for the next 2 rounds!`);
            } else if (mask === "phantasmal") { // Phantasmal Deathmask
                if (this.used > 3) {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    matchStats.interaction.followUp({ content: `You can use **${char.name}**'s ability only **3** times per fight.`, ephemeral: true });
                    this.used--;
                    return;
                };

                let activeCost = 60;
                if (myStats.sm < activeCost) {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    matchStats.interaction.followUp({ content: `You don't have enough mana! (**${myStats.sm}**/${activeCost}\\💧)`, ephemeral: true });
                    this.used--;
                    return;
                };
                myStats.sm -= activeCost;

                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1.2, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });

                ebuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp * 0.05), 2));
                mybuff.sm.push(new buffInfo("+", 5, 2));
            } else if (mask === "verdant") { // Verdant Guardian Mask
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                if (this.used > 2) {
                    matchStats.interaction.followUp({ content: `You can use **${char.name}**'s ability only **2** times per fight.`, ephemeral: true });
                    this.used--;
                    return;
                };

                let activeCost = 50;
                if (myStats.sm < activeCost) {
                    matchStats.interaction.followUp({ content: `You don't have enough mana! (**${myStats.sm}**/${activeCost}\\💧)`, ephemeral: true });
                    this.used--;
                    return;
                };
                myStats.sm -= activeCost;

                let prevReduction = myStats.damageReduction;
                myStats.damageReduction = 0.3;

                mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.05), 3));

                myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 3 /* 3 rounds */, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    myStats.damageReduction = prevReduction;
                }));

                notice.push(`\n✨ **${char.name}** will take **30%** less damage and heal **5%** of her max HP for the next 3 rounds!`);
            } else if (mask === "valkyrie") { // Valkyrie's Battle Mask
                if (this.used > 3) {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    matchStats.interaction.followUp({ content: `You can use **${char.name}**'s ability only **3** times per fight.`, ephemeral: true });
                    this.used--;
                    return;
                };

                let activeCost = 70;
                if (myStats.sm < activeCost) {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    matchStats.interaction.followUp({ content: `You don't have enough mana! (**${myStats.sm}**/${activeCost}\\💧)`, ephemeral: true });
                    this.used--;
                    return;
                };
                myStats.sm -= activeCost;

                let attacksTotal = 3 + Math.floor(Math.random() * 4); // 3-6 attacks
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** attacked **${attacksTotal}** times! She`, { atkMultiplier: 0.3 * attacksTotal, magicDamage: false, combodmg: true, selfdmg: true, selfheal: true });
                for (let i = 0; i < attacksTotal; i++) {
                    if (Math.random() < 0.25) ebuff.hp.push(new buffInfo("+", -Math.floor(myStats.atk * 0.05), 3));
                };
            };
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            let mask = myStats.maskinfo;

            if (mask === undefined) { // Maskless
                mybuff.def.push(new buffInfo("+", Math.floor(myStats.def * 0.1), 9999));
                myStats.def += Math.floor(myStats.def * 0.1);
                myStats.dodgeHeal = 0.05;
            } else if (mask === "phantasmal") { // Phantasmal Deathmask
                myStats.thumbnail = "https://i.imgur.com/vKmnIqq.png";

                myStats.mdChance = 1;
                mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr * 0.25), 9999));
                myStats.mr += Math.floor(myStats.mr * 0.25);

                // Normal attack deals both physical and magic damage (60% each)
                myStats.replaceButton.atk = {
                    "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        let dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });

                        // Debuff
                        if (Math.random() < 0.3) {
                            ebuff.hp.push(new buffInfo("+", -Math.floor(dmg * 0.05), 4));
                        };
                    },
                };
            } else if (mask === "verdant") { // Verdant Guardian Mask
                myStats.thumbnail = "https://i.imgur.com/sWYC62u.png";

                mybuff.def.push(new buffInfo("+", Math.floor(myStats.def * 0.2), 9999));
                myStats.def += Math.floor(myStats.def * 0.2);
                mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr * 0.2), 9999));
                myStats.mr += Math.floor(myStats.mr * 0.2);
                myStats.br += 0.1;
                if (myStats.br > 1) myStats.br = 1;
            } else if (mask === "valkyrie") { // Valkyrie's Battle Mask
                myStats.thumbnail = "https://i.imgur.com/Sn3MQZ7.png";

                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
                myStats.atk += Math.floor(myStats.atk * 0.2);

                // Delayed Buff
                myStats.delayedBuffs.push(new delayedBuffs(0, function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                    if ((myStats.hp / myStats.maxhp) < 0.1 && myStats.hp > 0) {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Final Gambit! She`, { atkMultiplier: 2, combodmg: true, selfdmg: true, selfheal: true });
                        this._used++;
                    };
                }, 9999, 1));
            };
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            let mask = pStats.maskinfo;// matchStats.partyStats.find((e) => e.name === "Lria EX")?.maskinfo;

            if (mask === undefined) { // Maskless
                //
            } else if (mask === "phantasmal") { // Phantasmal Deathmask
                const names = matchStats.partyChars.map((e) => e.name);
                if (names.includes("Artemis EX")) {
                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.25), 4));
                    myStats.md += Math.floor(myStats.md * 0.25);
                } else {
                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.2), 3));
                    myStats.md += Math.floor(myStats.md * 0.2);
                };

                myStats.selfhealChance.push(1);
                myStats.selfheal.push(0.1);
            } else if (mask === "verdant") { // Verdant Guardian Mask
                const names = matchStats.partyChars.map((e) => e.name);
                if (names.includes("Apollo EX")) {
                    mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.05), 9999));
                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.1), 9999));
                    myStats.md += Math.floor(myStats.md * 0.1);
                } else {
                    mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.03), 9999));
                };

                mybuff.def.push(new buffInfo("+", Math.floor(myStats.def * 0.2), 3));
                myStats.def += Math.floor(myStats.def * 0.2);
                mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr * 0.2), 3));
                myStats.mr += Math.floor(myStats.mr * 0.2);

            } else if (mask === "valkyrie") { // Valkyrie's Battle Mask
                const names = matchStats.partyChars.map((e) => e.name);
                if (!names.includes("Apollo EX") && !names.includes("Artemis EX")) {
                    mybuff.cd.push(new buffInfo("+", 0.25, 9999));
                    myStats.cd += 0.25;
                } else {
                    mybuff.cd.push(new buffInfo("+", 0.15, 9999));
                    myStats.cd += 0.15;
                };

                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.25), 9999));
                myStats.atk += Math.floor(myStats.atk * 0.25);
            };
        },
    },
    "19048": {
        usage: 1,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `1`\n**Mana**: `0`\\💧\n**Timeout**: `yes`\n**Role**: `DPS/Tank`\n\nSatoru Gojou, being the first person in 400 years to inherit both the Limitless and the Six Eyes, is widely recognized as the strongest sorcerer.\n\nThanks to Limitless, Gojou's mana cap is increased by **+100** and he rejuvenates **+5** more mana per turn than normal, however his mana gain __cannot__ be further affected by any other abilities. And on top of this, using his reversed cursed technique, Gojou will heal **4%** of his max HP every round as long as he has more than **15** mana.\n\nGojou's class active is replaced with his own techniques which will rotate after every use:\n- __Cursed Technique Reversal ・ Aka__: Gojou creates a strong electromagnetic force of repulsion dealing **90%** magic damage by consuming **40** \\💧. This has a **20%** chance of causing bleeding of **3%** of enemy HP for 3 rounds (**6%** of own HP if enemy HP is more than twice as much).\n- __Cursed Technique Lapse ・ Ao__: After using `Aka`, his skill swaps to `Ao`. He creates a strong electromagnetic field of absorption, obliterating anything that gets pulled close enough, dealing **120%** magic damage and permanently reducing enemy DEF and MR by **20%** (on first usage only) by consuming **50** \\💧.\n- __Hollow Technique ・ Murasaki__: After using `Aka` and `Ao`, his skill swaps to `Murasaki`. Gojou combines the cores of `Aka` and `Ao` to create an imaginary force of seemingly infinite mass which deals **130%** magic and **40%** physical damage by consuming **80** \\💧.  After the usage of `Murasaki`, his skill will rotate back to `Aka`.\n\nSimilarly, Gojou's defense button is replaced with `Mugen`, a thin line of infinite space, the neutral form of Limitless. When activated, expends **20** mana initially to reduce any damage received by **25%** for as long as it's active, consuming **10** mana per turn.\n\nHowever, Gojou Satoru's ultimate trump card is his Domain Expansion: `Infinite Void`. He creates a domain where his enemy enters a state of stasis for **4** turns, in which they are incapable of making any movements, dodging included. While inside his domain, the enemy takes **25%** magic damage every turn. Additionally, using `Infinite Void` will increase Gojou's ATK and MD by **15%** for the rest of battle. However, when leaving his domain, he loses all his mana, and half of his DEF and MR stats for **3** turns. `Infinite Void` can only be used once Gojou's HP falls below **30%** of his max HP.\n\nIn a party, Gojou has a **25%** chance of dealing **50%** damage to his own allies due to his enormously destructive abilities.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Gojo EX

            let maxHealth = Math.ceil(0.3 * myStats.maxhp);
            if (myStats.hp >= maxHealth) {
                this.used--;
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.interaction.followUp({ content: `You need to have less than **${maxHealth}** HP to use Infinite Void.`, ephemeral: true });
                return;
            };

            const domainLast = 4;
            eStats.timeFrozen = true;
            eStats.frozenMessage = "is incapable of moving";

            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.15), 9999));
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.15), 9999));
            myStats.atk += Math.floor(myStats.atk * 0.15);
            myStats.md += Math.floor(myStats.md * 0.15);

            eStats.dodge = 0;
            eStats.br = 0;

            // During Domain
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.25, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });

                eStats.dodge = 0;
                eStats.br = 0;
            }, domainLast - 1));

            // When Domain Ends
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + domainLast, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                eStats.timeFrozen = false;
                myStats.sm = 0;

                mybuff.def.push(new buffInfo("+", -Math.floor(myStats.def * 0.5), 3));
                mybuff.mr.push(new buffInfo("+", -Math.floor(myStats.mr * 0.5), 3));
                myStats.def += -Math.floor(myStats.def * 0.5);
                myStats.mr += -Math.floor(myStats.mr * 0.5);
            }));

            notice.push(`\n✨ **${char.name}** used his Domain Expansion: Infinite Void`);
        },
        passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.mana += 100;
            myStats.mg = 20;
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (myStats.sm > 15) {
                    myStats.hp += Math.floor(0.04 * myStats.maxhp);
                    if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
                };

                // Mugen
                if (myStats.gojoMugenIsActive) {
                    if (myStats.sm >= 20) {
                        myStats.sm -= 10;
                    } else {
                        myStats.gojoMugenIsActive = false;
                        myStats.putDamageOnHold = 0;
                        myStats.mg = 20;
                        notice.push(`\n🛡️ **${char.name}** deactivated Mugen`);
                    };
                } else {
                    myStats.mg = 20;
                };
            }, 9999));

            myStats.replaceButton.def = {
                // "emoji": "<:deepsea_guardian_helmet:1081561801042444328>",
                "used": 0,
                "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

                    if (myStats.gojoMugenIsActive) {
                        myStats.gojoMugenIsActive = false;
                        matchStats.turn = matchStats.turnSkill ? 0 : 1;
                        notice.push(`\n🛡️ **${char.name}** Mugen was deactivated!`);
                        return;
                    };

                    let activeCost = 20;
                    if (myStats.sm < activeCost) {
                        matchStats.turn = matchStats.turnSkill ? 0 : 1;
                        matchStats.interaction.followUp({ content: `You don't have enough mana! (**${myStats.sm}**/${activeCost}\\💧)`, ephemeral: true });
                        return;
                    };
                    myStats.sm -= activeCost;

                    myStats.gojoMugenIsActive = true;
                    myStats.putDamageOnHold = 0.25;

                    notice.push(`\n🛡️ **${char.name}** activated Mugen!`);
                },
            };

            myStats.replaceButton.cskill = {
                "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    myStats.gojoClassUsed ||= 0;

                    let activeCost = (myStats.gojoClassUsed % 3) === 0 ? 40 : ((myStats.gojoClassUsed % 3) === 1 ? 50 : 80);
                    if (myStats.sm < activeCost) {
                        matchStats.turn = matchStats.turnSkill ? 0 : 1;
                        matchStats.interaction.followUp({ content: `You don't have enough mana! (**${myStats.sm}**/${activeCost}\\💧)`, ephemeral: true });
                        return;
                    };
                    myStats.sm -= activeCost;

                    if ((myStats.gojoClassUsed % 3) === 0) {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}** used Aka! He`, { atkMultiplier: 0.9, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });
                        if (Math.random() < 0.2) {
                            const bleed = eStats.hp > 2 * myStats.hp ? myStats.hp * 0.06 : eStats.hp * 0.03;
                            ebuff.hp.push(new buffInfo("+", -bleed, 3));
                        };
                    } else if ((myStats.gojoClassUsed % 3) === 1) {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}** used Ao! He`, { atkMultiplier: 1.2, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });
                        if (myStats.gojoClassUsed === 1) {
                            ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * 0.2), 9999));
                            ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.2), 9999));
                            eStats.def -= Math.floor(eStats.def * 0.2);
                            eStats.mr -= Math.floor(eStats.mr * 0.2);
                        };
                    } else {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}** used Murasaki! He`, { atkMultiplier: 1.3, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}** used Murasaki! He`, { atkMultiplier: 0.4, combodmg: true, selfdmg: true, selfheal: true });
                    };

                    myStats.gojoClassUsed++;
                },
            };
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            if (Math.random() < 0.25) {
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.5, ignoreShield: true, magicDamage: true });
            };
            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.25) {
                    dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.5, ignoreShield: true, magicDamage: true });
                };
            }, 9999));
        },
    },
    "19050": {
        usage: 2,
        used: 0,
        cost: 60,
        weaponType: "none",
        activatedRound: -1,
        desc: "**Total Usage**: `2`\n**Mana**: `60`\\💧 Ei, `130`\\💧 Puppet Shogun\n**Timeout**: `no`\n**Role**: `DPS`\n\nThe Raiden Shogun is comprised of two beings in one body: Ei, the Electro Archon; and the Shogun, the puppet created by Ei. When she is equipped a __sword__, Ei will take over, otherwise the Shogun has control.\n\nWhen Ei is on the field, her normal attacks deal **12%** more damage, but she loses **3%** of her current HP per round. Once her HP falls below **50%** however, she no longer loses those **3%** current HP per round, and makes an attack dealing **150%** true damage. Instead, for the next 4 rounds, she will heal **10%** of missing HP and regenerate **+5** mana.\nUsing her active, Ei will use Musou no Hitotachi to deal **120%** true damage and decrease enemy DEF and MR by **12%** for the rest of battle (on first usage only).\n\nWhen the puppet Shogun is on stage, she gains **12%** ATK, MD and dodge chance for the rest of battle, and is immune to HP debuffs.\nUsing her active, the Shogun enters the domain of Baleful Shadowlord for the rest of the fight. While in this domain, she has **15%** increased DEF and **+5%** ATK and MD every round (up to a **30%** increase). Additionally, lowers enemy DEF and MR by **2%** every round (up to a **10%** reduction). If her HP drops below **25%** of max, she can recover **30%** of missing HP for **90**\\💧 once.\n\nIn a party, Ei will deal **12%** true damage to the enemy and recover **+3** mana for her allies every round.",
        ability: function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Raiden EX

            if (this.weaponType === "sword") {
                // Ei
                matchStats.turn = matchStats.turnSkill ? 0 : 1;

                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Musou no Hitotachi! She`, { atkMultiplier: 1.2, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, ignoreShield: true });

                if (this.used === 1) {
                    ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * 0.12), 9999));
                    ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.12), 9999));
                    eStats.def -= Math.floor(eStats.def * 0.12);
                    eStats.mr -= Math.floor(eStats.mr * 0.12);
                };
            } else {
                if (this.used === 1) {
                    if (myStats.sm < 130) {
                        this.used--;
                        matchStats.turn = matchStats.turnSkill ? 0 : 1;
                        matchStats.interaction.followUp({ content: `You don't have enough mana! (**${myStats.sm}**/${130}\\💧)`, ephemeral: true });
                        myStats.sm += 60;
                        return;
                    };
                    myStats.sm -= 70;

                    this.activatedRound = matchStats.round;

                    ebuff.def.push(new buffInfo("+", Math.floor(eStats.def * 0.15), 9999));
                    eStats.def += Math.floor(eStats.def * 0.15);

                    myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        myStats.atk += Math.floor(myStats.atk * Math.min(0.3, 0.05 * (matchStats.round - this.activatedRound)));

                        eStats.def -= Math.floor(eStats.def * Math.min(0.1, 0.02 * (matchStats.round - this.activatedRound)));
                        eStats.mr -= Math.floor(eStats.mr * Math.min(0.1, 0.02 * (matchStats.round - this.activatedRound)));
                    }, 9999));

                    notice.push(`\n✨ **${char.name}** has entered the domain of Baleful Shadowlord!`);
                } else {
                    let maxHealth = Math.ceil(0.25 * myStats.maxhp);
                    if (myStats.hp >= maxHealth) {
                        this.used--;
                        myStats.sm += 60;
                        matchStats.turn = matchStats.turnSkill ? 0 : 1;
                        matchStats.interaction.followUp({ content: `You need to have less than **${maxHealth}** HP.`, ephemeral: true });
                        return;
                    };

                    if (myStats.sm < 90) {
                        this.used--;
                        matchStats.turn = matchStats.turnSkill ? 0 : 1;
                        matchStats.interaction.followUp({ content: `You don't have enough mana! (**${myStats.sm}**/${90}\\💧)`, ephemeral: true });
                        myStats.sm += 60;
                        return;
                    };
                    myStats.sm -= 30;

                    const heal = Math.floor((myStats.maxhp - myStats.hp) * 0.3);
                    myStats.hp += heal;

                    notice.push(`\n✨ **${char.name}** healed **${heal}** HP!`);
                };
            };
        },
        passive: function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if (myStats.weapon !== -1) this.weaponType = items[myStats.weapon].type; // sword | lance

            if (this.weaponType === "sword") {
                // Ei
                myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    if (myStats.hp / myStats.maxhp > 0.5) {
                        myStats.hp -= Math.floor(0.03 * myStats.hp);
                    } else {
                        if (!myStats.raidenHpDownRound) {
                            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1.5, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, ignoreShield: true });
                            myStats.raidenHpDownRound = matchStats.round;
                            mybuff.mg.push(new buffInfo("+", 5, 4));
                        };
                    };

                    if (matchStats.round < myStats.raidenHpDownRound + 4) {
                        myStats.hp += Math.floor((myStats.maxhp - myStats.hp) * 0.1);
                    };
                }, 9999));

                // Replace ATK
                myStats.replaceButton.atk = {
                    "run": (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1.12, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, ignoreShield: true });
                        // dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.6, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true, ignoreShield: true });

                    },
                };
            } else {
                // Puppet
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.12), 9999));
                mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.12), 9999));
                myStats.atk += Math.floor(myStats.atk * 0.12);
                myStats.md += Math.floor(myStats.md * 0.12);
                mybuff.dodge.push(new buffInfo("+", 0.12, 9999));
                myStats.dodge += 0.12;
                if (myStats.dodge > 1) myStats.dodge = 1;

                // Remove HP debuffs on self
                myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    mybuff.hp = mybuff.hp.filter((buff) => (buff.type === "*" && buff.val > 1) || (buff.type === "+" && buff.val > 0));
                }, 9999));
            };
        },
        party: function (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if (pStats.weapon !== -1 && items[pStats.weapon].type === "sword") {
                const name = pStats.name;
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.12, ignoreShield: true, magicDamage: true });
                myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.12, ignoreShield: true, magicDamage: true });
                }, 9999));

                myStats.mg += 3;
                mybuff.mg.push(new buffInfo("+", 3, 9999));
            };
        },
    },
    "19102": {
        usage: 9999,
        used: 0,
        buffID: 0,
        cost: 65,
        desc: "**Total Usage**: `unlimited`\n**Cost**: `65`\\💧\n**Timeout**: `no`\n**Role**: `Support`\n\nGuinaifen, an outworlder who ended up residing on the Xianzhou by accident, is a passionate and vivacious street performer of many Xianzhou acrobatics. \n\nEach successful attack applies a stack of `Firekiss` on her foes (up to **5** stacks at once), dealing **6%** damage for **3** rounds, showcasing her ability to sustain pressure on her adversaries. Moreover, while her enemy has any HP debuffs on them, Guinaifen will gain a **10%** increase in ATK and MD.\n\nWhen Guinaifen uses her ability, she unleashes a fiery assault that inflicts **70%** damage and adds two more stacks of `Firekiss` to her target.\n\nIn a party, Guinaifen applies a stack of `Firekiss` on the enemy with each successful attack of her team member, but the flames burn brighter and faster, lasting only **2** rounds (up to **3** stacks at once).",
        ability: (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Guinaifen
            matchStats.turn = matchStats.turnSkill ? 0 : 1;

            const dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.7, magicDamage: true });

            if (dmg) {
                if (myStats.guinaifenStackRounds.filter((e) => e >= (matchStats.round - myStats.guinaifenStackLast)).length < myStats.guinaifenStackMax) {
                    ebuff.hp.push(new buffInfo("+", -Math.floor(0.06 * dmg), myStats.guinaifenStackLast));
                    myStats.guinaifenStackRounds.push(matchStats.round);
                };
            };

            embed.setThumbnail("https://i.ibb.co/VWKDvfw/tenor.gif");
        },
        passive: function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            myStats.guinaifenStackRounds = [];
            myStats.guinaifenStackLast = 3;
            myStats.guinaifenStackMax = 5;

            myStats.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                // If enemy has HP debuffs
                if (ebuff.hp.some((buff) => ((buff.type === "*" && buff.val < 1) || (buff.type === "+" && buff.val < 0)))) {
                    myStats.atk += Math.floor(0.1 * myStats.atk);
                    myStats.md += Math.floor(0.1 * myStats.md);
                };
            }, 9999));
        },
        party: (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.guinaifenStackRounds = [];
            myStats.guinaifenStackLast = 2;
            myStats.guinaifenStackMax = 3;
        },
    },
};

module.exports.abilities = abilities;