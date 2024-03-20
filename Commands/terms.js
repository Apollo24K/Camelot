const { EmbedBuilder } = require('discord.js');
const package = require('../package.json');

module.exports = {
    name: 'terms',
    description: 'terms of service and privacy policy',
    execute(interaction) {

        const Embed = new EmbedBuilder()
            .setTitle('Camelot')
            .setColor(0xbbffff)
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setDescription("Camelot's Terms of Service outlines the terms and guidelines players must follow when playing. Not knowing about them doesn't grant you protection against possible penalties and restrictions that may apply if you break them, so you better read them!\n\n[Terms of Service](<https://rank.top/bot/camelot?page=terms>)\n[Privacy Policy](<https://rank.top/bot/camelot?page=privacy>)")
            .setFooter({ text: `Camelot ${package.version} • Made by Apollo24 & PokeLinker`, iconURL: "https://i.imgur.com/RbLjdQ4.png" });
        return interaction.reply({ embeds: [Embed] });

    },
};