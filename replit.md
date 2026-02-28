# Healthcare Vocabulary Trainer

## Overview

A vocabulary learning application designed for healthcare documentation and administration students (CFGS Documentación y Administración Sanitarias). The app provides interactive learning modes including flashcards, matching games, quizzes, and fill-in-the-blank exercises to help students master 436 medical terms across 18 units.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state, local React state for UI
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for flashcard flips and transitions
- **Effects**: Canvas Confetti for celebration animations on correct answers

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints defined in shared routes file
- **Data Seeding**: Automatically seeds database from JSON vocabulary file on startup

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Single `terms` table storing vocabulary with fields for term, definition, context, Spanish translation, unit metadata, and category
- **Migrations**: Drizzle Kit for schema management (`db:push` command)

### Build System
- **Development**: Vite dev server with HMR, tsx for server execution
- **Production**: Custom build script using esbuild for server bundling, Vite for client
- **Output**: Server compiled to `dist/index.cjs`, client to `dist/public`

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components (shadcn/ui + custom game components)
    hooks/        # Custom React hooks
    pages/        # Page components
    lib/          # Utilities and query client
server/           # Express backend
  routes.ts       # API endpoint definitions
  storage.ts      # Database access layer
  db.ts           # Drizzle database connection
shared/           # Shared between frontend and backend
  schema.ts       # Drizzle schema definitions
  routes.ts       # API route contracts with Zod validation
attached_assets/  # Source vocabulary JSON data
```

## External Dependencies

### Database
- PostgreSQL database (connection via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe database operations

### UI Component Libraries
- Radix UI primitives for accessible components
- shadcn/ui component collection
- Lucide React for icons

### Key NPM Packages
- `@tanstack/react-query` - Data fetching and caching
- `framer-motion` - Animation library
- `canvas-confetti` - Celebration effects
- `drizzle-orm` + `drizzle-zod` - ORM and validation
- `wouter` - Client-side routing
- `zod` - Schema validation