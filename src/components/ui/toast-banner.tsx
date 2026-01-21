import React, { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Toast } from '@/types/toast';
import { cn } from '@/lib/utils';

interface ToastBannerProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950 border-b border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    textColor: 'text-emerald-900 dark:text-emerald-100',
    progressBg: 'bg-emerald-500',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-800',
    icon: AlertCircle,
    iconColor: 'text-red-600 dark:text-red-400',
    textColor: 'text-red-900 dark:text-red-100',
    progressBg: 'bg-red-500',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800',
    icon: AlertTriangle,
    iconColor: 'text-amber-600 dark:text-amber-400',
    textColor: 'text-amber-900 dark:text-amber-100',
    progressBg: 'bg-amber-500',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800',
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-900 dark:text-blue-100',
    progressBg: 'bg-blue-500',
  },
} as const;

// Default config for unknown types
const DEFAULT_CONFIG = toastConfig.info;

export function ToastBanner({ toast, onClose }: ToastBannerProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  // ✅ Safe config retrieval with fallback
  const config = toastConfig[toast.type as keyof typeof toastConfig] ?? DEFAULT_CONFIG;
  const IconComponent = config.icon;
  const duration = toast.duration || 4000;

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  }, [onClose, toast.id]);

  // Auto-close com barra de progresso
  useEffect(() => {
    if (duration <= 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - 100 / (duration / 50);
        return newProgress > 0 ? newProgress : 0;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  useEffect(() => {
    if (progress <= 0) {
      handleClose();
    }
  }, [progress, handleClose]);

  return (
    <div
      className={cn(
        'w-full animate-in slide-in-from-top fade-in-0 duration-300',
        isExiting && 'animate-out slide-out-to-top fade-out-0 duration-300'
      )}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      style={{ zIndex: 9999 }}
    >
      <div className={cn('w-full', config.bg)}>
        <div className="flex items-center gap-3 px-4 py-3 container mx-auto max-w-full">
          <IconComponent className={cn('h-5 w-5 flex-shrink-0', config.iconColor)} />
          <div className="flex-1 min-w-0 overflow-visible">
            <p className={cn('text-sm font-medium break-words', config.textColor)}>
              {toast.message || '(mensagem vazia)'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={cn(
              'flex-shrink-0 inline-flex rounded-md p-1 transition-colors',
              'hover:bg-black/10 dark:hover:bg-white/10',
              'focus-visible:outline-none focus-visible:ring-2',
              config.iconColor
            )}
            aria-label="Fechar notificação"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar na base */}
        {duration > 0 && (
          <div className="h-1 w-full bg-black/5 dark:bg-white/5">
            <div
              className={cn('h-full transition-all', config.progressBg)}
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
