import { CheckCircle2, Download, Smartphone, Share } from 'lucide-react';
import { usePwa } from '../../store/PwaContext';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';

export default function PwaInstallCard() {
  const { canInstall, isInstalled, isIos, installApp } = usePwa();
  const notify = useToast();

  const handleInstall = async () => {
    try {
      const installed = await installApp();
      if (installed) {
        notify('UniHub installation started.', 'success');
      }
    } catch (err) {
      notify('Installation could not be initiated.', 'error');
    }
  };

  return (
    <section className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Smartphone className="h-4 w-4 text-brand" aria-hidden="true" />
            Install App
          </h2>
          <p className="mt-1 text-xs text-muted">
            Run UniHub as a standalone Progressive Web App on mobile, tablet, or desktop.
          </p>
        </div>
        {isInstalled ? (
          <span className="badge tone-emerald shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Installed
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        {isInstalled ? (
          <div className="rounded-xl border border-line bg-soft px-3.5 py-3 text-xs text-muted">
            <p className="font-medium text-ink">UniHub is running in standalone app mode.</p>
            <p className="mt-0.5 text-[11px]">
              Enjoy full-screen access, fast launch, and saved offline assets.
            </p>
          </div>
        ) : canInstall ? (
          <div className="flex flex-col gap-3 rounded-xl border border-brand/20 bg-brand-soft/40 p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-ink">Install on this device</p>
              <p className="mt-0.5 text-[11px] text-muted">
                Add UniHub to your home screen or desktop for rapid one-tap access.
              </p>
            </div>
            <Button size="sm" icon={Download} onClick={handleInstall} className="shrink-0 self-start sm:self-auto">
              Install UniHub
            </Button>
          </div>
        ) : isIos ? (
          <div className="rounded-xl border border-line bg-soft p-3.5 text-xs text-muted">
            <p className="flex items-center gap-1.5 font-semibold text-ink">
              <Share className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              How to install on iOS / Safari
            </p>
            <p className="mt-1 text-[11px] leading-relaxed">
              1. Tap the <strong className="text-ink">Share</strong> button at the bottom of Safari.<br />
              2. Scroll down and tap <strong className="text-ink">Add to Home Screen</strong>.<br />
              3. Tap <strong className="text-ink">Add</strong> in the top right.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-line bg-soft px-3.5 py-3 text-xs text-muted">
            <p className="font-medium text-ink">Browser Web App</p>
            <p className="mt-0.5 text-[11px]">
              You are viewing UniHub in a supported browser. App installation prompts appear automatically when
              supported by your current device and browser.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
