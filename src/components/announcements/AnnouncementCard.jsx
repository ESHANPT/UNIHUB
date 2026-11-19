import { Eye, EyeOff, Pencil, Pin, Trash2 } from 'lucide-react';
import { formatDate, parseDateTime } from '../../lib/utils';
import { Badge, CategoryBadge } from '../ui/Badge';
import { IconButton, default as Button } from '../ui/Button';

export default function AnnouncementCard({ announcement, onEdit, onDelete, onTogglePublished, busy = false }) {
  const hasActions = Boolean(onEdit || onDelete);
  const publishTime = parseDateTime(announcement.publishedAt)?.getTime() ?? 0;
  const scheduled = announcement.isPublished && publishTime > Date.now();
  const state = !announcement.isPublished ? 'Draft' : scheduled ? 'Scheduled' : 'Published';
  const stateTone = !announcement.isPublished ? 'neutral' : scheduled ? 'warning' : 'success';

  // Author initials for avatar per DESIGN.md §6
  const authorName = announcement.author || 'Admin';
  const initials = authorName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <article className="group relative flex flex-col justify-between rounded-lg bg-surface shadow-elev-1 border border-hairline p-5 transition-all duration-base ease-out hover:-translate-y-0.5 hover:shadow-elev-2 hover:border-accent-line/40">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* Author avatar circle raised per DESIGN.md §6 */}
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 border border-hairline shadow-elev-1 text-[11px] font-semibold text-text">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <CategoryBadge category={announcement.category} />
                {/* Brass unread/category dot per DESIGN.md §7 */}
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-text-3 tabular-nums">
              {formatDate(announcement.publishedAt || announcement.date, { short: true })}
            </span>

            {hasActions && (
              <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                {onEdit && (
                  <IconButton
                    icon={Pencil}
                    size="sm"
                    variant="raised"
                    label={`Edit ${announcement.title}`}
                    onClick={() => onEdit(announcement)}
                  />
                )}
                {onDelete && (
                  <IconButton
                    icon={Trash2}
                    size="sm"
                    variant="raised"
                    label={`Delete ${announcement.title}`}
                    onClick={() => onDelete(announcement)}
                    className="hover:text-danger"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <h3 className="mt-3.5 text-sm font-semibold text-text leading-snug break-words">
          {announcement.title}
        </h3>

        <p className="mt-1.5 line-clamp-4 whitespace-pre-line text-xs leading-relaxed text-text-2">
          {announcement.content}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-hairline/60 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs text-text-3 font-medium">
          <Pin className="h-3.5 w-3.5 text-accent stroke-[1.5]" aria-hidden="true" />
          {onTogglePublished ? <Badge tone={stateTone}>{state}</Badge> : <span>Class notice</span>}
        </span>

        {onTogglePublished && (
          <Button
            size="sm"
            variant="ghost"
            icon={announcement.isPublished ? EyeOff : Eye}
            disabled={busy}
            onClick={() => onTogglePublished(announcement)}
          >
            {announcement.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
        )}
      </div>
    </article>
  );
}
