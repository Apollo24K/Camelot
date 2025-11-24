import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'ping',
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction }) {

        return interaction.reply({ content: `pong! 🏓 ${Math.round(interaction.client.ws.ping)}ms` });

    },
};

export default exportCommand;
