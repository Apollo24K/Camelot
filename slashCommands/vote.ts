import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'vote',
    async execute({ interaction, author }) {

        let canVote = "You can **vote** now!";

        if (author.schema.lastvote && ((new Date().getTime() - author.schema.lastvote.getTime()) < 12 * 60 * 60 * 1000)) {
            let hr = Math.floor(((12 * 60 * 60 * 1000) - (new Date().getTime() - author.schema.lastvote.getTime())) / (60 * 60 * 1000));
            let min = Math.floor((((12 * 60 * 60 * 1000) - (new Date().getTime() - author.schema.lastvote.getTime())) % (60 * 60 * 1000)) / (60 * 1000)) + 1;
            canVote = `You can't vote now. You'll have to wait ${hr ? `**${hr}**h ` : ""}${`**${min}**min`}`;
        };

        return interaction.reply(`${canVote}\nYou will be able to reset your pull counter afterwards with \`/rp\` (**${author.schema.pullresets}** left)\nYou can vote for Camelot at top.gg: https://top.gg/bot/706183309943767112/vote`);
    },
};

export default exportCommand;
