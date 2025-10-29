import { EmbedBuilder, ComponentType } from "discord.js";
import { search, showPage } from "../Modules/functions";
import { PageRow } from "../Modules/components";
import { SlashCommand } from '../types';
import { getFindUsers, getServerSchema, updateUsers } from '../Modules/queries';

const rarEmoji = { "EX": "<a:EXTRA:1138530846144462968>", "SS": "<:SSTier:869316489931546644>", "S": "<:STier:869316518675095552>", "A": "<:ATier:869316558013464627>", "B": "<:BTier:869316586803179571>", "C": "<:CTier:869316602858991657>", "D": "<:DTier:869316616071032843>" };

const exportCommand: SlashCommand = {
    name: 'find',
    async execute({ interaction, author, server }) {
        if (!interaction.guild) return interaction.reply({ content: "This command can only be used in a server", ephemeral: true });

        const page = interaction.options.getInteger('page') ?? 1;
        const setting = interaction.options.getString('setting') as "0" | "1" | "2" | null;

        const servers = server.schema ?? await getServerSchema(interaction.guild.id);
        if (!servers) return interaction.reply({ content: "This command can only be used in a server", ephemeral: true });

        const char = search(interaction.options.getString('character', true), author.schema.chars, interaction);
        if (!char) return;

        const stats = await getFindUsers(servers.user_ids, char.id);

        if (setting !== null) {
            if (author.schema.findoption !== parseInt(setting)) {
                await updateUsers(interaction.user.id, { findoption: { type: 'set', value: parseInt(setting) } });
            };
            return interaction.reply(`${["All your characters", "Only your dupes", "None of your characters"][parseInt(setting)]} will be visible for others in \`/find\` from now on <:ThumbsUp:1020442047712350298>`);
        };

        const userCounts: { name: string, count: number; }[] = [];
        let totalCopies = 0;
        stats.forEach((user) => {
            const copies = user.chars.filter((e) => e === char.id).length;
            totalCopies += copies;
            if ((!interaction.client.blacklist.has(user.id)) && ((user.findoption === 0 && copies > 0) || (user.findoption === 1 && copies > 1))) userCounts.push({ name: user.name, count: copies });
        });
        userCounts.sort((a, b) => b.count - a.count);

        const users = userCounts.map(user => `**${user.name}** has **${user.count}** ${user.count == 1 ? "copy" : "copies"}`);

        if (users.length < 1) return interaction.reply(`No one on this server has a dupe of **${char.name}**`);

        // Setup Pages
        const elementsPerPage = 10;
        const pagesTotal = Math.ceil(users.length / elementsPerPage);
        let currPage = 1;
        if (page <= pagesTotal && page > 0) {
            currPage = page;
        };

        let showUsersF = showPage(currPage, users, elementsPerPage);

        const Embed = new EmbedBuilder()
            .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[char.rarity])
            .setTitle(`Found ${users.length} ${users.length > 1 ? "Players" : "Player"}`)
            .setThumbnail(char.image);
        if (pagesTotal === 1) return interaction.reply({ embeds: [Embed.setDescription(`**Character**: ${char.name}\n**Anime**: ${char.anime}\n**Rarity**: ${rarEmoji[char.rarity]}\n**Copies**: ${totalCopies}\n\n` + showUsersF.join("\n"))] });
        return interaction.reply({ embeds: [Embed.setDescription(`**Character**: ${char.name}\n**Anime**: ${char.anime}\n**Rarity**: ${rarEmoji[char.rarity]}\n**Copies**: ${totalCopies}\n\n` + showUsersF.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` })], components: [PageRow], fetchReply: true }).then(msg => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

            collector.on('collect', r => {
                if (r.customId === "prev") {
                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;
                } else {
                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;
                };

                showUsersF = showPage(currPage, users, elementsPerPage);

                Embed.setDescription(`**Character**: ${char.name}\n**Anime**: ${char.anime}\n**Rarity**: ${rarEmoji[char.rarity]}\n**Copies**: ${totalCopies}\n\n` + showUsersF.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                interaction.editReply({ embeds: [Embed], components: [PageRow] });
            });
        });
    },
};

export default exportCommand;
