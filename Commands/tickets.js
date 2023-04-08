/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { characters } = require("../Modules/chars.js");
const { splitTitle, rarity, getRefinement, showPage, search} = require("../Modules/functions.js");
const { PageRow } = require("../Modules/components.js");

function displayMy(thisChar, inv, ref, interaction) {
    let animeL = splitTitle(thisChar.anime);
    let dupes = inv.filter((e) => e === thisChar.id).length;
    let refinement = getRefinement(ref);
    
    let img = thisChar.image;
    // if (premium[message.author.id] > 3) if (customSettings[message.author.id + message.guild.id] && customSettings[message.author.id + message.guild.id].cimg[thisChar.id]) img = customSettings[message.author.id + message.guild.id].cimg[thisChar.id];
    
    const Embed = new MessageEmbed()
    .setColor({D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, default: 0xbbffff}[thisChar.rarity])
    .setImage(img)
    .setThumbnail(rarity(thisChar.rarity))
    .setDescription(`**${thisChar.name}**\n${animeL}\n\n**Ref**. ${refinement}`)
    .setFooter(`You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of this`, interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048")
    interaction.channel.send({ embeds: [Embed] });
};

module.exports = {
    name: 'tickets',
	description: 'See your tickets',
	execute(interaction) {
        
        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        let type = interaction.options.getString('open');
        let customId;
        let amount = interaction.options.getString('amount') || 1;
        if (!isNaN(amount)) amount = parseInt(amount);
        else if (amount.toLowerCase() === "max") amount = "max";

        let user = interaction.options.getUser('user') || interaction.user;

        db.serialize(async () => {
            var stats = await query(`SELECT ssticket, sticket, aticket, bticket, cticket, dticket, favchar, premium FROM users WHERE id = ${user.id}`);
            stats = stats[0];
            if (!stats) return interaction.reply(`${user.id === interaction.user.id ? "You don't" : `**${user.username}** doesn't`} have any tickets`);
            
            var inv = await query(`SELECT chars, ref FROM characters WHERE id = ${interaction.user.id}`);
            inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref)};

            let thumbnail = characters[inv.chars[Math.floor(Math.random() * inv.chars.length)]].image;
            if (stats.favchar !== null) {
                thumbnail = characters[stats.favchar].image;
                if (stats.premium > 3) if (customSettings[user.id] && customSettings[user.id].cimg[stats.favchar]) thumbnail = customSettings[user.id].cimg[stats.favchar];
            };

            if (!type) {

                function r1() {
                    return new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId('ss')
                            .setLabel('use ticket')
                            .setDisabled(stats.ssticket > 0 ? false : true)
                            .setEmoji('<:ss_ticket:927503239396622336>')
                            .setStyle('SECONDARY'),
                        new MessageButton()
                            .setCustomId('s')
                            .setLabel('use ticket')
                            .setDisabled(stats.sticket > 0 ? false : true)
                            .setEmoji('<:s_ticket:927642487705722890>')
                            .setStyle('SECONDARY'),
                        new MessageButton()
                            .setCustomId('a')
                            .setLabel('use ticket')
                            .setDisabled(stats.aticket > 0 ? false : true)
                            .setEmoji('<:a_ticket:929420377946472508>')
                            .setStyle('SECONDARY'),
                    );
                };

                function r2() {
                    return new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId('b')
                            .setLabel('use ticket')
                            .setDisabled(stats.bticket > 0 ? false : true)
                            .setEmoji('<:b_ticket:929420396535615519>')
                            .setStyle('SECONDARY'),
                        new MessageButton()
                            .setCustomId('c')
                            .setLabel('use ticket')
                            .setDisabled(stats.cticket > 0 ? false : true)
                            .setEmoji('<:c_ticket:929420424645853214>')
                            .setStyle('SECONDARY'),
                        new MessageButton()
                            .setCustomId('d')
                            .setLabel('use ticket')
                            .setDisabled(stats.dticket > 0 ? false : true)
                            .setEmoji('<:d_ticket:929420447102152714>')
                            .setStyle('SECONDARY'),
                    );
                };

                function e1(st) {
                    return new MessageEmbed()
                    .setColor(0xbbffff)
                    .setAuthor(`${user.username}'s inventory`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                    .setDescription("You can use a ticket with the buttons below")
                    .addFields(
                        { name: 'Tickets', value: `<:ss_ticket:927503239396622336>x${st.ssticket}\n<:b_ticket:929420396535615519>x${st.bticket}`, inline: true },
                        { name: '\u200B', value: `<:s_ticket:927642487705722890>x${st.sticket}\n<:c_ticket:929420424645853214>x${st.cticket}`, inline: true },
                        { name: '\u200B', value: `<:a_ticket:929420377946472508>x${st.aticket}\n<:d_ticket:929420447102152714>x${st.dticket}`, inline: true },
                    )
                    .setThumbnail(thumbnail)
                };
    
                if (user.id !== interaction.user.id) return interaction.reply({ embeds: [e1(stats)] });
                interaction.reply({ embeds: [e1(stats)], components: [r1(), r2()], fetchReply: true }).then((msg) => {
    
                    const collector = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id, componentType: 'BUTTON', time: 60000 });
    
                    collector.on('collect', async r => {
                        stats = await query(`SELECT ssticket, sticket, aticket, bticket, cticket, dticket FROM users WHERE id = ${interaction.user.id}`);
                        stats = stats[0];
    
                        if (stats[r.customId+"ticket"] < 1) return interaction.editReply(`You don't have any ${r.customId.toUpperCase()} Tickets left`);
                        let tChar = characters.filter((e) => e.rarity === r.customId.toUpperCase());
                        let tId = Math.floor(tChar.length * Math.random());
                        inv.chars.push(tChar[tId].id);
                        displayMy(tChar[tId], inv.chars, inv.ref[tChar[tId].id], interaction);
    
                        stats[r.customId+"ticket"]--;
    
                        await query(`UPDATE users SET ${r.customId+"ticket"} = ${r.customId+"ticket"} - 1 WHERE id = ${interaction.user.id}`);
                        await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}' WHERE id = ${interaction.user.id}`);        
    
                        msg.edit({ embeds: [e1(stats)], components: [r1(), r2()] });
                    });
    
                });
            }
            else {
                switch (type) {
                    case 'ssticket': type = stats.ssticket; customId = "ss"; break;
                    case 'sticket': type = stats.sticket; customId = "s"; break;
                    case 'aticket': type = stats.aticket; customId = "a"; break;
                    case 'bticket': type = stats.bticket; customId = "b"; break;
                    case 'cticket': type = stats.cticket; customId = "c"; break;
                    case 'dticket': type = stats.dticket; customId = "d"; break;
                }

                let uniq = [...new Set(inv.chars)];
                let sorted = {"SS": [], "S": [], "A": [], "B": [], "C": [], "D": []};

                if (amount === "max") amount = type;
                if (amount > 1000) return interaction.reply(`You can't use more than 1000 tickets at once.`);
                if (amount > type) return interaction.reply(`You don't have ${amount} tickets`);
                if (amount < 1) return interaction.reply(`You can't use ${amount} tickets.`);

                for (i=0; i<amount; i++) {
                    let tChar = characters.filter((e) => e.rarity === customId.toUpperCase());
                    let tId = Math.floor(tChar.length * Math.random());
                    inv.chars.push(tChar[tId].id);

                    stats[customId+"ticket"]--;
                    sorted[customId.toUpperCase()].push(tChar[tId]);

                    await query(`UPDATE users SET ${customId+"ticket"} = ${customId+"ticket"} - 1 WHERE id = ${interaction.user.id}`);
                    await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}' WHERE id = ${interaction.user.id}`);  
                }

                let allChars = sorted["SS"].concat(sorted["S"]).concat(sorted["A"]).concat(sorted["B"]).concat(sorted["C"]).concat(sorted["D"]);

                const elementsPerPage = 15;
                let pagesTotal = Math.ceil(allChars.length / elementsPerPage);
                let currPage = 1;
                let left = allChars.length % elementsPerPage;

                // eslint-disable-next-line no-inner-declarations
                function tierNames(t, arr=[]) {
                    for (let h=0; h < t.length; h++) {
                        if (uniq.includes(t[h].id)) {
                            arr.push(`${t[h].name}`);
                        } else {
                            arr.push(t[h].name);
                        };
                    };
                    return arr;
                };

                // eslint-disable-next-line no-inner-declarations
                function charPage(desc="") {
                    const showChars = showPage(currPage, pagesTotal, left, allChars, elementsPerPage);
                    let sorted = {"SS": [], "S": [], "A": [], "B": [], "C": [], "D": []};
                    showChars.forEach((b) => sorted[b.rarity].push(b));
                    let emoji = {"SS": "<:SSTier:869316489931546644>", "S": "<:STier:869316518675095552>", "A": "<:ATier:869316558013464627>", "B": "<:BTier:869316586803179571>", "C": "<:CTier:869316602858991657>", "D": "<:DTier:869316616071032843>"};
                    Object.keys(sorted).forEach((b) => sorted[b].length ? desc += `\n\n${emoji[b]} **Tier**\n> ` + tierNames(sorted[b]).join("\n> ") : false)
                    return desc;
                };

                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setTitle(`**Got** ` + amount + " characters")
                .setThumbnail(allChars[0].image)
                .setDescription(charPage())
                .setFooter(`Page ${currPage}/${pagesTotal}`)
                if (allChars.length < 16) return interaction.reply({ embeds: [Embed] });
                return interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {
                
                    const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                    const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });
                
                    prev.on('collect', async r => {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    
                        Embed.setDescription(charPage()).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed] });
                    });
                
                    next.on('collect', async r => {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    
                        Embed.setDescription(charPage()).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed] });
                    });
                });
            }
        });

    },
};