# Focus Timer Application

## Overview

This is a productivity-focused web application built with React and Express that implements a Pomodoro-style timer system. The application allows users to track work sessions, take breaks, and monitor their productivity statistics. It features a modern UI built with shadcn/ui components and uses Neon PostgreSQL for data persistence.

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
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Authentication integration
- **Session Management**: Express sessions with PostgreSQL storage

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

1. **User Authentication**: Users authenticate through Replit's OAuth system
2. **Session Management**: Server maintains user sessions using PostgreSQL storage
3. **Timer Operations**: Frontend manages timer state and sends completion data to backend
4. **Data Persistence**: All session data is stored in PostgreSQL via Drizzle ORM
5. **Statistics Generation**: Backend calculates and serves productivity statistics
6. **Real-time Updates**: Frontend uses TanStack Query for efficient data fetching and caching

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **express**: Web framework for API endpoints
- **passport**: Authentication middleware
- **openid-client**: OpenID Connect authentication

### UI Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **wouter**: Lightweight routing library

## Deployment Strategy

### Development
- Uses Vite dev server for frontend development
- Express server with TypeScript compilation via tsx
- Hot reload enabled for both frontend and backend
- Replit-specific development tools integration

### Production
- Frontend built with Vite and served statically
- Backend bundled with esbuild for Node.js execution
- PostgreSQL database hosted on Neon
- Environment variables for database connection and authentication

### Build Process
- `npm run build`: Builds frontend with Vite and bundles backend with esbuild
- `npm run start`: Runs production server
- `npm run dev`: Starts development environment with hot reload

## Changelog

```
Changelog:
- July 06, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```