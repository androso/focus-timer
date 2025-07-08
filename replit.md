# Focus Timer Application

## Overview

This is a productivity-focused web application built with React and Express that implements a Pomodoro-style timer system. The application allows users to track work sessions, take breaks, and monitor their productivity with detailed analytics.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Framework**: Express.js with TypeScript following MVC pattern
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Authentication integration
- **Session Management**: Express sessions with PostgreSQL storage
- **Architecture Pattern**: Model-View-Controller (MVC) structure

## Key Components

### Authentication System
- Integrated with Replit's OpenID Connect authentication
- Session-based authentication with PostgreSQL session storage
- Mandatory user operations for Replit Auth compatibility
- Protected routes requiring authentication

### Timer System
- Pomodoro-style timer with work and break sessions
- Configurable session durations
- Real-time timer display with start/pause/stop functionality
- Automatic session tracking and completion recording

### Data Storage
- **Users**: Profile information and authentication data
- **Work Sessions**: Individual session records with timing and completion data
- **Timer Settings**: User-specific configuration preferences
- **Sessions**: Authentication session storage (required for Replit Auth)

### Statistics and Reporting
- Today's progress tracking (completed sessions, total time, efficiency)
- Weekly overview with daily breakdowns
- Recent sessions history
- Date-based session filtering and reporting

## Data Flow

1. **Authentication Flow**: User authenticates via Replit Auth, session stored in PostgreSQL
2. **Timer Operations**: Start/pause/stop actions update local state and create database records
3. **Data Persistence**: Work sessions are automatically saved with timing and completion data
4. **Analytics Generation**: Real-time statistics calculated from session data
5. **Report Generation**: Historical data aggregated for various time periods

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/**: UI component primitives
- **wouter**: Lightweight routing

### Authentication
- **openid-client**: OpenID Connect authentication
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **Vite**: Build tool with HMR
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Production bundling

## Deployment Strategy

The application is designed for deployment on Replit with the following configuration:

### Build Process
- Development: `npm run dev` - Runs TypeScript server with hot reload
- Production: `npm run build` - Bundles frontend with Vite and backend with ESBuild
- Database: `npm run db:push` - Applies schema changes to PostgreSQL

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string (Neon serverless)
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Allowed domains for CORS
- `ISSUER_URL`: OpenID Connect issuer URL
- `REPL_ID`: Replit application identifier

### File Structure
- `/client`: Frontend React application
- `/server`: Backend Express server following MVC pattern
  - `/models`: Database models and business logic (User, WorkSession, TimerSettings)
  - `/controllers`: Request handlers and API logic 
  - `/middleware`: Authentication and validation middleware
  - `/routes`: Modular route definitions organized by feature
  - `/services`: Business services (auth, storage)
  - `/config`: Configuration files (database connection)
- `/shared`: Shared TypeScript schemas and types
- `/migrations`: Database migration files

## Changelog

Changelog:
- July 06, 2025. Initial setup
- July 06, 2025. Restructured server directory to follow MVC (Model-View-Controller) pattern:
  - Created `/server/models/` directory with User, WorkSession, and TimerSettings models
  - Created `/server/controllers/` directory with corresponding controllers
  - Created `/server/middleware/` directory for authentication middleware
  - Created `/server/routes/` directory with modular route definitions by feature
  - Created `/server/services/` directory for business services (auth, storage)
  - Created `/server/config/` directory for configuration files (database)
  - Moved `db.ts` to `/server/config/database.ts`
  - Moved `replitAuth.ts` to `/server/services/auth.ts`
  - Moved `storage.ts` to `/server/services/storage.ts`
  - Updated all import statements to reflect new file locations
  - Separated concerns for better code organization and maintainability
- July 07, 2025. Major timezone enhancement implementation:
  - Added `timezone` field to users table with default "UTC"
  - Implemented proper timezone handling using date-fns-tz library
  - All timestamps stored in UTC in database, converted to user timezone for display and calculations
  - Day boundaries now calculated correctly based on user's timezone (e.g., El Salvador timezone)
  - Auto-detection of user timezone on first login with storage in user profile
  - Updated all stats calculations (today's stats, weekly stats) to use user's timezone
  - Added API endpoint for updating user timezone preferences
  - Frontend components now use stored user timezone instead of browser detection
  - Ensures daily progress resets at midnight in user's local timezone, not UTC
- July 08, 2025. Database schema simplification for stopwatch functionality:
  - Removed unnecessary date/time columns: `end_time`, `created_at` from work_sessions table
  - Removed countdown-specific columns: `planned_duration` from work_sessions table  
  - Simplified to stopwatch-only columns: `start_time` and `actual_duration`
  - Removed `created_at` and `updated_at` from active_timer_sessions table
  - Updated efficiency calculation to be based on session completion rate instead of time planned vs actual
  - Updated all backend code to work with simplified schema
  - Cleaned up validation schemas to match new simplified structure

## User Preferences

Preferred communication style: Simple, everyday language.