// import { migrateData } from './migration';
// import { query as postgresQuery } from './postgres';
// console.log(postgresQuery);

const sqlite3 = require('sqlite3').verbose();
export const db = new sqlite3.Database('./sqliteDB.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error(err.message);
    console.log('Connected to the SQLite database.');
});

export const query = (command, method = 'all') => {
    return new Promise((resolve, reject) => {
        db[method](command, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            };
        });
    });
};

async function createTables() {
    await query(`CREATE TABLE IF NOT EXISTS users (id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, xp INT DEFAULT 0 NOT NULL, coins INT DEFAULT 0 NOT NULL, lilies INT DEFAULT 0 NOT NULL, favchar INT, battlechar INT, lootbox INT DEFAULT 0 NOT NULL, lastvote INT, weeklyclaimed INT DEFAULT 0 NOT NULL, dailyclaimed INT DEFAULT 0 NOT NULL, dailystreak INT DEFAULT 0 NOT NULL, lastdaily INT, pullcount INT DEFAULT 0 NOT NULL, pullstacks INT DEFAULT 0 NOT NULL, pullstacksinterval INT DEFAULT 0 NOT NULL, pullstotal INT DEFAULT 0 NOT NULL, lastss INT DEFAULT 0 NOT NULL, lasts INT DEFAULT 0 NOT NULL, premium INT DEFAULT 0 NOT NULL, pullresets INT DEFAULT 0 NOT NULL, ssshard INT DEFAULT 0 NOT NULL, sshard INT DEFAULT 0 NOT NULL, ashard INT DEFAULT 0 NOT NULL, bshard INT DEFAULT 0 NOT NULL, cshard INT DEFAULT 0 NOT NULL, dshard INT DEFAULT 0 NOT NULL, ssticket INT DEFAULT 0 NOT NULL, sticket INT DEFAULT 0 NOT NULL, aticket INT DEFAULT 0 NOT NULL, bticket INT DEFAULT 0 NOT NULL, cticket INT DEFAULT 0 NOT NULL, dticket INT DEFAULT 0 NOT NULL, votestotal INT DEFAULT 0 NOT NULL, arenawins INT DEFAULT 0 NOT NULL, arenalosses INT DEFAULT 0 NOT NULL, animationdelay INT DEFAULT 1200 NOT NULL, achievements BLOB DEFAULT "[]" NOT NULL, lastpull INT, pullreminder INT DEFAULT 0 NOT NULL, votereminder INT DEFAULT 0 NOT NULL, items BLOB DEFAULT "{}" NOT NULL, skins BLOB DEFAULT "[]" NOT NULL, eventpts INT DEFAULT 0 NOT NULL, brbest INT DEFAULT 0 NOT NULL, mailbox BLOB DEFAULT "[]" NOT NULL, eventrewreceived INT DEFAULT 0 NOT NULL, gems INT DEFAULT 0 NOT NULL, tutorial BLOB DEFAULT "[]" NOT NULL, transactions BLOB DEFAULT "[]" NOT NULL, dailies BLOB DEFAULT "{}" NOT NULL, guild TEXT, donatedtotal INT DEFAULT 0 NOT NULL, genesispity INT DEFAULT 0 NOT NULL, presets BLOB DEFAULT "[]" NOT NULL, itemlock BLOB DEFAULT "[]" NOT NULL, party TEXT, stampedechar INT, mailreceived INT DEFAULT 0, eventpts2 INT DEFAULT 0, class INT, aboutme TEXT, profilecolor TEXT, jades INT DEFAULT 0 NOT NULL, pass INT DEFAULT 0 NOT NULL, passlevel INT DEFAULT 0 NOT NULL, freepassclaimed INT DEFAULT 0 NOT NULL, premiumpassclaimed INT DEFAULT 0 NOT NULL, celebrateclaimed INT DEFAULT 0 NOT NULL, expulls INT DEFAULT 0 NOT NULL, level INT DEFAULT 1 NOT NULL, bank INT DEFAULT -1 NOT NULL, charxp INT DEFAULT 0 NOT NULL, feedlimit INT DEFAULT 0 NOT NULL, findoption INT DEFAULT 1 NOT NULL, referred_gems INT DEFAULT 0 NOT NULL, referrals_claimed INT DEFAULT 0 NOT NULL, passpurchaselimit INT DEFAULT 0 NOT NULL, expity INT DEFAULT 0 NOT NULL, craze_equipment BLOB DEFAULT "{}" NOT NULL, equipment BLOB DEFAULT "{}" NOT NULL, trial_equipment BLOB DEFAULT "{}" NOT NULL, craze_levels BLOB DEFAULT "{}" NOT NULL, shield_slot INT DEFAULT 0 NOT NULL, lastguildjoin INT, valentine TEXT, bosshuntruns INT DEFAULT 0 NOT NULL, bosshuntrevreceived INT DEFAULT 0, monthlyshop BLOB DEFAULT "{}" NOT NULL, itemwishlist BLOB DEFAULT "[]" NOT NULL, stampedeenergy INT DEFAULT 0 NOT NULL, background TEXT, backgrounds BLOB DEFAULT "[]" NOT NULL, charlock BLOB DEFAULT "[]" NOT NULL, animelock BLOB DEFAULT "[]" NOT NULL, cow_participation INT, cow_chars TEXT, cow_timer INT, cow_rolled_today INT DEFAULT 0 NOT NULL, rank TEXT DEFAULT "F-" NOT NULL, rankscore INT DEFAULT 0 NOT NULL, raidxp INT DEFAULT 0 NOT NULL, guild_marks INT DEFAULT 0 NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS servers (id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, user_ids BLOB NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS characters (id TEXT UNIQUE NOT NULL, chars BLOB DEFAULT "[]" NOT NULL, ref BLOB DEFAULT "{}" NOT NULL, level BLOB DEFAULT "{}" NOT NULL, class BLOB DEFAULT "{}" NOT NULL, skin BLOB DEFAULT "{}" NOT NULL, equipment BLOB DEFAULT "{}" NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS dungeon (id TEXT UNIQUE NOT NULL, floors BLOB DEFAULT '{"1":0}' NOT NULL, "limit" INT DEFAULT 0 NOT NULL, classes BLOB DEFAULT "[]" NOT NULL, classlevels BLOB DEFAULT "{}" NOT NULL, responsetime BLOB DEFAULT "" NOT NULL, s_responsetime BLOB DEFAULT "" NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS weapons (id TEXT NOT NULL, itemid INT NOT NULL, uniqueid TEXT UNIQUE NOT NULL, level INT DEFAULT 0 NOT NULL, ascension INT DEFAULT 0 NOT NULL, character INT, item_type TEXT NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS guilds (id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, description TEXT DEFAULT "" NOT NULL, color TEXT, level INT DEFAULT 1 NOT NULL, icon TEXT DEFAULT "https://i.imgur.com/JEvfGSR.png", banner TEXT DEFAULT "", treasury INT DEFAULT 0, treasury_gems INT DEFAULT 0, tax INT DEFAULT 10 NOT NULL, canjoin INT DEFAULT 1 NOT NULL, tokens INT DEFAULT 1 NOT NULL, membercap INT DEFAULT 0 NOT NULL, xpbuff INT DEFAULT 0 NOT NULL, lootbuff INT DEFAULT 0 NOT NULL, cdreduction INT DEFAULT 0 NOT NULL, master TEXT NOT NULL, elders BLOB DEFAULT "" NOT NULL, members BLOB NOT NULL, banned BLOB DEFAULT "" NOT NULL, chat BLOB DEFAULT "[]" NOT NULL, eventpoints INT DEFAULT 0 NOT NULL, bosshuntstage INT DEFAULT 1 NOT NULL, boss1 INT DEFAULT 124080 NOT NULL, boss2 INT DEFAULT 160260 NOT NULL, boss3 INT DEFAULT 113720 NOT NULL, boss4 INT DEFAULT 144640 NOT NULL, lastlevelup INT, raidid INT)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS guild_donations (userid TEXT NOT NULL, guildid TEXT NOT NULL, week INT NOT NULL, type TEXT NOT NULL, amount INT DEFAULT 0 NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS stampedes (type INT DEFAULT 0 NOT NULL, bosshp INT NOT NULL, bosshpmax INT NOT NULL, generalhp INT NOT NULL, generalhpmax INT NOT NULL, generalstotal INT NOT NULL, generalsleft INT NOT NULL, monsterstotal INT NOT NULL, monstersleft INT NOT NULL, participation BLOB DEFAULT "{}" NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS parties (id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, description TEXT DEFAULT "" NOT NULL, color TEXT, icon TEXT DEFAULT "https://i.imgur.com/JEvfGSR.png", banner TEXT DEFAULT "", members BLOB NOT NULL, chat BLOB DEFAULT "[]" NOT NULL, created INT)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS trades (id TEXT NOT NULL, receiver TEXT NOT NULL, type TEXT NOT NULL, sent INT NOT NULL, sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS faq (id TEXT NOT NULL, name TEXT NOT NULL, body TEXT NOT NULL, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS raids (guildid TEXT NOT NULL, raidid INT NOT NULL, enemy_hp INT NOT NULL, enemy_hpmax INT NOT NULL, participation BLOB DEFAULT "{}" NOT NULL, start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`, 'run');
};

async function alterTables() {
    // await query('ALTER TABLE users ADD rank TEXT DEFAULT "F-" NOT NULL');
    // await query('ALTER TABLE users ADD rankscore INT DEFAULT 0 NOT NULL');
    // await query(`ALTER TABLE users ADD raidxp INT DEFAULT 0 NOT NULL`);
    // await query('ALTER TABLE weapons ADD item_type TEXT DEFAULT "weapon" NOT NULL');
    // await query('UPDATE weapons SET item_type = "armor" WHERE substats IS NOT NULL');
    // await query('ALTER TABLE guilds ADD raidid INT');
    // await query('ALTER TABLE users ADD guild_marks INT DEFAULT 0 NOT NULL');

    // Drop purity and substats
    // await query('ALTER TABLE weapons DROP COLUMN purity');
    // await query('ALTER TABLE weapons DROP COLUMN substats');
};

db.serialize(async () => {
    // Create tables
    await createTables();

    // Run this when updating
    await alterTables();



    // // // // Compare Speed of SQLite and Postgres
    // // // await new Promise((resolve) => setTimeout(resolve, 10000));

    // // // { // GET Every User
    // // //     const sqliteStart = new Date().getTime();
    // // //     await query(`SELECT * FROM users`);
    // // //     const sqliteEnd = new Date().getTime();
    // // //     console.log(`SQLite: ${sqliteEnd - sqliteStart}ms`);

    // // //     const postgresStart = new Date().getTime();
    // // //     await postgresQuery(`SELECT * FROM users`);
    // // //     const postgresEnd = new Date().getTime();
    // // //     console.log(`Postgres: ${postgresEnd - postgresStart}ms`);
    // // // };

    // // // { // Loop 1000 times, get a random user with rowid between 1 and 30000
    // // //     const sqliteStart = new Date().getTime();
    // // //     for (let i = 0; i < 1000; i++) {
    // // //         const randomRowid = Math.floor(Math.random() * 30000) + 1;
    // // //         await query(`SELECT * FROM users WHERE rowid = ${randomRowid}`);
    // // //     };
    // // //     const sqliteEnd = new Date().getTime();
    // // //     console.log(`SQLite: ${sqliteEnd - sqliteStart}ms`);

    // // //     const postgresStart = new Date().getTime();
    // // //     for (let i = 0; i < 1000; i++) {
    // // //         const randomRowid = Math.floor(Math.random() * 30000) + 1;
    // // //         await postgresQuery(`SELECT * FROM users WHERE rowid = ${randomRowid}`);
    // // //     };
    // // //     const postgresEnd = new Date().getTime();
    // // //     console.log(`Postgres: ${postgresEnd - postgresStart}ms`);
    // // // };

    // // // { // Write 1000 times a random number between 1 and 1m to users.coins where id = "386942536314519552"
    // // //     const sqliteStart = new Date().getTime();
    // // //     for (let i = 0; i < 1000; i++) {
    // // //         const randomNumber = Math.floor(Math.random() * 1000000) + 1;
    // // //         await query(`UPDATE users SET coins = ${randomNumber} WHERE id = "386942536314519552"`);
    // // //     };
    // // //     const sqliteEnd = new Date().getTime();
    // // //     console.log(`SQLite: ${sqliteEnd - sqliteStart}ms`);

    // // //     const postgresStart = new Date().getTime();
    // // //     for (let i = 0; i < 1000; i++) {
    // // //         const randomNumber = Math.floor(Math.random() * 1000000) + 1;
    // // //         await postgresQuery(`UPDATE users SET coins = $1 WHERE id = $2`, [randomNumber, "386942536314519552"]);
    // // //     };
    // // //     const postgresEnd = new Date().getTime();
    // // //     console.log(`Postgres: ${postgresEnd - postgresStart}ms`);
    // // // };




    // Reset event stats
    // await query(`UPDATE users SET dailies = '{}', pass = 0, expulls = 0, passlevel = 0, freepassclaimed = 0, premiumpassclaimed = 0, passpurchaselimit = 0, eventpts = 0, eventpts2 = 0, eventrewreceived = 0, bosshuntrevreceived = 0`); // , expity = 0
    // await query(`UPDATE guilds SET eventpoints = 0, bosshuntstage = 1, boss1 = 124080, boss2 = 160260, boss3 = 113720, boss4 = 144640`);
    // await query(`UPDATE stampedes SET type = 2 WHERE rowid = 12`);
    // await query(`UPDATE dungeon SET 'limit' = 0`);
    // await query(`UPDATE users SET dailyclaimed = 0, dailies = '{}', feedlimit = 0`); // Daily Reset
    // await query(`UPDATE dungeon SET responsetime = "" WHERE LENGTH(responsetime)/14 < 200`);

    // Prune DB
    // await query(`UPDATE users SET mailbox = '[]'`);
    // await query(`UPDATE dungeon SET responsetime = "", s_responsetime = ""`);
    // await query(`UPDATE weapons SET substats = "{}" WHERE substats IS NOT NULL`);
    // await query(`VACUUM`, "run");
    // console.log("Done pruning database");


    // Add missing trial items to Camelot
    // await addMissingTrialItems();

    // Recover Deleted items
    // {
    //     const fs = require('fs');
    //     let recover = JSON.parse(fs.readFileSync('Storage/recover.json', 'utf8'));

    //     await query(`DELETE FROM weapons WHERE id = '759855947920310393'`);

    //     for (const rec of recover) {
    //         await query(`INSERT INTO weapons (id, itemid, uniqueid, level, ascension, purity, character, substats) values (${rec.id}, ${rec.itemid}, ${rec.uniqueid}, ${rec.level}, ${rec.ascension}, ${rec.purity}, ${rec.character}, ${rec.substats})`);
    //     };

    //     // Write to JSON
    //     // recover = await query(`SELECT * FROM weapons WHERE id = '759855947920310393'`);
    //     // console.log(recover);

    //     // fs.writeFile('Storage/recover.json', JSON.stringify(recover), (err) => {
    //     //     if (err) console.error(err);
    //     // });
    // }

    // // Stampede Top players damage ratio over time
    // {
    //     const damages = await query(`SELECT rowid, participation FROM stampedes`);
    //     damages.forEach((e) => {
    //         const top = 4;
    //         e.participation = JSON.parse(e.participation);
    //         e.damages = Object.values(e.participation).map((e) => Array.isArray(e) ? e[0] : e).sort((a, b) => b - a);
    //         e.global = e.damages.reduce((acc, cur) => acc + cur, 0);
    //         e.top = e.damages.slice(0, top).reduce((acc, cur) => acc + cur, 0);
    //         console.log(`${e.rowid}) Top ${top}: ${e.top}/${e.global} = ${Math.floor((e.top * 10000) / e.global) / 100}`);
    //     });
    // }

    // console.log("Starting updating user_ids");
    // let servers = await query('SELECT * FROM servers');
    // for (const server of servers) {
    //     let rowids = server.user_ids.split(',');

    //     let updatedUserIds = []
    //     for (const rowid of rowids) {
    //         let { 0: user } = await query(`SELECT id FROM users WHERE rowid = ${rowid}`);
    //         if (user?.id) updatedUserIds.push(user.id);
    //     };

    //     updatedUserIds = updatedUserIds.join(',');
    //     await query(`UPDATE servers SET user_ids = "${updatedUserIds}" WHERE id = ${server.id}`);
    // };
    // console.log("Finished updating user_ids");


    // UPDATE Rows
    // { // Move Classes
    //     const users = await query(`SELECT users.id, users.battlechar, characters.class FROM users JOIN characters WHERE users.id = characters.id`);
    //     for (const user of users) {
    //         user.class = JSON.parse(user.class);
    //         if (user.battlechar !== null && user.battlechar in user.class) await query(`UPDATE users SET class = ${user.class[user.battlechar]} WHERE id = ${user.id}`);
    //     };
    //     console.log("Finished moving classes");
    // };

    // await query(`INSERT INTO stampedes (type, bosshp, bosshpmax, generalhp, generalhpmax, generalstotal, generalsleft, monsterstotal, monstersleft) values (0, 1328460, 1328460, 112760, 112760, 5, 5, 378, 378)`);

    // Drop tables
    // await query("DROP TABLE users");
    // await query("DROP TABLE servers");
    // await query("DROP TABLE characters");
    // await query("DROP TABLE dungeon");
    // await query("DROP TABLE weapons");
    // await query("DROP TABLE guilds");
    // await query("DROP TABLE stampedes");

    // await query(`UPDATE dungeon SET responsetime = ""`);
    // await query(`VACUUM`, "run");
    // console.log("Finished Vacuum");

    // TEST \\
    /* TEST */
    // TEST //

    // COUNT Items
    // let all = await query(`SELECT * FROM weapons`);
    // const { items } = require('./Modules/items');
    // console.log("Total: " + all.length + "\nGenesis: "+ all.reduce((total, e) => total += (items[e.itemid].grade === "genesis"), 0) + "\nMythical: "+ all.reduce((total, e) => total += (items[e.itemid].grade === "mythical"), 0) + "\nLegendary: "+ all.reduce((total, e) => total += (items[e.itemid].grade === "legendary"), 0) + "\nUnique: "+ all.reduce((total, e) => total += (items[e.itemid].grade === "unique"), 0) + "\nRare: "+ all.reduce((total, e) => total += (items[e.itemid].grade === "rare"), 0) + "\nSpecial: " + all.reduce((total, e) => total += (items[e.itemid].grade === "special"), 0) + "\nNormal: " + all.reduce((total, e) => total += (items[e.itemid].grade === "normal"), 0));

    // console.log("\nPlayers with items: " + new Set(all.map((e) => e.id)).size)

    // // Items per user
    // const itemsPerUser = await query(`SELECT users.name, COUNT(weapons.id) FROM weapons JOIN users ON users.id = weapons.id GROUP BY weapons.id ORDER BY COUNT(weapons.id) DESC`);
    // console.log(itemsPerUser);


    // UNEQUIP NONEXISTENT ITEMS
    // const equipment = await query(`SELECT id, equipment FROM characters`);
    // for (const account of equipment) {
    //     const ep = JSON.parse(account.equipment);
    //     const epEntries = Object.entries(ep);
    //     for (const chars of epEntries) {
    //         const cid = chars[0];
    //         const cidEntries = Object.entries(chars[1]);
    //         for (const val of cidEntries) {
    //             const { 0: weapon } = await query(`SELECT * FROM weapons WHERE uniqueid = '${val[1]}'`);
    //             if (!weapon) {
    //                 delete ep[cid][val[0]];
    //                 await query(`UPDATE characters SET equipment = '${JSON.stringify(ep)}' WHERE id = ${account.id}`);
    //                 console.log("deleted " + val[1]);
    //             };
    //         };
    //     };
    // };

    // Base 64
    // const base64Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
    // const base = 64;
    // function intToId(num) {
    //     let result = "";
    //     while (num > 0) {
    //       const remainder = num % base;
    //       result = base64Chars[remainder] + result;
    //       num = Math.floor(num / base);
    //     };
    //     return result;
    // };

    // // Generate drops and fill db
    // let n = 1073741824+700000;
    // while (true) {
    //     await query(`INSERT INTO weapons (id, itemid, uniqueid) VALUES (489490486734880774, 420, '${intToId(n++) + ":489490486734880774"}')`, 'run');
    // };

    // Cecilia Fix
    // const corruptedSkins = await query(`SELECT id, skins FROM users`);
    // for (const skins of corruptedSkins) {
    //     if (skins.skins.split(", g")[1]) {
    //         console.log(skins.id);
    //         await query(`UPDATE users SET skins = '${skins.skins.split(", g")[0]}' WHERE id = ${skins.id}`);
    //     }
    // }

    // const evoSkins = await query(`SELECT id, skins FROM users WHERE id = '920894268355248168'`);
    // console.log(evoSkins);

    // const evoSkins = await query(`SELECT id, mailbox FROM users WHERE id = '489490486734880774'`);
    // console.log(evoSkins);

    // const evoSkins = await query(`SELECT responsetime FROM dungeon WHERE id = '770984483058221076'`);
    // console.log(new Date(parseInt(evoSkins[0].responsetime.split(",")[evoSkins[0].responsetime.split(",").length - 2])));

    // Delete
    // await query(`UPDATE dungeon SET responsetime = ''`);

    // Character Inventory Length
    // const { 0: steam } = await query(`SELECT chars FROM characters WHERE id = "404873068318818306"`);
    // console.log(steam.chars.split(",").length)


});


// eslint-disable-next-line no-unused-vars
async function addMissingTrialItems() {
    {
        const { items } = require("./Modules/items.js");
        const cItems = await query(`SELECT * FROM weapons WHERE id = "706183309943767112"`);
        const weapons = items.filter((item) => item.category === "weapon");
        const armors = items.filter((item) => item.category === "armor");
        const rings = items.filter((item) => item.category === "ring");

        // Add missing weapons
        for (const weapon of weapons) {
            if (!cItems.some((e) => e.itemid === weapon.id)) {
                await query(`INSERT INTO weapons (id, itemid, uniqueid, level, ascension, item_type) VALUES ("706183309943767112", ${weapon.id}, "${`${weapon.id}:706183309943767112`}", 70, 5, "${weapon.category}")`, 'run');
            };
        };

        // Add missing armors
        for (const armor of armors) {
            if (!cItems.some((e) => e.itemid === armor.id)) {
                await query(`INSERT INTO weapons (id, itemid, uniqueid, level, ascension, item_type) VALUES ("706183309943767112", ${armor.id}, "${`${armor.id}:706183309943767112`}", 70, 5, "${armor.category}")`, 'run');
            };
        };

        // Add missing rings
        for (const ring of rings) {
            if (!cItems.some((e) => e.itemid === ring.id)) {
                await query(`INSERT INTO weapons (id, itemid, uniqueid, level, ascension, item_type) VALUES ("706183309943767112", ${ring.id}, "${`${ring.id}:706183309943767112`}", 70, 5, "${ring.category}")`, 'run');
            };
        };

        console.log("Finished adding trial items");
    };
}


// const { upload } = require('./Modules/upload.js');

// db.serialize(async () => {
//     const st = new Date().getTime();
//     const img = await upload("https://i.ibb.co/XZsJBNf/c.png", "https://i.imgur.com/vzFuaNd.png") // "https://i.imgur.com/rMupLZS.png"

//     const et = new Date().getTime();
//     console.log(et-st+"ms", img);
// });



// // Start migration
// migrateData().catch(console.error);
