import type { Message, MessageEditOptions } from 'discord.js';
import { performance } from 'node:perf_hooks';
import { errorCode, timing } from './responsivenessTelemetry';

type Snapshot<T> = { value: T; key: string; received: number; attempts: number; final: boolean; };
type RendererOptions = { delayMs?: number; command?: string; now?: () => number; };

/** Replaceable visual state only. Never enqueue gameplay actions or reward writes here. */
export class CoalescingRenderer<T> {
    private pending?: Snapshot<T>;
    private active?: Snapshot<T>;
    private lastKey?: string;
    private timer?: ReturnType<typeof setTimeout>;
    private terminal = false;
    private disposed = false;
    private finalPromise?: Promise<boolean>;
    private settleFinal?: (success: boolean) => void;
    private coalesced = 0;
    private deduplicated = 0;
    private readonly now: () => number;
    private readonly delayMs: number;

    constructor(private readonly edit: (value: T) => Promise<unknown>, private readonly options: RendererOptions = {}) {
        this.now = options.now ?? (() => performance.now());
        // UX coalescing window (not a Discord quota, discord.js owns HTTP backoff).
        this.delayMs = options.delayMs ?? 200;
    }

    request(value: T): void {
        if (this.terminal || this.disposed) return;
        this.enqueue(value, false);
    }

    finish(value: T): Promise<boolean> {
        if (this.finalPromise) return this.finalPromise;
        if (this.disposed) return Promise.resolve(false);
        this.terminal = true;
        this.finalPromise = new Promise(resolve => { this.settleFinal = resolve; });
        this.enqueue(value, true);
        return this.finalPromise;
    }

    dispose(): void {
        this.disposed = true;
        this.clearTimer();
        this.pending = undefined;
        this.lastKey = undefined;
        this.settleFinal?.(false);
        this.settleFinal = undefined;
    }

    get state() { return { inFlight: !!this.active, pending: this.pending ? 1 : 0, closed: this.terminal || this.disposed }; }

    private enqueue(value: T, final: boolean) {
        // Snapshot mutable EmbedBuilder/row builders now, before another turn mutates them.
        const key = JSON.stringify(value);
        if (this.pending?.key === key && !final) { this.deduplicated++; return; }
        if (!this.active && this.lastKey === key) {
            this.pending = undefined;
            this.clearTimer();
            this.deduplicated++;
            if (final) this.complete(true);
            return;
        }
        if (this.pending) this.coalesced++;
        this.pending = { value: JSON.parse(key), key, final, received: this.now(), attempts: 0 };
        // Replacements do not postpone the first pending deadline.
        if (final) this.clearTimer();
        if (!this.active && !this.timer) {
            if (final) void this.drain();
            else this.timer = setTimeout(() => { this.timer = undefined; void this.drain(); }, this.delayMs);
        }
    }

    private clearTimer() { if (this.timer) clearTimeout(this.timer); this.timer = undefined; }

    private complete(success: boolean) {
        this.settleFinal?.(success);
        this.settleFinal = undefined;
        this.dispose();
    }

    private async drain(): Promise<void> {
        if (this.active || this.disposed || !this.pending) return;
        const snapshot = this.pending;
        this.pending = undefined;
        if (snapshot.key === this.lastKey) {
            this.deduplicated++;
            if (snapshot.final) this.complete(true);
            return;
        }
        this.active = snapshot;
        const started = this.now();
        let success = false;
        try {
            await this.edit(snapshot.value);
            success = true;
            this.lastKey = snapshot.key;
        } catch (error) {
            const status = (error as { status?: number; })?.status;
            const code = errorCode(error);
            timing('battle_render_failed', { command: this.options.command, code, final: snapshot.final });
            if ([10003, 10008, 50001, 50013].includes(Number(code))) this.dispose();
            // No application retries for 429/permissions/deleted messages. discord.js handles rate limits.
            // A single retry of an idempotent edit is safe on a transient transport/server failure.
            const transient = (status !== undefined && status >= 500 && status < 600) ||
                ['ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'UND_ERR_CONNECT_TIMEOUT'].includes(String(code));
            if (transient && snapshot.attempts === 0 && !this.pending && !this.disposed) {
                snapshot.attempts++;
                this.pending = snapshot;
            }
        } finally {
            this.active = undefined;
            timing('battle_render', {
                command: this.options.command, success, final: snapshot.final,
                queueMs: started - snapshot.received, editMs: this.now() - started,
                visibleMs: this.now() - snapshot.received, coalesced: this.coalesced, deduplicated: this.deduplicated, pending: this.pending ? 1 : 0
            });
            this.coalesced = 0; this.deduplicated = 0;
        }
        if (this.disposed) return;
        if (snapshot.final && this.pending !== snapshot) { this.complete(success); return; }
        if (this.pending) {
            const delay = this.pending.attempts ? this.delayMs : Math.max(0, this.delayMs - (this.now() - this.pending.received));
            if (this.pending.final && !this.pending.attempts) void this.drain();
            else this.timer = setTimeout(() => { this.timer = undefined; void this.drain(); }, delay);
        }
    }
}

export function createBattleRenderer(message: Pick<Message, 'edit'>, command: string) {
    return new CoalescingRenderer<MessageEditOptions>(snapshot => message.edit(snapshot), { command });
}
