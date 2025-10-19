import { dailies } from "../Modules/dailyQuests";
import { characters } from "../Modules/chars";
import { EmbedBuilder } from "discord.js";
import { SlashCommand } from '../types';
import { currencyEmojis } from '../Modules/components';
import { updateUsers } from '../Modules/queries';

function getHash(key: string, hash: number) {
    for (let i = 0; i < key.length; i++) {
        hash = ((hash << 5) - hash) + key.charCodeAt(i);
        hash |= 0;
    }
    return hash;
};

function getQuests(id: string, len: number) {
    const quests = new Set<number>();
    const key = new Intl.DateTimeFormat('en-UK', { timeZone: 'Europe/Berlin' }).format(new Date()).split("/").reverse().join("-") + id;
    let i = 0;
    while (quests.size < 4 && i < 100) {
        const hash = getHash(key, i++);
        quests.add(Math.abs(hash) % len);
    };
    return [...quests].map((e) => dailies[e]);
};

const exportCommand: SlashCommand = {
    name: 'quests',
    async execute({ interaction, author }) {

        const user = interaction.options.getUser('user') ?? interaction.user;

        const stats = author.schema;

        // Check if already voted
        if ((Date.now() - (stats.lastvote?.getTime() ?? 0)) < 12 * 60 * 60 * 1000) {
            await updateUsers(interaction.user.id, {
                season_keys: { type: "increment", value: "10" in stats.dailies ? 0 : 5 },
                dailies: { type: "merge_json", value: { 10: 0 } }
            });

            dailies[10].update(undefined, 1, { id: interaction.user.id }); // Knight's Ballot
            stats.dailies[10] = 1;
        };
        if ((Date.now() - (stats.lastvoteserver?.getTime() ?? 0)) < 12 * 60 * 60 * 1000) {
            await updateUsers(interaction.user.id, {
                season_keys: { type: "increment", value: "12" in stats.dailies ? 0 : 5 },
                dailies: { type: "merge_json", value: { 12: 0 } }
            });

            dailies[12].update(undefined, 1, { id: interaction.user.id }); // Guild's Ballot
            stats.dailies[12] = 1;
        };

        let thumbnail = characters[stats.chars[Math.floor(Math.random() * stats.chars.length)]].image || "https://i.imgur.com/Ta2YDBN.png";
        if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, stats.custom_skins[stats.favchar], stats.char_skin[stats.favchar]);

        const todaysQuests = getQuests(user.id, dailies.length);

        function achvmBar(ratio: number, sep = "\n") {
            let step = 1 / 14;
            if (ratio >= 1) return sep + "<:bar_ld:943133923674820608><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_rd:943133923490299965>";
            else if (ratio > 0) sep += "<:bar_l:942597277606895707>";
            else return sep + "<:bar_lh:942597277548171355><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_rh:942597277627863081>";

            ratio > step ? ratio -= step : ratio = 0;
            let ret = 12;
            while (ret--) {
                if (ratio) sep += "<:bar:942597277854359632>";
                else sep += "<:bar_h:942597277665599499>";
                ratio > step ? ratio -= step : ratio = 0;
            };

            return sep + "<:bar_rh:942597277627863081>";
        };

        function progress(id: number) {
            if (dailies[id].check(stats.dailies[id])) return achvmBar(1);
            switch (id) {
                case 0: return achvmBar((stats.dailies[id] || 0) / 20, ` (${stats.dailies[id] || 0}/20)\n`);
                case 1: return achvmBar((stats.dailies[id] || 0) / 50, ` (${stats.dailies[id] || 0}/50)\n`);
                case 2: return achvmBar((stats.dailies[id] || 0) / 20, ` (${stats.dailies[id] || 0}/20)\n`);
                case 3: return achvmBar((stats.dailies[id] || 0) / 3, ` (${stats.dailies[id] || 0}/3)\n`);
                case 4:
                case 5:
                case 6: return achvmBar(0);
                case 7: return achvmBar((stats.dailies[id] || 0) / 5, ` (${stats.dailies[id] || 0}/5)\n`);
                case 8: return achvmBar(0);
                case 9: return achvmBar((stats.dailies[id] || 0) / 2000, ` (${stats.dailies[id] || 0}/2000)\n`);
                case 10: return achvmBar(0);
                case 11: return achvmBar((stats.dailies[id] || 0) / 3, ` (${stats.dailies[id] || 0}/3)\n`);
                default: return achvmBar(0);
            };
        };

        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setTitle(`Daily Quests (${todaysQuests.reduce((count, e) => count + (e.check(stats.dailies[e.id]) ? 1 : 0), 0)}/4)`)
            .setDescription(`**Completion Rewards**: 5 ${currencyEmojis.season_keys}, 500<:coins:872926669055356939>, 2<:genesis_gems:1034179687720681492>, 10XP ${todaysQuests.reduce((count, e) => count + (e.check(stats.dailies[e.id]) ? 1 : 0), 0) === 4 ? "<a:check:873196253276700682>" : ""}\nㅤ`)
            .setThumbnail(thumbnail)
            .addFields(
                { name: todaysQuests[0].title, value: `> ${todaysQuests[0].description + progress(todaysQuests[0].id)}`, inline: true },
                { name: `Rewards ${todaysQuests[0].check(stats.dailies[todaysQuests[0].id]) ? "<a:check:873196253276700682>" : ""}`, value: `${[10, 12].includes(todaysQuests[0].id) ? `**5** ${currencyEmojis.season_keys}, ` : ""}**500**<:coins:872926669055356939>, **2**<:genesis_gems:1034179687720681492>, 10XP`, inline: true },
                { name: '\u200B', value: '_ _', inline: true },
                { name: todaysQuests[1].title, value: `> ${todaysQuests[1].description + progress(todaysQuests[1].id)}`, inline: true },
                { name: `Rewards ${todaysQuests[1].check(stats.dailies[todaysQuests[1].id]) ? "<a:check:873196253276700682>" : ""}`, value: `${[10, 12].includes(todaysQuests[1].id) ? `**5** ${currencyEmojis.season_keys}, ` : ""}**500**<:coins:872926669055356939>, **2**<:genesis_gems:1034179687720681492>, 10XP`, inline: true },
                { name: '\u200B', value: '_ _', inline: true },
                { name: todaysQuests[2].title, value: `> ${todaysQuests[2].description + progress(todaysQuests[2].id)}`, inline: true },
                { name: `Rewards ${todaysQuests[2].check(stats.dailies[todaysQuests[2].id]) ? "<a:check:873196253276700682>" : ""}`, value: `${[10, 12].includes(todaysQuests[2].id) ? `**5** ${currencyEmojis.season_keys}, ` : ""}**500**<:coins:872926669055356939>, **2**<:genesis_gems:1034179687720681492>, 10XP`, inline: true },
                { name: '\u200B', value: '_ _', inline: true },
                { name: todaysQuests[3].title, value: `> ${todaysQuests[3].description + progress(todaysQuests[3].id)}`, inline: true },
                { name: `Rewards ${todaysQuests[3].check(stats.dailies[todaysQuests[3].id]) ? "<a:check:873196253276700682>" : ""}`, value: `${[10, 12].includes(todaysQuests[3].id) ? `**5** ${currencyEmojis.season_keys}, ` : ""}**500**<:coins:872926669055356939>, **2**<:genesis_gems:1034179687720681492>, 10XP`, inline: true },
                { name: '\u200B', value: '_ _', inline: true },
            )
            .setFooter({ text: `dailies reset in ${(23 - new Date().getHours()) ? `${23 - new Date().getHours()}h ` : ""}${60 - new Date().getMinutes()}min\nneed help? ➜ see /support` });
        return interaction.reply({ embeds: [Embed] });
    },
};

export default exportCommand;
