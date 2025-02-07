import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } from "discord.js";
import { abilities } from "../Modules/abilities";
import { classes } from "../Modules/classes";
import { curses } from "../Modules/curses";
import { enemies } from "../Modules/enemies";
import { armorInfo, items, weaponInfo } from "../Modules/items";
import { skills, bossAbilities } from "../Modules/skills";
import { characters } from "../Modules/chars";
import { getDetailedStats, customEmojis, dealDamage } from "../Modules/functions";
import Avalon from "../Modules/avalon";
import buffInfo from "../Modules/buffs";
import _ from 'lodash';
import { DetailedStats, SlashCommand, UpdateUserOptions } from '../types';
import { getUserSchema, updateUsers } from '../Modules/queries';

const dungeonInProgress = new Map();

function toOrdinal(num: number) {
    if (num % 100 >= 11 && num % 100 <= 13) return num + "th";
    switch (num % 10) {
        case 1: return num + "st";
        case 2: return num + "nd";
        case 3: return num + "rd";
        default: return num + "th";
    };
};

const isEventActive = false;

const exportCommand: SlashCommand = {
    name: 'boss-rush',
    async execute({ interaction, author }) {

        if (!isEventActive) {
            return interaction.reply("This is an event game mode, but there is currently no ongoing event.\nPlease see our </support:1011293280702578694> server for more information.");
        };

        await interaction.deferReply().catch((err) => {
            return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
        });

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        const stats = author.schema;
        if (stats.battlechar === null || !stats.chars.includes(stats.battlechar)) return interaction.editReply("You have to choose a battle character first. Use `/select <char name>` to choose one.");

        // Set up restrictions
        const cooldown = 15 * 60 * 1000;
        if (dungeonInProgress.has(stats.id)) return interaction.editReply(`You can play again in${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000) > 0 ? ` **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000)}**min` : ""} **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 1000) % 60}**s`);
        dungeonInProgress.set(stats.id, new Date().getTime() + cooldown);
        setTimeout(() => {
            dungeonInProgress.delete(stats.id);
            if (interaction.channel?.isSendable()) interaction.channel.send(`${interaction.user.toString()} is off </boss rush:1056333974814859365> cooldown!`);
        }, cooldown);

        // User stats
        let myChar = characters[stats.battlechar];
        let myStats = await getDetailedStats(myChar.id, stats, stats.dungeon_classlevels);

        myStats.thumbnail = myChar.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[myChar.id], stats.char_skin[myChar.id]);

        myStats.sm -= myStats.mg;
        let myStatsC = { ...myStats };
        let myClass = myStats.class !== -1 ? classes[myStats.class] : undefined;


        let round = 0;

        let resolved = false;
        async function matchResult(r: "w" | "l" | "t") {
            round++;
            if (r === "w" && round < 20) return newFight(); // return setTimeout(newFight, 1000);
            if (r === "l" || r === "t") round--;

            if (resolved) return;
            resolved = true;

            const stats = await getUserSchema(interaction.user.id);
            if (!stats) return;

            // Loot
            let eventpts = Math.round(round * 0.8 * (5 - Math.random()) * Math.pow(1.2, round * 0.8));
            if (eventpts > 500) eventpts = 500 + Math.floor(eventpts / 10);
            // eventpts = Math.floor(eventpts * 2);
            let loot = Math.round((2 * (10 + round * 0.8) * (5 - Math.random()) * Math.pow(1.2, round * 0.8)) / 4);
            if (loot > 400) loot = 400 + Math.floor(loot / 10);

            // Class Level
            let cxpmsg = "You don't have a class";
            let cxp = 0;
            if (myClass) {
                let boost = 1;
                stats.dungeon_classes.map((e) => classes[e].tier).forEach((e) => {
                    switch (e) {
                        case 2: boost += 0.05; break;
                        case 3: boost += 0.15; break;
                        case 4: boost += 0.25; break;
                        default: false; break;
                    };
                });
                if (stats.premium) {
                    switch (stats.premium) {
                        case 3: boost += 0.2; break;
                        case 4: boost += 0.3; break;
                        case 5: boost += 0.5; break;
                        case 6: boost += 0.75; break;
                        case 7: boost += 1; break;
                        default: false; break;
                    };
                };
                boost = Math.round(boost * 200) / 100;
                cxp = Math.floor((1 + round - Math.random()) * boost * 15) + 5; // 7-25 -> 205-223
                cxpmsg = `Class XP: **${cxp}** (Boost: x${boost}${new Date().getDay() === 6 || new Date().getDay() === 0 ? " weekend" : ""})`;
                // if (myClass.id in stats.classlevels) stats.classlevels[myClass.id] += cxp;
                // else stats.classlevels[myClass.id] = cxp;
            };

            // Update users table
            const userUpdates: UpdateUserOptions = {
                coins: { type: "increment", value: loot },
                eventpts: { type: "increment", value: eventpts },
                eventpts2: { type: "increment", value: eventpts },
                brbest: { type: "set", value: Math.max(stats.brbest, round) }
            };
            if (myClass && cxp > 0) userUpdates.dungeon_classlevels = { type: "merge_json", value: { [myClass.id]: cxp } };
            await updateUsers(interaction.user.id, userUpdates);


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

                    rewMessage = `\n<a:starsL:942573254730715246> You have unlocked the ${(milestones.length - 1) === milestones[stats.eventrewreceived].id ? "last" : toOrdinal(milestones[stats.eventrewreceived].id + 1)} reward! <a:starsR:942573194802511923>\nYou received ${milestones[stats.eventrewreceived].rew}!${milestones[stats.eventrewreceived + 1] ? `\nNext target: **${stats.eventpts + eventpts}**/${milestones[stats.eventrewreceived + 1].required}<:easterEgg:1095432499087278142>` : ""}`;
                    Embed.setImage(milestones[stats.eventrewreceived]?.image || null);
                } else {
                    rewMessage = `\nNext reward: **${stats.eventpts + eventpts}**/${milestones[stats.eventrewreceived].required}`;
                };
            } else {
                rewMessage = "\nYou have unlocked all rewards!";
            };

            Embed.setColor(0x69ffb9)
                .setThumbnail(myStatsC.thumbnail)
                .setTitle(`Boss Rush${r === "t" ? " (Time's up!)" : ""}`)
                .setFooter({ text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) })
                .setDescription(`<:stars_v2:917023655840591963> Round: ${round} (best: ${Math.max(stats.brbest, round)}) <:stars_v2:917023655840591963>\n<a:arrow_orange:916716747623641210> Loot: ${loot}<:coins:872926669055356939>\n<a:arrow_yellow:916716780045619200> ${cxpmsg}\n<a:arrow_white:916716862962819092> Treats: ${eventpts}<:easterEgg:1095432499087278142>\n${rewMessage}`)
                .setFooter({ text: `Balance: ${stats.coins + loot} coins`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
            return Embed;
        };

        let notice = ["", "", "", "\n👑 Let the trial begin!"];

        const aDelay = stats.premium ? stats.animationdelay : 1200;

        // Buttons
        const ATK_EMOJI = myStatsC.replaceButton?.atk?.emoji || '⚔️',
            DEF_EMOJI = myStatsC.replaceButton?.def?.emoji || '🛡️',
            ABILITY_EMOJI = myStatsC.replaceButton?.ability?.emoji || '✨',
            SKILL_EMOJI = myStatsC.replaceButton?.cskill?.emoji || '⚜️';

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled((myChar.id in abilities && "ability" in abilities[myChar.id]) ? false : true),
                new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled(myStats.class !== -1 ? false : true),
            );

        let timeout: NodeJS.Timeout | undefined;

        async function newFight() {

            // My Stats
            let tempHP = myStatsC.hp, tempMana = myStatsC.sm + myStatsC.mg;
            myStats = await getDetailedStats(myChar.id, stats, stats.dungeon_classlevels);
            myStats.hp = tempHP, myStats.sm = (tempMana > myStats.mana) ? myStats.mana : tempMana;
            myStatsC = { ...myStats };

            let myClass = myStats.class !== -1 ? classes[myStats.class] : undefined;
            let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : undefined;
            let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : undefined;

            // Enemy Stats
            const enemy = enemies.filter((e) => e.boss)[Math.floor(Math.random() * (enemies.filter((e) => e.boss).length))];
            const ebStats = [
                Math.floor(40 * (8 + Math.random()) * Math.pow(1.37, round)),
                Math.floor(9 * (10 + Math.random()) * Math.pow(1.35, round)),
                40 + round * 30 + (round >= 10 ? 150 * (round - 9) : 0),
            ];
            ebStats[3] = Math.floor(((ebStats[0] / Math.pow(0.99895, ebStats[2])) / (200 / ebStats[1])) * 100) / 100;
            const curseRar = curses.filter((e) => e.tier);
            const curse = curseRar[Math.floor(Math.random() * curseRar.length)];
            const eAbility = bossAbilities.find((e) => e.list[0] === enemy.floor[0]);
            let eImage = enemy.image[Math.floor(Math.random() * enemy.image.length)];

            let eStats = {
                "name": enemy.name,
                "hp": ebStats[0],
                "maxhp": ebStats[0],
                "atk": ebStats[1],
                "def": ebStats[2],
                "ep": ebStats[3],
                "md": ebStats[1],
                "mr": ebStats[2],
                "cr": 0.18,
                "cd": 1.25,
                "td": ebStats[1],
                "br": 0.2,
                "agility": 80,
                "dodge": 0.1,
                "mana": 80,
                "mg": 15,
                "sm": 20,
                "rev": 0,
                "revhp": 0.5,
            } as any;
            eStats.image = eImage;
            let eStatsC = { ...eStats };

            const difficulty = Avalon.getDifficulty(myStats.ep / eStats.ep);

            let buffs = Avalon.getBuffs();
            let eBuffs = Avalon.getBuffs();

            let matchStats = Avalon.getMatchStats(interaction);

            // Apply Passives
            if (skill && myChar.id !== 4767) skill.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
            if (myAbility?.passive) myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            if (myStats.weapon !== -1) (items[myStats.weapon] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            if (myStats.shieldid) (items[myStats.shieldid] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
            if (myStats.helmet && (items[myStats.helmet] as armorInfo).setname === (items[myStats.cuirass] as armorInfo)?.setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.gloves] as armorInfo)?.setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.boots] as armorInfo)?.setname) (items[myStats.boots] as armorInfo)?.buff?.(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

            const timestart = Date.now();
            let result = await new Promise<EmbedBuilder | undefined>((resolve, rejects) => {
                const Embed = new EmbedBuilder()
                    .setColor(0x69ffb9)
                    .setThumbnail(myStatsC.thumbnail)
                    .setFooter({ text: `Enemy EP: ${eStatsC.ep} | Round: ${round + 1} | time left: 120s` })
                    .setTitle(`Boss Rush`)
                    .setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStatsC.maxhp, eStatsC.sm / eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-4).join("")}`)
                    .setImage(eImage);
                interaction.editReply({ embeds: [Embed], components: [row] }).then(msg => {

                    const atk = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ATK", componentType: ComponentType.Button, time: 120000 });
                    const def = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "DEF", componentType: ComponentType.Button, time: 120000 });
                    const ability = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ABILITY", componentType: ComponentType.Button, time: 120000 });
                    const cskill = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKILL", componentType: ComponentType.Button, time: 120000 });
                    matchStats.collector = { "atk": atk, "def": def, "ability": ability, "cskill": cskill };


                    // Use passives
                    if (myChar.id !== 4767) curse.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                    async function editEmbed() {
                        if (myStatsC.hp < 1 || eStatsC.hp < 1) return;

                        Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStatsC.maxhp, eStatsC.sm / eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-4).join("")}`);
                        Embed.setFooter({ text: `Enemy EP: ${eStatsC.ep} | Round: ${round + 1} | time left: ${120 + Math.floor((timestart - new Date().getTime()) / 1000)}s` });

                        // await msg.edit({ embeds: [Embed] });

                        // Debounce
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                            msg.edit({ embeds: [Embed] });
                        }, 1200);
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
                        setTimeout(async () => {
                            resolve(await matchResult(wORl) ?? undefined);
                        }, 1000);
                        // resolve(matchResult(wORl));
                    };

                    function startNextRound() {
                        if (matchStats.round === matchStats.roundCheck) return;
                        matchStats.roundCheck = matchStats.round;

                        // Consume Mana
                        Avalon.consumeActiveMana(matchStats, myStatsC, buffs, myChar, notice, Embed, myStatsC.thumbnail);

                        // Reset Buffs
                        if (matchStats.currentCharacter === 0) myStatsC.atk = myStats.atk, myStatsC.md = myStats.md, myStatsC.def = myStats.def, myStatsC.mr = myStats.mr, myStatsC.cd = myStats.cd, myStatsC.cr = myStats.cr, myStatsC.dodge = myStats.dodge, myStatsC.br = myStats.br, myStatsC.mg = myStats.mg;
                        if (matchStats.currentOpponent === 0) eStatsC.atk = eStats.atk, eStatsC.md = eStats.md, eStatsC.def = eStats.def, eStatsC.mr = eStats.mr, eStatsC.cd = eStats.cd, eStatsC.cr = eStats.cr, eStatsC.dodge = eStats.dodge, eStatsC.br = eStats.br, eStatsC.mg = eStats.mg;

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

                                // Event Triggers
                                matchStats.trigger("ATK", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                if (matchStats.turn === 0) attack();
                            }

                            // Normal attack
                            else {
                                dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { block: true, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });

                                // Event Triggers
                                matchStats.trigger("ATK", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                if (matchStats.twinshot > Math.random()) setTimeout(() => {
                                    dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { block: true, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
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

                                // Event Triggers
                                matchStats.trigger("DEF", myStatsC, eStatsC, buffs, eBuffs);

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
                                }
                                myStatsC.usedBlockRound = matchStats.round;

                                // Event Triggers
                                matchStats.trigger("DEF", myStatsC, eStatsC, buffs, eBuffs);

                                attack();
                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            }

                        } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                    });

                    ability.on('collect', async r => {
                        if (myStatsC.isAbilityBlocked) return interaction.followUp({ content: `You currently can't use your character ability`, ephemeral: true });

                        // If ability was replaced
                        if (myStatsC.replaceButton.ability?.run && matchStats.turn === 1) {
                            matchStats.turn = 0;
                            myStatsC.attackStreak = 0;
                            myStatsC.replaceButton.ability.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                            // Event Triggers
                            matchStats.trigger("ABILITY", myStatsC, eStatsC, buffs, eBuffs);

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

                                        // Event Triggers
                                        matchStats.trigger("ABILITY", myStatsC, eStatsC, buffs, eBuffs);

                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        attack();
                                    };
                                } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                            } else interaction.followUp({ content: `You can use **${myChar.name}**'s ability only ${myAbility.usage === 1 ? "once" : `${myAbility.usage} times`} per fight.`, ephemeral: true });
                        };
                    });

                    cskill.on('collect', async r => {

                        // If class active was replaced
                        if (myStatsC.replaceButton.cskill?.run && matchStats.turn === 1) {
                            matchStats.turn = 0;
                            myStatsC.attackStreak = 0;
                            myStatsC.replaceButton.cskill.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                            // Event Triggers
                            matchStats.trigger("CSKILL", myStatsC, eStatsC, buffs, eBuffs);

                            editEmbed();
                            Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            if (matchStats.turn === 0) attack();
                        }

                        // Class active
                        else {
                            if (!skill) return interaction.followUp({ content: `You don't have a class skill`, ephemeral: true });
                            if (myChar.id === 4767) return interaction.followUp({ content: "Asta can't use any abilities", ephemeral: true });
                            if (skill.cost > myStatsC.sm) interaction.followUp({ content: `You don't have enough mana! (**${myStatsC.sm}**/${skill.cost}${customEmojis.mana})`, ephemeral: true });
                            else {
                                if (matchStats.turn === 1) {
                                    myStatsC.sm -= skill.cost;
                                    myStatsC.attackStreak = 0;
                                    skill.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user, stats.chars);

                                    // Event Triggers
                                    matchStats.trigger("CSKILL", myStatsC, eStatsC, buffs, eBuffs);

                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                            };
                        };
                    });

                    atk.on('end', async component => {
                        if (120 + Math.floor((timestart - new Date().getTime()) / 1000) < 1) {
                            atk.stop(), def.stop(), ability.stop(), cskill.stop();

                            resolve(await matchResult("t") ?? undefined);
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
