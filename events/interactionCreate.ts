import fs from "fs";
import Package from '../package.json';
import { Interaction, EmbedBuilder, PermissionsBitField } from "discord.js";
import { BotEvent } from "../types";
import { query } from "../db_handler";

const userCooldown = new Map();
const channelCooldown = new Set();

const event: BotEvent = {
    name: "interactionCreate",
    execute: async (interaction: Interaction) => {

        // if (interaction.user.id === "489490486734880774") {
        //     interaction.user.id = "489490486734880782";
        // };

        // Defer Buttons
        if (interaction.isButton()) {
            if (interaction.customId?.startsWith("ignore_defer")) return;
            await interaction.deferUpdate().catch(() => {
                console.log(`ERROR Interaction Failed 'deferUpdate()' on "${interaction.customId}"`);
            });

            if (interaction.customId?.startsWith("ref-")) {
                const [, commandName] = interaction.customId.split("-");
                interaction.client.commands.get(commandName)?.executeButtonInteraction(interaction);
            };
        };

        // Auto Complete
        if (interaction.isAutocomplete()) {
            // const focusedValue = interaction.options.getFocused();
            const choices = await interaction.client.commands.get(interaction.commandName)?.autocomplete({ interaction });
            return interaction.respond(choices.slice(0, 25));
            // return interaction.respond(choices.filter((e) => e.name.toLowerCase().includes(focusedValue.toLowerCase())).slice(0, 25));
        };

        // return setTimeout(async () => {
        //     try {
        //         await interaction.reply({content:"test failed messages", ephemeral:true});
        //     } catch (err) {
        //         console.log("err");
        //         interaction.channel.send("There has been an error sending the response")
        //     };
        // }, 5000);

        if (interaction.isChatInputCommand()) {
            // Exit and stop if it's not there
            if (interaction.user.bot) return;
            if (!interaction.guild) return interaction.reply({ content: `Please use the bot on a server.`, ephemeral: true });
            if (interaction.guild.members.me?.isCommunicationDisabled()) return;
            if (!interaction.guild.members.me?.permissions.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.UseExternalEmojis, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.AttachFiles])) {
                if (interaction.guild.members.me?.permissions.has([PermissionsBitField.Flags.SendMessages])) interaction.channel?.send("Camelot needs the following permissions to work\n- Send Messages\n- View Channel\n- Use External Emojis\n- Embed Links\n- Attach Files");
                return;
            };

            // Blacklist
            const blacklist = JSON.parse(fs.readFileSync('Storage/blacklist.json', 'utf8'));
            if (interaction.user.id in blacklist) return interaction.reply(`Your account has been suspended${blacklist[interaction.user.id]}.\nIf you believe there to be a mistake, please join the support server below to appeal for this decision.\n**Support Server**: https://discord.gg/myy9PBCdEW`);

            // Spam Control (User)
            if (userCooldown.has(interaction.user.id)) {
                const cd = userCooldown.get(interaction.user.id);
                if (interaction.commandName !== "pull") cd.count++;

                if (cd.count >= 4) {
                    clearTimeout(cd.timeout);
                    cd.timeout = setTimeout(() => userCooldown.delete(interaction.user.id), 3200);
                    if (cd.count === 4 || cd.count === 10) return interaction.reply({ content: `Woah, you're being too fast! Please wait a few seconds.`, ephemeral: true });
                    if (cd.count > 10) return;
                };
            } else {
                userCooldown.set(interaction.user.id, {
                    count: 1,
                    timeout: setTimeout(() => userCooldown.delete(interaction.user.id), 7500)
                });
            };

            // Spam Control (Channel)
            if (interaction.channel) {
                const channelId = interaction.channel.id;
                if (channelCooldown.has(channelId)) return;
                channelCooldown.add(channelId);
                setTimeout(() => channelCooldown.delete(channelId), 750);
            }

            // ADMIN ACTIONS
            if (interaction.commandName === "admin") {
                return interaction.client.commands.get('admin').execute(interaction, interaction.client);
            };

            // Ping!
            if (interaction.commandName === "ping") {
                return interaction.reply({ content: "pong! 🏓" + Math.floor(interaction.client.ws.ping) + "ms" });
            };

            // Support Server
            if (interaction.commandName === "support") {
                const Embed = new EmbedBuilder()
                    .setTitle("Camelot Support")
                    .setColor(0xbbffff)
                    .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                    .setDescription("Join our support server to reach us!\nYou can ask for help and help us improve the bot <:RaphiSmile:868998036645380197>\n\nServer Link: https://discord.gg/myy9PBCdEW")
                    .setFooter({ text: `Camelot ${Package.version} • Made by Apollo24 & PokeLinker`, iconURL: "https://i.imgur.com/RbLjdQ4.png" });
                return interaction.reply({ embeds: [Embed] });
            };

            // ADD NEW PLAYERS
            const entryExists = await query(`SELECT name FROM users WHERE id = ${interaction.user.id}`); // Check if user exists in the db
            if (entryExists.length) { // Update username if changed
                if (entryExists[0].name !== interaction.user.username) await query(`UPDATE users SET name = "${interaction.user.username}" WHERE id = ${interaction.user.id}`, 'run');
            } else { // Add new player if not exists
                await query(`INSERT INTO users (id, name, created) VALUES (${interaction.user.id}, "${interaction.user.username}", "${new Date().toISOString().replace('T', ' ').slice(0, 19)}")`, 'run');
                await query(`INSERT INTO characters (id) VALUES (${interaction.user.id})`, 'run');
                await query(`INSERT INTO dungeon (id) VALUES (${interaction.user.id})`, 'run');
            };
            // ADD NEW SERVERS
            const serverExists = await query(`SELECT user_ids FROM servers WHERE id = ${interaction.guild.id}`); // Check if server exists in the db
            if (serverExists.length) { // Add players to guild
                if (!serverExists[0].user_ids.split(",").includes(interaction.user.id)) await query(`UPDATE servers SET user_ids = "${serverExists[0].user_ids + "," + interaction.user.id}" WHERE id = ${interaction.guild.id}`, 'run');
            } else { // Add new server if not exists
                await query(`INSERT INTO servers (id, name, user_ids) VALUES (${interaction.guild.id}, "${interaction.guild.name.split('"').join('""')}", "${interaction.user.id}")`, 'run');
            };

            // TUTORIAL
            const { 0: userStats } = await query(`SELECT tutorial, mailbox, mailreceived FROM users WHERE id = ${interaction.user.id}`);
            userStats.tutorial = JSON.parse(userStats.tutorial);
            if (!([0, 1, 2, 3, 4, 5, 6, 7].every((e) => userStats.tutorial.includes(e)))) return interaction.client.commands.get('tutorial').execute(interaction);

            // Check new mails
            userStats.mailbox = JSON.parse(userStats.mailbox);
            if (userStats.mailbox.length > userStats.mailreceived) {
                await query(`UPDATE users SET mailreceived = ${userStats.mailbox.length} WHERE id = ${interaction.user.id}`);
                setTimeout(() => {
                    interaction.channel?.send(interaction.user.toString() + " you have received a **new mail**! Open it using </profile:1010583712527810641>");
                }, 1000);
            };

            // Execute command
            if (interaction.commandName === "arena" && interaction.options.getUser('user')?.id === "706183309943767112") return interaction.client.commands.get('trial').execute(interaction);
            if (interaction.commandName === "boss" && interaction.options.getSubcommand() === "hunt") return interaction.client.commands.get('bosshunt').execute(interaction);
            else interaction.client.commands.get(interaction.commandName)?.execute(interaction);
        };

    },
};

export default event;
