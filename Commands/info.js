const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'info',
	description: 'camelot',
	execute(message, args) {
        const embed = new MessageEmbed()
        .setTitle('Camelot')
        .setColor(0xbbffff)
        .setThumbnail("https://i.imgur.com/WWM4K98.png")
        .setFooter("Camelot V2.2.3 • Made by Apollo24 & PokeLink", "https://i.imgur.com/syj1LqO.jpeg")
        .setDescription("Absent in the early Arthurian material, Camelot came to be described as the fantastic capital of Arthur's realm and a symbol of the Arthurian world.")
        message.channel.send(embed);
	},
};