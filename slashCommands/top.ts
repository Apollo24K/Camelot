import { EmbedBuilder, ComponentType, ButtonInteraction, Message } from "discord.js";
import { auniq, characters } from "../Modules/chars";
import { userLevel, getClassLvl, showPage, formatNumberWithQuotes } from "../Modules/functions";
import { classes } from "../Modules/classes";
import { PageRow } from "../Modules/components";
import { SlashCommand, UserSchema } from "../types";
import { getGuildSchema, getLatestStampede, getReferralLeaderboard, getServerSchema, getUserRanking } from "../Modules/queries";

const exportCommand: SlashCommand = {
    name: 'top',
    async execute({ interaction, author }) {
        if (!interaction.guild) return interaction.reply("Please use this command in a server!");

        let page = interaction.options.getInteger('page') ?? 1;
        let flag = interaction.options.getString('flag') ?? "level";
        let scope = interaction.options.getString('scope') as "server" | "global" | "guild";

        await interaction.deferReply().catch(() => {
            return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
        });

        const servers = await getServerSchema(interaction.guild.id);
        const user_ids = servers?.user_ids ?? [];

        let guildName: string | null = null;
        const guildId = author.schema.guild ?? undefined;
        if (scope === "guild") {
            if (!guildId) return interaction.editReply("You are not in a guild!");
            const guildSchema = await getGuildSchema(guildId);
            if (!guildSchema) return interaction.editReply("Guild not found!");
            guildName = guildSchema.name;
        }

        let stats: (Pick<UserSchema, "name" | "id" | "xp" | "coins" | "lilies" | "pullstotal" | "favchar" | "premium" | "chars" | "char_skin" | "battlechar" | "dungeon_classlevels" | "achievements" | "dungeon_floors" | "eventpts" | "cow_participation" | "custom_skins"> & { cl?: string; clvl?: number; anime?: number; stampede?: number; referral_count?: number; })[] = [];
        let count = 1, showUsers: string[] = [];
        switch (flag) {
            case "level":
                stats = await getUserRanking(scope, user_ids, "xp", guildId);
                stats = stats.filter((e) => !interaction.client.blacklist.has(e.id));
                showUsers = stats.map((e) => `${count++}) **${e.name}** - Level **${userLevel(e.xp)}**`); break;
            case "pulls":
                stats = await getUserRanking(scope, user_ids, "pullstotal", guildId);
                stats = stats.filter((e) => !interaction.client.blacklist.has(e.id));
                showUsers = stats.map((e) => `${count++}) **${e.name}** - **${e.pullstotal}** pulls`); break;
            case "chars":
                stats = await getUserRanking(scope, user_ids, "chars", guildId);
                stats = stats.filter((e) => !interaction.client.blacklist.has(e.id));
                showUsers = stats.map((e) => `${count++}) **${e.name}** - has **${e.chars.length}** characters`); break;
            case "uchars":
                stats = await getUserRanking(scope, user_ids, "uniqueChars", guildId);
                stats = stats.filter((e) => !interaction.client.blacklist.has(e.id));
                showUsers = stats.map((e) => `${count++}) **${e.name}** - has **${[...new Set(e.chars)].length}** unique characters`); break;
            case "progress":
                stats = await getUserRanking(scope, user_ids, "uniqueChars", guildId);
                stats = stats.filter((e) => !interaction.client.blacklist.has(e.id));
                showUsers = stats.map((e) => {
                    const uniqueChars = [...new Set(e.chars)].length;
                    const progressPercentage = Math.floor((uniqueChars / characters.length) * 1000) / 10;
                    return `${count++}) **${e.name}** - has completed **${progressPercentage}%**`;
                });
                break;
            case "anime":
                stats = await getUserRanking(scope, user_ids, "anime", guildId);
                stats = stats.filter((e) => !interaction.client.blacklist.has(e.id));

                // Calculate completed anime count for each user
                const charsTotal = auniq.reduce((obj, animeName) => {
                    return { ...obj, [animeName]: characters.filter((c) => c.anime === animeName).length };
                }, {} as Record<string, number>);

                stats.forEach((user) => {
                    const userChars = [...new Set(user.chars)]; // Get unique characters
                    const charsPerAnime: Record<string, number> = {};

                    // Count characters per anime for this user
                    userChars.forEach((charId) => {
                        const char = characters[charId];
                        if (char) {
                            charsPerAnime[char.anime] = (charsPerAnime[char.anime] || 0) + 1;
                        }
                    });

                    // Count completed anime (user has all characters from that anime)
                    user.anime = Object.keys(charsPerAnime).filter((animeName) =>
                        charsPerAnime[animeName] === charsTotal[animeName]
                    ).length;
                });

                // Sort by completed anime count
                stats.sort((a, b) => (b.anime || 0) - (a.anime || 0));
                stats = stats.filter((e) => e.anime && e.anime !== 0);
                showUsers = stats.map((e) => `${count++}) **${e.name}** - has completed **${e.anime || 0}** anime`);
                break;
            case "lilies":
                stats = await getUserRanking(scope, user_ids, "lilies", guildId);
                stats = stats.filter((e) => !interaction.client.blacklist.has(e.id));
                showUsers = stats.map((e) => `${count++}) **${e.name}** - **${e.lilies}** <:lilium:974057059618291732>`); break;
            case "achievements":
                stats = await getUserRanking(scope, user_ids, "achievements", guildId);
                stats = stats.filter((e) => !interaction.client.blacklist.has(e.id));
                showUsers = stats.map((e) => `${count++}) **${e.name}** - has completed **${e.achievements.length}** achievements`); break;
            case "dungeon":
                stats = await getUserRanking(scope, user_ids, "dungeon", guildId);
                stats = stats.filter((e) => !interaction.client.blacklist.has(e.id));
                showUsers = stats.map((e) => {
                    const floorKeys = Object.keys(e.dungeon_floors);
                    const maxFloor = floorKeys.length > 0 ? Math.max(...floorKeys.map(Number)) : 1;
                    const floor300Wins = e.dungeon_floors['300'];

                    if (maxFloor === 300 && floor300Wins) {
                        return `${count++}) **${e.name}** - Floor **300** (${formatNumberWithQuotes(floor300Wins)} wins)`;
                    } else {
                        return `${count++}) **${e.name}** - Floor **${maxFloor}**`;
                    };
                });
                break;
            case "coins":
                stats = await getUserRanking(scope, user_ids, "coins", guildId);
                stats = stats.filter((e) => !interaction.client.blacklist.has(e.id));
                showUsers = stats.map((e) => `${count++}) **${e.name}** - **${e.coins}** <:coins:872926669055356939>`); break;
            case "class":
                stats = await getUserRanking(scope, user_ids, "class", guildId);
                stats = stats.filter((e) => !interaction.client.blacklist.has(e.id));
                showUsers = stats.map((e) => `${count++}) **${e.name}** - Level **${getClassLvl(parseInt(e.cl!), e.dungeon_classlevels)}** ${classes[parseInt(e.cl!)].emblem}`); break;
            case "stampede":
                const stampedeData = await getLatestStampede();
                if (!stampedeData) {
                    return interaction.editReply("No stampede data available");
                };

                stats = await getUserRanking(scope, user_ids, "stampede", guildId);
                stats.forEach((user) => {
                    user.stampede = stampedeData.participation[user.id]?.[0] ?? 0;
                });

                // Filter out users with no stampede damage and sort by damage
                stats = stats.filter((e) => e.stampede && e.stampede > 0);
                stats.sort((a, b) => (b.stampede || 0) - (a.stampede || 0));
                stats = stats.filter((e) => !interaction.client.blacklist.has(e.id));
                showUsers = stats.map((e) => `${count++}) **${e.name}** - **${formatNumberWithQuotes(e.stampede || 0)}** damage`);
                break;
            // case "referrals":
            //     const referralData = await getReferralLeaderboard("alltime");
            //     const referralMap = referralData.reduce((map, item) => {
            //         map[item.referred_by] = parseInt(item.referral_count);
            //         return map;
            //     }, {} as Record<string, number>);

            //     stats = await getUserRanking(scope, user_ids, "referrals", guildId);
            //     stats.forEach((user) => {
            //         user.referral_count = referralMap[user.id] || 0;
            //     });

            //     // Filter out users with no referrals and sort by referral count
            //     stats = stats.filter((e) => e.referral_count && e.referral_count > 0);
            //     stats.sort((a, b) => (b.referral_count || 0) - (a.referral_count || 0));

            //     // Apply scope filtering for referrals
            //     if (scope === "server") {
            //         // For server scope, only count referrals where the referred user is in the server
            //         const serverReferralData = await getReferralLeaderboard("alltime");
            //         // This would need additional filtering logic, but for now we'll use the global data
            //     };

            //     stats = stats.filter((e) => !(e.id in blacklist));
            //     showUsers = stats.map((e) => `${count++}) **${e.name}** - **${e.referral_count || 0}** referrals`);
            //     break;
            case "cow":
                stats = await getUserRanking(scope, user_ids, "cow_participation", guildId);
                stats = stats.filter((e) => !interaction.client.blacklist.has(e.id));
                showUsers = stats.map((e) => `${count++}) **${e.name}** - **${e.cow_participation}** points`);
                break;
            case "event":
                stats = await getUserRanking(scope, user_ids, "event", guildId);
                stats = stats.filter((e) => !interaction.client.blacklist.has(e.id));
                showUsers = stats.map((e) => `${count++}) **${e.name}** - **${e.eventpts}** 🍫`); break;
            default: return interaction.editReply(`${flag} leaderboard is currently not available`);
        };

        if (!stats[0]) return interaction.editReply("Empty leaderboard");

        const topChars = (typeof stats[0].chars === "string") ? JSON.parse(stats[0].chars) : stats[0].chars;
        let thumbnail = characters[topChars[Math.floor(Math.random() * topChars.length)]]?.image || "https://i.ibb.co/jZ7fHSj/camelot.png";
        if (stats[0].favchar !== null) thumbnail = characters[stats[0].favchar].getImage(stats[0].premium, stats[0].custom_skins[stats[0].favchar], stats[0].char_skin[stats[0].favchar]);

        // Pages
        const pagesTotal = Math.ceil(stats.length / 15);
        let currPage = 1;
        if (page <= pagesTotal && page > 0) {
            currPage = page;
        };

        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setTitle(`🏆 ${scope === "server" ? interaction.guild.name : scope === "guild" ? guildName! : "Camelot"} top players 🏆`)
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
