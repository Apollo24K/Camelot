import fs from 'fs';
import { Client } from 'discord.js';
import { cowSettings } from './components';
import { updateUsersAndCache } from './queries';
import { sendEventStartMail } from './eventMail';

export async function startRollingCow(client: Client): Promise<void> {
    await updateUsersAndCache(client, "*", {
        updates: {
            cow_participation: { type: "set", value: null },
            cow_chars: { type: "set", value: [] },
            cow_timer: { type: "set", value: null },
            cow_rolled_today: { type: "set", value: 0 },
        },
    });

    cowSettings.start = Date.now();
    await fs.promises.writeFile('Storage/rolling.json', JSON.stringify(cowSettings));
    await sendEventStartMail(client, "Rolling Cow");
}
