# 🗡️ Fable Forge

An AI-powered text-based RPG that brings classic tabletop gaming to life with dynamic storytelling, intelligent dungeon mastering, and immersive adventures.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![Convex](https://img.shields.io/badge/Convex-Backend-orange)](https://convex.dev/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--5-green)](https://openai.com/)

---

## ✨ Features

### 🎭 **Character Creation**
- Choose from three distinct classes: **Warrior**, **Mage**, or **Rogue**
- Point-buy stat allocation system for customized builds
- Unique character portraits for each class
- Dynamic stat calculation (HP, MP, modifiers)

### 🤖 **AI Dungeon Master**
- Powered by OpenAI GPT-5 for intelligent, context-aware storytelling
- Dynamic world generation tailored to your character class
- Realistic NPC interactions and branching narratives
- Proactive world events that keep adventures engaging

### 🎲 **D&D-Style Mechanics**
- D20 skill checks with stat modifiers
- Attribute-based difficulty classes (DC)
- Eight core stats: STR, DEX, CON, INT, WIS, CHA, HP, MP
- Real-time stat tracking and adjustments

### 📦 **Inventory & Economy**
- Item collection with descriptions and reasons
- Gold system for trading and purchases
- AI-detected transactions (buying, selling, looting)
- Persistent inventory across sessions

### 🌍 **Dynamic Worlds**
- AI-generated scene backgrounds based on location
- Background caching and reuse system
- Adaptive scene descriptions
- Glossary building for lore and world-building

### 📈 **Progression System**
- Experience points (XP) and level-up mechanics
- Class-specific stat growth
- Character development tracking
- Level-based difficulty scaling

### 💾 **Save Management**
- Multiple adventure save slots
- Automatic progress saving
- Continue from where you left off
- Adventure dashboard with all your quests

### 🔐 **Secure Authentication**
- User accounts with Better Auth
- Protected adventure data
- Personal adventure library
- Secure session management

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **[React 19](https://react.dev/)** | Frontend UI framework |
| **[TypeScript](https://www.typescriptlang.org/)** | Type-safe development |
| **[Vite](https://vitejs.dev/)** | Build tool and dev server |
| **[Convex](https://convex.dev/)** | Real-time backend and database |
| **[OpenAI API](https://openai.com/)** | GPT-5 Mini for AI storytelling |
| **[Better Auth](https://better-auth.com/)** | Authentication system |
| **[Tailwind CSS](https://tailwindcss.com/)** | Utility-first styling |
| **[Lucide React](https://lucide.dev/)** | Icon library |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- **Convex Account** ([Sign up free](https://convex.dev/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fable-forge.git
   cd fable-forge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # OpenAI API Configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # Convex (configured via `npx convex dev`)
   VITE_CONVEX_URL=your_convex_deployment_url
   ```

4. **Initialize Convex**
   ```bash
   npx convex dev
   ```

   This will:
   - Set up your Convex backend
   - Open the Convex dashboard
   - Generate your deployment URL

5. **Run migrations** (if you have existing data)

   In the Convex dashboard, run these mutations:
   ```typescript
   // Add gold to existing adventures
   await mutation(api.adventures.migrateGoldField, {})

   // Add leveling fields to existing adventures
   await mutation(api.adventures.migrateLevelingFields, {})
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:5173`

---

## 🎮 How to Play

### 1. **Create Your Account**
Sign up with email to save your adventures and progress.

### 2. **Build Your Character**
- Select a **class**: Warrior (tanky), Mage (magical), or Rogue (agile)
- Allocate **27 points** across your six core stats
- View your calculated HP and MP
- Choose a character portrait

### 3. **Enter the World**
The AI Dungeon Master generates:
- A unique world setting
- Your starting location
- An engaging adventure title
- Visual scene backgrounds

### 4. **Take Actions**
Type natural language commands:
- *"I search the room for treasure"*
- *"I try to persuade the guard"*
- *"I cast a fireball at the goblin"*
- *"I buy a health potion from the merchant"*

### 5. **Roll for Success**
The game automatically determines when skill checks are needed:
- D20 roll + stat modifier vs. DC
- Results affect the narrative outcome
- Visible roll breakdown in the log

### 6. **Manage Resources**
- Track your **HP** and **MP**
- Monitor your **gold** for purchases
- View your **inventory** items
- Reference the **glossary** for lore

### 7. **Level Up**
- Earn **XP** through challenges
- Level up to increase stats
- Unlock new abilities and power

### 8. **Save & Return**
- Adventures auto-save after each turn
- Return to the dashboard anytime
- Continue or start new adventures
- Delete old campaigns

---

## 🎯 Game Mechanics

### Stats System

| Stat | Abbreviation | Primary Use |
|------|--------------|-------------|
| **Strength** | STR | Melee attacks, lifting, breaking |
| **Dexterity** | DEX | Agility, stealth, ranged attacks |
| **Constitution** | CON | Health, stamina, resistance |
| **Intelligence** | INT | Magic power, knowledge, investigation |
| **Wisdom** | WIS | Perception, insight, willpower |
| **Charisma** | CHA | Persuasion, deception, leadership |

### Derived Stats
- **HP** = Base (class) + CON modifier × 2
- **MP** = Base (class) + INT modifier × 2
- **Modifier** = floor((stat - 10) / 2)

### Dice Rolling
- **D20** + stat modifier vs. **DC**
- DC ranges: 6-10 (easy), 10-15 (medium), 16-20 (hard), 21+ (very hard)
- Critical success on natural 20
- Automatic failure on natural 1

### Gold System
- Start with **100 gold**
- Earn through quests and looting
- Spend on items, services, bribes
- AI detects purchase intent automatically

### Leveling
- Earn XP through successful actions and combat
- Level up unlocks stat increases
- Class-specific growth patterns
- Progressive difficulty scaling

---

## 📁 Project Structure

```
fable-forge/
├── convex/                    # Backend (Convex)
│   ├── schema.ts             # Database schema
│   ├── adventures.ts         # Adventure queries/mutations
│   ├── startAdventure.ts     # AI turn processing
│   ├── dmSchema.ts           # AI response schema
│   ├── levelingSystem.ts     # XP and leveling logic
│   ├── backgrounds.ts        # Scene background generation
│   └── auth.ts               # Authentication config
├── src/
│   ├── components/           # React components
│   │   ├── CharacterCreation.tsx
│   │   ├── CharacterStats.tsx
│   │   ├── AdventureLog.tsx
│   │   ├── ActionInput.tsx
│   │   ├── InventoryPanel.tsx
│   │   └── GlossaryPanel.tsx
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and helpers
│   └── App.tsx               # Main application
├── .env.local                # Environment variables
└── package.json              # Dependencies
```

---

## 🔧 Configuration

### OpenAI Models Used

| Model | Purpose | Reasoning Effort |
|-------|---------|------------------|
| **gpt-5-mini** | Main storytelling, adventure generation | Minimal |
| **gpt-5-nano** | Quick roll checks and decisions | Minimal |

### Convex Tables

- `adventures` - Character and world state
- `adventureActions` - Turn-by-turn game log
- `adventureInventory` - Items and quantities
- `adventureGlossary` - Lore and terminology
- `sceneBackgrounds` - Generated scene images
- `characterPortraits` - Class portrait images

---

## 🤝 Contributing

This is a personal showcase project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- **OpenAI** for powerful language models
- **Convex** for seamless real-time backend
- **Better Auth** for secure authentication
- **D&D 5e** for game mechanics inspiration

---

## 📧 Contact

For questions or feedback, open an issue on GitHub.

**Enjoy your adventure in Fable Forge!** ⚔️✨
