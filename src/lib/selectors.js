import { isSameDay, parseDateOnly, parseDateTime, PRIORITY_ORDER } from './utils';

const dueTime = (deadline) => parseDateTime(deadline.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY;

/**
 * Date-driven split for the public and admin deadline lists.
 * Upcoming means the due date has not passed; Past means it has. Nothing is
 * archived or deleted, and `status` only distinguishes completion.
 */
export function splitDeadlinesByDate(deadlines, now = Date.now()) {
  const upcoming = [];
  const past = [];

  deadlines.forEach((deadline) => {
    if (dueTime(deadline) >= now) upcoming.push(deadline);
    else past.push(deadline);
  });

  upcoming.sort((a, b) => dueTime(a) - dueTime(b));
  past.sort((a, b) => dueTime(b) - dueTime(a));
  return { upcoming, past };
}

/** Admin-managed completion plus the date split, for dashboard highlights. */
export function upcomingPendingDeadlines(deadlines, now = Date.now()) {
  return deadlines
    .filter((deadline) => !deadline.completed && dueTime(deadline) >= now)
    .sort((a, b) => dueTime(a) - dueTime(b));
}

export function splitDeadlines(deadlines, now = Date.now()) {
  const overdue = [];
  const upcoming = [];
  const completed = [];

  deadlines.forEach((deadline) => {
    if (deadline.completed) completed.push(deadline);
    else if (dueTime(deadline) < now) overdue.push(deadline);
    else upcoming.push(deadline);
  });

  overdue.sort((a, b) => dueTime(a) - dueTime(b));
  upcoming.sort((a, b) => dueTime(a) - dueTime(b));
  completed.sort((a, b) => dueTime(b) - dueTime(a));
  return { overdue, upcoming, completed };
}

export function classesForDay(classes, day) {
  return classes
    .filter((entry) => entry.day === day)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function splitReminders(reminders, now = new Date()) {
  const overdue = [];
  const dueToday = [];
  const upcoming = [];

  reminders.forEach((reminder) => {
    if (reminder.completed) return;
    const date = parseDateTime(reminder.datetime);
    if (!date) return;
    const timestamp = date.getTime();
    if (timestamp < now.getTime()) overdue.push(reminder);
    else if (isSameDay(date, now)) dueToday.push(reminder);
    else upcoming.push(reminder);
  });

  const ascending = (a, b) =>
    (parseDateTime(a.datetime)?.getTime() ?? 0) - (parseDateTime(b.datetime)?.getTime() ?? 0);

  overdue.sort(ascending);
  dueToday.sort(ascending);
  upcoming.sort(ascending);
  return { overdue, dueToday, upcoming, completed: [] };
}

export function sortAnnouncements(announcements) {
  return [...announcements].sort((a, b) => {
    const first = (parseDateOnly(a.date)?.getTime() ?? 0) || (parseDateTime(a.createdAt)?.getTime() ?? 0);
    const second = (parseDateOnly(b.date)?.getTime() ?? 0) || (parseDateTime(b.createdAt)?.getTime() ?? 0);
    if (second !== first) return second - first;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });
}

export function pendingReminderCount(reminders) {
  return reminders.filter((reminder) => !reminder.completed).length;
}

export function sortByPriority(items) {
  return [...items].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3),
  );
}
