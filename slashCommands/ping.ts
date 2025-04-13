import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'ping',
    async execute({ interaction }) {
        return interaction.reply({ content: `pong! 🏓 ${interaction.client.ws.ping}ms` });
    },
};

export default exportCommand;
