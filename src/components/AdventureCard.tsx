import type { Id } from "../../convex/_generated/dataModel";

interface Adventure {
  _id: Id<"adventures">;
  title: string;
  characterClass: "warrior" | "mage";
  status: "active" | "completed" | "paused";
  turnCount: number;
  lastPlayedAt: number;
  createdAt: number;
  summary?: string;
  worldDescription: string;
}

interface AdventureCardProps {
  adventure: Adventure;
  onContinueAdventure: (adventureId: Id<"adventures">) => void;
  onDeleteAdventure: (adventureId: Id<"adventures">) => Promise<void>;
}

export function AdventureCard({ adventure, onContinueAdventure, onDeleteAdventure }: AdventureCardProps) {
  const formatLastPlayed = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900";
      case "paused":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900";
      case "completed":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900";
    }
  };

  const getClassIcon = (characterClass: string) => {
    return characterClass === "warrior" ? "⚔️" : "🔮";
  };

  return (
    <div className="bg-gradient-to-b from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg border-2 border-amber-200 dark:border-amber-700 p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-1">{adventure.title}</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1">
              {getClassIcon(adventure.characterClass)}
              <span className="capitalize font-medium">{adventure.characterClass}</span>
            </span>
            <span className="text-amber-600 dark:text-amber-400">•</span>
            <span className="text-amber-600 dark:text-amber-400">Turn {adventure.turnCount}</span>
          </div>
        </div>

        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(adventure.status)}`}>
          {adventure.status.charAt(0).toUpperCase() + adventure.status.slice(1)}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
          {adventure.summary || adventure.worldDescription}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="bg-white dark:bg-slate-700 p-2 rounded">
          <div className="text-slate-500 dark:text-slate-400">Created</div>
          <div className="font-semibold">{new Date(adventure.createdAt).toLocaleDateString()}</div>
        </div>
        <div className="bg-white dark:bg-slate-700 p-2 rounded">
          <div className="text-slate-500 dark:text-slate-400">Last Played</div>
          <div className="font-semibold">{formatLastPlayed(adventure.lastPlayedAt)}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onContinueAdventure(adventure._id)}
          className={`flex-1 font-semibold py-2 px-3 rounded-lg text-sm transition-all ${
            adventure.status === "active"
              ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white"
              : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
          }`}
        >
          {adventure.status === "active" ? "Continue" : "Resume"}
        </button>

        <button
          type="button"
          onClick={() => onDeleteAdventure(adventure._id)}
          className="px-3 py-2 rounded-lg bg-red-200 dark:bg-red-700 hover:bg-red-300 dark:hover:bg-red-600 text-red-700 dark:text-red-300 transition-colors"
          title="Delete adventure"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}