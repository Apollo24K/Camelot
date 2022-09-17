const { db, query } = require("../db_handler.js");

module.exports = {
    name: 'open',
	description: 'open a lootbox',
	execute(interaction) {
        
        db.serialize(async () => {
            var stats = await query(`SELECT lootbox FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];
            if (!stats?.lootbox) return interaction.reply("You don't have any lootboxes left");
            
            let addCoins = Math.floor(248 + (270*Math.random()) + (210*Math.floor(Math.random()+0.2)));
            let addShards = {
                "ss": Math.floor(Math.random()+0.17)+Math.floor(Math.random()+0.17),
                "s": Math.floor(Math.random()+0.12)+Math.floor(Math.random()+0.12)+Math.floor(Math.random()+0.12),
                "a": Math.floor(Math.random()+0.19)+Math.floor(Math.random()+0.19)+Math.floor(Math.random()+0.19),
                "b": Math.floor(Math.random()+0.18)+Math.floor(Math.random()+0.18)+Math.floor(Math.random()+0.18)+Math.floor(Math.random()+0.18),
                "c": 2*Math.floor(Math.random()+0.2)+2*Math.floor(Math.random()+0.2)+Math.floor(Math.random()+0.24),
                "d": 3*Math.floor(Math.random()+0.25)+2*Math.floor(Math.random()+0.3)+2*Math.floor(Math.random()+0.4)+Math.floor(Math.random()+0.5),
            };
            let addTickets = {
                "ss": Math.floor(Math.random()+0.1),
                "s": Math.floor(Math.random()+0.12)+Math.floor(Math.random()+0.12),
                "a": Math.floor(Math.random()+0.18)+Math.floor(Math.random()+0.18),
                "b": Math.floor(Math.random()+0.24)+Math.floor(Math.random()+0.24)+Math.floor(Math.random()+0.24),
                "c": Math.floor(Math.random()+0.4)+Math.floor(Math.random()+0.4)+Math.floor(Math.random()+0.4),
                "d": 1 + 2*Math.floor(Math.random()+0.6)+Math.floor(Math.random()+0.7)+2*Math.floor(Math.random()+0.4)+Math.floor(Math.random()+0.6),
            };

            let obtShards = Object.entries(addShards).filter((e) => e[1]);
            let obtTickets = Object.entries(addTickets).filter((e) => e[1]);

            let shardEmojis = {"ss":"<:ss_shard:917203009543503892>","s":"<:s_shard:917202925514817566>","a":"<:a_shard:917202904862052392>","b":"<:b_shard:917202862851899392>","c":"<:c_shard:917202862499582002>","d":"<:d_shard:917202840563363891>"};
            let ticketEmojis = {"ss":"<:ss_ticket:927503239396622336>","s":"<:s_ticket:927642487705722890>","a":"<:a_ticket:929420377946472508>","b":"<:b_ticket:929420396535615519>","c":"<:c_ticket:929420424645853214>","d":"<:d_ticket:929420447102152714>"};

            let shardmsg = "";
            let ticketmsg = "";
            obtShards.forEach((e) => shardmsg += `${e[1]}x ${shardEmojis[e[0]]}, ` );
            obtTickets.forEach((e) => ticketmsg += `${e[1]}x ${ticketEmojis[e[0]]}, ` );

            await query(`UPDATE users SET lootbox = lootbox - 1, coins = coins + ${addCoins}, ssshard = ssshard + ${addShards["ss"]}, sshard = sshard + ${addShards["s"]}, ashard = ashard + ${addShards["a"]}, bshard = bshard + ${addShards["b"]}, cshard = cshard + ${addShards["c"]}, dshard = dshard + ${addShards["d"]}, ssticket = ssticket + ${addTickets["ss"]}, sticket = sticket + ${addTickets["s"]}, aticket = aticket + ${addTickets["a"]}, bticket = bticket + ${addTickets["b"]}, cticket = cticket + ${addTickets["c"]}, dticket = dticket + ${addTickets["d"]} WHERE id = ${interaction.user.id}`);
            
            interaction.reply(`You've opened a lootbox! <a:MikuGold:942200295855890483>\n**Coins**: ${addCoins}<:coins:872926669055356939>\n**Shards**: ${shardmsg.slice(0, -2)}\n**Tickets**: ${ticketmsg.slice(0, -2)}`)
        });

    },
};