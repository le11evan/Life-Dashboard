# Life Dashboard

A full-stack personal Life OS — a mobile-first dashboard that consolidates tasks, fitness tracking, nutrition, finances, journaling, goals, and more into a single unified interface. Built with Next.js 16, TypeScript, and PostgreSQL.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)

---

## Screenshots

<p align="center">
  <img src="public/screenshots/dashboard-top.jpeg" width="260" alt="Dashboard — tasks, fitness, and diet widgets" />
  &nbsp;&nbsp;
  <img src="public/screenshots/dashboard-bottom.jpeg" width="260" alt="Dashboard — groceries, daily quote, and news" />
  &nbsp;&nbsp;
  <img src="public/screenshots/fitness-tracker.jpeg" width="260" alt="Fitness — workout template with exercise logging" />
</p>

<p align="center">
  <em>Left: Dashboard home with greeting, tasks, fitness stats, and diet goals. Center: Groceries list, daily inspiration, and news feed. Right: Fitness tracker with per-exercise set/rep logging.</em>
</p>

---

## Features

| Module | Description |
|--------|-------------|
| **Dashboard** | Personalized home with 10 widget cards, time-of-day greeting, and a "Today Mode" focus view |
| **Tasks** | Priority levels, smart due date labels (overdue/today/tomorrow), inline editing, quick-add FAB |
| **Fitness** | Workout templates (Push/Pull/Leg Day), per-exercise set/rep logging, progressive overload tracking |
| **Diet** | Daily macro tracking (cal/protein/carbs/fat/fiber/water), configurable goals, supplement management, weight log |
| **Finance** | Portfolio holdings with cost basis, watchlist, AI-powered stock research, gain/loss calculations |
| **Journal** | Daily entries with mood & tags, streak tracking, contextual motivational quotes on every page |
| **Groceries** | Categorized shopping list with check-off and live item counts |
| **Goals** | Short-term and long-term goals with progress percentages and status tracking |
| **News** | Aggregated daily feed with category filters (Tech, Finance, Politics, Health) |
| **Creative** | Idea capture board with categories, tags, and pinning |

### Additional Highlights

- **Edit Anywhere** — Edit tasks and journal entries inline after creation
- **Data Backup** — Export all data as JSON from Settings
- **PWA Support** — Installable as a native-feeling app on mobile and desktop
- **Streaming UI** — Each dashboard widget loads independently via React Suspense
- **Animated Interactions** — Spring animations on add/remove, slide-up sheets, fade transitions (respects `prefers-reduced-motion`)
- **Mobile-First** — Designed for 390px base with responsive grid up to desktop
- **30-Day Sessions** — Secure httpOnly cookie auth, stay logged in for a month

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, React Server Components, Server Actions) |
| **Language** | TypeScript (strict) |
| **UI** | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| **Animation** | Framer Motion |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Prisma — 17 models across all modules |
| **Validation** | Zod schemas for all mutations |
| **Auth** | Password gate with httpOnly secure cookie + middleware |
| **Deployment** | Vercel (serverless) |

### Architecture Decisions

- **Server Components by default** — data fetching on the server, client components only where interactivity is needed
- **Server Actions for writes** — form submissions and mutations use Next.js Server Actions with Zod validation
- **Suspense streaming** — each dashboard widget resolves independently with skeleton fallbacks
- **Single-user model** — no multi-tenancy overhead; simple ENV-based password auth
- **LA timezone-aware** — all dates stored as UTC, displayed in America/Los_Angeles

---

## Project Structure

```
app/
  (auth)/login/           # Password gate
  (dashboard)/            # Main app shell with bottom nav + sidebar
    page.tsx              # Dashboard home — 10 streaming widget cards
    tasks/                # Task management with filters and editing
    fitness/              # Workout templates + exercise logging
    diet/                 # Nutrition tracking + supplements + weight
    finance/              # Portfolio + watchlist + research
    journal/              # Daily entries + mood + streaks
    groceries/            # Shopping list with categories
    goals/                # Short & long-term goal tracking
    creative/             # Ideas board with pinning
    settings/             # Data export + app config
  api/                    # Auth endpoints
components/
  layout/                 # Shell, BottomNav, Sidebar, Header, FAB
  ui/                     # shadcn/ui primitives
lib/
  actions/                # Server Actions — one file per module
  validations/            # Zod schemas for all inputs
  db.ts                   # Prisma client singleton
  quotes.ts               # Contextual motivational quotes
prisma/
  schema.prisma           # 17 models, indexed for performance
```

~10,000 lines of TypeScript across 63 source files.

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or [Neon](https://neon.tech))

### Installation

```bash
# Clone the repo
git clone https://github.com/le11evan/Life-Dashboard.git
cd Life-Dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and APP_PASSWORD

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

### Environment Variables

```env
# Database (Neon or local PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Login password
APP_PASSWORD="your-secure-password"
```

---

## Deployment (Vercel)

1. **Database** — Create a free project at [neon.tech](https://neon.tech) and copy the connection string
2. **Deploy** — Import the repo at [vercel.com](https://vercel.com) and add `DATABASE_URL` + `APP_PASSWORD` as environment variables
3. **Initialize** — Run `npx prisma db push` locally with your Neon `DATABASE_URL` to create the tables

---

## Scripts

```bash
npm run dev             # Start development server
npm run build           # Production build
npm run start           # Start production server
npm run lint            # Run ESLint

npx prisma studio       # Open database GUI
npx prisma db push      # Push schema changes
npx prisma generate     # Regenerate Prisma client
```

---

## Roadmap

- [ ] Data import/restore from backup
- [ ] Swipe gestures on mobile
- [ ] Stock price API integration
- [ ] Habit tracking module
- [ ] Calendar view for tasks and journal

---

## License

MIT License — feel free to fork and customize for your own personal dashboard.

---

<p align="center">
  Built with Next.js + TypeScript in Los Angeles
</p>
