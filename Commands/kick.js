const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'kick',
	description: 'kick users',
	execute(message, args) {
        const kUser = message.guild.member(message.mentions.users.first());
        if (!args[0]) return message.channel.send('Please mention someone');
        if (!kUser) return message.channel.send(`I can't find ${args[0]}`);
        if (!message.member.hasPermission('KICK_MEMBERS')) return message.channel.send("You can't kick users");
        if (kUser.hasPermission('MANAGE_GUILD')) return message.channel.send("That user can't be kicked");
    
        const kReason = args.join(" ").slice(22);
        if (kReason) {
          const kickEmbed = new MessageEmbed()
          .setTitle("Kick")
          .setColor(0xbbffff)
          .addField("Kicked user:", `${kUser}`)
          .addField("Kicked by:", `${message.author}`)
          .addField("Reason", kReason)
      
          message.guild.member(kUser).kick();
          message.channel.send(kickEmbed);
        } else {
    
        const kickEmbed = new MessageEmbed()
        .setTitle("Kick")
        .setColor(0xbbffff)
        .addField("Kicked user:", `${kUser}`)
        .addField("Kicked by:", `${message.author}`)
    
        message.guild.member(kUser).kick();
        message.channel.send(kickEmbed);
        }
	}
};