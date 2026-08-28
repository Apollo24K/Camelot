import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } from "discord.js";
import { characters } from "../Modules/chars";
import { abilities } from "../Modules/abilities";
import { achievements } from "../Modules/achievements";
import { search, showPage } from "../Modules/functions";
import { SlashCommand } from "../types";
import { getOwnedCharacterIds, getUserSchema } from "../Modules/queries";
import { enemies, raidBosses, rollingCowMobs, hiddenFloors } from "../Modules/enemies";
import { skills, bossAbilities, eventBossAbilities, crazeBossAbilities2023, crazeBossAbilities2024, rollingCowAbilities } from "../Modules/skills";

const exportCommand: SlashCommand = {
    name: 'ability',
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction, author }) {
        const user = interaction.options.getUser('user') ?? interaction.user;
        let choice = interaction.options.getString('character');
        let enemyChoice = interaction.options.getString('enemy');
        const filter = interaction.options.getString('filter');
        let page = interaction.options.getInteger('page') || 1;
        let isSummary = interaction.options.getBoolean('compact') ?? false;
        let selection: "single" | "list" = (choice || enemyChoice) ? "single" : "list";

        const inv = user.id === interaction.user.id ? author.schema : await getUserSchema(user.id);
        if (!inv) return interaction.reply("Couldn't find user with that ID.");
        const ownedCharacterIds = new Set(await getOwnedCharacterIds(user.id, inv.chars));

        // Enemy detection and trait formatting
        let isEnemy = false;
        let enemyData: any = null;

        // Combined enemy mapping with skill ID and required floor
        const enemyMap: { [key: string]: { skillId: number; requiredFloor: number; }; } = {
            'ciel': { skillId: 37, requiredFloor: 1 },
            'mcburn': { skillId: 38, requiredFloor: 2 },
            'father': { skillId: 39, requiredFloor: 3 },
            'eliza (alter)': { skillId: 40, requiredFloor: 4 },
            'antares': { skillId: 41, requiredFloor: 5 },
            'nereid': { skillId: 42, requiredFloor: 6 },
            'ryomen sukuna': { skillId: 43, requiredFloor: 7 },
            'aneira (alter)': { skillId: 44, requiredFloor: 8 },
            'rainee (alter)': { skillId: 45, requiredFloor: 9 },
            'sung jin woo': { skillId: 46, requiredFloor: 10 },
            'oktavia von seckendorff': { skillId: 47, requiredFloor: 11 },
            'ophelia': { skillId: 48, requiredFloor: 12 },
            'candeloro': { skillId: 49, requiredFloor: 13 },
            'homulily': { skillId: 50, requiredFloor: 14 },
            'kriemhild gretchen': { skillId: 51, requiredFloor: 15 },
            'medusa': { skillId: 52, requiredFloor: 16 },
            'kuronosu': { skillId: 53, requiredFloor: 17 },
            'espathera (alter)': { skillId: 54, requiredFloor: 18 },
            'iustitia': { skillId: 55, requiredFloor: 19 },
            'luxuria (alter)': { skillId: 56, requiredFloor: 20 },
        };

        // Function to check if user has cleared a specific hidden floor
        function hasClearedFloor(userSchema: any, floor: number): boolean {
            return userSchema.hidden_dungeon &&
                userSchema.hidden_dungeon[floor.toString()] >= hiddenFloors[floor]?.winsNeeded;
        }

        function formatEnemyTraits(enemy: any) {
            let description = "";

            // First check if this is a raid boss (raid bosses bypass floor restrictions)
            const raidBoss = raidBosses.find(boss => boss.name.toLowerCase() === enemy.name.toLowerCase());
            if (raidBoss && raidBoss.ability && raidBoss.ability.list && raidBoss.ability.list[0]) {
                // For raidBosses, the traits are in the skillInfo's list[0] parameter (as used in raid.ts)
                const traits = raidBoss.ability.list[0]; // Access the trait array from list[0]
                if (Array.isArray(traits) && traits.length > 0) {
                    description += `**Cost:** ${raidBoss.ability.cost || 0}💧\n`;
                    description += `**Species:** ${enemy.species || 'Unknown'}\n`;
                    description += `**Title:** ${enemy.title || 'Unknown'}\n`;
                    description += `**Boss:** ${enemy.boss ? "Yes" : "No"}\n\n`;
                    description += `**Traits**\n`;

                    for (let i = 0; i < traits.length; i++) {
                        description += `- ${traits[i]}\n`;
                    }

                    return description;
                }
            }

            // Check if this enemy has floor restrictions (only for non-raid bosses)
            const enemyMapping = enemyMap[enemy.name.toLowerCase()];
            if (enemyMapping && !hasClearedFloor(inv, enemyMapping.requiredFloor)) {
                description += `**Cost:** ???\n`;
                description += `**Species:** ${enemy.species || 'Unknown'}\n`;
                description += `**Title:** ${enemy.title || 'Unknown'}\n`;
                description += `**Boss:** ${enemy.boss ? "Yes" : "No"}\n\n`;
                description += `**Traits:**\n`;
                description += `- Complete Floor ${enemyMapping.requiredFloor} to reveal traits\n`;
                return description;
            }

            // Get skill data using combined enemy mapping with fallback
            const skillIdToUse = enemyMapping ? enemyMapping.skillId : (enemy.ability?.id);

            // Find skill data in bossAbilities first for mapped enemies, then skills
            const skillData = (enemyMapping ? bossAbilities.find(skill => skill.id === skillIdToUse) : null) ||
                skills.find(skill => skill.id === skillIdToUse);

            if (!skillData) return "No match found";

            // Add enemy information first
            description += `**Cost:** ${skillData?.cost || 0}💧\n`;
            description += `**Species:** ${enemy.species || 'Unknown'}\n`;
            description += `**Title:** ${enemy.title || 'Unknown'}\n`;
            description += `**Boss:** ${enemy.boss ? "Yes" : "No"}\n\n`;

            // Extract and display traits line by line
            if (skillData && skillData.list && Array.isArray(skillData.list) && skillData.list.length > 0) {
                description += "**Traits:**\n";

                // Skip first element if it's a number (ID) for mapped enemies
                const startIndex = (enemyMapping && typeof skillData.list[0] === 'number') ? 1 : 0;
                for (let i = startIndex; i < skillData.list.length; i++) {
                    description += `- ${skillData.list[i]}\n`;
                }
                description += "\n";
            }

            return description;
        }

        // Check if the enemyChoice is provided
        if (enemyChoice) {
            const searchName = enemyChoice.toLowerCase();
            const enemyMatch = [...enemies, ...raidBosses].find(enemy =>
                enemy.name.toLowerCase() === searchName ||
                enemy.name.toLowerCase().includes(searchName)
            );

            if (enemyMatch) {
                isEnemy = true;
                enemyData = enemyMatch;
                selection = "single";
            };
        };

        let charsID = Object.keys(abilities).filter((e: any) => filter ? filter in abilities[e] : true);
        let chars = charsID.map((e: any) => characters[e]);
        let uniq = Array.from(new Set(chars.map((e) => e.anime))).sort();

        let showChars: string[] = [];
        for (let i = 0; i < uniq.length; i++) {
            let charsInAnime = chars.filter((e) => e.anime === uniq[i]);
            if (charsInAnime.length < 1) return;
            charsInAnime.sort();
            showChars.push(`**${uniq[i]}**`);
            for (let j = 0; j < charsInAnime.length; j++) {
                if (ownedCharacterIds.has(charsInAnime[j].id)) {
                    showChars.push(`> ${charsInAnime[j].name} <a:check:873196253276700682>`);
                } else {
                    showChars.push(`> ${charsInAnime[j].name}`);
                }
            }
            showChars.push("");
        }

        // Add enemies to the display if not searching for specific character
        if (!isEnemy && !choice) {
            showChars.push("**Enemies**");
            for (const enemy of enemies) {
                showChars.push(`> ${enemy.name}`);
            }
            showChars.push("");
            showChars.push("**Raid Bosses**");
            for (const enemy of raidBosses) {
                showChars.push(`> ${enemy.name}`);
            }
            showChars.push("");
            showChars.push("**Rolling Cow Mobs**");
            for (const enemy of rollingCowMobs) {
                showChars.push(`> ${enemy.name}`);
            }
            showChars.push("");
        }

        // Setup Pages
        const elementsPerPage = 15;
        const pagesTotal = Math.ceil(showChars.length / elementsPerPage);
        let currPage = 1;
        if (page <= pagesTotal && page > 0) {
            currPage = page;
        }

        // Filter items to show on the current page
        let showCharsF = showPage(currPage, showChars, elementsPerPage);

        let fArray: any = chars[0];
        if (choice || enemyChoice) {
            if (isEnemy && enemyData) {
                // Handle enemy display
                fArray = {
                    id: enemyData.id,
                    name: enemyData.name,
                    image: enemyData.url || enemyData.image
                };
            } else if (choice) {
                const fChar = search(choice, inv.chars, interaction);
                if (!fChar) return;
                fArray = fChar;
                if (!(fArray.id in abilities) || (filter && !(filter in abilities[fArray.id]))) return interaction.reply(`**${fArray.name}** does not have ${filter ? (filter === "ability" ? "an active " : `a ${filter} `) : "an "}ability`);
            }
        };

        function r1() {
            const components = [
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setEmoji('⏪')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setEmoji('⏩')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('view')
                    .setLabel(selection === "single" ? "List View" : "Single View")
                    .setStyle(ButtonStyle.Primary),
            ];

            if (selection === "single") {
                components.push(
                    new ButtonBuilder()
                        .setCustomId('summary')
                        .setLabel(isSummary ? "Full" : "Compact")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setURL(`https://sites.google.com/view/camelotbuilds/abilities/characters/${fArray.name.toLowerCase().replace(/[.'()&]/g, '').replace(/ /g, '-').replace(/-+/g, '-')}`)
                        .setLabel("Community Builds")
                        .setStyle(ButtonStyle.Link)
                );
            };

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(...components);
            return row;
        };

        // Combine all enemy arrays for navigation
        const allEnemies = [...enemies, ...raidBosses, ...rollingCowMobs];
        let singlePagesTotal = isEnemy ? allEnemies.length : charsID.length;
        let singleCurrPage = isEnemy ? allEnemies.findIndex(e => e.name === fArray?.name) + 1 : charsID.indexOf("" + fArray?.id) + 1;

        function changeEmbed() {
            const isEnemyView = isEnemy && enemyData;
            const title = selection === "single"
                ? (isEnemyView ? `${enemyData.name}'s Traits` : `${fArray.name}'s Ability`)
                : `Characters with ${filter ? (filter === "ability" ? "Active " : `${filter[0].toUpperCase()}${filter.slice(1)} `) : ""}Abilities`;

            const description = selection === "single"
                ? (isEnemyView
                    ? formatEnemyTraits(enemyData)
                    : isSummary
                        ? abilities[fArray.id].shortdesc
                        : abilities[fArray.id].desc)
                : `Use \`/ability <char>\` for more information\n\n${showCharsF.join("\n")}`;

            return new EmbedBuilder()
                .setColor(isEnemyView ? 0xff6b6b : 0xbbffff)
                .setTitle(title)
                .setThumbnail(selection === "single" ? (isEnemyView ? (enemyData.url || enemyData.image) : fArray.image) : chars[Math.floor(Math.random() * chars.length)].image)
                .setDescription(description)
                .setFooter({
                    text: selection === "single"
                        ? (isEnemyView
                            ? `Hidden Dungeon Enemy (Floor 1-20) | Raid Boss`
                            : `Page ${singleCurrPage}/${singlePagesTotal}${isSummary ? " | ⚠️ Compact View is only available for your convenience and may include inaccuracies, please refer to the full version for the most accurate information." : ""}`)
                        : `Page ${currPage}/${pagesTotal}`
                });
        };

        // Check if this is an enemy with no match before creating embed
        if (selection === "single" && isEnemy && enemyData) {
            const enemyTraits = formatEnemyTraits(enemyData);
            if (enemyTraits === "No match found") {
                return interaction.reply("No match found");
            }
        }

        let Embed = changeEmbed();
        interaction.reply({ embeds: [Embed], components: [r1()], fetchReply: true }).then(msg => {

            const prev = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "prev", componentType: ComponentType.Button, time: 90000 });
            const next = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "next", componentType: ComponentType.Button, time: 90000 });
            const view = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "view", componentType: ComponentType.Button, time: 90000 });
            const summary = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "summary", componentType: ComponentType.Button, time: 90000 });

            prev.on('collect', async r => {
                if (selection === "single") {
                    if (singleCurrPage > 1) singleCurrPage--;
                    else singleCurrPage = singlePagesTotal;

                    if (isEnemy) {
                        enemyData = allEnemies[singleCurrPage - 1];
                        fArray = {
                            id: enemyData.id,
                            name: enemyData.name,
                            image: enemyData.url || enemyData.image
                        };
                    } else {
                        fArray = chars[singleCurrPage - 1];
                    }
                } else {
                    if (currPage > 1) currPage--;
                    else currPage = pagesTotal;

                    showCharsF = showPage(currPage, showChars, elementsPerPage);
                }

                Embed = changeEmbed();
                interaction.editReply({ embeds: [Embed], components: [r1()] });
            });

            next.on('collect', async r => {
                if (selection === "single") {
                    if (singleCurrPage < singlePagesTotal) singleCurrPage++;
                    else singleCurrPage = 1;

                    if (isEnemy) {
                        enemyData = allEnemies[singleCurrPage - 1];
                        fArray = {
                            id: enemyData.id,
                            name: enemyData.name,
                            image: enemyData.url || enemyData.image
                        };
                    } else {
                        fArray = chars[singleCurrPage - 1];
                    }
                } else {
                    if (currPage < pagesTotal) currPage++;
                    else currPage = 1;

                    showCharsF = showPage(currPage, showChars, elementsPerPage);
                }

                Embed = changeEmbed();
                interaction.editReply({ embeds: [Embed], components: [r1()] });
            });

            view.on('collect', async r => {
                if (selection === "single") selection = "list";
                else selection = "single";

                Embed = changeEmbed();
                interaction.editReply({ embeds: [Embed], components: [r1()] });
            });

            summary.on('collect', async r => {
                if (selection === "single" && !isEnemy) {
                    isSummary = !isSummary;
                    Embed = changeEmbed();
                    interaction.editReply({ embeds: [Embed], components: [r1()] });
                }
            });

        });

        // Achievements
        achievements[47].check(interaction); // First Steps
    },
};

export default exportCommand;
