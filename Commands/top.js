/* eslint-disable no-case-declarations */
const fs = require('fs');
const { EmbedBuilder, ComponentType } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { characters, auniq } = require("../Modules/chars.js");
const { userLevel, getClassLvl, showPage } = require("../Modules/functions.js");
const { classes } = require("../Modules/classes.js");
const { PageRow } = require("../Modules/components.js");

module.exports = {
	name: 'top',
	description: 'rank players',
	execute(interaction) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        let page = interaction.options.getInteger('page');
        let flag = interaction.options.getString('flag');
        let scope = interaction.options.getString('scope');
        
        db.serialize(async () => {
            await interaction.deferReply().catch(() => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });

            const { 0: servers} = await query(`SELECT user_ids FROM servers WHERE id = ${interaction.guild.id}`);

            let stats; // = await query(`SELECT users.name, users.id, users.xp, users.favchar, users.lilies, users.pullstotal, users.achievements, users.premium, characters.chars, dungeon.floors, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})`: ""}`);
            let count = 1, showUsers;
            switch (flag) {
                case "level": stats = await query(`SELECT users.name, users.id, users.xp, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})`: ""} ORDER BY users.xp DESC`);
                              showUsers = stats.map((e) => `${count++}) **${e.name}** - Level **${userLevel(e.xp)}**` ); break;
                case "pulls": stats = await query(`SELECT users.name, users.id, users.pullstotal, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})`: ""} ORDER BY users.pullstotal DESC`);
                              showUsers = stats.map((e) => `${count++}) **${e.name}** - **${e.pullstotal}** pulls` ); break;
                case "chars": stats = await query(`SELECT users.name, users.id, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})`: ""}`);
                              stats.forEach((e) => e.chars = [...new Set(JSON.parse(e.chars))]);
                              stats.sort((a, b) => b.chars.length - a.chars.length);
                              showUsers = stats.map((e) => `${count++}) **${e.name}** - has **${e.chars.length}** characters` ); break;
                case "progress": stats = await query(`SELECT users.name, users.id, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})`: ""}`);
                                 stats.forEach((e) => e.chars = [...new Set(JSON.parse(e.chars))]);
                                 stats.sort((a, b) => b.chars.length - a.chars.length);
                                 showUsers = stats.map((e) => `${count++}) **${e.name}** - has completed **${Math.floor((e.chars.length/characters.length)*1000)/10}%**` ); break;
                case "anime": stats = await query(`SELECT users.name, users.id, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})`: ""}`);
                              const charsTotal = auniq.reduce((obj, e) => {return {...obj, [e]: characters.filter((c) => c.anime === e).length}}, {});
                              stats.forEach((e) => { e.chars = [...new Set(JSON.parse(e.chars))]; e.charsTotal = {}; e.chars.forEach((a) => e.charsTotal[characters[a].anime] = (e.charsTotal[characters[a].anime] || 0)+1 ); e.anime = Object.keys(e.charsTotal).filter((a) => e.charsTotal[a] === charsTotal[a]).length; delete e.charsTotal });
                              stats.sort((a, b) => b.anime - a.anime);
                              showUsers = stats.map((e) => `${count++}) **${e.name}** - has completed **${e.anime}** anime` ); break;
                case "lilies": stats = await query(`SELECT users.name, users.id, users.lilies, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})`: ""} ORDER BY users.lilies DESC`);
                               showUsers = stats.map((e) => `${count++}) **${e.name}** - **${e.lilies}** <:lilium:974057059618291732>` ); break;
                case "achievements": stats = await query(`SELECT users.name, users.id, users.achievements, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})`: ""}`);
                                     stats.forEach((e) => e.achievements = JSON.parse(e.achievements).length);
                                     stats.sort((a, b) => b.achievements - a.achievements);
                                     showUsers = stats.map((e) => `${count++}) **${e.name}** - has completed **${e.achievements}** achievements` ); break;
                case "dungeon": stats = await query(`SELECT users.name, users.id, users.favchar, users.premium, characters.chars, characters.skin, dungeon.floors FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})`: ""} ORDER BY LENGTH(dungeon.floors) - LENGTH(REPLACE(dungeon.floors,',','')) DESC`);
                                showUsers = stats.map((e) => `${count++}) **${e.name}** - Floor **${e.floors.split(",").length}**` ); break;
                case "coins": stats = await query(`SELECT users.name, users.id, users.coins, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})`: ""} ORDER BY users.coins DESC`);
                              showUsers = stats.map((e) => `${count++}) **${e.name}** - **${e.coins}** <:coins:872926669055356939>` ); break;
                // case "class": stats = await query(`SELECT users.name, users.id, users.favchar, users.battlechar, users.premium, characters.chars, characters.skin, characters.class, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.battlechar IS NOT NULL AND LENGTH(characters.class) > 2 AND LENGTH(dungeon.classlevels) > 2 ${scope === "server" ? `AND users.id IN (${servers.user_ids})`: ""}`);
                //               stats = stats.filter((e) => JSON.parse(e.classlevels)[JSON.parse(e.class)[e.battlechar]]);
                //               stats.sort((a, b) => JSON.parse(b.classlevels)[JSON.parse(b.class)[b.battlechar]] - JSON.parse(a.classlevels)[JSON.parse(a.class)[a.battlechar]]);
                //               showUsers = stats.map((e) => `${count++}) **${e.name}** - Level **${getClassLvl(JSON.parse(e.class)[e.battlechar], JSON.parse(e.classlevels))}** ${classes[JSON.parse(e.class)[e.battlechar]].emblem}` ); break;
                case "class": stats = await query(`SELECT users.name, users.id, users.favchar, users.battlechar, users.premium, characters.chars, characters.skin, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE LENGTH(dungeon.classlevels) > 2 ${scope === "server" ? `AND users.id IN (${servers.user_ids})`: ""}`);
                              stats.forEach((e) => [e.cl, e.clvl] = Object.entries(JSON.parse(e.classlevels)).reduce((max, curr) => curr[1] > max[1] ? curr : max, [-1, -Infinity]));
                              stats.sort((a, b) => b.clvl - a.clvl);
                              showUsers = stats.map((e) => `${count++}) **${e.name}** - Level **${getClassLvl(e.cl, JSON.parse(e.classlevels))}** ${classes[e.cl].emblem}` ); break;
                case "stampede": stats = await query(`SELECT users.name, users.id, users.coins, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})`: ""}`);
                                 const { 0: stampede } = await query(`SELECT participation FROM stampedes ORDER BY rowid DESC LIMIT 1`);
                                 stampede.participation = JSON.parse(stampede.participation);
                                 stats.forEach((e) => e.stampede = stampede.participation[e.id]);
                                 stats = stats.filter((e) => e.stampede);
                                 stats.sort((a, b) => b.stampede - a.stampede);
                                 showUsers = stats.map((e) => `${count++}) **${e.name}** - **${e.stampede}** damage` ); break;
                case "event": stats = await query(`SELECT users.name, users.id, users.eventpts, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id WHERE${scope === "server" ? ` users.id IN (${servers.user_ids}) AND`: ""} users.eventpts > 0 ORDER BY users.eventpts DESC`);
                              showUsers = stats.map((e) => `${count++}) **${e.name}** - **${e.eventpts}** 🌻` ); break;
                default: false; break;
            };

            if (!stats[0]) return interaction.editReply("Empty leaderboard");

            const topChars = (typeof stats[0].chars === "string") ? JSON.parse(stats[0].chars) : stats[0].chars;
            let thumbnail = characters[topChars[Math.floor(Math.random() * topChars.length)]]?.image || "https://i.ibb.co/jZ7fHSj/camelot.png";
            if (stats[0].favchar !== null) thumbnail = characters[stats[0].favchar].getImage(stats[0].premium, customSettings[interaction.user.id]?.cimg[stats[0].favchar], JSON.parse(stats[0].skin)[stats[0].favchar]);

            // Pages
            const pagesTotal = Math.ceil(stats.length / 15);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setTitle(`🏆 ${scope === "server" ? interaction.guild.name : "Camelot"} top players 🏆`)
            .setDescription(showPage(currPage, showUsers).join("\n"))
            .setThumbnail(thumbnail)
            .setFooter({text: `Page ${currPage}/${pagesTotal}`});
            if (pagesTotal === 1) return interaction.editReply({ embeds: [Embed] });
            interaction.editReply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {
                const collector = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 60000 });

                collector.on('collect', r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    Embed.setDescription(showPage(currPage, showUsers).join("\n")).setFooter({text: `Page ${currPage}/${pagesTotal}`});
                    interaction.editReply({ embeds: [Embed], components: [PageRow] });
                });

            });

        });

    },
};