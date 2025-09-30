import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { ActionInput } from "./components/ActionInput";
import { AdventureDashboard } from "./components/AdventureDashboard";
import { AdventureLog } from "./components/AdventureLog";
import { AuthGate } from "./components/AuthGate";
import { CharacterCreation } from "./components/CharacterCreation";
import { CharacterStats } from "./components/CharacterStats";
import { authClient } from "./lib/auth-client";
import { useAdventureBackground, useBackgroundStyle, useBackgroundOverlay } from "./hooks/useAdventureBackground";

export default function App() {
  return (
    <AuthGate>
      <Content />
    </AuthGate>
  );
}

type AppView = "dashboard" | "character-creation" | "game";

function Content() {
  const takeTurn = useAction(api.startAdventure.takeTurn);
  const currentUser = useQuery(api.auth.getCurrentUser);
  const { signOut } = authClient;

  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [currentAdventureId, setCurrentAdventureId] = useState<Id<"adventures"> | null>(null);

  // Dynamic background system
  const background = useAdventureBackground(currentAdventureId);
  const backgroundStyle = useBackgroundStyle(background.backgroundUrl);
  const overlayStyle = useBackgroundOverlay(background.hasBackground);

  const deleteAdventure = useMutation(api.adventures.deleteAdventure);
  const getAdventure = useQuery(
    api.adventures.getAdventure,
    currentAdventureId ? { adventureId: currentAdventureId } : "skip"
  );
  const getActiveEvent = useQuery(
    api.adventures.getActiveEvent,
    currentAdventureId ? { adventureId: currentAdventureId } : "skip"
  );
  const characterPortrait = useQuery(
    api.characterPortraits.getPortraitById,
    getAdventure?.adventure?.characterPortraitId ? { portraitId: getAdventure.adventure.characterPortraitId } : "skip"
  );

  const [playerInput, setPlayerInput] = useState<string>("");
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const adventureLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (getAdventure) {
      setCurrentView("game");
    }
  }, [getAdventure]);
  const handleStartNewAdventure = () => {
    setCurrentView("character-creation");
  };

  const handleContinueAdventure = (adventureId: Id<"adventures">) => {
    setCurrentAdventureId(adventureId);
  };

  const handleReturnToDashboard = () => {
    setCurrentView("dashboard");
    setCurrentAdventureId(null);
    setPlayerInput("");
  };

  const handleDeleteAdventure = async (adventureId: Id<"adventures">) => {
    if (confirm("Are you sure you want to delete this adventure? This action cannot be undone.")) {
      try {
        await deleteAdventure({ adventureId });
      } catch (error) {
        console.error("Failed to delete adventure:", error);
        alert("Failed to delete adventure. Please try again.");
      }
    }
  };

  const handleAdventureCreated = (adventureId: Id<"adventures">) => {
    setCurrentAdventureId(adventureId);
  };

  const handleEventChoice = async (choice: string) => {
    if (!currentAdventureId) return;

    setIsProcessingAction(true);

    try {
      // Process the choice - the backend will handle adding it to the log
      await processPlayerAction(choice);
    } catch (error) {
      console.error("Failed to process event choice:", error);
      // Error handling is now done in the backend
    } finally {
      setIsProcessingAction(false);
    }
  };

  const processPlayerAction = async (action: string) => {
    if (!currentAdventureId) return;

    // Call the streamlined takeTurn action - everything else is handled in backend
    await takeTurn({
      adventureId: currentAdventureId,
      userPrompt: action
    });

    // Event state is now handled by the getActiveEvent query
  };

  const handleTakeTurn = async () => {
    if (!playerInput.trim() || isProcessingAction || !currentAdventureId) return;

    const action = playerInput.trim();
    setIsProcessingAction(true);
    setPlayerInput("");

    try {
      await processPlayerAction(action);
    } catch (error) {
      console.error("Failed to process action:", error);
      // Error handling is now done in the backend
    } finally {
      setIsProcessingAction(false);
    }
  };

  useEffect(() => {
    if (adventureLogRef.current && getAdventure?.actions) {
      adventureLogRef.current.scrollTop = adventureLogRef.current.scrollHeight;
    }
  }, [getAdventure?.actions]);

  if (currentUser === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        <div className="bg-gradient-to-b from-gray-800 to-slate-900 p-8 rounded-xl shadow-2xl border border-gray-600">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-300 font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "dashboard") {
    return (
      <AdventureDashboard
        onStartNewAdventure={handleStartNewAdventure}
        onContinueAdventure={handleContinueAdventure}
        onDeleteAdventure={handleDeleteAdventure}
      />
    );
  }

  if (currentView === "character-creation") {
    return (
      <CharacterCreation onReturnToDashboard={handleReturnToDashboard} onAdventureCreated={handleAdventureCreated} />
    );
  }

  return (
    <div className="flex h-screen" style={backgroundStyle}>
      {/* Background overlay for readability */}
      <div className="absolute inset-0 z-0" style={overlayStyle} />

      {/* Content layer */}
      <div className="relative z-10 flex w-full h-full">
        <CharacterStats
          adventure={getAdventure?.adventure}
          inventory={getAdventure?.inventory || []}
          glossary={getAdventure?.glossary || []}
          characterPortraitUrl={characterPortrait?.imageUrl}
          onReturnToDashboard={handleReturnToDashboard}
          onSignOut={() => signOut()}
          isLoading={!getAdventure}
        />

        <div className="flex-1 flex flex-col">
          <AdventureLog
            ref={adventureLogRef}
            actions={getAdventure?.actions}
            isProcessingAction={isProcessingAction}
            isLoading={!getAdventure}
            hasBackground={background.hasBackground}
          />

          <ActionInput
            playerInput={playerInput}
            isProcessingAction={isProcessingAction}
            onInputChange={setPlayerInput}
            onTakeTurn={handleTakeTurn}
            activeEvent={getActiveEvent?.eventText || null}
            eventOptions={getActiveEvent?.eventOptions || null}
            onEventChoice={handleEventChoice}
          />
        </div>
      </div>
    </div>
  );
}
