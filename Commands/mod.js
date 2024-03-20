const fs = require('fs');
const config = require('../config.json');
const { ComponentType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");
const { showPage } = require("../Modules/functions.js");
const { PageRow } = require("../Modules/components.js");
const math = require('mathjs');

const OfferRow = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('ignore_defer-confirm')
            .setEmoji('<:check_icon:683671903143067743>')
            .setLabel('confirm')
            .setStyle('Success'),
        new ButtonBuilder()
            .setCustomId('ignore_defer-cancel')
            .setEmoji('<:stop_icon:683671917353369600>')
            .setLabel('cancel')
            .setStyle('Danger'),
    );

module.exports = {
    name: 'mod',
    description: 'take mod actions',
    execute(interaction) {

        const moderators = JSON.parse(fs.readFileSync('Storage/moderators.json', 'utf8'));

        const user = interaction.options.getUser('user');
        const action = interaction.options.getString('action');
        const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

        const args = action.trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();

        // Return if not mod
        if (!(interaction.user.id in moderators)) return interaction.reply({ content: "You're not allowed to use this command", ephemeral });

        // List all actions
        if (cmd === "list") {
            return interaction.reply({
                content: ">>> " +
                    "`list`\n" +
                    "`get`\n" +
                    "`faq`\n" +
                    "`trades`\n" +
                    "`response`, `response graph`\n" +
                    "`participation` (stampede)\n"
                , ephemeral
            });
        };

        if (cmd === "get") {
            if (!args[0]) return interaction.reply({ content: "Usage: `/mod get <option>`\n\n**Options**\n`/mod get id <name>`: Search for a players ID\n`/mod get name <id>`: Search for a players name", ephemeral });

            db.serialize(async () => {
                if (args[0] === "id") {
                    let stats = await query(`SELECT id, name FROM users`);

                    const name = args.slice(1).join(" ").toLowerCase();
                    if (!name) return interaction.reply({ content: "No match found", ephemeral });

                    let matches = [];
                    matches = matches.concat(stats.filter((e) => e.name.toLowerCase() === name));
                    stats = stats.filter((e) => e.name.toLowerCase() !== name);
                    matches = matches.concat(stats.filter((e) => e.name.toLowerCase().startsWith(name)));
                    stats = stats.filter((e) => !e.name.toLowerCase().startsWith(name));
                    matches = matches.concat(stats.filter((e) => e.name.toLowerCase().includes(name)));

                    if (matches.length) return interaction.reply({ content: `Matches for "${name}":\n${matches.slice(0, 20).map((e) => `${e.name}: ${e.id}`).join("\n")}`, ephemeral });
                } else if (args[0] === "name") {
                    const { 0: stats } = await query(`SELECT name FROM users WHERE id = '${args[1]}'`);
                    if (stats?.name) return interaction.reply({ content: stats.name, ephemeral });
                };

                return interaction.reply({ content: "No match found", ephemeral });
            });
        };

        if (cmd === "faq") {
            if (!args[0]) return interaction.reply({ content: "Usage: `/mod faq <name> <text>`\n\n**Options**\n`name`: Keyword to find the faq with. Cannot include whitespace.\n`text`: Raw text to show when using `/faq <name>`. Leave empty to delete an existing one.", ephemeral });

            const name = args[0].replace(/'/g, "''").toLowerCase();
            const body = args.slice(1).join(" ").replace(/'/g, "''");

            if (name.length > 20) return interaction.reply({ content: `FAQ name cannot be longer than 20 characters (current length: **${name.length}**)`, ephemeral });
            if (body.length > 2000) return interaction.reply({ content: `FAQ body cannot be longer than 2000 characters (current length: **${body.length}**)`, ephemeral });

            db.serialize(async () => {
                // Check if keyword existst
                const { 0: faq } = await query(`SELECT * FROM faq WHERE name = "${name}"`);

                if (faq) {
                    if (interaction.user.id !== faq.id && interaction.user.id !== "489490486734880774") return interaction.reply({ content: `An FAQ for \`${name}\` has already been created by <@${faq.id}>\nPlease use another name, or ask them or Apollo to edit this one.`, ephemeral });
                    if (body) {
                        await query(`UPDATE faq SET body = '${body}' WHERE name = "${name}"`);
                        return interaction.reply({ content: `Successfully edited FAQ with name \`${name}\``, ephemeral });
                    } else {
                        return interaction.reply({ content: `Are you sure you want to delete FAQ with name \`${name}\`?`, components: [OfferRow], fetchReply: true, ephemeral }).then(msg => {
                            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 45000 });

                            collector.on('collect', async r => {
                                collector.stop();
                                if (r.customId === "ignore_defer-cancel") return r.reply({ content: "Action cancelled", ephemeral });

                                await query(`DELETE FROM faq WHERE name = "${name}"`);
                                return r.reply({ content: `Successfully deleted FAQ with name \`${name}\``, ephemeral });
                            });
                        });
                    };
                } else {
                    if (!body) return interaction.reply({ content: "Usage: `/mod faq <name> <text>`\n\n**Options**\n`name`: Keyword to find the faq with. Cannot include whitespace.\n`text`: Raw text to show when using `/faq <name>`. Leave empty to delete an existing one.", ephemeral });
                    await query(`INSERT INTO faq (id, name, body) VALUES ('${interaction.user.id}', '${name}', '${body}')`, 'run');
                    return interaction.reply({ content: `Successfully added an FAQ for \`${name}\``, ephemeral });
                };
            });
        };

        if (cmd === "trades") {
            if (!user?.id) return interaction.reply({ content: "Usage: `/mod trades user:`\n\n**Options**\n`--`: --", ephemeral });

            db.serialize(async () => {
                const sent = await query(`SELECT * FROM trades WHERE id = ${user.id}`);
                const received = await query(`SELECT * FROM trades WHERE receiver = ${user.id}`);

                if ((sent.length + received.length) === 0) return interaction.reply({ content: `${user.username} has no trades`, ephemeral });

                const uids = [...new Set([...sent.map((e) => e.receiver), ...received.map((e) => e.id)])];
                let usernames = await query(`SELECT id, name FROM users WHERE id IN (${user.id}, ${uids.join(", ")})`);
                usernames = usernames.reduce((obj, u) => { obj[u.id] = u.name; return obj; }, {});

                // Setup Pages
                const elementsPerPage = 4;
                const pagesTotal = Math.ceil(uids.length / elementsPerPage);
                let currPage = 1;

                // Filter items to show on the current page
                let showUsers = showPage(currPage, uids, elementsPerPage);

                function desc(showUsers) {
                    return `Trade Logs of ${usernames[user.id]}\n\n` +
                        showUsers.map((u) => `- ${usernames[u]}\n - Sent ${sent.reduce((acc, e) => acc + ((e.type === "coins" && e.receiver === u) ? e.sent : 0), 0)}<:coins:1030580480782893197>, ${sent.reduce((acc, e) => acc + ((e.type === "char" && e.receiver === u && characters[e.sent].rarity === "SS") ? 1 : 0), 0)} <:SSTier:869316489931546644>, ${sent.reduce((acc, e) => acc + ((e.type === "char" && e.receiver === u && characters[e.sent].rarity === "EX") ? 1 : 0), 0)} <a:EXTRA:1138530846144462968>\n - Received ${received.reduce((acc, e) => acc + ((e.type === "coins" && e.id === u) ? e.sent : 0), 0)}<:coins:1030580480782893197>, ${received.reduce((acc, e) => acc + ((e.type === "char" && e.id === u && characters[e.sent].rarity === "SS") ? 1 : 0), 0)} <:SSTier:869316489931546644>, ${received.reduce((acc, e) => acc + ((e.type === "char" && e.id === u && characters[e.sent].rarity === "EX") ? 1 : 0), 0)} <a:EXTRA:1138530846144462968>`).join("\n");
                };

                if (pagesTotal === 1) return interaction.reply({ content: desc(showUsers), ephemeral });
                return interaction.reply({ content: desc(showUsers), components: [PageRow], ephemeral, fetchReply: true }).then(msg => {
                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

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
            });
        };

        // Response Time
        async function response(flags = []) {
            const { 0: res } = await query(`SELECT ${flags.includes("stampede") ? "s_responsetime" : "responsetime"} as rtime FROM dungeon WHERE id = '${user.id}'`);
            const timestamps = res.rtime.split(",").map((e) => parseInt(e));
            const resp = timestamps.map((e, i) => timestamps[i + 1] - e).slice(0, -2);
            let cleaned = resp.filter((e) => e < 60 * 1000);
            if (cleaned.length === 0) return "not enough data";
            const rounded = resp.map((e) => Math.round(e / 1000));
            const diff = -(math.mean(...cleaned.slice(-100)));

            if (flags.includes("graph")) {
                const distribution = {};
                const ndiff = -(math.mean(resp.filter((e) => e < 20 * 1000).slice(-30000)));
                resp.filter((e) => e < 20 * 1000).map((e) => Math.round((e + ndiff) / 1000)).forEach((e) => distribution[e] = distribution[e] + 1 || 1);

                const { spawn } = require('child_process');
                const pyVersion = config.token === config.camelot ? 'python3' : 'python'; // Ubuntu : Windows
                const pythonProcess = spawn(pyVersion, ["./Python/graph.py", user.username]);

                // Pass data to the Python script via stdin
                pythonProcess.stdin.write(JSON.stringify(distribution));
                pythonProcess.stdin.end();

                return new Promise((resolve, reject) => {
                    pythonProcess.stdout.on('data', (data) => {
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
                    if (math.variance(cleaned.slice(i, i + 100)) < minVar) {
                        minVar = math.variance(cleaned.slice(i, i + 100));
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

                const s = `**user**: ${user.username} | ${user.id}\n**sample size**: ${cleaned.length} | ${cleaned.slice(-100).length}\n**mean**: ${Math.round(math.mean(cleaned) / 10) / 100}s | ${Math.round(math.mean(cleaned.slice(-100)) / 10) / 100}s\n**median**: ${Math.round(math.median(cleaned) / 10) / 100}s | ${Math.round(math.median(cleaned.slice(-100)) / 10) / 100}s\n**mode**: ${math.mode(rounded)}s | ${math.mode(rounded.slice(-100))}s\n**std**: ${Math.round(math.std(cleaned) / 10) / 100}s | ${Math.round(math.std(cleaned.slice(-100)) / 10) / 100}s\n**var**: ${Math.round(math.variance(cleaned) / 10000) / 100}s² | ${Math.round(math.variance(cleaned.slice(-100)) / 10000) / 100}s²\n**Longest session**: ${Math.floor((Math.max(...sessions) / (60 * 60)) * 100) / 100}h\n\n**Recent Activity**:\n> `;
                return s + rounded.join(", ").slice(-(1400 - risky.length)) + `\n\n**Normalized**:\n> ` + resp.slice(-100).map((e) => Math.round((e + diff) / 1000)).join(", ").slice(-(600 - 20 - s.length)) + risky;
                // return interaction.reply({content: s + rounded.join(", ").slice(-(1400-risky.length)) + `\n\n**Normalized**:\n> ` + resp.slice(-100).map((e) => Math.round((e+diff)/1000)).join(", ").slice(-(600-20-s.length)) + risky, ephemeral});
            };
        };
        if (cmd === "response" || cmd === "s_response") {
            if (!user?.id && args[0] !== "rank") return interaction.reply({ content: "Usage: `/mod response [graph|rank] user?:`\n\n**Options**\n`graph`: Draw a graph\n`rank`: Rank users by std", ephemeral });

            const flags = args.filter((s) => s.startsWith("--")).map((s) => s.slice(2));

            db.serialize(async () => {
                if (args[0] === "rank") {
                    interaction.reply({ content: "loading...", ephemeral });

                    let results = await query(`SELECT id, ${cmd === "response" ? "responsetime" : "s_responsetime"} as rtime FROM dungeon`);
                    results = results.filter((e) => e.rtime);

                    const final = [];
                    for (const res of results) {
                        const timestamps = res.rtime.split(",").map((e) => parseInt(e));
                        const resp = timestamps.map((e, i) => timestamps[i + 1] - e).slice(0, -2);
                        let cleaned = resp.filter((e) => e < 60 * 60 * 1000);
                        if (cleaned.length < 100) continue;

                        let minVar = 1 / 0, idx = -1;
                        for (let i = 0; i < cleaned.length - 100; i += 10) {
                            if (math.variance(cleaned.slice(i, i + 100)) < minVar) {
                                minVar = math.variance(cleaned.slice(i, i + 100));
                                idx = i;
                            };
                        };
                        final.push({ id: res.id, var: minVar, idx });
                    };
                    setTimeout(() => {
                        interaction.editReply({ content: final.sort((a, b) => a.var - b.var).slice(0, 20).map((e) => `${e.id} ➜ std: ${Math.round(Math.sqrt(e.var) / 10) / 100}s, var: ${Math.round(e.var / 10000) / 100}s²`).join("\n"), ephemeral });
                    }, 5000);
                } else {
                    const content = await response(flags);
                    interaction.reply({ content, ephemeral });
                };
            });
        };


        // Stampede participation
        if (cmd === "participation") {
            if (!user || user.bot || (args[0] !== undefined && (isNaN(args[0]) || args[0] < 1))) return interaction.reply({ content: `Retrieve stampede participation points and damage\n\n**Usage**: \`/mod participation <past:number> user:\`\n\n**Options**\n\`past\`: Retrieve older stampede participations. 1 is the current stampede, 2 the previous one, 3 the one before that etc. Leaving it empty will default to 1`, ephemeral });
            const past = parseInt(args[0]) || 1;

            db.serialize(async () => {
                const damages = await query(`SELECT rowid, participation FROM stampedes ORDER BY rowid DESC LIMIT ${past}`);
                if (past > damages.length) return interaction.reply({ content: `There are no older logs`, ephemeral });
                const participation = JSON.parse(damages[past - 1].participation); // [0: damage, 1: rounds played]

                const damage = Array.isArray(participation[user.id]) ? participation[user.id]?.[0] : participation[user.id] ?? 0;
                const global = Object.values(participation).reduce((acc, cur) => acc + (Array.isArray(cur) ? cur[0] : cur), 0);

                return interaction.reply({ content: `Stampede #${damages[past - 1].rowid} - Participation of ${user.username}\nDamage: ${damage}\nParticipation: ${participation[user.id]?.[1] ?? 0}\nGlobal share: ${Math.floor(10000 * damage / global) / 100}% (${damage}/${global})`, ephemeral });
            });
        };

    },
};