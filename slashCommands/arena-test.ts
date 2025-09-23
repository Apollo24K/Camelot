import fs from 'fs';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle } from "discord.js";
import { DetailedStats, SlashCommand } from '../types';
import { abilities } from "../Modules/abilities";
import { achievements } from "../Modules/achievements";
import { classes } from "../Modules/classes";
import { skills } from "../Modules/skills";
import { armorInfo, items, ringInfo, weaponInfo } from "../Modules/items";
import { characters } from "../Modules/chars";
import { dailies } from "../Modules/dailyQuests";
import { getDetailedStats, customEmojis, deleteReplyIn, dealDamage } from "../Modules/functions";
import Avalon from "../Modules/avalon";
import buffInfo from "../Modules/buffs";
import _ from 'lodash';
import { getUserSchema, updateUsers } from '../Modules/queries';
import { AbilityResponse } from '../Modules/components';

const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
        .setCustomId('1')
        .setLabel('Accept')
        .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
        .setCustomId('0')
        .setLabel('Decline')
        .setStyle(ButtonStyle.Danger),
);

const exportCommand: SlashCommand = {
    name: 'arena',
    async execute({ interaction, author }) {

    }
};

export default exportCommand;