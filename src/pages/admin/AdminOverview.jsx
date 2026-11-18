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
      <div className="animate-rise">
        <PageHeader title="Admin overview" subtitle="Manage the shared class hub." />
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <PageHeader
        title={`${greeting(new Date(now))}, admin`}
        subtitle={user?.email ? `Signed in as ${user.email}` : 'Manage the shared class hub.'}
        actions={
          <Link to="/admin/deadlines">
            <Button icon={Plus}>New deadline</Button>
          </Link>
        }
      />

      <ErrorBanner message={error} onRetry={refresh} />

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-line bg-brand-soft/60 px-4 py-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-muted">
          Changes are saved to Supabase and appear on the public student portal automatically. Administrators are
          verified in the database; hiding buttons is never the only protection.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Upcoming deadlines"
          value={upcoming.length}
          hint={upcoming[0] ? `Next: ${upcoming[0].title}` : 'Nothing scheduled'}
          icon={CalendarClock}
          tone="brand"
        />
        <StatCard
          label="Classes today"
          value={todayClasses.length}
          hint={todayClasses[0] ? todayClasses[0].subject : 'No classes today'}
          icon={CalendarDays}
          tone="sky"
        />
        <StatCard
          label="Class reminders"
          value={reminders.overdue.length + reminders.dueToday.length + reminders.upcoming.length}
          hint={`${reminders.dueToday.length} due today`}
          icon={BellRing}
          tone="amber"
        />
        <StatCard
          label="Announcements"
          value={announcements.length}
          hint={drafts ? `${drafts} draft${drafts === 1 ? '' : 's'}` : 'All published'}
          icon={Megaphone}
          tone="violet"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Next deadlines</h2>
            <Link
              to="/admin/deadlines"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-ink hover:underline"
            >
              Manage <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line bg-soft/50 px-4 py-6 text-center text-xs text-muted">
              No upcoming deadlines yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {upcoming.slice(0, 4).map((deadline) => (
                <li
                  key={deadline.id}
                  className="flex items-center gap-3 rounded-xl border border-line/80 bg-soft/40 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{deadline.title}</p>
                    <p className="mt-0.5 text-[10px] text-muted">
                      {deadline.subject} · {formatDateTime(deadline.dueDate)}
                    </p>
                  </div>
                  <PriorityBadge priority={deadline.priority} />
                  <CountdownBadge value={deadline.dueDate} now={now} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Latest announcements</h2>
            <Link
              to="/admin/announcements"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-ink hover:underline"
            >
              Manage <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
          {announcements.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line bg-soft/50 px-4 py-6 text-center text-xs text-muted">
              No announcements yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {announcements.slice(0, 4).map((announcement) => (
                <li key={announcement.id} className="rounded-xl border border-line/80 bg-soft/40 px-3 py-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <CategoryBadge category={announcement.category} />
                    <span className="text-[10px] text-muted">
                      {formatDate(announcement.publishedAt || announcement.date, { short: true })}
                    </span>
                    <span className={`badge ${announcement.isPublished ? 'tone-emerald' : 'tone-slate'} ml-auto`}>
                      {announcement.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-1 text-xs font-semibold">{announcement.title}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
