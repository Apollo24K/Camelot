import { EmbedBuilder, User, ButtonInteraction, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";


export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Gender = 'M' | 'F' | 'NB';

export type CharacterRarity = 'EX' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'D';

export type ItemRarity = 'genesis' | 'mythical' | 'legendary' | 'unique' | 'rare' | 'special' | 'normal';

export type PrimaryStat = 'hp' | 'hp%' | 'atk' | 'atk%' | 'def' | 'def%' | 'md' | 'md%' | 'mr' | 'cr' | 'cd' | 'dodge' | 'br' | 'mana' | 'sm' | 'mg' | 'shield';

export type ItemCategory = "fish" | "loot" | "weapon" | "armor" | "ring";

export type ItemType = "fish" | "crafting material" | "ascension material" | "levelup material" | "awakening material" | "exchange point" | "event exclusive item" | "chest" | "sword" | "staff" | "axe" | "bow" | "lance" | "dagger" | "ring" | "shield" | "helmet" | "cuirass" | "gloves" | "boots";

export type RaidRank = 'F-' | 'F' | 'F+' | 'E-' | 'E' | 'E+' | 'D-' | 'D' | 'D+' | 'C-' | 'C' | 'C+' | 'B-' | 'B' | 'B+' | 'A-' | 'A' | 'A+' | 'S-' | 'S' | 'S+' | 'SS-' | 'SS' | 'SS+' | 'SSS-' | 'SSS' | 'SSS+' | 'EX-' | 'EX' | 'EX+';

export type Expertise = 'sword' | 'staff' | 'axe' | 'bow' | 'lance' | 'dagger' | 'shield' | 'any';

export type BuffType = "*" | "+" | "=";

export type IRoK = { name: string, id: string, char: number, ep: number; };

export type ProfileImageArguments = {
    profilecolor: string | null;
    quality: string | null;
    forceStatic: boolean;
    thumbnail: string | undefined;

    stats: DetailedStats;
    ref: number;
    classlevels: Record<string, number>;
    floor: number;

    guild: string | undefined;
    party: string | undefined;

    colorLight: string;
    colorDark: string;

    profilePicture: string;
    classImage: string | undefined;
    className: string | undefined;
    classLevel: number | undefined;
    userLvl: number;
    lastActive: string;

    weaponImage: string | undefined;
    shieldImage: string | undefined;
    helmetImage: string | undefined;
    cuirassImage: string | undefined;
    glovesImage: string | undefined;
    bootsImage: string | undefined;
};

export type ClassStats = {
    hp: [number, number];
    atk: [number, number];
    def: [number, number];
    md: [number, number];
    mr: [number, number];
    cr: [number, number];
    cd: [number, number];
    br: [number, number];
    agility: [number, number];
    dodge: [number, number];
    td: [number, number];
    mana: [number, number];
    mg: [number, number];
};

export type animeInfoOptions = {
    charid?: number;
};

export interface IanimeInfo {
    name: string;
    alias: string[];
    id: number;
    options: animeInfoOptions;

    thumbnailCharId?: number;
};

export interface IskillInfo {
    id: number;
    cost: number;
    skill: ClassAbility;
    passive: ClassAbility;
    list: any[];

    set list(lis: any[]);
};

export interface IentityInfo {
    // Shared info
    name: string;
    id: number;
    gender: Gender;
    image: string | string[];

    // Character info
    alias: string[];
    animeInfo?: IanimeInfo;
    rarity: CharacterRarity;
    anime?: string;
    anialias?: string[];
    staticImage?: string;
    rarityValue: number;
    rarityEmoji: string;

    // Enemy info
    species: string;
    boss: boolean;
    setStats?: object;
    multStats?: object;
    addStats?: object;
    loot: number[];
    floor: number[];
    ability?: IskillInfo;
    url: string;
};

export type CharInfoOptions = {
    staticImage?: string;
};

export interface IcharInfo extends IentityInfo {
    animeInfo: IanimeInfo;
    image: string;
    options: CharInfoOptions;
    anime: string;
    anialias: string[];
    tryStaticImage: string;

    getImage(premium: number, url: string, skin?: number, isStatic?: boolean);
};

export interface IenemyInfo extends IentityInfo {
    title: string;
    image: string[];
};

export interface IdelayedBuff {
    round: number;
    run: ItemAbility;
    last: number;
    usage: number;
    used: number;

    set used(used: number);

    decrement(): void;
};

enum AbilityResponse {
    SUCCESS = 1,
    FAILURE = 0,
};

export type ClassAbility = (myStats: DetailedStats, eStats: DetailedStats, mybuff: Buffs, ebuff: Buffs, char: IcharInfo, enemy: IentityInfo, matchStats: MatchStats, notice: string[], embed: EmbedBuilder, user: User, ...list: any[]) => Promise<AbilityResponse>;

export type ItemAbility = (myStats: DetailedStats, myStatsFixed: DetailedStats, eStats: DetailedStats, mybuff: Buffs, ebuff: Buffs, char: IcharInfo, enemy: IentityInfo, matchStats: MatchStats, notice: string[], embed: EmbedBuilder, user: User, ...list: any[]) => Promise<AbilityResponse>;

type ReplaceButtonAction = {
    emoji?: string;
    used?: number;
    run?: ItemAbility;
};

type ReplaceButton = {
    atk?: ReplaceButtonAction;
    def?: ReplaceButtonAction;
    ability?: ReplaceButtonAction;
    cskill?: ReplaceButtonAction;
    skip?: ReplaceButtonAction;
};

export type DetailedStats = {
    id: number;
    name: string;
    hp: number;
    maxhp: number;
    bhp: number;
    atk: number;
    batk: number;
    def: number;
    bdef: number;
    increase_defcap: number;
    ep: number;
    md: number;
    bmd: number;
    mr: number;
    bmr: number;
    increase_mrcap: number;
    cr: number;
    cd: number;
    td: number;
    br: number;
    brCap: number;
    agility: number;
    dodge: number;
    dodgeCap: number;
    mana: number;
    mg: number;
    sm: number;
    shield: number;
    mdChance: number;
    rev: number;
    revhp: number;
    revivedTotal: number;
    maxRevivals: number;
    attackStreak: number;
    crittedTotal: number;
    selfheal: Array<number>;
    selfhealChance: Array<number>;
    dodgeHeal: number;
    critmana: number;
    usedBlockRound: number;
    blockBuffDef: number;
    blockBurn: number;
    blockStreak: number;
    dodgeStreak: number;
    damageTaken: number;
    executeHP: number;
    negateHeal: number;
    ignoreShield: boolean;
    damageReduction: number;
    damageFormula: string;
    delayedBuffs: IdelayedBuff[];
    replaceButton: ReplaceButton;
    lvl: number;
    ref: number;
    class: number;
    clvl: number;
    expertise: Expertise;
    ringSlots: number;
    weapon: number;
    weaponinfo: Record<string, any>;
    weaponicon: string;
    uniqueids: Array<string>;
    ring1?: number;
    ring2?: number;
    ring3?: number;
    ring1icon: string;
    ring2icon: string;
    ring3icon: string;
    ring1info?: WeaponSchema;
    ring2info?: WeaponSchema;
    ring3info?: WeaponSchema;
    [key: string]: any;
};


export interface BotEvent {
    name: string,
    once?: boolean,
    disabled?: boolean,
    execute: (...args?) => void;
}

export interface BotHandler {
    name: string,
    once?: boolean,
    disabled?: boolean,
    execute: (...args?) => void;
}

interface executeSlashCommand {
    interaction: ChatInputCommandInteraction,
    locale: Locale,
    author: { schema: CompactUserSchema; },
    server: { schema?: ServerSchema; },
    reply?: any,
    warn?: any,
    customFlag?: any,
}

export interface SlashCommand {
    name: string,
    execute: ({ }: executeSlashCommand) => void,
    autocomplete?: ({ }: { interaction: AutocompleteInteraction; }) => Promise<Array<{ name: string, value: string; }>>,
    executeButtonInteraction?: ({ }: { interaction: ButtonInteraction; }) => void,
    cooldown?: number, // in seconds
}

export interface UserSchema {
    rowid: number;
    id: string;
    name: string;
    xp: number;
    coins: number;
    lilies: number;
    favchar: number | null;
    battlechar: number | null;
    lootbox: number;
    lastvote: Date | null;
    weeklyclaimed: number;
    dailyclaimed: number;
    dailystreak: number;
    lastdaily: Date | null;
    pullcount: number;
    pullstacks: number;
    pullstacksinterval: number;
    pullstotal: number;
    lastss: number;
    lasts: number;
    premium: number;
    pullresets: number;
    ssshard: number;
    sshard: number;
    ashard: number;
    bshard: number;
    cshard: number;
    dshard: number;
    ssticket: number;
    sticket: number;
    aticket: number;
    bticket: number;
    cticket: number;
    dticket: number;
    stamps: number;
    votestotal: number;
    arenawins: number;
    arenalosses: number;
    animationdelay: number;
    achievements: number[];
    lastpull: Date | null;
    pullreminder: number;
    votereminder: number;
    items: Record<string, number>;
    skins: number[];
    eventpts: number;
    brbest: number;
    mailbox: { type: string, rewards: string, message: string, date: number; }[];
    eventrewreceived: number;
    gems: number;
    tutorial: number[];
    transactions: RankShopTransaction[];
    dailies: Record<string, number>;
    guild: string | null;
    donatedtotal: number;
    genesispity: number;
    genesisdupepity: number;
    presets: Array<{
        character?: number;
        class?: number;
        weapon?: string;
        shield?: string;
        helmet?: string;
        cuirass?: string;
        gloves?: string;
        boots?: string;
    }>;
    itemlock: string[];
    party: string | null;
    stampedechar: number | null;
    mailreceived: number;
    eventpts2: number;
    class: number | null;
    aboutme: string | null;
    profilecolor: string | null;
    jades: number;
    pass: number;
    passlevel: number;
    freepassclaimed: number;
    premiumpassclaimed: number;
    celebrateclaimed: number;
    expulls: number;
    level: number;
    bank: number;
    charxp: number;
    feedlimit: number;
    findoption: number;
    referred_by: string | null;
    referred_gems: number;
    referrals_claimed: number;
    passpurchaselimit: number;
    expity: number;
    craze_equipment: Record<string, any>;
    equipment: Record<string, string>;
    trial_equipment: Record<string, any>;
    craze_levels: Record<string, any>;
    shield_slot: number;
    lastguildjoin: Date | null;
    valentine: string | null;
    bosshuntruns: number;
    bosshuntrevreceived: number;
    monthlyshop: Record<string, any>;
    itemwishlist: number[];
    stampedeenergy: number;
    background: string | null;
    backgrounds: string[];
    charlock: number[];
    animelock: number[];
    cow_participation: number | null;
    cow_chars: number[];
    cow_timer: number | null;
    cow_rolled_today: number;
    // rank: number;
    rankscore: number;
    guild_marks: number;
    image_credits: number;
    skill_tree: Record<string, number>;
    skill_points: number;
    raid_supports: number[];
    user_settings: Record<string, any>;
    created: Date;

    chars: number[];
    char_ref: Record<string, number>;
    char_level: Record<string, any>;
    char_class: Record<string, any>;
    char_skin: Record<string, any>;
    char_equipment: Record<string, any>;

    dungeon_floors: Record<string, number>;
    dungeon_limit: number;
    dungeon_classes: number[];
    dungeon_classlevels: Record<string, number>;
    dungeon_responsetime: Date[];
    stampede_responsetime: Date[];
}

export type CompactUserSchema = Omit<UserSchema, "transactions" | "char_level" | "char_class" | "char_equipment" | "dungeon_responsetime" | "stampede_responsetime">;

export type UserSchemaForStats = Pick<CompactUserSchema, "id" | "name" | "xp" | "premium" | "battlechar" | "level" | "bank" | "char_ref" | "equipment" | "shield_slot" | "class" | "dungeon_classlevels" | "dungeon_floors">;

export interface ServerSchema {
    rowid: number;
    id: string;
    name: string;
    user_ids: string[];
}

export interface WeaponSchema {
    rowid: number;
    id: string;
    itemid: number;
    uniqueid: string;
    level: number;
    ascension: number;
    character: number | null;
    item_type: "weapon" | "armor" | "ring";
}

export interface GuildSchema {
    rowid: number;
    id: string;
    name: string;
    description: string;
    color: string | null;
    level: number;
    icon: string | null;
    banner: string | null;
    treasury: number;
    treasury_gems: number;
    tax: number;
    canjoin: number;
    tokens: number;
    membercap: number;
    xpbuff: number;
    lootbuff: number;
    cdreduction: number;
    atkbuff: number;
    hpbuff: number;
    defbuff: number;
    master: string;
    elders: string[];
    members: string[];
    banned: string[];
    eventpoints: number;
    bosshuntstage: number;
    boss1: number;
    boss2: number;
    boss3: number;
    boss4: number;
    lastlevelup: Date | null;
    raidid: number | null;
}

export interface GuildDonationSchema {
    rowid: number;
    userid: string;
    guildid: string;
    week: number;
    type: string;
    amount: number;
}

export interface StampedeSchema {
    rowid: number;
    type: number;
    bosshp: number;
    bosshpmax: number;
    generalhp: number;
    generalhpmax: number;
    generalstotal: number;
    generalsleft: number;
    monsterstotal: number;
    monstersleft: number;
    participation: Record<string, [number, number]>;
}

export interface PartySchema {
    rowid: number;
    id: string;
    name: string;
    description: string;
    color: string | null;
    icon: string | null;
    banner: string | null;
    members: string[];
    created: Date | null;
}

export interface TradeSchema {
    rowid: number;
    id: string;
    receiver: string;
    type: string;
    sent: number;
    sent_at: Date;
}

export interface FAQSchema {
    rowid: number;
    id: string;
    name: string;
    body: string;
    created: Date;
}

export interface RaidSchema {
    rowid: number;
    guildid: string;
    raidid: number;
    rank_letter: RaidRank;
    enemy_hp: number;
    enemy_hpmax: number;
    /**
     * [damage, runs]
     */
    participation: Record<string, [number, number]>;
    start_date: Date;
    end_date: Date | null;
}

export type RankShopTransaction = {
    authorization?: string;
    txn_id: string;
    status: string;
    buyer_email: string;
    buyer_id?: string;
    product_id: string;
    amount: number;
    recurring: boolean;
    price: string;
    price_in_cents: number;
    currency: string;
    first_purchase: boolean;
    timestamp: number;
};

export type IbuffInfo = {
    type: BuffType;
    val: number;
    last: number;
    change: number;
    ctype: string;
    cap?: number | [number, number];
    id: number;

    isDebuff: boolean;
    range: [number, number];
};

export type Buffs = {
    "hp": IbuffInfo[];
    "atk": IbuffInfo[];
    "def": IbuffInfo[];
    "ep": IbuffInfo[];
    "md": IbuffInfo[];
    "mr": IbuffInfo[];
    "cr": IbuffInfo[];
    "cd": IbuffInfo[];
    "td": IbuffInfo[];
    "br": IbuffInfo[];
    "agility": IbuffInfo[];
    "dodge": IbuffInfo[];
    "mana": IbuffInfo[];
    "mg": IbuffInfo[];
    "sm": IbuffInfo[];
    "rev": IbuffInfo[];
    "revhp": IbuffInfo[];
};

export interface ITrigger {
    event: TriggerEvents;
    duration: number;
    maxRound: number;
    maxUsage: number;
    used: number;
    target?: DetailedStats;
    caster?: DetailedStats;
    callback: (...args: any[]) => any;
    id: number;

    set duration(duration: number);
    set used(used: number);
};

export type TriggerEvents = "attack" | "crit" | "noncrit" | "counter" | "dodge" | "block" | "miss" | "execute" | "shieldBreak" | "ATK" | "DEF" | "ABILITY" | "CSKILL" | "minionDeath" | "revival" | "heal" | "deathEvade";

export type TriggerCallback = ((args: { trigger: ITrigger, caster: DetailedStats, target: DetailedStats, casterBuff: Buffs, targetBuff: Buffs, matchStats: MatchStats, options: any; }) => any);

export type TriggerOptions = {
    event: TriggerEvents;
    duration?: number;
    maxRound?: number;
    maxUsage?: number;
    target?: DetailedStats;
    caster?: DetailedStats;
    callback: TriggerCallback;
};

export type MatchStats = {
    turn: number;
    round: number;
    roundCheck: number;
    ended: boolean;
    interaction: ChatInputCommandInteraction;
    turnSkill: number;
    timeout: number;
    defUsed: number;
    p1usedblock: number;
    p2usedblock: number;
    combodmg: number;
    revivedTotal: number;
    collector: Record<string, any>;
    abilityUsed: number;
    blockAbilities: number;
    loot: number;
    lootm: number;
    xpboost: number;
    counter: number;
    counterChance: number;
    currentCharacter: number;
    currentOpponent: number;
    myStatsCC: Record<string, any>;
    eStatsCC: Record<string, any>;
    tdChance: number;
    shieldBreak: number;
    selfdmg: number;
    twinshot: number;
    critbleed: boolean;
    critbleedlast: number;
    evadeDeathStrike: number;
    evadeDeathChance: number;
    allowExecution: boolean;
    damageFormula: "default" | `log_scale_${number}`;
    consumeMana: number;
    lightningMultiplier?: number;
    dodgebuffLast?: number;
    dodgebuff?: number;
    allowSelfheal?: boolean;
    heap1: any;
    listeners: Record<TriggerEvents, ITrigger[]>;
    on(event: TriggerEvents, options: PartialBy<TriggerOptions, "event"> | TriggerCallback): () => void;
    off(event: TriggerEvents, trigger: ITrigger | number): void;
    trigger(event: TriggerEvents, caster: any, target: any, casterBuff: any, targetBuff: any, options?: any): void;

    [key: string]: any;
};


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
        | { type: 'remove'; value: UserSchema[K]; }
        | { type: 'remove_all'; value: UserSchema[K]; }
        : never)

    // JSON operations - only work with object fields
    | (K extends JsonKeys<UserSchema>
        ? { type: 'set_json'; value: UserSchema[K]; }
        | { type: 'merge_json'; value: Partial<UserSchema[K]>; }
        : never);

export type UpdateUserOptions = {
    [K in keyof Partial<UserSchema>]: UpdateUserOperation<K>;
};


type UpdateWeaponOperation<K extends keyof WeaponSchema> =
    // Simple set operation - works with any key
    | { type: 'set'; value: WeaponSchema[K]; }
    // Increment operation - only works with number fields
    | (K extends NumberKeys<WeaponSchema>
        ? { type: 'increment'; value: number; }
        : never);

export type UpdateWeaponOptions = {
    [K in keyof Partial<WeaponSchema>]: UpdateWeaponOperation<K>;
};


type UpdateGuildOperation<K extends keyof GuildSchema> =
    // Simple set operation - works with any key
    | { type: 'set'; value: GuildSchema[K]; }

    // Increment operation - only works with number fields
    | (K extends NumberKeys<GuildSchema>
        ? { type: 'increment'; value: number; }
        : never)

    // Array operations - only work with array fields
    | (K extends ArrayKeys<GuildSchema>
        ? { type: 'append'; value: GuildSchema[K]; }
        | { type: 'append_unique'; value: GuildSchema[K]; }
        | { type: 'remove'; value: GuildSchema[K]; }
        | { type: 'remove_all'; value: GuildSchema[K]; }
        : never)

    // JSON operations - only work with object fields
    | (K extends JsonKeys<GuildSchema>
        ? { type: 'set_json'; value: GuildSchema[K]; }
        | { type: 'merge_json'; value: Partial<GuildSchema[K]>; }
        : never);

export type UpdateGuildOptions = {
    [K in keyof Partial<GuildSchema>]: UpdateGuildOperation<K>;
};


type UpdatePartyOperation<K extends keyof PartySchema> =
    // Simple set operation - works with any key
    | { type: 'set'; value: PartySchema[K]; }

    // Increment operation - only works with number fields
    | (K extends NumberKeys<PartySchema>
        ? { type: 'increment'; value: number; }
        : never)

    // Array operations - only work with array fields
    | (K extends ArrayKeys<PartySchema>
        ? { type: 'append'; value: PartySchema[K]; }
        | { type: 'append_unique'; value: PartySchema[K]; }
        | { type: 'remove'; value: PartySchema[K]; }
        | { type: 'remove_all'; value: PartySchema[K]; }
        : never)

    // JSON operations - only work with object fields
    | (K extends JsonKeys<PartySchema>
        ? { type: 'set_json'; value: PartySchema[K]; }
        | { type: 'merge_json'; value: Partial<PartySchema[K]>; }
        : never);

export type UpdatePartyOptions = {
    [K in keyof Partial<PartySchema>]: UpdatePartyOperation<K>;
};


type UpdateStampedeOperation<K extends keyof StampedeSchema> =
    // Simple set operation - works with any key
    | { type: 'set'; value: StampedeSchema[K]; }

    // Increment operation - only works with number fields
    | (K extends NumberKeys<StampedeSchema>
        ? { type: 'increment'; value: number; }
        : never)

    // JSON operations - only work with object fields
    | (K extends JsonKeys<StampedeSchema>
        ? { type: 'set_json'; value: StampedeSchema[K]; }
        | { type: 'merge_json'; value: Partial<StampedeSchema[K]>; }
        : never);

export type UpdateStampedeOptions = {
    [K in keyof Partial<StampedeSchema>]: UpdateStampedeOperation<K>;
};


declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string,
            CAMELOT: string,
            ELDER: string,

            PREFIX: string,

            PATREON_TOKEN: string,
            PATREON_CAMPAIGN_ID: string,

            RANK_AUTH: string,

            TOPGG_AUTH: string,
            TOPGG_TOKEN: string,

            DONATEBOT_KEY: string,

            PG_USER: string,
            PG_DATABASE: string,
            PG_PASSWORD: string,
            PG_PORT: string,

            ADMINS: string,
            VERSION: string,
        }
    }
}

declare module "discord.js" {
    export interface Client {
        slashCommands: Collection<string, SlashCommand>;
    }
}
