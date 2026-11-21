import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Loader2, Lock, LogIn, LogOut, ShieldCheck } from 'lucide-react';
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 bg-bg">
      {/* Subtle top-left radial lift */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-surface/40 blur-[130px]" />
      </div>

      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-text-3 transition-colors hover:text-text"
        >
          <ArrowLeft className="h-3.5 w-3.5 stroke-[1.5]" aria-hidden="true" />
          <span>Back to student portal</span>
        </Link>

        <div className="glass rounded-xl shadow-elev-3 p-6 sm:p-8 border border-glass-border">
          <Brand />

          <div className="mt-6 flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-inset shadow-inset-1 border border-hairline text-accent">
              <Lock className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-serif tracking-tight text-text">Administrator sign in</h1>
              <p className="mt-1 text-xs leading-relaxed text-text-3">
                Authorized administrators can manage deadlines, timetable, reminders, and class notices. Students do not require sign in.
              </p>
            </div>
          </div>

          {!configured && (
            <div className="mt-5 rounded-md border-l-[3px] border-l-warning bg-surface-inset shadow-inset-1 p-3.5 text-xs leading-relaxed text-text-2">
              <p className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning stroke-[1.5]" aria-hidden="true" />
                <span>
                  Supabase is not configured. Add environment variables to your configuration and restart the application.
                </span>
              </p>
            </div>
          )}

          {notAdmin && configured && (
            <div className="mt-5 rounded-md border-l-[3px] border-l-danger bg-surface-inset shadow-inset-1 p-3.5 text-xs leading-relaxed text-text-2">
              <p className="flex items-start gap-2 font-semibold text-danger">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 stroke-[1.5]" aria-hidden="true" />
                <span>Account not authorized.</span>
              </p>
              <p className="mt-1 pl-5 text-text-3">
                {user?.email ? (
                  <>
                    Signed in as <span className="font-semibold text-text">{user.email}</span>. Request administrator access in Supabase or switch accounts.
                  </>
                ) : (
                  'Request administrator authorization from the repository owner.'
                )}
              </p>
            </div>
          )}

          {error && configured && (
            <p className="mt-5 rounded-md border-l-[3px] border-l-danger bg-surface-inset shadow-inset-1 p-3 text-xs leading-relaxed text-danger">
              {error}
            </p>
          )}

          <div className="mt-6 space-y-2.5">
            {session && !isAdmin ? (
              <Button variant="secondary" className="w-full" icon={LogOut} onClick={signOut}>
                Sign out and use another account
              </Button>
            ) : (
              <Button
                className="w-full"
                icon={busy ? Loader2 : LogIn}
                onClick={handleSignIn}
                disabled={busy || !configured}
              >
                {busy ? 'Connecting to Google…' : 'Continue with Google'}
              </Button>
            )}
          </div>

          <div className="mt-6 flex items-start gap-2 rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-3 text-xs leading-relaxed text-text-3">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent stroke-[1.5]" aria-hidden="true" />
            <span>Administrator access is verified against Supabase allowlist and protected by Row Level Security.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
