const { db, query } = require("../db_handler.js");

module.exports = {
    name: 'rp',
    description: 'reset your pulls',
    execute(interaction) {

        db.serialize(async () => {
            const { 0: stats } = await query(`SELECT pullcount, pullresets, premium FROM users WHERE id = ${interaction.user.id}`);

            let pullLimit = 5;
            switch (stats.premium) {
                case 1: pullLimit += 1; break;
                case 2: pullLimit += 2; break;
                case 3: pullLimit += 3; break;
                case 4: pullLimit += 3; break;
                case 5: pullLimit += 3; break;
                case 6: pullLimit += 4; break;
                case 7: pullLimit += 5; break;
                default: false; break;
            }
            if (stats.pullcount < pullLimit) return interaction.reply("You still have some pulls left.");
            if (!stats.pullresets) return interaction.reply(`You don't have any pull resets. You can obtain them by voting (**/vote**)`);

            stats.pullresets--;
            interaction.reply(`Resetted your pull counter. You can pull again! (**${stats.pullresets}** left)`);

            await query(`UPDATE users SET pullcount = 0, pullresets = ${stats.pullresets} WHERE id = ${interaction.user.id}`);
        });

    },
};