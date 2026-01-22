import React, { createContext, ReactNode } from 'react';
import { Ticket, TicketInteraction, TicketStatus } from '@/types/tickets';
import { useTickets as useTicketsHook } from '@/hooks/useTickets';
import { useTicketSuppliers, TicketSupplier } from '@/hooks/useTicketSuppliers';

export interface TicketContextType {
  tickets: Ticket[];
  ticketsLoading: boolean;
  suppliers: TicketSupplier[];
  suppliersLoading: boolean;
  addTicket: (ticket: Omit<Ticket, 'id' | 'dataAtualizacao' | 'interactions'>, supplierSlaHours?: number) => Promise<Ticket | null>;
  updateTicket: (id: string, ticket: Partial<Ticket>) => Promise<boolean>;
  deleteTicket: (id: string) => Promise<boolean>;
  getTicketById: (id: string) => Ticket | undefined;
  changeTicketStatus: (id: string, newStatus: TicketStatus, userId: string, userName: string) => Promise<boolean>;
  addInteraction: (ticketId: string, interaction: Omit<TicketInteraction, 'id' | 'ticketId' | 'createdAt'>) => Promise<boolean>;
  duplicateTicket: (id: string, userId: string, userName: string) => Promise<Ticket | null>;
  getSupplierById: (id: string) => TicketSupplier | undefined;
  addSupplier: (supplier: Omit<TicketSupplier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<TicketSupplier | null>;
  updateSupplier: (id: string, supplier: Partial<TicketSupplier>) => Promise<boolean>;
  deleteSupplier: (id: string) => Promise<boolean>;
}

export const TicketContext = createContext<TicketContextType | undefined>(undefined);

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
  } = useTicketsHook();

  const {
    suppliers,
    loading: suppliersLoading,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
  } = useTicketSuppliers();

  return (
    <TicketContext.Provider value={{
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
    }}>
      {children}
    </TicketContext.Provider>
  );
}