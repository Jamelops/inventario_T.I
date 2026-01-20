import { useState, useCallback } from 'react';

interface UseMoneyFormatReturn {
  value: string;
  setValue: (value: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getRawValue: () => number;
}

/**
 * Hook para formatar valores monetários em tempo real
 * @param initialValue - Valor inicial (opcional)
 * @returns { value, setValue, handleChange, getRawValue }
 *
 * @example
 * const { value, handleChange, getRawValue } = useMoneyFormat();
 *
 * // No input
 * <input value={value} onChange={handleChange} />
 *
 * // Para enviar ao servidor
 * const valor = getRawValue(); // Ex: 10000.00
 */
export const useMoneyFormat = (initialValue = ''): UseMoneyFormatReturn => {
  const [value, setValue] = useState(initialValue);

  /**
   * Formata uma string de números como moeda brasileira
   * @param numStr - String com números
   * @returns String formatada como "R$ 1.234,56"
   */
  const formatMoney = useCallback((numStr: string): string => {
    // Remove tudo que não é número
    let cleanValue = numStr.replace(/\D/g, '');

    // Se vazio, retorna vazio
    if (!cleanValue) return '';

    // Converte para número e divide por 100 (para casas decimais)
    const numberValue = parseInt(cleanValue, 10);

    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numberValue / 100);
  }, []);

  /**
   * Handle para mudança de valor no input
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const formatted = formatMoney(inputValue);
      setValue(formatted);
    },
    [formatMoney]
  );

  /**
   * Retorna o valor sem formatação (para enviar ao servidor)
   * @returns number - Valor em números puros (ex: 10000.00)
   */
  const getRawValue = useCallback((): number => {
    if (!value) return 0;
    return parseFloat(value.replace(/\D/g, '')) / 100;
  }, [value]);

  return {
    value,
    setValue,
    handleChange,
    getRawValue,
  };
};
