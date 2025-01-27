import WebSocket from 'ws';
import config from '../config.json';

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
        steps: 20,
    },
    "FLUX.1 (Dev)": {
        model: "runware:101@1",
        steps: 20,
    },
    "Anything V3": {
        model: "civitai:66@75",
        scheduler: "DPM++ 2M Karras",
        promptWeighting: "sdEmbeds",
        steps: 30,
        CFGScale: 8,
    },
    "PrimeMix": {
        model: "civitai:28779@67388",
        steps: 30,
        CFGScale: 8,
        promptWeighting: "sdEmbeds",
        scheduler: "DPM++ 2M Karras",
        // vae: "civitai:22354@88156",
        vae: "civitai:22354@88156",
        embeddings: [
            {
                model: "civitai:7808@9536",
                weight: 1
            }
        ]
    },
};

class RunwareDirectApi {
    private ws: WebSocket | null = null;
    private connectionSessionUUID: string | null = null;
    private apiKey: string;
    private pendingTasks: Map<string, {
        resolve: (result: any) => void,
        urls: string[],
        expected: number;
    }> = new Map();
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
                                task.urls.push(result.imageURL);
                                if (task.urls.length === task.expected) {
                                    task.resolve(task.urls);
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
    }): Promise<string[]> {
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
                    urls: [],
                    expected: numberOfImages
                });

                this.ws?.send(JSON.stringify(request));
            });
        } catch (error) {
            console.error('Error generating images:', error);
            return [];
        };
    };

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        };
    };
};

export const runwareApi = new RunwareDirectApi(config.runware.apiKey);
export const generateImages = runwareApi.generateImages.bind(runwareApi);
