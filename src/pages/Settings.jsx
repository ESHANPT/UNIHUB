import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BellRing, Info, Lock, Monitor, Moon, ShieldCheck, Sun } from 'lucide-react';
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
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import PwaInstallCard from '../components/pwa/PwaInstallCard';

const THEME_OPTIONS = [
  { value: 'dark', label: 'Dark', icon: Moon, hint: 'Matte obsidian' },
  { value: 'light', label: 'Light', icon: Sun, hint: 'Alabaster stone' },
  { value: 'system', label: 'System', icon: Monitor, hint: 'Follows operating system' },
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
    else if (result === 'denied') notify('Notifications blocked in browser settings.', 'error');
    else notify('Notification permission was not granted.', 'info');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Preferences" subtitle="Display, theme, and notification settings." />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appearance Section */}
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
            <Sun className="h-4 w-4 text-accent stroke-[1.5]" aria-hidden="true" />
            <span>Theme & appearance</span>
          </h2>
          <p className="mt-1 text-xs text-text-3">
            Choose your preferred contrast. Changes apply with a smooth cross-fade.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {THEME_OPTIONS.map((option) => {
              const active = theme === option.value;
              const Icon = option.icon;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  aria-pressed={active}
                  className={cn(
                    'flex flex-col items-start gap-1.5 p-3.5 rounded-md text-left transition-all duration-base select-none cursor-pointer',
                    active
                      ? 'bg-surface-inset shadow-inset-1 border border-accent-line text-text'
                      : 'bg-surface shadow-elev-1 border border-hairline text-text-3 hover:text-text hover:border-hairline/80'
                  )}
                >
                  <Icon className={cn('h-4 w-4 stroke-[1.5]', active ? 'text-accent' : 'text-text-3')} />
                  <span className="text-xs font-semibold">{option.label}</span>
                  <span className="text-[10px] text-text-3 leading-tight">{option.hint}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Notifications Section */}
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
            <BellRing className="h-4 w-4 text-accent stroke-[1.5]" aria-hidden="true" />
            <span>Browser notifications</span>
          </h2>
          <p className="mt-1 text-xs text-text-3">
            Receive reminder alerts while UniHub remains open in a browser tab.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <Badge tone={permission === 'granted' ? 'success' : permission === 'denied' ? 'danger' : 'neutral'} dot>
              {supported ? `Status: ${permission}` : 'Not supported'}
            </Badge>

            {supported && permission === 'default' && (
              <Button size="sm" icon={BellRing} onClick={handleEnableNotifications}>
                Request permission
              </Button>
            )}
          </div>

          <p className="mt-4 rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-3 text-[11px] leading-relaxed text-text-3">
            Background push delivery requires an active service worker and supported mobile device. Reminders always appear inside the app interface.
          </p>
        </Card>

        {/* PWA Install Card */}
        <PwaInstallCard />

        {/* About Portal Section */}
        <Card className="p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
            <Info className="h-4 w-4 text-accent stroke-[1.5]" aria-hidden="true" />
            <span>About UniHub</span>
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-text-2">
            UniHub is a student dashboard for university deadlines, timetable schedules, reminders, and class notices. Information is published by class administrators and synchronized via Supabase.
          </p>
        </Card>
      </div>

      {/* Admin Access Panel */}
      <Card className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-inset shadow-inset-1 border border-hairline text-accent">
            {isAdmin ? (
              <ShieldCheck className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
            ) : (
              <Lock className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-text">
              {isAdmin ? 'Signed in as administrator' : 'Class administrator'}
            </p>
            <p className="mt-0.5 text-xs text-text-3">
              {isAdmin
                ? 'Manage class deadlines, schedules, and notices in the admin panel.'
                : 'Sign in with an authorized account to publish updates.'}
            </p>
          </div>
        </div>

        <Link
          to={isAdmin ? '/admin' : '/admin/login'}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-surface border border-hairline shadow-elev-1 text-xs font-semibold text-text hover:border-accent-line transition-all duration-base shrink-0 self-start sm:self-auto"
        >
          <span>{isAdmin ? 'Open admin panel' : 'Administrator sign in'}</span>
          <ArrowRight className="h-3.5 w-3.5 stroke-[1.5]" aria-hidden="true" />
        </Link>
      </Card>
    </div>
  );
}
