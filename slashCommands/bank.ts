import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { formatNumberWithQuotes } from "../Modules/functions";
import { getUserSchema, updateUsers } from "../Modules/queries";
import { SlashCommand } from '../types';

const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setLabel("Don't show again")
            .setStyle(ButtonStyle.Secondary),
    );

const exportCommand: SlashCommand = {
    name: 'bank',
    async execute({ interaction, author }) {
        const subcommand = interaction.options.getSubcommand();

        const user = interaction.options.getUser('user') || interaction.user;
        const amountFlag = interaction.options.getString('amount') ?? "1";

        const stats = user.id === interaction.user.id ? author.schema : await getUserSchema(user.id);
        if (!stats) return interaction.reply(user.id === interaction.user.id ? "You don't have an account" : `${user.username} has no account`);

        let capbuff = 1;
        switch (stats.premium) {
            case 2: capbuff = 1.1; break;
            case 3: capbuff = 1.2; break;
            case 4: capbuff = 1.25; break;
            case 5: capbuff = 1.3; break;
            case 6: capbuff = 1.35; break;
            case 7: capbuff = 1.4; break;
            default: capbuff = 1; break;
        };

        const cap = Math.round((200000 + (2500 * stats.level)) * capbuff);

        if (subcommand === "view") {
            const extraLvl = Math.max(0, Math.floor((Math.sqrt((2 * (stats.bank)) + (100 * (stats.level * stats.level)) + (700 * stats.level) + 1225) / 10) - 3.5 - stats.level));
            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setAuthor({ name: `${user.username}'s Bank`, iconURL: user.displayAvatarURL({ size: 1024 }) })
                .setThumbnail("https://i.ibb.co/RzqnB8S/bank.png")
                .setDescription(`**Balance**: \`${formatNumberWithQuotes(Math.max(stats.bank, 0))}/${formatNumberWithQuotes(cap)}\` <:coins:872926669055356939>\n**Additional Level**: \`${extraLvl}\``);
            return interaction.reply({ embeds: [Embed], fetchReply: true }).then(() => {
                if (stats.bank === -1 && user.id === interaction.user.id) {
                    const Embed = new EmbedBuilder()
                        .setColor(0x2b2d31)
                        .setThumbnail("https://i.ibb.co/RzqnB8S/bank.png")
                        .setDescription(`### \`Bank\`\nCoins deposited in the bank provide your character with the same stats you'd gain from buying character levels, with the added benefit of being able to withdraw them at any time!\n\nLevel up your character to increase your bank cap further.`);
                    interaction.followUp({ embeds: [Embed], components: [row], fetchReply: true, ephemeral: true }).then((msg: any) => {
                        const collector = msg.createMessageComponentCollector({ filter: (r: any) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 30000 });

                        collector.on('collect', async () => {
                            collector.stop();
                            updateUsers(interaction.user.id, { bank: { type: 'increment', value: 1 } });
                        });
                    });
                };
            });
        };

        if (subcommand === "deposit") {
            if (Math.max(stats.bank, 0) >= cap) return interaction.reply(`Your bank has reached its max capacity. \`/levelup\` your character to increase it further.`);

            let amount = amountFlag.toLowerCase() === "max" ? stats.coins : (parseInt(amountFlag) || 1);
            amount = Math.min(amount, cap - Math.max(stats.bank, 0));

            if (stats.coins < amount) amount = stats.coins;
            if (amount < 1) return interaction.reply(`You don't have any coins to deposit.`);

            await updateUsers(interaction.user.id, {
                coins: { type: 'increment', value: -amount },
                bank: { type: 'increment', value: amount + (stats.bank === -1 ? 1 : 0) }
            });

            return interaction.reply(`Deposited **${formatNumberWithQuotes(amount)}** <:coins:872926669055356939> in your bank!\nBank balance: \`${formatNumberWithQuotes(stats.bank + (amount + (stats.bank === -1 ? 1 : 0)))}/${formatNumberWithQuotes(cap)}\` <:coins:872926669055356939>`);
        };

        if (subcommand === "withdraw") {
            if (stats.bank < 1) return interaction.reply(`You don't have any coins in your bank.`);

            let amount = amountFlag.toLowerCase() === "max" ? stats.bank : (parseInt(amountFlag) || 1);
            amount = Math.min(amount, Math.max(stats.bank, 0));

            await updateUsers(interaction.user.id, {
                coins: { type: 'increment', value: amount },
                bank: { type: 'increment', value: -amount }
            });

            return interaction.reply(`Withdrew **${formatNumberWithQuotes(amount)}** <:coins:872926669055356939> from your bank!\nBank balance: \`${formatNumberWithQuotes(stats.bank - amount)}/${formatNumberWithQuotes(cap)}\` <:coins:872926669055356939>`);
        };
    },
};

export default exportCommand;

