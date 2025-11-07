import { dailies } from "../Modules/dailyQuests";
import { dungeonTempBan } from "../Modules/components";
import { SlashCommand } from "../types";
import { getUserSchema, getGuildSchema } from "../Modules/queries";

const exportCommand: SlashCommand = {
    name: 'cd',
    async execute({ interaction, author }) {

        const user = interaction.options.getUser('user') ?? interaction.user;

        const stats = user.id === interaction.user.id ? author.schema : await getUserSchema(user.id);
        if (!stats) return interaction.reply(`${user.id === interaction.user.id ? "You haven't" : `${user.username} hasn't started`} playing yet.`);

        const guild = stats.guild ? await getGuildSchema(stats.guild) : undefined;

        // Limits
        let pullLimit = 5;
        let pullTimer = 45 * 60 * 1000;
        let dunLim = 10;

        // Messages
        let pull = `Your pulls are ready! => </pull:1011014030103674913>`;
        let dungeon = `Your runs are ready! => </dungeon:1014616988993204284>`;
        let dailymsg = `Your daily is ready! => </daily:1011371510759428136>`;
        let weeklymsg = `\`locked\` => see </premium:1011293280702578691>`;
        let dailyquest = `Your quests are ready! => </quests:1087099255652622433>`;
        let vote = `You can [vote](<https://rank.top/bot/camelot/vote>) now! => </vote:1010546185792135198>`;
        let survey = author.schema.discovered_via ? "" : `\n**Survey**: You can take a survey now! => </survey:1433782177979437108>`;

        if (stats.premium) {
            // Pulls & Dungeon
            switch (stats.premium) {
                case 1: pullLimit += 1; pullTimer = 40 * 60 * 1000; dunLim = 12; break;
                case 2: pullLimit += 2; pullTimer = 40 * 60 * 1000; dunLim = 13; break;
                case 3: pullLimit += 3; pullTimer = 40 * 60 * 1000; dunLim = 15; break;
                case 4: pullLimit += 3; pullTimer = 35 * 60 * 1000; dunLim = 15; break;
                case 5: pullLimit += 3; pullTimer = 30 * 60 * 1000; dunLim = 16; break;
                case 6: pullLimit += 4; pullTimer = 30 * 60 * 1000; dunLim = 18; break;
                case 7: pullLimit += 5; pullTimer = 30 * 60 * 1000; dunLim = 20; break;
                default: false; break;
            }
            // Weekly
            if (stats.weeklyclaimed) {
                const now = new Date();
                const dayOfWeek = now.getDay();
                const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
                const nextSunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 0, 0, 0);

                let s = nextSunday.getTime() - now.getTime();
                let dLeft = Math.floor(s / (1000 * 60 * 60 * 24));
                s %= (1000 * 60 * 60 * 24);
                let hLeft = Math.floor(s / (1000 * 60 * 60));
                s %= (1000 * 60 * 60);
                let mLeft = Math.floor(s / (1000 * 60));

                weeklymsg = `${dLeft ? `**${dLeft}**d ` : ""}${hLeft ? `**${hLeft}**h ` : ""}**${mLeft + 1}**min left`;
            } else {
                weeklymsg = `Your weekly is ready! => \`/weekly\``;
            }
        };
        if (guild) pullTimer -= (60 * 1000 * guild.cdreduction);

        // Pulls
        if (stats.pullcount >= pullLimit) pull = `**${Math.ceil((pullTimer + (stats.lastpull?.getTime() ?? 0) - new Date().getTime()) / (60 * 1000))}** min left`;
        // Dungeon
        if (dungeonTempBan.has(user.id)) dungeon = `\`banned\` for **${Math.ceil((dungeonTempBan.get(user.id)?.ends - Date.now()) / (60 * 1000))}**min`;
        else if (stats.dungeon_limit >= dunLim) dungeon = `${(7 - (new Date().getHours() % 8)) ? `**${7 - (new Date().getHours() % 8)}**h` : ""} **${60 - new Date().getMinutes()}**min left`;
        // Daily
        if (stats.dailyclaimed) dailymsg = `${(23 - new Date().getHours()) ? `**${23 - new Date().getHours()}**h` : ""} **${60 - new Date().getMinutes()}**min left`;
        // Daily Quests
        if (Object.keys(stats.dailies).length >= 4 && Object.entries(stats.dailies).reduce((acc, e) => acc + (dailies[e[0] as any].check(e[1]) ? 1 : 0), 0) >= 4) dailyquest = `${(23 - new Date().getHours()) ? `**${23 - new Date().getHours()}**h` : ""} **${60 - new Date().getMinutes()}**min left`;
        // Vote
        if (stats.lastvote && ((new Date().getTime() - (stats.lastvote?.getTime() ?? 0)) < 12 * 60 * 60 * 1000)) {
            let hr = Math.floor(((12 * 60 * 60 * 1000) - (new Date().getTime() - (stats.lastvote?.getTime() ?? 0))) / (60 * 60 * 1000));
            let min = Math.floor((((12 * 60 * 60 * 1000) - (new Date().getTime() - (stats.lastvote?.getTime() ?? 0))) % (60 * 60 * 1000)) / (60 * 1000)) + 1;
            if (min === 60) min = 0, hr++;
            vote = `${hr ? `**${hr}**h ` : ""}${`**${min}**min`} left`;
        };

        return interaction.reply(`**Pulls**: ${pull}\n**Dungeon**: ${dungeon}\n**Daily**: ${dailymsg}\n**Weekly**: ${weeklymsg}\n**Quests**: ${dailyquest}\n**Vote**: ${vote}${survey}`);
    },
};

export default exportCommand;
