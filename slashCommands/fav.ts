import { EmbedBuilder } from "discord.js";
import { achievements } from "../Modules/achievements";
import { search, rarityColor } from "../Modules/functions";
import { SlashCommand } from '../types';
import { updateUsersAndCache } from '../Modules/queries';

const exportCommand: SlashCommand = {
    name: 'fav',
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction, author }) {

        const choice = interaction.options.getString('character', true);

        const stats = author.schema;

        const char = search(choice, stats.chars, interaction);
        if (!char) return;
        if (!stats.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);

        const thumbnail = char.getImage(stats.premium, stats.custom_skins[char.id], stats.char_skin[char.id]);

        const Embed = new EmbedBuilder()
            .setColor(rarityColor(char.rarity))
            .setDescription(`Favourite character set to \n**${char.name}**`)
            .setImage(thumbnail);
        interaction.reply({ embeds: [Embed] });

        await updateUsersAndCache(interaction.client, interaction.user.id, {
            updates: {
                favchar: { type: "set", value: char.id }
            },
        });

        // Achievements
        achievements[46].check(interaction); // First Steps
    },
};

export default exportCommand;
