import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChatInputCommandInteraction } from "discord.js";
import { abilities } from "../Modules/abilities";
import { classes } from "../Modules/classes";
import { curses } from "../Modules/curses";
import { achievements } from "../Modules/achievements";
import { dailies } from "../Modules/dailyQuests";
import { armorInfo, items, ringInfo, weaponInfo } from "../Modules/items";
import skillInfo, { skills } from "../Modules/skills";
import { characters } from "../Modules/chars";
import { getDetailedStats, customEmojis, dealDamage, search, searchClass, searchItem, classLevelToXP } from "../Modules/functions";
import Avalon from "../Modules/avalon";
import buffInfo from "../Modules/buffs";
import _ from 'lodash';
import { CompactUserSchema, DetailedStats, SlashCommand } from '../types';
import { enemyInfo } from '../Modules/enemies';
import { updateUsers } from '../Modules/queries';
import { AbilityResponse } from '../Modules/components';
import { customHpBars } from '../Modules/customHpBars';

const dungeonInProgress = new Set();
const crazeLevelSelected = new Map();
const EMBED_COLOR = 0xffbd39;

const luminousImages: `https://${string}`[] = ["https://i.ibb.co/QpyDLjX/l1.png", "https://i.ibb.co/MfKkZkH/l2.png", "https://i.ibb.co/Hqr6Jgx/l3.png", "https://i.ibb.co/hsbmQRM/l4.png", "https://i.ibb.co/FqmT9vx/l5.png", "https://i.ibb.co/bdjhmCb/l6.png", "https://i.ibb.co/s3fq9Cy/l7.png", "https://i.ibb.co/VTwQTvB/l8.png", "https://i.ibb.co/23xd7cL/l9.png"];

function getModal(uid: string) {
    return new ModalBuilder()
        .setCustomId('edit_trial_' + uid)
        .setTitle('Edit Build')
        .addComponents([
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('char')
                    .setLabel("Character name or ID")
                    .setStyle(TextInputStyle.Short)
                    // .setMinLength(16)
                    // .setMaxLength(20)
                    .setPlaceholder('E.g. Luminous EX (type "remove" to remove)')
                    .setRequired(false)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('class')
                    .setLabel("Class name or ID")
                    .setStyle(TextInputStyle.Short)
                    // .setMinLength(16)
                    // .setMaxLength(20)
                    .setPlaceholder('E.g. Paladin (type "remove" to remove)')
                    .setRequired(false)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('weapon')
                    .setLabel("Weapon name or ID")
                    .setStyle(TextInputStyle.Short)
                    // .setMinLength(16)
                    // .setMaxLength(20)
                    .setPlaceholder('E.g. Excalibur (type "remove" to remove)')
                    .setRequired(false)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('shield')
                    .setLabel("Shield name or ID")
                    .setStyle(TextInputStyle.Short)
                    // .setMinLength(16)
                    // .setMaxLength(20)
                    .setPlaceholder('E.g. Tyranny (type "remove" to remove)')
                    .setRequired(false)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('set')
                    .setLabel("Set name or ID")
                    .setStyle(TextInputStyle.Short)
                    // .setMinLength(16)
                    // .setMaxLength(20)
                    .setPlaceholder('E.g. Aureate (type "remove" to remove)')
                    .setRequired(false)
            ),
        ]);
};

function getModalLevels(uid: string) {
    return new ModalBuilder()
        .setCustomId('edit_trial_' + uid)
        .setTitle('Edit Levels')
        .addComponents([
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('lvl')
                    .setLabel("Character Level")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('E.g. 300 (type "remove" to remove)')
                    .setRequired(false)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('clvl')
                    .setLabel("Class Level")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('E.g. 200 (type "remove" to remove)')
                    .setRequired(false)
            ),
        ]);
};

function levelSelection(interaction: ChatInputCommandInteraction, stats: CompactUserSchema): Promise<number> {
    return new Promise((resolve) => {
        let level = crazeLevelSelected.get(interaction.user.id) ?? 0;

        const getButtonRow = () => {
            return new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('play')
                        .setLabel(`Fight`)
                        .setStyle(ButtonStyle.Success),
                    // .setDisabled(level < 13),
                    new ButtonBuilder()
                        .setCustomId('ignore_defer-edit')
                        .setLabel(`Edit Build`)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('ignore_defer-edit_levels')
                        .setLabel(`Edit Levels`)
                        .setStyle(ButtonStyle.Primary),
                );
        };

        const getDesc = () => {
            return `### ⚖️ Trial\nTry out builds using any character, class or items. No need to own them yourself!`
                // + "\n\n⚠️ The event has ended! Only level 14 will stay open for a while longer."
                + `\n### Enemy Details\n**Enemy**: ${"Luminous"}\n### Your Character\n**Name**: ${"char" in stats.trial_equipment ? characters[stats.trial_equipment.char].name + ` Lvl. ${stats.trial_equipment.lvl ?? 600}` : "`None`"}\n**Class**: ${"class" in stats.trial_equipment ? classes[stats.trial_equipment.class].name + classes[stats.trial_equipment.class].emblem + `Lvl. ${stats.trial_equipment.clvl ?? 1200}` : "`None`"}\n**Equipment**: ${"weapon" in stats.trial_equipment ? (isNaN(stats.trial_equipment.weapon.split(":")[0]) ? stats.trial_equipment.weapon : items[stats.trial_equipment.weapon.split(":")[0]].emoji) : "<:sword_empty:1034502134474997790>"}${"shield" in stats.trial_equipment ? items[stats.trial_equipment.shield.split(":")[0]].emoji : "<:shield_empty:1087089686809415730>"} ${"helmet" in stats.trial_equipment ? items[stats.trial_equipment.helmet.split(":")[0]].emoji : "<:helmet_empty:1034499888878198885>"}${"cuirass" in stats.trial_equipment ? items[stats.trial_equipment.cuirass.split(":")[0]].emoji : "<:cuirass_empty:1034499890165858305>"}${"gloves" in stats.trial_equipment ? items[stats.trial_equipment.gloves.split(":")[0]].emoji : "<:gloves_empty:1034499892409794570>"}${"boots" in stats.trial_equipment ? items[stats.trial_equipment.boots.split(":")[0]].emoji : "<:boots_empty:1034499893919764480>"}${("weapon" in stats.trial_equipment || "shield" in stats.trial_equipment || "helmet" in stats.trial_equipment) ? " Lvl. 70/70" : ""}`;
        };

        const Embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setThumbnail(luminousImages[Math.floor(Math.random() * luminousImages.length)])
            .setDescription(getDesc());
        interaction.reply({ embeds: [Embed], components: [getButtonRow()] }).then((msg) => {
            const play = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "play", componentType: ComponentType.Button, time: 90000 });
            const edit = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ignore_defer-edit", componentType: ComponentType.Button, time: 90000 });
            const edit_levels = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ignore_defer-edit_levels", componentType: ComponentType.Button, time: 90000 });

            play.on('collect', () => {
                if (!("char" in stats.trial_equipment)) return interaction.followUp({ content: `Please select a character using the \`Edit Build\` button before playing`, ephemeral: true });
                if (dungeonInProgress.has(stats.id)) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`Please finish your previous fight or wait 2 minutes.`);
                    return;
                };
                resolve(level);
                play.stop();
            });

            edit.on('collect', (rr) => {
                const uid = Math.random().toString(36).substring(2, 15);
                rr.showModal(getModal(uid));

                interaction.awaitModalSubmit({ filter: (r) => r.customId === ('edit_trial_' + uid), time: 90000 }).then(async (r) => {
                    const char = r.fields.getTextInputValue('char');
                    const cls = r.fields.getTextInputValue('class');
                    const weapon = r.fields.getTextInputValue('weapon');
                    const shield = r.fields.getTextInputValue('shield');
                    const set = r.fields.getTextInputValue('set');

                    // Match character
                    if (char) {
                        let getChar = search(char, stats.chars, interaction, true);
                        if (getChar?.name) {
                            stats.trial_equipment.char = getChar.id;
                        };
                        if (char === "remove") delete stats.trial_equipment.char;
                    };

                    // Match class
                    if (cls) {
                        let getClass = searchClass(cls, interaction, true);
                        if (getClass?.name) {
                            stats.trial_equipment.class = getClass.id;
                        };
                        if (cls === "remove") delete stats.trial_equipment.class;
                    };

                    // Match weapon
                    if (weapon) {
                        let getWeapon = searchItem(weapon, interaction, true);
                        if (getWeapon?.name && getWeapon.category === "weapon" && getWeapon.type !== "shield") { // ) {
                            stats.trial_equipment.weapon = `${getWeapon.id}:706183309943767112`;
                        };
                        if (weapon === "remove") delete stats.trial_equipment.weapon;
                    };

                    // Match shield
                    if (shield) {
                        let getShield = searchItem(shield, interaction, true);
                        if (getShield?.name && getShield.type === "shield") {
                            stats.trial_equipment.shield = `${getShield.id}:706183309943767112`;
                        };
                        if (shield === "remove") delete stats.trial_equipment.shield;
                    };

                    // Match set
                    if (set) {
                        let getSet = searchItem(set, interaction, true, { returnSet: true });
                        if (getSet && getSet instanceof armorInfo) {
                            let setItems = (items.filter((item) => (item instanceof armorInfo && getSet instanceof armorInfo && item.setname === getSet.setname)) ?? []) as armorInfo[];
                            if (setItems.find((item) => item.type === "helmet")) {
                                const helmet = setItems.find((item) => item.type === "helmet");
                                if (helmet) stats.trial_equipment.helmet = `${helmet.id}:706183309943767112`;
                            };
                            if (setItems.find((item) => item.type === "cuirass")) {
                                const cuirass = setItems.find((item) => item.type === "cuirass");
                                if (cuirass) stats.trial_equipment.cuirass = `${cuirass.id}:706183309943767112`;
                            };
                            if (setItems.find((item) => item.type === "gloves")) {
                                const gloves = setItems.find((item) => item.type === "gloves");
                                if (gloves) stats.trial_equipment.gloves = `${gloves.id}:706183309943767112`;
                            };
                            if (setItems.find((item) => item.type === "boots")) {
                                const boots = setItems.find((item) => item.type === "boots");
                                if (boots) stats.trial_equipment.boots = `${boots.id}:706183309943767112`;
                            };
                        };
                        if (set === "remove") {
                            delete stats.trial_equipment.helmet;
                            delete stats.trial_equipment.cuirass;
                            delete stats.trial_equipment.gloves;
                            delete stats.trial_equipment.boots;
                        };
                    };

                    // Update users table
                    await updateUsers(interaction.user.id, {
                        trial_equipment: { type: "set", value: stats.trial_equipment },
                    });

                    interaction.editReply({ embeds: [Embed.setDescription(getDesc())] });
                    r.reply({ content: `Edited Successfully!`, ephemeral: true });
                });
            });

            edit_levels.on('collect', rr => {
                const uid = Math.random().toString(36).substring(2, 15);
                rr.showModal(getModalLevels(uid));

                interaction.awaitModalSubmit({ filter: (r) => r.customId === ('edit_trial_' + uid), time: 90000 }).then(async (r) => {
                    const lvlFlag = r.fields.getTextInputValue('lvl');
                    const clvlFlag = r.fields.getTextInputValue('clvl');

                    // Character Level
                    if (lvlFlag) {
                        if (lvlFlag.toLowerCase() === "remove") delete stats.trial_equipment.lvl;
                        else {
                            let lvl = parseInt(lvlFlag ?? "1") || 1;
                            if (lvl > 0 && lvl <= 10000) stats.trial_equipment.lvl = lvl;
                        };
                    };

                    // Class Level
                    if (clvlFlag) {
                        if (clvlFlag.toLowerCase() === "remove") delete stats.trial_equipment.clvl;
                        else {
                            let clvl = parseInt(clvlFlag ?? "1") || 1;
                            if (clvl > 0 && clvl <= 10000) stats.trial_equipment.clvl = clvl;
                        };
                    };

                    // Update users table
                    await updateUsers(interaction.user.id, {
                        trial_equipment: { type: "set", value: stats.trial_equipment },
                    });

                    interaction.editReply({ embeds: [Embed.setDescription(getDesc())] });
                    r.reply({ content: `Edited Successfully!`, ephemeral: true });
                });
            });

            play.on('end', () => {
                edit.stop(), edit_levels.stop();
                resolve(-1);
            });

        });

    });
};

const exportCommand: SlashCommand = {
    name: 'trial',
    async execute({ interaction, author }) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        const stats = author.schema;

        // Level Selection
        let level = await levelSelection(interaction, stats);
        if (level === -1) return;

        // Set up restrictions
        if (dungeonInProgress.has(stats.id)) return interaction.reply("You already have a run in progress, please finish it before attempting to start a new round.");
        dungeonInProgress.add(stats.id);
        const userTimeout = setTimeout(() => dungeonInProgress.delete(stats.id), 120000);

        // Equip Craze Build
        stats.battlechar = stats.trial_equipment.char as number;
        stats.shield_slot = 1;
        stats.level = stats.trial_equipment.lvl ?? 600;
        if ("class" in stats.trial_equipment) {
            stats.class = stats.trial_equipment.class;
            stats.dungeon_classlevels = Object.fromEntries(Array.from({ length: classes.length }, (_, i) => [i, classLevelToXP(stats.trial_equipment.clvl ?? 1200)]));
        } else stats.class = null;
        if ("weapon" in stats.trial_equipment) stats.equipment.weapon = stats.trial_equipment.weapon;
        else delete stats.equipment.weapon;
        if ("shield" in stats.trial_equipment) stats.equipment.shield = stats.trial_equipment.shield;
        else delete stats.equipment.shield;
        if ("helmet" in stats.trial_equipment) stats.equipment.helmet = stats.trial_equipment.helmet;
        else delete stats.equipment.helmet;
        if ("cuirass" in stats.trial_equipment) stats.equipment.cuirass = stats.trial_equipment.cuirass;
        else delete stats.equipment.cuirass;
        if ("gloves" in stats.trial_equipment) stats.equipment.gloves = stats.trial_equipment.gloves;
        else delete stats.equipment.gloves;
        if ("boots" in stats.trial_equipment) stats.equipment.boots = stats.trial_equipment.boots;
        else delete stats.equipment.boots;

        // User stats
        let myChar = characters[stats.battlechar];
        let myStats = await getDetailedStats(myChar.id, stats, stats.dungeon_classlevels);

        myStats.thumbnail = myChar.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[myChar.id], stats.char_skin[myChar.id]);

        let myStatsC = { ...myStats };
        let myClass = myStats.class !== -1 ? classes[myStats.class] : undefined;
        let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : undefined;
        let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : undefined;

        // Enemy Stats
        const enemy = new enemyInfo("Luminous", "Human", "the Luminous", "F", true, {}, {}, {}, [], luminousImages, [], 0);
        const curseRar = curses.filter((e) => e.tier);
        const curse = curseRar[Math.floor(Math.random() * curseRar.length)];
        let eAbility = new skillInfo(0, 50, async (myStats, eStats, mybuff, ebuff, char, enemy, matchStats, notice, embed, user, ...list) => {
            let dmg = Math.floor(((2 * eStats.atk) * Math.pow(0.99895, myStats.def)) * (1 - (0.2 * Math.random())));
            myStats.hp -= dmg;
            if (myStats.hp < 0) myStats.hp = 0;
            eStats.sm -= 50;
            matchStats.turn = 0;
            notice.push(`\n✨ **${enemy.name}** dealt **${dmg}** damage!`);

            return AbilityResponse.SUCCESS;
        }, async () => AbilityResponse.SUCCESS, [5, "Luminous deals 200% damage"]);
        let eImage = enemy.image[Math.floor(Math.random() * enemy.image.length)];

        let eStats: any = {
            "name": enemy.name,
            "hp": Math.floor(myStats.hp * 1.16),
            "maxhp": Math.floor(myStats.hp * 1.16),
            "atk": Math.floor(myStats.atk * 1.16),
            "def": Math.floor(myStats.def),
            "ep": Math.floor(((Math.floor(myStats.hp * 1.16) / Math.pow(0.99895, Math.floor(myStats.def))) / (100 / Math.floor(myStats.atk * 1.16))) * 100) / 100,
            "md": Math.floor(myStats.atk * 1.16),
            "mr": Math.floor(myStats.def),
            "cr": 0.18,
            "cd": 1.25,
            "td": Math.floor(myStats.atk * 1.16),
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

        let resolved = false;
        function matchResult(r: "w" | "l") {
            if (resolved) return;
            resolved = true;

            // Clear restrictions
            clearTimeout(userTimeout);
            dungeonInProgress.delete(stats.id);

            let desc = "";
            if (r === "w") {
                desc = `<:stars_v2:917023655840591963> **${myChar.name}** won! <:stars_v2:917023655840591963>`;
                if (interaction.commandName === "arena") {
                    desc += "\n*Merlin... Everyone... I'm so...\nsorry...*";
                    // Achievements
                    achievements[33].check(interaction);
                };
            };
            if (r === "l") {
                desc = `💀 **${myChar.name}** lost 💀`;
                if (interaction.commandName === "arena") desc += "\n*Until the Selection is made true,\nI shall not fall.*";
            };

            // Daily Quests
            dailies[5].update(interaction);

            const Embed = new EmbedBuilder()
                .setColor(embedColor)
                .setThumbnail(myStatsC.thumbnail)
                .setTitle(interaction.commandName === "arena" ? "Battle Arena" : `Trial`)
                .setDescription(desc)
                .setFooter({ text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
            return Embed;
        };

        let matchStats = Avalon.getMatchStats(interaction);
        let notice = ["", "", "", ""];

        // Apply passives
        await eAbility.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
        if (skill && myChar.id !== 4767) await skill.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
        if (myAbility?.passive) await myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.weapon !== -1) await (items[myStats.weapon] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.shieldid) await (items[myStats.shieldid] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.helmet && (items[myStats.helmet] as armorInfo).setname === (items[myStats.cuirass] as armorInfo)?.setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.gloves] as armorInfo)?.setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.boots] as armorInfo)?.setname) await (items[myStats.boots] as armorInfo)?.buff?.(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        if (myStats.ring1) await (items[myStats.ring1] as ringInfo).getBuff(myStats.ring1info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.ring2) await (items[myStats.ring2] as ringInfo).getBuff(myStats.ring2info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.ring3) await (items[myStats.ring3] as ringInfo).getBuff(myStats.ring3info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        const ATK_EMOJI = myStatsC.replaceButton?.atk?.emoji || '⚔️',
            DEF_EMOJI = myStatsC.replaceButton?.def?.emoji || '🛡️',
            ABILITY_EMOJI = myStatsC.replaceButton?.ability?.emoji || '✨',
            SKILL_EMOJI = myStatsC.replaceButton?.cskill?.emoji || '⚜️',
            SKIP_EMOJI = myStatsC.replaceButton?.skip?.emoji || '⏩';

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
        const threatLevelWarning = isCompactEmbed ? "" : `${interaction.commandName === "arena" ? "I accept your challenge\n" : ""}${difficulty}\n\n`;

        async function newFight() {
            let timestart = new Date().getTime();
            let result = await new Promise<EmbedBuilder | undefined>((resolve) => {
                const Embed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setThumbnail(isCompactEmbed ? eStatsC.image : myStatsC.thumbnail)
                    .setFooter({ text: `Enemy EP: ${eStatsC.ep} | round 1 | time left: 120s` })
                    .setTitle(interaction.commandName === "arena" ? "Battle Arena" : `Trial`)
                    .setDescription(`${threatLevelWarning}${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}\\💖${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStats.hp, eStatsC.sm / eStatsC.mana, stats.hpbar)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStats.hp}\\💖${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStats.hp, myStatsC.sm / myStatsC.mana, stats.hpbar)}\n${Avalon.padStats(myStatsC)}`)
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
                        Embed.setDescription(`${threatLevelWarning}${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStatsC.maxhp, eStatsC.sm / eStatsC.mana, stats.hpbar)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana, stats.hpbar)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-(parseInt(author.schema.user_settings.battle_log_length || "4") || 4)).join("")}`);
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
                        else notice.push(`\n🎉 **${myChar.name}** won${level === 13 && stats.trial_equipment.weapon === "<:GojoHeart:1194021178029920266>" ? " <:GojoHeart:1194021178029920266>" : ""}`);
                        editEmbed();
                        matchStats.turn = 1;
                        resolve(matchResult(wORl));
                    };

                    // Level 14
                    if (level === 13 && stats.trial_equipment.weapon === "<:GojoHeart:1194021178029920266>") {
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
