const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");

module.exports = {
    name: 'list',
	description: 'List characters of a rarity',
	execute(interaction) {

        let rarity = interaction.options.getString('rarity');
        let user = interaction.options.getUser('user') || interaction.user;
        let page = interaction.options.getInteger('page');
        
        db.serialize(async () => {
            var inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
            if (!inv[0]) inv[0] = {chars: "[]"};
            inv = {chars: JSON.parse(inv[0].chars)};

            let chars = characters.filter((e) => e.rarity == rarity);

            let userInvUniq = [...new Set(inv.chars)];
            let userChars = userInvUniq.map((e) => characters[e]);
            userChars = userChars.filter((e) => e.rarity === rarity);

            let uniq = [...new Set(chars.map((e) => e.anime))].sort();

            let showChars = [];
            for (i=0; i < uniq.length; i++) {
                let charsInAnime = chars.filter((e) => e.anime === uniq[i]).sort();
                if (charsInAnime.length < 1) return;
                showChars.push(`**${uniq[i]}**`);
                charsInAnime.forEach((e) => {
                    showChars.push(`> ${e.name}${userInvUniq.includes(e.id) ? " <a:check:873196253276700682>" : ""}`);
                });
                showChars.push("");
            };
            
            let pagesTotal = Math.ceil(showChars.length / 15);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            let left = showChars.length % 15;

            let showCharsF = [];
            if (currPage < pagesTotal || left === 0) {
                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                    showCharsF.push(showChars[i]);
                };
            } else {
                for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                    showCharsF.push(showChars[i]);
                };
            };

            let tier = "";
            switch (rarity) {
                case "SS" : tier = "<:SSTier:1019944030055956502>"; break; // "<:SSTier:869316489931546644>"
                case "S" : tier = "<:STier:869316518675095552>"; break;
                case "A" : tier = "<:ATier:869316558013464627>"; break;
                case "B" : tier = "<:BTier:869316586803179571>"; break;
                case "C" : tier = "<:CTier:869316602858991657>"; break;
                case "D" : tier = "<:DTier:869316616071032843>"; break;
                default : tier = ""; break;
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

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle(`${tier} **Tier Characters** (${userChars.length}/${chars.length})`)
            .setThumbnail(chars[Math.floor(Math.random() * chars.length)].image)
            .setDescription(showCharsF.join("\n"))
            .setFooter(`Page ${currPage}/${pagesTotal}`)
            interaction.reply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {
                
                const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                prev.on('collect', async r => {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                    });

                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;

                    let showCharsF = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (i=(currPage-1)*15; i < currPage * 15; i++) {
                            showCharsF.push(showChars[i]);
                        };
                    } else {
                        for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            showCharsF.push(showChars[i]);
                        };
                    };

                    Embed.setDescription(showCharsF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [row] });
                });

                next.on('collect', async r => {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                    });

                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;

                    let showCharsF = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (i=(currPage-1)*15; i < currPage * 15; i++) {
                            showCharsF.push(showChars[i]);
                        };
                    } else {
                        for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            showCharsF.push(showChars[i]);
                        };
                    };

                    Embed.setDescription(showCharsF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [row] });
                });

            });

        });

    },
};