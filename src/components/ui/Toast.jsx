import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn, uid } from '../../lib/utils';

const ToastContext = createContext(null);

const TONES = {
  success: { icon: CheckCircle2, className: 'tone-emerald' },
  error: { icon: AlertTriangle, className: 'tone-rose' },
  info: { icon: Info, className: 'tone-sky' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message, tone = 'success') => {
      const id = uid('toast');
      setToasts((current) => [...current.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const value = useMemo(() => notify, [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:items-end sm:px-0"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const { icon: Icon, className } = TONES[toast.tone] ?? TONES.success;
          return (
            <div
              key={toast.id}
              className="animate-rise pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-float"
            >
              <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', className)}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="flex-1 pt-0.5 text-sm font-medium leading-relaxed">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="-mr-1 rounded-lg p-1 text-muted transition hover:bg-soft hover:text-ink"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider');
  return context;
}
