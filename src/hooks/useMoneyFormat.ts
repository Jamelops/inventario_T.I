export function useMoneyFormat() {
  const formatMoney = (value: number | undefined): string => {
    if (value === undefined || value === null) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const parseMoney = (value: string): number => {
    if (!value) return 0;
    
    // Remove currency symbol and spaces
    let cleaned = value.replace(/[^\d,.-]/g, '');
    
    // Replace comma with dot for parsing
    cleaned = cleaned.replace(',', '.');
    
    return parseFloat(cleaned) || 0;
  };

  return {
    formatMoney,
    parseMoney,
  };
}
