import { EmbedBuilder, ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { db, query } from "../db_handler";
import { generateUniqueGuildId } from "../Modules/functions";
import { characters } from "../Modules/chars";
import { abilities } from "../Modules/abilities";
import { OfferRow } from "../Modules/components";

module.exports = {
    name: 'party',
    description: 'party related commands',
    execute(interaction) {

        let subcommand = interaction.options.getSubcommand();

        // Item info
        if (subcommand === "create") {
            const name = interaction.options.getString('name');
            if (name.length > 20) return interaction.reply(`Party names can't be longer than 20 characters (current length: ${name.length})`);
            db.serialize(async () => {
                const { 0: stats } = await query(`SELECT party, cow_participation FROM users WHERE users.id = ${interaction.user.id}`);
                if (stats.party) return interaction.reply(`You are already in a party, please leave your current one if you want to create a new party.`);
                if (stats.cow_participation !== null) return interaction.reply(`You can't change your party till \`/rolling cow\` is over.`);

                let existingParties = await query(`SELECT id FROM parties`);
                existingParties = existingParties.map((e) => e.id);

                const partyid = generateUniqueGuildId(existingParties);

                await query(`UPDATE users SET party = '${partyid}' WHERE id = ${interaction.user.id}`);
                await query(`INSERT INTO parties (id, name, members, created) VALUES ('${partyid}', '${name.replace(/'/g, "''")}', '${interaction.user.id}', ${new Date().getTime()})`, 'run');

                return interaction.reply(`Successfully created party "${name}" <:kawaiicheer:928369628122583050>\nInvite other players to join you!`);
            });
        } else if (subcommand === "view") {
            const user = interaction.options.getUser('user') || interaction.user;
            db.serialize(async () => {
                const { 0: stats } = await query(`SELECT party FROM users WHERE users.id = ${user.id}`);
                if (!stats || stats.party === null) return interaction.reply(`${user.id === interaction.user.id ? "You are not" : user.username + " is not"} in a party.\nCreate one using \`/party create\`!`);

                const { 0: party } = await query(`SELECT * FROM parties WHERE id = '${stats.party}'`);
                if (!party) return interaction.reply(`Couldn't find party of ${user.username}`);

                const members = await query(`SELECT id, name, stampedechar FROM users WHERE id IN (${party.members})`);

                const Embed = new EmbedBuilder()
                    .setTitle(party.name)
                    .setColor(party.color || 0xbbffff)
                    .setThumbnail(party.icon)
                    .setDescription(`${party.description?.replace(/\\n/g, "\n") || "_Missing description. Use `/party edit` to add one._"}\n\n**Capacity**: \`${members.length}/4\``)
                    .addFields(
                        { name: "Members", value: `${members.map((e) => e.name).join("\n")}`, inline: true },
                        { name: "Selected Character", value: `${members.map((e) => `${(abilities?.[e.stampedechar]?.party) ? "✨ " : "<:blank:917804200363171860> "}__${characters?.[e.stampedechar]?.name || "None"}__`).join("\n")}`, inline: true },
                    );
                if (party.banner) Embed.setImage(party.banner);
                return interaction.reply({ embeds: [Embed] });
            });
        } else if (subcommand === "edit") {
            const setting = interaction.options.getString('setting');
            const input = interaction.options.getString('input');
            db.serialize(async () => {
                const { 0: stats } = await query(`SELECT party FROM users WHERE users.id = ${interaction.user.id}`);
                if (!stats?.party) return interaction.reply(`You are not in a party. Create one using \`/party create\`!`);

                const { 0: party } = await query(`SELECT * FROM parties WHERE id = '${stats.party}'`);
                if (!party) return interaction.reply(`Couldn't find party with ID \`${stats.party}\``);

                if (setting === "color") {
                    if (!input.match(/^#([0-9a-f]{3}){1,2}$/i)) return interaction.reply(`Please use a valid hex color code.\nExamples: \`#112358\`, \`#bbffff\`, \`#abc\``);
                    await query(`UPDATE parties SET color = '${input}' WHERE id = '${stats.party}'`);
                    interaction.reply(`Changed embed color to \`${input}\`!`);
                };

                if (setting === "description") {
                    if (input.length > 200) return interaction.reply(`Your party description can contain a maximum of 200 characters (current length: ${input.length})`);
                    await query(`UPDATE parties SET description = '${input.replace(/'/g, "''")}' WHERE id = '${stats.party}'`);
                    return interaction.reply(`Changed party description to\n> "${input}"`);
                };

                if (setting === "rename") {
                    if (input.length > 20) return interaction.reply(`Party names can't be longer than 20 characters (current length: ${input.length})`);
                    await query(`UPDATE parties SET name = '${input.replace(/'/g, "''")}' WHERE id = '${stats.party}'`);
                    return interaction.reply(`Changed party name to **${input}**`);
                };

                if (setting === "icon") {
                    if (input.length > 100) return interaction.reply(`Party icon url can't be longer than 100 characters (current length: ${input.length})`);
                    if (!(input.startsWith("https://i.ibb.co/") || input.startsWith("https://i.imgur.com/") || input.startsWith("https://imgur.com/"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com");
                    if (!(input.endsWith(".png") || input.endsWith(".jpg") || input.endsWith(".jpeg") || input.endsWith(".gif"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com that ends with .png, .jpg, .jpeg or .gif");
                    await query(`UPDATE parties SET icon = '${input.replace(/'/g, "''")}' WHERE id = '${stats.party}'`);
                    interaction.reply(`Changed party icon to <${input}>`);

                    // Image Log
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`ref-party-icon:${stats.party}`)
                                .setLabel(`Remove thumbnail`)
                                .setStyle(ButtonStyle.Secondary)
                        );

                    const channel = interaction.client.channels.cache.find(channel => channel.id === "934117922039791627");
                    const Embed = new EmbedBuilder()
                        .setColor(party.color || 0xbbffff)
                        .setThumbnail(input)
                        .setTitle(party.name)
                        .setDescription(`ID: \`${party.id}\`\nParty: ${party.members.split(",").join(", ")}`)
                        .setFooter({ text: `Changed by ${interaction.user.username} | ${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" });
                    if (party.banner) Embed.setImage(party.banner);
                    return channel.send({ embeds: [Embed], components: [row] });
                };

                if (setting === "banner") {
                    if (input.length > 100) return interaction.reply(`Party banner url can't be longer than 100 characters (current length: ${input.length})`);
                    if (!input) {
                        await query(`UPDATE parties SET banner = '""' WHERE id = '${stats.party}'`);
                        return interaction.reply(`Removed party banner`);
                    };
                    if (!(input.startsWith("https://i.ibb.co/") || input.startsWith("https://i.imgur.com/") || input.startsWith("https://imgur.com/"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com");
                    if (!(input.endsWith(".png") || input.endsWith(".jpg") || input.endsWith(".jpeg") || input.endsWith(".gif"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com that ends with .png, .jpg, .jpeg or .gif");
                    await query(`UPDATE parties SET banner = '${input.replace(/'/g, "''")}' WHERE id = '${stats.party}'`);
                    interaction.reply(`Changed party banner to <${input}>`);

                    // Image Log
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`ref-party-banner:${stats.party}`)
                                .setLabel(`Remove banner`)
                                .setStyle(ButtonStyle.Secondary)
                        );

                    const channel = interaction.client.channels.cache.find(channel => channel.id === "934117922039791627");
                    const Embed = new EmbedBuilder()
                        .setColor(party.color || 0xbbffff)
                        .setThumbnail(party.icon)
                        .setTitle(party.name)
                        .setDescription(`ID: \`${party.id}\`\nParty: ${party.members.split(",").join(", ")}`)
                        .setFooter({ text: `Changed by ${interaction.user.username} | ${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" })
                        .setImage(input);
                    return channel.send({ embeds: [Embed], components: [row] });
                };
            });
        } else if (subcommand === "join") {
            const user = interaction.options.getUser('user');
            if (user.id === interaction.user.id) return interaction.reply(`You can't join your own party.`);
            db.serialize(async () => {
                const { 0: myStats } = await query(`SELECT party, cow_participation, stampedechar FROM users WHERE users.id = ${interaction.user.id}`);
                if (myStats?.party !== null) return interaction.reply(`You are already in a party, please leave it first.`);
                if (myStats.cow_participation !== null) return interaction.reply(`You can't change your party till \`/rolling cow\` is over.`);

                const { 0: stats } = await query(`SELECT party, cow_participation FROM users WHERE users.id = ${user.id}`);
                if (!stats || stats.party === null) return interaction.reply(`${user.username} is not in a party.`);
                if (stats.cow_participation !== null) return interaction.reply(`You can't join this party till \`/rolling cow\` is over.`);

                const { 0: party } = await query(`SELECT * FROM parties WHERE id = '${stats.party}'`);
                if (!party) return interaction.reply(`${user.username} is not in a party.`);

                if (party.members.split(",").length >= 4) return interaction.reply(`**${party.name}** already has 4 members.`);

                // Return if char already taken
                const chars = await query(`SELECT name, stampedechar FROM users WHERE party = '${party.id}'`);
                if (myStats.stampedechar !== null && chars.map((e) => e.stampedechar).includes(myStats.stampedechar)) return interaction.reply(`Someone in your party (${chars.find((e) => e.stampedechar === myStats.stampedechar).name}) has already selected **${characters[myStats.stampedechar].name}**, please choose another character.`);

                return interaction.reply({ content: `${user.toString()} ${interaction.user.username} wants to join your party`, components: [OfferRow], fetchReply: true }).then(msg => {

                    const confirm = msg.createMessageComponentCollector({ filter: (r) => party.members.split(",").includes(r.user.id) && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                    const cancel = msg.createMessageComponentCollector({ filter: (r) => (r.user.id === interaction.user.id || party.members.split(",").includes(r.user.id)) && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                    confirm.on('collect', async () => {
                        confirm.stop(), cancel.stop();

                        const { 0: party } = await query(`SELECT * FROM parties WHERE id = '${stats.party}'`);
                        if (!party) return interaction.channel.send(`${user.username} is not in a party.`);

                        if (party.members.split(",").length >= 4) return interaction.channel.send(`**${party.name}** already has 4 members.`);

                        await query(`UPDATE users SET party = '${stats.party}' WHERE id = ${interaction.user.id}`);
                        await query(`UPDATE parties SET members = '${party.members + "," + interaction.user.id}' WHERE id = '${stats.party}'`);

                        return interaction.channel.send(`**${interaction.user.username}** has joined **${party.name}**!`);
                    });

                    cancel.on('collect', () => {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send("Action cancelled");
                    });

                });
            });
        } else if (subcommand === "invite") {
            const user = interaction.options.getUser('user');
            if (user.id === interaction.user.id) return interaction.reply(`You can't invite yourself`);
            db.serialize(async () => {
                const { 0: myStats } = await query(`SELECT party, cow_participation FROM users WHERE users.id = ${interaction.user.id}`);
                if (myStats?.party === null) return interaction.reply(`You are not in a party. You can create one using \`/party create\``);
                if (myStats.cow_participation !== null) return interaction.reply(`You can't invite players to your party till \`/rolling cow\` is over.`);

                const { 0: stats } = await query(`SELECT party, cow_participation, stampedechar FROM users WHERE users.id = ${user.id}`);
                if (stats?.party !== null) return interaction.reply(`${user.username} is already in a party.`);
                if (stats.cow_participation !== null) return interaction.reply(`${user.username} can't join a party till \`/rolling cow\` is over.`);

                const { 0: party } = await query(`SELECT * FROM parties WHERE id = '${myStats.party}'`);
                if (!party) return interaction.reply(`${user.username} is not in a party.`);

                if (party.members.split(",").length >= 4) return interaction.reply(`**${party.name}** already has 4 members.`);

                // Return if char already taken
                const chars = await query(`SELECT name, stampedechar FROM users WHERE party = '${party.id}'`);
                if (stats.stampedechar !== null && chars.map((e) => e.stampedechar).includes(stats.stampedechar)) return interaction.reply(`Someone in your party (${chars.find((e) => e.stampedechar === stats.stampedechar).name}) has already selected **${characters[stats.stampedechar].name}**, please choose another character.`);

                return interaction.reply({ content: `${user.toString()} ${interaction.user.username} is inviting you to join **${party.name}**`, components: [OfferRow], fetchReply: true }).then(msg => {

                    const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                    const cancel = msg.createMessageComponentCollector({ filter: (r) => (r.user.id === interaction.user.id || r.user.id === user.id) && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                    confirm.on('collect', async () => {
                        confirm.stop(), cancel.stop();

                        const { 0: myStats } = await query(`SELECT party FROM users WHERE users.id = ${interaction.user.id}`);
                        if (myStats?.party === null) return interaction.channel.send(`You are not in a party. You can create one using \`/party create\``);

                        const { 0: stats } = await query(`SELECT party FROM users WHERE users.id = ${user.id}`);
                        if (stats?.party !== null) return interaction.channel.send(`${user.username} is already in a party.`);

                        const { 0: party } = await query(`SELECT * FROM parties WHERE id = '${myStats.party}'`);
                        if (!party) return interaction.channel.send(`${user.username} is not in a party.`);

                        if (party.members.split(",").length >= 4) return interaction.channel.send(`**${party.name}** already has 4 members.`);

                        await query(`UPDATE users SET party = '${party.id}' WHERE id = ${user.id}`);
                        await query(`UPDATE parties SET members = '${party.members + "," + user.id}' WHERE id = '${party.id}'`);

                        return interaction.channel.send(`${user.toString()} has joined **${party.name}**`);
                    });

                    cancel.on('collect', () => {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send("Action cancelled");
                    });

                });
            });
        } else if (subcommand === "leave") {
            db.serialize(async () => {
                const { 0: stats } = await query(`SELECT party, cow_participation FROM users WHERE id = ${interaction.user.id}`);
                if (stats.party === null) return interaction.reply(`You are not in a party.`);
                if (stats.cow_participation !== null) return interaction.reply(`You can't leave your party till \`/rolling cow\` is over.`);

                const { 0: party } = await query(`SELECT * FROM parties WHERE id = '${stats.party}'`);
                if (!party) return interaction.reply(`Couldn't find party with ID \`${stats.party}\`. If you ever encounter this, please report it to our staff as a bug.`);

                let question = `Are you sure you want to leave **${party.name}**?`;
                if (party.members.split(",").length === 1) question = `You are the last member in **${party.name}**. Leaving will permanently delete any related data, do you want to proceed?`;

                return interaction.reply({ content: question, components: [OfferRow], fetchReply: true }).then(msg => {

                    const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                    const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                    confirm.on('collect', async () => {
                        confirm.stop(), cancel.stop();

                        await query(`UPDATE users SET party = NULL WHERE id = ${interaction.user.id}`);

                        if (party.members.split(",").length === 1) await query(`DELETE FROM parties WHERE id = '${party.id}'`);
                        else await query(`UPDATE parties SET members = '${party.members.split(",").filter((e) => e !== interaction.user.id).join(",")}' WHERE id = '${stats.party}'`);

                        return interaction.channel.send(`You have left **${party.name}**`);
                    });

                    cancel.on('collect', () => {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send("Action cancelled");
                    });

                });

            });
        } else if (subcommand === "kick") {
            const user = interaction.options.getUser('user');
            if (user.id === interaction.user.id) return interaction.reply("You can't kick yourself. Use `/party leave` if you want to leave the party.");
            db.serialize(async () => {
                const { 0: myStats } = await query(`SELECT party, cow_participation FROM users WHERE id = ${interaction.user.id}`);
                if (myStats.party === null) return interaction.reply(`You are not in a party`);
                if (myStats.cow_participation !== null) return interaction.reply(`You can't kick players from your party till \`/rolling cow\` is over.`);

                const { 0: stats } = await query(`SELECT party, cow_participation FROM users WHERE id = ${user.id}`);
                if (!stats || stats.party === null) return interaction.reply(`**${user.username}** is not in a party.`);
                if (stats.cow_participation !== null) return interaction.reply(`You can't kick players from your party till \`/rolling cow\` is over.`);

                if (stats.party !== myStats.party) return interaction.reply(`**${user.username}** is not in your party.`);

                const { 0: party } = await query(`SELECT * FROM parties WHERE id = '${stats.party}'`);
                if (!party) return interaction.reply(`Couldn't find party with ID \`${stats.party}\``);

                return interaction.reply({ content: `Are you sure you want to kick **${user.username}** from **${party.name}**?`, components: [OfferRow], fetchReply: true }).then(msg => {

                    const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                    const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                    confirm.on('collect', async () => {
                        confirm.stop(), cancel.stop();

                        party.members = party.members.split(",").filter((e) => e !== user.id).join(",");

                        await query(`UPDATE users SET party = NULL WHERE id = ${user.id}`);
                        await query(`UPDATE parties SET members = '${party.members}' WHERE id = '${party.id}'`);

                        return interaction.channel.send(`**${user.toString()}** was kicked from **${party.name}** by ${interaction.user.toString()}`);
                    });

                    cancel.on('collect', () => {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send("Action cancelled");
                    });

                });
            });
        } else if (subcommand === "dissolve") {
            db.serialize(async () => {
                const { 0: stats } = await query(`SELECT party, cow_participation FROM users WHERE id = ${interaction.user.id}`);
                if (stats.party === null) return interaction.reply(`You are not in a party.`);
                if (stats.cow_participation !== null) return interaction.reply(`You can't dissolve your party till \`/rolling cow\` is over.`);

                const { 0: party } = await query(`SELECT * FROM parties WHERE id = '${stats.party}'`);
                if (!party) return interaction.reply(`Couldn't find party with ID \`${stats.party}\`. If you ever encounter this, please report it to our staff as a bug.`);

                return interaction.reply({ content: `Are you sure you want to dissolve **${party.name}**? This will kick all members and permanently delete any related data.`, components: [OfferRow], fetchReply: true }).then(msg => {

                    const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                    const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                    confirm.on('collect', async () => {
                        confirm.stop(), cancel.stop();

                        await query(`UPDATE users SET party = NULL WHERE id IN (${party.members})`);
                        await query(`DELETE FROM parties WHERE id = '${party.id}'`);

                        return interaction.channel.send(`You have left **${party.name}**`);
                    });

                    cancel.on('collect', () => {
                        confirm.stop(), cancel.stop();
                        return interaction.channel.send("Action cancelled");
                    });

                });

            });
        };

    },
    async executeButtonInteraction(interaction) {
        const [imageType, id] = interaction.customId.split("-").slice(2).join("-").split(":");

        if (imageType === "icon") await query(`UPDATE parties SET icon = 'https://i.imgur.com/JEvfGSR.png' WHERE id = '${id}'`);
        else await query(`UPDATE parties SET banner = '' WHERE id = '${id}'`);

        interaction.followUp({ content: `${interaction.user} has removed the ${imageType} of the party with ID \`${id}\`` });
    },
};
