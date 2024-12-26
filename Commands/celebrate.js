import { query } from "../db_handler";
import { ComponentType, ActionRowBuilder, ButtonBuilder } from "discord.js";

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
    name: 'christmas-present', // celebrate, christmas-present, valentines-chocolate, egg-hunt
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

        const reward = {
            coins: Math.floor(1200 + (Math.random() * 600)),
            gems: 1 + (Math.random() < 0.33),
            expulls: 0 + (Math.random() < 0.4),
            ssshard: Math.floor(Math.random() * 2),
            sshard: Math.floor(1 + (Math.random() * 3)),
            ssticket: 0 + (Math.random() < 0.42),
            sticket: 1 + (Math.random() < 0.66),
            lootbox: 0 + (Math.random() < 0.5)
        };

        // Trick
        // if (Math.random() < 0.08) {
        //     await query(`UPDATE users SET coins = coins - ${coins}, celebrateclaimed = ${Date.now()} WHERE id = ${interaction.user.id}`);
        //     return interaction.reply(`🎃 Trick! 🍬\n>>> **-${coins}** <:coins:872926669055356939>`);
        // };

        await query(`UPDATE users SET coins = coins + ${reward.coins}, gems = gems + ${reward.gems}, expulls = expulls + ${reward.expulls}, ssshard = ssshard + ${reward.ssshard}, sshard = sshard + ${reward.sshard}, ssticket = ssticket + ${reward.ssticket}, sticket = sticket + ${reward.sticket}, lootbox = lootbox + ${reward.lootbox}, celebrateclaimed = ${Date.now()} WHERE id = ${interaction.user.id}`);

        const rewardItems = [
            { amount: reward.expulls, name: '<a:EXTRA:1138530846144462968> pull' },
            { amount: reward.coins, name: '<:coins:872926669055356939>' },
            { amount: reward.gems, name: '<:genesis_gems:1034179687720681492>' },
            { amount: reward.ssshard, name: '<:ss_shard:917203009543503892>' },
            { amount: reward.sshard, name: '<:s_shard:917202925514817566>' },
            { amount: reward.ssticket, name: '<:ss_ticket:927503239396622336>' },
            { amount: reward.sticket, name: '<:s_ticket:927642487705722890>' },
            { amount: reward.lootbox, name: 'lootbox' }
        ];

        // Anniversary
        // return interaction.reply(`🎂 Happy 3rd Anniversary! 🎉\n>>> ${rewardItems.filter(item => item.amount > 0).map(item => `**${item.amount}**x ${item.name}`).join(', ')}`);

        // Christmas
        return interaction.reply(`🎄 Merry Christmas! ❄️\n>>> ${rewardItems.filter(item => item.amount > 0).map(item => `**${item.amount}**x ${item.name}`).join(', ')}`);
    },
};
