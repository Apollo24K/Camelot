import sqlite3 from 'sqlite3';
import { query } from './postgres';
import { query as sqliteQuery } from './db_handler';

const sqliteDb = new sqlite3.Database('./sqliteDB.db', sqlite3.OPEN_READONLY);

export const migrateData = async () => {
    try {
        console.log('Starting migration...');

        // Migrate users + characters + dungeon (combined tables)
        console.log('Migrating users data...');
        const users = await sqliteQuery('SELECT rowid, * FROM users');
        const characters = await sqliteQuery('SELECT rowid, * FROM characters');
        const dungeons = await sqliteQuery('SELECT rowid, * FROM dungeon');

        for (const user of users) {
            const charData = characters.find((c: any) => c.id === user.id) || {
                chars: '[]',
                ref: '{}',
                level: '{}',
                class: '{}',
                skin: '{}',
                equipment: '{}'
            };

            const dungeonData = dungeons.find((d: any) => d.id === user.id) || {
                floors: '{"1":0}',
                limit: 0,
                classes: '[]',
                classlevels: '{}',
                responsetime: '',
                s_responsetime: ''
            };

            await query(
                `INSERT INTO users (
                    rowid, id, name, xp, coins, lilies, favchar, battlechar, lootbox, lastvote,
                    weeklyclaimed, dailyclaimed, dailystreak, lastdaily, pullcount,
                    pullstacks, pullstacksinterval, pullstotal, lastss, lasts, premium,
                    pullresets, ssshard, sshard, ashard, bshard, cshard, dshard, ssticket,
                    sticket, aticket, bticket, cticket, dticket, votestotal, arenawins,
                    arenalosses, animationdelay, achievements, lastpull, pullreminder,
                    votereminder, items, skins, eventpts, brbest, mailbox, eventrewreceived,
                    gems, tutorial, transactions, dailies, guild, donatedtotal, genesispity,
                    presets, itemlock, party, stampedechar, mailreceived, eventpts2, class,
                    aboutme, profilecolor, jades, pass, passlevel, freepassclaimed, premiumpassclaimed,
                    celebrateclaimed, expulls, level, bank, charxp, feedlimit, findoption,
                    referred_by, referred_gems, referrals_claimed, passpurchaselimit, expity, craze_equipment,
                    equipment, trial_equipment, craze_levels, shield_slot, lastguildjoin, valentine,
                    bosshuntruns, bosshuntrevreceived, monthlyshop, itemwishlist, stampedeenergy,
                    background, backgrounds, charlock, animelock, cow_participation, cow_chars,
                    cow_timer, cow_rolled_today, rank, rankscore, raidxp, guild_marks, created,
                    chars, char_ref, char_level, char_class, char_skin, char_equipment,
                    dungeon_floors, dungeon_limit, dungeon_classes, dungeon_classlevels,
                    dungeon_responsetime, stampede_responsetime
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76, $77, $78, $79, $80, $81, $82, $83, $84, $85, $86, $87, $88, $89, $90, $91, $92, $93, $94, $95, $96, $97, $98, $99, $100, $101, $102, $103, $104, $105, $106, $107, $108, $109, $110, $111, $112, $113, $114, $115, $116, $117, $118)`,
                [
                    user.rowid, user.id, user.name, user.xp, Math.floor(user.coins), user.lilies,
                    user.favchar, user.battlechar, user.lootbox,
                    user.lastvote ? new Date(user.lastvote) : null,
                    user.weeklyclaimed, user.dailyclaimed, user.dailystreak,
                    user.lastdaily ? new Date(user.lastdaily) : null,
                    user.pullcount, user.pullstacks, user.pullstacksinterval,
                    user.pullstotal, user.lastss, user.lasts, user.premium,
                    user.pullresets, user.ssshard, user.sshard, user.ashard,
                    user.bshard, user.cshard, user.dshard, user.ssticket,
                    user.sticket, user.aticket, user.bticket, user.cticket,
                    user.dticket, user.votestotal, user.arenawins,
                    user.arenalosses, user.animationdelay, user.achievements,
                    user.lastpull ? new Date(user.lastpull) : null,
                    user.pullreminder, user.votereminder, user.items,
                    user.skins, user.eventpts, user.brbest, user.mailbox,
                    user.eventrewreceived, user.gems, user.tutorial,
                    user.transactions, user.dailies, user.guild,
                    user.donatedtotal, user.genesispity, user.presets,
                    user.itemlock, user.party, user.stampedechar,
                    user.mailreceived, user.eventpts2, user.class,
                    user.aboutme, user.profilecolor, user.jades, user.pass, user.passlevel,
                    user.freepassclaimed, user.premiumpassclaimed, user.celebrateclaimed,
                    user.expulls, user.level, Math.floor(user.bank), user.charxp, user.feedlimit,
                    user.findoption, user.referred_by, user.referred_gems, user.referrals_claimed,
                    user.passpurchaselimit, user.expity, user.craze_equipment,
                    user.equipment, user.trial_equipment, user.craze_levels,
                    user.shield_slot, user.lastguildjoin ? new Date(user.lastguildjoin) : null,
                    user.valentine, user.bosshuntruns, user.bosshuntrevreceived,
                    user.monthlyshop, user.itemwishlist, user.stampedeenergy,
                    user.background, user.backgrounds ? user.backgrounds.split(',').filter(Boolean) : [],
                    user.charlock ? user.charlock.split(',').map(Number).filter(Boolean) : [],
                    user.animelock ? user.animelock.split(',').map(Number).filter(Boolean) : [],
                    user.cow_participation, user.cow_chars, user.cow_timer,
                    user.cow_rolled_today, user.rank, user.rankscore, user.raidxp,
                    user.guild_marks, new Date(user.created),
                    JSON.parse(charData.chars), charData.ref, charData.level,
                    charData.class, charData.skin, charData.equipment,
                    dungeonData.floors, dungeonData.limit, dungeonData.classes,
                    dungeonData.classlevels, dungeonData.responsetime,
                    dungeonData.s_responsetime
                ]
            );
        };

        // Migrate servers
        console.log('Migrating servers data...');
        const servers = await sqliteQuery('SELECT rowid, * FROM servers');
        for (const server of servers) {
            await query(
                `INSERT INTO servers (rowid, id, name, user_ids) 
                 VALUES ($1, $2, $3, $4)`,
                [server.rowid, server.id, server.name, server.user_ids.split(',').filter(Boolean)]
            );
        };

        // Migrate weapons
        console.log('Migrating weapons data...');
        const weapons = await sqliteQuery('SELECT rowid, * FROM weapons');
        for (const weapon of weapons) {
            await query(
                `INSERT INTO weapons (rowid, id, itemid, uniqueid, level, ascension, character, item_type)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [weapon.rowid, weapon.id, weapon.itemid, weapon.uniqueid, weapon.level,
                weapon.ascension, weapon.character, weapon.item_type]
            );
        };

        // Migrate guilds
        console.log('Migrating guilds data...');
        const guilds = await sqliteQuery('SELECT rowid, * FROM guilds');
        for (const guild of guilds) {
            await query(
                `INSERT INTO guilds (rowid, id, name, description, color, level, icon, banner, treasury, 
                    treasury_gems, tax, canjoin, tokens, membercap, xpbuff, lootbuff, cdreduction, master,
                    elders, members, banned, eventpoints, bosshuntstage, boss1, boss2, boss3, boss4,
                    lastlevelup, raidid)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
                    $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)`,
                [guild.rowid, guild.id, guild.name, guild.description, guild.color, guild.level, guild.icon,
                guild.banner, guild.treasury, guild.treasury_gems, guild.tax, guild.canjoin, guild.tokens,
                guild.membercap, guild.xpbuff, guild.lootbuff, guild.cdreduction, guild.master,
                JSON.stringify(guild.elders.split(',').filter(Boolean)), JSON.stringify(guild.members.split(',').filter(Boolean)), JSON.stringify(guild.banned.split(',').filter(Boolean)), guild.eventpoints,
                guild.bosshuntstage, guild.boss1, guild.boss2, guild.boss3, guild.boss4,
                guild.lastlevelup ? new Date(guild.lastlevelup) : null, guild.raidid]
            );
        };

        // Migrate guild donations
        console.log('Migrating guild donations data...');
        const guild_donations = await sqliteQuery('SELECT rowid, * FROM guild_donations');
        for (const donation of guild_donations) {
            await query(
                `INSERT INTO guild_donations (rowid, userid, guildid, week, type, amount)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [donation.rowid, donation.userid, donation.guildid, donation.week,
                donation.type, donation.amount]
            );
        };

        // Migrate stampedes
        console.log('Migrating stampedes data...');
        const stampedes = await sqliteQuery('SELECT rowid, * FROM stampedes');
        for (const stampede of stampedes) {
            await query(
                `INSERT INTO stampedes (rowid, type, bosshp, bosshpmax, generalhp, generalhpmax,
                    generalstotal, generalsleft, monsterstotal, monstersleft, participation)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [stampede.rowid, stampede.type, stampede.bosshp, stampede.bosshpmax,
                stampede.generalhp, stampede.generalhpmax, stampede.generalstotal,
                stampede.generalsleft, stampede.monsterstotal, stampede.monstersleft,
                stampede.participation]
            );
        };

        // Migrate parties
        console.log('Migrating parties data...');
        const parties = await sqliteQuery('SELECT rowid, * FROM parties');
        for (const party of parties) {
            await query(
                `INSERT INTO parties (rowid, id, name, description, color, icon, banner, members, created)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [party.rowid, party.id, party.name, party.description, party.color, party.icon,
                party.banner, JSON.stringify(party.members.split(',').filter(Boolean)),
                party.created ? new Date(party.created) : null]
            );
        };

        // Migrate trades
        console.log('Migrating trades data...');
        const trades = await sqliteQuery('SELECT rowid, * FROM trades');
        for (const trade of trades) {
            await query(
                `INSERT INTO trades (rowid, id, receiver, type, sent, sent_at)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [trade.rowid, trade.id, trade.receiver, trade.type, trade.sent,
                trade.sent_at ? new Date(trade.sent_at) : null]
            );
        };

        // Migrate FAQ
        console.log('Migrating FAQ data...');
        const faqs = await sqliteQuery('SELECT rowid, * FROM faq');
        for (const faq of faqs) {
            await query(
                `INSERT INTO faq (rowid, id, name, body, created)
                 VALUES ($1, $2, $3, $4, $5)`,
                [faq.rowid, faq.id, faq.name, faq.body,
                faq.created ? new Date(faq.created) : null]
            );
        };

        // Migrate raids
        console.log('Migrating raids data...');
        const raids = await sqliteQuery('SELECT rowid, * FROM raids');
        for (const raid of raids) {
            await query(
                `INSERT INTO raids (rowid, guildid, raidid, enemy_hp, enemy_hpmax, participation, start_date)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [raid.rowid, raid.guildid, raid.raidid, raid.enemy_hp, raid.enemy_hpmax,
                raid.participation, raid.start_date ? new Date(raid.start_date) : null]
            );
        };

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        sqliteDb.close();
    }
};

// // Run migration
// migrateData().catch(console.error);