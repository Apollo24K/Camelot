/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");

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

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('prev')
                        .setEmoji('⏪')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('next')
                        .setEmoji('⏩')
                        .setStyle('SECONDARY'),
                );

            const Embed = new MessageEmbed()
            .setTitle(`Guilds Total (${guildArr.length} | ${membersTotal})`)
            .setColor(0xbbffff)
            .setThumbnail("https://i.imgur.com/WWM4K98.png")
            .setDescription(showAnime.join("\n"))
            return interaction.reply({ embeds: [Embed], components: [row], fetchReply: true, ephemeral: isEphemeral }).then((msg) => {
                
                const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                prev.on('collect', async r => {
                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;

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

                    Embed.setDescription(showAnime.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [row] });
                });

                next.on('collect', async r => {
                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;

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

                    Embed.setDescription(showAnime.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [row] });
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
            db.serialize(async () => {
                var inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
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
            if (!args[0] || !args[1] || !args[2]) return interaction.reply({content: "Sending Gifts\n> `/admin gift <type>-BR-<rewards>-BR-<message>`\n> `/admin cmd agrs[0] args[1] args.slice(2)`\n\nTypes:\n> 1 = xp\n> 2 = coins\n> 3 = ss shard|s shard|a shard|b shard|c shard|d shard\n> 4 = ss ticket|s ticket|a ticket|b ticket|c ticket|d ticket\n> 5 = lb\n> 6 = char\n> 7 = skin\n\nExamples:\n> `/admin gift 1,2-BR-xp|50,coins|500-BR-Thank you for playing!`", ephemeral: isEphemeral});

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

        // Blacklist
        if (cmd === "blacklist" || cmd === "ban" || cmd === "suspend") {
            let blacklist = JSON.parse(fs.readFileSync('Storage/blacklist.json', 'utf8'));

            if (user) {
                blacklist[user.id] = " " + args.join(" ");

                fs.writeFile('Storage/blacklist.json', JSON.stringify(blacklist), (err) => {
                    if (err) console.error(err);
                });
                return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
            };
            return interaction.reply({content: "You forgot to mention a user", ephemeral: isEphemeral});
        };

        // Send DM
        if (cmd === "dm") {
            user.send(args.join(" "));
            return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
        };


    },
};