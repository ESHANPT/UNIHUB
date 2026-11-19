import { CheckCircle2, Download, Smartphone, Share } from 'lucide-react';
import { usePwa } from '../../store/PwaContext';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

export default function PwaInstallCard() {
  const { canInstall, isInstalled, isIos, installApp } = usePwa();
  const notify = useToast();

  const handleInstall = async () => {
    try {
      const installed = await installApp();
      if (installed) {
        notify('Installation initiated.', 'success');
      }
    } catch {
      notify('Installation could not be started.', 'error');
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
            <Smartphone className="h-4 w-4 text-accent stroke-[1.5]" aria-hidden="true" />
            Install application
          </h2>
          <p className="mt-1 text-xs text-text-3">
            Run UniHub as a standalone Progressive Web App on mobile, tablet, or desktop.
          </p>
        </div>
        {isInstalled && (
          <Badge tone="success" dot className="shrink-0">
            Installed
          </Badge>
        )}
      </div>

      <div className="mt-4">
        {isInstalled ? (
          <div className="rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-4 text-xs text-text-2">
            <p className="font-medium text-text">UniHub is running in standalone mode.</p>
            <p className="mt-0.5 text-[11px] text-text-3">
              Full-screen layout and cached offline assets are enabled.
            </p>
          </div>
        ) : canInstall ? (
          <div className="flex flex-col gap-3.5 rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-text">Install on this device</p>
              <p className="mt-0.5 text-[11px] text-text-3">
                Add UniHub to your home screen or desktop for rapid access.
              </p>
            </div>
            <Button size="sm" icon={Download} onClick={handleInstall} className="shrink-0 self-start sm:self-auto">
              Install UniHub
            </Button>
          </div>
        ) : isIos ? (
          <div className="rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-4 text-xs text-text-3">
            <p className="flex items-center gap-1.5 font-semibold text-text">
              <Share className="h-3.5 w-3.5 text-accent stroke-[1.5]" aria-hidden="true" />
              Installation on iOS / Safari
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-text-2">
              1. Tap the Share button in Safari.<br />
              2. Scroll down and select Add to Home Screen.<br />
              3. Tap Add to complete setup.
            </p>
          </div>
        ) : (
          <div className="rounded-md bg-surface-inset shadow-inset-1 border border-hairline/60 p-4 text-xs text-text-3">
            <p className="font-medium text-text">Browser web application</p>
            <p className="mt-0.5 text-[11px] leading-relaxed">
              You are viewing UniHub in a supported browser. App installation prompts appear automatically when supported by your platform.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
