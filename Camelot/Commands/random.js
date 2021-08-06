const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'random',
	description: 'get a random number between 0-100',
	execute(message, args) {
        const gildas = Math.floor(Math.random() * 101);
        switch (gildas) {
          case 24 : message.channel.send('24 🎉'); break;
          case 42 : message.channel.send('42, Answer to the Ultimate Question of Life, the Universe, and Everything'); break;
          case 69 : message.channel.send('69 😉'); break;
          case 91 : message.channel.send('91 🏆'); break;
          default : message.channel.send(gildas); break;
        };
	},
};