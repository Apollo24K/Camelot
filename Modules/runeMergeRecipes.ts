export interface RuneMergeRecipe {
    inputs: Record<number, number>;
    output: number;
    coinCost?: number;
    label?: string;
}

export const runeMergeRecipes: RuneMergeRecipe[] = [
    { inputs: { 786: 1, 852: 1 }, output: 853 },                   // 1X Coinmark + 1x Coinflip -> 1x Midas
    // { inputs: { 786: 3, 787: 1 }, output: 843 },                 // 3x Coinmark + Valkyrie Sigil → Silverlux Cascade
    // { inputs: { 788: 5 }, output: 844, coinCost: 50000 },        // 5x Hollow Crown → Sweet Surprise
];
