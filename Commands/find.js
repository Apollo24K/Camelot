import fs from 'fs';
import { EmbedBuilder, ComponentType } from "discord.js";
import { db, query } from "../db_handler";
import { search, showPage } from "../Modules/functions";
import { PageRow } from "../Modules/components";

const rarEmoji = { "EX": "<a:EXTRA:1138530846144462968>", "SS": "<:SSTier:869316489931546644>", "S": "<:STier:869316518675095552>", "A": "<:ATier:869316558013464627>", "B": "<:BTier:869316586803179571>", "C": "<:CTier:869316602858991657>", "D": "<:DTier:869316616071032843>" };

module.exports = {
    name: 'find',
    description: 'find a character in your server',
    execute(interaction) {

        const blacklist = JSON.parse(fs.readFileSync('Storage/blacklist.json', 'utf8'));

        const page = interaction.options.getInteger('page');
        const setting = interaction.options.getString('setting');

        db.serialize(async () => {
            const { 0: servers } = await query(`SELECT user_ids FROM servers WHERE id = ${interaction.guild.id}`);

            const stats = await query(`SELECT users.id, users.name, users.findoption, characters.chars FROM users JOIN characters ON users.id = characters.id WHERE users.id IN (${servers.user_ids})`);

            if (setting !== null) {
                const user = stats.find((e) => e.id === interaction.user.id);
                if (user.findoption !== parseInt(setting)) await query(`UPDATE users SET findoption = ${setting} WHERE id = ${interaction.user.id}`);
                return interaction.reply(`${["All your characters", "Only your dupes", "None of your characters"][setting]} will be visible for others in \`/find\` from now on <:ThumbsUp:1020442047712350298>`);
            };

            const char = search(interaction.options.getString('character'), [0], interaction);
            if (!char.name) return;

            let users = [], totalCopies = 0;
            stats.forEach((user) => {
                const copies = JSON.parse(user.chars).filter((e) => e === char.id).length;
                totalCopies += copies;
                if ((!(user.id in blacklist)) && ((user.findoption === 0 && copies > 0) || (user.findoption === 1 && copies > 1))) users.push({ name: user.name, count: copies });
            });
            users.sort((a, b) => b.count - a.count);

            users = users.map(user => `**${user.name}** has **${user.count}** ${user.count == 1 ? "copy" : "copies"}`);

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

        });

    },
};