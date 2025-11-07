import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } from "discord.js";
import { DetailedStats, SlashCommand } from '../types';
import { abilities, Ability } from "../Modules/abilities";
import { achievements } from "../Modules/achievements";
import { classes } from "../Modules/classes";
import { skills } from "../Modules/skills";
import { armorInfo, items, ringInfo, runeInfo, weaponInfo } from "../Modules/items";
import { characters } from "../Modules/chars";
import { dailies } from "../Modules/dailyQuests";
import { getDetailedStats, customEmojis, deleteReplyIn, dealDamage, getRefinement } from "../Modules/functions";
import Avalon from "../Modules/avalon";
import buffInfo from "../Modules/buffs";
import _ from 'lodash';
import { getUserSchema, updateUsers } from '../Modules/queries';
import { AbilityResponse, OfferRow } from '../Modules/components';
import { customHpBars } from '../Modules/customHpBars';

const exportCommand: SlashCommand = {
    name: 'arena',
    async execute({ interaction, author }) {

        const user = interaction.options.getUser('user', true);

        const settingsTimer = interaction.options.getInteger('timer') || 240;
        if (settingsTimer > 600) return interaction.reply(`The timer has to be under 10 minutes!`);

        const settingsRounds = interaction.options.getInteger('rounds') || 0;
        if (settingsRounds < 0) return interaction.reply(`The rounds have to be at least 0!`);

        // const settingsCharLevelP1 = interaction.options.getInteger('challenger-character-level');
        // const settingsCharLevelP2 = interaction.options.getInteger('against-character-level');
        //const settingsClassLevelP1 = interaction.options.getInteger('challenger-class-level');
        // const settingsClassLevelP2 = interaction.options.getInteger('against-class-level');

        const stats = author.schema;
        const stats2 = await getUserSchema(user.id);
        if (!stats2) return interaction.reply(`**${user.username}** hasn't started playing yet.`);

        if (stats.battlechar === null || !stats.chars.includes(stats.battlechar)) return interaction.reply("You have to choose a battle character first. Use `/select <char name>` to choose one.");
        if (stats2.battlechar === null || !stats2.chars.includes(stats2.battlechar)) return interaction.reply(`**${user.username}** has to choose a battle character first. Use \`/select <char name>\` to choose one.`);

        if (user.id === interaction.user.id) return interaction.reply("Please don't fight yourself <:Heh:869656740667469864>");
        if (user.bot && user.id !== "706183309943767112") return interaction.reply("You can't fight bots... or.. maybe you want...");

        // User stats
        let myChar = characters[stats.battlechar];
        let myStats = await getDetailedStats(myChar.id, stats, stats.dungeon_classlevels);
        myStats.image = myChar.image;
        let myStatsC = { ...myStats };
        let myClass = myStats.class !== -1 ? classes[myStats.class] : undefined;
        let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : undefined;
        let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : undefined;

        if (myStats.rune) {
            const rune = items[parseInt(myStats.rune)];
            if (rune instanceof runeInfo) {
                if (myAbility === undefined) myAbility = rune.ability as Ability;
                else myAbility = { ...myAbility, ..._.cloneDeep(rune.ability) };
            };
        };

        const thumbnail = myChar.getImage(stats.premium, stats.custom_skins[myChar.id], stats.char_skin[myChar.id]);

        // Enemy Stats
        let enemy = characters[stats2.battlechar];
        let eStats = await getDetailedStats(enemy.id, stats2, stats2.dungeon_classlevels);
        eStats.image = enemy.getImage(stats2.premium, stats2.custom_skins[enemy.id], stats2.char_skin[enemy.id]);
        let eStatsC = { ...eStats };
        let eClass = eStats.class !== -1 ? classes[eStats.class] : undefined;
        let eSkill = eStats.class !== -1 ? _.cloneDeep(skills[eStats.class]) : undefined;
        let eAbility = enemy.id in abilities ? _.cloneDeep(abilities[enemy.id]) : undefined;

        if (eStats.rune) {
            const rune = items[parseInt(eStats.rune)];
            if (rune instanceof runeInfo) {
                if (eAbility === undefined) eAbility = rune.ability as Ability;
                else eAbility = { ...eAbility, ..._.cloneDeep(rune.ability) };
            };
        };

        let buffs = Avalon.getBuffs();
        let eBuffs = Avalon.getBuffs();

        // Random HP Bar
        if (stats.user_settings.random_hp_bar && stats.hpbars.length > 0) {
            stats.hpbar = [null, ...stats.hpbars][Math.floor(Math.random() * (stats.hpbars.length + 1))];
        };
        if (stats2.user_settings.random_hp_bar && stats2.hpbars.length > 0) {
            stats2.hpbar = [null, ...stats2.hpbars][Math.floor(Math.random() * (stats2.hpbars.length + 1))];
        };

        const randBar = [stats.hpbar, stats2.hpbar].sort((a, b) => Math.random() - 0.5).reduce((a, b) => a || b, null);
        const embedColor = randBar === null ? 0xbbffff : customHpBars[randBar].color;

        const aDelay = stats.premium ? stats.animationdelay : 1200;

        let resolved = false;
        let streakChanged = false;
        async function matchResult(r: "w" | "l") {
            if (resolved) return;
            resolved = true;

            if (!stats2) return;

            const EmbedR = new EmbedBuilder()
                .setColor(embedColor)
                .setThumbnail((r === "l" ? eStats.image : myStatsC.image));
            if (r === "l") {
                await updateUsers(interaction.user.id, { arenalosses: { type: "increment", value: 1 }, arenastreak: { type: "set", value: 0 } });
                await updateUsers(user.id, { arenawins: { type: "increment", value: 1 }, arenastreak: { type: "increment", value: 1 } });

                if (stats2.arenastreak + 1 > stats2.arenastreakhighest) {
                    await updateUsers(user.id, { arenastreakhighest: { type: "set", value: stats2.arenastreak } });
                    streakChanged = true;
                }

                EmbedR.setDescription(
                    `## <:victory:1432012219066875996> **${enemy.name}** won the arena!\n\n` +
                    `<a:arrow_green_upwards:1431966637220954193> New Streak: ${stats2.arenastreak + 1} ${streakChanged ? `(Personal high!)` : ""} | Win Rate: ${Math.round((stats2.arenawins / (stats2.arenawins + stats2.arenalosses)) * 100)}%\n` +
                    `<a:arrow_red_downwards:1431966642866225183> Final Streak: ${stats.arenastreak} | Win Rate: ${Math.round((stats.arenawins / (stats.arenawins + stats.arenalosses)) * 100)}%\n` +
                    `════════════════════\n` +
                    `<:WorryLuminous:1431976105627226112> Looking for ways to boost your prowess?\n` +
                    `-# * Raise your character/ class levels\n` +
                    `-# * Equip synergistic and levelled weapons/ armor\n` +
                    `-# * Check out FAQ/ Community Builds`
                );

                // Achievements
                achievements[39].check(interaction, user, eStatsC.hp), achievements[40].check(interaction, user, eStatsC.hp), achievements[41].check(interaction, user, eStatsC.hp); // Under Pressure
                achievements[6].check(interaction, user), achievements[7].check(interaction, user), achievements[8].check(interaction, user); // Champion
            } if (r === "w") {
                await updateUsers(interaction.user.id, { arenawins: { type: "increment", value: 1 }, arenastreak: { type: "increment", value: 1 } });
                await updateUsers(user.id, { arenalosses: { type: "increment", value: 1 }, arenastreak: { type: "set", value: 0 } });

                if (stats.arenastreak > stats.arenastreakhighest) {
                    await updateUsers(interaction.user.id, { arenastreakhighest: { type: "set", value: stats.arenastreak } });
                    streakChanged = true;
                }

                EmbedR.setDescription(
                    `## <:victory:1432012219066875996> **${myChar.name}** won the arena!\n\n` +
                    `<a:arrow_green_upwards:1431966637220954193> New Streak: ${stats.arenastreak + 1} ${streakChanged ? `(Personal high!)` : ""} | Win Rate: ${Math.round((stats.arenawins / (stats.arenawins + stats.arenalosses)) * 100)}%\n` +
                    `<a:arrow_red_downwards:1431966642866225183> Final Streak: ${stats2.arenastreak} | Win Rate: ${Math.round((stats2.arenawins / (stats2.arenawins + stats2.arenalosses)) * 100)}%\n` +
                    `════════════════════\n` +
                    `<:WorryLuminous:1431976105627226112> Looking for ways to boost your prowess?\n` +
                    `-# * Raise your character/ class levels\n` +
                    `-# * Equip synergistic and levelled weapons/ armor\n` +
                    `-# * Check out FAQ/ Community Builds`
                );

                // Achievements
                achievements[39].check(interaction, interaction.user, myStatsC.hp), achievements[40].check(interaction, interaction.user, myStatsC.hp), achievements[41].check(interaction, interaction.user, myStatsC.hp); // Under Pressure
                achievements[6].check(interaction), achievements[7].check(interaction), achievements[8].check(interaction); // Champion
            }

            // Daily Quests
            dailies[3].update(interaction), dailies[3].update(interaction, 1, user); // Contender

            return EmbedR;
        };

        let matchStats = Avalon.getMatchStats(interaction, { turnSkill: 1 });
        let notice = ["", "", "", ""];

        // Player 1
        if (skill && myChar.id !== 4767 && enemy.id !== 4767) await skill.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
        if (myAbility?.passive && enemy.id !== 4767) await myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.weapon !== -1) await (items[myStats.weapon] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.shieldid) await (items[myStats.shieldid] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.helmet && (items[myStats.helmet] as armorInfo).setname === (items[myStats.cuirass] as armorInfo)?.setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.gloves] as armorInfo)?.setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.boots] as armorInfo)?.setname) await (items[myStats.boots] as armorInfo)?.buff?.(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        if (myStats.rune) await (items[parseInt(myStats.rune)] as runeInfo)?.buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        if (myStats.ring1) await (items[myStats.ring1] as ringInfo).getBuff(myStats.ring1info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.ring2) await (items[myStats.ring2] as ringInfo).getBuff(myStats.ring2info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.ring3) await (items[myStats.ring3] as ringInfo).getBuff(myStats.ring3info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        // Player 2
        if (eSkill && myChar.id !== 4767 && enemy.id !== 4767) await eSkill.passive(eStatsC, myStatsC, eBuffs, buffs, enemy, myChar, matchStats, notice, new EmbedBuilder(), user, interaction.commandName);
        if (eAbility?.passive && myChar.id !== 4767) await eAbility.passive(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats, notice, new EmbedBuilder(), user);
        if (eStats.weapon !== -1) await (items[eStats.weapon] as weaponInfo).buff(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats, notice, new EmbedBuilder(), user);
        if (eStats.shieldid) await (items[eStats.shieldid] as weaponInfo).buff(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats, notice, new EmbedBuilder(), user);
        if (eStats.helmet && (items[eStats.helmet] as armorInfo).setname === (items[eStats.cuirass] as armorInfo)?.setname && (items[eStats.helmet] as armorInfo).setname === (items[eStats.gloves] as armorInfo)?.setname && (items[eStats.helmet] as armorInfo).setname === (items[eStats.boots] as armorInfo)?.setname) await (items[eStats.boots] as armorInfo)?.buff?.(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats, notice, new EmbedBuilder(), user);

        if (eStats.rune) await (items[parseInt(eStats.rune)] as runeInfo)?.buff(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats, notice, new EmbedBuilder(), user);

        if (eStats.ring1) await (items[eStats.ring1] as ringInfo).getBuff(eStats.ring1info?.level)(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats, notice, new EmbedBuilder(), user);
        if (eStats.ring2) await (items[eStats.ring2] as ringInfo).getBuff(eStats.ring2info?.level)(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats, notice, new EmbedBuilder(), user);
        if (eStats.ring3) await (items[eStats.ring3] as ringInfo).getBuff(eStats.ring3info?.level)(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats, notice, new EmbedBuilder(), user);

        matchStats.player1 = myStatsC, matchStats.player2 = eStatsC;

        let ATK_EMOJI1 = myStatsC.replaceButton?.atk?.emoji || '⚔️',
            DEF_EMOJI1 = myStatsC.replaceButton?.def?.emoji || '🛡️',
            ABILITY_EMOJI1 = myStatsC.replaceButton?.ability?.emoji || '✨',
            SKILL_EMOJI1 = myStatsC.replaceButton?.cskill?.emoji || '⚜️',
            SKIP_EMOJI1 = myStatsC.replaceButton?.skip?.emoji || '⏩';

        let ATK_EMOJI2 = eStatsC.replaceButton?.atk?.emoji || '⚔️',
            DEF_EMOJI2 = eStatsC.replaceButton?.def?.emoji || '🛡️',
            ABILITY_EMOJI2 = eStatsC.replaceButton?.ability?.emoji || '✨',
            SKILL_EMOJI2 = eStatsC.replaceButton?.cskill?.emoji || '⚜️',
            SKIP_EMOJI2 = eStatsC.replaceButton?.skip?.emoji || '⏩';

        //? What for?
        if (new Date().getMonth() === 11) ATK_EMOJI1 = '<:sw:1030154812496560218>', DEF_EMOJI1 = '<:sh:1030154814652420127>', ABILITY_EMOJI1 = '<:sp:1030154816288198768>', SKILL_EMOJI1 = '<:fl:1030154818746069012>';

        // Buttons
        let atkButton = new ButtonBuilder().setCustomId('ATK').setEmoji(ATK_EMOJI2).setStyle(ButtonStyle.Secondary);
        let defButton = new ButtonBuilder().setCustomId('DEF').setEmoji(DEF_EMOJI2).setStyle(ButtonStyle.Secondary);
        let abilityButton = new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI2).setStyle(ButtonStyle.Secondary).setDisabled(true);
        let skillButton = new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI2).setStyle(ButtonStyle.Secondary).setDisabled(true);
        let skipButton = new ButtonBuilder().setCustomId('SKIP').setEmoji(SKIP_EMOJI2).setStyle(ButtonStyle.Secondary);

        if ((myAbility && "ability" in myAbility) || (eAbility && "ability" in eAbility)) abilityButton.setDisabled(false);
        if (myStats.class !== -1 || eStats.class !== -1) skillButton.setDisabled(false);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(atkButton, defButton, abilityButton, skillButton, skipButton);

        async function newFight() {
            let timestart = new Date().getTime();
            let result = await new Promise<EmbedBuilder | undefined>((resolve) => {
                const Embed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setImage(eStats.image)
                    .setThumbnail(thumbnail)
                    .setTitle(`⚔️ Battle Arena ⚔️`)
                    .setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${enemy.name}**!\n\n${eClass ? eClass.emblem : ""}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}${customEmojis.hp}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStats.hp, eStatsC.sm / eStatsC.mana, stats2?.hpbar)}\n${Avalon.padStats(eStatsC)}\n-----------------------------------\n${myClass ? myClass.emblem : ""}${myChar.name}'s Stats (**${myStatsC.hp}**/${myStats.hp}${customEmojis.hp}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStats.hp, myStatsC.sm / myStatsC.mana, stats.hpbar)}\n${Avalon.padStats(myStatsC)}`)
                    .setFooter({ text: `Turn: ${user.username} | round 1 | time left: ${settingsTimer}s` });
                if (interaction.channel?.isSendable()) interaction.channel.send({ embeds: [Embed], components: [row] }).then(msg => {

                    const atk = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ATK", componentType: ComponentType.Button, time: settingsTimer * 1000 });
                    const def = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "DEF", componentType: ComponentType.Button, time: settingsTimer * 1000 });
                    const ability = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ABILITY", componentType: ComponentType.Button, time: settingsTimer * 1000 });
                    const cskill = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKILL", componentType: ComponentType.Button, time: settingsTimer * 1000 });
                    const skip = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKIP", componentType: ComponentType.Button, time: settingsTimer * 1000 });
                    const atk2 = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "ATK", componentType: ComponentType.Button, time: settingsTimer * 1000 });
                    const def2 = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "DEF", componentType: ComponentType.Button, time: settingsTimer * 1000 });
                    const ability2 = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "ABILITY", componentType: ComponentType.Button, time: settingsTimer * 1000 });
                    const cskill2 = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "SKILL", componentType: ComponentType.Button, time: settingsTimer * 1000 });
                    const skip2 = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "SKIP", componentType: ComponentType.Button, time: settingsTimer * 1000 });


                    function editEmbed() {
                        if (matchStats.turn === 0) {
                            row.components[0].setEmoji(ATK_EMOJI1);
                            row.components[1].setEmoji(DEF_EMOJI1);
                            row.components[2].setEmoji(ABILITY_EMOJI1);
                            row.components[3].setEmoji(SKILL_EMOJI1);
                            row.components[4].setEmoji(SKIP_EMOJI1);
                        } else {
                            row.components[0].setEmoji(ATK_EMOJI2);
                            row.components[1].setEmoji(DEF_EMOJI2);
                            row.components[2].setEmoji(ABILITY_EMOJI2);
                            row.components[3].setEmoji(SKILL_EMOJI2);
                            row.components[4].setEmoji(SKIP_EMOJI2);
                        }
                        Embed.setDescription(`You challenged ${user.username} to a match\nIt's **${myChar.name}** vs **${enemy.name}**!\n\n${eClass ? eClass.emblem : ""}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}${customEmojis.hp}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStats.hp, eStatsC.sm / eStatsC.mana, stats2?.hpbar)}\n${Avalon.padStats(eStatsC)}\n-----------------------------------\n${myClass ? myClass.emblem : ""}${myChar.name}'s Stats (**${myStatsC.hp}**/${myStats.hp}${customEmojis.hp}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStats.hp, myStatsC.sm / myStatsC.mana, stats.hpbar)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-(parseInt(author.schema.user_settings.battle_log_length || "4") || 4)).join("")}`);
                        Embed.setFooter({ text: `Turn: ${matchStats.turn === 1 ? user.username : interaction.user.username} | round ${matchStats.round} | time left: ${settingsTimer + Math.floor((timestart - new Date().getTime()) / 1000)}s` });
                        msg.edit({ embeds: [Embed], components: [row] });
                    };

                    function minionDefeated(side: "my" | "enemy") {
                        if (side === "my") {
                            myStatsC = { ...matchStats.myStatsCC } as DetailedStats;
                            matchStats.currentCharacter = 0;
                            Embed.setThumbnail(thumbnail);
                            startNextRound();
                        } else {
                            eStatsC = { ...matchStats.eStatsCC } as DetailedStats;
                            matchStats.currentOpponent = 0;
                            Embed.setImage(eStats.image);
                            matchStats.turn = 1;
                        };
                    };

                    function endMatch(wORl: "w" | "l") {
                        if (matchStats.ended) return;
                        else matchStats.ended = true;

                        atk.stop(), def.stop(), ability?.stop(), cskill?.stop(), skip?.stop();
                        atk2.stop(), def2.stop(), ability2?.stop(), cskill2?.stop(), skip2?.stop();

                        matchStats.turn = 1;
                        resolve(matchResult(wORl));
                    };

                    function startNextRound() {
                        if (matchStats.ended) return;
                        if (matchStats.round === matchStats.roundCheck) return;
                        matchStats.roundCheck = matchStats.round;
                        if (matchStats.currentCharacter || matchStats.currentOpponent) return;

                        if (matchStats.round >= settingsRounds && settingsRounds > 0) {
                            notice.push(`\n🕗 You've reached the end`);
                            endMatch(myStatsC.hp >= eStatsC.hp ? "w" : "l");
                        };

                        // Consume Mana
                        Avalon.consumeActiveMana(matchStats, myStatsC, buffs, myChar, notice, Embed, thumbnail);
                        Avalon.consumeActiveMana(matchStats, eStatsC, eBuffs, enemy, notice, Embed, eStats.image);

                        // Reset Buffs
                        if (matchStats.currentCharacter === 0) myStatsC.timeout = true, myStatsC.atk = myStats.atk, myStatsC.md = myStats.md, myStatsC.def = myStats.def, myStatsC.mr = myStats.mr, myStatsC.cd = myStats.cd, myStatsC.cr = myStats.cr, myStatsC.dodge = myStats.dodge, myStatsC.br = myStats.br, myStatsC.mg = myStats.mg;
                        if (matchStats.currentOpponent === 0) eStatsC.timeout = true, eStatsC.atk = eStats.atk, eStatsC.md = eStats.md, eStatsC.def = eStats.def, eStatsC.mr = eStats.mr, eStatsC.cd = eStats.cd, eStatsC.cr = eStats.cr, eStatsC.dodge = eStats.dodge, eStatsC.br = eStats.br, eStatsC.mg = eStats.mg;

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
                        if (matchStats.currentOpponent === 0) {
                            for (let i = eStatsC.delayedBuffs.length - 1; i >= 0; i--) {
                                if (eStatsC.delayedBuffs[i].round <= matchStats.round) {
                                    eStatsC.delayedBuffs[i].run(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats, notice, Embed, user);
                                    if (eStatsC.delayedBuffs[i].last <= 1 || eStatsC.delayedBuffs[i].used >= eStatsC.delayedBuffs[i].usage) {
                                        eStatsC.delayedBuffs.splice(i, 1);
                                    } else {
                                        eStatsC.delayedBuffs[i].decrement();
                                    };
                                };
                            };
                        };

                        Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                    };

                    function frozenCheck(caster: DetailedStats, target: DetailedStats) {
                        if (target.timeFrozen) {
                            if (target.frozenMessage) notice.push(`\n✨ **${target.name}** ${target.frozenMessage}.`);
                            matchStats.turn = (matchStats.turn === 1 ? 0 : 1);

                            matchStats.round++;
                            startNextRound();
                            editEmbed();

                            return true;
                        } else {
                            if (matchStats.turn === 1 && caster.timeout) {
                                matchStats.round++;
                                startNextRound();
                                editEmbed();
                            };
                        };
                    };

                    if (notice.length > 4) {
                        Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                        editEmbed();
                    };

                    atk.on('collect', async r => {
                        if (matchStats.turn === 0) {
                            matchStats.turn = 1;
                            matchStats.user = matchStats.interaction.user.id;

                            // If attack was replaced
                            if (myStatsC.replaceButton.atk?.run) {
                                myStatsC.replaceButton.atk.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                                // Event Triggers
                                matchStats.trigger("ATK", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                frozenCheck(myStatsC, eStatsC);
                            }

                            // Normal attack
                            else {
                                dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });

                                // Event Triggers
                                matchStats.trigger("ATK", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                frozenCheck(myStatsC, eStatsC);
                            }

                        } else if (interaction.channel?.isSendable()) interaction.channel.send(`Please wait for ${user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                    });

                    def.on('collect', async r => {
                        if (matchStats.turn === 0) {
                            matchStats.turn = 1;
                            matchStats.user = matchStats.interaction.user.id;
                            myStatsC.attackStreak = 0;

                            // If defense was replaced
                            if (myStatsC.replaceButton.def?.run) {
                                myStatsC.replaceButton.def.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                                // Event Triggers
                                matchStats.trigger("DEF", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                frozenCheck(myStatsC, eStatsC);
                            }

                            else {
                                if (++myStatsC.defUsed === 10 && interaction.channel?.isSendable()) interaction.channel.send(`${interaction.user.username} you have used DEF 10 times and won't get any ${customEmojis.def} or ${customEmojis.mr} from now on!`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                if (myStatsC.defUsed > 10) {
                                    notice.push(`\n🛡️ **${myChar.name}** can't increase DEF/MR anymore`);
                                } else {
                                    let adddef = 60 + Math.floor(30 * Math.random()) - ((myStatsC.defUsed - 1) * 5);
                                    let addmr = Math.floor((myClass ? 60 * myClass.stats.mr[0] : 60) + (30 * Math.random())) - ((myStatsC.defUsed - 1) * 5);
                                    buffs.def.push(new buffInfo("+", adddef, 9999));
                                    buffs.mr.push(new buffInfo("+", addmr, 9999));
                                    myStatsC.def += adddef;
                                    myStatsC.mr += addmr;
                                    notice.push(`\n🛡️ **${myChar.name}** has increased DEF by **${adddef}** and MR by **${addmr}**`);
                                }
                                myStatsC.usedBlockRound = matchStats.round;

                                // Event Triggers
                                matchStats.trigger("DEF", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                frozenCheck(myStatsC, eStatsC);
                            }

                        } else if (interaction.channel?.isSendable()) interaction.channel.send(`Please wait for ${user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                    });

                    ability.on('collect', async r => {
                        if (myStats.id === 4767 || enemy.id === 4767) {
                            if (interaction.channel?.isSendable()) interaction.channel.send("Ability usages are blocked this round.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            return;
                        };

                        if (myStatsC.isAbilityBlocked) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`You currently can't use your character ability`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            return;
                        };

                        // If ability was replaced
                        if (myStatsC.replaceButton.ability?.run && matchStats.turn === 0) {
                            matchStats.turn = 1;
                            matchStats.user = matchStats.interaction.user.id;
                            myStatsC.attackStreak = 0;
                            const response = await myStatsC.replaceButton.ability.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                            // Event Triggers
                            if (response === AbilityResponse.SUCCESS) {
                                matchStats.trigger("ABILITY", myStatsC, eStatsC, buffs, eBuffs);
                            };

                            editEmbed();
                            Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                            if (!myStatsC.timeout) {
                                matchStats.turn = matchStats.turnSkill ? 0 : 1;
                                editEmbed();
                                myStatsC.timeout = true;
                            } else frozenCheck(myStatsC, eStatsC);
                        }

                        else {
                            if (!myAbility?.ability) {
                                if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have an ability`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                return;
                            };
                            if (myAbility.used < myAbility.usage) {
                                if (matchStats.turn === 0) {
                                    if (myAbility.cost > myStatsC.sm) {
                                        if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough mana! (**${myStatsC.sm}**/${myAbility.cost}${customEmojis.mana})`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                    } else {
                                        matchStats.user = matchStats.interaction.user.id;
                                        matchStats.turn = 1;
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

                                        if (!myStatsC.timeout) {
                                            matchStats.turn = matchStats.turnSkill ? 0 : 1;
                                            editEmbed();
                                            myStatsC.timeout = true;
                                        } else frozenCheck(myStatsC, eStatsC);
                                    };
                                } else if (interaction.channel?.isSendable()) interaction.channel.send(`Please wait for ${user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            } else if (interaction.channel?.isSendable()) interaction.channel.send(`You can use **${myChar.name}**'s ability only ${myAbility.usage == 1 ? "once" : `${myAbility.usage} times`} per fight.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                        };
                    });

                    cskill.on('collect', async r => {
                        // If class active was replaced
                        if (myStatsC.replaceButton.cskill?.run && matchStats.turn === 0) {
                            if (myStats.id === 4767 || enemy.id === 4767) {
                                if (interaction.channel?.isSendable()) interaction.channel.send("Ability usages are blocked this round.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                return;
                            };
                            matchStats.turn = 1;
                            matchStats.user = matchStats.interaction.user.id;
                            myStatsC.attackStreak = 0;
                            const response = await myStatsC.replaceButton.cskill.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                            // Event Triggers
                            if (response === AbilityResponse.SUCCESS) {
                                matchStats.trigger("CSKILL", myStatsC, eStatsC, buffs, eBuffs);
                            };

                            editEmbed();
                            Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                            frozenCheck(myStatsC, eStatsC);
                        }

                        // Class active
                        else {
                            if (!skill) {
                                if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have a class skill`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                return;
                            };
                            if (!myClass) {
                                if (interaction.channel?.isSendable()) interaction.channel.send(`**${myChar.name}** does not have a class.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                return;
                            };
                            if (myStats.id === 4767 || enemy.id === 4767) {
                                if (interaction.channel?.isSendable()) interaction.channel.send("Ability usages are blocked this round.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                return;
                            };
                            if (skill.cost > myStatsC.sm && interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough mana! (**${myStatsC.sm}**/${skill.cost}${customEmojis.mana})`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            else {
                                if (matchStats.turn === 0) {
                                    matchStats.turn = 1;
                                    matchStats.user = matchStats.interaction.user.id;
                                    myStatsC.sm -= skill.cost;
                                    myStatsC.attackStreak = 0;
                                    const response = await skill.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user, stats.chars);

                                    // Event Triggers
                                    if (response === AbilityResponse.SUCCESS) {
                                        matchStats.trigger("CSKILL", myStatsC, eStatsC, buffs, eBuffs);
                                    };

                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                    frozenCheck(myStatsC, eStatsC);
                                } else if (interaction.channel?.isSendable()) interaction.channel.send(`Please wait for ${user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            };
                        };
                    });

                    skip.on('collect', async r => {
                        if (matchStats.turn === 0) {
                            notice.push(`\n⏩ ${interaction.user.username} forfeited the fight!`);
                            editEmbed();
                            matchStats.turn = 1;
                            myStatsC.hp = 0;
                            Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                        } else if (interaction.channel?.isSendable()) interaction.channel.send(`Please wait for ${user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                    });

                    atk2.on('collect', async r => {
                        if (matchStats.turn === 1) {
                            matchStats.user = user.id;
                            matchStats.turn = 0;

                            // If attack was replaced
                            if (eStatsC.replaceButton.atk?.run) {
                                eStatsC.replaceButton.atk.run(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats, notice, Embed, user);

                                // Event Triggers
                                matchStats.trigger("ATK", eStatsC, myStatsC, eBuffs, buffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                frozenCheck(eStatsC, myStatsC);
                            }

                            // Normal attack
                            else {
                                dealDamage(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, `⚔️ **${enemy.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });

                                // Event Triggers
                                matchStats.trigger("ATK", eStatsC, myStatsC, eBuffs, buffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                frozenCheck(eStatsC, myStatsC);
                            }

                        } else if (interaction.channel?.isSendable()) interaction.channel.send(`Please wait for ${interaction.user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                    });

                    def2.on('collect', async r => {
                        if (matchStats.turn === 1) {
                            matchStats.turn = 0;
                            matchStats.user = user.id;
                            eStatsC.attackStreak = 0;

                            // If defense was replaced
                            if (eStatsC.replaceButton.def?.run) {
                                eStatsC.replaceButton.def.run(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats, notice, Embed, user);

                                // Event Triggers
                                matchStats.trigger("DEF", eStatsC, myStatsC, eBuffs, buffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                frozenCheck(eStatsC, myStatsC);
                            }

                            else {
                                if (++eStatsC.defUsed === 10 && interaction.channel?.isSendable()) interaction.channel.send(`${user.username} you have used DEF 10 times and won't get any ${customEmojis.def} or ${customEmojis.mr} from now on!`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                if (eStatsC.defUsed > 10) {
                                    notice.push(`\n🛡️ **${enemy.name}** can't increase DEF/MR anymore`);
                                } else {
                                    let adddef = 60 + Math.floor(30 * Math.random()) - ((eStatsC.defUsed - 1) * 5);
                                    let addmr = Math.floor((eClass ? 60 * eClass.stats.mr[0] : 60) + Math.floor(30 * Math.random())) - ((eStatsC.defUsed - 1) * 5);
                                    eBuffs.def.push(new buffInfo("+", adddef, 9999));
                                    eBuffs.mr.push(new buffInfo("+", addmr, 9999));
                                    eStatsC.def += adddef;
                                    eStatsC.mr += addmr;
                                    notice.push(`\n🛡️ **${enemy.name}** has increased DEF by **${adddef}** and MR by **${addmr}**`);
                                };
                                eStatsC.usedBlockRound = matchStats.round;

                                // Event Triggers
                                matchStats.trigger("DEF", eStatsC, myStatsC, eBuffs, buffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                frozenCheck(eStatsC, myStatsC);
                            }

                        } else if (interaction.channel?.isSendable()) interaction.channel.send(`Please wait for ${interaction.user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                    });

                    ability2.on('collect', async r => {
                        if (myStats.id === 4767 || enemy.id === 4767) {
                            if (interaction.channel?.isSendable()) interaction.channel.send("Ability usages are blocked this round.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            return;
                        };

                        if (eStatsC.isAbilityBlocked) {
                            if (interaction.channel?.isSendable()) interaction.channel.send(`You currently can't use your character ability`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            return;
                        };

                        // If ability was replaced
                        if (eStatsC.replaceButton.ability?.run && matchStats.turn === 1) {
                            matchStats.turn = 0;
                            matchStats.user = user.id;
                            eStatsC.attackStreak = 0;
                            const response = await eStatsC.replaceButton.ability.run(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats, notice, Embed, interaction.user);
                            if (!eStatsC.timeout) matchStats.turn = 1;

                            // Event Triggers
                            if (response === AbilityResponse.SUCCESS) {
                                matchStats.trigger("ABILITY", eStatsC, myStatsC, eBuffs, buffs);
                            };

                            editEmbed();
                            Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                            frozenCheck(eStatsC, myStatsC);
                        }

                        else {
                            if (!eAbility?.ability) {
                                if (interaction.channel?.isSendable()) interaction.channel.send(`**${enemy.name}** does not have an ability.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                return;
                            };
                            if (eAbility.used < eAbility.usage) {
                                if (matchStats.turn === 1) {
                                    if (eAbility.cost > eStatsC.sm && interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough mana! (**${eStatsC.sm}**/${eAbility.cost}${customEmojis.mana})`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                    else {
                                        matchStats.user = user.id;
                                        matchStats.turn = 0;
                                        eStatsC.attackStreak = 0;
                                        eAbility.used++;
                                        const response = await eAbility.ability(eStatsC, eStats, myStatsC, myStats, eBuffs, buffs, enemy, myChar, matchStats, notice, Embed, msg);
                                        if (!eStatsC.timeout) matchStats.turn = 1;
                                        eStatsC.sm -= eAbility.cost;

                                        // Event Triggers
                                        if (response === AbilityResponse.SUCCESS) {
                                            matchStats.trigger("ABILITY", eStatsC, myStatsC, eBuffs, buffs);
                                        };

                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                        frozenCheck(eStatsC, myStatsC);
                                    };
                                } else if (interaction.channel?.isSendable()) interaction.channel.send(`Please wait for ${interaction.user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            } else if (interaction.channel?.isSendable()) interaction.channel.send(`You can use **${enemy.name}**'s ability only ${eAbility.usage == 1 ? "once" : `${eAbility.usage} times`} per fight.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                        };
                    });

                    cskill2.on('collect', async r => {

                        // If class active was replaced
                        if (eStatsC.replaceButton.cskill?.run && matchStats.turn === 1) {

                            if (myStats.id === 4767 || enemy.id === 4767) {
                                if (interaction.channel?.isSendable()) interaction.channel.send("Ability usages are blocked this round.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                return;
                            };

                            matchStats.user = user.id;
                            eStatsC.attackStreak = 0;
                            const response = await eStatsC.replaceButton.cskill.run(eStatsC, eStats, myStatsC, eBuffs, buffs, enemy, myChar, matchStats, notice, Embed, user);
                            matchStats.turn = 0;
                            if (!eStatsC.timeout) matchStats.turn = 1;
                            if (myStatsC.timeFrozen) matchStats.turn = matchStats.turnSkill - 1;

                            // Event Triggers
                            if (response === AbilityResponse.SUCCESS) {
                                matchStats.trigger("CSKILL", eStatsC, myStatsC, eBuffs, buffs);
                            };

                            editEmbed();
                            Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                            frozenCheck(eStatsC, myStatsC);
                        }

                        // Class active
                        else {
                            if (!eSkill) {
                                if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have a class skill`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                return;
                            };
                            if (!eClass) {
                                if (interaction.channel?.isSendable()) interaction.channel.send(`**${enemy.name}** does not have a class.`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                return;
                            };
                            if (myStats.id === 4767 || enemy.id === 4767) {
                                if (interaction.channel?.isSendable()) interaction.channel.send("Ability usages are blocked this round.").then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                                return;
                            };
                            if (eSkill.cost > eStatsC.sm && interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough mana! (**${eStatsC.sm}**/${eSkill.cost}${customEmojis.mana})`).then((msg) => setTimeout(() => msg.delete(), deleteReplyIn)).catch((err) => console.log(err));
                            else {
                                if (matchStats.turn === 1) {
                                    matchStats.user = user.id;
                                    eStatsC.sm -= eSkill.cost;
                                    eStatsC.attackStreak = 0;
                                    const response = await eSkill.skill(eStatsC, myStatsC, eBuffs, buffs, enemy, myChar, matchStats, notice, Embed, user, stats2 ? stats2.chars : []);
                                    matchStats.turn = 0;
                                    if (!eStatsC.timeout) matchStats.turn = 1;
                                    if (myStatsC.timeFrozen) matchStats.turn = matchStats.turnSkill - 1;

                                    // Event Triggers
                                    if (response === AbilityResponse.SUCCESS) {
                                        matchStats.trigger("CSKILL", eStatsC, myStatsC, eBuffs, buffs);
                                    }

                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                    frozenCheck(eStatsC, myStatsC);
                                } else if (interaction.channel?.isSendable()) interaction.channel.send(`Please wait for ${interaction.user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), 30000)).catch((err) => console.log(err));
                            };
                        };
                    });

                    skip2.on('collect', async r => {
                        if (matchStats.turn === 1) {
                            notice.push(`\n⏩ ${user.username} forfeited the fight!`);
                            editEmbed();
                            matchStats.turn = 0;
                            eStatsC.hp = 0;
                            Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                        } else if (interaction.channel?.isSendable()) interaction.channel.send(`Please wait for ${interaction.user.username} to make a move`).then((msg) => setTimeout(() => msg.delete(), 30000)).catch((err) => console.log(err));
                    });

                });
            });

            if (result && interaction.channel?.isSendable()) interaction.channel.send({ embeds: [result] });
        };

        let cls = myStatsC.class === -1 ? "None" : `${classes[myStatsC.class].name}${classes[myStatsC.class].emblem}Lvl. ${myStatsC.clvl}`;

        const Embed = new EmbedBuilder()
            .setColor(embedColor)
            .setThumbnail(myStatsC.image)
            .setTitle(`⚔️ Battle Arena Challenge ⚔️`)
            .setDescription(
                `**Challenger**: <@${interaction.user.id}>\n` +
                `**Against**: <@${user.id}>\n\n` +
                `**${myChar.name}** - ${myChar.anime}\n` +
                `**Level** ${myStatsC.lvl}ㅤ**Ref.** ${getRefinement(myStatsC.ref)}\n` +
                `**Class**: ${cls}\n` +
                `**Equipment**: ${myStatsC.weaponicon}`
                + `${(stats.premium > 3 || stats.shield_slot) && myStatsC.shieldicon ? myStatsC.shieldicon : ""} `
                + `${myStatsC.helmeticon || "<:helmet_empty:1034499888878198885>"}`
                + `${myStatsC.cuirassicon || "<:cuirass_empty:1034499890165858305>"}`
                + `${myStatsC.glovesicon || "<:gloves_empty:1034499892409794570>"}`
                + `${myStatsC.bootsicon || "<:boots_empty:1034499893919764480>"}\n` +
                `**Items**: `
                + `${myStatsC.runeicon} `
                + `${myStatsC.ring1icon}`
                + `${myStatsC.ring2icon}`
                + `${myStatsC.ring3icon}`
                + `\n════════════════════\n` +
                (`${myClass ? myClass.emblem : ""}${myChar.name}'s Stats (**${myStatsC.hp}**/${myStats.hp}${customEmojis.hp}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStats.hp, myStatsC.sm / myStatsC.mana, stats.hpbar)}\n${Avalon.padStats(myStatsC)}`)
            )
            .setFooter({ text: `Win Streak: ${stats.arenastreak} (Highest: ${stats.arenastreakhighest}) | Win Rate: ${Math.round((stats.arenawins / (stats.arenawins + stats.arenalosses)) * 100)}%` });

        interaction.reply({ content: `<@${user.id}> ${interaction.user.username} challenges you to a battle`, embeds: [Embed], components: [OfferRow] }).then(msg2 => {

            const collector = msg2.createMessageComponentCollector({ filter: (r) => ((r.user.id === user.id) || (r.user.id === interaction.user.id)), componentType: ComponentType.Button, time: 30000 });

            collector.on('collect', async r => {
                if ((r.customId === "confirm") && (r.user.id === interaction.user.id)) return;
                collector.stop();

                if (r.customId === "confirm") {
                    newFight();
                } else {
                    msg2.edit({ components: [] });
                    interaction.followUp({ content: `${r.user.username} has cancelled the challenge` });
                    return;
                };
            });
        });
    },
};

export default exportCommand;
