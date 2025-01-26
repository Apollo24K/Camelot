import { Client } from "discord.js";
import { BotHandler } from "../types";
import { loadPullResets, loadRanking, updateUsers } from "../Modules/queries";
import { getDetailedStats, pullsToResetList, RoK, sleep } from "../Modules/functions";

async function indexRanking() {
    let pass = 0, batchSize = 500;
    while (true) {
        const stats = await loadRanking(pass, batchSize);
        if (stats.length === 0) break;

        for (const account of stats) {
            if (account.battlechar) {
                const cstats = await getDetailedStats(account.battlechar, account, account.dungeon_classlevels);
                RoK.set(account.id, { name: account.name, id: account.id, char: account.battlechar, ep: cstats.ep });
            };
        };

        pass++;
        await sleep(500);
    };
};

const handler: BotHandler = {
    name: "Setup",
    disabled: true,
    execute: async (client: Client) => {

        // Load Pull Resets
        const users = await loadPullResets();
        for (const user of users) {
            if (user.lastpull) {
                let pullTimer = 45 * 60 * 1000;
                switch (user.premium) {
                    case 0: false; break;
                    case 1: pullTimer = 40 * 60 * 1000; break;
                    case 2: pullTimer = 40 * 60 * 1000; break;
                    case 3: pullTimer = 40 * 60 * 1000; break;
                    case 4: pullTimer = 35 * 60 * 1000; break;
                    case 5: pullTimer = 30 * 60 * 1000; break;
                    case 6: pullTimer = 30 * 60 * 1000; break;
                    case 7: pullTimer = 30 * 60 * 1000; break;
                    default: false; break;
                };

                pullsToResetList.add(user.id);
                setTimeout(async () => {
                    await updateUsers(user.id, { pullcount: { type: "set", value: 0 } });
                    pullsToResetList.delete(user.id);
                }, Math.abs(pullTimer + user.lastpull.getTime() - new Date().getTime()));
            };
        };

        // Load Ranking
        indexRanking();
        setInterval(indexRanking, 15 * 60 * 1000); // 15 min interval
    },
};

export default handler;
