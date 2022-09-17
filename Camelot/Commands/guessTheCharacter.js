

// THIS COMMAND CURRENTLY DOESN'T WORK


const { MessageEmbed, MessageActionRow, MessageButton, Modal, TextInputComponent } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { characters, charactersSS, charactersS, charactersA, charactersB, charactersC, charactersD } = require("../Modules/chars.js");
const { splitTitle } = require("../Modules/functions.js");

module.exports = {
    name: 'guess',
	description: 'Guess the character game',
	execute(interaction, client) {
        
        let subcommand = interaction.options.getSubcommand();

        const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('letter')
                        .setLabel('Letter')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('anime')
                        .setLabel('Anime')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('guess')
                        .setLabel('Guess')
                        .setStyle('PRIMARY'),
                );
        
        const modal = new Modal()
        .setCustomId('gtc_modal')
        .setTitle('Guess the Character')
        .addComponents([
          new MessageActionRow().addComponents(
            new TextInputComponent()
              .setCustomId('gtc_input')
              .setLabel("What's the characters name?")
              .setStyle('SHORT')
              .setMinLength(1)
              .setMaxLength(20)
              .setPlaceholder('type name here...')
              .setRequired(true),
          ),
        ]);

        db.serialize(async () => {
            await interaction.deferReply();
            
            let charArray = charactersSS.concat(charactersS).concat(charactersA).concat(charactersB).concat(charactersC);
            let pick = charArray[Math.floor(Math.random() * charArray.length)];
            let points = 10;
            let lettersRevealed = [];
            let animeTitle = "type `anime` to reveal"
            let scores = pick.name.replace(/[^ ]/g, "_").split(" ").map((e) => "\\" + e.split("").join(" \\")).join("ㅤ");
            
            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setImage(pick.image)
            .setTitle("Guess the Character")
            .setDescription(`**Anime**: ${animeTitle}\n${scores}`)
            .setFooter("Hints: letter (-2 points), anime (-6 points)")
            interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then((emsg) => {
                
                function gtcSearch(name) {
                    let cArgs = name.split(" ");
    
                    let fastCheck = characters.filter((e) => e.name.toLowerCase() === cArgs.join(' ') || e.alias.some((a) => a.toLowerCase() === cArgs.join(' ')));
                    if (fastCheck[0] !== undefined) return fastCheck[0];
        
                    let fArray = characters.filter((e) => e.name.toLowerCase()[0] === cArgs[0][0] || e.alias.some((a) => a.toLowerCase()[0] === cArgs[0][0]));
        
                    let letter = 0;
                    for (word=0; word < cArgs.length; word++) {
                        let { length:wl } = cArgs[word];
        
                        while (wl--) {
                            fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[word] === undefined ? false :  e.name.toLowerCase().split(" ")[word][letter] === cArgs[word][letter] || e.alias.some((a) => a.toLowerCase()[letter] === cArgs[word][letter]));
                            letter++;
                        };
        
                        if (fArray.length < 2) break;
                        letter = 0;
                    };
        
                    if (fArray.length === 0 || fArray.length > 1) return {};
                    return fArray[0];
                };
    
                function msgFilter(response) {
                    let char = gtcSearch(response.trim().toLowerCase().split(/ +/g).join(" "));
                    if (!char.name || char.id !== pick.id) return false;
                    return true;
                };

                // const collector = message.channel.createMessageCollector({filter: msgFilter, max: 1, time: 60000});
                const collector = emsg.createMessageComponentCollector({filter: (r) => r.customId === "guess", componentType: 'BUTTON', time: 60000 });
                // const hintLetter = message.channel.createMessageCollector({filter: (msg) => msg.content.toLowerCase() === "letter" && lettersRevealed.length < pick.name.length-1, max: 6, time: 60000});
                const hintLetter = emsg.createMessageComponentCollector({filter: (r) => r.customId === "letter", componentType: 'BUTTON', time: 60000 });
                // const hintAnime = message.channel.createMessageCollector({filter: (msg) => msg.content.toLowerCase() === "anime", max: 1, time: 60000});
                const hintAnime = emsg.createMessageComponentCollector({filter: (r) => r.customId === "anime", componentType: 'BUTTON', time: 60000 });
                // const newGame = message.channel.createMessageCollector({filter: (msg) => ["guess-the-character", "gtc", "charguess", "guesschar", "guesscharacter"].map((e) => prefix+e).includes(msg.content.toLowerCase()), max: 1, time: 60000});


                let isPending = true;
                // setTimeout(() => {
                //     if (isPending) {
                //         const Embed = new MessageEmbed()
                //         .setColor(0xbbffff)
                //         .setThumbnail(pick.image)
                //         .setTitle("Time's up!")
                //         .setDescription(`And no one got it right <:BigSad:928369010217746442>\n**Name**: ||${pick.name}||\n**Anime**: ${hintAnime.received ? pick.anime : `||${pick.anime}||`}\nNo lilies were earned <:lilium:974057059618291732>`)
                //         interaction.channel.send({ embeds: [Embed] });
                //     };
                // }, 60000);

                collector.on('collect', async r => {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                    });

                    client.on('interactionCreate', async modalInteraction => {
                        if (modalInteraction.isButton() && modalInteraction.customId === 'guess') {
                            await modalInteraction.showModal(modal);
                        };
    
                        if (modalInteraction.isModalSubmit() && modalInteraction.customId === 'gtc_modal') {
                            const response = modalInteraction.fields.getTextInputValue('gtc_input');
                            if (msgFilter(response) === false) modalInteraction.reply(`Wrong guess by **${modalInteraction.user.username}**: ${response}`);
                            else {
                                var stats = await query(`SELECT lilies FROM users WHERE id = ${modalInteraction.user.id}`);
                                if (!stats[0]) return modalInteraction.reply(`You don't have an account yet. Start playing with \`/pull\``);
                                
                                collector.stop(), hintAnime.stop(), hintLetter.stop();//, newGame.stop();
                                isPending = false;
    
                                const Embed = new MessageEmbed()
                                .setColor(0xbbffff)
                                .setThumbnail(pick.image)
                                .setTitle("You got it! 🎉")
                                .setDescription(`**Name**: ${pick.name}\n**Anime**: ${pick.anime}\nYou've gained **${points}** <:lilium:974057059618291732>`)
                                .setFooter(`${modalInteraction.user.tag}`, modalInteraction.user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                                modalInteraction.reply({ embeds: [Embed] });
    
                                await query(`UPDATE users SET lilies = lilies + ${points} WHERE id = ${modalInteraction.user.id}`);
                            };
                        };
                    });
                });
    
                hintAnime.on('collect', async r => {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                    });

                    if (points < 6) return interaction.channel.send("You've already used up all points <:BigSad:928369010217746442>")
                    points -= 6;
                    animeTitle = splitTitle(pick.anime);
                    Embed.setDescription(`**Anime**: ${animeTitle}\n${scores}`);
                    emsg.edit({ embeds: [Embed] });
                });

                hintLetter.on('collect', async r => {
                    await r.deferUpdate().catch((err) => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                    });

                    if (points < 2) return interaction.channel.send("You've already used up all points <:BigSad:928369010217746442>")
                    points -= 2;
                    let reveal = Math.floor(Math.random() * pick.name.split(" ").join("").length);
                    let limit = 0;
                    while (lettersRevealed.includes(reveal) && limit < 100) {
                        reveal = Math.floor(Math.random() * pick.name.split(" ").join("").length);
                        limit++;
                    };
                    lettersRevealed.push(reveal);
                    let idx = 0;
                    for (i=0; i < scores.length; i++) {
                        if ((scores[i] === "_" || pick.name.split(" ").join("").includes(scores[i])) && idx++ === reveal) {
                            scores = scores.substring(0, i-1) + pick.name.split(" ").join("")[reveal] + scores.substring(i+1);
                        };
                    };
                    Embed.setDescription(`**Anime**: ${animeTitle}\n${scores}`);
                    emsg.edit({ embeds: [Embed] });
                });

                // newGame.on('collect', msg => {
                //     collector.stop(), hintAnime.stop(), hintLetter.stop(), newGame.stop();
                //     isPending = false;
                // });

            });

        });

    },
};