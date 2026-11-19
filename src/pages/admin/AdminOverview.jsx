import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  CalendarDays,
  Megaphone,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useClassData } from '../../store/ClassDataContext';
import { useAuth } from '../../store/AuthContext';
import useNow from '../../hooks/useNow';
import {
  classesForDay,
  sortAnnouncements,
  splitReminders,
  upcomingPendingDeadlines,
} from '../../lib/selectors';
import { formatDate, formatDateTime, greeting, todayName } from '../../lib/utils';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ErrorBanner, PageSkeleton } from '../../components/ui/DataStatus';
import { CategoryBadge, CountdownBadge, PriorityBadge } from '../../components/ui/Badge';

export default function AdminOverview() {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useClassData();
  const now = useNow(30000);
  const today = todayName();

  const upcoming = useMemo(() => upcomingPendingDeadlines(data.deadlines, now), [data.deadlines, now]);
  const todayClasses = useMemo(() => classesForDay(data.classes, today), [data.classes, today]);
  const reminders = useMemo(() => splitReminders(data.reminders, new Date(now)), [data.reminders, now]);
  const announcements = useMemo(() => sortAnnouncements(data.announcements), [data.announcements]);
  const drafts = announcements.filter((item) => !item.isPublished).length;

  if (loading) {
    return (
      <div>
        <PageHeader title="Admin overview" subtitle="Manage class schedules and notices." />
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting(new Date(now))}, admin`}
        subtitle={user?.email ? `Signed in as ${user.email}` : 'Class management portal.'}
        actions={
          <Link to="/admin/deadlines">
            <Button icon={Plus}>New deadline</Button>
          </Link>
        }
      />

      <ErrorBanner message={error} onRetry={refresh} />

      <div className="flex items-start gap-3 rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent stroke-[1.5]" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-text-3">
          Changes published here update the database in Supabase and sync live to the student portal. Row Level Security protects every administrative write.
        </p>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Upcoming deadlines"
          value={upcoming.length}
          hint={upcoming[0] ? `Next: ${upcoming[0].title}` : 'Nothing scheduled'}
          icon={CalendarClock}
        />
        <StatCard
          label="Classes today"
          value={todayClasses.length}
          hint={todayClasses[0] ? todayClasses[0].subject : 'No classes today'}
          icon={CalendarDays}
        />
        <StatCard
          label="Class reminders"
          value={reminders.overdue.length + reminders.dueToday.length + reminders.upcoming.length}
          hint={`${reminders.dueToday.length} due today`}
          icon={BellRing}
        />
        <StatCard
          label="Announcements"
          value={announcements.length}
          hint={drafts ? `${drafts} unpublished draft${drafts === 1 ? '' : 's'}` : 'All published'}
          icon={Megaphone}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">Next deadlines</h2>
            <Link
              to="/admin/deadlines"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              <span>Manage</span>
              <ArrowRight className="h-3 w-3 stroke-[1.5]" aria-hidden="true" />
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-6 text-center text-xs text-text-3">
              No upcoming deadlines scheduled.
            </div>
          ) : (
            <ul className="divide-y divide-hairline/60">
              {upcoming.slice(0, 4).map((item) => (
                <li key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text truncate">{item.title}</p>
                    <p className="text-[11px] text-text-3 mt-0.5">{item.subject}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={item.priority} />
                    <CountdownBadge value={item.dueDate} now={now} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">Recent notices</h2>
            <Link
              to="/admin/announcements"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              <span>Manage</span>
              <ArrowRight className="h-3 w-3 stroke-[1.5]" aria-hidden="true" />
            </Link>
          </div>

          {announcements.length === 0 ? (
            <div className="rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-6 text-center text-xs text-text-3">
              No notices published yet.
            </div>
          ) : (
            <ul className="divide-y divide-hairline/60">
              {announcements.slice(0, 4).map((item) => (
                <li key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text truncate">{item.title}</p>
                    <p className="text-[11px] text-text-3 mt-0.5">
                      {formatDate(item.publishedAt || item.date, { short: true })}
                    </p>
                  </div>
                  <CategoryBadge category={item.category} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
