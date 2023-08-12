/* eslint-disable no-unused-vars */
var fs = require('fs');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { characters } = require("../Modules/chars.js");
const { db, query } = require("../db_handler.js");
const { classLevelToXP } = require("../Modules/functions.js");
const math = require('mathjs');

function searchGuild(name, guilds) {
    name = name.toLowerCase();
    if (!name) return guilds.sort((a, b) => 0.5 - Math.random());

    const matches = guilds.filter((e) => e.name.toLowerCase() === name);
    guilds = guilds.filter((e) => e.name.toLowerCase() !== name);
    const starts = guilds.filter((e) => e.name.toLowerCase().startsWith(name));
    guilds = guilds.filter((e) => !e.name.toLowerCase().startsWith(name));
    const includes = guilds.filter((e) => e.name.toLowerCase().includes(name));

    return [...matches, ...starts, ...includes];
};

module.exports = {
    name: 'mod',
	description: 'take mod actions',
	execute(interaction) {

        const moderators = JSON.parse(fs.readFileSync('Storage/moderators.json', 'utf8'));

        const user = interaction.options.getUser('user') || false;
        const action = interaction.options.getString('action');
        const isEphemeral = interaction.options.getString('ephemeral') === "false" ? false : true;

        const args = action.trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();
        
        // Return if not mod
        if (!(interaction.user.id in moderators)) return interaction.reply({content: "You're not allowed to use this command", ephemeral: isEphemeral});

        // List all actions
        if (cmd === "list") {
            return interaction.reply({content: ">>> " + 
                "`list`\n" +
                "`get`\n" +
                "`response`, `response graph`\n"
            , ephemeral: isEphemeral});
        };
        
        if (cmd === "get") {
            if (!args[0]) return interaction.reply({content: "Usage: `/mod get <option>`\n\n**Options**\n`/mod get id <name>`: Search for a players ID\n`/mod get name <id>`: Search for a players name", ephemeral: isEphemeral});

            db.serialize(async () => {
                if (args[0] === "id") {
                    let stats = await query(`SELECT id, name FROM users`);

                    const name = args.slice(1).join(" ").toLowerCase();
                    if (!name) return interaction.reply({content: "No match found", ephemeral: isEphemeral});

                    let matches = [];
                    matches = matches.concat(stats.filter((e) => e.name.toLowerCase() === name));
                    stats = stats.filter((e) => e.name.toLowerCase() !== name);
                    matches = matches.concat(stats.filter((e) => e.name.toLowerCase().startsWith(name)));
                    stats = stats.filter((e) => !e.name.toLowerCase().startsWith(name));
                    matches = matches.concat(stats.filter((e) => e.name.toLowerCase().includes(name)));

                    if (matches.length) return interaction.reply({content: `Matches for "${name}":\n${matches.slice(0,20).map((e) => `${e.name}: ${e.id}`).join("\n")}`, ephemeral: isEphemeral});
                } else if (args[0] === "name") {
                    const { 0: stats } = await query(`SELECT name FROM users WHERE id = '${args[1]}'`);
                    if (stats?.name) return interaction.reply({content: stats.name, ephemeral: isEphemeral});
                };
                
                return interaction.reply({content: "No match found", ephemeral: isEphemeral});
            });
        };



        // Add premium
        // if (cmd === "query") {
        //     if (args[0].toUpperCase() === "DROP") return interaction.reply({content: "not allowed", ephemeral: isEphemeral});
        //     db.serialize(async () => {
        //         const res = await query(args.join(" ") + (user ? ` WHERE id = ${user.id}` : ""));
        //         if (res.length) return interaction.reply({content: JSON.stringify(res).slice(0, 2000), ephemeral: isEphemeral});
        //         return interaction.reply({content: "Action Successful", ephemeral: isEphemeral});
        //     });
        // };

        // Response Time
        if (cmd === "response") {
            if (!user.id) return interaction.reply({content: "Usage: `/mod response [graph] user:`\n\n**Options**\n`graph`: Draw a graph", ephemeral: isEphemeral});

            db.serialize(async () => {
                const { 0: res } = await query(`SELECT responsetime FROM dungeon WHERE id = '${user.id}'`);
                const timestamps = res.responsetime.split(",").map((e) => parseInt(e));
                const resp = timestamps.map((e, i) => timestamps[i+1]-e).slice(0, -2);
                const cleaned = resp.filter((e) => e < 30*1000);
                const rounded = resp.map((e) => Math.round(e/1000));
                if (cleaned.length === 0) return interaction.reply({content: "not enough data", ephemeral: isEphemeral});
                const diff = -(math.mean(...cleaned.slice(-100)));

                if (args[0] === "graph") {
                    const distribution = {};
                    const ndiff = -(math.mean(...resp.filter((e) => e < 20*1000)));
                    resp.filter((e) => e < 20*1000).map((e) => Math.round((e+ndiff)/1000)).forEach((e) => distribution[e] = distribution[e]+1 || 1);

                    const {spawn} = require('child_process');
                    const pythonProcess = spawn('python',["./Python/graph.py", user.username]);

                    // Pass data to the Python script via stdin
                    pythonProcess.stdin.write(JSON.stringify(distribution));
                    pythonProcess.stdin.end();

                    pythonProcess.stdout.on('data', (data) => {
                        const url = data.toString('utf8') || "failed to load image";
                        interaction.reply({content: url, ephemeral: isEphemeral});
                    });
                } else {                    
                    const s = `**user**: ${user.username}\n**sample size**: ${cleaned.length} | ${cleaned.slice(-100).length}\n**mean**: ${Math.round(math.mean(...cleaned)/10)/100}s | ${Math.round(math.mean(...cleaned.slice(-100))/10)/100}s\n**median**: ${Math.round(math.median(...cleaned)/10)/100}s | ${Math.round(math.median(...cleaned.slice(-100))/10)/100}s\n**mode**: ${math.mode(rounded)}s | ${math.mode(rounded.slice(-100))}s\n**std**: ${Math.round(math.std(...cleaned)/10)/100}s | ${Math.round(math.std(...cleaned.slice(-100))/10)/100}s\n**var**: ${Math.round(math.variance(...cleaned)/10000)/100}s² | ${Math.round(math.variance(...cleaned.slice(-100))/10000)/100}s²\n\n**Recent Activity**:\n> `
                    return interaction.reply({content: s + rounded.join(", ").slice(-1400) + `\n\n**Normalized**:\n> ` + resp.slice(-100).map((e) => Math.round((e+diff)/1000)).join(", ").slice(-(600-20-s.length)), ephemeral: isEphemeral});
                };
            });
        };

    },
};