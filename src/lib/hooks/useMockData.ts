// Temporary mock data for UI development without Supabase
// Will be replaced by React Query hooks that fetch from Supabase

import { useState, useCallback } from 'react';
import type { Task, Project } from '@/types';

const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'CBA — Feedback', colour: '#3B82F6', archived: false, user_id: 'mock', created_at: '2026-02-20T00:00:00Z' },
  { id: 'p2', name: 'Digital Twin', colour: '#8B5CF6', archived: false, user_id: 'mock', created_at: '2026-02-18T00:00:00Z' },
  { id: 'p3', name: 'Grad Onboarding', colour: '#10B981', archived: false, user_id: 'mock', created_at: '2026-02-15T00:00:00Z' },
];

const MOCK_TASKS: Task[] = [
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
  // Inbox tasks
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
  // Someday tasks (various decay stages)
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
  // Upcoming
  {
    id: 't10', title: 'Submit quarterly report', status: 'upcoming', size: 'L',
    due_date: '2026-03-05T17:00:00Z', project_id: 'p1', notes: null, waiting_on: null,
    sort_order: 0, days_on_today: 0, created_at: '2026-02-20T10:00:00Z',
    updated_at: '2026-02-20T10:00:00Z', completed_at: null, user_id: 'mock',
  },
  // Waiting on
  {
    id: 't11', title: 'Get API access for staging', status: 'waiting', size: 'S',
    due_date: null, project_id: 'p1', notes: null, waiting_on: 'Platform team — PLAT-445',
    sort_order: 0, days_on_today: 0, created_at: '2026-02-24T10:00:00Z',
    updated_at: '2026-02-24T10:00:00Z', completed_at: null, user_id: 'mock',
  },
];

export function useMockTasks() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  const getTasksByStatus = useCallback(
    (status: Task['status']) =>
      tasks
        .filter((t) => t.status === status)
        .sort((a, b) => a.sort_order - b.sort_order),
    [tasks]
  );

  const addTask = useCallback((title: string) => {
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
        t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const reorderTasks = useCallback(
    (status: Task['status'], fromIndex: number, toIndex: number) => {
      setTasks((prev) => {
        const statusTasks = prev
          .filter((t) => t.status === status)
          .sort((a, b) => a.sort_order - b.sort_order);
        const otherTasks = prev.filter((t) => t.status !== status);

        const [moved] = statusTasks.splice(fromIndex, 1);
        statusTasks.splice(toIndex, 0, moved);

        const reordered = statusTasks.map((t, i) => ({ ...t, sort_order: i }));
        return [...otherTasks, ...reordered];
      });
    },
    []
  );

  return { tasks, getTasksByStatus, addTask, updateTask, deleteTask, reorderTasks };
}

export function useMockProjects() {
  const [projects] = useState<Project[]>(MOCK_PROJECTS);
  return { projects };
}
