const { query } = require("../db_handler.js");
const { ComponentType, ActionRowBuilder, ButtonBuilder } = require("discord.js");

// Get # of days since
function daysAgo(lastOnlineDate) {
    if (!lastOnlineDate) return 0;
    const now = new Date();
    // set to midnight
    now.setHours(0, 0, 0, 0);
    lastOnlineDate.setHours(0, 0, 0, 0);

    const diffTime = now - lastOnlineDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

module.exports = {
    name: 'valentines-chocolate', // christmas-present
    description: 'claim daily event reward',
    async execute(interaction) {

        // Valentine's Chocolate
        let user = interaction.options.getUser('give');
        if (user) {
            if (user.id === interaction.user.id) return interaction.reply({ content: "<:Heh:928368727588757504>", ephemeral: true });
            const { 0: stats } = await query(`SELECT valentine FROM users WHERE id = ${interaction.user.id}`);
            if (stats.valentine) return interaction.reply({ content: "You already gave away your valentine's chocolate!", ephemeral: true });

            const message = interaction.options.getString('message') ?? "";

            const ValentinesRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirm')
                        .setEmoji('<:check_icon:683671903143067743>')
                        .setLabel(`Send as ${interaction.user.username}`)
                        .setStyle('Success'),
                    new ButtonBuilder()
                        .setCustomId('anonymous')
                        .setEmoji('<:check_icon:683671903143067743>')
                        .setLabel('Send anonymously')
                        .setStyle('Success'),
                    new ButtonBuilder()
                        .setCustomId('cancel')
                        .setEmoji('<:stop_icon:683671917353369600>')
                        .setLabel('Cancel')
                        .setStyle('Danger'),
                );

            return interaction.reply({ content: `Are you sure you want to give __Valentine's Chocolate__ <:valentines_chocolate:1207055321839960194> to **${user.username}**?\n⚠️ This command can only be used once!\nAttached message:\n> ${message || "`None`"}`, components: [ValentinesRow], ephemeral: true, fetchReply: true }).then(msg => {
                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && (r.customId === "confirm" || r.customId === "anonymous"), componentType: ComponentType.Button, time: 15000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 15000 });

                confirm.on('collect', async (r) => {
                    confirm.stop(), cancel.stop();

                    const { 0: stats } = await query(`SELECT valentine FROM users WHERE id = ${interaction.user.id}`);
                    if (stats.valentine) return interaction.followUp({ content: "You already gave away your valentine's chocolate!", ephemeral: true });

                    const { 0: inv } = await query(`SELECT items FROM users WHERE id = ${user.id}`);
                    inv.items = JSON.parse(inv.items);
                    inv.items[686] = (inv.items[686] ?? 0) + 1;

                    await query(`UPDATE users SET valentine = ${user.id} WHERE id = ${interaction.user.id}`);
                    await query(`UPDATE users SET items = '${JSON.stringify(inv.items)}' WHERE id = ${user.id}`);

                    interaction.followUp({ content: `**${user.username}** has received your chocolate!`, ephemeral: true });

                    user.send(`You have received some <:valentines_chocolate:1207055321839960194> __Valentine's Chocolate__${r.customId === "confirm" ? ` from ${interaction.user.toString()}` : ""}!${message ? `\n> ${message}` : ""}`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    interaction.followUp({ content: "Action cancelled", ephemeral: true });
                });

            });
        };

        const { 0: stats } = await query(`SELECT celebrateclaimed FROM users WHERE id = ${interaction.user.id}`);

        if (stats.celebrateclaimed && daysAgo(new Date(stats.celebrateclaimed)) === 0) return interaction.reply("Come back in " + `${(23 - new Date().getHours()) ? `**${23 - new Date().getHours()}**h` : ""} **${60 - new Date().getMinutes()}**min`);

        const coins = Math.floor(1200 + (Math.random() * 600));
        const gems = 1 + (Math.random() < 0.33);
        const expulls = 0 + (Math.random() < 0.3);
        const ssshard = Math.floor(Math.random() * 2);
        const sshard = Math.floor(1 + (Math.random() * 3));
        const ssticket = 0 + (Math.random() < 0.42);
        const sticket = 1 + (Math.random() < 0.66);
        const lootbox = 0 + (Math.random() < 0.5);

        // Trick
        // if (Math.random() < 0.08) {
        //     await query(`UPDATE users SET coins = coins - ${coins}, celebrateclaimed = ${Date.now()} WHERE id = ${interaction.user.id}`);
        //     return interaction.reply(`🎃 Trick! 🍬\n>>> **-${coins}** <:coins:872926669055356939>`);
        // };

        // EX Pull to add
        await query(`UPDATE users SET coins = coins + ${coins}, gems = gems + ${gems}, expulls = expulls + ${expulls}, ssshard = ssshard + ${ssshard}, sshard = sshard + ${sshard}, ssticket = ssticket + ${ssticket}, sticket = sticket + ${sticket}, lootbox = lootbox + ${lootbox}, celebrateclaimed = ${Date.now()} WHERE id = ${interaction.user.id}`);

        let rewardMessage = `🎀 Happy Valentine's! 🍫\n>>> ${expulls ? `**${expulls}**x <a:EXTRA:1138530846144462968> pull, ` : ""}**${coins}** <:coins:872926669055356939>`;
        if (gems) rewardMessage += `, **${gems}** <:genesis_gems:1034179687720681492>`;
        if (ssshard) rewardMessage += `, **${ssshard}**x <:ss_shard:917203009543503892>`;
        if (sshard) rewardMessage += `, **${sshard}**x <:s_shard:917202925514817566>`;
        if (ssticket) rewardMessage += `, **${ssticket}**x <:ss_ticket:927503239396622336>`;
        if (sticket) rewardMessage += `, **${sticket}**x <:s_ticket:927642487705722890>`;
        if (lootbox) rewardMessage += `, **${lootbox}**x lootbox`;

        return interaction.reply(rewardMessage);
    },
};
