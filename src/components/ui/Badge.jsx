import { Clock } from 'lucide-react';
import { cn, getCountdown } from '../../lib/utils';

export function Badge({ tone = 'slate', children, className }) {
  return <span className={cn('badge', `tone-${tone}`, className)}>{children}</span>;
}

const PRIORITY_TONES = {
  High: 'rose',
  Medium: 'amber',
  Low: 'emerald',
};

const PRIORITY_DOTS = {
  High: 'bg-rose-500',
  Medium: 'bg-amber-500',
  Low: 'bg-emerald-500',
};

export function PriorityBadge({ priority, className }) {
  return (
    <Badge tone={PRIORITY_TONES[priority] ?? 'slate'} className={className}>
      <span className={cn('h-1.5 w-1.5 rounded-full', PRIORITY_DOTS[priority] ?? 'bg-slate-400')} />
      {priority}
    </Badge>
  );
}

const CATEGORY_TONES = {
  Assignment: 'sky',
  Quiz: 'violet',
  Exam: 'rose',
  Project: 'amber',
  Other: 'slate',
  General: 'slate',
  Academic: 'sky',
  Important: 'rose',
  Event: 'violet',
};

const CATEGORY_DOTS = {
  Assignment: 'bg-sky-500',
  Quiz: 'bg-violet-500',
  Exam: 'bg-rose-500',
  Project: 'bg-amber-500',
  Other: 'bg-slate-400',
  General: 'bg-slate-400',
  Academic: 'bg-sky-500',
  Important: 'bg-rose-500',
  Event: 'bg-violet-500',
};

export function CategoryBadge({ category, dot = true, className }) {
  return (
    <Badge tone={CATEGORY_TONES[category] ?? 'slate'} className={className}>
      {dot ? <span className={cn('h-1.5 w-1.5 rounded-full', CATEGORY_DOTS[category] ?? 'bg-slate-400')} /> : null}
      {category}
    </Badge>
  );
}

export function CountdownBadge({ value, now, className }) {
  const countdown = getCountdown(value, now);
  if (!countdown) return null;
  const tone = countdown.overdue ? 'rose' : countdown.urgent ? 'amber' : 'slate';
  return (
    <Badge tone={tone} className={className}>
      <Clock className="h-3 w-3" aria-hidden="true" />
      {countdown.label}
    </Badge>
  );
}

export function SubjectChip({ subject, className }) {
  return (
    <span
      className={cn(
        'inline-flex max-w-[11rem] items-center gap-1.5 truncate rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold',
        'bg-soft text-muted ring-1 ring-line',
        className,
      )}
      title={subject}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
      <span className="truncate">{subject}</span>
    </span>
  );
}
