import { forwardRef } from "react";
import type { Id } from "../../convex/_generated/dataModel";

interface AdventureAction {
  _id: Id<"adventureActions">;
  type: "world" | "action" | "result";
  content: string;
  timestamp: number;
  turnNumber: number;
}

interface AdventureLogProps {
  actions?: AdventureAction[];
  isProcessingAction: boolean;
  isLoading?: boolean;
}

export const AdventureLog = forwardRef<HTMLDivElement, AdventureLogProps>(
  ({ actions, isProcessingAction, isLoading }, ref) => {
    if (isLoading || !actions) {
      return (
        <div
          ref={ref}
          className="flex-1 bg-gradient-to-b from-slate-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 p-4 overflow-y-auto"
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-amber-800 dark:text-amber-200">Loading adventure log...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className="flex-1 bg-gradient-to-b from-slate-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 p-4 overflow-y-auto"
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {actions.map((entry) => (
            <div
              key={entry._id}
              className={`p-4 rounded-xl border-2 shadow-lg ${
                entry.type === "world"
                  ? "bg-gradient-to-r from-amber-50 to-orange-100 dark:from-amber-900 dark:to-orange-900 border-amber-300 dark:border-amber-600"
                  : entry.type === "action"
                  ? "bg-gradient-to-r from-blue-50 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 border-blue-300 dark:border-blue-600"
                  : entry.content.startsWith('🎲 Rolling')
                  ? "bg-gradient-to-r from-purple-50 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 border-purple-300 dark:border-purple-600"
                  : entry.content.startsWith('🌟')
                  ? "bg-gradient-to-r from-yellow-50 to-amber-100 dark:from-yellow-900 dark:to-amber-900 border-yellow-300 dark:border-yellow-600"
                  : "bg-gradient-to-r from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-900 border-emerald-300 dark:border-emerald-600"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    entry.type === "world"
                      ? "text-amber-700 dark:text-amber-300"
                      : entry.type === "action"
                      ? "text-blue-700 dark:text-blue-300"
                      : entry.content.startsWith('🎲 Rolling')
                      ? "text-purple-700 dark:text-purple-300"
                      : entry.content.startsWith('🌟')
                      ? "text-yellow-700 dark:text-yellow-300"
                      : "text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  {entry.type === "world"
                    ? "🌍 World Description"
                    : entry.type === "action"
                    ? "⚡ Your Action"
                    : entry.content.startsWith('🎲 Rolling')
                    ? "🎲 Stat Roll"
                    : entry.content.startsWith('🌟')
                    ? "🌟 World Event"
                    : "🎲 Result"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm">{entry.content}</p>
            </div>
          ))}
          {isProcessingAction && (
            <div className="p-4 rounded-xl border-2 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-900 border-emerald-300 dark:border-emerald-600">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  🎲 Result
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm">🔮 The mystical forces are weaving your fate...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);