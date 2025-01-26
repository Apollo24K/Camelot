const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Runware } = require('@runware/sdk-js');
import { SlashCommand } from '../types';
import config from '../config.json';
import { EmbedBuilder } from 'discord.js';
import { characters } from "../Modules/chars";
import { formatNumberWithQuotes, userLevel } from "../Modules/functions";
import { updateUsers } from "../Modules/queries";

// TODO Add character prompt
// TODO Add credits to shop/ monthly shop/ weekly (premium)
// TODO Image Credit Icon

const exportCommand: SlashCommand = {
    name: 'generate',
    async execute({ interaction, author }) {
        const subcommand = interaction.options.getSubcommand();
        
        const userprompt = interaction.options.getString('prompt');
        const enhancePrompt = interaction.options.getBoolean('enhanceprompt') ?? true;
        const output = interaction.options.getString('output') ?? "JPG";
        const type = interaction.options.getString('type') ?? "character";

        const stats = author.schema;
        if (!stats) return interaction.reply("It seems you haven't started playing yet.");
        
        // Defer the reply immediately to prevent timeout
        await interaction.deferReply();

        // Give Starting Image Credits
        if (userLevel(stats.xp) >= 25 && !stats.image_credits_claimed) {
            await updateUsers(interaction.user.id, { 
                image_credits: { type: 'increment', value: 20 },
                image_credits_claimed: { type: 'set', value: 1 }
            });
            await interaction.editReply(`🎉 Congratulations! You've received 20 starting image credits!`);
        }

        // Armor Prompt Parsing
        interface ArmorPrompts {
            helmet: string;
            chestplate: string;
            vambrace: string;
            boots: string;
        }
        
        // Armor Prompt Parsing
        function parseArmorPrompts(jsonString: string): ArmorPrompts {
            try {
                // Parse the JSON string into an object
                const armorJson = JSON.parse(jsonString);
                
                // Ensure all required keys exist
                const requiredKeys = ['helmet', 'chestplate', 'vambrace', 'boots'];
                for (const key of requiredKeys) {
                    if (!(key in armorJson)) {
                        throw new Error(`Missing required armor piece: ${key}`);
                    }
                }
        
                return {
                    helmet: armorJson.helmet,
                    chestplate: armorJson.chestplate,
                    vambrace: armorJson.vambrace,
                    boots: armorJson.boots
                };

            } catch (error) {
                console.error('Error parsing armor JSON:', error);
                throw error;
            }
        }

        // Prompt Enhancement
        async function getPrompt() {

            let systemInstruction = ""; let result;
            if (type === "weapon") systemInstruction = "You create detailed prompts, suiting the style of FLUX.1 (Dev) for weapon icon illustrations."
            else if (type === "armor") systemInstruction = "You create detailed prompts, suiting the style of FLUX.1 (Dev) for armor icon illustrations."
            else if (type === "ring") systemInstruction = "You create detailed prompts, suiting the style of FLUX.1 (Dev) for ring icon illustrations."
            else if (type === "custom") systemInstruction = "You create detailed prompts, suiting the style of FLUX.1 (Dev) for an item icon illustrations."
            else if (type === "character") systemInstruction = "You create detailed prompts, suiting the style of the Stable Diffusion 1.5 Model 'Anything V3' for a character portrait." //* Character systemInstruction

            const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: systemInstruction
            });

            if (type === "weapon") {
                result = await model.generateContent({
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: "Create a weapon that aligns with one corner, is usable for an emoji/ icon, is icon illustrared, the background transparent, fantasy style, illustration, non-realistic art style, not realistic",
                                },
                                {
                                    text: userprompt
                                },
                                {
                                    text: "Create a prompt for an illustrated fantasy rpg weapon"
                                }
                            ],
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: 512
                    }
                })
                return result.response.text();
            } else if (type === "armor") {
                result = await model.generateContent({
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: "Create a set of armor, including a helmet/ hat/ hodd, a chestplate/ robe/ vest/ cuirass, a pair of vambraces/ gloves/ gauntlet and a pair of boots. It should be usable for an emoji/ icon, is icon illustrared, the background transparent, fantasy style, illustration, non-realistic art style, not realistic",
                                },
                                {
                                    text: userprompt,
                                },
                                {
                                    text: "Create one detailed prompt for each armor piece for an illustrated fantasy rpg armor set and format it to JSON format, with the key being the armor piece, each named 'helmet', 'chestplate', 'vambrace', 'boots', and the value being the prompt. The armor set should be named earlier. Exclude the '```json' and '```' from the response.",
                                },
                                {
                                    text: "All armor pieces's prompts should be very detailed and should be usable for emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic."
                                },
                                {
                                    text: "All prompts need to have a transparent background and non realistic illustration style"
                                },
                                {
                                    text: "The pair of gloves/ vambraces should not have fingers visible, only armor. Helmets should also just have the armor helmet and no kind of face."
                                },
                                {
                                    text: "Create a prompt for an illustrated fantasy rpg armor set"
                                }
                            ],
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: 2048,
                        temperature: 0.4
                    }
                })
                return result.response.text();
            } else if (type === "ring") {
                result = await model.generateContent({
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: "Create a ring that is slightly tilted to the right, is usable for an emoji/ icon, is icon illustrared, the background transparent, fantasy style, illustration, non-realistic art style, not realistic",
                                },
                                {
                                    text: userprompt,
                                },
                                {
                                    text: "Create a prompt for an illustrated fantasy rpg ring"
                                }
                            ],
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: 512
                    }
                })
                return result.response.text();
            } else if (type === "custom") {
                result = await model.generateContent({
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: "Create an item that is usable for an emoji/ icon, is icon illustrared, the background transparent, fantasy style, illustration, non-realistic art style, not realistic",
                                },
                                {
                                    text: userprompt,
                                },
                                {
                                    text: "Create a prompt for an illustrated fantasy rpg item icon"
                                }
                            ],
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: 512
                    }
                })
                return result.response.text();
            } else if (type === "character") { //* Character Prompt
                result = await model.generateContent({
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: userprompt
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: 2048
                    }
                })
                return result.response.text();
            }
        }

        let armorPrompts: ArmorPrompts; let prompt: string = userprompt ?? "";

        // Create Images
        async function main() {

            const runware = new Runware({ apiKey: config.runware.apiKey });
            let images: any[] = []; 

            if (subcommand === "item") {
                if (stats.image_credits <= 0) return interaction.editReply("You don't have any image credits left.");
                if (enhancePrompt) prompt = await getPrompt(); 

                if (type === "weapon" || type === "ring" || type === "custom") {
                    images = await runware.requestImages({
                        positivePrompt: prompt,
                        model: "runware:101@1",
                        numberResults: 3,
                        negativePrompt: "",
                        height: 512,
                        width: 512,
                        outputFormat: output,
                    });

                } else {
                    if (prompt) armorPrompts = parseArmorPrompts(prompt); // No idea why I have to check this

                    let armorImagesHelmet = await runware.requestImages({
                        positivePrompt: armorPrompts.helmet,
                        model: "runware:101@1",
                        numberResults: 1,
                        negativePrompt: "",
                        height: 512,
                        width: 512,
                        outputFormat: output,
                    });
                    let armorImagesChestplate = await runware.requestImages({
                        positivePrompt: armorPrompts.chestplate,
                        model: "runware:101@1",
                        numberResults: 1,
                        negativePrompt: "",
                        height: 512,
                        width: 512,
                        outputFormat: output,
                    });
                    let armorImagesVambrace = await runware.requestImages({
                        positivePrompt: armorPrompts.vambrace,
                        model: "runware:101@1",
                        numberResults: 1,
                        negativePrompt: "",
                        height: 512,
                        width: 512,
                        outputFormat: output,
                    });
                    let armorImagesBoots = await runware.requestImages({
                        positivePrompt: armorPrompts.boots,
                        model: "runware:101@1",
                        numberResults: 1,
                        negativePrompt: "",
                        height: 512,
                        width: 512,
                        outputFormat: output,
                    });
                    images.push(...armorImagesHelmet);
                    images.push(...armorImagesChestplate);
                    images.push(...armorImagesVambrace);
                    images.push(...armorImagesBoots);

                    /* Armor Prompt Text File
                    // Create armor prompts text content
                    const armorText = `🪖 HELMET\n${armorPrompts.helmet}\n\n🛡️ CHESTPLATE\n${armorPrompts.chestplate}\n\n🧤 VAMBRACE\n${armorPrompts.vambrace}\n\n👢 BOOTS\n${armorPrompts.boots}`;
                    // Create a Buffer from the text content
                    const textBuffer = Buffer.from(armorText, 'utf-8');
                    // Create the attachment
                    const attachment = new AttachmentBuilder(textBuffer, { name: 'armor_prompts.txt' });
                    */

                }
                await interaction.editReply({
                    content: `**Prompt: ** ${userprompt}`,
                    files: images.map((img: { imageURL: any; }) => img.imageURL)
                });

                updateUsers(interaction.user.id, { image_credits: { type: 'increment', value: -1 } });

                return images;
            } else if (subcommand === "character") {
                if (stats.image_credits <= 0) return interaction.editReply("You don't have any image credits left.");
                if (enhancePrompt) prompt = await getPrompt(); 
                
                images = await runware.requestImages({
                    positivePrompt: prompt,
                    model: "civitai:66@75", // Anything V3
                    numberResults: 3,
                    negativePrompt: "",
                    width: 576,
                    height: 896,
                    outputFormat: output,
                });

                await interaction.editReply({
                    content: `**Prompt: ** ${prompt}`,
                    files: images.map((img: { imageURL: any; }) => img.imageURL)
                });
                updateUsers(interaction.user.id, { image_credits: { type: 'increment', value: -1 } });
                
                return images;
            } else if (subcommand === "balance") { // Image Credits Balance
                //let thumbnail = characters[stats.chars[Math.floor(Math.random() * stats.chars.length)]].image || "https://i.imgur.com/Ta2YDBN.png";
                //if (stats.favchar !== null) thumbnail = characters[stats.favchar].getImage(stats.premium, "", stats.char_skin[stats.favchar]);
        
                const Embed = new EmbedBuilder()
                    .setColor(0xbbffff)
                    .setAuthor({ name: `${interaction.user.username}'s Credit Balance`, iconURL: interaction.user.displayAvatarURL({ size: 1024 }) })
                    //.setThumbnail(thumbnail)
                    .setDescription(`**Image Credits**: \`${formatNumberWithQuotes(stats.image_credits)}\`<:coins:872926669055356939>`) //! Image Credits Icon
                    .setFooter({ text: `You can buy more image credits in the /monthly shop or /shop for jades` });
                await interaction.editReply({ embeds: [Embed] });
            }
        }
        main().catch(console.error);
    }
}

export default exportCommand;