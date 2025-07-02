import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle, ChatInputCommandInteraction } from "discord.js";
import { abilities, Ability } from "../Modules/abilities";
import { classes } from "../Modules/classes";
import { curses } from "../Modules/curses";
import { floors, rollingCowMobs } from "../Modules/enemies";
import { armorInfo, itemInfo, items, ringInfo, weaponInfo } from "../Modules/items";
import { AbilityResponse, cowSettings } from "../Modules/components";
import { skills, rollingCowAbilities } from "../Modules/skills";
import { characters } from "../Modules/chars";
import { getDetailedStats, customEmojis, dealDamage, classLevelToXP } from "../Modules/functions";
import Avalon from "../Modules/avalon";
import buffInfo from "../Modules/buffs";
import _ from 'lodash';
import { CompactUserSchema, DetailedStats, SlashCommand } from '../types';
import { getPartyMembers, getUserSchemas, getWeaponSchemas, loadCowParticipants, updateUsers } from '../Modules/queries';

type RcUserSchema = CompactUserSchema & {
    cow_char?: number;
    cow_enemy_index?: number;
};

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

function participationPrize(points: number) { // points: [0, 100] = ceil(100 * (rolls / (days * (rollsPerDay + 1) * fightsPerCharacter)))
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

function levelSelection(interaction: ChatInputCommandInteraction, stats: RcUserSchema, userItems: itemInfo[], partySchema: RcUserSchema[]) {
    return new Promise((resolve) => {
        const started = new Date(cowSettings.start);
        started.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const day = Math.floor((today.getTime() - started.getTime()) / (24 * 60 * 60 * 1000)) + 1;

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
        else if ((Date.now() - (stats.cow_timer ?? 0)) < (cowSettings.timeInMinutes * 60 * 1000)) footer = `You have ${cowSettings.timeInMinutes - Math.floor((Date.now() - (stats.cow_timer ?? 0)) / (60 * 1000))}m left to fight`;

        const getButtonRow = () => {
            if (isDisabled) {
                return new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('disabled')
                            .setLabel(day < 1 ? `The event will start ${day === 0 ? "tomorrow" : `in ${1 - day} days`}!` : (((day - cowSettings.days) < 7) ? `The event has ended!` : `The event hasn't started yet!`))
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(isDisabled)
                    );
            };

            if (stats.cow_participation === null) {
                return new ActionRowBuilder<ButtonBuilder>()
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

            const isTimeup = ((Date.now() - (stats.cow_timer ?? 0)) > (cowSettings.timeInMinutes * 60 * 1000));
            if (stats.cow_char === null || isTimeup || stats.cow_chars.slice(-4).filter((e) => e === stats.cow_char).length > cowSettings.fightsPerCharacter) {
                return new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('roll')
                            .setLabel((stats.cow_rolled_today >= cowSettings.rollsPerDay) ? `You've reached the daily limit!` : (`${(isTimeup && stats.cow_timer !== null) ? "Time's up! " : ""}Roll a new character!`))
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(isDisabled || (stats.cow_rolled_today >= cowSettings.rollsPerDay)),
                        changeTabButton
                    );
            };

            return new ActionRowBuilder<ButtonBuilder>()
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
                    + `\n\n**Current Party**: ${interaction.user.toString()}${partySchema.length ? ", " : ""}${partySchema.map((e) => `<@${e.id}>`).join(", ")}`;
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
                + `\n\n**Enemy Details**\n**Enemy**: ${rollingCowMobs[stats.cow_enemy_index ?? 0].name}\n**Trait**: ${rollingCowAbilities[stats.cow_enemy_index ?? 0].list[1]}`
                + `\n\n**Your Character**\n**Name**: ${stats.cow_char === null ? "`None`" : (`${stats.cow_char === -1 ? "<a:GoldenCowRoll:1256647801262182471> " : ""}` + characters[(stats.cow_char === -1 ? stats.battlechar : stats.cow_char) ?? 0].name + ` Lvl. ${cowSettings.level}`)}\n**Class**: ${stats.class !== null ? classes[stats.class].name + classes[stats.class].emblem + `Lvl. ${cowSettings.clvl}` : "`None`"}\n**Equipment**: ${userItems.find((e) => e.category === "weapon" && e.type !== "shield")?.emoji ?? "<:sword_empty:1034502134474997790>"}${userItems.find((e) => e.type === "shield")?.emoji ?? "<:shield_empty:1087089686809415730>"} ${userItems.find((e) => e.type === "helmet")?.emoji ?? "<:helmet_empty:1034499888878198885>"}${userItems.find((e) => e.type === "cuirass")?.emoji ?? "<:cuirass_empty:1034499890165858305>"}${userItems.find((e) => e.type === "gloves")?.emoji ?? "<:gloves_empty:1034499892409794570>"}${userItems.find((e) => e.type === "boots")?.emoji ?? "<:boots_empty:1034499893919764480>"}${userItems.length ? " Lvl. 70/70" : ""}`
                + `\n\n**Party** (${(stats.cow_participation ?? 0) + partySchema.reduce((acc, e) => acc + (e.cow_participation ?? 0), 0)})\n${stats.cow_char === -1 ? "<a:GoldenCowRoll:1256647801262182471> " : ((abilities?.[(stats.cow_char === -1 ? stats.battlechar : stats.cow_char) ?? 0]?.party) ? "✨ " : "<:blank:917804200363171860> ")}__${stats.cow_char === null ? "`None`__" : (characters[(stats.cow_char === -1 ? stats.battlechar : stats.cow_char) ?? 0].name + `__ \`(${cowSettings.fightsPerCharacter + 1 - (stats.cow_chars.slice(-4).filter((e) => e === stats.cow_char).length ?? 1)}/${cowSettings.fightsPerCharacter})\``)} ➜ <@${stats.id}> (${stats.cow_participation ?? 0})`
                + `${partySchema.map((e) => `\n${e.cow_char === -1 ? "<a:GoldenCowRoll:1256647801262182471> " : ((abilities?.[(e.cow_char === -1 ? e.battlechar : e.cow_char) ?? 0]?.party) ? "✨ " : "<:blank:917804200363171860> ")}${e.cow_char === null ? "`None`" : (characters[(e.cow_char === -1 ? e.battlechar : e.cow_char) ?? 0].name + ` \`(${cowSettings.fightsPerCharacter + 1 - (e.cow_chars.slice(-4).filter((a) => a === e.cow_char).length ?? 1)}/${cowSettings.fightsPerCharacter})\``)} ➜ <@${e.id}> (${e.cow_participation ?? 0})`).join("")}`;
        };

        const Embed = new EmbedBuilder()
            .setColor(embedColor)
            .setThumbnail(rollingCowMobs[stats.cow_enemy_index ?? 0].url)
            .setDescription(getDesc());
        if (footer) Embed.setFooter({ text: footer });
        interaction.reply({ embeds: [Embed], components: [getButtonRow()] }).then((msg) => {
            const play = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

            play.on('collect', async r => {
                if (r.customId === "confirm") {
                    // Update users table
                    await updateUsers([stats.id, ...partySchema.map((e) => e.id)], {
                        cow_participation: { type: "set", value: 0 },
                    });

                    stats.cow_participation = 0;
                    partySchema.forEach((e) => { e.cow_participation = 0; });
                    Embed.setDescription(getDesc());
                    return interaction.editReply({ embeds: [Embed], components: [getButtonRow()] });
                };

                if (r.customId === "change") {
                    if (tab === "details") tab = "rewards";
                    else tab = "details";

                    Embed.setDescription(getDesc());
                    return interaction.editReply({ embeds: [Embed], components: [getButtonRow()] });
                };

                if (r.customId === "roll") {
                    if (stats.cow_rolled_today >= cowSettings.rollsPerDay) return;

                    const allChars = [...stats.cow_chars];
                    partySchema.forEach((e) => {
                        allChars.push(...e.cow_chars);
                    });

                    let newChar = parseInt(Object.keys(abilities).filter((key) => !allChars.includes(parseInt(key))).sort(() => 0.5 - Math.random())[0]);
                    if (Math.random() < cowSettings.goldenCowChance && stats.cow_char !== -1) newChar = -1; // Golden Cow

                    stats.cow_chars.push(newChar);
                    stats.cow_char = newChar;
                    stats.cow_timer = Date.now();
                    stats.cow_rolled_today++;
                    stats.cow_enemy_index = stats.cow_timer % rollingCowMobs.length;

                    // Update users table
                    await updateUsers(stats.id, {
                        cow_rolled_today: { type: "increment", value: 1 },
                        cow_chars: { type: "append", value: [newChar] },
                        cow_timer: { type: "set", value: stats.cow_timer },
                    });

                    Embed.setDescription(getDesc());
                    return interaction.editReply({ embeds: [Embed], components: [getButtonRow()] });
                };

                if (dungeonInProgress.has(stats.id)) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`You can play again in${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000) > 0 ? ` **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000)}**min` : ""} **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 1000) % 60}**s`);
                    return;
                };
                resolve(1);
                play.stop();
            });

            play.on('end', () => {
                resolve(-1);
            });

        });

    });
};

async function sendRollingRewards() {

    const participants = await loadCowParticipants();
    participants.forEach((e) => {
        e.points = e.party
            ? participants.reduce((acc, curr) => acc + ((curr.party === e.party) ? (curr.cow_participation ?? 0) : 0), 0)
            : e.cow_participation ?? 0;
    });
    participants.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));

    let rank = 1, party = participants[0].party;
    for (const player of participants) {
        const participationPoints = Math.ceil(100 * (player.cow_chars.length / (cowSettings.days * (cowSettings.rollsPerDay + 1) * cowSettings.fightsPerCharacter)));
        const paricipationRewards = participationPrize(participationPoints);

        let rankingRewards = { deluxe: 0, royal: 0, glorious: 0, ssticket: 0, sticket: 0, aticket: 0, kernel: 0, gems: 0, coins: 0 };
        if (player.party !== party) rank++;
        party = player.party;
        if (rank === 1) rankingRewards = rankingPrizes[0];
        else if (rank < 6) rankingRewards = rankingPrizes[1];
        else if (rank < 21) rankingRewards = rankingPrizes[2];

        const mail = { "type": "2,4,8,9", "rewards": `coins|${paricipationRewards.coins + rankingRewards.coins},gems|${paricipationRewards.gems + rankingRewards.gems},item|458|${paricipationRewards.deluxe + rankingRewards.deluxe},item|457|${paricipationRewards.royal + rankingRewards.royal},item|454|${paricipationRewards.glorious + rankingRewards.glorious},item|683|${paricipationRewards.kernel + rankingRewards.kernel},ss ticket|${paricipationRewards.ssticket + rankingRewards.ssticket},s ticket|${paricipationRewards.sticket + rankingRewards.sticket},a ticket|${paricipationRewards.aticket + rankingRewards.aticket}`, "message": `Rolling Cow Rewards. Your party has ranked **#${rank}**!`, "date": Date.now() };

        // Update users table
        await updateUsers(player.id, {
            mailbox: { type: "append", value: [mail] },
            // cow_participation: { type: "set", value: null },
        });

        // // wait for 100ms
        // await new Promise(resolve => setTimeout(resolve, 100));
    };

    console.log("Rolling cow rewards sent successfully!");
};

// Daily
let interval = () => setInterval(function () {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 5) { // 5 min delay
        const started = new Date(cowSettings.start);
        started.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        const day = Math.floor((now.getTime() - started.getTime()) / (24 * 60 * 60 * 1000)) + 1;

        if (day === cowSettings.days + 1) {
            sendRollingRewards();
        };
    };
}, 60000);
setTimeout(interval, 60000 - (Date.now() % 60000));

const exportCommand: SlashCommand = {
    name: 'rolling',
    async execute({ interaction, author }) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        const stats = author.schema as RcUserSchema;
        stats.cow_char = stats.cow_chars.length ? stats.cow_chars[stats.cow_chars.length - 1] : undefined;
        stats.cow_enemy_index = (stats.cow_timer ?? 0) % rollingCowMobs.length;

        const myWeapons = await getWeaponSchemas([stats.equipment.weapon, stats.equipment.shield, stats.equipment.helmet, stats.equipment.cuirass, stats.equipment.gloves, stats.equipment.boots]);
        const userItems = myWeapons.map((e) => items[e.itemid]);

        // Party member stats
        const partyQuery = stats.party ? await getPartyMembers(stats.party, { excludeIds: [interaction.user.id], hasStampedeChar: true }) : [];
        const partyChars = partyQuery.map((e) => characters[e.stampedechar as number]);
        const partySchema = await getUserSchemas(partyQuery.map((e) => e.id)) as RcUserSchema[];

        let partyStats: DetailedStats[] = [];
        for (const ps of partySchema) {
            ps.cow_char = ps.cow_chars.length ? ps.cow_chars[ps.cow_chars.length - 1] : undefined;

            if (ps.cow_char !== undefined && ps.battlechar !== null) {
                if (ps.cow_char === -1) {
                    partyStats.push(await getDetailedStats(ps.battlechar, ps, ps.dungeon_classlevels));
                } else {
                    partyStats.push(await getDetailedStats(ps.cow_char, ps, ps.dungeon_classlevels));
                };
            };
        };
        let partyStatsC = _.cloneDeep(partyStats);
        // let partyClass = partyStats.map((e) => e.class !== -1 ? classes[e.class] : false);
        // let partySkill = partyStats.map((e) => e.class !== -1 ? _.cloneDeep(skills[e.class]) : false);
        const partyAbility: (Ability | undefined)[] = []; // partyChars.map((e) => e.id in abilities ? _.cloneDeep(abilities[e.id]) : undefined).filter((e) => e !== undefined);

        // Level Selection
        let level = await levelSelection(interaction, stats, userItems, partySchema);
        if (level === -1) return;


        // Set up restrictions
        const cd = 2 * 60 * 1000;
        if (dungeonInProgress.has(stats.id)) {
            if (interaction.channel?.isSendable()) interaction.channel.send(`You can play again in${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000) > 0 ? ` **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000)}**min` : ""} **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 1000) % 60}**s`);
            return;
        };
        dungeonInProgress.set(stats.id, new Date().getTime() + cd);
        setTimeout(() => {
            dungeonInProgress.delete(stats.id);
            // interaction.channel.send(`${interaction.user.toString()} is off </stampede:1111044852679979019> cooldown!`);
        }, cd);

        // Equip Rolled Char
        if (stats.cow_char !== -1) stats.battlechar = stats.cow_char ?? null;
        if (stats.battlechar === null) return interaction.followUp({ content: "You have not rolled a character yet!", ephemeral: true });

        // Fixed levels
        stats.level = cowSettings.level || 600;
        if (stats.class || stats.class === 0) {
            stats.dungeon_classlevels = Object.fromEntries(Array.from({ length: classes.length }, (_, i) => [i, classLevelToXP(cowSettings.clvl || 1200)]));
        } else stats.class = null;

        // Fixed item levels
        for (const item of userItems) {
            if (item.category === "weapon") {
                if (item.type === "shield") stats.equipment.shield = `${item.id}:706183309943767112`;
                else stats.equipment.weapon = `${item.id}:706183309943767112`;
            } else stats.equipment[item.type] = `${item.id}:706183309943767112`;
        };

        // Fixed refinements to base
        stats.char_ref = {};

        // User stats
        let myChar = characters[stats.battlechar];
        let myStats = await getDetailedStats(myChar.id, stats, stats.dungeon_classlevels);

        myStats.thumbnail = myChar.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[myChar.id], stats.char_skin[myChar.id]);

        let myStatsC = { ...myStats };
        let myClass = myStats.class !== -1 ? classes[myStats.class] : undefined;
        let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : undefined;
        let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : undefined;

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
        async function matchResult(wORl: "w" | "l") {
            if (resolved) return;
            resolved = true;

            // Clear restrictions
            dungeonInProgress.delete(stats.id);

            if (!stats.cow_char) return;

            const Embed = new EmbedBuilder()
                .setColor(embedColor) // Blue: 
                .setThumbnail(myStatsC.thumbnail)
                .setFooter({ text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });

            // Update cow stats
            let pointsEarned = 0;
            for (let i = 1; i <= matchStats.round + 1; i++) {
                pointsEarned += Math.floor(Math.sqrt(i));
            };

            // Update users table
            await updateUsers(interaction.user.id, {
                cow_participation: { type: "set", value: (stats.cow_participation ?? 0) + pointsEarned },
                cow_chars: { type: "append", value: [stats.cow_char] },
                cow_timer: { type: "set", value: (stats.cow_timer ?? 0) + Math.floor(Math.random() * rollingCowMobs.length) }
            });

            return Embed
                .setDescription(`### <a:RollingCowL:1241776030398677093> Rolling Cow <a:RollingCowR:1241776039093338132>\n<:stars_v2:917023655840591963> **${myChar.name}** lasted ${matchStats.round} rounds! <:stars_v2:917023655840591963>\n<a:arrow_green:916716811842621450> Earned **${pointsEarned}** points\n\n<:npbag:929428030554787892> Loot\n`)
                .setFooter({ text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
        };

        // Apply passives
        await eAbility.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
        if (skill && myChar.id !== 4767) await skill.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
        if (myAbility?.passive) await myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.weapon !== -1) await (items[myStats.weapon] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.shieldid) await (items[myStats.shieldid] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.helmet && (items[myStats.helmet] as armorInfo).setname === (items[myStats.cuirass] as armorInfo)?.setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.gloves] as armorInfo)?.setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.boots] as armorInfo)?.setname) await (items[myStats.boots] as armorInfo)?.buff?.(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        // Rings disabled in rolling cow
        // if (myStats.ring1) await (items[myStats.ring1] as ringInfo).getBuff(myStats.ring1info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        // if (myStats.ring2) await (items[myStats.ring2] as ringInfo).getBuff(myStats.ring2info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        // if (myStats.ring3) await (items[myStats.ring3] as ringInfo).getBuff(myStats.ring3info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        partyStatsC.forEach((e, i) => {
            if (e.id in abilities) {
                partyAbility[i] = _.cloneDeep(abilities[e.id]);
                partyAbility[i]?.party?.(partyStatsC[i], myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            } else {
                partyAbility[i] = undefined;
            };
        });

        let ATK_EMOJI = myStatsC.replaceButton?.atk?.emoji || '⚔️',
            DEF_EMOJI = myStatsC.replaceButton?.def?.emoji || '🛡️',
            ABILITY_EMOJI = myStatsC.replaceButton?.ability?.emoji || '✨',
            SKILL_EMOJI = myStatsC.replaceButton?.cskill?.emoji || '⚜️',
            SKIP_EMOJI = myStatsC.replaceButton?.skip?.emoji || '<:dodge_chance:1047269150948606063>';

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled((myAbility && "ability" in myAbility) ? false : true),
                new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled(myStats.class !== -1 ? false : true),
                new ButtonBuilder().setCustomId('SKIP').setEmoji(SKIP_EMOJI).setStyle(ButtonStyle.Secondary),
            );

        // If Enemy Died
        if (eStatsC.hp < 1) { // if (myStats.ep/eStats.ep >= 2) {
            const result = await matchResult("w");
            if (result) interaction.editReply({ embeds: [result] });;
            return;
        };

        const isCompactEmbed = !!author.schema.user_settings.compact_battle_embeds;
        const threatLevelWarning = isCompactEmbed ? "" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n`;

        async function newFight() {
            let timestart = new Date().getTime();
            let result = await new Promise<EmbedBuilder | undefined>((resolve) => {
                const Embed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setThumbnail(isCompactEmbed ? eStatsC.image : myStatsC.thumbnail)
                    .setFooter({ text: `Enemy EP: ${eStatsC.ep} | round 1 | time left: 120s` })
                    .setTitle(`Rolling Cow`)
                    .setDescription(`${threatLevelWarning}${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}\\💖${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStats.hp, eStatsC.sm / eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStats.hp}\\💖${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana)}\n${Avalon.padStats(myStatsC)}`)
                    .setImage(isCompactEmbed ? null : eStatsC.image);
                interaction.editReply({ embeds: [Embed], components: [row] }).then(msg => {

                    const atk = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ATK", componentType: ComponentType.Button, time: 120000 });
                    const def = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "DEF", componentType: ComponentType.Button, time: 120000 });
                    const ability = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ABILITY", componentType: ComponentType.Button, time: 120000 });
                    const cskill = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKILL", componentType: ComponentType.Button, time: 120000 });
                    const skip = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKIP", componentType: ComponentType.Button, time: 120000 });
                    matchStats.collector = { "atk": atk, "def": def, "ability": ability, "cskill": cskill, "skip": skip };

                    // Use passives
                    if (myChar.id !== 4767) curse.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                    let timeout: NodeJS.Timeout | undefined;
                    async function editEmbed() {
                        Embed.setDescription(`${threatLevelWarning}${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStatsC.maxhp, eStatsC.sm / eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-(parseInt(author.schema.user_settings.battle_log_length || "4") || 4)).join("")}`);
                        Embed.setFooter({ text: `Enemy EP: ${eStatsC.ep} | round ${matchStats.round} | time left: ${120 + Math.floor((timestart - new Date().getTime()) / 1000)}s` });
                        // await msg.edit({ embeds: [Embed] });

                        // Debounce
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                            msg.edit({ embeds: [Embed] });
                        }, 600);
                    };

                    function minionDefeated(side: "my" | "enemy") {
                        if (side === "my") {
                            myStatsC = { ...matchStats.myStatsCC } as DetailedStats;
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

                    function endMatch(wORl: "w" | "l") {
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
                        if (matchStats.ended) return;
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

                        Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
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
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                } else if ((eStatsC.forceUseSkillOnRound === matchStats.round && forcedSkillUse++ === 0) || ("forceUseSkillOnRound" in eStatsC ? false : (matchStats.blockAbilities-- < 0 && myChar.id !== 4767 && eAbility && eStatsC.sm >= eAbility.cost && Math.random() < 0.5))) {
                                    eAbility.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                } else {
                                    dealDamage(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, `⚔️ **${enemy.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
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
                        Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                        editEmbed();
                    };

                    atk.on('collect', async () => {
                        if (matchStats.turn === 1) {
                            matchStats.turn = 0;

                            // If attack was replaced
                            if (myStatsC.replaceButton.atk?.run) {
                                myStatsC.replaceButton.atk.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                                // Event Triggers
                                matchStats.trigger("ATK", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                if (matchStats.turn === 0) attack();
                            }

                            // Normal attack
                            else {
                                dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true, canTwinshot: true });

                                // Event Triggers
                                matchStats.trigger("ATK", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

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
                            if (myStatsC.replaceButton.def?.run) {
                                myStatsC.replaceButton.def.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                                // Event Triggers
                                matchStats.trigger("DEF", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
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

                                // Event Triggers
                                matchStats.trigger("DEF", myStatsC, eStatsC, buffs, eBuffs);

                                attack();
                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            }

                        } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                    });

                    ability.on('collect', async () => {
                        if (myStatsC.isAbilityBlocked) return interaction.followUp({ content: `You currently can't use your character ability`, ephemeral: true });

                        // If ability was replaced
                        if (myStatsC.replaceButton.ability?.run && matchStats.turn === 1) {
                            matchStats.turn = 0;
                            myStatsC.attackStreak = 0;
                            const response = await myStatsC.replaceButton.ability.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                            // Event Triggers
                            if (response === AbilityResponse.SUCCESS) {
                                matchStats.trigger("ABILITY", myStatsC, eStatsC, buffs, eBuffs);
                            };

                            editEmbed();
                            Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            attack();
                        }

                        else {
                            if (!myAbility?.ability) return interaction.followUp({ content: `You don't have an ability`, ephemeral: true });
                            if (myAbility.used < myAbility.usage) {
                                if (matchStats.turn === 1) {
                                    if (myAbility.cost > myStatsC.sm) interaction.followUp({ content: `You don't have enough mana! (**${myStatsC.sm}**/${myAbility.cost}${customEmojis.mana})`, ephemeral: true });
                                    else {
                                        matchStats.turn = 0;
                                        myStatsC.attackStreak = 0;
                                        myAbility.used++;
                                        const response = await myAbility.ability(myStatsC, myStats, eStatsC, eStats, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, msg);
                                        myStatsC.sm -= myAbility.cost;

                                        // Event Triggers
                                        if (response === AbilityResponse.SUCCESS) {
                                            matchStats.trigger("ABILITY", myStatsC, eStatsC, buffs, eBuffs);
                                        };

                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        attack();
                                    };
                                } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                            } else interaction.followUp({ content: `You can use **${myChar.name}**'s ability only ${myAbility.usage == 1 ? "once" : `${myAbility.usage} times`} per fight.`, ephemeral: true });
                        };
                    });

                    cskill.on('collect', async () => {

                        // If class active was replaced
                        if (myStatsC.replaceButton.cskill?.run && matchStats.turn === 1) {
                            matchStats.turn = 0;
                            myStatsC.attackStreak = 0;
                            const response = await myStatsC.replaceButton.cskill.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                            // Event Triggers
                            if (response === AbilityResponse.SUCCESS) {
                                matchStats.trigger("CSKILL", myStatsC, eStatsC, buffs, eBuffs);
                            };

                            editEmbed();
                            Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            if (matchStats.turn === 0) attack();
                        }

                        // Class active
                        else {
                            if (!skill) return interaction.followUp({ content: `You don't have a class skill`, ephemeral: true });
                            if (myChar.id === 4767) return interaction.followUp({ content: "Asta can't use any abilities", ephemeral: true });
                            if (skill.cost > myStatsC.sm) return interaction.followUp({ content: `You don't have enough mana! (**${myStatsC.sm}**/${skill.cost}${customEmojis.mana})`, ephemeral: true });
                            else {
                                if (matchStats.turn === 1) {
                                    myStatsC.sm -= skill.cost;
                                    myStatsC.attackStreak = 0;
                                    const response = await skill.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user, stats.chars);

                                    // Event Triggers
                                    if (response === AbilityResponse.SUCCESS) {
                                        matchStats.trigger("CSKILL", myStatsC, eStatsC, buffs, eBuffs);
                                    };

                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                            };
                        };
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
            if (result && interaction.channel?.isSendable()) interaction.channel.send({ embeds: [result] });
        };

        newFight();
    },
};

export default exportCommand;
