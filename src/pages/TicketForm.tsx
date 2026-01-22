import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { Ticket, TicketStatus, ticketStatusLabels, ticketPriorityLabels } from "@/types/tickets";

const ticketSchema = z.object({
  titulo: z.string().min(3, "Título deve ter no mínimo 3 caracteres").max(200, "Título deve ter no máximo 200 caracteres"),
  descricao: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres").max(2000, "Descrição deve ter no máximo 2000 caracteres"),
  prioridade: z.string().min(1, "Selecione uma prioridade"),
  departamento: z.string().max(100, "Departamento deve ter no máximo 100 caracteres").optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export default function TicketForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addTicket, updateTicket, getTicketById } = useTickets();
  const { profile } = useAuth();

  const isEditing = !!id;
  const existingTicket = isEditing ? getTicketById(id) : undefined;

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      prioridade: "media",
      departamento: "",
    },
  });

  useEffect(() => {
    if (existingTicket) {
      form.reset({
        titulo: existingTicket.titulo,
        descricao: existingTicket.descricao,
        prioridade: existingTicket.prioridade,
        departamento: existingTicket.departamento || "",
      });
    }
  }, [existingTicket, form]);

  const onSubmit = async (data: TicketFormData) => {
    const now = new Date().toISOString();

    const ticketData: Omit<Ticket, 'id' | 'dataAtualizacao' | 'interactions'> = {
      titulo: data.titulo.trim(),
      descricao: data.descricao.trim(),
      prioridade: data.prioridade as any,
      status: "aberto" as TicketStatus,
      responsavel: profile?.username || "Usuário",
      responsavelEmail: profile?.email,
      departamento: data.departamento?.trim() || undefined,
      dataCriacao: isEditing && existingTicket ? existingTicket.dataCriacao : now,
    };

    if (isEditing && existingTicket) {
      const success = await updateTicket(id, ticketData);
      if (success) {
        navigate(`/tickets/${id}`);
      }
    } else {
      const newTicket = await addTicket(ticketData);
      if (newTicket) {
        navigate(`/tickets/${newTicket.id}`);
      }
    }
  };

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
          <Card>
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
                      <Input placeholder="Ex: Problema com link de internet" {...field} />
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
                  name="departamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: TI, Financeiro, etc..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

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