import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
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
import { PageHeader } from "@/components/shared/PageHeader";
import { HardwareSpecsForm } from "@/components/assets/HardwareSpecsForm";
import { useToast } from "@/hooks/use-toast";
import type { AssetStatus, AssetCategory } from "@/types";

const assetSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  categoria: z.enum(["notebook", "desktop", "servidor", "monitor", "impressora", "rede", "periferico", "outros"]),
  numeroSerie: z.string().min(1, "Número de série é obrigatório"),
  dataCompra: z.string().min(1, "Data de compra é obrigatória"),
  valor: z.coerce.number().min(0, "Valor deve ser positivo"),
  localizacao: z.string().min(1, "Localização é obrigatória"),
  responsavel: z.string().min(1, "Responsável é obrigatório"),
  status: z.enum(["ativo", "inativo", "manutencao", "arquivado"]),
  descricao: z.string().optional(),
  especificacoes: z.object({
    processador: z.string().optional(),
    memoriaRam: z.string().optional(),
    armazenamento: z.string().optional(),
    tipoArmazenamento: z.enum(["SSD", "HDD", "NVMe", "RAID"]).optional(),
    placaVideo: z.string().optional(),
    sistemaOperacional: z.string().optional(),
    portas: z.string().optional(),
    garantiaAte: z.string().optional(),
  }).optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

const DEFAULT_CATEGORY: AssetCategory = "notebook";
const DEFAULT_STATUS: AssetStatus = "ativo";

const AssetForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { assets, addAsset, updateAsset } = useData();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = Boolean(id);
  const existingAsset = isEditing ? assets.find((a) => a.id === id) : null;

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      nome: "",
      categoria: DEFAULT_CATEGORY,
      numeroSerie: "",
      dataCompra: new Date().toISOString().split("T")[0],
      valor: 0,
      localizacao: "",
      responsavel: "",
      status: DEFAULT_STATUS,
      descricao: "",
      especificacoes: {},
    },
  });

  useEffect(() => {
    if (existingAsset) {
      form.reset({
        nome: existingAsset.nome,
        categoria: existingAsset.categoria,
        numeroSerie: existingAsset.numeroSerie,
        dataCompra: existingAsset.dataCompra,
        valor: existingAsset.valor,
        localizacao: existingAsset.localizacao,
        responsavel: existingAsset.responsavel,
        status: existingAsset.status,
        descricao: existingAsset.descricao ?? "",
        especificacoes: existingAsset.especificacoes ?? {},
      });
    }
  }, [existingAsset, form]);

  const categoria = form.watch("categoria");

  // Clean specifications by removing empty values
  const cleanSpecifications = (specs: Record<string, any> | undefined) => {
    if (!specs) return undefined;
    const cleaned = Object.fromEntries(
      Object.entries(specs).filter(([_, value]) => value && value.trim && value.trim() !== '')
    );
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  };

  const onSubmit = async (data: AssetFormData) => {
    setIsLoading(true);
    try {
      const cleanedSpecs = cleanSpecifications(data.especificacoes);
      const assetData = {
        ...data,
        especificacoes: cleanedSpecs,
        descricao: data.descricao ?? undefined,
      };

      if (isEditing && existingAsset) {
        const success = await updateAsset(existingAsset.id, assetData);
        if (success) {
          toast({
            title: "Sucesso",
            description: "Ativo atualizado com sucesso.",
          });
          navigate("/assets");
        } else {
          toast({
            title: "Erro",
            description: "Falha ao atualizar o ativo.",
            variant: "destructive",
          });
        }
      } else {
        const result = await addAsset(assetData);
        if (result) {
          toast({
            title: "Sucesso",
            description: "Ativo cadastrado com sucesso.",
          });
          navigate("/assets");
        } else {
          toast({
            title: "Erro",
            description: "Falha ao cadastrar o ativo.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o ativo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions: { value: AssetStatus; label: string }[] = [
    { value: "ativo", label: "Ativo" },
    { value: "inativo", label: "Inativo" },
    { value: "manutencao", label: "Em Manutenção" },
    { value: "arquivado", label: "Arquivado" },
  ];

  const categoryOptions: { value: AssetCategory; label: string }[] = [
    { value: "notebook", label: "Notebook" },
    { value: "desktop", label: "Desktop" },
    { value: "servidor", label: "Servidor" },
    { value: "monitor", label: "Monitor" },
    { value: "impressora", label: "Impressora" },
    { value: "rede", label: "Equipamento de Rede" },
    { value: "periferico", label: "Periférico" },
    { value: "outros", label: "Outros" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assets")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={isEditing ? "Editar Ativo" : "Novo Ativo"}
          description={
            isEditing
              ? "Atualize as informações do ativo"
              : "Preencha os dados para cadastrar um novo ativo"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Ativo</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Ativo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Notebook Dell Latitude" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map((opt) => (
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
                  name="numeroSerie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Série</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: SN-2024-001" {...field} />
                      </FormControl>
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
                  name="dataCompra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Compra</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="localizacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Sala TI - 3º Andar" {...field} />
                      </FormControl>
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
                        <Input placeholder="Ex: João Silva" {...field} />
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
                        placeholder="Informações adicionais sobre o ativo..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Especificações de Hardware */}
              <HardwareSpecsForm form={form} categoria={categoria} />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/assets")}
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

export default AssetForm;