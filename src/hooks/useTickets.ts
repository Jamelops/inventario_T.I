import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Ticket, TicketInteraction, TicketStatus } from '@/types/tickets';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type DbTicket = Tables<'tickets'>;
type DbTicketInsert = TablesInsert<'tickets'>;
type DbTicketUpdate = TablesUpdate<'tickets'>;

const dbToTicket = (dbTicket: DbTicket): Ticket => ({
  id: dbTicket.id,
  titulo: dbTicket.titulo,
  descricao: dbTicket.descricao,
  fornecedorId: dbTicket.fornecedor_id,
  tipo: dbTicket.tipo as any,
  prioridade: dbTicket.prioridade as any,
  status: dbTicket.status as any,
  unidade: dbTicket.unidade,
  assetId: dbTicket.asset_id || undefined,
  assetNome: dbTicket.asset_nome || undefined,
  protocoloExterno: dbTicket.protocolo_externo || undefined,
  contatoFornecedor: dbTicket.contato_fornecedor || undefined,
  responsavelId: dbTicket.responsavel_id || '',
  responsavelNome: dbTicket.responsavel_nome || 'Usuário',
  slaDeadline: dbTicket.sla_deadline,
  dataCriacao: dbTicket.data_criacao,
  dataAtualizacao: dbTicket.updated_at,
  dataResolucao: dbTicket.data_resolucao || undefined,
  interactions: (dbTicket.interactions as TicketInteraction[]) || [],
});

const ticketToDbInsert = (
  ticket: Omit<Ticket, 'id' | 'dataAtualizacao' | 'interactions'>,
  userId: string
): DbTicketInsert => ({
  titulo: ticket.titulo,
  descricao: ticket.descricao,
  fornecedor_id: ticket.fornecedorId,
  tipo: ticket.tipo,
  prioridade: ticket.prioridade,
  status: ticket.status,
  unidade: ticket.unidade,
  asset_id: ticket.assetId || null,
  asset_nome: ticket.assetNome || null,
  protocolo_externo: ticket.protocoloExterno || null,
  contato_fornecedor: ticket.contatoFornecedor || null,
  responsavel_id: ticket.responsavelId,
  responsavel_nome: ticket.responsavelNome,
  sla_deadline: ticket.slaDeadline,
  data_criacao: ticket.dataCriacao,
  data_resolucao: ticket.dataResolucao || null,
  created_by: userId,
});

const ticketToDbUpdate = (updates: Partial<Ticket>): DbTicketUpdate => {
  const dbUpdate: DbTicketUpdate = {};

  if (updates.titulo !== undefined) dbUpdate.titulo = updates.titulo;
  if (updates.descricao !== undefined) dbUpdate.descricao = updates.descricao;
  if (updates.fornecedorId !== undefined) dbUpdate.fornecedor_id = updates.fornecedorId;
  if (updates.tipo !== undefined) dbUpdate.tipo = updates.tipo;
  if (updates.prioridade !== undefined) dbUpdate.prioridade = updates.prioridade;
  if (updates.status !== undefined) dbUpdate.status = updates.status;
  if (updates.unidade !== undefined) dbUpdate.unidade = updates.unidade;
  if (updates.assetId !== undefined) dbUpdate.asset_id = updates.assetId || null;
  if (updates.assetNome !== undefined) dbUpdate.asset_nome = updates.assetNome || null;
  if (updates.protocoloExterno !== undefined)
    dbUpdate.protocolo_externo = updates.protocoloExterno || null;
  if (updates.contatoFornecedor !== undefined)
    dbUpdate.contato_fornecedor = updates.contatoFornecedor || null;
  if (updates.responsavelId !== undefined) dbUpdate.responsavel_id = updates.responsavelId;
  if (updates.responsavelNome !== undefined) dbUpdate.responsavel_nome = updates.responsavelNome;
  if (updates.slaDeadline !== undefined) dbUpdate.sla_deadline = updates.slaDeadline;
  if (updates.dataCriacao !== undefined) dbUpdate.data_criacao = updates.dataCriacao;
  if (updates.dataResolucao !== undefined) dbUpdate.data_resolucao = updates.dataResolucao || null;

  return dbUpdate;
};

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isApproved } = useAuth();

  const fetchTickets = useCallback(async () => {
    if (!user || !isApproved) {
      setTickets([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets((data || []).map(dbToTicket));
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast.error('Erro ao carregar chamados');
    } finally {
      setLoading(false);
    }
  }, [user, isApproved]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const addTicket = async (
    ticket: Omit<Ticket, 'id' | 'dataAtualizacao' | 'interactions'>,
    supplierSlaHours?: number
  ): Promise<Ticket | null> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert(ticketToDbInsert(ticket, user.id))
        .select()
        .single();

      if (error) throw error;

      const newTicket = dbToTicket(data);
      setTickets((prev) => [newTicket, ...prev]);
      toast.success('Chamado criado com sucesso');
      return newTicket;
    } catch (error: any) {
      console.error('Error adding ticket:', error);
      toast.error('Erro ao criar chamado: ' + error.message);
      return null;
    }
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update(ticketToDbUpdate(updates))
        .eq('id', id);

      if (error) throw error;

      setTickets((prev) =>
        prev.map((ticket) => (ticket.id === id ? { ...ticket, ...updates } : ticket))
      );
      toast.success('Chamado atualizado com sucesso');
      return true;
    } catch (error: any) {
      console.error('Error updating ticket:', error);
      toast.error('Erro ao atualizar chamado: ' + error.message);
      return false;
    }
  };

  const deleteTicket = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('tickets').delete().eq('id', id);

      if (error) throw error;

      setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
      toast.success('Chamado excluído com sucesso');
      return true;
    } catch (error: any) {
      console.error('Error deleting ticket:', error);
      toast.error('Erro ao excluir chamado: ' + error.message);
      return false;
    }
  };

  const getTicketById = (id: string): Ticket | undefined => {
    return tickets.find((ticket) => ticket.id === id);
  };

  const changeTicketStatus = async (
    id: string,
    newStatus: TicketStatus,
    userId: string,
    userName: string
  ): Promise<boolean> => {
    const ticket = getTicketById(id);
    if (!ticket) return false;

    try {
      const updates: Partial<Ticket> = { status: newStatus };
      if (newStatus === 'resolvido') {
        updates.dataResolucao = new Date().toISOString();
      }

      return await updateTicket(id, updates);
    } catch (error: any) {
      console.error('Error changing ticket status:', error);
      return false;
    }
  };

  const addInteraction = async (
    ticketId: string,
    interaction: Omit<TicketInteraction, 'id' | 'ticketId' | 'createdAt'>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.from('ticket_interactions').insert({
        ticket_id: ticketId,
        user_id: interaction.userId,
        user_name: interaction.userName,
        message: interaction.message,
        type: interaction.type,
      });

      if (error) throw error;
      await fetchTickets();
      return true;
    } catch (error: any) {
      console.error('Error adding interaction:', error);
      return false;
    }
  };

  const duplicateTicket = async (
    id: string,
    userId: string,
    userName: string,
    supplierSlaHours?: number
  ): Promise<Ticket | null> => {
    const ticket = getTicketById(id);
    if (!ticket) return null;

    const { id: _, ...ticketData } = ticket;
    const duplicated = await addTicket(
      {
        ...ticketData,
        titulo: `${ticketData.titulo} (Cópia)`,
        status: 'aberto',
        dataCriacao: new Date().toISOString(),
      },
      supplierSlaHours
    );

    return duplicated;
  };

  const getTicketsByAssetId = (assetId: string): Ticket[] => {
    return tickets.filter((ticket) => ticket.assetId === assetId);
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
