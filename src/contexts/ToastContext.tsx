/* eslint-disable react-refresh/only-export-components -- context/provider exports required */
import React, { createContext, useState, useCallback } from 'react';
import { Toast, ToastContextType, ToastType } from '@/types/toast';

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>): string => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? 4000,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove toast after duration
      if (newToast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, newToast.duration);
      }

      return id;
    },
    [removeToast]
  );

  const createToastWithType = useCallback(
    (type: ToastType, message: string, duration?: number): string => {
      return addToast({ type, message, duration });
    },
    [addToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => createToastWithType('success', message, duration),
    [createToastWithType]
  );

  const error = useCallback(
    (message: string, duration?: number) => createToastWithType('error', message, duration),
    [createToastWithType]
  );

  const warning = useCallback(
    (message: string, duration?: number) => createToastWithType('warning', message, duration),
    [createToastWithType]
  );

  const info = useCallback(
    (message: string, duration?: number) => createToastWithType('info', message, duration),
    [createToastWithType]
  );

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
