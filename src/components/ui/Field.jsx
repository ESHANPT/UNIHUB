import { cn } from '../../lib/utils';
import Button from './Button';

export function Field({ label, htmlFor, error, hint, children, className }) {
  return (
    <div className={className}>
      {label && (
        <label className="block mb-1.5 text-xs font-medium text-text-2 select-none" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-danger flex items-center gap-1.5">
          <span className="inline-block w-1 h-3 rounded-full bg-danger" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-text-3 leading-relaxed">{hint}</p>
      ) : null}
    </div>
  );
}

export function FormActions({ onCancel, submitLabel, cancelLabel = 'Cancel', loading = false, className }) {
  return (
    <div className={cn('flex flex-col-reverse gap-2.5 pt-4 sm:flex-row sm:justify-end', className)}>
      {onCancel && (
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
      )}
      <Button type="submit" loading={loading}>
        {submitLabel}
      </Button>
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-md border-l-2 border-danger bg-danger-soft px-3.5 py-2.5 text-xs font-medium text-danger">
      <span className="shrink-0">{children}</span>
    </div>
  );
}
