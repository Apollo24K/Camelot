const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'asuna',
	description: 'Asuna Yuuki',
	execute(message, args) {
  const Embed = new MessageEmbed()
  .setColor(0xbbffff)
  .setImage("https://i.ibb.co/YZXYshc/asna.png")
  .setDescription("**Asuna Yuuki**\nSword Art Online")
  message.channel.send(Embed);
	},
};