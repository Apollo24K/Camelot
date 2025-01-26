import fs from 'fs';
import config from '../config.json';
import { Campaign } from 'patreon-discord';
import { Client } from "discord.js";
import { BotHandler } from "../types";
import { getPremiumUsers, updateUsers } from '../Modules/queries';

const handler: BotHandler = {
    name: "Autoposter",
    execute: async (client: Client) => {

        const myCampaign = new Campaign({
            patreonToken: config.patreon.token,
            campaignId: config.patreon.campaignId,
        });

        // Check if premium gift expired (every 15 min)
        setInterval(() => {

            // fetch active patrons
            myCampaign.fetchPatrons(['active_patron', 'declined_patron', /*'former_patron'*/]).then(async patrons => {

                // Filter valid discord ID's
                const patronIDs: { [key: string]: number; } = {};
                const tiers: { [key: string]: number; } = { "8235152": 7, "8108779": 6, "8108777": 5, "8108764": 4, "8108641": 3, "8108640": 2, "8108639": 1 };
                patrons.forEach((patron) => {
                    if (patron.discord_user_id && patron.currently_entitled_tier_id && tiers[patron.currently_entitled_tier_id]) {
                        patronIDs[patron.discord_user_id] = tiers[patron.currently_entitled_tier_id];
                    };
                });

                const premiumGift = JSON.parse(fs.readFileSync('Storage/premiumGift.json', 'utf8'));

                const users = await getPremiumUsers();
                Object.keys(patronIDs).forEach(patron => users.push({ id: patron, premium: 0 }));

                let lostPrem: string[] = [];
                for (let user of users) {
                    if (user.id in patronIDs) {
                        if (user.premium !== patronIDs[user.id]) {
                            // Update users table
                            await updateUsers(user.id, {
                                premium: { type: "set", value: patronIDs[user.id] },
                            });
                        };
                    } else if (premiumGift?.[user.id]?.date > (new Date().getTime() - 31 * 24 * 60 * 60 * 1000)) {
                        ; // Do nothing
                    } else {
                        lostPrem.push(user.id);
                    };
                };

                // Remove expired premium
                if (lostPrem.length) {
                    await updateUsers(lostPrem, {
                        premium: { type: "set", value: 0 },
                    });
                };
            });
        }, 15 * 60 * 1000);

    },
};

export default handler;
