import { AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage, Image } from '@napi-rs/canvas';
import { CompactUserSchema, SlashCommand } from '../types';

const calendarRewards = [
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
    { id: 31, type: "deluxe", amount: 1, itemid: 458 },
];

const loadedImages: Record<string, Image> = {};

function getDaysInCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextMonth = new Date(year, month + 1, 1);
    const lastDayCurrentMonth = new Date(nextMonth.getTime() - 1);

    return lastDayCurrentMonth.getDate();
};

async function getCalendarImage(stats: CompactUserSchema) {
    // Create a canvas
    const canvas = createCanvas(1200, 950);
    const ctx = canvas.getContext('2d');

    // Background
    loadedImages["calendarBg"] ||= await loadImage("https://i.ibb.co/Vm6xX6f/00025-4126393403.png");
    ctx.filter = 'blur(5px)';
    ctx.drawImage(loadedImages["calendarBg"], 0, 0, canvas.width > canvas.height ? canvas.width : canvas.height, canvas.width > canvas.height ? canvas.width : canvas.height);
    ctx.filter = 'none';

    // Header
    {
        const rectWidth = 500;
        const rectHeight = 80;
        const borderRadius = 15;

        const x = (canvas.width - rectWidth) / 2;
        const y = 45;

        ctx.fillStyle = 'rgba(71, 77, 142, 0.5)';
        ctx.beginPath();
        ctx.moveTo(x + borderRadius, y);
        ctx.lineTo(x + rectWidth - borderRadius, y);
        ctx.quadraticCurveTo(x + rectWidth, y, x + rectWidth, y + borderRadius);
        ctx.lineTo(x + rectWidth, y + rectHeight - borderRadius);
        ctx.quadraticCurveTo(x + rectWidth, y + rectHeight, x + rectWidth - borderRadius, y + rectHeight);
        ctx.lineTo(x + borderRadius, y + rectHeight);
        ctx.quadraticCurveTo(x, y + rectHeight, x, y + rectHeight - borderRadius);
        ctx.lineTo(x, y + borderRadius);
        ctx.quadraticCurveTo(x, y, x + borderRadius, y);
        ctx.closePath();

        ctx.fill();

        ctx.fillStyle = '#f7f6f2';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("Daily Log-In Bonus!", canvas.width / 2, y + (rectHeight / 2), rectWidth);
    };

    // Days in current month
    const days = getDaysInCurrentMonth();

    // Draw tiles
    const width = 150, height = 130;
    for (let i = 0; i < days; i++) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        const x = 45 + (((i + 1) % 7) * (width + 10)), y = 220 + (Math.floor((i + 1) / 7) * (height + 10)); // calculate coordinates
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        // ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();

        // Reward Number
        if (stats && i < 9) {
            loadedImages.check ||= await loadImage("https://i.ibb.co/DKDHFYW/img-icons8.png");
            ctx.drawImage(loadedImages.check, x + width - 33, y + 4, 26, 26);
        } else {
            ctx.fillStyle = '#7e0062';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            // @ts-ignore
            ctx.fillText(`${i + 1}`, x + (width + 10) - 15, y + 18, width, height);
        };

        // Reward Icons
        loadedImages["coins"] ||= await loadImage("https://cdn.discordapp.com/emojis/872926669055356939.png");
        loadedImages["gems"] ||= await loadImage("https://cdn.discordapp.com/emojis/1034179687720681492.png");
        loadedImages["sshard"] ||= await loadImage("https://cdn.discordapp.com/emojis/917202925514817566.png");
        loadedImages["ssshard"] ||= await loadImage("https://cdn.discordapp.com/emojis/917203009543503892.png");
        loadedImages["sticket"] ||= await loadImage("https://cdn.discordapp.com/emojis/927642487705722890.png");
        loadedImages["ssticket"] ||= await loadImage("https://cdn.discordapp.com/emojis/927503239396622336.png");
        loadedImages["ex"] ||= await loadImage("https://i.ibb.co/dtc3rLG/ex.png");
        loadedImages["deluxe"] ||= await loadImage("https://cdn.discordapp.com/emojis/1069301259603026061.png");
        ctx.drawImage(loadedImages[calendarRewards[i + (31 - days)].type], x + 30, y + 30, 90, 90);

        // Amount
        ctx.fillStyle = 'rgba(71, 77, 142, 0.5)';
        ctx.fillRect(x, y + 90, width, 40);
        ctx.fillRect(x, y + 90, width, 40);

        ctx.fillStyle = '#f7f6f2';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${calendarRewards[i + (31 - days)].amount}`, x + 75, y + 110, 130);
    };

    // Convert to buffer and upload
    const buffer = canvas.toBuffer('image/jpeg');
    return new AttachmentBuilder(buffer);
};

export const exportCommand: SlashCommand = {
    name: 'calendar',
    async execute({ interaction, author }) {

        const file = await getCalendarImage(author.schema);
        interaction.reply({ files: [file] });

    },
};

export default exportCommand;
