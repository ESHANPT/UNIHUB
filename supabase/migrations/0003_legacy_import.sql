-- =============================================================================
-- UniHub · 0003 — safe legacy (localStorage) import
-- Run after 0002_rls.sql.
--
-- The admin panel sends already-validated records here. This function:
--   * refuses to run for anyone not on the admin allowlist
--   * inserts records only when no natural-key match already exists
--   * never updates or deletes existing rows
--   * returns inserted/skipped counts so the UI can prove what happened
--   * runs as SECURITY INVOKER, so table RLS and grants still apply
--
-- Expected payload (timestamps must be ISO 8601 with an offset, e.g.
-- "2026-11-18T18:29:00.000Z"; the browser converts local input values):
--
-- {
--   "deadlines": [{
--     "title": "Binary Search Tree Assignment",
--     "description": "…",
--     "subject": "Data Structures",
--     "category": "Assignment",
--     "due_date": "2026-11-18T18:29:00.000Z",
--     "priority": "High",
--     "status": "pending",
--     "created_at": "2026-11-16T09:00:00.000Z"
--   }],
--   "timetable": [{
--     "subject": "Data Structures",
--     "lecturer": "Dr. Alan Perera",
--     "classroom": "Lecture Theatre 2",
--     "day_of_week": "Monday",
--     "start_time": "09:00",
--     "end_time": "10:30",
--     "created_at": "2026-11-16T09:00:00.000Z"
--   }],
--   "reminders": [{
--     "title": "Finish OS lab report",
--     "description": "…",
--     "reminder_date": "2026-11-17T10:00:00.000Z",
--     "category": "General",
--     "created_at": "2026-11-16T09:00:00.000Z"
--   }],
--   "announcements": [{
--     "title": "Mid-semester exam timetable released",
--     "content": "…",
--     "category": "Academic",
--     "created_at": "2026-11-15T09:00:00.000Z",
--     "published_at": "2026-11-15T09:00:00.000Z"
--   }]
-- }
-- =============================================================================

create or replace function public.import_legacy_data(payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_keys constant text[] := array['deadlines', 'timetable', 'reminders', 'announcements'];
  v_total_rows integer := 0;
  v_deadlines_total integer := 0;
  v_timetable_total integer := 0;
  v_reminders_total integer := 0;
  v_announcements_total integer := 0;
  v_deadlines_inserted integer := 0;
  v_timetable_inserted integer := 0;
  v_reminders_inserted integer := 0;
  v_announcements_inserted integer := 0;
begin
  if not coalesce(private.is_admin(), false) then
    raise exception 'Only administrators may import legacy UniHub data.'
      using errcode = '42501';
  end if;

  if payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'Import payload must be a JSON object.'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from unnest(v_keys) as k
    where payload ? k
      and jsonb_typeof(payload -> k) <> 'array'
  ) then
    raise exception 'Every UniHub collection in the payload must be a JSON array.'
      using errcode = '22023';
  end if;

  if pg_column_size(payload) > 4 * 1024 * 1024 then
    raise exception 'Import payload is too large (maximum 4 MB).'
      using errcode = '22023';
  end if;

  v_deadlines_total := coalesce(jsonb_array_length(payload -> 'deadlines'), 0);
  v_timetable_total := coalesce(jsonb_array_length(payload -> 'timetable'), 0);
  v_reminders_total := coalesce(jsonb_array_length(payload -> 'reminders'), 0);
  v_announcements_total := coalesce(jsonb_array_length(payload -> 'announcements'), 0);
  v_total_rows := v_deadlines_total + v_timetable_total + v_reminders_total + v_announcements_total;

  if v_total_rows > 4000 then
    raise exception 'Import payload contains too many rows (maximum 4000).'
      using errcode = '22023';
  end if;

  -- Deadlines ---------------------------------------------------------------
  -- Natural key: case-insensitive title + exact due timestamp.
  insert into public.deadlines (
    title, description, subject, category, due_date, priority, status, created_at
  )
  select
    btrim(r.title),
    coalesce(btrim(r.description), ''),
    btrim(r.subject),
    coalesce(r.category, 'Assignment'),
    r.due_date,
    coalesce(r.priority, 'Medium'),
    coalesce(r.status, 'pending'),
    coalesce(r.created_at, now())
  from jsonb_to_recordset(coalesce(payload -> 'deadlines', '[]'::jsonb)) as r (
    title text,
    description text,
    subject text,
    category text,
    due_date timestamptz,
    priority text,
    status text,
    created_at timestamptz
  )
  where not exists (
    select 1
    from public.deadlines existing
    where lower(btrim(existing.title)) = lower(btrim(r.title))
      and existing.due_date = r.due_date
  );
  get diagnostics v_deadlines_inserted = row_count;

  -- Timetable ---------------------------------------------------------------
  -- Natural key: case-insensitive subject + day + start time.
  insert into public.timetable (
    subject, lecturer, classroom, day_of_week, start_time, end_time, created_at
  )
  select
    btrim(r.subject),
    coalesce(btrim(r.lecturer), ''),
    coalesce(btrim(r.classroom), ''),
    r.day_of_week,
    r.start_time,
    r.end_time,
    coalesce(r.created_at, now())
  from jsonb_to_recordset(coalesce(payload -> 'timetable', '[]'::jsonb)) as r (
    subject text,
    lecturer text,
    classroom text,
    day_of_week text,
    start_time time,
    end_time time,
    created_at timestamptz
  )
  where not exists (
    select 1
    from public.timetable existing
    where lower(btrim(existing.subject)) = lower(btrim(r.subject))
      and existing.day_of_week = r.day_of_week
      and existing.start_time = r.start_time
  );
  get diagnostics v_timetable_inserted = row_count;

  -- Reminders ---------------------------------------------------------------
  -- Natural key: case-insensitive title + exact reminder timestamp.
  insert into public.reminders (
    title, description, reminder_date, category, created_at
  )
  select
    btrim(r.title),
    coalesce(btrim(r.description), ''),
    r.reminder_date,
    coalesce(r.category, 'General'),
    coalesce(r.created_at, now())
  from jsonb_to_recordset(coalesce(payload -> 'reminders', '[]'::jsonb)) as r (
    title text,
    description text,
    reminder_date timestamptz,
    category text,
    created_at timestamptz
  )
  where not exists (
    select 1
    from public.reminders existing
    where lower(btrim(existing.title)) = lower(btrim(r.title))
      and existing.reminder_date = r.reminder_date
  );
  get diagnostics v_reminders_inserted = row_count;

  -- Announcements -----------------------------------------------------------
  -- Migrated notices were already public in the prototype, so they are
  -- inserted as published. Natural key: case-insensitive title + created date.
  insert into public.announcements (
    title, content, category, is_published, published_at, created_at
  )
  select
    btrim(r.title),
    btrim(r.content),
    coalesce(r.category, 'General'),
    true,
    coalesce(r.published_at, r.created_at, now()),
    coalesce(r.created_at, now())
  from jsonb_to_recordset(coalesce(payload -> 'announcements', '[]'::jsonb)) as r (
    title text,
    content text,
    category text,
    published_at timestamptz,
    created_at timestamptz
  )
  where not exists (
    select 1
    from public.announcements existing
    where lower(btrim(existing.title)) = lower(btrim(r.title))
      and existing.created_at::date = coalesce(r.created_at, now())::date
  );
  get diagnostics v_announcements_inserted = row_count;

  return jsonb_build_object(
    'deadlines', jsonb_build_object(
      'inserted', v_deadlines_inserted,
      'skipped', v_deadlines_total - v_deadlines_inserted
    ),
    'timetable', jsonb_build_object(
      'inserted', v_timetable_inserted,
      'skipped', v_timetable_total - v_timetable_inserted
    ),
    'reminders', jsonb_build_object(
      'inserted', v_reminders_inserted,
      'skipped', v_reminders_total - v_reminders_inserted
    ),
    'announcements', jsonb_build_object(
      'inserted', v_announcements_inserted,
      'skipped', v_announcements_total - v_announcements_inserted
    )
  );
end;
$$;

comment on function public.import_legacy_data(jsonb) is
  'Admin-only, idempotent import of legacy UniHub localStorage records. Inserts missing natural keys only; never updates or deletes.';

revoke all on function public.import_legacy_data(jsonb) from public, anon;
grant execute on function public.import_legacy_data(jsonb) to authenticated;
