import { cn } from '../../lib/utils';

export default function PageHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn('mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif text-text tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-xs sm:text-sm text-text-2 max-w-prose">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
