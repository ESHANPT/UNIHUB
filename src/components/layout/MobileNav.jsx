import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { NAV_ITEMS } from './navItems';
import { cn } from '../../lib/utils';

export default function MobileNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="safe-bottom fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md lg:hidden"
    >
      <div className="glass rounded-xl shadow-elev-3 p-1.5 grid grid-cols-6 items-center">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'relative flex min-h-[44px] flex-col items-center justify-center py-1.5 text-xs font-medium transition-colors duration-fast rounded-lg',
                isActive ? 'text-accent font-semibold' : 'text-text-3 hover:text-text-2'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
                <span className="mt-0.5 text-xs truncate tracking-tight">{item.short}</span>
                {isActive && (
                  <motion.span
                    layoutId="mobile-dock-dot"
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
  );
}
