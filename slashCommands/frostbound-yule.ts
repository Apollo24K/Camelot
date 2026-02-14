import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, MessageFlags } from "discord.js";
import { SlashCommand } from "../types";
import { updateUsersAndCache } from "../Modules/queries";
import { daysSince } from "../Modules/functions";

const StartRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('start')
            .setLabel('Start')
            .setStyle(ButtonStyle.Success),
    );

const NextChapterRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next Chapter')
            .setStyle(ButtonStyle.Success),
    );

const RestartRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('restart')
            .setLabel('You have failed. Restart?')
            .setStyle(ButtonStyle.Danger),
    );

function getChapter0Row(hasFinished: boolean, hasFailed: boolean) {
    if (hasFailed) return [RestartRow];
    if (hasFinished) return [NextChapterRow];
    return [];
};

export const exportCommand: SlashCommand = {
    name: 'frostbound',
    async execute({ interaction, author, server, locale }) {

        if (!interaction.deferred) {
            try {
                await interaction.deferReply();
            } catch (err) {
                return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
            };
        };

        const stats = author.schema;

        if (stats.yule_chapter === 0) {
            // First time using the command:
            if (stats.yule_timestamp === null) {
                const Embed = new EmbedBuilder()
                    .setColor(0x76a2cf)
                    .setDescription("Noble faces, fine jewelry, and golden silks; they gathered in the lively palaces of Camelot, steeped in Christmas cheer. Tonight, the hand of an unsuspecting ruler rests upon the Yule Boar's head, awaiting a sacred blessing. Blissfully unaware that this time, the once inanimate beast will bite back, possessed by phantoms of frost and hunger.\n\nAnd in the blink of an eye, the fallen monarch's crown lies askew atop the abomination's head, a royal cloak snarled across its bristled back as it roams the streets of an unknowing city.\n\n-# > _Story by Ket (skykey291)_");

                return interaction.editReply({ embeds: [Embed], components: [StartRow] }).then(async (msg) => {
                    const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === 'start', componentType: ComponentType.Button, time: 120000 });

                    collector.on('collect', async (r) => {

                        stats.perpetual_fire = 20;
                        stats.yule_timestamp = new Date();
                        stats.yule_chapter_failed = false;

                        await updateUsersAndCache(interaction.client, interaction.user.id, {
                            updates: {
                                perpetual_fire: { type: "set", value: 20 },
                                yule_timestamp: { type: "set", value: new Date() },
                                yule_chapter_failed: { type: "set", value: false },
                            },
                        });

                        return exportCommand.execute({ interaction, author, server, locale });
                    });
                });
            };

            // Coming back:
            const timeLeft = Math.floor((48 * 60 * 60) - (new Date().getTime() - stats.yule_timestamp.getTime()) / 1000); // in seconds
            const remaining = {
                hours: Math.floor(timeLeft / 3600),
                minutes: Math.floor((timeLeft % 3600) / 60),
                seconds: timeLeft % 60,
            };

            const hasFailed = stats.yule_chapter_failed || stats.perpetual_fire <= 0;

            const Embed = new EmbedBuilder()
                .setColor(0x76a2cf)
                .setThumbnail("https://i.ibb.co/qYdXdqfQ/image.png")
                .setDescription(
                    "## Frostbound Yule, Part " + (stats.yule_chapter + 1) +
                    "\n> Noble faces, fine jewelry, and golden silks; they gathered in the lively palaces of Camelot, steeped in Christmas cheer. Tonight, the hand of an unsuspecting ruler rests upon the Yule Boar's head, awaiting a sacred blessing. Blissfully unaware that this time, the once inanimate beast will bite back, possessed by phantoms of frost and hunger. And in the blink of an eye, the fallen monarch's crown lies askew atop the abomination's head, a royal cloak snarled across its bristled back as it roams the streets of an unknowing city." +
                    "\n\n————————————————————————————————" +
                    "\n\n**Quest**: To stay alive in this ravaged city, you must not let your Torch of Perpetual Fire die out. Keep the warmth alive for the next 48 hours." +
                    (timeLeft > 0 ? ` **Time left**: ${remaining.hours > 0 ? `${remaining.hours}h ` : ""}${remaining.minutes > 0 ? `${remaining.minutes}m ` : ""}${remaining.seconds > 0 ? `${remaining.seconds}s` : ""}` : "") +
                    `\n\n<:torch_of_perpetual_fire:1453393213904916510> Torch of Perpetual Fire: **${Math.min(stats.perpetual_fire, 60)}**/60 <:perpetual_fire:1453393211958759620> (-1 <:perpetual_fire:1453393211958759620> every 10 minutes)` +
                    `\n\n-# **Obtain**: \`/daily\`: +10 <:perpetual_fire:1453393211958759620>, \`/pull\`: +5 <:perpetual_fire:1453393211958759620>, \`/dungeon\`: +1 <:perpetual_fire:1453393211958759620>` +
                    `\n\n-# **Rewards**: 1x <a:EXTRA:1138530846144462968> pull, 50 <:genesis_gems:1157331914861052034>, 5k <:coins:872926669055356939>`
                );

            return interaction.editReply({ embeds: [Embed], components: getChapter0Row(timeLeft < 0, hasFailed) }).then(async (msg) => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 120000 });

                collector.on('collect', async (r) => {
                    if (r.customId === 'restart') {
                        stats.perpetual_fire = 20;
                        stats.yule_timestamp = new Date();
                        stats.yule_chapter_failed = false;

                        await updateUsersAndCache(interaction.client, interaction.user.id, {
                            updates: {
                                perpetual_fire: { type: "set", value: 20 },
                                yule_timestamp: { type: "set", value: new Date() },
                                yule_chapter_failed: { type: "set", value: false },
                            },
                        });

                        return exportCommand.execute({ interaction, author, server, locale });
                    };

                    if (r.customId === 'next') {
                        stats.yule_chapter = 1;
                        stats.yule_timestamp = new Date();
                        stats.perpetual_fragments = 0;

                        await updateUsersAndCache(interaction.client, interaction.user.id, {
                            updates: {
                                yule_chapter: { type: "set", value: 1 },
                                yule_timestamp: { type: "set", value: new Date() },
                                perpetual_fragments: { type: "set", value: 0 },

                                // Rewards
                                expulls: { type: "increment", value: 1 },
                                gems: { type: "increment", value: 50 },
                                coins: { type: "increment", value: 5000 },
                            },
                        });

                        return exportCommand.execute({ interaction, author, server, locale });
                    };
                });
            });

        };

        if (stats.yule_chapter === 1 || stats.yule_chapter === 2 || stats.yule_chapter === 3) {
            const chapter = stats.yule_chapter as 1 | 2 | 3;
            const daysSinceChapterStart = daysSince(stats.yule_timestamp ?? new Date());
            const fragmentCap = 50 * (daysSinceChapterStart + 1);
            const chapterRequirement = { 1: 100, 2: 150, 3: 250 }[chapter];

            if (stats.perpetual_fragments >= fragmentCap) {
                stats.perpetual_fragments = fragmentCap;
                await updateUsersAndCache(interaction.client, interaction.user.id, {
                    updates: {
                        perpetual_fragments: { type: "set", value: fragmentCap },
                    },
                });
            };

            const Embed = new EmbedBuilder()
                .setColor(0x76a2cf)
                .setThumbnail("https://i.ibb.co/qYdXdqfQ/image.png")
                .setDescription(
                    `## Frostbound Yule, Part ${chapter + 1}\n> ` +
                    ({
                        1: "Heavy thuds mark the streets like clockwork -left, right, left, right...- without haste or hesitation. The city has become a sight of ruin. Shattered windows, broken doors, guards scrambling to barely keep the boar at bay. But fret not, reinforcements are on the way. Albeit peculiar...",
                        2: `The city gates are thrown open in frantic haste when the long-awaited reinforcements arrive—only for the guards to freeze where they stand. Before them waits no army, nor even a squad. Instead a single figure steps forward, in her icy attire. "Where stands the... foul pest?" she asks, her voice as cold as her attire. She gestures for a single guard to follow, and turns without hesitation toward the ruined streets. "It shall lie slain within the minute. Until then, stand aside—Hide, weep, or quail as you will, but do not cross my path."`,
                        3: `The night bears witness to a sorrowful sight: the blood-stained boar, terror of the darkened streets, now stands frozen in time. Whether that's the work of Aneira's ancient frost magic or the sheer dread her presence inspires is hard to tell. At intervals, the beast claws its way back to awareness, approaching the ice-cold queen through through dodges and rams. Yet her stance never falters. Only once does her attention stray, a brief glance toward the trembling guard. A faint smirk touches her lips as she raises her hand and weaves a spell of crushing cold. "Look on," she says amused. "And gather what little wit you can."`,
                    }[chapter]) +

                    "\n\n————————————————————————————————\n\n" +
                    ({
                        1: "**Quest**: Collect 100 Fragments of Perpetual Fire from your torch to keep the boar away until reinforcements arrive.",
                        2: "**Quest**: Collect 150 Fragments of Perpetual Fire from your torch as you guide Aneira towards the yule boar.",
                        3: "**Quest**: Collect 250 Fragments of Perpetual Fire from your torch to boost Aneira's magic and slay the beast.",
                    }[chapter]) +
                    `\n\n<:torch_of_perpetual_fire:1453393213904916510> Fragments of Perpetual Fire: **${Math.min(stats.perpetual_fragments, chapterRequirement)}**/${chapterRequirement} <:perpetual_fire:1453393211958759620>` +
                    `\n\n-# **Obtain**: \`/daily\`: +10 <:perpetual_fire:1453393211958759620>, \`/pull\`: +5 <:perpetual_fire:1453393211958759620>, \`/dungeon\`: +1 <:perpetual_fire:1453393211958759620> (50 <:perpetual_fire:1453393211958759620> per day)` +
                    ("\n\n-# **Rewards**: " + {
                        1: "1x Aneira SS skin: Winter Veil, 1x <a:EXTRA:1138530846144462968> pull",
                        2: "1x Aneira EX skin: Glacial Waltz, 1x <a:EXTRA:1138530846144462968> pull",
                        3: "1x Aneira EX, 1x <a:EXTRA:1138530846144462968> pull",
                    }[chapter])
                );

            return interaction.editReply({ embeds: [Embed], components: stats.perpetual_fragments >= chapterRequirement ? [NextChapterRow] : [] }).then(async (msg) => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === 'next', componentType: ComponentType.Button, time: 120000 });

                collector.on('collect', async (r) => {
                    stats.yule_chapter = chapter + 1;
                    stats.yule_timestamp = new Date();
                    stats.perpetual_fragments = 0;

                    await updateUsersAndCache(interaction.client, interaction.user.id, {
                        updates: {
                            yule_chapter: { type: "set", value: chapter + 1 },
                            yule_timestamp: { type: "set", value: new Date() },
                            perpetual_fragments: { type: "set", value: 0 },

                            // Rewards
                            expulls: { type: "increment", value: 1 },
                            ...(chapter === 1 ? { skins: { type: "append_unique", value: [167] } } : {}),
                            ...(chapter === 2 ? { skins: { type: "append_unique", value: [168] } } : {}),
                            ...(chapter === 3 ? { chars: { type: "append", value: [25829] } } : {}),
                        },
                    });

                    return exportCommand.execute({ interaction, author, server, locale });
                });
            });
        };

        if (stats.yule_chapter === 4) {
            const Embed = new EmbedBuilder()
                .setColor(0x76a2cf)
                .setDescription(
                    `The boar lies shattered beneath a coffin of ice, its rage extinguished, its final breath stolen by the cold. Aneira lowers her hand. She does not look upon her fallen foe for long—such things are beneath remembrance.\n\nTurning away, she pauses just long enough for the guard to steady himself. "See to the city," she says, her voice distant. "And pray you'll never require my hand again."\n\nWith that, she departs into the darkened streets, frost lingering in her wake.`
                );

            return interaction.editReply({ embeds: [Embed], components: [] });
        };

    },
};

export default exportCommand;
