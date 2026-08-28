// Extreme Floor Item Drops Mapping
// Maps hidden floors 1-20 to their respective unique item IDs and types
// Now supports weapons, armor, rings, and runes

interface ExtremeItemDrop {
    itemId: number;
    itemType: "weapon" | "armor" | "ring" | "rune";
    // Optional material configuration for weapons
    ascensionMaterialId?: number;  // Specific ascension material ID (optional)
    ascensionAmount?: number;      // Custom ascension material amount (optional)
    craftingAmount?: number;       // Custom crafting material amount (optional)
}

export const extremeFloorItemMapping: Record<number, ExtremeItemDrop> = {
    1: { itemId: 842, itemType: "weapon", ascensionMaterialId: 829, ascensionAmount: 240, craftingAmount: 180 },  // Ciel: Ciel's Blessing
    2: { itemId: 797, itemType: "weapon", ascensionMaterialId: 798, ascensionAmount: 240, craftingAmount: 180 }, // McBurn: Angbar
    3: { itemId: 799, itemType: "weapon", ascensionMaterialId: 804, ascensionAmount: 240, craftingAmount: 180 }, // Father: The Flawed
    4: { itemId: 852, itemType: "weapon", ascensionMaterialId: 854, ascensionAmount: 240, craftingAmount: 180 }, // Eliza (alter) : Coinflip Trochoid
    5: { itemId: 800, itemType: "weapon", ascensionMaterialId: 831, ascensionAmount: 240, craftingAmount: 180 },  // Atares: Kamish's Wrath
    6: { itemId: 801, itemType: "weapon", ascensionMaterialId: 830, ascensionAmount: 240, craftingAmount: 180 },  // NereID: Thalokorn
    7: { itemId: 802, itemType: "weapon", ascensionMaterialId: 803, ascensionAmount: 240, craftingAmount: 180 },  // Ryomen Sukuna: Kamutoke
    8: { itemId: 843, itemType: "rune", ascensionMaterialId: 832, ascensionAmount: 240, craftingAmount: 180 },  // Aneira (alter): Silverlux Cascade
    9: { itemId: 844, itemType: "rune", ascensionMaterialId: 825, ascensionAmount: 240, craftingAmount: 180 },  // Rainee (alter): Sweet Surprise
    10: { itemId: 846, itemType: "weapon", ascensionMaterialId: 833, ascensionAmount: 240, craftingAmount: 180 },  // (next available weapon)
    11: { itemId: 837, itemType: "armor", ascensionMaterialId: 847, ascensionAmount: 240, craftingAmount: 180 },  // Oktavia von Seckendorff: Marguerite Noire Vambrace
    12: { itemId: 836, itemType: "armor", ascensionMaterialId: 847, ascensionAmount: 240, craftingAmount: 180 },  // Ophelia: Marguerite Noire Robe
    13: { itemId: 838, itemType: "armor", ascensionMaterialId: 847, ascensionAmount: 240, craftingAmount: 180 },  // Candeloro: Marguerite Noire Boots
    14: { itemId: 835, itemType: "armor", ascensionMaterialId: 847, ascensionAmount: 240, craftingAmount: 180 },  // Homulily: Marguerite Noire Hat
    15: { itemId: 839, itemType: "rune", ascensionMaterialId: 834, ascensionAmount: 240, craftingAmount: 180 },  // Kriemhild Gretchen: Soul Gem
    16: { itemId: 845, itemType: "weapon", ascensionMaterialId: 827, ascensionAmount: 240, craftingAmount: 180 },  // Medusa: Gorgoneion Aegis
    17: { itemId: 851, itemType: "armor", ascensionMaterialId: 826, ascensionAmount: 240, craftingAmount: 180 },  // The Chosen One Armor
    18: { itemId: 848, itemType: "armor", ascensionMaterialId: 826, ascensionAmount: 240, craftingAmount: 180 },  // The Chosen One Armor
    19: { itemId: 849, itemType: "armor", ascensionMaterialId: 826, ascensionAmount: 240, craftingAmount: 180 },  // The Chosen One Armor
    20: { itemId: 850, itemType: "armor", ascensionMaterialId: 826, ascensionAmount: 240, craftingAmount: 180 },  // The Chosen One Armor
};

// Function to check if a floor has an extreme item drop
export function hasExtremeItemDrop(floor: number): boolean {
    return floor >= 1 && floor <= 20 && floor in extremeFloorItemMapping;
}

// Function to get the item drop info for a specific floor
export function getExtremeItemDrop(floor: number): ExtremeItemDrop | null {
    return hasExtremeItemDrop(floor) ? extremeFloorItemMapping[floor] : null;
}

// Legacy functions for backward compatibility
export function hasExtremeWeaponDrop(floor: number): boolean {
    return hasExtremeItemDrop(floor) && extremeFloorItemMapping[floor]?.itemType === "weapon";
}

export function getExtremeWeaponId(floor: number): number | null {
    const drop = getExtremeItemDrop(floor);
    return drop && drop.itemType === "weapon" ? drop.itemId : null;
}

// Function to check if a weapon ID is from extreme dungeon drops
export function isExtremeWeapon(itemId: number): boolean {
    return Object.values(extremeFloorItemMapping)
        .some(drop => drop.itemType === "weapon" && drop.itemId === itemId);
}

// Function to get material configuration for a specific weapon ID
export function getExtremeWeaponConfig(itemId: number): ExtremeItemDrop | null {
    const drop = Object.values(extremeFloorItemMapping)
        .find(drop => drop.itemType === "weapon" && drop.itemId === itemId);
    return drop || null;
}

// Function to check if any item (weapon/armor/ring/rune) is an extreme drop
export function isExtremeItem(itemId: number): boolean {
    return Object.values(extremeFloorItemMapping)
        .some(drop => drop.itemId === itemId);
}

// Function to get material configuration for any extreme item by ID
export function getExtremeItemConfig(itemId: number): ExtremeItemDrop | null {
    const drop = Object.values(extremeFloorItemMapping)
        .find(drop => drop.itemId === itemId);
    return drop || null;
}
