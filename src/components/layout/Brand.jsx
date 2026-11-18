import { GraduationCap } from 'lucide-react';

export default function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-strong text-white shadow-[0_12px_22px_-12px_var(--brand)]">
        <GraduationCap className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="leading-tight">
        <p className="text-base font-bold tracking-tight">
          UniHub<span className="text-brand">.</span>
        </p>
        {!compact ? <p className="text-[11px] font-medium text-muted">Student dashboard</p> : null}
      </div>
    </div>
  );
}
