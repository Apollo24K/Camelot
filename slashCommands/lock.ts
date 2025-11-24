import { search, searchAnimeTitle } from "../Modules/functions.js";
import { updateUsersAndCache } from "../Modules/queries.js";
import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'lock',
    async execute({ interaction, author }) {
        const subcommand = interaction.options.getSubcommand();

        const stats = author.schema;

        if (subcommand === "characters") {
            const choice = [...new Set((interaction.options.getString('characters') || "").split(",").map((e: string) => e.trim()))];

            const chars: any[] = [];
            choice.forEach((c) => {
                const char = search(c, [0], interaction, true);
                if (char?.name && !chars.includes(char) && !stats.charlock.includes(char.id)) chars.push(char);
            });

            if (chars.length === 0) return interaction.reply(`No match found`);
            if (chars.length > 100) return interaction.reply(`You can't lock more than 100 chars at once`);
            if (chars.length + stats.charlock.length > 100) return interaction.reply(`You can't lock more than 100 characters`);

            await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates: {
                    charlock: { type: 'append_unique', value: chars.map(c => c.id) },
                },
            });

            return interaction.reply(`Locked **${chars.map((c) => c.name.slice(0, 20)).join(", ").length > 1800 ? (chars.map((c) => c.name.slice(0, 20)).join(", ") + " __+ more__") : chars.map((c) => c.name.slice(0, 20)).join(", ")}**`);
        };

        if (subcommand === "anime") {
            const choice = [...new Set((interaction.options.getString('anime') || "").split(",").map((e: string) => e.trim()))];

            const animes: any[] = [];
            choice.forEach((a) => {
                const anime = searchAnimeTitle(a, interaction, true);
                if (anime?.name && !animes.includes(anime) && !stats.animelock.includes(anime.id)) animes.push(anime);
            });

            if (animes.length === 0) return interaction.reply(`No match found`);
            if (animes.length + stats.animelock.length > 5) return interaction.reply(`You can't lock more than 5 anime`);

            await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates: {
                    animelock: { type: 'append_unique', value: animes.map(a => a.id) },
                },
            });

            return interaction.reply(`Locked **${animes.map((c) => c.name.slice(0, 20)).join(", ").length > 1800 ? (animes.map((c) => c.name.slice(0, 20)).join(", ") + " __+ more__") : animes.map((c) => c.name.slice(0, 20)).join(", ")}**`);
        };
    },
};

export default exportCommand;
