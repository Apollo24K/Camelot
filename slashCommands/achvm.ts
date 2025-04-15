import fs from 'fs';
import { EmbedBuilder, ComponentType, APIEmbedField } from "discord.js";
import achievInfo, { achievements } from "../Modules/achievements";
import { characters, auniq } from "../Modules/chars";
import { enemies } from "../Modules/enemies";
import { userLevel } from "../Modules/functions";
import { PageRow } from "../Modules/components";
import { SlashCommand } from '../types';
import { getUserSchema } from "../Modules/queries";

const exportCommand: SlashCommand = {
    name: 'achievements',
    async execute({ interaction, author }) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        const user = interaction.options.getUser('user') ?? interaction.user;
        const page = interaction.options.getInteger('page') ?? 1;

        const stats = user.id === interaction.user.id ? author.schema : await getUserSchema(user.id);
        if (!stats) return interaction.reply(`**${user.username}** hasn't started playing yet`);

        let uniq = [...new Set(stats.chars)];

        let thumbnail = "https://i.ibb.co/jZ7fHSj/camelot.png";
        if (uniq.length) thumbnail = characters[uniq[Math.floor(Math.random() * uniq.length)]].image;
        if (stats.favchar !== null) {
            thumbnail = characters[stats.favchar].image;
            if (stats.premium > 3) if (customSettings[user.id] && customSettings[user.id].cimg[stats.favchar]) thumbnail = customSettings[user.id].cimg[stats.favchar];
        };

        if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, customSettings[user.id]?.cimg[stats.favchar], stats.char_skin[stats.favchar]);

        let level = userLevel(stats.xp);

        const shardEmojis = { "ss": "<:ss_shard:917203009543503892>", "s": "<:s_shard:917202925514817566>", "a": "<:a_shard:917202904862052392>", "b": "<:b_shard:917202862851899392>", "c": "<:c_shard:917202862499582002>", "d": "<:d_shard:917202840563363891>" };
        const ticketEmojis = { "ss": "<:ss_ticket:927503239396622336>", "s": "<:s_ticket:927642487705722890>", "a": "<:a_ticket:929420377946472508>", "b": "<:b_ticket:929420396535615519>", "c": "<:c_ticket:929420424645853214>", "d": "<:d_ticket:929420447102152714>" };

        function achvmBar(ratio: number, sep: string = "\n") {
            if (ratio >= 1) return sep + "<:bar_ld:943133923674820608><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_rd:943133923490299965>";
            if (ratio > 0.93) return sep + "<:bar_l:942597277606895707><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar_rh:942597277627863081>";
            if (ratio > 0.87) return sep + "<:bar_l:942597277606895707><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar_h:942597277665599499><:bar_rh:942597277627863081>";
            if (ratio > 0.8) return sep + "<:bar_l:942597277606895707><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_rh:942597277627863081>";
            if (ratio > 0.73) return sep + "<:bar_l:942597277606895707><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_rh:942597277627863081>";
            if (ratio > 0.67) return sep + "<:bar_l:942597277606895707><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_rh:942597277627863081>";
            if (ratio > 0.6) return sep + "<:bar_l:942597277606895707><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_rh:942597277627863081>";
            if (ratio > 0.53) return sep + "<:bar_l:942597277606895707><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_rh:942597277627863081>";
            if (ratio > 0.47) return sep + "<:bar_l:942597277606895707><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_rh:942597277627863081>";
            if (ratio > 0.4) return sep + "<:bar_l:942597277606895707><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_rh:942597277627863081>";
            if (ratio > 0.33) return sep + "<:bar_l:942597277606895707><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_rh:942597277627863081>";
            if (ratio > 0.27) return sep + "<:bar_l:942597277606895707><:bar:942597277854359632><:bar:942597277854359632><:bar:942597277854359632><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_rh:942597277627863081>";
            if (ratio > 0.2) return sep + "<:bar_l:942597277606895707><:bar:942597277854359632><:bar:942597277854359632><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_rh:942597277627863081>";
            if (ratio > 0.13) return sep + "<:bar_l:942597277606895707><:bar:942597277854359632><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_rh:942597277627863081>";
            if (ratio > 0.07) return sep + "<:bar_l:942597277606895707><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_rh:942597277627863081>";
            return sep + "<:bar_lh:942597277548171355><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_rh:942597277627863081>";
        };

        function progress(id: number) {
            if (!stats) return "";

            switch (id) {
                case 0: return achvmBar(0);
                case 1: return achvmBar(uniq.length / 500, ` (${uniq.length}/500)\n`);
                case 2: return achvmBar(uniq.length / 2000, ` (${uniq.length}/2000)\n`);
                case 3: return achvmBar(uniq.length / 5000, ` (${uniq.length}/5000)\n`);
                case 4:
                case 5: return achvmBar(0);
                case 6: return achvmBar(0, ` (0/1)\n`);
                case 7: return achvmBar(stats.arenawins / 20, ` (${stats.arenawins}/20)\n`);
                case 8: return achvmBar(stats.arenawins / 100, ` (${stats.arenawins}/100)\n`);
                case 9: return achvmBar(stats.dailystreak / 3, ` (${stats.dailystreak}/3)\n`);
                case 10: return achvmBar(stats.dailystreak / 7, ` (${stats.dailystreak}/7)\n`);
                case 11: return achvmBar(stats.dailystreak / 14, ` (${stats.dailystreak}/14)\n`);
                case 12: return achvmBar(stats.dailystreak / 30, ` (${stats.dailystreak}/30)\n`);
                case 13:
                case 14: return achvmBar(0);
                case 15: return achvmBar(stats.xp / 660, ` (${level}/10)\n`);
                case 16: return achvmBar(stats.xp / 9047, ` (${level}/30)\n`);
                case 17: return achvmBar(stats.xp / 27864, ` (${level}/50)\n`);
                case 18: return achvmBar(stats.xp / 115212, ` (${level}/100)\n`);
                case 19:
                case 20:
                case 21:
                case 22:
                case 23: {
                    let completed = 0;
                    let chars = uniq.map((e) => characters[e]);
                    auniq.forEach((a) => { if (characters.filter((e) => e.anime === a).length === chars.filter((e) => e.anime === a).length) completed++; });
                    if (id === 19) return achvmBar(0, ` (0/1)\n`);
                    if (id === 20) return achvmBar(completed / 10, ` (${completed}/10)\n`);
                    if (id === 21) return achvmBar(completed / 30, ` (${completed}/30)\n`);
                    if (id === 22) return achvmBar(completed / 100, ` (${completed}/100)\n`);
                    if (id === 23) return achvmBar(completed / 250, ` (${completed}/250)\n`);
                    break;
                }
                case 24:
                case 25:
                case 26: return achvmBar(0);
                case 27:
                case 28:
                case 29: {
                    let bossFloors: number[] = [], wins = 0;
                    enemies.forEach((e) => e.boss ? bossFloors.push(e.floor[0]) : false);
                    if (stats.dungeon_floors) wins = Math.max(...new Set(bossFloors.map((e) => stats.dungeon_floors[e] ? stats.dungeon_floors[e] : 0)));
                    if (id === 27) return achvmBar(wins / 5, ` (${wins}/5)\n`);
                    if (id === 28) return achvmBar(wins / 30, ` (${wins}/30)\n`);
                    if (id === 29) return achvmBar(wins / 100, ` (${wins}/100)\n`);
                    break;
                }
                case 30:
                case 31:
                case 32:
                case 33: return achvmBar(0);
                case 34:
                case 35:
                case 36:
                case 37:
                case 38: {
                    let cFloor = 0;
                    if (Object.entries(stats.dungeon_floors).reverse()[0][1]) cFloor = parseInt(Object.entries(stats.dungeon_floors).reverse()[0][0]);
                    else if (Object.entries(stats.dungeon_floors).length > 1) cFloor = parseInt(Object.entries(stats.dungeon_floors).reverse()[1][0]);
                    if (id === 34) return achvmBar(cFloor / 5, ` (${cFloor}/5)\n`);
                    if (id === 35) return achvmBar(cFloor / 10, ` (${cFloor}/10)\n`);
                    if (id === 36) return achvmBar(cFloor / 25, ` (${cFloor}/25)\n`);
                    if (id === 37) return achvmBar(cFloor / 50, ` (${cFloor}/50)\n`);
                    if (id === 38) return achvmBar(cFloor / 70, ` (${cFloor}/70)\n`);
                    break;
                };
                case 39:
                case 40:
                case 41: return achvmBar(0);
                case 42: return achvmBar(stats.level / 30, ` (${stats.level}/30)\n`);
                case 43: return achvmBar(stats.level / 50, ` (${stats.level}/50)\n`);
                case 44: return achvmBar(stats.level / 80, ` (${stats.level}/80)\n`);
                case 45: return achvmBar(stats.level / 100, ` (${stats.level}/100)\n`);
                case 46:
                case 47:
                case 48:
                case 49:
                case 50:
                case 51:
                case 52:
                case 53:
                case 54: return achvmBar(0);
                case 55:
                case 56:
                case 57:
                case 58: {
                    let cFloor = 0;
                    if (Object.entries(stats.dungeon_floors).reverse()[0][1]) cFloor = parseInt(Object.entries(stats.dungeon_floors).reverse()[0][0]);
                    else if (Object.entries(stats.dungeon_floors).length > 1) cFloor = parseInt(Object.entries(stats.dungeon_floors).reverse()[1][0]);
                    if (id === 55) return achvmBar(cFloor / 100, ` (${cFloor}/100)\n`);
                    if (id === 56) return achvmBar(cFloor / 150, ` (${cFloor}/150)\n`);
                    if (id === 57) return achvmBar(cFloor / 200, ` (${cFloor}/200)\n`);
                    if (id === 58) return achvmBar(cFloor / 270, ` (${cFloor}/270)\n`);
                    break;
                };
                case 59: return achvmBar(stats.donatedtotal / 50_000, ` (${stats.donatedtotal}/50'000)\n`);
                case 60: return achvmBar(stats.donatedtotal / 250_000, ` (${stats.donatedtotal}/250'000)\n`);
                case 61: return achvmBar(stats.donatedtotal / 1_000_000, ` (${stats.donatedtotal}/1'000'000)\n`);
                case 62: return achvmBar(stats.donatedtotal / 5_000_000, ` (${stats.donatedtotal}/5'000'000)\n`);
                case 63: return achvmBar(stats.donatedtotal / 20_000_000, ` (${stats.donatedtotal}/20'000'000)\n`);

                case 64: if (stats.achievements.includes(64)) return achvmBar(1, " (Spend 100'000 in one levelup)\n") 
                    break;
                case 65: if (stats.achievements.includes(65)) return achvmBar(1, " (Spend 500'000 in one levelup)\n")
                    break;
                case 66: if (stats.achievements.includes(66)) return achvmBar(1, " (Spend 1'000'000 in one levelup)\n")
                    break;
                default: return achvmBar(0);
            };
        };

        function rew(a: achievInfo) {
            let rews: string[] = [];
            a.type.forEach((type) => {
                switch (type) {
                    case "1": a.rewards.forEach((rew) => { if (rew.match(/xp/gi)) rews.push(`**${rew.split("|")[1]}** XP`); }); break;
                    case "2": a.rewards.forEach((rew) => { if (rew.match(/coins/gi)) rews.push(`**${rew.split("|")[1]}** <:coins:872926669055356939>`); }); break;
                    case "3": a.rewards.forEach((rew) => { if (rew.match(/shard/gi)) rews.push(`**${rew.split("|")[1]}**x ${shardEmojis[rew.split(" ")[0] as keyof typeof shardEmojis]}`); }); break;
                    case "4": a.rewards.forEach((rew) => { if (rew.match(/ticket/gi)) rews.push(`**${rew.split("|")[1]}**x ${ticketEmojis[rew.split(" ")[0] as keyof typeof ticketEmojis]}`); }); break;
                    case "5": a.rewards.forEach((rew) => { if (rew.match(/lb/gi)) rews.push(`**${rew.split("|")[1]}** ${rew.split("|")[1] == "1" ? "lootbox" : "lootboxes"}`); }); break;
                    case "6": rews.push(`unlocks <:shield_empty:1087089686809415730>`);
                };
            });
            let ret = rews[0];
            for (let j = 1; j < rews.length; j++) {
                if (j % 2 !== 0) ret += `, ${rews[j]}`;
                else ret += `,\n${rews[j]}`;
            };
            return ret;
        };

        let fields: APIEmbedField[][] = [];

        for (let i = 0; i <= achievements[achievements.length - 1].group; i++) {
            const achvms = achievements.filter((e) => e.group === i);
            let title = achvms[0].title + " ";
            let rTitle = "Rewards";
            let desc = "";
            let achvm: number = -1;
            achvms.forEach((a) => {
                if (stats.achievements.includes(a.id)) title += "<:st:942946747334918216>";
                else {
                    title += "<:st_h:942946747452387408>";
                    if (!desc.length) desc = `> ${a.description}`, achvm = a.id;
                };
            });
            if (!desc.length) desc = `> ${achvms[achvms.length - 1].description}`, achvm = achvms[achvms.length - 1].id;

            if (stats.achievements.includes(achvm)) desc += achvmBar(1), rTitle += " <a:check:873196253276700682>";
            else desc += progress(achvm);

            let rDesc = rew(achievements[achvm]);
            fields.push([
                { name: title, value: desc, inline: true },
                { name: rTitle, value: rDesc, inline: true },
                { name: '\u200B', value: '_ _', inline: true },
            ]);
        };

        let fieldPerPage = 4;
        let pagesTotal = Math.ceil(fields.length / fieldPerPage);
        let currPage = 1;
        if (page <= pagesTotal && page > 0) {
            currPage = page;
        };
        let left = fields.length % fieldPerPage;

        function updatePage() {
            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(`Achievements (${stats?.achievements.length}/${achievements.length})`)
                .setThumbnail(thumbnail)
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            if (currPage < pagesTotal || left === 0) {
                for (let i = (currPage - 1) * fieldPerPage; i < currPage * fieldPerPage; i++) {
                    Embed.addFields(fields[i][0], fields[i][1], fields[i][2]);
                };
            } else {
                for (let i = (currPage - 1) * fieldPerPage; i < (currPage * fieldPerPage) - (fieldPerPage - left); i++) {
                    Embed.addFields(fields[i][0], fields[i][1], fields[i][2]);
                };
            };
            return Embed;
        };

        return interaction.reply({ embeds: [updatePage()], components: [PageRow], fetchReply: true }).then(msg => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

            collector.on('collect', async r => {
                if (r.customId === "prev") {
                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;
                } else {
                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;
                };

                msg.edit({ embeds: [updatePage()], components: [PageRow] });
            });
        });
    },
};

export default exportCommand;
