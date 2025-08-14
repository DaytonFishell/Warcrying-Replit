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
- Public warband duplication for guest users creates temporary warbands

### Community Features
- **Public Warband Gallery**: Browse and discover community-shared warbands
- **Warband Sharing Controls**: Toggle warband visibility and track engagement
- **Like System**: Authenticated users can like/unlike public warbands
- **Guest User Support**: Non-authenticated users can browse and copy public content
- **Search and Filtering**: Advanced discovery tools for public warband gallery

### Database Schema
- **Warbands Table**: Core warband information with public sharing support
- **Fighters Table**: Fighter stats with foreign key relationship to warbands
- **Battles Table**: Battle tracking and outcomes
- **WarbandLikes Table**: User engagement and likes tracking for public warbands
- Proper foreign key relationships and data integrity

## Recent Changes

### August 14, 2025 - Public Warband Sharing System Completed
- ✅ **Public Warband Sharing**: Full implementation of public warband sharing system
  - Added warband sharing controls to toggle public visibility
  - Created public warband gallery with search, filtering, and sorting
  - Implemented warband duplication for guests and authenticated users
  - Added like system for public warbands with authentication checks
  - Enhanced warband detail views with comprehensive fighter information
- ✅ **Guest User Access**: Non-authenticated users can browse and copy public warbands
  - Seamless guest experience with temporary warband creation
  - Clear authentication prompts for premium features (saving permanently, liking)
  - Consistent UI/UX across authenticated and guest user flows
- ✅ **Database Enhancement**: Extended schema with public sharing support
  - Added warbandLikes table for user engagement tracking
  - Updated warbands table with isPublic, views, likes fields
  - Proper foreign key relationships and data integrity
- ✅ **Navigation Updates**: Added public gallery access throughout the application
  - Landing page showcases community features with direct gallery access
  - Navigation tabs include gallery for both authenticated and guest users
  - Strategic placement of sharing features in warband management interface
- ✅ **API Layer**: Comprehensive REST API for public warband operations
  - Public warband listing with advanced filtering and search capabilities
  - Secure like/unlike endpoints with authentication validation
  - Warband duplication with smart naming for guest vs authenticated users
  - View tracking and engagement metrics collection

### August 13, 2025 - Performance Optimization & Legal Compliance
- ✅ **Legal Pages**: Added comprehensive Privacy Policy and Terms of Service pages
- ✅ **Performance Optimizations**:
  - Created memoized components (MemoizedFighterCard, MemoizedWarbandCard) to prevent unnecessary re-renders
  - Implemented OptimizedDashboard with staggered data loading for better perceived performance
  - Added debounce hook for search/input optimization
  - Applied server-side optimizations: caching, rate limiting, and request size limits
- ✅ **SEO Improvements**:
  - Added SEOHead component for dynamic meta tags and Open Graph support
  - Implemented proper page titles and descriptions for all legal pages
  - Enhanced discoverability and social media sharing
- ✅ **Routing Enhancements**: Added /privacy and /terms routes accessible to both authenticated and non-authenticated users
- ✅ **Footer Updates**: Proper links to legal pages and updated messaging about cloud storage

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