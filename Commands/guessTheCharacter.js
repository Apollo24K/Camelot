import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ComponentType } from "discord.js";
import { db, query } from "../db_handler";
import { characters, charactersSS, charactersS, charactersA, charactersB, charactersC, charactersD } from "../Modules/chars";
import { splitTitle } from "../Modules/functions";
import { dailies } from "../Modules/dailyQuests";

const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('letter')
            .setLabel('Letter')
            .setStyle('Secondary'),
        new ButtonBuilder()
            .setCustomId('anime')
            .setLabel('Anime')
            .setStyle('Secondary'),
        new ButtonBuilder()
            .setCustomId('ignore_defer-guess')
            .setLabel('Guess')
            .setStyle('Primary'),
        new ButtonBuilder()
            .setCustomId('skip')
            .setLabel('Skip')
            .setStyle('Secondary'),
    );

function getModal(uid) {
    return new ModalBuilder()
        .setCustomId('gtc_modal' + uid)
        .setTitle('Guess the Character')
        .addComponents([
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('gtc_input')
                    .setLabel("What's the characters name?")
                    .setStyle('Short')
                    .setMinLength(1)
                    .setMaxLength(30)
                    .setPlaceholder('type name here...')
                    .setRequired(true),
            ),
        ]);
};

function gtcSearch(name) {
    let cArgs = name.split(" ");

    let fastCheck = characters.filter((e) => e.name.toLowerCase() === cArgs.join(' ') || e.alias.some((a) => a.toLowerCase() === cArgs.join(' ')));
    if (fastCheck[0] !== undefined) return fastCheck[0];

    let fArray = characters.filter((e) => e.name.toLowerCase()[0] === cArgs[0][0] || e.alias.some((a) => a.toLowerCase()[0] === cArgs[0][0]));

    let letter = 0;
    for (let word = 0; word < cArgs.length; word++) {
        let { length: wl } = cArgs[word];

        while (wl--) {
            fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[word] === undefined ? false : e.name.toLowerCase().split(" ")[word][letter] === cArgs[word][letter] || e.alias.some((a) => a.toLowerCase()[letter] === cArgs[word][letter]));
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
    execute(interaction) {

        let difficulty = interaction.options.getString('difficulty') || "easy";
        const isPrivate = interaction.options.getBoolean('private') || false;

        let charArray;
        if (difficulty === "easy") charArray = charactersSS.concat(charactersS);
        else if (difficulty === "normal") charArray = charactersSS.concat(charactersS).concat(charactersA);
        else if (difficulty === "hard") charArray = charactersSS.concat(charactersS).concat(charactersA).concat(charactersB);
        else if (difficulty === "extreme") charArray = charactersSS.concat(charactersS).concat(charactersA).concat(charactersB).concat(charactersC);
        else charArray = charactersSS.concat(charactersS).concat(charactersA).concat(charactersB).concat(charactersC).concat(charactersD);

        const pick = charArray[Math.floor(Math.random() * charArray.length)];
        const lettersRevealed = [];
        let points = 10;
        let animeTitle = "click on `Anime` to reveal";
        let scores = pick.name.replace(/[^ ]/g, "_").split(" ").map((e) => "\\" + e.split("").join(" \\")).join("ㅤ");
        let isPending = true;

        function revealLetter(index = undefined) {
            if (index !== undefined && lettersRevealed.includes(index)) return;

            let reveal = index ?? Math.floor(Math.random() * pick.name.split(" ").join("").length);
            let limit = 0;
            while (lettersRevealed.includes(reveal) && limit < 100) {
                reveal = Math.floor(Math.random() * pick.name.split(" ").join("").length);
                limit++;
            };
            lettersRevealed.push(reveal);
            let idx = 0;
            for (let i = 0; i < scores.length; i++) {
                if ((scores[i] === "_" || pick.name.split(" ").join("").includes(scores[i])) && idx++ === reveal) {
                    scores = scores.substring(0, i - 1) + pick.name.split(" ").join("")[reveal] + scores.substring(i + 1);
                };
            };
        };

        // Reveal special symbols
        for (let i = 0; i < pick.name.split(" ").join("").length; i++) {
            if (["(", ")", ".", "-", "_", ":", ";", "'", "+", "*"].includes(pick.name.split(" ").join("")[i])) revealLetter(i);
        };

        db.serialize(async () => {
            // await interaction.deferReply();

            const Embed = new EmbedBuilder()
                .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[pick.rarity])
                .setImage(pick.image)
                .setTitle("Guess the Character")
                .setDescription(`**Anime**: ${animeTitle}\n${scores}`)
                .setFooter({ text: "Hints: letter (-2 points), anime (-6 points)" });
            interaction[interaction.replied ? "followUp" : "reply"]({ embeds: [Embed], components: [row], fetchReply: true }).then((emsg) => {

                const collector = emsg.createMessageComponentCollector({ filter: (component) => (isPrivate ? (component.user.id === interaction.user.id) : true) && component.customId === "ignore_defer-guess", componentType: ComponentType.Button, time: 60000 });
                const hintLetter = emsg.createMessageComponentCollector({ filter: (component) => (isPrivate ? (component.user.id === interaction.user.id) : true) && component.customId === "letter", componentType: ComponentType.Button, time: 60000 });
                const hintAnime = emsg.createMessageComponentCollector({ filter: (component) => (isPrivate ? (component.user.id === interaction.user.id) : true) && component.customId === "anime", componentType: ComponentType.Button, time: 60000 });
                const skip = emsg.createMessageComponentCollector({ filter: (component) => (component.user.id === interaction.user.id) && component.customId === "skip", componentType: ComponentType.Button, time: 60000 });
                const uid = Math.random();

                let dailyPending = true;
                collector.on('collect', async component => {
                    if (component.isButton() && isPending) {
                        await component.showModal(getModal(uid));

                        interaction.awaitModalSubmit({ filter: (r) => r.customId === ('gtc_modal' + uid), time: 60000 }).then(async modalInteraction => {
                            const response = modalInteraction.fields.getTextInputValue('gtc_input');
                            if (!msgFilter(response, pick.id)) {
                                modalInteraction.reply(`Wrong guess by **${modalInteraction.user.username}**: ${response}`);
                            } else {
                                isPending = false;
                                collector.stop(), hintAnime.stop(), hintLetter.stop();

                                const { 0: stats } = await query(`SELECT lilies FROM users WHERE id = ${modalInteraction.user.id}`);
                                if (!stats) return modalInteraction.reply(`You don't have an account yet. Start playing with \`/pull\``);

                                const Embed = new EmbedBuilder()
                                    .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[pick.rarity])
                                    .setThumbnail(pick.image)
                                    .setTitle("You got it! 🎉")
                                    .setDescription(`**Name**: ${pick.name}\n**Anime**: ${pick.anime}\nYou've gained **${points}** <:lilium:974057059618291732>`)
                                    .setFooter({ text: `${modalInteraction.user.tag}`, iconURL: modalInteraction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" });
                                modalInteraction.reply({ embeds: [Embed] });

                                await query(`UPDATE users SET lilies = lilies + ${points} WHERE id = ${modalInteraction.user.id}`);

                                // Daily Quests
                                if (dailyPending) dailies[1].update(interaction, points, modalInteraction.user);
                                dailyPending = false;
                            };
                        }).catch(() => {
                            false;
                        });
                    };
                });

                hintAnime.on('collect', () => {
                    if (points < 6) return interaction.channel.send("You've already used up all points <:BigSad:928369010217746442>");
                    points -= 6;
                    animeTitle = splitTitle(pick.anime);
                    Embed.setDescription(`**Anime**: ${animeTitle}\n${scores}`);
                    emsg.edit({ embeds: [Embed] });
                });

                hintLetter.on('collect', () => {
                    if (points < 2) return interaction.channel.send("You've already used up all points <:BigSad:928369010217746442>");
                    points -= 2;
                    let reveal = Math.floor(Math.random() * pick.name.split(" ").join("").length);
                    let limit = 0;
                    while (lettersRevealed.includes(reveal) && limit < 100) {
                        reveal = Math.floor(Math.random() * pick.name.split(" ").join("").length);
                        limit++;
                    };
                    lettersRevealed.push(reveal);
                    let idx = 0;
                    for (let i = 0; i < scores.length; i++) {
                        if ((scores[i] === "_" || pick.name.split(" ").join("").includes(scores[i])) && idx++ === reveal) {
                            scores = scores.substring(0, i - 1) + pick.name.split(" ").join("")[reveal] + scores.substring(i + 1);
                        };
                    };
                    Embed.setDescription(`**Anime**: ${animeTitle}\n${scores}`);
                    emsg.edit({ embeds: [Embed] });
                });

                skip.on('collect', async () => {
                    hintAnime.stop(), hintLetter.stop();
                    await collector.stop();

                    module.exports.execute(interaction);
                });

                collector.on('end', () => {
                    if (isPending) {
                        isPending = false;
                        hintAnime.stop(), hintLetter.stop(), collector.stop();

                        const Embed = new EmbedBuilder()
                            .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[pick.rarity])
                            .setThumbnail(pick.image)
                            .setTitle("Time's up!")
                            .setDescription(`And no one got it right <:BigSad:928369010217746442>\n**Name**: ||${pick.name}||\n**Anime**: ${hintAnime.received ? pick.anime : `||${pick.anime}||`}\nNo lilies were earned <:lilium:974057059618291732>`);
                        interaction.channel.send({ embeds: [Embed] });
                    };
                });


            });

        });

    },
};