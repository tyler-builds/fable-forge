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
      <div className="w-80 bg-gradient-to-b from-gray-800 to-slate-900 border-r border-gray-600 p-4">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-300 text-sm">Loading adventure...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gradient-to-b from-gray-800 to-slate-900 border-r border-gray-600 p-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-blue-300">⚔️ Character</h2>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onReturnToDashboard}
              className="text-xs px-2 py-1 rounded bg-blue-700 hover:bg-blue-600 text-blue-200 transition-colors"
              title="Return to Adventures"
            >
              📋
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
              title="Sign Out"
            >
              🚪
            </button>
          </div>
        </div>

        <div
          className={`p-3 rounded-lg border ${
            adventure.characterClass === "warrior"
              ? "bg-gradient-to-r from-red-900 to-red-800 border-red-700"
              : "bg-gradient-to-r from-purple-900 to-blue-900 border-purple-700"
          }`}
        >
          <h3
            className={`font-semibold capitalize ${
              adventure.characterClass === "warrior"
                ? "text-red-200"
                : "text-purple-200"
            }`}
          >
            {adventure.characterClass === "warrior" ? "⚔️" : "🔮"} {adventure.characterClass}
          </h3>
          <p
            className={`text-xs ${
              adventure.characterClass === "warrior"
                ? "text-red-300"
                : "text-purple-300"
            }`}
          >
            Level 1
          </p>
        </div>

        <div className="bg-gradient-to-r from-gray-800 to-slate-800 p-3 rounded-lg border border-gray-600">
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