const { MessageEmbed } = require("discord.js");
module.exports = {
    name: 'avatar',
    description: 'Shows Avatar',
    execute(message, args) {
        var user = message.mentions.users.first();
        if(user) {
            const avatarEmbedOther = new MessageEmbed()
                .setImage(user.displayAvatarURL({ dynamic: true }) + "?size=2048")
                .setColor(0xbbffff)
            message.channel.send(avatarEmbedOther);
        } else {
            const avatarEmbedSelf = new MessageEmbed()
                .setImage(message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
                .setColor(0xbbffff)
            message.channel.send(avatarEmbedSelf);
        }
    },
};