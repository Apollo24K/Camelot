import charInfo, { charactersEX, charactersSS, charactersS } from "./chars";
import { SeasonalEvent } from "../types";
import { isEventOngoing, ongoingEvent, seasonalEventEnd } from "./components";

export type ExBannerKind = "standard" | "rateup" | "limited";

export type ExPityColumn = "expity_standard" | "expity_rateup" | "expity_limited";

export type ExGuaranteeColumn = "exguarantee_rateup" | "exguarantee_limited";

export interface ExBanner {
    kind: ExBannerKind;
    name: string;
    description: string;
    /** On-banner characters. Empty for the standard banner, whose whole pool is on-banner. */
    featured: charInfo[];
    /** Where the EX slot lands when it misses every featured character. */
    exPool: charInfo[];
    /** Weight of each featured character *within* the EX slot. */
    featuredRate: number[];
    pityColumn: ExPityColumn;
    /** Where this banner's on-banner guarantee is stored. Absent on banners without an on-banner. */
    guaranteeColumn?: ExGuaranteeColumn;
    available: boolean;
    /** Unix ms timestamp when this banner's current run ends; absent for banners without an end. */
    expiresAt?: number;
}

// Rarity rates are deliberately identical on every banner so that only the composition
// of the EX slot changes between them. These reproduce the pre-banner /ex banner exactly,
// including its 0.5 - EX_RATE fallback threshold.
export const EX_RATE = 0.013;
export const FALLBACK_SS_RATE = 0.5 - EX_RATE;

/** Actual per-pull rarity chances, as opposed to the conditional rates above. */
export const SS_RATE = (1 - EX_RATE) * FALLBACK_SS_RATE;
export const S_RATE = (1 - EX_RATE) * (1 - FALLBACK_SS_RATE);

export const HARD_PITY = 80;

/** Never obtainable from any pull banner. */
export const PERMANENT_EXCLUSIONS = [
    17583, // Raphael EX
    17115, // Luminous EX
];

/** EX characters featured by each event, used for the limited banner and to keep them out of the standard pool. */
export const eventExCharacters: { [key: string]: number[]; } = {
    anniversary: [26272, 26273], // Hiyuki EX, Lloyd Frontera EX
    halloween: [26274, 26275], // Ainz Ooal Gown EX, Denji EX
};

/** Bump to the event currently running; its EX characters leave the standard pool and head the limited banner. */
export const currentEvent = ongoingEvent;
/** Set to the event before {@link currentEvent}; its EX characters return to the standard pool once the event ends. */
export const previousEvent: SeasonalEvent | null = "anniversary";

/** How often the rate-up character rotates. Deterministic so restarts don't reshuffle the banner. */
export const RATEUP_ROTATION_MS = 7 * 24 * 60 * 60 * 1000;

const byIds = (ids: number[]): charInfo[] => ids.map((id) => charactersEX.find((e) => e.id === id)).filter((e): e is charInfo => !!e);

const currentEventEx = byIds(eventExCharacters[currentEvent] ?? []);
const previousEventEx = byIds(previousEvent ? eventExCharacters[previousEvent] ?? [] : []);

/** Every EX character that can appear outside of an event. */
export const standardPool: charInfo[] = charactersEX.filter((e) =>
    !PERMANENT_EXCLUSIONS.includes(e.id)
    && !currentEventEx.some((c) => c.id === e.id)
    && !previousEventEx.some((c) => c.id === e.id)
);

/**
 * The event limited banner is only live while the event itself is, so this is evaluated on
 * every access rather than once at boot — otherwise the banner would stay open (or closed)
 * after an event starts or ends until the process restarts.
 */
export const getLimitedCharacters = (): charInfo[] => isEventOngoing() ? currentEventEx : [];

const getRateUpIndex = () => {
    if (!standardPool.length) return -1;
    const period = Math.floor(Date.now() / RATEUP_ROTATION_MS);
    // xorshift so consecutive periods land on unrelated pool entries.
    let h = Math.imul(period ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) % standardPool.length;
};

/** This period's featured EX, recomputed on access so the weekly rotation doesn't need a restart. */
export const getRateUpCharacter = (): charInfo[] => {
    const index = getRateUpIndex();
    return index >= 0 ? [standardPool[index]] : [];
};

const getStandardBanner = (): ExBanner => ({
    kind: "standard",
    name: "Standard Banner",
    description: "This banner offers an equal chance to obtain any <a:ex:1542903901320122368> character in the standard pool.",
    featured: [],
    exPool: standardPool,
    featuredRate: [],
    pityColumn: "expity_standard",
    available: standardPool.length > 0,
});

const getRateUpBanner = (): ExBanner => {
    const featured = getRateUpCharacter();
    return {
        kind: "rateup",
        name: "Rate-up Banner",
        description: "This banner boosts the odds for this week's featured <a:ex:1542903901320122368> character. Pity and guarantee carry over between rate-up banners.",
        featured,
        // Exclude the featured character from the miss-pool: it already comes out of the featured
        // slice, and leaving it in the pool would inflate its real rate above the advertised one.
        exPool: standardPool.filter((c) => !featured.some((f) => f.id === c.id)),
        featuredRate: featured.length ? [0.5] : [],
        pityColumn: "expity_rateup",
        guaranteeColumn: "exguarantee_rateup",
        available: standardPool.length > 0,
        // The rate-up rotates on a fixed 7-day cadence, so it ends at the next period boundary.
        expiresAt: (Math.floor(Date.now() / RATEUP_ROTATION_MS) + 1) * RATEUP_ROTATION_MS,
    };
};

const getLimitedBanner = (): ExBanner => {
    const featured = getLimitedCharacters();
    return {
        kind: "limited",
        name: "Event Banner",
        description: "This banner features the <:newtwo:1408872814294863933> event <a:ex:1542903901320122368> characters. These EXes won't join the standard pool for the next 2 events.",
        featured,
        exPool: standardPool.filter((c) => !featured.some((f) => f.id === c.id)),
        featuredRate: featured.length ? Array(featured.length).fill(0.7 / featured.length) : [],
        pityColumn: "expity_limited",
        guaranteeColumn: "exguarantee_limited",
        available: featured.length > 0,
        // The event banner lives exactly as long as the event itself.
        expiresAt: seasonalEventEnd.getTime(),
    };
};

export const exBanners: { [key in ExBannerKind]: ExBanner } = {
    get standard() { return getStandardBanner(); },
    get rateup() { return getRateUpBanner(); },
    get limited() { return getLimitedBanner(); },
};

/**
 * Rolls one pull.
 *
 * The EX slot only triggers at EX_RATE, or on the pull that reaches HARD_PITY. When it does, the
 * featured/exPool split decides the character; anything that misses every featured character sets
 * the guarantee so the next EX on a rate-up or limited banner is the on-banner one.
 */
export const rollExBanner = (banner: ExBanner, pity: number, guaranteed: boolean): { char: charInfo, pity: number, guaranteed: boolean; } => {
    const forceEx = pity + 1 >= HARD_PITY;

    let char: charInfo;
    let newPity = pity;
    let newGuaranteed = guaranteed;

    if (forceEx || Math.random() < EX_RATE) {
        newPity = 0;

        if (newGuaranteed && banner.featured.length) {
            char = banner.featured[Math.floor(Math.random() * banner.featured.length)];
            newGuaranteed = false;
        } else {
            const roll = Math.random();
            let acc = 0;
            char = undefined as any;
            for (let i = 0; i < banner.featured.length; i++) {
                acc += banner.featuredRate[i];
                if (roll < acc) {
                    char = banner.featured[i];
                    break;
                };
            };
            // Falling back to featured (then the whole EX pool) keeps the pool non-empty even in
            // degenerate cases such as a single-character standard pool.
            const missPool = banner.exPool.length ? banner.exPool : (banner.featured.length ? banner.featured : charactersEX);
            char ??= missPool[Math.floor(Math.random() * missPool.length)];
            newGuaranteed = banner.featured.length > 0 && !banner.featured.some((e) => e.id === char.id);
        };
    } else {
        newPity = Math.min(pity + 1, HARD_PITY - 1);
        const fallback = (Math.random() < FALLBACK_SS_RATE) ? charactersSS : charactersS;
        char = fallback[Math.floor(Math.random() * fallback.length)];
    };

    return { char, pity: newPity, guaranteed: newGuaranteed };
};