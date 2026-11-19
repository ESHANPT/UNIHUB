import { motion } from 'motion/react';
import { useId } from 'react';
import { cn } from '../../lib/utils';

export function Segmented({
  options = [],
  value,
  onChange,
  size = 'md', // 'sm' | 'md'
  layoutId,
  className,
  ariaLabel,
}) {
  const generatedId = useId();
  const activeLayoutId = layoutId || `segmented-pill-${generatedId}`;

  const sizeStyles = {
    sm: 'text-xs h-7 px-2.5',
    md: 'text-sm h-8 px-3.5',
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-md bg-surface-inset shadow-inset-1 border border-hairline/40 overflow-x-auto no-scrollbar',
        className
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange?.(option.value)}
            className={cn(
              'relative z-10 font-medium whitespace-nowrap transition-colors duration-fast rounded-[9px] flex items-center gap-2 select-none cursor-pointer',
              sizeStyles[size] || sizeStyles.md,
              isSelected ? 'text-text font-semibold' : 'text-text-3 hover:text-text-2'
            )}
          >
            {isSelected && (
              <motion.div
                layoutId={activeLayoutId}
                className="absolute inset-0 rounded-[9px] bg-surface shadow-elev-1 border border-hairline z-[-1]"
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 30,
                }}
              />
            )}
            <span>{option.label}</span>
            {typeof option.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px] tabular-nums font-semibold',
                  isSelected ? 'bg-surface-inset text-accent' : 'bg-surface-inset/60 text-text-3'
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Segmented;
