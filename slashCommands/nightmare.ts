import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ChatInputCommandInteraction, SelectMenuComponentOptionData } from "discord.js";
import { abilities } from "../Modules/abilities";
import { classes } from "../Modules/classes";
import { curses } from "../Modules/curses";
import { floors } from "../Modules/enemies";
import { armorInfo, items, ringInfo, weaponInfo } from "../Modules/items";
import { skills, crazeBossAbilities } from "../Modules/skills";
import { characters } from "../Modules/chars";
import { getDetailedStats, customEmojis, dealDamage, search, searchClass, searchItem, classLevelToXP } from "../Modules/functions";
import Avalon from "../Modules/avalon";
import buffInfo from "../Modules/buffs";
import _ from 'lodash';
import { CompactUserSchema, DetailedStats, SlashCommand, UpdateUserOptions } from '../types';
import { getPartyMembers, updateUsers } from '../Modules/queries';
import { AbilityResponse } from '../Modules/components';
import { nightmares } from '../Modules/nightmare';

const dungeonInProgress = new Map();
const crazeLevelSelected = new Map();
const embedColor = 0x034f20;

const startDate = new Date('2024-12-22T00:00:00');

const getNightmareMobCurse = {
    0: 8,

    2: 12,

    9: 4,

    13: 8,

    16: 11,
} as const;

const nightmareLore = {
    "summer2025" : { 
        "Tidalfish" : ["Try dealing magic damage!", "", ], 
        "Sand Golem" : ["Try dealing physical damage!"], // Infinite MR
        "Bubble Captain" : ["I wonder who it could be... <:Heh:928368727588757504>"], // Use luffy
        "Icecream" : ["Only those with a higher capacity for magic may stand before her"], // Have a larger mana pool than her
        "Solarion": ["GMT+13"], // Fight him between 08:00-16:00
    },
};

const randomBuffs = {

};

function getNightmareButtonRow(tab: string, level: number): ActionRowBuilder<ButtonBuilder> {
    const buttons = [
        new ButtonBuilder()
            .setCustomId('play')
            .setLabel("Start Nightmare")
            .setStyle(ButtonStyle.Success)
            .setDisabled(tab === "lore"),
        new ButtonBuilder()
            .setCustomId('lore')
            .setLabel(tab === "overview" ? "Show Lore" : "Show Overview")
            .setStyle(ButtonStyle.Primary),
    ];

    if (tab === "overview") {
        buttons.push(
            new ButtonBuilder()
                .setCustomId('ignore_defer-edit')
                .setLabel(`Edit Build`)
                .setStyle(ButtonStyle.Secondary)
        );
    }

    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(...buttons);
}

function getModal(uid: string) {
    return new ModalBuilder()
        .setCustomId('edit_nightmare_' + uid)
        .setTitle('Edit Build')
        .addComponents(
            // new ActionRowBuilder<TextInputBuilder>().addComponents(
            //     new TextInputBuilder()
            //         .setCustomId('char')
            //         .setLabel("Character name or ID")
            //         .setStyle(TextInputStyle.Short)
            //         // .setMinLength(16)
            //         // .setMaxLength(20)
            //         .setPlaceholder('E.g. Luminous EX (type "remove" to remove)')
            //         .setRequired(false)
            // ),
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
            )
        );
};

function levelSelection(interaction: ChatInputCommandInteraction, stats: CompactUserSchema): Promise<number> {
    return new Promise((resolve) => {
        let level = crazeLevelSelected.get(interaction.user.id) ?? 0;

        const currentNightmare = nightmares[level];
        const preselectedChar = currentNightmare.preSelectedChar;
        // EDIT BACK LATER
        // let levelsUnlocked = 9999; startDate; // Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
        let levelsUnlocked = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        let options: SelectMenuComponentOptionData[] = [];
        nightmares.slice(0, levelsUnlocked).forEach((e) => {
            options.push({
                label: `Level ${e.id + 1}: ${e.name}`,
                // emoji: (e.id in stats.craze_levels) ? stats.craze_levels[e.id] ? '<:check_icon:683671903143067743>' : '<:stop_icon:683671917353369600>' : '<:pause:690939144225947668>',
                // description: `${e.name}`,
                value: `${e.id}`,
            });
        });
        let tab: "overview" | "lore" = "overview";
        // const selectionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        //     .addComponents(
        //         new StringSelectMenuBuilder()
        //             .setCustomId('nightmare_selection')
        //             .setPlaceholder('Select your nightmare...')
        //             .addOptions(options),
        //     );

        // const getButtonRow = () => {
        //     return new ActionRowBuilder<ButtonBuilder>()
        //         .addComponents(
        //             new ButtonBuilder()
        //                 .setCustomId('play')
        //                 .setLabel("Start Nightmare")
        //                 .setStyle(ButtonStyle.Success),
        //             // .setDisabled(level < 13),
        //             new ButtonBuilder()
        //                 .setCustomId('ignore_defer-edit')
        //                 .setLabel(`Edit Build`)
        //                 .setStyle(ButtonStyle.Primary),
        //             new ButtonBuilder()
        //                 .setCustomId('lore')
        //                 .setLabel(`Lore`)
        //                 .setStyle(ButtonStyle.Primary),
        //         );
        // };
        console.log(characters[preselectedChar].name)
        const getDesc = () => {
            if (tab === "overview") {
            return `### 🌙 Nightmare\nPush your limits in a new survival mode where the challenge never stops growing!\nAfter each win, you pick one of three random buffs that will stack for the rest of your run until you lose. Get an <a:EXTRA:1138530846144462968> pull for successfully clearing a level! You can use any class and items you want! A new level unlocks daily.`
                // + "\n\n⚠️ The event has ended! Only level 14 will stay open for a while longer."
                + `\n### Your Character\n**Name**: ${preselectedChar ? characters[preselectedChar].name + " Lvl. 70" : "`None`"}\n**Class**: ${"class" in stats.craze_equipment ? classes[stats.craze_equipment.class].name + classes[stats.craze_equipment.class].emblem + "Lvl. 120" : "`None`"}\n**Equipment**: ${"weapon" in stats.craze_equipment ? (isNaN(stats.craze_equipment.weapon.split(":")[0]) ? stats.craze_equipment.weapon : items[stats.craze_equipment.weapon.split(":")[0]].emoji) : "<:sword_empty:1034502134474997790>"}${"shield" in stats.craze_equipment ? items[stats.craze_equipment.shield.split(":")[0]].emoji : "<:shield_empty:1087089686809415730>"} ${"helmet" in stats.craze_equipment ? items[stats.craze_equipment.helmet.split(":")[0]].emoji : "<:helmet_empty:1034499888878198885>"}${"cuirass" in stats.craze_equipment ? items[stats.craze_equipment.cuirass.split(":")[0]].emoji : "<:cuirass_empty:1034499890165858305>"}${"gloves" in stats.craze_equipment ? items[stats.craze_equipment.gloves.split(":")[0]].emoji : "<:gloves_empty:1034499892409794570>"}${"boots" in stats.craze_equipment ? items[stats.craze_equipment.boots.split(":")[0]].emoji : "<:boots_empty:1034499893919764480>"}${("weapon" in stats.craze_equipment || "shield" in stats.craze_equipment || "helmet" in stats.craze_equipment) ? " Lvl. 70/70" : ""}`;
            } else if (tab === "lore") {
                return `### ${currentNightmare.name}\n${nightmareLore["summer2025"]?.[currentNightmare.name as keyof typeof nightmareLore["summer2025"]]?.join("\n")}`;
            }
            return "";
        };

        const Embed = new EmbedBuilder()
            .setColor(embedColor)
            .setThumbnail("https://i.ibb.co/HxQCPq9/image.png")
            .setDescription(getDesc())
            .setFooter({ text: levelsUnlocked > nightmares.length - 1 ? `All levels have been unlocked!` : `Next level unlocks in ${(23 - new Date().getHours()) ? `${23 - new Date().getHours()}h ` : ""}${60 - new Date().getMinutes()}min` });
        interaction.reply({ embeds: [Embed], components: [getNightmareButtonRow("overview", level)] }).then((msg) => {
            const play = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "play", componentType: ComponentType.Button, time: 90000 });
            const edit = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ignore_defer-edit", componentType: ComponentType.Button, time: 90000 });
            // const select = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "nightmare_selection", componentType: ComponentType.StringSelect, time: 90000 });
            const lore = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "lore", componentType: ComponentType.Button, time: 90000 });

            play.on('collect', () => {
                if (!("char" in stats.craze_equipment)) return interaction.followUp({ content: `Please select a character using the \`Edit Build\` button before playing`, ephemeral: true });
                if (dungeonInProgress.has(stats.id)) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`You can play again in${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000) > 0 ? ` **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000)}**min` : ""} **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 1000) % 60}**s`);
                    return;
                };
                resolve(level);
                play.stop();
            });

            edit.on('collect', (rr) => {
                const uid = Math.random().toString(36).substring(2, 15);
                rr.showModal(getModal(uid));

                interaction.awaitModalSubmit({ filter: (r) => r.customId === ('edit_nightmare_' + uid), time: 90000 }).then(async (r) => {
                    // const char = r.fields.getTextInputValue('char');
                    const cls = r.fields.getTextInputValue('class');
                    const weapon = r.fields.getTextInputValue('weapon');
                    const shield = r.fields.getTextInputValue('shield');
                    const set = r.fields.getTextInputValue('set');

                    // Match character
                    // if (char) {
                    //     let getChar = search(char, stats.chars, interaction, true);
                    //     if (getChar?.name) {
                    //         stats.craze_equipment.char = getChar.id;
                    //     };
                    //     if (char === "remove") delete stats.craze_equipment.char;
                    // };

                    // Match class
                    if (cls) {
                        let getClass = searchClass(cls, interaction, true);
                        if (getClass?.name) {
                            stats.craze_equipment.class = getClass.id;
                        };
                        if (cls === "remove") delete stats.craze_equipment.class;
                    };

                    // Match weapon
                    if (weapon) {
                        if (weapon === "<:GojoHeart:1194021178029920266>") {
                            stats.craze_equipment.weapon = "<:GojoHeart:1194021178029920266>";
                        } else {
                            let getWeapon = searchItem(weapon, interaction, true);
                            if (getWeapon?.name) { // && getWeapon.type !== "shield") {
                                stats.craze_equipment.weapon = `${getWeapon.id}:706183309943767112`;
                            };
                            if (weapon === "remove") delete stats.craze_equipment.weapon;
                        };
                    };

                    // Match shield
                    if (shield) {
                        let getShield = searchItem(shield, interaction, true);
                        if (getShield?.name && getShield.type === "shield") {
                            stats.craze_equipment.shield = `${getShield.id}:706183309943767112`;
                        };
                        if (shield === "remove") delete stats.craze_equipment.shield;
                    };

                    // Match set
                    if (set) {
                        let getSet = searchItem(set, interaction, true, { returnSet: true });
                        if (getSet && getSet instanceof armorInfo) {
                            let setItems = (items.filter((item) => (item instanceof armorInfo && getSet instanceof armorInfo && item.setname === getSet.setname)) ?? []) as armorInfo[];
                            if (setItems.find((item) => item.type === "helmet")) {
                                const helmet = setItems.find((item) => item.type === "helmet");
                                if (helmet) stats.craze_equipment.helmet = `${helmet.id}:706183309943767112`;
                            };
                            if (setItems.find((item) => item.type === "cuirass")) {
                                const cuirass = setItems.find((item) => item.type === "cuirass");
                                if (cuirass) stats.craze_equipment.cuirass = `${cuirass.id}:706183309943767112`;
                            };
                            if (setItems.find((item) => item.type === "gloves")) {
                                const gloves = setItems.find((item) => item.type === "gloves");
                                if (gloves) stats.craze_equipment.gloves = `${gloves.id}:706183309943767112`;
                            };
                            if (setItems.find((item) => item.type === "boots")) {
                                const boots = setItems.find((item) => item.type === "boots");
                                if (boots) stats.craze_equipment.boots = `${boots.id}:706183309943767112`;
                            };
                        };
                        if (set === "remove") {
                            delete stats.craze_equipment.helmet;
                            delete stats.craze_equipment.cuirass;
                            delete stats.craze_equipment.gloves;
                            delete stats.craze_equipment.boots;
                        };
                    };

                    // Update users table
                    await updateUsers(interaction.user.id, {
                        craze_equipment: { type: "set", value: stats.craze_equipment },
                    });

                    interaction.editReply({ embeds: [Embed.setDescription(getDesc())] });
                    r.reply({ content: `Edited Successfully!`, ephemeral: true });
                });
            });

            // select.on('collect', r => {
            //     r.deferUpdate().catch(() => {
            //         console.log(`ERROR Interaction Failed 'deferUpdate()', command: "${interaction.commandName}"`);
            //     });

            //     let readVal = parseInt(r.values[0]);
            //     if (readVal >= levelsUnlocked) readVal = 0;

            //     level = readVal;
            //     crazeLevelSelected.set(interaction.user.id, level);

            //     interaction.editReply({ embeds: [Embed.setDescription(getDesc())], components: [selectionRow, getButtonRow()] });
            // });

            lore.on('collect', () => {
                tab = (tab === "overview") ? "lore" : "overview";
                interaction.editReply({ embeds: [Embed.setDescription(getDesc())], components: [getNightmareButtonRow(tab, level)] })
            });

            play.on('end', () => {
                edit.stop(), lore.stop();
                resolve(-1);
            });

        });

    });
};

const exportCommand: SlashCommand = {
    name: 'nightmare',
    async execute({ interaction, author }) {

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        const stats = author.schema;

        // Level Selection
        let level = await levelSelection(interaction, stats);
        if (level === -1) return;

        // Set up restrictions
        // const cd = 8 * 60 * 1000;
        // if (dungeonInProgress.has(stats.id)) return interaction.channel.send(`You can play again in${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000) > 0 ? ` **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 60000)}**min` : ""} **${Math.floor((dungeonInProgress.get(stats.id) - new Date().getTime()) / 1000) % 60}**s`);
        // dungeonInProgress.set(stats.id, new Date().getTime() + cd);
        // setTimeout(() => {
        //     dungeonInProgress.delete(stats.id);
        //     // interaction.channel.send(`${interaction.user.toString()} is off </stampede:1111044852679979019> cooldown!`);
        // }, cd);

        // Equip Craze Build
        stats.battlechar = stats.craze_equipment.char as number;
        stats.char_ref[stats.battlechar] = 5;
        stats.shield_slot = 1;
        stats.level = 70;
        stats.bank = 1000000;
        if ("class" in stats.craze_equipment) {
            stats.class = stats.craze_equipment.class;
            stats.dungeon_classlevels = Object.fromEntries(Array.from({ length: classes.length }, (_, i) => [i, classLevelToXP(120)]));
        } else stats.class = null;
        if ("weapon" in stats.craze_equipment) stats.equipment.weapon = stats.craze_equipment.weapon;
        else delete stats.equipment.weapon;
        if ("shield" in stats.craze_equipment) stats.equipment.shield = stats.craze_equipment.shield;
        else delete stats.equipment.shield;
        if ("helmet" in stats.craze_equipment) stats.equipment.helmet = stats.craze_equipment.helmet;
        else delete stats.equipment.helmet;
        if ("cuirass" in stats.craze_equipment) stats.equipment.cuirass = stats.craze_equipment.cuirass;
        else delete stats.equipment.cuirass;
        if ("gloves" in stats.craze_equipment) stats.equipment.gloves = stats.craze_equipment.gloves;
        else delete stats.equipment.gloves;
        if ("boots" in stats.craze_equipment) stats.equipment.boots = stats.craze_equipment.boots;
        else delete stats.equipment.boots;

        // User stats
        let myChar = characters[stats.battlechar];
        let myStats = await getDetailedStats(myChar.id, stats, stats.dungeon_classlevels);

        myStats.thumbnail = myChar.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[myChar.id], stats.char_skin[myChar.id]);

        let myStatsC = { ...myStats };
        let myClass = myStats.class !== -1 ? classes[myStats.class] : undefined;
        let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : undefined;
        let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : undefined;

        // Party chars
        const partyQuery = stats.party ? await getPartyMembers(stats.party, { excludeIds: [interaction.user.id], hasChristmasChar: true }) : [];
        let partyChars = partyQuery.map((e) => characters[e.craze_equipment.char]);

        // Enemy Stats
        let enemy = nightmares[level].enemy;
        const curseRar = enemy.boss ? curses.filter((e) => e.tier) : curses.filter((e) => e.tier === 0);
        const curse = (level in getNightmareMobCurse) ? curses[getNightmareMobCurse[level as keyof typeof getNightmareMobCurse]] : curseRar[Math.floor(Math.random() * curseRar.length)];
        let eAbility = nightmares[level].enemy.ability;
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

        let resolved = false;
        async function matchResult(r: "w" | "l") {
            if (resolved) return;
            resolved = true;

            const Embed = new EmbedBuilder()
                .setColor(embedColor) // Blue: 
                .setThumbnail(myStatsC.thumbnail)
                .setTitle(`Christmas Craze (level ${level + 1})`)
                .setFooter({ text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
            if (r === "l") {
                // Clear restrictions
                dungeonInProgress.delete(stats.id);

                if (!(level in stats.craze_levels)) {
                    stats.craze_levels[level] = 0;

                    // Update users table
                    await updateUsers(interaction.user.id, {
                        craze_levels: { type: "set", value: stats.craze_levels },
                    });
                };
                return Embed.setDescription(`💀 **${myChar.name}** lost 💀\n<a:arrow_green:916716811842621450> Level ${level + 1} progress: **${stats.craze_levels[level]}**/${1}\n<a:arrow_red:916716702618767401> ${eStats.ep > myStats.ep ? `**${enemy.name}** was ${Math.floor((eStats.ep / myStats.ep) * 10000) / 100}% stronger` : "Better luck next time"}`);
            };

            stats.craze_levels[level] ||= 0;
            stats.craze_levels[level]++;

            // Coins
            let loot = 0;
            if (stats.craze_levels[level] < 30) {
                loot = 40 + Math.floor(Math.random() * 30) + (lootFloor < 100 ? lootFloor * 3 : 300 + (lootFloor * 1.5));
            };

            // Update users table
            const newUpdates: UpdateUserOptions = {
                craze_levels: { type: "set", value: stats.craze_levels },
            };
            if (stats.craze_levels[level] === 1) newUpdates.expulls = { type: "increment", value: 1 };
            if (loot) newUpdates.coins = { type: "increment", value: loot };
            await updateUsers(interaction.user.id, newUpdates);

            // Disable Loot
            // return Embed
            //     .setDescription(`<:stars_v2:917023655840591963> **${myChar.name}** won! <:stars_v2:917023655840591963>\n<a:arrow_green:916716811842621450> Level ${level + 1} progress: **${stats.craze_levels[level]}**/${1}\n\n<:npbag:929428030554787892> Loot\n\`disabled\`: The christmas craze event has long ended. It's been kept open by the request of players to use it as a trial substitude until that gets a better rework <:ThumbsUp:1020442047712350298>`)
            //     .setFooter({ text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) + "?size=2048" });

            return Embed
                .setDescription(`<:stars_v2:917023655840591963> **${myChar.name}** won! <:stars_v2:917023655840591963>\n<a:arrow_green:916716811842621450> Level ${level + 1} progress: **${stats.craze_levels[level]}**/${1}\n\n<:npbag:929428030554787892> Loot\n${stats.craze_levels[level] === 1 ? "1x <a:EXTRA:1138530846144462968>, " : ""}${loot ? `${loot}<:coins:872926669055356939>, ` : ""}`)
                .setFooter({ text: `Balance: ${stats.coins + loot} coins`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
        };

        let matchStats = Avalon.getMatchStats(interaction);
        matchStats.actionSequence = [];
        let notice = ["", "", "", ""];

        // Apply passives
        if(eAbility) await eAbility.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
        if (skill && myChar.id !== 4767) await skill.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
        if (myAbility?.passive) await myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.weapon !== -1) await (items[myStats.weapon] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.shieldid) await (items[myStats.shieldid] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.helmet && (items[myStats.helmet] as armorInfo).setname === (items[myStats.cuirass] as armorInfo).setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.gloves] as armorInfo).setname && (items[myStats.helmet] as armorInfo).setname === (items[myStats.boots] as armorInfo).setname) await (items[myStats.boots] as armorInfo)?.buff?.(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        if (myStats.ring1) await (items[myStats.ring1] as ringInfo).getBuff(myStats.ring1info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.ring2) await (items[myStats.ring2] as ringInfo).getBuff(myStats.ring2info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.ring3) await (items[myStats.ring3] as ringInfo).getBuff(myStats.ring3info?.level)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        // Cap mana to 150 if Artemis
        if (myChar.id === 17689) {
            myStats.mana = 149;
            myStatsC.mana = 149;
            if (myStatsC.sm > 149) {
                myStatsC.sm = 149;
                myStats.sm = myStatsC.sm;
            };
        };

        // // Level 11 2023
        // if (level === 10 && items[(stats.equipment.weapon ?? "").split(":")[0]].category === "fish") {
        //     eBuffs.def.push(new buffInfo("=", 0, 9999));
        //     eStatsC.def = 0;
        //     eBuffs.mr.push(new buffInfo("=", 0, 9999));
        //     eStatsC.mr = 0;

        //     buffs.atk.push(new buffInfo("+", Math.floor(myStats.atk * 2), 9999));
        //     myStats.atk += Math.floor(myStats.atk * 2);
        //     buffs.md.push(new buffInfo("+", Math.floor(myStats.md * 2), 9999));
        //     myStats.md += Math.floor(myStats.md * 2);
        // };

        let ATK_EMOJI = myStatsC.replaceButton?.atk?.emoji || '⚔️',
            DEF_EMOJI = myStatsC.replaceButton?.def?.emoji || '🛡️',
            ABILITY_EMOJI = myStatsC.replaceButton?.ability?.emoji || '✨',
            SKILL_EMOJI = myStatsC.replaceButton?.cskill?.emoji || '⚜️',
            SKIP_EMOJI = myStatsC.replaceButton?.skip?.emoji || '<:dodge_chance:1047269150948606063>';

        if (new Date().getMonth() === 11 || interaction) ATK_EMOJI = '<:sw:1030154812496560218>', DEF_EMOJI = '<:sh:1030154814652420127>', ABILITY_EMOJI = '<:sp:1030154816288198768>', SKILL_EMOJI = '<:fl:1030154818746069012>', SKIP_EMOJI = '<:da:1188275191135092766>';

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

        // Fight Duration
        let fightDuration = 120;

        // Level 14 2024
        if (level === 14) {
            fightDuration = 300;
        };

        const isCompactEmbed = !!author.schema.user_settings.compact_battle_embeds;
        const threatLevelWarning = isCompactEmbed ? "" : `You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n`;

        async function newFight() {
            let timestart = new Date().getTime();
            let result = await new Promise<EmbedBuilder | undefined>((resolve) => {
                const Embed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setThumbnail(isCompactEmbed ? eStatsC.image : myStatsC.thumbnail)
                    .setFooter({ text: `Enemy EP: ${eStatsC.ep} | round 1 | time left: ${fightDuration}s` })
                    .setTitle(`Christmas Craze (level ${level + 1})`)
                    .setDescription(`${threatLevelWarning}${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}\\💖${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStats.hp, eStatsC.sm / eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStats.hp}\\💖${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana)}\n${Avalon.padStats(myStatsC)}`)
                    .setImage(isCompactEmbed ? null : eStatsC.image);
                interaction.editReply({ embeds: [Embed], components: [row] }).then(msg => {

                    const atk = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ATK", componentType: ComponentType.Button, time: fightDuration * 1000 });
                    const def = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "DEF", componentType: ComponentType.Button, time: fightDuration * 1000 });
                    const ability = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "ABILITY", componentType: ComponentType.Button, time: fightDuration * 1000 });
                    const cskill = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKILL", componentType: ComponentType.Button, time: fightDuration * 1000 });
                    const skip = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "SKIP", componentType: ComponentType.Button, time: fightDuration * 1000 });
                    matchStats.collector = { "atk": atk, "def": def, "ability": ability, "cskill": cskill, "skip": skip };

                    // Use passives
                    if (myChar.id !== 4767) curse.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);

                    let timeout: NodeJS.Timeout | undefined;
                    async function editEmbed() {
                        Embed.setDescription(`${threatLevelWarning}${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}${eStatsC.shield > 0 ? `+ **${eStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${eStatsC.sm}**/${eStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(eStatsC.hp / eStatsC.maxhp, eStatsC.sm / eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}${myStatsC.shield > 0 ? `+ **${myStatsC.shield}** ${customEmojis["shield"]}` : ""}, **${myStatsC.sm}**/${myStatsC.mana}${customEmojis.mana})\n${Avalon.hpbar(myStatsC.hp / myStatsC.maxhp, myStatsC.sm / myStatsC.mana)}\n${Avalon.padStats(myStatsC)}\n-----------------------------------${notice.slice(-(parseInt(author.schema.user_settings.battle_log_length || "4") || 4)).join("")}`);
                        Embed.setFooter({ text: `Enemy EP: ${eStatsC.ep} | round ${matchStats.round} | time left: ${fightDuration + Math.floor((timestart - new Date().getTime()) / 1000)}s` });
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

                        // Level 13 2024
                        if (level === 13) {
                            //@ts-ignore
                            wORl = eAbility.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                        };

                        atk.stop(), def.stop(), skip?.stop(), ability?.stop(), cskill?.stop();
                        if (wORl === "l") notice.push(`\n💀 **${myChar.name}** lost`);
                        else notice.push(`\n🎉 **${myChar.name}** won`);
                        // else notice.push(`\n🎉 **${myChar.name}** won${level === 13 && stats.craze_equipment.weapon === "<:GojoHeart:1194021178029920266>" ? " <:GojoHeart:1194021178029920266>" : ""}`);
                        editEmbed();
                        matchStats.turn = 1;
                        resolve(matchResult(wORl));
                    };

                    // // Level 14 2023
                    // if (level === 13 && stats.craze_equipment.weapon === "<:GojoHeart:1194021178029920266>") {
                    //     eStatsC.hp = 0;
                    //     endMatch("w");
                    // };

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

                                // Level 14 2024
                                if (level === 14) {
                                    const availableEmojis = ['🌼', '🌻', '🌱', '🐝', '🪲', '🐞', '🦋', '🐛', '🐸', '🍡', '🎐'];
                                    const randomEmoji = availableEmojis[Math.floor(Math.random() * availableEmojis.length)];
                                    if (notice[notice.length - 1].length > 5 && !(eStatsC.hp < eStatsC.maxhp)) notice.push(`\n ${randomEmoji}`);

                                    matchStats.turn = 1;
                                    matchStats.round++;
                                    startNextRound();
                                    editEmbed();
                                    return;
                                };

                                if (matchStats.blockAbilities-- <= 0 && myChar.id !== 4767 && eStatsC.sm >= curse.cost && Math.random() < 0.3) {
                                    curse.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
                                    eStatsC.sm -= curse.cost;
                                    editEmbed();
                                    Avalon.checkIfEnded(myStatsC, eStatsC, buffs, eBuffs, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                                    attack();
                                } else if ((eStatsC.forceUseSkillOnRound === matchStats.round && forcedSkillUse++ === 0) || ("forceUseSkillOnRound" in eStatsC ? false : (matchStats.blockAbilities-- < 0 && myChar.id !== 4767 && eAbility && eStatsC.sm >= eAbility.cost && Math.random() < 0.5))) {
                                    if(eAbility) eAbility.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed, interaction.user);
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
                            matchStats.actionSequence.push("ATK");

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
                            matchStats.actionSequence.push("DEF");

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
                            matchStats.actionSequence.push("ABILITY");

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
                                        matchStats.actionSequence.push("ABILITY");
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
                            matchStats.actionSequence.push("SKILL");
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
                                    matchStats.actionSequence.push("SKILL");
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
                            matchStats.actionSequence.push("SKIP");

                            // Level 11 2024
                            if (level === 11 && myChar.id === 14982 && partyChars.some((e) => e.name === "Smokey Brown")) {
                                notice.push(`\n<:dodge_chance:1047269150948606063> NIGERUNDAYO, SMOKEY!`);
                                endMatch("w");
                                editEmbed();
                                return;
                            };

                            notice.push(`\n<:dodge_chance:1047269150948606063> ${myChar.name} fled the fight`);
                            endMatch("l");
                            editEmbed();
                        } else {
                            interaction.followUp({ content: "Please wait a moment", ephemeral: true });
                        };
                    });

                    atk.on('end', () => {
                        if (fightDuration + Math.floor((timestart - new Date().getTime()) / 1000) < 1) {
                            atk.stop(), def.stop(), ability.stop(), cskill.stop();
                            if (resolved) return;

                            // // Level 14 2023
                            // if (level === 13 && myChar.name === "Suguru Getou" && partyChars.some((e) => e.name === "Prison Realm")) {
                            //     notice.push(`\n🎉 **Satoru Gojo** was sealed!`);
                            //     editEmbed();
                            //     resolve(matchResult("w"));
                            // } else {
                            //     resolve(matchResult("l"));
                            // };

                            resolve(matchResult("l"));
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
