import React, { ReactNode } from 'react';
import { TicketContext, TicketContextType } from './TicketContext';
import { useTickets } from '@/hooks/useTickets';
import { useTicketSuppliers } from '@/hooks/useTicketSuppliers';

export function TicketProvider({ children }: { children: ReactNode }) {
  const {
    tickets,
    loading: ticketsLoading,
    addTicket,
    updateTicket,
    deleteTicket,
    getTicketById,
    changeTicketStatus,
    addInteraction,
    duplicateTicket,
  } = useTickets();

  const {
    suppliers,
    loading: suppliersLoading,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
  } = useTicketSuppliers();

  const value: TicketContextType = {
    tickets,
    ticketsLoading,
    suppliers,
    suppliersLoading,
    addTicket,
    updateTicket,
    deleteTicket,
    getTicketById,
    changeTicketStatus,
    addInteraction,
    duplicateTicket,
    getSupplierById,
    addSupplier,
    updateSupplier,
    deleteSupplier,
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
}
