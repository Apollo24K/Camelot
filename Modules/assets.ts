import fsp from 'fs/promises';
import sharp from 'sharp';
import { loadImage, Image } from '@napi-rs/canvas';

const assetCache = new Map();
const msCached = 5 * 60 * 1000;

export class Asset {
    private _name: string;
    private _type: string;
    private _path: string;
    private _url: string;
    private _alt: string;
    private _fallback?: Asset | 0;
    private _id: number;

    constructor({ name, type, path, url, alt, fallback, id }: { name?: string, type?: string, path: string, url: string, alt?: string, fallback?: Asset | 0, id?: number; }) {
        this._name = name ?? "Unnamed Asset";
        this._type = type ?? "Asset";
        this._path = path;
        this._url = url;
        this._alt = alt ?? "couldn't load image";
        this._fallback = fallback ?? new Asset({ name: "default fallback", type: "fallback", path: "Images/error/fallback.png", url: "https://i.ibb.co/RCMKPVq/fallback.png", fallback: 0 });
        this._id = id ?? 0;
    };

    get name() {
        return this._name;
    };
    get type() {
        return this._type;
    };
    get path() {
        return this._path;
    };
    get url() {
        return this._url;
    };
    get alt() {
        return this._alt;
    };
    get fallback() { // type: Asset
        return this._fallback;
    };
    get id() {
        return this._id;
    };
    get fileType() {
        const arr = this.path.split(".");
        return arr[arr.length - 1].toLowerCase();
    };

    set name(name) {
        this._name = name;
    };
    set type(str) {
        this._type = str;
    };
    set fallback(fallback) {
        this._fallback = fallback;
    };

    async loadImage(): Promise<Image> {
        let image: Image;

        try {
            const cached = assetCache.get(this.path);
            if (cached) {
                image = cached.image;
                clearTimeout(cached.timer);
                cached.timer = setTimeout(() => assetCache.delete(this.path), msCached);
            } else {
                image = await loadImage(this.path);
                assetCache.set(this.path, { image, timer: setTimeout(() => assetCache.delete(this.path), msCached) });
            };
        } catch {
            try {
                const cached = assetCache.get(this.url);
                if (cached) {
                    image = cached.image;
                    clearTimeout(cached.timer);
                    cached.timer = setTimeout(() => assetCache.delete(this.url), msCached);
                } else {
                    image = await loadImage(this.url);
                    assetCache.set(this.url, { image, timer: setTimeout(() => assetCache.delete(this.url), msCached) });
                };
            } catch {
                if (this.fallback) image = await this.fallback.loadImage();
                else image = await loadImage("https://i.ibb.co/RCMKPVq/fallback.png");
            };
        };

        return image;
    };

    async loadImageArray(forceStatic: boolean = false): Promise<Image[]> {
        const frames: Image[] = [];
        if (this.fileType === "gif" && !forceStatic) {
            let buffer;
            try {
                buffer = await fsp.readFile(this.path);
            } catch {
                try {
                    // const fetch = (await import('node-fetch')).default;
                    const response = await fetch(this.url);
                    if (response.ok) {
                        const arrayBuffer = await response.arrayBuffer();
                        // eslint-disable-next-line no-undef
                        buffer = Buffer.from(arrayBuffer);
                    } else {
                        if (this.fallback) {
                            const frames = await this.fallback.loadImageArray();
                            return frames;
                        } else {
                            const frame = await this.loadImage();
                            frames.push(frame);
                        };
                    };
                } catch {
                    if (this.fallback) {
                        const frames = await this.fallback.loadImageArray();
                        return frames;
                    } else {
                        const frame = await this.loadImage();
                        frames.push(frame);
                    };
                };
            };

            // Load the GIF into sharp and extract frames
            const metadata = await sharp(buffer, { animated: true }).metadata();
            if (metadata.pages) {
                for (let i = 0; i < metadata.pages; i++) {
                    const frameBuffer = await sharp(buffer, { page: i }).png().toBuffer();
                    const img = new Image();
                    img.src = frameBuffer;
                    frames.push(img);
                };
            } else {
                const frame = await this.loadImage();
                frames.push(frame);
            };
        } else {
            const frame = await this.loadImage();
            frames.push(frame);
        };

        return frames;
    };
};
