var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { abilities } = require("../Modules/abilities.js");
const { achievements } = require("../Modules/achievements.js");
const { classes } = require("../Modules/classes.js");
const { curses } = require("../Modules/curses.js");
const { enemies } = require("../Modules/enemies.js");
const { skills, bossAbilities } = require("../Modules/skills.js");
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
    name: 'dungeon',
	description: 'dungeon',
	execute(interaction) {

        var customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        let choice = interaction.options.getInteger('floor');
        let flag = interaction.options.getString('flag');
        
        db.serialize(async () => {
            await interaction.deferReply().catch((err) => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });

            var stats = await query(`SELECT users.id, users.coins, users.battlechar, users.animationdelay, users.premium, characters.chars, characters.ref, characters.level, characters.class, dungeon.floors, dungeon.'limit', dungeon.classes, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${interaction.user.id}`);
            stats = {id: stats[0].id, coins: stats[0].coins, battlechar: stats[0].battlechar, animationdelay: stats[0].animationdelay, premium: stats[0].premium, chars: JSON.parse(stats[0].chars), ref: JSON.parse(stats[0].ref), level: JSON.parse(stats[0].level), class: JSON.parse(stats[0].class), limit: stats[0].limit, floors: JSON.parse(stats[0].floors), classes: JSON.parse(stats[0].classes), classlevels: JSON.parse(stats[0].classlevels)};
            
            if (stats.battlechar === null || !stats.chars.includes(stats.battlechar)) return interaction.editReply("You have to choose a battle character first. Use `/select <char name>` to choose one.");
            
            let floor = parseInt(Object.keys(stats.floors)[Object.keys(stats.floors).length-1]);
            let winsNeeded = enemies.filter((e) => e.floor.includes(floor))[0]?.boss ? 1 : 20;
            if (stats.floors[floor] >= winsNeeded && floor !== 100) stats.floors[++floor] = 0;

            if (choice) {
                if (choice < 1) return interaction.editReply(`There is no floor ${choice} <:EmiliaWot:868996542080622603>`);
                if (choice > floor) return interaction.editReply(`You haven't unlocked Floor ${choice} yet. You need 20 wins per floor to unlock the next one.`);
                floor = choice;
            };
            if (floor > 100) floor = 100;
            
            // Increase limit
            let dunLim = [10, 20]; // [0] -> loot, [1] -> progress
            if (stats.premium) {
                switch (stats.premium) {
                    case 1: dunLim = [12, 25]; break;
                    case 2: dunLim = [15, 30]; break;
                    case 3: dunLim = [20, 40]; break;
                    case 4: dunLim = [25, 40]; break;
                    case 5: dunLim = [30, 40]; break;
                    case 6: dunLim = [30, 50]; break;
                    case 7: dunLim = [30, 60]; break;
                    default : false; break;
                };
            };
            
            // Check if user can skip
            if (flag === "skip" && dunLim[0] - stats.limit <= 0) return interaction.editReply("You've already used up all your skips for this interval.");

            // Set up restrictions
            if (dungeonInProgress.has(stats.id)) return interaction.editReply("You already have a run in progress, please finish it before attempting to start a new round.");
            dungeonInProgress.add(stats.id);
            const userTimeout = setTimeout(() => dungeonInProgress.delete(stats.id), 120000);
            
            // Increase run count
            stats.limit++;
            await query(`UPDATE dungeon SET 'limit' = ${stats.limit} WHERE id = ${interaction.user.id}`);
            
            // User stats
            let myChar = characters[stats.battlechar];
            let myStats = getDetailedStats(myChar.id, stats, stats.classlevels);
            let myStatsC = {...myStats};
            let myClass = myStats.class !== -1 ? classes[myStats.class] : false;
            let skill = myStats.class !== -1 ? {...skills[myStats.class]} : false;
            let myAbility = abilities[myChar.id] ? {...abilities[myChar.id]} : false;

            let thumbnail = myChar.image;
            if (stats.premium > 2) thumbnail = customSettings[interaction.user.id]?.cimg[myChar.id] || myChar.image;

            // Enemy Stats
            let enemy = enemies.filter((e) => e.floor.includes(floor))[Math.floor(Math.random() * (enemies.filter((e) => e.floor.includes(floor)).length))]
            let ebStats = enemy.stats(floor);
            let curseRar = enemy.boss ? curses.filter((e) => e.tier) : curses.filter((e) => e.tier === 0);
            let curse = curseRar[Math.floor(Math.random() * curseRar.length)];
            let eAbility = enemy.boss ? bossAbilities.find((e) => e.list[0] === floor) : false;
            let eImage = enemy.image[Math.floor(Math.random()*enemy.image.length)];

            let eStats = {
                "hp": ebStats[0],
                "maxhp": ebStats[0],
                "atk": ebStats[1],
                "def": ebStats[2],
                "ep": ebStats[3],
                "md": ebStats[1],
                "mr": ebStats[2],
                "cr": 0.18,
                "cd": 1.25,
                "td": ebStats[1],
                "br": 0.2,
                "agility": 80,
                "dodge": 0.1,
                "mana": 80,
                "mg": 15,
                "sm": 20,
                "rev": 0,
                "revhp": 0.5,
            };
            let eStatsC = {...eStats};

            let difficulty;
            if (myStats.ep/eStats.ep >= 1.25) difficulty = "<a:arrow_green:916716811842621450> Difficulty: **Easy**";
            else if (myStats.ep/eStats.ep >= 0.75) difficulty = "<a:arrow_orange:916716747623641210> Difficulty: **Medium**";
            else if (myStats.ep/eStats.ep >= 0.5) difficulty = "<a:arrow_red:916716702618767401> Difficulty: **Hard**";
            else difficulty = "<a:arrow_black:916718325386588221> Difficulty: **Impossible**";
            
            let aDelay = stats.animationdelay;

            let buffs = {
                "hp": [], // [new buff("*", 1.5, 3), new buff("+", 30, 5, 10)]
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

             async function matchResult(r) {
                // Clear restrictions
                clearTimeout(userTimeout);
                dungeonInProgress.delete(stats.id);

                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setThumbnail(thumbnail)
                .setTitle(`Dungeon Floor ${floor} ${enemy.boss ? "(Boss)" : ""}`)
                .setFooter(`Balance: ${stats.coins} coins`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                if (r === "l") return Embed.setDescription(`💀 **${myChar.name}** lost 💀\n<a:arrow_green:916716811842621450> Floor ${floor} progress: **${stats.floors[floor]}**/${enemies.filter((e) => e.floor.includes(floor))[0].boss ? "1" : "20"}\n<a:arrow_orange:916716747623641210> Runs left: **${stats.limit < dunLim[0] ? dunLim[0] - stats.limit : 0}** + **${stats.limit < dunLim[1] ? dunLim[1] - stats.limit : 0}**\n<a:arrow_red:916716702618767401> ${eStats.ep > myStats.ep ? `**${enemy.name}** was ${Math.floor((eStats.ep/myStats.ep)*10000)/100}% stronger` : "Better luck next time"}`);

                if (dunLim[1] - stats.limit >= 0) stats.floors[floor]++;

                let unlocked = `<a:arrow_green:916716811842621450> Floor ${floor} progress: **${stats.floors[floor]}**/${enemies.filter((e) => e.floor.includes(floor))[0].boss ? "1" : "20"}`;
                if ((enemies.filter((e) => e.floor.includes(floor))[0].boss && stats.floors[floor] === 1) || (!enemies.filter((e) => e.floor.includes(floor))[0].boss && stats.floors[floor] === 20)) {
                    unlocked = `🔑 Floor **${floor+1}** has been unlocked`;
                    stats.floors[floor+1] = 0;

                    // Achievements
                    achievements[34].check(interaction, interaction.user, floor+1), achievements[35].check(interaction, interaction.user, floor+1), achievements[36].check(interaction, interaction.user, floor+1), achievements[37].check(interaction, interaction.user, floor+1), achievements[38].check(interaction, interaction.user, floor+1); // Challenger
                };

                // Class Level
                let cxpmsg = "You don't have a class";
                if (myClass) {
                    let boost = 1;
                    stats.classes.map((e) => classes[e].tier).forEach((e) => {
                        switch (e) {
                            case 2: boost += 0.05; break;
                            case 3: boost += 0.15; break;
                            case 4: boost += 0.25; break;
                            default: false; break;
                        };
                    });
                    if (stats.premium) {
                        switch (stats.premium) {
                            case 3: boost += 0.2; break;
                            case 4: boost += 0.3; break;
                            case 5: boost += 0.5; break;
                            case 6: boost += 0.75; break;
                            case 7: boost += 1; break;
                            default : false; break;
                        };
                    };
                    boost = Math.round(boost*100)/100;
                    if (new Date().getDay() === 6 || new Date().getDay() === 0) boost *= 2;
                    let cxp = Math.floor((10 + floor - Math.ceil(Math.random() * 10)) * boost) + 3; // 4-13 -> 103-112
                    if (enemy.boss) cxp = Math.floor(cxp*1.5);
                    cxpmsg = `Class XP: **${cxp}** (Boost: x${boost}${new Date().getDay() === 6 || new Date().getDay() === 0 ? " weekend" : ""})`;
                    if (myClass.id in stats.classlevels) stats.classlevels[myClass.id] += cxp;
                    else stats.classlevels[myClass.id] = cxp;
                };

                Embed.setDescription(`<:stars_v2:917023655840591963> **${myChar.name}** won! <:stars_v2:917023655840591963>\n${unlocked}\n<a:arrow_orange:916716747623641210> Runs left: **${stats.limit < dunLim[0] ? dunLim[0] - stats.limit : 0}** loot **${stats.limit < dunLim[1] ? dunLim[1] - stats.limit : 0}** progress\n<a:arrow_yellow:916716780045619200> ${cxpmsg}`);

                // Achievements
                if (enemies.filter((e) => e.floor.includes(floor))[0].boss) achievements[27].check(interaction, interaction.user, stats.floors[floor]), achievements[28].check(interaction, interaction.user, stats.floors[floor]), achievements[29].check(interaction, interaction.user, stats.floors[floor]); // Coming Back
                achievements[39].check(interaction, interaction.user, myStatsC.hp), achievements[40].check(interaction, interaction.user, myStatsC.hp), achievements[41].check(interaction, interaction.user, myStatsC.hp); // Under Pressure
                
                let loot = Math.floor(((dunLim[0] - stats.limit >= 0) ? 80 + (floor * 5) + (Math.floor(Math.random() * 30) * Math.random() < 0.5 ? 1 : -1) : 0)*matchStats.lootm + matchStats.loot);
                
                function shardCount(p, n) {
                    let shard = 0;
                    for (si=0; si < n; si++) {
                        shard += Math.floor((1+(p*Math.ceil(floor/10)))*Math.random());
                    };
                    return shard;
                };
                
                let ssShards = 0, sShards = 0, aShards = 0, bShards = 0, cShards = 0, dShards = 0;
                if (dunLim[0] - stats.limit >= 0) {
                    ssShards = shardCount(0.01, 3);
                    sShards = shardCount(0.016, 5);
                    aShards = shardCount(0.026, 7);
                    bShards = shardCount(0.067, 9);
                    cShards = shardCount(0.098, 12);
                    dShards = shardCount(0.13, 15);
                    if (enemies.filter((e) => e.floor.includes(floor))[0].boss && stats.floors[floor] === 1) ssShards += 2, loot *= 2;
                };

                Embed.setFooter(`Balance: ${stats.coins+loot} coins`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048");
                
                let lootArr = [loot];
                if (ssShards) lootArr.push(`<:ss_shard:917203009543503892>x${ssShards}`);
                if (sShards) lootArr.push(`<:s_shard:917202925514817566>x${sShards}`);
                if (aShards) lootArr.push(`<:a_shard:917202904862052392>x${aShards}`);
                if (bShards) lootArr.push(`<:b_shard:917202862851899392>x${bShards}`);
                if (cShards) lootArr.push(`<:c_shard:917202862499582002>x${cShards}`);
                if (dShards) lootArr.push(`<:d_shard:917202840563363891>x${dShards}`);

                if (lootArr.length > 6) {
                    Embed.addFields(
                        { name: '<:npbag:929428030554787892> Loot', value: `${loot}<:coins:872926669055356939>\n${lootArr[3]}\n${lootArr[6]}`, inline: true },
                        { name: '\u200B', value: `${lootArr[1]}\n${lootArr[4]}`, inline: true },
                        { name: '\u200B', value: `${lootArr[2]}\n${lootArr[5]}`, inline: true },
                    )
                } else if (lootArr.length === 6) {
                    Embed.addFields(
                        { name: '<:npbag:929428030554787892> Loot', value: `${loot}<:coins:872926669055356939>\n${lootArr[3]}`, inline: true },
                        { name: '\u200B', value: `${lootArr[1]}\n${lootArr[4]}`, inline: true },
                        { name: '\u200B', value: `${lootArr[2]}\n${lootArr[5]}`, inline: true },
                    )
                } else if (lootArr.length === 5) {
                    Embed.addFields(
                        { name: '<:npbag:929428030554787892> Loot', value: `${loot}<:coins:872926669055356939>\n${lootArr[3]}`, inline: true },
                        { name: '\u200B', value: `${lootArr[1]}\n${lootArr[4]}`, inline: true },
                        { name: '\u200B', value: `${lootArr[2]}`, inline: true },
                    )
                } else if (lootArr.length === 4) {
                    Embed.addFields(
                        { name: '<:npbag:929428030554787892> Loot', value: `${loot}<:coins:872926669055356939>\n${lootArr[3]}`, inline: true },
                        { name: '\u200B', value: `${lootArr[1]}`, inline: true },
                        { name: '\u200B', value: `${lootArr[2]}`, inline: true },
                    )
                } else if (lootArr.length === 3) {
                    Embed.addFields(
                        { name: '<:npbag:929428030554787892> Loot', value: `${loot}<:coins:872926669055356939>`, inline: true },
                        { name: '\u200B', value: `${lootArr[1]}`, inline: true },
                        { name: '\u200B', value: `${lootArr[2]}`, inline: true },
                    )
                } else if (lootArr.length === 2) {
                    Embed.addFields(
                        { name: '<:npbag:929428030554787892> Loot', value: `${loot}<:coins:872926669055356939>`, inline: true },
                        { name: '\u200B', value: `${lootArr[1]}`, inline: true },
                    )
                } else {
                    Embed.addFields(
                        { name: '<:npbag:929428030554787892> Loot', value: `${loot}<:coins:872926669055356939>`, inline: true },
                    )
                };
                
                await query(`UPDATE users SET coins = coins + ${loot}, ssshard = ssshard + ${ssShards}, sshard = sshard + ${sShards}, ashard = ashard + ${aShards}, bshard = bshard + ${bShards}, cshard = cshard + ${cShards}, dshard = dshard + ${dShards} WHERE id = ${interaction.user.id}`);
                await query(`UPDATE dungeon SET floors = '${JSON.stringify(stats.floors)}', classlevels = '${JSON.stringify(stats.classlevels)}' WHERE id = ${interaction.user.id}`);

                return Embed;
            };

            let matchStats = {
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

            // Buttons
            let atkButton = new MessageButton().setCustomId('ATK').setEmoji('⚔️').setStyle('SECONDARY');
            let defButton = new MessageButton().setCustomId('DEF').setEmoji('🛡️').setStyle('SECONDARY');
            let abilityButton = new MessageButton().setCustomId('ABILITY').setEmoji('✨').setStyle('SECONDARY').setDisabled(true);
            let skillButton = new MessageButton().setCustomId('SKILL').setEmoji('⚜️').setStyle('SECONDARY').setDisabled(true);
            let skipButton = new MessageButton().setCustomId('SKIP').setEmoji('⏩').setStyle('SECONDARY').setDisabled(true);
            
            if (myAbility) abilityButton.setDisabled(false);
            if (myStats.class !== -1) skillButton.setDisabled(false);
            if (dunLim[0] - stats.limit >= 0) skipButton.setDisabled(false);

            const row = new MessageActionRow()
            .addComponents(atkButton, defButton, abilityButton, skillButton, skipButton);

            if (skill && myChar.id !== 4767) skill._passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user, interaction.commandName);
            if (myAbility?.passive && myChar.id !== 4767) myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user);
            
            if (flag === "skip") {
                while (eStatsC.hp > 0 && myStatsC.hp > 0) {
                    if (Math.random() > 0.02 + (0.1*(eStatsC.ep/myStatsC.ep))) eStatsC.hp -= Math.floor((myStatsC.atk * Math.pow(0.99818, eStatsC.def)) * (1 - (0.2*Math.random())));
                    if (eStatsC.hp < 0) eStatsC.hp = 0;
                    if (eStatsC.hp > 0) myStatsC.hp -= Math.floor((eStatsC.atk * Math.pow(0.99818, myStatsC.def)) * (1 - (0.2*Math.random())));
                    if (myStatsC.hp < 0) myStatsC.hp = 0;
                };
                
                let result = await new Promise((resolve, reject) => {
                    myStatsC.hp <= 0 ? resolve(matchResult("l")) : resolve(matchResult("w"));
                });
                return interaction.editReply({ embeds: [result] });
            };

            async function newFight() {
                let timestart = new Date().getTime();
                let result = await new Promise((resolve, rejects) => {
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setThumbnail(thumbnail)
                    .setFooter(`Enemy EP: ${eStatsC.ep} | time left: 120s`)
                    .setTitle(`Dungeon Floor ${floor} ${enemy.boss ? "(Boss)" : ""}`)
                    .setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}\\💖, **${eStatsC.sm}**/${eStatsC.mana}\\💧)\n${hpbar(eStatsC.hp/eStats.hp, eStatsC.sm/eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStats.hp}\\💖, **${myStatsC.sm}**/${myStatsC.mana}\\💧)\n${hpbar(myStatsC.hp/myStats.hp, myStatsC.sm/myStatsC.mana)}\n\\⚔️${myStatsC.atk},\\🛡️${myStatsC.def},\\🎯${Math.floor(myStatsC.cr*100)}%,\\💥${Math.floor(myStatsC.cd*100)}%,\n<:magic_dmg:948568336621527040>${myStatsC.md},\\🔰${myStatsC.mr},\\💨${Math.floor(myStatsC.dodge*100)}%,\\💧+${myStatsC.mg}`)
                    .setImage(eImage)
                    interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {
    
                        const atk = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "ATK", componentType: 'BUTTON', time: 120000 });
                        const def = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "DEF", componentType: 'BUTTON', time: 120000 });
                        const ability = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "ABILITY", componentType: 'BUTTON', time: 120000 });
                        const cskill = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "SKILL", componentType: 'BUTTON', time: 120000 });
                        const skip = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "SKIP", componentType: 'BUTTON', time: 120000 });
                        matchStats.collector = {"atk": atk, "def": def, "ability": ability, "cskill": cskill, "skip": skip};
                        
    
                        // Use passives
                        if (myChar.id !== 4767) curse.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
    
                        function displayNotice() {
                            return notice[notice.length-4] + notice[notice.length-3] + notice[notice.length-2] + notice[notice.length-1];
                        };
    
                        let timeout;
                        async function editEmbed() {
                            Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}, **${eStatsC.sm}**/${eStatsC.mana}\\💧)\n${hpbar(eStatsC.hp/eStatsC.maxhp, eStatsC.sm/eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}, **${myStatsC.sm}**/${myStatsC.mana}\\💧)\n${hpbar(myStatsC.hp/myStatsC.maxhp, myStatsC.sm/myStatsC.mana)}\n\\⚔️${myStatsC.atk},\\🛡️${myStatsC.def},\\🎯${Math.floor(myStatsC.cr*100)}%,\\💥${Math.floor(myStatsC.cd*100)}%,\n<:magic_dmg:948568336621527040>${myStatsC.md},\\🔰${myStatsC.mr},\\💨${Math.floor(myStatsC.dodge*100)}%,\\💧+${myStatsC.mg}\n-----------------------------------${displayNotice()}`);
                            Embed.setFooter(`Enemy EP: ${eStatsC.ep} | time left: ${120+Math.floor((timestart-new Date().getTime())/1000)}s`);
                            
                            // Debounce
                            clearTimeout(timeout);
                            timeout = setTimeout(() => {
                                msg.edit({ embeds: [Embed] });
                            }, 600);
                        };
    
                        function minionDefeated(side) {
                            if (side === "my") {
                                myStatsC = {...matchStats.myStatsCC};
                                matchStats.currentCharacter = 0;
                                Embed.setThumbnail(thumbnail);
                                startNextRound();
                            } else {
                                eStatsC = {...matchStats.eStatsCC};
                                matchStats.currentOpponent = 0;
                                Embed.setImage(eImage);
                                attack();
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
                                            atk.stop(), def.stop(), skip.stop();
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
                                        atk.stop(), def.stop(), skip.stop();
                                        if (myChar.id in abilities) ability.stop();
                                        if (myStats.class !== -1) cskill.stop();
    
                                        notice.push(`\n💀 **${myChar.name}** lost`);
                                        editEmbed();
                                        matchStats.turn = 1;
                                        resolve(matchResult("l"));
                                    };
                                } else {
                                    if (matchStats.currentOpponent) return minionDefeated("e");
                                    if (eStatsC.rev > Math.random()) {
                                        eStatsC.hp += Math.floor(eStats.hp * eStatsC.revhp);
                                        editEmbed();
                                    } else {
                                        atk.stop(), def.stop(), skip.stop();
                                        if (myChar.id in abilities) ability.stop();
                                        if (myStats.class !== -1) cskill.stop();
    
                                        notice.push(`\n🎉 **${myChar.name}** won`);
                                        editEmbed();
                                        matchStats.turn = 1;
                                        resolve(matchResult("w"))
                                    };
                                };
                            };
                        };
                        
                        function startNextRound() {
                            if (matchStats.round === matchStats.roundCheck) return;
                            matchStats.roundCheck = matchStats.round;
                            if (matchStats.currentCharacter || matchStats.currentOpponent) return;
    
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
                        
                        function attack() {
                            if (matchStats.turn === 1) return;
                            setTimeout(() => {
                                if (matchStats.blockAbilities-- > 0 && myChar.id !== 4767 && eStatsC.sm >= curse.cost && Math.random() < 0.3) {
                                    curse.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    editEmbed();
                                    checkIfEnded();
                                    attack();
                                } else if (matchStats.blockAbilities-- > 0 && myChar.id !== 4767 && eAbility && eStatsC.sm >= eAbility.cost && Math.random() < 0.5) {
                                    eAbility.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    editEmbed();
                                    checkIfEnded();
                                    attack();
                                } else {
                                    if (Math.random() < myStatsC.dodge && !matchStats.counter) {
                                        if (matchStats.dodgebuff) buffs.atk.push(new buffInfo("*", 1+matchStats.dodgebuff, 9999));
                                        notice.push(`\n💨 **${myChar.name}** dodged the attack!${matchStats.dodgebuff ? ` Gained **+${matchStats.dodgebuff*100}%** ATK` : ""}`);
                                    } else {
                                        let ranum = Math.random();
                                        let eDmg = Math.floor((eStatsC.atk * Math.pow(0.99818, myStatsC.def)) * (1 - (0.2*Math.random())) * (ranum < eStatsC.cr ? eStatsC.cd : 1));
                                        if (matchStats.counter > 0 && matchStats.counterChance > Math.random()) {
                                            eStatsC.hp -= eDmg;
                                            if (eStatsC.hp < 0) eStatsC.hp = 0;
                                            notice.push(`\n⚔️ **${myChar.name}** countered the attack! Dealt **${eDmg}** damage`);
                                        } else {
                                            if (eStatsC.hp > 0) myStatsC.hp -= eDmg;
                                            if (myStatsC.hp < 0) myStatsC.hp = 0;
                                            if (myStatsC.hp === 0 && matchStats.evadeDeathStrike > 0 && matchStats.evadeDeathChance > Math.random()) {
                                                myStatsC.hp += eDmg;
                                                matchStats.evadeDeathStrike--;
                                                notice.push(`\n⚔️ **${enemy.name}** has evaded a deadly attack!`);
                                            } else {
                                                notice.push(`\n⚔️ **${enemy.name}** has dealt${ranum < myStatsC.cr ? " a critical hit!" : ""} **${eDmg}** damage`);
                                            };
                                        };
                                        checkIfEnded();
                                    };
                                    matchStats.turn = 1;
                                    matchStats.round++;
                                    startNextRound();
                                    matchStats.blockStreak = 0;
                                    editEmbed();
                                };
                                if (matchStats.counter > 0) matchStats.counter--;
                            }, aDelay);
                        };
    
                        atk.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                            });
                            
                            if (matchStats.turn === 1) {
                                matchStats.turn = 0;
                                function playerAttack(twin=false) {
                                    if (Math.random() < eStatsC.br) {
                                        matchStats.attackStreak = 0;
                                        notice.push(`\n🛡️ **${enemy.name}** blocked your attack!`);
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
                                    if (twin) {
                                        if (eStatsC.hp < 1) eStatsC.hp = 0;
                                        editEmbed(), checkIfEnded(), attack();
                                    };
                                };
                                playerAttack();
                                if (eStatsC.hp < 1) eStatsC.hp = 0;
                                editEmbed();
                                checkIfEnded();
                                if (eStatsC.hp) {
                                    if (matchStats.twinshot > Math.random()) setTimeout(() => { playerAttack(true) }, aDelay);
                                    else attack();
                                };
                            } else interaction.channel.send("Please wait a moment");
                        });
    
                        def.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                            });
    
                            if (matchStats.turn === 1) {
                                if (matchStats.defUsed++ > 9) return interaction.channel.send("You can use DEF only 10 times per match.");
                                matchStats.turn = 0;
                                matchStats.attackStreak = 0;
                                let adddef = 60 + Math.floor(30 * Math.random());
                                let addmr = Math.floor((myClass ? 60*myClass.stats.mr[0] : 60) + (30 * Math.random()));
                                buffs.def.push(new buffInfo("+", adddef, 9999));
                                buffs.mr.push(new buffInfo("+", addmr, 9999));
                                myStatsC.def += adddef;
                                myStatsC.mr += addmr;
                                notice.push(`\n🛡️ **${myChar.name}** has increased DEF by **${adddef}** and MR by **${addmr}**`);
                                if (Math.random() > myStatsC.br) attack();
                                else setTimeout(() => {
                                    notice.push(`\n🛡️ **${myChar.name}** has blocked **${enemy.name}'s** attack!`);
                                    matchStats.turn = 1;
                                    matchStats.round++;
                                    matchStats.blockStreak++;
                                    startNextRound();
                                    editEmbed();
    
                                    // Achievements
                                    achievements[13].check(interaction, interaction.user, matchStats.blockStreak), achievements[14].check(interaction, interaction.user, matchStats.blockStreak); // Invincible
                                }, aDelay);
                                
                                editEmbed();
                                checkIfEnded();
                            } else interaction.channel.send("Please wait a moment");
                        });
                        
                        ability.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                            });
    
                            if (myAbility.used < myAbility.usage) {
                                if (matchStats.turn === 1) {
                                    if (myAbility.cost > myStatsC.sm) interaction.channel.send(`You don't have enough mana! (**${myStatsC.sm}**/${myAbility.cost}\\💧)`);
                                    else {
                                        matchStats.turn = 0;
                                        matchStats.attackStreak = 0;
                                        myAbility.used++;
                                        myAbility.ability(myStatsC, myStats, eStatsC, eStats, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                        myStatsC.sm -= myAbility.cost;
                                        editEmbed();
                                        checkIfEnded();
                                        attack();
                                    };
                                } else interaction.channel.send("Please wait a moment");
                            } else interaction.channel.send(`You can use **${myChar.name}**'s ability only ${myAbility.usage == 1 ? "once" : `${myAbility.usage} times`} per fight.`);
                        });
    
                        cskill.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                            });
    
                            if (myChar.id === 4767) return interaction.channel.send("Asta can't use any abilities");
                            if (skill._cost > myStatsC.sm) interaction.channel.send(`You don't have enough mana! (**${myStatsC.sm}**/${skill._cost}\\💧)`);
                            else {
                                if (matchStats.turn === 1) {
                                    myStatsC.sm -= skill._cost;
                                    matchStats.attackStreak = 0;
                                    skill._skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    editEmbed();
                                    checkIfEnded();
                                    attack();
                                } else interaction.channel.send("Please wait a moment");
                            };
                        });
    
                        skip.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                            });
    
                            if (matchStats.turn == 1) {
                                notice.push(`\n⏩ Skipping to results...`);
                                editEmbed();
                                matchStats.turn = 0;
                                while (eStatsC.hp > 0 && myStatsC.hp > 0) {
                                    if (Math.random() > 0.02 + (0.1*(eStatsC.ep/myStatsC.ep))) eStatsC.hp -= Math.floor((myStatsC.atk * Math.pow(0.99818, eStatsC.def)) * (1 - (0.2*Math.random())));
                                    if (eStatsC.hp < 0) eStatsC.hp = 0;
                                    if (eStatsC.hp > 0) myStatsC.hp -= Math.floor((eStatsC.atk * Math.pow(0.99818, myStatsC.def)) * (1 - (0.2*Math.random())));
                                    if (myStatsC.hp < 0) myStatsC.hp = 0;
                                };
                                
                                setTimeout(() => {
                                    if (myStatsC.hp <= 0 || eStatsC.hp <= 0) {
                                        atk.stop(), def.stop(), skip.stop();
                                        if (abilities[myChar.id]) ability.stop();
                                        checkIfEnded();
                                    };
                                }, aDelay);
                            } else {
                                matchStats.turn = 1;
                                interaction.channel.send("Please wait a moment");
                            };
                        });
    
                    });
    
                });
                interaction.channel.send({ embeds: [result] });
            };

            newFight();
        });

    },
};