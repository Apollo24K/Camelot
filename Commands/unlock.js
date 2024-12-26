import { db, query } from "../db_handler.js";
import { search, searchAnimeTitle } from "../Modules/functions.js";

module.exports = {
    name: 'unlock',
    description: 'unlock characters',
    execute(interaction) {

        const subcommand = interaction.options.getSubcommand();

        db.serialize(async () => {

            if (subcommand === "characters") {
                const { 0: stats } = await query(`SELECT charlock FROM users WHERE id = ${interaction.user.id}`);
                if (!stats) return interaction.reply(`You haven't started playing yet`);
                stats.charlock = JSON.parse(stats.charlock);

                const { 0: inv } = await query(`SELECT chars FROM characters WHERE id = ${interaction.user.id}`);
                inv.chars = JSON.parse(inv.chars);

                const choice = [...new Set((interaction.options.getString('characters') || "").split(",").map((e) => e.trim()))];

                let isAlreadyUnlocked = false;
                const chars = [];
                choice.forEach((c) => {
                    const char = search(c, inv.chars, interaction, true);
                    if (!stats.charlock.includes(char.id)) isAlreadyUnlocked = true;
                    if (char?.name && inv.chars.includes(char.id) && !chars.includes(char) && stats.charlock.includes(char.id)) chars.push(char);
                });

                if (chars.length === 0) return interaction.reply(isAlreadyUnlocked ? "Your selected characters are already unlocked" : `No match found`);
                // if (chars.length > 200) return interaction.reply(`You can't lock more than 200 chars at once`);

                // Unlock
                chars.forEach((char) => {
                    stats.charlock.splice(stats.charlock.indexOf(char.id), 1);
                });

                // Save
                await query(`UPDATE users SET charlock = '${JSON.stringify(stats.charlock)}' WHERE id = ${interaction.user.id}`);

                // Reply
                interaction.reply(`Unlocked **${chars.map((c) => c.name.slice(0, 20)).join(", ").length > 1800 ? (chars.map((c) => c.name.slice(0, 20)).join(", ") + " __+ more__") : chars.map((c) => c.name.slice(0, 20)).join(", ")}**`);
            };

            if (subcommand === "anime") {
                const { 0: stats } = await query(`SELECT animelock FROM users WHERE id = ${interaction.user.id}`);
                if (!stats) return interaction.reply(`You haven't started playing yet`);
                stats.animelock = JSON.parse(stats.animelock);

                const choice = [...new Set((interaction.options.getString('anime') || "").split(",").map((e) => e.trim()))];

                let isAlreadyUnlocked = false;
                const animes = [];
                choice.forEach((a) => {
                    const anime = searchAnimeTitle(a, interaction, true);
                    if (!stats.animelock.includes(anime.id)) isAlreadyUnlocked = true;
                    if (anime?.name && !animes.includes(anime) && stats.animelock.includes(anime.id)) animes.push(anime);
                });

                if (animes.length === 0) return interaction.reply(isAlreadyUnlocked ? "Your selected anime is already unlocked" : `No match found`);
                // if (animes.length > 200) return interaction.reply(`You can't give more than 200 chars at once`);

                // Unlock
                animes.forEach((anime) => {
                    stats.animelock.splice(stats.animelock.indexOf(anime.id), 1);
                });

                // Save
                await query(`UPDATE users SET animelock = '${JSON.stringify(stats.animelock)}' WHERE id = ${interaction.user.id}`);

                // Reply
                interaction.reply(`Unlocked **${animes.map((c) => c.name.slice(0, 20)).join(", ").length > 1800 ? (animes.map((c) => c.name.slice(0, 20)).join(", ") + " __+ more__") : animes.map((c) => c.name.slice(0, 20)).join(", ")}**`);
            };

        });

    },
};
