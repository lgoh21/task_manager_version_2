# Backlog

## In Progress

## Bugs

## Performance

## Up Next
- [ ] **Completion reflection** — Optional one-liner when marking a task done ("Any thoughts?"). New `reflection` text field on `tasks` table. Small inline input or modal on completion. Surfaces in History view and weekly review. Files: `types/index.ts`, `lib/api/tasks.ts`, `useTasks.ts`, `DetailPanel.tsx` or `TaskActions.tsx`, `history/page.tsx`, Supabase migration
- [ ] **Weekly review page** — Read-only reflection surface at `/review`. Shows: tasks completed this week, tasks let go, tasks carried forward, subtask completion % per project. Weekly/monthly toggle. Files: new `app/(app)/review/page.tsx`, `Sidebar.tsx`, queries against existing task data
- [ ] **On This Day** — Tasks completed on this date in previous months/years. Personal, self-referential content. Files: new component, queries against `completed_at`
- [ ] **Pin task to top of Today** — One pinned task at the top of Today with visual emphasis. Add `pinned` boolean to tasks table, pin/unpin action in context menu and detail panel, pinned tasks sort to top. Files: `types/index.ts`, `lib/api/tasks.ts`, `useTasks.ts`, `TaskRow.tsx`, `today/page.tsx`, Supabase migration
- [ ] **Carried forward indicator** — Replace the never-incrementing `days_on_today` counter with a `moved_to_today_at` timestamp. Set it whenever status changes to `'today'`, then compute days carried forward as calendar-day difference (not 24h). Resets naturally on any status change back to today (e.g. today → waiting → today). The badge is a simple duration indicator ("Day 3"), not a nudge — just shows how long you've been working on something. Remove `days_on_today` column once migrated. Files: `types/index.ts`, `lib/utils/carriedForward.ts`, `lib/api/tasks.ts`, `useTasks.ts`, Supabase migration

## Projects Enhancement

- [ ] **Custom project colours** — Replace fixed 7-colour palette with a full colour picker. Add a colour picker bar below the current swatches in ProjectEditModal. Files: `ProjectEditModal.tsx`
- [ ] **Configurable max projects** — Remove or raise the hardcoded 7-project limit. Allow users to create more projects. Files: `SidebarProjects.tsx`, `config/constants.ts`

## Animation Polish

- [ ] **Detail panel slide-from-right** — Wire up `detailPanelVariants` from `animations.ts` so it slides in from the right edge with spring physics (like a drawer). Files: `DetailPanel.tsx`, `animations.ts`
- [ ] **Task completion celebration** — Wire up `completionVariants` from `animations.ts` so the task shrinks slightly, slides right, and fades out. Files: `TaskRow.tsx`, `animations.ts`
- [ ] **Staggered list entry** — Wire up `staggerContainer` from `animations.ts` so tasks cascade in top-to-bottom with 40ms delay. Only on initial mount, not re-renders. Files: `today/page.tsx`, `plan/page.tsx`, `history/page.tsx`, `animations.ts`
- [ ] **Animate instant-appearing dropdowns** — Add scale+opacity animation to TaskActions menu, size picker, tag autocomplete, subtask add/delete. Files: `TaskActions.tsx`, `TaskDetailMeta.tsx`, `TagInput.tsx`, `SubtaskList.tsx`
- [ ] **TodayEmptyState fade** — Add fade transition using `fadeInVariants`. Files: `TodayEmptyState.tsx`, `today/page.tsx`
- [ ] **ContentArea layout transition** — Smooth width animation when detail panel opens/closes. Files: `ContentArea.tsx`
- [ ] **SidebarProjects entry animation** — Subtle enter animation for new projects. Files: `SidebarProjects.tsx`

## Later

- [ ] **Delete confirmation in History** — Add "are you sure?" confirmation before permanent delete. Files: `history/page.tsx`
- [ ] **Clean up dead code** — Delete unused `decayOpacity` from `animations.ts`, stale `AppUIState` type from `types/index.ts`, empty `src/components/animations/` directory.
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
- [x] **Fix tab switch latency** — Wrapped TaskRow in React.memo, extracted selection state from context to props, removed Framer Motion `layout` prop, added `initial={false}` to AnimatePresence blocks. Branch: `fix/ui-polish-and-perf`
- [x] **Fix general rendering lag** — Same changes as tab switch — React.memo prevents 50+ TaskRow re-renders on selection change, stable callbacks on Plan page. Branch: `fix/ui-polish-and-perf`
- [x] **Due date on task rows** — Due date now shows inline on any task row that has one, not just upcoming. Branch: `fix/ui-polish-and-perf`
- [x] **Clear task selection on nav switch** — ContentArea clears selectedTaskId on pathname change. Branch: `fix/ui-polish-and-perf`
- [x] **Adjust task dimming when selected** — Raised unselected task opacity floor from 0.45 to 0.75 for better readability. Branch: `fix/ui-polish-and-perf`
- [x] **Project dashboard in detail panel** — Full project dashboard with editable name, stats grid, description, activity timeline, linked notes, and lifecycle actions (finish/archive). Branch: `feature/project-dashboard`
- [x] **Project lifecycle: active → finished → archived** — Projects gain three states with DB migration. Branch: `feature/project-dashboard`
- [x] **Notes linked to projects** — Notes page filters by project, project picker on each note card, new notes auto-linked when filtering. Branch: `feature/project-dashboard`
- [x] **Moon phase icon fix** — Clamped terminator rx to prevent degenerate SVG arcs at quarter phases. Branch: `feature/project-dashboard`
- [x] **Activity timeline connector line** — Subtle vertical line behind timeline icons. Branch: `feature/project-dashboard`
