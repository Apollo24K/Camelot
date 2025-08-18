import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, AttachmentBuilder, ComponentType, ButtonStyle } from 'discord.js';
import { PageRow, OfferRow, ongoingEvent, isEventOngoing, seasonalEventEnd, seasonalEventStart } from "../Modules/components";
import { showPage } from "../Modules/functions";
import { characters } from "../Modules/chars";
import { skins } from "../Modules/skins";
import { CompactUserSchema, SlashCommand, UpdateUserOptions } from '../types';
import { createCanvas, Image, loadImage } from '@napi-rs/canvas';
import { getUserSchema, updateUsers } from '../Modules/queries';

// Event Rewards
const milestones: { id: number; required: number; query: UpdateUserOptions; rew: string; image?: string; }[] = [
    {
        id: 0,
        required: 250,
        query: { coins: { type: "increment", value: 300 }, sshard: { type: "increment", value: 4 } },
        rew: "300<:coins:872926669055356939> and 4<:s_shard:917202925514817566>",
    },
    {
        id: 1,
        required: 500,
        query: { coins: { type: "increment", value: 400 }, lootbox: { type: "increment", value: 1 } },
        rew: "400<:coins:872926669055356939> and a lootbox",
    },
    {
        id: 2,
        required: 800,
        query: { coins: { type: "increment", value: 500 }, sticket: { type: "increment", value: 1 } },
        rew: "500<:coins:872926669055356939> and 1x <:s_ticket:927642487705722890>",
    },
    {
        id: 3,
        required: 1250,
        query: { coins: { type: "increment", value: 550 }, lootbox: { type: "increment", value: 1 }, sticket: { type: "increment", value: 2 } },
        rew: "550<:coins:872926669055356939>, 2x <:s_ticket:927642487705722890> and a lootbox",
    },
    {
        id: 4,
        required: 1800,
        query: { coins: { type: "increment", value: 600 }, lootbox: { type: "increment", value: 1 }, sshard: { type: "increment", value: 8 } },
        rew: "600<:coins:872926669055356939>, 8x <:s_shard:917202925514817566> and a lootbox",
    },
    {
        id: 5,
        required: 2500,
        query: { expulls: { type: "increment", value: 1 }, gems: { type: "increment", value: 10 } },
        rew: "1x <a:EXTRA:1138530846144462968> & 10<:genesis_gems:1034179687720681492>",
    },
    {
        id: 6,
        required: 3200,
        query: { coins: { type: "increment", value: 700 }, lootbox: { type: "increment", value: 2 }, sshard: { type: "increment", value: 10 } },
        rew: "700<:coins:872926669055356939>, 10x <:s_shard:917202925514817566> and 2 lootboxes",
    },
    {
        id: 7,
        required: 3800,
        query: { coins: { type: "increment", value: 750 }, sticket: { type: "increment", value: 2 } },
        rew: "750<:coins:872926669055356939>, 2x <:s_ticket:927642487705722890>",
    },
    {
        id: 8,
        required: 4400,
        query: { coins: { type: "increment", value: 800 }, lootbox: { type: "increment", value: 2 }, ssshard: { type: "increment", value: 4 } },
        rew: "800<:coins:872926669055356939>, 4x <:ss_shard:917203009543503892> and 2 lootboxes",
    },
    {
        id: 9,
        required: 5000,
        query: { expulls: { type: "increment", value: 1 }, sticket: { type: "increment", value: 3 } },
        rew: "1x <a:EXTRA:1138530846144462968> and 3x <:s_ticket:927642487705722890>",
    },
    {
        id: 10,
        required: 6000,
        query: { coins: { type: "increment", value: 900 }, lootbox: { type: "increment", value: 1 }, ssshard: { type: "increment", value: 4 } },
        rew: "900<:coins:872926669055356939>, 4x <:ss_shard:917203009543503892> and a lootbox",
    },
    {
        id: 11,
        required: 7250,
        query: { coins: { type: "increment", value: 1000 }, ssshard: { type: "increment", value: 6 } },
        rew: "1000<:coins:872926669055356939>, 6x <:ss_shard:917203009543503892>",
    },
    {
        id: 12,
        required: 8500,
        query: { coins: { type: "increment", value: 1000 }, sticket: { type: "increment", value: 3 } },
        rew: "1000<:coins:872926669055356939>, 3x <:s_ticket:927642487705722890>",
    },
    {
        id: 13,
        required: 10000,
        query: { expulls: { type: "increment", value: 1 }, ssticket: { type: "increment", value: 1 } },
        rew: "1x <a:EXTRA:1138530846144462968> and 1x <:ss_ticket:927503239396622336>",
    },
    {
        id: 14,
        required: 12500,
        query: { coins: { type: "increment", value: 1200 }, lootbox: { type: "increment", value: 3 } },
        rew: "1200<:coins:872926669055356939> and 3 lootboxes",
    },
    {
        id: 15,
        required: 15000,
        query: { expulls: { type: "increment", value: 1 }, ssticket: { type: "increment", value: 1 } },
        rew: "1x <a:EXTRA:1138530846144462968> and 1x <:ss_ticket:927503239396622336>",
    },
    {
        id: 16,
        required: 18000,
        query: { coins: { type: "increment", value: 1250 }, lootbox: { type: "increment", value: 2 }, ssticket: { type: "increment", value: 1 } },
        rew: "1250<:coins:872926669055356939>, 1x <:ss_ticket:927503239396622336> and 2 lootboxes",
    },
    {
        id: 17,
        required: 22500,
        query: { expulls: { type: "increment", value: 1 }, ssticket: { type: "increment", value: 1 } },
        rew: "1x <a:EXTRA:1138530846144462968> and 1x <:ss_ticket:927503239396622336>",
    },
    {
        id: 18,
        required: 26000,
        query: { lootbox: { type: "increment", value: 6 } },
        rew: "6 lootboxes",
    },
    {
        id: 19,
        required: 30000,
        query: { expulls: { type: "increment", value: 2 } },
        rew: "2x <a:EXTRA:1138530846144462968>",
    },
    {
        id: 20,
        required: 36000,
        query: { coins: { type: "increment", value: 1250 }, gems: { type: "increment", value: 10 }, lootbox: { type: "increment", value: 2 } },
        rew: "1250<:coins:872926669055356939>, 10<:genesis_gems:1034179687720681492> and 2 lootboxes",
    },
    {
        id: 21,
        required: 42000,
        query: { coins: { type: "increment", value: 3000 }, expulls: { type: "increment", value: 1 } },
        rew: "1x <a:EXTRA:1138530846144462968> and 3000<:coins:872926669055356939>",
    },
    {
        id: 22,
        required: 50000,
        query: { gems: { type: "increment", value: 20 }, lootbox: { type: "increment", value: 3 }, ssticket: { type: "increment", value: 1 } },
        rew: "20<:genesis_gems:1034179687720681492>, 1x <:ss_ticket:927503239396622336> and 3 lootboxes",
    },
    {
        id: 23,
        required: 60000,
        query: { coins: { type: "increment", value: 3000 }, gems: { type: "increment", value: 10 }, lootbox: { type: "increment", value: 3 }, ssticket: { type: "increment", value: 1 } },
        rew: "3000<:coins:872926669055356939>, 10<:genesis_gems:1034179687720681492>, 1x <:ss_ticket:927503239396622336> and 3 lootboxes",
    },
    {
        id: 24,
        required: 72000,
        query: { expulls: { type: "increment", value: 1 }, lootbox: { type: "increment", value: 3 }, ssticket: { type: "increment", value: 1 } },
        rew: "1x <a:EXTRA:1138530846144462968>, 1x <:ss_ticket:927503239396622336> and 3 lootboxes",
    },
    {
        id: 25,
        required: 80000,
        query: { ssticket: { type: "increment", value: 2 }, sticket: { type: "increment", value: 6 } },
        rew: "2x <:ss_ticket:927503239396622336> and 6x <:s_ticket:927642487705722890>",
    },
    {
        id: 26,
        required: 100000,
        query: { gems: { type: "increment", value: 20 }, expulls: { type: "increment", value: 1 } },
        rew: "1x <a:EXTRA:1138530846144462968> and 20<:genesis_gems:1034179687720681492>",
    },
];

function getRow(disableBuy = false) {
    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setEmoji('⏪')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('⏩')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('nextskin')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('buy')
                .setLabel('Buy')
                .setStyle(ButtonStyle.Success)
                .setDisabled(disableBuy),
        );
};

function getShopRow(tab: "current" | "past" | "other") {
    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('current')
                .setEmoji('<:easterEgg:1095432499087278142>')
                .setLabel('Easter 2024')
                .setStyle(tab === 'current' ? ButtonStyle.Primary : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('past')
                .setEmoji('🎃')
                .setLabel('Past Skins')
                .setStyle(tab === 'past' ? ButtonStyle.Primary : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('other')
                .setEmoji('🎐')
                .setLabel('Other')
                .setStyle(tab === 'other' ? ButtonStyle.Primary : ButtonStyle.Secondary),
        );
};

const loadedImages: Record<string, Image> = {};

async function getPageImage(showSkins: number[], selected: number) {
    // Create a canvas
    const canvas = createCanvas(1000, 760);
    const ctx = canvas.getContext('2d');

    // Load Frame
    loadedImages["selectedFrame"] ||= await loadImage("https://i.ibb.co/x1yGxm6/ss.png");

    // Draw character images
    for (let i = 0; i < showSkins.length; i++) {
        const skin = skins[showSkins[i]];
        const char = characters[skin.cid];
        loadedImages[skin.id] ||= await loadImage(skin.image);

        ctx.drawImage(loadedImages[skin.id], 20 + ((i % 4) * (20 + 225)), 20 + (Math.floor(i / 4) * (20 + 350)), 225, 350);
        if (i === selected) ctx.drawImage(loadedImages["selectedFrame"], 10 + ((i % 4) * (20 + 225)), 10 + (Math.floor(i / 4) * (20 + 350)));

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(20 + ((i % 4) * (20 + 225)) + 2, 330 + (Math.floor(i / 4) * (20 + 350)), 225 - 2 - 2, 40 - 2);

        // Draw Name
        ctx.fillStyle = '#ffffff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char.name, 20 + ((i % 4) * (20 + 225)) + 2 + 112, 350 + (Math.floor(i / 4) * (20 + 350)), 225 - 2 - 2);
    };

    // Convert to buffer and upload
    const buffer = canvas.toBuffer('image/png');
    return new AttachmentBuilder(buffer);
};

type PassReward = "coins" | "gems" | "ex" | "ssticket" | "sticket" | "ssshard" | "sshard" | "deluxe";

const passRewards: [{ id: number; type: PassReward; amount: number; itemid?: number; }[], { id: number; type: PassReward; amount: number; itemid?: number; }[]] = [
    [ // 0: Free
        { id: 0, type: "coins", amount: 2000 },
        { id: 1, type: "ssshard", amount: 2 },
        { id: 2, type: "sticket", amount: 1 },
        { id: 3, type: "coins", amount: 2100 },
        { id: 4, type: "ssticket", amount: 1 },
        { id: 5, type: "ex", amount: 1 },
        { id: 6, type: "coins", amount: 2200 },
        { id: 7, type: "ssticket", amount: 1 },
        { id: 8, type: "sshard", amount: 4 },
        { id: 9, type: "coins", amount: 2250 },
        { id: 10, type: "ex", amount: 1 },
        { id: 11, type: "gems", amount: 10 },
        { id: 12, type: "coins", amount: 2500 },
        { id: 13, type: "ex", amount: 1 },
        { id: 14, type: "sticket", amount: 2 },
        { id: 15, type: "ssshard", amount: 2 },
        { id: 16, type: "ssticket", amount: 1 },
        { id: 17, type: "coins", amount: 2600 },
        { id: 18, type: "ex", amount: 1 },
        { id: 19, type: "sshard", amount: 6 },
        { id: 20, type: "sticket", amount: 2 },
        { id: 21, type: "ssshard", amount: 3 },
        { id: 22, type: "ex", amount: 1 },
        { id: 23, type: "ssticket", amount: 1 },
        { id: 24, type: "gems", amount: 10 },
        { id: 25, type: "ex", amount: 2 },
        { id: 26, type: "coins", amount: 3000 },
        { id: 27, type: "ssshard", amount: 3 },
        { id: 28, type: "sticket", amount: 2 },
        { id: 29, type: "ssticket", amount: 1 },
        { id: 30, type: "ex", amount: 1 },
        { id: 31, type: "coins", amount: 3200 },
        { id: 32, type: "sshard", amount: 6 },
        { id: 33, type: "ssshard", amount: 3 },
        { id: 34, type: "ex", amount: 1 },
        { id: 35, type: "sticket", amount: 2 },
        { id: 36, type: "coins", amount: 3250 },
        { id: 37, type: "ex", amount: 1 },
        { id: 38, type: "ssticket", amount: 1 },
        { id: 39, type: "gems", amount: 10 },
        { id: 40, type: "coins", amount: 3300 },
        { id: 41, type: "sticket", amount: 2 },
        { id: 42, type: "sshard", amount: 6 },
        { id: 43, type: "ex", amount: 1 },
        { id: 44, type: "ssticket", amount: 1 },
        { id: 45, type: "coins", amount: 3500 },
        { id: 46, type: "ex", amount: 2 },
        { id: 47, type: "ssshard", amount: 4 },
        { id: 48, type: "coins", amount: 3400 },
        { id: 49, type: "ssticket", amount: 2 },
        { id: 50, type: "sticket", amount: 2 },
        { id: 51, type: "ex", amount: 1 },
        { id: 52, type: "gems", amount: 10 },
        { id: 53, type: "ssticket", amount: 2 },
        { id: 54, type: "ex", amount: 1 },
        { id: 55, type: "deluxe", amount: 1, itemid: 458 },
    ],
    [ // 1: Premium
        { id: 0, type: "coins", amount: 2000 },
        { id: 1, type: "sshard", amount: 3 },
        { id: 2, type: "ex", amount: 2 },
        { id: 3, type: "coins", amount: 2200 },
        { id: 4, type: "ssshard", amount: 1 },
        { id: 7, type: "ssticket", amount: 1 },
        { id: 5, type: "ex", amount: 1 },
        { id: 6, type: "ssshard", amount: 2 },
        { id: 9, type: "coins", amount: 2400 },
        { id: 8, type: "sshard", amount: 4 },
        { id: 10, type: "ssticket", amount: 1 },
        { id: 11, type: "ex", amount: 1 },
        { id: 12, type: "coins", amount: 2500 },
        { id: 13, type: "sticket", amount: 2 },
        { id: 14, type: "ssshard", amount: 2 },
        { id: 15, type: "ex", amount: 1 },
        { id: 16, type: "ssticket", amount: 1 },
        { id: 17, type: "coins", amount: 2600 },
        { id: 18, type: "sshard", amount: 5 },
        { id: 19, type: "ex", amount: 2 },
        { id: 20, type: "sticket", amount: 2 },
        { id: 21, type: "coins", amount: 3000 },
        { id: 22, type: "ssticket", amount: 1 },
        { id: 23, type: "ssshard", amount: 4 },
        { id: 24, type: "ex", amount: 1 },
        { id: 25, type: "sshard", amount: 6 },
        { id: 26, type: "sticket", amount: 1 },
        { id: 27, type: "coins", amount: 3200 },
        { id: 28, type: "ex", amount: 2 },
        { id: 29, type: "ssshard", amount: 4 },
        { id: 30, type: "ssticket", amount: 1 },
        { id: 31, type: "coins", amount: 3300 },
        { id: 32, type: "ex", amount: 1 },
        { id: 33, type: "sshard", amount: 6 },
        { id: 34, type: "sticket", amount: 2 },
        { id: 35, type: "coins", amount: 3400 },
        { id: 36, type: "ssshard", amount: 4 },
        { id: 37, type: "ex", amount: 2 },
        { id: 38, type: "ssticket", amount: 2 },
        { id: 39, type: "sshard", amount: 8 },
        { id: 40, type: "coins", amount: 3500 },
        { id: 41, type: "ssshard", amount: 5 },
        { id: 42, type: "ex", amount: 1 },
        { id: 43, type: "ssticket", amount: 2 },
        { id: 44, type: "coins", amount: 3600 },
        { id: 45, type: "ssshard", amount: 6 },
        { id: 46, type: "ssticket", amount: 2 },
        { id: 47, type: "ex", amount: 1 },
        { id: 48, type: "coins", amount: 3600 },
        { id: 49, type: "sticket", amount: 3 },
        { id: 50, type: "ex", amount: 1 },
        { id: 51, type: "ssticket", amount: 2 },
        { id: 52, type: "coins", amount: 4000 },
        { id: 53, type: "ssticket", amount: 2 },
        { id: 54, type: "ex", amount: 2 },
        { id: 55, type: "deluxe", amount: 1, itemid: 458 },
    ],
];

function getPassRow(stats: CompactUserSchema) {
    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setEmoji('⏪')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('⏩')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('claim')
                .setLabel('Claim Rewards')
                .setStyle(ButtonStyle.Success)
                .setDisabled(!((stats.freepassclaimed < Math.min(stats.passlevel, passRewards[0].length)) || (stats.pass && stats.premiumpassclaimed < Math.min(stats.passlevel, passRewards[0].length)))),
            new ButtonBuilder()
                .setCustomId('premium')
                .setLabel(stats.pass ? 'Unlock Next Level' : 'Unlock Premium!')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!!stats.pass && stats.passlevel >= passRewards[0].length),
        );
};

async function getPassImage(stats: CompactUserSchema, page: number) {
    // Create a canvas
    const canvas = createCanvas(1040, 535);
    const ctx = canvas.getContext('2d');

    // Colors
    const premiumColor = {
        anniversary: '#e7d9b2', // Gold
        halloween: '#ffa53a', // Orange
        christmas: '#c0f7ff', // Light Blue
        valentines: '#f8c8dc', // Pink
        easter: '#69ffb9', // Light Green
    }[ongoingEvent] || '#e7d9b2'; // Gold

    // Background
    ctx.fillStyle = '#495366'; // Grey
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tile
    for (let i = 0; i < 2; i++) {
        ctx.fillStyle = i ? premiumColor : '#f7f6f2'; // premiumColor : White
        let x = 25, y = 65 + (i * 205), width = canvas.width - 25, height = 180 + (i * 60), rad = 30;
        ctx.beginPath();
        ctx.moveTo(x + rad, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x + rad, y + height);
        ctx.arcTo(x, y + height, x, y + height - rad, rad);
        ctx.lineTo(x, y + rad);
        ctx.arcTo(x, y, x + rad, y, rad);
        ctx.closePath();
        ctx.fill();
    };

    // Free & Premium Text
    ctx.fillStyle = '#495366'; // Grey
    ctx.font = "25px Arial";
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 2; i++) {
        let x = i ? -10 : 15, y = 155 + (i * 235), text = i ? "Premium" : "Free", textWidth = ctx.measureText(text).width;
        ctx.translate(x + textWidth / 2, y);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(text, -textWidth / 2, 0);
        ctx.rotate(Math.PI / 2);
        ctx.translate(-(x + textWidth / 2), -y);
    };

    // Pass Background
    ctx.fillStyle = premiumColor;
    let radius = 15;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(220, 0);
    ctx.lineTo(220, 40);
    ctx.arc(220 - radius, 40 - radius, radius, 0, Math.PI / 2, false);
    ctx.lineTo(0, 40);
    ctx.lineTo(0, 0);
    ctx.fill();

    // Pass Text
    ctx.fillStyle = '#495366';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Event Pass ${Math.min(stats.passlevel, passRewards[0].length)}/${passRewards[0].length}`, 10, 20, 200);
    ctx.fillStyle = premiumColor;
    ctx.fillText({ anniversary: "Anniversary Event", halloween: "Halloween Event", christmas: "Christmas Event", valentines: "Valentine's Event", easter: "Easter Event" }[ongoingEvent], 230, 20, 500);

    // Tiles
    for (let i = 0; i < 6; i++) {
        if (passRewards[0][i + page]) {
            // Box
            ctx.fillStyle = '#7f828a'; // Light Grey
            ctx.fillRect(20 + 60 + (i * 185), 85, 140, 140);
            ctx.fillStyle = '#495366'; // Grey
            ctx.fillRect(20 + 60 + (i * 185), 85, 5, 140);
            ctx.fillRect(20 + 60 + (i * 185), 85, 140, 5);
            ctx.fillRect(20 + 60 + 140 - 5 + (i * 185), 85, 5, 140);
            ctx.fillRect(20 + 60 + (i * 185), 85 + 140 - 5, 140, 5);

            // Premium Box
            ctx.fillStyle = '#7f828a'; // Light Grey
            ctx.fillRect(20 + 60 + (i * 185), 320, 140, 140);
            ctx.fillStyle = '#495366'; // Grey
            ctx.fillRect(20 + 60 + (i * 185), 320, 5, 140);
            ctx.fillRect(20 + 60 + (i * 185), 320, 140, 5);
            ctx.fillRect(20 + 60 + 140 - 5 + (i * 185), 320, 5, 140);
            ctx.fillRect(20 + 60 + (i * 185), 320 + 140 - 5, 140, 5);

            // Grid
            ctx.fillRect(20 + 60 + 140 + 20 + ((i - 1) * 185), 65, 5, canvas.height - 45);

            // Level
            let x = 150 + (i * 185), y = 258;
            ctx.beginPath();
            ctx.moveTo(x, y + 22);
            ctx.lineTo(x + 20, y);
            ctx.lineTo(x, y - 22);
            ctx.lineTo(x - 20, y);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#f7f6f2';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`Lv. ${page + i + 1}`, x, y, 140);

            // Emojis
            loadedImages["coins"] ||= await loadImage("https://cdn.discordapp.com/emojis/872926669055356939.png");
            loadedImages["gems"] ||= await loadImage("https://cdn.discordapp.com/emojis/1034179687720681492.png");
            loadedImages["sshard"] ||= await loadImage("https://cdn.discordapp.com/emojis/917202925514817566.png");
            loadedImages["ssshard"] ||= await loadImage("https://cdn.discordapp.com/emojis/917203009543503892.png");
            loadedImages["sticket"] ||= await loadImage("https://cdn.discordapp.com/emojis/927642487705722890.png");
            loadedImages["ssticket"] ||= await loadImage("https://cdn.discordapp.com/emojis/927503239396622336.png");
            loadedImages["ex"] ||= await loadImage("https://i.ibb.co/dtc3rLG/ex.png");
            loadedImages["deluxe"] ||= await loadImage("https://cdn.discordapp.com/emojis/1069301259603026061.png");
            ctx.drawImage(loadedImages[passRewards[0][i + page].type], 20 + 60 + (i * 185) + 15, 85 + 15, 110, 110);
            ctx.drawImage(loadedImages[passRewards[1][i + page].type], 20 + 60 + (i * 185) + 15, 320 + 15, 110, 110);

            // Amount
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(20 + 60 + 5 + (i * 185), 180, 130, 40);
            ctx.fillRect(20 + 60 + 5 + (i * 185), 415, 130, 40);

            ctx.fillStyle = '#f7f6f2';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("" + passRewards[0][i + page].amount, 90 + 60 + (i * 185), 200, 130);
            ctx.fillText("" + passRewards[1][i + page].amount, 90 + 60 + (i * 185), 435, 130);

            // Lock
            ctx.fillStyle = '#495366'; // Grey
            for (let j = 0; j < 2; j++) {
                if (((stats.passlevel < (page + i + 1)) || (j && stats.pass === 0)) || ((j ? stats.premiumpassclaimed : stats.freepassclaimed) >= (page + i + 1))) {
                    let xx = 140 + 60 + (i * 185), yy = 75 + (j * 235), side = 30, rad = 5;
                    ctx.beginPath();
                    ctx.moveTo(xx + rad, yy);
                    ctx.arcTo(xx + side, yy, xx + side, yy + rad, rad);
                    ctx.arcTo(xx + side, yy + side, xx + side - rad, yy + side, rad);
                    ctx.arcTo(xx, yy + side, xx, yy + side - rad, rad);
                    ctx.arcTo(xx, yy, xx + rad, yy, rad);
                    ctx.closePath();
                    ctx.fill();
                    loadedImages.lock ||= await loadImage("https://i.ibb.co/M7sCt3p/lock.png");
                    loadedImages.check ||= await loadImage("https://i.ibb.co/DKDHFYW/img-icons8.png");
                    if ((stats.passlevel < (page + i + 1)) || (j && stats.pass === 0)) ctx.drawImage(loadedImages.lock, xx + 2, yy + 2, side - 4, side - 4);
                    else if ((j ? stats.premiumpassclaimed : stats.freepassclaimed) >= (page + i + 1)) ctx.drawImage(loadedImages.check, xx + 2, yy + 2, side - 4, side - 4);
                };
            };
        } else {
            // Fill Background
            ctx.fillStyle = '#495366'; // Grey
            ctx.fillRect(980, 65, 60, canvas.height - 45);

            // Tile
            for (let i = 0; i < 2; i++) {
                ctx.fillStyle = i ? premiumColor : '#f7f6f2'; // premiumColor : White
                let x = 985, y = 65 + (i * 205), width = 30, height = 180 + (i * 60), rad = 30;
                // ctx.beginPath();
                // ctx.moveTo(x + rad, y);
                // ctx.lineTo(x + width, y);
                // ctx.lineTo(x + width, y + height);
                // ctx.lineTo(x + rad, y + height);
                // ctx.arcTo(x, y + height, x, y + height - rad, rad);
                // ctx.lineTo(x, y + rad);
                // ctx.arcTo(x, y, x + rad, y, rad);
                // ctx.closePath();
                // ctx.fill();

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + width - rad, y);
                ctx.arcTo(x + width, y, x + width, y + rad, rad);
                ctx.lineTo(x + width, y + height - rad);
                ctx.arcTo(x + width, y + height, x + width - rad, y + height, rad);
                ctx.lineTo(x, y + height);
                ctx.lineTo(x, y);
                ctx.closePath();
                ctx.fill();
            };
        };
    };

    // Convert to buffer and upload
    const buffer = canvas.toBuffer('image/jpeg');
    return new AttachmentBuilder(buffer);
};

const exportCommand: SlashCommand = {
    name: 'event',
    async execute({ interaction, author }) {

        // return interaction.reply("There is no ongoing event as of right now.\n Please see our </support:1011293280702578694> server for more information.");

        const subcommand = interaction.options.getSubcommand();

        const stats = author.schema;

        if (subcommand === "shop") {
            let tab: "current" | "past" | "other" = 'current';
            let selected = 0;
            const sales = {
                current: Array.from({ length: 10 }, (_, i) => i + 95).concat(Array.from({ length: 15 }, (_, i) => i + 25)).sort(() => Math.random() - 0.5),
                past: [5, 6, 9, 11, 12, 14, 18, 19, 20, 22, 23, 40, 41, 42, 43, 44, 45, 46, 47, 48, 50, 55, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 75, 76, 77, 78, 81, 82, 83, 84, 85].sort(() => Math.random() - 0.5),
                other: [24].sort(() => Math.random() - 0.5),
            };

            const elementsPerPage = 8;
            let pagesTotal = Math.ceil(sales[tab].length / elementsPerPage);
            let currPage = 1;

            let showSkins = showPage(currPage, sales[tab], elementsPerPage);

            let file = await getPageImage(showSkins, selected);

            let disableBuy = stats.skins.includes(showSkins[selected]) || (skins[showSkins[selected]].price > stats.eventpts2);

            const Embed = new EmbedBuilder()
                .setTitle('Event Shop')
                .setColor(0xff8733)
                .setImage(`attachment://file.jpg`)
                .setDescription(`Your balance: **${stats.eventpts2}**🌙\nPrice of selected skin: **${skins[showSkins[selected]].price}**🌙`)
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            interaction.reply({ embeds: [Embed], components: [getShopRow(tab), getRow(disableBuy)], files: [file] }).then(msg => {

                const pageCollector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && (r.customId === "prev" || r.customId === "next"), componentType: ComponentType.Button, time: 120000 });
                const tabCollector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && (r.customId === "current" || r.customId === "past" || r.customId === "other"), componentType: ComponentType.Button, time: 120000 });
                const nextCollector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "nextskin", componentType: ComponentType.Button, time: 120000 });
                const buyCollector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "buy", componentType: ComponentType.Button, time: 120000 });

                pageCollector.on('collect', async r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };
                    selected = 0;

                    showSkins = showPage(currPage, sales[tab], elementsPerPage);

                    file = await getPageImage(showSkins, selected);

                    disableBuy = stats.skins.includes(showSkins[selected]) || (skins[showSkins[selected]].price > stats.eventpts2);

                    Embed.setDescription(`Your balance: **${stats.eventpts2}**🌙\nPrice of selected skin: **${skins[showSkins[selected]].price}**🌙`).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed], components: [getShopRow(tab), getRow(disableBuy)], files: [file] });
                });

                tabCollector.on('collect', async r => {
                    if (tab === r.customId) return;
                    if (r.customId !== "current" && r.customId !== "past" && r.customId !== "other") return;

                    tab = r.customId;
                    selected = 0;

                    pagesTotal = Math.ceil(sales[tab].length / elementsPerPage);
                    currPage = 1;

                    showSkins = showPage(currPage, sales[tab], elementsPerPage);

                    file = await getPageImage(showSkins, selected);

                    disableBuy = stats.skins.includes(showSkins[selected]) || (skins[showSkins[selected]].price > stats.eventpts2);

                    Embed.setDescription(`Your balance: **${stats.eventpts2}**🌙\nPrice of selected skin: **${skins[showSkins[selected]].price}**🌙`).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed], components: [getShopRow(tab), getRow(disableBuy)], files: [file] });
                });

                nextCollector.on('collect', async () => {
                    selected++;
                    if (selected >= showSkins.length) selected = 0;

                    file = await getPageImage(showSkins, selected);

                    disableBuy = stats.skins.includes(showSkins[selected]) || (skins[showSkins[selected]].price > stats.eventpts2);

                    Embed.setDescription(`Your balance: **${stats.eventpts2}**🌙\nPrice of selected skin: **${skins[showSkins[selected]].price}**🌙`).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed], components: [getShopRow(tab), getRow(disableBuy)], files: [file] });
                });

                buyCollector.on('collect', async () => {
                    if (stats.skins.includes(showSkins[selected])) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You already own this skin`);
                        return;
                    };
                    if (skins[showSkins[selected]].price > stats.eventpts2) {
                        if (interaction.channel?.isSendable()) interaction.channel.send(`You don't have enough 🌙`);
                        return;
                    };

                    stats.skins.push(showSkins[selected]);
                    stats.eventpts2 -= skins[showSkins[selected]].price;

                    // Update users table
                    await updateUsers(interaction.user.id, {
                        eventpts2: { type: "increment", value: -skins[showSkins[selected]].price },
                        skins: { type: "append_unique", value: [showSkins[selected]] },
                    });

                    if (interaction.channel?.isSendable()) interaction.channel.send(`You've bought **${skins[showSkins[selected]].name}**!`);

                    disableBuy = stats.skins.includes(showSkins[selected]) || (skins[showSkins[selected]].price > stats.eventpts2);

                    Embed.setDescription(`Your balance: **${stats.eventpts2}**🌙\nPrice of selected skin: **${skins[showSkins[selected]].price}**🌙`).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed], components: [getShopRow(tab), getRow(disableBuy)], files: [file] });
                });

            });
        };

        if (subcommand === "rewards") {
            const elementsPerPage = 5;
            const pagesTotal = Math.ceil(milestones.length / elementsPerPage);
            let currPage = 1;

            let showF = showPage(currPage, milestones, elementsPerPage).map((e) => `${e.id + 1}) Required: **${e.required}**🌙${stats.eventpts >= e.required ? " <a:check:873196253276700682>" : ""}\n ➥ ${e.rew}\n`);

            const Embed = new EmbedBuilder()
                .setTitle('Anniversary Event Rewards')
                .setColor(0x2aad9d)
                .setThumbnail("https://i.imgur.com/swyb84q.jpg")
                .setDescription(`Your balance: **${stats.eventpts}**🌙\n\n` + showF.join("\n"))
                .setFooter({ text: `Page ${currPage}/${pagesTotal}` });
            interaction.reply({ embeds: [Embed], components: [PageRow] }).then(msg => {
                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 90000 });

                collector.on('collect', async r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;
                    };

                    showF = showPage(currPage, milestones, elementsPerPage).map((e) => `${e.id + 1}) Required: **${e.required}**🌙${stats.eventpts >= e.required ? " <a:check:873196253276700682>" : ""}\n ➥ ${e.rew}\n`);

                    Embed.setDescription(`Your balance: **${stats.eventpts}**🌙\n\n` + showF.join("\n")).setFooter({ text: `Page ${currPage}/${pagesTotal}` });
                    interaction.editReply({ embeds: [Embed], components: [PageRow] });
                });
            });
        };

        if (subcommand === "pass") {
            const pagesTotal = passRewards[0].length - 4;
            let currPage = Math.min(Math.max(Math.min(stats.passlevel, passRewards[0].length) - 1, 1), pagesTotal);

            let file = await getPassImage(stats, currPage - 1);

            let footer = "";
            if (isEventOngoing()) {
                const timeLeft = seasonalEventEnd.getTime() - Date.now();
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

                const timeComponents: string[] = [];
                if (days > 0) timeComponents.push(`${days}d`);
                if (hours > 0) timeComponents.push(`${hours}h`);
                if (minutes > 0) timeComponents.push(`${minutes}min`);

                footer = `The event will end in ${timeComponents.join(' ')}`;
            } else if (Date.now() > seasonalEventEnd.getTime()) {
                footer = "The event has ended!";
            } else {
                // Return how much time is left till start
                const timeLeft = seasonalEventStart.getTime() - Date.now();
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

                const timeComponents: string[] = [];
                if (days > 0) timeComponents.push(`${days}d`);
                if (hours > 0) timeComponents.push(`${hours}h`);
                if (minutes > 0) timeComponents.push(`${minutes}min`);

                footer = `The event will start in ${timeComponents.join(' ')}`;
            };

            const Embed = new EmbedBuilder()
                .setColor({ anniversary: 0x2aad9d, halloween: 0xff8733, christmas: 0x94f7ff, valentines: 0xf8c8dc, easter: 0x69ffb9 }[ongoingEvent] || 0x2aad9d)
                .setImage(`attachment://file.jpg`)
                .setFooter({ text: footer, iconURL: "https://cdn.discordapp.com/emojis/1131679799207796756.webp?size=56" })
                .setDescription(`Complete daily </quests:1087099255652622433> to unlock rewards!\nWith </give pass:1013437508933128242> you can gift someone a premium pass! (**${Math.max(0, 5 - stats.passpurchaselimit)}**/5 left)`);
            interaction.reply({ embeds: [Embed], components: [getPassRow(stats)], files: [file] }).then(msg => {

                const pageCollector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && (r.customId === "prev" || r.customId === "next"), componentType: ComponentType.Button, time: 120000 });
                const premiumCollector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "premium", componentType: ComponentType.Button, time: 120000 });
                const claimCollector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "claim", componentType: ComponentType.Button, time: 120000 });

                pageCollector.on('collect', async r => {
                    if (r.customId === "prev") {
                        if (currPage > 1) currPage -= ((currPage - 1) % 5) || 5;
                        else currPage = pagesTotal;
                    } else {
                        if (currPage < pagesTotal) currPage = Math.min(currPage + 5, pagesTotal);
                        else currPage = 1;
                    };

                    let file = await getPassImage(stats, currPage - 1);
                    interaction.editReply({ files: [file] });
                });

                premiumCollector.on('collect', () => {
                    const content = stats.pass ? "Do you want to unlock the next reward for **100** <:genesis_gems:1034179687720681492>?" : "Do you want to upgrade your event pass for **1000** <:genesis_gems:1034179687720681492>?";
                    interaction.followUp({ content, components: [OfferRow], fetchReply: true, ephemeral: true }).then(message => {
                        const collector = message.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id, componentType: ComponentType.Button, time: 30000 });

                        collector.on('collect', async r => {
                            if (r.customId === "cancel") return collector.stop();
                            if (stats.pass === 0) collector.stop();

                            const stats2 = await getUserSchema(interaction.user.id);
                            if (!stats2) return;

                            if (stats.pass !== stats2.pass) return interaction.followUp({ content: `You've already bought the premium pass!`, ephemeral: true });
                            Object.assign(stats, stats2);

                            if (stats.pass) {
                                if (stats.passlevel >= passRewards[0].length) return interaction.followUp({ content: `You've reached the max level!`, ephemeral: true });
                                if (stats.gems < 100) return interaction.followUp({ content: `You don't have enough gems (**${stats.gems}**/100<:genesis_gems:1034179687720681492>)`, ephemeral: true });

                                // Update users table
                                await updateUsers(interaction.user.id, {
                                    passlevel: { type: "increment", value: 1 },
                                    gems: { type: "increment", value: -100 },
                                });

                                stats.passlevel += 1;
                                stats.gems -= 100;
                                currPage = Math.min(Math.max(stats.passlevel - 1, 1), pagesTotal);
                            } else {
                                if (stats.gems < 1000) return interaction.followUp({ content: `You don't have enough gems (**${stats.gems}**/1000<:genesis_gems:1034179687720681492>)`, ephemeral: true });

                                // Update users table
                                await updateUsers(interaction.user.id, {
                                    pass: { type: "set", value: 1 },
                                    gems: { type: "increment", value: -1000 },
                                });

                                stats.pass = 1;
                                stats.gems -= 1000;
                            };

                            let file = await getPassImage(stats, currPage - 1);
                            interaction.editReply({ components: [getPassRow(stats)], files: [file] });
                        });
                    });
                });

                claimCollector.on('collect', async () => {
                    const stats2 = await getUserSchema(interaction.user.id);
                    Object.assign(stats, stats2);

                    const addRewards: Record<PassReward, number> = { coins: 0, gems: 0, ex: 0, ssticket: 0, sticket: 0, ssshard: 0, sshard: 0, deluxe: 0 };
                    const newItems: Record<number, number> = {};
                    for (const tier of [0, 1] as const) {
                        if (tier && stats.pass === 0) break;
                        for (let i = (tier ? stats.premiumpassclaimed : stats.freepassclaimed); i < Math.min(stats.passlevel, passRewards[0].length); i++) {
                            const reward = passRewards[tier][i];
                            const rewardType = reward.type;
                            const itemid = reward.itemid;
                            if (rewardType === "deluxe" && itemid !== undefined) newItems[itemid] = (newItems[itemid] + reward.amount) || reward.amount;
                            else addRewards[rewardType] += reward.amount;
                        };
                    };

                    // Update users table
                    const userUpdates: UpdateUserOptions = {
                        freepassclaimed: { type: "set", value: Math.min(stats.passlevel, passRewards[0].length) },
                        coins: { type: "increment", value: addRewards.coins },
                        gems: { type: "increment", value: addRewards.gems },
                        expulls: { type: "increment", value: addRewards.ex },
                        ssshard: { type: "increment", value: addRewards.ssshard },
                        sshard: { type: "increment", value: addRewards.sshard },
                        ssticket: { type: "increment", value: addRewards.ssticket },
                        sticket: { type: "increment", value: addRewards.sticket },
                        items: { type: "merge_json", value: newItems },
                    };
                    if (stats.pass) userUpdates.premiumpassclaimed = { type: "set", value: Math.min(stats.passlevel, passRewards[0].length) };
                    await updateUsers(interaction.user.id, userUpdates);

                    stats.freepassclaimed = Math.min(stats.passlevel, passRewards[0].length);
                    if (stats.pass) stats.premiumpassclaimed = Math.min(stats.passlevel, passRewards[0].length);

                    let file = await getPassImage(stats, currPage - 1);
                    interaction.editReply({ components: [getPassRow(stats)], files: [file] });
                });

            });
        };

    },
};

export default exportCommand;
