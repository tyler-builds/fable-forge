"use node";

import { createHash } from "crypto";

// Synonym mapping for scene normalization
const SCENE_SYNONYMS = {
  // Locations
  'forest': ['woods', 'woodland', 'grove', 'thicket', 'jungle'],
  'castle': ['fortress', 'citadel', 'stronghold', 'palace', 'keep'],
  'desert': ['wasteland', 'dunes', 'badlands', 'oasis'],
  'tavern': ['inn', 'pub', 'alehouse', 'bar'],
  'cave': ['cavern', 'grotto', 'tunnel', 'den'],
  'mountain': ['peak', 'cliff', 'summit', 'ridge'],
  'dungeon': ['basement', 'crypt', 'tomb', 'underground'],
  'village': ['town', 'settlement', 'hamlet'],
  'temple': ['shrine', 'cathedral', 'church'],
  'swamp': ['marsh', 'bog', 'wetland'],
  'ruins': ['rubble', 'remnants', 'wreckage'],

  // Atmosphere
  'dark': ['shadowy', 'dim', 'gloomy', 'murky', 'black'],
  'bright': ['sunny', 'brilliant', 'radiant', 'illuminated'],
  'cold': ['frozen', 'icy', 'frigid', 'chilly'],
  'warm': ['hot', 'heated', 'burning'],
  'mysterious': ['enigmatic', 'cryptic', 'strange'],
  'ancient': ['old', 'aged', 'historic', 'archaic'],

  // Size/Scale
  'large': ['huge', 'massive', 'enormous', 'vast', 'grand'],
  'small': ['tiny', 'little', 'compact', 'cramped']
};

// Scene categories for consistent grouping
const SCENE_CATEGORIES = {
  'forest_outdoor': ['forest', 'woods', 'trees', 'grove', 'jungle'],
  'castle_indoor': ['throne', 'hall', 'chamber', 'room', 'corridor'],
  'castle_outdoor': ['castle', 'fortress', 'walls', 'courtyard', 'battlements'],
  'tavern_indoor': ['tavern', 'inn', 'bar', 'common'],
  'cave_underground': ['cave', 'cavern', 'tunnel', 'underground', 'dungeon'],
  'desert_outdoor': ['desert', 'dunes', 'oasis', 'sand'],
  'mountain_outdoor': ['mountain', 'peak', 'cliff', 'summit'],
  'village_outdoor': ['village', 'town', 'settlement', 'street'],
  'temple_indoor': ['temple', 'shrine', 'altar', 'sanctuary'],
  'swamp_outdoor': ['swamp', 'marsh', 'bog'],
  'ruins_outdoor': ['ruins', 'rubble', 'remnants']
};

// Common words to ignore
const STOP_WORDS = ['the', 'and', 'you', 'are', 'in', 'at', 'on', 'with', 'a', 'an', 'to', 'from', 'of'];

/**
 * Extract and normalize keywords from scene description
 */
export function extractSceneKeywords(description: string): string[] {
  const words = description.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.includes(word));

  // Convert synonyms to canonical forms
  const normalizedWords = words.map(word => {
    for (const [canonical, synonyms] of Object.entries(SCENE_SYNONYMS)) {
      if (synonyms.includes(word) || word === canonical) {
        return canonical;
      }
    }
    return word;
  });

  // Remove duplicates and return sorted
  return [...new Set(normalizedWords)].sort();
}

/**
 * Get semantic scene category from description
 */
export function getSceneCategory(description: string): string {
  const keywords = extractSceneKeywords(description);

  // Find best matching category
  let bestCategory = 'generic_scene';
  let maxMatches = 0;

  for (const [category, categoryWords] of Object.entries(SCENE_CATEGORIES)) {
    const matches = keywords.filter(k => categoryWords.includes(k)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestCategory = category;
    }
  }

  // Add atmosphere modifiers if found
  const atmosphere = keywords.find(k => ['dark', 'bright', 'cold', 'warm', 'mysterious', 'ancient'].includes(k));
  if (atmosphere && bestCategory !== 'generic_scene') {
    bestCategory = `${bestCategory}_${atmosphere}`;
  }

  return bestCategory;
}

/**
 * Create consistent hash for scene
 */
export function createSceneHash(description: string): string {
  const category = getSceneCategory(description);
  return createHash('md5').update(category).digest('hex');
}

/**
 * Generate image generation prompt for scene
 */
export function generateImagePrompt(sceneCategory: string, originalDescription: string): string {
  const basePrompt = `Fantasy D&D environment: ${originalDescription}. 
    Cinematic, atmospheric digital art style. 
    Detailed environment with rich colors and mood lighting.
    No characters or people, focus on the setting and atmosphere.
    High fantasy aesthetic, painterly style.`;

  // Add category-specific enhancements
  const enhancements: Record<string, string> = {
    'forest_outdoor': 'Lush vegetation, dappled sunlight through trees',
    'castle_indoor': 'Stone architecture, medieval interior design, torchlight',
    'castle_outdoor': 'Imposing stone walls, medieval architecture, dramatic sky',
    'tavern_indoor': 'Warm wooden interior, flickering firelight, cozy atmosphere',
    'cave_underground': 'Rocky formations, mysterious shadows, underground ambiance',
    'desert_outdoor': 'Vast sandy landscape, heat shimmer, dramatic lighting',
    'mountain_outdoor': 'Rugged terrain, expansive vistas, majestic peaks',
    'village_outdoor': 'Rustic buildings, cobblestone paths, lived-in feel',
    'temple_indoor': 'Sacred architecture, ornate details, divine lighting',
    'swamp_outdoor': 'Murky waters, twisted trees, misty atmosphere',
    'ruins_outdoor': 'Crumbling stone, overgrown vegetation, sense of age'
  };

  const baseCat = sceneCategory.split('_').slice(0, 2).join('_');
  const enhancement = enhancements[baseCat];

  return enhancement ? `${basePrompt} ${enhancement}.` : basePrompt;
}