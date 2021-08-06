const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'purge',
	description: 'delete messages',
	execute(message, args) {
    const prefix = "!";
    if (message.content.startsWith(prefix + "purge")) {
        async function purge() {
          message.delete();
          if (!message.member.hasPermission('MANAGE_MESSAGES')) {
            message.channel.send("You can't use this command");
            return;
          };
          if (isNaN(args[0])) {
            message.channel.send("Please specify how many messages you'd like to delete\nUsage: `" + prefix + "purge <amount>`")
            return;
          };
          if (args[0] > 100) {
            message.channel.send("The number should be less than 100")
            return;
          };
          message.channel.bulkDelete(args[0])
            .catch(error => message.channel.send(`Error: ${error}`));
        }
        purge();
      };
	},
};