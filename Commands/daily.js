const { db, query } = require("../db_handler.js");
const { userLevel } = require("../Modules/functions.js");
const { achievements } = require("../Modules/achievements.js");

module.exports = {
	name: 'daily',
	description: 'claim daily reward',
	execute(interaction) {

        db.serialize(async () => {
            var stats = await query(`SELECT dailyclaimed, dailystreak, lastdaily, xp, premium FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];

            if (stats.dailyclaimed) return interaction.reply("You have already claimed your daily. Come back in " + `${(23-new Date().getHours()) ? `**${23-new Date().getHours()}**h` : ""} **${60-new Date().getMinutes()}**min`);

            if (stats.lastdaily === null) stats.lastdaily = new Date().getTime();
            let dailyCoins = 200 + (Math.floor(userLevel(stats.xp)/2)*10);
            if (new Date(stats.lastdaily + 86400000).getDate() === new Date().getDate() && stats.lastdaily + (2*24*60*60*1000) > new Date().getTime()) dailyCoins += 10 * stats.dailystreak++;
            else stats.dailystreak = 1;

            switch (stats.premium) {
                case 1: dailyCoins = Math.floor(dailyCoins*1.2); break;
                case 2: dailyCoins = Math.floor(dailyCoins*1.5); break;
                case 3: dailyCoins = Math.floor(dailyCoins*2); break;
                case 4: dailyCoins = Math.floor(dailyCoins*2.5); break;
                case 5: dailyCoins = Math.floor(dailyCoins*3); break;
                case 6: dailyCoins = Math.floor(dailyCoins*4); break;
                case 7: dailyCoins = Math.floor(dailyCoins*6); break;
                default : false; break;
            }
            
            let dailyEmoji = "";
            if (stats.dailystreak > 2 && stats.dailystreak < 7) dailyEmoji = "<a:fire_y:936975489862623253>";
            else if (stats.dailystreak > 6 && stats.dailystreak < 14) dailyEmoji = "<a:fire_b:936975541058273370>";
            else if (stats.dailystreak > 13 && stats.dailystreak < 30) dailyEmoji = "<a:fire_m:936975577171259413>";
            else if (stats.dailystreak > 29) dailyEmoji = "<a:fire_p:936975620708134992>";

            interaction.reply(`Added **${dailyCoins}** <:coins:872926669055356939> to your balance \n<:stars_v2:917023655840591963> Daily Streak: ${stats.dailystreak} ${dailyEmoji}`);
            
            await query(`UPDATE users SET coins = coins + ${dailyCoins}, dailyclaimed = 1, dailystreak = ${stats.dailystreak}, lastdaily = ${new Date().getTime()} WHERE id = ${interaction.user.id}`);
            
            // Achievements
            achievements[9].check(interaction, interaction.user, stats.dailystreak), achievements[10].check(interaction, interaction.user, stats.dailystreak), achievements[11].check(interaction, interaction.user, stats.dailystreak), achievements[12].check(interaction, interaction.user, stats.dailystreak); // Don't Stop Me Now
        });

    },
};