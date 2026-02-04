# Viie Minuti Harjutused (5-Minute Exercises)

## Overview

This is an Estonian-language educational web application designed for teachers in grades 1-4. The app generates short, age-appropriate classroom exercises across three subject areas: mathematics, logic, and emotional warm-up activities. Teachers can select grade level, subject, difficulty, and optionally a theme to generate AI-powered micro-exercises that take approximately 5 minutes to complete.

The application uses OpenAI (via Replit AI Integrations) to generate exercise content in Estonian, stores generated exercises in a PostgreSQL database, and provides a history view of previously created exercises.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite with HMR support

The frontend follows a page-based architecture with reusable components. Key pages include the main exercises generator (`ExercisesPage`) and individual exercise preview (`ExercisePreviewPage`). The UI uses a premium, calm color palette with sea-glass tones suitable for educational contexts.

### Backend Architecture
- **Framework**: Express.js 5 with TypeScript
- **API Design**: REST endpoints with Zod schema validation
- **Development**: tsx for TypeScript execution, Vite middleware for HMR
- **Production**: esbuild bundles server code to CommonJS

API routes are defined in `server/routes.ts` with corresponding type definitions in `shared/routes.ts`. The shared folder enables type-safe API contracts between frontend and backend.

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Drizzle Kit (`npm run db:push`)

Key tables:
- `exercises`: Stores generated exercises with grade, subject, difficulty, theme, title, instructions, expected answer, and teacher tip
- `users`: Basic user table (authentication not implemented)
- `conversations`/`messages`: Chat storage for Replit integrations (optional feature)

### AI Integration
- **Provider**: OpenAI via Replit AI Integrations
- **Model**: gpt-5.2 for exercise generation
- **Response Format**: JSON object with structured exercise data
- **Configuration**: Environment variables `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`

The exercise generation uses a system prompt specifying safe, age-appropriate content for Estonian primary school students.

## External Dependencies

### Required Services
- **PostgreSQL Database**: Connection via `DATABASE_URL` environment variable
- **OpenAI API**: Via Replit AI Integrations for exercise generation

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Async state management
- `zod`: Runtime type validation for API requests/responses
- `openai`: OpenAI API client
- Radix UI primitives: Accessible component foundations
- `tailwindcss`: Utility-first CSS framework

### Replit Integrations (Optional)
The `server/replit_integrations/` folder contains pre-built modules for:
- Audio/voice chat capabilities
- Image generation
- Batch processing utilities
- Chat storage

These are available but not actively used in the main application flow.