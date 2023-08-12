const { EmbedBuilder } = require("discord.js");
const math = require('mathjs');
const { achievements } = require("../Modules/achievements.js");

module.exports = {
	name: 'math',
	description: 'see your level',
	execute(interaction) {

        let resp;
        const calculation = interaction.options.getString('calculation');
        const ephemeral = interaction.options.getString('ephemeral') || "false";

        try {
            resp = math.evaluate(calculation);
        } catch (e) {
            return interaction.reply("Please input a valid calculation.");
        };

        const Embed = new EmbedBuilder()
        .setTitle('Camelot Calculator')
        .setColor(0xbbffff)
        .addFields({name: `${calculation} =`, value: `\`\`\`js\n${resp}\`\`\``})
        interaction.reply({ embeds: [Embed], ephemeral: ephemeral === "true" });

        // Achievements
        if (resp == 42) achievements[49].check(interaction);
    },
};