const { EmbedBuilder } = require("@discordjs/builders");
const { db, query } = require("../db_handler.js");
const { searchItem, generateUniqueItemId, generateSubstats } = require("../Modules/functions.js");
const { items } = require("../Modules/items.js");

module.exports = {
    name: 'merge',
    description: 'Merge Exchange Points for random items',
    execute(interaction) {
        const genesisFiltered = items.filter((e) => e.obtain.includes("chest") && e.grade === "genesis");
        let fItem = searchItem(genesisFiltered[Math.floor(Math.random()*genesisFiltered.length)].name, interaction)

        // Divine Exchange Points ID: 676
        let currency = 676, price = 6;

        db.serialize(async () => {
            let stats = await query(`SELECT items FROM users WHERE id = ${interaction.user.id}`);
            stats = { items: JSON.parse(stats[0].items) };

            if (!(stats.items[currency] >= price)) return interaction.reply(`You don't have enough exchange points (**${stats.items[currency] || 0}**/${price}${items[currency].emoji})`);

            // Remove Points
            stats.items[currency] -= price;
            await query(`UPDATE users SET items = '${JSON.stringify(stats.items)}' WHERE id = ${interaction.user.id}`);

            // Read existing items
            let existing = await query(`SELECT uniqueid FROM weapons`);
            existing = existing.map((e) => e.uniqueid);

            // Write to database
            let uid = generateUniqueItemId(interaction.user.id, existing);
            await query(`INSERT INTO weapons (id, itemid, uniqueid${fItem.category === "armor" ? ", substats" : ""}) VALUES (${interaction.user.id}, ${fItem.id}, '${uid + ":" + interaction.user.id}'${fItem.category === "armor" ? ", '" + JSON.stringify(generateSubstats()) + "'" : ""})`, 'run');

            return interaction.reply(`You have successfully bought ${fItem.emoji} **__${fItem.name}__**!`);
        });
    }
}