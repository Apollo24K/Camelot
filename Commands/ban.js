const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'ban',
	description: 'ban users',
	execute(message, args) {
        const bUser = message.guild.member(message.mentions.users.first());
        if (!args[0]) return message.channel.send('Please mention someone');
        if (!bUser) return message.channel.send(`I can't find ${args[0]}`);
        if (!message.member.hasPermission('BAN_MEMBERS')) return message.channel.send("You can't ban users");
        if (bUser.hasPermission('MANAGE_GUILD')) return message.channel.send("That user can't be banned");
    
        const bReason = args.join(" ").slice(22);
        if (bReason) {
          const banEmbed = new MessageEmbed()
          .setTitle("Ban")
          .setColor(0xbbffff)
          .addField("Banned user:", `${bUser}`)
          .addField("Banned by:", `${message.author}`)
          .addField("Reason:", bReason)
      
          message.guild.member(bUser).ban();
          message.channel.send(banEmbed);
        } else {
    
        const banEmbed = new MessageEmbed()
        .setTitle("Ban")
        .setColor(0xbbffff)
        .addField("Banned user:", `${bUser}`)
        .addField("Banned by:", `${message.author}`)
    
        message.guild.member(bUser).ban();
        message.channel.send(banEmbed);
        }
	}
};