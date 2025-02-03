import fs from 'fs';
import csvWriter from 'fast-csv';
import math from 'mathjs';
import { ComponentType, ActionRowBuilder, ButtonBuilder, EmbedBuilder, AttachmentBuilder, ButtonStyle } from "discord.js";
import config from '../config.json';
import { characters } from "../Modules/chars";
import { showPage, search } from "../Modules/functions";
import { PageRow } from "../Modules/components";
import { PassThrough } from 'stream';
import { SlashCommand } from '../types';
import { deleteFAQ, getAllTrades, getFAQSchemaByName, getMinimalUserSchema, getMinimalUserSchemas, getPastStampedes, getResponseTimes, getTradesOfUser, getUsersByName, getUserSchema, insertNewFAQ, updateFAQBody, updateUsers } from '../Modules/queries';

const OfferRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('ignore_defer-confirm')
            .setEmoji('<:check_icon:683671903143067743>')
            .setLabel('confirm')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('ignore_defer-cancel')
            .setEmoji('<:stop_icon:683671917353369600>')
            .setLabel('cancel')
            .setStyle(ButtonStyle.Danger),
    );

const exportCommand: SlashCommand = {
    name: 'mod',
    async execute({ interaction }) {

        const moderators = JSON.parse(fs.readFileSync('Storage/moderators.json', 'utf8'));

        const action = interaction.options.getString('action', true);
        const user = interaction.options.getUser('user');
        const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

        const args = action.trim().split(/ +/g);
        const cmd = args.shift()?.toLowerCase();

        // Return if not mod
        if (!(interaction.user.id in moderators)) return interaction.reply({ content: "You're not allowed to use this command", ephemeral });

        // List all actions
        if (cmd === "list" || cmd === "help") {
            return interaction.reply({
                content: "Simply use the below commands without passing any values to view details on how they work\n" +
                    ">>> " +
                    "`list` or `help`\n" +
                    "`get`\n" +
                    "`faq`\n" +
                    "`trades`\n" +
                    "`export`\n" +
                    "`response`\n" +
                    "`referrals`\n" +
                    "`participation` (stampede)\n" +
                    "`add char`\n" +
                    "`remove char`\n"
                , ephemeral
            });
        };

        if (cmd === "get") {
            if (!args[0]) return interaction.reply({ content: "Usage: `/mod get <option>`\n\n**Options**\n`/mod get id <name>`: Search for a players ID\n`/mod get name <id>`: Search for a players name\n`/mod get referrer user:<User>`: See who referred a user\n", ephemeral });


            if (args[0] === "id") {
                const name = args.slice(1).join(" ").toLowerCase();
                if (!name) return interaction.reply({ content: "No match found", ephemeral });

                const matches = await getUsersByName(name);
                if (matches.length) return interaction.reply({ content: `Matches for "${name}":\n${matches.slice(0, 20).map((e) => `${e.name}: ${e.id}`).join("\n")}`, ephemeral });
            } else if (args[0] === "name") {
                const stats = await getMinimalUserSchema(args[1]);
                if (stats?.name) return interaction.reply({ content: stats.name, ephemeral });
            } else if (args[0] === "referrer") {
                if (!user) return interaction.reply({ content: "Usage: `/mod get referrer user:<User>`", ephemeral });

                const referrer = await getUserSchema(user.id);
                if (referrer?.referred_by) return interaction.reply({ content: `${user.toString()} was referred by <@${referrer.referred_by}> (id: ${referrer.referred_by})`, ephemeral });
                else return interaction.reply({ content: `${user.toString()} was not referred by anyone`, ephemeral });
            };

            return interaction.reply({ content: "No match found", ephemeral });
        };

        if (cmd === "faq") {
            if (!args[0]) return interaction.reply({ content: "Usage: `/mod faq <name> <text>`\n\n**Options**\n`name`: Keyword to find the faq with. Cannot include whitespace.\n`text`: Raw text to show when using `/faq <name>`. Leave empty to delete an existing one.", ephemeral });

            const name = args[0].toLowerCase();
            const body = args.slice(1).join(" ");

            if (name.length > 20) return interaction.reply({ content: `FAQ name cannot be longer than 20 characters (current length: **${name.length}**)`, ephemeral });
            if (body.length > 2000) return interaction.reply({ content: `FAQ body cannot be longer than 2000 characters (current length: **${body.length}**)`, ephemeral });

            const faq = await getFAQSchemaByName(name);

            if (faq) {
                if (interaction.user.id !== faq.id && interaction.user.id !== "489490486734880774") return interaction.reply({ content: `An FAQ for \`${name}\` has already been created by <@${faq.id}>\nPlease use another name, or ask them or Apollo to edit this one.`, ephemeral });
                if (body) {
                    await updateFAQBody(name, body);
                    return interaction.reply({ content: `Successfully edited FAQ with name \`${name}\``, ephemeral });
                } else {
                    return interaction.reply({ content: `Are you sure you want to delete FAQ with name \`${name}\`?`, components: [OfferRow], ephemeral }).then(msg => {
                        const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 45000 });

                        collector.on('collect', async r => {
                            collector.stop();
                            if (r.customId === "ignore_defer-cancel") return r.reply({ content: "Action cancelled", ephemeral });

                            await deleteFAQ(name);
                            return r.reply({ content: `Successfully deleted FAQ with name \`${name}\``, ephemeral });
                        });
                    });
                };
            } else {
                if (!body) return interaction.reply({ content: "Usage: `/mod faq <name> <text>`\n\n**Options**\n`name`: Keyword to find the faq with. Cannot include whitespace.\n`text`: Raw text to show when using `/faq <name>`. Leave empty to delete an existing one.", ephemeral });
                await insertNewFAQ(interaction.user.id, name, body);
                return interaction.reply({ content: `Successfully added an FAQ for \`${name}\``, ephemeral });
            };
        };

        if (cmd === "trades") {
            if (!user?.id) return interaction.reply({ content: "Usage: `/mod trades user:`\n\n**Options**\n`--`: --", ephemeral });

            const trades = await getTradesOfUser(user.id);

            const sent = trades.filter((e) => e.id === user.id);
            const received = trades.filter((e) => e.receiver === user.id);
            if ((sent.length + received.length) === 0) return interaction.reply({ content: `${user.username} has no trades`, ephemeral });

            const uids = [...new Set([...sent.map((e) => e.receiver), ...received.map((e) => e.id)])];
            const tradedUsers = await getMinimalUserSchemas(uids);
            const usernames = tradedUsers.reduce<Record<string, string>>((obj, u) => { obj[u.id] = u.name; return obj; }, {});

            // Setup Pages
            const elementsPerPage = 4;
            const pagesTotal = Math.ceil(uids.length / elementsPerPage);
            let currPage = 1;

            // Filter items to show on the current page
            let showUsers = showPage(currPage, uids, elementsPerPage);

            function desc(showUsers: string[]) {
                return `Trade Logs of ${usernames[user?.id ?? ""]}\n\n` +
                    showUsers.map((u) => `- ${usernames[u]}\n - Sent ${sent.reduce((acc, e) => acc + ((e.type === "coins" && e.receiver === u) ? e.sent : 0), 0)}<:coins:1030580480782893197>, ${sent.reduce((acc, e) => acc + ((e.type === "char" && e.receiver === u && characters[e.sent].rarity === "SS") ? 1 : 0), 0)} <:SSTier:869316489931546644>, ${sent.reduce((acc, e) => acc + ((e.type === "char" && e.receiver === u && characters[e.sent].rarity === "EX") ? 1 : 0), 0)} <a:EXTRA:1138530846144462968>\n - Received ${received.reduce((acc, e) => acc + ((e.type === "coins" && e.id === u) ? e.sent : 0), 0)}<:coins:1030580480782893197>, ${received.reduce((acc, e) => acc + ((e.type === "char" && e.id === u && characters[e.sent].rarity === "SS") ? 1 : 0), 0)} <:SSTier:869316489931546644>, ${received.reduce((acc, e) => acc + ((e.type === "char" && e.id === u && characters[e.sent].rarity === "EX") ? 1 : 0), 0)} <a:EXTRA:1138530846144462968>`).join("\n");
            };

            if (pagesTotal === 1) return interaction.reply({ content: desc(showUsers), ephemeral });
            return interaction.reply({ content: desc(showUsers), components: [PageRow], ephemeral }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 180000 });

                collector.on('collect', async r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    showUsers = showPage(currPage, uids, elementsPerPage);

                    // Embed.setDescription("Use `/item info <name or ID>` for more information" + desc).setFooter({text: `Page ${currPage}/${pagesTotal}`});
                    interaction.editReply({ content: desc(showUsers) });
                });
            });
        };

        if (cmd === "export") {
            if (!args[0]) return interaction.reply({ content: "Usage: `/mod export <option> user?:<User>`\n\n**Options**\n`trades`: Export all trades to CSV. Optionally specify a user to only export their trades\n\n**Example**\n`/mod export trades user:@username`", ephemeral });

            if (args[0] === "trades") {
                interaction.reply({ content: "Exporting trades...", ephemeral });

                // If user is provided, only get trades involving that user
                const trades = user
                    ? await getTradesOfUser(user.id)
                    : await getAllTrades();

                if (trades.length === 0) return interaction.reply({
                    content: user
                        ? `No trades found involving ${user.username}`
                        : "No trades available to export",
                    ephemeral
                });

                const data = trades.map(trade => ({
                    sender: trade.id,
                    receiver: trade.receiver,
                    coins: trade.type === "coins" ? trade.sent : 0,
                    charid: trade.type === "char" ? trade.sent : 0,
                    char: trade.type === "char" ? characters[trade.sent].name : "",
                    timestamp: trade.sent_at
                }));

                const csvStream = csvWriter.write(data, { headers: true, delimiter: ';' });
                const passThrough = new PassThrough();
                csvStream.pipe(passThrough);

                const attachment = new AttachmentBuilder(passThrough, {
                    name: user ? `trades_${user.username}.csv` : 'trades.csv'
                });
                setTimeout(() => {
                    interaction.editReply({ content: user ? `Here are the exported trades for ${user.username}:` : "Here are the exported trades:", files: [attachment] });
                }, 5000);
            };
        };

        // Response Time
        async function response(flags: string[] = []): Promise<string> {
            if (!user) return "No user provided";

            const timestamps = await getResponseTimes(user.id, { stampede: flags.includes("stampede") });
            let resp = timestamps.map((e, i) => timestamps[i + 1].getTime() - e.getTime()).slice(0, -2);
            if (flags.some((e) => e.startsWith("range:"))) {
                const [, start, end] = (flags.find((e) => e.startsWith("range:")) ?? "range:0").split(":");
                resp = resp.slice(parseInt(start) || 0, parseInt(end) || undefined);
            };
            if (flags.some((e) => e.startsWith("interval:"))) {
                let [, intervalString, averaged] = (flags.find((e) => e.startsWith("interval:")) ?? "interval:1").split(":");
                let interval = parseInt(intervalString) || 1;
                if (interval < 1) interval = 1;
                const summed = [];
                for (let i = 0; i < resp.length; i += interval) {
                    const sum = resp.slice(i, i + interval).reduce((acc, num) => acc + num, 0);
                    if (averaged) summed.push(Math.round(sum / interval));
                    else summed.push(sum);
                };
                resp = summed;
            };
            const cleaned = resp.filter((e) => e < 120 * 1000);
            if (cleaned.length === 0) return "not enough data";
            const rounded = resp.map((e) => Math.round(e / 1000));
            const diff = -(math.mean(...cleaned.slice(-100)));

            if (flags.includes("graph")) {
                const distribution: Record<number, number> = {};
                const ndiff = -(math.mean(resp.filter((e) => e < 20 * 1000).slice(-30000)));
                resp.filter((e) => e < 20 * 1000).map((e) => Math.round((e + ndiff) / 1000)).forEach((e) => distribution[e] = distribution[e] + 1 || 1);

                const { spawn } = require('child_process');
                const pyVersion = config.token === config.camelot ? 'python3' : 'python'; // Ubuntu : Windows
                const pythonProcess = spawn(pyVersion, ["./Python/graph.py", user.username]);

                // Pass data to the Python script via stdin
                pythonProcess.stdin.write(JSON.stringify(distribution));
                pythonProcess.stdin.end();

                return new Promise((resolve, reject) => {
                    pythonProcess.stdout.on('data', (data: any) => {
                        const url = data.toString('utf8') || "failed to load image";
                        resolve(url);
                    });
                    pythonProcess.stdout.on('error', () => {
                        reject("failed to load image");
                    });
                });
            } else {
                let minVar = 1 / 0, idx = 0;
                for (let i = 0; i < cleaned.length - 100; i += 10) {
                    if (math.variance(cleaned.slice(i, i + 100)) as any < minVar) {
                        minVar = math.variance(cleaned.slice(i, i + 100)) as any;
                        idx = i;
                    };
                };
                let risky = minVar === 1 / 0 ? "" : `\n\n**Highest Risk** (std: ${Math.round(Math.sqrt(minVar) / 10) / 100}s, var: ${Math.round(minVar / 10000) / 100}s²):\n> ` + cleaned.slice(idx, idx + 100).map((e) => Math.round(e / 1000)).join(", ").slice(-(400));

                // Longest seesion
                const sessions = [-rounded[0]];
                const maxBreak = parseInt((flags.find((e) => e.startsWith("session:")) ?? "session:300").split(":")[1]) || 300;
                for (const n of rounded) {
                    if (n < maxBreak) sessions[sessions.length - 1] += n;
                    else sessions.push(0);
                };

                // Return txt
                const txtFlag = flags.find((e) => e.startsWith("txt"));
                if (txtFlag) {
                    const param = txtFlag.split(":")[1];
                    if (!param) return rounded.join(",");
                    if (param === "raw") return resp.join(",");
                    if (param === "cleaned") return cleaned.join(",");
                    if (param === "sessions") return sessions.join(",");
                    if (param === "timestamps") return timestamps.map((e) => e.getTime()).join(",");
                };

                const s = `**user**: ${user.username} | ${user.id}\n**sample size**: ${cleaned.length} | ${cleaned.slice(-100).length}\n**mean**: ${Math.round(math.mean(cleaned) / 10) / 100}s | ${Math.round(math.mean(cleaned.slice(-100)) / 10) / 100}s\n**median**: ${Math.round(math.median(cleaned) / 10) / 100}s | ${Math.round(math.median(cleaned.slice(-100)) / 10) / 100}s\n**mode**: ${math.mode(rounded)}s | ${math.mode(rounded.slice(-100))}s\n**std**: ${Math.round(math.std(cleaned) as any / 10) / 100}s | ${Math.round(math.std(cleaned.slice(-100)) as any / 10) / 100}s\n**var**: ${Math.round(math.variance(cleaned) as any / 10000) / 100}s² | ${Math.round(math.variance(cleaned.slice(-100)) as any / 10000) / 100}s²\n**Longest session**: ${Math.floor((Math.max(...sessions) / (60 * 60)) * 100) / 100}h\n\n**Recent Activity**:\n> `;
                return s + rounded.join(", ").slice(-(1400 - risky.length)) + `\n\n**Normalized**:\n> ` + resp.slice(-100).map((e) => Math.round((e + diff) / 1000)).join(", ").slice(-(600 - 20 - s.length)) + risky;
                // return interaction.reply({content: s + rounded.join(", ").slice(-(1400-risky.length)) + `\n\n**Normalized**:\n> ` + resp.slice(-100).map((e) => Math.round((e+diff)/1000)).join(", ").slice(-(600-20-s.length)) + risky, ephemeral});
            };
        };
        if (cmd === "r" || cmd === "response" || cmd === "s_response") {
            const flags = args.filter((s) => s.startsWith("--")).map((s) => s.slice(2));

            if (!user && !flags.includes("rank")) return interaction.reply({ content: "Usage: `/mod response --[flag] user?:`\n\n**Flags**\n`graph`: Draw a graph\n`rank`: Rank users by std\n`range:<num1>:<num2>`: Slice the sample from `num1` to `num2` (optional)\n`interval:<repeat>`: Group repeated runs together to simplify patterns (usage: `interval:2`, `ìnterval:5:averaged`)\n`txt:<param>`: Output a txt file with the specified parameters (usage: `txt`, `txt:raw`, `txt:cleaned`, `txt:sessions`, `txt:timestamps`)", ephemeral });

            if (flags.includes("rank")) {
                return interaction.reply({ content: "Command temporarily disabled", ephemeral });

                // interaction.reply({ content: "loading...", ephemeral });

                // let results = await query(`SELECT id, ${flags.includes("stampede") ? "s_responsetime" : "responsetime"} as rtime FROM dungeon`);

                // results = results.filter((e) => e.rtime);

                // const final: { id: string, var: number, idx: number; }[] = [];
                // for (const res of results) {
                //     const timestamps = res.rtime.split(",").map((e) => parseInt(e));
                //     const resp = timestamps.map((e, i) => timestamps[i + 1] - e).slice(0, -2);
                //     let cleaned = resp.filter((e) => e < 60 * 60 * 1000);
                //     if (cleaned.length < 100) continue;

                //     let minVar = 1 / 0, idx = -1;
                //     for (let i = 0; i < cleaned.length - 100; i += 10) {
                //         if (math.variance(cleaned.slice(i, i + 100)) < minVar) {
                //             minVar = math.variance(cleaned.slice(i, i + 100));
                //             idx = i;
                //         };
                //     };
                //     final.push({ id: res.id, var: minVar, idx });
                // };
                // setTimeout(() => {
                //     interaction.editReply({ content: final.sort((a, b) => a.var - b.var).slice(0, 20).map((e) => `${e.id} ➜ std: ${Math.round(Math.sqrt(e.var) / 10) / 100}s, var: ${Math.round(e.var / 10000) / 100}s²`).join("\n"), ephemeral });
                // }, 5000);
            } else {
                const content = await response(flags);
                if (!content) return interaction.reply({ content: "An error occured: No data available", ephemeral });

                if (!flags.find((e) => e.startsWith("txt"))) return interaction.reply({ content, ephemeral });

                const attachment = new AttachmentBuilder(Buffer.from(content, 'utf-8'), { name: 'response.txt' });
                return interaction.reply({ files: [attachment], ephemeral });
            };
        };


        // Referrals
        if (cmd === "referrals") {
            return interaction.reply({ content: "Command temporarily disabled", ephemeral });

            // if (!args[0]) return interaction.reply({ content: "Usage: `/mod referrals <option>`\n\n**Options**\n`rank`: Rank users by the number of users they have referred\n\n**Example**\n`/mod referrals rank`", ephemeral });

            // if (args[0] === "rank") {

            //     const results = await query(`SELECT referred_by, COUNT(*) as count
            //             FROM users
            //             WHERE referred_by IS NOT NULL
            //             GROUP BY referred_by
            //             HAVING count > 5
            //             ORDER BY count DESC`
            //     );

            //     if (results.length === 0) return interaction.reply({ content: "No referral data available", ephemeral });

            //     const elementsPerPage = 15;
            //     const pagesTotal = Math.ceil(results.length / elementsPerPage);
            //     let currPage = 1;

            //     const generateEmbed = (page) => {
            //         const start = (page - 1) * elementsPerPage;
            //         const end = start + elementsPerPage;
            //         const leaderboard = results.slice(start, end).map((row, index) => `${start + index + 1}. <@${row.referred_by}>: **${row.count}** referrals`).join("\n");

            //         return new EmbedBuilder()
            //             .setColor(0xbbffff)
            //             .setTitle('Top Referrers')
            //             .setDescription(leaderboard)
            //             .setFooter({ text: `Page ${page} of ${pagesTotal}` });
            //     };

            //     const Embed = generateEmbed(currPage);

            //     interaction.reply({ embeds: [Embed], components: [PageRow], ephemeral }).then(msg => {
            //         const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 180000 });

            //         collector.on('collect', i => {
            //             if (i.user.id !== interaction.user.id) return;

            //             if (i.customId === 'prev') {
            //                 currPage = currPage > 1 ? currPage - 1 : pagesTotal;
            //             } else if (i.customId === 'next') {
            //                 currPage = currPage < pagesTotal ? currPage + 1 : 1;
            //             };

            //             interaction.editReply({ embeds: [generateEmbed(currPage)] });
            //         });

            //         collector.on('end', () => {
            //             interaction.editReply({ components: [] });
            //         });
            //     });
            // };
        };

        // Stampede participation
        if (cmd === "participation") {
            if (!user || user.bot || (args[0] !== undefined && (isNaN(args[0] as any) || (args[0] as any) < 1))) return interaction.reply({ content: `Retrieve stampede participation points and damage\n\n**Usage**: \`/mod participation <past:number> user:\`\n\n**Options**\n\`past\`: Retrieve older stampede participations. 1 is the current stampede, 2 the previous one, 3 the one before that etc. Leaving it empty will default to 1`, ephemeral });
            const past = parseInt(args[0]) || 1;

            const stampedes = await getPastStampedes(past);
            if (past > stampedes.length) return interaction.reply({ content: `There are no older logs`, ephemeral });
            const participation = stampedes[past - 1].participation; // [0: damage, 1: rounds played]

            const damage = Array.isArray(participation[user.id]) ? participation[user.id]?.[0] : (participation[user.id] as any) ?? 0;
            const global = Object.values(participation).reduce((acc, cur) => acc + (Array.isArray(cur) ? cur[0] : cur), 0);

            return interaction.reply({ content: `Stampede #${stampedes[past - 1].rowid} - Participation of ${user.username}\nDamage: ${damage}\nParticipation: ${participation[user.id]?.[1] ?? 0}\nGlobal share: ${Math.floor(10000 * damage / global) / 100}% (${damage}/${global})`, ephemeral });
        };

        // Add char
        if (action.startsWith("add char")) {
            if (!user) return interaction.reply({ content: `Error: missing user object\n\nUsage: \`/mod add char <name> user:@user\`\n\n**Options**\n\`name\`: Name or ID of the character to be added`, ephemeral });

            args.shift();
            const char = search(args.join(" "), [0], interaction, true);
            if (!char) return interaction.reply({ content: `Error: Couldn't find character "${args.join(" ")}"\n\nUsage: \`/mod add char <name> user:@user\`\n\n**Options**\n\`name\`: Name or ID of the character to be added`, ephemeral });

            // Update users table
            await updateUsers(user.id, {
                chars: { type: "append", value: [char.id] },
            });

            // Mod Log
            const chnl = interaction.client.channels.cache.find(channel => channel.id === "1239976849866752041");
            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setDescription(`${interaction.user.tag} added **${char.rarity}** **${char.name}** to **${user.tag}**\n${interaction.user.toString()} ➜ ${interaction.user.id}\n${user.toString()} ➜ ${user.id}`);
            if (chnl?.isSendable()) chnl.send({ embeds: [Embed] });

            return interaction.reply({ content: `Action Successful: Added **${char.name}** to ${user.toString()}`, ephemeral });
        };

        // Remove char
        if (action.startsWith("remove char")) {
            if (!user) return interaction.reply({ content: `Error: missing user object\n\nUsage: \`/mod remove char <name> user:@user\`\n\n**Options**\n\`name\`: Name or ID of the character to be removed`, ephemeral });

            args.shift();
            const char = search(args.join(" "), [0], interaction, true);
            if (!char) return interaction.reply({ content: `Error: Couldn't find character "${args.join(" ")}"\n\nUsage: \`/mod remove char <name> user:@user\`\n\n**Options**\n\`name\`: Name or ID of the character to be removed`, ephemeral });

            const inv = await getUserSchema(user.id);
            if (!inv || !inv.chars.includes(char.id)) return interaction.reply({ content: `**ERROR**: ${user.toString()} does not have a copy of **${char.name}**`, ephemeral });

            // Update users table
            await updateUsers(user.id, {
                chars: { type: "remove", value: [char.id] },
            });

            // Mod Log
            const chnl = interaction.client.channels.cache.find(channel => channel.id === "1239976849866752041");
            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setDescription(`${interaction.user.tag} removed **${char.rarity}** **${char.name}** from **${user.tag}**\n${interaction.user.toString()} ➜ ${interaction.user.id}\n${user.toString()} ➜ ${user.id}`);
            if (chnl?.isSendable()) chnl.send({ embeds: [Embed] });

            return interaction.reply({ content: `Action Successful: Removed **${char.name}** from ${user.toString()}`, ephemeral });
        };

    },
};

export default exportCommand;
