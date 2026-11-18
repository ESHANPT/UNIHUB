import { cn } from '../../lib/utils';

const TONES = {
  brand: 'bg-brand-soft text-brand-ink',
  sky: 'tone-sky',
  rose: 'tone-rose',
  amber: 'tone-amber',
  emerald: 'tone-emerald',
  violet: 'tone-violet',
};

export default function StatCard({ label, value, hint, icon: Icon, tone = 'brand', className }) {
  return (
    <div className={cn('card flex items-start gap-4 p-4 sm:p-5', className)}>
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
          TONES[tone] ?? TONES.brand,
        )}
      >
        {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : null}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-0.5 text-2xl font-bold leading-tight tracking-tight">{value}</p>
        {hint ? <p className="mt-1 truncate text-xs text-muted" title={hint}>{hint}</p> : null}
      </div>
    </div>
  );
}
