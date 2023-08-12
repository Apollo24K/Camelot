const { db, query } = require("../db_handler.js");
const { dailies } = require("../Modules/dailyQuests.js");

module.exports = {
	name: 'cd',
	description: 'show cooldowns',
	execute(interaction) {
        
        let user = interaction.options.getUser('user') || interaction.user;

        db.serialize(async () => {
            let stats = await query(`SELECT lastvote, lastpull, guild, pullcount, dailyclaimed, weeklyclaimed, dailies, premium FROM users WHERE id = ${user.id}`);
            stats = stats[0];
            if (!stats) return interaction.reply(`${user.id === interaction.user.id ? "You haven't" : `${user.username} hasn't started`} playing yet.`)

            let dg = await query(`SELECT "limit" FROM dungeon WHERE id = ${user.id}`);
            dg = dg[0];

            const { 0: guild } = await query(`SELECT * FROM guilds WHERE id = '${stats.guild}'`);

            // Limits
            let pullLimit = 5;
            let pullTimer = 45*60*1000;
            let dunLim = 10;

            // Messages
            let pull = `Your pulls are ready! => \`/pull\``;
            let dungeon = `Your runs are ready! => \`/dungeon\``;
            let dailyquest = `Your quests are ready! => \`/quests\``;
            let dailymsg = `Your daily is ready! => \`/daily\``;
            let weeklymsg = `\`locked\` => see \`/premium\``;
            let vote = `You can vote now! => \`/vote\``;
            
            if (stats.premium) {
                // Pulls & Dungeon
                switch (stats.premium) {
                    case 1: pullLimit += 1; pullTimer = 40*60*1000; dunLim = 12; break;
                    case 2: pullLimit += 2; pullTimer = 40*60*1000; dunLim = 13; break;
                    case 3: pullLimit += 3; pullTimer = 40*60*1000; dunLim = 15; break;
                    case 4: pullLimit += 3; pullTimer = 35*60*1000; dunLim = 15; break;
                    case 5: pullLimit += 3; pullTimer = 30*60*1000; dunLim = 16; break;
                    case 6: pullLimit += 4; pullTimer = 30*60*1000; dunLim = 18; break;
                    case 7: pullLimit += 5; pullTimer = 30*60*1000; dunLim = 20; break;
                    default : false; break;
                }
                // Weekly
                if (stats.weeklyclaimed) {
                    let s = (7*24*60*60000) - (new Date().getTime() % (7*24*60*60000))
                    let dLeft = Math.floor(s/(24*60*60000))
                    s -= dLeft * 24*60*60000
                    let hLeft = Math.floor(s/(60*60000))
                    s -= hLeft * 60*60000
                    let mLeft = Math.floor(s/60000)
                    weeklymsg = `${dLeft ? `**${dLeft}**d ` : ""}${hLeft ? `**${hLeft}**h ` : ""}**${mLeft+1}**min left`;
                } else {
                    weeklymsg = `Your weekly is ready! => \`/weekly\``;
                }
            };
            if (guild) pullTimer -= (60*1000*guild.cdreduction);
            
            // Pulls
            if (stats.pullcount >= pullLimit) pull = `**${Math.ceil((pullTimer + stats.lastpull - new Date().getTime())/(60*1000))}** min left`;
            // Dungeon
            if (dg.limit >= dunLim) dungeon = `${(7-(new Date().getHours() % 8)) ? `**${7-(new Date().getHours()%8)}**h` : ""} **${60-new Date().getMinutes()}**min left`;
            // Daily
            if (stats.dailyclaimed) dailymsg = `${(23-new Date().getHours()) ? `**${23-new Date().getHours()}**h` : ""} **${60-new Date().getMinutes()}**min left`;
            // Daily Quests
            if (Object.keys(JSON.parse(stats.dailies)).length === 4 && Object.entries(JSON.parse(stats.dailies)).every((e) => dailies[e[0]]._check(e[1]))) dailyquest = `${(23-new Date().getHours()) ? `**${23-new Date().getHours()}**h` : ""} **${60-new Date().getMinutes()}**min left`;
            // Vote
            if (stats.lastvote && ((new Date().getTime() - stats.lastvote) < 12*60*60*1000)) {
                let hr = Math.floor(((12*60*60*1000) - (new Date().getTime() - stats.lastvote)) / (60*60*1000));
                let min = Math.floor((((12*60*60*1000) - (new Date().getTime() - stats.lastvote)) % (60*60*1000)) / (60*1000))+1;
                if (min === 60) min = 0, hr++;
                vote = `${hr ? `**${hr}**h ` : ""}${`**${min}**min`} left`;
            };
            
            return interaction.reply(`**Pulls**: ${pull}\n**Dungeon**: ${dungeon}\n**Daily**: ${dailymsg}\n**Weekly**: ${weeklymsg}\n**Quests**: ${dailyquest}\n**Vote**: ${vote}`);
        });

	},
};