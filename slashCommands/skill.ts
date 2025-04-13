import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from 'discord.js';
import { getUserSchema, updateUsers } from '../Modules/queries';
import { skillTree } from '../Modules/skillTree';
import { CompactUserSchema, SlashCommand } from '../types';
import { showPage } from '../Modules/functions';
import { PageRow } from '../Modules/components';

const exportCommand: SlashCommand = {
    name: 'skill',
    async execute({ interaction, author }) {

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'view') {
            const user = interaction.options.getUser('user') ?? interaction.user;
            const page = interaction.options.getInteger('page') ?? 1;

            const stats = user.id === interaction.user.id ? author.schema : await getUserSchema(user.id);
            if (!stats) return interaction.reply(`User not found`);

            const skillList = Object.keys(stats.skill_tree).map((skill) => skillTree[parseInt(skill)]).sort((a, b) => stats.skill_tree[b.id] - stats.skill_tree[a.id]);

            if (skillList.length === 0) {
                if (user.id === interaction.user.id) return interaction.reply(`You don't have any skills yet, use \`/skill upgrade\` to unlock your first skill!`);
                return interaction.reply(`**${user.username}** doesn't have any skills yet`);
            };

            // Setup Pages
            const elementsPerPage = 4;
            const pagesTotal = Math.ceil(skillList.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            let showSkills = showPage(currPage, skillList, elementsPerPage);

            const Embed = new EmbedBuilder()
                .setAuthor({ name: `${user.username}'s Skill Tree`, iconURL: user.displayAvatarURL({ size: 1024 }) })
                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                .setColor(0xbbffff)
                .setDescription(`${showSkills.map(skill => `**${skill.fullName(stats.skill_tree[skill.id], true)}**\n> - ${skill.desc(stats.skill_tree[skill.id])}`).join("\n\n")}\n\n`)
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            if (pagesTotal === 1) return interaction.reply({ embeds: [Embed] });
            else return interaction.reply({ embeds: [Embed], components: [PageRow] }).then((msg) => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    showSkills = showPage(currPage, skillList, elementsPerPage);

                    Embed.setFooter({ text: `Page ${currPage}/${pagesTotal}` }).setDescription(`${showSkills.map(skill => `**${skill.fullName(stats.skill_tree[skill.id], true)}**\n> - ${skill.desc(stats.skill_tree[skill.id])}`).join("\n\n")}\n\n`);
                    interaction.editReply({ embeds: [Embed] });
                });
            });
        };

        if (subcommand === 'upgrade') {
            let initialLevel = Object.values(author.schema.skill_tree).reduce((acc, curr) => acc + curr, 0);

            const createComponents = (stats: CompactUserSchema) => {
                // Create a deterministic but user-specific sort order using stats.id as seed
                const seed = stats.id + Object.values(stats.skill_tree).reduce((acc, curr) => acc + (curr * 7), 0);
                const sortedSkills = [...skillTree].sort((a, b) => {
                    let hashA = a.id * 31, hashB = b.id * 31;

                    for (let i = 0; i < seed.length; i++) {
                        hashA = ((hashA << 5) - hashA) + seed.charCodeAt(i);
                        hashB = ((hashB << 5) - hashB) + seed.charCodeAt(i);
                        hashA |= 0;
                        hashB |= 0;
                    };

                    return Math.abs(hashA % 100) - Math.abs(hashB % 100);
                }).filter(skill => (stats.skill_tree[skill.id] ?? 0) < skill.maxLevel).slice(0, 3);

                if (sortedSkills.length === 0) return { Embed: null, row: null };

                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(...sortedSkills.map(skill => {
                        const button = new ButtonBuilder()
                            .setCustomId(skill.id.toString())
                            .setEmoji(skill.emojiLabel)
                            .setLabel(skill.name)
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled((skill.cost * ((stats.skill_tree[skill.id] ?? 0) + 1)) > stats.skill_points);
                        return button;
                    }));

                const Embed = new EmbedBuilder()
                    .setAuthor({ name: `Skill Tree Upgrades`, iconURL: interaction.user.displayAvatarURL({ size: 1024 }) })
                    .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                    .setColor(0xbbffff)
                    .setDescription(
                        `Please choose one of the skills below to upgrade:\n\n` +
                        `${sortedSkills.map(skill => `**${skill.fullName((stats.skill_tree[skill.id] ?? 0) + 1)}**\n> - ${skill.desc()}\n> - **Cost**: **${skill.cost * ((stats.skill_tree[skill.id] ?? 0) + 1)}**<:skill_point:1351505460301136014>`).join("\n\n")}\n\n` +
                        `-# Balance: **${stats.skill_points}**<:skill_point:1351505460301136014>`
                    );

                return { Embed, row };
            };

            const { Embed, row } = createComponents(author.schema);
            if (!Embed || !row) return interaction.reply(`You have already maxed out your skill tree!`);

            return interaction.reply({ embeds: [Embed], components: [row] }).then((msg) => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 120000 });

                collector.on('collect', async (r) => {
                    const skillid = parseInt(r.customId);
                    const skill = skillTree[skillid];
                    if (!skill) return;

                    const stats = await getUserSchema(interaction.user.id);
                    if (!stats) return;

                    const cost = skill.cost * ((stats.skill_tree[skillid] ?? 0) + 1);

                    if (cost > stats.skill_points) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough skill points to upgrade this skill (**${stats.skill_points}**/${cost} <:skill_point:1351505460301136014>)`);
                        return;
                    };

                    if (initialLevel !== Object.values(stats.skill_tree).reduce((acc, curr) => acc + curr, 0)) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`Please only use one embed at a time`);
                        return;
                    };
                    initialLevel++;

                    // Update users table
                    stats.skill_tree[skillid] = Math.min((stats.skill_tree[skillid] ?? 0) + 1, skill.maxLevel);
                    stats.skill_points -= cost;
                    await updateUsers(interaction.user.id, {
                        skill_tree: { type: "set", value: stats.skill_tree },
                        skill_points: { type: "increment", value: -cost }
                    });

                    const { Embed, row } = createComponents(stats);
                    if (!Embed || !row) interaction.editReply({ components: [] });
                    else interaction.editReply({ embeds: [Embed], components: [row] });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`Unlocked **${skill.fullName(stats.skill_tree[skillid])}**!`);
                });
            });
        };

    },
};

export default exportCommand;
