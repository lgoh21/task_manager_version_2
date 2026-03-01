// tasks.ts — Supabase CRUD for tasks table

import { createClient } from '@/lib/supabase/client';
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types';

export async function fetchAllTasks(userId: string): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchTask(id: string): Promise<Task> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createTask(
  input: CreateTaskInput & { user_id: string }
): Promise<Task> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: input.title,
      status: input.status ?? 'inbox',
      size: input.size ?? 'M',
      due_date: input.due_date ?? null,
      project_id: input.project_id ?? null,
      notes: input.notes ?? null,
      waiting_on: input.waiting_on ?? null,
      sort_order: 0,
      days_on_today: 0,
      user_id: input.user_id,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTask(
  id: string,
  updates: UpdateTaskInput
): Promise<Task> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
