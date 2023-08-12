const fs = require('fs');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");
const { classLevelToXP } = require("../Modules/functions.js");
const math = require('mathjs');

const voice = require('@discordjs/voice');

module.exports = {
    name: 'admin',
	description: 'take admin actions',
	execute(interaction, client) {

        let user = interaction.options.getUser('user') || false;
        let action = interaction.options.getString('action');
        const isEphemeral = interaction.options.getString('ephemeral') === "false" ? false : true;

        let args = action.trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();
        
        // Return if not owner
        if (interaction.user.id !== "489490486734880774") {
            return interaction.reply({content: "You're not allowed to use this command", ephemeral: isEphemeral});
        };

        // List all actions
        if (action === "list") {
            return interaction.reply({content: ">>> `list`\n`reset pulls`\n`reset daily`\n`reset weekly`\n`reset dungeon`\n`guilds`\n`add premium <int>`\n`add vote`\n`set <key> <value>`\n`did`", ephemeral: isEphemeral});
        };
        
        // Reset Pulls
        if (action === "reset pulls") {
            db.serialize(async () => {
                await query(`UPDATE users SET pullcount = 0`);
            });
            return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
        };

        // Reset Dailies
        if (action === "reset daily") {
            db.serialize(async () => {
                await query(`UPDATE users SET dailyclaimed = 0`);
            });
            return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
        };

        // Reset Weeklies
        if (action === "reset weekly") {
            db.serialize(async () => {
                await query(`UPDATE users SET weeklyclaimed = 0`);
            });
            return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
        };

        // Reset Dungeon
        if (action === "reset dungeon") {
            db.serialize(async () => {
                await query(`UPDATE dungeon SET 'limit' = 0`);
            });
            return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
        };

        // List Guilds
        if (action === "guilds") {
            let guildArr = [];
            let membersTotal = 0;
            client.guilds.cache.each(guild => {
                guildArr.push(guild.name + " | " + guild.id + " | " + guild.memberCount + " Members");
                membersTotal += guild.memberCount;
            });
            guildArr.sort((a, b) => b.match(/\d+(?=\D*$)/)[0] - a.match(/\d+(?=\D*$)/)[0]);
            
            let pagesTotal = Math.ceil(guildArr.length / 15);
            let currPage = 1;
            let left = guildArr.length % 15;

            let showAnime = [];
            if (currPage < pagesTotal || left === 0) {
                for (let i=(currPage-1)*15; i < currPage * 15; i++) {
                    showAnime.push(`‧ ${guildArr[i]}`);
                };
            } else {
                for (let i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                    showAnime.push(`‧ ${guildArr[i]}`);
                };
            };

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setEmoji('⏪')
                        .setStyle('Secondary'),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setEmoji('⏩')
                        .setStyle('Secondary'),
                );

            const Embed = new EmbedBuilder()
            .setTitle(`Guilds Total (${guildArr.length} | ${membersTotal})`)
            .setColor(0xbbffff)
            .setThumbnail("https://i.imgur.com/WWM4K98.png")
            .setDescription(showAnime.join("\n"))
            return interaction.reply({ embeds: [Embed], components: [row], fetchReply: true, ephemeral: isEphemeral }).then((msg) => {
                const collector = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    let showAnime = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (let i=(currPage-1)*15; i < currPage * 15; i++) {
                            showAnime.push(`‧ ${guildArr[i]}`);
                        };
                    } else {
                        for (let i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            showAnime.push(`‧ ${guildArr[i]}`);
                        };
                    };

                    Embed.setDescription(showAnime.join("\n")).setFooter({text: `Page ${currPage}/${pagesTotal}`});
                    interaction.editReply({ embeds: [Embed] });
                });

            });

        };

        // Add premium
        if (action.startsWith("add premium")) {
            db.serialize(async () => {
                await query(`UPDATE users SET premium = ${action.split(" ")[2]} WHERE id = ${user.id}`);
            });
            return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
        };

        // Add vote
        if (action === "add vote") {
            if (!user) return interaction.reply({content: "missing user object", ephemeral: isEphemeral});
            db.serialize(async () => {
                await query(`UPDATE users SET pullresets = pullresets + 1, votestotal = votestotal + 1, lootbox = lootbox + 1, lastvote = ${new Date().getTime()} WHERE id = ${user.id}`);
            });
            return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
        };

        // Set db
        if (action.startsWith("set")) {
            let table = "users";
            if (action.includes("--")) {
                table = action.split("--")[1];
                action = action.split("--")[0];
            };
            db.serialize(async () => {
                await query(`UPDATE ${table} SET ${action.split(" ")[1].toLowerCase()} = ${action.split(" ")[2]}${user ? ` WHERE id = ${user.id}` : ""}`);
            });
            return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
        };

        // Add vote
        if (action === "did") {
            let names = characters.map((e) => e.name).sort();
            let len = names.length-1, res = "";
            while (len--) if (names[len-1] === names[len]) res += names[len--] + "\n";
            return interaction.reply({content: res ? `Yes, he did!\n\n${res}` : "All's fine!", ephemeral: isEphemeral});
        };

        // Add premium
        if (action.startsWith("add char")) {
            if (!user) return interaction.reply({content: "missing user object", ephemeral: isEphemeral});
            db.serialize(async () => {
                let inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
                inv = JSON.parse(inv[0].chars);
                inv.push(parseInt(action.split(" ")[2]));
                await query(`UPDATE characters SET chars = '${JSON.stringify(inv)}' WHERE id = ${user.id}`);
            });
            return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
        };

        // Leave Server
        if (action.startsWith("leave server")) {
            let guild = client.guilds.cache.get(action.split(" ")[2]);
            if (!guild) return interaction.reply({content: `Couldn't find guild ${action.split(" ")[2]}`, ephemeral: isEphemeral});
            guild.leave();
            return interaction.reply({content: `Left ${guild.name}`, ephemeral: isEphemeral});
        };

        // Play
        if (cmd === "play") {
            const connection = voice.joinVoiceChannel({
                channelId: "1055162421335035984",
                guildId: "927257132624130119",
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });
            const audioplayer = voice.createAudioPlayer();
            connection.subscribe(audioplayer);

            let song;
            switch(args[0]) {
                case "snow": song = "white_white_snow"; break;
                default: song = args[0]; break;
            };

            const resource = voice.createAudioResource(fs.createReadStream(`./Audio/${song}.opus`), {
                inlineVolume : true
            });
            audioplayer.play(resource);
            console.log("Voice connection has been successful!");
    
            connection.on('stateChange', (oldState, newState) => {
                console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
            });
            audioplayer.on('stateChange', (oldState, newState) => {
                console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
                if (newState.status === "idle") {
                    audioplayer.play(voice.createAudioResource(fs.createReadStream(`./Audio/${song}.opus`), {inlineVolume : true}));
                };
            });
            return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
        };

        // Stop
        if (cmd === "stop") {
            const connection = voice.getVoiceConnection("927257132624130119");
            if(connection) {
                connection.destroy()
                console.log('Disconnected from voice!');
            };
            return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
        };

        // Mail
        if (cmd === "mail" || cmd === "mailbox" || cmd === "gift") {
            args = args.join(" ").split("-BR-");
            if (!args[0] || !args[1] || !args[2]) return interaction.reply({content: "Sending Gifts\n> `/admin gift <type>-BR-<rewards>-BR-<message>`\n> `/admin cmd args[0] args[1] args.slice(2)`\n\nTypes:\n> 1 = xp\n> 2 = coins\n> 3 = ss shard|s shard|a shard|b shard|c shard|d shard\n> 4 = ss ticket|s ticket|a ticket|b ticket|c ticket|d ticket\n> 5 = lb\n> 6 = char\n> 7 = skin\n> 8 = item\n> 9 = gems\n\nExamples:\n> `/admin gift 1,2,8-BR-xp|50,coins|500,item|458|3-BR-Thank you for playing!`", ephemeral: isEphemeral});

            const mail = {"type": args[0], "rewards": args[1], "message": args.slice(2), "date": new Date().getTime()};

            db.serialize(async () => {
                let mailboxes = await query(`SELECT id, mailbox FROM users${user ? ` WHERE id = ${user.id}` : ""}`);

                for (let i=0; i< mailboxes.length; i++) {
                    let mailbox = JSON.parse(mailboxes[i].mailbox);
                    mailbox.push(mail);
                    await query(`UPDATE users SET mailbox = '${JSON.stringify(mailbox)}' WHERE id = ${mailboxes[i].id}`);
                };
                return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
            });
        };

        // Mail
        if (cmd === "giftguild") {
            const guildid = args.shift();
            args = args.join(" ").split("-BR-");
            if (!args[0] || !args[1] || !args[2]) return interaction.reply({content: "Sending Gifts\n> `/admin giftguild <guild_id> <type>-BR-<rewards>-BR-<message>`\n> `/admin cmd args[0] args[1] args[2] args.slice(3)`\n\nTypes:\n> 1 = xp\n> 2 = coins\n> 3 = ss shard|s shard|a shard|b shard|c shard|d shard\n> 4 = ss ticket|s ticket|a ticket|b ticket|c ticket|d ticket\n> 5 = lb\n> 6 = char\n> 7 = skin\n> 8 = item\n> 9 = gems\n\nExamples:\n> `/admin giftguild 12wG2 1,2,8-BR-xp|50,coins|500,item|458|3-BR-Thank you for playing!`", ephemeral: isEphemeral});

            
            const mail = {"type": args[0], "rewards": args[1], "message": args.slice(2), "date": new Date().getTime()};
            
            db.serialize(async () => {
                const { 0: guild } = await query(`SELECT * FROM guilds WHERE id = '${guildid}'`);
                if (!guild) return interaction.reply({content: `Couldn't find guild \`${guildid}\``, ephemeral: isEphemeral});

                let mailboxes = await query(`SELECT id, mailbox FROM users WHERE id IN (${guild.members})`);

                for (let i=0; i< mailboxes.length; i++) {
                    let mailbox = JSON.parse(mailboxes[i].mailbox);
                    mailbox.push(mail);
                    await query(`UPDATE users SET mailbox = '${JSON.stringify(mailbox)}' WHERE id = ${mailboxes[i].id}`);
                };
                return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
            });
        };

        // Set Class Level
        if (cmd === "clvl") {
            if (!args[0]) return interaction.reply({content: `format: \`/admin clvl <cid> <level>\``, ephemeral: isEphemeral});

            db.serialize(async () => {
                const { 0: stats } = await query(`SELECT classlevels FROM dungeon WHERE id = ${user.id}`);
                stats.classlevels = JSON.parse(stats.classlevels);

                if (!(args[0] in stats.classlevels)) return interaction.reply({content: `${user.username} doesn't have class ${args[0]}`, ephemeral: isEphemeral});

                stats.classlevels[args[0]] = classLevelToXP(parseInt(args[1]));

                await query(`UPDATE dungeon SET classlevels = '${JSON.stringify(stats.classlevels)}' WHERE id = ${user.id}`);

                return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
            });
        };

        // Send DM
        if (cmd === "dm") {
            user.send(args.join(" "));
            return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
        };

        // Add premium
        if (cmd === "query") {
            if (args[0].toUpperCase() === "DROP") return interaction.reply({content: "not allowed", ephemeral: isEphemeral});
            db.serialize(async () => {
                const res = await query(args.join(" ") + (user ? ` WHERE id = ${user.id}` : ""));
                if (res.length) return interaction.reply({content: JSON.stringify(res).slice(0, 2000), ephemeral: isEphemeral});
                return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
            });
        };

        // Ban Players
        if (cmd === "ban" || cmd === "blacklist" || cmd === "suspend") {
            if (!user || user.bot || user.id === "489490486734880774") return interaction.reply({content: `No <:kek:927271748385243206>`, ephemeral: isEphemeral});

            const blacklist = JSON.parse(fs.readFileSync('Storage/blacklist.json', 'utf8'));
            blacklist[user.id] = args.length ? ` ${args.join(" ")}` : "";

            fs.writeFile('Storage/blacklist.json', JSON.stringify(blacklist), (err) => {
                if (err) console.error(err);
            });

            return interaction.reply({content: `${user.username} was banned from using Camelot`, ephemeral: isEphemeral});
        };

        // Unban Players
        if (cmd === "unban") {
            const blacklist = JSON.parse(fs.readFileSync('Storage/blacklist.json', 'utf8'));
            delete blacklist[user.id];
            fs.writeFile('Storage/blacklist.json', JSON.stringify(blacklist), (err) => {
                if (err) console.error(err);
            });
            return interaction.reply({content: `${user.username} was unbanned`, ephemeral: isEphemeral});
        };

        // Give mod perms
        if (cmd === "promote") {
            if (!user || user.bot) return interaction.reply({content: `No match found`, ephemeral: isEphemeral});
            if (!args[0] || isNaN(args[0]) || args[0] > 5 || args[0] < 1) return interaction.reply({content: `Please input a number between 1 (lowest) to 5 (highest)\nExample: \`/admin promote 2 user:\``, ephemeral: isEphemeral});

            const moderators = JSON.parse(fs.readFileSync('Storage/moderators.json', 'utf8'));
            moderators[user.id] = parseInt(args[0]);

            fs.writeFile('Storage/moderators.json', JSON.stringify(moderators), (err) => {
                if (err) console.error(err);
            });

            return interaction.reply({content: `${user.username} was promoted to ${args[0]}`, ephemeral: isEphemeral});
        };

        // Take mod perms
        if (cmd === "demote") {
            const moderators = JSON.parse(fs.readFileSync('Storage/moderators.json', 'utf8'));
            delete moderators[user.id];
            fs.writeFile('Storage/moderators.json', JSON.stringify(moderators), (err) => {
                if (err) console.error(err);
            });
            return interaction.reply({content: `${user.username} was demoted in mod rank`, ephemeral: isEphemeral});
        };

        // Repeat text
        if (cmd === "say") {
            return interaction.channel.send(args.join(" "));
        };

        // Response Time
        if (cmd === "response") {
            db.serialize(async () => {
                const { 0: res } = await query(`SELECT responsetime FROM dungeon WHERE id = '${user.id}'`);
                const timestamps = res.responsetime.split(",").map((e) => parseInt(e));
                const resp = timestamps.map((e, i) => timestamps[i+1]-e).slice(0, -2);
                let cleaned = resp.filter((e) => e < 30*1000);
                const rounded = resp.map((e) => Math.round(e/1000));
                if (cleaned.length === 0) return interaction.reply({content: "not enough data", ephemeral: isEphemeral});
                const diff = -(math.mean(...cleaned.slice(-100)));

                // const result = findRepeatingPattern(rounded, 5, 0.99, 5);
                // console.log(result);

                // const list = [];
                // resp.forEach((e, i) => {
                //     if (e > 60*1000 && e < 200*1000) console.log(Math.round(resp[i]/100)/10, Math.round(resp[i+1]/100)/10, Math.round(resp[i+2]/100)/10, Math.round(resp[i+3]/100)/10) // list.push(...[resp[i], resp[i+1], resp[i+2], resp[i+3]]);
                // });
                // console.log(list);

                if (args[0] === "graph") {
                    const distribution = {};
                    const ndiff = -(math.mean(...resp.filter((e) => e < 20*1000).slice(-30000)));
                    resp.filter((e) => e < 20*1000).map((e) => Math.round((e+ndiff)/1000)).forEach((e) => distribution[e] = distribution[e]+1 || 1);

                    const {spawn} = require('child_process');
                    const pythonProcess = spawn('python',["./Python/graph.py", user.username]);

                    // Pass data to the Python script via stdin
                    pythonProcess.stdin.write(JSON.stringify(distribution));
                    pythonProcess.stdin.end();

                    pythonProcess.stdout.on('data', (data) => {
                        const url = data.toString('utf8') || "failed to load image";
                        interaction.reply({content: url, ephemeral: isEphemeral});
                    });
                } else {
                    cleaned = cleaned.slice(-30000);
                    const s = `**user**: ${user.username}\n**sample size**: ${cleaned.length} | ${cleaned.slice(-100).length}\n**mean**: ${Math.round(math.mean(...cleaned)/10)/100}s | ${Math.round(math.mean(...cleaned.slice(-100))/10)/100}s\n**median**: ${Math.round(math.median(...cleaned)/10)/100}s | ${Math.round(math.median(...cleaned.slice(-100))/10)/100}s\n**mode**: ${math.mode(rounded)}s | ${math.mode(rounded.slice(-100))}s\n**std**: ${Math.round(math.std(...cleaned)/10)/100}s | ${Math.round(math.std(...cleaned.slice(-100))/10)/100}s\n**var**: ${Math.round(math.variance(...cleaned)/10000)/100}s² | ${Math.round(math.variance(...cleaned.slice(-100))/10000)/100}s²\n\n**Recent Activity**:\n> `
                    return interaction.reply({content: s + rounded.join(", ").slice(-1400) + `\n\n**Normalized**:\n> ` + resp.slice(-100).map((e) => Math.round((e+diff)/1000)).join(", ").slice(-(600-20-s.length)), ephemeral: isEphemeral});
                };
            });
        };

        // Response Time
        if (cmd === "rga") {
            db.serialize(async () => {
                const res = await query(`SELECT responsetime FROM dungeon`);
                let timestamps = [];
                res.forEach((e) => timestamps = [...timestamps, ...e.responsetime.split(",").map((e) => parseInt(e))]);
                timestamps.sort((a, b) => a-b);
                
                const resp = timestamps.map((e, i) => timestamps[i+1]-e).slice(0, -2);
                const cleaned = resp.filter((e) => e < 30*1000);
                if (cleaned.length === 0) return interaction.reply({content: "not enough data", ephemeral: isEphemeral});
                
                // const distribution = {};
                // const ndiff = -(math.mean(...resp.filter((e) => e < 20*1000)));
                // resp.filter((e) => e < 20*1000).map((e) => Math.round((e+ndiff)/1000)).forEach((e) => {
                //     if (e in distribution) distribution[e]++;
                //     else distribution[e] = 1;
                // });

                const distribution = {};
                const respFiltered = resp.filter((e) => e < 20 * 1000);
                const sum = respFiltered.reduce((acc, val) => acc + val, 0);
                const ndiff = -(sum / respFiltered.length);
                const length = respFiltered.length;

                for (let i = 0; i < length; i++) {
                    const e = respFiltered[i];
                    const key = Math.round((e + ndiff) / 1000);

                    if (distribution[key]) {
                        distribution[key]++;
                    } else {
                        distribution[key] = 1;
                    }
                };

                // console.log("Fin");

                // return;
                
                // fs.writeFile('Storage/dump.json', JSON.stringify(distribution), (err) => {
                //     if (err) console.error(err);
                // });

                // return;

                const {spawn} = require('child_process');
                const pythonProcess = spawn('python',["./Python/graph.py", "Gloabal"]);

                // Pass data to the Python script via stdin
                pythonProcess.stdin.write(JSON.stringify(distribution));
                pythonProcess.stdin.end();

                pythonProcess.stdout.on('data', (data) => {
                    const url = data.toString('utf8') || "failed to load image";
                    interaction.reply({content: url, ephemeral: isEphemeral});
                });

            });
        };

        // Show users with std < args[0]
        if (cmd === "std") {
            db.serialize(async () => {
                const results = await query(`SELECT id, responsetime FROM dungeon`);

                let s = "Users with std < " + args[0];

                for (const res of results) {
                    const timestamps = res.responsetime.split(",").map((e) => parseInt(e));
                    const resp = timestamps.map((e, i) => timestamps[i+1]-e).slice(0, -2);
                    const cleaned = resp.filter((e) => e < 30*1000).slice(0,10000);
                    if (cleaned.length === 0) continue;
                    const std = Math.round(math.std(...cleaned)/10)/100;
                    if (std < parseFloat(args[0]) && cleaned.length > 100) s += `\n${res.id}: ${std}s std (${cleaned.length} sample)`
                };

                return interaction.reply({content: s, ephemeral: isEphemeral});
            });
        };

    },
};