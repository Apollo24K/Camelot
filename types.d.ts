

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


export type TriggerEvents = "attack" | "crit" | "ability" | "counter" | "dodge" | "block" | "miss" | "execute";

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


declare module "discord.js" {
    export interface Client {
        commands: Collection<string, any>;
    }
}
