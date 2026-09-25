import fs from 'fs';
import { join } from "path";
import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Partials, Options, Collection } from 'discord.js';
import { ServerSchema, CompactUserSchema, SlashCommand } from './types';
import { bootstrapApplication } from './Modules/startup';
import { registerRestLogging } from './Modules/restLogging';
dotenv.config();
bootstrapApplication();

// Create Client
const client = new Client({ // GatewayIntentBits.GuildMembers
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel],
    makeCache: Options.cacheWithLimits({
        MessageManager: 0,
        DMMessageManager: 0,
        GuildMessageManager: 100,
        UserManager: 100,
    }),
    shards: "auto",
});
registerRestLogging(client);
client.login(process.env.TOKEN);

// Collections
client.slashCommands = new Collection<string, SlashCommand>();
client.userCache = new Map<string, { o: CompactUserSchema, t: number; }>();
client.serverCache = new Map<string, { o: ServerSchema, t: number; }>();
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
