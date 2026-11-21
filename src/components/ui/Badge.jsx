import { Clock } from 'lucide-react';
import { cn, getCountdown, subjectColor } from '../../lib/utils';

const TONES = {
  neutral: 'bg-surface-2 text-text-2 border border-hairline',
  slate: 'bg-surface-2 text-text-2 border border-hairline',
  accent: 'bg-accent-soft text-accent border border-accent-line/30',
  success: 'bg-success-soft text-success border border-success/30',
  warning: 'bg-warning-soft text-warning border border-warning/30',
  danger: 'bg-danger-soft text-danger border border-danger/30',
  info: 'bg-info-soft text-info border border-info/30',
};

const DOTS = {
  neutral: 'bg-text-3',
  slate: 'bg-text-3',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
};

export function Badge({ tone = 'neutral', dot = false, children, className }) {
  const toneKey = TONES[tone] ? tone : 'neutral';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium tracking-tight select-none shadow-elev-1',
        TONES[toneKey],
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', DOTS[toneKey])} aria-hidden="true" />}
      {children}
    </span>
  );
}

export function PriorityBadge({ priority, className }) {
  const config = {
    High: { tone: 'danger', label: 'High' },
    Medium: { tone: 'warning', label: 'Medium' },
    Low: { tone: 'neutral', label: 'Low' },
  }[priority] || { tone: 'neutral', label: priority };

  return (
    <Badge tone={config.tone} dot className={className}>
      {config.label}
    </Badge>
  );
}

export function CategoryBadge({ category, dot = true, className }) {
  // Neutral badges unless carrying urgency per DESIGN.md §7 & requirement 3
  const config = {
    Exam: { tone: 'danger' },
    Important: { tone: 'danger' },
    Assignment: { tone: 'neutral' },
    Quiz: { tone: 'neutral' },
    Project: { tone: 'neutral' },
    Other: { tone: 'neutral' },
    General: { tone: 'neutral' },
    Academic: { tone: 'neutral' },
    Event: { tone: 'neutral' },
  }[category] || { tone: 'neutral' };

  return (
    <Badge tone={config.tone} dot={dot} className={className}>
      {category}
    </Badge>
  );
}

export function CountdownBadge({ value, now, className }) {
  const countdown = getCountdown(value, now);
  if (!countdown) return null;
  const tone = countdown.overdue ? 'danger' : countdown.urgent ? 'warning' : 'neutral';

  return (
    <Badge tone={tone} className={cn('tabular-nums', className)}>
      <Clock className="h-3 w-3 stroke-[1.5]" aria-hidden="true" />
      <span>{countdown.label}</span>
    </Badge>
  );
}

export function SubjectChip({ subject, className }) {
  const dotColor = subjectColor(subject);

  return (
    <span
      className={cn(
        'inline-flex max-w-[12rem] items-center gap-1.5 truncate rounded-full h-6 px-2.5 text-xs font-medium',
        'bg-surface-2 text-text-2 border border-hairline shadow-elev-1',
        className
      )}
      title={subject}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: dotColor }}
        aria-hidden="true"
      />
      <span className="truncate">{subject}</span>
    </span>
  );
}

export default Badge;
