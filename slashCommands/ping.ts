import { SlashCommand } from '../types';
import { performance } from 'perf_hooks';

const exportCommand: SlashCommand = {
    name: 'ping',
    async execute({ interaction }) {
        return interaction.reply({ content: `pong! 🏓 ${Math.round(interaction.client.ws.ping)}ms` });

        // const ws = Math.round(interaction.client.ws.ping);

        // const t0 = performance.now();
        // await interaction.deferReply().catch(() => { });
        // const rest = Math.round(performance.now() - t0);

        // const content = `pong! 🏓 ws: ${ws}ms | rest: ${rest}ms`;
        // if (interaction.deferred) return interaction.editReply({ content });
        // else return interaction.reply({ content });
    },
};

export default exportCommand;
