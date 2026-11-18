import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Loader2, Lock, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import Brand from '../../components/layout/Brand';
import Button from '../../components/ui/Button';
import { FullScreenLoader } from '../../components/auth/AdminGuard';
import { useAuth } from '../../store/AuthContext';

export default function AdminLogin() {
  const { configured, loading, session, user, isAdmin, adminLoading, error, signIn, signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const [busy, setBusy] = useState(false);

  const errorCode = searchParams.get('error');
  const notAdmin = errorCode === 'not_admin' || (Boolean(session) && !isAdmin && !adminLoading);

  if (loading || (session && adminLoading)) {
    return <FullScreenLoader label="Signing you in…" />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSignIn = async () => {
    setBusy(true);
    await signIn('/admin');
    setBusy(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-brand opacity-20 blur-[120px]" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-fuchsia-400 opacity-15 blur-[130px]" />
      </div>

      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to the student portal
        </Link>

        <div className="card p-6 sm:p-8">
          <Brand />

          <div className="mt-6 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Administrator sign in</h1>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Only the authorised class administrator can manage deadlines, timetable, reminders and announcements.
                Students never need an account.
              </p>
            </div>
          </div>

          {!configured ? (
            <div className="mt-5 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              <p className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Supabase is not configured. Add <code className="font-semibold">VITE_SUPABASE_URL</code> and{' '}
                <code className="font-semibold">VITE_SUPABASE_PUBLISHABLE_KEY</code> to your <code>.env</code> file,
                then restart the dev server.
              </p>
            </div>
          ) : null}

          {notAdmin && configured ? (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-xs leading-relaxed text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              <p className="flex items-start gap-2 font-semibold">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                This Google account is not an authorised administrator.
              </p>
              <p className="mt-1 pl-5">
                {user?.email ? (
                  <>
                    Signed in as <span className="font-semibold">{user.email}</span>. Ask the project owner to add
                    your Supabase user ID to the admin allowlist, or try a different account.
                  </>
                ) : (
                  'Ask the project owner to add your Supabase user ID to the admin allowlist.'
                )}
              </p>
            </div>
          ) : null}

          {error && configured ? (
            <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-relaxed text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </p>
          ) : null}

          <div className="mt-6 space-y-2">
            {session && !isAdmin ? (
              <Button variant="secondary" className="w-full" icon={LogOut} onClick={signOut}>
                Sign out and try another account
              </Button>
            ) : (
              <Button
                className="w-full"
                icon={busy ? Loader2 : LogIn}
                onClick={handleSignIn}
                disabled={busy || !configured}
              >
                {busy ? 'Redirecting to Google…' : 'Continue with Google'}
              </Button>
            )}
          </div>

          <div className="mt-6 flex items-start gap-2 rounded-xl border border-line bg-soft px-3 py-2.5 text-[11px] leading-relaxed text-muted">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
            Administrator access is verified against a protected allowlist in Supabase and enforced again by Row Level
            Security on every write.
          </div>
        </div>
      </div>
    </div>
  );
}
