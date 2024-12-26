import { db, query } from "../db_handler";
import { EmbedBuilder, ComponentType } from "discord.js";
import { profileSets } from "../Modules/profileDecorations";
import { showPage } from "../Modules/functions";
import { PageRow } from "../Modules/components";

module.exports = {
    name: 'backgrounds',
    description: 'list backgrounds',
    execute(interaction) {

        const filter = interaction.options.getString('filter') ?? "owned";
        const user = interaction.options.getUser('user') || interaction.user;
        const page = interaction.options.getInteger('page');

        db.serialize(async () => {
            const { 0: stats } = await query(`SELECT background, backgrounds, premium FROM users WHERE id = ${user.id}`);
            if (!stats) return interaction.reply(`${user.id === interaction.user.id ? "You haven't" : `${user.username} hasn't`} started playing yet.`);
            stats.backgrounds = JSON.parse(stats.backgrounds);
            stats.backgrounds.push("0"); // Free BGs

            const backgrounds = [];
            for (const set of profileSets) {
                if (filter === "all") backgrounds.push(...set.assets);
                else {
                    if (filter === "owned") {
                        if (stats.backgrounds.includes(`${set.id}`)) backgrounds.push(...set.assets);
                        else set.assets.forEach((bg) => {
                            if (stats.backgrounds.includes(`${set.id}.${bg.id}`)) backgrounds.push(bg);
                        });
                    } else if (filter === "missing") {
                        if (!stats.backgrounds.includes(`${set.id}`)) {
                            set.assets.forEach((bg) => {
                                if (!stats.backgrounds.includes(`${set.id}.${bg.id}`)) backgrounds.push(bg);
                            });
                        };
                    };
                };
            };
            if (backgrounds.length < 1) return interaction.reply("No matches found");

            // Setup Pages
            const elementsPerPage = 8;
            const pagesTotal = Math.ceil(backgrounds.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            // Filter backgrounds to show on the current page
            let showItems = showPage(currPage, backgrounds, elementsPerPage);

            // Join elements to string
            let desc = showItems.map((e, i) => {
                if ((i === 0) || (showItems[i - 1].set !== e.set)) {
                    const collected = backgrounds.filter((bg) => bg.set === e.set).length;
                    return `### **${e.set.name}** ${filter === "all" ? "" : (filter === "missing" ? `(**${e.set.assets.length - collected}**/${e.set.assets.length})` : (collected === e.set.assets.length ? "<a:check:873196253276700682>" : `(**${collected}**/${e.set.assets.length})`))}\n> ${e.name}`;
                } else return `> ${e.name}`;
            }).join("\n");

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(filter === "all" ? "Profile Backgrounds" : `${user.username}'s ${filter === "missing" ? "missing " : ""}backgrounds`)
                .setThumbnail(backgrounds[Math.floor(Math.random() * backgrounds.length)].asset.url)
                .setDescription(desc)
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            return interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    // Filter backgrounds to show on the current page
                    showItems = showPage(currPage, backgrounds, elementsPerPage);

                    // Join elements to string
                    desc = showItems.map((e, i) => {
                        if ((i === 0) || (showItems[i - 1].set !== e.set)) {
                            const collected = backgrounds.filter((bg) => bg.set === e.set).length;
                            return `### **${e.set.name}** ${filter === "all" ? "" : (filter === "missing" ? `(**${e.set.assets.length - collected}**/${e.set.assets.length})` : (collected === e.set.assets.length ? "<a:check:873196253276700682>" : `(**${collected}**/${e.set.assets.length})`))}\n> ${e.name}`;
                        } else return `> ${e.name}`;
                    }).join("\n");

                    Embed.setTitle(filter === "all" ? "Profile Backgrounds" : `${user.username}'s ${filter === "missing" ? "missing " : ""}backgrounds`)
                        .setDescription(desc)
                        .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed] });
                });

            });
        });

    },
};
