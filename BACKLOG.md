# Backlog

## In Progress

## Up Next

- [ ] **Detail panel slide-from-right** — Right now the detail panel just fades in/out. Wire up `detailPanelVariants` from `animations.ts` so it slides in from the right edge with spring physics (like a drawer), and slides back off-screen on close. Files: `DetailPanel.tsx`, `animations.ts`
- [ ] **Task completion celebration** — When you click "Done", the task row just disappears normally. Wire up `completionVariants` from `animations.ts` so the task shrinks slightly, slides right, and fades out — a satisfying "swept away" moment. Per feature spec section 5.4. Files: `TaskRow.tsx`, `animations.ts`
- [ ] **Staggered list entry** — All tasks appear at the exact same instant on load. Wire up `staggerContainer` from `animations.ts` so tasks cascade in top-to-bottom with 40ms delay between each. Only run on initial mount — not on re-renders or tab switches, to avoid feeling sluggish on repeat visits. Affects Today, Plan sections, History. Files: `today/page.tsx`, `plan/page.tsx`, `history/page.tsx`, `animations.ts`
- [ ] **Animate instant-appearing dropdowns** — Several menus pop in/out with zero animation: TaskActions "More" menu, size picker in TaskDetailMeta, tag autocomplete in TagInput, subtask add/delete in SubtaskList. Add scale+opacity animation matching the existing ContextMenu pattern (100ms). Files: `TaskActions.tsx`, `TaskDetailMeta.tsx`, `TagInput.tsx`, `SubtaskList.tsx`
- [ ] **TodayEmptyState fade** — The planning prompt appears/disappears with a hard cut when the Today list empties or fills. Add a fade transition using `fadeInVariants` from `animations.ts`. Files: `TodayEmptyState.tsx`, `today/page.tsx`

## Later

- [ ] **ContentArea layout transition** — No transition when the detail panel opens and the main content narrows. Add a smooth width animation. Files: `ContentArea.tsx`
- [ ] **SidebarProjects entry animation** — No animation when a new project is created in the sidebar list. Add a subtle enter animation. Files: `SidebarProjects.tsx`
- [ ] **Carried forward increment** — `days_on_today` never actually increments. No overnight check or on-load logic exists to count consecutive days a task stays on Today. Carried-forward badges ("Day 3", "Day 4") never appear. Needs client-side logic on app load to compare current date against task's last update and increment accordingly. Files: `lib/utils/carriedForward.ts`, `useTasks.ts`
- [ ] **Delete confirmation in History** — Deleting a task from History is permanent but has no "are you sure?" confirmation dialog. Just fires immediately with a toast. Add a confirmation step. Files: `history/page.tsx`
- [ ] **Clean up dead code** — Delete unused `decayOpacity` from `animations.ts` (components use `getDecayOpacity()` from `decay.ts`), delete stale `AppUIState` type from `types/index.ts` (store uses its own inline interface), delete empty `src/components/animations/` directory. Files: `animations.ts`, `types/index.ts`, `src/components/animations/`
- [ ] Recurring tasks (V2)
- [ ] Account switcher (V2)
- [ ] Data export (V2)
- [ ] Mobile-optimised layout (V2)

## Done

- [x] **Sync specs and cleanup** — Moved specs to `docs/`, synced with codebase, removed capture context nudge, set up BACKLOG.md and backlog workflow. Branch: `chore/sync-specs-and-cleanup`
- [x] **Fix AnimatePresence exit animations** — CaptureModal and SearchPalette returned null before AnimatePresence could run exit animations, causing modals to vanish instantly on close. Moved conditional inside AnimatePresence. Branch: `fix/animatepresence-exit-animations`
