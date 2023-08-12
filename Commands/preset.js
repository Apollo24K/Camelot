const fs = require('fs');
const { EmbedBuilder } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { classes } = require("../Modules/classes.js");
const { items } = require("../Modules/items.js");
const { search, searchClass, filterItems } = require("../Modules/functions.js");
const { db, query } = require("../db_handler.js");

module.exports = {
    name: 'preset',
    description: 'Save your build gear',
    execute(interaction) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "view") {
            const user = interaction.options.getUser('user') || interaction.user;

            db.serialize(async () => {
                const { 0: stats } = await query(`SELECT premium, favchar, presets FROM users WHERE id = '${user.id}'`);
                if (!stats) return interaction.reply(`**${user.username}** hasn't started playing yet.`);
                stats.presets = JSON.parse(stats.presets);

                const { 0: inv} = await query(`SELECT chars, skin FROM characters WHERE id = ${user.id}`);
                let chars = [...new Set(JSON.parse(inv.chars))].map((e) => characters[e]);
                let thumbnail = chars[Math.floor(Math.random() * chars.length)].image;
                if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[user.id]?.cimg[stats.favchar], JSON.parse(inv.skin)[stats.favchar]);
                
                const userItems = await query(`SELECT * FROM weapons WHERE id = '${user.id}'`);
    
                const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(`Character Presets`)
                .setThumbnail(thumbnail || "https://i.imgur.com/Ta2YDBN.png");
                [0,2,4].forEach((e) => Embed.addFields(
                    {
                        name: `**__Set #${e+1}__**`,
                        value: `> **Character**: ${characters?.[stats.presets[e]?.character]?.name || "None"}\n> **Class**: ${classes?.[stats.presets[e]?.class]?.emblem + classes?.[stats.presets[e]?.class]?.name || "None"}\n> **Items**: ${items?.[userItems.find((w) => w.uniqueid === stats.presets[e]?.weapon)?.itemid]?.emoji || "<:sword_empty:1034502134474997790>"}${items?.[userItems.find((w) => w.uniqueid === stats.presets[e]?.shield)?.itemid]?.emoji || "<:shield_empty:1087089686809415730>"} ${items?.[userItems.find((w) => w.uniqueid === stats.presets[e]?.helmet)?.itemid]?.emoji || "<:helmet_empty:1034499888878198885>"}${items?.[userItems.find((w) => w.uniqueid === stats.presets[e]?.cuirass)?.itemid]?.emoji || "<:cuirass_empty:1034499890165858305>"}${items?.[userItems.find((w) => w.uniqueid === stats.presets[e]?.gloves)?.itemid]?.emoji || "<:gloves_empty:1034499892409794570>"}${items?.[userItems.find((w) => w.uniqueid === stats.presets[e]?.boots)?.itemid]?.emoji || "<:boots_empty:1034499893919764480>"}`,
                        inline: true
                    },
                    {
                        name: `**__Set #${e+2}__**`,
                        value: `> **Character**: ${characters?.[stats.presets[e+1]?.character]?.name || "None"}\n> **Class**: ${classes?.[stats.presets[e+1]?.class]?.emblem + classes?.[stats.presets[e+1]?.class]?.name || "None"}\n> **Items**: ${items?.[userItems.find((w) => w.uniqueid === stats.presets[e+1]?.weapon)?.itemid]?.emoji || "<:sword_empty:1034502134474997790>"}${items?.[userItems.find((w) => w.uniqueid === stats.presets[e+1]?.shield)?.itemid]?.emoji || "<:shield_empty:1087089686809415730>"} ${items?.[userItems.find((w) => w.uniqueid === stats.presets[e+1]?.helmet)?.itemid]?.emoji || "<:helmet_empty:1034499888878198885>"}${items?.[userItems.find((w) => w.uniqueid === stats.presets[e+1]?.cuirass)?.itemid]?.emoji || "<:cuirass_empty:1034499890165858305>"}${items?.[userItems.find((w) => w.uniqueid === stats.presets[e+1]?.gloves)?.itemid]?.emoji || "<:gloves_empty:1034499892409794570>"}${items?.[userItems.find((w) => w.uniqueid === stats.presets[e+1]?.boots)?.itemid]?.emoji || "<:boots_empty:1034499893919764480>"}`,
                        inline: true
                    },
                    {
                        name: `\u200B`,
                        value: `_ _`,
                        inline: true
                    },
                ));
                return interaction.reply({embeds: [Embed]});
            });
        };

        // Edit Preset
        if (subcommand === "edit") {
            const set = interaction.options.getInteger('set')-1;
            if (set < 0 || set > 5) return interaction.reply(`Please choose a number between 1-6`);

            const charChoice = interaction.options.getString('character');
            const classChoice = interaction.options.getString('class');
            const itemChoice = [...new Set((interaction.options.getString('items') || "").split(",").map((e) => e.trim()))];

            db.serialize(async () => {
                const { 0: stats } = await query(`SELECT premium, presets FROM users WHERE id = '${interaction.user.id}'`);
                stats.presets = JSON.parse(stats.presets);

                let maxSet = 2;
                switch (stats.premium) {
                    case 1: maxSet = 3; break;
                    case 2: maxSet = 3; break;
                    case 3: maxSet = 4; break;
                    case 4: maxSet = 5; break;
                    case 5: maxSet = 5; break;
                    case 6: maxSet = 6; break;
                    case 7: maxSet = 6; break;
                };
                if (set > maxSet) return interaction.reply(`You can only have a maximum of **${maxSet}** presets at once.\nYou can get more slots through </premium:1011293280702578691>!`);

                const preset = stats.presets[set] || {};

                if (charChoice){
                    const { 0: inv} = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
                    inv.chars = JSON.parse(inv.chars);

                    const char = search(charChoice, inv.chars, interaction);
                    if (!char.name) return;
                    
                    if (inv.chars.includes(char.id)) preset.character = char.id;
                    else return interaction.reply(`You don't have a copy of **${char.name}**`);
                };

                if (classChoice) {
                    const { 0: inv } = await query(`SELECT classes FROM dungeon WHERE id = ${interaction.user.id}`);
                    inv.classes = JSON.parse(inv.classes);
    
                    const fClass = searchClass(classChoice, interaction);
                    if (!fClass?.name) return;

                    if (inv.classes.includes(fClass.id)) preset.class = fClass.id;
                    else return interaction.reply(`You don't have the **${fClass.name}** class`);
                };

                if (itemChoice[0]) {
                    const userItems = await query(`Select * FROM weapons WHERE id = '${interaction.user.id}'`);
                    if (!userItems.length) return interaction.reply(`You don't have any items.`);
        
                    const { itemsToDisassemble, itemIdsToDisassemble } = filterItems(userItems, itemChoice);
                    if (itemsToDisassemble.length < 1) return interaction.reply(`You need to select at least 1 item.`);

                    itemsToDisassemble.forEach((item, i) => {
                        if (item.category === "weapon") {
                            if (item.type === "shield" && stats.premium >= 4) preset.shield = itemIdsToDisassemble[i].uniqueid;
                            else preset.weapon = itemIdsToDisassemble[i].uniqueid;
                        } else {
                            preset[item.type] = itemIdsToDisassemble[i].uniqueid;
                        };
                    });
                };

                if (charChoice || classChoice || itemChoice[0]) stats.presets[set] = preset;
                else stats.presets[set] = {};

                await query(`UPDATE users SET presets = '${JSON.stringify(stats.presets)}' WHERE id = ${interaction.user.id}`);
                return interaction.reply(`Edited preset ${set+1}`);
            });
        };

        // Equip Preset
        if (subcommand === "equip") {
            const set = interaction.options.getInteger('set')-1;
            if (set < 0 || set > 5) return interaction.reply(`Please choose a number between 1-6`);
            const charChoice = interaction.options.getString('character');

            db.serialize(async () => {
                const { 0: stats } = await query(`SELECT users.premium, users.class, users.presets, characters.equipment FROM users JOIN characters ON users.id = characters.id WHERE users.id = '${interaction.user.id}'`);
                stats.equipment = JSON.parse(stats.equipment);
                const preset = JSON.parse(stats.presets)[set];

                // Select character
                let equipChar = preset?.character;
                if (charChoice){
                    const { 0: inv} = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
                    inv.chars = JSON.parse(inv.chars);

                    const char = search(charChoice, inv.chars, interaction);
                    if (!char.name) return;
                    
                    if (inv.chars.includes(char.id)) equipChar = char.id;
                    else return interaction.reply(`You don't have a copy of **${char.name}**`);
                };
                if (!equipChar) return interaction.reply(`You have to select a character.`);

                // Equip Class
                // if (preset?.class || preset?.class === 0) {
                //     const { 0: inv } = await query(`SELECT classes FROM dungeon WHERE id = ${interaction.user.id}`);
                //     Object.entries(stats.class).forEach(([chr, cls]) => {
                //         if (cls === preset?.class) delete stats.class[chr];
                //     });
                //     if (JSON.parse(inv.classes).includes(preset?.class)) stats.class[equipChar] = preset?.class;
                // };

                // Equip Items
                const equipItems = {};
                ["weapon", "shield", "helmet", "cuirass", "gloves", "boots"].forEach((e) => { if (preset?.[e]) equipItems[e] = preset?.[e] });                    
                const userItems = await query(`SELECT * FROM weapons WHERE uniqueid IN (${Object.values(equipItems).map((e) => `'${e}'`).join(", ")})`);

                for (const userItem of userItems) {
                    const fItem = items[userItem.itemid];

                    let type = fItem.category;
                    if (type === "armor" || fItem.type === "shield") type = fItem.type;
                    if (type === "shield" && stats.premium < 4) type = "weapon";

                    // Unequip if already equipped on another char
                    if (userItem.character in stats.equipment) delete stats.equipment[userItem.character][type];

                    // Assign weapon
                    if (!stats.equipment[equipChar]) stats.equipment[equipChar] = {};
                    stats.equipment[equipChar][type] = equipItems[type];
                    await query(`UPDATE weapons SET character = ${equipChar} WHERE uniqueid = '${equipItems[type]}'`);                        
                };
                
                await query(`UPDATE users SET battlechar = ${equipChar}${(preset?.class || preset?.class === 0) ? `, class = ${preset.class}` : ""} WHERE id = ${interaction.user.id}`);
                await query(`UPDATE characters SET class = '${JSON.stringify(stats.class)}', equipment = '${JSON.stringify(stats.equipment)}' WHERE id = ${interaction.user.id}`);

                return interaction.reply(`Equipped **${characters[equipChar].name}** with preset **${set+1}**`);
            });
        };

    },
};