import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Button = forwardRef(function Button(
  {
    variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft'
    size = 'md',        // 'sm' | 'md' | 'lg' | 'icon'
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    disabled = false,
    className,
    children,
    type = 'button',
    ...props
  },
  ref
) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-base ease-out select-none cursor-pointer disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg';

  const variantStyles = {
    primary:
      'bg-accent text-accent-ink rounded-md shadow-elev-1 hover:bg-accent-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] active:shadow-inset-2 font-semibold',
    secondary:
      'bg-surface text-text border border-hairline rounded-md shadow-elev-1 hover:border-accent-line hover:text-text hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] active:bg-surface-inset active:shadow-inset-2',
    soft:
      'bg-accent-soft text-accent border border-accent-line/30 rounded-md hover:bg-accent/20 active:scale-[0.985]',
    ghost:
      'bg-transparent text-text-2 rounded-md hover:bg-surface hover:text-text hover:shadow-elev-1 active:scale-[0.985]',
    danger:
      'bg-danger-soft text-danger border border-danger/30 rounded-md hover:bg-danger/25 active:scale-[0.985]',
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-sm',
    md: 'min-h-[44px] h-11 px-4 text-sm gap-2 rounded-md',
    lg: 'min-h-[48px] h-12 px-6 text-base gap-2.5 rounded-md',
    icon: 'h-10 w-10 min-h-[40px] min-w-[40px] p-0 rounded-full',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(baseStyles, variantStyles[variant] || variantStyles.primary, sizeStyles[size] || sizeStyles.md, className)}
      {...props}
    >
      {/* If loading, display 3 pulsing dots while maintaining layout */}
      <span className={cn('inline-flex items-center gap-2', loading && 'opacity-0')}>
        {Icon ? <Icon className="h-4 w-4 shrink-0 stroke-[1.5]" aria-hidden="true" /> : null}
        {children}
        {IconRight ? <IconRight className="h-4 w-4 shrink-0 stroke-[1.5]" aria-hidden="true" /> : null}
      </span>

      {loading && (
        <span className="absolute inset-0 flex items-center justify-center gap-1" aria-hidden="true">
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse [animation-delay:160ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse [animation-delay:320ms]" />
        </span>
      )}
    </button>
  );
});

export const IconButton = forwardRef(function IconButton(
  {
    icon: Icon,
    label,
    variant = 'ghost', // 'ghost' | 'raised' | 'primary'
    size = 'md',
    loading = false,
    className,
    ...props
  },
  ref
) {
  const variantStyles = {
    ghost: 'bg-transparent text-text-2 hover:text-text hover:bg-surface hover:shadow-elev-1 active:bg-surface-inset active:shadow-inset-2 active:scale-[0.985]',
    raised: 'bg-surface text-text shadow-elev-1 border border-hairline hover:border-accent-line hover:-translate-y-0.5 active:translate-y-0 active:bg-surface-inset active:shadow-inset-2 active:scale-[0.985]',
    primary: 'bg-accent text-accent-ink shadow-elev-1 hover:bg-accent-hover active:scale-[0.985]',
  };

  const sizeStyles = {
    sm: 'h-8 w-8 min-h-[32px] min-w-[32px]',
    md: 'h-10 w-10 min-h-[40px] min-w-[40px]',
    lg: 'h-11 w-11 min-h-[44px] min-w-[44px]',
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full transition-all duration-base ease-out select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-40 disabled:pointer-events-none',
        variantStyles[variant] || variantStyles.ghost,
        sizeStyles[size] || sizeStyles.md,
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-1">
          <span className="h-1 w-1 rounded-full bg-current animate-pulse" />
          <span className="h-1 w-1 rounded-full bg-current animate-pulse [animation-delay:150ms]" />
        </span>
      ) : (
        Icon ? <Icon className="h-4 w-4 stroke-[1.5]" aria-hidden="true" /> : null
      )}
    </button>
  );
});

export default Button;
