import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, AttachmentBuilder, ComponentType, ButtonStyle, User } from "discord.js";
import { createCanvas, loadImage, SKRSContext2D, Image } from '@napi-rs/canvas';
import WorkerPool from '../Modules/workerPool';
import charInfo, { characters, auniq, charactersF, charactersM, charactersSS, charactersS, charactersA, charactersB, charactersC, charactersD } from "../Modules/chars";
import { skins } from "../Modules/skins";
import { userLevel, getClassLvl, getDetailedStats, lastActive } from "../Modules/functions";
import { classes } from "../Modules/classes";
import { achievements } from "../Modules/achievements";
import { items } from "../Modules/items";
import { Asset } from "../Modules/assets";
import { CompactUserSchema, ProfileImageArguments, SlashCommand } from '../types';
import { getGuildSchema, getPartySchema, getUserSchema, insertNewWeapon, updateUsers } from '../Modules/queries';
import { botPfp, profileColors } from '../Modules/components';
import path from 'path';

const workerPath = path.join(__dirname, '../Modules/profileWorker.js');
const workerPool = new WorkerPool(workerPath);

const loadedImages: { [key: string]: Image; } = {};

function padCollected(chars: charInfo[]) {
    let collSS = chars.filter((e) => e.rarity === "SS").length;
    let collS = chars.filter((e) => e.rarity === "S").length;
    let collA = chars.filter((e) => e.rarity === "A").length;
    let collB = chars.filter((e) => e.rarity === "B").length;
    let collC = chars.filter((e) => e.rarity === "C").length;
    let collD = chars.filter((e) => e.rarity === "D").length;

    let res = []; // SS, A, C, S, B, D
    let len = Math.max(`${collSS}/${charactersSS.length}`.length, `${collA}/${charactersA.length}`.length, `${collC}/${charactersC.length}`.length);
    res.push(`\`${collSS}/${charactersSS.length}` + " ".repeat(len - `${collSS}/${charactersSS.length}`.length) + "`");
    res.push(`\`${collA}/${charactersA.length}` + " ".repeat(len - `${collA}/${charactersA.length}`.length) + "`");
    res.push(`\`${collC}/${charactersC.length}` + " ".repeat(len - `${collC}/${charactersC.length}`.length) + "`");
    len = Math.max(`${collS}/${charactersS.length}`.length, `${collB}/${charactersB.length}`.length, `${collD}/${charactersD.length}`.length);
    res.push(`\`${collS}/${charactersS.length}` + " ".repeat(len - `${collS}/${charactersS.length}`.length) + "`");
    res.push(`\`${collB}/${charactersB.length}` + " ".repeat(len - `${collB}/${charactersB.length}`.length) + "`");
    res.push(`\`${collD}/${charactersD.length}` + " ".repeat(len - `${collD}/${charactersD.length}`.length) + "`");
    return res;
};

function drawField(ctx: SKRSContext2D, x: number, y: number, width: number, height: number, radius: number = height / 2) {
    ctx.beginPath();
    ctx.moveTo(radius + x, 0 + y);
    ctx.lineTo((width - radius) + x, 0 + y);
    ctx.arcTo(width + x, 0 + y, width + x, radius + y, radius);
    ctx.lineTo(width + x, (height - radius) + y);
    ctx.arcTo(width + x, height + y, (width - radius) + x, height + y, radius);
    ctx.lineTo(radius + x, height + y);
    ctx.arcTo(0 + x, height + y, 0 + x, (height - radius) + y, radius);
    ctx.lineTo(0 + x, radius + y);
    ctx.arcTo(0 + x, 0 + y, radius + x, 0 + y, radius);
    ctx.closePath();
    ctx.fillStyle = 'rgba(22,23,25,255)';
    ctx.fill();
};

function wrapText(context: SKRSContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y, maxWidth);
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y, maxWidth);
};

async function getOldProfileImage(user: User, stats: CompactUserSchema, profileArguments: ProfileImageArguments) {
    const width = 1200;
    const height = 700;
    const res = { "high": 1, "medium": 0.6666, "low": 0.5 }[profileArguments.quality || "medium"] ?? 0.6666;

    // Create a canvas
    const canvas = createCanvas(1200, 700);
    const ctx = canvas.getContext('2d');

    // Draw Background
    ctx.fillStyle = 'rgba(43,45,49,255)';
    ctx.fillRect(0, 0, 1200, 700);

    // Draw Profile Section
    const gradient = ctx.createLinearGradient(250, 100, 500, 0);
    gradient.addColorStop(0, profileArguments.colorLight); // Light
    gradient.addColorStop(1, profileArguments.colorDark); // Dark
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 100);

    // Draw Character Image
    const charImage = await new Asset({ path: profileArguments.thumbnail || "Images/error/missing-char.png", url: profileArguments.thumbnail || "https://i.ibb.co/284MfK6/missing-char.png", fallback: new Asset({ path: "Images/error/loading.png", url: "https://i.ibb.co/fG5ghJx/loading.png" }) }).loadImage();
    ctx.drawImage(charImage, 750, 0, 450, 700);

    // Draw Triangular Shade
    ctx.beginPath();
    ctx.moveTo(0, 700);
    ctx.lineTo(1200, 700);
    ctx.lineTo(1200, 350);
    ctx.lineTo(0, 700);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();

    // Profile Desc
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const text = stats.aboutme || "About Me";
    wrapText(ctx, text, 975, 580 - (15 * (Math.floor(text.length / 20))) + (text.length > 60 ? 20 : 0), 410, 30);

    // Draw Profile Picture
    const profilePicture = await new Asset({ path: "", url: profileArguments.profilePicture }).loadImage();
    ctx.save();
    ctx.beginPath();
    ctx.arc(100 + 10, 100, 90, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(profilePicture, 10 + 10, 10, 180, 180);
    ctx.restore();

    // Draw Username
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'start';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${user.username}`, 210, 75, 370);

    // Draw Premium
    if (stats.premium) {
        const premiumImage = await new Asset({ path: "", url: "https://i.ibb.co/MnhrQ3S/premium.png" }).loadImage();
        ctx.drawImage(premiumImage, 20, 140, 50, 50);
    };

    // XP Bar
    let xpr = stats.xp, level = 0;
    for (let i = 1; xpr >= 0; i++) {
        xpr -= Math.floor(5 * Math.log(i) ** 4 + 30);
        level++;
    };
    const xpTotal = Math.floor(5 * Math.log(level) * Math.log(level) * Math.log(level) * Math.log(level) + 30);
    const percent = (xpTotal + xpr) / xpTotal;

    ctx.fillStyle = 'rgb(210, 0, 0)';
    ctx.fillRect(270, 40, 355, 10);
    ctx.fillStyle = 'rgb(0, 240, 0)';
    ctx.fillRect(270, 40, Math.floor(355 * percent), 10);

    // Draw Level
    const barWidth = 160;
    const barHeight = 40;
    const cornerRadius = barHeight / 2; // Adjust this for more or less rounding

    let movX = 120 + 10;
    let movY = 10;

    ctx.beginPath();
    ctx.moveTo(cornerRadius + movX, 0 + movY);
    ctx.lineTo((barWidth - cornerRadius) + movX, 0 + movY);
    ctx.arcTo(barWidth + movX, 0 + movY, barWidth + movX, cornerRadius + movY, cornerRadius);
    ctx.lineTo(barWidth + movX, (barHeight - cornerRadius) + movY);
    ctx.arcTo(barWidth + movX, barHeight + movY, (barWidth - cornerRadius) + movX, barHeight + movY, cornerRadius);
    ctx.lineTo(cornerRadius + movX, barHeight + movY);
    ctx.arcTo(0 + movX, barHeight + movY, 0 + movX, (barHeight - cornerRadius) + movY, cornerRadius);
    ctx.lineTo(0 + movX, cornerRadius + movY);
    ctx.arcTo(0 + movX, 0 + movY, cornerRadius + movX, 0 + movY, cornerRadius);
    ctx.closePath();
    ctx.fillStyle = 'rgba(22,23,25,255)';
    ctx.fill();

    // Draw Level Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'start';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Level ${userLevel(stats.xp)}`, 145, 30, 130);

    // Draw Dungeon Floor
    ctx.beginPath();
    ctx.arc(660, 100, 70, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = 'rgba(22,23,25,255)';
    ctx.fill();

    // Draw Dungeon Floor Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Floor`, 660, 75, 100);
    ctx.fillStyle = profileArguments.colorLight;
    ctx.font = '50px Arial';
    ctx.fillText(`${profileArguments.floor}`, 660, 120, 100);

    // Draw Class
    if (stats.class !== null) {
        const classImage = await new Asset({ path: "", url: classes[stats.class].image }).loadImage();
        ctx.drawImage(classImage, 600, 540, 150, 150);

        // Draw Class Level Text
        ctx.fillStyle = '#ffffff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'end';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Level ${getClassLvl(stats.class, stats.dungeon_classlevels) || 0}`, 600, 610, 130);
        ctx.fillStyle = ['#ddd0c0', '#d46600', '#8fd3e2', '#ffe036', '#00546a'][classes[stats.class].tier];
        ctx.font = '50px Arial';
        ctx.fillText(classes[stats.class].name, 600, 655, 300);
    } else {
        // Draw Missing Class
        ctx.fillStyle = '#ddd0c0';
        ctx.font = '50px Arial';
        ctx.textAlign = 'end';
        ctx.textBaseline = 'middle';
        ctx.fillText("No Class", 730, 655, 300);
    };

    // Draw Refinement
    if (profileArguments.ref) {
        const refImage = await new Asset({ path: "", url: "https://cdn.discordapp.com/emojis/869132309125824552.png" }).loadImage();
        if (profileArguments.ref === 1 || profileArguments.ref === 3 || profileArguments.ref >= 5) ctx.drawImage(refImage, 975 - 25, 645, 50, 50);
        if (profileArguments.ref === 2 || profileArguments.ref === 4) ctx.drawImage(refImage, 975 - 50, 645, 50, 50), ctx.drawImage(refImage, 975, 645, 50, 50);
        if (profileArguments.ref === 3 || profileArguments.ref >= 5) ctx.drawImage(refImage, 975 - 25 - 50, 645, 50, 50), ctx.drawImage(refImage, 975 - 25 + 50, 645, 50, 50);
        if (profileArguments.ref === 4) ctx.drawImage(refImage, 975 - 50 - 50, 645, 50, 50), ctx.drawImage(refImage, 975 + 50, 645, 50, 50);
        if (profileArguments.ref >= 5) ctx.drawImage(refImage, 975 - 25 - 50 - 50, 645, 50, 50), ctx.drawImage(refImage, 975 - 25 + 50 + 50, 645, 50, 50);
    };

    // Draw Coins & Gems
    const coinsImage = await new Asset({ path: "Images/emojis/coins.png", url: "https://cdn.discordapp.com/emojis/1030580480782893197.png" }).loadImage();
    const gemsImage = await new Asset({ path: "Images/emojis/gems.png", url: "https://cdn.discordapp.com/emojis/1034179687720681492.png" }).loadImage();
    ctx.drawImage(coinsImage, 210, 120, 50, 50);
    ctx.drawImage(gemsImage, 420, 120, 50, 50);
    drawField(ctx, 270, 125, 145, 40);
    drawField(ctx, 475, 125, 110, 40);

    // Draw Coins & Gems Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'start';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${stats.coins}`, 280, 145, 125);
    ctx.fillText(`${stats.gems}`, 485, 145, 90);

    // Draw Guild & Party
    drawField(ctx, 20, 200, 112, 40); // Guild
    drawField(ctx, 142, 200, 229, 40); // Guild Name
    drawField(ctx, 381, 200, 110, 40); // Party
    drawField(ctx, 501, 200, 229, 40); // Party Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'start';
    ctx.textBaseline = 'middle';
    ctx.fillText("Guild", 40, 220, 92);
    ctx.fillText("Party", 401, 220, 90);
    ctx.fillText(profileArguments.guild || "None", 157, 220, 199);
    ctx.fillText(profileArguments.party || "None", 516, 220, 199);

    // Draw Stats
    let moveDown = 10;
    // Row 1
    loadedImages.hp ||= await loadImage("https://cdn.discordapp.com/emojis/1062043800979116143.png");
    loadedImages.atk ||= await loadImage("https://cdn.discordapp.com/emojis/1063214925528440832.png");
    loadedImages.def ||= await loadImage("https://cdn.discordapp.com/emojis/1047269141662417037.png");
    ctx.drawImage(loadedImages.hp, 30, 260 + moveDown, 40, 40);
    ctx.drawImage(loadedImages.atk, 267, 260 + moveDown, 40, 40);
    ctx.drawImage(loadedImages.def, 504, 260 + moveDown, 40, 40);
    drawField(ctx, 81, 260 + moveDown, 175, 40);
    drawField(ctx, 318, 260 + moveDown, 175, 40);
    drawField(ctx, 555, 260 + moveDown, 175, 40);
    // Row 2
    loadedImages.shield ||= await loadImage("https://cdn.discordapp.com/emojis/1062050038211166310.png");
    loadedImages.md ||= await loadImage("https://cdn.discordapp.com/emojis/948568336621527040.png");
    loadedImages.mr ||= await loadImage("https://cdn.discordapp.com/emojis/1047269149237334086.png");
    ctx.drawImage(loadedImages.shield, 30, 310 + moveDown, 40, 40);
    ctx.drawImage(loadedImages.md, 267, 310 + moveDown, 40, 40);
    ctx.drawImage(loadedImages.mr, 504, 310 + moveDown, 40, 40);
    drawField(ctx, 81, 310 + moveDown, 175, 40);
    drawField(ctx, 318, 310 + moveDown, 175, 40);
    drawField(ctx, 555, 310 + moveDown, 175, 40);
    // Row 3
    loadedImages.mana ||= await loadImage("https://cdn.discordapp.com/emojis/1047269152957661255.png");
    loadedImages.cr ||= await loadImage("https://cdn.discordapp.com/emojis/1047269144195776512.png");
    loadedImages.dodge ||= await loadImage("https://cdn.discordapp.com/emojis/1047269150948606063.png");
    ctx.drawImage(loadedImages.mana, 30, 360 + moveDown, 40, 40);
    ctx.drawImage(loadedImages.cr, 267, 360 + moveDown, 40, 40);
    ctx.drawImage(loadedImages.dodge, 504, 360 + moveDown, 40, 40);
    drawField(ctx, 81, 360 + moveDown, 175, 40);
    drawField(ctx, 318, 360 + moveDown, 175, 40);
    drawField(ctx, 555, 360 + moveDown, 175, 40);
    // Row 3
    loadedImages.mg ||= await loadImage("https://cdn.discordapp.com/emojis/1063215562349629570.png");
    loadedImages.cd ||= await loadImage("https://cdn.discordapp.com/emojis/1047269146511016046.png");
    ctx.drawImage(loadedImages.mg, 30, 410 + moveDown, 40, 40);
    ctx.drawImage(loadedImages.cd, 267, 410 + moveDown, 40, 40);
    ctx.drawImage(loadedImages.def, 504, 410 + moveDown, 40, 40);
    drawField(ctx, 81, 410 + moveDown, 175, 40);
    drawField(ctx, 318, 410 + moveDown, 175, 40);
    drawField(ctx, 555, 410 + moveDown, 175, 40);
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'start';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${profileArguments.stats.hp}`, 91, 280 + moveDown, 155);
    ctx.fillText(`${profileArguments.stats.atk}`, 328, 280 + moveDown, 155);
    ctx.fillText(`${profileArguments.stats.def}`, 565, 280 + moveDown, 155);
    ctx.fillText(`${profileArguments.stats.shield}`, 91, 330 + moveDown, 155);
    ctx.fillText(`${profileArguments.stats.md}`, 328, 330 + moveDown, 155);
    ctx.fillText(`${profileArguments.stats.mr}`, 565, 330 + moveDown, 155);
    ctx.fillText(`${profileArguments.stats.mana}`, 91, 380 + moveDown, 155);
    ctx.fillText(`${Math.floor(100 * profileArguments.stats.cr)}%`, 328, 380 + moveDown, 155);
    ctx.fillText(`${Math.floor(100 * profileArguments.stats.dodge)}%`, 565, 380 + moveDown, 155);
    ctx.fillText(`${profileArguments.stats.mg}`, 91, 430 + moveDown, 155);
    ctx.fillText(`${Math.floor(100 * profileArguments.stats.cd)}%`, 328, 430 + moveDown, 155);
    ctx.fillText(`${Math.floor(100 * profileArguments.stats.br)}%`, 565, 430 + moveDown, 155);

    // Draw Achievements & EP
    loadedImages.achvm ||= await loadImage("https://cdn.discordapp.com/emojis/642715902550212608.png");
    ctx.drawImage(loadedImages.achvm, 30, 490, 40, 40);
    drawField(ctx, 81, 490, 155, 40); // Achievement
    drawField(ctx, 247, 490, 80, 40); // EP
    drawField(ctx, 338, 490, 155, 40); // EP Value

    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'start';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${stats.achievements.length}/${achievements.length}`, 91, 510, 135);
    ctx.fillText("EP", 267, 510, 60);
    ctx.fillText(`${profileArguments.stats.ep}`, 348, 510, 135);

    // Character
    // drawField(ctx, 20, 560, 100, 40); // Hero
    // drawField(ctx, 130, 560, 160, 40); // Character Name
    // ctx.fillStyle = '#ffffff';
    // ctx.font = '30px Arial';
    // ctx.textAlign = 'start';
    // ctx.textBaseline = 'middle';
    // ctx.fillText("Hero", 35, 580, 92);

    // ctx.drawImage(loadedImages["s"+stats.stats.shieldid], 70, 560, 40, 40);

    // Gear Test
    loadedImages["w" + profileArguments.stats.weapon] ||= await loadImage(items[profileArguments.stats.weapon]?.image || "https://cdn.discordapp.com/emojis/1034502134474997790.png");
    loadedImages["h" + profileArguments.stats.helmet] ||= await loadImage(items[profileArguments.stats.helmet]?.image || "https://cdn.discordapp.com/emojis/1034499888878198885.png");
    loadedImages["c" + profileArguments.stats.cuirass] ||= await loadImage(items[profileArguments.stats.cuirass]?.image || "https://cdn.discordapp.com/emojis/1034499890165858305.png");
    loadedImages["g" + profileArguments.stats.gloves] ||= await loadImage(items[profileArguments.stats.gloves]?.image || "https://cdn.discordapp.com/emojis/1034499892409794570.png");
    loadedImages["b" + profileArguments.stats.boots] ||= await loadImage(items[profileArguments.stats.boots]?.image || "https://cdn.discordapp.com/emojis/1034499893919764480.png");
    ctx.drawImage(loadedImages["w" + profileArguments.stats.weapon], 30, 560, 40, 40);
    if ("shieldid" in profileArguments.stats) {
        loadedImages["s" + profileArguments.stats.shieldid] ||= await loadImage(items[profileArguments.stats.shieldid]?.image || "https://cdn.discordapp.com/emojis/1087089686809415730.png");
        ctx.drawImage(loadedImages["s" + profileArguments.stats.shieldid], 70, 560, 40, 40);
        ctx.drawImage(loadedImages["h" + profileArguments.stats.helmet], 120, 560, 40, 40);
        ctx.drawImage(loadedImages["c" + profileArguments.stats.cuirass], 160, 560, 40, 40);
        ctx.drawImage(loadedImages["g" + profileArguments.stats.gloves], 200, 560, 40, 40);
        ctx.drawImage(loadedImages["b" + profileArguments.stats.boots], 240, 560, 40, 40);
    } else {
        ctx.drawImage(loadedImages["h" + profileArguments.stats.helmet], 80, 560, 40, 40);
        ctx.drawImage(loadedImages["c" + profileArguments.stats.cuirass], 120, 560, 40, 40);
        ctx.drawImage(loadedImages["g" + profileArguments.stats.gloves], 160, 560, 40, 40);
        ctx.drawImage(loadedImages["b" + profileArguments.stats.boots], 200, 560, 40, 40);
    };

    // Items
    loadedImages.rune ||= await loadImage("https://cdn.discordapp.com/emojis/1034507494539669635.png");
    loadedImages.ring ||= await loadImage("https://cdn.discordapp.com/emojis/1034509903886299136.png");
    loadedImages.lock ||= await loadImage("https://cdn.discordapp.com/emojis/1034511902417621002.png");
    ctx.drawImage(loadedImages.rune, 30, 600, 40, 40);
    ctx.drawImage(loadedImages.ring, 80, 600, 40, 40);
    ctx.drawImage(loadedImages.lock, 120, 600, 40, 40);
    // ctx.drawImage(loadedImages.lock, 160, 600, 40, 40);


    // Function to resize canvas
    function resizeCanvas(scale: number) {
        // Create a temporary canvas
        const tempCanvas = createCanvas(canvas.width, canvas.height);
        tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

        // Resize the original canvas

        canvas.width = width * scale;
        canvas.height = height * scale;


        // Redraw the content from the temporary canvas back onto the original canvas
        ctx.drawImage(tempCanvas, 0, 0, width * scale, height * scale);
    };

    // Usage
    if (res !== 1) resizeCanvas(res);


    // Convert to buffer and upload
    const buffer = canvas.toBuffer('image/jpeg');
    return new AttachmentBuilder(buffer);
};

export const getProfileImage = async (user: User, stats: CompactUserSchema, profileArguments: ProfileImageArguments) => {
    try {
        const result = await workerPool.runTask({ user, stats, profileArguments });
        const imgBuffer = Buffer.from(result.image, 'base64');
        return new AttachmentBuilder(imgBuffer, { name: `profile.${result.format}` });
    } catch (error: any) {
        throw new Error(`Failed to generate profile image: ${error.message}`);
    };
};

const exportCommand: SlashCommand = {
    name: 'profile',
    async execute({ interaction, author }) {

        const user = interaction.options.getUser('user') ?? interaction.user;
        const type = interaction.options.getString('type') ?? "image";
        const quality = interaction.options.getString('quality');
        const forceStatic = interaction.options.getBoolean('force-static') ?? false;

        const color = interaction.options.getString('color');
        const customColor1 = interaction.options.getString('custom-color-1');
        const customColor2 = interaction.options.getString('custom-color-2');

        const bio = interaction.options.getString('bio');
        if (bio && bio.length > 100) return interaction.reply(`Your about me can contain a maximum of 100 characters (current length: ${bio.length})`);

        await interaction.deferReply().catch(() => {
            return console.log(`ERROR Interaction Failed 'deferReply()', command: "${interaction.commandName}"`);
        });

        // Set Bio
        if (bio && user.id === interaction.user.id) await updateUsers(interaction.user.id, { aboutme: { type: "set", value: bio } });
        else if (bio) return interaction.editReply("You can only edit your own bio");

        // Set Color
        if (color && user.id === interaction.user.id) await updateUsers(interaction.user.id, { profilecolor: { type: "set", value: color === "null" ? null : color } });

        // Get User Schema
        const stats = user.id === interaction.user.id ? author.schema : await getUserSchema(user.id);
        if (!stats) return interaction.editReply(user.id === interaction.user.id ? "You don't have any characters" : `${user.username} has no characters`);
        if (!stats.chars.length) return interaction.editReply(user.id === interaction.user.id ? "You don't have any characters" : `${user.username} has no characters`);
        if (!stats.battlechar) return interaction.editReply("You don't have a battle character selected. Please use `/select` first");
        if (color) stats.profilecolor = color === "null" ? null : color;

        // Set Custom Color
        if (customColor1 || customColor2) {
            if (user.id !== interaction.user.id) return interaction.editReply("You can only edit your own profile color");
            if (stats.premium < 2) return interaction.editReply("This is a `/premium` feature. If you like the bot and want to help us out we'd appreciate your support <:RaphiSmile:868998036645380197>");
            if (customColor1 && !customColor1.match(/^#([0-9a-f]{3}){1,2}$/i)) return interaction.editReply(`Please use a valid hex color code.\nExamples: \`#112358\`, \`#bbffff\`, \`#abc\``);
            if (customColor2 && !customColor2.match(/^#([0-9a-f]{3}){1,2}$/i)) return interaction.editReply(`Please use a valid hex color code.\nExamples: \`#112358\`, \`#bbffff\`, \`#abc\``);
            stats.profilecolor = (customColor1 || stats.profilecolor?.split(":")?.[0] || "") + ":" + (customColor2 || stats.profilecolor?.split(":")?.[1] || "");

            // Update users table
            await updateUsers(interaction.user.id, {
                profilecolor: { type: "set", value: stats.profilecolor }
            });
        };

        const chars = [...new Set(stats.chars)].map((e) => characters[e]);

        // Anime Completed
        let aniCompleted = 0;
        for (let i = 0; i < auniq.length; i++) {
            let animeCheck = characters.filter((e) => e.anime === auniq[i]).length;
            let invCheck = chars.filter((e) => e.anime === auniq[i]).length;
            if (animeCheck === invCheck) aniCompleted++;
        };

        // Floor
        if (stats.dungeon_floors[Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]] >= 20 && parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]) !== 100) stats.dungeon_floors[1 + parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1])] = 0;
        if (stats.dungeon_floors[Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]] >= 1 && parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]) % 5 == 0 && parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]) !== 100) stats.dungeon_floors[1 + parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1])] = 0;

        // Guild & Party
        const guild = stats.guild ? await getGuildSchema(stats.guild) : undefined;
        const party = stats.party ? await getPartySchema(stats.party) : undefined;

        // Get Detailed Stats
        const detailedStats = await getDetailedStats(stats.battlechar, stats, stats.dungeon_classlevels);

        // Profile Arguments
        const profileArguments: ProfileImageArguments = {
            profilecolor: stats.profilecolor || color,
            quality: quality,
            forceStatic: forceStatic,
            thumbnail: stats.favchar === null ? undefined : characters[stats.favchar].getImage(stats.premium, stats.custom_skins[stats.favchar], stats.char_skin[stats.favchar], true),

            stats: detailedStats,
            ref: stats.char_ref[stats.battlechar],
            classlevels: stats.dungeon_classlevels,
            floor: parseInt(Object.keys(stats.dungeon_floors)[Object.keys(stats.dungeon_floors).length - 1]),

            guild: guild?.name,
            party: party?.name,

            colorLight: stats.premium > 1 && stats.profilecolor?.includes(":") ? (stats.profilecolor.split(":")[0] || (['#ffffff', '#d46600', '#8fd3e2', '#ffe036', '#00546a'][classes[stats.class ?? "-1"]?.tier] || '#ffffff')) : (stats.profilecolor && !stats.profilecolor.includes(":") ? profileColors[stats.profilecolor as keyof typeof profileColors][0] : (['#ffffff', '#d46600', '#8fd3e2', '#ffe036', '#00546a'][classes[stats.class ?? "-1"]?.tier] || '#ffffff')),
            colorDark: stats.premium > 1 && stats.profilecolor?.includes(":") ? (stats.profilecolor.split(":")[1] || (['#ddd0c0', '#c63a17', '#4c9fea', '#ffa114', '#1b3d68'][classes[stats.class ?? "-1"]?.tier] || '#ddd0c0')) : (stats.profilecolor && !stats.profilecolor.includes(":") ? profileColors[stats.profilecolor as keyof typeof profileColors][1] : (['#ddd0c0', '#c63a17', '#4c9fea', '#ffa114', '#1b3d68'][classes[stats.class ?? "-1"]?.tier] || '#ddd0c0')),

            profilePicture: user.displayAvatarURL(),
            classImage: stats.class === null ? undefined : classes[stats.class].image,
            className: stats.class === null ? undefined : classes[stats.class].name,
            classLevel: stats.class === null ? undefined : (getClassLvl(stats.class, stats.dungeon_classlevels) || 0),
            userLvl: userLevel(stats.xp),
            lastActive: lastActive(stats.lastdaily || stats.created),
            weaponImage: items[detailedStats.weapon]?.image,
            shieldImage: items[detailedStats.shieldid]?.image,
            helmetImage: items[detailedStats.helmet]?.image,
            cuirassImage: items[detailedStats.cuirass]?.image,
            glovesImage: items[detailedStats.gloves]?.image,
            bootsImage: items[detailedStats.boots]?.image,
        };

        // Create Image or Embed
        let Embed, img;
        if (type === "image") img = await getProfileImage(user, stats, profileArguments);
        else if (type === "image-old") img = await getOldProfileImage(user, stats, profileArguments);
        else {
            let padded = padCollected(chars);
            Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setThumbnail(profileArguments.thumbnail ?? botPfp)
                .setAuthor({ name: `${user.username}'s profile${stats.premium ? " 💎" : ""}`, iconURL: user.displayAvatarURL({ size: 512 }) })
                .setDescription(
                    `**Level**: \`${userLevel(stats.xp)}\`ㅤ**Coins**: \`${stats.coins}\`<:coins:872926669055356939>ㅤ**Gems**: \`${stats.gems}\`<:genesis_gems:1034179687720681492>\n` +
                    `**Dungeon**: \`Floor ${Math.min(profileArguments.floor, 100)}/${profileArguments.floor <= 100 ? 0 : Math.min(profileArguments.floor - 100, 100)}/${Math.max(profileArguments.floor - 200, 0)}\`ㅤ**Arena**: \`${stats.arenawins} wins\`, \`${stats.arenalosses} losses\`\n` +
                    `**Guild**: \`${guild?.name || "None"}\`ㅤ**Party**: \`${party?.name || "None"}\`\n` +
                    `**Anime Completed**: \`${aniCompleted}/${auniq.length}\`\n` +
                    `**Achievements**: \`${stats.achievements.length}/${achievements.length}\`\n` + "\n" +

                    `**Characters**: __\`${chars.length}/${characters.length}\`__ (__\`${chars.filter((e) => e.gender === "F").length}/${charactersF.length}\`__<:female:870076411430436914>__\`${chars.filter((e) => e.gender === "M").length}/${charactersM.length}\`__<:male:870076394649047080>)\n` +
                    `<:SSTier:869316489931546644> **Tier**: ${padded[0]}ㅤ<:STier:869316518675095552> **Tier**: ${padded[3]}\n` +
                    `<:ATier:869316558013464627> **Tier**: ${padded[1]}ㅤ<:BTier:869316586803179571> **Tier**: ${padded[4]}\n` +
                    `<:CTier:869316602858991657> **Tier**: ${padded[2]}ㅤ<:DTier:869316616071032843> **Tier**: ${padded[5]}`
                );
        };

        // Check if there's a mail
        if (stats.mailbox.length && user.id === interaction.user.id) {
            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('open')
                        .setLabel(`You've got ${stats.mailbox.length} new ${stats.mailbox.length === 1 ? "mail" : "mails"}!`)
                        .setStyle(ButtonStyle.Primary),
                );

            return interaction.editReply({ embeds: (type === "legacy" && Embed) ? [Embed] : [], files: type === "legacy" ? [] : (img ? [img] : []), components: [row] }).then((msg) => {

                const collector = msg.createMessageComponentCollector({ filter: (r) => r.user.id === interaction.user.id && r.customId === "open", componentType: ComponentType.Button, time: 30000 });

                collector.on('collect', async () => {
                    const stats = await getUserSchema(user.id);
                    if (!stats) return;

                    const mail = stats.mailbox.shift();
                    if (!mail) {
                        if (interaction.channel?.isSendable()) interaction.channel.send("You don't have any notifications");
                        return;
                    };

                    let add_xp = 0,
                        add_coins = 0,
                        add_gems = 0,
                        add_lb = 0,
                        add_shards = { "ss": 0, "s": 0, "a": 0, "b": 0, "c": 0, "d": 0 },
                        add_tickets = { "ss": 0, "s": 0, "a": 0, "b": 0, "c": 0, "d": 0 },
                        add_chars: number[] = [],
                        add_skins: number[] = [],
                        add_items: Record<string, number> = {},
                        add_weapons: number[] = [],
                        add_guild_marks = 0,
                        add_skill_points = 0;

                    const types = {
                        "1": { // XP
                            run: () => {
                                mail.rewards.split(",").forEach((rew: string) => {
                                    if (rew.match(/xp/gi)) add_xp += parseInt(rew.split("|")[1]);
                                });
                            },
                        },
                        "2": { // Coins
                            run: () => {
                                mail.rewards.split(",").forEach((rew: string) => {
                                    if (rew.match(/coins/gi)) add_coins += parseInt(rew.split("|")[1]);
                                });
                            },
                        },
                        "3": { // Shards
                            run: () => {
                                mail.rewards.split(",").forEach((rew: string) => {
                                    if (rew.match(/shard/gi)) {
                                        add_shards[rew.split(" ")[0] as keyof typeof add_shards] += parseInt(rew.split("|")[1]);
                                    };
                                });
                            },
                        },
                        "4": { // Tickets
                            run: () => {
                                mail.rewards.split(",").forEach((rew: string) => {
                                    if (rew.match(/ticket/gi)) {
                                        add_tickets[rew.split(" ")[0] as keyof typeof add_tickets] += parseInt(rew.split("|")[1]);
                                    };
                                });
                            },
                        },
                        "5": { // Lootbox
                            run: () => {
                                mail.rewards.split(",").forEach((rew: string) => {
                                    if (rew.match(/lb/gi)) add_lb += parseInt(rew.split("|")[1]);
                                });
                            },
                        },
                        "6": { // Char
                            run: () => {
                                mail.rewards.split(",").forEach((rew: string) => {
                                    if (rew.match(/char/gi)) {
                                        add_chars.push(parseInt(rew.split("|")[1]));
                                    };
                                });
                            },
                        },
                        "7": { // Skin
                            run: () => {
                                mail.rewards.split(",").forEach((rew: string) => {
                                    if (rew.match(/skin/gi)) {
                                        add_skins.push(parseInt(rew.split("|")[1]));
                                    };
                                });
                            },
                        },
                        "8": { // Items
                            run: () => {
                                for (const rew of mail.rewards.split(",")) {
                                    if (rew.match(/item/gi)) {
                                        const tempItem = items[parseInt(rew.split("|")[1])];
                                        if (tempItem) {
                                            if (["weapon", "armor", "ring"].includes(tempItem.category)) add_weapons.push(parseInt(rew.split("|")[1]));
                                            else add_items[parseInt(rew.split("|")[1])] = add_items[parseInt(rew.split("|")[1])] + parseInt(rew.split("|")[2]) || parseInt(rew.split("|")[2]);
                                        };
                                    };
                                };
                            },
                        },
                        "9": { // Gems
                            run: () => {
                                mail.rewards.split(",").forEach((rew: string) => {
                                    if (rew.match(/gems/gi)) add_gems += parseInt(rew.split("|")[1]);
                                });
                            },
                        },
                        "10": { // Guild Marks
                            run: () => {
                                mail.rewards.split(",").forEach((rew: string) => {
                                    if (rew.match(/marks/gi)) add_guild_marks += parseInt(rew.split("|")[1]);
                                });
                            },
                        },
                        "11": { // Skill Points
                            run: () => {
                                mail.rewards.split(",").forEach((rew: string) => {
                                    if (rew.match(/skillpts/gi)) add_skill_points += parseInt(rew.split("|")[1]);
                                });
                            },
                        },
                    };

                    for (const type of mail.type.split(",")) {
                        await types[type as keyof typeof types].run();
                    };

                    let shardEmojis = { "ss": "<:ss_shard:917203009543503892>", "s": "<:s_shard:917202925514817566>", "a": "<:a_shard:917202904862052392>", "b": "<:b_shard:917202862851899392>", "c": "<:c_shard:917202862499582002>", "d": "<:d_shard:917202840563363891>" };
                    let ticketEmojis = { "ss": "<:ss_ticket:927503239396622336>", "s": "<:s_ticket:927642487705722890>", "a": "<:a_ticket:929420377946472508>", "b": "<:b_ticket:929420396535615519>", "c": "<:c_ticket:929420424645853214>", "d": "<:d_ticket:929420447102152714>" };

                    let notification = `${mail.message.replace(/\\n/g, "\n")}\n\n**Rewards**:\n>>> `;

                    const Mail = new EmbedBuilder()
                        .setColor(0xbbffff)
                        .setAuthor({ name: "Mailbox", iconURL: "https://i.ibb.co/HDHFqDB/621813807534309376.gif" })
                        .setThumbnail("https://i.ibb.co/nLrQFvd/gb.png")
                        .setFooter({ text: `Date issued: ${new Date(mail.date).getUTCDate()}/${new Date(mail.date).getUTCMonth() + 1}/${new Date(mail.date).getUTCFullYear()}` });

                    mail.type.split(",").forEach((type) => {
                        switch (type) {
                            case "1": mail.rewards.split(",").forEach((rew) => { if (rew.match(/xp/gi)) notification += `You received **${rew.split("|")[1]}** XP!\n`; }); break;
                            case "2": mail.rewards.split(",").forEach((rew) => { if (rew.match(/coins/gi)) notification += `Added **${rew.split("|")[1]}** <:coins:872926669055356939>\n`; }); break;
                            case "3": mail.rewards.split(",").forEach((rew) => { if (rew.match(/shard/gi)) notification += `Added **${rew.split("|")[1]}**x ${shardEmojis[rew.split(" ")[0] as keyof typeof shardEmojis]}\n`; }); break;
                            case "4": mail.rewards.split(",").forEach((rew) => { if (rew.match(/ticket/gi)) notification += `Added **${rew.split("|")[1]}**x ${ticketEmojis[rew.split(" ")[0] as keyof typeof ticketEmojis]}\n`; }); break;
                            case "5": mail.rewards.split(",").forEach((rew) => { if (rew.match(/lb/gi)) notification += `Added **${rew.split("|")[1]}** ${rew.split("|")[1] == "1" ? "lootbox" : "lootboxes"}\n`; }); break;
                            case "6": mail.rewards.split(",").forEach((rew) => { if (rew.match(/char/gi)) { notification += `Added ${characters[parseInt(rew.split("|")[1])].rarity}-Tier **${characters[parseInt(rew.split("|")[1])].name}**\n`; Mail.setImage(characters[parseInt(rew.split("|")[1])].image); }; }); break;
                            case "7": mail.rewards.split(",").forEach((rew) => { if (rew.match(/skin/gi)) { notification += `Added **${skins[parseInt(rew.split("|")[1])].name}** skin\n`; Mail.setImage(skins[parseInt(rew.split("|")[1])].image); }; }); break;
                            case "8": mail.rewards.split(",").forEach((rew) => { if (rew.match(/item/gi)) notification += `Added **${(rew.split("|")[2] ?? 1)}**x ${items[parseInt(rew.split("|")[1])].emoji} **__${items[parseInt(rew.split("|")[1])].name}__**\n`; }); break;
                            case "9": mail.rewards.split(",").forEach((rew) => { if (rew.match(/gems/gi)) notification += `Added **${rew.split("|")[1]}** <:genesis_gems:1034179687720681492>\n`; }); break;
                            case "10": mail.rewards.split(",").forEach((rew) => { if (rew.match(/marks/gi)) notification += `Added **${rew.split("|")[1]}** <:guild_mark:1317944450814840923>\n`; }); break;
                            case "11": mail.rewards.split(",").forEach((rew) => { if (rew.match(/skillpts/gi)) notification += `Added **${rew.split("|")[1]}** <:skill_point:1351505460301136014>\n`; }); break;
                        };
                    });

                    // Update users table
                    await updateUsers(interaction.user.id, {
                        xp: { type: "increment", value: add_xp },
                        coins: { type: "increment", value: add_coins },
                        gems: { type: "increment", value: add_gems },
                        lootbox: { type: "increment", value: add_lb },
                        ssshard: { type: "increment", value: add_shards["ss"] },
                        sshard: { type: "increment", value: add_shards["s"] },
                        ashard: { type: "increment", value: add_shards["a"] },
                        bshard: { type: "increment", value: add_shards["b"] },
                        cshard: { type: "increment", value: add_shards["c"] },
                        dshard: { type: "increment", value: add_shards["d"] },
                        ssticket: { type: "increment", value: add_tickets["ss"] },
                        sticket: { type: "increment", value: add_tickets["s"] },
                        aticket: { type: "increment", value: add_tickets["a"] },
                        bticket: { type: "increment", value: add_tickets["b"] },
                        cticket: { type: "increment", value: add_tickets["c"] },
                        dticket: { type: "increment", value: add_tickets["d"] },
                        chars: { type: "append", value: add_chars },
                        skins: { type: "append", value: add_skins },
                        items: { type: "merge_json", value: add_items },
                        guild_marks: { type: "increment", value: add_guild_marks },
                        skill_points: { type: "increment", value: add_skill_points },
                        mailbox: { type: "set", value: stats.mailbox },
                        mailreceived: { type: "increment", value: -1 }
                    });

                    if (add_weapons.length) {
                        for (const add_weapon of add_weapons) {
                            await insertNewWeapon(interaction.user.id, add_weapon, items[add_weapon].category);
                        };
                    };

                    Mail.setDescription(notification);
                    if (interaction.channel?.isSendable()) interaction.channel.send({ embeds: [Mail] });
                });

            });
        };

        return interaction.editReply({ embeds: (type === "legacy" && Embed) ? [Embed] : [], files: type === "legacy" ? [] : (img ? [img] : []) });
    },
};

export default exportCommand;
