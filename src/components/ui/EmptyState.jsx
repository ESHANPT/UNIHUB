import { cn } from '../../lib/utils';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg bg-surface-inset/40 p-8 text-center border border-hairline/60 shadow-inset-1',
        className
      )}
    >
      {Icon && (
        <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-full bg-surface-inset shadow-inset-1 text-text-3 border border-hairline">
          <Icon className="h-5 w-5 stroke-[1.5] text-accent/80" aria-hidden="true" />
        </div>
      )}
      {title && <h3 className="text-sm font-semibold text-text">{title}</h3>}
      {description && (
        <p className="mt-1 max-w-sm text-xs text-text-3 leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
