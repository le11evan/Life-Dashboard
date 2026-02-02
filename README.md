# Life Dashboard

A personal life management dashboard built with Next.js. Track your tasks, fitness, diet, finances, journal entries, and more — all in one place.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)

---

## Features

| Module | Description |
|--------|-------------|
| **Tasks** | Daily task management with priorities and due dates |
| **Fitness** | Workout templates with exercise tracking and logging |
| **Diet** | Macro tracking, water intake (oz), supplements, weight logs |
| **Finance** | Portfolio holdings and watchlist tracking |
| **Journal** | Daily entries with mood tracking and tags |
| **Groceries** | Shopping lists with categories (food, household, pet, etc.) |
| **Goals** | Short-term and long-term goal tracking with progress |
| **Creative** | Ideas board for projects and inspiration |

### Additional Features

- **Data Backup** — Export all your data as JSON from Settings
- **PWA Support** — Install as an app on mobile/desktop
- **LA Timezone** — All dates use America/Los_Angeles
- **30-Day Sessions** — Stay logged in for a month
- **Mobile-First** — Responsive design with bottom navigation

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI + shadcn/ui
- **Animations:** Framer Motion
- **Deployment:** Vercel

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
# Edit .env with your values

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
# Database (Neon or local PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Login password
APP_PASSWORD="your-secure-password"
```

---

## Deployment (Vercel)

### 1. Database Setup

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

### 2. Deploy to Vercel

1. Push repo to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL` — Your Neon connection string
   - `APP_PASSWORD` — Your login password
4. Deploy

### 3. Initialize Database

```bash
# Run locally with your Neon DATABASE_URL
DATABASE_URL="your-neon-url" npx prisma db push
```

---

## Project Structure

```
├── app/
│   ├── (auth)/           # Login page
│   ├── (dashboard)/      # Main dashboard pages
│   │   ├── tasks/
│   │   ├── fitness/
│   │   ├── diet/
│   │   ├── finance/
│   │   ├── journal/
│   │   ├── groceries/
│   │   ├── goals/
│   │   ├── creative/
│   │   └── settings/
│   └── api/              # API routes
├── components/
│   ├── layout/           # Sidebar, header, navigation
│   └── ui/               # Reusable UI components
├── lib/
│   ├── actions/          # Server actions (CRUD)
│   └── validations/      # Zod schemas
└── prisma/
    └── schema.prisma     # Database schema
```

---

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint

npx prisma studio       # Open database GUI
npx prisma db push      # Push schema changes
npx prisma generate     # Regenerate Prisma client
```

---

## Data Backup

Export all your data anytime:

1. Go to **Settings**
2. Click **Export All Data**
3. Downloads a JSON file with everything

---

## Roadmap

- [ ] Data import/restore from backup
- [ ] Keyboard shortcuts
- [ ] Swipe gestures on mobile
- [ ] Dark/light theme toggle
- [ ] Multi-user support
- [ ] Stock price API integration
- [ ] News feed for portfolio holdings
- [ ] Habit tracking
- [ ] Calendar view

---

## Contributing

This is a personal project, but feel free to fork and customize for your own use!

---

## License

MIT License — feel free to use this for your own personal dashboard.

---

<p align="center">
  Built with coffee in Los Angeles
</p>
