const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'avatar',
    description: 'avatar',
    execute(interaction) {
        let user = interaction.options.getUser('user') || interaction.user;
        const Embed = new EmbedBuilder()
            .setImage(user.displayAvatarURL({ dynamic: true }) + "?size=2048")
            .setColor(0xbbffff);
        return interaction.reply({ embeds: [Embed] });
    },
};