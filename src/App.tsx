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
  const takeTurnWithRoll = useAction(api.startAdventure.takeTurnWithRoll);
  const currentUser = useQuery(api.auth.getCurrentUser);
  const { signOut } = authClient;

  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [currentAdventureId, setCurrentAdventureId] = useState<Id<"adventures"> | null>(null);

  const addAction = useMutation(api.adventures.addAdventureAction);
  const updateInventory = useMutation(api.adventures.updateAdventureInventory);
  const updateGlossary = useMutation(api.adventures.updateAdventureGlossary);
  const updateStats = useMutation(api.adventures.updateAdventureStats);
  const deleteAdventure = useMutation(api.adventures.deleteAdventure);
  const getAdventure = useQuery(
    api.adventures.getAdventure,
    currentAdventureId ? { adventureId: currentAdventureId } : "skip"
  );

  const [playerInput, setPlayerInput] = useState<string>("");
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const [eventOptions, setEventOptions] = useState<string[] | null>(null);
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
    setActiveEvent(null);
    setEventOptions(null);
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

  const rollStat = (
    statValue: number,
    dc: number
  ): { roll: number; total: number; success: boolean; modifier: number } => {
    const validStatValue = Math.max(1, Math.min(30, statValue || 10));
    const modifier = Math.floor((validStatValue - 10) / 2);
    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + modifier;
    const success = total >= dc;
    return { roll: d20, total, success, modifier };
  };

  const handleEventChoice = async (choice: string) => {
    if (!currentAdventureId || !getAdventure) return;

    setIsProcessingAction(true);
    setActiveEvent(null);
    setEventOptions(null);

    try {
      // Add the chosen response to the log
      await addAction({
        adventureId: currentAdventureId,
        type: "action",
        content: `📝 ${choice}`
      });

      // Process the choice like a normal action
      await processPlayerAction(choice);
    } catch (error) {
      console.error("Failed to process event choice:", error);
      await addAction({
        adventureId: currentAdventureId,
        type: "result",
        content: "⚠️ The magical energies faltered. Please try again."
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const processPlayerAction = async (action: string) => {
    if (!currentAdventureId || !getAdventure) return;

    const { adventure, actions, inventory } = getAdventure;

    // Determine if an event should be triggered (1 in 4 chance)
    const shouldTriggerEvent = Math.random() < 0.25;

    // First, get the initial AI response to check if a roll is needed
    const initialResult = await takeTurn({
      playerAction: action,
      playerClass: adventure.characterClass,
      stats: adventure.currentStats,
      currentSituation: adventure.worldDescription,
      actionHistory: actions.map((entry) => ({ type: entry.type, text: entry.content })),
      inventory: inventory.map((item) => ({
        name: item.itemName,
        quantity: item.quantity,
        description: item.description
      })),
      forceEvent: shouldTriggerEvent
    });

    let finalResult = initialResult;

    if (initialResult.requiresRoll && initialResult.statToRoll) {
      const statValue = adventure.currentStats[initialResult.statToRoll as keyof typeof adventure.currentStats];
      const dcTarget = initialResult.rollDC || 15;
      const rollResult = rollStat(statValue, dcTarget);

      await addAction({
        adventureId: currentAdventureId,
        type: "result",
        content: `🎲 Rolling ${initialResult.statToRoll.toUpperCase()}... ${rollResult.roll} + ${rollResult.modifier} = ${rollResult.total} vs DC ${dcTarget} (${rollResult.success ? "Success!" : "Failed!"})`
      });

      finalResult = await takeTurnWithRoll({
        playerAction: action,
        playerClass: adventure.characterClass,
        stats: adventure.currentStats,
        currentSituation: adventure.worldDescription,
        actionHistory: actions.map((entry) => ({ type: entry.type, text: entry.content })),
        inventory: inventory.map((item) => ({
          name: item.itemName,
          quantity: item.quantity,
          description: item.description
        })),
        rollResult: rollResult.total,
        statRolled: initialResult.statToRoll,
        success: rollResult.success
      });
    }

    await addAction({
      adventureId: currentAdventureId,
      type: "result",
      content: finalResult.outcome
    });

    if (finalResult.proactiveEvent && finalResult.eventOptions) {
      await addAction({
        adventureId: currentAdventureId,
        type: "result",
        content: `🌟 ${finalResult.proactiveEvent}`
      });

      setActiveEvent(finalResult.proactiveEvent);
      setEventOptions(finalResult.eventOptions);
    } else if (finalResult.proactiveEvent) {
      await addAction({
        adventureId: currentAdventureId,
        type: "result",
        content: `🌟 ${finalResult.proactiveEvent}`
      });
    }

    if (finalResult.glossaryTerms && finalResult.glossaryTerms.length > 0) {
      await updateGlossary({
        adventureId: currentAdventureId,
        glossaryTerms: finalResult.glossaryTerms
      });
    }

    if (finalResult.inventoryChanges && finalResult.inventoryChanges.length > 0) {
      await updateInventory({
        adventureId: currentAdventureId,
        inventoryChanges: finalResult.inventoryChanges
      });
    }

    if (finalResult.statAdjustment && finalResult.statToAdjust && finalResult.adjustmentAmount !== 0) {
      await updateStats({
        adventureId: currentAdventureId,
        statToAdjust: finalResult.statToAdjust,
        adjustmentAmount: finalResult.adjustmentAmount
      });
    }
  };

  const handleTakeTurn = async () => {
    if (!playerInput.trim() || isProcessingAction || !currentAdventureId || !getAdventure) return;

    const action = playerInput.trim();
    setIsProcessingAction(true);
    setPlayerInput("");

    try {
      await addAction({
        adventureId: currentAdventureId,
        type: "action",
        content: action
      });

      await processPlayerAction(action);
    } catch (error) {
      console.error("Failed to process action:", error);
      await addAction({
        adventureId: currentAdventureId,
        type: "result",
        content: "⚠️ The magical energies faltered. Please try again."
      });
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
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <CharacterStats
        adventure={getAdventure?.adventure}
        inventory={getAdventure?.inventory || []}
        glossary={getAdventure?.glossary || []}
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
        />

        <ActionInput
          playerInput={playerInput}
          isProcessingAction={isProcessingAction}
          onInputChange={setPlayerInput}
          onTakeTurn={handleTakeTurn}
          activeEvent={activeEvent}
          eventOptions={eventOptions}
          onEventChoice={handleEventChoice}
        />
      </div>
    </div>
  );
}
