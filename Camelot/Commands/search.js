const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");
const { searchAnime, splitTitle, rarity } = require("../Modules/functions.js");

module.exports = {
    name: 'search',
	description: 'Search an anime',
	execute(interaction) {

        let anime = interaction.options.getString('anime');
        let user = interaction.options.getUser('user') || interaction.user;
        let page = interaction.options.getInteger('page');
        let searchflag = interaction.options.getString('flags');
        
        db.serialize(async () => {
            var inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
            if (!inv[0]) inv[0] = {chars: "[]"};
            inv = {chars: JSON.parse(inv[0].chars)};

            let uniq = [...new Set(inv.chars)];
            let chars = uniq.map((e) => characters[e]);

            let fastCheck = searchAnime(anime, inv.chars, interaction);
            if (!fastCheck.length) return;
            
            let sorted = {"SS": [], "S": [], "A": [], "B": [], "C": [], "D": []};
            fastCheck.forEach((b) => sorted[b.rarity].push(b));
            let allChars = sorted["SS"].concat(sorted["S"]).concat(sorted["A"]).concat(sorted["B"]).concat(sorted["C"]).concat(sorted["D"]);
            let charsOwned = chars.filter((b) => b.anime === fastCheck[0].anime);

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

            if (searchflag === null) {
                
                let pagesTotal = Math.ceil(fastCheck.length / 15);
                let currPage = 1;
                if (page <= pagesTotal && page > 0) {
                    currPage = page;
                };
    
                let left = allChars.length % 15;
    
                function tierNames(t, arr=[]) {
                    for (h=0; h < t.length; h++) {
                        if (uniq.includes(t[h].id)) {
                            arr.push(`${t[h].name} <a:check:873196253276700682>`);
                        } else {
                            arr.push(t[h].name);
                        };
                    };
                    return arr;
                };
                
                function charPage(showChars=[], desc="") {                
                    if (currPage < pagesTotal || left === 0) {
                        for (i=(currPage-1)*15; i < currPage * 15; i++) {
                            showChars.push(allChars[i]);
                        };
                    } else {
                        for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            showChars.push(allChars[i]);
                        };
                    };
                    let sorted = {"SS": [], "S": [], "A": [], "B": [], "C": [], "D": []};
                    showChars.forEach((b) => sorted[b.rarity].push(b));
                    let emoji = {"SS": "<:SSTier:869316489931546644>", "S": "<:STier:869316518675095552>", "A": "<:ATier:869316558013464627>", "B": "<:BTier:869316586803179571>", "C": "<:CTier:869316602858991657>", "D": "<:DTier:869316616071032843>"};
                    Object.keys(sorted).forEach((b) => sorted[b].length ? desc += `\n\n${emoji[b]} **Tier**\n> ` + tierNames(sorted[b]).join("\n> ") : false)
                    return desc;
                };
    
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setTitle(`**${fastCheck[0].anime}** (` + charsOwned.length + "/" + fastCheck.length + ")")
                .setThumbnail(allChars[0].image)
                .setDescription(charPage())
                .setFooter(`Page ${currPage}/${pagesTotal}`)
                if (fastCheck.length < 16) return interaction.reply({ embeds: [Embed] });
                return interaction.reply({ embeds: [Embed.setDescription(charPage())], components: [row], fetchReply: true }).then(msg => {

                    const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                    const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });
    
                    prev.on('collect', async r => {
                        await r.deferUpdate().catch((err) => {
                            console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                        });

                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;

                        Embed.setDescription(charPage()).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [row] });
                    });

                    next.on('collect', async r => {
                        await r.deferUpdate().catch((err) => {
                            console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                        });

                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;

                        Embed.setDescription(charPage()).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [row] });
                    });

                });
            };

            if (searchflag === "image") {
    
                let aTitle = splitTitle(fastCheck[0].anime);
    
                let pagesTotal = allChars.length;
                let currPage = 1;
                if (page <= pagesTotal && page > 0) {
                    currPage = page;
                };

                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setThumbnail(rarity(allChars[currPage-1].rarity))
                .setDescription(`**${allChars[currPage-1].name}**${uniq.includes(allChars[currPage-1].id) ? " <a:check:873196253276700682>" : ""}\n**${aTitle}** (${charsOwned.length}/${allChars.length})\n**ID**: #${allChars[currPage-1].id}`)
                .setImage(allChars[currPage-1].image)
                .setFooter(`Page ${currPage}/${pagesTotal}`)
                return interaction.reply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {

                    const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                    const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                    prev.on('collect', async r => {
                        await r.deferUpdate().catch((err) => {
                            console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                        });

                        currPage > 1 ? currPage-- : currPage = pagesTotal;
                        Embed.setThumbnail(rarity(allChars[currPage-1].rarity)).setDescription(`**${allChars[currPage-1].name}**${uniq.includes(allChars[currPage-1].id) ? " <a:check:873196253276700682>" : ""}\n**${aTitle}** (${charsOwned.length}/${allChars.length})\n**ID**: #${allChars[currPage-1].id}`).setImage(allChars[currPage-1].image).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [row] });
                    });

                    next.on('collect', async r => {
                        await r.deferUpdate().catch((err) => {
                            console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                        });

                        currPage < pagesTotal ? currPage++ : currPage = 1;
                        Embed.setThumbnail(rarity(allChars[currPage-1].rarity)).setDescription(`**${allChars[currPage-1].name}**${uniq.includes(allChars[currPage-1].id) ? " <a:check:873196253276700682>" : ""}\n**${aTitle}** (${charsOwned.length}/${allChars.length})\n**ID**: #${allChars[currPage-1].id}`).setImage(allChars[currPage-1].image).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [row] });
                    });
                    
                });
            };

        });

    },
};