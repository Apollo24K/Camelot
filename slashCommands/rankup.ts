import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle, ChatInputCommandInteraction } from "discord.js";
import { abilities } from "../Modules/abilities";
import { classes } from "../Modules/classes";
import { curses } from "../Modules/curses";
import { rankupDummy } from "../Modules/enemies";
import { armorInfo, itemInfo, items, weaponInfo } from "../Modules/items";
import { skills } from "../Modules/skills";
import { characters } from "../Modules/chars";
import { getDetailedStats, customEmojis, dealDamage, getClassLvl, formatNumberWithQuotes, getLetterRank } from "../Modules/functions";
import { dungeonTempBan } from "../Modules/components";
import delayedBuffs from "../Modules/delayedBuffs";
import Avalon from "../Modules/avalon";
import buffInfo from "../Modules/buffs";
import _ from 'lodash';
import { CompactUserSchema, DetailedStats, SlashCommand } from '../types';
import { getUserSchema, getWeaponSchemas, updateUsers } from '../Modules/queries';

const dungeonInProgress = new Set();

const rankupButtonRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('play')
            .setLabel(`Start Exam`)
            .setStyle(ButtonStyle.Success)
    );

function rankupOverview(interaction: ChatInputCommandInteraction, stats: CompactUserSchema, userItems: itemInfo[]) {
    return new Promise((resolve) => {

        const tips = [
            "You can take the exam as many times as you want!",
        ];

        const getDesc = () => {
            return `### Rank-Up Exam`
                + `\nAfter the exam you will be assigned a rank based on your performance.`
                + `\n\n**Stats**\n**Current Rank**: ${stats.rank}\n**Highest Score**: ${stats.rankscore ? formatNumberWithQuotes(stats.rankscore) : "--"}`
                + `\n\n**Character**\n**Name**: ${characters[stats.battlechar ?? 0].name} Lvl. ${stats.level}\n**Class**: ${stats.class !== null ? classes[stats.class].name + classes[stats.class].emblem + `Lvl. ${getClassLvl(stats.class, stats.dungeon_classlevels)}` : "`None`"}\n**Equipment**: ${userItems.find((e) => e.category === "weapon" && e.type !== "shield")?.emoji ?? "<:sword_empty:1034502134474997790>"}${userItems.find((e) => e.type === "shield")?.emoji ?? "<:shield_empty:1087089686809415730>"} ${userItems.find((e) => e.type === "helmet")?.emoji ?? "<:helmet_empty:1034499888878198885>"}${userItems.find((e) => e.type === "cuirass")?.emoji ?? "<:cuirass_empty:1034499890165858305>"}${userItems.find((e) => e.type === "gloves")?.emoji ?? "<:gloves_empty:1034499892409794570>"}${userItems.find((e) => e.type === "boots")?.emoji ?? "<:boots_empty:1034499893919764480>"}`
                + `\n\n-# <:info:1131679799207796756> ${tips[Math.floor(Math.random() * tips.length)]}`;
        };

        const Embed = new EmbedBuilder()
            .setColor(0xff7d7d)
            .setThumbnail(rankupDummy.url)
            .setDescription(getDesc());
        interaction.reply({ embeds: [Embed], components: [rankupButtonRow] }).then((msg) => {
            const play = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

            play.on('collect', () => {
                if (dungeonInProgress.has(stats.id)) {
                    if (interaction.channel?.isSendable()) interaction.channel.send("You already have an exam in progress, please finish it before attempting to start a new one.");
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

const exportCommand: SlashCommand = {
    name: 'rankup',
    async execute({ interaction, author }) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        const stats = author.schema;
        if (stats.battlechar === null || !stats.chars.includes(stats.battlechar)) return interaction.editReply("You have to choose a battle character first. Use `/select <char name>` to choose one.");

        const userItemSchemas = await getWeaponSchemas([stats.equipment.weapon, stats.equipment.shield, stats.equipment.helmet, stats.equipment.cuirass, stats.equipment.gloves, stats.equipment.boots].filter((e) => e));
        const userItems = userItemSchemas.map((e) => items[e.itemid]);

        // Overview
        let start = await rankupOverview(interaction, stats, userItems);
        if (start === -1) return;


        // Set up restrictions
        if (dungeonTempBan.has(interaction.user.id)) return interaction.editReply(`You have failed to enter the captcha many times in a row.\nYou have been temporarily banned from using \`/dungeon\` for the next **${Math.ceil((dungeonTempBan.get(interaction.user.id)?.ends - Date.now()) / (60 * 1000))}** min\nYou can check how much time is left with </cd:1010317417840390158>`);
        if (dungeonInProgress.has(stats.id)) return interaction.editReply("You already have a run in progress, please finish it before attempting to start a new round.");
        dungeonInProgress.add(stats.id);
        const userTimeout = setTimeout(() => dungeonInProgress.delete(stats.id), 120000);

        // User stats
        let myChar = characters[stats.battlechar];
        let myStats = await getDetailedStats(myChar.id, stats, stats.dungeon_classlevels);

        myStats.thumbnail = myChar.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[myChar.id], stats.char_skin[myChar.id]);

        // myStats.removeDefCap = true;
        let myStatsC = { ...myStats };
        let myClass = myStats.class !== -1 ? classes[myStats.class] : undefined;
        let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : undefined;
        let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : undefined;


        // Enemy Stats
        let enemy = rankupDummy;
        const curse = curses[14];
        let eAbility: any = undefined;
        let eImage = enemy.image[Math.floor(Math.random() * enemy.image.length)];

        // Battle Scale
        const enemyScale = 0.0005 * myStatsC.hp * Math.pow((1 / 0.99895), Math.min(2192, Math.max(myStatsC.def, myStatsC.mr)));
        const enemyAtk = Math.floor((300 * enemyScale) * 1.05);

        myStatsC.delayedBuffs.push(new delayedBuffs(0, (myStats, myStatsFixed, eStats, mybuff, ebuff, char, enemy, matchStats) => {
            eStats.atk *= (1 + (matchStats.round * 0.05));
            eStats.md *= (1 + (matchStats.round * 0.05));
        }, 9999));

        let eStats: any = {
            "name": enemy.name,
            "hp": 1000000000,
            "maxhp": 1000000000,
            "atk": enemyAtk,
            "md": enemyAtk,
            "def": 660,
            "mr": 660,
            "ep": Infinity,
            "cr": 0,
            "cd": 1,
            "td": 10,
            "br": 0.12,
            "dodge": 0.1,
            "mana": 0,
            "mg": 0,
            "sm": 0,
            "rev": 0,
            "revhp": 0,
            "shield": 0,
            "mdChance": 0,
            "removeDefCap": true,
            "image": eImage,
        };
        let eStatsC = { ...eStats };

        // Some match settings
        const difficulty = Avalon.getDifficulty(myStats.ep / eStats.ep);
        const aDelay = stats.premium ? stats.animationdelay : 1200;

        // Threat Level
        let threatLevel = 3;
        if (myStats.ep / eStats.ep >= 1.25) threatLevel = 0;
        else if (myStats.ep / eStats.ep >= 0.75) threatLevel = 1;
        else if (myStats.ep / eStats.ep >= 0.5) threatLevel = 2;

        let buffs = Avalon.getBuffs();
        let eBuffs = Avalon.getBuffs();

        let resolved = false;
        async function matchResult(r: "w" | "l") {
            if (resolved) return;
            resolved = true;

            const stats = await getUserSchema(interaction.user.id);
            if (!stats) return;

            // Clear restrictions
            clearTimeout(userTimeout);
            dungeonInProgress.delete(stats.id);

            // Stats
            const damageDealt = eStatsC.maxhp - eStatsC.hp;
            const score = Math.floor(damageDealt * enemyScale * ((matchStats.round * (matchStats.round + 1)) / 80));

            // Update users table
            if (stats.rankscore < score) {
                await updateUsers(interaction.user.id, {
                    rank: { type: "set", value: getLetterRank(score) },
                    rankscore: { type: "set", value: score },
                });
            };

            return new EmbedBuilder()
                .setColor([0x6def83, 0xfac044, 0xff7d7d, 0x7c7c7c, 0xbbffff][threatLevel]) // Blue: 0x58b1ff
                .setThumbnail(myStatsC.thumbnail)
                .setTitle(`Rank-Up Exam`)
                .setDescription(`Results for **${myChar.name}**\n<a:arrow_green:916716811842621450> Score: ${formatNumberWithQuotes(score)}${score > stats.rankscore ? ` (New Record!)` : ""}\n<a:arrow_orange:916716747623641210> Rank: ${getLetterRank(score)}\n<a:arrow_red:916716702618767401> Scale: ${enemyScale.toFixed(2)}`)
                .setFooter({ text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
        };

        let matchStats = Avalon.getMatchStats(interaction);
        let notice = ["", "", "", ""];

        // Apply passives
        if (skill && myChar.id !== 4767) skill.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
        if (myAbility?.passive) await myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.weapon !== -1) (items[myStats.weapon] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.shieldid) (items[myStats.shieldid] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.helmet && (items[myStats.helmet] as armorInfo).setname === (items[myStats.cuirass] as armorInfo).setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.gloves] as armorInfo).setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.boots] as armorInfo).setname) (items[myStats.boots] as armorInfo)?.buff?.(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        const ATK_EMOJI = myStatsC.replaceButton?.atk?.emoji || '⚔️',
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
                new ButtonBuilder().setCustomId('SKIP').setEmoji(SKIP_EMOJI).setStyle(ButtonStyle.Secondary)
            );

        async function newFight() {
            let timestart = new Date().getTime();
            let result = await new Promise<EmbedBuilder | undefined>((resolve) => {
                const Embed = new EmbedBuilder()
                    .setColor([0x6def83, 0xfac044, 0xff7d7d, 0x7c7c7c, 0xbbffff][threatLevel])
                    .setThumbnail(myStatsC.thumbnail)
                    .setFooter({ text: `Enemy EP: ${eStatsC.ep} | round 1 | time left: 120s` })
                    .setTitle(`Rank-Up Exam`)
                    .setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}\\💖${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStats.hp, eStatsC.sm / eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStats.hp}\\💖${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana)}\n${Avalon.padStats(myStatsC)}`)
                    .setImage(eImage);
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
                        Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStatsC.maxhp, eStatsC.sm / eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-4).join("")}`);
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
                            Embed.setImage(eImage);
                            attack();
                        };
                    };

                    function endMatch(wORl: "w" | "l") {
                        if (matchStats.ended) return;
                        else matchStats.ended = true;

                        atk.stop(), def.stop(), skip?.stop(), ability?.stop(), cskill?.stop();
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

                    // Write passive actions if any
                    if (notice.length > 4) {
                        Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
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
                                Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                if (matchStats.turn === 0) attack();
                            }

                            // Normal attack
                            else {
                                dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });

                                // Event Triggers
                                matchStats.trigger("ATK", myStatsC, eStatsC, buffs, eBuffs);

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

                                // Event Triggers
                                matchStats.trigger("DEF", myStatsC, eStatsC, buffs, eBuffs);

                                attack();
                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            }

                        } else interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                    });

                    ability.on('collect', async () => {
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
                            } else interaction.followUp({ content: `You can use **${myChar.name}**'s ability only ${myAbility.usage == 1 ? "once" : `${myAbility.usage} times`} per fight.`, ephemeral: true });
                        };
                    });

                    cskill.on('collect', () => {

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
                            if (skill.cost > myStatsC.sm) return interaction.followUp({ content: `You don't have enough mana! (**${myStatsC.sm}**/${skill.cost}${customEmojis.mana})`, ephemeral: true });
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
                            atk.stop(), def.stop(), ability.stop(), cskill.stop(), skip.stop();
                            if (resolved) return;
                            endMatch("l");
                            editEmbed();
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
