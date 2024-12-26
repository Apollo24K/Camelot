import { db, query } from "../db_handler";

module.exports = {
    name: 'reminder',
    description: 'Setup reminders',
    execute(interaction) {

        let reminder = interaction.options.getString('select');

        db.serialize(async () => {
            const { 0: stats } = await query(`SELECT pullreminder, votereminder FROM users WHERE id = ${interaction.user.id}`);

            if (reminder === "pulls") {
                await query(`UPDATE users SET pullreminder = ${stats.pullreminder ? 0 : 1} WHERE id = ${interaction.user.id}`);
                return interaction.reply(`${stats.pullreminder ? "Disabled" : "Enabled"} pull reminders`);
            }

            if (reminder === "votes") {
                await query(`UPDATE users SET votereminder = ${stats.votereminder ? 0 : 1} WHERE id = ${interaction.user.id}`);
                return interaction.reply(`${stats.votereminder ? "Disabled" : "Enabled"} vote reminders`);
            }
        });

    },
};