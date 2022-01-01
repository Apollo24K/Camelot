const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'flip',
	description: 'flip a coin',
	execute(message, args) {
        if (Math.floor(Math.random() * 2) === 1) {
            const embed = new MessageEmbed()
            .setTitle('Heads')
            .setColor(0xbbffff)
            message.channel.send(embed);
          } else {
            const embed = new MessageEmbed()
            .setTitle('Tails')
            .setColor(0xbbffff)
            message.channel.send(embed);
          }
	},
};