import { Client, DiscordAPIError, RESTJSONErrorCodes, ThreadChannel } from "discord.js";
import { query } from "../postgres";

const LOCK_DURATION = 6 * 60 * 60 * 1000;
const RETRY_DELAY = 5 * 60 * 1000;
const MAX_TIMEOUT = 2 ** 31 - 1;
const unlockTimers = new Map<string, NodeJS.Timeout>();
const threadOperations = new Map<string, Promise<void>>();
type ForumLock = { thread_id: string; unlock_at: Date; };

// Keep a new lock from racing an unlock already in flight for the same thread.
function runForThread(threadId: string, action: () => Promise<void>): Promise<void> {
    const operation = (threadOperations.get(threadId) ?? Promise.resolve()).then(action);
    const settled = operation.catch(() => {});
    threadOperations.set(threadId, settled);
    void settled.then(() => {
        if (threadOperations.get(threadId) === settled) threadOperations.delete(threadId);
    });
    return operation;
}

function scheduleUnlock(client: Client, threadId: string, unlockAt: Date, delay = unlockAt.getTime() - Date.now()): void {
    clearTimeout(unlockTimers.get(threadId));
    const timer = setTimeout(() => {
        void runForThread(threadId, async () => {
            if (unlockTimers.get(threadId) !== timer) return;

            // Recheck the persisted deadline in case it changed since the timer was loaded.
            const [lock] = await query(
                `SELECT thread_id, unlock_at FROM forum_thread_locks WHERE thread_id = $1`, [threadId]
            ) as ForumLock[];
            if (!lock) {
                unlockTimers.delete(threadId);
                return;
            }
            if (lock.unlock_at.getTime() > Date.now()) {
                scheduleUnlock(client, threadId, lock.unlock_at);
                return;
            }

            try {
                const thread = await client.channels.fetch(threadId, { force: true });
                if (thread?.isThread() && thread.locked) await thread.setLocked(false);
            } catch (error) {
                // Deleted threads need no retry; retain other failures for another attempt.
                if (!(error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownChannel)) throw error;
            }

            const result = await query(
                `DELETE FROM forum_thread_locks WHERE thread_id = $1 AND unlock_at <= NOW()`, [threadId]
            );
            if ("rowCount" in result && result.rowCount === 0) scheduleUnlock(client, threadId, lock.unlock_at, 0);
            else unlockTimers.delete(threadId);
        }).catch(error => {
            console.error(`Failed to unlock forum thread ${threadId}:`, error);
            if (unlockTimers.get(threadId) === timer) scheduleUnlock(client, threadId, unlockAt, RETRY_DELAY);
        });
    }, Math.min(MAX_TIMEOUT, Math.max(0, delay)));
    timer.unref();
    unlockTimers.set(threadId, timer);
}

export function lockForumThread(thread: ThreadChannel): Promise<void> {
    const unlockAt = new Date(Date.now() + LOCK_DURATION);
    return runForThread(thread.id, async () => {
        await query(
            `INSERT INTO forum_thread_locks (thread_id, unlock_at) VALUES ($1, $2)
             ON CONFLICT (thread_id) DO UPDATE SET unlock_at = EXCLUDED.unlock_at`,
            [thread.id, unlockAt]
        );
        scheduleUnlock(thread.client, thread.id, unlockAt);
        // The message's cached thread state may predate an unlock that just completed.
        await thread.setLocked(true);
    });
}

export async function restoreForumThreadUnlocks(client: Client): Promise<void> {
    try {
        const locks = await query(`SELECT thread_id, unlock_at FROM forum_thread_locks`) as ForumLock[];
        for (const lock of locks) {
            // A message received during startup may already have scheduled a newer deadline.
            if (!unlockTimers.has(lock.thread_id)) scheduleUnlock(client, lock.thread_id, lock.unlock_at);
        }
    } catch (error) {
        console.error("Failed to restore forum thread unlocks:", error);
        setTimeout(() => void restoreForumThreadUnlocks(client), RETRY_DELAY).unref();
    }
}
