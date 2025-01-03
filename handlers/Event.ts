import { Client } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { BotEvent, BotHandler } from "../types";

const handler: BotHandler = {
    name: "Event",
    execute: (client: Client) => {
        let eventsDir = join(__dirname, "../events");

        readdirSync(eventsDir).forEach(file => {
            if (!file.endsWith(".js")) return;
            let event: BotEvent = require(`${eventsDir}/${file}`).default;
            if (event.disabled) return;
            event.once ?
                client.once(event.name, (...args) => event.execute(...args))
                :
                client.on(event.name, (...args) => event.execute(...args));
        });
    },
};

export default handler;