import { createCanvas, SKRSContext2D } from '@napi-rs/canvas';
import * as math from 'mathjs';
import { getResponseTimes } from './queries';
import { User } from 'discord.js';

interface GraphOptions {
    width?: number;
    height?: number;
    padding?: number;
    backgroundColor?: string;
    barColor?: string;
    textColor?: string;
    title?: string;
}

export function createResponseGraph(
    distribution: Record<number, number>,
    options: GraphOptions = {}
): Buffer {
    // Default options with clean colors
    const width = options.width ?? 560;
    const height = options.height ?? 420;
    const padding = options.padding ?? 50;
    const backgroundColor = options.backgroundColor ?? '#ffffff';
    const barColor = options.barColor ?? '#1f77b4';
    const textColor = options.textColor ?? '#000000';

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Clean white background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Get data points (now sorted)
    const sortedKeys = Object.keys(distribution)
        .map(Number)
        .sort((a, b) => a - b);
    const values = sortedKeys.map(key => distribution[key]);
    const labels = sortedKeys.map(String);
    const maxValue = Math.max(...values);

    // Calculate scales
    const graphWidth = width - (padding * 2);
    const graphHeight = height - (padding * 2);
    const barWidth = Math.max(1, (graphWidth / labels.length) * 0.8);

    // Draw title
    if (options.title) {
        ctx.fillStyle = textColor;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(options.title, width / 2, padding / 2);
    }

    // Draw axes and grid
    drawAxes(ctx, padding, width, height, graphHeight, maxValue);

    // Draw bars
    ctx.fillStyle = barColor;
    for (let i = 0; i < values.length; i++) {
        const x = padding + (i * (graphWidth / labels.length)) + ((graphWidth / labels.length - barWidth) / 2);
        const barHeight = (values[i] / maxValue) * graphHeight;
        const y = height - padding - barHeight;

        ctx.fillRect(x, y, barWidth, barHeight);
    }

    // Draw labels
    drawLabels(ctx, labels, padding, width, height, graphWidth);

    return canvas.toBuffer('image/png');
}

function drawAxes(
    ctx: SKRSContext2D,
    padding: number,
    width: number,
    height: number,
    graphHeight: number,
    maxValue: number
) {
    // Draw grid lines
    ctx.strokeStyle = '#E5E5E5';
    ctx.lineWidth = 1;

    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
        const y = height - padding - ((i / ySteps) * graphHeight);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = '#333333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';

    for (let i = 0; i <= ySteps; i++) {
        const value = Math.round((maxValue * i) / ySteps);
        const y = height - padding - ((i / ySteps) * graphHeight);
        ctx.fillText(value.toString(), padding - 10, y + 4);
    }
}

function drawLabels(
    ctx: SKRSContext2D,
    labels: string[],
    padding: number,
    width: number,
    height: number,
    graphWidth: number
) {
    ctx.fillStyle = '#333333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    // Show fewer labels to prevent overcrowding
    const maxLabels = 10;
    const labelStep = Math.max(1, Math.ceil(labels.length / maxLabels));

    for (let i = 0; i < labels.length; i += labelStep) {
        const x = padding + (i * (graphWidth / labels.length));
        ctx.fillText(labels[i], x, height - padding + 20);
    }

    // // Axis labels
    // ctx.font = '14px Arial';
    // ctx.fillText('Response Time (ms)', width / 2, height - 10);

    // ctx.save();
    // ctx.translate(15, height / 2);
    // ctx.rotate(-Math.PI / 2);
    // ctx.fillText('Frequency', 0, 0);
    // ctx.restore();
}

export async function getResponseData(user: User | null, flags: string[] = []): Promise<{ reply: string, imageBuffer?: Buffer; } | { reply?: string, imageBuffer: Buffer; }> {
    if (!user) return { reply: "No user provided" };

    const timestamps = await getResponseTimes(user.id, { stampede: flags.includes("stampede") });
    let resp = timestamps.map((e, i) => (timestamps[i + 1]?.getTime() ?? 0) - e.getTime()).slice(0, -2);
    if (flags.some((e) => e.startsWith("range:"))) {
        const [, start, end] = (flags.find((e) => e.startsWith("range:")) ?? "range:0").split(":");
        resp = resp.slice(parseInt(start) || 0, parseInt(end) || undefined);
    };
    if (flags.some((e) => e.startsWith("interval:"))) {
        let [, intervalString, averaged] = (flags.find((e) => e.startsWith("interval:")) ?? "interval:1").split(":");
        let interval = parseInt(intervalString) || 1;
        if (interval < 1) interval = 1;
        const summed = [];
        for (let i = 0; i < resp.length; i += interval) {
            const sum = resp.slice(i, i + interval).reduce((acc, num) => acc + num, 0);
            if (averaged) summed.push(Math.round(sum / interval));
            else summed.push(sum);
        };
        resp = summed;
    };
    const cleaned = resp.filter((e) => e < 120 * 1000);
    if (cleaned.length === 0) return { reply: "not enough data" };
    const rounded = resp.map((e) => Math.round(e / 1000));
    const diff = -(math.mean(...cleaned.slice(-100)));

    if (flags.includes("graph")) {
        const distribution: Record<number, number> = {};
        const ndiff = -(math.mean(resp.filter((e) => e < 20 * 1000).slice(-30000)));
        resp.filter((e) => e < 20 * 1000)
            .map((e) => Math.round((e + ndiff) / 1000))
            .forEach((e) => distribution[e] = distribution[e] + 1 || 1);

        const imageBuffer = createResponseGraph(distribution, {
            title: `Normalized Response Time Distribution (${user.username})`,
        });

        return { imageBuffer };
    } else {
        let minVar = 1 / 0, idx = 0;
        for (let i = 0; i < cleaned.length - 100; i += 10) {
            if (math.variance(cleaned.slice(i, i + 100)) as any < minVar) {
                minVar = math.variance(cleaned.slice(i, i + 100)) as any;
                idx = i;
            };
        };
        let risky = minVar === 1 / 0 ? "" : `\n\n**Highest Risk** (std: ${Math.round(Math.sqrt(minVar) / 10) / 100}s, var: ${Math.round(minVar / 10000) / 100}s²):\n> ` + cleaned.slice(idx, idx + 100).map((e) => Math.round(e / 1000)).join(", ").slice(-(400));

        // Longest seesion
        const sessions = [-rounded[0]];
        const maxBreak = parseInt((flags.find((e) => e.startsWith("session:")) ?? "session:300").split(":")[1]) || 300;
        for (const n of rounded) {
            if (n < maxBreak) sessions[sessions.length - 1] += n;
            else sessions.push(0);
        };

        // Return txt
        const txtFlag = flags.find((e) => e.startsWith("txt"));
        if (txtFlag) {
            const param = txtFlag.split(":")[1];
            if (!param) return { reply: rounded.join(",") };
            if (param === "raw") return { reply: resp.join(",") };
            if (param === "cleaned") return { reply: cleaned.join(",") };
            if (param === "sessions") return { reply: sessions.join(",") };
            if (param === "timestamps") return { reply: timestamps.map((e) => e.getTime()).join(",") };
        };

        const s = `**user**: ${user.username} | ${user.id}\n**sample size**: ${cleaned.length} | ${cleaned.slice(-100).length}\n**mean**: ${Math.round(math.mean(cleaned) / 10) / 100}s | ${Math.round(math.mean(cleaned.slice(-100)) / 10) / 100}s\n**median**: ${Math.round(math.median(cleaned) / 10) / 100}s | ${Math.round(math.median(cleaned.slice(-100)) / 10) / 100}s\n**mode**: ${math.mode(rounded)}s | ${math.mode(rounded.slice(-100))}s\n**std**: ${Math.round(math.std(cleaned) as any / 10) / 100}s | ${Math.round(math.std(cleaned.slice(-100)) as any / 10) / 100}s\n**var**: ${Math.round(math.variance(cleaned) as any / 10000) / 100}s² | ${Math.round(math.variance(cleaned.slice(-100)) as any / 10000) / 100}s²\n**Longest session**: ${Math.floor((Math.max(...sessions) / (60 * 60)) * 100) / 100}h\n\n**Recent Activity**:\n> `;
        return {
            reply: s + rounded.join(", ").slice(-(1400 - risky.length)) + `\n\n**Normalized**:\n> ` + resp.slice(-100).map((e) => Math.round((e + diff) / 1000)).join(", ").slice(-(600 - 20 - s.length)) + risky
        };
        // return interaction.reply({content: s + rounded.join(", ").slice(-(1400-risky.length)) + `\n\n**Normalized**:\n> ` + resp.slice(-100).map((e) => Math.round((e+diff)/1000)).join(", ").slice(-(600-20-s.length)) + risky, ephemeral});
    };
};

