import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BellRing,
  CalendarClock,
  CalendarDays,
  FileJson,
  LayoutDashboard,
  LogOut,
  Megaphone,
  ShieldCheck,
} from 'lucide-react';
import Brand from './Brand';
import ThemeToggle from '../ui/ThemeToggle';
import { IconButton } from '../ui/Button';
import { useAuth } from '../../store/AuthContext';
import { cn } from '../../lib/utils';

const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', short: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/deadlines', label: 'Deadlines', short: 'Deadlines', icon: CalendarClock },
  { to: '/admin/timetable', label: 'Timetable', short: 'Classes', icon: CalendarDays },
  { to: '/admin/reminders', label: 'Reminders', short: 'Reminders', icon: BellRing },
  { to: '/admin/announcements', label: 'Announcements', short: 'Notices', icon: Megaphone },
  { to: '/admin/data', label: 'Data & migration', short: 'Data', icon: FileJson },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-full">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-brand opacity-[0.14] blur-[110px]" />
        <div className="absolute -right-24 top-1/4 h-[26rem] w-[26rem] rounded-full bg-fuchsia-400 opacity-[0.1] blur-[130px]" />
      </div>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-line bg-surface/85 px-5 py-6 backdrop-blur-xl lg:flex">
        <div className="px-1">
          <Brand />
        </div>
        <p className="mt-6 flex items-center gap-1.5 rounded-xl border border-line bg-soft px-3 py-2 text-[11px] font-semibold text-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
          Administrator panel
        </p>

        <nav className="mt-5 flex flex-1 flex-col gap-1" aria-label="Admin navigation">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-brand' : 'text-muted')}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 pt-4">
          <div className="rounded-2xl border border-line bg-soft px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Signed in</p>
            <p className="mt-0.5 truncate text-xs font-semibold" title={user?.email}>
              {user?.email || 'Administrator'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="btn btn-secondary btn-sm flex-1">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Student view
            </Link>
            <ThemeToggle />
            <IconButton
              icon={LogOut}
              label="Sign out"
              variant="secondary"
              onClick={handleSignOut}
              className="hover:text-rose-500"
            />
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-canvas/85 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Brand compact />
          <div className="flex items-center gap-1.5">
            <Link
              to="/"
              aria-label="Open student portal"
              className="btn btn-secondary btn-icon"
              title="Student portal"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
            <ThemeToggle />
            <IconButton icon={LogOut} label="Sign out" variant="secondary" onClick={handleSignOut} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-14 lg:pt-10">
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Admin navigation"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-6 px-1">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition',
                  isActive ? 'text-brand' : 'text-muted hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'absolute top-0 h-0.5 w-7 rounded-full transition',
                      isActive ? 'bg-brand' : 'bg-transparent',
                    )}
                  />
                  <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  <span>{item.short}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
