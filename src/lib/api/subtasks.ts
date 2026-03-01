// subtasks.ts — Supabase CRUD for subtasks table

import { createClient } from '@/lib/supabase/client';
import type { Subtask } from '@/types';

export async function fetchSubtasksByTask(taskId: string): Promise<Subtask[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subtasks')
    .select('*')
    .eq('task_id', taskId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchAllSubtasks(userId: string): Promise<Subtask[]> {
  // Fetch all subtasks for tasks owned by this user via a join
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subtasks')
    .select('*, tasks!inner(user_id)')
    .eq('tasks.user_id', userId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  // Strip the joined tasks data, return flat subtask rows
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return data.map(({ tasks, ...subtask }: Record<string, unknown>) => subtask as unknown as Subtask);
}

export async function createSubtask(
  taskId: string,
  text: string,
  sortOrder: number
): Promise<Subtask> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subtasks')
    .insert({ task_id: taskId, text, sort_order: sortOrder, done: false })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSubtask(
  id: string,
  updates: Partial<Pick<Subtask, 'text' | 'done' | 'sort_order'>>
): Promise<Subtask> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subtasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSubtask(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('subtasks')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
