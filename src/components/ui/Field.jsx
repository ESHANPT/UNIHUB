import { cn } from '../../lib/utils';
import Button from './Button';

export function Field({ label, htmlFor, error, hint, children, className }) {
  return (
    <div className={className}>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormActions({ onCancel, submitLabel, cancelLabel = 'Cancel', className }) {
  return (
    <div className={cn('flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end', className)}>
      <Button variant="secondary" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button type="submit">{submitLabel}</Button>
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return (
    <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
      {children}
    </p>
  );
}
