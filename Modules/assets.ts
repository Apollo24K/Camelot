import fsp from 'fs/promises';
import sharp from 'sharp';
import { loadImage, Image } from '@napi-rs/canvas';

const assetCache = new Map<string, { image?: Image; timer: NodeJS.Timeout; }>();
const msCached = 5 * 60 * 1000;

// New cache for GIF frames
const gifFramesCache = new Map<string, { frames: Image[]; timer: NodeJS.Timeout; }>();
const msGifCached = 5 * 60 * 1000;

export class Asset {
    private _name: string;
    private _type: string;
    private _path: string;
    private _url: string;
    private _alt: string;
    private _fallback?: Asset | 0;
    private _id: number;

    private static readonly ULTIMATE_FALLBACK_URL = "https://i.ibb.co/RCMKPVq/fallback.png";
    private static readonly ULTIMATE_FALLBACK_PATH = "Images/error/fallback.png"; // Or a relevant local path

    constructor({ name, type, path, url, alt, fallback, id }: { name?: string, type?: string, path: string, url: string, alt?: string, fallback?: Asset | 0, id?: number; }) {
        this._name = name ?? "Unnamed Asset";
        this._type = type ?? "Asset";
        this._path = path;
        this._url = url;
        this._alt = alt ?? "couldn't load image";
        // The default fallback will itself have _fallback = 0, meaning it will use the ULTIMATE_FALLBACK_URL if it fails.
        this._fallback = fallback ?? new Asset({
            name: "default fallback",
            type: "fallback",
            path: Asset.ULTIMATE_FALLBACK_PATH,
            url: Asset.ULTIMATE_FALLBACK_URL,
            fallback: 0
        });
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
    get fallback() { // type: Asset | 0
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

    private static async loadUltimateFallbackImage(): Promise<Image> {
        const cached = assetCache.get(Asset.ULTIMATE_FALLBACK_URL);
        if (cached?.image) {
            clearTimeout(cached.timer);
            cached.timer = setTimeout(() => assetCache.delete(Asset.ULTIMATE_FALLBACK_URL), msCached);
            return cached.image;
        };
        try {
            const image = await loadImage(Asset.ULTIMATE_FALLBACK_URL);
            assetCache.set(Asset.ULTIMATE_FALLBACK_URL, { image, timer: setTimeout(() => assetCache.delete(Asset.ULTIMATE_FALLBACK_URL), msCached) });
            return image;
        } catch (e) {
            console.error(`CRITICAL: Ultimate fallback image (${Asset.ULTIMATE_FALLBACK_URL}) failed to load.`, e);
            // As a very last resort, you might want to throw or return a pre-defined minimal error image
            // For now, rethrowing to indicate a severe failure.
            throw new Error(`Ultimate fallback (${Asset.ULTIMATE_FALLBACK_URL}) failed: ${e instanceof Error ? e.message : String(e)}`);
        };
    };

    async loadImage(): Promise<Image> {
        let image: Image;

        try { // Try loading from local path first
            const cached = assetCache.get(this.path);
            if (cached?.image) {
                image = cached.image;
                clearTimeout(cached.timer);
                cached.timer = setTimeout(() => assetCache.delete(this.path), msCached);
                return image;
            } else {
                image = await loadImage(this.path);
                assetCache.set(this.path, { image, timer: setTimeout(() => assetCache.delete(this.path), msCached) });
                return image;
            };
        } catch {
            try { // Try loading from URL if local path fails
                const cached = assetCache.get(this.url);
                if (cached?.image) {
                    image = cached.image;
                    clearTimeout(cached.timer);
                    cached.timer = setTimeout(() => assetCache.delete(this.url), msCached);
                    return image;
                } else {
                    image = await loadImage(this.url);
                    assetCache.set(this.url, { image, timer: setTimeout(() => assetCache.delete(this.url), msCached) });
                    return image;
                };
            } catch { // All attempts to load current asset failed, try fallback
                if (this._fallback instanceof Asset) {
                    try {
                        image = await this._fallback.loadImage();
                        return image;
                    } catch (fallbackError) {
                        // Fallback asset also failed, proceed to ultimate fallback
                        // console.warn(`Fallback asset ${this._fallback.name} also failed. Error: ${fallbackError}`);
                        image = await Asset.loadUltimateFallbackImage();
                        return image;
                    };
                } else { // _fallback is 0 (terminal) or undefined (should not happen with new constructor)
                    image = await Asset.loadUltimateFallbackImage();
                    return image;
                };
            };
        };
    };

    async loadImageArray(forceStatic: boolean = false): Promise<Image[]> {
        const frames: Image[] = [];

        // For non-GIFs or when static image is forced
        if (this.fileType !== "gif" || forceStatic) {
            try {
                const frame = await this.loadImage(); // Uses the already improved loadImage with fallbacks
                frames.push(frame);
            } catch (e) {
                // If loadImage fails (even after its own fallbacks), try the ultimate fallback
                // console.warn(`loadImage failed for static/non-gif ${this.name}, resorting to ultimate fallback. Error: ${e}`);
                frames.push(await Asset.loadUltimateFallbackImage());
            }
            return frames;
        };

        // Handle GIFs
        // Try cache for processed GIF frames first
        const cacheKey = this.path || this.url; // Prefer path, fallback to URL for cache key
        const cachedGif = gifFramesCache.get(cacheKey);
        if (cachedGif) {
            clearTimeout(cachedGif.timer);
            cachedGif.timer = setTimeout(() => gifFramesCache.delete(cacheKey), msGifCached);
            return cachedGif.frames;
        };

        let buffer: Buffer | undefined;
        try {
            buffer = await fsp.readFile(this.path);
        } catch {
            try {
                // Ensure fetch is available in your environment (e.g., Node 18+ or use 'node-fetch')
                // const fetch = (await import('node-fetch')).default; // Uncomment if needed for older Node
                const response = await fetch(this.url);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    buffer = Buffer.from(arrayBuffer);
                } else {
                    // Buffer not obtained from URL, proceed to fallback logic below
                }
            } catch (fetchError) {
                // Fetching buffer from URL failed, proceed to fallback logic below
                // console.warn(`Fetching GIF buffer from URL ${this.url} failed for ${this.name}. Error: ${fetchError}`);
            };
        };

        if (buffer) {
            try {
                const metadata = await sharp(buffer, { animated: true }).metadata();
                if (metadata.pages && metadata.pages > 0) {
                    for (let i = 0; i < metadata.pages; i++) {
                        const frameBuffer = await sharp(buffer, { page: i }).png().toBuffer();
                        const img = new Image();
                        img.src = frameBuffer; // Using napi-rs/canvas Image
                        frames.push(img);
                    }
                    gifFramesCache.set(cacheKey, { frames, timer: setTimeout(() => gifFramesCache.delete(cacheKey), msGifCached) });
                } else { // Not actually animated or no pages, load as single image
                    const frame = await this.loadImage(); // Fallback to single image loading logic
                    frames.push(frame);
                }
            } catch (sharpError) {
                // console.warn(`Sharp processing failed for ${this.name}. Error: ${sharpError}. Falling back.`);
                // If sharp fails, attempt to load as a single static image (which has its own fallbacks)
                try {
                    frames.push(await this.loadImage());
                } catch {
                    frames.push(await Asset.loadUltimateFallbackImage());
                };
            };
        } else { // Buffer could not be obtained from path or URL
            if (this._fallback instanceof Asset) {
                try {
                    return await this._fallback.loadImageArray(forceStatic);
                } catch {
                    frames.push(await Asset.loadUltimateFallbackImage()); // Fallback's loadImageArray failed
                }
            } else { // No specific fallback asset, or it's the terminal fallback
                frames.push(await Asset.loadUltimateFallbackImage());
            };
        };

        // Ensure frames are never empty if possible
        if (frames.length === 0) {
            // console.warn(`loadImageArray for ${this.name} resulted in empty frames, adding ultimate fallback.`);
            frames.push(await Asset.loadUltimateFallbackImage());
        };
        return frames;
    };
};
