import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Hook to get the current background for an adventure
 */
export function useAdventureBackground(adventureId: Id<"adventures"> | null) {
  const background = useQuery(api.backgroundMutations.getCurrentBackground, adventureId ? { adventureId } : "skip");

  return {
    backgroundUrl: background?.imageUrl || null,
    isLoading: background === undefined && adventureId !== null,
    sceneCategory: background?.sceneCategory || null,
    sceneKeywords: background?.sceneKeywords || [],
    hasBackground: !!background
  };
}

/**
 * Generate CSS style object for dynamic background
 */
export function useBackgroundStyle(backgroundUrl: string | null) {
  if (!backgroundUrl) {
    return {
      background: "linear-gradient(to bottom right, rgb(17, 24, 39), rgb(51, 65, 85), rgb(17, 24, 39))"
    };
  }

  return {
    backgroundImage: `url(${backgroundUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    position: "relative" as const
  };
}

/**
 * Generate overlay style for text readability
 */
export function useBackgroundOverlay(hasBackground: boolean) {
  if (!hasBackground) {
    return {};
  }

  return {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(1px)"
  };
}
