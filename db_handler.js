const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sqliteDB.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error(err.message);
    console.log('Connected to the SQLite database.');
});

const query = (command, method = 'all') => {
    return new Promise((resolve, reject) => {
        db[method](command, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

db.serialize(async () => {
    await query(`CREATE TABLE IF NOT EXISTS users (id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, xp INT DEFAULT 0 NOT NULL, coins INT DEFAULT 0 NOT NULL, lilies INT DEFAULT 0 NOT NULL, favchar INT, battlechar INT, lootbox INT DEFAULT 0 NOT NULL, lastvote INT, weeklyclaimed INT DEFAULT 0 NOT NULL, dailyclaimed INT DEFAULT 0 NOT NULL, dailystreak INT DEFAULT 0 NOT NULL, lastdaily INT, pullcount INT DEFAULT 0 NOT NULL, pullstacks INT DEFAULT 0 NOT NULL, pullstacksinterval INT DEFAULT 0 NOT NULL, pullstotal INT DEFAULT 0 NOT NULL, lastss INT DEFAULT 0 NOT NULL, lasts INT DEFAULT 0 NOT NULL, premium INT DEFAULT 0 NOT NULL, pullresets INT DEFAULT 0 NOT NULL, ssshard INT DEFAULT 0 NOT NULL, sshard INT DEFAULT 0 NOT NULL, ashard INT DEFAULT 0 NOT NULL, bshard INT DEFAULT 0 NOT NULL, cshard INT DEFAULT 0 NOT NULL, dshard INT DEFAULT 0 NOT NULL, ssticket INT DEFAULT 0 NOT NULL, sticket INT DEFAULT 0 NOT NULL, aticket INT DEFAULT 0 NOT NULL, bticket INT DEFAULT 0 NOT NULL, cticket INT DEFAULT 0 NOT NULL, dticket INT DEFAULT 0 NOT NULL, votestotal INT DEFAULT 0 NOT NULL, arenawins INT DEFAULT 0 NOT NULL, arenalosses INT DEFAULT 0 NOT NULL, animationdelay INT DEFAULT 1200 NOT NULL, achievements BLOB DEFAULT "[]" NOT NULL, lastpull INT, pullreminder INT DEFAULT 0 NOT NULL, votereminder INT DEFAULT 0 NOT NULL, items BLOB DEFAULT "{}" NOT NULL, skins BLOB DEFAULT "[]" NOT NULL, eventpts INT DEFAULT 0 NOT NULL, brbest INT DEFAULT 0 NOT NULL, mailbox BLOB DEFAULT "[]" NOT NULL, eventrewreceived INT DEFAULT 0 NOT NULL, gems INT DEFAULT 0 NOT NULL, tutorial BLOB DEFAULT "[]" NOT NULL, transactions BLOB DEFAULT "[]" NOT NULL, dailies BLOB DEFAULT "{}" NOT NULL, guild TEXT, donatedtotal INT DEFAULT 0 NOT NULL, genesispity INT DEFAULT 0 NOT NULL, presets BLOB DEFAULT "[]" NOT NULL, itemlock BLOB DEFAULT "[]" NOT NULL, party TEXT, stampedechar INT, mailreceived INT DEFAULT 0, eventpts2 INT DEFAULT 0, class INT, aboutme TEXT, profilecolor TEXT, voidstones INT DEFAULT 0 NOT NULL, pass INT DEFAULT 0 NOT NULL, passlevel INT DEFAULT 0 NOT NULL, freepassclaimed INT DEFAULT 0 NOT NULL, premiumpassclaimed INT DEFAULT 0 NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS servers (id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, user_ids BLOB NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS characters (id TEXT UNIQUE NOT NULL, chars BLOB DEFAULT "[]" NOT NULL, ref BLOB DEFAULT "{}" NOT NULL, level BLOB DEFAULT "{}" NOT NULL, class BLOB DEFAULT "{}" NOT NULL, skin BLOB DEFAULT "{}" NOT NULL, equipment BLOB DEFAULT "{}" NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS dungeon (id TEXT UNIQUE NOT NULL, floors BLOB DEFAULT '{"1":0}' NOT NULL, "limit" INT DEFAULT 0 NOT NULL, classes BLOB DEFAULT "[]" NOT NULL, classlevels BLOB DEFAULT "{}" NOT NULL, responsetime BLOB DEFAULT "" NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS weapons (id TEXT NOT NULL, itemid INT NOT NULL, uniqueid TEXT UNIQUE NOT NULL, level INT DEFAULT 0 NOT NULL, ascension INT DEFAULT 0 NOT NULL, purity INT DEFAULT 0 NOT NULL, character INT, substats BLOB)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS guilds (id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, description TEXT DEFAULT "" NOT NULL, color TEXT, level INT DEFAULT 1 NOT NULL, icon TEXT DEFAULT "https://i.imgur.com/JEvfGSR.png", banner TEXT DEFAULT "", treasury INT DEFAULT 0, treasury_gems INT DEFAULT 0, canjoin INT DEFAULT 1 NOT NULL, tokens INT DEFAULT 1 NOT NULL, membercap INT DEFAULT 0 NOT NULL, xpbuff INT DEFAULT 0 NOT NULL, lootbuff INT DEFAULT 0 NOT NULL, cdreduction INT DEFAULT 0 NOT NULL, master TEXT NOT NULL, elders BLOB DEFAULT "" NOT NULL, members BLOB NOT NULL, chat BLOB DEFAULT "[]" NOT NULL, eventpoints INT DEFAULT 0 NOT NULL, bosshuntstage INT DEFAULT 1 NOT NULL, boss1 INT DEFAULT 124080 NOT NULL, boss2 INT DEFAULT 160260 NOT NULL, boss3 INT DEFAULT 113720 NOT NULL, boss4 INT DEFAULT 144640 NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS stampedes (type INT DEFAULT 0 NOT NULL, bosshp INT NOT NULL, bosshpmax INT NOT NULL, generalhp INT NOT NULL, generalhpmax INT NOT NULL, generalstotal INT NOT NULL, generalsleft INT NOT NULL, monsterstotal INT NOT NULL, monstersleft INT NOT NULL, participation BLOB DEFAULT "{}" NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS parties (id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, description TEXT DEFAULT "" NOT NULL, color TEXT, icon TEXT DEFAULT "https://i.imgur.com/JEvfGSR.png", banner TEXT DEFAULT "", members BLOB NOT NULL, chat BLOB DEFAULT "[]" NOT NULL, created INT)`, 'run');

    // Run these when updating
    // await query('ALTER TABLE users ADD pass INT DEFAULT 0 NOT NULL');
    // await query('ALTER TABLE users ADD passlevel INT DEFAULT 0 NOT NULL');
    // await query('ALTER TABLE users ADD freepassclaimed INT DEFAULT 0 NOT NULL');
    // await query('ALTER TABLE users ADD premiumpassclaimed INT DEFAULT 0 NOT NULL');


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
    
    // await query(`VACUUM`, "run");


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
    const equipment = await query(`SELECT id, equipment FROM characters`);
    for (const account of equipment) {
        const ep = JSON.parse(account.equipment);
        const epEntries = Object.entries(ep);
        for (const chars of epEntries) {
            const cid = chars[0];
            const cidEntries = Object.entries(chars[1]);
            for (const val of cidEntries) {
                const { 0: weapon } = await query(`SELECT * FROM weapons WHERE uniqueid = '${val[1]}'`);
                if (!weapon) {
                    delete ep[cid][val[0]];
                    await query(`UPDATE characters SET equipment = '${JSON.stringify(ep)}' WHERE id = ${account.id}`);
                    console.log("deleted " + val[1])
                };
            };
        };
    };

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

});

module.exports.db = db;
module.exports.query = query;


// Reroll account
// const bdb = new sqlite3.Database('./backupDB.db', sqlite3.OPEN_READWRITE, (err) => {
//     if (err) console.error(err.message);
//     console.log('Connected to the SQLite database.');
// });

// const queryBackup = (command, method = 'all') => {
//     return new Promise((resolve, reject) => {
//         bdb[method](command, (error, result) => {
//             if (error) {
//                 reject(error);
//             } else {
//                 resolve(result);
//             }
//         });
//     });
// };

// bdb.serialize(async () => {
//     const weapons = await queryBackup(`SELECT * FROM weapons WHERE id = '228682294552952836'`);

//     let wInExistence = await query(`SELECT uniqueid FROM weapons WHERE id = '228682294552952836'`);
//     wInExistence = wInExistence.map((e) => e.uniqueid);

//     // console.log(wInExistence);
//     let wids = weapons.map((e) => e.uniqueid);
//     wInExistence.forEach((e) => console.log(e + ") " + wids.includes(e)));
// });

// const { upload } = require('./Modules/upload.js');

// db.serialize(async () => {
//     const st = new Date().getTime();
//     const img = await upload("https://i.ibb.co/XZsJBNf/c.png", "https://i.imgur.com/vzFuaNd.png") // "https://i.imgur.com/rMupLZS.png"

//     const et = new Date().getTime();
//     console.log(et-st+"ms", img);
// });