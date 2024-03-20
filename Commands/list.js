const { EmbedBuilder, ComponentType } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");
const { PageRow } = require("../Modules/components.js");
const { showPage } = require("../Modules/functions.js");
const { abilities } = require("../Modules/abilities.js");

module.exports = {
    name: 'list',
    description: 'List characters of a rarity',
    execute(interaction) {

        const rarity = interaction.options.getString('rarity');
        const filter = interaction.options.getString('filter');
        const user = interaction.options.getUser('user') || interaction.user;
        const page = interaction.options.getInteger('page');

        db.serialize(async () => {
            let { 0: inv } = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
            if (!inv) inv = { chars: "[]" };
            inv.chars = JSON.parse(inv.chars);

            let chars = characters.filter((e) => e.rarity === rarity);
            if (filter === "unowned") chars = chars.filter((e) => !inv.chars.includes(e.id));

            let userInvUniq = [...new Set(inv.chars)];
            let userChars = userInvUniq.map((e) => characters[e]);
            userChars = userChars.filter((e) => e.rarity === rarity);

            let uniq = [...new Set(chars.map((e) => e.anime))].sort();

            let showChars = [];
            for (let i = 0; i < uniq.length; i++) {
                let charsInAnime = chars.filter((e) => e.anime === uniq[i]).sort();
                if (charsInAnime.length < 1) return;
                showChars.push(`**${uniq[i]}**`);
                charsInAnime.forEach((e) => {
                    showChars.push(`> ${e.name}${e.id in abilities ? " ✨" : ""}${userInvUniq.includes(e.id) ? " <a:check:873196253276700682>" : ""}`);
                });
                showChars.push("");
            };
            if (showChars[showChars.length - 1] === "") showChars.pop();

            // Setup Pages
            const elementsPerPage = 15;
            const pagesTotal = Math.ceil(showChars.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            // Filter items to show on the current page
            let showCharsF = showPage(currPage, showChars, elementsPerPage);

            let tier = "";
            switch (rarity) {
                case "EX": tier = "<a:EXTRA:1138530846144462968>"; break;
                case "SS": tier = "<:SSTier:869316489931546644>"; break;
                case "S": tier = "<:STier:869316518675095552>"; break;
                case "A": tier = "<:ATier:869316558013464627>"; break;
                case "B": tier = "<:BTier:869316586803179571>"; break;
                case "C": tier = "<:CTier:869316602858991657>"; break;
                case "D": tier = "<:DTier:869316616071032843>"; break;
                default: tier = ""; break;
            };

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setThumbnail(chars[Math.floor(Math.random() * chars.length)].image)
                .setDescription(`### ${tier} **Tier Characters** (${filter === "unowned" ? "" : `${userChars.length}/`}${chars.length})\n` + showCharsF.join("\n"))
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
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

                    showCharsF = showPage(currPage, showChars, elementsPerPage);

                    Embed.setDescription(`### ${tier} **Tier Characters** (${filter === "unowned" ? "" : `${userChars.length}/`}${chars.length})\n` + showCharsF.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed] });
                });

            });

        });

    },
};