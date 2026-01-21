import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MaintenanceTask,
  MaintenancePriority,
  MaintenanceStatus,
  priorityLabels,
  maintenanceStatusLabels,
} from '@/types';

interface MaintenanceCardDialogProps {
  task: MaintenanceTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Partial<MaintenanceTask>) => void;
  canEdit: boolean;
}

export function MaintenanceCardDialog({
  task,
  open,
  onOpenChange,
  onSave,
  canEdit,
}: MaintenanceCardDialogProps) {
  const [localManutencionLocal, setLocalManutencionLocal] = useState(task.localManutencao || '');
  const [situacaoEquipamento, setSituacaoEquipamento] = useState(task.situacaoEquipamento || '');
  const [observacao, setObservacao] = useState(task.observacao || '');
  const [prioridade, setPrioridade] = useState<MaintenancePriority>(task.prioridade);
  const [status, setStatus] = useState<MaintenanceStatus>(task.status);

  const handleSave = () => {
    onSave({
      localManutencao: localManutencionLocal,
      situacaoEquipamento,
      observacao,
      prioridade,
      status,
    });
    onOpenChange(false);
  };

  const diasEmManutencao = Math.floor(
    (new Date().getTime() - new Date(task.dataAgendada).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{task.assetNome}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Responsável:</span>
              <p className="font-medium">{task.responsavel}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Dias em manutenção:</span>
              <p className="font-medium text-amber-600">
                {diasEmManutencao > 0 ? diasEmManutencao : 0} dias
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Data Agendada:</span>
              <p className="font-medium">
                {new Date(task.dataAgendada).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Última Atualização:</span>
              <p className="font-medium">
                {new Date(task.dataAtualizacao).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div>
            <span className="text-sm text-muted-foreground">Descrição:</span>
            <p className="text-sm mt-1">{task.descricao}</p>
          </div>

          {canEdit ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={prioridade}
                    onValueChange={(v) => setPrioridade(v as MaintenancePriority)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as MaintenanceStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(maintenanceStatusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Local da Manutenção</Label>
                <Input
                  value={localManutencionLocal}
                  onChange={(e) => setLocalManutencionLocal(e.target.value)}
                  placeholder="Ex: Laboratório de TI, Terceirizado..."
                />
              </div>

              <div className="space-y-2">
                <Label>Situação do Equipamento</Label>
                <Input
                  value={situacaoEquipamento}
                  onChange={(e) => setSituacaoEquipamento(e.target.value)}
                  placeholder="Ex: Aguardando peça, Em teste..."
                />
              </div>

              <div className="space-y-2">
                <Label>Observação</Label>
                <Textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Adicione observações sobre a manutenção..."
                  rows={3}
                />
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {task.localManutencao && (
                <div>
                  <span className="text-sm text-muted-foreground">Local da Manutenção:</span>
                  <p className="text-sm font-medium">{task.localManutencao}</p>
                </div>
              )}
              {task.situacaoEquipamento && (
                <div>
                  <span className="text-sm text-muted-foreground">Situação do Equipamento:</span>
                  <p className="text-sm font-medium">{task.situacaoEquipamento}</p>
                </div>
              )}
              {task.observacao && (
                <div>
                  <span className="text-sm text-muted-foreground">Observação:</span>
                  <p className="text-sm">{task.observacao}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {canEdit ? 'Cancelar' : 'Fechar'}
          </Button>
          {canEdit && <Button onClick={handleSave}>Salvar</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
