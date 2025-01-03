import { query } from "../postgres";
import { CompactUserSchema, FAQSchema, GuildDonationSchema, GuildSchema, PartySchema, RaidSchema, ServerSchema, StampedeSchema, TradeSchema, UserSchema, WeaponSchema } from "../types";

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

export const getServerSchema = async (id: string): Promise<ServerSchema | undefined> => {
    const [server] = await query(`SELECT * FROM servers WHERE id = $1`, [id]) as [ServerSchema];
    return server;
};

export const getWeaponSchema = async (id: string): Promise<WeaponSchema | undefined> => {
    const [weapon] = await query(`SELECT * FROM weapons WHERE id = $1`, [id]) as [WeaponSchema];
    return weapon;
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

// Helper type to get array keys from UserSchema
type ArrayKeys<T> = {
    [K in keyof T]: T[K] extends Array<any> ? K : never
}[keyof T];

// Helper type to get number keys from UserSchema
type NumberKeys<T> = {
    [K in keyof T]: T[K] extends number ? K : never
}[keyof T];

// Helper type to get JSON object keys from UserSchema
type JsonKeys<T> = {
    [K in keyof T]: T[K] extends object ? K : never
}[keyof T];

type UpdateUserOperation<K extends keyof UserSchema> =
    // Simple set operation - works with any key
    | { type: 'set'; value: UserSchema[K]; }

    // Increment operation - only works with number fields
    | (K extends NumberKeys<UserSchema>
        ? { type: 'increment'; value: number; }
        : never)

    // Array operations - only work with array fields
    | (K extends ArrayKeys<UserSchema>
        ? { type: 'append'; value: UserSchema[K]; }
        | { type: 'append_unique'; value: UserSchema[K]; }
        | { type: 'remove'; value: UserSchema[K][number]; }
        | { type: 'remove_all'; value: UserSchema[K]; }
        : never)

    // JSON operations - only work with object fields
    | (K extends JsonKeys<UserSchema>
        ? { type: 'set_json'; value: UserSchema[K]; }
        | { type: 'merge_json'; value: Partial<UserSchema[K]>; }
        : never);

type UpdateUserOptions = {
    [K in keyof Partial<UserSchema>]: UpdateUserOperation<K>;
};

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
                    return `${key} = array_remove(${key}, $${paramIndex})`;
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
                    return `${key} = COALESCE(${key}, '{}'::jsonb) || $${paramIndex}::jsonb`;
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
