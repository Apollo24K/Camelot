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
            };
        });
    });
};

db.serialize(async () => {
    await query(`CREATE TABLE IF NOT EXISTS users (id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, xp INT DEFAULT 0 NOT NULL, coins INT DEFAULT 0 NOT NULL, lilies INT DEFAULT 0 NOT NULL, favchar INT, battlechar INT, lootbox INT DEFAULT 0 NOT NULL, lastvote INT, weeklyclaimed INT DEFAULT 0 NOT NULL, dailyclaimed INT DEFAULT 0 NOT NULL, dailystreak INT DEFAULT 0 NOT NULL, lastdaily INT, pullcount INT DEFAULT 0 NOT NULL, pullstacks INT DEFAULT 0 NOT NULL, pullstacksinterval INT DEFAULT 0 NOT NULL, pullstotal INT DEFAULT 0 NOT NULL, lastss INT DEFAULT 0 NOT NULL, lasts INT DEFAULT 0 NOT NULL, premium INT DEFAULT 0 NOT NULL, pullresets INT DEFAULT 0 NOT NULL, ssshard INT DEFAULT 0 NOT NULL, sshard INT DEFAULT 0 NOT NULL, ashard INT DEFAULT 0 NOT NULL, bshard INT DEFAULT 0 NOT NULL, cshard INT DEFAULT 0 NOT NULL, dshard INT DEFAULT 0 NOT NULL, ssticket INT DEFAULT 0 NOT NULL, sticket INT DEFAULT 0 NOT NULL, aticket INT DEFAULT 0 NOT NULL, bticket INT DEFAULT 0 NOT NULL, cticket INT DEFAULT 0 NOT NULL, dticket INT DEFAULT 0 NOT NULL, votestotal INT DEFAULT 0 NOT NULL, arenawins INT DEFAULT 0 NOT NULL, arenalosses INT DEFAULT 0 NOT NULL, animationdelay INT DEFAULT 1200 NOT NULL, achievements BLOB DEFAULT "[]" NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS servers (id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, user_ids BLOB NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS characters (id TEXT UNIQUE NOT NULL, chars BLOB DEFAULT "[]" NOT NULL, ref BLOB DEFAULT "{}" NOT NULL, level BLOB DEFAULT "{}" NOT NULL, class BLOB DEFAULT "{}" NOT NULL)`, 'run');
    await query(`CREATE TABLE IF NOT EXISTS dungeon (id TEXT UNIQUE NOT NULL, floors BLOB DEFAULT '{"1":0}' NOT NULL, "limit" INT DEFAULT 0 NOT NULL, classes BLOB DEFAULT "[]" NOT NULL, classlevels BLOB DEFAULT "{}" NOT NULL)`, 'run');
});

module.exports.db = db;
module.exports.query = query;