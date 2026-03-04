// notes.ts — Supabase CRUD for notes table

import { createClient } from '@/lib/supabase/client';
import type { Note } from '@/types';

export async function fetchNotes(userId: string): Promise<Note[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createNote(
  content: string,
  userId: string,
  projectId?: string | null
): Promise<Note> {
  const supabase = createClient();
  const insert: Record<string, unknown> = { content, user_id: userId };
  if (projectId) insert.project_id = projectId;
  const { data, error } = await supabase
    .from('notes')
    .insert(insert)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateNote(
  id: string,
  content: string
): Promise<Note> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notes')
    .update({ content })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function updateNoteProject(
  id: string,
  projectId: string | null
): Promise<Note> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('notes')
    .update({ project_id: projectId })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
