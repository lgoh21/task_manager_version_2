-- Dev-only RLS bypass for development without auth
-- Uses a hardcoded UUID that matches DEV_USER_ID in src/lib/api/auth.ts
-- Remove these policies when real auth is implemented

do $$
declare
  dev_uid uuid := '00000000-0000-0000-0000-000000000000';
begin
  -- Insert dev user into auth.users if not exists
  insert into auth.users (id, email, role, aud, created_at, updated_at)
  values (dev_uid, 'dev@tempus.local', 'authenticated', 'authenticated', now(), now())
  on conflict (id) do nothing;
end $$;

-- Projects
create policy "Dev bypass projects" on projects for all
  using (user_id = '00000000-0000-0000-0000-000000000000'::uuid)
  with check (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Tasks
create policy "Dev bypass tasks" on tasks for all
  using (user_id = '00000000-0000-0000-0000-000000000000'::uuid)
  with check (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Subtasks (via parent task)
create policy "Dev bypass subtasks" on subtasks for all
  using (exists (
    select 1 from tasks where tasks.id = subtasks.task_id
    and tasks.user_id = '00000000-0000-0000-0000-000000000000'::uuid
  ))
  with check (exists (
    select 1 from tasks where tasks.id = subtasks.task_id
    and tasks.user_id = '00000000-0000-0000-0000-000000000000'::uuid
  ));

-- Tags
create policy "Dev bypass tags" on tags for all
  using (user_id = '00000000-0000-0000-0000-000000000000'::uuid)
  with check (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- Task tags (via parent task)
create policy "Dev bypass task_tags" on task_tags for all
  using (exists (
    select 1 from tasks where tasks.id = task_tags.task_id
    and tasks.user_id = '00000000-0000-0000-0000-000000000000'::uuid
  ))
  with check (exists (
    select 1 from tasks where tasks.id = task_tags.task_id
    and tasks.user_id = '00000000-0000-0000-0000-000000000000'::uuid
  ));

-- Notes
create policy "Dev bypass notes" on notes for all
  using (user_id = '00000000-0000-0000-0000-000000000000'::uuid)
  with check (user_id = '00000000-0000-0000-0000-000000000000'::uuid);
