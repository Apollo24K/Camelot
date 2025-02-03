import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'boss',
    async execute({ interaction, author, server, locale }) {

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "hunt") {
            const command = interaction.client.slashCommands.get("boss-hunt") as SlashCommand | undefined;
            if (command) return command.execute({ interaction, author, server, locale });
        };

        if (subcommand === "rush") {
            const command = interaction.client.slashCommands.get("boss-rush") as SlashCommand | undefined;
            if (command) return command.execute({ interaction, author, server, locale });
        };

        return interaction.reply("Invalid subcommand. Please use `/boss hunt` or `/boss rush`");
    },
};

export default exportCommand;
