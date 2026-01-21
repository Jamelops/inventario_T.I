import { useToast } from '@/hooks/useToast';
import { ToastBanner } from './toast-banner';

export function ToastBannerContainer() {
  const { toasts, removeToast } = useToast();

  // Mostrar apenas o primeiro toast como banner
  const activeBanner = toasts.length > 0 ? toasts[0] : null;

  if (!activeBanner) return null;

  return (
    <div role="region" aria-label="Notificações" aria-live="polite" style={{ zIndex: 9999 }}>
      <ToastBanner key={activeBanner.id} toast={activeBanner} onClose={removeToast} />
    </div>
  );
}
