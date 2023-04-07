/* eslint-disable no-extra-semi */
const { MessageEmbed } = require("discord.js");
const { characters, charactersSS, charactersS, charactersA, charactersB, charactersC, charactersD, auniq } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");
const { displayPull, pullsToResetList, userLevel } = require("../Modules/functions.js");
const { achievements } = require("../Modules/achievements.js");
const { dailies } = require("../Modules/dailyQuests.js");

db.serialize(async () => {
    const checkTimers = await query(`SELECT id, lastpull, pullcount, premium FROM users`);
    checkTimers.forEach( async (e) => {
        if (e.lastpull) {
            let pullTimer = 45*60*1000;
            switch (e.premium) {
                case 0: false; break;
                case 1: pullTimer = 40*60*1000; break;
                case 2: pullTimer = 40*60*1000; break;
                case 3: pullTimer = 40*60*1000; break;
                case 4: pullTimer = 35*60*1000; break;
                case 5: pullTimer = 30*60*1000; break;
                case 6: pullTimer = 30*60*1000; break;
                case 7: pullTimer = 30*60*1000; break;
                default : false; break;
            };
            if (new Date().getTime() - e.lastpull > pullTimer) {
                await query(`UPDATE users SET pullcount = 0 WHERE id = ${e.id}`);
            } else {
                pullsToResetList.add(e.id);
                setTimeout(() => { db.serialize(async () => {
                    await query(`UPDATE users SET pullcount = 0 WHERE id = ${e.id}`);
                    pullsToResetList.delete(e.id);
                })}, Math.abs(pullTimer + e.lastpull - new Date().getTime()));
            };
        };
    });
});

module.exports = {
	name: 'pull',
	description: 'the pull command',
	execute(interaction) {

        db.serialize(async () => {
            let stats = await query(`SELECT rowid, xp, guild, lastvote, lastpull, pullcount, pullstotal, pullreminder, lastss, lasts, premium FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];

            const { 0: guild } = await query(`SELECT * FROM guilds WHERE id = '${stats.guild}'`);

            // Some vars
            let pullLimit = 5;
            let sPit = 120;
            let ssPit = 300;
            let pullTimer = 45*60*1000;
            let add_xp = 0;
            let user_level = userLevel(stats.xp);
            
            // Premium bonus
            switch (stats.premium) {
                case 0: false; break;
                case 1: pullLimit += 1; sPit = 100; ssPit = 260; pullTimer = 40*60*1000; break;
                case 2: pullLimit += 2; sPit = 90; ssPit = 240; pullTimer = 40*60*1000; break;
                case 3: pullLimit += 3; sPit = 85; ssPit = 230; pullTimer = 40*60*1000; break;
                case 4: pullLimit += 3; sPit = 80; ssPit = 225; pullTimer = 35*60*1000; break;
                case 5: pullLimit += 3; sPit = 75; ssPit = 220; pullTimer = 30*60*1000; break;
                case 6: pullLimit += 4; sPit = 70; ssPit = 210; pullTimer = 30*60*1000; break;
                case 7: pullLimit += 5; sPit = 60; ssPit = 200; pullTimer = 30*60*1000; break;
                default : false; break;
            };
            if (guild) pullTimer -= (60*1000*guild.cdreduction);

            // Check if vote
            let canVote = `\nYou can **/vote** now! To reset your pull counter (use \`/rp\` after the vote)`;
            if (stats.lastvote && ((new Date().getTime() - stats.lastvote) < 12*60*60*1000)) canVote = "";

            // Setup pull reset
            if (stats.pullcount === 0 && !pullsToResetList.has(interaction.user.id)) {
                pullsToResetList.add(interaction.user.id);
                setTimeout(() => { db.serialize(async () => {
                    await query(`UPDATE users SET pullcount = 0 WHERE id = ${interaction.user.id}`);
                    pullsToResetList.delete(interaction.user.id);
                     if (stats.pullreminder) interaction.channel.send(`${interaction.user.toString()} is off cooldown!`);
                })}, pullTimer);
            };

            // Check if limit reached
            if (stats.pullcount >= pullLimit) return interaction.reply(`You've reached your pull limit, please wait **${Math.ceil((pullTimer + stats.lastpull - new Date().getTime())/(60*1000))}** min${canVote}`);

            let inv = await query(`SELECT chars, ref FROM characters WHERE id = ${interaction.user.id}`);
            inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref)};
            
            let ranRar = Math.floor(Math.random() * 1000); // 0-999
            let rar = "D";
            let droprates;
            if (user_level < 10) droprates = {"SS": 1, "S": 4, "A": 34, "B": 130, "C": 388, "D": 1000}; // {"SS": 1, "S": 4, "A": 29, "B": 96, "C": 258, "D": 612}
            else if (user_level < 20) droprates = {"SS": 1, "S": 9, "A": 42, "B": 142, "C": 394, "D": 1000}; // {"SS": 1, "S": 8, "A": 33, "B": 100, "C": 252, "D": 606}
            else droprates = {"SS": 2, "S": 14, "A": 52, "B": 156, "C": 404, "D": 1000}; // {"SS": 2, "S": 12, "A": 38, "B": 104, "C": 248, "D": 596}
            
            // Pull all
            if (interaction.options.getString('premium')) {
                if (stats.premium < 3) return interaction.reply("This is a `/premium` feature. If you like the bot and want to help us out we'd appreciate your support <:RaphiSmile:868998036645380197>");
                let left = pullLimit - stats.pullcount;
                let rarStats = {"SS":0,"S":0,"A":0,"B":0,"C":0,"D":0};
                let thumbnail = "";
                let topCharSS = [];
                let topCharS = [];
                for (let i=0; i < left; i++) {
                    ranRar = Math.floor(Math.random() * 1000); // 0-999
        
                    if (ranRar >= droprates["SS"]) stats.lastss++;
                    if (ranRar >= droprates["S"]) stats.lasts++;
        
                    if (stats.lasts >= sPit && stats.lastss >= ssPit) { ranRar = 0; stats.lasts--; stats.lastss = 0 };
                    if (stats.lasts >= sPit) { ranRar = 3; stats.lasts = 0 };
                    if (stats.lastss >= ssPit) { ranRar = 0; stats.lastss = 0 };        
                    
                    let fChars;
                    if (ranRar < droprates["SS"]) fChars = charactersSS, rarStats["SS"]++, stats.lastss = 0;
                    else if (ranRar < droprates["S"]) fChars = charactersS, rarStats["S"]++, stats.lasts = 0;
                    else if (ranRar < droprates["A"]) fChars = charactersA, rarStats["A"]++;
                    else if (ranRar < droprates["B"]) fChars = charactersB, rarStats["B"]++;
                    else if (ranRar < droprates["C"]) fChars = charactersC, rarStats["C"]++;
                    else fChars = charactersD, rarStats["D"]++;
        
                    let num = Math.floor(Math.random() * fChars.length);
                    inv.chars.push(fChars[num].id);
                    if (!inv.ref[fChars[num].id]) inv.ref[fChars[num].id] = 0;
                    inv.ref[fChars[num].id]++;
                    if (ranRar < droprates["SS"]) topCharSS.push(`<:SSTier:869316489931546644> **${fChars[num].name}**`), thumbnail = fChars[num].image;
                    else if (ranRar < droprates["S"]) topCharS.push(`<:STier:869316518675095552> **${fChars[num].name}**`), thumbnail.length < 1 ? thumbnail = fChars[num].image : false;
                };
                stats.pullcount = pullLimit;
                stats.pullstotal += left;
                add_xp += 5*left;
        
                if (!thumbnail.length) thumbnail = characters[inv.chars[inv.chars.length-1]].image;
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setThumbnail(thumbnail)
                .setTitle(`Pulled ${left} ${left === 1 ? "character" : "characters"}`)
                .addFields(
                    { name: 'Rarity', value: `<:SSTier:869316489931546644> **Tier**: ${rarStats["SS"]}\n<:ATier:869316558013464627> **Tier**: ${rarStats["A"]}\n<:CTier:869316602858991657> **Tier**: ${rarStats["C"]}`, inline: true },
                    { name: '_ _', value: `<:STier:869316518675095552> **Tier**: ${rarStats["S"]}\n<:BTier:869316586803179571> **Tier**: ${rarStats["B"]}\n<:DTier:869316616071032843> **Tier**: ${rarStats["D"]}`, inline: true },
                )
                if (topCharSS.concat(topCharS).length) Embed.setDescription(`Top Characters:\n${topCharSS.concat(topCharS).join("\n")}`)
                interaction.reply({ embeds: [Embed] });

                // Daily Quests
                dailies[0].update(interaction, left);
            } else {
                stats.pullcount++;
        
                stats.pullstotal++;
                if (ranRar >= droprates["SS"]) stats.lastss++;
                if (ranRar >= droprates["S"]) stats.lasts++;
        
                if (stats.lasts >= sPit && stats.lastss >= ssPit) { ranRar = 0; stats.lasts--; stats.lastss = 0 };
                if (stats.lasts >= sPit) { ranRar = 3; stats.lasts = 0 };
                if (stats.lastss >= ssPit) { ranRar = 0; stats.lastss = 0 };
        
                const ranXp = Math.ceil(Math.random() * 10); // 1-10
                add_xp += ranXp;
                if (ranRar < droprates["S"] && ranRar >= droprates["SS"]) add_xp += ranXp;
                else if (ranRar < droprates["SS"]) add_xp += 20;
        
                if (ranRar < droprates["SS"]) rar = "SS", stats.lastss = 0;
                else if (ranRar < droprates["S"]) rar = "S", stats.lasts = 0;
                else if (ranRar < droprates["A"]) rar = "A";
                else if (ranRar < droprates["B"]) rar = "B";
                else if (ranRar < droprates["C"]) rar = "C";
        
                let fChars = characters.filter((e) => e.rarity === rar);
                let num = Math.floor(Math.random() * fChars.length);
                inv.chars.push(fChars[num].id);
                if (!inv.ref[fChars[num].id]) inv.ref[fChars[num].id] = 0;
                inv.ref[fChars[num].id]++;
                interaction.reply(displayPull(interaction.user, fChars[num], pullLimit, inv.chars.filter((e) => e === fChars[num].id).length, stats.pullcount, stats.lastvote, inv.ref[fChars[num].id]));

                // Daily Quests
                dailies[0].update(interaction);
            };

            await query(`UPDATE users SET pullcount = ${stats.pullcount}, lastpull = ${new Date().getTime()}, pullstotal = ${stats.pullstotal}, lastss = ${stats.lastss}, lasts = ${stats.lasts}, xp = xp + ${add_xp} WHERE id = ${interaction.user.id}`);
            await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}', ref = '${JSON.stringify(inv.ref)}' WHERE id = ${interaction.user.id}`);

            // Achievements
            achievements[0].check(interaction); // First Character
            achievements[1].check(interaction), achievements[2].check(interaction), achievements[3].check(interaction); // Collector
            achievements[4].check(interaction, interaction.user, rar), achievements[5].check(interaction, interaction.user, rar); // Something Rare
            achievements[15].check(interaction), achievements[16].check(interaction), achievements[17].check(interaction), achievements[18].check(interaction); // Rising
            achievements[19].check(interaction, interaction.user, characters, auniq), achievements[20].check(interaction, interaction.user, characters, auniq), achievements[21].check(interaction, interaction.user, characters, auniq), achievements[22].check(interaction, interaction.user, characters, auniq), achievements[23].check(interaction, interaction.user, characters, auniq); // Diligent
            
        });
        
    },
};