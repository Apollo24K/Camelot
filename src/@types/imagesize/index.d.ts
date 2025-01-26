declare module 'imagesize' {
    interface ImageSize {
        width: number;
        height: number;
        type?: string;
    }

    function imagesize(
        stream: import('http').IncomingMessage,
        callback: (err: Error | null, result: ImageSize) => void
    ): void;

    export = imagesize;
} 
