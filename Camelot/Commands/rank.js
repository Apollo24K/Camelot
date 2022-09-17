const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { characters } = require("../Modules/chars.js");
const { getDetailedStats, baseHP, baseATK, baseDEF } = require("../Modules/functions.js");

/*
    Formula                         | P0 100  1  0  EP:   1.00
    HP₁ -= ATK₂*(0.99818)^DEF₁      | P1 300 30 30  EP:  95.05
    HP₂ -= ATK₁*(0.99818)^DEF₂      | P2 400 50 40  EP: 172.09

    HP -= ATK -> over time: HP/ATK₁(c)^0
    P1 Finishes in 3.33t
    P2 Finishes in 2.5t        (less is better)

    P1 Finished in 316.85t
    P2 Finished in 430.23t     (more is better)

    HP₁ -= 100*(0.99818)^DEF₁  -> HP₁/(1*(0.99818)^DEF₁)
    HP₂ -= 100*(0.99818)^DEF₂

    EP = d(HP₁)/dt / d(HP)/dt = (HP₁/(0.99818)^DEF₁)/(100/ATK₁) -> (HP*ATK)/c^DEF
*/

module.exports = {
	name: 'rank',
	description: 'rank characters',
	execute(interaction) {

        let scope = interaction.options.getString('scope');
        let page = interaction.options.getInteger('page');
        let user = interaction.options.getUser('user') || interaction.user;

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
        
        if (scope === "base") {

            let rok = new Map();
            characters.forEach((e) => {
                let hp = baseHP(e.id);
                let atk = baseATK(e.id);
                let def = baseDEF(e.id);
                let ep = Math.floor(((hp/Math.pow(0.99818,def)) / (200/atk))*100) / 100;
                rok.set(e.id, ep);
            });
            let rokS = new Map([...rok.entries()].sort((a, b) => b[1] - a[1]));

            sortedArr = [];
            let count = 1;
            rokS.forEach((val, key) => {
                let rokT = "";
                switch (characters[key].rarity) {
                    case "SS" : rokT = "<:SSTier:869316489931546644>"; break;
                    case "S" : rokT = "<:STier:869316518675095552>"; break;
                    case "A" : rokT = "<:ATier:869316558013464627>"; break;
                    case "B" : rokT = "<:BTier:869316586803179571>"; break;
                    case "C" : rokT = "<:CTier:869316602858991657>"; break;
                    case "D" : rokT = "<:DTier:869316616071032843>"; break;
                    default : rokT = ""; break;
                };
                sortedArr.push(`${rokT} ${count++}. ${characters[key].name} - EP: **${val}**`);
            });
            
            let pagesTotal = Math.ceil(sortedArr.length / 15);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };
            let left = sortedArr.length % 15;
            
            let showUsersF = [];
            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                showUsersF.push(sortedArr[i]);
            };
            
            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle(`Top Characters Ranking`)
            .setDescription(showUsersF.join("\n"))
            .setThumbnail(characters[[...rokS.keys()][0]]?.image || characters[Math.floor(Math.random * characters.length)])
            .setFooter(`Page ${currPage}/${pagesTotal}`);
            interaction.reply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {
                
                const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                prev.on('collect', async r => {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                    });

                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;

                    let showUsersF = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (i=(currPage-1)*15; i < currPage * 15; i++) {
                            showUsersF.push(sortedArr[i]);
                        };
                    } else {
                        for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            showUsersF.push(sortedArr[i]);
                        };
                    };
                    Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    msg.edit({ embeds: [Embed], components: [row] });
                });

                next.on('collect', async r => {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                    });

                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;

                    let showUsersF = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (i=(currPage-1)*15; i < currPage * 15; i++) {
                            showUsersF.push(sortedArr[i]);
                        };
                    } else {
                        for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            showUsersF.push(sortedArr[i]);
                        };
                    };
                    Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    msg.edit({ embeds: [Embed], components: [row] });
                });

            });
            return;
        };

        if (scope === "inventory") {
            db.serialize(async () => {
                var inv = await query(`SELECT characters.chars, characters.ref, characters.level, characters.class, dungeon.classlevels FROM characters JOIN dungeon ON characters.id = dungeon.id WHERE characters.id = ${user.id}`);
                if (!inv[0]) return interaction.reply(`${user.username} hasn't started playing yet.`);
                inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref), level: JSON.parse(inv[0].level), class: JSON.parse(inv[0].class), classlevels: JSON.parse(inv[0].classlevels)};
                
                let uniq = [...new Set(inv.chars)];

                let rok = new Map();
                uniq.forEach((e) => rok.set(e, getDetailedStats(e, inv, inv.classlevels).ep));
                let rokS = new Map([...rok.entries()].sort((a, b) => b[1] - a[1]));

                sortedArr = [];
                let count = 1;
                rokS.forEach((val, key) => {
                    let rokT = "";
                    switch (characters[key].rarity) {
                        case "SS" : rokT = "<:SSTier:869316489931546644>"; break;
                        case "S" : rokT = "<:STier:869316518675095552>"; break;
                        case "A" : rokT = "<:ATier:869316558013464627>"; break;
                        case "B" : rokT = "<:BTier:869316586803179571>"; break;
                        case "C" : rokT = "<:CTier:869316602858991657>"; break;
                        case "D" : rokT = "<:DTier:869316616071032843>"; break;
                        default : rokT = ""; break;
                    };
                    sortedArr.push(`${rokT} ${count++}. ${characters[key].name} - EP: **${val}**`);
                });
                
                let pagesTotal = Math.ceil(sortedArr.length / 15);
                let currPage = 1;
                if (page <= pagesTotal && page > 0) {
                    currPage = page;
                };
                let left = sortedArr.length % 15;

                let showUsersF = [];
                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                    showUsersF.push(sortedArr[i]);
                };

                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setTitle(`Your top characters`)
                .setDescription(showUsersF.join("\n"))
                .setThumbnail(characters[[...rokS.keys()][0]]?.image || characters[Math.floor(Math.random * characters.length)])
                .setFooter(`Page ${currPage}/${pagesTotal}`);
                if (sortedArr.length < 16) return interaction.reply({ embeds: [Embed] });
                interaction.reply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {
                    
                    const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                    const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                    prev.on('collect', async r => {
                        await r.deferUpdate().catch((err) => {
                            console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                        });

                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;

                        let showUsersF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        };
                        Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit({ embeds: [Embed], components: [row] });
                    });

                    next.on('collect', async r => {
                        await r.deferUpdate().catch((err) => {
                            console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                        });

                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;

                        let showUsersF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        };
                        Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit({ embeds: [Embed], components: [row] });
                    });

                });
                
            });
            return;
        };

        if (scope === "server" || scope === "global") {
            db.serialize(async () => {
                let servers;
                if (scope === "server") {
                    servers = await query(`SELECT user_ids FROM servers WHERE id = ${interaction.guild.id}`);
                    servers = servers[0];
                };

                stats = await query(`SELECT users.name, characters.chars, characters.ref, characters.level, characters.class, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})` : ""}`);

                let rok = {};
                stats.forEach((e) => {
                    e.chars = JSON.parse(e.chars), e.ref = JSON.parse(e.ref), e.level = JSON.parse(e.level), e.class = JSON.parse(e.class), e.classlevels = JSON.parse(e.classlevels)
                    let uniq = [...new Set(e.chars)];
                    uniq.forEach((u) => {
                        let cstats = getDetailedStats(u, e, e.classlevels);
                        if (cstats.ep >= 100) rok[`${e.name} |cmlt,cqkl| ${u}`] = cstats.ep;
                    });
                });

                if (!Object.keys(rok).length) return interaction.reply("The top list is currently empty.");
                
                let sortedArr = [];
                let rokS = Object.keys(rok).sort((a, b) => rok[b] - rok[a]);
                let rarities = {"SS": "<:SSTier:869316489931546644>", "S": "<:STier:869316518675095552>", "A": "<:ATier:869316558013464627>", "B": "<:BTier:869316586803179571>", "C": "<:CTier:869316602858991657>", "D": "<:DTier:869316616071032843>"};
                for (i=0; i < rokS.length; i++) {
                    sortedArr.push(`${rarities[characters[rokS[i].split(" |cmlt,cqkl| ")[1]].rarity]} ${i+1}. **${characters[rokS[i].split(" |cmlt,cqkl| ")[1]].name}** - EP: ${rok[rokS[i]]} => ${rokS[i].split(" |cmlt,cqkl| ")[0]}`);
                };
                
                let pagesTotal = Math.ceil(sortedArr.length / 15);
                let currPage = 1;
                if (page <= pagesTotal && page > 0) {
                    currPage = page;
                };
                let left = sortedArr.length % 15;
                
                let showUsersF = [];
                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                    showUsersF.push(sortedArr[i]);
                };
        
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setTitle(`🏆 ${scope === "server" ? interaction.guild.name : "Camelot"} top characters 🏆`)
                .setDescription(showUsersF.join("\n"))
                .setThumbnail(characters[rokS[0].split(" |cmlt,cqkl| ")[1]].image)
                .setFooter(`Page ${currPage}/${pagesTotal}`);
                interaction.reply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {
                    
                    const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                    const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });
    
                    prev.on('collect', async r => {
                        await r.deferUpdate().catch((err) => {
                            console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                        });

                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;

                        let showUsersF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        };
                        
                        Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit({ embeds: [Embed], components: [row] });
                    });
    
                    next.on('collect', async r => {
                        await r.deferUpdate().catch((err) => {
                            console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                        });

                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;

                        let showUsersF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        };

                        Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit({ embeds: [Embed], components: [row] });
                    });
        
                });
            });
            return;
        };


        db.serialize(async () => {
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

            let thumbnail = characters[JSON.parse(stats[0].chars)[Math.floor(Math.random() * JSON.parse(stats[0].chars).length)]].image;
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
            if (stats.length < 16) return interaction.reply({ embeds: [Embed] });
            interaction.reply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {

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
                    msg.edit({ embeds: [Embed], components: [row] });
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
                    msg.edit({ embeds: [Embed], components: [row] });
                });

            });

        });

    },
};