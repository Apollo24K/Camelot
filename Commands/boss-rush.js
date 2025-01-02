/* eslint-disable no-unused-vars */
import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType } from "discord.js";
import { db, query } from "../db_handler";
import { abilities } from "../Modules/abilities";
import { classes } from "../Modules/classes";
import { curses } from "../Modules/curses";
import { enemies } from "../Modules/enemies";
import { items } from "../Modules/items";
import { skills, bossAbilities } from "../Modules/skills";
import { characters } from "../Modules/chars";
import { getDetailedStats, customEmojis, deleteReplyIn, dealDamage } from "../Modules/functions";
import Avalon from "../Modules/avalon";
import buffInfo from "../Modules/buffs";
import _ from 'lodash';

const dungeonInProgress = new Map();

function toOrdinal(num) {
    if (num % 100 >= 11 && num % 100 <= 13) return num + "th";
    switch (num % 10) {
        case 1: return num + "st";
        case 2: return num + "nd";
        case 3: return num + "rd";
        default: return num + "th";
    };
};

module.exports = {
    name: 'boss',
    description: 'boss rush event gamemode',
    execute(interaction) {

        // return interaction.reply("After feedback about having 2 event modes at the same time causing slow downs and being stressful, we'll be pausing `/boss rush` for now till the `/stampede` is over <a:YuiNod:1059435876599484456>\n`/boss rush` will be extended accordingly <:ThumbsUp:1020442047712350298>");

        return interaction.reply("This is an event game mode, but there is currently no ongoing event.\nPlease see our </support:1011293280702578694> server for more information.");

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        db.serialize(async () => {
            await interaction.deferReply().catch((err) => {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            });

            let stats = await query(`SELECT users.id, users.class, users.coins, users.bank, users.battlechar, users.animationdelay, users.premium, users.skins, users.brbest, users.eventpts, users.eventrewreceived, users.shield_slot, characters.chars, characters.ref, users.level, characters.skin, users.equipment, dungeon.classes, dungeon.classlevels FROM users JOIN characters ON users.id = characters.id JOIN dungeon ON users.id = dungeon.id WHERE users.id = ${interaction.user.id}`);
            stats = { id: stats[0].id, class: stats[0].class, coins: stats[0].coins, bank: stats[0].bank, battlechar: stats[0].battlechar, animationdelay: stats[0].animationdelay, premium: stats[0].premium, skins: JSON.parse(stats[0].skins), brbest: stats[0].brbest, eventpts: stats[0].eventpts, eventrewreceived: stats[0].eventrewreceived, shield_slot: stats[0].shield_slot, chars: JSON.parse(stats[0].chars), ref: JSON.parse(stats[0].ref), level: stats[0].level, equipment: JSON.parse(stats[0].equipment), skin: JSON.parse(stats[0].skin), classes: JSON.parse(stats[0].classes), classlevels: JSON.parse(stats[0].classlevels) };

            if (stats.battlechar === null || !stats.chars.includes(stats.battlechar)) return interaction.editReply("You have to choose a battle character first. Use `/select <char name>` to choose one.");

            // Set up restrictions
            const cooldown = 15 * 60 * 1000;
            if (dungeonInProgress.has(stats.id)) return interaction.editReply(`You can play again in${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000) > 0 ? ` **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000)}**min` : ""} **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 1000) % 60}**s`);
            dungeonInProgress.set(stats.id, new Date().getTime() + cooldown);
            setTimeout(() => {
                dungeonInProgress.delete(stats.id);
                interaction.channel.send(`${interaction.user.toString()} is off </boss rush:1056333974814859365> cooldown!`);
            }, cooldown);

            // User stats
            let myChar = characters[stats.battlechar];
            let myStats = await getDetailedStats(myChar.id, stats, stats.classlevels);

            myStats.thumbnail = myChar.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[myChar.id], stats.skin[myChar.id]);

            myStats.sm -= myStats.mg;
            let myStatsC = { ...myStats };
            let myClass = myStats.class !== -1 ? classes[myStats.class] : false;


            let round = 0;

            let resolved = false;
            async function matchResult(r) {
                round++;
                if (r === "w" && round < 20) return newFight(); // return setTimeout(newFight, 1000);
                if (r === "l" || r === "t") round--;

                if (resolved) return;
                resolved = true;

                // Loot
                let eventpts = Math.round(round * 0.8 * (5 - Math.random()) * Math.pow(1.2, round * 0.8));
                if (eventpts > 500) eventpts = 500 + Math.floor(eventpts / 10);
                // eventpts = Math.floor(eventpts * 2);
                let loot = Math.round((2 * (10 + round * 0.8) * (5 - Math.random()) * Math.pow(1.2, round * 0.8)) / 4);
                if (loot > 400) loot = 400 + Math.floor(loot / 10);

                const { 0: reloaded } = await query(`SELECT classlevels FROM dungeon WHERE id = ${interaction.user.id}`);
                if (reloaded.classlevels) stats.classlevels = JSON.parse(reloaded.classlevels);

                // Class Level
                let cxpmsg = "You don't have a class";
                if (myClass) {
                    let boost = 1;
                    stats.classes.map((e) => classes[e].tier).forEach((e) => {
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
                    let cxp = Math.floor((1 + round - Math.random()) * boost * 15) + 5; // 7-25 -> 205-223
                    cxpmsg = `Class XP: **${cxp}** (Boost: x${boost}${new Date().getDay() === 6 || new Date().getDay() === 0 ? " weekend" : ""})`;
                    if (myClass.id in stats.classlevels) stats.classlevels[myClass.id] += cxp;
                    else stats.classlevels[myClass.id] = cxp;
                };

                // Save changes
                await query(`UPDATE users SET coins = coins + ${loot}, eventpts = eventpts + ${eventpts}, eventpts2 = eventpts2 + ${eventpts}, brbest = ${Math.max(stats.brbest, round)} WHERE id = ${interaction.user.id}`);
                await query(`UPDATE dungeon SET classlevels = '${JSON.stringify(stats.classlevels)}' WHERE id = ${interaction.user.id}`);

                // Event Rewards
                const milestones = [
                    {
                        id: 0,
                        required: 250,
                        query: `coins = coins + ${300}, sshard = sshard + ${4}`,
                        rew: "300<:coins:872926669055356939> and 4<:s_shard:917202925514817566>",
                    },
                    {
                        id: 1,
                        required: 500,
                        query: `coins = coins + ${400}, lootbox = lootbox + ${1}`,
                        rew: "400<:coins:872926669055356939> and a lootbox",
                    },
                    {
                        id: 2,
                        required: 800,
                        query: `coins = coins + ${500}, sticket = sticket + ${1}`,
                        rew: "500<:coins:872926669055356939> and 1x <:s_ticket:927642487705722890>",
                    },
                    {
                        id: 3,
                        required: 1250,
                        query: `coins = coins + ${550}, lootbox = lootbox + ${1}, sticket = sticket + ${2}`,
                        rew: "550<:coins:872926669055356939>, 2x <:s_ticket:927642487705722890> and a lootbox",
                    },
                    {
                        id: 4,
                        required: 1800,
                        query: `coins = coins + ${600}, lootbox = lootbox + ${1}, sshard = sshard + ${8}`,
                        rew: "600<:coins:872926669055356939>, 8x <:s_shard:917202925514817566> and a lootbox",
                    },
                    {
                        id: 5,
                        required: 2500,
                        query: `expulls = expulls + 1, gems = gems + 10`,
                        rew: "1x <a:EXTRA:1138530846144462968> & 10<:genesis_gems:1034179687720681492>",
                    },
                    {
                        id: 6,
                        required: 3200,
                        query: `coins = coins + ${700}, lootbox = lootbox + ${2}, sshard = sshard + ${10}`,
                        rew: "700<:coins:872926669055356939>, 10x <:s_shard:917202925514817566> and 2 lootboxes",
                    },
                    {
                        id: 7,
                        required: 3800,
                        query: `coins = coins + ${750}, sticket = sticket + ${2}`,
                        rew: "750<:coins:872926669055356939>, 2x <:s_ticket:927642487705722890>",
                    },
                    {
                        id: 8,
                        required: 4400,
                        query: `coins = coins + ${800}, lootbox = lootbox + ${2}, ssshard = ssshard + ${4}`,
                        rew: "800<:coins:872926669055356939>, 4x <:ss_shard:917203009543503892> and 2 lootboxes",
                    },
                    {
                        id: 9,
                        required: 5000,
                        query: `expulls = expulls + 1, sticket = sticket + ${3}`,
                        rew: "1x <a:EXTRA:1138530846144462968> and 3x <:s_ticket:927642487705722890>",
                    },
                    {
                        id: 10,
                        required: 6000,
                        query: `coins = coins + ${900}, lootbox = lootbox + ${1}, ssshard = ssshard + ${4}`,
                        rew: "900<:coins:872926669055356939>, 4x <:ss_shard:917203009543503892> and a lootbox",
                    },
                    {
                        id: 11,
                        required: 7250,
                        query: `coins = coins + ${1000}, ssshard = ssshard + ${6}`,
                        rew: "1000<:coins:872926669055356939>, 6x <:ss_shard:917203009543503892>",
                    },
                    {
                        id: 12,
                        required: 8500,
                        query: `coins = coins + ${1000}, sticket = sticket + ${3}`,
                        rew: "1000<:coins:872926669055356939>, 3x <:s_ticket:927642487705722890>",
                    },
                    {
                        id: 13,
                        required: 10000,
                        query: `expulls = expulls + 1, ssticket = ssticket + ${1}`,
                        rew: "1x <a:EXTRA:1138530846144462968> and 1x <:ss_ticket:927503239396622336>",
                    },
                    {
                        id: 14,
                        required: 12500,
                        query: `coins = coins + ${1200}, lootbox = lootbox + ${3}`,
                        rew: "1200<:coins:872926669055356939> and 3 lootboxes",
                    },
                    {
                        id: 15,
                        required: 15000,
                        query: `expulls = expulls + 1, ssticket = ssticket + ${1}`,
                        rew: "1x <a:EXTRA:1138530846144462968> and 1x <:ss_ticket:927503239396622336>",
                    },
                    {
                        id: 16,
                        required: 18000,
                        query: `coins = coins + ${1250}, lootbox = lootbox + ${2}, ssticket = ssticket + ${1}`,
                        rew: "1250<:coins:872926669055356939>, 1x <:ss_ticket:927503239396622336> and 2 lootboxes",
                    },
                    {
                        id: 17,
                        required: 22500,
                        query: `expulls = expulls + 1, ssticket = ssticket + ${1}`,
                        rew: "1x <a:EXTRA:1138530846144462968> and 1x <:ss_ticket:927503239396622336>",
                    },
                    {
                        id: 18,
                        required: 26000,
                        query: `lootbox = lootbox + ${6}`,
                        rew: "6 lootboxes",
                    },
                    {
                        id: 19,
                        required: 30000,
                        query: `expulls = expulls + 2`,
                        rew: "2x <a:EXTRA:1138530846144462968>",
                    },
                    {
                        id: 20,
                        required: 36000,
                        query: `coins = coins + ${1250}, gems = gems + 10, lootbox = lootbox + ${2}`,
                        rew: "1250<:coins:872926669055356939>, 10<:genesis_gems:1034179687720681492> and 2 lootboxes",
                    },
                    {
                        id: 21,
                        required: 42000,
                        query: `coins = coins + 3000, expulls = expulls + 1`,
                        rew: "1x <a:EXTRA:1138530846144462968> and 3000<:coins:872926669055356939>",
                    },
                    {
                        id: 22,
                        required: 50000,
                        query: `gems = gems + 20, lootbox = lootbox + ${3}, ssticket = ssticket + ${1}`,
                        rew: "20<:genesis_gems:1034179687720681492>, 1x <:ss_ticket:927503239396622336> and 3 lootboxes",
                    },
                    {
                        id: 23,
                        required: 60000,
                        query: `coins = coins + ${3000}, gems = gems + 10, lootbox = lootbox + ${3}, ssticket = ssticket + ${1}`,
                        rew: "3000<:coins:872926669055356939>, 10<:genesis_gems:1034179687720681492>, 1x <:ss_ticket:927503239396622336> and 3 lootboxes",
                    },
                    {
                        id: 24,
                        required: 72000,
                        query: `expulls = expulls + 1, lootbox = lootbox + ${3}, ssticket = ssticket + ${1}`,
                        rew: "1x <a:EXTRA:1138530846144462968>, 1x <:ss_ticket:927503239396622336> and 3 lootboxes",
                    },
                    {
                        id: 25,
                        required: 80000,
                        query: `ssticket = ssticket + ${2}, sticket = sticket + ${6}`,
                        rew: "2x <:ss_ticket:927503239396622336> and 6x <:s_ticket:927642487705722890>",
                    },
                    {
                        id: 26,
                        required: 100000,
                        query: `gems = gems + 20, expulls = expulls + 1`,
                        rew: "1x <a:EXTRA:1138530846144462968> and 20<:genesis_gems:1034179687720681492>",
                    },
                ];

                const Embed = new EmbedBuilder();

                let rewMessage = "";
                if (milestones[stats.eventrewreceived]) {
                    if (milestones[stats.eventrewreceived].required <= (stats.eventpts + eventpts)) {
                        await query("UPDATE users SET eventrewreceived = eventrewreceived + 1, " + milestones[stats.eventrewreceived].query + " WHERE id = " + interaction.user.id);
                        rewMessage = `\n<a:starsL:942573254730715246> You have unlocked the ${(milestones.length - 1) === milestones[stats.eventrewreceived].id ? "last" : toOrdinal(milestones[stats.eventrewreceived].id + 1)} reward! <a:starsR:942573194802511923>\nYou received ${milestones[stats.eventrewreceived].rew}!${milestones[stats.eventrewreceived + 1] ? `\nNext target: **${stats.eventpts + eventpts}**/${milestones[stats.eventrewreceived + 1].required}<:easterEgg:1095432499087278142>` : ""}`;
                        if (milestones[stats.eventrewreceived]?.image) Embed.setImage(milestones[stats.eventrewreceived].image);
                    } else {
                        rewMessage = `\nNext reward: **${stats.eventpts + eventpts}**/${milestones[stats.eventrewreceived].required}`;
                    };
                } else {
                    rewMessage = "\nYou have unlocked all rewards!";
                };

                Embed.setColor(0x69ffb9)
                    .setThumbnail(myStatsC.thumbnail)
                    .setTitle(`Boss Rush${r === "t" ? " (Time's up!)" : ""}`)
                    .setFooter({ text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" })
                    .setDescription(`<:stars_v2:917023655840591963> Round: ${round} (best: ${Math.max(stats.brbest, round)}) <:stars_v2:917023655840591963>\n<a:arrow_orange:916716747623641210> Loot: ${loot}<:coins:872926669055356939>\n<a:arrow_yellow:916716780045619200> ${cxpmsg}\n<a:arrow_white:916716862962819092> Treats: ${eventpts}<:easterEgg:1095432499087278142>\n${rewMessage}`)
                    .setFooter({ text: `Balance: ${stats.coins + loot} coins`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" });
                return Embed;
            };

            let notice = ["", "", "", "\n👑 Let the trial begin!"];

            const aDelay = stats.premium ? stats.animationdelay : 1200;

            // Buttons
            const ATK_EMOJI = myStatsC.replaceButton?.atk?.emoji || '⚔️',
                DEF_EMOJI = myStatsC.replaceButton?.def?.emoji || '🛡️',
                ABILITY_EMOJI = myStatsC.replaceButton?.ability?.emoji || '✨',
                SKILL_EMOJI = myStatsC.replaceButton?.skill?.emoji || '⚜️';

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle('Secondary'),
                    new ButtonBuilder().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle('Secondary'),
                    new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle('Secondary').setDisabled((myChar.id in abilities && "ability" in abilities[myChar.id]) ? false : true),
                    new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle('Secondary').setDisabled(myStats.class !== -1 ? false : true),
                );

            let timeout;

            async function newFight() {

                // My Stats
                let tempHP = myStatsC.hp, tempMana = myStatsC.sm + myStatsC.mg;
                myStats = await getDetailedStats(myChar.id, stats, stats.classlevels);
                myStats.hp = tempHP, myStats.sm = (tempMana > myStats.mana) ? myStats.mana : tempMana;
                myStatsC = { ...myStats };
                let myClass = myStats.class !== -1 ? classes[myStats.class] : false;

                let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : false;
                let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : false;

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
                };
                eStats.image = eImage;
                let eStatsC = { ...eStats };

                const difficulty = Avalon.getDifficulty(myStats.ep / eStats.ep);

                let buffs = Avalon.getBuffs();
                let eBuffs = Avalon.getBuffs();

                let matchStats = Avalon.getMatchStats(interaction);

                // Apply Passives
                if (skill && myChar.id !== 4767) skill._passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
                if (myAbility?.passive) myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
                if (myStats.weapon !== -1) items[myStats.weapon]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
                if (myStats.shieldid) items[myStats.shieldid]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
                if (myStats.helmet && items?.[myStats.helmet].setname === items?.[myStats.cuirass]?.setname && items?.[myStats.helmet].setname === items?.[myStats.gloves]?.setname && items?.[myStats.helmet].setname === items?.[myStats.boots]?.setname) items[myStats.boots]._buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

                let timestart = new Date().getTime();
                let result = await new Promise((resolve, rejects) => {
                    const Embed = new EmbedBuilder()
                        .setColor(0x69ffb9)
                        .setThumbnail(myStatsC.thumbnail)
                        .setFooter({ text: `Enemy EP: ${eStatsC.ep} | Round: ${round + 1} | time left: 120s` })
                        .setTitle(`Boss Rush`)
                        .setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStatsC.maxhp, eStatsC.sm / eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-4).join("")}`)
                        .setImage(eImage);
                    interaction.editReply({ embeds: [Embed], components: [row], fetchReply: true }).then(msg => {

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

                        function minionDefeated(side) {
                            if (side === "my") {
                                myStatsC = { ...matchStats.myStatsCC };
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

                        function endMatch(wORl) {
                            if (matchStats.ended) return;
                            else matchStats.ended = true;

                            atk.stop(), def.stop(), ability?.stop(), cskill?.stop();
                            if (wORl === "l") notice.push(`\n💀 **${myChar.name}** lost`);
                            else notice.push(`\n🎉 **${myChar.name}** won`);
                            editEmbed();
                            matchStats.turn = 1;
                            setTimeout(() => {
                                resolve(matchResult(wORl));
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
                                if ("atk" in myStatsC.replaceButton) {
                                    myStatsC.replaceButton.atk.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    if (matchStats.turn === 0) attack();
                                }

                                // Normal attack
                                else {
                                    dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { block: true, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
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
                                    }
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
                                } else interaction.followUp({ content: `You can use **${myChar.name}**'s ability only ${myAbility.usage === 1 ? "once" : `${myAbility.usage} times`} per fight.`, ephemeral: true });
                            };
                            // Trigger ability
                            matchStats.trigger("ability", myStatsC, eStatsC, buffs, eBuffs);
                        });

                        cskill.on('collect', async r => {

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
                                if (skill._cost > myStatsC.sm) interaction.followUp({ content: `You don't have enough mana! (**${myStatsC.sm}**/${skill._cost}${customEmojis.mana})`, ephemeral: true });
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

                        atk.on('end', async component => {
                            if (120 + Math.floor((timestart - new Date().getTime()) / 1000) < 1) {
                                atk.stop(), def.stop(), ability.stop(), cskill.stop();

                                resolve(matchResult("t"));
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