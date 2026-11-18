import { CalendarClock, Check, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { cn, formatDateTime } from '../../lib/utils';
import { Badge, CategoryBadge, CountdownBadge, PriorityBadge, SubjectChip } from '../ui/Badge';
import { IconButton } from '../ui/Button';

export default function DeadlineCard({ deadline, now, onEdit, onDelete, onToggle, busy = false }) {
  const completed = deadline.completed;
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <article
      className={cn(
        'card group flex flex-col gap-3 p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-float',
        completed && 'border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-500/25 dark:bg-emerald-500/[0.06]',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <SubjectChip subject={deadline.subject} />
          <CategoryBadge category={deadline.category} dot={false} />
        </div>
        {hasActions ? (
          <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
            {onEdit ? <IconButton icon={Pencil} label={`Edit ${deadline.title}`} onClick={() => onEdit(deadline)} /> : null}
            {onDelete ? (
              <IconButton
                icon={Trash2}
                label={`Delete ${deadline.title}`}
                onClick={() => onDelete(deadline)}
                className="hover:text-rose-500"
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <div>
        <h3
          className={cn(
            'text-[0.95rem] font-semibold leading-snug break-words',
            completed && 'text-muted line-through decoration-emerald-500/60',
          )}
        >
          {deadline.title}
        </h3>
        {deadline.description ? (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{deadline.description}</p>
        ) : null}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDateTime(deadline.dueDate)}
        </span>
        {completed ? (
          <Badge tone="emerald">
            <Check className="h-3 w-3" aria-hidden="true" />
            Completed
          </Badge>
        ) : (
          <CountdownBadge value={deadline.dueDate} now={now} />
        )}
        <PriorityBadge priority={deadline.priority} className="ml-auto" />
      </div>

      {onToggle ? (
        <button
          type="button"
          onClick={() => onToggle(deadline)}
          disabled={busy}
          aria-pressed={completed}
          className={cn(
            'inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-60',
            completed
              ? 'border-emerald-300/70 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-300'
              : 'border-line bg-soft text-muted hover:border-brand/40 hover:text-brand-ink',
          )}
        >
          {completed ? (
            <>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Mark as pending
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Mark complete
            </>
          )}
        </button>
      ) : null}
    </article>
  );
}
