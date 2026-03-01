-- Remove dev bypass RLS policies and migrate data to real user
-- Run AFTER signing up and confirming your real user ID

-- Step 1: Replace YOUR_REAL_USER_ID below with your actual UUID from:
--   select id, email from auth.users;

-- Step 2: Migrate all dev data to your real account
update projects  set user_id = 'YOUR_REAL_USER_ID' where user_id = '00000000-0000-0000-0000-000000000000';
update tasks     set user_id = 'YOUR_REAL_USER_ID' where user_id = '00000000-0000-0000-0000-000000000000';
update tags      set user_id = 'YOUR_REAL_USER_ID' where user_id = '00000000-0000-0000-0000-000000000000';
update notes     set user_id = 'YOUR_REAL_USER_ID' where user_id = '00000000-0000-0000-0000-000000000000';

-- Step 3: Drop dev bypass policies
drop policy if exists "Dev bypass projects" on projects;
drop policy if exists "Dev bypass tasks" on tasks;
drop policy if exists "Dev bypass subtasks" on subtasks;
drop policy if exists "Dev bypass tags" on tags;
drop policy if exists "Dev bypass task_tags" on task_tags;
drop policy if exists "Dev bypass notes" on notes;
