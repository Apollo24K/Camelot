/* eslint-disable no-unused-vars */
const fs = require('fs');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { abilities } = require("../Modules/abilities.js");
const { classes } = require("../Modules/classes.js");
const { curses } = require("../Modules/curses.js");
const { items } = require("../Modules/items.js");
const { stampedes } = require("../Modules/stampedes.js");
const { skills, eventBossAbilities } = require("../Modules/skills.js");
const { characters } = require("../Modules/chars.js");
const { getDetailedStats, customEmojis, deleteReplyIn, dealDamage, generateCaptcha } = require("../Modules/functions.js");
const { requestVerification } = require("../Modules/components.js");
const Avalon = require("../Modules/avalon.js");
const buffInfo = require("../Modules/buffs.js");
const _ = require('lodash');

const dungeonInProgress = new Map();

const prizePool = {
    coins: 3000000,
    gems: 1200,
    deluxe: 40,
    royal: 180,
    glorious: 520,
    kernel: 1500,
    ssticket: 50,
    sticket: 200,
    aticket: 1000,
};

let sentRewards = false;
function endStampede() {

    // Make sure to only send rewards once
    if (sentRewards) return;
    sentRewards = true;
    setTimeout(() => {
        sentRewards = false
    }, 30*60*1000);
    
    db.serialize(async () => {
        const { 0: stampede } = await query(`SELECT rowid, * FROM stampedes ORDER BY rowid DESC LIMIT 1`);
        stampede.participation = JSON.parse(stampede.participation);
        
        let mailboxes = await query(`SELECT id, mailbox FROM users WHERE id IN (${Object.keys(stampede.participation).join(", ")})`);

        const players = Object.entries(stampede.participation).map((e) => ({ id: e[0], points: e[1], mailbox: JSON.parse(mailboxes.find((mailbox) => mailbox.id === e[0])?.mailbox || "[]") }) );
        const playersWithPrizes = distributePrizes(players, prizePool);
        
        for (const player of playersWithPrizes) {
            const mail = {"type": "2,4,8,9", "rewards": `coins|${Math.floor(5000)+player.coins},gems|${Math.floor(20)+player.gems},item|458|${Math.floor(1)+player.deluxe},item|457|${Math.floor(3)+player.royal},item|454|${Math.floor(5)+player.glorious},item|683|${Math.floor(10)+player.kernel},ss ticket|${Math.floor(1)+player.ssticket},s ticket|${Math.floor(3)+player.sticket},a ticket|${Math.floor(5)+player.aticket}`, "message": "Stampede Rewards", "date": new Date().getTime()};
            
            player.mailbox.push(mail);
            await query(`UPDATE users SET mailbox = '${JSON.stringify(player.mailbox)}' WHERE id = ${player.id}`);
        };

        console.log("Rewards sent successfully!");
    });
};

function distributePrizes(players, prizePool) {
    // calculate total points
    let totalPoints = players.reduce((total, player) => total + player.points, 0);
  
    // distribute prizes
    let remainingPrizes = { ...prizePool };

    players.forEach(player => {
        Object.keys(prizePool).forEach((e) => {
            player[e] = Math.floor((player.points / totalPoints) * prizePool[e]);
            remainingPrizes[e] -= player[e];
        });
    });
    
    // distribute remaining prizes randomly
    // for (let prize in remainingPrizes) {
    //     while (remainingPrizes[prize] > 0) {
    //         players[Math.floor(Math.random() * players.length)][prize]++;
    //         remainingPrizes[prize]--;
    //     };
    // };
    
    // distribute remaining prizes randomly
    players.sort((a, b) => b.points - a.points);
    for (let prize in remainingPrizes) {
        while (remainingPrizes[prize] > 0) {
            for (let i=0; i < players.length; i++) {
                if (remainingPrizes[prize] === 0) break;
                players[i][prize]++;
                remainingPrizes[prize]--;
            };
        };
    };
    
    return players;
};

function cdLeft(id) {
    return dungeonInProgress.has(id) ? `\`${Math.floor((dungeonInProgress.get(id) - new Date().getTime())/60000) > 0 ? `${Math.floor((dungeonInProgress.get(id) - new Date().getTime())/60000)}min ` : ""}${Math.floor((dungeonInProgress.get(id) - new Date().getTime())/1000)%60}s left\`` : "`ready`"
};

function bossSelection(interaction, stampede, myChar, partyQuery) {
    return new Promise((resolve) => {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('0')
                    .setLabel("I'm ready, let me fight!")
                    .setStyle('Danger')
                    .setDisabled(stampede.bosshp < 1 || new Date().getDate() > 7),
                )

        const Embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(stampedes[stampede.type].title)
        .setThumbnail("https://i.imgur.com/ZUdnLZO.png")
        // .setDescription(`**Goblin King**: \`${stampede.bosshp < 0 ? 0 : stampede.bosshp}/${stampede.bosshpmax}\`\\💖\n**Goblin Generals**: \`${stampede.generalsleft}/${stampede.generalstotal}\` ➜ \`${stampede.generalhp < 0 ? 0 : stampede.generalhp}/${stampede.generalhpmax}\`\\💖\n**Goblins**: \`${stampede.monstersleft}/${stampede.monsterstotal}\`\n\n**Damage dealt**: \`${JSON.parse(stampede.participation)[interaction.user.id] || 0}\`\n**Total damage**: \`${Object.values(JSON.parse(stampede.participation)).reduce((acc, e) => acc+e, 0)}\`\n\n**Prize Pool**\n<:deluxe_chest:1069301259603026061>x${prizePool.deluxe}, <:royal_chest:1069301128711376976>x${prizePool.royal}, <:glorious_chest:1069076067081539726>x${prizePool.glorious}\n<:ss_ticket:927503239396622336>x${prizePool.ssticket}, <:s_ticket:927642487705722890>x${prizePool.sticket}, <:a_ticket:929420377946472508>x${prizePool.aticket}\n<:genesis_gems:1034179687720681492>x${prizePool.gems}, <:coins:1030580480782893197>x${Math.round(prizePool.coins/1000000)}mil\n\n**Party**\n${(abilities?.[myChar.id]?.party) ? "✨ " : "<:blank:917804200363171860> "}__${myChar.name}__ ${cdLeft(interaction.user.id)}${partyQuery.map((e) => `\n${(abilities?.[e.stampedechar]?.party) ? "✨ " : "<:blank:917804200363171860> "}${characters[e.stampedechar].name} ${cdLeft(e.id)}`)}`)
        .setDescription(`**Goblin King**: \`${stampede.bosshp < 0 ? 0 : stampede.bosshp}/${stampede.bosshpmax}\`\\💖\n**Goblin Generals**: \`${stampede.generalsleft}/${stampede.generalstotal}\` ➜ \`${stampede.generalhp < 0 ? 0 : stampede.generalhp}/${stampede.generalhpmax}\`\\💖\n**Goblins**: \`${stampede.monstersleft}/${stampede.monsterstotal}\`\n\n**Your damage**: \`${JSON.parse(stampede.participation)[interaction.user.id] || 0}\`\n**Global damage**: \`${Object.values(JSON.parse(stampede.participation)).reduce((acc, e) => acc+e, 0)}\``)
        .addFields(
            { name: "**Prize Pool**", value: `<:deluxe_chest:1069301259603026061>x${prizePool.deluxe}, <:royal_chest:1069301128711376976>x${prizePool.royal}, <:glorious_chest:1069076067081539726>x${prizePool.glorious}\n<:ss_ticket:927503239396622336>x${prizePool.ssticket}, <:s_ticket:927642487705722890>x${prizePool.sticket}, <:a_ticket:929420377946472508>x${prizePool.aticket}\n<:starlight_kernel:1106121205515288659>x${prizePool.kernel}, <:genesis_gems:1034179687720681492>x${prizePool.gems}, <:coins:1030580480782893197>x${Math.round(prizePool.coins/1000000)}mil`, inline: true },
            { name: "**Participation Rewards**", value: `<:deluxe_chest:1069301259603026061>x1, <:royal_chest:1069301128711376976>x3, <:glorious_chest:1069076067081539726>x5\n<:ss_ticket:927503239396622336>x1, <:s_ticket:927642487705722890>x3, <:a_ticket:929420377946472508>x5\n<:starlight_kernel:1106121205515288659>x10, <:genesis_gems:1034179687720681492>x20, <:coins:1030580480782893197>x5000`, inline: true },
            { name: "\u200B", value: "_ _", inline: true },
            { name: "**Party**", value: `${(abilities?.[myChar.id]?.party) ? "✨ " : "<:blank:917804200363171860> "}__${myChar.name}__${partyQuery.map((e) => `\n${(abilities?.[e.stampedechar]?.party) ? "✨ " : "<:blank:917804200363171860> "}${characters[e.stampedechar].name}`).join("")}`, inline: true },
            { name: "\u200B", value: `${cdLeft(interaction.user.id)}${partyQuery.map((e) => `\n${cdLeft(e.id)}`).join("")}`, inline: true },
            { name: "\u200B", value: "_ _", inline: true },
        )
        interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then((msg) => {
            
            const collector = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 30000 });

            collector.on('collect', async r => {
                if (dungeonInProgress.has(interaction.user.id)) return interaction.channel.send(`You can play again in${Math.floor((dungeonInProgress.get(interaction.user.id) - new Date().getTime())/60000) > 0 ? ` **${Math.floor((dungeonInProgress.get(interaction.user.id) - new Date().getTime())/60000)}**min` : ""} **${Math.floor((dungeonInProgress.get(interaction.user.id) - new Date().getTime())/1000)%60}**s`);
                resolve(1);
                collector.stop();
            });

            collector.on('end', async component => {
                resolve(0);
                collector.stop();
            });
            
        });

    });
};

function adjustDEF(myStatsC) {
    return myStatsC.atk > 128 ? Math.floor(((Math.log(Math.max(myStatsC.atk, myStatsC.md))/Math.log(2))-7) * 274) : 0;
};

module.exports = {
    name: 'stampede',
	description: 'stampede (monthy event)',
	execute(interaction) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
                
        db.serialize(async () => {
            await interaction.deferReply().catch((err) => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });

            let stats = await query(`SELECT users.id, users.class, users.coins, users.stampedechar, users.eventpts, users.eventrewreceived, users.guild, users.party, users.animationdelay, users.premium, users.skins, characters.chars, characters.ref, characters.level, characters.equipment, characters.skin, dungeon.floors, dungeon.'limit', dungeon.classes, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${interaction.user.id}`);
            stats = {id: stats[0].id, class: stats[0].class, coins: stats[0].coins, stampedechar: stats[0].stampedechar, eventpts: stats[0].eventpts, eventrewreceived: stats[0].eventrewreceived, guild: stats[0].guild, party: stats[0].party, animationdelay: stats[0].animationdelay, premium: stats[0].premium, skins: JSON.parse(stats[0].skins), chars: JSON.parse(stats[0].chars), ref: JSON.parse(stats[0].ref), level: JSON.parse(stats[0].level), equipment: JSON.parse(stats[0].equipment), skin: JSON.parse(stats[0].skin), limit: stats[0].limit, floors: JSON.parse(stats[0].floors), classes: JSON.parse(stats[0].classes), classlevels: JSON.parse(stats[0].classlevels)};

            if (stats.stampedechar === null || !stats.chars.includes(stats.stampedechar)) return interaction.editReply("You have to choose a battle character first. Use `/select <char name> mode:stampede` to choose one.");

            const { 0: guild } = await query(`SELECT * FROM guilds WHERE id = '${stats.guild}'`);
            const { 0: stampede } = await query(`SELECT rowid, * FROM stampedes ORDER BY rowid DESC LIMIT 1`);
            
            // User stats
            let myChar = characters[stats.stampedechar];
            let myStats = await getDetailedStats(myChar.id, stats, stats.classlevels);
            let myStatsC = {...myStats};
            let myClass = myStats.class !== -1 ? classes[myStats.class] : false;
            let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : false;
            let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : false;

            const thumbnail = myChar.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[myChar.id], stats.skin[myChar.id]);

            // Party member stats
            const partyQuery = await query(`SELECT id, stampedechar FROM users WHERE party = '${stats.party}' AND stampedechar IS NOT NULL AND id != ${interaction.user.id}`);
            let partyChars = partyQuery.map((e) => characters[e.stampedechar]);
            let partyStats = [];
            for (const ps of partyQuery) partyStats.push(await getDetailedStats(ps.stampedechar, stats, stats.classlevels));
            let partyStatsC = _.cloneDeep(partyStats);
            // let partyClass = partyStats.map((e) => e.class !== -1 ? classes[e.class] : false);
            // let partySkill = partyStats.map((e) => e.class !== -1 ? _.cloneDeep(skills[e.class]) : false);
            let partyAbility = partyChars.map((e) => e.id in abilities ? _.cloneDeep(abilities[e.id]) : false);

            // Menu
            const boss = await bossSelection(interaction, stampede, myChar, partyQuery);
            if (boss === 0) return;

            // Enemy Stats
            let enemyType, curseId;
            if (stampede.monstersleft > 0) {
                enemyType = "monster";
                curseId = curses.filter((e) => e.tier === 0 && e.id !== 13).sort((a, b) => Math.random() - 0.5)[0].id;
            } else if (stampede.generalsleft > 0) {
                enemyType = "general";
                curseId = 11;
            } else {
                enemyType = "boss";
                curseId = 9;
            };

            // Captcha
            if (Math.random() < 0.03) requestVerification.set(interaction.user.id, {});
            if (requestVerification.has(interaction.user.id)) {
                const captcha = generateCaptcha();
                clearTimeout(requestVerification.get(interaction.user.id).timeout);
                requestVerification.set(interaction.user.id, {text: captcha.text, timeout: setTimeout(() => requestVerification.delete(interaction.user.id), 60*60*1000)});
                return interaction.editReply({content: "Use </captcha:1114616338581823568> to enter the code", embeds: [], components: [], files: [captcha.attachement]})
            };

            // Set up restrictions
            const cd = enemyType === "monster" ? 2*60*1000 : 15*60*1000;
            if (dungeonInProgress.has(stats.id)) return interaction.channel.send(`You can play again in${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime())/60000) > 0 ? ` **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime())/60000)}**min` : ""} **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime())/1000)%60}**s`);
            dungeonInProgress.set(stats.id, new Date().getTime()+cd);
            setTimeout(() => {
                dungeonInProgress.delete(stats.id);
                if (enemyType !== "monster") interaction.channel.send(`${interaction.user.toString()} is off </stampede:1111044852679979019> cooldown!`);
            }, cd);

            const enemy = stampedes[stampede.type][enemyType];
            const curse = curses[curseId];
            const eAbility = enemy.boss ? eventBossAbilities[boss.id] : false;
            let eImage = enemy.image[0];
            
            let eStats = {
                "name": enemy.name,
                "hp": Math.floor(750 + (Math.random() * 4250)),
                "maxhp": 1200,
                "atk": Math.floor(150 + (Math.random() * 250)),
                "def": 120,
                "ep": 0,
                "md": 200,
                "mr": 120,
                "cr": 0.18,
                "cd": 1.25,
                "td": 30,
                "br": 0.12,
                "dodge": 0.1,
                "mana": 120,
                "mg": 15,
                "sm": 20,
                "rev": 0,
                "revhp": 0.5,
                "shield": 0,
                "mdChance": 0,
            };
            eStats.maxhp = eStats.hp;

            // Set Stats
            if (enemyType === "boss") {
                eStats.hp = stampede.bosshp;
                eStats.maxhp = stampede.bosshpmax;
                eStats.atk = Math.floor(myStatsC.hp*0.18);
                eStats.md = Math.floor(myStatsC.hp*0.18);
                eStats.def = 320;
                eStats.mr = 320;
                eStats.cr = 0.33;
                eStats.cd = 1.75;
                eStats.mdChance = 0.5;
                eStats.mg = 16;
                eStats.mana = 200;
            } else if (enemyType === "general") {
                eStats.hp = stampede.generalhp;
                eStats.maxhp = stampede.generalhpmax;
                eStats.shield = Math.floor(200 + Math.random()*1000);
                eStats.atk = Math.floor(myStatsC.hp*0.14);
                eStats.md = Math.floor(myStatsC.hp*0.14);
                eStats.def = 160;
                eStats.mr = 160;
                eStats.cr = 0.27;
                eStats.cd = 1.5;
                eStats.mdChance = 0.5;
                eStats.mana = 160;
            };
            eStats.ep = Math.floor(((1/(1-eStats.dodge))*(eStats.hp/Math.pow(0.99895,Math.max(eStats.def, eStats.mr))) / (200/(Math.max(eStats.atk, eStats.md)*(1+((eStats.cr > 1 ? 1 : (eStats.cr < 0) ? 0 : eStats.cr)*(eStats.cd-1))))))*100) / 100;

            eStats.image = eImage;
            let eStatsC = {...eStats};
            
            // Some match settings
            const difficulty = Avalon.getDifficulty(myStats.ep/eStats.ep);
            const aDelay = stats.animationdelay;

            let buffs = Avalon.getBuffs();
            let eBuffs = Avalon.getBuffs();

            // ATK buffs
            eBuffs.atk.push(new buffInfo("*", 1, 9999, 1.02, "*"));
            eBuffs.md.push(new buffInfo("*", 1, 9999, 1.02, "*"));
            
            async function matchResult(r) {
                
                // Class Level
                let cxpmsg = "You don't have a class";
                if (myClass) {
                    let boost = 1 + matchStats.xpboost;
                    stats.classes.map((e) => classes[e].tier).forEach((e) => {
                        switch (e) {
                            case 2: boost += 0.05; break;
                            case 3: boost += 0.15; break;
                            case 4: boost += 0.25; break;
                            default: false; break;
                        };
                    });

                    // Premium Buff
                    switch (stats.premium) {
                        case 3: boost += 0.2; break;
                        case 4: boost += 0.3; break;
                        case 5: boost += 0.5; break;
                        case 6: boost += 0.75; break;
                        case 7: boost += 1; break;
                        default : false; break;
                    };
                    
                    // Guild Buff
                    if (guild) boost += (0.2*guild.xpbuff);

                    boost = Math.round(boost*100)/100;
                    let cxp = Math.floor((120 + (Math.random() * 120)) * boost);
                    cxpmsg = `Class XP: **${cxp}** (Boost: x${boost})`;
                    if (myClass.id in stats.classlevels) stats.classlevels[myClass.id] += cxp;
                    else stats.classlevels[myClass.id] = cxp;
                };
                
                // Coins
                let loot = Math.floor(((Math.floor(500 + (Math.random() * 250))/(enemyType === "monster" ? 20 : 5)) * (matchStats.lootm+(guild?.lootbuff ? 0.2*guild.lootbuff : 0))) + matchStats.loot);
                if (loot > 1000000) loot = 10000;

                // Kernel
                let kernelDrop = (Math.random() < (enemyType === "monster" ? 0.01 : 0.1));
                let myItems = kernelDrop ? await query(`SELECT items FROM users WHERE users.id = ${interaction.user.id}`) : false;
                if (myItems) {
                    myItems = JSON.parse(myItems[0].items);
                    myItems[683] = myItems[683]+1 || 1;
                };

                // Damage dealt
                const { 0: party } = await query(`SELECT * FROM parties WHERE id = '${stats.party}'`);
                const damageDealt = enemyType === "monster" ? eStatsC.maxhp - eStatsC.hp : eStats.hp - eStatsC.hp;
                const { 0: damages } = await query(`SELECT participation FROM stampedes ORDER BY rowid DESC LIMIT 1`);
                damages.participation = JSON.parse(damages.participation);
                (party ? party.members.split(",") : [interaction.user.id]).forEach((e) => {
                    damages.participation[e] = damages.participation[e] + damageDealt || damageDealt;
                });

                await query(`UPDATE users SET coins = coins + ${loot}${kernelDrop ? `, items = '${JSON.stringify(myItems)}'` : ""} WHERE id = ${interaction.user.id}`);
                await query(`UPDATE dungeon SET classlevels = '${JSON.stringify(stats.classlevels)}' WHERE id = ${interaction.user.id}`);

                if (enemyType === "monster") {
                    await query(`UPDATE stampedes SET ${r === "w" ? "monstersleft = monstersleft - 1, " : ""}participation = '${JSON.stringify(damages.participation)}' WHERE rowid = ${stampede.rowid}`);
                } else if (enemyType === "general") {
                    await query(`UPDATE stampedes SET generalhp = generalhp - ${damageDealt}, participation = '${JSON.stringify(damages.participation)}' WHERE rowid = ${stampede.rowid}`);

                    const { 0: ghp } = await query(`SELECT generalsleft, generalhp FROM stampedes WHERE rowid = ${stampede.rowid}`);
                    if (ghp.generalhp < 1) {
                        if (ghp.generalsleft > 1) await query(`UPDATE stampedes SET generalsleft = generalsleft - 1, generalhp = generalhpmax WHERE rowid = ${stampede.rowid}`);
                        else await query(`UPDATE stampedes SET generalsleft = 0, generalhp = 0 WHERE rowid = ${stampede.rowid}`);
                    };
                } else {
                    await query(`UPDATE stampedes SET bosshp = bosshp - ${damageDealt}, participation = '${JSON.stringify(damages.participation)}' WHERE rowid = ${stampede.rowid}`);

                    const { 0: bhp } = await query(`SELECT bosshp FROM stampedes WHERE rowid = ${stampede.rowid}`);
                    if (bhp.bosshp < 1) endStampede(); // Finish Stampede!
                };
                
                const Embed = new EmbedBuilder()
                .setColor(0xff0000)
                .setThumbnail(thumbnail)
                .setTitle(stampedes[stampede.type].title)
                .setDescription(`<:stars_v2:917023655840591963> **${myChar.name}** ${r === "w" ? "won" : "lost"} <:stars_v2:917023655840591963>\n<a:arrow_green:916716811842621450> dealt **${damageDealt}** damage\n<a:arrow_orange:916716747623641210> ${cxpmsg}\n\n<:npbag:929428030554787892> Loot\n${loot}<:coins:872926669055356939>${kernelDrop ? ", <:starlight_kernel:1106121205515288659>x1" : ""}`)
                .setFooter({text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048"})
                return Embed;
            };

            let matchStats = Avalon.getMatchStats(interaction, {allowExecution: false});
            let notice = ["", "", "", ""];

            // Apply passives
            if (skill && myChar.id !== 4767) skill._passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
            if (myAbility?.passive) myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            if (myStats.weapon !== -1) items[myStats.weapon]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            if (myStats.shieldid) items[myStats.shieldid]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            if (myStats.helmet && items?.[myStats.helmet].setname === items?.[myStats.cuirass]?.setname && items?.[myStats.helmet].setname === items?.[myStats.gloves]?.setname && items?.[myStats.helmet].setname === items?.[myStats.boots]?.setname) items[myStats.boots]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            partyAbility.filter((e) => e).forEach((e, i) => ("party" in e) ? e.party(partyStatsC[i], myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user) : false);
            
            const ATK_EMOJI = myStatsC.replaceButton?.atk?.emoji || '⚔️',
                  DEF_EMOJI = myStatsC.replaceButton?.def?.emoji || '🛡️',
                  ABILITY_EMOJI = myStatsC.replaceButton?.ability?.emoji || '✨',
                  SKILL_EMOJI = myStatsC.replaceButton?.skill?.emoji || '⚜️';

            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle('Danger'),
                new ButtonBuilder().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle('Danger'),
                new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle('Danger').setDisabled((myAbility && "ability" in myAbility) ? false : true),
                new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle('Danger').setDisabled(myStats.class !== -1 ? false : true),
            );
            
            async function newFight() {
                const timestart = new Date().getTime();
                const result = await new Promise((resolve, rejects) => {
                    const Embed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setThumbnail(thumbnail)
                    .setFooter({text: `Enemy EP: ${eStatsC.ep} | round 1 | time left: 120s`})
                    .setTitle(stampedes[stampede.type].title)
                    .setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.maxhp}\\💖${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp/eStats.maxhp, eStatsC.sm/eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStats.hp}\\💖${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp/myStatsC.maxhp, myStatsC.sm/myStatsC.mana)}\n${Avalon.padStats(myStatsC)}`)
                    .setImage(eImage)
                    interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {
    
                        const atk = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "ATK", componentType: ComponentType.Button, time: 120000 });
                        const def = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "DEF", componentType: ComponentType.Button, time: 120000 });
                        const ability = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "ABILITY", componentType: ComponentType.Button, time: 120000 });
                        const cskill = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "SKILL", componentType: ComponentType.Button, time: 120000 });
                        matchStats.collector = {"atk": atk, "def": def, "ability": ability, "cskill": cskill};
                        matchStats.message = msg;
                        
                        // Use passives
                        if (myChar.id !== 4767) curse.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                        // Adjust DEF
                        eStatsC.def += adjustDEF(myStatsC);
                        eStatsC.mr += adjustDEF(myStatsC);

                        let timeout;
                        async function editEmbed() {
                            Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp/eStatsC.maxhp, eStatsC.sm/eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp/myStatsC.maxhp, myStatsC.sm/myStatsC.mana)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-4).join("")}`);
                            Embed.setFooter({text: `Enemy EP: ${eStatsC.ep} | round ${matchStats.round} | time left: ${120+Math.floor((timestart-new Date().getTime())/1000)}s`});
                            // await msg.edit({ embeds: [Embed] });

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

                            // Remove HP debuffs from boss
                            eBuffs.hp = eBuffs.hp.filter((buff) => (buff.type === "*" && buff.val > 1) || (buff.type === "+" && buff.val > 0) );

                            // Increase ATK
                            eBuffs.atk.push(new buffInfo("+", Math.floor(eStats.atk*matchStats.round*0.01), 9999));
                            eBuffs.md.push(new buffInfo("+", Math.floor(eStats.md*matchStats.round*0.01), 9999));

                            // Apply Buffy
                            if (matchStats.currentCharacter === 0) Avalon.applyBuffs(buffs, myStatsC);
                            if (matchStats.currentOpponent === 0) Avalon.applyBuffs(eBuffs, eStatsC);
                            
                            // Adjust Boss DEF
                            eStatsC.def += adjustDEF(myStatsC);
                            eStatsC.mr += adjustDEF(myStatsC);

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

                            Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
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
                                    dealDamage(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, `⚔️ **${enemy.name}**`, {magicDamage: true, combodmg: true, selfdmg: true, selfheal: true});
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    matchStats.turn = 1;
                                    matchStats.round++;
                                    startNextRound();
                                    editEmbed();
                                };
                                if (matchStats.counter > 0) matchStats.counter--;
                            }, aDelay);
                        };

                        // Write passive actions if any
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
                                    dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, {magicDamage: true, combodmg: true, selfdmg: true, selfheal: true});
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
    
                                    if (matchStats.twinshot > Math.random()) setTimeout(() => {
                                        dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, {magicDamage: true, combodmg: true, selfdmg: true, selfheal: true});
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
                                    };
                                    myStatsC.usedBlockRound = matchStats.round;
                                    attack();
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                }
                                
                            } else interaction.channel.send("Please wait a moment").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                        });
                        
                        ability.on('collect', async r => {
                            if ((enemyType === "boss" || enemyType === "general") && myChar.id === 238) return interaction.channel.send(`Rimuru can't eat your current opponent`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));

                            if (myAbility.used < myAbility.usage) {
                                if (matchStats.turn === 1) {
                                    if (myAbility.cost > myStatsC.sm) interaction.channel.send(`You don't have enough mana! (**${myStatsC.sm}**/${myAbility.cost}${customEmojis.mana})`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                    else {
                                        matchStats.turn = 0;
                                        matchStats.attackStreak = 0;
                                        myAbility.used++;
                                        await myAbility.ability(myStatsC, myStats, eStatsC, eStats, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, msg, partyChars);
                                        myStatsC.sm -= myAbility.cost;
                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        attack();
                                    };
                                } else interaction.channel.send("Please wait a moment").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            } else interaction.channel.send(`You can use **${myChar.name}**'s ability only ${myAbility.usage == 1 ? "once" : `${myAbility.usage} times`} per fight.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                        });
                        
                        cskill.on('collect', async r => {
                            if (myChar.id === 4767) return interaction.channel.send("Asta can't use any abilities").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            if (skill._cost > myStatsC.sm) return interaction.channel.send(`You don't have enough mana! (**${myStatsC.sm}**/${skill._cost}${customEmojis.mana})`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
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