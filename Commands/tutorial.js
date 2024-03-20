const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ComponentType } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { charactersA } = require("../Modules/chars.js");
const { achievements } = require("../Modules/achievements.js");
const { classes } = require("../Modules/classes.js");
const { skills } = require("../Modules/skills.js");
const { items } = require("../Modules/items.js");
const { splitTitle, getRefinement, rarity, searchClass, customEmojis, generateUniqueItemId } = require("../Modules/functions.js");

module.exports = {
    name: 'tutorial',
    description: 'tutorial',
    execute(interaction) {

        db.serialize(async () => {
            await interaction.deferReply().catch(() => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });

            async function triggerTutorial() {
                let stats = await query(`SELECT users.tutorial, users.favchar, users.battlechar, users.premium, users.items, characters.chars, characters.ref, characters.class, characters.skin, users.equipment, dungeon.classes FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON dungeon.id = users.id WHERE users.id = ${interaction.user.id}`);
                stats = { tutorial: JSON.parse(stats[0].tutorial), favchar: stats[0].favchar, battlechar: stats[0].battlechar, premium: stats[0].premium, items: JSON.parse(stats[0].items), chars: JSON.parse(stats[0].chars), ref: JSON.parse(stats[0].ref), class: JSON.parse(stats[0].class), skin: JSON.parse(stats[0].skin), equipment: JSON.parse(stats[0].equipment), classes: JSON.parse(stats[0].classes) };

                const tutorial = [0, 1, 2, 3, 4, 5, 6, 7].find((e) => !stats.tutorial.includes(e));

                if (tutorial === 0) {
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('accept')
                                .setLabel('I have read the ToS and accept all of them!')
                                .setStyle('Success'),
                        );

                    const Embed = new EmbedBuilder()
                        .setColor(0xbbffff)
                        .setTitle("Welcome, Adventurer!")
                        .setImage("https://i.imgur.com/Ta2YDBN.png")
                        .setDescription("It seems you are new here <:MashaWave:928370055354400799>\nMy name is Luminous, and I will walk you through the games features <:RaphiSmile:868998036645380197>\n\nBut before we can continue,\n➜ Please make sure to read through our [Terms of Service](https://github.com/Apollo24K/Camelot-Public-Repo/blob/main/ToS) and [Privacy Policy](https://github.com/Apollo24K/Camelot-Public-Repo/blob/main/Privacy%20Policy) and accept them.\n➜ This is to make sure players are aware of the bots rules and the associated risks <:ThumbsUp:1020442047712350298>");
                    interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then((msg) => {

                        const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "accept", componentType: ComponentType.Button, time: 120000 });

                        collector.on('collect', async () => {
                            collector.stop();

                            stats.tutorial.push(tutorial);
                            await query(`UPDATE users SET tutorial = '${JSON.stringify(stats.tutorial)}' WHERE id = ${interaction.user.id}`);

                            triggerTutorial();
                        });

                    });
                } else if (tutorial === 1) {

                    const Embed = new EmbedBuilder()
                        .setColor(0xbbffff)
                        .setTitle("Great, looks like you've made it this far!")
                        .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                        .setDescription("Then let's start by properly introducing myself again. My name's Luminous, but you can just call me Lumine <:ThumbsUp:1020442047712350298> And of course, my most important job is to introduce you to the world of Camelot!\nCamelot is a dungeon RPG with lots and lots of exciting features, but let's not bore you with a wall of text. Instead, let me show you!\n\n**/pull**\nCamelot lets you collect your favorite characters you're already familiar with from anime, manga, games, and more with the </pull:1011014030103674913> command. Try it out!");
                    interaction.editReply({ embeds: [Embed], components: [], fetchReply: false });

                    stats.tutorial.push(tutorial);
                    await query(`UPDATE users SET tutorial = '${JSON.stringify(stats.tutorial)}' WHERE id = ${interaction.user.id}`);
                } else if (tutorial === 2) {
                    if (interaction.commandName !== "pull") return interaction.editReply("Nope, that's not it! Try using </pull:1011014030103674913>");

                    let char = charactersA[Math.floor(Math.random() * charactersA.length)];

                    stats.chars.push(char.id);
                    if (char.id in stats.ref) stats.ref[char.id]++;
                    else stats.ref[char.id] = 1;
                    stats.tutorial.push(tutorial);

                    await query(`UPDATE characters SET chars = '${JSON.stringify(stats.chars)}', ref = '${JSON.stringify(stats.ref)}' WHERE id = ${interaction.user.id}`);
                    await query(`UPDATE users SET tutorial = '${JSON.stringify(stats.tutorial)}', battlechar = ${char.id} WHERE id = ${interaction.user.id}`);

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('continue')
                                .setLabel('Continue')
                                .setStyle('Success'),
                        );

                    const Embed = new EmbedBuilder()
                        .setColor(0x2cdfe5)
                        .setImage(char.image)
                        .setThumbnail(rarity(char.rarity))
                        .setDescription(`**${char.name}**\n${splitTitle(char.anime)}\n\n**Ref.** ${getRefinement(stats.ref[char.id])}`);
                    interaction.editReply({ content: "Hey, look! You got an<:ATier:869316558013464627>-Tier character, they're quite rare!", embeds: [Embed], components: [row], fetchReply: true }).then((msg) => {

                        const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "continue", componentType: ComponentType.Button, time: 60000 });

                        collector.on('collect', () => {
                            collector.stop();

                            triggerTutorial();
                        });

                    });
                } else if (tutorial === 3) {
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('continue')
                                .setLabel('Continue')
                                .setStyle('Success'),
                        );

                    const Embed = new EmbedBuilder()
                        .setColor(0xbbffff)
                        .setTitle("Congratulations on getting your first character!")
                        .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                        .setDescription(`You will be able to pull **5** characters evey **45** minutes, and there's more ways to get them such as through the \`/shop\`, \`/tickets\` or \`/lootbox\`.\n\nCharacters come in the rarities of\n<:DTier:869316616071032843>➜<:CTier:869316602858991657>➜<:BTier:869316586803179571>➜<:ATier:869316558013464627>➜<:STier:869316518675095552>➜ <:SSTier:869316489931546644> ➜ <a:EXTRA:1138530846144462968>\n\nYou can view your characters with \`/inventory\` or \`/info\` if you wanna see details on a specific character.\n\n**Tip**: I'm also available as a pullable character <:LuminousPsssh:1071574041116295328>`);
                    interaction.editReply({ content: "_ _", embeds: [Embed], components: [row], fetchReply: false }).then((msg) => {

                        const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "continue", componentType: ComponentType.Button, time: 60000 });

                        collector.on('collect', async () => {
                            collector.stop();

                            stats.tutorial.push(tutorial);
                            await query(`UPDATE users SET tutorial = '${JSON.stringify(stats.tutorial)}' WHERE id = ${interaction.user.id}`);

                            triggerTutorial();
                        });

                    });
                } else if (tutorial === 4) {
                    if (stats.classes.length) {
                        stats.tutorial.push(tutorial);
                        await query(`UPDATE users SET tutorial = '${JSON.stringify(stats.tutorial)}' WHERE id = ${interaction.user.id}`);

                        triggerTutorial();
                    } else {
                        if (interaction.commandName === "class" && interaction.options.getSubcommand() === "info") {
                            let choice = interaction.options.getString('class');

                            let fClass = searchClass(choice, interaction);
                            if (!fClass?.name) return;

                            // eslint-disable-next-line no-inner-declarations
                            function formatPath() {
                                if (!fClass.path.length) return "Unique\n";
                                let beginner = classes[fClass.path[0][0]];
                                let formatted = `${fClass.id === beginner.id ? `**${beginner.emblem + beginner.name}**` : beginner.emblem + beginner.name} `;
                                fClass.path.forEach((e, i) => {
                                    if (i) formatted += ["<:blank:917804200363171860><:blank:917804200363171860><:blank:917804200363171860> ", "<:blank:917804200363171860> <:blank:917804200363171860><:blank:917804200363171860> ", "<:blank:917804200363171860> <:blank:917804200363171860> <:blank:917804200363171860> "][beginner.name.length % 3]
                                        + "<:blank:917804200363171860>".repeat(beginner.name.length / 3);
                                    for (let j = 1; j < e.length; j++) {
                                        formatted += isNaN(e[j]) ? "➥ undefined" : `➥${classes[e[j]].emblem}${fClass.id === e[j] ? `**${classes[e[j]].name}**` : classes[e[j]].name} `;
                                    }
                                    formatted += "\n";
                                    // formatted += e.map((a) => isNaN(a) ? "NaN" : classes[a].emblem + classes[a].name + " ").join("➥") + "\n";
                                });
                                return formatted;
                            };

                            const Embed = new EmbedBuilder()
                                .setColor(0xbbffff)
                                .setTitle(fClass.name)
                                .setThumbnail(fClass.image)
                                .setDescription(`**Skill Cost**: ${skills[fClass.id].cost}\\💧\n**Grade**: ${["None", "Beginner", "Advanced", "Master", "Champion"][fClass.tier]}\n**Path**: ${formatPath()}\n**Active**: ${fClass.active}\n\n**Passive**: ${fClass.passive}\n`)
                                .addFields(
                                    { name: 'Stats', value: `\\💖 **HP**: ${Math.round(fClass.stats.hp[0] * 100)}%\n\\⚔️ **ATK**: ${Math.round(fClass.stats.atk[0] * 100)}%\n\\🛡️ **DEF**: ${Math.round(fClass.stats.def[0] * 100)}%\n<:magic_dmg:948568336621527040> **Magic Dmg**: ${fClass.stats.md[0] * 100}%\n\\🔰 **Magic Resist**: ${Math.floor(fClass.stats.mr[0] * 100)}%`, inline: true },
                                    { name: '_ _', value: `\\🎯 **Crit Rate**: x${fClass.stats.cr[0]}\n\\💥 **Crit Damage**: x${fClass.stats.cd[0]}\n\\🛡️ **Block Rate**: x${fClass.stats.br[0]}\n\\💨 **Dodge**: x${fClass.stats.dodge[0]}`, inline: true },
                                    { name: '_ _', value: `\\💧 **Mana**: ${fClass.stats.mana[1] < 0 ? "" : "+"}${fClass.stats.mana[1]}\n\\💦 **Mana Gen**: ${fClass.stats.mg[1] < 0 ? "" : "+"}${fClass.stats.mg[1]}`, inline: true },
                                )
                                .setFooter({ text: `ID: #${fClass.id}` });
                            return interaction.editReply({ embeds: [Embed] });
                        } else {

                            let options = [];
                            classes.filter((e) => e.tier === 1).forEach((e) => {
                                options.push({
                                    label: e.name,
                                    emoji: e.emblem,
                                    description: e.active.replace(/\*/g, ''),
                                    value: e.id + "",
                                });
                            });

                            const row = new ActionRowBuilder()
                                .addComponents(
                                    new StringSelectMenuBuilder()
                                        .setCustomId('class_selection')
                                        .setPlaceholder('Choose a beginner class...')
                                        .addOptions(options),
                                );

                            const Embed = new EmbedBuilder()
                                .setColor(0xbbffff)
                                .setTitle(`Let's Pick a Class!`)
                                .setDescription(`Camelot offers a variety of classes you can choose from for your character! These classes offer your character unique abilities they can use during a battle <:wow:1020442064409874462>\nBelow you can see our 10 beginner classes, which can further be upgraded to advanced and master classes later on <:TohruPoint:928370972132782090>\n\nYou can use </class info:1013516072126783628> to get more information on a class.`)
                                .setImage("https://i.ibb.co/NLQ8wDQ/Beginner-Classes.png");
                            return interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then((msg) => {

                                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "class_selection", componentType: ComponentType.StringSelect, time: 120000 });

                                collector.on('collect', async r => {
                                    collector.stop();
                                    await r.deferUpdate().catch(() => {
                                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${interaction.customId}"`);
                                    });

                                    // Tutorial complete
                                    stats.tutorial.push(tutorial);
                                    await query(`UPDATE users SET tutorial = '${JSON.stringify(stats.tutorial)}' WHERE id = ${interaction.user.id}`);

                                    // Check again if the person has no class
                                    let dgclasses = await query(`SELECT classes FROM dungeon WHERE id = ${interaction.user.id}`);
                                    dgclasses = JSON.parse(dgclasses[0].classes);
                                    if (dgclasses.length === 0) {
                                        // Add class to user inventory
                                        stats.classes.push(parseInt(r.values[0]));
                                        await query(`UPDATE dungeon SET classes = "${JSON.stringify(stats.classes)}" WHERE id = ${interaction.user.id}`);

                                        // Assign class
                                        // if (stats.battlechar) stats.class[stats.battlechar] = parseInt(r.values[0]);
                                        // await query(`UPDATE characters SET class = '${JSON.stringify(stats.class)}' WHERE id = ${interaction.user.id}`);
                                        await query(`UPDATE users SET class = ${parseInt(r.values[0])} WHERE id = ${interaction.user.id}`);

                                        const row = new ActionRowBuilder()
                                            .addComponents(
                                                new ButtonBuilder()
                                                    .setCustomId('continue')
                                                    .setLabel('Continue')
                                                    .setStyle('Success'),
                                            );

                                        const Embed = new EmbedBuilder()
                                            .setColor(0xbbffff)
                                            .setTitle(`You have unlocked ${classes[r.values[0]].name}! 🎉`)
                                            .setThumbnail(classes[r.values[0]].image)
                                            .setDescription(`Once you reach level 40 on your ${classes[r.values[0]].name} class you will be able to upgrade it to either **${classes[classes[r.values[0]].path[0][1]].name}** or **${classes[classes[r.values[0]].path[1][1]].name}**! <a:TaigaHappy:1045396982627323975>`);
                                        interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then((msg) => {

                                            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "continue", componentType: ComponentType.Button, time: 60000 });

                                            collector.on('collect', () => {
                                                collector.stop();

                                                triggerTutorial();
                                            });

                                        });
                                    } else {
                                        triggerTutorial();
                                    };

                                });

                            });
                        };

                    };
                } else if (tutorial === 5) {
                    // eslint-disable-next-line no-inner-declarations
                    function listItem(id) {
                        // return `\n<:barn:994957076264661073>${items[id].emoji}**${items[id].name}** ➜ \`${items[id].psmin}\` ${customEmojis[items[id].primaryStat] || items[id].primaryStat} and \`${items[id].ssmin}\` ${customEmojis[items[id].secondaryStat] || items[id].secondaryStat}`
                        return `\n<:barn:994957076264661073>${items[id].emoji}\`${items[id].name}${" ".repeat(19 - items[id].name.length)}\` ➜ \`${items[id].psmin < 10 ? " " + items[id].psmin : items[id].psmin}\` ${customEmojis[items[id].primaryStat] || items[id].primaryStat} and \`${items[id].ssmin.length === 1 ? " " + items[id].ssmin : items[id].ssmin}\` ${customEmojis[items[id].secondaryStat] || items[id].secondaryStat}`;
                    };

                    let bestChoice = "";
                    switch (stats.class[stats.battlechar]) {
                        case 0: bestChoice = `\n\nBased on the class you chose earlier, I'd recommend you to pick **${items[58].name}** for now <:ClaraThumbsUp:1034899843505721514>`; break;
                        case 1: bestChoice = `\n\nBased on the class you chose earlier, I'd recommend you to pick **${items[58].name}** for now <:ClaraThumbsUp:1034899843505721514>`; break;
                        case 2: bestChoice = `\n\nBased on the class you chose earlier, I'd recommend you to pick **${items[61].name}** for now <:ClaraThumbsUp:1034899843505721514>`; break;
                        case 3: bestChoice = `\n\nBased on the class you chose earlier, I'd recommend you to pick **${items[61].name}** for now <:ClaraThumbsUp:1034899843505721514>`; break;
                        case 4: bestChoice = `\n\nBased on the class you chose earlier, I'd recommend you to pick **${items[62].name}** for now <:ClaraThumbsUp:1034899843505721514>`; break;
                        case 5: bestChoice = `\n\nBased on the class you chose earlier, I'd recommend you to pick **${items[64].name}** for now <:ClaraThumbsUp:1034899843505721514>`; break;
                        case 6: bestChoice = `\n\nBased on the class you chose earlier, I'd recommend you to pick **${items[63].name}** for now <:ClaraThumbsUp:1034899843505721514>`; break;
                        case 7: bestChoice = `\n\nBased on the class you chose earlier, I'd recommend you to pick **${items[60].name}** for now <:ClaraThumbsUp:1034899843505721514>`; break;
                        case 8: bestChoice = `\n\nBased on the class you chose earlier, I'd recommend you to pick **${items[59].name}** for now <:ClaraThumbsUp:1034899843505721514>`; break;
                        case 9: bestChoice = `\n\nBased on the class you chose earlier, I'd recommend you to pick **${items[62].name}** for now <:ClaraThumbsUp:1034899843505721514>`; break;
                        default: break;
                    };

                    let options = [];
                    [58, 59, 60, 61, 62, 63, 64].forEach((e) => {
                        options.push({
                            label: items[e].name,
                            emoji: items[e].emoji,
                            value: items[e].id + "",
                            //description: e.active.replace(/\*/g, ''),
                        });
                    });

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('class_selection')
                                .setPlaceholder('Choose a weapon...')
                                .addOptions(options),
                        );

                    const Embed = new EmbedBuilder()
                        .setColor(0xbbffff)
                        .setTitle("Next, let's pick a weapon to start off your journey!")
                        .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                        .setDescription(`A reliable weapon is a must for any aspiring adventurer! Luckily, I'm here to help you find the perfect one for you <:HayasakaSmile:928369469301088326>\n\nThese are the 7 weapons you can choose from: ${listItem(58) + listItem(59) + listItem(60) + listItem(61) + listItem(62) + listItem(63) + listItem(64)}${bestChoice}`);
                    interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then((msg) => {

                        const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "class_selection", componentType: ComponentType.StringSelect, time: 60000 });

                        collector.on('collect', async r => {
                            collector.stop();
                            await r.deferUpdate().catch(() => {
                                console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${interaction.customId}"`);
                            });

                            // Write to database
                            const uid = generateUniqueItemId(interaction.user.id, []);
                            await query(`INSERT INTO weapons (id, itemid, uniqueid, character) VALUES (${interaction.user.id}, ${parseInt(r.values[0])}, '${uid + ":" + interaction.user.id}', ${stats.battlechar})`, 'run');

                            // Assign weapon
                            stats.equipment.weapon = uid + ":" + interaction.user.id;
                            await query(`UPDATE users SET equipment = '${JSON.stringify(stats.equipment)}' WHERE id = ${interaction.user.id}`);

                            // Update tutorial
                            stats.tutorial.push(tutorial);
                            await query(`UPDATE users SET tutorial = '${JSON.stringify(stats.tutorial)}' WHERE id = ${interaction.user.id}`);

                            triggerTutorial();

                        });

                    });

                } else if (tutorial === 6) {
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('continue')
                                .setLabel('Continue')
                                .setStyle('Success'),
                        );

                    const Embed = new EmbedBuilder()
                        .setColor(0xbbffff)
                        .setTitle("Great choice!")
                        .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                        .setDescription(`In the world of Camelot, weapons are equipable items which boost your characters stats and provide passive abilities.\n\nWeapons can be found in the following grades:\n<:normal1:1041732429397889054><:normal2:1041732425379762268><:normal3:1041732422145953892><:normal4:1041732419591622686>➜ <:special1:1041731419963150397><:special2:1041731418008600717><:special3:1041731415919833149><:special4:1041731414032392202>➜ <:rare1:1041731092031492106><:rare2:1041731088357281802><:rare3:1041731083965825096>➜ <:unique1:1041730066272493578><:unique2:1041730063940468828><:unique3:1041730061163831437><:unique4:1041730057380573386>\n➜ <:legendary1:1041726519082491964><:legendary2:1041726517153112094><:legendary3:1041726515475382322><:legendary4:1041726512992366605>➜ <:mythical1:1041726768530329690><:mythical2:1041726767188168724><:mythical3:1041726765577556039><:mythical4:1041726763862065162>➜ <:genesis1:1041725784546619502><:genesis2:1041725782176825485><:genesis3:1041725778611675237><:genesis4:1041725780218093629>\n\nSo, are weapons the only type of items in Camelot? **No!** From armor sets to rings and runes, Camelot offers over **600+** unique items <:HowCute:1026605362960408576>`);
                    interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then((msg) => {

                        const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "continue", componentType: ComponentType.Button, time: 60000 });

                        collector.on('collect', async () => {
                            collector.stop();

                            stats.tutorial.push(tutorial);
                            await query(`UPDATE users SET tutorial = '${JSON.stringify(stats.tutorial)}' WHERE id = ${interaction.user.id}`);

                            triggerTutorial();
                        });

                    });
                } else if (tutorial === 7) {
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('continue')
                                .setLabel('Finish Tutorial!')
                                .setStyle('Success'),
                        );

                    const Embed = new EmbedBuilder()
                        .setColor(0xbbffff)
                        .setTitle("That's it!")
                        .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                        .setDescription(`This concludes our little tour of the bot!\nI hope you've enjoyed my brief company <:ThumbsUp:1020442047712350298>\nBut I'm sure you can't wait to go out and explore the lands on your own now, I shouldn't hold you back any more <:MashaWave:928370055354400799>\n\n**✧ __What to do next?__ ✧**\n> ‧ You could </pull:1011014030103674913> characters\n> ‧ Claim your </daily:1011371510759428136>\n> ‧ Challenge the \`/dungeon\`\n> ‧ Visit the \`/shop\`\n> ‧ \`/levelup\` your characters\n> ‧ Hunt </achievements:1013464934065131551>\n> ‧ Catch some \`/fish\`\n> ‧ Discover new commands with </help:1010305606516740096>\n\nSee you again soon, in the dungeon <:LuminousPsssh:1071574041116295328>`);
                    interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then((msg) => {

                        const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "continue", componentType: ComponentType.Button, time: 60000 });

                        collector.on('collect', async () => {
                            collector.stop();

                            stats.tutorial.push(tutorial);
                            await query(`UPDATE users SET tutorial = '${JSON.stringify(stats.tutorial)}' WHERE id = ${interaction.user.id}`);

                            // Achievements
                            achievements[50].check(interaction); // A New Adventure
                        });

                    });
                };

            };
            triggerTutorial();

        });

    },
};