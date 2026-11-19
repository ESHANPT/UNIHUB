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
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
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
      notify('Notifications enabled for this browser.', 'success');
    } else if (result === 'denied') {
      notify('Notifications were blocked in your browser settings.', 'error');
    } else {
      notify('Notification permission was not granted.', 'info');
    }
  };

  const granted = permission === 'granted';
  const denied = permission === 'denied' || permission === 'unsupported';

  return (
    <div className="bg-surface rounded-lg shadow-elev-1 border border-hairline p-4 sm:p-5 flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex items-start gap-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-inset shadow-inset-1 border border-hairline text-accent">
          {supported && !denied ? (
            <BellRing className="h-4 w-4 stroke-[1.5]" aria-hidden="true" />
          ) : (
            <BellOff className="h-4 w-4 stroke-[1.5] text-text-3" aria-hidden="true" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-text">
            {!supported
              ? 'Notifications are not supported here'
              : granted
                ? 'Browser notifications enabled'
                : denied
                  ? 'Browser notifications blocked'
                  : 'Enable browser notifications for reminders'}
          </p>
          <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-text-3">
            {!supported
              ? 'This browser does not support the Notification API. Reminders remain visible inside the app.'
              : granted
                ? 'UniHub checks shared reminders while this tab is open.'
                : denied
                  ? 'Allow notifications for this site in your browser settings to receive alerts.'
                  : 'Receive a reminder alert while UniHub is open in a tab.'}
          </p>
        </div>
      </div>

      {supported && permission === 'default' ? (
        <Button size="sm" icon={BellRing} onClick={handleRequest} className="shrink-0 self-start sm:self-auto">
          Enable alerts
        </Button>
      ) : granted ? (
        <Badge tone="success" dot className="shrink-0 self-start sm:self-auto">
          Enabled
        </Badge>
      ) : null}
    </div>
  );
}

const SECTIONS = [
  { key: 'overdue', title: 'Overdue', dot: 'bg-danger', empty: 'No overdue reminders.' },
  { key: 'dueToday', title: 'Due today', dot: 'bg-warning', empty: 'Nothing else scheduled for today.' },
  { key: 'upcoming', title: 'Upcoming', dot: 'bg-accent', empty: 'No upcoming reminders scheduled.' },
];

export default function Reminders() {
  const { data, loading, error, refresh } = useClassData();
  const now = useNow(30000);
  const groups = useMemo(() => splitReminders(data.reminders, new Date(now)), [data.reminders, now]);

  const totalCount = groups.overdue.length + groups.dueToday.length + groups.upcoming.length;

  if (loading) {
    return (
      <div>
        <PageHeader title="Reminders" subtitle="Class-wide alerts and notices." />
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reminders"
        subtitle="Shared reminders published by your class administrator."
        actions={
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={refresh}>
            Refresh
          </Button>
        }
      />

      <ErrorBanner message={error} onRetry={refresh} />

      <NotificationPanel />

      {totalCount === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No active reminders"
          description="Your administrator has not posted any reminders yet."
        />
      ) : (
        <div className="space-y-8">
          {SECTIONS.map((section) => {
            const items = groups[section.key];
            if (!items || items.length === 0) return null;

            return (
              <div key={section.key} className="space-y-3.5">
                <div className="flex items-center gap-2 px-1">
                  <span className={`h-2 w-2 rounded-full ${section.dot}`} aria-hidden="true" />
                  <h2 className="text-sm font-semibold text-text">{section.title}</h2>
                  <span className="text-xs text-text-3 tabular-nums font-medium">({items.length})</span>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} now={now} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
