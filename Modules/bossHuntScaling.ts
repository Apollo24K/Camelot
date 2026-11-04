// Single source of truth for Boss Hunt boss HP scaling. Spawn, display, combat and the
// one-time data migration in postgres.ts must all use this, otherwise a guild's stored boss HP
// drifts out of sync with the HP bar shown in a fight.

export const BOSS_BASE_HP = [126080, 168260, 121720, 149640] as const;

export const BOSS_HUNT_MAX_STAGE = 50;

const BOSS_HP_GROWTH_MILD = 0.12;
const BOSS_HP_GROWTH_STEEP = 0.25;
const BOSS_HP_GROWTH_STEEPEST = 0.35;

const BOSS_HP_MULT_25 = 0.8 + (25 * 0.3);
const BOSS_HP_MULT_30 = BOSS_HP_MULT_25 * Math.pow(1 + BOSS_HP_GROWTH_MILD, 5);
const BOSS_HP_MULT_40 = BOSS_HP_MULT_30 * Math.pow(1 + BOSS_HP_GROWTH_STEEP, 10);

export const stageMultiplier = (stage: number) => {
    if (stage <= 24) return 0.8 + (stage * 0.3);
    if (stage <= 30) return BOSS_HP_MULT_25 * Math.pow(1 + BOSS_HP_GROWTH_MILD, stage - 25);
    if (stage <= 40) return BOSS_HP_MULT_30 * Math.pow(1 + BOSS_HP_GROWTH_STEEP, stage - 30);
    return BOSS_HP_MULT_40 * Math.pow(1 + BOSS_HP_GROWTH_STEEPEST, stage - 40);
};

export const bossMaxHP = (baseHP: number, stage: number) => Math.round(baseHP * stageMultiplier(stage));

// The pre-rework curve (stage cap 30). Only used to rescale guilds that progressed past stage 25
// before the current curve existed.
export const legacyStageMultiplier = (stage: number) => 0.8 + (stage * (stage > 25 ? 1.5 : 0.3));
