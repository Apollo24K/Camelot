const { MessageEmbed } = require('discord.js');
var fs = require('fs');

function format(seconds){
        function pad(s){
          return (s < 10 ? '0' : '') + s;
        }
        var hours = Math.floor(seconds / (60*60));
        var minutes = Math.floor(seconds % (60*60) / 60);
        var seconds = Math.floor(seconds % 60);
      
        return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
};

module.exports = {
	name: 'info',
	description: 'camelot',
	execute(message, args, client, cVersion) {
        
        var ccgUsers = JSON.parse(fs.readFileSync('Storage/ccgUsers.json', 'utf8'));

        const embed = new MessageEmbed()
        .setTitle('Camelot')
        .setColor(0xbbffff)
        .setThumbnail("https://i.imgur.com/WWM4K98.png")
        .setFooter(`Camelot ${cVersion} • Made by Apollo24 & PokeLink`, "https://i.imgur.com/syj1LqO.jpeg")
        .setDescription("Absent in the early Arthurian material, Camelot came to be described as the fantastic capital of Arthur's realm and a symbol of the Arthurian world.")
        .addFields(
                { name: 'Stats️', value: `Servers: **${client.guilds.cache.size}**\nPlayers: **${Object.keys(ccgUsers).length}**`, inline: true },
                { name: '_ _', value: `RAM: **${Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 10) / 10}MB**\nUptime: **${format(process.uptime())}**`, inline: true },
        )
        message.channel.send(embed);
	},
};