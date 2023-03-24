/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { characters } = require("../Modules/chars.js");
const { userLevel, getClassLvl, showPage } = require("../Modules/functions.js");
const { classes } = require("../Modules/classes.js");
const { PageRow } = require("../Modules/components.js");

module.exports = {
	name: 'top',
	description: 'rank players',
	execute(interaction) {

        let customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        let page = interaction.options.getInteger('page');
        let flag = interaction.options.getString('flag');
        let scope = interaction.options.getString('scope');
        
        db.serialize(async () => {
            await interaction.deferReply().catch((err) => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });

            let servers;
            if (scope === "server") {
                servers = await query(`SELECT user_ids FROM servers WHERE id = ${interaction.guild.id}`);
                servers = servers[0];
            };

            let stats; // = await query(`SELECT users.name, users.id, users.xp, users.favchar, users.lilies, users.pullstotal, users.achievements, users.premium, characters.chars, dungeon.floors, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""}`);
            let count = 1;
            let showUsers;
            switch (flag) {
                case "level": stats = await query(`SELECT users.name, users.id, users.xp, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""} ORDER BY users.xp DESC`);
                              showUsers = stats.map((e) => `${count++}. **${e.name}** - Level **${userLevel(e.xp)}**` ); break;
                case "pulls": stats = await query(`SELECT users.name, users.id, users.pullstotal, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""} ORDER BY users.pullstotal DESC`);
                              showUsers = stats.map((e) => `${count++}. **${e.name}** - **${e.pullstotal}** pulls` ); break;
                case "chars": stats = await query(`SELECT users.name, users.id, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""}`);
                              stats.sort((a, b) => new Set(JSON.parse(b.chars)).size - new Set(JSON.parse(a.chars)).size);
                              showUsers = stats.map((e) => `${count++}. **${e.name}** - has **${new Set(JSON.parse(e.chars)).size}** characters` ); break;
                case "progress": stats = await query(`SELECT users.name, users.id, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""}`);
                                 stats.sort((a, b) => new Set(JSON.parse(b.chars)).size - new Set(JSON.parse(a.chars)).size);
                                 showUsers = stats.map((e) => `${count++}. **${e.name}** - has completed **${Math.floor((new Set(JSON.parse(e.chars)).size/characters.length)*1000)/10}%**` ); break;
                case "anime": stats = await query(`SELECT users.name, users.id, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""}`);
                              stats.sort((a, b) => [... new Set(JSON.parse(b.chars).map((e) => characters[e].anime))].filter((e) => [...new Set(JSON.parse(b.chars))].filter((t) => characters[t].anime === e).length === characters.filter((t) => t.anime === e).length).length - [... new Set(JSON.parse(a.chars).map((e) => characters[e].anime))].filter((e) => [...new Set(JSON.parse(a.chars))].filter((t) => characters[t].anime === e).length === characters.filter((t) => t.anime === e).length).length);
                              showUsers = stats.map((e) => `${count++}. **${e.name}** - has completed **${[... new Set(JSON.parse(e.chars).map((a) => characters[a].anime))].filter((a) => [...new Set(JSON.parse(e.chars))].filter((t) => characters[t].anime === a).length === characters.filter((t) => t.anime === a).length).length}** anime` ); break;
                case "lilies": stats = await query(`SELECT users.name, users.id, users.lilies, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""} ORDER BY users.lilies DESC`);
                               showUsers = stats.map((e) => `${count++}. **${e.name}** - **${e.lilies}** <:lilium:974057059618291732>` ); break;
                case "achievements": stats = await query(`SELECT users.name, users.id, users.achievements, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""}`);
                                     stats.sort((a, b) => JSON.parse(b.achievements).length - JSON.parse(a.achievements).length);
                                     showUsers = stats.map((e) => `${count++}. **${e.name}** - has completed **${JSON.parse(e.achievements).length}** achievements` ); break;
                case "dungeon": stats = await query(`SELECT users.name, users.id, users.favchar, users.premium, characters.chars, characters.skin, dungeon.floors FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""} ORDER BY LENGTH(dungeon.floors) - LENGTH(REPLACE(dungeon.floors,',','')) DESC`);
                                showUsers = stats.map((e) => `${count++}. **${e.name}** - Floor **${e.floors.split(",").length}**` ); break;
                case "coins": stats = await query(`SELECT users.name, users.id, users.coins, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})`: ""} ORDER BY users.coins DESC`);
                              showUsers = stats.map((e) => `${count++}. **${e.name}** - **${e.coins}** <:coins:872926669055356939>` ); break;
                case "class": stats = await query(`SELECT users.name, users.id, users.favchar, users.battlechar, users.premium, characters.chars, characters.skin, characters.class, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.battlechar IS NOT NULL AND LENGTH(characters.class) > 2 AND LENGTH(dungeon.classlevels) > 2 ${scope === "server" ? `AND users.rowid IN (${servers.user_ids})`: ""}`);
                              stats = stats.filter((e) => JSON.parse(e.classlevels)[JSON.parse(e.class)[e.battlechar]]);
                              stats.sort((a, b) => JSON.parse(b.classlevels)[JSON.parse(b.class)[b.battlechar]] - JSON.parse(a.classlevels)[JSON.parse(a.class)[a.battlechar]]);
                              showUsers = stats.map((e) => `${count++}. **${e.name}** - Level **${getClassLvl(JSON.parse(e.class)[e.battlechar], JSON.parse(e.classlevels))}** ${classes[JSON.parse(e.class)[e.battlechar]].emblem}` ); break;
                case "event": stats = await query(`SELECT users.name, users.id, users.eventpts, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id WHERE${scope === "server" ? ` users.rowid IN (${servers.user_ids}) AND`: ""} users.eventpts > 0 ORDER BY users.eventpts DESC`);
                              showUsers = stats.map((e) => `${count++}. **${e.name}** - **${e.eventpts}** ❄️` ); break;
                default: false; break;
            };

            if (!stats[0]) interaction.editReply("Empty leaderboard");

            let thumbnail = characters[JSON.parse(stats[0].chars)[Math.floor(Math.random() * JSON.parse(stats[0].chars).length)]]?.image || "https://i.ibb.co/jZ7fHSj/camelot.png";
            if (stats[0].favchar !== null) thumbnail = characters[stats[0].favchar].getImage(stats[0].premium, customSettings[interaction.user.id]?.cimg[stats[0].favchar], JSON.parse(stats[0].skin)[stats[0].favchar]);

            // Pages
            let pagesTotal = Math.ceil(stats.length / 15);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };
            let left = stats.length % 15;

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle(`🏆 ${scope === "server" ? interaction.guild.name : "Camelot"} top players 🏆`)
            .setDescription(showPage(currPage, pagesTotal, left, showUsers).join("\n"))
            .setThumbnail(thumbnail)
            .setFooter(`Page ${currPage}/${pagesTotal}`);
            if (pagesTotal === 1) return interaction.editReply({ embeds: [Embed] });
            interaction.editReply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {

                const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 60000 });
                const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 60000 });

                prev.on('collect', async r => {
                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;

                    Embed.setDescription(showPage(currPage, pagesTotal, left, showUsers).join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [PageRow] });
                });

                next.on('collect', async r => {
                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;

                    Embed.setDescription(showPage(currPage, pagesTotal, left, showUsers).join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [PageRow] });
                });

            });

        });

    },
};