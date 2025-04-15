import config from '../config.json';
import { Client } from "discord.js";
import { BotHandler } from "../types";
import { AutoPoster } from 'topgg-autoposter';
import { RankTopClient } from '@rank-top/sdk';

const handler: BotHandler = {
    name: "Autoposter",
    execute: (client: Client) => {

        // Only if Camelot
        if (client.user?.id === "706183309943767112") {

            // POST bot stats to top.gg
            const ap = AutoPoster(config.topgg.token, client);
            ap.on('posted', (stats) => {
                console.log(`Posted stats to Top.gg | ${stats.serverCount} servers`);
            });

            // POST bot stats to rank.top
            const rankTop = new RankTopClient({
                apiKey: config.rank.apiKey
            });
            rankTop.startAutopost({
                client: client,
                authorization: config.rank.auth
            });
            rankTop.on("autoposter/posted", () => {
                console.log("[Rank.top] Posted stats");
            });
            rankTop.on("autoposter/error", (error) => {
                console.log("[Rank.top] Autoposter error:", error);
            });
        };

    },
};

export default handler;
