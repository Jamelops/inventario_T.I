import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables, TablesInsert, TablesUpdate, Json } from '@/integrations/supabase/types';
import {
  Ticket,
  TicketInteraction,
  TicketStatus,
  TicketType,
  TicketPriority,
  SupplierContact,
} from '@/types/tickets';

type DbTicket = Tables<'tickets'>;
type DbTicketInsert = TablesInsert<'tickets'>;
type DbTicketUpdate = TablesUpdate<'tickets'>;
type DbTicketInteraction = Tables<'ticket_interactions'>;
type DbTicketInteractionInsert = TablesInsert<'ticket_interactions'>;

const dbToTicket = (db: DbTicket, interactions: TicketInteraction[] = []): Ticket => ({
  id: db.id,
  titulo: db.titulo,
  descricao: db.descricao,
  fornecedorId: db.fornecedor_id || '',
  tipo: db.tipo as TicketType,
  status: db.status as TicketStatus,
  prioridade: db.prioridade as TicketPriority,
  unidade: db.unidade,
  assetId: db.asset_id || undefined,
  assetNome: db.asset_nome || undefined,
  protocoloExterno: db.protocolo_externo || undefined,
  contatoFornecedor: db.contato_fornecedor as SupplierContact | undefined,
  responsavelId: db.responsavel_id || '',
  responsavelNome: db.responsavel_nome,
  slaDeadline: db.sla_deadline,
  dataCriacao: db.created_at,
  dataAtualizacao: db.updated_at,
  dataResolucao: db.data_resolucao || undefined,
  interactions,
});

const dbToInteraction = (db: DbTicketInteraction): TicketInteraction => ({
  id: db.id,
  ticketId: db.ticket_id,
  userId: db.user_id || '',
  userName: db.user_name,
  message: db.message,
  type: db.type as TicketInteraction['type'],
  createdAt: db.created_at,
});

const calculateSLADeadline = (createdAt: Date, slaHours: number): string => {
  const deadline = new Date(createdAt);
  deadline.setHours(deadline.getHours() + slaHours);
  return deadline.toISOString();
};

export function useTickets(slaHours: number = 72) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      // Fetch interactions for all tickets
      const ticketIds = (ticketsData || []).map((t) => t.id);
      let interactionsMap: Record<string, TicketInteraction[]> = {};

      if (ticketIds.length > 0) {
        const { data: interactionsData, error: interactionsError } = await supabase
          .from('ticket_interactions')
          .select('*')
          .in('ticket_id', ticketIds)
          .order('created_at', { ascending: true });

        if (interactionsError) throw interactionsError;

        interactionsMap = (interactionsData || []).reduce((acc, int) => {
          const interaction = dbToInteraction(int);
          if (!acc[interaction.ticketId]) {
            acc[interaction.ticketId] = [];
          }
          acc[interaction.ticketId].push(interaction);
          return acc;
        }, {} as Record<string, TicketInteraction[]>);
      }

      setTickets(
        (ticketsData || []).map((t) => dbToTicket(t, interactionsMap[t.id] || []))
      );
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to fetch tickets:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user, fetchTickets]);

  const addTicket = async (
    ticketData: Omit<Ticket, 'id' | 'dataCriacao' | 'dataAtualizacao' | 'interactions' | 'slaDeadline'>,
    supplierSlaHours?: number
  ): Promise<Ticket | null> => {
    if (!user) return null;

    try {
      const now = new Date();
      const sla = supplierSlaHours || slaHours;

      const dbInsert: DbTicketInsert = {
        titulo: ticketData.titulo,
        descricao: ticketData.descricao,
        fornecedor_id: ticketData.fornecedorId || null,
        tipo: ticketData.tipo,
        status: ticketData.status || 'aberto',
        prioridade: ticketData.prioridade || 'media',
        unidade: ticketData.unidade,
        asset_id: ticketData.assetId || null,
        asset_nome: ticketData.assetNome || null,
        protocolo_externo: ticketData.protocoloExterno || null,
        contato_fornecedor: (ticketData.contatoFornecedor || {}) as Json,
        responsavel_id: ticketData.responsavelId || user.id,
        responsavel_nome: ticketData.responsavelNome,
        sla_deadline: calculateSLADeadline(now, sla),
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from('tickets')
        .insert(dbInsert)
        .select()
        .single();

      if (error) throw error;

      const newTicket = dbToTicket(data, []);
      setTickets((prev) => [newTicket, ...prev]);
      return newTicket;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to add ticket:', error);
      }
      return null;
    }
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>): Promise<boolean> => {
    try {
      const dbUpdates: DbTicketUpdate = {};
      if (updates.titulo !== undefined) dbUpdates.titulo = updates.titulo;
      if (updates.descricao !== undefined) dbUpdates.descricao = updates.descricao;
      if (updates.fornecedorId !== undefined) dbUpdates.fornecedor_id = updates.fornecedorId || null;
      if (updates.tipo !== undefined) dbUpdates.tipo = updates.tipo;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.prioridade !== undefined) dbUpdates.prioridade = updates.prioridade;
      if (updates.unidade !== undefined) dbUpdates.unidade = updates.unidade;
      if (updates.assetId !== undefined) dbUpdates.asset_id = updates.assetId || null;
      if (updates.assetNome !== undefined) dbUpdates.asset_nome = updates.assetNome || null;
      if (updates.protocoloExterno !== undefined) dbUpdates.protocolo_externo = updates.protocoloExterno || null;
      if (updates.contatoFornecedor !== undefined) dbUpdates.contato_fornecedor = (updates.contatoFornecedor || {}) as Json;
      if (updates.responsavelId !== undefined) dbUpdates.responsavel_id = updates.responsavelId || null;
      if (updates.responsavelNome !== undefined) dbUpdates.responsavel_nome = updates.responsavelNome;
      if (updates.dataResolucao !== undefined) dbUpdates.data_resolucao = updates.dataResolucao || null;

      const { error } = await supabase.from('tickets').update(dbUpdates).eq('id', id);

      if (error) throw error;

      setTickets((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, ...updates, dataAtualizacao: new Date().toISOString() } : t
        )
      );
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to update ticket:', error);
      }
      return false;
    }
  };

  const deleteTicket = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('tickets').delete().eq('id', id);

      if (error) throw error;

      setTickets((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to delete ticket:', error);
      }
      return false;
    }
  };

  const getTicketById = (id: string): Ticket | undefined => {
    return tickets.find((t) => t.id === id);
  };

  const changeTicketStatus = async (
    id: string,
    newStatus: TicketStatus,
    userId: string,
    userName: string
  ): Promise<boolean> => {
    try {
      const now = new Date().toISOString();
      const isResolved = newStatus === 'resolvido' || newStatus === 'encerrado';

      // Update ticket status
      const { error: ticketError } = await supabase
        .from('tickets')
        .update({
          status: newStatus,
          data_resolucao: isResolved ? now : null,
        })
        .eq('id', id);

      if (ticketError) throw ticketError;

      // Add status change interaction
      const interactionInsert: DbTicketInteractionInsert = {
        ticket_id: id,
        user_id: userId,
        user_name: userName,
        message: `Status alterado para "${newStatus}"`,
        type: 'mudanca_status',
      };

      const { data: interactionData, error: interactionError } = await supabase
        .from('ticket_interactions')
        .insert(interactionInsert)
        .select()
        .single();

      if (interactionError) throw interactionError;

      const newInteraction = dbToInteraction(interactionData);

      setTickets((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          return {
            ...t,
            status: newStatus,
            dataAtualizacao: now,
            dataResolucao: isResolved ? now : t.dataResolucao,
            interactions: [...t.interactions, newInteraction],
          };
        })
      );
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to change ticket status:', error);
      }
      return false;
    }
  };

  const addInteraction = async (
    ticketId: string,
    interaction: Omit<TicketInteraction, 'id' | 'ticketId' | 'createdAt'>
  ): Promise<boolean> => {
    try {
      const interactionInsert: DbTicketInteractionInsert = {
        ticket_id: ticketId,
        user_id: interaction.userId,
        user_name: interaction.userName,
        message: interaction.message,
        type: interaction.type,
      };

      const { data, error } = await supabase
        .from('ticket_interactions')
        .insert(interactionInsert)
        .select()
        .single();

      if (error) throw error;

      const newInteraction = dbToInteraction(data);

      setTickets((prev) =>
        prev.map((t) => {
          if (t.id !== ticketId) return t;
          return {
            ...t,
            interactions: [...t.interactions, newInteraction],
            dataAtualizacao: new Date().toISOString(),
          };
        })
      );
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to add interaction:', error);
      }
      return false;
    }
  };

  const duplicateTicket = async (
    id: string,
    userId: string,
    userName: string,
    supplierSlaHours?: number
  ): Promise<Ticket | null> => {
    const original = getTicketById(id);
    if (!original) return null;

    return addTicket(
      {
        titulo: `[Cópia] ${original.titulo}`,
        descricao: original.descricao,
        fornecedorId: original.fornecedorId,
        tipo: original.tipo,
        status: 'aberto',
        prioridade: original.prioridade,
        unidade: original.unidade,
        assetId: original.assetId,
        assetNome: original.assetNome,
        protocoloExterno: undefined,
        contatoFornecedor: original.contatoFornecedor,
        responsavelId: userId,
        responsavelNome: userName,
      },
      supplierSlaHours
    );
  };

  const getTicketsByAssetId = (assetId: string): Ticket[] => {
    return tickets.filter((t) => t.assetId === assetId);
  };

  return {
    tickets,
    loading,
    addTicket,
    updateTicket,
    deleteTicket,
    getTicketById,
    changeTicketStatus,
    addInteraction,
    duplicateTicket,
    getTicketsByAssetId,
    refetch: fetchTickets,
  };
}
