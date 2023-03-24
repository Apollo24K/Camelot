/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { characters } = require("../Modules/chars.js");
const { splitTitle, rarity, getRefinement } = require("../Modules/functions.js");

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
        
        var customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

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
            
        });

    },
};