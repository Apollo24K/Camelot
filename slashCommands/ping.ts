import { replyToCommand } from "../Modules/interactionResponses";
import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'ping',
    earlyAcknowledgement: "public",
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction }) {

        return replyToCommand(interaction, { content: `pong! 🏓 ${Math.round(interaction.client.ws.ping)}ms` });

    },
};

export default exportCommand;
