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
    const [user] = await query(`SELECT rowid, id, name, xp, coins, lilies, favchar, battlechar, lootbox, lastvote, weeklyclaimed, dailyclaimed, dailystreak, lastdaily, pullcount, pullstacks, pullstacksinterval, pullstotal, lastss, lasts, premium, pullresets, ssshard, sshard, ashard, bshard, cshard, dshard, ssticket, sticket, aticket, bticket, cticket, dticket, votestotal, arenawins, arenalosses, animationdelay, achievements, lastpull, pullreminder, votereminder, items, skins, eventpts, eventpts2, brbest, mailbox, eventrewreceived, gems, tutorial, dailies, guild, donatedtotal, genesispity, presets, itemlock, party, stampedechar, mailreceived, class, aboutme, profilecolor, rank, rankscore, raidxp, guild_marks, dungeon_floors, dungeon_limit, dungeon_classes, dungeon_classlevels FROM users WHERE id = $1`, [id]) as [CompactUserSchema];
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

export const updateUserMailReceived = async (userId: string, mailCount: number): Promise<void> => {
    await query(`UPDATE users SET mailreceived = $1 WHERE id = $2`, [mailCount, userId]);
};
