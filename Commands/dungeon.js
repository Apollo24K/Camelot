/* eslint-disable no-unused-vars */
const fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { abilities } = require("../Modules/abilities.js");
const { achievements } = require("../Modules/achievements.js");
const { classes } = require("../Modules/classes.js");
const { curses } = require("../Modules/curses.js");
const { floors } = require("../Modules/enemies.js");
const { items } = require("../Modules/items.js");
const { skills, bossAbilities } = require("../Modules/skills.js");
const { characters } = require("../Modules/chars.js");
const { dailies } = require("../Modules/dailyQuests.js");
const { getDetailedStats, customEmojis, deleteReplyIn, dealDamage } = require("../Modules/functions.js");
const Avalon = require("../Modules/avalon.js");
const buffInfo = require("../Modules/buffs.js");
const _ = require('lodash');

const dungeonInProgress = new Set();

function drops(p, max=1, n=0) {
    for (let i=0; i < max; i++) n += p > Math.random();
    return n;
};

function waitForTutorial(interaction, stats) {
    return new Promise((resolve) => {
        let row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('continue')
                    .setLabel('Continue')
                    .setStyle('SUCCESS'),
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('skip')
                    .setLabel('Skip')
                    .setStyle('PRIMARY'),
            );
        
        let page = 0;
        const pages = [
            ["Welcome to the dungeon!", "The dungeon is a dangerous place filled with ferocious monsters only for the bravest of adventurers to enter. It contains various items of value, promising its challengers all the riches and prestige there is to obtain in this world.\n\nBut don't let that scare you, I'm here to help and I'm certainly rooting for you <:TohruPoint:928370972132782090>"],
            ["Dungeon Monsters", "The dungeon is a massive construct reaching deep under the ground. There are various monsters roaming in the dungeon, the stronger ones deeper in there than the others.\n\nThe trickiest part will be the **boss floors** on every `5th` floor where you will encounter floor guardians stronger than anything you've seen up to that point.\n\nMonsters can have a set of abilities called **curses** <:Common_Curse:952175936554557530> which can affect the way they fight. Be especially careful around boss monsters, not only do they have curses <:Rare_Curse:952175947409408041> stronger than those of average monsters, but each one of them also has a unique ability, making their movements difficut to predict."],
            ["Stats", "Both monsters and characters have the following stats:\n\n❤️`Health Points`⚔️`Attack      `🛡️`Defense        `\n💠`Shield       `🪄`Magic Damage`🔰`Magic Resist   `\n🎯`Crit Rate    `💥`Crit Damage `🛡️`Block Rate     `\n💨`Dodge Chance `💧`Mana        `💦`Mana Generation`\n\nYou can increase your stats by leveling your character, class and items. Oh and there's a more detailed guide on this in our </support:1011293280702578694> server <:ThumbsUp:1020442047712350298>"],
            ["Player Actions", `There are 5 possible actions you can decide on taking during a battle, which are as follows:\n\n⚔️ **ATK** ➜ A simple attack to deal damage to your enemy.\n🛡️ **DEF** ➜ Increases your characters defense and magic resistance. You'll have a chance of blocking the next attack.\n✨ **ABILITY** ➜ Some characters have unique abilities you can use during the battle. ${stats.battlechar in abilities ? "You can read about your characters ability with `/ability`!" : "Unfortunately your current character does't seem to have an ability."} Abilities consume mana💧\n⚜️ **SKILL** ➜ Class skills are abilities obtained from your class.${stats.battlechar in stats.class ? ` Your current class ${classes[stats.class[stats.battlechar]].active.toLowerCase()}` : ""} Skills consume mana💧\n⏩ **SKIP** ➜ Skip to the results of the battle.`],
            ["You're finally ready!", "That's all I can teach you for now. The rest is up to you! <:ThumbsUp:1020442047712350298>\n\nSee you soon, I'll be watching you <:MashaWave:928370055354400799> Good Luck!"],
        ];

        const Embed = new MessageEmbed()
        .setColor(0xbbffff)
        .setTitle(pages[page][0])
        .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
        .setDescription(pages[page][1])
        interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then((msg) => {
            
            const collector = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "continue", componentType: 'BUTTON', time: 180000 });
            const skip = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "skip", componentType: 'BUTTON', time: 180000 });

            collector.on('collect', async r => {
                if (++page === pages.length) {
                    collector.stop(), skip.stop();
                    stats.tutorial.push(8);
                    await query(`UPDATE users SET tutorial = '${JSON.stringify(stats.tutorial)}' WHERE id = ${interaction.user.id}`);        
                    resolve();
                } else {
                    Embed.setTitle(pages[page][0]).setDescription(pages[page][1]);
                    interaction.editReply({ embeds: [Embed], components: [row] });
                };
            });

            skip.on('collect', async r => {
                collector.stop(), skip.stop();

                stats.tutorial.push(8);
                await query(`UPDATE users SET tutorial = '${JSON.stringify(stats.tutorial)}' WHERE id = ${interaction.user.id}`);        

                resolve();
            });
            
        });

    });
};

module.exports = {
    name: 'dungeon',
	description: 'dungeon',
	execute(interaction) {

        let customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        let choice = interaction.options.getInteger('floor');
        let floorDiff = parseInt(interaction.options.getString('difficulty') || -1);
        let flag = interaction.options.getString('flag');
        
        db.serialize(async () => {
            await interaction.deferReply().catch((err) => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });

            let stats = await query(`SELECT users.id, users.coins, users.battlechar, users.guild, users.animationdelay, users.premium, users.tutorial, characters.chars, characters.ref, characters.level, characters.class, characters.equipment, characters.skin, dungeon.floors, dungeon.'limit', dungeon.classes, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${interaction.user.id}`);
            stats = {id: stats[0].id, coins: stats[0].coins, battlechar: stats[0].battlechar, guild: stats[0].guild, animationdelay: stats[0].animationdelay, premium: stats[0].premium, tutorial: JSON.parse(stats[0].tutorial), chars: JSON.parse(stats[0].chars), ref: JSON.parse(stats[0].ref), level: JSON.parse(stats[0].level), class: JSON.parse(stats[0].class), equipment: JSON.parse(stats[0].equipment), skin: JSON.parse(stats[0].skin), limit: stats[0].limit, floors: JSON.parse(stats[0].floors), classes: JSON.parse(stats[0].classes), classlevels: JSON.parse(stats[0].classlevels)};

            if (stats.battlechar === null || !stats.chars.includes(stats.battlechar)) return interaction.editReply("You have to choose a battle character first. Use `/select <char name>` to choose one.");
            
            const { 0: guild } = await query(`SELECT * FROM guilds WHERE id = '${stats.guild}'`);
            
            // Tutorial
            if (!stats.tutorial.includes(8)) await waitForTutorial(interaction, stats);

            let floor = parseInt(Object.keys(stats.floors)[Object.keys(stats.floors).length-1]);
            if (stats.floors[floor] >= floors[floor]?.winsNeeded && floor !== 300) stats.floors[++floor] = 0;
            if (floorDiff === -1) floorDiff = Math.floor((floor-1)/100);

            if (choice) {
                if (choice < 1) return interaction.editReply(`There is no floor ${choice} <:EmiliaWot:868996542080622603>`);
                if (choice+(floorDiff*100) > floor) return interaction.editReply(`You haven't unlocked Floor ${choice} yet. You need ${floors[floor]?.winsNeeded} ${floors[floor]?.winsNeeded === 1 ? "win" : "wins"} on floor \`${Math.min(floor, 100)}/${floor <= 100 ? 0 : Math.min(floor-100, 100)}/${Math.max(floor-200, 0)}\` to unlock the next one.`);
                floor = Math.round(choice+(floorDiff*100));
            };
            if (floor > 300) floor = 300;
            
            // Increase limit
            let dunLim = [10, 40+(floorDiff*10), 1000]; // [0] -> loot, [1] -> progress, [2] -> 2nd loot limit
            if (stats.premium) {
                switch (stats.premium) {
                    case 1: dunLim = [12, 45+(floorDiff*10), 1000]; break;
                    case 2: dunLim = [15, 50+(floorDiff*10), 1000]; break;
                    case 3: dunLim = [20, 60+(floorDiff*10), 1000]; break;
                    case 4: dunLim = [25, 60+(floorDiff*10), 1000]; break;
                    case 5: dunLim = [30, 60+(floorDiff*10), 1000]; break;
                    case 6: dunLim = [30, 70+(floorDiff*10), 1000]; break;
                    case 7: dunLim = [30, 80+(floorDiff*10), 1000]; break;
                    default : false; break;
                };
            };
            
            // Check if user can skip
            if (flag === "all" && stats.premium < 3) return interaction.editReply("This is a `/premium` feature. If you like the bot and want to help us out we'd appreciate your support <:RaphiSmile:868998036645380197>");
            if ((flag === "skip" || flag === "all") && dunLim[0] - stats.limit <= 0) return interaction.editReply("You've already used up all your skips for this interval.");
            
            // Set up restrictions
            if (dungeonInProgress.has(stats.id)) return interaction.editReply("You already have a run in progress, please finish it before attempting to start a new round.");
            dungeonInProgress.add(stats.id);
            const userTimeout = setTimeout(() => dungeonInProgress.delete(stats.id), 120000);
            
            // Increase run count
            let skipRounds = 1;
            stats.limit++;
            if (flag === "all") {
                skipRounds = dunLim[0] - stats.limit;
                stats.limit = dunLim[0];
            };
            await query(`UPDATE dungeon SET 'limit' = ${stats.limit} WHERE id = ${interaction.user.id}`);
            
            // User stats
            let myChar = characters[stats.battlechar];
            let myStats = await getDetailedStats(myChar.id, stats, stats.classlevels);
            let myStatsC = {...myStats};
            let myClass = myStats.class !== -1 ? classes[myStats.class] : false;
            let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : false;
            let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : false;

            const thumbnail = myChar.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[myChar.id], stats.skin[myChar.id]);

            // Enemy Stats
            let enemy = floors[floor].monster;
            const curseRar = enemy.boss ? curses.filter((e) => e.tier) : curses.filter((e) => e.tier === 0);
            const curse = curseRar[Math.floor(Math.random() * curseRar.length)];
            let eAbility = enemy.boss ? bossAbilities.find((e) => e.list[0] === floor) : false;
            let eImage = enemy.image[Math.floor(Math.random()*enemy.image.length)];

            let eStats = floors[floor].stats(enemy);
            let eStatsC = {...eStats};

            // Some match settings
            const difficulty = Avalon.getDifficulty(myStats.ep/eStats.ep);
            const aDelay = stats.premium ? stats.animationdelay : 1200;

            let buffs = Avalon.getBuffs();
            let eBuffs = Avalon.getBuffs();
            
            async function matchResult(r) {
                // Clear restrictions
                clearTimeout(userTimeout);
                dungeonInProgress.delete(stats.id);

                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setThumbnail(thumbnail)
                .setTitle(`Dungeon Floor ${(floor-1)%100 +1} ${enemy.boss ? "(Boss)" : ""}`)
                .setFooter(`Balance: ${stats.coins} coins`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                if (r === "l") return Embed.setDescription(`💀 **${myChar.name}** lost 💀\n<a:arrow_green:916716811842621450> Floor ${floor} progress: **${stats.floors[floor]}**/${floors[floor]?.winsNeeded}\n<a:arrow_orange:916716747623641210> Runs left: **${stats.limit < dunLim[0] ? dunLim[0] - stats.limit : 0}** + **${stats.limit < dunLim[1] ? dunLim[1] - stats.limit : 0}**\n<a:arrow_red:916716702618767401> ${eStats.ep > myStats.ep ? `**${enemy.name}** was ${Math.floor((eStats.ep/myStats.ep)*10000)/100}% stronger` : "Better luck next time"}`);

                if (dunLim[1] - stats.limit >= 0 || stats.floors[floor] >= floors[floor]?.winsNeeded) stats.floors[floor]++;

                let unlocked = `<a:arrow_green:916716811842621450> Floor ${floor} progress: **${stats.floors[floor]}**/${floors[floor]?.winsNeeded}`;
                if (stats.floors[floor] === floors[floor]?.winsNeeded) {
                    unlocked = `🔑 Floor **${floor+1}** has been unlocked`;
                    stats.floors[floor+1] = 0;

                    // Achievements
                    achievements[34].check(interaction, interaction.user, floor+1), achievements[35].check(interaction, interaction.user, floor+1), achievements[36].check(interaction, interaction.user, floor+1), achievements[37].check(interaction, interaction.user, floor+1), achievements[38].check(interaction, interaction.user, floor+1); // Challenger
                };

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
                    
                    // Weekend Buff
                    if (new Date().getDay() === 6 || new Date().getDay() === 0) boost *= 2;

                    // Guild Buff
                    if (guild) boost += (0.2*guild.xpbuff);

                    boost = Math.round(boost*100)/100;
                    let cxp = Math.floor(((floor < 100 ? floor : 100 + (floor/3)) + (Math.floor(Math.random() * 8))) * boost) + 12;
                    if (enemy.boss) cxp = Math.floor(cxp*1.5);
                    cxp = Math.floor(cxp*skipRounds);
                    cxpmsg = `Class XP: **${cxp}** (Boost: x${boost}${new Date().getDay() === 6 || new Date().getDay() === 0 ? " weekend" : ""})`;
                    if (myClass.id in stats.classlevels) stats.classlevels[myClass.id] += cxp;
                    else stats.classlevels[myClass.id] = cxp;
                };

                // Achievements
                if (floors[floor]?.boss) achievements[27].check(interaction, interaction.user, stats.floors[floor]), achievements[28].check(interaction, interaction.user, stats.floors[floor]), achievements[29].check(interaction, interaction.user, stats.floors[floor]); // Coming Back
                achievements[39].check(interaction, interaction.user, myStatsC.hp), achievements[40].check(interaction, interaction.user, myStatsC.hp), achievements[41].check(interaction, interaction.user, myStatsC.hp); // Under Pressure
                
                // Coins
                let loot = 0;
                if (dunLim[0] >= stats.limit) loot = 60 + Math.floor(Math.random()*30) + (floor < 100 ? floor*5 : 500 + (floor*2));
                if (guild?.lootbuff) loot *= 1+(0.2*guild.lootbuff);
                loot *= matchStats.lootm;
                loot += matchStats.loot;
                loot = Math.floor(loot * skipRounds);
                
                function shardCount(p, n) {
                    let shard = 0;
                    for (let si=0; si < n; si++) {
                        shard += Math.floor((1+(p*Math.ceil(floor/15)))*Math.random());
                    };
                    return shard;
                };
                
                // Crafting Ressources
                let craftItem;
                if (floor <= 20) craftItem = items[33];
                else if (floor <= 50) craftItem = items[34];
                else if (floor <= 90) craftItem = items[35];
                else if (floor <= 130) craftItem = items[36];
                else if (floor <= 180) craftItem = items[37];
                else if (floor <= 260) craftItem = items[38];
                else if (floor <= 300) craftItem = items[39];

                // Chests
                let chestRarities = [451, 452, 453, 454];
                if (floor > 200) chestRarities = [453, 454, 456, 457];
                else if (floor > 100) chestRarities = [452, 453, 454, 456];
                let chestDrops = [0,0,0,0];

                // Ascension Material
                let ascItem = items[enemy.loot[Math.floor(Math.random() * enemy.loot.length)]];
                
                let ssShards = 0, sShards = 0, aShards = 0, bShards = 0, cShards = 0, dShards = 0;
                let craftCount = 0;
                let ascCount = 0;

                // First loot cap
                if (dunLim[0] >= stats.limit) {
                    for (let i=0; i<skipRounds; i++) {
                        // Shards
                        ssShards += shardCount(0.01, 3);
                        sShards += shardCount(0.016, 5);
                        aShards += shardCount(0.026, 7);
                        bShards += shardCount(0.067, 9);
                        cShards += shardCount(0.098, 12);
                        dShards += shardCount(0.13, 15);
                        if (floors[floor]?.boss && stats.floors[floor] === 1) ssShards += 2, loot *= 2;

                        // Crafting Materials
                        craftCount += drops(0.4, 7);
                        
                        // Ascension Materials
                        ascCount += drops(0.6, 7);

                        // Chests
                        chestDrops[0] += drops(0.1);
                        chestDrops[1] += drops(0.05);
                        chestDrops[2] += drops(0.024);
                        chestDrops[3] += drops(0.01);
                    };
                } else
                // Second Loot Cap
                if (dunLim[2] >= stats.limit) {
                    for (let i=0; i<skipRounds; i++) {
                        // Crafting Ressources
                        craftCount += drops(0.07, 4);
                        
                        // Ascension Materials
                        ascCount += drops(0.1, 4);
                        
                        // Chests
                        chestDrops[0] += drops(0.04);
                        chestDrops[1] += drops(0.024);
                        chestDrops[2] += drops(0.012);
                        chestDrops[3] += drops(0.004);
                    };
                };
                
                // Levelup mats
                let levelupMats = {
                    "50": floor <= 100 ? drops(0.2, 4*skipRounds) : 0,
                    "51": floor <= 100 ? drops(0.2, 4*skipRounds) : 0,
                    "52": floor <= 100 ? drops(0.12, 2*skipRounds) : floor <= 200 ? drops(0.2, 4*skipRounds)  : 0,
                    "53": floor <= 100 ? drops(0.12, 2*skipRounds) : floor <= 200 ? drops(0.2, 4*skipRounds)  : 0,
                    "54": floor > 200 ? drops(0.2, 4*skipRounds) : floor > 100 ? drops(0.12, 2*skipRounds) : 0,
                    "55": floor > 200 ? drops(0.2, 4*skipRounds) : floor > 100 ? drops(0.12, 2*skipRounds) : 0,
                    "56": floor > 200 ? drops(0.12, 2*skipRounds) : 0,
                    "57": floor > 200 ? drops(0.12, 2*skipRounds) : 0,
                };
                
                let lootArr = [];
                if (ssShards) lootArr.push(`<:ss_shard:917203009543503892>x${ssShards}`);
                if (sShards) lootArr.push(`<:s_shard:917202925514817566>x${sShards}`);
                if (aShards) lootArr.push(`<:a_shard:917202904862052392>x${aShards}`);
                if (bShards) lootArr.push(`<:b_shard:917202862851899392>x${bShards}`);
                if (cShards) lootArr.push(`<:c_shard:917202862499582002>x${cShards}`);
                if (dShards) lootArr.push(`<:d_shard:917202840563363891>x${dShards}`);
                
                let myItems = await query(`SELECT items FROM users WHERE users.id = ${interaction.user.id}`);
                myItems = JSON.parse(myItems[0].items);

                if (craftCount) {
                    if (craftItem.id in myItems) myItems[craftItem.id] += craftCount;
                    else myItems[craftItem.id] = craftCount;
                };
                if (ascCount) {
                    if (ascItem.id in myItems) myItems[ascItem.id] += ascCount;
                    else myItems[ascItem.id] = ascCount;
                };
                Object.entries(levelupMats).forEach((e) => {
                    if (e[0] in myItems) myItems[e[0]] += e[1];
                    else myItems[e[0]] = e[1];
                });
                chestRarities.forEach((e, i) => {
                    if (chestDrops[i]) {
                        if (e in myItems) myItems[e]++;
                        else myItems[e] = 1;
                    };
                });

                await query(`UPDATE users SET coins = coins + ${loot}, items = '${JSON.stringify(myItems)}', ssshard = ssshard + ${ssShards}, sshard = sshard + ${sShards}, ashard = ashard + ${aShards}, bshard = bshard + ${bShards}, cshard = cshard + ${cShards}, dshard = dshard + ${dShards}${(!stats.tutorial.includes(9) && r === "w") ? `, tutorial = '${JSON.stringify([...stats.tutorial, 9])}'` : ""} WHERE id = ${interaction.user.id}`);
                await query(`UPDATE dungeon SET floors = '${JSON.stringify(stats.floors)}', classlevels = '${JSON.stringify(stats.classlevels)}' WHERE id = ${interaction.user.id}`);

                // Tutorial
                if (!stats.tutorial.includes(9)) {
                    const row = new MessageActionRow().addComponents(new MessageButton().setCustomId('continue').setLabel('Finish Tutorial!').setStyle('SUCCESS'));
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setTitle("Congratulations!")
                    .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                    .setDescription("You've defeated your first enemy <:RemWink:928370529742757960>\nIt seems you have obtained some valueable items <:Woah:928370799965003826> Here's what they're used for:\n\n<:coins:872926669055356939> **Coins**: The standard currency used in Camelot. It can be used in the `/shop`, to `/levelup` characters and more <:ClaraThumbsUp:1034899843505721514>\n<:ss_shard:917203009543503892> **Shards**: These are used to `/refine` your characters\n<:sublime_chest_open:1069287041843593266> **Chests**: Chests drop items of varying rarities.\n<:goblin_mask:1046080758466490398> **Ressources**: There are crafting <:iron:1033037750821212232>, levelup <:common_weapon_levelup_material:1047535549814165535> and ascension <:slime_concentrate:1046083943428001964> materials that can drop in the dungeon <:wow:1020442064409874462>\n\nAdditionally, you'll gain experience with your class which can be upgraded once you reach level **40**. The deeper you enter the dungeon the better the rewards you'll get!")
                    if (r === "l") Embed.setTitle("Seems it's quite challenging").setDescription("But let's try again!");
                    setTimeout(() => {
                        interaction.channel.send({ embeds: [Embed], components: [row], fetchReply: true }).then((msg) => {
                            const collector = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "continue", componentType: 'BUTTON', time: 180000 });
                            collector.on('collect', async r => {
                                const Embed = new MessageEmbed()
                                .setColor(0xbbffff)
                                .setTitle("Seems you are ready to set out now!")
                                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                                .setDescription("There is nothing more I can teach you, for you have mastered all that I know and more. Now it is time for you to go out on your own journey. To follow your own path, and create your own tales!\n\nMay the spirits guard your path. Until we meet again <:MashaWave:928370055354400799>")
                                msg.edit({ embeds: [Embed], components: []});
                                
                                // Finish Tutorial
                                await query(`UPDATE users SET tutorial = '${JSON.stringify([...stats.tutorial, 9])}' WHERE id = ${interaction.user.id}`);
                                
                                // Achievements
                                achievements[51].check(interaction); // A New Adventure
                            });
                        });
                    }, 1200);
                } else {
                    // Achievements
                    achievements[51].check(interaction); // A New Adventure
                };

                // Daily Quests
                dailies[2].update(interaction); // Increasing Danger

                Embed.setDescription(`<:stars_v2:917023655840591963> **${myChar.name}** won! <:stars_v2:917023655840591963>\n${unlocked}\n<a:arrow_orange:916716747623641210> Runs left: **${stats.limit < dunLim[0] ? dunLim[0] - stats.limit : 0}** loot **${stats.limit < dunLim[1] ? dunLim[1] - stats.limit : 0}** progress\n<a:arrow_yellow:916716780045619200> ${cxpmsg}\n\n<:npbag:929428030554787892> Loot\n${loot ? `${loot}<:coins:872926669055356939>, ` : ""}${chestRarities.reduce((total, e, i) => total += chestDrops[i] ? `${items[e].emoji}x1, ` : "", "")}${craftCount ? `${craftItem.emoji}x${craftCount}, ` : ""}${ascCount ? `${ascItem.emoji}x${ascCount}, ` : ""}${Object.entries(levelupMats).filter((e) => e[1]).map((e) => `${items[e[0]].emoji}x${e[1]}, `).join("")}\n${lootArr.join(", ")}`);
                Embed.setFooter(`Balance: ${stats.coins+loot} coins`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048");
                return Embed;
            };

            let matchStats = Avalon.getMatchStats(interaction);
            let notice = ["", "", "", ""];

            // Apply passives
            if (skill && myChar.id !== 4767) skill._passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user, interaction.commandName);
            if (myAbility?.passive && myChar.id !== 4767) myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user);
            if (myStats.weapon !== -1) items[myStats.weapon]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user);
            if (myStats.shieldid) items[myStats.shieldid]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user);
            if (myStats.helmet && items?.[myStats.helmet].setname === items?.[myStats.cuirass]?.setname && items?.[myStats.helmet].setname === items?.[myStats.gloves]?.setname && items?.[myStats.helmet].setname === items?.[myStats.boots]?.setname) items[myStats.boots]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed(), interaction.user);


            const ATK_EMOJI = myStatsC.replaceButton?.atk?.emoji || '⚔️', 
                DEF_EMOJI = myStatsC.replaceButton?.def?.emoji || '🛡️',
                ABILITY_EMOJI = myStatsC.replaceButton?.ability?.emoji || '✨',
                SKILL_EMOJI = myStatsC.replaceButton?.skill?.emoji || '⚜️',
                SKIP_EMOJI = myStatsC.replaceButton?.skip?.emoji || '⏩';

            const row = new MessageActionRow()
            .addComponents(
                new MessageButton().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle('SECONDARY'),
                new MessageButton().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle('SECONDARY'),
                new MessageButton().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle('SECONDARY').setDisabled(myAbility ? false : true),
                new MessageButton().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle('SECONDARY').setDisabled(myStats.class !== -1 ? false : true),
                new MessageButton().setCustomId('SKIP').setEmoji(SKIP_EMOJI).setStyle('SECONDARY').setDisabled(dunLim[0] - stats.limit >= 0 ? false : true),
            );
            
            if (flag === "skip" || flag === "all") {
                while (eStatsC.hp > 0 && myStatsC.hp > 0) {
                    if (Math.random() > 0.02 + (0.1*(eStatsC.ep/myStatsC.ep))) eStatsC.hp -= Math.floor((myStatsC.atk * Math.pow(0.99895, eStatsC.def)) * (1 - (0.2*Math.random())));
                    if (eStatsC.hp < 0) eStatsC.hp = 0;
                    if (eStatsC.hp > 0) myStatsC.hp -= Math.floor((eStatsC.atk * Math.pow(0.99895, myStatsC.def)) * (1 - (0.2*Math.random())));
                    if (myStatsC.hp < 0) myStatsC.hp = 0;

                    // Break if it takes too long
                    if (matchStats.round++ > 1000) myStatsC.hp = 0;
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
                    .setTitle(`Dungeon Floor ${(floor-1)%100 +1} ${enemy.boss ? "(Boss)" : ""}`)
                    .setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}\\💖${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp/eStats.hp, eStatsC.sm/eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStats.hp}\\💖${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp/myStatsC.maxhp, myStatsC.sm/myStatsC.mana)}\n${Avalon.padStats(myStatsC)}`)
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
                        
                        let timeout;
                        async function editEmbed() {
                            Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp/eStatsC.maxhp, eStatsC.sm/eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp/myStatsC.maxhp, myStatsC.sm/myStatsC.mana)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-4).join("")}`);
                            Embed.setFooter(`Enemy EP: ${eStatsC.ep} | time left: ${120+Math.floor((timestart-new Date().getTime())/1000)}s`);
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

                            // Consume Mana
                            Avalon.consumeActiveMana(matchStats, myStatsC, buffs, myChar, notice, Embed, thumbnail);
                            
                            // Reset Buffs
                            if (matchStats.currentCharacter === 0) myStatsC.atk = myStats.atk, myStatsC.md = myStats.md, myStatsC.def = myStats.def, myStatsC.mr = myStats.mr, myStatsC.cd = myStats.cd, myStatsC.cr = myStats.cr, myStatsC.dodge = myStats.dodge, myStatsC.br = myStats.br, myStatsC.mg = myStats.mg;
                            if (matchStats.currentOpponent === 0) eStatsC.atk = eStats.atk, eStatsC.md = eStats.md, eStatsC.def = eStats.def, eStatsC.mr = eStats.mr, eStatsC.cd = eStats.cd, eStatsC.cr = eStats.cr, eStatsC.dodge = eStats.dodge, eStatsC.br = eStats.br, eStatsC.mg = eStats.mg;

                            // Apply Buffy
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
                                    dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, {magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, critbleed: true});
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
    
                                    if (matchStats.twinshot > Math.random()) setTimeout(() => {
                                        dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, {magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, critbleed: true});
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
    
                        skip.on('collect', async r => {
                            if (matchStats.turn == 1) {
                                notice.push(`\n⏩ Skipping to results...`);
                                editEmbed();
                                matchStats.turn = 0;
                                while (eStatsC.hp > 0 && myStatsC.hp > 0) {
                                    if (Math.random() > 0.02 + (0.1*(eStatsC.ep/myStatsC.ep))) eStatsC.hp -= Math.floor((myStatsC.atk * Math.pow(0.99895, eStatsC.def)) * (1 - (0.2*Math.random())));
                                    if (eStatsC.hp < 0) eStatsC.hp = 0;
                                    if (eStatsC.hp > 0) myStatsC.hp -= Math.floor((eStatsC.atk * Math.pow(0.99895, myStatsC.def)) * (1 - (0.2*Math.random())));
                                    if (myStatsC.hp < 0) myStatsC.hp = 0;

                                    // Break if it takes too long
                                    if (matchStats.round++ > 1000) myStatsC.hp = 0;
                                };
                                setTimeout(() => {
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                }, aDelay);
                            } else {
                                matchStats.turn = 1;
                                interaction.channel.send("Please wait a moment").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
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