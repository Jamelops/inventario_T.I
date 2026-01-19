import { useContext } from 'react';
import { ToastContext } from '@/contexts/ToastContext';
import { ToastContextType } from '@/types/toast';

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error(
      'useToast must be used within a ToastProvider. Make sure ToastProvider is wrapping your component tree.'
    );
  }

  return context;
}
