const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'chika',
	description: 'Chika Fujiwara',
	execute(message, args) {
  const Embed = new MessageEmbed()
  .setColor(0xbbffff)
  .setImage("https://imgur.com/WreQIoA.jpg")
  .setDescription("**Chika Fujiwara**\nKaguya-Sama: Love is war")
  message.channel.send(Embed);
	},
};