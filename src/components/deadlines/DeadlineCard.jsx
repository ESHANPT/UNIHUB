import { CalendarClock, Pencil, Trash2 } from 'lucide-react';
import { cn, formatDateTime, parseDateTime } from '../../lib/utils';
import { CategoryBadge, CountdownBadge, PriorityBadge, SubjectChip } from '../ui/Badge';
import { IconButton } from '../ui/Button';
import Checkbox from '../ui/Checkbox';

export default function DeadlineCard({ deadline, now, onEdit, onDelete, onToggle, busy = false }) {
  const completed = Boolean(deadline.completed);
  const hasActions = Boolean(onEdit || onDelete);

  // Compute urgency bar for DESIGN.md §7: 3px left bar (--danger / --warning / --text-3)
  const dueDate = parseDateTime(deadline.dueDate);
  const diff = dueDate ? dueDate.getTime() - (now || Date.now()) : 0;
  const isOverdue = diff < 0 && !completed;
  const isUrgent = diff >= 0 && diff <= 48 * 60 * 60 * 1000 && !completed;

  const barColor = completed
    ? 'var(--text-3)'
    : isOverdue
      ? 'var(--danger)'
      : isUrgent
        ? 'var(--warning)'
        : 'var(--hairline)';

  return (
    <article
      className={cn(
        'group relative flex flex-col justify-between rounded-lg bg-surface shadow-elev-1 border border-hairline p-4 sm:p-5 transition-all duration-base ease-out',
        'hover:-translate-y-0.5 hover:shadow-elev-2 hover:border-accent-line/40'
      )}
      style={{ borderLeftWidth: '3.5px', borderLeftColor: barColor }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {onToggle && (
            <div className="pt-0.5 shrink-0">
              <Checkbox
                checked={completed}
                disabled={busy}
                onChange={() => onToggle(deadline)}
                aria-label={`Mark ${deadline.title} as ${completed ? 'pending' : 'complete'}`}
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <SubjectChip subject={deadline.subject} />
              <CategoryBadge category={deadline.category} dot={false} />
            </div>

            <h3
              className={cn(
                'text-sm font-semibold text-text leading-snug break-words transition-colors',
                completed && 'text-text-3 line-through'
              )}
            >
              {deadline.title}
            </h3>

            {deadline.description && (
              <p className="mt-1 line-clamp-2 text-xs text-text-3 leading-relaxed">
                {deadline.description}
              </p>
            )}
          </div>
        </div>

        {hasActions && (
          <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            {onEdit && (
              <IconButton
                icon={Pencil}
                size="sm"
                variant="raised"
                label={`Edit ${deadline.title}`}
                onClick={() => onEdit(deadline)}
              />
            )}
            {onDelete && (
              <IconButton
                icon={Trash2}
                size="sm"
                variant="raised"
                label={`Delete ${deadline.title}`}
                onClick={() => onDelete(deadline)}
                className="hover:text-danger"
              />
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-hairline/60 flex flex-wrap items-center justify-between gap-2 text-xs text-text-3">
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <CalendarClock className="h-3.5 w-3.5 stroke-[1.5]" aria-hidden="true" />
          <span>{formatDateTime(deadline.dueDate)}</span>
        </span>

        <div className="flex items-center gap-2">
          {!completed && <CountdownBadge value={deadline.dueDate} now={now} />}
          <PriorityBadge priority={deadline.priority} />
        </div>
      </div>
    </article>
  );
}
