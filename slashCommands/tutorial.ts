import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ComponentType, ButtonStyle, SelectMenuComponentOptionData } from "discord.js";
import { charactersA } from "../Modules/chars";
import { achievements } from "../Modules/achievements";
import classInfo, { classes } from "../Modules/classes";
import { skills } from "../Modules/skills";
import { items, weaponInfo } from "../Modules/items";
import { splitTitle, getRefinement, rarity, searchClass, customEmojis, generateUniqueItemId } from "../Modules/functions";
import { SlashCommand } from "../types";
import { getUserSchema, insertNewWeapon, updateUsers } from "../Modules/queries";

function formatPath(fClass: classInfo) {
    if (!fClass.path.length) return "Unique\n";
    let beginner = classes[fClass.path[0][0]];
    let formatted = `${fClass.id === beginner.id ? `**${beginner.emblem + beginner.name}**` : beginner.emblem + beginner.name} `;
    fClass.path.forEach((e: number[], i: number) => {
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

const exportCommand: SlashCommand = {
    name: 'tutorial',
    async execute({ interaction }) {

        await interaction.deferReply().catch(() => {
            return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
        });

        async function triggerTutorial() {
            const stats = await getUserSchema(interaction.user.id);
            if (!stats) return interaction.editReply("Something went wrong, please try again later.");

            const tutorial = [0, 1, 2, 3, 4, 5, 6, 7].find((e) => !stats.tutorial.includes(e));

            if (tutorial === 0) {
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('accept')
                            .setLabel('I have read the ToS and accept all of them!')
                            .setStyle(ButtonStyle.Success),
                    );

                const Embed = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setTitle(`Welcome, ${interaction.user.username}!`)
                    .setImage("https://i.imgur.com/Ta2YDBN.png")
                    .setDescription("It seems you are new here <:MashaWave:928370055354400799>\nMy name is Luminous, and I will walk you through the game's features!\n\nBut before we can continue,\n➜ Please make sure to read through our [Terms of Service](<https://rank.top/bot/camelot?page=terms>) and [Privacy Policy](<https://rank.top/bot/camelot?page=privacy>)\n➜ This is to make sure players are aware of the bot's rules and the associated risks <:KaeriThumbsUp:928369523021742090>\n➜ For further questions, you can join our [Support Server](<https://discord.gg/myy9PBCdEW>) and ask away!");
                interaction.editReply({ embeds: [Embed], components: [row] }).then((msg) => {

                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "accept", componentType: ComponentType.Button, time: 120000 });

                    collector.on('collect', async () => {
                        collector.stop();

                        await updateUsers(interaction.user.id, { tutorial: { type: 'append_unique', value: [tutorial] } });

                        triggerTutorial();
                    });

                });
            } else if (tutorial === 1) {

                const Embed = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setTitle("Great, looks like you've made it this far!")
                    .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                    .setDescription("Then let's start by properly introducing myself again. My name's Luminous, and my most important job is to introduce you to Camelot, a massive dungeon RPG with lots and lots of exciting features! Let me show you!\n\n**/pull**\nCamelot lets you collect your favorite characters whom you're already familiar with from anime, manga, games, and more with the </pull:1011014030103674913> command. Try it out!");
                interaction.editReply({ embeds: [Embed], components: [] });

                await updateUsers(interaction.user.id, { tutorial: { type: 'append_unique', value: [tutorial] } });

            } else if (tutorial === 2) {
                if (interaction.commandName !== "pull") return interaction.editReply("Nope, that's not it! Try using </pull:1011014030103674913>");

                let char = charactersA[Math.floor(Math.random() * charactersA.length)];

                await updateUsers(interaction.user.id, {
                    chars: { type: 'append', value: [char.id] },
                    tutorial: { type: 'append_unique', value: [tutorial] },
                    battlechar: { type: 'set', value: char.id }
                });

                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('continue')
                            .setLabel('Continue')
                            .setStyle(ButtonStyle.Success),
                    );

                const Embed = new EmbedBuilder()
                    .setColor(0x2cdfe5)
                    .setImage(char.image)
                    .setThumbnail(rarity(char.rarity))
                    .setDescription(`**${char.name}**\n${splitTitle(char.anime)}\n\n**Ref.** ${getRefinement(0)}`);
                interaction.editReply({ content: "Hey, look! You've pulled an<:ATier:869316558013464627>Tier character, they're quite rare!", embeds: [Embed], components: [row] }).then((msg) => {

                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "continue", componentType: ComponentType.Button, time: 60000 });

                    collector.on('collect', () => {
                        collector.stop();

                        triggerTutorial();
                    });

                });
            } else if (tutorial === 3) {
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('continue')
                            .setLabel('Continue')
                            .setStyle(ButtonStyle.Success),
                    );

                const Embed = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setTitle("Congratulations on getting your first character!")
                    .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                    .setDescription(`You will be able to pull **5** characters evey **45** minutes, and there's more ways to get them such as through \`/tickets\` or \`/lootbox\`.\n\nCharacters come in the rarities of\n<:DTier:869316616071032843>➜<:CTier:869316602858991657>➜<:BTier:869316586803179571>➜<:ATier:869316558013464627>➜<:STier:869316518675095552>➜ <:SSTier:869316489931546644> ➜ <a:EXTRA:1138530846144462968>\n\nYou can view your collection with \`/inventory\` or use \`/info\` to see details of a specific character.\n\n-# **Tip**: I'm also available as a pullable character <:LuminousPsssh:1071574041116295328>`);
                interaction.editReply({ content: "_ _", embeds: [Embed], components: [row] }).then((msg) => {

                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "continue", componentType: ComponentType.Button, time: 60000 });

                    collector.on('collect', async () => {
                        collector.stop();

                        await updateUsers(interaction.user.id, { tutorial: { type: 'append_unique', value: [tutorial] } });

                        triggerTutorial();
                    });

                });
            } else if (tutorial === 4) {
                if (stats.dungeon_classes.length) {
                    await updateUsers(interaction.user.id, { tutorial: { type: 'append_unique', value: [tutorial] } });
                    triggerTutorial();
                } else {
                    if (interaction.commandName === "class" && interaction.options.getSubcommand() === "info") {
                        let choice = interaction.options.getString('class', true);

                        let fClass = searchClass(choice, interaction);
                        if (!fClass) return;

                        const Embed = new EmbedBuilder()
                            .setColor(0xbbffff)
                            .setTitle(fClass.name)
                            .setThumbnail(fClass.image)
                            .setDescription(`**Skill Cost**: ${skills[fClass.id].cost}\\💧\n**Grade**: ${["None", "Beginner", "Advanced", "Master", "Champion"][fClass.tier]}\n**Path**: ${formatPath(fClass)}\n**Active**: ${fClass.active}\n\n**Passive**: ${fClass.passive}\n`)
                            .addFields(
                                { name: 'Stats', value: `\\💖 **HP**: ${Math.round(fClass.stats.hp[0] * 100)}%\n\\⚔️ **ATK**: ${Math.round(fClass.stats.atk[0] * 100)}%\n\\🛡️ **DEF**: ${Math.round(fClass.stats.def[0] * 100)}%\n<:magic_dmg:948568336621527040> **Magic Dmg**: ${fClass.stats.md[0] * 100}%\n\\🔰 **Magic Resist**: ${Math.floor(fClass.stats.mr[0] * 100)}%`, inline: true },
                                { name: '_ _', value: `\\🎯 **Crit Rate**: x${fClass.stats.cr[0]}\n\\💥 **Crit Damage**: x${fClass.stats.cd[0]}\n\\🛡️ **Block Rate**: x${fClass.stats.br[0]}\n\\💨 **Dodge**: x${fClass.stats.dodge[0]}`, inline: true },
                                { name: '_ _', value: `\\💧 **Mana**: ${fClass.stats.mana[1] < 0 ? "" : "+"}${fClass.stats.mana[1]}\n\\💦 **Mana Gen**: ${fClass.stats.mg[1] < 0 ? "" : "+"}${fClass.stats.mg[1]}`, inline: true },
                            )
                            .setFooter({ text: `ID: #${fClass.id}` });
                        return interaction.editReply({ embeds: [Embed] });
                    } else {

                        let options: SelectMenuComponentOptionData[] = [];
                        classes.filter((e) => e.tier === 1).forEach((e) => {
                            options.push({
                                label: e.name,
                                emoji: e.emblem,
                                description: e.active.replace(/\*/g, ''),
                                value: e.id + "",
                            });
                        });

                        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                            .addComponents(
                                new StringSelectMenuBuilder()
                                    .setCustomId('class_selection')
                                    .setPlaceholder('Choose a beginner class...')
                                    .addOptions(options),
                            );

                        const Embed = new EmbedBuilder()
                            .setColor(0xbbffff)
                            .setTitle(`Now Let's Pick a Class!`)
                            .setDescription(`Camelot offers over **50+** classes you can choose from! These classes offer your characters unique abilities they can use during interactive battles <:wow:1020442064409874462>\n\nBelow you can see the **10** beginner classes, which can then be further upgraded to advanced and master grade classes!\n\n-# **Tip**: Use </class info:1013516072126783628> to learn more about a specific class <:ThumbsUp:1020442047712350298>`)
                            .setImage("https://i.ibb.co/NLQ8wDQ/Beginner-Classes.png");
                        return interaction.editReply({ embeds: [Embed], components: [row] }).then((msg) => {

                            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "class_selection", componentType: ComponentType.StringSelect, time: 120000 });

                            collector.on('collect', async r => {
                                collector.stop();
                                await r.deferUpdate().catch(() => {
                                    console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}"`);
                                });

                                if (stats.dungeon_classes.length === 0) {
                                    const classId = parseInt(r.values[0]);

                                    await updateUsers(interaction.user.id, {
                                        tutorial: { type: 'append_unique', value: [tutorial] },
                                        dungeon_classes: { type: 'append_unique', value: [classId] },
                                        class: { type: 'set', value: classId }
                                    });

                                    const row = new ActionRowBuilder<ButtonBuilder>()
                                        .addComponents(
                                            new ButtonBuilder()
                                                .setCustomId('continue')
                                                .setLabel('Continue')
                                                .setStyle(ButtonStyle.Success),
                                        );

                                    const Embed = new EmbedBuilder()
                                        .setColor(0xbbffff)
                                        .setTitle(`You have unlocked ${classes[classId].name}! 🎉`)
                                        .setThumbnail(classes[classId].image)
                                        .setDescription(`Once you reach level 40 on your ${classes[classId].name} class you will be able to upgrade it to either **${classes[classes[classId].path[0][1]].name}** or **${classes[classes[classId].path[1][1]].name}**! <a:TaigaHappy:1045396982627323975>`);
                                    interaction.editReply({ embeds: [Embed], components: [row] }).then((msg) => {

                                        const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "continue", componentType: ComponentType.Button, time: 60000 });

                                        collector.on('collect', () => {
                                            collector.stop();

                                            triggerTutorial();
                                        });

                                    });
                                } else {
                                    await updateUsers(interaction.user.id, { tutorial: { type: 'append_unique', value: [tutorial] } });

                                    triggerTutorial();
                                };

                            });

                        });
                    };

                };
            } else if (tutorial === 5) {
                // eslint-disable-next-line no-inner-declarations
                function listItem(id: number) {
                    const weapon = items[id] as weaponInfo;
                    return `\n<:barn:994957076264661073>${weapon.emoji}\`${weapon.name}${" ".repeat(19 - weapon.name.length)}\` ➜ \`${weapon.psmin < 10 ? " " + weapon.psmin : weapon.psmin}\` ${customEmojis[weapon.primaryStat] || weapon.primaryStat} and \`${weapon.ssmin.length === 1 ? " " + weapon.ssmin : weapon.ssmin}\` ${customEmojis[weapon.secondaryStat] || weapon.secondaryStat}`;
                };

                let bestChoice = "";
                switch (stats.class) {
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

                let options: SelectMenuComponentOptionData[] = [];
                [58, 59, 60, 61, 62, 63, 64].forEach((e) => {
                    options.push({
                        label: items[e].name,
                        emoji: items[e].emoji,
                        value: items[e].id + "",
                        //description: e.active.replace(/\*/g, ''),
                    });
                });

                const row = new ActionRowBuilder<StringSelectMenuBuilder>()
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
                    .setDescription(`A reliable weapon is a must for any aspiring adventurer! Luckily, I'm here to help you find the perfect one for you <:KanaPoint:1298637938107879497>\n\nThese are the 7 weapons you can choose from: ${listItem(58) + listItem(59) + listItem(60) + listItem(61) + listItem(62) + listItem(63) + listItem(64)}${bestChoice}`);
                interaction.editReply({ embeds: [Embed], components: [row] }).then((msg) => {

                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "class_selection", componentType: ComponentType.StringSelect, time: 60000 });

                    collector.on('collect', async r => {
                        collector.stop();
                        await r.deferUpdate().catch(() => {
                            console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}"`);
                        });

                        const item = items[parseInt(r.values[0])];

                        // Insert new weapon
                        const drop = await insertNewWeapon(interaction.user.id, item.id, item.category);

                        // Update users table
                        stats.equipment.weapon = drop.uniqueid;
                        await updateUsers(interaction.user.id, {
                            equipment: { type: "set", value: stats.equipment },
                            tutorial: { type: 'append_unique', value: [tutorial] }
                        });

                        triggerTutorial();
                    });

                });

            } else if (tutorial === 6) {
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('continue')
                            .setLabel('Continue')
                            .setStyle(ButtonStyle.Success),
                    );

                const Embed = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setTitle("Great choice!")
                    .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                    .setDescription(`Weapons are crucial equipment which boost your character's stats and provide passive abilities <a:YuiNod:1059435876599484456>\n\nWeapons can be found in the following grades:\n<:normal1:1041732429397889054><:normal2:1041732425379762268><:normal3:1041732422145953892><:normal4:1041732419591622686>➜ <:special1:1041731419963150397><:special2:1041731418008600717><:special3:1041731415919833149><:special4:1041731414032392202>➜ <:rare1:1041731092031492106><:rare2:1041731088357281802><:rare3:1041731083965825096>➜ <:unique1:1041730066272493578><:unique2:1041730063940468828><:unique3:1041730061163831437><:unique4:1041730057380573386>\n➜ <:legendary1:1041726519082491964><:legendary2:1041726517153112094><:legendary3:1041726515475382322><:legendary4:1041726512992366605>➜ <:mythical1:1041726768530329690><:mythical2:1041726767188168724><:mythical3:1041726765577556039><:mythical4:1041726763862065162>➜ <:genesis1:1041725784546619502><:genesis2:1041725782176825485><:genesis3:1041725778611675237><:genesis4:1041725780218093629>\n\nSo, are weapons the only type of items in Camelot? **No!**\nFrom armor sets to rings and runes, Camelot offers over **600+** unique items <:HowCute:1026605362960408576>`);
                interaction.editReply({ embeds: [Embed], components: [row] }).then((msg) => {

                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "continue", componentType: ComponentType.Button, time: 60000 });

                    collector.on('collect', async () => {
                        collector.stop();

                        await updateUsers(interaction.user.id, { tutorial: { type: 'append_unique', value: [tutorial] } });

                        triggerTutorial();
                    });

                });
            } else if (tutorial === 7) {
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('continue')
                            .setLabel('Finish Tutorial!')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setLabel('Join our Support Server')
                            .setURL('https://discord.gg/myy9PBCdEW')
                            .setStyle(ButtonStyle.Link),
                    );

                const Embed = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setTitle("That's it for now!")
                    .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                    .setDescription(`This concludes our little tour of the bot!\nI hope you've enjoyed my brief company <:ThumbsUp:1020442047712350298>\n\nBut there's **a lot** more to explore, from the dungeon to raids, guilds, parties, stampedes, immortal cows (!?), frequent seasonal events, and so much more! <:HowCute:1026605362960408576>\n\nI'm sure you can't wait to go out and explore the lands on your own now, so I shouldn't hold you back any more. Have fun! <:MashaWave:928370055354400799>\n\n**✧ __So, what to do next?__ ✧**\n> - Explore! </help:1010305606516740096> and </faq:1169048590367334502> are your best friends <:ClaraThumbsUp:1034899843505721514>\n> - You could </pull:1011014030103674913> more characters\n> - Claim your </daily:1011371510759428136>\n> - Challenge the </dungeon:1014616988993204284>\n> - Hunt </achievements:1013464934065131551>\n> - Or take a break to catch some </fish:1087099255652622429> <:MikuHappy:1045096947876368404>\n> - And lastly, Camelot can be a bit overwhelming at first, so don't be afraid of asking for help on our [Support Server](<https://discord.gg/myy9PBCdEW>). After all, a journey is most fun together <:KanaPoint:1298637938107879497>\n\nSee you again soon, in the dungeon <:LuminousAlterPsssh:1124838040406331463>`);
                interaction.editReply({ embeds: [Embed], components: [row] }).then((msg) => {

                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "continue", componentType: ComponentType.Button, time: 60000 });

                    collector.on('collect', async () => {
                        collector.stop();

                        await updateUsers(interaction.user.id, { tutorial: { type: 'append_unique', value: [tutorial] } });

                        // Achievements
                        achievements[50].check(interaction); // A New Adventure
                    });

                });
            };

        };
        triggerTutorial();

    },
};

export default exportCommand;
