import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';
import Skeleton from './Skeleton';

export function ErrorBanner({ message, onRetry, className = '' }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={`mb-5 flex flex-col gap-3 rounded-md border-l-[3px] border-l-danger bg-surface p-4 text-xs text-text shadow-elev-1 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <span className="flex items-start gap-2.5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger stroke-[1.5]" aria-hidden="true" />
        <span className="leading-relaxed">{message}</span>
      </span>
      {onRetry && (
        <Button size="sm" variant="ghost" icon={RefreshCw} onClick={onRetry} className="shrink-0">
          Retry
        </Button>
      )}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading class data" aria-busy="true">
      {/* Hero skeleton */}
      <Skeleton className="h-48 rounded-xl" />
      {/* Cards row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-28 rounded-lg" />
        ))}
      </div>
      {/* Columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-lg lg:col-span-2" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    </div>
  );
}
