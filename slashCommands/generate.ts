import { IOutputFormat } from '@runware/sdk-js';
import { SlashCommand } from '../types';
import { EmbedBuilder } from 'discord.js';
import { characters } from "../Modules/chars";
import { formatNumberWithQuotes } from "../Modules/functions";
import { updateUsers } from "../Modules/queries";
// import { generateImages } from '../Modules/runware';
import { generateImages } from '../Modules/runwareDirectApi';
import { generateText } from '../Modules/gemini';

type GenType = "weapon" | "armor" | "ring" | "custom" | "character";

const exportCommand: SlashCommand = {
    name: 'generate',
    async execute({ interaction, author }) {

        const stats = author.schema;
        const type = interaction.options.getString('type') as GenType | null;
        const userprompt = interaction.options.getString('prompt') ?? type ?? "";
        const enhancePrompt = interaction.options.getBoolean('enhance') ?? true;
        const outputFormat = (interaction.options.getString('output') as IOutputFormat) ?? "JPG";

        if (type === null) {
            let thumbnail = characters[stats.chars[Math.floor(Math.random() * stats.chars.length)]].image || "https://i.imgur.com/Ta2YDBN.png";
            if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, "", stats.char_skin[stats.favchar]);

            const Embed = new EmbedBuilder()
                .setColor(0xbbffff)
                .setAuthor({ name: `Image Credits`, iconURL: interaction.user.displayAvatarURL({ size: 512 }) })
                .setThumbnail(thumbnail)
                .setDescription(
                    `Generate art in the style of Camelot, fitting for use in suggestions and contests! Please use this command only for that purpose. **All images get logged and reviewed, misuse can result in penalties!**\n\n` +
                    `**Balance**: \`${formatNumberWithQuotes(stats.image_credits)}\` credits\n\n` +
                    `-# You can buy credits in the \`/monthly shop\` using coins <:coins:872926669055356939> or jades <:eternal_jade:1256124504141201428>`
                );
            return interaction.reply({ embeds: [Embed] });
        };

        try {
            if (stats.image_credits <= 0) return interaction.reply("You don't have any image credits left.");
            await interaction.reply({ content: "Generating images..." });
        } catch {
            return console.log(`ERROR Interaction Failed to reply, command: "${interaction.commandName}"`);
        };

        const prompt = enhancePrompt ? await getPrompt(userprompt, type) : userprompt;

        const images = await getImages(prompt, type, outputFormat);
        if (images.length === 0) return interaction.editReply({ content: "An error occurred while generating the images. Please try again later.\n\nIf the issue persists, please contact us on our `/support` server!" });

        // Update users table
        await updateUsers(interaction.user.id, {
            image_credits: { type: "increment", value: -1 },
        });

        return interaction.editReply({ content: `**Prompt: ** ${userprompt}`, files: images.map((img) => img ?? "") });
    },
};

export default exportCommand;


//----------------------------------//
//         Helper Functions         //
//----------------------------------//

async function getPrompt(userprompt: string, type: GenType) {

    if (type === "weapon") {
        return await generateText({
            systemInstruction: "You create detailed image prompts, suiting the style of FLUX.1 (Dev) for weapon icon illustrations.",
            chatHistory: [
                "Create a weapon that aligns with one corner, is usable for an emoji/ icon, is icon illustrared, the background transparent, fantasy style, illustration, non-realistic art style, not realistic",
                userprompt,
                "Create a prompt for an illustrated fantasy rpg weapon",
            ],
        }) ?? userprompt;
    };

    if (type === "armor") {
        return await generateText({
            systemInstruction: "You create detailed image prompts, suiting the style of FLUX.1 (Dev) for armor icon illustrations.",
            chatHistory: [
                "Create a set of armor, including a helmet/hat/hodd, a cuirass/chestplate/robe/vest, a pair of gloves/vambraces/gauntlets and a pair of boots. It should be usable for an emoji/icon, is icon illustrared, the background transparent, fantasy style, illustration, non-realistic art style, not realistic",
                userprompt,
                "Create one detailed prompt for each armor piece for an illustrated fantasy rpg armor set and format it to JSON format, with the key being the armor piece, each named 'helmet', 'cuirass', 'gloves', 'boots', and the value being the prompt. The armor set should be named earlier.",
                "All armor pieces's prompts should be very detailed and should be usable for emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic.",
                "All prompts need to have a white background and non realistic illustration style",
                "The pair of gloves/vambraces should not have fingers visible, only armor. Helmets should also just have the armor helmet and no kind of face.",
                "Create a prompt for an illustrated fantasy rpg armor set",
            ],
            maxOutputTokens: 1024,
        }) ?? userprompt;
    };

    if (type === "ring") {
        return await generateText({
            systemInstruction: "You create detailed image prompts, suiting the style of FLUX.1 (Dev) for ring icon illustrations.",
            chatHistory: [
                "Create a ring that is slightly tilted to the right, is usable for an emoji/ icon, is icon illustrared, the background transparent, fantasy style, illustration, non-realistic art style, not realistic",
                userprompt,
                "Create a prompt for an illustrated fantasy rpg ring",
            ],
        }) ?? userprompt;
    };

    if (type === "custom") {
        return await generateText({
            systemInstruction: "You create detailed image prompts, suiting the style of FLUX.1 (Dev) for item icon illustrations.",
            chatHistory: [
                "Create an item that is usable for an emoji/ icon, is icon illustrared, the background transparent, fantasy style, illustration, non-realistic art style, not realistic",
                userprompt,
                "Create a prompt for an illustrated fantasy rpg item icon",
            ],
        }) ?? userprompt;
    };

    if (type === "character") {
        return await generateText({
            systemInstruction: "Reply only with the result of your task, nothing else.",
            chatHistory: [
                "Create a custom character prompt based on the below user prompt in the following structure:" +
                // "(__theme__ theme:1.2), from above, upper body, 1girl, __race__, (__hair_style__ __hair_color__ hair:1.2), (__eyes__ __eye_color__ eyes:1.2), standing, {small|medium|large} breasts, (__outfit__:1.2), looking at viewer, floating hair" +
                "watercolor (medium), (carne griffiths:1.2), yuko shimizu, masterpiece portrait, extreme details, (((${race}))), ${1girl|1boy}, (Waterfall braid ${hairColor} hair:1.2), dynamic pose, (${eyeAccent} ${eyeColor} eyes:1.2), Bold, Delighted, ${emotions}, (illustration), ${large|medium|small} breasts, (${clothing}:1.2), (character focus), ((perfect anatomy)), (((extreme detail))), ((${theme} theme)), masterpiece, best quality, highest quality, (dynamic lighting:1.1), (perfect face:1.1) intricate (high detail:1.1), official art, (chiaroscuro:1.1) ${otherOptionals}",
                `Weighting Syntax: (text) (text:number) [text]\nUse parentheses () to increase attention, square brackets [] to decrease it. Add a number after the text to specify a custom multiplier.\n\nExamples:\n\nSingle words: (small) dog, pixar style\nMultiple words: small dog, [pixar style]\nHigher emphasis: (small:2.5) dog, pixar style\nCombined emphasis: (small dog:1.5), pixar style` +
                "Feel free to modify the base structure or user prompt to add some variety, without abandoning the syntax.",
                "The less the user provides, the more you can play with the vectors. Vectors you can play with include hair color, hair style, eye color, clothing, setting, grimace, pose, etc.",
                "User prompt:",
                userprompt,
            ],
        }) ?? userprompt;
    };

    return userprompt;
};

async function getImages(prompt: string, type: GenType, outputFormat: IOutputFormat) {

    if (type === "weapon" || type === "ring" || type === "custom") {
        return await generateImages({ prompt, outputFormat, numberOfImages: 3 });
    };

    if (type === "armor") {
        const armorPrompts = parseArmorPrompts(prompt);

        if (armorPrompts === undefined) return [];

        const armorImages = await Promise.all([
            generateImages({ prompt: armorPrompts.helmet, outputFormat }),
            generateImages({ prompt: armorPrompts.cuirass, outputFormat }),
            generateImages({ prompt: armorPrompts.gloves, outputFormat }),
            generateImages({ prompt: armorPrompts.boots, outputFormat }),
        ]);

        return armorImages.flat();
    };

    if (type === "character") {
        return await generateImages({
            prompt, outputFormat, model: "PrimeMix", width: 576, height: 896, numberOfImages: 2,
            negativePrompt: "easynegative, (mutilated:1.21), mutated hands, (poorly drawn hands:1.331), extra limbs, (disfigured:1.331), (missing arms:1.331), (extra legs:1.331), (fused fingers:1.61051), (too many fingers:1.61051), bad hands, missing fingers, extra digit"
        });
    };

    return [];
};

function parseArmorPrompts(jsonString: string) {
    try {
        const jsonMatch = jsonString.match(/\{[^]*\}/);
        if (!jsonMatch) return undefined;

        const armorJson = JSON.parse(jsonMatch[0]);

        const requiredKeys = ['helmet', 'cuirass', 'gloves', 'boots'];
        for (const key of requiredKeys) {
            if (!(key in armorJson)) return undefined;
        };

        return {
            helmet: `${armorJson.helmet}`,
            cuirass: `${armorJson.cuirass}`,
            gloves: `${armorJson.gloves}`,
            boots: `${armorJson.boots}`
        };
    } catch {
        return undefined;
    };
};
