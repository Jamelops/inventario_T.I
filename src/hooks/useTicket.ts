import { useContext } from 'react';
import { TicketContext, TicketContextType } from '@/contexts/TicketContext';

export function useTicket(): TicketContextType {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTicket must be used within a TicketProvider');
  }
  return context;
}
