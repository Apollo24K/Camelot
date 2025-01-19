const { OpenAI } = require('openai');
const { Runware } = require('@runware/sdk-js');
import { SlashCommand } from '../types';
import config from '../config.json';


const exportCommand: SlashCommand = {
    name: 'rings',
    async execute({ interaction }) {
        // Defer the reply immediately to prevent timeout
        await interaction.deferReply();
        
        let userPrompt = interaction.options.getString('userprompt');
        let assistantPrompt = interaction.options.getString('assistantprompt');
        let devPrompt = interaction.options.getString('devprompt');
        // Add check for userPrompt
        if (!userPrompt) userPrompt = "";
        if (!assistantPrompt) assistantPrompt = "";
        if (!devPrompt) devPrompt = "";
        
        // Initialize OpenAI client
        const client = new OpenAI({
            apiKey: config.openai.apiKey
        });
        
        async function getPrompt() {
            const completion = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { "role": "developer", "content": "You create prompts for icon illustration"},
                    { "role": "developer", "content": devPrompt },
                    { "role": "user", "content": "The ring needs to be slightly tilted to the right, usable for an emoji/ icon, icon illustrated, the background transparent, fantasy style, illustration, non-realistic art style, not realistic"},
                    { "role": "user", "content": userPrompt },
                    { "role": "assistant", "content": assistantPrompt },
                    { "role": "user", "content": "create a prompt for an illustrated fantasy rpg ring" },
                ],
                max_tokens: 512
            });

            return completion.choices[0].message.content;
        }
        
        async function main() {
            console.log("Starting...");
            const runware = new Runware({ apiKey: config.runware.apiKey });
            // await runware.connect();
        
            const prompt = await getPrompt();
        
            const images = await runware.requestImages({
                positivePrompt: prompt,
                model: "runware:101@1",
                numberResults: 3,
                negativePrompt: "",
                height: 512,
                width: 512,
            });
        
            // const images = await runware.imageInference(requestImage);

            for (const image of images) {
                console.log(image.imageURL);
            }

            // Update the reply to format the URLs properly
            const imageUrls = images.map((img: { imageURL: any; }) => img.imageURL).join('\n');
/*            if (interaction.channel?.isTextBased() && 'send' in interaction.channel) {
                interaction.channel.send({ 
                    content: `**Prompt:** ${prompt}`,
                    files: images.map((img: { imageURL: any; }) => img.imageURL)
                });
            }*/
            await interaction.editReply({ 
                content: `**Prompt:** ${prompt}`,
                files: images.map((img: { imageURL: any; }) => img.imageURL)
            });
            return images;
        }
        main().catch(console.error);
    }
}

export default exportCommand;
