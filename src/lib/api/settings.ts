// settings.ts — Supabase CRUD for user_settings table

import { createClient } from '@/lib/supabase/client';
import type { UserSettings } from '@/types';
import { MAX_PROJECTS } from '@/config/constants';

const DEFAULTS: Omit<UserSettings, 'user_id'> = {
  max_projects: MAX_PROJECTS,
};

export async function fetchSettings(userId: string): Promise<UserSettings> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  // If no row yet, return defaults
  if (!data) return { user_id: userId, ...DEFAULTS };
  return data;
}

export async function upsertSettings(
  userId: string,
  updates: Partial<Omit<UserSettings, 'user_id'>>
): Promise<UserSettings> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
