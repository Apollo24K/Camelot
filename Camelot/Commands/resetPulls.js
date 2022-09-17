const { db, query } = require("../db_handler.js");

module.exports = {
	name: 'rp',
	description: 'reset your pulls',
	execute(interaction) {

        db.serialize(async () => {
            var stats = await query(`SELECT pullcount, pullresets, premium FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];
            
            let pullLimit = 6;
            switch (stats.premium) {
                case 1: pullLimit += 2; dunLim = 12; break;
                case 2: pullLimit += 3; dunLim = 15; break;
                case 3: pullLimit += 4; dunLim = 20; break;
                case 4: pullLimit += 4; dunLim = 25; break;
                case 5: pullLimit += 4; dunLim = 30; break;
                case 6: pullLimit += 6; dunLim = 30; break;
                case 7: pullLimit += 6; dunLim = 30; break;
                default : false; break;
            };
            if (stats.pullcount < pullLimit) return interaction.reply("You still have some pulls left.");
            if (!stats.pullresets) return interaction.reply(`You don't have any pull resets. You can obtain them by voting (**/vote**)`);
            
            stats.pullresets--;
            interaction.reply(`Resetted your pull counter. You can pull again! (**${stats.pullresets}** left)`)
            
            await query(`UPDATE users SET pullcount = 0, pullresets = ${stats.pullresets} WHERE id = ${interaction.user.id}`);
        });

    },
};