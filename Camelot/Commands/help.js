const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'help',
	description: 'command list',
	execute(message, args) {
        const embed = new MessageEmbed()
        .setTitle('Command List')
        .setColor(0xbbffff)
        .setThumbnail("https://i.imgur.com/WWM4K98.png")
        .addField("!help, !h, !cmd", `You're looking at it`)
        .addField("!camelot", `See some infos about Camelot 💎`)
        .addField("!math, !m", `Use the built in calculator`)
        .addField("!userstats", `See how many messages you've written`)
        .addField("!recommend, !rec, !r", `Some anime recommendations`)
        .addField("!emojilist, !el", `Get a list of emojis Camelot can use`)
        .addField("!avatar", `Get yours or someone else's Profile Picture`)
        .addField("!ping, !pong", `Pong! 🏓 See your Latency`)
        .addField("!random, !rand", `Get a random number between 0-100`)
        .addField("!flip, !f, !toss", `Flip a coin 💮`)
        .addField("!flipping, !fp", `Flip a coin based on your Latency`)
        .setTimestamp()
        .setFooter("Camelot V1.0.3 • Made by Apollo24", "https://i.imgur.com/syj1LqO.jpeg")
        message.channel.send(embed);
	},
};