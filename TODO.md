# Tempus — TODO

## Completed
- [x] Step 1 — Init + Setup (Next.js, Tailwind, Supabase schema, utilities)
- [x] Step 2 — App Shell (Sidebar, TopBar, CaptureBar, DetailPanel, keyboard shortcuts)
- [x] Step 3 — Today View (TaskRow, drag reorder, heavy day indicator)
- [x] Step 4 — Detail Panel (editable title, size picker, notes, subtasks, actions)
- [x] Step 5 — Plan View (Inbox/Upcoming/Waiting/Someday sections, context menus)
- [x] Step 6 — Notes View (markdown editor, live preview, convert to task)
- [x] Step 7 — History View (Completed/Let Go tabs, search, restore, delete)
- [x] Step 8 — Global Search (Cmd+K palette, tasks/notes/tags search)
- [x] Step 9 — Projects CRUD (sidebar create, colour picker, archive, filter)
- [x] Step 10 — Polish Pass (capture modal, context menus, task fade, project fade)
- [x] Step 11 — Smart Behaviours (carried-forward badge, decay buttons, first-step nudge)
- [x] Step 12 — Tags (TagInput, filter pills, autocomplete, search integration)
- [x] Step 13 — Due Date Editing (DatePicker, quick picks, detail panel integration)
- [x] Step 14 — Drag Enhancements (Plan cross-section drag, subtask reorder, grip handles)
- [x] Step 15a — WaitingOnModal (replaced all window.prompt with styled modal)
- [x] Step 15b — Settings + Dark Mode + Project Editing

## Remaining
- [ ] **Step 16 — Supabase Connection**
  - Replace mock data in useTaskStore with React Query + Supabase
  - Optimistic updates (update cache immediately, write to DB in background, revert on error)
  - One query client in root layout
  - `user_preferences` table for per-user settings (theme, thresholds, etc.)
  - Make Settings page behaviour values editable (write to user_preferences)

- [ ] **Step 17 — Auth**
  - Supabase Auth with email/password
  - Login/signup flow
  - RLS enforcement (each user sees only their data)
  - Middleware redirects unauthenticated users to login

- [ ] **UI Styling Pass** (separate from feature work)
  - Colours, fonts, spacing refinement
  - User wants to do this manually
