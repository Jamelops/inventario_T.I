import { useToast } from '@/hooks/useToast';
import { ToastItem } from './toast-item';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col pointer-events-none"
      role="region"
      aria-label="Notificações"
      aria-live="polite"
    >
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  );
}
