/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { abilities } = require("../Modules/abilities.js");
const { achievements } = require("../Modules/achievements.js");
const { classes } = require("../Modules/classes.js");
const { skills } = require("../Modules/skills.js");
const { items } = require("../Modules/items.js");
const { characters } = require("../Modules/chars.js");
const { dailies } = require("../Modules/dailyQuests.js");
const { getDetailedStats, customEmojis, deleteReplyIn, dealDamage } = require("../Modules/functions.js");
const Avalon = require("../Modules/avalon.js");
const buffInfo = require("../Modules/buffs.js");
const _ = require('lodash');

const row2 = new MessageActionRow().addComponents(
    new MessageButton()
        .setCustomId('1')
        .setLabel('Accept')
        .setStyle('SUCCESS'),
    new MessageButton()
        .setCustomId('0')
        .setLabel('Decline')
        .setStyle('DANGER'),
);

module.exports = {
    name: 'arena',
	description: 'arena',
	execute(interaction) {

        let user = interaction.options.getUser('user');
        
        db.serialize(async () => {
            await interaction.deferReply().catch((err) => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });
            
            let stats = await query(`SELECT users.id, users.arenawins, users.arenalosses, users.coins, users.battlechar, users.animationdelay, users.premium, characters.chars, characters.ref, characters.level, characters.class, characters.equipment, dungeon.floors, dungeon.'limit', dungeon.classes, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${interaction.user.id}`);
            stats = {id: stats[0].id, arenawins: stats[0].arenawins, arenalosses: stats[0].arenalosses, coins: stats[0].coins, battlechar: stats[0].battlechar, animationdelay: stats[0].animationdelay, premium: stats[0].premium, chars: JSON.parse(stats[0].chars), ref: JSON.parse(stats[0].ref), level: JSON.parse(stats[0].level), class: JSON.parse(stats[0].class), equipment: JSON.parse(stats[0].equipment), limit: stats[0].limit, floors: JSON.parse(stats[0].floors), classes: JSON.parse(stats[0].classes), classlevels: JSON.parse(stats[0].classlevels)};
            
            let stats2 = await query(`SELECT users.id, users.arenawins, users.arenalosses, users.coins, users.battlechar, users.animationdelay, users.premium, characters.chars, characters.ref, characters.level, characters.class, characters.equipment, dungeon.floors, dungeon.'limit', dungeon.classes, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${user.id}`);
            if (!stats2[0]) return interaction.editReply(`**${user.username}** hasn't started playing yet.`);
            stats2 = {id: stats2[0].id, arenawins: stats2[0].arenawins, arenalosses: stats2[0].arenalosses, coins: stats2[0].coins, battlechar: stats2[0].battlechar, animationdelay: stats2[0].animationdelay, premium: stats2[0].premium, chars: JSON.parse(stats2[0].chars), ref: JSON.parse(stats2[0].ref), level: JSON.parse(stats2[0].level), class: JSON.parse(stats2[0].class), equipment: JSON.parse(stats2[0].equipment), limit: stats2[0].limit, floors: JSON.parse(stats2[0].floors), classes: JSON.parse(stats2[0].classes), classlevels: JSON.parse(stats2[0].classlevels)};

            if (stats.battlechar === null || !stats.chars.includes(stats.battlechar)) return interaction.editReply("You have to choose a battle character first. Use `/select <char name>` to choose one.");
            if (stats2.battlechar === null || !stats2.chars.includes(stats2.battlechar)) return interaction.editReply(`**${user.username}** has to choose a battle character first. Use \`/select <char name>\` to choose one.`);

            if (user.id === interaction.user.id) return interaction.editReply("Please don't fight yourself <:Heh:869656740667469864>");
            if (user.bot && user.id !== "706183309943767112") return interaction.editReply("You can't fight bots... or.. maybe you want...");
            
            // User stats
            let myChar = characters[stats.battlechar];
            let myStats = await getDetailedStats(myChar.id, stats, stats.classlevels);
            let myStatsC = {...myStats};
            let myClass = myStats.class !== -1 ? classes[myStats.class] : false;
            let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : false;
            let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : false;

            // Enemy Stats
            let enemy = characters[stats2.battlechar];
            let eStats = await getDetailedStats(enemy.id, stats2, stats2.classlevels);
            let eStatsC = {...eStats};
            let eClass = eStats.class !== -1 ? classes[eStats.class] : false;
            let eSkill = eStats.class !== -1 ? _.cloneDeep(skills[eStats.class]) : false;
            let eAbility = enemy.id in abilities ? _.cloneDeep(abilities[enemy.id]) : false;

            let buffs = Avalon.getBuffs();
            let eBuffs = Avalon.getBuffs();

            const aDelay = stats.premium ? stats.animationdelay : 1200;

            async function matchResult(r) {
                const EmbedR = new MessageEmbed()
                .setColor(0xbbffff)
                .setTitle(`Battle Arena`)
                if (r === "w") {
                    await query(`UPDATE users SET arenawins = arenawins + 1 WHERE id = ${interaction.user.id}`);
                    await query(`UPDATE users SET arenalosses = arenalosses + 1 WHERE id = ${user.id}`);
                    
                    EmbedR.setDescription(`<:stars_v2:917023655840591963> **${interaction.user.username}** won! <:stars_v2:917023655840591963>\nBetter luck next time ${user.username}.`).setThumbnail(myChar.image).setFooter(`Total wins: ${stats.arenawins+1}`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048");
                    
                    // Achievements
                    achievements[39].check(interaction, interaction.user, myStatsC.hp), achievements[40].check(interaction, interaction.user, myStatsC.hp), achievements[41].check(interaction, interaction.user, myStatsC.hp); // Under Pressure
                    achievements[6].check(interaction), achievements[7].check(interaction), achievements[8].check(interaction); // Champion

                    // Daily Quests
                    dailies[3].update(interaction); // Contender
                };
                if (r === "l") {
                    await query(`UPDATE users SET arenalosses = arenalosses + 1 WHERE id = ${interaction.user.id}`);
                    await query(`UPDATE users SET arenawins = arenawins + 1 WHERE id = ${user.id}`);

                    EmbedR.setDescription(`<:stars_v2:917023655840591963> **${user.username}** won! <:stars_v2:917023655840591963>\nBetter luck next time ${interaction.user.username}.`).setThumbnail(enemy.image).setFooter(`Total wins: ${stats2.arenawins+1}`, user.displayAvatarURL({ dynamic: true }) + "?size=2048");
                    
                    // Achievements
                    achievements[39].check(interaction, user, eStatsC.hp), achievements[40].check(interaction, user, eStatsC.hp), achievements[41].check(interaction, user, eStatsC.hp); // Under Pressure
                    achievements[6].check(interaction, user), achievements[7].check(interaction, user), achievements[8].check(interaction, user); // Champion

                    // Daily Quests
                    dailies[3].update(interaction, 1, user); // Contender
                };
                return EmbedR;
            };


            let matchStats = Avalon.getMatchStats(interaction, {turnSkill: 1});
            let matchStats2 = Avalon.getMatchStats(interaction);
            let notice = ["", "", "", ""];

            let ATK_EMOJI = '⚔️', DEF_EMOJI = '🛡️', ABILITY_EMOJI = '✨', SKILL_EMOJI = '⚜️';
            if (new Date().getMonth() === 11) ATK_EMOJI = '<:sw:1030154812496560218>', DEF_EMOJI = '<:sh:1030154814652420127>', ABILITY_EMOJI = '<:sp:1030154816288198768>', SKILL_EMOJI = '<:fl:1030154818746069012>';

            // Buttons
            let atkButton = new MessageButton().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle('SECONDARY');
            let defButton = new MessageButton().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle('SECONDARY');
            let abilityButton = new MessageButton().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle('SECONDARY').setDisabled(true);
            let skillButton = new MessageButton().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle('SECONDARY').setDisabled(true);
            
            if (myAbility || eAbility) abilityButton.setDisabled(false);
            if (myStats.class !== -1 || eStats.class !== -1) skillButton.setDisabled(false);

            const row = new MessageActionRow()
            .addComponents(atkButton, defButton, abilityButton, skillButton);

            // Player 1
            if (skill && myStats.id !== 4767 && enemy.id !== 4767) skill._passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user, interaction.commandName);
            if (myAbility?.passive && myStats.id !== 4767 && enemy.id !== 4767) myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user);
            if (myStats.weapon !== -1) items[myStats.weapon]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user);
            if (myStats.shieldid) items[myStats.shieldid]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user);
            if (myStats.helmet && items?.[myStats.helmet].setname === items?.[myStats.cuirass]?.setname && items?.[myStats.helmet].setname === items?.[myStats.gloves]?.setname && items?.[myStats.helmet].setname === items?.[myStats.boots]?.setname) items[myStats.boots]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user);

            // Player 2
            if (eSkill && myStats.id !== 4767 && enemy.id !== 4767) eSkill._passive(eStatsC, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, new MessageEmbed(), user, interaction.commandName);
            if (eAbility?.passive && myStats.id !== 4767 && enemy.id !== 4767) eAbility.passive(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, new MessageEmbed(), user);
            if (eStats.weapon !== -1) items[eStats.weapon]._buff(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, new MessageEmbed(), user);
            if (eStats.shieldid) items[eStats.shieldid]._buff(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, new MessageEmbed(), user);
            if (eStats.helmet && items?.[eStats.helmet].setname === items?.[eStats.cuirass]?.setname && items?.[eStats.helmet].setname === items?.[eStats.gloves]?.setname && items?.[eStats.helmet].setname === items?.[eStats.boots]?.setname) items[eStats.boots]._buff(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, new MessageEmbed(), user);

            async function newFight() {
                let timestart = new Date().getTime();
                let result = await new Promise((resolve, rejects) => {
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setImage(enemy.image)
                    .setThumbnail(myChar.image)
                    .setTitle(`Battle Arena`)
                    .setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${enemy.name}**!\n\n${eClass ? eClass.emblem : ""}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}${customEmojis.hp}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp/eStats.hp, eStatsC.sm/eStatsC.mana)}\n${Avalon.padStats(eStatsC)}\n-----------------------------------\n${myClass ? myClass.emblem : ""}${myChar.name}'s Stats (**${myStatsC.hp}**/${myStats.hp}${customEmojis.hp}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp/myStats.hp, myStatsC.sm/myStatsC.mana)}\n${Avalon.padStats(myStatsC)}`)
                    .setFooter(`Turn: ${user.username} | time left: 120s`)
                    interaction.channel.send({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {
                        
                        const atk = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "ATK", componentType: 'BUTTON', time: 120000 });
                        const def = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "DEF", componentType: 'BUTTON', time: 120000 });
                        const ability = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "ABILITY", componentType: 'BUTTON', time: 120000 });
                        const cskill = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "SKILL", componentType: 'BUTTON', time: 120000 });
                        const atk2 = msg.createMessageComponentCollector({filter: (r) => r.user.id === user.id && r.customId === "ATK", componentType: 'BUTTON', time: 120000 });
                        const def2 = msg.createMessageComponentCollector({filter: (r) => r.user.id === user.id && r.customId === "DEF", componentType: 'BUTTON', time: 120000 });
                        const ability2 = msg.createMessageComponentCollector({filter: (r) => r.user.id === user.id && r.customId === "ABILITY", componentType: 'BUTTON', time: 120000 });
                        const cskill2 = msg.createMessageComponentCollector({filter: (r) => r.user.id === user.id && r.customId === "SKILL", componentType: 'BUTTON', time: 120000 });


                        function editEmbed() {
                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${enemy.name}**!\n\n${eClass ? eClass.emblem : ""}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}${customEmojis.hp}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp/eStats.hp, eStatsC.sm/eStatsC.mana)}\n${Avalon.padStats(eStatsC)}\n-----------------------------------\n${myClass ? myClass.emblem : ""}${myChar.name}'s Stats (**${myStatsC.hp}**/${myStats.hp}${customEmojis.hp}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp/myStats.hp, myStatsC.sm/myStatsC.mana)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-4).join("")}`);
                            Embed.setFooter(`Turn: ${matchStats.turn === 1 ? user.username : interaction.user.username} | time left: ${120+Math.floor((timestart-new Date().getTime())/1000)}s`);
                            msg.edit({ embeds: [Embed] });
                        };

                        function minionDefeated(side) {
                            if (side === "my") {
                                myStatsC = {...matchStats.myStatsCC};
                                matchStats.currentCharacter = 0;
                                Embed.setThumbnail(myChar.image);
                                startNextRound();
                            } else {
                                eStatsC = {...matchStats.eStatsCC};
                                matchStats.currentOpponent = 0;
                                Embed.setImage(enemy.image);
                                matchStats.turn = 1; 
                            };
                        };

                        function endMatch(wORl) {
                            atk.stop(), def.stop(), ability?.stop(), cskill?.stop();
                            atk2.stop(), def2.stop(), ability2?.stop(), cskill2?.stop();
                            if (wORl === "l") notice.push(`\n🎉 **${enemy.name}** lost`);
                            else notice.push(`\n🎉 **${myChar.name}** won`);
                            editEmbed();
                            matchStats.turn = 1;
                            resolve(matchResult(wORl));
                        };

                        function startNextRound() {
                            if (matchStats.round === matchStats.roundCheck) return;
                            matchStats.roundCheck = matchStats.round;
                            if (matchStats.currentCharacter || matchStats.currentOpponent || matchStats2.currentCharacter) return;
                            matchStats2.round = matchStats.round-1;

                            // Consume Mana
                            Avalon.consumeActiveMana(matchStats, myStatsC, buffs, myChar, notice, Embed, myChar.image);
                            Avalon.consumeActiveMana(matchStats, eStatsC, eBuffs, enemy, notice, Embed, enemy.image);
                            
                            // Reset Buffs
                            if (matchStats.currentCharacter === 0) myStatsC.atk = myStats.atk, myStatsC.md = myStats.md, myStatsC.def = myStats.def, myStatsC.mr = myStats.mr, myStatsC.cd = myStats.cd, myStatsC.cr = myStats.cr, myStatsC.dodge = myStats.dodge, myStatsC.br = myStats.br, myStatsC.mg = myStats.mg;
                            if (matchStats.currentOpponent === 0) eStatsC.atk = eStats.atk, eStatsC.md = eStats.md, eStatsC.def = eStats.def, eStatsC.mr = eStats.mr, eStatsC.cd = eStats.cd, eStatsC.cr = eStats.cr, eStatsC.dodge = eStats.dodge, eStatsC.br = eStats.br, eStatsC.mg = eStats.mg;
                            
                            // Apply Buffs
                            if (matchStats.currentCharacter === 0) Avalon.applyBuffs(buffs, myStatsC);
                            if (matchStats.currentOpponent === 0) Avalon.applyBuffs(eBuffs, eStatsC);
                            
                            // Fix Stats
                            if (myStatsC.hp > myStatsC.maxhp) myStatsC.hp = myStatsC.maxhp;
                            else if (myStatsC.hp < 0) myStatsC.hp = 0;
                            else myStatsC.hp = Math.floor(myStatsC.hp);
                            if (eStatsC.hp > eStatsC.maxhp) eStatsC.hp = eStatsC.maxhp;
                            else if (eStatsC.hp < 0) eStatsC.hp = 0;
                            else eStatsC.hp = Math.floor(eStatsC.hp);

                            // Check and run delayed buffs
                            for (let i=myStatsC.delayedBuffs.length-1; i >= 0; i--) {
                                if (myStatsC.delayedBuffs[i].round <= matchStats.round) {
                                    myStatsC.delayedBuffs[i].run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    if (myStatsC.delayedBuffs[i].last <= 1 || myStatsC.delayedBuffs[i].used >= myStatsC.delayedBuffs[i].usage) {
                                        myStatsC.delayedBuffs.splice(i, 1);
                                    } else {
                                        myStatsC.delayedBuffs[i].decrement();
                                    };
                                };
                            };
                            for (let i=eStatsC.delayedBuffs.length-1; i >= 0; i--) {
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
                                    dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, {magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, critbleed: true});
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
    
                                    if (matchStats.twinshot > Math.random()) setTimeout(() => {
                                        dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, {magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, critbleed: true});
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
                                matchStats.attackStreak = 0;

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
                                        let adddef = 60 + Math.floor(30 * Math.random()) - ((matchStats.defUsed-1)*5);
                                        let addmr = Math.floor((myClass ? 60*myClass.stats.mr[0] : 60) + (30 * Math.random())) - ((matchStats.defUsed-1)*5);
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
                        });

                        ability.on('collect', async r => {
                            if (!myAbility) return interaction.channel.send(`**${myChar.name}** does not have an ability.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            if (myAbility.used < myAbility.usage) {
                                if (matchStats.turn === 0) {
                                    if (myAbility.cost > myStatsC.sm) interaction.channel.send(`You don't have enough mana! (**${myStatsC.sm}**/${myAbility.cost}${customEmojis.mana})`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                    else {
                                        matchStats.turn = 1;
                                        matchStats.attackStreak = 0;
                                        myAbility.used++;
                                        myAbility.ability(myStatsC, myStats, eStatsC, eStats, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                        myStatsC.sm -= myAbility.cost;
                                        matchStats.round++;
                                        startNextRound();
                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    };
                                } else interaction.channel.send(`Please wait for ${user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            } else interaction.channel.send(`You can use **${myChar.name}**'s ability only ${myAbility.usage == 1 ? "once" : `${myAbility.usage} times`} per fight.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                        });

                        cskill.on('collect', async r => {
                            if (!myClass) return interaction.channel.send(`**${myChar.name}** does not have a class.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            if (myStats.id === 4767 && enemy.id === 4767) return interaction.channel.send("Ability usages are blocked this round.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            if (skill._cost > myStatsC.sm) interaction.channel.send(`You don't have enough mana! (**${myStatsC.sm}**/${skill._cost}${customEmojis.mana})`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            else {
                                if (matchStats.turn === 0) {
                                    myStatsC.sm -= skill._cost;
                                    matchStats.attackStreak = 0;
                                    skill._skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user, stats.chars);
                                    matchStats.round++;
                                    startNextRound();
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                } else interaction.channel.send(`Please wait for ${user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            };
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
                                    dealDamage(myStatsC, eStatsC, buffs, eBuffs, matchStats2, notice, `⚔️ **${enemy.name}**`, {magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, critbleed: true});
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    
                                    if (matchStats2.twinshot > Math.random()) setTimeout(() => {
                                        dealDamage(myStatsC, eStatsC, buffs, eBuffs, matchStats2, notice, `⚔️ **${enemy.name}**`, {magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, critbleed: true});
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
                                        let adddef = 60 + Math.floor(30 * Math.random()) - ((matchStats2.defUsed-1)*5);
                                        let addmr = Math.floor((eClass ? 60*eClass.stats.mr[0] : 60) + Math.floor(30 * Math.random())) - ((matchStats2.defUsed-1)*5);
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
                            if (!eAbility) return interaction.channel.send(`**${enemy.name}** does not have an ability.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            if (eAbility.used < eAbility.usage) {
                                if (matchStats.turn === 1) {
                                    if (eAbility.cost > eStatsC.sm) interaction.channel.send(`You don't have enough mana! (**${eStatsC.sm}**/${eAbility.cost}${customEmojis.mana})`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                    else {
                                        matchStats.turn = 0;
                                        matchStats2.attackStreak = 0;
                                        eAbility.used++;
                                        eAbility.ability(eStatsC, eStats, myStatsC, myStats, eBuffs, buffs, enemy, myChar, matchStats2, notice, Embed, user);
                                        eStatsC.sm -= eAbility.cost;
                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    };
                                } else interaction.channel.send(`Please wait for ${interaction.user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            } else interaction.channel.send(`You can use **${enemy.name}**'s ability only ${eAbility.usage == 1 ? "once" : `${eAbility.usage} times`} per fight.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                        });

                        cskill2.on('collect', async r => {                            
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
                        });

                    });

                });

                interaction.channel.send({ embeds: [result] });
            };

            interaction.editReply({ content: `<@${user.id}> ${interaction.user.username} challenges you to a battle. Do you accept?`, components: [row2], fetchReply: true}).then(msg2 => {
                const collector = msg2.createMessageComponentCollector({filter: (r) => r.user.id === user.id, componentType: 'BUTTON', time: 30000 });
                
                collector.on('collect', async r => {
                    collector.stop()
                    r.customId === "1" ? newFight() : interaction.channel.send("Action cancelled");
                });
            });
            
        });

    },
};