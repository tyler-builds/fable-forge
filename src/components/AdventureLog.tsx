import { forwardRef } from "react";
import type { Id } from "../../convex/_generated/dataModel";

interface AdventureAction {
  _id: Id<"adventureActions">;
  type: "world" | "action" | "result" | "roll";
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
        <div ref={ref} className="flex-1 bg-gradient-to-b from-gray-900 to-slate-800 p-4 overflow-y-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-300">Loading adventure log...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className="flex-1 bg-gradient-to-b from-gray-900 to-slate-800 p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          {actions.map((entry) => (
            <div
              key={entry._id}
              className={`p-4 rounded-xl border shadow-lg ${
                entry.type === "world"
                  ? "bg-gradient-to-r from-amber-900 to-orange-900 border-amber-700"
                  : entry.type === "action"
                    ? "bg-gradient-to-r from-blue-900 to-cyan-900 border-blue-700"
                    : entry.content.startsWith("🎲 Rolling")
                      ? "bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-700"
                      : entry.content.startsWith("🌟")
                        ? "bg-gradient-to-r from-yellow-900 to-amber-900 border-yellow-700"
                        : "bg-gradient-to-r from-emerald-900 to-teal-900 border-emerald-700"
              }`}>
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    entry.type === "world"
                      ? "text-amber-300"
                      : entry.type === "action"
                        ? "text-blue-300"
                        : entry.content.startsWith("🎲 Rolling")
                          ? "text-purple-300"
                          : entry.content.startsWith("🌟")
                            ? "text-yellow-300"
                            : "text-emerald-300"
                  }`}>
                  {entry.type === "world"
                    ? "🌍 World Description"
                    : entry.type === "action"
                      ? "⚡ Your Action"
                      : entry.content.startsWith("🎲 Rolling")
                        ? "🎲 Stat Roll"
                        : entry.content.startsWith("🌟")
                          ? "🌟 World Event"
                          : "🎲 Result"}
                </span>
                <span className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-sm text-gray-200">{entry.content}</p>
            </div>
          ))}
          {isProcessingAction && (
            <div className="p-4 rounded-xl border shadow-lg bg-gradient-to-r from-emerald-900 to-teal-900 border-emerald-700">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">🎲 Result</span>
                <span className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-200">🔮 Processing your action...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);
