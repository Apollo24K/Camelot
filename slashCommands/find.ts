import { collectComponentUpdates } from "../Modules/buttonInteractions";
import { replyToCommand, deferCommand, editCommandReply } from "../Modules/interactionResponses";
import { EmbedBuilder, ComponentType } from "discord.js";
import { search, showPage, rarityColor, rarityEmoji } from "../Modules/functions";
import { PageRow } from "../Modules/components";
import { SlashCommand } from '../types';
import { getFindUsers, getServerSchema, updateUsers } from '../Modules/queries';

const exportCommand: SlashCommand = {
    name: 'find',
    earlyAcknowledgement: "public",
    async execute({ interaction, author, server }) {
        if (!interaction.guild) return replyToCommand(interaction, { content: "This command can only be used in a server", ephemeral: true });

        try {
            await deferCommand(interaction);
        } catch (err) {
            return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
        };

        const page = interaction.options.getInteger('page') ?? 1;
        const setting = interaction.options.getString('setting') as "0" | "1" | "2" | null;

        const servers = server.schema ?? await getServerSchema(interaction.guild.id);
        if (!servers) return editCommandReply(interaction, { content: "This command can only be used in a server" });

        const char = search(interaction.options.getString('character', true), author.schema.chars, interaction);
        if (!char) return;

        const stats = await getFindUsers(servers.user_ids, char.id);

        if (setting !== null) {
            if (author.schema.findoption !== parseInt(setting)) {
                await updateUsers(interaction.user.id, { findoption: { type: 'set', value: parseInt(setting) } });
            };
            return editCommandReply(interaction, `${["All your characters", "Only your dupes", "None of your characters"][parseInt(setting)]} will be visible for others in \`/find\` from now on <:ThumbsUp:1020442047712350298>`);
        };

        const userCounts: { name: string, count: number; }[] = [];
        let totalCopies = 0;
        stats.forEach((user) => {
            const copies = user.chars.filter((e) => e === char.id).length + Number(user.vip_copies);
            totalCopies += copies;
            if ((!interaction.client.blacklist.has(user.id)) && ((user.findoption === 0 && copies > 0) || (user.findoption === 1 && copies > 1))) userCounts.push({ name: user.name, count: copies });
        });
        userCounts.sort((a, b) => b.count - a.count);

        const users = userCounts.map(user => `**${user.name}** has **${user.count}** ${user.count == 1 ? "copy" : "copies"}`);

        if (users.length < 1) return editCommandReply(interaction, `No one on this server has a dupe of **${char.name}**`);

        // Setup Pages
        const elementsPerPage = 10;
        const pagesTotal = Math.ceil(users.length / elementsPerPage);
        let currPage = 1;
        if (page <= pagesTotal && page > 0) {
            currPage = page;
        };

        let showUsersF = showPage(currPage, users, elementsPerPage);

        const Embed = new EmbedBuilder()
            .setColor(rarityColor(char.rarity))
            .setTitle(`Found ${users.length} ${users.length > 1 ? "Players" : "Player"}`)
            .setThumbnail(char.image);
        if (pagesTotal === 1) return editCommandReply(interaction, { embeds: [Embed.setDescription(`**Character**: ${char.name}\n**Anime**: ${char.anime}\n**Rarity**: ${rarityEmoji(char.rarity)}\n**Copies**: ${totalCopies}\n\n` + showUsersF.join("\n"))] });
        return editCommandReply(interaction, { embeds: [Embed.setDescription(`**Character**: ${char.name}\n**Anime**: ${char.anime}\n**Rarity**: ${rarityEmoji(char.rarity)}\n**Copies**: ${totalCopies}\n\n` + showUsersF.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` })], components: [PageRow] }).then(msg => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

            collectComponentUpdates(collector, async r => {
                if (r.customId === "prev") {
                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;
                } else {
                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;
                };

                showUsersF = showPage(currPage, users, elementsPerPage);

                Embed.setDescription(`**Character**: ${char.name}\n**Anime**: ${char.anime}\n**Rarity**: ${rarityEmoji(char.rarity)}\n**Copies**: ${totalCopies}\n\n` + showUsersF.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                await editCommandReply(interaction, { embeds: [Embed], components: [PageRow] });
            });
        });
    },
};

export default exportCommand;
