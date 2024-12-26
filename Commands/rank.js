import fs from 'fs';
import { EmbedBuilder, ComponentType } from "discord.js";
import { db, query } from "../db_handler";
import { characters } from "../Modules/chars";
import { getDetailedStats, showPage, baseEP } from "../Modules/functions";
import { PageRow } from "../Modules/components";

/*
    Formula                         | P0 100  1  0  EP:   1.00
    HP₁ -= ATK₂*(0.99895)^DEF₁      | P1 300 30 30  EP:  95.05
    HP₂ -= ATK₁*(0.99895)^DEF₂      | P2 400 50 40  EP: 172.09

    HP -= ATK -> over time: HP/ATK₁(c)^0
    P1 Finishes in 3.33t
    P2 Finishes in 2.5t        (less is better)

    P1 Finished in 316.85t
    P2 Finished in 430.23t     (more is better)

    HP₁ -= 100*(0.99895)^DEF₁  -> HP₁/(1*(0.99895)^DEF₁)
    HP₂ -= 100*(0.99895)^DEF₂

    EP = d(HP₁)/dt / d(HP)/dt = (HP₁/(0.99895)^DEF₁)/(100/ATK₁) -> (HP*ATK)/c^DEF
*/

const RoK = new Map();
async function indexRanking() {
    const stats = await query(`SELECT users.id, users.battlechar, users.name, users.premium, users.class, users.bank, users.shield_slot, characters.chars, characters.ref, users.level, users.equipment, dungeon.classes, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id`);
    for (const account of stats) {
        account.chars = JSON.parse(account.chars), account.ref = JSON.parse(account.ref), account.classes = JSON.parse(account.classes), account.classlevels = JSON.parse(account.classlevels), account.equipment = JSON.parse(account.equipment);
        if (account.battlechar) {
            const cstats = await getDetailedStats(account.battlechar, account, account.classlevels);
            RoK.set(account.id, { name: account.name, id: account.id, char: account.battlechar, ep: cstats.ep });
        };
    };
};
indexRanking();
setInterval(indexRanking, 15 * 60 * 1000); // 15 min interval

const rarities = { "EX": "<a:EXTRA:1138530846144462968>", "SS": "<:SSTier:869316489931546644>", "S": "<:STier:869316518675095552>", "A": "<:ATier:869316558013464627>", "B": "<:BTier:869316586803179571>", "C": "<:CTier:869316602858991657>", "D": "<:DTier:869316616071032843>" };

module.exports = {
    name: 'rank',
    description: 'rank characters',
    async execute(interaction) {

        const blacklist = JSON.parse(fs.readFileSync('Storage/blacklist.json', 'utf8'));

        let scope = interaction.options.getString('scope');
        let page = interaction.options.getInteger('page');
        const user = interaction.options.getUser('user') || interaction.user;

        let sortedArr = [], count = 1, rokS, embedTitle, thumbnail;

        if (scope === "inventory") {
            try {
                await interaction.deferReply();
            } catch (err) {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            };
        };

        db.serialize(async () => {
            if (scope === "base" || scope === "inventory") {
                const rok = new Map();
                if (scope === "base") {
                    characters.forEach((e) => rok.set(e.id, baseEP(e.id)));
                    embedTitle = "Top Characters Ranking";
                } else {
                    const { 0: inv } = await query(`SELECT users.id, users.premium, users.class, users.bank, users.shield_slot, characters.chars, characters.ref, users.level, users.equipment, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${user.id}`);
                    if (!inv) return interaction.editReply(`${user.username} hasn't started playing yet.`);
                    inv.chars = JSON.parse(inv.chars), inv.ref = JSON.parse(inv.ref), inv.equipment = JSON.parse(inv.equipment), inv.classlevels = JSON.parse(inv.classlevels);
                    const uniq = [...new Set(inv.chars)];
                    for (const id of uniq) {
                        const bStats = await getDetailedStats(id, inv, inv.classlevels);
                        rok.set(id, bStats.ep);
                    };
                    embedTitle = "Your top characters";
                };

                rokS = new Map([...rok.entries()].sort((a, b) => b[1] - a[1]));
                rokS.forEach((val, key) => sortedArr.push(`${rarities[characters[key].rarity]} ${count++}. ${characters[key].name} - EP: **${val}**`));

                thumbnail = characters[[...rokS.keys()][0]]?.image || characters[Math.floor(Math.random * characters.length)];
            };

            if (scope === "server" || scope === "global") {
                let sortedRoK = [];
                if (scope === "server") {
                    const { 0: usersToRank } = await query(`SELECT user_ids FROM servers WHERE id = ${interaction.guild.id}`);
                    usersToRank.user_ids.split(",").forEach((uid) => sortedRoK.push(RoK.get(uid)));
                } else {
                    sortedRoK = [...RoK.values()];
                };
                sortedRoK = sortedRoK.filter((e) => e && !(e.id in blacklist));
                sortedRoK.sort((a, b) => b.ep - a.ep);

                sortedArr = sortedRoK.map((e) => `${rarities[characters[e.char].rarity]} ${count++}. **${characters[e.char].name}** - EP: ${e.ep} => ${e.name}`);

                embedTitle = `🏆 ${scope === "server" ? interaction.guild.name : "Camelot"} top characters 🏆`;
                const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));
                const { 0: tuser } = await query(`SELECT users.id, users.premium, characters.skin FROM users JOIN characters ON users.id = characters.id WHERE users.name = '${sortedRoK[0].id}'`);
                if (tuser) tuser.skin = JSON.parse(tuser.skin);
                thumbnail = characters[sortedRoK[0].char].getImage((tuser?.premium || 0), (customSettings?.[tuser?.id]?.cimg[sortedRoK[0].char] || ""), tuser?.skin[sortedRoK[0].char] || undefined);
            };

            const elementsPerPage = 15;
            const pagesTotal = Math.ceil(sortedArr.length / elementsPerPage);
            let currPage = 1;
            if (page <= pagesTotal && page > 0) {
                currPage = page;
            };

            // Filter items to show on the current page
            let showUsersF = showPage(currPage, sortedArr, elementsPerPage);

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(embedTitle)
                .setDescription(showUsersF.join("\n"))
                .setThumbnail(thumbnail)
                .setFooter({ text: `Page ${currPage}/${pagesTotal} ${(scope === "server" || scope === "global") ? "| Ranking updates every 15 minutes" : ""}` });
            if (pagesTotal === 1) return interaction[interaction.deferred ? "editReply" : "reply"]({ embeds: [Embed] });
            return interaction[interaction.deferred ? "editReply" : "reply"]({ embeds: [Embed], components: [PageRow], fetchReply: true }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', async r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    showUsersF = showPage(currPage, sortedArr, elementsPerPage);

                    Embed.setDescription(showUsersF.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal} ${(scope === "server" || scope === "global") ? "| Ranking updates every 15 minutes" : ""}` });
                    msg.edit({ embeds: [Embed], components: [PageRow] });
                });

            });

        });

    },
};