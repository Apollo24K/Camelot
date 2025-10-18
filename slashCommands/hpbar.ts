import fs from 'fs';
import { ButtonBuilder, ButtonStyle, ComponentType, ContainerBuilder, MessageFlags } from "discord.js";
import { CompactUserSchema, SlashCommand } from '../types';
import { getUserSchema, updateUsers } from '../Modules/queries';
import { characters } from '../Modules/chars';
import { showPage } from '../Modules/functions';
import CustomHpBar, { customHpBars } from '../Modules/customHpBars';
import { botPfp, PageRow } from '../Modules/components';

const getHpBarPage = ({ hpBars, stats, thmbnl, currPage, pagesTotal, isInteractionOwner }: {
    hpBars: CustomHpBar[],
    stats: CompactUserSchema,
    thmbnl: string;
    currPage: number;
    pagesTotal: number;
    isInteractionOwner: boolean;
}): ContainerBuilder => {
    const shopContainer = new ContainerBuilder()
        .setAccentColor(stats.hpbar ? customHpBars[stats.hpbar].color : hpBars[0].color)
        .addSectionComponents(section => section
            .addTextDisplayComponents(
                text => text.setContent(`## ${stats.name}'s HP Bars`),
                text => text.setContent(`Change the appearance of your HP/Mana bars in battle embeds!\nYou can obtain them through the \`/seasonal shop\` <:ara:1071573953509863465>`)
            )
            .setThumbnailAccessory(thumbnail => thumbnail.setURL(thmbnl))
        );

    // Add HP Bars
    hpBars.forEach(hpBar => shopContainer.addSectionComponents(section => section
        .addTextDisplayComponents(text => text
            .setContent(`**${hpBar.name}**\n${hpBar.getHpBar(0.7, 0.4)}`)
        )
        .setButtonAccessory(button => button
            .setCustomId(`select_hpbar_${hpBar.id}`)
            .setLabel((isInteractionOwner && stats.hpbar === hpBar.id) ? 'Unselect' : 'Select')
            .setStyle((isInteractionOwner && stats.hpbar === hpBar.id) ? ButtonStyle.Secondary : ButtonStyle.Primary)
            .setDisabled(!isInteractionOwner || stats.user_settings.random_hp_bar)
        ))
    );

    // Add Footer
    shopContainer
        .addSeparatorComponents(separator => separator)
        .addActionRowComponents(actionRow => actionRow
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`random_hpbar`)
                    .setLabel(`Random`)
                    .setEmoji('🎲')
                    .setStyle(stats.user_settings.random_hp_bar ? ButtonStyle.Success : ButtonStyle.Secondary)
            )
        )
        .addSeparatorComponents(separator => separator)
        .addTextDisplayComponents(
            text => text.setContent(
                `-# Page ${currPage}/${pagesTotal}`
            )
        );

    return shopContainer;
};

const exportCommand: SlashCommand = {
    name: 'hpbar',
    async execute({ interaction, author }) {

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "list") {
            const user = interaction.options.getUser('user') ?? interaction.user;
            const page = interaction.options.getInteger('page') ?? 1;

            const stats = user.id === interaction.user.id ? author.schema : await getUserSchema(user.id);
            if (!stats) return interaction.reply("User not found");
            if (stats.hpbars.length === 0) return interaction.reply(`${user.id === interaction.user.id ? "You don't have any" : `**${user.username}** doesn't have any`} HP bars`);

            const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
            let thumbnail = characters[stats.chars[Math.floor(Math.random() * stats.chars.length)]].image || botPfp;
            if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[interaction.user.id]?.cimg[stats.favchar], stats.char_skin[stats.favchar]);

            const hpBars = stats.hpbars.map(id => customHpBars[id]);

            const elementsPerPage = 7;
            const pagesTotal = Math.ceil(hpBars.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            return interaction.reply({ components: [getHpBarPage({ hpBars: showPage(currPage, hpBars), stats, thmbnl: thumbnail, currPage, pagesTotal, isInteractionOwner: user.id === interaction.user.id }), ...(pagesTotal === 1 ? [] : [PageRow])], flags: MessageFlags.IsComponentsV2 }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', async (r) => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else if (r.customId === "next") {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    if (r.customId.startsWith('select_hpbar_')) {
                        const hpBarId = parseInt(r.customId.split('_')[2]);
                        if (!stats.hpbars.includes(hpBarId)) return interaction.followUp({ content: `You don't have **${customHpBars[hpBarId].name}**`, ephemeral: true });

                        if (stats.hpbar === hpBarId) stats.hpbar = null;
                        else stats.hpbar = hpBarId;

                        await updateUsers(interaction.user.id, {
                            hpbar: { type: "set", value: stats.hpbar }
                        });
                    };

                    if (r.customId === "random_hpbar") {
                        stats.user_settings.random_hp_bar = !stats.user_settings.random_hp_bar;
                        // Update users table
                        await updateUsers(interaction.user.id, {
                            user_settings: { type: "merge_json", value: { random_hp_bar: stats.user_settings.random_hp_bar } },
                        });
                    };

                    interaction.editReply({ components: [getHpBarPage({ hpBars: showPage(currPage, hpBars), stats, thmbnl: thumbnail, currPage, pagesTotal, isInteractionOwner: user.id === interaction.user.id }), ...(pagesTotal === 1 ? [] : [PageRow])] });
                });
            });
        };

    },
};

export default exportCommand;
