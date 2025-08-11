# Warcry Companion App

## Overview
A comprehensive tabletop companion app for Warcry games that focuses on real-time battle tracking and management. The app helps players track critical gameplay elements during active play sessions, including fighter health, abilities usage, treasure holding, status effects, and battle flow management.

## Project Architecture
- **Frontend**: React with wouter routing, Tailwind CSS + shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Migrated from in-memory to persistent PostgreSQL storage

## Key Features

### Active Game Tracker
- **Real-time Battle Management**: Track current battle round, warband turns, and fighter activations
- **Enhanced Fighter Tracking**: 
  - Current wounds vs maximum wounds with visual progress bars
  - Quick damage/healing buttons (-5, -1, +1, +5)
  - Activation status (used/unused per round)
  - Treasure holding status
  - Status effects (Stunned, Flying, Inspired, Downed, etc.)
  - Ability dice tracking with random roll assignment
- **Warband Status**: Track total treasures per warband
- **Three-Tab Interface**:
  - **Warband View**: Main fighter management and tracking
  - **Dice Pool**: Dice rolling and grouping (singles, doubles, triples, quads)
  - **Battle Tools**: Round management, status overview, and mass actions

### Temporary Warband System
- Create quick teams without persistent storage
- Session-based storage for rapid game setup
- Seamless integration with main battle tracker

### Database Schema
- **Warbands Table**: Core warband information
- **Fighters Table**: Fighter stats with foreign key relationship to warbands
- **Battles Table**: Battle tracking and outcomes
- Proper foreign key relationships and data integrity

## Recent Changes

### January 26, 2025 - Form Validation and README Completion
- ✅ Fixed critical userId validation error in WarbandForm (excluded from client-side schema)
- ✅ Resolved "Create Warband" button functionality - form now submits properly
- ✅ Added comprehensive debugging system to identify form submission issues
- ✅ Created professional README.md for GitHub repository with full project documentation
- ✅ Confirmed authentication system working properly with Landing/Home page flow

### Previous Major Updates - Enhanced Battle Tracking System
- ✅ Added comprehensive fighter status tracking (treasure, status effects, ability dice)
- ✅ Implemented visual health management with quick adjustment buttons
- ✅ Created Battle Tools tab with round management and mass actions
- ✅ Enhanced fighter cards with detailed stat display and quick actions
- ✅ Added ability dice tracking with random roll generation
- ✅ Implemented status effect management (add/remove with visual indicators)
- ✅ Added treasure tracking per fighter and warband totals
- ✅ Created battle summary with warband status overview
- ✅ Added mass action buttons for clearing status effects and ability dice

### Core Foundation
- ✅ PostgreSQL database integration with proper schema design
- ✅ Temporary warband creation system
- ✅ Dice pool management with visual grouping
- ✅ Fighter activation tracking
- ✅ Round progression management

## User Preferences
- Focus on practical battle tracking tools over general game information
- Emphasis on real-time data during gameplay sessions
- Clean, efficient UI that works well on tablets during gameplay
- Quick access to common actions (damage, healing, status effects)

## Technical Implementation
- Uses Drizzle schema for type-safe database operations
- React Query for efficient data fetching and caching
- Session storage for temporary warband data
- Comprehensive battle state management with proper type definitions
- Enhanced UI components with visual feedback for all actions

## Next Potential Features
- Battle logging and history tracking
- Export battle results
- Custom status effects creation
- Advanced dice probability calculations
- Tournament mode with multiple battles