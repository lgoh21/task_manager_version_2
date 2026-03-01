// useTaskStore.tsx — Shared task state context
// Currently backed by mock data. Will be replaced by React Query + Supabase.

'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { Task, Project, Subtask, Note } from '@/types';
import { MAX_PROJECTS } from '@/config/constants';

const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'CBA — Feedback', colour: '#3B82F6', archived: false, user_id: 'mock', created_at: '2026-02-20T00:00:00Z' },
  { id: 'p2', name: 'Digital Twin', colour: '#8B5CF6', archived: false, user_id: 'mock', created_at: '2026-02-18T00:00:00Z' },
  { id: 'p3', name: 'Grad Onboarding', colour: '#10B981', archived: false, user_id: 'mock', created_at: '2026-02-15T00:00:00Z' },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 't1', title: 'Review API design doc', status: 'today', size: 'M',
    due_date: null, project_id: 'p1', notes: null, waiting_on: null,
    sort_order: 0, days_on_today: 0, created_at: '2026-02-28T08:00:00Z',
    updated_at: '2026-02-28T08:00:00Z', completed_at: null, user_id: 'mock',
  },
  {
    id: 't2', title: 'Prepare workshop slides', status: 'today', size: 'L',
    due_date: '2026-03-02T14:00:00Z', project_id: 'p2', notes: 'Focus on the demo section', waiting_on: null,
    sort_order: 1, days_on_today: 2, created_at: '2026-02-25T10:00:00Z',
    updated_at: '2026-02-26T09:00:00Z', completed_at: null, user_id: 'mock',
  },
  {
    id: 't3', title: 'Reply to Sarah about onboarding timeline', status: 'today', size: 'S',
    due_date: null, project_id: 'p3', notes: null, waiting_on: null,
    sort_order: 2, days_on_today: 0, created_at: '2026-02-28T07:00:00Z',
    updated_at: '2026-02-28T07:00:00Z', completed_at: null, user_id: 'mock',
  },
  {
    id: 't4', title: 'Fix auth token refresh bug', status: 'today', size: 'M',
    due_date: null, project_id: 'p1', notes: '**Steps to reproduce:**\n- Login\n- Wait 30 min\n- Token expires silently', waiting_on: null,
    sort_order: 3, days_on_today: 4, created_at: '2026-02-22T10:00:00Z',
    updated_at: '2026-02-24T14:00:00Z', completed_at: null, user_id: 'mock',
  },
  {
    id: 't5', title: 'Look into new monitoring tool', status: 'inbox', size: 'M',
    due_date: null, project_id: null, notes: null, waiting_on: null,
    sort_order: 0, days_on_today: 0, created_at: '2026-02-28T09:00:00Z',
    updated_at: '2026-02-28T09:00:00Z', completed_at: null, user_id: 'mock',
  },
  {
    id: 't6', title: 'Book team lunch venue', status: 'inbox', size: 'S',
    due_date: null, project_id: null, notes: null, waiting_on: null,
    sort_order: 1, days_on_today: 0, created_at: '2026-02-27T16:00:00Z',
    updated_at: '2026-02-27T16:00:00Z', completed_at: null, user_id: 'mock',
  },
  {
    id: 't7', title: 'Write blog post about system design', status: 'someday', size: 'L',
    due_date: null, project_id: null, notes: null, waiting_on: null,
    sort_order: 0, days_on_today: 0, created_at: '2026-02-20T10:00:00Z',
    updated_at: '2026-02-20T10:00:00Z', completed_at: null, user_id: 'mock',
  },
  {
    id: 't8', title: 'Research GraphQL federation', status: 'someday', size: 'M',
    due_date: null, project_id: 'p2', notes: null, waiting_on: null,
    sort_order: 1, days_on_today: 0, created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-02-10T10:00:00Z', completed_at: null, user_id: 'mock',
  },
  {
    id: 't9', title: 'Update personal site portfolio', status: 'someday', size: 'M',
    due_date: null, project_id: null, notes: null, waiting_on: null,
    sort_order: 2, days_on_today: 0, created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z', completed_at: null, user_id: 'mock',
  },
  {
    id: 't10', title: 'Submit quarterly report', status: 'upcoming', size: 'L',
    due_date: '2026-03-05T17:00:00Z', project_id: 'p1', notes: null, waiting_on: null,
    sort_order: 0, days_on_today: 0, created_at: '2026-02-20T10:00:00Z',
    updated_at: '2026-02-20T10:00:00Z', completed_at: null, user_id: 'mock',
  },
  {
    id: 't11', title: 'Get API access for staging', status: 'waiting', size: 'S',
    due_date: null, project_id: 'p1', notes: null, waiting_on: 'Platform team — PLAT-445',
    sort_order: 0, days_on_today: 0, created_at: '2026-02-24T10:00:00Z',
    updated_at: '2026-02-24T10:00:00Z', completed_at: null, user_id: 'mock',
  },
  {
    id: 't12', title: 'Client presentation review', status: 'upcoming', size: 'M',
    due_date: '2026-03-10T10:00:00Z', project_id: 'p2', notes: null, waiting_on: null,
    sort_order: 1, days_on_today: 0, created_at: '2026-02-25T10:00:00Z',
    updated_at: '2026-02-25T10:00:00Z', completed_at: null, user_id: 'mock',
  },
  {
    id: 't13', title: 'Confirm venue for offsite', status: 'waiting', size: 'M',
    due_date: null, project_id: 'p3', notes: null, waiting_on: 'HR team — budget approval',
    sort_order: 1, days_on_today: 0, created_at: '2026-02-22T10:00:00Z',
    updated_at: '2026-02-22T10:00:00Z', completed_at: null, user_id: 'mock',
  },
  // Completed tasks
  {
    id: 't14', title: 'Set up CI/CD pipeline', status: 'done', size: 'L',
    due_date: null, project_id: 'p1', notes: '**Pipeline stages:**\n- Lint\n- Unit tests\n- Build\n- Deploy to staging\n\nUsed GitHub Actions with reusable workflows.', waiting_on: null,
    sort_order: 0, days_on_today: 0, created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-02-27T16:00:00Z', completed_at: '2026-02-27T16:00:00Z', user_id: 'mock',
  },
  {
    id: 't15', title: 'Draft Q1 objectives', status: 'done', size: 'M',
    due_date: null, project_id: null, notes: null, waiting_on: null,
    sort_order: 0, days_on_today: 0, created_at: '2026-02-20T10:00:00Z',
    updated_at: '2026-02-26T11:00:00Z', completed_at: '2026-02-26T11:00:00Z', user_id: 'mock',
  },
  {
    id: 't16', title: 'Onboarding doc review', status: 'done', size: 'S',
    due_date: null, project_id: 'p3', notes: 'Reviewed with Sarah. Minor edits needed on the setup guide section.', waiting_on: null,
    sort_order: 0, days_on_today: 0, created_at: '2026-02-18T10:00:00Z',
    updated_at: '2026-02-28T09:00:00Z', completed_at: '2026-02-28T09:00:00Z', user_id: 'mock',
  },
  {
    id: 't17', title: 'Fix dashboard loading spinner', status: 'done', size: 'S',
    due_date: null, project_id: 'p2', notes: null, waiting_on: null,
    sort_order: 0, days_on_today: 0, created_at: '2026-02-24T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z', completed_at: '2026-03-01T10:00:00Z', user_id: 'mock',
  },
  {
    id: 't18', title: 'Migrate user table to new schema', status: 'done', size: 'L',
    due_date: null, project_id: 'p1', notes: null, waiting_on: null,
    sort_order: 0, days_on_today: 0, created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-02-25T14:00:00Z', completed_at: '2026-02-25T14:00:00Z', user_id: 'mock',
  },
  // Let-go tasks
  {
    id: 't19', title: 'Evaluate NoSQL alternatives', status: 'let_go', size: 'M',
    due_date: null, project_id: null, notes: 'Decided Postgres is sufficient for our scale. No need to evaluate further.', waiting_on: null,
    sort_order: 0, days_on_today: 0, created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-02-28T12:00:00Z', completed_at: '2026-02-28T12:00:00Z', user_id: 'mock',
  },
  {
    id: 't20', title: 'Build custom analytics dashboard', status: 'let_go', size: 'L',
    due_date: null, project_id: 'p2', notes: null, waiting_on: null,
    sort_order: 0, days_on_today: 0, created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-02-20T10:00:00Z', completed_at: '2026-02-20T10:00:00Z', user_id: 'mock',
  },
  {
    id: 't21', title: 'Rewrite auth module in Rust', status: 'let_go', size: 'L',
    due_date: null, project_id: null, notes: null, waiting_on: null,
    sort_order: 0, days_on_today: 0, created_at: '2026-01-05T10:00:00Z',
    updated_at: '2026-02-15T10:00:00Z', completed_at: '2026-02-15T10:00:00Z', user_id: 'mock',
  },
];

const INITIAL_NOTES: Note[] = [
  {
    id: 'n1',
    content: '**Feedback system architecture**\n\nThree options:\n- Event-driven with Kafka\n- REST polling\n- WebSocket push\n\nLeaning towards WebSocket for real-time, but need to check infra cost.',
    user_id: 'mock',
    created_at: '2026-02-28T14:30:00Z',
  },
  {
    id: 'n2',
    content: 'Standup notes:\n- Blocked on API access (PLAT-445)\n- Workshop slides 60% done\n- Sarah needs onboarding timeline by Friday',
    user_id: 'mock',
    created_at: '2026-02-27T09:15:00Z',
  },
  {
    id: 'n3',
    content: 'Ideas for the offsite:\n1. Lightning talks (10 min each)\n2. Hackathon afternoon\n3. Team retro with sticky notes\n4. Escape room?',
    user_id: 'mock',
    created_at: '2026-02-25T16:00:00Z',
  },
];

const INITIAL_SUBTASKS: Subtask[] = [
  { id: 's1', task_id: 't2', text: 'Outline talk structure', done: true, sort_order: 0 },
  { id: 's2', task_id: 't2', text: 'Build demo environment', done: false, sort_order: 1 },
  { id: 's3', task_id: 't2', text: 'Create slide deck', done: false, sort_order: 2 },
  { id: 's4', task_id: 't2', text: 'Rehearse timing', done: false, sort_order: 3 },
  { id: 's5', task_id: 't4', text: 'Reproduce in dev', done: true, sort_order: 0 },
  { id: 's6', task_id: 't4', text: 'Check token refresh logic', done: false, sort_order: 1 },
];

interface TaskStore {
  tasks: Task[];
  projects: Project[];
  subtasks: Subtask[];
  notes: Note[];
  getTasksByStatus: (status: Task['status']) => Task[];
  getTaskById: (id: string) => Task | undefined;
  getProject: (id: string | null) => Project | null;
  getSubtasks: (taskId: string) => Subtask[];
  addTask: (title: string) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addSubtask: (taskId: string, text: string) => Subtask;
  updateSubtask: (id: string, updates: Partial<Subtask>) => void;
  deleteSubtask: (id: string) => void;
  completeTask: (id: string) => void;
  letGoTask: (id: string) => void;
  restoreTask: (id: string) => void;
  addNote: (content: string) => Note;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  convertNoteToTask: (id: string) => Task;
  addProject: (name: string, colour: string) => Project | null;
  archiveProject: (id: string) => void;
  unarchiveProject: (id: string) => void;
}

const TaskStoreContext = createContext<TaskStore | null>(null);

export function TaskStoreProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [subtasks, setSubtasks] = useState<Subtask[]>(INITIAL_SUBTASKS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);

  const getTasksByStatus = useCallback(
    (status: Task['status']) =>
      tasks
        .filter((t) => t.status === status)
        .sort((a, b) => a.sort_order - b.sort_order),
    [tasks]
  );

  const getTaskById = useCallback(
    (id: string) => tasks.find((t) => t.id === id),
    [tasks]
  );

  const getProject = useCallback(
    (id: string | null) => projects.find((p) => p.id === id) ?? null,
    [projects]
  );

  const getSubtasks = useCallback(
    (taskId: string) =>
      subtasks
        .filter((s) => s.task_id === taskId)
        .sort((a, b) => a.sort_order - b.sort_order),
    [subtasks]
  );

  const addTask = useCallback((title: string): Task => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      status: 'inbox',
      size: 'M',
      due_date: null,
      project_id: null,
      notes: null,
      waiting_on: null,
      sort_order: 0,
      days_on_today: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
      user_id: 'mock',
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...updates, updated_at: new Date().toISOString() }
          : t
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSubtasks((prev) => prev.filter((s) => s.task_id !== id));
  }, []);

  const completeTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'done' as const, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }
          : t
      )
    );
  }, []);

  const letGoTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'let_go' as const, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }
          : t
      )
    );
  }, []);

  const restoreTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: 'inbox' as const, completed_at: null, updated_at: new Date().toISOString() }
          : t
      )
    );
  }, []);

  const addSubtask = useCallback((taskId: string, text: string): Subtask => {
    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      task_id: taskId,
      text,
      done: false,
      sort_order: subtasks.filter((s) => s.task_id === taskId).length,
    };
    setSubtasks((prev) => [...prev, newSubtask]);
    return newSubtask;
  }, [subtasks]);

  const updateSubtask = useCallback((id: string, updates: Partial<Subtask>) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const deleteSubtask = useCallback((id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addNote = useCallback((content: string): Note => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content,
      user_id: 'mock',
      created_at: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  }, []);

  const updateNote = useCallback((id: string, content: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, content } : n))
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const convertNoteToTask = useCallback((id: string): Task => {
    const note = notes.find((n) => n.id === id);
    const firstLine = note?.content.split('\n')[0] ?? 'Untitled task';
    // Strip markdown bold markers for the title
    const title = firstLine.replace(/\*\*/g, '').trim() || 'Untitled task';
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      status: 'inbox',
      size: 'M',
      due_date: null,
      project_id: null,
      notes: note?.content ?? null,
      waiting_on: null,
      sort_order: 0,
      days_on_today: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
      user_id: 'mock',
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, [notes]);

  const addProject = useCallback((name: string, colour: string): Project | null => {
    const activeCount = projects.filter((p) => !p.archived).length;
    if (activeCount >= MAX_PROJECTS) return null;
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      colour,
      archived: false,
      user_id: 'mock',
      created_at: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  }, [projects]);

  const archiveProject = useCallback((id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, archived: true } : p))
    );
  }, []);

  const unarchiveProject = useCallback((id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, archived: false } : p))
    );
  }, []);

  return (
    <TaskStoreContext.Provider
      value={{
        tasks,
        projects,
        subtasks,
        notes,
        getTasksByStatus,
        getTaskById,
        getProject,
        getSubtasks,
        addTask,
        updateTask,
        deleteTask,
        addSubtask,
        updateSubtask,
        deleteSubtask,
        completeTask,
        letGoTask,
        restoreTask,
        addNote,
        updateNote,
        deleteNote,
        convertNoteToTask,
        addProject,
        archiveProject,
        unarchiveProject,
      }}
    >
      {children}
    </TaskStoreContext.Provider>
  );
}

export function useTaskStore() {
  const ctx = useContext(TaskStoreContext);
  if (!ctx) throw new Error('useTaskStore must be used within TaskStoreProvider');
  return ctx;
}
