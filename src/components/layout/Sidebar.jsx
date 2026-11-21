import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Download, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { NAV_ITEMS } from './navItems';
import Brand from './Brand';
import ThemeToggle from '../ui/ThemeToggle';
import { useClassData } from '../../store/ClassDataContext';
import { useAuth } from '../../store/AuthContext';
import { usePwa } from '../../store/PwaContext';
import { splitDeadlinesByDate, splitReminders } from '../../lib/selectors';
import { cn } from '../../lib/utils';

export default function Sidebar() {
  const { data } = useClassData();
  const { isAdmin } = useAuth();
  const { canInstall, installApp } = usePwa();
  const { upcoming } = splitDeadlinesByDate(data.deadlines);
  const reminders = splitReminders(data.reminders);

  const counts = {
    deadlines: upcoming.filter((deadline) => !deadline.completed).length,
    reminders: reminders.overdue.length + reminders.dueToday.length + reminders.upcoming.length,
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 xl:w-72 flex-col border-r border-hairline bg-surface/40 p-5 backdrop-blur-md lg:flex select-none">
      <div className="px-2">
        <Brand />
      </div>

      <div className="mt-8 px-2.5">
        <p className="text-xs font-medium text-text-3">Workspace</p>
      </div>

      {/* Inset nav well — hugs content instead of stretching (DESIGN.md §4) */}
      <nav className="mt-2.5 flex flex-col gap-1 p-1.5 rounded-lg bg-surface-inset shadow-inset-1 border border-hairline/60" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const count = item.badge ? counts[item.badge] : 0;
          return (
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
                  {/* Sliding raised pill */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-md bg-surface shadow-elev-1 border border-hairline z-[-1]"
                      transition={{
                        type: 'spring',
                        stiffness: 450,
                        damping: 34,
                      }}
                    >
                      {/* Sliding brass 2px indicator on the left */}
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
                  <span className="flex-1 truncate">{item.label}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs tabular-nums font-medium',
                        isActive
                          ? 'bg-surface-inset text-accent border border-accent-line/30'
                          : 'bg-surface/80 text-text-3 border border-hairline'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}

        <div className="my-2 border-t border-hairline/60" />

        <NavLink
          to={isAdmin ? '/admin' : '/admin/login'}
          className="relative outline-none"
        >
          {({ isActive }) => (
            <div
              className={cn(
                'relative z-10 flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-fast',
                isActive ? 'text-text font-semibold' : 'text-text-3 hover:text-text-2'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
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
              {isAdmin ? (
                <ShieldCheck className="h-4 w-4 shrink-0 text-accent stroke-[1.5]" aria-hidden="true" />
              ) : (
                <Lock className="h-4 w-4 shrink-0 text-text-3 stroke-[1.5]" aria-hidden="true" />
              )}
              <span className="flex-1 truncate">{isAdmin ? 'Admin panel' : 'Admin sign in'}</span>
            </div>
          )}
        </NavLink>
      </nav>

      {/* Footer modules anchored to bottom */}
      <div className="space-y-3 pt-4 mt-auto">
        {canInstall && (
          <button
            type="button"
            onClick={installApp}
            className="flex w-full items-center justify-between rounded-md bg-surface border border-hairline shadow-elev-1 px-3 py-2.5 text-xs font-medium text-text hover:border-accent-line transition-all duration-base"
          >
            <span className="flex items-center gap-2">
              <Download className="h-3.5 w-3.5 text-accent stroke-[1.5]" aria-hidden="true" />
              <span>Install app</span>
            </span>
            <span className="rounded px-1.5 py-0.5 text-xs bg-accent-soft text-accent">UniHub</span>
          </button>
        )}

        {/* Compact Theme toggle module */}
        <div className="flex items-center justify-between rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-2.5">
          <span className="text-xs text-text-2 font-medium">Appearance</span>
          <ThemeToggle />
        </div>

        {/* Calm feed status note — single presence */}
        <div className="rounded-md bg-surface/60 border border-hairline p-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-text">
            <Sparkles className="h-3.5 w-3.5 text-accent stroke-[1.5]" aria-hidden="true" />
            Class network
          </p>
          <p className="mt-1 text-xs leading-relaxed text-text-3">
            Read-only feed. Class updates sync automatically.
          </p>
        </div>
      </div>
    </aside>
  );
}
