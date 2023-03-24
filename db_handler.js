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
    await query(`CREATE TABLE IF NOT EXISTS users (id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, xp INT DEFAULT 0 NOT NULL, coins INT DEFAULT 0 NOT NULL, lilies INT DEFAULT 0 NOT NULL, favchar INT, battlechar INT, lootbox INT DEFAULT 0 NOT NULL, lastvote INT, weeklyclaimed INT DEFAULT 0 NOT NULL, dailyclaimed INT DEFAULT 0 NOT NULL, dailystreak INT DEFAULT 0 NOT NULL, lastdaily INT, pullcount INT DEFAULT 0 NOT NULL, pullstacks INT DEFAULT 0 NOT NULL, pullstacksinterval INT DEFAULT 0 NOT NULL, pullstotal INT DEFAULT 0 NOT NULL, lastss INT DEFAULT 0 NOT NULL, lasts INT DEFAULT 0 NOT NULL, premium INT DEFAULT 0 NOT NULL, pullresets INT DEFAULT 0 NOT NULL, ssshard INT DEFAULT 0 NOT NULL, sshard INT DEFAULT 0 NOT NULL, ashard INT DEFAULT 0 NOT NULL, bshard INT DEFAULT 0 NOT NULL, cshard INT DEFAULT 0 NOT NULL, dshard INT DEFAULT 0 NOT NULL, ssticket INT DEFAULT 0 NOT NULL, sticket INT DEFAULT 0 NOT NULL, aticket INT DEFAULT 0 NOT NULL, bticket INT DEFAULT 0 NOT NULL, cticket INT DEFAULT 0 NOT NULL, dticket INT DEFAULT 0 NOT NULL, votestotal INT DEFAULT 0 NOT NULL, arenawins INT DEFAULT 0 NOT NULL, arenalosses INT DEFAULT 0 NOT NULL, animationdelay INT DEFAULT 1200 NOT NULL, achievements BLOB DEFAULT "[]" NOT NULL, lastpull INT, pullreminder INT DEFAULT 0 NOT NULL, votereminder INT DEFAULT 0 NOT NULL, items BLOB DEFAULT "{}" NOT NULL, skins BLOB DEFAULT "[]" NOT NULL, eventpts INT DEFAULT 0 NOT NULL, brbest INT DEFAULT 0 NOT NULL, mailbox BLOB DEFAULT "[]" NOT NULL, eventrewreceived INT DEFAULT 0 NOT NULL, gems INT DEFAULT 0 NOT NULL, tutorial BLOB DEFAULT "[]" NOT NULL, transactions BLOB DEFAULT "[]" NOT NULL, dailies BLOB DEFAULT "{}" NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS servers (id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, user_ids BLOB NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS characters (id TEXT UNIQUE NOT NULL, chars BLOB DEFAULT "[]" NOT NULL, ref BLOB DEFAULT "{}" NOT NULL, level BLOB DEFAULT "{}" NOT NULL, class BLOB DEFAULT "{}" NOT NULL, skin BLOB DEFAULT "{}" NOT NULL, equipment BLOB DEFAULT "{}" NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS dungeon (id TEXT UNIQUE NOT NULL, floors BLOB DEFAULT '{"1":0}' NOT NULL, "limit" INT DEFAULT 0 NOT NULL, classes BLOB DEFAULT "[]" NOT NULL, classlevels BLOB DEFAULT "{}" NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS weapons (id TEXT NOT NULL, itemid INT NOT NULL, uniqueid TEXT UNIQUE NOT NULL, level INT DEFAULT 0 NOT NULL, ascension INT DEFAULT 0 NOT NULL, purity INT DEFAULT 0 NOT NULL, character INT, substats BLOB)`, 'run');

    // Run these when updating
    // await query('ALTER TABLE users ADD gems INT DEFAULT 0 NOT NULL');
    // await query('ALTER TABLE characters ADD equipment BLOB DEFAULT "{}" NOT NULL');
    // await query('ALTER TABLE users ADD tutorial BLOB DEFAULT "[]" NOT NULL');
    // await query('ALTER TABLE users ADD transactions BLOB DEFAULT "[]" NOT NULL');
    // await query('ALTER TABLE users ADD dailies BLOB DEFAULT "{}" NOT NULL');

    // Testing
    // await query(`INSERT INTO weapons (id, itemid, uniqueid) VALUES (489490486734880774, 93, 's1:489490486734880774')`, 'run');
    // await query(`UPDATE weapons SET itemid = 419, level = 0, ascension = 0 WHERE uniqueid = '${"z8:489490486734880774"}'`);
    // await query(`UPDATE characters SET equipment = '${JSON.stringify({"2079":{weapon:"gW:489490486734880774",gloves:"nT:489490486734880774"}})}' WHERE id = 489490486734880774`);

    // Drop tables
    // await query("DROP TABLE users");
    // await query("DROP TABLE servers");
    // await query("DROP TABLE characters");
    // await query("DROP TABLE dungeon");
    // await query("DROP TABLE weapons");
    
    // Delete entries
    // await query(`DELETE FROM weapons WHERE uniqueid != '${"gW:489490486734880774"}'`);

    // await query(`VACUUM`, "run");



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
    
    // // Generate drops
    // let n = 1073741824+700000;
    // while (true) {
    //     await query(`INSERT INTO weapons (id, itemid, uniqueid) VALUES (489490486734880774, 420, '${intToId(n++) + ":489490486734880774"}')`, 'run');
    // };

});

module.exports.db = db;
module.exports.query = query;