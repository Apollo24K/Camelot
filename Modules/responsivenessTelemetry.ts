import { AsyncLocalStorage } from 'node:async_hooks';
import { performance } from 'node:perf_hooks';

type Fields = Record<string, string | number | boolean | undefined>;
type Trace = {
    id: number; started: number; command: string; kind: string; ackMs?: number; visibleMs?: number;
    dbCalls: number; dbMs: number; poolWaitMs: number; poolWaitSamples: number; failed?: boolean;
};
const context = new AsyncLocalStorage<Trace>();
const traces = new WeakMap<object, Trace>();
let sequence = 0;

// One process-wide log budget; no IDs, tokens, SQL, options or message content.
export function createTelemetrySink(write: (line: string) => void, now = Date.now, limit = 60) {
    let windowStart = now(), emitted = 0, suppressed = 0;
    return (event: string, fields: Fields = {}) => {
        if (now() - windowStart >= 60_000) { windowStart = now(); emitted = 0; }
        if (emitted >= limit) { suppressed++; return; }
        emitted++;
        try { write(JSON.stringify({ timestamp: new Date(now()).toISOString(), event, ...fields, suppressed })); } catch { /* Logging cannot break gameplay. */ }
        suppressed = 0;
    };
}
const sink = createTelemetrySink(line => console.log(line));
export function timing(event: string, fields: Fields = {}) {
    if (process.env.CAMELOT_TIMINGS === '1' || event.endsWith('_failed')) sink(event, fields);
}
export function errorCode(error: unknown): string | number {
    const code = (error as { code?: unknown })?.code;
    return typeof code === 'number' || (typeof code === 'string' && /^[A-Z_0-9]{1,40}$/.test(code)) ? code : 'UNKNOWN';
}
export async function traceInteraction<T>(interaction: object, command: string, kind: string, work: () => Promise<T>): Promise<T> {
    const trace: Trace = { id: ++sequence, started: performance.now(), command, kind, dbCalls: 0, dbMs: 0, poolWaitMs: 0, poolWaitSamples: 0 };
    traces.set(interaction, trace);
    timing('interaction_received', { trace: trace.id, command, kind });
    return context.run(trace, async () => {
        let failed = false;
        try { return await work(); }
        catch (error) { failed = true; throw error; }
        finally {
            timing('interaction_completed', { trace: trace.id, command, kind, failed: failed || trace.failed === true, durationMs: performance.now() - trace.started,
                ackMs: trace.ackMs, visibleMs: trace.visibleMs, dbCalls: trace.dbCalls, dbMs: trace.dbMs,
                poolWaitMs: trace.poolWaitMs, poolWaitSamples: trace.poolWaitSamples });
        }
    });
}
export function markInteractionFailed(error: unknown) {
    const trace = context.getStore();
    if (trace) trace.failed = true;
    timing('interaction_failed', { trace: trace?.id, command: trace?.command, code: errorCode(error) });
}
export function markAcknowledged(interaction: object) {
    const trace = traces.get(interaction);
    if (!trace || trace.ackMs !== undefined) return;
    trace.ackMs = performance.now() - trace.started;
    timing('interaction_acknowledged', { trace: trace.id, command: trace.command, kind: trace.kind, durationMs: trace.ackMs });
}
export function markVisible(interaction: object) {
    const trace = traces.get(interaction);
    if (!trace || trace.visibleMs !== undefined) return;
    trace.visibleMs = performance.now() - trace.started;
    timing('interaction_visible', { trace: trace.id, command: trace.command, kind: trace.kind, durationMs: trace.visibleMs });
}
export function recordDatabase(durationMs: number, poolWaitMs: number | undefined, failed: boolean, waiting: number) {
    const trace = context.getStore();
    if (trace) {
        trace.dbCalls++; trace.dbMs += durationMs;
        if (poolWaitMs !== undefined) { trace.poolWaitMs += poolWaitMs; trace.poolWaitSamples++; }
    }
    if (failed || durationMs >= 250 || (poolWaitMs ?? 0) >= 100 || waiting > 0) {
        timing(failed ? 'database_operation_failed' : 'database_operation', { trace: trace?.id, command: trace?.command, durationMs, poolWaitMs, failed, waiting });
    }
}
