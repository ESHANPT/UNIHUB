import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function Checkbox({
  checked = false,
  onChange,
  disabled = false,
  className,
  id,
  label,
  ...props
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer select-none group',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
    >
      <div className="relative inline-flex items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only"
          {...props}
        />
        {/* Inset square track */}
        <div
          className={cn(
            'w-5 h-5 rounded-[7px] bg-surface-inset shadow-inset-1 border border-hairline transition-all duration-fast flex items-center justify-center',
            'group-hover:border-accent-line/50',
            checked && 'border-accent-line bg-surface-inset shadow-[inset_0_0_6px_var(--accent-soft)]'
          )}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
            <motion.path
              d="M2.5 7.5L5.5 10.5L11.5 3.5"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={{
                pathLength: checked ? 1 : 0,
                opacity: checked ? 1 : 0,
              }}
              transition={{
                duration: 0.26,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </svg>
        </div>
      </div>
      {label && (
        <span className={cn('text-sm transition-colors duration-fast', checked ? 'text-text-3 line-through' : 'text-text')}>
          {label}
        </span>
      )}
    </label>
  );
}

export default Checkbox;
