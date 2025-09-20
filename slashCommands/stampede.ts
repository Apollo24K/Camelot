import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle, ChatInputCommandInteraction } from "discord.js";
import { abilities, Ability } from "../Modules/abilities.js";
import { classes } from "../Modules/classes.js";
import { curses } from "../Modules/curses.js";
import { armorInfo, items, ringInfo, weaponInfo } from "../Modules/items.js";
import { stampedes } from "../Modules/stampedes.js";
import { skills, eventBossAbilities } from "../Modules/skills.js";
import charInfo, { characters } from "../Modules/chars.js";
import { getDetailedStats, customEmojis, dealDamage, generateCaptcha, isStampedeMonth } from "../Modules/functions.js";
import { requestVerification, dungeonTempBan, AbilityResponse } from "../Modules/components.js";
import Avalon from "../Modules/avalon.js";
import buffInfo from "../Modules/buffs.js";
import _ from 'lodash';
import { CompactUserSchema, DetailedStats, SlashCommand, StampedeSchema, UpdateUserOptions } from '../types.js';
import { getGuildSchema, getLatestStampede, getPartyMembers, getPartySchema, getUserSchema, getUserSchemas, updateStampedeParticipation, updateStampedes, updateUsers } from '../Modules/queries.js';
import { customHpBars } from '../Modules/customHpBars.js';

const dungeonInProgress = new Map();
const captchaCooldown = new Map();

const EMBED_COLOR = 0xff0000;

function participationPrize(rounds: number) {
    const prizePool = {
        deluxe: (rounds < 24) ? 0 : ((rounds < 120) ? 1 : 2),
        royal: 0,
        glorious: 0,
        ssticket: (rounds < 14) ? 0 : ((rounds < 80) ? 1 : 2),
        sticket: 0,
        aticket: 0,
        kernel: Math.min(Math.floor(rounds * 0.08), 16),
        gems: Math.min(Math.floor(rounds * 0.1), 30),
        coins: (rounds < 200) ? rounds * 50 : Math.min(10000 + ((rounds - 200) * 20), 25000),
    };

    // Royal
    if (rounds < 7) prizePool.royal = 0;
    else if (rounds < 15) prizePool.royal = 1;
    else if (rounds < 24) prizePool.royal = 2;
    else if (rounds < 46) prizePool.royal = 3;
    else if (rounds < 97) prizePool.royal = 4;
    else if (rounds < 192) prizePool.royal = 5;
    else prizePool.royal = 6;

    // Glorious
    if (rounds < 4) prizePool.glorious = 0;
    else if (rounds < 6) prizePool.glorious = 1;
    else if (rounds < 10) prizePool.glorious = 2;
    else if (rounds < 17) prizePool.glorious = 3;
    else if (rounds < 34) prizePool.glorious = 4;
    else if (rounds < 59) prizePool.glorious = 5;
    else if (rounds < 83) prizePool.glorious = 6;
    else if (rounds < 145) prizePool.glorious = 7;
    else if (rounds < 209) prizePool.glorious = 8;
    else prizePool.glorious = 9;

    // S Ticket
    if (rounds < 3) prizePool.sticket = 0;
    else if (rounds < 7) prizePool.sticket = 1;
    else if (rounds < 19) prizePool.sticket = 2;
    else if (rounds < 38) prizePool.sticket = 3;
    else if (rounds < 73) prizePool.sticket = 4;
    else if (rounds < 114) prizePool.sticket = 5;
    else if (rounds < 167) prizePool.sticket = 6;
    else if (rounds < 245) prizePool.sticket = 7;
    else prizePool.sticket = 8;

    // A Ticket
    if (rounds < 1) prizePool.aticket = 0;
    else if (rounds < 5) prizePool.aticket = 1;
    else if (rounds < 10) prizePool.aticket = 2;
    else if (rounds < 16) prizePool.aticket = 3;
    else if (rounds < 32) prizePool.aticket = 4;
    else if (rounds < 53) prizePool.aticket = 5;
    else if (rounds < 72) prizePool.aticket = 6;
    else if (rounds < 115) prizePool.aticket = 7;
    else if (rounds < 149) prizePool.aticket = 8;
    else if (rounds < 184) prizePool.aticket = 9;
    else if (rounds < 267) prizePool.aticket = 10;
    else prizePool.aticket = 11;

    return prizePool;
};

const prizePool = {
    deluxe: 52,
    royal: 244,
    glorious: 596,
    ssticket: 60,
    sticket: 228,
    aticket: 890,
    kernel: 1483,
    gems: 1092,
    coins: 3000000,
};

type PrizePool = typeof prizePool;

type PlayerRewardObject = {
    id: string;
    points: number;
    rounds: number;
} & Partial<PrizePool>;

let sentRewards = false;
async function endStampede() {

    // Make sure to only send rewards once
    if (sentRewards) return;
    sentRewards = true;
    setTimeout(() => {
        sentRewards = false;
    }, 30 * 60 * 1000);

    const stampede = await getLatestStampede();
    if (!stampede) return;

    const players: PlayerRewardObject[] = Object.entries(stampede.participation).map((e) => ({ id: e[0], points: e[1][0], rounds: e[1][1] }));
    const playersWithPrizes = distributePrizes(players, prizePool);

    for (const player of playersWithPrizes) {
        const paricipationRewards = participationPrize(stampede.participation[player.id]?.[1] ?? 0);
        const mail = { "type": "2,4,8,9", "rewards": `coins|${paricipationRewards.coins + (player.coins ?? 0)},gems|${paricipationRewards.gems + (player.gems ?? 0)},item|458|${paricipationRewards.deluxe + (player.deluxe ?? 0)},item|457|${paricipationRewards.royal + (player.royal ?? 0)},item|454|${paricipationRewards.glorious + (player.glorious ?? 0)},item|683|${paricipationRewards.kernel + (player.kernel ?? 0)},ss ticket|${paricipationRewards.ssticket + (player.ssticket ?? 0)},s ticket|${paricipationRewards.sticket + (player.sticket ?? 0)},a ticket|${paricipationRewards.aticket + (player.aticket ?? 0)}`, "message": "Stampede Rewards", "date": Date.now() };

        // Update users table
        await updateUsers(player.id, {
            mailbox: { type: "append", value: [mail] },
        });

        // // wait for 100ms
        // await new Promise(resolve => setTimeout(resolve, 100));
    };

    console.log("Rewards sent successfully!");
};

function distributePrizes(players: PlayerRewardObject[], prizePool: PrizePool) {
    // calculate total points
    let totalPoints = players.reduce((total, player) => total + player.points, 0);

    // distribute prizes
    let remainingPrizes = { ...prizePool };

    players.forEach(player => {
        (Object.keys(prizePool) as (keyof PrizePool)[]).forEach((e) => {
            const prize = Math.floor((player.points / totalPoints) * prizePool[e]);
            remainingPrizes[e] -= prize;
            player[e] = prize;
        });
    });

    // distribute remaining prizes randomly
    // for (let prize in remainingPrizes) {
    //     while (remainingPrizes[prize] > 0) {
    //         players[Math.floor(Math.random() * players.length)][prize]++;
    //         remainingPrizes[prize]--;
    //     };
    // };

    // distribute remaining prizes
    players.sort((a, b) => b.points - a.points);
    for (const prize in remainingPrizes) {
        while (remainingPrizes[prize as keyof PrizePool] > 0) {
            for (let i = 0; i < players.length; i++) {
                if (remainingPrizes[prize as keyof PrizePool] === 0) break;
                players[i][prize as keyof PlayerRewardObject]++;
                remainingPrizes[prize as keyof PrizePool]--;
            };
        };
    };

    return players;
};

function hoursToNextThird() {
    const now = new Date();
    if (now.getDate() >= 3) return "over";

    // Create a new date object for the next 3rd of the month
    const nextThird = new Date(now.getFullYear(), now.getMonth(), 3);

    // Calculate time left in hours and minutes
    const diffHours = Math.floor((nextThird.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffHours === 0) return `${Math.floor(((nextThird.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60))}min left`;
    return `${diffHours}h left`;
};

function cdLeft(id: string, stamina: number = 60) {
    return dungeonInProgress.has(id) ? `\`${Math.floor((dungeonInProgress.get(id) - Date.now()) / 60000) > 0 ? `${Math.floor((dungeonInProgress.get(id) - new Date().getTime()) / 60000)}min ` : ""}${Math.floor((dungeonInProgress.get(id) - Date.now()) / 1000) % 60}s left\`` : `\`ready (${stamina}/60 stamina)\``;
};

const monsterRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('2')
            .setLabel("Monster")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('3')
            .setLabel("General")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('4')
            .setLabel("Boss")
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('5')
            .setLabel("Boss (Phase 2)")
            .setStyle(ButtonStyle.Danger),
    );

const isStampedeDisabled = (stampede: StampedeSchema, isTestRun: boolean) => {
    if (isTestRun) return false;
    return (stampede.bosshp < 1 || new Date().getDate() > 7 || !isStampedeMonth());
};

function bossSelection(interaction: ChatInputCommandInteraction, stampede: StampedeSchema, myChar: charInfo, partyQuery: CompactUserSchema[], stats: CompactUserSchema): Promise<number> {
    return new Promise((resolve) => {
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('0')
                    .setLabel("I'm ready, let me fight!")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(isStampedeDisabled(stampede, false)),
                new ButtonBuilder()
                    .setCustomId('test')
                    .setLabel("Let's try a test run first!")
                    .setStyle(ButtonStyle.Primary),
            );

        const paricipationRewards = participationPrize(stampede.participation[interaction.user.id]?.[1] ?? 0);

        // Clear cd if bugged
        if (dungeonInProgress.get(interaction.user.id) < Date.now()) {
            dungeonInProgress.delete(interaction.user.id);
        };

        const Embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle(stampedes[stampede.type].title)
            .setThumbnail("https://i.imgur.com/ZUdnLZO.png") // https://i.imgur.com/Au6LNIx.jpg https://i.imgur.com/ZUdnLZO.png
            // .setDescription(`**Goblin King**: \`${stampede.bosshp < 0 ? 0 : stampede.bosshp}/${stampede.bosshpmax}\`\\💖\n**Goblin Generals**: \`${stampede.generalsleft}/${stampede.generalstotal}\` ➜ \`${stampede.generalhp < 0 ? 0 : stampede.generalhp}/${stampede.generalhpmax}\`\\💖\n**Goblins**: \`${stampede.monstersleft}/${stampede.monsterstotal}\`\n\n**Damage dealt**: \`${JSON.parse(stampede.participation)[interaction.user.id]?.[0] || 0}\`\n**Total damage**: \`${Object.values(JSON.parse(stampede.participation)).reduce((acc, e) => acc+e[0], 0)}\`\n\n**Prize Pool**\n<:deluxe_chest:1069301259603026061>x${prizePool.deluxe}, <:royal_chest:1069301128711376976>x${prizePool.royal}, <:glorious_chest:1069076067081539726>x${prizePool.glorious}\n<:ss_ticket:927503239396622336>x${prizePool.ssticket}, <:s_ticket:927642487705722890>x${prizePool.sticket}, <:a_ticket:929420377946472508>x${prizePool.aticket}\n<:genesis_gems:1034179687720681492>x${prizePool.gems}, <:coins:1030580480782893197>x${Math.round(prizePool.coins/1000000)}mil\n\n**Party**\n${(abilities?.[myChar.id]?.party) ? "✨ " : "<:blank:917804200363171860> "}__${myChar.name}__ ${cdLeft(interaction.user.id)}${partyQuery.map((e) => `\n${(abilities?.[e.stampedechar]?.party) ? "✨ " : "<:blank:917804200363171860> "}${characters[e.stampedechar].name} ${cdLeft(e.id)}`)}`)
            .setDescription(`**${stampedes[stampede.type].boss.left}**: \`${stampede.bosshp < 0 ? 0 : stampede.bosshp}/${stampede.bosshpmax}\`\\💖\n**${stampedes[stampede.type].general.left}**: \`${stampede.generalsleft}/${stampede.generalstotal}\` ➜ \`${stampede.generalhp < 0 ? 0 : stampede.generalhp}/${stampede.generalhpmax}\`\\💖\n**${stampedes[stampede.type].monster.left}**: \`${stampede.monsterstotal}\` (${hoursToNextThird()})\n\n**Your damage**: \`${stampede.participation[interaction.user.id]?.[0] || 0}\`\n**Global damage**: \`${Object.values(stampede.participation).reduce((acc, e) => acc + e[0], 0)}\``)
            .addFields(
                { name: "**Global Prize Pool**", value: `<:deluxe_chest:1069301259603026061>x${prizePool.deluxe}, <:royal_chest:1069301128711376976>x${prizePool.royal}, <:glorious_chest:1069076067081539726>x${prizePool.glorious}\n<:ss_ticket:927503239396622336>x${prizePool.ssticket}, <:s_ticket:927642487705722890>x${prizePool.sticket}, <:a_ticket:929420377946472508>x${prizePool.aticket}\n<:starlight_kernel:1106121205515288659>x${prizePool.kernel}, <:genesis_gems:1034179687720681492>x${prizePool.gems}, <:coins:1030580480782893197>x${Math.round(prizePool.coins / 1000000)}mil`, inline: true },
                { name: `**Participation Rewards** (${stampede.participation[interaction.user.id]?.[1] ?? 0})`, value: `<:deluxe_chest:1069301259603026061>x${paricipationRewards.deluxe}, <:royal_chest:1069301128711376976>x${paricipationRewards.royal}, <:glorious_chest:1069076067081539726>x${paricipationRewards.glorious}\n<:ss_ticket:927503239396622336>x${paricipationRewards.ssticket}, <:s_ticket:927642487705722890>x${paricipationRewards.sticket}, <:a_ticket:929420377946472508>x${paricipationRewards.aticket}\n<:starlight_kernel:1106121205515288659>x${paricipationRewards.kernel}, <:genesis_gems:1034179687720681492>x${paricipationRewards.gems}, <:coins:1030580480782893197>${paricipationRewards.coins}`, inline: true },
                { name: "\u200B", value: "_ _", inline: true },
                { name: "**Party**", value: `${(abilities?.[myChar.id]?.party) ? "✨ " : "<:blank:917804200363171860> "}__${myChar.name}__${partyQuery.map((e) => `\n${(abilities?.[e.stampedechar as number]?.party) ? "✨ " : "<:blank:917804200363171860> "}${characters[e.stampedechar as number].name}`).join("")}`, inline: true },
                { name: "\u200B", value: `${cdLeft(interaction.user.id, 60 - stats.stampedeenergy)}${partyQuery.map((e) => `\n${cdLeft(e.id, 60 - e.stampedeenergy)}`).join("")}`, inline: true },
                { name: "\u200B", value: "_ _", inline: true },
            );
        interaction.editReply({ embeds: [Embed], components: [row] }).then((msg) => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

            collector.on('collect', r => {
                if (r.customId === "test") {
                    interaction.followUp({ content: "Please select an enemy", components: [monsterRow], ephemeral: true }).then((ms) => {
                        const selectionCollector = ms.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 30000 });

                        selectionCollector.on('collect', r => {
                            resolve(parseInt(r.customId));
                            selectionCollector.stop(); collector.stop();
                        });

                        selectionCollector.on('end', () => {
                            resolve(0);
                            selectionCollector.stop(); collector.stop();
                        });

                    });
                } else {
                    if (dungeonInProgress.has(interaction.user.id)) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You can play again in${Math.floor((dungeonInProgress.get(interaction.user.id) - new Date().getTime()) / 60000) > 0 ? ` **${Math.floor((dungeonInProgress.get(interaction.user.id) - new Date().getTime()) / 60000)}**min` : ""} **${Math.floor((dungeonInProgress.get(interaction.user.id) - new Date().getTime()) / 1000) % 60}**s`);
                        return;
                    };

                    resolve(1);
                    collector.stop();
                };
            });

            collector.on('end', () => {
                resolve(0);
                collector.stop();
            });

        });

    });
};

function adjustDEF(myStatsC: DetailedStats) { // {274: x2 atk -> x1.5 dmg, 340: x2 atk -> x1.4 dmg, 395: x2 atk -> x1.32 dmg}
    return Math.max(myStatsC.atk, myStatsC.md) > 128 ? Math.floor(((Math.log(Math.max(myStatsC.atk, myStatsC.md)) / Math.log(2)) - 7) * 340) : 0;
};

const exportCommand: SlashCommand = {
    name: 'stampede',
    async execute({ interaction, author }) {

        await interaction.deferReply().catch((err) => {
            return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
        });

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        // Skip Overview
        const skipOverview = interaction.options.getBoolean('skip-overview') ?? false;

        const stats = author.schema;
        if (stats.stampedechar === null || !stats.chars.includes(stats.stampedechar)) return interaction.editReply("You have to choose a battle character first. Use `/select <char name> mode:stampede` to choose one.");

        const guild = stats.guild ? await getGuildSchema(stats.guild) : undefined;
        const stampede = await getLatestStampede();
        if (!stampede) return interaction.editReply("There is no active stampede right now. Please try again later!");

        // User stats
        let myChar = characters[stats.stampedechar];
        let myStats = await getDetailedStats(myChar.id, stats, stats.dungeon_classlevels);
        // myStats.damageFormula = "log_scale_1.4";

        myStats.thumbnail = myChar.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[myChar.id], stats.char_skin[myChar.id]);

        let myStatsC = { ...myStats };
        let myClass = myStats.class !== -1 ? classes[myStats.class] : undefined;
        let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : undefined;
        let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : undefined;

        // Banned builds
        // if (myStats.class === 31 && stats.stampedechar === 5549) return interaction.editReply("The <:Rogue:964837711468969984> **Rogue** + **Yue** combination was banned from this stampede, please try something else.");


        // Party member stats
        const partyQuery = stats.party ? await getPartyMembers(stats.party, { excludeIds: [interaction.user.id], hasStampedeChar: true }) : [];
        const partyChars = partyQuery.map((e) => characters[e.stampedechar as number]);
        const partySchema = await getUserSchemas(partyQuery.map((e) => e.id));

        let partyStats: DetailedStats[] = [];
        for (const ps of partySchema) {
            if (ps.stampedechar !== null)
                partyStats.push(await getDetailedStats(ps.stampedechar, ps, ps.dungeon_classlevels));
        };
        let partyStatsC = _.cloneDeep(partyStats);
        // let partyClass = partyStats.map((e) => e.class !== -1 ? classes[e.class] : false);
        // let partySkill = partyStats.map((e) => e.class !== -1 ? _.cloneDeep(skills[e.class]) : false);
        const partyAbility: (Ability | undefined)[] = []; // partyChars.map((e) => e.id in abilities ? _.cloneDeep(abilities[e.id]) : undefined).filter((e) => e !== undefined);

        // Menu
        const boss = skipOverview ? 1 : await bossSelection(interaction, stampede, myChar, partySchema, stats);
        if (boss === 0) return;

        // Check if stampede is disabled
        if (isStampedeDisabled(stampede, boss > 1)) return interaction.editReply("Stampede is currently unavailable. Please try again later!");

        // Check if user is on cooldown
        if (dungeonInProgress.has(interaction.user.id)) {
            if (interaction.channel?.isSendable()) interaction.channel.send(`You can play again in${Math.floor((dungeonInProgress.get(interaction.user.id) - new Date().getTime()) / 60000) > 0 ? ` **${Math.floor((dungeonInProgress.get(interaction.user.id) - new Date().getTime()) / 60000)}**min` : ""} **${Math.floor((dungeonInProgress.get(interaction.user.id) - new Date().getTime()) / 1000) % 60}**s`);
            return;
        };

        // Enemy Stats
        let enemyType: "monster" | "general" | "boss", curseId: number;
        if (boss === 1) {
            if (new Date().getDate() < 3) { // if (stampede.monstersleft > 0) {
                enemyType = "monster";
                curseId = curses.filter((e) => e.tier === 0 && e.id !== 13).sort((a, b) => Math.random() - 0.5)[0].id;
            } else if (stampede.generalsleft > 0) {
                enemyType = "general";
                curseId = 11;
            } else {
                enemyType = "boss";
                curseId = 9;
            };
        } else { // Test Run
            if (boss === 2) {
                enemyType = "monster";
                curseId = curses.filter((e) => e.tier === 0 && e.id !== 13).sort((a, b) => Math.random() - 0.5)[0].id;
            } else if (boss === 3) {
                enemyType = "general";
                curseId = 11;
            } else {
                enemyType = "boss";
                curseId = 9;
            };
        };

        if (boss === 1) {
            // Captcha
            if (!requestVerification.has(interaction.user.id) && Math.random() < 0.03 && !captchaCooldown.has(interaction.user.id)) requestVerification.set(interaction.user.id, { repeats: 0 });
            if (requestVerification.has(interaction.user.id)) {
                const captcha = generateCaptcha();
                clearTimeout(requestVerification.get(interaction.user.id).timeout);
                requestVerification.set(interaction.user.id, { text: captcha.text, repeats: requestVerification.get(interaction.user.id).repeats + 1, timeout: setTimeout(() => requestVerification.delete(interaction.user.id), 60 * 60 * 1000) });

                // Temp ban
                if (requestVerification.get(interaction.user.id).repeats > 4) {
                    clearTimeout(dungeonTempBan.get(interaction.user.id)?.timeout);
                    dungeonTempBan.set(interaction.user.id, { ends: (dungeonTempBan.get(interaction.user.id)?.ends || Date.now()) + (20 * 60 * 1000), timeout: setTimeout(() => dungeonTempBan.delete(interaction.user.id), ((dungeonTempBan.get(interaction.user.id)?.ends || Date.now()) + (20 * 60 * 1000)) - Date.now()) });
                };

                const now = new Date();
                // Update users table
                await updateUsers(interaction.user.id, {
                    stampede_responsetime: { type: "append", value: [now, now] }
                });

                // Captcha cooldown
                captchaCooldown.set(interaction.user.id, Date.now());
                setTimeout(() => captchaCooldown.delete(interaction.user.id), 10 * 60 * 1000);

                return interaction.editReply({ content: `${dungeonTempBan.has(interaction.user.id) ? `You have failed to enter the captcha many times in a row.\nYou have been temporarily banned from using \`/stampede\` for the next **${Math.ceil((dungeonTempBan.get(interaction.user.id)?.ends - Date.now()) / (60 * 1000))}** min\nYou can check how much time is left with </cd:1010317417840390158>\n` : ""}Use </captcha:1114616338581823568> to enter the code`, embeds: [], components: [], files: [captcha.attachement] });
            };

            // Set up restrictions
            if (dungeonTempBan.has(interaction.user.id)) return interaction.editReply(`You have failed to enter the captcha many times in a row.\nYou have been temporarily banned from using \`/stampede\` for the next **${Math.ceil((dungeonTempBan.get(interaction.user.id)?.ends - Date.now()) / (60 * 1000))}** min\nYou can check how much time is left with </cd:1010317417840390158>`);

            const energyCap = 60;
            const energyLeft = energyCap - stats.stampedeenergy;
            const energyCost = enemyType === "monster" ? 1 : 5;
            if (energyLeft < energyCost) {
                if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough stamina, please wait for it to refill.`);
                return;
            };
            if (dungeonInProgress.has(stats.id)) {
                if (interaction.channel?.isSendable()) interaction.channel.send(`Please finish your previous fight first or wait 2 minutes.`);
                return;
            };
            dungeonInProgress.set(stats.id, Date.now() + (2 * 60 * 1000));

            // Update users table
            await updateUsers(interaction.user.id, {
                stampedeenergy: { type: "increment", value: energyCost },
                stampede_responsetime: { type: "append", value: [new Date()] }
            });

            // const cd = enemyType === "monster" ? 3 * 60 * 1000 : 20 * 60 * 1000;
            // if (dungeonInProgress.has(stats.id)) return interaction.channel.send(`You can play again in${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000) > 0 ? ` **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000)}**min` : ""} **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 1000) % 60}**s`);
            // dungeonInProgress.set(stats.id, new Date().getTime() + cd);
            // setTimeout(() => {
            //     dungeonInProgress.delete(stats.id);
            //     // if (enemyType !== "monster") 
            //     interaction.channel.send(`${interaction.user.toString()} is off </stampede:1111044852679979019> cooldown!`);
            // }, cd);
        };

        const enemy = stampedes[stampede.type][enemyType].info;
        const curse = curses[curseId];
        const eAbility = enemy.boss ? eventBossAbilities[enemy.id] : false;
        // let eImage = enemy.image[0];

        let eStats = {
            "name": enemy.name,
            "hp": Math.floor(750 + (Math.random() * 4250)),
            "maxhp": 1200,
            "atk": Math.floor(150 + (Math.random() * 250)),
            "def": 120,
            "ep": 0,
            "md": 200,
            "mr": 120,
            "cr": 0.18,
            "cd": 1.25,
            "td": 30,
            "br": 0.12,
            "dodge": 0.1,
            "mana": 120,
            "mg": 15,
            "sm": 20,
            "rev": 0,
            "revhp": 0.5,
            "shield": 0,
            "mdChance": 0,
            "removeDefCap": true,
        } as any;
        eStats.maxhp = eStats.hp;

        // Set Stats
        if (enemyType === "boss") {
            eStats.hp = (boss === 1) ? stampede.bosshp : (boss === 5 ? Math.floor(stampede.bosshpmax * 0.4) : stampede.bosshpmax);
            eStats.maxhp = stampede.bosshpmax;
            eStats.atk = Math.floor(myStatsC.hp * 0.18);
            eStats.md = Math.floor(myStatsC.hp * 0.18);
            eStats.def = 320;
            eStats.mr = 320;
            eStats.cr = 0.33;
            eStats.cd = 1.75;
            eStats.mdChance = 0.5;
            eStats.mg = 16;
            eStats.mana = 200;
        } else if (enemyType === "general") {
            eStats.hp = (boss === 1) ? stampede.generalhp : stampede.generalhpmax;
            eStats.maxhp = stampede.generalhpmax;
            eStats.shield = Math.floor(200 + Math.random() * 1000);
            eStats.atk = Math.floor(myStatsC.hp * 0.14);
            eStats.md = Math.floor(myStatsC.hp * 0.14);
            eStats.def = 160;
            eStats.mr = 160;
            eStats.cr = 0.27;
            eStats.cd = 1.5;
            eStats.mdChance = 0.5;
            eStats.mana = 160;
        };
        eStats.ep = Math.floor(((1 / (1 - eStats.dodge)) * (eStats.hp / Math.pow(0.99895, Math.max(eStats.def, eStats.mr))) / (200 / (Math.max(eStats.atk, eStats.md) * (1 + ((eStats.cr > 1 ? 1 : (eStats.cr < 0) ? 0 : eStats.cr) * (eStats.cd - 1)))))) * 100) / 100;

        eStats.image = enemy.image[Math.floor(Math.random() * enemy.image.length)]; // eImage;
        let eStatsC = { ...eStats };

        // Some match settings
        const difficulty = Avalon.getDifficulty(myStats.ep / eStats.ep);
        const aDelay = stats.premium ? stats.animationdelay : 1200;

        // Random HP Bar
        if (stats.user_settings.random_hp_bar && stats.hpbars.length > 0) {
            stats.hpbar = [null, ...stats.hpbars][Math.floor(Math.random() * (stats.hpbars.length + 1))];
        };
        const embedColor = stats.hpbar === null ? EMBED_COLOR : customHpBars[stats.hpbar].color;

        let buffs = Avalon.getBuffs();
        let eBuffs = Avalon.getBuffs();

        // ATK buffs
        eBuffs.atk.push(new buffInfo("*", 1, 9999, 1.02, "*"));
        eBuffs.md.push(new buffInfo("*", 1, 9999, 1.02, "*"));

        let matchResultsSent = false;
        async function matchResult(r: "w" | "l" | "t") {
            if (matchResultsSent) return;
            matchResultsSent = true;

            if (!stampede) return;

            const stats = await getUserSchema(interaction.user.id);
            if (!stats) return;

            // Clear restrictions
            dungeonInProgress.delete(stats.id);

            // Test Run
            if (boss > 1) {
                const damageDealt = enemyType === "monster" ? eStatsC.maxhp - eStatsC.hp : eStats.hp - eStatsC.hp;

                // Log damage
                if (damageDealt > (enemyType === "general" ? 1_200_000 : 800_000)) {
                    const chnl = interaction.client.channels.cache.find(channel => channel.id === "1147984366211973280");
                    const Embed = new EmbedBuilder()
                        .setColor(0xbbffff)
                        .setThumbnail(myChar.image)
                        .setDescription(`**Character**: ${myChar.name} Lvl. ${myStats.lvl}\n**Class**: ${myClass ? `${myClass.name} ${myClass.emblem} Lvl. ${myStats.clvl}` : "`none`"}\n**Equipment**: ${myStats.weaponicon}${stats.premium > 3 && myStats.shieldicon ? myStats.shieldicon : ""} ${myStats.helmeticon || "<:helmet_empty:1034499888878198885>"}${myStats.cuirassicon || "<:cuirass_empty:1034499890165858305>"}${myStats.glovesicon || "<:gloves_empty:1034499892409794570>"}${myStats.bootsicon || "<:boots_empty:1034499893919764480>"}\n**Damage**: ${damageDealt} to ${enemyType}${boss === 5 ? " (Phase 2)" : ""}\n\n**Action Sequence**\n> ${matchStats.actionSequence.join(", ")}`)
                        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
                    if (chnl?.isSendable()) chnl.send({ embeds: [Embed] });
                };

                const Embed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setThumbnail(myStatsC.thumbnail)
                    .setTitle(stampedes[stampede.type].title)
                    .setDescription(`<:stars_v2:917023655840591963> **${myChar.name}** ${r === "w" ? "won" : "lost"} <:stars_v2:917023655840591963>\n<a:arrow_green:916716811842621450> dealt **${damageDealt}** damage\n<a:arrow_orange:916716747623641210> Class XP: **--** (Boost: x--)\n\n<:npbag:929428030554787892> Loot\n--<:coins:872926669055356939>`)
                    .setFooter({ text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
                return Embed;
            };

            // Class Level
            let cxpmsg = "You don't have a class";
            let cxp = 0;
            if (myClass) {
                let boost = 1 + matchStats.xpboost;
                stats.dungeon_classes.map((e) => classes[e].tier).forEach((e) => {
                    switch (e) {
                        case 2: boost += 0.05; break;
                        case 3: boost += 0.15; break;
                        case 4: boost += 0.25; break;
                        default: false; break;
                    };
                });

                // Premium Buff
                switch (stats.premium) {
                    case 3: boost += 0.2; break;
                    case 4: boost += 0.3; break;
                    case 5: boost += 0.5; break;
                    case 6: boost += 0.75; break;
                    case 7: boost += 1; break;
                    default: false; break;
                };

                // Guild Buff
                if (guild) boost += (0.2 * guild.xpbuff);

                boost = Math.round(boost * 100) / 100;
                cxp = Math.floor((120 + (Math.random() * 120)) * boost);
                cxpmsg = `Class XP: **${cxp}** (Boost: x${boost})`;
                // if (myClass.id in stats.dungeon_classlevels) stats.dungeon_classlevels[myClass.id] += cxp;
                // else stats.dungeon_classlevels[myClass.id] = cxp;
            };

            // Coins
            let loot = Math.floor(((Math.floor(350 + (Math.random() * 150)) / (enemyType === "monster" ? 20 : 5)) * (matchStats.lootm + (guild?.lootbuff ? 0.2 * guild.lootbuff : 0))) + matchStats.loot);
            if (loot > 10000) loot = 10000;

            // Kernel
            const kernelDrop = (Math.random() < (enemyType === "monster" ? 0.01 : 0.1));
            stats.items[683] = stats.items[683] + 1 || 1;

            // Update users table
            const userUpdates: UpdateUserOptions = {
                coins: { type: "increment", value: loot },
            };
            if (kernelDrop) userUpdates.items = { type: "merge_json", value: { 683: 1 } };
            if (myClass) userUpdates.dungeon_classlevels = { type: "merge_json", value: { [myClass.id]: cxp } };
            await updateUsers(interaction.user.id, userUpdates);


            // Damage dealt
            const damageDealt = enemyType === "monster" ? eStatsC.maxhp - eStatsC.hp : eStats.hp - eStatsC.hp;
            const roundWeight = enemyType === "monster" ? 1 : 5;

            // Party Participation
            await updateStampedeParticipation(stampede.rowid, stats.party, interaction.user.id, damageDealt, roundWeight);

            if (enemyType === "monster") {
                if (r === "w") {
                    await updateStampedes(stampede.rowid, {
                        monsterstotal: { type: "increment", value: 1 },
                    });
                };
            } else if (enemyType === "general") {
                await updateStampedes(stampede.rowid, {
                    generalhp: { type: "increment", value: -damageDealt },
                });

                const tempStampede = await getLatestStampede();
                if (tempStampede && tempStampede.generalhp < 1) {
                    if (tempStampede.generalsleft > 1) {
                        await updateStampedes(stampede.rowid, {
                            generalsleft: { type: "increment", value: -1 },
                            generalhp: { type: "set", value: tempStampede.generalhpmax },
                        });
                    } else {
                        await updateStampedes(stampede.rowid, {
                            generalsleft: { type: "set", value: 0 },
                            generalhp: { type: "set", value: 0 },
                        });
                    };
                };
            } else {
                await updateStampedes(stampede.rowid, {
                    bosshp: { type: "increment", value: -damageDealt },
                });

                const tempStampede = await getLatestStampede();
                if (tempStampede && tempStampede.bosshp < 1) endStampede(); // Finish Stampede!
            };

            const Embed = new EmbedBuilder()
                .setColor(embedColor)
                .setThumbnail(myStatsC.thumbnail)
                .setTitle(stampedes[stampede.type].title)
                .setDescription(`<:stars_v2:917023655840591963> **${myChar.name}** ${r === "w" ? "won" : "lost"} <:stars_v2:917023655840591963>\n<a:arrow_green:916716811842621450> dealt **${damageDealt}** damage\n<a:arrow_orange:916716747623641210> ${cxpmsg}\n\n<:npbag:929428030554787892> Loot\n${loot}<:coins:872926669055356939>${kernelDrop ? ", <:starlight_kernel:1106121205515288659>x1" : ""}`)
                .setFooter({ text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
            return Embed;
        };

        let matchStats = Avalon.getMatchStats(interaction, { allowExecution: false });
        let notice = ["", "", "", ""];
        matchStats.actionSequence = [];
        matchStats.partyChars = partyChars;
        matchStats.partyStats = partyStatsC;

        // Adjust DEF
        eStatsC.def += adjustDEF(myStatsC);
        eStatsC.mr += adjustDEF(myStatsC);

        // Apply passives
        if (eAbility) await eAbility.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
        if (skill && myChar.id !== 4767) await skill.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
        if (myAbility?.passive) await myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.weapon !== -1) await (items[myStats.weapon] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.shieldid) await (items[myStats.shieldid] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.helmet && (items[myStats.helmet] as armorInfo).setname === (items[myStats.cuirass] as armorInfo)?.setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.gloves] as armorInfo)?.setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.boots] as armorInfo)?.setname) await (items[myStats.boots] as armorInfo)?.buff?.(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        if (myStats.ring1) await (items[myStats.ring1] as ringInfo).getBuff(myStats.ring1info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.ring2) await (items[myStats.ring2] as ringInfo).getBuff(myStats.ring2info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.ring3) await (items[myStats.ring3] as ringInfo).getBuff(myStats.ring3info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        partyStatsC.forEach((e, i) => {
            if (e.id in abilities) {
                partyAbility[i] = _.cloneDeep(abilities[e.id]);
                partyAbility[i]?.party?.(partyStatsC[i], myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            } else {
                partyAbility[i] = undefined;
            };
        });

        const ATK_EMOJI = myStatsC.replaceButton?.atk?.emoji || '⚔️',
            DEF_EMOJI = myStatsC.replaceButton?.def?.emoji || '🛡️',
            ABILITY_EMOJI = myStatsC.replaceButton?.ability?.emoji || '✨',
            SKILL_EMOJI = myStatsC.replaceButton?.cskill?.emoji || '⚜️';

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle(ButtonStyle.Danger).setDisabled((myAbility && "ability" in myAbility) ? false : true),
                new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle(ButtonStyle.Danger).setDisabled(myStats.class !== -1 ? false : true),
            );

        const isCompactEmbed = !!author.schema.user_settings.compact_battle_embeds;
        const threatLevelWarning = isCompactEmbed ? "" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n`;

        async function newFight() {
            if (!stampede) return;

            const timestart = new Date().getTime();
            const result = await new Promise<EmbedBuilder | undefined>((resolve, rejects) => {
                const Embed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setThumbnail(isCompactEmbed ? eStatsC.image : myStatsC.thumbnail)
                    .setFooter({ text: `Enemy EP: ${eStatsC.ep} | round 1 | time left: 120s` })
                    .setTitle(stampedes[stampede.type].title)
                    .setDescription(`${threatLevelWarning}${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.maxhp}\\💖${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStats.maxhp, eStatsC.sm / eStatsC.mana, stats.hpbar)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStats.hp}\\💖${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana, stats.hpbar)}\n${Avalon.padStats(myStatsC)}`)
                    .setImage(isCompactEmbed ? null : eStatsC.image);
                interaction.editReply({ embeds: [Embed], components: [row] }).then(msg => {

                    const atk = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ATK", componentType: ComponentType.Button, time: 120000 });
                    const def = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "DEF", componentType: ComponentType.Button, time: 120000 });
                    const ability = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ABILITY", componentType: ComponentType.Button, time: 120000 });
                    const cskill = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKILL", componentType: ComponentType.Button, time: 120000 });
                    matchStats.collector = { "atk": atk, "def": def, "ability": ability, "cskill": cskill };
                    matchStats.message = msg;

                    // Use passives
                    if (myChar.id !== 4767) curse.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                    // Adjust DEF
                    eStatsC.def = eStats.def, eStatsC.mr = eStats.mr;
                    eStatsC.def += adjustDEF(myStatsC);
                    eStatsC.mr += adjustDEF(myStatsC);

                    let timeout: NodeJS.Timeout | undefined;
                    async function editEmbed() {
                        Embed.setDescription(`${threatLevelWarning}${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStatsC.maxhp, eStatsC.sm / eStatsC.mana, stats.hpbar)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana, stats.hpbar)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-(parseInt(author.schema.user_settings.battle_log_length || "4") || 4)).join("")}`);
                        Embed.setFooter({ text: `Enemy EP: ${eStatsC.ep} | round ${matchStats.round} | time left: ${120 + Math.floor((timestart - new Date().getTime()) / 1000)}s` });
                        if (eStats.image !== eStatsC.image) Embed.setImage(eStatsC.image);
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

                        atk.stop(), def.stop(), ability?.stop(), cskill?.stop();
                        if (wORl === "l") notice.push(`\n💀 **${myChar.name}** lost`);
                        else notice.push(`\n🎉 **${myChar.name}** won`);
                        editEmbed();
                        matchStats.turn = 1;
                        resolve(matchResult(wORl));
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

                        // Remove HP debuffs from boss
                        eBuffs.hp = eBuffs.hp.filter((buff) => (buff.type === "*" && buff.val > 1) || (buff.type === "+" && buff.val > 0));

                        // Increase ATK
                        eBuffs.atk.push(new buffInfo("+", Math.floor(eStats.atk * matchStats.round * 0.01), 9999));
                        eBuffs.md.push(new buffInfo("+", Math.floor(eStats.md * matchStats.round * 0.01), 9999));

                        // Apply Buffs
                        if (matchStats.currentCharacter === 0) Avalon.applyBuffs(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice);
                        if (matchStats.currentOpponent === 0) Avalon.applyBuffs(eStatsC, eStatsC, eBuffs, buffs, matchStats, notice);

                        // Adjust Boss DEF
                        eStatsC.def += adjustDEF(myStatsC);
                        eStatsC.mr += adjustDEF(myStatsC);

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

                        Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                    };

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
                                } else if (matchStats.blockAbilities-- < 0 && myChar.id !== 4767 && eAbility && eStatsC.sm >= eAbility.cost && Math.random() < 0.5) {
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

                    atk.on('collect', async r => {
                        if (matchStats.turn === 1) {
                            matchStats.turn = 0;
                            matchStats.actionSequence.push("⚔️");

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
                                dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });

                                // Event Triggers
                                matchStats.trigger("ATK", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                if (matchStats.twinshot > Math.random()) setTimeout(() => {
                                    dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                }, aDelay);

                                else attack();
                            }

                        } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                    });

                    def.on('collect', async r => {
                        if (matchStats.turn === 1) {
                            matchStats.turn = 0;
                            myStatsC.attackStreak = 0;
                            matchStats.actionSequence.push("🛡️");

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
                                    // notice.push(`\n🛡️ **${myChar.name}** can't increase DEF/MR anymore`);
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

                    ability.on('collect', async r => {
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
                            if (myStatsC.isAbilityBlocked) return interaction.followUp({ content: `You currently can't use your character ability`, ephemeral: true });
                            if ((enemyType === "boss" || enemyType === "general") && (myChar.id === 238 || myChar.id === 17583)) return interaction.followUp({ content: "Can't eat your current opponent", ephemeral: true });
                            if (myAbility.used < myAbility.usage) {
                                if (matchStats.turn === 1) {
                                    if (myAbility.cost > myStatsC.sm) interaction.followUp({ content: `You don't have enough mana! (**${myStatsC.sm}**/${myAbility.cost}${customEmojis.mana})`, ephemeral: true });
                                    else {
                                        matchStats.actionSequence.push("✨");
                                        matchStats.turn = 0;
                                        myStatsC.attackStreak = 0;
                                        myAbility.used++;
                                        const response = await myAbility.ability(myStatsC, myStats, eStatsC, eStats, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, msg, partyChars);
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

                    cskill.on('collect', async r => {

                        // If class active was replaced
                        if (myStatsC.replaceButton.cskill?.run && matchStats.turn === 1) {
                            matchStats.turn = 0;
                            myStatsC.attackStreak = 0;
                            matchStats.actionSequence.push("⚜️");
                            const response = await myStatsC.replaceButton.cskill.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                            // Event Triggers
                            if (response === AbilityResponse.SUCCESS) {
                                matchStats.trigger("CSKILL", myStatsC, eStatsC, buffs, eBuffs);
                            };

                            editEmbed();
                            Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            attack();
                        }

                        // Class active
                        else {
                            if (!skill) return interaction.followUp({ content: `You don't have a class skill`, ephemeral: true });
                            if (myChar.id === 4767) return interaction.followUp({ content: "Asta can't use any abilities", ephemeral: true });
                            if (skill.cost > myStatsC.sm) return interaction.followUp({ content: `You don't have enough mana! (**${myStatsC.sm}**/${skill.cost}${customEmojis.mana})`, ephemeral: true });
                            else {
                                if (matchStats.turn === 1) {
                                    matchStats.actionSequence.push("⚜️");
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

                    atk.on('end', () => {
                        if (120 + Math.floor((timestart - new Date().getTime()) / 1000) < 1) {
                            atk.stop(), def.stop(), ability.stop(), cskill.stop();

                            resolve(matchResult("t"));
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
