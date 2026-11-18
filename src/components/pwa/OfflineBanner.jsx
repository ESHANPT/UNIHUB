import { WifiOff } from 'lucide-react';
import { usePwa } from '../../store/PwaContext';

export default function OfflineBanner() {
  const { isOnline } = usePwa();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-300/40 bg-amber-500/10 px-4 py-3 text-xs font-medium text-amber-900 dark:text-amber-200"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300">
        <WifiOff className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <span className="font-semibold">You are currently offline.</span> Live class deadlines, timetable, and
        announcements may not reflect recent updates until connection is restored.
      </div>
    </div>
  );
}
