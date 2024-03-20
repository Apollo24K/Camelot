const { db, query } = require("../db_handler.js");

module.exports = {
    name: 'weekly',
    description: 'claim weekly reward',
    execute(interaction) {

        db.serialize(async () => {
            var stats = await query(`SELECT weeklyclaimed, premium FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];

            if (!stats.premium) return interaction.reply("This is a `/premium` feature. If you like the bot we'd appreciate your support <:RaphiSmile:868998036645380197>");

            if (stats.weeklyclaimed) {
                let s = (7 * 24 * 60 * 60000) - (new Date().getTime() % (7 * 24 * 60 * 60000));
                let dLeft = Math.floor(s / (24 * 60 * 60000));
                s -= dLeft * 24 * 60 * 60000;
                let hLeft = Math.floor(s / (60 * 60000));
                s -= hLeft * 60 * 60000;
                let mLeft = Math.floor(s / 60000);
                return interaction.reply("You have already used your weekly this week. Come back in " + `${dLeft ? `**${dLeft}**d ` : ""}${hLeft ? `**${hLeft}**h ` : ""}**${mLeft + 1}**min`);
            };

            let addCoins = 0, ssTicket = 0, sTicket = 0, addGems = 0;

            switch (stats.premium) {
                case 1: addCoins = 10000; sTicket = 1; break;
                case 2: addCoins = 20000; sTicket = 3; break;
                case 3: addCoins = 30000; addGems = 120; sTicket = 5; ssTicket = 1; break;
                case 4: addCoins = 40000; addGems = 240; sTicket = 5; ssTicket = 2; break;
                case 5: addCoins = 50000; addGems = 320; sTicket = 6; ssTicket = 3; break;
                case 6: addCoins = 75000; addGems = 450; sTicket = 10; ssTicket = 5; break;
                case 7: addCoins = 100000; addGems = 720; sTicket = 12; ssTicket = 6; break;
                default: false; break;
            };

            interaction.reply(`Added ${addGems ? `**${addGems}**<:genesis_gems:1034179687720681492>, ` : ""}**${addCoins}**<:coins:872926669055356939>${ssTicket === 0 ? ` and **${sTicket}**x<:s_ticket:927642487705722890>` : `, **${sTicket}**x<:s_ticket:927642487705722890> and **${ssTicket}**x<:ss_ticket:927503239396622336>`}`);

            await query(`UPDATE users SET coins = coins + ${addCoins}, gems = gems + ${addGems}, ssticket = ssticket + ${ssTicket}, sticket = sticket + ${sTicket}, weeklyclaimed = 1 WHERE id = ${interaction.user.id}`);
        });

    },
};