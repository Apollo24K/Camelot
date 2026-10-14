import { dailies } from "../Modules/dailyQuests";
import { characters } from "../Modules/chars";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { SlashCommand, CompactUserSchema } from '../types';
import { currencyEmojis } from '../Modules/components';
import { getOwnedCharacterIds, updateUsersAndCache, getCachedUserSchema, getUserWeapons } from '../Modules/queries';
import { collectComponentUpdates } from '../Modules/buttonInteractions';
import { newbieCategories, getNewbieQuests, newbieChains, claimNewbieQuests, formatNewbieRewards, NewbieCategory, NewbieData, newbieQuestInfo } from '../Modules/newbieQuests';

const BUTTON_TAB_DAILY = "quest_tab_daily";
const BUTTON_TAB_NEWBIE = "quest_tab_newbie";
const BUTTON_CLAIM = "newbie_claim";
const SELECT_CATEGORY = "newbie_category";

const MAX_MESSAGE_LENGTH = 1900;

function chunkByLine(text: string, maxLength = MAX_MESSAGE_LENGTH): string[] {
    const chunks: string[] = [];
    let current = "";
    for (const line of text.split("\n")) {
        if (current.length && current.length + line.length + 1 > maxLength) {
            chunks.push(current);
            current = line;
        } else {
            current = current.length ? `${current}\n${line}` : line;
        };
    };
    if (current.length) chunks.push(current);
    return chunks;
};

function getHash(key: string, hash: number) {
    for (let i = 0; i < key.length; i++) {
        hash = ((hash << 5) - hash) + key.charCodeAt(i);
        hash |= 0;
    };
    return hash;
};

function getQuests(id: string, len: number) {
    const quests = new Set<number>();
    const key = new Intl.DateTimeFormat('en-UK', { timeZone: 'Etc/GMT-2' }).format(new Date()).split("/").reverse().join("-") + id;
    let i = 0;
    while (quests.size < 4 && i < 100) {
        const hash = getHash(key, i++);
        quests.add(Math.abs(hash) % len);
    };
    return [...quests].map((e) => dailies[e]);
};

const exportCommand: SlashCommand = {
    name: 'quests',
    async execute({ interaction, author }) {

        const user = interaction.options.getUser('user') ?? interaction.user;

        const stats = author.schema;

        // Check if already voted
        if ((Date.now() - (stats.lastvote?.getTime() ?? 0)) < 12 * 60 * 60 * 1000) {
            await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates: {
                    season_keys: { type: "increment", value: "10" in stats.dailies ? 0 : 5 },
                    dailies: { type: "merge_json", value: { 10: 0 } },
                },
            });

            dailies[10].update(undefined, interaction.client, 1, { id: interaction.user.id }); // Knight's Ballot
            stats.dailies[10] = 1;
        };
        if ((Date.now() - (stats.lastvoteserver?.getTime() ?? 0)) < 12 * 60 * 60 * 1000) {
            await updateUsersAndCache(interaction.client, interaction.user.id, {
                updates: {
                    season_keys: { type: "increment", value: "12" in stats.dailies ? 0 : 5 },
                    dailies: { type: "merge_json", value: { 12: 0 } },
                },
            });

            dailies[12].update(undefined, interaction.client, 1, { id: interaction.user.id }); // Guild's Ballot
            stats.dailies[12] = 1;
        };

        const ownedCharacterIds = await getOwnedCharacterIds(interaction.user.id, stats.chars);
        let thumbnail = characters[ownedCharacterIds[Math.floor(Math.random() * ownedCharacterIds.length)]]?.image || "https://i.imgur.com/Ta2YDBN.png";
        if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, stats.custom_skins[stats.favchar], stats.char_skin[stats.favchar]);

        const todaysQuests = getQuests(user.id, dailies.length);

        function achvmBar(ratio: number, sep = "\n") {
            let step = 1 / 14;
            if (ratio >= 1) return sep + "<:bar_ld:943133923674820608><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_d:943133923007930379><:bar_rd:943133923490299965>";
            else if (ratio > 0) sep += "<:bar_l:942597277606895707>";
            else return sep + "<:bar_lh:942597277548171355><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_h:942597277665599499><:bar_rh:942597277627863081>";

            ratio > step ? ratio -= step : ratio = 0;
            let ret = 12;
            while (ret--) {
                if (ratio) sep += "<:bar:942597277854359632>";
                else sep += "<:bar_h:942597277665599499>";
                ratio > step ? ratio -= step : ratio = 0;
            };

            return sep + "<:bar_rh:942597277627863081>";
        };

        function progress(id: number) {
            if (dailies[id].check(stats.dailies[id])) return achvmBar(1);
            switch (id) {
                case 0: return achvmBar((stats.dailies[id] || 0) / 20, ` (${stats.dailies[id] || 0}/20)\n`);
                case 1: return achvmBar((stats.dailies[id] || 0) / 50, ` (${stats.dailies[id] || 0}/50)\n`);
                case 2: return achvmBar((stats.dailies[id] || 0) / 20, ` (${stats.dailies[id] || 0}/20)\n`);
                case 3: return achvmBar((stats.dailies[id] || 0) / 3, ` (${stats.dailies[id] || 0}/3)\n`);
                case 4:
                case 5:
                case 6: return achvmBar(0);
                case 7: return achvmBar((stats.dailies[id] || 0) / 5, ` (${stats.dailies[id] || 0}/5)\n`);
                case 8: return achvmBar(0);
                case 9: return achvmBar((stats.dailies[id] || 0) / 2000, ` (${stats.dailies[id] || 0}/2000)\n`);
                case 10: return achvmBar(0);
                case 11: return achvmBar((stats.dailies[id] || 0) / 3, ` (${stats.dailies[id] || 0}/3)\n`);
                default: return achvmBar(0);
            };
        };

        const isSelf = user.id === interaction.user.id;
        let questStats: CompactUserSchema = stats;
        if (!isSelf) {
            const otherStats = await getCachedUserSchema(user.id, interaction.client);
            if (!otherStats) return interaction.reply(`**${user.username}** hasn't started playing yet`);
            questStats = otherStats;
        };

        let questData: NewbieData = {
            weapons: await getUserWeapons(user.id),
            ownedCharacterIds: await getOwnedCharacterIds(user.id, questStats.chars),
        };

        let activeTab: "daily" | "newbie" = "daily";
        let activeCategory: NewbieCategory = "progression";

        const buildDailyEmbed = () => new EmbedBuilder()
            .setColor(0xbbffff)
            .setTitle(`Daily Quests (${todaysQuests.reduce((count, e) => count + (e.check(stats.dailies[e.id]) ? 1 : 0), 0)}/4)`)
            .setDescription(`**Completion Rewards**: 5 ${currencyEmojis.season_keys}, 500<:coins:872926669055356939>, 2<:genesis_gems:1034179687720681492>, 10XP ${todaysQuests.reduce((count, e) => count + (e.check(stats.dailies[e.id]) ? 1 : 0), 0) === 4 ? "<a:check:873196253276700682>" : ""}\nㅤ`)
            .setThumbnail(thumbnail)
            .addFields(
                { name: todaysQuests[0].title, value: `> ${todaysQuests[0].description + progress(todaysQuests[0].id)}`, inline: true },
                { name: `Rewards ${todaysQuests[0].check(stats.dailies[todaysQuests[0].id]) ? "<a:check:873196253276700682>" : ""}`, value: `${[10, 12].includes(todaysQuests[0].id) ? `**5** ${currencyEmojis.season_keys}, ` : ""}**500**<:coins:872926669055356939>, **2**<:genesis_gems:1034179687720681492>, 10XP`, inline: true },
                { name: '\u200B', value: '_ _', inline: true },
                { name: todaysQuests[1].title, value: `> ${todaysQuests[1].description + progress(todaysQuests[1].id)}`, inline: true },
                { name: `Rewards ${todaysQuests[1].check(stats.dailies[todaysQuests[1].id]) ? "<a:check:873196253276700682>" : ""}`, value: `${[10, 12].includes(todaysQuests[1].id) ? `**5** ${currencyEmojis.season_keys}, ` : ""}**500**<:coins:872926669055356939>, **2**<:genesis_gems:1034179687720681492>, 10XP`, inline: true },
                { name: '\u200B', value: '_ _', inline: true },
                { name: todaysQuests[2].title, value: `> ${todaysQuests[2].description + progress(todaysQuests[2].id)}`, inline: true },
                { name: `Rewards ${todaysQuests[2].check(stats.dailies[todaysQuests[2].id]) ? "<a:check:873196253276700682>" : ""}`, value: `${[10, 12].includes(todaysQuests[2].id) ? `**5** ${currencyEmojis.season_keys}, ` : ""}**500**<:coins:872926669055356939>, **2**<:genesis_gems:1034179687720681492>, 10XP`, inline: true },
                { name: '\u200B', value: '_ _', inline: true },
                { name: todaysQuests[3].title, value: `> ${todaysQuests[3].description + progress(todaysQuests[3].id)}`, inline: true },
                { name: `Rewards ${todaysQuests[3].check(stats.dailies[todaysQuests[3].id]) ? "<a:check:873196253276700682>" : ""}`, value: `${[10, 12].includes(todaysQuests[3].id) ? `**5** ${currencyEmojis.season_keys}, ` : ""}**500**<:coins:872926669055356939>, **2**<:genesis_gems:1034179687720681492>, 10XP`, inline: true },
                { name: '\u200B', value: '_ _', inline: true },
            )
            .setFooter({ text: `dailies reset in ${(23 - new Date().getHours()) ? `${23 - new Date().getHours()}h ` : ""}${60 - new Date().getMinutes()}min\nneed help? ➜ see /support` });

        const newbieProgress = (quest: newbieQuestInfo) => {
            if (quest.check(questStats, questData)) return achvmBar(1);
            const { value, target } = quest.progress(questStats, questData);
            return achvmBar(Math.max(0, Math.min(0.999, target > 0 ? value / target : 0)), ` (${value}/${target})\n`);
        };

        const claimableCount = (source: CompactUserSchema, data: NewbieData) => getNewbieQuests(activeCategory).filter((quest) => !source.newbie.includes(quest.id) && quest.check(source, data)).length;

        const buildNewbieEmbed = () => {
            const questList = getNewbieQuests(activeCategory);
            const claimed = questList.filter((quest) => questStats.newbie.includes(quest.id)).length;
            const category = newbieCategories.find((e) => e.id === activeCategory)!;

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setTitle(`Newbie Quests — ${category.label} (${claimed}/${questList.length})`)
                .setThumbnail(thumbnail)
                .setDescription(`${category.description}\nCompleted quests can be collected with the **Claim Rewards** button below.\nㅤ`);

            for (const chain of newbieChains(activeCategory)) {
                let dots = "";
                let next: newbieQuestInfo | undefined;
                for (const quest of chain.quests) {
                    const claimedQuest = questStats.newbie.includes(quest.id);
                    dots += claimedQuest ? "<:st:942946747334918216>" : "<:st_h:942946747452387408>";
                    if (!claimedQuest && !next) next = quest;
                };
                const target = next ?? chain.quests[chain.quests.length - 1];

                Embed.addFields(
                    { name: `${chain.title} ${dots}`, value: next ? `> ${next.description}${newbieProgress(next)}` : `> All milestones collected!${achvmBar(1)}`, inline: true },
                    { name: `Rewards${next ? "" : " <a:check:873196253276700682>"}`, value: formatNewbieRewards(target), inline: true },
                    { name: '\u200B', value: '_ _', inline: true },
                );
            };

            return Embed;
        };

        const buildTabRow = () => new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setCustomId(BUTTON_TAB_DAILY).setLabel("Daily").setStyle(activeTab === "daily" ? ButtonStyle.Primary : ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId(BUTTON_TAB_NEWBIE).setLabel("Newbie").setStyle(activeTab === "newbie" ? ButtonStyle.Primary : ButtonStyle.Secondary),
            );

        const buildCategoryRow = () => new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(SELECT_CATEGORY)
                    .setPlaceholder(`Category: ${newbieCategories.find((e) => e.id === activeCategory)!.label}`)
                    .addOptions(newbieCategories.map((e) => ({ label: e.label, description: e.description, value: e.id, emoji: e.emoji }))),
            );

        const buildClaimRow = () => {
            const claimable = claimableCount(questStats, questData);
            if (!isSelf) return [];
            return [new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId(BUTTON_CLAIM).setLabel(claimable ? `Claim Rewards (${claimable})` : "Claim Rewards").setStyle(ButtonStyle.Success).setDisabled(!claimable),
            )];
        };

        const render = () => activeTab === "daily"
            ? { embeds: [buildDailyEmbed()], components: [buildTabRow()] }
            : { embeds: [buildNewbieEmbed()], components: [buildTabRow(), buildCategoryRow(), ...buildClaimRow()] };

        return interaction.reply({ ...render(), fetchReply: true }).then(msg => {

            const buttonCollector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && [BUTTON_TAB_DAILY, BUTTON_TAB_NEWBIE, BUTTON_CLAIM].includes(r.customId), componentType: ComponentType.Button, time: 120000 });

            collectComponentUpdates(buttonCollector, async r => {
                if (r.customId === BUTTON_TAB_DAILY) activeTab = "daily";
                else if (r.customId === BUTTON_TAB_NEWBIE) activeTab = "newbie";
                else if (r.customId === BUTTON_CLAIM) {
                    const claimed = await claimNewbieQuests(interaction.client, interaction.user.id, getNewbieQuests(activeCategory));
                    if (!claimed.length) {
                        if (interaction.channel?.isSendable()) interaction.channel.send("You have no newbie quests to claim right now.");
                        return;
                    };
                    const freshStats = await getCachedUserSchema(interaction.user.id, interaction.client);
                    if (freshStats) questStats = freshStats;
                    const freshData: NewbieData = {
                        weapons: await getUserWeapons(interaction.user.id),
                        ownedCharacterIds: await getOwnedCharacterIds(interaction.user.id, questStats.chars),
                    };
                    questData = freshData;
                    const summary = claimed.map((quest) => `> **${quest.title}**: ${quest.description} — ${formatNewbieRewards(quest)}`).join("\n");
                    if (interaction.channel?.isSendable()) {
                        for (const chunk of chunkByLine(summary)) {
                            await interaction.channel.send(`<a:starsL:942573254730715246> Newbie quests completed! <a:starsR:942573194802511923>\n${chunk}`);
                        };
                    };
                };
                await msg.edit(render());
            }, msg.id);

            const categoryCollector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === SELECT_CATEGORY, componentType: ComponentType.StringSelect, time: 120000 });

            collectComponentUpdates(categoryCollector, async r => {
                const value = r.values[0];
                if (!newbieCategories.some((e) => e.id === value)) return;
                activeCategory = value as NewbieCategory;
                await msg.edit(render());
            }, msg.id);

            const stripComponents = () => { msg.edit({ components: [] }).catch(() => { }); };
            buttonCollector.on('end', stripComponents);
            categoryCollector.on('end', stripComponents);
        });
    },
};

export default exportCommand;
