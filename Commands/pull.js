import { EmbedBuilder, ComponentType, ActionRowBuilder, ButtonBuilder } from "discord.js";
import { characters, charactersSS, charactersS, charactersA, charactersB, charactersC, charactersD, auniq } from "../Modules/chars";
import { db, query } from "../db_handler";
import { displayPull, pullsToResetList, userLevel, showPage } from "../Modules/functions";
import { achievements } from "../Modules/achievements";
import { dailies } from "../Modules/dailyQuests";

const headers = {
    "EX": "\n\n<a:EXTRA:1138530846144462968> **Tier**\n",
    "SS": "\n\n<:SSTier:869316489931546644> **Tier**\n",
    "S": "\n\n<:STier:869316518675095552> **Tier**\n",
    "A": "\n\n<:ATier:869316558013464627> **Tier**\n",
    "B": "\n\n<:BTier:869316586803179571> **Tier**\n",
    "C": "\n\n<:CTier:869316602858991657> **Tier**\n",
    "D": "\n\n<:DTier:869316616071032843> **Tier**\n"
};

const FlipPagesRow = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setEmoji('⏪')
            .setStyle('Secondary'),
        new ButtonBuilder()
            .setCustomId('next')
            .setEmoji('⏩')
            .setStyle('Secondary'),
        new ButtonBuilder()
            .setCustomId('view')
            .setLabel('Overview')
            .setStyle('Primary'),
    );

const GoToOverviewRow = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('view')
            .setLabel('Overview')
            .setStyle('Secondary'),
    );

const GoToCharsRow = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('chars')
            .setLabel('See Characters')
            .setStyle('Secondary'),
    );

db.serialize(async () => {
    const checkTimers = await query(`SELECT id, lastpull, pullcount, premium FROM users`);
    checkTimers.forEach(async (e) => {
        if (e.lastpull) {
            let pullTimer = 45 * 60 * 1000;
            switch (e.premium) {
                case 0: false; break;
                case 1: pullTimer = 40 * 60 * 1000; break;
                case 2: pullTimer = 40 * 60 * 1000; break;
                case 3: pullTimer = 40 * 60 * 1000; break;
                case 4: pullTimer = 35 * 60 * 1000; break;
                case 5: pullTimer = 30 * 60 * 1000; break;
                case 6: pullTimer = 30 * 60 * 1000; break;
                case 7: pullTimer = 30 * 60 * 1000; break;
                default: false; break;
            };
            if (new Date().getTime() - e.lastpull > pullTimer) {
                await query(`UPDATE users SET pullcount = 0 WHERE id = ${e.id}`);
            } else {
                pullsToResetList.add(e.id);
                setTimeout(() => {
                    db.serialize(async () => {
                        await query(`UPDATE users SET pullcount = 0 WHERE id = ${e.id}`);
                        pullsToResetList.delete(e.id);
                    });
                }, Math.abs(pullTimer + e.lastpull - new Date().getTime()));
            };
        };
    });
});

function padPulledOverview(chars) {
    let collSS = chars.filter((e) => e.rarity === "SS").length;
    let collS = chars.filter((e) => e.rarity === "S").length;
    let collA = chars.filter((e) => e.rarity === "A").length;
    let collB = chars.filter((e) => e.rarity === "B").length;
    let collC = chars.filter((e) => e.rarity === "C").length;
    let collD = chars.filter((e) => e.rarity === "D").length;

    let res = []; // SS, A, C, S, B, D
    let len = Math.max(`${collSS}`.length, `${collA}`.length, `${collC}`.length);
    res.push(`\`${collSS}` + " ".repeat(len - `${collSS}`.length) + "`");
    res.push(`\`${collA}` + " ".repeat(len - `${collA}`.length) + "`");
    res.push(`\`${collC}` + " ".repeat(len - `${collC}`.length) + "`");
    len = Math.max(`${collS}`.length, `${collB}`.length, `${collD}`.length);
    res.push(`\`${collS}` + " ".repeat(len - `${collS}`.length) + "`");
    res.push(`\`${collB}` + " ".repeat(len - `${collB}`.length) + "`");
    res.push(`\`${collD}` + " ".repeat(len - `${collD}`.length) + "`");
    return res;
};

module.exports = {
    name: 'pull',
    description: 'the pull command',
    execute(interaction) {

        db.serialize(async () => {
            let stats = await query(`SELECT rowid, xp, guild, lastvote, lastpull, pullcount, pullstotal, pullreminder, lastss, lasts, premium FROM users WHERE id = ${interaction.user.id}`);
            stats = stats[0];

            const { 0: guild } = await query(`SELECT * FROM guilds WHERE id = '${stats.guild}'`);

            // Some vars
            let pullLimit = 5;
            let sPit = 120;
            let ssPit = 300;
            let pullTimer = 45 * 60 * 1000;
            let add_xp = 0;
            let user_level = userLevel(stats.xp);

            // Premium bonus
            switch (stats.premium) {
                case 0: false; break;
                case 1: pullLimit += 1; sPit = 100; ssPit = 260; pullTimer = 40 * 60 * 1000; break;
                case 2: pullLimit += 2; sPit = 90; ssPit = 240; pullTimer = 40 * 60 * 1000; break;
                case 3: pullLimit += 3; sPit = 85; ssPit = 230; pullTimer = 40 * 60 * 1000; break;
                case 4: pullLimit += 3; sPit = 80; ssPit = 225; pullTimer = 35 * 60 * 1000; break;
                case 5: pullLimit += 3; sPit = 75; ssPit = 220; pullTimer = 30 * 60 * 1000; break;
                case 6: pullLimit += 4; sPit = 70; ssPit = 210; pullTimer = 30 * 60 * 1000; break;
                case 7: pullLimit += 5; sPit = 60; ssPit = 200; pullTimer = 30 * 60 * 1000; break;
                default: false; break;
            };
            if (guild) pullTimer -= (60 * 1000 * guild.cdreduction);

            // Check if vote
            let canVote = `\nYou can **/vote** now! To reset your pull counter (use \`/rp\` after the vote)`;
            if (stats.lastvote && ((new Date().getTime() - stats.lastvote) < 12 * 60 * 60 * 1000)) canVote = "";

            // Setup pull reset
            if (stats.pullcount === 0 && !pullsToResetList.has(interaction.user.id)) {
                pullsToResetList.add(interaction.user.id);
                setTimeout(() => {
                    db.serialize(async () => {
                        await query(`UPDATE users SET pullcount = 0 WHERE id = ${interaction.user.id}`);
                        pullsToResetList.delete(interaction.user.id);
                        if (stats.pullreminder) interaction.channel.send(`${interaction.user.toString()} is off </pull:1011014030103674913> cooldown!`);
                    });
                }, pullTimer);
            };

            // Check if limit reached
            if (stats.pullcount >= pullLimit) return interaction.reply(`You've reached your pull limit, please wait **${Math.ceil((pullTimer + stats.lastpull - new Date().getTime()) / (60 * 1000))}** min${canVote}`);

            const { 0: inv } = await query(`SELECT chars, ref FROM characters WHERE id = ${interaction.user.id}`);
            inv.chars = JSON.parse(inv.chars), inv.ref = JSON.parse(inv.ref);

            let ranRar = Math.floor(Math.random() * 1000); // 0-999
            let rar = "D";
            let rarStats = { "SS": 0, "S": 0, "A": 0, "B": 0, "C": 0, "D": 0 };
            let droprates;
            if (user_level < 10) droprates = { "SS": 1, "S": 4, "A": 34, "B": 130, "C": 388, "D": 1000 }; // {"SS": 1, "S": 4, "A": 29, "B": 96, "C": 258, "D": 612}
            else if (user_level < 20) droprates = { "SS": 1, "S": 9, "A": 42, "B": 142, "C": 394, "D": 1000 }; // {"SS": 1, "S": 8, "A": 33, "B": 100, "C": 252, "D": 606}
            else droprates = { "SS": 2, "S": 14, "A": 52, "B": 156, "C": 404, "D": 1000 }; // {"SS": 2, "S": 12, "A": 38, "B": 104, "C": 248, "D": 596}

            // Pull all
            if (interaction.options.getString('premium')) {
                if (stats.premium < 3) return interaction.reply("This is a `/premium` feature. If you like the bot and want to help us out we'd appreciate your support <:RaphiSmile:868998036645380197>");
                let left = pullLimit - stats.pullcount;
                let pulledChars = [];
                for (let i = 0; i < left; i++) {
                    ranRar = Math.floor(Math.random() * 1000); // 0-999

                    if (ranRar >= droprates["SS"]) stats.lastss++;
                    if (ranRar >= droprates["S"]) stats.lasts++;

                    if (stats.lasts >= sPit && stats.lastss >= ssPit) { ranRar = 0; stats.lasts--; stats.lastss = 0; };
                    if (stats.lasts >= sPit) { ranRar = 3; stats.lasts = 0; };
                    if (stats.lastss >= ssPit) { ranRar = 0; stats.lastss = 0; };

                    let fChars;
                    if (ranRar < droprates["SS"]) fChars = charactersSS, rarStats["SS"]++, stats.lastss = 0;
                    else if (ranRar < droprates["S"]) fChars = charactersS, rarStats["S"]++, stats.lasts = 0;
                    else if (ranRar < droprates["A"]) fChars = charactersA, rarStats["A"]++;
                    else if (ranRar < droprates["B"]) fChars = charactersB, rarStats["B"]++;
                    else if (ranRar < droprates["C"]) fChars = charactersC, rarStats["C"]++;
                    else fChars = charactersD, rarStats["D"]++;

                    const fChar = fChars[Math.floor(Math.random() * fChars.length)];
                    pulledChars.push(fChar);
                    inv.chars.push(fChar.id);
                    // if (!inv.ref[fChar.id]) inv.ref[fChar.id] = 0;
                    // inv.ref[fChar.id]++;
                };
                pulledChars.sort((a, b) => b.rarityValue - a.rarityValue);
                stats.pullcount = pullLimit;
                stats.pullstotal += left;
                add_xp += 5 * left;

                // Setup Pages
                const elementsPerPage = 10;
                const pagesTotal = Math.ceil(pulledChars.length / elementsPerPage);
                let currPage = 1;

                // Filter chars to show on the current page
                let showChars = showPage(currPage, pulledChars, elementsPerPage);

                let desc = "";
                Object.entries(headers).forEach(([rarity, header]) => {
                    if (showChars.find((e) => e.rarity === rarity)) desc += header + showChars.filter((e) => e.rarity === rarity).map((c) => `> ${c.name}`).join("\n");
                });

                let thumbnail = pulledChars[0].image;

                let padded = padPulledOverview(pulledChars);

                const Embed = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setThumbnail(thumbnail)
                    .setTitle(`Pulled ${left} ${left === 1 ? "character" : "characters"}\n`)
                    .setDescription(desc)
                    .setFooter({ text: `Page ${currPage}/${pagesTotal}` });

                const Overview = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setThumbnail(thumbnail)
                    .setDescription(
                        `### Overview (${left} ${left === 1 ? "char" : "chars"})\n` +
                        `<:SSTier:869316489931546644> **Tier**: ${padded[0]}ㅤ<:STier:869316518675095552> **Tier**: ${padded[3]}\n` +
                        `<:ATier:869316558013464627> **Tier**: ${padded[1]}ㅤ<:BTier:869316586803179571> **Tier**: ${padded[4]}\n` +
                        `<:CTier:869316602858991657> **Tier**: ${padded[2]}ㅤ<:DTier:869316616071032843> **Tier**: ${padded[5]}\n` +
                        `${pulledChars.filter((e) => e.rarity === "SS" || e.rarity === "S").length ?
                            `### Top Characters\n${pulledChars.filter((e) => e.rarity === "SS" || e.rarity === "S").slice(0, 5).map((e) => `${e.rarityEmoji} **${e.name}**`)}`
                            : ""}`
                    );

                interaction.reply({ embeds: [Overview], components: [GoToCharsRow], fetchReply: true }).then(msg => {
                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                    collector.on('collect', r => {
                        if (r.customId === "view") return interaction.editReply({ embeds: [Overview], components: [GoToCharsRow] });
                        if (r.customId === "chars") return interaction.editReply({ embeds: [Embed], components: [pagesTotal === 1 ? GoToOverviewRow : FlipPagesRow] });

                        if (r.customId === "prev") {
                            if (currPage > 1) currPage--;
                            else currPage = pagesTotal;
                        } else if (r.customId === "next") {
                            if (currPage < pagesTotal) currPage++;
                            else currPage = 1;
                        };

                        // Filter chars to show on the current page
                        showChars = showPage(currPage, pulledChars, elementsPerPage);

                        desc = "";
                        Object.entries(headers).forEach(([rarity, header]) => {
                            if (showChars.find((e) => e.rarity === rarity)) desc += header + showChars.filter((e) => e.rarity === rarity).map((c) => `> ${c.name}`).join("\n");
                        });

                        Embed.setDescription(desc).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                        interaction.editReply({ embeds: [Embed] });
                    });
                });

                // Daily Quests
                dailies[0].update(interaction, left);
            } else {
                stats.pullcount++;

                stats.pullstotal++;
                if (ranRar >= droprates["SS"]) stats.lastss++;
                if (ranRar >= droprates["S"]) stats.lasts++;

                if (stats.lasts >= sPit && stats.lastss >= ssPit) { ranRar = 0; stats.lasts--; stats.lastss = 0; };
                if (stats.lasts >= sPit) { ranRar = 3; stats.lasts = 0; };
                if (stats.lastss >= ssPit) { ranRar = 0; stats.lastss = 0; };

                const ranXp = Math.ceil(Math.random() * 10); // 1-10
                add_xp += ranXp;
                if (ranRar < droprates["S"] && ranRar >= droprates["SS"]) add_xp += ranXp;
                else if (ranRar < droprates["SS"]) add_xp += 20;

                if (ranRar < droprates["SS"]) rar = "SS", rarStats["SS"]++, stats.lastss = 0;
                else if (ranRar < droprates["S"]) rar = "S", rarStats["S"]++, stats.lasts = 0;
                else if (ranRar < droprates["A"]) rar = "A";
                else if (ranRar < droprates["B"]) rar = "B";
                else if (ranRar < droprates["C"]) rar = "C";

                let fChars = characters.filter((e) => e.rarity === rar);
                let num = Math.floor(Math.random() * fChars.length);
                inv.chars.push(fChars[num].id);
                // if (!inv.ref[fChars[num].id]) inv.ref[fChars[num].id] = 0;
                // inv.ref[fChars[num].id]++;
                interaction.reply(displayPull(interaction.user, fChars[num], pullLimit, inv.chars.filter((e) => e === fChars[num].id).length, stats.pullcount, stats.lastvote, inv.ref[fChars[num].id]));

                // Daily Quests
                dailies[0].update(interaction);
            };

            await query(`UPDATE users SET pullcount = ${stats.pullcount}, lastpull = ${new Date().getTime()}, pullstotal = ${stats.pullstotal}, lastss = ${stats.lastss}, lasts = ${stats.lasts}, xp = xp + ${add_xp} WHERE id = ${interaction.user.id}`);
            await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}' WHERE id = ${interaction.user.id}`);
            // await query(`UPDATE characters SET chars = '${JSON.stringify(inv.chars)}', ref = '${JSON.stringify(inv.ref)}' WHERE id = ${interaction.user.id}`);

            // Achievements
            achievements[0].check(interaction); // First Character
            achievements[1].check(interaction), achievements[2].check(interaction), achievements[3].check(interaction); // Collector
            achievements[4].check(interaction, interaction.user, rarStats["S"]), achievements[5].check(interaction, interaction.user, rarStats["SS"]); // Something Rare
            achievements[15].check(interaction), achievements[16].check(interaction), achievements[17].check(interaction), achievements[18].check(interaction); // Rising
            achievements[19].check(interaction, interaction.user, characters, auniq), achievements[20].check(interaction, interaction.user, characters, auniq), achievements[21].check(interaction, interaction.user, characters, auniq), achievements[22].check(interaction, interaction.user, characters, auniq), achievements[23].check(interaction, interaction.user, characters, auniq); // Diligent

        });

    },
};
