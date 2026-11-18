import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Megaphone,
  Radio,
  Sparkles,
} from 'lucide-react';
import { useClassData } from '../store/ClassDataContext';
import useNow from '../hooks/useNow';
import { classesForDay, sortAnnouncements, splitReminders, upcomingPendingDeadlines } from '../lib/selectors';
import {
  DAYS_SHORT,
  formatDate,
  formatLongDate,
  formatTime12,
  greeting,
  subjectColor,
  todayName,
} from '../lib/utils';
import { CategoryBadge, CountdownBadge, PriorityBadge, SubjectChip } from '../components/ui/Badge';
import StatCard from '../components/ui/StatCard';
import { ErrorBanner, PageSkeleton } from '../components/ui/DataStatus';

function SectionCard({ title, icon: Icon, to, linkLabel = 'View all', children }) {
  return (
    <section className="card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-brand" aria-hidden="true" />
          {title}
        </h2>
        {to ? (
          <Link
            to={to}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-ink transition hover:underline"
          >
            {linkLabel}
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default function Dashboard() {
  const { data, loading, error, refresh } = useClassData();
  const now = useNow(30000);
  const today = todayName();

  const todayClasses = useMemo(() => classesForDay(data.classes, today), [data.classes, today]);
  const upcoming = useMemo(() => upcomingPendingDeadlines(data.deadlines, now), [data.deadlines, now]);
  const reminders = useMemo(() => splitReminders(data.reminders, new Date(now)), [data.reminders, now]);
  const announcements = useMemo(() => sortAnnouncements(data.announcements).slice(0, 3), [data.announcements]);

  const pendingReminders = reminders.overdue.length + reminders.dueToday.length + reminders.upcoming.length;
  const nextDeadline = upcoming[0];
  const firstClass = todayClasses[0];
  const todayIndex = (new Date(now).getDay() + 6) % 7;

  if (loading) {
    return (
      <div className="animate-rise">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="animate-rise space-y-6">
      <ErrorBanner message={error} onRetry={refresh} />

      <section className="hero-surface card relative overflow-hidden p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 rounded-full bg-brand opacity-25 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
              <span className="inline-flex items-center gap-1.5 text-brand-ink">
                <Radio className="h-3.5 w-3.5" aria-hidden="true" />
                Live class view
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-line sm:block" aria-hidden="true" />
              <span>{formatLongDate(new Date(now))}</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-[1.75rem]">
              {greeting(new Date(now))}, scholar <span aria-hidden="true">👋</span>
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              {upcoming.length === 0
                ? 'No deadlines on the radar right now. A rare and beautiful thing.'
                : `You have ${upcoming.length} upcoming deadline${upcoming.length === 1 ? '' : 's'} and ${todayClasses.length} class${todayClasses.length === 1 ? '' : 'es'} today.`}
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 py-1 text-[11px] font-medium text-muted">
              <Sparkles className="h-3 w-3 text-brand" aria-hidden="true" />
              Read-only · updates automatically when your class admin publishes changes
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-line bg-surface/70 px-5 py-4 backdrop-blur">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                {new Date(now).toLocaleDateString(undefined, { month: 'short' })}
              </p>
              <p className="text-3xl font-bold leading-tight">{new Date(now).getDate()}</p>
              <p className="text-[10px] font-semibold uppercase text-muted">{DAYS_SHORT[todayIndex]}</p>
            </div>
            <div className="h-12 w-px bg-line" aria-hidden="true" />
            <div className="space-y-1 text-xs">
              <p className="font-semibold">{todayClasses.length} classes today</p>
              <p className="text-muted">{pendingReminders} class reminders</p>
              <p className="text-muted">{announcements.length} recent notices</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Upcoming deadlines"
          value={upcoming.length}
          hint={nextDeadline ? `Next: ${nextDeadline.title}` : 'Nothing scheduled'}
          icon={CalendarClock}
          tone="brand"
        />
        <StatCard
          label="Classes today"
          value={todayClasses.length}
          hint={firstClass ? `${formatTime12(firstClass.startTime)} · ${firstClass.subject}` : 'No classes — free day'}
          icon={CalendarDays}
          tone="sky"
        />
        <StatCard
          label="Class reminders"
          value={pendingReminders}
          hint={reminders.dueToday.length > 0 ? `${reminders.dueToday.length} due today` : 'Shared with the class'}
          icon={BellRing}
          tone="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Today's timetable" icon={CalendarDays} to="/timetable" linkLabel="Full week">
            {todayClasses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line bg-soft/60 px-4 py-6 text-center">
                <p className="text-sm font-semibold">No classes today 🎉</p>
                <p className="mt-1 text-xs text-muted">Use the time to get ahead, or check the rest of your week.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {todayClasses.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center gap-3 rounded-xl border border-line/80 bg-soft/50 px-3 py-2.5"
                  >
                    <div className="w-[4.5rem] shrink-0">
                      <p className="text-xs font-bold">{formatTime12(entry.startTime)}</p>
                      <p className="text-[10px] text-muted">{formatTime12(entry.endTime)}</p>
                    </div>
                    <span
                      className="h-9 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: subjectColor(entry.subject) }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{entry.subject}</p>
                      <p className="flex items-center gap-1 truncate text-[11px] text-muted">
                        <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                        {entry.location || 'Location TBC'}
                        {entry.lecturer ? ` · ${entry.lecturer}` : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Upcoming deadlines" icon={CalendarClock} to="/deadlines">
            {upcoming.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line bg-soft/60 px-4 py-6 text-center">
                <p className="flex items-center justify-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                  You're all caught up
                </p>
                <p className="mt-1 text-xs text-muted">New deadlines will appear here as your admin adds them.</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {upcoming.slice(0, 4).map((deadline) => (
                  <li key={deadline.id}>
                    <Link
                      to="/deadlines"
                      className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-soft"
                    >
                      <span
                        className="h-9 w-1 shrink-0 rounded-full"
                        style={{ backgroundColor: subjectColor(deadline.subject) }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{deadline.title}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                          <SubjectChip subject={deadline.subject} />
                          <PriorityBadge priority={deadline.priority} />
                        </p>
                      </div>
                      <CountdownBadge value={deadline.dueDate} now={now} className="shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Class reminders" icon={BellRing} to="/reminders">
            {reminders.overdue.length + reminders.dueToday.length + reminders.upcoming.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line bg-soft/60 px-4 py-6 text-center">
                <p className="text-sm font-semibold">Nothing posted yet</p>
                <p className="mt-1 text-xs text-muted">Class-wide reminders will show up here.</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {[...reminders.overdue, ...reminders.dueToday, ...reminders.upcoming]
                  .slice(0, 4)
                  .map((reminder) => (
                    <li key={reminder.id} className="rounded-xl px-2 py-2 transition hover:bg-soft">
                      <p className="text-xs font-medium leading-snug">{reminder.title}</p>
                      <CountdownBadge value={reminder.datetime} now={now} className="mt-1" />
                    </li>
                  ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Recent announcements" icon={Megaphone} to="/announcements" linkLabel="Board">
            {announcements.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line bg-soft/60 px-4 py-6 text-center">
                <p className="text-sm font-semibold">No announcements yet</p>
                <p className="mt-1 text-xs text-muted">Published class notices will appear here.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {announcements.map((announcement) => (
                  <li key={announcement.id}>
                    <Link
                      to="/announcements"
                      className="block rounded-xl border border-line/80 bg-soft/50 p-3 transition hover:-translate-y-0.5 hover:border-brand/30"
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        <CategoryBadge category={announcement.category} />
                        <span className="text-[10px] font-medium text-muted">
                          {formatDate(announcement.date, { short: true })}
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-xs font-semibold leading-snug">{announcement.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
