import { EmbedBuilder } from "discord.js";
import { characters } from "../Modules/chars";
import { classes } from "../Modules/classes";
import { items } from "../Modules/items";
import { search, searchClass, filterItems, getRingSlotsTotal } from "../Modules/functions";
import { ItemCategory, ItemType, SlashCommand, UpdateUserOptions } from '../types';
import { getCachedUserSchema, getUserWeapons, getWeaponSchemas, updateUsersAndCache } from '../Modules/queries';

const exportCommand: SlashCommand = {
    name: 'preset',
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction, author }) {

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "view") {
            const user = interaction.options.getUser('user') ?? interaction.user;

            const stats = user.id === interaction.user.id ? author.schema : await getCachedUserSchema(user.id, interaction.client);
            if (!stats) return interaction.reply(`**${user.username}** hasn't started playing yet.`);

            let thumbnail = characters[stats.chars[Math.floor(Math.random() * stats.chars.length)]].image;
            if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, stats.custom_skins[stats.favchar], stats.char_skin[stats.favchar]);

            const userItems = await getUserWeapons(user.id);
            const ringSlotsTotal = getRingSlotsTotal(stats);

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(`Character Presets`)
                .setThumbnail(thumbnail || "https://i.imgur.com/Ta2YDBN.png");
            [0, 2, 4].forEach((e) => Embed.addFields(
                {
                    name: `**__Set #${e + 1}__**`,
                    value: `> **Character**: ${characters[stats.presets[e]?.character ?? NaN]?.name || "None"}\n> **Class**: ${classes[stats.presets[e]?.class ?? NaN]?.emblem + classes[stats.presets[e]?.class ?? NaN]?.name || "None"}\n> **Items**: ${items[userItems.find((w) => w.uniqueid === stats.presets[e]?.weapon)?.itemid ?? NaN]?.emoji || "<:sword_empty:1034502134474997790>"}${items[userItems.find((w) => w.uniqueid === stats.presets[e]?.shield)?.itemid ?? NaN]?.emoji || "<:shield_empty:1087089686809415730>"} ${items[userItems.find((w) => w.uniqueid === stats.presets[e]?.helmet)?.itemid ?? NaN]?.emoji || "<:helmet_empty:1034499888878198885>"}${items[userItems.find((w) => w.uniqueid === stats.presets[e]?.cuirass)?.itemid ?? NaN]?.emoji || "<:cuirass_empty:1034499890165858305>"}${items[userItems.find((w) => w.uniqueid === stats.presets[e]?.gloves)?.itemid ?? NaN]?.emoji || "<:gloves_empty:1034499892409794570>"}${items[userItems.find((w) => w.uniqueid === stats.presets[e]?.boots)?.itemid ?? NaN]?.emoji || "<:boots_empty:1034499893919764480>"}\n> **Rings**: ${items[userItems.find((w) => w.uniqueid === stats.presets[e]?.ring1)?.itemid ?? NaN]?.emoji || (ringSlotsTotal > 0 ? "<:ring_empty:1034509903886299136>" : "<:locked:1034511902417621002>")}${items[userItems.find((w) => w.uniqueid === stats.presets[e]?.ring2)?.itemid ?? NaN]?.emoji || (ringSlotsTotal > 1 ? "<:ring_empty:1034509903886299136>" : "<:locked:1034511902417621002>")}${items[userItems.find((w) => w.uniqueid === stats.presets[e]?.ring3)?.itemid ?? NaN]?.emoji || (ringSlotsTotal > 2 ? "<:ring_empty:1034509903886299136>" : "<:locked:1034511902417621002>")}`,
                    inline: true
                },
                {
                    name: `**__Set #${e + 2}__**`,
                    value: `> **Character**: ${characters[stats.presets[e + 1]?.character ?? NaN]?.name || "None"}\n> **Class**: ${classes[stats.presets[e + 1]?.class ?? NaN]?.emblem + classes[stats.presets[e + 1]?.class ?? NaN]?.name || "None"}\n> **Items**: ${items[userItems.find((w) => w.uniqueid === stats.presets[e + 1]?.weapon)?.itemid ?? NaN]?.emoji || "<:sword_empty:1034502134474997790>"}${items[userItems.find((w) => w.uniqueid === stats.presets[e + 1]?.shield)?.itemid ?? NaN]?.emoji || "<:shield_empty:1087089686809415730>"} ${items[userItems.find((w) => w.uniqueid === stats.presets[e + 1]?.helmet)?.itemid ?? NaN]?.emoji || "<:helmet_empty:1034499888878198885>"}${items[userItems.find((w) => w.uniqueid === stats.presets[e + 1]?.cuirass)?.itemid ?? NaN]?.emoji || "<:cuirass_empty:1034499890165858305>"}${items[userItems.find((w) => w.uniqueid === stats.presets[e + 1]?.gloves)?.itemid ?? NaN]?.emoji || "<:gloves_empty:1034499892409794570>"}${items[userItems.find((w) => w.uniqueid === stats.presets[e + 1]?.boots)?.itemid ?? NaN]?.emoji || "<:boots_empty:1034499893919764480>"}\n> **Rings**: ${items[userItems.find((w) => w.uniqueid === stats.presets[e + 1]?.ring1)?.itemid ?? NaN]?.emoji || (ringSlotsTotal > 0 ? "<:ring_empty:1034509903886299136>" : "<:locked:1034511902417621002>")}${items[userItems.find((w) => w.uniqueid === stats.presets[e + 1]?.ring2)?.itemid ?? NaN]?.emoji || (ringSlotsTotal > 1 ? "<:ring_empty:1034509903886299136>" : "<:locked:1034511902417621002>")}${items[userItems.find((w) => w.uniqueid === stats.presets[e + 1]?.ring3)?.itemid ?? NaN]?.emoji || (ringSlotsTotal > 2 ? "<:ring_empty:1034509903886299136>" : "<:locked:1034511902417621002>")}`,
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
            const ringSlotsTotal = getRingSlotsTotal(stats);
            const ring1Choice = interaction.options.getString('ring-1');
            const ring2Choice = interaction.options.getString('ring-2');
            const ring3Choice = interaction.options.getString('ring-3');

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

            if (ringSlotsTotal === 0 && (ring1Choice || ring2Choice || ring3Choice)) return interaction.reply(`You don't have any ring slots available!\n\nYou can unlock them by:\n- Reaching class level 1000 (cumulative)\n- Defeating Floor 300 in the \`/dungeon\`\n- Reaching account level 100`);

            // Collect all ring choices to check for duplicates
            const ringChoices = [ring1Choice, ring2Choice, ring3Choice].filter(Boolean);

            // Check for duplicates within the ring choices themselves
            if (ringChoices.length !== new Set(ringChoices).size) {
                return interaction.reply(`You can't equip the same ring twice in the same preset!`);
            }

            // Get existing preset rings and extract their item IDs for comparison
            const existingRings = [preset.ring1, preset.ring2, preset.ring3].filter(Boolean);
            let existingRingItemIds: number[] = [];
            let slotRingItemId: number[] = [];

            if (existingRings.length > 0) {
                const existingRingSchemas = await getWeaponSchemas(existingRings.filter(Boolean) as string[]);
                existingRingItemIds = existingRingSchemas.map(ring => ring.itemid);
            }

            if (ring1Choice) {

                const userItems = await getUserWeapons(interaction.user.id);
                if (!userItems.length) return interaction.reply(`You don't have any items.`);
                const ring = userItems.find((w) => w.uniqueid === `${ring1Choice}:${interaction.user.id}`);
                if (!ring) return interaction.reply(`You don't have a ring with the ID **${ring1Choice}**`);
                if (ring.item_type !== "ring") return interaction.reply(`You can't equip a ring with the ID **${ring1Choice}**`);

                const newRingSchemas = await getWeaponSchemas([`${ring1Choice}:${interaction.user.id}`]);
                const newRingItemId = newRingSchemas.map(ring => ring.itemid);
                if (preset.ring1) {
                    const slotRingSchema = await getWeaponSchemas([preset.ring1]);
                    slotRingItemId = slotRingSchema.map(ring => ring.itemid);
                };
                const allRingItemIds = [...newRingItemId, ...new Set(existingRingItemIds)];
                if (allRingItemIds.length !== new Set(allRingItemIds).size && allRingItemIds[0] !== slotRingItemId[0]) {
                    return interaction.reply(`You can't equip the same ring twice in the same preset!`);
                }

                preset.ring1 = `${ring1Choice}:${interaction.user.id}`;
            };

            if (ring2Choice) {
                const userItems = await getUserWeapons(interaction.user.id);
                if (!userItems.length) return interaction.reply(`You don't have any items.`);
                const ring = userItems.find((w) => w.uniqueid === `${ring2Choice}:${interaction.user.id}`);
                if (!ring) return interaction.reply(`You don't have a ring with the ID **${ring2Choice}**`);
                if (ring.item_type !== "ring") return interaction.reply(`You can't equip a ring with the ID **${ring2Choice}**`);

                const newRingSchemas = await getWeaponSchemas([`${ring2Choice}:${interaction.user.id}`]);
                const newRingItemId = newRingSchemas.map(ring => ring.itemid);
                if (preset.ring2) {
                    const slotRingSchema = await getWeaponSchemas([preset.ring2]);
                    slotRingItemId = slotRingSchema.map(ring => ring.itemid);
                };
                const allRingItemIds = [...newRingItemId, ...new Set(existingRingItemIds)];
                if (allRingItemIds.length !== new Set(allRingItemIds).size && allRingItemIds[0] !== slotRingItemId[0]) {
                    return interaction.reply(`You can't equip the same ring twice in the same preset!`);
                }

                preset.ring2 = `${ring2Choice}:${interaction.user.id}`;
            };
            if (ring2Choice && ringSlotsTotal === 1) return interaction.reply(`You don't have enough ring slots available!\n\nYou can unlock them by:\n- Reaching class level 1000 (cumulative)\n- Defeating Floor 300 in the \`/dungeon\`\n- Reaching account level 100`);

            if (ring3Choice) {
                const userItems = await getUserWeapons(interaction.user.id);
                if (!userItems.length) return interaction.reply(`You don't have any items.`);
                const ring = userItems.find((w) => w.uniqueid === `${ring3Choice}:${interaction.user.id}`);
                if (!ring) return interaction.reply(`You don't have a ring with the ID **${ring3Choice}**`);
                if (ring.item_type !== "ring") return interaction.reply(`You can't equip a ring with the ID **${ring3Choice}**`);

                const newRingSchemas = await getWeaponSchemas([`${ring3Choice}:${interaction.user.id}`]);
                const newRingItemId = newRingSchemas.map(ring => ring.itemid);
                if (preset.ring3) {
                    const slotRingSchema = await getWeaponSchemas([preset.ring3]);
                    slotRingItemId = slotRingSchema.map(ring => ring.itemid);
                };
                const allRingItemIds = [...newRingItemId, ...new Set(existingRingItemIds)];
                if (allRingItemIds.length !== new Set(allRingItemIds).size && allRingItemIds[0] !== slotRingItemId[0]) {
                    return interaction.reply(`You can't equip the same ring twice in the same preset!`);
                }

                preset.ring3 = `${ring3Choice}:${interaction.user.id}`;
            };
            if (ring3Choice && ringSlotsTotal === 2) return interaction.reply(`You don't have enough ring slots available!\n\nYou can unlock them by:\n- Reaching class level 1000 (cumulative)\n- Defeating Floor 300 in the \`/dungeon\`\n- Reaching account level 100`);

            if (charChoice || classChoice || itemChoice[0] || ring1Choice || ring2Choice || ring3Choice) stats.presets[set] = preset;
            else stats.presets[set] = {};

            // Update users table
            await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates: {
                    presets: { type: "set", value: stats.presets },
                },
            });

            return interaction.reply(`Edited preset ${set + 1}`);
        };

        // Equip Preset
        if (subcommand === "select") {
            const stats = author.schema;

            const set = interaction.options.getInteger('set', true) - 1;
            if (set < 0 || set > 5) return interaction.reply(`Please choose a number between 1-6`);
            const charChoice = interaction.options.getString('character');

            const ringSlotsTotal = getRingSlotsTotal(stats);

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
            (["weapon", "shield", "helmet", "cuirass", "gloves", "boots", "ring1", "ring2", "ring3"] as const).forEach((e) => {
                const itemCode = preset[e];
                if (itemCode) equipItems[e] = itemCode;

            });
            const userItems = await getWeaponSchemas(Object.values(equipItems));
            let ringSlot = 1;

            for (const userItem of userItems) {
                const fItem = items[userItem.itemid];

                let type: ItemCategory | ItemType = fItem.category;
                if (type === "armor" || fItem.type === "shield") type = fItem.type;
                if (type === "shield" && (stats.premium < 4 && stats.shield_slot === 0)) type = "weapon";
                if (type === "ring") {

                    // Collect all ring choices to check for duplicates
                    const ringChoices = [preset.ring1, preset.ring2, preset.ring3].filter(Boolean);

                    // Check for duplicates within the ring choices themselves
                    if (ringChoices.length !== new Set(ringChoices).size) {
                        return interaction.reply(`You can't equip the same ring twice in the same preset!`);
                    }

                    // Get existing preset rings and extract their item IDs for comparison
                    const existingRings = [preset.ring1, preset.ring2, preset.ring3].filter(Boolean);
                    let existingRingItemIds: number[] = [];

                    if (existingRings.length > 0) {
                        const userItems = await getUserWeapons(interaction.user.id);
                        const existingRingSchemas = await getWeaponSchemas(existingRings.filter(Boolean) as string[]);
                        existingRingItemIds = existingRingSchemas.map(ring => ring.itemid);
                    }

                    // Check for duplicates between new choices and existing preset rings
                    const allRingItemIds = [...ringChoices, ...existingRingItemIds];
                    if (allRingItemIds.length !== new Set(allRingItemIds).size) {
                        return interaction.reply(`You can't equip the same ring twice in the same preset!`);
                    }

                    if (ringSlotsTotal === 0) return interaction.reply(`You don't have any ring slots available!\n\nYou can unlock them by:\n- Reaching class level 1000 (cumulative)\n- Defeating Floor 300 in the \`/dungeon\`\n- Reaching account level 100`);
                    type += ringSlot;
                    ringSlot++;
                };

                // Assign weapon
                stats.equipment[type] = equipItems[type];
            };

            // Update users table
            const updates: UpdateUserOptions = {
                equipment: { type: "set", value: stats.equipment },
            };
            if (equipChar) updates.battlechar = { type: "set", value: equipChar };
            if (preset?.class || preset?.class === 0) updates.class = { type: "set", value: preset.class };

            await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates
            });

            return interaction.reply(`Equipped ${equipChar ? `**${characters[equipChar].name}** with ` : ""}preset **${set + 1}**`);
        };

    },
};

export default exportCommand;
