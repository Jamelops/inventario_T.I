import React, { useEffect } from 'react';
import { useToast, Toast as ToastType } from '@/contexts/ToastContext';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  X,
  Download,
} from 'lucide-react';

interface ToastProps {
  toast: ToastType;
}

function ToastItem({ toast }: ToastProps) {
  const { removeToast } = useToast();

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast, removeToast]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
        );
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
      case 'warning':
        return (
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
        );
      case 'info':
        return <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'text-blue-800 dark:text-blue-200';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div
      className={`
        animate-in fade-in slide-in-from-right-5 
        ${getBgColor()} 
        border rounded-lg p-4 
        flex items-start gap-3 
        max-w-md
        shadow-lg hover:shadow-xl
        transition-all duration-200
      `}
      role="alert"
      aria-live="polite"
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${getTextColor()} break-words`}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className={`
          flex-shrink-0 ml-2
          ${getTextColor()}
          hover:opacity-70 transition-opacity
          p-1
        `}
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div
      className="
        fixed bottom-4 right-4 z-50 
        flex flex-col gap-3 
        pointer-events-none
        sm:bottom-6 sm:right-6
      "
      aria-label="Notificações"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}

export default Toast;
