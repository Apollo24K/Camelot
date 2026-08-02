import { Client } from 'discord.js';
import { updateUsersAndCache } from './queries';

type MonthlyEvent = "Rolling Cow" | "Stampede";

export async function sendEventStartMail(client: Client, eventName: MonthlyEvent): Promise<void> {
    const message = {
        "Rolling Cow": "This month's `/rolling cow` event has started! Form a `/party` with your friends and help us contain the immortal bovines! <a:GoldenCowRoll:1256647801262182471>",
        "Stampede": "This month's `/stampede` event has started! Form a `/party` with your friends and end the stampede!",
    }[eventName];

    const mail = {
        type: "2,4",
        rewards: "coins|2500,ss ticket|1,s ticket|2,a ticket|5",
        message: message,
        date: Date.now(),
    };

    await updateUsersAndCache(client, "*", {
        updates: {
            mailbox: { type: "append", value: [mail] },
        },
    });
}
