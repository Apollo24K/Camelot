const { EmbedBuilder, ComponentType } = require("discord.js");
const { curses } = require("../Modules/curses.js");
const { PageRow } = require("../Modules/components.js");
const { showPage } = require("../Modules/functions.js");

module.exports = {
    name: 'curse',
    description: 'curse related commands',
    execute(interaction) {

        let subcommand = interaction.options.getSubcommand();

        // Class List
        if (subcommand === "list") {
            let page = interaction.options.getInteger('page');

            let rare = curses.filter((e) => e.tier).map((c) => `> ${c.emblem} ${c.name}`).sort();
            let common = curses.filter((e) => e.tier === 0).map((c) => `> ${c.emblem} ${c.name}`).sort();

            let showC = ["**Rare Curses** <:Rare_Curse:952175947409408041>", ...rare, "", "**Common Curses** <:Common_Curse:952175936554557530>", ...common];

            const elementsPerPage = 15;
            const pagesTotal = Math.ceil(showC.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            // Filter items to show on the current page
            let showF = showPage(currPage, showC, elementsPerPage);

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(`List of Curses`)
                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                .setDescription(`Use \`/curse info <name>\` for more information\n\n` + showF.join("\n"))
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            return interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    showF = showPage(currPage, showC, elementsPerPage);

                    Embed.setDescription(`Use \`/curse info <name>\` for more information\n\n` + showF.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed] });
                });

            });
        };

        function findCurse(name) {
            name = name.toLowerCase();

            if (!isNaN(name)) {
                if (name < 0) return interaction.reply("The ID can't be negative.");
                if (name >= curses.length) return interaction.reply("The ID must be smaller than " + curses.length);
                return curses[parseInt(name)];
            };

            let fastCheck = curses.find((e) => e.name.toLowerCase() === name);
            if (fastCheck) return fastCheck;

            let cArgs = name.split(" ");

            let fArray = curses.filter((e) => e.name.toLowerCase()[0] === cArgs[0][0]);

            let letter = 0;
            for (let word = 0; word < cArgs.length; word++) {
                let { length: wl } = cArgs[word];

                while (wl--) {
                    fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[word] === undefined ? false : e.name.toLowerCase().split(" ")[word][letter] === cArgs[word][letter]);
                    letter++;
                };

                if (fArray.length < 2) break;
                letter = 0;
            };

            if (fArray.length === 0) return interaction.reply("No match found");
            if (fArray.length > 1) return interaction.reply(fArray.length + " matches found");
            return fArray[0];
        };

        // Class info
        if (subcommand === "info") {
            let choice = interaction.options.getString('curse');

            let curse = findCurse(choice);
            if (!curse.name) return;

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(curse.name)
                .setDescription(`**Cost**: ${curse.cost}\\💧\n**Rarity**: ${curse.tier ? "Rare" : "Common"}\n\n**Active**: ${curse.descA}\n\n**Passive**: ${curse.descP}`)
                .setThumbnail(curse.image)
                .setFooter({ text: `ID: #${curse.id}` });
            return interaction.reply({ embeds: [Embed] });
        };

    },
};