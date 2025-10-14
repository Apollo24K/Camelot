import { Worker } from 'node:worker_threads';
import os from 'os';

export default class WorkerPool {
    private _workerScript: string;
    private _numWorkers: number;
    private _workers: Worker[];
    private _queue: any[];

    constructor(workerScript: string, numWorkers: number = Math.max(1, os.cpus().length - 1)) {
        this._workerScript = workerScript;
        this._numWorkers = numWorkers;
        this._workers = [];
        this._queue = [];
        this.init();
    };

    get workerScript() {
        return this._workerScript;
    };
    get numWorkers() {
        return this._numWorkers;
    };
    get workers() {
        return this._workers;
    };
    get queue() {
        return this._queue;
    };

    init() {
        for (let i = 0; i < this.numWorkers; i++) {
            const worker = new Worker(this.workerScript, { workerData: { type: 'module' } });
            worker.on('message', this.createMessageHandler(worker));
            worker.on('error', this.createErrorHandler(worker));
            this.workers.push(worker);
        };
    };

    createMessageHandler(worker: any) {
        return (message: any) => {
            worker.currentTask.resolve(message);
            worker.currentTask = null;
            worker.busy = false;
            this.processQueue();
        };
    };

    createErrorHandler(worker: any) {
        return (error: any) => {
            if (worker.currentTask) {
                worker.currentTask.reject(error);
                worker.currentTask = null;
                worker.busy = false;
            }
            this.processQueue();
        };
    };

    runTask(data: any): any {
        return new Promise((resolve, reject) => {
            const task = { data, resolve, reject };
            this.queue.push(task);
            this.processQueue();
        });
    };

    processQueue() {
        const availableWorker = this.workers.find((worker: any) => !worker.busy);
        if (availableWorker && this.queue.length > 0) {
            const task = this.queue.shift();
            // @ts-ignore
            availableWorker.busy = true;
            // @ts-ignore
            availableWorker.currentTask = task;
            availableWorker.postMessage(task.data);
        };
    };

    close() {
        this.workers.forEach(worker => worker.terminate());
    };
};
