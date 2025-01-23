import { query } from "../postgres";
import { CompactUserSchema, FAQSchema, GuildDonationSchema, GuildSchema, PartySchema, RaidSchema, ServerSchema, StampedeSchema, TradeSchema, UpdateUserOptions, UpdateWeaponOptions, UserSchema, UserSchemaForStats, WeaponSchema } from "../types";

//---------------------------------//
//           GET SCHEMAS           //
//---------------------------------//

export const getFullUserSchema = async (id: string): Promise<UserSchema | undefined> => {
    const [user] = await query(`SELECT * FROM users WHERE id = $1`, [id]) as [UserSchema];
    return user;
};

export const getMinimalUserSchema = async (id: string): Promise<Pick<UserSchema, "rowid" | "id" | "name"> | undefined> => {
    const [user] = await query(`SELECT rowid, id, name FROM users WHERE id = $1`, [id]) as [Pick<UserSchema, "rowid" | "id" | "name">];
    return user;
};

export const getUserSchema = async (id: string): Promise<CompactUserSchema | undefined> => {
    const [user] = await query(`SELECT rowid, id, name, xp, coins, lilies, favchar, battlechar, lootbox, lastvote, weeklyclaimed, dailyclaimed, dailystreak, lastdaily, pullcount, pullstacks, pullstacksinterval, pullstotal, lastss, lasts, premium, pullresets, ssshard, sshard, ashard, bshard, cshard, dshard, ssticket, sticket, aticket, bticket, cticket, dticket, votestotal, arenawins, arenalosses, animationdelay, achievements, lastpull, pullreminder, votereminder, items, skins, eventpts, eventpts2, brbest, mailbox, eventrewreceived, gems, tutorial, dailies, guild, donatedtotal, genesispity, presets, itemlock, party, stampedechar, mailreceived, class, aboutme, profilecolor, jades, pass, passlevel, freepassclaimed, premiumpassclaimed, celebrateclaimed, expulls, level, bank, charxp, feedlimit, findoption, referred_by, referred_gems, referrals_claimed, passpurchaselimit, expity, craze_equipment, equipment, trial_equipment, craze_levels, shield_slot, lastguildjoin, valentine, bosshuntruns, bosshuntrevreceived, monthlyshop, itemwishlist, stampedeenergy, background, backgrounds, charlock, animelock, cow_participation, cow_chars, cow_timer, cow_rolled_today, rank, rankscore, raidxp, guild_marks, chars, char_ref, char_skin, dungeon_floors, dungeon_limit, dungeon_classes, dungeon_classlevels FROM users WHERE id = $1`, [id]) as [CompactUserSchema];
    return user;
};

export const getUserSchemas = async (ids: string[] | "*", whereClause?: string): Promise<CompactUserSchema[]> => {
    const query_str = `SELECT rowid, id, name, xp, coins, lilies, favchar, battlechar, lootbox, lastvote, weeklyclaimed, dailyclaimed, dailystreak, lastdaily, pullcount, pullstacks, pullstacksinterval, pullstotal, lastss, lasts, premium, pullresets, ssshard, sshard, ashard, bshard, cshard, dshard, ssticket, sticket, aticket, bticket, cticket, dticket, votestotal, arenawins, arenalosses, animationdelay, achievements, lastpull, pullreminder, votereminder, items, skins, eventpts, eventpts2, brbest, mailbox, eventrewreceived, gems, tutorial, dailies, guild, donatedtotal, genesispity, presets, itemlock, party, stampedechar, mailreceived, class, aboutme, profilecolor, jades, pass, passlevel, freepassclaimed, premiumpassclaimed, celebrateclaimed, expulls, level, bank, charxp, feedlimit, findoption, referred_by, referred_gems, referrals_claimed, passpurchaselimit, expity, craze_equipment, equipment, trial_equipment, craze_levels, shield_slot, lastguildjoin, valentine, bosshuntruns, bosshuntrevreceived, monthlyshop, itemwishlist, stampedeenergy, background, backgrounds, charlock, animelock, cow_participation, cow_chars, cow_timer, cow_rolled_today, rank, rankscore, raidxp, guild_marks, chars, char_ref, char_skin, dungeon_floors, dungeon_limit, dungeon_classes, dungeon_classlevels FROM users ${whereClause ? whereClause : ""}`;

    if (ids === "*") {
        const users = await query(query_str, []) as CompactUserSchema[];
        return users;
    } else {
        const users = await query(`${query_str} WHERE id = ANY($1)`, [ids]) as CompactUserSchema[];
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

export const getWeaponSchemas = async (uniqueids: string[]): Promise<WeaponSchema[]> => {
    const weapons = await query(`SELECT * FROM weapons WHERE uniqueid = ANY($1)`, [uniqueids]) as WeaponSchema[];
    return weapons;
};

export const getGuildSchema = async (id: string): Promise<GuildSchema | undefined> => {
    const [guild] = await query(`SELECT * FROM guilds WHERE id = $1`, [id]) as [GuildSchema];
    return guild;
};

export const getGuildDonationSchema = async (id: string): Promise<GuildDonationSchema | undefined> => {
    const [guildDonation] = await query(`SELECT * FROM guild_donations WHERE id = $1`, [id]) as [GuildDonationSchema];
    return guildDonation;
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

//---------------------------------- ---------//
//               GET STATEMENTS               //
//---------------------------------- ---------//

export const getTotalPlayers = async (): Promise<number> => {
    const [result] = await query(`SELECT COUNT(rowid) AS players FROM users`) as [{ players: number; }];
    return result.players;
};

export const getPartyMembers = async (partyId: string, options: { excludeIds: string[], hasChristmasChar: boolean; } = { excludeIds: [], hasChristmasChar: false }): Promise<Pick<UserSchema, "id" | "name" | "party" | "stampedechar" | "craze_equipment">[]> => {
    let members = await query(`SELECT id, name, party, stampedechar, craze_equipment FROM users WHERE party = $1 AND id != ANY($2)`, [partyId, options.excludeIds]) as Pick<UserSchema, "id" | "name" | "party" | "stampedechar" | "craze_equipment">[];

    if (options.hasChristmasChar) members = members.filter((e) => e.craze_equipment.char !== undefined);

    return members ?? [];
};

export const getLatestStampede = async (): Promise<StampedeSchema | undefined> => {
    const [stampede] = await query(`SELECT rowid, * FROM stampedes ORDER BY rowid DESC LIMIT 1`) as [StampedeSchema];
    return stampede;
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
    return weapons;
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


//--------------------------------------------//
//              CHECK STATEMENTS              //
//--------------------------------------------//

export const doesUserExist = async (userId: string): Promise<boolean> => {
    const [exists] = await query(`SELECT id FROM users WHERE id = $1`, [userId]) as [{ id: string; }];
    return !!exists;
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

export const loadRanking = async (pass: number, batchSize: number): Promise<UserSchemaForStats[]> => {
    const users = await query(`SELECT id, name, premium, battlechar, level, bank, char_ref, equipment, shield_slot, class, dungeon_classlevels FROM users WHERE battlechar IS NOT NULL ORDER BY rowid LIMIT $1 OFFSET $2`, [batchSize, pass * batchSize]) as UserSchemaForStats[];
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

export const insertNewWeapon = async (userId: string, itemId: number, itemType: string): Promise<WeaponSchema> => {
    const { rows: [weapon] } = await query(`INSERT INTO weapons (id, itemid, item_type) VALUES ($1, $2, $3) RETURNING *`, [userId, itemId, itemType]) as { rows: WeaponSchema[]; };
    return weapon;
};

export const insertNewTrade = async (id: string, receiver: string, type: "coins" | "char", sent: number): Promise<TradeSchema> => {
    const { rows: [trade] } = await query(`INSERT INTO trades (id, receiver, type, sent) VALUES ($1, $2, $3, $4) RETURNING *`, [id, receiver, type, sent]) as { rows: TradeSchema[]; };
    return trade;
};

//-------------------------------------------//
//             UPDATE STATEMENTS             //
//-------------------------------------------//

export const addUserToServer = async (serverId: string, userId: string): Promise<void> => {
    await query(`UPDATE servers SET user_ids = array_append(user_ids, $1) WHERE id = $2 AND NOT $1 = ANY(user_ids)`, [userId, serverId]);
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
    updates: UpdateUserOptions
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

    if (userIds === "*") {
        await query(
            `UPDATE users SET ${setStatements}`,
            values
        );
    } else {
        const ids = Array.isArray(userIds) ? userIds : [userIds];
        await query(
            `UPDATE users SET ${setStatements} WHERE id = ANY($1)`,
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
