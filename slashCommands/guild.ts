import { EmbedBuilder, ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ColorResolvable } from "discord.js";
import { dailies } from "../Modules/dailyQuests";
import { showPage, searchGuild, getDonationsPageWeek, lastActive, formatNumberWithQuotes, customEmojis } from "../Modules/functions";
import { PageRow, OfferRow, donationWeekStart } from "../Modules/components";
import { GuildSchema, SlashCommand } from "../types";
import { addGuildDonation, deleteGuild, getGuildDonationSchemas, getGuildSchema, getGuildSchemas, getUserSchema, getUserSchemas, insertNewGuild, updateGuildDonationsGuildId, updateGuilds, updateUsers } from "../Modules/queries";
import { achievements } from "../Modules/achievements";

function lastActiveInDays(timestamp: Date | number) {
    const now = new Date(), date = new Date(timestamp);
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
};

function upgradePrice(level: number): number {
    switch (level) {
        case 1: return 100_000;
        case 2: return 300_000;
        case 3: return 500_000;
        case 4: return 1_000_000;
        case 5: return 2_000_000;
        case 6: return 5_000_000;
        case 7: return 8_000_000;
        case 8: return 12_000_000;
        case 9: return 20_000_000;
        default: return 20_000_000 + (Math.floor(level / 10) * 10_000_000);
    };
};

const exportCommand: SlashCommand = {
    name: 'guild',
    async execute({ interaction, author }) {

        const subcommand = interaction.options.getSubcommand();

        const stats = author.schema;

        // Item info
        if (subcommand === "create") {
            const name = interaction.options.getString('name', true);
            if (name.length > 20) return interaction.reply(`Guild names can't be longer than 20 characters (current length: ${name.length})`);

            const fee = 20000;
            if (stats.coins < fee) return interaction.reply(`You don't have enough coins to create a guild (**${stats.coins}**/${fee}<:coins:872926669055356939>)`);
            if (stats.guild) return interaction.reply(`You are already in a guild, please leave your current one if you want to create a new guild.`);

            // Create guild
            const guild = await insertNewGuild(name, interaction.user.id);

            // Update users table
            await updateUsers(interaction.user.id, {
                coins: { type: "increment", value: -fee },
                guild: { type: "set", value: guild.id },
            });

            return interaction.reply(`Successfully created guild "${name}" <:kawaiicheer:928369628122583050>\nOther players can join your guild with the ID: \`${guild.id}\``);
        } else if (subcommand === "view") {
            const name = interaction.options.getString('id');
            const user = interaction.options.getUser('user') ?? interaction.user;
            const details = interaction.options.getString('details') ?? "online";

            const stats = user.id === interaction.user.id ? author.schema : await getUserSchema(user.id);
            if (!stats) return interaction.reply(`Please use the ID of the guild you want to view.`);
            if (!name && !stats.guild) return interaction.reply(`Please use the ID of the guild you want to view.`);

            const guild = await getGuildSchema(name ?? stats.guild ?? "");
            if (!guild) return interaction.reply(`Couldn't find guild with ID \`${name}\``);

            const guildMembers = await getUserSchemas(guild.members);
            const members = guildMembers.map((e) => ({
                id: e.id,
                name: e.name,
                lastdaily: e.lastdaily,
                status: e.id === guild.master ? " (Guild Master)" : guild?.elders.includes(e.id) ? " (Elder)" : "",
                value: e.id === guild.master ? 2 : guild?.elders.includes(e.id) ? 1 : 0,
                donated: 0,
            }));
            members.sort((a, b) => b.value - a.value);

            let detailsTab;
            if (details === "donations_weekly") {
                const week = Math.ceil((Date.now() - donationWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));

                // Week
                const weekDay = Math.floor((Date.now() - donationWeekStart.getTime()) / (24 * 60 * 60 * 1000)) % 7;
                const startDate = new Date(Date.now() - (weekDay * 24 * 60 * 60 * 1000));
                const endDate = new Date(Date.now() + ((6 - weekDay) * 24 * 60 * 60 * 1000));
                const startDateString = startDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }).replace(/\//g, '/');
                const endDateString = endDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }).replace(/\//g, '/');

                // Donations
                const donations = await getGuildDonationSchemas(guild.id, week, "coins");
                for (const member of members) {
                    const donation = donations.find((dono) => dono.userid === member.id);
                    member.donated = donation?.amount ?? 0;
                };

                detailsTab = { name: `Donations ${startDateString} - ${endDateString}`, value: `${members.map((e) => `__${e.donated}__ <:coins:872926669055356939>`).join("\n")}`, inline: true };
            } else if (details === "id") {
                detailsTab = { name: "User ID", value: `${members.map((e) => `__${e.id}__`).join("\n")}`, inline: true };
            } else {
                detailsTab = { name: "Last Online", value: `${members.map((e) => `__${lastActive(e.lastdaily ?? 0)}__`).join("\n")}`, inline: true };
            };

            const Embed = new EmbedBuilder()
                .setTitle(guild.name)
                .setColor(guild.color as ColorResolvable || 0xbbffff)
                .setThumbnail(guild.icon || 'https://i.imgur.com/JEvfGSR.png')
                .setDescription(
                    (guild.description?.replace(/\\n/g, "\n") || "_Missing description. Use `/guild edit` to add one._")
                    + `\n\n**Guild Level**: \`${guild.level}\`\n**Capacity**: \`${members.length}/${10 + Math.min(guild.level - 1, 10)}\`\n**Tax Rate**: \`${guild.tax}%\`\n**Treasury**: \`${formatNumberWithQuotes(guild.treasury)}\`<:coins:872926669055356939>, \`${formatNumberWithQuotes(guild.treasury_gems)}\`<:genesis_gems:1034179687720681492>`
                    + `\n\n**Perks**`
                    + `\n${customEmojis.atk} **XP Buffs**: level ${guild.xpbuff}${guild.xpbuff ? `<:blank:917804200363171860>ㅤ(__+${20 * guild.xpbuff}__%)` : ""}`
                    + `\n<:coins:872926669055356939> **Loot Buffs**: level ${guild.lootbuff}${guild.lootbuff ? `<:blank:917804200363171860>(__+${20 * guild.lootbuff}__%)` : ""}`
                    + `\n\n**Raid Perks**`
                    + `\n${customEmojis.atk} **ATK Buff**: level ${guild.atkbuff}${guild.atkbuff ? `<:blank:917804200363171860>ㅤ(__+${20 * guild.atkbuff}__%)` : ""}`
                    + `\n${customEmojis.hp} **HP Buff**: level ${guild.hpbuff}${guild.hpbuff ? `<:blank:917804200363171860>ㅤ(__+${20 * guild.hpbuff}__%)` : ""}`
                    + `\n${customEmojis.def} **DEF Buff**: level ${guild.defbuff}${guild.defbuff ? `<:blank:917804200363171860>ㅤ(__+${100 * guild.defbuff}__)` : ""}`
                )
                .addFields(
                    { name: "Members", value: `${members.map((e) => `${e.name}${e.status}`).join("\n")}`, inline: true },
                    detailsTab
                )
                .setFooter({ text: `join code: ${guild.id} | ${guild.canjoin ? "anyone can join" : "invite only"}` });
            if (guild.banner) Embed.setImage(guild.banner);
            return interaction.reply({ embeds: [Embed] });
        } else if (subcommand === "edit") {
            if (stats.guild === null) return interaction.reply(`Only guild masters can change guild settings.`);

            const setting = interaction.options.getString('setting', true);
            const input = interaction.options.getString('input', true);

            const guild = await getGuildSchema(stats.guild);
            if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);
            if (guild.master !== interaction.user.id) return interaction.reply(`Only guild masters can change guild settings.`);

            if (setting === "color") {
                if (guild.level < 3) return interaction.reply(`**${guild.name}** needs to be level 3 to unlock changing its embed color.`);
                if (!input.match(/^#([0-9a-f]{3}){1,2}$/i)) return interaction.reply(`Please use a valid hex color code.\nExamples: \`#112358\`, \`#bbffff\`, \`#abc\``);

                // Update guilds table
                await updateGuilds(guild.id, {
                    color: { type: "set", value: input }
                });

                return interaction.reply(`Changed embed color to \`${input}\`!`);
            };

            if (setting === "description") {
                if (input.length > 200) return interaction.reply(`Your guild description can contain a maximum of 200 characters (current length: ${input.length})`);

                // Update guilds table
                await updateGuilds(guild.id, {
                    description: { type: "set", value: input }
                });

                return interaction.reply(`Changed guild description to\n> "${input}"`);
            };

            if (setting === "rename") {
                if (input.length > 20) return interaction.reply(`Guild names can't be longer than 20 characters (current length: ${input.length})`);

                // Update guilds table
                await updateGuilds(guild.id, {
                    name: { type: "set", value: input }
                });

                return interaction.reply(`Changed guild name to **${input}**`);
            };

            if (setting === "icon") {
                if (input.length > 100) return interaction.reply(`Guild icon url can't be longer than 100 characters (current length: ${input.length})`);
                if (!(input.startsWith("https://i.ibb.co/") || input.startsWith("https://i.imgur.com/") || input.startsWith("https://imgur.com/"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com");
                if (!(input.endsWith(".png") || input.endsWith(".jpg") || input.endsWith(".jpeg") || input.endsWith(".gif"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com that ends with .png, .jpg, .jpeg or .gif");

                // Update guilds table
                await updateGuilds(guild.id, {
                    icon: { type: "set", value: input }
                });

                interaction.reply(`Changed guild icon to <${input}>`);

                // Image Log
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`ref-guild-icon:${stats.guild}`)
                            .setLabel(`Remove thumbnail`)
                            .setStyle(ButtonStyle.Secondary)
                    );

                const channel = interaction.client.channels.cache.find(channel => channel.id === "934117922039791627");
                const Embed = new EmbedBuilder()
                    .setColor(guild.color as ColorResolvable || 0xbbffff)
                    .setThumbnail(input)
                    .setTitle(guild.name)
                    .setDescription(`GM: ${guild.master}\nID: \`${guild.id}\`\nLevel: ${guild.level}`)
                    .setFooter({ text: `Changed by ${interaction.user.username} | ${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
                if (guild.banner) Embed.setImage(guild.banner);
                if (channel?.isSendable()) return channel.send({ embeds: [Embed], components: [row] });
            };

            if (setting === "banner") {
                if (guild.level < 5) return interaction.reply(`**${guild.name}** needs to be level 5 to upload a banner.`);
                if (input.length > 100) return interaction.reply(`Guild banner url can't be longer than 100 characters (current length: ${input.length})`);
                if (!input) {
                    // Update guilds table
                    await updateGuilds(guild.id, {
                        banner: { type: "set", value: "" }
                    });

                    return interaction.reply(`Removed guild banner`);
                };
                if (!(input.startsWith("https://i.ibb.co/") || input.startsWith("https://i.imgur.com/") || input.startsWith("https://imgur.com/"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com");
                if (!(input.endsWith(".png") || input.endsWith(".jpg") || input.endsWith(".jpeg") || input.endsWith(".gif"))) return interaction.reply("Please use an image URL from imgur.com or imgbb.com that ends with .png, .jpg, .jpeg or .gif");

                // Update guilds table
                await updateGuilds(guild.id, {
                    banner: { type: "set", value: input }
                });

                interaction.reply(`Changed guild banner to <${input}>`);

                // Image Log
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`ref-guild-banner:${stats.guild}`)
                            .setLabel(`Remove banner`)
                            .setStyle(ButtonStyle.Secondary)
                    );

                const channel = interaction.client.channels.cache.find(channel => channel.id === "934117922039791627");
                const Embed = new EmbedBuilder()
                    .setColor(guild.color as ColorResolvable || 0xbbffff)
                    .setThumbnail(guild.icon || 'https://i.imgur.com/JEvfGSR.png')
                    .setTitle(guild.name)
                    .setDescription(`GM: ${guild.master}\nID: \`${guild.id}\`\nLevel: ${guild.level}`)
                    .setFooter({ text: `Changed by ${interaction.user.username} | ${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) })
                    .setImage(input);
                if (channel?.isSendable()) return channel.send({ embeds: [Embed], components: [row] });
            };

            if (setting === "tax") {
                let tax = parseInt(input);
                if (Number.isNaN(tax) || tax < 0 || tax > 100) return interaction.reply(`Invalid tax rate. Please provide a number between **0**-**100**.`);

                // Update guilds table
                await updateGuilds(guild.id, {
                    tax: { type: "set", value: tax }
                });

                return interaction.reply(`Changed tax rate to **${tax}%**.`);
            };

            if (setting === "canjoin") {
                if (!(input === "true" || input === "false")) return interaction.reply(`Change your guild's join settings.\nWrite \`true\` if you want anyone to be able to join, \`false\` if you want to invite players.`);

                // Update guilds table
                await updateGuilds(guild.id, {
                    canjoin: { type: "set", value: input === "false" ? 0 : 1 }
                });

                return interaction.reply(`Changed join settings to **${input === "false" ? "invite only" : "anyone can join"}**.`);
            };

            if (setting === "changecode") {
                if (input.length > 8) return interaction.reply(`Guild join codes can't be longer than 8 characters (current length: ${input.length})`);
                const allowedChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split("");
                if (!input.split("").every((e) => allowedChars.includes(e))) return interaction.reply(`You can only use the characters a-z A-Z 0-9 - and _ in join codes.`);
                if (guild.treasury_gems < 1000) return interaction.reply(`**${guild.name}** needs 1000<:genesis_gems:1034179687720681492> to change its join code.`);
                if (guild.id === "MmLdY") return interaction.reply("No <a:FubukiSip:1081201294246674442>");

                // //@ts-expect-error
                // const allCodes = await query(`SELECT id FROM guilds`);
                // if (allCodes.map((e) => e.id).includes(input)) return interaction.reply(`The join code **${input}** already exists, please choose another one.`);

                try {
                    // Update guilds table
                    await updateGuilds(guild.id, {
                        id: { type: "set", value: input },
                        treasury_gems: { type: "increment", value: -1000 }
                    });

                    // Update guild_donations table
                    await updateGuildDonationsGuildId(guild.id, input);

                    // Update users table
                    await updateUsers(guild.members, {
                        guild: { type: "set", value: input },
                    });

                    return interaction.reply(`Changed join code to **${input}**`);
                } catch {
                    return interaction.reply(`The join code **${input}** already exists, please choose another one.`);
                };
            };
        } else if (subcommand === "join") {
            const code = interaction.options.getString('code', true);

            if (stats.guild !== null) return interaction.reply(`You are already in a guild, please leave it first.`);

            // Check if can join guild
            if (stats.lastguildjoin) {
                const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
                const timeSinceLastJoin = Date.now() - new Date(stats.lastguildjoin).getTime();

                if (timeSinceLastJoin < twentyFourHoursInMs) {
                    const timeLeft = twentyFourHoursInMs - timeSinceLastJoin;
                    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
                    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

                    return interaction.reply(`You have to wait 24h before you can join a guild again.\nTime left: **${hours}h ${minutes}m**`);
                };
            };

            const guild = await getGuildSchema(code);
            if (!guild) return interaction.reply(`Couldn't find guild with ID \`${code}\``);

            if (!guild.canjoin) return interaction.reply(`**${guild.name}** can only be joined through invites.`);
            if (guild.banned.includes(interaction.user.id)) return interaction.reply(`You have been banned from **${guild.name}**.`);
            if (guild.members.length >= 10 + Math.min(guild.level - 1, 10)) return interaction.reply(`**${guild.name}** has already reached the maximum amount of members it can hold.`);

            // Update users table
            await updateUsers(interaction.user.id, {
                guild: { type: "set", value: code },
                lastguildjoin: { type: "set", value: new Date() }
            });

            // Update guilds table
            await updateGuilds(guild.id, {
                members: { type: "append_unique", value: [interaction.user.id] },
            });

            return interaction.reply(`You have joined **${guild.name}**!`);
        } else if (subcommand === "invite") {
            const user = interaction.options.getUser('user', true);
            if (user.id === interaction.user.id) return interaction.reply(`You can't invite yourself <:kek:927271748385243206>`);

            if (stats.guild === null) return interaction.reply(`You are not in a guild.`);

            const stats2 = await getUserSchema(user.id);
            if (!stats2) return interaction.reply(`**${user.username}** has not started playing yet.`);
            if (!(stats2.guild === null)) return interaction.reply(`**${user.username}** is already in a guild.`);

            // Check if can join guild
            if (stats2.lastguildjoin) {
                const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
                const timeSinceLastJoin = Date.now() - new Date(stats2.lastguildjoin).getTime();

                if (timeSinceLastJoin < twentyFourHoursInMs) {
                    const timeLeft = twentyFourHoursInMs - timeSinceLastJoin;
                    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
                    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

                    return interaction.reply(`**${user.username}** has to wait 24h before joining a new guild.\nTime left: **${hours}h ${minutes}m**`);
                };
            };

            const guild = await getGuildSchema(stats.guild);
            if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);

            if (interaction.user.id !== guild.master && !guild.elders.includes(interaction.user.id)) return interaction.reply(`Only the guild master and elders can invite members.`);

            if (guild.members.length >= 10 + Math.min(guild.level - 1, 10)) return interaction.reply(`**${guild.name}** has already reached the maximum amount of members it can hold.`);

            return interaction.reply({ content: `${user.toString()} ${interaction.user.username} is inviting you to join **${guild.name}**`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => (r.user.id === interaction.user.id || r.user.id === user.id) && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();

                    const guild = stats.guild ? await getGuildSchema(stats.guild) : undefined;
                    if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);
                    if (guild.members.length >= 10 + Math.min(guild.level - 1, 10)) return interaction.reply(`**${guild.name}** has already reached the maximum amount of members it can hold.`);

                    // Update users table
                    await updateUsers(user.id, {
                        guild: { type: "set", value: guild.id },
                        lastguildjoin: { type: "set", value: new Date() }
                    });

                    // Update guilds table
                    await updateGuilds(guild.id, {
                        members: { type: "append_unique", value: [user.id] },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`${user.toString()} has joined **${guild.name}**`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });

            });
        } else if (subcommand === "leave") {
            if (stats.guild === null) return interaction.reply(`You are not in a guild.`);

            const guild = await getGuildSchema(stats.guild);
            if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);

            if (guild.master === interaction.user.id) {
                if (guild.members.length > 1) return interaction.reply(`Please promote someone else to the position of guild master before you can leave.`);
                return interaction.reply({ content: `You are the last member in **${guild.name}**. Leaving will permanently delete any related data, do you want to proceed?`, components: [OfferRow] }).then(msg => {
                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 45000 });

                    collector.on('collect', async r => {
                        collector.stop();
                        if (r.customId === "cancel") {
                            if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                            return;
                        };

                        // Update users table
                        await updateUsers(interaction.user.id, {
                            guild: { type: "set", value: null },
                        });

                        // Update guilds table
                        await deleteGuild(guild.id);

                        if (interaction.channel?.isSendable()) interaction.channel.send(`You have left **${guild.name}**.`);
                    });
                });
            };

            // Update users table
            await updateUsers(interaction.user.id, {
                guild: { type: "set", value: null },
            });

            // Update guilds table
            await updateGuilds(guild.id, {
                members: { type: "remove_all", value: [interaction.user.id] },
                elders: { type: "remove_all", value: [interaction.user.id] },
            });

            return interaction.reply(`You have left **${guild.name}**`);
        } else if (subcommand === "kick") {
            const user = interaction.options.getUser('user', true);
            if (user.id === interaction.user.id) return interaction.reply(`You can't kick yourself`);

            if (stats.guild === null) return interaction.reply(`You are not in a guild.`);

            const stats2 = await getUserSchema(user.id);
            if (!stats2) return interaction.reply(`**${user.username}** has not started playing yet.`);
            if (stats2.guild === null) return interaction.reply(`**${user.username}** is not in a guild.`);
            if (stats.guild !== stats2.guild) return interaction.reply(`**${user.username}** is not in your guild.`);

            const guild = await getGuildSchema(stats.guild);
            if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);

            const kickerStatus = (interaction.user.id === guild.master) ? 2 : (guild.elders.includes(interaction.user.id) ? 1 : 0);
            const kickedStatus = (user.id === guild.master) ? 2 : (guild.elders.includes(user.id) ? 1 : 0);
            if (kickerStatus <= kickedStatus) return interaction.reply(`You can't kick **${user.username}**`);

            return interaction.reply({ content: `Are you sure you want to kick **${user.username}** from **${guild.name}**?`, components: [OfferRow], }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();

                    // Update users table
                    await updateUsers(user.id, {
                        guild: { type: "set", value: null },
                    });

                    // Update guilds table
                    await updateGuilds(guild.id, {
                        members: { type: "remove_all", value: [user.id] },
                        elders: { type: "remove_all", value: [user.id] },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`**${user.toString()}** was kicked from **${guild.name}** by ${interaction.user.toString()}`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });

            });
        } else if (subcommand === "ban") {
            const user = interaction.options.getUser('user', true);
            if (user.id === interaction.user.id) return interaction.reply(`You can't ban yourself`);

            if (stats.guild === null) return interaction.reply(`You are not in a guild.`);

            const stats2 = await getUserSchema(user.id);
            if (!stats2) return interaction.reply(`**${user.username}** has not started playing yet.`);

            const guild = await getGuildSchema(stats.guild);
            if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);

            if (guild.banned.includes(user.id)) return interaction.reply(`**${user.username}** is already banned in **${guild.name}**`);

            const kickerStatus = (interaction.user.id === guild.master) ? 2 : (guild.elders.includes(interaction.user.id) ? 1 : 0);
            const kickedStatus = (user.id === guild.master) ? 2 : (guild.elders.includes(user.id) ? 1 : 0);
            if (kickerStatus <= kickedStatus) return interaction.reply(`You can't ban **${user.username}**`);

            if (stats2.guild === null || stats.guild !== stats2.guild) {
                // Update guilds table
                await updateGuilds(guild.id, {
                    banned: { type: "append_unique", value: [user.id] },
                });

                return interaction.reply(`**${user.username}** has been banned from **${guild.name}**.`);
            };

            return interaction.reply({ content: `Are you sure you want to ban **${user.username}** from **${guild.name}**?`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();

                    // Update users table
                    await updateUsers(user.id, {
                        guild: { type: "set", value: null },
                    });

                    // Update guilds table
                    await updateGuilds(guild.id, {
                        members: { type: "remove_all", value: [user.id] },
                        elders: { type: "remove_all", value: [user.id] },
                        banned: { type: "append_unique", value: [user.id] },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`**${user.toString()}** was banned from **${guild.name}** by ${interaction.user.toString()}`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });

            });
        } else if (subcommand === "unban") {
            const user = interaction.options.getUser('user', true);
            if (user.id === interaction.user.id) return interaction.reply(`You can't unban yourself`);

            if (stats.guild === null) return interaction.reply(`You are not in a guild.`);

            const stats2 = await getUserSchema(user.id);
            if (!stats2) return interaction.reply(`**${user.username}** has not started playing yet.`);

            const guild = await getGuildSchema(stats.guild);
            if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);

            if (!guild.banned.includes(user.id)) return interaction.reply(`**${user.username}** isn't banned in **${guild.name}**`);

            const kickerStatus = (interaction.user.id === guild.master) ? 2 : (guild.elders.includes(interaction.user.id) ? 1 : 0);
            const kickedStatus = (user.id === guild.master) ? 2 : (guild.elders.includes(user.id) ? 1 : 0);
            if (kickerStatus <= kickedStatus) return interaction.reply(`You can't unban **${user.username}**`);

            return interaction.reply({ content: `Are you sure you want to unban **${user.username}** from **${guild.name}**?`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();

                    // Update guilds table
                    await updateGuilds(guild.id, {
                        banned: { type: "remove_all", value: [user.id] },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`**${user.toString()}** was unbanned from **${guild.name}** by ${interaction.user.toString()}`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });

            });
        } else if (subcommand === "claim") {
            if (stats.guild === null) return interaction.reply(`You are not in a guild.`);

            const guild = await getGuildSchema(stats.guild);
            if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);

            if (interaction.user.id === guild.master) return interaction.reply(`You are already the guild master.`);

            let gmLastActive = 0, eldersAvailable = false;

            const members = await getUserSchemas(guild.members);
            members.forEach((e) => {
                if (e.id === guild.master) gmLastActive = lastActiveInDays(e.lastdaily ?? 0);
                else if (guild.elders.includes(e.id)) eldersAvailable = lastActiveInDays(e.lastdaily ?? 0) < 31;
            });

            if (gmLastActive < 31) return interaction.reply(`The guild master needs to have been inactive for over 30 days for the guild to be claimable.`);
            if (!guild.elders.includes(interaction.user.id) && eldersAvailable) return interaction.reply(`Only elders can claim the guild for now. You may claim the guild at a later time if all current elders have been inactive for over 30 days.`);

            return interaction.reply({ content: `Are you sure you want to claim **${guild.name}**?`, components: [OfferRow] }).then(msg => {
                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();

                    // Update guilds table
                    await updateGuilds(guild.id, {
                        elders: { type: "remove_all", value: [interaction.user.id] },
                        master: { type: "set", value: interaction.user.id },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`**${interaction.user.toString()}** is now the new guild master of **${guild.name}**!`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });
            });
        } else if (subcommand === "promote") {
            const user = interaction.options.getUser('user', true);
            if (user.id === interaction.user.id) return interaction.reply(`You can't promote yourself`);

            if (stats.guild === null) return interaction.reply(`You are not in a guild.`);

            const stats2 = await getUserSchema(user.id);
            if (!stats2) return interaction.reply(`**${user.username}** has not started playing yet.`);
            if (stats2.guild === null) return interaction.reply(`**${user.username}** is not in a guild.`);
            if (stats.guild !== stats2.guild) return interaction.reply(`**${user.username}** is not in your guild.`);

            const guild = await getGuildSchema(stats.guild);
            if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);

            if (interaction.user.id !== guild.master) return interaction.reply(`Only the guild master can promote members.`);

            if (guild.elders.includes(user.id)) {
                return interaction.reply({ content: `Are you sure you want to promote **${user.username}** to the guild master position?\nThis will demote you to the position of an elder.`, components: [OfferRow] }).then(msg => {

                    const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                    const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                    confirm.on('collect', async () => {
                        confirm.stop(), cancel.stop();

                        // Update guilds table
                        await updateGuilds(guild.id, {
                            elders: { type: "remove_all", value: [user.id] },
                        });
                        await updateGuilds(guild.id, {
                            master: { type: "set", value: user.id },
                            elders: { type: "append_unique", value: [interaction.user.id] },
                        });

                        if (interaction.channel?.isSendable()) interaction.channel.send(`**${user.toString()}** was promoted to guild master!`);
                    });

                    cancel.on('collect', () => {
                        confirm.stop(), cancel.stop();
                        if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                    });

                });
            } else {
                return interaction.reply({ content: `Are you sure you want to promote **${user.username}** to the position of an elder?`, components: [OfferRow], fetchReply: true }).then(msg => {

                    const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                    const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                    confirm.on('collect', async () => {
                        confirm.stop(), cancel.stop();

                        // Update guilds table
                        await updateGuilds(guild.id, {
                            elders: { type: "append_unique", value: [user.id] },
                        });

                        if (interaction.channel?.isSendable()) interaction.channel.send(`**${user.toString()}** was promoted to elder!`);
                    });

                    cancel.on('collect', () => {
                        confirm.stop(), cancel.stop();
                        if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                    });

                });
            };
        } else if (subcommand === "demote") {
            const user = interaction.options.getUser('user', true);
            if (user.id === interaction.user.id) return interaction.reply(`You can't demote yourself`);

            if (stats.guild === null) return interaction.reply(`You are not in a guild.`);

            const stats2 = await getUserSchema(user.id);
            if (!stats2) return interaction.reply(`**${user.username}** has not started playing yet.`);
            if (stats2.guild === null) return interaction.reply(`**${user.username}** is not in a guild.`);
            if (stats.guild !== stats2.guild) return interaction.reply(`**${user.username}** is not in your guild.`);

            const guild = await getGuildSchema(stats.guild);
            if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);

            if (interaction.user.id !== guild.master) return interaction.reply(`Only the guild master can demote members.`);

            if (!guild.elders.includes(user.id)) return interaction.reply(`You can't further demote **${user.username}**`);
            return interaction.reply({ content: `Are you sure you want to demote **${user.username}**?`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();

                    // Update guilds table
                    await updateGuilds(guild.id, {
                        elders: { type: "remove_all", value: [user.id] },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`${user.toString()} was demoted by ${interaction.user.toString()}`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });

            });
        } else if (subcommand === "top") {
            const page = interaction.options.getInteger('page') ?? 1;
            const sort = (interaction.options.getString('sort') || "level") as "level" | "event";

            const guilds = await getGuildSchemas("*");
            if (!guilds[0]) return interaction.reply(`There are no guilds`);

            // Pages
            const elementsPerPage = 15;
            let pagesTotal = Math.ceil(guilds.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            // Sort guilds
            let listPage: (e: GuildSchema, i: number) => string;
            if (sort === "level") {
                guilds.sort((a, b) => {
                    if (b.level !== a.level) return b.level - a.level;
                    else return new Date(a.lastlevelup ?? 0).getTime() - new Date(b.lastlevelup ?? 0).getTime();
                });
                listPage = (e: GuildSchema, i: number) => `${((currPage - 1) * 15) + i + 1}) **${e.name}** ➜ Level **${e.level}**`;
            } else {
                guilds.sort((a, b) => b.bosshuntstage - a.bosshuntstage);
                listPage = (e: GuildSchema, i: number) => `${((currPage - 1) * 15) + i + 1}) **${e.name}** ➜ Stage **${e.bosshuntstage}**`;
            };

            let showItems = showPage(currPage, guilds, elementsPerPage);

            const Embed = new EmbedBuilder()
                .setColor(guilds[0].color as ColorResolvable || 0xbbffff)
                .setTitle(`⚔️ Top Guilds of Camelot ⚔️`)
                .setDescription(showItems.map(listPage).join("\n"))
                .setThumbnail(guilds[0].icon || 'https://i.imgur.com/JEvfGSR.png')
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            if (pagesTotal === 1) return interaction.reply({ embeds: [Embed] });
            return interaction.reply({ embeds: [Embed], components: [PageRow] }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    showItems = showPage(currPage, guilds, elementsPerPage);

                    Embed.setDescription(showItems.map(listPage).join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    return interaction.editReply({ embeds: [Embed] });
                });
            });
        } else if (subcommand === "donate") {
            if (stats.guild === null) return interaction.reply(`You are not in a guild.`);

            const currency = interaction.options.getString('currency', true) as "coins" | "gems";
            const donation = interaction.options.getInteger('amount', true);

            const emoji = { coins: "<:coins:872926669055356939>", gems: "<:genesis_gems:1034179687720681492>" }[currency];
            if (donation < 1) return interaction.reply(`You can't donate less than 1 ${emoji}`);
            if (donation > 1000000000) return interaction.reply(`You can't donate more than 1,000,000,000 ${emoji} at once`);

            if (stats[currency] < donation) return interaction.reply(`You don't have **${donation}**${emoji} (current balance: ${stats[currency]}${emoji})`);

            const guild = await getGuildSchema(stats.guild);
            if (!guild) return interaction.reply(`Couldn't find guild with ID \`${stats.guild}\``);

            return interaction.reply({ content: `Do you want to donate **${donation}**${emoji} to **${guild.name}**?`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();

                    const stats = await getUserSchema(interaction.user.id);
                    if (!stats || stats[currency] < donation) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have **${donation}**${emoji} (current balance: ${stats ? stats[currency] : 0}${emoji})`);
                        return;
                    };

                    // Update users table
                    await updateUsers(interaction.user.id, {
                        [currency]: { type: "increment", value: -donation },
                        donatedtotal: { type: "increment", value: donation }
                    });

                    // Daily Quests
                    dailies[9].update(interaction, donation);

                    // Achievements
                    achievements[59].check(interaction, interaction.user), achievements[60].check(interaction, interaction.user), achievements[61].check(interaction, interaction.user), achievements[62].check(interaction, interaction.user), achievements[63].check(interaction, interaction.user);

                    // Add guild donation
                    await addGuildDonation(guild.id, interaction.user.id, currency, donation);

                    if (interaction.channel?.isSendable()) interaction.channel.send(`${interaction.user.username} has donated **${donation}**${emoji} to **${guild.name}**!`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });

            });
        } else if (subcommand === "donations") {
            const guildid = interaction.options.getString('id');

            const guild = await getGuildSchema(`${guildid || stats.guild}`);
            if (!guild) return interaction.reply(`Couldn't find guild with ID \`${guildid || stats.guild}\``);

            const guildMembers = await getUserSchemas(guild.members);
            const members = guildMembers.map((e) => ({
                id: e.id,
                name: e.name,
                lastdaily: e.lastdaily,
                status: e.id === guild.master ? " (Guild Master)" : guild.elders.includes(e.id) ? " (Elder)" : "",
                value: e.id === guild.master ? 2 : guild.elders.includes(e.id) ? 1 : 0
            }));
            members.sort((a, b) => b.value - a.value);

            const donations = await getGuildDonationSchemas(guild.id, undefined, "coins");
            if (!donations.length) return interaction.reply(`Couldn't find any donation logs for your guild`);

            const currentWeek = Math.ceil((Date.now() - donationWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
            const pagesTotal = currentWeek - Math.min(...donations.map((donation) => donation.week)) + 1;

            let currPage = interaction.options.getInteger('page') ?? 1;
            if (currPage > pagesTotal && currPage < 1) currPage = 1;

            const Embed = new EmbedBuilder()
                .setTitle(`${guild.name} Weekly Donations`)
                .setColor(guild.color as ColorResolvable || 0xbbffff)
                .setThumbnail(guild.icon || 'https://i.imgur.com/JEvfGSR.png')
                .setDescription(getDonationsPageWeek(donations, members, currentWeek, currPage))
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            if (pagesTotal === 1) return interaction.reply({ embeds: [Embed] });
            return interaction.reply({ embeds: [Embed], components: [PageRow] }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', (r) => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else if (r.customId === "next") {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    Embed.setDescription(getDonationsPageWeek(donations, members, currentWeek, currPage)).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed] });
                });
            });
        } else if (subcommand === "levelup") {
            const guild = stats.guild ? await getGuildSchema(stats.guild) : undefined;
            if (!guild || guild.master !== interaction.user.id) return interaction.reply(`You don't own a guild.`);

            const price = upgradePrice(guild.level);
            if (price > guild.treasury) return interaction.reply(`Your guild does not have enough coins in the treasury to upgrade (**${guild.treasury}**/${price}<:coins:872926669055356939>)`);

            return interaction.reply({ content: `Are you sure you want to upgrade **${guild.name}** to level **${guild.level + 1}** for **${price}**<:coins:872926669055356939>?`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();

                    const guild = stats.guild ? await getGuildSchema(stats.guild) : undefined;
                    if (!guild || guild.master !== interaction.user.id) return interaction.reply(`You don't own a guild.`);

                    const price = upgradePrice(guild.level);
                    if (price > guild.treasury) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`Your guild does not have enough coins in the treasury to upgrade (**${guild.treasury}**/${price}<:coins:872926669055356939>)`);
                        return;
                    };

                    // Update guilds table
                    await updateGuilds(guild.id, {
                        level: { type: "increment", value: 1 },
                        treasury: { type: "increment", value: -price },
                        tokens: { type: "increment", value: 1 },
                        lastlevelup: { type: "set", value: new Date() }
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`Successfully upgraded **${guild.name}** to level **${guild.level + 1}**!`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });

            });
        } else if (subcommand === "upgrade") {
            const perks = ["membercap", "xpbuff", "lootbuff", "cdreduction", "atkbuff", "hpbuff", "defbuff"] as const;
            const perk = interaction.options.getString('perk', true) as (typeof perks)[number];
            const perkName = { "membercap": "Guild Size", "xpbuff": "XP Buffs", "lootbuff": "Loot Buffs", "cdreduction": "Timers", "atkbuff": "ATK & MD Buff", "hpbuff": "HP Buff", "defbuff": "DEF & MR Buff" }[perk];

            const guild = stats.guild ? await getGuildSchema(stats.guild) : undefined;
            if (!guild || guild.master !== interaction.user.id) return interaction.reply(`You don't own a guild.`);

            if (!guild.tokens) return interaction.reply(`**${guild.name}** does not have any tokens left. Try again after leveling up.`);
            if (guild[perk] >= 10) return interaction.reply(`**${guild.name}** has already reached the maximum level for the **${perkName}** perk.`);

            if (["atkbuff", "hpbuff", "defbuff"].includes(perk)) {
                if (guild.xpbuff !== 10 || guild.lootbuff !== 10) return interaction.reply(`Please upgrade the **XP Buffs** and **Loot Buffs** perks to level 10 first.`);
            };

            return interaction.reply({ content: `Are you sure you want to upgrade **${perkName}** to level **${guild[perk] + 1}** by using 1 out of your currently available ${guild.tokens === 1 ? "1 token" : `${guild.tokens} tokens`}?`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();

                    const guild = stats.guild ? await getGuildSchema(stats.guild) : undefined;
                    if (!guild || guild.master !== interaction.user.id) return interaction.reply(`You don't own a guild.`);

                    if (!guild.tokens) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`**${guild.name}** does not have any tokens left. Try again after leveling up.`);
                        return;
                    };
                    if (guild[perk] >= 10) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`**${guild.name}** has already reached the maximum level the **${perkName}** perk.`);
                        return;
                    };

                    // Update guilds table
                    await updateGuilds(guild.id, {
                        [perk]: { type: "increment", value: 1 },
                        tokens: { type: "increment", value: -1 },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`Successfully upgraded the **${perkName}** perk to level **${guild[perk] + 1}**!`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });

            });
        } else if (subcommand === "convert") {
            const amount = interaction.options.getInteger('amount', true);
            if (amount < 1) return interaction.reply(`You can't convert less than 1 <:genesis_gems:1034179687720681492>`);
            if (amount > 100000) return interaction.reply(`You can't convert more than 100000 <:genesis_gems:1034179687720681492> at once`);

            const guild = stats.guild ? await getGuildSchema(stats.guild) : undefined;
            if (!guild || guild.master !== interaction.user.id) return interaction.reply(`You don't own a guild.`);

            if (guild.treasury_gems < amount) return interaction.reply(`**${guild.name}** doesn't have **${amount}**<:genesis_gems:1034179687720681492> in the treasury to convert (**${guild.treasury_gems}**/${amount}<:genesis_gems:1034179687720681492>)`);

            return interaction.reply({ content: `Are you sure you want to convert **${amount}**<:genesis_gems:1034179687720681492> into **${1000 * amount}**<:coins:872926669055356939>? (gems to coins conversion = 1:1000)`, components: [OfferRow] }).then(msg => {

                const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 45000 });
                const cancel = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "cancel", componentType: ComponentType.Button, time: 45000 });

                confirm.on('collect', async () => {
                    confirm.stop(), cancel.stop();

                    const guild = stats.guild ? await getGuildSchema(stats.guild) : undefined;
                    if (!guild || guild.master !== interaction.user.id) return interaction.reply(`You don't own a guild.`);

                    if (guild.treasury_gems < amount) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`**${guild.name}** doesn't have **${amount}**<:genesis_gems:1034179687720681492> in the treasury to convert (**${guild.treasury_gems}**/${amount}<:genesis_gems:1034179687720681492>)`);
                        return;
                    };

                    // Update guilds table
                    await updateGuilds(guild.id, {
                        treasury_gems: { type: "increment", value: -amount },
                        treasury: { type: "increment", value: 1000 * amount },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`Converted **${amount}**<:genesis_gems:1034179687720681492> into **${1000 * amount}**<:coins:872926669055356939>`);
                });

                cancel.on('collect', () => {
                    confirm.stop(), cancel.stop();
                    if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
                });

            });
        } else if (subcommand === "find") {
            const name = interaction.options.getString('name') || "";
            const page = interaction.options.getInteger('page') ?? 1;

            const guilds = (await getGuildSchemas("*")) as (GuildSchema & { rank?: number; })[];
            if (!guilds[0]) return interaction.reply(`There are no guilds`);
            guilds.sort((a, b) => b.level - a.level).forEach((e, i) => e.rank = i + 1);

            let matchingGuilds = searchGuild(name, guilds);

            if (matchingGuilds.length === 0) return interaction.reply(`Couldn't find any guilds matching \`${name}\``);

            // Setup Pages
            const elementsPerPage = 5;
            const pagesTotal = Math.ceil(matchingGuilds.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            // Filter items to show on the current page
            let showItems = showPage(currPage, matchingGuilds, elementsPerPage);

            // Join elements to string
            let desc = showItems.map((e) => `**${e.name}** (Guild Rank #${e.rank})\n<:barg:994958341128339536>Join Code: \`${e.id}\` | ${e.canjoin ? "Everyone can join" : "Invite only"} | \`(${e.members.length}/${10 + Math.min(e.level - 1, 10)})\``).join("\n\n");

            const Embed = new EmbedBuilder()
                .setColor(matchingGuilds[0].color as ColorResolvable || 0xbbffff)
                .setTitle(name ? `Guilds matching "${name}"` : "Guilds")
                .setThumbnail(matchingGuilds[0].icon || 'https://i.imgur.com/JEvfGSR.png')
                .setDescription(desc)
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            if (pagesTotal === 1) return interaction.reply({ embeds: [Embed] });
            return interaction.reply({ embeds: [Embed], components: [PageRow] }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', async r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    showItems = showPage(currPage, matchingGuilds, elementsPerPage);
                    desc = showItems.map((e) => `**${e.name}** (Guild Rank #${e.rank})\n<:barg:994958341128339536>Join Code: \`${e.id}\` | ${e.canjoin ? "Everyone can join" : "Invite only"} | \`(${e.members.length}/${10 + Math.min(e.level - 1, 10)})\``).join("\n\n");

                    Embed.setDescription(desc).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed] });
                });

            });
        };
    },
    async executeButtonInteraction({ interaction }) {
        const [imageType, id] = interaction.customId.split("-").slice(2).join("-").split(":");

        // Update guilds table
        await updateGuilds(id, {
            [imageType === 'icon' ? 'icon' : 'banner']: { type: "set", value: null },
        });

        interaction.followUp({ content: `${interaction.user} has removed the ${imageType} of the guild with ID \`${id}\`` });
    },
};

export default exportCommand;
