import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Edit,
  Copy,
  Building2,
  MapPin,
  User,
  Phone,
  Mail,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/PageHeader";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/tickets/TicketStatusBadge";
import { TicketTimeline } from "@/components/tickets/TicketTimeline";
import { AddInteractionDialog } from "@/components/tickets/AddInteractionDialog";
import { SLAIndicator } from "@/components/tickets/SLAIndicator";
import { useTickets } from "@/hooks/useTicketsContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  TicketStatus,
  ticketTypeLabels,
  ticketStatusLabels,
} from "@/types/tickets";

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTicketById, getSupplierById, changeTicketStatus, duplicateTicket } = useTickets();
  const { profile } = useAuth();

  const ticket = getTicketById(id || "");
  const supplier = ticket ? getSupplierById(ticket.fornecedorId) : null;

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-muted-foreground">Chamado não encontrado</p>
        <Button onClick={() => navigate("/tickets")}>Voltar para Chamados</Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: TicketStatus) => {
    await changeTicketStatus(ticket.id, newStatus, profile?.user_id || "", profile?.username || "Usuário");
  };

  const handleDuplicate = async () => {
    const duplicated = await duplicateTicket(ticket.id, profile?.user_id || "", profile?.username || "Usuário");
    if (duplicated) {
      navigate(`/tickets/${duplicated.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket.titulo}
        description={`Chamado ${ticket.id}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Chamados", href: "/tickets" },
          { label: ticket.id },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/tickets")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        }
      />

      {/* Header Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.prioridade} />
            <span className="text-sm text-muted-foreground">
              {supplier?.nome || 'Fornecedor desconhecido'}
            </span>
            {ticket.protocoloExterno && (
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                Protocolo: {ticket.protocoloExterno}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Alterar Status</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Object.entries(ticketStatusLabels).map(([value, label]) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => handleStatusChange(value as TicketStatus)}
                    disabled={ticket.status === value}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <AddInteractionDialog ticketId={ticket.id} />
            <Button variant="outline" onClick={() => navigate(`/tickets/${ticket.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Descrição do Problema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{ticket.descricao}</p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Linha do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <TicketTimeline interactions={ticket.interactions} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* SLA */}
          <Card>
            <CardHeader>
              <CardTitle>SLA</CardTitle>
            </CardHeader>
            <CardContent>
              <SLAIndicator slaDeadline={ticket.slaDeadline} status={ticket.status} showDetails />
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">{ticketTypeLabels[ticket.tipo]}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Unidade</p>
                  <p className="font-medium">{ticket.unidade}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Responsável</p>
                  <p className="font-medium">{ticket.responsavelNome}</p>
                </div>
              </div>
              {ticket.assetId && (
                <div className="flex items-start gap-3">
                  <LinkIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ativo Relacionado</p>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium"
                      onClick={() => navigate(`/assets/${ticket.assetId}`)}
                    >
                      {ticket.assetNome || ticket.assetId}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supplier Contact */}
          {ticket.contatoFornecedor && (
            <Card>
              <CardHeader>
                <CardTitle>Contato do Fornecedor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ticket.contatoFornecedor.nome && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{ticket.contatoFornecedor.nome}</span>
                  </div>
                )}
                {ticket.contatoFornecedor.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{ticket.contatoFornecedor.telefone}</span>
                  </div>
                )}
                {ticket.contatoFornecedor.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{ticket.contatoFornecedor.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Datas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criado em</span>
                <span>
                  {format(new Date(ticket.dataCriacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Atualizado em</span>
                <span>
                  {format(new Date(ticket.dataAtualizacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              {ticket.dataResolucao && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolvido em</span>
                  <span>
                    {format(new Date(ticket.dataResolucao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}