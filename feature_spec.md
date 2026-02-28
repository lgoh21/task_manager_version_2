# Tempus — Feature Specification

> Your backlog cleans itself. Your tasks carry forward without judgement. Your app gets quieter over time, not louder.

**Version:** 3.0 (MVP)
**Last updated:** 28 Feb 2026

---

## 1. Product Overview

### What Tempus Is

Tempus is a personal task management app for knowledge workers. You open it, see what matters today, click into a task to work through it, and close it. It's designed for short daily use — a minute to plan your morning, quick check-ins throughout the day, a few seconds to capture something new.

### What Makes It Different

- **Task decay**: backlog tasks that sit untouched visually fade over time and eventually ask to be released. The backlog cleans itself.
- **Shame-free lifecycle**: no overdue badges, no streaks, no karma. Unfinished tasks carry forward without judgement. Missed recurring tasks vanish quietly.
- **Smart defaults, not prompts**: the app communicates through visual design — fading, opacity shifts, placeholder text. Never modals, wizards, or interruptions.

### What Tempus Does NOT Do

| Excluded Feature | Reason |
|---|---|
| Collaboration / sharing | Strictly personal. Shared features ruin personal workflow. |
| Calendar integration | Users keep using Outlook/Google Calendar. Tempus handles *what*, calendar handles *when exactly*. |
| Time tracking | Changes the mindset from "what to do" to "how long did it take." Different product. |
| AI auto-scheduling | Manual planning is the feature. Intentional, not automated. |
| Gamification (streaks, karma, points) | Directly contradicts shame-free philosophy. |
| Gantt charts / dependencies | Project management, not personal task management. |
| Custom fields / properties | Invites endless customisation and system-maintenance. Fixed, opinionated fields only. |
| Templates | Power-user feature that adds overhead for everyone. Use recurring tasks instead. |
| File attachments / storage | Not a document management system. Links in notes are sufficient. |
| Email integration | Conflates two inboxes. Users should process email in email, capture tasks manually. |

---

## 2. Core Concepts

### 2.1 Task Lifecycle

Every task flows through these states:

```
Capture bar → Inbox (scope it) → Someday/Upcoming (ready) → Today (doing it) → Done

Any state can enter → Waiting On (side state)

Done tasks → History (Completed)
Decayed/abandoned tasks → History (Let Go)
```

**States:**

| State | Description |
|---|---|
| **Inbox** | Where captured tasks land. Zero-friction entry point. Tasks stay here until the user scopes them and moves them out. Lives as a section within the Plan view. |
| **Today** | The user's plan for the day. The default view. If it's on Today, you're working on it. |
| **Someday** | The undated backlog. Tasks with no due date live here until pulled to Today. Subject to decay (see §5.1). |
| **Upcoming** | Tasks with a due date in the future. Sorted chronologically. |
| **Waiting On** | Side state. Task is blocked on someone or something external. Includes a "waiting on" note describing who/what is blocking. Can be entered from any state. |
| **Done** | Completed. Moves to History with "completed" status. |
| **Let Go** | Decided not to do. Moves to History with "let go" status. Distinct from completed. |

**There is no "In Progress" state.** If a task is on Today, you're working on it.

**Explicit delete:** Users can permanently delete a task at any time. This is separate from Done or Let Go. Done and Let Go are always recoverable from History. Delete is permanent.

### 2.2 Task Properties

Every task has the following fields:

| Field | Required | Description |
|---|---|---|
| **Title** | Yes | Short description of the task. |
| **Due date** | No | The deadline — when the task must be delivered. This is NOT a planning date. Planning happens by moving tasks to Today. Supports optional time for time-bound deliverables (e.g. "Thu 2pm"). Shown as a subtle badge. |
| **Size** | No | T-shirt size: **S** (quick, < 1h), **M** (a few hours), **L** (deep work, half day). Defaults to M if not set. |
| **Project** | No | Optional colour-coded grouping (see §2.4). Untagged tasks are fine. |
| **Tags** | No | Freeform tags for cross-cutting categorisation (e.g. "#client-facing", "#deep-work", "#quick-win"). Useful for filtering and patterns. |
| **Notes** | No | Free-text field on the task for context, links, thinking. Supports live-rendered markdown (bold, links, bullet points, code blocks). Auto-saves. |
| **Subtasks** | No | Simple flat checklist. Text + checkbox. See §2.3. |
| **Waiting on** | No | Text field describing who/what is blocking. Only relevant when task is in Waiting On state. Displayed as a subtitle in list views so you can see at a glance what's blocking and why. |
| **Status** | Auto | The lifecycle state. |
| **Created date** | Auto | When the task was created. Used for decay calculations. |
| **Days on Today** | Auto | Counter tracking how many consecutive days a task has been on Today. Used for carried-forward indicator (see §5.2). |

**Fields that do NOT exist:** priority (implicit via list position), time estimate (size is enough), assignee (personal app), custom fields, dependencies.

### 2.3 Subtasks

- Flat checklist only. Text + checkbox.
- No properties on subtasks (no dates, sizes, or notes).
- Subtasks are reorderable via drag.
- Completing all subtasks does **not** auto-complete the parent task.
- Placeholder text on first subtask slot: *"What's the first step?"*
- Subtle hint below empty subtask list: *"Breaking it down makes it easier to start"*
- If a task accumulates more than ~10 subtasks, a gentle visual cue suggests it might be better as multiple tasks. No hard enforcement — just a subtle indicator.

### 2.4 Projects

Projects are lightweight, colour-coded groupings that tie related tasks together.

- A project is just a name + colour. No hierarchy, no properties, no status.
- Examples: "CBA — Feedback System", "Digital Twin Playbook", "Grad Onboarding"
- Tasks can optionally belong to one project.
- An untagged task (no project) is perfectly fine. Project is never required.
- Projects are created on the fly (type a name, pick a colour).
- Maximum ~7 active projects to prevent sprawl. Enforce gently through a limited colour palette.
- Projects can be archived when finished (hides from picker, existing tasks retain the label).
- Filtering by project shows all tasks in that project across all states.

**No parent grouping above projects.** If you're on a client for 6 months with multiple workstreams, create separate projects: "CBA — Feedback System", "CBA — Reporting", "CBA — Onboarding". Filter or search "CBA" to see everything. Naming convention over hierarchy.

### 2.5 Tags

- Freeform text tags, created on the fly.
- A task can have multiple tags.
- Tags are cross-cutting — they work across projects and states.
- Useful for patterns like "#deep-work", "#client-facing", "#quick-win".
- Filterable in views.
- No tag management UI needed in v1. Tags exist as typed. Autocomplete from previously used tags.

### 2.6 Recurring Tasks

- Recurring tasks appear on their scheduled day in Today.
- Recurrence patterns: daily, weekly, every X weeks, monthly, custom day selection (e.g. "Mon, Wed, Fri").
- Creation uses natural language where possible: "every Monday", "first of month", "every 2 weeks."
- **If not completed by end of day (midnight), the task vanishes.** No rollover, no stacking, no overdue badge. The task remains visible for its entire assigned day, then disappears overnight.
- The next occurrence generates normally on the next scheduled date.
- **No streaks, no karma, no completion percentages.**
- Optional **"Carry forward if missed"** toggle for critical recurrences (e.g. timesheets). These behave like normal carried-forward tasks if not completed.

---

## 3. App Structure & Navigation

### 3.1 Navigation

The app uses a **collapsible text sidebar** on the left.

**Sidebar layout (expanded):**

```
┌─────────────────────┐
│ [▼ Work]        [><] │  ← Account switcher (V2) + collapse toggle
│                      │
│ Today                │  ← Primary nav
│ Plan (3)             │  ← Count badge = Inbox items needing scoping
│                      │
│ PROJECTS             │  ← Section header
│ ● CBA — Feedback     │  ← Active projects listed directly
│ ● Digital Twin       │
│ ● Grad Onboarding    │
│ ● MCP Apps           │
│                      │
│ Notes                │  ← Secondary nav
│ History              │
│                      │
│ Settings             │  ← Utility (bottom)
└─────────────────────┘
```

**Sidebar behaviour:**
- **Expanded**: text labels for all nav items, active projects listed directly with colour dots. This is the default state.
- **Collapsed**: narrow icon-only rail. Toggle via collapse button or keyboard shortcut.
- Collapse state persists between sessions.
- Active view is highlighted.

**Sidebar items:**

| Item | Description |
|---|---|
| **Today** | Default view. Today's tasks only. |
| **Plan** | Planning and triage view. Contains Inbox, Upcoming, Someday, Waiting On sections. Shows count badge when Inbox has items. |
| **Notes** | Standalone brain dump journal. |
| **History** | Completed and Let Go tasks. |

**Projects in sidebar:**
- Lists all active projects with their colour dot.
- Click a project → filters the current view to that project's tasks.
- "+" button to create a new project inline.
- Archived projects are hidden.

**Account switcher (V2):**
- Dropdown in the top-left corner (e.g. "▼ Work").
- Switch between completely separate accounts (e.g. Work, Personal).
- Each account has its own tasks, projects, notes, history. Fully isolated.
- MVP ships with a single account.

### 3.2 Top Area

Visible across all views:

- **Capture bar** (always visible — see §6)
- **Done-today counter** (subtle, increments with each completion)
- **User avatar** (settings access)

### 3.3 Layout

**Two-column maximum:**
- Left: the active view content (Today, Plan, Notes, or History)
- Right: detail panel (slides in when a task is clicked)

When no task is selected, the view content takes full width. When a task is selected, the detail panel appears and the view content narrows.

---

## 4. Views

### 4.1 Today View (Default)

The app always opens here. Shows **only** tasks with status = Today. Nothing else.

**Layout:**
- **Header**: "Today" + day/date + optional heavy day indicator (see §5.3)
- **Task list**: flat list of Today's tasks, ordered by user (drag to reorder)

**Task interactions:**
- **Click a task** → detail panel opens on the right (see §4.5)
- **Drag tasks** → reorder within the list
- **Context menu (right-click / long-press)** → Move to Someday, Move to Waiting On, Complete, Delete

**Empty state (first open of the day with no tasks planned):**

The empty Today view becomes a lightweight planning prompt:

> "What are you focusing on today?"

Below this, show a condensed preview of:
- **Inbox** tasks (if any) — with count
- **Tasks with due dates this week** — sorted by date
- **Recent Someday tasks** — top 5 by most recently created/edited

Each task in this preview has a simple **"+ Today"** button to pull it in. Once the user adds at least one task to Today, this planning surface disappears and the normal Today view takes over.

**This only appears on the first open of the day when Today is empty.** It is not a modal or wizard — it's the empty state content. If the user ignores it and navigates to Plan or captures a task, that's fine.

**Carried-forward tasks:** Tasks that were on Today yesterday and weren't completed remain on Today the next morning with a "carried over" badge (see §5.2).

### 4.2 Plan View

The planning and triage surface. Everything that isn't on Today or Done lives here.

**Sections (each collapsible, collapse state persists between sessions):**

1. **Inbox** — recently captured tasks awaiting scoping. Distinct visual treatment to signal "these need attention." A badge reading "needs scoping" appears next to the section header. The count of Inbox items also shows on the Plan sidebar item as a badge.

2. **Upcoming** — tasks with a due date in the future, sorted chronologically.

3. **Waiting On** — tasks currently blocked. Each shows the "waiting on" text as a subtitle directly in the list, so you can see at a glance who/what is blocking. Example: *"Get API access — Waiting on Platform team, PLAT-445"*

4. **Someday** — undated backlog. Subject to decay (see §5.1). Sorted by most recently created/edited.

**Task interactions (consistent across all sections):**
- **Click a task** → detail panel opens on the right. Always. Clicking never moves a task.
- **Context menu (right-click / long-press)** → Move to Today, Move to Someday, Waiting On, Complete, Delete. This is the primary way to move tasks between states.
- **Drag tasks** → drag between sections to change state

**Filtering:**
- When a project is selected in the sidebar, Plan view filters to only that project's tasks across all sections.
- Tag filter available via a filter dropdown or search.

### 4.3 Notes View

A standalone journal for thoughts not connected to any task. Brain dumps, meeting notes, ideas, brainstorming.

**Layout:**
- **Input area** at the top: multi-line text field with live markdown rendering. Placeholder: *"Brain dump... ideas, meeting notes, anything"*
- **Save action**: ⌘Enter or "Save" button
- **Below**: reverse-chronological list of saved notes

**Note properties:**
- Text content with live-rendered markdown (bold, italic, links, bullet points, code blocks). Renders inline as you type — you see formatted output, not raw markdown.
- Timestamp (auto-generated on save).
- No titles. Notes are just timestamped text entries.
- No tags, no categories.
- Notes can be deleted individually.
- **Convert to task**: option on any note to create a new task in Inbox with the note text as the description. The note remains in Notes.

### 4.4 History View

All completed and let-go tasks.

**Two tabs within History:**
- **Completed** — tasks marked Done. These are accomplishments.
- **Let Go** — tasks that were decayed and released, or explicitly abandoned. These are decisions, not failures.

**Layout:**
- Reverse chronological (most recent first)
- Each entry shows: title, project (if any), completion/let-go date
- Click to expand and see full detail (read-only)
- **Restore** action: moves task back to Inbox
- **Delete** action: permanently removes (with confirmation)
- Search within History

**"Done this week" summary** at the top: count of tasks completed this week.

### 4.5 Detail Panel

Slides in from the right when any task is clicked. **Identical panel regardless of which view the task was clicked from.** Click a task in Today, Plan, or History — same panel every time.

**Panel layout (top to bottom):**

1. **Header row**
   - Status badge (if Waiting On)
   - Project pill (colour dot + name, if assigned)
   - Tags (if any)
   - Close button (✕)

2. **Title**
   - Large, editorial font. Editable inline (click to edit).

3. **Meta row**
   - Size pill (S/M/L)
   - Due date badge (if set, with optional time; becomes more prominent as date approaches)
   - "Carried over · Day 3" badge (if applicable — see §5.2)

4. **Notes field**
   - Free-text area with **live markdown rendering**. As the user types, markdown renders inline (bold appears bold, links become clickable, bullets format properly).
   - Auto-saves after brief debounce. No save button.
   - Placeholder: *"Add context, links, thoughts..."*
   - First time opening a newly captured task, a subtle dismissible line appears above the notes field: *"Got 2 minutes? Add some context while it's fresh."* Disappears once the user adds content or dismisses it.

5. **Subtasks**
   - Checklist with checkboxes
   - Progress count in header (e.g. "2/5")
   - Add-step input at bottom with placeholder: *"What's the first step?"* (first subtask) or *"Add a step..."* (subsequent)
   - Hint below empty list: *"Breaking it down makes it easier to start"*
   - Drag to reorder

6. **Waiting On section** (only visible when task is in Waiting On state)
   - Shows the "waiting on" text in a distinct styled block
   - Editable inline

**Bottom action bar** (fixed at bottom of panel, always visible while scrolling):

| Button | Action |
|---|---|
| **↑ Move to Today** | Moves task to Today (visible when task is not already on Today) |
| **Waiting on...** | Enters Waiting On state. Prompts for who/what text. |
| **Unblock** | (Only shown when task is Waiting On) Returns task to previous state. |
| **Done** | Completes the task. Triggers celebration animation (see §5.4). Closes panel. |
| **More (⋯)** | Opens menu with: Move to Someday, Let Go, Delete |

**Key behaviours:**
- Notes auto-save. No save button needed.
- Title is editable inline (click to edit).
- All fields (due date, size, project, tags) are editable inline within the panel.
- Panel closes with ✕ button, Escape key, or clicking outside.

---

## 5. Smart Behaviours

These behaviours make Tempus feel intelligent without ever interrupting the user.

### 5.1 Task Decay

Applies to **Someday tasks only** (not Inbox, Today, Upcoming, Waiting On, or Done).

| Days Untouched | Effect |
|---|---|
| 0–3 days | Full opacity. Normal appearance. |
| 4–7 days | Slight fade. ~85% opacity. |
| 8–14 days | Noticeable fade. ~60% opacity. Subtle "Xd old" label appears. |
| 15–30 days | Near-transparent. ~40% opacity. "Still want this?" label appears. |
| 30+ days | Fully decayed. "Still want this?" with **Revive** and **Let go** action buttons inline. |

**Revive:** Resets the decay clock. Task returns to full opacity. Remains in Someday.

**Let go:** Moves the task to History with "let go" status. Recoverable from History.

**Decay clock resets when:**
- The task is edited (title, notes, subtasks)
- The task is moved to any other state
- The user explicitly revives it

**Decay never applies to:** Inbox, Today, Upcoming (has a due date), Waiting On, or History tasks.

### 5.2 Carried Forward

When a task is on Today and the day ends without completion:

- The task **remains on Today** the next morning.
- A **"carried over"** badge appears. Informational, not punitive.
- After the task has been on Today for **3+ consecutive days**, the badge updates to show the count: "Day 3", "Day 4", etc. This is information — not guilt.
- The badge and counter disappear when the user interacts with the task (completes, edits, or explicitly moves it).
- **Carried-forward tasks do not decay.**

### 5.3 Heavy Day Indicator

When the total size weight of Today's tasks exceeds a threshold, a subtle indicator appears in the Today view header.

**Weight calculation:**
- S = 1, M = 2, L = 4
- Threshold: **9 points** (e.g. 2 Large + 1 Small, or 4 Medium + 1 Small)

**The indicator:**
- A small pill next to the Today header: *"Heavy day"*
- Subtle, not alarming
- No modal, no popup, no blocking interaction. Just visible.
- Disappears when tasks are completed or moved off Today.

### 5.4 Completion Celebration

When a task is marked Done:

- **Custom animation**: the task card has a satisfying visual transition — a smooth slide, shrink, or dissolve effect. This should feel polished and premium. The specific animation deserves dedicated design attention during build. The goal is a micro-moment of "that felt good."
- A **toast notification** appears briefly at the bottom: ✓ *"[truncated task title] done"*
- The **done-today counter** increments.
- Toast auto-dismisses after ~2.5 seconds.
- No sound by default.

### 5.5 First Step Nudge

When a task has **no subtasks and no notes content** after a few days in Someday:

- A subtle visual indicator appears on the task in list views (e.g. a faint dotted outline or muted icon).
- Signals "this task might need breaking down" without text or interruption.
- In the detail panel, the subtask placeholder always reads *"What's the first step?"*

**Passive, not active.** No notification, no modal.

### 5.6 Capture Context Nudge

When a user captures a new task via the capture bar and the detail panel opens:

- A subtle, dismissible line appears at the top of the detail panel: *"Got 2 minutes? Add some context while it's fresh."*
- Disappears permanently for that task once the user adds any content or dismisses it.
- One-time nudge per task.

---

## 6. Capture Bar

Always visible at the top of the app across all views.

- Single text input field with "+" icon and placeholder: *"Capture a task..."*
- Type a title, press Enter → task is created in **Inbox** (within Plan view)
- The detail panel opens immediately for the new task, with the context nudge (§5.6)
- If the user just presses Enter and navigates away, the task lives in Inbox with just a title. That's valid.
- **Keyboard shortcut:** ⌘N focuses the capture bar from anywhere
- **Target: under 2 seconds from thought to captured task.**

---

## 7. Search & Filtering

### 7.1 Global Search

- Accessible via **⌘K** or a search icon
- Searches across: task titles, task notes, subtask text, standalone notes, tags
- Includes active tasks AND History
- Results show the task/note with context snippet and which state/view it's in
- Clicking a result opens the detail panel (for tasks) or navigates to the note

### 7.2 Filtering

- **Project filter**: click a project in the sidebar to filter the current view to that project's tasks. Click again to clear.
- **Tag filter**: available via a filter dropdown or by typing in search.
- Active filters are visually clear.

---

## 8. Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| ⌘N | Focus capture bar |
| ⌘K | Open global search |
| ⌘\\ | Toggle sidebar collapse |
| Escape | Close detail panel / close search |
| Enter (in capture bar) | Create task |
| ⌘Enter (in notes view) | Save note |

Additional shortcuts can be added post-MVP based on usage patterns.

---

## 9. Data Principles

- **Tasks are never auto-deleted.** Only explicit user action removes a task permanently.
- **"Let go" is not delete.** It moves to History, recoverable.
- **"Done" is not delete.** Completed tasks are always in History.
- **Delete is permanent** and requires confirmation.
- **All data should be exportable** (JSON, CSV, or markdown). Users should never feel locked in.
- **Offline support is desirable.** The app should work without internet, syncing when connection returns.
- **View state persists between sessions** (collapsed sections, active filters, sidebar state).

---

## 10. MVP Scope

### Build First (MVP)

- Task lifecycle: Inbox, Today, Someday, Upcoming, Waiting On, Done, Let Go
- All task fields: title, due date (with optional time), size, project, tags, notes (live markdown), subtasks, waiting on
- Collapsible text sidebar: Today, Plan, Notes, History + Projects list
- Today view with empty-state planning prompt
- Plan view with Inbox, Upcoming, Waiting On, Someday sections
- Detail panel (identical from all views)
- Capture bar with instant task creation
- Task decay on Someday tasks
- Carried-forward behaviour with day counter
- Heavy day indicator
- Completion celebration (toast + animation)
- Done-today counter
- First step nudge (placeholder text + visual cue)
- Capture context nudge
- Projects (create, colour, archive, filter via sidebar)
- Tags (freeform, filter)
- Notes view (append-only journal with live markdown, note-to-task conversion)
- History view (Completed + Let Go tabs, restore, delete, search)
- Global search
- Keyboard shortcuts
- Drag to reorder within Today
- Context menu for task state changes
- Drag between sections in Plan view

### Build Later (V2 Candidates)

- Account switcher (Work / Personal as separate accounts)
- Recurring tasks (with "carry forward if missed" toggle)
- Weekly planning view
- Calendar integration (read-only meeting display)
- Data export (JSON, CSV, markdown)
- Import from other tools
- Mobile-optimised layout
- Offline support with sync

---

## 11. Design Principles

For whoever builds this:

1. **Today is always the answer.** The app opens to Today. When in doubt about what to show, show Today.
2. **Click for depth.** Any task, from any view, opens the same detail panel. One interaction pattern everywhere.
3. **Visual, not verbal.** Communicate through fading, opacity, spacing, and placeholder text. Never through modals, popups, or instructional copy.
4. **Earn every field.** If a field can be optional, it must be. If a field isn't used by most tasks, question whether it should exist.
5. **Empty is calm.** An empty Today view is not a problem — it's an invitation to plan.
6. **Celebrate, don't punish.** Show what was accomplished (done counter, toast, animation). Never show what wasn't (no overdue badges, no missed counts, no broken streaks).
7. **The capture bar is sacred.** Under 2 seconds from thought to captured task. Never add required fields. Never put capture behind a modal.
8. **Respect the backlog.** Someday is not a graveyard. Decay keeps it honest. If a task is there, it should still be wanted.
9. **One way to do each thing.** Don't offer three ways to move a task to Today. Context menu and drag. That's it.
10. **The detail panel is the workhorse.** Everything about a task lives in one place. It should feel like opening a focused workspace for that single task.
