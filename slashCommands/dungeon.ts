import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ChatInputCommandInteraction, ButtonStyle } from "discord.js";
import { CompactUserSchema, DetailedStats, SlashCommand } from '../types';
import { abilities } from "../Modules/abilities";
import { achievements } from "../Modules/achievements";
import { classes } from "../Modules/classes";
import { curses } from "../Modules/curses";
import { floors } from "../Modules/enemies";
import { armorInfo, items, ringInfo, weaponInfo } from "../Modules/items";
import { skills, bossAbilities } from "../Modules/skills";
import { characters } from "../Modules/chars";
import { dailies } from "../Modules/dailyQuests";
import { getDetailedStats, customEmojis, dealDamage, generateCaptcha, addGuildDonation, formatNumberWithQuotes } from "../Modules/functions";
import { requestVerification, dungeonTempBan } from "../Modules/components";
import Avalon from "../Modules/avalon";
import buffInfo from "../Modules/buffs";
import _ from 'lodash';
import { getGuildSchema, getUserSchema, updateUsers } from '../Modules/queries';

const dungeonInProgress = new Set();
const captchaCooldown = new Map();

function drops(p: number, max: number = 1, n: number = 0) {
    for (let i = 0; i < max; i++) n += (p > Math.random() ? 1 : 0);
    return n;
};

function waitForTutorial(interaction: ChatInputCommandInteraction, stats: CompactUserSchema): Promise<number> {
    return new Promise((resolve) => {
        let row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('continue')
                    .setLabel('Continue')
                    .setStyle(ButtonStyle.Success),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('skip')
                    .setLabel('Skip')
                    .setStyle(ButtonStyle.Primary),
            );

        let page = 0;
        const pages = [
            ["Welcome to the dungeon!", "The dungeon is a dangerous place filled with ferocious monsters only for the bravest of adventurers to enter! It contains various items of value, promising its challengers all the riches and prestige there is to obtain in this world!\n\nBut don't let that scare you, I'm here to help and I'm certainly rooting for you <:TohruPoint:928370972132782090>"],
            ["Dungeon Monsters", "The dungeon is a massive construct reaching deep under the ground. There are various monsters roaming in the dungeon, the stronger ones deeper in there than the others.\n\nThe trickiest part will be the **boss floors** on every `5th` floor where you will encounter floor guardians stronger than anything you've seen up to that point.\n\nMonsters can have a set of abilities called **curses** <:Common_Curse:952175936554557530> which can affect the way they fight. Be especially careful around boss monsters, not only do they have curses <:Rare_Curse:952175947409408041> stronger than those of average monsters, but each one of them also has a unique ability, making their movements difficut to predict."],
            ["Stats", "Both monsters and characters have the following stats:\n\n❤️`Health Points`⚔️`Attack      `🛡️`Defense        `\n💠`Shield       `🪄`Magic Damage`🔰`Magic Resist   `\n🎯`Crit Rate    `💥`Crit Damage `🛡️`Block Rate     `\n💨`Dodge Chance `💧`Mana        `💦`Mana Generation`\n\nYou can increase your stats by leveling your character, class and items. You can find a more detailed guide on this in our </support:1011293280702578694> server <:ThumbsUp:1020442047712350298>"],
            ["Player Actions", `There are 5 possible actions you can decide on taking during a battle, which are as follows:\n\n⚔️ **ATK** ➜ A simple attack to deal damage to your enemy.\n🛡️ **DEF** ➜ Increases your characters defense and magic resistance. You'll have a chance of blocking the next attack.\n✨ **ABILITY** ➜ Some characters have unique abilities you can use during the battle. ${(stats.battlechar ?? "") in abilities ? "You can read about your characters ability with `/ability`!" : "Unfortunately your current character does't seem to have an ability."} Abilities consume mana💧\n⚜️ **SKILL** ➜ Class skills are abilities obtained from your class.${stats.class ? ` Your current class ${classes[stats.class].active.toLowerCase()}` : ""} Skills consume mana💧\n⏩ **SKIP** ➜ Skip to the results of the battle.`],
            ["You're finally ready!", "That's all I can teach you for now. The rest is up to you! <:ThumbsUp:1020442047712350298>\n\nSee you soon, I'll be watching you <:MashaWave:928370055354400799> Good Luck!"],
        ];

        const Embed = new EmbedBuilder()
            .setColor(0xbbffff)
            .setTitle(pages[page][0])
            .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
            .setDescription(pages[page][1]);
        interaction.editReply({ embeds: [Embed], components: [row] }).then((msg) => {
            const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "continue", componentType: ComponentType.Button, time: 180000 });
            const skip = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "skip", componentType: ComponentType.Button, time: 180000 });

            collector.on('collect', async () => {
                if (++page === pages.length) {
                    collector.stop(), skip.stop();
                    await updateUsers(interaction.user.id, { tutorial: { type: 'append_unique', value: [8] } });
                    resolve(1);
                } else {
                    Embed.setTitle(pages[page][0]).setDescription(pages[page][1]);
                    interaction.editReply({ embeds: [Embed], components: [row] });
                };
            });

            skip.on('collect', async () => {
                collector.stop(), skip.stop();
                await updateUsers(interaction.user.id, { tutorial: { type: 'append_unique', value: [8] } });
                resolve(1);
            });
        });
    });
};

const exportCommand: SlashCommand = {
    name: 'dungeon',
    async execute({ interaction, author }) {

        try {
            await interaction.deferReply();
        } catch (err) {
            return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
        };

        const customSettings = JSON.parse(fs.readFileSync('Storage/customSettings.json', 'utf8'));

        let choice = interaction.options.getInteger('floor');
        let floorDiff = parseInt(interaction.options.getString('difficulty') || "-1");
        let flag = interaction.options.getString('flag');

        const stats = author.schema;
        if (stats.battlechar === null || !stats.chars.includes(stats.battlechar)) return interaction.editReply("You have to choose a battle character first. Use `/select <char name>` to choose one.");

        const guild = stats.guild ? await getGuildSchema(stats.guild) : undefined;

        // Tutorial
        if (!stats.tutorial.includes(8)) await waitForTutorial(interaction, stats);

        let floor = parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]);
        if (stats.dungeon_floors[floor] >= floors[floor]?.winsNeeded && floor !== 300) stats.dungeon_floors[++floor] = 0;
        if (floorDiff === -1) floorDiff = Math.floor((floor - 1) / 100);
        if (floorDiff > 2) floorDiff = 2;

        if (choice) {
            if (choice < 1) return interaction.editReply(`There is no floor ${choice} <:EmiliaWot:868996542080622603>`);
            if (choice + (floorDiff * 100) > floor) return interaction.editReply(`You haven't unlocked Floor ${choice} yet. You need ${floors[floor]?.winsNeeded} ${floors[floor]?.winsNeeded === 1 ? "win" : "wins"} on floor \`${Math.min(floor, 100)}/${floor <= 100 ? 0 : Math.min(floor - 100, 100)}/${Math.max(floor - 200, 0)}\` to unlock the next one.`);
            floor = Math.round(choice + (floorDiff * 100));
        };
        if (floor > 300) floor = 300;

        // Increase limit
        let dunLim = [10, 20, 800]; // [0] -> loot, [1] -> progress, [2] -> 2nd loot limit
        if (stats.premium) {
            switch (stats.premium) {
                case 1: dunLim = [12, 23, 800]; break;
                case 2: dunLim = [13, 25, 800]; break;
                case 3: dunLim = [15, 30, 800]; break;
                case 4: dunLim = [15, 32, 800]; break;
                case 5: dunLim = [16, 35, 800]; break;
                case 6: dunLim = [18, 36, 800]; break;
                case 7: dunLim = [20, 40, 800]; break;
                default: false; break;
            };
        };

        // Check if user can skip
        if (flag === "all" && stats.premium < 3) return interaction.editReply("This is a `/premium` feature. If you like the bot and want to help us out we'd appreciate your support <:RaphiSmile:868998036645380197>");
        if ((flag === "skip" || flag === "all") && dunLim[0] - stats.dungeon_limit <= 0) return interaction.editReply("You've already used up all your skips for this interval.");

        // Captcha
        if (!requestVerification.has(interaction.user.id) && stats.dungeon_limit > 100 && Math.random() < 0.005 && !captchaCooldown.has(interaction.user.id)) requestVerification.set(interaction.user.id, { repeats: 0 });
        if (requestVerification.has(interaction.user.id)) {
            const captcha = generateCaptcha();
            clearTimeout(requestVerification.get(interaction.user.id).timeout);
            requestVerification.set(interaction.user.id, { text: captcha.text, repeats: requestVerification.get(interaction.user.id).repeats + 1, timeout: setTimeout(() => requestVerification.delete(interaction.user.id), 60 * 60 * 1000) });

            // Temp ban
            if (requestVerification.get(interaction.user.id).repeats > 4) {
                clearTimeout(dungeonTempBan.get(interaction.user.id)?.timeout);
                dungeonTempBan.set(interaction.user.id, { ends: (dungeonTempBan.get(interaction.user.id)?.ends || Date.now()) + (20 * 60 * 1000), timeout: setTimeout(() => dungeonTempBan.delete(interaction.user.id), ((dungeonTempBan.get(interaction.user.id)?.ends || Date.now()) + (20 * 60 * 1000)) - Date.now()) });
            };

            await updateUsers(interaction.user.id, { dungeon_responsetime: { type: 'append_unique', value: [new Date(), new Date()] } });

            // Captcha cooldown
            captchaCooldown.set(interaction.user.id, Date.now());
            setTimeout(() => captchaCooldown.delete(interaction.user.id), 10 * 60 * 1000);

            return interaction.editReply({ content: `${dungeonTempBan.has(interaction.user.id) ? `You have failed to enter the captcha many times in a row.\nYou have been temporarily banned from using \`/dungeon\` for the next **${Math.ceil((dungeonTempBan.get(interaction.user.id)?.ends - Date.now()) / (60 * 1000))}** min\nYou can check how much time is left with </cd:1010317417840390158>\n` : ""}Use </captcha:1114616338581823568> to enter the code`, files: [captcha.attachement] });
        };

        // Set up restrictions
        if (dungeonTempBan.has(interaction.user.id)) return interaction.editReply(`You have failed to enter the captcha many times in a row.\nYou have been temporarily banned from using \`/dungeon\` for the next **${Math.ceil((dungeonTempBan.get(interaction.user.id)?.ends - Date.now()) / (60 * 1000))}** min\nYou can check how much time is left with </cd:1010317417840390158>`);
        if (dungeonInProgress.has(stats.id)) return interaction.editReply("You already have a run in progress, please finish it before attempting to start a new round.");
        dungeonInProgress.add(stats.id);
        const userTimeout = setTimeout(() => dungeonInProgress.delete(stats.id), 120000);

        // Increase run count
        let skipRounds = 1;
        if (flag === "all") {
            skipRounds = dunLim[0] - stats.dungeon_limit;
            stats.dungeon_limit = dunLim[0];
        } else {
            stats.dungeon_limit++;
        };
        let skippedTotal = skipRounds;

        // Update users table
        await updateUsers(interaction.user.id, {
            dungeon_limit: { type: 'set', value: stats.dungeon_limit },
            dungeon_responsetime: { type: 'append_unique', value: [new Date()] },
        });

        // User stats
        let myChar = characters[stats.battlechar];
        let myStats = await getDetailedStats(myChar.id, stats, stats.dungeon_classlevels);

        myStats.thumbnail = myChar.getImage(stats.premium, customSettings[interaction.user.id]?.cimg[myChar.id], stats.char_skin[myChar.id]);

        let myStatsC: DetailedStats = { ...myStats };
        let myClass = myStats.class !== -1 ? classes[myStats.class] : undefined;
        let skill = myStats.class !== -1 ? _.cloneDeep(skills[myStats.class]) : undefined;
        let myAbility = myChar.id in abilities ? _.cloneDeep(abilities[myChar.id]) : undefined;


        // Enemy Stats
        let enemy = floors[floor].monster;
        const curseRar = enemy.boss ? curses.filter((e) => e.tier) : curses.filter((e) => e.tier === 0);
        const curse = curseRar[Math.floor(Math.random() * curseRar.length)];
        let eAbility = enemy.boss ? bossAbilities.find((e) => e.list[0] === floor) : undefined;
        let eImage = enemy.image[Math.floor(Math.random() * enemy.image.length)];

        let eStats = floors[floor].stats(enemy);
        eStats.image = eImage;
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

            const Embed = new EmbedBuilder()
                .setColor([0x6def83, 0xfac044, 0xff7d7d, 0x7c7c7c, 0xbbffff][threatLevel]) // Blue: 0x58b1ff
                .setThumbnail(myStatsC.thumbnail)
                .setTitle(`Dungeon Floor ${(floor - 1) % 100 + 1} ${enemy.boss ? "(Boss)" : ""}`);
            if (dunLim[0] - stats.dungeon_limit >= 0 || !myClass) Embed.setFooter({ text: `Balance: ${stats.coins} coins`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
            else Embed.setFooter({ text: `${myClass.name} level: ${myStats.clvl} | XP left: ${(myStats.clvl * 50) - (stats.dungeon_classlevels[myClass.id] - (myStats.clvl * (myStats.clvl - 1) * 25))}`, iconURL: myClass.image });
            if (r === "l") return Embed.setDescription(`💀 **${myChar.name}** lost 💀\n<a:arrow_green:916716811842621450> Floor ${floor} progress: **${stats.dungeon_floors[floor]}**/${floors[floor]?.winsNeeded}\n<a:arrow_orange:916716747623641210> Runs left: **${stats.dungeon_limit < dunLim[0] ? dunLim[0] - stats.dungeon_limit : 0}** + **${stats.dungeon_limit < dunLim[1] ? dunLim[1] - stats.dungeon_limit : 0}**\n<a:arrow_red:916716702618767401> ${eStats.ep > myStats.ep ? `**${enemy.name}** was ${Math.floor((eStats.ep / myStats.ep) * 10000) / 100}% stronger` : "Better luck next time"}`);

            if (dunLim[1] - stats.dungeon_limit >= 0 || stats.dungeon_floors[floor] >= floors[floor]?.winsNeeded) stats.dungeon_floors[floor] += ((skipRounds > 0 && skipRounds < 30) ? skipRounds : 1);

            let unlocked = `<a:arrow_green:916716811842621450> Floor ${floor} progress: **${stats.dungeon_floors[floor]}**/${floors[floor]?.winsNeeded}`;
            if (stats.dungeon_floors[floor] >= floors[floor]?.winsNeeded && floor !== 300) {
                if (stats.dungeon_floors[floor] === floors[floor]?.winsNeeded) {
                    unlocked = `🔑 Floor **${floor + 1}** has been unlocked`;
                    stats.dungeon_floors[floor + 1] = 0;
                };

                // Achievements
                achievements[34].check(interaction, interaction.user, floor + 1), achievements[35].check(interaction, interaction.user, floor + 1), achievements[36].check(interaction, interaction.user, floor + 1), achievements[37].check(interaction, interaction.user, floor + 1), achievements[38].check(interaction, interaction.user, floor + 1); // Challenger
            };

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
                // if (new Date().getDay() === 6 || new Date().getDay() === 0) boost *= 2;

                // Guild Buff
                if (guild) boost += (0.2 * guild.xpbuff);

                boost = Math.round(boost * 100) / 100;
                let cxp = Math.floor(((floor < 100 ? floor : 100 + (floor / 3)) + (Math.floor(Math.random() * 8))) * boost) + 12;
                cxp = Math.floor(cxp * 1.33);
                if (enemy.boss) cxp = Math.floor(cxp * 1.5);
                cxp = Math.floor(cxp * skipRounds);
                cxpmsg = `Class XP: **${cxp}** (Boost: x${boost})`; // `Class XP: **${cxp}** (Boost: x${boost}${new Date().getDay() === 6 || new Date().getDay() === 0 ? " weekend" : ""})`;
                if (myClass.id in stats.dungeon_classlevels) stats.dungeon_classlevels[myClass.id] += cxp;
                else stats.dungeon_classlevels[myClass.id] = cxp;
            };

            // Achievements
            if (floors[floor]?.boss) achievements[27].check(interaction, interaction.user, stats.dungeon_floors[floor]), achievements[28].check(interaction, interaction.user, stats.dungeon_floors[floor]), achievements[29].check(interaction, interaction.user, stats.dungeon_floors[floor]); // Coming Back
            achievements[39].check(interaction, interaction.user, myStatsC.hp), achievements[40].check(interaction, interaction.user, myStatsC.hp), achievements[41].check(interaction, interaction.user, myStatsC.hp); // Under Pressure
            achievements[55].check(interaction, interaction.user, floor, stats.dungeon_floors[floor] >= floors[floor]?.winsNeeded), achievements[56].check(interaction, interaction.user, floor, stats.dungeon_floors[floor] >= floors[floor]?.winsNeeded), achievements[57].check(interaction, interaction.user, floor, stats.dungeon_floors[floor] >= floors[floor]?.winsNeeded), achievements[58].check(interaction, interaction.user, floor, stats.dungeon_floors[floor] >= floors[floor]?.winsNeeded); // Challenger II

            // Coins
            let loot = 0;
            if (dunLim[0] >= stats.dungeon_limit) loot = Math.floor(60 + (Math.random() * 30) + (floor < 100 ? floor * 5 : 500 + (floor < 200 ? (floor - 100) * 2.5 : (300 + ((floor - 200) * 1)))));
            if (guild?.lootbuff) loot *= 1 + (0.2 * guild.lootbuff);
            loot *= matchStats.lootm;
            loot += matchStats.loot;
            loot = Math.floor(loot * skipRounds);
            if (loot > 500000) loot = 42187;

            // Guild Tax
            if (loot > 0 && guild && guild.tax) {
                const tax = Math.floor(loot * (guild.tax / 100));
                loot = Math.floor(loot - tax);
                await addGuildDonation(interaction.user, guild.id, tax, "coins");
            };

            // Crafting Resources
            let craftItem = items[33];
            // if (floor <= 20) craftItem = items[33];
            if (floor <= 50) craftItem = items[34];
            else if (floor <= 90) craftItem = items[35];
            else if (floor <= 120) craftItem = items[36];
            else if (floor <= 190) craftItem = items[37];
            else if (floor <= 270) craftItem = items[38];
            else if (floor <= 300) craftItem = items[39];

            // Chests
            let chestRarities = [451, 452, 453, 454];
            if (floor > 200) chestRarities = [453, 454, 456, 457];
            else if (floor > 100) chestRarities = [452, 453, 454, 456];
            let chestDrops = [0, 0, 0, 0];

            // Ascension Material
            let ascItem = items[enemy.loot[Math.floor(Math.random() * enemy.loot.length)]];

            let ssShards = 0, sShards = 0, aShards = 0, bShards = 0, cShards = 0, dShards = 0;
            let craftCount = 0;
            let ascCount = 0;

            // First loot cap
            if (dunLim[0] >= stats.dungeon_limit) {
                // Shards
                ssShards += drops(0.012, 3 * skipRounds);
                sShards += drops(0.018, 5 * skipRounds);
                aShards += drops(0.03, 7 * skipRounds);
                bShards += drops(0.072, 9 * skipRounds);
                cShards += drops(0.1, 12 * skipRounds);
                dShards += drops(0.14, 15 * skipRounds);

                // Crafting Resources
                craftCount += drops(0.4, 7 * skipRounds);

                // Ascension Materials
                ascCount += drops(0.6, 7 * skipRounds);

                // Chests
                chestDrops[0] += drops(0.11, skipRounds);
                chestDrops[1] += drops(0.055, skipRounds);
                chestDrops[2] += drops(0.027, skipRounds);
                chestDrops[3] += drops(0.012, skipRounds);
            } // Second Loot Cap
            else if (dunLim[2] >= stats.dungeon_limit) {
                // Crafting Resources
                craftCount += drops(0.08, 4 * skipRounds);

                // Ascension Materials
                ascCount += drops(0.11, 4 * skipRounds);

                // Chests
                chestDrops[0] += drops(0.055, skipRounds);
                chestDrops[1] += drops(0.03, skipRounds);
                chestDrops[2] += drops(0.016, skipRounds);
                chestDrops[3] += drops(0.0055, skipRounds);
            };

            // Levelup mats
            let levelupMats = {
                "50": floor <= 100 ? drops(0.2, 4 * skipRounds) : 0,
                "51": floor <= 100 ? drops(0.2, 8 * skipRounds) : 0,
                "52": floor <= 100 ? drops(0.12, 2 * skipRounds) : floor <= 200 ? drops(0.2, 4 * skipRounds) : 0,
                "53": floor <= 100 ? drops(0.12, 4 * skipRounds) : floor <= 200 ? drops(0.2, 8 * skipRounds) : 0,
                "54": floor > 200 ? drops(0.2, 4 * skipRounds) : floor > 100 ? drops(0.12, 2 * skipRounds) : 0,
                "55": floor > 200 ? drops(0.2, 8 * skipRounds) : floor > 100 ? drops(0.12, 4 * skipRounds) : 0,
                "56": floor > 200 ? drops(0.12, 2 * skipRounds) : 0,
                "57": floor > 200 ? drops(0.12, 4 * skipRounds) : 0,
            };

            let lootArr = [];
            if (ssShards) lootArr.push(`<:ss_shard:917203009543503892>x${ssShards}`);
            if (sShards) lootArr.push(`<:s_shard:917202925514817566>x${sShards}`);
            if (aShards) lootArr.push(`<:a_shard:917202904862052392>x${aShards}`);
            if (bShards) lootArr.push(`<:b_shard:917202862851899392>x${bShards}`);
            if (cShards) lootArr.push(`<:c_shard:917202862499582002>x${cShards}`);
            if (dShards) lootArr.push(`<:d_shard:917202840563363891>x${dShards}`);

            const addNewItems: Record<number, number> = {
                [craftItem.id]: craftCount ?? 0,
                [ascItem.id]: ascCount ?? 0,
            };

            Object.entries(levelupMats).forEach((e) => {
                addNewItems[e[0] as any] = e[1] ?? 0;
            });

            chestRarities.forEach((e, i) => {
                addNewItems[e] = chestDrops[i] ?? 0;
            });

            // Update users table
            await updateUsers(interaction.user.id, {
                coins: { type: 'increment', value: loot },
                ssshard: { type: 'increment', value: ssShards },
                sshard: { type: 'increment', value: sShards },
                ashard: { type: 'increment', value: aShards },
                bshard: { type: 'increment', value: bShards },
                cshard: { type: 'increment', value: cShards },
                dshard: { type: 'increment', value: dShards },
                items: { type: 'merge_json', value: addNewItems },
                dungeon_floors: { type: 'set', value: stats.dungeon_floors },
                dungeon_classlevels: { type: 'set', value: stats.dungeon_classlevels },
                tutorial: { type: 'append_unique', value: [9] },
            });

            // Tutorial
            if (!stats.tutorial.includes(9)) {
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('continue')
                            .setLabel('Finish Tutorial!')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setLabel('Any Questions? Join our Support Server!')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.gg/myy9PBCdEW')
                    );
                const Embed = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setTitle("Congratulations!")
                    .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                    .setDescription("You've defeated your first enemy <:RemWink:928370529742757960>\nIt seems you have obtained some valuable items <:Woah:928370799965003826> Here's what they're used for:\n\n<:coins:872926669055356939> **Coins**: The standard currency used in Camelot. It can be used in the `/shop`, to `/levelup` characters and more <:ClaraThumbsUp:1034899843505721514>\n<:ss_shard:917203009543503892> **Shards**: These are used to `/refine` your characters\n<:sublime_chest_open:1069287041843593266> **Chests**: Chests drop items of varying rarities.\n<:goblin_mask:1046080758466490398> **Resources**: There are crafting <:iron:1033037750821212232>, levelup <:common_weapon_levelup_material:1047535549814165535> and ascension <:slime_concentrate:1046083943428001964> materials that can drop in the dungeon <:wow:1020442064409874462>\n\nAdditionally, you'll gain experience with your class which can be upgraded once you reach level **40**. The deeper you enter the dungeon the better the rewards you'll get!");
                // if (r === "l") Embed.setTitle("Seems it's quite challenging").setDescription("But let's try again!");
                setTimeout(() => {
                    if (interaction.channel?.isSendable()) interaction.channel.send({ embeds: [Embed], components: [row] }).then((msg) => {
                        const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "continue", componentType: ComponentType.Button, time: 180000 });
                        collector.on('collect', async () => {
                            const Embed = new EmbedBuilder()
                                .setColor(0xbbffff)
                                .setTitle("Seems you are ready to set out now!")
                                .setThumbnail("https://i.imgur.com/Ta2YDBN.png")
                                .setDescription("There is nothing more I can teach you, for you have mastered all that I know and more. Now it is time for you to go out on your own journey. To follow your own path, and create your own tales!\n\nMay the spirits guard your path. Until we meet again <:MashaWave:928370055354400799>");
                            msg.edit({ embeds: [Embed], components: [] });

                            // Finish Tutorial
                            await updateUsers(interaction.user.id, { tutorial: { type: 'append_unique', value: [9] } });

                            // Achievements
                            achievements[51].check(interaction); // A New Adventure
                        });
                    });
                }, 1200);
            } else {
                // Achievements
                achievements[51].check(interaction); // A New Adventure
            };

            // Daily Quests
            dailies[2].update(interaction, skipRounds); // Increasing Danger

            let xpleft = myClass
                ? (myStats.clvl * 50) - (stats.dungeon_classlevels[myClass.id] - (myStats.clvl * (myStats.clvl - 1) * 25))
                : 0;

            Embed.setDescription(`<:stars_v2:917023655840591963> **${myChar.name}** won${flag === "all" ? ` ${skipRounds}/${skippedTotal} fights` : ""}! <:stars_v2:917023655840591963>\n${unlocked}\n<a:arrow_orange:916716747623641210> Runs left: **${stats.dungeon_limit < dunLim[0] ? dunLim[0] - stats.dungeon_limit : 0}** loot **${stats.dungeon_limit < dunLim[1] ? dunLim[1] - stats.dungeon_limit : 0}** progress\n<a:arrow_yellow:916716780045619200> ${cxpmsg}\n\n<:npbag:929428030554787892> Loot\n${loot ? `${loot}<:coins:872926669055356939>, ` : ""}${chestRarities.reduce((total, e, i) => total += chestDrops[i] ? `${items[e].emoji}x${chestDrops[i]}, ` : "", "")}${craftCount ? `${craftItem.emoji}x${craftCount}, ` : ""}${ascCount ? `${ascItem.emoji}x${ascCount}, ` : ""}${Object.entries(levelupMats).filter((e) => e[1]).map((e) => `${items[e[0] as any].emoji}x${e[1]}, `).join("")}\n${lootArr.join(", ")}`);
            if (dunLim[0] - stats.dungeon_limit >= 0 || !myClass) Embed.setFooter({ text: `Balance: ${formatNumberWithQuotes(stats.coins + loot)} coins`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) });
            else Embed.setFooter({ text: `${myClass.name} level: ${xpleft < 1 ? myStats.clvl + 1 : myStats.clvl} | XP left: ${xpleft < 1 ? (((myStats.clvl + 1) * 50) - (stats.dungeon_classlevels[myClass.id] - (myStats.clvl * (myStats.clvl + 1) * 25))) : xpleft}`, iconURL: xpleft < 1 ? "https://i.ibb.co/Y8k36J1/Nks94u8.gif" : myClass.image });
            return Embed;
        };

        let matchStats = Avalon.getMatchStats(interaction);
        let notice = ["", "", "", ""];

        // Apply passives
        if (skill && myChar.id !== 4767) skill.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user, interaction.commandName);
        if (myAbility?.passive) await myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.weapon !== -1) (items[myStats.weapon] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.shieldid) (items[myStats.shieldid] as weaponInfo).buff(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);
        if (myStats.helmet && (items?.[myStats.helmet] as armorInfo).setname === (items?.[myStats.cuirass] as armorInfo)?.setname && (items?.[myStats.helmet] as armorInfo).setname === (items?.[myStats.gloves] as armorInfo)?.setname && (items?.[myStats.helmet] as armorInfo).setname === (items?.[myStats.boots] as armorInfo)?.setname) (items?.[myStats.boots] as armorInfo)?.buff?.(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

        // Test abilities
        (items[688] as ringInfo).getBuff(1)(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new EmbedBuilder(), interaction.user);

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
                new ButtonBuilder().setCustomId('SKIP').setEmoji(SKIP_EMOJI).setStyle(ButtonStyle.Secondary).setDisabled(dunLim[0] - stats.dungeon_limit >= 0 ? false : true),
            );

        // Skip Fight
        if ((flag === "skip" || flag === "all") && stats.dungeon_floors[floor] >= floors[floor]?.winsNeeded) {
            if (myStats.ep > eStats.ep) {
                const result = await matchResult("w");
                if (result) interaction.editReply({ embeds: [result] });
                return;
            };
            notice.push("\n<:info:1131679799207796756> You need more EP than your enemy to skip a fight");
        };

        // If Enemy Died
        if (eStatsC.hp < 1) {// if (myStats.ep/eStats.ep >= 2) {
            const result = await matchResult("w");
            if (result) interaction.editReply({ embeds: [result] });
            return;
        };

        async function newFight() {
            let timestart = new Date().getTime();
            let result = await new Promise<EmbedBuilder | undefined>((resolve) => {
                const Embed = new EmbedBuilder()
                    .setColor([0x6def83, 0xfac044, 0xff7d7d, 0x7c7c7c, 0xbbffff][threatLevel])
                    .setThumbnail(myStatsC.thumbnail)
                    .setFooter({ text: `Enemy EP: ${eStatsC.ep} | round 1 | time left: 120s` })
                    .setTitle(`Dungeon Floor ${(floor - 1) % 100 + 1} ${enemy.boss ? "(Boss)" : ""}`)
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

                    def.on('collect', async () => {
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

                    ability.on('collect', async () => {
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

                    cskill.on('collect', () => {
                        // If class active was replaced
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
                        };
                        // Trigger class active
                        matchStats.trigger("cskill", myStatsC, eStatsC, buffs, eBuffs);
                    });

                    skip.on('collect', () => {
                        if (matchStats.turn == 1) {
                            notice.push(`\n⏩ Skipping to results...`);
                            editEmbed();
                            matchStats.turn = 0;
                            while (eStatsC.hp > 0 && myStatsC.hp > 0) {
                                if (Math.random() > 0.02 + (0.1 * (eStatsC.ep / myStatsC.ep))) eStatsC.hp -= Math.floor((myStatsC.atk * Math.pow(0.99895, eStatsC.def)) * (1 - (0.2 * Math.random())));
                                if (eStatsC.hp < 0) eStatsC.hp = 0;
                                if (eStatsC.hp > 0) myStatsC.hp -= Math.floor((eStatsC.atk * Math.pow(0.99895, myStatsC.def)) * (1 - (0.2 * Math.random())));
                                if (myStatsC.hp < 0) myStatsC.hp = 0;

                                // Break if it takes too long
                                if (matchStats.round++ > 1000) myStatsC.hp = 0;
                            };
                            setTimeout(() => {
                                Avalon.checkIfEnded(myStatsC, eStatsC, matchStats, notice, interaction, minionDefeated, editEmbed, endMatch);
                            }, aDelay);
                        } else {
                            matchStats.turn = 1;
                            interaction.followUp({ content: "Please wait a moment", ephemeral: true });
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
