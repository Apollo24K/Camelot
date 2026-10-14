import { EmbedBuilder } from "discord.js";
import { achievements } from "../Modules/achievements";
import { rarityColor, search } from "../Modules/functions";
import { SlashCommand } from '../types';
import { getCharacterSchemasOfUser, getGuildSchema, getPartyMembers, getLatestStampede, getUserSchemas, updateUsersAndCache } from '../Modules/queries';
import { isEventOngoing } from '../Modules/components';

const dungeonInProgress = new Set();
const bossHuntInProgress = new Set();

const exportCommand: SlashCommand = {
    name: 'select',
    skipUserRefetch: true,
    skipServerRefetch: true,
    async execute({ interaction, author }) {

        const choice = interaction.options.getString('character', true);
        const mode = interaction.options.getString('mode');

        const stats = author.schema;

        const char = search(choice, stats.chars, interaction);
        if (!char) return;

        // Check ownership: normal chars from stats.chars[], VIP from characters table
        if (char.rarity === "VIP") {
            const vipChars = await getCharacterSchemasOfUser(interaction.user.id);
            if (!vipChars.some((e) => e.charid === char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);
        } else {
            if (!stats.chars.includes(char.id)) return interaction.reply(`You don't have a copy of **${char.name}**`);
        }

        let thumbnail = char.image;
        if (stats.favchar !== null) thumbnail = char.getImage(stats.premium, stats.custom_skins[char.id], stats.char_skin[char.id]);

        if (mode === "stampede" && stats.party !== null) {
            const members = await getPartyMembers(stats.party);
            const member = members.find((e) => e.stampedechar === char.id);
            if (member) return interaction.reply(`Someone in your party (${member.name}) has already selected **${char.name}**, please choose another character.`);
        };

        // Set up restrictions
        if (mode === "stampede") {
            const stampede = await getLatestStampede();
            if (!stampede) return interaction.reply("Couldn't find an active stampede.");
            if (!(stampede.bosshp < 1 || new Date().getDate() > 7)) {
                if (dungeonInProgress.has(interaction.user.id)) return interaction.reply("You need to wait 8h before you can change your character for stampedes again.");
                dungeonInProgress.add(interaction.user.id);
                setTimeout(() => dungeonInProgress.delete(interaction.user.id), 8 * 60 * 60 * 1000);
            };
        } else if (mode === "bosshunt") {
            if (!stats.guild) return interaction.reply("You need to be in a guild to select a boss hunt character.\nYou can find one using `/guild find` or create your own using `/guild create`.");
            const guild = await getGuildSchema(stats.guild);
            if (!guild) return interaction.reply("You need to be in a guild to select a boss hunt character.\nYou can find one using `/guild find` or create your own using `/guild create`.");
            const members = await getUserSchemas(guild.members);
            const member = members.find((e) => e.id !== interaction.user.id && e.bosshuntchar === char.id);
            if (member) return interaction.reply(`Someone in your guild (${member.name}) has already selected **${char.name}**, please choose another character.`);
            if (isEventOngoing()) {
                if (bossHuntInProgress.has(interaction.user.id)) return interaction.reply("You need to wait 8h before you can change your character for boss hunts again.");
                bossHuntInProgress.add(interaction.user.id);
                setTimeout(() => bossHuntInProgress.delete(interaction.user.id), 8 * 60 * 60 * 1000);
            };
        };

        const Embed = new EmbedBuilder()
            .setColor(rarityColor(char.rarity))
            .setDescription(`${mode === "stampede" ? "Stampede" : mode === "bosshunt" ? "Boss Hunt" : "Battle"} character set to \n**${char.name}**`)
            .setImage(thumbnail);
        interaction.reply({ embeds: [Embed] });

        // Update db
        await updateUsersAndCache(interaction.client, interaction.user.id, {
            updates: {
                [mode === "stampede" ? "stampedechar" : mode === "bosshunt" ? "bosshuntchar" : "battlechar"]: { type: "set", value: char.id },
            },
        });

        // Achievements
        achievements[46].check(interaction); // First Steps
    },
};

export default exportCommand;
