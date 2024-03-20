const fs = require('fs');
const config = require('../config.json');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");
const { classLevelToXP } = require("../Modules/functions.js");
const { OfferRow } = require("../Modules/components.js");
const math = require('mathjs');

const voice = require('@discordjs/voice');

module.exports = {
    name: 'admin',
    description: 'take admin actions',
    execute(interaction, client) {

        let user = interaction.options.getUser('user') || false;
        let action = interaction.options.getString('action');
        const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

        let args = action.trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();

        // Return if not owner
        if (interaction.user.id !== "489490486734880774") {
            return interaction.reply({ content: "You're not allowed to use this command", ephemeral });
        };

        // List all actions
        if (action === "list") {
            return interaction.reply({ content: ">>> `list`\n`reset pulls`\n`reset daily`\n`reset weekly`\n`reset dungeon`\n`guilds`\n`add premium <int>`\n`add vote`\n`set <key> <value>`\n`did`", ephemeral });
        };

        // Reset Pulls
        if (action === "reset pulls") {
            db.serialize(async () => {
                await query(`UPDATE users SET pullcount = 0`);
            });
            return interaction.reply({ content: "Action Successful", ephemeral });
        };

        // Reset Dailies
        if (action === "reset daily") {
            db.serialize(async () => {
                await query(`UPDATE users SET dailyclaimed = 0`);
            });
            return interaction.reply({ content: "Action Successful", ephemeral });
        };

        // Reset Weeklies
        if (action === "reset weekly") {
            db.serialize(async () => {
                await query(`UPDATE users SET weeklyclaimed = 0`);
            });
            return interaction.reply({ content: "Action Successful", ephemeral });
        };

        // Reset Dungeon
        if (action === "reset dungeon") {
            db.serialize(async () => {
                await query(`UPDATE dungeon SET 'limit' = 0`);
            });
            return interaction.reply({ content: "Action Successful", ephemeral });
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
                for (let i = (currPage - 1) * 15; i < currPage * 15; i++) {
                    showAnime.push(`‧ ${guildArr[i]}`);
                };
            } else {
                for (let i = (currPage - 1) * 15; i < (currPage * 15) - (15 - left); i++) {
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
                .setDescription(showAnime.join("\n"));
            return interaction.reply({ embeds: [Embed], components: [row], fetchReply: true, ephemeral }).then((msg) => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

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
                        for (let i = (currPage - 1) * 15; i < currPage * 15; i++) {
                            showAnime.push(`‧ ${guildArr[i]}`);
                        };
                    } else {
                        for (let i = (currPage - 1) * 15; i < (currPage * 15) - (15 - left); i++) {
                            showAnime.push(`‧ ${guildArr[i]}`);
                        };
                    };

                    Embed.setDescription(showAnime.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed] });
                });

            });

        };

        // Add premium
        if (action.startsWith("add premium")) {
            db.serialize(async () => {
                await query(`UPDATE users SET premium = ${action.split(" ")[2]} WHERE id = ${user.id}`);
            });
            return interaction.reply({ content: "Action Successful", ephemeral });
        };

        // Add vote
        if (action === "add vote") {
            if (!user) return interaction.reply({ content: "missing user object", ephemeral });
            db.serialize(async () => {
                await query(`UPDATE users SET pullresets = pullresets + 1, votestotal = votestotal + 1, lootbox = lootbox + 1, lastvote = ${new Date().getTime()} WHERE id = ${user.id}`);
            });
            return interaction.reply({ content: "Action Successful", ephemeral });
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
            return interaction.reply({ content: "Action Successful", ephemeral });
        };

        // Add vote
        if (action === "did") {
            let names = characters.map((e) => e.name).sort();
            let len = names.length - 1, res = "";
            while (len--) if (names[len - 1] === names[len]) res += names[len--] + "\n";
            return interaction.reply({ content: res ? `Yes, he did!\n\n${res}` : "All's fine!", ephemeral });
        };

        // Add char
        if (action.startsWith("add char")) {
            if (!user) return interaction.reply({ content: "missing user object", ephemeral });
            db.serialize(async () => {
                let inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
                inv = JSON.parse(inv[0].chars);
                inv.push(parseInt(action.split(" ")[2]));
                await query(`UPDATE characters SET chars = '${JSON.stringify(inv)}' WHERE id = ${user.id}`);
            });
            return interaction.reply({ content: "Action Successful", ephemeral });
        };

        // Remove char
        if (action.startsWith("remove char")) {
            if (!user) return interaction.reply({ content: "missing user object", ephemeral });
            db.serialize(async () => {
                let inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
                inv = JSON.parse(inv[0].chars);
                inv.splice(inv.indexOf(parseInt(action.split(" ")[2])), 1);
                await query(`UPDATE characters SET chars = '${JSON.stringify(inv)}' WHERE id = ${user.id}`);
            });
            return interaction.reply({ content: "Action Successful", ephemeral });
        };

        // Leave Server
        if (action.startsWith("leave server")) {
            let guild = client.guilds.cache.get(action.split(" ")[2]);
            if (!guild) return interaction.reply({ content: `Couldn't find guild ${action.split(" ")[2]}`, ephemeral });
            guild.leave();
            return interaction.reply({ content: `Left ${guild.name}`, ephemeral });
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
            switch (args[0]) {
                case "snow": song = "white_white_snow"; break;
                default: song = args[0]; break;
            };

            const resource = voice.createAudioResource(fs.createReadStream(`./Audio/${song}.opus`), {
                inlineVolume: true
            });
            audioplayer.play(resource);
            console.log("Voice connection has been successful!");

            connection.on('stateChange', (oldState, newState) => {
                console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
            });
            audioplayer.on('stateChange', (oldState, newState) => {
                console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
                if (newState.status === "idle") {
                    audioplayer.play(voice.createAudioResource(fs.createReadStream(`./Audio/${song}.opus`), { inlineVolume: true }));
                };
            });
            return interaction.reply({ content: "Action Successful", ephemeral });
        };

        // Stop
        if (cmd === "stop") {
            const connection = voice.getVoiceConnection("927257132624130119");
            if (connection) {
                connection.destroy();
                console.log('Disconnected from voice!');
            };
            return interaction.reply({ content: "Action Successful", ephemeral });
        };

        // Mail
        if (cmd === "mail" || cmd === "mailbox" || cmd === "gift") {
            args = args.join(" ").split("-BR-");
            if (!args[0] || !args[1] || !args[2]) return interaction.reply({ content: "Sending Gifts\n> `/admin gift <type>-BR-<rewards>-BR-<message>`\n> `/admin cmd args[0] args[1] args.slice(2)`\n\nTypes:\n> 1 = xp\n> 2 = coins\n> 3 = ss shard|s shard|a shard|b shard|c shard|d shard\n> 4 = ss ticket|s ticket|a ticket|b ticket|c ticket|d ticket\n> 5 = lb\n> 6 = char\n> 7 = skin\n> 8 = item\n> 9 = gems\n\nExamples:\n> `/admin gift 1,2,8-BR-xp|50,coins|500,item|458|3-BR-Thank you for playing!`", ephemeral });

            const mail = { "type": args[0], "rewards": args[1], "message": args.slice(2).join(""), "date": new Date().getTime() };

            db.serialize(async () => {
                let mailboxes = await query(`SELECT id, mailbox FROM users${user ? ` WHERE id = ${user.id}` : ""}`);

                for (let i = 0; i < mailboxes.length; i++) {
                    let mailbox = JSON.parse(mailboxes[i].mailbox);
                    mailbox.push(mail);
                    await query(`UPDATE users SET mailbox = '${JSON.stringify(mailbox)}' WHERE id = ${mailboxes[i].id}`);
                };
                return interaction.reply({ content: "Action Successful", ephemeral });
            });
        };

        // Mail
        if (cmd === "giftguild") {
            const guildid = args.shift();
            args = args.join(" ").split("-BR-");
            if (!args[0] || !args[1] || !args[2]) return interaction.reply({ content: "Sending Gifts\n> `/admin giftguild <guild_id> <type>-BR-<rewards>-BR-<message>`\n> `/admin cmd args[0] args[1] args[2] args.slice(3)`\n\nTypes:\n> 1 = xp\n> 2 = coins\n> 3 = ss shard|s shard|a shard|b shard|c shard|d shard\n> 4 = ss ticket|s ticket|a ticket|b ticket|c ticket|d ticket\n> 5 = lb\n> 6 = char\n> 7 = skin\n> 8 = item\n> 9 = gems\n\nExamples:\n> `/admin giftguild 12wG2 1,2,8-BR-xp|50,coins|500,item|458|3-BR-Thank you for playing!`", ephemeral });


            const mail = { "type": args[0], "rewards": args[1], "message": args.slice(2), "date": new Date().getTime() };

            db.serialize(async () => {
                const { 0: guild } = await query(`SELECT * FROM guilds WHERE id = '${guildid}'`);
                if (!guild) return interaction.reply({ content: `Couldn't find guild \`${guildid}\``, ephemeral });

                let mailboxes = await query(`SELECT id, mailbox FROM users WHERE id IN (${guild.members})`);

                for (let i = 0; i < mailboxes.length; i++) {
                    let mailbox = JSON.parse(mailboxes[i].mailbox);
                    mailbox.push(mail);
                    await query(`UPDATE users SET mailbox = '${JSON.stringify(mailbox)}' WHERE id = ${mailboxes[i].id}`);
                };
                return interaction.reply({ content: "Action Successful", ephemeral });
            });
        };

        // Set Class Level
        if (cmd === "clvl") {
            if (!args[0]) return interaction.reply({ content: `format: \`/admin clvl <cid> <level>\``, ephemeral });

            db.serialize(async () => {
                const { 0: stats } = await query(`SELECT classlevels FROM dungeon WHERE id = ${user.id}`);
                stats.classlevels = JSON.parse(stats.classlevels);

                if (!(args[0] in stats.classlevels)) return interaction.reply({ content: `${user.username} doesn't have class ${args[0]}`, ephemeral });

                stats.classlevels[args[0]] = classLevelToXP(parseInt(args[1]));

                await query(`UPDATE dungeon SET classlevels = '${JSON.stringify(stats.classlevels)}' WHERE id = ${user.id}`);

                return interaction.reply({ content: "Action Successful", ephemeral });
            });
        };

        // Send DM
        if (cmd === "dm") {
            user.send(args.join(" "));
            return interaction.reply({ content: "Action Successful", ephemeral });
        };

        // Add premium
        if (cmd === "query") {
            if (args[0].toUpperCase() === "DROP") return interaction.reply({ content: "not allowed", ephemeral });
            db.serialize(async () => {
                const res = await query(args.join(" ") + (user ? ` WHERE id = ${user.id}` : ""));
                if (res.length) return interaction.reply({ content: JSON.stringify(res).slice(0, 2000), ephemeral });
                return interaction.reply({ content: "Action Successful", ephemeral });
            });
        };

        // See transactions
        if (action === "transactions" || action === "purchased" || action === "paid") {
            db.serialize(async () => {
                if (user) {
                    const { 0: stats } = await query(`SELECT transactions FROM users WHERE id = '${user.id}'`);
                    stats.transactions = JSON.parse(stats.transactions);
                    return interaction.reply({ content: `**${user.username}'s transactions**\n\nTransactions: ${stats.transactions.length}\nDonated total: $${stats.transactions.reduce((acc, transaction) => acc + parseInt(transaction.price), 0)}`, ephemeral });
                };

                // Leaderboard
                const stats = await query(`SELECT name, transactions FROM users WHERE length(transactions) > 2`);
                stats.forEach((stat) => { stat.transactions = JSON.parse(stat.transactions); stat.donated = stat.transactions.reduce((acc, transaction) => acc + parseInt(transaction.price), 0); });
                stats.sort((a, b) => b.donated - a.donated);

                return interaction.reply({ content: `**Top Donators** (total: $${stats.reduce((acc, stat) => acc + stat.donated, 0)})\n\n${stats.slice(0, 20).map((e, i) => `${i + 1}) ${e.name} ➜ $${e.donated}`).join("\n")}`, ephemeral });
            });
        };

        // Ban Players
        if (cmd === "ban" || cmd === "blacklist" || cmd === "suspend") {
            if (!user || user.bot || user.id === "489490486734880774") return interaction.reply({ content: `No <:kek:927271748385243206>`, ephemeral });

            const blacklist = JSON.parse(fs.readFileSync('Storage/blacklist.json', 'utf8'));
            blacklist[user.id] = args.length ? ` ${args.join(" ")}` : "";

            fs.writeFile('Storage/blacklist.json', JSON.stringify(blacklist), (err) => {
                if (err) console.error(err);
            });

            return interaction.reply({ content: `${user.username} was banned from using Camelot`, ephemeral });
        };

        // Unban Players
        if (cmd === "unban") {
            const blacklist = JSON.parse(fs.readFileSync('Storage/blacklist.json', 'utf8'));
            delete blacklist[user.id];
            fs.writeFile('Storage/blacklist.json', JSON.stringify(blacklist), (err) => {
                if (err) console.error(err);
            });
            return interaction.reply({ content: `${user.username} was unbanned`, ephemeral });
        };

        // See transactions
        if (cmd === "transfer") {
            if (!user || user.bot) return interaction.reply({ content: `**Usage**: \`/admin transfer <new_id> user:<old_user>\``, ephemeral });
            if (!args[0] || !/^\d+$/.test(args[0])) return interaction.reply({ content: `**Usage**: \`/admin transfer <new_id> user:<old_user>\``, ephemeral });

            db.serialize(async () => {
                const { 0: stats } = await query(`SELECT id FROM users WHERE id = '${user.id}'`);
                if (!stats) return interaction.reply({ content: `User ${user.toString()} is not a player.`, ephemeral });

                return interaction.reply({ content: `Are you sure you want to proceed transferring account details?\nOld Account: ${user.toString()}\nNew Account: <@${args[0]}>`, components: [OfferRow], fetchReply: true, ephemeral }).then((msg) => {
                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 30000 });

                    collector.on('collect', async r => {
                        collector.stop();
                        if (r.customId === "cancel") return interaction.followUp({ content: "Action cancelled", ephemeral });

                        await query(`DELETE FROM users WHERE id = ${args[0]}`);
                        await query(`DELETE FROM characters WHERE id = ${args[0]}`);
                        await query(`DELETE FROM dungeon WHERE id = ${args[0]}`);
                        await query(`DELETE FROM weapons WHERE id = ${args[0]}`);
                        await query(`DELETE FROM trades WHERE id = ${args[0]} OR receiver = ${args[0]}`);

                        await query(`UPDATE users SET id = ${args[0]} WHERE id = ${user.id}`);
                        await query(`UPDATE characters SET id = ${args[0]} WHERE id = ${user.id}`);
                        await query(`UPDATE dungeon SET id = ${args[0]} WHERE id = ${user.id}`);
                        await query(`UPDATE weapons SET id = ${args[0]}, uniqueid = SUBSTR(uniqueid, 1, INSTR(uniqueid, ':')) || ${args[0]} WHERE id = ${user.id}`);

                        return interaction.followUp({ content: `Transfer successful!\nOld Account: ${user.toString()}\nNew Account: <@${args[0]}>`, ephemeral });
                    });
                });
            });
        };

        // Recover Deleted Items
        if (cmd === "recover") {
            if (!user || user.bot) return interaction.reply({ content: `**Usage**: \`/admin recover user:<user>\``, ephemeral });

            db.serialize(async () => {
                if (args[0] === "--save") {
                    // Write to JSON
                    let recover = await query(`SELECT * FROM weapons WHERE id = '759855947920310393'`);

                    fs.writeFile('Storage/recover.json', JSON.stringify(recover), (err) => {
                        if (err) console.error(err);
                    });
                    return interaction.reply({ content: `Saved **${user.username}**'s items to recover.json`, ephemeral });
                };

                let recover = JSON.parse(fs.readFileSync('Storage/recover.json', 'utf8'));

                await query(`DELETE FROM weapons WHERE id = ${user.id}`);

                for (const rec of recover) {
                    await query(`INSERT INTO weapons (id, itemid, uniqueid, level, ascension, purity, character, substats) values ('${rec.id}', ${rec.itemid}, '${rec.uniqueid}', ${rec.level}, ${rec.ascension}, ${rec.purity}, ${rec.character}, ${rec.substats ? `'${rec.substats}'` : "NULL"})`);
                };

                return interaction.reply({ content: `Successfully recovered **${user.username}**'s items`, ephemeral });
            });
        };

        // Give mod perms
        if (cmd === "promote") {
            if (!user || user.bot) return interaction.reply({ content: `No match found`, ephemeral });
            if (!args[0] || isNaN(args[0]) || args[0] > 5 || args[0] < 1) return interaction.reply({ content: `Please input a number between 1 (lowest) to 5 (highest)\nExample: \`/admin promote 2 user:\``, ephemeral });

            const moderators = JSON.parse(fs.readFileSync('Storage/moderators.json', 'utf8'));
            moderators[user.id] = parseInt(args[0]);

            fs.writeFile('Storage/moderators.json', JSON.stringify(moderators), (err) => {
                if (err) console.error(err);
            });

            return interaction.reply({ content: `${user.username} was promoted to ${args[0]}`, ephemeral });
        };

        // Take mod perms
        if (cmd === "demote") {
            const moderators = JSON.parse(fs.readFileSync('Storage/moderators.json', 'utf8'));
            delete moderators[user.id];
            fs.writeFile('Storage/moderators.json', JSON.stringify(moderators), (err) => {
                if (err) console.error(err);
            });
            return interaction.reply({ content: `${user.username} was demoted in mod rank`, ephemeral });
        };

        // Repeat text
        if (cmd === "say") {
            return interaction.channel.send(args.join(" "));
        };

        // Stampede participation
        if (cmd === "participation") {
            if (!user || user.bot) return interaction.reply({ content: `Retrieve stampede participation points and damage\n\n**Usage**: \`/admin participation arg[0]:new_damage arg[1]:new_participation user:<user>\``, ephemeral });
            db.serialize(async () => {
                const { 0: damages } = await query(`SELECT rowid, participation FROM stampedes ORDER BY rowid DESC LIMIT 1`);
                damages.participation = JSON.parse(damages.participation); // [0: damage, 1: rounds played]

                if ((!args[0] && args[0] !== 0) || isNaN(args[0]) || (args[1] && isNaN(args[1]))) return interaction.reply({ content: `Stampede Participation of ${user.username}\nDamage: ${damages.participation[user.id]?.[0] ?? 0}\nParticipation: ${damages.participation[user.id]?.[1] ?? 0}`, ephemeral });

                if (damages.participation[user.id]) {
                    damages.participation[user.id][0] = parseInt(args[0]);
                    if (args[1] || args[1] === 0) damages.participation[user.id][1] = parseInt(args[1]);
                } else {
                    damages.participation[user.id] = [parseInt(args[0]), parseInt(args[1]) || 0];
                };
                await query(`UPDATE stampedes SET participation = '${JSON.stringify(damages.participation)}' WHERE rowid = ${damages.rowid}`);
                return interaction.reply({ content: "Action Successful", ephemeral });
            });
        };

        // Response Time
        async function response(flags = []) {
            const { 0: res } = await query(`SELECT ${flags.includes("stampede") ? "s_responsetime" : "responsetime"} as rtime FROM dungeon WHERE id = '${user.id}'`);
            const timestamps = res.rtime.split(",").map((e) => parseInt(e));
            const resp = timestamps.map((e, i) => timestamps[i + 1] - e).slice(0, -2);
            let cleaned = resp.filter((e) => e < 60 * 1000);
            if (cleaned.length === 0) return "not enough data";
            const rounded = resp.map((e) => Math.round(e / 1000));
            const diff = -(math.mean(...cleaned.slice(-100)));

            if (flags.includes("graph")) {
                const distribution = {};
                const ndiff = -(math.mean(resp.filter((e) => e < 20 * 1000).slice(-30000)));
                resp.filter((e) => e < 20 * 1000).map((e) => Math.round((e + ndiff) / 1000)).forEach((e) => distribution[e] = distribution[e] + 1 || 1);

                const { spawn } = require('child_process');
                const pyVersion = config.token === config.camelot ? 'python3' : 'python'; // Ubuntu : Windows
                const pythonProcess = spawn(pyVersion, ["./Python/graph.py", user.username]);

                // Pass data to the Python script via stdin
                pythonProcess.stdin.write(JSON.stringify(distribution));
                pythonProcess.stdin.end();

                return new Promise((resolve, reject) => {
                    pythonProcess.stdout.on('data', (data) => {
                        const url = data.toString('utf8') || "failed to load image";
                        resolve(url);
                    });
                    pythonProcess.stdout.on('error', () => {
                        reject("failed to load image");
                    });
                });
            } else {
                let minVar = 1 / 0, idx = 0;
                for (let i = 0; i < cleaned.length - 100; i += 10) {
                    if (math.variance(cleaned.slice(i, i + 100)) < minVar) {
                        minVar = math.variance(cleaned.slice(i, i + 100));
                        idx = i;
                    };
                };
                let risky = minVar === 1 / 0 ? "" : `\n\n**Highest Risk** (std: ${Math.round(Math.sqrt(minVar) / 10) / 100}s, var: ${Math.round(minVar / 10000) / 100}s²):\n> ` + cleaned.slice(idx, idx + 100).map((e) => Math.round(e / 1000)).join(", ").slice(-(400));

                // Longest seesion
                const sessions = [-rounded[0]];
                const maxBreak = parseInt((flags.find((e) => e.startsWith("session:")) ?? "session:300").split(":")[1]) || 300;
                for (const n of rounded) {
                    if (n < maxBreak) sessions[sessions.length - 1] += n;
                    else sessions.push(0);
                };

                const s = `**user**: ${user.username} | ${user.id}\n**sample size**: ${cleaned.length} | ${cleaned.slice(-100).length}\n**mean**: ${Math.round(math.mean(cleaned) / 10) / 100}s | ${Math.round(math.mean(cleaned.slice(-100)) / 10) / 100}s\n**median**: ${Math.round(math.median(cleaned) / 10) / 100}s | ${Math.round(math.median(cleaned.slice(-100)) / 10) / 100}s\n**mode**: ${math.mode(rounded)}s | ${math.mode(rounded.slice(-100))}s\n**std**: ${Math.round(math.std(cleaned) / 10) / 100}s | ${Math.round(math.std(cleaned.slice(-100)) / 10) / 100}s\n**var**: ${Math.round(math.variance(cleaned) / 10000) / 100}s² | ${Math.round(math.variance(cleaned.slice(-100)) / 10000) / 100}s²\n**Longest session**: ${Math.floor((Math.max(...sessions) / (60 * 60)) * 100) / 100}h\n\n**Recent Activity**:\n> `;
                return s + rounded.join(", ").slice(-(1400 - risky.length)) + `\n\n**Normalized**:\n> ` + resp.slice(-100).map((e) => Math.round((e + diff) / 1000)).join(", ").slice(-(600 - 20 - s.length)) + risky;
                // return interaction.reply({content: s + rounded.join(", ").slice(-(1400-risky.length)) + `\n\n**Normalized**:\n> ` + resp.slice(-100).map((e) => Math.round((e+diff)/1000)).join(", ").slice(-(600-20-s.length)) + risky, ephemeral});
            };
        };
        if (cmd === "response" || cmd === "s_response") {
            if (!user?.id && args[0] !== "rank") return interaction.reply({ content: "Usage: `/mod response [graph|rank] user?:`\n\n**Options**\n`graph`: Draw a graph\n`rank`: Rank users by std", ephemeral });

            const flags = args.filter((s) => s.startsWith("--")).map((s) => s.slice(2));

            db.serialize(async () => {
                if (args[0] === "rank") {
                    interaction.reply({ content: "loading...", ephemeral });

                    let results = await query(`SELECT id, ${cmd === "response" ? "responsetime" : "s_responsetime"} as rtime FROM dungeon`);
                    results = results.filter((e) => e.rtime);

                    const final = [];
                    for (const res of results) {
                        const timestamps = res.rtime.split(",").map((e) => parseInt(e));
                        const resp = timestamps.map((e, i) => timestamps[i + 1] - e).slice(0, -2);
                        let cleaned = resp.filter((e) => e < 60 * 60 * 1000);
                        if (cleaned.length < 100) continue;

                        let minVar = 1 / 0, idx = -1;
                        for (let i = 0; i < cleaned.length - 100; i += 10) {
                            if (math.variance(cleaned.slice(i, i + 100)) < minVar) {
                                minVar = math.variance(cleaned.slice(i, i + 100));
                                idx = i;
                            };
                        };
                        final.push({ id: res.id, var: minVar, idx });
                    };
                    setTimeout(() => {
                        interaction.editReply({ content: final.sort((a, b) => a.var - b.var).slice(0, 20).map((e) => `${e.id} ➜ std: ${Math.round(Math.sqrt(e.var) / 10) / 100}s, var: ${Math.round(e.var / 10000) / 100}s²`).join("\n"), ephemeral });
                    }, 5000);
                } else {
                    const content = await response(flags);
                    interaction.reply({ content, ephemeral });
                };
            });
        };

        // Show users with std < args[0]
        if (cmd === "std") {
            db.serialize(async () => {
                const results = await query(`SELECT id, responsetime FROM dungeon`);

                let s = "Users with std < " + args[0];

                for (const res of results) {
                    const timestamps = res.responsetime.split(",").map((e) => parseInt(e));
                    const resp = timestamps.map((e, i) => timestamps[i + 1] - e).slice(0, -2);
                    const cleaned = resp.filter((e) => e < 30 * 1000).slice(0, 10000);
                    if (cleaned.length === 0) continue;
                    const std = Math.round(math.std(...cleaned) / 10) / 100;
                    if (std < parseFloat(args[0]) && cleaned.length > 100) s += `\n${res.id}: ${std}s std (${cleaned.length} sample)`;
                };

                return interaction.reply({ content: s, ephemeral });
            });
        };

        // Test variance
        if (cmd === "var") {
            db.serialize(async () => {
                let results = await query(`SELECT id, responsetime FROM dungeon`);
                results = results.filter((e) => e.responsetime);

                const final = [];
                for (const res of results) {
                    const timestamps = res.responsetime.split(",").map((e) => parseInt(e));
                    const resp = timestamps.map((e, i) => timestamps[i + 1] - e).slice(0, -2);
                    let cleaned = resp.filter((e) => e < 30 * 1000);
                    if (cleaned.length < 100) continue;

                    let minVar = 1 / 0, idx = -1;
                    for (let i = 0; i < cleaned.length - 100; i += 10) {
                        if (math.variance(cleaned.slice(i, i + 100)) < minVar) {
                            minVar = math.variance(cleaned.slice(i, i + 100));
                            idx = i;
                        };
                    };
                    final.push({ id: res.id, var: minVar, idx });
                };

                interaction.reply({ content: final.sort((a, b) => a.var - b.var).slice(0, 20).map((e) => `${e.id} ➜ std: ${Math.round(Math.sqrt(e.var) / 10) / 100}s, var: ${Math.round(e.var / 10000) / 100}s²`).join("\n"), ephemeral });
            });
        };

        // Warn
        if (cmd === "warn") {
            if (!args[0] || !user) return interaction.reply({ content: "`/admin action:warn <option>`\n\n**Options**\n`botting`\n`alting`", ephemeral });

            if (args[0] === "botting") {
                user.send(`Hey ${user.username}, you've been caught botting (using self-bots, macros, scripts or similar to automate your progress) which is strictly against our [Terms of Service](<https://github.com/Apollo24K/Camelot-Public-Repo/blob/main/ToS>). Your account has been penalized accordingly. Please refrain from breaking any more terms in the future. Thank you for your understanding <a:GabrielBow:1045095869306912881>\n\nIf you want to appeal this decision, please open a ticket on our [Support Server](<https://discord.gg/myy9PBCdEW>).`);

                const chnl = client.channels.cache.find(channel => channel.id === "1148646565276299405");
                db.serialize(async () => {
                    let content = await response();
                    chnl.send(content);
                    content = await response(["graph"]);
                    chnl.send(content);
                    return interaction.reply({ content: `Successfully warned ${user.username} for botting`, ephemeral });
                });
            };

            if (args[0] === "alting") {
                user.send(`Hey ${user.username}, you've been caught alting (using alternative accounts to help your main account progress) which is strictly against our [Terms of Service](<https://github.com/Apollo24K/Camelot-Public-Repo/blob/main/ToS>). Your account has been penalized accordingly. Please refrain from breaking any more terms in the future. Thank you for your understanding <a:GabrielBow:1045095869306912881>\n\nIf you want to appeal this decision, please open a ticket on our [Support Server](<https://discord.gg/myy9PBCdEW>).`);
                return interaction.reply({ content: `Successfully warned ${user.username} for alting`, ephemeral });
            };
        };

        // Trades
        if (cmd === "rtrades") {
            // if (!user) return interaction.reply({ content: "Usage: `/admin rtrades user:`\n\n**Options**\n`--`: --", ephemeral });

            db.serialize(async () => {
                let trades = await query(`SELECT * FROM trades`);
                trades = trades.filter((e) => e.type === "coins");

                // Step 1: Create the Graph
                let graph = {};
                trades.forEach(trade => {
                    if (!graph[trade.id]) {
                        graph[trade.id] = {};
                    }
                    graph[trade.id][trade.receiver] = (graph[trade.id][trade.receiver] || 0) + trade.sent;
                });

                // Step 2: Simplify Transactions
                // This step involves complex logic. Here's a basic outline for cancellation.
                Object.keys(graph).forEach(sender => {
                    Object.keys(graph[sender]).forEach(receiver => {
                        if (graph[receiver] && graph[receiver][sender]) {
                            // Cancel out transactions if they exist in opposite directions
                            const netAmount = graph[sender][receiver] - graph[receiver][sender];
                            if (netAmount > 0) {
                                graph[sender][receiver] = netAmount;
                                delete graph[receiver][sender];
                            } else if (netAmount < 0) {
                                graph[receiver][sender] = -netAmount;
                                delete graph[sender][receiver];
                            } else {
                                delete graph[sender][receiver];
                                delete graph[receiver][sender];
                            }
                        }
                    });
                });


                // // Transitive reduction and more complex simplifications would be added here.
                // // Function to perform DFS and find all reachable nodes along with transaction paths
                // function findAllPaths(graph, start, end, path = [], paths = []) {
                //     path.push(start);

                //     if (start === end) {
                //         paths.push([...path]);
                //     } else if (graph[start]) {
                //         for (let node of Object.keys(graph[start])) {
                //             if (!path.includes(node)) {
                //                 findAllPaths(graph, node, end, path, paths);
                //             }
                //         }
                //     }

                //     path.pop();
                //     return paths;
                // };

                // // Function to simplify the graph using transitive reduction
                // let gLen = Object.keys(graph).length;
                // function transitiveReduction(graph) {
                //     let ii = 1, jj = 1;
                //     for (let sender in graph) {
                //         console.log(`${ii++}/${gLen}`);
                //         for (let receiver in graph) {
                //             console.log(`${jj++ % 50}/${gLen}`);
                //             if (sender !== receiver) {
                //                 let allPaths = findAllPaths(graph, sender, receiver);

                //                 // Simplify if there's a longer path
                //                 if (allPaths.length > 1) {
                //                     let directAmount = graph[sender] && graph[sender][receiver] ? graph[sender][receiver] : 0;
                //                     let indirectAmount = Math.min(...allPaths.filter(p => p.length > 2).map(p => {
                //                         return p.slice(1, -1).reduce((amount, node) => {
                //                             return Math.min(amount, graph[node][p[p.indexOf(node) + 1]]);
                //                         }, Infinity);
                //                     }));

                //                     if (indirectAmount !== Infinity) {
                //                         graph[sender][receiver] = directAmount + indirectAmount;
                //                         // Remove indirect paths
                //                         allPaths.filter(p => p.length > 2).forEach(p => {
                //                             for (let i = 0; i < p.length - 1; i++) {
                //                                 let amt = graph[p[i]][p[i + 1]] - indirectAmount;
                //                                 if (amt > 0) graph[p[i]][p[i + 1]] = amt;
                //                                 else delete graph[p[i]][p[i + 1]];
                //                             }
                //                         });
                //                     }
                //                 }
                //             }
                //         }
                //     }
                // }

                // transitiveReduction(graph);


                // Step 3: Generate Simplified Results
                let results = [];
                Object.keys(graph).forEach(sender => {
                    Object.keys(graph[sender]).forEach(receiver => {
                        if (graph[sender][receiver] > 0) {
                            results.push({ sender, receiver, amount: graph[sender][receiver] });
                        }
                    });
                });

                console.log(results.sort((a, b) => b.amount - a.amount));

                // return results;
            });
        };

    },
};