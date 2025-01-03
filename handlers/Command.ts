import { readdirSync } from "fs";
import { join } from "path";
import { Client } from "discord.js";
import { BotHandler, SlashCommand } from "../types";

const handler: BotHandler = {
    name: "Command",
    execute: (client: Client) => {
        let slashCommandsDir = join(__dirname, "../slashCommands");

        readdirSync(slashCommandsDir).forEach(file => {
            if (!file.endsWith(".js")) return;
            let command: SlashCommand = require(`${slashCommandsDir}/${file}`).default;
            client.slashCommands.set(command.name, command);
        });
    },
};

export default handler;
