const { db, query } = require("../db_handler.js");

module.exports = {
	name: 'delay',
	description: 'change animation delay',
	execute(interaction) {

        db.serialize(async () => {
            var stats = await query(`SELECT premium FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];

            if (!stats.premium) return interaction.reply("This is a `/premium` feature. It changes the animation delay during a battle. If you're interested in supporting us, please see our patreon! <:RaphiSmile:868998036645380197>")
            
            let delay = interaction.options.getInteger('int');
            if (delay < 200 || delay > 1200) return interaction.reply("Please provide a number between 200-1200");
            
            await interaction.reply(`Your animation delay was set to ${delay}ms\nTry it out in the \`/dungeon\` !`);
            
            await query(`UPDATE users SET animationdelay = ${delay} WHERE id = ${interaction.user.id}`);
        });

    },
};