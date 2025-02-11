import { createCanvas, SKRSContext2D } from '@napi-rs/canvas';

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
