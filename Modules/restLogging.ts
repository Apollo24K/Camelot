import { Client, RESTEvents } from "discord.js";
import { createTelemetrySink } from "./responsivenessTelemetry";

const logRest = createTelemetrySink(line => console.warn(line));
function routeKind(route: string) {
    // Do not put webhook tokens, message IDs or player IDs into logs.
    return route.includes('/messages') ? 'messages' : route.includes('/interactions') ? 'interactions'
        : route.includes('/webhooks') ? 'webhooks' : 'other';
}

export function registerRestLogging(client: Client): void {
    client.rest.on(RESTEvents.RateLimited, (info) => {
        logRest("discord_rest_rate_limited", {
            timestamp: new Date().toISOString(),
            pid: process.pid,
            method: info.method,
            routeKind: routeKind(info.route),
            global: info.global,
            scope: info.scope,
            bucket: info.hash,
            limit: info.limit,
            retryAfterMs: info.retryAfter,
            timeToResetMs: info.timeToReset,
            sublimitTimeoutMs: info.sublimitTimeout,
        });
    });

    client.rest.on(RESTEvents.Response, (request, response) => {
        if (response.status !== 429) return;

        const retryAfter = response.headers.get("retry-after");
        const retryAfterMs = retryAfter === null ? null : Number(retryAfter) * 1000;

        logRest("discord_rest_http_429", {
            timestamp: new Date().toISOString(),
            pid: process.pid,
            status: response.status,
            method: request.method,
            routeKind: routeKind(request.route),
            global: response.headers.get("x-ratelimit-global") === "true",
            scope: response.headers.get("x-ratelimit-scope") ?? undefined,
            bucket: response.headers.get("x-ratelimit-bucket") ?? undefined,
            retryAfterMs: retryAfterMs !== null && Number.isFinite(retryAfterMs) ? retryAfterMs : undefined,
        });
    });
}
