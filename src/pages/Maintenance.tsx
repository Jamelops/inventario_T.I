import { useState } from 'react';
import { Plus, Calendar, User, MapPin, Clock, Info, Loader2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMaintenanceTasks } from '@/hooks/useMaintenanceTasks';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { PageHeader } from '@/components/shared/PageHeader';
import { PriorityBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MaintenanceStatus, maintenanceStatusLabels, MaintenanceTask, MaintenancePriority, priorityLabels } from '@/types';
import { MaintenanceCardDialog } from '@/components/maintenance/MaintenanceCardDialog';
import { cn } from '@/lib/utils';
import { exportToExcel, formatDate, ExportColumn } from '@/lib/export-to-excel';

const columns: MaintenanceStatus[] = ['pendente', 'em_andamento', 'concluido', 'arquivado'];

const columnColors: Record<MaintenanceStatus, string> = {
  pendente: 'border-t-sky-500',
  em_andamento: 'border-t-violet-500',
  concluido: 'border-t-emerald-500',
  arquivado: 'border-t-slate-400',
};

// 🔥 DEBUG MODE - Set to false to disable logs
const DEBUG = true;
const log = (msg: string, data?: any) => {
  if (DEBUG) {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    console.log(`[${timestamp}] 🏪 Maintenance: ${msg}`, data || '');
  }
};

export default function Maintenance() {
  const { maintenanceTasks = [], loading, moveMaintenanceTask, updateMaintenanceTask } = useMaintenanceTasks();
  const { canEdit } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const userCanEdit = canEdit();
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [droppedTaskId, setDroppedTaskId] = useState<string | null>(null);

  const getTasksByStatus = (status: MaintenanceStatus) => 
    (maintenanceTasks || []).filter(t => t.status === status);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent, taskId: string, taskDescription: string) => {
    log(`🚀 DragStart iniciado - Task: ${taskId}`);
    
    try {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('taskId', taskId);
      log(`✅ setData executado com sucesso - taskId: ${taskId}`);
      
      setDraggedTaskId(taskId);
      log(`🎯 draggedTaskId atualizado: ${taskId}`);
      
      // Visual feedback
      const element = e.currentTarget as HTMLElement;
      element.style.opacity = '0.5';
      log(`👁️ Card original com opacity = 0.5`);
      
    } catch (error) {
      log(`❌ Erro em DragStart:`, error);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    log(`⏹️ DragEnd acionado`);
    
    const element = e.currentTarget as HTMLElement;
    element.style.opacity = '1';
    log(`♻️ Card restaurado com opacity = 1`);
    
    // Delay clearance to allow animation
    setTimeout(() => {
      setDraggedTaskId(null);
      setDroppedTaskId(null);
      log(`🧹 draggedTaskId limpado`);
    }, 300);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: MaintenanceStatus) => {
    e.preventDefault();
    e.stopPropagation();
    
    log(`📬 Drop acionado - Status alvo: ${targetStatus}`);
    
    try {
      const taskId = e.dataTransfer.getData('taskId');
      log(`📋 Task ID recuperado: ${taskId}`);
      
      if (!taskId) {
        log(`⚠️ Task ID vazio ou undefined!`);
        return;
      }
      
      if (!userCanEdit) {
        log(`🚫 Usuário não tem permissão para editar`);
        toast.error('Você não tem permissão para editar tarefas');
        return;
      }
      
      const task = maintenanceTasks.find(t => t.id === taskId);
      if (!task) {
        log(`❌ Task não encontrada: ${taskId}`);
        return;
      }
      
      if (task.status === targetStatus) {
        log(`ℹ️ Task já estava no status ${targetStatus}`);
        return;
      }
      
      // Set dropped state for visual feedback
      setDroppedTaskId(taskId);
      
      log(`⚙️ Movendo task ${taskId} de "${task.status}" para "${targetStatus}"`);
      await moveMaintenanceTask(taskId, targetStatus);
      log(`✅ Task movida com sucesso!`);
      
    } catch (error) {
      log(`❌ Erro ao fazer drop:`, error);
      toast.error('Erro ao mover tarefa');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCardClick = (task: MaintenanceTask) => {
    log(`🖱️ Card clicado - Task: ${task.id}`);
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleSaveTask = async (updates: Partial<MaintenanceTask>) => {
    if (selectedTask) {
      log(`💾 Salvando atualizações da task: ${selectedTask.id}`, updates);
      await updateMaintenanceTask(selectedTask.id, updates);
      log(`✅ Task atualizada com sucesso!`);
    }
  };

  const handleExportToExcel = () => {
    log(`📊 Exportando para Excel`);
    const columns: ExportColumn[] = [
      { header: 'ID', key: 'id' },
      { header: 'Descrição', key: 'descricao' },
      { header: 'Ativo Relacionado', key: 'assetNome' },
      { header: 'Status', key: 'status', format: (v) => maintenanceStatusLabels[v as MaintenanceStatus] || v },
      { header: 'Prioridade', key: 'prioridade', format: (v) => priorityLabels[v as MaintenancePriority] || v },
      { header: 'Responsável', key: 'responsavel' },
      { header: 'Data Agendada', key: 'dataAgendada', format: (v) => formatDate(v) },
      { header: 'Data de Conclusão', key: 'dataConclusao', format: (v) => v ? formatDate(v) : '' },
    ];
    exportToExcel(maintenanceTasks || [], columns, { filename: 'manutencao', toast });
    log(`✅ Exportação iniciada`);
  };

  const getDaysInMaintenance = (dataAgendada: string) => {
    const days = Math.floor(
      (new Date().getTime() - new Date(dataAgendada).getTime()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 ? days : 0;
  };

  return (
    <div>
      <PageHeader
        title="Manutenção"
        description="Gerencie as tarefas de manutenção dos ativos"
        breadcrumbs={[{ label: 'Manutenção' }]}
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportToExcel}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar para Excel
            </Button>
            {userCanEdit && (
              <Button 
                size="sm"
                onClick={() => navigate('/maintenance/new')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Tarefa
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {columns.map(status => {
          const taskCount = getTasksByStatus(status).length;
          return (
            <div
              key={status}
              onDrop={(e) => handleDrop(e, status)}
              onDragOver={handleDragOver}
              className="flex flex-col"
            >
              <Card className={cn('border-t-4', columnColors[status])}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm font-medium">
                    {maintenanceStatusLabels[status]}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {taskCount}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 min-h-48">
                  {getTasksByStatus(status).map(task => {
                    const daysInMaintenance = getDaysInMaintenance(task.dataAgendada);
                    const showWarning = (status === 'pendente' || status === 'em_andamento') && daysInMaintenance > 3;
                    const isDragging = draggedTaskId === task.id;
                    const isDropped = droppedTaskId === task.id;
                    
                    return (
                      <div
                        key={task.id}
                        draggable={userCanEdit}
                        onDragStart={(e) => handleDragStart(e, task.id, task.descricao)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleCardClick(task)}
                        className={cn(
                          'rounded-lg border bg-card p-3 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer',
                          userCanEdit && 'cursor-grab active:cursor-grabbing',
                          showWarning && 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20',
                          isDragging && 'opacity-50 scale-95 shadow-lg',
                          isDropped && 'scale-105 shadow-lg border-green-400 bg-green-50/30 dark:bg-green-950/20'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-medium text-sm leading-tight">{task.assetNome}</p>
                          <PriorityBadge priority={task.prioridade} />
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {task.descricao}
                        </p>
                        
                        {/* Extended info */}
                        {task.localManutencao && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{task.localManutencao}</span>
                          </div>
                        )}
                        {task.situacaoEquipamento && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Info className="h-3 w-3" />
                            <span className="truncate">{task.situacaoEquipamento}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.responsavel.split(' ')[0]}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dataAgendada).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        
                        {showWarning && (
                          <div className="flex items-center gap-1 text-xs text-amber-600 mt-2">
                            <Clock className="h-3 w-3" />
                            <span>{daysInMaintenance} dias em manutenção</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <MaintenanceCardDialog
          task={selectedTask}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSaveTask}
          canEdit={userCanEdit}
        />
      )}
    </div>
  );
}