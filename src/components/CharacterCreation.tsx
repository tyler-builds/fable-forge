import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface CharacterCreationProps {
  onReturnToDashboard: () => void;
  onAdventureCreated: (adventureId: Id<"adventures">) => void;
}

export function CharacterCreation({ onReturnToDashboard, onAdventureCreated }: CharacterCreationProps) {
  const [selectedClass, setSelectedClass] = useState<"warrior" | "mage">("warrior");
  const [isCreatingWorld, setIsCreatingWorld] = useState(false);

  const currentUser = useQuery(api.auth.getCurrentUser);
  const createWorld = useAction(api.startAdventure.createWorld);
  const generateTitle = useAction(api.adventures.generateAdventureTitle);
  const createAdventure = useMutation(api.adventures.createAdventure);

  const classes = {
    warrior: { hp: 120, mp: 50, str: 15, dex: 12, con: 14, int: 8, wis: 10, cha: 9 },
    mage: { hp: 70, mp: 150, str: 8, dex: 10, con: 9, int: 16, wis: 14, cha: 12 }
  };

  const handleCreateAdventure = async () => {
    setIsCreatingWorld(true);
    try {
      // Generate world description
      const result = await createWorld({
        playerClass: selectedClass,
        stats: classes[selectedClass]
      });

      // Generate adventure title
      const title = await generateTitle({
        characterClass: selectedClass,
        worldDescription: result.startText
      });

      // Create adventure in database
      const adventureId = await createAdventure({
        title,
        characterClass: selectedClass,
        characterStats: classes[selectedClass],
        worldDescription: result.startText
      });

      // Notify parent component
      onAdventureCreated(adventureId);
    } catch (error) {
      console.error("Failed to create adventure:", error);
    } finally {
      setIsCreatingWorld(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-gradient-to-b from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 p-8 rounded-xl shadow-2xl max-w-lg w-full border-2 border-amber-200 dark:border-amber-800">
        <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          ⚔️ Fable Forge ⚔️
        </h1>
        <p className="text-center mb-6 text-amber-800 dark:text-amber-200">
          Welcome, {currentUser?.email?.split("@")[0] || "Adventurer"}!
        </p>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Character Creation</h2>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-amber-800 dark:text-amber-200">Choose your class:</label>
            <div className="flex gap-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                  selectedClass === "warrior"
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500 shadow-lg"
                    : "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-300 dark:hover:bg-slate-600"
                }`}
                onClick={() => setSelectedClass("warrior")}
              >
                ⚔️ Warrior
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                  selectedClass === "mage"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500 shadow-lg"
                    : "bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-300 dark:hover:bg-slate-600"
                }`}
                onClick={() => setSelectedClass("mage")}
              >
                🔮 Mage
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-slate-700 dark:to-slate-800 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
            <p className="text-sm font-semibold mb-2">Stats:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>HP: {classes[selectedClass].hp}</div>
              <div>MP: {classes[selectedClass].mp}</div>
              <div>STR: {classes[selectedClass].str}</div>
              <div>DEX: {classes[selectedClass].dex}</div>
              <div>CON: {classes[selectedClass].con}</div>
              <div>INT: {classes[selectedClass].int}</div>
              <div>WIS: {classes[selectedClass].wis}</div>
              <div>CHA: {classes[selectedClass].cha}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-sm px-4 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 transition-all"
              onClick={onReturnToDashboard}
              disabled={isCreatingWorld}
            >
              ← Back
            </button>

            <button
              type="button"
              className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-sm px-6 py-3 rounded-lg border-2 border-amber-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCreatingWorld}
              onClick={handleCreateAdventure}
            >
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
      </div>
    </div>
  );
}