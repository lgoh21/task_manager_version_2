// types/index.ts — TypeScript types for the Tempus data model

export type TaskStatus =
  | 'inbox'
  | 'today'
  | 'someday'
  | 'upcoming'
  | 'waiting'
  | 'done'
  | 'let_go';

export type TaskSize = 'S' | 'M' | 'L';

// --- Database row types ---

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  size: TaskSize;
  due_date: string | null;
  project_id: string | null;
  notes: string | null;
  waiting_on: string | null;
  sort_order: number;
  days_on_today: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  user_id: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  text: string;
  done: boolean;
  sort_order: number;
}

export interface Project {
  id: string;
  name: string;
  colour: string;
  archived: boolean;
  user_id: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  user_id: string;
}

export interface TaskTag {
  task_id: string;
  tag_id: string;
}

export interface Note {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

// --- Derived / UI types ---

/** Task with its related data loaded */
export interface TaskWithRelations extends Task {
  subtasks: Subtask[];
  project: Project | null;
  tags: Tag[];
}

/** For creating a new task — only title is required */
export interface CreateTaskInput {
  title: string;
  status?: TaskStatus;
  size?: TaskSize;
  due_date?: string | null;
  project_id?: string | null;
  notes?: string | null;
  waiting_on?: string | null;
}

/** For updating an existing task */
export interface UpdateTaskInput {
  title?: string;
  status?: TaskStatus;
  size?: TaskSize;
  due_date?: string | null;
  project_id?: string | null;
  notes?: string | null;
  waiting_on?: string | null;
  sort_order?: number;
  days_on_today?: number;
  completed_at?: string | null;
  updated_at?: string;
}

/** For creating a subtask */
export interface CreateSubtaskInput {
  task_id: string;
  text: string;
}

/** For creating a project */
export interface CreateProjectInput {
  name: string;
  colour: string;
}

/** For creating a note */
export interface CreateNoteInput {
  content: string;
}

/** Decay stage for Someday tasks */
export type DecayStage = 'fresh' | 'slight_fade' | 'noticeable' | 'prompt' | 'fully_decayed';

/** UI state for the app shell */
export interface AppUIState {
  selectedTaskId: string | null;
  sidebarCollapsed: boolean;
  activeProjectFilter: string | null;
}
