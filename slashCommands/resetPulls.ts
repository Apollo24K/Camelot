import { updateUsersAndCache } from '../Modules/queries';
import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'rp',
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction, author }) {

        let pullLimit = 5;
        switch (author.schema.premium) {
            case 1: pullLimit += 1; break;
            case 2: pullLimit += 2; break;
            case 3: pullLimit += 3; break;
            case 4: pullLimit += 3; break;
            case 5: pullLimit += 3; break;
            case 6: pullLimit += 4; break;
            case 7: pullLimit += 5; break;
            default: false; break;
        };

        if (author.schema.pullcount < pullLimit) return interaction.reply("You still have some pulls left.");
        if (!author.schema.pullresets) return interaction.reply(`You don't have any pull resets. You can obtain them by voting (**/vote**)`);

        await updateUsersAndCache(interaction.client, interaction.user.id, {
            updates: {
                pullcount: { type: 'set', value: 0 },
                pullresets: { type: 'increment', value: -1 }
            },
        });

        return interaction.reply(`Resetted your pull counter. You can pull again! (**${author.schema.pullresets}** left)`);
    },
};

export default exportCommand;
