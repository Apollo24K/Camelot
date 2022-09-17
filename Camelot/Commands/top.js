var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { characters } = require("../Modules/chars.js");
const { userLevel } = require("../Modules/functions.js");

module.exports = {
	name: 'top',
	description: 'rank players',
	execute(interaction) {

        var customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        let page = interaction.options.getInteger('page');
        let flag = interaction.options.getString('flag');
        let scope = interaction.options.getString('scope');
        
        db.serialize(async () => {
            await interaction.deferReply();

            let servers;
            if (scope === "server") {
                servers = await query(`SELECT user_ids FROM servers WHERE id = ${interaction.guild.id}`);
                servers = servers[0];
            };

            var stats; // = await query(`SELECT users.name, users.id, users.xp, users.favchar, users.lilies, users.pullstotal, users.achievements, users.premium, characters.chars, dungeon.floors, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""}`);
            let count = 1;
            let showUsers;
            switch (flag) {
                case "level": stats = await query(`SELECT users.name, users.id, users.xp, users.favchar, users.premium, characters.chars FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""} ORDER BY users.xp DESC`);
                              showUsers = stats.map((e) => `${count++}. **${e.name}** - Level **${userLevel(e.xp)}**` ); break;
                case "pulls": stats = await query(`SELECT users.name, users.id, users.pullstotal, users.favchar, users.premium, characters.chars FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""} ORDER BY users.pullstotal DESC`);
                              showUsers = stats.map((e) => `${count++}. **${e.name}** - **${e.pullstotal}** pulls` ); break;
                case "chars": stats = await query(`SELECT users.name, users.id, users.favchar, users.premium, characters.chars FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""}`);
                              stats.sort((a, b) => new Set(JSON.parse(b.chars)).size - new Set(JSON.parse(a.chars)).size);
                              showUsers = stats.map((e) => `${count++}. **${e.name}** - has **${new Set(JSON.parse(e.chars)).size}** characters` ); break;
                case "progress": stats = await query(`SELECT users.name, users.id, users.favchar, users.premium, characters.chars FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""}`);
                                 stats.sort((a, b) => new Set(JSON.parse(b.chars)).size - new Set(JSON.parse(a.chars)).size);
                                 showUsers = stats.map((e) => `${count++}. **${e.name}** - has completed **${Math.floor((new Set(JSON.parse(e.chars)).size/characters.length)*1000)/10}%**` ); break;
                case "anime": stats = await query(`SELECT users.name, users.id, users.favchar, users.premium, characters.chars FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""}`);
                              stats.sort((a, b) => [... new Set(JSON.parse(b.chars).map((e) => characters[e].anime))].filter((e) => [...new Set(JSON.parse(b.chars))].filter((t) => characters[t].anime === e).length === characters.filter((t) => t.anime === e).length).length - [... new Set(JSON.parse(a.chars).map((e) => characters[e].anime))].filter((e) => [...new Set(JSON.parse(a.chars))].filter((t) => characters[t].anime === e).length === characters.filter((t) => t.anime === e).length).length);
                              showUsers = stats.map((e) => `${count++}. **${e.name}** - has completed **${[... new Set(JSON.parse(e.chars).map((a) => characters[a].anime))].filter((a) => [...new Set(JSON.parse(e.chars))].filter((t) => characters[t].anime === a).length === characters.filter((t) => t.anime === a).length).length}** anime` ); break;
                case "lilies": stats = await query(`SELECT users.name, users.id, users.lilies, users.favchar, users.premium, characters.chars FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""} ORDER BY users.lilies DESC`);
                               showUsers = stats.map((e) => `${count++}. **${e.name}** - **${e.lilies}** <:lilium:974057059618291732>` ); break;
                case "achievements": stats = await query(`SELECT users.name, users.id, users.achievements, users.favchar, users.premium, characters.chars FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""}`);
                                     stats.sort((a, b) => JSON.parse(b.achievements).length - JSON.parse(a.achievements).length);
                                     showUsers = stats.map((e) => `${count++}. **${e.name}** - has completed **${JSON.parse(e.achievements).length}** achievements` ); break;
                case "dungeon": stats = await query(`SELECT users.name, users.id, users.favchar, users.premium, characters.chars, dungeon.floors FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""} ORDER BY LENGTH(dungeon.floors) - LENGTH(REPLACE(dungeon.floors,',','')) DESC`);
                                showUsers = stats.map((e) => `${count++}. **${e.name}** - Floor **${e.floors.split(",").length}**` ); break;
                // case "classes": Object.keys(userClasses).forEach((e) => userClasses[e].forEach((a) => map.set(e.slice(0,18) + a, getClassLvl(a, e.slice(0,18))) )); break;
                                // map.forEach((val,key) => { showUsers.push(`${count++}. **${ccgUsers[key.slice(0,18)]}** - Level **${val}** ${classes[key.slice(18)].emblem}`) }); break;
                default: false; break;
            };

            let thumbnail = characters[JSON.parse(stats[0].chars)[Math.floor(Math.random() * JSON.parse(stats[0].chars).length)]]?.image || "https://i.ibb.co/jZ7fHSj/camelot.png";
            if (stats[0].favchar !== null) {
                thumbnail = characters[stats[0].favchar].image;
                if (stats[0].premium > 3) if (customSettings[stats[0].id] && customSettings[stats[0].id].cimg[stats[0].favchar]) thumbnail = customSettings[stats[0].id].cimg[stats[0].favchar];
            };

            let pagesTotal = Math.ceil(stats.length / 15);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };
            
            let left = stats.length % 15;
            let showUsersF = [];
            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                showUsersF.push(showUsers[i]);
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
            .setColor(0xbbffff)
            .setTitle(`🏆 ${scope === "server" ? interaction.guild.name : "Camelot"} top players 🏆`)
            .setDescription(showUsersF.join("\n"))
            .setThumbnail(thumbnail)
            .setFooter(`Page ${currPage}/${pagesTotal}`);
            if (stats.length < 16) return interaction.editReply({ embeds: [Embed] });
            interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {

                const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 60000 });
                const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 60000 });

                prev.on('collect', async r => {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                    });

                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;

                    let showUsersF = [];
                    if (currPage < pagesTotal) {
                        for (i=(currPage-1)*15; i < currPage * 15; i++) {
                            showUsersF.push(showUsers[i]);
                        };
                    } else {
                        for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            showUsersF.push(showUsers[i]);
                        };
                    };
                    Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [row] });
                });

                next.on('collect', async r => {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                    });

                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;

                    let showUsersF = [];
                    if (currPage < pagesTotal) {
                        for (i=(currPage-1)*15; i < currPage * 15; i++) {
                            showUsersF.push(showUsers[i]);
                        };
                    } else {
                        for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            showUsersF.push(showUsers[i]);
                        };
                    };
                    Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [row] });
                });

            });

        });

    },
};