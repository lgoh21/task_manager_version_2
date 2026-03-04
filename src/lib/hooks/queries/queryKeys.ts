// queryKeys.ts — Centralized query key factory for React Query cache

export const queryKeys = {
  tasks: {
    all: ['tasks'] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
  },
  subtasks: {
    all: ['subtasks'] as const,
    byTask: (taskId: string) => ['subtasks', 'task', taskId] as const,
  },
  projects: {
    all: ['projects'] as const,
  },
  notes: {
    all: ['notes'] as const,
    byProject: (projectId: string) => ['notes', 'project', projectId] as const,
  },
  tags: {
    all: ['tags'] as const,
    byTask: (taskId: string) => ['tags', 'task', taskId] as const,
  },
  taskTags: {
    all: ['taskTags'] as const,
  },
  auth: {
    userId: ['auth', 'userId'] as const,
  },
} as const;
