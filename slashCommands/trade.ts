import fs from 'fs';
import { ComponentType } from "discord.js";
import { search, userLevel } from "../Modules/functions.js";
import { OfferRow } from "../Modules/components.js";
import { SlashCommand } from '../types.js';
import { getUserSchema, updateUsers } from '../Modules/queries.js';

const exportCommand: SlashCommand = {
    name: 'trade',
    async execute({ interaction, author }) {

        const user = interaction.options.getUser('user') ?? interaction.user;
        if (user.bot) return interaction.reply("You can't trade with a bot <:Heh:869656740667469864>");
        if (user.id === interaction.user.id) return interaction.reply("You can't trade with yourself <:Heh:869656740667469864>");

        // Blacklist
        const blacklist = JSON.parse(fs.readFileSync('Storage/blacklist.json', 'utf8'));
        if (user.id in blacklist) return interaction.reply(`**${user.username}** cannot trade.`);

        const _stats = await getUserSchema(user.id);
        if (!_stats) return interaction.reply(`**${user.username}** hasn't started playing yet.`);

        const stats = author.schema;
        if (userLevel(stats.xp) < 25 || userLevel(_stats.xp) < 25) return interaction.reply(`must be level 25 or higher to give characters`);

        if (!stats.chars.length) return interaction.reply(`You don't have any characters`);
        if (!_stats.chars.length) return interaction.reply(`**${user.username}** doesn't have any characters`);

        const give = interaction.options.getString('give', true);
        const receive = interaction.options.getString('receive', true);

        const char1 = search(give, stats.chars, interaction);
        if (!char1) return;
        if (!stats.chars.includes(char1.id)) return interaction.reply(`You don't have a copy of **${char1.name}**`);
        if (stats.charlock.includes(char1.id) || stats.animelock.includes(char1.animeInfo.id)) return interaction.reply(`⚠️ You're trying to trade a locked character, please unlock it first.`);

        const char2 = search(receive, _stats.chars, interaction);
        if (!char2) return;
        if (!_stats.chars.includes(char2.id)) return interaction.reply(`${user.username} doesn't have a copy of **${char2.name}**`);
        if (_stats.charlock.includes(char2.id) || _stats.animelock.includes(char2.animeInfo.id)) return interaction.reply(`⚠️ You're trying to trade a locked character of **${user.username}**, please unlock it first.`);

        return interaction.reply({ content: `${user.toString()} **${interaction.user.username}** wants to trade **${char1.name}** for your **${char2.name}**. Do you accept?`, components: [OfferRow] }).then(msg => {

            const confirm = msg.createMessageComponentCollector({ filter: (r) => r.user.id === user.id && r.customId === "confirm", componentType: ComponentType.Button, time: 30000 });
            const cancel = msg.createMessageComponentCollector({ filter: (r) => (r.user.id === user.id || r.user.id === interaction.user.id) && r.customId === "cancel", componentType: ComponentType.Button, time: 30000 });

            confirm.on('collect', async () => {
                confirm.stop(), cancel.stop();

                const stats = await getUserSchema(interaction.user.id);
                if (!stats) return;
                if (!stats.chars.includes(char1.id)) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have a copy of **${char1.name}**`);
                    return;
                };

                const _stats = await getUserSchema(user.id);
                if (!_stats) return;
                if (!_stats.chars.includes(char2.id)) {
                    if (interaction.channel?.isSendable()) interaction.channel.send(`${user.username} doesn't have a copy of **${char2.name}**`);
                    return;
                };

                stats.chars.splice(stats.chars.indexOf(char1.id), 1);
                _stats.chars.splice(_stats.chars.indexOf(char2.id), 1);
                stats.chars.push(char2.id);
                _stats.chars.push(char1.id);

                // Update users table
                await updateUsers(interaction.user.id, {
                    chars: { type: "set", value: stats.chars }
                });
                await updateUsers(user.id, {
                    chars: { type: "set", value: _stats.chars }
                });

                if (interaction.channel?.isSendable()) interaction.channel.send(`Your trade was successful`);
            });

            cancel.on('collect', () => {
                confirm.stop(), cancel.stop();
                if (interaction.channel?.isSendable()) interaction.channel.send("Action cancelled");
            });

        });
    },
};

export default exportCommand;
