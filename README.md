# Focus Timer Application

## Overview

This is a productivity-focused web application built with React and Express that implements a Pomodoro-style timer system. The application allows users to track work sessions, take breaks, and monitor their productivity statistics. It features a modern UI built with shadcn/ui components and uses Turso SQLite for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: SQLite via Turso
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Google OAuth 2.0 authentication
- **Session Management**: Express sessions with SQLite storage

## Key Components

### Authentication System
- Integrated with Google OAuth 2.0 authentication
- Session-based authentication with SQLite session storage
- Secure cookie-based sessions
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
- **Sessions**: Authentication session storage

### Statistics and Reporting
- Today's progress tracking (completed sessions, total time, efficiency)
- Weekly overview with daily breakdowns
- Recent sessions history
- Date-based session filtering and reporting

## Data Flow

1. **User Authentication**: Users authenticate through Google OAuth 2.0
2. **Session Management**: Server maintains user sessions using SQLite storage
3. **Timer Operations**: Frontend manages timer state and sends completion data to backend
4. **Data Persistence**: All session data is stored in SQLite via Drizzle ORM
5. **Statistics Generation**: Backend calculates and serves productivity statistics
6. **Real-time Updates**: Frontend uses TanStack Query for efficient data fetching and caching

## External Dependencies

### Core Dependencies
- **@libsql/client**: Turso SQLite client driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **express**: Web framework for API endpoints
- **passport**: Authentication middleware
- **passport-google-oauth20**: Google OAuth 2.0 authentication strategy

### UI Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **wouter**: Lightweight routing library

## Environment Variables

The following environment variables are required:

### Authentication
- `GOOGLE_CLIENT_ID`: Google OAuth 2.0 client ID (from Google Console)
- `GOOGLE_CLIENT_SECRET`: Google OAuth 2.0 client secret (from Google Console)
- `BASE_URL`: Base URL of your application (e.g., https://yourdomain.com)
- `SESSION_SECRET`: Secret key for session encryption (generate a secure random string)

### Database
- `TURSO_DATABASE_URL`: Turso SQLite database connection URL
- `TURSO_AUTH_TOKEN`: Turso authentication token

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Add your domain to authorized origins
6. Add `${BASE_URL}/api/callback` to authorized redirect URIs
7. Copy the Client ID and Client Secret to your environment variables

## Deployment Strategy

### Development
- Uses Vite dev server for frontend development
- Express server with TypeScript compilation via tsx
- Hot reload enabled for both frontend and backend

### Production
- Frontend built with Vite and served statically
- Backend bundled with esbuild for Node.js execution
- SQLite database hosted on Turso
- Environment variables for database connection and authentication

### Build Process
- `pnpm run build`: Builds frontend with Vite and bundles backend with esbuild
- `pnpm run start`: Runs production server
- `pnpm run dev`: Starts development environment with hot reload

## Changelog

```
Changelog:
- July 06, 2025. Initial setup
- January 16, 2025. Migrated from Replit Auth to Google OAuth 2.0
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```