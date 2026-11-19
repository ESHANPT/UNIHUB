import { cn } from '../../lib/utils';

export default function StatCard({ label, value, hint, icon: Icon, className }) {
  return (
    <div className={cn('bg-surface rounded-lg shadow-elev-2 p-5 border border-transparent flex items-start gap-4', className)}>
      {Icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-inset shadow-inset-1 text-accent border border-hairline">
          <Icon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-text-2">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold leading-tight tracking-tight text-text tabular-nums">{value}</p>
        {hint && <p className="mt-1 truncate text-xs text-text-3" title={hint}>{hint}</p>}
      </div>
    </div>
  );
}
