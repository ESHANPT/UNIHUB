import { MapPin, Pencil, Trash2, User } from 'lucide-react';
import { cn, formatTimeRange, subjectColor } from '../../lib/utils';
import { IconButton } from '../ui/Button';

export default function ClassCard({ entry, onEdit, onDelete, comfortable = false }) {
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <div
      className="subject-card group relative rounded-xl border border-line/70 p-2.5 transition"
      style={{ '--subject-color': subjectColor(entry.subject) }}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
          {formatTimeRange(entry.startTime, entry.endTime)}
        </p>
        {hasActions ? (
          <div className="-mr-1 -mt-1 flex shrink-0 items-center gap-0.5 opacity-100 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
            {onEdit ? (
              <IconButton
                icon={Pencil}
                label={`Edit ${entry.subject}`}
                onClick={() => onEdit(entry)}
                className="h-7 w-7 p-1"
              />
            ) : null}
            {onDelete ? (
              <IconButton
                icon={Trash2}
                label={`Delete ${entry.subject}`}
                onClick={() => onDelete(entry)}
                className="h-7 w-7 p-1 hover:text-rose-500"
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <p className={cn('mt-1 font-semibold leading-snug break-words', comfortable ? 'text-sm' : 'text-xs')}>
        {entry.subject}
      </p>

      <div className="mt-1.5 space-y-1 text-[10px] leading-tight text-muted">
        {entry.location ? (
          <p className="flex items-start gap-1">
            <MapPin className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="break-words">{entry.location}</span>
          </p>
        ) : null}
        {entry.lecturer ? (
          <p className="flex items-start gap-1">
            <User className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="break-words">{entry.lecturer}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
