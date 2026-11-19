import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
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
import OfflineBanner from '../pwa/OfflineBanner';
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
      {/* Subtle top-left lift */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-surface/30 blur-[140px]" />
      </div>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 xl:w-72 flex-col border-r border-hairline bg-surface/40 p-5 backdrop-blur-md lg:flex select-none">
        <div className="px-2">
          <Brand />
        </div>
        <div className="mt-6 flex items-center gap-2 rounded-md border border-hairline bg-surface-inset px-3 py-2 text-xs font-medium text-text-2 shadow-inset-1">
          <ShieldCheck className="h-4 w-4 text-accent stroke-[1.5]" aria-hidden="true" />
          <span>Admin controls</span>
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-1 p-1.5 rounded-lg bg-surface-inset shadow-inset-1 border border-hairline/60" aria-label="Admin navigation">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="relative outline-none"
            >
              {({ isActive }) => (
                <div
                  className={cn(
                    'relative z-10 flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-fast',
                    isActive ? 'text-text font-semibold' : 'text-text-2 hover:text-text'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-active-pill"
                      className="absolute inset-0 rounded-md bg-surface shadow-elev-1 border border-hairline z-[-1]"
                      transition={{
                        type: 'spring',
                        stiffness: 450,
                        damping: 34,
                      }}
                    >
                      <span className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-r-full bg-accent" />
                    </motion.div>
                  )}
                  <item.icon
                    className={cn(
                      'h-4 w-4 shrink-0 stroke-[1.5] transition-colors',
                      isActive ? 'text-accent' : 'text-text-3'
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 pt-4">
          <div className="rounded-md border border-hairline bg-surface-inset shadow-inset-1 p-2.5">
            <p className="text-[10px] font-medium text-text-3">Signed in</p>
            <p className="mt-0.5 truncate text-xs font-medium text-text" title={user?.email}>
              {user?.email || 'Administrator'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md bg-surface border border-hairline shadow-elev-1 text-xs font-medium text-text hover:border-accent-line transition-all duration-base"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[1.5]" aria-hidden="true" />
              <span>Student view</span>
            </Link>
            <ThemeToggle variant="button" />
            <IconButton
              icon={LogOut}
              label="Sign out"
              variant="raised"
              size="sm"
              onClick={handleSignOut}
              className="hover:text-danger"
            />
          </div>
        </div>
      </aside>

      <div className="lg:pl-64 xl:pl-72">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-hairline bg-bg/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <Brand compact />
          <div className="flex items-center gap-2">
            <Link
              to="/"
              aria-label="Student portal"
              className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-surface shadow-elev-1 border border-hairline text-text"
              title="Student portal"
            >
              <ArrowLeft className="h-3.5 w-3.5 stroke-[1.5]" aria-hidden="true" />
            </Link>
            <ThemeToggle variant="segmented" />
            <IconButton
              icon={LogOut}
              label="Sign out"
              variant="raised"
              size="sm"
              onClick={handleSignOut}
            />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-16 lg:pt-8">
          <OfflineBanner />
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Admin navigation"
        className="safe-bottom fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md lg:hidden"
      >
        <div className="glass rounded-xl shadow-elev-3 p-1.5 grid grid-cols-6 items-center">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-[44px] flex-col items-center justify-center py-1.5 text-[10px] font-medium transition-colors duration-fast rounded-lg',
                  isActive ? 'text-accent font-semibold' : 'text-text-3 hover:text-text-2'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
                  <span className="mt-0.5 text-[9px] truncate tracking-tight">{item.short}</span>
                  {isActive && (
                    <motion.span
                      layoutId="admin-dock-dot"
                      className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-accent"
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
