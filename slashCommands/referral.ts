import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, ComponentType, ButtonStyle, TextInputStyle } from "discord.js";
import { userLevel, showPage } from "../Modules/functions";
import { PageRow, OfferRow } from "../Modules/components";
import { SlashCommand } from "../types";
import { doesUserExist, getIndirectReferredUsers, getReferralLeaderboard, getReferredUsers, getUserSchema, getUserSchemas, updateUsers } from "../Modules/queries";

const enterRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('ignore_defer-open_modal')
            .setLabel('Enter')
            .setStyle(ButtonStyle.Success),
    );

function getListRow(claimed = true) {
    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('ignore_defer-referred')
                .setLabel('List of referred players')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('claim')
                .setLabel('Claim Rewards')
                .setStyle(ButtonStyle.Success)
                .setDisabled(claimed),
        );
};

function getModal(uid: string) {
    return new ModalBuilder()
        .setCustomId('enter_referral_id_' + uid)
        .setTitle('Enter a refferal id')
        .addComponents([
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('referral_id')
                    .setLabel("Input the ID of the player who invited you")
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(16)
                    .setMaxLength(20)
                    .setPlaceholder('E.g. 489490486734880774')
                    .setRequired(true),
            ),
        ]);
};

const exportCommand: SlashCommand = {
    name: 'referral',
    async execute({ interaction, author }) {

        const user = interaction.options.getUser('user') ?? interaction.user;

        const stats = author.schema;
        const myAccAge = (Date.now() - (new Date(stats.created)).getTime()) / (86400 * 1000);

        // const { 0: stats } = await query(`SELECT xp, referred_by, referred_gems, referrals_claimed, (strftime('%s', datetime('now')) - strftime('%s', created)) / 86400 AS age FROM users WHERE id = ${interaction.user.id}`);

        // if new
        if ((user.id === interaction.user.id) && ((myAccAge === 0 || userLevel(stats.xp) <= 5) && !stats.referred_by)) {
            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                .setDescription(`### Referrals\nInvite players to the game to get rare rewards and continued benefits for both the inviter and invited players!\n### Rewards\n- Receive milestone rewards including exlusive items <:NepOkay:538081940444545025>\n- Get **20%** of all <:genesis_gems:1034179687720681492> purchases made by your invited players\n- Make it to the leaderboard to get periodic rewards!\n### But before getting started\nIf someone invited you to Camelot, ask them for their \`/referral\` ID to get rewards, you have 24 hours!`);
            return interaction.reply({ embeds: [Embed], components: [enterRow] }).then(async (msg) => {
                const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000 });
                const uid = Math.random().toString();

                collector.on('collect', async (r) => {
                    if (r.user.id === interaction.user.id) return r.showModal(getModal(uid));
                    await r.deferUpdate().catch(() => {
                        console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}"`);
                    });
                });

                collector.on('end', () => {
                    interaction.editReply({ components: [] });
                });

                interaction.awaitModalSubmit({ filter: (r) => r.customId === ('enter_referral_id_' + uid), time: 120000 }).then(async (r) => {
                    collector.stop();

                    const rid = r.fields.getTextInputValue('referral_id');
                    if (rid === interaction.user.id) return r.reply(`You can't refer yourself!`);

                    const exists = await doesUserExist(rid);

                    if (exists) {
                        r.reply({ content: `⚠️ You can use this command only on 1 player ⚠️\nAre you sure you want to be referred by <@${rid}>?\n\n**When to use?**\n- This feature is meant to be used by friends who invited each other, do not proceed if <@${rid}> has not invited you to the game, or otherwise helped or motivated you to play, as that is against our [Terms of Service](<https://github.com/Apollo24K/Camelot-Public-Repo/blob/main/ToS>).\n\n**What happens?**\n- If you continue <@${rid}> will receive rewards including loot, a chance at a rare character and **__20% of all gems <:genesis_gems:1157331914861052034> purchased by you in the future__** (note that this won't affect the amount of gems <:genesis_gems:1157331914861052034> you receive).`, components: [OfferRow], fetchReply: true, ephemeral: true }).then(async (ms) => {
                            const pageCollector = ms.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

                            pageCollector.on('collect', async (c) => {
                                if (c.customId === "cancel") return r.editReply({ content: `Action cancelled`, components: [] });

                                // await query(`UPDATE users SET referred_by = ${rid} WHERE id = ${interaction.user.id} AND referred_by IS null`);

                                // Update users table
                                await updateUsers(interaction.user.id, {
                                    referred_by: { type: "set", value: rid },
                                });

                                r.editReply({ content: `Thank you!`, components: [] });
                            });
                        });
                    } else {
                        r.reply({ content: `Invalid Referral ID`, ephemeral: true });
                    };
                }).catch(() => {
                    collector.stop();
                });

            });
        };

        // const referred = await query(`SELECT users.id, users.name, users.xp, (strftime('%s', datetime('now')) - strftime('%s', users.created)) / 86400 AS age, LENGTH(dungeon.floors) - LENGTH(REPLACE(dungeon.floors,',','')) +1 as floor FROM users JOIN dungeon ON users.id = dungeon.id WHERE referred_by = ${user.id}`);

        const referred = await getReferredUsers(user.id);

        referred.forEach((e) => e.level = userLevel(e.xp));

        const passed = referred.filter((e) => e.level >= 25 && e.floor >= 30);
        const pending = referred.filter((e) => e.level < 25 || e.floor < 30);

        // const indirect_ref = await query(`SELECT users.id, users.name, users.xp, (strftime('%s', datetime('now')) - strftime('%s', users.created)) / 86400 AS age, LENGTH(dungeon.floors) - LENGTH(REPLACE(dungeon.floors,',','')) +1 as floor FROM users JOIN dungeon ON users.id = dungeon.id WHERE referred_by IN (${referred.map((e) => e.id).join(", ")})`);
        const indirect_ref = await getIndirectReferredUsers(user.id);
        indirect_ref.forEach((e) => e.level = userLevel(e.xp));

        // const weekly_lb = await query(`SELECT referred_by, COUNT(*) as referral_count FROM users WHERE referred_by IS NOT NULL AND (strftime('%s', datetime('now')) - strftime('%s', created)) / 86400 < 7 GROUP BY referred_by ORDER BY referral_count DESC`);
        // const monthly_lb = await query(`SELECT referred_by, COUNT(*) as referral_count FROM users WHERE referred_by IS NOT NULL AND (strftime('%s', datetime('now')) - strftime('%s', created)) / 86400 < 30 GROUP BY referred_by ORDER BY referral_count DESC`);
        // const alltime_lb = await query(`SELECT referred_by, COUNT(*) as referral_count FROM users WHERE referred_by IS NOT NULL GROUP BY referred_by ORDER BY referral_count DESC`);

        const weekly_lb = await getReferralLeaderboard("weekly");
        const monthly_lb = await getReferralLeaderboard("monthly");
        const alltime_lb = await getReferralLeaderboard("alltime");

        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setDescription(`### Referral Stats\n- You have referred **${passed.length}** ${passed.length === 1 ? "player" : "players"}, and those have referred **${indirect_ref.filter((e) => e.level >= 25 && e.floor >= 30).length}** ${indirect_ref.filter((e) => e.level >= 25 && e.floor >= 30).length === 1 ? "player" : "players"} in total. You have **${pending.length}** pending ${pending.length === 1 ? "referral" : "referrals"}.\n- Your all time rank is **#${alltime_lb.findIndex(e => e.referred_by === user.id) + 1 || alltime_lb.length + 1}**, while your monthly rank is **#${monthly_lb.findIndex(e => e.referred_by === user.id) + 1 || monthly_lb.length + 1}** and weekly rank is **#${weekly_lb.findIndex(e => e.referred_by === user.id) + 1 || weekly_lb.length + 1}**.\n- You have earned **${stats.referred_gems}** <:genesis_gems:1034179687720681492> from referred players.\n### Rewards\n- Per referral: **30k**<:coins:1030580480782893197>, **30**<:genesis_gems:1034179687720681492>, **1x**<:ss_ticket:927503239396622336>, **2x**<:s_ticket:927642487705722890>, **1x**<:royal_chest:1069301128711376976>\n- Every 5th referral: **1x** <:deluxe_chest:1069301259603026061>\n- 5th & 20th referrals: **1x Raphael** <a:EXTRA:1138530846144462968>`)
            .setFooter({ text: `Referral ID: ${user.id}`, iconURL: user.displayAvatarURL({ size: 512 }) });
        if (referred.length === 0) return interaction.reply({ embeds: [Embed] });
        return interaction.reply({ embeds: [Embed], components: [getListRow(user.id !== interaction.user.id ? true : (stats.referrals_claimed >= passed.length))] }).then(async (msg) => {
            const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000 });

            collector.on('collect', async (r) => {
                if (r.customId === "claim") {
                    if (user.id === interaction.user.id) {
                        const stats = await getUserSchema(interaction.user.id);
                        if (!stats) return;

                        // const referred = await query(`SELECT users.id, users.name, users.xp, (strftime('%s', datetime('now')) - strftime('%s', users.created)) / 86400 AS age, LENGTH(dungeon.floors) - LENGTH(REPLACE(dungeon.floors,',','')) +1 as floor FROM users JOIN dungeon ON users.id = dungeon.id WHERE referred_by = ${interaction.user.id}`);
                        const referred = await getReferredUsers(interaction.user.id);
                        referred.forEach((e) => e.level = userLevel(e.xp));
                        const passed = referred.filter((e) => e.level >= 25 && e.floor >= 30);
                        if (passed.length <= stats.referrals_claimed) return interaction.followUp({ content: "You've already claimed your rewards.", ephemeral: true });;

                        const amount = passed.length - stats.referrals_claimed;
                        const deluxe = (((Math.floor(passed.length / 5) * 5) - (Math.ceil((stats.referrals_claimed + 1) / 5) * 5)) / 5) + 1;
                        const raphael = ((passed.length < 5) || (passed.length < 20 && stats.referrals_claimed >= 5) || (stats.referrals_claimed >= 20)) ? 0 : (((passed.length < 20 && stats.referrals_claimed < 5) || (passed.length >= 20 && stats.referrals_claimed >= 5 && stats.referrals_claimed < 20)) ? 1 : 2);

                        const mail = { "type": `2,4${raphael ? ",6" : ""},8,9`, "rewards": `coins|${30000 * amount},gems|${30 * amount}${raphael ? ",char|17583" : ""}${deluxe ? `,item|458|${deluxe}` : ""},item|457|${amount},ss ticket|${amount},s ticket|${2 * amount}`, "message": "Referral Rewards", "date": Date.now() };
                        stats.mailbox.push(mail);

                        // Update users table
                        await updateUsers(interaction.user.id, {
                            referrals_claimed: { type: "set", value: passed.length },
                            mailbox: { type: "set", value: stats.mailbox },
                        });

                        interaction.followUp({ content: "Rewards were sent to your mailbox! Open them from </profile:1010583712527810641>", ephemeral: true });
                    };
                    return;
                };

                // Else get List of Players
                const elementsPerPage = 20;
                const pagesTotal = Math.ceil(referred.length / elementsPerPage);
                let currPage = 1;

                referred.sort((a, b) => (b.level === a.level) ? (b.floor - a.floor) : (b.level - a.level));

                let content = showPage(currPage, referred, elementsPerPage).map((e) => `- <@${e.id}> - Level **${e.level}**, Floor **${e.floor}** - Started **${e.age}** ${e.age === 1 ? "day" : "days"} ago`).join("\n");

                if (pagesTotal === 1) return r.reply({ content, ephemeral: true });
                r.reply({ content, components: [PageRow], ephemeral: true }).then(async (ms) => {
                    const pageCollector = ms.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120000 });

                    pageCollector.on('collect', (c) => {
                        if (c.customId === "prev") {
                            if (currPage > 1) currPage--;
                            else currPage = pagesTotal;
                        } else {
                            if (currPage < pagesTotal) currPage++;
                            else currPage = 1;
                        };

                        content = showPage(currPage, referred, elementsPerPage).map((e) => `- <@${e.id}> - Level **${e.level}**, Floor **${e.floor}** - Started **${e.age}** ${e.age === 1 ? "day" : "days"} ago`).join("\n");
                        r.editReply({ content });
                    });

                });
            });

        });

    },
};

export default exportCommand;
