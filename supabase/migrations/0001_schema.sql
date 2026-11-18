-- =============================================================================
-- UniHub · 0001 — schema
-- Single-class academic data shared by the public student portal and the
-- authenticated admin panel. Run this file first in the Supabase SQL editor.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Admin allowlist
-- Only the project owner's Supabase Auth user should ever be inserted here.
-- There is intentionally no public registration path.
-- -----------------------------------------------------------------------------
create table public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Supabase Auth users permitted to manage UniHub. API access is blocked by RLS and grants; manage rows only from the SQL editor.';

-- -----------------------------------------------------------------------------
-- Deadlines
-- `due_date` is the single source of truth for the Upcoming / Past split:
-- upcoming = due_date >= now(), past = due_date < now(). Nothing is archived
-- or deleted automatically, and admins can still edit or delete past rows.
-- `status` keeps completed deadlines visually distinct from merely overdue ones.
-- -----------------------------------------------------------------------------
create table public.deadlines (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  subject text not null,
  category text not null default 'Assignment',
  due_date timestamptz not null,
  priority text not null default 'Medium',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deadlines_title_length check (char_length(btrim(title)) between 1 and 160),
  constraint deadlines_description_length check (char_length(description) <= 2000),
  constraint deadlines_subject_length check (char_length(btrim(subject)) between 1 and 80),
  constraint deadlines_category_check check (category in ('Assignment', 'Quiz', 'Exam', 'Project', 'Other')),
  constraint deadlines_priority_check check (priority in ('Low', 'Medium', 'High')),
  constraint deadlines_status_check check (status in ('pending', 'completed'))
);

comment on column public.deadlines.status is
  'Admin-managed completion state. Overdue is derived from due_date, not stored.';

-- -----------------------------------------------------------------------------
-- Weekly timetable
-- -----------------------------------------------------------------------------
create table public.timetable (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  lecturer text not null default '',
  classroom text not null default '',
  day_of_week text not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint timetable_subject_length check (char_length(btrim(subject)) between 1 and 80),
  constraint timetable_lecturer_length check (char_length(lecturer) <= 120),
  constraint timetable_classroom_length check (char_length(classroom) <= 120),
  constraint timetable_day_check check (
    day_of_week in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
  ),
  constraint timetable_time_order check (end_time > start_time)
);

-- -----------------------------------------------------------------------------
-- Class-wide reminders
-- There is deliberately no per-student completion state in this version.
-- -----------------------------------------------------------------------------
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  reminder_date timestamptz not null,
  category text not null default 'General',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reminders_title_length check (char_length(btrim(title)) between 1 and 160),
  constraint reminders_description_length check (char_length(description) <= 2000),
  constraint reminders_category_check check (
    category in ('General', 'Academic', 'Important', 'Event')
  )
);

-- -----------------------------------------------------------------------------
-- Announcements
-- created_at and published_at are separate so a notice can be written now and
-- published later. Public visibility requires is_published AND
-- published_at <= now(), which also supports scheduling a future publish.
-- published_at is retained when a notice is unpublished.
-- -----------------------------------------------------------------------------
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null default 'General',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_title_length check (char_length(btrim(title)) between 1 and 160),
  constraint announcements_content_length check (char_length(btrim(content)) between 1 and 5000),
  constraint announcements_category_check check (
    category in ('General', 'Academic', 'Important', 'Event')
  ),
  constraint announcements_publish_state check (not is_published or published_at is not null)
);

comment on column public.announcements.published_at is
  'When the announcement becomes visible. Always set when is_published is true; may be in the future for scheduled publishing.';

-- -----------------------------------------------------------------------------
-- updated_at maintenance
-- -----------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger deadlines_set_updated_at
  before update on public.deadlines
  for each row execute function public.set_updated_at();

create trigger timetable_set_updated_at
  before update on public.timetable
  for each row execute function public.set_updated_at();

create trigger reminders_set_updated_at
  before update on public.reminders
  for each row execute function public.set_updated_at();

create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index deadlines_due_date_idx on public.deadlines (due_date);
create index deadlines_status_due_date_idx on public.deadlines (status, due_date);
create index timetable_day_start_idx on public.timetable (day_of_week, start_time);
create index reminders_reminder_date_idx on public.reminders (reminder_date);
create index announcements_created_at_idx on public.announcements (created_at desc);
create index announcements_published_idx
  on public.announcements (published_at desc)
  where is_published;
