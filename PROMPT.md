You are Claude Code. We are building a “Personal Dashboard / Life OS” for ONE user (Evan) so he can stop bouncing between Notes, reminders, finance apps, etc. Optimize for FAST SHIPPING and daily usability.

Before coding, follow these workflow practices:
- Create a project memory file (CLAUDE.md) to store rules + architecture so we don’t repeat ourselves.
- Use sub-agents for specific TASKS (schema review, UI review, docs).
- Work in vertical slices: build something usable end-to-end, commit, then expand.
- Keep the main thread clean; when context grows, compact.

====================================================================
0) PROJECT SETUP RULE: CREATE “PROJECT MEMORY” + COMMANDS + SUBAGENTS
====================================================================

A) Create these files FIRST (commit immediately):
1) ./CLAUDE.md
2) ./.claude/commands/plan.md
3) ./.claude/commands/next.md
4) ./.claude/commands/review.md
5) ./.claude/commands/ship.md

B) Define these sub-agents (task-based):
- schema-reviewer: Prisma schema sanity + simplicity + future extensibility
- ui-reviewer: mobile-first UX + animation quality + interaction design
- docs-writer: README + setup + dev notes

(If /agents exists, create them; otherwise simulate by clearly separating outputs.)

C) Development discipline:
- After each milestone: run lint + typecheck + build, then commit with clear message.
- Don’t add features not listed in milestone acceptance criteria.

====================================================================
1) PRODUCT GOAL + CONSTRAINTS
====================================================================

Goal:
A mobile-first, one-stop dashboard Evan can use daily:
- Fitness/Health (split, training log, diet targets, supplements, stats)
- Finance (monthly bills + portfolio/watchlist + notes; later catalysts/briefs)
- Tasks (to-do) + Groceries
- Mental health (daily quote) + Journaling
- Goals/deadlines
- Learn/Research queue
- Creative/beatmaking inspiration

Constraints:
- Single user only (no public accounts for MVP).
- Deployed on Vercel.
- Automated sync across devices (hosted Postgres).
- Must be protected (no public access).
- FAST shipping > perfect architecture.
- Quick capture and “Today view” are the core value.

====================================================================
2) SECURITY (MUST HAVE)
====================================================================

Implement a simple password gate (single-user):
- Env var: APP_PASSWORD
- /login page: password input
- On success: set secure httpOnly cookie (session token)
- middleware.ts blocks all routes except /login (+ static assets)
- /logout clears cookie
- Cookie: httpOnly, secure in production, sameSite=lax (or strict), sensible expiration

====================================================================
3) TECH STACK
====================================================================

- Next.js (App Router) + TypeScript
- TailwindCSS + shadcn/ui
- Framer Motion for animations (respect prefers-reduced-motion)
- Prisma + Postgres (Vercel Postgres preferred; Neon ok)
- Zod for validation
- Server Actions for writes preferred

====================================================================
4) UI / UX — MODERN + CREATIVE + ANIMATED (BUT NOT CLUTTERED)
====================================================================

Design a modern, creative UI with tasteful animations and delightful micro-interactions.
We want it to feel premium and “alive,” not like a generic admin dashboard.

NON-NEGOTIABLE MOBILE UX:
- Mobile-first at ~390px
- Bottom tab nav on mobile for: Dashboard, Tasks, Fitness, Finance, Journal
- “More” (Goals/Learn/Creative/Settings) accessible via a top-right menu button or sheet
- Floating Action Button (FAB) on mobile for quick-add -> opens bottom sheet
- Desktop: clean sidebar + top bar (simple + consistent)

CREATIVE UI + ANIMATION REQUIREMENTS:
- Use Framer Motion for:
  - page transitions (subtle but noticeable)
  - list item add/remove animations (springy but not distracting)
  - hover/tap feedback on cards/buttons
  - bottom sheet/modal entrance/exit
- Add at least TWO “creative UI features” that are actually useful, not gimmicks:
  Examples (choose 2+):
  1) Command Palette (⌘K desktop, button on mobile) for quick navigation + quick add
  2) “Focus Mode / Today Mode” toggle that reduces UI to just today’s essentials
  3) Animated “streak/progress” micro-widget (e.g., journal streak, workouts/week)
  4) Smart empty states with illustrated icon + quick action button
  5) Subtle background gradient animation (very slow, low contrast) OR parallax header
- Visual design should feel modern:
  - clean spacing, soft shadows, rounded 2xl corners
  - consistent typography scale
  - avoid overly bright colors; use a cohesive palette
  - optional: tasteful glass/blur in headers/sheets (but keep it readable)
- Respect prefers-reduced-motion: animations should reduce/disable gracefully.

IMPORTANT: Do NOT overbuild UI systems. Prefer a small design system:
- Card, ListRow, BottomSheet, Modal, Tabs, FAB, StatChip
Keep it consistent across modules.

Avoid tables on mobile; use cards/rows with expandable details.

====================================================================
5) DATA MODEL (PRISMA) — KEEP SIMPLE, EXTENSIBLE
====================================================================

Single-user: no users table required for MVP.

Core tables (minimum for MVP + near-term):
- tasks: id, title, notes?, status, dueDate?, priority?, createdAt, updatedAt
- grocery_items: id, name, category?, isChecked, createdAt, updatedAt
- journal_entries: id, content, tags (string[] or separate table), mood?, createdAt, updatedAt
- daily_quotes: id, date (unique), quote, author?, source?, createdAt

Fitness:
- workout_templates: id, name, structureJson, createdAt, updatedAt
- workouts: id, date, title?, notes?, templateId?, createdAt, updatedAt
- workout_entries: id, workoutId, exerciseName, setsJson, order, createdAt, updatedAt
- body_metrics: id, date, weight?, steps?, sleepHours?, notes?, createdAt, updatedAt
- diet_targets: id, calories?, protein?, fiber?, notes?, updatedAt
- supplements: id, name, dosage?, schedule?, notes?, isActive, createdAt, updatedAt

Finance (manual MVP):
- bills: id, name, amount, dueDay, isActive, createdAt, updatedAt
- bill_payments: id, billId, month (YYYY-MM), isPaid, paidAt?, createdAt, updatedAt
- holdings: id, symbol, shares?, avgCost?, notes?, createdAt, updatedAt
- watchlist: id, symbol, notes?, createdAt, updatedAt
- ticker_notes: id, symbol, catalystText?, thesis?, updatedAt

Goals / Learn / Creative:
- goals: id, title, timeframe, dueDate?, status, notes?, createdAt, updatedAt
- learning_items: id, title, url?, topicTags?, status, notes?, createdAt, updatedAt
- creative_ideas: id, title, notes, linksJson?, createdAt, updatedAt
- creative_sessions (optional): id, date, notes, createdAt, updatedAt

Prefer JSON fields where it reduces complexity but keep it readable.

====================================================================
6) PHASED BUILD PLAN (VERTICAL SLICES) + ACCEPTANCE CRITERIA
====================================================================

Milestone 1 — Foundation (ship skeleton)
- Scaffold Next.js app + Tailwind + shadcn/ui + Framer Motion
- Prisma + Postgres connection + first migration
- Password gate (/login, middleware, /logout)
- App shell: mobile tabs + FAB + bottom sheets + clean desktop layout
- Dashboard route exists with 3 placeholder widgets
Acceptance: app runs locally, navigation works mobile/desktop, auth gate works, deployable.

Milestone 2 — Tasks + Groceries (first daily-use slice)
- Tasks CRUD + quick toggle complete + filters (All/Today/Completed)
- Groceries checklist + categories + quick add
- Dashboard shows real data widgets: “Today Tasks” and “Groceries”
- Animations: item add/remove + toggles + sheet transitions
Acceptance: Evan can use this daily (add tasks, check groceries) and it persists in DB.

Milestone 3 — Journal + Daily Quote
- Journal CRUD + tags + search
- Daily quote stored per day and shown on dashboard
- Add “Today Mode” (Focus Mode) toggle (simple UI state)
Acceptance: journaling works end-to-end; quote displays; today mode reduces clutter.

Milestone 4 — Fitness
- Templates + workout logging + body weight log
- Supplements list + diet targets
Acceptance: can log a workout quickly on mobile.

Milestone 5 — Finance (manual)
- Bills + monthly paid status
- Holdings + watchlist + ticker notes (manual catalysts)
Acceptance: can track bills and jot notes per ticker.

Milestone 6 — Goals / Learn / Creative
- Basic CRUD + dashboard widgets
Acceptance: can capture goals, learning links, and creative ideas quickly.

After each milestone: lint/typecheck/build, commit.

====================================================================
7) COMMANDS TO CREATE (WRITE THESE FILES)
====================================================================

Create .claude/commands:
- plan.md: produce milestone plan + checklist, no coding
- next.md: implement next smallest shippable slice end-to-end
- review.md: security + mobile UX + animation quality + schema sanity review
- ship.md: deployment checklist + env vars + build verification + README update

====================================================================
8) OUTPUTS REQUIRED FROM YOU (RIGHT NOW)
====================================================================

Step 1 (no coding yet): Output:
- Milestone plan with acceptance criteria
- Folder structure
- Initial Prisma schema (support milestones 1–3)
- UI route/nav map and key reusable components list

Step 2: Implement Milestone 1 completely.
Step 3: Implement Milestone 2 completely (Tasks + Groceries end-to-end).

Do NOT overbuild. Make it usable ASAP while still feeling modern and animated.
