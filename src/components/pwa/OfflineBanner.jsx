import { WifiOff } from 'lucide-react';
import { usePwa } from '../../store/PwaContext';

export default function OfflineBanner() {
  const { isOnline } = usePwa();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-5 flex items-center gap-3 rounded-md border-l-[3px] border-l-warning bg-surface p-3.5 text-xs text-text shadow-elev-1"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning">
        <WifiOff className="h-3.5 w-3.5 stroke-[1.5]" aria-hidden="true" />
      </div>
      <div className="flex-1 leading-relaxed text-text-2">
        <span className="font-semibold text-text">Offline mode.</span> Cached data is shown. Changes will sync once your connection is restored.
      </div>
    </div>
  );
}
