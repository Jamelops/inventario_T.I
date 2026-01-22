import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { PageHeader } from "@/components/shared/PageHeader";
import { RequiredFieldIndicator, RequiredFieldsHint } from "@/components/shared/RequiredFieldIndicator";
import { useTickets } from "@/contexts/TicketContext";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  TicketType,
  TicketPriority,
  ticketTypeLabels,
  ticketPriorityLabels,
  supplierCategoryLabels,
} from "@/types/tickets";
import { addHours } from "date-fns";

const ticketSchema = z.object({
  titulo: z.string().min(3, "Título deve ter no mínimo 3 caracteres").max(200, "Título deve ter no máximo 200 caracteres"),
  descricao: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres").max(2000, "Descrição deve ter no máximo 2000 caracteres"),
  fornecedorId: z.string().min(1, "Selecione um fornecedor"),
  tipo: z.string().min(1, "Selecione um tipo"),
  prioridade: z.string().min(1, "Selecione uma prioridade"),
  unidade: z.string().min(1, "Unidade é obrigatória").max(100, "Unidade deve ter no máximo 100 caracteres"),
  assetId: z.string().optional(),
  protocoloExterno: z.string().max(100, "Protocolo deve ter no máximo 100 caracteres").optional(),
  contatoNome: z.string().max(100, "Nome deve ter no máximo 100 caracteres").optional(),
  contatoTelefone: z.string().max(20, "Telefone deve ter no máximo 20 caracteres").optional(),
  contatoEmail: z.string().email("E-mail inválido").max(100, "E-mail deve ter no máximo 100 caracteres").optional().or(z.literal('')),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export default function TicketForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { suppliers, addTicket, updateTicket, getTicketById, getSupplierById } = useTickets();
  const { assets = [] } = useData();
  const { profile } = useAuth();

  const isEditing = !!id;
  const existingTicket = isEditing ? getTicketById(id) : undefined;
  const preselectedAssetId = searchParams.get("assetId");

  const activeSuppliers = suppliers.filter(s => s.ativo);

  // Group suppliers by category
  const suppliersByCategory = activeSuppliers.reduce((acc, supplier) => {
    if (!acc[supplier.categoria]) {
      acc[supplier.categoria] = [];
    }
    acc[supplier.categoria].push(supplier);
    return acc;
  }, {} as Record<string, typeof activeSuppliers>);

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      fornecedorId: "",
      tipo: "",
      prioridade: "media",
      unidade: "",
      assetId: preselectedAssetId || "",
      protocoloExterno: "",
      contatoNome: "",
      contatoTelefone: "",
      contatoEmail: "",
    },
  });

  useEffect(() => {
    if (existingTicket) {
      form.reset({
        titulo: existingTicket.titulo,
        descricao: existingTicket.descricao,
        fornecedorId: existingTicket.fornecedorId,
        tipo: existingTicket.tipo,
        prioridade: existingTicket.prioridade,
        unidade: existingTicket.unidade,
        assetId: existingTicket.assetId || "",
        protocoloExterno: existingTicket.protocoloExterno || "",
        contatoNome: existingTicket.contatoFornecedor?.nome || "",
        contatoTelefone: existingTicket.contatoFornecedor?.telefone || "",
        contatoEmail: existingTicket.contatoFornecedor?.email || "",
      });
    }
  }, [existingTicket, form]);

  const onSubmit = async (data: TicketFormData) => {
    const asset = assets.find((a) => a.id === data.assetId);
    const supplier = getSupplierById(data.fornecedorId);
    const now = new Date().toISOString();
    const nowDate = new Date();

    // Calculate SLA deadline based on supplier SLA hours
    const slaHoras = supplier?.slaHoras || 24; // Default 24h if not found
    const slaDeadline = addHours(nowDate, slaHoras).toISOString();

    const ticketData = {
      titulo: data.titulo.trim(),
      descricao: data.descricao.trim(),
      fornecedorId: data.fornecedorId,
      tipo: data.tipo as TicketType,
      prioridade: data.prioridade as TicketPriority,
      unidade: data.unidade.trim(),
      assetId: data.assetId || undefined,
      assetNome: asset?.nome,
      protocoloExterno: data.protocoloExterno?.trim() || undefined,
      contatoFornecedor:
        data.contatoNome || data.contatoTelefone || data.contatoEmail
          ? {
              nome: data.contatoNome?.trim(),
              telefone: data.contatoTelefone?.trim(),
              email: data.contatoEmail?.trim() || undefined,
            }
          : undefined,
      responsavelId: profile?.user_id || "",
      responsavelNome: profile?.username || "Usuário",
      status: "aberto" as const,
      dataCriacao: isEditing && existingTicket ? existingTicket.dataCriacao : now,
      slaDeadline: isEditing && existingTicket ? existingTicket.slaDeadline : slaDeadline,
    };

    if (isEditing && existingTicket) {
      const success = await updateTicket(id, ticketData);
      if (success) {
        navigate(`/tickets/${id}`);
      }
    } else {
      const newTicket = await addTicket(ticketData, supplier?.slaHoras);
      if (newTicket) {
        navigate(`/tickets/${newTicket.id}`);
      }
    }
  };

  const selectedSupplierId = form.watch("fornecedorId");
  const selectedSupplier = selectedSupplierId ? getSupplierById(selectedSupplierId) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? "Editar Chamado" : "Novo Chamado"}
        description={isEditing ? `Editando chamado ${id}` : "Registre um novo chamado de suporte"}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Chamados", href: "/tickets" },
          { label: isEditing ? "Editar" : "Novo" },
        ]}
        actions={
          <Button variant="ghost" onClick={() => navigate("/tickets")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Informações do Chamado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Dica sobre campos obrigatórios */}
                <RequiredFieldsHint />

                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Título
                        <RequiredFieldIndicator required={true} />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Link de internet fora na filial Centro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Descrição Detalhada
                        <RequiredFieldIndicator required={true} />
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o problema em detalhes..."
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fornecedorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Fornecedor
                          <RequiredFieldIndicator required={true} />
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o fornecedor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(suppliersByCategory).map(([categoria, categorySuppliers]) => (
                              <div key={categoria}>
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                  {supplierCategoryLabels[categoria as keyof typeof supplierCategoryLabels]}
                                </div>
                                {categorySuppliers.map((supplier) => (
                                  <SelectItem key={supplier.id} value={supplier.id}>
                                    {supplier.nome}
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedSupplier && (
                          <p className="text-xs text-muted-foreground">
                            SLA padrão: {selectedSupplier.slaHoras} horas
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tipo
                          <RequiredFieldIndicator required={true} />
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(ticketTypeLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
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
                            {Object.entries(ticketPriorityLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
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
                    name="unidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Unidade/Filial
                          <RequiredFieldIndicator required={true} />
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Filial Centro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="assetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ativo Relacionado</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "none" ? "" : value)} 
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um ativo (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {assets.map((asset) => (
                            <SelectItem key={asset.id} value={asset.id}>
                              {asset.nome} ({asset.id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Protocolo Externo</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="protocoloExterno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do Protocolo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contato do Fornecedor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contatoNome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do contato" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contatoTelefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contatoEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="contato@fornecedor.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/tickets")}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Atualizar Chamado" : "Criar Chamado"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
