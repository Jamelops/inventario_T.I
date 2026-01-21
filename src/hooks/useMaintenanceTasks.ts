import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MaintenanceTask, MaintenanceStatus } from '@/types';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type DbTask = Tables<'maintenance_tasks'>;
type DbTaskInsert = TablesInsert<'maintenance_tasks'>;
type DbTaskUpdate = TablesUpdate<'maintenance_tasks'>;

const dbToTask = (dbTask: DbTask): MaintenanceTask => ({
  id: dbTask.id,
  assetId: dbTask.asset_id || '',
  assetNome: dbTask.asset_nome || '',
  descricao: dbTask.descricao,
  responsavel: dbTask.responsavel,
  responsavelEmail: dbTask.responsavel_email || undefined,
  prioridade: dbTask.prioridade as any,
  status: dbTask.status as any,
  dataAgendada: dbTask.data_agendada,
  dataConclusao: dbTask.data_conclusao || undefined,
  notas: dbTask.notas || undefined,
  localManutencao: dbTask.local_manutencao || undefined,
  situacaoEquipamento: dbTask.situacao_equipamento || undefined,
  observacao: dbTask.observacao || undefined,
  dataCriacao: dbTask.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
  dataAtualizacao: dbTask.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
});

const taskToDbInsert = (
  task: Omit<MaintenanceTask, 'id' | 'dataCriacao' | 'dataAtualizacao'>,
  userId: string
): DbTaskInsert => ({
  asset_id: task.assetId || null,
  asset_nome: task.assetNome || null,
  descricao: task.descricao,
  responsavel: task.responsavel,
  responsavel_email: task.responsavelEmail || null,
  prioridade: task.prioridade,
  status: task.status,
  data_agendada: task.dataAgendada,
  data_conclusao: task.dataConclusao || null,
  notas: task.notas || null,
  local_manutencao: task.localManutencao || null,
  situacao_equipamento: task.situacaoEquipamento || null,
  observacao: task.observacao || null,
  created_by: userId,
});

const taskToDbUpdate = (updates: Partial<MaintenanceTask>): DbTaskUpdate => {
  const dbUpdate: DbTaskUpdate = {};

  if (updates.assetId !== undefined) dbUpdate.asset_id = updates.assetId || null;
  if (updates.assetNome !== undefined) dbUpdate.asset_nome = updates.assetNome || null;
  if (updates.descricao !== undefined) dbUpdate.descricao = updates.descricao;
  if (updates.responsavel !== undefined) dbUpdate.responsavel = updates.responsavel;
  if (updates.responsavelEmail !== undefined)
    dbUpdate.responsavel_email = updates.responsavelEmail || null;
  if (updates.prioridade !== undefined) dbUpdate.prioridade = updates.prioridade;
  if (updates.status !== undefined) dbUpdate.status = updates.status;
  if (updates.dataAgendada !== undefined) dbUpdate.data_agendada = updates.dataAgendada;
  if (updates.dataConclusao !== undefined) dbUpdate.data_conclusao = updates.dataConclusao || null;
  if (updates.notas !== undefined) dbUpdate.notas = updates.notas || null;
  if (updates.localManutencao !== undefined)
    dbUpdate.local_manutencao = updates.localManutencao || null;
  if (updates.situacaoEquipamento !== undefined)
    dbUpdate.situacao_equipamento = updates.situacaoEquipamento || null;
  if (updates.observacao !== undefined) dbUpdate.observacao = updates.observacao || null;

  return dbUpdate;
};

export function useMaintenanceTasks() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isApproved } = useAuth();

  const fetchTasks = useCallback(async () => {
    if (!user || !isApproved) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data || []).map(dbToTask));
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error('Erro ao carregar tarefas de manutenção');
    } finally {
      setLoading(false);
    }
  }, [user, isApproved]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (
    task: Omit<MaintenanceTask, 'id' | 'dataCriacao' | 'dataAtualizacao'>
  ): Promise<MaintenanceTask | null> => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .insert(taskToDbInsert(task, user.id))
        .select()
        .single();

      if (error) throw error;

      const newTask = dbToTask(data);
      setTasks((prev) => [newTask, ...prev]);
      toast.success('Tarefa de manutenção criada com sucesso');
      return newTask;
    } catch (error: any) {
      console.error('Error adding task:', error);
      toast.error('Erro ao criar tarefa: ' + error.message);
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<MaintenanceTask>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('maintenance_tasks')
        .update(taskToDbUpdate(updates))
        .eq('id', id);

      if (error) throw error;

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? { ...task, ...updates, dataAtualizacao: new Date().toISOString().split('T')[0] }
            : task
        )
      );
      toast.success('Tarefa atualizada com sucesso');
      return true;
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error('Erro ao atualizar tarefa: ' + error.message);
      return false;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('maintenance_tasks').delete().eq('id', id);

      if (error) throw error;

      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast.success('Tarefa excluída com sucesso');
      return true;
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error('Erro ao excluir tarefa: ' + error.message);
      return false;
    }
  };

  const moveMaintenanceTask = async (
    id: string,
    newStatus: MaintenanceStatus
  ): Promise<boolean> => {
    return await updateTask(id, { status: newStatus });
  };

  const getTaskById = (id: string): MaintenanceTask | undefined => {
    return tasks.find((task) => task.id === id);
  };

  return {
    tasks,
    maintenanceTasks: tasks, // Alias para compatibilidade com Maintenance.tsx
    loading,
    addTask,
    updateTask,
    updateMaintenanceTask: updateTask, // Alias para compatibilidade com Maintenance.tsx
    deleteTask,
    moveMaintenanceTask, // Nova função para drag-and-drop
    getTaskById,
    refetch: fetchTasks,
  };
}
