const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { abilities } = require("../Modules/abilities.js");
const { achievements } = require("../Modules/achievements.js");
const { classes } = require("../Modules/classes.js");
const { curses } = require("../Modules/curses.js");
const { enemies } = require("../Modules/enemies.js");
const { skills, bossAbilities } = require("../Modules/skills.js");
const { characters } = require("../Modules/chars.js");
const { getDetailedStats, getId, search, searchClass, baseHP, baseATK, baseDEF } = require("../Modules/functions.js");

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

class skillInfo {
    constructor(id, cost, skill, passive = () => {}, list = []) {
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

function getTrialStats(id, cl) {

    let dStats = {
        "hp": baseHP(id),
        "maxhp": 1,
        "atk": baseATK(id),
        "def": baseDEF(id),
        "ep": 0,
        "md": 0,
        "mr": 0,
        "cr": 0.18,
        "cd": 1.25,
        "td": 0,
        "br": 0.2,
        "agility": 80,
        "dodge": 0.1,
        "mana": 80,
        "mg": 15,
        "sm": 20,
        "rev": 0,
        "revhp": 0.5,
        "lvl": 80,
        "ref": 5,
        "class": cl?.id || -1,
        "clvl": 40,
    };

    let clsStats;
    if (cl) {
        clsStats = classes[dStats.class].stats;
        Object.keys(clsStats).forEach((s) => dStats[s] = dStats[s] * clsStats[s][0] + clsStats[s][1]);
        ["mana", "mg", "sm"].forEach((stat) => dStats[stat] = Math.floor(dStats[stat]));
    };
    
    switch (characters[id].rarity) {
        case "SS" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((5+(2*((dStats.hp-180)/60)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((2.4+(0.35*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((1.25+(0.25*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
        case "S" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((3.9+(0.6*((dStats.hp-150)/50)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((1.9+(0.3*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((1+(0.2*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
        case "A" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((3.3+(0.4*((dStats.hp-120)/60)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((1.6+(0.25*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((0.8+(0.15*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
        case "B" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((2.8+(0.4*((dStats.hp-100)/50)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((1.2+(0.3*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((0.6+(0.2*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
        case "C" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((2.4+(0.4*((dStats.hp-80)/40)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((0.9+(0.35*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((0.5+(0.15*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
        case "D" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((2+(0.5*((dStats.hp-70)/30)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((0.75+(0.25*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((0.4+(0.5*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
        default : dStats.hp = 1; dStats.atk = 1; dStats.def = 1; break;
    };
    dStats.td = dStats.atk, dStats.md = dStats.atk, dStats.mr = dStats.def;
    if (dStats.class !== -1) {
        ["td","md","mr"].forEach((s) => dStats[s] = Math.floor(dStats[s] * clsStats[s][0] + clsStats[s][1]));
        let scale;
        switch (classes[dStats.class].tier) {
            case 1: scale = {"hp": 4, "atk": 1.3, "md": 1.3, "def": 0.8, "mr": 0.8, "mana": 0.4}; break;
            case 2: scale = {"hp": 5, "atk": 1.7, "md": 1.7, "def": 0.95, "mr": 0.95, "mana": 0.5}; break;
            case 3: scale = {"hp": 6, "atk": 2, "md": 2, "def": 1.1, "mr": 1.1, "mana": 0.65}; break;
            case 4: scale = {"hp": 8, "atk": 3, "md": 3, "def": 1.35, "mr": 1.35, "mana": 0.8}; break;
            default: break;
        };
        ["hp", "atk", "md", "def", "mr", "mana"].forEach((s) => dStats[s] += Math.floor((scale[s] * clsStats[s][0]) * (dStats.clvl-1)));
    };
    dStats.maxhp = dStats.hp;
    dStats.ep = Math.floor(((dStats.hp/Math.pow(0.99818,dStats.def)) / (200/dStats.atk))*100) / 100;
    return dStats;
};

module.exports = {
    name: 'trial',
	description: 'trial',
	execute(interaction) {

        let charChoice = interaction.options.getString('character');
        let classChoice = interaction.options.getString('class');
        
        db.serialize(async () => {
            await interaction.deferReply().catch((err) => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });
            
            var stats = await query(`SELECT users.id, users.coins, users.battlechar, users.animationdelay, users.premium, characters.chars, characters.ref, characters.level, characters.class, dungeon.floors, dungeon.'limit', dungeon.classes, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${interaction.user.id}`);
            stats = {id: stats[0].id, coins: stats[0].coins, battlechar: stats[0].battlechar, animationdelay: stats[0].animationdelay, premium: stats[0].premium, chars: JSON.parse(stats[0].chars), ref: JSON.parse(stats[0].ref), level: JSON.parse(stats[0].level), class: JSON.parse(stats[0].class), limit: stats[0].limit, floors: JSON.parse(stats[0].floors), classes: JSON.parse(stats[0].classes), classlevels: JSON.parse(stats[0].classlevels)};
            
            if (stats.battlechar === null || !stats.chars.includes(stats.battlechar)) return interaction.editReply("You have to choose a battle character first. Use `/select <char name>` to choose one.");
            
            if (charChoice === null && classChoice === null) return interaction.editReply("Here you can try out all abilities and classes. Try `/trial <char>`, `/trial <class>` or `/trial <char> <class>`");
            if (!stats.chars.includes(stats.battlechar)) return interaction.editReply("You need to choose a battle character first. Use `/select <char>` to choose one.");
            
            let ch = charChoice !== null ? search(charChoice, stats.chars, interaction) : false;
            if (!ch?.id && charChoice !== null) return;
            let cl = classChoice !== null ? searchClass(classChoice, interaction) : false;
            if (!cl?.id && classChoice !== null) return;
            
            // Set up restrictions
            if (dungeonInProgress.has(stats.id)) return interaction.channel.send("You already have a run in progress, please finish it before attempting to start a new round.");
            dungeonInProgress.add(stats.id);
            const userTimeout = setTimeout(() => dungeonInProgress.delete(stats.id), 120000);
            
            // User stats
            let myChar, myStats, myStatsC, myClass, skill, myAbility;
            if (interaction.commandName === "trial") {
                myChar = ch || characters[stats.battlechar];
                myStats = getTrialStats(myChar.id, cl);
                myStatsC = {...myStats};
                myClass = cl || false;
                skill = myClass ? {...skills[myClass.id]} : false;
                myAbility = abilities[myChar.id] ? {...abilities[myChar.id]} : false;
            } else {
                myChar = characters[stats.battlechar];
                myStats = getDetailedStats(myChar.id, stats, stats.classlevels);
                myStatsC = {...myStats};
                myClass = myStats.class !== -1 ? classes[myStats.class] : false;
                skill = myStats.class !== -1 ? {...skills[myStats.class]} : false;
                myAbility = abilities[myChar.id] ? {...abilities[myChar.id]} : false;
            };
            

            // Enemy Stats
            let enemy = {"name":"Camelot","image":"https://i.ibb.co/jZ7fHSj/camelot.png"};
            let curseRar = curses.filter((e) => e.tier);
            let curse = curseRar[Math.floor(Math.random() * curseRar.length)];
            let eAbility = 
            new skillInfo(0, 50, (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user=interaction.user.id, ...list) => {
                let dmg = Math.floor(((2*eStats.atk) * Math.pow(0.99818, myStats.def)) * (1 - (0.2*Math.random())));
                myStats.hp -= dmg;
                if (myStats.hp < 0) myStats.hp = 0;
                eStats.sm -= 50;
                matchStats.turn = 0;
                notice.push(`\n✨ **${enemy.name}** used Caliburn! She has dealt **${dmg}** damage`);
            }, () => {}, [5, "Using her Noble Phantasm Caliburn: Golden Sword of the Victorious, Camelot deals 200% damage"]);
            let eImage = "https://i.ibb.co/jZ7fHSj/camelot.png";

            let eStats = {
                "hp": Math.floor(myStats.hp*1.16),
                "maxhp": Math.floor(myStats.hp*1.16),
                "atk": Math.floor(myStats.atk*1.16),
                "def": Math.floor(myStats.def),
                "ep": Math.floor(((Math.floor(myStats.hp*1.16)/Math.pow(0.99818,Math.floor(myStats.def))) / (100/Math.floor(myStats.atk*1.16)))*100) / 100,
                "md": Math.floor(myStats.atk*1.16),
                "mr": Math.floor(myStats.def),
                "cr": 0.18,
                "cd": 1.25,
                "td": Math.floor(myStats.atk*1.16),
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

                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setThumbnail(myChar.image)
                .setTitle(interaction.commandName === "arena" ? "Battle Arena" : `${ch ? "Character" : "Class"} Trial`)
                .setDescription(desc)
                .setFooter(`Balance: ${stats.coins} coins`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048")
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

            let atkButton = new MessageButton().setCustomId('ATK').setEmoji('⚔️').setStyle('SECONDARY');
            let defButton = new MessageButton().setCustomId('DEF').setEmoji('🛡️').setStyle('SECONDARY');
            let abilityButton = new MessageButton().setCustomId('ABILITY').setEmoji('✨').setStyle('SECONDARY').setDisabled(true);
            let skillButton = new MessageButton().setCustomId('SKILL').setEmoji('⚜️').setStyle('SECONDARY').setDisabled(true);
            let skipButton = new MessageButton().setCustomId('SKIP').setEmoji('⏩').setStyle('SECONDARY');
            
            if (myAbility) abilityButton.setDisabled(false);
            if (myStats.class !== -1) skillButton.setDisabled(false);

            const row = new MessageActionRow()
            .addComponents(atkButton, defButton, abilityButton, skillButton, skipButton);

            if (skill && myChar.id !== 4767) skill._passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user, interaction.commandName);
            if (myAbility?.passive && myChar.id !== 4767) myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user);

            async function newFight() {
                let timestart = new Date().getTime();
                let result = await new Promise((resolve, rejects) => {
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setThumbnail(myChar.image)
                    .setFooter(`Enemy EP: ${eStatsC.ep} | time left: 120s`)
                    .setTitle(interaction.commandName === "arena" ? "Battle Arena" : `${ch ? "Character" : "Class"} Trial`)
                    .setDescription(`${interaction.commandName === "arena" ? "I accept your challenge" : `Testing ${ch ? myChar.name : myClass.name}`}\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}\\💖, **${eStatsC.sm}**/${eStatsC.mana}\\💧)\n${hpbar(eStatsC.hp/eStats.hp, eStatsC.sm/eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStats.hp}\\💖, **${myStatsC.sm}**/${myStatsC.mana}\\💧)\n${hpbar(myStatsC.hp/myStats.hp, myStatsC.sm/myStatsC.mana)}\n\\⚔️${myStatsC.atk},\\🛡️${myStatsC.def},\\🎯${Math.floor(myStatsC.cr*100)}%,\\💥${Math.floor(myStatsC.cd*100)}%,\n<:magic_dmg:948568336621527040>${myStatsC.md},\\🔰${myStatsC.mr},\\💨${Math.floor(myStatsC.dodge*100)}%,\\💧+${myStatsC.mg}`)
                    .setImage(eImage)
                    // let replyType = interaction.commandName === "trial" ? interaction.editReply : interaction.channel.send;
                    interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {

                        const atk = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "ATK", componentType: 'BUTTON', time: 120000 });
                        const def = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "DEF", componentType: 'BUTTON', time: 120000 });
                        const ability = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "ABILITY", componentType: 'BUTTON', time: 120000 });
                        const cskill = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "SKILL", componentType: 'BUTTON', time: 120000 });
                        const skip = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "SKIP", componentType: 'BUTTON', time: 120000 });
                        matchStats.collector = {"atk": atk, "def": def, "ability": ability, "cskill": cskill, "skip": skip};
                        
                        // Use passives
                        if (myChar.id !== 4767) curse.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed);

                        function displayNotice() {
                            return notice[notice.length-4] + notice[notice.length-3] + notice[notice.length-2] + notice[notice.length-1];
                        };

                        async function editEmbed() {
                            Embed.setDescription(`${interaction.commandName === "arena" ? "I accept your challenge" : `Testing ${ch ? myChar.name : myClass.name}`}\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}, **${eStatsC.sm}**/${eStatsC.mana}\\💧)\n${hpbar(eStatsC.hp/eStatsC.maxhp, eStatsC.sm/eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}, **${myStatsC.sm}**/${myStatsC.mana}\\💧)\n${hpbar(myStatsC.hp/myStatsC.maxhp, myStatsC.sm/myStatsC.mana)}\n\\⚔️${myStatsC.atk},\\🛡️${myStatsC.def},\\🎯${Math.floor(myStatsC.cr*100)}%,\\💥${Math.floor(myStatsC.cd*100)}%,\n<:magic_dmg:948568336621527040>${myStatsC.md},\\🔰${myStatsC.mr},\\💨${Math.floor(myStatsC.dodge*100)}%,\\💧+${myStatsC.mg}\n-----------------------------------${displayNotice()}`);
                            Embed.setFooter(`Enemy EP: ${eStatsC.ep} | time left: ${120+Math.floor((timestart-new Date().getTime())/1000)}s`);
                            await msg.edit({ embeds: [Embed] });
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
                            
                            if (myChar.id === 4767) interaction.channel.send("Asta can't use any abilities");
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

            if (interaction.commandName === "trial") {
                newFight();
            } else {
                interaction.channel.send("Very well..");
                setTimeout(() => {interaction.channel.send("I'll give it everything I've got!")}, 1800)
                setTimeout(newFight, 3600);
            };

        });

    },
};