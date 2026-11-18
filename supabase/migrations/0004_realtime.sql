-- =============================================================================
-- UniHub · 0004 — Realtime publication
-- Run after 0001-0003. Safe to re-run: tables already in the publication are
-- skipped.
--
-- RealTime delivers Postgres Changes according to RLS, so anonymous students
-- receive changes for public rows and admins receive everything. The client
-- uses one channel for all four tables and debounces a refetch.
-- =============================================================================

do $$
declare
  table_name text;
begin
  foreach table_name in array array['deadlines', 'timetable', 'reminders', 'announcements']
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end;
$$;
