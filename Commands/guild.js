/* eslint-disable no-unused-vars */
const { MessageEmbed } = require("discord.js");
const { db, query } = require("../db_handler.js");
const { dailies } = require("../Modules/dailyQuests.js");
const { generateUniqueGuildId, showPage, searchGuild } = require("../Modules/functions.js");
const { PageRow, OfferRow } = require("../Modules/components.js");

function lastActive(timestamp) {
    const now = new Date(), date = new Date(timestamp);
    
    // Check if the date is today
    if (date.toDateString() === now.toDateString()) return "today";
  
    // Check if the date is yesterday
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "yesterday";
    
    // Calculate the number of days between the date and today
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    return `${diff === 1 ? diff + " day" : diff + " days"} ago`;
};

function upgradePrice(level) {
    switch (level) {
        case 1: return 100000;
        case 2: return 300000;
        case 3: return 500000;
        case 4: return 1000000;
        case 5: return 2000000;
        case 6: return 5000000;
        case 7: return 8000000;
        case 8: return 12000000;
        default: return (level-7)*10000000;
    };
};

function listGuilds(guilds) {

    guilds.map((e) => `**__${e.name}__** ()`).join("\n\n");

    return;
};

module.exports = {
    name: 'guild',
	description: 'guild related commands',
	execute(interaction) {
        
        let subcommand = interaction.options.getSubcommand();
        
        // Item info
        if (subcommand === "create") {
            const name = interaction.options.getString('name');
            if (name.length > 20) return interaction.reply(`Guild names can't be longer than 20 characters (current length: ${name.length})`);
            db.serialize(async () => {
                let stats = await query(`SELECT coins, guild FROM users WHERE users.id = ${interaction.user.id}`);
                stats = {coins: stats[0].coins, guild: stats[0].guild};
                let existingGuilds = await query(`SELECT id FROM guilds`);
                existingGuilds = existingGuilds.map((e) => e.id);

                const fee = 20000;
                if (stats.coins < fee) return interaction.reply(`You don't have enough coins to create a guild (**${stats.coins}**/${fee}<:coins:872926669055356939>)`);
                if (stats.guild) return interaction.reply(`You are already in a guild, please leave your current one if you want to create a new guild.`)
                
                const guildid = generateUniqueGuildId(existingGuilds);

                await query(`UPDATE users SET coins = coins-${fee}, guild = '${guildid}' WHERE id = ${interaction.user.id}`);
                await query(`INSERT INTO guilds (id, name, master, members) VALUES ('${guildid}', '${name.replace(/'/g, "''")}', ${interaction.user.id}, '${interaction.user.id}')`, 'run');

                return interaction.reply(`Successfully created guild "${name}" <:kawaiicheer:928369628122583050>\nOther players can join your guild with the ID: \`${guildid}\``);
            });
        } else if (subcommand === "view") {
            const name = interaction.options.getString('id') || false;
            const user = interaction.options.getUser('user') || interaction.user;
            db.serialize(async () => {
                let stats = await query(`SELECT coins, guild FROM users WHERE users.id = ${user.id}`);
                stats = {coins: stats[0].coins, guild: stats[0].guild};

                if (!name && !stats.guild) return interaction.reply(`Please use the ID of the guild you want to view.`);

                const { 0: guild } = await query(`SELECT * FROM guilds WHERE id = ${name ? `'${name}'` : `'${stats.guild}'`}`);
                if (!guild) return interaction.reply(`Couldn't find guild with ID \`${name}\``);

                const members = await query(`SELECT id, name, lastdaily FROM users WHERE id IN (${guild.members})`);
                members.forEach((e) => {
                    if (e.id === guild.master) e.status = " (Guild Master)", e.value = 2;
                    else if (guild?.elders.includes(e.id)) e.status = " (Elder)", e.value = 1;
                    else e.status = "", e.value = 0;
                });

                const Embed = new MessageEmbed()
                .setTitle(guild.name)
                .setColor(guild.color || 0xbbffff)
                .setThumbnail(guild.icon)
                .setDescription((guild.description || "_Missing description. Use `/guild setting` to add one._")
                + `\n\n**Guild Level**: \`${guild.level}\`\n**Capacity**: \`${members.length}/${10+Math.min(guild.level-1, 10)}\`\n**Treasury**: \`${guild.treasury}\`<:coins:872926669055356939>, \`${guild.treasury_gems}\`<:genesis_gems:1034179687720681492>`
                + `\n\n<:ATK:1063214925528440832> **XP Buffs**: level ${guild.xpbuff}${guild.xpbuff ? `<:blank:917804200363171860>ㅤ(__+${20*guild.xpbuff}__%)` : ""}\n<:coins:872926669055356939> **Loot Buffs**: level ${guild.lootbuff}${guild.lootbuff ? `<:blank:917804200363171860>(__+${20*guild.lootbuff}__%)` : ""}\n⏱️ **Timers**: level ${guild.cdreduction}${guild.cdreduction ? `<:blank:917804200363171860> <:blank:917804200363171860>(__-${guild.cdreduction}__ min)` : ""}`
                )//+ `\n\n**Members**\n${members.sort((a, b) => b.value-a.value).map((e) => `${e.name}${e.status} ➜ last online __${lastActive(e.lastdaily)}__`).join("\n")}`)
                .addFields(
                    { name: "Members", value: `${members.sort((a, b) => b.value-a.value).map((e) => `${e.name}${e.status}`).join("\n")}`, inline: true },
                    { name: "Last Online", value: `${members.sort((a, b) => b.value-a.value).map((e) => `__${lastActive(e.lastdaily)}__`).join("\n")}`, inline: true },
                    // { name: '\u200B', value: '_ _', inline: true },
                )
                .setFooter({text: `join code: ${guild.id} | ${guild.canjoin ? "anyone can join" : "invite only"}`} )
                if (guild.banner) Embed.setImage(guild.banner);
                return interaction.reply({ embeds: [Embed] });
            });
        } else if (subcommand === "edit") {
            const setting = interaction.options.getString('setting');
            const input = interaction.options.getString('input');
            db.serialize(async () => {
                let stats = await query(`SELECT coins, guild FROM users WHERE users.id = ${interaction.user.id}`);
                stats = {coins: stats[0].coins, guild: stats[0].guild};
                if (stats.guild === null) return interaction.reply(`Only guild masters can change guild settings.`);

                const { 0: guild } = await query(`SELECT * FROM guilds WHERE id = '${stats.guild}'`);
                if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);
                if (guild.master !== interaction.user.id) return interaction.reply(`Only guild masters can change guild settings.`);
                
                if (setting === "color") {
                    if (guild.level < 3) return interaction.reply(`**${guild.name}** needs to be level 3 to unlock changing its embed color.`);
                    if (!input.match(/^#([0-9a-f]{3}){1,2}$/i)) return interaction.reply(`Please use a valid hex color code.\nExamples: \`#112358\`, \`#bbffff\`, \`#abc\``)
                    await query(`UPDATE guilds SET color = '${input}' WHERE id = '${stats.guild}'`);
                    interaction.reply(`Changed embed color to \`${input}\`!`);
                };

                if (setting === "description") {
                    if (input.length > 200) return interaction.reply(`Your guild description can contain a maximum of 200 characters (current length: ${input.length})`);
                    await query(`UPDATE guilds SET description = '${input.replace(/'/g, "''")}' WHERE id = '${stats.guild}'`);
                    return interaction.reply(`Changed guild description to\n> "${input}"`);
                };

                if (setting === "rename") {
                    if (input.length > 20) return interaction.reply(`Guild names can't be longer than 20 characters (current length: ${input.length})`);
                    await query(`UPDATE guilds SET name = '${input.replace(/'/g, "''")}' WHERE id = '${stats.guild}'`);
                    return interaction.reply(`Changed guild name to **${input}**`);
                };

                if (setting === "icon") {
                    if (input.length > 100) return interaction.reply(`Guild icon url can't be longer than 100 characters (current length: ${input.length})`);
                    if (!(input.startsWith("https://i.ibb.co/") || input.startsWith("https://i.imgur.com/") || input.startsWith("https://imgur.com/"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com");
                    if (!(input.endsWith(".png") || input.endsWith(".jpg") || input.endsWith(".jpeg") || input.endsWith(".gif"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com that ends with .png, .jpg, .jpeg or .gif");
                    await query(`UPDATE guilds SET icon = '${input.replace(/'/g, "''")}' WHERE id = '${stats.guild}'`);
                    return interaction.reply(`Changed guild icon to <${input}>`);
                };

                if (setting === "banner") {
                    if (guild.level < 5) return interaction.reply(`**${guild.name}** needs to be level 5 to upload a banner.`);
                    if (input.length > 100) return interaction.reply(`Guild banner url can't be longer than 100 characters (current length: ${input.length})`);
                    if (!input) {
                        await query(`UPDATE guilds SET banner = '""' WHERE id = '${stats.guild}'`);
                        return interaction.reply(`Removed guild banner`);
                    };
                    if (!(input.startsWith("https://i.ibb.co/") || input.startsWith("https://i.imgur.com/") || input.startsWith("https://imgur.com/"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com");
                    if (!(input.endsWith(".png") || input.endsWith(".jpg") || input.endsWith(".jpeg") || input.endsWith(".gif"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com that ends with .png, .jpg, .jpeg or .gif");
                    await query(`UPDATE guilds SET banner = '${input.replace(/'/g, "''")}' WHERE id = '${stats.guild}'`);
                    return interaction.reply(`Changed guild banner to <${input}>`);
                };

                if (setting === "canjoin") {
                    if (!(input === "true" || input === "false")) return interaction.reply(`Change your guild's join settings.\nWrite \`true\` if you want anyone to be able to join, \`false\` if you want to invite players.`);
                    await query(`UPDATE guilds SET canjoin = ${input === "false" ? 0 : 1} WHERE id = '${stats.guild}'`);
                    return interaction.reply(`Changed join settings to **${input === "false" ? "invite only" : "anyone can join"}**.`);
                };

                if (setting === "changecode") {
                    if (input.length > 8) return interaction.reply(`Guild join codes can't be longer than 8 characters (current length: ${input.length})`);
                    const allowedChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split("");
                    if (!input.split("").every((e) => allowedChars.includes(e))) return interaction.reply(`You can only use the characters a-z A-Z 0-9 - and _ in join codes.`);
                    if (guild.treasury_gems < 1000) return interaction.reply(`**${guild.name}** needs 1000<:genesis_gems:1034179687720681492> to change its join code.`);
                    const allCodes = await query(`SELECT id FROM guilds`);
                    if (allCodes.map((e) => e.id).includes(input)) return interaction.reply(`The join code **${input}** already exists, please choose another one.`);
                    if (guild.id === "MmLdY") return interaction.reply("No <a:FubukiSip:1081201294246674442>");
                    await query(`UPDATE guilds SET id = '${input}', treasury_gems = treasury_gems - 1000 WHERE id = '${guild.id}'`);
                    await query(`UPDATE users SET guild = '${input}' WHERE guild = '${guild.id}'`);
                    return interaction.reply(`Changed join code to **${input}**`);
                };

            });
        } else if (subcommand === "join") {
            const code = interaction.options.getString('code');
            db.serialize(async () => {
                let stats = await query(`SELECT coins, guild FROM users WHERE id = ${interaction.user.id}`);
                stats = {coins: stats[0].coins, guild: stats[0].guild};
                if (stats.guild !== null) return interaction.reply(`You are already in a guild, please leave it first.`);
                
                const { 0: guild } = await query(`SELECT * FROM guilds WHERE id = '${code}'`);
                if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);
                
                if (!guild.canjoin) return interaction.reply(`**${guild.name}** can only be joined through invites.`);
                if (guild.members.split(",").length >= 10+Math.min(guild.level-1, 10)) return interaction.reply(`**${guild.name}** has already reached the maximum amount of members it can hold.`);

                await query(`UPDATE users SET guild = '${code}' WHERE id = ${interaction.user.id}`);
                await query(`UPDATE guilds SET members = '${guild.members+","+interaction.user.id}' WHERE id = '${code}'`);

                return interaction.reply(`You have joined **${guild.name}**!`);
            });
        } else if (subcommand === "invite") {
            const user = interaction.options.getUser('user');
            if (user.id === interaction.user.id) return interaction.reply(`You can't invite yourself`);
            db.serialize(async () => {
                let stats = await query(`SELECT guild FROM users WHERE id = ${interaction.user.id}`);
                stats = {guild: stats[0].guild};
                if (stats.guild === null) return interaction.reply(`You are not in a guild.`);
                let stats2 = await query(`SELECT guild FROM users WHERE id = ${user.id}`);
                if (!stats2[0]) return interaction.reply(`**${user.username}** has not started playing yet.`);
                stats2 = {guild: stats2[0].guild};
                if (!(stats2.guild === null)) return interaction.reply(`**${user.username}** is already in a guild.`);

                const { 0: guild } = await query(`SELECT * FROM guilds WHERE id = '${stats.guild}'`);
                if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);

                if (interaction.user.id !== guild.master) return interaction.reply(`Only the guild master can invite members.`);

                if (guild.members.split(",").length >= 10+Math.min(guild.level-1, 10)) return interaction.reply(`**${guild.name}** has already reached the maximum amount of members it can hold.`);

                return interaction.reply({content: `${user.toString()} ${interaction.user.username} is inviting you to join **${guild.name}**`, components: [OfferRow], fetchReply: true}).then(msg => {
                    
                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === user.id && r.customId === "confirm", componentType: 'BUTTON', time: 45000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => (r.user.id === interaction.user.id || r.user.id === user.id) && r.customId === "cancel", componentType: 'BUTTON', time: 45000 });
                    
                    confirm.on('collect', async r => {
                        confirm.stop(), cancel.stop();

                        const { 0: guild } = await query(`SELECT * FROM guilds WHERE id = '${stats.guild}'`);
                        if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);        
                        if (guild.members.split(",").length >= 10+Math.min(guild.level-1, 10)) return interaction.reply(`**${guild.name}** has already reached the maximum amount of members it can hold.`);
                        
                        await query(`UPDATE users SET guild = '${guild.id}' WHERE id = ${user.id}`);
                        await query(`UPDATE guilds SET members = '${guild.members+","+user.id}' WHERE id = '${guild.id}'`);
                
                        return interaction.channel.send(`${user.toString()} has joined **${guild.name}**`);
                    });
                    
                    cancel.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send("Action cancelled");
                    });
                    
                });
            });
        } else if (subcommand === "leave") {
            db.serialize(async () => {
                let stats = await query(`SELECT guild FROM users WHERE id = ${interaction.user.id}`);
                stats = {guild: stats[0].guild};
                if (stats.guild === null) return interaction.reply(`You are not in a guild.`);

                const { 0: guild } = await query(`SELECT * FROM guilds WHERE id = '${stats.guild}'`);
                if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);
                
                if (guild.master === interaction.user.id) {
                    if (guild.members.split(",").length > 1) return interaction.reply(`Please promote someone else to the position of guild master before you can leave.`);
                    return interaction.reply({content: `You are the last member in **${guild.name}**. Leaving will permanently delete any related data, do you want to proceed?`, components: [OfferRow], fetchReply: true}).then(msg => {
                        
                        const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 45000 });
                        const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 45000 });
                        
                        confirm.on('collect', async r => {
                            confirm.stop(), cancel.stop();

                            await query(`UPDATE users SET guild = NULL WHERE id = ${interaction.user.id}`);
                            await query(`DELETE FROM guilds WHERE id = '${guild.id}'`);
                            
                            return interaction.channel.send(`You have left **${guild.name}**.`);
                        });
                        
                        cancel.on('collect', async r => {
                            confirm.stop(), cancel.stop();
                            return interaction.channel.send("Action cancelled");
                        });
                        
                    });
                };

                guild.members = guild.members.split(",").filter((e) => e !== interaction.user.id).join(",");
                guild.elders = guild.elders.split(",").filter((e) => e !== interaction.user.id).join(",");

                await query(`UPDATE users SET guild = NULL WHERE id = ${interaction.user.id}`);
                await query(`UPDATE guilds SET members = '${guild.members}', elders = '${guild.elders}' WHERE id = '${stats.guild}'`);

                return interaction.reply(`You have left **${guild.name}**`);
            });
        } else if (subcommand === "kick") {
            const user = interaction.options.getUser('user');
            if (user.id === interaction.user.id) return interaction.reply(`You can't kick yourself`);
            db.serialize(async () => {
                let stats = await query(`SELECT guild FROM users WHERE id = ${interaction.user.id}`);
                stats = {guild: stats[0].guild};
                if (stats.guild === null) return interaction.reply(`You are not in a guild.`);
                let stats2 = await query(`SELECT guild FROM users WHERE id = ${user.id}`);
                if (!stats2[0]) return interaction.reply(`**${user.username}** has not started playing yet.`);
                stats2 = {guild: stats2[0].guild};
                if (stats2.guild === null) return interaction.reply(`**${user.username}** is not in a guild.`);
                if (stats.guild !== stats2.guild) return interaction.reply(`**${user.username}** is not in your guild.`);

                const { 0: guild } = await query(`SELECT * FROM guilds WHERE id = '${stats.guild}'`);
                if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);

                stats.status = interaction.user.id === guild.master ? 2 : (guild.elders.includes(interaction.user.id) ? 1 : 0);
                stats2.status = user.id === guild.master ? 2 : (guild.elders.includes(user.id) ? 1 : 0);
                if (stats.status <= stats2.status) return interaction.reply(`You can't kick **${user.username}**`);

                return interaction.reply({content: `Are you sure you want to kick **${user.username}** from **${guild.name}**?`, components: [OfferRow], fetchReply: true}).then(msg => {
                    
                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 45000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 45000 });
                    
                    confirm.on('collect', async r => {
                        confirm.stop(), cancel.stop();

                        guild.members = guild.members.split(",").filter((e) => e !== user.id).join(",");
                        guild.elders = guild.elders.split(",").filter((e) => e !== user.id).join(",");

                        await query(`UPDATE users SET guild = NULL WHERE id = ${user.id}`);
                        await query(`UPDATE guilds SET members = '${guild.members}', elders = '${guild.elders}' WHERE id = '${guild.id}'`);
        
                        return interaction.channel.send(`**${user.toString()}** was kicked from **${guild.name}** by ${interaction.user.toString()}`);
                    });
                    
                    cancel.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send("Action cancelled");
                    });
                    
                });
            });
        } else if (subcommand === "promote") {
            const user = interaction.options.getUser('user');
            if (user.id === interaction.user.id) return interaction.reply(`You can't promote yourself`);
            db.serialize(async () => {
                let stats = await query(`SELECT guild FROM users WHERE id = ${interaction.user.id}`);
                stats = {guild: stats[0].guild};
                if (stats.guild === null) return interaction.reply(`You are not in a guild.`);
                let stats2 = await query(`SELECT guild FROM users WHERE id = ${user.id}`);
                if (!stats2[0]) return interaction.reply(`**${user.username}** has not started playing yet.`);
                stats2 = {guild: stats2[0].guild};
                if (stats2.guild === null) return interaction.reply(`**${user.username}** is not in a guild.`);
                if (stats.guild !== stats2.guild) return interaction.reply(`**${user.username}** is not in your guild.`);

                const { 0: guild } = await query(`SELECT * FROM guilds WHERE id = '${stats.guild}'`);
                if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);

                if (interaction.user.id !== guild.master) return interaction.reply(`Only the guild master can promote members.`);

                if (guild.elders.includes(user.id)) {
                    return interaction.reply({content: `Are you sure you want to promote **${user.username}** to the guild master position?\nThis will demote you to the position of an elder.`, components: [OfferRow], fetchReply: true}).then(msg => {
                        
                        const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 45000 });
                        const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 45000 });
                        
                        confirm.on('collect', async r => {
                            confirm.stop(), cancel.stop();
                            
                            guild.elders = guild.elders.split(",").filter((e) => e !== user.id).join(",");
                            if (guild.elders.split(",").length) guild.elders += `,${interaction.user.id}`;
                            else guild.elders = `${interaction.user.id}`;
                            
                            await query(`UPDATE guilds SET master = ${user.id}, elders = '${guild.elders}' WHERE id = '${guild.id}'`);
                            
                            return interaction.channel.send(`**${user.toString()}** was promoted to guild master!`);
                        });
                        
                        cancel.on('collect', async r => {
                            confirm.stop(), cancel.stop();
                            return interaction.channel.send("Action cancelled");
                        });

                    });
                } else {
                    return interaction.reply({content: `Are you sure you want to promote **${user.username}** to the position of an elder?`, components: [OfferRow], fetchReply: true}).then(msg => {
                        
                        const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 45000 });
                        const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 45000 });
                        
                        confirm.on('collect', async r => {
                            confirm.stop(), cancel.stop();
    
                            if (guild.elders.split(",").length) guild.elders += `,${user.id}`;
                            else guild.elders = `${user.id}`;
    
                            await query(`UPDATE guilds SET elders = '${guild.elders}' WHERE id = '${guild.id}'`);
            
                            return interaction.channel.send(`**${user.toString()}** was promoted to elder!`);
                        });
                        
                        cancel.on('collect', async r => {
                            confirm.stop(), cancel.stop();
                            return interaction.channel.send("Action cancelled");
                        });
                        
                    });
                };
            });
        } else if (subcommand === "demote") {
            const user = interaction.options.getUser('user');
            if (user.id === interaction.user.id) return interaction.reply(`You can't demote yourself`);
            db.serialize(async () => {
                let stats = await query(`SELECT guild FROM users WHERE id = ${interaction.user.id}`);
                stats = {guild: stats[0].guild};
                if (stats.guild === null) return interaction.reply(`You are not in a guild.`);
                let stats2 = await query(`SELECT guild FROM users WHERE id = ${user.id}`);
                if (!stats2[0]) return interaction.reply(`**${user.username}** has not started playing yet.`);
                stats2 = {guild: stats2[0].guild};
                if (stats2.guild === null) return interaction.reply(`**${user.username}** is not in a guild.`);
                if (stats.guild !== stats2.guild) return interaction.reply(`**${user.username}** is not in your guild.`);

                const { 0: guild } = await query(`SELECT * FROM guilds WHERE id = '${stats.guild}'`);
                if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);

                if (interaction.user.id !== guild.master) return interaction.reply(`Only the guild master can demote members.`);

                if (!guild.elders.includes(user.id)) return interaction.reply(`You can't further demote **${user.username}**`);
                return interaction.reply({content: `Are you sure you want to demote **${user.username}**?`, components: [OfferRow], fetchReply: true}).then(msg => {
                    
                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 45000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 45000 });
                    
                    confirm.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        guild.elders = guild.elders.split(",").filter((e) => e !== user.id).join(",");
                        
                        await query(`UPDATE guilds SET elders = '${guild.elders}' WHERE id = '${guild.id}'`);
                        return interaction.channel.send(`${user.toString()} was demoted by ${interaction.user.toString()}`);
                    });
                    
                    cancel.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send("Action cancelled");
                    });
                    
                });
            });
        } else if (subcommand === "top") {
            let page = interaction.options.getInteger('page');
            db.serialize(async () => {
                const guilds = await query(`SELECT * FROM guilds`);
                if (!guilds[0]) return interaction.reply(`There are no guilds in Camelot.`);
    
                // Sort guilds
                guilds.sort((a, b) => b.level-a.level);

                // Pages
                const elementsPerPage = 15;
                let pagesTotal = Math.ceil(guilds.length / elementsPerPage);
                let currPage = 1;
                if (page <= pagesTotal && page > 0) {
                    currPage = page;
                };
                let left = guilds.length % elementsPerPage;
    
                let showItems = showPage(currPage, pagesTotal, left, guilds, elementsPerPage);

                const Embed = new MessageEmbed()
                .setColor(guilds[0].color || 0xbbffff)
                .setTitle(`⚔️ Top Guilds of Camelot ⚔️`)
                .setDescription(showItems.map((e, i) => `${((currPage-1)*15)+i+1}) **${e.name}** ➜ Level **${e.level}**`).join("\n"))
                .setThumbnail(guilds[0].icon)
                .setFooter(`Page ${currPage}/${pagesTotal}`)
                if (pagesTotal === 1) return interaction.reply({ embeds: [Embed] });
                return interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {
    
                    const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                    const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });
    
                    prev.on('collect', async r => {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;

                        showItems = showPage(currPage, pagesTotal, left, guilds, elementsPerPage);
                        
                        Embed.setDescription(showItems.map((e, i) => `${((currPage-1)*15)+i+1}) **${e.name}** ➜ Level **${e.level}**`).join("\n"));
                        return interaction.editReply({ embeds: [Embed], components: [PageRow] });
                    });
    
                    next.on('collect', async r => {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;

                        showItems = showPage(currPage, pagesTotal, left, guilds, elementsPerPage);
    
                        Embed.setDescription(showItems.map((e, i) => `${((currPage-1)*15)+i+1}) **${e.name}** ➜ Level **${e.level}**`).join("\n"));
                        return interaction.editReply({ embeds: [Embed], components: [PageRow] });
                    });
                    
                });
            });
        } else if (subcommand === "donate") {
            const currency = interaction.options.getString('currency');
            const donation = interaction.options.getInteger('amount');
            const emoji = {coins: "<:coins:872926669055356939>", gems: "<:genesis_gems:1034179687720681492>"}[currency];
            if (donation < 1) return interaction.reply(`You can't donate less than 1 ${emoji}`);
            if (donation > 1000000000) return interaction.reply(`You can't donate more than 1,000,000,000 ${emoji} at once`);
            db.serialize(async () => {
                const { 0: stats } = await query(`SELECT coins, gems, guild FROM users WHERE id = ${interaction.user.id}`);
                if (stats.guild === null) return interaction.reply(`You are not in a guild.`);

                if (stats[currency] < donation) return interaction.reply(`You don't have **${donation}**${emoji} (current balance: ${stats[currency]}${emoji})`);

                const { 0: guild } = await query(`SELECT * FROM guilds WHERE id = '${stats.guild}'`);
                if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);

                return interaction.reply({content: `Do you want to donate **${donation}**${emoji} to **${guild.name}**?`, components: [OfferRow], fetchReply: true}).then(msg => {
                    
                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 45000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 45000 });
                    
                    confirm.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        
                        const { 0: stats } = await query(`SELECT coins, gems, guild FROM users WHERE id = ${interaction.user.id}`);        
                        if (stats[currency] < donation) return interaction.channel.send(`You don't have **${donation}**${emoji} (current balance: ${stats[currency]}${emoji})`);

                        // Daily Quests
                        dailies[9].update(interaction, donation);
                        
                        await query(`UPDATE users SET ${currency} = ${currency} - ${donation}, donatedtotal = donatedtotal + ${donation} WHERE id = '${interaction.user.id}'`);
                        await query(`UPDATE guilds SET ${currency === "coins" ? `treasury = treasury + ${donation}` : `treasury_gems = treasury_gems + ${donation}`} WHERE id = '${guild.id}'`);
                        return interaction.channel.send(`${interaction.user.username} has donated **${donation}**${emoji} to **${guild.name}**!`);
                    });
                    
                    cancel.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send("Action cancelled");
                    });
                    
                });
            });
        } else if (subcommand === "levelup") {
            db.serialize(async () => {
                const { 0: guild } = await query(`SELECT * FROM guilds WHERE master = ${interaction.user.id}`);
                if (!guild) return interaction.reply(`You don't own a guild.`);

                const price = upgradePrice(guild.level);
                if (price > guild.treasury) return interaction.reply(`Your guild does not have enough coins in the treasury to upgrade (**${guild.treasury}**/${price}<:coins:872926669055356939>)`);

                return interaction.reply({content: `Are you sure you want to upgrade **${guild.name}** to level **${guild.level+1}** for **${price}**<:coins:872926669055356939>?`, components: [OfferRow], fetchReply: true}).then(msg => {
                    
                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 45000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 45000 });
                    
                    confirm.on('collect', async r => {
                        confirm.stop(), cancel.stop();

                        const { 0: guild } = await query(`SELECT * FROM guilds WHERE master = ${interaction.user.id}`);
                        if (!guild) return interaction.reply(`You don't own a guild.`);
                        
                        const price = upgradePrice(guild.level);
                        if (price > guild.treasury) return interaction.channel.send(`Your guild does not have enough coins in the treasury to upgrade (**${guild.treasury}**/${price}<:coins:872926669055356939>)`);
                        
                        await query(`UPDATE guilds SET level = level + 1, treasury = treasury - ${price}, tokens = tokens + 1 WHERE id = '${guild.id}'`);
                        return interaction.channel.send(`Successfully upgraded **${guild.name}** to level **${guild.level+1}**!`);
                    });
                    
                    cancel.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send("Action cancelled");
                    });
                    
                });
            });
        } else if (subcommand === "upgrade") {
            const perk = interaction.options.getString('perk');
            const perkName = {"membercap": "Guild Size", "xpbuff": "XP Buffs", "lootbuff": "Loot Buffs", "cdreduction": "Timers"}[perk];
            db.serialize(async () => {
                const { 0: guild } = await query(`SELECT * FROM guilds WHERE master = ${interaction.user.id}`);
                if (!guild) return interaction.reply(`You don't own a guild.`);
                
                if (!guild.tokens) return interaction.reply(`**${guild.name}** does not have any tokens left. Try again after leveling up.`);
                if (guild[perk] >= 10) return interaction.reply(`**${guild.name}** has already reached the maximum level the **${perkName}** perk.`);

                return interaction.reply({content: `Are you sure you want to upgrade **${perkName}** to level **${guild[perk]+1}** by using 1 out of your currently available ${guild.tokens === 1 ? "1 token" : `${guild.tokens} tokens`}?`, components: [OfferRow], fetchReply: true}).then(msg => {
                    
                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 45000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 45000 });
                    
                    confirm.on('collect', async r => {
                        confirm.stop(), cancel.stop();

                        const { 0: guild } = await query(`SELECT * FROM guilds WHERE master = ${interaction.user.id}`);
                        if (!guild) return interaction.channel.send(`You don't own a guild.`);
                        
                        if (!guild.tokens) return interaction.channel.send(`**${guild.name}** does not have any tokens left. Try again after leveling up.`);
                        if (guild[perk] >= 10) return interaction.channel.send(`**${guild.name}** has already reached the maximum level the **${perkName}** perk.`);        

                        await query(`UPDATE guilds SET ${perk} = ${perk} + 1, tokens = tokens - 1 WHERE id = '${guild.id}'`);
                        return interaction.channel.send(`Successfully upgraded **${perk}** to level **${guild[perk]+1}**!`);
                    });
                    
                    cancel.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send("Action cancelled");
                    });
                    
                });
            });
        } else if (subcommand === "convert") {
            const amount = interaction.options.getInteger('amount');
            if (amount < 1) return interaction.reply(`You can't convert less than 1 <:genesis_gems:1034179687720681492>`);
            if (amount > 100000) return interaction.reply(`You can't convert more than 100000 <:genesis_gems:1034179687720681492> at once`);
            db.serialize(async () => {
                const { 0: guild } = await query(`SELECT * FROM guilds WHERE master = ${interaction.user.id}`);
                if (!guild) return interaction.reply(`You don't own a guild.`);

                if (guild.treasury_gems < amount) return interaction.reply(`**${guild.name}** doesn't have **${amount}**<:genesis_gems:1034179687720681492> in the treasury to convert (**${guild.treasury_gems}**/${amount}<:genesis_gems:1034179687720681492>)`)

                return interaction.reply({content: `Are you sure you want to convert **${amount}**<:genesis_gems:1034179687720681492> into **${1000*amount}**<:coins:872926669055356939>? (gems to coins conversion = 1:1000)`, components: [OfferRow], fetchReply: true}).then(msg => {
                    
                    const confirm = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: 'BUTTON', time: 45000 });
                    const cancel = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: 'BUTTON', time: 45000 });
                    
                    confirm.on('collect', async r => {
                        confirm.stop(), cancel.stop();

                        const { 0: guild } = await query(`SELECT * FROM guilds WHERE master = ${interaction.user.id}`);
                        if (!guild) return interaction.channel.send(`You don't own a guild.`);
                        
                        if (guild.treasury_gems < amount) return interaction.channel.send(`**${guild.name}** doesn't have **${amount}**<:genesis_gems:1034179687720681492> in the treasury to convert (**${guild.treasury_gems}**/${amount}<:genesis_gems:1034179687720681492>)`)

                        await query(`UPDATE guilds SET treasury_gems = treasury_gems - ${amount}, treasury = treasury + ${1000*amount} WHERE id = '${guild.id}'`);
                        return interaction.channel.send(`Converted **${amount}**<:genesis_gems:1034179687720681492> into **${1000*amount}**<:coins:872926669055356939>`);
                    });
                    
                    cancel.on('collect', async r => {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send("Action cancelled");
                    });
                    
                });
            });
        } else if (subcommand === "find") {
            const name = interaction.options.getString('name') || "";
            let page = interaction.options.getInteger('page');
            db.serialize(async () => {
                const guilds = await query(`SELECT * FROM guilds`);
                if (!guilds[0]) return interaction.reply(`There are no guilds`);
                guilds.sort((a, b) => b.level-a.level).forEach((e,i) => e.rank = i+1);

                let matchingGuilds = searchGuild(name, guilds);

                if (matchingGuilds.length === 0) return interaction.reply(`Couldn't find any guilds matching \`${name}\``);

                // Setup Pages
                let elementsPerPage = 5;
                let pagesTotal = Math.ceil(matchingGuilds.length / elementsPerPage);
                let currPage = 1;
                if (page <= pagesTotal && page > 0) {
                    currPage = page;
                };
                let left = matchingGuilds.length % elementsPerPage;
                
                // Filter items to show on the current page
                let showItems = showPage(currPage, pagesTotal, left, matchingGuilds, elementsPerPage);
                
                // Join elements to string
                let desc = showItems.map((e) => `**${e.name}** (Guild Rank #${e.rank})\n<:barg:994958341128339536>Join Code: \`${e.id}\` | ${e.canjoin ? "Everyone can join" : "Invite only"} | \`(${e.members.split(",").length}/${10+Math.min(e.level-1, 10)})\``).join("\n\n");
                
                const Embed = new MessageEmbed()
                .setColor(matchingGuilds[0].color || 0xbbffff)
                .setTitle(name ? `Guilds matching "${name}"` : "Guilds")
                .setThumbnail(matchingGuilds[0].icon)
                .setDescription(desc)
                .setFooter(`Page ${currPage}/${pagesTotal}`)
                if (pagesTotal === 1) return interaction.reply({ embeds: [Embed] });
                return interaction.reply({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {

                    const prev = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: 'BUTTON', time: 90000 });
                    const next = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: 'BUTTON', time: 90000 });
                    
                    prev.on('collect', async r => {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
    
                        showItems = showPage(currPage, pagesTotal, left, matchingGuilds, elementsPerPage);
                        desc = showItems.map((e) => `**${e.name}** (Guild Rank #${e.rank})\n<:barg:994958341128339536>Join Code: \`${e.id}\` | ${e.canjoin ? "Everyone can join" : "Invite only"} | \`(${e.members.split(",").length}/${10+Math.min(e.level-1, 10)})\``).join("\n\n");
    
                        Embed.setDescription(desc).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [PageRow] });
                    });
    
                    next.on('collect', async r => {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
    
                        showItems = showPage(currPage, pagesTotal, left, matchingGuilds, elementsPerPage);
                        desc = showItems.map((e) => `**${e.name}** (Guild Rank #${e.rank})\n<:barg:994958341128339536>Join Code: \`${e.id}\` | ${e.canjoin ? "Everyone can join" : "Invite only"} | \`(${e.members.split(",").length}/${10+Math.min(e.level-1, 10)})\``).join("\n\n");
    
                        Embed.setDescription(desc).setFooter(`Page ${currPage}/${pagesTotal}`);
                        interaction.editReply({ embeds: [Embed], components: [PageRow] });
                    });
                    
                });

                // return interaction.reply({content: `Content`, components: [], fetchReply: true})
            });
        };

    },
};