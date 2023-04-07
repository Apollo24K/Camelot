/* eslint-disable no-unused-vars */
const { MessageEmbed } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { characters } = require("../Modules/chars.js");
const { getDetailedStats, showPage, baseEP } = require("../Modules/functions.js");
const { PageRow } = require("../Modules/components.js");

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

        let scope = interaction.options.getString('scope');
        let page = interaction.options.getInteger('page');
        const user = interaction.options.getUser('user') || interaction.user;

        if (scope === "base") {

            let rok = new Map();
            characters.forEach((e) => rok.set(e.id, baseEP(e.id)) );
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
            interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {
                
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
                    msg.edit({ embeds: [Embed], components: [PageRow] });
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
                    msg.edit({ embeds: [Embed], components: [PageRow] });
                });

            });
            return;
        };

        if (scope === "inventory") {
            db.serialize(async () => {
                let inv = await query(`SELECT characters.chars, characters.ref, characters.level, characters.class, characters.equipment, dungeon.classlevels FROM characters JOIN dungeon ON characters.id = dungeon.id WHERE characters.id = ${user.id}`);
                if (!inv[0]) return interaction.reply(`${user.username} hasn't started playing yet.`);
                inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref), level: JSON.parse(inv[0].level), class: JSON.parse(inv[0].class), equipment: JSON.parse(inv[0].equipment), classlevels: JSON.parse(inv[0].classlevels)};
                
                const uniq = [...new Set(inv.chars)];

                const rok = new Map();
                for (const id of uniq) {
                    const bStats = await getDetailedStats(id, inv, inv.classlevels);
                    rok.set(id, bStats.ep);
                };
                const rokS = new Map([...rok.entries()].sort((a, b) => b[1] - a[1]));

                const rarities = {"SS": "<:SSTier:869316489931546644>", "S": "<:STier:869316518675095552>", "A": "<:ATier:869316558013464627>", "B": "<:BTier:869316586803179571>", "C": "<:CTier:869316602858991657>", "D": "<:DTier:869316616071032843>"};
                let sortedArr = [];
                let count = 1;
                rokS.forEach((val, key) => {
                    sortedArr.push(`${rarities[characters[key].rarity]} ${count++}. ${characters[key].name} - EP: **${val}**`);
                });
                
                const elementsPerPage = 15;
                const pagesTotal = Math.ceil(sortedArr.length / elementsPerPage);
                let currPage = 1;
                if (page <= pagesTotal && page > 0) {
                    currPage = page;
                };
                const left = sortedArr.length % elementsPerPage;

                // Filter items to show on the current page
                let showUsersF = showPage(currPage, pagesTotal, left, sortedArr, elementsPerPage);

                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setTitle(`Your top characters`)
                .setDescription(showUsersF.join("\n"))
                .setThumbnail(characters[[...rokS.keys()][0]]?.image || characters[Math.floor(Math.random * characters.length)])
                .setFooter(`Page ${currPage}/${pagesTotal}`);
                if (pagesTotal === 1) return interaction.reply({ embeds: [Embed] });
                return interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {
                    
                    const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                    const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                    prev.on('collect', async r => {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;

                        showUsersF = showPage(currPage, pagesTotal, left, sortedArr, elementsPerPage);

                        Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit({ embeds: [Embed], components: [PageRow] });
                    });

                    next.on('collect', async r => {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;

                        showUsersF = showPage(currPage, pagesTotal, left, sortedArr, elementsPerPage);

                        Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit({ embeds: [Embed], components: [PageRow] });
                    });

                });
                
            });
            return;
        };

        if (scope === "server" || scope === "global") {
            db.serialize(async () => {
                const { 0: servers } = await query(`SELECT user_ids FROM servers WHERE id = ${interaction.guild.id}`);
                const stats = await query(`SELECT users.name, characters.chars, characters.ref, characters.level, characters.class, characters.equipment, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id ${scope === "server" ? `WHERE users.rowid IN (${servers.user_ids})` : ""}`);

                const rok = new Map();
                for (const account of stats) {
                    account.chars = JSON.parse(account.chars), account.ref = JSON.parse(account.ref), account.level = JSON.parse(account.level), account.class = JSON.parse(account.class), account.classlevels = JSON.parse(account.classlevels), account.equipment = JSON.parse(account.equipment);
                    const uniq = [...new Set(account.chars)];
                    for (const id of uniq) {
                        if (account.level[id]) {
                            const cstats = await getDetailedStats(id, account, account.classlevels);
                            rok.set(`${account.name} |cmlt,cqkl| ${id}`, cstats.ep);
                        };
                    };
                };

                if (rok.size === 0) return interaction.reply("The top list is currently empty.");
                
                let sortedArr = [];
                const rokS = new Map([...rok.entries()].sort((a, b) => b[1] - a[1]));
                const rarities = {"SS": "<:SSTier:869316489931546644>", "S": "<:STier:869316518675095552>", "A": "<:ATier:869316558013464627>", "B": "<:BTier:869316586803179571>", "C": "<:CTier:869316602858991657>", "D": "<:DTier:869316616071032843>"};
                let count = 1;
                rokS.forEach((val, key) => {
                    sortedArr.push(`${rarities[characters[key.split(" |cmlt,cqkl| ")[1]].rarity]} ${count++}. **${characters[key.split(" |cmlt,cqkl| ")[1]].name}** - EP: ${val} => ${key.split(" |cmlt,cqkl| ")[0]}`);
                });
                
                const elementsPerPage = 15;
                const pagesTotal = Math.ceil(sortedArr.length / elementsPerPage);
                let currPage = 1;
                if (page <= pagesTotal && page > 0) {
                    currPage = page;
                };
                const left = sortedArr.length % elementsPerPage;
                
                // Filter items to show on the current page
                let showUsersF = showPage(currPage, pagesTotal, left, sortedArr, elementsPerPage);
                
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setTitle(`🏆 ${scope === "server" ? interaction.guild.name : "Camelot"} top characters 🏆`)
                .setDescription(showUsersF.join("\n"))
                .setThumbnail(characters[[...rokS.keys()][0].split(" |cmlt,cqkl| ")[1]]?.image)
                .setFooter(`Page ${currPage}/${pagesTotal}`);
                return interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {
                    
                    const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                    const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });
    
                    prev.on('collect', async r => {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;

                        showUsersF = showPage(currPage, pagesTotal, left, sortedArr, elementsPerPage);
                                                
                        Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit({ embeds: [Embed], components: [PageRow] });
                    });
    
                    next.on('collect', async r => {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;

                        showUsersF = showPage(currPage, pagesTotal, left, sortedArr, elementsPerPage);

                        Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit({ embeds: [Embed], components: [PageRow] });
                    });
        
                });
            });
            return;
        };

    },
};