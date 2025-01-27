import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config.json';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-8b",
    generationConfig: {
        temperature: 2,
        topP: 0.95,
    },
    // systemInstruction
});

export const generateText = async ({ chatHistory, systemInstruction, maxOutputTokens = 512 }: { chatHistory: string[]; systemInstruction?: string; maxOutputTokens?: number; }) => {
    try {
        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: chatHistory.map(message => ({ text: message || "<empty string>" })),
                },
            ],
            generationConfig: {
                maxOutputTokens
            },
            systemInstruction
        });
        return result.response.text() ?? undefined;
    } catch (err) {
        console.log(err);
        return undefined;
    };
};
