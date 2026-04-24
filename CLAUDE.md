# Life Dashboard - Project Memory

## Overview
Personal Dashboard / Life OS for Evan (admin username `le11evan`). Multi-user — friends/family/portfolio visitors can sign up with username + password and get isolated data. Mobile-first, fast shipping priority.

## Tech Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Animation**: Framer Motion (respect prefers-reduced-motion)
- **Database**: Prisma + Vercel Postgres
- **Validation**: Zod
- **Data Mutations**: Server Actions preferred
- **Deployment**: Vercel

## Architecture Decisions

### Auth (Multi-user, custom lightweight session)
- `User` table: `username` (unique), `passwordHash` (bcryptjs), `isAdmin`
- `Session` table: opaque `id` → `userId` + `expiresAt` (30 days)
- httpOnly secure cookie holds the session id
- `middleware.ts` does a presence check only (fast, no DB hit); page-level `requireUser()` (lib/session.ts) validates the session via DB lookup and returns the current user (cached per request)
- `lib/session.ts` exports `getCurrentUser`, `requireUser`, `requireAdmin`, `createSession`, `destroySession`
- `lib/passwords.ts` wraps `bcryptjs` (cost 10)
- API routes: `/api/login`, `/api/signup`, `/api/logout`
- UI: `/login`, `/signup`

### Database
- Per-user tables (have `userId` FK with cascade delete): Task, GroceryItem, JournalEntry, WorkoutTemplate, Holding, WatchlistItem, Goal, CreativeIdea, DietLog, DietGoals (unique on userId), Supplement, WeightLog
- Global tables: DailyQuote, DailyNews, StockResearch (shared cached content — admin-only writes for quotes/news)
- Every server action in `lib/actions/*` scopes queries by `userId` via `requireUser()`
- JSON fields for complex nested data (workout sets, links)
- Dates stored as DateTime, displayed in user timezone

### UI Patterns
- Mobile-first (390px base)
- Bottom tab nav: Dashboard, Tasks, Fitness, Diet, More
- Top-right menu for: Goals, Learn, Creative, Settings
- FAB for quick-add actions
- Components: Card, ListRow, BottomSheet, Modal, Tabs, FAB, StatChip
- Dashboard widget order: Tasks, Fitness, Groceries, Diet, Finance, Journal, Goals, Quote, News, Creative
- Tasks & Groceries show ALL items on dashboard (no preview limit)

### Animation Guidelines
- Page transitions: subtle fade/slide
- List items: spring animations on add/remove
- Sheets/modals: slide up with backdrop fade
- Always check `prefers-reduced-motion`

## Folder Structure
```
/app
  /api
  /(auth)
    /login
  /(dashboard)
    /layout.tsx (shell with nav)
    /page.tsx (dashboard home)
    /tasks
    /groceries
    /fitness
    /finance
    /journal
    /goals
    /learn
    /creative
    /settings
/components
  /ui (shadcn)
  /layout (Shell, BottomNav, FAB, etc.)
  /shared (Card, ListRow, BottomSheet, etc.)
  /features (module-specific)
/lib
  /db.ts (prisma client)
  /session.ts (getCurrentUser, requireUser, createSession, destroySession)
  /passwords.ts (bcryptjs wrappers)
  /auth.ts (re-exports from session + passwords)
  /utils.ts
  /validations (zod schemas)
/prisma
  /schema.prisma
```

## Current Milestone
**All Core Milestones Complete!**

## Completed
- Milestone 1: Foundation (app shell, auth, nav)
- Milestone 2: Tasks + Groceries (CRUD, filters, dashboard widgets)
- Milestone 3: Journal + Daily Quote + Today Mode
- Milestone 4: Fitness (Workout logging with progressive overload)
- Milestone 5: Finance (Portfolio, Watchlist, Research)
- Milestone 6: Goals, News, Creative, Dashboard Revamp
  - Short-term and long-term goals with progress tracking
  - Daily news feed with category filters (Politics, Tech, Finance, Health, etc.)
  - Creative ideas board with pinning and tags
  - Revamped dashboard with all module widgets and gradient styling
  - Contextual quotes on every page (lib/quotes.ts)

## Commands
- `/plan` - Output milestone plan, no coding
- `/next` - Implement next smallest shippable slice
- `/review` - Security + UX + animation + schema review
- `/ship` - Deployment checklist + verification

## Rules
1. After each milestone: lint + typecheck + build, then commit
2. Don't add features not in milestone acceptance criteria
3. Mobile-first always
4. Keep components minimal and reusable
5. Server Actions for writes, Server Components for reads where possible
