const { db, query } = require("../db_handler.js");

module.exports = {
	name: 'pullstacks',
	description: 'use your stacked pulls',
	execute(interaction) {

        db.serialize(async () => {
            var stats = await query(`SELECT pullcount, pullstacks, premium FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];

            var inv = await query(`SELECT chars, ref FROM characters WHERE id = ${interaction.user.id}`);
            inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref)};
            
            if (stats.premium < 2) return interaction.reply(`This is a /premium feature, if you want to help us out we would really appreciate your support <:RaphiSmile:868998036645380197>`);
            if (!stats.pullstacks) return interaction.reply(`You don't have any stacked pulls currently`);
            
            interaction.reply(`Added ${stats.pullstacks} pulls! Use them before the next pull reset`);

            await query(`UPDATE users SET pullcount = pullcount - pullstacks, pullstacks = 0, pullstacksinterval = 0, lastss = ${stats.lastss}, lasts = ${stats.lasts}, xp = xp + ${add_xp} WHERE id = ${interaction.user.id}`);
        });
        
    },
};