import { Client } from "discord.js";
import { BotHandler } from "../types";

const handler: BotHandler = {
    name: "Memory",
    once: true,
    disabled: true,
    execute: (client: Client) => {

        const period = 5, startTime = Date.now();

        // Log memory usage
        function logMemoryUsage() {
            const used = process.memoryUsage();
            const uptime = Math.floor((Date.now() - startTime) / 1000);
            console.log(
                `[${uptime}s] ` +
                // `rss: ${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB, ` +
                // `heapTotal: ${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB, ` +
                `heapUsed: ${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`
            );
        };

        // Call it periodically
        setInterval(logMemoryUsage, period * 1000);
    },
};

export default handler;
