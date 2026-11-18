export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DEADLINE_CATEGORIES = ['Assignment', 'Quiz', 'Exam', 'Project', 'Other'];
export const ANNOUNCEMENT_CATEGORIES = ['General', 'Academic', 'Important', 'Event'];
export const PRIORITIES = ['Low', 'Medium', 'High'];
export const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };
export const THEMES = ['light', 'dark', 'system'];

const SUBJECT_COLORS = ['#6a4cff', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#d946ef', '#84cc16'];

export const cn = (...values) => values.filter(Boolean).join(' ');

export function uid(prefix = 'id') {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 10)
      : Math.random().toString(36).slice(2, 12);
  return `${prefix}_${Date.now().toString(36)}${random}`;
}

const pad = (value) => String(value).padStart(2, '0');

export function toDateTimeInput(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}

export function toDateInput(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateTime(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseDateOnly(value) {
  if (!value || typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) {
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return parseDateTime(value);
}

export function isSameDay(first, second) {
  const a = first instanceof Date ? first : parseDateTime(first);
  const b = second instanceof Date ? second : parseDateTime(second);
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

export function startOfDay(value = new Date()) {
  const date = value instanceof Date ? new Date(value) : parseDateTime(value);
  if (!date) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

export function formatTime12(value) {
  if (typeof value !== 'string' || !/^\d{1,2}:\d{2}$/.test(value)) return value || '';
  const [hours, minutes] = value.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour}:${pad(minutes)} ${suffix}`;
}

export function formatTimeRange(start, end) {
  return `${formatTime12(start)} – ${formatTime12(end)}`;
}

export function formatDateTime(value) {
  const date = parseDateTime(value);
  if (!date) return 'No date set';
  return date.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDate(value, { short = false } = {}) {
  const date = parseDateOnly(value) || parseDateTime(value);
  if (!date) return '—';
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: short ? 'short' : 'long',
    year: 'numeric',
  });
}

export function formatLongDate(date = new Date()) {
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

export function todayName(date = new Date()) {
  return DAYS[(date.getDay() + 6) % 7];
}

export function dayIndex(name) {
  return DAYS.indexOf(name);
}

export function compactDuration(milliseconds) {
  const minutes = Math.floor(Math.abs(milliseconds) / 60000);
  if (minutes < 1) return 'less than a minute';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours < 24) return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const hourRemainder = hours % 24;
  return hourRemainder ? `${days}d ${hourRemainder}h` : `${days}d`;
}

export function getCountdown(value, now = Date.now()) {
  const date = parseDateTime(value);
  if (!date) return null;
  const diff = date.getTime() - now;
  const overdue = diff < 0;
  const label =
    Math.abs(diff) < 60000
      ? 'Due now'
      : overdue
        ? `Overdue by ${compactDuration(diff)}`
        : `${compactDuration(diff)} left`;
  return {
    diff,
    overdue,
    dueNow: Math.abs(diff) < 60000,
    urgent: diff >= 0 && diff <= 24 * 60 * 60 * 1000,
    label,
  };
}

export function subjectColor(name = '') {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 100000;
  }
  return SUBJECT_COLORS[hash % SUBJECT_COLORS.length];
}

export function subjectList(deadlines = [], classes = []) {
  const names = new Set();
  deadlines.forEach((item) => item.subject && names.add(item.subject));
  classes.forEach((item) => item.subject && names.add(item.subject));
  return [...names].sort((a, b) => a.localeCompare(b));
}

export function defaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(23, 59, 0, 0);
  return toDateTimeInput(date);
}

export function defaultReminderDate() {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return toDateTimeInput(date);
}

export function minutesFromTime(value) {
  if (typeof value !== 'string' || !/^\d{1,2}:\d{2}$/.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatHours(minutes) {
  if (!minutes) return '0h';
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!remainder) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return 'Still up';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 22) return 'Good evening';
  return 'Late night grind';
}

export function downloadJson(filename, content) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
