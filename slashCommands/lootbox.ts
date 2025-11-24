import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { SlashCommand } from "../types";
import { getCachedUserSchema, getUserSchema, updateUsersAndCache } from "../Modules/queries";

const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('open')
            .setLabel('Open!')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('open_all')
            .setLabel('Open All!')
            .setStyle(ButtonStyle.Primary),
    );

function rollItems(p: number, n: number, c: number = 0) {
    let x = 0;
    for (let i = 0; i < n; i++) x += Math.floor(Math.random() + p);
    return x + c;
};

const exportCommand: SlashCommand = {
    name: 'lootbox',
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction, author }) {

        const user = interaction.options.getUser('user') ?? interaction.user;

        const stats = user.id === interaction.user.id ? author.schema : await getCachedUserSchema(user.id, interaction.client);
        if (!stats?.lootbox) return interaction.reply(`${user.id === interaction.user.id ? "You don't" : `**${user.username}** doesn't`} have any lootboxes left`);

        // Return without buttons if someone else
        if (user.id !== interaction.user.id) return interaction.reply(`**${user.username}** has **${stats.lootbox}** ${stats.lootbox === 1 ? "lootbox" : "lootboxes"} left!`);

        // Send message
        return interaction.reply({ content: `You have **${stats.lootbox}** ${stats.lootbox === 1 ? "lootbox" : "lootboxes"} left! Open them with \`/open\` or \`/use lb\``, components: [row], fetchReply: true }).then((msg) => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && (r.customId === "open" || r.customId === "open_all"), componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', async r => {
                const stats = await getUserSchema(user.id);
                if (!stats?.lootbox) {
                    if (interaction.channel?.isSendable()) interaction.channel.send("You don't have any lootboxes left");
                    return;
                };

                const openAmount = r.customId === "open_all" ? stats.lootbox : 1;

                let addCoins = 0;
                for (let i = 0; i < openAmount; i++) addCoins += Math.floor(248 + (270 * Math.random()) + (210 * Math.floor(Math.random() + 0.2)));

                let addShards = {
                    "ss": rollItems(0.17, 2 * openAmount),
                    "s": rollItems(0.12, 3 * openAmount),
                    "a": rollItems(0.19, 3 * openAmount),
                    "b": rollItems(0.18, 4 * openAmount),
                    "c": rollItems(0.2, 5 * openAmount),
                    "d": rollItems(0.25, 8 * openAmount, 1 * openAmount),
                };
                let addTickets = {
                    "ss": rollItems(0.05, 1 * openAmount),
                    "s": rollItems(0.08, 2 * openAmount),
                    "a": rollItems(0.15, 2 * openAmount),
                    "b": rollItems(0.2, 3 * openAmount),
                    "c": rollItems(0.3, 3 * openAmount),
                    "d": rollItems(0.5, 3 * openAmount, 1 * openAmount),
                };

                const obtShards = Object.entries(addShards).filter((e) => e[1]);
                const obtTickets = Object.entries(addTickets).filter((e) => e[1]);

                const shardEmojis = { "ss": "<:ss_shard:917203009543503892>", "s": "<:s_shard:917202925514817566>", "a": "<:a_shard:917202904862052392>", "b": "<:b_shard:917202862851899392>", "c": "<:c_shard:917202862499582002>", "d": "<:d_shard:917202840563363891>" };
                const ticketEmojis = { "ss": "<:ss_ticket:927503239396622336>", "s": "<:s_ticket:927642487705722890>", "a": "<:a_ticket:929420377946472508>", "b": "<:b_ticket:929420396535615519>", "c": "<:c_ticket:929420424645853214>", "d": "<:d_ticket:929420447102152714>" };

                const shardmsg = obtShards.map((e) => `${e[1]}x ${shardEmojis[e[0] as keyof typeof shardEmojis]}`).join(", ");
                const ticketmsg = obtTickets.map((e) => `${e[1]}x ${ticketEmojis[e[0] as keyof typeof ticketEmojis]}`).join(", ");

                // Update user table
                await updateUsersAndCache(interaction.client, user.id, {
                    updates: {
                        lootbox: { type: "increment", value: -openAmount },
                        coins: { type: "increment", value: addCoins },
                        ssshard: { type: "increment", value: addShards["ss"] },
                        sshard: { type: "increment", value: addShards["s"] },
                        ashard: { type: "increment", value: addShards["a"] },
                        bshard: { type: "increment", value: addShards["b"] },
                        cshard: { type: "increment", value: addShards["c"] },
                        dshard: { type: "increment", value: addShards["d"] },
                        ssticket: { type: "increment", value: addTickets["ss"] },
                        sticket: { type: "increment", value: addTickets["s"] },
                        aticket: { type: "increment", value: addTickets["a"] },
                        bticket: { type: "increment", value: addTickets["b"] },
                        cticket: { type: "increment", value: addTickets["c"] },
                        dticket: { type: "increment", value: addTickets["d"] },
                    },
                });

                if (interaction.channel?.isSendable()) interaction.channel.send(`You've opened a lootbox! <a:MikuGold:942200295855890483>\n**Coins**: ${addCoins}<:coins:872926669055356939>\n**Shards**: ${shardmsg}\n**Tickets**: ${ticketmsg}`);
                if (stats.lootbox) interaction.editReply({ content: `You have **${stats.lootbox}** ${stats.lootbox === 1 ? "lootbox" : "lootboxes"} left! Open them with \`/open\` or \`/use lb\`` });
                else interaction.editReply({ content: "You don't have any lootboxes left", components: [] });
            });
        });
    },
};

export default exportCommand;
