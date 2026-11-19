import { RefreshCw, X } from 'lucide-react';
import { usePwa } from '../../store/PwaContext';
import Button from '../ui/Button';

export default function PwaUpdateBanner() {
  const { needRefresh, updateApp, dismissUpdate } = usePwa();

  if (!needRefresh) return null;

  return (
    <aside
      aria-label="Application update available"
      className="glass fixed bottom-24 right-4 z-50 max-w-sm rounded-xl p-4 shadow-elev-3 sm:bottom-6 sm:right-6"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
          <RefreshCw className="h-4 w-4 stroke-[1.5]" aria-hidden="true" />
        </div>
        <div className="flex-1 pr-1">
          <p className="text-sm font-semibold text-text">Update available</p>
          <p className="mt-0.5 text-xs text-text-3">
            A new version of UniHub is ready.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" onClick={updateApp}>
              Update now
            </Button>
            <Button size="sm" variant="ghost" onClick={dismissUpdate}>
              Later
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismissUpdate}
          className="rounded-full p-1 text-text-3 transition-colors duration-fast hover:bg-surface hover:text-text"
          aria-label="Dismiss update notification"
        >
          <X className="h-3.5 w-3.5 stroke-[1.5]" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
