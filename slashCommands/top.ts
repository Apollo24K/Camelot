import { EmbedBuilder, ComponentType, ButtonInteraction, Message } from "discord.js";
import fs from 'fs';
import { characters, auniq } from "../Modules/chars.js";
import { userLevel, getClassLvl, showPage } from "../Modules/functions.js";
import { classes } from "../Modules/classes.js";
import { PageRow } from "../Modules/components.js";
import { SlashCommand, UserSchema } from "../types.js";
import { getServerSchema, getUserRanking } from "../Modules/queries.js";

const exportCommand: SlashCommand = {
    name: 'top',
    async execute({ interaction, author }) {
        if (!interaction.guild) return interaction.reply("Please use this command in a server!");

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
        const blacklist = JSON.parse(fs.readFileSync('Storage/blacklist.json', 'utf8'));

        let page = interaction.options.getInteger('page') ?? 1;
        let flag = interaction.options.getString('flag') ?? "level";
        let scope = interaction.options.getString('scope') as "server" | "global";

        await interaction.deferReply().catch(() => {
            return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
        });

        const servers = await getServerSchema(interaction.guild.id);
        const user_ids = servers?.user_ids ?? [];

        let stats: Pick<UserSchema, "name" | "id" | "xp" | "pullstotal" | "favchar" | "premium" | "chars" | "char_skin">[] = [];
        let count = 1, showUsers: string[] = [];
        switch (flag) {
            case "level":
                stats = await getUserRanking(scope, user_ids, "xp");
                stats = stats.filter((e) => !(e.id in blacklist));
                showUsers = stats.map((e) => `${count++}) **${e.name}** - Level **${userLevel(e.xp)}**`); break;
            case "pulls":
                stats = await getUserRanking(scope, user_ids, "pullstotal");
                stats = stats.filter((e) => !(e.id in blacklist));
                showUsers = stats.map((e) => `${count++}) **${e.name}** - **${e.pullstotal}** pulls`); break;
            case "chars":
                stats = await getUserRanking(scope, user_ids, "chars");
                stats = stats.filter((e) => !(e.id in blacklist));
                showUsers = stats.map((e) => `${count++}) **${e.name}** - has **${e.chars.length}** characters`); break;
            case "uchars":
                stats = await getUserRanking(scope, user_ids, "uniqueChars");
                stats = stats.filter((e) => !(e.id in blacklist));
                showUsers = stats.map((e) => `${count++}) **${e.name}** - has **${[...new Set(e.chars)].length}** unique characters`); break;
            // case "progress":
            //     stats = await query(`SELECT users.name, users.id, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})` : ""}`);
            //     stats.forEach((e) => e.chars = [...new Set(JSON.parse(e.chars))]);
            //     stats.sort((a, b) => b.chars.length - a.chars.length);
            //     stats = stats.filter((e) => !(e.id in blacklist));
            //     showUsers = stats.map((e) => `${count++}) **${e.name}** - has completed **${Math.floor((e.chars.length / characters.length) * 1000) / 10}%**`); break;
            // case "anime":
            //     stats = await query(`SELECT users.name, users.id, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})` : ""}`);
            //     const charsTotal = auniq.reduce((obj, e) => { return { ...obj, [e]: characters.filter((c) => c.anime === e).length }; }, {});
            //     stats.forEach((e) => { e.chars = [...new Set(JSON.parse(e.chars))]; e.charsTotal = {}; e.chars.forEach((a) => e.charsTotal[characters[a].anime] = (e.charsTotal[characters[a].anime] || 0) + 1); e.anime = Object.keys(e.charsTotal).filter((a) => e.charsTotal[a] === charsTotal[a]).length; delete e.charsTotal; });
            //     stats.sort((a, b) => b.anime - a.anime);
            //     stats = stats.filter((e) => !(e.id in blacklist));
            //     showUsers = stats.map((e) => `${count++}) **${e.name}** - has completed **${e.anime}** anime`); break;
            // case "lilies":
            //     stats = await query(`SELECT users.name, users.id, users.lilies, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})` : ""} ORDER BY users.lilies DESC`);
            //     stats = stats.filter((e) => !(e.id in blacklist));
            //     showUsers = stats.map((e) => `${count++}) **${e.name}** - **${e.lilies}** <:lilium:974057059618291732>`); break;
            // case "achievements":
            //     stats = await query(`SELECT users.name, users.id, users.achievements, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})` : ""}`);
            //     stats.forEach((e) => e.achievements = JSON.parse(e.achievements).length);
            //     stats.sort((a, b) => b.achievements - a.achievements);
            //     stats = stats.filter((e) => !(e.id in blacklist));
            //     showUsers = stats.map((e) => `${count++}) **${e.name}** - has completed **${e.achievements}** achievements`); break;
            // case "dungeon":
            //     stats = await query(`SELECT users.name, users.id, users.favchar, users.premium, characters.chars, characters.skin, dungeon.floors FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})` : ""} ORDER BY LENGTH(dungeon.floors) - LENGTH(REPLACE(dungeon.floors,',','')) DESC`);
            //     stats.sort((a, b) => parseInt(b.floors.match(/"300":(\d+)/)?.[1], 10) - parseInt(a.floors.match(/"300":(\d+)/)?.[1], 10));
            //     stats = stats.filter((e) => !(e.id in blacklist));
            //     showUsers = stats.map((e) => `${count++}) **${e.name}** - Floor **${e.floors.split(",").length === 300 ? `300** (${e.floors.match(/"300":(\d+)/)?.[1]} wins)` : e.floors.split(",").length + "**"}`); break;
            // case "coins":
            //     stats = await query(`SELECT users.name, users.id, users.coins, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})` : ""} ORDER BY users.coins DESC`);
            //     stats = stats.filter((e) => !(e.id in blacklist));
            //     showUsers = stats.map((e) => `${count++}) **${e.name}** - **${e.coins}** <:coins:872926669055356939>`); break;
            // case "class":
            //     stats = await query(`SELECT users.name, users.id, users.favchar, users.battlechar, users.premium, characters.chars, characters.skin, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE LENGTH(dungeon.classlevels) > 2 ${scope === "server" ? `AND users.id IN (${servers.user_ids})` : ""}`);
            //     stats.forEach((e) => [e.cl, e.clvl] = Object.entries(JSON.parse(e.classlevels)).reduce((max, curr) => curr[1] > max[1] ? curr : max, [-1, -Infinity]));
            //     stats.sort((a, b) => b.clvl - a.clvl);
            //     stats = stats.filter((e) => !(e.id in blacklist));
            //     showUsers = stats.map((e) => `${count++}) **${e.name}** - Level **${getClassLvl(e.cl, JSON.parse(e.classlevels))}** ${classes[e.cl].emblem}`); break;
            // case "stampede":
            //     stats = await query(`SELECT users.name, users.id, users.coins, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id ${scope === "server" ? `WHERE users.id IN (${servers.user_ids})` : ""}`);
            //     const { 0: stampede } = await query(`SELECT participation FROM stampedes ORDER BY rowid DESC LIMIT 1`);
            //     stampede.participation = JSON.parse(stampede.participation);
            //     stats.forEach((e) => e.stampede = stampede.participation[e.id]?.[0] ?? 0);
            //     stats = stats.filter((e) => e.stampede);
            //     stats.sort((a, b) => b.stampede - a.stampede);
            //     stats = stats.filter((e) => !(e.id in blacklist));
            //     showUsers = stats.map((e) => `${count++}) **${e.name}** - **${e.stampede}** damage`); break;
            // case "referrals":
            //     stats = await query(`SELECT referrers.name, referrers.id, COUNT(DISTINCT referred.id) as referral_count, referrers.favchar, referrers.premium, characters.chars, characters.skin FROM users as referrers LEFT JOIN users as referred ON referrers.id = referred.referred_by LEFT JOIN characters ON referrers.id = characters.id WHERE referred.referred_by IS NOT NULL ${scope === "server" ? `AND referred.id IN (${servers.user_ids})` : ""} GROUP BY referrers.id ORDER BY referral_count DESC`);
            //     stats = stats.filter((e) => !(e.id in blacklist));
            //     showUsers = stats.map((e) => `${count++}) **${e.name}** - **${e.referral_count}** referrals`); break;
            // case "event":
            //     stats = await query(`SELECT users.name, users.id, users.eventpts, users.favchar, users.premium, characters.chars, characters.skin FROM users JOIN characters ON users.id = characters.id WHERE${scope === "server" ? ` users.id IN (${servers.user_ids}) AND` : ""} users.eventpts > 0 ORDER BY users.eventpts DESC`);
            //     stats = stats.filter((e) => !(e.id in blacklist));
            //     showUsers = stats.map((e) => `${count++}) **${e.name}** - **${e.eventpts}** 🍫`); break;
            default: return interaction.editReply(`${flag} leaderboard is currently not available`);
        };

        if (!stats[0]) return interaction.editReply("Empty leaderboard");

        const topChars = (typeof stats[0].chars === "string") ? JSON.parse(stats[0].chars) : stats[0].chars;
        let thumbnail = characters[topChars[Math.floor(Math.random() * topChars.length)]]?.image || "https://i.ibb.co/jZ7fHSj/camelot.png";
        if (stats[0].favchar !== null) thumbnail = characters[stats[0].favchar].getImage(stats[0].premium, customSettings[interaction.user.id]?.cimg[stats[0].favchar], stats[0].char_skin[stats[0].favchar]);

        // Pages
        const pagesTotal = Math.ceil(stats.length / 15);
        let currPage = 1;
        if (page <= pagesTotal && page > 0) {
            currPage = page;
        };

        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setTitle(`🏆 ${scope === "server" ? interaction.guild.name : "Camelot"} top players 🏆`)
            .setDescription(showPage(currPage, showUsers).join("\n"))
            .setThumbnail(thumbnail)
            .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
        if (pagesTotal === 1) return interaction.editReply({ embeds: [Embed] });
        return interaction.editReply({ embeds: [Embed], components: [PageRow] }).then((msg: Message) => {
            const collector = msg.createMessageComponentCollector({ filter: (r: ButtonInteraction) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', (r: ButtonInteraction) => {
                if (r.customId === "prev") {
                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;
                } else {
                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;
                };

                Embed.setDescription(showPage(currPage, showUsers).join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                interaction.editReply({ embeds: [Embed], components: [PageRow] });
            });
        });

    },
};

export default exportCommand;
