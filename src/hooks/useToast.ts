import { useContext } from 'react';
import { ToastContext } from '@/contexts/ToastContext';
import type { ToastContextType } from '@/types/toast';

/**
 * Hook para usar o contexto de toast
 * 
 * Exemplo de uso:
 * ```tsx
 * const { toast, success, error, warning, info, removeToast } = useToast();
 * 
 * // Adicionar toast com tipo
 * success('Operação realizada com sucesso!');
 * error('Ocorreu um erro!');
 * warning('Atenção!');
 * info('Informação importante');
 * 
 * // Ou usar addToast para controle total
 * const id = addToast({
 *   type: 'success',
 *   message: 'Sucesso!',
 *   duration: 3000,
 *   action: { label: 'Desfazer', onClick: () => {} }
 * });
 * 
 * // Remover manualmente
 * removeToast(id);
 * ```
 */
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      'useToast must be used within a ToastProvider. ' +
      'Make sure ToastProvider is wrapping your component tree.'
    );
  }

  return context;
}
