import { search, searchAnimeTitle } from "../Modules/functions.js";
import { updateUsers } from "../Modules/queries.js";
import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'unlock',
    async execute({ interaction, author }) {
        const subcommand = interaction.options.getSubcommand();

        const stats = author.schema;

        if (subcommand === "characters") {
            const choice = [...new Set((interaction.options.getString('characters') || "").split(",").map((e: string) => e.trim()))];

            let isAlreadyUnlocked = false;
            const chars: any[] = [];
            choice.forEach((c) => {
                const char = search(c, stats.chars, interaction, true);
                if (!stats.charlock.includes(char.id)) isAlreadyUnlocked = true;
                if (char?.name && stats.chars.includes(char.id) && !chars.includes(char) && stats.charlock.includes(char.id)) chars.push(char);
            });

            if (chars.length === 0) return interaction.reply(isAlreadyUnlocked ? "Your selected characters are already unlocked" : `No match found`);

            await updateUsers(interaction.user.id, {
                charlock: { type: 'remove_all', value: chars.map((c) => c.id) }
            });

            return interaction.reply(`Unlocked **${chars.map((c) => c.name.slice(0, 20)).join(", ").length > 1800 ? (chars.map((c) => c.name.slice(0, 20)).join(", ") + " __+ more__") : chars.map((c) => c.name.slice(0, 20)).join(", ")}**`);
        };

        if (subcommand === "anime") {
            const choice = [...new Set((interaction.options.getString('anime') || "").split(",").map((e: string) => e.trim()))];

            let isAlreadyUnlocked = false;
            const animes: any[] = [];
            choice.forEach((a) => {
                const anime = searchAnimeTitle(a, interaction, true);
                if (!stats.animelock.includes(anime.id)) isAlreadyUnlocked = true;
                if (anime?.name && !animes.includes(anime) && stats.animelock.includes(anime.id)) animes.push(anime);
            });

            if (animes.length === 0) return interaction.reply(isAlreadyUnlocked ? "Your selected anime is already unlocked" : `No match found`);

            await updateUsers(interaction.user.id, {
                animelock: { type: 'remove_all', value: animes.map((a) => a.id) }
            });

            return interaction.reply(`Unlocked **${animes.map((c) => c.name.slice(0, 20)).join(", ").length > 1800 ? (animes.map((c) => c.name.slice(0, 20)).join(", ") + " __+ more__") : animes.map((c) => c.name.slice(0, 20)).join(", ")}**`);
        };
    },
};

export default exportCommand;
