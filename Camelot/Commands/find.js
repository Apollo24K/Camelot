const { MessageEmbed } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { search } = require("../Modules/functions.js");

module.exports = {
	name: 'find',
	description: 'find a character in your server',
	execute(interaction) {

        let page = interaction.options.getInteger('page');
        
        db.serialize(async () => {            
            var servers = await query(`SELECT user_ids FROM servers WHERE id = ${interaction.guild.id}`);
            servers = servers[0];

            var stats = await query(`SELECT users.name, characters.chars FROM users JOIN characters ON users.id = characters.id WHERE users.rowid IN (${servers.user_ids})`);
            
            let char = search(interaction.options.getString('character'), [0], interaction);
            if (!char.name) return;

            let users = [];
            stats.forEach((user) => {
                let fChar = JSON.parse(user.chars).filter((e) => e === char.id);
                if (fChar.length) users.push(`**${user.name}** has **${fChar.length}** ${fChar.length == 1 ? "copy" : "copies"}`);
            });

            if (users.length < 1) return interaction.reply(`No one here has a copy of **${char.name}**`);

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle(`Found ${users.length} ${users.length > 1 ? "Players" : "Player"}`)
            .setThumbnail(char.image)
            if (users.length < 16) return interaction.reply({ embeds: [Embed.setDescription(users.join("\n"))] });

            let pagesTotal = Math.ceil(users.length / 15);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            let left = users.length % 15;
            let showUsersF = [];
            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                showUsersF.push(users[i]);
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

            interaction.reply({ embeds: [Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`)], components: [row], fetchReply: true }).then(msg => {

                const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });

                prev.on('collect', async r => {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                    });

                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;

                    showUsersF = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (i=(currPage-1)*15; i < currPage * 15; i++) {
                            showUsersF.push(users[i]);
                        };
                    } else {
                        for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            showUsersF.push(users[i]);
                        };
                    };
                    Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [row] });
                });

                next.on('collect', async r => {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                    });

                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;

                    showUsersF = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (i=(currPage-1)*15; i < currPage * 15; i++) {
                            showUsersF.push(users[i]);
                        };
                    } else {
                        for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                            showUsersF.push(users[i]);
                        };
                    };
                    Embed.setDescription(showUsersF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                    interaction.editReply({ embeds: [Embed], components: [row] });
                });
                
            });
            
        });

    },
};