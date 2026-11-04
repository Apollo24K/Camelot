import { AttachmentBuilder } from 'discord.js';
import { createCanvas, loadImage, Image, SKRSContext2D } from '@napi-rs/canvas';

const backgroundUrl = "https://i.ibb.co/Vm6xX6f/00025-4126393403.png";

export type CalendarRewardType = "coins" | "gems" | "ssshard" | "sshard" | "ssticket" | "sticket" | "ex" | "deluxe";

export interface CalendarReward {
    type: CalendarRewardType;
    amount: number;
    itemid?: number;
};

const rewardIcons: Record<CalendarRewardType, string> = {
    coins: "https://cdn.discordapp.com/emojis/872926669055356939.png",
    gems: "https://cdn.discordapp.com/emojis/1034179687720681492.png",
    sshard: "https://cdn.discordapp.com/emojis/917202925514817566.png",
    ssshard: "https://cdn.discordapp.com/emojis/917203009543503892.png",
    ssticket: "https://cdn.discordapp.com/emojis/927503239396622336.png",
    sticket: "https://cdn.discordapp.com/emojis/927642487705722890.png",
    ex: "https://i.ibb.co/dtc3rLG/ex.png",
    deluxe: "https://cdn.discordapp.com/emojis/1069301259603026061.png",
};

// Index 0 is the reward for the 1st of the month. EX pulls land on the 7th, 14th, 21st and 28th,
// matching {@link isExPullDay}; the final day of a 31 day month is a Deluxe Chest.
export const calendarRewards: CalendarReward[] = [
    { type: "coins", amount: 2000 },            // 1
    { type: "sshard", amount: 4 },              // 2
    { type: "sticket", amount: 1 },             // 3
    { type: "coins", amount: 2100 },            // 4
    { type: "ssticket", amount: 1 },            // 5
    { type: "ssshard", amount: 2 },             // 6
    { type: "ex", amount: 1 },                  // 7
    { type: "coins", amount: 2200 },            // 8
    { type: "sticket", amount: 1 },             // 9
    { type: "sshard", amount: 4 },              // 10
    { type: "ssticket", amount: 1 },            // 11
    { type: "gems", amount: 10 },               // 12
    { type: "coins", amount: 2250 },            // 13
    { type: "ex", amount: 1 },                  // 14
    { type: "ssshard", amount: 2 },             // 15
    { type: "sticket", amount: 2 },             // 16
    { type: "coins", amount: 2500 },            // 17
    { type: "sshard", amount: 6 },              // 18
    { type: "ssticket", amount: 1 },            // 19
    { type: "ssshard", amount: 3 },             // 20
    { type: "ex", amount: 1 },                  // 21
    { type: "coins", amount: 2600 },            // 22
    { type: "sticket", amount: 2 },             // 23
    { type: "gems", amount: 10 },               // 24
    { type: "ssticket", amount: 1 },            // 25
    { type: "sshard", amount: 6 },              // 26
    { type: "coins", amount: 3000 },            // 27
    { type: "ex", amount: 1 },                  // 28
    { type: "ssshard", amount: 3 },             // 29
    { type: "sticket", amount: 2 },             // 30
    { type: "deluxe", amount: 1, itemid: 458 }, // 31
];

/** The reward shown and granted for a given day of the month (1-indexed, clamped to the schedule). */
export function getCalendarReward(day: number): CalendarReward {
    const index = Math.min(Math.max(day, 1), calendarRewards.length) - 1;
    return calendarRewards[index];
};

const loadedImages: Record<string, Image> = {};

// The EX pull lands on the 7th, 14th, 21st and 28th tiles of the monthly calendar.
export function isExPullDay(date: Date): boolean {
    return date.getDate() % 7 === 0;
};

function getDaysInCurrentMonth(now: Date) {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextMonth = new Date(year, month + 1, 1);
    const lastDayCurrentMonth = new Date(nextMonth.getTime() - 1);

    return lastDayCurrentMonth.getDate();
};

async function getBackground() {
    loadedImages.background ||= await loadImage(backgroundUrl);
    return loadedImages.background;
};

async function getRewardIcon(type: CalendarRewardType) {
    loadedImages[type] ||= await loadImage(rewardIcons[type]);
    return loadedImages[type];
};

export async function preloadCalendarImages(): Promise<void> {
    await Promise.all([
        getBackground(),
        ...(Object.keys(rewardIcons) as CalendarRewardType[]).map((type) => getRewardIcon(type)),
    ]);
};

function drawRoundedRect(ctx: SKRSContext2D, x: number, y: number, width: number, height: number, borderRadius: number) {
    ctx.beginPath();
    ctx.moveTo(x + borderRadius, y);
    ctx.lineTo(x + width - borderRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
    ctx.lineTo(x + width, y + height - borderRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - borderRadius, y + height);
    ctx.lineTo(x + borderRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - borderRadius);
    ctx.lineTo(x, y + borderRadius);
    ctx.quadraticCurveTo(x, y, x + borderRadius, y);
    ctx.closePath();
    ctx.fill();
};

// The rendered calendar is identical for every player on a given day, so cache it by local date.
let calendarCache: { key: string; buffer: Buffer; } | null = null;

function calendarCacheKey(now: Date) {
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
};

async function renderCalendar(now: Date): Promise<Buffer> {
    const canvas = createCanvas(1200, 950);
    const ctx = canvas.getContext('2d');

    const background = await getBackground();
    ctx.filter = 'blur(5px)';
    ctx.drawImage(background, 0, 0, canvas.width > canvas.height ? canvas.width : canvas.height, canvas.width > canvas.height ? canvas.width : canvas.height);
    ctx.filter = 'none';

    // Header
    {
        const rectWidth = 560;
        const rectHeight = 80;
        const borderRadius = 15;

        const x = (canvas.width - rectWidth) / 2;
        const y = 45;

        ctx.fillStyle = 'rgba(71, 77, 142, 0.5)';
        drawRoundedRect(ctx, x, y, rectWidth, rectHeight, borderRadius);

        ctx.fillStyle = '#f7f6f2';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("Daily Log-In Bonus!", canvas.width / 2, y + (rectHeight / 2), rectWidth);
    };

    const days = getDaysInCurrentMonth(now);
    const today = now.getDate();

    // 7 tiles per row; with a 150px tile + 10px gap, a 31 day month uses 5 rows (bottom ~910px), fitting the 950px canvas.
    const width = 150, height = 130;
    for (let day = 1; day <= days; day++) {
        const x = 45 + (((day - 1) % 7) * (width + 10)), y = 220 + (Math.floor((day - 1) / 7) * (height + 10));
        const reward = getCalendarReward(day);
        const isEx = reward.type === "ex";
        const isToday = day === today;

        // EX days get a subtle blue-purple tint and accent border; every other tile stays light.
        ctx.fillStyle = isEx ? 'rgba(71, 77, 142, 0.55)' : 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = isToday ? '#f7f6f2' : isEx ? '#a78bfa' : 'rgba(71, 77, 142, 0.35)';
        ctx.lineWidth = isToday ? 5 : isEx ? 3 : 2;
        ctx.strokeRect(x, y, width, height);

        // Day Number
        ctx.fillStyle = isEx ? '#f7f6f2' : '#7e0062';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`${day}`, x + 8, y + 6);

        // Reward Icon
        const icon = await getRewardIcon(reward.type);
        ctx.drawImage(icon, x + 43, y + 18, 64, 64);

        // Amount
        ctx.fillStyle = 'rgba(71, 77, 142, 0.75)';
        ctx.fillRect(x, y + 90, width, 40);

        ctx.fillStyle = '#f7f6f2';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${reward.amount}`, x + (width / 2), y + 110, width);
    };

    return canvas.toBuffer('image/jpeg');
};

export async function getCalendarImage(now: Date = new Date()) {
    const key = calendarCacheKey(now);
    if (calendarCache?.key !== key) {
        calendarCache = { key, buffer: await renderCalendar(now) };
    };

    return new AttachmentBuilder(calendarCache.buffer, { name: "calendar.jpg" });
};
