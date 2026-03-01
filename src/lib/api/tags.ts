// tags.ts — Supabase CRUD for tags + task_tags tables

import { createClient } from '@/lib/supabase/client';
import type { Tag, TaskTag } from '@/types';

export async function fetchAllTags(userId: string): Promise<Tag[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchTagsForTask(taskId: string): Promise<Tag[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('task_tags')
    .select('tag_id, tags(*)')
    .eq('task_id', taskId);
  if (error) throw error;
  return data.map((row: Record<string, unknown>) => row.tags as Tag);
}

export async function fetchAllTaskTags(userId: string): Promise<TaskTag[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('task_tags')
    .select('task_id, tag_id, tasks!inner(user_id)')
    .eq('tasks.user_id', userId);
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return data.map(({ tasks, ...tt }: Record<string, unknown>) => tt as unknown as TaskTag);
}

export async function addTagToTask(
  taskId: string,
  tagName: string,
  userId: string
): Promise<{ tag: Tag; taskTag: TaskTag }> {
  const supabase = createClient();

  // Upsert tag (create if not exists)
  const normalized = tagName.trim().toLowerCase().replace(/\s+/g, '-');
  const { data: tag, error: tagError } = await supabase
    .from('tags')
    .upsert(
      { name: normalized, user_id: userId },
      { onConflict: 'name,user_id' }
    )
    .select()
    .single();
  if (tagError) throw tagError;

  // Link to task (ignore if already linked)
  const { error: linkError } = await supabase
    .from('task_tags')
    .upsert(
      { task_id: taskId, tag_id: tag.id },
      { onConflict: 'task_id,tag_id' }
    );
  if (linkError) throw linkError;

  return { tag, taskTag: { task_id: taskId, tag_id: tag.id } };
}

export async function removeTagFromTask(
  taskId: string,
  tagId: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('task_tags')
    .delete()
    .eq('task_id', taskId)
    .eq('tag_id', tagId);
  if (error) throw error;
}
