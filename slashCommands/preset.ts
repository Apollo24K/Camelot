import fs from 'fs';
import { EmbedBuilder } from "discord.js";
import { characters } from "../Modules/chars";
import { classes } from "../Modules/classes";
import { items } from "../Modules/items";
import { search, searchClass, filterItems } from "../Modules/functions";
import { ItemCategory, ItemType, SlashCommand, UpdateUserOptions } from '../types';
import { getUserSchema, getUserWeapons, getWeaponSchemas, updateUsers } from '../Modules/queries';

const exportCommand: SlashCommand = {
    name: 'preset',
    async execute({ interaction, author }) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "view") {
            const user = interaction.options.getUser('user') ?? interaction.user;

            const stats = user.id === interaction.user.id ? author.schema : await getUserSchema(user.id);
            if (!stats) return interaction.reply(`**${user.username}** hasn't started playing yet.`);

            let thumbnail = characters[stats.chars[Math.floor(Math.random() * stats.chars.length)]].image;
            if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[user.id]?.cimg[stats.favchar], stats.char_skin[stats.favchar]);

            const userItems = await getUserWeapons(user.id);

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(`Character Presets`)
                .setThumbnail(thumbnail || "https://i.imgur.com/Ta2YDBN.png");
            [0, 2, 4].forEach((e) => Embed.addFields(
                {
                    name: `**__Set #${e + 1}__**`,
                    value: `> **Character**: ${characters[stats.presets[e]?.character ?? NaN]?.name || "None"}\n> **Class**: ${classes[stats.presets[e]?.class ?? NaN]?.emblem + classes[stats.presets[e]?.class ?? NaN]?.name || "None"}\n> **Items**: ${items[userItems.find((w) => w.uniqueid === stats.presets[e]?.weapon)?.itemid ?? NaN]?.emoji || "<:sword_empty:1034502134474997790>"}${items[userItems.find((w) => w.uniqueid === stats.presets[e]?.shield)?.itemid ?? NaN]?.emoji || "<:shield_empty:1087089686809415730>"} ${items[userItems.find((w) => w.uniqueid === stats.presets[e]?.helmet)?.itemid ?? NaN]?.emoji || "<:helmet_empty:1034499888878198885>"}${items[userItems.find((w) => w.uniqueid === stats.presets[e]?.cuirass)?.itemid ?? NaN]?.emoji || "<:cuirass_empty:1034499890165858305>"}${items[userItems.find((w) => w.uniqueid === stats.presets[e]?.gloves)?.itemid ?? NaN]?.emoji || "<:gloves_empty:1034499892409794570>"}${items[userItems.find((w) => w.uniqueid === stats.presets[e]?.boots)?.itemid ?? NaN]?.emoji || "<:boots_empty:1034499893919764480>"}`,
                    inline: true
                },
                {
                    name: `**__Set #${e + 2}__**`,
                    value: `> **Character**: ${characters[stats.presets[e + 1]?.character ?? NaN]?.name || "None"}\n> **Class**: ${classes[stats.presets[e + 1]?.class ?? NaN]?.emblem + classes[stats.presets[e + 1]?.class ?? NaN]?.name || "None"}\n> **Items**: ${items[userItems.find((w) => w.uniqueid === stats.presets[e + 1]?.weapon)?.itemid ?? NaN]?.emoji || "<:sword_empty:1034502134474997790>"}${items[userItems.find((w) => w.uniqueid === stats.presets[e + 1]?.shield)?.itemid ?? NaN]?.emoji || "<:shield_empty:1087089686809415730>"} ${items[userItems.find((w) => w.uniqueid === stats.presets[e + 1]?.helmet)?.itemid ?? NaN]?.emoji || "<:helmet_empty:1034499888878198885>"}${items[userItems.find((w) => w.uniqueid === stats.presets[e + 1]?.cuirass)?.itemid ?? NaN]?.emoji || "<:cuirass_empty:1034499890165858305>"}${items[userItems.find((w) => w.uniqueid === stats.presets[e + 1]?.gloves)?.itemid ?? NaN]?.emoji || "<:gloves_empty:1034499892409794570>"}${items[userItems.find((w) => w.uniqueid === stats.presets[e + 1]?.boots)?.itemid ?? NaN]?.emoji || "<:boots_empty:1034499893919764480>"}`,
                    inline: true
                },
                {
                    name: `\u200B`,
                    value: `_ _`,
                    inline: true
                },
            ));
            return interaction.reply({ embeds: [Embed] });
        };

        // Edit Preset
        if (subcommand === "edit") {
            const stats = author.schema;

            const set = (interaction.options.getInteger('set', true) - 1) || 0;
            if (set < 0 || set > 5) return interaction.reply(`Please choose a number between 1-6`);

            const charChoice = interaction.options.getString('character');
            const classChoice = interaction.options.getString('class');
            const itemChoice = [...new Set((interaction.options.getString('items') || "").split(",").map((e) => e.trim()))];

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

            if (charChoice) {
                const char = search(charChoice, stats.chars, interaction);
                if (!char) return;

                if (stats.chars.includes(char.id)) preset.character = char.id;
                else return interaction.reply(`You don't have a copy of **${char.name}**`);
            };

            if (classChoice) {
                const fClass = searchClass(classChoice, interaction);
                if (!fClass) return;

                if (stats.dungeon_classes.includes(fClass.id)) preset.class = fClass.id;
                else return interaction.reply(`You don't have the **${fClass.name}** class`);
            };

            if (itemChoice[0]) {
                const userItems = await getUserWeapons(interaction.user.id);
                if (!userItems.length) return interaction.reply(`You don't have any items.`);

                const { itemsToDisassemble, itemIdsToDisassemble } = filterItems(userItems, itemChoice);
                if (itemsToDisassemble.length < 1) return interaction.reply(`You need to select at least 1 item.`);

                itemsToDisassemble.forEach((item, i) => {
                    if (item.category === "weapon") {
                        if (item.type === "shield" && (stats.premium >= 4 || stats.shield_slot === 1)) preset.shield = itemIdsToDisassemble[i].uniqueid;
                        else preset.weapon = itemIdsToDisassemble[i].uniqueid;
                    } else {
                        preset[item.type as "helmet" | "cuirass" | "gloves" | "boots"] = itemIdsToDisassemble[i].uniqueid;
                    };
                });
            };

            if (charChoice || classChoice || itemChoice[0]) stats.presets[set] = preset;
            else stats.presets[set] = {};

            // Update users table
            await updateUsers(interaction.user.id, {
                presets: { type: "set", value: stats.presets },
            });

            return interaction.reply(`Edited preset ${set + 1}`);
        };

        // Equip Preset
        if (subcommand === "select") {
            const stats = author.schema;

            const set = interaction.options.getInteger('set', true) - 1;
            if (set < 0 || set > 5) return interaction.reply(`Please choose a number between 1-6`);
            const charChoice = interaction.options.getString('character');

            const preset = stats.presets[set] ?? {};

            // Select character
            let equipChar = preset.character;
            if (charChoice) {
                const char = search(charChoice, stats.chars, interaction);
                if (!char) return;

                if (stats.chars.includes(char.id)) equipChar = char.id;
                else return interaction.reply(`You don't have a copy of **${char.name}**`);
            };

            // Equip Items
            const equipItems: Record<string, string> = {};
            (["weapon", "shield", "helmet", "cuirass", "gloves", "boots"] as const).forEach((e) => {
                const itemCode = preset[e];
                if (itemCode) equipItems[e] = itemCode;
            });
            const userItems = await getWeaponSchemas(Object.values(equipItems));

            for (const userItem of userItems) {
                const fItem = items[userItem.itemid];

                let type: ItemCategory | ItemType = fItem.category;
                if (type === "armor" || fItem.type === "shield") type = fItem.type;
                if (type === "shield" && (stats.premium < 4 && stats.shield_slot === 0)) type = "weapon";

                // Assign weapon
                stats.equipment[type] = equipItems[type];
            };

            // Update users table
            const updates: UpdateUserOptions = {
                equipment: { type: "set", value: stats.equipment },
            };
            if (equipChar) updates.battlechar = { type: "set", value: equipChar };
            if (preset?.class || preset?.class === 0) updates.class = { type: "set", value: preset.class };

            await updateUsers(interaction.user.id, updates);

            return interaction.reply(`Equipped ${equipChar ? `**${characters[equipChar].name}** with ` : ""}preset **${set + 1}**`);
        };

    },
};

export default exportCommand;
