const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { abilities } = require("../Modules/abilities.js");
const { achievements } = require("../Modules/achievements.js");
const { classes } = require("../Modules/classes.js");
const { skills } = require("../Modules/skills.js");
const { characters } = require("../Modules/chars.js");
const { getDetailedStats, getId } = require("../Modules/functions.js");

const dungeonInProgress = new Set();

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

function hpbar(hp, mana) {
    let bar = "";
    if (hp > 0 && mana > 0) bar += "<:dblhm:944322994749210735>";
    else if (hp > 0) bar += "<:dblh:944322994895990855>";
    else if (mana > 0) bar += "<:dblm:944322994971476038>";
    else return "<:dbl:944322994585612319><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:dbr:944322994778554400>";

    hp > 0.1 ? hp -= 0.1 : hp=0;
    mana > 0.1 ? mana -= 0.1 : mana=0;
    let ret = 8;
    while (ret--) {
        if (hp && mana) bar += "<:dbhm:944322994942144542>";
        else if (hp) bar += "<:dbh:944322995336409128>";
        else if (mana) bar += "<:dbm:944322995088916541>";
        else bar += "<:db:944322995067957288>";
        hp > 0.1 ? hp -= 0.1 : hp=0;
        mana > 0.1 ? mana -= 0.1 : mana=0;
    };

    if (hp && mana) bar += "<:dbrhm:944322997144158318>";
    else if (hp) bar += "<:dbrh:944322995122503750>";
    else if (mana) bar += "<:dbrm:944322995135086602>";
    else bar += "<:dbr:944322994778554400>";
    return bar;
};

module.exports = {
    name: 'arena',
	description: 'arena',
	execute(interaction) {

        let user = interaction.options.getUser('user');
        
        db.serialize(async () => {
            await interaction.deferReply().catch((err) => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });
            
            var stats = await query(`SELECT users.id, users.arenawins, users.arenalosses, users.coins, users.battlechar, users.animationdelay, users.premium, characters.chars, characters.ref, characters.level, characters.class, dungeon.floors, dungeon.'limit', dungeon.classes, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${interaction.user.id}`);
            stats = {id: stats[0].id, arenawins: stats[0].arenawins, arenalosses: stats[0].arenalosses, coins: stats[0].coins, battlechar: stats[0].battlechar, animationdelay: stats[0].animationdelay, premium: stats[0].premium, chars: JSON.parse(stats[0].chars), ref: JSON.parse(stats[0].ref), level: JSON.parse(stats[0].level), class: JSON.parse(stats[0].class), limit: stats[0].limit, floors: JSON.parse(stats[0].floors), classes: JSON.parse(stats[0].classes), classlevels: JSON.parse(stats[0].classlevels)};
            
            var stats2 = await query(`SELECT users.id, users.arenawins, users.arenalosses, users.coins, users.battlechar, users.animationdelay, users.premium, characters.chars, characters.ref, characters.level, characters.class, dungeon.floors, dungeon.'limit', dungeon.classes, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${user.id}`);
            if (!stats2[0]) return interaction.editReply(`**${user.username}** hasn't started playing yet.`);
            stats2 = {id: stats2[0].id, arenawins: stats2[0].arenawins, arenalosses: stats2[0].arenalosses, coins: stats2[0].coins, battlechar: stats2[0].battlechar, animationdelay: stats2[0].animationdelay, premium: stats2[0].premium, chars: JSON.parse(stats2[0].chars), ref: JSON.parse(stats2[0].ref), level: JSON.parse(stats2[0].level), class: JSON.parse(stats2[0].class), limit: stats2[0].limit, floors: JSON.parse(stats2[0].floors), classes: JSON.parse(stats2[0].classes), classlevels: JSON.parse(stats2[0].classlevels)};

            if (stats.battlechar === null || !stats.chars.includes(stats.battlechar)) return interaction.editReply("You have to choose a battle character first. Use `/select <char name>` to choose one.");
            if (stats2.battlechar === null || !stats2.chars.includes(stats2.battlechar)) return interaction.editReply(`**${user.username}** has to choose a battle character first. Use \`/select <char name>\` to choose one.`);

            if (user.id === interaction.user.id) return interaction.editReply("Please don't fight yourself <:Heh:869656740667469864>");
            if (user.bot && user.id !== "706183309943767112") return interaction.editReply("You can't fight bots... or.. maybe you want...");
            
            // User stats
            let myChar = characters[stats.battlechar];
            let myStats = getDetailedStats(myChar.id, stats, stats.classlevels);
            let myStatsC = {...myStats};
            let myClass = myStats.class !== -1 ? classes[myStats.class] : false;
            let skill = myStats.class !== -1 ? {...skills[myStats.class]} : false;
            let myAbility = abilities[myChar.id] ? {...abilities[myChar.id]} : false;

            // Enemy Stats
            let enemy = characters[stats2.battlechar];
            let eStats = getDetailedStats(enemy.id, stats2, stats2.classlevels);
            let eStatsC = {...eStats};
            let eClass = eStats.class !== -1 ? classes[eStats.class] : false;
            let eSkill = eStats.class !== -1 ? {...skills[eStats.class]} : false;
            let eAbility = abilities[enemy.id] ? {...abilities[enemy.id]} : false;

            let buffs = {
                "hp": [], // [new buffInfo("*", 1.5, 3), new buff("+", 30, 5, 10)]
                "atk": [],
                "def": [],
                "ep": [],
                "md": [],
                "mr": [],
                "cr": [],
                "cd": [],
                "td": [],
                "br": [],
                "agility": [],
                "dodge": [],
                "mana": [],
                "mg": [],
                "sm": [],
                "rev": [],
                "revhp": [],
            };

            let eBuffs = {
                "hp": [],
                "atk": [],
                "def": [],
                "ep": [],
                "md": [],
                "mr": [],
                "cr": [],
                "cd": [],
                "td": [],
                "br": [],
                "agility": [],
                "dodge": [],
                "mana": [],
                "mg": [],
                "sm": [],
                "rev": [],
                "revhp": [],
            };

            let aDelay = stats.animationdelay;

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
                };
                if (r === "l") {
                    await query(`UPDATE users SET arenalosses = arenalosses + 1 WHERE id = ${interaction.user.id}`);
                    await query(`UPDATE users SET arenawins = arenawins + 1 WHERE id = ${user.id}`);

                    EmbedR.setDescription(`<:stars_v2:917023655840591963> **${user.username}** won! <:stars_v2:917023655840591963>\nBetter luck next time ${interaction.user.username}.`).setThumbnail(enemy.image).setFooter(`Total wins: ${stats2.arenawins+1}`, user.displayAvatarURL({ dynamic: true }) + "?size=2048");
                    
                    // Achievements
                    achievements[39].check(interaction, user, eStatsC.hp), achievements[40].check(interaction, user, eStatsC.hp), achievements[41].check(interaction, user, eStatsC.hp); // Under Pressure
                    achievements[6].check(interaction, user), achievements[7].check(interaction, user), achievements[8].check(interaction, user); // Champion
                };
                return EmbedR;
            };


            let matchStats = {
                turn: 1,
                round: 1,
                roundCheck: 1,
                turnSkill: 1,
                timeout: 0,
                blockStreak: 0,
                defUsed: 0,
                attackStreak: 0,
                p1usedblock: -1,
                p2usedblock: -1,
                combodmg: 0,
                revivedTotal: 0,
                collector: {},
                abilityUsed: 0,
                blockAbilities: 0,
                loot: 0,
                lootm: 1,
                counter: 0,
                counterChance: 1,
                currentCharacter: 0, // 1 = minion
                currentOpponent: 0,
                myStatsCC: {},
                eStatsCC: {},
                mdChance: 0,
                selfdmg: 0,
                selfheal: 0,
                selfhealChance: 0,
                twinshot: 0,
                critbleed: false,
                critbleedlast: 0,
                evadeDeathStrike: 0,
                evadeDeathChance: 0,
                consumeMana: 0,
                dodgebuff: 0,
                heap1: 0,
            };

            let matchStats2 = {
                turn: 1,
                round: 1,
                roundCheck: 1,
                turnSkill: 0,
                timeout: 0,
                blockStreak: 0,
                defUsed: 0,
                attackStreak: 0,
                combodmg: 0,
                revivedTotal: 0,
                collector: {},
                abilityUsed: 0,
                blockAbilities: 0,
                loot: 0,
                lootm: 1,
                counter: 0,
                counterChance: 1,
                currentCharacter: 0, // 1 = minion
                currentOpponent: 0,
                myStatsCC: {},
                eStatsCC: {},
                mdChance: 0,
                selfdmg: 0,
                selfheal: 0,
                selfhealChance: 0,
                twinshot: 0,
                critbleed: false,
                critbleedlast: 0,
                evadeDeathStrike: 0,
                evadeDeathChance: 0,
                consumeMana: 0,
                dodgebuff: 0,
                heap1: 0,
            };

            let notice = ["", "", "", ""];

            let atkButton = new MessageButton().setCustomId('ATK').setEmoji('⚔️').setStyle('SECONDARY');
            let defButton = new MessageButton().setCustomId('DEF').setEmoji('🛡️').setStyle('SECONDARY');
            let abilityButton = new MessageButton().setCustomId('ABILITY').setEmoji('✨').setStyle('SECONDARY').setDisabled(true);
            let skillButton = new MessageButton().setCustomId('SKILL').setEmoji('⚜️').setStyle('SECONDARY').setDisabled(true);
            
            if (myAbility || eAbility) abilityButton.setDisabled(false);
            if (myStats.class !== -1 || eStats.class !== -1) skillButton.setDisabled(false);

            const row = new MessageActionRow()
            .addComponents(atkButton, defButton, abilityButton, skillButton);

            // Player 1
            if (skill && myStats.id !== 4767 && enemy.id !== 4767) skill._passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user, interaction.commandName);
            if (myAbility?.passive && myStats.id !== 4767 && enemy.id !== 4767) myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user);

            // Player 2
            if (eSkill && myStats.id !== 4767 && enemy.id !== 4767) eSkill._passive(eStatsC, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, new MessageEmbed(), user);
            if (eAbility?.passive && myStats.id !== 4767 && enemy.id !== 4767) eAbility.passive(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, new MessageEmbed(), user);

            async function newFight() {
                let timestart = new Date().getTime();
                let result = await new Promise((resolve, rejects) => {
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setImage(enemy.image)
                    .setThumbnail(myChar.image)
                    .setTitle(`Battle Arena`)
                    .setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${enemy.name}**!\n\n${eClass ? eClass.emblem : ""}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}\\💖, **${eStatsC.sm}**/${eStatsC.mana}\\💧)\n${hpbar(eStatsC.hp/eStats.hp, eStatsC.sm/eStatsC.mana)}\n\\⚔️${eStatsC.atk},\\🛡️${eStatsC.def},\\🎯${Math.floor(eStatsC.cr*100)}%,\\💥${Math.floor(eStatsC.cd*100)}%,\n<:magic_dmg:948568336621527040>${eStatsC.md},\\🔰${eStatsC.mr},\\💨${Math.floor(eStatsC.dodge*100)}%,\\💧+${eStatsC.mg}\n-----------------------------------\n${myClass ? myClass.emblem : ""}${myChar.name}'s Stats (**${myStatsC.hp}**/${myStats.hp}\\💖, **${myStatsC.sm}**/${myStatsC.mana}\\💧)\n${hpbar(myStatsC.hp/myStats.hp, myStatsC.sm/myStatsC.mana)}\n\\⚔️${myStatsC.atk},\\🛡️${myStatsC.def},\\🎯${Math.floor(myStatsC.cr*100)}%,\\💥${Math.floor(myStatsC.cd*100)}%,\n<:magic_dmg:948568336621527040>${myStatsC.md},\\🔰${myStatsC.mr},\\💨${Math.floor(myStatsC.dodge*100)}%,\\💧+${myStatsC.mg}`)
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


                        function displayNotice() {
                            return notice[notice.length-4] + notice[notice.length-3] + notice[notice.length-2] + notice[notice.length-1];
                        };

                        function editEmbed() {
                            Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${enemy.name}**!\n\n${eClass ? eClass.emblem : ""}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}\\💖, **${eStatsC.sm}**/${eStatsC.mana}\\💧)\n${hpbar(eStatsC.hp/eStats.hp, eStatsC.sm/eStatsC.mana)}\n\\⚔️${eStatsC.atk},\\🛡️${eStatsC.def},\\🎯${Math.floor(eStatsC.cr*100)}%,\\💥${Math.floor(eStatsC.cd*100)}%,\n<:magic_dmg:948568336621527040>${eStatsC.md},\\🔰${eStatsC.mr},\\💨${Math.floor(eStatsC.dodge*100)}%,\\💧+${eStatsC.mg}\n-----------------------------------\n${myClass ? myClass.emblem : ""}${myChar.name}'s Stats (**${myStatsC.hp}**/${myStats.hp}\\💖, **${myStatsC.sm}**/${myStatsC.mana}\\💧)\n${hpbar(myStatsC.hp/myStats.hp, myStatsC.sm/myStatsC.mana)}\n\\⚔️${myStatsC.atk},\\🛡️${myStatsC.def},\\🎯${Math.floor(myStatsC.cr*100)}%,\\💥${Math.floor(myStatsC.cd*100)}%,\n<:magic_dmg:948568336621527040>${myStatsC.md},\\🔰${myStatsC.mr},\\💨${Math.floor(myStatsC.dodge*100)}%,\\💧+${myStatsC.mg}\n-----------------------------------${displayNotice()}`)
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
                                Embed.setImage(eImage);
                                matchStats.turn = 1; 
                            };
                        };

                        function checkIfEnded() {
                            if (myStatsC.hp <= 0 || eStatsC.hp <= 0) {
                                if (myStatsC.hp <= 0) {
                                    if (matchStats.currentCharacter) return minionDefeated("my");
                                    if (myStatsC.rev > Math.random()) {
                                        let feedback;
                                        myStatsC.hp += Math.floor(myStats.hp * myStatsC.revhp);
                                        if (myAbility && myAbility.update) feedback = myAbility.update(myStatsC, myStats, eStatsC, eStats, buffs, eBuffs, myChar, enemy, matchStats, notice, resolve, Embed, interaction.user);
                                        else {
                                            notice.push(`✨ ${myChar.name} survived! Restored **${myStatsC.hp}** HP`);
                                            myStatsC.rev = 0;
                                        };
                                        if (feedback === "lost") {
                                            atk.stop(), def.stop();
                                            if (myChar.id in abilities) ability.stop();
                                            if (myStatsC.class !== -1) cskill.stop();
                                            myStatsC.hp = 1;
                                            matchStats.revivedTotal--;
                                            notice.push(`\n✨ **${myChar.name}** can't beat the enemy. He ran away.`);
                                            resolve(matchResult("l"));
                                        };
                                        matchStats.revivedTotal++;
                                        editEmbed();

                                        // Achievements
                                        achievements[24].check(interaction, interaction.user, matchStats.revivedTotal), achievements[25].check(interaction, interaction.user, matchStats.revivedTotal), achievements[26].check(interaction, interaction.user, matchStats.revivedTotal); // The Show Must Go On
                                    } else {
                                        atk.stop(), def.stop();
                                        if (ability) ability.stop();
                                        if (cskill) cskill.stop();

                                        notice.push(`\n🎉 **${enemy.name}** won`);
                                        editEmbed();
                                        matchStats.turn = 1;
                                        resolve(matchResult("l"));
                                    };
                                } else {
                                    if (matchStats2.currentCharacter) return minionDefeated("e");
                                    if (eStatsC.rev > Math.random()) {
                                        let feedback;
                                        eStatsC.hp += Math.floor(eStats.hp * eStatsC.revhp);
                                        if (eAbility && eAbility.update) feedback = eAbility.update(eStatsC, eStats, myStatsC, myStats, eBuffs, buffs, enemy, myChar, matchStats2, notice, resolve, Embed, user);
                                        else {
                                            notice.push(`✨ ${enemy.name} survived! Restored **${eStatsC.hp}** HP`);
                                            eStatsC.rev = 0;
                                        };
                                        if (feedback === "lost") {
                                            atk.stop(), def.stop();
                                            if (enemy.id in abilities) ability.stop();
                                            if (eStatsC.class !== -1) cskill.stop();
                                            eStatsC.hp = 1;
                                            matchStats2.revivedTotal--;
                                            notice.push(`\n✨ **${enemy.name}** can't beat the enemy. He ran away.`);
                                            resolve(matchResult("w"));
                                        };
                                        matchStats2.revivedTotal++;
                                        editEmbed();

                                        // Achievements
                                        achievements[24].check(interaction, user, matchStats2.revivedTotal), achievements[25].check(interaction, user, matchStats2.revivedTotal), achievements[26].check(interaction, user, matchStats2.revivedTotal); // The Show Must Go On
                                    } else {
                                        atk.stop(), def.stop();
                                        if (ability) ability.stop();
                                        if (cskill) cskill.stop();

                                        notice.push(`\n🎉 **${myChar.name}** won`);
                                        editEmbed();
                                        matchStats.turn = 1;
                                        resolve(matchResult("w"));
                                    };
                                };
                            };
                        };
                        
                        function startNextRound() {
                            if (matchStats.round === matchStats.roundCheck) return;
                            matchStats.roundCheck = matchStats.round;
                            if (matchStats.currentCharacter || matchStats.currentOpponent || matchStats2.currentCharacter) return;

                            if (matchStats.consumeMana > 0) {
                                myStatsC.sm -= matchStats.consumeMana;
                                if (matchStats.consumeMana > myStatsC.sm) {
                                    
                                    matchStats.heap1.forEach((e) => {
                                        buffs[e.type].forEach((a, i) => {
                                            if (a.id === e.id) buffs[e.type].splice(i, 1);
                                        });
                                        if (e.type === "mg") myStatsC[e.type] += e.buff;
                                        else myStatsC[e.type] -= e.buff;
                                    });
                                    matchStats.consumeMana = 0;
                                    matchStats.heap1 = [];
                                    notice.push(`\n⚜️ **${myChar.name}** stopped ${myChar.gender === "F" ? "her" : "his"} transformation`);
                                return;};
                            };
                            if (matchStats2.consumeMana > 0) {
                                eStatsC.sm -= matchStats2.consumeMana;
                                if (matchStats2.consumeMana > eStatsC.sm) {
                                    
                                    matchStats2.heap1.forEach((e) => {
                                        buffs[e.type].forEach((a, i) => {
                                            if (a.id === e.id) buffs[e.type].splice(i, 1);
                                        });
                                        if (e.type === "mg") eStatsC[e.type] += e.buff;
                                        else eStatsC[e.type] -= e.buff;
                                    });
                                    matchStats2.consumeMana = 0;
                                    matchStats2.heap1 = [];
                                    notice.push(`\n⚜️ **${enemy.name}** stopped ${myChar.gender === "F" ? "her" : "his"} transformation`);
                                return;};
                            };
                            
                            let mysm = myStatsC.sm, mymana = myStatsC.mana, esm = eStatsC.sm, myhp = myStatsC.hp, myhpm = myStatsC.maxhp, ehp = eStatsC.hp, myrev = myStatsC.rev, myrevh = myStatsC.revhp;
                            myStatsC = {...myStats}, eStatsC = {...eStats};
                            myStatsC.sm = mysm, myStatsC.mana = mymana, eStatsC.sm = esm, myStatsC.hp = myhp, myStatsC.maxhp = myhpm, eStatsC.hp = ehp, myStatsC.rev = myrev, myStatsC.revhp = myrevh;
                            function applyBuffs(obj, stats) {
                                Object.keys(obj).forEach((stat) => {
                                    if (obj[stat].length) obj[stat].forEach((buff) => {
                                        switch (buff.type) {
                                            case "*": stats[stat] = Math.floor(stats[stat] * buff.val); break;
                                            case "+": stats[stat] += buff.val; break;
                                            case "=": stats[stat] = buff.val; break;
                                            default : false; break;
                                        };
                                        switch (buff.ctype) {
                                            case "*": buff._val = Math.floor(buff.val * buff.change); break;
                                            case "+": buff._val += buff.change; break;
                                            case "=": buff._val = buff.change; break;
                                            default : false; break;
                                        };
                                        buff._last--;
                                    });
                                    if (obj[stat].length) obj[stat] = obj[stat].filter((buff) => buff.last);
                                });
                                stats.sm += stats.mg;
                                if (stats.sm > stats.mana) stats.sm = stats.mana;
                            };
                            applyBuffs(buffs, myStatsC);
                            applyBuffs(eBuffs, eStatsC);
                            if (myStatsC.hp > myStatsC.maxhp) myStatsC.hp = myStatsC.maxhp;
                            else if (myStatsC.hp < 0) myStatsC.hp = 0;
                            if (eStatsC.hp > eStatsC.maxhp) eStatsC.hp = eStatsC.maxhp;
                            else if (eStatsC.hp < 0) eStatsC.hp = 0;
                        };

                        atk.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                            });
                            
                            if (matchStats.turn === 0) {
                                matchStats.turn = 1;
                                function playerAttack(twin=false) {
                                    if (matchStats.p2usedblock === matchStats.round-1 && Math.random() < eStatsC.br) {
                                        matchStats.attackStreak = 0;
                                        notice.push(`\n🛡️ **${enemy.name}** blocked your attack!`);
                                    } else if (Math.random() < eStatsC.dodge && !matchStats2.counter) {
                                            if (matchStats2.dodgebuff) eBuffs.atk.push(new buffInfo("*", 1+matchStats2.dodgebuff, 9999));
                                            notice.push(`\n💨 **${enemy.name}** dodged the attack!${matchStats2.dodgebuff ? ` Gained **+${matchStats2.dodgebuff*100}%** ATK` : ""}`);
                                    } else {
                                        let ranum = Math.random(), dmg; // Crit ?
                                        if (Math.random() < matchStats.mdChance) { // Magic Damage ?
                                            dmg = Math.floor((myStatsC.md * (1+(matchStats.attackStreak*matchStats.combodmg)) * Math.pow(0.99818, eStatsC.mr)) * (1 - (0.2*Math.random())) * (ranum < myStatsC.cr ? myStatsC.cd : 1));
                                            notice.push(`\n⚔️ **${myChar.name}** has dealt${ranum < myStatsC.cr ? " a critical hit!" : ""} **${dmg}** magic damage`);
                                        } else {
                                            dmg = Math.floor((myStatsC.atk * (1+(matchStats.attackStreak*matchStats.combodmg)) * Math.pow(0.99818, eStatsC.def)) * (1 - (0.2*Math.random())) * (ranum < myStatsC.cr ? myStatsC.cd : 1));
                                            notice.push(`\n⚔️ **${myChar.name}** has dealt${ranum < myStatsC.cr ? " a critical hit!" : ""} **${dmg}** damage`);
                                        };
                                        eStatsC.hp -= dmg;
                                        matchStats.attackStreak++;
                                        if (ranum < myStatsC.cr && matchStats.critbleed) eBuffs.hp.push(new buffInfo("+", -eStatsC.maxhp*0.05, matchStats.critbleedlast));
                                        myStatsC.hp -= Math.floor(dmg * matchStats.selfdmg);
                                        if (matchStats.selfhealChance > Math.random()) myStatsC.hp += Math.floor(dmg * matchStats.selfheal);
                                    };
                                    if (eStatsC.hp < 1) eStatsC.hp = 0;
                                };
                                playerAttack();
                                if (eStatsC.hp && matchStats.twinshot > Math.random()) {
                                    editEmbed();
                                    checkIfEnded();
                                    setTimeout(() => { playerAttack(true) }, aDelay);
                                };
                                matchStats.round++;
                                startNextRound();
                                editEmbed();
                                checkIfEnded();
                            } else interaction.channel.send(`Please wait for ${user.username} to make a move`);
                        });

                        def.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                            });
                            
                            if (matchStats.turn === 0) {
                                if (matchStats.defUsed++ > 9) return interaction.channel.send("You can use DEF only 10 times per match.");
                                matchStats.turn = 1;
                                matchStats.p1usedblock = matchStats.round;
                                matchStats.attackStreak = 0;
                                let adddef = 60 + Math.floor(30 * Math.random());
                                let addmr = Math.floor((myClass ? 60*myClass.stats.mr[0] : 60) + (30 * Math.random()));
                                buffs.def.push(new buffInfo("+", adddef, 9999));
                                buffs.mr.push(new buffInfo("+", addmr, 9999));
                                myStatsC.def += adddef;
                                myStatsC.mr += addmr;
                                notice.push(`\n🛡️ **${myChar.name}** has increased DEF by **${adddef}** and MR by **${addmr}**`);
                                
                                matchStats.round++;
                                startNextRound();
                                editEmbed();
                                checkIfEnded();
                            } else interaction.channel.send(`Please wait for ${user.username} to make a move`);
                        });

                        ability.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                            });
                            
                            if (!myAbility) return interaction.channel.send(`**${myChar.name}** does not have an ability.`);
                            if (myAbility.used < myAbility.usage) {
                                if (matchStats.turn === 0) {
                                    if (myAbility.cost > myStatsC.sm) interaction.channel.send(`You don't have enough mana! (**${myStatsC.sm}**/${myAbility.cost}\\💧)`);
                                    else {
                                        matchStats.turn = 1;
                                        matchStats.attackStreak = 0;
                                        myAbility.used++;
                                        myAbility.ability(myStatsC, myStats, eStatsC, eStats, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                        myStatsC.sm -= myAbility.cost;
                                        matchStats.round++;
                                        startNextRound();
                                        editEmbed();
                                        checkIfEnded();
                                    };
                                } else interaction.channel.send(`Please wait for ${user.username} to make a move`);
                            } else interaction.channel.send(`You can use **${myChar.name}**'s ability only ${myAbility.usage == 1 ? "once" : `${myAbility.usage} times`} per fight.`);
                        });

                        cskill.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                            });
                            
                            if (!myClass) return interaction.channel.send(`**${myChar.name}** does not have a class.`);
                            if (myStats.id === 4767 && enemy.id === 4767) return interaction.channel.send("Ability usages are blocked this round.");
                            if (skill._cost > myStatsC.sm) interaction.channel.send(`You don't have enough mana! (**${myStatsC.sm}**/${skill._cost}\\💧)`);
                            else {
                                if (matchStats.turn === 0) {
                                    myStatsC.sm -= skill._cost;
                                    matchStats.attackStreak = 0;
                                    skill._skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    matchStats.round++;
                                    startNextRound();
                                    editEmbed();
                                    checkIfEnded();
                                } else interaction.channel.send(`Please wait for ${user.username} to make a move`);
                            };
                        });

                        atk2.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                            });
                            
                            if (matchStats.turn === 1) {
                                matchStats.turn = 0;
                                function playerAttack(twin=false) {
                                    if (matchStats.p1usedblock === matchStats.round && Math.random() < myStatsC.br) {
                                        matchStats2.attackStreak = 0;
                                        notice.push(`\n🛡️ **${myChar.name}** blocked your attack!`);
                                    } else if (Math.random() < myStatsC.dodge && !matchStats.counter) {
                                        if (matchStats.dodgebuff) buffs.atk.push(new buffInfo("*", 1+matchStats.dodgebuff, 9999));
                                        notice.push(`\n💨 **${myChar.name}** dodged the attack!${matchStats.dodgebuff ? ` Gained **+${matchStats.dodgebuff*100}%** ATK` : ""}`);
                                    } else {
                                        let ranum = Math.random(), dmg; // Crit ?
                                        if (Math.random() < matchStats2.mdChance) { // Magic Damage ?
                                            dmg = Math.floor((eStatsC.md * (1+(matchStats2.attackStreak*matchStats2.combodmg)) * Math.pow(0.99818, myStatsC.mr)) * (1 - (0.2*Math.random())) * (ranum < eStatsC.cr ? eStatsC.cd : 1));
                                            notice.push(`\n⚔️ **${enemy.name}** has dealt${ranum < eStatsC.cr ? " a critical hit!" : ""} **${dmg}** magic damage`);
                                        } else {
                                            dmg = Math.floor((eStatsC.atk * (1+(matchStats2.attackStreak*matchStats2.combodmg)) * Math.pow(0.99818, myStatsC.def)) * (1 - (0.2*Math.random())) * (ranum < eStatsC.cr ? eStatsC.cd : 1));
                                            notice.push(`\n⚔️ **${enemy.name}** has dealt${ranum < eStatsC.cr ? " a critical hit!" : ""} **${dmg}** damage`);
                                        };
                                        myStatsC.hp -= dmg;
                                        matchStats2.attackStreak++;
                                        if (ranum < eStatsC.cr && matchStats2.critbleed) buffs.hp.push(new buffInfo("+", -myStatsC.maxhp*0.05, matchStats2.critbleedlast));
                                        eStatsC.hp -= Math.floor(dmg * matchStats2.selfdmg);
                                        if (matchStats2.selfhealChance > Math.random()) eStatsC.hp += Math.floor(dmg * matchStats2.selfheal);
                                    };
                                    if (myStatsC.hp < 1) myStatsC.hp = 0;
                                    editEmbed();
                                    checkIfEnded();
                                };
                                playerAttack();
                                if (myStatsC.hp && matchStats2.twinshot > Math.random()) {
                                    setTimeout(() => { playerAttack(true) }, aDelay);
                                };
                            } else interaction.channel.send(`Please wait for ${interaction.user.username} to make a move`);
                        });

                        def2.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                            });
                            
                            if (matchStats.turn === 1) {
                                if (matchStats2.defUsed++ > 9) return interaction.channel.send("You can use DEF only 10 times per match.");
                                matchStats.turn = 0;
                                matchStats.p2usedblock = matchStats.round;
                                matchStats2.attackStreak = 0;
                                let adddef = 60 + Math.floor(30 * Math.random());
                                let addmr = Math.floor((eClass ? 60*eClass.stats.mr[0] : 60) + Math.floor(30 * Math.random()));
                                eBuffs.def.push(new buffInfo("+", adddef, 9999));
                                eBuffs.mr.push(new buffInfo("+", addmr, 9999));
                                eStatsC.def += adddef;
                                eStatsC.mr += addmr;
                                notice.push(`\n🛡️ **${enemy.name}** has increased DEF by **${adddef}** and MR by **${addmr}**`);
                                
                                editEmbed();
                                checkIfEnded();
                            } else interaction.channel.send(`Please wait for ${interaction.user.username} to make a move`);
                        });

                        ability2.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                            });
                            
                            if (!eAbility) return interaction.channel.send(`**${enemy.name}** does not have an ability.`);
                            if (eAbility.used < eAbility.usage) {
                                if (matchStats.turn === 1) {
                                    if (eAbility.cost > eStatsC.sm) interaction.channel.send(`You don't have enough mana! (**${eStatsC.sm}**/${eAbility.cost}\\💧)`);
                                    else {
                                        matchStats.turn = 0;
                                        matchStats2.attackStreak = 0;
                                        eAbility.used++;
                                        eAbility.ability(eStatsC, eStats, myStatsC, myStats, eBuffs, buffs, enemy, myChar, matchStats2, notice, Embed, user);
                                        eStatsC.sm -= eAbility.cost;
                                        editEmbed();
                                        checkIfEnded();
                                    };
                                } else interaction.channel.send(`Please wait for ${interaction.user.username} to make a move`);
                            } else interaction.channel.send(`You can use **${enemy.name}**'s ability only ${eAbility.usage == 1 ? "once" : `${eAbility.usage} times`} per fight.`);
                        });

                        cskill2.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                            });
                            
                            if (!eClass) return interaction.channel.send(`**${enemy.name}** does not have a class.`);
                            if (myStats.id === 4767 && enemy.id === 4767) return interaction.channel.send("Ability usages are blocked this round.");
                            if (eSkill._cost > eStatsC.sm) interaction.channel.send(`You don't have enough mana! (**${eStatsC.sm}**/${eSkill._cost}\\💧)`);
                            else {
                                if (matchStats.turn === 1) {
                                    eStatsC.sm -= eSkill._cost;
                                    matchStats2.attackStreak = 0;
                                    eSkill._skill(eStatsC, myStatsC, eBuffs, buffs, enemy, myChar, matchStats2, notice, Embed, user);
                                    matchStats.turn = matchStats2.turn;
                                    editEmbed();
                                    checkIfEnded();
                                } else interaction.channel.send(`Please wait for ${interaction.user.username} to make a move`);
                            };
                        });

                    });

                });

                interaction.channel.send({ embeds: [result] });
            };
            
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

            interaction.editReply({ content: `${user.toString()} ${interaction.user.username} challenges you to a battle. Do you accept?`, components: [row2], fetchReply: true}).then(msg2 => {
                const collector = msg2.createMessageComponentCollector({filter: (r) => r.user.id === user.id, componentType: 'BUTTON', time: 30000 });
                
                collector.on('collect', async r => {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                    });

                    collector.stop()
                    r.customId === "1" ? newFight() : interaction.channel.send("Action cancelled");
                });
            });
            
        });

    },
};