

export type Gender = 'M' | 'F' | 'NB';

export type CharacterRarity = 'EX' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'D';

export type RaidRank = 'F-' | 'F' | 'F+' | 'E-' | 'E' | 'E+' | 'D-' | 'D' | 'D+' | 'C-' | 'C' | 'C+' | 'B-' | 'B' | 'B+' | 'A-' | 'A' | 'A+' | 'S-' | 'S' | 'S+' | 'SS-' | 'SS' | 'SS+' | 'SSS-' | 'SSS' | 'SSS+' | 'EX-' | 'EX' | 'EX+';

export type BuffType = "*" | "+" | "=";


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
    votestotal: number;
    arenawins: number;
    arenalosses: number;
    animationdelay: number;
    achievements: any[];
    lastpull: Date | null;
    pullreminder: number;
    votereminder: number;
    items: Record<string, any>;
    skins: any[];
    eventpts: number;
    brbest: number;
    mailbox: any[];
    eventrewreceived: number;
    gems: number;
    tutorial: any[];
    transactions: any[];
    dailies: Record<string, any>;
    guild: string | null;
    donatedtotal: number;
    genesispity: number;
    presets: any[];
    itemlock: any[];
    party: string | null;
    stampedechar: number | null;
    mailreceived: number;
    eventpts2: number;
    class: number | null;
    aboutme: string | null;
    profilecolor: string | null;
    rank: string;
    rankscore: number;
    raidxp: number;
    guild_marks: number;
    created: Date;

    chars: any[];
    char_ref: Record<string, any>;
    char_level: Record<string, any>;
    char_class: Record<string, any>;
    char_skin: Record<string, any>;
    char_equipment: Record<string, any>;

    dungeon_floors: Record<string, number>;
    dungeon_limit: number;
    dungeon_classes: any[];
    dungeon_classlevels: Record<string, any>;
    dungeon_responsetime: string;
    stampede_responsetime: string;
}

export type CompactUserSchema = Omit<UserSchema, "transactions" | "chars" | "char_ref" | "char_level" | "char_class" | "char_skin" | "char_equipment" | "dungeon_responsetime" | "stampede_responsetime">;

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
    icon: string;
    banner: string;
    treasury: number;
    treasury_gems: number;
    tax: number;
    canjoin: number;
    tokens: number;
    membercap: number;
    xpbuff: number;
    lootbuff: number;
    cdreduction: number;
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
    participation: Record<string, any>;
}

export interface PartySchema {
    rowid: number;
    id: string;
    name: string;
    description: string;
    color: string | null;
    icon: string;
    banner: string;
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
    enemy_hp: number;
    enemy_hpmax: number;
    participation: Record<string, any>;
    start_date: Date;
}

export type RankShopTransaction = {
    authorization?: string;
    txn_id: string;
    status: string;
    buyer_email: string;
    buyer_id?: string;
    product_id: string;
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
    cap?: number;
    id: number;
    isDebuff: boolean;
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


export type TriggerEvents = "attack" | "crit" | "ability" | "counter" | "dodge" | "block" | "miss" | "execute" | "shieldBreak" | "defend" | "cskill";

export type TriggerOptions = {
    event: TriggerEvents;
    duration?: number;
    maxRound?: number;
    maxUsage?: number;
    target?: any;
    caster?: any;
    callback: (...args: any[]) => any;
};

export type MatchStats = {
    turn: number;
    round: number;
    roundCheck: number;
    ended: boolean;
    interaction: any;
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
    selfheal: number;
    selfhealChance: number;
    twinshot: number;
    critbleed: boolean;
    critbleedlast: number;
    evadeDeathStrike: number;
    evadeDeathChance: number;
    allowExecution: boolean;
    damageFormula: "default" | `log_scale_${number}`;
    consumeMana: number;
    dodgebuff: number;
    heap1: number;
    listeners: Record<TriggerEvents, Trigger[]>;
    on(event: TriggerEvents, options: TriggerOptions | (() => any)): void;
    off(event: TriggerEvents, trigger: Trigger | number): void;
    trigger(event: TriggerEvents, caster: any, target: any, casterBuff: any, targetBuff: any, options?: any): void;

    [key: string]: any;
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
        commands: Collection<string, any>;
    }
}
