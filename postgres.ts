import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    user: process.env.PG_USER,
    host: 'localhost',
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: parseInt(process.env.PG_PORT || '5432'),
    max: 20,                       // Maximum pool size
    idleTimeoutMillis: 30000,      // Close idle clients after 30s
    connectionTimeoutMillis: 2000, // Return error after 2s if no connection available
    statement_timeout: 30000,      // Cancel queries after 30 seconds
});

export const query = async (text: string, params?: any[]) => {
    try {
        const res = await pool.query(text, params);
        if (text.toUpperCase().startsWith("SELECT")) return res.rows;
        return res;
    } catch (error) {
        console.error(error);
        throw error;
    };
};

async function createTables() {
    // Users table
    await query(`CREATE SEQUENCE IF NOT EXISTS users_rowid_seq`);
    await query(`CREATE TABLE IF NOT EXISTS users (
        rowid BIGINT NOT NULL DEFAULT nextval('users_rowid_seq'::regclass),
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        xp INT DEFAULT 0 NOT NULL,
        coins BIGINT DEFAULT 0 NOT NULL,
        lilies INT DEFAULT 0 NOT NULL,
        season_keys INT DEFAULT 0 NOT NULL,
        favchar INT,
        battlechar INT,
        lootbox INT DEFAULT 0 NOT NULL,
        lastvote TIMESTAMP,
        lastvoteserver TIMESTAMP,
        weeklyclaimed INT DEFAULT 0 NOT NULL,
        dailyclaimed INT DEFAULT 0 NOT NULL,
        dailystreak INT DEFAULT 0 NOT NULL,
        lastdaily TIMESTAMP,
        lastonline TIMESTAMP,
        pullcount INT DEFAULT 0 NOT NULL,
        pullstacks INT DEFAULT 0 NOT NULL,
        pullstacksinterval INT DEFAULT 0 NOT NULL,
        pullstotal INT DEFAULT 0 NOT NULL,
        lastss INT DEFAULT 0 NOT NULL,
        lasts INT DEFAULT 0 NOT NULL,
        premium INT DEFAULT 0 NOT NULL,
        pullresets INT DEFAULT 0 NOT NULL,
        ssshard INT DEFAULT 0 NOT NULL,
        sshard INT DEFAULT 0 NOT NULL,
        ashard INT DEFAULT 0 NOT NULL,
        bshard INT DEFAULT 0 NOT NULL,
        cshard INT DEFAULT 0 NOT NULL,
        dshard INT DEFAULT 0 NOT NULL,
        ssticket INT DEFAULT 0 NOT NULL,
        sticket INT DEFAULT 0 NOT NULL,
        aticket INT DEFAULT 0 NOT NULL,
        bticket INT DEFAULT 0 NOT NULL,
        cticket INT DEFAULT 0 NOT NULL,
        dticket INT DEFAULT 0 NOT NULL,
        votestotal INT DEFAULT 0 NOT NULL,
        arenawins INT DEFAULT 0 NOT NULL,
        arenalosses INT DEFAULT 0 NOT NULL,
        arenastreak INT DEFAULT 0 NOT NULL,
        arenahigheststreak INT DEFAULT 0 NOT NULL,
        animationdelay INT DEFAULT 1200 NOT NULL,
        achievements INT[] DEFAULT ARRAY[]::INT[] NOT NULL,
        lastpull TIMESTAMP,
        pullreminder INT DEFAULT 0 NOT NULL,
        votereminder INT DEFAULT 1 NOT NULL,
        items JSONB DEFAULT '{}' NOT NULL,
        skins INT[] DEFAULT ARRAY[]::INT[] NOT NULL,
        hpbars INT[] DEFAULT ARRAY[]::INT[] NOT NULL,
        hpbar INT,
        eventpts INT DEFAULT 0 NOT NULL,
        eventpts2 INT DEFAULT 0 NOT NULL,
        brbest INT DEFAULT 0 NOT NULL,
        mailbox JSONB[] DEFAULT ARRAY[]::JSONB[] NOT NULL,
        eventrewreceived INT DEFAULT 0 NOT NULL,
        gems BIGINT DEFAULT 0 NOT NULL,
        tutorial INT[] DEFAULT ARRAY[]::INT[] NOT NULL,
        transactions JSONB[] DEFAULT ARRAY[]::JSONB[] NOT NULL,
        dailies JSONB DEFAULT '{}' NOT NULL,
        guild TEXT,
        donatedtotal BIGINT DEFAULT 0 NOT NULL,
        genesispity INT DEFAULT 0 NOT NULL,
        genesisdupepity INT DEFAULT 0 NOT NULL,
        presets JSONB[] DEFAULT ARRAY[]::JSONB[] NOT NULL,
        itemlock TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
        party TEXT,
        stampedechar INT,
        mailreceived INT DEFAULT 0,
        class INT,
        aboutme TEXT,
        profilecolor TEXT,
        jades BIGINT DEFAULT 0 NOT NULL,
        pass INT DEFAULT 0 NOT NULL,
        passlevel INT DEFAULT 0 NOT NULL,
        freepassclaimed INT DEFAULT 0 NOT NULL,
        premiumpassclaimed INT DEFAULT 0 NOT NULL,
        celebrateclaimed BIGINT DEFAULT 0 NOT NULL,
        expulls INT DEFAULT 0 NOT NULL,
        level INT DEFAULT 1 NOT NULL,
        bank BIGINT DEFAULT -1 NOT NULL,
        charxp BIGINT DEFAULT 0 NOT NULL,
        feedlimit INT DEFAULT 0 NOT NULL,
        findoption INT DEFAULT 1 NOT NULL,
        referred_by TEXT,
        referred_gems INT DEFAULT 0 NOT NULL,
        referrals_claimed INT DEFAULT 0 NOT NULL,
        passpurchaselimit INT DEFAULT 0 NOT NULL,
        expity INT DEFAULT 0 NOT NULL,
        craze_equipment JSONB DEFAULT '{}' NOT NULL,
        equipment JSONB DEFAULT '{}' NOT NULL,
        trial_equipment JSONB DEFAULT '{}' NOT NULL,
        craze_levels JSONB DEFAULT '{}' NOT NULL,
        shield_slot INT DEFAULT 0 NOT NULL,
        lastguildjoin TIMESTAMP,
        valentine TEXT,
        bosshuntruns INT DEFAULT 0 NOT NULL,
        bosshuntrevreceived INT DEFAULT 0 NOT NULL,
        monthlyshop JSONB DEFAULT '{}' NOT NULL,
        itemwishlist INT[] DEFAULT ARRAY[]::INT[] NOT NULL,
        stampedeenergy INT DEFAULT 0 NOT NULL,
        background TEXT,
        backgrounds TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
        charlock INT[] DEFAULT ARRAY[]::INT[] NOT NULL,
        animelock INT[] DEFAULT ARRAY[]::INT[] NOT NULL,
        cow_participation INT,
        cow_chars INT[] DEFAULT ARRAY[]::INT[] NOT NULL,
        cow_timer BIGINT,
        cow_rolled_today INT DEFAULT 0 NOT NULL,
        rankscore BIGINT DEFAULT 0 NOT NULL,
        guild_marks BIGINT DEFAULT 0 NOT NULL,
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        image_credits INT DEFAULT 0 NOT NULL,
        skill_tree JSONB DEFAULT '{}' NOT NULL,
        skill_points INT DEFAULT 0 NOT NULL,
        raid_supports INT[] DEFAULT ARRAY[]::INT[] NOT NULL,
        stamps INT DEFAULT 0 NOT NULL,
        user_settings JSONB DEFAULT '{}' NOT NULL,
        custom_skins JSONB DEFAULT '{}' NOT NULL,
        discovered_via TEXT,

        -- Characters table columns
        chars INT[] DEFAULT ARRAY[]::INT[] NOT NULL,
        char_ref JSONB DEFAULT '{}' NOT NULL,          -- renamed from 'ref' to avoid conflicts
        char_level JSONB DEFAULT '{}' NOT NULL,        -- renamed from 'level' to avoid conflicts
        char_class JSONB DEFAULT '{}' NOT NULL,        -- renamed from 'class' to avoid conflicts
        char_skin JSONB DEFAULT '{}' NOT NULL,         -- renamed from 'skin' to avoid conflicts
        char_equipment JSONB DEFAULT '{}' NOT NULL,    -- renamed from 'equipment' to avoid conflicts

        -- Dungeon table columns
        dungeon_floors JSONB DEFAULT '{"1":0}' NOT NULL,            -- renamed from 'floors' to avoid conflicts
        dungeon_limit INT DEFAULT 0 NOT NULL,                       -- renamed from 'limit' to avoid conflicts
        dungeon_classes INT[] DEFAULT ARRAY[]::INT[] NOT NULL,      -- renamed from 'classes' to avoid conflicts
        dungeon_classlevels JSONB DEFAULT '{}' NOT NULL,            -- renamed from 'classlevels' to avoid conflicts
        dungeon_responsetime TIMESTAMP[] DEFAULT ARRAY[]::TIMESTAMP[] NOT NULL,              -- renamed from 'responsetime' to avoid conflicts
        stampede_responsetime TIMESTAMP[] DEFAULT ARRAY[]::TIMESTAMP[] NOT NULL              -- renamed from 's_responsetime' to avoid conflicts
    )`);

    // Servers table
    await query(`CREATE SEQUENCE IF NOT EXISTS servers_rowid_seq`);
    await query(`CREATE TABLE IF NOT EXISTS servers (
        rowid BIGINT NOT NULL DEFAULT nextval('servers_rowid_seq'::regclass),
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        user_ids TEXT[] NOT NULL
    )`);

    // Weapons table
    await query(`CREATE SEQUENCE IF NOT EXISTS weapons_rowid_seq`);
    await query(`CREATE TABLE IF NOT EXISTS weapons (
        rowid BIGINT NOT NULL DEFAULT nextval('weapons_rowid_seq'::regclass),
        id TEXT NOT NULL,
        itemid INT NOT NULL,
        uniqueid TEXT PRIMARY KEY NOT NULL,
        level INT DEFAULT 0 NOT NULL,
        ascension INT DEFAULT 0 NOT NULL,
        character INT,
        item_type TEXT NOT NULL
    )`);

    // Guilds table
    await query(`CREATE SEQUENCE IF NOT EXISTS guilds_rowid_seq`);
    await query(`CREATE TABLE IF NOT EXISTS guilds (
        rowid BIGINT NOT NULL DEFAULT nextval('guilds_rowid_seq'::regclass),
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT DEFAULT '' NOT NULL,
        color TEXT,
        level INT DEFAULT 1 NOT NULL,
        icon TEXT,
        banner TEXT,
        treasury BIGINT DEFAULT 0,
        treasury_gems BIGINT DEFAULT 0,
        tax INT DEFAULT 10 NOT NULL,
        canjoin INT DEFAULT 1 NOT NULL,
        tokens INT DEFAULT 1 NOT NULL,
        membercap INT DEFAULT 0 NOT NULL,
        xpbuff INT DEFAULT 0 NOT NULL,
        lootbuff INT DEFAULT 0 NOT NULL,
        cdreduction INT DEFAULT 0 NOT NULL,
        atkbuff INT DEFAULT 0 NOT NULL,
        hpbuff INT DEFAULT 0 NOT NULL,
        defbuff INT DEFAULT 0 NOT NULL,
        master TEXT NOT NULL,
        elders TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
        members TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
        banned TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,

        eventpoints INT DEFAULT 0 NOT NULL,
        bosshuntstage INT DEFAULT 1 NOT NULL,
        boss1 BIGINT DEFAULT 124080 NOT NULL,
        boss2 BIGINT DEFAULT 160260 NOT NULL,
        boss3 BIGINT DEFAULT 113720 NOT NULL,
        boss4 BIGINT DEFAULT 144640 NOT NULL,
        
        lastlevelup TIMESTAMP,

        raidid INT,
        raid_distribute_equally BOOLEAN DEFAULT FALSE NOT NULL
    )`);

    // Guild donations table
    await query(`CREATE SEQUENCE IF NOT EXISTS guild_donations_rowid_seq`);
    await query(`CREATE TABLE IF NOT EXISTS guild_donations (
        rowid BIGINT NOT NULL DEFAULT nextval('guild_donations_rowid_seq'::regclass),
        userid TEXT NOT NULL,
        guildid TEXT NOT NULL,
        week INT NOT NULL,
        type TEXT NOT NULL,
        amount BIGINT DEFAULT 0 NOT NULL
    )`);

    // Stampedes table
    await query(`CREATE SEQUENCE IF NOT EXISTS stampedes_rowid_seq`);
    await query(`CREATE TABLE IF NOT EXISTS stampedes (
        rowid BIGINT NOT NULL DEFAULT nextval('stampedes_rowid_seq'::regclass),
        type INT DEFAULT 0 NOT NULL,
        bosshp BIGINT NOT NULL,
        bosshpmax BIGINT NOT NULL,
        generalhp BIGINT NOT NULL,
        generalhpmax BIGINT NOT NULL,
        generalstotal INT NOT NULL,
        generalsleft INT NOT NULL,
        monsterstotal INT NOT NULL,
        monstersleft INT NOT NULL,
        participation JSONB DEFAULT '{}' NOT NULL
    )`);

    // Parties table
    await query(`CREATE SEQUENCE IF NOT EXISTS parties_rowid_seq`);
    await query(`CREATE TABLE IF NOT EXISTS parties (
        rowid BIGINT NOT NULL DEFAULT nextval('parties_rowid_seq'::regclass),
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT DEFAULT '' NOT NULL,
        color TEXT,
        icon TEXT,
        banner TEXT,
        members TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
        created TIMESTAMP
    )`);

    // Trades table
    await query(`CREATE SEQUENCE IF NOT EXISTS trades_rowid_seq`);
    await query(`CREATE TABLE IF NOT EXISTS trades (
        rowid BIGINT NOT NULL DEFAULT nextval('trades_rowid_seq'::regclass),
        id TEXT NOT NULL,
        receiver TEXT NOT NULL,
        type TEXT NOT NULL,
        sent BIGINT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // FAQ table
    await query(`CREATE SEQUENCE IF NOT EXISTS faq_rowid_seq`);
    await query(`CREATE TABLE IF NOT EXISTS faq (
        rowid BIGINT NOT NULL DEFAULT nextval('faq_rowid_seq'::regclass),
        id TEXT NOT NULL,
        name TEXT NOT NULL,
        body TEXT NOT NULL,
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Raids table
    await query(`CREATE SEQUENCE IF NOT EXISTS raids_rowid_seq`);
    await query(`CREATE TABLE IF NOT EXISTS raids (
        rowid BIGINT NOT NULL DEFAULT nextval('raids_rowid_seq'::regclass),
        guildid TEXT NOT NULL,
        raidid INT NOT NULL,
        rank_letter TEXT NOT NULL DEFAULT 'A+',
        enemy_hp BIGINT NOT NULL,
        enemy_hpmax BIGINT NOT NULL,
        participation JSONB DEFAULT '{}' NOT NULL,
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP
    )`);
};

async function createIndexes() {
    // Create indexes for frequently accessed columns
    await query(`CREATE INDEX IF NOT EXISTS idx_users_id ON users(id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_rowid ON users(rowid)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_servers_id ON servers(id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_weapons_id ON weapons(id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_guild_donations_userid ON guild_donations(userid)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_guild_donations_guildid ON guild_donations(guildid)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_trades_receiver ON trades(receiver)`);
};

async function createTriggerWeaponUniqueId() {
    // Create a function to generate random strings
    await query(`
        CREATE OR REPLACE FUNCTION generate_random_string(length INT) RETURNS TEXT AS $$
        DECLARE
            chars TEXT := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
            result TEXT := '';
            i INT;
        BEGIN
            FOR i IN 1..length LOOP
                result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
            END LOOP;
            RETURN result;
        END;
        $$ LANGUAGE plpgsql;
    `);

    // Create a function for the trigger
    await query(`
        CREATE OR REPLACE FUNCTION generate_weapon_uniqueid()
        RETURNS TRIGGER AS $$
        DECLARE
            gen TEXT;
            full_id TEXT;
            len INT := 2;
            max_attempts INT := 100;
            attempt INT := 0;
        BEGIN
            LOOP
                gen := generate_random_string(len);
                full_id := gen || ':' || NEW.id;
                
                -- Check if the generated ID exists
                IF NOT EXISTS (SELECT 1 FROM weapons WHERE uniqueid = full_id) THEN
                    NEW.uniqueid := full_id;
                    RETURN NEW;
                END IF;
                
                attempt := attempt + 1;
                
                -- Increase length after some attempts
                IF attempt % 10 = 0 THEN
                    len := len + 1;
                END IF;
                
                -- Prevent infinite loops
                IF attempt >= max_attempts THEN
                    RAISE EXCEPTION 'Could not generate unique ID after % attempts', max_attempts;
                END IF;
            END LOOP;
        END;
        $$ LANGUAGE plpgsql;
    `);

    // Create the trigger
    await query(`
        DROP TRIGGER IF EXISTS weapon_uniqueid_trigger ON weapons;
        CREATE TRIGGER weapon_uniqueid_trigger
        BEFORE INSERT ON weapons
        FOR EACH ROW
        WHEN (NEW.uniqueid IS NULL)
        EXECUTE FUNCTION generate_weapon_uniqueid();
    `);
};

async function createTriggerGuildId() {
    // Create a function for the guild ID trigger
    await query(`
        CREATE OR REPLACE FUNCTION generate_guild_id()
        RETURNS TRIGGER AS $$
        DECLARE
            gen TEXT;
            len INT := 5;  -- Default length of 5 characters
            max_attempts INT := 100;
            attempt INT := 0;
        BEGIN
            LOOP
                gen := generate_random_string(len);
                
                -- Check if the generated ID exists
                IF NOT EXISTS (SELECT 1 FROM guilds WHERE id = gen) THEN
                    NEW.id := gen;
                    RETURN NEW;
                END IF;
                
                attempt := attempt + 1;
                
                -- Increase length after some attempts
                IF attempt % 10 = 0 THEN
                    len := len + 1;
                END IF;
                
                -- Prevent infinite loops
                IF attempt >= max_attempts THEN
                    RAISE EXCEPTION 'Could not generate unique guild ID after % attempts', max_attempts;
                END IF;
            END LOOP;
        END;
        $$ LANGUAGE plpgsql;
    `);

    // Create the trigger
    await query(`
        DROP TRIGGER IF EXISTS guild_id_trigger ON guilds;
        CREATE TRIGGER guild_id_trigger
        BEFORE INSERT ON guilds
        FOR EACH ROW
        WHEN (NEW.id IS NULL)
        EXECUTE FUNCTION generate_guild_id();
    `);
};

// ... existing code ...

async function createTriggerPartyId() {
    // Create a function for the party ID trigger
    await query(`
        CREATE OR REPLACE FUNCTION generate_party_id()
        RETURNS TRIGGER AS $$
        DECLARE
            gen TEXT;
            len INT := 5;  -- Default length of 5 characters
            max_attempts INT := 100;
            attempt INT := 0;
        BEGIN
            LOOP
                gen := generate_random_string(len);
                
                -- Check if the generated ID exists
                IF NOT EXISTS (SELECT 1 FROM parties WHERE id = gen) THEN
                    NEW.id := gen;
                    RETURN NEW;
                END IF;
                
                attempt := attempt + 1;
                
                -- Increase length after some attempts
                IF attempt % 10 = 0 THEN
                    len := len + 1;
                END IF;
                
                -- Prevent infinite loops
                IF attempt >= max_attempts THEN
                    RAISE EXCEPTION 'Could not generate unique party ID after % attempts', max_attempts;
                END IF;
            END LOOP;
        END;
        $$ LANGUAGE plpgsql;
    `);

    // Create the trigger
    await query(`
        DROP TRIGGER IF EXISTS party_id_trigger ON parties;
        CREATE TRIGGER party_id_trigger
        BEFORE INSERT ON parties
        FOR EACH ROW
        WHEN (NEW.id IS NULL)
        EXECUTE FUNCTION generate_party_id();
    `);
};

async function createTriggers() {
    await createTriggerWeaponUniqueId();
    await createTriggerGuildId();
    await createTriggerPartyId();
};

async function alterTables() {
    // Example:
    // await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS coins INT DEFAULT 0 NOT NULL');

    // add genesisdupepity INT DEFAULT 0 NOT NULL,
    // await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS genesisdupepity INT DEFAULT 0 NOT NULL');
    // await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS user_settings JSONB DEFAULT '{}' NOT NULL`);

    // New with seasonal shop update
    // await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS lastonline TIMESTAMP;');
    // await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS season_keys INT DEFAULT 0 NOT NULL;');
    // await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS hpbars INT[] DEFAULT ARRAY[]::INT[] NOT NULL;');
    // await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS hpbar INT;');

    // await query('ALTER TABLE guilds ADD COLUMN IF NOT EXISTS raid_distribute_equally BOOLEAN DEFAULT FALSE NOT NULL;');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS arenastreak INT DEFAULT 0 NOT NULL');
    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS arenastreakhighest INT DEFAULT 0 NOT NULL');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS discovered_via TEXT;');

    await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS lastvoteserver TIMESTAMP;');
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_skins JSONB DEFAULT '{}' NOT NULL;`);


    // await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS image_credits INT DEFAULT 0 NOT NULL');
    // await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_tree JSONB DEFAULT '{}' NOT NULL");
    // await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS skill_points INT DEFAULT 0 NOT NULL");
    // await query("ALTER TABLE guilds ADD COLUMN IF NOT EXISTS atkbuff INT DEFAULT 0 NOT NULL");
    // await query("ALTER TABLE guilds ADD COLUMN IF NOT EXISTS hpbuff INT DEFAULT 0 NOT NULL");
    // await query("ALTER TABLE guilds ADD COLUMN IF NOT EXISTS defbuff INT DEFAULT 0 NOT NULL");
};

async function dropTables() {
    // await query('DROP TABLE IF EXISTS users CASCADE');
    // await query('DROP TABLE IF EXISTS servers CASCADE');
    // await query('DROP TABLE IF EXISTS characters CASCADE');
    // await query('DROP TABLE IF EXISTS dungeon CASCADE');
    // await query('DROP TABLE IF EXISTS weapons CASCADE');
    // await query('DROP TABLE IF EXISTS guilds CASCADE');
    // await query('DROP TABLE IF EXISTS guild_donations CASCADE');
    // await query('DROP TABLE IF EXISTS stampedes CASCADE');
    // await query('DROP TABLE IF EXISTS parties CASCADE');
    // await query('DROP TABLE IF EXISTS trades CASCADE');
    // await query('DROP TABLE IF EXISTS faq CASCADE');
    // await query('DROP TABLE IF EXISTS raids CASCADE');
};

//* Start migration
// import { migrateData } from './migration';
async function resetDatabase(migrate: boolean = false) {
    // await dropTables();
    // console.log('Dropped tables');
    // await createTables();
    // console.log('Created tables');
    // await createIndexes();
    // console.log('Created indexes');
    // await alterTables();
    // console.log('Altered tables');
    // await createTriggers();
    // console.log('Created triggers');
    // if (migrate) await migrateData().catch(console.error);
    // console.log('Migrated data');
};

// Self-executing async function to initialize database
(async () => {
    try {
        await createTables();
        await createIndexes();
        await alterTables();
        // await createTriggers();

        const [{ size }] = await query(`SELECT pg_size_pretty(pg_database_size('${process.env.PG_DATABASE}')) AS size;`) as [{ size: string; }];

        console.log(`Database initialization complete\nDatabase size: ${size}`);
    } catch (error) {
        console.error('Database initialization failed:', error);
    };
})();
