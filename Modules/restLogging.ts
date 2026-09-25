import { Client, RESTEvents } from "discord.js";

export function registerRestLogging(client: Client): void {
    client.rest.on(RESTEvents.RateLimited, (info) => {
        console.warn(JSON.stringify({
            timestamp: new Date().toISOString(),
            event: "discord_rest_rate_limited",
            pid: process.pid,
            method: info.method,
            route: info.route,
            global: info.global,
            scope: info.scope,
            bucket: info.hash,
            limit: info.limit,
            retryAfterMs: info.retryAfter,
            timeToResetMs: info.timeToReset,
            sublimitTimeoutMs: info.sublimitTimeout,
        }));
    });

    client.rest.on(RESTEvents.Response, (request, response) => {
        if (response.status !== 429) return;

        const retryAfter = response.headers.get("retry-after");
        const retryAfterMs = retryAfter === null ? null : Number(retryAfter) * 1000;

        console.warn(JSON.stringify({
            timestamp: new Date().toISOString(),
            event: "discord_rest_http_429",
            pid: process.pid,
            status: response.status,
            method: request.method,
            route: request.route,
            global: response.headers.get("x-ratelimit-global") === "true",
            scope: response.headers.get("x-ratelimit-scope"),
            bucket: response.headers.get("x-ratelimit-bucket"),
            retryAfterMs: Number.isFinite(retryAfterMs) ? retryAfterMs : null,
        }));
    });
}
