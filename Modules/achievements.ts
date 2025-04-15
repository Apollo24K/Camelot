import { characters, auniq } from "./chars.js";
import { ChatInputCommandInteraction, User } from "discord.js";
import { getUserSchema, updateUsers } from "./queries.js";

// Set to track ongoing achievement checks (userId:achievementId)
const achvmLock = new Set<string>();

export default class achievInfo {
    private _title: string;
    private _description: string;
    private _id: number;
    private _group: number;
    private _type: string;
    private _rewards: string[];

    constructor(title: string, description: string, id: number, group: number, type: string, ...rewards: string[]) {
        this._title = title;
        this._description = description;
        this._id = id;
        this._group = group;
        this._type = type;
        this._rewards = rewards;
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
    get group() {
        return this._group;
    };
    get type() { // Type 1: xp, Type 2: coins, Type 3: shards, Type 4: tickets, Type 5: lootbox
        return this._type.split(",");
    };
    get rewards() {
        return this._rewards;
    };

    async addRewards(interaction: ChatInputCommandInteraction, user: User) {
        let add_xp = 0, add_coins = 0, add_shards = { "ss": 0, "s": 0, "a": 0, "b": 0, "c": 0, "d": 0 }, add_tickets = { "ss": 0, "s": 0, "a": 0, "b": 0, "c": 0, "d": 0 }, add_lb = 0, add_shield = 0;

        const types = {
            "1": { // XP
                run: () => {
                    this._rewards.forEach((rew) => {
                        if (rew.match(/xp/gi)) add_xp += parseInt(rew.split("|")[1]);
                    });
                },
            },
            "2": { // Coins
                run: () => {
                    this._rewards.forEach((rew) => {
                        if (rew.match(/coins/gi)) add_coins += parseInt(rew.split("|")[1]);
                    });
                },
            },
            "3": { // Shards
                run: () => {
                    this._rewards.forEach((rew) => {
                        if (rew.match(/shard/gi)) {
                            add_shards[rew.split(" ")[0] as keyof typeof add_shards] += parseInt(rew.split("|")[1]);
                        };
                    });
                },
            },
            "4": { // Tickets
                run: () => {
                    this._rewards.forEach((rew) => {
                        if (rew.match(/ticket/gi)) {
                            add_tickets[rew.split(" ")[0] as keyof typeof add_tickets] += parseInt(rew.split("|")[1]);
                        };
                    });
                },
            },
            "5": { // Lootbox
                run: () => {
                    this._rewards.forEach((rew) => {
                        if (rew.match(/lb/gi)) add_lb = parseInt(rew.split("|")[1]);
                    });
                },
            },
            "6": { // Shield
                run: () => {
                    add_shield = 1;
                },
            }
        };

        this._type.split(",").forEach((type) => {
            types[type as keyof typeof types].run();
        });

        await updateUsers(user.id, {
            xp: { type: "increment", value: add_xp },
            coins: { type: "increment", value: add_coins },
            lootbox: { type: "increment", value: add_lb },
            ssshard: { type: "increment", value: add_shards["ss"] },
            sshard: { type: "increment", value: add_shards["s"] },
            ashard: { type: "increment", value: add_shards["a"] },
            bshard: { type: "increment", value: add_shards["b"] },
            cshard: { type: "increment", value: add_shards["c"] },
            dshard: { type: "increment", value: add_shards["d"] },
            ssticket: { type: "increment", value: add_tickets["ss"] },
            sticket: { type: "increment", value: add_tickets["s"] },
            aticket: { type: "increment", value: add_tickets["a"] },
            bticket: { type: "increment", value: add_tickets["b"] },
            cticket: { type: "increment", value: add_tickets["c"] },
            dticket: { type: "increment", value: add_tickets["d"] },
            shield_slot: { type: "set", value: add_shield },
            achievements: { type: "append_unique", value: [this.id] }
        });

        // Achievements
        achievements[15].check(interaction, user), achievements[16].check(interaction, user), achievements[17].check(interaction, user), achievements[18].check(interaction, user); // Rising
    };

    notify(interaction: ChatInputCommandInteraction) {
        const shardEmojis = { "ss": "<:ss_shard:917203009543503892>", "s": "<:s_shard:917202925514817566>", "a": "<:a_shard:917202904862052392>", "b": "<:b_shard:917202862851899392>", "c": "<:c_shard:917202862499582002>", "d": "<:d_shard:917202840563363891>" };
        const ticketEmojis = { "ss": "<:ss_ticket:927503239396622336>", "s": "<:s_ticket:927642487705722890>", "a": "<:a_ticket:929420377946472508>", "b": "<:b_ticket:929420396535615519>", "c": "<:c_ticket:929420424645853214>", "d": "<:d_ticket:929420447102152714>" };

        let notification = `<a:starsL:942573254730715246> Achievement unlocked: **${this._title}** <a:starsR:942573194802511923>\n**Rewards**:\n>>> `;

        this._type.split(",").forEach((type) => {
            switch (type) {
                case "1": this._rewards.forEach((rew) => { if (rew.match(/xp/gi)) notification += `You were given **${rew.split("|")[1]}** XP\n`; }); break;
                case "2": this._rewards.forEach((rew) => { if (rew.match(/coins/gi)) notification += `Added **${rew.split("|")[1]}** <:coins:872926669055356939>\n`; }); break;
                case "3": this._rewards.forEach((rew) => { if (rew.match(/shard/gi)) notification += `Added **${rew.split("|")[1]}**x ${shardEmojis[rew.split(" ")[0] as keyof typeof shardEmojis]}\n`; }); break;
                case "4": this._rewards.forEach((rew) => { if (rew.match(/ticket/gi)) notification += `Added **${rew.split("|")[1]}**x ${ticketEmojis[rew.split(" ")[0] as keyof typeof ticketEmojis]}\n`; }); break;
                case "5": this._rewards.forEach((rew) => { if (rew.match(/lb/gi)) notification += `Added **${rew.split("|")[1]}** ${rew.split("|")[1] == "1" ? "lootbox" : "lootboxes"}\n`; }); break;
                case "6": notification += `Unlocked <:shield_empty:1087089686809415730> **Shield Slot**\n`;
            };
        });
        if (interaction.channel?.isSendable()) interaction.channel.send(notification);
    };

    async check(interaction: ChatInputCommandInteraction, user: User | undefined = undefined, ...list: any[]) {
        user ||= interaction.user;

        // Lock
        const lockKey = `${user.id}:${this.id}`;
        if (achvmLock.has(lockKey)) return;
        achvmLock.add(lockKey);

        try {
            const stats = await getUserSchema(user.id);
            if (!stats) return;
            if (stats.achievements.includes(this.id)) return;

            switch (this.id) {
                case 0: if (stats.pullstotal >= 1) this.addRewards(interaction, user), this.notify(interaction); break;
                case 1: if (new Set(stats.chars).size >= 500) this.addRewards(interaction, user), this.notify(interaction); break;
                case 2: if (new Set(stats.chars).size >= 2000) this.addRewards(interaction, user), this.notify(interaction); break;
                case 3: if (new Set(stats.chars).size >= 5000) this.addRewards(interaction, user), this.notify(interaction); break;
                case 4: if (list[0] > 0) this.addRewards(interaction, user), this.notify(interaction); break;
                case 5: if (list[0] > 0) this.addRewards(interaction, user), this.notify(interaction); break;
                case 6: if (stats.arenawins >= 1) this.addRewards(interaction, user), this.notify(interaction); break;
                case 7: if (stats.arenawins >= 20) this.addRewards(interaction, user), this.notify(interaction); break;
                case 8: if (stats.arenawins >= 100) this.addRewards(interaction, user), this.notify(interaction); break;
                case 9: if (list[0] >= 3) this.addRewards(interaction, user), this.notify(interaction); break;
                case 10: if (list[0] >= 7) this.addRewards(interaction, user), this.notify(interaction); break;
                case 11: if (list[0] >= 14) this.addRewards(interaction, user), this.notify(interaction); break;
                case 12: if (list[0] >= 30) this.addRewards(interaction, user), this.notify(interaction); break;
                case 13: if (list[0] === 3) this.addRewards(interaction, user), this.notify(interaction); break;
                case 14: if (list[0] === 5) this.addRewards(interaction, user), this.notify(interaction); break;
                case 15: if (stats.xp > 659) this.addRewards(interaction, user), this.notify(interaction); break;
                case 16: if (stats.xp > 9046) this.addRewards(interaction, user), this.notify(interaction); break;
                case 17: if (stats.xp > 27863) this.addRewards(interaction, user), this.notify(interaction); break;
                case 18: if (stats.xp > 115211) this.addRewards(interaction, user), this.notify(interaction); break;
                case 19:
                case 20:
                case 21:
                case 22:
                case 23: {
                    let completed = 0;
                    let chars = [...new Set(stats.chars)].map((e) => characters[e]);
                    auniq.forEach((a) => { if (characters.filter((e) => e.anime === a).length === chars.filter((e) => e.anime === a).length) completed++; });
                    if (this.id === 19) if (completed) this.addRewards(interaction, user), this.notify(interaction);
                    if (this.id === 20) if (completed >= 10) this.addRewards(interaction, user), this.notify(interaction);
                    if (this.id === 21) if (completed >= 30) this.addRewards(interaction, user), this.notify(interaction);
                    if (this.id === 22) if (completed >= 100) this.addRewards(interaction, user), this.notify(interaction);
                    if (this.id === 23) if (completed >= 250) this.addRewards(interaction, user), this.notify(interaction);
                    break;
                }
                case 24: if (list[0] === 1) this.addRewards(interaction, user), this.notify(interaction); break;
                case 25: if (list[0] === 2) this.addRewards(interaction, user), this.notify(interaction); break;
                case 26: if (list[0] === 3) this.addRewards(interaction, user), this.notify(interaction); break;
                case 27: if (list[0] >= 5) this.addRewards(interaction, user), this.notify(interaction); break;
                case 28: if (list[0] >= 30) this.addRewards(interaction, user), this.notify(interaction); break;
                case 29: if (list[0] >= 100) this.addRewards(interaction, user), this.notify(interaction); break;
                case 30: if (list[0]) this.addRewards(interaction, user), this.notify(interaction); break;
                case 31: if (list[0]) this.addRewards(interaction, user), this.notify(interaction); break;
                case 32: if (list[0]) this.addRewards(interaction, user), this.notify(interaction); break;
                case 33: this.addRewards(interaction, user), this.notify(interaction); break;
                case 34: if (list[0] === 6) this.addRewards(interaction, user), this.notify(interaction); break;
                case 35: if (list[0] === 11) this.addRewards(interaction, user), this.notify(interaction); break;
                case 36: if (list[0] === 26) this.addRewards(interaction, user), this.notify(interaction); break;
                case 37: if (list[0] === 51) this.addRewards(interaction, user), this.notify(interaction); break;
                case 38: if (list[0] === 71) this.addRewards(interaction, user), this.notify(interaction); break;
                case 39: if (list[0] <= 10) this.addRewards(interaction, user), this.notify(interaction); break;
                case 40: if (list[0] <= 3) this.addRewards(interaction, user), this.notify(interaction); break;
                case 41: if (list[0] === 1) this.addRewards(interaction, user), this.notify(interaction); break;
                case 42: if (list[0] >= 30) this.addRewards(interaction, user), this.notify(interaction); break;
                case 43: if (list[0] >= 50) this.addRewards(interaction, user), this.notify(interaction); break;
                case 44: if (list[0] >= 80) this.addRewards(interaction, user), this.notify(interaction); break;
                case 45: if (list[0] >= 100) this.addRewards(interaction, user), this.notify(interaction); break;
                case 46: this.addRewards(interaction, user), this.notify(interaction); break;
                case 47: this.addRewards(interaction, user), this.notify(interaction); break;
                case 48: this.addRewards(interaction, user), this.notify(interaction); break;
                case 49: this.addRewards(interaction, user), this.notify(interaction); break;
                case 50: this.addRewards(interaction, user), this.notify(interaction); break;
                case 51: this.addRewards(interaction, user), this.notify(interaction); break;

                case 52: if (list[0] === "unique") this.addRewards(interaction, user), this.notify(interaction); break;
                case 53: if (list[0] === "legendary") this.addRewards(interaction, user), this.notify(interaction); break;
                case 54: if (list[0] === "mythical") this.addRewards(interaction, user), this.notify(interaction); break;

                case 55: if (list[0] === 100 && list[1]) this.addRewards(interaction, user), this.notify(interaction); break;
                case 56: if (list[0] === 150 && list[1]) this.addRewards(interaction, user), this.notify(interaction); break;
                case 57: if (list[0] === 200 && list[1]) this.addRewards(interaction, user), this.notify(interaction); break;
                case 58: if (list[0] === 270 && list[1]) this.addRewards(interaction, user), this.notify(interaction); break;

                // Guild Donation Achievements
                case 59: if (stats.donatedtotal >= 50000) this.addRewards(interaction, user), this.notify(interaction); break;
                case 60: if (stats.donatedtotal >= 250000) this.addRewards(interaction, user), this.notify(interaction); break;
                case 61: if (stats.donatedtotal >= 1000000) this.addRewards(interaction, user), this.notify(interaction); break;
                case 62: if (stats.donatedtotal >= 5000000) this.addRewards(interaction, user), this.notify(interaction); break;
                case 63: if (stats.donatedtotal >= 20000000) this.addRewards(interaction, user), this.notify(interaction); break;

                default: false; break;
            };
        } catch {
            console.error(`Error during achievement check for ${lockKey}:`);
        } finally {
            achvmLock.delete(lockKey);
        };
    };
};

export const achievements = [ // Type 1: xp, 2: coins, 3: shards, 4: tickets, 5: lootbox
    new achievInfo("First Character", "Pull your first character", 0, 0, "1,2", "xp|10", "coins|100"),

    new achievInfo("Collector", "Collect 500 characters", 1, 1, "4", "ss ticket|1", "s ticket|3"),
    new achievInfo("Collector", "Collect 2000 characters", 2, 1, "4", "ss ticket|2", "s ticket|5"),
    new achievInfo("Collector", "Collect 5000 characters", 3, 1, "4", "ss ticket|3", "s ticket|10"),

    new achievInfo("Something Rare", "Pull an S Tier character", 4, 2, "3", "s shard|4"),
    new achievInfo("Something Rare", "Pull an SS Tier character", 5, 2, "3", "ss shard|4"),

    new achievInfo("Champion", "Win an arena fight", 6, 3, "1,2", "xp|50", "coins|250"),
    new achievInfo("Champion", "Win 20 arena fights", 7, 3, "1,2", "xp|100", "coins|1000"),
    new achievInfo("Champion", "Win 100 arena fights", 8, 3, "1,2", "xp|250", "coins|3000"),

    new achievInfo("Don't Stop Me Now", "Reach a daily streak of 3", 9, 4, "1,2", "xp|20", "coins|250"),
    new achievInfo("Don't Stop Me Now", "Reach a daily streak of 7", 10, 4, "1,2", "xp|30", "coins|400"),
    new achievInfo("Don't Stop Me Now", "Reach a daily streak of 14", 11, 4, "1,2", "xp|50", "coins|800"),
    new achievInfo("Don't Stop Me Now", "Reach a daily streak of 30", 12, 4, "1,2", "xp|75", "coins|2000"),

    new achievInfo("Invincible", "Block 3 attacks in a row", 13, 5, "3", "ss shard|2", "s shard|4"),
    new achievInfo("Invincible", "Block 5 attacks in a row", 14, 5, "3", "ss shard|4", "s shard|8", "a shard|12"),

    new achievInfo("Rising", "Reach level 10", 15, 6, "2,4", "coins|300", "s ticket|1"),
    new achievInfo("Rising", "Reach level 30", 16, 6, "2,4", "coins|2000", "ss ticket|1", "s ticket|2"),
    new achievInfo("Rising", "Reach level 50", 17, 6, "2,4", "coins|5000", "ss ticket|1", "s ticket|3"),
    new achievInfo("Rising", "Reach level 100", 18, 6, "2,4", "coins|10000", "ss ticket|3", "s ticket|5"),

    new achievInfo("Diligent", "Complete 1 anime", 19, 7, "1,2,4", "xp|50", "coins|750", "s ticket|2"),
    new achievInfo("Diligent", "Complete 10 anime", 20, 7, "1,2,4", "xp|150", "coins|2000", "ss ticket|1", "s ticket|2"),
    new achievInfo("Diligent", "Complete 30 anime", 21, 7, "1,2,4", "xp|250", "coins|5000", "ss ticket|2", "s ticket|3"),
    new achievInfo("Diligent", "Complete 100 anime", 22, 7, "1,2,4", "xp|500", "coins|7500", "ss ticket|3", "s ticket|5"),
    new achievInfo("Diligent", "Complete 250 anime", 23, 7, "1,2,4", "xp|2000", "coins|10000", "ss ticket|5", "s ticket|10"),

    new achievInfo("The Show Must Go On", "Revive yourself 1 time in the dungeon", 24, 8, "1,2", "xp|30", "coins|500"),
    new achievInfo("The Show Must Go On", "Revive yourself 2 times in the dungeon", 25, 8, "1,2", "xp|50", "coins|1000"),
    new achievInfo("The Show Must Go On", "Revive yourself 3 times in the dungeon", 26, 8, "1,2,3", "xp|100", "coins|2000", "ss shard|4"),

    new achievInfo("Coming Back", "Defeat the same boss 5 times", 27, 9, "1,2,3", "xp|10", "coins|500", "ss shard|2"),
    new achievInfo("Coming Back", "Defeat the same boss 30 times", 28, 9, "1,2,3", "xp|30", "coins|1000", "ss shard|4"),
    new achievInfo("Coming Back", "Defeat the same boss 100 times", 29, 9, "1,2,3", "xp|100", "coins|2000", "ss shard|6"),

    new achievInfo("Shared Happiness", "Gift someone an S tier character", 30, 10, "1,4", "xp|20", "a ticket|1"),
    new achievInfo("Shared Happiness", "Gift someone an SS tier character", 31, 10, "1,4", "xp|30", "s ticket|1"),
    new achievInfo("Shared Happiness", "Gift someone an SS tier character immediately after pulling it", 32, 10, "1,4", "xp|60", "s ticket|2"),

    new achievInfo("Golden Sword of the Victorious", "『 ??? 』", 33, 11, "1,2,4", "xp|75", "coins|2000", "s ticket|1"),

    new achievInfo("Challenger", "Beat the floor 5 Guardian", 34, 12, "1,2,3", "xp|50", "coins|2000", "ss shard|2"),
    new achievInfo("Challenger", "Beat the floor 10 Guardian", 35, 12, "1,2,3", "xp|75", "coins|3000", "ss shard|4"),
    new achievInfo("Challenger", "Beat the floor 25 Guardian", 36, 12, "1,2,3", "xp|100", "coins|5000", "ss shard|8"),
    new achievInfo("Challenger", "Beat the floor 50 Guardian", 37, 12, "1,2,3", "xp|200", "coins|8000", "ss shard|12"),
    new achievInfo("Challenger", "Beat the floor 70 Guardian", 38, 12, "1,3,4", "xp|250", "ss shard|16", "ss ticket|2"),

    new achievInfo("Under Pressure", "Win a battle with 10 or less HP left", 39, 13, "1,2", "xp|20", "coins|500"),
    new achievInfo("Under Pressure", "Win a battle with 3 or less HP left", 40, 13, "1,2", "xp|30", "coins|1000"),
    new achievInfo("Under Pressure", "Win a battle with 1 HP left", 41, 13, "1,2", "xp|80", "coins|2000"),

    new achievInfo("The Battle is to the Strong", "Reach level 30 with a character", 42, 14, "1,2", "xp|75", "coins|2000"),
    new achievInfo("The Battle is to the Strong", "Reach level 50 with a character", 43, 14, "1,2", "xp|150", "coins|3000"),
    new achievInfo("The Battle is to the Strong", "Reach level 80 with a character", 44, 14, "1,2,3", "xp|250", "coins|5000", "ss shard|4"),
    new achievInfo("The Battle is to the Strong", "Reach level 100 with a character", 45, 14, "1,2,3", "xp|300", "coins|8000", "ss shard|8"),

    new achievInfo("First Steps", "Change your favourite character", 46, 15, "3,4", "s shard|4", "a ticket|1"),
    new achievInfo("First Steps", "Look up some abilites", 47, 15, "3,4", "s shard|4", "a ticket|1"),
    new achievInfo("First Steps", "Buy a character pack from the shop", 48, 15, "3,4", "s shard|4", "a ticket|1"),

    new achievInfo("The Answer", "Calculate the answer to life, the universe, and everything", 49, 16, "1,2", "xp|42", "coins|420"),

    new achievInfo("A New Adventure", "Complete the tutorial", 50, 17, "1,2,4", "xp|30", "coins|300", "a ticket|1"),
    new achievInfo("A New Adventure", "Complete the tutorial", 51, 17, "1,2,4", "xp|30", "coins|500", "a ticket|1"),

    new achievInfo("Angler's Triumph", "Catch a unique fish", 52, 18, "1,2,4", "xp|30", "coins|500", "a ticket|1"),
    new achievInfo("Angler's Triumph", "Catch a legendary fish", 53, 18, "1,2,4", "xp|75", "coins|2500", "s ticket|1"),
    new achievInfo("Angler's Triumph", "Catch a mythical fish", 54, 18, "1,2,4", "xp|150", "coins|5000", "ss ticket|1"),

    new achievInfo("Challenger ⅠⅠ", "Beat the floor 100 Guardian", 55, 19, "1,2,3", "xp|250", "coins|10000", "ss shard|16"),
    new achievInfo("Challenger ⅠⅠ", "Beat the floor 150 Guardian", 56, 19, "1,2,3", "xp|300", "coins|12500", "ss shard|16"),
    new achievInfo("Challenger ⅠⅠ", "Beat the floor 200 Guardian", 57, 19, "1,2,3", "xp|350", "coins|15000", "ss shard|16"),
    new achievInfo("Challenger ⅠⅠ", "Beat the floor 270 Guardian", 58, 19, "6,1,2,4", "xp|500", "coins|20000", "ss ticket|3"),

    new achievInfo("Blessing to the Guild", "Donate 50'000", 59, 20, "1,2", "xp|25", "coins|2500"),
    new achievInfo("Blessing to the Guild", "Donate 250'000", 60, 20, "1,2", "xp|75", "coins|7500"),
    new achievInfo("Blessing to the Guild", "Donate 1'000'000", 61, 20, "1,2", "xp|150", "coins|10000"),
    new achievInfo("Blessing to the Guild", "Donate 5'000'000", 62, 20, "1,2", "xp|250", "coins|30000"),
    new achievInfo("Blessing to the Guild", "Donate 20'000'000", 63, 20, "1,2", "xp|500", "coins|50000"),


];
