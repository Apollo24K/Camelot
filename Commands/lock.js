import { db, query } from "../db_handler";
import { search, searchAnimeTitle } from "../Modules/functions";

module.exports = {
    name: 'lock',
    description: 'lock characters',
    execute(interaction) {

        const subcommand = interaction.options.getSubcommand();

        db.serialize(async () => {
            if (subcommand === "characters") {
                const { 0: stats } = await query(`SELECT charlock FROM users WHERE id = ${interaction.user.id}`);
                if (!stats) return interaction.reply(`You haven't started playing yet`);
                stats.charlock = JSON.parse(stats.charlock);

                const choice = [...new Set((interaction.options.getString('characters') || "").split(",").map((e) => e.trim()))];

                const chars = [];
                choice.forEach((c) => {
                    const char = search(c, [0], interaction, true);
                    if (char?.name && !chars.includes(char) && !stats.charlock.includes(char.id)) chars.push(char);
                });

                if (chars.length === 0) return interaction.reply(`No match found`);
                if (chars.length > 100) return interaction.reply(`You can't lock more than 100 chars at once`);
                if (chars.length + stats.charlock.length > 100) return interaction.reply(`You can't lock more than 100 characters`);

                // Lock
                chars.forEach((char) => {
                    if (!stats.charlock.includes(char)) stats.charlock.push(char.id);
                });

                // Save
                await query(`UPDATE users SET charlock = '${JSON.stringify(stats.charlock)}' WHERE id = ${interaction.user.id}`);

                // Reply
                interaction.reply(`Locked **${chars.map((c) => c.name.slice(0, 20)).join(", ").length > 1800 ? (chars.map((c) => c.name.slice(0, 20)).join(", ") + " __+ more__") : chars.map((c) => c.name.slice(0, 20)).join(", ")}**`);
            };

            if (subcommand === "anime") {
                const { 0: stats } = await query(`SELECT animelock FROM users WHERE id = ${interaction.user.id}`);
                if (!stats) return interaction.reply(`You haven't started playing yet`);
                stats.animelock = JSON.parse(stats.animelock);

                const choice = [...new Set((interaction.options.getString('anime') || "").split(",").map((e) => e.trim()))];

                const animes = [];
                choice.forEach((a) => {
                    const anime = searchAnimeTitle(a, interaction, true);
                    if (anime?.name && !animes.includes(anime) && !stats.animelock.includes(anime.id)) animes.push(anime);
                });

                if (animes.length === 0) return interaction.reply(`No match found`);
                if (animes.length + stats.animelock.length > 5) return interaction.reply(`You can't lock more than 5 anime`);

                // Lock
                animes.forEach((anime) => {
                    if (!stats.animelock.includes(anime)) stats.animelock.push(anime.id);
                });

                // Save
                await query(`UPDATE users SET animelock = '${JSON.stringify(stats.animelock)}' WHERE id = ${interaction.user.id}`);

                // Reply
                interaction.reply(`Locked **${animes.map((c) => c.name.slice(0, 20)).join(", ").length > 1800 ? (animes.map((c) => c.name.slice(0, 20)).join(", ") + " __+ more__") : animes.map((c) => c.name.slice(0, 20)).join(", ")}**`);
            };

        });

    },
};
