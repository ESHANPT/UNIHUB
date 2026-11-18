import { BellRing, CalendarClock, CalendarDays, LayoutDashboard, Megaphone, Settings } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', short: 'Home', icon: LayoutDashboard, end: true },
  { to: '/deadlines', label: 'Deadlines', short: 'Deadlines', icon: CalendarClock, end: false, badge: 'deadlines' },
  { to: '/timetable', label: 'Timetable', short: 'Classes', icon: CalendarDays, end: false },
  { to: '/reminders', label: 'Reminders', short: 'Reminders', icon: BellRing, end: false, badge: 'reminders' },
  { to: '/announcements', label: 'Announcements', short: 'Notices', icon: Megaphone, end: false },
  { to: '/settings', label: 'Settings', short: 'Settings', icon: Settings, end: false },
];
