import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef(function Input(
  { className, error, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      aria-invalid={error ? 'true' : 'false'}
      className={cn(
        'w-full h-[46px] px-4 rounded-md bg-surface-inset text-text text-sm placeholder:text-text-3 border border-transparent shadow-inset-1',
        'transition-all duration-base ease-out',
        'hover:border-hairline',
        'focus:outline-none focus:border-accent-line focus:shadow-inset-2 focus:ring-1 focus:ring-accent-line',
        error && 'border-l-[3px] border-l-danger focus:border-l-danger',
        className
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea(
  { className, error, rows = 3, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={error ? 'true' : 'false'}
      className={cn(
        'w-full p-4 rounded-md bg-surface-inset text-text text-sm placeholder:text-text-3 border border-transparent shadow-inset-1',
        'transition-all duration-base ease-out resize-y min-h-[90px]',
        'hover:border-hairline',
        'focus:outline-none focus:border-accent-line focus:shadow-inset-2 focus:ring-1 focus:ring-accent-line',
        error && 'border-l-[3px] border-l-danger focus:border-l-danger',
        className
      )}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select(
  { className, error, children, ...props },
  ref
) {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        aria-invalid={error ? 'true' : 'false'}
        className={cn(
          'w-full h-[46px] px-4 pr-10 rounded-md bg-surface-inset text-text text-sm appearance-none border border-transparent shadow-inset-1 cursor-pointer',
          'transition-all duration-base ease-out',
          'hover:border-hairline',
          'focus:outline-none focus:border-accent-line focus:shadow-inset-2 focus:ring-1 focus:ring-accent-line',
          error && 'border-l-[3px] border-l-danger focus:border-l-danger',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-3" aria-hidden="true">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
});

export default Input;
