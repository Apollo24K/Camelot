import { BotEvent } from "../types";

const event: BotEvent = {
    name: "rateLimit",
    execute: (...args) => {
        console.log("Rate limit reached", args);
    },
};

export default event;
