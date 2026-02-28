# CLAUDE.md — Development Guidelines

Read FEATURE_SPEC.md for product behaviour. Read TECH_SPEC.md for stack and data model.

## Architecture Rules

### Don't duplicate — abstract
- **TaskRow**: one base component with variants/props for different contexts (Today, Plan, Someday with decay, Waiting On with subtitle, Upcoming with due date). Never create separate TaskRow components per view.
- **Context menus**: one shared context menu component that accepts an array of actions. Each view passes the relevant actions for that context. Don't build separate menus per view.
- **Detail panel**: break into sub-components (TaskDetailHeader, TaskNotes, SubtaskList, TaskActions). The panel itself is a thin shell that composes these. Don't let it exceed ~100 lines.
- **Layout**: `app/(app)/layout.tsx` should be a thin orchestrator. Sidebar, TopBar, DetailPanel, and view content are all separate components. Global state (selectedTaskId, sidebar collapse) lives in a shared store/context, not in the layout file.

### Shared utilities — use them
Create and use shared utilities in `lib/utils/`. Don't inline this logic in components:
- `decay.ts` — calculate decay stage and opacity from `updated_at`
- `dates.ts` — relative date formatting ("3d old", "Due Mon"), day-boundary detection
- `tasks.ts` — size weight calculation, heavy day check, sort order helpers
- `carried-forward.ts` — days-on-today logic, badge display rules

### State management
- Use **React Query** (TanStack Query) for all Supabase data fetching and caching.
- Mutations use optimistic updates: update the cache immediately, write to Supabase in background, revert on error.
- One query client in the root layout. Views consume cached data, never fetch independently.
- Global UI state (selectedTaskId, sidebar collapsed, active filter) in a lightweight React context — not in React Query.

### Component guidelines
- No component file should exceed ~150 lines. If it does, break it up.
- All behavioural constants come from `config/constants.ts`. Never hardcode thresholds, timings, or weights.
- All colours and spacing come from `config/theme.ts` or Tailwind config via CSS variables. Never hardcode hex codes.
- Animation variants come from `config/animations.ts`. Components reference variants by name.

### File naming
- Components: PascalCase (`TaskRow.tsx`, `DetailPanel.tsx`)
- Utilities: camelCase (`decay.ts`, `dates.ts`)
- Config: camelCase (`theme.ts`, `constants.ts`)

### When in doubt
- Favour composition over configuration
- Favour explicit props over implicit context
- Favour one well-tested utility over inline logic in three places
- Keep the feature spec as the source of truth for behaviour
