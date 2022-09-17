const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");

module.exports = {
    name: 'admin',
	description: 'take admin actions',
	execute(interaction, client) {

        let user = interaction.options.getUser('user') || interaction.user;
        let action = interaction.options.getString('action').toLowerCase();

        // Return if not owner
        if (interaction.user.id !== "489490486734880774") {
            return interaction.reply({content: "You're not allowed to use this command", ephemeral: true});
        };

        // List all actions
        if (action === "list") {
            return interaction.reply({content: ">>> `list`\n`reset pulls`\n`reset daily`\n`reset weekly`\n`reset dungeon`\n`guilds`\n`add premium <int>`\n`add vote`\n`did`", ephemeral: true});
        };
        
        // Reset Pulls
        if (action === "reset pulls") {
            db.serialize(async () => {
                await query(`UPDATE users SET pullcount = 0`);
            });
            return interaction.reply({content: "Action Successful", ephemeral: true});
        };

        // Reset Dailies
        if (action === "reset daily") {
            db.serialize(async () => {
                await query(`UPDATE users SET dailyclaimed = 0`);
            });
            return interaction.reply({content: "Action Successful", ephemeral: true});
        };

        // Reset Weeklies
        if (action === "reset weekly") {
            db.serialize(async () => {
                await query(`UPDATE users SET weeklyclaimed = 0`);
            });
            return interaction.reply({content: "Action Successful", ephemeral: true});
        };

        // Reset Dungeon
        if (action === "reset dungeon") {
            db.serialize(async () => {
                await query(`UPDATE dungeon SET 'limit' = 0`);
            });
            return interaction.reply({content: "Action Successful", ephemeral: true});
        };

        // List Guilds
        if (action === "guilds") {
            let guildArr = [];
            let membersTotal = 0;
            client.guilds.cache.each(guild => {
                guildArr.push(guild.name + " | " + guild.memberCount + " Members");
                membersTotal += guild.memberCount;
            });
            guildArr.sort((a, b) => b.match(/\d+(?=\D*$)/)[0] - a.match(/\d+(?=\D*$)/)[0]);
            
            let pagesTotal = Math.ceil(guildArr.length / 15);
            let currPage = 1;
            let left = guildArr.length % 15;

            let showAnime = [];
            if (currPage < pagesTotal || left === 0) {
                for (i=(currPage-1)*15; i < currPage * 15; i++) {
                    showAnime.push(`‧ ${guildArr[i]}`);
                };
            } else {
                for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                    showAnime.push(`‧ ${guildArr[i]}`);
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
            .setTitle(`Guilds Total (${guildArr.length} | ${membersTotal})`)
            .setColor(0xbbffff)
            .setThumbnail("https://i.imgur.com/WWM4K98.png")
            .setDescription(showAnime.join("\n"))
            return interaction.reply({ embeds: [Embed], components: [row], fetchReply: true, ephemeral: true }).then((msg) => {
                
                const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                prev.on('collect', async r => {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                    });

                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;

                    let showAnime = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (i=(currPage-1)*15; i < currPage * 15; i++) {
                            showAnime.push(`‧ ${guildArr[i]}`);
                        };
                    } else {
                        for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            showAnime.push(`‧ ${guildArr[i]}`);
                        };
                    };

                    Embed.setDescription(showAnime.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [row] });
                });

                next.on('collect', async r => {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                    });

                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;

                    let showAnime = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (i=(currPage-1)*15; i < currPage * 15; i++) {
                            showAnime.push(`‧ ${guildArr[i]}`);
                        };
                    } else {
                        for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            showAnime.push(`‧ ${guildArr[i]}`);
                        };
                    };

                    Embed.setDescription(showAnime.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [row] });
                });

            });

        };

        // Add premium
        if (action.startsWith("add premium")) {
            db.serialize(async () => {
                await query(`UPDATE users SET premium = ${action.split(" ")[2]} WHERE id = ${user.id}`);
            });
            return interaction.reply({content: "Action Successful", ephemeral: true});
        };

        // Add vote
        if (action === "add vote") {
            db.serialize(async () => {
                await query(`UPDATE users SET pullresets = pullresets + 1, votestotal = votestotal + 1, lootbox = lootbox + 1, lastvote = ${new Date().getTime()} WHERE id = ${user.id}`);
            });
            return interaction.reply({content: "Action Successful", ephemeral: true});
        };

        // Add vote
        if (action === "did") {
            let names = characters.map((e) => e.name).sort();
            let len = names.length-1, res = "";
            while (len--) if (names[len-1] === names[len]) res += names[len--] + "\n";
            return interaction.reply({content: res ? `Yes, he did!\n\n${res}` : "All's fine!", ephemeral: true});
        };

    },
};