import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export function ErrorBanner({ message, onRetry, className = '' }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={`mb-5 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <span className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="leading-relaxed">{message}</span>
      </span>
      {onRetry ? (
        <Button size="sm" variant="secondary" icon={RefreshCw} onClick={onRetry} className="shrink-0">
          Retry
        </Button>
      ) : null}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-label="Loading class data" aria-busy="true">
      <div className="h-44 rounded-3xl border border-line bg-soft" />
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-24 rounded-2xl border border-line bg-soft" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="h-72 rounded-3xl border border-line bg-soft lg:col-span-2" />
        <div className="h-72 rounded-3xl border border-line bg-soft" />
      </div>
    </div>
  );
}
