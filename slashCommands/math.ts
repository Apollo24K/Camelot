import { EmbedBuilder } from "discord.js";
import * as math from 'mathjs';
import { achievements } from "../Modules/achievements";
import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'math',
    async execute({ interaction }) {
        let resp;
        const calculation = interaction.options.getString('calculation') ?? "";
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
        await interaction.reply({ embeds: [Embed], ephemeral });

        // Achievements
        if (resp == 42) achievements[49].check(interaction);
    },
};

export default exportCommand;
