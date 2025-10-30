import { Client } from "discord.js";
import { BotHandler } from "../types";
import { AutoPoster } from 'topgg-autoposter';
import { RankTopClient } from '@rank-top/sdk';

const handler: BotHandler = {
    name: "Autoposter",
    execute: async (client: Client) => {

        // Only if Camelot
        if (process.env.CLIENT_ID === "706183309943767112") {

            // POST bot stats to top.gg
            const ap = AutoPoster(process.env.TOPGG_TOKEN, client);
            ap.on('posted', (stats) => {
                console.log(`Posted stats to Top.gg | ${stats.serverCount} servers`);
            });

            // POST bot stats to rank.top
            const rankTop = new RankTopClient({
                apiKey: process.env.RANK_API_KEY
            });
            rankTop.startAutopost({
                client: client,
                authorization: process.env.RANK_AUTH
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
