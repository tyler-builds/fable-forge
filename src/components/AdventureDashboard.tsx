import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { AdventureCard } from "./AdventureCard";

interface AdventureDashboardProps {
  onStartNewAdventure: () => void;
  onContinueAdventure: (adventureId: Id<"adventures">) => void;
  onDeleteAdventure: (adventureId: Id<"adventures">) => Promise<void>;
}

export function AdventureDashboard({
  onStartNewAdventure,
  onContinueAdventure,
  onDeleteAdventure
}: AdventureDashboardProps) {
  const adventures = useQuery(api.adventures.getUserAdventures);
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "completed">("all");

  if (adventures === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        <div className="bg-gradient-to-b from-gray-800 to-slate-900 p-8 rounded-xl shadow-2xl border border-gray-600">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-300 font-medium">Loading your adventures...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredAdventures = adventures.filter((adventure) => {
    if (filter === "all") return true;
    return adventure.status === filter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            ⚔️ Adventure Hall ⚔️
          </h1>
          <p className="text-blue-300">Continue your quests or forge new legends</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
          <div className="flex gap-2">
            {(["all", "active", "paused", "completed"] as const).map((status) => (
              <button
                type="button"
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  filter === status ? "bg-blue-600 text-white shadow-lg" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}>
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== "all" && (
                  <span className="ml-1 text-xs">({adventures.filter((a) => a.status === status).length})</span>
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onStartNewAdventure}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-6 py-3 rounded-lg border border-blue-500 shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]">
            ✨ New Adventure
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdventures.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-gradient-to-b from-gray-800 to-slate-900 p-8 rounded-xl shadow-lg border border-gray-600">
                <p className="text-gray-400 font-semibold mb-2">
                  {filter === "all" ? "No adventures yet!" : `No ${filter} adventures`}
                </p>
                <p className="text-gray-500 text-sm">
                  {filter === "all" ? "Start your first epic journey!" : `Switch filters or start a new adventure`}
                </p>
              </div>
            </div>
          ) : (
            filteredAdventures.map((adventure) => (
              <AdventureCard
                key={adventure._id}
                adventure={adventure}
                onContinueAdventure={onContinueAdventure}
                onDeleteAdventure={onDeleteAdventure}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
