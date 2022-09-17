const { MessageEmbed } = require("discord.js");
const math = require('mathjs');
const { achievements } = require("../Modules/achievements.js");

module.exports = {
	name: 'math',
	description: 'see your level',
	execute(interaction) {

        let resp;
        let calculation = interaction.options.getString('calculation');

        try {
            resp = math.evaluate(calculation);
        } catch (e) {
            return interaction.reply("Please input a valid calculation.");
        };

        const Embed = new MessageEmbed()
        .setTitle('Camelot Calculator')
        .setColor(0xbbffff)
        .addField("The result is", `\`\`\`js\n${resp}\`\`\``)
        interaction.reply({ embeds: [Embed] });

        // Achievements
        if (resp == 42) achievements[49].check(interaction);

    },
};