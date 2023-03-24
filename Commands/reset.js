/* eslint-disable no-unused-vars */
const { MessageActionRow, MessageButton } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { search } = require("../Modules/functions.js");

module.exports = {
    name: 'reset',
	description: 'reset your characters level',
	execute(interaction) {

        let choice = interaction.options.getString('character');

        db.serialize(async () => {
            let inv = await query(`SELECT users.premium, characters.chars, characters.level FROM characters JOIN users ON characters.id = users.id WHERE characters.id = ${interaction.user.id}`);
            inv = {premium: inv[0].premium, chars: JSON.parse(inv[0].chars), level: JSON.parse(inv[0].level)};

            let char = search(choice, inv.chars, interaction);
            if (!char.name) return;

            if (!inv.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);
            if (!inv.level[char.id] || inv.level[char.id] === 1) return interaction.reply(`Your **${char.name}** is already level 1`);
            
            let currLvl = inv.level[char.id];
            let price = 0;
            for (let i=0; i < currLvl-1; i++) {
                price += 500 + 100*i;
            };

            let rPer = 0.8;
            if (inv.premium) {
                switch (inv.premium) {
                    case 1: rPer = 0.8; break;
                    case 2: rPer = 0.9; break;
                    case 3: rPer = 1; break;
                    case 4: rPer = 1; break;
                    case 5: rPer = 1; break;
                    case 6: rPer = 1; break;
                    case 7: rPer = 1; break;
                    default : false; break;
                };
            };
            price = Math.floor(price*rPer);

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('confirm')
                        .setEmoji('☑️')
                        .setStyle('SECONDARY'),
                    new MessageButton()
                        .setCustomId('cancel')
                        .setEmoji('❎')
                        .setStyle('SECONDARY'),
                );

            interaction.reply({content: `Do you want to reset **${char.name}**'s level for **${price}**<:coins:872926669055356939>? (You will get ${rPer*100}% back of what you've invested)`, components: [row], fetchReply: true}).then(msg => {

                const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 15000 });
                const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 15000 });
                
                confirm.on('collect', async r => {
                    let checkLevel = await query(`SELECT level FROM characters WHERE id = ${interaction.user.id}`);
                    checkLevel = JSON.parse(checkLevel[0].level)?.[char.id] || 1;
                    if (checkLevel === 1) {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send(`Your **${char.name}** is already level 1`);
                    };
                    if (checkLevel !== currLvl) {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send(`An expected error occured. Please try again.`);
                    };

                    delete inv.level[char.id];

                    interaction.channel.send(`Action completed successfully. Added **${price}**<:coins:872926669055356939> to your balance.`);
                    confirm.stop(), cancel.stop();

                    await query(`UPDATE users SET coins = coins + ${price} WHERE id = ${interaction.user.id}`);
                    await query(`UPDATE characters SET level = '${JSON.stringify(inv.level)}' WHERE id = ${interaction.user.id}`);
                });

                cancel.on('collect', async r => {
                    interaction.channel.send("Action cancelled");
                    confirm.stop(), cancel.stop();
                });

            });
            
        });

    },
};