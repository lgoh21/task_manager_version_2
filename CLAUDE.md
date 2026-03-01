# CLAUDE.md — Tempus Development Guide

Read `docs/product.md` for product behaviour. Read `docs/architecture.md` for stack and data model. Read `BACKLOG.md` for current work items.

## Backlog Workflow

- Before starting work, check `BACKLOG.md` for context on what's planned
- When starting a backlog item, move it to **In Progress**
- When finishing, move it to **Done** with the branch name
- If new work is discovered during implementation, add it to the appropriate section
- Each backlog item should be done on its own branch

## Quick Start

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # TypeScript + ESLint check + production build
```

Environment variables in `.env.local` (not committed):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Architecture Overview

Next.js 14 App Router + Supabase (Postgres + Auth) + React Query + Framer Motion + Tailwind CSS. Deployed on Vercel.

**Data flows one way:** Supabase → API layer (`lib/api/`) → React Query hooks (`lib/hooks/queries/`) → Components.

**Auth:** Email/password via Supabase Auth. `AuthBootstrap` blocks rendering until session resolves. Middleware redirects unauthenticated users to `/auth/login`. User ID is cached in-memory via `lib/api/auth.ts` (get/set, no async).

## File Map

```
src/
├── app/
│   ├── (app)/                    # Authenticated routes (wrapped by layout with sidebar, topbar, detail panel)
│   │   ├── today/page.tsx        # Default view — today's tasks
│   │   ├── plan/page.tsx         # Inbox, Upcoming, Waiting On, Someday sections
│   │   ├── notes/page.tsx        # Standalone journal
│   │   ├── history/page.tsx      # Completed + Let Go tabs
│   │   ├── settings/page.tsx     # Theme, behaviour config, account/logout
│   │   └── layout.tsx            # App shell — thin orchestrator
│   ├── auth/
│   │   ├── login/page.tsx        # Sign in / sign up form
│   │   └── callback/route.ts     # Auth code exchange (for password reset, future OAuth)
│   ├── page.tsx                  # Root redirect — authed → /today, else → /auth/login
│   └── layout.tsx                # Root layout — QueryProvider + AuthBootstrap
│
├── components/
│   ├── layout/                   # App shell pieces
│   │   ├── Sidebar.tsx           # Collapsible nav + project list
│   │   ├── SidebarProjects.tsx   # Project list with create/edit/archive
│   │   ├── TopBar.tsx            # Capture bar trigger + done counter + moon toggle
│   │   ├── DetailPanel.tsx       # Thin shell composing detail sub-components
│   │   ├── ContentArea.tsx       # Main content with detail panel slide-in
│   │   └── KeyboardShortcuts.tsx # Global keyboard handler
│   ├── tasks/                    # Task-specific components
│   │   ├── TaskRow.tsx           # *** SHARED — one component, variant props for all views ***
│   │   ├── TaskDetailHeader.tsx  # Editable title, project pill, tags
│   │   ├── TaskDetailMeta.tsx    # Size picker, due date, carried-forward badge
│   │   ├── TaskNotes.tsx         # Markdown editor with live preview
│   │   ├── TaskActions.tsx       # Bottom action bar (Move to Today, Done, More...)
│   │   ├── SubtaskList.tsx       # Checklist with drag reorder
│   │   ├── CaptureBar.tsx        # Text input in TopBar
│   │   ├── CaptureModal.tsx      # Popup for new task (title, notes, size, project)
│   │   ├── DatePicker.tsx        # Quick picks + native date input
│   │   ├── ProjectPicker.tsx     # Dropdown for assigning project
│   │   ├── TagInput.tsx          # Inline tag pills with autocomplete
│   │   ├── WaitingOnModal.tsx    # Modal for entering waiting-on text
│   │   ├── ProjectEditModal.tsx  # Edit project name + colour
│   │   ├── HistoryEntry.tsx      # Expandable history row
│   │   └── TodayEmptyState.tsx   # Planning prompt when Today is empty
│   └── ui/                       # Generic reusable
│       ├── Icons.tsx             # All SVG icons (dependency-free)
│       ├── Badge.tsx, Toast.tsx, CollapsibleSection.tsx, ContextMenu.tsx
│       ├── SearchPalette.tsx     # ⌘K global search overlay
│       ├── SearchResult.tsx      # Search result row
│       └── MoonPhaseIcon.tsx     # Lunar phase SVG for dark mode toggle
│
├── lib/
│   ├── api/                      # Supabase CRUD — raw database operations
│   │   ├── auth.ts               # Cached userId get/set (sync, no async)
│   │   ├── tasks.ts              # fetchAllTasks, createTask, updateTask, deleteTask
│   │   ├── projects.ts           # fetchProjects, createProject, updateProject, deleteProject
│   │   ├── notes.ts              # fetchNotes, createNote, updateNote, deleteNote
│   │   ├── subtasks.ts           # fetchSubtasks, createSubtask, updateSubtask, deleteSubtask
│   │   └── tags.ts               # fetchTags, fetchTaskTags, addTagToTask, removeTagFromTask
│   ├── hooks/
│   │   ├── queries/              # React Query hooks — data fetching + optimistic mutations
│   │   │   ├── queryKeys.ts      # Centralized cache key factory
│   │   │   ├── useTasks.ts       # useAllTasks, useTasksByStatus, useCreateTask, useUpdateTask, etc.
│   │   │   ├── useProjects.ts    # useProjects, useCreateProject, useUpdateProject, etc.
│   │   │   ├── useNotes.ts       # useNotes, useCreateNote, useDeleteNote, etc.
│   │   │   ├── useSubtasks.ts    # useSubtasks, useCreateSubtask, etc.
│   │   │   └── useTags.ts        # useTags, useTaskTags, useAddTag, useRemoveTag, etc.
│   │   ├── useAppStore.tsx       # Global UI state (selectedTaskId, sidebar, theme, search, filters)
│   │   ├── useAuthBootstrap.tsx   # Session gating — blocks children until auth resolves
│   │   ├── useQueryProvider.tsx   # React Query client (staleTime: 2min)
│   │   ├── useKeyboardShortcuts.ts
│   │   └── usePlanDrag.ts        # HTML5 drag between Plan sections
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client (createClient)
│   │   ├── server.ts             # Server Supabase client (createServerSupabaseClient)
│   │   └── middleware.ts          # Session refresh + auth redirect
│   └── utils/                    # Pure utility functions
│       ├── decay.ts, dates.ts, tasks.ts, carriedForward.ts, lunarPhase.ts
│
├── config/
│   ├── theme.ts                  # Colours, fonts — mapped to CSS variables
│   ├── constants.ts              # Decay timings, heavy day threshold, size weights
│   └── animations.ts             # Framer Motion variants
│
├── types/index.ts                # Task, Subtask, Project, Tag, Note, CreateTaskInput, etc.
└── middleware.ts                  # Next.js middleware → calls supabase/middleware.ts
```

## How to Make Changes

### Adding a new feature to an existing view
1. Check if existing hooks in `lib/hooks/queries/` already provide the data you need
2. If you need new Supabase queries, add them to the appropriate `lib/api/*.ts` file
3. Add React Query hooks in `lib/hooks/queries/` following the existing pattern
4. Use the hooks in your component — never call Supabase directly from components

### Adding a new data mutation
Follow the pattern in `lib/hooks/queries/useTasks.ts`:
1. Add the raw API call to `lib/api/`
2. Create a `useMutation` hook with optimistic updates:
   - `onMutate`: cancel queries, snapshot previous, update cache optimistically
   - `onError`: revert to snapshot
   - `onSettled`: invalidate to refetch from server
3. Use `queryKeys` from `lib/hooks/queries/queryKeys.ts` for all cache keys

### Getting the current user ID
```ts
import { getCachedUserId } from '@/lib/api/auth';
const userId = getCachedUserId(); // sync, never async in components
```

### Adding a new page/route
- Authenticated routes go in `src/app/(app)/your-route/page.tsx`
- They automatically get the sidebar, topbar, and detail panel from the layout
- Add to `FULL_WIDTH_ROUTES` in `ContentArea.tsx` if it shouldn't show the detail panel

### Modifying task state transitions
Task status changes go through `useUpdateTask` mutation. Convenience hooks exist:
- `useCompleteTask()` — sets status to 'done' + completed_at
- `useLetGoTask()` — sets status to 'let_go' + completed_at
- `useRestoreTask()` — sets status to 'inbox' + clears completed_at

## Architecture Rules

### Don't duplicate — abstract
- **TaskRow**: ONE component with variant props for all contexts. Never create separate row components per view.
- **Context menus**: ONE shared `ContextMenu` component. Each view passes its relevant actions array.
- **Detail panel**: thin shell composing sub-components. Don't let it exceed ~100 lines.
- **Layout**: `app/(app)/layout.tsx` is a thin orchestrator. All pieces are separate components.

### Data layer conventions
- All Supabase calls go through `lib/api/` — components never import `createClient` directly
- All data access in components goes through React Query hooks in `lib/hooks/queries/`
- Mutations always use optimistic updates (update cache → write to DB → revert on error)
- One query client in root layout. Views consume cached data, never fetch independently.
- Cache key factory in `queryKeys.ts` — never hardcode query key strings

### Global UI state
`useAppStore` (React Context) holds: selectedTaskId, sidebarCollapsed, theme, searchOpen, captureModal, activeProjectFilter, activeTagFilter, userEmail. NOT in React Query.

### Component guidelines
- No component file should exceed ~150 lines. Break it up if it does.
- Behavioural constants from `config/constants.ts` — never hardcode thresholds
- Colours/spacing from `config/theme.ts` or Tailwind CSS variables — never hardcode hex codes
- Animation variants from `config/animations.ts`

### File naming
- Components: PascalCase (`TaskRow.tsx`)
- Utilities/hooks/config: camelCase (`decay.ts`, `useTasks.ts`)

### When in doubt
- Favour composition over configuration
- Favour explicit props over implicit context
- Keep `docs/product.md` as the source of truth for product behaviour
- Run `npm run build` to verify TypeScript + ESLint before finishing
