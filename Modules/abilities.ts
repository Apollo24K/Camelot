import { AttachmentBuilder, EmbedBuilder, Message, User } from "discord.js";
import { getDetailedStats, dealDamage, addHeal, getRefinement } from "./functions";
import { createCanvas, loadImage } from '@napi-rs/canvas';
import charInfo, { characters } from "./chars";
import { items } from "./items";
import delayedBuffs from "./delayedBuffs";
import buffInfo from "./buffs";
import { Buffs, DetailedStats, IbuffInfo, IcharInfo, IentityInfo, MatchStats } from "../types";
import { getLatestStampede, getUserSchema, getUserWeaponCount, updateUsers, getPartyMembers, getUserSchemas } from "./queries";
import { AbilityResponse } from "./components";

export type Ability = {
    usage: number;
    used: number;
    cost: number;
    desc: string;
    shortdesc: string;
    [key: string]: any;
    ability?: (myStats: DetailedStats, myStatsFixed: DetailedStats, eStats: DetailedStats, eStatsFixed: DetailedStats, mybuff: Buffs, ebuff: Buffs, char: charInfo, enemy: IentityInfo, matchStats: MatchStats, notice: string[], embed: EmbedBuilder, message: Message, ...list: any[]) => Promise<AbilityResponse>;
    passive?: (myStats: DetailedStats, myStatsFixed: DetailedStats, eStats: DetailedStats, mybuff: Buffs, ebuff: Buffs, char: charInfo, enemy: IentityInfo, matchStats: MatchStats, notice: string[], embed: EmbedBuilder, user: User, ...list: any[]) => Promise<AbilityResponse>;
    party?: (pStats: DetailedStats, myStats: DetailedStats, eStats: DetailedStats, mybuff: Buffs, ebuff: Buffs, char: charInfo, enemy: IentityInfo, matchStats: MatchStats, notice: string[], embed: EmbedBuilder, user: User, ...list: any[]) => Promise<AbilityResponse>;
};

export const abilities: Record<number, Ability> = {
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
        shortdesc: "**Uses**: `Unlimited`\n**Cost**: `25`💧\n**Timeout**: `Yes`\n**Role**: `Support (Summon)`\n\n __**Active**__ (✨)\n- Transforms into Gugu (S TIER), Parona (A TIER) or March (B TIER) randomly (if you own them)\n- They have their own HP & STATS, but items & classes remain the same\n- Using it again transforms back to Fushi",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Fushi transforms randomly in one of 3 characters who each have their own stats.
            const inv = await getUserSchema(matchStats.interaction.user.id);
            if (!inv) {
                matchStats.sendWarning({ content: "You don't have any characters to transform into", ephemeral: true });
                return AbilityResponse.FAILURE;
            };

            if (!(inv.chars.includes(65) || inv.chars.includes(66) || inv.chars.includes(67))) {
                matchStats.sendWarning({ content: "You don't have any of the characters **Parona**, **Gugu** or **March** to transform into", ephemeral: true });
                return AbilityResponse.FAILURE;
            };

            if (this.selected === "fushi") {
                let obtained: ("parona" | "gugu" | "march")[] = [];
                if (inv.chars.includes(65)) obtained.push("parona");
                if (inv.chars.includes(66)) obtained.push("gugu");
                if (inv.chars.includes(67)) obtained.push("march");
                let pick: "parona" | "gugu" | "march" = obtained[Math.floor(Math.random() * obtained.length)];
                let pID = { "parona": 65, "gugu": 66, "march": 67 }[pick];

                this.selected = pick;

                this.fushi = myStats.hp;
                let newStats = await getDetailedStats(pID, inv, inv.dungeon_classlevels);
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
                let newStats = await getDetailedStats(64, inv, inv.dungeon_classlevels);
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

            return AbilityResponse.SUCCESS;
        },
    },
    "77": {
        usage: 9999,
        used: 0,
        cost: 30,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `30`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nWith her trusted rifle, Sinon hits every target in the bullseye, dealing critical hits. Against her, trying to dodge is not just futile, but she will deal more damage the more her target tries to dodge, as if she were mocking it (every 1% dodge = +1% dmg). She will abuse every weakness of her opponents, dealing magic or physical damage accordingly.",
        shortdesc: "**Uses**: `Unlimited`\n**Cost**: `30`💧\n**Timeout**: `Yes`\n**Role**: `DPS`\n\n__**Active**__ (✨)\n- Deals an undodgeable critical hit\n- The hit's DMG scaling is increased by **1%** for every **1%** of dodge the enemy has\n- Deals Physical DMG if the enemy has lower DEF than MR, else the other way round",
        ability: async (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Sinon ignores dodge chance, deals more damage the more dodge% the enemy has, deals a guaranteed crit, and deals atk/matk depending on enemy weakness
            if (eStats.mr < eStats.def) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.95 + eStats.dodge, magicDamage: true, mdChance: -1, critChance: 0, dodge: false });
            } else {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.95 + eStats.dodge, critChance: 0, dodge: false });
            };

            return AbilityResponse.SUCCESS;
        },
    },
    "238": {
        usage: 3,
        used: 0,
        cost: 20,
        desc: "**Total Usage**: `3`\n**Mana**: `20`\\💧\n**Timeout**: `yes`\n**Role**: `Farming`\n\nUsing his ultimate skill Beelzebub, Rimuru Tempest can end a fight in an instant, devouring his enemy. While enemies with less than half of his own EP will lose immediately, the success rate of Beelzebub will decline with stronger enemies.",
        shortdesc: "**Uses**: `3`\n**Cost**: `20`💧\n**Timeout**: `Yes`\n**Role**: `Farming (Class XP)`\n\n__**Active**__ (✨)\nAttempts to consume the enemy (win the fight):\n- 2x (Double) the enemy's EP = **100%** success\n- 1.5x the enemy's EP = **60%** success\n- 1.1x the enemy's EP = **30%** success\n- 0.8x the enemy's EP = **10%** success\n\nNote:- This unit's ability cannot be used in stampedes.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Rimuru has a chance of 100%/60%/30%/10%/0% to instantly kill the enemy
            if (matchStats.interaction.commandName === "stampede") {
                matchStats.turn = 0;
                myStats.sm += 20;
                matchStats.sendWarning({ content: "Rimuru can't be used in this game mode.", ephemeral: true });
                return AbilityResponse.FAILURE;
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

            return AbilityResponse.SUCCESS;
        },
    },
    "274": {
        usage: 1,
        used: 0,
        cost: 50,
        desc: "**Total Usage**: `1`\n**Mana**: `50`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nBy transforming into a Titan, Eren will boost his HP, ATK, MD, DEF and MR stats by **20%**. More Specifically, 20% of his max HP and 20% of his current DEF and current ATK each.",
        shortdesc: "**Uses**: `1`\n**Cost**: `50`💧\n**Timeout**: `Yes`\n**Role**: `DPS/Tank (Versatile)`\n\n__**Active**__ (✨)\n- **+20%** max HP, ATK & MD, DEF & MR",
        ability: async (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Eren increases his stats by 20% of his max HP, current DEF and current ATK
            matchStats.turn = 1;
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.2), {});
            myStats.maxhp += Math.floor(myStats.maxhp * 0.2);
            ["atk", "def", "md", "mr"].forEach((e) => mybuff[e as keyof Buffs].push(new buffInfo("*", 1.2, 9999)));
            notice.push(`\n✨ **${char.name}** has transformed into a Titan! Raised HP, ATK, MD, DEF and MR by **20%**`);
            embed.setThumbnail("https://i.ibb.co/YfnG2Tn/at.png");

            return AbilityResponse.SUCCESS;
        },
    },
    "405": {
        usage: 10,
        used: 0,
        cost: 60,
        desc: "**Total Usage**: `10`\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nWith her Noble Phantasm Excalibur, the pinnacle of holy swords, Saber unleashes her most powerful attack dealing **250%** of her normal damage.",
        shortdesc: "**Uses**: `10`\n**Cost**: `60 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Nuke)`\n\n__**Active**__ (✨)\n- Deals **250%** DMG",
        ability: async (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Saber unleashes an attack with 250% damage
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Excalibur! She`, { atkMultiplier: 2.5 });

            return AbilityResponse.SUCCESS;
        },
    },
    "408": {
        usage: 1,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `1`\n**Mana**: `0`\\💧 on active, `35`\\💧 on passive\n**Timeout**: `no`\n**Role**: `DPS/Support`\n\nGilgamesh, the King of Heroes, brings his mighty arsenal to bear, showcasing a battle style as grand as his title. His potent abilities revolve around his majestic Gates of Babylon and his ultimate weapon, the Sword of Rupture, Ea.\n\nGilgamesh's passive becomes apparent whenever he possesses at least **35**\\💧. He opens the Gates of Babylon, launching a weapon straight at his opponent, causing damage equivalent to **40%** of his normal damage. Each successful strike bolsters Gilgamesh's own strength, incrementing his attack and magic damage by **2%**. However, there is an element of chance, as these attacks can potentially miss or be blocked by the enemy.\n\nOnce per battle, Gilgamesh reveals his trump card, the formidable Ea. He initiates the ability by commencing the charge of Enuma Elish, a process that takes three turns to charge. Once the charge reaches its peak, the unleashed attack inflicts damage equal to **150%** of Gilgamesh's attack. This damage can further be boosted, gaining an additional **1%** for every weapon the player owns up to a whopping **250%**.\n\nWhile he may display an air of arrogance, Gilgamesh's abilities undeniably reflect his moniker as the King of Heroes, wreaking havoc among his enemies with his versatile and formidable armaments. And his companions he doesn't leave on their own, assisting them with his Gates of Babylon during stampedes.",
        shortdesc: "**Uses**: `1`\n**Cost**: `0 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Mana-losing, Followup Attack, Nuke)`\n\n__**Passive**__\nWhenever he has **35** 💧:\n- Deals **40%** DMG\n- Boosts ATK/MD by **2%** if it hits\n\n__**Active**__ (✨)\n- Deals **150%** DMG after **3** rounds\n- This DMG scaling is further increased by **1%** for for every **1** weapon owned (Dupes included, capped at 100% increase for a total of 250% DMG)\n\n__**Party**__ (👥)\n- There is a **33%** chance to deal **40%** DMG to the enemy every round",
        ability: async (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Gilgamesh
            const weaponCount = await getUserWeaponCount(matchStats.interaction.user.id, "weapon");

            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 3, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Ea! He`, { atkMultiplier: 1.5 + Math.min(weaponCount / 100, 1), magicDamage: true, dodge: false });

                return AbilityResponse.SUCCESS;
            }));
            notice.push(`\n✨ **${char.name}** began charging Ea`);

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (myStats.sm >= 35) {
                    myStats.sm -= 35;
                    let dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.4, magicDamage: true });
                    if (dmg) {
                        mybuff.atk.push(new buffInfo("*", 1.02, 9999));
                        mybuff.md.push(new buffInfo("*", 1.02, 9999));
                    };
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            if (Math.random() < 0.33) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.4, ignoreShield: true, magicDamage: true });
            };
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.33) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.4, ignoreShield: true, magicDamage: true });
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "512": {
        usage: 1,
        used: 0,
        cost: 50,
        desc: "**Total Usage**: `1`\n**Mana**: `50`\\💧\n**Timeout**: `no`\n**Role**: `Tank`\n\nMash Kyrielight, the Shield of Chaldea, takes her defensive prowess to new heights in battle, turning her durability into an asset for her and her party. Mash's ability allows her to create a protective shield amounting to **50%** of her max HP. This tactical layer of defense provides a significant cushion against incoming damage, but it can only be utilized once per battle.\n\nHer passive ability, meanwhile, further fortifies her defenses. Mash inherently takes 10% less damage, and as long as she maintains her shield, her attack increases by **15%**, turning defense into offense.\n\nWhen it comes to party support, Mash's protective nature shines through once more. All of her allies begin the fight with a shield equal to **10%** of their max HP, **10%** increased block rate and they take **10%** less damage. Her abilities emphasize a balance of protection and power, making her an indispensable part of any team.",
        shortdesc: "**Uses**: `1`\n**Cost**: `50 💧` \n**Timeout**: `No`\n**Role**: `Tank (Burst shield)`\n\n__**Passive**__\n- **+100** DEF & MR\n- When a shield is active, own ATK **+15%**\n\n__**Active**__ (✨)\n- Summons a shield equivalent to **50%** of her max HP\n\n__**Party**__ (👥)\n- **+100** DEF & MR\n- **+10%** Block rate\n- Enters battles with a **10%** max HP shield",
        ability: async (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Mash Kyrielight 
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            notice.push(`\n✨ Manifest yourself, Lord Camelot!`);
            myStats.shield += Math.floor(myStats.maxhp * 0.5);

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.def += 100;
            myStats.mr += 100;
            mybuff.def.push(new buffInfo("+", 100, 9999));
            mybuff.mr.push(new buffInfo("+", 100, 9999));
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (myStats.shield > 0) {
                    myStats.atk += Math.floor(myStats.atk * 0.15);
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.shield += Math.floor(myStats.maxhp * 0.1);
            myStats.br += 0.1;
            if (myStats.br > 1) myStats.br = 1;
            myStats.def += 100;
            myStats.mr += 100;
            mybuff.def.push(new buffInfo("+", 100, 9999));
            mybuff.mr.push(new buffInfo("+", 100, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "712": {
        usage: 9999,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `0`\\💧, then `10`\\💧 continuously\n**Timeout**: `No`\n**Role**: `DPS`\n\nWhen using his ability, Xiao dons the Yaksha Mask that set gods and demons trembling millennia ago. Until his mana runs dry, he will deal **30%** more magic damage in this state, losing **10** mana each round. If he uses his ability again during this state, he will consume 50 💧 to lunge forward, dealing **200%** magic damage.",
        shortdesc: "**Uses**: `Unlimited`\n**Cost**: `0 💧 , then 10 💧 every round`\n**Timeout**: `No`\n**Role**: `DPS (Mana-losing, Nuke)`\n\n__**Active**__ (✨)\nFalls in as General Alatus:\n- Halts mana regeneration\n- Consumes **10** 💧 every round\n- **+30%** MD\n\nHis active (✨) is altered when he's in this state:\n**Cost**:`50 💧`\n**Timeout**: `No`\n- Deals **200%** MD",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            if (matchStats.heap1.length > 0) { // Xiao increases md by 30% by consuming 10 mana per round. Deals 200% damage if used again.
                if (myStats.sm < 50) {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    matchStats.sendWarning({ content: "You need at least **50**\\💧 for this attack.", ephemeral: true });
                    return AbilityResponse.FAILURE;
                };
                myStats.sm -= 50;
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** lunged forward! He`, { atkMultiplier: 2, magicDamage: true, mdChance: -1 });
            } else {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                if (myStats.sm < 10) {
                    matchStats.sendWarning({ content: "You need at least **10**\\💧 to sustain this form", ephemeral: true });
                    return AbilityResponse.FAILURE;
                };
                matchStats.consumeMana = 10;

                // Add new buffs to heap
                let mdbuff = new buffInfo("+", Math.floor(myStats.md * 0.3), 9999);
                let mgbuff = new buffInfo("=", 0, 9999);
                mybuff.md.push(mdbuff); mybuff.mg.push(mgbuff);
                matchStats.heap1 = [{ type: "md", id: mdbuff.id, buff: Math.floor(myStats.md * 0.3) }, { type: "mg", id: mgbuff.id, buff: myStats.mg }];
                myStats.md += Math.floor(myStats.md * 0.3);
                myStats.mg = 0;

                embed.setThumbnail("https://i.ibb.co/m024R2q/x.png");
                notice.push(`\n🎭 **${char.name}** dons the Yaksha Mask, increasing his MD by **30%**`);
            };

            return AbilityResponse.SUCCESS;
        },
    },
    "733": {
        usage: 1,
        used: 0,
        cost: 40,
        desc: "**Total Usage**: `1`\n**Mana**: `40`\\💧\n**Timeout**: `yes`\n**Role**: `DPS/Tank`\n\nWith his ability, Albedo increases his ATK by 50% of his current DEF.",
        shortdesc: "**Uses**: `Unlimited`\n**Cost**: `40 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (DEF-scaling)`\n\n__**Active**__ (✨)\n- Increases ATK by **50%** of DEF",
        ability: async (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Albedo (GI) increases his ATK by 50% of his current DEF
            let inc = Math.floor(myStats.def / 2);
            myStats.atk += inc;
            mybuff.atk.push(new buffInfo("+", inc, 9999));
            notice.push(`\n✨ **${char.name}** has increased his **ATK** by half of his **DEF** (**+${inc}**)`);

            return AbilityResponse.SUCCESS;
        },
    },
    "735": {
        usage: 10,
        used: 0,
        cost: 65,
        desc: "**Total Usage**: `10`\n**Mana**: `65`\\💧\n**Timeout**: `Yes`\n**Role**: `DPS`\n\nEach use of Yoimiya's normal attack will grant her a 'flame', up to **20**. After collecting three 'flames', her normal attack receives a substantial **22.5%** increase in damage. Additionally, if Yoimiya is wielding a bow as her primary weapon, her normal attacks will apply a burn effect dealing **12.5%** true damage for **2** rounds.\n\nHer active ability has her deliver a one-two punch of **80%** physical and magical damage each, before unleashing a festive reprise, dealing **10%** DMG for every flame collected, for a maximum of **100%**. The next round after using her active ability, her normal attack will trigger twice.\n\nYoimiya is **not** compatible with other ATK replacing abilities.",
        shortdesc: "**Uses**: `10`\n**Cost**: `65 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Flame)`\n\n__**Passive**__\n\nATTACK is altered to:\n- Grant **1x** `Flame` (Up to 20)\n- Deals **100%** DMG. This is increased to **122.5%** when she has **3** or more `Flame`\n- When equipped with a bow, additionally deals **12.5%** true DMG for **2** rounds\n\n__**Active**__ (✨)\n- Deals **80%** ATK + **80%** MD\n- Then deals **10%** DMG for every `Flame` owned (up to 100%)\n- Her normal ATTACK next turn will trigger twice\n\nNote:- This unit is incompatible with other ATK-replacing effects",
        ability: async (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Yoimiya
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.8, magicDamage: false });
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.8, magicDamage: true, mdChance: -1 });
            // Deals 10% DMG for every flame (100% max)
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🔥 A festive reprise! **${char.name}**`, { atkMultiplier: 0.1 * Math.min(myStats.yoimiyaFlames, 10), magicDamage: true, mdChance: -1 });

            matchStats.twinshot = 1;
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 2, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                matchStats.twinshot = 0;

                return AbilityResponse.SUCCESS;
            }));

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.yoimiyaFlames = 0;
            myStats.yoimiyaLastTwinshot = matchStats.round;

            // Attack Trigger
            matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
                if (caster === myStats) {

                    if (myStats.yoimiyaFlames < 20) myStats.yoimiyaFlames++;
                    if (myStats.yoimiyaFlames >= 3) myStats.atk += Math.floor(myStats.atk * 0.225);

                    // Deals additional 12.5% HP damage for 2 rounds each timee
                    if (items[myStats.weapon]?.type === "bow") ebuff.hp.push(new buffInfo("+", -Math.floor(options.damage * 0.125), 2));

                    // Twinshot
                    if (matchStats.twinshot > Math.random() && myStats.yoimiyaLastTwinshot !== matchStats.round) {
                        myStats.yoimiyaLastTwinshot = matchStats.round;
                        myStats.replaceButton.atk?.run?.(myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list);
                    };
                };
            });

            return AbilityResponse.SUCCESS;
        },
    },
    "767": {
        usage: 1,
        used: 0,
        cost: 100,
        desc: "**Total Usage**: `1`\n**Mana**: `100`\\💧\n**Timeout**: `yes`\n**Role**: `Support`\n\nHaving invested all her skill points in this one Explosion magic, her attack is not to be underestimated. Those caught in its path will feel the full force of Megumin's might, as she unleashes the ultimate attack of destruction dealing **300%** guaranteed magic damage. This takes all her energy though, and she becomes useless for the next 2 rounds as her damage and defense plummet to 0.\n\nIf she's in a party with her 'reliable' companions - **Aqua**, **Darkness** or **Kazuma Satou** - Megumin will get a shield equal to **10%** of her max HP after using her magic.",
        shortdesc: "**Uses**: `1`\n**Cost**: `100 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Sacrificial, Nuke)`\n\n__**Active**__ (✨)\n- Deals **300%** undodgeable MD\n- Decreases ATK, MD, DEF, MR to **0** for **3** rounds\n\n__**Party**__ (👥)\nWhen megumin's active (✨) is used in stampedes:\n- If Aqua/Darkness/Kazuma Satou is selected in the party, gains a shield equivalent to **10%** of her max HP",
        ability: async (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
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
                const names = list[0].map((e: IcharInfo) => e.name);
                if (names.includes("Aqua") || names.includes("Darkness") || names.includes("Kazuma Satou")) {
                    myStats.shield += Math.floor(myStats.maxhp * 0.1);
                };
            };

            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 2, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                embed.setImage(eStats.image);

                return AbilityResponse.SUCCESS;
            }));

            return AbilityResponse.SUCCESS;
        },
    },
    "768": {
        usage: 9999,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `0`\\💧\n**Timeout**: `yes`\n**Role**: `Useless/Support`\n\nWhile useless on her own, Aqua isn't as ineffective as her reputation might suggest. Despite her shortcomings in combat, Aqua's support capabilities are nothing short of divine. When in the company of her party members - **Megumin**, **Darkness**, or **Kazuma Satou** - Aqua's divinity shines through, allowing her to cast a protective barrier on her party equal to **5%** of their max HP. Moreover, her divine abilities extend to miraculous healing and resurrection. She heals her party for **5%** of their max health every round, ensuring their longevity in the battle. In dire circumstances, Aqua can even resurrect fallen them, but this divine intervention can only occur once per battle.\n\nHowever, her normal attacks are ironically transmuted into a completely harmless splash, making it virtually impossible for her to deal damage in combat, reinforcing her infamous title.",
        shortdesc: "**Uses**: `1`\n**Cost**: `0 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Mana-losing, Followup Attack, Nuke)`\n\n__**Passive**__\n- In stampedes, ATTACK is altered to deal **0%** DMG\n\n__**Active**__ (✨)\n- Deals **0%** DMG\n\n__**Party**__ (👥)\nIf the ally is Megumin/Darkness/Kazuma Satou:\n- Restores **5%** max HP every round\n- Revives upon death with **40%** HP",
        ability: async (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Aqua
            eStats.wet = true;
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `💦 **${char.name}** used splash! She`, { atkMultiplier: 0, magicDamage: false });

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.interaction.commandName === "stampede") {
                myStats.replaceButton.atk = {
                    "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `💦 **${char.name}** used splash! She`, { atkMultiplier: 0, magicDamage: false });

                        return AbilityResponse.SUCCESS;
                    },
                };
            };

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (["Megumin", "Darkness", "Kazuma Satou"].includes(myStats.name)) {
                myStats.shield += Math.floor(myStats.maxhp * 0.05);
                mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.05), 9999));
                myStats.rev = 1;
                myStats.revhp = 0.4;
                myStats.maxRevivals = 1;
            };

            return AbilityResponse.SUCCESS;
        },
    },
    "769": {
        usage: 0,
        used: 0,
        cost: 100,
        desc: "**Total Usage**: `0`\n**Role**: `Tank`\n\nDarkness, a crusader with an unusual love for danger, proves herself as a robust defensive bulwark on the battlefield. Her distinct passion for frontline combat serves as a vital asset to her team's survival, reducing any damage she receives by a staggering **30%**. This is due to her high defenses against both physical and magic damage, effectively making her a veritable shield against enemy onslaughts.\n\nWhen teamed up with her unconventional comrades - **Megumin**, **Aqua**, or **Kazuma Satou**, Darkness willingly throws herself into the path of danger, using her own body as a shield to protect her allies, further lessening any damage her party members receive by **15%**. Darkness' self-sacrificing defense strategy, although peculiar, undeniably strengthens her party's resilience, making them that much tougher to bring down.",
        shortdesc: "**Uses**: `0`\n**Role**: `Tank (Mitigation)`\n\n__**Passive**__\n- **+340** DEF & MR\n\n__**Party**__ (👥)\nIf ally is Megumin/Aqua/Kazuma Satou:\n- **+155** DEF & MR",
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.def += 340; // Takes 30% less damage
            myStats.mr += 340;
            mybuff.def.push(new buffInfo("+", 340, 9999));
            mybuff.mr.push(new buffInfo("+", 340, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (["Megumin", "Aqua", "Kazuma Satou"].includes(myStats.name)) {
                myStats.def += 155; // Takes 15% less damage
                myStats.mr += 155;
                mybuff.def.push(new buffInfo("+", 155, 9999));
                mybuff.mr.push(new buffInfo("+", 155, 9999));
            };

            return AbilityResponse.SUCCESS;
        },
    },
    "770": {
        usage: 0,
        used: 0,
        cost: 100,
        desc: "**Total Usage**: `0`\n**Role**: `Support`\n\nKazuma Satou may seem like an ordinary character, but his abilities are anything but. His ability is a reflection of his sly wit and cunning mind. His high luck in battle renders his enemies unable to dodge his attacks.\n\nHowever, it's in his party's synergy that Kazuma's true potential is unveiled. If he finds himself fighting alongside his \"reliable\" companions - **Megumin**, **Aqua**, or **Darkness** - their chaotic synergy initiates an additional effect. Kazuma cleverly exploits his opponents' confusion, decreasing their dodge and block rates by **20%**. This disorientation further boosts his team's offense, making their attacks more likely to hit and causing a significant dent in their enemies' defenses. This collaborative effect not only showcases the eccentric harmony of Kazuma and his party but also makes them a force to be reckoned with on the battlefield.",
        shortdesc: "**Uses**: `0`\n**Role**: `DPS (Anti-dodge)`\n\n__**Passive**__\n- The enemy cannot dodge\n\n__**Party**__ (👥)\nIf ally is Megumin/Aqua/Darkness:\n- **-20%** enemy's Dodge rate & Block rate",
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.dodge = 0;
            ebuff.dodge.push(new buffInfo("=", 0, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (["Megumin", "Aqua", "Darkness"].includes(myStats.name)) {
                eStats.dodge -= 0.2;
                if (eStats.dodge < 0) eStats.dodge = 0;
                ebuff.dodge.push(new buffInfo("+", -0.2, 9999));
                eStats.br -= 0.2;
                if (eStats.br < 0) eStats.br = 0;
                ebuff.br.push(new buffInfo("+", -0.2, 9999));
                notice.push(`\n✨ Kazuma lowered enemy dodge & block rate by **20%**!`);
            };

            return AbilityResponse.SUCCESS;
        },
    },
    "1001": {
        usage: 9999,
        used: 0,
        pause: 0,
        cost: 60,
        desc: "**Total Usage**: `unlimited` (with a 6 round cooldown)\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nRoronoa Zoro, a master of swordsmanship, is best known for his unique \"Three Sword Style\". After using his ability, Zoro will draw and attack with all three of his swords on normal attacks. He can hold this form for at most **3** rounds, but there's also a **4**/**7**/**12%** chance of missing an attack, which leads him to put away his swords as well.\n\nAfter using his ability, Zoro needs to rest 6 rounds before he can use it again.",
        shortdesc: "**Uses**: `Unlimited`\n**Cooldown**: `6 rounds`\n**Cost**: `60 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Followup Attack)`\n\n__**Active**__ (✨)\nUtilizes three-sword style for at most **3** rounds:\n- ATTACK is altered to deal **3** hits, each with a **4%**/**7%**/**12%** chance to miss\n- If he misses the attack, the following hits will not be activated, and he will exit the sword form",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Zoro uses all 3 of his swords to attack 3x
            if (this.pause > matchStats.round) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                this.used--;
                myStats.sm += 60;
                matchStats.sendWarning({ content: `Zoro needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                return AbilityResponse.SUCCESS;
            };
            this.pause = matchStats.round + 6;
            myStats.replaceButton.atk = {
                "emoji": "<:zoro:1084242647339761704>",
                "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    if (Math.random() < 0.04) {
                        notice.push("\n✨ Zoro missed the enemy. He is too tired to continue.");
                        matchStats.trigger("miss", myStats, eStats, mybuff, ebuff);
                        delete myStats.replaceButton.atk;
                    } else {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:zoro:1084242647339761704> **${char.name}**`, { magicDamage: true });
                        if (Math.random() < 0.07) {
                            notice.push("\n✨ Zoro missed the enemy. He is too tired to continue.");
                            matchStats.trigger("miss", myStats, eStats, mybuff, ebuff);
                            delete myStats.replaceButton.atk;
                        } else {
                            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:zoro:1084242647339761704> **${char.name}**`, { magicDamage: true });
                            if (Math.random() < 0.12) {
                                notice.push("\n✨ Zoro missed the enemy. He is too tired to continue.");
                                matchStats.trigger("miss", myStats, eStats, mybuff, ebuff);
                                delete myStats.replaceButton.atk;
                            } else {
                                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:zoro:1084242647339761704> **${char.name}**`, { magicDamage: true });
                            };
                        };
                    };

                    return AbilityResponse.SUCCESS;
                },
            };
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 3, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                delete myStats.replaceButton.atk;

                return AbilityResponse.SUCCESS;
            }));

            return AbilityResponse.SUCCESS;
        },
    },
    "1824": {
        usage: 1,
        used: 0,
        cost: 20,
        desc: "**Total Usage**: `1`\n**Mana**: `20`\\💧\n**Timeout**: `no`\n**Role**: `DPS`\n\nRyuuko Matoi sacrifices 30% of her current HP for an ATK increase of 90% of those lost HP",
        shortdesc: "**Uses**: `1`\n**Cost**: `20 💧`\n**Timeout**: `No`\n**Role**: `DPS (Sacrificial)`\n\n__**Active**__ (✨)\n- Consumes **30%** HP\n- Increases ATK & MD by **90%** of the consumed HP",
        ability: async (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Ryuuko sacrifices 30% of her current HP for a 90% ATK increase of lost HP
            let sacrifice = Math.floor(myStats.hp * 0.3);
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -sacrifice, {});
            myStats.atk += Math.floor(sacrifice * 0.9);
            mybuff.atk.push(new buffInfo("+", Math.floor(sacrifice * 0.9), 9999));
            myStats.md += Math.floor(sacrifice * 0.9);
            mybuff.md.push(new buffInfo("+", Math.floor(sacrifice * 0.9), 9999));
            matchStats.turn = 1;
            notice.push(`\n✨ **${char.name}** sacrificed **${sacrifice}**HP for **${Math.floor(sacrifice * 0.9)}** ATK and Magic Damage`);

            return AbilityResponse.SUCCESS;
        },
    },
    "2079": {
        usage: 1,
        used: 0,
        cost: 50,
        desc: "**Total Usage**: `1`\n**Mana**: `50`\\💧\n**Timeout**: `yes`\n**Role**: `Tank/DPS`\n\nBy equipping her unique armor Hermes Trismegistus, Albedo increases her DEF by **50%** and gains a **25%** ATK increase of her current DEF.",
        shortdesc: "**Uses**: `1`\n**Cost**: `50 💧`\n**Timeout**: `Yes`\n**Role**: `DPS/Tank (DEF-scaling)`\n\n__**Active**__ (✨)\n- Increases DEF by **50%**\n- Increases ATK by **25%** of current DEF",
        ability: async (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Albedo permanently increases DEF by 50% and ATK by 25% of current DEF
            const raiseDef = Math.floor(myStats.def / 2);
            const raiseAtk = Math.floor(myStats.def / 4);
            myStats.def += raiseDef;
            mybuff.def.push(new buffInfo("+", raiseDef, 9999));
            myStats.atk += raiseAtk;
            mybuff.atk.push(new buffInfo("+", raiseAtk, 9999));
            notice.push(`\n✨ **${char.name}** equipped Hermes Trismegistus!\n<:blank:917804200363171860> She has gained **+${raiseDef}**DEF and **+${raiseAtk}**ATK`);
            embed.setThumbnail("https://i.ibb.co/S7v6Qmx/a.png");

            return AbilityResponse.SUCCESS;
        },
    },
    "2080": {
        usage: 5,
        used: 0,
        cost: 45,
        desc: "**Total Usage**: `5`\n**Mana**: `45`\\💧\n**Timeout**: `yes`\n**Role**: `Support`\n\nAs a Vampire, Shalltear Bloodfallen can drain HP from her opponent to add it to herself. With every use of her ability, she will drain the equivalent of **20%** of her HP.\n\nDuring stampedes, Shalltear can aid her comrades by draining **8%** of the players hp from the enemy every 4 rounds.",
        shortdesc: "**Uses**: `5`\n**Cost**: `45 💧`\n**Timeout**: `Yes`\n**Role**: `DPS/Tank (Drain)`\n\n__**Active**__ (✨)\n- Drains **20%** of her max HP from the enemy\n\n__**Party**__ (👥)\n- Drains **8%** max HP from the enemy every **4** rounds",
        ability: async (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Shalltear drains the equivalent of 20% of her max HP from the enemy and adds it to herself.
            const drain = Math.floor(myStats.maxhp * 0.2);
            eStats.hp -= drain;
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, drain, {});
            if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
            if (eStats.hp < 0) eStats.hp = 0;
            notice.push(`\n✨ **${char.name}** has drained **${drain}**HP from **${enemy.name}**`);

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round % 4 === 0) {
                    const drain = Math.floor(myStats.maxhp * 0.08);
                    eStats.hp -= drain;
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, drain, {});
                    if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
                    if (eStats.hp < 0) eStats.hp = 0;
                    notice.push(`\n✨ **${name}** drained **${drain}**HP from **${enemy.name}**`);
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "2360": {
        usage: 3,
        used: 0,
        cost: 35,
        desc: "**Total Usage**: `3`\n**Mana**: `35`\\💧\n**Timeout**: `yes`\n**Role**: `Support`\n\nHer ability, the Code of Immortality grants C.C. with the burden of immortality. With every use of her ability, she gains an additional 14% of chance of revival for a total of 42% at most. If revived, C.C. will have 30%, 35% or 40% of HP depending on how often she used her ability. She can revive herself for a maximum of 3 times in a single match.",
        shortdesc: "**Uses**: `3`\n**Cost**: `35 💧`\n**Timeout**: `Yes`\n**Role**: `Support (Revive)`\n\n__**Passive**__\n- Increases maximum revival attempts to **3**\n\n__**Active**__ (✨)\n- Increases revival chance by **14%**\n- Increases revival-HP to **30%**/**35%**/**40%**",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // C.C. gains +14% chance of revival with 30/35/40% of max HP
            myStats.rev += 0.14;
            if (this.used === 1) myStats.revhp = 0.3, mybuff.revhp.push(new buffInfo("=", 0.3, 9999));
            else myStats.revhp += 0.05, mybuff.revhp.push(new buffInfo("+", 0.05, 9999));
            notice.push(`\n✨ **${char.name}** used her Code of Immortality for a **${Math.min(Math.round(myStats.rev * 100), 100)}**% chance of revival with **${100 * myStats.revhp}**% HP!`);

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.maxRevivals += 3;

            return AbilityResponse.SUCCESS;
        },
    },
    "2814": {
        usage: 1,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `1`\n**Mana**: `0`\\💧\n**Timeout**: `yes`\n**Role**: `Support`\n\nWith renowned experience in long distance fights, Tanya Degurechaff consumes all mana at the start of every round (up to **40** mana), gaining **1.5%** dodge chance that round for every mana consumed. She cannot have more than **70%** dodge rate at once.\n\nWhen pushed to the brink of death, she can self destruct as a last resort to take out her opponent. This requires her HP to be below **25%** of her max HP and will deal **300%** guaranteed damage. Tanya's HP will fall to **1** as well.",
        shortdesc: "**Uses**: `1`\n**Cost**: `0 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Mana-losing, Dodge, Nuke)`\n\n__**Passive**__\n- Consumes up to **40** 💧 every round to increase Dodge rate by **1.5%** for every 💧 consumed\n- Her dodge rate cannot exceed **70%**\n\n__**Active**__ (✨)\nWhen below **25%** HP:\n- Deals **300%** guaranteed DMG\n- Reduces HP to **1**",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Tanya Degurechaff
            if (myStats.hp / myStats.maxhp > 0.25) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                this.used--;
                matchStats.sendWarning({ content: `Self destruct can only be used once your hp is below **25%** of your max HP (${Math.floor(myStats.maxhp * 0.15)})`, ephemeral: true });
                return AbilityResponse.FAILURE;
            };
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used self destruct! She`, { atkMultiplier: 3, magicDamage: true, dodge: false });
            myStats.hp = 1;

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const mana = Math.min(40, myStats.sm);
                myStats.sm -= mana;
                myStats.dodge += Math.floor(0.015 * mana * 100) / 100;
                if (myStats.dodge > 0.7) myStats.dodge = 0.7;

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "3109": {
        usage: 1,
        used: 0,
        cost: 40,
        desc: "**Total Usage**: `1`\n**Mana**: `40`\\💧\n**Timeout**: `no`\n**Role**: `Tank/Support`\n\nMaple's active ability is a single use, high-cost maneuver that converts **75%** of her DEF and MR into ATK and MD respectively for **3** rounds. This move allows her to switch from a defensive role to a potent damage dealer. Additionally, Maple recovers **50%** of her missing health each round during this time.\n\nBecause of her bulky armor, Maple can't dodge any attacks but has an additional **+300** DEF and MR, making her more resilient against all kinds of attacks.\n\nIn a party, Maple boosts her party members resilience, effectively reducing the damage they take by **15%**.\n\n_15% damage reduction = 155 DEF|MR_",
        shortdesc: "**Uses**: `1`\n**Cost**: `40 💧`\n**Timeout**: `No`\n**Role**: `Tank/DPS (Mitigation, Sacrificial)`\n\n__**Passive**__\n- **+300** DEF & MR\n- Has **0%** dodge rate\n\n__**Active**__ (✨)\n- Converts **75%** of her DEF & MR into ATK & MD for **3** rounds\n- Restores **50%** of lost HP every round during this period\n\n__**Party**__ (👥)\n- **+155** DEF & MR",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Maple
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
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.5), {});

                return AbilityResponse.SUCCESS;
            }, 3));
            notice.push(`\n✨ **${char.name}** turned **75%** of her DEF and MR into ATK and MD respectively`);

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.dodge = 0;

                return AbilityResponse.SUCCESS;
            }, 9999));
            mybuff.def.push(new buffInfo("+", 300, 9999));
            mybuff.mr.push(new buffInfo("+", 300, 9999));
            myStats.def += 300;
            myStats.mr += 300;

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.def += 155; // Takes 15% less damage
            myStats.mr += 155;
            mybuff.def.push(new buffInfo("+", 155, 9999));
            mybuff.mr.push(new buffInfo("+", 155, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    // "3150": {
    //     usage: 9999,
    //     used: 0,
    //     cost: 60,
    //     summoned: [],
    //     desc: "**Total Usage**: `max 3`\n**Mana**: `60`\\💧\n**Timeout**: `no`\n**Role**: `DPS`\n\nThanks to his ability to level up by fighting monsters, Sung Jin-Woo raises his level by 1 after every round for the duration of the fight. As the Shadow Monarch, he can summon one of his 3 loyal servants **Igris**, **Beru** or **Iron (SL)**. The user needs to have them in their inventory, and they take on their own stats (except ATK and MD, which is **60%** of Sung Jin Woo's ATK|MD). Once they're defeated, Sung Jin-Woo can no longer summon them.",
    //     ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
    //         matchStats.turn = matchStats.turnSkill ? 0 : 1;

    //         // Active: Sung Jin Woo summons either Igris, Beru or Iron (SL) from the users inventory. Passive:
    //         const inv = await getUserSchema(matchStats.interaction.user.id);
    //         if (!inv || !inv.chars.filter((e) => e === 3156 || e === 3159 || e === 3174).length) return matchStats.sendWarning({ content: "You don't have any of the characters **Igris**, **Beru** or **Iron (SL)** to summon.", ephemeral: true });

    //         myStats.sm -= this.cost;
    //         matchStats.myStatsCC = { ...myStats };
    //         matchStats.currentCharacter = 1;

    //         let obtained = [];
    //         if (inv.chars.includes(3156) && !this.summoned.includes(3156)) obtained.push(3156);
    //         if (inv.chars.includes(3159) && !this.summoned.includes(3159)) obtained.push(3159);
    //         if (inv.chars.includes(3174) && !this.summoned.includes(3174)) obtained.push(3174);
    //         if (!obtained.length) return matchStats.sendWarning({ content: "All your shadow soldiers have been defeated.", ephemeral: true });

    //         let pick = obtained[Math.floor(Math.random() * obtained.length)];
    //         this.summoned.push(pick);

    //         embed.setThumbnail(characters[pick].image);

    //         let newStats = await getDetailedStats(pick, inv, inv.dungeon_classlevels);
    //         ["hp", "maxhp", "def", "mr", "cr", "cd", "td", "br", "dodge"].forEach((e) => {
    //             myStats[e] = newStats[e];
    //         });

    //         myStats.atk = Math.floor(myStats.atk * 0.6);
    //         myStats.md = Math.floor(myStats.md * 0.6);
    //         myStats.mana = 30;
    //         myStats.sm = Math.min(30, myStats.sm) + this.cost;
    //         myStats.mg = 0;

    //         notice.push(`\n✨ **${char.name}** has summoned **${characters[pick].name}**`);
    //     },
    //     passive: (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
    //         // mybuff.maxhp.push(new buffInfo("+", 6.5, 9999));
    //         mybuff.hp.push(new buffInfo("+", 6, 9999));
    //         mybuff.atk.push(new buffInfo("+", 3, 9999, 3, "+"));
    //         mybuff.def.push(new buffInfo("+", 2, 9999, 2, "+"));
    //     },
    // },
    "4250": {
        usage: 9999,
        used: 0,
        cost: 80,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `80`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nWhen fighting an enemy, Guts channels his relentless fury in every strike, increasing his ATK by **20%**. However, his reckless and aggressive fighting style causes him to lose **5%** of his max HP every round, due to the wear and tear on his body from the intense battle.\nWhen Guts endures the relentless onslaught of his enemies, he gathers a portion of the pain and anguish they inflict upon him. He records damage taken (DoT excluded). When Guts uses his ability, he expends all recorded damage and releases a devastating strike dealing twice as much damage as he took, up to a maximum of **300%** of his base attack damage. This powerful attack serves as a testament to Guts' sheer resilience and indomitable spirit.",
        shortdesc: "**Uses**: `Unlimited`\n**Cost**: `80 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Sacrificial)`\n\n__**Passive**__\n- **+20%** ATK\n- Loses **5%** max HP every round\n- Records DMG taken\n\n__**Active**__ (✨)\n- Deals **2x** the recorded DMG taken to the enemy (Up to **300%** of his ATK)\n- Resets recorded DMG taken",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Active: Guts records damage taken and releases it x2 (max 300% ATK). DoT is excluded
            if ((myStats.damageTaken * 2) > 3 * myStats.atk) myStats.damageTaken = 3 * myStats.atk;
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: (myStats.damageTaken * 2) / myStats.atk, magicDamage: false });
            myStats.damageTaken = 0;

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Starts with decreased Stats
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
            mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp * 0.05), 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "4330": {
        usage: 9999,
        used: 0,
        cost: 60,
        pause: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `60`\\💧\n**Timeout**: `no`\n**Role**: `DPS`\n\nTetsuya Kuroko has significantly decreased offensive and defensive stats, specifically **20%** decreased ATK, MD, DEF and MR, but compensates by starting the battle with **80%** dodge chance. This however decreases by **5%** each round, stopping at **30%** dodge chance. Moreover, there's a **25%** chance of him stealing an enemy attack, countering it.\n\nAfter using his active, for **4** rounds Kuroko increases his ATK and MD by **30%**. During this period, the likelihood of him stealing an enemy attack increases to **35%**.\n\nIn a party, Kuroko assists party members with quick interceptions. For every **5** participation points the party member has, the chance of Kuroko stealing an enemy attack increases by **1%**, up to a maximum of **25%**. A successful steal allows Kuroko to perform an additional attack, dealing **120%** damage to the enemy.",
        shortdesc: "**Uses**: `Unlimited`\n**Cooldown**: `4 rounds`\n**Cost**: `60 💧`\n**Timeout**: `No`\n**Role**: `Support/Sub-DPS (Burst Dodge, Counter, Additional Attack)`\n\n__**Passive**__\n- **-20%** ATK, MD, DEF & MR\n- Begins battles with **80%** dodge rate, decreasing by **5%** every round, down to at most **30%**\n- **25%** chance to counter the next hit (stackable)\n\n__**Active**__ (✨)\nFor **4** rounds:\n- **+30%** ATK & MD\n- Likelihood of countering next hit increased from 25% to **35%**\n\n__**Party**__ (👥)\nFor every **5** participation points:\n- **+1%** chance of intervening (Up to **25%**) and dealing **120%** DMG every round",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Tetsuya Kuroko
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (this.pause > matchStats.round) {
                this.used--;
                myStats.sm += this.cost;
                matchStats.sendWarning({ content: `Tetsuya Kuroko needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                return AbilityResponse.FAILURE;
            };
            this.pause = matchStats.round + 4;

            // To increase counter chance in passive
            myStats.usedAbilityRound = matchStats.round;

            // Atk buffs
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.3), 3));
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.3), 3));
            myStats.atk += Math.floor(myStats.atk * 0.3);
            myStats.md += Math.floor(myStats.md * 0.3);

            notice.push(`\n🏀 **${char.name}** activated his Misdirection Overflow for 4 rounds!`);

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Atk Debuffs
            mybuff.atk.push(new buffInfo("+", -Math.floor(myStats.atk * 0.2), 9999));
            mybuff.md.push(new buffInfo("+", -Math.floor(myStats.md * 0.2), 9999));
            mybuff.def.push(new buffInfo("+", -Math.floor(myStats.def * 0.2), 9999));
            mybuff.mr.push(new buffInfo("+", -Math.floor(myStats.mr * 0.2), 9999));
            myStats.atk -= Math.floor(myStats.atk * 0.2);
            myStats.md -= Math.floor(myStats.md * 0.2);
            myStats.def -= Math.floor(myStats.def * 0.2);
            myStats.mr -= Math.floor(myStats.mr * 0.2);

            // Dodge Buff
            myStats.dodge = 0.8;

            // Dodge Decrease over Time + Counter Chance
            myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                myStats.dodge = Math.max(0.3, 0.8 - (0.05 * (matchStats.round - 1)));

                if (Math.random() < (myStats.usedAbilityRound < (matchStats.round - 3) ? 0.35 : 0.25)) myStats.counter += 1;

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async function (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if (matchStats.interaction.commandName === "stampede") {
                const stampede = await getLatestStampede();

                myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                    if (Math.random() < Math.min(125, stampede?.participation?.[matchStats.interaction.user.id]?.[1] || 0) / 500) {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🏀 **Tetsuya Kuroko** stole the shot! He`, { atkMultiplier: 1.2 });
                    };

                    return AbilityResponse.SUCCESS;
                }, 9999));
            };

            return AbilityResponse.SUCCESS;
        },
    },
    // "4334": {
    //     usage: 9999,
    //     used: 0,
    //     cost: 0,
    //     pause: 0,
    //     desc: "**Total Usage**: `unlimited`\n**Mana**: `40 (Can be substituted with 10% max HP)`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nTaiga Kagami is known for his offensive capabilities from massive jumps and powerful dunks, making him a formidable opponent with brute force. Thanks to his athleticism, he enters battles with **+25%** critical DMG and **+10%** chance to counter attacks. Upon falling below **50%** HP the first time, he enters `ZONE`, where he steals **15%** dodge rate from the enemy, and decreases their DEF & MR by **20%**, lasting permanently.\n\nUpon using his active, if he doesn't have the required mana, he'll instead consume **10%** of his max HP to elevate his arms. If his HP is above **1** after the consumption, he slams the shot, dealing **130%** DMG and boosting his ATK by **15%** for the next **2** turns. Yet if his HP does fall below **1** HP, he remains at **1** HP and instead uses Meteor Jam, a defining dunk that shatters all expectations, dealing **300%** DMG and boosting his ATK by **30%** for the next **2** rounds.\n\nIn a party, Kagami assists party members with quick rebounds, boosting ally's ATK by **10%**. Moreover, he deals an additional instance of **30%** DMG to the enemy when the ally counters. If the ally is Tetsuya Kuroko, all of the buffs/effects aforementioned will have **doubled** effectiveness.",
    //     shortdesc: "**Uses**: `Unlimited`\n**Cost**: `40 💧 (Can be substituted with 10% max HP)`\n**Timeout**: `Yes`\n**Role**: `DPS (Sacrificial, Nuke, Additional Attack)`\n\n__**Passive**__\n- **+25%** critical DMG\n- **+10%** chance to counter attacks (stackable)\nUpon falling below **50%** HP the first time:\n- Steals **15%** dodge rate permanently\n- Decreases enemy's DEF & MR by **20%** permanently\n\n__**Active**__ (✨)\n> If he does not have sufficient mana, consumes **10%** max HP instead as substitute.\n\nIf he is at **1** HP or more:\n- Deals **130%** DMG\n- Increases ATK by **15%** for the next **2** turns\n\nElse:\n- Remains at **1** HP\n- Deals **300%** DMG\n- Increases ATK by **30%** for the next **2** turns\n\n__**Party**__ (👥)\n- **+10%** ATK\n- Follows up any counters by the ally, dealing **30%** DMG\n- If Tetsuya Kuroko is the ally, gains **doubled** effectiveness from the aforementioned buffs/effects",
    //     ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
    //         // Taiga Kagami

    //         // Active cost
    //         if (myStats.sm < 40) {
    //             myStats.hp -= myStats.maxhp * 0.1;
    //         } else {
    //             myStats.sm -= 40;
    //         };

    //         // Meteor Jam
    //         if (myStats.hp <= 0) {
    //             myStats.hp = 1;
    //             dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🌠 **${char.name}** used Meteor Jam! He`, { atkMultiplier: 3 });
    //             // ATK buffs (Doubled effectiveness)
    //             mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.3), 2));
    //         } else {
    //             dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🏀 **${char.name}** slammed the shot! He`, { atkMultiplier: 1.3 });
    //             // ATK buffs
    //             mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.15), 2));
    //         };

    //         return AbilityResponse.SUCCESS;
    //     },
    //     passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
    //         myStats.zone = false;

    //         // Crit DMG Buff
    //         mybuff.cd.push(new buffInfo("+", 0.25, 9999));
    //         myStats.cd += 0.25;

    //         // Counter Chance
    //         myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
    //             if (Math.random() < 0.1) myStats.counter += 1;

    //             // Zone (One-time)
    //             if ((myStats.hp / myStats.maxhp < 0.4) && !myStats.zone) {
    //                 notice.push(`\n💢 We have to win... **${char.name}** entered ZONE.`);
    //                 let def_debuff = 0.2;
    //                 myStats.zone = true;

    //                 eStats.dodge -= 0.15;
    //                 if (eStats.dodge < 0) eStats.dodge = 0;
    //                 myStats.dodge += 0.15;
    //                 if (myStats.dodge > 1) myStats.dodge = 1;
    //                 eStats.def -= Math.floor(eStats.def * def_debuff);
    //                 eStats.mr -= Math.floor(eStats.mr * def_debuff);

    //                 ebuff.dodge.push(new buffInfo("=", Math.min(eStats.dodge - 0.15, 0), 9999));
    //                 mybuff.dodge.push(new buffInfo("=", Math.min(myStats.dodge + 0.15, 1), 9999));
    //                 ebuff.def.push(new buffInfo("+", Math.floor(eStats.def * def_debuff), 9999));
    //                 ebuff.mr.push(new buffInfo("+", Math.floor(eStats.mr * def_debuff), 9999));
    //             };

    //             return AbilityResponse.SUCCESS;
    //         }, 9999));

    //         return AbilityResponse.SUCCESS;
    //     },
    //     party: async function (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
    //         let buff_multiplier = 1;
    //         // Kuroko synergy
    //         if (myStats.name == "Tetsuya Kuroko") {
    //             buff_multiplier = 2;
    //             notice.push(`\n✨ I won't let your ray of hope go out this time.`);
    //         };

    //         // General DMG buff
    //         myStats.atk += Math.floor(myStats.atk * 0.1 * buff_multiplier);
    //         mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * buff_multiplier), 9999));

    //         // Upon ally counter, follows up with additional hit
    //         matchStats.on("counter", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
    //             if (target == myStats) {
    //                 dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `=͟͟͞͞🏀 **${char.name}** followed up with an alley-oop! He`, { atkMultiplier: 0.3 * buff_multiplier });
    //             }
    //         });

    //         return AbilityResponse.SUCCESS;
    //     },
    // },
    "4767": {
        usage: 0,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `0`\n**Timeout**: `no`\n**Role**: `DPS`\n\nDespite living in a world of magic and sorcery, Asta cannot use magic at all. Neverthless he keeps fighting without any abilities, relying purely on his physical strength. Then not all hope is yet lost for him. With his special Anti Magic grimoire he can block his enemies from using their abilities as well, overcoming their difference in battle strength. Not only that, but Asta benefits from having a **30%** increased attack stat for the duration of the whole fight.",
        shortdesc: "**Uses**: `0`\n**Role**: `DPS/Support (Damage, Anti-ability)`\n\n__**Passive**__\n- **+30%** ATK\n- Enemy cannot use curses/abilities\n- Asta cannot benefit from class passives, or use abiltiies/class abilities",
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Starts with increased ATK
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.3), 9999));
            myStats.atk += Math.floor(myStats.atk * 0.3);

            return AbilityResponse.SUCCESS;
        },
    },
    "4913": {
        usage: 1,
        used: 0,
        roundUsed: -1,
        mgId: -1,
        brId: -1,
        cost: 0,
        desc: "**Total Usage**: `1+1`\n**Mana**: `20`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nLugh Tuatha Dé is a character built around timing and strategical thinking, offering both a long-term pay-off and immediate gains. His normal attacks fire off a ten-bullet barrage, each one dealing **9%** damage and increasing his crit damage by **3%** per hit for the following two rounds.\n\nHis ability, when activated, starts charging his attack Gungnir. During this time, Lugh stops generating mana but increases his block rate by **20%** as he focuses on defending himself and winning time. The second activation finally releases his charged attack, whose power increases by **40%** for each round up to a maximum of **10** rounds. This is followed by a permanent **20%** ATK & MD reduction on the enemy as they are pierced by this attack.\n\nWhen in a party, Lugh brings a combination of utility and raw power. For the first five rounds while charging his attack, he boosts mana generation by **+25**. After that, he fires off his charged Gungnir, dealing **200%** damage and reducing the enemy's ATK & MD by **20%** permanently. Additionally, the ally gains **15%** boosts on crit rate and crit damage for the rest of the battle.",
        shortdesc: "**Uses**: `1+1`\n**Cost**: `20 💧`\n**Timeout**: `Yes`\n**Role**: `DPS/Tank (Nuke, Block, Disarm)`\n\n__**Passive**__\nATTACK is altered to **10** bullet hits:\n- Each deal **9%** DMG\n- Every hit bullet increases his critical DMG by **3%** for the next **2** rounds\n- Missing any of the 10 hits will only tigger effects related to missing an attack once.\n\n__**Active**__ (✨)\nBegins charging Gungir:\n- Halts mana regeneration\n- **+20%** Block rate\n\nUsing the active (✨) again releases Gungir:\n- Removes effects of charging\n- Deals **40%** DMG for every round charged, up to **400%**\n- **-20%** enemy's ATK & MD\n\n__**Party**__ (👥)\nDuring the first **5** rounds:\n- **+4** Mana regeneration\n\nAfterwards:\n- Deals **130%** DMG once\n- **-20%** enemy's ATK & MD\n- **+15%** critical rate & critical DMG",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Lugh Tuatha Dé
            if (this.roundUsed === -1) {
                this.used--;
                if (myStats.sm < 20) {
                    matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/20\\💧)`, ephemeral: true });
                    return AbilityResponse.FAILURE;
                };
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

                const damageMultiplier = 1 + (0.4 * Math.min(10, matchStats.round - this.roundUsed));

                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Gungnir! He`, { atkMultiplier: damageMultiplier, shieldBreak: true, magicDamage: false, dodge: false, block: false });

                ebuff.atk.push(new buffInfo("+", -Math.floor(eStats.atk * 0.2), 9999));
                ebuff.md.push(new buffInfo("+", -Math.floor(eStats.md * 0.2), 9999));
                eStats.atk -= Math.floor(eStats.atk * 0.2);
                eStats.md -= Math.floor(eStats.md * 0.2);
            };

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.replaceButton.atk = {
                "emoji": "⚔️",
                "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    let hits = 0;
                    for (let i = 0; i < 10; i++) {
                        hits += (Math.random() > eStats.dodge ? 1 : 0);
                    };
                    mybuff.cd.push(new buffInfo("+", 0.03 * hits, 2));
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**'s ${hits}/10 bullets hit! He`, { atkMultiplier: 0.09 * hits, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true }); // normal magical damage
                    if (hits < 10) matchStats.trigger("miss", myStats, eStats, mybuff, ebuff);

                    return AbilityResponse.SUCCESS;
                },
            };

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round < 6) {
                    myStats.sm += 25;
                } else if (matchStats.round === 6) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}** used Gungnir! He`, { atkMultiplier: 2, shieldBreak: true, magicDamage: false, dodge: false, block: false });
                    ebuff.atk.push(new buffInfo("+", -Math.floor(eStats.atk * 0.2), 9999));
                    ebuff.md.push(new buffInfo("+", -Math.floor(eStats.md * 0.2), 9999));
                    eStats.atk -= Math.floor(eStats.atk * 0.2);
                    eStats.md -= Math.floor(eStats.md * 0.2);
                } else {
                    myStats.cr += 0.15;
                    if (myStats.cr > 1) myStats.cr = 1;
                    myStats.cd += 0.15;
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "4942": {
        usage: 1,
        used: 0,
        cost: 80,
        desc: "**Total Usage**: `max 1`\n**Mana**: `80`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nCid Kagenou tries his best to blend into the background and become a mob character. His attack and magic damage are decreased by **20%** for that during this phase, as well as his dodge chance and block rate which are nonexistent. However, when his HP falls below **50%** he will unveil his true identity as Shadow and increase his attack & magic damage by **25%**, defense & magic resist by **10%**, dodge chance & block rate by **+10%** and heal himself for **30%** of missing HP. Moreover, this removes all existing shield (SH) on the enemy. Using his active, Shadow will use his almighty power and deal **200%** damage which can't be dodged nor blocked.",
        shortdesc: "**Uses**: `1`\n**Cost**: `0 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Transform, Burst)`\n\n__**Passive**__\n- **-20%** ATK & MD\n- Dodge and Block rate reduced to **0%**\n\nWhen fallen below **50%** HP:\n- Removes previous passive debuffs\n- **+25%** ATK & MD\n- **+10%** DEF & MR\n- **+10%** Dodge & Block rate\n- Restore **30%** lost HP\n- Removes all existing enemy shield\n\n__**Active**__ (✨)\n- Deals **200%** undodgeable unblockable DMG",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Active: Cid Kagenou deals 250% damage. Passive: Enters his shadow form when HP falls below 50%
            notice.push(`\n<:atomic:1076326318565765150> _**I... AM... ATOMIC**_`);
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 2, magicDamage: true, dodge: false, block: false });

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Starts with decreased Stats
            myStats.atk = Math.floor(myStats.atk * 0.8);
            myStats.md = Math.floor(myStats.md * 0.8);
            myStats.dodge = 0;
            myStats.br = 0;

            // Delayed Buff
            myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp / myStats.maxhp < 0.5) {
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.3), {});
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
                        matchStats.trigger("shieldBreak", myStats, eStats, mybuff, ebuff);
                    };
                    notice.push(`\n✨ **${char.name}** entered his shadow form!`);
                    embed.setThumbnail("https://i.imgur.com/2VZTpDS.png");
                    //@ts-ignore
                    this._used++;
                } else {
                    myStats.atk = Math.floor(myStats.atk * 0.8);
                    myStats.md = Math.floor(myStats.md * 0.8);
                    myStats.dodge = 0;
                    myStats.br = 0;
                };

                return AbilityResponse.SUCCESS;
            }, 9999, 1));

            return AbilityResponse.SUCCESS;
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
        desc: "**Total Usage**: `4`\n**Mana**: `50`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nYue gains Magic Resistance and Health proportional to her ATK (**20%**, **30%** respectively) which she keeps till the end of the match. Additionally, Yue heals herself for **8%** of all damage dealt as a passive.",
        shortdesc: "**Uses**: `4`\n**Cost**: `50 💧`\n**Timeout**: `Yes`\n**Role**: `DPS/Tank (MR-scaling, Anti-MD, Lifesteal)`\n\n__**Passive**__\n- **+8%** lifesteal\n\n__**Active**__ (✨)\n- Gains MR equivalent to **20%** of her ATK\n- Recovers HP equivalent to **30%** of her ATK",
        ability: async (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Yue
            matchStats.turn = matchStats.turnSkill ? 0 : 1; // Yue
            let hmr = Math.floor(myStats.atk * 0.2);
            mybuff.mr.push(new buffInfo("+", hmr, 9999));
            myStats.mr += hmr;
            let hHp = Math.floor(myStats.atk * 0.3);
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, hHp, {});
            if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
            notice.push(`\n✨ **${char.name}** recovered **${hHp}** HP. Gained **${hmr}** Magic Resist`);

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.selfhealChance.push(1);
            myStats.selfheal.push(0.8);

            return AbilityResponse.SUCCESS;
        },
    },
    "6029": {
        usage: 0,
        used: 0,
        cost: 100,
        desc: "**Total Usage**: `0`\n**Role**: `Support/Sub-DPS`\n\nVladilena Milizé's ability is a Tactical Skill that brings the full force of mechanized artillery to aid her comrades during stampedes. Entering battle, she activates all processors and deals an undodgeable **150%** DMG hit.\n\nIn parties, she shows her strategic nature that embodies her character as a commander. During the first round, she deals an undodgeable **150%** hit to the opponent. For every round afterwards, she has a **25%** chance of comanding a devastating artillery bombardment on the enemy ranks, dealing **120%** damage.\n\nThanks to the accurate analysis and pinpointing by Vladilena, the enemy takes **+10%** damage from attacks. This is considered a vulnerability effect, where only the highest takes effect.\n\nMoreover, for each **S** or **SS** character from her anime `\"86 -Eighty Six-\"` in her party (excluding herself), Vladilena's chance of intervention is increased by an additional **+25%** (up to **100%**).",
        shortdesc: "**Uses**: `0`\n**Role**: `Support/Sub-DPS`\n\n__**Passive**__\n- Deals **150%** undodgeable DMG to the enemy upon entering battle\n\n__**Party**__ (👥)\n- Applies a **10%** vulnerability debuff to the enemy (Only the highest takes effect)\n- Deals **150%** undodgeable DMG to the enemy upon entering battle\n- **25%** chance to intervene every round and deal **120%** DMG\n  - The chance to intervene is increased by an additional **+25%** for each S or SS character from her anime `\"86 -Eighty Six-\"` in her party (excluding herself)",
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Vladilena Milize
            eStats.vulnerability ??= 1;
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ Don't leave me behind... **${char.name}**`, { atkMultiplier: 1.5, magicDamage: true, dodge: false });

            return AbilityResponse.SUCCESS;
        },
        party: async function (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            const name = pStats.name;

            const mates = [6030, 6028, 6031, 6033, 6034];
            const allyCount = matchStats.partyChars.reduce((count: number, pChar: charInfo) => mates.includes(pChar.id) ? count + 1 : count, 0);
            const bombChance = 0.25 * (allyCount + 1);

            // Apply vulnerability
            eStats.vulnerability = Math.max(eStats.vulnerability, 1.1);

            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 1.5, magicDamage: true, dodge: false });

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < bombChance) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 1.2, magicDamage: true, dodge: false });
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "8189": {
        usage: 9999,
        used: 0,
        cost: 0,
        armor: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `0`\\💧, then `15`\\💧 continuously\n**Timeout**: `no`\n**Role**: `DPS`\n\nWith her Re-Equip magic, Erza Scarlet is able to select between 5 different armors to face her opponent as needed. With every use of her ability, she will cycle through her armors, and she'll use up 15 mana every round. She will not gain any mana while she has an armor equipped. Her inventory is as follows:\n\n__Fire Empress Armor__: Grants her **60%** ATK but decreases DEF by **20%**\n__Adamantine Armor__: Grants her **60%** DEF but decreases ATK by **20%**\n__Heaven's Wheel Armor__: Grants her **25%** ATK and DEF\n__Clear Heart Clothing__: Grants her **10%** ATK, **+20%** crit rate, **+50%** crit damage and **+10%** dodge chance\n__Armadura Fairy__: Heals her for **10%** of max HP per round",
        shortdesc: "**Uses**: `Unlimited`\n**Cost**: `0 💧, then 15 💧 every round`\n**Timeout**: `No`\n**Role**: `DPS/Tank (Mana-losing, Versatile)`\n\n__**Active**__ (✨)\nWears/ rotates to the next armor:\n- Halts mana regeneration as long as the armor rotation is active\nArmor options:\n- Fire Empress Armor: **+60%** ATK , **-20%** DEF\n- Adamantine Armor: **+60%** DEF , **-20%** ATK\n- Heaven's Wheel Armor: **+25%** ATK & DEF\n- Clear Heart Clothing: **+10%** ATK, **+20%** Critical rate, **+50%** Critical  damage and **+10%** dodge chance\n- Armadura Fairy: Restores **10%** of max HP every round",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            matchStats.turn = matchStats.turnSkill ? 0 : 1; // Erza Scarlet can change between 5 different equipment
            if (myStats.sm < 15) {
                matchStats.sendWarning({ content: "You need at least **15**\\💧 to sustain this form", ephemeral: true });
                return AbilityResponse.FAILURE;
            };
            matchStats.consumeMana = 15;

            // clear previous armors effects
            if (matchStats.heap1.length > -1) {
                matchStats.heap1.forEach((e: { type: keyof Buffs; id: number; buff: number; }) => {
                    mybuff[e.type].forEach((a: IbuffInfo, i: number) => {
                        if (a.id === e.id) mybuff[e.type].splice(i, 1);
                    });
                    if (e.type === "mg") myStats[e.type] += e.buff;
                    else myStats[e.type] -= e.buff;
                });
                // matchStats.consumeMana = 0;
                matchStats.heap1 = [];
            };

            // Add new buffs to heap
            let armorName, atkbuff, defbuff, crbuff, cdbuff, dodgebuff, hpbuff, mgbuff = new buffInfo("=", 0, 9999);
            switch (this.armor++ % 5) {
                case 0: embed.setThumbnail("https://i.ibb.co/KFLzdqd/f.png"); armorName = "Fire Empress Armor. She gained **60%** ATK, decreased DEF by **20%**"; atkbuff = new buffInfo("+", Math.floor(myStats.atk * 0.6), 9999); defbuff = new buffInfo("+", -Math.floor(myStats.def * 0.2), 9999); mybuff.atk.push(atkbuff); mybuff.def.push(defbuff); mybuff.mg.push(mgbuff); matchStats.heap1 = [{ type: "atk", id: atkbuff.id, buff: Math.floor(myStats.atk * 0.6) }, { type: "def", id: defbuff.id, buff: -Math.floor(myStats.def * 0.2) }, { type: "mg", id: mgbuff.id, buff: myStats.mg }]; myStats.atk += Math.floor(myStats.atk * 0.6); myStats.def += -Math.floor(myStats.def * 0.2); myStats.mg = 0; break;
                case 1: embed.setThumbnail("https://i.ibb.co/HG4tHWt/a.png"); armorName = "Adamantine Armor. She gained **60%** DEF, decreased ATK by **20%**"; atkbuff = new buffInfo("+", -Math.floor(myStats.atk * 0.2), 9999); defbuff = new buffInfo("+", Math.floor(myStats.def * 0.6), 9999); mybuff.atk.push(atkbuff); mybuff.def.push(defbuff); mybuff.mg.push(mgbuff); matchStats.heap1 = [{ type: "atk", id: atkbuff.id, buff: -Math.floor(myStats.atk * 0.2) }, { type: "def", id: defbuff.id, buff: Math.floor(myStats.def * 0.6) }, { type: "mg", id: mgbuff.id, buff: myStats.mg }]; myStats.atk += -Math.floor(myStats.atk * 0.2); myStats.def += Math.floor(myStats.def * 0.6); myStats.mg = 0; break;
                case 2: embed.setThumbnail("https://i.ibb.co/VDPkR10/w.png"); armorName = "Heaven's Wheel Armor. She gained **25%** ATK and DEF"; atkbuff = new buffInfo("+", Math.floor(myStats.atk * 0.25), 9999); defbuff = new buffInfo("+", Math.floor(myStats.def * 0.25), 9999); mybuff.atk.push(atkbuff); mybuff.def.push(defbuff); mybuff.mg.push(mgbuff); matchStats.heap1 = [{ type: "atk", id: atkbuff.id, buff: Math.floor(myStats.atk * 0.25) }, { type: "def", id: defbuff.id, buff: Math.floor(myStats.def * 0.25) }, { type: "mg", id: mgbuff.id, buff: myStats.mg }]; myStats.atk += Math.floor(myStats.atk * 0.25); myStats.def += Math.floor(myStats.def * 0.25); myStats.mg = 0; break;
                case 3: embed.setThumbnail("https://i.ibb.co/TH4gNq5/c.png"); armorName = "Clear Heart Clothing. She gained **10%** ATK, **+20%** crit rate, **+50%** crit damage, and **+10%** dodge chance"; atkbuff = new buffInfo("+", Math.floor(myStats.atk * 0.1), 9999); crbuff = new buffInfo("+", 0.2, 9999); cdbuff = new buffInfo("+", 0.5, 9999); dodgebuff = new buffInfo("+", 0.1, 9999); mybuff.atk.push(atkbuff); mybuff.cr.push(crbuff); mybuff.cd.push(cdbuff); mybuff.dodge.push(dodgebuff); mybuff.mg.push(mgbuff); matchStats.heap1 = [{ type: "atk", id: atkbuff.id, buff: Math.floor(myStats.atk * 0.1) }, { type: "cr", id: crbuff.id, buff: 0.2 }, { type: "cd", id: cdbuff.id, buff: 0.5 }, { type: "dodge", id: dodgebuff.id, buff: 0.1 }, { type: "mg", id: mgbuff.id, buff: myStats.mg }]; myStats.atk += Math.floor(myStats.atk * 0.1); myStats.cr += 0.2; myStats.cd += 0.5; myStats.dodge += 0.1; myStats.mg = 0; break;
                case 4: embed.setThumbnail("https://i.imgur.com/TDbvwEX.png"); armorName = "Armadura Fairy. She will gain **10%** HP every round"; hpbuff = new buffInfo("+", Math.floor(myStats.maxhp * 0.1), 9999); mybuff.hp.push(hpbuff); mybuff.mg.push(mgbuff); matchStats.heap1 = [{ type: "hp", id: hpbuff.id, buff: Math.floor(myStats.maxhp * 0.1) }, { type: "mg", id: mgbuff.id, buff: myStats.mg }]; /* addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp*0.1), { }); myStats.hp > myStats.maxhp ? myStats.hp = myStats.maxhp : false; */ myStats.mg = 0; break;
                default: false; break;
            };
            notice.push(`\n✨ **${char.name}** changed to ${armorName}`);

            return AbilityResponse.SUCCESS;
        },
    },
    "8194": {
        usage: 9999,
        used: 0,
        cost: 50,
        stacks: 0,
        pause: 0,
        desc: "**Total Usage**: `unlimited` (4 rounds cooldown on `Dark Blast Inferno`)\n**Mana**: `50`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nZeref, the Black Wizard, thrives in the heart of battle, using his dark powers to overwhelm his foes, even passively killing things around him. He deals **15-25%** magic damage randomly every round until his opponent has less than **33%** hp left. And due to his curse, Zeref is immortal, which causes him to regenerate **5%** of his missing HP every round.\n\nHis active ability grants him a stack of Dark Cage, each one reducing damage taken by **4%** (up to **5** stacks). While his stacks are less than 4, Zeref will use `Dark Blaze`, dealing **130%** magic damage and inflicting a black flame debuff which will deal additional **20%** magic damage for 2 rounds. If he has **4+** stacks of Dark Cage, Zeref will use `Dark Blast Inferno`, dealing **160%** magic damage and inflicting black flame for 3 rounds.\n\nWhen in a party, everyone suffers from his `Death Predation` passive, dealing **20%** magic damage to party members and **40%** magic damage to enemies every round. However, if **Natsu Dragneel** is in the party, he will not only be immune to the passive damage, but also receive a **40%** ATK and MD increase thanks to Zeref enacting the `E.N.D.` protocol. But because of this, Zeref himself will take **40%** magic damage every round due to `E.N.D.`",
        shortdesc: "**Uses**: `Unlimited`\n**Cooldown**: `4 rounds after Dark Blast Inferno`\n**Cost**: `50 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Additional Attack, Survival, DoT)`\n\n__**Passive**__\n- Recovers **5%** missing HP every round\n- Deals **15%-25%** MD to the enemy when they have **33%+** HP\n\n__**Active**__ (✨)\n- Every use of his active (✨) grants him **1x** `Dark Cage` (Up to 5x)\n- Every `Dark Cage` increases his DEF/MR by **40**\nWhen he has less than **4x** `Dark Cage`:\n- Deals **130%** MD\n- Deals **20%** MD for **2** rounds\nElse, uses Dark Blast Inferno:\n- Deals **160%** MD\n- Deals **20%** MD for **3** rounds\n\n__**Party**__ (👥)\nEvery round:\n- Deals **20%** MD to allies\n- Deals **40%** MD to enemies\n\nIf Natsu Dragneel is in party:\n- Natsu will be immune to the passive DMG\n- Natsu will have **+40%** ATK & MD\n- Zeref takes **40%** MD every round",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Zeref Dragneel
            if (this.pause > matchStats.round) {
                myStats.sm += this.cost;
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: `Zeref needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                this.used--;
                return AbilityResponse.FAILURE;
            };

            if (this.stacks < 4) {
                this.stacks++;
                myStats.def += 40;
                myStats.mr += 40;
                mybuff.def.push(new buffInfo("+", 40, 9999));
                mybuff.mr.push(new buffInfo("+", 40, 9999));

                let dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Dark Blaze! He`, { atkMultiplier: 1.3, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });
                ebuff.hp.push(new buffInfo("+", -Math.floor(dmg * (2 / 13)), 2));
            } else {
                this.pause = matchStats.round + 4;

                if (this.stacks === 4) {
                    this.stacks++;
                    myStats.def += 40;
                    myStats.mr += 40;
                    mybuff.def.push(new buffInfo("+", 40, 9999));
                    mybuff.mr.push(new buffInfo("+", 40, 9999));
                };

                let dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Dark Blast Inferno! He`, { atkMultiplier: 1.6, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });
                ebuff.hp.push(new buffInfo("+", -Math.floor(dmg * (2 / 16)), 3));
            };

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.mdChance = 1;
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.05), {});

                if ((eStats.hp / eStats.maxhp) > 0.33) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.15 + (0.1 * Math.random()), magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });
                };

                if (matchStats.interaction.commandName === "stampede") {
                    const names = matchStats.partyChars.map((e: IcharInfo) => e.name);
                    if (names.includes("Natsu Dragneel")) {
                        dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.4, magicDamage: true, mdChance: -1 });
                    };
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            if (myStats.name === "Natsu Dragneel") {
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.4), 9999));
                mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.4), 9999));
                myStats.atk += Math.floor(myStats.atk * 0.4);
                myStats.md += Math.floor(myStats.md * 0.4);
            } else {
                myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.2, magicDamage: true, mdChance: -1 });
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.4, magicDamage: true, mdChance: -1 });

                    return AbilityResponse.SUCCESS;
                }, 9999));
            };

            return AbilityResponse.SUCCESS;
        },
    },
    "8521": {
        usage: 3,
        used: 0,
        cost: 60,
        desc: "**Total Usage**: `3`\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nKiyotaka Ayanokouji seems like an ordinary student from the outside, leading his enemies to underestimate him and letting their guards down, decreasing defense by **20%** and block rate as well as dodge chance by **30%**. On top of this, he has a **10%** chance of countering any attack aimed at him. While he'll go easy on most challenges coming his way, seemingly with no ambitions whatsoever, Ayanokouji will do anything it takes to win. Step by step, Ayanokouji increases his attack by **15%**, **25%** and **33%** permanently and increases his dodge chance by **5%** each time. Because winning is everything in this world. As long as he wins in the end... that's all that matters.",
        shortdesc: "**Uses**: `3`\n**Cost**: `60 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (ATK-boost, Dodge, Counter, Anti-dodge/block)`\n\n__**Passive**__\n- **-20%** enemy's DEF\n- **-30%** enemy's Dodge rate & Block rate\n- **10%** chance to counter an attack\n\n__**Active**__ (✨)\nFirst use:\n- **+15%** ATK , **+5%** Dodge rate\nSecond use:\n- **+10%** ATK, **+5%** Dodge rate\nThird use:\n- **+8%** ATK, **+5%** Dodge rate\n\nNote: The attack buffs stack multiplicatively",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Kiyotaka Ayanokouji increases his attack by 15/25/33% and gains +5% dodge chance
            // if (this.used === 1) {
            //     embed.setThumbnail("https://i.ibb.co/y8MDgRD/g.gif");
            //     mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.15), 9999));
            //     myStats.atk = Math.floor(myStats.atk * 1.15);
            //     myStats.dodge += 0.05;
            //     mybuff.dodge.push(new buffInfo("+", 0.05, 9999));
            //     notice.push(`\n✨ **${char.name}** decides to get slightly serious. Increased ATK by **15%** and dodge by **+5%**`);
            // }

            switch (this.used) {
                case 1: embed.setThumbnail("https://i.ibb.co/y8MDgRD/g.gif"); mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.15), 9999)); myStats.atk = Math.floor(myStats.atk * 1.15); myStats.dodge += 0.05; mybuff.dodge.push(new buffInfo("+", 0.05, 9999)); notice.push(`\n✨ **${char.name}** decides to get slightly serious. Increased ATK by **15%** and dodge by **+5%**`); break;
                case 2: mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.1), 9999)); myStats.atk = Math.floor(myStats.atk * 1.1); myStats.dodge += 0.05; mybuff.dodge.push(new buffInfo("+", 0.05, 9999)); notice.push(`\n✨ **${char.name}** gets a little more serious. Increased ATK by **25%** and dodge by **+5%**`); break;
                case 3: mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.08), 9999)); myStats.atk = Math.floor(myStats.atk * 1.08); myStats.dodge += 0.05; mybuff.dodge.push(new buffInfo("+", 0.05, 9999)); notice.push(`\n✨ **${char.name}** goes all out. Increased ATK by **33%** and dodge by **+5%**`); break;
                default: false; break;
            };

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.def *= 0.8;
            eStats.br *= 0.7;
            eStats.dodge *= 0.7;
            ebuff.def.push(new buffInfo("*", 0.8, 9999));
            ebuff.br.push(new buffInfo("*", 0.7, 9999));
            ebuff.dodge.push(new buffInfo("*", 0.7, 9999));
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.1) myStats.counter = Math.max(1, myStats.counter ?? 0);

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "8890": {
        usage: 9999,
        used: 0,
        cost: 40,
        roundUsed: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `40`\\💧\n**Timeout**: `no`\n**Role**: `DPS`\n\nBeing one of the strongest psychic heroes, Tatsumaki's attacks always deal magic damage. She has **20%** increased magic damage throughout the battle, and decreases her enemy's magic resistance by **30%** for **5** rounds when using her ability, making them more vulnerable towards her attacks.",
        shortdesc: "**Uses**: `Unlimited`\n**Cost**: `40 💧`\n**Timeout**: `No`\n**Role**: `DPS (MR-shred, MD-boost)`\n\n__**Passive**__\n- Attacks deal MD hits\n- **+20%** MD\n\n__**Active**__ (✨)\n- **-30%** enemy's MR for **4** rounds (including turn of activation)",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Tatsumaki decreases enemy magic resistance
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (matchStats.round === this.roundUsed) {
                myStats.sm += this.cost;
                matchStats.sendWarning({ content: "You can't stack Tatsumaki's ability", ephemeral: true });
                return AbilityResponse.FAILURE;
            };
            this.roundUsed = matchStats.round;

            eStats.mr = Math.floor(eStats.mr * 0.7);
            ebuff.mr.push(new buffInfo("*", 0.7, 4));

            notice.push(`\n✨ **${char.name}** decreased enemy magic resistance by **30%** for 5 rounds!`);

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.mdChance = 1;
            let atkBonus = Math.floor(myStats.md * 0.2);
            myStats.md += atkBonus;
            mybuff.md.push(new buffInfo("+", atkBonus, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "9000": {
        usage: 9999,
        used: 0,
        cost: 25,
        pause: 0,
        usedFinal: false,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `25, 50, 75, and 100+`\\💧 depending on how much you have\n**Timeout**: `yes`\n**Role**: `DPS`\n\nIchigo's ability is split into 4 different parts, and depending on his current mana his ability will have differing effects. If his mana is between 25-49\\💧, Ichigo deals an attack dealing **120%** damage, which can be both physical or magic damage depending on his other stats. If he has 50-74\\💧 he increases his ATK and MD by **30%** and his DEF by **10%** for 4 rounds. If it is between 75-99\\💧 he will double his ATK and MD but decrease DEF by **20%** for 3 rounds. Above this, his entire mana will be converted into ATK and MD (1\\💧 = 1% boost, up to 150%) and reduce enemy block rate to **0%** for 3 rounds. However, after using his Final Getsuga Tensho Ichigo needs to rest for 5 rounds, during which he can't use his ability.",
        shortdesc: "**Uses**: `Unlimited`\n**Cooldown**:`5 rounds after Active (IV)`\n**Timeout**: `Yes`\n**Role**: `DPS (Mana-conversion, ATK-boost, Nuke, Anti-block)`\nNote: Ichigo's active always uses the highest effect possible mana-wise\n\n__**Active (I)**__ (✨)\n**Cost**: `25 💧`\n> Deals **120%** DMG\n\n__**Active (II)**__ (✨)\n**Cost**: `50 💧`\n> For **4** rounds: **+30%** ATK & MD, **-10%** DEF & MR\n\n__**Active (III)**__ (✨)\n**Cost**: `75 💧`\n> For **3** rounds: Doubles ATK, **-20%** DEF & MR\n\n__**Active (IV)**__ (✨)\n**Cost**: `100+ 💧`\n> Buffs and enemy debuffs last for **4** rounds: Converts all current mana into ATK & MD boost (1 💧 = 1%, up to **250%**), enemy's block rate decreased to **0%**",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Ichigo's ability comes in these 4 stages:
            if (this.pause > matchStats.round) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                this.used--;
                myStats.sm += 25;
                matchStats.sendWarning({ content: `Ichigo Kurosaki needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                return AbilityResponse.FAILURE;
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
                //     return matchStats.sendWarning({ content: "Final Getsuga Tensho can only be used once", ephemeral: true });
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

            return AbilityResponse.SUCCESS;
        },
    },
    "9004": {
        usage: 4,
        used: 0,
        cost: 100,
        desc: "**Total Uses:** `4 (CD: 10 rounds)`\n**Mana Cost:** `100 💧` \n**Timeout:** `No`\n**Tags:** `DPS/Support`\n\nGoing through the cycles of loneliness and regret, Rukia finds a sense of belonging and comfort by gaining unwavering resolve through new encounters and allies.\n\nHer normal attack is altered to __Sode No Shirayuki__ :\n> Deals **90%** DMG with **+25%** critical rate\n> Inflicts **1x** `Frost`\n\nAt the start of her turn, when the enemy has **8** or more `Frost`, consumes **8x** to freeze the enemy for **1** round. When the enemy is frozen, they take **+20%** DMG.\n\nUsing her active, she consumes **100** 💧 to utilize __Hakka no Togame__, her bankai, overcoming her fear to gain the purity of ice and uncover the true form of her Sode No Shirayuki.\n\nFor **4** rounds, lowers body temperature to absolute zero, inflicting **4x** `Frost` every round, in return losing **10%** current HP every round, and halting mana regeneration. Moreover, non-DoT DMG dealt from her is stored up as `Frozen Wounds`.\n\nAfter **4** rounds, she unleashes a massive wave of freezing cold, dealing **200%** DMG. Then, cracks open `Frozen Wounds`, dealing absolute DMG (Ignores DEF/MR) equivalent to **1.5x** the DMG stored before resetting `Frozen Wounds`.\n\nWhen in a party, she intervenes every **5** rounds, releasing her Hakka no Togame in a wide range, freezing the enemy for **1** round, causing them to take **+20%** DMG.\n\nMoreover, if her party contains Ichigo Kurosaki / Byakuya Kuchiki, she evades the first **3** lethal hits (stackable), and helps them evade the first **3** lethal hits as well (stackable).",
        shortdesc: "**Uses**: `4`\n**Cooldown:** `10 rounds`\n**Cost**: `100 💧`\n**Timeout**: `No`\n**Role**: `DPS (Frost, Freeze, DMG-delay)`\n\n__**Passive**__\nATTACK is altered:\n- Deal **90%** DMG with **+25%** critical rate\n- Inflicts **1x** `Frost`\n\nAt the start of the turn:\n- When the enemy has **8x** `Frost` or more: Consumes **8x** and freezes the enemy for **1** round\n- Frozen enemies take **+20%** DMG\n\n__**Active**__ (✨)\nFor **4** rounds:\n- Loses **10%** current HP every round\n- Inflicts **4x** `Frost` every round\n- Non-DoT DMG dealt by her is not dealt but stored as `Frozen Wounds`\n\nAfter **4** rounds:\n- Deals **200%** DMG\n- Deals **1.5x** `Frozen Wounds` as fixed DMG to the enemy\n- Frozen Wounds will not crit, but ignores DEF/MR, and cannot be dodged/blocked/countered\n\n__**Party**__ (👥)\n- Intervenes every **5** rounds and freezes the enemy for **1** round\n- Frozen enemies this way receive **+20%** DMG\n\nIf party contains Ichigo Kurosaki/Byakuya Kuchiki:\n- She evades first **3** lethal hits\n- They evade first **3** lethal hits",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Rukia Kuchiki
            matchStats.turn = matchStats.turnSkill ? 0 : 1;

            if (this.pause > matchStats.round) {
                matchStats.sendWarning({ content: `Rukia needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                this.used--;
                myStats.sm += this.cost;
                return AbilityResponse.FAILURE;
            };

            const domainLast = 4;
            this.pause = matchStats.round + 10;
            myStats.rukiaUsedActive = true;
            embed.setThumbnail("https://i.imgur.com/g56Plhs.png");

            // During Domain
            eStats.frost += 4;
            myStats.hp -= Math.floor(myStats.hp * 0.1);
            myStats.mg = 0;

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                eStats.frost += 4;
                myStats.hp -= Math.floor(myStats.hp * 0.1);
                myStats.mg = 0;

                return AbilityResponse.SUCCESS;
            }, domainLast - 1));

            // Fun text before domain ends
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + domainLast - 1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                notice.push(`\n✨ *Bankai...*`);

                return AbilityResponse.SUCCESS;
            }));

            // When Domain Ends
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + domainLast, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.rukiaUsedActive = false;
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ Hakka no Togame! **${char.name}**`, { atkMultiplier: 2, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });

                const shatterdmg = Math.floor(eStats.frozenwounds * 1.5);
                eStats.hp -= shatterdmg;
                notice.push(`\n❄️ Frozen wounds shattered and dealt **${shatterdmg}** damage!`);
                if (eStats.hp < 0) eStats.hp = 0;
                eStats.frozenwounds = 0;

                embed.setThumbnail(myStatsFixed.thumbnail);
                return AbilityResponse.SUCCESS;
            }));

            notice.push(`\n✨ **${char.name}** lowered her temperature to absolute zero for ${domainLast} rounds.`);

            return AbilityResponse.SUCCESS;
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {

            myStats.rukiaUsedActive = false;
            eStats.frost = 0;
            eStats.frozenwounds = 0;
            eStats.vulnerability ??= 1;
            myStats.counter ??= 0;

            // Alters ATTACK
            myStats.replaceButton.atk = {
                emoji: "❄️",
                run: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `༒︎ **${char.name}**`, { atkMultiplier: 0.9, critBuff: 0.25 });

                    return AbilityResponse.SUCCESS;
                },
            };

            // Inflict Frost On Attack
            matchStats.on("ATK", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
                if (caster === myStats) eStats.frost += 1;
            });

            // 8x Frost => Freeze enemy for 1 turn
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (eStats.frost >= 8) {
                    eStats.frost -= 8;
                    eStats.vulnerability += 0.2;
                    notice.push(`\n🧊 Consumed **8x** Frost to freeze the enemy!`);
                    eStats.timeFrozen = true;
                    eStats.frozenMessage = "was frozen";

                    // When freeze is over
                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 2, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        eStats.timeFrozen = false;
                        eStats.vulnerability -= 0.2;

                        return AbilityResponse.SUCCESS;
                    }));
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            // If Ichigo Kurosaki / Byakuya Kuchiki in party = evade 3 lethal strikes
            const isParty = matchStats.interaction.commandName === "stampede" || matchStats.interaction.commandName === "raid";

            if (isParty) {
                const names = matchStats.partyChars.map((e: IcharInfo) => e.name);
                if (names.includes("Ichigo Kurosaki") || names.includes("Byakuya Kuchiki")) {
                    myStats.evadeDeathStrike ??= 0;
                    myStats.evadeDeathChance ??= 0;
                    myStats.evadeDeathChance += 3;
                    myStats.evadeDeathStrike += 3;
                };
            };
            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.vulnerability ??= 1;

            // Freezes enemy and boosts vuln rate every 5 turns
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round % 5 === 0) {
                    eStats.timeFrozen = true;
                    eStats.frozenMessage = "was frozen ❄️";
                    eStats.vulnerability += 0.2;

                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        eStats.timeFrozen = false;
                        eStats.vulnerability -= 0.2;

                        return AbilityResponse.SUCCESS;
                    }));
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            // If Ichigo Kurosaki/Byakuya Kuchiki in party: Evades first 3 lethal hits
            if (["Ichigo Kurosaki", "Byakuya Kuchiki"].includes(myStats.name)) {
                // SETUP VAR
                myStats.evadeDeathStrike ??= 0;
                myStats.evadeDeathChance = 3;

                myStats.evadeDeathStrike += 3;
            };

            return AbilityResponse.SUCCESS;
        },
    },
    "9606": {
        usage: 3,
        used: 0,
        cost: 55,
        pause: -10,
        desc: "**Total Usage**: `3 (CD: 3)`\n**Mana**: `55`\\💧\n**Timeout**: `No`\n**Role**: `DPS/Support`\n\nAs agile as she is, Meme truly is difficult to catch. She has **15%** increased dodge chances permanently, and cannot have more than **80%** dodge rate at all times. Her ATTACK is altered  to `Heroine Blast`, dealing **80%** DMG, and has a **50%** chance of hitting twice. After the enemy deals a critical strike, the enemy takes **+1%** DMG the next round for every **2%** dodge rate she has, up to **+25%**. This has a **4** round cooldown, and only the highest vulnerability effect takes place.\n\nUsing her active increases her permanent dodge rate by **10%**, and allows her ATTACK (`Heroine Blast`) to hit twice for **3** rounds.\n\nIn a party, Meme steals **15%** dodge rate from the enemy and grants it to her allies.",
        shortdesc: "**Uses**: `3 (CD: 3)`\n**Cost**: `55 💧`\n**Timeout**: `No`\n**Role**: `DPS/Support (Dodge, Followup Attack)`\n\n__**Passive**__\n- **+15%** permanent dodge rate\n- dodge rate won't exceed **80%**\n- ATTACK is altered to `Heroine Blast`, dealing **80%** DMG and has a **50%** chance of striking twice\nWhen the enemy deals a critical strike:\n- The enemy takes **+1%** DMG the next round for every **2%** dodge rate she has, up to **+25%** (CD: 4). Only the highest vulnerability effect takes place.\n\n__**Active**__ (✨)\n- **+10%** dodge rate permanently\n- ATTACK (`Heroine Blast`) is guaranteed to hit twice for **3** rounds\n\n__**Party**__ (👥)\n- **-15%** enemy's dodge rate\n- **+15%** ally's dodge rate",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            if (this.pause > matchStats.round) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: `**${char.name}** needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}.`, ephemeral: true });
                this.used--;
                return AbilityResponse.FAILURE;
            };
            this.pause = matchStats.round + 3;

            // +10% unremovable dodge rate
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            myStats.permdodge += 0.1;
            myStats.dodge += 0.1;
            if (myStats.dodge > 0.8) myStats.dodge = 0.8;

            // ATK guaranteed to hit twice
            myStats.memehittwice = true;
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 3, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                myStats.memehittwice = false;

                return AbilityResponse.SUCCESS;
            }));

            /*let increase_eva = myStats.dodge < 0.2 ? 0.3 : (0.5 - myStats.dodge);
            if (increase_eva < 0) increase_eva = 0;
            myStats.dodge += increase_eva;
            mybuff.dodge.push(new buffInfo("+", increase_eva, 3));*/
            notice.push(`\n🎧 Lights are fading out now...`);
            notice.push(`\n✨ **${char.name}** gained **10%** permanent dodge rate!`);

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // 15% perm dodge. Has dodge cap of 80%
            myStats.permdodge = 0.15;
            myStats.memehittwice = false;
            myStats.dodge += myStats.permdodge;
            if (myStats.dodge > 0.8) myStats.dodge = 0.8;
            eStats.vulnerability ??= 1;
            myStats.memeanticrit = matchStats.round;

            // ATK has a 50% chance to hit twice
            myStats.replaceButton.atk = {
                run: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** shot and`, { atkMultiplier: 0.8, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                    if (0.5 > Math.random() || myStats.memehittwice) dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🫴🏻 **${char.name}** pulled the opponent in and`, { atkMultiplier: 0.8, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });

                    return AbilityResponse.SUCCESS;
                },
            };

            // Permanent dodge
            myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.dodge < 0) myStats.dodge = 0;
                myStats.dodge += Math.min(0.8 - myStats.dodge, myStats.permdodge);

                return AbilityResponse.SUCCESS;
            }, 9999));

            // Vulnerability on enemy crit
            matchStats.on("crit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
                if (caster === eStats && myStats.memeanticrit <= matchStats.round) {
                    eStats.vulnerability = Math.max(Math.min(1 + 0.01 * (myStats.dodge / 0.02), 1.25), eStats.vulnerability);
                    notice.push(`\n✨ The enemy will take **+${Math.floor((eStats.vulnerability - 1) * 100)}%** damage the next round`);
                    myStats.memeanticrit = matchStats.round + 4;

                    // When vulnerability ends
                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        eStats.vulnerability = 1;

                        return AbilityResponse.SUCCESS;
                    }));
                }
            });
            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.dodge -= 0.15;
            if (eStats.dodge < 0) eStats.dodge = 0;
            ebuff.dodge.push(new buffInfo("+", -0.15, 9999));
            myStats.dodge += 0.15;
            if (myStats.dodge > 1) myStats.dodge = 1;
            mybuff.dodge.push(new buffInfo("+", 0.15, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "9648": {
        usage: 0,
        used: 0,
        cost: 100,
        desc: "**Total Usage**: `0`\n**Role**: `DPS`\n\nYuno Gasai's ability lays waste to all who stand against her, sparing only her beloved Yukiteru Amano. She will eliminate all other party members if anyone tries to steal her spotlight in stampedes, leaving only Yukkii and herself standing. Her attack and magic damage stats increase to **200%** and she gains **+30%** crit rate during stampedes.",
        shortdesc: "**Uses**: `0`\n**Role**: `DPS (Solo)`\n\n__**Party**__ (👥)\n- Eliminates all party members UNLESS they are Yukkii (S TIER)\n- Doubles ATK & MD\n- **+30%** Critical rate",
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (matchStats.interaction.commandName === "stampede") {
                myStats.atk *= 2;
                myStats.md *= 2;
                mybuff.atk.push(new buffInfo("*", 2, 9999));
                mybuff.md.push(new buffInfo("*", 2, 9999));
                myStats.cr += 0.3;
                if (myStats.cr > 1) myStats.cr = 1;
                mybuff.cr.push(new buffInfo("+", 0.3, 9999));
            };

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.name !== "Yukiteru Amano") {
                myStats.hp = 0;
                myStats.rev = 0;
                notice.push(`\n✨ Now you're mine, forever..`);
            };

            return AbilityResponse.SUCCESS;
        },
    },
    "10125": {
        usage: 9999,
        used: 0,
        cost: 0,
        pause: -10,
        desc: "**Total Usage**: `unlimited` (2 round cd)\n**Cost**: `10%`\\🩸\n**Timeout**: `only on cyberpsychosis`\n**Role**: `DPS`\n\nDavid's arms are cybernetically modified to be arm cannons. He deals **10%** more damage with normal attacks. As David is partly cybernetic, he is immune against HP debuffs.\n### Sandevistan; Militech \"Apogee\"\nThe sandevistan is a spinal replacement type cyberwear that modifies David's neural interface. Its usage immensely increases the user's perception of movement and time, making them move and perceive so fast, the world around seems to be much slower, thus increasing his crit damage by **50%** and dodge chance to **100%** for the turn his active was used.\n\nHowever, it burns out nerve cells rapidly, causing him to push his mind to cyberpsychosis, and break his own body in the process. After every **3rd** usage of his sandevistan, he enters `Cyberpsychosis` dealing a massive **180%** cannon blast from his arms, which permanently reduces enemy DEF and MR by **15%** after the first usage of it. After this, he recovers **30%** of his missing HP with a MaxTac Inhaler MK II, and has **20%** increased crit rate for the remainder of the battle (cr buff only applies after his first cyberpsychosis).",
        shortdesc: "**Uses**: `Unlimited`\n**Cooldown**: `2 rounds`\n**Cost**: `10% max HP`\n**Timeout**: `No/Yes for cyberpsychosis`\n**Role**: `DPS (Sacrificial, Dodge, Nuke)`\n\n__**Passive**__\n- ATK is altered to deal **110%** DMG\n- Immune to HP-debuffs\n\n__**Active**__ (✨)\n- **+50%** critical DMG\n- Increases Dodge rate to **100%** for **1** round\n\nEvery **3rd** use additionally causes *Cyberpsychosis*:\n- Deals **180%** damage\n- **+20%** critical rate (once)\n- **-15%** enemy's DEF & MR (once)\n- Restores **30%** missing HP",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // David Martinez 
            if (this.pause > matchStats.round) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: `David needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}.`, ephemeral: true });
                this.used--;
                return AbilityResponse.FAILURE;
            };
            this.pause = matchStats.round + 2;

            // HP sacrifice
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -Math.floor(myStats.maxhp * 0.1), {});
            if (myStats.hp < 0) myStats.hp = 0;

            // Buffs
            myStats.cd += 0.5;
            myStats.dodge = 1;

            // Cyberpsychosis
            if (this.used % 3 === 0) {
                const damage = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1.8, dodge: false, combodmg: true, selfdmg: true, selfheal: true });
                if (damage) ebuff.hp.push(new buffInfo("+", -Math.floor(damage * 0.5), 3));

                // Heal 30% of missing HP
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(0.3 * (myStats.maxhp - myStats.hp)), {});

                // Single use
                if (this.used === 3) {
                    // DEF shred
                    ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * 0.15), 9999));
                    ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.15), 9999));
                    eStats.def -= Math.floor(eStats.def * 0.15);
                    eStats.mr -= Math.floor(eStats.mr * 0.15);

                    // Crit rate buff
                    mybuff.cr.push(new buffInfo("+", 0.2, 9999));
                    myStats.cr += 0.2;
                    if (myStats.cr > 1) myStats.cr = 1;
                };
            } else {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
            };

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            // HP debuff immunity / Remove HP debuffs on self 
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                mybuff.hp = mybuff.hp.filter((buff) => !buff.isDebuff);

                return AbilityResponse.SUCCESS;
            }, 9999));

            // 10% increased normal attacks
            myStats.replaceButton.atk = {
                run: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1.1, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });

                    return AbilityResponse.SUCCESS;
                },
            };

            return AbilityResponse.SUCCESS;
        },
    },
    // "10160": {
    //     usage: 9999,
    //     used: 0,
    //     cost: 0,
    //     pause: -10,
    //     desc: "**Total Usage**: `NA`\n**Cost**: `NA`\n**Timeout**: `NA`\n**Role**: `DPS (Burst) / Support (Heal, Burst)`\n\nAs a personal physician of the Armed Detective Agency, Yosano has a unique ability that activates when one is near the state of death -- `❤️‍🩹 Thou shalt Not Die`.\nSuch is activated so that whenever she receives a fatal normal attack from the foe and successfully evades the lethal strike, she recovers **100%** max HP. This is decreased by **20%** every use, down to **20%** HP at most. She evades the next lethal hit (stackable) every **15** rounds. After that, she deals an unpredicted punch on the enemy (once per battle), dealing **250%** undodgeable DMG and reducing their DEF/MR by **25%** for the rest of the battle.\n\n*You think death lies in the apex of science? Anyone with such little regard for life will die by my hand.*\n\nIn a party, a successful death evasion will recover **100%** max HP. This is decreased by **20%** every use, down to **20%** HP at most",
    //     shortdesc: "**Role**: `DPS/Support (Death Evasion, Burst heal)`\n\n__**Passive**__\n- Every **15** rounds: Evades the next lethal hit (stackable)\n- After evading the first lethal hit, deals **250%** DMG and decreases the enemy's DEF & MR by **25%** permanently\n\n__Core Mechanic__:\nAfter evading a lethal hit:\n- Recovers **100%** max HP\n- The scaling is lowered by **20%** with every use, down to **20%** at most\n\n__**Party**__ (👥)\nAfter evading a lethal hit:\n- Recovers **100%** max HP\n- The scaling is lowered by **20%** with every use, down to **20%** at most",
    //     passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
    //         // Akiko Yosano
    //         myStats.akikoDeathEva = 5;
    //         myStats.evadeDeathStrike ??= 0;
    //         myStats.evadeDeathChance ??= 0;

    //         myStats.evadeDeathStrike += 1;
    //         myStats.evadeDeathChance += 1;

    //         // Every 15 rounds gain 1x Death Evasion
    //         myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
    //             if (matchStats.round % 15 === 0) {
    //                 myStats.evadeDeathStrike += 1;
    //                 myStats.evadeDeathChance += 1;
    //                 notice.push(`Akiko gained **1x** Death Evasion! She will now evade the next ${myStats.evadeDeathStrike} lethal ${myStats.evadeDeathStrike > 1 ? `hits` : `hit`}`);
    //             };

    //             return AbilityResponse.SUCCESS;
    //         }, 9999));

    //         // First Death Evasion = Burst
    //         matchStats.on("deathEvade", {
    //                maxUsage: 1,
    //                callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
    //                    if (target == myStats) {
    //                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** landed an unexpected punch! She`, { atkMultiplier: 2.5, dodge: false, combodmg: true, selfdmg: true, selfheal: true });
    //                        eStats.def -= Math.min(Math.floor(eStats.def * 0.25), 660);
    //                        eStats.mr -= Math.min(Math.floor(eStats.mr * 0.25), 660);
    //                        ebuff.def.push(new buffInfo("+", -Math.min(Math.floor(eStats.def * 0.25), 660), 9999));
    //                        ebuff.mr.push(new buffInfo("+", -Math.min(Math.floor(eStats.mr * 0.25), 660), 9999));
    //                        return AbilityResponse.SUCCESS;
    //                    };
    //                }
    //            });

    //         // Every Death Evade restore 100% max HP, down for 20% with every use, down to 20% at most
    //         matchStats.on("deathEvade", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
    //             let hpBefore = myStats.hp;
    //             addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.2 * myStats.akikoDeathEva), {}); // myStats.akikoDeathEva shldnt be lower than 1
    //             notice.push(`\n❤️‍🩹 **__Thou Shalt Not Die!__** Yosano recovered ${myStats.hp - hpBefore}`);
    //             if (myStats.akikoDeathEva >= 2) myStats.akikoDeathEva--;
    //             return AbilityResponse.SUCCESS;
    //         });

    //         return AbilityResponse.SUCCESS;
    //     },
    //     party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
    //         myStats.akikoDeathEva = 5;
    //         // Every Death Evade restore 100% max HP, down for 20% with every use, down to 20% at most
    //         matchStats.on("deathEvade", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
    //             let hpBefore = myStats.hp;
    //             addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.2 * myStats.akikoDeathEva), {}); // myStats.akikoDeathEva shldnt be lower than 1
    //             notice.push(`\n❤️‍🩹 **__Thou Shalt Not Die!__** Yosano recovered ${myStats.hp - hpBefore}`);
    //             if (myStats.akikoDeathEva >= 2) myStats.akikoDeathEva--;
    //             return AbilityResponse.SUCCESS;
    //         });

    //         return AbilityResponse.SUCCESS;
    //     },
    // },
    "10517": {
        usage: 9999,
        used: 0,
        cost: 50,
        roundUsed: -5,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `50`\\💧\n**Timeout**: `no`\n**Role**: `Support/DPS`\n\nLuminous brings a unique blend of healing and damage to the battlefield. Her abilities not only bolster her offensive capabilities but also provide a reliable source of health recovery for herself and her allies.\n\nShe steadily recovers **3%** of her missing health every round.\n\nWhen her active ability is used, Luminous instantly recovers **10%** missing HP and enters a heightened state for **3 rounds**, increasing her magic damage by **25%** and doubling her passive from **3%** to **6%**, and during this state she deals magic damage to her opponents. However, it's important to note that this ability can't be stacked, meaning it can't be used again while the effect is still active.\n\nWhen part of a party, Luminous extends her blessings to her friends as well. She increases the party's magic damage by **20%** and ensures they stay in the fight by healing them for **5%** of their missing health every round.",
        shortdesc: "**Uses**: `Unlimited`\n**Cost**: `50 💧`\n**Timeout**: `No`\n**Role**: `Support/DPS (Healing)`\n\n__**Passive**__\n- Restores **3%** missing HP\n\n__**Active**__ (✨)\n- Instantly restores **10%** missing HP\n\nFor **3** rounds:\n- **+25%** MD\n- Additionally restores **3%** missing HP\n- Attacks deal MD hits\n\n__**Party**__ (👥)\n- **+20%** MD\n- Restores **5%** missing HP every round",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Luminous increases her magic damage for 3 rounds
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (matchStats.round < this.roundUsed + 3) {
                myStats.sm += this.cost;
                matchStats.sendWarning({ content: "You can't stack Luminous' ability", ephemeral: true });
                return AbilityResponse.FAILURE;
            };

            myStats.mdChance += 1;
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.25), 2));
            myStats.md += Math.floor(myStats.md * 0.25);

            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.1), {});
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.03), {});

                return AbilityResponse.SUCCESS;
            }, 2));

            // Change image after 3 rounds
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 3, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.mdChance -= 1;
                embed.setThumbnail(myStatsFixed.thumbnail || char.image);

                return AbilityResponse.SUCCESS;
            }));

            embed.setThumbnail("https://i.ibb.co/NKnp3KM/luminous.png");
            notice.push(`\n✨ **${char.name}** increased her MD by **25%** for 3 rounds!`);
            this.roundUsed = matchStats.round;

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.03), {});

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.2), 9999));
            myStats.md += Math.floor(myStats.md * 0.2);
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.05), {});

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "10520": {
        usage: 9999,
        used: 0,
        cost: 0,
        roundUsed: 0,
        usedThisRound: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `0`\\💧 on active, `-25`\\💧 on passive\n**HP**: `5%`<:HP:1062043800979116143>\n**Timeout**: `no`\n**Role**: `DPS`\n\nVictoria, an accomplished knight and a decorated war hero, has become a formidable force on the battlefield through her countless skirmishes. Her vast experience and relentless determination have honed her skills, allowing her to stand toe to toe with dragons, with her prowess mirroring their ferocity and prestige.\n\nIn an ongoing testament to her thirst for knowledge and self-improvement, Victoria gains **+25%** class xp, and her countless encounters with dragons have sharpened her combat abilities against them, resulting in a **20%** increase in ATK when facing dragons.\nShe begins battles by countering the next **3** hits (stackable). When she is ready to counter a hit, she has **+25%** critical rate & critical DMG\n\nVictoria's resilience in combat is further enhanced by her ability to use mana to heal herself. When enough mana is available, Victoria will consume **25**\\💧 to regenerate **6%** of max HP, showcasing her ability to adapt and endure even in the direst of situations.\n\nVictoria can also tap into the raw energy of life itself, making the ultimate sacrifice for the promise of power. She can willingly sacrifice **5%** of her HP to gain a **25%** ATK boost for that round. This effect can be stacked up to **3 times** at once, embodying Victoria's willingness to risk everything for overwhelming power, mirroring the very dragons she battles in ferocity and resilience.",
        shortdesc: "**Uses**: `Unlimited`\n**Cost**: `5% max HP`\n**Timeout**: `No`\n**Role**: `DPS (Mana-losing, Healing, Counter, Anti-dragon)`\n\n__**Passive**__\n- Begins battles by countering the next **3** hits (stackable)\n- When she is ready to counter a hit: **+25%** critical rate & critical DMG\n- When against dragons: **+20%** ATK\n- At the start of every round, if available, consumes **25** 💧 to restore **6%** max HP (once every round)\n- Gains **+25%** class XP\n\n__**Active**__ (✨)\n- **+25%** ATK for **1** round",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Victoria gains 20% more class xp. Has 20% increased ATK if she fights against a dragon.
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (matchStats.round === this.roundUsed) {
                this.usedThisRound++;
                if (this.usedThisRound >= 3) {
                    myStats.sm += this.cost;
                    matchStats.sendWarning({ content: "You can stack Victorias's ability up to 3 times max.", ephemeral: true });
                    return AbilityResponse.FAILURE;
                };
            } else {
                this.usedThisRound = 0;
            };

            // Consume HP & ATK Buff
            const sacrifice = Math.floor(myStats.maxhp * 0.05);
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -sacrifice, {});
            if (myStats.hp < 0) myStats.hp = 0;
            const atkbuff = Math.floor(myStatsFixed.atk * 0.25);
            myStats.atk += atkbuff;

            this.roundUsed = matchStats.round;
            notice.push(`\n✨ **${char.name}** sacrificed **${sacrifice}** HP for **${atkbuff}** ATK!`);

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.xpboost += 0.25;
            if (["Dragon", "True Dragon", "Death Dragon", "Sky Dragon"].includes(enemy.species)) {
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
                myStats.atk += Math.floor(myStats.atk * 0.2);
            };

            // Begins battles with 3x Counter attempts
            myStats.counter ??= 0;
            myStats.counter += 3;

            // When a counter is available, Critical rate & DMG +25%
            if (myStats.counter > 0) {
                myStats.cr += 0.25;
                myStats.cd += 0.25;
                if (myStats.cr > 1) myStats.cr = 1;
            };

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (myStats.counter > 0) {
                    myStats.cr += 0.25;
                    myStats.cd += 0.25;
                    if (myStats.cr > 1) myStats.cr = 1;
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (myStats.sm > 25) {
                    myStats.sm -= 25;
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.06), {});
                    if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "10524": {
        usage: 9999,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `35-50`\\💧\n**Timeout**: `yes`\n**Role**: `Support`\n\nRosalia is a character with an interesting balance of manipulation and damage abilities. Her passive ability inflicts a bleeding effect on the enemy, causing them to lose an amount equal to **5%** of Rosalia's max HP every round. Additionally, Rosalia drains **3** mana from the enemy every round, increasing her own mana pool and allowing her to use her abilities more frequently. Moreover, Rosalia gains a **20%** boost on class xp.\n\nRosalia doesn't simply use her own mana alone when activating her ability, she steals up to **15** 💧 from the enemy to lower the cost to at most **35** 💧, before dealing **115%** magic damage. If her attack hits the target, there's a **50%** chance of doubling the bleeding effect on her enemy for 2 rounds.\n\nIn a party, Rosalia extends her mana draining ability to aid her allies, draining **3** mana from the enemy every round.",
        shortdesc: "**Uses**: `Unlimited`\n**Cost**: `35-50 💧`\n**Timeout**: `Yes`\n**Role**: `Support (Mana-drain, Bleed)`\n\n__**Passive**__\n- Bleed: Enemy loses **5%** of her max HP every round\n- Drains **3** 💧 from the enemy every round\n- Gains **+20%** class XP\n\n__**Active**__ (✨)\n- Deals **115%** MD\n- Steals up to **15** 💧 from the enemy to lower the cost of active\n- If it hits: **50%** chance to inflict another instance of Bleeding, lasting for **2** rounds\n\n__**Party**__ (👥)\n- Drains **3** 💧 from the enemy every round",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Rosalia

            // Calculate cost
            let cost = 50;
            const stealMana = Math.min(eStats.sm, 15);
            cost -= stealMana;
            if (myStats.sm < cost) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/${cost}\\💧)`, ephemeral: true });
                return AbilityResponse.FAILURE;
            }
            // if (eStats.sm < 20) {
            //     matchStats.turn = matchStats.turnSkill ? 0 : 1;
            //     myStats.sm += 30;
            //     matchStats.sendWarning({ content: "Your enemy needs **20**💧 to activate", ephemeral: true });
            //     return AbilityResponse.FAILURE;
            // };
            myStats.sm -= cost;
            eStats.sm -= stealMana;
            //if (eStats.sm < 0) eStats.sm = 0;

            const dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1.15, magicDamage: true, mdChance: -1 });
            if (dmg && Math.random() < 0.5) {
                ebuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp * 0.05), 2));
                notice.push(`\n⚜️ **${char.name}** caused bleeding for 2 rounds`);
            };

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.xpboost += 0.2;
            ebuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp * 0.05), 9999));
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (eStats.sm >= 3) {
                    eStats.sm -= 3;
                    myStats.sm += 3;
                    if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (eStats.sm >= 3) {
                eStats.sm -= 3;
                myStats.sm += 3;
                if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
            };

            return AbilityResponse.SUCCESS;
        },
    },
    "10528": {
        usage: 9999,
        used: 0,
        cost: 0,
        pause: 0,
        desc: "**Total Usage**: `1 + Unlimited (CD: 5)`\n**Cost**: `50% HP, and 5% current HP per turn | 20% HP`\n**Timeout**: `No`\n**Role**: `DPS`\n\n*Knock knock~ are you seeking eternal slumber?*\nDalus has **2** states : PAST & PRIME. He may equip “Broken shell” to convert to his PAST state, else he always fights in his PRIME state. To equip the shell, do `/item equip item:broken shell`. To remove the shell, do `/item equip item:remove shell`\n\nWhen Dalus is in his PRIME state, his active has enhanced effects, but is faced by Kisogi’s intervention every **3rd** turn, reminding the target of dreams lost on their way, eager to find the way out. This strengthens them by boosting their ATK & MD by **2.5%**, and mana regen by **1** 💦.\n\n*The show… must go on. Graceful with impish glee.*\n\nHe evades the **1st** lethal hit (stackable), and afterwards, immediately gains a shield with **100%** of his max HP before setting his max HP to **1**. For the next **5** turns, his mana regeneration is boosted by **20** 💦.\n\n*A sharp blade pierces through the blossoming rose, delivering the anguish of a hunter. [Rosie], Dalus’ trusted nightmare emerges to drag the enemy into his carnival of nightmares for the rest of the fight*.\nDalus will now expend **all** mana at the start of every turn, gaining a **1**/**2%** ATK increase for every **1** 💧consumed (Up to 25 💧), lasting for that turn.\n\nFollowing the mana consumption, [Rosie] tears open the enemy’s mental lines of weakness, dealing **5%** of the enemy's max hp (capped at **20**/**30%** of Dalus ATK) as undodgeable absolute DMG (Ignores DEF/MR). Overflowing damage exceeding cap will instead be converted into HP for Dalus, up to **9**/**15%** of his max HP.\n\nIf he is in his PRIME state, he may use his ability again with no timeout, sacrificing **20%** of his current HP before boosting his mana regeneration by **20** 💦 for the next **3** turns.\n\nWhen in a party, Dalus casts a nightmare on both the ally and the enemy, decreasing their DEF/MR by **20%** and summoning [Rosie] every turn, dealing **10%** undodgeable ATK to the enemy as absolute DMG.\n\nIf Kisogi is in the party, the nightmare is resolved, disabling the previous party effect. Now, the ally will deal **15%** ATK as absolute DMG with **100%** critical rate to the enemy every round.",
        shortdesc: "Uses: `1 + Unlimited (CD: 5)`\nCost: `50% HP, 5% current hp per round | 20% HP`\nTimeout: `No`\nTags: `DPS (Mana burn, Absolute DMG, Burst survival)`\n\n__**Passive**__:\n- Dalus has **2** states : PAST & PRIME.\n- To equip the shell, do `/item equip item:broken shell` (PAST state)\n- To remove the shell, do `/item equip item:remove shell` (PRIME state)\n\nIf in PRIME state:\n- Enhances active (✨) effects\n- Faced by Kisogi’s intervention every **3rd** turn (boosting enemy’s ATK & MD by **2.5%** & mana regen by **1** 💦)\n\n”Impish Glee”:\n- Evades the **1st** lethal hit (stackable)\n- Afterwards, immediately gains a shield with **100%** of his max HP before setting his max HP to **1**\n- For the next **5** turns: Mana regeneration **+20** 💦.\n\n__**Active**__ (✨):\n- Summons [Rosie] for the rest of the fight.\n- Will now expend all mana at the start of every round\n- In return gain a **1**/**2%** ATK increase for every **1** 💧consumed (Up to 25💧), lasting for that round.\n\n- Following the mana consumption, [Rosie] deals **5%** of the enemy's max HP (capped at 20/30% of Dalus ATK) as absolute DMG (Ignores DEF/MR).\n- Overflowing damage exceeding cap will instead be converted into HP for Dalus, up to **9**/**15%** of his max HP.\n\nIf he is in his PRIME state:\n- May use his ability again with no timeout\n- Sacrifices **20%** of his current HP\n- Mana regeneration **+20** 💦 for the next **3** rounds\n\n__**Party Ability**__ (👥):\n- **-20%** DEF & MR for both ally & enemy\n- Summons [Rosie] every turn: Deals **10%** ATK to the enemy as undodgeable absolute DMG.\n\nIf Kisogi is in the party: previous party effect disabled. Instead:\n- The ally will deal **15%** ATK to the enemy as undodgeable absolute dmg with **100%** critical rate every round.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Dalus
            matchStats.turn = matchStats.turnSkill ? 0 : 1;

            // Active (I)
            if (this.used === 1) {
                // Lose 50% current HP instantly & 5% current HP every round
                myStats.hp -= Math.floor(myStats.hp * 0.5);
                mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.hp * 0.05), 9999));
                notice.push(`\n<:dalusrose:1387007950601719908> Dalus summoned **Rosie** for the rest of the fight`);

                // Permanent mana loss & dmg boost effect
                myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    // Gain 1/2% ATK for every 1 💧consumed
                    const atkScale = myStats.dalusPrime ? 0.02 : 0.01;
                    const atkBuff = Math.floor(myStats.atk * Math.min(myStats.sm, 25) * atkScale);
                    myStats.atk += atkBuff;
                    myStats.sm -= Math.min(myStats.sm, 25);

                    // Lines of weakness + Heal
                    const dmgLimit = myStats.dalusPrime ? 0.3 : 0.2;
                    const dmg = (eStats.def + eStats.mr < 100000) ? Math.floor(Math.min(eStats.maxhp * 0.05, dmgLimit)) : 0;
                    // Overflow?
                    if (eStats.maxhp * 0.05 > myStats.atk * dmgLimit) {
                        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(Math.min(eStats.maxhp * 0.05 - myStats.atk * dmgLimit, myStats.maxhp * (myStats.dalusPrime ? 0.15 : 0.09))), {});
                    };
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:rosie:1387006066566627328> **Rosie**`, { overwriteDamage: dmg, magicDamage: true, dodge: false });

                    return AbilityResponse.SUCCESS;
                }, 9999));
            } else {
                // Active (II)
                // 5 round cd
                if (this.pause > matchStats.round) {
                    matchStats.interaction.followUp({ content: `**Dalus** needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                    this.used--;
                    return AbilityResponse.FAILURE;
                } else {
                    myStats.hp -= Math.floor(myStats.hp * 0.2);
                    this.pause = matchStats.round + 5;
                    mybuff.mg.push(new buffInfo("+", 20, 4));
                    notice.push("\n✨ **Dalus** further increased their mana regeneration by **20** 💦");
                };
            };
            return AbilityResponse.SUCCESS;
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            myStats.dalusPrime = (myStats.shell === "broken") ? false : true; // false = Past, true = Prime
            const msg = (!myStats.dalusPrime) ? `\n<:brokenshell:1405524630520987771> **${char.name}** decides to hold onto the last bit of memories left...` : `\n<:dalusrose:1387007950601719908> The nightmare has given an impetus to **${char.name}**. Havoc shall wreck.`;
            notice.push(msg);
            myStats.evadeDeathStrike ??= 0;
            myStats.evadeDeathChance ??= 0;

            myStats.evadeDeathStrike += 1;
            myStats.evadeDeathChance += 1;

            // Burst shield gain and stuff upon first death evasion
            matchStats.on("deathEvade", {
                maxUsage: 1,
                callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                    if (target == myStats) {
                        const shgain = myStats.maxhp;
                        myStats.shield += myStats.maxhp;
                        myStatsFixed.maxhp = 1;
                        myStatsFixed.hp = 1;
                        myStats.maxhp = 1;
                        mybuff.mg.push(new buffInfo("+", 20, 5));
                        notice.push(`\n<:dalusrose:1387007950601719908> The show must... go on. **Dalus** gained a **${shgain}** HP shield`);
                        return AbilityResponse.SUCCESS;
                    };
                }
            });
            if (myStats.dalusPrime) {
                myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    if (matchStats.round % 3 === 0) {
                        // Restart by Kisogi
                        const buffScale = 0.025;
                        eStats.atk += Math.floor(eStats.atk * buffScale);
                        eStats.md += Math.floor(eStats.md * buffScale);
                        ebuff.mg.push(new buffInfo("+", 1, 9999));
                        ebuff.atk.push(new buffInfo("+", Math.floor(eStats.atk * buffScale), 9999));
                        ebuff.md.push(new buffInfo("+", Math.floor(eStats.md * buffScale), 9999));
                    };
                    return AbilityResponse.SUCCESS;
                }, 9999));
            }
            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const names = matchStats.partyChars.map((e: IcharInfo) => e.name);
            const dmgScale = names.includes("Kisogi") ? 0.15 : 0.1, critChance = names.includes("Kisogi") ? 1 : Math.random(), dmg = (eStats.def + eStats.mr < 100000) ? Math.floor(myStats.atk * dmgScale) : 0, desc = names.includes("Kisogi") ? `<:rosie:1387006066566627328> **Rosie**` : `**✨ Kisogi**`;
            // Dalus unique effects
            if (!names.includes("Kisogi")) {
                eStats.def -= Math.min(Math.floor(eStats.def * 0.2), 660);
                myStats.def -= Math.min(Math.floor(myStats.def * 0.2), 660);
                ebuff.def.push(new buffInfo("+", -Math.min(Math.floor(eStats.def * 0.2), 660), 9999));
                mybuff.def.push(new buffInfo("+", -Math.min(Math.floor(myStats.def * 0.2), 660), 9999));
            };

            // Common DMG
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, desc, { overwriteDamage: dmg, magicDamage: true, dodge: false, critChance: critChance });

            // Permanent effects
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, desc, { overwriteDamage: dmg, magicDamage: true, dodge: false, critChance: critChance });

                return AbilityResponse.SUCCESS;
            }, 9999));
            return AbilityResponse.SUCCESS;
        },
    },
    "12398": {
        usage: 3,
        used: 0,
        cost: 0,
        buffID: 0,
        desc: "__**Total Usage**__: `2 (3 if in Prime state)`\n__**Cost**__: `18% current HP 🩸`\n__**Timeout**__: `No`\n__**Roles**__: `Support`\n\n*Peeeekaboo~ W- Why are you crying? My dear… want to see some magic tricks?*\n\nKisogi has **2** states : PAST & PRIME. He may equip “Broken shell” to convert to his PAST state, else he always fights in his PRIME state. To equip the shell, do `/item equip item:broken shell`. To remove the shell, do `/item equip item:remove shell`\n\nWhen Kisogi is in his prime state, his normal ATTACK and active have *enhanced effects*, but is faced by Dalus’ intervention, reducing his max HP by **20%**.\n\nKisogi’s attack causes the enemy to fall into a slumber, dealing **80%**/**100%** MD to the foe. This attack has a **50%** chance (**75%** chance instead when in [Wild Dream], **100%** chance instead when in [??? Dream]) to activate ”Fantasy”…\n\n*Hey! Why are you hitting me! Hold on… Tada! How does this look?*\n\n“Fantasy” applies **1**/**2** random effect(s) from `Trick` to the enemy, then applies **1**/**2** random effect(s) from `Treat` to himself. Non-stat buffs last for **2** rounds, while immediate effects only last for that round.\n\n`Trick` : **-12%** ATK/MD , **-12%** DEF/MR (Max 1.2x DMG), **-25%** critical rate, lose **10** 💧, Loses **4%** of Kisogi’s max HP\n`Treat` : **+12%** ATK/MD , **+12%** DEF/MR , **+25%** critical rate, steals **10** 💧, restores **6%** missing HP.\n\n*Fret not... in a dream, all the power lies in you.*\n\nThe first use of his active (✨) leads him into a [Light Dream]. At the start of every round, Kisogi loses **50%** of total 💧owned, but increases MD and critical damage by **1**/**2%**, lasting for the rest of the battle.\n\nUpon using ✨ again, or after **15** rounds, exits the [Light Dream], and enters a [Wild Dream], where he decreases the enemy’s MR by **14%**/**28%** (Max 2x DMG), then deals **5%**/**7%** undodgeable DMG for every **1%** of mana missing from the mana pool. His attack’s chance to activate “Fantasy” is increased to **75%**.\n\nUpon using ✨ afterwards, and if he is in his PRIME state, he enters a [??? Dream], immediately restoring all missing HP. However, the commotion causes Dalus to enter the battlefield, causing Kisogi to lose **5%** max HP every round. Kisogi also grows stronger, as his chance of activating “Fantasy” is increased to **100%** for **10** rounds. The total damage dealt by Kisogi and the enemy are tallied every round. After **10** rounds, if Kisogi dealt more damage, the increased chance of activating “Fantasy” is kept permanently. Else, his max HP is set to **1** permanently, and the max HP DoT is removed.\n\nIn a party, starting from the 6th round, Kisogi intervenes every round to apply **1** effect from `Treat` to the ally, lasting for **1** round.\n\nIf Dalus is in the party, he additionally reminds allies their lost dreams on their way, urging them to find a way out. This strengthens them by boosting their ATK & MD by **10%** and mana regen by **7**.",
        shortdesc: "__**Uses**__: `2 (3 if in Prime state)`\n__**Cost**__: `18% current HP (🩸)`\n__**Timeout**__: `No`\n__**Tags**__: `DPS (Progressive, RNG, Burst)`\n\n__**Passive**__:\n\- He may equip “Broken shell” to convert to his PAST state, else he always fights in his PRIME state.\n-  To equip the shell, do `/item equip item:broken shell`. To remove the shell, do `/item equip item:remove shell`\n\nWhen in his PRIME state: His normal attack and active have *enhanced* effects, but he has **-20%** max HP\n\nATTACK is altered:\n> - Deals **80%**/**100%** MD to the foe.\n> - Has a **50%** chance (**75%** chance instead when in [Wild Dream], **100%** chance instead when in [??? Dream]) to activate ”Fantasy”\n\n”Fantasy”:\n- Applies **1**/**2** random effect(s) from `Trick` to the enemy\n- Applies **1**/**2** random effect(s) from `Treat` to himself.\n- Non-stat buffs last for 2 rounds, while immediate effects only last for that round.\n- `Trick` : **-12%** ATK/MD , **-12%** DEF/MR (Max 1.2x DMG), **-25%** critical rate, lose **10** 💧, Loses **4%** of Kisogi’s max HP\n- `Treat` : **+12%** ATK/MD , **+12%** DEF/MR , **+25%** critical rate, steals **10** 💧, restores **6%** missing HP.\n\n__**Active (✨)**__:\n__Core Mechanic__: Kisogi has **3** Dream states.\n\n`1.` [Light Dream (1st use of ✨) ] :\nAt the start of every round: Loses **50%** of total 💧 owned, but increases MD and critical damage by **1**/**2%**, lasting for the rest of the battle.\nUpon using ✨again, or after **15** rounds:\n- Exits the [Light Dream], and enters a [Wild Dream].\n\n`2.` [Wild Dream] :\n- **-14%**/**-28%** enemy’s MR permanently (Max 2x DMG) \n- Deals **5%**/**7%** undodgeable DMG for every **1%** of mana missing from the mana pool.\n- His attack’s chance to activate “Fantasy” is increased to **75%**.\n\n`3.` [??? Dream (3rd ✨) ] :\nRequirement: In PRIME state\n- Restore all missing HP\n- Lose **5%** max HP every round\n- Chance of activating “Fantasy” is increased to **100%** for **10** rounds\n- The total damage dealt by Kisogi and the enemy are tallied every round\n\nAfter **10** rounds:\n- If Kisogi dealt more damage: the increased chance of activating “Fantasy” is kept permanently.\n- Else: His max HP is set to **1** permanently, and the max HP DoT is removed.\n\n__**Party Ability (👥)**__: \n- Starting from the **6th** round: Apply **1** effect from `Treat` to the ally every round, lasting for **1** round.\n\nIf Dalus is in the party:- Allies have **+10%** ATK & MD, and **+7** mana regeneration.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Kisogi
            matchStats.turn = matchStats.turnSkill ? 0 : 1;

            // dreamState: 0 = Light ; 1 = Wild ; 2 = ???
            // Active (I)
            if (this.used === 1) {
                myStats.hp -= Math.floor(myStats.hp * 0.18);
                // Last up to 15 rounds
                myStats.dreamState = 0;

                // Buff effects
                myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    if (myStats.dreamState === 0) {
                        // Loses 50% mana owned every round, but increases MD & CD by 1/2%.
                        const buffScale = myStats.kisogiPrime ? 0.02 : 0.01;
                        myStats.sm -= Math.floor(myStats.sm / 2);
                        myStats.cd += Math.floor(buffScale);
                        myStats.md += Math.floor(myStats.md * buffScale);
                        mybuff.cd.push(new buffInfo("+", buffScale, 9999));
                        mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * buffScale), 9999));
                    };
                    return AbilityResponse.SUCCESS;
                }, 15));

                // End buffs
                myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 15, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    // Forcibly enter Wild Dream
                    if (myStats.dreamState === 0) {
                        myStats.dreamState = 1;
                        const manaPoolMissing = myStats.sm <= 0 ? 1 : (1 - myStats.sm / myStats.mana);
                        const defShred = myStats.kisogiPrime ? 0.3 : 0.15, dmgScale = myStats.kisogiPrime ? 7 : 5 * manaPoolMissing;
                        eStats.mr -= Math.min(Math.floor(eStats.mr * defShred), 660);
                        ebuff.mr.push(new buffInfo("+", -Math.min(Math.floor(eStats.mr * defShred), 660), 9999));
                        notice.push(`\n💤 ${char.name} entered a __Wild Dream__`);
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `💦 **Kisogi**`, { atkMultiplier: dmgScale, magicDamage: true, dodge: false });
                        this.used++;
                    };
                    return AbilityResponse.SUCCESS;
                }));

                notice.push(`\n💤 ${char.name} entered a __Light Dream__`);
            };

            // Active (II)
            if (this.used === 2) {
                myStats.hp -= Math.floor(myStats.hp * 0.18);
                myStats.dreamState = 1;
                const manaPoolMissing = myStats.sm <= 0 ? 1 : (1 - myStats.sm / myStats.mana);
                const defShred = myStats.kisogiPrime ? 0.3 : 0.15, dmgScale = myStats.kisogiPrime ? 7 : 5 * manaPoolMissing;
                eStats.mr -= Math.min(Math.floor(eStats.mr * defShred), 660);
                ebuff.mr.push(new buffInfo("+", -Math.min(Math.floor(eStats.mr * defShred), 660), 9999));
                notice.push(`\n💤 ${char.name} entered a __Wild Dream__`);
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `💦 **Kisogi**`, { atkMultiplier: dmgScale, magicDamage: true, dodge: false });
            };

            // Active (III)
            if (this.used === 3) {
                if (!myStats.kisogiPrime) {
                    matchStats.interaction.followUp({ content: `**Kisogi** needs to be in his Prime form in order to use this active.`, ephemeral: true });
                    return AbilityResponse.FAILURE;
                } else {
                    notice.push(`\n❔${char.name} entered a __??? Dream__ for **10** rounds`);
                    myStats.hp -= Math.floor(myStats.hp * 0.18);
                    myStats.dreamState = 2;
                    myStats.hp = myStats.maxhp;
                    const dalusDoT = new buffInfo("+", -Math.floor(myStats.maxhp * 0.05), 9999);
                    this.buffID = dalusDoT.id;
                    mybuff.hp.push(dalusDoT);

                    // Tally DMG
                    matchStats.on("attack", {
                        maxRound: 10,
                        callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                            if (caster === eStats) {
                                eStats.recordDamageDealt += options.damage;
                            } else {
                                myStats.recordDamageDealt += options.damage;
                            };
                        },
                    });

                    // After 10 rounds, see if exit mode
                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 10, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        if (eStats.recordDamageDealt > myStats.recordDamageDealt) {
                            myStats.dreamState = 1;
                            // Dalus leaves
                            myStats.maxhp = 1;
                            myStats.hp = 1;
                            myStatsFixed.maxhp = 1;
                            myStatsFixed.hp = 1;
                            if (mybuff.hp.findIndex((e) => e.id === this.buffID) !== -1) mybuff.hp.splice(mybuff.hp.findIndex((e) => e.id === this.buffID), 1);
                            notice.push(`\n✨ **Kisogi** dealt less damage than the enemy and reverted back to the __Wild Dream__ state.`);
                        } else {
                            notice.push(`\n💦 **Kisogi** dealt more damage than the enemy, and will stay in __??? Dream__ permanently.`);
                        }
                        return AbilityResponse.SUCCESS;
                    }));
                }
            };
            return AbilityResponse.SUCCESS;
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            myStats.dreamState = -1;
            myStats.kisogiPrime = (myStats.shell === "broken") ? false : true; // false = Past, true = Prime
            const msg = (!myStats.kisogiPrime) ? `\n<:brokenshell:1405524630520987771> **${char.name}** decides to hold onto the last bit of memories left...` : `\n✨ The fantasy has given an impetus to **${char.name}**. It shall reach faraway.`;
            notice.push(msg);

            if (myStats.kisogiPrime) {
                // -20% max HP
                const hpreduction = Math.floor(myStats.maxhp * 0.2);
                myStats.maxhp -= hpreduction;
                myStatsFixed.maxhp -= hpreduction;
                myStats.hp -= hpreduction;
                myStatsFixed.hp -= hpreduction;
            };

            const fantasyBuff = myStats.kisogiPrime ? 2 : 1, fantasyDamage = myStats.kisogiPrime ? 1 : 0.8;
            myStats.replaceButton.atk = {
                emoji: "🪄",
                run: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🪄 **${char.name}**`, { atkMultiplier: fantasyDamage, magicDamage: true, combodmg: true, mdChance: -1 });

                    if (Math.random() <= 0.5 + 0.25 * myStats.dreamState) {
                        for (let i = 0; i < fantasyBuff; i++) {
                            // Trick
                            let effectIndex = Math.floor(Math.random() * 5);
                            switch (effectIndex) {
                                case 0:
                                    eStats.atk -= Math.floor(eStats.atk * 0.12);
                                    eStats.md -= Math.floor(eStats.md * 0.12);
                                    ebuff.atk.push(new buffInfo("+", -Math.floor(eStats.atk * 0.12), 2));
                                    ebuff.md.push(new buffInfo("+", -Math.floor(eStats.md * 0.12), 2));
                                    break;
                                case 1:
                                    eStats.def -= Math.floor(eStats.def * 0.12);
                                    eStats.mr -= Math.floor(eStats.mr * 0.12);
                                    ebuff.def.push(new buffInfo("+", -Math.min(Math.floor(eStats.def * 0.12), 396), 2));
                                    ebuff.mr.push(new buffInfo("+", -Math.min(Math.floor(eStats.mr * 0.12), 396), 2));
                                    break;
                                case 2:
                                    eStats.cr -= 0.25;
                                    ebuff.cr.push(new buffInfo("+", -0.25, 2));
                                    if (eStats.cr < 0) eStats.cr = 0;
                                    break;
                                case 3:
                                    eStats.sm -= 10;
                                    if (eStats.sm < 0) eStats.sm = 0;
                                    break;
                                case 4:
                                    const hpLoss = Math.floor(myStats.maxhp * 0.04);
                                    eStats.hp -= hpLoss;
                                    if (eStats.hp < 0) eStats.hp = 0;
                                    break;
                            };

                            // Treat
                            let effectIndex2 = Math.floor(Math.random() * 5);
                            switch (effectIndex2) {
                                case 0:
                                    myStats.atk += Math.floor(myStats.atk * 0.12);
                                    myStats.md += Math.floor(myStats.md * 0.12);
                                    mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.12), 2));
                                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.12), 2));
                                    break;
                                case 1:
                                    myStats.def += Math.floor(myStats.def * 0.12);
                                    myStats.mr += Math.floor(myStats.mr * 0.12);
                                    mybuff.def.push(new buffInfo("+", Math.floor(myStats.def * 0.12), 2));
                                    mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr * 0.12), 2));
                                    break;
                                case 2:
                                    myStats.cr += 0.25;
                                    mybuff.cr.push(new buffInfo("+", 0.25, 2));
                                    if (myStats.cr > 1) myStats.cr = 1;
                                    break;
                                case 3:
                                    eStats.sm -= 10;
                                    if (eStats.sm < 0) eStats.sm = 0;
                                    myStats.sm += 10;
                                    if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
                                    break;
                                case 4:
                                    const heal = Math.floor((myStats.maxhp - myStats.hp) * 0.06);
                                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, heal, {});
                                    break;
                            };
                        };
                    };
                    return AbilityResponse.SUCCESS;
                },
            };
            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const names = matchStats.partyChars.map((e: IcharInfo) => e.name);
            if (names.includes("Dalus")) {
                // Restart
                myStats.atk += Math.floor(myStats.atk * 0.1);
                myStats.md += Math.floor(myStats.md * 0.1);
                myStats.mg += 7;

                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.1), 9999));
                mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.1), 9999));
                mybuff.mg.push(new buffInfo("+", 7, 9999));
            };

            // Permanent effects
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 6, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const effectIndex = Math.floor(Math.random() * 5);
                switch (effectIndex) {
                    case 1:
                        myStats.atk += Math.floor(myStats.atk * 0.12);
                        myStats.md += Math.floor(myStats.md * 0.12);
                        break;
                    case 2:
                        myStats.def += Math.floor(myStats.def * 0.12);
                        myStats.mr += Math.floor(myStats.mr * 0.12);
                        break;
                    case 3:
                        myStats.cr += 0.25;
                        if (myStats.cr > 1) myStats.cr = 1;
                        break;
                    case 4:
                        eStats.sm -= 10;
                        if (eStats.sm < 0) eStats.sm = 0;
                        myStats.sm += 10;
                        if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
                        break;
                    case 5:
                        const heal = Math.floor((myStats.maxhp - myStats.hp) * 0.06);
                        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, heal, {});
                        break;
                };
                return AbilityResponse.SUCCESS;
            }, 9999));
            return AbilityResponse.SUCCESS;
        },
    },
    "12093": {
        usage: 3,
        used: 0,
        cost: 65,
        desc: "**Total Usage**: `3`\n**Mana**: `65`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nEven though Izuku was born Quirkless, he managed to catch the attention of the legendary hero All Might, and has since become his close pupil. All Might passed on his transferable Quirk to Izuku, making him the ninth and current holder of One For All.\n\nDeku increases his ATK by **4%** every round up to a maximum increase of **32%**. With consecutive usage of his active ability Midoriya unleashes more power each time, dealing **120**/**130**/**150%** damage, but also damaging himself for **5**/**10**/**15%** current HP.",
        shortdesc: "**Uses**: `3`\n**Cost**: `65 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Sacrificial, ATK-boost)`\n\n__**Passive**__\n- Increases ATK by **4%** every round (Up to 32%) \n\n__**Active**__ (✨)\n- Deals **120%**/**130%**/**150%** DMG (depending on times used)\n- Loses **5%**/**10%**/**15%** of current HP",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Izuku Midoriya
            const atkMultiplier = this.used === 1 ? 1.2 : (this.used === 1 ? 1.3 : 1.5);
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** uses One for All at **${this.used === 1 ? 5 : (this.used === 1 ? 8 : 15)}%**! He`, { atkMultiplier, magicDamage: true, block: false });

            // Sacrifice
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -(myStats.hp * (0.05 + (0.05 * (this.used - 1)))), {});
            if (myStats.hp < 0) myStats.hp = 0;

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.atk += Math.floor(myStats.atk * Math.min(0.32, 0.04 * matchStats.round));

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "12121": {
        usage: 16,
        used: 0,
        cost: 50,
        roundUsed: 0,
        desc: "**Total Usage**: `16`\n**Mana**: `50`\\💧\n**Timeout**: `no`\n**Role**: `Support/DPS`\n\nAll Might's ability One For All is a Quirk that allows the user to temporarily increase their strength and speed to superhuman levels. When activated, One For All **doubles** the user's ATK and reduces enemy DEF by **half** (max 4x damage), making them more vulnerable to his attacks. This allows the user to deliver powerful blows and take down their enemies with ease. However, the Quirk does come with a drawback, as it can put a strain on the user's body, potentially causing injury, damaging himself for **5%** of his current HP (**10%** chance of failure). As such, it should be used carefully.\n\nStanding firm and leading the way for his party members as the symbol of peace and beacon of hope, All Might increases all party member's attacks by **20%**.",
        shortdesc: "**Uses**: `16`\n**Cooldown**: `1 round`\n**Cost**: `50 💧`\n**Timeout**: `No`\n**Role**: `DPS (Burst, ATK-boost, DEF-shred)`\n\n__**Active**__ (✨)\n- Doubles ATK\n- **-50%** enemy's DEF (Max 4x DMG)\n- **10%** chance of failing this move and instead loses **5%** current HP\n\n__**Party**__ (👥)\n- **+20%** ATK",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // All Might doubles his ATK and reduces enemy def by half for the next attack. 10% chance of failure damaging himself for 5% HP
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (matchStats.round === this.roundUsed) {
                myStats.sm += this.cost;
                matchStats.sendWarning({ content: "You can't stack All Might's ability", ephemeral: true });
                return AbilityResponse.FAILURE;
            };
            if (Math.random() < 0.1) {
                let dmg = Math.floor(myStats.hp * 0.05);
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -dmg, {});
                notice.push(`\n✨ **${char.name}** damaged himself by **${dmg}**!`);
                return AbilityResponse.SUCCESS;
            };
            myStats.atk *= 2;
            eStats.def = Math.floor(eStats.def - Math.min(eStats.def * 0.5, 1320));

            this.roundUsed = matchStats.round;
            notice.push(`\n✨ **${char.name}** doubled his ATK and decreased enemy DEF by half!`);

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
            myStats.atk += Math.floor(myStats.atk * 0.2);

            return AbilityResponse.SUCCESS;
        },
    },
    "12393": {
        usage: 9,
        used: 0,
        cost: 0,
        roundUsed: 0,
        usedThisRound: 0,
        desc: "**Total Usage**: `9`\n**Cost**: `70`\\💧, then `250`<:coins:872926669055356939>\n**Timeout**: `no`\n**Role**: `Support/Farming`\n\nEliza's Ability is multi-layered and can be used up to three times per round. On the first use, it amplifies her ATK by up to **20%** at the cost of **70**\\💧, providing a significant boost to her offensive capabilities. For the second and third uses, it further increases her attack up to an additional **+10%** and adds a shield equal to **7.5%** of her max HP at the expense of **250**<:coins:872926669055356939>. These ATK buffs scale with the amount of coins the user has in their balance up to **100'000**<:coins:872926669055356939>\n\nAdditionally, Eliza's passive ability allows her to gain **20%** more coins from dungeons, providing her with more resources to utilize her active ability more frequently and sustainably.",
        shortdesc: "**Uses**: `9`\n**Cost**: `70💧, then 250 🪙`\n**Timeout**: `No`\n**Role**: `DPS/Support (Coin-scaling, Shield, Farming)`\n\n__**Passive**__\n- **+20%** coins from dungeons\n\n__**Active**__ (✨)\nFirst use:\n- Increases ATK (Based off gold in bank, up to **20%** with 100k 🪙)\nSecond use and remaining uses:\n- Increase ATK (Based off gold in bank, each instance up to **10%** with 100k 🪙)\n- Grant **7.5%** max HP shield",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Eliza
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            this.used--;

            const stats = await getUserSchema(matchStats.interaction.user.id);
            const coins = Math.min(stats?.coins ?? 0, 100000);

            if (matchStats.round === this.roundUsed) {
                if (++this.usedThisRound >= 3) {
                    matchStats.sendWarning({ content: "You can stack **Eliza**'s ability up to **3** times max.", ephemeral: true });
                    return AbilityResponse.FAILURE;
                }
            } else this.usedThisRound = 0;

            let atkbuff;
            switch (this.usedThisRound) {
                case 0:
                    if (myStats.sm < 70) {
                        matchStats.sendWarning({ content: `You don't have enough mana (**${myStats.sm}**/70).`, ephemeral: true });
                        return AbilityResponse.FAILURE;
                    };
                    myStats.sm -= 70;
                    atkbuff = Math.floor(myStats.atk * (0.2 * (coins / 100000)));
                    myStats.atk += atkbuff;
                    notice.push(`\n✨ **${char.name}** gains **${atkbuff}** ATK`);
                    break;
                case 1:
                    if (coins < 250) {
                        matchStats.sendWarning({ content: "You don't have enough coins to activate **Eliza**'s ability.", ephemeral: true });
                        return AbilityResponse.FAILURE;
                    };
                    atkbuff = Math.floor(myStats.atk * (0.1 * (coins / 100000)));
                    myStats.atk += atkbuff;
                    myStats.shield += Math.floor(myStats.maxhp * 0.05);
                    notice.push(`\n✨ **${char.name}** uses 250<:coins:872926669055356939> to gain **${atkbuff}** ATK and **${Math.floor(myStats.maxhp * 0.05)}** Shield`);

                    // Update users table
                    await updateUsers(matchStats.interaction.user.id, {
                        coins: { type: "increment", value: -250 },
                    });
                    break;
                case 2:
                    if (coins < 250) {
                        matchStats.sendWarning({ content: "You don't have enough coins to activate **Eliza**'s ability.", ephemeral: true });
                        return AbilityResponse.FAILURE;
                    };
                    atkbuff = Math.floor(myStats.atk * (0.1 * (coins / 100000)));
                    myStats.atk += atkbuff;
                    myStats.shield += Math.floor(myStats.maxhp * 0.05);
                    notice.push(`\n✨ **${char.name}** uses 250<:coins:872926669055356939> to gain **${atkbuff}** ATK and **${Math.floor(myStats.maxhp * 0.05)}** Shield`);

                    // Update users table
                    await updateUsers(matchStats.interaction.user.id, {
                        coins: { type: "increment", value: -250 },
                    });
                    break;
                default: false; break;
            };

            this.used++;
            this.roundUsed = matchStats.round;

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.lootm += 0.2;

            return AbilityResponse.SUCCESS;
        },
    },
    "12394": {
        usage: 9999,
        used: 0,
        cost: 30,
        roundUsed: 0,
        buffer: undefined,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `30`\\💧\n**Timeout**: `no`\n**Role**: `DPS`\n\nAneira, wielding her ancient frost magic, has an ability that leaves her enemies frozen in fear and ice. Once activated, her ability delivers a chilling attack. Starting with **50%** damage, Aneira gains 1 additional icicle every round (up to 7), each adding **+25%** more to her active's damage.\n\nTrying to block her freezing attacks is futile, but if her opponent can miraculously dodge her frozen fury, the spell simply fizzles out. Should the attack land however, Aneira's enemy gets encased in ice, decreasing their defense by **20%**. Moreover, the action will be considered Timeout false, allowing Aneira to make another action that round.\n\nAdditionally, Aneira gains **+25%** class xp from her battles.",
        shortdesc: "**Uses**: `Unlimited`\n**Cost**: `30 💧`\n**Timeout**: `no`\n**Role**: `DPS (Freeze, Progressive DMG-boost)`\n\n__**Passive**__\n- Gains **+25%** class XP\n\n__**Active**__ (✨)\n- Deals **50%** DMG\n- Increases this attack's DMG scaling by **25%** (Up to **175%**) for every round it wasn't used\n- If the attack hits, the enemy is frozen (**-20%** DEF & MR)\n-# This will leave the round unchanged as well",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {

            //! Slow ability, have to use mana early to prevent bugs 
            myStats.sm -= this.cost;

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

                myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    message.edit({ files: [] });
                    embed.setImage(eStats.image);

                    return AbilityResponse.SUCCESS;
                }));

                notice.push(`\n✨ **${enemy.name}** was frozen!`);
            };

            //! Add the failsafe back 
            myStats.sm += this.cost;

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, message, ...list) => {
            matchStats.xpboost += 0.25;

            return AbilityResponse.SUCCESS;
        },
    },
    "12399": {
        usage: 9999,
        used: 0,
        cost: 0,
        pause: -10,
        desc: "**Total Usage**: `unlimited` (7 round cd)\n**Cost**: `10`\\🐟\n**Timeout**: `yes`\n**Role**: `DPS/Support`\n\nJuliette's max HP, DEF and MR are bolstered by the total amount of fish in her account, with benefits capping at **400** fish. At this maximum, she gains a **20%** increase in max HP and adds **200** DEF & MR. Additionally, her mere presence on the battlefield hampers the enemy's mana generation, reducing it by **5** points.\n\nUsing her active, Juliette consumes **10** fish of common or uncommon rarity to transform into her majestic mermaid form for **6** rounds. In this form, she gains a **33%** chance to counter attacks. Each successful counter during this state gains her a stack of `Ocean's Lament`.\n\nUpon reverting to her human form, Juliette unleashes the pent-up fury of the ocean through the accumulated `Ocean's Lament` stacks. Each stack causes an explosion that deals **50%** damage to the enemy, and Juliette heals for **40%** of the total damage dealt by this explosive retribution.\n\nIn a party, Juliette protects her party members with a **14%** chance to counter enemy attacks.",
        shortdesc: "**Uses**: `Unlimited`\n**Cooldown**: `7 rounds`\n**Cost**: `10 Normal/Special Fish`\n**Timeout**: `Yes`\n**Role**: `DPS/Tank (Counter, Burst, Mitigation, Max hp-boost)`\n\n__**Passive**__\n- Enemy regains **5** less 💧\nGains effects depending on amounts of fish, at max when at 400 fish:\n- **+20%** max HP\n- **+200** DEF & MR \n\n__**Active**__ (✨)\nTransforms into Majestic Mermaid for **6** rounds:\n- **+33%** counter chance\n- Counters grant her **1x** of `Ocean's Lament`\nBy the end of the ability:\n- For every `Ocean's Lament`, deal **50%** DMG\n- This attack has **+40%** life steal \n\n__**Party**__ (👥)\n- **+14%** counter chance",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Juliette
            if (this.pause > matchStats.round) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: `Juliette needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                this.used--;
                return AbilityResponse.FAILURE;
            };
            this.pause = matchStats.round + 7;

            // Get user inv
            const inv = await getUserSchema(matchStats.interaction.user.id);
            if (!inv) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: "You don't have any fish in your inventory.", ephemeral: true });
                this.used--;
                return AbilityResponse.FAILURE;
            };

            // Filter for fish
            const fishInv = Object.entries(inv.items).filter(([key, val]) => (items[key as any].category === "fish" && (items[key as any].gradeValue === 0 || items[key as any].gradeValue === 1)));
            fishInv.sort(([a, _a], [b, _b]) => items[a as any].gradeValue - items[b as any].gradeValue);

            // Select fish to be consumed
            let remainingFishCost = 10;
            const fishToConsume: Record<string, number> = {};
            for (const [key, val] of fishInv) {
                fishToConsume[key] = Math.min(val, remainingFishCost);
                remainingFishCost -= fishToConsume[key];
                if (remainingFishCost < 1) break;
            };

            // Return if not enough fish (10 cost)
            if (remainingFishCost > 0) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: `Not enough fish in your inventory **${10 - remainingFishCost}**/10`, ephemeral: true });
                this.used--;
                return AbilityResponse.FAILURE;
            };

            // Remove fish from the user's inventory
            const updateItems: Record<string, number> = {};
            Object.entries(fishToConsume).forEach(([key, val]) => {
                updateItems[key] = -val;
            });
            await updateUsers(matchStats.interaction.user.id, {
                items: { type: "merge_json", value: updateItems },
            });

            // Counter
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.33) {
                    myStats.counter = 1;
                    myStats.oceansLamentStacks++;
                };

                return AbilityResponse.SUCCESS;
            }, 6));

            // Consume ocean's lament stacks 
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 7, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** explodes all Ocean's Lament stacks and `, { atkMultiplier: 0.5 * myStats.oceansLamentStacks, selfheal: true, selfhealAmount: 0.4 });

                return AbilityResponse.SUCCESS;
            }, 1));

            notice.push(`\n✨ **${char.name}** transformed into her mermaid form! 🧜‍♀️`);

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.oceansLamentStacks = 0;

            // Get Fish Inv
            const inv = await getUserSchema(matchStats.interaction.user.id);
            if (!inv) return AbilityResponse.FAILURE;

            // Get Total Amount of Fish
            const totalFish = Math.min(400, Object.entries(inv.items).filter(([key, val]) => (items[key as any].category === "fish")).reduce((acc, [key, val]) => acc + val, 0));

            // Max HP buff
            const increaseHp = Math.floor(myStatsFixed.maxhp * 0.0005 * totalFish);
            myStatsFixed.maxhp += increaseHp;
            myStatsFixed.hp += increaseHp;
            myStats.maxhp += increaseHp;
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, increaseHp, {});

            // DEF buff
            mybuff.def.push(new buffInfo("+", Math.floor(totalFish / 2), 9999));
            mybuff.mr.push(new buffInfo("+", Math.floor(totalFish / 2), 9999));
            myStats.def += Math.floor(totalFish / 2);
            myStats.mr += Math.floor(totalFish / 2);

            // Enemy generates 5 less mana
            ebuff.mg.push(new buffInfo("+", -5, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.14) myStats.counter = 1;

                return AbilityResponse.SUCCESS;
            }, 6));

            return AbilityResponse.SUCCESS;
        },
    },
    "12450": {
        usage: 3,
        used: 0,
        cost: 0,
        roundUsed: 0,
        usedThisRound: 0,
        desc: "**Total Usage**: `3`\n**Cost**: `0`\\💧, `33%`\\💖\n**Timeout**: `no`\n**Role**: `DPS`\n\nLuminous (alter) presents a high-risk, high-reward playstyle, emphasizing critical hits and self-sacrifice for substantial damage output. Her active ability allows her to sacrifice **33%** of her maximum health to launch a powerful attack dealing **140%** of her normal damage at no mana cost. Hated by the divine, self-heal passives on damage won't work on Luminous (alter).\n\nHer passive ability augments her crit rate by an additional **20%**. In addition, she gains **25%** more class xp, allowing her to level up her class faster. However, this power is difficult to bear and comes with a great cost: she loses **4%** of her max HP every round, and any shield she gains will break down immediately.\n\nWhen in a party, Luminous (alter) can refuse to cooperate, dealing damage to her own party members. I wonder how we can get her to cooperate...",
        shortdesc: "**Uses**: `3`\n**Cooldown**: `1 round`\n**Cost**: `33% max HP`\n**Timeout**: `Yes`\n**Role**: `DPS (Sacrificial, Burst)`\n\n__**Passive**__\n- **+20%** critical rate\n- Loses **4%** max HP every round\n- Loses all shield at the start of every round\n- Gains **+25%** class XP\n\n__**Active**__ (✨)\n- Deals **140%** DMG\n\n__**Party**__ (👥)\n- Has a **25%** chance to deal a hit to ally with **1.33x** critical damage.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Luminous Alter
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (matchStats.round === this.roundUsed) {
                if (++this.usedThisRound >= 1) {
                    matchStats.sendWarning({ content: "You can use Luminous (alter)'s ability only once per round.", ephemeral: true });
                    return AbilityResponse.FAILURE;
                };
            } else {
                this.usedThisRound = 0;
            };
            this.roundUsed = matchStats.round;

            const sacrifice = Math.ceil(myStats.maxhp * 0.33);
            if (myStats.hp <= sacrifice) {
                matchStats.sendWarning({ content: "You don't have enough HP left", ephemeral: true });
                return AbilityResponse.FAILURE;
            };
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -sacrifice, {});

            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1.4, selfheal: false });

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.xpboost += 0.25;
            myStats.shield = 0;
            myStats.cr += 0.2;
            if (myStats.cr > 1) myStats.cr = 1;
            mybuff.cr.push(new buffInfo("+", 0.2, 9999));
            mybuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp * 0.04), 9999));
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.shield = 0;
                myStats.atk += Math.floor(myStats.atk * (0.6 - (myStats.hp / (2 * myStats.maxhp))));

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            if (Math.random() < 0.25) {
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${name}** attacked **${myStats.name}**! She`, { critMultiplier: 1.33 });
            };
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.25) {
                    dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${name}** attacked **${myStats.name}**! She`, { critMultiplier: 1.33 });
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "13000": {
        usage: 9999,
        used: 0,
        pause: 0,
        cost: 60,
        desc: "**Total Usage**: `unlimited`\n**Cost**: `60`\\💧\n**Timeout**: `yes`, 6 rounds cd\n**Role**: `DPS/Utility`\n\nAt the heart of her skillset is the ability to render herself invisible to a single enemy. This stealth not only allows her to maneuver undetected but also increases her dodge chance by **20%** for the first **6** rounds.\n\nWhen it's time to strike, Nao turns the tides with her signature move: `Tomori Kick`! Activating her ability, she delivers a powerful kick, dealing an impressive **120%** damage. Moreover, she also counters the next **2** attacks.",
        shortdesc: "**Uses**: `Unlimited`\n**Cooldown**: `6 rounds`\n**Cost**: `60 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Mana-losing, Followup Attack, Nuke)`\n\n__**Passive**__\n- **+20%** Dodge rate for the first **6** rounds\n\n__**Active**__ (✨)\n- Deals **120%** DMG\n- Counters the next **2** hits (stackable)",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Nao Tomori
            if (this.pause > matchStats.round) {
                myStats.sm += this.cost;
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                this.used--;
                matchStats.sendWarning({ content: `Nao Tomori needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                return AbilityResponse.FAILURE;
            };
            this.pause = matchStats.round + 6;

            myStats.counter = 2;

            // Tomori Kick
            dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ Tomori Kick! She`, { atkMultiplier: 1.2, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.dodge += 0.2;
            mybuff.dodge.push(new buffInfo("+", 0.2, 5));

            return AbilityResponse.SUCCESS;
        },
    },
    "13285": {
        usage: 6,
        used: 0,
        cost: 60,
        desc: "**Total Usage**: `6`\n**Cost**: `60`\\💧\n**Timeout**: `yes`\n**Role**: `DPS/Support`\n\nGoblin Slayer is a master of adaptation and surprise in combat against goblins. However, he won't fight any other enemies.\n\nHis profound understanding of goblin behavior allows him to execute surprise attacks with lethal precision, catching his enemies off-guard. As such, his active deals **120**-**180%** rng damage.\n\nHis extensive knowledge and relentless focus on goblins grant him a unique edge - he can instantly eliminate goblins during the first phase of a stampede. Moreover, with each goblin he defeats, Goblin Slayer grows stronger, reflecting his accumulating battle experience. For every participation point in a stampede, he gains a **0.2%** increase in ATK & MD, as well as a **0.125%** increase in CR & CD, capping at **200** participation points.\n\nIn a party, Goblin Slayer's deep understanding of goblin tactics not only enhances his own performance but also empowers his allies. The entire party benefits from a **20%** increase in ATK & MD, leveraging Goblin Slayer's strategic acumen.",
        shortdesc: "**Uses**: `6`\n**Cost**: `60 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Anti-goblin, Stampede Utility/DPS)`\n\n__**Passive**__\n- Cannot fight any non-goblin enemy\n- Stampede first phase: Immediately eliminates goblins\n\nStampedes second & third phase, for every participation point:\n- **+0.2%** ATK & MD\n- **+0.125%** CR & CD\n- Caps at **200** participation points, aka a 40% DMG boost and 25% Crit boost \n\n__**Active**__ (✨)\n- Deals **120%**-**180%** DMG\n\n__**Party**__ (👥)\n- **+20%** ATK when fighting against Goblins",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Goblin Slayer
            if (enemy.species === 'Goblin') {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1.2 + Math.random() * 0.6 });
            } else {
                myStats.sm += this.cost;
                notice.push(`\n✨ **${enemy.name}** is not a goblin`);
            };

            return AbilityResponse.SUCCESS;
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if (enemy.species !== 'Goblin') {
                myStats.hp = 0;
                myStats.rev = 0;
                notice.push(`\n✨ **${char.name}** refuses to fight anything other than goblins.`);
                return AbilityResponse.SUCCESS;
            };

            if (matchStats.interaction.commandName === "stampede") {
                if (enemy.name === 'Goblin') {
                    eStats.hp = 0;
                    notice.push(`\n✨ I am to goblins what goblins are to us.`);
                } else {
                    const stampede = await getLatestStampede();

                    const points = Math.min(200, stampede?.participation?.[matchStats.interaction.user.id]?.[1] || 0);

                    mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * (0.002 * points)), 9999));
                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * (0.002 * points)), 9999));
                    myStats.atk += Math.floor(myStats.atk * (0.002 * points));
                    myStats.md += Math.floor(myStats.md * (0.002 * points));

                    mybuff.cd.push(new buffInfo("+", (0.00125 * points), 9999));
                    mybuff.cr.push(new buffInfo("+", (0.00125 * points), 9999));
                    myStats.cd += (0.00125 * points);
                    myStats.cr += (0.00125 * points);
                    if (myStats.cr > 1) myStats.cr = 1;
                };
            };

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (enemy.species === 'Goblin') {
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
                mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.2), 9999));
                myStats.atk += Math.floor(myStats.atk * 0.2);
                myStats.md += Math.floor(myStats.md * 0.2);
            };

            return AbilityResponse.SUCCESS;
        },
    },
    // "13314": {
    //     usage: 9999,
    //     used: 0,
    //     cost: 0,
    //     roundUsed: 0,
    //     shortdesc: "**Uses**: `Unlimited // 2`\n**Cost**: `Every 5 Blitz automatically // 0 💧 manually to quit` \n**Timeout**: `Automatic / No`\n**Role**: `DPS (Initiative, Blitz, Dodge+Crit)`\n\n__**Passive**__\n- Gains **5x** `Initiative` upon entering battle\n- Without `Initiative`: loses **4%** current HP every turn.\n- Dodging grants him **3x** `Initiative`\n- Dealing a critical strike: Grants **1x** `Blitz` and **+2%** counter chance, up to **20%**.\n\n`Initiative` : > Decreases by **1x** after every round. The inflicted has **+5%** critical rate for every stack.\n\n`Blitz` : > At the start of the round, when **4x** are available, consumes **4x** and enters the __FLOW state__ that round. \n\n__Core Mechanic__: FLOW state:\n- If he already has `Initiative`: Gains **25%** block rate, **50%** critical DMG, and decreases the enemy's DEF/MR by **25%** for that turn\n- Else, grants **5x** `Initiative`.\n\n__**Active**__ (:sparkles:)\nCONDITION: After every **4** times of him entering __FLOW state__:\n- Automatically followup by casting his Active -- Five-Shot Fake Valley Shot immediately, dealing **150%** DMG.\n- However, if you force him by using `✨` manually, it will do nothing. Twice and he'll leave the battle (considered a loss).\n\n__**Party**__ (:busts_in_silhouette:)\n- **20%** chance for the ally to counter every round (stackable)",
    //     desc: "**Total Usage**: `Unlimited // 2`\n**Cost**: `Every 5 Blitz automatically // 0 💧 manually to quit` \n**Timeout**: `Automatic / No`\n**Role**: `DPS (Initiative, Blitz, Dodge+Crit)`\n\nWith speedy reflexes and a lack of motivation to spend time for trivial matters, Nagi gains **5x** `Initiative` upon entering battle. Without `Initiative`, he becomes consumed by boredom and loses **4%** current HP every turn.\n\nDodging grants him **3x** `Initiative`, while dealing a critical strike grants him **1x** `Blitz` and **+2%** counter chance, up to **20%**.\n\n`Initiative` : Decreases by **1x** after every round. The inflicted has **+5%** critical rate for every stack.\n\n`Blitz` : At the start of the round, when **4x** are available, consumes **4x** and enters the __FLOW state__ that round. If he already has `Initiative`, he gains **25%** block rate, **50%** critical DMG, and decreases the enemy's DEF/MR by **25%** for that turn. Else, grants **5x** `Initiative`.\n\nAfter every **4** times of him entering __FLOW state__, he will cast his Active -- Five-Shot Fake Valley Shot immediately, dealing **150%** DMG.\n\nHowever, if you force him by using `✨` manually, something wrong might happen~\n-# Do it twice and he'll leave. Just don't-!\n\nIn a party, he has a **20%** chance to intervene every turn, attempting a Zero Reset Turn, allowing the ally to counter the next incoming hit.",
    //     ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, ...list) {
    //         // Seishirou Nagi: https://discord.com/channels/927257132624130119/1238325252946395217
    //         matchStats.turn = matchStats.turnSkill ? 0 : 1;
    //         myStats.nagiQuit ??= 0;
    //         myStats.nagiQuit++;
    //         if (myStats.nagiQuit === 1) notice.push(`\n🙁 Can't be bothered to think about it...`);
    //         else if (myStats.nagiQuit === 2) {
    //             notice.push(`\n🚶🏻‍♂️ **Mr. Hassle Man** left the battle out of boredom...`);
    //             notice.push(`\n( •̀ - • ) Eh, that nickname sucks. Stop- `);
    //             myStats.rev = 0;
    //             myStats.maxRevivals = 0;
    //             myStats.hp = 0;
    //         };
    //         return AbilityResponse.SUCCESS;
    //     },
    //     passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, message, ...list) {
    //         myStats.initiative ??= 0;
    //         myStats.blitz ??= 0;
    //         myStats.nagiCounter = 0;
    //         myStats.initiative += 5;
    //         myStats.flowed = 0; // Record amt of times he entered flow
    //         //? const embedColor = embed.data.color ?? 0x278fd5;

    //         myStats.cr += 0.05 * myStats.initiative; // Increases CR by 5% for every initiative

    //         // Delayed buff
    //         myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, message, ...list) => {
    //             if (myStats.initiative > 0) { // Loses 1 initiative every round
    //                 myStats.initiative -= 1;
    //                 myStats.cr += 0.05 * myStats.initiative;

    //                 if (myStats.cr > 1) {
    //                     let overflowingpercent = Math.floor((myStats.cr - 1) * 100) / 100;
    //                     //Overflowing critical rate -> Restore 0.5% missing HP for every 1% overflowing CR, up to 25%.
    //                     overflowingpercent = Math.min(overflowingpercent, 0.5);
    //                     const heal = Math.floor((myStats.maxhp - myStats.hp) * (overflowingpercent) * 0.005);
    //                     addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, heal, {});
    //                     myStats.cr = 1; // Cap cr to 100%
    //                 };
    //             } else myStats.hp -= Math.floor(myStats.maxhp * 0.04);

    //             // Check if counter
    //             if (myStats.nagiCounter > Math.random()) myStats.counter += 1;

    //             // FLOW state
    //             if (myStats.blitz >= 4) {
    //                 myStats.blitz -= 4;
    //                 notice.push(`\n⚽ **${char.name}** entered Flow state.`);
    //                 //? message.edit({ embeds: [embed] });
    //                 //? embed.setColor(0x278fd5);
    //                 if (myStats.initiative > 0) { // If already in initiative, get buffs
    //                     myStats.br += 0.25;
    //                     myStats.cd += 0.5;
    //                     eStats.def -= Math.floor(eStats.def * 0.25);
    //                     eStats.mr -= Math.floor(eStats.mr * 0.25);
    //                 } else myStats.initiative += 5; // Else, grant 5 initiative

    //                 myStats.flowed += 1; // To record times flowed
    //                 if (myStats.flowed >= 4) {
    //                     myStats.flowed -= 4;

    //                     // Autouse ACTIVE
    //                     dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚽ **${char.name}** performed a Five-Shot Fake Valley Shot! He`, { atkMultiplier: 1.5 });
    //                     matchStats.trigger("ABILITY", myStats, eStats, mybuff, ebuff);
    //                 };

    //                 // Reset color
    //                 //? myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, message, ...list) => {
    //                 //?    message.edit({ embeds: [embed] });
    //                 //?    embed.setColor(embedColor);

    //                 //?    return AbilityResponse.SUCCESS;
    //                 //?}));
    //             };

    //             return AbilityResponse.SUCCESS;
    //         }, 9999));

    //         // Crit = 1x Blitz & 2% counter chance permanently
    //         matchStats.on("crit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
    //             if (caster === myStats) {
    //                 myStats.blitz += 1;
    //                 if (myStats.nagiCounter <= 0.18) myStats.nagiCounter += 0.02;
    //             };
    //         });

    //         // Dodge / Counter = +3 Initiative
    //         matchStats.on("dodge", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
    //             if (target === myStats) {
    //                 myStats.initiative += 1;
    //             };
    //         });

    //         matchStats.on("counter", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
    //             if (target === myStats) {
    //                 myStats.initiative += 1;
    //             };
    //         });

    //         return AbilityResponse.SUCCESS;
    //     },
    //     party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
    //         myStats.counter ??= 0;
    //         myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
    //             if (Math.random() < 0.2) { // 20% chance to counter
    //                 myStats.counter += 1;
    //             };
    //             return AbilityResponse.SUCCESS;
    //         }, 9999));
    //         return AbilityResponse.SUCCESS;
    //     },
    // },
    "14000": {
        usage: 0,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `--`\n**Cost**: `--`\n**Timeout**: `--`\n**Role**: `Farming/Stampede DPS`\n\nAhem, greetings, esteemed friends and potential clients! Let me enlighten you about my extraordinary abilities. It's only fair that I, Arataka Reigen, the greatest psychic of the 21st century, give you a firsthand account.\n\nFirstly, let's talk about my normal attacks: Salt Splash. Now, I know what you're thinking, \"Salt? Really?\" But let me assure you, it's not just any salt. This is a special blend, carefully selected for its... aesthetic qualities. While it may seem that it only deals **50%** of my damage, remember, it's a statement, a declaration of my non-reliance on mundane concepts like magic damage.\n\nNeedless to say, my unparalleled charisma allows me to navigate through any situation with ease, ensuring that I always come out on top. Whether it's with Mob's assistance or through my own cunning, I guarantee a **20%** increase in coins from dungeons. No refunds.\n\nLastly, let's discuss my special move: `Arataka Reigen - 1000%` state. When paired with my apprentice, the prodigious Shigeo Kageyama, I can tap into my latent potential. My ATK, MD, DEF and MR skyrocket by **150%**, showcasing my true power. As for Mob, well, he might experience a slight **50%** reduction in his stats, but it's a small price to pay for the greater good, don't you think?\n\nSo there you have it, a glimpse into the abilities of the greatest psychic of the 21st century—me, Arataka Reigen. Impressive, I know.",
        shortdesc: "**Uses**: `0`\n**Role**: `Support (Farming)`\n\n__**Passive**__\n- **+20%** coins from dungeons\n- ATTACK altered to deal **50%** DMG\n\n__**Party**__ (👥)\nWhen paired with Shigeo Kageyama (SS TIER):\n- **+150%** ATK , MD , DEF & MR\n- Shigeo Kageyama has **-50%** stats",
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Arataka Reigen
            const isStampede = matchStats.interaction.commandName === "stampede";

            matchStats.lootm += 0.2;

            myStats.replaceButton.atk = {
                "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}** used Salt Splash! He`, { atkMultiplier: isStampede ? 1 : 0.5, magicDamage: false, combodmg: true, selfdmg: true, selfheal: true });

                    return AbilityResponse.SUCCESS;
                },
            };

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.mdChance = 0;

                return AbilityResponse.SUCCESS;
            }, 9999));

            if (isStampede) {
                const names = matchStats.partyChars.map((e: IcharInfo) => e.name);
                if (names.includes("Shigeo Kageyama")) {
                    myStats.atk *= 1.5;
                    myStats.md *= 1.5;
                    mybuff.atk.push(new buffInfo("*", 1.5, 9999));
                    mybuff.md.push(new buffInfo("*", 1.5, 9999));
                    myStats.def *= 1.5;
                    myStats.mr *= 1.5;
                    mybuff.def.push(new buffInfo("*", 1.5, 9999));
                    mybuff.mr.push(new buffInfo("*", 1.5, 9999));

                    notice.push(`\n✨ Arataka Reigen entered his 1000% state!`);
                };
            };

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.name === "Shigeo Kageyama") {
                myStats.def = Math.floor(myStats.def * 0.5);
                myStats.mr = Math.floor(myStats.mr * 0.5);
                myStats.atk = Math.floor(myStats.atk * 0.5);
                myStats.md = Math.floor(myStats.md * 0.5);

                myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    myStats.def = Math.floor(myStats.def * 0.5);
                    myStats.mr = Math.floor(myStats.mr * 0.5);
                    myStats.atk = Math.floor(myStats.atk * 0.5);
                    myStats.md = Math.floor(myStats.md * 0.5);

                    return AbilityResponse.SUCCESS;
                }, 9999));

                notice.push(`\n✨ Arataka Reigen entered his 1000% state! Consuming Mob's psychic powers...`);
            };

            return AbilityResponse.SUCCESS;
        },
    },
    "14903": {
        usage: 9999,
        used: 0,
        pause: 0,
        cost: 50, // 5% current HP on Passive, 50 Mana on Active
        desc: "**Total Usage**: `unlimited` (5 rounds cooldown)\n**Cost**: `50`\\💧\n**Timeout**: `yes`\n**Role**: `Support`\n\nMarch 7th is an enthusiastic girl who was saved from eternal ice by the Astral Express Crew. Following the path of Preservation, she's going to make sure that she keeps her allies and herself stay longer in the fight.\n\nEvery **5** rounds, she converts **5%** of her current HP into a shield equivalent to **5%** of her max HP. While this shield is up, her DEF and MR are increased by **20%** and her ATK and MD gain a **30%** increase.\n\nHer active ability will cast her ultimate, Glacial Cascade, which deals **110%** damage and has a **75%** chance of freezing the enemy for 1 round. The enemy is more vulnerable while the enemy is veiled by her ice, taking **20%** extra damage. Only the highest vulnerability takes effect.\n\nIn a party, she shares her defensive passive to her allies, converting **5%** of their current HP into a shield equivalent to **5%** of their max HP every **7** rounds. While this shield is up, they get a **20%** DEF and MR boost, and a **15%** boost in ATK and MD.",
        shortdesc: "**Uses**: `Unlimited`\n**Cooldown**: `5 rounds`\n**Cost**: `50 💧`\n**Timeout**: `Yes`\n**Role**: `Support (Shield, Freeze)`\n\n__**Passive**__\n- Every **5** rounds: Loses **5%** current HP and gains a shield equivalent to **5%** of her max HP\n- When she has a shield (The SH stat): **+20%** DEF & MR, **+30%** ATK\n\n__**Active**__ (✨)\n- Deals **110%** DMG\n- Has a **75%** chance of freezing the enemy\n- If successful, applies **20%** vulnerability to the enemy (Only the highest effect takes place)\n\n__**Party**__ (👥)\n- Every **7** rounds: Loses **5%** current HP and gains a shield equivalent to **5%** of max HP\n- While having shield (The SH stat): **+20%** DEF & MR, **+15%** ATK & MD",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // March 7th
            if (this.pause > matchStats.round) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                this.used--;
                myStats.sm += this.cost;
                matchStats.sendWarning({ content: `**${char.name}** needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                return AbilityResponse.FAILURE;
            };
            this.pause = matchStats.round + 5;
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** uses Glacial Cascade! She`, { atkMultiplier: 1.1, magicDamage: true });
            if (Math.random() < 0.75) {
                eStats.timeFrozen = true;
                if (eStats.vulnerability < 1.2) eStats.vulnerability = 1.2;
                myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    eStats.timeFrozen = false;
                    eStats.vulnerability = 1;

                    return AbilityResponse.SUCCESS;
                }));
                notice.push(`\n✨ **${enemy.name}** was frozen for 1 round!`);
            };

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round % 5 === 0) { // Sacrifice 5% current HP for shield
                    myStats.shield += Math.floor(myStats.maxhp * 0.05);
                    myStats.hp -= Math.floor(myStats.hp * 0.05);
                };
                if (myStats.shield > 0) {
                    myStats.def += Math.floor(myStats.def * 0.2);
                    myStats.mr += Math.floor(myStats.mr * 0.2);
                    myStats.atk += Math.floor(myStats.atk * 0.3);
                    myStats.md += Math.floor(myStats.md * 0.3);
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round % 7 === 0) {
                    myStats.shield += Math.floor(myStats.maxhp * 0.05);
                    myStats.hp -= Math.floor(myStats.hp * 0.05);
                };
                if (myStats.shield > 0) {
                    myStats.def += Math.floor(myStats.def * 0.2);
                    myStats.mr += Math.floor(myStats.mr * 0.2);
                    myStats.atk += Math.floor(myStats.atk * 0.15);
                    myStats.md += Math.floor(myStats.md * 0.15);
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "14904": {
        usage: 9999,
        used: 0,
        pause: 0,
        buffID: 0,
        cost: 60,
        desc: "**Total Usage**: `unlimited`, `5 rounds cd`\n**Cost**: `60`\\💧\n**Timeout**: `no`\n**Role**: `Support`\n\nKafka brings a unique set of skills to the table, specialized in both direct damage and DoT effects. Her active ability delivers a potent one-two punch consisting of **120%** physical damage and **70%** magic damage. Her active also doubles any HP debuffs on the enemy for 2 rounds, adding an extra layer of complexity and strategy. However, the 5-round cooldown makes it imperative to use this skill judiciously.\n\nEvery normal attack from Kafka comes with a **35%** chance to inflict Shock, which causes the enemy to take **25%** of the inflicted damage as DoT for the next **4** rounds. If another Shock is applied while one is active, it refreshes the duration of the existing debuff, making her particularly lethal over long engagements.\n\nIn a party, Kafka contributes by offering a **30%** chance each round to deal an additional **60%** damage to enemies. This attack carries a **25%** chance to inflict Shock, dealing **50%** of the inflicted damage over **3** rounds as DoT. This makes her a constant threat that can complement other heavy hitters in the party, as she can whittle down enemy HP steadily over time.",
        shortdesc: "**Uses**: `Unlimited`\n**Cooldown**: `5 rounds`\n**Cost**: `60 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (DoT - Shock)`\n\n__**Passive**__\n- ATTACK is altered to deal **100%** DMG + have a **35%** chance to apply Shock\n- Repeated Shock applications will not stack, instead they only refresh the duration of the existing Shock\n`Shock` : The enemy takes **25%** of the inflicted DMG as DoT for **4** rounds\n\n__**Active**__ (✨)\n- Deals **120%** physical DMG + **70%** magical DMG\n- Doubles effects of HP debuffs (e.g. Drain, Burn, Bleed) on the enemy for **2** rounds \n\n__**Party**__ (👥)\n- Allies have a **30%** chance to additionally deal **60%** DMG\n- This attack has a **25%** chance to apply Shock\n- `Shock`: The enemy takes **50%** of the inflicted DMG over **3** rounds as DoT",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Kafka
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (this.pause > matchStats.round) {
                myStats.sm += this.cost;
                matchStats.sendWarning({ content: `Kafka needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                return AbilityResponse.FAILURE;
            };
            this.pause = matchStats.round + 5;

            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1.2, magicDamage: false });
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.7, magicDamage: true, mdChance: -1 });

            ebuff.hp.forEach((buff) => {
                if ((buff.type === "*" && buff.val < 1) || (buff.type === "+" && buff.val < 0)) ebuff.hp.push(new buffInfo(buff.type, buff.val, Math.min(2, buff.last), buff.change, buff.ctype));
            });

            return AbilityResponse.SUCCESS;
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            myStats.replaceButton.atk = {
                "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    const dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                    if (Math.random() < 0.35) {
                        if (ebuff.hp.findIndex((e) => e.id === this.buffID) !== -1) ebuff.hp.splice(ebuff.hp.findIndex((e) => e.id === this.buffID), 1);
                        const shockBuff = new buffInfo("+", -Math.floor(dmg * 0.25), 4);
                        this.buffID = shockBuff.id;
                        ebuff.hp.push(shockBuff);
                        notice.push(`\n✨ **${char.name}** inflicted shock!`);
                    };

                    return AbilityResponse.SUCCESS;
                },
            };

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            if (Math.random() < 0.3) {
                let shockDMG = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.6, ignoreShield: true, magicDamage: true });
                if (Math.random() < 0.25) ebuff.hp.push(new buffInfo("+", -Math.floor(shockDMG * 0.5), 3));
            };
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.3) {
                    let shockDMG = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.6, ignoreShield: true, magicDamage: true });
                    if (Math.random() < 0.25) ebuff.hp.push(new buffInfo("+", -Math.floor(shockDMG * 0.5 * (1 / 3)), 3));
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "14909": {
        usage: 10,
        used: 0,
        cost: 80,
        pause: 0,
        bladeUsedActive: false,
        desc: "**Total Usage**: `10 (CD: 4)`\n**Cost**: `80`\\💧\n**Timeout**: `Yes`\n**Role**: `DPS`\n\nCursed with self-healing immortality, Blade works with Kafka and Silverwolf as a stellaron hunter, while seeking to end his own suffering by eternal death. When he is below **50%** HP in battle, he takes **40%** less DMG from damage instances. This is unstackable with other damage mitigation effects, where only the strongest one takes effect.\n\nUpon taking damage from damage instances or countering a hit, gains **1x** `Charge`. Upon having **4x** or more `Charge`, consumes **4x** to unleash Shuhu's Gift. This increases his ATK by **15%** of recorded DMG taken (Up to 50%) for that turn, and recovers his HP by **15%** of recorded DMG taken (Up to 50%), before dealing **80%** undodgeable DMG.\n\nUsing his active deals **30%** missing HP to the enemy, before lowering max HP by **50%** for **4** turns. Moreover, he will also self-inflict **5%** DMG to himself for the next **4** rounds.\n\nIn a party, he intervenes every **4** rounds, dealing **60%** DMG to the enemy before lowering their DEF & MR by **20%** for that round (Max 2x damage). However, if the ally is Dan Heng, or the fight reaches round **40**, he becomes marastruck, additionally dealing **15%** DMG to the ally every **4th** turn. This marastruck effect however can be completely nullified if Kafka is in the team.",
        shortdesc: "**Uses**: `10`\n**Cooldown**: `4 rounds`\n**Cost**: `80 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Sacrificial, Charge, Burst survival)`\n\n__**Passive**__\nWhen below **50%** HP:\n- **+40%** DMG mitigation (Unstackable : Only the strongest one takes effect) \n- Upon receiving a damage instance or countering a hit, gains **1x** `Charge`\n\nUpon reaching **4x** or more `Charge`, consumes **4x** to activate Shuhu's Gift:\n- Increases ATK by **15%** of recorded DMG taken for that turn (Up to **50%**)\n- Recovers HP by **15%** of recorded DMG taken (Up to **50%** max HP)\n- Deals **80%** undodgeable DMG\n\n__**Active**__ (✨)\n- Deals **30%** missing HP\nFor **4** turns:\n- Decreases max HP by **50%**\n- Self-inflicts **5%** undodgeable DMG (counts as a damage instance)\n\n__**Party**__ (👥)\nIntervenes every **4** rounds\n- Deals **60%** DMG to the enemy\n- Decreases their DEF & MR by **20%** for that round (Max 2x damage)\n\nIf ally is Dan Heng, or the fight reaches round **40**:\n- Becomes Mara struck: additionally deals **15%** DMG to the ally every **4th** round\n- This marastruck effect can be nullified when Kafka is in the team",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Blade (HSR)
            if (this.pause > matchStats.round) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                myStats.sm += this.cost;
                matchStats.interaction.followUp({ content: `Blade needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                return AbilityResponse.FAILURE;
            };
            this.pause = matchStats.round + 4;

            // Sets maxHP to 50% of HP for 4 turns
            const hpreduction = Math.floor(myStats.maxhp * 0.5);
            myStats.maxhp -= hpreduction;
            this.bladeUsedActive = true;
            if (myStats.hp > myStats.maxhp) { myStats.hp = myStats.maxhp; };
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 4, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.maxhp += hpreduction;
                this.bladeUsedActive = false;

                return AbilityResponse.SUCCESS;
            }));

            // Deals undodgeable DMG based off 30% lost HP
            const dmg = (eStats.def + eStats.mr < 100000) ? Math.floor((myStats.maxhp - myStats.hp) * 0.3) : 0;
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { overwriteDamage: dmg, magicDamage: true, dodge: false });

            // Deals 5% uncounterable DMG to self every turn for 4 turns -> Counts towards CHARGE
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                dealDamage(myStats, myStats, mybuff, mybuff, matchStats, notice, `✨ **${char.name}**'s self-attack`, { atkMultiplier: 0.05, magicDamage: true, canCounter: false });

                return AbilityResponse.SUCCESS;
            }, 4));

            return AbilityResponse.SUCCESS;
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            myStats.charge ??= 0;
            myStats.damageTaken ??= 0;

            matchStats.on("counter", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
                if (target === myStats) {
                    myStats.charge += 1;
                };

                // Shuhu's Gift
                if (myStats.charge >= 4) {
                    myStats.charge -= 4;
                    const bonus = Math.floor(myStats.damageTaken * 0.15);
                    myStats.atk += Math.min(Math.floor(myStats.atk * 0.5), bonus);
                    myStats.hp += Math.min(Math.floor(myStats.maxhp * 0.5), bonus);
                    if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ *My vengeance will pursuit you...* **${char.name}**`, { atkMultiplier: 0.8, magicDamage: true, dodge: false });
                };
            });

            matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
                if (target === myStats) {
                    myStats.charge += 1;
                };

                // Shuhu's Gift
                if (myStats.charge >= 4) {
                    myStats.charge -= 4;
                    const bonus = Math.floor(myStats.damageTaken * 0.15);
                    myStats.atk += Math.min(Math.floor(myStats.atk * 0.5), bonus);
                    myStats.hp += Math.min(Math.floor(myStats.maxhp * 0.5), bonus);
                    if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ *My vengeance will pursuit you...* **${char.name}**`, { atkMultiplier: 0.8, magicDamage: true, dodge: false });
                };
            });

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if ((myStats.hp / myStats.maxhp < 0.5 || this.bladeUsedActive) && myStats.damageReduction < 0.4) myStats.damageReduction = 0.4;
                if (myStats.charge >= 4) {
                    myStats.charge -= 4;
                    const bonus = Math.floor(myStats.damageTaken * 0.15);
                    myStats.atk += Math.min(Math.floor(myStats.atk * 0.5), bonus);
                    myStats.hp += Math.min(Math.floor(myStats.maxhp * 0.5), bonus);
                    if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ *My vengeance will pursuit you...* **${char.name}**`, { atkMultiplier: 0.8, magicDamage: true, dodge: false });
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            if (myStats.name == "Dan Heng") notice.push(`\n✨ I have nothing to do with your past.`);
            const names = matchStats.partyChars.map((e: IcharInfo) => e.name);

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round % 4 === 0) {

                    // When team doesn't have Kafka    
                    if (!names.includes("Kafka")) {
                        // Lashes out indiscriminately after round 40 / when char is D.H.
                        if ((matchStats.round >= 40 && myStats.name !== "Kafka") || myStats.name == "Dan Heng") {
                            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🩸 **${pStats.name}** attacked **${myStats.name}**! He`, { atkMultiplier: 0.15 });
                        };
                    }
                    // Regular damage + DEF/MR shred
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${pStats.name}**`, { atkMultiplier: 0.6, magicDamage: true, dodge: false });
                    eStats.def -= Math.min(Math.floor(eStats.def * 0.2), 660);
                    eStats.mr -= Math.min(Math.floor(eStats.mr * 0.2), 660);
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "14917": {
        usage: 1,
        used: 0,
        cost: 80,
        unbreakableShield: false,
        desc: "**Total Usage**: `1`\n**Mana**: `80`\\💧\n**Timeout**: `yes`\n**Role**: `Tank/DPS`\n\nGepard brings a blend of aggressive resilience and protective instincts to the battlefield. He has a **14%** chance to counter incoming attacks, each of which add shield equal to **5%** of his max HP and decrease enemy DEF & MR by **15%** for that round.\n\nHis active when used provides him with a shield equal to **66%** of his max HP. Moreover, should he fall in battle within the next five rounds of using his active, he will revive with **20%** of his health and an a shield equal to **30%** of his max HP, ready to continue the fight.\n\nIn a party, Gepard's protective aura extends to his allies. Each ally benefits from a **14%** chance every round to gain a shield equal to **5%** of their max HP. Furthermore, should any ally's health drop below **20%**, they receive a persistent shield that keeps regenerating for the next **3** rounds.",
        shortdesc: "**Uses**: `1`\n**Cost**: `80 💧`\n**Timeout**: `Yes`\n**Role**: `DPS/Support (Counter, Shield, Revive)`\n\n__**Passive**__\n- **+14%** counter chance\nAfter countering:\n- Gains **5%** max HP shield\n- **-15%** enemy's DEF & MR\n\n__**Active**__ (✨)\n- Gains **66%** max HP shield\nIf he dies within **5** rounds:\n- Revive with **20%** HP\n- Gains **30%** max HP shield\n\n__**Party**__ (👥)\n- **14%** chance to gain **5%** max HP shield every round\nWhen health drops below **20%** HP:\n- Gains a persistent **1** HP shield for **3** rounds",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Gepard
            const shield = Math.floor(myStats.maxhp * 0.66);
            myStats.shield += shield;

            // Revival chance for 5 rounds
            myStats.maxRevivals = 1;
            myStats.rev = 1;
            myStats.revhp = 0.2;

            // Add shield if revived
            myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.revivedTotal === 1) {
                    myStats.shield += Math.floor(myStats.maxhp * 0.3);
                    //@ts-ignore
                    this._used++;
                };

                return AbilityResponse.SUCCESS;
            }, 5, 1));

            // Remove revival chance
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 6, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.rev = 0;
                myStats.maxRevivals = 0;

                return AbilityResponse.SUCCESS;
            }, 1));

            notice.push(`\n✨ **${char.name}** gained ${shield} shield!`);

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.14) {
                    myStats.counter = 1;

                    myStats.shield += Math.floor(myStats.maxhp * 0.05);

                    eStats.def = Math.floor(eStats.def * 0.85);
                    eStats.mr = Math.floor(eStats.mr * 0.85);
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // 15% Chance to gain 5% maxhp shield
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.14) myStats.shield += Math.floor(myStats.maxhp * 0.05);

                return AbilityResponse.SUCCESS;
            }, 9999));

            // When HP drops below 20%
            myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp < myStats.maxhp * 0.2) {
                    //@ts-ignore
                    this._used++;

                    // Regenerating Shield for 3 rounds
                    myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                        if (myStats.shield < 1) myStats.shield = 1;

                        return AbilityResponse.SUCCESS;
                    }, 3));
                };

                return AbilityResponse.SUCCESS;
            }, 9999, 1));

            return AbilityResponse.SUCCESS;
        },
    },
    "16195": {
        usage: 9999,
        used: 0,
        cost: 40,
        pause: -6,
        desc: "**Total Usage**: `Unlimited (CD: 6) [✨] // Unlimited (CD: 6) [❌]`\n**Cost**: `40 💧 [✨] // All the “BoL” currently stacked [❌]`\n**Timeout**: `No / Yes` \n**Role**: `DPS`\n\nArlecchino replaces the class active button with her elemental burst: “Balemoon Rising”, while her ability functions around “Bond of Life”, shortened to `BoL`\n\nBond of Life (BoL): `BoL` is a mechanic that prevents healing from other sources. Every **1%** max HP is equivalent to **1%** BoL. Maximum **200%** `BoL` (200% max HP) can be stacked at any given moment.\n\nArlecchino’s ATTACK is altered, empowering it with bloodlust to deal extra damage, specifically **+1%** DMG for every **5%** `BoL` owned. Up to **5%** of `BoL` is consumed afterwards.\n\nHer active (✨) – All Is Ash, summons forth Balemoon Bloodfire, granting her `BoL` equal to **75%** of her max HP, before inflicting *Blood-Debt Directive* on the opponent for **6** rounds.\n\nBlood-Debt Directive: When inflicted, the opponent cannot heal. At the start of every round, takes **7.5%** of `BoL` on Arlecchino as DMG, while also spending **5%** `BoL` in the process.\n\nUpon using her Class skill (❌) : Balemoon Rising, the great wing of Balemoon Bloodfire beats as she gathers and clears *Blood-Debt Directives* around her if any. She then deals unamplified absolute undodgeable DMG (ignores DEF/MR) equal to all `BoL` owned, and resets `BoL` owned. If she has gathered Directive previously, she gains `BoL` equivalent to **125%** of her Max HP\n\nArlecchino has two side passives to her arsenal.\n\nFirstly, Arlecchino gains **1%** DMG mitigation for every **10%** `BoL` she has. Secondly, The Balemoon Alone May Know: Only Arlecchino can heal herself, heals equal to the amount of `BoL` consumed/lost, up to **50%** of max HP can be healed this way at once.",
        shortdesc: "**Uses**: `Unlimited (CD: 6) [✨] // Unlimited (CD: 6) [❌]`\n**Cost**: `40 💧[✨] // All the “BoL” currently stacked [❌]`\n**Timeout**: `No / Yes`\n**Role**: `DPS (Bond of Life, Burst heal)`\n\n__**Core Mechanic**__:\n- Bond of Life (`BoL`) prevents healing from other sources\n- Every **1%** `BoL` is equal to **1%** of your max HP\n- You can have **200%** `BoL` at most anytime\n- Consuming any `BoL` allows you heal the equivalent, up to **50%** max HP\n- For every **10%** `BoL`, you have **+1%** DMG mitigation\n\n__**Active**__ (✨)\n- Gain `BoL` equivalent to **75%** of max HP\n- Inflict Blood-Debt Directive* on the enemy for **6** rounds\n\n*Blood-Debt Directive* : The inflicted cannot heal. At the start of every round, they take **7.5%** of her `BoL` as unamplified absolute undodgeable DMG (ignores DEF/MR). This also consumes **5%** `BoL` in the process.\n\n__**Passive**__\nHer ATTACK (🚫) is altered:\n- Deals **100%** damage, scaling increased by **1%** for every **5%** `BoL` owned. Afterwards, consumes up to **5%** `BoL`.\n\nHer class skill (❌) is altered:\n- Clears any *Blood-Debt Directive*.\n- Then, deals unamplified absolute undodgeable DMG (ignores DEF/MR) equal to all of her `BoL`\n- Alas, resets all `BoL` owned. If Blood-Debt Directive was cleared previously, immediately gains `BoL` equal to **125%** max HP",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Arlecchino
            matchStats.turn = matchStats.turnSkill ? 0 : 1;
            if (this.pause > matchStats.round) {
                matchStats.interaction.followUp({ content: `Arlecchino needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                this.used--;
                myStats.sm += this.cost;
                return AbilityResponse.FAILURE;
            };

            this.pause = matchStats.round + 6;
            // Gain BoL equivalent to 75% max HP
            const boLgain = Math.floor(myStats.maxhp * 0.75);
            myStats.bondOfLife += boLgain;
            notice.push(`\n✨ **${char.name}** gained **${boLgain}** Bond of Life and inflicted Blood-Debt Directive`);
            if (myStats.bondOfLife > myStats.maxhp * 2) myStats.bondOfLife = myStats.maxhp * 2;

            // Blood debt directive
            myStats.bloodDirective = 6;
            return AbilityResponse.SUCCESS;
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            myStats.bondOfLife = 0;
            this.bolLastCleared = -6;
            myStats.bloodDirective = 0;

            // Long Term effects
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                // Cap BoL at 200% max HP
                if (myStats.bondOfLife > myStats.maxhp * 2) myStats.bondOfLife = myStats.maxhp * 2;

                // 1% DMG mitigation for every 10% BoL
                if (myStats.bondOfLife > 0) {
                    myStats.putDamageOnHold += 0.01 * Math.floor((myStats.bondOfLife / myStats.maxhp) / 0.1);
                };

                // Blood Debt Directive effects (if any)
                if (myStats.bloodDirective > 0) {
                    myStats.bloodDirective--;
                    // Cannot heal for 6 rounds
                    myStats.negateHeal = 1;

                    // Take DMG equivalent to 7.5% of BoL
                    eStats.hp -= Math.floor(myStats.bondOfLife * 0.075);
                    if (eStats.hp < 0) eStats.hp = 0;

                    // Consumes 5% of BoL at most
                    const consumableBOL = Math.floor(Math.min(myStats.bondOfLife, myStats.maxhp * 0.05));
                    myStats.bondOfLife -= consumableBOL;
                    if (consumableBOL > 0) addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, consumableBOL, { bypassBoL: true });
                    if (myStats.bondOfLife < 0) myStats.bondOfLife = 0;
                } else {
                    myStats.negateHeal = 0;
                };
                return AbilityResponse.SUCCESS;
            }, 9999));

            myStats.replaceButton.atk = {
                "emoji": "🚫",
                "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    // Every 5% BoL = +1% DMG
                    let extraDMG = 0.01 * Math.floor((myStats.bondOfLife / myStats.maxhp) / 0.05);
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🚫 **${char.name}**`, { atkMultiplier: 1 + extraDMG });

                    // Consumes 5% of BoL at most
                    const consumableBOL = Math.floor(Math.min(myStats.bondOfLife, myStats.maxhp * 0.05));
                    if (consumableBOL > 0) addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, consumableBOL, { bypassBoL: true });
                    myStats.bondOfLife -= consumableBOL;
                    if (myStats.bondOfLife < 0) myStats.bondOfLife = 0;

                    return AbilityResponse.SUCCESS;
                },
            };

            myStats.replaceButton.cskill = {
                "emoji": "❌",
                "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    let cd = this.bolLastCleared + 6 - matchStats.round;
                    if (cd > 0) {
                        matchStats.turn = matchStats.turnSkill ? 0 : 1;
                        matchStats.interaction.followUp({ content: `Arlecchino needs to rest ${cd} more ${cd === 1 ? "round" : "rounds"}`, ephemeral: true });
                        return AbilityResponse.FAILURE;
                    } else {
                        this.bolLastCleared = matchStats.round;
                        let clearedBDD = false;

                        if (myStats.bloodDirective > 0) {
                            clearedBDD = true;
                            notice.push(`\n⚜️ **${char.name}** cleared Blood-Debt Directive`);
                            myStats.bloodDirective = 0;
                            myStats.negateHeal = 0;
                        };
                        if (myStats.bondOfLife > myStats.maxhp * 2) myStats.bondOfLife = myStats.maxhp * 2;

                        // Heal up to 50% of max HP
                        const consumableBOL = Math.floor(Math.min(myStats.maxhp * 0.5, myStats.bondOfLife));
                        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, consumableBOL, { bypassBoL: true });

                        // Deals BoL as direct unamplified DMG
                        eStats.hp -= Math.floor(myStats.bondOfLife);
                        if (eStats.hp < 0) eStats.hp = 0;
                        notice.push(`\n❌ **${char.name}** consumed all Bond of Life and dealt **${Math.floor(myStats.bondOfLife)}** damage.`);

                        // Reset BoL
                        myStats.bondOfLife = 0;

                        // Gain BoL
                        if (clearedBDD) {
                            myStats.bondOfLife += myStats.maxhp * 1.25;
                            clearedBDD = false;
                        };

                        return AbilityResponse.SUCCESS;
                    };
                }
            };
            return AbilityResponse.SUCCESS;
        },
    },
    "16199": {
        usage: 9999,
        used: 0,
        cost: 0,
        burst: true,
        desc: "**Total Usage**: `Unlimited`\n**Mana**: `110`\\💧\n**Timeout**: `No/No`\n**Role**: `DPS/Support`\n\nOnce bounded in a sanctuary, the Dendro archon has been freed, purging darkness with dreams, where she finds solace in boundless bliss.\n\nWith telepathic skills, she first gathers battle data, recording all DMG taken. At the start of the turn, if she's below **33%** HP, exits the mode and gains a shield equivalent to all DMG taken, up to **100%** of her max HP, before overwhelming the enemy, stunning them for **2** rounds.\n\n*Sunlight paints the dream in a golden hue anew, as butterflies meet grass glittering with dew...*\n\nHer ability is split into **2** parts depending on mana owned.\n\n`All Schemes to Know`: Consumes **80** :droplet: allows her to aim and mark the enemy with the Seed of Skandha for **2** rounds. If used when the enemy already has the seed, extends the duration of marking.\nAttacks against marked opponents grants the following effects:\n> - **+30%** critical rate (45% when in temple)\n> - Ignore **15%** of enemy's DEF & MR (22.5% when in temple)\n> - A critical hit restores **6** :droplet:(9 when in temple)\n\n`Illusory Heart`: Consumes **110** :droplet: to summon the __Temple of Wisdom__ for **4** rounds with the following effects:\n> - The marking ability will cost **50%** less but have **+50%** effectiveness. (40 cost, mark for 4 rounds)\n> - The marking effects will have **+50%** effectiveness.\n- When having sufficient mana, immediately follows up with her marking skill.\n\nIf Temple is already active, she'll always prioritize casting `All Schemes to Know` even if she has 110 mana or more.\n\nIn a party, she marks the enemy every **3** rounds, with the marking lasting for that round only. Hitting the marked enemy will restore **9** 💧 instead of 6. The rest of the marked effects are the same as her passive.",
        shortdesc: "**Uses**: `Unlimited`\n**Cost**: `110 💧`\n**Timeout**: `No/No`\n**Role**: `DPS (Marking, Burst survival)`\n\n__**Passive**__\n- Records DMG taken\nAt the start of the turn, if she's below **33%** HP:\n- Gains a shield equivalent to DMG taken (Up to **100%** of max HP, usable once in battle)\n- Stuns the enemy for **2** turns\n\n__**Active**__ (✨)\n80 💧: Marks enemy with `Seed` for **2** rounds, repeated markings extend duration.\nAttacks against marked enemies have the following properties:\n- **+30%** critical rate (+45% when in temple)\n- Ignore **15%** DEF & MR (-22.5% when in temple)\n- Critical hit restores **6** 💧 (9 when in temple)\n\n110 💧: Summons temple for **4** rounds\n- Marking ability costs **50%** less but has **+50%** effectiveness (40 cost, mark for 4 rounds)\n- When having sufficient mana, immediately follows up with her marking skill.\n\nNotes: If temple is inactive, always prioritizes summoning temple before using marking\n\n__**Party**__ (👥)\n- Marks enemy for **1** round every **3** rounds.\n- Hitting marked enemy instead grants **9** 💧. The rest of the marked effects are as the same as her passive.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Nahida
            matchStats.turn = matchStats.turnSkill ? 0 : 1;

            const cheapmark = () => {
                if (myStats.sm >= 40) {
                    myStats.sm -= 40;
                    eStats.marked += 4;
                    notice.push(`\n𓇬 The enemy is now marked for ${eStats.marked} rounds!`);
                };
            };

            // Condition: When in temple state and can mark enemy
            if (myStats.sm >= 40 && myStats.temple > 0) {
                cheapmark();

                return AbilityResponse.SUCCESS;
            };

            // Condition: When not in temple state but still can mark enemy
            if (myStats.sm >= 80 && myStats.sm < 110) {
                // Mark enemy
                myStats.sm -= 80;
                eStats.marked += 2;
                notice.push(`\n𓇬 The enemy is now marked for ${eStats.marked} rounds!`);

                return AbilityResponse.SUCCESS;
            };

            // Condition: Not in temple state but can summon temple
            if (myStats.sm >= 110) {
                // Summons temple for 4 turns
                myStats.sm -= 110;
                myStats.temple = 4;
                notice.push(`\n✨ Summoned the temple of wisdom for **4** rounds!`);

                // Immediately mark enemy if have sufficient mana
                cheapmark();

                return AbilityResponse.SUCCESS;
            };

            // If not enough mana
            matchStats.sendWarning({ content: `**${char.name}** does not have sufficient mana to use any of her active abilities`, ephemeral: true });
            return AbilityResponse.FAILURE;
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            myStats.temple = 0;
            eStats.marked = 0;

            // Gains shield equal to DMG taken (Up to 100% of own max HP) + Stun for 2 turn when below 35% HP at the start of the turn
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if ((myStats.hp / myStats.maxhp <= 0.33) && this.burst) {
                    const shgain = Math.min(myStats.damageTaken, myStats.maxhp);
                    notice.push(`\n✧ Data collection is complete! **${char.name}** gained **${shgain}** shield ✧`);
                    myStats.shield += shgain;
                    eStats.timeFrozen = true;
                    eStats.frozenMessage = "was overwhelmed ⋆.ೃ࿔";
                    this.burst = false;

                    // When stun is over
                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 2, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        eStats.timeFrozen = false;

                        return AbilityResponse.SUCCESS;
                    }));
                };

                // Marked enemies (Nahida)
                if (eStats.marked > 0) {
                    eStats.marked--;
                    let multiplier = 1;
                    if (myStats.temple > 0) multiplier = 1.5;
                    myStats.cr += 0.3 * multiplier;
                    if (myStats.cr > 1) myStats.cr = 1;
                    eStats.def -= Math.floor(eStats.def * 0.15 * multiplier);
                    eStats.mr -= Math.floor(eStats.mr * 0.15 * multiplier);

                    if (eStats.marked === 0) notice.push(`\n𓇬 The enemy lost the mark of Skandha...`);
                }

                if (myStats.temple > 0) {
                    myStats.temple--;
                    if (myStats.temple === 0) notice.push(`\n💡 The temple of wisdom withered... ⋆.ೃ࿔*:･`);
                }

                return AbilityResponse.SUCCESS;
            }, 9999));

            // Gain +6/9 mana when critting a marked enemy
            matchStats.on("crit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
                if (eStats.marked > 0 && caster === myStats) {
                    myStats.sm += 6;
                    if (myStats.temple > 0) myStats.sm += 3;
                    if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;
                };
            });

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Marks enemy every 3 turns
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round % 3 === 0) {
                    // Marked enemy
                    eStats.marked = true;
                    myStats.cr += 0.3;
                    if (myStats.cr > 1) myStats.cr = 1;
                    eStats.def -= Math.floor(eStats.def * 0.15);
                    eStats.mr -= Math.floor(eStats.mr * 0.15);

                    // Remove marked status
                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        eStats.marked = false;
                        return AbilityResponse.SUCCESS;
                    }));
                };
                return AbilityResponse.SUCCESS;
            }, 9999));

            // Gain +9 mana when critting a marked enemy
            matchStats.on("crit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
                if (eStats.marked) {
                    myStats.sm += 9;
                };
            });

            return AbilityResponse.SUCCESS;
        },
    },
    "17115": {
        usage: 3,
        used: 0,
        cost: 60,
        selfhealidx: 0,
        desc: "**Total Usage**: `3`\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n**Role**: `Support/DPS`\n\nLuminous, in this form, offers a unique blend of self-sustain, damage amplification, and party support, making her suitable for both individual challenges and team battles.\n\nRight from the onset, Luminous heals **7.5%** of the damage she deals, which can be amplified by **+1.5%** with each active use up to **12%**. Her active unleashes a powerful strike causing **140%** damage against monsters, or **115%** against players. Additionally, her offensive capabilities grow with every use of this ability, increasing her ATK and MD by **10%** each time. She also possesses significant defensive strengths, as she inherently takes **15%** reduced damage, making her harder to take down. And when inside the dungeon, she benefits from a **25%** boost to class xp, speeding up her progress.\n\nLuminous' protective nature is not just confined to herself. She extends her protective aura to party members, reducing their damage taken by **15%** and bestowing them with a **5%** healing of their damage dealt. Additionally, for the initial **10** rounds, party members will lose **15** DEF and MR, gaining **2.5%** ATK and MD instead. This dynamic shift promotes an aggressive approach, compelling the team to capitalize on their enhanced damage during the early rounds.",
        shortdesc: "**Uses**: `3`\n**Cost**: `60 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Lifesteal, DMG-boost)`\n\n__**Passive**__\n- **+7.5%** lifesteal\n- **+155** DEF & MR\n- Gains **+25%** class XP\n\n__**Active**__ (✨)\n- Deals **140%** DMG (115% in arenas)\n- **+1.5%** lifesteal\n- **+10%** ATK & MD\n\n__**Party**__ (👥)\n- **+155** DEF & MR\n- **+5%** lifesteal\n- During the first **10** rounds: Lose **15** DEF & MR every round for **2.5%** ATK & MD",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Luminous EX | Lumi EX
            myStats.selfheal[this.selfhealidx] += 0.015; // Increase to max 12% selfheal
            let dungeonBoost = 1.4;
            if (matchStats.interaction.commandName === "arena") dungeonBoost = 1.15;
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: dungeonBoost, magicDamage: true, ignoreShield: true, selfHeal: true });

            mybuff.atk.push(new buffInfo("*", 1.1, 9999));
            mybuff.md.push(new buffInfo("*", 1.1, 9999));
            myStats.atk += Math.floor(myStats.atk * 0.1);
            myStats.md += Math.floor(myStats.md * 0.1);

            return AbilityResponse.SUCCESS;
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            matchStats.xpboost += 0.25;
            myStats.selfhealChance.push(1);
            myStats.selfheal.push(0.075);
            this.selfhealidx = myStats.selfheal.length - 1;

            mybuff.def.push(new buffInfo("+", 155, 9999)); // Takes 15% less damage
            mybuff.mr.push(new buffInfo("+", 155, 9999));
            myStats.def += 155;
            myStats.mr += 155;

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            mybuff.def.push(new buffInfo("+", 155, 9999)); // Takes 15% less damage
            mybuff.mr.push(new buffInfo("+", 155, 9999));
            myStats.def += 155;
            myStats.mr += 155;
            myStats.selfhealChance.push(1);
            myStats.selfheal.push(0.05);

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round <= 10) {
                    mybuff.def.push(new buffInfo("+", -15, 9999)); // reduces def by 15 each round, gives 2.5% atk each round, capped at round 10
                    mybuff.mr.push(new buffInfo("+", -15, 9999));
                    mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.025), 9999));
                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.025), 9999));
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "17116": {
        usage: 3,
        used: 0,
        cost: 60,
        desc: "**Total Usage**: `3`\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n**Role**: `DPS`\n\nIsolde's character embodies the archetype of a risk-reward DPS with abilities that grow stronger as she becomes more vulnerable. The pain she endures becomes the bane of her adversaries. The lower her health, the higher the damage she can deal, providing her with a damage boost of up to **40%**. When her HP is dwindling, she can leverage **60%** of her missing HP to deal damage. After she vents her pain onto the enemy, Isolde regains **33%** of her missing HP.\n\nIsolde is not just a powerhouse, she's also quick on her feet. She has a **14-28%** chance to counter any attack aimed at her depending on her HP, which also decreases enemy DEF and MR by **8%** for **3** rounds if successful, making her not only a major threat offensively but also a character that can surprise her adversaries with unexpected retaliation. Moreover, her drive and dedication in dungeons reflect as she gains **25%** more class XP.\n\nIsolde's presence on the battlefield is not only motivating but also enhancing. For the first 10 rounds, she pushes her allies, gradually increasing their ATK and MD by **2.5%** every round. This culminates in a significant **25%** boost by the 10th round, making the entire party a force to be reckoned with as the battle progresses.\n\nIn essence, Isolde is a character of defiance. The closer she is to defeat, the stronger she becomes, and her ability to turn the tables in dire situations makes her an invaluable asset to any team.",
        shortdesc: "**Uses**: `3`\n**Cost**: `60 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Counter, Burst survival)`\n\n__**Passive**__\n- Deals more DMG the lower her HP is (Up to **40%**)\n- Has **14%** base counter rate, increased the lower her HP is (Up to **28%** counter chance)\n- Gains **+25%** class XP\n\n__**Active**__ (✨)\n- Deals **60%** of missing HP to the enemy\n- Restores **33%** of lost HP  \n\n__**Party**__ (👥)\n- Increases ATK & MD by **2.5%** every round during the first **10** rounds.",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Isolde
            const dmg = (eStats.def + eStats.mr < 100000) ? Math.floor((myStats.maxhp - myStats.hp) * 0.6) : 0;
            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ ${char.name}`, { overwriteDamage: dmg, magicDamage: true, dodge: false });
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.33), {});

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            matchStats.xpboost += 0.25;
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < (0.14 + (0.14 * (1 - (myStats.hp / myStats.maxhp))))) {
                    myStats.counter = Math.max(1, myStats.counter ?? 0);
                    ebuff.def.push(new buffInfo("*", 0.92, 3));
                    ebuff.mr.push(new buffInfo("*", 0.92, 3));
                }
                myStats.atk += Math.floor(myStats.atk * 0.4 * (1 - (myStats.hp / myStats.maxhp)));
                myStats.md += Math.floor(myStats.md * 0.4 * (1 - (myStats.hp / myStats.maxhp)));

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.atk += Math.floor(myStats.atk * (0.025 * Math.min(matchStats.round, 10)));
                myStats.md += Math.floor(myStats.md * (0.025 * Math.min(matchStats.round, 10)));

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "17117": {
        usage: 3,
        used: 0,
        cost: 80,
        desc: "**Total Usage**: `unlimited`, `unlimited`, `3`\n**Mana**: `10-20`\\💧, `20-30`\\💧, `80-100`\\💧\n**Timeout**: `yes`, `yes`, `yes`\n**Role**: `DPS/Support`\n\nRudeus Greyrat encapsulates the progression and versatility of a mage that requires keen management of his considerable mana pool said to rival that of the ancient Demon God Laplace. His mana generation is increased by **+20** as well, reflecting his proficiency and natural talent in magic. And as the fight continues, Rudeus keeps learning and growing as a mage, increasing the potency of his spells on the 5th and 10th rounds each. His 3 spells are as follows:\n\n**Stone Cannon**: Rudeus can utilize this spell to fire a powerful projectile at his opponent. Notably, this attack has both a physical and magical damage component, dealing **100-120%** magic damage, and an additional **10-20%** physical damage caused by the impact. If Rudeus is low on mana only the physical impact will cause damage.\n\n**Quagmire**: Upon casting, Rudeus will drastically increase his dodge rate to **50-75%**, making him harder to hit in the subsequent round. It also weakens the opponent, reducing their dodge rate to **0%** for **3** rounds, as well as reducing their DEF & MR by **15-25%** for 2 rounds.\n\n**Electric**: Electric channels a surge of magical energy to electrocute the opponent. A high cost high damage spell with limited use, dealing **150-200%** magic damage to the opponent.\n\nIn a party, Rudeus offers a unique advantage backing his party members from the rear. He has a **30%** chance to intervene randomly, delivering a magical blow to the enemy dealing **60%** magic damage and reducing enemy DEF & MR by **10%** for 2 rounds.",
        shortdesc: "**Uses**: `3`\n**Cost**: `80-100 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Progressive, DMG-boost, Dodge)`\n\n__**Passive**__\n- **+20** mana regeneration\n- **+500** mana pool (capacity)\n- His ATTACK , DEFEND & ACTIVE are *enhanced* on the **5th** and **10th** rounds, having permanent upgrades.\n\nATTACK:\n**Cost**: `10-20 💧` (Depends on *enhancement* of ATTACK)\n- Deal **100-120%** MD + **10-20%** ATK (Depends on *enhancement* of ATTACK)\n- If he does not have enough 💧, this only deals the ATK DMG.\n\nDEFEND:\n**Cost**: `20-30 💧` (Depends on *enhancement* of DEFEND)\n- **+50%-75%** dodge rate that round\n- Enemy has **0%** dodge rate for **3** rounds\n- **-15-25%** enemy's DEF/MR for **2** rounds\n\n__**Active**__ (✨)\n- Deals **150**/**170**/**200%** DMG (Depends on *enhancement* of ACTIVE)\n\n__**Party**__ (👥)\n- every round: **30%** chance to deal **60%** MD & **-10%** Enemy's DEF/MR for **2** rounds",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Rudeus Greyrat | Rudy | Rudeus EX
            let atkbuff = 1.5, mana_cost = 0;
            if (matchStats.round > 10) atkbuff = 2, mana_cost = 20;
            else if (matchStats.round > 5) atkbuff = 1.75, mana_cost = 10;

            if (this.cost + mana_cost > myStats.sm) {
                matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/${this.cost + mana_cost}<:mana:1047269152957661255>)`, ephemeral: true });
                myStats.sm += this.cost;
                return AbilityResponse.FAILURE;
            };
            myStats.sm -= mana_cost;

            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:stormbolt:1340378654919884981> **${char.name}**`, { atkMultiplier: atkbuff, mdChance: -1, magicDamage: true, dodge: false, ignoreShield: true });

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            // Mana Boost
            myStats.mana += 500;
            mybuff.mg.push(new buffInfo("+", 20, 9999));
            myStats.mg += 20;

            // Electric
            myStats.replaceButton.ability = { "emoji": "<:stormbolt:1340378654919884981>" };

            // Stone Cannon
            myStats.replaceButton.atk = {
                "emoji": "<:stonecannon:1340376201058844733>",
                "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    let mana_cost = 10, normal_dmg = 0.1, magic_damage = 1;
                    if (matchStats.round > 10) mana_cost = 20, normal_dmg = 0.4, magic_damage = 1.2;
                    else if (matchStats.round > 5) mana_cost = 15, normal_dmg = 0.2, magic_damage = 1.1;

                    if (mana_cost > myStats.sm) return dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}** is out of mana and`, { atkMultiplier: normal_dmg, magicDamage: false });

                    myStats.sm -= mana_cost;
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:stonecannon:1340376201058844733> **${char.name}**`, { atkMultiplier: magic_damage, magicDamage: true, mdChance: -1 }); // normal magical damage
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:stonecannon:1340376201058844733> **${char.name}**`, { atkMultiplier: normal_dmg, magicDamage: false }); // 10% physical damage

                    return AbilityResponse.SUCCESS;
                },
            };

            // Quagmire
            myStats.replaceButton.def = {
                "emoji": "<:quagmire:1340378636284461116>",
                "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    let mana_cost = 20, dodge_buff = 0.5, def_debuff = 0.15;
                    if (matchStats.round > 10) mana_cost = 30, dodge_buff = 0.75, def_debuff = 0.25;
                    else if (matchStats.round > 5) mana_cost = 25, dodge_buff = 0.625, def_debuff = 0.2;

                    if (mana_cost > myStats.sm) matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/${mana_cost}<:mana:1047269152957661255>)`, ephemeral: true });

                    myStats.sm -= mana_cost;
                    myStats.dodge = dodge_buff;
                    ebuff.dodge.push(new buffInfo("=", 0, 3));
                    ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * def_debuff), 1));
                    ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * def_debuff), 1));
                    eStats.dodge = 0;
                    eStats.def -= Math.floor(eStats.def * def_debuff);
                    eStats.mr -= Math.floor(eStats.mr * def_debuff);
                    notice.push(`\n<:quagmire:1340378636284461116> **${char.name}** decreased enemy's DEF and MR by **${def_debuff * 100}%**`);

                    return AbilityResponse.SUCCESS;
                },
            };

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            if (Math.random() < 0.3) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:stonecannon:1340376201058844733> **${name}**`, { atkMultiplier: 0.6, ignoreShield: true, magicDamage: true, mdChance: -1 });
                ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * 0.1), 2));
                ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.1), 2));
                eStats.def -= Math.floor(eStats.def * 0.1);
                eStats.mr -= Math.floor(eStats.mr * 0.1);
            };
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.3) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:stonecannon:1340376201058844733> **${name}**`, { atkMultiplier: 0.6, ignoreShield: true, magicDamage: true, mdChance: -1 });
                    ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * 0.1), 2));
                    ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.1), 2));
                    eStats.def -= Math.floor(eStats.def * 0.1);
                    eStats.mr -= Math.floor(eStats.mr * 0.1);
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "17583": {
        usage: 0,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `0`\n**Mana**: `0`\\💧\n**Timeout**: `no`\n**Role**: `Farming`\n\nUsing his ultimate skill Beelzebub, Raphael can end a fight in an instant, devouring his enemy. Enemies with less than half of his own EP will lose immediately as soon as the fight begins.",
        shortdesc: "**Uses**: `0`\n**Role**: `Farmer (Class XP)`\n\n__**Passive**__\nWhen he has double the EP of the enemy:\n- Consumes the enemy (wins the fight)\n\nNote: This unit's ability cannot be used in stampedes",
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Raphael EX
            if (matchStats.interaction.commandName === "stampede") return AbilityResponse.FAILURE;

            if (myStats.ep / eStats.ep >= 2) {
                eStats.hp = 0;
                notice.push(`\n✨ **${char.name}** used Beelzebub to consume **${enemy.name}**!`);
            };

            return AbilityResponse.SUCCESS;
        },
    },
    "17686": {
        usage: 4,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `4`\n**Mana**: `50`\\💧 on first 2 usages, `80`\\💧 on 3rd usage, `0` on 4th usage\n**Timeout**: `Yes // No (on 4th usage)`\n**Role**: `DPS/Support`\n\nEscanor, known as the Lion's Sin of Pride, offers a gameplay style tied to a day-night cycle which changes every **3** rounds. Escanor's power dramatically shifts with the day-night cycle. During the day, he gains a **20%** boost to attack, magic damage, defense, and magic resistance, but loses **4%** of his max HP per round due to the strain to his body.\n\nMoreover, the last day in the cycle is regarded as Noon, where he unleashes his `The One` power, gaining **35%** stat boosts instead of 20% during his normal day cycles. In addition, his DEFEND that round is altered to a Divine Attack, removing all of the enemy's counter attempts, before dealing **140%** DMG and granting himself 10x `Heat`. At last, after every round in Daytime, he gains 1x `Heat`.\n\nAs the night falls, he loses **20%** of attack, magic damage, defense, and magic resistance instead, but gains **20%** dodge chance as his power is so insignificant that he's barely sensable.\n\nEscanor's sunshine allows him to scorch the enemy for **2** rounds whenever they dare inflict an attack on Escanor. Scorch is a stackable DoT that deals his current HP to the enemy every round, **0.75%** for every 10x `Heat` owned, up to **3%**.\n\nMoving onto his active. During daytime rounds, Escanor can use `Crazy Prominence` with his first two usages, dealing additional damage based on the percentage of his remaining health (**100%** + **1%** damage for every **2%** remaining HP).\nWith his 3rd usage, Escanor unleashes `Final Prominence`, which significantly enhances his damage output based on the percentage of his missing health (**100%** + **1%** damage for every **1%** missing HP).\n\nEscanor's final usage summons a miniature Sun on the sky, raising his critical rate by **1%** for every `Heat` owned, up to 100% maximum crit rate. Any overflowing critical rate this way will be converted into **1%** Defense reduction on the enemy (up to 30%). If there is still overflowing critical rate left, converts them to **+1%** critical DMG (up to 30%).",
        shortdesc: "**Uses**: `4`\n**Cost**: `50 💧 (first 2 usages), 80 💧 (3rd usage), 0 💧 (4th usage)`\n**Timeout**: `Yes/ No (4th usage)`\n**Role**: `DPS (Progressive, DoT, Burst, Anti-counter)`\n\n__**Passive**__\nWhenever receives an attack -> Inflicts Scorch for **2** rounds:\n- Deals his current HP to the enemy every round (**0.75%** for every **10x** `Heat` owned, up to **3%**)\n\nShifts Day and Night cycle every **3** rounds ; The last turn of Day is regarded as *Noon*\n\nDay :\n- **+20%** ATK/MD & DEF/MR\n- Lose **4%** max HP every round\n- Gain **1x** `Heat`\n\nNoon:\n- **+35%** ATK/MD & DEF/MR\n- Lose **4%** max HP\n- Gain **1x** `Heat`\n- DEFEND is altered to Divine Attack\n> Removes any counter attempts (Counter next hit effects), before dealing **140%** DMG and gaining **10x** `Heat`)\n\nNight:\n- **-20%** ATK/MD & DEF/MR\n- **+20%** dodge chance \n\n__**Active**__ (✨)\nFirst TWO activations: *Crazy Prominence*\nCondition: `During Day/Noon`\n- Deals **100%** MD, **+1%** MD for every **2%** HP remaining\n\nTHIRD activation: *Final Prominence*\n- Deals **100%** MD, **+1%** MD for every **1%** HP missing\n\nFOURTH activation: *Miniature Sun*\n- Increases critical rate by **1%** for every `Heat` owned, up to 100%\n\nEvery overflowing critical rate this way will be converted into:\n- Enemy DEF/MR **-1%** (max: 30%, 2x DMG)\n- If there is still overflowing critical rate left, converts them to **+1%** critical DMG (max: 30%)",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Escanor EX
            let roundTime = (matchStats.round - 1) % 6; // day: [0, 1], noon: [2], night: [3, 4, 5];

            // Check if day time for the first 3 skill uses
            if (roundTime > 2 && this.used <= 3) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: `${this.used === 3 ? "Final Prominence" : "Crazy Prominence"} can only be used during day time (in ${6 - roundTime} rounds)`, ephemeral: true });
                myStats.sm += this.cost;
                this.used--;
                return AbilityResponse.FAILURE;
            };

            // Check if enough mana for the first 3 skill uses
            if (this.used <= 3) {
                let mana_cost = (this.used === 3) ? 80 : 50;
                if (this.cost + mana_cost > myStats.sm) {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/${mana_cost}<:mana:1047269152957661255>)`, ephemeral: true });
                    myStats.sm += this.cost;
                    this.used--;
                    return AbilityResponse.FAILURE;
                };
                myStats.sm -= mana_cost;
            };

            let atkbuff = 1;
            if (this.used === 4) { // Cruel Sun: Every 1 Heat -> +1% critical rate
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                if (myStats.heat < 0) {
                    this.used--;
                    matchStats.sendWarning({ content: `**${char.name}** has no heat to summon a miniature sun!`, ephemeral: true });
                    return AbilityResponse.FAILURE;
                };
                let buffpercent = myStats.heat * 0.01;
                myStats.cr += buffpercent;
                if (myStats.cr <= 1) {
                    notice.push(`\n☀️**${char.name}** used Cruel Sun! Increased his critical rate by **${buffpercent * 100}%**`);
                    mybuff.cr.push(new buffInfo("+", buffpercent, 9999));
                } else {
                    //Overflowing critical rate -> 1% DEF shred . then Crit DMG up to 30%
                    let overflowingpercent = Math.floor((myStats.cr - 1) * 100) / 100;
                    let overflowingpercent2 = 0;
                    if (overflowingpercent > 0.3) {
                        overflowingpercent2 = Math.min(overflowingpercent - 0.3, 0.3);
                        overflowingpercent = 0.3;
                        myStats.cd += overflowingpercent2;
                    };
                    myStats.cr = 1;
                    eStats.def -= Math.min(Math.floor(eStats.def * overflowingpercent), 660);
                    notice.push(overflowingpercent2 > 0 ? `\n☀️**${char.name}** used Cruel Sun! Increased his critical rate by **${Math.floor((buffpercent - overflowingpercent - overflowingpercent2) * 100)}%**. Overflowing heat additionally decreased the enemy's DEF by **30%** and increased his critical damage by **${overflowingpercent2}%**!` : `\n☀️**${char.name}** used Cruel Sun! Increased his critical rate by **${Math.floor((buffpercent - overflowingpercent) * 100)}%**. Overflowing heat additionally decreased the enemy's DEF by **${overflowingpercent * 100}%**!`);
                    mybuff.cr.push(new buffInfo("+", buffpercent - overflowingpercent, 9999));
                    ebuff.def.push(new buffInfo("+", -Math.min(Math.floor(eStats.def * overflowingpercent), 660), 9999));
                    mybuff.cd.push(new buffInfo("+", overflowingpercent2, 9999));
                };

                return AbilityResponse.SUCCESS;
            } else if (this.used === 3) {
                // Final Prominence: Every 1% missing HP -> +1% damage
                atkbuff += (1 - (myStats.hp / myStats.maxhp));
            } else {
                // Crazy Prominence: Every 2% remaining HP -> +1% damage
                atkbuff += ((myStats.hp / myStats.maxhp) / 2);
            };

            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used ${this.used === 3 ? "Final Prominence" : "Crazy Prominence"}! He`, { atkMultiplier: atkbuff, mdChance: -1, magicDamage: true, dodge: false, trueDamage: true });

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // day time buff
            myStats.atk += Math.floor(myStats.atk * 0.2);
            myStats.md += Math.floor(myStats.md * 0.2);
            myStats.def += Math.floor(myStats.def * 0.2);
            myStats.mr += Math.floor(myStats.mr * 0.2);
            myStats.heat ??= 0;
            notice.push(`\n⛅ It's Daytime!`);

            // Scorch Effect
            matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
                if (caster === eStats) {
                    ebuff.hp.push(new buffInfo("+", -Math.floor(myStats.hp * Math.min(0.075 * Math.floor(myStats.heat / 10), 0.03)), 2));
                };
            });

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                let roundTime = (matchStats.round - 1) % 6; // day: [0, 1], noon: [2], night: [3, 4, 5];
                if (roundTime == 2) { // Noon : The One
                    notice.push(`\n☀️ It's Noon!`);
                    myStats.atk += Math.floor(myStats.atk * 0.35);
                    myStats.md += Math.floor(myStats.md * 0.35);
                    myStats.def += Math.floor(myStats.def * 0.35);
                    myStats.mr += Math.floor(myStats.mr * 0.35);
                    myStats.hp -= Math.floor(myStats.maxhp * 0.04);
                    if (myStats.hp < 0) myStats.hp = 0;
                    myStats.replaceButton.def = { // Divine Attack
                        "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                            eStats.counter = eStats.counter ?? 0;
                            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🔥 **${char.name}** released his Divine Attack! He`, { atkMultiplier: 1.4, dodge: false, block: false });
                            myStats.heat += 10;

                            return AbilityResponse.SUCCESS;
                        },
                    };
                    myStats.heat += 1;
                    // Remove altered DEF next turn
                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        delete myStats.replaceButton.def;

                        return AbilityResponse.SUCCESS;
                    }, 1));
                }
                else if (roundTime < 3) { // day
                    if (roundTime == 0) notice.push(`\n⛅ It's Daytime!`);
                    myStats.atk += Math.floor(myStats.atk * 0.2);
                    myStats.md += Math.floor(myStats.md * 0.2);
                    myStats.def += Math.floor(myStats.def * 0.2);
                    myStats.mr += Math.floor(myStats.mr * 0.2);
                    myStats.hp -= Math.floor(myStats.maxhp * 0.04);
                    if (myStats.hp < 0) myStats.hp = 0;
                    myStats.heat += 1;
                } else {
                    if (roundTime == 3) notice.push(`\n🌑 It's Nighttime...`);
                    myStats.atk -= Math.floor(myStats.atk * 0.2);
                    myStats.md -= Math.floor(myStats.md * 0.2);
                    myStats.def -= Math.floor(myStats.def * 0.2);
                    myStats.mr -= Math.floor(myStats.mr * 0.2);
                    myStats.dodge += 0.2;
                    if (myStats.dodge > 1) myStats.dodge = 1;
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
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
        desc: "**Total Usage**: `1`\n**Mana**: `150`\\💧, lasts 10 rounds\n**Timeout**: `no`\n**Role**: `DPS`\n\nApollo EX brings in a dynamic and sustained damage and utility with her intricate set of abilities that empowers her over the course of a prolonged battle. Her active ability, `Domain of Ascendancy`, transforms the battlefield for **10** rounds. During this period, her stats get a substantial **20%** boost and she absorbs **33%** of the damage and stores it to release upon exiting her domain.\n\nAdditionally, she replaces her ATK, DEF and ABILITY for the duration of her Domain. Her normal attacks deal guaranteed  critical hits and true damage. Her DEF becomes impervious, absorbing **100%** of the damage on the next round, and her ABILITY applies a vulnerability debuff on enemies, increasing the damage they take by **15%** with every use (or **25%** if **Artemis EX** is owned). The enemy also suffers from bleed, losing up to **3%** of their max HP over time, or **6%** of the users HP if the enemy has more than twice the HP.\n\nApollo EX can evade a fatal attack once per battle and execute her enemies when their HP drops below **10%**. Her normal attacks deal both physical and magic damage, **60%** of each, with a **20%** chance of causing the enemy to bleed for **3** rounds. Additionally, she'll gain **25%** more XP from the dungeon.",
        shortdesc: "**Uses**: `1`\n**Cost**: `150 💧`\n**Timeout**: `No`\n**Role**: `DPS/Tank (Burst, Mitigation/Critical)`\n\n__**Passive**__\n- Evades **1** lethal hit\n- Executes enemy when their HP falls below **10%** HP\n- ATTACK is altered:\n- Deal **60%** ATK + **60%** MD\n- This has a **20%** chance to apply bleed (3% of the enemy's current HP, up to 6% of her HP) for **3** rounds\n\n__**Active**__(✨)\nActivates her domain for **10** rounds with the following effects:\n- **+20%** ATK, MD, DEF, MR, CR, CD\n- **+10%** Dodge rate\n- Mitigates **33%** of incoming damage and increases nuke's dmg scaling by **33%**\n- Apply bleed (3% of the enemy's current HP, up to 6% of her HP) for **3** rounds\n- ATTACK is altered to deal critical hits and true DMG (Bypass shields)\n- DEFEND is altered to mitigate **100%** of incoming damage and increase nuke's dmg scaling by **100%** instead of **33%** (DMG mitigation excludes DoT)\n- Using active (✨) causes the enemy to take **+15%** DMG every activation (**25%** if Artemis EX is owned)\n\nUpon exiting domain:\n- Releases a nuke (DMG-scaling depends on previous DMG mitigation%)",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Apollo EX
            const domainLast = 10, defaultReduction = 0.33, mana_cost = 150;

            // Check if enough mana
            if (mana_cost > myStats.sm) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/${mana_cost}<:mana:1047269152957661255>)`, ephemeral: true });
                this.used--;
                return AbilityResponse.FAILURE;
            };

            // Domain activation
            if (this.used > 1) {
                if (matchStats.round < this.domainLastRound) {
                    if (!eStats.vulnerability) eStats.vulnerability = 1;
                    eStats.vulnerability += this.hasArtemis ? 0.25 : 0.15;
                    notice.push(`\n✨ **${this.hasArtemis ? "Artemis" : char.name}** applied vulnerability, **${enemy.name}** will now take **${Math.round((eStats.vulnerability - 1) * 100)}%** more damage for the duration of the domain`);
                } else {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    matchStats.sendWarning({ content: "Domain of Ascendancy can only be used once", ephemeral: true });
                    this.used--;
                    return AbilityResponse.FAILURE;
                };
            };

            if (this.used === 1) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                myStats.sm -= mana_cost;

                this.domainLastRound = matchStats.round + domainLast;
                myStats.damageReduction = defaultReduction;

                // Apply Bleed until domain ends
                const bleed = Math.floor(Math.min(eStats.hp, myStats.hp * 2) * 0.03);
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
                myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    myStats.atk += Math.floor(myStats.atk * 0.2);
                    myStats.md += Math.floor(myStats.md * 0.2);
                    myStats.def += Math.floor(myStats.def * 0.2);
                    myStats.mr += Math.floor(myStats.mr * 0.2);
                    myStats.cr += 0.2;
                    if (myStats.cr > 1) myStats.cr = 1;
                    myStats.cd += 0.2;
                    myStats.dodge += 0.1;
                    if (myStats.dodge > 1) myStats.dodge = 1;

                    return AbilityResponse.SUCCESS;
                }, domainLast - 1));

                // Replace ATK
                myStats.replaceButton.atk = {
                    "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { atkMultiplier: 0.6, critChance: -1, combodmg: true, selfdmg: true, selfheal: true, ignoreShield: true });
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { atkMultiplier: 0.6, critChance: -1, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true, ignoreShield: true });

                        // Cause Bleed
                        if (0.2 > Math.random()) {
                            const bleed = Math.floor(Math.min(eStats.hp, myStats.hp * 2) * 0.03);
                            ebuff.hp.push(new buffInfo("+", -bleed, 3));
                        };

                        return AbilityResponse.SUCCESS;
                    },
                };

                // Replace DEF
                myStats.replaceButton.def = {
                    "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        this.usedDef++;
                        myStats.damageReduction = 1;
                        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                            myStats.damageReduction = defaultReduction;

                            return AbilityResponse.SUCCESS;
                        }));
                        notice.push(`\n🛡️ **${char.name}** will absorb **100%** of the next attack!`);

                        return AbilityResponse.SUCCESS;
                    },
                };

                // When Domain Ends
                myStats.delayedBuffs.push(new delayedBuffs(this.domainLastRound, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** left her Domain of Ascendancy! She`, { atkMultiplier: ((domainLast * defaultReduction) + (this.usedDef * (1 - defaultReduction))), magicDamage: true });

                    eStats.vulnerability = 1;

                    // Reset buttons
                    delete myStats.replaceButton.def;
                    myStats.replaceButton.atk = {
                        "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { atkMultiplier: 0.6, combodmg: true, selfdmg: true, selfheal: true });
                            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { atkMultiplier: 0.6, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });

                            // Cause Bleed
                            if (0.2 > Math.random()) {
                                const bleed = Math.floor(Math.min(eStats.hp, myStats.hp * 2) * 0.03);
                                ebuff.hp.push(new buffInfo("+", -bleed, 3));
                            };

                            return AbilityResponse.SUCCESS;
                        },
                    };

                    return AbilityResponse.SUCCESS;
                }));

                notice.push(`\n✨ **${char.name}** activated her Domain of Ascendancy.`);
            };

            return AbilityResponse.SUCCESS;
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            // User has Artemis?

            const stats = await getUserSchema(matchStats.interaction.user.id);

            this.hasArtemis = stats?.chars.includes(17689) ?? false;

            // Boost XP
            matchStats.xpboost += 0.25;

            // Evade a deadly attack once
            myStats.evadeDeathStrike = 1;
            myStats.evadeDeathChance = 1;

            // Execute when below 10% HP
            myStats.executeHP = Math.max(0.1, myStats.executeHP);

            // Normal attack deals both physical and magic damage (60% each)
            myStats.replaceButton.atk = {
                "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { atkMultiplier: 0.6, combodmg: true, selfdmg: true, selfheal: true });
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}**`, { atkMultiplier: 0.6, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });

                    // Cause Bleed
                    if (0.2 > Math.random()) {
                        const bleed = Math.floor(Math.min(eStats.hp, myStats.hp * 2) * 0.03);
                        ebuff.hp.push(new buffInfo("+", -bleed, 3));
                    };

                    return AbilityResponse.SUCCESS;
                },
            };

            return AbilityResponse.SUCCESS;
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
        desc: "**Total Usage**: `1`\n**Mana**: `150`\\💧, lasts 5 rounds\n**Timeout**: `no`\n**Role**: `Support`\n\nArtemis EX wields the `Domain of Sanction`, a fearsome realm where she holds dominion over the very fabric of reality. When activated, her domain lasts for **5** rounds and halts her enemy's actions, effectively stopping time. Within this domain, her opponent suffer a **20%** vulnerability debuff. Her DEF extends the duration of all debuffs on the enemy by an additional round, and her ABILITY deals **130%** damage (**145%** if **Apollo EX** is owned), and applies a bleed effect that lasts for the entire duration of the domain if **Apollo EX** is owned. Additionally she depletes the enemy's mana completely and blocks mana generation for **5** rounds upon exiting her domain.\n\nArtemis recovers **5%** of her max HP and steals **3** mana from her enemy every round. If defeated, she can revive once with **40%** of her max HP. Her normal attacks deal both physical and magic damage, **60%** of each, with a **33%** chance (**66%** if domain is active) of inflicting a debuff. The debuffs include `burn` dealing **3%** of max HP as damage (or **6%** of her own HP if enemy has twice as much HP), `impair` decreasing DEF and MR by **15%**, `poison` decreasing **ATK** and **MD** by **15%**, and `paralyse` which prevents the enemy from attacking once. Additionally, she'll gain **20%** more XP from the dungeon.",
        shortdesc: "**Uses**: `1`\n**Cost**: `150 💧`\n**Timeout**: `No`\n**Role**: `Support/Tank (Burst, Mana-reset, Freeze, Healing, Revive)`\n\n__**Passive**__\n- Every round: Restores **5%** max HP , steals **3** 💧 from enemy\n- Upon death, revives with **40%** HP\n- ATTACK is altered to deal **60%** ATK & **60%** MD, each has a **33%** chance (**66%** if domain is active) of inflicting a debuff\n> List of debuffs: `Burn` dealing **3%** of max HP as damage (Caps at **6%** of Artemis' current HP) // `Impair` (**-15%** DEF & MR) // `Poison` (**-15%** ATK & MD) // `Paralyse` (Prevents enemy from attacking that round, functions as timeout false)\n- Gains **+20%** class XP\n\n__**Active**__ (✨)\nEnters domain for **5** rounds with the following effects:\n- Enemy frozen (cannot make actions)\n- Applies **20%** vulnerability to the enemy (20% more damage)\n- Doubled chances of debuffing from passive ATTACK\n- DEFEND is altered to extend all debuffs on the enemy by **1** round\n- ACTIVE (✨) deals **130%** DMG with no cost. If Apollo EX is owned, deals **140%** DMG instead and applies bleed (**2%** of the enemy's current HP, up to **4%** of her current HP), lasting until the end of the domain\nUpon exiting domain:\n- Depletes all enemy mana\n- Blocks enemy's mana regeneration for **5** rounds",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Artemis EX
            const domainLast = 5, mana_cost = (this.used === 1) ? 150 : 0;

            // Check if enough mana
            if (mana_cost > myStats.sm) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/${mana_cost}<:mana:1047269152957661255>)`, ephemeral: true });
                this.used--;
                return AbilityResponse.FAILURE;
            };

            // Domain activation
            if (this.used > 1) {
                if (matchStats.round < this.domainLastRound) {
                    if (this.hasApollo) {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **Apollo**`, { atkMultiplier: 1.45, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                        if (ebuff.hp.findIndex((e) => e.id === this.bleedId) !== -1) ebuff.hp.splice(ebuff.hp.findIndex((e) => e.id === this.bleedId), 1);
                        const bleedBuff = new buffInfo("+", -Math.floor(Math.min(eStats.hp, myStats.hp * 2) * 0.02), (this.domainLastRound - matchStats.round));
                        this.bleedId = bleedBuff.id;
                        ebuff.hp.push(bleedBuff);
                        notice.push(`\n✨ **${this.hasApollo ? "Apollo" : char.name}** applied bleed`);
                    } else {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1.3, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                    };
                } else {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    matchStats.sendWarning({ content: "Domain of Sanction can only be used once", ephemeral: true });
                    this.used--;
                    return AbilityResponse.FAILURE;
                };
            };

            if (this.used === 1) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                myStats.sm -= mana_cost;
                this.domainLastRound = matchStats.round + domainLast;

                // Apply Vulnerability, Freeze Time
                if (eStats.vulnerability < 1.2) eStats.vulnerability = 1.2;
                eStats.timeFrozen = true;
                eStats.frozenMessage = "is frozen in time";

                // Replace ATK
                myStats.artemisDomainUsedRound = matchStats.round;

                // Replace DEF
                myStats.replaceButton.def = {
                    "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        Object.keys(ebuff).forEach((stat) =>
                            ebuff[stat as keyof Buffs].forEach((buff) => {
                                if ((buff.type === "*" && buff.val < 1) || (buff.type === "+" && buff.val < 0)) buff.last++;
                            }),
                        );
                        notice.push(`\n🛡️ **${char.name}** extended all debuffs on the enemy by 1 round!`);

                        return AbilityResponse.SUCCESS;
                    },
                };

                // When Domain Ends
                myStats.delayedBuffs.push(new delayedBuffs(this.domainLastRound, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    // Reset Vulnerability and freeze
                    eStats.vulnerability = 1;
                    eStats.timeFrozen = false;

                    // Deplete enemy mana
                    eStats.sm = 0;
                    ebuff.sm.push(new buffInfo("=", 0, 5));

                    // Reset buttons
                    delete myStats.replaceButton.def;
                    // myStats.replaceButton.atk = myStats.replaceButton.atkCopy;

                    return AbilityResponse.SUCCESS;
                }));

                notice.push(`\n✨ **${char.name}** activated her Domain of Sanction.`);
            };

            return AbilityResponse.SUCCESS;
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            eStats.vulnerability ??= 1;
            // User has Apollo?
            const stats = await getUserSchema(matchStats.interaction.user.id);

            this.hasApollo = stats?.chars.includes(17688) ?? false;

            // Boost XP
            matchStats.xpboost += 0.2;

            // Heals 5% of max HP per round
            mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.05), 9999));

            // Revives once with 40% HP
            myStats.maxRevivals = 1;
            myStats.revhp = 0.4;
            myStats.rev += 1;

            // Steals 3 mana per round
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                const stealMana = Math.min(3, eStats.sm);
                eStats.sm -= stealMana;
                myStats.sm += stealMana;
                if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;

                return AbilityResponse.SUCCESS;
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

                    return AbilityResponse.SUCCESS;
                },
            };
            // myStats.replaceButton.atkCopy = myStats.replaceButton.atk;

            return AbilityResponse.SUCCESS;
        },
    },
    "17742": {
        usage: 9999,
        used: 0,
        cost: 60,
        stacks: 1,
        pause: -5,
        desc: "**Total Usage**: `unlimited (CD: 6)`\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n**Role**: `DPS/Support`\n\nAh, so you want to know about my abilities, huh? Well, let me tell you, all those formal descriptions are just too dull, aren't they? I mean, who needs all that jargon when you can have a bit of fun, right? So, here's the deal with my kit, straight from the Yorozuya's mouth!\n\nFirst up, we've got my passive. You see, I'm not really into the whole training thing. I prefer just to match the level of the toughest guy around. Makes life easier, you know? Every attack, I get this itch to swing my sword a bit harder and aim a bit sharper. That's me increasing my attack and crit rate by **5%**, stacking up to **5** times. But when I'm really pushed to the edge, like under **30%** HP, I get a surge of \"I-don't-wanna-die\" energy, and suddenly I'm hitting (and getting hit) **20%** harder.\n\nNow, let's talk about my active! When things get too hot, I switch to Endurance mode for **6** rounds. It's like playing a game of chicken with the enemy. **33%** of the damage coming my way? I just shrug it off and store it as `Injuries`. And while I'm at it, there's a **25%** chance I'll just casually counter an attack. Cool, right? But here's the catch: when my endurance mode times out, those `Injuries` I shrugged off earlier come back to haunt me over the next **15** rounds.\n\nLastly, my party ability lets me share the endurance, but spare the pain. You see, I'm a team player when I feel like it. Every **3** rounds, I let my allies experience my Endurance mode for a turn, minus the annoying part where you pay for it later. It's my way of saying, \"Here, have some fun, but don't worry about the consequences.\"\n\nSo, that's me in a nutshell. A lazy samurai who somehow avoids hard work. Remember, it's not about how strong your abilities are, it's about how you use them... or avoid using them, in my case.",
        shortdesc: "**Uses**: `Unlimited`\n**Cooldown**: `6 rounds`\n**Cost**: `60 💧`\n**Timeout**: `yes`\n**Role**: `DPS/Tank (DMG-boost, DMG-delay, Counter)`\n\n__**Passive**__\n- Attacks increase his ATK, MD & critical rate by **5%** (Up to **25%**)\nWhen below **30%** HP:\n- Takes **+20%** DMG\n- Deals **+20%** DMG\n\n__**Active**__ (✨)\nEnters Endurance Mode for **6** rounds\n- Absorbs **33%** of DMG taken as `Injuries`\n- **+25%** counter chance\n- By the end of the domain: Reinflicts `Injuries` as DoT on Gintoki over **15** rounds\n\n__**Party**__ (👥)\nEvery **3** rounds:\n- Allies enter Endurance Mode (**33%** DMG mitigation + **25%** counter chance) with no side effects (injuries)",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Gintoki EX
            if (this.pause > matchStats.round) {
                myStats.sm += this.cost;
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: `Gintoki needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                this.used--;
                return AbilityResponse.FAILURE;
            };
            this.pause = matchStats.round + 6;

            const domainLast = 6;

            // Enter Endurance Mode
            myStats.putDamageOnHold = 0.33; // 33%
            if (Math.random() < 0.25) myStats.counter += 1;
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                // Chance to counter
                if (Math.random() < 0.25) myStats.counter += 1;

                return AbilityResponse.SUCCESS;
            }, domainLast - 1));

            // When Endurance Mode Ends
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + domainLast, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (myStats.damageOnHold) {
                    const dmg = Math.floor(myStats.damageOnHold / 15);
                    myStats.hp -= dmg;
                    if (myStats.hp < 0) myStats.hp = 0;
                    mybuff.hp.push(new buffInfo("+", -dmg, 14));
                };

                myStats.putDamageOnHold = 0;
                myStats.damageOnHold = 0;

                return AbilityResponse.SUCCESS;
            }));

            notice.push(`\n✨ **${char.name}** entered endurance mode for **${domainLast}** rounds!`);

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.gintokiStacks = 0;
            eStats.vulnerability ??= 1;
            myStats.vulnerability ??= 1;
            myStats.counter ??= 0;
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.atk += Math.floor(myStats.atk * (myStats.gintokiStacks * 0.05));
                myStats.md += Math.floor(myStats.md * (myStats.gintokiStacks * 0.05));
                myStats.cr += myStats.gintokiStacks * 0.05;
                if (myStats.cr > 1) myStats.cr = 1;
                myStats.gintokiStacks = Math.min(5, myStats.gintokiStacks + 1);

                // Enraged
                if ((myStats.hp / myStats.maxhp) < 0.3) {
                    if (myStats.vulnerability < 1.2) myStats.vulnerability = 1.2;
                    if (eStats.vulnerability < 1.2) eStats.vulnerability = 1.2;
                } else {
                    myStats.vulnerability = 1;
                    eStats.vulnerability = 1;
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round % 3 === 0) {

                    // Enter Endurance Mode
                    myStats.putDamageOnHold = 0.33; // 33%
                    if (Math.random() < 0.25) myStats.counter = 1;

                    // When Endurance Mode Ends
                    const domainLast = 1;
                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + domainLast, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        myStats.putDamageOnHold = 0;

                        return AbilityResponse.SUCCESS;
                    }));

                    notice.push(`\n✨ **${char.name}** entered endurance mode!`);
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "18011": {
        usage: 9999,
        used: 0,
        cost: 0,
        stacks: 1,
        pause: -5,
        desc: "**Total Usage**: `5`/`3`/`2`/`3`\n**Mana**: `30`\\💧/`60`\\💧/`50`\\💧/`70`\\💧\n**Timeout**: `no`/`yes`/`no`/`yes`\n**Role**: `Support/DPS/Tank/DPS`\n\nLria stands out not just for her extraordinary abilities, but for her unyielding spirit and versatile skills. She possesses a unique blend of skills that make her adaptable to various combat situations by harnessing the powers of the mystical masks she has acquired through her daring ventures.\n\n**Maskless Form**\n- This form showcases lria's exceptional agility and keen sense of anticipation. When activated, she gains **20%** dodge chance for 3 rounds. If she successfully dodges an attack during this period, she gains a temporary boost of **20%** ATK for her next attack. Additionally, she heal **5%** of her max HP after successful dodges, and has **10%** increased DEF. This is her default form, and can be selected with the command `/item equip item:remove mask`.\n\n**Phantasmal Deathmask**\n- When Lria dons the Phantasmal Deathmask, she becomes an avatar of Morithia, the Underworld Sovereign. Her pact cloaks her in an ethereal aura, bolstering her MR by **25%** and causing her strikes to inherently deal magic damage. Her normal attacks carry a **30%** chance to afflict the enemy with `Haunt`, a dread curse dealing an additional **5%** magic damage for **4** rounds. Using her active, she lashes out at enemies, dealing **120%** magic damage and invoking `Soul Drain`, which siphons **5%** the equivalent of **5%** of her max HP from the enemy for 2 rounds, converting it into **5** mana for Lria. In a party, she increases the party's MD by **20%** for **4** rounds. If Artemis EX is present, this buff is increased to **25%** and lasts 5 rounds. Additionally, she heals allies for **10%** of the damage they deal. This mask can be equipped using the command `/item equip item:phantasmal mask`.\n\n**Verdant Guardian Mask**\n- When Lria adorns the Verdant Guardian Mask, she invokes the power of Sylvaria, Goddess of the Forest. She is granted a **20%** increase in DEF and MR, and a **10%** increase in block rate. After using her active, she absorbs **30%** of incoming damage and recovers **5%** of her max HP for 3 rounds. In a party, Lria grants her team a **20%** increase in DEF and MR for **4** rounds and regenerating **3%** of their max HP every round. If Apollo EX is in her party, she increases MD by **10%** and her healing buff is increased to **5%**. This mask can be equipped using the command `/item equip item:verdant mask`.\n\n**Valkyrie's Battle Mask**\n- Wearing the Valkyrie's Battle Mask, Lria's ATK is increased by **20%**. When her health falls below **10%** of max HP, she triggers `Final Gambit`, a devastating counterattack that Lria can unleash once per battle, delivering a powerful strike with of **200%** damage. When using her active, she unleashes **3-6** attacks that deal **30%** physical damage each. Each strike has a **25%** chance to inflict `Warrior's Bleed` on the enemy, causing an additional **5%** of Lria's ATK as damage for **3** rounds. In a party, Lria boosts her team's offensive capabilities, granting a **25%** increase in **ATK** and a **15%** in CD.  In the absence of Apollo EX and Artemis EX, Lria's combat spirit intensifies, unlocking `Lone Valkyrie's Might`. This further enhances the team's offensive prowess, adding an extra **10%** to her CD buff. This mask can be equipped using the command `/item equip item:valkyrie mask`.",
        shortdesc: "**Role**: `DPS (Versatile)`\nLria is split into **4** modes which you may select.\n\n__**Maskless**__:\nPassive:\n- Restores **5%** max HP after dodging\n- **+10%** DEF\n\nActive (✨):\n**Uses**: `5`\n**Cost**: `30 💧`\n**Timeout**: `No`\n- **+20%** Dodge rate for **3** rounds\n- During this period, dodging grants **+20%** ATK\n\n__**Phantasmal mask**__:\nPassive:\n- ATTACK has a **30%** chance to deal additional **5%** MD for **4** rounds\n- **+25%** MR\n\nActive (✨):\n**Uses**: `3`\n**Cost**: `60 💧`\n**Timeout**: `Yes`\n- Deal **120%** MD\n- For **2** rounds: Drains **5%** max HP + Gains additional **5** 💧\n\nParty (👥)\n- **+20%** MD for the first **4** rounds\nIf Artemis EX in party:\n- **+25%** MD (instead of 20%) for **5** rounds\n- **+10%** lifesteal\n\n__**Verdant mask**__:\nPassive:\n- **+20%** DEF & MR\n- **+10%** Block rate\n\nActive (✨):\n**Uses**: `2`\n**Cost**: `50 💧`\n**Timeout**: `No`\n- For **3** rounds: Mitigates **30%** DMG taken + Recovers **5%** max HP\n\nParty (👥)\n- **+20%** DEF & MR for the first **4** rounds\n- Restores **3%** max HP every round\nIf Apollo EX in party:\n- **+10%** MD\n- Recovers **5%** max HP (instead of 3%) every round\n\n__**Valkyrie mask**__:\nPassive:\n- **+20%** ATK\n- Deals **200%** DMG upon falling below **10%** HP\n\nActive (✨):\n**Uses**: `3`\n**Cost**: `70 💧`\n**Timeout**: `Yes`\n- Deals **30%** physical DMG **3-6** times\n- Each hit has a **25%** chance to deal additional **5%** ATK for **3** rounds\n\nParty (👥)\n- **+25%** ATK\n- **+15%** critical DMG\nIf Artemis EX & Apollo EX are not in party:\n- **+25%** critical DMG (instead of 15%)\n\nTo swap forms, do` /item equip item:mask_name`. If you wish to remove the mask (maskless), do `/item equip item:remove mask`",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Lria EX
            let mask = myStats.maskinfo;

            if (mask === undefined) { // Maskless
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                if (this.used > 5) {
                    matchStats.sendWarning({ content: `You can use **${char.name}**'s ability only **5** times per fight.`, ephemeral: true });
                    this.used--;
                    return AbilityResponse.FAILURE;
                };

                let activeCost = 30;
                if (myStats.sm < activeCost) {
                    matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/${activeCost}\\💧)`, ephemeral: true });
                    this.used--;
                    return AbilityResponse.FAILURE;
                };
                myStats.sm -= activeCost;

                myStats.dodge += 0.2;
                if (myStats.dodge > 1) myStats.dodge = 1;
                mybuff.dodge.push(new buffInfo("+", 0.2, 2));

                // Dodge Buff Last
                matchStats.dodgebuffLast = 1;
                matchStats.dodgebuff = 0.2;
                myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 3 /* 3 rounds */, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    delete matchStats.dodgebuffLast;
                    delete matchStats.dodgebuff;

                    return AbilityResponse.SUCCESS;
                }));

                notice.push(`\n✨ **${char.name}** increased dodge by **20%** for the next 2 rounds!`);
            } else if (mask === "phantasmal") { // Phantasmal Deathmask
                if (this.used > 3) {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    matchStats.sendWarning({ content: `You can use **${char.name}**'s ability only **3** times per fight.`, ephemeral: true });
                    this.used--;
                    return AbilityResponse.FAILURE;
                };

                let activeCost = 60;
                if (myStats.sm < activeCost) {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/${activeCost}\\💧)`, ephemeral: true });
                    this.used--;
                    return AbilityResponse.FAILURE;
                };
                myStats.sm -= activeCost;

                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1.2, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });

                ebuff.hp.push(new buffInfo("+", -Math.floor(myStats.maxhp * 0.05), 2));
                mybuff.sm.push(new buffInfo("+", 5, 2));
            } else if (mask === "verdant") { // Verdant Guardian Mask
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                if (this.used > 2) {
                    matchStats.sendWarning({ content: `You can use **${char.name}**'s ability only **2** times per fight.`, ephemeral: true });
                    this.used--;
                    return AbilityResponse.FAILURE;
                };

                let activeCost = 50;
                if (myStats.sm < activeCost) {
                    matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/${activeCost}\\💧)`, ephemeral: true });
                    this.used--;
                    return AbilityResponse.FAILURE;
                };
                myStats.sm -= activeCost;

                let prevReduction = myStats.damageReduction;
                myStats.damageReduction = 0.3;

                mybuff.hp.push(new buffInfo("+", Math.floor(myStats.maxhp * 0.05), 3));

                myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 3 /* 3 rounds */, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    myStats.damageReduction = prevReduction;

                    return AbilityResponse.SUCCESS;
                }));

                notice.push(`\n✨ **${char.name}** will take **30%** less damage and heal **5%** of her max HP for the next 3 rounds!`);
            } else if (mask === "valkyrie") { // Valkyrie's Battle Mask
                if (this.used > 3) {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    matchStats.sendWarning({ content: `You can use **${char.name}**'s ability only **3** times per fight.`, ephemeral: true });
                    this.used--;
                    return AbilityResponse.FAILURE;
                };

                let activeCost = 70;
                if (myStats.sm < activeCost) {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/${activeCost}\\💧)`, ephemeral: true });
                    this.used--;
                    return AbilityResponse.FAILURE;
                };
                myStats.sm -= activeCost;

                let attacksTotal = 3 + Math.floor(Math.random() * 4); // 3-6 attacks
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** attacked **${attacksTotal}** times! She`, { atkMultiplier: 0.3 * attacksTotal, magicDamage: false, combodmg: true, selfdmg: true, selfheal: true });
                for (let i = 0; i < attacksTotal; i++) {
                    if (Math.random() < 0.25) ebuff.hp.push(new buffInfo("+", -Math.floor(myStats.atk * 0.05), 3));
                };
            };

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
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

                        return AbilityResponse.SUCCESS;
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
                myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                    if ((myStats.hp / myStats.maxhp) < 0.1 && myStats.hp > 0) {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Final Gambit! She`, { atkMultiplier: 2, combodmg: true, selfdmg: true, selfheal: true });
                        //@ts-ignore
                        this._used++;
                    };

                    return AbilityResponse.SUCCESS;
                }, 9999, 1));
            };

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            let mask = pStats.maskinfo;// matchStats.partyStats.find((e) => e.name === "Lria EX")?.maskinfo;

            if (mask === undefined) { // Maskless
                //
            } else if (mask === "phantasmal") { // Phantasmal Deathmask
                const names = matchStats.partyChars.map((e: IcharInfo) => e.name);
                if (names.includes("Artemis EX")) {
                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.25), 4));
                    myStats.md += Math.floor(myStats.md * 0.25);
                } else {
                    mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.2), 3));
                    myStats.md += Math.floor(myStats.md * 0.2);
                };

                myStats.selfhealChance.push(1);
                myStats.selfheal.push(0.1);
                notice.push(`\n✨ Equipped buffs from __Phantasmal Mask__.` + names.includes("Artemis EX") ? ` Additional effects from Artemis EX applied` : ``);
            } else if (mask === "verdant") { // Verdant Guardian Mask
                const names = matchStats.partyChars.map((e: IcharInfo) => e.name);
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
                notice.push(`\n✨ Equipped buffs from __Verdant Mask__.` + names.includes("Apollo EX") ? ` Additional effects from Apollo EX applied` : ``);
            } else if (mask === "valkyrie") { // Valkyrie's Battle Mask
                const names = matchStats.partyChars.map((e: IcharInfo) => e.name);
                if (!names.includes("Apollo EX") && !names.includes("Artemis EX")) {
                    mybuff.cd.push(new buffInfo("+", 0.25, 9999));
                    myStats.cd += 0.25;
                } else {
                    mybuff.cd.push(new buffInfo("+", 0.15, 9999));
                    myStats.cd += 0.15;
                };

                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.25), 9999));
                myStats.atk += Math.floor(myStats.atk * 0.25);
                notice.push(`\n✨ Equipped buffs from __Valkyrie Mask__.` + (!names.includes("Apollo EX") && !names.includes("Artemis EX")) ? ` Additional effects from the absence of Apollo EX & Artemis EX applied` : ``);
            };

            return AbilityResponse.SUCCESS;
        },
    },
    "19048": {
        usage: 1,
        used: 0,
        cost: 0,
        desc: "**Total Usage**: `1`\n**Mana**: `0`\\💧\n**Timeout**: `yes`\n**Role**: `DPS/Tank`\n\nSatoru Gojou, being the first person in 400 years to inherit both the Limitless and the Six Eyes, is widely recognized as the strongest sorcerer.\n\nThanks to Limitless, Gojou's mana cap is increased by **+100** and he rejuvenates **+10** more mana per turn than normal, however his mana gain __cannot__ be further affected by any other abilities. And on top of this, using his reversed cursed technique, Gojou will heal **4%** of his max HP every round as long as he has more than **15** mana.\n\nGojou's class active is replaced with his own techniques which will rotate after every use:\n- __Cursed Technique Reversal ・ Aka__: Gojou creates a strong electromagnetic force of repulsion dealing **110%** magic damage by consuming **40** \\💧. This causes bleeding of **3%** of enemy HP for 3 rounds (**6%** of own HP if enemy HP is more than twice as much).\n- __Cursed Technique Lapse ・ Ao__: After using `Aka`, his skill swaps to `Ao`. He creates a strong electromagnetic field of absorption, obliterating anything that gets pulled close enough, dealing **130%** magic damage and permanently reducing enemy DEF and MR by **20%** (on first usage only) by consuming **50** \\💧.\n- __Hollow Technique ・ Murasaki__: After using `Aka` and `Ao`, his skill swaps to `Murasaki`. Gojou combines the cores of `Aka` and `Ao` to create an imaginary force of seemingly infinite mass which deals **160%** magic and **50%** physical damage by consuming **80** \\💧.  After the usage of `Murasaki`, his skill will rotate back to `Aka`.\n\nSimilarly, Gojou's defense button is replaced with `Mugen`, a thin line of infinite space, the neutral form of Limitless. When activated, expends **20** mana initially to reduce any damage received by **33%** for as long as it's active, consuming **10** mana per turn.\n\nHowever, Gojou Satoru's ultimate trump card is his Domain Expansion: `Infinite Void`. He creates a domain where his enemy enters a state of stasis for **4** rounds, in which they are incapable of making any movements, dodging included. While inside his domain, the enemy takes **25%** magic damage every round. Additionally, using `Infinite Void` will increase Gojou's ATK and MD by **20%** for the rest of battle. `Infinite Void` can only be used once Gojou's HP falls below **30%** of his max HP.\n\nIn a party, Gojou has a **25%** chance of dealing **50%** damage to his own allies due to his enormously destructive abilities.",
        shortdesc: "**Uses**: `1`\n**Cost**: `0 💧`\n**Timeout**: `Yes`\n**Role**: `DPS/Tank (Mitigation)`\n\n__**Passive**__\n- **+100** mana pool (capacity)\n- **+10** mana regeneration\n- Restores **4%** max HP every round when he has **15** 💧 or more\n- DEFEND is altered to consume **20** 💧 before mitigating DMG taken by **33%**. This also consumes **10** 💧 every round\n\nClass ability (⚜) is altered to the following moves on a set rotation (Ako -> Aka -> Murasaki):\n- Ako: Consumes **40** 💧 to deal **110%** MD + Apply Bleed (**3%** of the enemy’s current HP, up to **6%** of his current HP)\n- Aka: Consumes **50** 💧 to deal **130%** MD + **-20%** enemy’s DEF/MR (once)\n- Murasaki: Consumes **80** 💧 to deal **160%** MD + **50%** ATK\n\n__**Active**__ (✨)\nCan only be used when he’s below **30%** HP:\n- **+20%** ATK & MD\n\nEnters Domain for **4** rounds with the following effects on the enemy:\n- Cannot make a make an action (including dodge/block)\n- Takes **25%** MD every round\n\n__**Party**__ (👥)\n- Has a **25%** chance to take **50%** DMG every round",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Gojo EX

            let maxHealth = Math.ceil(0.3 * myStats.maxhp);
            if (myStats.hp >= maxHealth) {
                this.used--;
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: `You need to have less than **${maxHealth}** HP to use Infinite Void.`, ephemeral: true });
                return AbilityResponse.FAILURE;
            };

            const domainLast = 4;
            eStats.timeFrozen = true;
            eStats.frozenMessage = "is incapable of moving";

            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.2), 9999));
            myStats.atk += Math.floor(myStats.atk * 0.2);
            myStats.md += Math.floor(myStats.md * 0.2);

            eStats.dodge = 0;
            eStats.br = 0;

            // During Domain
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.25, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });

                eStats.dodge = 0;
                eStats.br = 0;

                return AbilityResponse.SUCCESS;
            }, domainLast - 1));

            // When Domain Ends
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + domainLast, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                eStats.timeFrozen = false;
                // myStats.sm = 0;

                // mybuff.def.push(new buffInfo("+", -Math.floor(myStats.def * 0.5), 3));
                // mybuff.mr.push(new buffInfo("+", -Math.floor(myStats.mr * 0.5), 3));
                // myStats.def += -Math.floor(myStats.def * 0.5);
                // myStats.mr += -Math.floor(myStats.mr * 0.5);

                return AbilityResponse.SUCCESS;
            }));

            notice.push(`\n✨ **${char.name}** used his Domain Expansion: Infinite Void`);

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.mana += 100;
            myStats.mg = 25;
            mybuff.mg.push(new buffInfo("=", 25, 9999));

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (myStats.sm > 15) {
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(0.04 * myStats.maxhp), {});
                    if (myStats.hp > myStats.maxhp) myStats.hp = myStats.maxhp;
                };

                // Mugen
                if (myStats.gojoMugenIsActive) {
                    if (myStats.sm >= 10) {
                        myStats.sm -= 10;
                    } else {
                        myStats.gojoMugenIsActive = false;
                        myStats.putDamageOnHold = 0;
                        // myStats.mg = 25;
                        notice.push(`\n🛡️ **${char.name}** deactivated Mugen`);
                    };
                };
                myStats.mg = 25;

                return AbilityResponse.SUCCESS;
            }, 9999));

            myStats.replaceButton.def = {
                // "emoji": "<:deepsea_guardian_helmet:1081561801042444328>",
                "used": 0,
                "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

                    if (myStats.gojoMugenIsActive) {
                        myStats.gojoMugenIsActive = false;
                        matchStats.turn = matchStats.turnSkill ? 0 : 1;
                        notice.push(`\n🛡️ **${char.name}** Mugen was deactivated!`);
                        return AbilityResponse.FAILURE;
                    };

                    let activeCost = 20;
                    if (myStats.sm < activeCost) {
                        matchStats.turn = matchStats.turnSkill ? 0 : 1;
                        matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/${activeCost}\\💧)`, ephemeral: true });
                        return AbilityResponse.FAILURE;
                    };
                    myStats.sm -= activeCost;

                    myStats.gojoMugenIsActive = true;
                    myStats.putDamageOnHold = 0.33;

                    notice.push(`\n🛡️ **${char.name}** activated Mugen!`);

                    return AbilityResponse.SUCCESS;
                },
            };

            myStats.replaceButton.cskill = {
                "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    myStats.gojoClassUsed ||= 0;

                    let activeCost = (myStats.gojoClassUsed % 3) === 0 ? 40 : ((myStats.gojoClassUsed % 3) === 1 ? 50 : 80);
                    if (myStats.sm < activeCost) {
                        matchStats.turn = matchStats.turnSkill ? 0 : 1;
                        matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/${activeCost}\\💧)`, ephemeral: true });
                        return AbilityResponse.FAILURE;
                    };
                    myStats.sm -= activeCost;

                    if ((myStats.gojoClassUsed % 3) === 0) {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}** used Aka! He`, { atkMultiplier: 1.1, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });
                        if (Math.random() < 1) { // 100% chance
                            const bleed = eStats.hp > 2 * myStats.hp ? myStats.hp * 0.06 : eStats.hp * 0.03;
                            ebuff.hp.push(new buffInfo("+", -bleed, 3));
                        };
                    } else if ((myStats.gojoClassUsed % 3) === 1) {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}** used Ao! He`, { atkMultiplier: 1.3, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });
                        if (myStats.gojoClassUsed === 1) {
                            ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * 0.2), 9999));
                            ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.2), 9999));
                            eStats.def -= Math.floor(eStats.def * 0.2);
                            eStats.mr -= Math.floor(eStats.mr * 0.2);
                        };
                    } else {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}** used Murasaki! He`, { atkMultiplier: 1.6, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true });
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚜️ **${char.name}** used Murasaki! He`, { atkMultiplier: 0.5, combodmg: true, selfdmg: true, selfheal: true });
                    };

                    myStats.gojoClassUsed++;

                    return AbilityResponse.SUCCESS;
                },
            };

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            if (Math.random() < 0.25) {
                dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.5, ignoreShield: true, magicDamage: true });
            };
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (Math.random() < 0.25) {
                    dealDamage(myStats, eStats, mybuff, ebuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.5, ignoreShield: true, magicDamage: true });
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "19050": {
        usage: 2,
        used: 0,
        cost: 60,
        weaponType: "none",
        activatedRound: -1,
        desc: "**Total Usage**: `2`\n**Mana**: `60`\\💧 Ei, `100`\\💧 Puppet Shogun\n**Timeout**: `no`\n**Role**: `DPS`\n\nThe Raiden Shogun is comprised of two beings in one body: Ei, the Electro Archon; and the Shogun, the puppet created by Ei. When she is equipped a __sword__, Ei will take over, otherwise the Shogun has control.\n\nWhen Ei is on the field, her normal attacks deal **18%** more damage, but she loses **3%** of her current HP per round. Once her HP falls below **50%** however, she no longer loses those **3%** current HP per round, and makes an attack dealing **180%** true damage. Instead, for the next 4 rounds, she will heal **10%** of missing HP and regenerate **+5** mana.\nUsing her active, Ei will use Musou no Hitotachi to deal **120%** true damage and decrease enemy DEF and MR by **12%** for the rest of battle (on first usage only).\n\nWhen the puppet Shogun is on stage, she gains **16%** ATK, MD, CR, CD and dodge chance for the rest of battle, and is immune to HP debuffs.\nUsing her active, the Shogun enters the domain of Baleful Shadowlord for the rest of the fight. While in this domain, she has **15%** increased DEF and **+5%** ATK and MD every round (up to a **30%** increase). Additionally, lowers enemy DEF and MR by **2%** every round (up to a **10%** reduction). If her HP drops below **25%** of max, she can recover **30%** of missing HP for **90**\\💧 once.\n\nIn a party, Ei will deal **14%** true damage to the enemy and recover **+3** mana for her allies every round.",
        shortdesc: "**Role**: `DPS (Versatile)`\nRaiden Shogun EX is split into **2** modes which you may use.\n\n# Ei\n-# (Equip a SWORD to use)\n**Uses**: `2`\n**Cost**: `60 💧`\n**Timeout**: `No`\n**Role**: `DPS (Anti-shield, True DMG)`\n\n__**Passive**__\n- ATTACK is altered to deal **118%** true DMG\n- Loses **3%** current HP every round\nOnce her HP falls below **50%** HP:\n- No longer loses **3%** current HP every round\n- Immediately deals **180%** true DMG\n- Restores **10%** missing HP + regenerate **+5** 💧 for **4** rounds\n\n__**Active**__ (✨)\n- Deals **120%** true DMG\n- **-12%** enemy’s DEF & MR (once)\n\n__**Party**__ (👥)\n- Deals **14%** true DMG every round\n- Regenerates **+3** 💧 every round\n\n# Puppet\n-# (Don’t equip a SWORD to use)\n**Uses**: `2`\n**Cost**: `100, then 90 💧`\n**Timeout**: `No`\n**Role**: `DPS/Tank (Anti-shield, True DMG)`\n\n__**Passive**__\n- **+16%** ATK, MD, CR, CD, and Dodge rate\n- Immune to HP-debuffs\n\n__**Active**__ (✨)\n- **+15%** DEF & MR\n- **+5%** ATK & MD every round (Up to 30%)\n- **-2%** enemy’s DEF/MR every round (Up to -10%)\n- When below **25%** HP: May use active (✨) again to restore **30%** missing HP",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
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
                    if (myStats.sm < 100) {
                        this.used--;
                        matchStats.turn = matchStats.turnSkill ? 0 : 1;
                        matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/${100}\\💧)`, ephemeral: true });
                        myStats.sm += 60;
                        return AbilityResponse.FAILURE;
                    };
                    myStats.sm -= 40;

                    this.activatedRound = matchStats.round;

                    ebuff.def.push(new buffInfo("+", Math.floor(eStats.def * 0.15), 9999));
                    eStats.def += Math.floor(eStats.def * 0.15);

                    myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        myStats.atk += Math.floor(myStats.atk * Math.min(0.3, 0.05 * (matchStats.round - this.activatedRound)));

                        eStats.def -= Math.floor(eStats.def * Math.min(0.1, 0.02 * (matchStats.round - this.activatedRound)));
                        eStats.mr -= Math.floor(eStats.mr * Math.min(0.1, 0.02 * (matchStats.round - this.activatedRound)));

                        return AbilityResponse.SUCCESS;
                    }, 9999));

                    notice.push(`\n✨ **${char.name}** has entered the domain of Baleful Shadowlord!`);
                } else {
                    let maxHealth = Math.ceil(0.25 * myStats.maxhp);
                    if (myStats.hp >= maxHealth) {
                        this.used--;
                        myStats.sm += 60;
                        matchStats.turn = matchStats.turnSkill ? 0 : 1;
                        matchStats.sendWarning({ content: `You need to have less than **${maxHealth}** HP.`, ephemeral: true });
                        return AbilityResponse.FAILURE;
                    };

                    if (myStats.sm < 90) {
                        this.used--;
                        matchStats.turn = matchStats.turnSkill ? 0 : 1;
                        matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/${90}\\💧)`, ephemeral: true });
                        myStats.sm += 60;
                        return AbilityResponse.FAILURE;
                    };
                    myStats.sm -= 30;

                    const heal = Math.floor((myStats.maxhp - myStats.hp) * 0.3);
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, heal, {});

                    notice.push(`\n✨ **${char.name}** healed **${heal}** HP!`);
                };
            };

            return AbilityResponse.SUCCESS;
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if (myStats.weapon !== -1) this.weaponType = items[myStats.weapon].type; // sword | lance

            if (this.weaponType === "sword") {
                // Ei
                myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    if (myStats.hp / myStats.maxhp > 0.5) {
                        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -Math.floor(0.03 * myStats.hp), {});
                    } else {
                        if (!myStats.raidenHpDownRound) {
                            dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** fell below 50% HP! She`, { atkMultiplier: 1.8, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, ignoreShield: true });
                            myStats.raidenHpDownRound = matchStats.round;
                            mybuff.mg.push(new buffInfo("+", 5, 4));
                        };
                    };

                    if (matchStats.round < myStats.raidenHpDownRound + 4) {
                        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.1), {});
                    };

                    return AbilityResponse.SUCCESS;
                }, 9999));

                // Replace ATK
                myStats.replaceButton.atk = {
                    "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1.18, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, ignoreShield: true });
                        // dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.6, magicDamage: true, mdChance: -1, combodmg: true, selfdmg: true, selfheal: true, ignoreShield: true });

                        return AbilityResponse.SUCCESS;
                    },
                };
            } else {
                // Puppet
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.16), 9999));
                mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.16), 9999));
                myStats.atk += Math.floor(myStats.atk * 0.16);
                myStats.md += Math.floor(myStats.md * 0.16);
                mybuff.cr.push(new buffInfo("+", 0.16, 9999));
                mybuff.cd.push(new buffInfo("+", 0.16, 9999));
                myStats.cr += 0.16;
                myStats.cd += 0.16;
                mybuff.dodge.push(new buffInfo("+", 0.16, 9999));
                myStats.dodge += 0.16;
                if (myStats.dodge > 1) myStats.dodge = 1;

                // Remove HP debuffs on self
                myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    mybuff.hp = mybuff.hp.filter((buff) => (buff.type === "*" && buff.val > 1) || (buff.type === "+" && buff.val > 0));

                    return AbilityResponse.SUCCESS;
                }, 9999));
            };

            return AbilityResponse.SUCCESS;
        },
        party: async function (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if (pStats.weapon !== -1 && items[pStats.weapon].type === "sword") {
                const name = pStats.name;
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.14, ignoreShield: true, magicDamage: true });
                myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}**`, { atkMultiplier: 0.14, ignoreShield: true, magicDamage: true });

                    return AbilityResponse.SUCCESS;
                }, 9999));

                myStats.mg += 3;
                mybuff.mg.push(new buffInfo("+", 3, 9999));
            };

            return AbilityResponse.SUCCESS;
        },
    },
    "19102": {
        usage: 9999,
        used: 0,
        buffID: 0,
        cost: 65,
        desc: "**Total Usage**: `unlimited`\n**Cost**: `65`\\💧\n**Timeout**: `no`\n**Role**: `Support`\n\nGuinaifen, an outworlder who ended up residing on the Xianzhou by accident, is a passionate and vivacious street performer of many Xianzhou acrobatics. \n\nEach successful attack applies a stack of `Firekiss` on her foes (up to **5** stacks at once), dealing **6%** damage for **3** rounds, showcasing her ability to sustain pressure on her adversaries. Moreover, while her enemy has any HP debuffs on them, Guinaifen will gain a **10%** increase in ATK and MD.\n\nWhen Guinaifen uses her ability, she unleashes a fiery assault that inflicts **70%** damage and adds two more stacks of `Firekiss` to her target.\n\nIn a party, Guinaifen applies a stack of `Firekiss` on the enemy with each successful attack of her team member, but the flames burn brighter and faster, lasting only **2** rounds (up to **3** stacks at once).",
        shortdesc: "**Uses**: `Unlimited`\n**Cost**: `65 💧`\n**Timeout**: `No`\n**Role**: `DPS (DoT - Firekiss)`\n\n__**Passive**__\n- ATTACK is altered to deal **100%** DMG and apply **1x** `Firekiss` for **3** rounds\n`Firekiss` : Deals **6%** DMG every round (Up to **5** stacks)\n\nWhen enemy is under HP-debuff:\n- **+10%** ATK & MD\n\n__**Active**__ (✨)\n- Deals **70%** DMG\n- Applies **2x** `Firekiss` for **3** rounds\n\n__**Party**__ (👥)\n- Successful ATTACK apply **1x** `Firekiss` for **2** rounds (Up to **3** stacks)",
        ability: async (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Guinaifen
            matchStats.turn = matchStats.turnSkill ? 0 : 1;

            const dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.7, magicDamage: true });

            if (dmg) {
                if (myStats.guinaifenStackRounds.filter((e: number) => e >= (matchStats.round - myStats.guinaifenStackLast)).length < myStats.guinaifenStackMax) {
                    ebuff.hp.push(new buffInfo("+", -Math.floor(0.06 * dmg), myStats.guinaifenStackLast));
                    myStats.guinaifenStackRounds.push(matchStats.round);
                };
            };

            embed.setThumbnail("https://i.ibb.co/VWKDvfw/tenor.gif");

            return AbilityResponse.SUCCESS;
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            myStats.guinaifenStackRounds = [];
            myStats.guinaifenStackLast = 3;
            myStats.guinaifenStackMax = 5;

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                // If enemy has HP debuffs
                if (ebuff.hp.some((buff) => ((buff.type === "*" && buff.val < 1) || (buff.type === "+" && buff.val < 0)))) {
                    myStats.atk += Math.floor(0.1 * myStats.atk);
                    myStats.md += Math.floor(0.1 * myStats.md);
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.guinaifenStackRounds = [];
            myStats.guinaifenStackLast = 2;
            myStats.guinaifenStackMax = 3;

            return AbilityResponse.SUCCESS;
        },
    },
    "19277": {
        usage: 1,
        used: 0,
        buffID: 0,
        cost: 120,
        desc: "**Total Usage**: `1`\n**Cost**: `120`\\💧\n**Timeout**: `no`\n**Role**: `DPS`\n\nSung Jin-Woo, the Shadow Monarch, brings his unique arsenal of skills to the battlefield. His abilities, deeply intertwined with the creatures he has vanquished and the artifacts he has acquired, reflect his journey and strength.\n\nSung Jin-Woo's prowess grows with the treasures he has collected from his conquests:\n- __King's Crown__: Each set of **10** increases his ATK by **1%**, up to a maximum of **30%**.\n- __Monster Egg__: Each set of **10** increases his MR by **0.75%**, up to a maximum of **22.5%**.\n- __Dragon Scales__: Each set of **10** increases his DEF by **0.75%**, up to a maximum of **22.5%**.\n- __Pendant of Silence__: Each set of **10** increases his crit rate by **0.5%**, up to a maximum of **15%**.\n- __Devil Claws__: Each set of **10** increases his crit damage by **1%**, up to a maximum of **30%**.\n- __Odious Brain__: Each set of **10** increases his dodge by **0.5%**, up to a maximum of **10%**.\n\nAfter using his active, Sung Jin-Woo summons his shadow army who will aid him for the rest of the battle, each member contributing uniquely:\n- **Beru**: Each successfully attack causes **6%** damage for **2** rounds.\n- **Igris**: Every critical hit drains **3.5%** of the enemy's max HP (or **7%** of own max HP if the enemy has more than twice of yours).\n- **Tusk**: Successfully dodging an attack steals **12%** of the enemy's current mana.\n-# Note that you don't need to own the member in your inventory to utilize this active\n\nAs a solo hunter, Sung Jin-Woo cannot be part of a party with more than one ability character. However, when he is the sole ability character in a party, his ATK, DEF, MR, MD and max HP are increased by **50%**.",
        shortdesc: "**Uses**: `1`\n**Cost**: `120 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Mana-losing, Followup Attack, Nuke)`\n\n__**Passive**__\nEvery 10 sets owned of the following materials grant stat buffs:\n- `King's Crown` =✧= ATK **+1%** (Up to 30%)\n- `Monster Egg` =✧= MR **+0.75%** (Up to 22.5%)\n- `Dragon Scales` =✧= DEF **+0.75%** (Up to 22.5%)\n- `Pendant of Silence` =✧= Crit Rate **+0.5%** (Up to 15%)\n- `Devil Claws` =✧= Crit DMG **+1%** (Up to 30%)\n- `Odious Brain`: =✧= Dodge **+0.5%** (Up to 10%)\nNote:\n> 10 sets owned means owning 10 of that material type. E.g. you need 300 King's Crown in your inventory for the max 30% ATK buff. \n\n__**Active**__ (✨)\nBuffs himself permanently:\n- Successful attacks each deal additional **6%** damage for **2** rounds.\n- Critical hits drain **3.5%** of the enemy's max HP (or **7%** of own max HP if the enemy has more than twice of yours).\n- Dodging an attack steals **12%** of the enemy's current mana.\n\n__**Party**__ (👥)\n- He refuses to fight (Dies) when in a party with ability characters\n- When in a party where he is the sole ability, he has **+50%** max HP, ATK & MD, DEF & MR",
        ability: async (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) => {
            // Sung Jin Woo EX | SJW EX
            matchStats.turn = matchStats.turnSkill ? 0 : 1;

            // Shadow Soldiers: Beru & Igris
            matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
                if (caster === myStats) {
                    if (options.damage) targetBuff.hp.push(new buffInfo("+", Math.floor(options.damage * 0.07), 2)); // Beru
                    if (options.isCrit) { // Igris
                        const drain = Math.floor((target.maxhp > (2 * myStats.maxhp)) ? myStats.maxhp * 0.07 : target.maxhp * 0.035);
                        target.hp -= drain;
                        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, drain, {});
                    };
                };
            });

            // Shadow Soldier: Tusk
            matchStats.on("dodge", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
                if (target === myStats) {
                    const drain = Math.floor(eStats.sm * 0.12);
                    eStats.sm -= drain;
                    myStats.sm += drain;
                };
            });

            notice.push(`\n✨ **${char.name}** summoned his shadow army. Arise!`);

            return AbilityResponse.SUCCESS;
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            if (["stampede", "raid"].includes(matchStats.interaction.commandName)) {
                const partyHasAbilityCharacters = matchStats.partyChars.some((e: IcharInfo) => e.id in abilities);
                if (partyHasAbilityCharacters) {
                    myStats.hp = 0;
                    myStats.rev = 0;
                    notice.push(`\n✨ **${char.name}** refuses to fight in a party`);
                    return AbilityResponse.FAILURE;
                };

                mybuff.atk.push(new buffInfo("*", 1.5, 9999));
                mybuff.md.push(new buffInfo("*", 1.5, 9999));
                myStats.atk *= 1.5;
                myStats.md *= 1.5;
                mybuff.def.push(new buffInfo("*", 1.5, 9999));
                mybuff.mr.push(new buffInfo("*", 1.5, 9999));
                myStats.def *= 1.5;
                myStats.mr *= 1.5;

                const increaseHp = Math.floor(myStatsFixed.maxhp * 0.5);
                myStatsFixed.maxhp += increaseHp;
                myStatsFixed.hp += increaseHp;
                myStats.maxhp += increaseHp;
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, increaseHp, {});
            };

            const stats = await getUserSchema(matchStats.interaction.user.id);
            const items = stats?.items ?? {};

            const atkBuff = Math.floor(myStats.atk * Math.min(0.3, (items[663] ?? 0) * 0.001));
            mybuff.atk.push(new buffInfo("+", atkBuff, 9999));
            myStats.atk += atkBuff;

            const mrBuff = Math.floor(myStats.mr * Math.min(0.225, (items[47] ?? 0) * 0.00075));
            mybuff.mr.push(new buffInfo("+", mrBuff, 9999));
            myStats.mr += mrBuff;

            const defBuff = Math.floor(myStats.def * Math.min(0.225, (items[667] ?? 0) * 0.00075));
            mybuff.def.push(new buffInfo("+", defBuff, 9999));
            myStats.def += defBuff;

            const crBuff = Math.min(0.15, (items[672] ?? 0) * 0.0005);
            mybuff.cr.push(new buffInfo("+", crBuff, 9999));
            myStats.cr += crBuff;

            const cdBuff = Math.min(0.3, (items[92] ?? 0) * 0.001);
            mybuff.cd.push(new buffInfo("+", cdBuff, 9999));
            myStats.cd += cdBuff;

            const dodgeBuff = Math.min(0.1, (items[665] ?? 0) * 0.0005);
            mybuff.dodge.push(new buffInfo("+", dodgeBuff, 9999));
            myStats.dodge += dodgeBuff;

            return AbilityResponse.SUCCESS;
        },
    },
    "21928": {
        usage: 9999,
        used: 0,
        cost: 75,
        pause: -10,
        desc: "**Total Usage**: `unlimited`\n**Cost**: `75`\\💧\n**Timeout**: `yes` (8 round cd)\n**Role**: `Support`\n\n**Seductive Strikes**\n- Boa Hancock's normal attacks are infused with her captivating charm, thus deal **110%** damage and inflict a stack of `Perfume Fever` on her opponent. Each stack of `Perfume Fever` reduces the enemy's DEF and MR by **4%** (up to **20%**) and their dodge rate by **10%**.\n- After reaching **6** stacks of `Perfume Fever`, Hancock deals **150%** damage and her opponent is turned to stone for 1 round, unable to make any actions.\n\n**Alluring Domination**\n- When facing male opponents, if Hancock has at least **3x** her opponent's EP, she sets their HP to **1**, leaving them on the brink of death, effectively allowing her to one-shot them.\n\n**Disarming Beauty**\n- When facing enemies with at least **3x** her own EP, Boa Hancock's cuteness and overwhelming beauty take effect, reducing the damage they deal to her by **33%**.\n\n**Active: Mero Mero Mellow**\n- Boa Hancock unleashes her most potent charm, turning her enemy to stone for **3** rounds. While petrified, the enemy is completely helpless, taking **1.2x** damage from all sources and unable to dodge or perform any actions. This is considered a vulnerability effect, where only the highest takes effect. After they manage to break free from the petrification, their ATK and MD is **halved** for the next turn, as they struggle to recover.",
        shortdesc: "**Uses**: `Unlimited`\n**Cooldown**: `8 rounds`\n**Cost**: `75 💧`\n**Timeout**: `Yes`\n**Role**: `DPS/Tank/Farming (Stun, Mitigation, DMG-boosting)`\n\n__**Passive**__\n- ATTACK is altered to deal **110%** DMG + Apply **1x** `Perfume Fever`\n`Perfume Fever`:\n- For every stack present, **-4%** enemy’s DEF & MR (Up to 20%), **-10%** enemy Dodge rate\n- Upon reaching **6** stacks: Consume all stacks to deal **150%** DMG + Disable enemy’s action for **1** round\n\n- When enemy is a male + Boa has **3x** their EP:\n- Lowers their HP to **1** at the start of the fight\n- When the enemy has **3x** her EP: **+33%** DMG mitigation\n\n__**Active**__ (✨)\nFor **3** rounds on the enemy:\n- Disables actions\n- Takes **+20%** DMG. This is considered a vulnerability effect, where only the highest takes effect.\n- Cannot dodge\n\nOn the **4th** turn:\n- **-50%** enemy’s ATK & MD for **1** round",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Boa Hancock EX
            if (this.pause > matchStats.round) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: `Boa Hancock needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                myStats.sm += this.cost;
                this.used--;
                return AbilityResponse.FAILURE;
            };
            this.pause = matchStats.round + 8;

            const domainLast = 3;
            eStats.timeFrozen = true;
            eStats.frozenMessage = "was turned into stone";
            if (eStats.vulnerability < 1.2) eStats.vulnerability = 1.2;

            ebuff.dodge.push(new buffInfo("=", 0, 3));

            // When Domain Ends
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + domainLast, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                eStats.timeFrozen = false;
                eStats.vulnerability = 1;

                ebuff.atk.push(new buffInfo("*", 0.5, 1));
                ebuff.md.push(new buffInfo("*", 0.5, 1));

                return AbilityResponse.SUCCESS;
            }));

            notice.push(`\n✨ **${char.name}** turned **${enemy.name}** to stone for **3** rounds!`);
            return AbilityResponse.SUCCESS;
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            myStats.perfumeFever = 0;
            eStats.vulnerability ??= 1;

            myStats.replaceButton.atk = {
                "emoji": "<:BoaLeg:1272508603454066750>",
                "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:BoaLeg:1272508603454066750> **${char.name}**`, { atkMultiplier: 1.1, magicDamage: true });
                    myStats.perfumeFever++;

                    return AbilityResponse.SUCCESS;
                },
            };

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                // Perfume Fever
                eStats.def = Math.floor(eStats.def * (1 - Math.min(0.2, 0.04 * myStats.perfumeFever)));
                eStats.mr = Math.floor(eStats.mr * (1 - Math.min(0.2, 0.04 * myStats.perfumeFever)));
                eStats.dodge = Math.max(0, eStats.dodge - (0.1 * myStats.perfumeFever));

                return AbilityResponse.SUCCESS;
            }, 9999));

            // 6th stack of Perfume Fever
            myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.perfumeFever === 6) {
                    //@ts-ignore
                    this._used++;
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** unleashed Perfume Fever! She`, { atkMultiplier: 1.5, magicDamage: true });

                    eStats.timeFrozen = true;
                    eStats.frozenMessage = "was turned into stone";

                    // When Domain Ends
                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        eStats.timeFrozen = false;

                        return AbilityResponse.SUCCESS;
                    }));
                };

                return AbilityResponse.SUCCESS;
            }, 9999, 1));

            // If opponent is male and has less EP
            if (enemy.gender === "M" && (myStats.ep / eStats.ep > 3)) {
                if (matchStats.interaction.commandName !== "stampede" || !enemy.boss) {
                    eStats.hp = 1;
                };
            };

            // If instead opponent has 3x your EP
            if (eStats.ep / myStats.ep >= 3) {
                ebuff.atk.push(new buffInfo("*", 0.6666, 9999));
                ebuff.md.push(new buffInfo("*", 0.6666, 9999));
            };

            return AbilityResponse.SUCCESS;
        },
    },
    "21929": {
        usage: 9999,
        used: 0,
        cost: 0,
        roundUsed: -1,
        roundActivated: -1,
        pool: [],
        rolledWisp: -1,
        lockedWisps: [],
        desc: "**Total Usage**: `unlimited` (max 2 wisps)\n**Cost**: `5`\\💧\n**Timeout**: `no`\n**Role**: `Support`\n\nUrashima wears a star pendant with a strange aura that grows depending on the magical items he carries. For every **1** refinement level on your favorite character (max **6**), Urashima gains:\n- **+10** Mana upon entering battle (max **+60**)\n- **+5%** ATK & MD (max **+30%**)\n- **+3%** dodge rate (max **+18%**)\n## __Celestial Wisps__\nUsing his active, Urashima summons a random celestial wisp. He can lock the wisp by using his ability again that same turn, lowering his mana regeneration by **5** permanently, or let it fade and summon a different wisp the next turn. **2** wisps can be locked this way at most. Skipping a wisp removes it from the summoning pool until one is locked or all are skipped.\n\n**Ursae Majoris**\n:low_brightness: Wildcard: No effects on its own. Amplifies the other wisp by the effects marked as :sunny:\n:sunny: Increases max HP by **20%**.\n\n**Andromedae**\n:low_brightness: Increases block rate by **13%**.\n:sunny: Block streaks increase block rate by **+2%** each (max **+12%**) until the streak gets interrupted.\n\n**Phoenicis**\n:low_brightness: Increases MR by **212** (**20%** damage reduction). The user is immune to HP debuffs.\n:sunny: Adds **340** DEF and increases MR to **340** as well (**30%** damage reduction).\n\n**Draconis**\n:low_brightness: Has a **10%** chance of countering enemy attacks. A successful counter boosts own critical rate by **2%** and critical DMG by **3%**, up to 10 times.\n:sunny: Upon countering, heals himself by **25%** of DMG avoided, up to **15%** of his missing HP.\n\nIn a party, Urashima intervenes during the first turn to let their allies summon a wisp, rotating between them with their character active (✨). They confirm their choice by using DEFEND (🛡️) once before the fight begins.",
        shortdesc: "**Uses**: `Unlimited (max. 2 wisps)`\n**Cost**: `5 💧`\n**Timeout**: `No`\n**Role**: `Support (Block/Counter/Tank+DoT-Immunity/Crit)`\n\n__**Passive**__\nFor every **1** refinement level on your favorite character (max **6**):\n- Begins battle with **+10** Mana (max +60)\n- **+5%** ATK/MD (max 30%)\n- **+3%** dodge rate (max **+18%**).\n\n__**Active**__ (✨)\nRolls a random wisp (click ✨ again to lock it), up to **1** per round. Locking lowers Urashima's mana regeneration by **5** permanently.\n-# (1) = locked once, (2) = locked same wisp twice.\n\n__Ursae Majoris:__\n- (1) Gives the “(2)” effect to any other wisp\n- (2) **+20%** max HP\n\n__Andromedae:__\n- (1) **+13%** Block Rate\n- (2) **+2%** Block Rate (max. **+12%**) for every successful consecutive block\n\n__Phoenicis__:\n- (1) **+212** MR (20% DMG reduction) + Immunity to DoT\n- (2) **+340** total DEF/MR (**30%** DMG reduction)\n\n__Draconis:__\n- (1) **+10%** Counter chance, every counter grants **+2%** critical rate and **+3%** critical DMG (Up to 10 times)\n- (2) Restores HP equal to **25%** of DMG avoided upon countering, up to **15%** of his missing HP.\n\n__**Party**__ (👥)\nAllies summon a Wisp on the first turn:\n- Rotating wisps with active (✨)\n- Lock an effect with DEFEND (🛡️)",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Urashima EX
            matchStats.turn = matchStats.turnSkill ? 0 : 1;

            if (this.lockedWisps.length > 1) {
                matchStats.sendWarning({ content: `You have already locked **2** wisps.`, ephemeral: true });
                this.used--;
                return AbilityResponse.FAILURE;
            };

            if (this.roundActivated === matchStats.round) {
                matchStats.sendWarning({ content: `You have already summoned a wisp this round, try again next round.`, ephemeral: true });
                this.used--;
                return AbilityResponse.FAILURE;
            };

            const wisps = { 0: "Ursae Majoris", 1: "Andromedae", 2: "Phoenicis", 3: "Draconis" }; // 4: "Centauri"

            if (this.roundUsed !== matchStats.round) {
                this.roundUsed = matchStats.round;

                if (myStats.sm < 5) {
                    matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/20\\💧)`, ephemeral: true });
                    this.used--;
                    return AbilityResponse.FAILURE;
                };
                myStats.sm -= 5;

                if (this.pool.length === 0) this.pool.push(0, 1, 2, 3); // 4 excluded
                this.pool.sort(() => Math.random() - 0.5);
                this.rolledWisp = this.pool.pop();
                notice.push(`\n🔅 **${char.name}** has summoned **__${wisps[this.rolledWisp as keyof typeof wisps]}__**. Use ✨ to keep it.`);
                return AbilityResponse.SUCCESS;
            };

            // Return if no wisp
            if (this.rolledWisp === -1) {
                matchStats.sendWarning({ content: `You have already locked the wisp`, ephemeral: true });
                return AbilityResponse.FAILURE;
            };

            if (this.rolledWisp === 0) {
                // Ursae Majoris
                const firstWisp = this.lockedWisps[0];
                if (firstWisp !== undefined) {
                    if (firstWisp === 0) {
                        // Ursae Majoris
                        const increaseHp = Math.floor(myStats.maxhp * 0.2);
                        myStatsFixed.maxhp += increaseHp;
                        myStatsFixed.hp += increaseHp;
                        myStats.maxhp += increaseHp;
                        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, increaseHp, {});
                    } else if (firstWisp === 1) {
                        // Andromedae
                        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                            myStats.br += 0.02 * Math.min(6, myStats.blockStreak);

                            return AbilityResponse.SUCCESS;
                        }, 9999));
                    } else if (firstWisp === 2) {
                        // Phoenicis
                        mybuff.mr.push(new buffInfo("+", 340, 9999));
                        myStats.mr += 340;
                        mybuff.mr.push(new buffInfo("+", 128, 9999));
                        myStats.mr += 128;
                    } else if (firstWisp === 3) {
                        // Draconis
                        matchStats.on("counter", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                            if (target == myStats) {
                                const increaseHp = Math.floor(Math.min(options.damage * 0.25, (myStats.maxhp - myStats.hp) * 0.15));
                                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, increaseHp, {});
                            }
                        });
                    } /*else if (firstWisp === 4) {
                        // Centauri
                        matchStats.critbleed = true;
                        matchStats.critbleedlast = 2;
                    };*/
                };
            } else if (this.rolledWisp === 1) {
                // Andromedae
                mybuff.br.push(new buffInfo("+", 0.13, 9999));
                myStats.br += 0.13;
                if (myStats.br > 0.9) myStats.br = 0.9;
            } else if (this.rolledWisp === 2) {
                // Phoenicis
                mybuff.mr.push(new buffInfo("+", 212, 9999));
                myStats.mr += 212;

                // HP Debuff Immunity
                mybuff.hp = mybuff.hp.filter((buff) => !buff.isDebuff);
                myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    mybuff.hp = mybuff.hp.filter((buff) => !buff.isDebuff);

                    return AbilityResponse.SUCCESS;
                }, 9999));
            } else if (this.rolledWisp === 3) {
                // Draconis
                myStats.counter ??= 0;
                myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    if (Math.random() < 0.1) myStats.counter = 1;

                    return AbilityResponse.SUCCESS;
                }, 9999));
                matchStats.on("counter", {
                    maxUsage: 10,
                    callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                        if (target == myStats) {
                            myStats.cr += 0.02;
                            if (myStats.cr > 1) myStats.cr = 1;
                            myStats.cd += 0.03;
                        }
                    }
                });
            } /* else if (this.rolledWisp === 4) {
                // Centauri
                mybuff.cr.push(new buffInfo("+", 0.1, 9999));
                myStats.cr += 0.1;
                if (myStats.cr > 1) myStats.cr = 1;

                mybuff.cd.push(new buffInfo("+", 0.15, 9999));
                myStats.cd += 0.15;
            }; */

            // Lock wisp
            this.lockedWisps.push(this.rolledWisp);
            this.pool = [0, 1, 2, 3]; // 4 excluded
            notice.push(`\n🔅 **${wisps[this.rolledWisp as keyof typeof wisps]}** was locked!`);
            myStats.mg -= 5;
            if (myStats.mg < 0) myStats.mg = 0;
            mybuff.mg.push((new buffInfo("+", -5, 9999)));
            this.rolledWisp = -1;
            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const stats = await getUserSchema(matchStats.interaction.user.id);

            const favcharref = stats?.char_ref[stats?.favchar ?? 21929];

            /*// Get SS shards
            const stats = await getUserSchema(matchStats.interaction.user.id);

            const shardStacks = Math.min(5, (stats?.ssshard ?? 0) / 50);
            */

            if (favcharref == undefined) return AbilityResponse.FAILURE;
            // Dodge rate buff
            const increase_eva = 0.03 * favcharref;
            myStats.dodge += increase_eva;
            if (myStats.dodge > 1) myStats.dodge = 1;
            mybuff.dodge.push(new buffInfo("+", Math.min(increase_eva, 1 - myStats.dodge), 9999));

            // ATK & MD buffs
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * (0.05 * favcharref)), 9999));
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * (0.05 * favcharref)), 9999));
            myStats.atk += Math.floor(myStats.atk * (0.05 * favcharref));
            myStats.md += Math.floor(myStats.md * (0.05 * favcharref));

            // Burst mana
            myStats.sm += 10 * favcharref;
            if (myStats.sm > myStats.mana) myStats.sm = myStats.mana;


            return AbilityResponse.SUCCESS;
        },
        party: async function (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            const name = pStats.name;

            const tempAtk = myStats.replaceButton.atk;
            const tempDef = myStats.replaceButton.def;
            const tempAbility = myStats.replaceButton.ability;
            const tempSkill = myStats.replaceButton.cskill;

            notice.push(`\n🔅 **Urashima**: Please use ${tempAbility?.emoji || "✨"} to roll a wisp.`);

            const wisps = { 0: "Ursae Majoris", 1: "Andromedae", 2: "Phoenicis", 3: "Draconis" }; // 4: "Centauri"

            if (this.pool.length === 0) this.pool.push(1, 2, 3); // 4
            this.pool.sort(() => Math.random() - 0.5);
            this.rolledWisp = this.pool.pop();
            notice.push(`\n🔅 **${name}** has summoned **__${wisps[this.rolledWisp as keyof typeof wisps]}__**. Use ${tempDef?.emoji || "🛡️"} to keep it, ${tempAbility?.emoji || "✨"} to reroll.`);

            myStats.replaceButton.ability = {
                emoji: tempAbility?.emoji,
                run: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;

                    if (this.pool.length === 0) this.pool.push(1, 2, 3); // 4
                    this.pool.sort(() => Math.random() - 0.5);
                    this.rolledWisp = this.pool.pop();
                    notice.push(`\n🔅 **${name}** has summoned **__${wisps[this.rolledWisp as keyof typeof wisps]}__**. Use ${tempDef?.emoji || "🛡️"} to keep it, ${tempAbility?.emoji || "✨"} to reroll.`);

                    return AbilityResponse.SUCCESS;
                },
            };

            myStats.replaceButton.def = {
                emoji: tempDef?.emoji,
                run: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;

                    if (tempAtk) myStats.replaceButton.atk = tempAtk;
                    else delete myStats.replaceButton.atk;
                    if (tempDef) myStats.replaceButton.def = tempDef;
                    else delete myStats.replaceButton.def;
                    if (tempAbility) myStats.replaceButton.ability = tempAbility;
                    else delete myStats.replaceButton.ability;
                    if (tempSkill) myStats.replaceButton.cskill = tempSkill;
                    else delete myStats.replaceButton.cskill;

                    if (this.rolledWisp === 1) {
                        // Andromedae
                        mybuff.br.push(new buffInfo("+", 0.13, 9999));
                        myStats.br += 0.13;
                        if (myStats.br > 0.9) myStats.br = 0.9;
                    } else if (this.rolledWisp === 2) {
                        // Phoenicis
                        mybuff.mr.push(new buffInfo("+", 212, 9999));
                        myStats.mr += 212;

                        // HP Debuff Immunity
                        mybuff.hp = mybuff.hp.filter((buff) => !buff.isDebuff);
                        myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                            mybuff.hp = mybuff.hp.filter((buff) => !buff.isDebuff);

                            return AbilityResponse.SUCCESS;
                        }, 9999));
                    } else if (this.rolledWisp === 3) {
                        // Draconis
                        matchStats.on("counter", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                            if (target == myStats) {
                                const increaseHp = Math.floor(Math.min(options.damage * 0.25, (myStats.maxhp - myStats.hp) * 0.15));
                                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, increaseHp, {});
                            }
                        });
                    } /* else if (this.rolledWisp === 4) {
                        // Centauri
                        mybuff.cr.push(new buffInfo("+", 0.1, 9999));
                        myStats.cr += 0.1;
                        if (myStats.cr > 1) myStats.cr = 1;

                        mybuff.cd.push(new buffInfo("+", 0.15, 9999));
                        myStats.cd += 0.15;
                    };*/

                    const wisps = { 0: "Ursae Majoris", 1: "Andromedae", 2: "Phoenicis", 3: "Draconis" }; // 4: "Centauri"
                    notice.push(`\n🔅 **${wisps[this.rolledWisp as keyof typeof wisps]}** was locked!`);
                    return AbilityResponse.SUCCESS;
                },
            };

            myStats.replaceButton.atk = {
                emoji: tempAtk?.emoji,
                run: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    notice.push(`\n🔅 **Urashima**: Please use ${tempAbility?.emoji || "✨"} to roll a wisp.`);

                    return AbilityResponse.SUCCESS;
                },
            };

            myStats.replaceButton.cskill = {
                emoji: tempSkill?.emoji,
                run: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    notice.push(`\n🔅 **Urashima**: Please use ${tempAbility?.emoji || "✨"} to roll a wisp.`);

                    return AbilityResponse.SUCCESS;
                },
            };

            return AbilityResponse.SUCCESS;
        },
    },
    "21930": {
        usage: 9999,
        used: 0,
        cost: 45,
        pause: -10,
        desc: "**Total Usage**: `unlimited` (3 round cd)\n**Cost**: `45`\\💧\n**Timeout**: `yes`\n**Role**: `Support`\n\nDue to her neural subdermal implant and heavy black ICE that protects her CNS and mind, Lucy has **30%** increased MR. Every **4th** round, she uploads the `Cripple Movement` daemon, which cripples the enemy for **1** round, making them unable to act. While crippled, the enemy takes **50%** more damage.\n\nWhen using her active, her monowire arm implant gives her undodgeable reach, dealing **80%** damage. Her monowires are capable of uploading daemons upon contact, so when the enemy is hit with this, she uploads `Overheat` unto their cerebral cortex, burning them for **120%** damage over **3** rounds.\n\nIn a party, Lucy uploads `Cripple Movement` to the enemy every **4th** round.",
        shortdesc: "**Uses**: `Unlimited`\n**Cooldown**: `3 rounds`\n**Cost**: `45 💧`\n**Timeout**: `Yes`\n**Role**: `DPS/Support (Stun, Burst, DMG-boost, DoT)`\n\n__**Passive**__\n- **+30%** MR\n\nEvery **4th** turn, uploads `Cripple` to the enemy for **1** round:\n- Takes **+50%** DMG\n- Cannot make an action\n\n__**Active**__ (✨)\n- Deals **80%** undodgeable DMG\n- Enemy takes additional **120%** DMG over **3** rounds\n\n__**Party**__ (👥)\n- Every **4th** turn, uploads `Cripple` with the same effects as her passive",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Lucy EX / Lucyna EX
            if (this.pause > matchStats.round) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: `Lucy needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                myStats.sm += this.cost;
                this.used--;
                return AbilityResponse.FAILURE;
            };
            this.pause = matchStats.round + 3;

            // Monowire Arm
            const damage = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.8, dodge: false, combodmg: true, selfdmg: true, selfheal: true });
            if (damage) ebuff.hp.push(new buffInfo("+", -Math.floor(damage * 0.5), 3));

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            eStats.vulnerability ??= 1;

            // MR buff
            mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr * 0.3), 9999));
            myStats.mr += Math.floor(myStats.mr * 0.3);

            // Cripple once every 4 rounds
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round % 4 === 0) {
                    eStats.timeFrozen = true;
                    eStats.frozenMessage = "was crippled for **1** round";
                    if (eStats.vulnerability < 1.5) eStats.vulnerability = 1.5;
                } else if (matchStats.round % 4 === 1) {
                    eStats.timeFrozen = false;
                    eStats.vulnerability = 1;
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            eStats.vulnerability ??= 1;
            myStats.isLucynaInParty = true;

            // Cripple once every 4 rounds
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round % 4 === 0) {
                    eStats.timeFrozen = true;
                    eStats.frozenMessage = "was crippled for **1** round";
                    if (eStats.vulnerability < 1.5) eStats.vulnerability = 1.5;
                } else if (matchStats.round % 4 === 1) {
                    eStats.timeFrozen = false;
                    eStats.vulnerability = 1;
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "21931": {
        usage: 9999,
        used: 0,
        cost: 0,
        pause: -10,
        lotus: 0,
        attackNumber: 0,
        desc: "**Total Usage**: `unlimited`\n**Cost**: `9`🪷\n**Timeout**: `yes` (6 round cd)\n**Role**: `DPS`\n\n_\"Stream forth... the gleam of old blades.\"_ Acheron's blade is resisted by none. Her basic attacks deal **100%**/**120%**/**140%** damage when attacking in succession, then resetting back to **100%**. On the first hit, she inflicts **1** stack of :lotus:, on the second hit, she inflicts **3** stacks of :lotus: and on the third, she inflicts **5** stacks of :lotus:. For each stack of :lotus:, she shreds the enemy's defense by **3%**.\n\nMoreover, Acheron instantly defeats non-boss enemies who have **2.5x** less EP than herself.\n\n_\"I weep for the departed. Dusk's rain... it too shall fall.\"_ Acheron draws the blade that epitomizes Nihility; the blade of Naught. It consumes all **9** stacks of :lotus:, hitting **4** times dealing **77%** damage per hit. For each hit landed successfully, reduces the enemy's defense by **5%** for the next **3** rounds.\n\nWhen her health falls below **30%**, she rejuvenates **50** mana and **20%** of her max HP by eating a :peach:.\n\nIn a party, Acheron aids her party members by reducing the enemy's **DEF** and **MR** by **3%** after every critical hit landed (max **18%**).",
        shortdesc: "**Uses**: `Unlimited`\n**Cooldown**: `6 rounds`\n**Cost**: `0 💧`\n**Timeout**: `Yes`\n**Role**: `DPS/Farming (Progressive, Burst)`\n\n__**Passive**__\n- When she has **2.5x** of a non-boss enemy’s EP: Instantly eliminates them\n\nATTACK is altered to deal **100%**, **120%** and finally **140%** DMG (in a set rotation):\n- These apply **1x**, **3x**, and **5x** `Knot`\n- For every `Knot`, **-3%** enemy’s DEF & MR\n\nWhen fallen below **30%** HP:\n- Gains **50** 💧\n- Restores **20%** max HP\n\n__**Active**__ (✨)\n- Deals **4** hits of **77%** DMG\n- For every hit landed: **-5%** enemy’s DEF & MR for the next **3** rounds\n\n__**Party**__ (👥)\n- When allies score a critical hit: **-3%** enemy’s DEF & MR (Up to 18%)",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Acheron EX
            if (this.pause > matchStats.round) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: `Acheron needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                this.used--;
                return AbilityResponse.FAILURE;
            };

            if (this.lotus < 9) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: `You need 9 stacks of 🪷 (current: **${this.lotus}**🪷)`, ephemeral: true });
                this.used--;
                return AbilityResponse.FAILURE;
            };

            // Consume lotus
            this.pause = matchStats.round + 6;
            this.lotus = 0;

            // Attack
            const dmg1 = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🪷 **${char.name}**`, { atkMultiplier: 0.77, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
            const dmg2 = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🪷 **${char.name}**`, { atkMultiplier: 0.77, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
            const dmg3 = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🪷 **${char.name}**`, { atkMultiplier: 0.77, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
            const dmg4 = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🪷 **${char.name}**`, { atkMultiplier: 0.77, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });

            const successfulHits = Number(!!dmg1) + Number(!!dmg2) + Number(!!dmg3) + Number(!!dmg4);

            ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * 0.05 * successfulHits), 3));
            ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.05 * successfulHits), 3));
            eStats.def -= Math.floor(eStats.def * 0.05 * successfulHits);
            eStats.mr -= Math.floor(eStats.mr * 0.05 * successfulHits);

            return AbilityResponse.SUCCESS;
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {

            myStats.replaceButton.atk = {
                emoji: "🪷",
                run: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    const dmg = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🪷 **${char.name}**`, { atkMultiplier: 1 + (0.2 * (this.attackNumber % 3)), magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                    this.attackNumber++;

                    if (this.lotus === 0) this.lotus = 1;
                    else if (this.lotus === 1) this.lotus = 4;
                    else if (this.lotus === 4) this.lotus = 9;

                    return AbilityResponse.SUCCESS;
                },
            };

            // DEF shred
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                eStats.def -= Math.floor(eStats.def * 0.03 * this.lotus);
                eStats.mr -= Math.floor(eStats.mr * 0.03 * this.lotus);

                return AbilityResponse.SUCCESS;
            }, 9999));

            // If opponent is not a boss and has less EP
            if (!enemy.boss && (myStats.ep / eStats.ep > 2.5)) {
                eStats.hp = 0;
            };

            // Delayed Buff
            myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp / myStats.maxhp < 0.3) {
                    const hp = Math.floor(myStats.maxhp * 0.2);
                    addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, hp, {});
                    const mana = Math.min(50, myStats.mana - myStats.sm);
                    myStats.sm += mana;
                    notice.push(`\n🍑 **${char.name}** has rejuvenated **${hp}** HP and **${mana}** mana!`);
                    //@ts-ignore
                    this._used++;
                };

                return AbilityResponse.SUCCESS;
            }, 9999, 1));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.critShred = 0.03;

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                eStats.def -= Math.floor(eStats.def * 0.03 * Math.min(6, myStats.crittedTotal));
                eStats.mr -= Math.floor(eStats.mr * 0.03 * Math.min(6, myStats.crittedTotal));

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "22610": {
        usage: 5,
        used: 0,
        cost: 60,
        desc: "**Total Usage**: `5`\n**Mana**: `60`\\💧\n**Timeout**: `yes`\n**Role**: `Support`\n\nMari's active skill is a sophisticated form of self-purification. By cleansing herself, she removes all debuffs currently affecting her. These are not merely discarded; instead, Mari redirects them to her enemy, **50%** stronger than they were, lasting up to **5** rounds.\n\nAt the onset of combat, Mari exerts her influence over the environment, infusing it with a toxic essence. This passive poison reduces enemy ATK & MD by **10%**, and DEF & MR by **100**.\n\nAs the battle prolongs, every **4** rounds, both Mari and her enemy suffer from this toxic environment, losing an additional **3%** ATK & MD, as well as **20** DEF & MR.\n\nIn a party, Mari boosts the party's offensive and defensive capabilities at the beginning of the battle, increasing their ATK, MD, DEF, MR, as well as their dodge chance, crit rate, and crit damage by **10%**.",
        shortdesc: "**Uses**: `5`\n**Cost**: `60 💧`\n**Timeout**: `Yes`\n**Role**: `Support (DoT, Debuff-transferration)`\n\n__**Passive**__\nUpon entering battle on the enemy:\n- **-10%** ATK & MD\n- **-100%** DEF & MR\n\nEvery **4** rounds for both Mari & the enemy as a form of DoT:\n- **-3%** ATK & MD\n- **-20** DEF & MR\n\n__**Active**__ (✨)\n- Removes all debuffs on herself\n- Transfers those debuffs to the enemy with **+50%** effectiveness, lasting up to **5** rounds\n\n__**Party**__ (👥)\n- **+10%** ATK, MD, DEF, MR, Dodge rate, critical rate, critical DMG",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Mari EX
            Object.keys(mybuff).forEach((stat) => {
                mybuff[stat as keyof Buffs].forEach((buff) => {
                    // Adds own debuffs x1.5 to enemy
                    if (buff.isDebuff) {
                        const debuff = new buffInfo(buff.type, buff.val * 1.5, Math.min(5, buff.last), buff.change, buff.ctype, buff.cap);
                        ebuff[stat as keyof Buffs].push(debuff);
                    };
                });

                // Remove debuffs
                mybuff[stat as keyof Buffs] = mybuff[stat as keyof Buffs].filter((buff) => !buff.isDebuff);
            });

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Poison the enemy
            ebuff.atk.push(new buffInfo("+", -Math.floor(eStats.atk * 0.1), 9999));
            ebuff.md.push(new buffInfo("+", -Math.floor(eStats.md * 0.1), 9999));
            eStats.atk -= Math.floor(eStats.atk * 0.1);
            eStats.md -= Math.floor(eStats.md * 0.1);
            ebuff.def.push(new buffInfo("+", -100, 9999));
            ebuff.mr.push(new buffInfo("+", -100, 9999));
            eStats.def -= 100;
            eStats.mr -= 100;

            // Poison the user
            mybuff.atk.push(new buffInfo("+", -Math.floor(myStats.atk * 0.1), 9999));
            mybuff.md.push(new buffInfo("+", -Math.floor(myStats.md * 0.1), 9999));
            myStats.atk -= Math.floor(myStats.atk * 0.1);
            myStats.md -= Math.floor(myStats.md * 0.1);
            mybuff.def.push(new buffInfo("+", -100, 9999));
            mybuff.mr.push(new buffInfo("+", -100, 9999));
            myStats.def -= 100;
            myStats.mr -= 100;

            // Apply new debuffs every 4 rounds
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round % 4 === 0) {
                    ebuff.atk.push(new buffInfo("+", -Math.floor(eStats.atk * 0.03), 9999));
                    ebuff.md.push(new buffInfo("+", -Math.floor(eStats.md * 0.03), 9999));
                    ebuff.def.push(new buffInfo("+", -20, 9999));
                    ebuff.mr.push(new buffInfo("+", -20, 9999));
                    mybuff.atk.push(new buffInfo("+", -Math.floor(eStats.atk * 0.03), 9999));
                    mybuff.md.push(new buffInfo("+", -Math.floor(eStats.md * 0.03), 9999));
                    mybuff.def.push(new buffInfo("+", -20, 9999));
                    mybuff.mr.push(new buffInfo("+", -20, 9999));
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // 10% Buffs
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.1), 9999));
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.1), 9999));
            mybuff.def.push(new buffInfo("+", Math.floor(myStats.def * 0.1), 9999));
            mybuff.mr.push(new buffInfo("+", Math.floor(myStats.mr * 0.1), 9999));
            mybuff.dodge.push(new buffInfo("+", 0.1, 9999));
            mybuff.cr.push(new buffInfo("+", 0.1, 9999));
            mybuff.cd.push(new buffInfo("+", 0.1, 9999));
            myStats.atk += Math.floor(myStats.atk * 0.1);
            myStats.md += Math.floor(myStats.md * 0.1);
            myStats.def += Math.floor(myStats.def * 0.1);
            myStats.mr += Math.floor(myStats.mr * 0.1);
            myStats.dodge += 0.1;
            if (myStats.dodge > 1) myStats.dodge = 1;
            myStats.cr += 0.1;
            if (myStats.cr > 1) myStats.cr = 1;
            myStats.cd += 0.1;

            return AbilityResponse.SUCCESS;
        },
    },
    "22611": {
        usage: 9999,
        used: 0,
        cost: 20,
        pause: 0,
        desc: "**Total Usage**: `unlimited`\n**Mana**: `20` or `80`\\💧\n**Timeout**: `yes`, 3 round cd for 80-cost active\n**Role**: `DPS`\n\nFrieren, the elven mage who has witnessed centuries pass, harnesses her immense magical prowess in both offense and support roles. Her abilities adapt dynamically to the flow of battle, allowing her to deal magic damage while debuffing and disabling enemies. And against certain foes, demons and their likes, her magic reaches unparalleled heights, granting her a **20%** increase in attack and magic damage. And as an ancient mage having honed her magic over centuries, Frieren has an enormous mana pool, as well as a boosted mana generation, gaining **+5** mana per round.\n\nAs a mage who loves collecting spells, Frieren casts a different spell depending on the situation and amount of mana she has. When running low on mana, she casts offensive magic `Zoltraak`, dealing **110%** magic damage, for only **20** mana. And when she has at least **80** mana, she casts `Destructive Lightning: Judradjim`, dealing **150%** magic damage and stunning her opponent for 1 round, or, if her opponent's HP is under **50%**, she casts `Hellfire Summoning: Vollzanbel`, dealing **150%** magic damage and an additional **30%** for 2 rounds.\n\nBut that's not all, after casting one of her two powerful spells, `Judradjim` or `Vollzanbel`, Frieren has a **30%** chance to follow up on it, casting her other spell immediately after. This chance increases by **+1%** for every **5** excess mana she has, up to a total of **50%**.\n\nFinally, when Frieren's HP falls below **30%** for the first time, she automatically unleashes the Height of Magic, an ultimate and desperate retaliatory attack dealing **80%** magic damage + an additional **5%** for every round she's survived so far (capping at **180%** total).\n\nIn a party, Frieren assists her party members by casting `Zoltraak` once every **4** rounds.",
        shortdesc: "**Uses**: `Unlimited`\n**Cooldown**: `3 rounds for 80-cost active`\n**Cost**: `20/80 💧`\n**Timeout**: `Yes`\n**Role**: `DPS (Mana-boost, Followup Attack, Nuke)`\n\n__**Passive**__\n- **+20%** ATK & MD\n- Regenerates **+5** 💧\n- **+500** mana pool (capacity)\n\nWhen falls below **30%** HP for the first time:\n- Deals **80%** MD\n- The DMG scaling of this hit is increased by **5%** for every round she has survived (Up to 180% in total)\n\n__**Active**__ (✨)\n20 💧 : Zoltraak\n- Deal **110%** MD\n\n80 💧:\nWhen the enemy has **50%** HP or more: casts Judradjim\n- Deal **150%** MD\n- Stuns opponent for **1** round\n\nElse: casts Vollzanbe\n- Deals **150%** MD\n- Additionally deals **30%** MD for **2** rounds\n\nAfter using 80-cost active (✨):\n- Has a **30%** chance to followup with her other 80-cost active\n- **+1%** followup chance for every **5** excess 💧 (Up to 50% in total)\n\n__**Party**__ (👥)\n- At the start of every **4** rounds: Uses Voltraak (Deals **110%** MD)",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Frieren EX

            // Zoltraak
            if (this.pause > matchStats.round || myStats.sm < 80) {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Zoltraak! She`, { atkMultiplier: 1.1, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                return AbilityResponse.SUCCESS;
            };
            // else:

            // Cooldown
            /*if (this.pause > matchStats.round) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                this.used--;
                myStats.sm += 20;
                matchStats.sendWarning({ content: `Frieren needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                return AbilityResponse.FAILURE;
            };*/

            // Judradjim / Vollzanbel
            myStats.sm -= 60;
            this.pause = matchStats.round + 3;

            const judradjim = () => {
                dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Judradjim! She`, { atkMultiplier: 1.5, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });

                // Stun for 1 round
                eStats.timeFrozen = true;
                eStats.frozenMessage = "was stunned for **1** round";
                myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    eStats.timeFrozen = false;

                    return AbilityResponse.SUCCESS;
                }, 1));
            };

            const vollzanbel = () => {
                const damage = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}** used Vollzanbel! She`, { atkMultiplier: 1.5, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });

                // Burn for 2 rounds
                ebuff.hp.push(new buffInfo("+", -Math.floor(damage * 0.2), 2));
            };

            if ((eStats.hp / eStats.maxhp) > 0.5) {
                // Judradjim
                judradjim();
                if (Math.random() < Math.min(0.5, 0.3 + ((myStats.sm - 20) * 0.002))) vollzanbel();
            } else {
                // Vollzanbel
                vollzanbel();
                if (Math.random() < Math.min(0.5, 0.3 + ((myStats.sm - 20) * 0.002))) judradjim();
            };

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.mdChance = 1;

            // Mana Boost
            myStats.mana += 500;
            mybuff.mg.push(new buffInfo("+", 5, 9999));
            myStats.mg += 5;

            // 20% attack buff if enemy is a demon or devil
            if (enemy?.species?.toLowerCase()?.includes("demon") || enemy?.species?.toLowerCase()?.includes("devil")) {
                mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.2), 9999));
                mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * 0.2), 9999));
                myStats.atk += Math.floor(myStats.atk * 0.2);
                myStats.md += Math.floor(myStats.md * 0.2);
            };

            // Autocast The Height of Magic
            myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.hp / myStats.maxhp < 0.3) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.8 + (0.05 * Math.min(matchStats.round, 20)), dodge: false, block: false });
                    //@ts-ignore
                    this._used++;
                };

                return AbilityResponse.SUCCESS;
            }, 9999, 1));

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            const name = pStats.name;
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                if (matchStats.round % 4 === 0) {
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${name}** used Zoltraak! She`, { atkMultiplier: 1.1, magicDamage: true, mdChance: -1 });
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
    "22612": {
        usage: 9999,
        used: 0,
        tsukuyomiUsed: 0,
        cost: 0,
        desc: "**Total Usage**: `1`\n**Cost**: `all`\\💧 and `40%`\\🩸 (max HP)\n**Timeout**: `yes`\n**Role**: `Self-Sacrifice`\n\nItachi's poor health condition is a shackle that weighs down on him, causing him to begin the battle at **70%** of his max HP. However, even when nearly blind, Itachi is the epitome of a perfect genjutsu specialist, and thus has **20%** increased dodge chance.\n\nUsing his active `Tsukuyomi`, Itachi traps the victim in a seemingly unending Genjutsu, rendering them incapable of moving for **3** rounds. However, the usage of the Mangekyo Sharingan is a strain upon his eyes, making him lose **40%** HP.\n\nBut... is this it? Is one of the greatest prodigies of the hidden leaf going to go down by his own hands yet again? No. And this time, there will be no shackles.\n\n...\n\n_Edo Tensei!!_\n\n**Total Usage**: `1`\n**Cost**: `50%`\\💧 + `50%`\\💧\n**Timeout**: `no`\n**Role**: `DPS`\n\nAfter Itachi falls in combat for the first time, he is resurrected at **100%** of his max HP by Edo Tensei, a forbidden jutsu created by Tobirama Senju, and perfected by Kabuto. In this form, Itachi is no longer dampened by his chakra restrictions, nor his health condition.\n\nHe immediately enters his Susanoo form, gaining a **20%** ATK and MD boost. His `ATK` action is replaced with the `Totsuka Blade`, and his `DEF` is replaced with the `Yata Mirror`. The Totsuka Blade deals **66%** damage + **10%** of the enemy's current max HP (this second impact cannot exceed the damage of the first). And the Yata Mirror will grant **30%** damage reduction for **2** rounds. The Yata Mirror can still block attacks.\n\nThis time, his active activates Mangekyo Sharingan; `Kotoamatsukami`. The ability of the eye he'd received from Shisui. When used, the `Kotoamatsukami` consumes **50%** of the user's and the enemy's available mana, then stunning the enemy for an additional turn for every **30** mana consumed (up to **5** rounds). For every round stunned, permanently shred **3%** of the enemy's DEF and MR.",
        shortdesc: "**Uses**: `1`\n**Cost**: `All 💧`\n**Timeout**: `Yes`\n**Role**: `Self-Sacrifice`\n\n__**Passive**__\n- Begins with **70%** of Max HP\n- **+20%** Dodge rate\n\n__**Active**__ (✨) : Tsukuyomi\n- Loses **40%** (own) HP\n- Stuns enemy for **3** rounds.\n\nAfter dying once, revives with the following characteristics, and abilities get replaced.\n\n**Uses**: `1`\n**Cost**: `50% 💧(own) + 50% 💧(enemy)`\n**Timeout**: `No`\n**Role**: `DPS`\n\n__**Passive**__\n- Revives with **100%** max HP\n- **+20%** ATK/MD\n- ATTACK is altered to dealing **66%** DMG + **10%** of enemy Max HP as DMG (Max: DMG dealt with the first 66%)\n- DEFEND is altered to: **+30%** DMG mitigation for **2** rounds (can still block).\n\n __**Active**__ (✨) : Kotoamatsukami\n- Stuns the enemy **1** round (max. **5**) for every **30** Mana consumed.\n- For each round stunned, **-3%** enemy DEF/MR (permanently)",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Itachi EX
            if (myStats.revivedTotal < 1) {
                // Tsukuyomi
                if (this.used > 1) {
                    matchStats.turn = matchStats.turnSkill ? 0 : 1;
                    matchStats.sendWarning({ content: `Tsukuyomi can only be used once per battle.`, ephemeral: true });
                    this.used--;
                    return AbilityResponse.FAILURE;
                };

                // Cost
                myStats.sm = 0;
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, -Math.floor(myStats.maxhp * 0.4), {});

                const stunDuration = 3;

                // Render them incapable for 3 rounds
                eStats.timeFrozen = true;
                eStats.frozenMessage = `was incapacitated for **${stunDuration}** rounds`;
                // remove after stun duration
                myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + stunDuration, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    eStats.timeFrozen = false;

                    return AbilityResponse.SUCCESS;
                }, 1));

                notice.push(`\n✨ **${char.name}** used \`Tsukuyomi\`! Stunned the enemy for **${stunDuration}** rounds`);
            } else {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;

                // Mangekyo Sharingan; Kotoamatsukami
                if (this.tsukuyomiUsed > 0) {
                    matchStats.sendWarning({ content: `Kotoamatsukami can only be used once per battle.`, ephemeral: true });
                    return AbilityResponse.FAILURE;
                };
                this.tsukuyomiUsed++;

                // Mana consumption
                const manaConsumedUser = Math.floor(myStats.sm * 0.5);
                const manaConsumedEnemy = Math.floor(eStats.sm * 0.5);
                myStats.sm -= manaConsumedUser;
                eStats.sm -= manaConsumedEnemy;

                const stunDuration = Math.min(Math.floor((manaConsumedUser + manaConsumedEnemy) / 30), 5); // Cap at 5 rounds

                // Apply stun
                eStats.timeFrozen = true;
                eStats.frozenMessage = `was stunned for **${stunDuration}** rounds`;
                // remove after stun duration
                myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + stunDuration, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    eStats.timeFrozen = false;

                    return AbilityResponse.SUCCESS;
                }, 1));

                // Defense and MR shred
                ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * 0.03 * stunDuration), 9999));
                ebuff.mr.push(new buffInfo("+", -Math.floor(eStats.mr * 0.03 * stunDuration), 9999));
                eStats.def -= Math.floor(eStats.def * 0.03 * stunDuration);
                eStats.mr -= Math.floor(eStats.mr * 0.03 * stunDuration);

                notice.push(`\n✨ **${char.name}** used \`Kotoamatsukami\`! Stunned the enemy for **${stunDuration}** rounds`);
            };

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // Revival
            myStats.maxRevivals = 1;
            myStats.revhp = 1;
            myStats.rev += 1;

            // Begin fight at 70% HP
            if (Math.floor(myStats.maxhp * 0.7) < myStats.hp) {
                myStats.hp = Math.floor(myStats.maxhp * 0.7);
            };

            // 20% dodge buff
            mybuff.dodge.push(new buffInfo("+", 0.2, 9999));
            myStats.dodge += 0.2;

            // Transform after revival
            myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                if (myStats.revivedTotal > 0) {
                    //@ts-ignore
                    this._used++;

                    notice.push(`\n✨ **${char.name}** enters his Susanoo Form!`);

                    // 20% ATK & MD buff 
                    mybuff.atk.push(new buffInfo("*", 1.2, 9999));
                    mybuff.md.push(new buffInfo("*", 1.2, 9999));
                    myStats.atk += Math.floor(myStats.atk * 0.2);
                    myStats.md += Math.floor(myStats.md * 0.2);

                    // replace attack
                    myStats.replaceButton.atk = {
                        run: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                            const damage = dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `⚔️ **${char.name}** used Totsuka Blade! He`, { atkMultiplier: 0.66, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });

                            eStats.hp -= Math.min(damage, Math.floor(eStats.maxhp * 0.1));
                            eStats.hp = Math.max(eStats.hp, 0);

                            return AbilityResponse.SUCCESS;
                        },
                    };

                    // replace def
                    myStats.replaceButton.def = {
                        run: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

                            myStats.usedBlockRound = matchStats.round;

                            // 30% damage reduction for 2 rounds
                            myStats.damageReduction = 0.3;
                            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 2, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                                myStats.damageReduction = 0;

                                return AbilityResponse.SUCCESS;
                            }, 1));

                            return AbilityResponse.SUCCESS;
                        },
                    };

                };

                return AbilityResponse.SUCCESS;
            }, 9999, 1));

            return AbilityResponse.SUCCESS;
        },
    },
    "23185": {
        usage: 2,
        used: 0,
        cost: 20,
        pause: 0,
        selfhealidx: 0,
        desc: "**Total Usage**: `1 (CD: 10) + 1`\n**Cost**: `20 💧+ 0💧`\n**Timeout**: `No/Yes`\n\nBeing YorHa androids, 2B and 9S complement each other in combat as a duo, cleaving through machines, fighting for a future where humanity on the moon could regain control over the world.\n\nSpecifically programmed to operate indefinitely, androids are especially resistant to damage, having **+15%** max HP. Moreover, they may upload their data to their headquarters, allowing them a **100%** chance to revive with **50%** HP upon death. Lastly, programmed to derive pleasure from enticing combat, when under **50%** HP, they have **+7%** lifesteal.\n\nThey are equipped with their pods, allowing them to equip up to **2** programmes which take effect in battles via `/item equip item:prog <ID>`. To view programmes, do `item equip item:prog info`. To reset progreammes, do `/item equip item:prog remove` instead.\n\nIn combat, 2B takes the mainstay of attacks. Using ATTACK allows 2B to spring into the air, losing **7%** current HP before clashing the enemy, dealing **80%** DMG, before slamming them in a strike, dealing an additional instance of **10%** DMG, further increased by **1%** for every **1%** HP missing from the enemy (Up to 60%). If 2B has revived, no longer loses **7%** current HP but instead heals **7%** current HP.\n\nEvery critical hit allows 9S to analyze the foe, granting **1x** [ɪɴꜱɪɢʜᴛ]. At the start of a round, when 9S is not HACKING but owns **8x** or more [ɪɴꜱɪɢʜᴛ], 9S consumes **8x** [ɪɴꜱɪɢʜᴛ] and begins HACKING for **4** rounds.\n\n[ɪɴꜱɪɢʜᴛ]: For every stack present, both 9S and the enemy has **+3%** ATK/MD, up to **+24%** ATK\n\nHACKING: 9S initiates hacking on the enemy while 2B supports by distracting the foe. Critical hits deal **+1%** DMG for every **1** percentage point of remaining HP% difference between you and the enemy, up to +30%. If the enemy has less than **50%** HP, the effect is changed to decreasing the enemy's DEF by **25%** (up to **2x** damage). Moreover, non-critical hits cause him to lose **7%** current HP.\n\nThe duo’s active is split into 2 parts. The First use allows 2B & 9S to enter their respective flight unit for **10** rounds, granting additional effects after certain actions. After using ATTACK, activates “Forward slash”, which has a **20%** chance to counter the next hit (stackable) and decreases enemy’s ATK by **2%** permanently (Up to 20%). After using DEFEND, activates “Boost”, increasing dodge rate by **30%** for **2** rounds and decreases enemy’s DEF by **2%** permanently (Up to 20%). After using CLASS SKILL, activates “Subjugation”, increasing DMG mitigation by **2%** permanently (Up to 20%).\n\n The Second use causes 2B to self-destruct, dealing **70%** max HP as a non-critical hit to the enemy, before lowering HP to **1**. However, when 9S is not in HACKING, they instead collide their black boxes, the source of energy. This deals **100%** max HP as a critical hit to the enemy before *dying*.\n\nIn a party, the duo shares their pod passives with the entire team. The effect of [ɪɴꜱɪɢʜᴛ] instead grants allies **+2%** ATK per stack, up to **+16%** ATK.",
        shortdesc: "**Uses**: `1+1`\n**Cooldown**: `10 rounds`\n**Cost**: `20 💧 // 0 💧`\n**Timeout**: `No / Yes`\n**Role**: `DPS (Sacrificial, Critical, Revival)`\n__**Passive**__\n- Upon death, has a **100%** chance of reviving with **50%** HP.\n- **+15%** max HP\n- When at **50%** HP or below, has **+7%** lifesteal.\n- They may equip **2** programmes on pod for battle effects. To view available options, do `/item equip item: prog info`. To equip, do `/item equip item:prog <ID>`. To reset, do `/item equip item:prog remove`.\n\nATTACK is altered:\n> - Loses **7%** current HP (*Heals* instead after the first revive)\n> - Deals **80%** DMG, before dealing another instance of **10%**, further increased by **1%** for every **1%** HP missing from the enemy (Up to 60%).\n\n- Every critical hit grants **1x** [ɪɴꜱɪɢʜᴛ].\n\n__Core Mechanic__: HACKING\n- At the start of the round, when owning **8x** [ɪɴꜱɪɢʜᴛ] while not *HACKING*: 9S consumes **8x** [ɪɴꜱɪɢʜᴛ] and begins *HACKING* for **4** rounds.\n- [ɪɴꜱɪɢʜᴛ]: For every stack present, the duo has **+3%** ATK, up to 24%\n\nDuring *HACKING*:\n- Critical hits deal **+1%** DMG for every **1** percentage point of remaining HP% difference between you and the enemy, up to +30%.\n- If the enemy has less than **50%** HP, the effect is changed to decreasing the enemy’s DEF by **25%** (up to **2x** damage)\n- Non-critical hits cause him to lose **7%** current HP\n\n__**Active**__:\n__First use__: 2B & 9S enter their respective flight unit for **10** rounds. During this period:\n\nAfter using ATTACK:\n- **20%** chance to counter the next hit (stackable)\n- **-2%** enemy's ATK permanently (Up to 20%)\n\nAfter using DEFEND:\n- **+30%** dodge rate for **2** rounds\n- **-2%** enemy's DEF permanently (Up to 20%)\n\nAfter using CLASS SKILL:\n- **+2%** DMG mitigation permanently (Up to 20%)\n\n__Second use__:\n- Deals **70%** max HP as an undodgeable hit to the enemy, before lowering HP to **1**.\nWhen 9S is not in *HACKING*:\n- Instead deals **100%** max HP as a critical hit to the enemy before *dying*.\n\n__**Party**__:\n- Shares equipped pod passive with entire party\n- [ɪɴꜱɪɢʜᴛ]: For every stack present, has **+2%** ATK, up to 16%",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // 2B & 9S EX | 2B&9S EX

            // Enter respective flight unit for 10 rounds

            if (this.used === 1 && myStats.sm < 20) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/${20}\\💧)`, ephemeral: true });
                return AbilityResponse.FAILURE;
            } else if (this.pause > matchStats.round) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                matchStats.sendWarning({ content: `**${char.name}** needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                myStats.sm += this.cost;
                this.used--;
                return AbilityResponse.FAILURE;
            } else if (this.used === 1) {
                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                this.pause = matchStats.round + 10;

                notice.push(`\n✨ 2B and 9S entered their flight units for **10** rounds.`);

                // Additional effects after ATK/DEF/CSKILL
                matchStats.on("ATK", {
                    maxRound: 10,
                    maxUsage: 10,
                    callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                        if (caster === myStats) {
                            // 20% chance to gain 1x Counter. Enemy ATK/MD -2% permanently
                            if (Math.random() < 0.20) {
                                myStats.counter += 1;
                                notice.push(`\n⚜️ **${char.name}** prepares to counter the next attack`);
                            };
                            eStats.atk -= Math.floor(eStats.atk * 0.02);
                            ebuff.atk.push(new buffInfo("+", -Math.floor(eStats.atk * 0.02), 9999));
                            return true;
                        };
                    },
                });

                matchStats.on("DEF", {
                    maxRound: 10,
                    maxUsage: 10,
                    callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                        if (caster === myStats) {
                            // +30% dodge for 2 rounds. Enemy DEF -2% permanently
                            let dodgeBuff = 0.3;
                            myStats.dodge += dodgeBuff;
                            if (myStats.dodge > 1) myStats.dodge = 1;
                            mybuff.dodge.push(new buffInfo("+", dodgeBuff, 2));
                            eStats.def -= Math.floor(myStats.def * 0.02);
                            ebuff.def.push(new buffInfo("+", -Math.floor(eStats.def * 0.02), 9999));
                            return true;
                        };
                    },
                });

                matchStats.on("CSKILL", {
                    maxRound: 10,
                    maxUsage: 10,
                    callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                        if (caster === myStats) {
                            myStats.damageReduction += 0.02;
                            if (myStats.damageReduction > 1) myStats.damageReduction = 1;
                        };
                    },
                });
            } else {
                // Self-Destruct : 2B alone
                if (myStats.hacking) {
                    const dmg = (eStats.def + eStats.mr < 100000) ? Math.floor(myStats.maxhp * 0.7) : 0;
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ ${char.name}`, { overwriteDamage: dmg, magicDamage: true, dodge: false });
                    myStats.hp = 1;
                } else {
                    // Amplified when 9S isn't hacking
                    const dmg = (eStats.def + eStats.mr < 100000) ? Math.floor(myStats.maxhp * myStats.cd) : 0;
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ ${char.name}`, { overwriteDamage: dmg, magicDamage: true, dodge: false });
                    matchStats.trigger("crit", myStats, eStats, mybuff, ebuff);
                    myStats.hp = 0;
                };
            };

            return AbilityResponse.SUCCESS;
        },
        passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
            myStats.insight ??= 0;
            myStats.duorevived ??= false;
            myStats.counter ??= 0;
            myStats.selfhealChance.push(1);
            myStats.selfheal.push(0);
            this.selfhealidx = myStats.selfheal.length - 1;

            let prog = myStats.proginfo;
            if (prog) {
                for (let i = 0; i < prog.length; i++) {
                    switch (prog[i]) {
                        case "a110":
                            notice.push("\n`⚙️` Pod has been equipped with programme : **Slow**.");
                            myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                                if (matchStats.round % 2 === 0) {
                                    if (myStats.dodge < 0) myStats.dodge = 0;
                                    myStats.dodge += Math.min(0.2, Math.floor((myStats.maxhp - myStats.hp) / myStats.maxhp * 100) / 100);
                                };

                                return AbilityResponse.SUCCESS;
                            }, 9999));
                            break;
                        case "a120":
                            notice.push("\n`⚙️` Pod has been equipped with programme : **Repair**.");
                            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                                if (matchStats.round % 4 === 0) {
                                    myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                                        const heal = Math.floor(myStats.maxhp * 0.05);
                                        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, heal, {});

                                        return AbilityResponse.SUCCESS;
                                    }, 2));
                                };

                                return AbilityResponse.SUCCESS;
                            }, 9999));
                            break;
                        case "a140":
                            notice.push("\n`⚙️` Pod has been equipped with programme : **Gravity**.");
                            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                                if (matchStats.round % 4 === 0) {
                                    eStats.atk -= Math.floor(eStats.atk * 0.25);
                                    eStats.md -= Math.floor(eStats.md * 0.25);
                                    eStats.def -= Math.floor(Math.min(eStats.def * 0.25, 660));
                                    eStats.mr -= Math.floor(Math.min(eStats.mr * 0.25, 660));
                                };

                                return AbilityResponse.SUCCESS;
                            }, 9999));
                            break;
                        case "a170":
                            notice.push("\n`⚙️` Pod has been equipped with programme : **Scanner**.");
                            matchStats.lootm += 0.15;
                            matchStats.xpboost += 0.25;
                            myStats.insight++;
                            notice.push(`\n<:coins:872926669055356939> Ultrasonic waves released...`);
                            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                                myStats.insight++;

                                return AbilityResponse.SUCCESS;
                            }, 9999));
                            break;
                        case "r020":
                            notice.push("\n`⚙️` Pod has been equipped with programme : **Mirage**.");
                            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                                if (matchStats.round % 4 === 0) {
                                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, "`⚙️` Pod analyzed the foe! **Pod**", { atkMultiplier: 0.2, dodge: 0 });
                                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, "`⚙️` Pod analyzed the foe! **Pod**", { atkMultiplier: 0.2, dodge: 0 });
                                };

                                return AbilityResponse.SUCCESS;
                            }, 9999));
                            break;
                        default: notice.push(`\nFailed to connect to pod...`); break;
                    };
                };
            } else {
                notice.push("\n`⚙️` Pod is not equipped with any programme! Please run `/item equip item:prog` to proceed with choosing one!");
            };
            myStats.hacking = false;
            const domainLast = 4;
            const atklist = ["Nuissance.", "Reorganizing...", "Destroy."];
            myStats.atkcount = 0;

            // +30% max HP ; 100% chance to revive with 50% HP
            myStats.rev ??= 0;
            myStats.revhp ??= 0.5;
            myStats.maxRevivals ??= 0;

            myStats.rev = 1;
            myStats.maxRevivals += 1;
            const maxhpbuff = Math.floor(myStats.maxhp * 0.15);
            myStats.maxhp += maxhpbuff;
            myStats.hp += maxhpbuff;

            this.selfhealidx = myStats.selfheal.length - 1;

            // Remember revive
            matchStats.on("revival", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
                if (caster === myStats) {
                    myStats.duorevived = true;
                };
            });

            // Insight Mechanic
            myStats.atk += Math.floor(myStats.atk * Math.min(0.03 * myStats.insight, 0.24));

            matchStats.on("crit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
                if (caster === myStats) {
                    myStats.insight++;
                };
            });

            // Alter ATTACK
            myStats.replaceButton.atk = {
                "emoji": "<:2BATK:1373261622432501770>",
                "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    if (!myStats.duorevived) {
                        myStats.hp -= Math.floor(myStats.hp * 0.07);
                    } else {
                        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.hp * 0.07), {});
                    };
                    const secondhit = Math.min(0.5, 0.01 * Math.floor(((eStats.maxhp - eStats.hp) / eStats.maxhp) * 100));
                    const flair = atklist[myStats.atkcount];
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:2BATK:1373261622432501770> ${flair} **2B**`, { atkMultiplier: 0.8, magicDamage: true, combodmg: true });
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `<:2BATK:1373261622432501770> ${flair} **2B**`, { atkMultiplier: 0.1 + secondhit, magicDamage: true, combodmg: true });
                    myStats.atkcount++;
                    if (myStats.atkcount === 3) myStats.atkcount = 0;

                    return AbilityResponse.SUCCESS;
                },
            };

            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.atk += Math.floor(myStats.atk * Math.min(0.03 * myStats.insight, 0.24));

                // When below 50% HP: +7% lifesteal
                if (myStats.hp / myStats.maxhp < 0.5) {
                    myStats.selfheal[this.selfhealidx] += 0.07;

                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + 1, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                        myStats.selfheal[this.selfhealidx] -= 0.07;

                        return AbilityResponse.SUCCESS;
                    }));
                };


                // Enter HACKING mode
                if (myStats.insight >= 8 && !myStats.hacking) {
                    notice.push(`\n<:9SHack:1373261619924172940> 9S initiated hacking for **4** rounds`);
                    myStats.insight -= 8;
                    myStats.hacking = true;
                    if ((eStats.hp / eStats.maxhp) > 0.5) {
                        let bonus = Math.min(0.3, Math.abs((myStats.hp / myStats.maxhp) - (eStats.hp / eStats.maxhp)));
                        myStats.critbonus = Math.max(myStats.critbonus, bonus);
                    } else {
                        eStats.def -= Math.floor(Math.min(eStats.def * 0.25, 660));
                    };

                    // Hacking long term effects
                    myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                        if ((eStats.hp / eStats.maxhp) > 0.5) {
                            let bonus = Math.min(0.3, Math.abs((myStats.hp / myStats.maxhp) - (eStats.hp / eStats.maxhp)));
                            myStats.critbonus = Math.max(myStats.critbonus, bonus);
                        } else {
                            eStats.def -= Math.floor(Math.min(eStats.def * 0.25, 660));
                        };

                        return AbilityResponse.SUCCESS;
                    }, domainLast));

                    // Exit HACKING mode
                    myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + domainLast, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                        myStats.hacking = false;
                        notice.push(`\n<:9SHack:1373261619924172940> 9S exited hacking`);

                        return AbilityResponse.SUCCESS;
                    }));
                };

                return AbilityResponse.SUCCESS;
            }, 9999));

            matchStats.on("noncrit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                if (caster === myStats && myStats.hacking === true) { // Lose 7% current HP when non-crit during hacking
                    myStats.hp -= Math.floor(myStats.hp * 0.07);
                };
            });

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.insight ??= 0;

            // Add prog programmes to allies
            let prog = pStats.proginfo;
            if (prog) {
                for (let i = 0; i < prog.length; i++) {
                    switch (prog[i]) {
                        case "a110":
                            notice.push("\n`⚙️` Pod has been equipped with programme : **Slow**.");
                            myStats.delayedBuffs.push(new delayedBuffs(0, async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {
                                if (matchStats.round % 2 === 0) {
                                    if (myStats.dodge < 0) myStats.dodge = 0;
                                    myStats.dodge += Math.min(0.2, Math.floor((myStats.maxhp - myStats.hp) / myStats.maxhp * 100) / 100);
                                };

                                return AbilityResponse.SUCCESS;
                            }, 9999));
                            break;
                        case "a120":
                            notice.push("\n`⚙️` Pod has been equipped with programme : **Repair**.");
                            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                                if (matchStats.round % 4 === 0) {
                                    myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                                        const heal = Math.floor(myStats.maxhp * 0.05);
                                        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, heal, {});

                                        return AbilityResponse.SUCCESS;
                                    }, 2));
                                };

                                return AbilityResponse.SUCCESS;
                            }, 9999));
                            break;
                        case "a140":
                            notice.push("\n`⚙️` Pod has been equipped with programme : **Gravity**.");
                            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                                if (matchStats.round % 4 === 0) {
                                    eStats.atk -= Math.floor(eStats.atk * 0.25);
                                    eStats.md -= Math.floor(eStats.md * 0.25);
                                    eStats.def -= Math.floor(Math.min(eStats.def * 0.25, 660));
                                    eStats.mr -= Math.floor(Math.min(eStats.mr * 0.25, 660));
                                };

                                return AbilityResponse.SUCCESS;
                            }, 9999));
                            break;
                        case "a170":
                            notice.push("\n`⚙️` Pod has been equipped with programme : **Scanner**.");
                            matchStats.lootm += 0.15;
                            matchStats.xpboost += 0.25;
                            myStats.insight++;
                            notice.push(`\n<:coins:1030580480782893197> Ultrasonic waves released...`);
                            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                                myStats.insight++;
                                myStats.atk += Math.floor(myStats.atk * Math.min(0.02 * myStats.insight, 0.16));
                                return AbilityResponse.SUCCESS;
                            }, 9999));
                            break;
                        case "r020":
                            notice.push("\n`⚙️` Pod has been equipped with programme : **Mirage**.");
                            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                                if (matchStats.round % 4 === 0) {
                                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, "`⚙️` Pod analyzed the foe! **Pod**", { atkMultiplier: 0.2, dodge: 0 });
                                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, "`⚙️` Pod analyzed the foe! **Pod**", { atkMultiplier: 0.2, dodge: 0 });
                                };

                                return AbilityResponse.SUCCESS;
                            }, 9999));
                            break;
                        default: notice.push(`\nFailed to connect to pod...`); break;
                    };
                };
            }

            return AbilityResponse.SUCCESS;
        },
    },
    // "23390": {
    //     usage: 5,
    //     used: 0,
    //     cost: 0,
    //     pause: 0,
    //     passivePause: 0,
    //     partyPause: 0,
    //     desc: "**Total Usage**: `5 (CD: 10) // 5 (CD: 4)`\nCost: `90 💧 // times used * 10% max HP`\nTimeout: `Yes // No`\n\nAs a martial arts prodigy, he is known as the 'Hero Hunter' even though he's a human, though behind his sadistic act is a misguided heart. Yet, despite the moniker, there's one hero he can never hunt.\n\nUpon dodging, he uses the opponent's momentum against themselves, reflecting **50%** of the DMG. It's possible to dodge and redirect active curse hits too (DoT excluded). Afterwards, he increases critical rate by **25%** for **2** rounds, before cutting down on the opponent's pressure points, dealing **30%** DMG and turning their movement sluggish, where they are unable to dodge for **5** rounds. The post-dodge effect can be triggered at most once every round.\n\nUtilizing his DEFEND, he attempts to learn the fighting style of the enemy. This increases his dodge rate by **100%** for that round, before converting any excess dodge rate to a critical DMG boost persisting for **5** rounds. This has a 5 round cooldown.\n\nHe evades the first **3** lethal hits (stackable). After evading any lethal hit, he has **+15%** critical rate, **+30%** critical damage and **1x** [Rising Surge].\n\nHis active depends on which skin he is wearing.\nIf Garou has the Monster skin, he activates **Wild Instincts** which grants **1x** [Rising Surge] and deals **150%** DMG, increased by **5%** for every **1x** [Rising Surge], up to **250%**. Moreover, he gains **1x** additional [Rising Surge] if any redirection is triggered within **4** rounds.\n\nIf Garou has the Cosmic skin, he activates **God Killer** which upon first use deals **70%** undodgeable DMG, and every attack that connected will grant the user **5%** of their missing HP back, at the cost of lowering their DEF/MR by the same amount (Final DEF/MR won't be lower than 1000).\nFor every use, he evolves stronger, increasing ATK by **7%** and deals **150%** DMG also gaining **1x** [Rising Surge]\n\n[Rising Surge] : For each stack, Cosmic Garou's normal ATK hit **1** more time (up to **3** hits each round at max). Each excess stack after **3x** instead grants Garou **4%** DMG mitigation that round\n\nWhen in a party, he absorbs **3** instances of incoming damage (including curse damage, if any) when allies fall under **30%** HP. For every attack absorbed, allies regenerate **5** mana and **5%** of their missing HP. This can only occur once every **5** rounds.",
    //     shortdesc: "**Uses**: `5 // 5`\n**Cooldown**: `10 rounds // 4 rounds`\n**Cost**: `90 💧 // times used * 10% max HP`\n**Timeout**: `Yes // No`\n**Role**: `DPS (Counter, Critical)`\n\n**Passive**:\n- Redirects **50%** DMG upon dodging (includes curse hits, excludes DoT)\n- After dodging: **+25%** crit rate for **2 rounds**, deals **30%** DMG, disables dodge for **5 rounds**\n- Using DEFEND: **+100%** dodge rate; excess converted to crit DMG for **5 rounds** (*CD: 5 rounds*)\n- Evades first **3** lethal hits (stackable); each grants **+15%** crit rate, **+30%** crit DMG, and **1x** [Rising Surge]\n- Flees when facing **Saitama**\n\n**Active**:\n- *Monster Skin*:\n  - Grants **+1x Rising Surge**, deals **150% DMG**, increased by **+5% per Rising Surge** (up to **250%**)\n  - Gains **+1x Rising Surge** if redirection is triggered within **4 rounds**\n\n- *Cosmic Skin*:\n  - Alters ATTACK: deals **70% undodgeable DMG**, heals **5% missing HP per hit**, reduces **DEF/MR** by the same amount (not below 1000)\n  - Each use: **+7% ATK**, deals **150% DMG**, and gains **+1x Rising Surge**\n\n**Rising Surge**:\nEach stack gives Cosmic Garou **+1 hit** to normal ATK (**max 3 hits/round**)\nExtra stacks grant Garou **+4% DMG mitigation** for that round\n\n**Party**:\nWhen allies fall below **30% HP**, absorbs **3 hits** (including curse)\nEach hit restores **5 mana** & **5% missing HP**\n(*Cooldown: 5 rounds*)",
    //     ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
    //         //Garou EX

    //         //Active (I) : Wild Instincts (Monster skin)
    //         if (myStats.equippedSkin === 113) { // Random number for now until monster skin is added

    //             if (this.pause > matchStats.round) {
    //                 myStats.sm += this.cost;
    //                 matchStats.turn = matchStats.turnSkill ? 0 : 1;
    //                 matchStats.sendWarning({ content: `Monster Garou needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
    //                 this.used--;
    //                 return AbilityResponse.FAILURE;
    //             };
    //             if (myStats.sm < 90) {
    //                 matchStats.sendWarning({ content: `You don't have enough mana! (**${myStats.sm}**/90\\💧)`, ephemeral: true });
    //                 return AbilityResponse.FAILURE;
    //             };

    //             myStats.sm -= 90;
    //             this.pause = matchStats.round + 10;

    //             myStats.risingSurge += 1;

    //             dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, ``, { atkMultiplier: 1.5 + (Math.min(myStats.risingSurge * 0.05, 1)) });

    //             // Grants x1 rising surge if redirection occurs within 4 rounds
    //             if (myStats.redirectionLastTriggered > matchStats.round - 4) {
    //                 myStats.risingSurge += 1;
    //             };
    //         };

    //         //Active (II): God Killer (Cosmic skin)
    //         if (myStats.equippedSkin === 112) {
    //             if (this.pause > matchStats.round) {
    //                 myStats.sm += this.cost;
    //                 matchStats.turn = matchStats.turnSkill ? 0 : 1;
    //                 matchStats.sendWarning({ content: `Cosmic Garou needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
    //                 this.used--;
    //                 return AbilityResponse.FAILURE;
    //             };

    //             // Cost: times used * 10% of max hp
    //             myStats.hp -= Math.floor(myStats.maxhp * (this.used * 0.10));

    //             this.pause = matchStats.round + 4;

    //             //Altered ATK
    //             const godKiller = () => {
    //                 const amountHealed = Math.floor((myStats.maxhp - myStats.hp) * 0.05);
    //                 dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 0.7, dodge: false });

    //                 addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, amountHealed, {});

    //                 // DEF / MR shred by amount healed
    //                 mybuff.def.push(new buffInfo("+", -amountHealed, 9999));
    //                 mybuff.mr.push(new buffInfo("+", -amountHealed, 9999));

    //                 myStats.def = Math.max(myStats.def - amountHealed, 1000);
    //                 myStats.mr = Math.max(myStats.mr - amountHealed, 1000);

    //             };
    //             // First use
    //             if (this.used === 1) {
    //                 myStats.replaceButton.atk = {
    //                     "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
    //                         godKiller();
    //                         //Rising Surge
    //                         if (myStats.risingSurge <= 3) {
    //                             for (let i = 0; i < myStats.risingSurge; i++) {
    //                                 godKiller();
    //                             }
    //                         }
    //                         return AbilityResponse.SUCCESS;
    //                     },
    //                 };
    //             };

    //             // Every use
    //             mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * 0.07), 9999));
    //             dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ **${char.name}**`, { atkMultiplier: 1.5 });
    //             myStats.risingSurge += 1;

    //             //Rising Surge Excess stacks
    //             if (myStats.risingSurge > 3) {
    //                 const excessStacks = myStats.risingSurge - 3;

    //                 myStats.damageReduction += (excessStacks * 0.04);
    //             };

    //         };
    //         return AbilityResponse.SUCCESS;
    //     },
    //     passive: async function (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
    //         const stats = await getUserSchema(matchStats.interaction.user.id);
    //         myStats.equippedSkin ??= stats?.char_skin[char.id];

    //         // Encounters Saitama
    //         if (enemy.name === "Saitama") {
    //             myStats.hp = 0;
    //             myStats.rev = 0;
    //             notice.push(`\n✨ Is he even human?`);
    //             return AbilityResponse.SUCCESS;
    //         };

    //         myStats.risingSurge ??= 0;
    //         myStats.redirectionLastTriggered ??= 0;
    //         matchStats.on("dodge", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {

    //             if (caster === eStats) {

    //                 if (matchStats.round > myStats.redirectionLastTriggered) {
    //                     myStats.redirectionLastTriggered = matchStats.round;

    //                     // Deal 30% DMG
    //                     dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨Garou`, { atkMultiplier: 0.30 });

    //                     // 15% CR increase for 2 rounds
    //                     mybuff.cr.push(new buffInfo("+", 0.15, 2));
    //                 };
    //             };

    //         });

    //         matchStats.on("DEF", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
    //             if (caster === myStats) {

    //                 if (matchStats.round >= this.passivePause) {
    //                     // Set dodge to 100% 
    //                     myStats.dodge = 1;

    //                     this.passivePause = matchStats.round + 5; // 5 round cooldown
    //                 };
    //             };
    //         });

    //         return AbilityResponse.SUCCESS;
    //     },
    //     party: async function (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) {

    //         myStats.garouAbsorbedHits ??= 0;

    //         // Absorbs enemy hits if allies under 30% hp 
    //         matchStats.on("attack", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
    //             if (caster === eStats) {
    //                 // Checks if cooldown is over to reactivate
    //                 if (matchStats.round >= this.partyPause) {
    //                     // Allies hp under 30%
    //                     if (myStats.hp / myStats.maxhp < 0.3) {
    //                         myStats.garouAbsorbedHits = 0; // Reset hit counter
    //                         this.partyPause = matchStats.round + 5; // 5 round cooldown
    //                     };
    //                 };

    //                 // Absorbed DMG 
    //                 if (myStats.garouAbsorbedHits < 3 && myStats.hp / myStats.maxhp < 0.3) {
    //                     notice.push(`\n✨ Garou absorbed the DMG!`);
    //                     myStats.hp += options.damage;
    //                     addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.05), {});
    //                     myStats.sm += 5;
    //                     myStats.garouAbsorbedHits++;
    //                 };
    //             };
    //         });
    //         return AbilityResponse.SUCCESS;
    //     },
    // },
    "24798": {
        usage: 9999,
        used: 0,
        cost: 0,
        pause: -11,
        desc: "**Total Usage**: `Unlimited (CD: 10)`\n**Cost**: `35% current HP`\n**Timeout**: `false`\n**Role**: `DPS (Non-critical)`\n\nBuilt out of high-energy pure crystals, Shorekeeper acts as a vessel where data filled with grief, chaos and decay flow through her for analysis. She repairs her scars with new crystals, as she witnesses the tragedies of humanity.\n\nHer ATTACK is altered to __Origin Calculus__, interpreting the reverberations. She deals **80%** DMG. For every `Flare Stare Butterfly` summoned, this hit’s damage scaling is increased by **6%**. If the hit is non-critical, gains **3x** `Core`. When she has **5x** or more `Core`, she immediately follows up with __Astral Chord__.\n\nAfter using DEFEND, she follows up with  __Astral Chord__. For every **5** existing `Core`, transforms them into **1x** `Flare Stare Butterfly` (Up to 10). She then casts Suction, where for every `Flare Stare Butterfly` on-field, the enemy has **-2%** critical rate and **-2%** DEF & MR for **3** rounds (Max 1.5x DMG, each shred calculated independently), meanwhile boosting her DEF & MR by **20** for **3** rounds, up to **200**.\n\nConsuming **35%** of her current HP, she casts her active, __End Loop__, where she summons a domain of Stellarealm for **10** rounds. During this period, She restores **5%** lost HP every round and has **+3%** ATK & MD for every **1x** `Flare Stare Butterfly` owned. Moreover, attacks will *benefit from the critical damage scaling* even if they don’t land a critical strike\n\nRight before exiting the domain, she increases critical DMG by **100%** for **1** round, before giving a final ordination.\n- [Default] : Deals **70%** DMG\n- [5+ Butterflies] : Deals **210%** undodgeable DMG + restores **25%** max HP\n- [10 Butterflies] : Deals **300%** undodgeable DMG + restores **50%** max HP + Increases dodge rate by **100%** for **1** round\n\nIn a party, whenever the ally lands a non-critical hit, they gain **1.5%** dodge rate, up to **15%**. Moreover, allies evade the first **2** lethal attacks and restore **15%** max HP right afterwards.",
        shortdesc: "**Uses**: `Unlimited`\n**Cooldown**: `10 rounds`\n**Cost**: `35% current HP`\n**Timeout**: `No`\n**Role**: `DPS (Non-critical)`\n\n__**Passive**__\n- After using DEF, follows up with “Astral Chord”\n\nATTACK is altered:\n- Deals **80%** DMG\n- For each `Butterfly` summoned, DMG scaling is increased by **6%**\n- If this hit is non-critical, grant **3x** additional `Core`\n- If amount of `Core` reaches **5** or more, follows up with “Astral Chord”\n\n“Astral Chord”:\n- For every **5** existing cores, transforms them to **1x** `Butterfly` (Up to 10)\n- For every `Butterfly` on-field:\n> - Reduces enemy’s critical rate by **2%** for **3** rounds\n> - Reduces enemy’s DEF/MR by **2%** for **3** rounds (Max 1.5x DMG, each shred calculated independently)\n> - Increases DEF/MR by **20** (Up to 200) for **3** rounds\n\n__**Active**__ (✨)\nCreates a domain of Stellarealm for **10** rounds, during this period:\n- Restores **5%** missing HP every round\n- Boosts ATK & MD by **3%** for every **1x** `Butterfly` owned\n- All attacks **will benefit from the critical damage scaling** even if they don’t land a critical strike\n\nRight before exiting the domain:\n- Increases critical DMG by **100%** for **1** round\n- Grants additional effects based off `Butterfly` owned\n> - [Default] : Deals **70%** DMG\n> - [5+ Butterflies] : Deals **210%** undodgeable DMG + restores **25%** max HP\n> - [10 Butterflies] : Deals **300%** undodgeable DMG + restores **50%** max HP + Increases dodge rate by **100%** for **1** round\n- The hit aforementioned will not reset combos\n\n__**Party**__ (👥):\nAfter the ally lands a non-critical strike: Increases ally’s dodge rate by **1.5%** (Up to 15%)\n- Allies evade the first **2** lethal attacks and restores **15%** max HP (Up to 2 times)",
        ability: async function (myStats, myStatsFixed, eStats, eStatsFixed, mybuff, ebuff, char, enemy, matchStats, notice, embed, message, ...list) {
            // Shorekeeper EX
            matchStats.turn = matchStats.turnSkill ? 0 : 1;

            if (this.pause > matchStats.round) {
                //myStats.sm += this.cost;
                matchStats.interaction.followUp({ content: `**${char.name}** needs to rest ${this.pause - matchStats.round} more ${this.pause - matchStats.round === 1 ? "round" : "rounds"}`, ephemeral: true });
                this.used--;
                return AbilityResponse.FAILURE;
            };
            this.pause = matchStats.round + 10;

            const domainLast = 10;

            myStats.shorekeeperUsedActive = true;
            myStats.hp -= Math.floor(myStats.hp * 0.35);

            // Enter Stellarealm

            // Increase ATK by 3% for every butterfly
            const atkbuff = 0.03 * myStats.butterfly;
            myStats.atk += Math.floor(myStats.atk * atkbuff);
            myStats.md += Math.floor(myStats.md * atkbuff);
            mybuff.atk.push(new buffInfo("+", Math.floor(myStats.atk * atkbuff), domainLast));
            mybuff.md.push(new buffInfo("+", Math.floor(myStats.md * atkbuff), domainLast));

            // Restore 5% missing HP every round
            addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.05), {});
            myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor((myStats.maxhp - myStats.hp) * 0.05), {});

                return AbilityResponse.SUCCESS;
            }, domainLast));

            // Exit Stellarealm
            myStats.delayedBuffs.push(new delayedBuffs(matchStats.round + domainLast, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                myStats.cd += 1;

                // Activates additional effects based off Butterfly
                switch (true) {
                    case myStats.butterfly >= 10:
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ *Rectify!* **${char.name}** dealt`, { atkMultiplier: 5, magicDamage: true, dodge: false, combodmg: true });
                        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.5), {});
                        myStats.dodge = 1;
                        break;
                    case myStats.butterfly >= 5:
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ *Perish!* **${char.name}** dealt`, { atkMultiplier: 2.5, magicDamage: true, dodge: false, combodmg: true });
                        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.25), {});
                        break;
                    default:
                        dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `✨ *Ordained!* **${char.name}** dealt`, { atkMultiplier: 1, magicDamage: true, dodge: false, combodmg: true });
                        break;
                };

                myStats.shorekeeperUsedActive = false;

                return AbilityResponse.SUCCESS;
            }));

            notice.push(`\n✨ **${char.name}** summoned the Domain of Stellarealm for ${domainLast} rounds!`);

            return AbilityResponse.SUCCESS;
        },
        passive: async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            myStats.core ??= 0;
            myStats.butterfly ??= 0;
            myStats.astraldefcap = 200;
            myStats.shorekeeperUsedActive = false;

            // Alter DEFEND
            const astralchord = () => {

                // Transform Core -> Butterfly (Up to 10)
                while (myStats.core >= 7) {
                    myStats.core -= 7;
                    if (myStats.butterfly < 10) {
                        myStats.butterfly++;
                    }
                };
                // Suction - debuffs for 3 turns
                const def_debuff = 0.02 * myStats.butterfly;
                eStats.cr -= def_debuff;
                if (eStats.cr < 0) eStats.cr = 0;
                eStats.def -= Math.min(495, Math.floor(eStats.def * def_debuff));
                eStats.mr -= Math.min(495, Math.floor(eStats.mr * def_debuff));

                ebuff.def.push(new buffInfo("+", -Math.min(495, Math.floor(eStats.def * def_debuff)), 2));
                ebuff.mr.push(new buffInfo("+", -Math.min(495, Math.floor(eStats.mr * def_debuff)), 2));
                ebuff.cr.push(new buffInfo("=", Math.min(0, eStats.cr - def_debuff), 2));

                // Increase DEF/MR up to 200
                if (myStats.astraldefcap > 0) {
                    const defmrboost = Math.min(20 * myStats.butterfly, myStats.astraldefcap);
                    myStats.def += defmrboost;
                    myStats.mr += defmrboost;
                    mybuff.def.push(new buffInfo("+", defmrboost, 2));
                    mybuff.mr.push(new buffInfo("+", defmrboost, 2));
                    myStats.astraldefcap -= defmrboost;
                };
                notice.push(`\n🦋 **${char.name}** decreased the enemy's DEF & MR by ${Math.floor(def_debuff * 100)}%`);
            };

            // Alter ATTACK
            myStats.replaceButton.atk = {
                "emoji": "🫧",
                "run": async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
                    const buff_multiplier = 0.07 * myStats.butterfly;
                    dealDamage(eStats, myStats, ebuff, mybuff, matchStats, notice, `🫧 **${char.name}** used Origin Calculus! She`, { atkMultiplier: 0.8 + buff_multiplier, magicDamage: true, combodmg: true, normalATK: true });

                    return AbilityResponse.SUCCESS;
                },
            };

            // Gain 3x Core when ATTACK doesn't crit
            matchStats.on("noncrit", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
                if (caster === myStats && options.normalATK) myStats.core += 3;
                if (myStats.core >= 7) astralchord();
            });

            // After DEFEND, uses astralchord
            matchStats.on("DEF", ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }: any) => {
                if (caster === myStats) astralchord();
            });

            return AbilityResponse.SUCCESS;
        },
        party: async (pStats, myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {

            myStats.evadeDeathStrike ??= 0;
            myStats.evadeDeathStrike += 2;

            // Upon death evasion, restores 15% max HP (up to 2 times)
            matchStats.on("deathEvade", {
                maxUsage: 2,
                callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                    if (caster === myStats) {
                        addHeal(myStats, eStats, myStats, mybuff, ebuff, matchStats, notice, ``, Math.floor(myStats.maxhp * 0.15), {});
                        return true;
                    }
                },
            });

            matchStats.on("noncrit", {
                maxUsage: 10,
                callback: ({ trigger, caster, target, casterBuff, targetBuff, matchStats, options }) => {
                    if (caster == myStats) {
                        myStats.dodge += 0.015;
                        mybuff.dodge.push(new buffInfo("+", 0.015, 9999));
                        if (myStats.dodge > 1) myStats.dodge = 1;
                    }
                }
            });
            // Removed party ability after discussion with Taskalot:
            // Allies cannot fall below 0% dodge rate. Increases dodge rate by 2% for every 5% missing HP, up to 20%
            // if (myStats.dodge < 0) myStats.dodge = 0;
            // const dodgebuff = 0.02 * Math.floor((myStats.maxhp - myStats.hp) / myStats.maxhp);
            // myStats.dodge += Math.min(dodgebuff, 0.2);

            // myStats.delayedBuffs.push(new delayedBuffs(0, async (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            // if (myStats.dodge < 0) myStats.dodge = 0;
            // const dodgebuff = 0.02 * Math.floor((myStats.maxhp - myStats.hp) / myStats.maxhp);
            // myStats.dodge += Math.min(dodgebuff, 0.2);

            // return AbilityResponse.SUCCESS;
            // }, 9999));

            return AbilityResponse.SUCCESS;
        },
    },
};
