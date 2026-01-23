import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Ticket, TicketInteraction, TicketStatus } from '@/types/tickets';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type DbTicket = Tables<'tickets'>;
type DbTicketInsert = TablesInsert<'tickets'>;
type DbTicketUpdate = TablesUpdate<'tickets'>;

interface TicketWithSupplier extends DbTicket {
  fornecedorId?: string;
  tipo?: string;
  unidade?: string;
  assetId?: string;
  assetNome?: string;
  protocoloExterno?: string;
  contatoFornecedor?: {
    nome?: string;
    telefone?: string;
    email?: string;
  };
  responsavelId?: string;
  responsavelNome?: string;
  slaDeadline?: string;
  dataResolucao?: string;
  interactions: TicketInteraction[];
}

type TicketMetadata = Partial<
  Pick<
    Ticket,
    | 'fornecedorId'
    | 'tipo'
    | 'unidade'
    | 'assetId'
    | 'assetNome'
    | 'protocoloExterno'
    | 'contatoFornecedor'
    | 'slaDeadline'
  >
>;

// Generate humanized ticket ID like TICK-001, TICK-002, etc
const generateHumanizedId = (index: number): string => {
  return `TICK-${String(index).padStart(3, '0')}`;
};

const dbToTicket = (dbTicket: DbTicket, index?: number): Ticket => {
  // Parse JSON data from metadata or use defaults
  let ticketData: TicketMetadata = {};
  
  try {
    // Try to get any stored metadata
    ticketData = typeof dbTicket.solucao === 'string' && dbTicket.solucao.startsWith('{')
      ? JSON.parse(dbTicket.solucao)
      : {};
  } catch (e) {
    ticketData = {};
  }

  return {
    id: dbTicket.id,
    titulo: dbTicket.titulo,
    descricao: dbTicket.descricao,
    fornecedorId: ticketData.fornecedorId || '',
    tipo: ticketData.tipo || 'outro',
    status: dbTicket.status as Ticket['status'],
    prioridade: dbTicket.prioridade as Ticket['prioridade'],
    unidade: ticketData.unidade || dbTicket.departamento || '',
    assetId: ticketData.assetId,
    assetNome: ticketData.assetNome,
    protocoloExterno: ticketData.protocoloExterno,
    contatoFornecedor: ticketData.contatoFornecedor,
    responsavelId: dbTicket.created_by || '',
    responsavelNome: dbTicket.responsavel || 'Não atribuído',
    slaDeadline: ticketData.slaDeadline || new Date(new Date(dbTicket.data_criacao).getTime() + 24*60*60*1000).toISOString(),
    dataCriacao: dbTicket.data_criacao,
    dataAtualizacao: dbTicket.updated_at,
    dataResolucao: dbTicket.data_conclusao || undefined,
    interactions: [],
  };
};

const ticketToDbInsert = (
  ticket: Omit<Ticket, 'id' | 'dataAtualizacao' | 'interactions'>,
  userId: string
): DbTicketInsert => ({
  titulo: ticket.titulo,
  descricao: ticket.descricao,
  prioridade: ticket.prioridade,
  status: ticket.status,
  responsavel: ticket.responsavelNome || null,
  responsavel_email: undefined,
  departamento: ticket.unidade || null,
  solucao: JSON.stringify({
    fornecedorId: ticket.fornecedorId,
    tipo: ticket.tipo,
    unidade: ticket.unidade,
    assetId: ticket.assetId,
    assetNome: ticket.assetNome,
    protocoloExterno: ticket.protocoloExterno,
    contatoFornecedor: ticket.contatoFornecedor,
    slaDeadline: ticket.slaDeadline,
  }),
  data_criacao: ticket.dataCriacao,
  data_conclusao: ticket.dataResolucao || null,
  tempo_resolucao: null,
  created_by: userId,
});

const ticketToDbUpdate = (updates: Partial<Ticket>): DbTicketUpdate => {
  const dbUpdate: DbTicketUpdate = {};

  if (updates.titulo !== undefined) dbUpdate.titulo = updates.titulo;
  if (updates.descricao !== undefined) dbUpdate.descricao = updates.descricao;
  if (updates.prioridade !== undefined) dbUpdate.prioridade = updates.prioridade;
  if (updates.status !== undefined) dbUpdate.status = updates.status;
  if (updates.responsavelNome !== undefined) dbUpdate.responsavel = updates.responsavelNome || null;
  if (updates.unidade !== undefined) dbUpdate.departamento = updates.unidade || null;
  if (updates.dataResolucao !== undefined) dbUpdate.data_conclusao = updates.dataResolucao || null;

  // Update metadata if any extended field changed
  if (
    updates.fornecedorId !== undefined ||
    updates.tipo !== undefined ||
    updates.assetId !== undefined ||
    updates.protocoloExterno !== undefined
  ) {
    // Note: We would need to fetch current data to merge, but for now we skip solucao updates
  }

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
      setTickets((data || []).map((ticket, index) => dbToTicket(ticket, index)));
    } catch (error: unknown) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar chamados',
        variant: 'destructive',
      });
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
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert(ticketToDbInsert(ticket, user.id))
        .select()
        .single();

      if (error) throw error;

      const newTicket = dbToTicket(data, 0);
      setTickets(prev => [newTicket, ...prev]);
      toast({
        title: 'Sucesso',
        description: 'Chamado criado com sucesso',
      });
      return newTicket;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      console.error('Error adding ticket:', error);
      toast({
        title: 'Erro',
        description: `Erro ao criar chamado: ${message}`,
        variant: 'destructive',
      });
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

      setTickets(prev =>
        prev.map(ticket =>
          ticket.id === id ? { ...ticket, ...updates } : ticket
        )
      );
      toast({
        title: 'Sucesso',
        description: 'Chamado atualizado com sucesso',
      });
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      console.error('Error updating ticket:', error);
      toast({
        title: 'Erro',
        description: `Erro ao atualizar chamado: ${message}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteTicket = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTickets(prev => prev.filter(ticket => ticket.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Chamado excluído com sucesso',
      });
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      console.error('Error deleting ticket:', error);
      toast({
        title: 'Erro',
        description: `Erro ao excluir chamado: ${message}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  const getTicketById = (id: string): Ticket | undefined => {
    return tickets.find(ticket => ticket.id === id);
  };

  const getTicketsByAssetId = (assetId: string): Ticket[] => {
    return tickets.filter(ticket => ticket.assetId === assetId);
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
    } catch (error: unknown) {
      console.error('Error changing ticket status:', error);
      return false;
    }
  };

  const addInteraction = async (
    ticketId: string,
    interaction: Omit<TicketInteraction, 'id' | 'ticketId' | 'createdAt'>
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      console.error('User not authenticated for adding interaction');
      return false;
    }

    try {
      const { error } = await supabase
        .from('ticket_interactions')
        .insert({
          ticket_id: ticketId,
          user_id: user.id || interaction.userId,
          user_name: interaction.userName,
          message: interaction.message,
          type: interaction.type,
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Interação adicionada com sucesso',
      });
      await fetchTickets();
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      console.error('Error adding interaction:', error);
      toast({
        title: 'Erro',
        description: `Erro ao adicionar interação: ${message}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  const duplicateTicket = async (
    id: string,
    userId: string,
    userName: string
  ): Promise<Ticket | null> => {
    const ticket = getTicketById(id);
    if (!ticket) return null;

    const { id: _, ...ticketData } = ticket;
    const duplicated = await addTicket({
      ...ticketData,
      titulo: `${ticketData.titulo} (Cópia)`,
      status: 'aberto',
      dataCriacao: new Date().toISOString(),
    });

    return duplicated;
  };

  return {
    tickets,
    loading,
    addTicket,
    updateTicket,
    deleteTicket,
    getTicketById,
    getTicketsByAssetId,
    changeTicketStatus,
    addInteraction,
    duplicateTicket,
    refetch: fetchTickets,
  };
}
