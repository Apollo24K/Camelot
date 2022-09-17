const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { curses } = require("../Modules/curses.js");

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

            let showC = ["**Rare Curses** <:Rare_Curse:952175947409408041>", ...rare, "", "**Common Curses** <:Common_Curse:952175936554557530>", ...common]

            let pagesTotal = Math.ceil(showC.length / 15);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };
            let left = showC.length % 15;

            let showF = [];
            if (currPage < pagesTotal || left === 0) {
                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                    showF.push(showC[i]);
                };
            } else {
                for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                    showF.push(showC[i]);
                };
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
            .setTitle(`List of Curses`)
            .setThumbnail("https://i.ibb.co/cgh59Lb/WWM4K98.png")
            .setDescription(`Use \`/curse info <name>\` for more information\n\n` + showF.join("\n"))
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

                    let showF = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (i=(currPage-1)*15; i < currPage * 15; i++) {
                            showF.push(showC[i]);
                        };
                    } else {
                        for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            showF.push(showC[i]);
                        };
                    };

                    Embed.setDescription(`Use \`/curse info <name>\` for more information\n\n` + showF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [row] });
                });

                next.on('collect', async r => {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                    });

                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;

                    let showF = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (i=(currPage-1)*15; i < currPage * 15; i++) {
                            showF.push(showC[i]);
                        };
                    } else {
                        for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            showF.push(showC[i]);
                        };
                    };

                    Embed.setDescription(`Use \`/curse info <name>\` for more information\n\n` + showF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [row] });
                });
                
            });
            return;
        };

        // Class info
        if (subcommand === "info") {
            let choice = interaction.options.getString('curse');

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
                for (word=0; word < cArgs.length; word++) {
                    let { length:wl } = cArgs[word];
    
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

            let curse = findCurse(choice);
            if (!curse.name) return;

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle(curse.name)
            .setDescription(`**Cost**: ${curse.cost}\\💧\n**Rarity**: ${curse.tier ? "Rare" : "Common"}\n\n**Active**: ${curse.descA}\n\n**Passive**: ${curse.descP}`)
            .setThumbnail(curse.image)
            .setFooter(`ID: #${curse.id}`)
            return interaction.reply({ embeds: [Embed] });
        };
        
    },
};