const { ActionRowBuilder, ButtonBuilder, ComponentType } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { search } = require("../Modules/functions.js");

module.exports = {
    name: 'reset',
	description: 'reset your characters level',
	execute(interaction) {

        let choice = interaction.options.getString('character');

        db.serialize(async () => {
            let inv = await query(`SELECT users.premium, users.gems, characters.chars, characters.level FROM characters JOIN users ON characters.id = users.id WHERE characters.id = ${interaction.user.id}`);
            inv = {premium: inv[0].premium, gems: inv[0].gems, chars: JSON.parse(inv[0].chars), level: JSON.parse(inv[0].level)};

            let char = search(choice, inv.chars, interaction);
            if (!char.name) return;

            if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);
            if (!inv.level[char.id] || inv.level[char.id] === 1) return interaction.reply(`Your **${char.name}** is already level 1`);
            
            let currLvl = inv.level[char.id];
            let price = 0;
            for (let i=0; i < currLvl-1; i++) {
                price += 500 + 100*i;
            };

            let rPer = 0.8, gems = 20;
            if (inv.premium > 1) {
                if (inv.premium === 2) rPer = 0.9, gems = 10;
                else rPer = 1, gems = 0;
            };
            // price = Math.floor(price*rPer);

            const buttons = [
                new ButtonBuilder()
                    .setCustomId('confirm')
                    .setEmoji('<:check_icon:683671903143067743>')
                    .setStyle('Success'),
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setEmoji('<:stop_icon:683671917353369600>')
                    .setStyle('Danger'),
            ];

            if (gems) {
                buttons.push(
                    new ButtonBuilder()
                        .setCustomId('gems')
                        .setEmoji('<:genesis_gems:1034179687720681492>')
                        .setLabel(`reset using ${gems} gems`)
                        .setStyle('Primary'),
                );
            };

            const row = new ActionRowBuilder().addComponents(...buttons);

            interaction.reply({content: `Do you want to reset **${char.name}**'s level for **${Math.floor(price*rPer)}**<:coins:872926669055356939>? (You will get ${rPer*100}% back of what you've invested)${gems ? `\nAlternatively you can reset your character using **${gems}** <:genesis_gems:1034179687720681492> to get 100% of your coins back (**${price}**<:coins:872926669055356939>)` : ""}`, components: [row], fetchReply: true}).then(msg => {

                const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && (r.customId === "confirm" || r.customId === "gems"), componentType: ComponentType.Button, time: 15000 });
                const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 15000 });
                
                confirm.on('collect', async r => {
                    confirm.stop(), cancel.stop();
                    let checkLevel = await query(`SELECT level FROM characters WHERE id = ${interaction.user.id}`);
                    checkLevel = JSON.parse(checkLevel[0].level)?.[char.id] || 1;

                    if (checkLevel === 1) return interaction.channel.send(`Your **${char.name}** is already level 1`);
                    if (checkLevel !== currLvl) return interaction.channel.send(`An expected error occured. Please try again.`);
                    if (r.customId === "gems" && inv.gems < gems) return interaction.channel.send(`You don't have enough gems (**${inv.gems}**/${gems}<:genesis_gems:1034179687720681492>)`)
                    if (r.customId === "confirm") price = Math.floor(price*rPer);

                    delete inv.level[char.id];

                    interaction.channel.send(`Action completed successfully. Added **${price}**<:coins:872926669055356939> to your balance.`);
                    confirm.stop(), cancel.stop();

                    await query(`UPDATE users SET coins = coins + ${price}${r.customId === "gems" ? `, gems = gems - ${gems}` : ""} WHERE id = ${interaction.user.id}`);
                    await query(`UPDATE characters SET level = '${JSON.stringify(inv.level)}' WHERE id = ${interaction.user.id}`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    interaction.channel.send("Action cancelled");
                });

            });
            
        });

    },
};