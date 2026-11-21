import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';
import { cn } from '../../lib/utils';
import { IconButton } from './Button';

export default function ThemeToggle({ variant = 'segmented', className }) {
  const { theme, setTheme } = useTheme();
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event) => setSystemDark(event.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && systemDark);

  if (variant === 'button') {
    return (
      <IconButton
        icon={isDark ? Sun : Moon}
        label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        variant="raised"
        size="sm"
        className={className}
      />
    );
  }

  const options = [
    { value: 'dark', label: 'Dark theme', icon: Moon },
    { value: 'light', label: 'Light theme', icon: Sun },
    { value: 'system', label: 'System theme', icon: Laptop },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme preference"
      className={cn(
        'relative inline-flex items-center gap-0.5 p-0.5 rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60',
        className
      )}
    >
      {options.map((option) => {
        const isSelected = theme === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.label}
            title={option.label}
            onClick={() => setTheme(option.value)}
            className={cn(
              'relative z-10 flex items-center justify-center w-7 h-7 rounded-[7px] transition-colors duration-fast select-none cursor-pointer',
              isSelected ? 'text-text' : 'text-text-3 hover:text-text'
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="theme-toggle-pill"
                className="absolute inset-0 rounded-[7px] bg-surface shadow-elev-1 border border-hairline z-[-1]"
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 32,
                }}
              />
            )}
            <Icon className="h-3.5 w-3.5 stroke-[1.5]" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
