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
      <div className="bg-gradient-to-r from-gray-800 to-slate-800 border-t border-gray-600 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 p-3 bg-yellow-900 rounded-lg border border-yellow-700">
            <p className="text-sm font-medium text-yellow-200 mb-2">🌟 Event:</p>
            <p className="text-sm text-yellow-100">{activeEvent}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-yellow-200 mb-3">Choose your response:</p>
            <div className="grid grid-cols-1 gap-2">
              {eventOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  className="text-left px-4 py-3 bg-gray-800 border border-yellow-600 rounded-lg hover:bg-gray-700 hover:border-yellow-500 text-gray-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleEventChoice(option)}
                  disabled={isProcessingAction}
                >
                  <span className="font-medium text-yellow-400">
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
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 shadow-inner focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            placeholder="What do you want to do? (e.g., 'explore the forest', 'talk to the merchant', 'cast a spell')"
            value={playerInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isProcessingAction}
          />
          <button
            type="button"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-lg border border-blue-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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