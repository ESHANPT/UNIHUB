import { BellRing, CalendarClock, Pencil, Trash2 } from 'lucide-react';
import { cn, formatDateTime } from '../../lib/utils';
import { CountdownBadge, SubjectChip } from '../ui/Badge';
import { IconButton } from '../ui/Button';

export default function ReminderCard({ reminder, now, onEdit, onDelete }) {
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <article className="group relative flex items-start gap-3.5 rounded-lg bg-surface shadow-elev-1 border border-hairline p-4 sm:p-5 transition-all duration-base ease-out hover:-translate-y-0.5 hover:shadow-elev-2 hover:border-accent-line/40">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-inset shadow-inset-1 border border-hairline text-accent">
        <BellRing className="h-4 w-4 stroke-[1.5]" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-text leading-snug break-words">
              {reminder.title}
            </h3>
            {reminder.description && (
              <p className="mt-1 line-clamp-2 text-xs text-text-3 leading-relaxed">
                {reminder.description}
              </p>
            )}
          </div>

          {hasActions && (
            <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              {onEdit && (
                <IconButton
                  icon={Pencil}
                  size="sm"
                  variant="raised"
                  label={`Edit ${reminder.title}`}
                  onClick={() => onEdit(reminder)}
                />
              )}
              {onDelete && (
                <IconButton
                  icon={Trash2}
                  size="sm"
                  variant="raised"
                  label={`Delete ${reminder.title}`}
                  onClick={() => onDelete(reminder)}
                  className="hover:text-danger"
                />
              )}
            </div>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-hairline/60 flex flex-wrap items-center justify-between gap-2 text-xs text-text-3">
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <CalendarClock className="h-3.5 w-3.5 stroke-[1.5]" aria-hidden="true" />
            <span>{formatDateTime(reminder.datetime)}</span>
          </span>

          <div className="flex items-center gap-2">
            <CountdownBadge value={reminder.datetime} now={now} />
            {reminder.category && reminder.category !== 'General' && (
              <SubjectChip subject={reminder.category} />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
