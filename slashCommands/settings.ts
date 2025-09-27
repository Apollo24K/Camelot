import { formatNumberWithQuotes } from '../Modules/functions';
import { updateUsers } from '../Modules/queries';
import { SlashCommand } from '../types';

const exportCommand: SlashCommand = {
    name: 'settings',
    async execute({ interaction, author }) {

        const setting = interaction.options.getString('setting', true);
        const input = interaction.options.getString('input', true);

        // Compact battle embeds
        if (setting === "compact_battle_embeds") {
            if (input.toLowerCase() !== "true" && input.toLowerCase() !== "false") {
                return interaction.reply("Please input either `true` or `false`");
            };

            // Update users table
            await updateUsers(interaction.user.id, {
                user_settings: { type: "merge_json", value: { compact_battle_embeds: input.toLowerCase() === "true" ? true : false } },
            });

            return interaction.reply(`🎉 Compact battle embeds are now **${input.toLowerCase() === "true" ? "enabled" : "disabled"}**!`);
        };

        // Battle log length
        if (setting === "battle_log_length") {
            const numInput = parseInt(input);
            if (isNaN(numInput) || numInput < 1 || numInput > 10) {
                return interaction.reply("Please input a number between `1` and `10`");
            };

            // Update users table
            await updateUsers(interaction.user.id, {
                user_settings: { type: "merge_json", value: { battle_log_length: `${numInput}` } },
            });

            return interaction.reply(`🎉 Battle log length is now set to **${numInput}**!`);
        };

        // Random HP Bar
        if (setting === "random_hp_bar") {
            if (input.toLowerCase() !== "true" && input.toLowerCase() !== "false") {
                return interaction.reply("Please input either `true` or `false`");
            };

            // Update users table
            await updateUsers(interaction.user.id, {
                user_settings: { type: "merge_json", value: { random_hp_bar: input.toLowerCase() === "true" ? true : false } },
            });

            return interaction.reply(`🎉 Random HP Bar is now **${input.toLowerCase() === "true" ? "enabled" : "disabled"}**!`);
        };

    },
};

export default exportCommand;
