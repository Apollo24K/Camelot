import config from '../config.json';
import { Client } from "discord.js";
import { BotHandler } from "../types";
import { AutoPoster } from 'topgg-autoposter';

const handler: BotHandler = {
    name: "Autoposter",
    execute: (client: Client) => {

        // POST bot stats to top.gg (only if Camelot)
        if (client.user?.id === "706183309943767112") {
            const ap = AutoPoster(config.topgg.token, client);
            ap.on('posted', (stats) => {
                console.log(`Posted stats to Top.gg | ${stats.serverCount} servers`);
            });
        };

    },
};

export default handler;
