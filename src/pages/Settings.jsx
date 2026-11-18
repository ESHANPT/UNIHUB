import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BellRing, Check, Info, Lock, Monitor, Moon, ShieldCheck, Sun } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import { useToast } from '../components/ui/Toast';
import {
  notificationPermission,
  notificationsSupported,
  requestNotificationPermission,
} from '../hooks/useNotifications';
import { cn } from '../lib/utils';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import PwaInstallCard from '../components/pwa/PwaInstallCard';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun, hint: 'Bright and crisp' },
  { value: 'dark', label: 'Dark', icon: Moon, hint: 'Easy on the eyes' },
  { value: 'system', label: 'System', icon: Monitor, hint: 'Match your device' },
];

export default function Settings() {
  const { isAdmin } = useAuth();
  const notify = useToast();
  const [permission, setPermission] = useState(() => notificationPermission());
  const { theme, setTheme } = useTheme();

  const supported = notificationsSupported();

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') notify('Notifications enabled for this browser.', 'success');
    else if (result === 'denied') notify('Notifications are blocked in your browser settings.', 'error');
    else notify('Notification permission was not granted.', 'info');
  };

  return (
    <div className="animate-rise">
      <PageHeader title="Preferences" subtitle="Make the class portal comfortable for you." />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Sun className="h-4 w-4 text-brand" aria-hidden="true" />
            Appearance
          </h2>
          <p className="mt-1 text-xs text-muted">Pick a theme. System follows your device setting.</p>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {THEME_OPTIONS.map((option) => {
              const active = theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  aria-pressed={active}
                  className={cn(
                    'flex flex-col items-start gap-1.5 rounded-2xl border px-3.5 py-3 text-left transition',
                    active
                      ? 'border-brand bg-brand-soft text-brand-ink'
                      : 'border-line bg-soft text-muted hover:border-brand/30 hover:text-ink',
                  )}
                >
                  <option.icon className="h-4 w-4" aria-hidden="true" />
                  <span className="text-sm font-semibold">{option.label}</span>
                  <span className="text-[10px] leading-tight">{option.hint}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <BellRing className="h-4 w-4 text-brand" aria-hidden="true" />
            Notifications
          </h2>
          <p className="mt-1 text-xs text-muted">
            Reminders are shared with the whole class. UniHub can nudge you while this tab is open.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'badge',
                permission === 'granted' ? 'tone-emerald' : permission === 'denied' ? 'tone-rose' : 'tone-slate',
              )}
            >
              {supported ? `Permission: ${permission}` : 'Not supported in this browser'}
            </span>
            {supported && permission === 'default' ? (
              <Button size="sm" icon={BellRing} onClick={handleEnableNotifications}>
                Enable notifications
              </Button>
            ) : null}
            {permission === 'granted' ? (
              <span className="badge tone-emerald">
                <Check className="h-3 w-3" aria-hidden="true" />
                Ready
              </span>
            ) : null}
          </div>

          <p className="mt-4 rounded-xl border border-line bg-soft px-3 py-2.5 text-[11px] leading-relaxed text-muted">
            Browser notifications cannot be delivered while UniHub is closed. Reminders always remain visible on the
            dashboard and reminders page.
          </p>
        </section>

        <PwaInstallCard />

        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Info className="h-4 w-4 text-brand" aria-hidden="true" />
            About this portal
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            This is the read-only student view. Deadlines, timetable entries, reminders and announcements are managed by
            your class administrator and loaded from a shared Supabase database. There are no student accounts or
            personal completion tracking in this version.
          </p>
        </section>
      </div>

      <section className="card mt-5 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
            {isAdmin ? <ShieldCheck className="h-5 w-5" aria-hidden="true" /> : <Lock className="h-5 w-5" aria-hidden="true" />}
          </div>
          <div>
            <p className="text-sm font-semibold">{isAdmin ? 'You are signed in as an administrator' : 'Class administrator?'}</p>
            <p className="mt-0.5 text-xs text-muted">
              {isAdmin
                ? 'Manage shared class information from the admin panel.'
                : 'Sign in with the authorised Google account to manage class information.'}
            </p>
          </div>
        </div>
        <Link
          to={isAdmin ? '/admin' : '/admin/login'}
          className="btn btn-secondary btn-sm shrink-0 self-start sm:self-auto"
        >
          {isAdmin ? 'Open admin panel' : 'Administrator sign in'}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
