/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { characters } = require("../Modules/chars.js");
const { getDetailedStats, baseHP, baseATK, baseDEF, userLevel } = require("../Modules/functions.js");

/*
    Formula                         | P0 100  1  0  EP:   1.00
    HP₁ -= ATK₂*(0.99895)^DEF₁      | P1 300 30 30  EP:  95.05
    HP₂ -= ATK₁*(0.99895)^DEF₂      | P2 400 50 40  EP: 172.09

    HP -= ATK -> over time: HP/ATK₁(c)^0
    P1 Finishes in 3.33t
    P2 Finishes in 2.5t        (less is better)

    P1 Finished in 316.85t
    P2 Finished in 430.23t     (more is better)

    HP₁ -= 100*(0.99895)^DEF₁  -> HP₁/(1*(0.99895)^DEF₁)
    HP₂ -= 100*(0.99895)^DEF₂

    EP = d(HP₁)/dt / d(HP)/dt = (HP₁/(0.99895)^DEF₁)/(100/ATK₁) -> (HP*ATK)/c^DEF
*/

module.exports = {
	name: 'rank',
	description: 'rank characters',
	execute(interaction) {

        let customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

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
                let ep = Math.floor(((1/0.9)*(hp/Math.pow(0.99895,def)) / (200/(atk*(1+(0.18*0.25)))))*100) / 100;
                // Math.floor(((hp/Math.pow(0.99895,def)) / (200/atk))*100) / 100;
                rok.set(e.id, ep);
            });
            let rokS = new Map([...rok.entries()].sort((a, b) => b[1] - a[1]));

            let sortedArr = [];
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
            for (let i=(currPage-1)*15; i < currPage * 15; i++) {
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
                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;

                    let showUsersF = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (let i=(currPage-1)*15; i < currPage * 15; i++) {
                            showUsersF.push(sortedArr[i]);
                        };
                    } else {
                        for (let i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            showUsersF.push(sortedArr[i]);
                        };
                    };
                    Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    msg.edit({ embeds: [Embed], components: [row] });
                });

                next.on('collect', async r => {
                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;

                    let showUsersF = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (let i=(currPage-1)*15; i < currPage * 15; i++) {
                            showUsersF.push(sortedArr[i]);
                        };
                    } else {
                        for (let i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
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
                let inv = await query(`SELECT characters.chars, characters.ref, characters.level, characters.class, characters.equipment, dungeon.classlevels FROM characters JOIN dungeon ON characters.id = dungeon.id WHERE characters.id = ${user.id}`);
                if (!inv[0]) return interaction.reply(`${user.username} hasn't started playing yet.`);
                inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref), level: JSON.parse(inv[0].level), class: JSON.parse(inv[0].class), equipment: JSON.parse(inv[0].equipment), classlevels: JSON.parse(inv[0].classlevels)};
                
                let uniq = [...new Set(inv.chars)];

                let rok = new Map();
                for (let i=0; i < uniq.length; i++) {
                    let bStats = await getDetailedStats(uniq[i], inv, inv.classlevels);
                    rok.set(uniq[i], bStats.ep);
                };
                // uniq.forEach((e) => rok.set(e, getDetailedStats(e, inv, inv.classlevels).ep));
                let rokS = new Map([...rok.entries()].sort((a, b) => b[1] - a[1]));

                let sortedArr = [];
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
                for (let i=(currPage-1)*15; i < currPage * 15; i++) {
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
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;

                        let showUsersF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (let i=(currPage-1)*15; i < currPage * 15; i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        } else {
                            for (let i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        };
                        Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit({ embeds: [Embed], components: [row] });
                    });

                    next.on('collect', async r => {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;

                        let showUsersF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (let i=(currPage-1)*15; i < currPage * 15; i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        } else {
                            for (let i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
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

                let stats = await query(`SELECT users.name, characters.chars, characters.ref, characters.level, characters.class, characters.equipment, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})` : ""}`);

                let rok = {};
                for (let i=0; i < stats.length; i++) {
                    stats[i].chars = JSON.parse(stats[i].chars), stats[i].ref = JSON.parse(stats[i].ref), stats[i].level = JSON.parse(stats[i].level), stats[i].class = JSON.parse(stats[i].class), stats[i].classlevels = JSON.parse(stats[i].classlevels), stats[i].equipment = JSON.parse(stats[i].equipment);
                    let uniq = [...new Set(stats[i].chars)];
                    for (let j=0; j < uniq.length; j++) {
                        let cstats = await getDetailedStats(uniq[j], stats[i], stats[i].classlevels);
                        if (cstats.ep >= 100) rok[`${stats[i].name} |cmlt,cqkl| ${uniq[j]}`] = cstats.ep;
                    };
                };

                if (!Object.keys(rok).length) return interaction.reply("The top list is currently empty.");
                
                let sortedArr = [];
                let rokS = Object.keys(rok).sort((a, b) => rok[b] - rok[a]);
                let rarities = {"SS": "<:SSTier:869316489931546644>", "S": "<:STier:869316518675095552>", "A": "<:ATier:869316558013464627>", "B": "<:BTier:869316586803179571>", "C": "<:CTier:869316602858991657>", "D": "<:DTier:869316616071032843>"};
                for (let i=0; i < rokS.length; i++) {
                    sortedArr.push(`${rarities[characters[rokS[i].split(" |cmlt,cqkl| ")[1]].rarity]} ${i+1}. **${characters[rokS[i].split(" |cmlt,cqkl| ")[1]].name}** - EP: ${rok[rokS[i]]} => ${rokS[i].split(" |cmlt,cqkl| ")[0]}`);
                };
                
                let pagesTotal = Math.ceil(sortedArr.length / 15);
                let currPage = 1;
                if (page <= pagesTotal && page > 0) {
                    currPage = page;
                };
                let left = sortedArr.length % 15;
                
                let showUsersF = [];
                for (let i=(currPage-1)*15; i < currPage * 15; i++) {
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
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;

                        let showUsersF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (let i=(currPage-1)*15; i < currPage * 15; i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        } else {
                            for (let i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        };
                        
                        Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit({ embeds: [Embed], components: [row] });
                    });
    
                    next.on('collect', async r => {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;

                        let showUsersF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (let i=(currPage-1)*15; i < currPage * 15; i++) {
                                showUsersF.push(sortedArr[i]);
                            };
                        } else {
                            for (let i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
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

    },
};