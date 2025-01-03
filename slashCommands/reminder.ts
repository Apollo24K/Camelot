import { updateUsers } from "../Modules/queries";
import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'reminder',
    async execute({ interaction, author }) {
        const reminder = interaction.options.getString('select');

        if (reminder === "pulls") {
            updateUsers(interaction.user.id, { pullreminder: { type: 'set', value: author.schema.pullreminder ? 0 : 1 } });
            return interaction.reply(`${author.schema.pullreminder ? "Disabled" : "Enabled"} pull reminders`);
        };

        if (reminder === "votes") {
            updateUsers(interaction.user.id, { votereminder: { type: 'set', value: author.schema.votereminder ? 0 : 1 } });
            return interaction.reply(`${author.schema.votereminder ? "Disabled" : "Enabled"} vote reminders`);
        };
    },
};

export default exportCommand;
