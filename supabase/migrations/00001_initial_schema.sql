-- Tempus initial schema
-- All tables with RLS policies (users can only access their own data)

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

create type task_status as enum (
  'inbox',
  'today',
  'someday',
  'upcoming',
  'waiting',
  'done',
  'let_go'
);

create type task_size as enum ('S', 'M', 'L');

-- ============================================
-- PROJECTS
-- ============================================

create table projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  colour text not null,
  archived boolean not null default false,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table projects enable row level security;

create policy "Users can view own projects"
  on projects for select using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on projects for insert with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on projects for update using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on projects for delete using (auth.uid() = user_id);

-- ============================================
-- TASKS
-- ============================================

create table tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  status task_status not null default 'inbox',
  size task_size not null default 'M',
  due_date timestamptz,
  project_id uuid references projects(id) on delete set null,
  notes text,
  waiting_on text,
  sort_order integer not null default 0,
  days_on_today integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  user_id uuid not null references auth.users(id) on delete cascade
);

alter table tasks enable row level security;

create policy "Users can view own tasks"
  on tasks for select using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on tasks for insert with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on tasks for update using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on tasks for delete using (auth.uid() = user_id);

-- Index for common queries
create index idx_tasks_user_status on tasks(user_id, status);
create index idx_tasks_user_project on tasks(user_id, project_id);
create index idx_tasks_updated_at on tasks(updated_at);

-- Auto-update updated_at on any edit
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();

-- ============================================
-- SUBTASKS
-- ============================================

create table subtasks (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references tasks(id) on delete cascade,
  text text not null,
  done boolean not null default false,
  sort_order integer not null default 0
);

alter table subtasks enable row level security;

create policy "Users can view own subtasks"
  on subtasks for select
  using (exists (
    select 1 from tasks where tasks.id = subtasks.task_id and tasks.user_id = auth.uid()
  ));

create policy "Users can insert own subtasks"
  on subtasks for insert
  with check (exists (
    select 1 from tasks where tasks.id = subtasks.task_id and tasks.user_id = auth.uid()
  ));

create policy "Users can update own subtasks"
  on subtasks for update
  using (exists (
    select 1 from tasks where tasks.id = subtasks.task_id and tasks.user_id = auth.uid()
  ));

create policy "Users can delete own subtasks"
  on subtasks for delete
  using (exists (
    select 1 from tasks where tasks.id = subtasks.task_id and tasks.user_id = auth.uid()
  ));

create index idx_subtasks_task on subtasks(task_id);

-- ============================================
-- TAGS
-- ============================================

create table tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  unique(name, user_id)
);

alter table tags enable row level security;

create policy "Users can view own tags"
  on tags for select using (auth.uid() = user_id);

create policy "Users can insert own tags"
  on tags for insert with check (auth.uid() = user_id);

create policy "Users can update own tags"
  on tags for update using (auth.uid() = user_id);

create policy "Users can delete own tags"
  on tags for delete using (auth.uid() = user_id);

-- ============================================
-- TASK_TAGS (junction table)
-- ============================================

create table task_tags (
  task_id uuid not null references tasks(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (task_id, tag_id)
);

alter table task_tags enable row level security;

create policy "Users can view own task_tags"
  on task_tags for select
  using (exists (
    select 1 from tasks where tasks.id = task_tags.task_id and tasks.user_id = auth.uid()
  ));

create policy "Users can insert own task_tags"
  on task_tags for insert
  with check (exists (
    select 1 from tasks where tasks.id = task_tags.task_id and tasks.user_id = auth.uid()
  ));

create policy "Users can update own task_tags"
  on task_tags for update
  using (exists (
    select 1 from tasks where tasks.id = task_tags.task_id and tasks.user_id = auth.uid()
  ));

create policy "Users can delete own task_tags"
  on task_tags for delete
  using (exists (
    select 1 from tasks where tasks.id = task_tags.task_id and tasks.user_id = auth.uid()
  ));

-- ============================================
-- NOTES (standalone journal)
-- ============================================

create table notes (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table notes enable row level security;

create policy "Users can view own notes"
  on notes for select using (auth.uid() = user_id);

create policy "Users can insert own notes"
  on notes for insert with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on notes for update using (auth.uid() = user_id);

create policy "Users can delete own notes"
  on notes for delete using (auth.uid() = user_id);

create index idx_notes_user_created on notes(user_id, created_at desc);
