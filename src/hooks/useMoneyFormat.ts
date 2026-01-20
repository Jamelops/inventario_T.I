import { useState, useCallback } from 'react';

export function useMoneyFormat(initialValue: number = 0) {
  const [rawValue, setRawValue] = useState(initialValue);

  const formatMoney = useCallback((value: number | undefined): string => {
    if (value === undefined || value === null || value === 0) return 'R$ 0,00';
    
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
    
    // Only allow digits and comma (decimal separator in pt-BR)
    const filtered = inputValue.replace(/[^\d,]/g, '');
    
    if (filtered === '') {
      setRawValue(0);
      return;
    }
    
    // Parse the input - treat as centavos (divide by 100)
    // User input "100" = 1 real (100 centavos)
    // User input "10000" = 100 reais (10000 centavos)
    const numericValue = filtered.replace(/[^\d]/g, '');
    const centavos = parseInt(numericValue, 10) || 0;
    const reais = centavos / 100;
    
    setRawValue(reais);
  }, []);

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
