import { db, query } from "../db_handler.js";

module.exports = {
    name: 'vote',
    description: 'vote',
    execute(interaction) {

        db.serialize(async () => {
            let stats = await query(`SELECT lastvote, pullresets FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];

            let canVote = "You can **vote** now!";
            if (stats.lastvote && ((new Date().getTime() - stats.lastvote) < 12 * 60 * 60 * 1000)) {
                let hr = Math.floor(((12 * 60 * 60 * 1000) - (new Date().getTime() - stats.lastvote)) / (60 * 60 * 1000));
                let min = Math.floor((((12 * 60 * 60 * 1000) - (new Date().getTime() - stats.lastvote)) % (60 * 60 * 1000)) / (60 * 1000)) + 1;
                canVote = `You can't vote now. You'll have to wait ${hr ? `**${hr}**h ` : ""}${`**${min}**min`}`;
            }

            return interaction.reply(`${canVote}\nYou will be able to reset your pull counter afterwards with \`/rp\` (**${stats.pullresets}** left)\nYou can vote for Camelot at top.gg: https://top.gg/bot/706183309943767112/vote`);
        });

    },
};