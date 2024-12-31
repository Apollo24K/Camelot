import { db, query } from "../db_handler.js";

function getHash(key, hash) {
    for (let i = 0; i < key.length; i++) {
        hash = ((hash << 5) - hash) + key.charCodeAt(i);
        hash |= 0;
    }
    return hash;
};

function getQuests(id, len) {
    const quests = new Set();
    const key = new Intl.DateTimeFormat('en-UK', { timeZone: 'Europe/Berlin' }).format(new Date()).split("/").reverse().join("-") + id;
    let i = 0;
    while (quests.size < 4 && i < 100) {
        const hash = getHash(key, i++);
        quests.add(Math.abs(hash) % len);
    };
    return [...quests].map((e) => dailies[e]);
};

class dailyQuestInfo {
    constructor(title, description, id, check) {
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

    update(interaction, change = 1, user = interaction.user) {

        // Get the users dailies
        const todaysQuests = getQuests(user.id, dailies.length);

        // Return if not included
        if (!todaysQuests.some((quest) => this._id === quest.id)) return;

        db.serialize(async () => {
            let stats = await query(`SELECT dailies FROM users WHERE id = ${user.id}`);
            if (!stats[0]) return;
            stats = { dailies: JSON.parse(stats[0].dailies) };

            // Check if it's already completed
            if (this._id in stats.dailies && this._check(stats.dailies[this._id])) return;

            // Apply change
            if (this._id in stats.dailies) stats.dailies[this._id] += change;
            else stats.dailies[this._id] = change;

            // Check if it was completed now
            if (this._check(stats.dailies[this._id])) {
                if (todaysQuests.every((quest) => quest._check(stats.dailies[quest.id]))) { // passlevel = passlevel + 1,
                    await query(`UPDATE users SET  xp = xp + 20, coins = coins + 1000, gems = gems + 4, dailies = '${JSON.stringify(stats.dailies)}' WHERE id = ${user.id}`);
                    interaction?.channel.send(`<a:starsL:942573254730715246> Daily Quest Completed: **${this._title}** <a:starsR:942573194802511923>\nYou have completed all quests of today!\n**Rewards**:\n> You were given **20** XP\n> Added **1000** <:coins:872926669055356939>\n> Added **4** <:genesis_gems:1034179687720681492>`);
                } else {
                    await query(`UPDATE users SET  xp = xp + 10, coins = coins + 500, gems = gems + 2, dailies = '${JSON.stringify(stats.dailies)}' WHERE id = ${user.id}`);
                    interaction?.channel.send(`<a:starsL:942573254730715246> Daily Quest Completed: **${this._title}** <a:starsR:942573194802511923>\n**Rewards**:\n> You were given **10** XP\n> Added **500** <:coins:872926669055356939>\n> Added **2** <:genesis_gems:1034179687720681492>`);
                };
            } else {
                await query(`UPDATE users SET dailies = '${JSON.stringify(stats.dailies)}' WHERE id = ${user.id}`);
            };

        });

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
    new dailyQuestInfo("Knight's Ballot", "[Vote for Camelot](https://top.gg/bot/706183309943767112/vote)", 10, (stat) => { return stat >= 1; }),
    new dailyQuestInfo("Parting Pieces", "Disassemble 3 items", 11, (stat) => { return stat >= 3; }),
];
