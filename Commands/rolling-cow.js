import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } from "discord.js";
import { db, query } from "../db_handler";
import { abilities } from "../Modules/abilities";
import { classes } from "../Modules/classes";
import { curses } from "../Modules/curses";
import { floors, rollingCowMobs } from "../Modules/enemies";
import { items } from "../Modules/items";
import { cowSettings } from "../Modules/components";
import { skills, rollingCowAbilities } from "../Modules/skills";
import { characters } from "../Modules/chars";
import { getDetailedStats, customEmojis, dealDamage, classLevelToXP } from "../Modules/functions";
import Avalon from "../Modules/avalon";
import buffInfo from "../Modules/buffs";
import _ from 'lodash';

const dungeonInProgress = new Map();
const embedColor = 0xf5eccd;

const rankingPrizes = [
    { // 1st
        deluxe: 3,
        royal: 12,
        glorious: 24,
        ssticket: 5,
        sticket: 12,
        aticket: 24,
        kernel: 36,
        gems: 150,
        coins: 250000,
    }, { // 2nd-5th
        deluxe: 2,
        royal: 8,
        glorious: 16,
        ssticket: 3,
        sticket: 8,
        aticket: 16,
        kernel: 24,
        gems: 75,
        coins: 125000,
    }, { // 6th-20th
        deluxe: 1,
        royal: 6,
        glorious: 10,
        ssticket: 2,
        sticket: 6,
        aticket: 12,
        kernel: 16,
        gems: 50,
        coins: 75000,
    },
];

function participationPrize(points) { // points: [0, 100] = ceil(100 * (rolls / (days * (rollsPerDay + 1) * fightsPerCharacter)))
    const prizePool = {
        deluxe: (points < 60) ? 0 : 1,
        royal: 0,
        glorious: 0,
        ssticket: (points < 20) ? 0 : ((points < 60) ? 1 : 2),
        sticket: 0,
        aticket: 0,
        kernel: Math.floor(points * 0.1),
        gems: Math.floor(points * 0.2),
        coins: Math.floor(points * 120),
    };

    // Royal
    if (points < 8) prizePool.royal = 0;
    else if (points < 24) prizePool.royal = 1;
    else if (points < 56) prizePool.royal = 2;
    else if (points < 90) prizePool.royal = 3;
    else prizePool.royal = 4;

    // Glorious
    if (points < 4) prizePool.glorious = 0;
    else if (points < 8) prizePool.glorious = 1;
    else if (points < 18) prizePool.glorious = 2;
    else if (points < 26) prizePool.glorious = 3;
    else if (points < 42) prizePool.glorious = 4;
    else if (points < 64) prizePool.glorious = 5;
    else if (points < 90) prizePool.glorious = 6;
    else if (points < 100) prizePool.glorious = 7;
    else prizePool.glorious = 8;

    // S Ticket
    if (points < 3) prizePool.sticket = 0;
    else if (points < 9) prizePool.sticket = 1;
    else if (points < 20) prizePool.sticket = 2;
    else if (points < 39) prizePool.sticket = 3;
    else if (points < 58) prizePool.sticket = 4;
    else if (points < 82) prizePool.sticket = 5;
    else prizePool.sticket = 6;

    // A Ticket
    if (points < 1) prizePool.aticket = 0;
    else if (points < 6) prizePool.aticket = 1;
    else if (points < 17) prizePool.aticket = 2;
    else if (points < 28) prizePool.aticket = 3;
    else if (points < 40) prizePool.aticket = 4;
    else if (points < 59) prizePool.aticket = 5;
    else if (points < 82) prizePool.aticket = 6;
    else if (points < 95) prizePool.aticket = 7;
    else prizePool.aticket = 8;

    return prizePool;
};

function levelSelection(interaction, stats, userItems, partyQuery) {
    return new Promise((resolve) => {
        const started = new Date(cowSettings.start);
        started.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const day = Math.floor((today - started) / (24 * 60 * 60 * 1000)) + 1;

        let tab = "details"; // "rewards"
        const isDisabled = day > cowSettings.days || day < 1;

        const tips = [
            "Survive as many rounds as you can!",
            "Points awarded from a fight can be calculated as [sum(floor(sqrt(round)))](<https://www.wolframalpha.com/input?i2d=true&i=Sum%5Bfloor%5C%2840%29sqrt%5C%2840%29k%5C%2841%29%5C%2841%29%2C%7Bk%2C1%2C9%7D%5D>)",
            `The event will last ${cowSettings.days} ${cowSettings.days === 1 ? "day" : "days"}!`,
            `You have ${cowSettings.timeInMinutes} minutes after rolling a character to do your fights.`,
            "You can't roll a char that's already been rolled by yourself or a party member before.",
            `There's a **${Math.round(cowSettings.goldenCowChance * 100)}%** chance of rolling a golden cow!`,
            "You can use any character if you roll a golden cow!",
            "Party abilities apply! Try to coordinate your rolls with your party members to make the most out of them."
        ];

        let footer;
        if (stats.cow_char === null) footer = "Roll a character to get started!";
        else if ((Date.now() - stats.cow_timer) < (cowSettings.timeInMinutes * 60 * 1000)) footer = `You have ${cowSettings.timeInMinutes - Math.floor((Date.now() - stats.cow_timer) / (60 * 1000))}m left to fight`;

        const getButtonRow = () => {
            if (isDisabled) {
                return new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('disabled')
                            .setLabel(day < 1 ? `The event will start ${day === 0 ? "tomorrow" : `in ${1 - day} days`}!` : (((day - cowSettings.days) < 7) ? `The event has ended!` : `The event hasn't started yet!`))
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(isDisabled)
                    );
            };

            if (stats.cow_participation === null) {
                return new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirm')
                            .setLabel(`Confirm and lock party!`)
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(isDisabled)
                    );
            };

            const changeTabButton = new ButtonBuilder()
                .setCustomId('change')
                .setLabel(tab === "details" ? `See rewards` : `See details`)
                .setStyle(ButtonStyle.Secondary);

            const isTimeup = ((Date.now() - stats.cow_timer) > (cowSettings.timeInMinutes * 60 * 1000));
            if (stats.cow_char === null || isTimeup || stats.cow_chars.slice(-4).filter((e) => e === stats.cow_char).length > cowSettings.fightsPerCharacter) {
                return new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('roll')
                            .setLabel((stats.cow_rolled_today >= cowSettings.rollsPerDay) ? `You've reached the daily limit!` : (`${(isTimeup && stats.cow_timer !== null) ? "Time's up! " : ""}Roll a new character!`))
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(isDisabled || (stats.cow_rolled_today >= cowSettings.rollsPerDay)),
                        changeTabButton
                    );
            };

            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('play')
                        .setLabel(`Start fight!`)
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(isDisabled),
                    changeTabButton
                );
        };
        getButtonRow();

        const getDesc = () => {
            // Confirm and lock party
            if (stats.cow_participation === null) {
                return `### <a:RollingCowL:1241776030398677093> Rolling Cow <a:RollingCowR:1241776039093338132>`
                    + `\n_At long last, the desperate and particularly long-ignored prayers of cows were heard by an absent-minded deity who, quite frankly, had misplaced the memo. And so, much to his bemusement, immortal cows rolled forth with an unbovinelievable sense of purpose, determined to liberate themselves from humanity's culinary clutches. As it turns out, even cows have dreams worth fighting for._`
                    + `\n\n<:info:1131679799207796756> In this questionably named game mode, you are randomly assigned an ability character to use against immortal enemies! Your objective is to survive as many rounds as possible <:IsoldeDrain:1206243871869243424>`
                    + `\n\n⚠️ By confirming your participation, your current party will be locked until the event is over. You will not be able to leave or delete your party, nor will your party members.`
                    + `\n\n**Current Party**: ${interaction.user.toString()}${partyQuery.length ? ", " : ""}${partyQuery.map((e) => `<@${e.id}>`).join(", ")}`;
            };

            if (tab === "rewards") {
                const participationPoints = Math.ceil(100 * (stats.cow_chars.length / (cowSettings.days * (cowSettings.rollsPerDay + 1) * cowSettings.fightsPerCharacter)));
                const paricipationRewards = participationPrize(participationPoints);

                return `### <a:RollingCowL:1241776030398677093> Rolling Cow <a:RollingCowR:1241776039093338132>`
                    + `\n**Ranking Rewards**`
                    + `\n**1st place**: <:deluxe_chest:1069301259603026061>x${rankingPrizes[0].deluxe}, <:royal_chest:1069301128711376976>x${rankingPrizes[0].royal}, <:glorious_chest:1069076067081539726>x${rankingPrizes[0].glorious}, <:ss_ticket:927503239396622336>x${rankingPrizes[0].ssticket}\n<:s_ticket:927642487705722890>x${rankingPrizes[0].sticket}, <:a_ticket:929420377946472508>x${rankingPrizes[0].aticket}, <:starlight_kernel:1106121205515288659>x${rankingPrizes[0].kernel}, <:genesis_gems:1034179687720681492>x${rankingPrizes[0].gems}, <:coins:1030580480782893197>${rankingPrizes[0].coins}`
                    + `\n\n**2nd-5th places**: <:deluxe_chest:1069301259603026061>x${rankingPrizes[1].deluxe}, <:royal_chest:1069301128711376976>x${rankingPrizes[1].royal}, <:glorious_chest:1069076067081539726>x${rankingPrizes[1].glorious}, <:ss_ticket:927503239396622336>x${rankingPrizes[1].ssticket}\n<:s_ticket:927642487705722890>x${rankingPrizes[1].sticket}, <:a_ticket:929420377946472508>x${rankingPrizes[1].aticket}, <:starlight_kernel:1106121205515288659>x${rankingPrizes[1].kernel}, <:genesis_gems:1034179687720681492>x${rankingPrizes[1].gems}, <:coins:1030580480782893197>${rankingPrizes[1].coins}`
                    + `\n\n**6th-20th places**: <:deluxe_chest:1069301259603026061>x${rankingPrizes[2].deluxe}, <:royal_chest:1069301128711376976>x${rankingPrizes[2].royal}, <:glorious_chest:1069076067081539726>x${rankingPrizes[2].glorious}, <:ss_ticket:927503239396622336>x${rankingPrizes[2].ssticket}\n<:s_ticket:927642487705722890>x${rankingPrizes[2].sticket}, <:a_ticket:929420377946472508>x${rankingPrizes[2].aticket}, <:starlight_kernel:1106121205515288659>x${rankingPrizes[2].kernel}, <:genesis_gems:1034179687720681492>x${rankingPrizes[2].gems}, <:coins:1030580480782893197>${rankingPrizes[2].coins}`
                    + `\n\n**Participation Rewards** (${participationPoints}%)\n<:deluxe_chest:1069301259603026061>x${paricipationRewards.deluxe}, <:royal_chest:1069301128711376976>x${paricipationRewards.royal}, <:glorious_chest:1069076067081539726>x${paricipationRewards.glorious}\n<:ss_ticket:927503239396622336>x${paricipationRewards.ssticket}, <:s_ticket:927642487705722890>x${paricipationRewards.sticket}, <:a_ticket:929420377946472508>x${paricipationRewards.aticket}\n<:starlight_kernel:1106121205515288659>x${paricipationRewards.kernel}, <:genesis_gems:1034179687720681492>x${paricipationRewards.gems}, <:coins:1030580480782893197>${paricipationRewards.coins}`;
            };

            return `### <a:RollingCowL:1241776030398677093> Rolling Cow <a:RollingCowR:1241776039093338132>`
                + `\n<:info:1131679799207796756> ${tips[Math.floor(Math.random() * tips.length)]}`
                + `\n\n**Enemy Details**\n**Enemy**: ${rollingCowMobs[stats.cow_enemy_index].name}\n**Trait**: ${rollingCowAbilities[stats.cow_enemy_index].list[1]}`
                + `\n\n**Your Character**\n**Name**: ${stats.cow_char === null ? "`None`" : (`${parseInt(stats.cow_char) === -1 ? "<a:GoldenCowRoll:1256647801262182471> " : ""}` + characters[parseInt(stats.cow_char) === -1 ? stats.battlechar : stats.cow_char].name + ` Lvl. ${cowSettings.level}`)}\n**Class**: ${stats.class !== null ? classes[stats.class].name + classes[stats.class].emblem + `Lvl. ${cowSettings.clvl}` : "`None`"}\n**Equipment**: ${userItems.find((e) => e.category === "weapon" && e.type !== "shield")?.emoji ?? "<:sword_empty:1034502134474997790>"}${userItems.find((e) => e.type === "shield")?.emoji ?? "<:shield_empty:1087089686809415730>"} ${userItems.find((e) => e.type === "helmet")?.emoji ?? "<:helmet_empty:1034499888878198885>"}${userItems.find((e) => e.type === "cuirass")?.emoji ?? "<:cuirass_empty:1034499890165858305>"}${userItems.find((e) => e.type === "gloves")?.emoji ?? "<:gloves_empty:1034499892409794570>"}${userItems.find((e) => e.type === "boots")?.emoji ?? "<:boots_empty:1034499893919764480>"}${userItems.length ? " Lvl. 70/70" : ""}`
                + `\n\n**Party** (${(stats.cow_participation ?? 0) + partyQuery.reduce((acc, e) => acc + (e.cow_participation ?? 0), 0)})\n${parseInt(stats.cow_char) === -1 ? "<a:GoldenCowRoll:1256647801262182471> " : ((abilities?.[parseInt(stats.cow_char) === -1 ? stats.battlechar : stats.cow_char]?.party) ? "✨ " : "<:blank:917804200363171860> ")}__${stats.cow_char === null ? "`None`__" : (characters[parseInt(stats.cow_char) === -1 ? stats.battlechar : stats.cow_char].name + `__ \`(${cowSettings.fightsPerCharacter + 1 - (stats.cow_chars.slice(-4).filter((e) => e === stats.cow_char).length ?? 1)}/${cowSettings.fightsPerCharacter})\``)} ➜ <@${stats.id}> (${stats.cow_participation ?? 0})`
                + `${partyQuery.map((e) => `\n${parseInt(e.cow_char) === -1 ? "<a:GoldenCowRoll:1256647801262182471> " : ((abilities?.[parseInt(e.cow_char) === -1 ? e.battlechar : e.cow_char]?.party) ? "✨ " : "<:blank:917804200363171860> ")}${e.cow_char === null ? "`None`" : (characters[parseInt(e.cow_char) === -1 ? e.battlechar : e.cow_char].name + ` \`(${cowSettings.fightsPerCharacter + 1 - (e.cow_chars.slice(-4).filter((a) => a === e.cow_char).length ?? 1)}/${cowSettings.fightsPerCharacter})\``)} ➜ <@${e.id}> (${e.cow_participation ?? 0})`).join("")}`;
        };

        const Embed = new EmbedBuilder()
            .setColor(embedColor)
            .setThumbnail(rollingCowMobs[stats.cow_enemy_index].url)
            .setDescription(getDesc());
        if (footer) Embed.setFooter({ text: footer });
        interaction.reply({ embeds: [Embed], components: [getButtonRow()], fetchReply: true }).then((msg) => {
            const play = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

            play.on('collect', async r => {
                if (r.customId === "confirm") {
                    await query(`UPDATE users SET cow_participation = 0 WHERE ${stats.party ? `party = '${stats.party}'` : `id = ${stats.id}`}`);

                    stats.cow_participation = 0;
                    partyQuery.forEach((e) => { e.cow_participation = 0; });
                    Embed.setDescription(getDesc());
                    return interaction.editReply({ embeds: [Embed], components: [getButtonRow()], fetchReply: true });
                };

                if (r.customId === "change") {
                    if (tab === "details") tab = "rewards";
                    else tab = "details";

                    Embed.setDescription(getDesc());
                    return interaction.editReply({ embeds: [Embed], components: [getButtonRow()], fetchReply: true });
                };

                if (r.customId === "roll") {
                    if (stats.cow_rolled_today >= cowSettings.rollsPerDay) return;

                    const allChars = [...stats.cow_chars];
                    partyQuery.forEach((e) => {
                        allChars.push(...e.cow_chars);
                    });

                    let newChar = Object.keys(abilities).filter((key) => !allChars.includes(key)).sort(() => 0.5 - Math.random())[0];
                    if (Math.random() < cowSettings.goldenCowChance && stats.cow_char !== -1) newChar = -1; // Golden Cow

                    stats.cow_chars.push(newChar);
                    stats.cow_char = newChar;
                    stats.cow_timer = Date.now();
                    stats.cow_rolled_today++;
                    stats.cow_enemy_index = stats.cow_timer % rollingCowMobs.length;

                    await query(`UPDATE users SET cow_chars = '${stats.cow_chars.join(",")}', cow_timer = ${stats.cow_timer}, cow_rolled_today = cow_rolled_today + 1 WHERE id = ${stats.id}`);

                    Embed.setDescription(getDesc());
                    return interaction.editReply({ embeds: [Embed], components: [getButtonRow()], fetchReply: true });
                };

                if (dungeonInProgress.has(stats.id)) return interaction.channel.send(`You can play again in${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000) > 0 ? ` **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000)}**min` : ""} **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 1000) % 60}**s`);
                resolve(1);
                play.stop();
            });

            play.on('end', () => {
                resolve(-1);
            });

        });

    });
};

function sendRollingRewards() {
    db.serialize(async () => {
        const mailboxes = await query(`SELECT id, party, cow_chars, cow_participation, mailbox FROM users WHERE cow_participation IS NOT NULL`);
        mailboxes.forEach((e) => {
            e.cow_chars = (e.cow_chars || "").split(",").filter((e) => e);
            e.points = e.party ? mailboxes.reduce((acc, curr) => acc + ((curr.party === e.party) ? curr.cow_participation : 0), 0) : e.cow_participation;
            e.mailbox = JSON.parse(e.mailbox || "[]");
        });
        mailboxes.sort((a, b) => b.points - a.points);

        let rank = 1, party = mailboxes[0].party, points = mailboxes[0].points;
        for (const player of mailboxes) {
            const participationPoints = Math.ceil(100 * (player.cow_chars.length / (cowSettings.days * (cowSettings.rollsPerDay + 1) * cowSettings.fightsPerCharacter)));
            const paricipationRewards = participationPrize(participationPoints);

            let rankingRewards = { deluxe: 0, royal: 0, glorious: 0, ssticket: 0, sticket: 0, aticket: 0, kernel: 0, gems: 0, coins: 0 };
            if (player.party !== party || player.points !== points) rank++;
            party = player.party;
            if (rank === 1) rankingRewards = rankingPrizes[0];
            else if (rank < 6) rankingRewards = rankingPrizes[1];
            else if (rank < 21) rankingRewards = rankingPrizes[2];

            const mail = { "type": "2,4,8,9", "rewards": `coins|${paricipationRewards.coins + rankingRewards.coins},gems|${paricipationRewards.gems + rankingRewards.gems},item|458|${paricipationRewards.deluxe + rankingRewards.deluxe},item|457|${paricipationRewards.royal + rankingRewards.royal},item|454|${paricipationRewards.glorious + rankingRewards.glorious},item|683|${paricipationRewards.kernel + rankingRewards.kernel},ss ticket|${paricipationRewards.ssticket + rankingRewards.ssticket},s ticket|${paricipationRewards.sticket + rankingRewards.sticket},a ticket|${paricipationRewards.aticket + rankingRewards.aticket}`, "message": `Rolling Cow Rewards. Your party has ranked **#${rank}**!`, "date": Date.now() };

            player.mailbox.push(mail);
            await query(`UPDATE users SET cow_participation = NULL, mailbox = '${JSON.stringify(player.mailbox)}' WHERE id = ${player.id}`);
        };

        console.log("Rolling cow rewards sent successfully!");
    });
};

// Daily
let interval = () => setInterval(function () {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        const started = new Date(cowSettings.start);
        started.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        const day = Math.floor((now - started) / (24 * 60 * 60 * 1000)) + 1;

        if (day === cowSettings.days + 1) {
            sendRollingRewards();
        };
    };
}, 60000);
setTimeout(interval, 60000 - (Date.now() % 60000));

module.exports = {
    name: 'rolling',
    description: 'Rolling Cow (bimonthly event)',
    execute(interaction) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        db.serialize(async () => {
            let stats = await query(`SELECT users.id, users.cow_chars, users.cow_participation, users.cow_timer, users.cow_rolled_today, users.class, users.coins, users.bank, users.battlechar, users.guild, users.party, users.animationdelay, users.premium, users.tutorial, users.level, users.equipment, users.craze_equipment, users.craze_levels, users.shield_slot, characters.chars, characters.ref, characters.skin, dungeon.floors, dungeon.'limit', dungeon.classes, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${interaction.user.id}`);
            stats = { id: stats[0].id, cow_chars: (stats[0].cow_chars || "").split(",").filter((e) => e), cow_participation: stats[0].cow_participation, cow_timer: stats[0].cow_timer, cow_rolled_today: stats[0].cow_rolled_today, class: stats[0].class, coins: stats[0].coins, bank: stats[0].bank, battlechar: stats[0].battlechar, guild: stats[0].guild, party: stats[0].party, animationdelay: stats[0].animationdelay, premium: stats[0].premium, tutorial: JSON.parse(stats[0].tutorial), equipment: JSON.parse(stats[0].equipment), craze_equipment: JSON.parse(stats[0].craze_equipment), craze_levels: JSON.parse(stats[0].craze_levels), shield_slot: stats[0].shield_slot, chars: JSON.parse(stats[0].chars), ref: JSON.parse(stats[0].ref), level: stats[0].level, skin: JSON.parse(stats[0].skin), limit: stats[0].limit, floors: JSON.parse(stats[0].floors), classes: JSON.parse(stats[0].classes), classlevels: JSON.parse(stats[0].classlevels) };
            stats.cow_char = stats.cow_chars.length ? stats.cow_chars[stats.cow_chars.length - 1] : null;
            stats.cow_enemy_index = (stats.cow_timer ?? 0) % rollingCowMobs.length;

            let userItems = await query(`SELECT * FROM weapons WHERE uniqueid IN (${[stats.equipment.weapon, stats.equipment.shield, stats.equipment.helmet, stats.equipment.cuirass, stats.equipment.gloves, stats.equipment.boots].filter((e) => e).map((e) => `'${e}'`).join(", ")})`);
            userItems = userItems.map((e) => items[e.itemid]);

            // Party member stats
            const partyQuery = await query(`SELECT id, battlechar, cow_chars, cow_participation, cow_timer FROM users WHERE party = '${stats.party}' AND stampedechar IS NOT NULL AND id != ${interaction.user.id}`);
            partyQuery.forEach((e) => {
                e.cow_chars = (e.cow_chars || "").split(",").filter((e) => e);
                e.cow_char = e.cow_chars.length ? e.cow_chars[e.cow_chars.length - 1] : null;
            });
            let partyChars = partyQuery.filter((e) => e.cow_char !== null && parseInt(e.cow_char) !== -1).map((e) => characters[e.cow_char]);
            let partyStats = [];
            for (const ps of partyQuery) {
                let psStats = await query(`SELECT users.id, users.battlechar, users.class, users.coins, users.bank, users.cow_chars, users.eventpts, users.eventrewreceived, users.guild, users.party, users.animationdelay, users.premium, users.skins, users.shield_slot, characters.chars, characters.ref, users.level, users.equipment, characters.skin, dungeon.floors, dungeon.'limit', dungeon.classes, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${ps.id}`);
                psStats = { id: psStats[0].id, battlechar: psStats[0].battlechar, class: psStats[0].class, coins: psStats[0].coins, bank: psStats[0].bank, cow_chars: (psStats[0].cow_chars || "").split(",").filter((e) => e), eventpts: psStats[0].eventpts, eventrewreceived: psStats[0].eventrewreceived, guild: psStats[0].guild, party: psStats[0].party, animationdelay: psStats[0].animationdelay, premium: psStats[0].premium, skins: JSON.parse(psStats[0].skins), shield_slot: psStats[0].shield_slot, chars: JSON.parse(psStats[0].chars), ref: JSON.parse(psStats[0].ref), level: psStats[0].level, equipment: JSON.parse(psStats[0].equipment), skin: JSON.parse(psStats[0].skin), limit: psStats[0].limit, floors: JSON.parse(psStats[0].floors), classes: JSON.parse(psStats[0].classes), classlevels: JSON.parse(psStats[0].classlevels) };
                psStats.cow_char = psStats.cow_chars.length ? psStats.cow_chars[psStats.cow_chars.length - 1] : null;

                if (parseInt(psStats.cow_char) === -1 && psStats.battlechar) partyStats.push(await getDetailedStats(psStats.battlechar, psStats, psStats.classlevels));
                else if (psStats.cow_char !== null) partyStats.push(await getDetailedStats(psStats.cow_char, psStats, psStats.classlevels));
            };
            let partyStatsC = _.cloneDeep(partyStats);
            // let partyClass = partyStats.map((e) => e.class !== -1 ? classes[e.class] : false);
            // let partySkill = partyStats.map((e) => e.class !== -1 ? _.cloneDeep(skills[e.class]) : false);
            let partyAbility = partyChars.map((e) => e.id in abilities ? _.cloneDeep(abilities[e.id]) : false);


            // Level Selection
            let level = await levelSelection(interaction, stats, userItems, partyQuery);
            if (level === -1) return;

            // Set up restrictions
            const cd = 2 * 60 * 1000;
            if (dungeonInProgress.has(stats.id)) return interaction.channel.send(`You can play again in${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000) > 0 ? ` **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000)}**min` : ""} **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 1000) % 60}**s`);
            dungeonInProgress.set(stats.id, new Date().getTime() + cd);
            setTimeout(() => {
                dungeonInProgress.delete(stats.id);
                // interaction.channel.send(`${interaction.user.toString()} is off </stampede:1111044852679979019> cooldown!`);
            }, cd);

            // Equip Rolled Char
            if (parseInt(stats.cow_char) !== -1) stats.battlechar = stats.cow_char;

            // Fixed levels
            stats.level = cowSettings.level || 600;
            if (stats.class || stats.class === 0) {
                stats.classlevels = Object.fromEntries(Array.from({ length: classes.length }, (_, i) => [i, classLevelToXP(cowSettings.clvl || 1200)]));
            } else stats.class = null;

            // Fixed item levels
            for (const item of userItems) {
                if (item.category === "weapon") {
                    if (item.type === "shield") stats.equipment.shield = `${item.id}:706183309943767112`;
                    else stats.equipment.weapon = `${item.id}:706183309943767112`;
                } else stats.equipment[item.type] = `${item.id}:706183309943767112`;
            };

            // User stats
            let myChar = characters[stats.battlechar];
            let myStats = await getDetailedStats(myChar.id, stats, stats.classlevels);

            myStats.thumbnail = myChar.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[myChar.id], stats.skin[myChar.id]);

            let myStatsC = { ...myStats };
            let myClass = myStats.class !== -1 ? classes[myStats.class] : false;
            let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : false;
            let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : false;

            // Enemy Stats
            let enemy = rollingCowMobs[stats.cow_enemy_index];
            // const curseRar = enemy.boss ? curses.filter((e) => e.tier) : curses.filter((e) => e.tier === 0);
            // const curse = curseRar[Math.floor(Math.random() * curseRar.length)];
            const curse = curses[7]; // Shadow Step
            let eAbility = rollingCowAbilities[stats.cow_enemy_index];
            // let eImage = enemy.image[Math.floor(Math.random() * enemy.image.length)];

            const lootFloor = 80; // 80
            let eStats = floors[lootFloor].stats(enemy);
            eStats.image = enemy.image[Math.floor(Math.random() * enemy.image.length)]; // eImage;
            let eStatsC = { ...eStats };

            // Some match settings
            const difficulty = Avalon.getDifficulty(myStats.ep / eStats.ep);
            const aDelay = stats.premium ? stats.animationdelay : 1200;

            let buffs = Avalon.getBuffs();
            let eBuffs = Avalon.getBuffs();

            let matchStats = Avalon.getMatchStats(interaction);
            let notice = ["", "", "", ""];
            matchStats.actionSequence = [];
            matchStats.partyChars = partyChars;
            matchStats.partyStats = partyStatsC;

            let resolved = false;
            async function matchResult() {
                if (resolved) return;
                resolved = true;

                // Clear restrictions
                dungeonInProgress.delete(stats.id);

                const Embed = new EmbedBuilder()
                    .setColor(embedColor) // Blue: 
                    .setThumbnail(myStatsC.thumbnail)
                    .setFooter({ text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" });

                // Update cow stats
                stats.cow_chars.push(stats.cow_char);
                let pointsEarned = 0;
                for (let i = 1; i <= matchStats.round + 1; i++) {
                    pointsEarned += Math.floor(Math.sqrt(i));
                };
                await query(`UPDATE users SET cow_participation = ${stats.cow_participation + pointsEarned}, cow_chars = '${stats.cow_chars.join(",")}', cow_timer = cow_timer + ${Math.floor(Math.random() * rollingCowMobs.length)} WHERE id = ${interaction.user.id}`);

                // // Coins
                // let loot = 0;
                // loot = 40 + Math.floor(Math.random() * 30) + (lootFloor < 100 ? lootFloor * 3 : 300 + (lootFloor * 1.5));
                // if (guild?.lootbuff) loot *= 1 + (0.2 * guild.lootbuff);
                // loot *= matchStats.lootm;
                // loot += matchStats.loot;
                // loot = Math.floor(loot);
                // if (loot > 200000) loot = 42187;

                // // Chests
                // let chestRarities = [453, 454, 456, 457];
                // let chestDrops = [0, 0, 0, 0];

                // let ssShards = 0, sShards = 0, aShards = 0, bShards = 0, cShards = 0, dShards = 0;

                // // Shards
                // ssShards += drops(0.009, 1);
                // sShards += drops(0.015, 1);
                // aShards += drops(0.03, 2);
                // bShards += drops(0.06, 2);
                // cShards += drops(0.09, 3);
                // dShards += drops(0.12, 5);

                // // Chests
                // chestDrops[0] += drops(0.08);
                // chestDrops[1] += drops(0.05);
                // chestDrops[2] += drops(0.02);
                // chestDrops[3] += drops(0.009);

                // // Levelup mats
                // let levelupMats = {
                //     "50": lootFloor <= 100 ? drops(0.2, 3) : 0,
                //     "51": lootFloor <= 100 ? drops(0.2, 6) : 0,
                //     "52": lootFloor <= 100 ? drops(0.09, 2) : lootFloor <= 200 ? drops(0.2, 3) : 0,
                //     "53": lootFloor <= 100 ? drops(0.12, 3) : lootFloor <= 200 ? drops(0.2, 6) : 0,
                //     "54": lootFloor > 200 ? drops(0.2, 3) : lootFloor > 100 ? drops(0.09, 2) : 0,
                //     "55": lootFloor > 200 ? drops(0.2, 6) : lootFloor > 100 ? drops(0.12, 3) : 0,
                //     "56": lootFloor > 200 ? drops(0.09, 2) : 0,
                //     "57": lootFloor > 200 ? drops(0.12, 3) : 0,
                // };

                // let lootArr = [];
                // if (ssShards) lootArr.push(`<:ss_shard:917203009543503892>x${ssShards}`);
                // if (sShards) lootArr.push(`<:s_shard:917202925514817566>x${sShards}`);
                // if (aShards) lootArr.push(`<:a_shard:917202904862052392>x${aShards}`);
                // if (bShards) lootArr.push(`<:b_shard:917202862851899392>x${bShards}`);
                // if (cShards) lootArr.push(`<:c_shard:917202862499582002>x${cShards}`);
                // if (dShards) lootArr.push(`<:d_shard:917202840563363891>x${dShards}`);

                // let myItems = await query(`SELECT items FROM users WHERE users.id = ${interaction.user.id}`);
                // myItems = JSON.parse(myItems[0].items);

                // Object.entries(levelupMats).forEach((e) => {
                //     if (e[0] in myItems) myItems[e[0]] += e[1];
                //     else myItems[e[0]] = e[1];
                // });
                // chestRarities.forEach((e, i) => {
                //     if (chestDrops[i]) {
                //         if (e in myItems) myItems[e]++;
                //         else myItems[e] = 1;
                //     };
                // });

                // await query(`UPDATE users SET ${stats.craze_levels[level] === 1 ? "expulls = expulls + 1, " : ""}coins = coins + ${loot}, items = '${JSON.stringify(myItems)}', craze_levels = '${JSON.stringify(stats.craze_levels)}', ssshard = ssshard + ${ssShards}, sshard = sshard + ${sShards}, ashard = ashard + ${aShards}, bshard = bshard + ${bShards}, cshard = cshard + ${cShards}, dshard = dshard + ${dShards} WHERE id = ${interaction.user.id}`);

                // return Embed
                //     .setDescription(`<:stars_v2:917023655840591963> **${myChar.name}** won! <:stars_v2:917023655840591963>\n<a:arrow_green:916716811842621450> Level ${level + 1} progress: **${stats.craze_levels[level]}**/${1}\n\n<:npbag:929428030554787892> Loot\n${stats.craze_levels[level] === 1 ? "1x <a:EXTRA:1138530846144462968>, " : ""}${loot ? `${loot}<:coins:872926669055356939>, ` : ""}${chestRarities.reduce((total, e, i) => total += chestDrops[i] ? `${items[e].emoji}x1, ` : "", "")}${Object.entries(levelupMats).filter((e) => e[1]).map((e) => `${items[e[0]].emoji}x${e[1]}, `).join("")}\n${lootArr.join(", ")}`)
                //     .setFooter({ text: `Balance: ${stats.coins + loot} coins`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" });

                return Embed
                    .setDescription(`### <a:RollingCowL:1241776030398677093> Rolling Cow <a:RollingCowR:1241776039093338132>\n<:stars_v2:917023655840591963> **${myChar.name}** lasted ${matchStats.round} rounds! <:stars_v2:917023655840591963>\n<a:arrow_green:916716811842621450> Earned **${pointsEarned}** points\n\n<:npbag:929428030554787892> Loot\n`)
                    .setFooter({ text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" });
            };

            // Apply passives
            eAbility._passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
            if (skill && myChar.id !== 4767) skill._passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
            if (myAbility?.passive) myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            if (myStats.weapon !== -1) items[myStats.weapon]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            if (myStats.shieldid) items[myStats.shieldid]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            if (myStats.helmet && items?.[myStats.helmet].setname === items?.[myStats.cuirass]?.setname && items?.[myStats.helmet].setname === items?.[myStats.gloves]?.setname && items?.[myStats.helmet].setname === items?.[myStats.boots]?.setname) items[myStats.boots]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            partyAbility.filter((e) => e).forEach((e, i) => ("party" in e) ? e.party(partyStatsC[i], myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user) : false);

            let ATK_EMOJI = myStatsC.replaceButton?.atk?.emoji || '⚔️',
                DEF_EMOJI = myStatsC.replaceButton?.def?.emoji || '🛡️',
                ABILITY_EMOJI = myStatsC.replaceButton?.ability?.emoji || '✨',
                SKILL_EMOJI = myStatsC.replaceButton?.skill?.emoji || '⚜️',
                SKIP_EMOJI = myStatsC.replaceButton?.skip?.emoji || '<:dodge_chance:1047269150948606063>';

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle('Secondary'),
                    new ButtonBuilder().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle('Secondary'),
                    new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle('Secondary').setDisabled((myAbility && "ability" in myAbility) ? false : true),
                    new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle('Secondary').setDisabled(myStats.class !== -1 ? false : true),
                    new ButtonBuilder().setCustomId('SKIP').setEmoji(SKIP_EMOJI).setStyle('Secondary'),
                );

            // If Enemy Died
            if (eStatsC.hp < 1) { // if (myStats.ep/eStats.ep >= 2) {
                const result = await matchResult("w");
                return interaction.editReply({ embeds: [result] });;
            };

            async function newFight() {
                let timestart = new Date().getTime();
                let result = await new Promise((resolve) => {
                    const Embed = new EmbedBuilder()
                        .setColor(embedColor)
                        .setThumbnail(myStatsC.thumbnail)
                        .setFooter({ text: `Enemy EP: ${eStatsC.ep} | round 1 | time left: 120s` })
                        .setTitle(`Rolling Cow`)
                        .setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}\\💖${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStats.hp, eStatsC.sm / eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStats.hp}\\💖${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana)}\n${Avalon.padStats(myStatsC)}`)
                        .setImage(eStatsC.image);
                    interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {

                        const atk = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ATK", componentType: ComponentType.Button, time: 120000 });
                        const def = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "DEF", componentType: ComponentType.Button, time: 120000 });
                        const ability = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ABILITY", componentType: ComponentType.Button, time: 120000 });
                        const cskill = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKILL", componentType: ComponentType.Button, time: 120000 });
                        const skip = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKIP", componentType: ComponentType.Button, time: 120000 });
                        matchStats.collector = { "atk": atk, "def": def, "ability": ability, "cskill": cskill, "skip": skip };

                        // Use passives
                        if (myChar.id !== 4767) curse.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                        let timeout;
                        async function editEmbed() {
                            Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStatsC.maxhp, eStatsC.sm / eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-4).join("")}`);
                            Embed.setFooter({ text: `Enemy EP: ${eStatsC.ep} | round ${matchStats.round} | time left: ${120 + Math.floor((timestart - new Date().getTime()) / 1000)}s` });
                            // await msg.edit({ embeds: [Embed] });

                            // Debounce
                            clearTimeout(timeout);
                            timeout = setTimeout(() => {
                                msg.edit({ embeds: [Embed] });
                            }, 600);
                        };

                        function minionDefeated(side) {
                            if (side === "my") {
                                myStatsC = { ...matchStats.myStatsCC };
                                matchStats.currentCharacter = 0;
                                Embed.setThumbnail(myStatsC.thumbnail);
                                startNextRound();
                            } else {
                                eStatsC = { ...matchStats.eStatsCC };
                                matchStats.currentOpponent = 0;
                                Embed.setImage(eStatsC.image);
                                attack();
                            };
                        };

                        function endMatch(wORl) {
                            if (matchStats.ended) return;
                            else matchStats.ended = true;

                            atk.stop(), def.stop(), skip?.stop(), ability?.stop(), cskill?.stop();
                            if (wORl === "l") notice.push(`\n💀 **${myChar.name}** lost`);
                            else notice.push(`\n🎉 **${myChar.name}** won${level === 13 && stats.craze_equipment.weapon === "<:GojoHeart:1194021178029920266>" ? " <:GojoHeart:1194021178029920266>" : ""}`);
                            editEmbed();
                            matchStats.turn = 1;
                            resolve(matchResult(wORl));
                        };

                        // Level 14
                        if (level === 13 && stats.craze_equipment.weapon === "<:GojoHeart:1194021178029920266>") {
                            eStatsC.hp = 0;
                            endMatch("w");
                        };

                        function startNextRound() {
                            if (matchStats.round === matchStats.roundCheck) return;
                            matchStats.roundCheck = matchStats.round;

                            // Consume Mana
                            Avalon.consumeActiveMana(matchStats, myStatsC, buffs, myChar, notice, Embed, myStatsC.thumbnail);

                            // Reset Buffs
                            if (matchStats.currentCharacter === 0) myStatsC.atk = myStats.atk, myStatsC.md = myStats.md, myStatsC.def = myStats.def, myStatsC.mr = myStats.mr, myStatsC.cd = myStats.cd, myStatsC.cr = myStats.cr, myStatsC.dodge = myStats.dodge, myStatsC.br = myStats.br, myStatsC.mg = myStats.mg;
                            if (matchStats.currentOpponent === 0) eStatsC.atk = eStats.atk, eStatsC.md = eStats.md, eStatsC.def = eStats.def, eStatsC.mr = eStats.mr, eStatsC.cd = eStats.cd, eStatsC.cr = eStats.cr, eStatsC.dodge = eStats.dodge, eStatsC.br = eStats.br, eStatsC.mg = eStats.mg;

                            // Remove HP debuffs
                            eBuffs.hp = eBuffs.hp.filter((buff) => (buff.type === "*" && buff.val > 1) || (buff.type === "+" && buff.val > 0));

                            // Increase ATK
                            eBuffs.atk.push(new buffInfo("+", Math.floor(eStats.atk * matchStats.round * 0.0125), 9999));
                            eBuffs.md.push(new buffInfo("+", Math.floor(eStats.md * matchStats.round * 0.0125), 9999));

                            // Apply Buffs
                            if (matchStats.currentCharacter === 0) Avalon.applyBuffs(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice);
                            if (matchStats.currentOpponent === 0) Avalon.applyBuffs(eStatsC, eStatsC, eBuffs, buffs, matchStats, notice);

                            // Fix Stats
                            if (myStatsC.hp > myStatsC.maxhp) myStatsC.hp = myStatsC.maxhp;
                            else if (myStatsC.hp < 0) myStatsC.hp = 0;
                            else myStatsC.hp = Math.floor(myStatsC.hp);
                            if (eStatsC.hp > eStatsC.maxhp) eStatsC.hp = eStatsC.maxhp;
                            else if (eStatsC.hp < 0) eStatsC.hp = 0;
                            else eStatsC.hp = Math.floor(eStatsC.hp);

                            // Check and run delayed buffs
                            if (matchStats.currentCharacter === 0) {
                                for (let i = myStatsC.delayedBuffs.length - 1; i >= 0; i--) {
                                    if (myStatsC.delayedBuffs[i].round <= matchStats.round) {
                                        myStatsC.delayedBuffs[i].run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                        if (myStatsC.delayedBuffs[i].last <= 1 || myStatsC.delayedBuffs[i].used >= myStatsC.delayedBuffs[i].usage) {
                                            myStatsC.delayedBuffs.splice(i, 1);
                                        } else {
                                            myStatsC.delayedBuffs[i].decrement();
                                        };
                                    };
                                };
                            };

                            // Cap br and dodge
                            myStatsC.br = Math.min(myStatsC.br, 0.9);
                            myStatsC.dodge = Math.min(myStatsC.dodge, 0.9);

                            Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                        };

                        let forcedSkillUse = 0;
                        function attack() {
                            if (matchStats.turn === 1) return;
                            if (eStatsC.timeFrozen) {
                                if (eStatsC.frozenMessage) notice.push(`\n✨ **${enemy.name}** ${eStatsC.frozenMessage}.`);
                                if (!(matchStats.playerPausingRounds > 0)) matchStats.turn = 1;
                                matchStats.turn = 1;
                                matchStats.round++;
                                startNextRound();
                                editEmbed();
                                if (matchStats.playerPausingRounds > 0) {
                                    matchStats.playerPausingRounds--;
                                    attack();
                                };
                            } else {
                                setTimeout(() => {
                                    if (matchStats.blockAbilities-- <= 0 && myChar.id !== 4767 && eStatsC.sm >= curse.cost && Math.random() < 0.3) {
                                        curse.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                        eStatsC.sm -= curse.cost;
                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        attack();
                                    } else if ((eStatsC.forceUseSkillOnRound === matchStats.round && forcedSkillUse++ === 0) || ("forceUseSkillOnRound" in eStatsC ? false : (matchStats.blockAbilities-- < 0 && myChar.id !== 4767 && eAbility && eStatsC.sm >= eAbility.cost && Math.random() < 0.5))) {
                                        eAbility.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        attack();
                                    } else {
                                        dealDamage(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, `⚔️ **${enemy.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        if (!(matchStats.playerPausingRounds > 0)) matchStats.turn = 1;
                                        matchStats.turn = 1;
                                        matchStats.round++;
                                        startNextRound();
                                        editEmbed();
                                        if (matchStats.playerPausingRounds > 0) {
                                            matchStats.playerPausingRounds--;
                                            attack();
                                        };
                                    };
                                    if (matchStats.counter > 0) matchStats.counter--;
                                }, aDelay);
                            };
                        };

                        // Write passive actions if any
                        if (notice.length > 4) {
                            Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            editEmbed();
                        };

                        atk.on('collect', async () => {
                            if (matchStats.turn === 1) {
                                matchStats.turn = 0;

                                // If attack was replaced
                                if ("atk" in myStatsC.replaceButton) {
                                    myStatsC.replaceButton.atk.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    if (matchStats.turn === 0) attack();
                                }

                                // Normal attack
                                else {
                                    dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, canTwinshot: true });
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                    attack();

                                    // if (matchStats.twinshot > Math.random()) setTimeout(() => {
                                    //     dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                    //     editEmbed();
                                    //     Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    //     attack();
                                    // }, aDelay);

                                    // else attack();
                                };

                            } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                        });

                        def.on('collect', async () => {
                            if (matchStats.turn === 1) {
                                matchStats.turn = 0;
                                myStatsC.attackStreak = 0;

                                // If defense was replaced
                                if ("def" in myStatsC.replaceButton) {
                                    myStatsC.replaceButton.def.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    if (matchStats.turn === 0) attack();
                                }

                                // Use defense
                                else {
                                    if (++matchStats.defUsed === 10) interaction.followUp({ content: `You have used DEF 10 times and won't get any ${customEmojis.def} or ${customEmojis.mr} from now on!`, ephemeral: true });
                                    if (matchStats.defUsed > 10) {
                                        notice.push(`\n🛡️ **${myChar.name}** can't increase DEF/MR anymore`);
                                    } else {
                                        let adddef = 60 + Math.floor(30 * Math.random()) - ((matchStats.defUsed - 1) * 5);
                                        let addmr = Math.floor((myClass ? 60 * myClass.stats.mr[0] : 60) + (30 * Math.random())) - ((matchStats.defUsed - 1) * 5);
                                        buffs.def.push(new buffInfo("+", adddef, 9999));
                                        buffs.mr.push(new buffInfo("+", addmr, 9999));
                                        myStatsC.def += adddef;
                                        myStatsC.mr += addmr;
                                        notice.push(`\n🛡️ **${myChar.name}** has increased DEF by **${adddef}** and MR by **${addmr}**`);
                                    };
                                    myStatsC.usedBlockRound = matchStats.round;
                                    attack();
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                }

                            } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                            matchStats.trigger("defend", myStatsC, eStatsC, buffs, eBuffs);
                        });

                        ability.on('collect', async () => {
                            if (myStatsC.isAbilityBlocked) return interaction.followUp({ content: `You currently can't use your character ability`, ephemeral: true });

                            // If ability was replaced
                            if ("ability" in myStatsC.replaceButton && "run" in myStatsC.replaceButton.ability && matchStats.turn === 1) {
                                matchStats.turn = 0;
                                myStatsC.attackStreak = 0;
                                myStatsC.replaceButton.ability.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                attack();
                            }

                            else {
                                if (myAbility.used < myAbility.usage) {
                                    if (matchStats.turn === 1) {
                                        if (myAbility.cost > myStatsC.sm) interaction.followUp({ content: `You don't have enough mana! (**${myStatsC.sm}**/${myAbility.cost}${customEmojis.mana})`, ephemeral: true });
                                        else {
                                            matchStats.turn = 0;
                                            myStatsC.attackStreak = 0;
                                            myAbility.used++;
                                            await myAbility.ability(myStatsC, myStats, eStatsC, eStats, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, msg);
                                            myStatsC.sm -= myAbility.cost;
                                            editEmbed();
                                            Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                            attack();
                                        };
                                    } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                                } else interaction.followUp({ content: `You can use **${myChar.name}**'s ability only ${myAbility.usage == 1 ? "once" : `${myAbility.usage} times`} per fight.`, ephemeral: true });
                            };
                            // Trigger ability
                            matchStats.trigger("ability", myStatsC, eStatsC, buffs, eBuffs);
                        });

                        cskill.on('collect', () => {

                            // If class active was replaced
                            if ("cskill" in myStatsC.replaceButton && matchStats.turn === 1) {
                                matchStats.turn = 0;
                                myStatsC.attackStreak = 0;
                                myStatsC.replaceButton.cskill.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                if (matchStats.turn === 0) attack();
                            }

                            // Class active
                            else {
                                if (myChar.id === 4767) return interaction.followUp({ content: "Asta can't use any abilities", ephemeral: true });
                                if (skill._cost > myStatsC.sm) return interaction.followUp({ content: `You don't have enough mana! (**${myStatsC.sm}**/${skill._cost}${customEmojis.mana})`, ephemeral: true });
                                else {
                                    if (matchStats.turn === 1) {
                                        myStatsC.sm -= skill._cost;
                                        myStatsC.attackStreak = 0;
                                        skill._skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user, stats.chars);
                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        attack();
                                    } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                                };
                            };
                            // Trigger class active
                            matchStats.trigger("cskill", myStatsC, eStatsC, buffs, eBuffs);
                        });

                        skip.on('collect', () => {
                            if (matchStats.turn == 1) {
                                notice.push(`\n<:dodge_chance:1047269150948606063> ${myChar.name} fled the fight`);
                                endMatch("l");
                                editEmbed();
                            } else {
                                matchStats.turn = 1;
                                interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                            };
                        });

                        atk.on('end', () => {
                            if (120 + Math.floor((timestart - new Date().getTime()) / 1000) < 1) {
                                atk.stop(), def.stop(), ability.stop(), cskill.stop();
                                if (resolved) return;

                                // Level 14
                                if (level === 13 && myChar.name === "Suguru Getou" && partyChars.some((e) => e.name === "Prison Realm")) {
                                    notice.push(`\n🎉 **Satoru Gojo** was sealed!`);
                                    editEmbed();
                                    resolve(matchResult("w"));
                                } else {
                                    resolve(matchResult("l"));
                                };
                            };
                        });

                    });

                });
                interaction.channel.send({ embeds: [result] });
            };

            newFight();
        });

    },
};
