/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { abilities } = require("../Modules/abilities.js");
const { achievements } = require("../Modules/achievements.js");
const { classes } = require("../Modules/classes.js");
const { curses } = require("../Modules/curses.js");
const { enemies } = require("../Modules/enemies.js");
const { items } = require("../Modules/items.js");
const { skills, bossAbilities } = require("../Modules/skills.js");
const { characters } = require("../Modules/chars.js");
const { getDetailedStats, customEmojis, deleteReplyIn, dealDamage } = require("../Modules/functions.js");
const Avalon = require("../Modules/avalon.js");
const buffInfo = require("../Modules/buffs.js");
const _ = require('lodash');

const dungeonInProgress = new Map();

function toOrdinal(num) {
    if (num % 100 >= 11 && num % 100 <= 13) return num + "th";
    switch (num % 10) {
        case 1: return num + "st";
        case 2: return num + "nd";
        case 3: return num + "rd";
        default: return num + "th";
    };
};

module.exports = {
    name: 'boss',
	description: 'boss rush event gamemode',
	execute(interaction) {

        return interaction.reply("Hey! We're sorry, but this is an event game mode and there is no ongoing event as of right now.\nPlease see our </support:1011293280702578694> server for more information.");

        let customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        
        db.serialize(async () => {
            await interaction.deferReply().catch((err) => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });

            let stats = await query(`SELECT users.id, users.coins, users.battlechar, users.animationdelay, users.premium, users.skins, users.brbest, users.eventpts, users.eventrewreceived, characters.chars, characters.ref, characters.level, characters.class, characters.skin, characters.equipment, dungeon.classes, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${interaction.user.id}`);
            stats = {id: stats[0].id, coins: stats[0].coins, battlechar: stats[0].battlechar, animationdelay: stats[0].animationdelay, premium: stats[0].premium, skins: JSON.parse(stats[0].skins), brbest: stats[0].brbest, eventpts: stats[0].eventpts, eventrewreceived: stats[0].eventrewreceived, chars: JSON.parse(stats[0].chars), ref: JSON.parse(stats[0].ref), level: JSON.parse(stats[0].level), class: JSON.parse(stats[0].class), equipment: JSON.parse(stats[0].equipment), skin: JSON.parse(stats[0].skin), classes: JSON.parse(stats[0].classes), classlevels: JSON.parse(stats[0].classlevels)};

            if (stats.battlechar === null || !stats.chars.includes(stats.battlechar)) return interaction.editReply("You have to choose a battle character first. Use `/select <char name>` to choose one.");
            
            // Set up restrictions
            if (dungeonInProgress.has(stats.id)) return interaction.editReply(`You can play again in${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime())/60000) > 0 ? ` **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime())/60000)}**min` : ""} **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime())/1000)%60}**s`);
            dungeonInProgress.set(stats.id, new Date().getTime()+5*60*1000);
            setTimeout(() => dungeonInProgress.delete(stats.id), 5*60*1000);
            
            // User stats
            let myChar = characters[stats.battlechar];
            let myStats = await getDetailedStats(myChar.id, stats, stats.classlevels);
            myStats.sm -= myStats.mg;
            let myStatsC = {...myStats};
            let myClass = myStats.class !== -1 ? classes[myStats.class] : false;

            const thumbnail = myChar.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[myChar.id], stats.skin[myChar.id]);

            let round = 0;

            async function matchResult(r) {
                round++;
                if (r === "w" && round < 20) return setTimeout(newFight, 1000);

                if (r === "l" || r === "t") round--;
                
                // Loot
                let eventpts = Math.round(round*0.8 * (5-Math.random()) * Math.pow(1.2, round*0.8));
                if (eventpts > 400) eventpts = 400 + Math.floor(eventpts/10);
                let loot = Math.round((2 * (10 + round*0.8) * (5-Math.random()) * Math.pow(1.2, round*0.8))/4);
                if (loot > 400) loot = 400 + Math.floor(loot/10);
                
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
                    boost = Math.round(boost*200)/100;
                    let cxp = Math.floor((1 + round - Math.random()) * boost * 15) + 5; // 7-25 -> 205-223
                    cxpmsg = `Class XP: **${cxp}** (Boost: x${boost}${new Date().getDay() === 6 || new Date().getDay() === 0 ? " weekend" : ""})`;
                    if (myClass.id in stats.classlevels) stats.classlevels[myClass.id] += cxp;
                    else stats.classlevels[myClass.id] = cxp;
                };

                // Save changes
                await query(`UPDATE users SET coins = coins + ${loot}, eventpts = eventpts + ${eventpts}, brbest = ${Math.max(stats.brbest, round)} WHERE id = ${interaction.user.id}`);
                await query(`UPDATE dungeon SET classlevels = '${JSON.stringify(stats.classlevels)}' WHERE id = ${interaction.user.id}`);

                // Event Rewards
                const milestones = [
                    {
                        id: 0,
                        required: 250,
                        query: `coins = coins + ${100}, sshard = sshard + ${4}`,
                        rew: "100<:coins:872926669055356939> and 4<:s_shard:917202925514817566>",
                    },
                    {
                        id: 1,
                        required: 500,
                        query: `coins = coins + ${200}, lootbox = lootbox + ${1}`,
                        rew: "200<:coins:872926669055356939> and a lootbox",
                    },
                    {
                        id: 2,
                        required: 800,
                        query: `coins = coins + ${300}, sticket = sticket + ${1}`,
                        rew: "300<:coins:872926669055356939> and 1x <:s_ticket:927642487705722890>",
                    },
                    {
                        id: 3,
                        required: 1250,
                        query: `coins = coins + ${350}, lootbox = lootbox + ${1}, sticket = sticket + ${2}`,
                        rew: "350<:coins:872926669055356939>, 2x <:s_ticket:927642487705722890> and a lootbox",
                    },
                    {
                        id: 4,
                        required: 1800,
                        query: `coins = coins + ${400}, lootbox = lootbox + ${1}, sshard = sshard + ${8}`,
                        rew: "400<:coins:872926669055356939>, 8x <:s_shard:917202925514817566> and a lootbox",
                    },
                    {
                        id: 5,
                        required: 2500,
                        query: `skins = '${JSON.stringify([...stats.skins, 0])}'`,
                        rew: "Luminous Christmas Skin",
                        image: "https://i.ibb.co/2YH8ddB/luminous.png",
                    },
                    {
                        id: 6,
                        required: 3200,
                        query: `coins = coins + ${500}, lootbox = lootbox + ${2}, sshard = sshard + ${10}`,
                        rew: "500<:coins:872926669055356939>, 10x <:s_shard:917202925514817566> and 2 lootboxes",
                    },
                    {
                        id: 7,
                        required: 3800,
                        query: `coins = coins + ${600}, sticket = sticket + ${2}`,
                        rew: "600<:coins:872926669055356939>, 2x <:s_ticket:927642487705722890>",
                    },
                    {
                        id: 8,
                        required: 4400,
                        query: `coins = coins + ${750}, lootbox = lootbox + ${2}, ssshard = ssshard + ${4}`,
                        rew: "750<:coins:872926669055356939>, 4x <:ss_shard:917203009543503892> and 2 lootboxes",
                    },
                    {
                        id: 9,
                        required: 5000,
                        query: `skins = '${JSON.stringify([...stats.skins, 3])}', sticket = sticket + ${3}`,
                        rew: "Cecilia Christmas Skin and 3x <:s_ticket:927642487705722890>",
                        image: "https://i.ibb.co/kcPHTnL/cecilia.png",
                    },
                    {
                        id: 10,
                        required: 6000,
                        query: `coins = coins + ${800}, lootbox = lootbox + ${1}, ssshard = ssshard + ${4}`,
                        rew: "800<:coins:872926669055356939>, 4x <:ss_shard:917203009543503892> and a lootbox",
                    },
                    {
                        id: 11,
                        required: 7250,
                        query: `coins = coins + ${1000}, ssshard = ssshard + ${6}`,
                        rew: "1000<:coins:872926669055356939>, 6x <:ss_shard:917203009543503892>",
                    },
                    {
                        id: 12,
                        required: 8500,
                        query: `coins = coins + ${1000}, sticket = sticket + ${3}`,
                        rew: "1000<:coins:872926669055356939>, 3x <:s_ticket:927642487705722890>",
                    },
                    {
                        id: 13,
                        required: 10000,
                        query: `skins = '${JSON.stringify([...stats.skins, 10])}', ssticket = ssticket + ${1}`,
                        rew: "Rosalia Christmas Skin and 1x <:ss_ticket:927503239396622336>",
                        image: "https://i.ibb.co/zn5dqf4/rosalia.png",
                    },
                    {
                        id: 14,
                        required: 12500,
                        query: `coins = coins + ${1200}, lootbox = lootbox + ${3}`,
                        rew: "1200<:coins:872926669055356939> and 3 lootboxes",
                    },
                    {
                        id: 15,
                        required: 15000,
                        query: `skins = '${JSON.stringify([...stats.skins, 6])}', ssticket = ssticket + ${1}`,
                        rew: "Fiona Christmas Skin and 1x <:ss_ticket:927503239396622336>",
                        image: "https://i.ibb.co/dPSVSks/fiona.png",
                    },
                    {
                        id: 16,
                        required: 18000,
                        query: `coins = coins + ${1250}, lootbox = lootbox + ${2}, ssticket = ssticket + ${1}`,
                        rew: "1250<:coins:872926669055356939>, 1x <:ss_ticket:927503239396622336> and 2 lootboxes",
                    },
                    {
                        id: 17,
                        required: 22500,
                        query: `skins = '${JSON.stringify([...stats.skins, 7])}', ssticket = ssticket + ${2}`,
                        rew: "Rimuru Tempest Christmas Skin and 2x <:ss_ticket:927503239396622336>",
                        image: "https://i.ibb.co/WxfWSN1/rimuru.png",
                    },
                    {
                        id: 18,
                        required: 26000,
                        query: `lootbox = lootbox + ${6}`,
                        rew: "6 lootboxes",
                    },
                    {
                        id: 19,
                        required: 30000,
                        query: `skins = '${JSON.stringify([...stats.skins, 12, 14])}'`,
                        rew: "Dalus and Luxuria Christmas Skins",
                        image: "https://i.ibb.co/MV3sB69/luxus.png",
                    },
                    {
                        id: 20,
                        required: 36000,
                        query: `skins = '${JSON.stringify([...stats.skins, 2])}', ssticket = ssticket + ${1}`,
                        rew: "Altair Christmas Skin and 1x <:ss_ticket:927503239396622336>",
                        image: "https://i.ibb.co/Twh8Jn5/altair.png",
                    },
                    {
                        id: 21,
                        required: 42000,
                        query: `skins = '${JSON.stringify([...stats.skins, 11, 13])}'`,
                        rew: "Kaith and Anastasia Christmas Skins",
                        image: "https://i.ibb.co/WfNF3tK/kaitia.png",
                    },
                    {
                        id: 22,
                        required: 50000,
                        query: `skins = '${JSON.stringify([...stats.skins, 8])}', lootbox = lootbox + ${5}, ssticket = ssticket + ${1}`,
                        rew: "Erza Scarlet Christmas Skin, 1x <:ss_ticket:927503239396622336> and 5 lootboxes",
                        image: "https://i.ibb.co/2cy4Qf9/erza.png",
                    },
                    {
                        id: 23,
                        required: 60000,
                        query: `coins = coins + ${3000}, lootbox = lootbox + ${4}, ssticket = ssticket + ${2}`,
                        rew: "3000<:coins:872926669055356939>, 2x <:ss_ticket:927503239396622336> and 4 lootboxes",
                    },
                    {
                        id: 24,
                        required: 72000,
                        query: `skins = '${JSON.stringify([...stats.skins, 4, 5])}', lootbox = lootbox + ${6}, ssticket = ssticket + ${1}`,
                        rew: "Luna and Senna Christmas Skins, 1x <:ss_ticket:927503239396622336> and 6 lootboxes",
                        image: "https://i.ibb.co/3BMtPSH/lenna.png",
                    },
                    {
                        id: 25,
                        required: 80000,
                        query: `ssticket = ssticket + ${3}, sticket = sticket + ${6}`,
                        rew: "3x <:ss_ticket:927503239396622336> and 6x <:s_ticket:927642487705722890>",
                    },
                    {
                        id: 26,
                        required: 100000,
                        query: `skins = '${JSON.stringify([...stats.skins, 1])}'`,
                        rew: "Victoria Christmas Skin",
                        image: "https://i.ibb.co/fqY9wTQ/victoria.png",
                    },
                ];
                
                const Embed = new MessageEmbed();

                let rewMessage = "";
                if (milestones[stats.eventrewreceived]) {
                    if (milestones[stats.eventrewreceived].required <= (stats.eventpts + eventpts)) {
                        await query("UPDATE users SET eventrewreceived = eventrewreceived + 1, " + milestones[stats.eventrewreceived].query + " WHERE id = " + interaction.user.id);
                        rewMessage = `\n<a:starsL:942573254730715246> You have unlocked the ${(milestones.legnth-1) === milestones[stats.eventrewreceived].id ? "last" : toOrdinal(milestones[stats.eventrewreceived].id+1)} reward! <a:starsR:942573194802511923>\nYou received ${milestones[stats.eventrewreceived].rew}!${milestones[stats.eventrewreceived+1] ? `\nNext target: **${stats.eventpts + eventpts}**/${milestones[stats.eventrewreceived+1].required}❄️` : ""}`;
                        if (milestones[stats.eventrewreceived]?.image) Embed.setImage(milestones[stats.eventrewreceived].image);
                    } else {
                        rewMessage = `\nNext reward: **${stats.eventpts + eventpts}**/${milestones[stats.eventrewreceived].required}`;
                    };
                } else {
                    rewMessage = "\nYou have unlocked all rewards!";
                };

                Embed.setColor(0x00873E)
                .setThumbnail(thumbnail)
                .setTitle(`Boss Rush${r==="t"? " (Time's up!)" : ""}`)
                .setFooter(`Balance: ${stats.coins} coins`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                .setDescription(`<:stars_v2:917023655840591963> Round: ${round} (best: ${Math.max(stats.brbest, round)}) <:stars_v2:917023655840591963>\n<a:arrow_orange:916716747623641210> Loot: ${loot}<:coins:872926669055356939>\n<a:arrow_yellow:916716780045619200> ${cxpmsg}\n<a:arrow_white:916716862962819092> Snowflakes: ${eventpts}❄️\n${rewMessage}`)
                .setFooter(`Balance: ${stats.coins+loot} coins`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                return Embed;
            };
            
            let notice = ["", "", "", "\n👑 Let the trial begin!"];

            const aDelay = stats.premium ? stats.animationdelay : 1200;

            // Buttons
            const ATK_EMOJI = myStatsC.replaceButton?.atk?.emoji || '⚔️', 
                DEF_EMOJI = myStatsC.replaceButton?.def?.emoji || '🛡️',
                ABILITY_EMOJI = myStatsC.replaceButton?.ability?.emoji || '✨',
                SKILL_EMOJI = myStatsC.replaceButton?.skill?.emoji || '⚜️';

            const row = new MessageActionRow()
            .addComponents(
                new MessageButton().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle('SECONDARY'),
                new MessageButton().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle('SECONDARY'),
                new MessageButton().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle('SECONDARY').setDisabled(myChar.id in abilities ? false : true),
                new MessageButton().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle('SECONDARY').setDisabled(myStats.class !== -1 ? false : true),
            );

            async function newFight() {

                // My Stats
                let tempHP = myStatsC.hp, tempMana = myStatsC.sm+myStatsC.mg;
                myStats = await getDetailedStats(myChar.id, stats, stats.classlevels);
                myStats.hp = tempHP, myStats.sm = (tempMana > myStats.mana) ? myStats.mana : tempMana;
                myStatsC = {...myStats};
                let myClass = myStats.class !== -1 ? classes[myStats.class] : false;

                let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : false;
                let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : false;
                
                // Enemy Stats
                const enemy = enemies.filter((e) => e.boss)[Math.floor(Math.random() * (enemies.filter((e) => e.boss).length))];
                const ebStats = [
                    Math.floor(20 * (8 + Math.random()) * Math.pow(1.35, round)),
                    Math.floor(5.4 * (10 + Math.random()) * Math.pow(1.3, round)),
                    10 + round*30 + (round >= 10 ? 150*(round-9) : 0),
                ];
                ebStats[3] = Math.floor(((ebStats[0]/Math.pow(0.99895,ebStats[2])) / (200/ebStats[1]))*100) / 100;
                const curseRar = curses.filter((e) => e.tier);
                const curse = curseRar[Math.floor(Math.random() * curseRar.length)];
                const eAbility = bossAbilities.find((e) => e.list[0] === enemy.floor[0]);
                let eImage = enemy.image[Math.floor(Math.random()*enemy.image.length)];
                
                let eStats = {
                    "name": enemy.name,
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
    
                const difficulty = Avalon.getDifficulty(myStats.ep/eStats.ep);
                
                let buffs = Avalon.getBuffs();
                let eBuffs = Avalon.getBuffs();
                
                let matchStats = Avalon.getMatchStats(interaction);

                // Apply Passives
                if (skill && myChar.id !== 4767) skill._passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user, interaction.commandName);
                if (myAbility?.passive && myChar.id !== 4767) myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user);
                if (myStats.weapon !== -1) items[myStats.weapon]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user);
                if (myStats.shieldid) items[myStats.shieldid]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user);
                if (myStats.helmet && items?.[myStats.helmet].setname === items?.[myStats.cuirass]?.setname && items?.[myStats.helmet].setname === items?.[myStats.gloves]?.setname && items?.[myStats.helmet].setname === items?.[myStats.boots]?.setname) items[myStats.boots]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user);

                let timestart = new Date().getTime();
                let result = await new Promise((resolve, rejects) => {
                    const Embed = new MessageEmbed()
                    .setColor(0x00873E)
                    .setThumbnail(thumbnail)
                    .setFooter(`Enemy EP: ${eStatsC.ep} | Round: ${round+1} | time left: 120s`)
                    .setTitle(`Boss Rush`)
                    .setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp/eStatsC.maxhp, eStatsC.sm/eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp/myStatsC.maxhp, myStatsC.sm/myStatsC.mana)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-4).join("")}`)
                    .setImage(eImage)
                    interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {
    
                        const atk = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "ATK", componentType: 'BUTTON', time: 120000 });
                        const def = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "DEF", componentType: 'BUTTON', time: 120000 });
                        const ability = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "ABILITY", componentType: 'BUTTON', time: 120000 });
                        const cskill = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "SKILL", componentType: 'BUTTON', time: 120000 });
                        matchStats.collector = {"atk": atk, "def": def, "ability": ability, "cskill": cskill};
                        
    
                        // Use passives
                        if (myChar.id !== 4767) curse.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
    
                        // let timeout;
                        async function editEmbed() {
                            Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp/eStatsC.maxhp, eStatsC.sm/eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp/myStatsC.maxhp, myStatsC.sm/myStatsC.mana)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-4).join("")}`);
                            Embed.setFooter(`Enemy EP: ${eStatsC.ep} | Round: ${round+1} | time left: ${120+Math.floor((timestart-new Date().getTime())/1000)}s`);
                            
                            await msg.edit({ embeds: [Embed] });

                            // // Debounce
                            // clearTimeout(timeout);
                            // timeout = setTimeout(() => {
                            //     msg.edit({ embeds: [Embed] });
                            // }, 600);
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
    
                        function endMatch(wORl) {
                            atk.stop(), def.stop(), ability?.stop(), cskill?.stop();
                            if (wORl === "l") notice.push(`\n💀 **${myChar.name}** lost`);
                            else notice.push(`\n🎉 **${myChar.name}** won`);
                            editEmbed();
                            matchStats.turn = 1;
                            resolve(matchResult(wORl));
                        };
                        
                        function startNextRound() {
                            if (matchStats.round === matchStats.roundCheck) return;
                            matchStats.roundCheck = matchStats.round;
                            
                            // Consume Mana
                            Avalon.consumeActiveMana(matchStats, myStatsC, buffs, myChar, notice, Embed, thumbnail);
                            
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
                        };
                        
                        function attack() {
                            if (matchStats.turn === 1) return;
                            setTimeout(() => {
                                if (matchStats.blockAbilities-- <= 0 && myChar.id !== 4767 && eStatsC.sm >= curse.cost && Math.random() < 0.3) {
                                    curse.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    eStatsC.sm -= curse.cost;
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                } else if (matchStats.blockAbilities-- < 0 && myChar.id !== 4767 && eAbility && eStatsC.sm >= eAbility.cost && Math.random() < 0.5) {
                                    eAbility.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                } else {
                                    if (Math.random() < myStatsC.dodge && !matchStats.counter) {
                                        if (matchStats.dodgebuff) buffs.atk.push(new buffInfo("*", 1+matchStats.dodgebuff, 9999));
                                        notice.push(`\n💨 **${myChar.name}** dodged the attack!${matchStats.dodgebuff ? ` Gained **+${matchStats.dodgebuff*100}%** ATK` : ""}`);
                                    } else {
                                        dealDamage(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, `⚔️ **${enemy.name}**`, {magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, critbleed: true});
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    };
                                    matchStats.turn = 1;
                                    matchStats.round++;
                                    startNextRound();
                                    editEmbed();
                                };
                                if (matchStats.counter > 0) matchStats.counter--;
                            }, aDelay);
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
                                    dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, {block: true, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, critbleed: true});
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
    
                                    if (matchStats.twinshot > Math.random()) setTimeout(() => {
                                        dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, {block: true, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, critbleed: true});
                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        attack();
                                    }, aDelay);
                                    
                                    else attack();
                                }

                            } else interaction.channel.send("Please wait a moment").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                        });
    
                        def.on('collect', async r => {
                            if (matchStats.turn === 1) {
                                matchStats.turn = 0;
                                matchStats.attackStreak = 0;
                                
                                // If defense was replaced
                                if ("def" in myStatsC.replaceButton) {
                                    myStatsC.replaceButton.def.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    if (matchStats.turn === 0) attack();
                                }
                                
                                // Use defense
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
                                    attack();
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                }
                                
                            } else interaction.channel.send("Please wait a moment").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                        });
                        
                        ability.on('collect', async r => {
                            if (myAbility.used < myAbility.usage) {
                                if (matchStats.turn === 1) {
                                    if (myAbility.cost > myStatsC.sm) interaction.channel.send(`You don't have enough mana! (**${myStatsC.sm}**/${myAbility.cost}${customEmojis.mana})`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                    else {
                                        matchStats.turn = 0;
                                        matchStats.attackStreak = 0;
                                        myAbility.used++;
                                        myAbility.ability(myStatsC, myStats, eStatsC, eStats, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                        myStatsC.sm -= myAbility.cost;
                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        attack();
                                    };
                                } else interaction.channel.send("Please wait a moment").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            } else interaction.channel.send(`You can use **${myChar.name}**'s ability only ${myAbility.usage === 1 ? "once" : `${myAbility.usage} times`} per fight.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                        });
    
                        cskill.on('collect', async r => {
                            if (myChar.id === 4767) return interaction.channel.send("Asta can't use any abilities").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            if (skill._cost > myStatsC.sm) interaction.channel.send(`You don't have enough mana! (**${myStatsC.sm}**/${skill._cost}${customEmojis.mana})`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            else {
                                if (matchStats.turn === 1) {
                                    myStatsC.sm -= skill._cost;
                                    matchStats.attackStreak = 0;
                                    skill._skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user, stats.chars);
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                } else interaction.channel.send("Please wait a moment").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            };
                        });

                        atk.on('end', async component => {
                            if (120+Math.floor((timestart-new Date().getTime())/1000) < 1) {
                                atk.stop(), def.stop(), ability.stop(), cskill.stop();

                                resolve(matchResult("t"));
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