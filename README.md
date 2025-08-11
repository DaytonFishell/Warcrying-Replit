# Warcry Companion App

A comprehensive tabletop companion app for Warcry games that focuses on real-time battle tracking and management. Built to help players track critical gameplay elements during active play sessions.

## Features

### 🎯 Active Game Tracker
- **Real-time Battle Management**: Track current battle round, warband turns, and fighter activations
- **Enhanced Fighter Tracking**: 
  - Current wounds vs maximum wounds with visual progress bars
  - Quick damage/healing buttons (-5, -1, +1, +5)
  - Activation status (used/unused per round)
  - Treasure holding status
  - Status effects (Stunned, Flying, Inspired, Downed, etc.)
  - Ability dice tracking with random roll assignment

### 🏛️ Warband Management
- Create and manage custom warbands with detailed fighter rosters
- Track warband statistics and battle history
- Faction-based organization
- Points system for balanced gameplay

### 🎲 Dice Pool System
- Visual dice rolling and grouping (singles, doubles, triples, quads)
- Integrated with battle tracking system
- Random ability dice assignment

### ⚔️ Battle Tools
- Three-tab interface for comprehensive game management:
  - **Warband View**: Main fighter management and tracking
  - **Dice Pool**: Dice rolling and grouping
  - **Battle Tools**: Round management, status overview, and mass actions
- Battle summary with warband status overview
- Mass action buttons for clearing status effects and ability dice

### 🔒 User Authentication
- Secure user accounts with Replit Auth
- Private warband and battle data
- Session-based authentication

## Tech Stack

- **Frontend**: React with TypeScript, Wouter routing, Tailwind CSS + shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Deployment**: Replit Deployments

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Replit account (for authentication)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd warcry-companion-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Database
DATABASE_URL=your_postgresql_url
PGHOST=your_host
PGPORT=your_port
PGUSER=your_user
PGPASSWORD=your_password
PGDATABASE=your_database

# Authentication
SESSION_SECRET=your_session_secret
REPLIT_DOMAINS=your_domain
REPL_ID=your_repl_id
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Database Schema

The app uses a PostgreSQL database with the following main tables:

- **users**: User authentication and profile data (managed by Replit Auth)
- **warbands**: Core warband information with user relationships
- **fighters**: Fighter stats with foreign key relationship to warbands
- **battles**: Battle tracking and outcomes
- **sessions**: Session storage for authentication

## Project Structure

```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utility functions
├── server/           # Express backend
│   ├── db.ts         # Database connection
│   ├── storage.ts    # Data access layer
│   ├── routes.ts     # API routes
│   └── replitAuth.ts # Authentication setup
├── shared/           # Shared types and schemas
│   └── schema.ts     # Drizzle database schema
└── README.md
```

## Key Design Decisions

- **Real-time Focus**: Optimized for active gameplay sessions rather than general game information
- **Tablet-Friendly**: Clean, efficient UI designed for use during tabletop gaming
- **Session-Based Storage**: Temporary warband system for quick game setup
- **Type Safety**: Full TypeScript implementation with Drizzle ORM for database operations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for the Warcry tabletop gaming community
- Powered by Replit's development platform
- UI components from shadcn/ui

---

*Perfect for Warcry players who want to focus on the game, not the paperwork.*