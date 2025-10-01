// D&D 5e Point Buy System

export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export const MIN_STAT = 8;
export const MAX_STAT = 15;
export const TOTAL_POINTS = 27;

export interface Stats {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

/**
 * Calculate total points spent for given stats
 */
export function calculatePointsSpent(stats: Stats): number {
  return Object.values(stats).reduce((total, statValue) => {
    return total + (POINT_BUY_COSTS[statValue] ?? 0);
  }, 0);
}

/**
 * Calculate remaining points
 */
export function calculateRemainingPoints(stats: Stats): number {
  return TOTAL_POINTS - calculatePointsSpent(stats);
}

/**
 * Get the cost to increase a stat from current to next value
 */
export function getCostToIncrease(currentValue: number): number | null {
  if (currentValue >= MAX_STAT) return null;
  const nextValue = currentValue + 1;
  const currentCost = POINT_BUY_COSTS[currentValue] ?? 0;
  const nextCost = POINT_BUY_COSTS[nextValue] ?? 0;
  return nextCost - currentCost;
}

/**
 * Get the points refunded when decreasing a stat
 */
export function getRefundForDecrease(currentValue: number): number | null {
  if (currentValue <= MIN_STAT) return null;
  const previousValue = currentValue - 1;
  const currentCost = POINT_BUY_COSTS[currentValue] ?? 0;
  const previousCost = POINT_BUY_COSTS[previousValue] ?? 0;
  return currentCost - previousCost;
}

/**
 * Check if increasing a stat is allowed
 */
export function canIncreaseStat(stats: Stats, statName: keyof Stats): boolean {
  const currentValue = stats[statName];
  if (currentValue >= MAX_STAT) return false;

  const cost = getCostToIncrease(currentValue);
  if (cost === null) return false;

  const remainingPoints = calculateRemainingPoints(stats);
  return remainingPoints >= cost;
}

/**
 * Check if decreasing a stat is allowed
 */
export function canDecreaseStat(stats: Stats, statName: keyof Stats): boolean {
  const currentValue = stats[statName];
  return currentValue > MIN_STAT;
}

/**
 * Validate that stats are legal according to point buy rules
 * Returns true if valid, error message if invalid
 */
export function validatePointBuyStats(stats: Stats): { valid: boolean; error?: string } {
  // Check all stats are within range
  for (const [statName, value] of Object.entries(stats)) {
    if (value < MIN_STAT || value > MAX_STAT) {
      return {
        valid: false,
        error: `${statName.toUpperCase()} must be between ${MIN_STAT} and ${MAX_STAT}`,
      };
    }

    // Check stat value is a valid point buy value
    if (!(value in POINT_BUY_COSTS)) {
      return {
        valid: false,
        error: `${statName.toUpperCase()} has invalid value ${value}`,
      };
    }
  }

  // Check total points spent equals exactly TOTAL_POINTS
  const pointsSpent = calculatePointsSpent(stats);
  if (pointsSpent !== TOTAL_POINTS) {
    return {
      valid: false,
      error: `Must spend exactly ${TOTAL_POINTS} points (spent ${pointsSpent})`,
    };
  }

  return { valid: true };
}

/**
 * Calculate HP and MP based on class and stats
 * HP Formula: base + (CON - 10) ÷ 2 (can be negative)
 * - Warrior: 10 + CON modifier
 * - Rogue: 8 + CON modifier
 * - Mage: 6 + CON modifier
 *
 * MP Formula (cannot go below base):
 * - Warrior: 2
 * - Rogue: 4 + max(0, (DEX - 10) ÷ 2)
 * - Mage: 8 + max(0, 2 × (INT - 10) ÷ 2)
 */
export function calculateDerivedStats(
  characterClass: "warrior" | "mage" | "rogue",
  stats: Stats
): { hp: number; mp: number } {
  const conModifier = Math.floor((stats.con - 10) / 2);

  if (characterClass === "warrior") {
    return {
      hp: 10 + conModifier,
      mp: 2,
    };
  } else if (characterClass === "mage") {
    const intModifier = Math.floor((stats.int - 10) / 2);
    return {
      hp: 6 + conModifier,
      mp: 8 + Math.max(0, 2 * intModifier),
    };
  } else {
    // Rogue
    const dexModifier = Math.floor((stats.dex - 10) / 2);
    return {
      hp: 8 + conModifier,
      mp: 4 + Math.max(0, dexModifier),
    };
  }
}
