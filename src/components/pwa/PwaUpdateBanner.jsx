import { RefreshCw, X } from 'lucide-react';
import { usePwa } from '../../store/PwaContext';
import Button from '../ui/Button';

export default function PwaUpdateBanner() {
  const { needRefresh, updateApp, dismissUpdate } = usePwa();

  if (!needRefresh) return null;

  return (
    <aside
      aria-label="Application update available"
      className="fixed bottom-20 right-4 z-50 max-w-sm rounded-2xl border border-brand/30 bg-surface p-4 shadow-float sm:bottom-6 sm:right-6 animate-rise"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex-1 pr-1">
          <p className="text-sm font-semibold text-ink">Update available</p>
          <p className="mt-0.5 text-xs text-muted">
            A new version of UniHub is ready. Reload to apply updates.
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
          className="rounded-lg p-1 text-muted transition hover:bg-soft hover:text-ink"
          aria-label="Dismiss update notification"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
