import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
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
  parseDateTime,
  subjectColor,
  todayName,
} from '../lib/utils';
import { CategoryBadge, CountdownBadge, PriorityBadge, SubjectChip } from '../components/ui/Badge';
import { ErrorBanner, PageSkeleton } from '../components/ui/DataStatus';

// Animation variants for the single orchestrated page-load moment (DESIGN.md §5.2)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function NextDeadlineHeroCard({ deadline, now }) {
  if (!deadline) {
    return (
      <div className="rounded-lg bg-surface-inset shadow-inset-1 border border-hairline/60 p-5 flex flex-col justify-between">
        <div>
          <span className="text-[11px] font-medium text-text-3">Next deadline</span>
          <p className="mt-2 text-base font-serif text-text">No pending deadlines</p>
          <p className="mt-1 text-xs text-text-3 leading-relaxed">
            All coursework is caught up. New deadlines published by your administrator will appear here.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-success font-medium">
          <CheckCircle2 className="h-4 w-4 stroke-[1.5]" aria-hidden="true" />
          <span>All submissions up to date</span>
        </div>
      </div>
    );
  }

  const dueDate = parseDateTime(deadline.dueDate);
  const diffHours = dueDate ? Math.max(0, Math.round((dueDate.getTime() - now) / (1000 * 60 * 60))) : 0;
  // Progress arc: max 7 days = 168h
  const progressRatio = Math.max(0, Math.min(1, 1 - diffHours / 168));
  const strokeDashoffset = 120 - 120 * progressRatio;

  return (
    <div className="rounded-lg bg-surface-inset shadow-inset-1 border border-hairline/60 p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-text-3">Priority deadline</span>
          <PriorityBadge priority={deadline.priority} />
        </div>

        <h3 className="mt-2 text-lg font-serif text-text tracking-tight break-words">
          {deadline.title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <SubjectChip subject={deadline.subject} />
          <CategoryBadge category={deadline.category} dot={false} />
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-hairline flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Subtle brass countdown progress arc */}
          <div className="relative w-10 h-10 shrink-0">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r="19"
                className="stroke-hairline fill-none"
                strokeWidth="2.5"
              />
              <motion.circle
                cx="22"
                cy="22"
                r="19"
                className="stroke-accent fill-none"
                strokeWidth="2.5"
                strokeDasharray="120"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 120 }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-accent">
              <Clock className="w-4 h-4 stroke-[1.5]" aria-hidden="true" />
            </div>
          </div>

          <div>
            <CountdownBadge value={deadline.dueDate} now={now} />
            <p className="mt-0.5 text-[11px] text-text-3 tabular-nums">
              Due {formatDate(deadline.dueDate, { short: true })}
            </p>
          </div>
        </div>

        <Link
          to="/deadlines"
          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
        >
          <span>View details</span>
          <ArrowRight className="h-3 w-3 stroke-[1.5]" aria-hidden="true" />
        </Link>
      </div>
    </div>
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
  const todayIndex = (new Date(now).getDay() + 6) % 7;

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <ErrorBanner message={error} onRetry={refresh} />

      {/* The Hero (DESIGN.md §1 & §7) — Spend boldness here */}
      <motion.section
        variants={itemVariants}
        className="relative bg-surface rounded-xl shadow-elev-3 border border-hairline p-6 sm:p-8 overflow-hidden"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-2.5 text-xs font-medium text-text-3">
              <span className="inline-flex items-center gap-1.5 text-accent">
                <Radio className="h-3.5 w-3.5 stroke-[1.5]" aria-hidden="true" />
                Live class feed
              </span>
              <span className="h-1 w-1 rounded-full bg-hairline" aria-hidden="true" />
              <span className="tabular-nums">{formatLongDate(new Date(now))}</span>
            </div>

            <h1 className="mt-2 text-3xl sm:text-4xl font-serif text-text tracking-tight">
              {greeting(new Date(now))}, scholar
            </h1>

            <p className="mt-2 text-sm text-text-2 leading-relaxed">
              {upcoming.length === 0
                ? 'No deadlines scheduled right now.'
                : `You have ${upcoming.length} upcoming deadline${upcoming.length === 1 ? '' : 's'} and ${todayClasses.length} class${todayClasses.length === 1 ? '' : 'es'} today.`}
            </p>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-text-3">
              <Sparkles className="h-3.5 w-3.5 text-accent stroke-[1.5]" aria-hidden="true" />
              <span>Read-only view · Syncs automatically with class updates</span>
            </div>
          </div>

          {/* Date pill with tabular numbers */}
          <div className="flex shrink-0 items-center gap-4 rounded-lg bg-surface-inset shadow-inset-1 border border-hairline/60 px-5 py-4 self-start">
            <div className="text-center">
              <p className="text-[10px] font-medium text-text-3">
                {new Date(now).toLocaleDateString(undefined, { month: 'short' })}
              </p>
              <p className="text-3xl font-serif font-bold text-text tabular-nums leading-none mt-1">
                {new Date(now).getDate()}
              </p>
              <p className="text-[10px] font-medium text-text-3 mt-1">{DAYS_SHORT[todayIndex]}</p>
            </div>
            <div className="h-10 w-px bg-hairline" aria-hidden="true" />
            <div className="space-y-1 text-xs tabular-nums text-text-2">
              <p className="font-medium text-text">{todayClasses.length} classes today</p>
              <p className="text-text-3">{upcoming.length} active deadlines</p>
              <p className="text-text-3">{pendingReminders} reminders</p>
            </div>
          </div>
        </div>

        {/* Hero split modules: Next Deadline Focal Card & Today's classes timeline */}
        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          {/* Next deadline focal element */}
          <NextDeadlineHeroCard deadline={nextDeadline} now={now} />

          {/* Today's classes timeline */}
          <div className="rounded-lg bg-surface-inset shadow-inset-1 border border-hairline/60 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-medium text-text-3">Today's classes</span>
              <Link
                to="/timetable"
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                <span>Full timetable</span>
                <ArrowRight className="h-3 w-3 stroke-[1.5]" aria-hidden="true" />
              </Link>
            </div>

            {todayClasses.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm font-medium text-text">No classes scheduled today</p>
                <p className="mt-1 text-xs text-text-3">Take the day to study or view the rest of your week.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayClasses.slice(0, 3).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-md bg-surface shadow-elev-1 border border-hairline p-2.5"
                  >
                    <div className="w-16 shrink-0 text-right tabular-nums">
                      <p className="text-xs font-medium text-text">{formatTime12(entry.startTime)}</p>
                      <p className="text-[10px] text-text-3">{formatTime12(entry.endTime)}</p>
                    </div>
                    {/* Course color 3px vertical edge per DESIGN.md §7 */}
                    <span
                      className="h-8 w-[3px] shrink-0 rounded-full"
                      style={{ backgroundColor: subjectColor(entry.subject) }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-text">{entry.subject}</p>
                      <p className="flex items-center gap-1 truncate text-[11px] text-text-3 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0 stroke-[1.5]" aria-hidden="true" />
                        <span>{entry.location || 'Location to be confirmed'}</span>
                        {entry.lecturer && <span>· {entry.lecturer}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Asymmetric modules below (DESIGN.md §7: 7/5 or asymmetric columns) */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (7 cols): Upcoming Deadlines list */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-surface rounded-lg shadow-elev-2 border border-transparent p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
                <CalendarClock className="h-4 w-4 text-accent stroke-[1.5]" aria-hidden="true" />
                <span>Upcoming deadlines</span>
              </h2>
              <Link
                to="/deadlines"
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                <span>View all</span>
                <ArrowRight className="h-3 w-3 stroke-[1.5]" aria-hidden="true" />
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <div className="rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-6 text-center">
                <CheckCircle2 className="mx-auto h-5 w-5 text-success stroke-[1.5]" aria-hidden="true" />
                <p className="mt-2 text-sm font-medium text-text">All deadlines complete</p>
                <p className="mt-1 text-xs text-text-3">New deadlines will appear as your administrator posts them.</p>
              </div>
            ) : (
              <ul className="divide-y divide-hairline">
                {upcoming.slice(0, 5).map((deadline) => (
                  <li key={deadline.id}>
                    <Link
                      to="/deadlines"
                      className="flex items-center gap-3.5 py-3 px-2 rounded-md transition-colors duration-fast hover:bg-surface-inset/60 group"
                    >
                      {/* Course colour indicator line */}
                      <span
                        className="h-8 w-[3px] shrink-0 rounded-full"
                        style={{ backgroundColor: subjectColor(deadline.subject) }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text group-hover:text-accent transition-colors">
                          {deadline.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <SubjectChip subject={deadline.subject} />
                          <PriorityBadge priority={deadline.priority} />
                        </div>
                      </div>
                      <CountdownBadge value={deadline.dueDate} now={now} className="shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right Column (5 cols): Reminders & Announcements */}
        <div className="lg:col-span-5 space-y-6">
          {/* Class Reminders */}
          <section className="bg-surface rounded-lg shadow-elev-2 border border-transparent p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
                <BellRing className="h-4 w-4 text-accent stroke-[1.5]" aria-hidden="true" />
                <span>Class reminders</span>
              </h2>
              <Link
                to="/reminders"
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                <span>View all</span>
                <ArrowRight className="h-3 w-3 stroke-[1.5]" aria-hidden="true" />
              </Link>
            </div>

            {pendingReminders === 0 ? (
              <div className="rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-5 text-center">
                <p className="text-xs text-text-3">No active reminders posted.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {[...reminders.overdue, ...reminders.dueToday, ...reminders.upcoming]
                  .slice(0, 3)
                  .map((reminder) => (
                    <li
                      key={reminder.id}
                      className="rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-3"
                    >
                      <p className="text-xs font-medium text-text leading-snug break-words">
                        {reminder.title}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <CountdownBadge value={reminder.datetime} now={now} />
                        <span className="text-[10px] text-text-3 tabular-nums">
                          {formatDate(reminder.datetime, { short: true })}
                        </span>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </section>

          {/* Recent Announcements */}
          <section className="bg-surface rounded-lg shadow-elev-2 border border-transparent p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
                <Megaphone className="h-4 w-4 text-accent stroke-[1.5]" aria-hidden="true" />
                <span>Noticeboard</span>
              </h2>
              <Link
                to="/announcements"
                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                <span>Board</span>
                <ArrowRight className="h-3 w-3 stroke-[1.5]" aria-hidden="true" />
              </Link>
            </div>

            {announcements.length === 0 ? (
              <div className="rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-5 text-center">
                <p className="text-xs text-text-3">No announcements posted yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {announcements.map((announcement) => (
                  <Link
                    key={announcement.id}
                    to="/announcements"
                    className="block rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-3 hover:border-accent-line transition-all duration-fast"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <CategoryBadge category={announcement.category} />
                      <span className="text-[10px] text-text-3 tabular-nums">
                        {formatDate(announcement.date, { short: true })}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-1 text-xs font-semibold text-text">
                      {announcement.title}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}
