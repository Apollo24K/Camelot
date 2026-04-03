import { EmbedBuilder, ComponentType } from "discord.js";
import { characters } from "../Modules/chars";
import { getDetailedStats, showPage, baseEP, RoK, rarityEmoji } from "../Modules/functions";
import { PageRow } from "../Modules/components";
import { IRoK, SlashCommand } from '../types';
import { getCachedUserSchema } from '../Modules/queries';

/*
    Formula                         | P0 100  1  0  EP:   1.00
    HP₁ -= ATK₂*(0.99895)^DEF₁      | P1 300 30 30  EP:  95.05
    HP₂ -= ATK₁*(0.99895)^DEF₂      | P2 400 50 40  EP: 172.09

    HP -= ATK -> over time: HP/ATK₁(c)^0
    P1 Finishes in 3.33t
    P2 Finishes in 2.5t        (less is better)

    P1 Finished in 316.85t
    P2 Finished in 430.23t     (more is better)

    HP₁ -= 100*(0.99895)^DEF₁  -> HP₁/(1*(0.99895)^DEF₁)
    HP₂ -= 100*(0.99895)^DEF₂

    EP = d(HP₁)/dt / d(HP)/dt = (HP₁/(0.99895)^DEF₁)/(100/ATK₁) -> (HP*ATK)/c^DEF
*/

export const exportCommand: SlashCommand = {
    name: 'rank',
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction, author, server }) {
        if (!interaction.guild || !server.schema) return interaction.reply("Please use this command in a server");

        let scope = interaction.options.getString('scope') ?? "global";
        let page = interaction.options.getInteger('page') ?? 1;
        const user = interaction.options.getUser('user') ?? interaction.user;

        let sortedArr: string[] = [], count = 1, rokS: Map<number, number>, embedTitle = "", thumbnail = "";

        if (scope === "inventory") {
            await interaction.deferReply().catch(() => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });
            // try {
            //     await interaction.deferReply();
            // } catch (err) {
            //     return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            // };
        };


        if (scope === "base" || scope === "inventory") {
            const rok = new Map();
            if (scope === "base") {
                characters.forEach((e) => rok.set(e.id, baseEP(e.id)));
                embedTitle = "Top Characters Ranking";
            } else {
                const inv = user.id === interaction.user.id ? author.schema : await getCachedUserSchema(user.id, interaction.client);
                if (!inv) return interaction.editReply(`${user.username} hasn't started playing yet.`);
                const uniq = [...new Set(inv.chars)];
                for (const id of uniq) {
                    const bStats = await getDetailedStats(id, inv, inv.dungeon_classlevels);
                    rok.set(id, bStats.ep);
                };
                embedTitle = "Your top characters";
            };

            rokS = new Map([...rok.entries()].sort((a, b) => b[1] - a[1]));
            rokS.forEach((val, key) => sortedArr.push(`${rarityEmoji(characters[key].rarity)} ${count++}. ${characters[key].name} - EP: **${val}**`));
            thumbnail = characters[[...rokS.keys()][0]]?.image || characters[Math.floor(Math.random() * characters.length)].image;
        };

        if (scope === "server" || scope === "global") {
            let sortedRoK: IRoK[] = [];
            if (scope === "server") {
                server.schema.user_ids.forEach((uid) => {
                    const player = RoK.get(uid);
                    if (player) sortedRoK.push(player);
                });
            } else {
                sortedRoK = [...RoK.values()];
            };
            sortedRoK = sortedRoK.filter((e) => e && !interaction.client.blacklist.has(e.id));
            sortedRoK.sort((a, b) => b.ep - a.ep);

            sortedArr = sortedRoK.map((e) => `${rarityEmoji(characters[e.char].rarity)} ${count++}. **${characters[e.char].name}** - EP: ${e.ep} => ${e.name}`);

            embedTitle = `🏆 ${scope === "server" ? interaction.guild.name : "Camelot"} top characters 🏆`;

            const tuser = await getCachedUserSchema(sortedRoK[0].id, interaction.client);
            if (!tuser) return interaction.reply("Something went wrong, please try again later.");
            thumbnail = characters[sortedRoK[0].char].getImage((tuser?.premium || 0), (tuser?.custom_skins[sortedRoK[0].char] || ""), tuser?.char_skin[sortedRoK[0].char] || undefined);
        };

        const elementsPerPage = 15;
        const pagesTotal = Math.ceil(sortedArr.length / elementsPerPage);
        let currPage = 1;
        if (page <= pagesTotal && page > 0) {
            currPage = page;
        };

        // Filter items to show on the current page
        let showUsersF = showPage(currPage, sortedArr, elementsPerPage);

        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setTitle(embedTitle)
            .setDescription(showUsersF.join("\n"))
            .setThumbnail(thumbnail)
            .setFooter({ text: `Page ${currPage}/${pagesTotal} ${(scope === "server" || scope === "global") ? "| Ranking updates every 6 hours" : ""}` });
        if (pagesTotal === 1) return interaction[interaction.deferred ? "editReply" : "reply"]({ embeds: [Embed] });
        return interaction[interaction.deferred ? "editReply" : "reply"]({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

            collector.on('collect', async r => {
                if (r.customId === "prev") {
                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;
                } else {
                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;
                };

                showUsersF = showPage(currPage, sortedArr, elementsPerPage);

                Embed.setDescription(showUsersF.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal} ${(scope === "server" || scope === "global") ? "| Ranking updates every 6 hours" : ""}` });
                msg.edit({ embeds: [Embed], components: [PageRow] });
            });

        });

    },
};

export default exportCommand;
