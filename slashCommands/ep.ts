import { cat1 } from "../Modules/functions";
import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'ep',
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction }) {

        let hp = interaction.options.getNumber('hp') ?? 1;
        let atk = interaction.options.getNumber('atk') ?? 1;
        let def = interaction.options.getNumber('def') ?? 1;
        let cr = interaction.options.getNumber('crit_rate') ?? 0.18;
        let cd = interaction.options.getNumber('crit_damage') ?? 1.25;
        let dodge = interaction.options.getNumber('dodge') ?? 0.1;
        if (hp > 1000000 || atk > 1000000 || def > 1000000 || cr > 1000000 || cd > 1000000 || dodge > 1000000) return interaction.reply("Please use values smaller than 1000000");

        return interaction.reply("" + Math.floor(((1 / (1 - cat1(dodge))) * (hp / Math.pow(0.99895, def)) / (200 / (atk * (1 + (cat1(cr) * (cd - 1)))))) * 100) / 100);
    },
};

export default exportCommand;
