/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

const PageRow = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('prev')
            .setEmoji('⏪')
            .setStyle('SECONDARY'),
        new MessageButton()
            .setCustomId('next')
            .setEmoji('⏩')
            .setStyle('SECONDARY'),
    );

module.exports.PageRow = PageRow;

const OfferRow = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('confirm')
            .setEmoji('<:check_icon:683671903143067743>')
            .setLabel('confirm')
            .setStyle('SUCCESS'),
        new MessageButton()
            .setCustomId('cancel')
            .setEmoji('<:stop_icon:683671917353369600>')
            .setLabel('cancel')
            .setStyle('DANGER'),
    );

module.exports.OfferRow = OfferRow;