import { useAction, useQuery } from "convex/react";
import { Swords } from "lucide-react";
import { useState } from "react";
import { getClassColor, getClassIcon, statNames } from "@/utils/helpers";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  calculateDerivedStats,
  calculateRemainingPoints,
  canDecreaseStat,
  canIncreaseStat,
  getCostToIncrease,
  MAX_STAT,
  POINT_BUY_COSTS,
  type Stats,
  TOTAL_POINTS
} from "../utils/pointBuy";

interface CharacterCreationProps {
  onReturnToDashboard: () => void;
  onAdventureCreated: (adventureId: Id<"adventures">) => void;
}

export function CharacterCreation({ onReturnToDashboard, onAdventureCreated }: CharacterCreationProps) {
  const [selectedClass, setSelectedClass] = useState<"warrior" | "mage" | "rogue">("warrior");
  const [isCreatingWorld, setIsCreatingWorld] = useState(false);

  // Point buy stats - all start at 8
  const [stats, setStats] = useState<Stats>({
    str: 8,
    dex: 8,
    con: 8,
    int: 8,
    wis: 8,
    cha: 8
  });

  const currentUser = useQuery(api.auth.getCurrentUser);
  const createAdventure = useAction(api.adventures.createAdventure);
  const randomPortrait = useQuery(api.characterPortraits.getRandomPortrait, {
    characterClass: selectedClass
  });

  const remainingPoints = calculateRemainingPoints(stats);
  const derivedStats = calculateDerivedStats(selectedClass, stats);

  const increaseStat = (statName: keyof Stats) => {
    if (!canIncreaseStat(stats, statName)) return;
    setStats((prev) => ({ ...prev, [statName]: prev[statName] + 1 }));
  };

  const decreaseStat = (statName: keyof Stats) => {
    if (!canDecreaseStat(stats, statName)) return;
    setStats((prev) => ({ ...prev, [statName]: prev[statName] - 1 }));
  };

  const handleCreateAdventure = async () => {
    if (remainingPoints !== 0) {
      alert(`You must spend all ${TOTAL_POINTS} points! (${remainingPoints} remaining)`);
      return;
    }

    setIsCreatingWorld(true);
    try {
      const adventureId = await createAdventure({
        playerClass: selectedClass,
        stats: {
          ...stats,
          hp: derivedStats.hp,
          mp: derivedStats.mp
        },
        characterPortraitId: randomPortrait?._id
      });

      onAdventureCreated(adventureId);
    } catch (error) {
      console.error("Failed to create adventure:", error);
      alert("Failed to create adventure. Please try again.");
    } finally {
      setIsCreatingWorld(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
      <div className="h-full max-h-screen overflow-y-auto">
        <div className="bg-gradient-to-b from-gray-800 to-slate-900 p-8 rounded-xl shadow-2xl max-w-5xl w-full border border-gray-600 mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
              <Swords size={28} /> Fable Forge <Swords size={28} />
            </h1>
            <p className="text-sm text-blue-300">Welcome, {currentUser?.email?.split("@")[0] || "Adventurer"}!</p>
          </div>

          <div className="flex gap-6">
            {/* Left Panel - Character Creation */}
            <div className="flex-1 flex flex-col gap-4">
              <h2 className="text-xl font-bold">Character Creation</h2>

              {/* Character Portrait Preview */}
              {randomPortrait?.imageUrl && (
                <div className="flex justify-center">
                  <div
                    className={`rounded-full overflow-hidden w-32 h-32 border-4 ${
                      selectedClass === "warrior"
                        ? "border-red-500"
                        : selectedClass === "mage"
                          ? "border-purple-500"
                          : "border-green-500"
                    }`}>
                    <img
                      src={randomPortrait.imageUrl}
                      alt={`${selectedClass} portrait`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Class Selection */}
              <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold text-blue-300">Choose your class:</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`flex-1 px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                      selectedClass === "warrior"
                        ? `bg-gradient-to-r from-red-600 to-red-700 text-white ${getClassColor("warrior")} shadow-lg`
                        : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    }`}
                    onClick={() => setSelectedClass("warrior")}>
                    {getClassIcon("warrior")} Warrior
                  </button>
                  <button
                    type="button"
                    className={`flex-1 px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                      selectedClass === "mage"
                        ? `bg-gradient-to-r from-purple-600 to-blue-600 text-white ${getClassColor("mage")} shadow-lg`
                        : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    }`}
                    onClick={() => setSelectedClass("mage")}>
                    {getClassIcon("mage")} Mage
                  </button>
                  <button
                    type="button"
                    className={`flex-1 px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                      selectedClass === "rogue"
                        ? `bg-gradient-to-r from-green-600 to-emerald-600 text-white ${getClassColor("rogue")} shadow-lg`
                        : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    }`}
                    onClick={() => setSelectedClass("rogue")}>
                    {getClassIcon("rogue")} Rogue
                  </button>
                </div>
              </div>

              {/* Point Buy Stats */}
              <div className="bg-gradient-to-r from-gray-800 to-slate-800 p-4 rounded-lg border border-gray-600">
                {/* Derived Stats - Compact Bars */}
                <div className="space-y-2 pb-4">
                  {/* HP Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                      <span>HP</span>
                      <span className="font-bold text-red-400">{derivedStats.hp}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-600 to-red-500 h-2 rounded-full"
                        style={{ width: "100%" }}></div>
                    </div>
                  </div>
                  {/* MP Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                      <span>MP</span>
                      <span className="font-bold text-blue-400">{derivedStats.mp}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full"
                        style={{ width: "100%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {statNames.map(({ key, label, description }) => {
                    const canIncrease = canIncreaseStat(stats, key);
                    const canDecrease = canDecreaseStat(stats, key);
                    const costToIncrease = getCostToIncrease(stats[key]);
                    const modifier = Math.floor((stats[key] - 10) / 2);
                    const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;

                    return (
                      <div key={key} className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-200">{label}</div>
                          <div className="text-xs text-gray-400">{description}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="w-8 h-8 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded disabled:cursor-not-allowed transition-all"
                            onClick={() => decreaseStat(key)}
                            disabled={!canDecrease}>
                            -
                          </button>
                          <div className="w-16 text-center">
                            <div className="text-xl font-bold text-white">{stats[key]}</div>
                            <div className="text-xs text-gray-400">{modifierText}</div>
                          </div>
                          <button
                            type="button"
                            className="w-8 h-8 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded disabled:cursor-not-allowed transition-all"
                            onClick={() => increaseStat(key)}
                            disabled={!canIncrease}
                            title={
                              canIncrease && costToIncrease
                                ? `Cost: ${costToIncrease} point${costToIncrease > 1 ? "s" : ""}`
                                : undefined
                            }>
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold text-sm px-4 py-3 rounded-lg border border-gray-600 transition-all"
                  onClick={onReturnToDashboard}
                  disabled={isCreatingWorld}>
                  ← Back
                </button>

                <button
                  type="button"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm px-6 py-3 rounded-lg border border-blue-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isCreatingWorld || remainingPoints !== 0}
                  onClick={handleCreateAdventure}>
                  {isCreatingWorld ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Forging Your Tale...
                    </div>
                  ) : (
                    "Begin Adventure"
                  )}
                </button>
              </div>
            </div>

            {/* Right Panel - Point Buy Reference */}
            <div className="w-72 flex flex-col gap-4">
              {/* Points Remaining - Smaller, at top */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg border border-blue-500 text-center">
                <p className="text-xs font-semibold text-blue-100">Points Remaining</p>
                <p className="text-2xl font-bold text-white">{remainingPoints}</p>
                <p className="text-xs text-blue-100">of {TOTAL_POINTS} total</p>
              </div>

              <div className="bg-gradient-to-r from-gray-800 to-slate-800 p-4 rounded-lg border border-gray-600">
                <p className="text-sm font-semibold mb-3 text-blue-300">Cost Table:</p>
                <div className="space-y-1">
                  {Object.entries(POINT_BUY_COSTS).map(([value, cost]) => (
                    <div key={value} className="flex justify-between text-sm text-gray-200">
                      <span>Score {value}:</span>
                      <span className="font-semibold">{cost} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-800 to-slate-800 p-4 rounded-lg border border-gray-600">
                <p className="text-sm font-semibold mb-2 text-blue-300">How It Works:</p>
                <ul className="text-xs text-gray-300 space-y-2">
                  <li>• All abilities start at 8</li>
                  <li>• You have {TOTAL_POINTS} points to spend</li>
                  <li>• Maximum ability score is {MAX_STAT}</li>
                  <li>• Higher scores cost more points</li>
                  <li>• Must spend all points to start</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-gray-800 to-slate-800 p-4 rounded-lg border border-gray-600">
                <p className="text-sm font-semibold mb-2 text-blue-300">Class Formulas:</p>
                <div className="text-xs text-gray-300 flex flex-wrap gap-4">
                  <div className="border-l-2 border-red-500 pl-2">
                    <p className="font-semibold text-red-400">{getClassIcon("warrior")} Warrior</p>
                    <p>HP: 10 + CON mod</p>
                    <p>MP: 2</p>
                  </div>
                  <div className="border-l-2 border-green-500 pl-2">
                    <p className="font-semibold text-green-400">{getClassIcon("rogue")} Rogue</p>
                    <p>HP: 8 + CON mod</p>
                    <p>MP: 4 + DEX mod</p>
                  </div>
                  <div className="border-l-2 border-purple-500 pl-2">
                    <p className="font-semibold text-purple-400">{getClassIcon("mage")} Mage</p>
                    <p>HP: 6 + CON mod</p>
                    <p>MP: 8 + (INT mod x 2)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
