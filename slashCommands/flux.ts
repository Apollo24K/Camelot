const { OpenAI } = require('openai');
const { Runware } = require('@runware/sdk-js');
import { SlashCommand } from '../types';
import config from '../config.json';
import { AttachmentBuilder } from 'discord.js';


const exportCommand: SlashCommand = {
    name: 'flux',
    async execute({ interaction }) {


        interface ArmorPrompts {
            helmet: string;
            chestplate: string;
            vambrace: string;
            boots: string;
        }
        
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
        
        // Defer the reply immediately to prevent timeout
        await interaction.deferReply();
        
        let item = interaction.options.getString('item');
        let userPrompt = interaction.options.getString('userprompt') ?? "";
        let assistantPrompt = interaction.options.getString('assistantprompt') ?? "";
        let devPrompt = interaction.options.getString('devprompt') ?? "";
        let tokens = interaction.options.getInteger('tokens') ?? 512;
        
        // Initialize OpenAI client
        const client = new OpenAI({
            apiKey: config.openai.apiKey
        });
        
        async function getPrompt() {
            let completion;
            switch (item) {
                case 'ring':
                    completion = await client.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            { "role": "developer", "content": "You create prompts for icon illustration"},
                            { "role": "developer", "content": devPrompt },
                            { "role": "user", "content": "The ring needs to be slightly tilted to the right, usable for an emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic"},
                            { "role": "user", "content": userPrompt },
                            { "role": "assistant", "content": assistantPrompt },
                            { "role": "user", "content": "create a prompt for an illustrated fantasy rpg ring" },
                        ],
                        max_tokens: tokens
                    });
                    return completion.choices[0].message.content;
                case 'sword':
                    completion = await client.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            { "role": "developer", "content": "You create prompts for icon illustration"},
                            { "role": "developer", "content": devPrompt },
                            { "role": "user", "content": "The sword should be tilted to the one corner, usable for an emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic"},
                            { "role": "user", "content": userPrompt },
                            { "role": "assistant", "content": assistantPrompt },
                            { "role": "user", "content": "create a prompt for an illustrated fantasy rpg sword" },
                        ],
                        max_tokens: tokens
                    });
                    return completion.choices[0].message.content;
                case 'bow':
                    completion = await client.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            { "role": "developer", "content": "You create prompts for icon illustration"},
                            { "role": "developer", "content": devPrompt },
                            { "role": "user", "content": "The bow should be tilted to one corner, usable for an emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic"},
                            { "role": "user", "content": userPrompt },
                            { "role": "assistant", "content": assistantPrompt },
                            { "role": "user", "content": "create a prompt for an illustrated fantasy rpg bow" },
                        ],
                        max_tokens: tokens
                    });
                    return completion.choices[0].message.content;
                case 'staff':
                    completion = await client.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            { "role": "developer", "content": "You create prompts for icon illustration"},
                            { "role": "developer", "content": devPrompt },
                            { "role": "user", "content": "The staff should be tilted to one corner, usable for an emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic"},
                            { "role": "user", "content": userPrompt },
                            { "role": "assistant", "content": assistantPrompt },
                            { "role": "user", "content": "create a prompt for an illustrated fantasy rpg staff" },
                        ],
                        max_tokens: tokens
                    });
                    return completion.choices[0].message.content;
                case 'shield':
                    completion = await client.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            { "role": "developer", "content": "You create prompts for icon illustration"},
                            { "role": "developer", "content": devPrompt },
                            { "role": "user", "content": "The shield should be aligned with one corner, usable for an emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic"},
                            { "role": "user", "content": userPrompt },
                            { "role": "assistant", "content": assistantPrompt },
                            { "role": "user", "content": "create a prompt for an illustrated fantasy rpg shield" },
                        ],
                        max_tokens: tokens
                    });
                    return completion.choices[0].message.content;
                case 'lance':
                    completion = await client.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            { "role": "developer", "content": "You create prompts for icon illustration"},
                            { "role": "developer", "content": devPrompt },
                            { "role": "user", "content": "The lance should be aligned with one corner, usable for an emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic"},
                            { "role": "user", "content": userPrompt },
                            { "role": "assistant", "content": assistantPrompt },
                            { "role": "user", "content": "create a prompt for an illustrated fantasy rpg lance" },
                        ],
                        max_tokens: tokens
                    });
                    return completion.choices[0].message.content;
                case 'dagger':
                    completion = await client.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            { "role": "developer", "content": "You create prompts for icon illustration"},
                            { "role": "developer", "content": devPrompt },
                            { "role": "user", "content": "The dagger should be aligned with one corner, usable for an emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic"},
                            { "role": "user", "content": userPrompt },
                            { "role": "assistant", "content": assistantPrompt },
                            { "role": "user", "content": "create a prompt for an illustrated fantasy rpg dagger" },
                        ],
                        max_tokens: tokens
                    });
                    return completion.choices[0].message.content;
                case 'axe':
                    completion = await client.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            { "role": "developer", "content": "You create prompts for icon illustration"},
                            { "role": "developer", "content": devPrompt },
                            { "role": "user", "content": "The axe should be aligned with one corner, usable for an emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic"},
                            { "role": "user", "content": userPrompt },
                            { "role": "assistant", "content": assistantPrompt },
                            { "role": "user", "content": "create a prompt for an illustrated fantasy rpg axe" },
                        ],
                        max_tokens: tokens
                    });
                    return completion.choices[0].message.content;
                case 'armor':
                    completion = await client.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            { "role": "developer", "content": "You create prompts for icon illustration"},
                            { "role": "developer", "content": devPrompt },
                            { "role": "user", "content": "Create a set of armor, including a helmet/ hat/ hood, a chestplate/ robe/ vest/ cuirass, a vambrace/ gloves/ gauntlet and boots. It should be usable for emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic."},
                            { "role": "user", "content": userPrompt },
                            { "role": "assistant", "content": assistantPrompt },
                            { "role": "user", "content": "Create one detailed prompt for each armor piece for an illustrated fantasy rpg armor set and format it to JSON format, with the key being the armor piece, each named 'helmet', 'chestplate', 'vambrace', 'boots', and the value being the prompt. The armor set should be named earlier. Exclude the '```json' and '```' from the response."},
                            { "role": "user", "content": "All armor pieces's prompts should be very detailed and should be usable for emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic."},
                            { "role": "user", "content": "All prompts need to have a transparent background and non realistic illustration style"},
                            { "role": "user", "content": "Gloves/ Vambraces should not have fingers visible, only armor. Helmets should also just have the armor helmet and no kind of face."},

                        ],
                        temperature: 0.4,
                        max_tokens: tokens
                    });                    
                    return completion.choices[0].message.content
                case 'runes':
                    completion = await client.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            { "role": "developer", "content": "You create prompts for icon illustration"},
                            { "role": "developer", "content": devPrompt },
                            { "role": "user", "content": "TThe runes should be usable for an emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic"},
                            { "role": "user", "content": userPrompt },
                            { "role": "assistant", "content": assistantPrompt },
                            { "role": "user", "content": "create a prompt for illustrated fantasy rpg runes" },
                        ],
                        max_tokens: tokens
                    });
                    return completion.choices[0].message.content;
                case 'artifacts':
                    completion = await client.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            { "role": "developer", "content": "You create prompts for icon illustration"},
                            { "role": "developer", "content": devPrompt },
                            { "role": "user", "content": "The artifacts should be usable for an emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic"},
                            { "role": "user", "content": userPrompt },
                            { "role": "assistant", "content": assistantPrompt },
                            { "role": "user", "content": "create a prompt for illustrated fantasy rpg artifacts" },
                        ],
                        max_tokens: tokens
                    });
                    return completion.choices[0].message.content;
                case 'items':
                    completion = await client.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            { "role": "developer", "content": "You create prompts for icon illustration"},
                            { "role": "developer", "content": devPrompt },
                            { "role": "user", "content": "The items should be usable for an emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic"},
                            { "role": "user", "content": userPrompt },
                            { "role": "assistant", "content": assistantPrompt },
                            { "role": "user", "content": "create a prompt for an illustrated fantasy rpg item, that was named earlier" },
                        ],
                        max_tokens: tokens
                    });
                    return completion.choices[0].message.content;
                case 'own':
                    completion = await client.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [
                            // { "role": "developer", "content": "You create prompts for icon illustration"},
                            { "role": "developer", "content": devPrompt },
                            { "role": "assistant", "content": assistantPrompt },
                            { "role": "user", "content": userPrompt },
                        ],
                        max_tokens: tokens
                    });
                    return completion.choices[0].message.content;
            }
        }

        /* Prompt for each armor piece
        async function getArmorPrompt(armorPrompt: string) {
            let completionHelmet = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { "role": "developer", "content": "You create prompts for icon illustration"},
                    { "role": "developer", "content": devPrompt },
                    { "role": "user", "content": "The armor piece should be usable for an emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic"},
                    { "role": "user", "content": "create a prompt for an illustrated fantasy rpg armor helmet/ hat/ hood that is part of the armor set of the prompt: " + armorPrompt },
                ],
                max_tokens: tokens
            });
            let completionChestplate = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { "role": "developer", "content": "You create prompts for icon illustration"},
                    { "role": "developer", "content": devPrompt },
                    { "role": "user", "content": "The armor piece should be usable for an emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic"},
                    { "role": "user", "content": "create a prompt for an illustrated fantasy rpg armor chestplate/ robe/ vest/ cuirass that is part of the armor set of the prompt: " + armorPrompt },
                ],
                max_tokens: tokens
            });
            let completionVambrace = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { "role": "developer", "content": "You create prompts for icon illustration"},
                    { "role": "developer", "content": devPrompt },
                    { "role": "user", "content": "The armor piece should be usable for an emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic"},
                    { "role": "user", "content": "create a prompt for an illustrated fantasy rpg armor vambrace/ gloves/ gauntlet that is part of the armor set of the prompt: " + armorPrompt },
                ],
                max_tokens: tokens
            });
            let completionBoots = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { "role": "developer", "content": "You create prompts for icon illustration"},
                    { "role": "developer", "content": devPrompt },
                    { "role": "user", "content": "The armor piece should be usable for an emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic"},
                    { "role": "user", "content": "create a prompt for an illustrated fantasy rpg armor boots that is part of the armor set of the prompt: " + armorPrompt },
                ],
                max_tokens: tokens
            });
            return [completionHelmet.choices[0].message.content, completionChestplate.choices[0].message.content, completionVambrace.choices[0].message.content, completionBoots.choices[0].message.content];
        }
        */

        let armorPrompts: ArmorPrompts;
        async function main() {
            console.log("Starting...");
            const runware = new Runware({ apiKey: config.runware.apiKey });
            // await runware.connect();
        
            const prompt = await getPrompt();
            let images: any[] = [];
            if (item !== "armor") {
                console.log(prompt);
                images = await runware.requestImages({
                    positivePrompt: prompt,
                    model: "runware:101@1",
                    numberResults: 3,
                    negativePrompt: "",
                    height: 512,
                    width: 512,
                });
            } else {
                armorPrompts = parseArmorPrompts(prompt);
                console.log(armorPrompts);

                let armorImagesHelmet = await runware.requestImages({
                    positivePrompt: armorPrompts.helmet,
                    model: "runware:101@1",
                    numberResults: 2,
                    negativePrompt: "",
                    height: 512,
                    width: 512,
                });
                let armorImagesChestplate = await runware.requestImages({
                    positivePrompt: armorPrompts.chestplate,
                    model: "runware:101@1",
                    numberResults: 2,
                    negativePrompt: "",
                    height: 512,
                    width: 512,
                });
                let armorImagesVambrace = await runware.requestImages({
                    positivePrompt: armorPrompts.vambrace,
                    model: "runware:101@1",
                    numberResults: 2,
                    negativePrompt: "",
                    height: 512,
                    width: 512,
                });
                let armorImagesBoots = await runware.requestImages({
                    positivePrompt: armorPrompts.boots,
                    model: "runware:101@1",
                    numberResults: 2,
                    negativePrompt: "",
                    height: 512,
                    width: 512,
                });
                images.push(...armorImagesHelmet);
                images.push(...armorImagesChestplate);
                images.push(...armorImagesVambrace);
                images.push(...armorImagesBoots);
            }

            for (const image of images) console.log(image.imageURL);

            if (item === "armor") {
                
                // Create armor prompts text content
                const armorText = `🪖 HELMET\n${armorPrompts.helmet}\n\n🛡️ CHESTPLATE\n${armorPrompts.chestplate}\n\n🧤 VAMBRACE\n${armorPrompts.vambrace}\n\n👢 BOOTS\n${armorPrompts.boots}`;
                // Create a Buffer from the text content
                const textBuffer = Buffer.from(armorText, 'utf-8');
                // Create the attachment
                const attachment = new AttachmentBuilder(textBuffer, { name: 'armor_prompts.txt' });

                await interaction.editReply({
                    files: [attachment, ...images.map((img: { imageURL: any; }) => img.imageURL)]
                });
            } else {
                await interaction.editReply({
                    content: `**Prompt:** ${(item !== "armor") ? prompt : null}`,
                    files: images.map((img: { imageURL: any; }) => img.imageURL)
                });
            }
            return images;
        }
        main().catch(console.error);
    }
}

export default exportCommand;