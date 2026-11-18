import { cn } from '../../lib/utils';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-soft/60 px-6 py-10 text-center',
        className,
      )}
    >
      {Icon ? (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-ink">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      ) : null}
      <p className="text-sm font-semibold">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
