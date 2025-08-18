import { ChatInputCommandInteraction, User } from "discord.js";
import { getUserSchema, updateUsers } from "./queries.js";
import { isEventOngoing } from "./components.js";

const dailyLock = new Set<string>();

function getHash(key: string, hash: number) {
    for (let i = 0; i < key.length; i++) {
        hash = ((hash << 5) - hash) + key.charCodeAt(i);
        hash |= 0;
    }
    return hash;
};

function getQuests(id: string, len: number) {
    const quests = new Set<number>();
    const key = new Intl.DateTimeFormat('en-UK', { timeZone: 'Europe/Berlin' }).format(new Date()).split("/").reverse().join("-") + id;
    let i = 0;
    while (quests.size < 4 && i < 100) {
        const hash = getHash(key, i++);
        quests.add(Math.abs(hash) % len);
    };
    return [...quests].map((e) => dailies[e]);
};

class dailyQuestInfo {
    private _title: string;
    private _description: string;
    private _id: number;
    private _check: (stat: number) => boolean;

    constructor(title: string, description: string, id: number, check: (stat: number) => boolean) {
        this._title = title;
        this._description = description;
        this._id = id;
        this._check = check;
    };
    get title() {
        return this._title;
    };
    get description() {
        return this._description;
    };
    get id() {
        return this._id;
    };
    get check() {
        return this._check;
    };

    async update(interaction: ChatInputCommandInteraction | undefined, change: number = 1, user: User | { id: string; } = interaction?.user ?? { id: "" }) {

        // Get the user's dailies
        const todaysQuests = getQuests(user.id, dailies.length);

        // Return if not included
        if (!todaysQuests.some((quest) => this.id === quest.id)) return;

        // Lock
        const lockKey = `${user.id}:${this.id}`;
        if (dailyLock.has(lockKey)) return;
        dailyLock.add(lockKey);

        try {
            // Get user stats
            const stats = await getUserSchema(user.id);
            if (!stats) return;

            // Check if it's already completed
            if (this.id in stats.dailies && this.check(stats.dailies[this.id])) return;

            // Apply change
            if (this.id in stats.dailies) stats.dailies[this.id] += change;
            else stats.dailies[this.id] = change;

            // Check if it was completed now
            if (this.check(stats.dailies[this.id])) {

                // Check if event is active
                const passlevel = isEventOngoing()
                    ? ({ passlevel: { type: "increment", value: 1 } } as const)
                    : {};

                if (todaysQuests.every((quest) => quest.check(stats.dailies[quest.id]))) { // passlevel = passlevel + 1,

                    await updateUsers(user.id, {
                        xp: { type: "increment", value: 20 },
                        coins: { type: "increment", value: 1000 },
                        gems: { type: "increment", value: 4 },
                        dailies: { type: "set_json", value: stats.dailies },
                        ...passlevel
                    });

                    if (interaction?.channel?.isSendable()) interaction.channel.send(`<a:starsL:942573254730715246> Daily Quest Completed: **${this._title}** <a:starsR:942573194802511923>\nYou have completed all quests of today!\n**Rewards**:\n> You were given **20** XP\n> Added **1000** <:coins:872926669055356939>\n> Added **4** <:genesis_gems:1034179687720681492>`);
                } else {

                    await updateUsers(user.id, {
                        xp: { type: "increment", value: 10 },
                        coins: { type: "increment", value: 500 },
                        gems: { type: "increment", value: 2 },
                        dailies: { type: "set_json", value: stats.dailies },
                        ...passlevel
                    });

                    if (interaction?.channel?.isSendable()) interaction.channel.send(`<a:starsL:942573254730715246> Daily Quest Completed: **${this._title}** <a:starsR:942573194802511923>\n**Rewards**:\n> You were given **10** XP\n> Added **500** <:coins:872926669055356939>\n> Added **2** <:genesis_gems:1034179687720681492>`);
                };
            } else {
                await updateUsers(user.id, {
                    dailies: { type: "set_json", value: stats.dailies }
                });
            };
        } finally {
            dailyLock.delete(lockKey);
        };
    };

};

export const dailies = [
    new dailyQuestInfo("Gacha Grind", "Pull 20 characters", 0, (stat) => { return stat >= 20; }),
    new dailyQuestInfo("Harvest", "Earn 50 Lilium", 1, (stat) => { return stat >= 50; }),
    new dailyQuestInfo("Increasing Danger", "Defeat 20 monsters in the dungeon", 2, (stat) => { return stat >= 20; }),
    new dailyQuestInfo("Contender", "Participate in 3 arena battles", 3, (stat) => { return stat >= 3; }),
    new dailyQuestInfo("New Recruit", "Buy a character pack from the shop", 4, (stat) => { return stat >= 1; }),
    new dailyQuestInfo("Siege of Camelot", "Fight Camelot", 5, (stat) => { return stat >= 1; }),
    new dailyQuestInfo("Impenetrable Defense", "Block 2 attacks in a row", 6, (stat) => { return stat >= 1; }),
    new dailyQuestInfo("A Fishy Task", "Catch 5 fish", 7, (stat) => { return stat >= 5; }),
    new dailyQuestInfo("Another Fishy Task", "Catch a rare or higher fish", 8, (stat) => { return stat >= 1; }),
    new dailyQuestInfo("Fortune's Favor", "Donate 2000 coins to a guild", 9, (stat) => { return stat >= 2000; }),
    new dailyQuestInfo("Knight's Ballot", "[Vote for Camelot](<https://rank.top/bot/camelot/vote>)", 10, (stat) => { return stat >= 1; }),
    new dailyQuestInfo("Parting Pieces", "Disassemble 3 items", 11, (stat) => { return stat >= 3; }),
];
