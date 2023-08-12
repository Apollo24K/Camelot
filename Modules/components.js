/* eslint-disable no-unused-vars */
/* eslint-disable no-extra-semi */
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

const PageRow = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setEmoji('⏪')
            .setStyle('Secondary'),
        new ButtonBuilder()
            .setCustomId('next')
            .setEmoji('⏩')
            .setStyle('Secondary'),
    );

module.exports.PageRow = PageRow;

const OfferRow = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('confirm')
            .setEmoji('<:check_icon:683671903143067743>')
            .setLabel('confirm')
            .setStyle('Success'),
        new ButtonBuilder()
            .setCustomId('cancel')
            .setEmoji('<:stop_icon:683671917353369600>')
            .setLabel('cancel')
            .setStyle('Danger'),
    );

module.exports.OfferRow = OfferRow;

module.exports.requestVerification = new Map();