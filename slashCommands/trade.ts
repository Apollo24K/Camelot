import { collectComponentUpdates } from "../Modules/buttonInteractions";
import { ComponentType } from "discord.js";
import { search, userLevel } from "../Modules/functions.js";
import { OfferRow } from "../Modules/components.js";
import charInfo from "../Modules/chars.js";
import { CharacterSchema, CompactUserSchema, SlashCommand } from '../types.js';
import { getCharacterSchemasOfUser, getUserSchema, transferCharacter, updateUsers } from '../Modules/queries.js';

type TradeCharacter = {
    char: charInfo;
    print?: number;
    isTradeable?: boolean;
};

function parsePrintChoice(choice: string) {
    const match = choice.trim().match(/^(.*?)`?\s*#\s*(\d+)`?$/);
    if (!match) return { name: choice.trim() };
    return { name: match[1].trim(), print: Number(match[2]) };
};

function formatTradeCharacter(entry: TradeCharacter) {
    return `${entry.char.name}${entry.print !== undefined ? `#${entry.print}` : ""}`;
};

function resolveTradeCharacter(choice: string, stats: CompactUserSchema, vipChars: CharacterSchema[], interaction: Parameters<SlashCommand["execute"]>[0]["interaction"], silent = false): TradeCharacter | undefined {
    const parsed = parsePrintChoice(choice);
    const char = search(choice, stats.chars, interaction, silent);
    if (!char) return;

    if (parsed.print !== undefined) {
        if (char.rarity !== "VIP") {
            if (!silent) interaction.reply(`Only VIP characters use print numbers for trading.`);
            return;
        };
        const vipChar = vipChars.find((e) => e.charid === char.id && e.print === parsed.print);
        if (vipChar) return { char, print: parsed.print, isTradeable: vipChar.is_tradeable };
        if (!silent) interaction.reply(`That user does not own **${char.name}#${parsed.print}**.`);
        return;
    };

    if (stats.chars.includes(char.id)) return { char };
};

const exportCommand: SlashCommand = {
    name: 'trade',
    async execute({ interaction, author }) {

        const user = interaction.options.getUser('user') ?? interaction.user;
        if (user.bot) return interaction.reply("You can't trade with a bot <:Heh:869656740667469864>");
        if (user.id === interaction.user.id) return interaction.reply("You can't trade with yourself <:Heh:869656740667469864>");

        // Blacklist
        if (interaction.client.blacklist.has(user.id)) {
            return interaction.reply(`**${user.username}** cannot trade.`);
        };

        const _stats = await getUserSchema(user.id);
        if (!_stats) return interaction.reply(`**${user.username}** hasn't started playing yet.`);
        const vipChars = await getCharacterSchemasOfUser(interaction.user.id);
        const userVipChars = await getCharacterSchemasOfUser(user.id);

        const stats = author.schema;
        if (userLevel(stats.xp) < 25 || userLevel(_stats.xp) < 25) return interaction.reply(`must be level 25 or higher to give characters`);

        if (!stats.chars.length && !vipChars.length) return interaction.reply(`You don't have any characters`);
        if (!_stats.chars.length && !userVipChars.length) return interaction.reply(`**${user.username}** doesn't have any characters`);

        const give = interaction.options.getString('give', true);
        const receive = interaction.options.getString('receive', true);

        const char1 = resolveTradeCharacter(give, stats, vipChars, interaction);
        if (!char1) return;
        if (char1.print === undefined && !stats.chars.includes(char1.char.id)) return interaction.reply(`You don't have a copy of **${char1.char.name}**`);
        if (char1.isTradeable === false) return interaction.reply(`**${formatTradeCharacter(char1)}** is not tradeable.`);
        if (stats.charlock.includes(char1.char.id) || stats.animelock.includes(char1.char.animeInfo.id)) return interaction.reply(`⚠️ You're trying to trade a locked character, please unlock it first.`);

        const char2 = resolveTradeCharacter(receive, _stats, userVipChars, interaction);
        if (!char2) return;
        if (char2.print === undefined && !_stats.chars.includes(char2.char.id)) return interaction.reply(`${user.username} doesn't have a copy of **${char2.char.name}**`);
        if (char2.isTradeable === false) return interaction.reply(`**${formatTradeCharacter(char2)}** is not tradeable.`);
        if (_stats.charlock.includes(char2.char.id) || _stats.animelock.includes(char2.char.animeInfo.id)) return interaction.reply(`⚠️ You're trying to trade a locked character of **${user.username}**, please unlock it first.`);

        return interaction.reply({ content: `${user.toString()} **${interaction.user.username}** wants to trade **${formatTradeCharacter(char1)}** for your **${formatTradeCharacter(char2)}**. Do you accept?`, components: [OfferRow] }).then(msg => {

            const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 30000 });
            const cancel = msg.createMessageComponentCollector({ filter: (r) => (r.user.id === user.id || r.user.id === interaction.user.id) && r.customId === "cancel", componentType: ComponentType.Button, time: 30000 });

            collectComponentUpdates(confirm, async () => {
                confirm.stop(), cancel.stop();

                const stats = await getUserSchema(interaction.user.id);
                if (!stats) return;
                const vipChars = await getCharacterSchemasOfUser(interaction.user.id);
                const char1 = resolveTradeCharacter(give, stats, vipChars, interaction, true);
                if (!char1 || (char1.print === undefined && !stats.chars.includes(char1.char.id))) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have a copy of **${give}**`);
                    return;
                };
                if (char1.isTradeable === false) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`**${formatTradeCharacter(char1)}** is not tradeable.`);
                    return;
                };

                const _stats = await getUserSchema(user.id);
                if (!_stats) return;
                const userVipChars = await getCharacterSchemasOfUser(user.id);
                const char2 = resolveTradeCharacter(receive, _stats, userVipChars, interaction, true);
                if (!char2 || (char2.print === undefined && !_stats.chars.includes(char2.char.id))) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`${user.username} doesn't have a copy of **${receive}**`);
                    return;
                };
                if (char2.isTradeable === false) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`**${formatTradeCharacter(char2)}** is not tradeable.`);
                    return;
                };
                if (stats.charlock.includes(char1.char.id) || stats.animelock.includes(char1.char.animeInfo.id)) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`⚠️ You're trying to trade a locked character, please unlock it first.`);
                    return;
                };
                if (_stats.charlock.includes(char2.char.id) || _stats.animelock.includes(char2.char.animeInfo.id)) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`⚠️ You're trying to trade a locked character of **${user.username}**, please unlock it first.`);
                    return;
                };

                if (char1.print === undefined) stats.chars.splice(stats.chars.indexOf(char1.char.id), 1);
                if (char2.print === undefined) _stats.chars.splice(_stats.chars.indexOf(char2.char.id), 1);
                if (char2.print === undefined) stats.chars.push(char2.char.id);
                if (char1.print === undefined) _stats.chars.push(char1.char.id);

                // Update users table
                await updateUsers(interaction.user.id, {
                    chars: { type: "set", value: stats.chars }
                });
                await updateUsers(user.id, {
                    chars: { type: "set", value: _stats.chars }
                });

                if (char1.print !== undefined) await transferCharacter(user.id, char1.char.id, char1.print);
                if (char2.print !== undefined) await transferCharacter(interaction.user.id, char2.char.id, char2.print);

                if (interaction.channel?.isSendable()) interaction.channel.send(`Your trade was successful`);
            });

            collectComponentUpdates(cancel, async () => {
                confirm.stop(), cancel.stop();
                if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
            });

        });
    },
};

export default exportCommand;
