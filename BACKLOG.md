# Backlog

## In Progress

## Bugs

## Performance

- [ ] **Tab switch latency** — Switching between Today/Plan/History feels slow. React Query cache IS shared (`useAllTasks` uses the same `['tasks']` key everywhere, `staleTime: 2min`), so this is not a data-fetching issue. Likely caused by component unmount/remount overhead on navigation and Framer Motion AnimatePresence/layout animations firing on every mount. Investigate: profile with React DevTools, consider keeping page components mounted or reducing animation on repeat visits.
- [ ] **General rendering lag** — The app loads all data upfront (all tasks, projects, tags, task_tags) which is correct for a personal app. Lag is likely rendering overhead — every page re-runs hooks, useMemo filters, and AnimatePresence on mount. Investigate: React DevTools profiler to identify expensive re-renders, memoization gaps, or animation bottlenecks.

## Up Next

- [ ] **Detail panel slide-from-right** — Right now the detail panel just fades in/out. Wire up `detailPanelVariants` from `animations.ts` so it slides in from the right edge with spring physics (like a drawer), and slides back off-screen on close. Files: `DetailPanel.tsx`, `animations.ts`
- [ ] **Task completion celebration** — When you click "Done", the task row just disappears normally. Wire up `completionVariants` from `animations.ts` so the task shrinks slightly, slides right, and fades out — a satisfying "swept away" moment. Per feature spec section 5.4. Files: `TaskRow.tsx`, `animations.ts`
- [ ] **Staggered list entry** — All tasks appear at the exact same instant on load. Wire up `staggerContainer` from `animations.ts` so tasks cascade in top-to-bottom with 40ms delay between each. Only run on initial mount — not on re-renders or tab switches, to avoid feeling sluggish on repeat visits. Affects Today, Plan sections, History. Files: `today/page.tsx`, `plan/page.tsx`, `history/page.tsx`, `animations.ts`
- [ ] **Animate instant-appearing dropdowns** — Several menus pop in/out with zero animation: TaskActions "More" menu, size picker in TaskDetailMeta, tag autocomplete in TagInput, subtask add/delete in SubtaskList. Add scale+opacity animation matching the existing ContextMenu pattern (100ms). Files: `TaskActions.tsx`, `TaskDetailMeta.tsx`, `TagInput.tsx`, `SubtaskList.tsx`
- [ ] **TodayEmptyState fade** — The planning prompt appears/disappears with a hard cut when the Today list empties or fills. Add a fade transition using `fadeInVariants` from `animations.ts`. Files: `TodayEmptyState.tsx`, `today/page.tsx`
- [ ] **Due date on Today task rows** — Due date is only shown on `variant === 'upcoming'` rows. Show it inline on Today rows too (subtle, same style). Files: `TaskRow.tsx`
- [ ] **Clear task selection on nav switch** — `selectedTaskId` persists across navigation, leaving the detail panel open when switching views. Call `selectTask(null)` on route change to close the panel and deselect. Files: `useAppStore.tsx`, `app/(app)/layout.tsx` or individual page components
- [ ] **Adjust task dimming when selected** — Unselected tasks fade to 0.45 opacity which hurts readability. Option A: raise to ~0.65. Option B: instead of fading others, emphasise the selected task (background highlight / left border accent) and leave others at full opacity. Leaning toward B. Files: `TaskRow.tsx`, possibly `globals.css`

## Later

- [ ] **Notes linked to projects** — Optional `project_id` on notes. Filter notes by project in sidebar. Requires schema change (add `project_id` FK to `notes` table), type update, API/hooks update, and Notes page UI for project picker + filtering. Files: `types/index.ts`, `lib/api/notes.ts`, `lib/hooks/queries/useNotes.ts`, `notes/page.tsx`, Supabase migration
- [ ] **Pin task to top of Today** — One pinned task at the top of Today with visual emphasis. Add `pinned` boolean to tasks table, pin/unpin action in context menu and detail panel, pinned tasks sort to top. Files: `types/index.ts`, `lib/api/tasks.ts`, `useTasks.ts`, `TaskRow.tsx`, `today/page.tsx`, Supabase migration
- [ ] **Completion reflection** — Optional one-liner when marking a task done ("Any thoughts?"). New `reflection` text field on `tasks` table. Small inline input or modal on completion. Surfaces in History view and weekly review. Files: `types/index.ts`, `lib/api/tasks.ts`, `useTasks.ts`, `DetailPanel.tsx` or `TaskActions.tsx`, `history/page.tsx`, Supabase migration
- [ ] **Weekly review page** — Read-only reflection surface at `/review`. Shows: tasks completed this week, tasks let go, tasks carried forward, subtask completion % per project. Weekly/monthly toggle. Files: new `app/(app)/review/page.tsx`, `Sidebar.tsx`, queries against existing task data
- [ ] **ContentArea layout transition** — No transition when the detail panel opens and the main content narrows. Add a smooth width animation. Files: `ContentArea.tsx`
- [ ] **SidebarProjects entry animation** — No animation when a new project is created in the sidebar list. Add a subtle enter animation. Files: `SidebarProjects.tsx`
- [ ] **Carried forward increment** — `days_on_today` never actually increments. No overnight check or on-load logic exists to count consecutive days a task stays on Today. Carried-forward badges ("Day 3", "Day 4") never appear. Needs client-side logic on app load to compare current date against task's last update and increment accordingly. Files: `lib/utils/carriedForward.ts`, `useTasks.ts`
- [ ] **Delete confirmation in History** — Deleting a task from History is permanent but has no "are you sure?" confirmation dialog. Just fires immediately with a toast. Add a confirmation step. Files: `history/page.tsx`
- [ ] **Clean up dead code** — Delete unused `decayOpacity` from `animations.ts` (components use `getDecayOpacity()` from `decay.ts`), delete stale `AppUIState` type from `types/index.ts` (store uses its own inline interface), delete empty `src/components/animations/` directory. Files: `animations.ts`, `types/index.ts`, `src/components/animations/`
- [ ] **On This Day** — Tasks completed on this date in previous months/years. Personal, self-referential content. Long-term feature, needs accumulated history to be meaningful. Files: new component, queries against `completed_at` field
- [ ] Recurring tasks (V2)
- [ ] Account switcher (V2)
- [ ] Data export (V2)
- [ ] Mobile-optimised layout (V2)

## Done

- [x] **Sync specs and cleanup** — Moved specs to `docs/`, synced with codebase, removed capture context nudge, set up BACKLOG.md and backlog workflow. Branch: `chore/sync-specs-and-cleanup`
- [x] **Fix AnimatePresence exit animations** — CaptureModal and SearchPalette returned null before AnimatePresence could run exit animations, causing modals to vanish instantly on close. Moved conditional inside AnimatePresence. Branch: `fix/animatepresence-exit-animations`
- [x] **Fix tag sharing bug** — Missing UPDATE RLS policy on `tags` and `task_tags` tables. Added policies in Supabase + improved optimistic update to reuse existing tag ID from cache. Branch: `fix/bugs-tags-counter-notes`
- [x] **Fix done-today counter** — Counter was plain useState with no persistence. Refactored to derive count from `completed_at` field in task data — works from any page, survives refresh. Branch: `fix/bugs-tags-counter-notes`
- [x] **Fix notes editing** — Missing UPDATE RLS policy on `notes` table. Added policy in Supabase. Branch: `fix/bugs-tags-counter-notes`
