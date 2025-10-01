import type { Stats } from "./pointBuy";

export const statNames: Array<{ key: keyof Stats; label: string; description: string }> = [
  { key: "str", label: "STR", description: "Strength - Physical power" },
  { key: "dex", label: "DEX", description: "Dexterity - Agility & reflexes" },
  { key: "con", label: "CON", description: "Constitution - Endurance & HP" },
  { key: "int", label: "INT", description: "Intelligence - Magic power & MP" },
  { key: "wis", label: "WIS", description: "Wisdom - Perception & insight" },
  { key: "cha", label: "CHA", description: "Charisma - Social skills" }
];

export function getClassIcon(characterClass: string) {
  switch (characterClass) {
    case "warrior":
      return "⚔️";
    case "mage":
      return "🔮";
    case "rogue":
      return "🗡️";
    default:
      return "❓";
  }
};

export function getClassColor(characterClass: string) {
  switch (characterClass) {
    case "warrior":
      return "border-red-500";
    case "mage":
      return "border-purple-500";
    case "rogue":
      return "border-green-500";
    default:
      return "border-gray-500";
  }
};