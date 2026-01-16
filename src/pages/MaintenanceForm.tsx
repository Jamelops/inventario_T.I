import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { useMaintenanceTasks } from "@/hooks/useMaintenanceTasks";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
import type { MaintenanceStatus, MaintenancePriority } from "@/types";

const maintenanceSchema = z.object({
  assetIds: z.array(z.string()).min(1, "Selecione pelo menos um ativo"),
  descricao: z.string().min(1, "Descrição é obrigatória").max(1000, "Descrição muito longa (máx 1000 caracteres)"),
  prioridade: z.enum(["baixa", "media", "alta"]),
  status: z.enum(["pendente", "em_andamento", "concluido", "arquivado"]),
  responsavel: z.string().min(1, "Responsável é obrigatório").max(100, "Nome muito longo (máx 100 caracteres)"),
  responsavelEmail: z.string().email("Email inválido").max(255, "Email muito longo (máx 255 caracteres)").optional().or(z.literal("")),
  dataAgendada: z.string().min(1, "Data agendada é obrigatória"),
  notas: z.string().max(2000, "Notas muito longas (máx 2000 caracteres)").optional(),
  localManutencao: z.string().max(255, "Local muito longo (máx 255 caracteres)").optional(),
  situacaoEquipamento: z.string().max(500, "Situação muito longa (máx 500 caracteres)").optional(),
  observacao: z.string().max(2000, "Observação muito longa (máx 2000 caracteres)").optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

const MaintenanceForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { assets } = useData();
  const { maintenanceTasks, loading: tasksLoading, addMaintenanceTask, updateMaintenanceTask, getMaintenanceTaskById } = useMaintenanceTasks();
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = Boolean(id);
  const existingTask = isEditing ? getMaintenanceTaskById(id!) : null;
  const preselectedAssetId = searchParams.get("assetId");

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      assetIds: preselectedAssetId ? [preselectedAssetId] : [],
      descricao: "",
      prioridade: "media" as MaintenancePriority,
      status: "pendente" as MaintenanceStatus,
      responsavel: profile?.username || "",
      responsavelEmail: profile?.email || "",
      dataAgendada: new Date().toISOString().split("T")[0],
      notas: "",
      localManutencao: "",
      situacaoEquipamento: "",
      observacao: "",
    },
  });

  useEffect(() => {
    if (existingTask) {
      form.reset({
        assetIds: [existingTask.assetId],
        descricao: existingTask.descricao,
        prioridade: existingTask.prioridade,
        status: existingTask.status,
        responsavel: existingTask.responsavel,
        responsavelEmail: existingTask.responsavelEmail || "",
        dataAgendada: existingTask.dataAgendada,
        notas: existingTask.notas || "",
        localManutencao: existingTask.localManutencao || "",
        situacaoEquipamento: existingTask.situacaoEquipamento || "",
        observacao: existingTask.observacao || "",
      });
    } else if (profile) {
      // Auto-fill with current user info for new maintenance
      form.setValue("responsavel", profile.username);
      form.setValue("responsavelEmail", profile.email);
    }
  }, [existingTask, profile, form]);

  const onSubmit = async (data: MaintenanceFormData) => {
    setIsLoading(true);
    try {
      if (isEditing && existingTask) {
        const asset = assets.find((a) => a.id === data.assetIds[0]);
        const success = await updateMaintenanceTask(existingTask.id, {
          assetId: data.assetIds[0],
          assetNome: asset?.nome || "Ativo desconhecido",
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
          navigate("/maintenance");
        }
      } else {
        // Create a maintenance task for each selected asset
        let successCount = 0;
        for (const assetId of data.assetIds) {
          const asset = assets.find((a) => a.id === assetId);
          const result = await addMaintenanceTask({
            assetId: assetId,
            assetNome: asset?.nome || "Ativo desconhecido",
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
          navigate("/maintenance");
        }
      }
    } catch (error) {
      console.error("Error saving maintenance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const priorityOptions: { value: MaintenancePriority; label: string }[] = [
    { value: "baixa", label: "Baixa" },
    { value: "media", label: "Média" },
    { value: "alta", label: "Alta" },
  ];

  const statusOptions: { value: MaintenanceStatus; label: string }[] = [
    { value: "pendente", label: "Pendente" },
    { value: "em_andamento", label: "Em Andamento" },
    { value: "concluido", label: "Concluído" },
    { value: "arquivado", label: "Arquivado" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/maintenance")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={isEditing ? "Editar Manutenção" : "Nova Manutenção"}
          description={
            isEditing
              ? "Atualize as informações da manutenção"
              : "Preencha os dados para agendar uma nova manutenção"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="assetIds"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>
                        {isEditing ? "Ativo" : "Ativos (selecione um ou mais)"}
                      </FormLabel>
                      {isEditing ? (
                        <Select 
                          onValueChange={(value) => field.onChange([value])} 
                          value={field.value[0] || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um ativo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {assets.map((asset) => (
                              <SelectItem key={asset.id} value={asset.id}>
                                {asset.nome} ({asset.numeroSerie})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-3 border rounded-md max-h-48 overflow-y-auto">
                          {assets.map((asset) => {
                            const isSelected = field.value.includes(asset.id);
                            return (
                              <label
                                key={asset.id}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                  isSelected 
                                    ? "bg-primary/10 border border-primary" 
                                    : "hover:bg-muted border border-transparent"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      field.onChange([...field.value, asset.id]);
                                    } else {
                                      field.onChange(field.value.filter((id: string) => id !== asset.id));
                                    }
                                  }}
                                  className="rounded"
                                />
                                <span className="text-sm truncate">
                                  {asset.nome} <span className="text-muted-foreground">({asset.numeroSerie})</span>
                                </span>
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
                      <FormLabel>Responsável</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled 
                          className="bg-muted"
                        />
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
                      <FormLabel>Email do Responsável</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          {...field} 
                          disabled 
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prioridade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
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
                      <FormLabel>Status</FormLabel>
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
                      <FormLabel>Data Agendada</FormLabel>
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
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o serviço a ser realizado..."
                        className="min-h-[80px]"
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
                        <Input placeholder="Ex: Laboratório TI, Terceirizado..." {...field} />
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
                        <Input placeholder="Ex: Aguardando peça, Em teste..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="observacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observação</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione observações sobre a manutenção..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas Adicionais</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações extras..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/maintenance")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Salvar"}
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
