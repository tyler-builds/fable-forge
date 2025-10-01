// Leveling system with class-specific stat increases

export const xpThreshold = (level: number) => Math.floor(100 * 1.5 ** (level - 1));

interface StatIncrease {
  hp: number;
  mp: number;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

const LEVEL_UP_STAT_INCREASES: Record<"warrior" | "mage" | "rogue", StatIncrease> = {
  warrior: {
    hp: 10,
    mp: 2,
    str: 2,
    dex: 1,
    con: 2,
    int: 0,
    wis: 1,
    cha: 0,
  },
  mage: {
    hp: 5,
    mp: 8,
    str: 0,
    dex: 1,
    con: 1,
    int: 3,
    wis: 2,
    cha: 1,
  },
  rogue: {
    hp: 7,
    mp: 4,
    str: 1,
    dex: 2,
    con: 1,
    int: 1,
    wis: 1,
    cha: 1,
  },
};

export interface LevelUpResult {
  didLevelUp: boolean;
  newLevel: number;
  newXP: number;
  statIncreases?: StatIncrease;
}

/**
 * Check if character should level up and calculate new stats
 */
export function processLevelUp(
  characterClass: "warrior" | "mage" | "rogue",
  currentLevel: number,
  currentXP: number,
  xpGained: number
): LevelUpResult {
  const newXP = currentXP + xpGained;
  const requiredXP = xpThreshold(currentLevel + 1);

  if (newXP >= requiredXP) {
    const newLevel = currentLevel + 1;
    const statIncreases = LEVEL_UP_STAT_INCREASES[characterClass];

    return {
      didLevelUp: true,
      newLevel,
      newXP,
      statIncreases,
    };
  }

  return {
    didLevelUp: false,
    newLevel: currentLevel,
    newXP,
  };
}

/**
 * Apply stat increases to current stats
 */
export function applyStatIncreases(
  currentStats: StatIncrease,
  increases: StatIncrease
): StatIncrease {
  return {
    hp: currentStats.hp + increases.hp,
    mp: currentStats.mp + increases.mp,
    str: currentStats.str + increases.str,
    dex: currentStats.dex + increases.dex,
    con: currentStats.con + increases.con,
    int: currentStats.int + increases.int,
    wis: currentStats.wis + increases.wis,
    cha: currentStats.cha + increases.cha,
  };
}
