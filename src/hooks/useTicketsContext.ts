import { useContext } from 'react';
import { TicketContext, TicketContextType } from '@/contexts/TicketContext';

export function useTickets(): TicketContextType {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
}
