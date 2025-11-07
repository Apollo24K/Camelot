import fs from 'fs';
import { join } from "path";
import { Client, GatewayIntentBits, Partials, Options, Collection } from 'discord.js';
import { SlashCommand } from './types';
import dotenv from 'dotenv';
dotenv.config();

// Create Client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel],
    makeCache: Options.cacheWithLimits({
        MessageManager: 0,
        DMMessageManager: 0,
        GuildMessageManager: 0,
        UserManager: 0,
    }),
    shards: "auto",
});
client.login(process.env.TOKEN);

// Collections
client.slashCommands = new Collection<string, SlashCommand>();
client.blacklist = new Map<string, string>();

// Add Handlers
const handlersDir = join(__dirname, "./handlers");
fs.readdirSync(handlersDir).forEach(handler => {
    if (!handler.endsWith(".js")) return;
    let event = require(`${handlersDir}/${handler}`).default;
    if (!event.disabled) event.execute(client);
});

// Don't crash
process.on('uncaughtException', error => {
    console.log(error.stack);
});
