import WebSocket from 'ws';

type RunwareModel = "FLUX.1 (Schnell)" | "FLUX.1 (Dev)" | "Anything V3" | "PrimeMix";

type ModelParameters = {
    model: string;
    vae?: string;
    scheduler?: string;
    promptWeighting?: "compel" | "sdEmbeds";
    steps?: number;
    CFGScale?: number;
    embeddings?: {
        "model": string,
        "weight": number;
    }[];
};

const runwareModel: Record<RunwareModel, ModelParameters> = {
    "FLUX.1 (Schnell)": {
        model: "runware:100@1",
        steps: 30,
    },
    "FLUX.1 (Dev)": {
        model: "runware:101@1",
        steps: 30,
    },
    "Anything V3": {
        model: "civitai:66@75",
        steps: 30,
        CFGScale: 8,
        promptWeighting: "sdEmbeds",
        scheduler: "DPM++ 2M Karras",
        vae: "civitai:22354@88156",
    },
    "PrimeMix": {
        model: "civitai:28779@67388",
        steps: 30,
        CFGScale: 8,
        promptWeighting: "sdEmbeds",
        scheduler: "DPM++ 2M Karras",
        vae: "civitai:22354@88156",
        // vae: "avalon:101@1",
        embeddings: [
            {
                model: "civitai:7808@9536",
                weight: 1
            }
        ],
    },
};

export type GeneratedImage = {
    url: string;
    uuid: string;
};

type BackgroundRemovalOptions = {
    inputImage: string;
    outputType?: "base64Data" | "dataURI" | "URL";
    outputFormat?: "JPG" | "PNG" | "WEBP";
    outputQuality?: number;
    includeCost?: boolean;
    rgba?: [number, number, number, number];
    postProcessMask?: boolean;
    returnOnlyMask?: boolean;
    alphaMatting?: boolean;
    alphaMattingForegroundThreshold?: number;
    alphaMattingBackgroundThreshold?: number;
    alphaMattingErodeSize?: number;
};

type PendingTask = {
    resolve: (result: any) => void,
    images: GeneratedImage[],
    expected: number,
    type: 'imageInference' | 'imageBackgroundRemoval';
};

class RunwareDirectApi {
    private ws: WebSocket | null = null;
    private connectionSessionUUID: string | null = null;
    private apiKey: string;
    private pendingTasks: Map<string, PendingTask> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 3;
    private isConnecting: Promise<void> | null = null;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    };

    private async connect(): Promise<void> {
        if (this.isConnecting) return this.isConnecting;

        if (this.ws?.readyState === WebSocket.OPEN) return;

        this.isConnecting = new Promise((resolve, reject) => {
            this.ws = new WebSocket('wss://ws-api.runware.ai/v1');

            this.ws.onopen = () => {
                this.authenticate().then(() => {
                    this.isConnecting = null;
                    resolve();
                }).catch(reject);
            };

            this.ws.onmessage = (event) => {
                const response = JSON.parse(event.data.toString());

                if (response.data) {
                    for (const result of response.data) {
                        if (result.taskType === 'authentication') {
                            this.connectionSessionUUID = result.connectionSessionUUID;
                        } else {
                            const task = this.pendingTasks.get(result.taskUUID);
                            if (task) {
                                if (task.type === 'imageInference') {
                                    task.images.push({
                                        url: result.imageURL,
                                        uuid: result.imageUUID
                                    });
                                    if (task.images.length === task.expected) {
                                        task.resolve(task.images);
                                        this.pendingTasks.delete(result.taskUUID);
                                    }
                                } else if (task.type === 'imageBackgroundRemoval') {
                                    task.resolve(result);
                                    this.pendingTasks.delete(result.taskUUID);
                                }
                            }
                        }
                    }
                } else if (response.errors) {
                    console.error('Runware API Error:', response.errors);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
                reject(error);
            };

            this.ws.onclose = () => {
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    this.connect();
                }
            };
        });

        return this.isConnecting;
    }

    private async authenticate(): Promise<void> {
        const authMessage = [{
            taskType: "authentication",
            apiKey: this.apiKey,
            ...(this.connectionSessionUUID && { connectionSessionUUID: this.connectionSessionUUID })
        }];

        this.ws?.send(JSON.stringify(authMessage));
    }

    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    async uploadVaeModel({
        name,
        version,
        downloadUrl,
        uniqueIdentifier,
        architecture = "sdxl",  // or other supported architecture
        isPrivate = true,
        description = "",
    }: {
        name: string;
        version: string;
        downloadUrl: string;
        uniqueIdentifier: string;
        architecture?: "flux1d" | "flux1s" | "pony" | "sd1x" | "sdhyper" | "sd1xlcm" | "sd3" | "sdxl" | "sdxldistilled" | "sdxlhyper" | "sdxllcm" | "sdxllightning" | "sdxlturbo";
        isPrivate?: boolean;
        description?: string;
    }): Promise<string> {
        try {
            await this.connect();

            const taskUUID = this.generateUUID();

            const airId = 101; // Date.now()

            const request = [{
                taskType: "modelUpload",
                taskUUID,
                category: "vae",  // Specify that we're uploading a VAE
                architecture,
                format: "safetensors",  // Most VAEs are in safetensors format
                air: `${process.env.RUNWARE_SOURCE}:${airId}@1`,
                uniqueIdentifier,
                name,
                version,
                downloadUrl,
                private: isPrivate,
                shortDescription: description,
            }];

            return new Promise((resolve, reject) => {
                let modelAir: string | null = null;

                this.pendingTasks.set(taskUUID, {
                    resolve: (result: any) => {
                        if (result.status === "ready") {
                            resolve(modelAir || result.air);
                        } else if (result.air && !modelAir) {
                            modelAir = result.air;
                        }
                    },
                    images: [],
                    expected: 1,
                    type: 'imageInference'
                });

                this.ws?.send(JSON.stringify(request));
            });
        } catch (error) {
            console.error('Error uploading VAE model:', error);
            throw error;
        }
    };

    async generateImages({
        prompt,
        negativePrompt,
        outputFormat = "JPG",
        model = "FLUX.1 (Dev)",
        numberOfImages = 1,
        width = 512,
        height = 512,
        steps = 20,
        CFGScale
    }: {
        prompt: string,
        negativePrompt?: string,
        /**
         * JPG, PNG, WebP
         * @default "JPG"
         */
        outputFormat?: "JPG" | "PNG" | "WEBP";
        /**
         * @default "FLUX.1 (Dev)"
         */
        model?: RunwareModel;
        /**
         * Number of images to generate
         * @default 1
         */
        numberOfImages?: number;
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
    }): Promise<GeneratedImage[]> {
        try {
            await this.connect();

            const taskUUID = this.generateUUID();
            const selectedModel = runwareModel[model];

            const request = [{
                taskType: "imageInference",
                taskUUID,
                outputFormat,
                positivePrompt: prompt,
                negativePrompt,
                height,
                width,
                model: selectedModel.model,
                steps: selectedModel.steps ?? steps,
                CFGScale: selectedModel.CFGScale ?? CFGScale,
                numberResults: numberOfImages,
                ...(selectedModel.scheduler && { scheduler: selectedModel.scheduler }),
                ...(selectedModel.promptWeighting && { promptWeighting: selectedModel.promptWeighting }),
                ...(selectedModel.vae && { vae: selectedModel.vae }),
                ...(selectedModel.embeddings && { embeddings: selectedModel.embeddings })
            }];

            return new Promise((resolve) => {
                this.pendingTasks.set(taskUUID, {
                    resolve,
                    images: [],
                    expected: numberOfImages,
                    type: 'imageInference'
                });

                this.ws?.send(JSON.stringify(request));
            });
        } catch {
            return [];
        };
    };

    async removeBackground({
        inputImage,
        outputType = "URL",
        outputFormat = "PNG",
        outputQuality = 95,
        includeCost = false,
        rgba,
        postProcessMask = false,
        returnOnlyMask = false,
        alphaMatting = false,
        alphaMattingForegroundThreshold = 240,
        alphaMattingBackgroundThreshold = 10,
        alphaMattingErodeSize = 10
    }: BackgroundRemovalOptions): Promise<{
        url?: string;
        base64Data?: string;
        dataURI?: string;
        uuid: string;
        inputUuid: string;
        cost?: number;
    }> {
        try {
            await this.connect();

            const taskUUID = this.generateUUID();

            const request = [{
                taskType: "imageBackgroundRemoval",
                taskUUID,
                inputImage,
                outputType,
                outputFormat,
                outputQuality,
                includeCost,
                ...(rgba && { rgba }),
                postProcessMask,
                returnOnlyMask,
                alphaMatting,
                alphaMattingForegroundThreshold,
                alphaMattingBackgroundThreshold,
                alphaMattingErodeSize
            }];

            return new Promise((resolve) => {
                this.pendingTasks.set(taskUUID, {
                    resolve: (result) => {
                        resolve({
                            url: result.imageURL,
                            base64Data: result.imageBase64Data,
                            dataURI: result.imageDataURI,
                            uuid: result.imageUUID,
                            inputUuid: result.inputImageUUID,
                            cost: result.cost
                        });
                    },
                    images: [],
                    expected: 1,
                    type: 'imageBackgroundRemoval'
                });

                this.ws?.send(JSON.stringify(request));
            });
        } catch (error) {
            console.error('Error removing background:', error);
            throw error;
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        };
    };
};

export const runwareApi = new RunwareDirectApi(process.env.RUNWARE_API_KEY);
export const generateImages = runwareApi.generateImages.bind(runwareApi);
export const removeBackground = runwareApi.removeBackground.bind(runwareApi);


// Model Upload Usage
async function uploadVae() {
    // console.log("Uploading VAE model...");

    const vaeAir = await runwareApi.uploadVaeModel({
        name: "OriginalAnythingV3VAE",
        version: "1.0",
        downloadUrl: "https://huggingface.co/ckpt/anything-v3.0/resolve/main/Anything-V3.0.vae.pt",
        uniqueIdentifier: "f921fb3f29891d2a77a6571e56b8b5052420d2884129517a333c60b1b4816cdf",
        architecture: "sd1x",
        description: "A custom VAE for better image quality"
    });
};
// uploadVae();
