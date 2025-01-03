import { anime } from "../Modules/anime";
import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'recommend',
    async execute({ interaction }) {
        return interaction.reply(anime[Math.floor(Math.random() * anime.length)].name);
    },
};

export default exportCommand;
