# UniHub

A shared class hub for university students. The student portal is public and read-only; a single
allowlisted administrator signs in with Google to manage deadlines, the weekly timetable, class-wide
reminders and announcements.

Data is stored in Supabase (PostgreSQL) and protected by Row Level Security, so every write is enforced
by the database rather than by hidden buttons in the UI.

## Features

- **Student portal (no account needed)** — dashboard, deadlines, weekly timetable, reminders and the
  announcement board, all read from Supabase.
- **Deadlines** — automatically split into *Upcoming* and *Past* by due date. Nothing is archived or
  deleted automatically. Admins can edit or delete past deadlines and toggle `pending` / `completed`.
- **Timetable** — a seven-day weekly grid with subject, lecturer, room and times.
- **Reminders** — class-wide notices. Browser notifications fire while the tab is open; there is no
  per-student completion state in this version.
- **Announcements** — drafts, publish-now and scheduled publishing using a separate `published_at`
  timestamp. Students only ever see published notices whose publish time has passed.
- **Admin panel** — Google sign-in, an authenticated allowlist, full CRUD, and a safe one-time import of
  the old localStorage prototype data.
- **Live updates** — a single Realtime subscription refreshes all four collections after any change.
- **Dark mode** — light / dark / system preference stored locally in the browser.

## Tech stack

React 19 · Vite 8 · React Router 7 · Tailwind CSS 4 · Lucide icons · Supabase JS client.

## Getting started

### 1. Install

```bash
npm install
```

### 2. Create the database

In the Supabase dashboard, open **SQL Editor** and run the migrations in order:

1. `supabase/migrations/0001_schema.sql` — tables, constraints, indexes, triggers
2. `supabase/migrations/0002_rls.sql` — grants, policies, admin helper functions
3. `supabase/migrations/0003_legacy_import.sql` — admin-only, idempotent import function
4. `supabase/migrations/0004_realtime.sql` — adds the four tables to the Realtime publication

All migrations are idempotent and can be re-run safely.

### 3. Configure the frontend

```bash
cp .env.example .env
```

Set the two public values from **Project Settings → API**:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

The publishable (anon) key is designed for browser use and is limited by RLS. **Never** put a
service-role key in this project — it bypasses every policy.

### 4. Enable Google sign-in

1. Create an OAuth client in Google Cloud Console (type: *Web application*).
2. Add the Supabase callback as an authorised redirect URI:
   `https://<project-ref>.supabase.co/auth/v1/callback`
3. In Supabase, open **Authentication → Providers → Google**, enable it and paste the client ID and
   secret.
4. In **Authentication → URL Configuration**, set the Site URL to your deployed origin and add redirect
   URLs for local and production admin routes, for example:
   - `http://localhost:5173/**`
   - `https://your-domain.example/**`

The app redirects back to `/admin` after sign-in.

### 5. Authorise the administrator

Sign in once at `/admin/login` with the owner's Google account, then run this in the SQL editor with the
owner's email:

```sql
insert into public.admin_users (id)
select id from auth.users where email = 'owner@example.com'
on conflict (id) do nothing;
```

Access is checked by user ID, not email. Non-allowlisted Google accounts can authenticate but can read
nothing private and cannot write anything.

### 6. Run

```bash
npm run dev
```

Open the printed local URL. The student portal is at `/`, the admin panel at `/admin`.

## Migrating the original prototype data

The first version of UniHub stored everything in `localStorage` under `unihub:data`. It is never
modified or deleted automatically.

1. Open the prototype in the same browser and sign in at `/admin`.
2. Go to **Admin → Data & migration**.
3. Review the counts, then import.

The browser validates each record, and the database function re-checks administrator membership,
payload size and constraints. It inserts only records whose natural key does not already exist, never
updates or deletes, and returns per-table `inserted` / `skipped` counts. Completed personal reminders
are skipped because reminders are now class-wide and read-only.

## Security model

- Students are anonymous. Public `SELECT` policies expose only published data (and only published
  announcements whose `published_at` has passed).
- `INSERT`, `UPDATE` and `DELETE` require `private.is_admin()`, a `SECURITY DEFINER` function with a
  locked `search_path`, backed by the `admin_users` table.
- `admin_users` has no grants for `anon` or `authenticated`; `public.am_i_admin()` is an invoker wrapper
  used by the UI to decide what to render.
- The frontend uses only the publishable key. RLS is the enforcement layer.
- Legacy imports go through `import_legacy_data(jsonb)`, which is executable only by authenticated
  users and re-checks the allowlist.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build locally |

## Deploying

The output in `dist/` is a static single-page app. Host it on any static host (Vercel, Netlify,
Cloudflare Pages, GitHub Pages, …) and:

- set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the host's build environment;
- add an SPA fallback rewriting unknown paths to `index.html` (needed for `/admin/*`);
- add the deployed origin and callback to Supabase Auth URL configuration;
- optionally add a custom domain.

## Pushing to GitHub

The repository is ready to publish. `.env` and build output are ignored; `.env.example` is committed.

```bash
git add .
git commit -m "UniHub: Supabase-backed student portal and admin panel"
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Create the empty repository on GitHub first (without a README or .gitignore, so histories do not
conflict). Check `git status` before committing and confirm `.env` never appears in the staged files.

## Project structure

```
src/
  components/        layout, cards, forms, admin-aware UI
  hooks/             live clock and browser notification helpers
  lib/               Supabase client, mappers, validation, selectors, utilities
  pages/             public student pages
  pages/admin/       guarded admin screens
  store/             auth, theme and shared class-data providers
supabase/migrations/ schema, RLS, legacy import and Realtime SQL
```

## Known limitations

- One administrator (the allowlist supports more, but the UI is single-owner).
- No student accounts, personal completion tracking or per-student reminders.
- Browser notifications cannot run while the site is closed.
- An anonymous visitor who knows a public URL can read published class information by design.
