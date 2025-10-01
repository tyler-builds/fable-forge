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