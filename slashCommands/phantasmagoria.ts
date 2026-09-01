import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle, ChatInputCommandInteraction, ColorResolvable, TextInputBuilder, TextInputStyle, ModalBuilder, StringSelectMenuBuilder } from "discord.js";
import { abilities, Ability } from "../Modules/abilities";
import { classes } from "../Modules/classes";
// import { curses } from "../Modules/curses";
import { armorInfo, itemInfo, items, ringInfo, runeInfo, weaponInfo } from "../Modules/items";
import { skills } from "../Modules/skills";
import { characters } from "../Modules/chars";
import { getDetailedStats, customEmojis, dealDamage, getClassLvl, getRingSlotsTotal, search, searchClass, searchItem, getLetterRank, formatNumberWithQuotes, displayCharge, classLevelToXP, cacheItemStats } from "../Modules/functions";
import { AbilityResponse, dungeonTempBan } from "../Modules/components";

import Avalon from "../Modules/avalon";
import buffInfo from "../Modules/buffs";
import _ from 'lodash';
import { CompactUserSchema, DetailedStats, SlashCommand, WeaponSchema } from '../types';
import { getUserSchemas, getWeaponSchemas, updateUsers, updateUsersAndCache, insertNewWeapon } from '../Modules/queries';
import { query, withTransaction } from '../postgres';
import { customHpBars } from '../Modules/customHpBars';
import { skillTree } from '../Modules/skillTree';
import { phantasmagoriaBosses } from '../Modules/enemies';
import { phantasmaStrategies } from '../Modules/phantasmaStrategies';

const dungeonInProgress = new Set();

//! FOR THE BETA ONLY: 20
const FIGHT_DURATION = 240; // in seconds
const MAX_ROUNDS = 201; // max rounds per fight
const EVENT_ACTIVE = true;

function getRaidButtonRow(tab: string, canPlay: boolean): ActionRowBuilder<ButtonBuilder>[] {
    if (tab === "overview") {
        return [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId('play').setLabel("Fight").setStyle(ButtonStyle.Danger).setDisabled(!canPlay),
                new ButtonBuilder().setCustomId('ignore_defer-edit').setLabel("Edit Build").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('strategies').setLabel("Strategies").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ranking').setEmoji("1403331476916801566").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('rewards').setEmoji("1514626264361861170").setStyle(ButtonStyle.Success),
            ),
        ];
    };

    const backBtn = [
        new ButtonBuilder().setCustomId('overview').setLabel("Show Overview").setStyle(ButtonStyle.Primary),
    ];

    if (tab === "strategies") {
        return [
            new ActionRowBuilder<ButtonBuilder>().addComponents(backBtn[0]),
        ];
    };

    return [new ActionRowBuilder<ButtonBuilder>().addComponents(...backBtn)];
};

function getBossSelectRow(stats: CompactUserSchema): ActionRowBuilder<StringSelectMenuBuilder> {
    const selectedBoss = stats.phantasmagoria_selected_boss ?? 0;
    return new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_boss')
                .setPlaceholder('Select a boss to challenge...')
                .addOptions(
                    phantasmagoriaBosses.map((boss, i) => ({
                        label: boss.name,
                        description: boss.title ?? undefined,
                        value: String(i),
                        default: i === selectedBoss,
                    }))
                ),
        );
};

function getModal(uid: string) {
    return new ModalBuilder()
        .setCustomId('edit_phantasmagoria_' + uid)
        .setTitle('Edit Phantasm Build')
        .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('support1')
                    .setLabel("Support Character 1")
                    .setStyle(TextInputStyle.Short)
                    // .setMinLength(16)
                    // .setMaxLength(20)
                    .setPlaceholder('E.g. Luminous EX (type "remove" to remove)')
                    .setRequired(false)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('support2')
                    .setLabel("Support Character 2")
                    .setStyle(TextInputStyle.Short)
                    // .setMinLength(16)
                    // .setMaxLength(20)
                    .setPlaceholder('E.g. Acheron EX (type "remove" to remove)')
                    .setRequired(false)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('phantasm_class')
                    .setLabel("Class")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('E.g. Paladin (type "remove" to remove)')
                    .setRequired(false)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('weapon_shield')
                    .setLabel("Weapon / Shield")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('E.g. Excalibur / Aegis (type "remove / remove" to remove)')
                    .setRequired(false)
            ),
            new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                    .setCustomId('armor_set')
                    .setLabel("Armor Set")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('E.g. Dragon (type "remove" to remove)')
                    .setRequired(false)
            ),
        );
};

interface EchoShopItem {
    id: string;
    name: string;
    price: number;
    emoji: string;
    desc: string;
    maxPurchases?: number;
    grantItemId?: number;
    grantItemType?: string;
    xp?: number;
    hpbarId?: number;
};

const item1 = items[840] as weaponInfo;
const item2 = items[841] as ringInfo;

const echoShopItems: EchoShopItem[] = [
    { id: "expull", name: "EX Pull", price: 80, maxPurchases: 10, emoji: "<a:EXTRA:1138530846144462968>", desc: "A chance to pull an EX-rated character" },
    { id: "item_1", name: item1.name + ` (${item1.type})`, price: 800, maxPurchases: 5, emoji: item1.emoji, desc: `${item1.buffdesc}`, grantItemId: 840, grantItemType: "weapon" },
    { id: "item_2", name: item2.name, price: 300, maxPurchases: 10, emoji: item2.emoji, desc: `${item2.getBuffDesc()}`, grantItemId: 841, grantItemType: "ring" },
    { id: "cxp_small", name: "Small Instant XP Potion", price: 10, maxPurchases: 20, xp: 800, emoji: "<:small_instant_xp_potion:1411713377511800842>", desc: "Grants **800** class XP" },
    { id: "cxp_large", name: "Large Instant XP Potion", price: 25, maxPurchases: 10, xp: 2400, emoji: "<:large_instant_xp_potion:1411713396260339873>", desc: "Grants **2,400** class XP" },
    { id: "cxp_huge", name: "Huge Instant XP Potion", price: 80, maxPurchases: 5, xp: 8000, emoji: "<:huge_instant_xp_potion:1411713671977107496>", desc: "Grants **8,000** class XP" },
    { id: "coins_exchange", name: "10 Coins", price: 1, emoji: "<:coins:872926669055356939>", desc: "Exchange 1 echo for 10 coins (unlimited)" },
    { id: "hpbar_liminal", name: "Liminal Clover", price: 1000, maxPurchases: 1, emoji: "🍀", desc: "Blade of Liminality, stylish for battles!\n" + customHpBars[17].getHpBar(0.7, 0.4), hpbarId: 17 },
];

function raidOverview({ interaction, stats, userItems }: { interaction: ChatInputCommandInteraction, stats: CompactUserSchema, userItems: itemInfo[]; }): Promise<number> {
    return new Promise((resolve) => {

        let tab: "overview" | "ranking" | "rewards" | "strategies" = "overview";
        let rankingLines: string[] = [];
        let strategyIndex = 0;

        const getDesc = (): string => {
            const bossIndex = stats.phantasmagoria_selected_boss ?? 0;
            const boss = phantasmagoriaBosses[bossIndex] ?? phantasmagoriaBosses[0];
            if (tab === "overview") {
                const curStrat = phantasmaStrategies.find((s) => s.id === stats.phantasmagoria_strategy);
                const displayClass = stats.phantasmagoria_class ?? stats.class;
                const oe = stats.phantasmagoria_equipment ?? {};
                const eqSlot = (slot: string, d: string) => oe[slot] != null && items[oe[slot]] ? items[oe[slot]].emoji + ' 📌' : d;
                const defWeapon = userItems.find((e) => e.category === "weapon" && e.type !== "shield")?.emoji ?? "<:sword_empty:1034502134474997790>";
                const defShield = userItems.find((e) => e.type === "shield")?.emoji ?? "<:shield_empty:1087089686809415730>";
                const defHelmet = userItems.find((e) => e.type === "helmet")?.emoji ?? "<:helmet_empty:1034499888878198885>";
                const defCuirass = userItems.find((e) => e.type === "cuirass")?.emoji ?? "<:cuirass_empty:1034499890165858305>";
                const defGloves = userItems.find((e) => e.type === "gloves")?.emoji ?? "<:gloves_empty:1034499892409794570>";
                const defBoots = userItems.find((e) => e.type === "boots")?.emoji ?? "<:boots_empty:1034499893919764480>";
                return `### Phantasm — Overview`
                    + `\n- Fight through multiple phases of the Phantasm Boss, and gain Echoes [ <a:echo:1510653732029857802>] for every phase defeated! (Max once per phase).`
                    + `\n- You may later spend Echoes in shop [ <a:shop:1514626264361861170> ] for great rewards.`
                    + `\n- Select a Strategy pre-battle to empower your build!`
                    + `\n\n**Enemy**: ${boss.name}`
                    + `\n- ${boss.ability?.list[0].join("\n- ")}`
                    + `\n\n**Build**\n**Character**: ${characters[stats.battlechar ?? -1].name} Lvl. ${stats.level}\n**Class**: ${displayClass !== null ? classes[displayClass].name + classes[displayClass].emblem + `Lvl. ${getClassLvl(displayClass, stats.dungeon_classlevels)}` + (stats.phantasmagoria_class != null ? ' 📌' : '') : "`None`"}`
                    + `\n**Equipment**: ${eqSlot('weapon', defWeapon)}${eqSlot('shield', defShield)} ${eqSlot('helmet', defHelmet)}${eqSlot('cuirass', defCuirass)}${eqSlot('gloves', defGloves)}${eqSlot('boots', defBoots)}`
                    + `\n**Items**: ${stats.equipment[`rune:${stats.battlechar}`] === undefined ? "<:rune_empty:1034507494539669635>" : items[parseInt(stats.equipment[`rune:${stats.battlechar}`])].emoji} `
                    + userItems.filter((e) => e.category === "ring").map((e) => e.emoji).concat(
                        Array(Math.max(0, getRingSlotsTotal(stats) - userItems.filter((e) => e.category === "ring").length)).fill("<:ring_empty:1034509903886299136>")
                    ).concat(["<:locked:1034511902417621002>", "<:locked:1034511902417621002>", "<:locked:1034511902417621002>"]).slice(0, 3).join("")
                    + (`\n**Supports**: ${(stats.phantasmagoria_supports[0] !== undefined && stats.phantasmagoria_supports[0] !== null) ? `${characters[stats.phantasmagoria_supports[0]].name}${stats.equipment[`rune:${stats.phantasmagoria_supports[0]}`] === undefined ? "" : (" " + items[parseInt(stats.equipment[`rune:${stats.phantasmagoria_supports[0]}`])].emoji)}` : "`None`"}`)
                    + (` ‖ ${(stats.phantasmagoria_supports[1] !== undefined && stats.phantasmagoria_supports[1] !== null) ? `${characters[stats.phantasmagoria_supports[1]].name}${stats.equipment[`rune:${stats.phantasmagoria_supports[1]}`] === undefined ? "" : (" " + items[parseInt(stats.equipment[`rune:${stats.phantasmagoria_supports[1]}`])].emoji)}` : "`None`"}`)
                    + `\n<a:strategy:1510907688169504788> **Strategy**: ${stats.phantasmagoria_strategy ? `${curStrat?.name ?? "`None`"}` : "`None`"}` + ` [ ${curStrat?.emoji ?? "❔"} ]`;
            } else if (tab === "ranking") {
                const bossId = stats.phantasmagoria_selected_boss ?? 0;
                const bossName = phantasmagoriaBosses[bossId]?.name ?? "Unknown";
                const myBossData = stats.phantasmagoria_boss_data?.[String(bossId)] ?? {};
                return `### ${bossName} — Ranking`
                    + `\n_Hit "Show Overview" to go back_\n`
                    + rankingLines.join('\n')
                    + `\n\n**Your Best**: ${formatNumberWithQuotes(myBossData.best_damage ?? 0)} damage (Phase ${myBossData.best_phases ?? 0})`;
            } else if (tab === "rewards") {
                const itemsDesc = echoShopItems.map(item => {
                    const purchases = stats.echo_purchases?.[item.id] ?? 0;
                    if (item.maxPurchases && purchases >= item.maxPurchases) {
                        return `~~${item.emoji} **${item.name}** — **${item.price}** <a:echo:1510653732029857802>~~\n> ~~${item.desc}~~ — **SOLD OUT**`;
                    };
                    const capStr = item.maxPurchases ? ` (${purchases}/${item.maxPurchases})` : "";
                    return `${item.emoji} **${item.name}** — **${item.price}** <a:echo:1510653732029857802>${capStr}\n> ${item.desc}`;
                }).join("\n\n");
                return `### Phantasm — Shop`
                    + `\nSpend your Echoes on exclusive rewards!\n`
                    + `\n${itemsDesc}`
                    + `\n\n**Your Balance**: **${stats.echo ?? 0}** <a:echo:1510653732029857802>`;
            } else if (tab === "strategies") {
                const currentId = stats.phantasmagoria_strategy;
                const s = phantasmaStrategies[strategyIndex];
                const curStrat = phantasmaStrategies.find((st) => st.id === currentId);
                return `### Phantasm — Strategies (${strategyIndex + 1}/${phantasmaStrategies.length})\n_Select a strategy to improve your build!_\n-# Strategies differ in not only their passives, but also the way to gain energy (<a:energy:1511169619086409829>) to unleash their ultimate! (By replacing the SKIP button), though you can still flee the fight by failing the ultimate twice on a row in a round. Energy owned is capped at **200**.\n\n**Equipped**: ${currentId === 0 ? "❌ `None`" : `${curStrat?.emoji ?? ""} **${curStrat?.name}**`}${s ? `\n\n━━━━━━━━━━━━━━━━━━━━━━\n${s.emoji} **${s.name}**${s.id === currentId ? " ✅ *(selected)*" : ""}\n> __Passive__: ${s.psvdescription}` + (s.actdescription ? `\n\n> <a:strategy:1510907688169504788> __Ultimate__: ${s.actdescription}` : "") : ""}`;
            };

            return "";
        };

        const Embed = new EmbedBuilder()
            .setColor(0x7A8CE6)
            .setThumbnail(phantasmagoriaBosses[stats.phantasmagoria_selected_boss ?? 0].image[0])
            .setDescription(getDesc());
        interaction.editReply({ embeds: [Embed], components: [...getRaidButtonRow("overview", EVENT_ACTIVE), getBossSelectRow(stats)] }).then((msg) => {
            const play = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "play", componentType: ComponentType.Button, time: 90000 });
            const overviewBtn = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "overview", componentType: ComponentType.Button, time: 90000 });
            const ranking = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ranking", componentType: ComponentType.Button, time: 90000 });
            const edit = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ignore_defer-edit", componentType: ComponentType.Button, time: 90000 });
            const rewards = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "rewards", componentType: ComponentType.Button, time: 90000 });
            const shopBuy = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "shop_buy", componentType: ComponentType.StringSelect, time: 90000 });
            const strategies = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "strategies", componentType: ComponentType.Button, time: 90000 });

            play.on('collect', async (rr) => {
                if (dungeonInProgress.has(stats.id)) {
                    if (interaction.channel?.isSendable()) interaction.channel.send("You already have a fight in progress, please finish it before attempting to start a new one.").catch(() => null);
                    return;
                };

                resolve(1);
                play.stop();
            });

            overviewBtn.on('collect', async (rr) => {
                tab = "overview";
                interaction.editReply({ embeds: [Embed.setDescription(getDesc())], components: [...getRaidButtonRow(tab, EVENT_ACTIVE), getBossSelectRow(stats)] });
            });

            ranking.on('collect', async (rr) => {
                tab = "ranking";
                const bossId = String(stats.phantasmagoria_selected_boss ?? 0);
                const rows = await query("SELECT id, name, phantasmagoria_boss_data FROM users WHERE phantasmagoria_boss_data != '{}'::jsonb") as { id: string; name: string; phantasmagoria_boss_data: Record<string, { best_damage: number; best_phases: number; }>; }[];
                const myFresh = rows.find((p) => p.id === interaction.user.id);
                stats.phantasmagoria_boss_data = myFresh?.phantasmagoria_boss_data ?? {};
                const ranked = rows
                    .filter((p) => {
                        const dmg = p.phantasmagoria_boss_data?.[bossId]?.best_damage;
                        return !isNaN(dmg) && (dmg ?? 0) > 0;
                    })
                    .sort((a, b) => {
                        const dmgA = a.phantasmagoria_boss_data?.[bossId]?.best_damage;
                        const dmgB = b.phantasmagoria_boss_data?.[bossId]?.best_damage;
                        return (isNaN(dmgB) ? 0 : (dmgB ?? 0)) - (isNaN(dmgA) ? 0 : (dmgA ?? 0));
                    })
                    .slice(0, 20);
                rankingLines = ranked.length
                    ? ranked.map((p, i) => {
                        const bossData = p.phantasmagoria_boss_data?.[bossId] ?? {};
                        const dmg = isNaN(bossData.best_damage) ? 0 : (bossData.best_damage ?? 0);
                        return `-# ${i + 1}. <@${p.id}> — **${formatNumberWithQuotes(dmg)}** damage (Phase ${bossData.best_phases ?? 0})`;
                    })
                    : [`-# No participants yet`];
                interaction.editReply({ embeds: [Embed.setDescription(getDesc())], components: getRaidButtonRow(tab, EVENT_ACTIVE) });
            });

            edit.on('collect', (rr) => {
                const uid = Math.random().toString(36).substring(2, 15);
                rr.showModal(getModal(uid));

                interaction.awaitModalSubmit({ filter: (r) => r.customId === ('edit_phantasmagoria_' + uid), time: 90000 }).then(async (r) => {
                    if (r.customId !== 'edit_phantasmagoria_' + uid) return;
                    const support1 = r.fields.getTextInputValue('support1');
                    const support2 = r.fields.getTextInputValue('support2');
                    const phantasmClass = r.fields.getTextInputValue('phantasm_class');
                    const weaponShield = r.fields.getTextInputValue('weapon_shield');
                    const armorSet = r.fields.getTextInputValue('armor_set');

                    if (!stats.phantasmagoria_equipment) stats.phantasmagoria_equipment = {};

                    // Match character
                    if (support1) {
                        if (support1.toLowerCase() === "remove") {
                            stats.phantasmagoria_supports[0] = null as any;
                        } else {
                            let getChar = search(support1, stats.chars, interaction, true);
                            if (getChar?.name) {
                                if (!stats.chars.includes(getChar.id)) return r.reply({ content: `You don't have a copy of **${getChar.name}**`, ephemeral: true });
                                if (stats.battlechar === getChar.id) return r.reply({ content: `You can't use your equipped character as a support!`, ephemeral: true });
                                if (stats.phantasmagoria_supports.includes(getChar.id)) return r.reply({ content: `**${getChar.name}** is already set as a support!`, ephemeral: true });
                                stats.phantasmagoria_supports[0] = getChar.id;
                            };
                        };
                    };

                    if (support2) {
                        if (support2.toLowerCase() === "remove") {
                            stats.phantasmagoria_supports[1] = null as any;
                        } else {
                            let getChar = search(support2, stats.chars, interaction, true);
                            if (getChar?.name) {
                                if (!stats.chars.includes(getChar.id)) return r.reply({ content: `You don't have a copy of **${getChar.name}**`, ephemeral: true });
                                if (stats.battlechar === getChar.id) return r.reply({ content: `You can't use your equipped character as a support!`, ephemeral: true });
                                if (stats.phantasmagoria_supports.includes(getChar.id)) return r.reply({ content: `**${getChar.name}** is already set as a support!`, ephemeral: true });
                                if (stats.phantasmagoria_supports[0] != null) stats.phantasmagoria_supports[1] = getChar.id;
                                else stats.phantasmagoria_supports[0] = getChar.id;
                            };
                        };
                    };

                    // Match class
                    if (phantasmClass) {
                        if (phantasmClass.toLowerCase() === "remove") {
                            stats.phantasmagoria_class = null as any;
                        } else {
                            let getCls = searchClass(phantasmClass, interaction, true);
                            if (getCls?.name) {
                                stats.phantasmagoria_class = classes.indexOf(getCls);
                            };
                        };
                    };

                    // Match weapon / shield
                    if (weaponShield) {
                        const parts = weaponShield.split(" / ").map(s => s.trim());
                        const weaponPart = parts[0];
                        const shieldPart = parts[1];

                        if (weaponPart && weaponPart.toLowerCase() === "remove") {
                            delete stats.phantasmagoria_equipment.weapon;
                        } else if (weaponPart) {
                            let item = searchItem(weaponPart, interaction, true);
                            if (item?.name) {
                                if (item.category !== "weapon" || item.type === "shield") {
                                    return r.reply({ content: `**${item.name}** is not a weapon!`, ephemeral: true });
                                };
                                stats.phantasmagoria_equipment.weapon = item.id;
                            };
                        };

                        if (shieldPart && shieldPart.toLowerCase() === "remove") {
                            delete stats.phantasmagoria_equipment.shield;
                        } else if (shieldPart) {
                            let item = searchItem(shieldPart, interaction, true);
                            if (item?.name) {
                                if (item.type !== "shield") {
                                    return r.reply({ content: `**${item.name}** is not a shield!`, ephemeral: true });
                                };
                                stats.phantasmagoria_equipment.shield = item.id;
                            };
                        };
                    };

                    // Match armor set
                    if (armorSet) {
                        if (armorSet.toLowerCase() === "remove") {
                            delete stats.phantasmagoria_equipment.helmet;
                            delete stats.phantasmagoria_equipment.cuirass;
                            delete stats.phantasmagoria_equipment.gloves;
                            delete stats.phantasmagoria_equipment.boots;
                        } else {
                            const getSet = searchItem(armorSet, interaction, true, { returnSet: true });
                            if (!getSet || !(getSet instanceof armorInfo)) {
                                return r.reply({ content: `No armor set named **${armorSet}** found!`, ephemeral: true });
                            };
                            const setItems = items.filter((item) => item instanceof armorInfo && item.setname === getSet.setname) as armorInfo[];
                            for (const piece of setItems) {
                                if (piece.type) stats.phantasmagoria_equipment[piece.type] = piece.id;
                            };
                        };
                    };

                    // Update users table
                    await updateUsers(interaction.user.id, {
                        phantasmagoria_supports: { type: "set", value: stats.phantasmagoria_supports },
                        phantasmagoria_class: { type: "set", value: stats.phantasmagoria_class },
                        phantasmagoria_equipment: { type: "set", value: stats.phantasmagoria_equipment ?? {} },
                    });

                    interaction.editReply({ embeds: [Embed.setDescription(getDesc())], components: [...getRaidButtonRow("overview", EVENT_ACTIVE), getBossSelectRow(stats)] });
                    r.reply({ content: `Edited Successfully!`, ephemeral: true });
                }).catch(() => null);
            });

            function getStrategyPageOptions() {
                const currentId = stats.phantasmagoria_strategy;
                const s = phantasmaStrategies[strategyIndex];
                const prevBtn = new ButtonBuilder().setCustomId('strategy_prev').setEmoji('⏪').setStyle(ButtonStyle.Secondary);
                const nextBtn = new ButtonBuilder().setCustomId('strategy_next').setEmoji('⏩').setStyle(ButtonStyle.Secondary);
                const selectBtn = new ButtonBuilder()
                    .setCustomId('strategy_select')
                    .setLabel(`Select`)
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(!s || s.id === currentId);
                const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(prevBtn, selectBtn, nextBtn);
                return { embeds: [Embed.setDescription(getDesc())], components: [actionRow, getRaidButtonRow(tab, EVENT_ACTIVE)[0]] };
            };

            strategies.on('collect', async (rr) => {
                tab = "strategies";
                const activeStrategy = phantasmaStrategies.findIndex((s) => s.id === stats.phantasmagoria_strategy);
                strategyIndex = activeStrategy >= 0 ? activeStrategy : 0;
                interaction.editReply(getStrategyPageOptions());
            });

            const strategyNav = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && ["strategy_prev", "strategy_next", "strategy_select"].includes(r.customId), componentType: ComponentType.Button, time: 90000 });
            strategyNav.on('collect', async (rr) => {
                if (rr.customId === "strategy_prev") strategyIndex = strategyIndex === 0 ? phantasmaStrategies.length - 1 : strategyIndex - 1;
                else if (rr.customId === "strategy_next") strategyIndex = strategyIndex >= phantasmaStrategies.length - 1 ? 0 : strategyIndex + 1;
                else if (rr.customId === "strategy_select") {
                    const s = phantasmaStrategies[strategyIndex];
                    if (s) {
                        stats.phantasmagoria_strategy = s.id;
                        await updateUsers(interaction.user.id, { phantasmagoria_strategy: { type: "set", value: s.id } });
                        interaction.followUp({ content: `Strategy set to **${s.name}**!`, ephemeral: true }).catch(() => null);
                    };
                };
                interaction.editReply(getStrategyPageOptions());
            });

            const bossSelect = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "select_boss", componentType: ComponentType.StringSelect, time: 90000 });
            bossSelect.on('collect', async (rr) => {
                await rr.deferUpdate();
                const bossId = parseInt(rr.values[0]);
                stats.phantasmagoria_selected_boss = bossId;
                await updateUsers(interaction.user.id, { phantasmagoria_selected_boss: { type: "set", value: bossId } });
                tab = "overview";
                Embed.setThumbnail(phantasmagoriaBosses[bossId].image[0]);
                interaction.editReply({ embeds: [Embed.setDescription(getDesc())], components: [...getRaidButtonRow(tab, EVENT_ACTIVE), getBossSelectRow(stats)] });
            });

            function getShopSelectRow() {
                const availableItems = echoShopItems.filter(item => {
                    if (!item.maxPurchases) return true;
                    const purchases = stats.echo_purchases?.[item.id] ?? 0;
                    return purchases < item.maxPurchases;
                });
                return new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('shop_buy')
                            .setPlaceholder('Select an item to purchase...')
                            .addOptions(
                                availableItems.map(item => ({
                                    label: item.name,
                                    description: `Cost: ${item.price} Echo`,
                                    emoji: item.emoji,
                                    value: item.id,
                                }))
                            ),
                    );
            };

            rewards.on('collect', async (rr) => {
                tab = "rewards";
                interaction.editReply({
                    embeds: [Embed.setDescription(getDesc())],
                    components: [...getRaidButtonRow(tab, false), getShopSelectRow()]
                });
            });

            shopBuy.on('collect', async (rr) => {
                const itemId = rr.values[0];
                const shopItem = echoShopItems.find(i => i.id === itemId);
                if (!shopItem) { await rr.deferUpdate(); return; }

                const currentEcho = stats.echo ?? 0;
                if (currentEcho < shopItem.price) {
                    await rr.reply({ content: `You don't have enough Echoes! (**${currentEcho}**/${shopItem.price} <a:echo:1510653732029857802>)`, ephemeral: true });
                    return;
                }

                const purchases = stats.echo_purchases?.[itemId] ?? 0;
                if (shopItem.maxPurchases && purchases >= shopItem.maxPurchases) {
                    await rr.reply({ content: `You've already purchased the maximum amount of **${shopItem.name}**!`, ephemeral: true });
                    return;
                }

                const remainingCap = shopItem.maxPurchases ? shopItem.maxPurchases - purchases : 999999;
                const maxAfford = Math.floor(currentEcho / shopItem.price);
                const maxQty = Math.min(remainingCap, maxAfford);

                if (maxQty < 1) {
                    await rr.reply({ content: `You can't afford any **${shopItem.name}**!`, ephemeral: true });
                    return;
                }

                const uid = Math.random().toString(36).substring(2, 15);
                const capLabel = shopItem.maxPurchases ? `remaining: ${remainingCap}` : "unlimited";
                await rr.showModal(
                    new ModalBuilder()
                        .setCustomId('shop_qty_' + uid)
                        .setTitle(`Buy ${shopItem.name}`)
                        .addComponents(
                            new ActionRowBuilder<TextInputBuilder>().addComponents(
                                new TextInputBuilder()
                                    .setCustomId('qty')
                                    .setLabel(`Quantity (1-${maxQty}, ${capLabel})`)
                                    .setStyle(TextInputStyle.Short)
                                    .setPlaceholder('1')
                                    .setRequired(true)
                            ),
                        ),
                );

                try {
                    const modalSubmit = await interaction.awaitModalSubmit({
                        filter: (r) => r.customId === 'shop_qty_' + uid,
                        time: 60000,
                    });

                    const qtyInput = modalSubmit.fields.getTextInputValue('qty');
                    let qty = parseInt(qtyInput);

                    if (isNaN(qty) || qty < 1 || qty > maxQty) {
                        await modalSubmit.reply({ content: `Invalid quantity! Please enter a number between **1** and **${maxQty}**.`, ephemeral: true });
                        return;
                    }

                    const currentPurchases = stats.echo_purchases?.[itemId] ?? 0;

                    if (shopItem.maxPurchases && (currentPurchases + qty) > shopItem.maxPurchases) {
                        await modalSubmit.reply({ content: `You can only purchase **${shopItem.maxPurchases - currentPurchases}** more **${shopItem.name}**!`, ephemeral: true });
                        return;
                    }

                    const maxAffordable = Math.floor((stats.echo ?? 0) / shopItem.price);
                    if (maxAffordable < 1) {
                        await modalSubmit.reply({ content: `You don't have enough Echoes! Need **${shopItem.price}** but you have **${stats.echo ?? 0}**.`, ephemeral: true });
                        return;
                    }
                    let adjusted = false;
                    if (qty > maxAffordable) {
                        qty = maxAffordable;
                        adjusted = true;
                    }

                    const totalCost = shopItem.price * qty;

                    // Defer granting items until after the atomic users update succeeds
                    let pendingGrant: { itemId: number; itemType?: string; qty: number } | null = null;

                    await modalSubmit.deferUpdate();
                    if (adjusted) await modalSubmit.followUp({ content: `Quantity adjusted to **${qty}** (max affordable with current balance).`, ephemeral: true });

                    // Re-fetch actual echo from DB to avoid stale-cache overspend
                    const [userRow] = await query('SELECT echo FROM users WHERE id = $1', [interaction.user.id]) as [{ echo: number; }];
                    const actualEcho = userRow?.echo ?? 0;
                    if (actualEcho < totalCost) {
                        await modalSubmit.followUp({ content: `Your balance changed! Need **${totalCost}** but you only have **${actualEcho}**.`, ephemeral: true });
                        return;
                    }

                    // Prepare update object for echo deduction and optional JSON updates
                    let update: Record<string, any> = {
                        echo: { type: "increment", value: -totalCost },
                    };

                    let newEchoPurchases: Record<string, number> | undefined;

                    if (shopItem.xp && stats.class !== null) {
                        update.dungeon_classlevels = { type: "merge_json", value: { [stats.class]: shopItem.xp * qty } };
                    } else if (shopItem.id === "expull") {
                        update.expulls = { type: "increment", value: qty };
                    } else if (shopItem.id === "coins_exchange") {
                        update.coins = { type: "increment", value: 10 * qty };
                    } else if (shopItem.hpbarId !== undefined) {
                        update.hpbars = { type: "append_unique", value: [shopItem.hpbarId] };
                    } else if (shopItem.grantItemId) {
                        // Will grant inside transaction
                        pendingGrant = { itemId: shopItem.grantItemId, itemType: shopItem.grantItemType ?? "weapon", qty };
                    };

                    try {
                        // Run a DB transaction that locks the user row, checks balance and purchase caps, updates the user, and inserts items
                        await withTransaction(async (client) => {
                            const { rows: [userRow] } = await client.query(`SELECT echo, echo_purchases FROM users WHERE id = $1 FOR UPDATE`, [interaction.user.id]) as { rows: { echo: number; echo_purchases: Record<string, number>; }[] };
                            if (!userRow) throw new Error('User not found');

                            if (userRow.echo < totalCost) throw new Error('INSUFFICIENT_ECHO');

                            if (shopItem.maxPurchases) {
                                const actualPurchases = userRow.echo_purchases?.[itemId] ?? 0;
                                if ((actualPurchases + qty) > shopItem.maxPurchases) throw new Error('PURCHASE_CAP_REACHED');
                                newEchoPurchases = { ...(userRow.echo_purchases ?? {}), [itemId]: actualPurchases + qty };
                            }

                            // Perform user update (deduct echo and optionally set purchases)
                            if (newEchoPurchases) {
                                await client.query(`UPDATE users SET echo = echo - $1, echo_purchases = $2 WHERE id = $3`, [totalCost, newEchoPurchases, interaction.user.id]);
                            } else {
                                await client.query(`UPDATE users SET echo = echo - $1 WHERE id = $2`, [totalCost, interaction.user.id]);
                            }

                            // Apply other prepared updates atomically inside the same transaction
                            try {
                                if (update.coins) {
                                    await client.query(`UPDATE users SET coins = COALESCE(coins, 0) + $1 WHERE id = $2`, [update.coins.value, interaction.user.id]);
                                }
                                if (update.expulls) {
                                    await client.query(`UPDATE users SET expulls = COALESCE(expulls, 0) + $1 WHERE id = $2`, [update.expulls.value, interaction.user.id]);
                                }
                                if (update.dungeon_classlevels) {
                                    // Match updateUsers 'merge_json' behavior: numeric keys are summed when both are numbers
                                    await client.query(`UPDATE users SET dungeon_classlevels = (
                                        SELECT jsonb_object_agg(key,
                                            CASE
                                                WHEN dungeon_classlevels->key IS NOT NULL AND $1::jsonb->key IS NOT NULL
                                                    AND jsonb_typeof(dungeon_classlevels->key) = 'number'
                                                    AND jsonb_typeof($1::jsonb->key) = 'number' THEN
                                                        to_jsonb((dungeon_classlevels->key)::numeric + ($1::jsonb->key)::numeric)
                                                WHEN $1::jsonb->key IS NOT NULL THEN
                                                    $1::jsonb->key
                                                ELSE
                                                    dungeon_classlevels->key
                                            END
                                        )
                                        FROM jsonb_each(COALESCE(dungeon_classlevels, '{}'::jsonb) || $1::jsonb)
                                    ) WHERE id = $2`, [update.dungeon_classlevels.value, interaction.user.id]);
                                }
                                if (update.hpbars) {
                                    const ids: number[] = update.hpbars.value ?? [];
                                    for (const v of ids) {
                                        // append unique: only append if not already present
                                        await client.query(`UPDATE users SET hpbars = array_append(hpbars, $1::int) WHERE id = $2 AND NOT (hpbars @> ARRAY[$1::int])`, [v, interaction.user.id]);
                                    }
                                }
                            } catch (e) {
                                // If any of these fail, let the outer transaction handler rollback
                                throw e;
                            }

                            // Insert granted items (if any) using transactional client to ensure atomicity
                            if (pendingGrant) {
                                for (let i = 0; i < pendingGrant.qty; i++) {
                                    await insertNewWeapon(interaction.user.id, pendingGrant.itemId, pendingGrant.itemType ?? "weapon", undefined, undefined, undefined, client);
                                }
                            }
                        });

                        // Evict cache and update local stats snapshot
                        interaction.client.userCache.delete(interaction.user.id);
                        const [postRow] = await query('SELECT echo, echo_purchases FROM users WHERE id = $1', [interaction.user.id]) as [{ echo: number; echo_purchases: Record<string, number>; }];
                        stats.echo = postRow?.echo ?? 0;
                        stats.echo_purchases = postRow?.echo_purchases ?? stats.echo_purchases;

                        // Clear pending grant
                        pendingGrant = null;

                        await modalSubmit.followUp({ content: `Successfully purchased **${qty}x** ${shopItem.emoji} **${shopItem.name}** for **${totalCost}** <a:echo:1510653732029857802>!`, ephemeral: true });
                        await interaction.editReply({ embeds: [Embed.setDescription(getDesc())], components: [...getRaidButtonRow(tab, false), getShopSelectRow()] });
                    } catch (err) {
                        if ((err as Error).message === 'INSUFFICIENT_ECHO') {
                            await modalSubmit.followUp({ content: `Your balance changed! Need **${totalCost}** but you don't have enough Echoes.`, ephemeral: true });
                        } else if ((err as Error).message === 'PURCHASE_CAP_REACHED') {
                            await modalSubmit.followUp({ content: `Purchase cap reached! Please try again later.`, ephemeral: true });
                        } else {
                            console.error(err);
                            await modalSubmit.followUp({ content: `Purchase failed. Please try again later.`, ephemeral: true });
                        }
                    }
                } catch {
                    // Modal timed out or was dismissed
                }
            });

            play.on('end', () => {
                overviewBtn.stop(); edit.stop(); ranking.stop(); rewards.stop(); shopBuy.stop(); strategies.stop(); strategyNav.stop(); bossSelect.stop();
                resolve(-1);
            });
        });

    });
};

const exportCommand: SlashCommand = {
    name: 'phantasm',
    async execute({ interaction, author }) {

        try {
            await interaction.deferReply();
        } catch (err) {
            return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
        };

        // Skip Overview
        let skipOverview = interaction.options.getBoolean('skip-overview') ?? false;




        // Check if user has a battle character
        const stats = { ...author.schema };
        if (stats.battlechar === null || !stats.chars.includes(stats.battlechar)) return interaction.editReply("You have to choose a battle character first. Use `/select <char name>` to choose one.");

        const myWeapons = await getWeaponSchemas([stats.equipment.weapon, stats.equipment.shield, stats.equipment.helmet, stats.equipment.cuirass, stats.equipment.gloves, stats.equipment.boots, stats.equipment.ring1, stats.equipment.ring2, stats.equipment.ring3]);
        const userItems = myWeapons.map((e) => items[e.itemid]);

        //* Use max class level
        stats.dungeon_classlevels = Object.fromEntries(Array.from({ length: classes.length }, (_, i) => [i, Math.max(0, ...Object.values(stats.dungeon_classlevels))]));

        //* Minimum level floor so even low-level players can participate
        stats.level = Math.max(stats.level, 1000);
        stats.dungeon_classlevels = Object.fromEntries(Array.from({ length: classes.length }, (_, i) => [i, Math.max(stats.dungeon_classlevels[i] ?? 0, classLevelToXP(3000))]));

        // Overview
        let start = skipOverview ? 1 : await raidOverview({ interaction, stats, userItems });
        if (start === -1) return;

        // Set up restrictions
        if (dungeonTempBan.has(interaction.user.id)) return interaction.editReply(`You have failed to enter the captcha many times in a row.\nYou have been temporarily banned from using \`/dungeon\` for the next **${Math.ceil((dungeonTempBan.get(interaction.user.id)?.ends - Date.now()) / (60 * 1000))}** min\nYou can check how much time is left with </cd:1010317417840390158>`);
        if (dungeonInProgress.has(stats.id)) return interaction.followUp("You already have a run in progress, please finish it before attempting to start a new round.");
        dungeonInProgress.add(stats.id);
        const userTimeout = setTimeout(() => dungeonInProgress.delete(stats.id), FIGHT_DURATION * 1000);

        // User stats
        let myChar = characters[stats.battlechar];
        const fightStats = { ...stats };
        if (stats.phantasmagoria_class != null) fightStats.class = stats.phantasmagoria_class;
        if (stats.phantasmagoria_equipment) {
            fightStats.equipment = { ...stats.equipment };
            for (const [slot, value] of Object.entries(stats.phantasmagoria_equipment)) {
                if (value == null) continue;
                const val = value as unknown as number;
                const entry = items[val];
                if (entry) {
                    const uid = `${val}:${interaction.user.id}`;
                    cacheItemStats(uid, {
                        itemid: val,
                        level: 80, ascension: 0,
                        uniqueid: uid,
                        id: interaction.user.id,
                        item_type: entry instanceof weaponInfo ? "weapon" : "armor",
                    } as WeaponSchema);
                };
                fightStats.equipment[slot] = `${val}:${interaction.user.id}`;
            };
        };
        let myStats = await getDetailedStats(myChar.id, fightStats, stats.dungeon_classlevels);
        myStats.thumbnail = myChar.getImage(stats.premium, stats.custom_skins[myChar.id], stats.char_skin[myChar.id]);


        // myStats.removeDefCap = true;
        let myStatsC = { ...myStats };
        let myClass = myStats.class !== -1 ? classes[myStats.class] : undefined;
        let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : undefined;
        let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : undefined;

        if (myStats.rune) {
            const rune = items[parseInt(myStats.rune)];
            if (rune instanceof runeInfo) {
                if (myAbility === undefined) myAbility = _.cloneDeep(rune.ability) as Ability;
                else myAbility = { ...myAbility, ..._.cloneDeep(rune.ability) };
            };
        };

        // Enemy Stats
        const bossIndex = stats.phantasmagoria_selected_boss ?? 0;
        let enemy = phantasmagoriaBosses[bossIndex] ?? phantasmagoriaBosses[0];
        // const curse = curses[14];
        let eAbility = enemy.ability;
        let eImage = enemy.image[Math.floor(Math.random() * enemy.image.length)];

        let eStats = {
            "name": enemy.name,
            "hp": 3000,
            "maxhp": 3000,
            "atk": 1500,
            "md": 1500,
            "def": 660,
            "mr": 660,
            "ep": Infinity,
            "cr": 0.5,
            "cd": 1.4,
            "td": 10,
            "br": 0.12,
            "dodge": 0.25,
            "mana": 1000,
            "mg": 15,
            "sm": 0,
            "rev": 0,
            "revhp": 0,
            "shield": 0,
            "mdChance": 0,
            "removeDefCap": true,
            "image": eImage,
            "damageTaken": 0,
            "phase": 1,
        } as any;

        // Stat Adjustments
        if (enemy.setStats) Object.entries(enemy.setStats).forEach((e) => eStats[e[0]] = e[1]);
        if (enemy.multStats) Object.entries(enemy.multStats).forEach((e) => eStats[e[0]] = Math.floor(eStats[e[0]] * e[1]));
        if (enemy.addStats) Object.entries(enemy.addStats).forEach((e) => eStats[e[0]] += e[1]);

        let eStatsC = { ...eStats };

        // Some match settings
        const aDelay = stats.premium ? stats.animationdelay : 1200;

        // Random HP Bar
        if (stats.user_settings.random_hp_bar && stats.hpbars.length > 0) {
            stats.hpbar = [null, ...stats.hpbars][Math.floor(Math.random() * (stats.hpbars.length + 1))];
        };
        const embedColor = stats.hpbar === null ? "#7A8CE6" as ColorResolvable : customHpBars[stats.hpbar].color;

        let buffs = Avalon.getBuffs();
        let eBuffs = Avalon.getBuffs();

        let resolved = false;
        async function matchResult(wORl: "w" | "l") {
            if (resolved) return;
            resolved = true;

            // Clear restrictions
            clearTimeout(userTimeout);
            dungeonInProgress.delete(stats.id);

            // Revert Minion
            if (matchStats.currentOpponent) {
                eStatsC = { ...matchStats.eStatsCC };
                matchStats.currentOpponent = 0;
            };

            // Damage dealt
            const rawDamageDealt = (eStatsC.cumulativePhaseHp ?? 0) + Math.max(0, eStatsC.maxhp - (isNaN(eStatsC.hp) ? eStatsC.maxhp : eStatsC.hp));
            const damageDealt = isNaN(rawDamageDealt) ? 0 : Math.max(0, rawDamageDealt);
            const phasesCleared = Math.max(0, (eStatsC.phase ?? 1) - 1);

            // Echo reward: 100 per new phase defeated (max 200 phases per battle)
            const bossId = stats.phantasmagoria_selected_boss ?? 0;
            const [freshUser] = await query('SELECT phantasmagoria_boss_data, echo FROM users WHERE id = $1', [interaction.user.id]) as { phantasmagoria_boss_data: Record<string, { best_damage: number; best_phases: number; }>; echo: number; }[];
            const freshBossData = freshUser?.phantasmagoria_boss_data ?? {};
            const freshEcho = freshUser?.echo ?? 0;
            const prevBest = freshBossData[String(bossId)] ?? { best_damage: 0, best_phases: 0 };
            const newPhases = Math.max(0, phasesCleared - (prevBest.best_phases ?? 0));
            const echoReward = 100 * Math.min(newPhases, 200);

            // Save best score & grant echo
            const bossData = { ...freshBossData };
            // If previous best was NaN, replace it with current damage
            const prevBestDamage = isNaN(prevBest.best_damage) ? 0 : (prevBest.best_damage ?? 0);
            bossData[String(bossId)] = {
                best_damage: Math.max(prevBestDamage, isNaN(damageDealt) ? 0 : damageDealt),
                best_phases: Math.max(prevBest.best_phases ?? 0, phasesCleared),
            };
            await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates: {
                    phantasmagoria_boss_data: { type: "set", value: bossData },
                    echo: { type: "increment", value: echoReward },
                },
            });
            stats.echo = freshEcho + echoReward;
            stats.phantasmagoria_boss_data = bossData;

            return new EmbedBuilder()
                .setColor(embedColor)
                .setThumbnail(myStatsC.thumbnail)
                .setTitle(`Phantasm Results`)
                .setDescription(`${eStatsC.hp <= 0 ? `<:stars_v2:917023655840591963> **${myChar.name}** won! <:stars_v2:917023655840591963>` : `💀 **${myChar.name}** lost 💀`}\n<a:arrow_red:916716702618767401> Damage: **${formatNumberWithQuotes(damageDealt)}**\n<a:arrow_orange:916716747623641210> Phases defeated: **${phasesCleared}**\n<a:arrow_orange:916716747623641210> Echo earned: **+${echoReward}** (Total: **${freshEcho + echoReward}**)`)
                .setFooter({ text: `Balance: ${formatNumberWithQuotes(stats.coins)} coins`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
        };

        let matchStats = Avalon.getMatchStats(interaction, { allowExecution: true, allowSelfheal: true });
        let notice = ["", "", "", ""];
        matchStats.partyChars = [...new Set(stats.phantasmagoria_supports.filter((sid) => sid !== null && sid !== undefined && sid !== stats.battlechar))].map((sid) => characters[sid]);
        // matchStats.partyStats = partyStatsC;

        // Apply skill tree
        // for (const [skill, level] of Object.entries(stats.skill_tree)) {
        //     await skillTree[parseInt(skill)].passive(level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        // };

        // Apply passives
        if (skill && myChar.id !== 4767) await skill.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
        if (myAbility?.passive) await myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.weapon !== -1) await (items[myStats.weapon] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.shieldid) await (items[myStats.shieldid] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.helmet && (items[myStats.helmet] as armorInfo).setname === (items[myStats.cuirass] as armorInfo)?.setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.gloves] as armorInfo)?.setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.boots] as armorInfo)?.setname) await (items[myStats.boots] as armorInfo)?.buff?.(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        if (myStats.rune) await (items[parseInt(myStats.rune)] as runeInfo)?.buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        if (myStats.ring1) await (items[myStats.ring1] as ringInfo).getBuff(myStats.ring1info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.ring2) await (items[myStats.ring2] as ringInfo).getBuff(myStats.ring2info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.ring3) await (items[myStats.ring3] as ringInfo).getBuff(myStats.ring3info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        // Apply Phantasma Strategy buff
        if (stats.phantasmagoria_strategy) {
            const strategy = phantasmaStrategies.find((s) => s.id === stats.phantasmagoria_strategy);
            if (strategy) await strategy.buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        };

        // Track cumulative phase HP before Feyra recalculates maxhp
        eStatsC.cumulativePhaseHp = 0;

        for (const sid of new Set(stats.phantasmagoria_supports)) {
            if (sid !== undefined && sid !== null && sid !== stats.battlechar) {
                const myStatsP = { ...myStatsC };
                myStatsP.name = characters[sid].name;

                const runeAbility = stats.equipment[`rune:${sid}`] ? items[parseInt(stats.equipment[`rune:${sid}`])] as runeInfo : undefined;
                if (runeAbility && runeAbility.party) {
                    await runeAbility.party(myStatsP, myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
                } else {
                    await abilities[sid]?.party?.(myStatsP, myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
                };
            };
        };

        await eAbility?.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);

        const ATK_EMOJI = myStatsC.replaceButton?.atk?.emoji || '<a:phanATK:1512108126109827172>',
            DEF_EMOJI = myStatsC.replaceButton?.def?.emoji || '<a:phanDEF:1511752314095141076>',
            ABILITY_EMOJI = myStatsC.replaceButton?.ability?.emoji || '<a:phanABILITY:1511752352942657626>',
            SKILL_EMOJI = myStatsC.replaceButton?.cskill?.emoji || '<a:phanCSKILL:1511752392591409412>',
            SKIP_EMOJI = myStatsC.replaceButton?.skip?.emoji || '<a:exit:1511883591532019804>';

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setCustomId('ATK').setEmoji(ATK_EMOJI).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('DEF').setEmoji(DEF_EMOJI).setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('ABILITY').setEmoji(ABILITY_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled((myAbility && "ability" in myAbility) ? false : true),
                new ButtonBuilder().setCustomId('SKILL').setEmoji(SKILL_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled(myStats.class !== -1 ? false : true),
                new ButtonBuilder().setCustomId('SKIP').setEmoji(SKIP_EMOJI).setStyle(ButtonStyle.Secondary)
            );



        const showEnemyStats = !!author.schema.user_settings.display_enemy_stats;

        async function newFight() {
            let timestart = new Date().getTime();
            let result = await new Promise<EmbedBuilder | undefined>((resolve) => {
                const Embed = new EmbedBuilder()
                    .setColor(embedColor)
                    // .setThumbnail(null)
                    .setFooter({ text: `Phase ${eStatsC.phase} | round 1 | time left: ${FIGHT_DURATION}s` })
                    .setTitle(`Phantasm Battle  `)
                    .setDescription(`${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}\\💖${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStats.hp, eStatsC.sm / eStatsC.mana, stats.hpbar)}${Avalon.statusIcon(eStatsC)}${showEnemyStats ? `\n${Avalon.padStats(eStatsC)}` : ""}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStats.hp}\\💖${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana, stats.hpbar)}${Avalon.statusIcon(myStatsC)}\n${Avalon.padStats(myStatsC)}\n<:energy1:1518418164566982817><:energy2:1518418204337373194>: ${displayCharge(myStatsC.energy ?? 0)}`);
                // .setImage(null);
                interaction.editReply({ embeds: [Embed], components: [row] }).then(msg => {

                    const atk = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ATK", componentType: ComponentType.Button, time: FIGHT_DURATION * 1000 });
                    const def = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "DEF", componentType: ComponentType.Button, time: FIGHT_DURATION * 1000 });
                    const ability = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ABILITY", componentType: ComponentType.Button, time: FIGHT_DURATION * 1000 });
                    const cskill = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKILL", componentType: ComponentType.Button, time: FIGHT_DURATION * 1000 });
                    const skip = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKIP", componentType: ComponentType.Button, time: FIGHT_DURATION * 1000 });
                    matchStats.collector = { "atk": atk, "def": def, "ability": ability, "cskill": cskill, "skip": skip };


                    // Use passives
                    // if (myChar.id !== 4767) curse.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                    let timeout: NodeJS.Timeout | undefined;
                    async function editEmbed() {
                        if (notice.length > 100) notice.splice(0, notice.length - 100);
                        Embed.setDescription(`${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStatsC.maxhp, eStatsC.sm / eStatsC.mana, stats.hpbar)}${Avalon.statusIcon(eStatsC)}${showEnemyStats ? `\n${Avalon.padStats(eStatsC)}` : ""}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana, stats.hpbar)}${Avalon.statusIcon(myStatsC)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------\n<:energy1:1518418164566982817><:energy2:1518418204337373194>: ${displayCharge(myStatsC.energy ?? 0)}\n-----------------------------------${notice.slice(-(parseInt(author.schema.user_settings.battle_log_length || "4") || 4)).join("")}`);
                        Embed.setFooter({ text: `Phase ${eStatsC.phase} | round ${matchStats.round} | time left: ${FIGHT_DURATION + Math.floor((timestart - new Date().getTime()) / 1000)}s` });
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
                            attack();
                        };
                    };

                    function endMatch(wORl: "w" | "l") {
                        if (matchStats.ended) return;
                        else matchStats.ended = true;

                        atk.stop(), def.stop(), skip?.stop(), ability?.stop(), cskill?.stop();
                        if (wORl === "l") notice.push(`\n💀 **${myChar.name}** lost ঌ❤︎໒꒱ـــــــــــــــــﮩ٨ــــــ`);
                        else notice.push(`\n🎉 **${myChar.name}** won ঌ❤︎໒꒱ﮩ٨ـﮩﮩ٨ـ♡ﮩ٨ـﮩﮩ٨ـﮩ٨ـﮩﮩ٨`);
                        editEmbed();
                        matchStats.turn = 1;
                        resolve(matchResult(wORl));
                    };

                    function startNextRound() {
                        // Force end at MAX_ROUNDS
                        if (matchStats.round >= MAX_ROUNDS) {
                            notice.push(`\n🕗 You've reached the end`);
                            endMatch("l");
                            return;
                        };

                        if (matchStats.ended) return;
                        if (matchStats.round === matchStats.roundCheck) return;
                        matchStats.roundCheck = matchStats.round;

                        // Consume Mana
                        Avalon.consumeActiveMana(matchStats, myStatsC, buffs, myChar, notice, Embed, myStatsC.thumbnail);

                        // Reset Buffs
                        if (matchStats.currentCharacter === 0) myStatsC.atk = myStats.atk, myStatsC.md = myStats.md, myStatsC.def = myStats.def, myStatsC.mr = myStats.mr, myStatsC.cd = myStats.cd, myStatsC.cr = myStats.cr, myStatsC.dodge = myStats.dodge, myStatsC.br = myStats.br, myStatsC.mg = myStats.mg;
                        /* !!! */ eStatsC.atk = eStats.atk, eStatsC.md = eStats.md, eStatsC.def = eStats.def, eStatsC.mr = eStats.mr, eStatsC.cd = eStats.cd, eStatsC.cr = eStats.cr, eStatsC.dodge = eStats.dodge, eStatsC.br = eStats.br, eStatsC.mg = eStats.mg;

                        // // Remove HP debuffs from boss
                        // eBuffs.hp = eBuffs.hp.filter((buff) => (buff.type === "*" && buff.val > 1) || (buff.type === "+" && buff.val > 0));

                        // Apply Buffs
                        if (matchStats.currentCharacter === 0) Avalon.applyBuffs(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice);
                        /* !!! */ Avalon.applyBuffs(eStatsC, eStatsC, eBuffs, buffs, matchStats, notice);

                        // Fix Stats
                        if (myStatsC.hp > myStatsC.maxhp) myStatsC.hp = myStatsC.maxhp;
                        else if (myStatsC.hp < 0) myStatsC.hp = 0;
                        else myStatsC.hp = Math.floor(myStatsC.hp);
                        if (isNaN(eStatsC.hp) || eStatsC.hp < 0) eStatsC.hp = 0;
                        else if (eStatsC.hp > eStatsC.maxhp) eStatsC.hp = eStatsC.maxhp;
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

                    matchStats.on("phaseChange", ({ caster }) => {
                        if (caster === eStatsC) {
                            eStatsC.cumulativePhaseHp += eStatsC.maxhp;
                        };
                    });

                    function checkPlayerFrozen() {
                        if (matchStats.ended) return false;
                        if (myStatsC.timeFrozen && matchStats.turn === 1) {
                            if (myStatsC.frozenMessage) notice.push(`\n✨ **${myChar.name}** ${myStatsC.frozenMessage} and skips their turn!`);
                            if (matchStats.ended) return true;
                            editEmbed();
                            Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            matchStats.turn = 0;
                            attack();
                            return true;
                        };
                        return false;
                    };

                    function attack() {
                        if (matchStats.turn === 1) return;
                        if (eStatsC.timeFrozen && eStatsC.name !== "McBurn") {
                            if (eStatsC.frozenMessage) notice.push(`\n✨ **${enemy.name}** ${eStatsC.frozenMessage}.`);
                            matchStats.turn = 1;
                            matchStats.round++;
                            startNextRound();
                            editEmbed();
                        } else {
                            setTimeout(() => {
                                if (matchStats.playerPausingRounds > 0) {
                                    matchStats.playerPausingRounds--;
                                    matchStats.round++;
                                    startNextRound();
                                    editEmbed();
                                    matchStats.turn = 1;
                                    if (matchStats.counter > 0) matchStats.counter--;
                                    return;
                                };

                                // Enemy ability
                                if (myChar.id !== 4767 && eAbility && eStatsC.sm >= eAbility.cost && Math.random() < 0.66) {
                                    eStatsC.sm -= eAbility.cost;
                                    eAbility.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    editEmbed();
                                    if (matchStats.ended) return;
                                };

                                // Enemy ATK
                                if (eStatsC.refuseATK) {
                                    let notif = `✨ **${enemy.name}** refuses to ATK`;
                                    if (eStatsC.refuseATKMessage) {
                                        if (Array.isArray(eStatsC.refuseATKMessage)) {
                                            notif = `${eStatsC.refuseATKMessage[Math.floor(Math.random() * eStatsC.refuseATKMessage.length)]}`;
                                        } else {
                                            notif = eStatsC.refuseATKMessage;
                                        };
                                    };
                                    notice.push(`\n${notif}`);
                                    matchStats.turn = 1;
                                    matchStats.round++;
                                    startNextRound();
                                    editEmbed();
                                } else {
                                    if (eStatsC.replaceButton?.atk?.run !== undefined) {
                                        eStatsC.replaceButton.atk.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    } else dealDamage(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, `<a:phanATK:1512108126109827172> **${enemy.name}**`, { magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    matchStats.turn = 1;
                                    matchStats.round++;
                                    startNextRound();
                                    editEmbed();
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

                    const userAttack = async () => {
                        if (matchStats.turn === 1) {
                            if (myStatsC.timeFrozen) {
                                if (myStatsC.frozenMessage) notice.push(`\n✨ **${myChar.name}** ${myStatsC.frozenMessage} and can't act!`);
                                editEmbed();
                                matchStats.turn = 0;
                                attack();
                                return;
                            };
                            matchStats.turn = 0;

                            // If attack was replaced
                            if (myStatsC.replaceButton.atk?.run) {
                                await myStatsC.replaceButton.atk.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                                // Event Triggers
                                matchStats.trigger("ATK", myStatsC, eStatsC, buffs, eBuffs);
                                matchStats.trigger("action", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                if (matchStats.turn === 0) attack();
                            }

                            // Normal attack
                            else {
                                dealDamage(eStatsC, myStatsC, eBuffs, buffs, matchStats, notice, `⚔️ **${myChar.name}**`, { block: true, magicDamage: true, combodmg: true, selfdmg: true, selfheal: true });

                                // Event Triggers
                                matchStats.trigger("ATK", myStatsC, eStatsC, buffs, eBuffs);
                                matchStats.trigger("action", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);

                                attack();
                            }

                        } else matchStats.sendWarning({ content: "Please wait a moment", ephemeral: true });
                    };
                    atk.on('collect', async (rr) => {
                        await userAttack();
                    });

                    const userDefense = async () => {
                        if (matchStats.turn === 1) {
                            if (myStatsC.timeFrozen) {
                                if (myStatsC.frozenMessage) notice.push(`\n✨ **${myChar.name}** ${myStatsC.frozenMessage} and can't act!`);
                                editEmbed();
                                matchStats.turn = 0;
                                attack();
                                return;
                            };
                            matchStats.turn = 0;
                            myStatsC.attackStreak = 0;

                            // If defense was replaced
                            if (myStatsC.replaceButton.def?.run) {
                                await myStatsC.replaceButton.def.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                                // Event Triggers
                                matchStats.trigger("DEF", myStatsC, eStatsC, buffs, eBuffs);
                                matchStats.trigger("action", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                if (matchStats.turn === 0) attack();
                            }

                            // Use defense
                            else {
                                if (++matchStats.defUsed === 10) matchStats.sendWarning({ content: `You have used DEF 10 times and won't get any ${customEmojis.def} or ${customEmojis.mr} from now on!`, ephemeral: true });
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
                                matchStats.trigger("action", myStatsC, eStatsC, buffs, eBuffs);

                                attack();
                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            }

                        } else matchStats.sendWarning({ content: "Please wait a moment", ephemeral: true });
                    };
                    def.on('collect', async (rr) => {
                        await userDefense();
                    });

                    const userAbility = async () => {
                        if (myStatsC.isAbilityBlocked) return matchStats.sendWarning({ content: `You currently can't use your character ability`, ephemeral: true });

                        if (myStatsC.timeFrozen) {
                            if (myStatsC.frozenMessage) notice.push(`\n✨ **${myChar.name}** ${myStatsC.frozenMessage} and can't act!`);
                            editEmbed();
                            matchStats.turn = 0;
                            attack();
                            return;
                        };

                        // If ability was replaced
                        if (myStatsC.replaceButton.ability?.run && matchStats.turn === 1) {
                            matchStats.turn = 0;
                            myStatsC.attackStreak = 0;
                            const response = await myStatsC.replaceButton.ability.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                            // Event Triggers
                            if (response === AbilityResponse.SUCCESS) {
                                matchStats.trigger("ABILITY", myStatsC, eStatsC, buffs, eBuffs);
                                matchStats.trigger("action", myStatsC, eStatsC, buffs, eBuffs);
                            };

                            editEmbed();
                            Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            attack();
                        }

                        else {
                            if (!myAbility?.ability) return matchStats.sendWarning({ content: `You don't have an ability`, ephemeral: true });
                            if (myAbility.used < myAbility.usage) {
                                if (matchStats.turn === 1) {
                                    if (myAbility.cost > myStatsC.sm) matchStats.sendWarning({ content: `You don't have enough mana! (**${myStatsC.sm}**/${myAbility.cost}${customEmojis.mana})`, ephemeral: true });
                                    else {
                                        matchStats.turn = 0;
                                        myStatsC.attackStreak = 0;
                                        myAbility.used++;
                                        const response = await myAbility.ability(myStatsC, myStats, eStatsC, eStats, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, msg);
                                        myStatsC.sm -= myAbility.cost;

                                        // Event Triggers
                                        if (response === AbilityResponse.SUCCESS) {
                                            matchStats.trigger("ABILITY", myStatsC, eStatsC, buffs, eBuffs);
                                            matchStats.trigger("action", myStatsC, eStatsC, buffs, eBuffs);
                                        };

                                        editEmbed();
                                        Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                        attack();
                                    };
                                } else matchStats.sendWarning({ content: "Please wait a moment", ephemeral: true });
                            } else matchStats.sendWarning({ content: `You can use **${myChar.name}**'s ability only ${myAbility.usage == 1 ? "once" : `${myAbility.usage} times`} per fight.`, ephemeral: true });
                        };
                    };
                    ability.on('collect', async (rr) => {
                        await userAbility();
                    });

                    const userSkill = async () => {
                        if (myStatsC.timeFrozen) {
                            if (myStatsC.frozenMessage) notice.push(`\n✨ **${myChar.name}** ${myStatsC.frozenMessage} and can't act!`);
                            editEmbed();
                            matchStats.turn = 0;
                            attack();
                            return;
                        };

                        // If class active was replaced
                        if (myStatsC.replaceButton.cskill?.run && matchStats.turn === 1) {
                            matchStats.turn = 0;
                            myStatsC.attackStreak = 0;
                            const response = await myStatsC.replaceButton.cskill.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                            // Event Triggers
                            if (response === AbilityResponse.SUCCESS) {
                                matchStats.trigger("CSKILL", myStatsC, eStatsC, buffs, eBuffs);
                                matchStats.trigger("action", myStatsC, eStatsC, buffs, eBuffs);
                            };

                            editEmbed();
                            Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            if (matchStats.turn === 0) attack();
                        }

                        // Class active
                        else {
                            if (!skill) return matchStats.sendWarning({ content: `You don't have a class skill`, ephemeral: true });
                            if (myChar.id === 4767) return matchStats.sendWarning({ content: "Asta can't use any abilities", ephemeral: true });
                            if (skill.cost > myStatsC.sm) return matchStats.sendWarning({ content: `You don't have enough mana! (**${myStatsC.sm}**/${skill.cost}${customEmojis.mana})`, ephemeral: true });
                            else {
                                if (matchStats.turn === 1) {
                                    myStatsC.sm -= skill.cost;
                                    myStatsC.attackStreak = 0;
                                    const response = await skill.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user, stats.chars);

                                    // Event Triggers
                                    if (response === AbilityResponse.SUCCESS) {
                                        matchStats.trigger("CSKILL", myStatsC, eStatsC, buffs, eBuffs);
                                        matchStats.trigger("action", myStatsC, eStatsC, buffs, eBuffs);
                                    };

                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                } else matchStats.sendWarning({ content: "Please wait a moment", ephemeral: true });
                            };
                        };
                    };
                    cskill.on('collect', async (rr) => {
                        await userSkill();
                    });

                    const userSkip = async () => {
                        if (matchStats.turn == 1) {
                            if (myStatsC.replaceButton.skip?.run) {
                                matchStats.turn = 0;
                                myStatsC.attackStreak = 0;
                                await myStatsC.replaceButton.skip.run(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                                matchStats.trigger("action", myStatsC, eStatsC, buffs, eBuffs);

                                editEmbed();
                                Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                if (matchStats.turn === 0) attack();
                            } else {
                                notice.push(`\n<a:exit:1511883591532019804> ${myChar.name} fled the fight`);
                                endMatch("l");
                                editEmbed();
                            };
                        } else {
                            matchStats.sendWarning({ content: "Please wait a moment", ephemeral: true });
                        };
                    };
                    skip.on('collect', async (rr) => {
                        await userSkip();
                    });

                    setTimeout(() => {
                        if (resolved) return;
                        atk.stop(); def.stop(); ability.stop(); cskill.stop(); skip.stop();
                        endMatch("l");
                        editEmbed();
                    }, FIGHT_DURATION * 1000);

                    checkPlayerFrozen();

                });

            });
            if (result && interaction.channel?.isSendable()) interaction.channel.send({ embeds: [result] }).catch(() => null);
        };

        newFight();
    },
};

export default exportCommand;
