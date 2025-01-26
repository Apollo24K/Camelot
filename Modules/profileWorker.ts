import { parentPort } from 'worker_threads';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import GIFEncoder from 'gifencoder';
import { Asset } from "./assets";
import { profileSets } from "./profileDecorations";
import { setImmediate } from 'timers/promises';
import { CompactUserSchema, ProfileImageArguments } from '../types';
import { User } from 'discord.js';

const newProfileColors = {
    creme: { text: '#FDE8FF', floor: '#a89aa8', gradStart: '#FDE8FF', gradEnd: '#000000' },
    red: { text: '#FF2626', floor: '#761113', gradStart: '#FF2626', gradEnd: '#000000' },
    orange: { text: '#FF7C26', floor: '#a24f19', gradStart: '#FF7C26', gradEnd: '#000000' },
    gold: { text: '#FFE103', floor: '#a89500', gradStart: '#FFE103', gradEnd: '#000000' },
    mint: { text: '#C4FF03', floor: '#729201', gradStart: '#C4FF03', gradEnd: '#000000' },
    green: { text: '#82FF03', floor: '#509e00', gradStart: '#82FF03', gradEnd: '#000000' },
    emerald: { text: '#0DDF09', floor: '#068103', gradStart: '#0DDF09', gradEnd: '#000000' },
    turquoise: { text: '#49DAE6', floor: '#006e6d', gradStart: '#3CCEDA', gradEnd: '#000000' },
    blue: { text: '#09B8DF', floor: '#066e86', gradStart: '#09B8DF', gradEnd: '#000000' },
    sky_blue: { text: '#17E6FB', floor: '#0e8c98', gradStart: '#17E6FB', gradEnd: '#000000' },
    indigo: { text: '#1A70FF', floor: '#10469f', gradStart: '#1A70FF', gradEnd: '#000000' },
    violet: { text: '#AE57FF', floor: '#69369b', gradStart: '#AE57FF', gradEnd: '#000000' },
    purple: { text: '#C957FF', floor: '#773599', gradStart: '#C957FF', gradEnd: '#000000' },
    pink: { text: '#FF46BB', floor: '#9f2b74', gradStart: '#FF46BB', gradEnd: '#000000' },
};

parentPort?.on('message', async (data) => {
    const { user, stats, profileArguments } = data;
    try {
        const { buffer, format } = await getProfileImage(user, stats, profileArguments);
        parentPort?.postMessage({ status: 'success', image: buffer.toString('base64'), format });
    } catch (error: any) {
        parentPort?.postMessage({ status: 'error', error: error.message });
    }
});

async function getProfileImage(user: User, stats: CompactUserSchema, profileArguments: ProfileImageArguments) {
    // Get background
    const [setid, bgid] = (stats.background ?? "").split(".");
    const bg = setid ? profileSets[parseInt(setid)].assets[parseInt(bgid)] : profileSets[0].assets[0];

    // Canvas properties
    const width = 800;
    const height = 460;
    const res = { "high": 1, "medium": 0.75, "low": 0.6, "thumbnail": 0.4 }[profileArguments.quality || ((bg.asset.fileType === "gif" && !profileArguments.forceStatic) ? "medium" : "high")] || 0.75;
    const profileColor = ['creme', 'red', 'orange', 'gold', 'mint', 'green', 'emerald', 'turquoise', 'blue', 'sky_blue', 'indigo', 'violet', 'purple', 'pink'].includes(profileArguments.profilecolor || "") ? (profileArguments.profilecolor ?? 'turquoise') : 'turquoise';

    // Create a canvas
    const canvas = createCanvas(width * res, height * res);
    const ctx = canvas.getContext('2d');

    // Load images
    const charImage = await new Asset({ path: profileArguments.thumbnail || "Images/error/missing-char.png", url: profileArguments.thumbnail || "https://i.ibb.co/284MfK6/missing-char.png", fallback: new Asset({ path: "Images/error/loading.png", url: "https://i.ibb.co/fG5ghJx/loading.png" }) }).loadImage();
    const pfpImage = await new Asset({ path: "", url: profileArguments.profilePicture }).loadImage();
    const coinsImage = await new Asset({ path: "Images/emojis/coins.png", url: "https://i.ibb.co/sqLg2gc/coins.png" }).loadImage();
    const gemsImage = await new Asset({ path: "Images/emojis/gems.png", url: "https://i.ibb.co/30CVNbR/gems.png" }).loadImage();
    const jadeImage = await new Asset({ path: "Images/emojis/jade.png", url: "https://i.ibb.co/QPCrsCV/jade.png" }).loadImage();
    const liliumImage = await new Asset({ path: "Images/emojis/lilium.png", url: "https://i.ibb.co/Cv1jd40/lilium.png" }).loadImage();
    // const achvmImage = await new Asset({ path: "Images/emojis/trophy.png", url: "https://i.ibb.co/DpngcCT/trophy.png" }).loadImage();

    let classImage;
    if (profileArguments.classImage) classImage = await new Asset({ path: "", url: profileArguments.classImage }).loadImage();

    let weaponImage, shieldImage, helmetImage, cuirassImage, glovesImage, bootsImage;
    if (profileArguments.weaponImage) weaponImage = await new Asset({ path: "", url: profileArguments.weaponImage }).loadImage();
    if (profileArguments.shieldImage) shieldImage = await new Asset({ path: "", url: profileArguments.shieldImage }).loadImage();
    if (profileArguments.helmetImage) helmetImage = await new Asset({ path: "", url: profileArguments.helmetImage }).loadImage();
    if (profileArguments.cuirassImage) cuirassImage = await new Asset({ path: "", url: profileArguments.cuirassImage }).loadImage();
    if (profileArguments.glovesImage) glovesImage = await new Asset({ path: "", url: profileArguments.glovesImage }).loadImage();
    if (profileArguments.bootsImage) bootsImage = await new Asset({ path: "", url: profileArguments.bootsImage }).loadImage();

    // Create canvas of static parts to avoid redraving them each frame
    const staticCanvas = createCanvas(width, height);
    const sctx = staticCanvas.getContext('2d');
    {
        // Shadow
        const gradient = sctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.24, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.64, 'rgba(0, 0, 0, 0)');
        sctx.fillStyle = gradient;
        sctx.fillRect(0, 0, width, height);

        // Card
        const cardBgImage = await loadImage(`Images/ui/profile/profile-${profileColor}.png`);
        sctx.drawImage(cardBgImage, 0, 0);

        // Char Image
        const rotationAngle = -5 * Math.PI / 180;
        const charImageWidth = 450 * 0.33, charImageHeight = 700 * 0.33;
        const charImageOffsetX = 633, charImageOffsetY = 190;
        sctx.save();
        sctx.translate(charImageOffsetX + (charImageWidth / 2), charImageOffsetY + (charImageHeight / 2));
        sctx.rotate(rotationAngle);
        sctx.drawImage(charImage, -(charImageWidth / 2), -(charImageHeight / 2), charImageWidth, charImageHeight);
        sctx.restore();

        // EP
        sctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        sctx.font = 'bold 22px Arial';
        sctx.textAlign = 'center';
        sctx.textBaseline = 'middle';
        sctx.save();
        // sctx.translate(670, 430);
        sctx.rotate(rotationAngle);
        sctx.fillText(`EP ${profileArguments.stats.ep}`, 680, 496, 120);
        sctx.restore();

        // Card Shadow Test
        {
            // // Step 1: Draw the original image
            // sctx.drawImage(charImage, charImageOffsetX, charImageOffsetY, charImageWidth, charImageHeight);

            // // Step 2: Create an offscreen canvas for the mask
            // const maskCanvas = createCanvas(charImageWidth, charImageHeight);
            // const maskCtx = maskCanvas.getContext('2d');

            // // Step 3: Draw the image on the mask canvas
            // maskCtx.drawImage(charImage, 0, 0);

            // // Step 4: Get image data from the mask canvas
            // const imageData = maskCtx.getImageData(0, 0, charImageWidth, charImageHeight);
            // const data = imageData.data;

            // // Step 5: Modify the image data to create a black mask based on the alpha channel
            // for (let i = 0; i < data.length; i += 4) {
            //     // Set pixels to black but preserve the alpha channel
            //     data[i] = 0;       // Red
            //     data[i + 1] = 0;   // Green
            //     data[i + 2] = 0;   // Blue
            //     // Alpha (data[i + 3]) remains unchanged
            // }

            // // Step 6: Put the modified image data back onto the mask canvas
            // maskCtx.putImageData(imageData, 0, 0);

            // // Step 7: Draw the black mask onto the main canvas
            // sctx.drawImage(maskCanvas, charImageOffsetX, charImageOffsetY);
        }

        // Draw Class
        sctx.fillStyle = '#ffffff';
        sctx.font = '24px Arial';
        sctx.textAlign = 'center';
        sctx.textBaseline = 'middle';
        if (classImage && profileArguments.className) {
            sctx.drawImage(classImage, 678, 10, 58, 58);
            sctx.fillText(profileArguments.className, 707, 84, 166);
            sctx.font = 'bold 30px Arial';
            const clvlStr = `${profileArguments.classLevel}`;
            const clvlStrWidth = sctx.measureText(clvlStr).width;
            sctx.fillText(clvlStr, 707, 112, 166);
            sctx.textAlign = 'end';
            sctx.font = '16px Arial';
            sctx.fillText("LVL", 705 - (clvlStrWidth / 2), 117, 80);
        } else {
            sctx.fillText("No Class", 707, 84, 166);
        };

        // Gear
        const gearOffsetX = 615, gearOffsetY = 141;
        if ("shieldid" in profileArguments.stats) {
            if (weaponImage) sctx.drawImage(weaponImage, -15 + gearOffsetX, gearOffsetY, 30, 30);
            if (shieldImage) sctx.drawImage(shieldImage, 15 + gearOffsetX, gearOffsetY, 30, 30);
            if (helmetImage) sctx.drawImage(helmetImage, 55 + gearOffsetX, gearOffsetY, 30, 30);
            if (cuirassImage) sctx.drawImage(cuirassImage, 85 + gearOffsetX, gearOffsetY, 30, 30);
            if (glovesImage) sctx.drawImage(glovesImage, 115 + gearOffsetX, gearOffsetY, 30, 30);
            if (bootsImage) sctx.drawImage(bootsImage, 145 + gearOffsetX, gearOffsetY, 30, 30);
        } else {
            if (weaponImage) sctx.drawImage(weaponImage, 0 + gearOffsetX, gearOffsetY, 30, 30);
            if (helmetImage) sctx.drawImage(helmetImage, 40 + gearOffsetX, gearOffsetY, 30, 30);
            if (cuirassImage) sctx.drawImage(cuirassImage, 70 + gearOffsetX, gearOffsetY, 30, 30);
            if (glovesImage) sctx.drawImage(glovesImage, 100 + gearOffsetX, gearOffsetY, 30, 30);
            if (bootsImage) sctx.drawImage(bootsImage, 130 + gearOffsetX, gearOffsetY, 30, 30);
        };


        // Profile
        {
            const offsetX = 0, offsetY = 260;

            // XP Bar
            const xpBarOffsetX = 120, xpBarOffsetY = 80, xpBarWidth = 450, xpBarHeight = 21;
            sctx.beginPath();
            sctx.moveTo(offsetX + xpBarOffsetX, offsetY + xpBarOffsetY);
            sctx.lineTo(offsetX + xpBarOffsetX + xpBarWidth - 22, offsetY + xpBarOffsetY);
            sctx.lineTo(offsetX + xpBarOffsetX + xpBarWidth, offsetY + xpBarOffsetY + xpBarHeight);
            sctx.lineTo(offsetX + xpBarOffsetX, offsetY + xpBarOffsetY + xpBarHeight);
            sctx.closePath();
            sctx.fillStyle = '#EEEEEE';
            sctx.fill();

            // Fill
            let xpr = stats.xp, level = 0;
            for (let i = 1; xpr >= 0; i++) {
                xpr -= Math.floor(5 * Math.log(i) ** 4 + 30);
                level++;
            };
            const xpTotal = Math.floor(5 * Math.log(level) * Math.log(level) * Math.log(level) * Math.log(level) + 30);
            const percent = (xpTotal + xpr) / xpTotal;

            sctx.beginPath();
            sctx.moveTo(offsetX + xpBarOffsetX, offsetY + xpBarOffsetY);
            sctx.lineTo(offsetX + xpBarOffsetX + (xpBarWidth * percent) - 22, offsetY + xpBarOffsetY);
            sctx.lineTo(offsetX + xpBarOffsetX + (xpBarWidth * percent), offsetY + xpBarOffsetY + xpBarHeight);
            sctx.lineTo(offsetX + xpBarOffsetX, offsetY + xpBarOffsetY + xpBarHeight);
            sctx.closePath();
            // Draw Profile Section
            const gradient = sctx.createLinearGradient(offsetX + xpBarOffsetX, offsetY + xpBarOffsetY, xpBarWidth, xpBarHeight);
            gradient.addColorStop(0, newProfileColors[profileColor as keyof typeof newProfileColors].gradStart); // Light
            gradient.addColorStop(1, newProfileColors[profileColor as keyof typeof newProfileColors].gradEnd); // Dark
            sctx.fillStyle = gradient;
            sctx.fill();

            // Profile picture
            sctx.save();
            sctx.beginPath();
            const pfpWidth = 100;
            const centerX = 80 + offsetX;
            const centerY = 80 + offsetY;
            sctx.arc(centerX, centerY, pfpWidth / 2, 0, Math.PI * 2);
            sctx.clip();
            sctx.drawImage(pfpImage, centerX - pfpWidth / 2, centerY - pfpWidth / 2, pfpWidth, pfpWidth);
            sctx.restore();

            // Floor
            const floorOffsetX = 422, floorOffsetY = 122;
            sctx.beginPath();
            sctx.moveTo(offsetX + floorOffsetX + 6, offsetY + floorOffsetY - 2);
            sctx.lineTo(offsetX + floorOffsetX + 60, offsetY + floorOffsetY - 3);
            sctx.lineTo(offsetX + floorOffsetX + 61, offsetY + floorOffsetY - 16);
            sctx.lineTo(offsetX + floorOffsetX + 130, offsetY + floorOffsetY - 18);
            sctx.lineTo(offsetX + floorOffsetX + 126, offsetY + floorOffsetY + 15);
            sctx.lineTo(offsetX + floorOffsetX + 6, offsetY + floorOffsetY + 13);
            sctx.closePath();
            sctx.fillStyle = newProfileColors[profileColor as keyof typeof newProfileColors].floor;
            sctx.fill();
            // Text
            sctx.fillStyle = newProfileColors[profileColor as keyof typeof newProfileColors].text;
            sctx.font = 'bold 15px Arial';
            sctx.textAlign = 'start';
            sctx.textBaseline = 'middle';
            sctx.fillText("Floor", offsetX + floorOffsetX + 15, offsetY + floorOffsetY + 5, 80);
            sctx.font = 'bold 30px Arial';
            sctx.textAlign = 'center';
            sctx.fillText(`${profileArguments.floor}`, offsetX + floorOffsetX + 94, offsetY + floorOffsetY - 1, 60);

            // Username
            sctx.font = '30px Arial';
            sctx.textAlign = 'start';
            sctx.textBaseline = 'middle';
            sctx.fillText(`${user.username} [${stats.rank}]`, offsetX + 135, offsetY + 59, 280);

            // Level
            const levelStr = `${profileArguments.userLvl}`;
            sctx.font = '30px Arial';
            sctx.textAlign = 'end';
            sctx.textBaseline = 'middle';
            const levelStrWidth = sctx.measureText(levelStr).width;
            sctx.fillText(levelStr, offsetX + 539, offsetY + 59, 120);
            sctx.font = '16px Arial';
            sctx.textAlign = 'end';
            sctx.textBaseline = 'middle';
            sctx.fillText("LVL", offsetX + 539 - 2 - levelStrWidth, offsetY + 64, 120);

            // Last Active
            sctx.font = '18px Arial';
            sctx.textAlign = 'start';
            sctx.textBaseline = 'middle';
            sctx.fillText(`Last active:- ${profileArguments.lastActive}`, offsetX + 132, offsetY + 117, 200);

            // Guild
            sctx.font = 'bold 18px Arial';
            sctx.textAlign = 'start';
            sctx.textBaseline = 'middle';
            sctx.fillText("Guild", offsetX + 75, offsetY + 150, 100);
            sctx.font = '18px Arial';
            sctx.fillText(profileArguments.guild || "None", offsetX + 135, offsetY + 150, 160);

            // Party
            sctx.font = 'bold 18px Arial';
            sctx.textAlign = 'start';
            sctx.textBaseline = 'middle';
            sctx.fillText("Party", offsetX + 75, offsetY + 175, 100);
            sctx.font = '18px Arial';
            sctx.fillText(profileArguments.party || "None", offsetX + 135, offsetY + 175, 160);

            // Coins
            sctx.drawImage(coinsImage, offsetX + 310, offsetY + 140, 24, 24);
            sctx.fillText(`${stats.coins}`, offsetX + 344, offsetY + 150, 90);

            // Lilium
            sctx.drawImage(liliumImage, offsetX + 309, offsetY + 165, 23, 23);
            sctx.fillText(`${stats.lilies}`, offsetX + 344, offsetY + 175, 90);

            // Gems
            sctx.drawImage(gemsImage, offsetX + 448, offsetY + 140, 24, 24);
            sctx.fillText(`${stats.gems}`, offsetX + 482, offsetY + 150, 90);

            // Jades
            sctx.drawImage(jadeImage, offsetX + 447, offsetY + 165, 24, 24);
            sctx.fillText(`${stats.jades}`, offsetX + 482, offsetY + 175, 90);
        };

        // Function to resize canvas
        function resizeCanvas(scale: number) {
            // Create a temporary canvas
            const tempCanvas = createCanvas(staticCanvas.width, staticCanvas.height);
            tempCanvas.getContext('2d').drawImage(staticCanvas, 0, 0);

            // Resize the original canvas
            staticCanvas.width = width * scale;
            staticCanvas.height = height * scale;

            // Redraw the content from the temporary canvas back onto the original canvas
            sctx.drawImage(tempCanvas, 0, 0, width * scale, height * scale);
        };

        // Usage
        if (res !== 1) resizeCanvas(res);
    };

    // Load background
    const frames = await bg.loadImageArray(profileArguments.forceStatic);

    // Create GIF encoder
    const encoder = new GIFEncoder(width * res, height * res);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(bg.delay);
    encoder.setQuality(1); // default: 10, best: 1

    // Draw Frames
    for (const frame of frames) {
        // Yield to the event loop between frames
        await setImmediate();

        // Draw Background
        ctx.drawImage(frame, 0, 0, 640 * res, 360 * res);

        // Draw Static
        ctx.drawImage(staticCanvas, 0, 0);

        // Add the current frame to the GIF
        // @ts-expect-error
        encoder.addFrame(ctx);
    };

    // Finish encoding GIF
    encoder.finish();

    // Convert frame to jpeg
    if (frames.length === 1) {
        const buffer = canvas.toBuffer('image/jpeg');
        return { buffer, format: "jpg" };
        // return new AttachmentBuilder(buffer, { name: 'profile.jpg' });
    };

    // Convert GIF stream to buffer
    const buffer = encoder.out.getData();
    return { buffer, format: "gif" };
    // return new AttachmentBuilder(buffer, { name: 'profile.gif' });
};
