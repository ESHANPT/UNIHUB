import { DAYS, DEADLINE_CATEGORIES, ANNOUNCEMENT_CATEGORIES, PRIORITIES, THEMES, parseDateTime, parseDateOnly, toDateTimeInput, toDateInput, uid } from './utils';
import { createEmptyState, DEFAULT_SETTINGS, DATA_VERSION } from './schema';

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const text = (value, fallback = '') => (typeof value === 'string' ? value.trim() : fallback);

function normalizeDateValue(value) {
  const date = parseDateTime(value);
  return date ? toDateTimeInput(date) : null;
}

function normalizeDateOnly(value) {
  const date = parseDateOnly(value) || parseDateTime(value);
  return date ? toDateInput(date) : null;
}

function normalizeClock(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Normalizes and validates a full UniHub data object (stored state or imported file).
 * Returns { ok: true, state } or { ok: false, error }.
 */
export function normalizeState(input) {
  if (!isObject(input)) {
    return { ok: false, error: 'That file does not contain a UniHub data object.' };
  }

  const source = isObject(input.data) ? input.data : input;
  const requiredKeys = ['deadlines', 'classes', 'reminders', 'announcements'];
  const missing = requiredKeys.filter((key) => !Array.isArray(source[key]));
  if (missing.length > 0) {
    return { ok: false, error: `The backup is missing: ${missing.join(', ')}.` };
  }

  const usedIds = new Set();
  const takeId = (value, prefix) => {
    const candidate = text(value);
    if (candidate && !usedIds.has(candidate)) {
      usedIds.add(candidate);
      return candidate;
    }
    const generated = uid(prefix);
    usedIds.add(generated);
    return generated;
  };

  try {
    const deadlines = source.deadlines.map((item, index) => {
      if (!isObject(item)) throw new Error(`Deadline #${index + 1} is not a valid record.`);
      const title = text(item.title);
      if (!title) throw new Error(`Deadline #${index + 1} has no title.`);
      const dueDate = normalizeDateValue(item.dueDate);
      if (!dueDate) throw new Error(`Deadline “${title}” has an invalid due date.`);
      return {
        id: takeId(item.id, 'dl'),
        title,
        description: text(item.description),
        subject: text(item.subject, 'General') || 'General',
        category: DEADLINE_CATEGORIES.includes(item.category) ? item.category : 'Other',
        priority: PRIORITIES.includes(item.priority) ? item.priority : 'Medium',
        dueDate,
        completed: Boolean(item.completed),
        completedAt: item.completedAt ? text(item.completedAt) : null,
        createdAt: text(item.createdAt) || new Date().toISOString(),
      };
    });

    const classes = source.classes.map((item, index) => {
      if (!isObject(item)) throw new Error(`Timetable entry #${index + 1} is not a valid record.`);
      const subject = text(item.subject);
      if (!subject) throw new Error(`Timetable entry #${index + 1} has no subject.`);
      const startTime = normalizeClock(item.startTime);
      const endTime = normalizeClock(item.endTime);
      if (!startTime || !endTime) throw new Error(`“${subject}” has an invalid class time.`);
      if (startTime >= endTime) throw new Error(`“${subject}” must end after it starts.`);
      if (!DAYS.includes(item.day)) throw new Error(`“${subject}” has an invalid day of the week.`);
      return {
        id: takeId(item.id, 'cls'),
        subject,
        lecturer: text(item.lecturer),
        location: text(item.location),
        day: item.day,
        startTime,
        endTime,
        createdAt: text(item.createdAt) || new Date().toISOString(),
      };
    });

    const reminders = source.reminders.map((item, index) => {
      if (!isObject(item)) throw new Error(`Reminder #${index + 1} is not a valid record.`);
      const title = text(item.title);
      if (!title) throw new Error(`Reminder #${index + 1} has no title.`);
      const datetime = normalizeDateValue(item.datetime);
      if (!datetime) throw new Error(`Reminder “${title}” has an invalid date.`);
      return {
        id: takeId(item.id, 'rem'),
        title,
        description: text(item.description),
        datetime,
        completed: Boolean(item.completed),
        completedAt: item.completedAt ? text(item.completedAt) : null,
        notified: Boolean(item.notified),
        createdAt: text(item.createdAt) || new Date().toISOString(),
      };
    });

    const announcements = source.announcements.map((item, index) => {
      if (!isObject(item)) throw new Error(`Announcement #${index + 1} is not a valid record.`);
      const title = text(item.title);
      if (!title) throw new Error(`Announcement #${index + 1} has no title.`);
      return {
        id: takeId(item.id, 'ann'),
        title,
        content: text(item.content),
        date: normalizeDateOnly(item.date) || toDateInput(new Date()),
        category: ANNOUNCEMENT_CATEGORIES.includes(item.category) ? item.category : 'General',
        createdAt: text(item.createdAt) || new Date().toISOString(),
      };
    });

    const settings = isObject(source.settings) ? source.settings : {};
    const state = {
      ...createEmptyState(),
      version: DATA_VERSION,
      settings: {
        ...DEFAULT_SETTINGS,
        ...(THEMES.includes(settings.theme) ? { theme: settings.theme } : {}),
      },
      deadlines,
      classes,
      reminders,
      announcements,
    };

    return { ok: true, state };
  } catch (error) {
    return { ok: false, error: error.message || 'The backup is not valid UniHub data.' };
  }
}
