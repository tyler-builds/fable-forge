# Fable Forge

An AI-powered text-based role-playing game where you create characters and embark on dynamic adventures driven by OpenAI's GPT models.

## Features

- **Character Creation**: Choose from different classes (warrior, mage) with unique stats
- **AI-Driven Adventures**: Dynamic storytelling powered by OpenAI
- **Dice Rolling System**: D&D-style stat checks with modifiers
- **Inventory Management**: Collect and manage items throughout your journey
- **Adventure Glossary**: Build a glossary of terms and lore as you explore
- **Save & Continue**: Multiple adventure save slots with persistent progress
- **User Authentication**: Secure login system with Better Auth

Built with:

- [Convex](https://convex.dev/) for real-time backend and database
- [React](https://react.dev/) + [Vite](https://vitest.dev/) for the frontend
- [OpenAI API](https://openai.com/api/) for AI-powered storytelling
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Better Auth](https://better-auth.com/) for authentication

## Get started

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up your environment variables:
```bash
# Create a .env.local file with:
OPENAI_API_KEY=your_openai_api_key_here
```

3. Start the development server:
```bash
npm run dev
```

This will start both the Convex backend and the React frontend. The app will open in your browser and prompt you to create an account to begin your adventures.

## How to Play

1. **Create an Account**: Sign up or log in to save your progress
2. **Choose Your Character**: Select a class (warrior or mage) with different stat distributions
3. **Begin Your Adventure**: The AI will generate a unique world and starting scenario
4. **Take Actions**: Type what you want to do - explore, fight, cast spells, interact with NPCs
5. **Roll for Success**: The game uses D&D-style dice rolls for skill checks
6. **Manage Resources**: Keep track of your inventory and discover new locations in your glossary
7. **Save & Continue**: Your adventures are automatically saved - return anytime to continue

## Game Mechanics

- **Stats**: Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma
- **Health/Mana**: Warriors have more HP, mages have more MP
- **Dice Rolls**: D20 + stat modifier vs difficulty class (DC)
- **Dynamic Events**: Random encounters and story branching
- **Persistent World**: Your choices affect the ongoing narrative

## Contributing

This is a personal project showcasing AI-powered game development. Feel free to fork and experiment with your own features!
