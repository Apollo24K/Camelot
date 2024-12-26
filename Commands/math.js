import { EmbedBuilder } from "discord.js";
import math from 'mathjs';
import { achievements } from "../Modules/achievements";

module.exports = {
    name: 'math',
    description: 'see your level',
    execute(interaction) {

        let resp;
        const calculation = interaction.options.getString('calculation');
        const ephemeral = interaction.options.getBoolean('ephemeral') ?? true;

        try {
            resp = math.evaluate(calculation);
        } catch (e) {
            return interaction.reply({ content: "Please input a valid calculation", ephemeral });
        };

        const Embed = new EmbedBuilder()
            .setTitle('Camelot Calculator')
            .setColor(0xbbffff)
            .addFields({ name: `${calculation} =`, value: `\`\`\`js\n${resp}\`\`\`` });
        interaction.reply({ embeds: [Embed], ephemeral });

        // Achievements
        if (resp == 42) achievements[49].check(interaction);
    },
};
