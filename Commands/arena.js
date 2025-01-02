/* eslint-disable no-unused-vars */
import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } from "discord.js";
import { db, query } from "../db_handler";
import { abilities } from "../Modules/abilities";
import { achievements } from "../Modules/achievements";
import { classes } from "../Modules/classes";
import { skills } from "../Modules/skills";
import { items } from "../Modules/items";
import { characters } from "../Modules/chars";
import { dailies } from "../Modules/dailyQuests";
import { getDetailedStats, customEmojis, deleteReplyIn, dealDamage } from "../Modules/functions";
import Avalon from "../Modules/avalon";
import buffInfo from "../Modules/buffs";
import _ from 'lodash';

const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setCustomId('1')
        .setLabel('Accept')
        .setStyle('Success'),
    new ButtonBuilder()
        .setCustomId('0')
        .setLabel('Decline')
        .setStyle('Danger'),
);

module.exports = {
    name: 'arena',
    description: 'arena',
    execute(interaction) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        let user = interaction.options.getUser('user');

        db.serialize(async () => {
            // await interaction.deferReply().catch((err) => {
            //     return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            // });

            let stats = await query(`SELECT users.id, users.class, users.arenawins, users.arenalosses, users.coins, users.bank, users.battlechar, users.animationdelay, users.premium, users.shield_slot, characters.chars, characters.ref, users.level, users.equipment, characters.skin, dungeon.floors, dungeon.'limit', dungeon.classes, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${interaction.user.id}`);
            stats = { id: stats[0].id, class: stats[0].class, arenawins: stats[0].arenawins, arenalosses: stats[0].arenalosses, coins: stats[0].coins, bank: stats[0].bank, battlechar: stats[0].battlechar, animationdelay: stats[0].animationdelay, premium: stats[0].premium, shield_slot: stats[0].shield_slot, chars: JSON.parse(stats[0].chars), ref: JSON.parse(stats[0].ref), level: stats[0].level, equipment: JSON.parse(stats[0].equipment), skin: JSON.parse(stats[0].skin), limit: stats[0].limit, floors: JSON.parse(stats[0].floors), classes: JSON.parse(stats[0].classes), classlevels: JSON.parse(stats[0].classlevels) };

            let stats2 = await query(`SELECT users.id, users.class, users.arenawins, users.arenalosses, users.coins, users.bank, users.battlechar, users.animationdelay, users.premium, users.shield_slot, characters.chars, characters.ref, users.level, users.equipment, characters.skin, dungeon.floors, dungeon.'limit', dungeon.classes, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${user.id}`);
            if (!stats2[0]) return interaction.reply(`**${user.username}** hasn't started playing yet.`);
            stats2 = { id: stats2[0].id, class: stats2[0].class, arenawins: stats2[0].arenawins, arenalosses: stats2[0].arenalosses, coins: stats2[0].coins, bank: stats2[0].bank, battlechar: stats2[0].battlechar, animationdelay: stats2[0].animationdelay, premium: stats2[0].premium, shield_slot: stats2[0].shield_slot, chars: JSON.parse(stats2[0].chars), ref: JSON.parse(stats2[0].ref), level: stats2[0].level, equipment: JSON.parse(stats2[0].equipment), skin: JSON.parse(stats2[0].skin), limit: stats2[0].limit, floors: JSON.parse(stats2[0].floors), classes: JSON.parse(stats2[0].classes), classlevels: JSON.parse(stats2[0].classlevels) };

            if (stats.battlechar === null || !stats.chars.includes(stats.battlechar)) return interaction.reply("You have to choose a battle character first. Use `/select <char name>` to choose one.");
            if (stats2.battlechar === null || !stats2.chars.includes(stats2.battlechar)) return interaction.reply(`**${user.username}** has to choose a battle character first. Use \`/select <char name>\` to choose one.`);

            if (user.id === interaction.user.id) return interaction.reply("Please don't fight yourself <:Heh:869656740667469864>");
            if (user.bot && user.id !== "706183309943767112") return interaction.reply("You can't fight bots... or.. maybe you want...");

            // User stats
            let myChar = characters[stats.battlechar];
            let myStats = await getDetailedStats(myChar.id, stats, stats.classlevels);
            myStats.image = myChar.image;
            let myStatsC = { ...myStats };
            let myClass = myStats.class !== -1 ? classes[myStats.class] : false;
            let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : false;
            let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : false;

            const thumbnail = myChar.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[myChar.id], stats.skin[myChar.id]);

            // Enemy Stats
            let enemy = characters[stats2.battlechar];
            let eStats = await getDetailedStats(enemy.id, stats2, stats2.classlevels);
            eStats.image = enemy.getImage(stats2.premium, customSettings[user.id]?.cimg[enemy.id], stats2.skin[enemy.id]);
            let eStatsC = { ...eStats };
            let eClass = eStats.class !== -1 ? classes[eStats.class] : false;
            let eSkill = eStats.class !== -1 ? _.cloneDeep(skills[eStats.class]) : false;
            let eAbility = enemy.id in abilities ? _.cloneDeep(abilities[enemy.id]) : false;

            let buffs = Avalon.getBuffs();
            let eBuffs = Avalon.getBuffs();

            const aDelay = stats.premium ? stats.animationdelay : 1200;

            let resolved = false;
            async function matchResult(r) {
                if (resolved) return;
                resolved = true;

                const EmbedR = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setTitle(`Battle Arena`);
                if (r === "w") {
                    await query(`UPDATE users SET arenawins = arenawins + 1 WHERE id = ${interaction.user.id}`);
                    await query(`UPDATE users SET arenalosses = arenalosses + 1 WHERE id = ${user.id}`);

                    EmbedR.setDescription(`<:stars_v2:917023655840591963> **${interaction.user.username}** won! <:stars_v2:917023655840591963>\nBetter luck next time ${user.username}.`).setThumbnail(thumbnail).setFooter({ text: `Total wins: ${stats.arenawins + 1}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" });

                    // Achievements
                    achievements[39].check(interaction, interaction.user, myStatsC.hp), achievements[40].check(interaction, interaction.user, myStatsC.hp), achievements[41].check(interaction, interaction.user, myStatsC.hp); // Under Pressure
                    achievements[6].check(interaction), achievements[7].check(interaction), achievements[8].check(interaction); // Champion
                };
                if (r === "l") {
                    await query(`UPDATE users SET arenalosses = arenalosses + 1 WHERE id = ${interaction.user.id}`);
                    await query(`UPDATE users SET arenawins = arenawins + 1 WHERE id = ${user.id}`);

                    EmbedR.setDescription(`<:stars_v2:917023655840591963> **${user.username}** won! <:stars_v2:917023655840591963>\nBetter luck next time ${interaction.user.username}.`).setThumbnail(eStats.image).setFooter({ text: `Total wins: ${stats2.arenawins + 1}`, iconURL: user.displayAvatarURL({ dynamic: true }) + "?size=2048" });

                    // Achievements
                    achievements[39].check(interaction, user, eStatsC.hp), achievements[40].check(interaction, user, eStatsC.hp), achievements[41].check(interaction, user, eStatsC.hp); // Under Pressure
                    achievements[6].check(interaction, user), achievements[7].check(interaction, user), achievements[8].check(interaction, user); // Champion
                };

                // Daily Quests
                dailies[3].update(interaction), dailies[3].update(interaction, 1, user); // Contender

                return EmbedR;
            };


            let matchStats = Avalon.getMatchStats(interaction, { turnSkill: 1 });
            let matchStats2 = Avalon.getMatchStats(interaction);
            let notice = ["", "", "", ""];

            let ATK_EMOJI = '⚔️', DEF_EMOJI = '🛡️', ABILITY_EMOJI = '✨', SKILL_EMOJI = '⚜️';
            if (new Date().getMonth() === 11) ATK_EMOJI = '<:sw:1030154812496560218>', DEF_EMOJI = '<:sh:1030154814652420127>', ABILITY_EMOJI = '<:sp:1030154816288198768>', SKILL_EMOJI = '<:fl:1030154818746069012>';

            // Buttons
            let atkButton = new ButtonBuilder().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle('Secondary');
            let defButton = new ButtonBuilder().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle('Secondary');
            let abilityButton = new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle('Secondary').setDisabled(true);
            let skillButton = new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle('Secondary').setDisabled(true);

            if ((myAbility && "ability" in myAbility) || (eAbility && "ability" in eAbility)) abilityButton.setDisabled(false);
            if (myStats.class !== -1 || eStats.class !== -1) skillButton.setDisabled(false);

            const row = new ActionRowBuilder()
                .addComponents(atkButton, defButton, abilityButton, skillButton);

            // Player 1
            if (skill && myChar.id !== 4767 && enemy.id !== 4767) skill._passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
            if (myAbility?.passive && enemy.id !== 4767) myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            if (myStats.weapon !== -1) items[myStats.weapon]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            if (myStats.shieldid) items[myStats.shieldid]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            if (myStats.helmet && items?.[myStats.helmet].setname === items?.[myStats.cuirass]?.setname && items?.[myStats.helmet].setname === items?.[myStats.gloves]?.setname && items?.[myStats.helmet].setname === items?.[myStats.boots]?.setname) items[myStats.boots]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

            // Player 2
            if (eSkill && myChar.id !== 4767 && enemy.id !== 4767) eSkill._passive(eStatsC, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, new EmbedBuilder(), user, interaction.commandName);
            if (eAbility?.passive && myChar.id !== 4767) eAbility.passive(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, new EmbedBuilder(), user);
            if (eStats.weapon !== -1) items[eStats.weapon]._buff(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, new EmbedBuilder(), user);
            if (eStats.shieldid) items[eStats.shieldid]._buff(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, new EmbedBuilder(), user);
            if (eStats.helmet && items?.[eStats.helmet].setname === items?.[eStats.cuirass]?.setname && items?.[eStats.helmet].setname === items?.[eStats.gloves]?.setname && items?.[eStats.helmet].setname === items?.[eStats.boots]?.setname) items[eStats.boots]._buff(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, new EmbedBuilder(), user);

            async function newFight() {
                let timestart = new Date().getTime();
                let result = await new Promise((resolve, rejects) => {
                    const Embed = new EmbedBuilder()
                        .setColor(0xbbffff)
                        .setImage(eStats.image)
                        .setThumbnail(thumbnail)
                        .setTitle(`Battle Arena`)
                        .setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${enemy.name}**!\n\n${eClass ? eClass.emblem : ""}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}${customEmojis.hp}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStats.hp, eStatsC.sm / eStatsC.mana)}\n${Avalon.padStats(eStatsC)}\n-----------------------------------\n${myClass ? myClass.emblem : ""}${myChar.name}'s Stats (**${myStatsC.hp}**/${myStats.hp}${customEmojis.hp}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStats.hp, myStatsC.sm / myStatsC.mana)}\n${Avalon.padStats(myStatsC)}`)
                        .setFooter({ text: `Turn: ${user.username} | time left: 120s` });
                    interaction.channel.send({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {

                        const atk = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ATK", componentType: ComponentType.Button, time: 120000 });
                        const def = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "DEF", componentType: ComponentType.Button, time: 120000 });
                        const ability = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ABILITY", componentType: ComponentType.Button, time: 120000 });
                        const cskill = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKILL", componentType: ComponentType.Button, time: 120000 });
                        const atk2 = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "ATK", componentType: ComponentType.Button, time: 120000 });
                        const def2 = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "DEF", componentType: ComponentType.Button, time: 120000 });
                        const ability2 = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "ABILITY", componentType: ComponentType.Button, time: 120000 });
                        const cskill2 = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "SKILL", componentType: ComponentType.Button, time: 120000 });


                        function editEmbed() {
                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${enemy.name}**!\n\n${eClass ? eClass.emblem : ""}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}${customEmojis.hp}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStats.hp, eStatsC.sm / eStatsC.mana)}\n${Avalon.padStats(eStatsC)}\n-----------------------------------\n${myClass ? myClass.emblem : ""}${myChar.name}'s Stats (**${myStatsC.hp}**/${myStats.hp}${customEmojis.hp}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStats.hp, myStatsC.sm / myStatsC.mana)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-4).join("")}`);
                            Embed.setFooter({ text: `Turn: ${matchStats.turn === 1 ? user.username : interaction.user.username} | time left: ${120 + Math.floor((timestart - new Date().getTime()) / 1000)}s` });
                            msg.edit({ embeds: [Embed] });
                        };

                        function minionDefeated(side) {
                            if (side === "my") {
                                myStatsC = { ...matchStats.myStatsCC };
                                matchStats.currentCharacter = 0;
                                Embed.setThumbnail(thumbnail);
                                startNextRound();
                            } else {
                                eStatsC = { ...matchStats.eStatsCC };
                                matchStats.currentOpponent = 0;
                                Embed.setImage(eStats.image);
                                matchStats.turn = 1;
                            };
                        };

                        function endMatch(wORl) {
                            if (matchStats.ended) return;
                            else matchStats.ended = true;

                            atk.stop(), def.stop(), ability?.stop(), cskill?.stop();
                            atk2.stop(), def2.stop(), ability2?.stop(), cskill2?.stop();
                            if (wORl === "l") notice.push(`\n🎉 **${enemy.name}** won`);
                            else notice.push(`\n🎉 **${myChar.name}** won`);
                            editEmbed();
                            matchStats.turn = 1;
                            resolve(matchResult(wORl));
                        };

                        function startNextRound() {
                            if (matchStats.round === matchStats.roundCheck) return;
                            matchStats.roundCheck = matchStats.round;
                            if (matchStats.currentCharacter || matchStats.currentOpponent || matchStats2.currentCharacter) return;
                            matchStats2.round = matchStats.round - 1;

                            // Consume Mana
                            Avalon.consumeActiveMana(matchStats, myStatsC, buffs, myChar, notice, Embed, thumbnail);
                            Avalon.consumeActiveMana(matchStats, eStatsC, eBuffs, enemy, notice, Embed, eStats.image);

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
                            if (matchStats.currentOpponent === 0) {
                                for (let i = eStatsC.delayedBuffs.length - 1; i >= 0; i--) {
                                    if (eStatsC.delayedBuffs[i].round <= matchStats.round) {
                                        eStatsC.delayedBuffs[i].run(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, Embed, user);
                                        if (eStatsC.delayedBuffs[i].last <= 1 || eStatsC.delayedBuffs[i].used >= eStatsC.delayedBuffs[i].usage) {
                                            eStatsC.delayedBuffs.splice(i, 1);
                                        } else {
                                            eStatsC.delayedBuffs[i].decrement();
                                        };
                                    };
                                };
                            };

                            Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                        };

                        if (notice.length > 4) {
                            Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            editEmbed();
                        };

                        atk.on('collect', async r => {
                            if (matchStats.turn === 0) {
                                matchStats.turn = 1;

                                // If attack was replaced
                                if ("atk" in myStatsC.replaceButton) {
                                    myStatsC.replaceButton.atk.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                }

                                // Normal attack
                                else {
                                    dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                    if (matchStats.twinshot > Math.random()) setTimeout(() => {
                                        dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        matchStats.round++;
                                        startNextRound();
                                        editEmbed();
                                    }, aDelay);
                                    else {
                                        matchStats.round++;
                                        startNextRound();
                                        editEmbed();
                                    };
                                }

                            } else interaction.channel.send(`Please wait for ${user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                        });

                        def.on('collect', async r => {
                            if (matchStats.turn === 0) {
                                matchStats.turn = 1;
                                myStatsC.attackStreak = 0;

                                // If defense was replaced
                                if ("def" in myStatsC.replaceButton) {
                                    myStatsC.replaceButton.def.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                }

                                else {
                                    if (++matchStats.defUsed === 10) interaction.channel.send(`You have used DEF 10 times and won't get any ${customEmojis.def} or ${customEmojis.mr} from now on!`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
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
                                    matchStats.round++;
                                    startNextRound();
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                }

                            } else interaction.channel.send(`Please wait for ${user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            matchStats.trigger("defend", myStatsC, eStatsC, buffs, eBuffs);
                        });

                        ability.on('collect', async r => {
                            if (myStatsC.isAbilityBlocked) return interaction.channel.send(`You currently can't use your character ability`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));

                            // If ability was replaced
                            if ("ability" in myStatsC.replaceButton && "run" in myStatsC.replaceButton.ability && matchStats.turn === 0) {
                                matchStats.turn = 1;
                                myStatsC.attackStreak = 0;
                                myStatsC.replaceButton.ability.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            }

                            else {
                                if (!myAbility) return interaction.channel.send(`**${myChar.name}** does not have an ability.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                if (myAbility.used < myAbility.usage) {
                                    if (matchStats.turn === 0) {
                                        if (myAbility.cost > myStatsC.sm) interaction.channel.send(`You don't have enough mana! (**${myStatsC.sm}**/${myAbility.cost}${customEmojis.mana})`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                        else {
                                            matchStats.turn = 1;
                                            myStatsC.attackStreak = 0;
                                            myAbility.used++;
                                            await myAbility.ability(myStatsC, myStats, eStatsC, eStats, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, msg);
                                            myStatsC.sm -= myAbility.cost;
                                            matchStats.round++;
                                            startNextRound();
                                            editEmbed();
                                            Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        };
                                    } else interaction.channel.send(`Please wait for ${user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                } else interaction.channel.send(`You can use **${myChar.name}**'s ability only ${myAbility.usage == 1 ? "once" : `${myAbility.usage} times`} per fight.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            };
                            // Trigger ability
                            matchStats.trigger("ability", myStatsC, eStatsC, buffs, eBuffs);
                        });

                        cskill.on('collect', async r => {

                            // If class active was replaced
                            if ("cskill" in myStatsC.replaceButton && matchStats.turn === 0) {
                                matchStats.turn = 1;
                                myStatsC.attackStreak = 0;
                                myStatsC.replaceButton.cskill.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            }

                            // Class active
                            else {
                                if (!myClass) return interaction.channel.send(`**${myChar.name}** does not have a class.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                if (myStats.id === 4767 && enemy.id === 4767) return interaction.channel.send("Ability usages are blocked this round.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                if (skill._cost > myStatsC.sm) interaction.channel.send(`You don't have enough mana! (**${myStatsC.sm}**/${skill._cost}${customEmojis.mana})`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                else {
                                    if (matchStats.turn === 0) {
                                        myStatsC.sm -= skill._cost;
                                        myStatsC.attackStreak = 0;
                                        skill._skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user, stats.chars);
                                        matchStats.round++;
                                        startNextRound();
                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    } else interaction.channel.send(`Please wait for ${user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                };
                            };
                            // Trigger class active
                            matchStats.trigger("cskill", myStatsC, eStatsC, buffs, eBuffs);
                        });

                        atk2.on('collect', async r => {
                            if (matchStats.turn === 1) {
                                matchStats.turn = 0;

                                // If attack was replaced
                                if ("atk" in eStatsC.replaceButton) {
                                    eStatsC.replaceButton.atk.run(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, Embed, user);
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                }

                                // Normal attack
                                else {
                                    dealDamage(myStatsC, eStatsC, buffs, eBuffs, matchStats2, notice, `⚔️ **${enemy.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                    if (matchStats2.twinshot > Math.random()) setTimeout(() => {
                                        dealDamage(myStatsC, eStatsC, buffs, eBuffs, matchStats2, notice, `⚔️ **${enemy.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    }, aDelay);
                                }

                            } else interaction.channel.send(`Please wait for ${user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                        });

                        def2.on('collect', async r => {
                            if (matchStats.turn === 1) {
                                matchStats.turn = 0;
                                matchStats2.attackStreak = 0;

                                // If defense was replaced
                                if ("def" in eStatsC.replaceButton) {
                                    eStatsC.replaceButton.def.run(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, Embed, user);
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                }

                                else {
                                    if (++matchStats2.defUsed === 10) interaction.channel.send(`You have used DEF 10 times and won't get any ${customEmojis.def} or ${customEmojis.mr} from now on!`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                    if (matchStats2.defUsed > 10) {
                                        notice.push(`\n🛡️ **${enemy.name}** can't increase DEF/MR anymore`);
                                    } else {
                                        let adddef = 60 + Math.floor(30 * Math.random()) - ((matchStats2.defUsed - 1) * 5);
                                        let addmr = Math.floor((eClass ? 60 * eClass.stats.mr[0] : 60) + Math.floor(30 * Math.random())) - ((matchStats2.defUsed - 1) * 5);
                                        eBuffs.def.push(new buffInfo("+", adddef, 9999));
                                        eBuffs.mr.push(new buffInfo("+", addmr, 9999));
                                        eStatsC.def += adddef;
                                        eStatsC.mr += addmr;
                                        notice.push(`\n🛡️ **${enemy.name}** has increased DEF by **${adddef}** and MR by **${addmr}**`);
                                    };
                                    eStatsC.usedBlockRound = matchStats.round;
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                }

                            } else interaction.channel.send(`Please wait for ${interaction.user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                        });

                        ability2.on('collect', async r => {
                            if (eStatsC.isAbilityBlocked) return interaction.channel.send(`You currently can't use your character ability`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));

                            // If ability was replaced
                            if ("ability" in eStatsC.replaceButton && "run" in eStatsC.replaceButton.ability && matchStats.turn === 1) {
                                matchStats.turn = 0;
                                eStatsC.attackStreak = 0;
                                eStatsC.replaceButton.ability.run(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats, notice, Embed, interaction.user);
                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            }

                            else {
                                if (!eAbility) return interaction.channel.send(`**${enemy.name}** does not have an ability.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                if (eAbility.used < eAbility.usage) {
                                    if (matchStats.turn === 1) {
                                        if (eAbility.cost > eStatsC.sm) interaction.channel.send(`You don't have enough mana! (**${eStatsC.sm}**/${eAbility.cost}${customEmojis.mana})`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                        else {
                                            matchStats.turn = 0;
                                            matchStats2.attackStreak = 0;
                                            eAbility.used++;
                                            await eAbility.ability(eStatsC, eStats, myStatsC, myStats, eBuffs, buffs, enemy, myChar, matchStats2, notice, Embed, msg);
                                            eStatsC.sm -= eAbility.cost;
                                            editEmbed();
                                            Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        };
                                    } else interaction.channel.send(`Please wait for ${interaction.user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                } else interaction.channel.send(`You can use **${enemy.name}**'s ability only ${eAbility.usage == 1 ? "once" : `${eAbility.usage} times`} per fight.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            };

                        });

                        cskill2.on('collect', async r => {

                            // If class active was replaced
                            if ("cskill" in eStatsC.replaceButton && matchStats.turn === 1) {
                                matchStats.turn = 0;
                                matchStats2.attackStreak = 0;
                                eStatsC.replaceButton.cskill.run(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, Embed, user);
                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            }

                            // Class active
                            else {
                                if (!eClass) return interaction.channel.send(`**${enemy.name}** does not have a class.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                if (myStats.id === 4767 && enemy.id === 4767) return interaction.channel.send("Ability usages are blocked this round.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                if (eSkill._cost > eStatsC.sm) interaction.channel.send(`You don't have enough mana! (**${eStatsC.sm}**/${eSkill._cost}${customEmojis.mana})`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                else {
                                    if (matchStats.turn === 1) {
                                        eStatsC.sm -= eSkill._cost;
                                        matchStats2.attackStreak = 0;
                                        eSkill._skill(eStatsC, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, Embed, user, stats2.chars);
                                        matchStats.turn = matchStats2.turn;
                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    } else interaction.channel.send(`Please wait for ${interaction.user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                };
                            };
                        });

                    });

                });

                interaction.channel.send({ embeds: [result] });
            };

            interaction.reply({ content: `<@${user.id}> ${interaction.user.username} challenges you to a battle. Do you accept?`, components: [row2], fetchReply: true }).then(msg2 => {
                const collector = msg2.createMessageComponentCollector({ filter: (r) => ((r.user.id === user.id) || (r.user.id === interaction.user.id)), componentType: ComponentType.Button, time: 30000 });

                collector.on('collect', async r => {
                    if ((r.customId === "1") && (r.user.id === interaction.user.id)) return;
                    collector.stop();
                    r.customId === "1" ? newFight() : interaction.channel.send("Action cancelled");
                });
            });

        });

    },
};