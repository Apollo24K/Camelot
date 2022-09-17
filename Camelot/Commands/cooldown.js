const { db, query } = require("../db_handler.js");

module.exports = {
	name: 'cooldown',
	description: 'show cooldowns',
	execute(interaction) {
        
        let pull = `Your pulls are ready! => \`/pull\``;
        let dungeon = `Your runs are ready! => \`/dungeon\``;
        let dailymsg = `Your daily is ready! => \`/daily\``
        let weeklymsg = `\`locked\` => see \`/premium\``;
        let vote = `You can vote now! => \`/vote\``;

        db.serialize(async () => {
            var stats = await query(`SELECT lastvote, pullcount, dailyclaimed, weeklyclaimed, premium FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];

            var inv = await query(`SELECT chars, ref FROM characters WHERE id = ${interaction.user.id}`);
            inv = {chars: JSON.parse(inv[0].chars), ref: JSON.parse(inv[0].ref)};

            var dg = await query(`SELECT "limit" FROM dungeon WHERE id = ${interaction.user.id}`);
            dg = dg[0];
        
            // Limits
            let pullLimit = 6;
            let dunLim = 10;
    
            if (stats.premium) {
                // Pulls & Dungeon
                switch (stats.premium) {
                    case "1": pullLimit += 2; dunLim = 12; break;
                    case "2": pullLimit += 3; dunLim = 15; break;
                    case "3": pullLimit += 4; dunLim = 20; break;
                    case "4": pullLimit += 4; dunLim = 25; break;
                    case "5": pullLimit += 4; dunLim = 30; break;
                    case "6": pullLimit += 6; dunLim = 30; break;
                    case "7": pullLimit += 6; dunLim = 30; break;
                    default : false; break;
                };
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
                };
            };
    
            // Pulls
            if (stats.pullcount >= pullLimit) {
                let time = new Date();
                let nextPull = time.getHours() % 2 === 0 ? Math.ceil(time/3600000)*3600000 + 3600000 : Math.ceil(time/3600000)*3600000;
                let timeLeft = nextPull - time;
                pull = (timeLeft > 7200000 - 60000) ? "**2**h left" : `${timeLeft > 3600000 ? "**1**h " : ""}**${timeLeft > 3600000 ? Math.ceil((timeLeft - 3600000)/60000) : Math.ceil((timeLeft)/60000)}** min left`;
            };
            // Dungeon
            if (dg.limit >= dunLim) dungeon = `${(7-(new Date().getHours() % 8)) ? `**${7-(new Date().getHours()%8)}**h` : ""} **${60-new Date().getMinutes()}**min left`;
            // Daily
            if (stats.dailyclaimed) dailymsg = `${(23-new Date().getHours()) ? `**${23-new Date().getHours()}**h` : ""} **${60-new Date().getMinutes()}**min left`;
            // Vote
            if (stats.lastvote && ((new Date().getTime() - stats.lastvote) < 12*60*60*1000)) {
                let hr = Math.floor(((12*60*60*1000) - (new Date().getTime() - stats.lastvote)) / (60*60*1000));
                let min = Math.floor((((12*60*60*1000) - (new Date().getTime() - stats.lastvote)) % (60*60*1000)) / (60*1000))+1;
                vote = `${hr ? `**${hr}**h ` : ""}${`**${min}**min`} left`;
            };
    
            interaction.reply(`**Pulls**: ${pull}\n**Dungeon**: ${dungeon}\n**Daily**: ${dailymsg}\n**Weekly**: ${weeklymsg}\n**Vote**: ${vote}`);
            
        });

	},
};