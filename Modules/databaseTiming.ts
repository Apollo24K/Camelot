import type { PoolClient } from 'pg';
import { performance } from 'node:perf_hooks';
import { recordDatabase } from './responsivenessTelemetry';

type ClientPool = { connect(): Promise<PoolClient>; readonly waitingCount: number };

// Leave pg's pool.query transport/error/release behavior intact. Its duration includes
// acquisition; waitingCount is a queue-pressure sample, not an invented wait duration.
export async function measurePoolQuery<T>(pool: { readonly waitingCount: number }, work: () => Promise<T>): Promise<T> {
    const start = performance.now();
    let waiting = pool.waitingCount;
    let failed = false;
    try {
        const result = work();
        waiting = Math.max(waiting, pool.waitingCount);
        return await result;
    }
    catch (error) { failed = true; throw error; }
    finally { recordDatabase(performance.now() - start, undefined, failed, Math.max(waiting, pool.waitingCount)); }
}

// Keeps pool acquisition separate from query/transaction time. No SQL or parameters are recorded.
export async function withMeasuredClient<T>(pool: ClientPool, work: (client: PoolClient) => Promise<T>): Promise<T> {
    const start = performance.now();
    let acquired: number | undefined;
    let client: PoolClient | undefined;
    let failed = false;
    try {
        client = await pool.connect();
        acquired = performance.now();
        return await work(client);
    } catch (error) {
        failed = true;
        throw error;
    } finally {
        client?.release();
        recordDatabase(performance.now() - start, (acquired ?? performance.now()) - start, failed, pool.waitingCount);
    }
}
