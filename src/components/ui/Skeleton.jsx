import { cn } from '../../lib/utils';

export function Skeleton({ className, rounded = 'rounded-md', ...props }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-surface-inset shadow-inset-1',
        rounded,
        className
      )}
      {...props}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2.2s_infinite_linear] bg-gradient-to-r from-transparent via-surface/40 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}

export function SkeletonText({ lines = 2, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-3.5',
            i === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn('bg-surface rounded-lg shadow-elev-2 p-6 space-y-4 border border-transparent', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}

export default Skeleton;
