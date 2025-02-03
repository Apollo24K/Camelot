import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle, ChatInputCommandInteraction } from "discord.js";
import { abilities } from "../Modules/abilities";
import { classes } from "../Modules/classes";
import { curses } from "../Modules/curses";
import { bossMobs } from "../Modules/enemies";
import { armorInfo, items, weaponInfo } from "../Modules/items";
import { skills, eventBossAbilities } from "../Modules/skills";
import { characters } from "../Modules/chars";
import { getDetailedStats, customEmojis, deleteReplyIn, dealDamage, baseEP } from "../Modules/functions";
import Avalon from "../Modules/avalon";
import buffInfo from "../Modules/buffs";
import _ from 'lodash';
import { CompactUserSchema, DetailedStats, GuildSchema, SlashCommand, UpdateUserOptions } from '../types';
import { getGuildSchema, getUserSchema, updateGuilds, updateUsers } from '../Modules/queries';

const dungeonInProgress = new Set();

const bossBaseHP = [124080, 160260, 113720, 144640];

function toOrdinal(num: number) {
    if (num % 100 >= 11 && num % 100 <= 13) return num + "th";
    switch (num % 10) {
        case 1: return num + "st";
        case 2: return num + "nd";
        case 3: return num + "rd";
        default: return num + "th";
    };
};

function timeLeftToNextEvenHour() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    let hoursLeft, minutesLeft;

    // Find the next even hour
    const nextEvenHour = hours % 2 === 0 ? hours + 2 : hours + 1;

    // Calculate hours and minutes left
    if (minutes === 0) {
        // If exactly on the hour, adjust depending on current hour's parity
        hoursLeft = (hours % 2 === 0) ? 2 : 1;
        minutesLeft = 0;
    } else {
        hoursLeft = nextEvenHour - hours - 1;
        minutesLeft = 60 - minutes;
    }

    return `${hoursLeft > 0 ? `${hoursLeft}h ` : ""}${minutesLeft}m`;
};

function bossSelection(interaction: ChatInputCommandInteraction, stats: CompactUserSchema, guild: GuildSchema): Promise<number> {
    return new Promise((resolve) => {
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('0')
                    .setLabel('Rumbleguard')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(guild.boss1 < 1),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('1')
                    .setLabel('Sylvanoss')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(guild.boss2 < 1),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('2')
                    .setLabel('Celestion')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(guild.boss3 < 1),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('3')
                    .setLabel('Malevokar')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(!((guild.boss1 < 1) && (guild.boss2 < 1) && (guild.boss3 < 1))),
            );

        const Embed = new EmbedBuilder()
            .setColor(0x2aad9d)
            .setTitle("Boss Hunt ➜ Stage " + guild.bosshuntstage + `${guild.bosshuntstage === 30 ? " (last stage)" : ""}`)
            .setThumbnail("https://i.imgur.com/ZUdnLZO.png") // .setThumbnail("https://i.imgur.com/4i61ERG.png")
            .setDescription(`**Guild**: ${guild.name}\n\nDefeat Rumbleguard, Sylvanoss and Celestion to fight Malevokar. Once Malevokar is defeated, you'll reach the next stage!\nEvery cleared stage awards all guild members 5000 <:coins:872926669055356939> & 5 <:genesis_gems:1034179687720681492>, and your guild with \`stage * 10000\` <:coins:872926669055356939> (current stage: ${guild.bosshuntstage * 10000} <:coins:872926669055356939>)\n\n<:DEF:1047269141662417037> **Rumbleguard** ➜ **${guild.boss1 < 1 ? 0 : guild.boss1}**/${Math.round(bossBaseHP[0] * (0.8 + (guild.bosshuntstage * 0.2)))}💖\n<:HP:1062043800979116143> **Sylvanoss** ➜ **${guild.boss2 < 1 ? 0 : guild.boss2}**/${Math.round(bossBaseHP[1] * (0.8 + (guild.bosshuntstage * 0.2)))}💖\n<:magic_dmg:948568336621527040> **Celestion** ➜ **${guild.boss3 < 1 ? 0 : guild.boss3}**/${Math.round(bossBaseHP[2] * (0.8 + (guild.bosshuntstage * 0.2)))}💖\n✨ **Malevokar** ➜ **${guild.boss4 < 1 ? 0 : guild.boss4}**/${Math.round(bossBaseHP[3] * (0.8 + (guild.bosshuntstage * 0.2)))}💖`)
            .setFooter({ text: stats.bosshuntruns === 5 ? `You can play again in ${timeLeftToNextEvenHour()}` : `You can fight now! Runs left: ${5 - stats.bosshuntruns}/5 (refills every 2h)`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
        interaction.editReply({ embeds: [Embed], components: [row] }).then((msg) => {

            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 180000 });

            collector.on('collect', async r => {
                resolve(parseInt(r.customId));
                collector.stop();
            });

            collector.on('end', () => {
                collector.stop();
                resolve(-1);
            });

        });

    });
};

function calculateTriggerChance(atk: number) {
    // const atkMin = 100;
    // const atkMax = 10000;
    // const chanceMin = 0.09;
    // const chanceMax = 0.03;

    // // Clamp `atk` to the range to ensure the output stays within bounds
    // const clampedAtk = Math.min(Math.max(atk, atkMin), atkMax);

    // // Calculate the percentage position of `atk` within its range
    // const atkPercentage = (clampedAtk - atkMin) / (atkMax - atkMin);

    // // Calculate `triggerChance` using linear interpolation
    // // Adjust the formula to decrease chance as `atk` increases
    // const triggerChance = chanceMax - (atkPercentage * (chanceMax - chanceMin));

    // return 0.12 - triggerChance;

    if (atk < 500) return 0.4;
    if (atk < 1000) return 0.32;
    if (atk < 2000) return 0.21;
    if (atk < 4000) return 0.14;
    if (atk < 6000) return 0.07;
    return 0.04;
};

function adjustDEF(myStatsC: DetailedStats) { // {274: x2 atk -> x1.5 dmg, 340: x2 atk -> x1.4 dmg, 395: x2 atk -> x1.32 dmg}
    return Math.max(myStatsC.atk, myStatsC.md) > 128 ? Math.floor(((Math.log(Math.max(myStatsC.atk, myStatsC.md)) / Math.log(2)) - 7) * 395) : 0;
};

const isEventActive = false;

const exportCommand: SlashCommand = {
    name: 'boss-hunt',
    async execute({ interaction, author }) {

        if (!isEventActive) {
            return interaction.reply("This is an event game mode, but there is currently no ongoing event.\nPlease see our </support:1011293280702578694> server for more information.");
        };

        await interaction.deferReply().catch((err) => {
            return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
        });

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        let stats = author.schema;
        if (stats.battlechar === null || !stats.chars.includes(stats.battlechar)) return interaction.editReply("You have to choose a battle character first. Use `/select <char name>` to choose one.");

        const guild = stats.guild ? await getGuildSchema(stats.guild) : undefined;
        if (!guild) return interaction.editReply(`You need to be in a guild to participate in this event!\nYou can find one using \`/guild find\` or create your own using \`/guild create\``);
        if (guild.bosshuntstage >= 30) guild.bosshuntstage = 30, guild.boss1 = Math.round(bossBaseHP[0] * (1 + (guild.bosshuntstage * 0.2))), guild.boss2 = Math.round(bossBaseHP[1] * (1 + (guild.bosshuntstage * 0.2))), guild.boss3 = Math.round(bossBaseHP[2] * (1 + (guild.bosshuntstage * 0.2))), guild.boss4 = Math.round(bossBaseHP[3] * (1 + (guild.bosshuntstage * 0.2)));

        // Tutorial
        const selection = await bossSelection(interaction, stats, guild);
        if (selection === -1) return;

        stats = await getUserSchema(interaction.user.id) ?? stats;
        if (stats.battlechar === null || !stats.chars.includes(stats.battlechar)) return interaction.editReply("You have to choose a battle character first. Use `/select <char name>` to choose one.");

        // Set up restrictions
        if ((stats.bosshuntruns ?? stats.bosshuntruns) === 5) {
            if (interaction.channel?.isSendable()) interaction.channel.send(`You can play again in ${timeLeftToNextEvenHour()}`);
            return;
        };
        if (dungeonInProgress.has(stats.id)) return interaction.editReply("You already have a run in progress, please finish it before attempting to start a new round.");
        dungeonInProgress.add(stats.id);
        const userTimeout = setTimeout(() => dungeonInProgress.delete(stats.id), 120000);

        // if (dungeonInProgress.has(stats.id)) return interaction.channel.send(`You can play again in${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000) > 0 ? ` **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000)}**min` : ""} **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 1000) % 60}**s`);
        // dungeonInProgress.set(stats.id, new Date().getTime() + 20 * 60 * 1000);
        // setTimeout(() => {
        //     dungeonInProgress.delete(stats.id);
        //     interaction.channel.send(`${interaction.user.toString()} is off </boss hunt:1056333974814859365> cooldown!`);
        // }, 20 * 60 * 1000);

        // Update users table
        await updateUsers(interaction.user.id, {
            bosshuntruns: { type: "increment", value: -1 },
        });

        // User stats
        let myChar = characters[stats.battlechar];
        let myStats = await getDetailedStats(myChar.id, stats, stats.dungeon_classlevels);

        myStats.thumbnail = myChar.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[myChar.id], stats.char_skin[myChar.id]);

        let myStatsC = { ...myStats };
        let myClass = myStats.class !== -1 ? classes[myStats.class] : undefined;
        let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : undefined;
        let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : undefined;


        // Enemy Stats
        const boss = bossMobs[selection];
        let enemy = boss;
        let curseId = 0;
        if (boss.id === 0) curseId = 4;
        if (boss.id === 1) curseId = 11;
        if (boss.id === 2) curseId = 9;
        if (boss.id === 3) curseId = 9;
        const curse = curses[curseId];
        const eAbility = eventBossAbilities[boss.id];
        let eImage = enemy.image[0];

        let eStats = {
            "name": enemy.name,
            "hp": guild[`boss${(enemy.id + 1) as 1 | 2 | 3 | 4}`],
            "maxhp": Math.round(bossBaseHP[enemy.id] * (0.8 + (guild.bosshuntstage * 0.2))),
            "atk": 400,
            "def": 20,
            "ep": 0,
            "md": 400,
            "mr": 20,
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
        } as any;

        // Adjust enemy stats
        if (enemy.id === 0) {
            eStats.shield = Math.floor(eStats.hp * 0.01);
            eStats.atk = Math.floor(myStatsC.hp * Math.min(0.16 + (guild.bosshuntstage * 0.018), 0.35));
            eStats.md = Math.floor(myStatsC.hp * Math.min(0.14 + (guild.bosshuntstage * 0.015), 0.32));
            eStats.def = 350 * (0.9 + (guild.bosshuntstage * 0.1));
            eStats.mr = 350 * (0.9 + (guild.bosshuntstage * 0.1));
            eStats.cr = 0.22;
            eStats.cd = 1.33;
        } else if (enemy.id === 1) {
            eStats.shield = (guild.bosshuntstage >= 5) ? Math.floor(eStats.hp * 0.004) : 0;
            eStats.atk = Math.floor(myStatsC.hp * (0.15 + Math.min(guild.bosshuntstage * 0.015), 0.34));
            eStats.md = Math.floor(myStatsC.hp * (0.14 + Math.min(guild.bosshuntstage * 0.013), 0.32));
            eStats.def = 250 * (0.9 + (guild.bosshuntstage * 0.1));
            eStats.mr = 250 * (0.9 + (guild.bosshuntstage * 0.1));
            eStats.cr = 0.1;
            eStats.cd = 1.4;
            eStats.mana = 160;
        } else if (enemy.id === 2) {
            eStats.shield = (guild.bosshuntstage >= 5) ? Math.floor(eStats.hp * 0.003) : 0;
            eStats.atk = Math.floor(myStatsC.hp * Math.min(0.17 + (guild.bosshuntstage * 0.018), 0.36));
            eStats.md = Math.floor(myStatsC.hp * Math.min(0.18 + (guild.bosshuntstage * 0.019), 0.4));
            eStats.def = 200 * (0.9 + (guild.bosshuntstage * 0.1));
            eStats.mr = 200 * (0.9 + (guild.bosshuntstage * 0.1));
            eStats.cr = 0.33;
            eStats.cd = 1.6;
            eStats.mdChance = 1;
            eStats.mana = 200;
        } else if (enemy.id === 3) {
            eStats.shield = (guild.bosshuntstage >= 3) ? Math.floor(eStats.hp * 0.003) : 0;
            eStats.atk = Math.floor(myStatsC.hp * Math.min(0.17 + (guild.bosshuntstage * 0.02), 0.36));
            eStats.md = Math.floor(myStatsC.hp * Math.min(0.17 + (guild.bosshuntstage * 0.02), 0.36));
            eStats.def = 250 * (0.9 + (guild.bosshuntstage * 0.1));
            eStats.mr = 250 * (0.9 + (guild.bosshuntstage * 0.1));
            eStats.cr = 0.285;
            eStats.cd = 1.4;
            eStats.mdChance = 0.5;
            eStats.mg = 18;
            eStats.mana = 300;
        };
        eStats.ep = Math.floor(((1 / (1 - eStats.dodge)) * (eStats.hp / Math.pow(0.99895, Math.max(eStats.def, eStats.mr))) / (200 / (Math.max(eStats.atk, eStats.md) * (1 + ((eStats.cr > 1 ? 1 : (eStats.cr < 0) ? 0 : eStats.cr) * (eStats.cd - 1)))))) * 100) / 100;

        eStats.image = eImage;
        let eStatsC = { ...eStats };

        // Some match settings
        const difficulty = Avalon.getDifficulty(myStats.ep / eStats.ep);
        const aDelay = stats.animationdelay;

        let buffs = Avalon.getBuffs();
        let eBuffs = Avalon.getBuffs();

        // ATK buffs
        eBuffs.atk.push(new buffInfo("*", 1, 9999, 1.02, "*"));
        eBuffs.md.push(new buffInfo("*", 1, 9999, 1.02, "*"));

        let resolved = false;
        async function matchResult(r: "w" | "l" | "t") {
            if (resolved) return;
            resolved = true;

            if (!guild) return;

            // Clear restrictions
            clearTimeout(userTimeout);
            dungeonInProgress.delete(stats.id);

            // Class Level
            let cxpmsg = "You don't have a class";
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

                // Weekend Buff
                if (new Date().getDay() === 6 || new Date().getDay() === 0) boost *= 2;

                // Guild Buff
                if (guild) boost += (0.2 * guild.xpbuff);

                boost = Math.round(boost * 100) / 100;
                let cxp = 100;
                if (enemy.boss) cxp = Math.floor(cxp * 1.5);
                cxpmsg = `Class XP: **${cxp}** (Boost: x${boost}${new Date().getDay() === 6 || new Date().getDay() === 0 ? " weekend" : ""})`;
                if (myClass.id in stats.dungeon_classlevels) stats.dungeon_classlevels[myClass.id] += cxp;
                else stats.dungeon_classlevels[myClass.id] = cxp;
            };

            // Coins
            let loot = 300 + (guild.bosshuntstage * 15);
            if (guild?.lootbuff) loot *= 1 + (0.2 * guild.lootbuff);
            loot = Math.floor((loot * matchStats.lootm) + matchStats.loot);

            // Event Points // Damage dealt: (guild["boss"+(enemy.id+1)] - eStatsC.hp)
            let eventpts = 300 + Math.round((guild[`boss${(enemy.id + 1) as 1 | 2 | 3 | 4}`] - eStatsC.hp) / 200);
            if (eventpts > 800) eventpts = 800;
            eventpts = Math.floor(eventpts * (0.8 + (guild.bosshuntstage * 0.2)));
            if (eventpts > 2400) eventpts = 2400;

            // Update guilds table
            await updateGuilds(guild.id, {
                [`boss${(enemy.id + 1) as 1 | 2 | 3 | 4}`]: { type: "increment", value: -(guild[`boss${(enemy.id + 1) as 1 | 2 | 3 | 4}`] - eStatsC.hp) },
            });

            // Update users table
            await updateUsers(interaction.user.id, {
                coins: { type: "increment", value: loot },
                eventpts: { type: "increment", value: eventpts },
                dungeon_classlevels: { type: "set", value: stats.dungeon_classlevels },
            });

            // Event Rewards
            const milestones: { id: number; required: number; query: UpdateUserOptions; rew: string; image?: string; }[] = [
                {
                    id: 0,
                    required: 250,
                    query: { coins: { type: "increment", value: 300 }, sshard: { type: "increment", value: 4 } },
                    rew: "300<:coins:872926669055356939> and 4<:s_shard:917202925514817566>",
                },
                {
                    id: 1,
                    required: 500,
                    query: { coins: { type: "increment", value: 400 }, lootbox: { type: "increment", value: 1 } },
                    rew: "400<:coins:872926669055356939> and a lootbox",
                },
                {
                    id: 2,
                    required: 800,
                    query: { coins: { type: "increment", value: 500 }, sticket: { type: "increment", value: 1 } },
                    rew: "500<:coins:872926669055356939> and 1x <:s_ticket:927642487705722890>",
                },
                {
                    id: 3,
                    required: 1250,
                    query: { coins: { type: "increment", value: 550 }, lootbox: { type: "increment", value: 1 }, sticket: { type: "increment", value: 2 } },
                    rew: "550<:coins:872926669055356939>, 2x <:s_ticket:927642487705722890> and a lootbox",
                },
                {
                    id: 4,
                    required: 1800,
                    query: { coins: { type: "increment", value: 600 }, lootbox: { type: "increment", value: 1 }, sshard: { type: "increment", value: 8 } },
                    rew: "600<:coins:872926669055356939>, 8x <:s_shard:917202925514817566> and a lootbox",
                },
                {
                    id: 5,
                    required: 2500,
                    query: { expulls: { type: "increment", value: 1 }, gems: { type: "increment", value: 10 } },
                    rew: "1x <a:EXTRA:1138530846144462968> & 10<:genesis_gems:1034179687720681492>",
                },
                {
                    id: 6,
                    required: 3200,
                    query: { coins: { type: "increment", value: 700 }, lootbox: { type: "increment", value: 2 }, sshard: { type: "increment", value: 10 } },
                    rew: "700<:coins:872926669055356939>, 10x <:s_shard:917202925514817566> and 2 lootboxes",
                },
                {
                    id: 7,
                    required: 3800,
                    query: { coins: { type: "increment", value: 750 }, sticket: { type: "increment", value: 2 } },
                    rew: "750<:coins:872926669055356939>, 2x <:s_ticket:927642487705722890>",
                },
                {
                    id: 8,
                    required: 4400,
                    query: { coins: { type: "increment", value: 800 }, lootbox: { type: "increment", value: 2 }, ssshard: { type: "increment", value: 4 } },
                    rew: "800<:coins:872926669055356939>, 4x <:ss_shard:917203009543503892> and 2 lootboxes",
                },
                {
                    id: 9,
                    required: 5000,
                    query: { expulls: { type: "increment", value: 1 }, sticket: { type: "increment", value: 3 } },
                    rew: "1x <a:EXTRA:1138530846144462968> and 3x <:s_ticket:927642487705722890>",
                },
                {
                    id: 10,
                    required: 6000,
                    query: { coins: { type: "increment", value: 900 }, lootbox: { type: "increment", value: 1 }, ssshard: { type: "increment", value: 4 } },
                    rew: "900<:coins:872926669055356939>, 4x <:ss_shard:917203009543503892> and a lootbox",
                },
                {
                    id: 11,
                    required: 7250,
                    query: { coins: { type: "increment", value: 1000 }, ssshard: { type: "increment", value: 6 } },
                    rew: "1000<:coins:872926669055356939>, 6x <:ss_shard:917203009543503892>",
                },
                {
                    id: 12,
                    required: 8500,
                    query: { coins: { type: "increment", value: 1000 }, sticket: { type: "increment", value: 3 } },
                    rew: "1000<:coins:872926669055356939>, 3x <:s_ticket:927642487705722890>",
                },
                {
                    id: 13,
                    required: 10000,
                    query: { expulls: { type: "increment", value: 1 }, ssticket: { type: "increment", value: 1 } },
                    rew: "1x <a:EXTRA:1138530846144462968> and 1x <:ss_ticket:927503239396622336>",
                },
                {
                    id: 14,
                    required: 12500,
                    query: { coins: { type: "increment", value: 1200 }, lootbox: { type: "increment", value: 3 } },
                    rew: "1200<:coins:872926669055356939> and 3 lootboxes",
                },
                {
                    id: 15,
                    required: 15000,
                    query: { expulls: { type: "increment", value: 1 }, ssticket: { type: "increment", value: 1 } },
                    rew: "1x <a:EXTRA:1138530846144462968> and 1x <:ss_ticket:927503239396622336>",
                },
                {
                    id: 16,
                    required: 18000,
                    query: { coins: { type: "increment", value: 1250 }, lootbox: { type: "increment", value: 2 }, ssticket: { type: "increment", value: 1 } },
                    rew: "1250<:coins:872926669055356939>, 1x <:ss_ticket:927503239396622336> and 2 lootboxes",
                },
                {
                    id: 17,
                    required: 22500,
                    query: { expulls: { type: "increment", value: 1 }, ssticket: { type: "increment", value: 1 } },
                    rew: "1x <a:EXTRA:1138530846144462968> and 1x <:ss_ticket:927503239396622336>",
                },
                {
                    id: 18,
                    required: 26000,
                    query: { lootbox: { type: "increment", value: 6 } },
                    rew: "6 lootboxes",
                },
                {
                    id: 19,
                    required: 30000,
                    query: { expulls: { type: "increment", value: 2 } },
                    rew: "2x <a:EXTRA:1138530846144462968>",
                },
                {
                    id: 20,
                    required: 36000,
                    query: { coins: { type: "increment", value: 1250 }, gems: { type: "increment", value: 10 }, lootbox: { type: "increment", value: 2 } },
                    rew: "1250<:coins:872926669055356939>, 10<:genesis_gems:1034179687720681492> and 2 lootboxes",
                },
                {
                    id: 21,
                    required: 42000,
                    query: { coins: { type: "increment", value: 3000 }, expulls: { type: "increment", value: 1 } },
                    rew: "1x <a:EXTRA:1138530846144462968> and 3000<:coins:872926669055356939>",
                },
                {
                    id: 22,
                    required: 50000,
                    query: { gems: { type: "increment", value: 20 }, lootbox: { type: "increment", value: 3 }, ssticket: { type: "increment", value: 1 } },
                    rew: "20<:genesis_gems:1034179687720681492>, 1x <:ss_ticket:927503239396622336> and 3 lootboxes",
                },
                {
                    id: 23,
                    required: 60000,
                    query: { coins: { type: "increment", value: 3000 }, gems: { type: "increment", value: 10 }, lootbox: { type: "increment", value: 3 }, ssticket: { type: "increment", value: 1 } },
                    rew: "3000<:coins:872926669055356939>, 10<:genesis_gems:1034179687720681492>, 1x <:ss_ticket:927503239396622336> and 3 lootboxes",
                },
                {
                    id: 24,
                    required: 72000,
                    query: { expulls: { type: "increment", value: 1 }, lootbox: { type: "increment", value: 3 }, ssticket: { type: "increment", value: 1 } },
                    rew: "1x <a:EXTRA:1138530846144462968>, 1x <:ss_ticket:927503239396622336> and 3 lootboxes",
                },
                {
                    id: 25,
                    required: 80000,
                    query: { ssticket: { type: "increment", value: 2 }, sticket: { type: "increment", value: 6 } },
                    rew: "2x <:ss_ticket:927503239396622336> and 6x <:s_ticket:927642487705722890>",
                },
                {
                    id: 26,
                    required: 100000,
                    query: { gems: { type: "increment", value: 20 }, expulls: { type: "increment", value: 1 } },
                    rew: "1x <a:EXTRA:1138530846144462968> and 20<:genesis_gems:1034179687720681492>",
                },
            ];

            const Embed = new EmbedBuilder();

            let rewMessage = "";
            if (milestones[stats.eventrewreceived]) {
                if (milestones[stats.eventrewreceived].required <= (stats.eventpts + eventpts)) {

                    // Update users table
                    await updateUsers(interaction.user.id, {
                        eventrewreceived: { type: "increment", value: 1 },
                        ...milestones[stats.eventrewreceived].query,
                    });

                    rewMessage = `\n<a:starsL:942573254730715246> You have unlocked the ${(milestones.length - 1) === milestones[stats.eventrewreceived].id ? "last" : toOrdinal(milestones[stats.eventrewreceived].id + 1)} reward! <a:starsR:942573194802511923>\nYou received ${milestones[stats.eventrewreceived].rew}!${milestones[stats.eventrewreceived + 1] ? `\nNext target: **${stats.eventpts + eventpts}**/${milestones[stats.eventrewreceived + 1].required}🌙` : ""}`;
                    Embed.setImage(milestones[stats.eventrewreceived]?.image || null);
                } else {
                    rewMessage = `\nNext reward: **${stats.eventpts + eventpts}**/${milestones[stats.eventrewreceived].required}`;
                };
            } else {
                rewMessage = "\nYou have unlocked all rewards!";
            };

            Embed.setColor(0x2aad9d)
                .setThumbnail(myStatsC.thumbnail)
                .setTitle(`Boss Hunt (${enemy.name})`)
                .setFooter({ text: `Balance: ${stats.coins + loot} coins`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) })
                .setDescription(`<:stars_v2:917023655840591963> **${myChar.name}** ${r === "w" ? "won" : "lost"} <:stars_v2:917023655840591963>\n<a:arrow_green:916716811842621450> dealt **${guild[`boss${enemy.id + 1 as 1 | 2 | 3 | 4}`] - eStatsC.hp}** damage\n<a:arrow_orange:916716747623641210> ${cxpmsg}\n<a:arrow_white:916716862962819092> Crescent Moon: ${eventpts}🌙\n\n<:npbag:929428030554787892> **Loot**: ${loot}<:coins:872926669055356939>\n${rewMessage}`);

            // Add Stage rewards
            if (r === "w" && boss.id === 3) {
                const checkGuild = await getGuildSchema(guild.id);
                if (checkGuild?.bosshuntstage === guild.bosshuntstage) {

                    // Update guilds table
                    await updateGuilds(guild.id, {
                        treasury: { type: "increment", value: guild.bosshuntstage * 10000 },
                        boss1: { type: "set", value: Math.round(bossBaseHP[0] * (1 + (guild.bosshuntstage * 0.2))) },
                        boss2: { type: "set", value: Math.round(bossBaseHP[1] * (1 + (guild.bosshuntstage * 0.2))) },
                        boss3: { type: "set", value: Math.round(bossBaseHP[2] * (1 + (guild.bosshuntstage * 0.2))) },
                        boss4: { type: "set", value: Math.round(bossBaseHP[3] * (1 + (guild.bosshuntstage * 0.2))) },
                        bosshuntstage: { type: "increment", value: 1 },
                    });

                    // Update users table
                    await updateUsers(guild.members, {
                        bosshuntrevreceived: { type: "increment", value: 1 },
                        coins: { type: "increment", value: 5000 },
                        gems: { type: "increment", value: 5 },
                    }, `bosshuntrevreceived < 30`);

                    // if ([3, 5, 10].includes(guild.bosshuntstage)) {
                    //     const skins = await query(`SELECT id, skins FROM users WHERE id IN (${guild.members})`);
                    //     for (let i = 0; i < skins.length; i++) {
                    //         const skin = JSON.parse(skins[i].skins);
                    //         skin.push(guild.bosshuntstage === 3 ? 25 : (guild.bosshuntstage === 5 ? 27 : 28));
                    //         await query(`UPDATE users SET skins = '${JSON.stringify(skin)}' WHERE id = ${skins[i].id}`);
                    //     };
                    // };

                    setTimeout(() => {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You have defeated Malevokar (Stage ${guild.bosshuntstage}) <a:TaigaHappy:1045396982627323975>\nUnlocked Stage ${guild.bosshuntstage + 1}\nYour guild has been awarded ${guild.bosshuntstage * 10000} <:coins:872926669055356939>\n\nAll members of your guild have received the following rewards:\n> 5000<:coins:872926669055356939>\n> 5<:genesis_gems:1034179687720681492>`);
                    }, 1000);
                };
            };

            return Embed;
        };

        let matchStats = Avalon.getMatchStats(interaction, { allowExecution: false });
        let notice = ["", "", "", ""];

        // Adjust DEF
        eStatsC.def += adjustDEF(myStatsC);
        eStatsC.mr += adjustDEF(myStatsC);

        // Apply passives
        if (skill && myChar.id !== 4767) skill.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
        if (myAbility?.passive) myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.weapon !== -1) (items[myStats.weapon] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.shieldid) (items[myStats.shieldid] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.helmet && (items[myStats.helmet] as armorInfo).setname === (items[myStats.cuirass] as armorInfo)?.setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.gloves] as armorInfo)?.setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.boots] as armorInfo)?.setname) (items[myStats.boots] as armorInfo)?.buff?.(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        const ATK_EMOJI = myStatsC.replaceButton?.atk?.emoji || '⚔️',
            DEF_EMOJI = myStatsC.replaceButton?.def?.emoji || '🛡️',
            ABILITY_EMOJI = myStatsC.replaceButton?.ability?.emoji || '✨',
            SKILL_EMOJI = myStatsC.replaceButton?.cskill?.emoji || '⚜️';

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled((myAbility && "ability" in myAbility) ? false : true),
                new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled(myStats.class !== -1 ? false : true),
            );


        // Random Events
        const triggerChance = calculateTriggerChance(Math.max(myStatsC.atk, myStatsC.md));
        if (Math.random() < triggerChance) {
            const randomEvents = ["Leyline Surge", "Celestial Alignment", "Gravity Anomaly", "Phantom Pain"];
            const randomEvent = randomEvents[Math.floor(randomEvents.length * Math.random())];

            if (randomEvent === "Leyline Surge") {
                const boost = triggerChance > 0.07 ? 25 : (triggerChance > 0.05 ? 15 : 8);
                buffs.atk.push(new buffInfo("*", boost, 9999));
                buffs.md.push(new buffInfo("*", boost, 9999));
                myStatsC.atk = Math.floor(myStatsC.atk * boost);
                myStatsC.md = Math.floor(myStatsC.md * boost);
            } else if (randomEvent === "Celestial Alignment") {
                const boost = triggerChance > 0.07 ? 8 : (triggerChance > 0.05 ? 5 : 3);
                buffs.atk.push(new buffInfo("*", boost, 9999));
                buffs.md.push(new buffInfo("*", boost, 9999));
                myStatsC.atk = Math.floor(myStatsC.atk * boost);
                myStatsC.md = Math.floor(myStatsC.md * boost);
                buffs.hp.push(new buffInfo("+", Math.floor(myStatsC.maxhp * 0.1), 9999));
            } else if (randomEvent === "Gravity Anomaly") {
                const boost = triggerChance > 0.07 ? 12 : (triggerChance > 0.05 ? 8 : 4);
                buffs.atk.push(new buffInfo("*", boost, 9999));
                buffs.md.push(new buffInfo("*", boost, 9999));
                myStatsC.atk = Math.floor(myStatsC.atk * boost);
                myStatsC.md = Math.floor(myStatsC.md * boost);
                buffs.dodge.push(new buffInfo("+", 0.2, 9999));
                myStatsC.dodge += 0.2;
                if (myStatsC.dodge > 1) myStatsC.dodge = 1;
            } else if (randomEvent === "Phantom Pain") {
                const boost = triggerChance > 0.07 ? 7 : (triggerChance > 0.05 ? 4 : 2.5);
                buffs.atk.push(new buffInfo("*", boost, 9999));
                buffs.md.push(new buffInfo("*", boost, 9999));
                myStatsC.atk = Math.floor(myStatsC.atk * boost);
                myStatsC.md = Math.floor(myStatsC.md * boost);

                buffs.def.push(new buffInfo("+", 350, 9999));
                buffs.mr.push(new buffInfo("+", 350, 9999));
                myStatsC.def += 350;
                myStatsC.mr += 350;
            };

            notice.push(`\n✨ Triggered random event: ${randomEvent}!`);
        };

        async function newFight() {
            const timestart = new Date().getTime();
            const result = await new Promise<EmbedBuilder | undefined>((resolve, rejects) => {
                const Embed = new EmbedBuilder()
                    .setColor(0x2aad9d)
                    .setThumbnail(myStatsC.thumbnail)
                    .setFooter({ text: `Enemy EP: ${eStatsC.ep} | time left: 120s` })
                    .setTitle(`Boss Hunt (${enemy.name})`)
                    .setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.maxhp}\\💖${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStats.maxhp, eStatsC.sm / eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStats.hp}\\💖${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana)}\n${Avalon.padStats(myStatsC)}`)
                    .setImage(eImage);
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
                        Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStatsC.maxhp, eStatsC.sm / eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-4).join("")}`);
                        Embed.setFooter({ text: `Enemy EP: ${eStatsC.ep} | time left: ${120 + Math.floor((timestart - new Date().getTime()) / 1000)}s` });
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
                            Embed.setImage(eImage);
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
                        eBuffs.atk.push(new buffInfo("+", Math.floor(eStats.atk * matchStats.round * 0.02), 9999));
                        eBuffs.md.push(new buffInfo("+", Math.floor(eStats.md * matchStats.round * 0.02), 9999));

                        // Apply Buffy
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

                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
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
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                } else if (matchStats.blockAbilities-- < 0 && myChar.id !== 4767 && eAbility && eStatsC.sm >= eAbility.cost && Math.random() < 0.5) {
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

                    atk.on('collect', async r => {
                        if (matchStats.turn === 1) {
                            matchStats.turn = 0;

                            // If attack was replaced
                            if (myStatsC.replaceButton.atk?.run) {
                                myStatsC.replaceButton.atk.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                if (matchStats.turn === 0) attack();
                            }

                            // Normal attack
                            else {
                                dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                if (matchStats.twinshot > Math.random()) setTimeout(() => {
                                    dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
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

                            // If defense was replaced
                            if (myStatsC.replaceButton.def?.run) {
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

                    ability.on('collect', async r => {
                        if (myStatsC.isAbilityBlocked) return interaction.followUp({ content: `You currently can't use your character ability`, ephemeral: true });

                        // If ability was replaced
                        if (myStatsC.replaceButton.ability?.run && matchStats.turn === 1) {
                            matchStats.turn = 0;
                            myStatsC.attackStreak = 0;
                            myStatsC.replaceButton.ability.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                            editEmbed();
                            Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
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

                    cskill.on('collect', async r => {

                        // If defense was replaced
                        if (myStatsC.replaceButton.cskill?.run && matchStats.turn === 1) {
                            matchStats.turn = 0;
                            myStatsC.attackStreak = 0;
                            myStatsC.replaceButton.cskill.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                            editEmbed();
                            Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
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
                                    skill.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user, stats.chars);
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                            };
                        }
                        // Trigger class active
                        matchStats.trigger("cskill", myStatsC, eStatsC, buffs, eBuffs);
                    });

                    atk.on('end', async component => {
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
