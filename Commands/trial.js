/* eslint-disable no-unused-vars */
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } from "discord.js";
import { db, query } from "../db_handler";
import { abilities } from "../Modules/abilities";
import { achievements } from "../Modules/achievements";
import { classes } from "../Modules/classes";
import { curses } from "../Modules/curses";
import { skills } from "../Modules/skills";
import { items } from "../Modules/items";
import { characters } from "../Modules/chars";
import { dailies } from "../Modules/dailyQuests";
import { getDetailedStats, classLevelToXP, search, searchClass, customEmojis, dealDamage } from "../Modules/functions";
import Avalon from "../Modules/avalon";
import buffInfo from "../Modules/buffs";
import _ from 'lodash';

const dungeonInProgress = new Set();
const luminousImages = ["https://i.ibb.co/QpyDLjX/l1.png", "https://i.ibb.co/MfKkZkH/l2.png", "https://i.ibb.co/Hqr6Jgx/l3.png", "https://i.ibb.co/hsbmQRM/l4.png", "https://i.ibb.co/FqmT9vx/l5.png", "https://i.ibb.co/bdjhmCb/l6.png", "https://i.ibb.co/s3fq9Cy/l7.png", "https://i.ibb.co/VTwQTvB/l8.png", "https://i.ibb.co/23xd7cL/l9.png"];

class skillInfo {
    constructor(id, cost, skill, passive = () => { }, list = []) {
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

module.exports = {
    name: 'trial-old',
    description: 'trial',
    execute(interaction) {

        let charChoice = interaction.options.getString('character');
        let classChoice = interaction.options.getString('class');
        let characterLevel = interaction.options.getInteger('character-level') || 80;
        let classLevel = interaction.options.getInteger('class-level') || 40;

        if (classLevel < 1) classLevel = 40;
        if (characterLevel < 1) characterLevel = 80;
        if (classLevel > 10000) return interaction.reply({ content: "Class level can't be set higher than 10000", ephemeral: true });
        if (characterLevel > 1000) return interaction.reply({ content: "Character level can't be set higher than 1000", ephemeral: true });

        db.serialize(async () => {

            let stats = await query(`SELECT users.id, users.class, users.coins, users.bank, users.battlechar, users.animationdelay, users.premium, users.shield_slot, characters.chars, characters.ref, users.level, users.equipment, dungeon.floors, dungeon.'limit', dungeon.classes, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${interaction.user.id}`);
            stats = { id: stats[0].id, class: stats[0].class, coins: stats[0].coins, bank: stats[0].bank, battlechar: stats[0].battlechar, animationdelay: stats[0].animationdelay, premium: stats[0].premium, shield_slot: stats[0].shield_slot, chars: JSON.parse(stats[0].chars), ref: JSON.parse(stats[0].ref), level: stats[0].level, equipment: JSON.parse(stats[0].equipment), limit: stats[0].limit, floors: JSON.parse(stats[0].floors), classes: JSON.parse(stats[0].classes), classlevels: JSON.parse(stats[0].classlevels) };

            if (interaction.commandName === "trial" && charChoice === null && classChoice === null) return interaction.reply("Here you can try out all abilities and classes. Try `/trial <char>`, `/trial <class>` or `/trial <char> <class>`");
            if (!stats.chars.includes(stats.battlechar)) return interaction.reply("You need to choose a battle character first. Use `/select <char>` to choose one.");

            let ch, cl;
            if (interaction.commandName === "trial") {
                ch = charChoice !== null ? search(charChoice, stats.chars, interaction) : false;
                if (!ch?.id && ch.id !== 0 && charChoice !== null) return;
                cl = classChoice !== null ? searchClass(classChoice, interaction) : false;
                if (!cl?.id && cl.id !== 0 && classChoice !== null) return;
            };

            // Set up restrictions
            if (dungeonInProgress.has(stats.id)) return interaction.reply("You already have a run in progress, please finish it before attempting to start a new round.");
            dungeonInProgress.add(stats.id);
            const userTimeout = setTimeout(() => dungeonInProgress.delete(stats.id), 120000);

            // User stats
            let myChar, myStats, myStatsC, myClass, skill, myAbility;
            if (interaction.commandName === "trial") {
                // Allow all classes
                if (cl) {
                    stats.class = cl.id;
                    stats.classlevels = Array(classes.length).fill(classLevelToXP(classLevel));
                };
                stats.level = characterLevel;

                myChar = ch || characters[stats.battlechar];
                myStats = await getDetailedStats(myChar.id, stats, stats.classlevels);

                myStats.thumbnail = myChar.image;

                myStatsC = { ...myStats };
                myClass = cl || false;
                skill = myClass ? _.cloneDeep(skills[myClass.id]) : false;
                myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : false;
            } else {
                myChar = characters[stats.battlechar];
                myStats = await getDetailedStats(myChar.id, stats, stats.classlevels);

                myStats.thumbnail = myChar.image;

                myStatsC = { ...myStats };
                myClass = myStats.class !== -1 ? classes[myStats.class] : false;
                skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : false;
                myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : false;
            };

            // Enemy Stats
            let enemy = { "name": "Luminous", "image": luminousImages[Math.floor(Math.random() * luminousImages.length)] };
            const curseRar = curses.filter((e) => e.tier);
            const curse = curseRar[Math.floor(Math.random() * curseRar.length)];
            let eAbility =
                new skillInfo(0, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user = interaction.user.id, ...list) => {
                    let dmg = Math.floor(((2 * eStats.atk) * Math.pow(0.99895, myStats.def)) * (1 - (0.2 * Math.random())));
                    myStats.hp -= dmg;
                    if (myStats.hp < 0) myStats.hp = 0;
                    eStats.sm -= 50;
                    matchStats.turn = 0;
                    notice.push(`\n✨ **${enemy.name}** dealt **${dmg}** damage!`);
                }, () => { }, [5, "Luminous deals 200% damage"]);

            let eStats = {
                "name": enemy.name,
                "hp": Math.floor(myStats.hp * 1.16),
                "maxhp": Math.floor(myStats.hp * 1.16),
                "atk": Math.floor(myStats.atk * 1.16),
                "def": Math.floor(myStats.def),
                "ep": Math.floor(((Math.floor(myStats.hp * 1.16) / Math.pow(0.99895, Math.floor(myStats.def))) / (100 / Math.floor(myStats.atk * 1.16))) * 100) / 100,
                "md": Math.floor(myStats.atk * 1.16),
                "mr": Math.floor(myStats.def),
                "cr": 0.18,
                "cd": 1.25,
                "td": Math.floor(myStats.atk * 1.16),
                "br": 0.2,
                "agility": 80,
                "dodge": 0.1,
                "mana": 80,
                "mg": 15,
                "sm": 20,
                "rev": 0,
                "revhp": 0.5,
            };
            eStats.image = enemy.image;
            let eStatsC = { ...eStats };

            let difficulty = Avalon.getDifficulty(myStats.ep / eStats.ep);

            const aDelay = stats.premium ? stats.animationdelay : 1200;

            let buffs = Avalon.getBuffs();
            let eBuffs = Avalon.getBuffs();

            function matchResult(r) {
                // Clear restrictions
                clearTimeout(userTimeout);
                dungeonInProgress.delete(stats.id);

                let desc = "";
                if (r === "w") {
                    desc = `<:stars_v2:917023655840591963> **${myChar.name}** won! <:stars_v2:917023655840591963>`;
                    if (interaction.commandName === "arena") {
                        desc += "\n*Merlin... Everyone... I'm so...\nsorry...*";
                        // Achievements
                        achievements[33].check(interaction);
                    };
                };
                if (r === "l") {
                    desc = `💀 **${myChar.name}** lost 💀`;
                    if (interaction.commandName === "arena") desc += "\n*Until the Selection is made true,\nI shall not fall.*";
                };

                // Daily Quests
                dailies[5].update(interaction);

                const Embed = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setThumbnail(myStatsC.thumbnail)
                    .setTitle(interaction.commandName === "arena" ? "Battle Arena" : `${ch ? "Character" : "Class"} Trial`)
                    .setDescription(desc)
                    .setFooter({ text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" });
                return Embed;
            };

            let matchStats = Avalon.getMatchStats(interaction);
            let notice = ["", "", "", ""];

            // Apply Passives
            if (skill && myChar.id !== 4767) skill._passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
            if (myAbility?.passive) myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            if (myStats.weapon !== -1) items[myStats.weapon]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            if (myStats.shieldid) items[myStats.shieldid]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            if (myStats.helmet && items?.[myStats.helmet].setname === items?.[myStats.cuirass]?.setname && items?.[myStats.helmet].setname === items?.[myStats.gloves]?.setname && items?.[myStats.helmet].setname === items?.[myStats.boots]?.setname) items[myStats.boots]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

            const ATK_EMOJI = myStatsC.replaceButton?.atk?.emoji || '⚔️',
                DEF_EMOJI = myStatsC.replaceButton?.def?.emoji || '🛡️',
                ABILITY_EMOJI = myStatsC.replaceButton?.ability?.emoji || '✨',
                SKILL_EMOJI = myStatsC.replaceButton?.skill?.emoji || '⚜️',
                SKIP_EMOJI = myStatsC.replaceButton?.skip?.emoji || '⏩';

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle('Secondary'),
                    new ButtonBuilder().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle('Secondary'),
                    new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle('Secondary').setDisabled((myAbility && "ability" in myAbility) ? false : true),
                    new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle('Secondary').setDisabled(myStats.class !== -1 ? false : true),
                    new ButtonBuilder().setCustomId('SKIP').setEmoji(SKIP_EMOJI).setStyle('Secondary'),
                );

            async function newFight() {
                let timestart = new Date().getTime();
                let result = await new Promise((resolve, rejects) => {
                    const Embed = new EmbedBuilder()
                        .setColor(0xbbffff)
                        .setThumbnail(myStatsC.thumbnail)
                        .setFooter({ text: `Enemy EP: ${eStatsC.ep} | round 1 | time left: 120s` })
                        .setTitle(interaction.commandName === "arena" ? "Battle Arena" : `${ch ? "Character" : "Class"} Trial`)
                        .setDescription(`${interaction.commandName === "arena" ? "I accept your challenge" : `Testing ${ch ? myChar.name : myClass.name}`}\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}\\💖${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStats.hp, eStatsC.sm / eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStats.hp}\\💖${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStats.hp, myStatsC.sm / myStatsC.mana)}\n${Avalon.padStats(myStatsC)}`)
                        .setImage(enemy.image);
                    let interactionType = interaction.commandName === "trial" ? interaction : interaction.channel;
                    let replyType = interaction.commandName === "trial" ? "reply" : "send";
                    interactionType[replyType]({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {

                        const atk = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ATK", componentType: ComponentType.Button, time: 120000 });
                        const def = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "DEF", componentType: ComponentType.Button, time: 120000 });
                        const ability = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ABILITY", componentType: ComponentType.Button, time: 120000 });
                        const cskill = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKILL", componentType: ComponentType.Button, time: 120000 });
                        const skip = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKIP", componentType: ComponentType.Button, time: 120000 });
                        matchStats.collector = { "atk": atk, "def": def, "ability": ability, "cskill": cskill, "skip": skip };

                        // Use passives
                        if (myChar.id !== 4767) curse.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed);

                        async function editEmbed() {
                            Embed.setDescription(`${interaction.commandName === "arena" ? "I accept your challenge" : `Testing ${ch ? myChar.name : myClass.name}`}\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStatsC.maxhp, eStatsC.sm / eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-4).join("")}`);
                            Embed.setFooter({ text: `Enemy EP: ${eStatsC.ep} | round ${matchStats.round} | time left: ${120 + Math.floor((timestart - new Date().getTime()) / 1000)}s` });
                            await msg.edit({ embeds: [Embed] });
                        };

                        function minionDefeated(side) {
                            if (side === "my") {
                                myStatsC = { ...matchStats.myStatsCC };
                                matchStats.currentCharacter = 0;
                                Embed.setThumbnail(myStatsC.thumbnail);
                                startNextRound();
                            } else {
                                eStatsC = { ...matchStats.eStatsCC };
                                matchStats.currentOpponent = 0;
                                Embed.setImage(enemy.image);
                                attack();
                            };
                        };

                        function endMatch(wORl) {
                            if (matchStats.ended) return;
                            else matchStats.ended = true;

                            atk.stop(), def.stop(), skip?.stop(), ability?.stop(), cskill?.stop();
                            if (wORl === "l") notice.push(`\n💀 **${myChar.name}** lost`);
                            else notice.push(`\n🎉 **${myChar.name}** won`);
                            editEmbed();
                            matchStats.turn = 1;
                            resolve(matchResult(wORl));
                        };

                        function startNextRound() {
                            if (matchStats.round === matchStats.roundCheck) return;
                            matchStats.roundCheck = matchStats.round;
                            if (matchStats.currentCharacter || matchStats.currentOpponent) return;

                            // Consume Mana
                            Avalon.consumeActiveMana(matchStats, myStatsC, buffs, myChar, notice, Embed, myStatsC.thumbnail);

                            // Reset Buffs
                            if (matchStats.currentCharacter === 0) myStatsC.atk = myStats.atk, myStatsC.md = myStats.md, myStatsC.def = myStats.def, myStatsC.mr = myStats.mr, myStatsC.cd = myStats.cd, myStatsC.cr = myStats.cr, myStatsC.dodge = myStats.dodge, myStatsC.br = myStats.br, myStatsC.mg = myStats.mg;
                            if (matchStats.currentOpponent === 0) eStatsC.atk = eStats.atk, eStatsC.md = eStats.md, eStatsC.def = eStats.def, eStatsC.mr = eStats.mr, eStatsC.cd = eStats.cd, eStatsC.cr = eStats.cr, eStatsC.dodge = eStats.dodge, eStatsC.br = eStats.br, eStatsC.mg = eStats.mg;

                            // Apply Buffs
                            if (matchStats.currentCharacter === 0) Avalon.applyBuffs(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice);
                            if (matchStats.currentOpponent === 0) Avalon.applyBuffs(eStatsC, eStatsC, eBuffs, buffs, matchStats, notice);

                            // Fix Stats
                            if (myStatsC.hp > myStatsC.maxhp) myStatsC.hp = myStatsC.maxhp;
                            else if (myStatsC.hp < 0) myStatsC.hp = 0;
                            else myStatsC.hp = Math.floor(myStatsC.hp);
                            if (eStatsC.hp > eStatsC.maxhp) eStatsC.hp = eStatsC.maxhp;
                            else if (eStatsC.hp < 0) eStatsC.hp = 0;
                            else eStatsC.hp = Math.floor(eStatsC.hp);

                            // Check and run delayed buffs
                            if (matchStats.currentCharacter === 0) {
                                for (let i = myStatsC.delayedBuffs.length - 1; i >= 0; i--) {
                                    if (myStatsC.delayedBuffs[i].round <= matchStats.round) {
                                        myStatsC.delayedBuffs[i].run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                        if (myStatsC.delayedBuffs[i].last <= 1 || myStatsC.delayedBuffs[i].used >= myStatsC.delayedBuffs[i].usage) {
                                            myStatsC.delayedBuffs.splice(i, 1);
                                        } else {
                                            myStatsC.delayedBuffs[i].decrement();
                                        };
                                    };
                                };
                            };

                            Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                        };

                        function attack() {
                            if (matchStats.turn === 1) return;
                            if (eStatsC.timeFrozen) {
                                if (eStatsC.frozenMessage) notice.push(`\n✨ **${enemy.name}** ${eStatsC.frozenMessage}.`);
                                if (!(matchStats.playerPausingRounds > 0)) matchStats.turn = 1;
                                matchStats.turn = 1;
                                matchStats.round++;
                                startNextRound();
                                editEmbed();
                                if (matchStats.playerPausingRounds > 0) {
                                    matchStats.playerPausingRounds--;
                                    attack();
                                };
                            } else {
                                setTimeout(() => {
                                    if (matchStats.blockAbilities-- <= 0 && myChar.id !== 4767 && eStatsC.sm >= curse.cost && Math.random() < 0.3) {
                                        curse.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                        eStatsC.sm -= curse.cost;
                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        attack();
                                    } else if (matchStats.blockAbilities < 0 && myChar.id !== 4767 && eAbility && eStatsC.sm >= eAbility.cost && Math.random() < 0.5) {
                                        eAbility.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        attack();
                                    } else {
                                        dealDamage(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, `⚔️ **${enemy.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        if (!(matchStats.playerPausingRounds > 0)) matchStats.turn = 1;
                                        matchStats.turn = 1;
                                        matchStats.round++;
                                        startNextRound();
                                        editEmbed();
                                        if (matchStats.playerPausingRounds > 0) {
                                            matchStats.playerPausingRounds--;
                                            attack();
                                        };
                                    };
                                    if (matchStats.counter > 0) matchStats.counter--;
                                }, aDelay);
                            };
                        };

                        if (notice.length > 4) {
                            Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            editEmbed();
                        };

                        atk.on('collect', async r => {
                            if (matchStats.turn === 1) {
                                matchStats.turn = 0;

                                // If attack was replaced
                                if ("atk" in myStatsC.replaceButton) {
                                    myStatsC.replaceButton.atk.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    if (matchStats.turn === 0) attack();
                                }

                                // Normal attack
                                else {
                                    dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { block: true, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                    if (matchStats.twinshot > Math.random()) setTimeout(() => {
                                        dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { block: true, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        attack();
                                    }, aDelay);

                                    else attack();
                                }

                            } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                        });

                        def.on('collect', async r => {
                            if (matchStats.turn === 1) {
                                matchStats.turn = 0;
                                myStatsC.attackStreak = 0;

                                // If defense was replaced
                                if ("def" in myStatsC.replaceButton) {
                                    myStatsC.replaceButton.def.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    if (matchStats.turn === 0) attack();
                                }

                                // Use defense
                                else {
                                    if (++matchStats.defUsed === 10) interaction.followUp({ content: `You have used DEF 10 times and won't get any ${customEmojis.def} or ${customEmojis.mr} from now on!`, ephemeral: true });
                                    if (matchStats.defUsed > 10) {
                                        notice.push(`\n🛡️ **${myChar.name}** can't increase DEF/MR anymore`);
                                    } else {
                                        let adddef = 60 + Math.floor(30 * Math.random()) - ((matchStats.defUsed - 1) * 5);
                                        let addmr = Math.floor((myClass ? 60 * myClass.stats.mr[0] : 60) + (30 * Math.random())) - ((matchStats.defUsed - 1) * 5);
                                        buffs.def.push(new buffInfo("+", adddef, 9999));
                                        buffs.mr.push(new buffInfo("+", addmr, 9999));
                                        myStatsC.def += adddef;
                                        myStatsC.mr += addmr;
                                        notice.push(`\n🛡️ **${myChar.name}** has increased DEF by **${adddef}** and MR by **${addmr}**`);
                                    }
                                    myStatsC.usedBlockRound = matchStats.round;
                                    attack();
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                }

                            } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                            // Trigger defend
                            matchStats.trigger("defend", myStatsC, eStatsC, buffs, eBuffs);
                        });

                        ability.on('collect', async r => {
                            if (myStatsC.isAbilityBlocked) return interaction.followUp({ content: `You currently can't use your character ability`, ephemeral: true });

                            // If ability was replaced
                            if ("ability" in myStatsC.replaceButton && "run" in myStatsC.replaceButton.ability && matchStats.turn === 1) {
                                matchStats.turn = 0;
                                myStatsC.attackStreak = 0;
                                myStatsC.replaceButton.ability.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                attack();
                            }

                            else {
                                if (myAbility.used < myAbility.usage) {
                                    if (matchStats.turn === 1) {
                                        if (myAbility.cost > myStatsC.sm) interaction.followUp({ content: `You don't have enough mana! (**${myStatsC.sm}**/${myAbility.cost}${customEmojis.mana})`, ephemeral: true });
                                        else {
                                            matchStats.turn = 0;
                                            myStatsC.attackStreak = 0;
                                            myAbility.used++;
                                            await myAbility.ability(myStatsC, myStats, eStatsC, eStats, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, msg);
                                            myStatsC.sm -= myAbility.cost;
                                            editEmbed();
                                            Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                            attack();
                                        };
                                    } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                                } else interaction.followUp({ content: `You can use **${myChar.name}**'s ability only ${myAbility.usage == 1 ? "once" : `${myAbility.usage} times`} per fight.`, ephemeral: true });
                            };
                            // Trigger ability
                            matchStats.trigger("ability", myStatsC, eStatsC, buffs, eBuffs);
                        });

                        cskill.on('collect', async r => {

                            // If class active was replaced
                            if ("cskill" in myStatsC.replaceButton && matchStats.turn === 1) {
                                matchStats.turn = 0;
                                myStatsC.attackStreak = 0;
                                myStatsC.replaceButton.cskill.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                if (matchStats.turn === 0) attack();
                            }

                            // Class active
                            else {
                                if (myChar.id === 4767) return interaction.followUp({ content: "Asta can't use any abilities", ephemeral: true });
                                if (skill._cost > myStatsC.sm) return interaction.followUp({ content: `You don't have enough mana! (**${myStatsC.sm}**/${skill._cost}${customEmojis.mana})`, ephemeral: true });
                                else {
                                    if (matchStats.turn === 1) {
                                        myStatsC.sm -= skill._cost;
                                        myStatsC.attackStreak = 0;
                                        skill._skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user, stats.chars);
                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        attack();
                                    } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                                };
                            };
                            // Trigger class active
                            matchStats.trigger("cskill", myStatsC, eStatsC, buffs, eBuffs);
                        });

                        skip.on('collect', async r => {
                            if (matchStats.turn == 1) {
                                notice.push(`\n⏩ Skipping to results...`);
                                editEmbed();
                                matchStats.turn = 0;
                                while (eStatsC.hp > 0 && myStatsC.hp > 0) {
                                    if (Math.random() > 0.02 + (0.1 * (eStatsC.ep / myStatsC.ep))) eStatsC.hp -= Math.floor((myStatsC.atk * Math.pow(0.99895, eStatsC.def)) * (1 - (0.2 * Math.random())));
                                    if (eStatsC.hp < 0) eStatsC.hp = 0;
                                    if (eStatsC.hp > 0) myStatsC.hp -= Math.floor((eStatsC.atk * Math.pow(0.99895, myStatsC.def)) * (1 - (0.2 * Math.random())));
                                    if (myStatsC.hp < 0) myStatsC.hp = 0;

                                    // Break if it takes too long
                                    if (matchStats.round++ > 1000) myStatsC.hp = 0;
                                };

                                setTimeout(() => {
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                }, aDelay);
                            } else {
                                matchStats.turn = 1;
                                interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                            };
                        });

                    });

                });
                interaction.channel.send({ embeds: [result] });
            };

            if (interaction.commandName === "trial") {
                newFight();
            } else {
                interaction.reply("Very well..");
                setTimeout(() => { interaction.channel.send("I'll give it everything I've got!"); }, 1800);
                setTimeout(newFight, 3600);
            };

        });

    },
};