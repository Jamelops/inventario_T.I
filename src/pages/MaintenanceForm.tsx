import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { useMaintenanceTasks } from '@/hooks/useMaintenanceTasks';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  RequiredFieldIndicator,
  RequiredFieldsHint,
} from '@/components/shared/RequiredFieldIndicator';
import type { MaintenanceStatus, MaintenancePriority } from '@/types';

const maintenanceSchema = z.object({
  assetIds: z.array(z.string()).min(1, 'Selecione pelo menos um ativo'),
  descricao: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .max(1000, 'Descrição muito longa (máx 1000 caracteres)'),
  prioridade: z.enum(['baixa', 'media', 'alta']),
  status: z.enum(['pendente', 'em_andamento', 'concluido', 'arquivado']),
  responsavel: z
    .string()
    .min(1, 'Responsável é obrigatório')
    .max(100, 'Nome muito longo (máx 100 caracteres)'),
  responsavelEmail: z
    .string()
    .email('Email inválido')
    .max(255, 'Email muito longo (máx 255 caracteres)')
    .optional()
    .or(z.literal('')),
  dataAgendada: z.string().min(1, 'Data agendada é obrigatória'),
  notas: z.string().max(2000, 'Notas muito longas (máx 2000 caracteres)').optional(),
  localManutencao: z.string().max(255, 'Local muito longo (máx 255 caracteres)').optional(),
  situacaoEquipamento: z.string().max(500, 'Situação muito longa (máx 500 caracteres)').optional(),
  observacao: z.string().max(2000, 'Observação muito longa (máx 2000 caracteres)').optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

const MaintenanceForm = () => {
  // TODOS OS HOOKS AQUI NO TOPO - NUNCA MUDAR DE ORDEM
  const { id } = useParams();
  const navigate = useNavigate();
  const { assets = [] } = useData();
  // O hook retorna: tasks, loading, addTask, updateTask, deleteTask, getTaskById, refetch
  const {
    tasks = [],
    loading: tasksLoading,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
  } = useMaintenanceTasks();
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = Boolean(id);
  const existingTask = isEditing && getTaskById ? getTaskById(id!) : null;

  // useForm sempre chamado no topo, antes de qualquer if/return
  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      assetIds: [],
      descricao: '',
      prioridade: 'media' as MaintenancePriority,
      status: 'pendente' as MaintenanceStatus,
      responsavel: profile?.username || '',
      responsavelEmail: profile?.email || '',
      dataAgendada: new Date().toISOString().split('T')[0],
      notas: '',
      localManutencao: '',
      situacaoEquipamento: '',
      observacao: '',
    },
  });

  // useEffect para preencher dados de edição
  useEffect(() => {
    if (existingTask) {
      form.reset({
        assetIds: [existingTask.assetId],
        descricao: existingTask.descricao,
        prioridade: existingTask.prioridade,
        status: existingTask.status,
        responsavel: existingTask.responsavel,
        responsavelEmail: existingTask.responsavelEmail || '',
        dataAgendada: existingTask.dataAgendada,
        notas: existingTask.notas || '',
        localManutencao: existingTask.localManutencao || '',
        situacaoEquipamento: existingTask.situacaoEquipamento || '',
        observacao: existingTask.observacao || '',
      });
    } else if (profile) {
      // Auto-fill com info do usuário atual para nova manutenção
      form.setValue('responsavel', profile.username);
      form.setValue('responsavelEmail', profile.email);
    }
  }, [existingTask, profile, form]);

  // Agora sim, verificação de loading
  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const onSubmit = async (data: MaintenanceFormData) => {
    setIsLoading(true);
    try {
      if (isEditing && existingTask) {
        const asset = assets.find((a) => a.id === data.assetIds[0]);
        const success = await updateTask(existingTask.id, {
          assetId: data.assetIds[0],
          assetNome: asset?.nome || 'Ativo desconhecido',
          descricao: data.descricao,
          prioridade: data.prioridade,
          status: data.status,
          responsavel: data.responsavel,
          notas: data.notas || undefined,
          responsavelEmail: data.responsavelEmail || undefined,
          localManutencao: data.localManutencao || undefined,
          situacaoEquipamento: data.situacaoEquipamento || undefined,
          observacao: data.observacao || undefined,
        });
        if (success) {
          navigate('/maintenance');
        }
      } else {
        // Criar tarefa de manutenção para cada ativo selecionado
        let successCount = 0;
        for (const assetId of data.assetIds) {
          const asset = assets.find((a) => a.id === assetId);
          const result = await addTask({
            assetId: assetId,
            assetNome: asset?.nome || 'Ativo desconhecido',
            descricao: data.descricao,
            prioridade: data.prioridade,
            status: data.status,
            responsavel: data.responsavel,
            responsavelEmail: data.responsavelEmail || undefined,
            dataAgendada: data.dataAgendada,
            notas: data.notas || undefined,
            localManutencao: data.localManutencao || undefined,
            situacaoEquipamento: data.situacaoEquipamento || undefined,
            observacao: data.observacao || undefined,
          });
          if (result) successCount++;
        }
        if (successCount > 0) {
          navigate('/maintenance');
        }
      }
    } catch (error) {
      console.error('Error saving maintenance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const priorityOptions: { value: MaintenancePriority; label: string }[] = [
    { value: 'baixa', label: 'Baixa' },
    { value: 'media', label: 'Média' },
    { value: 'alta', label: 'Alta' },
  ];

  const statusOptions: { value: MaintenanceStatus; label: string }[] = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'arquivado', label: 'Arquivado' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/maintenance')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={isEditing ? 'Editar Manutenção' : 'Nova Manutenção'}
          description={
            isEditing
              ? 'Atualize as informações da manutenção'
              : 'Preencha os dados para agendar uma nova manutenção'
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Manutenção</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Dica sobre campos obrigatórios */}
              <RequiredFieldsHint />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="assetIds"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        {isEditing ? 'Ativo' : 'Ativos (selecione um ou mais)'}
                        <RequiredFieldIndicator required={true} />
                      </FormLabel>
                      {isEditing ? (
                        <Select
                          onValueChange={(value) => field.onChange([value])}
                          value={field.value[0] || ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um ativo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(assets || []).map((asset) => (
                              <SelectItem key={asset.id} value={asset.id}>
                                {asset.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-3 border rounded-md max-h-48 overflow-y-auto">
                          {(assets || []).map((asset) => {
                            const isSelected = field.value.includes(asset.id);
                            return (
                              <label
                                key={asset.id}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-primary/10 border border-primary'
                                    : 'hover:bg-muted border border-transparent'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      field.onChange([...field.value, asset.id]);
                                    } else {
                                      field.onChange(
                                        field.value.filter((id: string) => id !== asset.id)
                                      );
                                    }
                                  }}
                                  className="rounded"
                                />
                                <span className="text-sm truncate">{asset.nome}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                      {!isEditing && field.value.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {field.value.length} ativo(s) selecionado(s)
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responsavel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Responsável
                        <RequiredFieldIndicator required={true} />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-muted" />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        O responsável é preenchido automaticamente com seu usuário.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responsavelEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email do Responsável
                        <RequiredFieldIndicator required={true} />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-muted" type="email" />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        O email é preenchido automaticamente com seu email de usuário.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prioridade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Prioridade
                        <RequiredFieldIndicator required={true} />
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Status
                        <RequiredFieldIndicator required={true} />
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataAgendada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Data Agendada
                        <RequiredFieldIndicator required={true} />
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Descrição
                      <RequiredFieldIndicator required={true} />
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o problema e a manutenção a ser realizada..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="localManutencao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local da Manutenção</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Sala 101 - Térreo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="situacaoEquipamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Situação do Equipamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Teclado com teclas presas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="notas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notas adicionais sobre a manutenção..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observação</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Observações finais..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/maintenance')}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar Manutenção'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceForm;
