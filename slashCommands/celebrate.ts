import { ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { SlashCommand } from "../types";
import { getUserSchema, updateUsers } from "../Modules/queries";
import { isEventOngoing, ongoingEvent, seasonalEventEnd, seasonalEventStart } from "../Modules/components";

// Get # of days since
function daysAgo(lastOnlineDate: Date) {
    if (!lastOnlineDate) return 0;
    const now = new Date();
    // set to midnight
    now.setHours(0, 0, 0, 0);
    lastOnlineDate.setHours(0, 0, 0, 0);

    const diffTime = now.getTime() - lastOnlineDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export const exportCommand: SlashCommand = {
    name: { anniversary: 'celebrate', halloween: 'trick-or-treat', christmas: 'christmas-present', valentines: 'valentines-chocolate', easter: 'egg-hunt' }[ongoingEvent],
    async execute({ interaction, author }) {

        // Check if event is on
        if (!isEventOngoing()) {
            if (Date.now() > seasonalEventEnd.getTime()) return interaction.reply({ content: "There's currently no active event", ephemeral: true });

            // Return how much time is left till start
            const timeLeft = seasonalEventStart.getTime() - Date.now();
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

            const timeComponents: string[] = [];
            if (days > 0) timeComponents.push(`${days}d`);
            if (hours > 0) timeComponents.push(`${hours}h`);
            if (minutes > 0) timeComponents.push(`${minutes}min`);

            return interaction.reply({ content: `The event will start in **${timeComponents.join(' ')}**`, ephemeral: true });
        };

        const stats = author.schema;

        // Valentine's Chocolate
        const user = interaction.options.getUser('give');
        if (user) {
            if (user.id === interaction.user.id) return interaction.reply({ content: "<:Heh:928368727588757504>", ephemeral: true });
            if (stats.valentine) return interaction.reply({ content: "You already gave away your valentine's chocolate!", ephemeral: true });

            const message = interaction.options.getString('message') ?? "";

            const ValentinesRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirm')
                        .setEmoji('<:check_icon:683671903143067743>')
                        .setLabel(`Send as ${interaction.user.username}`)
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('anonymous')
                        .setEmoji('<:check_icon:683671903143067743>')
                        .setLabel('Send anonymously')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('cancel')
                        .setEmoji('<:stop_icon:683671917353369600>')
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Danger),
                );

            return interaction.reply({ content: `Are you sure you want to give __Valentine's Chocolate__ <:valentines_chocolate:1207055321839960194> to **${user.username}**?\n⚠️ This command can only be used once!\nAttached message:\n> ${message || "`None`"}`, components: [ValentinesRow], ephemeral: true }).then(msg => {
                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && (r.customId === "confirm" || r.customId === "anonymous"), componentType: ComponentType.Button, time: 15000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 15000 });

                confirm.on('collect', async (r) => {
                    confirm.stop(), cancel.stop();

                    const stats = await getUserSchema(interaction.user.id);
                    if (!stats || stats.valentine) return interaction.followUp({ content: "You already gave away your valentine's chocolate!", ephemeral: true });

                    await updateUsers(interaction.user.id, {
                        valentine: { type: 'set', value: user.id }
                    });
                    await updateUsers(interaction.user.id, {
                        items: { type: 'merge_json', value: { [686]: 1 } }
                    });

                    interaction.followUp({ content: `**${user.username}** has received your chocolate!`, ephemeral: true });

                    user.send(`You have received some <:valentines_chocolate:1207055321839960194> __Valentine's Chocolate__${r.customId === "confirm" ? ` from ${interaction.user.toString()}` : ""}!${message ? `\n> ${message}` : ""}`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    interaction.followUp({ content: "Action cancelled", ephemeral: true });
                });
            });
        };

        // Check if user has claimed today
        if (stats.celebrateclaimed && daysAgo(new Date(stats.celebrateclaimed)) === 0) {
            return interaction.reply(`Please come back in ${(23 - new Date().getHours()) ? `**${23 - new Date().getHours()}**h ` : ""}**${60 - new Date().getMinutes()}**min`);
        };

        const reward = {
            coins: Math.floor(1200 + (Math.random() * 600)),
            gems: 1 + (Math.random() < 0.33 ? 1 : 0),
            expulls: 0 + (Math.random() < 0.4 ? 1 : 0),
            ssshard: Math.floor(Math.random() * 2),
            sshard: Math.floor(1 + (Math.random() * 3)),
            ssticket: 0 + (Math.random() < 0.42 ? 1 : 0),
            sticket: 1 + (Math.random() < 0.66 ? 1 : 0),
            lootbox: 0 + (Math.random() < 0.5 ? 1 : 0)
        };

        // Trick
        if (ongoingEvent === "halloween" && Math.random() < 0.06) {
            await updateUsers(interaction.user.id, {
                coins: { type: 'increment', value: -reward.coins },
                celebrateclaimed: { type: 'set', value: Date.now() }
            });

            return interaction.reply(`🎃 Trick! 🍬\n>>> **-${reward.coins}** <:coins:872926669055356939>`);
        };

        // Update user table
        await updateUsers(interaction.user.id, {
            coins: { type: 'increment', value: reward.coins },
            gems: { type: 'increment', value: reward.gems },
            expulls: { type: 'increment', value: reward.expulls },
            ssshard: { type: 'increment', value: reward.ssshard },
            sshard: { type: 'increment', value: reward.sshard },
            ssticket: { type: 'increment', value: reward.ssticket },
            sticket: { type: 'increment', value: reward.sticket },
            lootbox: { type: 'increment', value: reward.lootbox },
            celebrateclaimed: { type: 'set', value: Date.now() }
        });

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

        const message = {
            anniversary: "🎂 Happy 3rd Anniversary! 🎉",
            halloween: "🎃 Treat! 🍬",
            christmas: "🎄 Merry Christmas! ❄️",
            valentines: "🍫 Indulge in a sweet treat! 🎀",
            easter: "🐰 See what you find! 🧺",
        }[ongoingEvent];

        return interaction.reply(`${message}\n>>> ${rewardItems.filter(item => item.amount > 0).map(item => `**${item.amount}**x ${item.name}`).join(', ')}`);
    },
};

export default exportCommand;
