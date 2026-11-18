import { useEffect, useMemo, useState } from 'react';
import { BellOff, BellRing, Check, RefreshCw } from 'lucide-react';
import { useClassData } from '../store/ClassDataContext';
import useNow from '../hooks/useNow';
import { useToast } from '../components/ui/Toast';
import {
  notificationPermission,
  notificationsSupported,
  requestNotificationPermission,
} from '../hooks/useNotifications';
import { splitReminders } from '../lib/selectors';
import { cn } from '../lib/utils';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { ErrorBanner, PageSkeleton } from '../components/ui/DataStatus';
import ReminderCard from '../components/reminders/ReminderCard';

function NotificationPanel() {
  const notify = useToast();
  const supported = notificationsSupported();
  const [permission, setPermission] = useState(() => notificationPermission());

  useEffect(() => {
    setPermission(notificationPermission());
  }, []);

  const handleRequest = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      notify('Notifications enabled. You will be nudged while UniHub is open.', 'success');
    } else if (result === 'denied') {
      notify('Notifications were blocked. You can re-enable them in your browser settings.', 'error');
    } else {
      notify('Notification permission was not granted.', 'info');
    }
  };

  const granted = permission === 'granted';
  const denied = permission === 'denied' || permission === 'unsupported';

  return (
    <div
      className={cn(
        'card mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between',
        granted && 'border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-500/25 dark:bg-emerald-500/[0.06]',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            granted ? 'tone-emerald' : denied ? 'tone-slate' : 'tone-brand',
          )}
        >
          {supported && !denied ? (
            <BellRing className="h-5 w-5" aria-hidden="true" />
          ) : (
            <BellOff className="h-5 w-5" aria-hidden="true" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">
            {!supported
              ? 'Notifications are not supported here'
              : granted
                ? 'Browser notifications are on'
                : denied
                  ? 'Browser notifications are blocked'
                  : 'Get a nudge when a class reminder is due'}
          </p>
          <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-muted">
            {!supported
              ? 'This browser does not expose the Notification API. Reminders still appear inside UniHub.'
              : granted
                ? 'UniHub checks shared reminders while this tab is open. Notifications stop once the tab or browser is closed.'
                : denied
                  ? 'Allow notifications for this site in your browser settings, then reload UniHub.'
                  : 'Allow notifications and UniHub will alert you for class reminders that come due while the app is open. Background delivery is not supported in this prototype.'}
          </p>
        </div>
      </div>

      {supported && permission === 'default' ? (
        <Button icon={BellRing} onClick={handleRequest} className="shrink-0">
          Enable notifications
        </Button>
      ) : granted ? (
        <span className="badge tone-emerald shrink-0 self-start sm:self-auto">
          <Check className="h-3 w-3" aria-hidden="true" />
          Enabled
        </span>
      ) : null}
    </div>
  );
}

const SECTIONS = [
  { key: 'overdue', title: 'Overdue', dot: 'bg-rose-500', empty: 'Nothing overdue.' },
  { key: 'dueToday', title: 'Due today', dot: 'bg-amber-500', empty: 'Nothing else due today.' },
  { key: 'upcoming', title: 'Upcoming', dot: 'bg-violet-500', empty: 'No upcoming reminders yet.' },
];

export default function Reminders() {
  const { data, loading, error, refresh } = useClassData();
  const now = useNow(30000);
  const groups = useMemo(() => splitReminders(data.reminders, new Date(now)), [data.reminders, now]);

  if (loading) {
    return (
      <div className="animate-rise">
        <PageHeader title="Reminders" subtitle="Small nudges that keep the semester on track." />
        <PageSkeleton />
      </div>
    );
  }

  const totalPending = groups.overdue.length + groups.dueToday.length + groups.upcoming.length;

  return (
    <div className="animate-rise">
      <PageHeader
        title="Reminders"
        subtitle="Class-wide reminders shared by your admin — no personal account needed."
        actions={
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refresh}>
            Refresh
          </Button>
        }
      />

      <ErrorBanner message={error} onRetry={refresh} />
      <NotificationPanel />

      {data.reminders.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No class reminders yet"
          description="When your class admin posts a reminder, it will appear here and on the dashboard."
        />
      ) : (
        <div className="space-y-7">
          {SECTIONS.map((section) => (
            <section key={section.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${section.dot}`} aria-hidden="true" />
                <h2 className="text-sm font-semibold">{section.title}</h2>
                <span className="badge tone-slate">{groups[section.key].length}</span>
                {section.key === 'dueToday' && groups.dueToday.length > 0 ? (
                  <span className="badge tone-amber">Focus</span>
                ) : null}
              </div>

              {groups[section.key].length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line bg-soft/50 px-4 py-5 text-xs text-muted">
                  {section.empty}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {groups[section.key].map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} now={now} />
                  ))}
                </div>
              )}
            </section>
          ))}
          <p className="text-center text-[11px] text-muted">{totalPending} shared reminders in total</p>
        </div>
      )}
    </div>
  );
}
