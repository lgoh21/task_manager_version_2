// constants.ts — All behavioural constants. Never hardcode in components.

export const DECAY = {
  /** Days before opacity starts fading (Someday tasks only) */
  FADE_START_DAYS: 3,
  /** Days before "Xd old" label appears */
  LABEL_START_DAYS: 8,
  /** Days before "Still want this?" prompt appears */
  PROMPT_DAYS: 15,
  /** Days before fully decayed with Revive/Let Go actions */
  FULL_DECAY_DAYS: 30,

  /** Opacity values for each decay stage */
  OPACITY: {
    FULL: 1,
    SLIGHT_FADE: 0.85,
    NOTICEABLE_FADE: 0.6,
    NEAR_TRANSPARENT: 0.4,
    FULLY_DECAYED: 0.35,
  },
} as const;

export const HEAVY_DAY = {
  /** Total size weight threshold for "Heavy day" indicator */
  THRESHOLD: 9,
  /** Weight values per task size */
  WEIGHTS: { S: 1, M: 2, L: 4 } as const,
} as const;

export const CARRIED_FORWARD = {
  /** Days on Today before showing day count badge */
  SHOW_COUNT_AFTER_DAYS: 3,
} as const;

export const TOAST_DURATION_MS = 2500;

export const MAX_PROJECTS = 7;

/** Debounce for notes auto-save */
export const NOTES_DEBOUNCE_MS = 500;

/** Max subtasks before suggesting task split */
export const SUBTASK_SOFT_LIMIT = 10;

/** Task sizes */
export const TASK_SIZES = ['S', 'M', 'L'] as const;

/** Default task size */
export const DEFAULT_TASK_SIZE = 'M' as const;

/** Task statuses in lifecycle order */
export const TASK_STATUSES = [
  'inbox',
  'today',
  'someday',
  'upcoming',
  'waiting',
  'done',
  'let_go',
] as const;

/** Keyboard shortcuts */
export const SHORTCUTS = {
  CAPTURE: 'mod+n',
  SEARCH: 'mod+k',
  TOGGLE_SIDEBAR: 'mod+\\',
  CLOSE: 'Escape',
  SAVE_NOTE: 'mod+Enter',
} as const;
