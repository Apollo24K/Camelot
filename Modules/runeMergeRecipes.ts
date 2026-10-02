import { ItemCategory, ItemRarity, ItemType } from "../types";

export interface WildcardInput {
    category?: ItemCategory;
    grade?: ItemRarity;
    type?: ItemType;
    qty: number;
}

export const isValidWildcard = (wc: WildcardInput): boolean => !!(wc.category || wc.grade || wc.type);

export interface MergeRecipe {
    inputs?: Record<number, number>;
    wildcards?: WildcardInput[];
    output: number;
    coinCost?: number;
    label?: string;
}

export const mergeRecipes: MergeRecipe[] = [
    { inputs: { 786: 1, 852: 1 }, output: 853 },                   // 1x Coinmark + 1x Coinflip -> 1x Midas' Blessing
    // { inputs: { 786: 3, 787: 1 }, output: 843 },                 // 3x Coinmark + Valkyrie Sigil → Silverlux Cascade
    // { inputs: { 788: 5 }, output: 844, coinCost: 50000 },        // 5x Hollow Crown → Sweet Surprise

    // Example wildcard recipes:
    // { wildcards: [{ grade: "mythical", type: "bow", qty: 2 }, { grade: "mythical", qty: 8 }], output: 1234 },
];

// Backward compatibility aliases
export const runeMergeRecipes = mergeRecipes;
export type RuneMergeRecipe = MergeRecipe;
