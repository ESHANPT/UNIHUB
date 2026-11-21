import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  BellRing,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Megaphone,
  Radio,
} from 'lucide-react';
import { useClassData } from '../store/ClassDataContext';
import useNow from '../hooks/useNow';
import { classesForDay, sortAnnouncements, splitReminders, upcomingPendingDeadlines } from '../lib/selectors';
import {
  DAYS_SHORT,
  formatDate,
  formatLongDate,
  formatTime12,
  getCountdown,
  greeting,
  parseDateTime,
  pluralize,
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

function NextDeadlineHeroCard({ deadline, now, allSubjects }) {
  if (!deadline) {
    return (
      <div className="rounded-lg bg-surface-inset shadow-inset-1 border border-hairline/60 p-5 flex flex-col justify-between">
        <div>
          <span className="text-xs font-medium text-text-3">Next deadline</span>
          <p className="mt-2 text-base font-semibold text-text">No pending deadlines</p>
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

  const countdown = getCountdown(deadline.dueDate, now);
  const dueDate = parseDateTime(deadline.dueDate);
  const diffHours = dueDate ? Math.max(0, Math.round((dueDate.getTime() - now) / (1000 * 60 * 60))) : 0;
  // Progress arc: max 7 days = 168h
  const progressRatio = Math.max(0, Math.min(1, 1 - diffHours / 168));
  const circumference = 264;
  const strokeDashoffset = circumference - circumference * progressRatio;

  // Concise tabular-nums time remaining inside the 96px ring
  let timeDisplay = 'Due';
  if (countdown) {
    if (countdown.overdue) {
      timeDisplay = 'Overdue';
    } else if (countdown.dueNow) {
      timeDisplay = 'Now';
    } else {
      const diff = Math.max(0, dueDate.getTime() - now);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      if (days >= 1) {
        timeDisplay = `${days}d ${hours % 24}h`;
      } else if (hours >= 1) {
        timeDisplay = `${hours}h`;
      } else {
        const mins = Math.max(1, Math.floor(diff / (1000 * 60)));
        timeDisplay = `${mins}m`;
      }
    }
  }

  return (
    <div className="rounded-lg bg-surface-inset shadow-inset-1 border border-hairline/60 p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-text-3">Priority deadline</span>
          <PriorityBadge priority={deadline.priority} />
        </div>

        {/* Focal Point Countdown & Details */}
        <div className="mt-4 flex items-center gap-5">
          {/* Focal ~96px countdown ring */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  className="stroke-hairline fill-none"
                  strokeWidth="3.5"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="42"
                  className="stroke-accent fill-none"
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
                <span className="text-base sm:text-lg font-bold font-sans text-accent tabular-nums tracking-tight leading-none">
                  {timeDisplay}
                </span>
                <span className="text-xs uppercase font-medium text-text-3 mt-0.5 tracking-wider">
                  {countdown?.overdue ? 'Past' : 'Left'}
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-text-3 tabular-nums text-center font-medium">
              Due {formatDate(deadline.dueDate, { short: true })}
            </p>
          </div>

          {/* Details (Geist 600 title, no empty gap) */}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold font-sans text-text break-words leading-snug">
              {deadline.title}
            </h3>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <SubjectChip subject={deadline.subject} color={subjectColor(deadline.subject, allSubjects)} />
              <CategoryBadge category={deadline.category} dot={false} />
            </div>

            <div className="mt-4">
              <Link
                to="/deadlines"
                className="text-xs font-medium text-text-2 hover:text-text transition-colors"
              >
                View details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, error, refresh } = useClassData();
  const now = useNow(30000);
  const today = todayName();

  const allSubjects = useMemo(() => [...new Set(data.classes.map((c) => c.subject))].sort(), [data.classes]);
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

            <h1 className="mt-2 text-3xl sm:text-4xl font-serif text-text tracking-normal">
              {greeting(new Date(now))}, scholar
            </h1>

            <p className="mt-2 text-sm text-text-2 leading-relaxed">
              {upcoming.length === 0
                ? 'No deadlines scheduled right now.'
                : `You have ${pluralize(upcoming.length, 'upcoming deadline')} and ${pluralize(todayClasses.length, 'class', 'classes')} today.`}
            </p>
          </div>

          {/* Date pill with tabular numbers and pluralisation */}
          <div className="flex shrink-0 items-center gap-4 rounded-lg bg-surface-inset shadow-inset-1 border border-hairline/60 px-5 py-4 self-start">
            <div className="text-center">
              <p className="text-xs font-medium text-text-3">
                {new Date(now).toLocaleDateString(undefined, { month: 'short' })}
              </p>
              <p className="text-3xl font-serif font-bold text-text tabular-nums leading-none mt-1">
                {new Date(now).getDate()}
              </p>
              <p className="text-xs font-medium text-text-3 mt-1">{DAYS_SHORT[todayIndex]}</p>
            </div>
            <div className="h-10 w-px bg-hairline" aria-hidden="true" />
            <div className="space-y-1 text-xs tabular-nums text-text-2">
              <p className="font-medium text-text">{pluralize(todayClasses.length, 'class', 'classes')} today</p>
              <p className="text-text-3">{pluralize(upcoming.length, 'active deadline')}</p>
              <p className="text-text-3">{pluralize(pendingReminders, 'reminder')}</p>
            </div>
          </div>
        </div>

        {/* Hero split modules: Next Deadline Focal Card & Today's classes timeline */}
        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          {/* Next deadline focal element */}
          <NextDeadlineHeroCard deadline={nextDeadline} now={now} allSubjects={allSubjects} />

          {/* Today's classes timeline: flat with hairline dividers inside the inset panel (max 2 elevations) */}
          <div className="rounded-lg bg-surface-inset shadow-inset-1 border border-hairline/60 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-medium text-text-3">Today's classes</span>
                <Link
                  to="/timetable"
                  className="text-xs font-medium text-text-2 hover:text-text transition-colors"
                >
                  Full timetable
                </Link>
              </div>

              {todayClasses.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm font-medium text-text">No classes scheduled today</p>
                  <p className="mt-1 text-xs text-text-3">Take the day to study or view the rest of your week.</p>
                </div>
              ) : (
                <div className="divide-y divide-hairline/60">
                  {todayClasses.slice(0, 3).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <div className="w-16 shrink-0 text-right tabular-nums">
                        <p className="text-xs font-medium text-text">{formatTime12(entry.startTime)}</p>
                        <p className="text-xs text-text-3">{formatTime12(entry.endTime)}</p>
                      </div>
                      {/* Course color 3px vertical edge per DESIGN.md §7 */}
                      <span
                        className="h-8 w-[3px] shrink-0 rounded-full"
                        style={{ backgroundColor: subjectColor(entry.subject, allSubjects) }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-text">{entry.subject}</p>
                        <p className="flex items-center gap-1 truncate text-xs text-text-3 mt-0.5">
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
        </div>
      </motion.section>

      {/* Row 1: Upcoming Deadlines & Class Reminders (Equal height, balanced layout) */}
      <motion.div variants={itemVariants} className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Upcoming Deadlines */}
        <section className="bg-surface rounded-lg shadow-elev-2 border border-transparent p-5 sm:p-6 flex flex-col h-full">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
              <CalendarClock className="h-4 w-4 text-text-2 stroke-[1.5]" aria-hidden="true" />
              <span>Upcoming deadlines</span>
            </h2>
            <Link
              to="/deadlines"
              className="text-xs font-medium text-text-2 hover:text-text transition-colors"
            >
              View all
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="flex-1 rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-6 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-5 w-5 text-success stroke-[1.5]" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-text">All deadlines complete</p>
              <p className="mt-1 text-xs text-text-3">New deadlines will appear as your administrator posts them.</p>
            </div>
          ) : (
            <ul className="flex-1 divide-y divide-hairline">
              {upcoming.slice(0, 4).map((deadline) => (
                <li key={deadline.id}>
                  <Link
                    to="/deadlines"
                    className="flex items-center gap-3.5 py-3 px-2 rounded-md transition-colors duration-fast hover:bg-surface-inset/60 group"
                  >
                    {/* Course colour indicator 3px line */}
                    <span
                      className="h-8 w-[3px] shrink-0 rounded-full"
                      style={{ backgroundColor: subjectColor(deadline.subject, allSubjects) }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text group-hover:text-accent transition-colors">
                        {deadline.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <SubjectChip subject={deadline.subject} color={subjectColor(deadline.subject, allSubjects)} />
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

        {/* Class Reminders */}
        <section className="bg-surface rounded-lg shadow-elev-2 border border-transparent p-5 sm:p-6 flex flex-col h-full">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
              <BellRing className="h-4 w-4 text-text-2 stroke-[1.5]" aria-hidden="true" />
              <span>Class reminders</span>
            </h2>
            <Link
              to="/reminders"
              className="text-xs font-medium text-text-2 hover:text-text transition-colors"
            >
              View all
            </Link>
          </div>

          {pendingReminders === 0 ? (
            <div className="flex-1 rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-6 flex flex-col items-center justify-center text-center">
              <p className="text-xs text-text-3">No active reminders posted.</p>
            </div>
          ) : (
            <ul className="flex-1 space-y-2.5">
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
                      <span className="text-xs text-text-3 tabular-nums">
                        {formatDate(reminder.datetime, { short: true })}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </motion.div>

      {/* Row 2: Full-width Noticeboard below (no empty corner) */}
      <motion.section
        variants={itemVariants}
        className="bg-surface rounded-lg shadow-elev-2 border border-transparent p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
            <Megaphone className="h-4 w-4 text-text-2 stroke-[1.5]" aria-hidden="true" />
            <span>Noticeboard</span>
          </h2>
          <Link
            to="/announcements"
            className="text-xs font-medium text-text-2 hover:text-text transition-colors"
          >
            Board
          </Link>
        </div>

        {announcements.length === 0 ? (
          <div className="rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-5 text-center">
            <p className="text-xs text-text-3">No announcements posted yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {announcements.map((announcement) => (
              <Link
                key={announcement.id}
                to="/announcements"
                className="flex flex-col justify-between rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-3.5 hover:border-accent-line transition-all duration-fast group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <CategoryBadge category={announcement.category} />
                    <span className="text-xs text-text-3 tabular-nums">
                      {formatDate(announcement.date, { short: true })}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs font-semibold text-text group-hover:text-accent transition-colors">
                    {announcement.title}
                  </p>
                </div>
                {announcement.author && (
                  <p className="mt-2 text-xs text-text-3 truncate">By {announcement.author}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}
