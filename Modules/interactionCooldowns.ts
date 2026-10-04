type UserWindow = { count: number; expires: number; warned: number };
export type CooldownDecision = { reason: 'user' | 'channel'; retryAfterMs: number; feedback: boolean };
const bypassedCommands = new Set(['admin', 'balance', 'buy', 'camelot', 'guess', 'info', 'item', 'mod', 'pull', 'rp', 'shop']);

export class InteractionCooldowns {
    private users = new Map<string, UserWindow>();
    private channels = new Map<string, number>();
    private nextPrune = 0;
    constructor(private readonly now = Date.now) {}

    checkUser(userId: string, command: string): CooldownDecision | undefined {
        const now = this.now();
        this.prune(now);
        let user = this.users.get(userId);
        if (!user || user.expires <= now) {
            // The original guard counts the first command even when it is bypassed.
            this.users.set(userId, { count: 1, expires: now + 7500, warned: -Infinity });
            return;
        }
        if (!bypassedCommands.has(command)) user.count++;
        if (user.count < 4) return;
        // Preserve the original reset and acceptance rules, including bypassed
        // commands at an existing count of 4, 10 or above 10.
        user.expires = now + 3200;
        if (user.count > 4 && user.count < 10) return;
        const feedback = now - user.warned >= 3200;
        if (feedback) user.warned = now;
        return { reason: 'user', retryAfterMs: 3200, feedback };
    }

    check(userId: string, command: string, channelId?: string): CooldownDecision | undefined {
        const userDecision = this.checkUser(userId, command);
        if (userDecision) return userDecision;
        if (!channelId) return;
        const now = this.now();
        const expires = this.channels.get(channelId) ?? 0;
        if (expires > now) {
            const user = this.users.get(userId)!;
            const feedback = now - user.warned >= 750;
            if (feedback) user.warned = now;
            return { reason: 'channel', retryAfterMs: expires - now, feedback };
        }
        this.channels.set(channelId, now + 750);
    }

    private prune(now: number) {
        if (now < this.nextPrune) return;
        this.nextPrune = now + 7500;
        for (const [id, value] of this.users) if (value.expires <= now) this.users.delete(id);
        for (const [id, expires] of this.channels) if (expires <= now) this.channels.delete(id);
    }
    get size() { return { users: this.users.size, channels: this.channels.size }; }
}

export function cooldownMessage(decision: CooldownDecision) {
    const seconds = Math.max(1, Math.ceil(decision.retryAfterMs / 1000));
    return decision.reason === 'channel'
        ? `This channel is busy. Please try again in ${seconds}s.`
        : `You're sending commands too quickly. Please wait ${seconds}s before trying again.`;
}
