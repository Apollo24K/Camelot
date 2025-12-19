import { EmbedBuilder, ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ColorResolvable } from "discord.js";
import { characters } from "../Modules/chars";
import { abilities } from "../Modules/abilities";
import { OfferRow } from "../Modules/components";
import { SlashCommand } from "../types";
import { deleteParty, getPartyMembers, getPartySchema, getUserSchema, insertNewParty, updateParties, updateUsersAndCache } from "../Modules/queries";

const exportCommand: SlashCommand = {
    name: 'party',
    async execute({ interaction, author }) {

        let subcommand = interaction.options.getSubcommand();

        const stats = author.schema;

        // Item info
        if (subcommand === "create") {
            const name = interaction.options.getString('name', true);
            if (name.length > 20) return interaction.reply(`Party names can't be longer than 20 characters (current length: ${name.length})`);

            if (stats.party) return interaction.reply(`You are already in a party, please leave your current one if you want to create a new party.`);
            if (stats.cow_participation !== null) return interaction.reply(`You can't change your party till \`/rolling cow\` is over.`);

            // Insert new party
            const party = await insertNewParty(name, [interaction.user.id]);

            // Update users table
            await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates: {
                    party: { type: "set", value: party.id },
                },
            });

            return interaction.reply(`Successfully created party "${name}" <:kawaiicheer:928369628122583050>\nInvite other players to join you!`);
        } else if (subcommand === "view") {
            const user = interaction.options.getUser('user') ?? interaction.user;

            const stats = await getUserSchema(user.id);
            if (!stats || stats.party === null) return interaction.reply(`${user.id === interaction.user.id ? "You are not" : user.username + " is not"} in a party.\nCreate one using \`/party create\`!`);

            const party = await getPartySchema(stats.party);
            if (!party) return interaction.reply(`Couldn't find party of ${user.username}`);

            const members = await getPartyMembers(party.id);

            const Embed = new EmbedBuilder()
                .setTitle(party.name)
                .setColor(party.color as ColorResolvable || 0xbbffff)
                .setThumbnail(party.icon ?? "https://i.imgur.com/JEvfGSR.png")
                .setImage(party.banner || null)
                .setDescription(`${party.description?.replace(/\\n/g, "\n") || "_Missing description. Use `/party edit` to add one._"}\n\n**Capacity**: \`${members.length}/4\``)
                .addFields(
                    { name: "Members", value: `${members.map((e) => e.name).join("\n")}`, inline: true },
                    { name: "Selected Character", value: `${members.map((e) => `${(abilities?.[e.stampedechar ?? "-1"]?.party) ? "✨ " : "<:blank:917804200363171860> "}__${characters?.[e.stampedechar ?? "-1"]?.name || "None"}__`).join("\n")}`, inline: true },
                );
            return interaction.reply({ embeds: [Embed] });
        } else if (subcommand === "edit") {
            const setting = interaction.options.getString('setting', true);
            const input = interaction.options.getString('input', true);

            if (!stats.party) return interaction.reply(`You are not in a party. Create one using \`/party create\`!`);

            const party = await getPartySchema(stats.party);
            if (!party) return interaction.reply(`Couldn't find party with ID \`${stats.party}\``);

            if (setting === "color") {
                if (!input.match(/^#([0-9a-f]{3}){1,2}$/i)) return interaction.reply(`Please use a valid hex color code.\nExamples: \`#112358\`, \`#bbffff\`, \`#abc\``);

                // Update parties table
                await updateParties(party.id, {
                    color: { type: "set", value: input }
                });

                interaction.reply(`Changed embed color to \`${input}\`!`);
            };

            if (setting === "description") {
                if (input.length > 200) return interaction.reply(`Your party description can contain a maximum of 200 characters (current length: ${input.length})`);

                // Update parties table
                await updateParties(party.id, {
                    description: { type: "set", value: input }
                });

                return interaction.reply(`Changed party description to\n> "${input}"`);
            };

            if (setting === "rename") {
                if (input.length > 20) return interaction.reply(`Party names can't be longer than 20 characters (current length: ${input.length})`);

                // Update parties table
                await updateParties(party.id, {
                    name: { type: "set", value: input }
                });

                return interaction.reply(`Changed party name to **${input}**`);
            };

            if (setting === "icon") {
                if (input.length > 100) return interaction.reply(`Party icon url can't be longer than 100 characters (current length: ${input.length})`);
                if (!(input.startsWith("https://i.ibb.co/") || input.startsWith("https://i.imgur.com/") || input.startsWith("https://imgur.com/"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com");
                if (!(input.endsWith(".png") || input.endsWith(".jpg") || input.endsWith(".jpeg") || input.endsWith(".gif"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com that ends with .png, .jpg, .jpeg or .gif");

                // Update parties table
                await updateParties(party.id, {
                    icon: { type: "set", value: input }
                });

                interaction.reply(`Changed party icon to <${input}>`);

                // Image Log
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`ref-party-icon:${stats.party}`)
                            .setLabel(`Remove thumbnail`)
                            .setStyle(ButtonStyle.Secondary)
                    );

                const channel = interaction.client.channels.cache.find(channel => channel.id === "934117922039791627");
                const Embed = new EmbedBuilder()
                    .setColor(party.color as ColorResolvable || 0xbbffff)
                    .setThumbnail(input)
                    .setImage(party.banner || null)
                    .setTitle(party.name)
                    .setDescription(`ID: \`${party.id}\`\nParty: ${party.members.join(", ")}`)
                    .setFooter({ text: `Changed by ${interaction.user.username} | ${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
                if (channel?.isSendable()) return channel.send({ embeds: [Embed], components: [row] });
            };

            if (setting === "banner") {
                if (input.length > 100) return interaction.reply(`Party banner url can't be longer than 100 characters (current length: ${input.length})`);
                if (!input) {
                    // Update parties table
                    await updateParties(party.id, {
                        banner: { type: "set", value: null }
                    });

                    return interaction.reply(`Removed party banner`);
                };
                if (!(input.startsWith("https://i.ibb.co/") || input.startsWith("https://i.imgur.com/") || input.startsWith("https://imgur.com/"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com");
                if (!(input.endsWith(".png") || input.endsWith(".jpg") || input.endsWith(".jpeg") || input.endsWith(".gif"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com that ends with .png, .jpg, .jpeg or .gif");

                // Update parties table
                await updateParties(party.id, {
                    banner: { type: "set", value: input }
                });

                interaction.reply(`Changed party banner to <${input}>`);

                // Image Log
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`ref-party-banner:${stats.party}`)
                            .setLabel(`Remove banner`)
                            .setStyle(ButtonStyle.Secondary)
                    );

                const channel = interaction.client.channels.cache.find(channel => channel.id === "934117922039791627");
                const Embed = new EmbedBuilder()
                    .setColor(party.color as ColorResolvable || 0xbbffff)
                    .setTitle(party.name)
                    .setThumbnail(party.icon ?? "https://i.imgur.com/JEvfGSR.png")
                    .setImage(input)
                    .setDescription(`ID: \`${party.id}\`\nParty: ${party.members.join(", ")}`)
                    .setFooter({ text: `Changed by ${interaction.user.username} | ${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
                if (channel?.isSendable()) return channel.send({ embeds: [Embed], components: [row] });
            };
        } else if (subcommand === "join") {
            const user = interaction.options.getUser('user', true);
            if (user.id === interaction.user.id) return interaction.reply(`You can't join your own party.`);

            if (stats.party !== null) return interaction.reply(`You are already in a party, please leave it first.`);
            if (stats.cow_participation !== null) return interaction.reply(`You can't change your party till \`/rolling cow\` is over.`);

            const stats2 = await getUserSchema(user.id);
            if (!stats2 || stats2.party === null) return interaction.reply(`${user.username} is not in a party.`);
            if (stats2.cow_participation !== null) return interaction.reply(`You can't join this party till \`/rolling cow\` is over.`);

            const party = await getPartySchema(stats2.party);
            if (!party) return interaction.reply(`${user.username} is not in a party.`);

            if (party.members.length >= 4) return interaction.reply(`**${party.name}** already has 4 members.`);

            // Return if char already taken
            const chars = await getPartyMembers(party.id);
            if (stats.stampedechar !== null && chars.map((e) => e.stampedechar).includes(stats.stampedechar)) return interaction.reply(`Someone in your party (${chars.find((e) => e.stampedechar === stats.stampedechar)?.name}) has already selected **${characters[stats.stampedechar].name}**, please choose another character.`);

            return interaction.reply({ content: `${user.toString()} ${interaction.user.username} wants to join your party`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => party.members.includes(r.user.id) && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => (r.user.id === interaction.user.id || party.members.includes(r.user.id)) && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();

                    const party = stats2.party ? await getPartySchema(stats2.party) : null;
                    if (!party) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`${user.username} is not in a party.`);
                        return;
                    };

                    if (party.members.length >= 4) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`**${party.name}** already has 4 members.`);
                        return;
                    };

                    // Update parties table
                    await updateParties(party.id, {
                        members: { type: "append_unique", value: [interaction.user.id] }
                    });

                    // Update users table
                    await updateUsersAndCache(interaction.client, interaction.user.id, {
                        updates: {
                            party: { type: "set", value: party.id },
                        },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`**${interaction.user.username}** has joined **${party.name}**!`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });

            });
        } else if (subcommand === "invite") {
            const user = interaction.options.getUser('user', true);
            if (user.id === interaction.user.id) return interaction.reply(`You can't invite yourself`);

            if (stats.party === null) return interaction.reply(`You are not in a party. You can create one using \`/party create\``);
            if (stats.cow_participation !== null) return interaction.reply(`You can't invite players to your party till \`/rolling cow\` is over.`);

            const stats2 = await getUserSchema(user.id);
            if (stats2?.party !== null) return interaction.reply(`${user.username} is already in a party.`);
            if (stats2.cow_participation !== null) return interaction.reply(`${user.username} can't join a party till \`/rolling cow\` is over.`);

            const party = await getPartySchema(stats.party);
            if (!party) return interaction.reply(`${user.username} is not in a party.`);

            if (party.members.length >= 4) return interaction.reply(`**${party.name}** already has 4 members.`);

            // Return if char already taken
            const chars = await getPartyMembers(party.id);
            if (stats2.stampedechar !== null && chars.map((e) => e.stampedechar).includes(stats2.stampedechar)) return interaction.reply(`Someone in your party (${chars.find((e) => e.stampedechar === stats2.stampedechar)?.name}) has already selected **${characters[stats2.stampedechar].name}**, please choose another character.`);

            return interaction.reply({ content: `${user.toString()} ${interaction.user.username} is inviting you to join **${party.name}**`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => (r.user.id === interaction.user.id || r.user.id === user.id) && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();

                    const stats = await getUserSchema(interaction.user.id);
                    if (!stats || stats.party === null) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You are not in a party. You can create one using \`/party create\``);
                        return;
                    };

                    const stats2 = await getUserSchema(user.id);
                    if (stats2?.party !== null) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`${user.username} is already in a party.`);
                        return;
                    };

                    const party = await getPartySchema(stats.party);
                    if (!party) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`${user.username} is not in a party.`);
                        return;
                    };

                    if (party.members.length >= 4) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`**${party.name}** already has 4 members.`);
                        return;
                    };

                    // Update parties table
                    await updateParties(party.id, {
                        members: { type: "append_unique", value: [user.id] }
                    });

                    // Update users table
                    await updateUsersAndCache(interaction.client, user.id, {
                        updates: {
                            party: { type: "set", value: party.id },
                        },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`${user.toString()} has joined **${party.name}**`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });

            });
        } else if (subcommand === "leave") {
            if (stats.party === null) return interaction.reply(`You are not in a party.`);
            if (stats.cow_participation !== null) return interaction.reply(`You can't leave your party till \`/rolling cow\` is over.`);

            const party = await getPartySchema(stats.party);
            if (!party) return interaction.reply(`Couldn't find party with ID \`${stats.party}\`. If you ever encounter this, please report it to our staff as a bug.`);

            let question = `Are you sure you want to leave **${party.name}**?`;
            if (party.members.length === 1) question = `You are the last member in **${party.name}**. Leaving will permanently delete any related data, do you want to proceed?`;

            return interaction.reply({ content: question, components: [OfferRow] }).then(msg => {
                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();

                    const party = stats.party ? await getPartySchema(stats.party) : undefined;
                    if (!party) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`Couldn't find party with ID \`${stats.party}\`. If you ever encounter this, please report it to our staff as a bug.`);
                        return;
                    };

                    // Update parties table
                    if (party.members.length === 1) {
                        await deleteParty(party.id);
                    } else {
                        await updateParties(party.id, {
                            members: { type: "remove_all", value: [interaction.user.id] }
                        });
                    };

                    // Update users table
                    await updateUsersAndCache(interaction.client, interaction.user.id, {
                        updates: {
                            party: { type: "set", value: null },
                        },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`You have left **${party.name}**`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });
            });
        } else if (subcommand === "kick") {
            const user = interaction.options.getUser('user', true);
            if (user.id === interaction.user.id) return interaction.reply("You can't kick yourself. Use `/party leave` if you want to leave the party.");

            if (stats.party === null) return interaction.reply(`You are not in a party`);
            if (stats.cow_participation !== null) return interaction.reply(`You can't kick players from your party till \`/rolling cow\` is over.`);

            const stats2 = await getUserSchema(user.id);
            if (!stats2 || stats2.party === null) return interaction.reply(`**${user.username}** is not in a party.`);
            if (stats2.cow_participation !== null) return interaction.reply(`You can't kick players from your party till \`/rolling cow\` is over.`);

            if (stats2.party !== stats.party) return interaction.reply(`**${user.username}** is not in your party.`);

            const party = await getPartySchema(stats2.party);
            if (!party) return interaction.reply(`Couldn't find party with ID \`${stats2.party}\``);

            return interaction.reply({ content: `Are you sure you want to kick **${user.username}** from **${party.name}**?`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();

                    // Update parties table
                    await updateParties(party.id, {
                        members: { type: "remove_all", value: [user.id] }
                    });

                    // Update users table
                    await updateUsersAndCache(interaction.client, user.id, {
                        updates: {
                            party: { type: "set", value: null },
                        },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`**${user.toString()}** was kicked from **${party.name}** by ${interaction.user.toString()}`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });
            });
        } else if (subcommand === "dissolve") {
            if (stats.party === null) return interaction.reply(`You are not in a party.`);
            if (stats.cow_participation !== null) return interaction.reply(`You can't dissolve your party till \`/rolling cow\` is over.`);

            const party = await getPartySchema(stats.party);
            if (!party) return interaction.reply(`Couldn't find party with ID \`${stats.party}\`. If you ever encounter this, please report it to our staff as a bug.`);

            return interaction.reply({ content: `Are you sure you want to dissolve **${party.name}**? This will kick all members and permanently delete any related data.`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();

                    const party = stats.party ? await getPartySchema(stats.party) : undefined;
                    if (!party) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`Couldn't find party with ID \`${stats.party}\`. If you ever encounter this, please report it to our staff as a bug.`);
                        return;
                    };

                    // Update parties table
                    await deleteParty(party.id);

                    // Update users table
                    await updateUsersAndCache(interaction.client, party.members, {
                        updates: {
                            party: { type: "set", value: null },
                        },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`You have left **${party.name}**`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });

            });
        };
    },
    async executeButtonInteraction({ interaction }) {
        const [imageType, id] = interaction.customId.split("-").slice(2).join("-").split(":");

        // Update guilds table
        await updateParties(id, {
            [imageType === 'icon' ? 'icon' : 'banner']: { type: "set", value: null },
        });

        interaction.followUp({ content: `${interaction.user} has removed the ${imageType} of the party with ID \`${id}\`` });
    },
};

export default exportCommand;
