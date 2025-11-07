import { IOutputFormat, Runware, TPromptWeighting } from "@runware/sdk-js";

const runware = new Runware({ apiKey: process.env.RUNWARE_API_KEY });

type RunwareModel = "FLUX.1 (Schnell)" | "FLUX.1 (Dev)" | "Anything V3" | "PrimeMix";

type ModelParameters = {
    model: string,
    vae?: string,
    scheduler?: string,
    promptWeighting?: TPromptWeighting,
    steps?: number,
    CFGScale?: number,
};

const runwareModel: Record<RunwareModel, ModelParameters> = {
    "FLUX.1 (Schnell)": {
        model: "runware:100@1",
        steps: 20,
    },
    "FLUX.1 (Dev)": {
        model: "runware:101@1",
        steps: 20,
    },
    "Anything V3": {
        model: "civitai:66@75",
        // vae: "civitai:276082@311162",
        scheduler: "DPM++ 2M Karras",
        promptWeighting: "sdEmbeds",
        steps: 30,
        CFGScale: 8,
    },
    "PrimeMix": {
        model: "civitai:28779@67388",
        vae: "civitai:23906@28569",
        scheduler: "DPM++ 2M Karras",
        promptWeighting: "sdEmbeds",
        steps: 30,
        CFGScale: 8,
    },
};

/**
 * @deprecated Use `generateImages` from `./Modules/runwareDirectApi.ts` instead
 */
export const generateImages = async ({ prompt, negativePrompt, outputFormat = "JPG", model = "FLUX.1 (Dev)", numberOfImages = 1, width = 512, height = 512, steps = 20, CFGScale = undefined }: {
    prompt: string,
    negativePrompt?: string,
    /**
     * JPG, PNG, WebP
     * @default "JPG"
     */
    outputFormat?: IOutputFormat;
    /**
     * @default "FLUX.1 (Dev)"
     */
    model?: RunwareModel;
    /**
     * Number of images to generate
     * @default 1
     */
    numberOfImages?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    /**
     * @default 512
     */
    width?: 512 | 576 | 768 | 1024 | 1280 | 1536 | 1792 | 2048;
    /**
     * @default 512
     */
    height?: 512 | 768 | 896 | 1024 | 1280 | 1536 | 1792 | 2048;
    /**
     * @default 20
     */
    steps?: 10 | 20 | 30 | 40 | 50;
    /**
     * @default undefined
     */
    CFGScale?: number;
}) => {
    try {
        const images = await runware.requestImages({
            positivePrompt: prompt,
            model: runwareModel[model].model,
            numberResults: numberOfImages,
            negativePrompt,
            height,
            width,
            steps: runwareModel[model].steps ?? steps,
            outputFormat,
            CFGScale: runwareModel[model].CFGScale ?? CFGScale,
            scheduler: runwareModel[model].scheduler,
            promptWeighting: runwareModel[model].promptWeighting,

            //@ts-ignore
            vae: runwareModel[model].vae,
        });

        return images ?? [];
    } catch {
        return [];
    };
};
