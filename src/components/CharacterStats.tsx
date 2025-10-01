import { useState } from "react";
import { getClassColor, getClassIcon } from "@/utils/helpers";
import { GlossaryPanel } from "./GlossaryPanel";
import { InventoryPanel } from "./InventoryPanel";

interface Adventure {
  characterClass: "warrior" | "mage";
  characterStats: {
    hp: number;
    mp: number;
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
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
  characterPortraitUrl?: string;
  onReturnToDashboard: () => void;
  onSignOut: () => void;
  isLoading?: boolean;
}

export function CharacterStats({
  adventure,
  inventory,
  glossary,
  characterPortraitUrl,
  onReturnToDashboard,
  onSignOut,
  isLoading
}: CharacterStatsProps) {
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

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
              onClick={() => setIsGlossaryOpen(true)}
              className="text-xs px-2 py-1 rounded bg-purple-700 hover:bg-purple-600 text-purple-200 transition-colors"
              title="Glossary">
              📖
            </button>
            <button
              type="button"
              onClick={onReturnToDashboard}
              className="text-xs px-2 py-1 rounded bg-blue-700 hover:bg-blue-600 text-blue-200 transition-colors"
              title="Return to Adventures">
              📋
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
              title="Sign Out">
              🚪
            </button>
          </div>
        </div>

        {/* Character Portrait */}
        {characterPortraitUrl && (
          <div className="flex justify-center">
            <div
              className={`rounded-full overflow-hidden w-32 h-32 border-4 ${getClassColor(adventure.characterClass)}`}>
              <img
                src={characterPortraitUrl}
                alt={`${adventure.characterClass} portrait`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div
          className={`p-3 rounded-lg border ${
            adventure.characterClass === "warrior"
              ? "bg-gradient-to-r from-red-900 to-red-800 border-red-700"
              : adventure.characterClass === "mage"
                ? "bg-gradient-to-r from-purple-900 to-blue-900 border-purple-700"
                : "bg-gradient-to-r from-green-900 to-emerald-800 border-green-700"
          }`}>
          <h3
            className={`font-semibold capitalize ${
              adventure.characterClass === "warrior" ? "text-red-200" : "text-purple-200"
            }`}>
            {getClassIcon(adventure.characterClass)} {adventure.characterClass}
          </h3>
          <p className={`text-xs ${adventure.characterClass === "warrior" ? "text-red-300" : "text-purple-300"}`}>
            Level 1
          </p>
        </div>

        <div className="bg-gradient-to-r from-gray-800 to-slate-800 p-3 rounded-lg border border-gray-600">
          <h4 className="font-semibold mb-2">Stats</h4>

          {/* HP Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>HP</span>
              <span className="font-mono">
                {adventure.currentStats.hp} / {adventure.characterStats.hp}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-red-600 to-red-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(adventure.currentStats.hp / adventure.characterStats.hp) * 100}%` }}></div>
            </div>
          </div>

          {/* MP Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>MP</span>
              <span className="font-mono">
                {adventure.currentStats.mp} / {adventure.characterStats.mp}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-blue-600 to-blue-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(adventure.currentStats.mp / adventure.characterStats.mp) * 100}%` }}></div>
            </div>
          </div>

          {/* Other Stats */}
          <div className="grid grid-cols-2 gap-2 text-sm">
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
      </div>

      {isGlossaryOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsGlossaryOpen(false)}>
          <div
            className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-purple-300">📖 Glossary</h3>
              <button
                type="button"
                onClick={() => setIsGlossaryOpen(false)}
                className="text-gray-400 hover:text-gray-200 text-2xl">
                x
              </button>
            </div>
            <GlossaryPanel glossary={glossary} />
          </div>
        </div>
      )}
    </div>
  );
}
