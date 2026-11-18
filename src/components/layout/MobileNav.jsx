import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navItems';
import { cn } from '../../lib/utils';

export default function MobileNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-6 px-1">
        {NAV_ITEMS.map((item) => (
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
  );
}
