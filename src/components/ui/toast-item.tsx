import React, { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Toast } from '@/types/toast';
import { cn } from '@/lib/utils';

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    textColor: 'text-emerald-900 dark:text-emerald-100',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    icon: AlertCircle,
    iconColor: 'text-red-600 dark:text-red-400',
    textColor: 'text-red-900 dark:text-red-100',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
    icon: AlertTriangle,
    iconColor: 'text-amber-600 dark:text-amber-400',
    textColor: 'text-amber-900 dark:text-amber-100',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-900 dark:text-blue-100',
  },
} as const;

// Default config for unknown types (defensive programming)
const DEFAULT_CONFIG = toastConfig.info;

export function ToastItem({ toast, onClose }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  // ✅ Safe config retrieval with fallback
  const config = toastConfig[toast.type as keyof typeof toastConfig] ?? DEFAULT_CONFIG;
  const IconComponent = config.icon;
  const duration = toast.duration || 4000;

  // DEBUG: Log renderização
  useEffect(() => {
    console.log('%c[ToastItem] Renderizado', 'color: #2563eb; font-weight: bold;', {
      id: toast.id,
      type: toast.type,
      message: toast.message,
      messageLength: toast.message?.length || 0,
      messageIsEmpty: !toast.message || toast.message.trim().length === 0,
      duration,
      config: Object.keys(config),
    });
  }, [toast, config, duration]);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  }, [onClose, toast.id]);

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
        'animate-in slide-in-from-top-2 fade-in-0 duration-300 mb-3 z-50 relative',
        isExiting && 'animate-out slide-out-to-top-2 fade-out-0 duration-300'
      )}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      style={{ zIndex: 9999 }}
    >
      <div
        className={cn('w-96 max-w-md rounded-lg border p-4 shadow-lg', config.bg, config.border)}
      >
        <div className="flex items-start gap-3">
          <IconComponent className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'text-sm font-medium break-words whitespace-pre-wrap',
                config.textColor
              )}
              data-testid="toast-message"
              data-message={toast.message}
            >
              {toast.message || '(mensagem vazia)'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={cn(
              'flex-shrink-0 inline-flex rounded-md p-1.5 transition-colors',
              'hover:bg-black/10 dark:hover:bg-white/10',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              config.iconColor
            )}
            aria-label="Fechar notificação"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
