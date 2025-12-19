import { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, ComponentType, TextInputStyle, SelectMenuComponentOptionData } from "discord.js";
import { updateUsers } from "../Modules/queries";
import { SlashCommand } from "../types";
import { embedColor } from "../Modules/components";

const options: SelectMenuComponentOptionData[] = [
    {
        label: 'Friend / Word of Mouth',
        description: 'A friend or someone told me about it',
        emoji: '👥',
        value: 'friend',
    },
    {
        label: 'Server',
        description: 'Found it in a Discord server',
        emoji: '🏠',
        value: 'server',
    },
    {
        label: 'Rank.top',
        description: 'Discovered through Rank.top',
        emoji: '<:RankTop:1433773442657816616>',
        value: 'rank',
    },
    {
        label: 'Top.gg',
        description: 'Discovered through Top.gg',
        emoji: '<:topgg:1433779730754179133>',
        value: 'top',
    },
    {
        label: 'YouTube / Streamer Mention',
        description: 'Heard about it from content creators',
        emoji: '🎥',
        value: 'youtube',
    },
    {
        label: 'Social Media',
        description: 'Saw it on social media platforms',
        emoji: '📱',
        value: 'social',
    },
    {
        label: 'Search Engine',
        description: 'Found through Google, Bing, etc.',
        emoji: '🔍',
        value: 'search',
    },
    {
        label: 'I don\'t know',
        description: 'I can\'t recall how I discovered it',
        emoji: '🤷',
        value: 'idk',
    },
    {
        label: 'Other (please specify)',
        description: 'Another way not listed here',
        emoji: '❓',
        value: 'other',
    },
];

const row = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('survey_selection')
            .setPlaceholder('Select how you discovered Camelot...')
            .addOptions(options),
    );

const modal = new ModalBuilder()
    .setCustomId('survey_modal')
    .setTitle('Survey: Other')
    .addComponents([
        new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
                .setCustomId('survey_input')
                .setLabel("How did you discover Camelot?")
                .setStyle(TextInputStyle.Short)
                .setMinLength(3)
                .setMaxLength(30)
                .setPlaceholder('Please tell us how you found Camelot...')
                .setRequired(true),
        ),
    ]);

const exportCommand: SlashCommand = {
    name: 'survey',
    async execute({ interaction, author }) {

        // Check if user has already submitted survey
        if (author.schema.discovered_via) {
            return interaction.reply({ content: `You've already completed this survey! Your response: **${options.find(option => option.value === author.schema.discovered_via)?.label || author.schema.discovered_via}**` });
        };

        const Embed = new EmbedBuilder()
            .setColor(embedColor)
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setDescription(
                "## 📋 How did you discover Camelot?" +
                "\n\nWe'd love to know how you first heard about Camelot! <:KanaPoint:1298637938107879497>" +
                "\n\nYour feedback helps us understand where our community comes from and how to reach more players. Please select one of the options below." +
                "\n\n**Rewards**:" +
                "\n- 2x <:royal_chest:1069301128711376976>" +
                "\n- 100 <:genesis_gems:1034179687720681492>" +
                "\n- 10'000 <:coins:1030580480782893197>"
            );
        await interaction.reply({ embeds: [Embed], components: [row] }).then((msg) => {

            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "survey_selection", componentType: ComponentType.StringSelect, time: 120000 });

            collector.on('collect', async r => {
                collector.stop();

                const selection = r.values[0];

                if (selection === 'other') {
                    await r.showModal(modal);

                    interaction.awaitModalSubmit({ filter: (modalR) => modalR.customId === 'survey_modal' && modalR.user.id === interaction.user.id, time: 120000 }).then(async modalInteraction => {
                        const response = modalInteraction.fields.getTextInputValue('survey_input');

                        await updateUsers(interaction.user.id, {
                            discovered_via: { type: 'set', value: `other: ${response.slice(0, 30)}` },
                            coins: { type: 'increment', value: 10000 },
                            gems: { type: 'increment', value: 100 },
                            items: { type: 'merge_json', value: { '457': 2 } },
                        });

                        const successEmbed = new EmbedBuilder()
                            .setColor(embedColor)
                            .setTitle("Thank you for your feedback!")
                            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                            .setDescription(`Your response has been recorded: **${response.slice(0, 30)}**\n\nWe appreciate you taking the time to help us improve! <:ThumbsUp:1020442047712350298>`);
                        await modalInteraction.reply({ embeds: [successEmbed], components: [] });
                    }).catch();
                } else {
                    await updateUsers(interaction.user.id, {
                        discovered_via: { type: 'set', value: selection },
                        coins: { type: 'increment', value: 10000 },
                        gems: { type: 'increment', value: 100 },
                        items: { type: 'merge_json', value: { '457': 2 } },
                    });

                    const successEmbed = new EmbedBuilder()
                        .setColor(embedColor)
                        .setTitle("Thank you for your feedback!")
                        .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                        .setDescription(`Your response has been recorded: **${options.find(option => option.value === selection)?.label || selection}**\n\nWe appreciate you taking the time to help us improve! <:ThumbsUp:1020442047712350298>`);
                    interaction.editReply({ embeds: [successEmbed], components: [] }).catch(() => { });
                };
            });

            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor(embedColor)
                        .setDescription("## ❌ Survey Timed Out\n\nThe survey has expired. You can run `/survey` again anytime!");
                    interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => { });
                };
            });

        });

    },
};

export default exportCommand;
