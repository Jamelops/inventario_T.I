import React from 'react';
import { Tooltip } from '@/components/ui/tooltip';

interface RequiredFieldIndicatorProps {
  /** Se o campo é obrigatório */
  required?: boolean;
  /** Mensagem customizada de tooltip */
  tooltipMessage?: string;
  /** Classes customizadas */
  className?: string;
}

/**
 * Componente para indicar visualmente se um campo é obrigatório
 * Exibe um asterisco vermelho com tooltip informativo
 */
export function RequiredFieldIndicator({
  required = false,
  tooltipMessage = 'Este campo é obrigatório',
  className = '',
}: RequiredFieldIndicatorProps) {
  if (!required) return null;

  return (
    <Tooltip>
      <span
        className={`inline-flex items-center text-red-500 font-bold ml-1 ${className}`}
        title={tooltipMessage}
      >
        *
      </span>
    </Tooltip>
  );
}

/**
 * Variante para ser usada inline com texto
 */
export function RequiredBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block bg-red-50 text-red-700 text-xs px-2 py-1 rounded-md ml-2 font-medium ${className}`}
    >
      Obrigatório
    </span>
  );
}

/**
 * Dica de ajuda para campos obrigatórios
 */
export function RequiredFieldsHint() {
  return (
    <div className="text-sm text-muted-foreground mb-4 flex items-start gap-2">
      <span className="text-red-500 font-bold mt-0.5">*</span>
      <span>Campos marcados com asterisco são obrigatórios</span>
    </div>
  );
}
