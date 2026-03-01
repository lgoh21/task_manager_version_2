// auth.ts — Cached user ID for Supabase queries

let cachedUserId: string = '';

export function getCachedUserId(): string {
  return cachedUserId;
}

export function setCachedUserId(id: string) {
  cachedUserId = id;
}
