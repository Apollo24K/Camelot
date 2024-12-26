import { Worker } from 'worker_threads';
import os from 'os';

export default class WorkerPool {
    constructor(workerScript, numWorkers = os.cpus().length) {
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
            const worker = new Worker(this.workerScript);
            worker.on('message', this.createMessageHandler(worker));
            worker.on('error', this.createErrorHandler(worker));
            this.workers.push(worker);
        };
    };

    createMessageHandler(worker) {
        return (message) => {
            worker.currentTask.resolve(message);
            worker.currentTask = null;
            worker.busy = false;
            this.processQueue();
        };
    };

    createErrorHandler(worker) {
        return (error) => {
            if (worker.currentTask) {
                worker.currentTask.reject(error);
                worker.currentTask = null;
                worker.busy = false;
            }
            this.processQueue();
        };
    };

    runTask(data) {
        return new Promise((resolve, reject) => {
            const task = { data, resolve, reject };
            this.queue.push(task);
            this.processQueue();
        });
    };

    processQueue() {
        const availableWorker = this.workers.find(worker => !worker.busy);
        if (availableWorker && this.queue.length > 0) {
            const task = this.queue.shift();
            availableWorker.busy = true;
            availableWorker.currentTask = task;
            availableWorker.postMessage(task.data);
        };
    };

    close() {
        this.workers.forEach(worker => worker.terminate());
    };
};
