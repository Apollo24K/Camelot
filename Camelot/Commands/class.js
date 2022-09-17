const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { classes } = require("../Modules/classes.js");
const { skills } = require("../Modules/skills.js");
const { userLevel, getClassLvl, search, searchClass } = require("../Modules/functions.js");

module.exports = {
    name: 'class',
	description: 'class related commands',
	execute(interaction) {
        
        let subcommand = interaction.options.getSubcommand();
        
        // Class List
        if (subcommand === "list") {
            let user = interaction.options.getUser('user') || interaction.user;
            let page = interaction.options.getInteger('page');
            
            db.serialize(async () => {
                var stats = await query(`SELECT classes FROM dungeon WHERE id = ${user.id}`);
                stats = stats[0];
                if (!stats) stats = {classes: []};
                
                let beginner = classes.filter((e) => e.tier === 1).map((c) => `> ${c.emblem} ${c.name}${stats.classes.includes(c.id) ? " <a:check:873196253276700682>" : ""}`) //.sort();
                let advanced = classes.filter((e) => e.tier === 2).map((c) => `> ${c.emblem} ${c.name}${stats.classes.includes(c.id) ? " <a:check:873196253276700682>" : ""}`) //.sort();
                let master = classes.filter((e) => e.tier === 3).map((c) => `> ${c.emblem} ${c.name}${stats.classes.includes(c.id) ? " <a:check:873196253276700682>" : ""}`) //.sort();
                let champion = classes.filter((e) => e.tier === 4).map((c) => `> ${c.emblem} ${c.name}${stats.classes.includes(c.id) ? " <a:check:873196253276700682>" : ""}`) //.sort();
                
                let showC = ["**Beginner Classes** <:beginner_template:949462741784096808>", ...beginner, "", "**Advanced Classes** <:advanced_template:949462742153195570>", ...advanced, "", "**Master Classes** <:master_template:966385447880261672>", ...master, "", "**Champion Classes** <:champion_template:949462742128017428>", ...champion]
    
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
                .setTitle(`List of Classes`)
                .setThumbnail("https://i.ibb.co/cgh59Lb/WWM4K98.png")
                .setDescription(`Use \`/class info <name or ID>\` for more information\nNot yet picked any class? See \`/class pick\`\n\n` + showF.join("\n"))
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
    
                        Embed.setDescription(`Use \`/class info <name or ID>\` for more information\nNot yet picked any class? See \`/class pick\`\n\n` + showF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
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
    
                        Embed.setDescription(`Use \`/class info <name or ID>\` for more information\nNot yet picked any class? See \`/class pick\`\n\n` + showF.join("\n")).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [row] });
                    });
                    
                });

            });
            return;
        };

        // Class info
        if (subcommand === "info") {
            let choice = interaction.options.getString('class');

            let fClass = searchClass(choice, interaction);
            if (!fClass?.name) return;

            function formatPath() {
                if (!fClass.path.length) return "Unique\n";
                let beginner = classes[fClass.path[0][0]];
                let formatted = `${fClass.id === beginner.id ? `**${beginner.emblem + beginner.name}**` : beginner.emblem + beginner.name} `;
                fClass.path.forEach((e, i) => {
                    if (i) formatted += ["<:blank:917804200363171860><:blank:917804200363171860><:blank:917804200363171860> ", "<:blank:917804200363171860> <:blank:917804200363171860><:blank:917804200363171860> ", "<:blank:917804200363171860> <:blank:917804200363171860> <:blank:917804200363171860> "][beginner.name.length%3]
                                      + "<:blank:917804200363171860>".repeat(beginner.name.length/3);
                    for (j=1; j < e.length; j++) {
                        formatted += isNaN(e[j]) ? "➥ undefined" : `➥${classes[e[j]].emblem}${fClass.id === e[j] ? `**${classes[e[j]].name}**` : classes[e[j]].name} `;
                    }
                    formatted += "\n";
                    // formatted += e.map((a) => isNaN(a) ? "NaN" : classes[a].emblem + classes[a].name + " ").join("➥") + "\n";
                });
                return formatted;
            };

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setTitle(fClass.name)
            .setThumbnail(fClass.image)
            .setDescription(`**Skill Cost**: ${skills[fClass.id].cost}\\💧\n**Grade**: ${["None", "Beginner", "Advanced", "Master", "Champion"][fClass.tier]}\n**Path**: ${formatPath()}\n**Active**: ${fClass.active}\n\n**Passive**: ${fClass.passive}\n`)
            .addFields(
                { name: 'Stats', value: `\\💖 **HP**: ${Math.round(fClass.stats.hp[0]*100)}%\n\\⚔️ **ATK**: ${Math.round(fClass.stats.atk[0]*100)}%\n\\🛡️ **DEF**: ${Math.round(fClass.stats.def[0]*100)}%\n<:magic_dmg:948568336621527040> **Magic Dmg**: ${fClass.stats.md[0]*100}%\n\\🔰 **Magic Resist**: ${Math.floor(fClass.stats.mr[0]*100)}%`, inline: true },
                { name: '_ _', value: `\\🎯 **Crit Rate**: x${fClass.stats.cr[0]}\n\\💥 **Crit Damage**: x${fClass.stats.cd[0]}\n\\🛡️ **Block Rate**: x${fClass.stats.br[0]}\n\\💨 **Dodge**: x${fClass.stats.dodge[0]}`, inline: true },
                { name: '_ _', value: `\\💧 **Mana**: ${fClass.stats.mana[1] < 0 ? "" : "+"}${fClass.stats.mana[1]}\n\\💦 **Mana Gen**: ${fClass.stats.mg[1] < 0 ? "" : "+"}${fClass.stats.mg[1]}`, inline: true },
            )
            .setFooter(`ID: #${fClass.id}`)
            return interaction.reply({ embeds: [Embed] });
        };
        
        // Class assign
        if (subcommand === "assign") {

            let classChoice = interaction.options.getString('class');
            let charChoice = interaction.options.getString('character');

            db.serialize(async () => {
                var stats = await query(`SELECT characters.chars, characters.class, dungeon.classes FROM characters JOIN dungeon ON characters.id = dungeon.id WHERE characters.id = ${interaction.user.id}`);
                stats = {chars: JSON.parse(stats[0].chars), class: JSON.parse(stats[0].class), classes: JSON.parse(stats[0].classes)};
                
                let fClass = searchClass(classChoice, interaction);
                if (!fClass?.name) return;
    
                if (!stats.classes.length) return interaction.reply(`You don't have any classes yet. Get started by picking a beginner class with \`/class pick\``);
                if (!stats.classes.includes(fClass.id)) return interaction.reply(`You don't have the **${fClass.name}** class`);
    
                let char = search(charChoice, stats.chars, interaction);
                if (!char?.name) return;
                if (!stats.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);
    
                stats.class[char.id] = fClass.id;
                interaction.reply(`Your **${char.name}**'s class has been changed to **${fClass.name}**`);

                await query(`UPDATE characters SET class = '${JSON.stringify(stats.class)}' WHERE id = ${interaction.user.id}`);
            });
        };

        // Class pick
        if (subcommand === "pick") {
            db.serialize(async () => {
                var stats = await query(`SELECT users.xp, dungeon.classes FROM users JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${interaction.user.id}`);
                stats = {xp: stats[0].xp, classes: JSON.parse(stats[0].classes)};

                // Level
                let level = userLevel(stats.xp);

                let options = [];
                classes.filter((e) => e.tier === 1).forEach((e) => {
                    options.push({
                        label: e.name,
                        emoji: e.emblem,
                        description: e.active.replace(/\*/g, ''),
                        value: e.id+"",
                    });
                });
    
                const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                    .setCustomId('class_selection')
                    .setPlaceholder('Choose a beginner class...')
                    .addOptions(options),
                );
    
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setTitle(`✧ Select a beginner Class ✧`)
                .setDescription(`   ➥ Use \`/class pick\` to select one from the list below\n   ➥ See \`/class info <class>\` for more information on a class\n   ➥ You will be able to pick a new class after every 10th user level\n   ➥ The 10 beginner classes are as follows:`)
                .setImage("https://i.ibb.co/NLQ8wDQ/Beginner-Classes.png")
                return interaction.reply({ embeds: [Embed], components: [row], fetchReply: true }).then((msg) => {
    
                    const collector = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "class_selection", componentType: 'SELECT_MENU', time: 60000 });
    
                    collector.on('collect', async r => {
                        await r.deferUpdate().catch((err) => {
                            console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                        });
    
                        if (stats.classes.filter((e) => classes[e].tier === 1).length > Math.floor(level/10)) return interaction.channel.send(`You have already claimed ${Math.floor(level/10) ? `**${Math.floor(level/10)+1}**` : "a"} beginner ${Math.floor(level/10) ? "classes" : "class"}. You can pick another one when you reach level **${10*(Math.floor(level/10)+1)}**`);
                        if (stats.classes.includes(parseInt(r.values[0]))) return interaction.channel.send(`You already have the **${classes[r.values[0]].name}** class`);
    
                        stats.classes.push(parseInt(r.values[0]));
    
                        interaction.channel.send(`Unlocked **${classes[r.values[0]].name}** 🎉\nYou can change your characters class with the \`/class assign <character> <class>\` command`);
                        collector.stop();

                        await query(`UPDATE dungeon SET classes = "${JSON.stringify(stats.classes)}" WHERE id = ${interaction.user.id}`);
                    });
    
                });
                
            });
            return;
        };

        // Class upgrade
        if (subcommand === "upgrade") {

            let choice = interaction.options.getString('class');

            db.serialize(async () => {
                var stats = await query(`SELECT users.xp, dungeon.classes, dungeon.classlevels FROM users JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${interaction.user.id}`);
                stats = {xp: stats[0].xp, classes: JSON.parse(stats[0].classes), classlevels: JSON.parse(stats[0].classlevels)};
                
                if (!stats.classes.length) return interaction.reply(`You don't have a class yet. Choose a beginner class with \`/class pick <class name or ID>\``)

                let fClass = searchClass(choice, interaction);
                if (!fClass?.name) return;
                if (fClass.tier === 1) return interaction.reply(`**${fClass.name}** is a beginner class`);
                if (stats.classes.includes(fClass.id)) return interaction.reply(`You already have the **${fClass.name}** class`)
                if (fClass.path.length === 0) return interaction.reply(`**${fClass.name}** can't be obtained through a class upgrade. See \`/class info ${fClass.name}\` for more details.`)
                
                let cClass = classes[fClass.path[0][fClass.path[0].indexOf(fClass.id)-1]];
                if (!stats.classes.includes(cClass.id)) return interaction.reply(`You don't have the **${cClass.name}** class`);
                if (getClassLvl(cClass.id, stats.classlevels) < [0, 40, 60][cClass.tier]) return interaction.reply(`You'll have to level up your **${cClass.name}** class to level **${[0, 40, 60][cClass.tier]}** before you can upgrade to **${fClass.name}**`);
    
                if (cClass.path.length > 1) {
                    for (e of cClass.path) {
                        if (stats.classes.includes(e[fClass.tier-1])) return interaction.reply("You have already chosen another upgrade path for this class.");
                    };
                };
    
                const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('confirm')
                            .setEmoji('☑️')
                            .setStyle('SECONDARY'),
                        new MessageButton()
                            .setCustomId('cancel')
                            .setEmoji('❎')
                            .setStyle('SECONDARY'),
                    );

                interaction.reply({ content: `Are you sure you want to upgrade from your **${cClass.name}** class to **${fClass.name}**?`, components: [row], fetchReply: true }).then(msg => {
    
                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 15000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 15000 });

                    confirm.on('collect', async r => {
                        await r.deferUpdate().catch((err) => {
                            console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                        });

                        stats.classes.push(fClass.id);

                        interaction.channel.send(`unlocked **${fClass.name}** 🎉`);
                        confirm.stop(), cancel.stop();

                        await query(`UPDATE dungeon SET classes = "${JSON.stringify(stats.classes)}" WHERE id = ${interaction.user.id}`);
                    });

                    cancel.on('collect', async r => {
                        await r.deferUpdate().catch((err) => {
                            console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}" on "${r.customId}"`);
                        });

                        interaction.channel.send("Action cancelled")
                        confirm.stop(), cancel.stop();
                    });
                    
                });

            });
            return;
        };

        // Class info
        if (subcommand === "level") {
            let user = interaction.options.getUser('user') || interaction.user;
            let choice = interaction.options.getString('class');
            
            db.serialize(async () => {
                var stats = await query(`SELECT users.battlechar, characters.class, dungeon.classes, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${user.id}`);
                if (!stats[0]) return interaction.reply(`**${user.username}** hasn't started playing yet.`)
                stats = {battlechar: stats[0].battlechar, class: JSON.parse(stats[0].class), classes: JSON.parse(stats[0].classes), classlevels: JSON.parse(stats[0].classlevels)};
                
                if (!choice) {
                    if (stats.battlechar in stats.class) choice = "" + stats.class[stats.battlechar];
                    else return interaction.reply(`Plase provide the name of the class.\nUsage: \`/class level <class> <user>\``);
                };
                
                let fClass = searchClass(choice, interaction);
                if (!fClass?.name) return;
    
                if (!stats.classes.length) return interaction.reply(`${user.id === interaction.user.id ? "You don't" : `**${user.username}** doesn't have`} a class yet. Pick a beginner class with \`/class pick\``);
                if (!stats.classes.includes(fClass.id)) return interaction.reply(`${user.id === interaction.user.id ? "You don't" : `**${user.username}** doesn't`} have the **${fClass.name}** class.`);

                let level = getClassLvl(fClass.id, stats.classlevels);
                
                let xpTotal = level * 50;
                let myXP = stats.classlevels[fClass.id] - (level * (level-1) * 25);
                let percent = Math.floor((myXP/xpTotal)*1000);
    
                let bar = "<:barLh:872111263747035177><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                if (percent >= 875) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barRh:872111194188705848>";
                else if (percent >= 750) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barRh:872111194188705848>";
                else if (percent >= 625) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                else if (percent >= 500) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                else if (percent >= 375) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                else if (percent >= 250) bar = "<:barL:872111285741969438><:barM:872111243429814332><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
                else if (percent >= 125) bar = "<:barL:872111285741969438><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barMh:872111226866520075><:barRh:872111194188705848>";
    
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setAuthor(`${user.username}'s Class Level`, user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                .setDescription(`${fClass.name} level: **${level}**\nXP required to level up: **${xpTotal-myXP}**\n${bar}`)
                .setThumbnail(fClass.image)
                return interaction.reply({ embeds: [Embed] });
            });

        };

    },
};