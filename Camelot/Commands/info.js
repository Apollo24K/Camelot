const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'info',
	description: 'camelot',
	execute(message, args) {
        const embed = new MessageEmbed()
        .setTitle('Camelot')
        .setColor(0xbbffff)
        .setThumbnail("https://i.imgur.com/WWM4K98.png")
        .setTimestamp()
        .setFooter("Camelot V1.0.3 • Made by Apollo24", "https://i.imgur.com/syj1LqO.jpeg")
        .setDescription("Absent in the early Arthurian material, Camelot came to be described as the fantastic capital of Arthur's realm and a symbol of the Arthurian world.")
        message.channel.send(embed);
	},
};