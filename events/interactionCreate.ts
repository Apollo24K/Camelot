import { Interaction, PermissionsBitField } from "discord.js";
import { BotEvent, CompactUserSchema, ServerSchema, SlashCommand } from "../types";
import { addUserToServer, getServerSchema, getUserSchema, insertNewServer, insertNewUser, updateUsersAndCache } from "../Modules/queries";
import { daysSince } from "../Modules/functions";

const userCooldown = new Map();
const channelCooldown = new Set();

const event: BotEvent = {
    name: "interactionCreate",
    execute: async (interaction: Interaction) => {

        // if (interaction.user.id === "489490486734880774") {
        //     interaction.user.id = "447160532286570506";
        // };

        // Defer Buttons
        if (interaction.isButton()) {
            if (interaction.customId?.startsWith("ignore_defer")) return;
            await interaction.deferUpdate().catch(() => {
                console.log(`ERROR Interaction Failed 'deferUpdate()' on "${interaction.customId}"`);
            });

            if (interaction.customId?.startsWith("ref-")) {
                const [, commandName] = interaction.customId.split("-");
                const command = interaction.client.slashCommands.get(commandName) as SlashCommand | undefined;
                if (command) return command.executeButtonInteraction?.({ interaction });
            };
        };

        // Auto Complete
        if (interaction.isAutocomplete()) {
            const command = interaction.client.slashCommands.get(interaction.commandName) as SlashCommand | undefined;
            if (command?.autocomplete) {
                const choices = await command.autocomplete({ interaction });
                interaction.respond(choices.slice(0, 25));
            };
            return;
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
                if (interaction.guild.members.me?.permissions.has([PermissionsBitField.Flags.SendMessages]) && interaction.channel?.isSendable()) interaction.channel.send("Camelot needs the following permissions to work\n- Send Messages\n- View Channel\n- Use External Emojis\n- Embed Links\n- Attach Files");
                return;
            };

            // Blacklist
            if (interaction.client.blacklist.has(interaction.user.id)) {
                return interaction.reply(`Your account has been suspended${interaction.client.blacklist.get(interaction.user.id)}.\nIf you believe there to be a mistake, please join the support server below to appeal for this decision.\n**Support Server**: https://discord.gg/myy9PBCdEW`);
            };

            // Spam Control (User)
            const bypassedCommands = ["admin", "balance", "buy", "camelot", "guess", "info", "item", "mod", "pull", "rp", "shop"];
            if (userCooldown.has(interaction.user.id)) {
                const cd = userCooldown.get(interaction.user.id);
                if (!bypassedCommands.includes(interaction.commandName)) cd.count++;

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

            // Get command
            const isNPCArena = (interaction.commandName === "arena" && interaction.options.getUser('user')?.id === interaction.client.user.id);
            const commandName = isNPCArena ? "npc-arena" : interaction.commandName;
            const command = interaction.client.slashCommands.get(commandName) as SlashCommand | undefined;
            if (!command) return;

            // Get cached user and server
            const CACHE_TIME = 5 * 60 * 1000;
            const cachedUser = interaction.client.userCache.get(interaction.user.id);
            const useCachedUser = ((command.skipUserRefetch && cachedUser && (cachedUser.t > (Date.now() - CACHE_TIME))) ? cachedUser.o : undefined);
            const cachedServer = interaction.client.serverCache.get(interaction.guild.id);
            const useCachedServer = ((command.skipServerRefetch && cachedServer && (cachedServer.t > (Date.now() - CACHE_TIME))) ? cachedServer.o : undefined);

            // ADD NEW PLAYERS
            const author = {
                schema: useCachedUser ?? await getUserSchema(interaction.user.id) ?? await insertNewUser(interaction.user.id, interaction.user.username),
            };
            if (author.schema.name !== interaction.user.username) author.schema = await insertNewUser(interaction.user.id, interaction.user.username);

            // Cache for 5 minutes
            if (!cachedUser || cachedUser.t < (Date.now() - CACHE_TIME)) {
                interaction.client.userCache.set(interaction.user.id, { o: author.schema, t: Date.now() });
                setTimeout(() => interaction.client.userCache.delete(interaction.user.id), CACHE_TIME);
            };

            // ADD NEW SERVERS
            const server = {
                schema: useCachedServer ?? await getServerSchema(interaction.guild.id) ?? await insertNewServer(interaction.guild.id, interaction.guild.name, interaction.user.id),
            };
            if (!server.schema.user_ids.includes(interaction.user.id)) await addUserToServer(interaction.guild.id, interaction.user.id);

            // Cache for 5 minutes
            if (!cachedServer || cachedServer.t < (Date.now() - CACHE_TIME)) {
                interaction.client.serverCache.set(interaction.guild.id, { o: server.schema, t: Date.now() });
                setTimeout(() => interaction.guild ? interaction.client.serverCache.delete(interaction.guild.id) : undefined, CACHE_TIME);
            };

            // TUTORIAL
            if (!([0, 1, 2, 3, 4, 5, 6, 7].every((e) => author.schema.tutorial.includes(e)))) {
                const tutorialCommand = interaction.client.slashCommands.get("tutorial") as SlashCommand | undefined;
                if (tutorialCommand) return tutorialCommand.execute({ interaction, author, server, locale: 'en_US' });
            };

            // Login rewards
            let delayForLoginRewards = false;
            const daysSinceLastLogin = daysSince(author.schema.lastonline ?? new Date());
            if (author.schema.lastonline === null || daysSinceLastLogin) {
                // New player bonuses
                const accountAge = daysSince(author.schema.created);
                if (accountAge < 30) {
                    // do something
                };

                await updateUsersAndCache(interaction.client, interaction.user.id, {
                    updates: {
                        lastonline: { type: "set", value: new Date() },
                    },
                });
            };

            // Check new mails
            if (author.schema.mailbox.length > author.schema.mailreceived) {
                await updateUsersAndCache(interaction.client, interaction.user.id, {
                    updates: {
                        mailreceived: { type: 'set', value: author.schema.mailbox.length },
                    },
                });
                setTimeout(() => {
                    if (interaction.channel?.isSendable()) interaction.channel.send(interaction.user.toString() + " you have received a **new mail**! Open it using </profile:1010583712527810641>");
                }, delayForLoginRewards ? 1800 : 1000);
            };

            // Execute slash command
            return command.execute({ interaction, author, server, locale: 'en_US' });
        };

    },
};

export default event;
