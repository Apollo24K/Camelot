/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
const { MessageEmbed, MessageActionRow, MessageButton, Modal, TextInputComponent } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { characters, charactersSS, charactersS, charactersA, charactersB, charactersC, charactersD } = require("../Modules/chars.js");
const { splitTitle } = require("../Modules/functions.js");
const { dailies } = require("../Modules/dailyQuests.js");

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
            .setMaxLength(30)
            .setPlaceholder('type name here...')
            .setRequired(true),
        ),
    ]);

function gtcSearch(name) {
    let cArgs = name.split(" ");

    let fastCheck = characters.filter((e) => e.name.toLowerCase() === cArgs.join(' ') || e.alias.some((a) => a.toLowerCase() === cArgs.join(' ')));
    if (fastCheck[0] !== undefined) return fastCheck[0];

    let fArray = characters.filter((e) => e.name.toLowerCase()[0] === cArgs[0][0] || e.alias.some((a) => a.toLowerCase()[0] === cArgs[0][0]));

    let letter = 0;
    for (let word=0; word < cArgs.length; word++) {
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

function msgFilter(response, choice) {
    let char = gtcSearch(response.trim().toLowerCase().split(/ +/g).join(" "));
    return char?.id === choice;
};

module.exports = {
    name: 'guess',
	description: 'Guess the character game',
	execute(interaction, client) {

        let difficulty = interaction.options.getString('difficulty') || "hard";

        let charArray;
        if (difficulty === "easy") charArray = charactersSS.concat(charactersS).concat(charactersA);
        else if (difficulty === "normal") charArray = charactersSS.concat(charactersS).concat(charactersA).concat(charactersB);
        else if (difficulty === "hard") charArray = charactersSS.concat(charactersS).concat(charactersA).concat(charactersB).concat(charactersC);
        else charArray = charactersSS.concat(charactersS).concat(charactersA).concat(charactersB).concat(charactersC).concat(charactersD);

        const pick = charArray[Math.floor(Math.random() * charArray.length)];
        const lettersRevealed = [];
        let points = 10;
        let animeTitle = "click on `Anime` to reveal"
        let scores = pick.name.replace(/[^ ]/g, "_").split(" ").map((e) => "\\" + e.split("").join(" \\")).join("ㅤ");
        let isPending = true;
        
        db.serialize(async () => {
            await interaction.deferReply();
            
            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setImage(pick.image)
            .setTitle("Guess the Character")
            .setDescription(`**Anime**: ${animeTitle}\n${scores}`)
            .setFooter("Hints: letter (-2 points), anime (-6 points)")
            interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then((emsg) => {
                
                const collector = emsg.createMessageComponentCollector({filter: (component) => component.customId === "guess", componentType: 'BUTTON', time: 60000 });
                const hintLetter = emsg.createMessageComponentCollector({filter: (component) => component.customId === "letter", componentType: 'BUTTON', time: 60000 });
                const hintAnime = emsg.createMessageComponentCollector({filter: (component) => component.customId === "anime", componentType: 'BUTTON', time: 60000 });
                
                const handleSubmit = async modalInteraction => {
                    if (modalInteraction.isModalSubmit() && modalInteraction.customId === 'gtc_modal') {
                        client.removeListener('interactionCreate', handleSubmit);
                        const response = modalInteraction.fields.getTextInputValue('gtc_input');
                        if (!msgFilter(response, pick.id)) {
                            modalInteraction.reply(`Wrong guess by **${modalInteraction.user.username}**: ${response}`);
                        } else {
                            isPending = false;
                            collector.stop(), hintAnime.stop(), hintLetter.stop();
                 
                            var stats = await query(`SELECT lilies FROM users WHERE id = ${modalInteraction.user.id}`);
                            if (!stats[0]) return modalInteraction.reply(`You don't have an account yet. Start playing with \`/pull\``);
                 
                            const Embed = new MessageEmbed()
                            .setColor(0xbbffff)
                            .setThumbnail(pick.image)
                            .setTitle("You got it! 🎉")
                            .setDescription(`**Name**: ${pick.name}\n**Anime**: ${pick.anime}\nYou've gained **${points}** <:lilium:974057059618291732>`)
                            .setFooter(`${modalInteraction.user.tag}`, modalInteraction.user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                            modalInteraction.reply({ embeds: [Embed] });
                 
                            await query(`UPDATE users SET lilies = lilies + ${points} WHERE id = ${modalInteraction.user.id}`);

                            // Daily Quests
                            dailies[1].update(interaction, points);
                        };
                    };
                };
                
                collector.on('collect', async component => {
                    if (component.isButton() && isPending) {
                        await component.showModal(modal);
                        client.on('interactionCreate', handleSubmit);
                    };
                });
                
                hintAnime.on('collect', async component => {
                    if (points < 6) return interaction.channel.send("You've already used up all points <:BigSad:928369010217746442>")
                    points -= 6;
                    animeTitle = splitTitle(pick.anime);
                    Embed.setDescription(`**Anime**: ${animeTitle}\n${scores}`);
                    emsg.edit({ embeds: [Embed] });
                });
                
                hintLetter.on('collect', async component => {
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
                    for (let i=0; i < scores.length; i++) {
                        if ((scores[i] === "_" || pick.name.split(" ").join("").includes(scores[i])) && idx++ === reveal) {
                            scores = scores.substring(0, i-1) + pick.name.split(" ").join("")[reveal] + scores.substring(i+1);
                        };
                    };
                    Embed.setDescription(`**Anime**: ${animeTitle}\n${scores}`);
                    emsg.edit({ embeds: [Embed] });
                });
                 
                collector.on('end', async (component) => {
                    client.removeListener('interactionCreate', handleSubmit);
                    
                    if (isPending) {
                        hintAnime.stop(), hintLetter.stop(), collector.stop();
                 
                        const Embed = new MessageEmbed()
                        .setColor(0xbbffff)
                        .setThumbnail(pick.image)
                        .setTitle("Time's up!")
                        .setDescription(`And no one got it right <:BigSad:928369010217746442>\n**Name**: ||${pick.name}||\n**Anime**: ${hintAnime.received ? pick.anime : `||${pick.anime}||`}\nNo lilies were earned <:lilium:974057059618291732>`)
                        interaction.channel.send({ embeds: [Embed] });
                    };
                });


            });

        });

    },
};