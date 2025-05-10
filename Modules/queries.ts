import { query } from "../postgres";
import { CompactUserSchema, FAQSchema, GuildDonationSchema, GuildSchema, PartySchema, RaidSchema, ServerSchema, StampedeSchema, TradeSchema, UpdateGuildOptions, UpdatePartyOptions, UpdateStampedeOptions, UpdateUserOptions, UpdateWeaponOptions, UserSchema, UserSchemaForStats, WeaponSchema } from "../types";
import { donationWeekStart } from "./components";

function fixBigintForUser(value: Partial<UserSchema>) {
    if ("rowid" in value) value.rowid = Number(value.rowid);
    if ("coins" in value) value.coins = Number(value.coins);
    if ("gems" in value) value.gems = Number(value.gems);
    if ("donatedtotal" in value) value.donatedtotal = Number(value.donatedtotal);
    if ("jades" in value) value.jades = Number(value.jades);
    if ("celebrateclaimed" in value) value.celebrateclaimed = Number(value.celebrateclaimed);
    if ("bank" in value) value.bank = Number(value.bank);
    if ("charxp" in value) value.charxp = Number(value.charxp);
    if ("cow_timer" in value) value.cow_timer = Number(value.cow_timer);
    if ("rankscore" in value) value.rankscore = Number(value.rankscore);
    if ("guild_marks" in value) value.guild_marks = Number(value.guild_marks);
};

//---------------------------------//
//           GET SCHEMAS           //
//---------------------------------//

export const getFullUserSchema = async (id: string): Promise<UserSchema | undefined> => {
    const [user] = await query(`SELECT * FROM users WHERE id = $1`, [id]) as [UserSchema];
    fixBigintForUser(user);
    return user;
};

export const getMinimalUserSchema = async (id: string): Promise<Pick<UserSchema, "rowid" | "id" | "name"> | undefined> => {
    const [user] = await query(`SELECT rowid, id, name FROM users WHERE id = $1`, [id]) as [Pick<UserSchema, "rowid" | "id" | "name">];
    return user;
};

export const getMinimalUserSchemas = async (ids: string[]): Promise<Pick<UserSchema, "rowid" | "id" | "name">[]> => {
    const users = await query(`SELECT rowid, id, name FROM users WHERE id = ANY($1)`, [ids]) as Pick<UserSchema, "rowid" | "id" | "name">[];
    return users;
};

export const getUserSchema = async (id: string): Promise<CompactUserSchema | undefined> => {
    const [user] = await query(`SELECT rowid, id, name, xp, coins, lilies, favchar, battlechar, lootbox, lastvote, weeklyclaimed, dailyclaimed, dailystreak, lastdaily, pullcount, pullstacks, pullstacksinterval, pullstotal, lastss, lasts, premium, pullresets, ssshard, sshard, ashard, bshard, cshard, dshard, ssticket, sticket, aticket, bticket, cticket, dticket, votestotal, arenawins, arenalosses, animationdelay, achievements, lastpull, pullreminder, votereminder, items, skins, eventpts, eventpts2, brbest, mailbox, eventrewreceived, gems, tutorial, dailies, guild, donatedtotal, genesispity, presets, itemlock, party, stampedechar, mailreceived, class, aboutme, profilecolor, jades, pass, passlevel, freepassclaimed, premiumpassclaimed, celebrateclaimed, expulls, level, bank, charxp, feedlimit, findoption, referred_by, referred_gems, referrals_claimed, passpurchaselimit, expity, craze_equipment, equipment, trial_equipment, craze_levels, shield_slot, lastguildjoin, valentine, bosshuntruns, bosshuntrevreceived, monthlyshop, itemwishlist, stampedeenergy, background, backgrounds, charlock, animelock, cow_participation, cow_chars, cow_timer, cow_rolled_today, rankscore, raidxp, guild_marks, chars, char_ref, char_skin, dungeon_floors, dungeon_limit, dungeon_classes, dungeon_classlevels, image_credits, skill_tree, skill_points, raid_supports FROM users WHERE id = $1`, [id]) as [CompactUserSchema];
    fixBigintForUser(user);
    return user;
};

export const getUserSchemas = async (ids: string[] | "*", whereClause?: string): Promise<CompactUserSchema[]> => {
    const query_str = `SELECT rowid, id, name, xp, coins, lilies, favchar, battlechar, lootbox, lastvote, weeklyclaimed, dailyclaimed, dailystreak, lastdaily, pullcount, pullstacks, pullstacksinterval, pullstotal, lastss, lasts, premium, pullresets, ssshard, sshard, ashard, bshard, cshard, dshard, ssticket, sticket, aticket, bticket, cticket, dticket, votestotal, arenawins, arenalosses, animationdelay, achievements, lastpull, pullreminder, votereminder, items, skins, eventpts, eventpts2, brbest, mailbox, eventrewreceived, gems, tutorial, dailies, guild, donatedtotal, genesispity, presets, itemlock, party, stampedechar, mailreceived, class, aboutme, profilecolor, jades, pass, passlevel, freepassclaimed, premiumpassclaimed, celebrateclaimed, expulls, level, bank, charxp, feedlimit, findoption, referred_by, referred_gems, referrals_claimed, passpurchaselimit, expity, craze_equipment, equipment, trial_equipment, craze_levels, shield_slot, lastguildjoin, valentine, bosshuntruns, bosshuntrevreceived, monthlyshop, itemwishlist, stampedeenergy, background, backgrounds, charlock, animelock, cow_participation, cow_chars, cow_timer, cow_rolled_today, rankscore, raidxp, guild_marks, chars, char_ref, char_skin, dungeon_floors, dungeon_limit, dungeon_classes, dungeon_classlevels, image_credits, skill_tree, skill_points FROM users ${whereClause ? whereClause : ""}`;

    if (ids === "*") {
        const users = await query(query_str, []) as CompactUserSchema[];
        users.forEach(fixBigintForUser);
        return users;
    } else {
        const users = await query(`${query_str} WHERE id = ANY($1)`, [ids]) as CompactUserSchema[];
        users.forEach(fixBigintForUser);
        return users;
    }
};

export const getServerSchema = async (id: string): Promise<ServerSchema | undefined> => {
    const [server] = await query(`SELECT * FROM servers WHERE id = $1`, [id]) as [ServerSchema];
    return server;
};

export const getWeaponSchema = async (uniqueid: string): Promise<WeaponSchema | undefined> => {
    const [weapon] = await query(`SELECT * FROM weapons WHERE uniqueid = $1`, [uniqueid]) as [WeaponSchema];
    return weapon;
};

export const getUserWeaponCount = async (userId: string, item_type?: "weapon" | "armor" | "ring"): Promise<number> => {
    if (item_type === undefined) {
        const [count] = await query(`SELECT COUNT(*) AS count FROM weapons WHERE id = $1`, [userId]) as [{ count: number; }];
        return count.count ?? 0;
    } else {
        const [count] = await query(`SELECT COUNT(*) AS count FROM weapons WHERE id = $1 AND item_type = $2`, [userId, item_type]) as [{ count: number; }];
        return count.count ?? 0;
    };
};

export const getWeaponSchemas = async (uniqueids: string[]): Promise<WeaponSchema[]> => {
    const weapons = await query(`SELECT * FROM weapons WHERE uniqueid = ANY($1)`, [uniqueids]) as WeaponSchema[];
    return weapons;
};

export const getWeaponDupeSchemas = async (itemId: number, userId: string, excludeId?: string): Promise<WeaponSchema[]> => {
    const weapons = await query(`SELECT * FROM weapons WHERE itemid = $1 AND id = $2 ${excludeId ? `AND uniqueid != $3` : ""}`, excludeId ? [itemId, userId, excludeId] : [itemId, userId]) as WeaponSchema[];
    return weapons;
};

export const getGuildSchema = async (id: string): Promise<GuildSchema | undefined> => {
    const [guild] = await query(`SELECT * FROM guilds WHERE id = $1`, [id]) as [GuildSchema];
    return guild;
};

export const getGuildSchemas = async (ids: string[] | "*", whereClause?: string): Promise<GuildSchema[]> => {
    const query_str = `SELECT * FROM guilds ${whereClause ? whereClause : ""}`;
    if (ids === "*") {
        const guilds = await query(query_str, []) as GuildSchema[];
        return guilds;
    } else {
        const guilds = await query(`${query_str} WHERE id = ANY($1)`, [ids]) as GuildSchema[];
        return guilds;
    };
};

export const getGuildDonationSchema = async (rowid: string): Promise<GuildDonationSchema | undefined> => {
    const [guildDonation] = await query(`SELECT * FROM guild_donations WHERE rowid = $1`, [rowid]) as [GuildDonationSchema];
    return guildDonation;
};

export const getGuildDonationSchemas = async (id: string, week?: number, type?: "coins" | "gems"): Promise<GuildDonationSchema[]> => {
    let str = `SELECT * FROM guild_donations WHERE guildid = $1`;
    const params: any[] = [id];

    if (week !== undefined) {
        str += ` AND week = $2`;
        params.push(week);

        if (type !== undefined) {
            str += ` AND type = $3`;
            params.push(type);
        };
    } else if (type !== undefined) {
        str += ` AND type = $2`;
        params.push(type);
    };

    const guildDonation = await query(str, params) as GuildDonationSchema[];
    return guildDonation ?? [];
};

export const getStampedeSchema = async (id: string): Promise<StampedeSchema | undefined> => {
    const [stampede] = await query(`SELECT * FROM stampedes WHERE id = $1`, [id]) as [StampedeSchema];
    return stampede;
};

export const getPartySchema = async (id: string): Promise<PartySchema | undefined> => {
    const [party] = await query(`SELECT * FROM parties WHERE id = $1`, [id]) as [PartySchema];
    return party;
};

export const getTradeSchema = async (id: string): Promise<TradeSchema | undefined> => {
    const [trade] = await query(`SELECT * FROM trades WHERE id = $1`, [id]) as [TradeSchema];
    return trade;
};

export const getFAQSchema = async (id: string): Promise<FAQSchema | undefined> => {
    const [faq] = await query(`SELECT * FROM faq WHERE id = $1`, [id]) as [FAQSchema];
    return faq;
};

export const getFAQSchemaByName = async (name: string): Promise<FAQSchema | undefined> => {
    const [faq] = await query(`SELECT * FROM faq WHERE name = $1`, [name]) as [FAQSchema];
    return faq;
};

export const getRaidSchema = async (id: string): Promise<RaidSchema | undefined> => {
    const [raid] = await query(`SELECT * FROM raids WHERE id = $1`, [id]) as [RaidSchema];
    return raid;
};

//--------------------------------------------//
//               GET STATEMENTS               //
//--------------------------------------------//

export const getTotalPlayers = async (): Promise<number> => {
    const [result] = await query(`SELECT COUNT(rowid) AS players FROM users`) as [{ players: number; }];
    return result.players;
};

export const getPlayerbaseStats = async (): Promise<{ players: number; active: number; daily: number; }> => {
    const [result] = await query(`SELECT COUNT(rowid) AS players, COUNT(lastpull) FILTER (WHERE lastpull > NOW() - INTERVAL '7 days') AS active, COUNT(lastpull) FILTER (WHERE lastpull > NOW() - INTERVAL '1 day') AS daily FROM users`) as [{ players: number; active: number; daily: number; }];
    return result;
};

export const getPartyMembers = async (partyId: string, options: { excludeIds: string[], hasStampedeChar?: boolean, hasChristmasChar?: boolean; } = { excludeIds: [], hasStampedeChar: false, hasChristmasChar: false }): Promise<Pick<UserSchema, "id" | "name" | "party" | "stampedechar" | "stampedeenergy" | "craze_equipment" | "battlechar" | "cow_chars" | "cow_participation" | "cow_timer">[]> => {
    let members = await query(`SELECT id, name, party, stampedechar, stampedeenergy, craze_equipment, battlechar, cow_chars, cow_participation, cow_timer FROM users WHERE party = $1 AND id != ANY($2)`, [partyId, options.excludeIds]) as Pick<UserSchema, "id" | "name" | "party" | "stampedechar" | "stampedeenergy" | "craze_equipment" | "battlechar" | "cow_chars" | "cow_participation" | "cow_timer">[];

    if (options.hasStampedeChar) members = members.filter((e) => e.stampedechar !== null);
    if (options.hasChristmasChar) members = members.filter((e) => e.craze_equipment.char !== undefined);

    return members ?? [];
};

export const getPremiumUsers = async (): Promise<Pick<UserSchema, "id" | "premium">[]> => {
    const users = await query(`SELECT id, premium FROM users WHERE premium > 0`, []) as Pick<UserSchema, "id" | "premium">[];
    return users;
};

export const getLatestRaid = async (guildId: string): Promise<RaidSchema | undefined> => {
    const [raid] = await query(`SELECT * FROM raids WHERE guildid = $1 AND end_date IS NULL ORDER BY rowid DESC LIMIT 1`, [guildId]) as [RaidSchema];
    return raid;
};

export const getRaidByRaidId = async (raidId: number): Promise<RaidSchema | undefined> => {
    const [raid] = await query(`SELECT * FROM raids WHERE raidid = $1`, [raidId]) as [RaidSchema];
    return raid;
};

export const getLatestStampede = async (): Promise<StampedeSchema | undefined> => {
    const [stampede] = await query(`SELECT * FROM stampedes ORDER BY rowid DESC LIMIT 1`) as [StampedeSchema];
    return stampede;
};

export const getPastStampedes = async (past: number): Promise<StampedeSchema[]> => {
    const stampedes = await query(`SELECT * FROM stampedes ORDER BY rowid DESC LIMIT $1`, [past]) as StampedeSchema[];
    return stampedes;
};

export const getUserRanking = async (scope: "server" | "global", user_ids: string[], orderBy: "xp" | "pullstotal" | "chars" | "uniqueChars"): Promise<Pick<UserSchema, "name" | "id" | "xp" | "pullstotal" | "favchar" | "premium" | "chars" | "char_skin">[]> => {
    const orderByClause = orderBy === "uniqueChars"
        ? "COALESCE(array_length(array(select distinct unnest(chars)), 1), 0) DESC"
        : orderBy === "chars"
            ? "COALESCE(array_length(chars, 1), 0) DESC"
            : `${orderBy} DESC`;

    const result = await query(
        `SELECT name, id, xp, pullstotal, favchar, premium, chars, char_skin FROM users ${scope === "server" ? `WHERE id = ANY($1)` : ""} ORDER BY ${orderByClause} LIMIT 1501`,
        scope === "server" ? [user_ids] : []
    ) as Pick<UserSchema, "name" | "id" | "xp" | "pullstotal" | "favchar" | "premium" | "chars" | "char_skin">[];
    return result ?? [];
};

export const getFindUsers = async (ids: string[] | "*", charId: number): Promise<Pick<CompactUserSchema, "id" | "name" | "findoption" | "chars">[]> => {
    const query_str = `SELECT id, name, findoption, chars FROM users WHERE findoption != 2 AND chars @> ARRAY[${charId}]`;

    if (ids === "*") {
        const users = await query(query_str, []) as Pick<CompactUserSchema, "id" | "name" | "findoption" | "chars">[];
        return users;
    } else {
        const users = await query(`${query_str} AND id = ANY($1)`, [ids]) as Pick<CompactUserSchema, "id" | "name" | "findoption" | "chars">[];
        return users;
    };
};

export const getAllFAQSchemas = async (): Promise<FAQSchema[]> => {
    const faq = await query(`SELECT rowid, * FROM faq`) as FAQSchema[];
    return faq;
};

export const getWeaponCount = async (itemId: number): Promise<number> => {
    const [count] = await query(`SELECT COUNT(*) AS count FROM weapons WHERE itemid = $1`, [itemId]) as [{ count: number; }];
    return count.count;
};

export const getUserWeapons = async (userId: string): Promise<WeaponSchema[]> => {
    const weapons = await query(`SELECT * FROM weapons WHERE id = $1`, [userId]) as WeaponSchema[];
    return weapons ?? [];
};

export const getReferredUsers = async (userId: string): Promise<(Pick<UserSchema, "id" | "name" | "created" | "dungeon_floors" | "xp"> & { age: number; floor: number; level: number; })[]> => {
    const users = await query(`SELECT id, name, created, dungeon_floors, xp,
        FLOOR(EXTRACT(EPOCH FROM (NOW() - created)) / 86400) AS age,
        (SELECT COALESCE(MAX(CAST(key AS INTEGER)), 1)
         FROM jsonb_object_keys(dungeon_floors) key) AS floor,
        1::integer as level
        FROM users
        WHERE referred_by = $1
    `, [userId]) as (Pick<UserSchema, "id" | "name" | "created" | "dungeon_floors" | "xp"> & { age: number; floor: number; level: number; })[];
    return users;
};

export const getIndirectReferredUsers = async (userId: string): Promise<(Pick<UserSchema, "id" | "name" | "xp"> & { age: number; floor: number; level: number; })[]> => {
    const { rows: users } = await query(`
        SELECT u.id, u.name, u.xp,
        FLOOR(EXTRACT(EPOCH FROM (NOW() - u.created)) / 86400) AS age,
        (SELECT COALESCE(MAX(CAST(key AS INTEGER)), 1)
         FROM jsonb_object_keys(u.dungeon_floors) key) AS floor,
        1::integer as level
        FROM users u
        WHERE u.referred_by IN (
            SELECT id FROM users WHERE referred_by = $1
        )
    `, [userId]) as { rows: (Pick<UserSchema, "id" | "name" | "xp"> & { age: number; floor: number; level: number; })[]; };
    return users;
};

export const getReferralLeaderboard = async (type: "weekly" | "monthly" | "alltime"): Promise<{ referred_by: string; referral_count: string; }[]> => {
    const timeFilter = type === "weekly" ?
        "EXTRACT(EPOCH FROM (NOW() - created)) / 86400 < 7" :
        type === "monthly" ?
            "EXTRACT(EPOCH FROM (NOW() - created)) / 86400 < 30" :
            "TRUE";

    const leaderboard = await query(
        `SELECT referred_by, COUNT(*)::text as referral_count 
         FROM users 
         WHERE referred_by IS NOT NULL 
         AND ${timeFilter}
         GROUP BY referred_by 
         ORDER BY COUNT(*) DESC`,
        []
    ) as { referred_by: string; referral_count: string; }[];

    return leaderboard;
};

export const getUsersByName = async (name: string): Promise<Pick<UserSchema, "id" | "name">[]> => {
    const users = await query(`
        SELECT id, name FROM users
        WHERE LOWER(name) LIKE LOWER($1)
        ORDER BY 
            CASE 
                WHEN LOWER(name) = LOWER($1) THEN 0
                WHEN LOWER(name) LIKE LOWER($1 || '%') THEN 1
                ELSE 2
            END,
            name
    `, [`%${name}%`]) as Pick<UserSchema, "id" | "name">[];

    return users;
};

export const getAllTrades = async (): Promise<TradeSchema[]> => {
    const trades = await query(`SELECT * FROM trades`) as TradeSchema[];
    return trades ?? [];
};

export const getTradesOfUser = async (userId: string): Promise<TradeSchema[]> => {
    const trades = await query(`SELECT * FROM trades WHERE id = $1 OR receiver = $1`, [userId]) as TradeSchema[];
    return trades ?? [];
};

export const getResponseTimes = async (userId: string, flags: { stampede?: boolean; } = { stampede: false }): Promise<Date[]> => {
    const [{ responsetime }] = await query(`SELECT ${flags.stampede ? "stampede_responsetime" : "dungeon_responsetime"} AS responsetime FROM users WHERE id = $1`, [userId]) as { responsetime: Date[]; }[];
    return responsetime ?? [];
};

export const getUserTransactions = async (userId: string[] | "*"): Promise<Pick<UserSchema, "rowid" | "id" | "name" | "transactions">[]> => {
    const transactions = await query(`SELECT rowid, id, name, transactions FROM users ${userId === "*" ? "WHERE transactions::text <> '[]'" : "WHERE id = ANY($1)"}`, userId === "*" ? [] : [userId]) as Pick<UserSchema, "rowid" | "id" | "name" | "transactions">[];
    return transactions ?? [];
};

export const getUserTransaction = async (userId: string): Promise<Pick<UserSchema, "rowid" | "id" | "name" | "transactions"> | undefined> => {
    const [transactions] = await getUserTransactions([userId]);
    return transactions;
};


//--------------------------------------------//
//              CHECK STATEMENTS              //
//--------------------------------------------//

export const doesUserExist = async (userId: string): Promise<boolean> => {
    const user = await getMinimalUserSchema(userId);
    return !!user;
};

//-------------------------------------------//
//              LOAD STATEMENTS              //
//-------------------------------------------//

export const loadPullResets = async (): Promise<Pick<UserSchema, "id" | "premium" | "lastpull">[]> => {
    // Step 1: Reset completed users
    await query(`
        UPDATE users 
        SET pullcount = 0
        WHERE pullcount > 0
        AND lastpull < CASE premium
            WHEN 0 THEN $1::timestamp
            WHEN 1 THEN $2::timestamp
            WHEN 2 THEN $2::timestamp  
            WHEN 3 THEN $2::timestamp
            WHEN 4 THEN $3::timestamp
            WHEN 5 THEN $4::timestamp
            WHEN 6 THEN $4::timestamp
            WHEN 7 THEN $4::timestamp
            ELSE $1::timestamp
        END`,
        [
            new Date(new Date().getTime() - (45 * 60 * 1000)),
            new Date(new Date().getTime() - (40 * 60 * 1000)),
            new Date(new Date().getTime() - (35 * 60 * 1000)),
            new Date(new Date().getTime() - (30 * 60 * 1000))
        ]
    );

    // Step 2: Return pending users
    const users = await query(`SELECT id, premium, lastpull FROM users WHERE pullcount > 0`, []) as Pick<UserSchema, "id" | "premium" | "lastpull">[];
    return users;
};

export const loadVoteReminders = async (): Promise<Pick<UserSchema, "id" | "lastvote">[]> => {
    const users = await query(`SELECT id, lastvote FROM users 
        WHERE votereminder = 1 
        AND lastvote IS NOT NULL
        AND (EXTRACT(EPOCH FROM (NOW() - lastvote)) / 3600) < 12
    `, []) as Pick<UserSchema, "id" | "lastvote">[];
    return users;
};

export const loadRanking = async (pass: number, batchSize: number): Promise<UserSchemaForStats[]> => {
    const users = await query(`SELECT id, name, xp, premium, battlechar, level, bank, char_ref, equipment, shield_slot, class, dungeon_classlevels, dungeon_floors FROM users WHERE battlechar IS NOT NULL ORDER BY rowid LIMIT $1 OFFSET $2`, [batchSize, pass * batchSize]) as UserSchemaForStats[];
    return users;
};

export const loadCowParticipants = async (): Promise<(Pick<CompactUserSchema, "id" | "name" | "party" | "cow_chars" | "cow_participation"> & { points?: number; })[]> => {
    const users = await query(`SELECT id, name, party, cow_chars, cow_participation FROM users WHERE cow_participation IS NOT NULL ORDER BY cow_participation DESC`) as (Pick<CompactUserSchema, "id" | "name" | "party" | "cow_chars" | "cow_participation"> & { points?: number; })[];
    return users;
};


//-------------------------------------------//
//             INSERT STATEMENTS             //
//-------------------------------------------//

export const insertNewUser = async (id: string, name: string): Promise<CompactUserSchema> => {
    const { rows: [user] } = await query(`INSERT INTO users (id, name) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET name = $2 RETURNING *`, [id, name]) as { rows: CompactUserSchema[]; };
    return user;
};

export const insertNewServer = async (id: string, name: string, userId: string): Promise<ServerSchema> => {
    const { rows: [server] } = await query(`INSERT INTO servers (id, name, user_ids) VALUES ($1, $2, $3) RETURNING *`, [id, name, [userId]]) as { rows: ServerSchema[]; };
    return server;
};

export const insertNewWeapon = async (userId: string, itemId: number, itemType: string, uniqueId?: string, level?: number, ascension?: number): Promise<WeaponSchema> => {
    const columns = ['id', 'itemid', 'item_type'];
    const values = [userId, itemId, itemType];

    if (uniqueId) {
        columns.push('uniqueid');
        values.push(uniqueId);
    };
    if (level !== undefined) {
        columns.push('level');
        values.push(level);
    };
    if (ascension !== undefined) {
        columns.push('ascension');
        values.push(ascension);
    };

    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const { rows: [weapon] } = await query(
        `INSERT INTO weapons (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
    ) as { rows: WeaponSchema[]; };

    return weapon;
};

export const insertNewTrade = async (id: string, receiver: string, type: "coins" | "char", sent: number): Promise<TradeSchema> => {
    const { rows: [trade] } = await query(`INSERT INTO trades (id, receiver, type, sent) VALUES ($1, $2, $3, $4) RETURNING *`, [id, receiver, type, sent]) as { rows: TradeSchema[]; };
    return trade;
};

export const insertNewStampede = async (): Promise<void> => {
    const values = {
        type: 0,
        bosshp: 183_728_460,
        bosshpmax: 183_728_460,
        generalhp: 1_582_760,
        generalhpmax: 1_582_760,
        generalstotal: 486,
        generalsleft: 486,
        monsterstotal: 0,
        monstersleft: 0
    };

    await query(`INSERT INTO stampedes (type, bosshp, bosshpmax, generalhp, generalhpmax, generalstotal, generalsleft, monsterstotal, monstersleft) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [values.type, values.bosshp, values.bosshpmax, values.generalhp, values.generalhpmax, values.generalstotal, values.generalsleft, values.monsterstotal, values.monstersleft]);
};

export const insertNewRaid = async (guildId: string, raidId: number, enemyHp: number): Promise<RaidSchema> => {
    const { rows: [raid] } = await query(`INSERT INTO raids (guildid, raidid, enemy_hp, enemy_hpmax) VALUES ($1, $2, $3, $4) RETURNING *`, [guildId, raidId, enemyHp, enemyHp]) as { rows: RaidSchema[]; };
    return raid;
};

export const insertNewGuild = async (name: string, guildMaster: string): Promise<GuildSchema> => {
    const { rows: [guild] } = await query(`INSERT INTO guilds (name, master, members) VALUES ($1, $2, $3) RETURNING *`, [name, guildMaster, [guildMaster]]) as { rows: GuildSchema[]; };
    return guild;
};

export const insertNewParty = async (name: string, members: string[]): Promise<PartySchema> => {
    const { rows: [party] } = await query(`INSERT INTO parties (name, members, created) VALUES ($1, $2, $3) RETURNING *`, [name, members, new Date()]) as { rows: PartySchema[]; };
    return party;
};

export const insertNewFAQ = async (id: string, name: string, body: string): Promise<FAQSchema> => {
    const { rows: [faq] } = await query(`INSERT INTO faq (id, name, body) VALUES ($1, $2, $3) RETURNING *`, [id, name, body]) as { rows: FAQSchema[]; };
    return faq;
};

//-------------------------------------------//
//             DELETE STATEMENTS             //
//-------------------------------------------//

export const deleteGuild = async (guildId: string): Promise<void> => {
    await query(`DELETE FROM guilds WHERE id = $1`, [guildId]);
};

export const deleteParty = async (partyId: string): Promise<void> => {
    await query(`DELETE FROM parties WHERE id = $1`, [partyId]);
};

export const deleteFAQ = async (name: string): Promise<void> => {
    await query(`DELETE FROM faq WHERE name = $1`, [name]);
};

export const deleteWeapon = async (uniqueId: string): Promise<WeaponSchema | undefined> => {
    const { rows: [weapon] } = await query(`DELETE FROM weapons WHERE uniqueid = $1 RETURNING *`, [uniqueId]) as { rows: WeaponSchema[]; };
    return weapon;
};

export const deleteWeapons = async (uniqueIds: string[]): Promise<void> => {
    await query(`DELETE FROM weapons WHERE uniqueid = ANY($1)`, [uniqueIds]);
};

//---------------------------------------------//
//             TRANSFER STATEMENTS             //
//---------------------------------------------//

export const transferAccount = async (oldId: string, newId: string): Promise<void> => {
    await query(`DELETE FROM trades WHERE id = $1 OR receiver = $1`, [newId]);
    await query(`DELETE FROM weapons WHERE id = $1`, [newId]);
    await query(`DELETE FROM users WHERE id = $1`, [newId]);

    await query(`UPDATE users SET id = $1 WHERE id = $2`, [newId, oldId]);
    await query(`UPDATE weapons SET id = $1, uniqueid = SUBSTRING(uniqueid, 1, POSITION(':' IN uniqueid)) || $1 WHERE id = $2`, [newId, oldId]);
    await query(`UPDATE trades SET id = $1 WHERE id = $2`, [newId, oldId]);
    await query(`UPDATE trades SET receiver = $1 WHERE receiver = $2`, [newId, oldId]);

    const stats = await getUserSchema(newId);
    if (stats) {
        // Guild
        const guild = stats.guild ? await getGuildSchema(stats.guild) : undefined;
        if (guild) {
            // Update guild members
            guild.members = guild.members.filter(e => e !== oldId);
            guild.members.push(newId);

            // Update guild elders
            if (guild.elders.includes(oldId)) {
                guild.elders = guild.elders.filter(e => e !== oldId);
                guild.elders.push(newId);
            };

            // Update guilds table
            if (guild.master === oldId) {
                await updateGuilds(guild.id, {
                    master: { type: "set", value: newId },
                    members: { type: "set", value: guild.members },
                    elders: { type: "set", value: guild.elders }
                });
            } else {
                await updateGuilds(guild.id, {
                    members: { type: "set", value: guild.members },
                    elders: { type: "set", value: guild.elders }
                });
            };
        };

        // Party
        const party = stats.party ? await getPartySchema(stats.party) : undefined;
        if (party) {
            party.members = party.members.filter(e => e !== oldId);
            party.members.push(newId);

            await updateParties(party.id, {
                members: { type: "set", value: party.members }
            });
        };
    };
};

//-------------------------------------------//
//             UPDATE STATEMENTS             //
//-------------------------------------------//

export const addUserToServer = async (serverId: string, userId: string): Promise<void> => {
    await query(`UPDATE servers SET user_ids = array_append(user_ids, $1) WHERE id = $2 AND NOT $1 = ANY(user_ids)`, [userId, serverId]);
};

export const addGuildDonation = async (guildId: string, userId: string, type: "coins" | "gems", amount: number): Promise<void> => {

    const week = Math.ceil((Date.now() - donationWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));

    const [donation] = await query(`SELECT * FROM guild_donations WHERE guildid = $1 AND userid = $2 AND week = $3 AND type = $4`, [guildId, userId, week, type]) as [GuildDonationSchema | undefined];

    if (donation) {
        await query(`UPDATE guild_donations SET amount = amount + $1 WHERE userid = $2 AND guildid = $3 AND week = $4 AND type = $5`, [amount, userId, guildId, week, type]);
    } else {
        await query(`INSERT INTO guild_donations (userid, guildid, week, type, amount) values ($1, $2, $3, $4, $5)`, [userId, guildId, week, type, amount]);
    };

    // Update guilds table
    await updateGuilds(guildId, {
        [type === "coins" ? "treasury" : "treasury_gems"]: { type: "increment", value: amount }
    });
};

export const resetDailyResponses = async (): Promise<void> => {
    await query(`UPDATE users SET dungeon_responsetime = ARRAY[]::timestamp[] WHERE array_length(dungeon_responsetime, 1) < 200`);
};

export const resetDungeonLimit = async (): Promise<void> => {
    await query(`
        UPDATE users
        SET dungeon_limit = CASE
            WHEN premium = 7 THEN 
                CASE 
                    WHEN dungeon_limit > 20 THEN 0
                    WHEN dungeon_limit < -20 THEN -40
                    ELSE dungeon_limit - 20
                END
            ELSE 0
        END
    `);
};

export const updateFAQBody = async (name: string, body: string): Promise<void> => {
    await query(`UPDATE faq SET body = $1 WHERE name = $2`, [body, name]);
};

export const cancelRaid = async (rowid: number): Promise<"success" | "error"> => {
    const { rows: [raid] } = await query(`UPDATE raids SET end_date = CURRENT_TIMESTAMP WHERE rowid = $1 RETURNING *`, [rowid]) as { rows: RaidSchema[]; };
    if (raid.end_date) return "success";
    return "error";
};

export const updateStampedeParticipation = async (stampedeRowId: number, partyId: string | null, userId: string, damage: number, rounds: number): Promise<void> => {

    const party = partyId ? await getPartySchema(partyId) : undefined;

    const partyMembers = party ? party.members : [userId];

    // stampede.participation[string]: [0: damage, 1: rounds played]
    const participation = partyMembers.reduce<Record<string, [number, number]>>((acc, e) => ({
        ...acc,
        [e]: [damage, e === userId ? rounds : 0]
    }), {});

    await query(`
        UPDATE stampedes 
        SET participation = (
            SELECT jsonb_object_agg(
                key,
                CASE
                    WHEN participation->key IS NOT NULL AND $2::jsonb->key IS NOT NULL THEN
                        jsonb_build_array(
                            (COALESCE((participation->key->>0)::numeric, 0) + COALESCE(($2::jsonb->key->>0)::numeric, 0)),
                            (COALESCE((participation->key->>1)::numeric, 0) + COALESCE(($2::jsonb->key->>1)::numeric, 0))
                        )
                    WHEN $2::jsonb->key IS NOT NULL THEN
                        $2::jsonb->key
                    ELSE
                        participation->key
                END
            )
            FROM jsonb_each(COALESCE(participation, '{}'::jsonb) || $2::jsonb)
        )
        WHERE rowid = $1
    `, [stampedeRowId, participation]);
};

export const updateRaidParticipation = async (raidRowId: number, userId: string, damage: number): Promise<void> => {

    const participation = {
        [userId]: [damage, 1]
    };

    await query(`
        UPDATE raids 
        SET enemy_hp = enemy_hp - $3,
            participation = (
                SELECT jsonb_object_agg(
                    key,
                    CASE
                        WHEN participation->key IS NOT NULL AND $2::jsonb->key IS NOT NULL THEN
                            jsonb_build_array(
                                (COALESCE((participation->key->>0)::numeric, 0) + COALESCE(($2::jsonb->key->>0)::numeric, 0)),
                                (COALESCE((participation->key->>1)::numeric, 0) + COALESCE(($2::jsonb->key->>1)::numeric, 0))
                            )
                        WHEN $2::jsonb->key IS NOT NULL THEN
                            $2::jsonb->key
                        ELSE
                            participation->key
                    END
                )
                FROM jsonb_each(COALESCE(participation, '{}'::jsonb) || $2::jsonb)
            )
        WHERE rowid = $1
    `, [raidRowId, participation, damage]);
};

export const updateRaidPhase = async (raidRowId: number, newRaidId: number, newEnemyHp: number): Promise<RaidSchema | undefined> => {
    const { rows: [raid] } = await query(`UPDATE raids SET raidid = $1, enemy_hp = $2, enemy_hpmax = $2 WHERE rowid = $3 RETURNING *`, [newRaidId, newEnemyHp, raidRowId]) as { rows: RaidSchema[]; };
    if (raid.raidid === newRaidId) return undefined;
    return raid;
};


// export const updateUsers = async (userIds: string | string[] | "*", updates: { [K in keyof Partial<UserSchema>]: { value: UserSchema[K], additive?: boolean; }; }): Promise<void> => {
//     const setStatements = Object.entries(updates)
//         .map(([key, { value, additive }], index) => {
//             if (additive) {
//                 return `${key} = ${key} + $${index + 2}`;
//             }
//             return `${key} = $${index + 2}`;
//         })
//         .join(', ');

//     const values = Object.values(updates).map(update => update.value);

//     if (userIds === "*") {
//         await query(
//             `UPDATE users SET ${setStatements}`,
//             values
//         );
//     } else {
//         const ids = Array.isArray(userIds) ? userIds : [userIds];
//         await query(
//             `UPDATE users SET ${setStatements} WHERE id = ANY($1)`,
//             [ids, ...values]
//         );
//     }
// };

// export const updateUsersAppend = async (userIds: string | string[] | "*", updates: Partial<{ [K in keyof Pick<UserSchema, { [P in keyof UserSchema]: UserSchema[P] extends any[] ? P : never }[keyof UserSchema]>]: { value: UserSchema[K], unique?: boolean; }; }>): Promise<void> => {
//     const setStatements = Object.entries(updates)
//         .map(([key, { unique }], index) => {
//             if (unique) {
//                 return `${key} = array(select distinct unnest(array_cat(${key}, $${index + 2})))`;
//             };
//             return `${key} = array_cat(${key}, $${index + 2})`;
//         })
//         .join(', ');

//     const values = Object.values(updates).map(update => update.value);

//     if (userIds === "*") {
//         await query(
//             `UPDATE users SET ${setStatements}`,
//             values
//         );
//     } else {
//         const ids = Array.isArray(userIds) ? userIds : [userIds];
//         await query(
//             `UPDATE users SET ${setStatements} WHERE id = ANY($1)`,
//             [ids, ...values]
//         );
//     }
// };

// export const updateUsersRemove = async (userIds: string | string[] | "*", updates: Partial<{ [K in keyof Pick<UserSchema, { [P in keyof UserSchema]: UserSchema[P] extends any[] ? P : never }[keyof UserSchema]>]: { value: UserSchema[K], removeAll?: boolean; }; }>): Promise<void> => {
//     const setStatements = Object.entries(updates)
//         .map(([key, { removeAll }], index) => {
//             if (removeAll) {
//                 return `${key} = (SELECT array_agg(elem) FROM unnest(${key}) elem WHERE NOT elem = ANY($${index + 2}::int[]))`;
//             };
//             return `${key} = array_remove(${key}, $${index + 2})`;
//         })
//         .join(', ');

//     const values = Object.values(updates).map(update => update.value);

//     if (userIds === "*") {
//         await query(
//             `UPDATE users SET ${setStatements}`,
//             values
//         );
//     } else {
//         const ids = Array.isArray(userIds) ? userIds : [userIds];
//         await query(
//             `UPDATE users SET ${setStatements} WHERE id = ANY($1)`,
//             [ids, ...values]
//         );
//     }
// };

export const updateUsers = async (
    userIds: string | string[] | "*",
    updates: UpdateUserOptions,
    condition?: string,
): Promise<void> => {
    const setStatements = Object.entries(updates)
        .map(([key, { type, value }], index) => {
            const paramIndex = index + (userIds === "*" ? 1 : 2);

            switch (type) {
                case 'set':
                    return `${key} = $${paramIndex}`;
                case 'increment':
                    return `${key} = ${key} + $${paramIndex}`;
                case 'append':
                    return `${key} = array_cat(${key}, $${paramIndex})`;
                case 'append_unique':
                    return `${key} = array(select distinct unnest(array_cat(${key}, $${paramIndex})))`;
                case 'remove':
                    const elemType = Array.isArray(value) && value.length > 0
                        ? typeof value[0] === 'number'
                            ? 'integer'
                            : 'text'
                        : 'text';
                    return `${key} = (
                        SELECT array_agg(orig.elem ORDER BY orig.idx)
                        FROM (
                            SELECT elem,
                                ROW_NUMBER() OVER (PARTITION BY elem ORDER BY idx) AS rn,
                                idx
                            FROM unnest(${key}) WITH ORDINALITY AS t(elem, idx)
                        ) AS orig
                        LEFT JOIN (
                            SELECT elem,
                                ROW_NUMBER() OVER (PARTITION BY elem ORDER BY idx) AS rn
                            FROM unnest($${paramIndex}::${elemType}[]) WITH ORDINALITY AS t(elem, idx)
                        ) AS rem
                        ON orig.elem = rem.elem
                        AND orig.rn = rem.rn
                        WHERE rem.elem IS NULL
                    )`;
                case 'remove_all':
                    const arrayType = Array.isArray(value) && value.length > 0
                        ? typeof value[0] === 'number'
                            ? 'integer[]'
                            : 'text[]'
                        : 'text[]';
                    return `${key} = COALESCE((
                        SELECT array_agg(elem) 
                        FROM unnest(${key}) elem 
                        WHERE NOT elem = ANY($${paramIndex}::${arrayType})
                    ), '{}')`;
                case 'set_json':
                    return `${key} = $${paramIndex}::jsonb`;
                case 'merge_json':
                    return `${key} = (
                        SELECT jsonb_object_agg(key,
                            CASE
                                WHEN ${key}->key IS NOT NULL AND $${paramIndex}::jsonb->key IS NOT NULL 
                                    AND jsonb_typeof(${key}->key) = 'number' 
                                    AND jsonb_typeof($${paramIndex}::jsonb->key) = 'number' THEN
                                        to_jsonb((${key}->key)::numeric + ($${paramIndex}::jsonb->key)::numeric)
                                WHEN $${paramIndex}::jsonb->key IS NOT NULL THEN
                                    $${paramIndex}::jsonb->key
                                ELSE
                                    ${key}->key
                            END
                        )
                        FROM jsonb_each(COALESCE(${key}, '{}'::jsonb) || $${paramIndex}::jsonb)
                    )`;
                default:
                    throw new Error(`Unknown update type: ${type}`);
            };
        })
        .join(', ');

    const values = Object.values(updates).map(update => update.value);

    if (userIds === "*") {
        await query(
            `UPDATE users SET ${setStatements} ${condition ? `WHERE ${condition}` : ""}`,
            values
        );
    } else {
        const ids = Array.isArray(userIds) ? userIds : [userIds];
        await query(
            `UPDATE users SET ${setStatements} WHERE id = ANY($1) ${condition ? `AND ${condition}` : ""}`,
            [ids, ...values]
        );
    };
};

export const updateWeapons = async (
    uniqueIds: string | string[] | "*",
    updates: UpdateWeaponOptions
): Promise<void> => {
    const setStatements = Object.entries(updates)
        .map(([key, { type, value }], index) => {
            const paramIndex = index + 2;

            switch (type) {
                case 'set':
                    return `${key} = $${paramIndex}`;
                case 'increment':
                    return `${key} = ${key} + $${paramIndex}`;
                default:
                    throw new Error(`Unknown update type: ${type}`);
            };
        })
        .join(', ');

    const values = Object.values(updates).map(update => update.value);

    if (uniqueIds === "*") {
        await query(
            `UPDATE weapons SET ${setStatements}`,
            values
        );
    } else {
        const ids = Array.isArray(uniqueIds) ? uniqueIds : [uniqueIds];
        await query(
            `UPDATE weapons SET ${setStatements} WHERE uniqueid = ANY($1)`,
            [ids, ...values]
        );
    };
};

export const updateGuilds = async (
    guildIds: string | string[] | "*",
    updates: UpdateGuildOptions,
    condition?: string,
): Promise<void> => {
    const setStatements = Object.entries(updates)
        .map(([key, { type, value }], index) => {
            const paramIndex = index + 2;

            switch (type) {
                case 'set':
                    return `${key} = $${paramIndex}`;
                case 'increment':
                    return `${key} = ${key} + $${paramIndex}`;
                case 'append':
                    return `${key} = array_cat(${key}, $${paramIndex})`;
                case 'append_unique':
                    return `${key} = array(select distinct unnest(array_cat(${key}, $${paramIndex})))`;
                case 'remove':
                    const elemType = Array.isArray(value) && value.length > 0
                        ? typeof value[0] === 'number'
                            ? 'integer'
                            : 'text'
                        : 'text';
                    return `${key} = (
                        SELECT array_agg(orig.elem ORDER BY orig.idx)
                        FROM (
                            SELECT elem,
                                ROW_NUMBER() OVER (PARTITION BY elem ORDER BY idx) AS rn,
                                idx
                            FROM unnest(${key}) WITH ORDINALITY AS t(elem, idx)
                        ) AS orig
                        LEFT JOIN (
                            SELECT elem,
                                ROW_NUMBER() OVER (PARTITION BY elem ORDER BY idx) AS rn
                            FROM unnest($${paramIndex}::${elemType}[]) WITH ORDINALITY AS t(elem, idx)
                        ) AS rem
                        ON orig.elem = rem.elem
                        AND orig.rn = rem.rn
                        WHERE rem.elem IS NULL
                    )`;
                case 'remove_all':
                    const arrayType = Array.isArray(value) && value.length > 0
                        ? typeof value[0] === 'number'
                            ? 'integer[]'
                            : 'text[]'
                        : 'text[]';
                    return `${key} = COALESCE((
                        SELECT array_agg(elem) 
                        FROM unnest(${key}) elem 
                        WHERE NOT elem = ANY($${paramIndex}::${arrayType})
                    ), '{}')`;
                case 'set_json':
                    return `${key} = $${paramIndex}::jsonb`;
                case 'merge_json':
                    return `${key} = (
                        SELECT jsonb_object_agg(key,
                            CASE
                                WHEN ${key}->key IS NOT NULL AND $${paramIndex}::jsonb->key IS NOT NULL 
                                    AND jsonb_typeof(${key}->key) = 'number' 
                                    AND jsonb_typeof($${paramIndex}::jsonb->key) = 'number' THEN
                                        to_jsonb((${key}->key)::numeric + ($${paramIndex}::jsonb->key)::numeric)
                                WHEN $${paramIndex}::jsonb->key IS NOT NULL THEN
                                    $${paramIndex}::jsonb->key
                                ELSE
                                    ${key}->key
                            END
                        )
                        FROM jsonb_each(COALESCE(${key}, '{}'::jsonb) || $${paramIndex}::jsonb)
                    )`;
                default:
                    throw new Error(`Unknown update type: ${type}`);
            };
        })
        .join(', ');

    const values = Object.values(updates).map(update => update.value);

    if (guildIds === "*") {
        await query(
            `UPDATE guilds SET ${setStatements} ${condition ? `WHERE ${condition}` : ""}`,
            values
        );
    } else {
        const ids = Array.isArray(guildIds) ? guildIds : [guildIds];
        await query(
            `UPDATE guilds SET ${setStatements} WHERE id = ANY($1) ${condition ? `AND ${condition}` : ""}`,
            [ids, ...values]
        );
    };
};

export const updateParties = async (
    partyIds: string | string[] | "*",
    updates: UpdatePartyOptions,
    condition?: string,
): Promise<void> => {
    const setStatements = Object.entries(updates)
        .map(([key, { type, value }], index) => {
            const paramIndex = index + 2;

            switch (type) {
                case 'set':
                    return `${key} = $${paramIndex}`;
                case 'increment':
                    return `${key} = ${key} + $${paramIndex}`;
                case 'append':
                    return `${key} = array_cat(${key}, $${paramIndex})`;
                case 'append_unique':
                    return `${key} = array(select distinct unnest(array_cat(${key}, $${paramIndex})))`;
                case 'remove':
                    const elemType = Array.isArray(value) && value.length > 0
                        ? typeof value[0] === 'number'
                            ? 'integer'
                            : 'text'
                        : 'text';
                    return `${key} = (
                        SELECT array_agg(orig.elem ORDER BY orig.idx)
                        FROM (
                            SELECT elem,
                                ROW_NUMBER() OVER (PARTITION BY elem ORDER BY idx) AS rn,
                                idx
                            FROM unnest(${key}) WITH ORDINALITY AS t(elem, idx)
                        ) AS orig
                        LEFT JOIN (
                            SELECT elem,
                                ROW_NUMBER() OVER (PARTITION BY elem ORDER BY idx) AS rn
                            FROM unnest($${paramIndex}::${elemType}[]) WITH ORDINALITY AS t(elem, idx)
                        ) AS rem
                        ON orig.elem = rem.elem
                        AND orig.rn = rem.rn
                        WHERE rem.elem IS NULL
                    )`;
                case 'remove_all':
                    const arrayType = Array.isArray(value) && value.length > 0
                        ? typeof value[0] === 'number'
                            ? 'integer[]'
                            : 'text[]'
                        : 'text[]';
                    return `${key} = COALESCE((
                        SELECT array_agg(elem) 
                        FROM unnest(${key}) elem 
                        WHERE NOT elem = ANY($${paramIndex}::${arrayType})
                    ), '{}')`;
                case 'set_json':
                    return `${key} = $${paramIndex}::jsonb`;
                case 'merge_json':
                    return `${key} = (
                        SELECT jsonb_object_agg(key,
                            CASE
                                WHEN ${key}->key IS NOT NULL AND $${paramIndex}::jsonb->key IS NOT NULL 
                                    AND jsonb_typeof(${key}->key) = 'number' 
                                    AND jsonb_typeof($${paramIndex}::jsonb->key) = 'number' THEN
                                        to_jsonb((${key}->key)::numeric + ($${paramIndex}::jsonb->key)::numeric)
                                WHEN $${paramIndex}::jsonb->key IS NOT NULL THEN
                                    $${paramIndex}::jsonb->key
                                ELSE
                                    ${key}->key
                            END
                        )
                        FROM jsonb_each(COALESCE(${key}, '{}'::jsonb) || $${paramIndex}::jsonb)
                    )`;
                default:
                    throw new Error(`Unknown update type: ${type}`);
            };
        })
        .join(', ');

    const values = Object.values(updates).map(update => update.value);

    if (partyIds === "*") {
        await query(
            `UPDATE parties SET ${setStatements} ${condition ? `WHERE ${condition}` : ""}`,
            values
        );
    } else {
        const ids = Array.isArray(partyIds) ? partyIds : [partyIds];
        await query(
            `UPDATE parties SET ${setStatements} WHERE id = ANY($1) ${condition ? `AND ${condition}` : ""}`,
            [ids, ...values]
        );
    };
};



export const updateStampedes = async (
    stampedeRowIds: number | number[] | "*",
    updates: UpdateStampedeOptions,
    condition?: string,
): Promise<void> => {
    const setStatements = Object.entries(updates)
        .map(([key, { type, value }], index) => {
            const paramIndex = index + 2;

            switch (type) {
                case 'set':
                    return `${key} = $${paramIndex}`;
                case 'increment':
                    return `${key} = ${key} + $${paramIndex}`;
                case 'set_json':
                    return `${key} = $${paramIndex}::jsonb`;
                case 'merge_json':
                    return `${key} = (
                        SELECT jsonb_object_agg(key,
                            CASE
                                WHEN ${key}->key IS NOT NULL AND $${paramIndex}::jsonb->key IS NOT NULL 
                                    AND jsonb_typeof(${key}->key) = 'number' 
                                    AND jsonb_typeof($${paramIndex}::jsonb->key) = 'number' THEN
                                        to_jsonb((${key}->key)::numeric + ($${paramIndex}::jsonb->key)::numeric)
                                WHEN $${paramIndex}::jsonb->key IS NOT NULL THEN
                                    $${paramIndex}::jsonb->key
                                ELSE
                                    ${key}->key
                            END
                        )
                        FROM jsonb_each(COALESCE(${key}, '{}'::jsonb) || $${paramIndex}::jsonb)
                    )`;
                default:
                    throw new Error(`Unknown update type: ${type}`);
            };
        })
        .join(', ');

    const values = Object.values(updates).map(update => update.value);

    if (stampedeRowIds === "*") {
        await query(
            `UPDATE stampedes SET ${setStatements} ${condition ? `WHERE ${condition}` : ""}`,
            values
        );
    } else {
        const ids = Array.isArray(stampedeRowIds) ? stampedeRowIds : [stampedeRowIds];
        await query(
            `UPDATE stampedes SET ${setStatements} WHERE rowid = ANY($1) ${condition ? `AND ${condition}` : ""}`,
            [ids, ...values]
        );
    };
};

export const updateGuildDonationsGuildId = async (guildId: string, newGuildId: string): Promise<void> => {
    await query(`UPDATE guild_donations SET guildid = $1 WHERE guildid = $2`, [newGuildId, guildId]);
};
