import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, ButtonBuilder, SelectMenuComponentOptionData, ButtonStyle } from "discord.js";
import { classes } from "../Modules/classes";
import { skills } from "../Modules/skills";
import { userLevel, getClassLvl, searchClass, customEmojis } from "../Modules/functions";
import { PageRow, OfferRow } from "../Modules/components";
import { SlashCommand } from "../types";
import { getUserSchema, getCachedUserSchema, updateUsersAndCache } from "../Modules/queries";

const exportCommand: SlashCommand = {
    name: 'class',
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction, author }) {

        const subcommand = interaction.options.getSubcommand();

        // Class List
        if (subcommand === "list") {
            const user = interaction.options.getUser('user') ?? interaction.user;
            const page = interaction.options.getInteger('page') ?? 1;

            const stats = user.id === interaction.user.id ? author.schema : await getCachedUserSchema(user.id, interaction.client);
            if (!stats) return interaction.reply("User not found");

            let beginner = classes.filter((e) => e.tier === 1).map((c) => `> ${c.emblem} ${c.name}${stats.dungeon_classes.includes(c.id) ? " <a:check:873196253276700682>" : ""}`); //.sort();
            let advanced = classes.filter((e) => e.tier === 2).map((c) => `> ${c.emblem} ${c.name}${stats.dungeon_classes.includes(c.id) ? " <a:check:873196253276700682>" : ""}`); //.sort();
            let master = classes.filter((e) => e.tier === 3).map((c) => `> ${c.emblem} ${c.name}${stats.dungeon_classes.includes(c.id) ? " <a:check:873196253276700682>" : ""}`); //.sort();
            let champion = classes.filter((e) => e.tier === 4).map((c) => `> ${c.emblem} ${c.name}${stats.dungeon_classes.includes(c.id) ? " <a:check:873196253276700682>" : ""}`); //.sort();

            let showC = ["**Beginner Classes** <:beginner_template:949462741784096808>", ...beginner, "", "**Advanced Classes** <:advanced_template:949462742153195570>", ...advanced, "", "**Master Classes** <:master_template:966385447880261672>", ...master, "", "**Champion Classes** <:champion_template:949462742128017428>", ...champion];

            let pagesTotal = Math.ceil(showC.length / 15);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };
            let left = showC.length % 15;

            let showF = [];
            if (currPage < pagesTotal || left === 0) {
                for (let i = (currPage - 1) * 15; i < currPage * 15; i++) {
                    showF.push(showC[i]);
                };
            } else {
                for (let i = (currPage - 1) * 15; i < (currPage * 15) - (15 - left); i++) {
                    showF.push(showC[i]);
                };
            };

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(`List of Classes`)
                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                .setDescription(`Use \`/class info <name or ID>\` for more information\nNot yet picked any class? See \`/class pick\`\n\n` + showF.join("\n"))
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            return interaction.reply({ embeds: [Embed], components: [PageRow] }).then(msg => {

                const prev = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: ComponentType.Button, time: 90000 });
                const next = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: ComponentType.Button, time: 90000 });

                prev.on('collect', () => {
                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;

                    let showF = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (let i = (currPage - 1) * 15; i < currPage * 15; i++) {
                            showF.push(showC[i]);
                        };
                    } else {
                        for (let i = (currPage - 1) * 15; i < (currPage * 15) - (15 - left); i++) {
                            showF.push(showC[i]);
                        };
                    };

                    Embed.setDescription(`Use \`/class info <name or ID>\` for more information\nNot yet picked any class? See \`/class pick\`\n\n` + showF.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed], components: [PageRow] });
                });

                next.on('collect', () => {
                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;

                    let showF = [];
                    if (currPage < pagesTotal || left === 0) {
                        for (let i = (currPage - 1) * 15; i < currPage * 15; i++) {
                            showF.push(showC[i]);
                        };
                    } else {
                        for (let i = (currPage - 1) * 15; i < (currPage * 15) - (15 - left); i++) {
                            showF.push(showC[i]);
                        };
                    };

                    Embed.setDescription(`Use \`/class info <name or ID>\` for more information\nNot yet picked any class? See \`/class pick\`\n\n` + showF.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed], components: [PageRow] });
                });
            });
        };

        // Class info
        if (subcommand === "info") {
            const choice = interaction.options.getString('class', true);

            const fClass = searchClass(choice, interaction);
            if (!fClass?.name) return;

            let formattedPath = "Unique\n";
            if (fClass.path.length) {
                let beginner = classes[fClass.path[0][0]];
                formattedPath = `${fClass.id === beginner.id ? `**${beginner.emblem + beginner.name}**` : beginner.emblem + beginner.name} `;
                fClass.path.forEach((e, i) => {
                    if (i) formattedPath += ["<:blank:917804200363171860><:blank:917804200363171860><:blank:917804200363171860> ", "<:blank:917804200363171860> <:blank:917804200363171860><:blank:917804200363171860> ", "<:blank:917804200363171860> <:blank:917804200363171860> <:blank:917804200363171860> "][beginner.name.length % 3]
                        + "<:blank:917804200363171860>".repeat(beginner.name.length / 3);
                    for (let j = 1; j < e.length; j++) {
                        formattedPath += isNaN(e[j]) ? "➥ undefined" : `➥${classes[e[j]].emblem}${fClass.id === e[j] ? `**${classes[e[j]].name}**` : classes[e[j]].name} `;
                    };
                    formattedPath += "\n";
                    // formattedPath += e.map((a) => isNaN(a) ? "NaN" : classes[a].emblem + classes[a].name + " ").join("➥") + "\n";
                });
            };

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(fClass.name)
                .setThumbnail(fClass.image)
                .setDescription(`**Skill Cost**: ${skills[fClass.id].cost}${customEmojis.mana}\n**Grade**: ${["None", "Beginner", "Advanced", "Master", "Champion"][fClass.tier]}\n**Path**: ${formattedPath}\n**Active**: ${fClass.active}\n\n**Passive**: ${fClass.passive}\n`)
                .addFields(
                    { name: 'Stats', value: `${customEmojis.hp} **HP**: ${Math.round(fClass.stats.hp[0] * 100)}%\n${customEmojis.atk} **ATK**: ${Math.round(fClass.stats.atk[0] * 100)}%\n${customEmojis.def} **DEF**: ${Math.round(fClass.stats.def[0] * 100)}%\n${customEmojis.md} **Magic Dmg**: ${fClass.stats.md[0] * 100}%\n${customEmojis.mr} **Magic Resist**: ${Math.floor(fClass.stats.mr[0] * 100)}%`, inline: true },
                    { name: '_ _', value: `${customEmojis.cr} **Crit Rate**: x${fClass.stats.cr[0]}\n${customEmojis.cd} **Crit Damage**: x${fClass.stats.cd[0]}\n${customEmojis.br} **Block Rate**: x${fClass.stats.br[0]}\n${customEmojis.dodge} **Dodge**: x${fClass.stats.dodge[0]}`, inline: true },
                    { name: '_ _', value: `${customEmojis.mana} **Mana**: ${fClass.stats.mana[1] < 0 ? "" : "+"}${fClass.stats.mana[1]}\n${customEmojis.mg} **Mana Gen**: ${fClass.stats.mg[1] < 0 ? "" : "+"}${fClass.stats.mg[1]}`, inline: true },
                )
                .setFooter({ text: `ID: #${fClass.id}` });
            return interaction.reply({ embeds: [Embed] });
        };

        // Class select
        if (subcommand === "select") {

            const classChoice = interaction.options.getString('class', true);

            const fClass = searchClass(classChoice, interaction);
            if (!fClass?.name) return;

            if (!author.schema.dungeon_classes.length) return interaction.reply(`You don't have any classes yet. Get started by picking a beginner class with \`/class pick\``);
            if (!author.schema.dungeon_classes.includes(fClass.id)) return interaction.reply(`You don't have the **${fClass.name}** class`);

            // Update users table
            await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates: {
                    class: { type: "set", value: fClass.id },
                },
            });

            return interaction.reply(`Your class has been changed to **${fClass.name}**`);
        };

        // Class pick
        if (subcommand === "pick") {
            const stats = author.schema;

            // Level
            let level = userLevel(stats.xp);

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
                .setTitle(`✧ Select a beginner Class ✧`)
                .setDescription(`   ➥ Use \`/class pick\` to select one from the list below\n   ➥ See \`/class info <class>\` for more information on a class\n   ➥ You will be able to pick a new class after every 10th user level\n   ➥ The 10 beginner classes are as follows:`)
                .setImage("https://i.ibb.co/NLQ8wDQ/Beginner-Classes.png");
            return interaction.reply({ embeds: [Embed], components: [row] }).then((msg) => {

                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "class_selection", componentType: ComponentType.StringSelect, time: 60000 });

                collector.on('collect', async r => {
                    if (stats.dungeon_classes.filter((e) => classes[e].tier === 1).length > Math.floor(level / 10)) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You have already claimed ${Math.floor(level / 10) ? `**${Math.floor(level / 10) + 1}**` : "a"} beginner ${Math.floor(level / 10) ? "classes" : "class"}. You can pick another one when you reach level **${10 * (Math.floor(level / 10) + 1)}**`);
                        return;
                    };
                    if (stats.dungeon_classes.includes(parseInt(r.values[0]))) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You already have the **${classes[parseInt(r.values[0])].name}** class`);
                        return;
                    };

                    stats.dungeon_classes.push(parseInt(r.values[0]));

                    if (interaction.channel?.isSendable()) interaction.channel.send(`Unlocked **${classes[parseInt(r.values[0])].name}** 🎉\nYou can change your class using \`/class select <class>\``);
                    collector.stop();

                    // Update users table
                    await updateUsersAndCache(interaction.client, interaction.user.id, {
                        updates: {
                            dungeon_classes: { type: "append_unique", value: [parseInt(r.values[0])] },
                        },
                    });
                });
            });
        };

        // Class upgrade
        if (subcommand === "upgrade") {

            const choice = interaction.options.getString('class', true);

            const stats = author.schema;
            if (!stats.dungeon_classes.length) return interaction.reply(`You don't have a class yet. Choose a beginner class with \`/class pick <class name or ID>\``);

            const fClass = searchClass(choice, interaction);
            if (!fClass?.name) return;
            if (fClass.tier === 1) return interaction.reply(`**${fClass.name}** is a beginner class`);
            if (stats.dungeon_classes.includes(fClass.id)) return interaction.reply(`You already have the **${fClass.name}** class`);
            if (fClass.path.length === 0) return interaction.reply(`**${fClass.name}** can't be obtained through a class upgrade. See \`/class info ${fClass.name}\` for more details.`);

            let cClass = classes[fClass.path[0][fClass.path[0].indexOf(fClass.id) - 1]];
            if (!stats.dungeon_classes.includes(cClass.id)) return interaction.reply(`You don't have the **${cClass.name}** class`);
            if ((getClassLvl(cClass.id, stats.dungeon_classlevels) || 0) < [0, 40, 60][cClass.tier]) return interaction.reply(`You'll have to level up your **${cClass.name}** class to level **${[0, 40, 60][cClass.tier]}** before you can upgrade to **${fClass.name}**`);

            if (cClass.path.length > 1) {
                for (let e of cClass.path) {
                    if (stats.dungeon_classes.includes(e[fClass.tier - 1])) return interaction.reply("You have already chosen another upgrade path for this class.");
                };
            };

            return interaction.reply({ content: `Are you sure you want to upgrade from your **${cClass.name}** class to **${fClass.name}**?`, components: [OfferRow] }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 15000 });

                collector.on('collect', async r => {
                    collector.stop();
                    if (r.customId === "cancel") {
                        if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                        return;
                    };

                    // Update users table
                    await updateUsersAndCache(interaction.client, interaction.user.id, {
                        updates: {
                            class: { type: "set", value: fClass.id },
                            dungeon_classes: { type: "append_unique", value: [fClass.id] },
                        },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`unlocked **${fClass.name}** 🎉`);
                });
            });
        };

        // Class level
        if (subcommand === "level") {
            const user = interaction.options.getUser('user') ?? interaction.user;
            let choice = interaction.options.getString('class');

            const stats = user.id === interaction.user.id ? author.schema : await getCachedUserSchema(user.id, interaction.client);
            if (!stats) return interaction.reply(`**${user.username}** hasn't started playing yet.`);

            if (!choice) {
                if (stats.class !== null) choice = "" + stats.class;
                else return interaction.reply(`Plase provide the name of the class.\nUsage: \`/class level <class> <user>\``);
            };

            const fClass = searchClass(choice, interaction);
            if (!fClass) return;

            if (!stats.dungeon_classes.length) return interaction.reply(`${user.id === interaction.user.id ? "You don't" : `**${user.username}** doesn't have`} a class yet. Pick a beginner class with \`/class pick\``);
            if (!stats.dungeon_classes.includes(fClass.id)) return interaction.reply(`${user.id === interaction.user.id ? "You don't" : `**${user.username}** doesn't`} have the **${fClass.name}** class.`);

            const level = getClassLvl(fClass.id, stats.dungeon_classlevels) || 0;
            const xpTotal = level * 50;
            const myXP = stats.dungeon_classlevels[fClass.id] - (level * (level - 1) * 25);
            const percent = Math.floor((myXP / xpTotal) * 1000);

            let bar = "<:barLh:872111263747035177><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            if (percent >= 875) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barRh:872111194188705848>";
            else if (percent >= 750) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barRh:872111194188705848>";
            else if (percent >= 625) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            else if (percent >= 500) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            else if (percent >= 375) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            else if (percent >= 250) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
            else if (percent >= 125) bar = "<:barL:872111285741969438><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setAuthor({ name: `${user.username}'s Class Level`, iconURL: user.displayAvatarURL({ size: 2048 }) })
                .setDescription(`${fClass.name} level: **${level}**\nXP required to level up: **${(xpTotal - myXP) || 0}**\n${bar}`)
                .setThumbnail(fClass.image);

            if (user.id === interaction.user.id && ((fClass.tier === 1 && level >= 40) || (fClass.tier === 2 && level >= 60))) {
                if ((fClass.upgrades.length === 0) || fClass.upgrades.map((e) => e.id).some(id => stats.dungeon_classes.includes(id))) return interaction.reply({ embeds: [Embed] });

                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        ...fClass.upgrades.map((e) => {
                            return new ButtonBuilder()
                                .setCustomId('' + e.id)
                                .setEmoji(e.emblem)
                                .setLabel(`Unlock ${e.name}`)
                                .setStyle(ButtonStyle.Secondary);
                        })
                    );

                Embed.setDescription(`${fClass.name} level: **${level}**\nXP required to level up: **${(xpTotal - myXP) || 0}**\n${bar}\n⚜️ You can upgrade your class!`);
                return interaction.reply({ embeds: [Embed], components: [row] }).then(msg => {

                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id, componentType: ComponentType.Button, max: 1, time: 30000 });

                    collector.on('collect', async r => {
                        collector.stop();
                        const stats = await getUserSchema(interaction.user.id);
                        if (!stats) return;

                        if (fClass.upgrades.map((e) => e.id).some(id => stats.dungeon_classes.includes(id))) {
                            if (interaction.channel?.isSendable()) interaction.channel.send("You have already upgraded this class");
                            return;
                        };

                        // Update users table
                        await updateUsersAndCache(interaction.client, interaction.user.id, {
                            updates: {
                                class: { type: "set", value: parseInt(r.customId) },
                                dungeon_classes: { type: "append_unique", value: [parseInt(r.customId)] },
                            },
                        });

                        if (interaction.channel?.isSendable()) interaction.channel.send(`unlocked **${classes[parseInt(r.customId)].name}** 🎉`);
                    });

                });
            };

            return interaction.reply({ embeds: [Embed] });
        };

        // Class upgrade
        if (subcommand === "transfer") {

            const oldClassName = interaction.options.getString('from', true);
            const newClassName = interaction.options.getString('to', true);

            const stats = author.schema;
            if (!stats.dungeon_classes.length) return interaction.reply(`You don't have a class yet. Choose a beginner class with \`/class pick <class name or ID>\``);
            if (stats.gems < 30) return interaction.reply(`You don't have enough gems. (**${stats.gems}**/30<:genesis_gems:1034179687720681492>)`);

            // Search classes
            const oldClass = searchClass(oldClassName, interaction);
            if (!oldClass) return;
            const newClass = searchClass(newClassName, interaction);
            if (!newClass) return;

            // Check if all conditions are fulfilled
            if (!stats.dungeon_classes.includes(oldClass.id)) return interaction.reply(`You don't have the **${oldClass.name}** class`);
            if (!stats.dungeon_classes.includes(newClass.id)) return interaction.reply(`You don't have the **${newClass.name}** class`);
            if (oldClass.tier < 3 || newClass.tier < 3) return interaction.reply("You can only transfer xp between master and champion classes.");
            if (oldClass.id === newClass.id) return interaction.reply(`You can't transfer xp to the same class.`);
            if (!stats.dungeon_classlevels[oldClass.id]) return interaction.reply(`Your **${oldClass.name}** class doesn't have any xp.`);

            return interaction.reply({ content: `Are you sure you want to transfer your xp from **${oldClass.name}** to **${newClass.name}** for **30**<:genesis_gems:1034179687720681492>?`, components: [OfferRow] }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 15000 });

                collector.on('collect', async r => {
                    collector.stop();
                    if (r.customId === "cancel") {
                        if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                        return;
                    };

                    const stats = author.schema;
                    if (!stats) return;

                    // Check if all conditions are fulfilled
                    if (stats.gems < 30) return interaction.reply(`You don't have enough gems. (**${stats.gems}**/30<:genesis_gems:1034179687720681492>)`);
                    if (!stats.dungeon_classlevels[oldClass.id]) return interaction.reply(`Your **${oldClass.name}** class doesn't have any xp.`);

                    const xp = stats.dungeon_classlevels[oldClass.id];
                    // if (newClass.id in stats.dungeon_classlevels) stats.dungeon_classlevels[newClass.id] += xp;
                    // else stats.dungeon_classlevels[newClass.id] = xp;

                    // delete stats.dungeon_classlevels[oldClass.id];

                    // Update users table
                    await updateUsersAndCache(interaction.client, interaction.user.id, {
                        updates: {
                            gems: { type: "increment", value: -30 },
                            dungeon_classlevels: { type: "merge_json", value: { [newClass.id]: xp, [oldClass.id]: -xp } },
                        },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`Transferred **${xp}** xp from **${oldClass.name}** to **${newClass.name}** 🎉`);
                });
            });
        };

        // Class switch
        if (subcommand === "switch") {
            const to = interaction.options.getString('to', true);

            // Search class
            const fClass = searchClass(to, interaction);
            if (!fClass?.name) return;
            if (fClass.tier === 1) return interaction.reply(`**${fClass.name}** is a beginner class`);
            if (fClass.path.length === 0) return interaction.reply(`**${fClass.name}** can't be obtained through a class switch. See \`/class info ${fClass.name}\` for more details.`);

            // Old class
            const beginner = classes[fClass.path[0][0]];
            const oldPath = beginner.path[0].includes(fClass.id) ? 1 : 0;
            const oldAdvanced = classes[beginner.path[oldPath][1]];
            const oldMaster = classes[beginner.path[oldPath][2]];

            // New class
            const newAdvanced = fClass.tier === 2 ? fClass : classes[fClass.path[0][1]];
            const newMaster = fClass.tier === 2 ? classes[fClass.path[0][2]] : fClass;

            const stats = author.schema;
            if (stats.gems < 100) return interaction.reply(`You don't have enough gems. (**${stats.gems}**/100<:genesis_gems:1034179687720681492>)`);
            if (stats.dungeon_classes.includes(fClass.id)) return interaction.reply(`You already have the **${fClass.name}** class`);
            if (!stats.dungeon_classes.includes(fClass.tier === 2 ? oldAdvanced.id : oldMaster.id)) return interaction.reply(`You don't have the **${fClass.tier === 2 ? oldAdvanced.name : oldMaster.name}** class`);

            return interaction.reply({ content: `Are you sure you want to switch from your current **${fClass.tier === 2 ? oldAdvanced.name : oldMaster.name}** class to **${fClass.tier === 2 ? newAdvanced.name : newMaster.name}** for 100<:genesis_gems:1034179687720681492>?`, components: [OfferRow] }).then(msg => {
                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, max: 1, time: 15000 });

                confirm.on('collect', async r => {
                    if (r.customId === "cancel") {
                        if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                        return;
                    };

                    const stats = await getUserSchema(interaction.user.id);
                    if (!stats) return;

                    if (stats.gems < 100) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough gems. (**${stats.gems}**/100<:genesis_gems:1034179687720681492>)`);
                        return;
                    };
                    if (stats.dungeon_classes.includes(fClass.id)) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You already have the **${fClass.name}** class`);
                        return;
                    };
                    if (!stats.dungeon_classes.includes(fClass.tier === 2 ? oldAdvanced.id : oldMaster.id)) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have the **${fClass.tier === 2 ? oldAdvanced.name : oldMaster.name}** class`);
                        return;
                    };

                    // Switch Advanced Classes
                    stats.dungeon_classes.splice((stats.dungeon_classes.indexOf(oldAdvanced.id)), 1);
                    stats.dungeon_classes.push(newAdvanced.id);
                    stats.dungeon_classlevels[newAdvanced.id] = stats.dungeon_classlevels[oldAdvanced.id] || 0;
                    delete stats.dungeon_classlevels[oldAdvanced.id];

                    // Switch Master Classes
                    if (stats.dungeon_classes.includes(oldMaster.id)) {
                        stats.dungeon_classes.splice((stats.dungeon_classes.indexOf(oldMaster.id)), 1);
                        stats.dungeon_classes.push(newMaster.id);
                        stats.dungeon_classlevels[newMaster.id] = stats.dungeon_classlevels[oldMaster.id] || 0;
                        delete stats.dungeon_classlevels[oldMaster.id];
                    };

                    stats.presets.forEach((preset, i) => {
                        if (preset.class === oldAdvanced.id) stats.presets[i].class = newAdvanced.id;
                        if (preset.class === oldMaster.id) stats.presets[i].class = newMaster.id;
                    });

                    // Update users table
                    await updateUsersAndCache(interaction.client, interaction.user.id, {
                        updates: {
                            gems: { type: "increment", value: -100 },
                            presets: { type: "set", value: stats.presets },
                            dungeon_classes: { type: "set", value: stats.dungeon_classes },
                            dungeon_classlevels: { type: "set", value: stats.dungeon_classlevels },
                        },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`unlocked **${fClass.tier === 2 ? newAdvanced.name : newMaster.name}** 🎉`);
                });

            });
        };

    },
};

export default exportCommand;
