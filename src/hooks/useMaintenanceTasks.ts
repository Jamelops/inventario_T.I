import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceTask, MaintenanceStatus, MaintenancePriority } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DbMaintenanceTask {
  id: string;
  asset_id: string;
  asset_name: string;
  description: string;
  priority: string;
  status: string;
  responsible: string;
  responsible_email: string | null;
  scheduled_date: string;
  completion_date: string | null;
  notes: string | null;
  observation: string | null;
  maintenance_location: string | null;
  equipment_situation: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  last_reminder_sent: string | null;
}

const mapDbToApp = (dbTask: DbMaintenanceTask): MaintenanceTask => ({
  id: dbTask.id,
  assetId: dbTask.asset_id,
  assetNome: dbTask.asset_name,
  descricao: dbTask.description,
  prioridade: dbTask.priority as MaintenancePriority,
  status: dbTask.status as MaintenanceStatus,
  responsavel: dbTask.responsible,
  responsavelEmail: dbTask.responsible_email || undefined,
  dataAgendada: dbTask.scheduled_date,
  dataConclusao: dbTask.completion_date || undefined,
  notas: dbTask.notes || undefined,
  observacao: dbTask.observation || undefined,
  localManutencao: dbTask.maintenance_location || undefined,
  situacaoEquipamento: dbTask.equipment_situation || undefined,
  dataCriacao: dbTask.created_at,
  dataAtualizacao: dbTask.updated_at,
});

const mapAppToDb = (task: Partial<MaintenanceTask> & { assetId: string; assetNome: string; descricao: string; prioridade: MaintenancePriority; responsavel: string; dataAgendada: string }, userId: string) => ({
  asset_id: task.assetId,
  asset_name: task.assetNome,
  description: task.descricao,
  priority: task.prioridade,
  status: task.status || 'pendente',
  responsible: task.responsavel,
  responsible_email: task.responsavelEmail || null,
  scheduled_date: task.dataAgendada,
  completion_date: task.dataConclusao || null,
  notes: task.notas || null,
  observation: task.observacao || null,
  maintenance_location: task.localManutencao || null,
  equipment_situation: task.situacaoEquipamento || null,
  created_by: userId,
});

export function useMaintenanceTasks() {
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMaintenanceTasks = useCallback(async () => {
    if (!user) {
      setMaintenanceTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setMaintenanceTasks((data || []).map(mapDbToApp));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching maintenance tasks:', error);
      }
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tarefas de manutenção.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchMaintenanceTasks();
  }, [fetchMaintenanceTasks]);

  const addMaintenanceTask = async (
    task: Omit<MaintenanceTask, 'id' | 'dataCriacao' | 'dataAtualizacao'>
  ): Promise<MaintenanceTask | null> => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar autenticado para criar tarefas.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const dbTask = mapAppToDb(task as MaintenanceTask, user.id);
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .insert(dbTask)
        .select()
        .single();

      if (error) throw error;

      const newTask = mapDbToApp(data);
      setMaintenanceTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error adding maintenance task:', error);
      }
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a tarefa de manutenção.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateMaintenanceTask = async (
    id: string,
    updates: Partial<MaintenanceTask>
  ): Promise<boolean> => {
    try {
      const dbUpdates: Record<string, unknown> = {};

      if (updates.assetId !== undefined) dbUpdates.asset_id = updates.assetId;
      if (updates.assetNome !== undefined) dbUpdates.asset_name = updates.assetNome;
      if (updates.descricao !== undefined) dbUpdates.description = updates.descricao;
      if (updates.prioridade !== undefined) dbUpdates.priority = updates.prioridade;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.responsavel !== undefined) dbUpdates.responsible = updates.responsavel;
      if (updates.responsavelEmail !== undefined) dbUpdates.responsible_email = updates.responsavelEmail || null;
      if (updates.dataAgendada !== undefined) dbUpdates.scheduled_date = updates.dataAgendada;
      if (updates.dataConclusao !== undefined) dbUpdates.completion_date = updates.dataConclusao || null;
      if (updates.notas !== undefined) dbUpdates.notes = updates.notas || null;
      if (updates.observacao !== undefined) dbUpdates.observation = updates.observacao || null;
      if (updates.localManutencao !== undefined) dbUpdates.maintenance_location = updates.localManutencao || null;
      if (updates.situacaoEquipamento !== undefined) dbUpdates.equipment_situation = updates.situacaoEquipamento || null;

      const { error } = await supabase
        .from('maintenance_tasks')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setMaintenanceTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, ...updates, dataAtualizacao: new Date().toISOString() } : task
        )
      );
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error updating maintenance task:', error);
      }
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a tarefa.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteMaintenanceTask = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('maintenance_tasks').delete().eq('id', id);

      if (error) throw error;

      setMaintenanceTasks((prev) => prev.filter((task) => task.id !== id));
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error deleting maintenance task:', error);
      }
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a tarefa.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const moveMaintenanceTask = async (id: string, newStatus: MaintenanceStatus): Promise<boolean> => {
    const updates: Partial<MaintenanceTask> = { status: newStatus };
    if (newStatus === 'concluido') {
      updates.dataConclusao = new Date().toISOString().split('T')[0];
    }
    return updateMaintenanceTask(id, updates);
  };

  const getMaintenanceTaskById = (id: string): MaintenanceTask | undefined => {
    return maintenanceTasks.find((task) => task.id === id);
  };

  return {
    maintenanceTasks,
    loading,
    addMaintenanceTask,
    updateMaintenanceTask,
    deleteMaintenanceTask,
    moveMaintenanceTask,
    getMaintenanceTaskById,
    refetch: fetchMaintenanceTasks,
  };
}
