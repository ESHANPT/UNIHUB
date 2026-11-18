import { BellRing, CalendarClock, Pencil, Trash2 } from 'lucide-react';
import { cn, formatDateTime } from '../../lib/utils';
import { CountdownBadge, SubjectChip } from '../ui/Badge';
import { IconButton } from '../ui/Button';

export default function ReminderCard({ reminder, now, onEdit, onDelete }) {
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <article className="card group flex items-start gap-3 p-4 transition sm:p-5">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
        <BellRing className="h-4 w-4" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug break-words">{reminder.title}</p>
            {reminder.description ? (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{reminder.description}</p>
            ) : null}
          </div>
          {hasActions ? (
            <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
              {onEdit ? <IconButton icon={Pencil} label={`Edit ${reminder.title}`} onClick={() => onEdit(reminder)} /> : null}
              {onDelete ? (
                <IconButton
                  icon={Trash2}
                  label={`Delete ${reminder.title}`}
                  onClick={() => onDelete(reminder)}
                  className="hover:text-rose-500"
                />
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDateTime(reminder.datetime)}
          </span>
          <CountdownBadge value={reminder.datetime} now={now} />
          {reminder.category && reminder.category !== 'General' ? (
            <SubjectChip subject={reminder.category} className="ml-auto" />
          ) : null}
        </div>
      </div>
    </article>
  );
}
