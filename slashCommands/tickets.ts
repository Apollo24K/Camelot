import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle, ButtonInteraction, Message } from "discord.js";
import charInfo, { characters } from "../Modules/chars.js";
import { splitTitle, rarity, getRefinement, showPage } from "../Modules/functions.js";
import { PageRow } from "../Modules/components.js";
import { SlashCommand } from '../types';
import { getUserSchema, updateUsers } from "../Modules/queries.js";

function displayMy(thisChar: charInfo, inv: number[], ref: number, interaction: any) {
    const animeL = splitTitle(thisChar.anime);
    const dupes = inv.filter((e) => e === thisChar.id).length;
    const refinement = getRefinement(ref);

    const img = thisChar.image;

    const Embed = new EmbedBuilder()
        .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d }[thisChar.rarity] || 0xbbffff)
        .setImage(img)
        .setThumbnail(rarity(thisChar.rarity))
        .setDescription(`**${thisChar.name}**\n${animeL}\n\n**Ref**. ${refinement}`)
        .setFooter({ text: `You have ${dupes} ${dupes === 1 ? "copy" : "copies"} of this`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" });
    interaction.channel.send({ embeds: [Embed] });
};

const exportCommand: SlashCommand = {
    name: 'tickets',
    async execute({ interaction, author }) {
        const ticketToOpen = interaction.options.getString('open') as "ssticket" | "sticket" | "aticket" | "bticket" | "cticket" | "dticket";

        if (ticketToOpen) {
            const stats = author.schema;
            if (!stats[ticketToOpen]) return interaction.reply(`You don't have any tickets left.`);

            const amountFlag = interaction.options.getString('amount') || "1";
            let amount = amountFlag.toLowerCase() === "max" ? stats[ticketToOpen] : parseInt(amountFlag);
            if (isNaN(amount)) return interaction.reply(`Please input a valid number.`);
            if (amount < 1) return interaction.reply(`You can't open ${amount} tickets.`);
            if (amount > 1000) return interaction.reply(`You can't open more than 1000 tickets at once.`);
            if (amount > stats?.[ticketToOpen]) return interaction.reply(`You don't have ${amount} tickets`);

            const rarity = ticketToOpen.split("ticket")[0].toUpperCase() as "D" | "C" | "B" | "A" | "S" | "SS" | "EX";

            const pulled: number[] = [];
            const available = characters.filter((e) => e.rarity === rarity);
            for (let i = 0; i < amount; i++) {
                pulled.push(available[Math.floor(available.length * Math.random())].id);
            }
            stats.chars.push(...pulled);

            // Update tickets
            await updateUsers(interaction.user.id, {
                [ticketToOpen]: { type: 'increment', value: -amount },
                chars: { type: 'append', value: pulled }
            });

            // Setup Pages
            const elementsPerPage = 15;
            const pagesTotal = Math.ceil(pulled.length / elementsPerPage);
            let currPage = 1;

            // Filter items to show on the current page
            let showItems = showPage(currPage, pulled, elementsPerPage) as number[];

            const Embed = new EmbedBuilder()
                .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[rarity])
                .setAuthor({ name: `Pulled ${pulled.length} ${rarity} characters!` })
                .setThumbnail(characters[pulled[0]].image)
                .setDescription(showItems.map((e) => `> ${characters[e].name} (${stats.chars.filter((c) => c === e).length} ${stats.chars.filter((c) => c === e).length === 1 ? "copy" : "copies"})`).join("\n"))
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            if (pagesTotal === 1) return interaction.reply({ embeds: [Embed] });

            const msg = await interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true });
            const collector = msg.createMessageComponentCollector({ filter: (r: ButtonInteraction) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

            collector.on('collect', (r: ButtonInteraction) => {
                if (r.customId === "prev") {
                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;
                } else {
                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;
                }

                showItems = showPage(currPage, pulled, elementsPerPage);

                Embed.setFooter({ text: `Page ${currPage}/${pagesTotal}` }).setDescription(showItems.map((e) => `> ${characters[e].name} (${stats.chars.filter((c) => c === e).length} ${stats.chars.filter((c) => c === e).length === 1 ? "copy" : "copies"})`).join("\n"));
                interaction.editReply({ embeds: [Embed], components: [PageRow] });
            });

            return;
        };

        const user = interaction.options.getUser('user') || interaction.user;

        let stats = user.id === interaction.user.id ? author.schema : await getUserSchema(user.id);
        if (!stats) return interaction.reply(`${user.id === interaction.user.id ? "You don't" : `**${user.username}** doesn't`} have any tickets`);

        let thumbnail = characters[stats.chars[Math.floor(Math.random() * stats.chars.length)]].image || "https://i.imgur.com/Ta2YDBN.png";
        if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, "", stats.char_skin[stats.favchar]);

        function r1() {
            return new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('ss')
                    .setLabel('use ticket')
                    .setDisabled((stats?.ssticket ?? 0) > 0 ? false : true)
                    .setEmoji('<:ss_ticket:927503239396622336>')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('s')
                    .setLabel('use ticket')
                    .setDisabled((stats?.sticket ?? 0) > 0 ? false : true)
                    .setEmoji('<:s_ticket:927642487705722890>')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('a')
                    .setLabel('use ticket')
                    .setDisabled((stats?.aticket ?? 0) > 0 ? false : true)
                    .setEmoji('<:a_ticket:929420377946472508>')
                    .setStyle(ButtonStyle.Secondary),
            );
        };

        function r2() {
            return new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId('b')
                    .setLabel('use ticket')
                    .setDisabled((stats?.bticket ?? 0) > 0 ? false : true)
                    .setEmoji('<:b_ticket:929420396535615519>')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('c')
                    .setLabel('use ticket')
                    .setDisabled((stats?.cticket ?? 0) > 0 ? false : true)
                    .setEmoji('<:c_ticket:929420424645853214>')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('d')
                    .setLabel('use ticket')
                    .setDisabled((stats?.dticket ?? 0) > 0 ? false : true)
                    .setEmoji('<:d_ticket:929420447102152714>')
                    .setStyle(ButtonStyle.Secondary),
            );
        };

        function e1(st: any) {
            return new EmbedBuilder()
                .setColor(0xbbffff)
                .setAuthor({ name: `${user.username}'s inventory`, iconURL: user.displayAvatarURL({ size: 2048 }) })
                .setDescription("You can use a ticket with the buttons below")
                .addFields(
                    { name: 'Tickets', value: `<:ss_ticket:927503239396622336>x${st.ssticket}\n<:b_ticket:929420396535615519>x${st.bticket}`, inline: true },
                    { name: '\u200B', value: `<:s_ticket:927642487705722890>x${st.sticket}\n<:c_ticket:929420424645853214>x${st.cticket}`, inline: true },
                    { name: '\u200B', value: `<:a_ticket:929420377946472508>x${st.aticket}\n<:d_ticket:929420447102152714>x${st.dticket}`, inline: true },
                )
                .setThumbnail(thumbnail);
        };

        if (user.id !== interaction.user.id) return interaction.reply({ embeds: [e1(stats)] });
        interaction.reply({ embeds: [e1(stats)], components: [r1(), r2()], fetchReply: true }).then((msg: Message) => {

            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', async (r: ButtonInteraction) => {
                stats = await getUserSchema(interaction.user.id);
                if (!stats) return;

                const ticketType = r.customId + "ticket" as 'ssticket' | 'sticket' | 'aticket' | 'bticket' | 'cticket' | 'dticket';

                if (stats[ticketType] < 1) return interaction.editReply(`You don't have any ${r.customId.toUpperCase()} Tickets left`);
                const tChar = characters.filter((e) => e.rarity === r.customId.toUpperCase());
                const tId = Math.floor(tChar.length * Math.random());
                stats.chars.push(tChar[tId].id);
                displayMy(tChar[tId], stats.chars, stats.char_ref[tChar[tId].id], interaction);

                stats[ticketType]--;


                await updateUsers(interaction.user.id, {
                    [ticketType]: { type: 'increment', value: -1 },
                    chars: { type: 'append', value: [tChar[tId].id] }
                });

                msg.edit({ embeds: [e1(stats)], components: [r1(), r2()] });
            });
        });

    },
};

export default exportCommand;
