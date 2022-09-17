var fs = require('fs');
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const { characters, auniq, charactersSS, charactersS, charactersA, charactersB, charactersC, charactersD } = require("../Modules/chars.js");
const { classes } = require("../Modules/classes.js");

const { db, query } = require("../db_handler.js");

var inventory = JSON.parse(fs.readFileSync('Storage/inventory.json', 'utf8'));
var xp = JSON.parse(fs.readFileSync('Storage/xp.json', 'utf8'));
var coins = JSON.parse(fs.readFileSync('Storage/coins.json', 'utf8'));
var pity = JSON.parse(fs.readFileSync('Storage/pity.json', 'utf8'));
var ref = JSON.parse(fs.readFileSync('Storage/ref.json', 'utf8'));
var shards = JSON.parse(fs.readFileSync('Storage/shards.json', 'utf8'));
var animationDelay = JSON.parse(fs.readFileSync('Storage/animationDelay.json', 'utf8'));
var tickets = JSON.parse(fs.readFileSync('Storage/tickets.json', 'utf8'));
var arenaResults = JSON.parse(fs.readFileSync('Storage/arenaResults.json', 'utf8'));
var dailyStreak = JSON.parse(fs.readFileSync('Storage/dailyStreak.json', 'utf-8'));
var userAchiev = JSON.parse(fs.readFileSync('Storage/userAchiev.json', 'utf-8'));
var lilium = JSON.parse(fs.readFileSync('Storage/lilium.json', 'utf-8'));

// Development
var floorBalance = JSON.parse(fs.readFileSync('Storage/floorBalance.json', 'utf-8'));

const fishingCooldown = new Map();
const consoleStyle = {
    base: [
      "color: #fff",
      "background-color: #444",
      "padding: 2px 4px",
      "border-radius: 2px"
    ],
    warning: [
      "color: #eee",
      "background-color: red"
    ],
    success: [
      "background-color: green"
    ]
};

var prefix = "!";

module.exports = {
    name: 'characters',
    description: 'Characters',
    execute(message, args, cmd, client) {

        // ADD NEW ACCOUNTS & SERVERS
        db.serialize(async () => {
            // NEW PLAYERS
            const entryExists = await query(`SELECT name FROM users WHERE id = ${message.author.id}`); // Check if user exists in the db
            if (entryExists.length) { // Update username if changed
                if (entryExists[0].name !== message.author.tag) await query(`UPDATE users SET name = "${message.author.tag.split('"').join('""')}" WHERE id = ${message.author.id}`, 'run');
            } else { // Add new player if not exists
                await query(`INSERT INTO users (id, name) VALUES (${message.author.id}, "${message.author.tag.split('"').join('""')}")`, 'run');
            };
            // NEW SERVERS
            const serverExists = await query(`SELECT user_ids FROM servers WHERE id = ${message.guild.id}`); // Check if server exists in the db
            const userExists = await query(`SELECT rowid FROM users WHERE id = ${message.author.id}`); // Get user id
            if (serverExists.length) { // Add players to guild
                if (!serverExists[0].user_ids.split(",").includes(""+userExists[0].rowid)) await query(`UPDATE servers SET user_ids = "${serverExists[0].user_ids+","+userExists[0].rowid}" WHERE id = ${message.guild.id}`, 'run');
            } else { // Add new server if not exists
                await query(`INSERT INTO servers (id, name, user_ids) VALUES (${message.guild.id}, "${message.guild.name.split('"').join('""')}", "${userExists[0].rowid}")`, 'run');
            };
        });

        class achievInfo {
            constructor(title, description, id, group, type, ...rewards) {
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

            addRewards(user = message.author) {
                if (!userAchiev[user.id + message.guild.id]) userAchiev[user.id + message.guild.id] = [];
                userAchiev[user.id + message.guild.id].push(this._id);

                fs.writeFile('Storage/userAchiev.json', JSON.stringify(userAchiev), (err) => {
                    if (err) console.error(err);
                });
                
                const types = {
                    "1": { // XP
                        run: () => {
                            this._rewards.forEach((rew) => {
                                if (rew.match(/xp/gi)) xp[user.id + message.guild.id] += parseInt(rew.split("|")[1]);
                                fs.writeFile('Storage/xp.json', JSON.stringify(xp), (err) => {
                                    if (err) console.error(err);
                                });

                                // Achievements
                                achievements[15].check(user), achievements[16].check(user), achievements[17].check(user), achievements[18].check(user); // Rising
                            });
                        },
                    },
                    "2": { // Coins
                        run: () => {
                            this._rewards.forEach((rew) => {
                                if (rew.match(/coins/gi)) coins[user.id + message.guild.id] = coins[user.id + message.guild.id] + parseInt(rew.split("|")[1]) || parseInt(rew.split("|")[1]);
                                fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                                    if (err) console.error(err);
                                });
                            });
                        },
                    },
                    "3": { // Shards
                        run: () => {
                            this._rewards.forEach((rew) => {
                                if (rew.match(/shard/gi)) {
                                    if (!shards[user.id + message.guild.id]) shards[user.id + message.guild.id] = {"ss":0,"s":0,"a":0,"b":0,"c":0,"d":0};
                                    shards[user.id + message.guild.id][rew.split(" ")[0]] += parseInt(rew.split("|")[1]);
                                };
                            });
                            fs.writeFile('Storage/shards.json', JSON.stringify(shards), (err) => {
                                if (err) console.error(err);
                            });
                        },
                    },
                    "4": { // Tickets
                        run: () => {
                            this._rewards.forEach((rew) => {
                                if (rew.match(/ticket/gi)) {
                                    if (!tickets[user.id + message.guild.id]) tickets[user.id + message.guild.id] = {"dT": 0,"cT":0,"bT":0,"aT":0,"sT":0,"ssT":0}
                                    tickets[user.id + message.guild.id][rew.split(" ")[0] + "T"] += parseInt(rew.split("|")[1]);
                                };
                            });
                            fs.writeFile('Storage/tickets.json', JSON.stringify(tickets), (err) => {
                                if (err) console.error(err);
                            });
                        },
                    },
                    "5": { // Lootbox
                        run: () => {
                            this._rewards.forEach((rew) => {
                                if (rew.match(/lb/gi)) lootbox[user.id] = lootbox[user.id] + parseInt(rew.split("|")[1]) || parseInt(rew.split("|")[1]);
                                fs.writeFile('Storage/lootbox.json', JSON.stringify(lootbox), (err) => {
                                    if (err) console.error(err);
                                });
                            });
                        },
                    },
                };

                this._type.split(",").forEach((type) => {
                    types[type].run();
                });
            };

            notify() {
                let shardEmojis = {"ss":"<:ss_shard:917203009543503892>","s":"<:s_shard:917202925514817566>","a":"<:a_shard:917202904862052392>","b":"<:b_shard:917202862851899392>","c":"<:c_shard:917202862499582002>","d":"<:d_shard:917202840563363891>"};
                let ticketEmojis = {"ss":"<:ss_ticket:927503239396622336>","s":"<:s_ticket:927642487705722890>","a":"<:a_ticket:929420377946472508>","b":"<:b_ticket:929420396535615519>","c":"<:c_ticket:929420424645853214>","d":"<:d_ticket:929420447102152714>"};

                let notification = `<a:starsL:942573254730715246> Achievement unlocked: **${this._title}** <a:starsR:942573194802511923>\n**Rewards**:\n>>> `

                this._type.split(",").forEach((type) => {
                    switch (type) {
                        case "1": this._rewards.forEach((rew) => { if (rew.match(/xp/gi)) notification += `You were given **${rew.split("|")[1]}** XP\n`; }); break;
                        case "2": this._rewards.forEach((rew) => { if (rew.match(/coins/gi)) notification += `Added **${rew.split("|")[1]}** <:coins:872926669055356939>\n`; }); break;
                        case "3": this._rewards.forEach((rew) => { if (rew.match(/shard/gi)) notification += `Added **${rew.split("|")[1]}**x ${shardEmojis[rew.split(" ")[0]]}\n`; }); break;
                        case "4": this._rewards.forEach((rew) => { if (rew.match(/ticket/gi)) notification += `Added **${rew.split("|")[1]}**x ${ticketEmojis[rew.split(" ")[0]]}\n`; }); break;
                        case "5": this._rewards.forEach((rew) => { if (rew.match(/lb/gi)) notification += `Added **${rew.split("|")[1]}** ${rew.split("|")[1] == "1" ? "lootbox" : "lootboxes"}\n`; }); break;
                    };
                });
                message.channel.send(notification);
            };

            check(user = message.author, ...list) {
                if (userAchiev[user.id + message.guild.id] && userAchiev[user.id + message.guild.id].includes(this._id)) return;
                switch(this._id) {
                    case 0: if (pity[user.id + message.guild.id]["pullsTotal"] === 1) this.addRewards(), this.notify(); break;
                    case 1: if (new Set(inventory[user.id + message.guild.id]).size >= 500) this.addRewards(user), this.notify(); break;
                    case 2: if (new Set(inventory[user.id + message.guild.id]).size >= 2000) this.addRewards(user), this.notify(); break;
                    case 3: if (new Set(inventory[user.id + message.guild.id]).size >= 5000) this.addRewards(user), this.notify(); break;
                    case 4: if (list[0] < 21 && list[0] > 2) this.addRewards(), this.notify(); break;
                    case 5: if (list[0] < 3) this.addRewards(), this.notify(); break;
                    case 6: if (arenaResults[user.id + message.guild.id].wins >= 1) this.addRewards(user), this.notify(); break;
                    case 7: if (arenaResults[user.id + message.guild.id].wins >= 20) this.addRewards(user), this.notify(); break;
                    case 8: if (arenaResults[user.id + message.guild.id].wins >= 100) this.addRewards(user), this.notify(); break;
                    case 9: if (dailyStreak[user.id + message.guild.id][0] >= 3) this.addRewards(user), this.notify(); break;
                    case 10: if (dailyStreak[user.id + message.guild.id][0] >= 7) this.addRewards(user), this.notify(); break;
                    case 11: if (dailyStreak[user.id + message.guild.id][0] >= 14) this.addRewards(user), this.notify(); break;
                    case 12: if (dailyStreak[user.id + message.guild.id][0] >= 30) this.addRewards(user), this.notify(); break;
                    case 13: if (list[0] === 3) this.addRewards(user), this.notify(); break;
                    case 14: if (list[0] === 5) this.addRewards(user), this.notify(); break;
                    case 15: if (xp[user.id + message.guild.id] > 659) this.addRewards(user), this.notify(); break;
                    case 16: if (xp[user.id + message.guild.id] > 9046) this.addRewards(user), this.notify(); break;
                    case 17: if (xp[user.id + message.guild.id] > 27863) this.addRewards(user), this.notify(); break;
                    case 18: if (xp[user.id + message.guild.id] > 115211) this.addRewards(user), this.notify(); break;
                    case 19: 
                    case 20: 
                    case 21: 
                    case 22: 
                    case 23: let completed = 0;
                             let chars = [...new Set(inventory[user.id + message.guild.id])].map((e) => characters[e]);
                             auniq.forEach((a) => { if (characters.filter((e) => e.anime === a).length === chars.filter((e) => e.anime === a).length) completed++ });
                             if (this._id === 19) if (completed) this.addRewards(user), this.notify();
                             if (this._id === 20) if (completed >= 10) this.addRewards(user), this.notify();
                             if (this._id === 21) if (completed >= 30) this.addRewards(user), this.notify();
                             if (this._id === 22) if (completed >= 100) this.addRewards(user), this.notify();
                             if (this._id === 23) if (completed >= 250) this.addRewards(user), this.notify(); break;
                    case 24: if (list[0] === 1) this.addRewards(user), this.notify(); break;
                    case 25: if (list[0] === 2) this.addRewards(user), this.notify(); break;
                    case 26: if (list[0] === 3) this.addRewards(user), this.notify(); break;
                    case 27: if (list[0] >= 5) this.addRewards(user), this.notify(); break;
                    case 28: if (list[0] >= 30) this.addRewards(user), this.notify(); break;
                    case 29: if (list[0] >= 100) this.addRewards(user), this.notify(); break;
                    case 30: if (list[0] === "S") this.addRewards(), this.notify(); break;
                    case 31: if (list[0] === "SS") this.addRewards(), this.notify(); break;
                    case 32: if (inventory[user.id + message.guild.id][inventory[user.id + message.guild.id].length-1] === list[0] && characters[list[0]].rarity === "SS") this.addRewards(), this.notify(); break;
                    case 33: this.addRewards(), this.notify(); break;
                    case 34: if (list[0] === 6) this.addRewards(), this.notify(); break;
                    case 35: if (list[0] === 11) this.addRewards(), this.notify(); break;
                    case 36: if (list[0] === 26) this.addRewards(), this.notify(); break;
                    case 37: if (list[0] === 51) this.addRewards(), this.notify(); break;
                    case 38: if (list[0] === 71) this.addRewards(), this.notify(); break;
                    case 39: if (list[0] <= 10) this.addRewards(), this.notify(); break;
                    case 40: if (list[0] <= 3) this.addRewards(), this.notify(); break;
                    case 41: if (list[0] === 1) this.addRewards(), this.notify(); break;
                    case 42: if (list[0] >= 30) this.addRewards(), this.notify(); break;
                    case 43: if (list[0] >= 50) this.addRewards(), this.notify(); break;
                    case 44: if (list[0] >= 80) this.addRewards(), this.notify(); break;
                    case 45: if (list[0] >= 100) this.addRewards(), this.notify(); break;
                    case 46: this.addRewards(), this.notify(); break;
                    case 47: this.addRewards(), this.notify(); break;
                    case 48: this.addRewards(), this.notify(); break;
                    case 49: this.addRewards(), this.notify(); break;
                    default: false; break;
                };
            };

        };


        class questInfo {
            constructor(title, description, id, type, ...rewards) {
                this._title = title;
                this._description = description;
                this._id = id;
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
            get type() { // Type 1: xp, Type 2: coins, Type 3: shards, Type 4: tickets, Type 5: lootbox
                return this._type.split(",");
            };
            get rewards() {
                return this._rewards;
            };

            addRewards(user = message.author) {
                // if (!userAchiev[user.id + message.guild.id]) userAchiev[user.id + message.guild.id] = [];
                // userAchiev[user.id + message.guild.id].push(this._id);

                // fs.writeFile('Storage/userAchiev.json', JSON.stringify(userAchiev), (err) => {
                //     if (err) console.error(err);
                // });
                
                const types = {
                    "1": { // XP
                        run: () => {
                            this._rewards.forEach((rew) => {
                                if (rew.match(/xp/gi)) xp[user.id + message.guild.id] += parseInt(rew.split("|")[1]);
                                fs.writeFile('Storage/xp.json', JSON.stringify(xp), (err) => {
                                    if (err) console.error(err);
                                });

                                // Achievements
                                achievements[15].check(user), achievements[16].check(user), achievements[17].check(user), achievements[18].check(user); // Rising
                            });
                        },
                    },
                    "2": { // Coins
                        run: () => {
                            this._rewards.forEach((rew) => {
                                if (rew.match(/coins/gi)) coins[user.id + message.guild.id] = coins[user.id + message.guild.id] + parseInt(rew.split("|")[1]) || parseInt(rew.split("|")[1]);
                                fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                                    if (err) console.error(err);
                                });
                            });
                        },
                    },
                    "3": { // Shards
                        run: () => {
                            this._rewards.forEach((rew) => {
                                if (rew.match(/shard/gi)) {
                                    if (!shards[user.id + message.guild.id]) shards[user.id + message.guild.id] = {"ss":0,"s":0,"a":0,"b":0,"c":0,"d":0};
                                    shards[user.id + message.guild.id][rew.split(" ")[0]] += parseInt(rew.split("|")[1]);
                                };
                            });
                            fs.writeFile('Storage/shards.json', JSON.stringify(shards), (err) => {
                                if (err) console.error(err);
                            });
                        },
                    },
                    "4": { // Tickets
                        run: () => {
                            this._rewards.forEach((rew) => {
                                if (rew.match(/ticket/gi)) {
                                    if (!tickets[user.id + message.guild.id]) tickets[user.id + message.guild.id] = {"dT": 0,"cT":0,"bT":0,"aT":0,"sT":0,"ssT":0}
                                    tickets[user.id + message.guild.id][rew.split(" ")[0] + "T"] += parseInt(rew.split("|")[1]);
                                };
                            });
                            fs.writeFile('Storage/tickets.json', JSON.stringify(tickets), (err) => {
                                if (err) console.error(err);
                            });
                        },
                    },
                    "5": { // Lootbox
                        run: () => {
                            this._rewards.forEach((rew) => {
                                if (rew.match(/lb/gi)) lootbox[user.id] = lootbox[user.id] + parseInt(rew.split("|")[1]) || parseInt(rew.split("|")[1]);
                                fs.writeFile('Storage/lootbox.json', JSON.stringify(lootbox), (err) => {
                                    if (err) console.error(err);
                                });
                            });
                        },
                    },
                };

                this._type.split(",").forEach((type) => {
                    types[type].run();
                });
            };

            notify() {
                let shardEmojis = {"ss":"<:ss_shard:917203009543503892>","s":"<:s_shard:917202925514817566>","a":"<:a_shard:917202904862052392>","b":"<:b_shard:917202862851899392>","c":"<:c_shard:917202862499582002>","d":"<:d_shard:917202840563363891>"};
                let ticketEmojis = {"ss":"<:ss_ticket:927503239396622336>","s":"<:s_ticket:927642487705722890>","a":"<:a_ticket:929420377946472508>","b":"<:b_ticket:929420396535615519>","c":"<:c_ticket:929420424645853214>","d":"<:d_ticket:929420447102152714>"};

                let notification = `<a:starsL:942573254730715246> Daily Quest Completed: **${this._description}** <a:starsR:942573194802511923>\n**Rewards**:\n>>> `

                this._type.split(",").forEach((type) => {
                    switch (type) {
                        case "1": this._rewards.forEach((rew) => { if (rew.match(/xp/gi)) notification += `You were given **${rew.split("|")[1]}** XP\n`; }); break;
                        case "2": this._rewards.forEach((rew) => { if (rew.match(/coins/gi)) notification += `Added **${rew.split("|")[1]}** <:coins:872926669055356939>\n`; }); break;
                        case "3": this._rewards.forEach((rew) => { if (rew.match(/shard/gi)) notification += `Added **${rew.split("|")[1]}**x ${shardEmojis[rew.split(" ")[0]]}\n`; }); break;
                        case "4": this._rewards.forEach((rew) => { if (rew.match(/ticket/gi)) notification += `Added **${rew.split("|")[1]}**x ${ticketEmojis[rew.split(" ")[0]]}\n`; }); break;
                        case "5": this._rewards.forEach((rew) => { if (rew.match(/lb/gi)) notification += `Added **${rew.split("|")[1]}** ${rew.split("|")[1] == "1" ? "lootbox" : "lootboxes"}\n`; }); break;
                    };
                });
                message.channel.send(notification);
            };

            check(user = message.author, ...list) {
                if (userAchiev[user.id + message.guild.id] && userAchiev[user.id + message.guild.id].includes(this._id)) return;
                switch(this._id) {
                    case 0: if (pity[user.id + message.guild.id]["pullsTotal"] === 1) this.addRewards(), this.notify(); break;
                    case 1: if (new Set(inventory[user.id + message.guild.id]).size >= 500) this.addRewards(user), this.notify(); break;
                    case 2: if (new Set(inventory[user.id + message.guild.id]).size >= 2000) this.addRewards(user), this.notify(); break;
                    case 3: if (new Set(inventory[user.id + message.guild.id]).size >= 5000) this.addRewards(user), this.notify(); break;
                    case 4: if (list[0] < 21 && list[0] > 2) this.addRewards(), this.notify(); break;
                    case 5: if (list[0] < 3) this.addRewards(), this.notify(); break;
                    case 6: if (arenaResults[user.id + message.guild.id].wins >= 1) this.addRewards(user), this.notify(); break;
                    case 7: if (arenaResults[user.id + message.guild.id].wins >= 20) this.addRewards(user), this.notify(); break;
                    case 8: if (arenaResults[user.id + message.guild.id].wins >= 100) this.addRewards(user), this.notify(); break;
                    case 9: if (dailyStreak[user.id + message.guild.id][0] >= 3) this.addRewards(user), this.notify(); break;
                    case 10: if (dailyStreak[user.id + message.guild.id][0] >= 7) this.addRewards(user), this.notify(); break;
                    case 11: if (dailyStreak[user.id + message.guild.id][0] >= 14) this.addRewards(user), this.notify(); break;
                    case 12: if (dailyStreak[user.id + message.guild.id][0] >= 30) this.addRewards(user), this.notify(); break;
                    case 13: if (list[0] === 3) this.addRewards(user), this.notify(); break;
                    case 14: if (list[0] === 5) this.addRewards(user), this.notify(); break;
                    case 15: if (xp[user.id + message.guild.id] > 659) this.addRewards(user), this.notify(); break;
                    case 16: if (xp[user.id + message.guild.id] > 9046) this.addRewards(user), this.notify(); break;
                    case 17: if (xp[user.id + message.guild.id] > 27863) this.addRewards(user), this.notify(); break;
                    case 18: if (xp[user.id + message.guild.id] > 115211) this.addRewards(user), this.notify(); break;
                    case 19: 
                    case 20: 
                    case 21: 
                    case 22: 
                    case 23: let completed = 0;
                             let chars = [...new Set(inventory[user.id + message.guild.id])].map((e) => characters[e]);
                             auniq.forEach((a) => { if (characters.filter((e) => e.anime === a).length === chars.filter((e) => e.anime === a).length) completed++ });
                             if (this._id === 19) if (completed) this.addRewards(user), this.notify();
                             if (this._id === 20) if (completed >= 10) this.addRewards(user), this.notify();
                             if (this._id === 21) if (completed >= 30) this.addRewards(user), this.notify();
                             if (this._id === 22) if (completed >= 100) this.addRewards(user), this.notify();
                             if (this._id === 23) if (completed >= 250) this.addRewards(user), this.notify(); break;
                    case 24: if (list[0] === 1) this.addRewards(user), this.notify(); break;
                    case 25: if (list[0] === 2) this.addRewards(user), this.notify(); break;
                    case 26: if (list[0] === 3) this.addRewards(user), this.notify(); break;
                    case 27: if (list[0] >= 5) this.addRewards(user), this.notify(); break;
                    case 28: if (list[0] >= 30) this.addRewards(user), this.notify(); break;
                    case 29: if (list[0] >= 100) this.addRewards(user), this.notify(); break;
                    case 30: if (list[0] === "S") this.addRewards(), this.notify(); break;
                    case 31: if (list[0] === "SS") this.addRewards(), this.notify(); break;
                    case 32: if (inventory[user.id + message.guild.id][inventory[user.id + message.guild.id].length-1] === list[0] && characters[list[0]].rarity === "SS") this.addRewards(), this.notify(); break;
                    case 33: this.addRewards(), this.notify(); break;
                    case 34: if (list[0] === 6) this.addRewards(), this.notify(); break;
                    case 35: if (list[0] === 11) this.addRewards(), this.notify(); break;
                    case 36: if (list[0] === 26) this.addRewards(), this.notify(); break;
                    case 37: if (list[0] === 51) this.addRewards(), this.notify(); break;
                    case 38: if (list[0] === 71) this.addRewards(), this.notify(); break;
                    case 39: if (list[0] <= 10) this.addRewards(), this.notify(); break;
                    case 40: if (list[0] <= 3) this.addRewards(), this.notify(); break;
                    case 41: if (list[0] === 1) this.addRewards(), this.notify(); break;
                    case 42: if (list[0] >= 30) this.addRewards(), this.notify(); break;
                    case 43: if (list[0] >= 50) this.addRewards(), this.notify(); break;
                    case 44: if (list[0] >= 80) this.addRewards(), this.notify(); break;
                    case 45: if (list[0] >= 100) this.addRewards(), this.notify(); break;
                    case 46: this.addRewards(), this.notify(); break;
                    case 47: this.addRewards(), this.notify(); break;
                    case 48: this.addRewards(), this.notify(); break;
                    case 49: this.addRewards(), this.notify(); break;
                    default: false; break;
                };
            };

        };

        let dailies = [ // Type 1: xp, 2: coins, 3: shards, 4: tickets, 5: lootbox
            new achievInfo("Daily 0", "Complete all of your daily quests", 0, "1,2", "xp|60", "coins|300"),

            new achievInfo("Daily I", "Pull 20 characters", 1, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily II", "Pull an S tier character", 2, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily III", "Collect 50 lilies", 3, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily IV", "Defeat 20 monsters", 4, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily V", "Win 5 arena battles", 5, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily VI", "Spend 500 Coins", 6, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily VII", "Refine a character using shards", 7, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily VIII", "Level a character up", 8, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily IX", "Buy a character pack from the shop", 9, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily X", "Defeat Camelot", 10, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily XI", "Open a lootbox", 11, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily XII", "Gift someone a character (A/S/SS Tier)", 12, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily XIII", "Gift 5 characters", 13, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily XIV", "Sell 3 characters", 14, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily XV", "Use 5 tickets", 15, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily XVI", "Block 2 attacks in a row (dungeon)", 16, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily XVII", "Use a character ability 10 times", 17, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily XVIII", "Use a class skill 10 times", 18, "1,2", "xp|10", "coins|125"),
            new achievInfo("Daily XIX", "Revive yourself 3 times in the dungeon", 19, "1,2", "xp|10", "coins|125"),
        ];


        class itemInfo {
            constructor(name, item, type, emoji, buffs, debuffs, price, grade, id) {
                this._name = name;
                this._item = item;
                this._type = type;
                this._emoji = emoji;
                this._buffs = buffs;
                this._debuffs = debuffs;
                this._price = price;
                this._grade = grade;
                this._id = id;
            };

            get name() {
                return this._name;
            };
            get item() {
                return this._item;
            };
            get type() { // Types: [weapon, fish]
                return this._type;
            };
            get emoji() {
                return this._emoji;
            };
            get bar() {
                switch (this._grade) {
                    case "Normal": return "<:barn:994957076264661073>";
                    case "Special": return "<:bars:994957077787197450>";
                    case "Rare": return "<:barr:994957080073076867>";
                    case "Unique": return "<:baru:994958335558303744>";
                    case "Legendary": return "<:barl:994958337449938954>";
                    case "Mythical": return "<:barm:994958339278647346>";
                    case "Genesis": return "<:barg:994958341128339536>";
                    default: return "<:blank:917804200363171860>";
                };
            };
            get buffs() {
                return this._buffs;
            };
            get debuffs() {
                return this._debuffs;
            };
            get price() {
                return this._price;
            };
            get grade() { // Grades: {1: Normal, 2: Special, 3: Rare, 4: Unique, 5: Legendary, 6: Mythical, 7: Genesis}
                return this._grade;
            };
            get id() {
                return this._id;
            };
        };

        const items = [
            new itemInfo("Durandal", "weapon", "sword", "<:>", {"atk":30}, {}, "", "Mythical", 0),
            new itemInfo("Salmon", "fish", "fish", "<:>", {}, {}, "10", "Normal", 1),
            new itemInfo("Blowfish", "fish", "fish", "<:>", {}, {}, "10", "Normal", 2),
            new itemInfo("Catfish", "fish", "fish", "<:>", {}, {}, "25", "Special", 3),
            new itemInfo("Frog", "fish", "alchemy", "<:frog:994965841206583446>", {}, {}, "25", "Special", 4),
            new itemInfo("Turbot Brill", "fish", "fish", "<:>", {}, {}, "100", "Rare", 5),
            new itemInfo("Koi", "fish", "fish", "<:koi:994966558415798282>", {}, {}, "1000", "Mythical", 6),
        ];


        // /* /* Commands */ */ //
        // /* /* Commands */ */ //
        // /* /* Commands */ */ //

        // Quests
        if (cmd === "quest" || cmd === "quests") {

        };

        // Fishing
        if (cmd === "fish" || cmd === "fishing") {

            // Set up restrictions
            if (fishingCooldown.has(message.author.id + message.guild.id)) return message.channel.send(`You can fish again in ${30 - Math.floor((new Date().getTime() - fishingCooldown.get(message.author.id + message.guild.id))/1000)} seconds`);
            fishingCooldown.set(message.author.id + message.guild.id, new Date().getTime());
            setTimeout(() => fishingCooldown.delete(message.author.id + message.guild.id), 30000);

            let Fish = items.filter((e) => e.item === "fish"); // Rarities: [Normal: 0.4, Special: 0.28, Rare: 0.16, Unique: 0.1, Legendary: 0.047, Mythical: 0.012, Genesis: 0.001]

            let ranRar = Math.floor(Math.random() * 1000); // 0-999
            let rar = "Normal";
            if (ranRar < 1) rar = "Genesis";
            else if (ranRar < 13) rar = "Mythical";
            else if (ranRar < 60) rar = "Legendary";
            else if (ranRar < 160) rar = "Unique";
            else if (ranRar < 320) rar = "Rare";
            else if (ranRar < 600) rar = "Special";

            Fish = Fish.filter((e) => e.grade === rar);
            if (!Fish.length) return message.channel.send(`There are no ${rar} fish yet`);
            let pick = Fish[Math.floor(Fish.length * Math.random())];
            return message.channel.send(`🎣 | You've caught a ${pick.grade} **${pick.name}** ${pick.emoji}`);
        };



        // Guess the character
        if (cmd === "guess-the-character" || cmd === "gtc" || cmd === "charguess" || cmd === "guesschar" || cmd === "guesscharacter") {
            
            let charArray = charactersSS.concat(charactersS).concat(charactersA).concat(charactersB).concat(charactersC);
            let pick = charArray[Math.floor(Math.random() * charArray.length)];
            let points = 10;
            let lettersRevealed = [];
            let animeTitle = "type `anime` to reveal"
            let scores = pick.name.replace(/[^ ]/g, "_").split(" ").map((e) => "\\" + e.split("").join(" \\")).join("ㅤ");
            
            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setImage(pick.image)
            .setTitle("Guess the Character")
            .setDescription(`**Anime**: ${animeTitle}\n${scores}`)
            .setFooter("Hints: letter (-2 points), anime (-6 points)")
            message.channel.send({ embeds: [Embed] }).then((emsg) => {
                
                function gtcSearch(name) {
                    let cArgs = name.split(" ");
    
                    let fastCheck = characters.filter((e) => e.name.toLowerCase() === cArgs.join(' ') || e.alias.some((a) => a.toLowerCase() === cArgs.join(' ')));
                    if (fastCheck[0] !== undefined) return fastCheck[0];
        
                    let fArray = characters.filter((e) => e.name.toLowerCase()[0] === cArgs[0][0] || e.alias.some((a) => a.toLowerCase()[0] === cArgs[0][0]));
        
                    let letter = 0;
                    for (word=0; word < cArgs.length; word++) {
                        let { length:wl } = cArgs[word];
        
                        while (wl--) {
                            fArray = fArray.filter((e) => e.name.toLowerCase().split(" ")[word] === undefined ? false :  e.name.toLowerCase().split(" ")[word][letter] === cArgs[word][letter] || e.alias.some((a) => a.toLowerCase()[letter] === cArgs[word][letter]));
                            letter++;
                        };
        
                        if (fArray.length < 2) break;
                        letter = 0;
                    };
        
                    if (fArray.length === 0) return {};
                    if (fArray.length > 1) return {};
                    return fArray[0];
                };
    
                function msgFilter(msg) {
                    if (msg.author.bot) return false;
                    let char = gtcSearch(msg.content.trim().toLowerCase().split(/ +/g).join(" "));
                    if (!char.name || char.id !== pick.id) return false;
                    return true;
                };

                const collector = message.channel.createMessageCollector({filter: msgFilter, max: 1, time: 60000});
                const hintAnime = message.channel.createMessageCollector({filter: (msg) => msg.content.toLowerCase() === "anime", max: 1, time: 60000});
                const hintLetter = message.channel.createMessageCollector({filter: (msg) => msg.content.toLowerCase() === "letter" && lettersRevealed.length < pick.name.length-1, max: 6, time: 60000});
                const newGame = message.channel.createMessageCollector({filter: (msg) => ["guess-the-character", "gtc", "charguess", "guesschar", "guesscharacter"].map((e) => prefix+e).includes(msg.content.toLowerCase()), max: 1, time: 60000});
                let isPending = true;
                setTimeout(() => {
                    if (isPending) {
                        const Embed = new MessageEmbed()
                        .setColor(0xbbffff)
                        .setThumbnail(pick.image)
                        .setTitle("Time's up!")
                        .setDescription(`And no one got it right <:BigSad:928369010217746442>\n**Name**: ||${pick.name}||\n**Anime**: ${hintAnime.received ? pick.anime : `||${pick.anime}||`}\nNo lilies were earned <:lilium:974057059618291732>`)
                        message.channel.send({ embeds: [Embed] });
                    };
                }, 60000);

                collector.on('collect', msg => {
                    if (!lilium[msg.author.id + msg.guild.id]) lilium[msg.author.id + msg.guild.id] = 0;
                    lilium[msg.author.id + msg.guild.id] += points;
                    fs.writeFile('Storage/lilium.json', JSON.stringify(lilium), (err) => {
                        if (err) console.error(err);
                    });

                    collector.stop(), hintAnime.stop(), hintLetter.stop(), newGame.stop();
                    isPending = false;
    
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setThumbnail(pick.image)
                    .setTitle("You got it! 🎉")
                    .setDescription(`**Name**: ${pick.name}\n**Anime**: ${pick.anime}\nYou've gained **${points}** <:lilium:974057059618291732>`)
                    .setFooter(`${msg.author.tag}`, msg.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
                    message.channel.send({ embeds: [Embed] });
                });
    
                hintAnime.on('collect', msg => {
                    if (points < 6) return message.channel.send("You've already used up all points <:BigSad:928369010217746442>")
                    points -= 6;
                    animeTitle = splitTitle(pick.anime);
                    Embed.setDescription(`**Anime**: ${animeTitle}\n${scores}`);
                    emsg.edit({ embeds: [Embed] });
                });

                hintLetter.on('collect', msg => {
                    if (points < 2) return message.channel.send("You've already used up all points <:BigSad:928369010217746442>")
                    points -= 2;
                    let reveal = Math.floor(Math.random() * pick.name.split(" ").join("").length);
                    let limit = 0;
                    while (lettersRevealed.includes(reveal) && limit < 100) {
                        reveal = Math.floor(Math.random() * pick.name.split(" ").join("").length);
                        limit++;
                    };
                    lettersRevealed.push(reveal);
                    let idx = 0;
                    for (i=0; i < scores.length; i++) {
                        if ((scores[i] === "_" || pick.name.split(" ").join("").includes(scores[i])) && idx++ === reveal) {
                            scores = scores.substring(0, i-1) + pick.name.split(" ").join("")[reveal] + scores.substring(i+1);
                        };
                    };
                    Embed.setDescription(`**Anime**: ${animeTitle}\n${scores}`);
                    emsg.edit({ embeds: [Embed] });
                });

                newGame.on('collect', msg => {
                    collector.stop(), hintAnime.stop(), hintLetter.stop(), newGame.stop();
                    isPending = false;
                });

            });


            // collector.on('end', r => {
            //     message.channel.send({
            //         embed: {
            //             color: '#33FFF0',
            //             title: 'Event is over!',
            //             description: `${m.map(member => `${member.author.username}`).join(', ')}`
            //         }
            //     })
            // });
        };

        // -- -- -- PLAYGROUND -- -- -- //
        // -- -- -- PLAYGROUND -- -- -- //
        // -- -- -- PLAYGROUND -- -- -- //

        // Poke sicherung
        if (cmd === "did") {
            let names = characters.map((e) => e.name).sort();
            let len = names.length-1, res = "";
            while (len--) if (names[len-1] == names[len]) res += names[len--] + "\n";
            message.channel.send(res ? `Yes, he did!\n\n${res}` : "All's fine!");
        };

        // Simulate completion of the game
        if (cmd === "sim" && message.author.id === "489490486734880774") {
            let st = new Date().getTime();
            let chrlen = characters.length;
            let lim = Math.ceil(chrlen/2);
            if (args[0] === "all") lim = chrlen;
            if (!isNaN(args[0])) lim = parseInt(args[0]);
            
            let li = lim;
            let invSim = [];
            while (li--) invSim.push(Math.floor(Math.random() * chrlen));
            while ([...new Set(invSim)].length < lim) invSim.push(Math.floor(Math.random() * chrlen));

            let et = new Date().getTime();
            message.channel.send(`Time: ${et-st}ms\nPulls: ${invSim.length}\nUnique: ${[...new Set(invSim)].length}\n\nF2P average: ${Math.ceil(invSim.length/(6*9))} days, peak: ${Math.ceil(invSim.length/(6*14))} days\nT1 average: ${Math.ceil(invSim.length/(8*9))} days, peak: ${Math.ceil(invSim.length/(8*14))} days\nT2 average: ${Math.ceil(invSim.length/(9*9))} days, peak: ${Math.ceil(invSim.length/(9*14))} days\nT3-5 average: ${Math.ceil(invSim.length/(10*9))} days, peak: ${Math.ceil(invSim.length/(10*14))} days\nT6 average: ${Math.ceil(invSim.length/(12*9))} days, peak: ${Math.ceil(invSim.length/(12*14))} days\nT7 average: ${Math.ceil(invSim.length/(14*9))} days, peak: ${Math.ceil(invSim.length/(14*14))} days`);
        };

        // Calculate the probability of completing the game
        if (cmd === "prob") {
            let st = new Date().getTime();
            let pA = 0;
            let ca = characters.length;
            if (args[0]) ca = parseInt(args[0]);
            for (let ci = ca; ci > 0; ci--) pA += ca/ci;
            let et = new Date().getTime();
            message.channel.send(`Time: ${et-st}ms\nAverage Pulls: ${Math.floor(pA*100)/100}`);
        };

        // Iteration methods
        if (cmd === "This_can_never_actually_run") {
            let st = new Date().getTime();
            // let charsCopy = [...characters].reverse();
            // let char2Copy = [0, ...charsCopy];
            // let errFound = "";

            // Method 1: Fastestn't
            // for (let chr of characters) {
            //     if (charsCopy.filter((e) => e.name === chr.name).length > 1) errFound += `${chr.name} on line #${chr.id}\n`;
            //     charsCopy.pop();
            // };

            // Method 2: Most potentialn't?
            // let len = characters.length;
            // while (len--) {
            //     if (charsCopy.filter((e) => e.name === characters[len].name).length > 1) errFound += `${characters[len].name} on line #${characters[len].id}\n`;
            //     charsCopy.pop();
            // };

            // Method 3: Ok.
            // let names = characters.map((e) => e.name).sort();
            // let results = [];
            // for (i=0; i < names.length-1; i++) {
            //   if (names[i+1] == names[i]) results.push(names[i++]);
            // };

            // Method 4: Best
            // let names = characters.map((e) => e.name).sort();
            // let results = [];
            // let len = names.length-1;
            // while (len--) {
            //     if (names[len-1] == names[len]) results.push(names[len--]);
            // };
            // console.log(results);

            let et = new Date().getTime();
            if (results.length) message.channel.send(`Sample runs: 1000\nTime total: ${et-st}\nAverage time: ${Math.floor((et-st)/100)/10}`);
            else message.channel.send(`Sample runs: 1000\nTime total: ${et-st}\nAverage time: ${Math.floor((et-st)/100)/10}`);
            // if (results.length) message.channel.send(`${et-st}ms\n\nYes, he did!\n\n${results.join("\n")}`);
            // else message.channel.send(`${et-st}ms\n\nAll's fine!`);
        };

        // Add characters to inventory
        if (cmd === "ati" && message.author.id === "489490486734880774") {
            if (!args[0] || !args[1]) return;
            if (!inventory[args[0]]) return message.channel.send("No such inventory found");
            
            let char = search(args.slice(1).join(" "));
            if (!char.name) return;
            
            inventory[args[0]].push(char.id);
            fs.writeFile('Storage/inventory.json', JSON.stringify(inventory), (err) => {
                if (err) console.error(err);
            });

            message.channel.send(`**${char.name}** was added to <@${args[0].slice(0,18)}>'s inventory`);
        };

        // Sim pulls
        if (cmd === "sp" && message.author.id === "489490486734880774") {
            if (!args[0] || !args[1]) return;
            if (!inventory[args[0]]) return message.channel.send("No such inventory found");
            if (!pity[args[0]]) pity[args[0]] = {"pullsTotal": 0, "lastSS": 0, "lastS": 0};
            if (!ref[args[0]]) ref[args[0]] = {};
            if (!xp[args[0]]) xp[args[0]] = 0;

            let sPit = 80;
            let ssPit = 210;
            if (premium[args[0].slice(0,18)]) {
                switch (premium[args[0].slice(0,18)]) {
                    case "1": sPit = 70; ssPit = 180; break;
                    case "2": sPit = 65; ssPit = 170; break;
                    case "3": sPit = 60; ssPit = 160; break;
                    case "4": sPit = 60; ssPit = 160; break;
                    case "5": sPit = 50; ssPit = 150; break;
                    case "6": sPit = 50; ssPit = 150; break;
                    case "7": sPit = 50; ssPit = 150; break;
                    default : false; break;
                };
            };

            for (i=0; i < parseInt(args[1]); i++) {
                let ranRar = Math.floor(Math.random() * 1000); // 0-999

                if (ranRar > 2) pity[args[0]].lastSS++;
                if (ranRar > 20) pity[args[0]].lastS++;

                if (pity[args[0]].lastS >= sPit && pity[args[0]].lastSS >= ssPit) { ranRar = 1; pity[args[0]].lastS--; pity[args[0]].lastSS = 0 };
                if (pity[args[0]].lastS >= sPit) { ranRar = 10; pity[args[0]].lastS = 0 };
                if (pity[args[0]].lastSS >= ssPit) { ranRar = 1; pity[args[0]].lastSS = 0 };        
                
                let fChars;
                if (ranRar > 441) fChars = charactersD;
                else if (ranRar > 188) fChars = charactersC;
                else if (ranRar > 62) fChars = charactersB;
                else if (ranRar > 20) fChars = charactersA;
                else if (ranRar > 2) fChars = charactersS, pity[args[0]].lastS = 0;
                else fChars = charactersSS, pity[args[0]].lastSS = 0;

                let num = Math.floor(Math.random() * fChars.length);
                inventory[args[0]].push(fChars[num].id);
                if (!ref[args[0]][fChars[num].id]) ref[args[0]][fChars[num].id] = 0;
                ref[args[0]][fChars[num].id]++;
            };
            pity[args[0]].pullsTotal += parseInt(args[1]);
            xp[args[0]] += 5*parseInt(args[1]);
            
            fs.writeFile('Storage/inventory.json', JSON.stringify(inventory), (err) => {
                if (err) console.error(err);
            });
            fs.writeFile('Storage/xp.json', JSON.stringify(xp), (err) => {
                if (err) console.error(err);
            });
            fs.writeFile('Storage/pity.json', JSON.stringify(pity), (err) => {
                if (err) console.error(err);
            });
            fs.writeFile('Storage/ref.json', JSON.stringify(ref), (err) => {
                if (err) console.error(err);
            });

            message.channel.send(`Added ${args[1]} characters to <@${args[0].slice(0,18)}>'s inventory`);
        };

        // Add Refinement
        if (cmd === "ar" && message.author.id === "489490486734880774") {
            // Arg 1: UID+SID, Arg 2: Ref lvl, Arg 3+: char
            if (!args[0] || !args[1] || !args[2]) return;
            if (!ref[args[0]]) return message.channel.send("No such inventory found");
            
            let char = search(args.slice(2).join(" "));
            if (!char.name) return;

            ref[args[0]][char.id] = parseInt(args[1]);
            fs.writeFile('Storage/ref.json', JSON.stringify(ref), (err) => {
                if (err) console.error(err);
            });

            message.channel.send(`Set refinement of **${char.name}** to **${args[1]}** (User: <@${args[0].slice(0,18)}>)`);
        };



        // REMOVE REMOVE REMOVE
        // REMOVE REMOVE REMOVE
        // REMOVE REMOVE REMOVE

        // Dungeon
        if (cmd === "demo" || cmd === "demos") {
            if (!args[0]) return message.channel.send("Please select a class\nUsage: `!demo <class>`");

            let fClass = searchClass(args.join(" ").toLowerCase());
            if (!fClass?.name) return;

            if (!(fClass.id in floorBalance)) floorBalance[fClass.id] = {"1":0};
            let floor = parseInt(Object.keys(floorBalance[fClass.id])[Object.keys(floorBalance[fClass.id]).length-1]) || 1;

            if (enemies.filter((e) => e.floor.includes(floor))[0].boss && floorBalance[fClass.id][floor] >= 1) floorBalance[fClass.id][++floor] = 0;
            else if (floorBalance[fClass.id][floor] >= 4) floorBalance[fClass.id][++floor] = 0;
            
            if (floor > 100) floor = 100;

            function getDetailedStatsDemo(id=405) {

                let dStats = {
                    "hp": baseHP(id),
                    "maxhp": 1,
                    "atk": baseATK(id),
                    "def": baseDEF(id),
                    "ep": 0,
                    "md": 0,
                    "mr": 0,
                    "cr": 0.18,
                    "cd": 1.25,
                    "td": 0,
                    "br": 0.2,
                    "agility": 80,
                    "dodge": 0.1,
                    "mana": 80,
                    "mg": 15,
                    "sm": 20,
                    "rev": 0,
                    "revhp": 0.5,
                    "lvl": 60,
                    "ref": 5,
                    "class": fClass.id,
                    "clvl": 40,
                };
                
                let clsStats = classes[dStats.class].stats;
                Object.keys(clsStats).forEach((s) => dStats[s] = dStats[s] * clsStats[s][0] + clsStats[s][1]);
                ["mana", "mg", "sm"].forEach((stat) => dStats[stat] = Math.floor(dStats[stat]));
                
                dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((5+(2*((dStats.hp-180)/60)))*(dStats.lvl-1));
                dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((2.4+(0.35*((dStats.atk-50)/30)))*(dStats.lvl-1));
                dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((1.25+(0.25*((dStats.def-50)/30)))*(dStats.lvl-1));
                // switch (characters[id].rarity) {
                //     case "SS" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((5+(2*((dStats.hp-180)/60)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((2.4+(0.35*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((1.25+(0.25*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
                //     case "S" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((3.9+(0.6*((dStats.hp-150)/50)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((1.9+(0.3*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((1+(0.2*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
                //     case "A" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((3.3+(0.4*((dStats.hp-120)/60)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((1.6+(0.25*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((0.8+(0.15*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
                //     case "B" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((2.8+(0.4*((dStats.hp-100)/50)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((1.2+(0.3*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((0.6+(0.2*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
                //     case "C" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((2.4+(0.4*((dStats.hp-80)/40)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((0.9+(0.35*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((0.5+(0.15*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
                //     case "D" : dStats.hp = Math.floor((1+0.25*(dStats.ref-1))*dStats.hp) + Math.round((2+(0.5*((dStats.hp-70)/30)))*(dStats.lvl-1)); dStats.atk = Math.floor((1+0.25*(dStats.ref-1))*dStats.atk) + Math.round((0.75+(0.25*((dStats.atk-50)/30)))*(dStats.lvl-1)); dStats.def = Math.floor((1+0.25*(dStats.ref-1))*dStats.def) + Math.round((0.4+(0.5*((dStats.def-50)/30)))*(dStats.lvl-1)); break;
                //     default : dStats.hp = 1; dStats.atk = 1; dStats.def = 1; break;
                // };
                dStats.td = dStats.atk, dStats.md = dStats.atk, dStats.mr = dStats.def;
                if (dStats.class !== -1) {
                    ["td","md","mr"].forEach((s) => dStats[s] = Math.floor(dStats[s] * clsStats[s][0] + clsStats[s][1]));
                    let scale;
                    switch (classes[dStats.class].tier) {
                        case 1: scale = {"hp": 4, "atk": 1.3, "md": 1.3, "def": 0.8, "mr": 0.8, "mana": 0.4}; break;
                        case 2: scale = {"hp": 5, "atk": 1.7, "md": 1.7, "def": 0.95, "mr": 0.95, "mana": 0.5}; break;
                        case 3: scale = {"hp": 6, "atk": 2, "md": 2, "def": 1.1, "mr": 1.1, "mana": 0.65}; break;
                        case 4: scale = {"hp": 8, "atk": 3, "md": 3, "def": 1.35, "mr": 1.35, "mana": 0.8}; break;
                        default: break;
                    };
                    ["hp", "atk", "md", "def", "mr", "mana"].forEach((s) => dStats[s] += Math.floor((scale[s] * clsStats[s][0]) * (dStats.clvl-1)));
                };
                dStats.maxhp = dStats.hp;
                dStats.ep = Math.floor(((dStats.hp/Math.pow(0.99818,dStats.def)) / (200/dStats.atk))*100) / 100;
                return dStats;
            };

            // User stats
            let myChar = characters[405];
            let myStats = getDetailedStatsDemo();
            let myStatsC = {...myStats};
            let myClass = fClass;
            let skill = {...skills[fClass.id]};
            let myAbility = abilities[myChar.id];


            // Enemy Stats
            let enemy = enemies.filter((e) => e.floor.includes(floor))[Math.floor(Math.random() * (enemies.filter((e) => e.floor.includes(floor)).length))]
            let ebStats = enemy.stats(floor);
            let curseRar = enemy.boss ? curses.filter((e) => e.tier) : curses.filter((e) => e.tier === 0);
            let curse = curseRar[Math.floor(Math.random() * curseRar.length)];
            let eAbility = enemy.boss ? bossAbilities.find((e) => e.list[0] === floor) : false;
            let eImage = enemy.image[Math.floor(Math.random()*enemy.image.length)];

            let eStats = {
                "hp": ebStats[0],
                "maxhp": ebStats[0],
                "atk": ebStats[1],
                "def": ebStats[2],
                "ep": ebStats[3],
                "md": ebStats[1],
                "mr": ebStats[2],
                "cr": 0.18,
                "cd": 1.25,
                "td": ebStats[1],
                "br": 0.2,
                "agility": 80,
                "dodge": 0.1,
                "mana": 80,
                "mg": 15,
                "sm": 20,
                "rev": 0,
                "revhp": 0.5,
            };
            let eStatsC = {...eStats};

            function hpbar(hp, mana) {
                let bar = "";
                if (hp > 0 && mana > 0) bar += "<:dblhm:944322994749210735>";
                else if (hp > 0) bar += "<:dblh:944322994895990855>";
                else if (mana > 0) bar += "<:dblm:944322994971476038>";
                else return "<:dbl:944322994585612319><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:db:944322995067957288><:dbr:944322994778554400>";

                hp > 0.1 ? hp -= 0.1 : hp=0;
                mana > 0.1 ? mana -= 0.1 : mana=0;
                let ret = 8;
                while (ret--) {
                    if (hp && mana) bar += "<:dbhm:944322994942144542>";
                    else if (hp) bar += "<:dbh:944322995336409128>";
                    else if (mana) bar += "<:dbm:944322995088916541>";
                    else bar += "<:db:944322995067957288>";
                    hp > 0.1 ? hp -= 0.1 : hp=0;
                    mana > 0.1 ? mana -= 0.1 : mana=0;
                };

                if (hp && mana) bar += "<:dbrhm:944322997144158318>";
                else if (hp) bar += "<:dbrh:944322995122503750>";
                else if (mana) bar += "<:dbrm:944322995135086602>";
                else bar += "<:dbr:944322994778554400>";
                return bar;
            };

            let difficulty;
            if (myStats.ep/eStats.ep >= 1.25) difficulty = "<a:arrow_green:916716811842621450> Difficulty: **Easy**";
            else if (myStats.ep/eStats.ep >= 0.75) difficulty = "<a:arrow_orange:916716747623641210> Difficulty: **Medium**";
            else if (myStats.ep/eStats.ep >= 0.5) difficulty = "<a:arrow_red:916716702618767401> Difficulty: **Hard**";
            else difficulty = "<a:arrow_black:916718325386588221> Difficulty: **Impossible**";

            let aDelay = parseInt(animationDelay[message.author.id + message.guild.id]) || 1200;

            let buffs = {
                "hp": [], // [new buff("*", 1.5, 3), new buff("+", 30, 5, 10)]
                "atk": [],
                "def": [],
                "ep": [],
                "md": [],
                "mr": [],
                "cr": [],
                "cd": [],
                "td": [],
                "br": [],
                "agility": [],
                "dodge": [],
                "mana": [],
                "mg": [],
                "sm": [],
                "rev": [],
                "revhp": [],
            };

            let eBuffs = {
                "hp": [],
                "atk": [],
                "def": [],
                "ep": [],
                "md": [],
                "mr": [],
                "cr": [],
                "cd": [],
                "td": [],
                "br": [],
                "agility": [],
                "dodge": [],
                "mana": [],
                "mg": [],
                "sm": [],
                "rev": [],
                "revhp": [],
            };

            function matchResult(r) {
                const Embed = new MessageEmbed()
                .setColor(0xbbffff)
                .setThumbnail(myChar.image)
                let desc = "";
                if (r === "w") {
                    if (!(fClass.id in floorBalance)) floorBalance[fClass.id] = {};
                    if (!(floor in floorBalance[fClass.id])) floorBalance[fClass.id][floor] = 0;
                    floorBalance[fClass.id][floor]++;
                    fs.writeFile('Storage/floorBalance.json', JSON.stringify(floorBalance), (err) => {
                        if (err) console.log(err);
                    });

                    let unlocked = `<a:arrow_green:916716811842621450> Floor ${floor} progress: **${floorBalance[fClass.id][floor]}**/${enemies.filter((e) => e.floor.includes(floor))[0].boss ? "1" : "4"}`;
                    if ((enemies.filter((e) => e.floor.includes(floor))[0].boss && floorBalance[fClass.id][floor] == 1) || (!enemies.filter((e) => e.floor.includes(floor))[0].boss && floorBalance[fClass.id][floor] == 4)) {
                        unlocked = `🔑 Floor **${floor+1}** has been unlocked`;
                        floorBalance[fClass.id][floor+1] = 0;
                    };

                    desc = `<:stars_v2:917023655840591963> **${myChar.name}** won! <:stars_v2:917023655840591963>\n${unlocked}`;
                } else if (r === "l") {
                    desc = `💀 **${myChar.name}** lost 💀\n<a:arrow_green:916716811842621450> Floor ${floor} progress: **${floorBalance[fClass.id][floor]}**/${enemies.filter((e) => e.floor.includes(floor))[0].boss ? "1" : "4"}\n<a:arrow_red:916716702618767401> ${eStats.ep > myStats.ep ? `**${enemy.name}** was ${Math.floor((eStats.ep/myStats.ep)*10000)/100}% stronger` : "Better luck next time"}`;
                };
                Embed.setTitle(`Dungeon Floor ${floor} ${enemy.boss ? "(Boss)" : ""}`)
                .setDescription(desc)
                .setFooter(`Balance: ${coins[message.author.id + message.guild.id]} coins`, message.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
                return Embed;
            };

            let matchStats = {
                turn: 1,
                round: 1,
                roundCheck: 1,
                turnSkill: 0,
                timeout: 0,
                blockStreak: 0,
                defUsed: 0,
                attackStreak: 0,
                combodmg: 0,
                revivedTotal: 0,
                collector: {},
                abilityUsed: 0,
                blockAbilities: 0,
                loot: 0,
                lootm: 1,
                counter: 0,
                counterChance: 1,
                currentCharacter: 0, // 1 = minion
                currentOpponent: 0,
                myStatsCC: {},
                eStatsCC: {},
                mdChance: 0,
                selfdmg: 0,
                selfheal: 0,
                selfhealChance: 0,
                twinshot: 0,
                critbleed: false,
                critbleedlast: 0,
                evadeDeathStrike: 0,
                evadeDeathChance: 0,
                consumeMana: 0,
                dodgebuff: 0,
                heap1: 0,
            };
            let notice = ["", "", "", ""];

            let atkButton = new MessageButton().setCustomId('ATK').setEmoji('⚔️').setStyle('SECONDARY');
            let defButton = new MessageButton().setCustomId('DEF').setEmoji('🛡️').setStyle('SECONDARY');
            let abilityButton = new MessageButton().setCustomId('ABILITY').setEmoji('✨').setStyle('SECONDARY');
            let skillButton = new MessageButton().setCustomId('SKILL').setEmoji('⚜️').setStyle('SECONDARY');
            let skipButton = new MessageButton().setCustomId('SKIP').setEmoji('⏩').setStyle('SECONDARY');
            
            const row = new MessageActionRow()
            .addComponents(atkButton, defButton, abilityButton, skillButton, skipButton);

            if (skill) skill._passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed());
            if (myAbility?.passive) myAbility.passive(myStatsC, myStats, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, new MessageEmbed());

            // skip demo
            if (cmd === "demos") {
                while (eStatsC.hp > 0 && myStatsC.hp > 0) {
                    if (Math.random() > 0.02 + (0.1*(eStatsC.ep/myStatsC.ep))) eStatsC.hp -= Math.floor((myStatsC.atk * Math.pow(0.99818, eStatsC.def)) * (1 - (0.2*Math.random())));
                    if (eStatsC.hp < 0) eStatsC.hp = 0;
                    if (eStatsC.hp > 0) myStatsC.hp -= Math.floor((eStatsC.atk * Math.pow(0.99818, myStatsC.def)) * (1 - (0.2*Math.random())));
                    if (myStatsC.hp < 0) myStatsC.hp = 0;
                };
                
                let result = myStatsC.hp <= 0 ? matchResult("l") : matchResult("w");
                return message.channel.send({ embeds: [result] });
            };

            async function newFight() {
                let timestart = new Date().getTime();
                let result = await new Promise((resolve, rejects) => {
                    const Embed = new MessageEmbed()
                    .setColor(0xbbffff)
                    .setThumbnail(myChar.image)
                    .setFooter(`Enemy EP: ${eStatsC.ep} | time left: 120s`)
                    .setTitle(`Dungeon Floor ${floor} ${enemy.boss ? "(Boss)" : ""}`)
                    .setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStats.hp}\\💖, **${eStatsC.sm}**/${eStatsC.mana}\\💧)\n${hpbar(eStatsC.hp/eStats.hp, eStatsC.sm/eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStats.hp}\\💖, **${myStatsC.sm}**/${myStatsC.mana}\\💧)\n${hpbar(myStatsC.hp/myStats.hp, myStatsC.sm/myStatsC.mana)}\n\\⚔️${myStatsC.atk},\\🛡️${myStatsC.def},\\🎯${Math.floor(myStatsC.cr*100)}%,\\💥${Math.floor(myStatsC.cd*100)}%,\n<:magic_dmg:948568336621527040>${myStatsC.md},\\🔰${myStatsC.mr},\\💨${Math.floor(myStatsC.dodge*100)}%,\\💧+${myStatsC.mg}`)
                    .setImage(eImage)
                    message.channel.send({ embeds: [Embed], components: [row] }).then(msg => {

                        const atk = msg.createMessageComponentCollector({filter: (r) => r.user.id === message.author.id && r.customId === "ATK", componentType: 'BUTTON', time: 120000 });
                        const def = msg.createMessageComponentCollector({filter: (r) => r.user.id === message.author.id && r.customId === "DEF", componentType: 'BUTTON', time: 120000 });
                        const ability = msg.createMessageComponentCollector({filter: (r) => r.user.id === message.author.id && r.customId === "ABILITY", componentType: 'BUTTON', time: 120000 });
                        const cskill = msg.createMessageComponentCollector({filter: (r) => r.user.id === message.author.id && r.customId === "SKILL", componentType: 'BUTTON', time: 120000 });
                        const skip = msg.createMessageComponentCollector({filter: (r) => r.user.id === message.author.id && r.customId === "SKIP", componentType: 'BUTTON', time: 120000 });
                        matchStats.collector = {"atk": atk, "def": def, "ability": ability, "cskill": cskill, "skip": skip};
                        

                        // Use passives
                        if (myChar.id !== 4767) curse.passive(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed);

                        function displayNotice() {
                            return notice[notice.length-4] + notice[notice.length-3] + notice[notice.length-2] + notice[notice.length-1];
                        };

                        let timeout;
                        async function editEmbed() {
                            Embed.setDescription(`You encountered ${enemy.title.split(" ")[0]} **${enemy.title.split(" ").slice(1).join(" ")}**!\n${difficulty}\n\n${curse.emblem}${enemy.name}'s Stats (**${eStatsC.hp}**/${eStatsC.maxhp}${eStatsC.hp === 0 ? "\\💔" : "\\💖"}, **${eStatsC.sm}**/${eStatsC.mana}\\💧)\n${hpbar(eStatsC.hp/eStatsC.maxhp, eStatsC.sm/eStatsC.mana)}\n${myClass ? myClass.emblem : ""}Your Stats (**${myStatsC.hp}**/${myStatsC.maxhp}${myStatsC.hp === 0 ? "\\💔" : "\\💖"}, **${myStatsC.sm}**/${myStatsC.mana}\\💧)\n${hpbar(myStatsC.hp/myStatsC.maxhp, myStatsC.sm/myStatsC.mana)}\n\\⚔️${myStatsC.atk},\\🛡️${myStatsC.def},\\🎯${Math.floor(myStatsC.cr*100)}%,\\💥${Math.floor(myStatsC.cd*100)}%,\n<:magic_dmg:948568336621527040>${myStatsC.md},\\🔰${myStatsC.mr},\\💨${Math.floor(myStatsC.dodge*100)}%,\\💧+${myStatsC.mg}\n-----------------------------------${displayNotice()}`);
                            Embed.setFooter(`Enemy EP: ${eStatsC.ep} | time left: ${120+Math.floor((timestart-new Date().getTime())/1000)}s`);
                            
                            // Debounce
                            clearTimeout(timeout);
                            timeout = setTimeout(() => {
                                msg.edit({ embeds: [Embed] });
                            }, 600);
                        };

                        function minionDefeated(side) {
                            if (side === "my") {
                                myStatsC = {...matchStats.myStatsCC};
                                matchStats.currentCharacter = 0;
                                Embed.setThumbnail(myChar.image);
                                startNextRound();
                            } else {
                                eStatsC = {...matchStats.eStatsCC};
                                matchStats.currentOpponent = 0;
                                Embed.setImage(eImage);
                                attack();
                            };
                        };

                        function checkIfEnded() {
                            if (myStatsC.hp <= 0 || eStatsC.hp <= 0) {
                                if (myStatsC.hp <= 0) {
                                    if (matchStats.currentCharacter) return minionDefeated("my");
                                    if (myStatsC.rev > Math.random()) {
                                        let feedback;
                                        myStatsC.hp += Math.floor(myStats.hp * myStatsC.revhp);
                                        if (myAbility && myAbility.update) feedback = myAbility.update(myStatsC, myStats, eStatsC, eStats, buffs, eBuffs, myChar, enemy, matchStats, notice, resolve, Embed);
                                        else {
                                            notice.push(`✨ ${myChar.name} survived! Restored **${myStatsC.hp}** HP`);
                                            myStatsC.rev = 0;
                                        };
                                        if (feedback === "lost") {
                                            atk.stop(), def.stop(), skip.stop();
                                            if (myChar.id in abilities) ability.stop();
                                            if (myStatsC.class !== -1) cskill.stop();
                                            myStatsC.hp = 1;
                                            matchStats.revivedTotal--;
                                            notice.push(`\n✨ **${myChar.name}** can't beat the enemy. He ran away.`);
                                            resolve(matchResult("l"));
                                        };
                                        matchStats.revivedTotal++;
                                        editEmbed();

                                        // Achievements
                                        achievements[24].check(message.author, matchStats.revivedTotal), achievements[25].check(message.author, matchStats.revivedTotal), achievements[26].check(message.author, matchStats.revivedTotal); // The Show Must Go On
                                    } else {
                                        atk.stop(), def.stop(), skip.stop();
                                        if (myChar.id in abilities) ability.stop();
                                        if (myStats.class !== -1) cskill.stop();

                                        notice.push(`\n💀 **${myChar.name}** lost`);
                                        editEmbed();
                                        matchStats.turn = 1;
                                        resolve(matchResult("l"));
                                    };
                                } else {
                                    if (matchStats.currentOpponent) return minionDefeated("e");
                                    if (eStatsC.rev > Math.random()) {
                                        eStatsC.hp += Math.floor(eStats.hp * eStatsC.revhp);
                                        editEmbed();
                                    } else {
                                        atk.stop(), def.stop(), skip.stop();
                                        if (myChar.id in abilities) ability.stop();
                                        if (myStats.class !== -1) cskill.stop();

                                        notice.push(`\n🎉 **${myChar.name}** won`);
                                        editEmbed();
                                        matchStats.turn = 1;
                                        resolve(matchResult("w"))
                                    };
                                };
                            };
                        };
                        
                        function startNextRound() {
                            if (matchStats.round === matchStats.roundCheck) return;
                            matchStats.roundCheck = matchStats.round;
                            if (matchStats.currentCharacter || matchStats.currentOpponent) return;

                            if (matchStats.consumeMana > 0) {
                                myStatsC.sm -= matchStats.consumeMana;
                                if (matchStats.consumeMana > myStatsC.sm) {
                                    
                                    matchStats.heap1.forEach((e) => {
                                        buffs[e.type].forEach((a, i) => {
                                            if (a.id === e.id) buffs[e.type].splice(i, 1);
                                        });
                                        if (e.type === "mg") myStatsC[e.type] += e.buff;
                                        else myStatsC[e.type] -= e.buff;
                                    });
                                    matchStats.consumeMana = 0;
                                    matchStats.heap1 = [];
                                    notice.push(`\n⚜️ **${myChar.name}** stopped ${myChar.gender === "F" ? "her" : "his"} transformation`);
                                return;};
                            };
                            
                            let mysm = myStatsC.sm, mymana = myStatsC.mana, esm = eStatsC.sm, myhp = myStatsC.hp, myhpm = myStatsC.maxhp, ehp = eStatsC.hp, myrev = myStatsC.rev, myrevh = myStatsC.revhp;
                            myStatsC = {...myStats}, eStatsC = {...eStats};
                            myStatsC.sm = mysm, myStatsC.mana = mymana, eStatsC.sm = esm, myStatsC.hp = myhp, myStatsC.maxhp = myhpm, eStatsC.hp = ehp, myStatsC.rev = myrev, myStatsC.revhp = myrevh;
                            function applyBuffs(obj, stats) {
                                Object.keys(obj).forEach((stat) => {
                                    if (obj[stat].length) obj[stat].forEach((buff) => {
                                        switch (buff.type) {
                                            case "*": stats[stat] = Math.floor(stats[stat] * buff.val); break;
                                            case "+": stats[stat] += buff.val; break;
                                            case "=": stats[stat] = buff.val; break;
                                            default : false; break;
                                        };
                                        switch (buff.ctype) {
                                            case "*": buff._val = Math.floor(buff.val * buff.change); break;
                                            case "+": buff._val += buff.change; break;
                                            case "=": buff._val = buff.change; break;
                                            default : false; break;
                                        };
                                        buff._last--;
                                    });
                                    if (obj[stat].length) obj[stat] = obj[stat].filter((buff) => buff.last);
                                });
                                stats.sm += stats.mg;
                                if (stats.sm > stats.mana) stats.sm = stats.mana;
                            };
                            applyBuffs(buffs, myStatsC);
                            applyBuffs(eBuffs, eStatsC);
                            if (myStatsC.hp > myStatsC.maxhp) myStatsC.hp = myStatsC.maxhp;
                            else if (myStatsC.hp < 0) myStatsC.hp = 0;
                            if (eStatsC.hp > eStatsC.maxhp) eStatsC.hp = eStatsC.maxhp;
                            else if (eStatsC.hp < 0) eStatsC.hp = 0;
                        };
                        
                        function attack() {
                            if (matchStats.turn === 1) return;
                            setTimeout(() => {
                                if (matchStats.blockAbilities-- > 0 && myChar.id !== 4767 && eStatsC.sm >= curse.cost && Math.random() < 0.3) {
                                    curse.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed);
                                    editEmbed();
                                    checkIfEnded();
                                    attack();
                                } else if (matchStats.blockAbilities-- > 0 && myChar.id !== 4767 && eAbility && eStatsC.sm >= eAbility.cost && Math.random() < 0.5) {
                                    eAbility.skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed);
                                    editEmbed();
                                    checkIfEnded();
                                    attack();
                                } else {
                                    if (Math.random() < myStatsC.dodge && !matchStats.counter) {
                                        if (matchStats.dodgebuff) buffs.atk.push(new buffInfo("*", 1+matchStats.dodgebuff, 9999));
                                        notice.push(`\n💨 **${myChar.name}** dodged the attack!${matchStats.dodgebuff ? ` Gained **+${matchStats.dodgebuff*100}%** ATK` : ""}`);
                                    } else {
                                        let ranum = Math.random();
                                        let eDmg = Math.floor((eStatsC.atk * Math.pow(0.99818, myStatsC.def)) * (1 - (0.2*Math.random())) * (ranum < eStatsC.cr ? eStatsC.cd : 1));
                                        if (matchStats.counter > 0 && matchStats.counterChance > Math.random()) {
                                            eStatsC.hp -= eDmg;
                                            if (eStatsC.hp < 0) eStatsC.hp = 0;
                                            notice.push(`\n⚔️ **${myChar.name}** countered the attack! Dealt **${eDmg}** damage`);
                                        } else {
                                            if (eStatsC.hp > 0) myStatsC.hp -= eDmg;
                                            if (myStatsC.hp < 0) myStatsC.hp = 0;
                                            if (myStatsC.hp === 0 && matchStats.evadeDeathStrike > 0 && matchStats.evadeDeathChance > Math.random()) {
                                                myStatsC.hp += eDmg;
                                                matchStats.evadeDeathStrike--;
                                                notice.push(`\n⚔️ **${enemy.name}** has evaded a deadly attack!`);
                                            } else {
                                                notice.push(`\n⚔️ **${enemy.name}** has dealt${ranum < myStatsC.cr ? " a critical hit!" : ""} **${eDmg}** damage`);
                                            };
                                        };
                                        checkIfEnded();
                                    };
                                    matchStats.turn = 1;
                                    matchStats.round++;
                                    startNextRound();
                                    matchStats.blockStreak = 0;
                                    editEmbed();
                                };
                                if (matchStats.counter > 0) matchStats.counter--;
                            }, aDelay);
                        };

                        atk.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`%cERROR Interaction Failed 'deferUpdate()', command: "${cmd}" on "${r.customId}"`, consoleStyle.warning);
                            });
                            
                            if (matchStats.turn === 1) {
                                matchStats.turn = 0;
                                function playerAttack(twin=false) {
                                    if (Math.random() < eStatsC.br) {
                                        matchStats.attackStreak = 0;
                                        notice.push(`\n🛡️ **${enemy.name}** blocked your attack!`);
                                    } else {
                                        let ranum = Math.random(), dmg; // Crit ?
                                        if (Math.random() < matchStats.mdChance) { // Magic Damage ?
                                            dmg = Math.floor((myStatsC.md * (1+(matchStats.attackStreak*matchStats.combodmg)) * Math.pow(0.99818, eStatsC.mr)) * (1 - (0.2*Math.random())) * (ranum < myStatsC.cr ? myStatsC.cd : 1));
                                            notice.push(`\n⚔️ **${myChar.name}** has dealt${ranum < myStatsC.cr ? " a critical hit!" : ""} **${dmg}** magic damage`);
                                        } else {
                                            dmg = Math.floor((myStatsC.atk * (1+(matchStats.attackStreak*matchStats.combodmg)) * Math.pow(0.99818, eStatsC.def)) * (1 - (0.2*Math.random())) * (ranum < myStatsC.cr ? myStatsC.cd : 1));
                                            notice.push(`\n⚔️ **${myChar.name}** has dealt${ranum < myStatsC.cr ? " a critical hit!" : ""} **${dmg}** damage`);
                                        };
                                        eStatsC.hp -= dmg;
                                        matchStats.attackStreak++;
                                        if (ranum < myStatsC.cr && matchStats.critbleed) eBuffs.hp.push(new buffInfo("+", -eStatsC.maxhp*0.05, matchStats.critbleedlast));
                                        myStatsC.hp -= Math.floor(dmg * matchStats.selfdmg);
                                        if (matchStats.selfhealChance > Math.random()) myStatsC.hp += Math.floor(dmg * matchStats.selfheal);
                                    };
                                    if (twin) {
                                        if (eStatsC.hp < 1) eStatsC.hp = 0;
                                        editEmbed(), checkIfEnded(), attack();
                                    };
                                };
                                playerAttack();
                                if (eStatsC.hp < 1) eStatsC.hp = 0;
                                editEmbed();
                                checkIfEnded();
                                if (eStatsC.hp) {
                                    if (matchStats.twinshot > Math.random()) setTimeout(() => { playerAttack(true) }, aDelay);
                                    else attack();
                                };
                            } else message.channel.send("Please wait a moment");
                        });

                        def.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`%cERROR Interaction Failed 'deferUpdate()', command: "${cmd}" on "${r.customId}"`, consoleStyle.warning);
                            });

                            if (matchStats.turn === 1) {
                                if (matchStats.defUsed++ > 9) return message.channel.send("You can use DEF only 10 times per match.");
                                matchStats.turn = 0;
                                matchStats.attackStreak = 0;
                                let adddef = 60 + Math.floor(30 * Math.random());
                                let addmr = Math.floor((myClass ? 60*myClass.stats.mr[0] : 60) + (30 * Math.random()));
                                buffs.def.push(new buffInfo("+", adddef, 9999));
                                buffs.mr.push(new buffInfo("+", addmr, 9999));
                                myStatsC.def += adddef;
                                myStatsC.mr += addmr;
                                notice.push(`\n🛡️ **${myChar.name}** has increased DEF by **${adddef}** and MR by **${addmr}**`);
                                if (Math.random() > myStatsC.br) attack();
                                else setTimeout(() => {
                                    notice.push(`\n🛡️ **${myChar.name}** has blocked **${enemy.name}'s** attack!`);
                                    matchStats.turn = 1;
                                    matchStats.round++;
                                    matchStats.blockStreak++;
                                    startNextRound();
                                    editEmbed();

                                    // Achievements
                                    achievements[13].check(message.author, matchStats.blockStreak), achievements[14].check(message.author, matchStats.blockStreak); // Invincible
                                }, aDelay);
                                
                                editEmbed();
                                checkIfEnded();
                            } else message.channel.send("Please wait a moment");
                        });
                        
                        ability.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`%cERROR Interaction Failed 'deferUpdate()', command: "${cmd}" on "${r.customId}"`, consoleStyle.warning);
                            });

                            if (myAbility.used < myAbility.usage) {
                                if (matchStats.turn === 1) {
                                    if (myAbility.cost > myStatsC.sm) message.channel.send(`You don't have enough mana! (**${myStatsC.sm}**/${myAbility.cost}\\💧)`);
                                    else {
                                        matchStats.turn = 0;
                                        matchStats.attackStreak = 0;
                                        myAbility.used++;
                                        myAbility.ability(myStatsC, myStats, eStatsC, eStats, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed);
                                        myStatsC.sm -= myAbility.cost;
                                        editEmbed();
                                        checkIfEnded();
                                        attack();
                                    };
                                } else message.channel.send("Please wait a moment");
                            } else message.channel.send(`You can use **${myChar.name}**'s ability only ${myAbility.usage == 1 ? "once" : `${myAbility.usage} times`} per fight.`);
                        });

                        cskill.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`%cERROR Interaction Failed 'deferUpdate()', command: "${cmd}" on "${r.customId}"`, consoleStyle.warning);
                            });

                            if (myChar.id === 4767) return message.channel.send("Asta can't use any abilities");
                            if (skill._cost > myStatsC.sm) message.channel.send(`You don't have enough mana! (**${myStatsC.sm}**/${skill._cost}\\💧)`);
                            else {
                                if (matchStats.turn === 1) {
                                    myStatsC.sm -= skill._cost;
                                    matchStats.attackStreak = 0;
                                    skill._skill(myStatsC, eStatsC, buffs, eBuffs, myChar, enemy, matchStats, notice, Embed);
                                    editEmbed();
                                    checkIfEnded();
                                    attack();
                                } else message.channel.send("Please wait a moment");
                            };
                        });

                        skip.on('collect', async r => {
                            await r.deferUpdate().catch((err) => {
                                console.log(`%cERROR Interaction Failed 'deferUpdate()', command: "${cmd}" on "${r.customId}"`, consoleStyle.warning);
                            });

                            if (matchStats.turn == 1) {
                                notice.push(`\n⏩ Skipping to results...`);
                                editEmbed();
                                matchStats.turn = 0;
                                while (eStatsC.hp > 0 && myStatsC.hp > 0) {
                                    if (Math.random() > 0.02 + (0.1*(eStatsC.ep/myStatsC.ep))) eStatsC.hp -= Math.floor((myStatsC.atk * Math.pow(0.99818, eStatsC.def)) * (1 - (0.2*Math.random())));
                                    if (eStatsC.hp < 0) eStatsC.hp = 0;
                                    if (eStatsC.hp > 0) myStatsC.hp -= Math.floor((eStatsC.atk * Math.pow(0.99818, myStatsC.def)) * (1 - (0.2*Math.random())));
                                    if (myStatsC.hp < 0) myStatsC.hp = 0;
                                };
                                
                                setTimeout(() => {
                                    if (myStatsC.hp <= 0 || eStatsC.hp <= 0) {
                                        atk.stop(), def.stop(), skip.stop();
                                        if (abilities[myChar.id]) ability.stop();
                                        checkIfEnded();
                                    };
                                }, aDelay);
                            } else {
                                matchStats.turn = 1;
                                message.channel.send("Please wait a moment");
                            };
                        });
  
                    });

                });
                fs.writeFile('Storage/coins.json', JSON.stringify(coins), (err) => {
                    if (err) console.error(err);
                });
                fs.writeFile('Storage/shards.json', JSON.stringify(shards), (err) => {
                    if (err) console.error(err);
                });
                message.channel.send({ embeds: [result] });
            };
            newFight();
            return;
        };

        if (cmd === "order") {
            let order = [];
            classes.forEach((e) => {
                order.push(`${e.emblem} ${e.name} - Floor ${e.id in floorBalance ? parseInt(Object.keys(floorBalance[e.id])[Object.keys(floorBalance[e.id]).length-1]) || 1 : 1}`);
            });
            order.sort((a, b) => parseInt(b.split("-")[1].split(" ")[2]) - parseInt(a.split("-")[1].split(" ")[2]) );
            
            let pagesTotal = Math.ceil(order.length / 15);
            let currPage = 1;
            if (!isNaN(args[0]) && args[0] <= pagesTotal) currPage = parseInt(args[0]);

            let left = order.length % 15;
            let showUsersF = [];
            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                showUsersF.push(order[i]);
            };

            const Embed = new MessageEmbed()
            .setColor(0xbbffff)
            .setThumbnail(classes[Math.floor(classes.length * Math.random())].image)
            .setTitle("Class Balance Ranking")
            .setDescription(`Character: Lvl 60 R5 Saber, class level 40\n\n${showUsersF.join("\n")}`)
            // .setFooter(`${msg.author.tag}`, msg.author.displayAvatarURL({ dynamic: true }) + "?size=2048")
            message.channel.send({ embeds: [Embed] }).then(msg => {
                msg.react("⏪").then(r => {
                    msg.react("⏩");

                    const prevFilter = (reaction, user1) => reaction.emoji.name === "⏪" && user1.id === message.author.id;
                    const nextFilter = (reaction, user1) => reaction.emoji.name === "⏩" && user1.id === message.author.id;
                    const prev = msg.createReactionCollector({filter: prevFilter, time: 60000});
                    const next = msg.createReactionCollector({filter: nextFilter, time: 60000});

                    prev.on('collect', r => {
                        if (currPage > 1) currPage--;
                        else currPage = pagesTotal;

                        let showUsersF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showUsersF.push(order[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showUsersF.push(order[i]);
                            };
                        };
                        Embed.setDescription(`Character: Lvl 60 R5 Saber, class level 40\n\n${showUsersF.join("\n")}`).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit({ embeds: [Embed] });
                        msg.reactions.resolve("⏪").users.remove(message.author);
                    });

                    next.on('collect', r => {
                        if (currPage < pagesTotal) currPage++;
                        else currPage = 1;

                        let showUsersF = [];
                        if (currPage < pagesTotal || left === 0) {
                            for (i=(currPage-1)*15; i < currPage * 15; i++) {
                                showUsersF.push(order[i]);
                            };
                        } else {
                            for (i=(currPage-1)*15; i < (currPage * 15) - (15-left); i++) {
                                showUsersF.push(order[i]);
                            };
                        };
                        Embed.setDescription(`Character: Lvl 60 R5 Saber, class level 40\n\n${showUsersF.join("\n")}`).setFooter(`Page ${currPage}/${pagesTotal}`);
                        msg.edit({ embeds: [Embed] });
                        msg.reactions.resolve("⏩").users.remove(message.author);
                    });

                });
            });
        };


    }
};