import { InventoryPanel } from "./InventoryPanel";
import { GlossaryPanel } from "./GlossaryPanel";

interface Adventure {
  characterClass: "warrior" | "mage";
  currentStats: {
    hp: number;
    mp: number;
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
}

interface InventoryItem {
  itemName: string;
  quantity: number;
  description?: string;
  reason?: string;
}

interface GlossaryTerm {
  term: string;
  definition: string;
}

interface CharacterStatsProps {
  adventure?: Adventure;
  inventory: InventoryItem[];
  glossary: GlossaryTerm[];
  onReturnToDashboard: () => void;
  onSignOut: () => void;
  isLoading?: boolean;
}

export function CharacterStats({
  adventure,
  inventory,
  glossary,
  onReturnToDashboard,
  onSignOut,
  isLoading
}: CharacterStatsProps) {
  if (isLoading || !adventure) {
    return (
      <div className="w-80 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 border-r-2 border-amber-300 dark:border-amber-700 p-4">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-amber-800 dark:text-amber-200 text-sm">Loading adventure...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 border-r-2 border-amber-300 dark:border-amber-700 p-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-amber-800 dark:text-amber-200">⚔️ Character</h2>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onReturnToDashboard}
              className="text-xs px-2 py-1 rounded bg-blue-200 dark:bg-blue-700 hover:bg-blue-300 dark:hover:bg-blue-600 text-blue-700 dark:text-blue-200 transition-colors"
              title="Return to Adventures"
            >
              📋
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="text-xs px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
              title="Sign Out"
            >
              🚪
            </button>
          </div>
        </div>

        <div
          className={`p-3 rounded-lg border-2 ${
            adventure.characterClass === "warrior"
              ? "bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 border-red-300 dark:border-red-600"
              : "bg-gradient-to-r from-purple-100 to-blue-200 dark:from-purple-900 dark:to-blue-800 border-purple-300 dark:border-purple-600"
          }`}
        >
          <h3
            className={`font-semibold capitalize ${
              adventure.characterClass === "warrior"
                ? "text-red-800 dark:text-red-200"
                : "text-purple-800 dark:text-purple-200"
            }`}
          >
            {adventure.characterClass === "warrior" ? "⚔️" : "🔮"} {adventure.characterClass}
          </h3>
          <p
            className={`text-xs ${
              adventure.characterClass === "warrior"
                ? "text-red-600 dark:text-red-300"
                : "text-purple-600 dark:text-purple-300"
            }`}
          >
            Level 1
          </p>
        </div>

        <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 p-3 rounded-lg border border-slate-300 dark:border-slate-600">
          <h4 className="font-semibold mb-2">Stats</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>HP:</span>
              <span className="font-mono">{adventure.currentStats.hp}</span>
            </div>
            <div className="flex justify-between">
              <span>MP:</span>
              <span className="font-mono">{adventure.currentStats.mp}</span>
            </div>
            <div className="flex justify-between">
              <span>STR:</span>
              <span className="font-mono">{adventure.currentStats.str}</span>
            </div>
            <div className="flex justify-between">
              <span>DEX:</span>
              <span className="font-mono">{adventure.currentStats.dex}</span>
            </div>
            <div className="flex justify-between">
              <span>CON:</span>
              <span className="font-mono">{adventure.currentStats.con}</span>
            </div>
            <div className="flex justify-between">
              <span>INT:</span>
              <span className="font-mono">{adventure.currentStats.int}</span>
            </div>
            <div className="flex justify-between">
              <span>WIS:</span>
              <span className="font-mono">{adventure.currentStats.wis}</span>
            </div>
            <div className="flex justify-between">
              <span>CHA:</span>
              <span className="font-mono">{adventure.currentStats.cha}</span>
            </div>
          </div>
        </div>

        <InventoryPanel inventory={inventory} />
        <GlossaryPanel glossary={glossary} />
      </div>
    </div>
  );
}