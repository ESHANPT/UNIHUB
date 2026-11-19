import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Card = forwardRef(function Card(
  {
    variant = 'raised', // 'raised' | 'inset' | 'flat' | 'hero'
    clickable = false,
    className,
    children,
    as: Component = 'div',
    ...props
  },
  ref
) {
  const variantStyles = {
    raised: cn(
      'bg-surface rounded-lg shadow-elev-2 border border-transparent p-6 transition-all duration-base ease-out',
      clickable && 'neu-raised-interactive'
    ),
    inset: 'bg-surface-inset rounded-md shadow-inset-1 border border-transparent p-5',
    flat: 'bg-surface/50 rounded-lg border border-hairline p-5',
    hero: 'bg-surface rounded-xl shadow-elev-3 border border-hairline p-6 md:p-8',
  };

  return (
    <Component
      ref={ref}
      className={cn(variantStyles[variant] || variantStyles.raised, className)}
      {...props}
    >
      {children}
    </Component>
  );
});

export function CardHeader({ className, children, title, action, ...props }) {
  if (title || action) {
    return (
      <div className={cn('flex items-center justify-between gap-4 mb-4', className)} {...props}>
        {title ? (
          typeof title === 'string' ? (
            <h2 className="text-base font-semibold text-text">{title}</h2>
          ) : (
            title
          )
        ) : null}
        {action}
      </div>
    );
  }
  return (
    <div className={cn('flex items-center justify-between gap-4 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, as: Component = 'h2', ...props }) {
  return (
    <Component className={cn('text-base font-semibold text-text', className)} {...props}>
      {children}
    </Component>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('text-sm text-text-2', className)} {...props}>
      {children}
    </div>
  );
}

export default Card;
