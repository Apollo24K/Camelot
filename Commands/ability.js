/* eslint-disable no-unused-vars */
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { characters } = require("../Modules/chars.js");
const { abilities } = require("../Modules/abilities.js");
const { achievements } = require("../Modules/achievements.js");
const { search, showPage } = require("../Modules/functions.js");

module.exports = {
    name: 'ability',
    description: 'see chars with abilities',
    execute(interaction) {

        let user = interaction.options.getUser('user') || interaction.user;
        let choice = interaction.options.getString('character');
        const filter = interaction.options.getString('filter');
        let page = interaction.options.getInteger('page') || 1;
        let selection = choice ? "single" : "list";

        db.serialize(async () => {
            let inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
            if (!inv[0]) inv[0] = { chars: "[]" };
            inv = { chars: JSON.parse(inv[0].chars) };


            let charsID = Object.keys(abilities).filter((e) => filter ? filter in abilities[e] : true);
            let chars = charsID.map((e) => characters[e]);
            let uniq = [...new Set(chars.map((e) => e.anime))].sort();

            let showChars = [];
            for (let i = 0; i < uniq.length; i++) {
                let charsInAnime = chars.filter((e) => e.anime === uniq[i]);
                if (charsInAnime.length < 1) return;
                charsInAnime.sort();
                showChars.push(`**${uniq[i]}**`);
                for (let j = 0; j < charsInAnime.length; j++) {
                    if (inv.chars.includes(charsInAnime[j].id)) {
                        showChars.push(`> ${charsInAnime[j].name} <a:check:873196253276700682>`);
                    } else {
                        showChars.push(`> ${charsInAnime[j].name}`);
                    };
                };
                showChars.push("");
            };

            // Setup Pages
            const elementsPerPage = 15;
            const pagesTotal = Math.ceil(showChars.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };
            let left = showChars.length % 15;

            // Filter items to show on the current page
            let showCharsF = showPage(currPage, showChars, elementsPerPage);

            function r1() {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setEmoji('⏪')
                            .setStyle('Secondary'),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setEmoji('⏩')
                            .setStyle('Secondary'),
                        new ButtonBuilder()
                            .setCustomId('view')
                            .setLabel(selection === "single" ? "List View" : "Single View")
                            .setStyle('Primary'),
                    );
                return row;
            };

            let fArray = chars[0];
            if (choice) {
                fArray = search(choice, inv.chars, interaction);
                if (!fArray.name) return;
                if (!(fArray.id in abilities) || (filter && !(filter in abilities[fArray.id]))) return interaction.reply(`**${fArray.name}** does not have ${filter ? (filter === "ability" ? "an active " : `a ${filter} `) : "an "}ability`);
            };

            let singlePagesTotal = charsID.length;
            let singleCurrPage = charsID.indexOf("" + fArray?.id) + 1;

            function changeEmbed() {
                return new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setTitle(selection === "single" ? `${fArray.name}'s Ability` : `Characters with ${filter ? (filter === "ability" ? "Active " : `${filter[0].toUpperCase()}${filter.slice(1)} `) : ""}Abilities`)
                    .setThumbnail(selection === "single" ? fArray.image : chars[Math.floor(Math.random() * chars.length)].image)
                    .setDescription(selection === "single" ? abilities[fArray.id].desc : `Use \`/ability <char>\` for more information\n\n${showCharsF.join("\n")}`)
                    .setFooter({ text: selection === "single" ? `Page ${singleCurrPage}/${singlePagesTotal}` : `Page ${currPage}/${pagesTotal}` });
            };

            let Embed = changeEmbed();
            interaction.reply({ embeds: [Embed], components: [r1()], fetchReply: true }).then(msg => {

                const prev = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: ComponentType.Button, time: 90000 });
                const next = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: ComponentType.Button, time: 90000 });
                const view = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "view", componentType: ComponentType.Button, time: 90000 });

                prev.on('collect', async r => {
                    if (selection === "single") {
                        if (singleCurrPage > 1) singleCurrPage--;
                        else singleCurrPage = singlePagesTotal;

                        fArray = chars[singleCurrPage - 1];
                        Embed.setTitle(`${fArray.name}'s Ability`).setThumbnail(fArray.image).setDescription(abilities[fArray.id].desc).setFooter({ text: `Page ${singleCurrPage}/${singlePagesTotal}` });
                    } else {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;

                        showCharsF = showPage(currPage, showChars, elementsPerPage);

                        Embed.setDescription(`Use \`/ability <char>\` for more information\n\n` + showCharsF.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    };

                    interaction.editReply({ embeds: [Embed], components: [r1()] });
                });

                next.on('collect', async r => {
                    if (selection === "single") {
                        if (singleCurrPage < singlePagesTotal) singleCurrPage++;
                        else singleCurrPage = 1;

                        fArray = chars[singleCurrPage - 1];

                        Embed.setTitle(`${fArray.name}'s Ability`).setThumbnail(fArray.image).setDescription(abilities[fArray.id].desc).setFooter({ text: `Page ${singleCurrPage}/${singlePagesTotal}` });
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;

                        showCharsF = showPage(currPage, showChars, elementsPerPage);

                        Embed.setDescription(`Use \`/ability <char>\` for more information\n\n` + showCharsF.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    }

                    interaction.editReply({ embeds: [Embed], components: [r1()] });
                });

                view.on('collect', async r => {
                    if (selection === "single") selection = "list";
                    else selection = "single";

                    Embed = changeEmbed();
                    interaction.editReply({ embeds: [Embed], components: [r1()] });
                });

            });

            // Achievements
            achievements[47].check(interaction); // First Steps
        });

    },
}; // 182 lines