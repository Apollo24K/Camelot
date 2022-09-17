const { MessageEmbed } = require("discord.js");
const { characters, charactersSS, charactersS, charactersA, charactersB, charactersC, charactersD, auniq } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");
const { displayPull } = require("../Modules/functions.js");
const { achievements } = require("../Modules/achievements.js");

module.exports = {
	name: 'pull',
	description: 'the pull command',
	execute(interaction) {

        let add_xp = 0;

        db.serialize(async () => {
            var stats = await query(`SELECT rowid, lastvote, pullcount, pullstotal, lastss, lasts, premium FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];

            var inv = await query(`SELECT chars, ref FROM characters WHERE id = ${interaction.user.id}`);
            inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref)};
            
            // Check if vote
            let canVote = `\nYou can **/vote** now! To reset your pull counter (use \`/rp\` after the vote)`;
            if (stats.lastvote && ((new Date().getTime() - stats.lastvote) < 12*60*60*1000)) canVote = "";
            
            let pullLimit = 6;
            let sPit = 80;
            let ssPit = 210;
            
            // Premium bonus
            switch (stats.premium) {
                case 0: false; break;
                case 1: pullLimit += 2; sPit = 70; ssPit = 180; break;
                case 2: pullLimit += 3; sPit = 65; ssPit = 170; break;
                case 3: pullLimit += 4; sPit = 60; ssPit = 160; break;
                case 4: pullLimit += 4; sPit = 60; ssPit = 160; break;
                case 5: pullLimit += 4; sPit = 50; ssPit = 150; break;
                case 6: pullLimit += 6; sPit = 50; ssPit = 150; break;
                case 7: pullLimit += 8; sPit = 50; ssPit = 150; break;
                default : false; break;
            };
        
            if (stats.pullcount >= pullLimit) {
                let time = new Date();
                let nextPull = time.getHours() % 2 === 0 ? Math.ceil(time/3600000)*3600000 + 3600000 : Math.ceil(time/3600000)*3600000;
                let timeLeft = nextPull - time;
                if (timeLeft > 7200000 - 60000) return interaction.reply(`You've reached your pull limit, please wait **2**h` + canVote);
                return interaction.reply(`You've reached your pull limit, please wait ${timeLeft > 3600000 ? "**1**h " : ""}**${timeLeft > 3600000 ? Math.ceil((timeLeft - 3600000)/60000) : Math.ceil((timeLeft)/60000)}** min` + canVote);
            };
            
            let ranRar = Math.floor(Math.random() * 1000); // 0-999
            
            // Pull all
            if (interaction.options.getString('premium')) {
                if (stats.premium < 3) return interaction.reply("This is a `/premium` feature. If you like the bot and want to help us out we'd appreciate your support <:RaphiSmile:868998036645380197>");
                let left = pullLimit - stats.pullcount;
                let rarStats = {"SS":0,"S":0,"A":0,"B":0,"C":0,"D":0};
                let thumbnail = "";
                let topCharSS = [];
                let topCharS = [];
                for (i=0; i < left; i++) {
                    ranRar = Math.floor(Math.random() * 1000); // 0-999
        
                    if (ranRar > 2) stats.lastss++;
                    if (ranRar > 20) stats.lasts++;
        
                    if (stats.lasts >= sPit && stats.lastss >= ssPit) { ranRar = 1; stats.lasts--; stats.lastss = 0 };
                    if (stats.lasts >= sPit) { ranRar = 10; stats.lasts = 0 };
                    if (stats.lastss >= ssPit) { ranRar = 1; stats.lastss = 0 };        
                    
                    let fChars;
                    if (ranRar > 441) fChars = charactersD, rarStats["D"]++;
                    else if (ranRar > 188) fChars = charactersC, rarStats["C"]++;
                    else if (ranRar > 62) fChars = charactersB, rarStats["B"]++;
                    else if (ranRar > 20) fChars = charactersA, rarStats["A"]++;
                    else if (ranRar > 2) fChars = charactersS, rarStats["S"]++, stats.lasts = 0;
                    else fChars = charactersSS, rarStats["SS"]++, stats.lastss = 0;
        
                    let num = Math.floor(Math.random() * fChars.length);
                    inv.chars.push(fChars[num].id);
                    if (!inv.ref[fChars[num].id]) inv.ref[fChars[num].id] = 0;
                    inv.ref[fChars[num].id]++;
                    if (ranRar < 3) topCharSS.push(`<:SSTier:869316489931546644> **${fChars[num].name}**`), thumbnail = fChars[num].image;
                    else if (ranRar < 21) topCharS.push(`<:STier:869316518675095552> **${fChars[num].name}**`), thumbnail.length < 1 ? thumbnail = fChars[num].image : false;
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
            } else {
                stats.pullcount++;
        
                stats.pullstotal++;
                if (ranRar > 2) stats.lastss++;
                if (ranRar > 20) stats.lasts++;
        
                if (stats.lasts >= sPit && stats.lastss >= ssPit) { ranRar = 1; stats.lasts--; stats.lastss = 0 };
                if (stats.lasts >= sPit) { ranRar = 10; stats.lasts = 0 };
                if (stats.lastss >= ssPit) { ranRar = 1; stats.lastss = 0 };
        
                const ranXp = Math.ceil(Math.random() * 10); // 1-10
                add_xp += ranXp;
                if (ranRar < 21 && ranRar > 2) add_xp += ranXp;
                if (ranRar < 3) add_xp += 20;
        
                let rar = "D";
                if (ranRar < 3) rar = "SS", stats.lastss = 0;
                else if (ranRar < 21) rar = "S", stats.lasts = 0;
                else if (ranRar < 63) rar = "A";
                else if (ranRar < 189) rar = "B";
                else if (ranRar < 442) rar = "C";
        
                let fChars = characters.filter((e) => e.rarity === rar);
                let num = Math.floor(Math.random() * fChars.length);
                inv.chars.push(fChars[num].id);
                if (!inv.ref[fChars[num].id]) inv.ref[fChars[num].id] = 0;
                inv.ref[fChars[num].id]++;
                interaction.reply(displayPull(interaction.user, fChars[num], pullLimit, inv.chars.filter((e) => e === fChars[num].id).length, stats.pullcount, stats.lastvote, inv.ref[fChars[num].id]));
            };


            await query(`UPDATE users SET pullcount = ${stats.pullcount}, pullstotal = ${stats.pullstotal}, lastss = ${stats.lastss}, lasts = ${stats.lasts}, xp = xp + ${add_xp} WHERE id = ${interaction.user.id}`);
            await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}', ref = '${JSON.stringify(inv.ref)}' WHERE id = ${interaction.user.id}`);

            // Achievements
            achievements[0].check(interaction); // First Character
            achievements[1].check(interaction), achievements[2].check(interaction), achievements[3].check(interaction); // Collector
            achievements[4].check(interaction, interaction.user, ranRar), achievements[5].check(interaction, interaction.user, ranRar); // Something Rare
            achievements[15].check(interaction), achievements[16].check(interaction), achievements[17].check(interaction), achievements[18].check(interaction); // Rising
            achievements[19].check(interaction, interaction.user, characters, auniq), achievements[20].check(interaction, interaction.user, characters, auniq), achievements[21].check(interaction, interaction.user, characters, auniq), achievements[22].check(interaction, interaction.user, characters, auniq), achievements[23].check(interaction, interaction.user, characters, auniq); // Diligent
            
        });
        


    },
};