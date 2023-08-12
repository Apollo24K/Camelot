const { db, query } = require("../db_handler.js");
const { ActionRowBuilder, ButtonBuilder, ComponentType } = require("discord.js");

const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('open')
            .setLabel('Open!')
            .setStyle('Success'),
        new ButtonBuilder()
            .setCustomId('open_all')
            .setLabel('Open All!')
            .setStyle('Primary'),
    );

function rollItems(p,n,c=0) {
    let x = 0;
    for (let i=0; i<n; i++) x += Math.floor(Math.random()+p);
    return x+c;
};

module.exports = {
    name: 'lootbox',
	description: 'See your lb',
	execute(interaction) {
        
        const user = interaction.options.getUser('user') || interaction.user;

        db.serialize(async () => {
            let stats = await query(`SELECT lootbox FROM users WHERE id = ${user.id}`);
            stats = stats[0];
            if (!stats?.lootbox) return interaction.reply(`${user.id === interaction.user.id ? "You don't" : `**${user.username}** doesn't`} have any lootboxes left`);
            
            // Return without buttons if someone else
            if (user.id !== interaction.user.id) return interaction.reply(`**${user.username}** has **${stats.lootbox}** ${stats.lootbox === 1 ? "lootbox" : "lootboxes"} left!`);

            // Send message
            interaction.reply({ content: `You have **${stats.lootbox}** ${stats.lootbox === 1 ? "lootbox" : "lootboxes"} left! Open them with \`/open\` or \`/use lb\``, components: [row], fetchReply: true }).then((msg) => {

                const collector = msg.createMessageComponentCollector({filter: (r) => r.user.id === interaction.user.id && (r.customId === "open" || r.customId === "open_all"), componentType: ComponentType.Button, time: 60000 });

                collector.on('collect', async r => {
                    let stats = await query(`SELECT lootbox FROM users WHERE id = ${user.id}`);
                    stats = stats[0];
                    if (!stats.lootbox) return interaction.channel.send("You don't have any lootboxes left");

                    const openAmount = r.customId === "open_all" ? stats.lootbox : 1;

                    let addCoins = 0
                    for (let i=0; i < openAmount; i++) addCoins += Math.floor(248 + (270*Math.random()) + (210*Math.floor(Math.random()+0.2)));

                    let addShards = {
                        "ss": rollItems(0.17, 2*openAmount),
                        "s": rollItems(0.12, 3*openAmount),
                        "a": rollItems(0.19, 3*openAmount),
                        "b": rollItems(0.18, 4*openAmount),
                        "c": rollItems(0.2, 5*openAmount),
                        "d": rollItems(0.25, 8*openAmount, 1*openAmount),
                    };
                    let addTickets = {
                        "ss": rollItems(0.05, 1*openAmount),
                        "s": rollItems(0.08, 2*openAmount),
                        "a": rollItems(0.15, 2*openAmount),
                        "b": rollItems(0.2, 3*openAmount),
                        "c": rollItems(0.3, 3*openAmount),
                        "d": rollItems(0.5, 3*openAmount, 1*openAmount),
                    };

                    let obtShards = Object.entries(addShards).filter((e) => e[1]);
                    let obtTickets = Object.entries(addTickets).filter((e) => e[1]);

                    let shardEmojis = {"ss":"<:ss_shard:917203009543503892>","s":"<:s_shard:917202925514817566>","a":"<:a_shard:917202904862052392>","b":"<:b_shard:917202862851899392>","c":"<:c_shard:917202862499582002>","d":"<:d_shard:917202840563363891>"};
                    let ticketEmojis = {"ss":"<:ss_ticket:927503239396622336>","s":"<:s_ticket:927642487705722890>","a":"<:a_ticket:929420377946472508>","b":"<:b_ticket:929420396535615519>","c":"<:c_ticket:929420424645853214>","d":"<:d_ticket:929420447102152714>"};

                    let shardmsg = obtShards.map((e) => `${e[1]}x ${shardEmojis[e[0]]}`).join(", ");
                    let ticketmsg = obtTickets.map((e) => `${e[1]}x ${ticketEmojis[e[0]]}`).join(", ");

                    stats.lootbox -= openAmount;
                    await query(`UPDATE users SET lootbox = ${stats.lootbox}, coins = coins + ${addCoins}, ssshard = ssshard + ${addShards["ss"]}, sshard = sshard + ${addShards["s"]}, ashard = ashard + ${addShards["a"]}, bshard = bshard + ${addShards["b"]}, cshard = cshard + ${addShards["c"]}, dshard = dshard + ${addShards["d"]}, ssticket = ssticket + ${addTickets["ss"]}, sticket = sticket + ${addTickets["s"]}, aticket = aticket + ${addTickets["a"]}, bticket = bticket + ${addTickets["b"]}, cticket = cticket + ${addTickets["c"]}, dticket = dticket + ${addTickets["d"]} WHERE id = ${user.id}`);

                    interaction.channel.send(`You've opened a lootbox! <a:MikuGold:942200295855890483>\n**Coins**: ${addCoins}<:coins:872926669055356939>\n**Shards**: ${shardmsg}\n**Tickets**: ${ticketmsg}`);
                    if (stats.lootbox) interaction.editReply({ content: `You have **${stats.lootbox}** ${stats.lootbox === 1 ? "lootbox" : "lootboxes"} left! Open them with \`/open\` or \`/use lb\`` });
                    else interaction.editReply({ content: "You don't have any lootboxes left", components: [] });
                    
                });

            });
            
        });

    },
};