import { forwardRef } from "react";
import type { Id } from "../../convex/_generated/dataModel";

interface AdventureAction {
  _id: Id<"adventureActions">;
  type: "world" | "action" | "result" | "roll" | "event";
  content: string;
  timestamp: number;
  turnNumber: number;
}

interface AdventureLogProps {
  actions?: AdventureAction[];
  isProcessingAction: boolean;
  isLoading?: boolean;
  hasBackground?: boolean;
}

export const AdventureLog = forwardRef<HTMLDivElement, AdventureLogProps>(
  ({ actions, isProcessingAction, isLoading, hasBackground = false }, ref) => {
    if (isLoading || !actions) {
      return (
        <div
          ref={ref}
          className={`flex-1 p-4 overflow-y-auto ${hasBackground ? "" : "bg-gradient-to-b from-gray-900 to-slate-800"}`}>
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
      <div
        ref={ref}
        className={`flex-1 p-4 overflow-y-auto ${hasBackground ? "" : "bg-gradient-to-b from-gray-900 to-slate-800"}`}>
        <div className="max-w-4xl mx-auto space-y-4">
          {actions.map((entry) => (
            <div
              key={entry._id}
              className={`p-4 rounded-xl border shadow-lg backdrop-blur-sm ${
                entry.type === "world"
                  ? "bg-gradient-to-r from-amber-900/70 to-orange-900/70 border-amber-700/80"
                  : entry.type === "action"
                    ? "bg-gradient-to-r from-blue-900/70 to-cyan-900/70 border-blue-700/80"
                    : entry.type === "roll"
                      ? "bg-gradient-to-r from-purple-900/70 to-indigo-900/70 border-purple-700/80"
                      : entry.type === "event"
                        ? "bg-gradient-to-r from-yellow-900/70 to-amber-900/70 border-yellow-700/80"
                        : "bg-gradient-to-r from-emerald-900/70 to-teal-900/70 border-emerald-700/80"
              }`}>
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    entry.type === "world"
                      ? "text-amber-300"
                      : entry.type === "action"
                        ? "text-blue-300"
                        : entry.type === "roll"
                          ? "text-purple-300"
                          : entry.type === "event"
                            ? "text-yellow-300"
                            : "text-emerald-300"
                  }`}>
                  {entry.type === "world"
                    ? "🌍 World Description"
                    : entry.type === "action"
                      ? "⚡ Your Action"
                      : entry.type === "roll"
                        ? "🎲 Stat Roll"
                        : entry.type === "event"
                          ? "🌟 World Event"
                          : "🎲 Result"}
                </span>
                <span className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-sm text-gray-200">{entry.type === "event" ? `🌟 ${entry.content}` : entry.content}</p>
            </div>
          ))}
          {isProcessingAction && (
            <div className="p-4 rounded-xl border shadow-lg backdrop-blur-sm bg-gradient-to-r from-emerald-900/70 to-teal-900/70 border-emerald-700/80">
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
