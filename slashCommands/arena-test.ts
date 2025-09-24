import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } from "discord.js";
import { DetailedStats, SlashCommand } from '../types';
import { abilities } from "../Modules/abilities";
import { achievements } from "../Modules/achievements";
import { classes } from "../Modules/classes";
import { skills } from "../Modules/skills";
import { armorInfo, items, ringInfo, weaponInfo } from "../Modules/items";
import { characters } from "../Modules/chars";
import { dailies } from "../Modules/dailyQuests";
import { getDetailedStats, customEmojis, deleteReplyIn, dealDamage } from "../Modules/functions";
import Avalon from "../Modules/avalon";
import buffInfo from "../Modules/buffs";
import _ from 'lodash';
import { getUserSchema, updateUsers } from '../Modules/queries';
import { AbilityResponse } from '../Modules/components';

const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
        .setCustomId('1')
        .setLabel('Accept')
        .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
        .setCustomId('0')
        .setLabel('Decline')
        .setStyle(ButtonStyle.Danger),
);

//! don't change avalon.ts, buff.ts, function.ts

//? Idea: 1) Create eStats Object Copies each round and compare the differences, including status effects and buffs
//? 2) Parallel fight: 2 fights simultaneously, after an action of one player, stats get synced and the other player can act

const exportCommand: SlashCommand = {
    name: 'arena-test',
    async execute({ interaction, author }) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        const user = interaction.options.getUser('user', true);

        const stats = author.schema;
        const stats2 = await getUserSchema(user.id);
        if (!stats2) return interaction.reply(`**${user.username}** hasn't started playing yet.`);

        if (stats.battlechar === null || !stats.chars.includes(stats.battlechar)) return interaction.reply("You have to choose a battle character first. Use `/select <char name>` to choose one.");
        if (stats2.battlechar === null || !stats2.chars.includes(stats2.battlechar)) return interaction.reply(`**${user.username}** has to choose a battle character first. Use \`/select <char name>\` to choose one.`);

        if (user.id === interaction.user.id) return interaction.reply("Please don't fight yourself <:Heh:869656740667469864>");
        if (user.bot && user.id !== "706183309943767112") return interaction.reply("You can't fight bots... or.. maybe you want...");

        // Player 1 User Stats
        let p1Char = characters[stats.battlechar];
        let p1Stats = await getDetailedStats(p1Char.id, stats, stats.dungeon_classlevels);
        p1Stats.image = p1Char.image;
        let p1StatsC = { ...p1Stats };
        let p1Class = p1Stats.class !== -1 ? classes[p1Stats.class] : undefined;
        let p1Skill = p1Stats.class !== -1 ? _.cloneDeep(skills[p1Stats.class]) : undefined;
        let p1Ability = p1Char.id in abilities ? _.cloneDeep(abilities[p1Char.id]) : undefined;

        const thumbnail = p1Char.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[p1Char.id], stats.char_skin[p1Char.id]);

        // Player 1 Enemy Stats
        let e1Char = characters[stats2.battlechar];
        let e1Stats: any = {
            "name": e1Char.name,
            "hp": p1Stats.hp,
            "maxhp": p1Stats.hp,
            "atk": p1Stats.atk,
            "def": p1Stats.def,
            "ep": p1Stats.ep,
            "md": p1Stats.md,
            "mr": p1Stats.mr,
            "cr": p1Stats.cr,
            "cd": p1Stats.cd,
            "td": p1Stats.td,
            "br": p1Stats.br,
            "dodge": p1Stats.dodge,
            "mana": p1Stats.mana,
            "mg": p1Stats.mg,
            "sm": p1Stats.sm,
            "rev": p1Stats.rev,
            "revhp": p1Stats.revhp,
            "shield": p1Stats.shield,
            "mdChance": p1Stats.mdChance,
        };
        let e1Ability = p1Char.id in abilities ? _.cloneDeep(abilities[p1Char.id]) : undefined;
        let e1StatsC = { ...e1Stats };

        // Player 2 User Stats
        let p2Char = characters[stats2.battlechar];
        let p2Stats = await getDetailedStats(p2Char.id, stats2, stats2.dungeon_classlevels);
        p2Stats.image = p2Char.getImage(stats2.premium, customSettings[user.id]?.cimg[p2Char.id], stats2.char_skin[p2Char.id]);
        let p2StatsC = { ...p2Stats };
        let p2Class = p2Stats.class !== -1 ? classes[p2Stats.class] : undefined;
        let p2Skill = p2Stats.class !== -1 ? _.cloneDeep(skills[p2Stats.class]) : undefined;
        let p2Ability = p2Char.id in abilities ? _.cloneDeep(abilities[p2Char.id]) : undefined;

        // Player 2 Enemy Stats
        let e2Char = characters[stats.battlechar];
        let e2Stats: any = {
            "name": e2Char.name,
            "hp": p2Stats.hp,
            "maxhp": p2Stats.hp,
            "atk": p2Stats.atk,
            "def": p2Stats.def,
            "ep": p2Stats.ep,
            "md": p2Stats.md,
            "mr": p2Stats.mr,
            "cr": p2Stats.cr,
            "cd": p2Stats.cd,
            "td": p2Stats.td,
            "br": p2Stats.br,
            "dodge": p2Stats.dodge,
            "mana": p2Stats.mana,
            "mg": p2Stats.mg,
            "sm": p2Stats.sm,
            "rev": p2Stats.rev,
            "revhp": p2Stats.revhp,
            "shield": p2Stats.shield,
            "mdChance": p2Stats.mdChance,
        };
        let e2Ability = p2Char.id in abilities ? _.cloneDeep(abilities[p2Char.id]) : undefined;
        let e2StatsC = { ...e2Stats };

        // Player 1 Buffs
        let p1Buffs = Avalon.getBuffs();

        // Player 2 Buffs
        let p2Buffs = Avalon.getBuffs();

        // Player 1 Enemy Buffs
        let e1Buffs = Avalon.getBuffs();

        // Player 2 Enemy Buffs
        let e2Buffs = Avalon.getBuffs();

        const aDelay = stats.premium ? stats.animationdelay : 1200;

        let resolved = false;
        async function matchResult(r: "w" | "l") {
            if (resolved) return;
            resolved = true;

            if (!stats2) return;

            const EmbedR = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(`Battle Arena`);
            if (r === "w") {
                // Update users table
                await updateUsers(interaction.user.id, { arenawins: { type: "increment", value: 1 } });
                await updateUsers(user.id, { arenalosses: { type: "increment", value: 1 } });

                EmbedR.setDescription(`<:stars_v2:917023655840591963> **${interaction.user.username}** won! <:stars_v2:917023655840591963>\nBetter luck next time ${user.username}.`).setThumbnail(thumbnail).setFooter({ text: `Total wins: ${stats.arenawins + 1}`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });

                // Achievements
                achievements[39].check(interaction, interaction.user, p1StatsC.hp), achievements[40].check(interaction, interaction.user, p1StatsC.hp), achievements[41].check(interaction, interaction.user, p1StatsC.hp); // Under Pressure
                achievements[6].check(interaction), achievements[7].check(interaction), achievements[8].check(interaction); // Champion
            };
            if (r === "l") {
                await updateUsers(interaction.user.id, { arenalosses: { type: "increment", value: 1 } });
                await updateUsers(user.id, { arenawins: { type: "increment", value: 1 } });

                EmbedR.setDescription(`<:stars_v2:917023655840591963> **${user.username}** won! <:stars_v2:917023655840591963>\nBetter luck next time ${interaction.user.username}.`).setThumbnail(p2Stats.image).setFooter({ text: `Total wins: ${stats2.arenawins + 1}`, iconURL: user.displayAvatarURL({ size: 512 }) });

                // Achievements
                achievements[39].check(interaction, user, p2StatsC.hp), achievements[40].check(interaction, user, p2StatsC.hp), achievements[41].check(interaction, user, p2StatsC.hp); // Under Pressure
                achievements[6].check(interaction, user), achievements[7].check(interaction, user), achievements[8].check(interaction, user); // Champion
            };

            // Daily Quests
            dailies[3].update(interaction), dailies[3].update(interaction, 1, user); // Contender

            return EmbedR;
        };

        let matchStats = Avalon.getMatchStats(interaction, { turnSkill: 1 });
        let matchStats2 = Avalon.getMatchStats(interaction);
        let notice = ["", "", "", ""];

        let ATK_EMOJI = '⚔️', DEF_EMOJI = '🛡️', ABILITY_EMOJI = '✨', SKILL_EMOJI = '⚜️';
        if (new Date().getMonth() === 11) ATK_EMOJI = '<:sw:1030154812496560218>', DEF_EMOJI = '<:sh:1030154814652420127>', ABILITY_EMOJI = '<:sp:1030154816288198768>', SKILL_EMOJI = '<:fl:1030154818746069012>';

        // Buttons
        let atkButton = new ButtonBuilder().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle(ButtonStyle.Secondary);
        let defButton = new ButtonBuilder().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle(ButtonStyle.Secondary);
        let abilityButton = new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled(true);
        let skillButton = new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled(true);

        if ((p1Ability && "ability" in p1Ability) || (p2Ability && "ability" in p2Ability)) abilityButton.setDisabled(false);
        if (p1Stats.class !== -1 || p2Stats.class !== -1) skillButton.setDisabled(false);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(atkButton, defButton, abilityButton, skillButton);

        // Player 1
        if (p1Skill && p1Char.id !== 4767 && p2Char.id !== 4767) await p1Skill.passive(p1StatsC, p2StatsC, p1Buffs, p2Buffs, p1Char, p2Char, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
        if (p1Ability?.passive && p2Char.id !== 4767) await p1Ability.passive(p1StatsC, p1Stats, p2StatsC, p1Buffs, p2Buffs, p1Char, p2Char, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (p1Stats.weapon !== -1) await (items[p1Stats.weapon] as weaponInfo).buff(p1StatsC, p1Stats, p2StatsC, p1Buffs, p2Buffs, p1Char, p2Char, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (p1Stats.shieldid) await (items[p1Stats.shieldid] as weaponInfo).buff(p1StatsC, p1Stats, p2StatsC, p1Buffs, p2Buffs, p1Char, p2Char, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (p1Stats.helmet && (items[p1Stats.helmet] as armorInfo).setname === (items[p2Stats.cuirass] as armorInfo)?.setname && (items[p1Stats.helmet] as armorInfo).setname === (items[p1Stats.gloves] as armorInfo)?.setname && (items[p1Stats.helmet] as armorInfo).setname === (items[p1Stats.boots] as armorInfo)?.setname) await (items[p1Stats.boots] as armorInfo)?.buff?.(p1StatsC, p1Stats, p2StatsC, p1Buffs, p2Buffs, p1Char, p2Char, matchStats, notice, new EmbedBuilder(), interaction.user);

        if (p1Stats.ring1) await (items[p1Stats.ring1] as ringInfo).getBuff(p1Stats.ring1info?.level)(p1StatsC, p1Stats, p2StatsC, p1Buffs, p2Buffs, p1Char, p2Char, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (p1Stats.ring2) await (items[p1Stats.ring2] as ringInfo).getBuff(p1Stats.ring2info?.level)(p1StatsC, p1Stats, p2StatsC, p1Buffs, p2Buffs, p1Char, p2Char, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (p1Stats.ring3) await (items[p1Stats.ring3] as ringInfo).getBuff(p1Stats.ring3info?.level)(p1StatsC, p1Stats, p2StatsC, p1Buffs, p2Buffs, p1Char, p2Char, matchStats, notice, new EmbedBuilder(), interaction.user);

        // Player 2
        if (p2Skill && p1Char.id !== 4767 && p2Char.id !== 4767) await p2Skill.passive(p2StatsC, p1StatsC, p2Buffs, p1Buffs, p2Char, p1Char, matchStats2, notice, new EmbedBuilder(), user, interaction.commandName);
        if (p2Ability?.passive && p1Char.id !== 4767) await p2Ability.passive(p2StatsC, p2Stats, p1StatsC, p2Buffs, p1Buffs, p2Char, p1Char, matchStats2, notice, new EmbedBuilder(), user);
        if (p2Stats.weapon !== -1) await (items[p2Stats.weapon] as weaponInfo).buff(p2StatsC, p2Stats, p1StatsC, p2Buffs, p1Buffs, p2Char, p1Char, matchStats2, notice, new EmbedBuilder(), user);
        if (p2Stats.shieldid) await (items[p2Stats.shieldid] as weaponInfo).buff(p2StatsC, p2Stats, p1StatsC, p2Buffs, p1Buffs, p2Char, p1Char, matchStats2, notice, new EmbedBuilder(), user);
        if (p2Stats.helmet && (items[p2Stats.helmet] as armorInfo).setname === (items[p2Stats.cuirass] as armorInfo)?.setname && (items[p2Stats.helmet] as armorInfo).setname === (items[p2Stats.gloves] as armorInfo)?.setname && (items[p2Stats.helmet] as armorInfo).setname === (items[p2Stats.boots] as armorInfo)?.setname) await (items[p2Stats.boots] as armorInfo)?.buff?.(p2StatsC, p2Stats, p1StatsC, p2Buffs, p1Buffs, p2Char, p1Char, matchStats2, notice, new EmbedBuilder(), user);

        if (p2Stats.ring1) await (items[p2Stats.ring1] as ringInfo).getBuff(p2Stats.ring1info?.level)(p2StatsC, p2Stats, p1StatsC, p2Buffs, p1Buffs, p2Char, p1Char, matchStats2, notice, new EmbedBuilder(), user);
        if (p2Stats.ring2) await (items[p2Stats.ring2] as ringInfo).getBuff(p2Stats.ring2info?.level)(p2StatsC, p2Stats, p1StatsC, p2Buffs, p1Buffs, p2Char, p1Char, matchStats2, notice, new EmbedBuilder(), user);
        if (p2Stats.ring3) await (items[p2Stats.ring3] as ringInfo).getBuff(p2Stats.ring3info?.level)(p2StatsC, p2Stats, p1StatsC, p2Buffs, p1Buffs, p2Char, p1Char, matchStats2, notice, new EmbedBuilder(), user);

        async function newFight() {
            let timestart = new Date().getTime();
            let result = await new Promise<EmbedBuilder | undefined>((resolve) => {
                const Embed = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setImage(p2Stats.image)
                    .setThumbnail(thumbnail)
                    .setTitle(`Battle Arena`)
                    .setDescription(`You challenged ${user.username} to a match\nIt's **${p1Char.name}** vs **${p2Char.name}**!\n\n${p2Class ? p2Class.emblem : ""}${p2Char.name}'s Stats (**${p2StatsC.hp}**/${p2Stats.hp}${customEmojis.hp}${p2StatsC.shield > 0 ? `+ **${p2StatsC.shield}** ${customEmojis["shield"]}` : ""}, **${p2StatsC.sm}**/${p2StatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(p2StatsC.hp / p2Stats.hp, p2StatsC.sm / p2StatsC.mana)}\n${Avalon.padStats(p2StatsC)}\n-----------------------------------\n${p1Class ? p1Class.emblem : ""}${p1Char.name}'s Stats (**${p1StatsC.hp}**/${p1Stats.hp}${customEmojis.hp}${p1StatsC.shield > 0 ? `+ **${p1StatsC.shield}** ${customEmojis["shield"]}` : ""}, **${p1StatsC.sm}**/${p1StatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(p1StatsC.hp / p1Stats.hp, p1Stats.sm / p1StatsC.mana)}\n${Avalon.padStats(p1StatsC)}`)
                    .setFooter({ text: `Turn: ${user.username} | time left: 120s` });
                if (interaction.channel?.isSendable()) interaction.channel.send({ embeds: [Embed], components: [row] }).then(msg => {

                    const atk = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ATK", componentType: ComponentType.Button, time: 120000 });
                    const def = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "DEF", componentType: ComponentType.Button, time: 120000 });
                    const ability = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ABILITY", componentType: ComponentType.Button, time: 120000 });
                    const cskill = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKILL", componentType: ComponentType.Button, time: 120000 });
                    const atk2 = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "ATK", componentType: ComponentType.Button, time: 120000 });
                    const def2 = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "DEF", componentType: ComponentType.Button, time: 120000 });
                    const ability2 = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "ABILITY", componentType: ComponentType.Button, time: 120000 });
                    const cskill2 = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "SKILL", componentType: ComponentType.Button, time: 120000 });

                    function editEmbed() {
                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${p1Char.name}** vs **${p2Char.name}**!\n\n${p2Class ? p2Class.emblem : ""}${p2Char.name}'s Stats (**${p2StatsC.hp}**/${p2Stats.hp}${customEmojis.hp}${p2StatsC.shield > 0 ? `+ **${p2StatsC.shield}** ${customEmojis["shield"]}` : ""}, **${p2StatsC.sm}**/${p2StatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(p2StatsC.hp / p2Stats.hp, p2StatsC.sm / p2StatsC.mana)}\n${Avalon.padStats(p2StatsC)}\n-----------------------------------\n${p1Class ? p1Class.emblem : ""}${p1Char.name}'s Stats (**${p1StatsC.hp}**/${p1Stats.hp}${customEmojis.hp}${p1StatsC.shield > 0 ? `+ **${p1StatsC.shield}** ${customEmojis["shield"]}` : ""}, **${p1StatsC.sm}**/${p1StatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(p1StatsC.hp / p1Stats.hp, p1StatsC.sm / p1StatsC.mana)}\n${Avalon.padStats(p1StatsC)}\n-----------------------------------${notice.slice(-4).join("")}`);
                        Embed.setFooter({ text: `Turn: ${matchStats.turn === 1 ? user.username : interaction.user.username} | time left: ${120 + Math.floor((timestart - new Date().getTime()) / 1000)}s` });
                        msg.edit({ embeds: [Embed] });
                    };

                    //TODO: Check this function for matchStats2
                    function minionDefeated(side: "p1" | "p2") {
                        if (side === "p1") {
                            p1StatsC = { ...matchStats.myStatsCC } as DetailedStats;
                            matchStats.currentCharacter = 0;
                            Embed.setThumbnail(thumbnail);
                            startNextRound();
                        } else {
                            p2StatsC = { ...matchStats.eStatsCC } as DetailedStats;
                            matchStats.currentOpponent = 0;
                            Embed.setImage(p2Stats.image);
                            matchStats.turn = 1;
                        };
                    };

                    function endMatch(wORl: "w" | "l") {
                        if (matchStats.ended) return;
                        else matchStats.ended = true;

                        atk.stop(), def.stop(), ability?.stop(), cskill?.stop();
                        atk2.stop(), def2.stop(), ability2?.stop(), cskill2?.stop();
                        if (wORl === "l") notice.push(`\n🎉 **${p2Char.name}** won`);
                        else notice.push(`\n🎉 **${p1Char.name}** won`);
                        editEmbed();
                        matchStats.turn = 1;
                        resolve(matchResult(wORl));
                    };

                    function startNextRound() {

                        if (matchStats.ended) return;
                        if (matchStats.round === matchStats.roundCheck) return;
                        matchStats.roundCheck = matchStats.round;
                        if (matchStats.currentCharacter || matchStats.currentOpponent || matchStats2.currentCharacter) return;
                        matchStats2.round = matchStats.round - 1;

                        // Consume Mana
                        Avalon.consumeActiveMana(matchStats, p1StatsC, p1Buffs, p1Char, notice, Embed, thumbnail);
                        Avalon.consumeActiveMana(matchStats, p2StatsC, p2Buffs, p2Char, notice, Embed, p2Stats.image);

                        // Reset Buffs
                        if (matchStats.currentCharacter === 0) p1StatsC.atk = p1Stats.atk, p1StatsC.md = p1Stats.atk, p1StatsC.def = p1Stats.def, p1StatsC.mr = p1Stats.mr, p1StatsC.cd = p1Stats.cd, p1StatsC.cr = p1Stats.cr, p1StatsC.dodge = p1Stats.dodge, p1StatsC.br = p1Stats.br, p1StatsC.mg = p1Stats.mg;
                        if (matchStats.currentOpponent === 0) p2StatsC.atk = p2Stats.atk, p2StatsC.md = p2Stats.atk, p2StatsC.def = p2Stats.def, p2StatsC.mr = p2Stats.mr, p2StatsC.cd = p2Stats.cd, p2StatsC.cr = p2Stats.cr, p2StatsC.dodge = p2Stats.dodge, p2StatsC.br = p2Stats.br, p2StatsC.mg = p2Stats.mg;

                        // Apply Buffs
                        if (matchStats.currentCharacter === 0) Avalon.applyBuffs(p1StatsC, p2StatsC, p1Buffs, p2Buffs, matchStats, notice);
                        if (matchStats.currentOpponent === 0) Avalon.applyBuffs(p2StatsC, p1StatsC, p2Buffs, p1Buffs, matchStats, notice);

                        // Fix Stats
                        if (p1StatsC.hp > p1StatsC.maxhp) p1StatsC.hp = p1StatsC.maxhp;
                        else if (p1StatsC.hp < 0) p1StatsC.hp = 0;
                        else p1StatsC.hp = Math.floor(p1StatsC.hp);
                        if (p2StatsC.hp > p2StatsC.maxhp) p2StatsC.hp = p2StatsC.maxhp;
                        else if (p2StatsC.hp < 0) p2StatsC.hp = 0;
                        else p2StatsC.hp = Math.floor(p2StatsC.hp);

                        // Check and run delayed buffs
                        if (matchStats.currentCharacter === 0) {
                            for (let i = p1StatsC.delayedBuffs.length - 1; i >= 0; i--) {
                                if (p1StatsC.delayedBuffs[i].round <= matchStats.round) {
                                    p1StatsC.delayedBuffs[i].run(p1StatsC, p1Stats, p2StatsC, p1Buffs, p2Buffs, p1Char, p2Char, matchStats, notice, Embed, interaction.user);
                                    if (p1StatsC.delayedBuffs[i].last <= 1 || p1StatsC.delayedBuffs[i].used >= p1StatsC.delayedBuffs[i].usage) {
                                        p1StatsC.delayedBuffs.splice(i, 1);
                                    } else {
                                        p1StatsC.delayedBuffs[i].decrement();
                                    };
                                };
                            };
                        };
                        if (matchStats.currentOpponent === 0) {
                            for (let i = p2StatsC.delayedBuffs.length - 1; i >= 0; i--) {
                                if (p2StatsC.delayedBuffs[i].round <= matchStats.round) {
                                    p2StatsC.delayedBuffs[i].run(p2StatsC, p2Stats, p1StatsC, p2Buffs, p1Buffs, p2Char, p1Char, matchStats2, notice, Embed, user);
                                    if (p2StatsC.delayedBuffs[i].last <= 1 || p2StatsC.delayedBuffs[i].used >= p2StatsC.delayedBuffs[i].usage) {
                                        p2StatsC.delayedBuffs.splice(i, 1);
                                    } else {
                                        p2StatsC.delayedBuffs[i].decrement();
                                    };
                                };
                            };
                        };
                        Avalon.checkIfEnded(p1StatsC, p2StatsC, p1Buffs, p2Buffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                    };

                    function statComparison() {



                    };

                    if (notice.length > 4) {
                        Avalon.checkIfEnded(p1StatsC, p2StatsC, p1Buffs, p2Buffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                        editEmbed();
                    };

                });
            });

            if (result && interaction.channel?.isSendable()) interaction.channel.send({ embeds: [result] });
        };

        interaction.reply({ content: `<@${user.id}> ${interaction.user.username} challenges you to a battle. Do you accept?`, components: [row2] }).then(msg2 => {
            const collector = msg2.createMessageComponentCollector({ filter: (r) => ((r.user.id === user.id) || (r.user.id === interaction.user.id)), componentType: ComponentType.Button, time: 30000 });

            collector.on('collect', async r => {
                if ((r.customId === "1") && (r.user.id === interaction.user.id)) return;
                collector.stop();

                if (r.customId === "1") newFight();
                else if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
            });
        });
    },
};

export default exportCommand;