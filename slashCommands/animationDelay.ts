import { updateUsers } from '../Modules/queries';
import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'delay',
    async execute({ interaction, author }) {
        if (!author.schema.premium) return interaction.reply("This is a `/premium` feature. It changes the animation delay during a battle. If you're interested in supporting us, please see our patreon! <:RaphiSmile:868998036645380197>");

        const delay = interaction.options.getInteger('int') as number;
        if (delay < 200 || delay > 1200) return interaction.reply("Please provide a number between 200-1200");

        updateUsers(interaction.user.id, { animationdelay: { type: 'set', value: delay } });

        interaction.reply(`Your animation delay was set to ${delay}ms\nTry it out in the \`/dungeon\` !`);
    },
};

export default exportCommand;
