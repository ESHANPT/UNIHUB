import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn, uid } from '../../lib/utils';

const ToastContext = createContext(null);

const TONES = {
  success: { icon: CheckCircle2, iconColor: 'text-success' },
  error: { icon: AlertCircle, iconColor: 'text-danger' },
  info: { icon: Info, iconColor: 'text-info' },
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
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = useMemo(() => notify, [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2.5 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:items-end sm:px-0"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const toneConfig = TONES[toast.tone] ?? TONES.success;
            const Icon = toneConfig.icon;

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="glass pointer-events-auto relative flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-xl px-4 py-3 shadow-elev-3"
              >
                <Icon className={cn('h-4 w-4 shrink-0 stroke-[1.5]', toneConfig.iconColor)} aria-hidden="true" />
                <p className="flex-1 text-sm font-medium text-text leading-snug">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Dismiss notification"
                  className="rounded-full p-1 text-text-3 hover:text-text hover:bg-surface transition-colors duration-fast"
                >
                  <X className="h-3.5 w-3.5 stroke-[1.5]" aria-hidden="true" />
                </button>

                {/* Hairline progress line */}
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 4, ease: 'linear' }}
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent/40 origin-left"
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider');
  return context;
}
