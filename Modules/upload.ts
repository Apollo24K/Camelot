import axios from 'axios';
import sharp from 'sharp';
import FormData from 'form-data';
import fs from 'fs';

const tokens = ["ddecd222cd3fc3150f6404c0cc85a4e5", "f4f213791cdfb57e8c35a1b1a67edbfd", "89ce34cab24ea806cf774e5b270648fe", "29c12f5e482ecbf9eaa30e86763d11a2", "fdbfcc9e09cee0c5b47d78eaf2da5530"];
let rot = Math.floor(Math.random() * 5);

// Download images
const downloadImage = async (url: string) => {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    // eslint-disable-next-line no-undef
    return Buffer.from(response.data, 'binary');
};

export const upload = async (char: string, effect: string) => {
    try {
        // Download images
        const [charImageBuffer, effectImageBuffer] = await Promise.all([
            downloadImage(char),
            downloadImage(effect)
        ]);

        // Get char image dimensions
        const charImage = sharp(charImageBuffer);
        const { width, height } = await charImage.metadata();

        // Resize effect image to match char image dimensions
        const effectImage = await sharp(effectImageBuffer)
            .resize(width, height)
            .toBuffer();

        // Combine images
        const outputImage = await charImage
            .composite([{ input: effectImage, blend: 'atop' }])
            .toBuffer();

        // Save image locally
        const filename = "o" + Math.floor(Math.random() * 100000);
        fs.writeFileSync(`Images/${filename}.png`, outputImage);

        // Create form data
        const formData = new FormData();
        formData.append('image', fs.createReadStream(`Images/${filename}.png`));

        // Upload image to imgbb.com
        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${tokens[rot % 5]}`, formData, {
            headers: formData.getHeaders(),
        });

        // Delete local file after 20 seconds
        fs.unlink(`Images/${filename}.png`, (err) => {
            if (err) console.error(`Error while deleting file ${`Images/${filename}.png`}`);
        });

        return response?.data?.data?.url || char;
    } catch (error) {
        console.error("Failed image upload: " + char); // console.error(error);
        return char;
    };
};
