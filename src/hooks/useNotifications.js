import { useEffect, useRef } from 'react';
import { parseDateTime } from '../lib/utils';

const NOTIFIED_KEY = 'unihub:notified-reminders';
const NOTIFY_WINDOW_MS = 30 * 60 * 1000;

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notificationPermission() {
  return notificationsSupported() ? Notification.permission : 'unsupported';
}

export async function requestNotificationPermission() {
  if (!notificationsSupported()) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

function readNotifiedKeys() {
  try {
    const raw = window.localStorage.getItem(NOTIFIED_KEY);
    const parsed = JSON.parse(raw || '[]');
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeNotifiedKeys(keys) {
  try {
    window.localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...keys].slice(-300)));
  } catch {
    /* Local storage is optional for notifications. */
  }
}

/**
 * Shows a browser notification for class reminders that have just come due
 * while UniHub is open. Keys are stored locally so a reminder is never
 * announced twice; reminders themselves are shared and read-only in Supabase.
 */
export function useReminderNotifications(reminders) {
  const notifiedRef = useRef(null);
  if (notifiedRef.current === null) notifiedRef.current = readNotifiedKeys();

  useEffect(() => {
    if (!notificationsSupported() || Notification.permission !== 'granted') return undefined;

    const check = () => {
      const now = Date.now();
      let changed = false;

      reminders.forEach((reminder) => {
        if (reminder.completed) return;
        const target = parseDateTime(reminder.datetime)?.getTime();
        if (!target) return;
        const key = `${reminder.id}:${reminder.datetime}`;
        if (notifiedRef.current.has(key)) return;
        if (target <= now && now - target <= NOTIFY_WINDOW_MS) {
          try {
            new Notification('UniHub reminder', { body: reminder.title, tag: key });
            notifiedRef.current.add(key);
            changed = true;
          } catch {
            /* Notification construction can fail on some platforms. */
          }
        }
      });

      if (changed) writeNotifiedKeys(notifiedRef.current);
    };

    check();
    const id = window.setInterval(check, 30000);
    return () => window.clearInterval(id);
  }, [reminders]);
}
