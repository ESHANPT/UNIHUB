import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function Toggle({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  className,
  id,
  ...props
}) {
  const toggleId = id || (label ? `toggle-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <label
      htmlFor={toggleId}
      className={cn(
        'inline-flex items-center justify-between gap-4 cursor-pointer select-none',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
    >
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-medium text-text">{label}</span>}
          {description && <span className="text-xs text-text-3 mt-0.5">{description}</span>}
        </div>
      )}

      <div className="relative inline-flex items-center">
        <input
          id={toggleId}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only"
          {...props}
        />
        {/* Track */}
        <div
          className={cn(
            'w-11 h-6 rounded-full bg-surface-inset shadow-inset-1 transition-colors duration-base border border-transparent',
            checked ? 'border-accent-line/40 shadow-[inset_0_0_8px_var(--accent-soft)]' : 'border-hairline'
          )}
        >
          {/* Knob */}
          <motion.div
            className="w-5 h-5 rounded-full bg-surface shadow-elev-1 border border-hairline absolute top-0.5"
            animate={{
              left: checked ? '22px' : '2px',
              backgroundColor: checked ? 'var(--surface-2)' : 'var(--surface)',
            }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30,
            }}
          >
            {checked && (
              <div className="w-1.5 h-1.5 rounded-full bg-accent absolute inset-0 m-auto" />
            )}
          </motion.div>
        </div>
      </div>
    </label>
  );
}

export default Toggle;
