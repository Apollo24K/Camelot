import { Client } from "discord.js";
import { BotEvent } from "../types";

const event: BotEvent = {
    name: "disconnect",
    execute: (client: Client) => {
        console.log('Bot is disconnecting...');
        console.log('ws status is ' + client?.ws?.status);

        // Wait for 15 seconds before checking the WebSocket status
        // setTimeout(() => {
        //     if(client.ws.status === 5) { // If the WebSocket is disconnected
        //         console.log('Reconnecting...');
        //         client.destroy().then(() => {
        //             client.login(config.token);
        //         });
        //     }
        // }, 15000);
    },
};

export default event;
