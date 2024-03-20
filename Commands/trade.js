const fs = require('fs');
const { ComponentType } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { search, userLevel } = require("../Modules/functions.js");
const { OfferRow } = require("../Modules/components.js");

module.exports = {
    name: 'trade',
    description: 'trade characters',
    execute(interaction) {

        let user = interaction.options.getUser('user') || interaction.user;
        if (user.bot) return interaction.reply("You can't trade with a bot <:Heh:869656740667469864>");
        if (user.id === interaction.user.id) return interaction.reply("You can't trade with yourself <:Heh:869656740667469864>");

        // Blacklist
        const blacklist = JSON.parse(fs.readFileSync('Storage/blacklist.json', 'utf8'));
        if (user.id in blacklist) return interaction.reply(`**${user.username}** cannot trade.`);

        db.serialize(async () => {
            let _stats = await query(`SELECT xp FROM users WHERE id = ${user.id}`);
            if (!_stats[0]) return interaction.reply(`**${user.username}** hasn't started playing yet.`);

            const { 0: stats } = await query(`SELECT xp FROM users WHERE id = ${interaction.user.id}`);
            if (userLevel(stats.xp) < 25 || userLevel(_stats[0].xp) < 25) return interaction.reply(`must be level 25 or higher to give characters`);

            let inv = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
            inv = { chars: JSON.parse(inv[0].chars) };

            let _inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
            _inv = { chars: JSON.parse(_inv[0].chars) };

            if (!inv.chars.length) return interaction.reply(`You don't have any characters`);
            if (!_inv.chars.length) return interaction.reply(`**${user.username}** doesn't have any characters`);

            let give = interaction.options.getString('give');
            let receive = interaction.options.getString('receive');

            let char1 = search(give, inv.chars, interaction);
            if (!char1.name) return;
            if (!inv.chars.includes(char1.id)) return interaction.reply(`You don't have a copy of **${char1.name}**`);

            let char2 = search(receive, inv.chars, interaction);
            if (!char2.name) return;
            if (!_inv.chars.includes(char2.id)) return interaction.reply(`${user.username} doesn't have a copy of **${char2.name}**`);

            return interaction.reply({ content: `${user.toString()} **${interaction.user.username}** wants to trade **${char1.name}** for your **${char2.name}**. Do you accept?`, components: [OfferRow], fetchReply: true }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 30000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => (r.user.id === user.id || r.user.id === interaction.user.id) && r.customId === "cancel", componentType: ComponentType.Button, time: 30000 });

                confirm.on('collect', async () => {
                    let inv = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
                    inv = { chars: JSON.parse(inv[0].chars) };

                    let _inv = await query(`SELECT chars FROM characters WHERE id = ${user.id}`);
                    _inv = { chars: JSON.parse(_inv[0].chars) };

                    if (!inv.chars.includes(char1.id)) {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send(`You don't have a copy of **${char1.name}**`);
                    }
                    if (!_inv.chars.includes(char2.id)) {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send(`${user.username} doesn't have a copy of **${char2.name}**`);
                    }

                    inv.chars.splice(inv.chars.indexOf(char1.id), 1);
                    _inv.chars.splice(_inv.chars.indexOf(char2.id), 1);
                    inv.chars.push(char2.id);
                    _inv.chars.push(char1.id);

                    interaction.channel.send(`Your trade was successful`);
                    confirm.stop(), cancel.stop();

                    await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}' WHERE id = ${interaction.user.id}`);
                    await query(`UPDATE characters SET chars = '${JSON.stringify(_inv.chars)}' WHERE id = ${user.id}`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    interaction.channel.send("Action cancelled");
                });

            });

        });

    },
};