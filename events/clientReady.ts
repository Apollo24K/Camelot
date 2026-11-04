import { Client, ActivityType } from "discord.js";
import { BotEvent } from "../types";
import { restoreForumThreadUnlocks } from "../Modules/forumThreadLocks";
import { preloadCalendarImages } from "../Modules/calendar";

const event: BotEvent = {
    name: "clientReady",
    once: true,
    execute: (client: Client) => {
        void restoreForumThreadUnlocks(client);
        // /daily renders the calendar inside a 3 second interaction deadline, so warm the icon cache up front.
        void preloadCalendarImages();

        console.log("Connected as " + client.user?.tag);
        if (client.user?.id === "706183309943767112") client.user?.setPresence({ activities: [{ name: 'Fate', type: ActivityType.Watching }] });
        else client.user?.setPresence({ activities: [{ name: 'You', type: ActivityType.Watching }] });

    },
};

export default event;
