import fs from 'fs';
import { EmbedBuilder, ComponentType, AttachmentBuilder, User } from "discord.js";
import { characters } from "../Modules/chars";
import { classLevelToXP, search, searchItem, showPage } from "../Modules/functions";
import { OfferRow, PageRow, cowSettings } from "../Modules/components";
import { requestVerification, dungeonTempBan } from "../Modules/components";
import { armorInfo, items, ringInfo, weaponInfo } from "../Modules/items";
import { SlashCommand, UserSchema } from '../types';
import { deleteWeapon, doesUserExist, getGuildSchema, getPastStampedes, getResponseTimes, getUserSchema, getUserTransaction, getUserTransactions, insertNewWeapon, transferAccount, updateUsers } from '../Modules/queries';
import { query } from '../postgres';
import { createResponseGraph, getResponseData } from '../Modules/responseGraph';
import { query as sqliteQuery } from '../db_handler';

const exportCommand: SlashCommand = {
    name: 'admin',
    async execute({ interaction }) {

        let action = interaction.options.getString('action', true);
        let user = interaction.options.getUser('user');
        const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

        let args = action.trim().split(/ +/g);
        const cmd = args.shift()?.toLowerCase();

        // Return if not owner
        if (interaction.user.id !== "489490486734880774") {
            return interaction.reply({ content: "You're not allowed to use this command", ephemeral });
        };

        // List all actions
        if (action === "list" || action === "ls") {
            return interaction.reply({ content: ">>> `list`\n`reset pulls`\n`reset daily`\n`reset weekly`\n`reset dungeon`\n`guilds`\n`add vote`\n`set <key> <value>`\n`did`", ephemeral });
        };

        // Check refunded shard amount
        if (action === "refunded") {
            if (!user) return interaction.reply({ content: "missing user object", ephemeral });

            const charactersFromDb = await sqliteQuery('SELECT rowid, * FROM characters');

            const charData = charactersFromDb.find((c: any) => c.id === user?.id) || {
                chars: '[]',
                ref: '{}',
                level: '{}',
                class: '{}',
                skin: '{}',
                equipment: '{}'
            };

            const shards = Object.entries(JSON.parse(charData.ref) as Record<string, number>)
                .filter(([key,]) => characters[key as any].rarity === "SS" || characters[key as any].rarity === "EX")
                .filter(([, value]) => value > 2)
                .reduce((a, [, b]) => a + (b > 3 ? 4 : 1), 0);

            return interaction.reply({ content: `${shards} shards have been refunded to ${user.toString()}`, ephemeral });
        };

        if (cmd === "repair") {

            // Repair backgrounds
            if (args[0] === "backgrounds" || args[0] === "bg") {
                const stats = await query(`SELECT id, backgrounds FROM users`) as { id: string, backgrounds: string[]; }[];

                for (const stat of stats) {
                    const arr: string[] = JSON.parse(stat.backgrounds.join(",") || "[]") || [];

                    // Update users table
                    await updateUsers(stat.id, {
                        backgrounds: { type: "set", value: arr }
                    });
                };

                return interaction.reply({ content: "Action Successful: Repaired backgrounds", ephemeral });
            };

        };

        // Load dungeon_responsetime
        if (action === "resp") {

            // read file ../response.txt, which is a list of timestamps
            const timestamps = fs.readFileSync("./response.txt", "utf8").split(",").filter(Boolean).map(Number);

            // convert each timestamp to a date object
            const dates = timestamps.map(timestamp => new Date(timestamp));

            // store it to the db
            await updateUsers("130630780069085184", {
                dungeon_responsetime: { type: "set", value: dates }
            });
            return interaction.reply({ content: "Action Successful: Loaded dungeon_responsetime", ephemeral });
        };



        // Reset Pulls
        if (action === "reset pulls") {
            await updateUsers(user ? user.id : "*", {
                pullcount: { type: "set", value: 0 }
            });

            return interaction.reply({ content: `Action Successful: Reset pulls for ${user ? user.toString() : "all users"}`, ephemeral });
        };

        // Reset Dailies
        if (action === "reset daily") {
            await updateUsers(user ? user.id : "*", {
                dailyclaimed: { type: "set", value: 0 }
            });

            return interaction.reply({ content: `Action Successful: Reset daily for ${user ? user.toString() : "all users"}`, ephemeral });
        };

        // Reset Weeklies
        if (action === "reset weekly") {
            await updateUsers(user ? user.id : "*", {
                weeklyclaimed: { type: "set", value: 0 }
            });
            return interaction.reply({ content: `Action Successful: Reset weekly for ${user ? user.toString() : "all users"}`, ephemeral });
        };

        // Reset Dungeon
        if (action === "reset dungeon") {
            await updateUsers(user ? user.id : "*", {
                dungeon_limit: { type: "set", value: 0 }
            });
            return interaction.reply({ content: `Action Successful: Reset dungeon for ${user ? user.toString() : "all users"}`, ephemeral });
        };

        // List Guilds
        if (action === "guilds") {
            let guildArr: string[] = [];
            let membersTotal = 0;
            interaction.client.guilds.cache.each(guild => {
                guildArr.push(guild.name + " | " + guild.id + " | " + guild.memberCount + " Members");
                membersTotal += guild.memberCount;
            });
            guildArr.sort((a, b) => Number(b.match(/\d+(?=\D*$)/)?.[0] ?? 0) - Number(a.match(/\d+(?=\D*$)/)?.[0] ?? 0));

            const elementsPerPage = 15;
            const pagesTotal = Math.ceil(guildArr.length / elementsPerPage);
            let currPage = 1;

            let showAnime = showPage(currPage, guildArr, elementsPerPage);

            const Embed = new EmbedBuilder()
                .setTitle(`Guilds Total (${guildArr.length} | ${membersTotal})`)
                .setColor(0xbbffff)
                .setThumbnail("https://i.imgur.com/WWM4K98.png")
                .setDescription(showAnime.join("\n"));
            return interaction.reply({ embeds: [Embed], components: [PageRow], ephemeral }).then((msg) => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    showAnime = showPage(currPage, guildArr, elementsPerPage);

                    Embed.setDescription(showAnime.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed] });
                });
            });
        };

        // Add vote
        if (action === "add vote") {
            if (!user) return interaction.reply({ content: "missing user object", ephemeral });

            await updateUsers(user.id, {
                pullresets: { type: "increment", value: 1 },
                votestotal: { type: "increment", value: 1 },
                lootbox: { type: "increment", value: 1 },
                lastvote: { type: "set", value: new Date() }
            });

            return interaction.reply({ content: "Action Successful", ephemeral });
        };

        // Set db
        if (action.startsWith("set")) {
            const key = action.split(" ")[1].toLowerCase();
            const value = action.split(" ")[2];

            await updateUsers(user ? user.id : "*", {
                [key]: { type: "set", value: isNaN(parseInt(value)) ? value : parseInt(value) }
            });

            return interaction.reply({ content: `Action Successful: Set \`${key}\` to **${value}** for ${user ? user.toString() : "all users"}`, ephemeral });
        };

        // Add vote
        if (action === "did") {
            let names = characters.map((e) => e.name).sort();
            let len = names.length - 1, res = "";
            while (len--) if (names[len - 1] === names[len]) res += names[len--] + "\n";
            return interaction.reply({ content: res ? `Yes, he did!\n\n${res}` : "All's fine!", ephemeral });
        };

        // Add char
        if (action.startsWith("add char")) {
            if (!user) return interaction.reply({ content: `Error: missing user object\n\nUsage: \`/admin add char <name> user:@user\`\n\n**Options**\n\`name\`: Name or ID of the character to be added`, ephemeral });

            args.shift();
            const char = search(args.join(" "), [0], interaction, true);
            if (!char) return interaction.reply({ content: `Error: Couldn't find character "${args.join(" ")}"\n\nUsage: \`/admin add char <name> user:@user\`\n\n**Options**\n\`name\`: Name or ID of the character to be added`, ephemeral });

            // Update users table
            await updateUsers(user.id, {
                chars: { type: "append", value: [char.id] },
            });

            return interaction.reply({ content: `Action Successful: Added **${char.name}** to ${user.toString()}`, ephemeral });
        };

        // Remove char
        if (action.startsWith("remove char")) {
            if (!user) return interaction.reply({ content: `Error: missing user object\n\nUsage: \`/admin remove char <name> user:@user\`\n\n**Options**\n\`name\`: Name or ID of the character to be removed`, ephemeral });

            args.shift();
            const char = search(args.join(" "), [0], interaction, true);
            if (!char) return interaction.reply({ content: `Error: Couldn't find character "${args.join(" ")}"\n\nUsage: \`/admin remove char <name> user:@user\`\n\n**Options**\n\`name\`: Name or ID of the character to be removed`, ephemeral });

            const inv = await getUserSchema(user.id);
            if (!inv?.chars.includes(char.id)) return interaction.reply({ content: `**ERROR**: ${user.toString()} does not have a copy of **${char.name}**`, ephemeral });

            // Update users table
            await updateUsers(user.id, {
                chars: { type: "remove", value: [char.id] },
            });

            return interaction.reply({ content: `Action Successful: Removed **${char.name}** from ${user.toString()}`, ephemeral });
        };

        // Add weapon
        if (action.startsWith("add weapon")) {
            if (!user) return interaction.reply({ content: `Error: missing user object\n\nUsage: \`/admin add weapon <name> user:@user [--id:string] [--level:number]\`\n\n**Options**\n\`name\`: Name or ID of the item to be added\n\`--id\`: Custom ID for the item\n\`--level\`: Starting level for the item`, ephemeral });

            // Extract flags
            const flags = args.filter(arg => arg.startsWith("--")).map(flag => flag.slice(2));
            args = args.filter(arg => !arg.startsWith("--"));

            // Remove "char" from args
            args.shift();

            // Parse flags
            const customId = flags.find(f => f.startsWith("id:"))?.split(":")[1];
            const level = Math.max(0, Math.min(170, parseInt(flags.find(f => f.startsWith("level:"))?.split(":")[1] ?? "1")));

            // Validate custom ID if provided
            if (customId) {
                if (customId.length > 5) return interaction.reply({ content: `Item codes can't be longer than 5 characters (current length: ${customId.length})`, ephemeral });
                const allowedChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split("");
                if (!customId.split("").every((e) => allowedChars.includes(e))) return interaction.reply({ content: `You can only use the characters a-z, A-Z, 0-9, - and _ in item codes.`, ephemeral });
            };

            // Search for item
            const item = searchItem(args.join(" "), interaction, true);
            if (!item?.name) return interaction.reply({ content: `Error: Couldn't find item "${args.join(" ")}"\n\nUsage: \`/admin add weapon <name> user:@user [--id:string] [--level:number]\`\n\n**Options**\n\`name\`: Name or ID of the item to be added\n\`--id\`: Custom ID for the item\n\`--level\`: Starting level for the item`, ephemeral });

            if (!(item.category === "weapon" || item.category === "armor" || item.category === "ring")) return interaction.reply({ content: `Error: Item must be a weapon, an armor piece or a ring`, ephemeral });

            // Calculate XP and required ascension if level provided
            let xp = 0;
            let ascension = 0;
            if (level && level > 1) {
                ascension = level <= 30 ? 0 : Math.ceil((level - 30) / 10) + 1;

                // Calculate total XP needed
                for (let i = 1; i < level; i++) {
                    xp += Math.floor(20 * Math.pow(i, 1.290349));
                };
            };

            try {
                // Insert new weapon
                const drop = await insertNewWeapon(user.id, item.id, item.category, customId ? `${customId}:${user.id}` : undefined, xp, ascension);
                return interaction.reply({ content: `Action Successful: Added ${item.emoji} **${item.name}** (ID: \`${drop.uniqueid.split(":")[0]}\`${level ? `, Level: ${level}, Ascension: ${ascension}` : ""}) to ${user.toString()}`, ephemeral });
            } catch {
                if (customId) return interaction.reply({ content: `Error: Item with ID \`${customId}\` possibly exists for this user`, ephemeral });
                return interaction.reply({ content: `Error while adding item to ${user.toString()}`, ephemeral });
            };
        };

        // Add all weapons
        if (action.startsWith("add all weapons")) {
            if (!user) return interaction.reply({ content: `Error: missing user object\n\nUsage: \`/admin add all weapons user:@user\`\n\n**Options**\n\`user\`: User to add the weapons to`, ephemeral });

            const flags = args.filter(arg => arg.startsWith("--")).map(flag => flag.slice(2));

            const weapons = items.filter(item => item.category === "weapon" || item.category === "armor") as (weaponInfo | armorInfo)[];

            let level = 120, xp = 0, ascension = 0;
            if (level && level > 1) {
                ascension = level <= 30 ? 0 : Math.ceil((level - 30) / 10) + 1;

                // Calculate total XP needed
                for (let i = 1; i < level; i++) {
                    xp += Math.floor(20 * Math.pow(i, 1.290349));
                };
            };

            for (const weapon of weapons) {
                await insertNewWeapon(user.id, weapon.id, weapon.category, undefined, flags.includes("max") ? xp : undefined, flags.includes("max") ? ascension : undefined);
            };

            return interaction.reply({ content: `Action Successful: Added all weapons to ${user.toString()}`, ephemeral });
        };

        // Add all rings
        if (action.startsWith("add all rings")) {
            if (!user) return interaction.reply({ content: `Error: missing user object\n\nUsage: \`/admin add all rings user:@user\`\n\n**Options**\n\`user\`: User to add the rings to`, ephemeral });

            const flags = args.filter(arg => arg.startsWith("--")).map(flag => flag.slice(2));

            const rings = items.filter(item => item.category === "ring") as ringInfo[];

            for (const ring of rings) {
                await insertNewWeapon(user.id, ring.id, ring.category, undefined, flags.includes("max") ? (ring.maxlevel - 1) : undefined);
            };

            return interaction.reply({ content: `Action Successful: Added all rings to ${user.toString()}`, ephemeral });
        };

        // Remove weapon
        if (action.startsWith("remove weapon")) {
            if (!user) return interaction.reply({ content: `Error: missing user object\n\nUsage: \`/admin remove weapon <uniqueid> user:@user\`\n\n**Options**\n\`uniqueid\`: Unique ID of the item to be removed`, ephemeral });

            args.shift(); // Remove "weapon" from args
            const itemId = args[0];
            if (!itemId) return interaction.reply({ content: `Error: missing item ID\n\nUsage: \`/admin remove weapon <uniqueid> user:@user\`\n\n**Options**\n\`uniqueid\`: Unique ID of the item to be removed`, ephemeral });

            // Try to delete the weapon
            const deletedWeapon = await deleteWeapon(`${itemId}:${user.id}`);

            if (deletedWeapon) {
                const item = items[deletedWeapon.itemid];
                return interaction.reply({ content: `Action Successful: Removed ${item.emoji} **${item.name}** (ID: \`${itemId}\`) from ${user.toString()}`, ephemeral });
            } else {
                return interaction.reply({ content: `Error: Item with ID \`${itemId}\` not found for ${user.toString()}`, ephemeral });
            };
        };

        // Leave Server
        if (action.startsWith("leave server")) {
            let guild = interaction.client.guilds.cache.get(action.split(" ")[2]);
            if (!guild) return interaction.reply({ content: `Couldn't find guild ${action.split(" ")[2]}`, ephemeral });
            guild.leave();
            return interaction.reply({ content: `Left ${guild.name}`, ephemeral });
        };

        // Play
        if (cmd === "play") {
            return interaction.reply({ content: "Command currently disabled", ephemeral });

            // const connection = voice.joinVoiceChannel({
            //     channelId: "1055162421335035984",
            //     guildId: "927257132624130119",
            //     adapterCreator: interaction.guild.voiceAdapterCreator,
            // });
            // const audioplayer = voice.createAudioPlayer();
            // connection.subscribe(audioplayer);

            // let song;
            // switch (args[0]) {
            //     case "snow": song = "white_white_snow"; break;
            //     default: song = args[0]; break;
            // };

            // const resource = voice.createAudioResource(fs.createReadStream(`./Audio/${song}.opus`), {
            //     inlineVolume: true
            // });
            // audioplayer.play(resource);
            // console.log("Voice connection has been successful!");

            // connection.on('stateChange', (oldState, newState) => {
            //     console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
            // });
            // audioplayer.on('stateChange', (oldState, newState) => {
            //     console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
            //     if (newState.status === "idle") {
            //         audioplayer.play(voice.createAudioResource(fs.createReadStream(`./Audio/${song}.opus`), { inlineVolume: true }));
            //     };
            // });
            // return interaction.reply({ content: "Action Successful", ephemeral });
        };

        // Stop
        if (cmd === "stop") {
            return interaction.reply({ content: "Command currently disabled", ephemeral });

            // const connection = voice.getVoiceConnection("927257132624130119");
            // if (connection) {
            //     connection.destroy();
            //     console.log('Disconnected from voice!');
            // };
            // return interaction.reply({ content: "Action Successful", ephemeral });
        };

        // Mail
        if (cmd === "mail" || cmd === "mailbox" || cmd === "gift") {
            args = args.join(" ").split("-BR-");
            if (!args[0] || !args[1] || !args[2]) return interaction.reply({ content: "Sending Gifts\n> `/admin gift <type>-BR-<rewards>-BR-<message>`\n> `/admin cmd args[0] args[1] args.slice(2)`\n\nTypes:\n> 1 = xp\n> 2 = coins\n> 3 = ss shard|s shard|a shard|b shard|c shard|d shard\n> 4 = ss ticket|s ticket|a ticket|b ticket|c ticket|d ticket\n> 5 = lb\n> 6 = char\n> 7 = skin\n> 8 = item\n> 9 = gems\n> 10 = marks\n> 11 = skillpts\n\nExamples:\n> `/admin gift 1,2,8-BR-xp|50,coins|500,item|458|3-BR-Thank you for playing!`", ephemeral });

            const mail = { "type": args[0], "rewards": args[1], "message": args.slice(2).join(""), "date": new Date().getTime() };

            // Update users table
            await updateUsers(user ? user.id : "*", {
                mailbox: { type: "append", value: [mail] }
            });

            return interaction.reply({ content: `Action Successful: Sent mail to ${user ? user.toString() : "all users"}`, ephemeral });
        };

        // Mail
        if (cmd === "giftguild") {
            const guildid = args.shift();
            args = args.join(" ").split("-BR-");
            if (!args[0] || !args[1] || !args[2]) return interaction.reply({ content: "Sending Gifts\n> `/admin giftguild <guild_id> <type>-BR-<rewards>-BR-<message>`\n> `/admin cmd args[0] args[1] args[2] args.slice(3)`\n\nTypes:\n> 1 = xp\n> 2 = coins\n> 3 = ss shard|s shard|a shard|b shard|c shard|d shard\n> 4 = ss ticket|s ticket|a ticket|b ticket|c ticket|d ticket\n> 5 = lb\n> 6 = char\n> 7 = skin\n> 8 = item\n> 9 = gems\n\nExamples:\n> `/admin giftguild 12wG2 1,2,8-BR-xp|50,coins|500,item|458|3-BR-Thank you for playing!`", ephemeral });

            const guild = guildid ? await getGuildSchema(guildid) : undefined;
            if (!guild) return interaction.reply({ content: `Couldn't find guild \`${guildid}\``, ephemeral });

            const mail = { "type": args[0], "rewards": args[1], "message": args.slice(2).join(""), "date": new Date().getTime() };

            // Update users table
            await updateUsers(guild.members, {
                mailbox: { type: "append", value: [mail] }
            });

            return interaction.reply({ content: `Action Successful: Sent mail to guild **${guild.name}**`, ephemeral });
        };

        // Set Class Level
        if (cmd === "clvl") {
            if (!user || !args[0]) return interaction.reply({ content: `format: \`/admin clvl <cid> <level>\``, ephemeral });

            const stats = await getUserSchema(user.id);
            if (!stats || !(args[0] in stats.dungeon_classlevels)) return interaction.reply({ content: `${user.username} doesn't have class ${args[0]}`, ephemeral });

            stats.dungeon_classlevels[args[0]] = classLevelToXP(parseInt(args[1]));

            // Update users table
            await updateUsers(user.id, {
                dungeon_classlevels: { type: "set", value: stats.dungeon_classlevels }
            });

            return interaction.reply({ content: "Action Successful", ephemeral });
        };

        // Send DM
        if (cmd === "dm") {
            if (user) {
                try {
                    await user.send(args.join(" "));
                    return interaction.reply({ content: "Action Successful", ephemeral });
                } catch {
                    return interaction.reply({ content: "Action Failed", ephemeral });
                };
            } else {
                return interaction.reply({ content: "Please specify a user to send a DM to", ephemeral });
            };
        };

        // Query DB
        if (cmd === "query") {
            const flags = args.filter(arg => arg.startsWith("--")).map(flag => flag.slice(2));
            args = args.filter(arg => !arg.startsWith("--"));

            if (args[0].toUpperCase() === "DROP") return interaction.reply({ content: "not allowed", ephemeral });
            const res = await query(args.join(" ") + (user ? ` WHERE id = '${user.id}'` : ""));

            if (Array.isArray(res)) {
                if (flags.includes("txt")) {
                    const attachment = new AttachmentBuilder(Buffer.from(JSON.stringify(res, null, 2) ?? "", 'utf-8'), { name: 'data.txt' });
                    return interaction.reply({ files: [attachment], content: JSON.stringify(res).slice(0, 2000), ephemeral });
                };
                return interaction.reply({ content: JSON.stringify(res).slice(0, 2000), ephemeral });
            };
            return interaction.reply({ content: "Action Successful", ephemeral });
        };

        // Get DB Size
        if (cmd === "db_size") {
            const [res] = await query(`SELECT pg_size_pretty(pg_database_size($1)) as size`, ["earnalot"]) as any[];
            return interaction.reply({ content: `DB size: ${res.size}`, ephemeral });
        };

        // See transactions
        if (action === "transactions" || action === "purchased" || action === "paid") {
            if (user) {
                const stats = await getUserTransaction(user.id);
                if (!stats) return interaction.reply({ content: `User ${user.toString()} is not a player.`, ephemeral });
                return interaction.reply({ content: `**${user.username}'s transactions**\n\nTransactions: ${stats.transactions.length}\nDonated total: $${stats.transactions.reduce((acc, transaction) => acc + parseInt(transaction.price), 0)}`, ephemeral });
            };

            // Leaderboard
            const stats: (Pick<UserSchema, "rowid" | "id" | "name" | "transactions"> & { donated?: number; })[] = await getUserTransactions("*");
            stats.forEach((stat) => { stat.donated = stat.transactions.reduce((acc, transaction) => acc + parseInt(transaction.price), 0); });
            stats.sort((a, b) => (b.donated ?? 0) - (a.donated ?? 0));

            return interaction.reply({ content: `**Top Donators** (total: $${stats.reduce((acc, stat) => acc + (stat.donated ?? 0), 0)})\n\n${stats.slice(0, 20).map((e, i) => `${i + 1}) ${e.name} ➜ $${e.donated}`).join("\n")}`, ephemeral });
        };

        // Ban Players
        if (cmd === "ban" || cmd === "blacklist" || cmd === "suspend") {
            if (!user || user.bot || user.id === "489490486734880774") return interaction.reply({ content: `No <:kek:927271748385243206>`, ephemeral });

            const blacklist = JSON.parse(fs.readFileSync('Storage/blacklist.json', 'utf8'));
            blacklist[user.id] = args.length ? ` ${args.join(" ")}` : "";

            fs.writeFile('Storage/blacklist.json', JSON.stringify(blacklist), (err) => {
                if (err) console.error(err);
            });

            return interaction.reply({ content: `${user.username} was banned from using Camelot`, ephemeral });
        };

        // Unban Players
        if (cmd === "unban") {
            if (!user || user.bot || user.id === "489490486734880774") return interaction.reply({ content: `Please specify a valid user to unban\nUsage: \`/admin unban user:<user>\``, ephemeral });

            const blacklist = JSON.parse(fs.readFileSync('Storage/blacklist.json', 'utf8'));
            delete blacklist[user.id];
            fs.writeFile('Storage/blacklist.json', JSON.stringify(blacklist), (err) => {
                if (err) console.error(err);
            });
            return interaction.reply({ content: `${user.username} was unbanned`, ephemeral });
        };

        // Dungeon Ban Players
        if (cmd === "dban") {
            if (!user || user.bot) return interaction.reply({ content: `Please specify a valid user to dungeon ban\nUsage: \`/admin dban user:<user>\``, ephemeral });

            let bantime = parseInt(args[0] || "20");
            if (!bantime || bantime < 1) bantime = 20;

            requestVerification.set(user.id, { repeats: 4, timeout: setTimeout(() => requestVerification.delete(user?.id), 60 * 60 * 1000) });

            clearTimeout(dungeonTempBan.get(user.id)?.timeout);
            dungeonTempBan.set(user.id, { ends: Date.now() + (bantime * 60 * 1000), timeout: setTimeout(() => dungeonTempBan.delete(user?.id), bantime * 60 * 1000) });

            return interaction.reply({ content: `${user.username} was banned from using \`/dungeon\` for **${bantime}** min`, ephemeral });
        };

        // Dungeon Unban Players
        if (cmd === "dunban") {
            if (!user || user.bot) return interaction.reply({ content: `Please specify a valid user to dungeon unban\nUsage: \`/admin dunban user:<user>\``, ephemeral });

            clearTimeout(requestVerification.get(user.id)?.timeout);
            requestVerification.delete(user.id);

            clearTimeout(dungeonTempBan.get(user.id)?.timeout);
            dungeonTempBan.delete(user.id);

            return interaction.reply({ content: `${user.username} was unbanned from using \`/dungeon\``, ephemeral });
        };

        // See transactions
        if (cmd === "transfer") {
            if (!user || user.bot) return interaction.reply({ content: `**Usage**: \`/admin transfer <new_id> user:<old_user>\``, ephemeral });
            if (!args[0] || !/^\d+$/.test(args[0])) return interaction.reply({ content: `**Usage**: \`/admin transfer <new_id> user:<old_user>\``, ephemeral });

            const userExists = await doesUserExist(user.id);
            if (!userExists) return interaction.reply({ content: `User ${user.toString()} is not a player.`, ephemeral });

            return interaction.reply({ content: `Are you sure you want to proceed transferring account details?\nOld Account: ${user.toString()}\nNew Account: <@${args[0]}>`, components: [OfferRow], ephemeral }).then((msg) => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 30000 });

                collector.on('collect', async r => {
                    collector.stop();
                    if (r.customId === "cancel") return interaction.followUp({ content: "Action cancelled", ephemeral });
                    if (!user || !args[0]) return interaction.followUp({ content: "Action failed", ephemeral });

                    try {
                        await transferAccount(user.id, args[0]);
                        return interaction.followUp({ content: `Transfer successful!\nOld Account: ${user.toString()}\nNew Account: <@${args[0]}>`, ephemeral });
                    } catch {
                        return interaction.followUp({ content: `Transfer failed`, ephemeral });
                    };
                });
            });
        };

        // // Recover Deleted Items
        // if (cmd === "recover") {
        //     if (!user || user.bot) return interaction.reply({ content: `**Usage**: \`/admin recover user:<user>\``, ephemeral });

        //     db.serialize(async () => {
        //         if (args[0] === "--save") {
        //             // Write to JSON
        //             let recover = await query(`SELECT * FROM weapons WHERE id = '759855947920310393'`);

        //             fs.writeFile('Storage/recover.json', JSON.stringify(recover), (err) => {
        //                 if (err) console.error(err);
        //             });
        //             return interaction.reply({ content: `Saved **${user.username}**'s items to recover.json`, ephemeral });
        //         };

        //         let recover = JSON.parse(fs.readFileSync('Storage/recover.json', 'utf8'));

        //         await query(`DELETE FROM weapons WHERE id = ${user.id}`);

        //         for (const rec of recover) {
        //             await query(`INSERT INTO weapons (id, itemid, uniqueid, level, ascension, purity, character, substats) values ('${rec.id}', ${rec.itemid}, '${rec.uniqueid}', ${rec.level}, ${rec.ascension}, ${rec.purity}, ${rec.character}, ${rec.substats ? `'${rec.substats}'` : "NULL"})`);
        //         };

        //         return interaction.reply({ content: `Successfully recovered **${user.username}**'s items`, ephemeral });
        //     });
        // };

        // Give mod perms
        if (cmd === "promote") {
            if (!user || user.bot) return interaction.reply({ content: `Please specify a valid user to promote\nUsage: \`/admin promote <1-5> user:<user>\`\nExample: \`/admin promote 2 user:\``, ephemeral });
            if (!args[0] || isNaN(parseInt(args[0])) || parseInt(args[0]) > 5 || parseInt(args[0]) < 1) return interaction.reply({ content: `Please input a number between 1 (lowest) to 5 (highest)\nExample: \`/admin promote 2 user:\``, ephemeral });

            const moderators = JSON.parse(fs.readFileSync('Storage/moderators.json', 'utf8'));
            moderators[user.id] = parseInt(args[0]);

            fs.writeFile('Storage/moderators.json', JSON.stringify(moderators), (err) => {
                if (err) console.error(err);
            });

            return interaction.reply({ content: `${user.username} was promoted to ${args[0]}`, ephemeral });
        };

        // Take mod perms
        if (cmd === "demote") {
            if (!user || user.bot) return interaction.reply({ content: `Please specify a valid user to demote\nUsage: \`/admin demote user:<user>\``, ephemeral });

            const moderators = JSON.parse(fs.readFileSync('Storage/moderators.json', 'utf8'));
            delete moderators[user.id];
            fs.writeFile('Storage/moderators.json', JSON.stringify(moderators), (err) => {
                if (err) console.error(err);
            });
            return interaction.reply({ content: `${user.username} was demoted in mod rank`, ephemeral });
        };

        // Edit Rolling Cow
        if (cmd === "cow") {
            if (!args[0]) return interaction.reply({ content: `Start or edit \`/rolling cow\` settings\n\n**Usage**: \`/cow [start|view|edit] --flags:<param>\`\n\n**Flags**\n\`days\`: number\n\`rollsPerDay\`: number\n\`fightsPerCharacter\`: number\n\`timeInMinutes\`: number\n\`level\`: number\n\`clvl\`: number\n\`goldenCowChance\`: number (0-1)`, ephemeral });

            if (args[0] === "start") {
                // Update users table
                await updateUsers("*", {
                    cow_participation: { type: "set", value: null },
                    cow_chars: { type: "set", value: [] },
                    cow_timer: { type: "set", value: null },
                    cow_rolled_today: { type: "set", value: 0 },
                });

                cowSettings.start = Date.now();
                fs.writeFile('Storage/rolling.json', JSON.stringify(cowSettings), (err) => {
                    if (err) console.error(err);
                });

                return interaction.reply({ content: `Reset and started \`/rolling cow\` with settings:\n\n${JSON.stringify(cowSettings)}`, ephemeral });
            };

            // View raw settings
            if (args[0] === "view") {
                return interaction.reply({ content: `Rolling Cow Settings:\n\n${JSON.stringify(cowSettings)}`, ephemeral });
            };

            // Update flags
            if (args[0] === "edit") {
                const flags = args.filter((s) => s.startsWith("--")).map((s) => s.slice(2));

                for (const flag of flags) {
                    const [key, val] = flag.split(":");
                    if (key in cowSettings) {
                        cowSettings[key] = isNaN(parseFloat(val)) ? val : parseFloat(val);
                    };
                };

                fs.writeFile('Storage/rolling.json', JSON.stringify(cowSettings), (err) => {
                    if (err) console.error(err);
                });

                return interaction.reply({ content: `Edited \`/rolling cow\` settings:\n\n${JSON.stringify(cowSettings)}`, ephemeral });
            };
        };

        // Repeat text
        if (cmd === "say") {
            if (interaction.channel?.isSendable()) {
                interaction.channel.send(args.join(" "));
                return interaction.reply({ content: "Message sent", ephemeral });
            } else {
                return interaction.reply({ content: "Cannot send messages in this channel", ephemeral });
            };
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

        // Response Time
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
            } else {
                const { reply, imageBuffer } = await getResponseData(user, flags);
                if (!reply && !imageBuffer) return interaction.reply({ content: "An error occured: No data available", ephemeral });

                if (!flags.find((e) => e.startsWith("txt"))) {
                    const attachment = imageBuffer ? [new AttachmentBuilder(imageBuffer, { name: 'graph.png' })] : undefined;
                    return interaction.reply({ content: reply, files: attachment, ephemeral });
                };

                const attachment = new AttachmentBuilder(Buffer.from(reply ?? "", 'utf-8'), { name: 'response.txt' });
                return interaction.reply({ files: [attachment], ephemeral });
            };
        };

        async function sendDmWarning(user: User, type: string) {
            if (type === "botting") {
                user.send(`Hey ${user.username}, you've been caught botting (using self-bots, macros, scripts or similar to automate your progress) which is strictly against our [Terms of Service](<https://rank.top/bot/camelot?page=terms>). Your account has been penalized accordingly. Please refrain from breaking any more terms in the future. Thank you for your understanding <a:GabrielBow:1045095869306912881>\n\n-# If you want to appeal this decision, please open a ticket on our [Support Server](<https://discord.gg/myy9PBCdEW>). Keep in mind that false appeals can increase your penalty.`);

                const chnl = user.client.channels.cache.find(channel => channel.id === "1148646565276299405");

                const { reply } = await getResponseData(user);
                if (chnl?.isSendable()) chnl.send(reply ?? "error getting response data");
                const { imageBuffer } = await getResponseData(user, ["graph"]);
                if (chnl?.isSendable()) {
                    const attachment = imageBuffer ? [new AttachmentBuilder(imageBuffer, { name: 'graph.png' })] : undefined;
                    if (attachment) chnl.send({ files: attachment });
                };

                // Update users table

                await updateUsers(user.id, {
                    dungeon_responsetime: { type: "set", value: [] },
                });
            };

            if (type === "alting") {
                user.send(`Hey ${user.username}, you've been caught alting (using alternative accounts to help your main account progress) which is strictly against our [Terms of Service](<https://rank.top/bot/camelot?page=terms>). Your account has been penalized accordingly. Please refrain from breaking any more terms in the future. Thank you for your understanding <a:GabrielBow:1045095869306912881>\n\n-# If you want to appeal this decision, please open a ticket on our [Support Server](<https://discord.gg/myy9PBCdEW>). Keep in mind that false appeals can increase your penalty.`);
            };

            if (type === "tos") {
                user.send(`Hey ${user.username}, you've been caught breaking our [Terms of Service](<https://rank.top/bot/camelot?page=terms>). Your account has been penalized accordingly. Please refrain from breaking any more terms in the future. Thank you for your understanding <a:GabrielBow:1045095869306912881>\n\n-# If you want to appeal this decision, please open a ticket on our [Support Server](<https://discord.gg/myy9PBCdEW>). Keep in mind that false appeals can increase your penalty.`);
            };

            return;
        };

        // Warn
        if (cmd === "warn") {
            if (!args[0] || !user) return interaction.reply({ content: "Usage: `/admin action:warn <option>`\n\n**Options**\n`botting`\n`alting`\n`tos`", ephemeral });

            await sendDmWarning(user, args[0]);

            switch (args[0]) {
                case "botting": return interaction.reply({ content: `Successfully warned ${user.username} for botting`, ephemeral });
                case "alting": return interaction.reply({ content: `Successfully warned ${user.username} for alting`, ephemeral });
                case "tos": return interaction.reply({ content: `Successfully warned ${user.username} for breaking the ToS`, ephemeral });
            };
        };

        // Penalize
        if (cmd === "penalize" || cmd === "punish" || cmd === "penalty") {
            if (!args[0] || !user) return interaction.reply({ content: "Usage: `/admin action:penalty <option>`\n\n**Options**\n`botting`\n`alting`\n`tos`", ephemeral });

            // Send DM
            await sendDmWarning(user, args[0]);

            // Apply penalties
            await updateUsers(user.id, {
                coins: { type: "set", value: 0 },
                bank: { type: "set", value: 0 },
            });

            if (args[0] === "botting") {
                const stats = await getUserSchema(user.id);
                if (stats && stats.class !== null) {
                    stats.dungeon_classlevels[stats.class] = Math.floor(stats.dungeon_classlevels[stats.class] * 0.4); // classLevelToXP(parseInt(args[1]));

                    // Update users table
                    await updateUsers(user.id, {
                        dungeon_classlevels: { type: "set", value: stats.dungeon_classlevels },
                    });
                };
            };

            // Return
            switch (args[0]) {
                case "botting": return interaction.reply({ content: `Successfully penalized ${user.username} for botting`, ephemeral });
                case "alting": return interaction.reply({ content: `Successfully penalized ${user.username} for alting`, ephemeral });
                case "tos": return interaction.reply({ content: `Successfully penalized ${user.username} for breaking the ToS`, ephemeral });
            };
        };

    },
};

export default exportCommand;
