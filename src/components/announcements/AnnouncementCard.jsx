import { Eye, EyeOff, Pencil, Pin, Trash2 } from 'lucide-react';
import { formatDate, parseDateTime } from '../../lib/utils';
import { Badge, CategoryBadge } from '../ui/Badge';
import { IconButton, default as Button } from '../ui/Button';

const ACCENTS = {
  General: 'from-slate-400 to-slate-500',
  Academic: 'from-sky-400 to-cyan-500',
  Important: 'from-rose-400 to-pink-500',
  Event: 'from-violet-400 to-fuchsia-500',
};

export default function AnnouncementCard({ announcement, onEdit, onDelete, onTogglePublished, busy = false }) {
  const hasActions = Boolean(onEdit || onDelete);
  const publishTime = parseDateTime(announcement.publishedAt)?.getTime() ?? 0;
  const scheduled = announcement.isPublished && publishTime > Date.now();
  const state = !announcement.isPublished ? 'Draft' : scheduled ? 'Scheduled' : 'Published';
  const stateTone = !announcement.isPublished ? 'slate' : scheduled ? 'amber' : 'emerald';

  return (
    <article className="card group relative flex flex-col overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-float">
      <span
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${ACCENTS[announcement.category] ?? ACCENTS.General}`}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={announcement.category} />
          <span className="text-[11px] font-medium text-muted">
            {formatDate(announcement.publishedAt || announcement.date, { short: true })}
          </span>
        </div>
        {hasActions ? (
          <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
            {onEdit ? (
              <IconButton icon={Pencil} label={`Edit ${announcement.title}`} onClick={() => onEdit(announcement)} />
            ) : null}
            {onDelete ? (
              <IconButton
                icon={Trash2}
                label={`Delete ${announcement.title}`}
                onClick={() => onDelete(announcement)}
                className="hover:text-rose-500"
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <h3 className="mt-3 text-[0.95rem] font-semibold leading-snug break-words">{announcement.title}</h3>
      <p className="mt-1.5 line-clamp-5 whitespace-pre-line text-xs leading-relaxed text-muted">
        {announcement.content}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-3">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
          <Pin className="h-3 w-3 text-brand" aria-hidden="true" />
          {onTogglePublished ? <Badge tone={stateTone}>{state}</Badge> : 'Class notice'}
        </span>
        {onTogglePublished ? (
          <Button
            size="sm"
            variant={announcement.isPublished ? 'secondary' : 'soft'}
            icon={announcement.isPublished ? EyeOff : Eye}
            disabled={busy}
            onClick={() => onTogglePublished(announcement)}
          >
            {announcement.isPublished ? 'Unpublish' : 'Publish now'}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
