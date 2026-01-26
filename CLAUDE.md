# Life Dashboard - Project Memory

## Overview
Personal Dashboard / Life OS for Evan. Single user, mobile-first, fast shipping priority.

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Animation**: Framer Motion (respect prefers-reduced-motion)
- **Database**: Prisma + Vercel Postgres
- **Validation**: Zod
- **Data Mutations**: Server Actions preferred
- **Deployment**: Vercel

## Architecture Decisions

### Auth (Single User)
- ENV: `APP_PASSWORD` for password gate
- httpOnly secure cookie for session
- middleware.ts protects all routes except /login + static assets

### Database
- Single user = no users table needed
- JSON fields for complex nested data (workout sets, links)
- Dates stored as DateTime, displayed in user timezone

### UI Patterns
- Mobile-first (390px base)
- Bottom tab nav: Dashboard, Tasks, Fitness, Finance, Journal
- Top-right menu for: Goals, Learn, Creative, Settings
- FAB for quick-add actions
- Components: Card, ListRow, BottomSheet, Modal, Tabs, FAB, StatChip

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
  /auth.ts (password check, cookie utils)
  /utils.ts
  /validations (zod schemas)
/prisma
  /schema.prisma
```

## Current Milestone
**Milestone 3 - Journal + Daily Quote**

## Completed
- Milestone 1: Foundation (app shell, auth, nav)
- Milestone 2: Tasks + Groceries (CRUD, filters, dashboard widgets)

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
