-- Seed data for demo account: demouser@tempus.com
-- Run in Supabase SQL Editor

do $$
declare
  uid uuid := 'ea25fbb3-beca-4eb0-9900-4bdf1f37e8e8';

  -- projects
  p_work uuid;
  p_side uuid;
  p_home uuid;

  -- tags
  tag_deep uuid;
  tag_quick uuid;
  tag_collab uuid;

  -- tasks (need references for subtasks + task_tags)
  t1 uuid; t2 uuid; t3 uuid; t4 uuid; t5 uuid;
  t6 uuid; t7 uuid; t8 uuid; t9 uuid; t10 uuid;
  t11 uuid; t12 uuid; t13 uuid; t14 uuid; t15 uuid;

begin

-- ============================================
-- PROJECTS
-- ============================================
insert into projects (id, name, colour, user_id) values
  (uuid_generate_v4(), 'Work',         '#D4A574', uid) returning id into p_work;
insert into projects (id, name, colour, user_id) values
  (uuid_generate_v4(), 'Side Project', '#7BA599', uid) returning id into p_side;
insert into projects (id, name, colour, user_id) values
  (uuid_generate_v4(), 'Home',         '#C17C6E', uid) returning id into p_home;

-- ============================================
-- TAGS
-- ============================================
insert into tags (id, name, user_id) values
  (uuid_generate_v4(), 'deep-work', uid) returning id into tag_deep;
insert into tags (id, name, user_id) values
  (uuid_generate_v4(), 'quick-win', uid) returning id into tag_quick;
insert into tags (id, name, user_id) values
  (uuid_generate_v4(), 'collab', uid) returning id into tag_collab;

-- ============================================
-- TASKS — Today (5 tasks, mixed sizes)
-- ============================================
insert into tasks (id, title, status, size, project_id, notes, sort_order, days_on_today, user_id) values
  (uuid_generate_v4(), 'Review Q1 metrics dashboard', 'today', 'M', p_work,
   'Check conversion funnel and retention charts. Flag anything off by >10%.',
   0, 0, uid) returning id into t1;

insert into tasks (id, title, status, size, project_id, sort_order, days_on_today, user_id) values
  (uuid_generate_v4(), 'Reply to Sarah about launch timeline', 'today', 'S', p_work,
   1, 1, uid) returning id into t2;

insert into tasks (id, title, status, size, project_id, notes, sort_order, days_on_today, user_id) values
  (uuid_generate_v4(), 'Write landing page copy', 'today', 'L', p_side,
   'Hero section, features grid, and CTA. Keep it under 300 words total.',
   2, 0, uid) returning id into t3;

insert into tasks (id, title, status, size, sort_order, days_on_today, user_id) values
  (uuid_generate_v4(), 'Groceries for the week', 'today', 'S',
   3, 0, uid) returning id into t4;

insert into tasks (id, title, status, size, project_id, notes, sort_order, days_on_today, user_id) values
  (uuid_generate_v4(), 'Fix auth token refresh bug', 'today', 'M', p_side,
   'Tokens expire after 1hr but the refresh isn''t triggering. Check the middleware.',
   4, 2, uid) returning id into t5;

-- ============================================
-- TASKS — Inbox (3 unsorted tasks)
-- ============================================
insert into tasks (id, title, status, size, sort_order, user_id) values
  (uuid_generate_v4(), 'Look into better error monitoring', 'inbox', 'M', 0, uid) returning id into t6;

insert into tasks (id, title, status, size, project_id, sort_order, user_id) values
  (uuid_generate_v4(), 'Schedule dentist appointment', 'inbox', 'S', p_home, 1, uid) returning id into t7;

insert into tasks (id, title, status, size, sort_order, user_id) values
  (uuid_generate_v4(), 'Read that article on system design', 'inbox', 'S', 2, uid) returning id into t8;

-- ============================================
-- TASKS — Upcoming (2 with due dates)
-- ============================================
insert into tasks (id, title, status, size, project_id, due_date, sort_order, user_id) values
  (uuid_generate_v4(), 'Prepare sprint retro slides', 'upcoming', 'M', p_work,
   now() + interval '3 days', 0, uid) returning id into t9;

insert into tasks (id, title, status, size, project_id, due_date, notes, sort_order, user_id) values
  (uuid_generate_v4(), 'Submit tax documents', 'upcoming', 'L', p_home,
   now() + interval '10 days',
   'Need: income statement, deductions spreadsheet, super contribution summary.',
   1, uid) returning id into t10;

-- ============================================
-- TASKS — Waiting On (2)
-- ============================================
insert into tasks (id, title, status, size, project_id, waiting_on, sort_order, user_id) values
  (uuid_generate_v4(), 'Brand asset kit from design team', 'waiting', 'M', p_work,
   'Alex — said Friday', 0, uid) returning id into t11;

insert into tasks (id, title, status, size, waiting_on, sort_order, user_id) values
  (uuid_generate_v4(), 'Landlord to confirm lease renewal', 'waiting', 'S',
   'Property manager', 1, uid) returning id into t12;

-- ============================================
-- TASKS — Someday (2, one decaying)
-- ============================================
insert into tasks (id, title, status, size, project_id, notes, sort_order, updated_at, user_id) values
  (uuid_generate_v4(), 'Build a CLI tool for time tracking', 'someday', 'L', p_side,
   'Rust or Go. Should sync with the task manager eventually.',
   0, now() - interval '12 days', uid) returning id into t13;

insert into tasks (id, title, status, size, sort_order, updated_at, user_id) values
  (uuid_generate_v4(), 'Learn basic woodworking', 'someday', 'L',
   1, now() - interval '25 days', uid) returning id into t14;

-- ============================================
-- TASKS — Done (1 recent completion)
-- ============================================
insert into tasks (id, title, status, size, project_id, notes, completed_at, sort_order, user_id) values
  (uuid_generate_v4(), 'Set up CI/CD pipeline', 'done', 'L', p_side,
   'GitHub Actions → Vercel preview deploys on PR, auto-deploy main.',
   now() - interval '1 day', 0, uid) returning id into t15;

-- ============================================
-- SUBTASKS
-- ============================================
-- Subtasks for "Review Q1 metrics dashboard"
insert into subtasks (task_id, text, done, sort_order) values
  (t1, 'Pull conversion funnel data', true, 0),
  (t1, 'Compare retention vs last quarter', false, 1),
  (t1, 'Flag anomalies for team sync', false, 2);

-- Subtasks for "Write landing page copy"
insert into subtasks (task_id, text, done, sort_order) values
  (t3, 'Draft hero headline + subtext', true, 0),
  (t3, 'Write 3 feature descriptions', false, 1),
  (t3, 'Write CTA section', false, 2),
  (t3, 'Proofread full page', false, 3);

-- Subtasks for "Submit tax documents"
insert into subtasks (task_id, text, done, sort_order) values
  (t10, 'Download income statement from payroll', false, 0),
  (t10, 'Compile deductions spreadsheet', false, 1),
  (t10, 'Get super contribution summary', false, 2),
  (t10, 'Upload everything to accountant portal', false, 3);

-- Subtasks for "Set up CI/CD pipeline" (completed)
insert into subtasks (task_id, text, done, sort_order) values
  (t15, 'Create GitHub Actions workflow', true, 0),
  (t15, 'Configure Vercel project', true, 1),
  (t15, 'Test preview deploy on PR', true, 2);

-- ============================================
-- TASK_TAGS
-- ============================================
insert into task_tags (task_id, tag_id) values
  (t1, tag_deep),
  (t2, tag_quick),
  (t3, tag_deep),
  (t4, tag_quick),
  (t5, tag_deep),
  (t9, tag_collab),
  (t11, tag_collab),
  (t13, tag_deep);

-- ============================================
-- NOTES
-- ============================================
insert into notes (content, user_id, created_at) values
  ('## Sprint priorities
- Finish landing page copy
- Fix auth token bug (blocking beta users)
- Review metrics before Thursday sync', uid, now() - interval '2 days');

insert into notes (content, user_id, created_at) values
  ('Interesting idea: what if the CLI tool could parse natural language into tasks? Like `tm add "call dentist tomorrow"` and it auto-sets the due date.', uid, now() - interval '5 days');

insert into notes (content, user_id, created_at) values
  ('Books to read:
- *Designing Data-Intensive Applications* (halfway through)
- *The Mom Test* (recommended by Jake)
- *Shape Up* (for project planning ideas)', uid, now() - interval '8 days');

end $$;
