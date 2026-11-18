-- =============================================================================
-- UniHub · 0002 — grants, admin verification, row level security
-- Run after 0001_schema.sql.
--
-- Security model:
--   * anon + authenticated : read the public class data only
--   * authenticated admin : full CRUD on class data (verified against the
--                           admin_users allowlist at the database level)
--   * everyone else       : no write access, no access to admin_users
--
-- RLS is the authority. Frontend guards only improve the UX.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Private schema for the allowlist check.
-- Do NOT add `private` to the project's Exposed schemas.
-- -----------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

-- SECURITY DEFINER lets the check read admin_users without a recursive policy.
-- search_path is pinned and every name is schema-qualified.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where id = (select auth.uid())
  );
$$;

revoke all on function private.is_admin() from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;

-- API-callable wrapper for the admin route guard. It is SECURITY INVOKER and
-- only reports the caller's own membership; it accepts no parameters and
-- returns a boolean, so it cannot expose allowlist rows.
create or replace function public.am_i_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(private.is_admin(), false);
$$;

revoke all on function public.am_i_admin() from public, anon;
grant execute on function public.am_i_admin() to authenticated;

-- -----------------------------------------------------------------------------
-- Row level security on every application table
-- -----------------------------------------------------------------------------
alter table public.admin_users enable row level security;
alter table public.deadlines enable row level security;
alter table public.timetable enable row level security;
alter table public.reminders enable row level security;
alter table public.announcements enable row level security;

-- -----------------------------------------------------------------------------
-- Privileges
-- Supabase projects may retain default grants on new tables, so revoke
-- explicitly and grant back only what each role needs. RLS alone is not a
-- substitute for grants.
-- -----------------------------------------------------------------------------

-- The allowlist is not reachable through the Data API at all. No SELECT,
-- INSERT, UPDATE or DELETE grants and no policies: only the SQL editor
-- (postgres) and the SECURITY DEFINER helper can touch it.
revoke all on table public.admin_users from anon, authenticated;

revoke all on table public.deadlines, public.timetable, public.reminders, public.announcements
  from anon, authenticated;

-- Public class information is readable by signed-out visitors and students.
grant select on table public.deadlines, public.timetable, public.reminders, public.announcements
  to anon, authenticated;

-- Writes are granted only to signed-in users; RLS policies below restrict them
-- to allowlisted administrators.
grant insert, update, delete on table public.deadlines, public.timetable, public.reminders, public.announcements
  to authenticated;

-- -----------------------------------------------------------------------------
-- Public read policies
-- -----------------------------------------------------------------------------
create policy "class data is publicly readable"
  on public.deadlines
  for select
  to anon, authenticated
  using (true);

create policy "timetable is publicly readable"
  on public.timetable
  for select
  to anon, authenticated
  using (true);

create policy "reminders are publicly readable"
  on public.reminders
  for select
  to anon, authenticated
  using (true);

-- Drafts, unpublished notices and scheduled notices stay hidden from the
-- public until their publish time.
create policy "published announcements are publicly readable"
  on public.announcements
  for select
  to anon, authenticated
  using (is_published and published_at is not null and published_at <= now());

-- -----------------------------------------------------------------------------
-- Administrator write policies
-- `for all` covers SELECT, INSERT, UPDATE and DELETE. The USING clause governs
-- SELECT/UPDATE/DELETE and WITH CHECK governs INSERT/UPDATE, so an admin can
-- manage every row while non-admins are rejected by the database.
-- -----------------------------------------------------------------------------
create policy "admins manage deadlines"
  on public.deadlines
  for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "admins manage timetable"
  on public.timetable
  for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "admins manage reminders"
  on public.reminders
  for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "admins manage announcements"
  on public.announcements
  for all
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- -----------------------------------------------------------------------------
-- Bootstrap the single administrator AFTER that Google account has signed in
-- at least once. Run this manually in the SQL editor (postgres bypasses RLS):
--
--   insert into public.admin_users (id)
--   select id from auth.users where email = 'owner@example.com'
--   on conflict (id) do nothing;
--
-- Verify:
--   select u.id, u.email, a.created_at
--   from public.admin_users a
--   join auth.users u on u.id = a.id;
-- -----------------------------------------------------------------------------
