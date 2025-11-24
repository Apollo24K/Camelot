import fs from 'fs';
import { Campaign } from 'patreon-discord';
import { Client } from "discord.js";
import { BotHandler } from "../types";
import { getPremiumUsers, updateUsersAndCache } from '../Modules/queries';

const handler: BotHandler = {
    name: "Autoposter",
    execute: async (client: Client) => {

        const myCampaign = new Campaign({
            patreonToken: process.env.PATREON_TOKEN,
            campaignId: process.env.PATREON_CAMPAIGN_ID,
        });

        // Check if premium gift expired (every 15 min)
        setInterval(async () => {

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
                            await updateUsersAndCache(client, user.id, {
                                updates: {
                                    premium: { type: "set", value: patronIDs[user.id] },
                                },
                            });
                        };
                    } else if (premiumGift?.[user.id]?.date > (new Date().getTime() - (premiumGift?.[user.id]?.method === "shop-7day" ? (7 * 24 * 60 * 60 * 1000) : (31 * 24 * 60 * 60 * 1000)))) {
                        ; // Do nothing
                    } else {
                        lostPrem.push(user.id);
                    };
                };

                // Remove expired premium
                if (lostPrem.length) {
                    await updateUsersAndCache(client, lostPrem, {
                        updates: {
                            premium: { type: "set", value: 0 },
                        },
                    });
                };
            });
        }, 15 * 60 * 1000);

    },
};

export default handler;
