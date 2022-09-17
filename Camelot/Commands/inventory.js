var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { characters, auniq } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");
const { searchAnime, splitTitle, rarity } = require("../Modules/functions.js");

module.exports = {
    name: 'inventory',
	description: 'Search an anime',
	execute(interaction) {

        let user = interaction.options.getUser('user') || interaction.user;
        let page = interaction.options.getInteger('page');
        let sort = interaction.options.getString('sort');

        var customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        
        db.serialize(async () => {
            await interaction.deferReply().catch((err) => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });
            
            var stats = await query(`SELECT favchar, premium FROM users WHERE id = ${user.id}`);
            stats = stats[0];
            if (!stats) return interaction.editReply(`${user.id === interaction.user.id ? "You don't have any" : `**${user.username}** has no`} characters.`);

            var inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
            inv = {chars: JSON.parse(inv[0].chars)};

            let uniq = [...new Set(inv.chars)];
            let chars = uniq.map((e) => characters[e].name);
            if (sort === "alphabetical") chars.sort();

            let pagesTotal = Math.ceil(uniq.length / 15);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            let thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image;
            if (stats.favchar !== null) {
                thumbnail = characters[stats.favchar].image;
                if (stats.premium > 3) if (customSettings[user.id] && customSettings[user.id].cimg[stats.favchar]) thumbnail = customSettings[user.id].cimg[stats.favchar];
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

            if (sort === "rarity" || sort === "dupes") {

                if (sort === "dupes") {
                    for (i=uniq.length-1; i >= 0; i--) {
                        if (inv.chars.filter((e) => e === uniq[i]).length === 1) {
                            uniq.splice(uniq.indexOf(uniq[i]), 1);
                        };
                    };
                    if (uniq.length < 1) return interaction.editReply(`${user.id === interaction.user.id ? "You don't": `**${user.username}** doesn't`} have any duplicates`);
                    pagesTotal = Math.ceil(uniq.length / 15);
                    currPage = 1;
                    if (page <= pagesTotal && page > 0) {
                        currPage = page;
                    };
                };

                let charsR = uniq.map((e) => characters[e]);

                let ssChars = charsR.filter((b) => b.rarity === "SS");
                let sChars = charsR.filter((b) => b.rarity === "S");
                let aChars = charsR.filter((b) => b.rarity === "A");
                let bChars = charsR.filter((b) => b.rarity === "B");
                let cChars = charsR.filter((b) => b.rarity === "C");
                let dChars = charsR.filter((b) => b.rarity === "D");

                if (sort === "dupes") {
                    ssChars.sort((a, b) => inv.chars.filter((e) => e === b.id).length - inv.chars.filter((e) => e === a.id).length);
                    sChars.sort((a, b) => inv.chars.filter((e) => e === b.id).length - inv.chars.filter((e) => e === a.id).length);
                    aChars.sort((a, b) => inv.chars.filter((e) => e === b.id).length - inv.chars.filter((e) => e === a.id).length);
                    bChars.sort((a, b) => inv.chars.filter((e) => e === b.id).length - inv.chars.filter((e) => e === a.id).length);
                    cChars.sort((a, b) => inv.chars.filter((e) => e === b.id).length - inv.chars.filter((e) => e === a.id).length);
                    dChars.sort((a, b) => inv.chars.filter((e) => e === b.id).length - inv.chars.filter((e) => e === a.id).length);
                };

                function tierNamesInv(t, arr) {
                    if (sort === "dupes") {
                        let dupes = 0;
                        for (h=0; h < t.length; h++) {
                            dupes = inv.chars.filter((e) => e === t[h].id).length;
                            arr.push(t[h].name + ` | **x${dupes}**`);
                        };
                        // arr.sort((a, b) => b.match(/\d+(?=\D*$)/)[0] - a.match(/\d+(?=\D*$)/)[0]);
                    } else {
                        for (h=0; h < t.length; h++) {
                            arr.push(t[h].name);
                        };
                    };
                    return arr;
                };

                let ssCharsN = [];
                let sCharsN = [];
                let aCharsN = [];
                let bCharsN = [];
                let cCharsN = [];
                let dCharsN = [];

                let desc = "";
                
                if (ssChars[0]) desc += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNamesInv(ssChars, ssCharsN).join("\n> ");
                if (sChars[0]) desc += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNamesInv(sChars, sCharsN).join("\n> ");
                if (aChars[0]) desc += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNamesInv(aChars, aCharsN).join("\n> ");
                if (bChars[0]) desc += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNamesInv(bChars, bCharsN).join("\n> ");
                if (cChars[0]) desc += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNamesInv(cChars, cCharsN).join("\n> ");
                if (dChars[0]) desc += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNamesInv(dChars, dCharsN).join("\n> ");

                let allChars = ssChars.concat(sChars).concat(aChars).concat(bChars).concat(cChars).concat(dChars);

                if (uniq.length < 16) {
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                    .setThumbnail(thumbnail)
                    .setDescription(desc)
                    .setFooter(`Page 1/1`)
                    interaction.editReply({ embeds: [Embed] });
                } else {
                    let left = uniq.length % 15;
                    let showChars = [];
                    if (currPage < pagesTotal) {
                        for (i=(currPage-1)*15; i < currPage * 15; i++) {
                            showChars.push(allChars[i]);
                        };
                    } else {
                        for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            showChars.push(allChars[i]);
                        };
                    };

                    let ssFiltered = showChars.filter((b) => b.rarity === "SS");
                    let sFiltered = showChars.filter((b) => b.rarity === "S");
                    let aFiltered = showChars.filter((b) => b.rarity === "A");
                    let bFiltered = showChars.filter((b) => b.rarity === "B");
                    let cFiltered = showChars.filter((b) => b.rarity === "C");
                    let dFiltered = showChars.filter((b) => b.rarity === "D");

                    let ssFiltrN = [];
                    let sFiltrN = [];
                    let aFiltrN = [];
                    let bFiltrN = [];
                    let cFiltrN = [];
                    let dFiltrN = [];

                    let description = "";

                    if (ssFiltered.length > 0) description += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNamesInv(ssFiltered, ssFiltrN).join("\n> ");
                    if (sFiltered.length > 0) description += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNamesInv(sFiltered, sFiltrN).join("\n> ");
                    if (aFiltered.length > 0) description += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNamesInv(aFiltered, aFiltrN).join("\n> ");
                    if (bFiltered.length > 0) description += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNamesInv(bFiltered, bFiltrN).join("\n> ");
                    if (cFiltered.length > 0) description += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNamesInv(cFiltered, cFiltrN).join("\n> ");
                    if (dFiltered.length > 0) description += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNamesInv(dFiltered, dFiltrN).join("\n> ");

                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                    .setThumbnail(thumbnail)
                    .setDescription(description)
                    .setFooter(`Page ${currPage}/${pagesTotal}`)
                    interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {

                        const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                        const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });
    
                        prev.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                            });

                            if (currPage > 1) currPage--;
                            else currPage = pagesTotal;

                            let showChars = [];
                            if (currPage < pagesTotal || left === 0) {
                                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                    showChars.push(allChars[i]);
                                };
                            } else {
                                for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                    showChars.push(allChars[i]);
                                };
                            };

                            let ssFiltered = showChars.filter((b) => b.rarity === "SS");
                            let sFiltered = showChars.filter((b) => b.rarity === "S");
                            let aFiltered = showChars.filter((b) => b.rarity === "A");
                            let bFiltered = showChars.filter((b) => b.rarity === "B");
                            let cFiltered = showChars.filter((b) => b.rarity === "C");
                            let dFiltered = showChars.filter((b) => b.rarity === "D");
        
                            let ssFiltrN = [];
                            let sFiltrN = [];
                            let aFiltrN = [];
                            let bFiltrN = [];
                            let cFiltrN = [];
                            let dFiltrN = [];
        
                            let description = "";
        
                            if (ssFiltered.length > 0) description += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNamesInv(ssFiltered, ssFiltrN).join("\n> ");
                            if (sFiltered.length > 0) description += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNamesInv(sFiltered, sFiltrN).join("\n> ");
                            if (aFiltered.length > 0) description += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNamesInv(aFiltered, aFiltrN).join("\n> ");
                            if (bFiltered.length > 0) description += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNamesInv(bFiltered, bFiltrN).join("\n> ");
                            if (cFiltered.length > 0) description += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNamesInv(cFiltered, cFiltrN).join("\n> ");
                            if (dFiltered.length > 0) description += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNamesInv(dFiltered, dFiltrN).join("\n> ");
                            Embed.setDescription(description).setFooter(`Page ${currPage}/${pagesTotal}`);
                            interaction.editReply({ embeds: [Embed], components: [row] });
                        });

                        next.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                            });

                            if (currPage < pagesTotal) currPage++;
                            else currPage = 1;

                            let showChars = [];
                            if (currPage < pagesTotal || left === 0) {
                                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                    showChars.push(allChars[i]);
                                };
                            } else {
                                for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                    showChars.push(allChars[i]);
                                };
                            };

                            let ssFiltered = showChars.filter((b) => b.rarity === "SS");
                            let sFiltered = showChars.filter((b) => b.rarity === "S");
                            let aFiltered = showChars.filter((b) => b.rarity === "A");
                            let bFiltered = showChars.filter((b) => b.rarity === "B");
                            let cFiltered = showChars.filter((b) => b.rarity === "C");
                            let dFiltered = showChars.filter((b) => b.rarity === "D");
        
                            let ssFiltrN = [];
                            let sFiltrN = [];
                            let aFiltrN = [];
                            let bFiltrN = [];
                            let cFiltrN = [];
                            let dFiltrN = [];
        
                            let description = "";
        
                            if (ssFiltered.length > 0) description += "\n\n<:SSTier:869316489931546644> **Tier**\n> " + tierNamesInv(ssFiltered, ssFiltrN).join("\n> ");
                            if (sFiltered.length > 0) description += "\n\n<:STier:869316518675095552> **Tier**\n> " + tierNamesInv(sFiltered, sFiltrN).join("\n> ");
                            if (aFiltered.length > 0) description += "\n\n<:ATier:869316558013464627> **Tier**\n> " + tierNamesInv(aFiltered, aFiltrN).join("\n> ");
                            if (bFiltered.length > 0) description += "\n\n<:BTier:869316586803179571> **Tier**\n> " + tierNamesInv(bFiltered, bFiltrN).join("\n> ");
                            if (cFiltered.length > 0) description += "\n\n<:CTier:869316602858991657> **Tier**\n> " + tierNamesInv(cFiltered, cFiltrN).join("\n> ");
                            if (dFiltered.length > 0) description += "\n\n<:DTier:869316616071032843> **Tier**\n> " + tierNamesInv(dFiltered, dFiltrN).join("\n> ");
                            Embed.setDescription(description).setFooter(`Page ${currPage}/${pagesTotal}`);
                            interaction.editReply({ embeds: [Embed], components: [row] });
                        });
                        
                    });
                };
                return;
            };

            if (uniq.length < 16) {
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                .setThumbnail(thumbnail)
                .setDescription(chars.join('\n'))
                .setFooter(`Page 1/1`)
                interaction.editReply({ embeds: [Embed] });
            } else {
                let left = uniq.length % 15;
                let showChars = [];
                if (currPage < pagesTotal) {
                    for (i=(currPage-1)*15; i < currPage * 15; i++) {
                        showChars.push(chars[i]);
                    };
                } else {
                    for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                        showChars.push(chars[i]);
                    };
                };
                
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                .setThumbnail(thumbnail)
                .setDescription(showChars.join('\n'))
                .setFooter(`Page ${currPage}/${pagesTotal}`)
                interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {

                    const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                    const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                    prev.on('collect', async r => {
                        await r.deferUpdate().catch((err) => {
                            console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                        });

                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;

                        let showChars = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showChars.push(chars[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showChars.push(chars[i]);
                            };
                        };
                        Embed.setDescription(showChars.join('\n')).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [row] });
                    });
                      
                    next.on('collect', async r => {
                        await r.deferUpdate().catch((err) => {
                            console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                        });

                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;

                        let showChars = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showChars.push(chars[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showChars.push(chars[i]);
                            };
                        };
                        Embed.setDescription(showChars.join('\n')).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [row] });
                    });

                });
            };

        });

    },
};