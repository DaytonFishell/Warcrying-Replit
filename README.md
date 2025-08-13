
# Warcry Companion App

A comprehensive tabletop companion app for Warcry games that focuses on real-time battle tracking and management. Built to help players track critical gameplay elements during active play sessions with enhanced performance and user experience.

## 🚀 Features

### ⚔️ Real-Time Battle Management
- **Enhanced Fighter Tracking**: 
  - Visual health management with progress bars and quick adjustment buttons (-5, -1, +1, +5)
  - Activation status tracking (used/unused per round) with visual indicators
  - Treasure holding status with warband treasure totals
  - Comprehensive status effects system (Stunned, Flying, Inspired, Downed, etc.)
  - Ability dice tracking with random roll assignment and management
  - Detailed fighter cards with all stats and quick action buttons

### 🏛️ Advanced Warband Management
- **Persistent Warband System**: Create and manage custom warbands with detailed fighter rosters
- **Session-Based Temporary Warbands**: Quick warband creation for immediate gameplay without permanent storage
- **Fighter Management**: Complete fighter stat tracking with battles, kills, deaths, and performance history
- **Faction-Based Organization**: Organize warbands by faction with points system for balanced gameplay
- **Export/Import**: Full data export capabilities for backup and portability

### 🎲 Interactive Dice & Battle Tools
- **Advanced Dice Pool System**: Visual dice rolling with automatic grouping (singles, doubles, triples, quads)
- **Three-Tab Battle Interface**:
  - **Warband View**: Main fighter management and real-time tracking
  - **Dice Pool**: Dice rolling, grouping, and ability dice assignment
  - **Battle Tools**: Round management, battle summary, and mass action controls
- **Mass Actions**: Bulk clear status effects, ability dice, and activation states
- **Battle Round Management**: Track current round, warband turns, and battle progression

### 📊 Battle Analytics & History
- **Battle Recording**: Complete battle tracking with scenarios, outcomes, and detailed statistics
- **Fighter Performance Tracking**: Individual fighter stats across multiple battles
- **Battle History**: Comprehensive records of all battles with winner/loser tracking and scores
- **Performance Analytics**: Track fighter effectiveness, kill/death ratios, and battle participation

### 🔐 Secure User Experience
- **Replit Authentication**: Secure user accounts with OpenID Connect integration
- **Private Data**: User-specific warbands, fighters, and battle data with proper access controls
- **Session Management**: Secure session handling with PostgreSQL session storage
- **Data Privacy**: Complete privacy policy and terms of service compliance

### ⚡ Performance & Optimization
- **Memoized Components**: Optimized rendering with memoized fighter and warband cards
- **Debounced Inputs**: Smooth search and input interactions with debounce optimization
- **Staggered Loading**: Improved perceived performance with optimized dashboard loading
- **Server-Side Optimizations**: Caching, rate limiting, and request size management

### 🎨 Modern UI/UX
- **Responsive Design**: Tablet-optimized interface perfect for tabletop gaming
- **Dark/Light Themes**: Theme support with system preference detection
- **shadcn/ui Components**: Modern, accessible UI components with consistent design
- **Visual Feedback**: Progress bars, status indicators, and interactive elements
- **SEO Optimized**: Proper meta tags, Open Graph support, and discoverability

### 📱 Legal & Compliance
- **Privacy Policy**: Comprehensive privacy protection and data handling transparency
- **Terms of Service**: Clear terms covering intellectual property and user responsibilities
- **GDPR Compliant**: User rights management including data access, correction, and deletion
- **Games Workshop Compliance**: Proper acknowledgment as fan-made tool with IP respect

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript, Wouter routing, Tailwind CSS + shadcn/ui
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Backend**: Express.js with TypeScript, comprehensive API with authentication middleware
- **Database**: PostgreSQL with Drizzle ORM, type-safe operations and migrations
- **Authentication**: Replit Auth with OpenID Connect, secure session management
- **Performance**: Memoization, debouncing, server-side caching and optimization
- **Deployment**: Replit Cloud Run deployments with automated build pipeline

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Replit account (for authentication)

### Installation

1. **Clone and setup**:
```bash
git clone <your-repo-url>
cd warcry-companion-app
npm install
```

2. **Environment Configuration**:
```bash
# Database Configuration
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

3. **Database Setup**:
```bash
npm run db:push
```

4. **Development Server**:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## 📁 Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── forms/      # Form components (Warband, Fighter, Battle)
│   │   │   ├── optimized/  # Performance-optimized components
│   │   │   └── ui/         # shadcn/ui component library
│   │   ├── pages/          # Route-based page components
│   │   ├── hooks/          # Custom React hooks (auth, debounce, mobile)
│   │   └── lib/            # Utility functions and configurations
├── server/                 # Express.js backend
│   ├── middleware/         # Express middleware (compression, rate limiting)
│   ├── db.ts              # Database connection and configuration
│   ├── storage.ts         # Data access layer with type safety
│   ├── routes.ts          # API routes with authentication
│   └── replitAuth.ts      # Authentication setup and middleware
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Drizzle database schema and types
└── README.md
```

## 🗄️ Database Schema

The app uses a PostgreSQL database with the following structure:

- **users**: User authentication and profile data (Replit Auth managed)
- **warbands**: Core warband information with user relationships and faction data
- **fighters**: Complete fighter stats with foreign keys to warbands
- **battles**: Battle tracking with scenarios, outcomes, and detailed records
- **battle_fighter_stats**: Individual fighter performance tracking per battle
- **sessions**: Secure session storage for authentication

## 🎯 Key Design Principles

- **Real-Time Focus**: Optimized for active gameplay sessions rather than general reference
- **Tablet-First**: Clean, efficient UI designed specifically for tabletop gaming use
- **Performance-Driven**: Memoized components and optimized rendering for smooth gameplay
- **Type Safety**: Full TypeScript implementation with Drizzle ORM for runtime safety
- **Accessibility**: Modern UI components with proper ARIA support and keyboard navigation
- **Scalability**: Modular architecture supporting future feature expansion

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

## 🚀 Deployment

The app is configured for Replit Cloud Run deployments:

1. **Automatic Build**: Vite build process with Express.js bundling
2. **Environment Variables**: Configured through Replit Secrets
3. **Database**: PostgreSQL instance with automatic connection pooling
4. **Authentication**: Integrated Replit Auth with proper domain configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow TypeScript and React best practices
4. Ensure all components are properly typed
5. Test battle tracking functionality thoroughly
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Games Workshop**: Warcry is a trademark of Games Workshop Ltd.
- **Community**: Built for the Warcry tabletop gaming community
- **Replit Platform**: Powered by Replit's development and deployment platform
- **shadcn/ui**: Beautiful and accessible UI components
- **Open Source**: Built with love using open source technologies

## 🛡️ Legal & Privacy

- [Privacy Policy](/privacy) - Comprehensive data protection and user rights
- [Terms of Service](/terms) - Clear usage terms and intellectual property guidelines
- **Fan-Made Tool**: This is an unofficial companion app, not affiliated with Games Workshop
- **Data Security**: Industry-standard encryption and secure data handling

---

*Perfect for Warcry players who want to focus on epic battles, not paperwork. Track every wound, treasure, and status effect with precision and style.* ⚔️🎲
