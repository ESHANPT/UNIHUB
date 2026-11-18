import { NavLink } from 'react-router-dom';
import { Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { NAV_ITEMS } from './navItems';
import Brand from './Brand';
import ThemeToggle from '../ui/ThemeToggle';
import { useClassData } from '../../store/ClassDataContext';
import { useAuth } from '../../store/AuthContext';
import { splitDeadlinesByDate, splitReminders } from '../../lib/selectors';
import { cn } from '../../lib/utils';

export default function Sidebar() {
  const { data } = useClassData();
  const { isAdmin } = useAuth();
  const { upcoming } = splitDeadlinesByDate(data.deadlines);
  const reminders = splitReminders(data.reminders);

  const counts = {
    deadlines: upcoming.filter((deadline) => !deadline.completed).length,
    reminders: reminders.overdue.length + reminders.dueToday.length + reminders.upcoming.length,
  };

  const themeLabel = 'Theme';

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-line bg-surface/80 px-5 py-6 backdrop-blur-xl lg:flex">
      <div className="px-1">
        <Brand />
      </div>

      <p className="mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Workspace</p>

      <nav className="mt-2 flex flex-1 flex-col gap-1" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const count = item.badge ? counts[item.badge] : 0;
          return (
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
                  <span className="flex-1">{item.label}</span>
                  {count > 0 ? (
                    <span
                      className={cn(
                        'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                        isActive ? 'bg-brand text-white' : 'bg-soft text-muted ring-1 ring-line',
                      )}
                    >
                      {count}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          );
        })}

        <NavLink
          to={isAdmin ? '/admin' : '/admin/login'}
          className={({ isActive }) =>
            cn(
              'nav-link mt-2 border border-dashed border-line',
              isActive && 'nav-link-active border-solid',
            )
          }
        >
          {isAdmin ? (
            <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-brand" aria-hidden="true" />
          ) : (
            <Lock className="h-[18px] w-[18px] shrink-0 text-muted" aria-hidden="true" />
          )}
          <span className="flex-1">{isAdmin ? 'Admin panel' : 'Admin sign in'}</span>
        </NavLink>
      </nav>

      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between rounded-2xl border border-line bg-soft px-3 py-2.5">
          <div>
            <p className="text-xs font-semibold">Appearance</p>
            <p className="text-[11px] text-muted">{themeLabel}</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="rounded-2xl border border-line bg-gradient-to-br from-brand-soft to-transparent p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            Live class hub
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            Read-only view. Your class admin publishes changes, and they appear here automatically.
          </p>
        </div>
      </div>
    </aside>
  );
}
