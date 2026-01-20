import { useState, useCallback } from 'react';

export function useMoneyFormat(initialValue: number = 0) {
  const [rawValue, setRawValue] = useState(initialValue);

  const formatMoney = useCallback((value: number | undefined): string => {
    if (value === undefined || value === null) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }, []);

  const parseMoney = useCallback((value: string): number => {
    if (!value) return 0;
    
    // Remove currency symbol and spaces
    let cleaned = value.replace(/[^\d,.-]/g, '');
    
    // Replace comma with dot for parsing
    cleaned = cleaned.replace(',', '.');
    
    return parseFloat(cleaned) || 0;
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Only allow numbers and decimal separators
    const onlyNumbers = inputValue.replace(/[^\d,]/g, '');
    
    // Parse to number
    const parsed = parseMoney(onlyNumbers);
    setRawValue(parsed);
  }, [parseMoney]);

  const getRawValue = useCallback((): number => {
    return rawValue;
  }, [rawValue]);

  return {
    value: formatMoney(rawValue),
    handleChange,
    getRawValue,
    formatMoney,
    parseMoney,
    setRawValue,
  };
}
