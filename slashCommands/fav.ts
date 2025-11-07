import { EmbedBuilder } from "discord.js";
import { achievements } from "../Modules/achievements";
import { search } from "../Modules/functions";
import { SlashCommand } from '../types';
import { updateUsers } from '../Modules/queries';

const exportCommand: SlashCommand = {
    name: 'fav',
    async execute({ interaction, author }) {

        const choice = interaction.options.getString('character', true);

        const stats = author.schema;

        const char = search(choice, stats.chars, interaction);
        if (!char) return;
        if (!stats.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);

        const thumbnail = char.getImage(stats.premium, stats.custom_skins[char.id], stats.char_skin[char.id]);

        const Embed = new EmbedBuilder()
            .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[char.rarity])
            .setDescription(`Favourite character set to \n**${char.name}**`)
            .setImage(thumbnail);
        interaction.reply({ embeds: [Embed] });

        await updateUsers(interaction.user.id, {
            favchar: { type: "set", value: char.id }
        });

        // Achievements
        achievements[46].check(interaction); // First Steps
    },
};

export default exportCommand;
