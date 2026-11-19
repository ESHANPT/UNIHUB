import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        setRequest({ ...options, resolve });
      }),
    []
  );

  const finish = useCallback((value) => {
    setRequest((current) => {
      current?.resolve(value);
      return null;
    });
  }, []);

  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal
        open={Boolean(request)}
        onClose={() => finish(false)}
        title={request?.title ?? 'Confirm action'}
        size="sm"
      >
        <div className="flex gap-3.5 items-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-inset shadow-inset-1 border border-hairline text-danger">
            <AlertCircle className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
          </div>
          <p className="pt-1 text-xs text-text-2 leading-relaxed">
            {request?.description ?? 'This action cannot be undone.'}
          </p>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => finish(false)}>
            {request?.cancelLabel ?? 'Cancel'}
          </Button>
          <Button variant={request?.tone === 'danger' ? 'danger' : 'primary'} onClick={() => finish(true)}>
            {request?.confirmLabel ?? 'Confirm'}
          </Button>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used inside a ConfirmProvider');
  return context;
}
