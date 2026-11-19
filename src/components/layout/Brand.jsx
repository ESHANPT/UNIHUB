import { GraduationCap } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Brand({ compact = false, className }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-inset shadow-inset-1 border border-hairline text-accent">
        <GraduationCap className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
      </div>
      <div className="leading-tight">
        <p className="text-lg font-serif tracking-tight text-text">
          UniHub<span className="text-accent font-sans">.</span>
        </p>
        {!compact && (
          <p className="text-[11px] font-sans text-text-3 tracking-normal">Student dashboard</p>
        )}
      </div>
    </div>
  );
}
