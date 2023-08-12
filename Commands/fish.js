const { db, query } = require("../db_handler.js");
const { fishing } = require("../Modules/items.js");
const { dailies } = require("../Modules/dailyQuests.js");

const fishingCooldown = new Map();

module.exports = {
	name: 'fish',
	description: 'fishing command',
	execute(interaction) {
        
        // Set up restrictions
        if (fishingCooldown.has(interaction.user.id)) return interaction.reply(`You can fish again in ${30 - Math.floor((new Date().getTime() - fishingCooldown.get(interaction.user.id))/1000)} seconds`);
        fishingCooldown.set(interaction.user.id, new Date().getTime());
        setTimeout(() => fishingCooldown.delete(interaction.user.id), 30*1000);
        
        // 20% chance of failure
        if (Math.random() < 0.2) return interaction.reply(`🎣 | You couldn't catch anything`);

        // Roll a rarit (normal: 0.5, special: 0.33, rare: 0.12, unique: 0.048, legendary: 0.002)
        let ranRar = Math.floor(Math.random() * 1000); // 0-99
        let rar = "normal"; //, eventpts = 20;
        if (ranRar < 2) rar = "legendary"; //, eventpts = 500;
        else if (ranRar < 50) rar = "unique"; //, eventpts = 160;
        else if (ranRar < 170) rar = "rare"; //, eventpts = 75;
        else if (ranRar < 500) rar = "special"; //, eventpts = 40;

        let caught = fishing.filter((e) => e.grade === rar);
        caught = caught[Math.floor(caught.length * Math.random())];

        // Event
        // eventpts = Math.floor(eventpts * (0.9+(0.35*Math.random())))
        // eventpts = Math.floor(eventpts*2);
        // interaction.reply(`🎣 | You've caught a __${caught.grade}__ **${caught.name}** ${caught.emoji}\nAdded **${eventpts}**🌻`);

        interaction.reply(`🎣 | You've caught a __${caught.grade}__ **${caught.name}** ${caught.emoji}`);

        db.serialize(async () => {
            let inv = await query(`SELECT items FROM users WHERE id = ${interaction.user.id}`);
            inv = JSON.parse(inv[0].items);

            if (caught.id in inv) inv[caught.id]++;
            else inv[caught.id] = 1;

            await query(`UPDATE users SET items = '${JSON.stringify(inv)}' WHERE id = ${interaction.user.id}`);
            // await query(`UPDATE users SET items = '${JSON.stringify(inv)}', eventpts = eventpts + ${eventpts}, eventpts2 = eventpts2 + ${eventpts} WHERE id = ${interaction.user.id}`);
        });

        // Daily Quests
        dailies[7].update(interaction); // A Fishy Task
        if (caught.grade === "rare" || caught.grade === "unique" || caught.grade === "legendary") {
            setTimeout(() => {
                 dailies[8].update(interaction); // Another Fishy Task
            }, 200);
        };

    },
};