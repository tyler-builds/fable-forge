interface ActionInputProps {
  playerInput: string;
  isProcessingAction: boolean;
  onInputChange: (value: string) => void;
  onTakeTurn: () => void;
  activeEvent?: string | null;
  eventOptions?: string[] | null;
  onEventChoice?: (choice: string) => void;
}

export function ActionInput({
  playerInput,
  isProcessingAction,
  onInputChange,
  onTakeTurn,
  activeEvent,
  eventOptions,
  onEventChoice
}: ActionInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isProcessingAction && playerInput.trim() && !activeEvent) {
      onTakeTurn();
    }
  };

  const handleEventChoice = (choice: string) => {
    if (onEventChoice) {
      onEventChoice(choice);
    }
  };

  // Show event choices if there's an active event
  if (activeEvent && eventOptions && eventOptions.length > 0) {
    return (
      <div className="bg-gradient-to-r from-yellow-100 to-amber-200 dark:from-yellow-900 dark:to-amber-900 border-t-2 border-yellow-400 dark:border-yellow-600 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-800 rounded-lg border border-yellow-300 dark:border-yellow-600">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">🌟 Event:</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">{activeEvent}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-3">Choose your response:</p>
            <div className="grid grid-cols-1 gap-2">
              {eventOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  className="text-left px-4 py-3 bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-amber-600 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-700 hover:border-amber-400 dark:hover:border-amber-500 text-slate-800 dark:text-slate-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleEventChoice(option)}
                  disabled={isProcessingAction}
                >
                  <span className="font-medium text-amber-700 dark:text-amber-300">
                    {index + 1}.
                  </span>{" "}
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-200 to-amber-200 dark:from-slate-800 dark:to-slate-900 border-t-2 border-amber-300 dark:border-amber-700 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-3 border-2 border-amber-300 dark:border-amber-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-500 shadow-inner focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            placeholder="What do you want to do? (e.g., 'explore the forest', 'talk to the merchant', 'cast a spell')"
            value={playerInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isProcessingAction}
          />
          <button
            type="button"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-6 py-3 rounded-lg border-2 border-emerald-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            disabled={!playerInput.trim() || isProcessingAction}
            onClick={onTakeTurn}
          >
            {isProcessingAction ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              "⚡ Act"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}