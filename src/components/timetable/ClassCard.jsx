import { MapPin, Pencil, Trash2, User } from 'lucide-react';
import { cn, formatTimeRange, subjectColor } from '../../lib/utils';
import { IconButton } from '../ui/Button';

export default function ClassCard({ entry, onEdit, onDelete, comfortable = false }) {
  const hasActions = Boolean(onEdit || onDelete);
  const color = subjectColor(entry.subject);

  return (
    <div
      className={cn(
        'group relative rounded-md bg-surface shadow-elev-1 border border-hairline p-3 transition-all duration-base ease-out',
        'hover:-translate-y-0.5 hover:shadow-elev-2 hover:border-accent-line/40'
      )}
      style={{
        borderLeftWidth: '3.5px',
        borderLeftColor: color,
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="text-[11px] font-medium text-text-3 tabular-nums">
          {formatTimeRange(entry.startTime, entry.endTime)}
        </p>

        {hasActions && (
          <div className="-mr-1 -mt-1 flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            {onEdit && (
              <IconButton
                icon={Pencil}
                label={`Edit ${entry.subject}`}
                onClick={() => onEdit(entry)}
                size="sm"
                variant="raised"
                className="h-6 w-6 min-h-[24px] min-w-[24px]"
              />
            )}
            {onDelete && (
              <IconButton
                icon={Trash2}
                label={`Delete ${entry.subject}`}
                onClick={() => onDelete(entry)}
                size="sm"
                variant="raised"
                className="h-6 w-6 min-h-[24px] min-w-[24px] hover:text-danger"
              />
            )}
          </div>
        )}
      </div>

      <p className={cn('mt-1 font-semibold text-text leading-snug break-words', comfortable ? 'text-sm' : 'text-xs')}>
        {entry.subject}
      </p>

      <div className="mt-1.5 space-y-1 text-[11px] leading-tight text-text-3">
        {entry.location && (
          <p className="flex items-start gap-1">
            <MapPin className="mt-px h-3 w-3 shrink-0 stroke-[1.5]" aria-hidden="true" />
            <span className="break-words">{entry.location}</span>
          </p>
        )}
        {entry.lecturer && (
          <p className="flex items-start gap-1">
            <User className="mt-px h-3 w-3 shrink-0 stroke-[1.5]" aria-hidden="true" />
            <span className="break-words">{entry.lecturer}</span>
          </p>
        )}
      </div>
    </div>
  );
}
