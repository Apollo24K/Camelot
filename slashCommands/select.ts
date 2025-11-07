import { EmbedBuilder } from "discord.js";
import { achievements } from "../Modules/achievements";
import { search } from "../Modules/functions";
import { SlashCommand } from '../types';
import { getPartyMembers, getLatestStampede, updateUsers } from '../Modules/queries';

const dungeonInProgress = new Set();

const exportCommand: SlashCommand = {
    name: 'select',
    async execute({ interaction, author }) {

        const choice = interaction.options.getString('character', true);
        const mode = interaction.options.getString('mode');

        const stats = author.schema;

        const char = search(choice, stats.chars, interaction);
        if (!char) return;
        if (!stats.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);

        let thumbnail = char.image;
        if (stats.favchar !== null) thumbnail = char.getImage(stats.premium, stats.custom_skins[char.id], stats.char_skin[char.id]);

        if (mode && stats.party !== null) {
            const members = await getPartyMembers(stats.party);
            const member = members.find((e) => e.stampedechar === char.id);
            if (member) return interaction.reply(`Someone in your party (${member.name}) has already selected **${char.name}**, please choose another character.`);
        };

        // Set up restrictions
        if (mode) {
            const stampede = await getLatestStampede();
            if (!stampede) return interaction.reply("Couldn't find an active stampede.");
            if (!(stampede.bosshp < 1 || new Date().getDate() > 7)) {
                if (dungeonInProgress.has(interaction.user.id)) return interaction.reply("You need to wait 8h before you can change your character for stampedes again.");
                dungeonInProgress.add(interaction.user.id);
                setTimeout(() => dungeonInProgress.delete(interaction.user.id), 8 * 60 * 60 * 1000);
            };
        };

        const Embed = new EmbedBuilder()
            .setColor({ D: 0x7a7a7a, C: 0x44d53a, B: 0xf2591c, A: 0x2cdfe5, S: 0xfef300, SS: 0x9952eb, EX: 0x2aad9d, default: 0xbbffff }[char.rarity])
            .setDescription(`${mode ? "Stampede" : "Battle"} character set to \n**${char.name}**`)
            .setImage(thumbnail);
        interaction.reply({ embeds: [Embed] });

        // Update db
        await updateUsers(interaction.user.id, {
            [mode ? "stampedechar" : "battlechar"]: { type: "set", value: char.id },
        });

        // Achievements
        achievements[46].check(interaction); // First Steps
    },
};

export default exportCommand;
