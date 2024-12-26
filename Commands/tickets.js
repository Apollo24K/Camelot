import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } from "discord.js";
import { db, query } from "../db_handler.js";
import { characters } from "../Modules/chars.js";
import { splitTitle, rarity, getRefinement, showPage } from "../Modules/functions.js";
import { PageRow } from "../Modules/components.js";

function displayMy(thisChar, inv, ref, interaction) {
    let animeL = splitTitle(thisChar.anime);
    let dupes = inv.filter((e) => e === thisChar.id).length;
    let refinement = getRefinement(ref);

    let img = thisChar.image;
    // if (premium[message.author.id] > 3) if (customSettings[message.author.id + message.guild.id] && customSettings[message.author.id + message.guild.id].cimg[thisChar.id]) img = customSettings[message.author.id + message.guild.id].cimg[thisChar.id];

    const Embed = new EmbedBuilder()
        .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[thisChar.rarity])
        .setImage(img)
        .setThumbnail(rarity(thisChar.rarity))
        .setDescription(`**${thisChar.name}**\n${animeL}\n\n**Ref**. ${refinement}`)
        .setFooter({ text: `You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of this`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" });
    interaction.channel.send({ embeds: [Embed] });
};

module.exports = {
    name: 'tickets',
    description: 'See your tickets',
    execute(interaction) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        const ticketToOpen = interaction.options.getString('open');

        if (ticketToOpen) {
            let amount = interaction.options.getString('amount') || 1;
            if (!isNaN(amount)) amount = parseInt(amount);
            else if (amount.toLowerCase() === "max") amount = "max";
            else return interaction.reply(`Please input a valid number.`);

            db.serialize(async () => {
                const { 0: stats } = await query(`SELECT ${ticketToOpen}, favchar, premium FROM users WHERE id = ${interaction.user.id}`);
                if (!stats?.[ticketToOpen]) return interaction.reply(`You don't have any tickets left.`);

                if (amount === "max") amount = stats?.[ticketToOpen];
                if (amount < 1) return interaction.reply(`You can't open ${amount} tickets.`);
                if (amount > 1000) return interaction.reply(`You can't open more than 1000 tickets at once.`);
                if (amount > stats?.[ticketToOpen]) return interaction.reply(`You don't have ${amount} tickets`);

                const rarity = ticketToOpen.split("ticket")[0].toUpperCase();

                let inv = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
                inv = { chars: JSON.parse(inv[0].chars) };

                const pulled = [];
                const available = characters.filter((e) => e.rarity === rarity);
                for (let i = 0; i < amount; i++) {
                    pulled.push(available[Math.floor(available.length * Math.random())].id);
                };

                inv.chars = inv.chars.concat(pulled);

                await query(`UPDATE users SET ${ticketToOpen} = ${ticketToOpen} - ${amount} WHERE id = ${interaction.user.id}`);
                await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}' WHERE id = ${interaction.user.id}`);

                // Setup Pages
                let elementsPerPage = 15;
                let pagesTotal = Math.ceil(pulled.length / elementsPerPage);
                let currPage = 1;

                // Filter items to show on the current page
                let showItems = showPage(currPage, pulled, elementsPerPage);

                const Embed = new EmbedBuilder()
                    .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[rarity])
                    .setAuthor({ name: `Pulled ${pulled.length} ${rarity} characters!` })
                    .setThumbnail(characters[pulled[0]].image)
                    .setDescription(showItems.map((e) => `> ${characters[e].name} (${inv.chars.filter((c) => c === e).length} ${inv.chars.filter((c) => c === e).length === 1 ? "copy" : "copies"})`).join("\n"))
                    .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                if (pagesTotal === 1) return interaction.reply({ embeds: [Embed] });
                interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {
                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                    collector.on('collect', r => {
                        if (r.customId === "prev") {
                            if (currPage > 1) currPage--;
                            else currPage = pagesTotal;
                        } else {
                            if (currPage < pagesTotal) currPage++;
                            else currPage = 1;
                        };

                        showItems = showPage(currPage, pulled, elementsPerPage);

                        Embed.setFooter({ text: `Page ${currPage}/${pagesTotal}` }).setDescription(showItems.map((e) => `> ${characters[e].name} (${inv.chars.filter((c) => c === e).length} ${inv.chars.filter((c) => c === e).length === 1 ? "copy" : "copies"})`).join("\n"));
                        interaction.editReply({ embeds: [Embed], components: [PageRow] });
                    });

                });

            });
            return;
        };

        db.serialize(async () => {
            const user = interaction.options.getUser('user') || interaction.user;

            let stats = await query(`SELECT ssticket, sticket, aticket, bticket, cticket, dticket, favchar, premium FROM users WHERE id = ${user.id}`);
            stats = stats[0];
            if (!stats) return interaction.reply(`${user.id === interaction.user.id ? "You don't" : `**${user.username}** doesn't`} have any tickets`);

            let inv = await query(`SELECT chars, ref, skin FROM characters WHERE id = ${interaction.user.id}`);
            inv = { chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref), skin: JSON.parse(inv[0].skin) };

            let thumbnail = characters[inv.chars[Math.floor(Math.random() * inv.chars.length)]].image || "https://i.imgur.com/Ta2YDBN.png";
            if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[user.id]?.cimg[stats.favchar], inv.skin[stats.favchar]);

            function r1() {
                return new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('ss')
                        .setLabel('use ticket')
                        .setDisabled(stats.ssticket > 0 ? false : true)
                        .setEmoji('<:ss_ticket:927503239396622336>')
                        .setStyle('Secondary'),
                    new ButtonBuilder()
                        .setCustomId('s')
                        .setLabel('use ticket')
                        .setDisabled(stats.sticket > 0 ? false : true)
                        .setEmoji('<:s_ticket:927642487705722890>')
                        .setStyle('Secondary'),
                    new ButtonBuilder()
                        .setCustomId('a')
                        .setLabel('use ticket')
                        .setDisabled(stats.aticket > 0 ? false : true)
                        .setEmoji('<:a_ticket:929420377946472508>')
                        .setStyle('Secondary'),
                );
            };

            function r2() {
                return new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('b')
                        .setLabel('use ticket')
                        .setDisabled(stats.bticket > 0 ? false : true)
                        .setEmoji('<:b_ticket:929420396535615519>')
                        .setStyle('Secondary'),
                    new ButtonBuilder()
                        .setCustomId('c')
                        .setLabel('use ticket')
                        .setDisabled(stats.cticket > 0 ? false : true)
                        .setEmoji('<:c_ticket:929420424645853214>')
                        .setStyle('Secondary'),
                    new ButtonBuilder()
                        .setCustomId('d')
                        .setLabel('use ticket')
                        .setDisabled(stats.dticket > 0 ? false : true)
                        .setEmoji('<:d_ticket:929420447102152714>')
                        .setStyle('Secondary'),
                );
            };

            function e1(st) {
                return new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setAuthor({ name: `${user.username}'s inventory`, iconURL: user.displayAvatarURL({ dynamic: true }) + "?size=2048" })
                    .setDescription("You can use a ticket with the buttons below")
                    .addFields(
                        { name: 'Tickets', value: `<:ss_ticket:927503239396622336>x${st.ssticket}\n<:b_ticket:929420396535615519>x${st.bticket}`, inline: true },
                        { name: '\u200B', value: `<:s_ticket:927642487705722890>x${st.sticket}\n<:c_ticket:929420424645853214>x${st.cticket}`, inline: true },
                        { name: '\u200B', value: `<:a_ticket:929420377946472508>x${st.aticket}\n<:d_ticket:929420447102152714>x${st.dticket}`, inline: true },
                    )
                    .setThumbnail(thumbnail);
            };

            if (user.id !== interaction.user.id) return interaction.reply({ embeds: [e1(stats)] });
            interaction.reply({ embeds: [e1(stats)], components: [r1(), r2()], fetchReply: true }).then((msg) => {

                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 60000 });

                collector.on('collect', async r => {
                    stats = await query(`SELECT ssticket, sticket, aticket, bticket, cticket, dticket FROM users WHERE id = ${interaction.user.id}`);
                    stats = stats[0];

                    if (stats[r.customId + "ticket"] < 1) return interaction.editReply(`You don't have any ${r.customId.toUpperCase()} Tickets left`);
                    let tChar = characters.filter((e) => e.rarity === r.customId.toUpperCase());
                    let tId = Math.floor(tChar.length * Math.random());
                    inv.chars.push(tChar[tId].id);
                    displayMy(tChar[tId], inv.chars, inv.ref[tChar[tId].id], interaction);

                    stats[r.customId + "ticket"]--;

                    await query(`UPDATE users SET ${r.customId + "ticket"} = ${r.customId + "ticket"} - 1 WHERE id = ${interaction.user.id}`);
                    await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}' WHERE id = ${interaction.user.id}`);

                    msg.edit({ embeds: [e1(stats)], components: [r1(), r2()] });
                });

            });

        });

    },
};