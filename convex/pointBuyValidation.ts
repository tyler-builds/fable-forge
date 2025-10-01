// Server-side point buy validation to prevent cheating

const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

const MIN_STAT = 8;
const MAX_STAT = 15;
const TOTAL_POINTS = 27;

interface Stats {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

/**
 * Validate that stats conform to point buy rules (server-side)
 * Throws an error if invalid
 */
export function validatePointBuyStats(stats: Stats): void {
  const statNames = ["str", "dex", "con", "int", "wis", "cha"] as const;

  // Check all stats are within range and valid
  for (const statName of statNames) {
    const value = stats[statName];

    if (!Number.isInteger(value)) {
      throw new Error(`${statName.toUpperCase()} must be an integer`);
    }

    if (value < MIN_STAT || value > MAX_STAT) {
      throw new Error(
        `${statName.toUpperCase()} must be between ${MIN_STAT} and ${MAX_STAT} (got ${value})`
      );
    }

    // Check stat value is a valid point buy value
    if (!(value in POINT_BUY_COSTS)) {
      throw new Error(`${statName.toUpperCase()} has invalid value ${value}`);
    }
  }

  // Calculate total points spent
  const pointsSpent = statNames.reduce((total, statName) => {
    return total + (POINT_BUY_COSTS[stats[statName]] ?? 0);
  }, 0);

  if (pointsSpent !== TOTAL_POINTS) {
    throw new Error(
      `Stats must cost exactly ${TOTAL_POINTS} points (got ${pointsSpent} points)`
    );
  }
}

/**
 * Validate HP/MP calculations match expected values for class
 * HP Formula: base + (CON - 10) ÷ 2
 * MP Formula (cannot go below base):
 * - Warrior: 2
 * - Rogue: 4 + max(0, (DEX - 10) ÷ 2)
 * - Mage: 8 + max(0, 2 × (INT - 10) ÷ 2)
 */
export function validateDerivedStats(
  characterClass: "warrior" | "mage" | "rogue",
  stats: { hp: number; mp: number; con: number; int: number; dex: number }
): void {
  const conModifier = Math.floor((stats.con - 10) / 2);
  let expectedHP: number;
  let expectedMP: number;

  if (characterClass === "warrior") {
    expectedHP = 10 + conModifier;
    expectedMP = 2;
  } else if (characterClass === "mage") {
    const intModifier = Math.floor((stats.int - 10) / 2);
    expectedHP = 6 + conModifier;
    expectedMP = 8 + Math.max(0, 2 * intModifier);
  } else {
    const dexModifier = Math.floor((stats.dex - 10) / 2);
    expectedHP = 8 + conModifier;
    expectedMP = 4 + Math.max(0, dexModifier);
  }

  if (stats.hp !== expectedHP) {
    throw new Error(
      `HP mismatch for ${characterClass}: expected ${expectedHP}, got ${stats.hp}`
    );
  }

  if (stats.mp !== expectedMP) {
    throw new Error(
      `MP mismatch for ${characterClass}: expected ${expectedMP}, got ${stats.mp}`
    );
  }
}
