# Tempus — Architecture

**Stack:** Next.js 14 (App Router) + Supabase + Framer Motion + Vercel
**Last updated:** 1 Mar 2026

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router, TypeScript) | Full-stack, Claude Code fluent, Vercel deploy |
| Database | Supabase (Postgres) | Relational data, auth, real-time capable, generous free tier |
| Animations | Framer Motion | Physics-based transitions, layout animations, drag and drop |
| Styling | Tailwind CSS + CSS variables for theming | Utility-first, fast to iterate, theme swappable at runtime |
| Hosting | Vercel | Deploy from GitHub, automatic HTTPS, global CDN |

---

## Project Structure

```
tempus/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/              # Authenticated app routes
│   │   │   ├── today/          # Today view
│   │   │   ├── plan/           # Plan view
│   │   │   ├── notes/          # Notes view
│   │   │   ├── history/        # History view
│   │   │   ├── settings/       # Theme, behaviour config, account/logout
│   │   │   └── layout.tsx      # App shell (sidebar + top bar + detail panel)
│   │   ├── auth/               # Login/signup
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── ui/                 # Generic reusable (Button, Input, Badge, Toast)
│   │   ├── tasks/              # Task-specific (TaskRow, TaskDetail, SubtaskList, CaptureBar)
│   │   └── layout/             # App shell (Sidebar, TopBar, DetailPanel)
│   ├── lib/
│   │   ├── api/                # Supabase CRUD (raw DB operations per table)
│   │   ├── hooks/
│   │   │   ├── queries/        # React Query hooks (data fetching + optimistic mutations)
│   │   │   └── *.ts/tsx        # App store, auth bootstrap, keyboard shortcuts, etc.
│   │   ├── supabase/           # Supabase client/server/middleware
│   │   └── utils/              # Pure helpers (decay, dates, tasks, carriedForward)
│   ├── config/
│   │   ├── theme.ts            # Colours, fonts, spacing — single source of truth
│   │   ├── constants.ts        # Decay timings, heavy day threshold, size weights
│   │   └── animations.ts       # Framer Motion variants and transitions
│   └── types/
│       └── index.ts            # TypeScript types for Task, Note, Project, etc.
├── supabase/
│   └── migrations/             # Database migrations
├── public/
├── .env.local                  # Supabase keys
├── docs/
│   ├── product.md              # Product spec (features, views, behaviours)
│   └── architecture.md         # This file
├── CLAUDE.md                   # Development guide for Claude Code
└── BACKLOG.md                  # Work items and priorities
```

---

## Data Model

### tasks

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | Auto-generated |
| title | text | Required |
| status | enum | `inbox`, `today`, `someday`, `upcoming`, `waiting`, `done`, `let_go` |
| size | enum | `S`, `M`, `L`. Default `M` |
| due_date | timestamptz | Optional. The deadline. |
| project_id | uuid (FK) | Optional. References projects table. |
| notes | text | Markdown content. Optional. |
| waiting_on | text | Optional. Who/what is blocking. |
| sort_order | integer | For manual ordering within Today view |
| days_on_today | integer | Auto-tracked. Resets when moved off Today. |
| created_at | timestamptz | Auto-generated |
| updated_at | timestamptz | Auto-updated on any edit. Used for decay calculation. |
| completed_at | timestamptz | Set when status changes to `done` or `let_go` |
| user_id | uuid (FK) | References auth.users |

### subtasks

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| task_id | uuid (FK) | References tasks |
| text | text | Required |
| done | boolean | Default false |
| sort_order | integer | For manual ordering |

### projects

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | Required |
| colour | text | Hex code |
| archived | boolean | Default false |
| user_id | uuid (FK) | |
| created_at | timestamptz | |

### tags

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | Unique per user |
| user_id | uuid (FK) | |

### task_tags

| Column | Type | Notes |
|---|---|---|
| task_id | uuid (FK) | |
| tag_id | uuid (FK) | |
| (composite PK) | | |

### notes

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| content | text | Markdown |
| user_id | uuid (FK) | |
| created_at | timestamptz | |

---

## Theming / Constants

All visual and behavioural constants live in config files. Nothing hardcoded in components.

**`config/theme.ts`** — colours, fonts, spacing, border radius. Mapped to CSS variables so they can be swapped at runtime (future: admin settings panel).

**`config/constants.ts`**:
```ts
export const DECAY = {
  FADE_START_DAYS: 3,
  LABEL_START_DAYS: 8,
  PROMPT_DAYS: 15,
  FULL_DECAY_DAYS: 30,
};

export const HEAVY_DAY = {
  THRESHOLD: 9,
  WEIGHTS: { S: 1, M: 2, L: 4 },
};

export const TOAST_DURATION_MS = 2500;
export const MAX_PROJECTS = 7;
export const NOTES_DEBOUNCE_MS = 500;
```

**`config/animations.ts`** — Framer Motion exported variants and transitions (spring, smooth, gentle). Used directly by components via import — no wrapper components. Centralised so animation feel can be tuned in one place.

---

## Key Patterns

### Optimistic Updates
UI responds instantly. Database write happens in background. If it fails, revert UI and show error toast. This is critical for the "super quick" feel — every click, check, drag should feel instant.

### Decay Calculation
Decay is calculated client-side from `updated_at` timestamp. No server-side cron needed. When Plan view renders Someday tasks, it computes days since `updated_at` and applies opacity + labels accordingly.

### Carried Forward
A lightweight daily check (on app load): any task with `status = today` and `days_on_today > 0` gets the carried-forward badge. `days_on_today` increments each calendar day the task remains on Today.

### Detail Panel
Rendered in the app layout (not per-route). A global state holds `selectedTaskId`. When set, the panel slides in. This means clicking a task in Today or Plan opens the same panel without navigation.

### Markdown Rendering
Use a lightweight markdown renderer (e.g. `react-markdown`) for the task notes field and standalone notes. Render live as the user types.

---

## Auth

Supabase Auth with email/password. Session managed via `@supabase/ssr` cookies.

- `AuthBootstrap` (`lib/hooks/useAuthBootstrap.tsx`) blocks rendering until session resolves
- Middleware (`lib/supabase/middleware.ts`) refreshes session and redirects unauthenticated users to `/auth/login`
- User ID cached in-memory via `lib/api/auth.ts` — all API calls use `getCachedUserId()` (sync)
- Auth callback route at `/auth/callback` handles code exchange for password reset / future OAuth
- Row-level security (RLS) on all tables: `auth.uid() = user_id`

---

## Deployment

- GitHub repo → Vercel auto-deploys on push to `master`
- Supabase project for database + auth
- Environment variables (set in Vercel): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Update Supabase Site URL + redirect URLs when domain changes

---

## What This Doc Doesn't Cover

- Component-level implementation details (Claude Code decides)
- Exact Framer Motion animation curves (iterate during build)
- Mobile responsive breakpoints (handle during build)
- Error handling patterns (standard Next.js patterns)
- Testing strategy (add post-MVP)

Refer to **docs/product.md** for all product behaviour, view layouts, smart behaviours, and interaction patterns.
